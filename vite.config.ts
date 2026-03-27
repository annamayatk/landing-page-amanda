import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Com `vercel dev` em http://127.0.0.1:3000, pode usar `npm run dev` em
    // outro terminal e o Vite repassa /api para as serverless functions.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
})
