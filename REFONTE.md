# Landing ScopeKind — septembre 2026

## Version actuelle

HTML, CSS, JavaScript natifs et Worker Cloudflare conservés. Hero bleu roi préservé ; même symbole SVG bleu arrondi dans navigation, footer, favicon et interfaces de démonstration. Aucun framework, tracker ou service de messagerie ajouté.

Parcours : hero → Without / With ScopeKind → suggestions à relire → conversation et réponse client → exemples créatifs → bêta et FAQ.

## Scénarios et interactions

- **Poma** : logo, palette et mini-guide ; Alex approuve la direction minimaliste le 8 septembre. Morgan demande une piste illustrée et trois posts Instagram le 15, avant livraison le 18. La comparaison conserve exactement cette demande, les sources et la validation antérieure.
- **Suggestions** : trois cartes (direction approuvée, retours contradictoires, livrable supplémentaire). Titres arrière sélectionnables ; édition réelle ; validation préparant un instantané du texte. Sur mobile : une carte, précédent/suivant, compteur. Modifier une suggestion ne change pas rétroactivement le brouillon déjà préparé.
- **Conversation** : WhatsApp, Email et Instagram modifient la présentation du partage manuel, avec la même décision. Le lien ouvre la vue client ; sa réponse rejoint l’historique avec question, version et responsable de la prochaine étape. Direction et livrables supplémentaires sont séparés. Reset restaure l’exemple initial.
- **Sola** : demande de bouteille 250 ml après validation du format 500 ml. **Tempo** : deux interlocuteurs souhaitent des tons contradictoires. Grandes compositions CSS, marques fictives identifiées, sans image générée par IA.

## Fonctionnalités réelles et limites

Le formulaire bêta utilise réellement POST /api/pilot et Cloudflare D1 : email et consentement, qualification facultative ensuite. Une nouvelle demande minimale conserve les données existantes et la date initiale. Aucun email automatique.

Toutes les interactions projet sont des démonstrations locales en mémoire. Aucune analyse IA réelle, aucun message envoyé, aucune conversation synchronisée, aucun lien client partageable créé. Les intégrations directes sont indiquées comme prévues. Une demande d’estimation ne vaut pas accord sur un prix, un délai ou l’exécution du travail. Aucun prix ni gain chiffré inventé.

## Vérifications

- Cinq tests backend réussis, dont inscription minimale, qualification et conservation des champs existants dans SQLite.
- Syntaxe JavaScript, build, identifiants uniques, ancres, assets et préférence de réduction des mouvements vérifiés.
- Comparaison et deux exemples examinés à 390, 768 et 1440 px : aucun débordement horizontal détecté sur les douze combinaisons.
- Cartes, édition, brouillon préparé, trois canaux, validation du choix obligatoire, décisions distinctes, historique et Reset testés dans le navigateur.
- Visuels desktop/mobile inspectés ; CTA d’inscription, Escape et retour du focus vérifiés. Le formulaire conservé avait également été testé sur serveur mock (503 puis 201), sans fausse inscription en production.
- Contrastes principaux : bleu/blanc 5,69:1 ; texte secondaire/blanc cassé 5,50:1 ; texte principal/blanc cassé 14,40:1.
- Aucun avertissement ou erreur JavaScript pendant les essais de la démonstration.

## Hébergement

Site : https://scopekind.emmachataigner.workers.dev/

Sauvegarde de la version précédente dans backups/before-comparison. Les sauvegardes et scripts de vérification locaux ne sont pas déployés. Seuls les assets construits et le Worker existant sont publiés ; aucune migration D1 requise.

Publication vérifiée : version Cloudflare 27aa29fe-0805-4e6f-b7aa-bbd19936dde8. HTML, CSS, JavaScript et favicon répondent HTTP 200 et correspondent exactement au build local. Aucune erreur JavaScript sur la page publique.
