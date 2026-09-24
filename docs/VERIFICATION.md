# Vérification de la livraison Sestet

Date : 23 septembre 2026, fuseau America/Los_Angeles (publication le 24 septembre UTC).

## Résultats

- 22 tests Node réussis ; zéro échec. Droits de deux comptes, source privée, accès sans session, origine refusée, liens à usage unique, expiration, révocation, versions, accord explicite, sauvegardes concurrentes, quota, erreurs IA simulées, source inconnue, clé de paiement live refusée, webhook signé/idempotent, restauration SQLite locale et redirection.
- Compilation de production et assemblage Worker réussis. Avertissement non bloquant : bundle principal d’environ 511 ko avant compression ; PDF chargé à la demande.
- Parcours navigateur local : connexion avec adresse fictive, profil, référence textuelle, dossier, sauvegarde, aperçu, invitation interceptée, vérification client et accord persistant sur la version 1.
- Accueil desktop et contrôle visuel à largeur 390 px : lisibles. Ce contrôle ne constitue pas un test exhaustif sur appareils physiques.
- Site public, trois ressources et sitemap : HTTP 200.
- /api/v1/config : emails, IA et facturation désactivés ; testMail false.
- /api/v1/dossiers sans session : HTTP 401.
- Ancienne adresse : HTTP 307 vers Sestet, Cache-Control no-store.
- Démo publique ouverte dans le navigateur après déploiement.

## Versions d’hébergement

- Sestet : `0c662a86-68ec-464b-9c99-be7385fc473a`.
- Redirection ScopeKind : `0a580738-062d-4aac-92bc-5bf458bd2591`.
- Ancienne version ScopeKind à restaurer si nécessaire : `27aa29fe-0805-4e6f-b7aa-bbd19936dde8`.

L’ancienne base de candidatures reste en place et n’a pas été exportée dans le dépôt. La nouvelle base Sestet est distincte. Aucun email réel, appel de génération réel, paiement ou contact prospect n’a été effectué.

## Restant à vérifier avant ouverture

Fournisseurs réels et sandbox Stripe ; délivrabilité ; PDF importés représentatifs et export multipage ; restauration D1 distante ; mentions d’exploitation et conservation ; charge et coûts. Voir SESTET.md pour la configuration. Le workflow nocturne historique du dépôt vise encore l’ancien produit sur la branche principale : son scénario devra être migré lors de la revue du pivot, avant de considérer sa surveillance comme pertinente pour Sestet.
