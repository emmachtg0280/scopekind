export const sections = [
  ["objectives", "Objectifs"],
  ["deliverables", "Livrables"],
  ["assumptions", "Hypothèses"],
  ["exclusions", "Exclusions"],
  ["dependencies", "À fournir par le client"],
  ["timeline", "Calendrier"],
  ["price", "Prix et modalités"],
  ["questions", "Points à clarifier"],
];

export const labels = {
  draft: "Brouillon",
  ready: "Prêt à partager",
  shared: "Partagé",
  changes_requested: "Modification demandée",
  approved: "Accord reçu",
  superseded: "Version remplacée",
};

// A public projection is an allowlist, never a copy of the private dossier.
export function clientProjection(version) {
  return {
    id: version.id,
    number: version.number,
    client: version.client,
    title: version.title,
    content: Object.fromEntries(
      sections.map(([key]) => [key, String(version.content[key] ?? "")]),
    ),
    priceConfirmed: version.priceConfirmed === true,
    timelineConfirmed: version.timelineConfirmed === true,
    consultant: {
      name: String(version.consultant?.name || ""),
      contact: String(version.consultant?.contact || ""),
      logo: /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(
        version.consultant?.logo || "",
      )
        ? version.consultant.logo
        : "",
    },
  };
}

export function readiness(version) {
  const missing = [];
  for (const [key, label] of sections.filter(
    ([key]) => !["questions"].includes(key),
  )) {
    if (!String(version.content[key] ?? "").trim()) missing.push(label);
  }
  if (!version.priceConfirmed)
    missing.push("Prix à confirmer par le consultant");
  if (!version.timelineConfirmed)
    missing.push("Calendrier à confirmer par le consultant");
  if (String(version.content.questions ?? "").trim())
    missing.push("Points à clarifier encore ouverts");
  return missing;
}

export function createRevision(previous, content, id) {
  return {
    ...structuredClone(previous),
    id,
    number: previous.number + 1,
    status: "draft",
    content: structuredClone(content),
    responses: [],
    sharedAt: null,
    priceConfirmed:
      previous.priceConfirmed && content.price === previous.content.price,
    timelineConfirmed:
      previous.timelineConfirmed &&
      content.timeline === previous.content.timeline,
  };
}

export function shareVersion(version, now) {
  const missing = readiness(version);
  if (missing.length) throw new Error(missing.join(" · "));
  return { ...structuredClone(version), status: "shared", sharedAt: now };
}

export function recordResponse(version, response) {
  if (!["shared", "changes_requested", "approved"].includes(version.status))
    throw new Error("Cette version ne reçoit plus de réponses.");
  if (!["question", "changes", "approval"].includes(response.type))
    throw new Error("Réponse non reconnue.");
  if (!response.text?.trim()) throw new Error("Ajoutez une réponse.");
  if (!["client", "transcribed"].includes(response.provenance))
    throw new Error("Provenance requise.");
  // A transcription is evidence, not an authenticated client approval.
  const status =
    response.provenance === "client" && response.type === "approval"
      ? "approved"
      : response.type === "changes"
        ? "changes_requested"
        : version.status;
  return {
    ...structuredClone(version),
    status,
    responses: [...version.responses, { ...response, versionId: version.id }],
  };
}

export function demoDossier() {
  return {
    id: "demo-atelier",
    client: "Atelier Rivage",
    consultant: "Camille Laurent",
    brief:
      "Atelier Rivage, entreprise fictive de 18 personnes, souhaite comprendre les retards entre la prise de commande et la livraison. La dirigeante demande un diagnostic des processus et un plan d’action priorisé. Elle hésite encore sur le nombre de personnes à interroger.",
    privateNotes:
      "Note privée de Camille : clarifier l’accès aux données avant de confirmer le calendrier.",
    references: [
      {
        id: "method",
        title: "Méthode de diagnostic opérationnel",
        text: "Cartographier le parcours commande–livraison. Recueillir les irritants lors de six entretiens. Restituer les constats et prioriser les actions lors d’un atelier.",
        selected: true,
      },
      {
        id: "scope",
        title: "Périmètre type — diagnostic",
        text: "La mission couvre l’analyse et les recommandations. La mise en œuvre, le paramétrage d’outils et la conduite du changement font l’objet d’un accord distinct.",
        selected: true,
      },
      {
        id: "unused",
        title: "Offre de formation managériale",
        text: "Deux ateliers de formation pour managers. Cette référence n’est pas sélectionnée et ne sert pas à préparer la proposition.",
        selected: false,
      },
    ],
    versions: [
      {
        id: "demo-v1",
        number: 1,
        client: "Atelier Rivage",
        title: "Diagnostic opérationnel",
        status: "draft",
        priceConfirmed: false,
        timelineConfirmed: false,
        sharedAt: null,
        responses: [],
        content: {
          objectives:
            "Identifier les causes des retards du parcours commande–livraison et prioriser des actions d’amélioration.",
          deliverables:
            "Une cartographie du processus actuel.\nUne synthèse de six entretiens.\nUn plan d’action priorisé, présenté lors d’un atelier de restitution.",
          assumptions:
            "Un seul site est concerné. Six interlocuteurs participent au diagnostic.",
          exclusions:
            "Mise en œuvre du plan d’action, paramétrage logiciel et formation des équipes.",
          dependencies:
            "Un interlocuteur référent, l’accès aux données disponibles et la disponibilité des personnes interrogées.",
          timeline:
            "À renseigner par le consultant après confirmation des disponibilités.",
          price: "À renseigner par le consultant.",
          questions:
            "Les six entretiens incluent-ils les responsables des équipes logistique et commerciale ?",
        },
        evidence: [
          {
            field: "deliverables",
            sourceId: "method",
            kind: "Formulation proposée",
            quote: "Recueillir les irritants lors de six entretiens.",
          },
          {
            field: "exclusions",
            sourceId: "scope",
            kind: "Extrait de référence",
            quote:
              "La mise en œuvre, le paramétrage d’outils et la conduite du changement font l’objet d’un accord distinct.",
          },
        ],
      },
    ],
  };
}
