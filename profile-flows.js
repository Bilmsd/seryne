// Points d’extension par profil. Le routage clinique de Léo reste en place.
window.ProfileFlows = (() => {
  const controllers = new Map();
  return { register(id,controller) { controllers.set(id,controller); }, get(id) { return controllers.get(id)||null; } };
})();
ProfileFlows.register('adam', {
  greeting:'Bonjour Adam, qu’est-ce qui vous préoccupe aujourd’hui ?',
  composerNote:'À votre rythme',
  submit: (text,ui) => AdamFlow.submit(text,ui),
  photo: ui => AdamFlow.photo(ui),
  stop: () => AdamFlow.stop(),
  get active() { return AdamFlow.active; },
  get canSend() { return AdamFlow.canSend; },
});
