// Contrôleur de conversation : cycle d’envoi, rendu et navigation.
// Les contenus reconnus restent dans scenarios.js ; aucun raisonnement médical.
window.Conversation = (() => {
  const view = document.querySelector('#conversation');
  const home = document.querySelector('.app-shell');
  const messages = document.querySelector('#messages');
  const scroll = document.querySelector('#message-scroll');
  const input = document.querySelector('#message-input');
  const send = document.querySelector('#send-message');
  const typing = document.querySelector('#typing');
  const composerNote = document.querySelector('.composer-area > p');
  const defaultComposerNote = composerNote.textContent;
  let state = { profile: null, pending: false, timer: null };
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function scrollToLatest() {
    requestAnimationFrame(() => scroll.scrollTo({ top: scroll.scrollHeight, behavior: reducedMotion() ? 'instant' : 'smooth' }));
  }
  function resizeInput() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 112) + 'px';
    send.disabled = state.pending || !input.value.trim() || state.controller?.canSend === false;
  }
  function action(label, handler, secondary = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = secondary ? 'message-action secondary' : 'message-action';
    button.textContent = label;
    button.addEventListener('click', handler);
    return button;
  }
  function message(role, text, { helper, actions = [] } = {}) {
    const article = document.createElement('article');
    article.className = `message message-${role}`;
    const author = document.createElement('span');
    author.className = role === 'user' ? 'sr-only' : 'message-author';
    author.textContent = role === 'user' ? 'Vous' : 'seryne';
    const copy = document.createElement('p');
    copy.textContent = text; // La saisie libre n’est jamais interprétée comme HTML.
    article.append(author, copy);
    if (helper) {
      const note = document.createElement('p');
      note.className = 'message-helper';
      note.textContent = helper;
      article.append(note);
    }
    if (actions.length) {
      const group = document.createElement('div');
      group.className = 'message-actions';
      group.append(...actions);
      article.append(group);
    }
    messages.append(article);
    scrollToLatest();
    return article;
  }
  function photoOptions() {
    showSheet('Ajouter une photo', 'Vous pourrez choisir une image de votre galerie ou utiliser votre caméra. Ces options seront activées dans une prochaine étape.',
      '<div class="photo-options"><button type="button" data-photo-option="Caméra"><svg class="icon" aria-hidden="true"><use href="#camera"/></svg>Caméra <small>À venir</small></button><button type="button" data-photo-option="Galerie"><svg class="icon" aria-hidden="true"><use href="#plus"/></svg>Galerie <small>À venir</small></button></div>');
  }
  function continueScenario(entry, initialMessage) {
    if (state.pending || FeverFlow.active) return;
    if (entry.id === 'leo-fever') {
      input.blur();
      messages.querySelectorAll('button').forEach(button => { button.disabled = true; });
      FeverFlow.start(state.utterances || [initialMessage], { message, action, photoOptions, goHome });
      return;
    }
    showSheet('La suite arrive bientôt.', 'L’entrée dans ce scénario est disponible. Les questions et la synthèse seront ajoutées à une prochaine étape.');
  }
  function submit(event) {
    event.preventDefault();
    const text = input.value.trim();
    if (state.controller?.submit) {
      if (state.controller.submit(text, {message,action,goHome,resizeInput})) input.value = '';
      resizeInput();
      return;
    }
    if (!text || state.pending || FeverFlow.active || state.controller?.active) return;
    messages.querySelectorAll('.message-actions button').forEach(button => { button.disabled = true; });
    state.utterances.push(text);
    state.pending = true;
    message('user', text);
    input.value = '';
    resizeInput();
    typing.hidden = false;
    scrollToLatest();
    state.timer = setTimeout(() => {
      state.pending = false;
      state.timer = null;
      typing.hidden = true;
      if (state.controller) {
        input.blur();
        state.controller.start(state.utterances.join('\n'), {message,action,goHome});
        resizeInput();
        return;
      }
      const entry = SeryneScenarios.recognize(state.profile, text);
      if (entry) {
        const actions = [action('Continuer', () => continueScenario(entry, text))];
        if (entry.photo) actions.push(action('Ajouter une photo', photoOptions, true));
        message('seryne', entry.response, { actions });
      } else {
        message('seryne', "Cette situation n’est pas encore disponible dans cette version de démonstration de Seryne.", {
          actions: [action('Revenir à l’accueil', goHome)],
        });
      }
      resizeInput();
    }, 800);
  }
  function open(id, profile) {
    state.controller?.stop();
    FeverFlow.stop();
    clearTimeout(state.timer);
    state = { profile: id, pending: false, timer: null, utterances: [], controller: ProfileFlows.get(id) };
    composerNote.textContent = state.controller?.composerNote ?? defaultComposerNote;
    messages.replaceChildren();
    typing.hidden = true;
    input.value = '';
    document.querySelector('#conversation-avatar').src = profile.avatar;
    document.querySelector('#conversation-name').textContent = profile.name;
    document.querySelector('#conversation-age').textContent = profile.age;
    home.hidden = true;
    view.hidden = false;
    document.body.classList.add('conversation-open');
    document.querySelector('.sheet-dismiss').textContent = 'Revenir à la conversation';
    syncViewport();
    resizeInput();
    message('seryne', state.controller?.greeting || `Qu’est-ce qui vous inquiète pour ${profile.name} aujourd’hui ?`, {
      helper: 'Décrivez-moi simplement ce qu’il se passe, avec vos mots.',
    });
    // Évite d’ouvrir automatiquement le clavier et laisse lire l’accueil.
    view.querySelector('.back-button').focus({ preventScroll: true });
  }
  function goHome() {
    state.controller?.stop();
    FeverFlow.stop();
    clearTimeout(state.timer);
    state.pending = false;
    typing.hidden = true;
    input.blur();
    view.hidden = true;
    home.hidden = false;
    document.body.classList.remove('conversation-open');
    document.querySelector('.sheet-dismiss').textContent = 'Revenir à l’accueil';
    home.querySelector('[data-open="start"]').focus({ preventScroll: true });
  }
  function syncViewport() {
    const viewport = window.visualViewport;
    view.style.height = `${viewport ? viewport.height : window.innerHeight}px`;
    view.style.top = `${viewport ? viewport.offsetTop : 0}px`;
  }
  document.querySelector('#composer').addEventListener('submit', submit);
  input.addEventListener('input', resizeInput);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) submit(event);
  });
  document.querySelector('[data-conversation-home]').addEventListener('click', goHome);
  document.querySelector('[data-photo]').addEventListener('click', () => {
    if (state.controller) {
      if (!state.pending) state.controller.photo({message,action,goHome,resizeInput});
    } else photoOptions();
  });
  document.addEventListener('click', event => {
    const option = event.target.closest('[data-photo-option]');
    if (option) showSheet(option.dataset.photoOption, 'Cette option sera disponible dans une prochaine étape. Aucune photo n’est envoyée ou analysée dans cette version.');
  });
  window.visualViewport?.addEventListener('resize', syncViewport);
  window.visualViewport?.addEventListener('scroll', syncViewport);
  window.addEventListener('resize', syncViewport);
  return { open };
})();
