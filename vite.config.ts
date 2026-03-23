import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";


const host = process.env.TAURI_DEV_HOST;
const base = process.env.VITE_BASE_PATH || "/";

// https://vite.dev/config/
export default defineConfig(() => ({
  base,
  plugins: [react()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  // Externalize Tauri API when bundling for production web build so Rollup
  // does not try to resolve native Tauri modules.
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" as const : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (
            id.includes("react-markdown") ||
            id.includes("remark-") ||
            id.includes("rehype-") ||
            id.includes("unist-util-visit")
          ) {
            return "markdown-vendor";
          }

          if (
            id.includes("@codemirror") ||
            id.includes("@lezer") ||
            id.includes("codemirror")
          ) {
            return "editor-vendor";
          }

          if (
            id.includes("katex") ||
            id.includes("prismjs")
          ) {
            return "preview-vendor";
          }

          if (
            id.includes("react") ||
            id.includes("framer-motion") ||
            id.includes("react-icons")
          ) {
            return "ui-vendor";
          }
        },
      },
    },
  },
}));
