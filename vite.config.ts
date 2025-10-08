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
    port: process.env.UI_PORT ? Number(process.env.UI_PORT) : undefined,
    host: process.env.HOST || undefined,
    proxy: process.env.VITE_AXON_PROXY_TARGET
      ? {
          '/api/axon': {
            target: process.env.VITE_AXON_PROXY_TARGET,
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api\/axon/, ''),
          },
        }
      : undefined,
  },
});
