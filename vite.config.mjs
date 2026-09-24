import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  root: "product",
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 4180,
    strictPort: true,
    proxy: { "/api/v1": "http://127.0.0.1:4181" },
  },
  preview: { host: "127.0.0.1", port: 4180, strictPort: true },
  build: { outDir: "../dist/product", emptyOutDir: true },
});
