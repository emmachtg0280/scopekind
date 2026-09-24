# Sestet — livraison et exploitation

Sestet aide les consultants indépendants en stratégie et opérations à préparer une proposition, clarifier les conditions et conserver une réponse sur une version précise. La marque vise un public international ; cette première interface est en français.

## État réel

- Site public et démo fictive : publication sur le Worker `sestet`.
- Comptes : code serveur implémenté, inscriptions fermées sur le site public.
- Connexion : lien à usage unique, email vérifié, cookies HttpOnly ; testée localement avec une boîte interceptée et des adresses .test.
- Bibliothèque : texte collé, TXT et extraction PDF textuel côté navigateur ; 5 Mo, 40 pages et 50 000 caractères. Le fichier original n’est pas conservé. Pas d’OCR.
- Dossiers : sauvegarde serveur, références explicitement sélectionnées, édition, aperçu, impression PDF, versions et invitations révocables.
- IA : adaptateur OpenAI Responses structuré, prix et calendrier exclus des champs générés, extraits exacts contrôlés. Aucun appel à un modèle réel validé dans cette livraison.
- Paiement : Stripe **test uniquement**, webhooks signés et idempotents. Aucun abonnement ni encaissement réel activé.
- Administration : réservée aux adresses vérifiées configurées, métriques et support ; aucune route admin donnant accès aux documents.
- Le dépôt GitHub est public. Les clés, bases locales, boîtes fictives et la liste de prospection restent hors du dépôt.

La publication de la démo ne signifie pas que le SaaS payant est ouvert. Les intégrations réelles, les informations d’exploitation et les essais complets avec les fournisseurs restent nécessaires avant ouverture.

## Parcours consultant

1. Demander un lien de connexion ; pour récupérer son accès, demander un nouveau lien. Il expire après quinze minutes et ne fonctionne qu’une fois.
2. Renseigner nom professionnel, coordonnées, prestations, repères tarifaires privés et éventuellement un logo. Ces informations sont copiées dans les nouveaux dossiers.
3. Ajouter seulement des références que l’on est autorisé à réutiliser. Choisir au maximum cinq références par dossier. Une référence supprimée ne retire pas les extraits déjà conservés dans les versions existantes.
4. Créer un dossier avec le brief ; rédiger manuellement ou, lorsque configuré et autorisé par l’abonnement test, demander une préparation. Les sources ne garantissent pas que chaque formulation soit correcte : relire.
5. Lever les points ouverts, confirmer explicitement prix et calendrier, enregistrer puis ouvrir l’aperçu client.
6. Inviter l’adresse exacte du client. L’invitation dure sept jours ; la session du client une heure. Révoquer coupe également une session ouverte.
7. Lire les réponses et créer une nouvelle version si nécessaire. Une version partagée est figée ; aucun accord n’est transféré. Une réponse reçue ailleurs peut être retranscrite, avec cette provenance visible.
8. Imprimer l’aperçu en PDF. Supprimer un dossier révoque son accès ; supprimer l’espace nécessite d’abord l’annulation de l’abonnement.

## Parcours client

Ouvrir l’invitation et demander un lien à l’adresse invitée. Confirmer sa session, relire le document, poser une question, demander une modification ou cocher l’accord explicite. Aucun abonnement client. Aucune référence source ni note privée. Le parcours conserve une réponse de cadrage et ne constitue pas une signature électronique certifiée.

## Démo de 90 secondes

- 0–15 s : « Voici Sestet. Prenons une mission fictive de diagnostic opérationnel. »
- 15–30 s : montrer le brief, les deux références autorisées et les exclusions.
- 30–45 s : montrer les questions ouvertes et les conditions à confirmer ; renseigner les conditions fictives.
- 45–60 s : ouvrir l’aperçu client et simuler le partage. Préciser que rien n’est envoyé.
- 60–75 s : passer côté client, demander une modification ou donner l’accord explicite.
- 75–90 s : revenir côté consultant, créer une nouvelle version et montrer que l’accord précédent reste attaché à la première.

## Développement

Node 24 et pnpm ; installer depuis le lockfile. Deux terminaux :

```sh
pnpm install --frozen-lockfile
pnpm run dev:api
pnpm run dev:product
```

Ouvrir http://127.0.0.1:4180. La boîte locale http://127.0.0.1:4181/_test-mailbox intercepte les messages et accepte seulement des adresses .test. Elle ne fait pas partie du Worker déployé. Ne jamais exposer ce serveur de développement sur Internet.

