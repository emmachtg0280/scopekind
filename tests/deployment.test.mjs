import test from "node:test";
import assert from "node:assert/strict";
import redirect from "../server/legacy-redirect.mjs";
import worker from "../server/app.mjs";

test("ancienne adresse redirigée sans conserver une redirection en cache", async () => {
  const r = await redirect.fetch(
    new Request("https://scopekind.example/?source=old"),
    {},
  );
  assert.equal(r.status, 307);
  assert.equal(
    r.headers.get("location"),
    "https://sestet.emmachataigner.workers.dev/?source=old",
  );
  assert.equal(r.headers.get("cache-control"), "no-store");
});
test("site public : headers de protection et API fermée sans configuration", async () => {
  const env = {
    ASSETS: {
      fetch: async () =>
        new Response("<h1>Sestet</h1>", {
          headers: { "content-type": "text/html" },
        }),
    },
  };
  const page = await worker.fetch(new Request("https://sestet.example/"), env);
  assert.equal(page.headers.get("x-frame-options"), "DENY");
  assert.match(
    page.headers.get("content-security-policy"),
    /frame-ancestors 'none'/,
  );
  const api = await worker.fetch(
    new Request("https://sestet.example/api/v1/dossiers"),
    env,
  );
  assert.equal(api.status, 503);
  assert.equal(api.headers.get("cache-control"), "no-store");
});
