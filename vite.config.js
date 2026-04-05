import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Task 3: Better Setup (Proxy Configuration)
// This file allows your frontend (port 5173) to communicate with your backend (port 5000) 
// as if it were the same origin, completely bypassing local CORS issues.

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://rivaansh-lifesciences.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
