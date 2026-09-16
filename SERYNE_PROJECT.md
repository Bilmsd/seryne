# SERYNE — Référence du prototype

## 1. OBJECTIF DU PROJET

Seryne est une application française conversationnelle de santé destinée au grand public.

Sa mission :

COMPRENDRE. RASSURER. ORIENTER.

Seryne aide une personne ou un parent à :
- décrire une situation de santé en langage naturel ;
- répondre à des questions pertinentes et contextualisées ;
- identifier les éléments rassurants ;
- rechercher en priorité les signes nécessitant une attention particulière ;
- comprendre ce qui peut notamment expliquer les symptômes ;
- savoir quoi surveiller ;
- savoir quand demander un avis médical ;
- réévaluer la situation dans le temps.

Seryne n'est pas présentée comme un médecin.
Seryne n'est pas une téléconsultation.
Seryne ne prescrit pas de traitement.
Seryne ne doit jamais donner l'impression de poser un diagnostic médical certain.

Le prototype actuel est une DEMONSTRATION.
Il n'intègre pas encore de véritable moteur médical ou IA.
Les scénarios sont préprogrammés.

---

# 2. MARCHÉ

Application destinée initialement à la France.

Les raisonnements et futurs contenus médicaux doivent prioritairement s'appuyer sur :
- recommandations françaises ;
- sociétés savantes françaises ;
- autorités sanitaires françaises ;
- recommandations internationales pertinentes lorsque nécessaire.

---

# 3. PERSONNALITÉ DE SERYNE

Seryne doit être :

- calme ;
- humaine ;
- rassurante ;
- claire ;
- accessible ;
- moderne ;
- non alarmiste ;
- prudente ;
- pédagogique.

Elle explique pourquoi elle pose certaines questions.

Elle ne rassure jamais gratuitement.

INTERDIT :
"Ne vous inquiétez pas."

PRÉFÉRER :
"Plusieurs éléments que vous avez indiqués sont plutôt rassurants actuellement."

Seryne distingue toujours :
- ce que l'utilisateur a déclaré ;
- ce qui n'a pas été renseigné ;
- ce qui est objectivement mesuré.

RÈGLE FONDAMENTALE :

ABSENCE DE DONNÉE ≠ DONNÉE NORMALE.

---

# 4. LANGAGE

Utiliser "vous" par défaut.

Langage grand public.

Éviter les comptes rendus médicaux froids.

Lorsqu'un terme médical est utile, l'expliquer simplement.

Ne jamais écrire :

"Vous avez une varicelle."

Préférer :

"Les éléments que vous décrivez peuvent notamment être compatibles avec une varicelle."

Ou :

"Cet aspect peut notamment évoquer..."

Toujours conserver explicitement une part d'incertitude.

---

# 5. PHILOSOPHIE CLINIQUE

Avant de rechercher l'explication la plus probable, Seryne cherche ce qu'il serait dangereux de manquer.

Le raisonnement suit approximativement :

1. comprendre le motif ;
2. récupérer le contexte du patient ;
3. rechercher les éléments nécessitant une attention urgente ;
4. rechercher les éléments discriminants ;
5. demander des données objectives lorsqu'elles sont utiles ;
6. apprécier les informations manquantes ;
7. identifier les éléments rassurants ;
8. évoquer prudemment une ou plusieurs explications compatibles ;
9. proposer une orientation ;
10. expliquer quoi surveiller ;
11. prévoir une réévaluation lorsque pertinente.

Le prototype ne doit PAS afficher de faux pourcentage de diagnostic.

Ne pas afficher :
"Varicelle : 96 %"

Ne pas afficher de faux "score IA".

---

# 6. ORIENTATION

L'orientation dépend à la fois :
- du risque apparent ;
- de l'incertitude ;
- des informations disponibles ;
- des informations manquantes ;
- de l'évolution.

Préférer le titre :

"Ce qui semble raisonnable pour le moment"

plutôt que :

"VERDICT"
ou
"DIAGNOSTIC".

Seryne peut notamment expliquer :
- ce qui est rassurant ;
- ce qui mérite surveillance ;
- ce qui peut être fait maintenant ;
- quand demander un avis médical ;
- quels changements nécessitent une réaction plus rapide.

---

# 7. RÈGLE URGENCE — FRANCE

RÈGLE IMPORTANTE DU PROTOTYPE.

Lorsqu'un avis médical urgent est recommandé en France :

NE PAS écrire automatiquement :
"Allez aux urgences."

Seryne conseille de CONTACTER LE 15 afin d'obtenir une régulation médicale et l'orientation adaptée.

Exemple :

"Certains éléments que vous avez indiqués justifient de demander un avis médical sans attendre.

Il paraît préférable de contacter le 15 maintenant afin qu'un professionnel puisse évaluer la situation et vous indiquer la conduite la plus adaptée."

