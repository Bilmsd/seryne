// Affichage et transitions du parcours. Les règles et contenus restent dans FeverData.
window.FeverFlow = (() => {
  let state = null;
  let ui = null;
  let index = 0;
  let pending = false;
  let timers = [];
  let activeCard = null;
  let generation = 0;
  const $ = selector => document.querySelector(selector);
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function button(label, callback, secondary = false) { return ui.action(label, callback, secondary); }
  function later(callback, delay) {
    const token = generation;
    timers.push(setTimeout(() => { if (state && token === generation) callback(); }, delay));
  }
  function focusCard(card) {
    requestAnimationFrame(() => {
      if (!state || !card.isConnected) return;
      card.tabIndex = -1;
      card.focus({ preventScroll: true });
      const container = $('#message-scroll');
      container.scrollTo({ top: Math.max(0, container.scrollTop + card.getBoundingClientRect().top - container.getBoundingClientRect().top - 16), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
  }
  function lock() {
    if (activeCard) {
      activeCard.querySelectorAll('button, input, textarea').forEach(node => { node.disabled = true; });
      if (index < 6) activeCard.classList.add('completed-question');
    }
  }
  function updateProgress() {
    $('#fever-phase').textContent = index < 6 ? 'Comment va Léo' : index < 10 ? 'Son épisode de fièvre' : 'Le point sur Léo';
    $('#fever-progress').value = index;
  }
  function card(text, helper) {
    if (index < 6) lock();
    activeCard = ui.message('seryne', text, { helper });
    activeCard.classList.add('question-card');
    return activeCard;
  }
  function appendActions(parent, actions) {
    const group = el('div', 'message-actions');
    group.append(...actions);
    parent.append(group);
  }
  function advance() {
    index += 1;
    updateProgress();
    pending = true;
    later(() => { pending = false; if (index === FeverData.questions.length) prepareSummary(); else ask(); }, 260);
  }
  function textForm(parent, label, callback, { value = '', type = 'text', submit = 'Enregistrer' } = {}) {
    const form = el('form', 'inline-form');
    const fieldId = `fever-field-${generation}-${index}-${state.history.length}`;
    const caption = el('label', '', label);
    caption.htmlFor = fieldId;
    const field = el(type === 'textarea' ? 'textarea' : 'input');
    field.id = fieldId;
    if (type !== 'textarea') field.type = 'text';
    field.required = true;
    field.maxLength = 1000;
    field.value = value;
    const save = el('button', 'message-action', submit);
    save.type = 'submit';
    form.append(caption, field, save);
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!field.value.trim()) { field.focus(); return; }
      ingestText(field.value.trim(), 'free-answer');
      callback(field.value.trim(), field);
    });
    parent.append(form);
    return field;
  }
  function ingestText(text, kind) {
    Episode.ingest(state.episode,text,{kind});
    if (state.episode.facts.onset) state.onset=Episode.known(state.episode,'onset') ? state.episode.facts.onset.value : null;
    if (state.episode.facts.temperature) state.temperature.value=Episode.known(state.episode,'temperature') ? state.episode.facts.temperature.value : null;
    if (state.episode.facts.method) state.temperature.method=Episode.known(state.episode,'method') ? state.episode.facts.method.value : null;
  }
  function ask() {
    const question = Episode.plan(state.episode, FeverData.questions[index]);
    if (question.skip) {
      if (question.id === 'onset') state.answers.onset=['0'];
      state.history.push({question:question.id,source:'episode',reason:'already-known'});
      advance(); return;
    }
    if (question.id === 'onset' && !state.onset) return editOnset();
    if (question.id === 'temperature' && state.temperature.value === null) return enterTemperature();
    let title = question.title;
    if (question.id === 'onset') title = `Vous m’avez indiqué que la fièvre a commencé ${state.onset}. Est-ce bien cela ?`;
    if (question.id === 'temperature') title = `Vous avez mesuré ${String(state.temperature.value).replace('.', ',')} °C. Comment avez-vous pris sa température ?`;
    const parent = card(title, question.multi ? 'Vous pouvez sélectionner plusieurs réponses.' : undefined);
    if (index < 6) parent.classList.add('safety-question');
    if (question.id === 'profile') {
      const list = el('ul', 'profile-facts');
      ['Aucun antécédent particulier enregistré', 'Aucune allergie enregistrée', 'Aucun traitement chronique enregistré'].forEach(text => list.append(el('li', '', text)));
      parent.append(el('p', 'data-caption', 'Profil fictif de démonstration · Informations enregistrées'), list, el('p', 'profile-check', 'Ces informations sont-elles toujours à jour ?'));
    }
    if (question.help) {
      const help = button('Voir à quoi ressemblent des difficultés respiratoires', () => education('breathing'), true);
      help.classList.add('education-link');
      parent.append(help);
    }
    const choices = el('div', 'answer-options');
    choices.setAttribute('role', 'group');
    choices.setAttribute('aria-label', title);
    let selected = [];
    let concernField = null;
    const concernBox = el('div', 'inline-form concern-box');
    concernBox.hidden = true;
    const controls = [];
    const confirm = question.multi ? button('Continuer', () => {
      if (question.id === 'alerts' && selected.includes('4')) {
        if (!concernField.value.trim()) { concernField.focus(); return; }
        state.details.otherConcern = concernField.value.trim();
        ingestText(state.details.otherConcern,'other-concern');
      }
      respond(question, selected);
    }) : null;
    if (confirm) confirm.disabled = true;
    question.options.forEach(option => {
      const control = button(option.label, () => {
        if (pending) return;
        if (!question.multi) return respond(question, [option.id]);
        selected = FeverData.toggle(selected, option.id, question.none);
        controls.forEach(({ node, id }) => node.setAttribute('aria-pressed', String(selected.includes(id))));
        if (question.id === 'alerts') {
          concernBox.hidden = !selected.includes('4');
          if (selected.includes('4')) { concernField.focus({ preventScroll: true }); focusConcern(concernBox); }
        }
        confirm.disabled = !selected.length || (selected.includes('4') && question.id === 'alerts' && !concernField.value.trim());
      }, true);
      control.classList.add('answer-option');
      control.dataset.answer = option.id;
      control.setAttribute('aria-pressed', 'false');
      controls.push({ node: control, id: option.id });
      choices.append(control);
    });
    parent.append(choices);
    if (question.id === 'alerts') {
      const label = el('label', '', 'Décrivez-moi simplement ce qui vous inquiète.');
      concernField = el('textarea'); concernField.id = `other-concern-${generation}-${state.history.length}`;
      concernField.maxLength = 1000; label.htmlFor = concernField.id;
      concernField.addEventListener('input', () => { confirm.disabled = selected.includes('4') && !concernField.value.trim(); });
      concernBox.append(label, concernField); parent.append(concernBox);
    }
    if (confirm) parent.append(confirm);
    focusCard(parent);
  }
  function respond(question, values) {
    if (pending || !values.length) return;
    lock();
    FeverData.record(state, question, values);
    const answerText = values.map(value => question.options.find(option => option.id === value).label).join(' · ');
    if (index < 6) activeCard.append(el('p', 'recorded-answer', answerText + (question.id === 'alerts' && values.includes('4') ? ` — ${state.details.otherConcern}` : '')));
    else ui.message('user', answerText);
    const outcome = FeverData.outcome(question, values);
    if (outcome === 'rapid') return rapidBreathing();
    if (outcome === 'hydration') return hydration();
    if (outcome === 'hydration-review') return hydrationReview();
    if (outcome === 'alerts') return characterizeAlerts(values);
    if (outcome === 'caution') return caution();
    if (outcome === 'unknown') return unknown(question);
    if (outcome === 'skin') return skin(question, values[0]);
    if (question.id === 'onset' && values[0] === '1') return editOnset();
    if (question.id === 'temperature') {
      state.temperature.method = question.options.find(option => option.id === values[0]).label;
      Episode.put(state.episode,'method',state.temperature.method,{kind:'choice'},values[0] === '5' ? 'ambiguous' : 'known');
    }
    if (question.id === 'profile' && values[0] === '1') return editProfile();
    advance();
  }
  function recheck() {
    lock();
    // L’ancienne réponse reste dans l’historique ; elle n’est jamais remplacée
    // par une réponse normale sans une nouvelle sélection explicite.
    delete state.answers[FeverData.questions[index].id];
    ask();
  }
  function caution() {
    const parent = card('Cette réponse nécessite de vérifier la situation plus rapidement.', 'Dans la version complète, Seryne adaptera immédiatement l’orientation à cette réponse.');
    parent.classList.add('caution-card');
    appendActions(parent, [button('Revenir au scénario', recheck)]);
    focusCard(parent);
  }
  function unknown(question) {
    const text = question.id === 'general'
      ? 'Essayez de lui parler ou de le solliciter comme vous le faites habituellement. Est-ce qu’il vous regarde, répond ou réagit normalement ?'
      : 'Cette information reste incertaine. Vous pouvez réévaluer votre réponse ; elle n’est pas considérée comme normale.';
    const parent = card(text);
    appendActions(parent, [button('Réévaluer', recheck)]);
    focusCard(parent);
    if (question.id === 'breathing') {
      education('breathing');
      $('#sheet').addEventListener('close', () => { if (state && index === 1) recheck(); }, { once: true });
    }
  }
  function focusConcern(node) {
    requestAnimationFrame(() => node.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  }
  function branch(key, callback, helper) {
    const data = Episode.plan(state.episode,{...FeverData.branches[key],policy:'safety-confirmation'});
    const parent = card(data.title, helper);
    parent.classList.add('safety-question');
    const options = el('div', 'answer-options');
    data.options.forEach((label, i) => {
      const choice = button(label, () => {
        lock();
        state.details[key] = String(i);
        Episode.put(state.episode,`branch.${key}`,String(i),{kind:'branch-choice'});
        state.history.push({ question: key, values: [String(i)], origin: 'déclarée' });
        parent.append(el('p', 'recorded-answer', label));
        callback(String(i));
      }, true);
      choice.classList.add('answer-option'); choice.dataset.branchAnswer = String(i);
      options.append(choice);
    });
    parent.append(options); focusCard(parent); return parent;
  }
  function hold(text, helper, retry = recheck) {
    const parent = card(text, helper);
    appendActions(parent, [button('Réévaluer ma réponse', retry, true), button('Revenir à l’accueil', ui.goHome, true)]);
    focusCard(parent);
  }
  function rapidBreathing() {
    const parent = branch('rapid', value => {
      if (value === '1' || value === '2') return caution();
      if (value === '3') return unknown(FeverData.questions[1]);
      hold('Vous décrivez une respiration plus rapide, sans effort visible rapporté.', 'Cette réponse n’est pas assimilée à une détresse respiratoire. Elle reste distincte d’une respiration habituelle ; la suite de cette branche de démonstration reste à compléter.');
    });
    parent.append(button('Voir à quoi ressemblent des difficultés respiratoires', () => education('breathing'), true));
  }
  function hydration() {
    // Toutes les réponses conservent leur identité ; la question des urines
    // complète le contexte au lieu de déclencher deux alertes indépendantes.
    advance();
  }
  function hydrationReview() {
    const review = FeverData.hydrationReview(state);
    if (review.normal) return advance();
    let title = 'Je rapproche ce que Léo boit de ses urines.';
    if (state.answers.drinking[0] === '4') title = 'Vous décrivez des vomissements répétés sans liquides conservés.';
    const parent = card(title, review.text);
    parent.append(el('p', 'message-helper', review.uncertain ? 'Une partie de ces informations reste inconnue. Cela n’est ni une réponse normale ni un signe pathologique confirmé. Le chemin rassurant reste suspendu.' : 'Ces réponses nécessitent de préciser la situation. La suite adaptée à cette combinaison sera développée séparément ; le chemin rassurant reste suspendu.'));
    appendActions(parent, [button('Revoir les boissons et les urines', () => {
      lock(); delete state.answers.drinking; delete state.answers.urine; index = 2; updateProgress(); ask();
    }, true), button('Revenir à l’accueil', ui.goHome, true)]);
    focusCard(parent);
  }
  function skin(question, value) {
    const parent = branch('skinAspect', aspect => {
      if (aspect === '1') skinEvolution(); else skinPressure();
    }, value === '1' ? 'J’ai besoin de mieux comprendre à quoi ressemblent ces lésions.' : 'L’aspect reste incertain. Une photo seule ne permet pas de conclure.');
    appendActions(parent, [button('Ajouter une photo', simulatePhoto, true), button('Comment vérifier une tache inhabituelle ?', pressureHelp, true)]);
  }
  function simulatePhoto() {
    showSheet('Ajouter une photo · Simulation', 'Aucun fichier n’est envoyé ou analysé. Cette action simule uniquement l’ajout d’une photo.');
    $('#sheet-content').append(button('Simuler l’ajout d’une photo', () => {
      state.details.skinPhoto = 'simulation';
      showSheet('Photo de démonstration ajoutée', 'Aucune image médicale n’est présentée ou analysée. Poursuivez les questions sur l’aspect et l’évolution.');
    }));
  }
  function skinEvolution() {
    branch('skinEvolution', () => hold('L’aspect et l’évolution sont notés.', 'La présence de lésions n’est pas assimilée automatiquement à une urgence. La branche dermatologique complète reste à développer ; aucune synthèse rassurante n’est produite pour ces réponses.'));
  }
  function skinPressure() {
    const parent = branch('skinPressure', value => {
      if (value === '1') return urgentSkin();
      if (value === '2') return hold('L’aspect de ces taches reste incertain.', 'Cette information inconnue ne permet pas de poursuivre le chemin rassurant de la démonstration.');
      skinEvolution();
    });
    parent.append(button('Comment vérifier une tache inhabituelle ?', pressureHelp, true));
  }
  function urgentSkin() {
    const parent = card('Ces taches nécessitent un avis médical sans attendre.', 'Vous indiquez qu’elles restent visibles sous la pression. Il paraît préférable de contacter le 15 maintenant afin qu’un professionnel puisse évaluer la situation et vous indiquer la conduite la plus adaptée.');
    parent.classList.add('caution-card');
    const call = el('a', 'message-action call-15', 'Appeler le 15'); call.href = 'tel:15';
    parent.append(call, button('Revenir à l’accueil', ui.goHome, true));
    focusCard(parent);
  }
  function pressureHelp() {
    showSheet('Comment vérifier une tache inhabituelle ?', 'Appuyez quelques secondes sur la tache avec un verre transparent. Observez si elle pâlit ou disparaît sous la pression, ou si elle reste visible. Ce geste ne pose pas de diagnostic.');
    ['Une tache qui blanchit à la pression', 'Une tache qui reste visible à la pression'].forEach(label => {
      const placeholder = el('div', 'realistic-placeholder');
      placeholder.dataset.mediaKind = 'photorealistic-pressure-demo';
      placeholder.append(el('span', '', label), el('small', '', 'Démonstration photoréaliste à venir'));
      $('#sheet-content').append(placeholder);
    });
    singleHelpAction('J’ai regardé, continuer');
  }
  function characterizeAlerts(values) {
    // Chaque signe conserve sa réponse et sa propre question. Plusieurs signes
    // sont caractérisés successivement, sans les ramener à une seule catégorie.
    const queue = [...values];
    const next = () => {
      const value = queue.shift();
      if (value === undefined) return hold('Je garde ces éléments à préciser.', 'Ces informations sont enregistrées séparément. Leur orientation adaptée reste à développer dans cette démonstration ; le chemin rassurant est suspendu.');
      if (value === '4') return next(); // Déjà caractérisé par le champ immédiat.
      const key = { '0': 'vomiting', '2': 'convulsion', '3': 'behavior' }[value];
      if (key) return branch(key, next);
      const parent = card('Où Léo a-t-il mal et depuis quand ?');
      textForm(parent, 'Décrivez cette douleur importante ou inhabituelle.', text => {
        lock(); state.details.pain = text; parent.append(el('p', 'recorded-answer', text)); next();
      }, { type: 'textarea', submit: 'Continuer' });
      focusCard(parent);
    };
    next();
  }
  function singleHelpAction(label) {
    $('#sheet').classList.add('single-help-action');
    $('#sheet-content').append(button(label, () => $('#sheet').close()));
  }
  function editOnset() {
    const parent = card('Précisons le début de la fièvre.');
    textForm(parent, 'Quand la fièvre a-t-elle commencé ?', text => {
      lock();
      state.onset = text;
      Episode.put(state.episode,'onset',text,{kind:'onset-correction',explicitCorrection:true});
      ui.message('user', text);
      ask();
    }, { value: state.onset || '', submit: 'Confirmer' });
    focusCard(parent);
  }
  function enterTemperature() {
    const parent = card('Quelle température avez-vous mesurée ?');
    const field = textForm(parent, 'Température déclarée en °C', (text, node) => {
      if (!/^\d{2}([,.]\d)?$/.test(text)) { node.setCustomValidity('Saisissez une température, par exemple 39,7.'); node.reportValidity(); return; }
      const value = Number(text.replace(',', '.'));
      if (value < 30 || value > 45) { node.setCustomValidity('Vérifiez la valeur saisie.'); node.reportValidity(); return; }
      lock();
      state.temperature.value = value;
      Episode.put(state.episode,'temperature',value,{kind:'temperature-answer',explicitCorrection:true});
      ui.message('user', `${text} °C`);
      ask();
    });
    field.inputMode = 'decimal';
    field.addEventListener('input', () => field.setCustomValidity(''));
    parent.append(button('Je ne sais pas', () => {
      lock();
      state.temperature.value = null;
      state.history.push({ question: 'temperature', values: ['inconnue'], origin: 'déclarée' });
      const note = card('La température reste non renseignée. La synthèse de ce parcours de démonstration ne peut pas être utilisée telle quelle.');
      appendActions(note, [button('Renseigner la température', enterTemperature)]);
    }, true));
    focusCard(parent);
  }
  function editProfile() {
    const parent = card('Quelles informations souhaitez-vous modifier ?');
    textForm(parent, 'Antécédents, allergies ou traitements à préciser', text => {
      lock();
      state.profileUpdate = text;
      ui.message('user', text);
      const note = card('La modification est notée pour cet échange.', 'L’adaptation du parcours à ces informations sera intégrée dans une prochaine version. La synthèse préprogrammée n’est pas affichée.');
      appendActions(note, [button('Réévaluer les informations du profil', () => { state.profileUpdate = null; recheck(); })]);
      focusCard(note);
    }, { type: 'textarea' });
    focusCard(parent);
  }
  function education(key) {
    const data = FeverData.education[key];
    showSheet(data.title, data.intro);
    const container = $('#sheet-content');
    container.className = 'education-content';
    // Assets finaux impérativement PHOTORÉALISTES ou animations réalistes,
    // adaptés à 4 ans. Ne pas remplacer par des schémas médicaux abstraits.
    data.cards.forEach(([title, copy], i) => {
      const item = el('article', 'education-card');
      const placeholder = el('div', 'realistic-placeholder');
      if (key === 'breathing') placeholder.dataset.mediaKind = 'photorealistic-video-loop';
      placeholder.append(el('span', '', key === 'nasal' ? `Étape ${i + 1}` : 'Repère visuel'), el('small', '', 'Photo ou animation réaliste à venir'));
      item.append(placeholder, el('h3', '', title), el('p', '', copy));
      container.append(item);
    });
    if (key === 'breathing') {
      container.append(el('p', 'data-caption', 'Comparez avec la respiration de Léo.'));
      singleHelpAction('J’ai regardé, continuer');
    } else container.append(button('J’ai regardé', () => $('#sheet').close()));
  }
  function reportChange() {
    if (!state) return;
    showSheet('Qu’est-ce qui a changé ?', 'Décrivez simplement le changement que vous avez remarqué.');
    textForm($('#sheet-content'), 'Ce qui a changé', text => {
      state.changes.push(text);
      showSheet('Changement noté', 'Cette fonction sera développée dans la prochaine version. Le changement n’est pas interprété et aucune nouvelle orientation n’est proposée.');
      // La synthèse initiale n’est plus applicable si une évolution a été signalée.
      $('#change-status').textContent = 'Changement signalé · Réévaluation non disponible';
      const summary = $('#fever-summary');
      if (summary.childElementCount && !summary.querySelector('.summary-outdated')) {
        const notice = el('aside', 'temporal-card summary-outdated', 'Un changement a été signalé depuis cette synthèse. Elle décrit la situation précédente ; la réévaluation n’est pas encore disponible.');
        summary.prepend(notice);
      }
    }, { type: 'textarea', submit: 'Signaler ce changement' });
  }
  function prepareSummary() {
    if (!FeverData.canSummarize(state) || state.changes.length) {
      const parent = card('Les informations de cet échange sont notées.', 'Vos réponses diffèrent du chemin de démonstration prévu. La synthèse correspondante n’est pas encore disponible ; aucune conclusion rassurante n’est affichée.');
      appendActions(parent, [button('Revoir mes réponses', () => { lock(); index = 0; updateProgress(); ask(); }), button('Revenir à l’accueil', ui.goHome, true)]);
      focusCard(parent);
      return;
    }
    const parent = card('Seryne fait le point…');
    const steps = el('div', 'summary-preparation');
    steps.setAttribute('role', 'status');
    parent.append(steps);
    ['Informations recueillies ✓', 'Éléments importants vérifiés ✓', 'Conseils adaptés à la situation ✓'].forEach((text, i) => later(() => steps.append(el('p', '', text)), 350 * (i + 1)));
    focusCard(parent);
    later(summary, 1450);
  }
  function summary() {
    if (state.changes.length) return prepareSummary();
    $('#messages').hidden = true;
    $('.conversation-date').hidden = true;
    const root = $('#fever-summary');
    root.replaceChildren();
    root.hidden = false;
    const lead = el('section', 'summary-lead');
    lead.append(el('p', 'eyebrow', 'Le point sur Léo · Maintenant'), el('h1', '', 'Plusieurs éléments sont plutôt rassurants actuellement.'),
      el('p', '', 'Léo reste réactif, boit et urine normalement. Vous ne décrivez pas de difficulté respiratoire, de signe de lutte, d’éruption cutanée inhabituelle ni d’autre signe d’alerte identifié parmi ceux recherchés pendant cet échange.'),
      el('p', '', 'Sa fièvre récente, associée à un nez encombré et une petite toux, peut notamment être compatible avec un épisode infectieux viral courant.'));
    root.append(lead, el('aside', 'temporal-card', 'Ces éléments correspondent à la situation que vous décrivez maintenant. L’évolution reste importante à surveiller.'));
    const details = el('details', 'collected-data');
    details.append(el('summary', '', 'Les informations de cet échange'), el('p', '', `${String(state.temperature.value).replace('.', ',')} °C · Valeur déclarée · ${state.temperature.method}`), el('p', '', `Début déclaré : ${state.onset}. Profil de démonstration confirmé à jour.`));
    root.append(details);
    const advice = el('section', 'summary-section');
    advice.append(el('h2', '', 'Ce qui semble raisonnable pour le moment'));
    [['Boire régulièrement', 'Proposez régulièrement à boire à Léo.'], ['Nez encombré', 'Un lavage nasal peut aider Léo à être plus confortable.'], ['Fièvre et confort', 'La température est un élément à suivre, mais la façon dont Léo tolère la fièvre et son état général sont particulièrement importants.']].forEach(([title, copy], i) => {
      const item = el('article', 'advice-card');
      item.append(el('h3', '', title), el('p', '', copy));
      if (i === 1) item.append(button('Voir comment faire', () => education('nasal'), true));
      advice.append(item);
    });
    root.append(advice);
    const watch = el('section', 'summary-section');
    watch.append(el('h2', '', 'Ce que vous allez surtout surveiller'));
    const grid = el('div', 'watch-grid');
    watchItems.forEach(([title, copy]) => {
      const item = el('article', 'watch-card');
      item.append(el('h3', '', title), el('p', '', copy));
      grid.append(item);
    });
    watch.append(grid, button('Quand faut-il demander de l’aide ?', safetyHelp, true));
    root.append(watch);
    const followup = el('section', 'followup-card');
    followup.id = 'fever-followup';
    root.append(followup);
    renderFollowup();
    root.append(button('Revoir notre échange', () => {
      root.hidden = true;
      $('#messages').hidden = false;
      $('.conversation-date').hidden = false;
      const returnButton = $('#return-summary');
      returnButton.hidden = false;
      returnButton.focus();
    }, true));
    focusCard(lead);
  }
  const watchItems = [
    ['Son comportement', 'Sa réactivité et sa façon d’interagir.'], ['Sa respiration', 'Une respiration plus rapide, difficile ou avec des efforts inhabituels.'], ['Son hydratation', 'Ce qu’il arrive à boire.'], ['Ses urines', 'Un changement par rapport à ses habitudes.'], ['Sa peau', 'L’apparition de boutons ou de taches inhabituelles.'], ['L’évolution générale', 'Ce qui s’améliore ou ce qui change.'],
  ];
  // Modale propre à la synthèse. Les aides existantes s’ouvrent au-dessus,
  // sans reconstruire cette modale, le fil ou l’épisode : leurs positions restent intactes.
  function safetyHelp() {
    const conversationScroll = $('#message-scroll');
    const previousScroll = conversationScroll.scrollTop;
    const dialog = el('dialog', 'safety-dialog');
    dialog.id = 'safety-help';
    dialog.setAttribute('aria-labelledby', 'safety-help-title');
    dialog.setAttribute('aria-describedby', 'safety-help-description');
    function finish() {
      if (!dialog.isConnected) return;
      if (dialog.open) dialog.close();
      dialog.remove();
      conversationScroll.scrollTo({top:previousScroll,behavior:'instant'});
      requestAnimationFrame(() => {
        if (state && !$('#fever-summary').hidden) conversationScroll.scrollTo({top:previousScroll,behavior:'instant'});
      });
    }
    const close = button('×', finish);
    close.className = 'close-button'; close.setAttribute('aria-label', 'Fermer et revenir au point sur Léo');
    const heading = el('h2', '', 'Quand faut-il demander de l’aide ?');
    heading.id = 'safety-help-title';
    const intro = el('p', 'safety-intro', 'Même si plusieurs éléments sont rassurants actuellement, l’état de Léo peut évoluer. Certains changements doivent conduire à demander rapidement un avis médical.');
    intro.id = 'safety-help-description';
    dialog.append(close, el('p', 'eyebrow', 'Les repères importants'), heading, intro);
    const urgent = el('aside', 'safety-urgent');
    urgent.append(el('h3', '', 'Si l’un de ces signes apparaît ou si l’état de Léo se dégrade fortement'), el('p', '', 'Demandez une aide médicale urgente. En France, vous pouvez contacter le 15 pour une régulation médicale ou le 112.'));
    const calls = el('div', 'message-actions');
    [['15', 'Appeler le 15'], ['112', 'Appeler le 112']].forEach(([number, label], i) => {
      const link = el('a', `message-action${i ? ' secondary' : ''}`, label);
      link.href = `tel:${number}`; calls.append(link);
    });
    urgent.append(calls);
    const cards = [
      ['Léo devient très abattu ou difficile à réveiller', 'Il réagit beaucoup moins que d’habitude, semble inhabituellement somnolent ou son comportement change nettement.'],
      ['Léo a du mal à respirer', 'Sa respiration devient difficile, très inhabituelle ou il fait des efforts visibles pour respirer.', 'Voir à quoi cela ressemble', () => education('breathing')],
      ['Léo ne parvient plus à boire correctement', 'Il refuse presque complètement de boire, vomit ce qu’il boit ou urine beaucoup moins que d’habitude.'],
      ['Des taches inhabituelles apparaissent sur sa peau', 'En particulier des petites taches rouges ou violacées qui ne disparaissent pas lorsqu’on appuie dessus.', 'Voir comment vérifier', pressureHelp],
      ['Léo présente une convulsion', 'Demandez une aide médicale urgente : contactez le 15 ou le 112.'],
      ['Son état se dégrade nettement', 'Ou quelque chose dans son état vous paraît vraiment inhabituel ou préoccupant.'],
    ];
    cards.forEach(([title, copy, label, openHelp]) => {
      const item = el('article', 'advice-card safety-card');
      item.append(el('h3', '', title), el('p', '', copy));
      if (openHelp) item.append(button(label, event => {
        const position = dialog.scrollTop;
        const trigger = event.currentTarget;
        openHelp();
        $('#sheet').addEventListener('close', () => {
          if (dialog.open) { trigger.focus({preventScroll:true}); dialog.scrollTop = position; }
        }, {once:true});
      }, true));
      dialog.append(item);
    });
    dialog.append(urgent);
    const back = button('Revenir au point sur Léo', finish);
    back.classList.add('safety-return'); dialog.append(back);
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) finish();
    });
    dialog.addEventListener('close', finish, { once: true });
    document.body.append(dialog); dialog.showModal();
    close.focus({ preventScroll: true });
    dialog.scrollTop = 0;
  }
  function renderFollowup() {
    const parent = $('#fever-followup');
    parent.replaceChildren(el('p', 'eyebrow', 'Garder le fil'), el('h2', '', 'On refait le point ?'), el('p', '', 'Comme la fièvre vient de commencer, l’état de Léo peut évoluer.'), el('p', '', 'Souhaitez-vous que Seryne vous propose de refaire le point sur Léo dans 6 heures ?'));
    appendActions(parent, [button('Oui, dans 6 h', () => confirmFollowup(6)), button('Choisir un autre moment', otherTime, true), button('Pas maintenant', () => {
      state.followup = { hours: null, status: 'declined' };
      parent.replaceChildren(el('h2', '', 'Pas maintenant'), el('p', '', 'Vous pourrez choisir un moment pour refaire le point.'));
      parent.append(button('Choisir un moment', renderFollowup, true));
    }, true)]);
  }
  function otherTime() {
    showSheet('Choisir un autre moment', 'Un horaire pour la simulation uniquement : aucune notification réelle ne sera envoyée.');
    [3, 12, 24].forEach(hours => $('#sheet-content').append(button(`Dans ${hours} h`, () => { $('#sheet').close(); confirmFollowup(hours); }, true)));
  }
  function confirmFollowup(hours) {
    state.followup = { hours, status: 'planned' };
    const parent = $('#fever-followup');
    parent.replaceChildren(el('p', 'eyebrow', `Dans ${hours} heures`), el('h2', '', 'Très bien. Nous referons le point sur l’évolution de Léo.'), el('p', 'data-caption', 'Simulation de démonstration · Aucune notification réelle'));
    parent.append(button(`Simuler le point dans ${hours} h`, simulate));
  }
  function simulate() {
    const parent = $('#fever-followup');
    parent.replaceChildren(el('p', 'eyebrow', 'Réévaluation · Démonstration'), el('h2', '', 'Comment va Léo maintenant ?'));
    appendActions(parent, ['Mieux', 'Pareil', 'Moins bien', 'Nouveau symptôme'].map(label => button(label, () => {
      state.followup.response = label;
      state.followup.status = 'answered';
      // Le suivi enrichit l’épisode existant, sans relancer le questionnaire.
      Episode.put(state.episode, 'followup.evolution', label, {kind:'followup', hours:state.followup.hours, explicitCorrection:true});
      parent.replaceChildren(el('h2', '', label), el('p', '', 'Votre réponse est notée. La suite de cette réévaluation sera développée dans une prochaine version.'));
      parent.append(button('Revoir les réponses', simulate, true));
    }, true)));
    focusCard(parent);
  }
  function start(initialMessage, adapter) {
    stop();
    ui = adapter;
    state = FeverData.context(initialMessage);
    index = 0;
    $('#fever-toolbar').hidden = false;
    $('.composer-area').hidden = true;
    $('#change-status').textContent = '';
    updateProgress();
    ask();
  }
  function stop() {
    generation += 1;
    timers.forEach(clearTimeout);
    timers = [];
    state = null;
    pending = false;
    activeCard = null;
    $('#fever-toolbar').hidden = true;
    $('#fever-summary').hidden = true;
    $('#fever-summary').replaceChildren();
    $('#return-summary').hidden = true;
    $('#messages').hidden = false;
    $('.conversation-date').hidden = false;
    $('.composer-area').hidden = false;
  }
  $('#report-change').addEventListener('click', reportChange);
  $('#return-summary').addEventListener('click', () => {
    $('#messages').hidden = true;
    $('.conversation-date').hidden = true;
    $('#fever-summary').hidden = false;
    $('#return-summary').hidden = true;
    focusCard($('#fever-summary'));
  });
  return { start, stop, get active() { return !!state; } };
})();
