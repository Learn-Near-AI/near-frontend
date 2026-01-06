import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  define: {
    global: 'window',
  },
  optimizeDeps: {
    include: ['buffer', 'near-api-js'],
  },
  publicDir: 'public', // Ensure public directory is copied (includes _redirects file)
})

