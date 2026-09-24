# Relais de construction pour Codex

État au 24 septembre 2026. Ce dépôt contient la base React/Astryx et le cahier des charges. Il ne dépend pas d'un accès à la conversation ChatGPT, à son espace React ou à ses fichiers temporaires.

## Mission et ordre de lecture

Emma demande à Codex de réaliser le pivot complet de ScopeKind vers un assistant de propositions commerciales et de cadrage pour consultants indépendants en stratégie et opérations. Le consultant paie l'abonnement ; son client consulte et répond gratuitement ; Emma exploite le SaaS.

1. Lire `AGENTS.md`, puis ce document.
2. Lire intégralement `docs/ScopeKind_Prompt_Construction_Produit.md` : c'est le périmètre produit accepté par Emma dans la conversation.
3. Inspecter les fichiers et les branches actuelles avant toute modification. Préserver le travail utile ; ne pas écraser un autre chantier.

La dernière demande d'Emma est de confier la construction à Codex et de lui transmettre directement le contexte. Continuer l'implémentation, pas seulement rédiger un plan. Une limite de session ne rend pas le périmètre terminé : consigner le point de reprise et les travaux restants.

## Ce qui est réellement disponible

| Chemin | Rôle et limites |
| --- | --- |
| `src/workspace/main.jsx` | Interface React 19 utilisant Astryx : espace de retours client de démonstration, navigation, filtres, édition et aperçu client. À faire pivoter. |
| `src/workspace/model.mjs` | Modèle de la démo, données fictives, persistance navigateur et export. Ce n'est pas un modèle multiutilisateur sécurisé. |
| `src/workspace/theme.js` | Thème Astryx existant à réutiliser et faire évoluer. |
| `src/workspace.html` | Point d'entrée HTML de React. |
| `scripts/build-workspace.mjs` | Compilation React/Astryx avec esbuild, styles et polices embarqués. |
| `scripts/export-workspace.mjs` | Export de la démo en HTML autonome. |
| `src/index.html`, `src/app.js`, styles associés | Ancien site public orienté designers : préserver les éléments utiles puis changer le positionnement. |
| `src/worker.js`, `migrations/0001_pilot.sql` | API Cloudflare/D1 du formulaire pilote existant. Aucun backend SaaS complet ici. |
| `scripts/dev.mjs` | Serveur Node local, SQLite locale pour le pilote et compilation initiale du workspace. |
| `tests/pilot.test.mjs`, `tests/workspace.test.mjs` | Tests existants ; ils ne prouvent pas le fonctionnement du futur SaaS. |
| `wrangler.jsonc` | Configuration du déploiement existant. Inspecter avant usage. |

Cette copie n'est pas un projet Lovable. Il n'y a pas besoin d'ouvrir Astryx dans un navigateur pour coder : ses composants et sa CLI sont installés par pnpm et documentés dans `AGENTS.md`.

La démonstration actuelle fonctionne avec des données fictives et du localStorage. Authentification réelle, bibliothèques privées, génération IA réelle, versions serveur, portail sécurisé, abonnement, administration et nouveaux guides restent à construire. Ne jamais annoncer ces fonctionnalités comme opérationnelles sur la seule base de cette démo.

## Récupérer le bon code

Dépôt privé : `emmachtg0280/scopekind`.
Branche de relais : `codex/consultant-proposals`.
Base de la PR : `codex/initial-site`.

Dans un checkout propre, récupérer la branche distante :

```bash
git fetch origin
git switch --track origin/codex/consultant-proposals
```

Si la branche locale existe déjà, utiliser `git switch codex/consultant-proposals` puis vérifier son écart avec la branche distante. Ne pas réinitialiser de travail non sauvegardé. Si une tâche Codex a déjà ouvert une branche dédiée pour cette PR, conserver cette branche et s'assurer qu'elle contient le relais.

Un ancien dossier de travail avait été reconstruit depuis un instantané avec une ascendance locale distincte. Le transfert de relais est appliqué sur le véritable commit GitHub `6a7c54d0d4452eef82f5e756394de8fa1668439d`, en conservant les fichiers distants. Un nouveau clone GitHub de cette branche est la référence ; ne pas importer l'ancien historique local ni forcer un push.

## Installer et lancer

Environnement vérifié : Node 24.19 et pnpm 11.19. Node doit fournir `node:sqlite` pour le serveur local existant.

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm lint
pnpm build
pnpm dev
```

Ouvrir `http://localhost:4173/` et `http://localhost:4173/workspace.html`.
Le serveur écoute actuellement sur `127.0.0.1`. Une prévisualisation distante peut nécessiter une adaptation explicite de l'adresse d'écoute, selon l'environnement Codex. `pnpm dev` compile le workspace au démarrage : le relancer après un changement de JSX. Ce projet n'a pas de rechargement Vite implicite.

```bash
pnpm preview:export
```

Cette dernière commande produit `.sites-runtime/preview/ScopeKind_Astryx.html`, une démonstration autonome, pas un SaaS publié. Aucun fichier compilé, node_modules, secret ou base SQLite ne doit être ajouté au dépôt.

Avant toute nouvelle interface :

```bash
pnpm exec astryx build "consultant proposal workspace, private references, client approval portal and admin"
pnpm exec astryx docs layout
pnpm exec astryx docs tokens
pnpm exec astryx component AppShell
```

