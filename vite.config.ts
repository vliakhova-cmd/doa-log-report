import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages serves the repo at /<repo>/, so every built asset URL has to
  // carry that prefix. Vite rewrites them from this one value at build time.
  // PAGES_BASE overrides this when the combined lms-ai site builds it.
  base: process.env.PAGES_BASE ?? (process.env.GITHUB_PAGES ? '/doa-log-report/' : '/'),
  plugins: [react()],
  // This project styles entirely with inline styles. Pin an empty PostCSS
  // config so Vite does not walk up and pick up the parent directory's
  // Tailwind setup, which does not apply here.
  css: { postcss: {} },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5175,
  },
});
