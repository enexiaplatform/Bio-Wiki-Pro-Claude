import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [
          remarkFrontmatter,
          // exposes the YAML frontmatter as a named `frontmatter` export
          [remarkMdxFrontmatter, { name: "frontmatter" }],
        ],
      }),
    },
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      "@content": path.resolve(import.meta.dirname, "content"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-dom") || id.includes("/react/") || id.includes("scheduler") || id.includes("wouter"))
            return "react-vendor";
          if (id.includes("framer-motion") || id.includes("motion-dom") || id.includes("motion-utils"))
            return "motion";
          // NOTE: do NOT force react-markdown/remark into a manual chunk. Doing so
          // made a shared low-level module land in that chunk, which react-vendor
          // then imported — pulling the full markdown stack (~157KB) onto EVERY
          // page via react-vendor. Letting Rollup co-locate it with its lazy
          // importers (GatedContent, LegalShell) keeps it off the landing path.
          if (id.includes("@radix-ui")) return "radix";
          // Everything else: let Rollup co-locate with its importing route chunk
          // (route-only deps don't bloat the initial critical path).
          return undefined;
        },
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
      // content/ lives at the repo root (outside the client/ Vite root)
      allow: [path.resolve(import.meta.dirname)],
    },
  },
});
