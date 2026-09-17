export const ANALYSIS_LABELS = [
  "within_scope",
  "clarification_needed",
  "potential_change",
  "contradiction",
];

export function assertAnalysis(value) {
  if (!value || typeof value !== "object") throw new TypeError("Analysis must be an object");
  if (!ANALYSIS_LABELS.includes(value.label)) throw new TypeError("Invalid analysis label");
  if (typeof value.summary !== "string" || !value.summary.trim()) throw new TypeError("Missing summary");
  if (!Number.isFinite(value.confidence) || value.confidence < 0 || value.confidence > 1) {
    throw new TypeError("Confidence must be between 0 and 1");
  }
  if (!Array.isArray(value.evidence)) throw new TypeError("Evidence must be an array");
  if (!Array.isArray(value.questions)) throw new TypeError("Questions must be an array");
  if (!Array.isArray(value.suggestedActions)) throw new TypeError("Suggested actions must be an array");
  return value;
}

export const analysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["label", "summary", "confidence", "evidence", "questions", "suggestedActions"],
  properties: {
    label: { type: "string", enum: ANALYSIS_LABELS },
    summary: { type: "string" },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    evidence: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["sourceId", "quote", "reason"],
        properties: {
          sourceId: { type: "string" },
          quote: { type: "string" },
          reason: { type: "string" },
        },
      },
    },
    questions: { type: "array", items: { type: "string" } },
    suggestedActions: { type: "array", items: { type: "string" } },
  },
};

