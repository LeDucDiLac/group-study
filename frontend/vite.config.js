import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls đến json-server
      '/api': {
        target: 'https://dreadlock-tidiness-earring.ngrok-free.dev ',
        changeOrigin: true,
      },
    },
    allowedHosts: 
  },
})
