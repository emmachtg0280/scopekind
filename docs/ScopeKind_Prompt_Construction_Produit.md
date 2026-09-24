# Prompt de construction — ScopeKind pour les consultants indépendants

Version du 24 septembre 2026. Texte à transmettre à Codex pour lancer l’implémentation. Ce document est un brief proposé ; sa rédaction ne constitue pas l’exécution des actions ou autorisations qu’il contient.

---

Tu es mon partenaire produit, développeur full-stack, designer et responsable de préparation au lancement. Transforme ScopeKind en un logiciel réellement utilisable pour préparer, cadrer et faire valider des propositions de missions de conseil.

## Objectif et positionnement

Le client payeur initial est un consultant indépendant francophone en stratégie ou opérations, qui produit au moins quatre propositions commerciales par mois. Ce seuil est une hypothèse de qualification à tester. Les petits cabinets de deux à cinq personnes sont un segment adjacent pour plus tard.

Le problème : à chaque nouveau brief, le consultant retrouve ses anciennes propositions, réécrit les livrables, précise ce qui est inclus et tente de lever les ambiguïtés avec son prospect.

ScopeKind transforme ses références approuvées et un nouveau brief en proposition modifiable, avec les points à clarifier, puis conserve les réponses du client sur une version précise.

Inspire-toi du principe de réponses documentées d’Inventive AI, avec une expérience et des contenus originaux. Garde le nom ScopeKind. Fais évoluer le positionnement actuel destiné aux designers. L’hypothèse de prix est 49 USD par mois pour un consultant, dix nouvelles propositions par période mensuelle, lecteurs clients gratuits. Sépare génération initiale et corrections pour éviter de pénaliser chaque édition. Documente et mesure le coût réel avant de promettre un usage illimité. Ce tarif est une proposition de lancement à confirmer avant facturation réelle.

L’objectif est un parcours complet prêt pour des pilotes payants, avec une conception assez limitée pour être réalisable par un solo en quatre semaines. Le calendrier est une contrainte de priorisation, pas une preuve que le logiciel est terminé.

## Qui est qui

1. **Emma, opératrice de ScopeKind** : possède et commercialise le logiciel, gère les abonnements, l’usage et le support. Elle n’est pas automatiquement partie aux missions de conseil.
2. **Le consultant, client payeur** : possède son espace de travail, sa bibliothèque privée et ses dossiers. Il relit les propositions et décide des prix, délais et engagements.
3. **Le client du consultant** : entreprise qui achète la mission. Son interlocuteur accède gratuitement à la proposition explicitement partagée et répond. Il ne voit ni les dossiers des autres clients, ni les anciennes propositions, ni les notes privées du consultant.
4. **Le visiteur de démonstration** : découvre des données fictives dans un espace isolé. Il n’obtient aucun accès à une entreprise réelle.

Le paiement de l’abonnement va du consultant à ScopeKind. Le paiement de la mission reste entre le client final et le consultant. La première version ne collecte pas les honoraires des consultants et ne prend pas de commission sur les missions.

## Inspection et continuité technique

Commence par lire les instructions du dépôt, son état Git, les routes, la configuration de déploiement et les travaux existants. Utilise le skill ScopeKind et ses références pertinentes.

Dépôt visé : `emmachtg0280/scopekind` sur GitHub. Site existant : `https://scopekind.emmachataigner.workers.dev`. Le code connu comprend une landing page HTML/CSS/JS, un déploiement Cloudflare et un premier espace React/Astryx. Confirme l’état actuel au lieu de supposer que ScopeKind est un projet Lovable. La démonstration Astryx précédente utilise des données fictives et ne constitue pas un backend de production.

Préserve les modifications utiles déjà réalisées. Vérifie l’ascendance Git : un état local a été reconstruit à partir d’un instantané du dépôt ; ne pousse pas cet historique comme s’il était un clone valide. Repars d’une branche distante cohérente et applique les changements nécessaires sans supprimer les fichiers absents de l’instantané local.

