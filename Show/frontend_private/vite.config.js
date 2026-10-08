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
    allowedHosts: ['localhost', '127.0.0.1'],
    // ⬅️ PAS de bloc hmr : Vite utilisera ws://localhost:5174 par défaut
  },
  preview: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    allowedHosts: ['localhost', '127.0.0.1'],
  },
})