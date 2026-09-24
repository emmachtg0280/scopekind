import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { database } from "../server/sqlite.mjs";
import { handle } from "../server/app.mjs";
import { verifyStripe } from "../server/services.mjs";
import { generate, stripe } from "../server/services.mjs";

test("une invitation expirée ferme une session client existante", async (t) => {
  const f = fixture(t),
    a = await login(f, "expiry@test.test"),
    d = await ready(f, a, await dossier(f, a));
  await call(
    f.env,
    `/dossiers/${d.id}/share`,
    "POST",
    {
      versionId: d.versions[0].id,
      revision: d.revision,
      email: "client@test.test",
    },
    a,
  );
  const inv = (await call(f.env, "/invitations", "GET", null, a)).body[0];
  const c = await login(f, "client@test.test", inv.id);
  f.DB.sqlite
    .prepare("UPDATE invitations SET expires=0 WHERE id=?")
    .run(inv.id);
  assert.equal((await call(f.env, "/client", "GET", null, c)).status, 403);
  assert.equal(
    (
      await call(
        f.env,
        "/client/respond",
        "POST",
        { id: "expired", type: "question", text: "Test" },
        c,
      )
    ).status,
    403,
  );
});
test("quota atomique : dix réservations empêchent un nouvel appel au fournisseur", async (t) => {
  const f = fixture(t),
    a = await login(f, "quota@test.test"),
    d = await dossier(f, a);
  const owner = f.DB.sqlite.prepare("SELECT id FROM users").get().id;
  f.DB.sqlite
    .prepare("UPDATE users SET billing_status='active',period_end=?")
    .run(Date.now() + 86400000);
  for (let i = 0; i < 10; i++)
    f.DB.sqlite
      .prepare(
        "INSERT INTO generations(id,owner,dossier,kind,status,created) VALUES(?,?,?,'initial','completed',?)",
      )
      .run("g" + i, owner, d.id, Date.now());
  const another = await dossier(f, a);
  Object.assign(f.env, {
    OPENAI_API_KEY: "test",
    OPENAI_MODEL: "test-model",
    FETCH: async () => {
      throw new Error("Must not call provider");
    },
  });
  const result = await call(
    f.env,
    `/dossiers/${another.id}/generate`,
    "POST",
    { id: "over-quota", versionId: another.versions[0].id, revision: 0 },
    a,
  );
  assert.equal(result.status, 429);
  assert.equal(
    f.DB.sqlite.prepare("SELECT COUNT(*) n FROM generations").get().n,
    10,
  );
});
test("source inventée écartée et clé Stripe réelle refusée", async () => {
  const content = Object.fromEntries(
    [
      "objectives",
      "deliverables",
      "assumptions",
      "exclusions",
      "dependencies",
      "questions",
    ].map((k) => [k, "Suggestion"]),
  );
  const env = {
    OPENAI_API_KEY: "test",
    OPENAI_MODEL: "test-model",
    FETCH: async () =>
      Response.json({
        status: "completed",
        output: [
          {
            content: [
              {
                type: "output_text",
                text: JSON.stringify({
                  content,
                  evidence: [
                    {
                      field: "objectives",
                      sourceId: "another-client",
                      quote: "confidential",
                    },
                  ],
                }),
              },
            ],
          },
        ],
      }),
  };
  await assert.rejects(
    () => generate(env, { brief: "Un brief synthétique." }, []),
    (e) => e.status === 502,
  );
  await assert.rejects(
    () => stripe({ STRIPE_SECRET_KEY: "sk_live_not_a_key" }, "prices/test"),
    (e) => e.status === 503,
  );
});
const origin = "https://sestet.test";
function fixture(t) {
  const DB = database(),
    mail = [];
  t.after(() => DB.close());
  const env = {
    DB,
    APP_ORIGIN: origin,
    SIGNUPS_ENABLED: "true",
    TEST_MAIL: async (m) => mail.push(m),
  };
  return { env, mail, DB };
}
async function call(env, path, method = "GET", body, cookie = "") {
  const r = await handle(
    new Request(origin + "/api/v1" + path, {
      method,
      headers: { origin, cookie, "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
    env,
  );
  return {
    status: r.status,
    body: await r.json(),
    cookie: r.headers.get("set-cookie")?.split(";")[0],
  };
}
async function login(f, email, invitation) {
  let r = await call(f.env, "/auth/request", "POST", { email, invitation });
  assert.equal(r.status, 200);
  const token = f.mail.at(-1).text.match(/connexion\/([a-f0-9]+)/)[1];
  r = await call(f.env, "/auth/verify", "POST", { token });
  assert.equal(r.status, 200);
  return r.cookie;
}
async function dossier(f, cookie) {
  const r = await call(
    f.env,
    "/dossiers",
    "POST",
    {
      client: "Atelier test",
      title: "Diagnostic",
      brief: "Un diagnostic demandé par une entreprise fictive.",
      sourceIds: [],
    },
    cookie,
  );
  assert.equal(r.status, 201);
  return r.body;
}
async function ready(f, cookie, d) {
  const v = d.versions.at(-1),
    content = Object.fromEntries(
      Object.keys(v.content).map((k) => [
        k,
        k === "questions"
          ? ""
          : "Information saisie et relue par le consultant.",
      ]),
    );
  const r = await call(
    f.env,
    `/dossiers/${d.id}/save`,
    "POST",
    {
      versionId: v.id,
      revision: d.revision,
      content,
      priceConfirmed: true,
      timelineConfirmed: true,
      privateNotes: "NOTE SECRÈTE",
    },
    cookie,
  );
  assert.equal(r.status, 200);
  return r.body;
}
test("comptes isolés, références privées et accès refusés sans authentification", async (t) => {
  const f = fixture(t),
    a = await login(f, "a@test.test"),
    b = await login(f, "b@test.test"),
    d = await dossier(f, a);
  assert.equal((await call(f.env, `/dossiers/${d.id}`)).status, 401);
  assert.equal(
    (await call(f.env, `/dossiers/${d.id}`, "GET", null, b)).status,
    404,
  );
  const doc = await call(
    f.env,
    "/documents",
    "POST",
    {
      title: "Méthode privée",
      text: "Cette méthode appartient uniquement au consultant A.",
      authorized: true,
    },
    a,
  );
  assert.equal(doc.status, 201);
  assert.deepEqual((await call(f.env, "/documents", "GET", null, b)).body, []);
  assert.equal(
    (
      await call(
        f.env,
        "/dossiers",
        "POST",
        {
          client: "Test",
          title: "Test",
          brief: "Test",
          sourceIds: [doc.body.id],
        },
        b,
      )
    ).status,
    404,
  );
  assert.equal((await call(f.env, "/admin", "GET", null, a)).status, 403);
  const forged = await handle(
    new Request(origin + "/api/v1/dossiers", {
      method: "POST",
      headers: { origin: "https://evil.test", cookie: a },
      body: "{}",
    }),
    f.env,
  );
  assert.equal(forged.status, 403);
});
test("lien à usage unique, expiration et déconnexion réelle", async (t) => {
  const f = fixture(t);
  await call(f.env, "/auth/request", "POST", { email: "a@test.test" });
  const token = f.mail.at(-1).text.match(/connexion\/([a-f0-9]+)/)[1];
  const logged = await call(f.env, "/auth/verify", "POST", { token });
  assert.equal(logged.status, 200);
  assert.equal(
    (await call(f.env, "/auth/verify", "POST", { token })).status,
    401,
  );
  await call(f.env, "/auth/logout", "POST", {}, logged.cookie);
  assert.equal(
    (await call(f.env, "/me", "GET", null, logged.cookie)).status,
    401,
  );
  await call(f.env, "/auth/request", "POST", { email: "a@test.test" });
  const expired = f.mail.at(-1).text.match(/connexion\/([a-f0-9]+)/)[1];
  f.DB.sqlite.exec("UPDATE challenges SET expires=0");
  assert.equal(
    (await call(f.env, "/auth/verify", "POST", { token: expired })).status,
    401,
  );
});
test("parcours consultant → client vérifié → accord → nouvelle version → révocation", async (t) => {
  const f = fixture(t),
    a = await login(f, "a@test.test");
  let d = await ready(f, a, await dossier(f, a));
  let v = d.versions[0];
  const share = await call(
    f.env,
    `/dossiers/${d.id}/share`,
    "POST",
    { versionId: v.id, revision: d.revision, email: "client@test.test" },
    a,
  );
  assert.equal(share.status, 200);
  d = share.body.dossier;
  const invitations = (await call(f.env, "/invitations", "GET", null, a)).body,
    inv = invitations[0];
  const count = f.mail.length;
  await call(f.env, "/auth/request", "POST", {
    email: "intrus@test.test",
    invitation: inv.id,
  });
  assert.equal(f.mail.length, count);
  const c = await login(f, "client@test.test", inv.id),
    view = await call(f.env, "/client", "GET", null, c);
  assert.equal(view.status, 200);
  assert.ok(!JSON.stringify(view.body).includes("SECRÈTE"));
  assert.equal((await call(f.env, "/dossiers", "GET", null, c)).status, 403);
  assert.equal(
    (
      await call(
        f.env,
        "/client/respond",
        "POST",
        { id: "r1", type: "approval" },
        c,
      )
    ).status,
    400,
  );
  const approval = await call(
    f.env,
    "/client/respond",
    "POST",
    { id: "r1", type: "approval", consent: true },
    c,
  );
  assert.equal(approval.body.status, "approved");
  d = (await call(f.env, `/dossiers/${d.id}`, "GET", null, a)).body;
  const revised = await call(
    f.env,
    `/dossiers/${d.id}/revise`,
    "POST",
    { versionId: v.id, revision: d.revision },
    a,
  );
  assert.equal(revised.status, 200);
  assert.equal(revised.body.versions[1].responses.length, 0);
  assert.equal(revised.body.versions[0].responses[0].type, "approval");
  assert.equal(
    (
      await call(
        f.env,
        "/client/respond",
        "POST",
        { id: "r2", type: "question", text: "Ancienne version" },
        c,
      )
    ).status,
    409,
  );
  await call(f.env, `/invitations/${inv.id}/revoke`, "POST", {}, a);
  assert.equal((await call(f.env, "/client", "GET", null, c)).status, 403);
});
test("sauvegarde concurrente, champs incomplets, doubles partages et fichiers invalides", async (t) => {
  const f = fixture(t),
    a = await login(f, "a@test.test"),
    d = await dossier(f, a),
    v = d.versions[0];
  assert.equal(
    (
      await call(
        f.env,
        `/dossiers/${d.id}/share`,
        "POST",
        { versionId: v.id, revision: 0, email: "c@test.test" },
        a,
      )
    ).status,
    400,
  );
  const saved = await ready(f, a, d);
  assert.equal(saved.revision, 1);
  const stale = await call(
    f.env,
    `/dossiers/${d.id}/save`,
    "POST",
    { versionId: v.id, revision: 0, content: v.content },
    a,
  );
  assert.equal(stale.status, 409);
  assert.equal(
    (
      await call(
        f.env,
        "/documents",
        "POST",
        { title: "x", text: "x", authorized: true },
        a,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        f.env,
        "/documents",
        "POST",
        { title: "x", text: "x".repeat(50001), authorized: true },
        a,
      )
    ).status,
    400,
  );
  await call(
    f.env,
    `/dossiers/${d.id}/share`,
    "POST",
    { versionId: v.id, revision: 1, email: "c@test.test" },
    a,
  );
  assert.equal(
    (
      await call(
        f.env,
        `/dossiers/${d.id}/share`,
        "POST",
        { versionId: v.id, revision: 1, email: "c@test.test" },
        a,
      )
    ).status,
    409,
  );
});
test("IA bornée aux références sélectionnées, prix préservé, erreurs sans quota", async (t) => {
  const f = fixture(t),
    a = await login(f, "a@test.test");
  let d = await ready(f, a, await dossier(f, a));
  const v = d.versions[0];
  f.DB.sqlite
    .prepare(
      "UPDATE users SET billing_status='active',period_end=?,period_start=0",
    )
    .run(Date.now() + 86400000);
  let sent;
  f.env.OPENAI_API_KEY = "test";
  f.env.OPENAI_MODEL = "configured-model";
  f.env.FETCH = async (url, opts) => {
    sent = JSON.parse(opts.body);
    return Response.json({
      status: "completed",
      model: "configured-model",
      usage: { input_tokens: 25, output_tokens: 50 },
      output: [
        {
          content: [
            {
              type: "output_text",
              text: JSON.stringify({
                content: Object.fromEntries(
                  Object.keys(v.content)
                    .filter((k) => !["price", "timeline"].includes(k))
                    .map((k) => [
                      k,
                      k === "questions"
                        ? "À confirmer."
                        : "Suggestion à relire.",
                    ]),
                ),
                evidence: [
                  {
                    field: "objectives",
                    sourceId: "brief",
                    quote: "diagnostic demandé",
                  },
                ],
              }),
            },
          ],
        },
      ],
    });
  };
  const result = await call(
    f.env,
    `/dossiers/${d.id}/generate`,
    "POST",
    { id: "generation-1", versionId: v.id, revision: d.revision },
    a,
  );
  assert.equal(result.status, 200);
  assert.equal(result.body.versions[0].content.price, v.content.price);
  assert.equal(sent.store, false);
  assert.deepEqual(JSON.parse(sent.input).sources, []);
  d = result.body;
  f.env.FETCH = async () => Response.json({ error: "outage" }, { status: 500 });
  assert.equal(
    (
      await call(
        f.env,
        `/dossiers/${d.id}/generate`,
        "POST",
        { id: "generation-2", versionId: v.id, revision: d.revision },
        a,
      )
    ).status,
    502,
  );
  assert.equal(
    f.DB.sqlite
      .prepare("SELECT COUNT(*) AS n FROM generations WHERE status='completed'")
      .get().n,
    1,
  );
});
test("webhook signé, événements répétés et ancien événement sans régression", async (t) => {
  const f = fixture(t),
    a = await login(f, "a@test.test");
  f.DB.sqlite.exec("UPDATE users SET customer='cus_test'");
  Object.assign(f.env, {
    STRIPE_SECRET_KEY: "sk_test_x",
    STRIPE_WEBHOOK_SECRET: "whsec_test",
    STRIPE_PRICE_ID: "price_test",
  });
  f.env.FETCH = async () =>
    Response.json({
      id: "sub_test",
      customer: "cus_test",
      livemode: false,
      status: "active",
      items: {
        data: [
          {
            quantity: 1,
            price: { id: "price_test" },
            current_period_start: 100,
            current_period_end: 200,
          },
        ],
      },
    });
  async function send(created, eventId) {
    const raw = JSON.stringify({
        id: eventId,
        created,
        livemode: false,
        type: "customer.subscription.updated",
        data: { object: { id: "sub_test", customer: "cus_test" } },
      }),
      timestamp = Math.floor(Date.now() / 1000);
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode("whsec_test"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sig = Buffer.from(
      await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(`${timestamp}.${raw}`),
      ),
    ).toString("hex");
    return handle(
      new Request(origin + "/api/v1/billing/webhook", {
        method: "POST",
        headers: { "stripe-signature": `t=${timestamp},v1=${sig}` },
        body: raw,
      }),
      f.env,
    );
  }
  assert.equal((await send(200, "evt_1")).status, 200);
  assert.equal((await send(200, "evt_1")).status, 200);
  assert.equal(
    f.DB.sqlite.prepare("SELECT COUNT(*) AS n FROM billing_events").get().n,
    1,
  );
  assert.equal((await send(100, "evt_old")).status, 200);
  assert.equal(
    f.DB.sqlite.prepare("SELECT billing_updated FROM users").get()
      .billing_updated,
    200,
  );
  await assert.rejects(() => verifyStripe("{}", "t=1,v1=bad", "key"));
  assert.equal(
    (await call(f.env, "/billing/checkout", "POST", {}, a)).status,
    409,
  );
});
test("restauration SQLite avec données persistantes", async () => {
  const dir = mkdtempSync(join(tmpdir(), "sestet-restore-"));
  try {
    const source = database(join(dir, "source.sqlite"));
    source.sqlite
      .prepare("INSERT INTO users(id,email,created) VALUES(?,?,?)")
      .run("u", "u@test.test", 1);
    source.sqlite
      .prepare(
        "INSERT INTO documents(id,owner,title,text,created) VALUES(?,?,?,?,?)",
      )
      .run("d", "u", "Méthode", "Document de restauration fictif", 1);
    const backup = join(dir, "backup.sqlite").replaceAll("'", "''");
    source.sqlite.exec(`VACUUM INTO '${backup}'`);
    source.close();
    const restored = database(join(dir, "backup.sqlite"));
    assert.equal(
      restored.sqlite
        .prepare("SELECT text FROM documents WHERE owner=?")
        .get("u").text,
      "Document de restauration fictif",
    );
    restored.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
