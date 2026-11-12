import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

const INK = '#171715';

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    VitePWA({
      // El usuario decide cuándo actualizar: nunca recargamos en mitad de un interrogatorio.
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icons/*.png'],
      manifest: {
        id: '/',
        name: 'DEADLINE — Timeless Crime Archive',
        short_name: 'DEADLINE',
        description: 'Archivo de expedientes criminales de todas las épocas. Investiga, interroga y resuelve.',
        lang: 'es',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        // iOS ignora esta clave; Android/Chromium la respeta al instalar. Ver docs/IOS_PWA.md.
        orientation: 'landscape',
        background_color: INK,
        theme_color: INK,
        categories: ['games', 'entertainment'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,webp}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        // Los recursos de expedientes NO se precachean aquí: se descargan por caso
        // y se verifican (Etapa 4). Este precache es solo el armazón de la app.
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      devOptions: { enabled: false },
    }),
  ],
  server: { port: 5173 },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
