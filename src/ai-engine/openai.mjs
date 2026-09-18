import { analysisJsonSchema, assertAnalysis } from "./schema.mjs";

const SYSTEM_PROMPT = `You are ScopeKind's request analysis engine for creative projects.
Classify the newest client request using only the supplied project context.
Never decide whether a legal contract has been breached. Flag uncertainty instead.
Treat previous decisions and scope items as evidence, and cite their source IDs.
Do not invent missing deliverables, approvals, prices, or client intent.
Use potential_change for likely added deliverables or effort, contradiction for a reversal of an approved decision, clarification_needed for ambiguous feedback, and within_scope only when the supplied scope supports it.`;

function extractOutputText(response) {
  if (typeof response.output_text === "string") return response.output_text;
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") return content.text;
    }
  }
  throw new Error("The model returned no structured output");
}

export async function analyzeWithOpenAI(input, options = {}) {
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  const model = options.model ?? process.env.SCOPEKIND_AI_MODEL;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required for model mode");
  if (!model) throw new Error("SCOPEKIND_AI_MODEL is required for model mode");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      store: false,
      instructions: SYSTEM_PROMPT,
      input: JSON.stringify(input),
      text: {
        format: {
          type: "json_schema",
          name: "scopekind_request_analysis",
          strict: true,
          schema: analysisJsonSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${message.slice(0, 500)}`);
  }

  return assertAnalysis(JSON.parse(extractOutputText(await response.json())));
}

