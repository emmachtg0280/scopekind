import { mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const root = "dist/product",
  origin = "https://sestet.emmachataigner.workers.dev";
const css = readdirSync(join(root, "assets")).find(
  (x) => x.startsWith("index-") && x.endsWith(".css"),
);
const pages = [
  {
    slug: "modele-proposition-conseil",
    title: "Modèle de proposition de mission de conseil",
    description:
      "Une trame à adapter : objectifs, livrables, hypothèses, exclusions, dépendances, calendrier et prix.",
    body: `
<p class="lead">Une proposition utile permet au client de comprendre ce qu’il achète, ce qu’il doit fournir et ce qui reste à décider. Voici une trame de travail pour un consultant indépendant.</p>
<h2>Commencer par la décision à prendre</h2><p>Écrivez le problème observé et le résultat attendu. « Comprendre les retards de livraison » décrit une intention. « Réduire les retards de 30 % » constitue un engagement différent, à ne pas promettre sans base et sans maîtrise de l’exécution.</p>
<h2>La trame à adapter</h2><ol class="guide"><li><strong>Objectifs :</strong> quel problème faut-il éclairer ? Quelle décision la mission doit-elle permettre ?</li><li><strong>Livrables :</strong> nom, contenu, format et destinataire de chaque restitution. Précisez le nombre d’entretiens seulement une fois convenu.</li><li><strong>Hypothèses :</strong> sites, équipes et données concernés. Distinguez les faits reçus du client des conditions supposées.</li><li><strong>Exclusions :</strong> ce que la mission ne comprend pas et ce qui nécessiterait une nouvelle proposition.</li><li><strong>À fournir par le client :</strong> interlocuteurs, disponibilité, données et validation des constats.</li><li><strong>Calendrier :</strong> séquence de travail, point de départ et dépendances. Un exemple n’est pas une date ferme.</li><li><strong>Prix et modalités :</strong> montant, devise, taxes applicables, échéancier et traitement des frais. À renseigner par le consultant.</li><li><strong>Points ouverts :</strong> listez les inconnues puis résolvez-les avant l’accord sur la version.</li></ol>
<h2>Une vérification avant envoi</h2><p>Chaque livrable doit être compréhensible sans explication orale. Chaque dépendance doit avoir un responsable. Relisez le document du point de vue du client : vos notes internes et les propositions d’autres clients n’y ont pas leur place.</p><p><a href="/ressources/trame-proposition.txt" download>Télécharger la trame en texte</a></p><p>Cette trame est un outil de travail, pas un contrat universel. Adaptez les conditions à la mission et au contexte du client.</p>`,
  },
  {
    slug: "exemple-diagnostic-operationnel",
    title: "Exemple de proposition pour un diagnostic opérationnel",
    description:
      "Un exemple fictif commenté pour distinguer diagnostic, recommandations et mise en œuvre.",
    body: `
<p class="lead">Atelier Rivage est une entreprise fictive. Elle souhaite comprendre ses retards de livraison avant de décider quels processus modifier. Cet exemple illustre une structure ; ses quantités et conditions ne constituent pas une offre.</p>
<h2>Objectif et livrables</h2><p>Objectif : identifier les principales frictions du traitement des commandes. Livrables proposés dans cet exemple : une cartographie du processus, une synthèse des causes observées et un plan d’action priorisé.</p><p>La cartographie décrit le fonctionnement actuel. Le plan d’action propose des décisions ; il ne signifie pas que le consultant les mettra en œuvre.</p>
<h2>Hypothèses et dépendances</h2><p>L’exemple porte sur un seul site et six entretiens. Le client fournit des commandes anonymisées, désigne les interlocuteurs et organise leur disponibilité. Un deuxième site modifierait le travail à réaliser et appellerait une nouvelle version.</p>
<h2>Une exclusion explicite</h2><blockquote>La mission ne comprend ni le déploiement des recommandations, ni le paramétrage du système d’information, ni l’accompagnement quotidien des équipes.</blockquote><p>Cette phrase rend visible la frontière entre diagnostic et exécution. Elle permet au client de demander un complément avant de donner son accord.</p>
<h2>Conditions de l’exemple</h2><p>La démo permet de renseigner un forfait fictif de 4 800 EUR HT et une durée fictive de trois semaines. Ces nombres servent uniquement à tester le parcours. Ils ne sont ni une recommandation tarifaire ni une estimation pour votre mission.</p>
<h2>Le retour client et la version suivante</h2><p>Si le client demande d’inclure un deuxième site, conservez sa demande sur la première version. Préparez ensuite une nouvelle version avec les effets sur les livrables, le calendrier et le prix. L’accord initial ne se transfère pas automatiquement.</p><p><a href="/#/demo">Explorer ce scénario dans la démo Sestet</a></p>`,
  },
  {
    slug: "perimetre-mission-conseil",
    title: "Définir le périmètre d’une mission de conseil",
    description:
      "Cinq conversations concrètes pour clarifier livrables, exclusions et responsabilités avant de commencer.",
    body: `
<p class="lead">Le périmètre se précise dans les conversations avec le client. La proposition doit en garder une trace lisible, y compris lorsque certaines attentes évoluent.</p>
<h2>1. Distinguer résultat espéré et travail confié</h2><p>Le client peut vouloir améliorer sa marge. Votre mission peut consister à analyser les coûts et recommander des priorités. Décrivez votre contribution et les décisions qui appartiennent au client.</p>
<h2>2. Rendre les livrables observables</h2><p>« Accompagner la transformation » reste large. Une synthèse d’entretiens, une cartographie validée ou un atelier de priorisation indiquent ce qui sera remis ou réalisé. Définissez leur contenu ensemble.</p>
<h2>3. Nommer les exclusions</h2><p>Une exclusion utile précise une frontière : diagnostic sans déploiement, analyse d’un site sans extension aux filiales, recommandations sans paramétrage logiciel. Elle évite que le même mot recouvre deux attentes.</p>
<h2>4. Clarifier les contributions du client</h2><p>Qui fournit les données ? Qui participe aux entretiens ? Qui valide les constats et à quelle étape ? Le calendrier dépend souvent de ces contributions. Les écrire facilite l’organisation.</p>
<h2>5. Traiter les changements avant de les absorber</h2><p>Reformulez la demande supplémentaire et son effet sur la mission. Préparez une version révisée, puis demandez une réponse explicite. Gardez la version précédente avec les réponses qui la concernent.</p>
<h2>Trois questions pour la relecture</h2><ul><li>Un lecteur extérieur comprend-il ce qui sera livré ?</li><li>Les hypothèses et les décisions manquantes sont-elles visibles ?</li><li>Le prix et le calendrier correspondent-ils exactement à cette version ?</li></ul><p>Un échange oral peut résoudre un point. Retranscrivez-le comme tel, sans le présenter comme une validation saisie par le client.</p>`,
  },
];
const escape = (s) =>
  s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
for (const page of pages) {
  const dir = join(root, "ressources", page.slug);
  mkdirSync(dir, { recursive: true });
  const related = pages
    .filter((x) => x !== page)
    .map((x) => `<li><a href="/ressources/${x.slug}/">${x.title}</a></li>`)
    .join("");
  writeFileSync(
    join(dir, "index.html"),
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(page.title)} — Sestet</title><meta name="description" content="${escape(page.description)}"><link rel="canonical" href="${origin}/ressources/${page.slug}/"><link rel="stylesheet" href="/assets/${css}"></head><body><a class="skip-link" href="#main">Aller au contenu</a><header class="public-header"><a class="logo" href="/">Sestet</a><nav aria-label="Navigation principale"><a href="/#/demo">Essayer la démo</a><a href="/#/aide">Guide</a></nav></header><main id="main" class="info-page"><p class="eyebrow">LE CARNET SESTET · CONSEIL INDÉPENDANT</p><h1>${page.title}</h1>${page.body}<h2>Pour aller plus loin</h2><ul>${related}</ul><p><a href="/#/demo">Préparer une proposition fictive avec Sestet →</a></p></main><footer class="public-footer"><a class="logo" href="/">Sestet</a><a href="/#/informations">Informations & confidentialité</a><span>Démo publique · comptes bientôt disponibles</span></footer></body></html>`,
  );
}
writeFileSync(
  join(root, "ressources", "trame-proposition.txt"),
  `SESTET — TRAME À ADAPTER\n\nClient :\nMission :\nVersion :\nConsultant et coordonnées :\n\n1. Objectifs\n2. Livrables et formats\n3. Hypothèses\n4. Exclusions\n5. À fournir par le client\n6. Calendrier et dépendances — à confirmer\n7. Prix, devise, taxes et modalités — à confirmer\n8. Points à clarifier avant accord\n\nToute modification de périmètre appelle une version révisée et un nouvel accord.\nCette trame est un outil de travail, pas un contrat universel.\n`,
);
writeFileSync(
  join(root, "robots.txt"),
  `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`,
);
writeFileSync(
  join(root, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["/", ...pages.map((p) => "/ressources/" + p.slug + "/")].map((p) => "<url><loc>" + origin + p + "</loc></url>").join("")}</urlset>`,
);
console.log(
  "Three original resource pages, text template, robots and sitemap built.",
);
