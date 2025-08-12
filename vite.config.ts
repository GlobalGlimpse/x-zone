import tailwindcss from '@tailwindcss/vite'
import react       from '@vitejs/plugin-react'
import laravel     from 'laravel-vite-plugin'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.tsx'],
      ssr:  'resources/js/ssr.tsx',
      refresh: true,
    }),
    react(),
    tailwindcss(),
  ],

  esbuild: { jsx: 'automatic' },

  /* ────────────────────────────────────────────────
     ▶  Ajout de l’alias « @ »  (ainsi que ziggy-js)
  ──────────────────────────────────────────────── */
  resolve: {
    alias: {
      '@':        resolve(__dirname, 'resources/js'), // ← ICI
      'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
    },
  },
})
