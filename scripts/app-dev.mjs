import { createServer } from "node:http";
import { mkdirSync } from "node:fs";
import { database } from "../server/sqlite.mjs";
import { handle } from "../server/app.mjs";
mkdirSync(".sites-runtime", { recursive: true });
const DB = database(".sites-runtime/sestet.sqlite");
const outbox = [];
const testMail = process.argv.includes("--test-mail");
const env = {
  ...process.env,
  DB,
  APP_ORIGIN: "http://127.0.0.1:4180",
  SIGNUPS_ENABLED: "true",
};
if (testMail)
  env.TEST_MAIL = async (mail) => {
    if (!mail.email.endsWith(".test"))
      throw new Error("Local test addresses must end in .test");
    outbox.push(mail);
  };
const server = createServer(async (req, res) => {
  try {
    if (testMail && req.url === "/_test-mailbox.json") {
      // This route exists only in this loopback-only development server, never in the Worker.
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify(outbox));
      return;
    }
    if (testMail && req.url === "/_test-mailbox") {
      const esc = (s) =>
        s
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;");
      const messages = [...outbox]
        .reverse()
        .map((m) => {
          const link = m.text.match(/http:\/\/127\.0\.0\.1:4180\/#[^\s]+/)?.[0];
          return `<article><h2>${esc(m.subject)}</h2><p>${esc(m.email)}</p><p>${esc(m.text).replaceAll("\n", "<br>")}</p>${link ? `<a href="${esc(link)}">Ouvrir le lien fictif</a>` : ""}</article>`;
        })
        .join("");
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex",
      });
      res.end(
        `<!doctype html><html lang="fr"><meta charset="utf-8"><title>Emails fictifs Sestet</title><style>body{font:16px system-ui;max-width:800px;margin:40px auto;padding:20px}article{border-top:1px solid #ccc;padding:20px 0;overflow-wrap:anywhere}a{color:#234ed9}</style><h1>Emails fictifs Sestet</h1><p>Réservé aux tests locaux. Aucun email n’a été envoyé. Actualisez après une nouvelle demande.</p>${messages || "<p>Aucun email fictif pour le moment.</p>"}</html>`,
      );
      return;
    }
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 300000) {
        res.writeHead(413);
        res.end();
        return;
      }
      chunks.push(chunk);
    }
    const request = new Request(`http://127.0.0.1:4181${req.url}`, {
      method: req.method,
      headers: req.headers,
      ...(!["GET", "HEAD"].includes(req.method)
        ? { body: Buffer.concat(chunks) }
        : {}),
    });
    const response = await handle(request, env);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Erreur locale." }));
  }
});
server.listen(4181, "127.0.0.1", () =>
  console.log(
    `Sestet API: http://127.0.0.1:4181 · ${testMail ? "emails intercepted locally; use .test addresses" : "external email configuration required"}`,
  ),
);
process.on("SIGINT", () =>
  server.close(() => {
    DB.close();
    process.exit();
  }),
);
