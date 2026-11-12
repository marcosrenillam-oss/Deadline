/**
 * Prueba de humo end-to-end sobre la build de producción (vite preview).
 * Emula un iPhone 15 en horizontal y en vertical con Chromium.
 *
 * Limitaciones conocidas: Chromium no emula env(safe-area-inset-*) ni el
 * comportamiento de Safari/WebKit en iOS. Las zonas seguras se comprueban
 * aquí con valores simulados; la validación definitiva es en iPhone físico.
 *
 * Uso: npm run build && npm run test:e2e
 */
import { chromium, devices } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, '__screens__');
mkdirSync(shots, { recursive: true });
const BASE = 'http://localhost:4173';

let failures = 0;
const check = (cond, msg) => {
  console.log(`${cond ? '✔' : '✘'} ${msg}`);
  if (!cond) failures++;
};

const server = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { cwd: join(here, '..'), stdio: 'pipe', detached: true });
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('preview no arrancó')), 20000);
  server.stdout.on('data', (d) => {
    if (String(d).includes('4173')) {
      clearTimeout(t);
      resolve();
    }
  });
});

const browser = await chromium.launch();
try {
  // ── Horizontal ────────────────────────────────────────────────────────────
  const ctx = await browser.newContext({ ...devices['iPhone 15 landscape'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  await page.goto(BASE);
  await page.getByRole('heading', { name: 'DEADLINE' }).waitFor();
  check(true, 'El escritorio carga en horizontal');
  check((await page.getByRole('dialog').count()) === 0, 'Sin aviso de giro en horizontal');
  check((await page.getByRole('navigation', { name: 'Secciones' }).getByRole('link').count()) === 7, 'Índice con 6 secciones + diagnóstico');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(overflow <= 0, `Sin desbordamiento horizontal (${overflow}px)`);
  await page.screenshot({ path: join(shots, 'desk-landscape.png') });

  // Zonas seguras simuladas (notch a la izquierda en horizontal)
  await page.addStyleTag({ content: ':root{--safe-left:59px;--safe-right:59px;--safe-bottom:21px}' });
  const box = await page.getByRole('heading', { name: 'DEADLINE' }).boundingBox();
  check(!!box && box.x >= 59, `El contenido respeta la zona segura izquierda (x=${box?.x.toFixed(0)})`);
  await page.screenshot({ path: join(shots, 'desk-landscape-safe-area.png') });
  await page.reload();
  await page.getByRole('heading', { name: 'DEADLINE' }).waitFor();

  // Navegación a una sección y vuelta
  await page.getByRole('link', { name: /Carpeta de expedientes/ }).click();
  await page.waitForURL('**/archivo');
  await page.getByRole('heading', { name: 'Biblioteca de expedientes' }).waitFor({ timeout: 3000 });
  check(true, 'Sección Biblioteca accesible');
  check(await page.getByText('En preparación · Etapa 3').isVisible(), 'La sección declara honestamente su etapa');
  await page.screenshot({ path: join(shots, 'section-archive.png') });
  await page.getByRole('link', { name: /Volver al escritorio/ }).click();
  await page.waitForURL(BASE + '/');
  check(true, 'Vuelta al escritorio');

  // Diagnóstico
  await page.goto(BASE + '/diagnostico');
  await page.getByText('Operativa · v1').waitFor();
  check(true, 'IndexedDB operativa');
  await page.getByRole('button', { name: 'Probar escritura local' }).click();
  await page.getByText(/Correcta · /).waitFor();
  check(true, 'Escritura y lectura en IndexedDB');
  await page.screenshot({ path: join(shots, 'diagnostics.png') });

  // Ruta inexistente
  await page.goto(BASE + '/no-existe');
  check(await page.getByRole('heading', { name: 'Este expediente no figura en el archivo' }).isVisible(), 'Página 404 temática');

  // Service worker y arranque offline
  await page.goto(BASE);
  const swReady = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return !!reg.active;
  });
  check(swReady, 'Service worker activo');
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await ctx.setOffline(true);
  await page.reload();
  await page.getByRole('heading', { name: 'DEADLINE' }).waitFor({ timeout: 5000 });
  check(await page.getByText('Sin conexión').isVisible(), 'Arranca sin conexión y lo indica');
  await page.goto(BASE + '/libreta');
  check(await page.getByRole('heading', { name: 'Libreta del investigador' }).isVisible(), 'Navegación offline a rutas profundas');
  await ctx.setOffline(false);

  check(errors.length === 0, `Sin errores de consola${errors.length ? ': ' + errors.join(' | ') : ''}`);
  await ctx.close();

  // ── Vertical ──────────────────────────────────────────────────────────────
  const pctx = await browser.newContext({ ...devices['iPhone 15'] });
  const p = await pctx.newPage();
  await p.goto(BASE);
  await p.getByRole('dialog').waitFor();
  check(await p.getByRole('heading', { name: 'Gira el dispositivo' }).isVisible(), 'En vertical invita a girar el dispositivo');
  check((await p.locator('[inert]').count()) === 1, 'La app queda inerte pero montada (no pierde estado)');
  await p.screenshot({ path: join(shots, 'portrait.png') });
  await p.setViewportSize({ width: 852, height: 393 });
  await p.getByRole('dialog').waitFor({ state: 'detached' });
  check(await p.getByRole('heading', { name: 'DEADLINE' }).isVisible(), 'Al girar aparece el escritorio sin recargar');
  await pctx.close();
} finally {
  await browser.close();
  // npx lanza vite como proceso hijo: se termina el grupo completo.
  process.kill(-server.pid, 'SIGTERM');
}

console.log(failures ? `\n${failures} comprobaciones fallidas` : '\nTodas las comprobaciones superadas');
process.exit(failures ? 1 : 0);
