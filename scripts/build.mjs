import { mkdir, copyFile, rm } from "node:fs/promises";
await mkdir("dist/client", { recursive: true });
await mkdir("dist/server", { recursive: true });
// Remove retired assets from earlier builds; preserve the source archives.
for (const file of ["creative-studio.jpg", "creative-desk.jpg", "moss-meteor-digital.jpg", "moss-meteor-presentation.jpg", "sundae-radio-presentation.jpg", "studio-companion.png", "hokusai-red-fuji.jpg", "hokusai-great-wave.jpg", "cross-valley.jpg", "cross-stars.jpg"])
  await rm(`dist/client/${file}`, { force: true });
for (const file of [
  "index.html",
  "styles.css",
  "refinements.css",
  "demo.css",
  "dialog.css",
  "app.js",
  "favicon.svg",
  "pantry-tomatoes.jpg",
])
  await copyFile(`src/${file}`, `dist/client/${file}`);
await copyFile("src/worker.js", "dist/server/index.js");
console.log("Built client assets and Worker successfully.");
