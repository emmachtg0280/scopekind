import {
  sections,
  clientProjection,
  readiness,
  shareVersion,
  createRevision,
  recordResponse,
} from "../product/domain.mjs";
import {
  fail,
  hash,
  secret,
  sendMail,
  generate,
  stripe,
  verifyStripe,
} from "./services.mjs";
const now = () => Date.now();
const id = () => crypto.randomUUID();
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
      ...headers,
    },
  });
const q = (env, sql, ...args) => env.DB.prepare(sql).bind(...args);
const one = (env, sql, ...args) => q(env, sql, ...args).first();
const run = (env, sql, ...args) => q(env, sql, ...args).run();
const all = async (env, sql, ...args) =>
  (await q(env, sql, ...args).all()).results;
const text = (v, max = 15000) => {
  if (typeof v !== "string" || v.length > max)
    fail(400, "Texte manquant ou trop long.");
  return v.trim();
};
const emailOf = (v) => {
  const e = text(v, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
    fail(400, "Adresse email invalide.");
  return e;
};
const cookie = (token, env, age = 604800) =>
  `sestet_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${env.APP_ORIGIN.startsWith("https:") ? "; Secure" : ""}`;
async function rate(env, key, max) {
  const k = await hash(key),
    expiry = now() + 3600000;
  const result = await q(
    env,
    "INSERT INTO limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires<? THEN 1 ELSE count+1 END, expires=CASE WHEN expires<? THEN ? ELSE expires END RETURNING count",
    k,
    expiry,
    now(),
    now(),
    expiry,
  ).first();
  if (result.count > max)
    fail(429, "Trop de tentatives. Réessayez dans une heure.");
}
async function session(request, env) {
  const token = request.headers
    .get("cookie")
    ?.match(/(?:^|;\s*)sestet_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (!token) fail(401, "Connectez-vous pour continuer.");
  const result = await one(
    env,
    "SELECT * FROM sessions WHERE token=? AND expires>?",
    await hash(token),
    now(),
  );
  if (!result) fail(401, "Votre session a expiré. Demandez un nouveau lien.");
  return result;
}
async function ownerSession(request, env) {
  const s = await session(request, env);
  const user = await one(
    env,
    "SELECT * FROM users WHERE id=?",
    s.user_id || "",
  );
  if (!user || s.invitation) fail(403, "Accès réservé au consultant.");
  return user;
}
const admin = (env, user) =>
  (env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .includes(user.email);
async function owned(env, owner, dossierId) {
  const row = await one(
    env,
    "SELECT * FROM dossiers WHERE id=? AND owner=?",
    dossierId,
    owner,
  );
  if (!row) fail(404, "Dossier introuvable.");
  return { ...row, data: JSON.parse(row.data) };
}
async function save(env, row, data, expected) {
  if (expected !== row.revision)
    fail(409, "Ce dossier a changé. Rechargez avant de modifier.");
  const result = await run(
    env,
    "UPDATE dossiers SET data=?, revision=revision+1 WHERE id=? AND owner=? AND revision=?",
    JSON.stringify(data),
    row.id,
    row.owner,
    expected,
  );
  if (result.meta.changes !== 1)
    fail(
      409,
      "Une autre modification a été enregistrée. Rechargez le dossier.",
    );
  return { ...data, revision: expected + 1 };
}
const versionFor = (row, versionId) => {
  const v = row.data.versions.find((v) => v.id === versionId);
  if (!v) fail(404, "Version introuvable.");
  return v;
};
const event = (env, owner, type) =>
  run(
    env,
    "INSERT INTO events(id,owner,type,created) VALUES(?,?,?,?)",
    id(),
    owner,
    type,
    now(),
  );
const blank = (client, title, profile) => ({
  id: id(),
  number: 1,
  client,
  title,
  status: "draft",
  priceConfirmed: false,
  timelineConfirmed: false,
  sharedAt: null,
  responses: [],
  evidence: [],
  consultant: {
    name: profile.name || "",
    contact: profile.contact || "",
    logo: profile.logo || "",
  },
  content: Object.fromEntries(sections.map(([key]) => [key, ""])),
});

export async function handle(request, env) {
  try {
    if (!env.DB || !env.APP_ORIGIN)
      fail(
        503,
        "L’espace consultant n’est pas encore configuré. La démo reste accessible.",
      );
    const url = new URL(request.url),
      path = url.pathname.replace(/^\/api\/v1/, "");
    const write = !["GET", "HEAD"].includes(request.method);
    if (
      write &&
      path !== "/billing/webhook" &&
      request.headers.get("origin") !== env.APP_ORIGIN
    )
      fail(403, "Origine refusée.");
    if (Number(request.headers.get("content-length") || 0) > 300000)
      fail(413, "Contenu trop volumineux.");
    let body = {};
    if (write) {
      const raw = await request.text();
      if (raw.length > 300000) fail(413, "Contenu trop volumineux.");
      if (path === "/billing/webhook") return await webhook(raw, request, env);
      try {
        body = JSON.parse(raw || "{}");
      } catch {
        fail(400, "Requête invalide.");
      }
    }
    if (path === "/config" && request.method === "GET")
      return json({
        testMail: !!env.TEST_MAIL,
        email: !!(env.TEST_MAIL || (env.RESEND_API_KEY && env.MAIL_FROM)),
        ai: !!(env.OPENAI_API_KEY && env.OPENAI_MODEL),
        billing: !!(
          env.STRIPE_SECRET_KEY?.startsWith("sk_test_") && env.STRIPE_PRICE_ID
        ),
        billingMode: "test",
        support: env.SUPPORT_EMAIL || null,
      });
    if (path === "/auth/request" && request.method === "POST") {
      const email = emailOf(body.email);
      await rate(
        env,
        `login-ip:${request.headers.get("cf-connecting-ip") || "local"}`,
        30,
      );
      await rate(env, `login-email:${email}`, 5);
      let invitation = null;
      if (body.invitation) {
        invitation = await one(
          env,
          "SELECT * FROM invitations WHERE id=? AND revoked=0 AND expires>?",
          text(body.invitation, 100),
          now(),
        );
        if (!invitation || invitation.email !== email)
          return json({
            message:
              "Si l’adresse correspond à une invitation valide, un lien vous sera envoyé.",
          });
      } else if (
        env.SIGNUPS_ENABLED !== "true" &&
        !(await one(env, "SELECT id FROM users WHERE email=?", email))
      )
        fail(403, "Les inscriptions ne sont pas encore ouvertes.");
      const token = secret(),
        digest = await hash(token);
      await run(
        env,
        "INSERT INTO challenges(token,email,invitation,expires) VALUES(?,?,?,?)",
        digest,
        email,
        invitation?.id || null,
        now() + 900000,
      );
      try {
        await sendMail(
          env,
          email,
          "Votre accès Sestet",
          `Ouvrez ce lien pour confirmer votre adresse et accéder à Sestet. Il expire dans 15 minutes et ne fonctionne qu’une fois.\n\n${env.APP_ORIGIN}/#/connexion/${token}\n\nSi vous n’avez rien demandé, ignorez cet email.`,
        );
      } catch (e) {
        await run(env, "DELETE FROM challenges WHERE token=?", digest);
        throw e;
      }
      return json({
        message: "Consultez votre email. Le lien expire dans 15 minutes.",
      });
    }
    if (path === "/auth/verify" && request.method === "POST") {
      await rate(
        env,
        `verify:${request.headers.get("cf-connecting-ip") || "local"}`,
        60,
      );
      const digest = await hash(text(body.token, 100));
      const challenge = await one(
        env,
        "DELETE FROM challenges WHERE token=? AND expires>? RETURNING *",
        digest,
        now(),
      );
      if (!challenge)
        fail(
          401,
          "Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau.",
        );
      let userId = null;
      if (challenge.invitation) {
        const inv = await one(
          env,
          "SELECT id FROM invitations WHERE id=? AND email=? AND revoked=0 AND expires>?",
          challenge.invitation,
          challenge.email,
          now(),
        );
        if (!inv) fail(403, "L’invitation a expiré ou a été révoquée.");
      } else {
        await run(
          env,
          "INSERT INTO users(id,email,created) VALUES(?,?,?) ON CONFLICT(email) DO NOTHING",
          id(),
          challenge.email,
          now(),
        );
        userId = (
          await one(env, "SELECT id FROM users WHERE email=?", challenge.email)
        ).id;
      }
      const token = secret();
      await run(
        env,
        "INSERT INTO sessions(token,user_id,invitation,expires) VALUES(?,?,?,?)",
        await hash(token),
        userId,
        challenge.invitation,
        now() + (challenge.invitation ? 3600000 : 604800000),
      );
      return json(
        { role: challenge.invitation ? "client" : "consultant" },
        200,
        {
          "Set-Cookie": cookie(
            token,
            env,
            challenge.invitation ? 3600 : 604800,
          ),
        },
      );
    }
    if (path === "/auth/logout" && request.method === "POST") {
      const s = await session(request, env);
      await run(env, "DELETE FROM sessions WHERE token=?", s.token);
      return json({ ok: true }, 200, { "Set-Cookie": cookie("", env, 0) });
    }
    if (path.startsWith("/client"))
      return await clientRoute(request, env, path, body);
    const user = await ownerSession(request, env);
    if (path === "/me" && request.method === "GET") {
      const usage = await one(
        env,
        "SELECT COUNT(*) AS count FROM generations WHERE owner=? AND kind='initial' AND status IN ('running','completed') AND created>=?",
        user.id,
        user.period_start,
      );
      return json({
        id: user.id,
        email: user.email,
        profile: JSON.parse(user.profile),
        admin: admin(env, user),
        billing: {
          status: user.billing_status,
          periodEnd: user.period_end,
          used: usage.count,
          limit: 10,
          mode: "test",
        },
      });
    }
    if (path === "/profile" && request.method === "PUT") {
      const profile = Object.fromEntries(
        ["name", "activity", "contact", "services", "pricing"].map((k) => [
          k,
          text(body[k] || "", 5000),
        ]),
      );
      const logo = text(body.logo || "", 100000);
      if (
        logo &&
        !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(logo)
      )
        fail(400, "Logo PNG, JPEG ou WebP uniquement.");
      profile.logo = logo;
      await run(
        env,
        "UPDATE users SET profile=? WHERE id=?",
        JSON.stringify(profile),
        user.id,
      );
      return json(profile);
    }
    if (path === "/documents" && request.method === "GET")
      return json(
        await all(
          env,
          "SELECT id,title,text,created FROM documents WHERE owner=? ORDER BY created DESC",
          user.id,
        ),
      );
    if (path === "/documents" && request.method === "POST") {
      const title = text(body.title, 200),
        content = text(body.text, 50000);
      if (!title || content.length < 20 || body.authorized !== true)
        fail(
          400,
          "Ajoutez un titre, au moins 20 caractères et confirmez votre droit de réutilisation.",
        );
      const n = await one(
        env,
        "SELECT COUNT(*) AS n FROM documents WHERE owner=?",
        user.id,
      );
      if (n.n >= 100)
        fail(
          429,
          "Limite pilote : 100 références. Supprimez les références inutilisées.",
        );
      const doc = { id: id(), title, text: content, created: now() };
      await run(
        env,
        "INSERT INTO documents(id,owner,title,text,created) VALUES(?,?,?,?,?)",
        doc.id,
        user.id,
        title,
        content,
        doc.created,
      );
      return json(doc, 201);
    }
    if (path.startsWith("/documents/") && request.method === "DELETE") {
      await run(
        env,
        "DELETE FROM documents WHERE id=? AND owner=?",
        path.split("/")[2],
        user.id,
      );
      return json({ ok: true });
    }
    if (path === "/dossiers" && request.method === "GET")
      return json(
        (
          await all(
            env,
            "SELECT data,revision FROM dossiers WHERE owner=? ORDER BY created DESC",
            user.id,
          )
        ).map((r) => ({ ...JSON.parse(r.data), revision: r.revision })),
      );
    if (path === "/dossiers" && request.method === "POST") {
      const client = text(body.client, 200),
        title = text(body.title, 200),
        brief = text(body.brief, 20000);
      if (!client || !title || !brief)
        fail(400, "Client, titre et brief sont requis.");
      const sources = await selectedSources(env, user.id, body.sourceIds || []);
      const data = {
        id: id(),
        client,
        title,
        brief,
        sourceIds: sources.map((s) => s.id),
        privateNotes: "",
        versions: [blank(client, title, JSON.parse(user.profile))],
      };
      await run(
        env,
        "INSERT INTO dossiers(id,owner,data,created) VALUES(?,?,?,?)",
        data.id,
        user.id,
        JSON.stringify(data),
        now(),
      );
      await event(env, user.id, "dossier_created");
      return json({ ...data, revision: 0 }, 201);
    }
    const match = path.match(/^\/dossiers\/([^/]+)(?:\/([^/]+))?$/);
    if (match) {
      const row = await owned(env, user.id, match[1]),
        action = match[2];
      if (request.method === "GET" && !action)
        return json({ ...row.data, revision: row.revision });
      if (request.method === "DELETE" && !action) {
        await run(
          env,
          "DELETE FROM dossiers WHERE id=? AND owner=?",
          row.id,
          user.id,
        );
        return json({ ok: true });
      }
      if (request.method !== "POST") fail(405, "Méthode non autorisée.");
      const v = versionFor(row, body.versionId);
      if (action === "save") {
        if (!["draft", "ready"].includes(v.status))
          fail(
            409,
            "Créez une nouvelle version avant de modifier une proposition partagée.",
          );
        const content = Object.fromEntries(
          sections.map(([k]) => [k, text(body.content?.[k] ?? "")]),
        );
        Object.assign(v, {
          content,
          priceConfirmed: body.priceConfirmed === true,
          timelineConfirmed: body.timelineConfirmed === true,
        });
        v.status = readiness(v).length ? "draft" : "ready";
        row.data.privateNotes = text(body.privateNotes || "", 10000);
      } else if (action === "revise") {
        if (
          v.id !== row.data.versions.at(-1).id ||
          ["draft", "ready"].includes(v.status)
        )
          fail(409, "Terminez la version courante avant d’en créer une autre.");
        const next = createRevision(v, v.content, id());
        v.status = "superseded";
        row.data.versions.push(next);
      } else if (action === "duplicate") {
        const newData = {
          ...row.data,
          id: id(),
          title: row.data.title + " — copie",
          versions: [{ ...createRevision(v, v.content, id()), number: 1 }],
        };
        await run(
          env,
          "INSERT INTO dossiers(id,owner,data,created) VALUES(?,?,?,?)",
          newData.id,
          user.id,
          JSON.stringify(newData),
          now(),
        );
        return json({ ...newData, revision: 0 }, 201);
      } else if (action === "generate")
        return await generation(env, user, row, v, body);
      else if (action === "share") {
        if (!["draft", "ready"].includes(v.status))
          fail(409, "Cette version est déjà partagée.");
        if (readiness(v).length) fail(400, readiness(v).join(" · "));
        const target = emailOf(body.email),
          invite = id();
        Object.assign(v, shareVersion(v, new Date().toISOString()));
        // Persist and freeze before creating any invitation. Delivery failure can be retried.
        const updated = await save(env, row, row.data, body.revision);
        await run(
          env,
          "INSERT INTO invitations(id,dossier,version,email,expires,created) VALUES(?,?,?,?,?,?)",
          invite,
          row.id,
          v.id,
          target,
          now() + 7 * 86400000,
          now(),
        );
        let delivery = "sent";
        try {
          await inviteMail(env, target, invite);
        } catch {
          delivery = "failed";
        }
        await event(env, user.id, "proposal_shared");
        return json({ dossier: updated, delivery });
      } else if (action === "transcribe") {
        Object.assign(
          v,
          recordResponse(v, {
            type: body.type,
            text: text(body.text, 2000),
            provenance: "transcribed",
            at: new Date().toISOString(),
          }),
        );
      } else fail(404, "Action inconnue.");
      return json(await save(env, row, row.data, body.revision));
    }
    if (path === "/invitations" && request.method === "GET")
      return json(
        await all(
          env,
          "SELECT i.id,i.version,i.email,i.expires,i.revoked,i.dossier FROM invitations i JOIN dossiers d ON d.id=i.dossier WHERE d.owner=?",
          user.id,
        ),
      );
    const inviteMatch = path.match(/^\/invitations\/([^/]+)\/(revoke|resend)$/);
    if (inviteMatch && request.method === "POST") {
      const inv = await one(
        env,
        "SELECT i.* FROM invitations i JOIN dossiers d ON d.id=i.dossier WHERE i.id=? AND d.owner=?",
        inviteMatch[1],
        user.id,
      );
      if (!inv) fail(404, "Invitation introuvable.");
      if (inviteMatch[2] === "revoke")
        await run(env, "UPDATE invitations SET revoked=1 WHERE id=?", inv.id);
      else {
        if (inv.revoked || inv.expires < now())
          fail(409, "Invitation expirée ou révoquée.");
        await rate(env, `invite:${inv.id}`, 5);
        await inviteMail(env, inv.email, inv.id);
      }
      return json({ ok: true });
    }
    if (path === "/support" && request.method === "POST") {
      await rate(env, `support:${user.id}`, 5);
      await run(
        env,
        "INSERT INTO support_requests(id,owner,text,created) VALUES(?,?,?,?)",
        id(),
        user.id,
        text(body.text, 2000),
        now(),
      );
      return json({ ok: true });
    }
    if (path === "/admin" && request.method === "GET") {
      if (!admin(env, user)) fail(403, "Accès réservé à l’opératrice.");
      return json({
        users: await all(
          env,
          "SELECT id,email,created,billing_status,period_end FROM users",
        ),
        generations: await all(
          env,
          "SELECT owner,status,kind,created,input_tokens,output_tokens,model,error FROM generations ORDER BY created DESC LIMIT 100",
        ),
        events: await all(
          env,
          "SELECT type,COUNT(*) AS count FROM events GROUP BY type",
        ),
        support: await all(
          env,
          "SELECT s.id,u.email,s.text,s.created FROM support_requests s JOIN users u ON s.owner=u.id ORDER BY s.created DESC LIMIT 100",
        ),
      });
    }
    if (path === "/account" && request.method === "DELETE") {
      if (body.confirm !== user.email)
        fail(400, "Confirmez votre adresse pour supprimer votre espace.");
      if (
        user.billing_status === "active" ||
        user.billing_status === "trialing"
      )
        fail(
          409,
          "Annulez d’abord votre abonnement dans le portail de paiement.",
        );
      await env.DB.batch([
        q(env, "DELETE FROM sessions WHERE user_id=?", user.id),
        q(env, "DELETE FROM challenges WHERE email=?", user.email),
        q(env, "DELETE FROM events WHERE owner=?", user.id),
        q(env, "DELETE FROM users WHERE id=?", user.id),
      ]);
      return json({ ok: true }, 200, { "Set-Cookie": cookie("", env, 0) });
    }
    if (path === "/billing/checkout" && request.method === "POST") {
      if (
        user.billing_status === "active" ||
        user.billing_status === "trialing"
      )
        fail(409, "Un abonnement existe déjà. Utilisez le portail.");
      if (!env.STRIPE_PRICE_ID) fail(503, "Tarif test non configuré.");
      const price = await stripe(
        env,
        `prices/${encodeURIComponent(env.STRIPE_PRICE_ID)}`,
      );
      if (
        price.livemode ||
        price.unit_amount !== 4900 ||
        price.currency !== "usd" ||
        price.recurring?.interval !== "month" ||
        price.recurring?.interval_count !== 1
      )
        fail(503, "Le tarif test doit être de 49 USD par mois.");
      let customer = user.customer;
      if (!customer) {
        customer = (
          await stripe(
            env,
            "customers",
            { email: user.email, "metadata[sestet_user]": user.id },
            `customer-${user.id}`,
          )
        ).id;
        await run(
          env,
          "UPDATE users SET customer=? WHERE id=?",
          customer,
          user.id,
        );
      }
      const result = await stripe(
        env,
        "checkout/sessions",
        {
          customer,
          mode: "subscription",
          "line_items[0][price]": env.STRIPE_PRICE_ID,
          "line_items[0][quantity]": "1",
          success_url: `${env.APP_ORIGIN}/#/espace`,
          cancel_url: `${env.APP_ORIGIN}/#/espace`,
        },
        `checkout-${user.id}-${Math.floor(now() / 3600000)}`,
      );
      return json({ url: result.url });
    }
    if (path === "/billing/portal" && request.method === "POST") {
      if (!user.customer) fail(409, "Aucun abonnement à gérer.");
      const result = await stripe(env, "billing_portal/sessions", {
        customer: user.customer,
        return_url: `${env.APP_ORIGIN}/#/espace`,
      });
      return json({ url: result.url });
    }
    fail(404, "Page introuvable.");
  } catch (e) {
    return json(
      {
        error: e.status
          ? e.message
          : "Une erreur est survenue. Vos données enregistrées sont conservées.",
      },
      e.status || 500,
    );
  }
}
async function selectedSources(env, owner, ids) {
  if (
    !Array.isArray(ids) ||
    ids.length > 5 ||
    ids.some((s) => typeof s !== "string")
  )
    fail(400, "Sélectionnez au maximum cinq références.");
  const docs = [];
  for (const key of new Set(ids)) {
    const d = await one(
      env,
      "SELECT id,title,text FROM documents WHERE id=? AND owner=?",
      key,
      owner,
    );
    if (!d) fail(404, "Une référence n’est pas accessible.");
    docs.push(d);
  }
  return docs;
}
const inviteMail = (env, email, invitation) =>
  sendMail(
    env,
    email,
    "Une proposition vous attend sur Sestet",
    `Votre consultant vous invite à consulter une proposition. Vérifiez votre adresse pour y accéder :\n\n${env.APP_ORIGIN}/#/invitation/${invitation}\n\nInvitation valable sept jours, révocable par le consultant. Votre réponse concernera uniquement la version affichée.`,
  );
async function clientRoute(request, env, path, body) {
  const s = await session(request, env);
  const inv = await one(
    env,
    "SELECT * FROM invitations WHERE id=? AND revoked=0 AND expires>?",
    s.invitation || "",
    now(),
  );
  if (!inv) fail(403, "L’accès client a expiré ou a été révoqué.");
  const raw = await one(env, "SELECT * FROM dossiers WHERE id=?", inv.dossier);
  if (!raw) fail(404, "Proposition indisponible.");
  const row = { ...raw, data: JSON.parse(raw.data) },
    v = versionFor(row, inv.version);
  const project = () => ({
    ...clientProjection(v),
    status: v.status,
    responses: v.responses.map((r) => ({
      type: r.type,
      text: r.text,
      at: r.at,
      provenance: r.provenance,
      versionId: r.versionId,
    })),
  });
  if (path === "/client" && request.method === "GET") return json(project());
  if (path === "/client/respond" && request.method === "POST") {
    const responseId = text(body.id, 100);
    if (!responseId) fail(400, "Identifiant de réponse manquant.");
    if (v.responses.some((r) => r.id === responseId)) return json(project());
    if (!["shared", "changes_requested"].includes(v.status))
      fail(409, "Cette version n’accepte plus de réponse.");
    if (body.type === "approval" && body.consent !== true)
      fail(400, "Confirmez explicitement votre accord sur cette version.");
    if (!["approval", "changes", "question"].includes(body.type))
      fail(400, "Type de réponse invalide.");
    Object.assign(
      v,
      recordResponse(v, {
        id: responseId,
        type: body.type,
        text:
          body.type === "approval"
            ? "Accord explicite sur le périmètre, le prix et le calendrier de cette version."
            : text(body.text, 2000),
        provenance: "client",
        at: new Date().toISOString(),
      }),
    );
    await save(env, row, row.data, row.revision);
    await event(env, row.owner, "client_response");
    return json(project());
  }
  fail(404, "Action inconnue.");
}
async function generation(env, user, row, v, body) {
  if (!["draft", "ready"].includes(v.status))
    fail(409, "La version partagée est immuable.");
  if (body.revision !== row.revision)
    fail(409, "Rechargez le dossier avant la préparation.");
  if (
    !["active", "trialing"].includes(user.billing_status) ||
    user.period_end < now()
  )
    fail(402, "Un abonnement test actif est requis pour la préparation IA.");
  const sources = await selectedSources(env, user.id, row.data.sourceIds);
  if (!env.OPENAI_API_KEY || !env.OPENAI_MODEL)
    fail(503, "La préparation IA n’est pas encore configurée.");
  const generationId = text(body.id, 100);
  if (!generationId) fail(400, "Identifiant de préparation requis.");
  const previous = await one(
    env,
    "SELECT status FROM generations WHERE id=? AND owner=?",
    generationId,
    user.id,
  );
  if (previous)
    fail(409, "Cette préparation a déjà été demandée. Rechargez le dossier.");
  await run(
    env,
    "UPDATE generations SET status='failed',error='timeout' WHERE status='running' AND owner=? AND created<?",
    user.id,
    now() - 120000,
  );
  const used = await one(
    env,
    "SELECT id FROM generations WHERE dossier=? AND status='completed' LIMIT 1",
    row.id,
  );
  const kind = used ? "correction" : "initial";
  const generationLimit = kind === "initial" ? 10 : 3;
  const sql =
    kind === "initial"
      ? "SELECT COUNT(*) FROM generations WHERE owner=? AND kind='initial' AND status IN ('running','completed') AND created>=?"
      : "SELECT COUNT(*) FROM generations WHERE dossier=? AND kind='correction' AND status IN ('running','completed') AND created>=?";
  let inserted;
  try {
    inserted = await run(
      env,
      `INSERT INTO generations(id,owner,dossier,kind,status,created) SELECT ?,?,?,?,'running',? WHERE (${sql})<?`,
      generationId,
      user.id,
      row.id,
      kind,
      now(),
      kind === "initial" ? user.id : row.id,
      user.period_start,
      generationLimit,
    );
  } catch {
    fail(409, "Une préparation est déjà en cours sur ce dossier.");
  }
  if (!inserted.meta.changes)
    fail(
      429,
      kind === "initial"
        ? "Dix préparations utilisées pour cette période."
        : "Trois corrections IA utilisées pour ce dossier sur cette période. L’édition manuelle reste disponible.",
    );
  try {
    const result = await generate(env, row.data, sources);
    v.content = { ...v.content, ...result.content };
    v.evidence = result.evidence;
    v.status = "draft";
    // Price and timeline are never supplied by the model.
    const updated = await save(env, row, row.data, row.revision);
    await run(
      env,
      "UPDATE generations SET status='completed',input_tokens=?,output_tokens=?,model=? WHERE id=?",
      result.usage.input_tokens || 0,
      result.usage.output_tokens || 0,
      result.model,
      generationId,
    );
    await event(env, user.id, "proposal_generated");
    return json(updated);
  } catch (e) {
    await run(
      env,
      "UPDATE generations SET status='failed',error=? WHERE id=?",
      String(e.status || "provider_error"),
      generationId,
    );
    throw e;
  }
}
async function webhook(raw, request, env) {
  const ev = await verifyStripe(
    raw,
    request.headers.get("stripe-signature"),
    env.STRIPE_WEBHOOK_SECRET,
  );
  if (ev.livemode) fail(400, "Événements réels désactivés.");
  if (!ev.id || !Number.isFinite(ev.created)) fail(400, "Événement invalide.");
  if (await one(env, "SELECT id FROM billing_events WHERE id=?", ev.id))
    return json({ received: true });
  const obj = ev.data?.object;
  if (!ev.type?.startsWith("customer.subscription."))
    return json({ received: true });
  if (!obj?.id || !obj.customer) fail(400, "Abonnement manquant.");
  const current = await stripe(
    env,
    `subscriptions/${encodeURIComponent(obj.id)}`,
  );
  const item = current.items?.data?.[0];
  const valid =
    current.customer === obj.customer &&
    !current.livemode &&
    current.items?.data?.length === 1 &&
    item.price?.id === env.STRIPE_PRICE_ID &&
    item.quantity === 1;
  if (!valid) fail(400, "Abonnement non reconnu.");
  const start =
      (item.current_period_start || current.current_period_start || 0) * 1000,
    end = (item.current_period_end || current.current_period_end || 0) * 1000;
  await env.DB.batch([
    q(
      env,
      "UPDATE users SET subscription=?,billing_status=?,period_start=?,period_end=?,billing_updated=? WHERE customer=? AND billing_updated<=? AND NOT EXISTS(SELECT 1 FROM billing_events WHERE id=?)",
      current.id,
      current.status,
      start,
      end,
      ev.created,
      obj.customer,
      ev.created,
      ev.id,
    ),
    q(
      env,
      "INSERT INTO billing_events(id,created) VALUES(?,?) ON CONFLICT(id) DO NOTHING",
      ev.id,
      ev.created,
    ),
  ]);
  return json({ received: true });
}
export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname.startsWith("/api/v1/"))
      return handle(request, env);
    const response = await env.ASSETS.fetch(request),
      headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "no-referrer");
    headers.set("X-Frame-Options", "DENY");
    headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    );
    return new Response(response.body, { status: response.status, headers });
  },
};
