// Scénario de démonstration isolé. Texte fourni, pas d’analyse médicale réelle.
window.AdamData = (() => {
  const questions = [
    {id:'sensation',title:'Est-ce que cette plaque vous démange ou vous fait mal ?',options:['Ça démange un peu','Ça démange beaucoup','Ça fait mal','Ni l’un ni l’autre'],nominal:0},
    {id:'general',title:'À part cette plaque, comment vous sentez-vous ?',options:['Je me sens normalement','J’ai de la fièvre','Je me sens malade / très fatigué','Autre chose…'],nominal:0},
    {id:'context',title:'Ces dernières semaines, y a-t-il eu quelque chose qui pourrait être lié à cette plaque ?',helper:'Par exemple : piqûre d’insecte ou de tique, voyage récent, randonnée, contact avec un animal…',options:['Non, rien de particulier','J’ai peut-être été piqué','J’ai voyagé récemment','J’ai été en contact avec un animal','Autre chose…'],nominal:0},
  ];
  const medicalAdvice = [
    ['La plaque s’étend nettement ou d’autres apparaissent','Elle continue à s’agrandir, change franchement d’aspect ou de nouvelles lésions apparaissent.'],
    ['Elle devient douloureuse ou très inflammatoire','La douleur augmente nettement, la zone devient très rouge, chaude ou gonflée.'],
    ['Elle devient une plaie ou se met à suinter','Un liquide apparaît, notamment s’il devient jaunâtre ou blanchâtre, ou si la peau se dégrade.'],
    ['Votre état général change','Vous développez de la fièvre, vous vous sentez malade ou un autre symptôme inhabituel apparaît.'],
  ];
  const watch = ['Extension nette de la plaque','Apparition d’autres lésions','Douleur ou inflammation importante','Apparition d’un suintement ou d’un écoulement','Fièvre ou modification de l’état général','Persistance ou absence d’amélioration'];
  const followup = ['Elle diminue','Elle n’a pas vraiment changé','Elle s’est étendue','Elle est devenue plus douloureuse','Elle suinte ou du liquide en sort','D’autres plaques sont apparues','Autre chose…'];
  // Formulations explicites uniquement : une information omise reste inconnue.
  const initialAnswers = {
    sensation:[/^(?:ca|cela|la plaque) (?:me )?demange (?:un peu|legerement)$/, /^(?:ca|cela|la plaque) (?:me )?demange beaucoup$/, /^(?:ca|cela|la plaque) (?:me )?fait mal$/],
    general:[/^je me sens (?:normalement|bien)$/, /^j'ai (?:de la )?fievre$/, /^je me sens (?:malade|tres fatigue)$/],
    context:[/^(?:non )?rien de particulier$/, /^j'ai peut-etre ete pique$/, /^j'ai voyage recemment$/, /^j'ai ete en contact avec un animal$/],
  };
  function create(text) {
    const episode = Episode.create();
    const normalized=text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/’/g,"'");
    const source={kind:'adam-initial-message',text};
    const rules=[
      ['onset',/depuis quelques jours|il y a quelques jours/,'quelques jours'],
      ['expanding',/s'agrandit|s'etend|grandit/,true],
      ['worried',/flipp|inquie|peur/,true],
      ['wantsPhoto',/regarder|montrer|photo/,true],
    ];
    const clauses=normalized.split(/[,.!?;]|\bmais\b/);
    rules.forEach(([key,pattern,value])=>{
      const clause=clauses.find(part=>pattern.test(part));
      if(!clause)return;
      const uncertain=/ne sais pas|peut.etre|pas sur/.test(clause);
      const negated=/ne .*(?:pas|plus)|pas de|sans/.test(clause);
      Episode.put(episode,`skin.${key}`,negated?false:value,source,uncertain?'ambiguous':'known');
    });
    const answerClauses=normalized.split(/[,.!?;]|\bmais\b|\bet\b/).map(part=>part.trim());
    questions.forEach(question=>initialAnswers[question.id].forEach((pattern,index)=>{
      if(answerClauses.some(clause=>pattern.test(clause)))Episode.put(episode,`adam.${question.id}`,question.options[index],source);
    }));
    return {profile:'adam',initialMessage:text,episode,answers:{},photo:null,followup:null};
  }
  function contextSentence(state) {
    const facts=state.episode.facts;
    const onset=facts['skin.onset']?.status==='known' && !!facts['skin.onset'].value;
    const growth=facts['skin.expanding']?.status==='known' && facts['skin.expanding'].value===true;
    if(onset && growth)return 'Vous m’avez indiqué qu’elle est apparue il y a quelques jours et qu’elle s’agrandit.';
    if(onset)return 'Vous m’avez indiqué qu’elle est apparue il y a quelques jours.';
    if(growth)return 'Vous m’avez indiqué qu’elle s’agrandit.';
    return '';
  }
  return {questions,medicalAdvice,watch,followup,create,contextSentence};
})();
