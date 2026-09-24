import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildWorkspace } from "./build-workspace.mjs";
await buildWorkspace();
let html = await readFile("dist/client/workspace.html", "utf8");
const css = await readFile("dist/client/workspace/workspace.css", "utf8");
const js = await readFile("dist/client/workspace/workspace.js", "utf8");
const favicon = await readFile("src/favicon.svg", "utf8");
html = html
  .replace(
    '<link rel="icon" href="/favicon.svg" />',
    `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(favicon)}" />`,
  )
  .replace(
    '<link rel="stylesheet" href="/workspace/workspace.css" />',
    () => `<style>${css.replace(/<\/style/gi, "<\\/style")}</style>`,
  )
  .replace(
    '<script src="/workspace/workspace.js" defer></script>',
    () => `<script>${js.replace(/<\/script/gi, "<\\/script")}</script>`,
  );
await mkdir(".sites-runtime/preview", { recursive: true });
await writeFile(".sites-runtime/preview/ScopeKind_Astryx.html", html);
console.log("Standalone preview: .sites-runtime/preview/ScopeKind_Astryx.html");
