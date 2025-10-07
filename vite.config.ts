import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  server: {
    proxy: {
      // If VITE_AXON_PROXY_TARGET is provided, proxy UI calls to backend
      '/api/axon': {
        target: process.env.VITE_AXON_PROXY_TARGET || undefined,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/axon/, ''),
        // Only enable proxy when target exists
        bypass: (_req, _res, _options) => {
          return process.env.VITE_AXON_PROXY_TARGET ? undefined : '/api/axon-bypass'
        },
      },
    },
  },
});
