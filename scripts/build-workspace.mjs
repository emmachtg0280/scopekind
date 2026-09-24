import { build } from "esbuild";
import { mkdir, copyFile } from "node:fs/promises";

export async function buildWorkspace(outdir = "dist/client") {
  await mkdir(`${outdir}/workspace`, { recursive: true });
  await build({
    entryPoints: ["src/workspace/main.jsx"],
    bundle: true,
    minify: true,
    jsx: "automatic",
    format: "iife",
    target: ["es2022"],
    outfile: `${outdir}/workspace/workspace.js`,
    loader: { ".svg": "dataurl", ".woff2": "dataurl", ".woff": "dataurl" },
    define: { "process.env.NODE_ENV": '"production"' },
    legalComments: "eof",
    metafile: true,
  });
  await copyFile("src/workspace.html", `${outdir}/workspace.html`);
}
