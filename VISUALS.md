# Version actuelle — livrables freelance, 13 septembre 2026

Les peintures ont été retirées de tous les exemples et de la distribution. Le site montre désormais une identité visuelle, une maquette web, un extrait TypeScript illustratif et un pack de lancement social. L’exemple Poma est fictif, explicitement indiqué sur la page.

## Origine des éléments

- Photographie : tomates, par Nik (@helloimnik), publiée le 3 avril 2018, appareil Nikon D3000 indiqué par la page source. https://unsplash.com/photos/orange-fruits-on-white-surface-NEPPt7B64wY
- Fichier local : src/pantry-tomatoes.jpg. Gratuit sous licence Unsplash, usage commercial autorisé ; pas CC0. https://unsplash.com/license et https://help.unsplash.com/en/articles/2612315-can-i-use-unsplash-images-for-personal-or-commercial-projects
- Provenance, URL de téléchargement et empreinte SHA-256 : asset-sources/pantry-tomatoes.json. Aucun visage, logo ou marque tiers visible dans la photographie. Crédit volontaire en pied de page. Uniquement redimensionnement JPEG classique et cadrage CSS.
- Identité Poma, planche couleur, maquette web et supports sociaux : compositions HTML/CSS et texte réalisées dans ce projet avec l’assistance de Codex. Pas de génération raster ni de prétention à être des travaux réalisés par un client humain. Aucun design récupéré sur un portfolio tiers.
- Exemple de code : court objet de configuration TypeScript écrit pour illustrer le périmètre d’un formulaire. Pas de capture d’un dépôt client ni d’intégration fonctionnelle promise.
- Logo ScopeKind, couleurs, typographies, animations, formulaire et navigation conservés. Démonstration toujours illustrative ; pas un produit complet ni de faux témoignages.

## Adaptation à la cible

Hero : validation du travail et accord sur les ajouts. Exemples : identité → packaging ; site vitrine → boutique ; formulaire → comptes clients. Vidéo, rédaction et photographie également évoquées. Ajout de Development, Copywriting et Photography au formulaire et à sa validation serveur. Le scénario du lecteur reste cohérent : identité + homepage, puis demande de trois posts sociaux.

Les principes retenus sont la clarté du but, des exemples concrets et la transparence sur l’offre bêta, en cohérence avec les recommandations de NN/g : https://www.nngroup.com/articles/top-ten-guidelines-for-homepage-usability/ et https://www.nngroup.com/articles/trustworthy-design/. Ce sont des hypothèses de conversion, pas des gains mesurés. Aucun traceur ajouté. Une validation auprès de freelances de plusieurs disciplines, puis une comparaison du taux de demandes bêta complétées, sera nécessaire pour mesurer l’effet.

## Vérification

Compilation et contrôles syntaxiques réussis ; cinq tests serveur réussis, dont l’acceptation des trois nouvelles disciplines. Le changement de direction réinitialise désormais le statut de confirmation pour éviter une approbation visuellement périmée. Vérification visuelle effectuée après autorisation explicite : desktop 1440 px et mobile 390 px, aucune image manquante ni débordement horizontal. Confirmation, changement de choix et nouvelle confirmation vérifiés ; formulaire et nouvelles disciplines présents ; chapitre 3 à 10 secondes ; aucune erreur console. Aucun déploiement en production.

---

# Historique des propositions précédentes

# Sélection actuelle — seconde proposition, 13 septembre 2026

À la demande de l’utilisatrice, les deux Hokusai ont été remplacés partout par deux œuvres moins iconiques d’Henri-Edmond Cross. Le choix de moindre familiarité est un jugement éditorial, pas une mesure de leur fréquence sur les sites de freelances ; aucune exclusivité ou rareté statistique n’est revendiquée.

| Fichier actif | Œuvre | Source officielle | Original |
| --- | --- | --- | --- |
| src/cross-valley.jpg | Valley with Fir (Shade on the Mountain), 1909, huile sur toile | https://www.metmuseum.org/art/collection/search/459094 | https://images.metmuseum.org/CRDImages/rl/original/DT3110.jpg |
| src/cross-stars.jpg | Landscape with Stars, vers 1905–1908, aquarelle sur papier | https://www.metmuseum.org/art/collection/search/459189 | https://images.metmuseum.org/CRDImages/rl/original/DP359010.jpg |

Auteur : Henri-Edmond Cross (1856–1910). Les deux notices portent Public Domain ; les métadonnées officielles téléchargées indiquent isPublicDomain: true. Reproductions gratuites sous CC0 selon https://www.metmuseum.org/policies/image-resources ; usage commercial et adaptations autorisés. Preuves conservées dans asset-sources/met-459094.json et met-459189.json, avec les JPEG originaux. Vérification le 13 septembre 2026.

