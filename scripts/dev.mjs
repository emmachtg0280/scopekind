import http from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import worker from "../src/worker.js";
const types = {
  html: "text/html",
  css: "text/css",
  js: "text/javascript",
  svg: "image/svg+xml",
  jpg: "image/jpeg",
  png: "image/png",
};
const assets = new Set([
  "index.html",
  "styles.css",
  "refinements.css",
  "demo.css",
  "dialog.css",
  "app.js",
  "favicon.svg",
  "pantry-tomatoes.jpg",
]);
await mkdir(".sites-runtime", { recursive: true });
const database = new DatabaseSync(".sites-runtime/pilot.sqlite");
database.exec(await readFile("migrations/0001_pilot.sql", "utf8"));
const DB = {
  prepare(sql) {
    return {
      bind(...values) {
        return {
          async run() {
            database.prepare(sql).run(...values);
            return { success: true };
          },
        };
      },
    };
  },
};
const server = http.createServer(async (incoming, outgoing) => {
  try {
    const url = new URL(incoming.url, "http://localhost:4173");
    if (url.pathname === "/api/pilot") {
      let body = "";
      for await (const chunk of incoming) {
        body += chunk;
        if (body.length > 8192) {
          outgoing.writeHead(413);
          outgoing.end();
          return;
        }
      }
      const request = new Request(url, {
        method: incoming.method,
        headers: incoming.headers,
        ...(!["GET", "HEAD"].includes(incoming.method) ? { body } : {}),
      });
      const response = await worker.fetch(request, { DB });
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      outgoing.end(await response.text());
      return;
    }
    const file = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    if (!assets.has(file)) {
      outgoing.writeHead(404);
      outgoing.end("Not found");
      return;
    }
    const content = await readFile(`src/${file}`);
    outgoing.writeHead(200, {
      "Content-Type": types[file.split(".").pop()],
      "Cache-Control": "no-store",
    });
    outgoing.end(content);
  } catch {
    outgoing.writeHead(500);
    outgoing.end("Internal server error");
  }
});
server.listen(4173, "127.0.0.1", () =>
  console.log("Local: http://localhost:4173"),
);
