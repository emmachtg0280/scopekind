import { readFile } from "node:fs/promises";
import { analyzeRequest } from "../src/ai-engine/index.mjs";

const modeArg = process.argv.find((arg) => arg.startsWith("--mode="));
const mode = modeArg?.split("=")[1] ?? "deterministic";
const cases = JSON.parse(await readFile(new URL("../data/ai-engine/eval-cases.json", import.meta.url), "utf8"));

let correct = 0;
const results = [];
for (const testCase of cases) {
  const analysis = await analyzeRequest(testCase.input, { mode });
  const passed = analysis.label === testCase.expected;
  if (passed) correct += 1;
  results.push({ id: testCase.id, expected: testCase.expected, actual: analysis.label, passed, confidence: analysis.confidence });
}

console.table(results);
console.log(`Accuracy: ${correct}/${cases.length} (${Math.round((correct / cases.length) * 100)}%)`);
if (correct !== cases.length) process.exitCode = 1;