```sh
node --test tests/*.test.mjs
pnpm run build:product
pnpm run deploy:product:check
```

## Configuration de l’hébergement

`wrangler.sestet.jsonc` lie le Worker à sa base D1 indépendante. L’ancienne base `scopekind-pilot` est conservée. Ne pas réutiliser sa liaison pour les dossiers.

Variables non secrètes : APP_ORIGIN exact, SIGNUPS_ENABLED (false par défaut), OPENAI_MODEL explicitement choisi et compatible avec Structured Outputs, MAIL_FROM vérifié, ADMIN_EMAILS, SUPPORT_EMAIL, STRIPE_PRICE_ID test.

Secrets serveur à fournir par le gestionnaire de secrets Cloudflare ou `wrangler secret put --config wrangler.sestet.jsonc NOM` : RESEND_API_KEY, OPENAI_API_KEY, STRIPE_SECRET_KEY (sk_test_ uniquement), STRIPE_WEBHOOK_SECRET. Ne jamais les placer dans le frontend, Git, un message ou une capture d’écran.

Ordre d’ouverture :

1. Finaliser identité de l’exploitante, support, conditions, durées de conservation et informations de confidentialité.
2. Vérifier un expéditeur email et tester délivrabilité, expiration et récupération sur un environnement contrôlé.
3. Configurer le modèle ; mesurer qualité, latence, tokens et coût réel sur des dossiers synthétiques. Les journaux stockent les tokens, pas un coût monétaire inventé.
4. Configurer un prix Stripe test de 49 USD par mois, dix préparations initiales et trois corrections IA par dossier et période. Tester Checkout, portail, annulation, échec de paiement et événements réordonnés sur le vrai sandbox Stripe. Le code rejette les clés et événements live.
5. Tester deux comptes et un invité sur l’hébergement final. Vérifier isolation, suppression, PDF, mobile et restauration D1.
6. Activer SIGNUPS_ENABLED seulement après ces vérifications. L’activation de paiements réels est une évolution séparée.

Documentation fournisseurs : [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [Resend Send Email](https://resend.com/docs/api-reference/emails/send-email), [Stripe Checkout](https://docs.stripe.com/api/checkout/sessions/create), [Stripe webhooks](https://docs.stripe.com/webhooks).

## Déploiement, migrations et retour arrière

```sh
pnpm run build:product
pnpm exec wrangler d1 migrations apply sestet-private --remote --config wrangler.sestet.jsonc
pnpm exec wrangler deploy --config wrangler.sestet.jsonc
```

Vérifier la page d’accueil, la démo, les trois ressources et /api/v1/config. Vérifier qu’une lecture de dossiers sans session retourne 401. La boîte locale doit être absente des routes déployées.

Déployer la redirection **après** la vérification de Sestet :

```sh
pnpm exec wrangler deploy --config wrangler.redirect.jsonc
```

La redirection 307 sans cache est réversible ; l’ancienne API /api/pilot conserve son comportement et sa base. Version Cloudflare de ScopeKind avant cette livraison : `27aa29fe-0805-4e6f-b7aa-bbd19936dde8`. Pour revenir à cette version, utiliser Wrangler rollback sur le Worker scopekind avec cet identifiant. Pour Sestet, relever l’identifiant de chaque déploiement avant toute nouvelle publication et restaurer la version précédente. Un retour arrière de code ne remplace pas une restauration de données.

Sauvegarder D1 avant toute migration ultérieure, garder la copie dans un emplacement privé, puis vérifier une restauration sur une base isolée avant de modifier la production. Le test automatisé de cette livraison restaure une sauvegarde SQLite locale : il ne constitue pas un essai de restauration D1 distante.

## Vérifications et limites

La suite couvre les droits de deux consultants, les références privées, les liens à usage unique, les sessions, les versions, les doubles requêtes, les erreurs de fournisseur simulées, les webhooks signés et la sauvegarde/restauration locale. Les tests de fournisseurs sont des simulations, pas des preuves de connexion externe.

Avant des données réelles : vérifier les sauvegardes distantes, la délivrabilité, la rétention, l’import de PDF variés (dont chiffrés/scannés), le PDF imprimé multipage, la charge et les politiques contractuelles. Le parsing PDF est compilé mais les formats de tous les clients ne sont pas garantis. Les pages publiques ne chargent ni publicité ni analytique. Les métriques du serveur concernent uniquement les opérations authentifiées.
