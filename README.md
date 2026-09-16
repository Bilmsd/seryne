# seryne — Prototype mobile

Accueil et entrée dans une conversation, en HTML, CSS et JavaScript, sans dépendance externe. `SERYNE_PROJECT.md` est la référence du projet.

## Aperçu local

Depuis le terminal de Visual Studio Code, dans ce dossier :

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Ouvrir http://127.0.0.1:4173 dans un navigateur. Activer le mode appareil des outils de développement et choisir une largeur de **390 px**. Arrêter le serveur avec `Ctrl+C`.

Le fichier `index.html` peut aussi s’ouvrir directement, ou avec l’extension Live Server de Visual Studio Code.

## Cette version

- Accueil mobile adaptatif, identité vectorielle locale, profils fictifs de Léo, Chloé et Adam.
- Bouton principal ouvrant une conversation pour le profil sélectionné ; sélection préalable proposée si nécessaire.
- Saisie libre, envoi par bouton ou Entrée (Maj+Entrée pour un saut de ligne), réponse après 800 ms.
- Reconnaissance de trois entrées : fièvre ou peau pour Léo, mal de tête pour Chloé.
- Parcours fièvre de Léo : dix étapes conversationnelles, branches de prudence, aides pédagogiques, synthèse et simulation de réévaluation.
- Céphalée de Chloé et éruption de Léo restent limitées à leur première réponse. Adam dispose d’un parcours dermatologique indépendant, décrit ci-dessous. Caméra, galerie et illustrations réalistes restent à intégrer.
- État temporaire en mémoire uniquement : aucune donnée envoyée ou persistée, aucune notification réelle, aucune ressource distante.

`styles.css` contient l’identité visuelle et les adaptations mobiles. `app.js` gère l’accueil. `conversation.js` gère l’écran de messagerie et son cycle d’envoi. `scenarios.js` contient le registre des entrées de démonstration. Le logo est dans `assets/seryne.svg`.


## Parcours fièvre

`fever-data.js` sépare questions, options, branches, données déclarées et conditions du chemin de démonstration. `fever-flow.js` gère les choix, formulaires courts, fiches, synthèse et suivi. La synthèse fournie est réservée au chemin décrit (39,7 °C, début ce soir, nez encombré et petite toux, réponses de sécurité compatibles, méthode connue, profil confirmé). Les autres combinaisons suspendent le parcours ou affichent que leur synthèse n’est pas disponible. Ce filtrage limite le contenu préprogrammé ; il ne constitue pas une règle de décision médicale.

Une réponse préoccupante ou inconnue est conservée dans l’historique. « Revenir au scénario » permet de **répondre de nouveau à la même question** et ne contourne pas la suspension. Le bouton « Quelque chose a changé » consigne le texte sans interprétation ; un changement signalé avant la synthèse empêche d’afficher la conclusion préprogrammée.

Les fiches respiratoires et de lavage nasal sont des emplacements pour des photos ou animations réalistes. Elles ne simulent pas un contenu visuel validé. La mini-branche de vitropression est active : les taches déclarées persistantes à la pression interrompent le parcours et proposent de contacter le 15. Les visuels restent des placeholders.

## Vérification dans le navigateur

Ouvrir http://127.0.0.1:4173/tests/fever.html : le test exécute réellement les clics dans une fenêtre de 390 × 844 px et affiche son résultat. Il couvre le parcours principal, les aides, les réponses incertaines/préoccupantes, les corrections, les données manquantes et le suivi. Cette vérification teste le prototype logiciel, pas la validité clinique des contenus.

Pour une démonstration manuelle : sélectionner Léo, commencer une conversation et écrire « Léo a 39,7 depuis ce soir, il est enrhumé et tousse un peu. » Choisir ensuite : fatigué mais réactif, respiration habituelle, boit régulièrement, urines normales, pas d’éruption, aucun des autres éléments, nez bouché et petite toux, début confirmé, méthode de mesure puis profil à jour.


## Séquence de sécurité enrichie

- Respiration perçue comme rapide : question sur les efforts visibles, sans assimilation automatique à une détresse. L’aide respiratoire propose un seul CTA de retour.
- Hydratation : vomissements avec ou sans liquides conservés distingués ; lecture commune avec les urines, en conservant les inconnues.
- Peau : aspect, évolution et, lorsque pertinent, réponse à la pression ; photo simulée sans fichier ni analyse. Des taches persistantes à la pression orientent vers le 15 sans diagnostic.
- Autres signes : texte immédiat pour une autre inquiétude, questions distinctes pour vomissements, douleur, convulsion et comportement. Les réponses multiples sont conservées séparément.
- Questions terminées compactées avec la réponse déclarée ; anciennes actions désactivées. Les branches incomplètes restent suspendues et ne rejoignent pas silencieusement la synthèse rassurante.

La règle de démonstration relative aux taches persistantes et à l’appel au 15 a également été vérifiée auprès de l’Assurance Maladie : https://www.ameli.fr/assure/sante/themes/meningite-aigue/symptomes-diagnostic-evolution. Le prototype n’affiche pas de diagnostic.


## Mémoire de l’épisode et questions dynamiques

