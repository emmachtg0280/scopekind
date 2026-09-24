export const STORAGE_KEY = "scopekind-astryx-demo-v1";
export const seed = () => ({
  version: 1,
  requests: [
    {
      id: "premium",
      title: "“A little more premium.”",
      category: "clarification",
      status: "open",
      source: "Email · copied example",
      date: "Sep 22 · 10:42",
      author: "Alex · Poma",
      quote:
        "Love the direction! Could we make it feel a little more premium, but still friendly?",
      recommendation:
        "Refine the spacing and typography, while keeping the warm colours and approachable personality.",
      reason:
        "The approved brief calls for a welcoming neighbourhood pantry. A cleaner hierarchy can feel more considered without changing that direction.",
      question:
        "By “more premium”, do you mean a cleaner, more refined layout while keeping the friendly feel?",
      impact: "Included in revision 2 · no change to the agreed delivery date",
      version: "Identity v02",
    },
    {
      id: "social",
      title: "Add three Instagram templates",
      category: "additional",
      status: "open",
      source: "Message · copied example",
      date: "Sep 22 · 11:08",
      author: "Alex · Poma",
      quote:
        "Could you also make three matching Instagram templates for our opening?",
      recommendation:
        "Prepare a separate proposal for three reusable Instagram templates based on the agreed visual identity.",
      reason:
        "The example agreement covers the logo, colour palette and brand guide. Social templates are a new deliverable.",
      question:
        "Would you like a separate proposal for three Instagram templates?",
      impact:
        "Additional work · price and delivery date to agree before starting",
      version: "New deliverable",
    },
    {
      id: "colour",
      title: "Keep the warmth in the colours",
      category: "included",
      status: "open",
      source: "Review note · copied example",
      date: "Sep 22 · 11:24",
      author: "Alex · Poma",
      quote:
        "Please keep the warm colours. We want the shop to feel welcoming, not too corporate.",
      recommendation:
        "Keep the tomato, butter and cobalt palette and apply it consistently across the identity.",
      reason:
        "This follows the warm, local personality approved for the Poma direction.",
      question:
        "Shall we keep the approved warm palette across the next revision?",
      impact: "Included in revision 2 · no change to the agreed delivery date",
      version: "Identity v02",
    },
  ],
  history: [
    {
      id: "h1",
      requestId: null,
      title: "A warm, local personality",
      body: "Direction approved in the fictional brief. The identity should feel welcoming, considered and a little unexpected.",
      version: "Creative brief",
      date: "Sep 18",
      kind: "Example agreement",
    },
    {
      id: "h2",
      requestId: null,
      title: "One identity, two revision rounds",
      body: "Logo, colour palette and a concise brand guide. New deliverables are discussed separately.",
      version: "Project agreement",
      date: "Sep 19",
      kind: "Example agreement",
    },
  ],
});

export function restore(raw) {
  try {
    const value = JSON.parse(raw);
    const original = seed();
    if (
      value?.version !== 1 ||
      !Array.isArray(value.requests) ||
      value.requests.length !== 3 ||
      !Array.isArray(value.history) ||
      value.history.length > 100
    )
      return original;
    const ids = new Set();
    for (const r of value.requests) {
      if (
        !original.requests.some((s) => s.id === r.id) ||
        ids.has(r.id) ||
        !["open", "approved", "changes", "clarify"].includes(r.status) ||
        !["clarification", "included", "additional"].includes(r.category)
      )
        return original;
      if (
        [
          "title",
          "source",
          "date",
          "author",
          "quote",
          "recommendation",
          "reason",
          "question",
          "impact",
          "version",
        ].some((k) => typeof r[k] !== "string" || r[k].length > 4000)
      )
        return original;
      ids.add(r.id);
    }
    if (
      value.history.some((h) =>
        ["id", "title", "body", "version", "date", "kind"].some(
          (k) => typeof h[k] !== "string" || h[k].length > 8000,
        ),
      )
    )
      return original;
    return value;
  } catch {
    return seed();
  }
}

export function recordResponse(
  state,
  id,
  response,
  comment = "",
  now = new Date(),
) {
  if (!["approved", "changes", "clarify"].includes(response))
    throw new Error("Choose a response.");
  const request = state.requests.find((r) => r.id === id);
  if (!request) throw new Error("Unknown request.");
  const labels = {
    approved: "Approved in client preview",
    changes: "Changes requested in client preview",
    clarify: "Clarification requested in client preview",
  };
  return {
    ...state,
    requests: state.requests.map((r) =>
      r.id === id ? { ...r, status: response } : r,
    ),
    history: [
      {
        id: `${id}-${now.getTime()}`,
        requestId: id,
        title: request.title,
        body: `${request.question}\n\nRecommendation: ${request.recommendation}\nWhy: ${request.reason}\nImpact: ${request.impact}${comment.trim() ? `\nClient note: ${comment.trim()}` : ""}`,
        version: request.version,
        date: now.toISOString(),
        kind: `Simulated response · ${labels[response]}`,
      },
      ...state.history,
    ],
  };
}

export function exportSummary(state) {
  return [
    "# ScopeKind — Poma decision summary",
    "Fictional project. Responses below are simulated. No client was contacted.",
    ...state.requests.map(
      (r) =>
        `## ${r.title}\nStatus: ${r.status}\nSource: ${r.source}\nVersion: ${r.version}\n\nClient feedback: ${r.quote}\n\nRecommendation: ${r.recommendation}\nWhy: ${r.reason}\nQuestion: ${r.question}\nImpact: ${r.impact}`,
    ),
    "## Decision history",
    ...state.history.map(
      (h) => `### ${h.title}\n${h.kind} · ${h.date} · ${h.version}\n${h.body}`,
    ),
  ].join("\n\n");
}
