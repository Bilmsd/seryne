// Contenu préprogrammé issu du cahier des charges, sans moteur médical.
// Toutes les réponses sont déclarées. Une absence reste null ou « inconnu ».
window.FeverData = (() => {
  const q = (id, title, labels, extra = {}) => ({ id, title, options: labels.map((label, index) => ({ id: String(index), label })), ...extra });
  const questions = [
    q('general', 'Comment est Léo actuellement ?', ['Il joue et interagit presque normalement', 'Il est fatigué, mais réagit normalement quand je lui parle', 'Il est très abattu et réagit peu', 'Il est difficile à réveiller', 'Je ne sais pas'], { safe: ['0', '1'], caution: ['2', '3'], unknown: ['4'] }),
    q('breathing', 'Comment respire Léo ?', ["Comme d’habitude, malgré son nez bouché", "Plus vite que d’habitude", 'Il semble faire des efforts pour respirer', 'Sa respiration me paraît inhabituelle', 'Je ne sais pas'], { safe: ['0'], caution: ['2', '3'], unknown: ['4'], help: 'breathing' }),
    q('drinking', "Depuis qu’il a de la fièvre, Léo arrive-t-il à boire ?", ['Oui, régulièrement', "Oui, mais nettement moins que d’habitude", 'Très peu / il refuse de boire', 'Il vomit parfois, mais garde une partie de ce qu’il boit', 'Il vomit de façon répétée et ne garde pas les liquides', 'Je ne sais pas'], { safe: ['0'], unknown: ['5'] }),
    q('urine', "Léo a-t-il uriné normalement aujourd’hui ?", ['Oui, comme d’habitude', 'Oui, mais moins que d’habitude', 'Non, il n’a pas uriné depuis plusieurs heures', 'Je ne me souviens pas de la dernière fois', 'Je ne sais pas'], { safe: ['0'], caution: ['1', '2'], unknown: ['3', '4'] }),
    q('skin', 'Avez-vous remarqué récemment des boutons ou des taches inhabituelles sur sa peau ?', ['Non', 'Oui', 'Je ne suis pas sûr(e)'], { safe: ['0'] }),
    q('alerts', "Depuis le début de la fièvre, avez-vous remarqué l’un de ces éléments ?", ['Vomissements répétés', 'Douleur importante ou inhabituelle', 'Convulsion', 'Comportement vraiment inhabituel', 'Autre chose qui vous inquiète particulièrement', 'Aucun de ces éléments'], { multi: true, none: '5', safe: ['5'] }),
    q('symptoms', "En dehors de la fièvre, qu’avez-vous remarqué chez Léo ?", ['Nez bouché / nez qui coule', 'Petite toux', 'Mal de gorge', "Douleur d’oreille", 'Vomissements', 'Diarrhée', 'Douleur abdominale', 'Douleur en urinant', 'Autre'], { multi: true }),
    q('onset', '', ['Oui', 'Non, modifier']),
    q('temperature', '', ['Par voie rectale', 'Dans l’oreille', 'Sur le front', 'Sous le bras', 'Dans la bouche', 'Je ne sais pas']),
    q('profile', 'Je vérifie le profil de Léo', ['Oui', 'Modifier']),
  ];
  questions.forEach((question, i) => { question.policy = i < 6 || question.id === 'profile' ? 'safety-confirmation' : question.id === 'symptoms' ? 'missing-options' : 'missing-fields'; });
  questions.find(q => q.id === 'onset').requires = ['onset'];
  questions.find(q => q.id === 'temperature').requires = ['temperature','method'];
  // Effets structurés des réponses : même mémoire que pour le texte libre.
  questions.find(q=>q.id==='drinking').options.forEach(option => {
    if (['3','4'].includes(option.id)) option.facts = [{key:'vomiting',value:true}];
  });
  questions.find(q=>q.id==='alerts').options[0].facts = [{key:'vomiting',value:true}];
  const education = {
    breathing: { title: 'Observer sa respiration', intro: 'Ces emplacements accueilleront les futurs contenus visuels. Les images ne sont pas encore disponibles.', cards: [
      ['Tirage', 'Creusement marqué de la peau sous ou entre les côtes pendant l’inspiration.'],
      ['Balancement thoraco-abdominal', 'Mouvements inhabituels et désynchronisés du thorax et du ventre.'],
      ['Autres efforts respiratoires visibles', 'Respiration manifestement laborieuse ou mouvements inhabituels.'],
    ] },
    nasal: { title: 'Lavage nasal', intro: 'Une fiche adaptée à un enfant de 4 ans. Le contenu détaillé et les gestes seront validés séparément.', cards: [
      ['Préparation', 'Contenu du geste à valider.'], ['Installation', 'Contenu du geste à valider.'], ['Le geste', 'Contenu du geste à valider.'], ['Après le lavage', 'Contenu du geste à valider.'],
    ] },
  };
  // Petites branches déterministes. Aucun diagnostic ni classement automatique
  // de gravité ; seuls les éléments explicitement définis orientent ce prototype.
  const branches = {
    rapid: { title: 'Sa respiration vous paraît plus rapide. Voyez-vous aussi des efforts pour respirer ?', options: ['Elle paraît seulement plus rapide', 'Je vois aussi des efforts pour respirer', 'Elle me paraît franchement inhabituelle', 'Je ne sais pas'] },
    skinAspect: { title: 'À quoi ressemblent les boutons ou les taches ?', options: ['Des taches rouges ou violacées', 'Des boutons en relief ou de petites cloques', 'Un autre aspect / je ne suis pas sûr(e)'] },
    skinEvolution: { title: 'Comment ces boutons ou ces taches évoluent-ils ?', options: ['Leur aspect semble stable', 'De nouvelles lésions apparaissent ou elles s’étendent', 'Je ne sais pas'] },
    skinPressure: { title: 'Sous la pression, les taches pâlissent-elles ou disparaissent-elles ?', options: ['Oui, elles pâlissent ou disparaissent', 'Non, elles restent visibles', 'Je ne sais pas / je n’arrive pas à vérifier'] },
    vomiting: { title: 'Entre les vomissements, Léo garde-t-il une partie de ce qu’il boit ?', options: ['Oui, une partie reste', 'Non, il ne garde pas les liquides', 'Je ne sais pas'] },
    convulsion: { title: 'Les mouvements qui vous ont fait penser à une convulsion sont-ils encore présents ?', options: ['Oui', 'Non, ils se sont arrêtés', 'Je ne sais pas'] },
    behavior: { title: 'Quand vous sollicitez Léo, comment réagit-il maintenant ?', options: ['Il me regarde et me répond', 'Il réagit peu ou difficilement', 'Je ne sais pas'] },
  };
  const hydrationLabels = ['Boissons régulières rapportées.', 'Boissons nettement diminuées rapportées.', 'Très peu de boissons ou refus rapporté.', 'Vomissements occasionnels avec une partie des liquides conservée.', 'Vomissements répétés sans liquides conservés.', 'Quantité bue inconnue.'];
  function hydrationReview(state) {
    const drinking = state.answers.drinking?.[0];
    const urine = state.answers.urine?.[0];
    const urineLabel = questions.find(q => q.id === 'urine').options.find(o => o.id === urine)?.label || 'Information non renseignée';
    return { normal: drinking === '0' && urine === '0', uncertain: drinking === '5' || ['3', '4'].includes(urine),
      text: `${hydrationLabels[drinking] || 'Boissons non renseignées.'} Urines : ${urineLabel.toLowerCase()}.` };
  }
  function context(text) {
    const messages = Array.isArray(text) ? text : [text];
    const episode = Episode.create();
    messages.forEach(message => Episode.ingest(episode,message,{kind:'user-message'}));
    text = messages.join('\n');
    return {
      episode, initialMessage: text,
      onset: Episode.known(episode,'onset') ? episode.facts.onset.value : null,
      temperature: { value: Episode.known(episode,'temperature') ? episode.facts.temperature.value : null, origin: 'déclarée', method: Episode.known(episode,'method') ? episode.facts.method.value : null },
      details: {}, answers: {}, history: [], changes: [], profileUpdate: null, followup: null,
    };
  }
  function toggle(selected, id, none) {
    if (selected.includes(id)) return selected.filter(item => item !== id);
    if (id === none) return [id];
    return [...selected.filter(item => item !== none), id];
  }
  function outcome(question, values) {
    if (question.id === 'breathing' && values[0] === '1') return 'rapid';
    if (question.id === 'drinking') return 'hydration';
    if (question.id === 'urine') return 'hydration-review';
    if (question.id === 'skin' && values[0] !== '0') return 'skin';
    if (question.unknown?.includes(values[0])) return 'unknown';
    if (question.caution?.includes(values[0])) return 'caution';
    if (question.id === 'alerts' && (values.length !== 1 || values[0] !== '5')) return 'alerts';
    return 'next';
  }
  function record(state, question, values) {
    Episode.recordOptions(state.episode, question, values, {kind:'choice', question:question.id});
    state.answers[question.id] = question.id === 'symptoms' ? Episode.present(state.episode).map(def=>def.id) : [...values];
    state.history.push({ question: question.id, values: [...values], origin: 'déclarée' });
  }
  function safetyComplete(state) {
    return questions.slice(0, 6).every(question => {
      const answer = state.answers[question.id];
      return answer?.length === 1 && question.safe.includes(answer[0]);
    });
  }
  function canSummarize(state) {
    const symptoms = state.answers.symptoms || [];
    return (!state.episode || (Episode.known(state.episode,'nasal') && Episode.known(state.episode,'cough') && state.episode.facts.cough.intensity === 'mild')) && safetyComplete(state) && symptoms.length === 2 && symptoms.includes('0') && symptoms.includes('1') &&
      state.onset === 'ce soir' && state.answers.onset?.[0] === '0' &&
      state.temperature.value === 39.7 && !!state.temperature.method && state.temperature.method !== 'Je ne sais pas' &&
      state.answers.profile?.[0] === '0' && !state.profileUpdate;
  }
  return { questions, education, branches, hydrationReview, context, toggle, outcome, record, safetyComplete, canSummarize };
})();
