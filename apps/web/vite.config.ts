import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { copyFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

const INK = '#171715';

/**
 * Ruta base de publicación. En GitHub Pages el sitio de un proyecto se sirve
 * en https://<usuario>.github.io/<repositorio>/, así que el flujo de despliegue
 * define DEADLINE_BASE=/Deadline/. En local es '/'.
 */
const base = process.env.DEADLINE_BASE ?? '/';

/**
 * GitHub Pages no reescribe rutas: abrir /Deadline/archivo directamente daría
 * 404. Su convención es servir 404.html, así que copiamos la app ahí. Tras la
 * primera visita, el service worker resuelve todas las rutas sin red.
 */
function spaFallback() {
  return {
    name: 'deadline-spa-404',
    closeBundle() {
      const dist = resolve(import.meta.dirname, 'dist');
      copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'));
    },
  };
}

export default defineConfig({
  base,
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
        id: base,
        name: 'DEADLINE — Timeless Crime Archive',
        short_name: 'DEADLINE',
        description: 'Archivo de expedientes criminales de todas las épocas. Investiga, interroga y resuelve.',
        lang: 'es',
        dir: 'ltr',
        start_url: base,
        scope: base,
        display: 'standalone',
        // iOS ignora esta clave; Android/Chromium la respeta al instalar. Ver docs/IOS_PWA.md.
        orientation: 'landscape',
        background_color: INK,
        theme_color: INK,
        categories: ['games', 'entertainment'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,webp}', 'desk/desk.json'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        // Este precache es solo el armazón de la app. Los expedientes se descargan
        // por caso y se verifican (src/cases/downloads.ts).
        globIgnores: ['content/**', 'splash/**'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          {
            // Recursos de expedientes: misma caché que el gestor de descargas.
            // La URL lleva la huella (?v=), así que una corrección nunca sirve la copia vieja.
            urlPattern: ({ url }) => url.pathname.includes('/content/') && !url.pathname.endsWith('.json'),
            handler: 'CacheFirst',
            options: { cacheName: 'deadline-cases-v1', cacheableResponse: { statuses: [200] } },
          },
          {
            // Catálogo y expedientes: primero la red; sin conexión, la última copia.
            urlPattern: ({ url }) => url.pathname.includes('/content/') && url.pathname.endsWith('.json'),
            handler: 'NetworkFirst',
            options: { cacheName: 'deadline-content-meta', networkTimeoutSeconds: 4, cacheableResponse: { statuses: [200] } },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
    spaFallback(),
  ],
  server: { port: 5173 },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