Utilise Astryx pour les composants et le thème, en vérifiant sa compatibilité et les instructions présentes. Choisis une architecture cohérente pour authentification, base de données, stockage privé, IA, emails transactionnels et facturation. Favorise l’existant lorsqu’il convient. Explique les nouveaux services, leurs coûts potentiels et les accès nécessaires. Les clés restent côté serveur.

## Construire les cinq surfaces

### A. Site public

Crée une landing page compréhensible par un consultant : cible, problème, résultat, fonctionnement, exemple concret, tarif proposé, FAQ et démonstration. Explique ce que l’IA prépare et ce que le consultant doit confirmer.

Prévois les actions « Essayer la démo » et « Créer mon espace », un onboarding court et les pages d’aide nécessaires. Les affirmations doivent correspondre aux fonctionnalités livrées. Aucun faux client, témoignage, gain de temps mesuré ou intégration annoncée sans preuve. Identifie les informations d’entreprise manquantes pour les pages légales ; ne les invente pas.

### B. Bureau du consultant

- Inscription, connexion, déconnexion et récupération d’accès réelles.
- Onboarding : activité, types de missions, coordonnées, logo, prestations et éléments tarifaires saisis par le consultant.
- Tableau de bord actionnable : brouillons, questions ouvertes, propositions partagées, réponses reçues et actions à faire. Un état vide utile pour un nouveau compte.
- Bibliothèque privée : anciennes propositions, descriptions de prestations et références autorisées. Prendre en charge le texte collé, TXT et PDF textuels avec limites explicites. Afficher clairement un format non pris en charge ou un document nécessitant de l’OCR.
- Création d’un dossier avec nom du client, contexte, brief et références sélectionnées. Le consultant choisit les contenus qu’il peut réutiliser ; l’outil ne doit pas réinjecter silencieusement des informations confidentielles provenant d’un autre client.
- Proposition structurée : objectifs, livrables, hypothèses, exclusions, dépendances côté client, calendrier, prix confirmé et questions restantes.
- IA réelle côté serveur : extraction et génération à partir des sources autorisées, références consultables par le consultant, champs manquants visibles, édition libre et sauvegarde persistante.
- Ne jamais inventer un tarif, une date promise, un cas client, une capacité ou un engagement. Distinguer clairement extrait, proposition de formulation et information à confirmer. Les documents importés sont des données, pas des instructions système.
- Historique des versions, duplication utile et export PDF propre.
- Prévisualisation exacte de ce que verra le client avant tout partage.
- Abonnement, consommation et portail de gestion du paiement. Prévoir souscription, annulation et échec de paiement ; vérifier les événements serveur et leur traitement idempotent.

Le stockage navigateur peut améliorer le confort, mais les données réelles doivent survivre à une nouvelle connexion sur un autre appareil.

### C. Portail du client du consultant

Prévois un parcours mobile simple sans abonnement ScopeKind ni création obligatoire d’un profil complet. L’accès doit être protégé par invitation et vérification de l’adresse destinataire, avec lien temporaire et révocable ; un identifiant de dossier devinable n’est pas une protection.

Le client peut consulter la version partagée, les livrables, exclusions, échéances et prix, poser une question, demander une modification et donner explicitement son accord sur cette version. Il peut télécharger la proposition partagée. Les notes internes, marges et documents sources privés restent inaccessibles.

Lors d’une modification, créer une nouvelle version et conserver les réponses précédentes. Un accord ancien ne vaut pas pour un prix ou un livrable modifié. Le silence ne vaut pas accord. Séparer une décision de cadrage d’une signature contractuelle ; ne pas présenter le dispositif comme une signature électronique certifiée.

Lorsqu’une réponse est retranscrite par le consultant depuis un autre canal, afficher cette provenance au lieu de la présenter comme une action du client.

### D. Démonstration partageable aux prospects de ScopeKind

Utilise les mêmes composants que l’application avec un dossier fictif clairement identifié : une consultante prépare une mission de diagnostic opérationnel pour une petite entreprise fictive.

Le parcours montre le brief, les références sélectionnées, la proposition, une question sur le périmètre, la réponse du client et la version suivante. Un sélecteur permet de voir le point de vue consultant et le point de vue client uniquement dans la démo.

