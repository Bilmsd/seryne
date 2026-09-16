// Extraction déterministe déclarative, sans diagnostic. Chaque fait conserve sa
// provenance, son statut et son historique. Le vocabulaire est extensible.
window.Episode = (() => {
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/’/g, "'");
  const symptoms = [
    { id:'0', key:'nasal', pattern:/nez (?:qui coule|bouche|encombre)|rhinorrhee|enrhume/g, phrase:'a le nez qui coule' },
    { id:'1', key:'cough', pattern:/touss\w*|toux/g, phrase:'tousse', mild:/petite toux|touss\w* (?:un peu|legerement)|toux legere/ },
    { id:'2', key:'throat', pattern:/mal (?:a la|de) gorge/g, phrase:'a mal à la gorge' },
    { id:'3', key:'ear', pattern:/mal (?:a l'|aux )oreilles?|douleur d'oreille/g, phrase:'a mal à l’oreille' },
    { id:'4', key:'vomiting', pattern:/vomiss\w*|vomit\w*/g, phrase:'vomit' },
    { id:'5', key:'diarrhea', pattern:/diarrhee/g, phrase:'a de la diarrhée' },
    { id:'6', key:'abdominal', pattern:/mal (?:au ventre|de ventre)|douleur abdominale/g, phrase:'a mal au ventre' },
    { id:'7', key:'urinaryPain', pattern:/douleur en urinant|mal (?:en urinant|quand il urine)/g, phrase:'a mal en urinant' },
  ];
  function create() { return { facts:{}, events:[] }; }
  function put(episode, key, value, source, status = 'known', attributes = {}) {
    const previous = episode.facts[key];
    if (previous?.value === value && previous.intensity && !attributes.intensity) attributes.intensity = previous.intensity;
    const fact = { value, status, origin:'déclarée', source, ...attributes };
    if (previous && previous.status === 'known' && previous.value !== value && !source.explicitCorrection) fact.status = 'ambiguous';
    episode.events.push({ key, ...fact }); episode.facts[key] = fact;
  }
  function ingest(episode, text, source = {}) {
    const normalized = normalize(text);
    source = { ...source, text, explicitCorrection: source.explicitCorrection || /finalement|en fait|je corrige|maintenant|ne .*plus/.test(normalized) };
    // La portée des négations/incertitudes est locale à chaque proposition.
    const clauses = normalized.split(/[,;.!?]|\bmais\b|\bet\b/).filter(Boolean);
    symptoms.forEach(def => {
      clauses.forEach(clause => {
        const match = [...clause.matchAll(new RegExp(def.pattern.source, 'g'))][0];
        if (!match) return;
        const before = clause.slice(0, match.index);
        const after = clause.slice(match.index + match[0].length);
        const uncertain = /peut.etre|pas sur|ne sais pas|semble|possible/.test(clause);
        const negative = /\b(?:pas|sans|aucun|ni)\b/.test(before) || /^\s*(?:pas|plus)\b/.test(after);
        put(episode, def.key, !negative, source, uncertain ? 'ambiguous' : 'known', { intensity: def.mild?.test(clause) ? 'mild' : null, phrase: def.key === 'nasal' && /bouche|encombre|enrhume/.test(match[0]) ? 'a le nez encombré' : def.phrase });
      });
    });
    const temperature = normalized.match(/\b(3[5-9]|4[0-2])([,.]\d)?\b/);
    if (temperature) { put(episode,'temperature',Number(temperature[0].replace(',','.')),source); put(episode,'fever',true,source); }
    else if (/fievre/.test(normalized)) put(episode,'fever', !/pas de fievre|sans fievre/.test(normalized),source,/ne sais pas|peut.etre/.test(normalized)?'ambiguous':'known');
    const onset = normalized.match(/(?:depuis\s+)?(ce soir|ce matin|hier soir|hier|avant-hier)/);
    if (onset && (source.kind === 'user-message' || /fievre|temperature/.test(normalized))) put(episode,'onset',onset[1],source);
    const methods = [['rectale','Dans les fesses (rectale)'],['dans les fesses','Dans les fesses (rectale)'],["dans l'oreille",'Dans l’oreille'],['sur le front','Sur le front'],['sous le bras','Sous le bras'],['dans la bouche','Dans la bouche']];
    for (const [phrase,value] of methods) if (normalized.includes(phrase) && /temperature|thermometre|mesur|prise|pris|\b(?:3[5-9]|4[0-2])\b/.test(normalized)) put(episode,'method',value,source);
    return episode;
  }
  function known(episode, key) { return episode.facts[key]?.status === 'known'; }
  function present(episode) { return symptoms.filter(def => known(episode,def.key) && episode.facts[def.key].value === true); }
  function plan(episode, question) {
    if (question.policy === 'safety-confirmation') return { ...question, reason:'safety-confirmation' };
    if (question.policy === 'missing-options') {
      const existing = present(episode);
      const phrases = existing.map(def => def.key==='cough' && episode.facts.cough.intensity==='mild' ? 'tousse un peu' : (episode.facts[def.key].phrase || def.phrase));
      const options = question.options.filter(option => { const def=symptoms.find(item=>item.id===option.id); return !def || !known(episode,def.key); });
      options.push({id:'none',label:existing.length ? 'Rien d’autre remarqué' : 'Aucun de ces symptômes'});
      return { ...question, options, none:'none', title:phrases.length ? `Vous m’avez indiqué que Léo ${phrases.join(' et ')}. Avez-vous remarqué autre chose depuis le début de la fièvre ?` : question.title };
    }
    if (question.requires?.every(key => known(episode,key))) return { ...question, skip:true };
    return { ...question };
  }
  function recordOptions(episode, question, values, source) {
    if (question.id==='symptoms') {
      question.options.forEach(option => {
        const def=symptoms.find(item=>item.id===option.id);
        if (def && (values.includes(option.id) || values.includes('none'))) put(episode,def.key,values.includes(option.id),{...source,explicitCorrection:true},'known', { intensity: def.key==='cough' && values.includes(option.id) ? 'mild' : null });
      });
    }
    values.forEach(id => {
      const option = question.options.find(option => option.id === id);
      (option?.facts || []).forEach(fact => put(episode,fact.key,fact.value,{...source,explicitCorrection:true},fact.status || 'known',fact.attributes || {}));
    });
    put(episode,`question.${question.id}`,values,source);
  }
  return {create,ingest,put,known,present,plan,recordOptions,symptoms};
})();
