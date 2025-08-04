import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis', // 👈 THIS fixes "global is not defined"
    process: { env: {} }, // some packages also expect `process.env`
  },
  server: {
    host: '0.0.0.0', // Allow access from network
  },
})

