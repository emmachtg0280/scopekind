import test from "node:test";
import assert from "node:assert/strict";
import {
  seed,
  restore,
  recordResponse,
  exportSummary,
} from "../src/workspace/model.mjs";

test("invalid or duplicated persisted records restore safe example data", () => {
  assert.deepEqual(restore("{"), seed());
  const state = seed();
  state.requests[1] = state.requests[0];
  assert.deepEqual(restore(JSON.stringify(state)), seed());
});
test("a response resolves only its own request and preserves an immutable decision snapshot", () => {
  const state = seed();
  const next = recordResponse(
    state,
    "premium",
    "approved",
    "Looks right.",
    new Date("2026-09-24T12:00:00Z"),
  );
  assert.equal(state.requests[0].status, "open");
  assert.equal(next.requests[0].status, "approved");
  assert.equal(next.requests[1].status, "open");
  assert.match(next.history[0].kind, /Simulated response/);
  assert.match(next.history[0].body, /Looks right/);
  next.requests[0].question = "A later question";
  assert.doesNotMatch(next.history[0].body, /A later question/);
});
test("no response is assumed and unknown requests are rejected", () => {
  assert.throws(() => recordResponse(seed(), "premium", ""));
  assert.throws(() => recordResponse(seed(), "unknown", "approved"));
});
test("saved state and exports retain source, version and simulation status", () => {
  const state = recordResponse(
    seed(),
    "social",
    "clarify",
    "Please estimate the extra work.",
  );
  assert.deepEqual(restore(JSON.stringify(state)), state);
  const output = exportSummary(state);
  assert.match(output, /No client was contacted/);
  assert.match(output, /Source: Message/);
  assert.match(output, /Version: New deliverable/);
  assert.match(output, /price and delivery date to agree/);
});
