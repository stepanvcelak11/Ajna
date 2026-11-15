import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { offlineServiceWorker } from './sw-plugin.ts';

// base './' so the build works on GitHub Pages sub-paths and any static host.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), offlineServiceWorker()],
});
