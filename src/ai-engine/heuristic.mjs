import { assertAnalysis } from "./schema.mjs";

const normalizedWords = (text = "") =>
  new Set(
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .match(/[a-z0-9]+/g)
      ?.filter((word) => word.length > 3) ?? [],
  );

const includesAny = (text, expressions) => expressions.some((expression) => text.includes(expression));

const CHANGE_SIGNALS = [
  "also create",
  "add another",
  "new version",
  "extra format",
  "additional format",
  "animated version",
  "social media kit",
  "landing page",
  "packaging",
  "brochure",
];

const VAGUE_SIGNALS = [
  "make it pop",
  "more premium",
  "more creative",
  "more modern",
  "not feeling it",
  "something different",
  "better",
];

const REVERSAL_PAIRS = [
  ["minimal", "detailed"],
  ["discreet", "bold"],
  ["subtle", "loud"],
  ["serif", "sans serif"],
  ["monochrome", "colorful"],
  ["premium", "playful"],
];

function source(id, quote, reason) {
  return { sourceId: id, quote, reason };
}

export function analyzeDeterministically(input) {
  const request = String(input.request?.text ?? "").trim();
  if (!request) throw new TypeError("request.text is required");

  const requestLower = request.toLowerCase();
  const deliverables = input.scope?.deliverables ?? [];
  const exclusions = input.scope?.exclusions ?? [];
  const decisions = input.decisions ?? [];
  const evidence = [];

  const matchingExclusion = exclusions.find((item) => {
    const words = [...normalizedWords(item.text)];
    return words.length > 0 && words.filter((word) => requestLower.includes(word)).length >= Math.min(2, words.length);
  });

  if (matchingExclusion) {
    evidence.push(source(matchingExclusion.id, matchingExclusion.text, "The request overlaps an explicit exclusion."));
    return assertAnalysis({
      label: "potential_change",
      summary: "This request appears to add work that was explicitly excluded from the agreed scope.",
      confidence: 0.92,
      evidence,
      questions: ["Should this be quoted as an add-on or exchanged for an existing deliverable?"],
      suggestedActions: ["Pause the extra work", "Confirm impact on fee and timeline"],
    });
  }

  const reversal = decisions.find((decision) =>
    REVERSAL_PAIRS.some(([left, right]) => {
      const prior = decision.text.toLowerCase();
      return (prior.includes(left) && requestLower.includes(right)) || (prior.includes(right) && requestLower.includes(left));
    }),
  );

  if (reversal) {
    evidence.push(source(reversal.id, reversal.text, "The new request reverses an approved direction."));
    return assertAnalysis({
      label: "contradiction",
      summary: "The request conflicts with a previously approved creative direction.",
      confidence: 0.88,
      evidence,
      questions: ["Is the client intentionally replacing the earlier approved direction?"],
      suggestedActions: ["Show the prior decision", "Confirm whether the change affects scope or timeline"],
    });
  }

  if (includesAny(requestLower, CHANGE_SIGNALS)) {
    return assertAnalysis({
      label: "potential_change",
      summary: "The request appears to introduce an additional deliverable or format.",
      confidence: 0.78,
      evidence: [],
      questions: ["Is this output already included in the agreed deliverables?"],
      suggestedActions: ["Compare against the signed scope", "Estimate effort before committing"],
    });
  }

  if (includesAny(requestLower, VAGUE_SIGNALS) || request.length < 28) {
    return assertAnalysis({
      label: "clarification_needed",
      summary: "The feedback is too subjective or incomplete to translate into a reliable design decision.",
      confidence: 0.82,
      evidence: [],
      questions: ["Which reference best represents the intended direction?", "What should remain unchanged?"],
      suggestedActions: ["Ask one constrained alignment question", "Record the clarified decision"],
    });
  }

  const requestWords = normalizedWords(request);
  const matchedDeliverable = deliverables
    .map((item) => ({
      item,
      overlap: [...normalizedWords(item.text)].filter((word) => requestWords.has(word)).length,
    }))
    .sort((a, b) => b.overlap - a.overlap)[0];

  if (matchedDeliverable?.overlap > 0) {
    evidence.push(source(matchedDeliverable.item.id, matchedDeliverable.item.text, "The request matches an agreed deliverable."));
  }

  return assertAnalysis({
    label: matchedDeliverable?.overlap > 0 ? "within_scope" : "clarification_needed",
    summary:
      matchedDeliverable?.overlap > 0
        ? "The request appears consistent with an agreed deliverable."
        : "There is not enough scope evidence to classify this request safely.",
    confidence: matchedDeliverable?.overlap > 0 ? 0.72 : 0.58,
    evidence,
    questions: matchedDeliverable?.overlap > 0 ? [] : ["Which agreed deliverable does this request relate to?"],
    suggestedActions: matchedDeliverable?.overlap > 0 ? ["Proceed and attach the work to the referenced deliverable"] : ["Request clarification before work begins"],
  });
}

