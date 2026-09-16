import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isTunnel = !!process.env.CODESPACES || !!process.env.VSCODE_TUNNEL;

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: [
      '.devtunnels.ms',
      '.app.github.dev',
      '.githubpreview.dev',
      'localhost',
    ],
    hmr: isTunnel
      ? {
          protocol: 'wss',
          clientPort: 443,
          // ✅ IMPORTANT : spécifie le host du tunnel
          host: '7z6hftkf-3000.uks1.devtunnels.ms',
        }
      : true,   // ← localhost direct : laisse Vite gérer
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: [
      '.devtunnels.ms',
      '.app.github.dev',
      '.githubpreview.dev',
      'localhost',
    ],
  },
})