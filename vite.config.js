import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Base du site : garder `/` si le SPA est à la racine du domaine (cas Vercel habituel). */
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_URL ?? '/',
})