Exports JPEG classiques de 1440 × 1185 et 1440 × 1093, qualité 88, sans génération ni recoloration. Cadrages CSS dans les cadres existants ; crédits et descriptions alternatives mis à jour. Les options deviennent Sunlit & vibrant et Dreamlike & poetic pour correspondre aux images. Les anciennes versions restent en archive source, exclues du build. Composition, couleurs de la page, typographies et logique interactive inchangées. Proposition locale, non publiée.

---

# Première proposition et audit initial (historique)

# Audit des visuels — 13 septembre 2026

État actuel : seuls deux JPEG non générés sont utilisés, hébergés localement. Les notes plus bas décrivent les anciennes versions, pas les images actuellement affichées.

## Inventaire avant remplacement

| Emplacement / fichier | Origine vérifiée | Décision |
| --- | --- | --- |
| Hero, deux choix d’ambiance, chapitre 1 de la démonstration, carte supplémentaire : moss-meteor-digital.jpg | IA confirmée par les prompts et notes ImageGen ci-dessous | Remplacé partout par deux reproductions Hokusai |
| moss-meteor-presentation.jpg | IA confirmée par le prompt initial ; non référencé dans la page active | Conservé comme archive source, non livré |
| creative-studio.jpg et creative-desk.jpg | IA confirmée par les notes de génération et retouche ; non affichés mais encore inclus au build | Retirés du build et du serveur local ; sources conservées |
| sundae-radio-presentation.jpg | Origine inconnue : aucun justificatif de création ou de licence trouvé dans les sources et notes inspectées | Déjà inutilisé et exclu du build ; aucune attribution à l’IA sur simple apparence |
| studio-companion.png | Les notes indiquent un import de l’ancien site Lovable, sans preuve de méthode de création ni licence | Non affiché ; conservé en source, retiré des ressources distribuées |
| Checkpoint, lecteur, décisions, proposition et comparaisons textuelles | Composants HTML/CSS et contenu JavaScript, pas des captures raster | Conservés, y compris commandes et animations |
| Modales inscription et confidentialité | Aucune image, formulaires et texte HTML | Conservées |
| Logo typographique, favicon SVG, flèches, avatars initiales, formes, accents et pastille bêta | Éléments de marque et graphismes SVG/CSS/texte | Conservés sans modification |

## Sources retenues et droits

Auteur : Katsushika Hokusai. Estampes à l’encre et en couleurs sur papier, vers 1830–1832, conservées au Metropolitan Museum of Art. Les notices datées, la technique et les reproductions fournies par le musée établissent leur provenance ; leur statut ne repose pas sur une appréciation visuelle.