Lire ensuite l'API de chaque composant réellement utilisé. Conserver le reset et les styles Astryx déjà importés ; mettre les couleurs de marque dans le thème. Respecter les instructions Astryx de `AGENTS.md`.

## Piste d'identité, sans adoption définitive

La demande la plus récente demande aussi une piste de changement de nom. Elle complète la phrase du brief initial qui demandait de conserver ScopeKind.

Piste proposée : **Accordraft**, associant le brouillon à l'accord sur le périmètre. C'est une hypothèse de nom, sans vérification définitive de marque ou de domaine, ni validation finale d'Emma. Conserver les identifiants techniques ScopeKind pendant l'exploration et centraliser le nom affiché pour permettre un changement simple.

Direction visuelle à explorer avec Astryx : ivoire, encre, bleu franc, accents citron, deux cadres qui se rejoignent pour le symbole. Réutiliser DM Sans et Space Grotesk si leur rendu convient. Garder les écrans de travail lisibles, les tableaux denses sous forme de lignes et les états clairement distingués. Préparer une proposition visuelle vérifiable dans la démo, sans acheter de domaine ni présenter le nom comme définitivement choisi.

## Parcours à construire et preuves attendues

Implémenter par étapes vérifiables, avec commits lisibles et un état d'avancement dans `docs/IMPLEMENTATION_STATUS.md` :

1. Architecture et comptes : persistance serveur, propriétaire de chaque ressource, séparation entre deux consultants, stockage privé, stratégie de migration et de sauvegarde.
2. Parcours consultant : références sélectionnées, brief, vraie génération serveur fondée sur ces références, édition, sauvegarde, versions immuables, export. Prix et délais confirmés par l'humain.
3. Parcours client : invitation limitée à un destinataire et à un document, vérification d'accès, expiration/révocation, réponses et accord liés à une version précise. Une version modifiée nécessite un nouvel accord. Aucun accès aux notes internes ou aux documents sources.
4. Démo isolée et site public : données fictives, remise à zéro, changement de rôle uniquement dans la démo ; IA précalculée explicitement indiquée si utilisée.
5. Facturation test et administration : webhooks signés et idempotents, droits serveur, quotas, activation et support. L'administratrice n'accède pas automatiquement aux documents privés.
6. Exploitation et acquisition : guides pour les trois rôles, configuration, sauvegarde/restauration, 20 prospects publics qualifiés avec sources, messages préparés sans envoi et 3 contenus SEO utiles conformément au brief.

Pour chaque étape, indiquer ce qui fonctionne, le test reproductible, ce qui est simulé et ce qui attend un accès externe. Finir tout ce qui est possible sans les accès manquants. Éviter une réécriture de stack sans motif concret ; Cloudflare, D1 et React existent déjà mais leur adéquation doit être évaluée.

Le rapport final doit distinguer tests locaux, tests avec services de test réels et contrôles non exécutés. Tester deux consultants et un client, séparation API/stockage, sauvegarde après reconnexion, versions et réponses, liens expirés/révoqués, double clic, échec IA, quota et répétition des webhooks. Ajouter captures et instructions de reproduction. Les 9 tests historiques ne couvrent pas ces exigences.

## Configurations et autorisations

Lors de la préparation de ce relais, aucune clé d'IA, d'email, de Stripe ou d'administration Cloudflare n'était disponible dans l'environnement de travail. Ce constat ne signifie pas que les comptes d'Emma n'existent pas. Inspecter seulement la configuration nécessaire, sans afficher les valeurs de secrets.

Préparer un fichier d'exemple sans secrets et la liste exacte des paramètres requis : fournisseur IA et modèle côté serveur, stockage et base de test, email transactionnel et expéditeur vérifié, clés Stripe de test/prix/webhook, origine de l'application et configuration des comptes administrateurs. Choisir et documenter les noms de variables selon l'implémentation retenue. Les secrets sont à injecter par les paramètres sécurisés de l'environnement ; jamais dans Git, une PR ou une réponse utilisateur.

Emma autorise les modifications de code dans ce dépôt privé sur une branche dédiée et une PR en brouillon. Elle demande de préparer une version testée avant sa validation finale de production. Elle exclut les secrets et les données réelles de clients du transfert. Aucun paiement réel, nouvel engagement payant, achat de domaine, message à un prospect, fusion ou mise en production n'est autorisé par ce relais.

Ne pas exécuter `pnpm deploy` ni une migration distante de la base existante. Utiliser des données fictives et une base de développement/test isolée. Une prévisualisation hébergée doit être explicitement séparée de la production ; identifier son accès et ses coûts avant de l'activer. Ne pas transformer une API absente en faux succès : afficher l'état de configuration et l'erreur honnêtement.

## Coordination

Utiliser la PR comme fil de suivi : résumé d'étape, commits, résultats de tests, limites et configurations demandées. Le dépôt contient tout le contexte nécessaire. Ne pas attendre un accès à un « espace React » externe. Si Codex ne dispose pas d'un skill cité dans le brief, les exigences écrites ici et dans le cahier des charges restent utilisables ; signaler l'absence sans inventer son contenu.

Cette passation prépare la construction. Elle ne constitue ni un lancement du produit final, ni une validation de production.