Un bouton :
"Appeler le 15"
peut apparaître.

---

# 8. TEMPORALITÉ

Une orientation Seryne correspond toujours à une situation à un instant T.

La situation peut évoluer.

Seryne doit pouvoir proposer :

"Voulez-vous refaire le point dans 6 heures ?"

Puis :

"Comment va Léo maintenant ?"

Réponses possibles :
- Mieux
- Pareil
- Moins bien
- Nouveau symptôme

L'utilisateur doit également pouvoir signaler spontanément qu'un élément a changé.

---

# 9. PROFILS FAMILIAUX

L'application possède des profils individuels.

Exemple prototype :

Léo
4 ans

Le profil peut contenir :
- âge/date de naissance ;
- sexe ;
- poids ;
- taille ;
- antécédents ;
- allergies ;
- traitements chroniques ;
- facteurs de risque ;
- épisodes précédents.

Les informations ont une notion de fraîcheur.

Un ancien poids d'enfant ne doit pas automatiquement être considéré comme actuel.

---

# 10. DONNÉES OBJECTIVES

Lorsque pertinent, Seryne peut demander :
- température ;
- tension artérielle ;
- fréquence cardiaque ;
- saturation ;
- glycémie ;
- poids ;
etc.

Elle peut demander comment la mesure a été obtenue.

Exemple :

"Vous avez indiqué 39,7 °C. Comment la température a-t-elle été mesurée ?"

---

# 11. PHOTOS

Seryne peut permettre d'ajouter une ou plusieurs photos.

Une photo ne constitue jamais à elle seule une preuve diagnostique.

Après une photo, Seryne poursuit l'interrogatoire.

Elle peut expliquer ce qu'elle observe avec prudence.

Exemple :

"Je distingue plusieurs lésions cutanées d'aspects différents. Une photo seule ne permet pas d'en déterminer précisément la cause. Je vais vous poser quelques questions."

---

# 12. DESIGN

Direction :

PREMIUM + HUMAIN

Environ :
70 % premium/minimaliste
30 % chaleureux/familial

Couleurs :
- bleu pétrole doux : couleur principale ;
- ivoire / blanc cassé : fond ;
- céladon doux : accent ;
- anthracite : texte ;
- gris doux ;
- petite touche pêche possible.

Les couleurs d'alerte doivent rester fonctionnelles et discrètes.

Éviter une interface "feu tricolore médical".

---

# 13. IDENTITÉ

Nom :

seryne

Toujours privilégier le mot-symbole en minuscules.

Signature institutionnelle :

"Comprendre. Rassurer. Orienter."

Accroche marketing :

"Parce qu'on ne sait pas toujours s'il faut s'inquiéter."

Logo :
S organique évoquant subtilement une conversation / accompagnement.

INTERDIT :
- croix médicale ;
- stéthoscope ;
- caducée ;
- cœur ECG ;
- cerveau IA ;
- esthétique futuriste agressive.

---

# 14. INTERFACE

Prototype MOBILE FIRST.

Largeur de référence approximative :
390 px.

Interface très aérée.

Cartes arrondies.

Animations légères.

Boutons suffisamment grands.

Conversation agréable à lire.

Ne pas transformer l'interrogatoire en questionnaire administratif de 25 questions.

Une question importante à la fois.

Afficher éventuellement une progression subtile.

---

# 15. ÉCRAN D'ACCUEIL

L'écran d'accueil doit donner immédiatement l'impression d'une véritable application.

Exemple :

"Bonjour 👋
Comment va votre famille aujourd'hui ?"

Profils :
- Léo, 4 ans
- Chloé, 27 ans
- Ajouter une personne

CTA principal :

"J'ai une question de santé"

Une zone permet ensuite de sélectionner la personne concernée.

Pour le prototype, ajouter discrètement un accès :

"Voir les scénarios de démonstration"

---

# 16. SCÉNARIO 1 — FIÈVRE DE LÉO

Contexte :

Léo
4 ans

Parent :
"Léo a 39,7 depuis ce soir. Je ne sais pas si je dois m'inquiéter."

Seryne doit effectuer un interrogatoire ciblé.

Démontrer notamment :
- comportement / réactivité ;
- respiration ;
- hydratation ;
- urines si pertinent ;
- douleur importante ;
- lésions cutanées inhabituelles si pertinent ;
- durée/contexte ;
- température et qualité de la mesure.

Scénario de démonstration :
les réponses sont globalement rassurantes.

La synthèse doit expliquer POURQUOI.

Exemple :

"Plusieurs éléments sont plutôt rassurants actuellement.

Léo reste réactif, continue à boire et vous ne décrivez pas de difficulté respiratoire ni d'autre signe d'alerte identifié au cours de cet échange."

La température élevée seule ne doit pas être présentée comme déterminant automatiquement la gravité.

