import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: ['trainingplanner.sh3.su', 'localhost'],
    hmr: {
      clientPort: 443,
      protocol: 'wss',
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
})