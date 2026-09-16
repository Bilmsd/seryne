// Parcours Adam indépendant : ni appel ni modification du moteur Fièvre de Léo.
window.AdamFlow = (() => {
  let state=null, ui=null, current=null, index=0, timer=null, generation=0, busy=false, summaryRoot=null, picker=null, photoURL=null, draft=null, draftVersion=0, utterances=[];
  const $=selector=>document.querySelector(selector);
  const el=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
  const button=(text,callback,secondary=false)=>ui.action(text,callback,secondary);
  function focus(node){requestAnimationFrame(()=>{if(!state||!node.isConnected||node.closest('[hidden]'))return;node.tabIndex=-1;node.focus({preventScroll:true});const scroll=$('#message-scroll');scroll.scrollTo({top:scroll.scrollTop+node.getBoundingClientRect().top-scroll.getBoundingClientRect().top-16,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});}
  function lock(){current?.querySelectorAll('button,textarea').forEach(node=>node.disabled=true);current?.classList.add('adam-answered');}
  function actions(parent,buttons){const group=el('div','message-actions');group.append(...buttons);parent.append(group);}
  function card(text,helper){lock();current=ui.message('seryne',text,{helper});current.classList.add('adam-card');return current;}
  function record(key,value){Episode.put(state.episode,`adam.${key}`,value,{kind:'adam-answer',explicitCorrection:true});}
  function promptPhoto(){
    const parent=card('Vous pouvez ajouter la photo pour que nous fassions le point ensemble.');
    actions(parent,[button('Ajouter une photo',photo)]);focus(parent);
  }
  function clearDraft(){
    draftVersion++;
    if(draft)URL.revokeObjectURL(draft.src);
    draft=null;$('#adam-photo-draft')?.remove();ui?.resizeInput();
  }
  function refreshDraftHint(){
    const note=$('[data-adam-draft-hint]');
    if(!note)return;
    const text=$('#message-input').value.trim()?'Photo jointe au message.':'Ajoutez quelques mots pour m’expliquer ce qui vous inquiète.';
    if(note.textContent!==text)note.textContent=text;
  }
  function photo(adapter){
    if(adapter?.message)ui=adapter;
    if(busy||state?.photo)return;
    picker?.remove();
    const input=el('input');input.type='file';input.accept='image/*';input.hidden=true;input.id='adam-photo-input';
    input.setAttribute('aria-label','Choisir une image pour Adam');
    const token=generation;
    const cleanup=()=>{input.remove();if(picker===input)picker=null;};
    input.addEventListener('cancel',cleanup,{once:true});
    input.addEventListener('change',()=>{
      const file=input.files?.[0];cleanup();
      if(!file||token!==generation)return;
      prepareDraft(file);
    },{once:true});
    picker=input;document.body.append(input);input.click();
  }
  function prepareDraft(file){
    clearDraft();
    const version=draftVersion;
    const row=el('div','adam-photo-draft');row.id='adam-photo-draft';
    const image=el('img');image.alt='Photo jointe au brouillon';
    const note=el('p');note.dataset.adamDraftHint='';note.setAttribute('role','status');
    const remove=button('Retirer la photo',clearDraft,true);
    row.append(image,note,remove);$('.composer-area').prepend(row);refreshDraftHint();
    draft={file,src:URL.createObjectURL(file),image,ready:false};
    image.onload=()=>{if(version!==draftVersion||!draft)return;draft.ready=true;ui.resizeInput();};
    image.onerror=()=>{
      if(version!==draftVersion||!draft)return;
      clearDraft();
      const error=el('div','adam-photo-draft');error.id='adam-photo-draft';error.setAttribute('role','status');
      error.append(el('p','','Cette image n’a pas pu être affichée. Choisissez une autre image.'),button('Retirer',clearDraft,true));$('.composer-area').prepend(error);
    };
    image.src=draft.src;ui.resizeInput();
  }
  function releasePhoto(){if(photoURL){URL.revokeObjectURL(photoURL);photoURL=null;}}
  function attachPhoto(attachment,parent){
    lock();busy=true;
    const token=generation;
    photoURL=attachment.src;
    const figure=el('figure','adam-photo');
    const image=attachment.image;image.alt='Image choisie par Adam';
    figure.append(image,el('figcaption','','Vous · photo ajoutée'));
    parent.classList.add('adam-multimodal');parent.append(figure);
    state.photo={src:photoURL,name:attachment.file.name,type:attachment.file.type,placeholder:false};record('photo',state.photo);
    requestAnimationFrame(()=>{if(token===generation&&state)simulatePhotoReview(figure,token);});
  }
  // Point de remplacement futur de la simulation ; indépendant du choix et de l’affichage du fichier.
  function simulatePhotoReview(figure,token){
    const status=el('p','adam-photo-status','Seryne examine la photo…');status.setAttribute('role','status');$('#messages').append(status);focus(figure);
    timer=setTimeout(()=>{
      if(token!==generation||!state)return;
      timer=null;busy=false;status.remove();
        ui.message('seryne','Je regarde la photo avec vous.');
        const observation=ui.message('seryne','Je vois une plaque rouge arrondie, assez bien délimitée, avec un centre plus clair et un bord qui paraît légèrement squameux.\n\nPlusieurs causes peuvent donner cet aspect. La photo et les informations que vous m’avez données ne permettent pas, à elles seules, de déterminer avec certitude de quoi il s’agit.\n\n'+[AdamData.contextSentence(state),'Je vais vous poser quelques questions ciblées.'].filter(Boolean).join(' '));
        observation.classList.add('adam-observation');
        index=0;ask();focus(observation);
    },1000);
  }
  function ask(force=false){
    const q=AdamData.questions[index];
    const known=state.episode.facts[`adam.${q.id}`];
    if(!force&&known?.status==='known'){
      const value=q.options.indexOf(known.value);
      if(value>=0){ui.message('seryne',`Vous avez déjà indiqué : « ${known.value} ».`,{helper:'Cette information est conservée dans votre épisode.'});answer(q,value,true);return;}
    }
    const parent=card(q.title,q.helper);parent.dataset.adamQuestion=q.id;
    const choices=el('div','adam-choices');
    q.options.forEach((label,i)=>{
      const choice=button(label,()=>answer(q,i),true);choice.dataset.adamAnswer=String(i);choices.append(choice);
    });
    parent.append(choices);focus(parent);
  }
  function answer(q,value,fromMemory=false){
    if(busy)return;
    lock();state.answers[q.id]=value;
    if(!fromMemory){record(q.id,q.options[value]);ui.message('user',q.options[value]);}
    if(value!==q.nominal){
      const parent=card('Cette réponse mérite d’être précisée.', 'La suite adaptée à cette réponse n’est pas encore disponible.');
      if(q.options[value]==='Autre chose…')textForm(parent,'Décrivez simplement ce que vous avez remarqué.',text=>{record(`${q.id}.details`,text);ui.message('user',text);hold();});
      actions(parent,[button('Revoir ma réponse',()=>{delete state.answers[q.id];ask(true);},true),button('Revenir à l’accueil',ui.goHome,true)]);focus(parent);return;
    }
    if(++index===AdamData.questions.length){renderSummary();return;}
    ask();
  }
  function hold(){const parent=card('Votre précision est notée.');actions(parent,[button('Revoir ma réponse',()=>ask(true),true),button('Revenir à l’accueil',ui.goHome,true)]);focus(parent);}
  function textForm(parent,label,callback){
    const form=el('form','inline-form');const field=el('textarea');field.id=`adam-details-${generation}-${index}`;field.required=true;field.maxLength=1000;
    const caption=el('label','',label);caption.htmlFor=field.id;const submit=el('button','message-action','Enregistrer');submit.type='submit';
    form.append(caption,field,submit);form.addEventListener('submit',event=>{event.preventDefault();if(field.disabled||!field.value.trim())return;field.disabled=true;submit.disabled=true;lock();callback(field.value.trim());});parent.append(form);
  }
  function renderSummary(){
    if(!AdamData.questions.every(q=>state.answers[q.id]===q.nominal)||!state.photo)return;
    lock();$('#messages').hidden=true;$('.conversation-date').hidden=true;
    summaryRoot=el('section','adam-summary');summaryRoot.id='adam-summary';$('#message-scroll').append(summaryRoot);
    const lead=el('section','summary-lead');lead.append(el('p','eyebrow','Le point sur votre peau · maintenant'),el('h1','','Plusieurs éléments sont rassurants actuellement.'));
    lead.append(el('p','','Vous vous sentez normalement, la plaque démange légèrement et vous ne décrivez pas d’autre symptôme préoccupant.'),el('p','','L’aspect visible sur la photo et ce que vous décrivez peuvent notamment être compatibles avec une mycose superficielle de la peau.'),el('p','','Une mycose superficielle est généralement une affection fréquente et sans gravité. Une photo et cet échange ne permettent toutefois pas d’en confirmer la cause avec certitude.'));
    summaryRoot.append(lead);
    const orientation=el('section','summary-section');orientation.append(el('h2','','Ce qui semble raisonnable pour le moment'));
    const advice=el('article','advice-card');advice.append(el('p','','Les éléments recueillis ne font pas apparaître de motif évident de recours aux urgences dans la situation que vous décrivez actuellement.'),el('p','','Vous pouvez demander conseil à votre pharmacien et lui montrer la lésion. Si nécessaire, un professionnel de santé pourra l’examiner directement et préciser sa cause.'));orientation.append(advice);summaryRoot.append(orientation);
    const watch=el('section','summary-section');watch.append(el('h2','','Ce que vous allez surtout surveiller'));
    const list=el('ul','adam-watch');AdamData.watch.forEach(text=>list.append(el('li','',text)));watch.append(list,button('Quand faut-il demander un avis médical ?',medicalHelp,true));summaryRoot.append(watch);
    const followup=el('section','followup-card');followup.id='adam-followup';summaryRoot.append(followup);followupOptions();
    summaryRoot.append(button('Revoir notre échange',()=>{summaryRoot.hidden=true;$('#messages').hidden=false;$('.conversation-date').hidden=false;const back=button('Revenir au point sur ma peau',()=>{back.remove();$('#messages').hidden=true;$('.conversation-date').hidden=true;summaryRoot.hidden=false;focus(summaryRoot);});back.id='adam-return-summary';$('#message-scroll').append(back);focus(back);},true));focus(lead);
  }
  function medicalHelp(){
    const scroll=$('#message-scroll'),position=scroll.scrollTop;
    const dialog=el('dialog','adam-medical-dialog');dialog.id='adam-medical-help';dialog.setAttribute('aria-labelledby','adam-medical-title');
    const finish=()=>{if(!dialog.isConnected)return;if(dialog.open)dialog.close();dialog.remove();scroll.scrollTop=position;};
    const close=button('×',finish);close.className='close-button';close.setAttribute('aria-label','Fermer');
    const title=el('h2','','Quand faut-il demander un avis médical ?');title.id='adam-medical-title';
    dialog.append(close,title,el('p','adam-modal-intro','La situation décrite paraît plutôt rassurante actuellement. Mais demandez un avis médical si la plaque évolue de façon inhabituelle ou si de nouveaux symptômes apparaissent.'));
    AdamData.medicalAdvice.forEach(([title,text])=>{const item=el('article','advice-card');item.append(el('h3','',title),el('p','',text));dialog.append(item);});
    dialog.append(el('p','adam-modal-intro','Si la plaque persiste ou ne s’améliore pas, faites-la examiner par un professionnel de santé.\n\nUne consultation permettra d’examiner directement la lésion et, si nécessaire, de préciser sa cause.'));
    dialog.append(button('Revenir au point sur ma peau',finish));dialog.addEventListener('close',finish,{once:true});
    dialog.addEventListener('click',event=>{const r=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))finish();});
    document.body.append(dialog);dialog.showModal();close.focus({preventScroll:true});dialog.scrollTop=0;
  }
  function followupOptions(){
    const parent=$('#adam-followup');parent.replaceChildren(el('p','eyebrow','Garder le fil'),el('h2','','On refait le point dans 48 h ?'),el('p','','L’évolution de la plaque peut apporter des informations utiles. Seryne peut vous proposer de refaire le point dans 48 heures.'));
    actions(parent,[button('Oui, dans 48 h',()=>schedule(48)),button('Choisir un autre moment',()=>{
      showSheet('Choisir un autre moment','Choisissez un délai pour la démonstration. Aucune notification réelle ne sera envoyée.');
      [24,72].forEach(hours=>$('#sheet-content').append(button(`Dans ${hours} h`,()=>{$('#sheet').close();schedule(hours);},true)));
    },true),button('Pas maintenant',()=>{state.followup={status:'declined'};record('followup.plan','declined');parent.replaceChildren(el('h2','','Pas maintenant'),el('p','','Vous pourrez choisir un moment pour refaire le point.'));parent.append(button('Choisir un moment',followupOptions,true));},true)]);
  }
  function schedule(hours){state.followup={hours,status:'planned'};record('followup.plan',hours);const parent=$('#adam-followup');parent.replaceChildren(el('h2','','Très bien. Nous referons le point sur votre peau.'),el('p','data-caption','Simulation uniquement · sans notification réelle ni nouvelle photo'));parent.append(button(`Simuler le point dans ${hours} h`,reevaluate));}
  function reevaluate(){
    const parent=$('#adam-followup');parent.replaceChildren(el('p','eyebrow','Réévaluation déclarative'),el('h2','','Comment la plaque a-t-elle évolué depuis notre dernier échange ?'));
    actions(parent,AdamData.followup.map(label=>button(label,()=>{
      state.followup.response=label;record('followup.evolution',label);
      parent.replaceChildren(el('h2','',label),el('p','','Votre réponse enrichit cet épisode. La suite de cette réévaluation sera développée ultérieurement.'));
      if(label==='Autre chose…')textForm(parent,'Qu’est-ce qui a changé ?',text=>{record('followup.details',text);parent.append(el('p','',text));});
      parent.append(button('Revoir les réponses',reevaluate,true));
    },true)));focus(parent);
  }
  function submit(text,adapter){
    ui=adapter;
    if(busy||state?.photo||!text.trim()||(draft&&!draft.ready))return false;
    utterances.push(text);state=AdamData.create(utterances.join('\n'));
    $('#conversation').classList.add('adam-conversation');
    const message=ui.message('user',text);
    if(draft){
      const attachment=draft;draft=null;draftVersion++;$('#adam-photo-draft')?.remove();
      $('.composer-area').hidden=true;$('#message-input').blur();
      attachPhoto(attachment,message);
    }else{
      busy=true;$('#typing').hidden=false;
      const token=generation;
      timer=setTimeout(()=>{if(token!==generation||!state)return;timer=null;busy=false;$('#typing').hidden=true;promptPhoto();ui.resizeInput();},800);
    }
    return true;
  }
  function stop(){clearDraft();utterances=[];picker?.remove();picker=null;releasePhoto();clearTimeout(timer);timer=null;generation++;busy=false;state=null;current=null;index=0;summaryRoot?.remove();summaryRoot=null;$('#adam-return-summary')?.remove();$('#adam-medical-help')?.remove();$('#conversation').classList.remove('adam-conversation');}
  $('#message-input').addEventListener('input',refreshDraftHint);
  return {submit,stop,photo,get canSend(){return !busy&&(!draft||draft.ready);},get active(){return !!state;}};
})();