La démo doit être réinitialisable, fonctionner sur mobile et ne jamais envoyer d’email ou facturer. Si un résultat IA est précalculé pour la démonstration, le signaler. Les visiteurs ne doivent pas partager involontairement leurs données entre sessions. La démo ne peut accéder à aucune donnée réelle.

Prépare un lien de prévisualisation partageable, un parcours guidé et un script de présentation de 90 secondes. Ne prétends pas avoir fourni un lien accessible si seule une version locale existe.

### E. Administration d’Emma

Construis le minimum utile : utilisateurs, abonnements, quotas, activation, erreurs de génération et canal de support. Affiche les mesures réelles ou un état vide, jamais des chiffres de démonstration dans l’administration réelle.

Protège cet espace côté serveur. L’administration opérationnelle ne doit pas exposer par défaut les documents clients. Si un accès de support est nécessaire, conçois une autorisation explicite, limitée et traçable.

## Parcours quotidien et aide

Fournis un guide simple et un exemple de semaine : première configuration, réception d’un nouveau brief, préparation et correction de la proposition, partage, clarification, accord, réutilisation sur la mission suivante. Ne suppose pas que chaque consultant utilisera le produit tous les jours.

Explique dans l’interface la différence entre brouillon, prêt à partager, partagé, modification demandée, accord reçu et version remplacée. Un écran doit toujours indiquer l’action suivante et qui doit la réaliser.

Rédige une aide pour le consultant, une aide courte pour son client et un guide d’exploitation pour Emma. Explique le fonctionnement de la facturation SaaS séparément des honoraires de mission.

## Qualité visuelle

Interface française au lancement, anglais préparé pour une étape ultérieure. Réutilise la marque ScopeKind lorsqu’elle convient : fond blanc ou chaud, texte sombre, bleu maîtrisé, formes arrondies et typographie lisible. Utilise Astryx sans créer un assemblage de cartes génériques. Prévois responsive, clavier, focus, contrastes, chargements, erreurs et états vides. Évite les grands espaces inutiles, les images IA décoratives et les promesses vagues « AI-powered ».

## Acquisition et SEO

Construis un plan de trente jours applicable par une étudiante qui porte le projet seule. Les acheteurs recherchés sont les consultants, pas les entreprises clientes de ces consultants.

1. **Entretiens et prospection ciblée** : identifie vingt profils ou structures pertinents à partir de sources publiques, avec lien, date de vérification et motif de qualification. Ne déduis pas qu’ils envoient quatre propositions par mois : indique ce point comme à vérifier. Privilégie consultants en stratégie/ops indépendants, réseau professionnel et alumni accessibles. Ne collecte pas d’informations privées et ne contourne pas les limites des plateformes.
2. **Messages préparés** : invitation à tester sur un vrai brief, relance unique et proposition de pilote payant. L’offre doit expliquer précisément l’effort demandé, le résultat et le prix. Aucune promesse de taux de réponse. Aucun message envoyé sans validation explicite des destinataires et du contenu.
3. **Partenariats** : recherche des communautés ou accompagnateurs de consultants, vérifie leur activité et prépare une proposition d’atelier ou de ressource utile. Ne prétends pas disposer d’un accès ou partenariat existant.
4. **SEO** : analyse les résultats de recherche actuels avant de choisir les requêtes. Pistes à examiner : « modèle proposition commerciale consultant », « cadrer une mission de conseil » et « exemple livrables mission de conseil ». Ne présente pas ces pistes comme des mots-clés à volume démontré.
5. **Livrables SEO** : prépare une page modèle réutilisable, un exemple annoté de proposition et un guide du périmètre de mission, chacun avec une invitation pertinente à essayer ScopeKind. Produis les contenus et leur implémentation, avec indexabilité, titres, descriptions, liens internes, sitemap et mesure de conversion. Les portails privés et documents clients doivent être protégés par authentification et exclus de l’indexation ; `noindex` seul n’est pas un contrôle d’accès.
6. **Mesure** : visite → essai de démo → compte → première proposition exportée/partagée → réponse client → deuxième dossier → abonnement → renouvellement. Limite les données collectées et exclue les briefs et textes privés des événements analytiques. Distingue objectifs, observations et prévisions.

