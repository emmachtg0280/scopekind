# ScopeKind

## Positionnement — septembre 2026

ScopeKind cible d'abord les freelance brand et graphic designers : clarifier le retour, expliquer la recommandation, garder la raison avec la décision et convenir de l'impact avant une révision. Voir [POSITIONNEMENT.md](POSITIONNEMENT.md) pour les six branches, le périmètre priorisé, les limites et les hypothèses marché.

Le parcours initial prévu comprend dès la V1 les retours groupés, l'assistance IA avec sources et relecture du designer, le suivi des demandes en attente, les liens entre versions et décisions et l'export récapitulatif. Le site présente cette cible produit ; aucune analyse IA réelle ni gestion de demandes projet n'est implémentée dans la landing page.

La landing page présente le projet fictif Poma : comparaison Without / With ScopeKind, trois suggestions éditables, partage manuel illustré et réponse client enregistrée dans un historique simulé. Sola et Tempo montrent des situations de packaging et de campagne social media. Les choix persistent durant la visite, avec Reset ; aucun envoi de données projet. Le formulaire d'invitation reste opérationnel ; « Graphic design » est désormais une discipline acceptée. L'hébergement Cloudflare existant et les données d'inscription sont conservés.

Landing page indépendante : HTML, CSS et JavaScript natifs, sans service Lovable ni dépendance frontend. Node.js 24+ pour les scripts ; Wrangler uniquement pour Cloudflare.

## Développement

```sh
pnpm install --frozen-lockfile
pnpm run dev
pnpm run lint
pnpm run test
pnpm run build
```

Ouvrir http://localhost:4173. Le serveur local enregistre les candidatures dans `.sites-runtime/pilot.sqlite` (ignoré par Git). Ces données de test ne sont jamais déployées.

## Cloudflare

Le Worker sert les fichiers de `dist/client` et traite `POST /api/pilot`. Les candidatures sont stockées dans une base D1 privée, une entrée par email normalisé. Une nouvelle soumission complète les champs non vides ; une demande minimale préserve les détails existants et la date initiale. Aucun email automatique n’est envoyé.

Première configuration, dans le compte Cloudflare propriétaire :

```sh
pnpm exec wrangler login
pnpm exec wrangler d1 create scopekind-pilot
pnpm exec wrangler d1 migrations apply scopekind-pilot --remote
pnpm run deploy:check
pnpm run deploy
```

La base est déjà créée et reliée dans wrangler.jsonc. Pour un nouveau compte, remplacer son database_id par celui retourné à la création. Les candidatures se consultent dans Cloudflare → D1 → scopekind-pilot → table pilot_applications. Aucun secret n’est inclus dans le navigateur ou le dépôt.

Le déploiement retourne une adresse workers.dev. Pour un domaine personnel, ajouter un Custom Domain dans Workers & Pages → scopekind → Settings → Domains & Routes après avoir ajouté le domaine au compte Cloudflare. Le sous-domaine lovable.app reste contrôlé par Lovable et ne peut pas servir de domaine Cloudflare autonome.

## Fichiers

- `src/index.html` : contenu, démonstration et formulaire.
- `src/styles.css` : styles et responsive.
- `src/app.js` : interactions accessibles et envoi du formulaire.
- `src/worker.js` : validation et stockage D1, pas de lecture publique des inscriptions.
- `wrangler.jsonc` : hébergement et liaison D1.
- `tests/pilot.test.mjs` : validation, origine et erreurs de stockage.

Les anciens fichiers importés sont conservés dans `backups/`, exclus de Git et du build. La démo produit est illustrative ; la landing page ne constitue pas une application de gestion de projets complète. Les polices sont chargées depuis Google Fonts avec des alternatives système.

## Déploiement actuel

https://scopekind.emmachataigner.workers.dev

Le site et le formulaire D1 ont été vérifiés en production. Le dépôt Git local ne possède pas encore de dépôt distant configuré.

## Refonte de septembre 2026

Voir [REFONTE.md](REFONTE.md) pour l’inspection, les références, les hypothèses et les priorités de connexion. Hero bleu roi, identité Poma développée, démo accessible sans compte, mémoire des décisions et travail supplémentaire, canaux à statuts explicites, bêta, FAQ. Les styles sont consolidés dans src/styles.css.

Le formulaire demande seulement email et consentement. Après confirmation serveur, discipline et difficulté sont facultatives. Les anciennes colonnes D1 sont conservées, sans migration. La démo n’analyse rien avec une IA réelle et ne partage aucun checkpoint réel.