Puis :
- conseils généraux ;
- éléments à surveiller ;
- circonstances nécessitant un avis médical ;
- possibilité de refaire le point.

Proposer :

"Refaire le point dans 6 heures."

---

# 17. SCÉNARIO 2 — CÉPHALÉE DE CHLOÉ

Chloé
27 ans

Départ :

"J'ai très mal à la tête depuis environ une heure. Je voulais savoir si je peux attendre demain."

Seryne demande notamment :

"Est-ce un type de mal de tête que vous avez déjà eu ?"

Réponse :
Non.

Puis :

"La douleur est-elle apparue progressivement ou très brutalement ?"

Réponse :
Très brutalement.

À ce moment, Seryne détecte un élément important.

Elle peut répondre :

"Le caractère brutal et inhabituel de cette douleur est une information importante. J'ai besoin de vérifier quelques éléments avec vous."

Puis interrogatoire de sécurité préprogrammé.

Le scénario doit aboutir à la recommandation d'obtenir un avis médical urgent.

CONCLUSION :

ne PAS envoyer directement Chloé aux urgences.

Conseiller de contacter le 15 pour régulation médicale.

CTA :
"Appeler le 15"

---

# 18. SCÉNARIO 3 — DERMATOLOGIE / VARICELLE

Léo
4 ans

Parent :

"Léo a plein de boutons apparus depuis hier. Certains ressemblent à des petites cloques."

Seryne propose :

"Ajouter une photo"

Une photo fictive de démonstration peut être affichée.

Après analyse :

"Je distingue plusieurs lésions cutanées d'aspects différents. Une photo seule ne permet pas d'en déterminer précisément la cause. Je vais vous poser quelques questions."

L'interrogatoire doit explorer progressivement :

- date d'apparition ;
- évolution ;
- localisation initiale ;
- extension ;
- démangeaisons ;
- fièvre ;
- état général ;
- douleur ;
- exposition/contact pertinent ;
- traitements ou contexte particulier ;
- terrain à risque lorsque pertinent.

Pour la morphologie, rechercher si l'utilisateur observe simultanément plusieurs types/stades de lésions, par exemple :
- macules/taches ;
- papules/boutons en relief ;
- vésicules/petites cloques contenant du liquide ;
- croûtes ;
- éventuellement lésions devenant pustuleuses si cela est décrit.

Ne pas faire de la présence de tous ces stades une obligation artificielle.

Seryne peut poser une question visuelle accessible :

"Voyez-vous en même temps des boutons d'aspects différents : certains rouges et en relief, d'autres ressemblant à de petites cloques, et d'autres déjà en train de former une croûte ?"

Réponse du scénario :
Oui.

Autres réponses fictives :
- démangeaisons : oui ;
- fièvre modérée : oui ;
- Léo reste réactif ;
- il boit ;
- pas de difficulté respiratoire ;
- pas d'altération importante de l'état général.

Après recherche des situations nécessitant une attention particulière, la synthèse peut dire :

"Les éléments que vous décrivez peuvent notamment être compatibles avec une varicelle."

Puis expliquer les éléments qui vont dans ce sens :
- apparition par poussées ;
- lésions d'âges/aspects différents ;
- vésicules ;
- prurit ;
- contexte clinique compatible.

Mais rappeler :

"Une photo et un échange à distance ne permettent pas de confirmer à eux seuls la cause d'une éruption."

Puis :
- conseils généraux adaptés ;
- surveillance ;
- signes devant conduire à demander un avis médical ;
- possibilité de réévaluation.

---

# 19. NAVIGATION DU PROTOTYPE

Le prototype doit permettre de lancer les trois démonstrations :

1. Fièvre de Léo
2. Mal de tête de Chloé
3. Boutons de Léo

Ajouter un bouton permettant de revenir à l'accueil.

Le prototype doit être réellement cliquable.

---

# 20. OBJECTIF MARKETING

Ce prototype sera montré :
- à des associés ;
- à des partenaires potentiels ;
- dans des vidéos Instagram Reels ;
- dans des vidéos TikTok.

Il doit donc être VISUELLEMENT CRÉDIBLE.

Il doit donner l'impression d'un véritable produit en cours de développement et non d'une présentation PowerPoint.

Les interactions doivent être fluides et suffisamment rapides pour être filmées.

---

# 21. CONSIGNE POUR LE DÉVELOPPEMENT

Avant toute modification importante :

1. lire ce fichier ;
2. conserver les décisions produit existantes ;
3. ne pas inventer de nouvelle règle médicale ;
4. privilégier la cohérence globale ;
5. garder le code simple pour le prototype ;
6. utiliser HTML/CSS/JavaScript pour cette première version sauf instruction contraire.

Ne jamais transformer spontanément le prototype en application médicale de production.

Le moteur médical réel, la réglementation, la sécurité, les données personnelles, l'architecture backend et la validation clinique feront l'objet d'étapes séparées.