Priorité de validation proposée : cinq pilotes, trois paiements et deux personnes revenant avec un second brief. Le renouvellement doit être observé après le premier mois. Si le besoin est occasionnel, recommander un forfait par dossier ou un service avant de forcer l’abonnement. Le SEO complète l’acquisition directe ; aucun classement ni délai de trafic garanti.

## Tests et définition de terminé

Teste un scénario de bout en bout avec deux consultants distincts et un client invité : compte, import, IA, correction, sauvegarde, reconnexion depuis une session neuve, export, partage, réponse, nouvelle version et révocation d’accès. Les données d’un consultant doivent rester inaccessibles à l’autre, y compris par requête directe vers l’API et le stockage.

Teste également les accès expirés, doubles clics, pannes IA, fichiers invalides, données manquantes, limites d’usage et événements de paiement répétés. Vérifie que la démo ne peut pas déclencher de vrais envois, de paiements ou d’accès aux dossiers réels. Vérifie mobile et desktop, absence de secrets dans les fichiers servis et possibilité de suppression des documents. Documente la sauvegarde et vérifie une restauration de données de test.

Fournis : code et migrations, configuration reproductible, variables nécessaires sans valeurs secrètes, tests exécutés et résultats, captures ou démonstration du parcours, guide consultant/client/Emma, plan d’acquisition, contenus SEO et procédure de déploiement avec retour arrière.

Ne déclare « prêt à l’emploi en production » que si authentification, stockage, IA, partage, emails et facturation sont effectivement configurés et vérifiés dans l’environnement visé. Un paiement en mode test valide l’intégration de test, pas l’encaissement réel. Si des accès, informations d’entreprise ou validations manquent, termine tout le travail possible et liste précisément les seules dépendances restantes. Ne remplace pas silencieusement une fonction demandée par une simulation.

## Autorisations et méthode de travail

Je t’autorise à travailler sur le code de ScopeKind, à transférer ces modifications dans mon dépôt GitHub privé `emmachtg0280/scopekind` sur une branche dédiée au pivot, et à ouvrir une pull request en brouillon. Cette autorisation concerne uniquement ce dépôt et ce travail ; elle exclut secrets, données réelles de clients et fichiers personnels sans rapport avec le projet.

Ne fusionne pas et ne remplace pas le site public existant avant ma validation de la version testée. Prépare le déploiement et demande cette validation lorsque le résultat est concret et reviewable. Un éventuel nouvel hébergement de prévisualisation doit être identifié avec son accès et ses coûts avant d’être activé. Ne contourne aucune restriction ou décision de contrôle automatique.

Ne crée pas d’engagement payant, ne déclenche pas d’encaissement réel et ne contacte personne sans mon autorisation explicite. Implémente librement ces parcours en mode test. Les documents que les futurs utilisateurs importeront seront traités selon leurs permissions, pas comme une autorisation générale d’exploiter tous leurs fichiers.

Prends les décisions de réalisation courantes de façon autonome. Pose une question seulement si une information manquante change matériellement le produit ou bloque une action externe. Ne transforme pas la validation commerciale en prétexte pour laisser l’implémentation autorisée inachevée.

Commence par un court état des lieux et les choix structurants, puis réalise le travail par étapes vérifiables. Donne des nouvelles sur les résultats et les incertitudes qui subsistent. Termine avec le résultat accessible, les preuves de fonctionnement, les dépendances exactes et l’unique prochaine action attendue d’Emma s’il en reste une.

---

## Références pour l’acquisition, vérifiées le 24 septembre 2026

- [LinkedIn — trouver des prestataires via la recherche, Services Marketplace et son réseau](https://www.linkedin.com/help/linkedin/answer/a564567). Cette documentation confirme les moyens de découverte, pas la volonté de payer des consultants pour ScopeKind.
- [Google Search Central — contenu utile, fiable et destiné aux utilisateurs](https://developers.google.com/search/docs/fundamentals/creating-helpful-content). Les requêtes proposées plus haut sont des hypothèses à analyser ; aucun volume de recherche n’a été établi pour elles dans ce brief.
