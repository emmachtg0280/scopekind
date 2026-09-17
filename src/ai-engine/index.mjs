import { analyzeDeterministically } from "./heuristic.mjs";
import { analyzeWithOpenAI } from "./openai.mjs";

export async function analyzeRequest(input, options = {}) {
  const mode = options.mode ?? "deterministic";
  if (mode === "deterministic") return analyzeDeterministically(input);
  if (mode === "openai") return analyzeWithOpenAI(input, options);
  throw new TypeError(`Unknown analysis mode: ${mode}`);
}

export { analyzeDeterministically } from "./heuristic.mjs";
export { analyzeWithOpenAI } from "./openai.mjs";

