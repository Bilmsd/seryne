// Registre des entrées de démonstration. Les futurs parcours pourront être
// associés à chaque identifiant, sans modifier la présentation des messages.
window.SeryneScenarios = (() => {
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const entries = [
    { id: 'leo-skin', profile: 'leo', matches: /\b(boutons?|eruption|peau|cloques?|vesicules?)\b/,
      response: 'Je vais vous poser quelques questions pour mieux comprendre cette éruption. Si vous le souhaitez, vous pourrez également ajouter une photo.', photo: true },
    { id: 'leo-fever', profile: 'leo', matches: /\b(fievre|temperature)\b|\b39[,.]7\b/,
      response: 'Je vais d’abord vérifier avec vous quelques éléments importants pour savoir comment va Léo actuellement.' },
    { id: 'chloe-headache', profile: 'chloe', matches: /\b(tete|cephalees?)\b/,
      response: 'Je vais vous poser quelques questions pour mieux comprendre cette douleur et vérifier les éléments importants.' },
  ];
  return { recognize(profile, text) { return entries.find(entry => entry.profile === profile && entry.matches.test(normalize(text))) || null; } };
})();
