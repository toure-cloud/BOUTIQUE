import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    
    allowedHosts: [
      '.devtunnels.ms',        // tunnels VS Code
      '.app.github.dev',       // GitHub Codespaces
      '.githubpreview.dev',    // anciens Codespaces
      'localhost',
    ],
    // ✅ HMR compatible avec les tunnels (WebSocket sécurisé)
    hmr: {
      protocol: 'wss',
      clientPort: 443,
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    allowedHosts: [
      '.devtunnels.ms',
      '.app.github.dev',
      '.githubpreview.dev',
      'localhost',
    ],
  },
})