`episode.js` fournit un mécanisme partagé : extraction déterministe → faits déclarés avec provenance et historique → préparation des questions selon leurs champs requis. Le registre couvre les symptômes du scénario, la température, le début de la fièvre et la méthode de mesure. Il ne comprend pas arbitrairement tout le langage naturel.

Les messages précédant le démarrage et les textes saisis ensuite alimentent la même mémoire ; les choix structurés utilisent des effets déclaratifs. Les faits connus, présents comme explicitement absents, sont retirés des options à renseigner. Les ambiguïtés et contradictions restent à préciser. Les questions de sécurité portent une politique explicite de confirmation et restent posées. Le début et la méthode de mesure ne sont redemandés que s’ils manquent ou sont ambigus.

L’étape des symptômes rappelle les informations positives déjà obtenues et propose « Rien d’autre remarqué ». Cette réponse porte uniquement sur les options restantes et ne supprime pas les symptômes connus. Les options non cochées ne deviennent pas automatiquement des données négatives.

Tests de mémoire : http://127.0.0.1:4173/tests/episode.html. Tests du parcours complet : http://127.0.0.1:4173/tests/fever.html.


## Aide de sécurité depuis la synthèse

« Quand faut-il demander de l’aide ? » ouvre une modale indépendante avec six repères : comportement, respiration, hydratation, peau, convulsion et dégradation. Une zone distincte indique de demander une aide urgente en présence d’un signe grave, avec liens d’appel au 15 et au 112.

Les fiches respiratoire et de vitropression existantes s’ouvrent au-dessus de cette modale. Leur fermeture retrouve la modale de sécurité ; « Revenir au point sur Léo » restaure la synthèse à sa position de lecture, sans reconstruire ni modifier l’épisode.

Les illustrations du tirage, du balancement thoraco-abdominal, des autres efforts respiratoires, de la vitropression et du lavage nasal/DRP restent des **placeholders identifiés**. Les médias à intégrer devront être des images ou animations entièrement réalistes, validées séparément, jamais des schémas abstraits destinés à remplacer la reconnaissance d’un signe ou d’un geste.

La simulation de réévaluation conserve le questionnaire antérieur et ajoute la réponse Mieux/Pareil/Moins bien/Nouveau symptôme à l’état structuré (`followup.evolution`) avec sa provenance. Les branches médicales suivantes ne sont pas développées.

## Parcours dermatologique d’Adam

Accès direct : http://127.0.0.1:4173/?profile=adam. Adam, 28 ans, est également sélectionnable sur l’accueil.

Message de démonstration : « J’ai cette plaque depuis quelques jours, elle s’agrandit et ça commence vraiment à me faire flipper. Je trouve aucun rendez-vous. Vous pouvez regarder ? » Puis ajouter la photo locale et choisir : « Ça démange un peu », « Je me sens normalement », « Non, rien de particulier ». La synthèse propose surveillance, modale d’avis médical et simulation de suivi déclaratif à 48 h, sans nouvelle photo ni notification réelle.

`adam-data.js` contient les données et l’extraction ciblée du contexte initial. `adam-flow.js` gère le parcours et une instance d’épisode distincte. `profile-flows.js` relie le contrôleur au profil par un registre ; `conversation.js` conserve le parcours existant comme fonctionnement par défaut. `adam.css` ajoute uniquement les styles Adam et la troisième colonne de profils. Les fichiers du parcours Léo restent inchangés.

**Photo choisie sur l’appareil** : le bouton et l’icône photo d’Adam ouvrent le sélecteur d’images. Toute image décodable par le navigateur peut illustrer la démonstration. Elle s’affiche via une URL locale temporaire, libérée en quittant l’épisode ; aucun fichier n’est téléversé ou persisté. La sélection ajoute seulement une miniature au brouillon et conserve le texte saisi. La pièce jointe peut être retirée ; annuler ou retirer ne déclenche rien. Seul Envoyer avec un texte non vide et une image chargée publie un message multimodal et lance `simulatePhotoReview` : transition d’une seconde puis réponse préprogrammée, indépendamment du contenu de l’image. Un texte envoyé seul est conservé dans le contexte et laisse la saisie ouverte pour un envoi ultérieur avec photo. Une photo seule ne peut pas être envoyée. Aucune analyse réelle n’a lieu et `lesion-placeholder.svg` n’est plus utilisé par le parcours. Les questions, la synthèse, la modale et le suivi restent inchangés.

L’extraction reconnaît un vocabulaire limité pour les quatre informations du message d’exemple et certaines réponses explicites aux trois questions. Une réponse connue est réutilisée ; des déclarations contradictoires restent à préciser. Ce mécanisme n’est pas une compréhension générale du langage naturel. Les réponses hors du chemin nominal sont conservées et suspendent la synthèse, avec possibilité de corriger sa réponse. La suite clinique de ces branches et de la réévaluation reste à développer.

Tests : http://127.0.0.1:4173/tests/adam.html — parcours nominal, image locale, modales, suivi, réponses alternatives, séparation des épisodes et réinitialisation à 390 px. Les suites Léo et mémoire restent disponibles aux adresses indiquées plus haut.
