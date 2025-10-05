import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  build: {
    sourcemap: false, // disable source maps entirely
  },
  optimizeDeps: {
    esbuildOptions: {
      sourcemap: false, // disable sourcemap during optimization
    },
  },
})
