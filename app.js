// Navigation de l’accueil et fenêtres d’information. Aucun moteur médical.
const sheet = document.querySelector('#sheet');
const title = document.querySelector('#sheet-title');
const description = document.querySelector('#sheet-description');
const content = document.querySelector('#sheet-content');
const profiles = {
  leo: { name: 'Léo', age: '4 ans', avatar: 'assets/leo.svg' },
  chloe: { name: 'Chloé', age: '27 ans', avatar: 'assets/chloe.svg' },
};

function showSheet(heading, copy, markup = '') {
  title.textContent = heading;
  description.textContent = copy;
  sheet.classList.remove('single-help-action');
  content.className = '';
  content.innerHTML = markup;
  if (!sheet.open) sheet.showModal();
  // La fermeture reste accessible au clavier, y compris après un changement de contenu.
  sheet.querySelector('.close-button').focus();
}

let selectedProfile = null;
let startAfterSelection = false;

function chooseProfile(id) {
  if (!profiles[id]) return;
  selectedProfile = id;
  document.querySelectorAll('.profile[data-profile]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.profile === id));
  });
  document.querySelector('#selection-summary').textContent = `Pour ${profiles[id].name} · À votre rythme, une question à la fois.`;
  if (sheet.open) sheet.close();
  if (startAfterSelection) {
    startAfterSelection = false;
    Conversation.open(id, profiles[id]);
  }
}

const panels = {
  start() {
    if (!selectedProfile) { startAfterSelection = true; return panels.choose(); }
    Conversation.open(selectedProfile, profiles[selectedProfile]);
  },
  follow() {
    showSheet('Le suivi, au fil du temps.', 'Cet espace permettra de refaire le point sur une situation.', '<div class="notice">Le suivi sera disponible dans une prochaine version.</div>');
  },
  history() {
    showSheet('Vos échanges, au même endroit.', 'Vous pourrez retrouver ici vos précédentes conversations.', '<div class="notice">L’historique sera disponible dans une prochaine version.</div>');
  },
  account() {
    showSheet('Votre espace personnel.', 'Les profils de Léo et Chloé sont des profils fictifs de démonstration.', '<div class="notice">La gestion du profil sera disponible dans une prochaine version.</div>');
  },
  choose() {
    const choices = Object.entries(profiles).map(([id, p]) => `
      <button class="choice" type="button" data-profile="${id}">
        <img class="avatar" src="${p.avatar}" width="64" height="64" alt="">
        <span><strong>${p.name}</strong><small>${p.age}</small></span>
        <svg class="icon" aria-hidden="true"><use href="#arrow"/></svg>
      </button>`).join('');
    showSheet('Pour qui êtes-vous ici ?', 'Choisissez la personne pour laquelle vous souhaitez faire le point.', choices);
  },
  about() {
    showSheet('Un peu de clarté, ensemble.',
      'Seryne vous aide à décrire une situation de santé, à mieux la comprendre et à savoir quand demander un avis médical.',
      '<div class="notice">Seryne n’est ni un médecin ni une téléconsultation. Cette version est une démonstration, sans moteur médical ou IA.</div>');
  },
  add() {
    showSheet('Une place pour chacun.',
      'Les profils de Léo et Chloé vous permettent de découvrir Seryne.',
      '<div class="notice">L’ajout d’une personne sera disponible dans une prochaine version du prototype.</div>');
  },
  demos() {
    showSheet('Trois situations du quotidien.',
      'Choisissez un profil, puis décrivez une fièvre ou des boutons pour Léo, ou un mal de tête pour Chloé. Le parcours fièvre est disponible jusqu’à la simulation du suivi. Les deux autres parcours restent limités à leur première réponse.',
      '<ul class="demo-list"><li>Fièvre de Léo <span>Parcours disponible</span></li><li>Mal de tête de Chloé <span>Entrée disponible</span></li><li>Boutons de Léo <span>Entrée disponible</span></li></ul>');
  },
};

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-open], [data-profile]');
  if (!trigger) return;
  if (trigger.dataset.profile) chooseProfile(trigger.dataset.profile);
  else panels[trigger.dataset.open]?.();
});

sheet.querySelector('.close-button').addEventListener('click', () => sheet.close());
sheet.querySelector('.sheet-dismiss').addEventListener('click', () => sheet.close());
sheet.addEventListener('click', (event) => {
  const bounds = sheet.getBoundingClientRect();
  if (event.target === sheet && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) sheet.close();
});

document.querySelector('[data-home]').addEventListener('click', () => {
  if (sheet.open) sheet.close();
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
});

sheet.addEventListener('close', () => { startAfterSelection = false; });
