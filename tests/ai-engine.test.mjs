import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { analyzeDeterministically, analyzeRequest } from "../src/ai-engine/index.mjs";

const cases = JSON.parse(await readFile(new URL("../data/ai-engine/eval-cases.json", import.meta.url), "utf8"));

for (const testCase of cases) {
  test(`classifies ${testCase.id}`, () => {
    const result = analyzeDeterministically(testCase.input);
    assert.equal(result.label, testCase.expected);
    assert.ok(result.confidence >= 0 && result.confidence <= 1);
  });
}

test("rejects a missing request", () => {
  assert.throws(() => analyzeDeterministically({ scope: {}, decisions: [], request: {} }), /request.text/);
});

test("rejects an unknown mode", async () => {
  await assert.rejects(() => analyzeRequest(cases[0].input, { mode: "magic" }), /Unknown analysis mode/);
});