| Fichier livré | Œuvre et notice | Image originale | Format local |
| --- | --- | --- | --- |
| src/hokusai-red-fuji.jpg | [South Wind, Clear Sky / Red Fuji](https://www.metmuseum.org/art/collection/search/55736), JP2960 | https://images.metmuseum.org/CRDImages/as/original/DP141053.jpg | 1440 × 986, JPEG qualité 88 |
| src/hokusai-great-wave.jpg | [Under the Wave off Kanagawa / The Great Wave](https://www.metmuseum.org/art/collection/search/45434), JP1847 | https://images.metmuseum.org/CRDImages/as/original/DP130155.jpg | 1440 × 968, JPEG qualité 88 |

Les deux notices indiquent Public Domain et leurs réponses API indiquent isPublicDomain: true. [Politique Open Access du Met](https://www.metmuseum.org/policies/image-resources) : mise à disposition gratuite sous [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/), autorisant l’usage commercial et les adaptations, sans attribution obligatoire. Crédits néanmoins visibles sous les exemples et en bas de page. Vérifié le 13 septembre 2026.

Preuves locales : asset-sources/met-55736.json et met-45434.json (réponses API complètes, comprenant auteur, datation, URL et statut), et les JPEG originaux associés. Ces fichiers de provenance ne sont pas déployés.

Traitements : redimensionnement et compression JPEG classiques uniquement ; cadrage CSS object-fit: cover dans les cadres existants. Aucune génération, recoloration ni retouche IA. Les reproductions sont identifiées comme références artistiques d’un projet d’exposition fictif, sans suggérer que ScopeKind ou un client les a créées. Les intitulés d’ambiance et le scénario ont été ajustés pour correspondre aux œuvres. Couleurs, polices, grille, arrondis, navigation et logique interactive conservés.

Le build retire explicitement les anciens assets distribués pour éviter qu’un build précédent ne les conserve dans dist/client. Les originaux du projet restent disponibles dans src à titre d’archives.

## Vérifications de cette modification

Contrôles syntaxiques réussis ; quatre tests serveur réussis ; build réussi. Vérification navigateur desktop et mobile 390 px : six images chargées, pas de débordement horizontal, hero et choix inspectés visuellement, confirmation d’ambiance, ouverture/fermeture du formulaire et navigation vers le troisième chapitre à 10 secondes. Aucune erreur console observée. Modification locale, non déployée en production.

---

# Historique antérieur (visuels remplacés)

# Visuels et lecteur — version créative

## Hero — Moss & Meteor (11 septembre 2026)

Le hero utilise désormais `src/moss-meteor-presentation.jpg`, une création originale ImageGen pour un jeu fictif. Image principale de paysage illustré, pochette de jeu et carte nocturne ; aucune interface produit n'est intégrée à l'image. Le lien vers le check-in est un vrai bouton HTML sous le visuel. Les anciennes sections de démonstration répétées ont été retirées.

Prompt de génération :

> Create a landscape 3:2 hero image of an original indie video game art direction client presentation. Fictional game title exactly ‘MOSS & METEOR’. A handcrafted exploration adventure about a small helmeted traveler finding a fallen luminous orange meteor in a lush alien archipelago of moss-covered ruins. This is beautifully crafted actual game key art, painterly 2.5D stylized environmental illustration, not generic space graphics. Main dominant object is a large art print on the right: lush teal and deep cobalt overgrown stone arches, winding coral orange path, enormous pale cream moon, dramatic sky, tiny warm yellow-suited traveler with a small round companion; one bright orange meteor as the focal point. Game title MOSS & METEOR in a custom heavy friendly rounded cream display lettering across the upper sky. On the left an elegant physical game sleeve with a quieter close-up character illustration against cream, small MM monogram, and a smaller art postcard showing a nocturnal scene. 3 print objects maximum arranged as a carefully designed editorial client presentation on a plain warm ivory seamless backdrop; slight overlapping corners only, all key art readable. Natural realistic paper texture and subtle cast shadows, photographed print objects containing exquisite expressive original digital illustrations. Palette: cobalt blue, rich teal, coral orange, warm yellow, cream; bold color blocking but art and scene are the focus, asymmetrical arched print cutout on the small postcard. Contemporary polished indie-game visual development portfolio. No desk, no table, no people outside the in-game illustrated traveler, no hands, no computer, no game controller, no workstation, no dashboard or UI, no logos of real companies, no imitation of a specific existing game, no watermark. Only short exact text MOSS & METEOR and MM. One strong dominant image and two subtle secondary creative applications. Clear generous margins, composition fits entirely within frame.

Vérifications de cette version : image chargée à sa définition native de 1536 px, rendu mobile à 390 px sans débordement horizontal, ouverture et fermeture du formulaire, lien du hero vers la démonstration, sélection du troisième chapitre à 10/20 secondes et barres cohérentes, aucune erreur console observée, build et quatre tests serveur réussis.

Images créées puis retouchées avec l’outil intégré ImageGen. Elles illustrent un univers créatif fictif et ne représentent pas des clients. Fichiers livrés : src/creative-studio.jpg et src/creative-desk.jpg. Export JPEG pour réduire le transfert ; originaux conservés dans le dossier generated_images de Codex.

## Direction des prompts

Studio : photographie éditoriale réaliste d’un jeune adulte au travail dans un petit studio de création, graphisme et montage, lumière naturelle, accents orange, cobalt et lime, sans logo ni texte marketing. Retouche ciblée : conserver la composition et corriger uniquement les deux mains, avec proportions naturelles, poignets et doigts anatomiquement plausibles.

Bureau : photographie éditoriale en plongée d’une table cobalt, affiche orange, carnet de croquis, nuancier lime, casque et manette. Retouches : remplacer les photographies architecturales déformées par des études de matières et tirages graphiques. Remplacer le laptop et son clavier imparfait par une tablette graphique fine et un stylet, avec études géométriques orange et crème ; préserver la lumière, les ombres, les couleurs et les autres objets.

## Lecteur

Le compteur utilise performance.now et un intervalle nettoyé à la pause et en fin de lecture. Le lecteur intégré à la page dure 20 secondes : quatre étapes de cinq secondes, avec sélection et remplissage des barres synchronisés. Les liens du hero défilent vers ce lecteur. Le clic sur un chapitre affiche cette étape en pause. Le lecteur démarre lorsqu’il devient visible ; reduced-motion désactive le démarrage automatique.

Le lapin studio-companion.png provient des sources du précédent site, conservées dans backups/lovable-source/src/assets. Il est servi localement, sans dépendance à Lovable.

Dernières vérifications : synchronisation automatique à 14 secondes sur la troisième étape, retour par clic à la deuxième étape à 5 secondes, menu fixe sur toute la largeur à 1440 px, arrivée à scrollY=0 sans ancre, cartes séparées et absence de débordement à 390 px, ouverture du formulaire et quatre tests serveur réussis.

Vérifications : ouverture depuis hero et affiche, progression chronométrée, pause, saut au dernier chapitre, affichage mobile et desktop, absence de débordement à 390 et 820 px, compilation, contrôles syntaxiques et quatre tests du formulaire.


## Objets sans fond — 11 septembre 2026

Le hero conserve exactement le JPEG original moss-meteor-presentation.jpg. Une découpe CSS suit les contours extérieurs des trois supports et supprime visuellement le fond beige. Deux essais avec ImageGen intégré ont produit un damier opaque : ils ne sont pas utilisés. Le fichier original et ses illustrations restent inchangés. La découpe proportionnelle est définie dans src/refinements.css.


## Version digitale — 11 septembre 2026

Asset retenu : src/moss-meteor-digital.jpg, créé avec ImageGen intégré à partir de la présentation précédente. Le hero utilise cette version avec découpe CSS des contours. Original conservé.

Prompt : Edit this Moss & Meteor artwork presentation into a DIGITAL GAME ART presentation, not a photograph of printed items. Preserve the same three artworks, character, orange meteor, moon, archipelago, exact title MOSS & METEOR, and overall arrangement. Change the physical poster into a crisp rectangular edge-to-edge digital key visual, the left box into a flat vertical digital cover, the foreground postcard into an edge-to-edge nocturnal digital concept artwork. Remove ALL paper borders, beige paper, cardboard thickness, paper texture, photo lighting and cast shadows. Each image is a flat bright digital artwork with clean squared edges, slightly overlapping, on a perfectly uniform near-white #fffefa background. No beige background, no checkerboard, no surrounding frame, no devices, no dashboard chrome. Artwork has polished high-definition stylized videogame rendering, crisp shapes, saturated cobalt blue and teal, luminous orange meteor and warm yellow astronaut, no print grain. The cover left uses deep midnight blue behind the character and bright cream title instead of beige. Maintain a large dominant landscape on the right and two smaller vertical artworks left, with slight overlap of the nocturnal art in front. Landscape output 1536x1024.

## Fil conducteur client — 11 septembre 2026

Le hero ne présente plus le jeu comme un produit à vendre : il montre un cadrage de l’illustration et le retour de Jamie. La démonstration de 20 secondes poursuit ce même projet : choix d’ambiance, décision enregistrée, demande de carte et proposition complémentaire. Une section dédiée à la carte remplace la photographie de bureau générique. Le nom du jeu n’est plus mis en avant. Les images restent issues du JPEG existant ; cadrages HTML/CSS sans nouvelle génération. CTA bêta dans le hero, après la proposition, dans la section bêta et en conclusion. Aucun prix ni preuve client inventée.
## Audit et conversion — 11 septembre 2026

Textes et structure alignés sur le brief : hero centré sur les décisions client, navigation Why ScopeKind / How it works / Free beta, phrase d’audience ciblée, bêta sans preuve inventée, et suppression de la conclusion répétitive. Le hero contient un checkpoint interactif avec deux directions, une confirmation et une indication d’enregistrement. Le walkthrough réutilise les mêmes visuels et le même scénario, avec lecture manuelle uniquement.

## Correction de la section Guesswork / Backtracking / Unpaid extra

Les anciens titres utilisaient des sauts de ligne HTML masqués par CSS, ce qui collait les mots. Remplacés par des phrases continues à retour naturel. Chaque ligne associe désormais une situation et son coût à une réponse concrète de ScopeKind. Colonnes alignées sur ordinateur, blocs successifs sur mobile ; anciennes priorités CSS des lignes 2 et 3 neutralisées. Accès à la démonstration et bouton bêta ajoutés en conclusion de section, sans image ni génération.

Vérifié : rendu 1440 px et 390 px, titres correctement espacés, absence de débordement horizontal, ouverture/fermeture du formulaire depuis le nouveau bouton et lien vers #walkthrough. Build réussi. Pas de modification de la production ; gain de conversion non mesuré.
