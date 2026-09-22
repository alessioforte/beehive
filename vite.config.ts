import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

function normalizeBasePath(value: string | undefined) {
  const path = value?.trim();
  if (!path || path === "/") return "/";

  return `/${path.replace(/^\/+|\/+$/g, "")}/`;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: normalizeBasePath(env.VITE_BASE_PATH),
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL(".", import.meta.url)),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes("/node_modules/@codemirror/") ||
              id.includes("/node_modules/@uiw/") ||
              id.includes("/node_modules/codemirror/")
            ) {
              return "code-editor";
            }

            if (
              id.includes("/node_modules/react-markdown/") ||
              id.includes("/node_modules/remark-") ||
              id.includes("/node_modules/rehype-") ||
              id.includes("/node_modules/unified/")
            ) {
              return "markdown";
            }
          },
        },
      },
    },
  };
});
