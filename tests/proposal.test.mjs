import test from "node:test";
import assert from "node:assert/strict";
import {
  demoDossier,
  clientProjection,
  readiness,
  shareVersion,
  createRevision,
  recordResponse,
} from "../product/domain.mjs";

function ready() {
  const v = demoDossier().versions[0];
  v.content.questions = "";
  v.content.price = "4 800 EUR HT — exemple fictif";
  v.content.timeline = "Trois semaines — exemple fictif";
  v.priceConfirmed = v.timelineConfirmed = true;
  return v;
}

test("un prix ou calendrier non confirmé empêche le partage", () => {
  assert.ok(readiness(demoDossier().versions[0]).length >= 3);
  assert.throws(() => shareVersion(demoDossier().versions[0], "now"));
  assert.equal(shareVersion(ready(), "now").status, "shared");
});

test("la projection client exclut sources, notes privées et réponses internes", () => {
  const v = {
    ...ready(),
    privateNotes: "secret",
    evidence: ["secret"],
    sourceText: "secret",
  };
  const output = JSON.stringify(clientProjection(v));
  assert.ok(!output.includes("secret"));
  assert.deepEqual(
    Object.keys(clientProjection(v)).sort(),
    [
      "id",
      "number",
      "client",
      "title",
      "content",
      "priceConfirmed",
      "timelineConfirmed",
      "consultant",
    ].sort(),
  );
});

test("un accord concerne uniquement la version partagée et ne se propage pas", () => {
  const v = recordResponse(shareVersion(ready(), "now"), {
    type: "approval",
    text: "Accord",
    provenance: "client",
  });
  const next = createRevision(v, { ...v.content, price: "5 400 EUR HT" }, "v2");
  assert.equal(v.status, "approved");
  assert.equal(next.status, "draft");
  assert.equal(next.responses.length, 0);
  assert.equal(next.priceConfirmed, false);
  assert.equal(v.responses[0].versionId, v.id);
});

test("un accord retranscrit ne devient pas une action authentifiée du client", () => {
  const v = recordResponse(shareVersion(ready(), "now"), {
    type: "approval",
    text: "Accord par téléphone",
    provenance: "transcribed",
  });
  assert.equal(v.status, "shared");
});

test("une version remplacée refuse les nouvelles réponses et la démo est isolée", () => {
  assert.throws(() =>
    recordResponse(
      { ...ready(), status: "superseded" },
      { type: "approval", text: "oui", provenance: "client" },
    ),
  );
  const a = demoDossier(),
    b = demoDossier();
  a.versions[0].content.price = "modifié";
  assert.notEqual(a.versions[0].content.price, b.versions[0].content.price);
});
