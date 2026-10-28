import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// This public demo is served from the GitHub Pages project subpath
// (https://ahmed-spx.github.io/billing-management-system-demo/), so assets and
// the router basename resolve under `/billing-management-system-demo/`. The dev
// server stays at root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/billing-management-system-demo/' : '/',
  plugins: [react(), tailwindcss()],
}))
