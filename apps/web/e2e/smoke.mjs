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
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, '__screens__');
mkdirSync(shots, { recursive: true });
const BASE = 'http://localhost:4173';

/** Espera (hasta 5 s) a que el elemento sea visible: evita carreras con el pintado asíncrono. */
const visible = (locator) => locator.first().waitFor({ timeout: 5000 }).then(() => true, () => false);
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
  const ctx = await browser.newContext({ ...devices['iPhone 15 landscape'], acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  await page.goto(BASE);
  const folder = page.getByRole('button', { name: /^Carpeta de expedientes/ });
  await folder.waitFor();
  check(true, 'El escritorio carga en horizontal');
  check((await page.getByRole('dialog').count()) === 0, 'Sin aviso de giro en horizontal');
  for (const name of [/^Carpeta de expedientes/, /^Calendario:/, /^Teléfono:/, /^Máquina de escribir:/, /^Lámpara:/, /^Libreta:/]) {
    check(await visible(page.getByRole('button', { name })), `Objeto interactivo visible: ${name.source}`);
  }
  check(await visible(page.getByRole('img', { name: /^Placa: Novato, investigador DL-\d{5}-[A-Z]/ })), 'Placa con rango y número de investigador local');
  const calLabel = await page.getByRole('button', { name: /^Calendario:/ }).getAttribute('aria-label');
  check(/Diario nº 1 de 500/.test(calLabel ?? ''), `El calendario arranca en el diario nº 1 (${calLabel})`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(overflow <= 0, `Sin desbordamiento horizontal (${overflow}px)`);
  await page.waitForTimeout(5000); // deja desaparecer el aviso de "listo sin conexión"
  await page.screenshot({ path: join(shots, 'desk-landscape.png') });

  // Zonas seguras simuladas (notch a la izquierda en horizontal)
  await page.addStyleTag({ content: ':root{--safe-left:59px;--safe-right:59px;--safe-bottom:21px}' });
  await page.waitForTimeout(200);
  const lampBox = await page.getByRole('button', { name: /^Lámpara:/ }).boundingBox();
  const phoneBox = await page.getByRole('button', { name: /^Teléfono:/ }).boundingBox();
  const vw = page.viewportSize().width;
  check(!!lampBox && lampBox.x >= 59 - 2, `La lámpara respeta la zona segura izquierda (x=${lampBox?.x.toFixed(0)})`);
  check(!!phoneBox && phoneBox.x + phoneBox.width <= vw - 59 + 12, `El teléfono respeta la zona segura derecha (fin=${(phoneBox.x + phoneBox.width).toFixed(0)})`);
  await page.screenshot({ path: join(shots, 'desk-landscape-safe-area.png') });
  await page.reload();
  await folder.waitFor();

  // Nota de bienvenida opcional
  await page.getByRole('button', { name: /Nota de bienvenida/ }).click();
  await page.getByRole('heading', { name: 'Bienvenido al archivo' }).waitFor();
  await page.screenshot({ path: join(shots, 'desk-guide.png') });
  await page.getByRole('button', { name: 'Retirar la nota' }).click();
  await page.getByRole('button', { name: /Nota de bienvenida/ }).waitFor({ state: 'detached' });
  await page.waitForTimeout(300); // la escritura en IndexedDB es asíncrona
  await page.reload();
  await folder.waitFor();
  check((await page.getByRole('button', { name: /Nota de bienvenida/ }).count()) === 0, 'La nota retirada no vuelve a aparecer');

  // Cadenita de la lámpara
  await page.getByRole('button', { name: 'Apagar la lámpara' }).click();
  check((await page.evaluate(() => document.documentElement.dataset.lamp)) === 'off', 'La cadenita apaga la lámpara');
  await page.waitForTimeout(300);
  await page.reload();
  await folder.waitFor();
  await page.waitForFunction(() => document.documentElement.dataset.lamp === 'off');
  check(true, 'El estado de la lámpara persiste tras recargar');
  await page.getByRole('button', { name: 'Encender la lámpara' }).click();

  // Objeto → sección (con animación de apertura)
  await folder.click();
  await page.waitForURL('**/archivo');
  await page.getByRole('link', { name: /Revelado en negro/ }).waitFor({ timeout: 5000 });
  check(true, 'La carpeta abre la Biblioteca con el primer expediente');
  await page.getByRole('link', { name: /Escritorio/ }).click();
  await folder.waitFor();
  await page.getByRole('button', { name: /^Teléfono:/ }).click();
  await page.waitForURL('**/telefono');
  await page.getByText('En preparación · Etapa 6').waitFor({ timeout: 3000 });
  check(true, 'Las secciones pendientes declaran honestamente su etapa');
  await page.getByRole('link', { name: /Volver al escritorio/ }).click();
  await folder.waitFor();

  // Lámpara → Ajustes
  await page.getByRole('button', { name: /^Lámpara:/ }).click();
  await page.waitForURL('**/lampara');
  await page.getByRole('tab', { name: 'Luz' }).waitFor();
  check(true, 'La lámpara abre los Ajustes');
  await page.getByRole('tab', { name: 'Lectura' }).click();
  const slider = page.getByRole('slider', { name: 'Tamaño del texto' });
  await slider.focus();
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
  const scale = await page.evaluate(() => document.documentElement.style.getPropertyValue('--text-scale'));
  check(scale === '1.2', `El tamaño de texto se aplica al instante (${scale})`);
  await page.getByRole('tab', { name: 'Oficina' }).click();
  await page.getByText('Caoba de despacho').click();
  await page.screenshot({ path: join(shots, 'settings-office.png') });
  await page.reload();
  await page.getByRole('tab', { name: 'Lectura' }).click();
  check((await page.getByRole('slider', { name: 'Tamaño del texto' }).inputValue()) === '1.2', 'Los ajustes persisten tras recargar');
  await page.getByRole('link', { name: /Escritorio/ }).click();
  await folder.waitFor();
  const blotter = await page.evaluate(() => getComputedStyle(document.querySelector('main')).getPropertyValue('--blotter').trim());
  check(blotter === '#4f1a1f', `La mesa usa el material elegido (${blotter})`);
  await page.screenshot({ path: join(shots, 'desk-mahogany.png') });

  // Archivo personal: exportar → importar
  await page.goto(BASE + '/lampara');
  await page.getByRole('tab', { name: 'Archivo' }).click();
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Descargar archivo' }).click()]);
  const file = join(shots, download.suggestedFilename());
  await download.saveAs(file);
  const exported = JSON.parse(readFileSync(file, 'utf8'));
  check(exported.format === 'deadline-archive' && /^[a-f0-9]{64}$/.test(exported.checksum), `Exporta una copia válida (${download.suggestedFilename()})`);
  check(exported.data.settings.textScale === 1.2 && exported.data.profile.equipped.desk === 'desk-mahogany', 'La copia contiene ajustes y oficina');
  await page.getByText('Nunca').waitFor({ state: 'detached' });
  check(true, 'Se registra la fecha de la última copia');
  await page.locator('input[type=file]').setInputFiles(file);
  await page.getByText(/^Copia de DL-/).waitFor();
  await page.screenshot({ path: join(shots, 'settings-import.png') });
  await page.getByRole('button', { name: 'Fusionar' }).click();
  await page.getByText('Copia fusionada correctamente.').waitFor();
  check(true, 'Importa y fusiona la copia');
  const broken = join(shots, 'roto.json');
  writeFileSync(broken, JSON.stringify({ ...exported, data: { ...exported.data, profile: { ...exported.data.profile, points: 99999 } }, checksum: exported.checksum }));
  await page.locator('input[type=file]').setInputFiles(broken);
  await page.getByText(/suma de control no coincide/).waitFor();
  check(true, 'Rechaza una copia manipulada o dañada');

  // Diagnóstico
  await page.goto(BASE + '/diagnostico');
  await page.getByText('Operativa · v2').waitFor();
  check(true, 'IndexedDB operativa');
  await page.getByRole('button', { name: 'Probar escritura local' }).click();
  await page.getByText(/Correcta · /).waitFor();
  check(true, 'Escritura y lectura en IndexedDB');
  await page.screenshot({ path: join(shots, 'diagnostics.png') });

  // Ruta inexistente
  await page.goto(BASE + '/no-existe');
  check(await visible(page.getByRole('heading', { name: 'Este expediente no figura en el archivo' })), 'Página 404 temática');

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
  await page.getByRole('button', { name: /^Carpeta de expedientes/ }).waitFor({ timeout: 5000 });
  const tw = await page.getByRole('button', { name: /^Máquina de escribir/ }).getAttribute('aria-label');
  check(/sin conexión/.test(tw ?? ''), 'Arranca sin conexión y lo indica en la máquina de escribir');
  await page.goto(BASE + '/libreta');
  check(await visible(page.getByRole('heading', { name: 'Libreta del investigador' })), 'Navegación offline a rutas profundas');
  await ctx.setOffline(false);

  check(errors.length === 0, `Sin errores de consola${errors.length ? ': ' + errors.join(' | ') : ''}`);
  await ctx.close();

  // ── Vertical ──────────────────────────────────────────────────────────────
  const pctx = await browser.newContext({ ...devices['iPhone 15'] });
  const p = await pctx.newPage();
  await p.goto(BASE);
  await p.getByRole('dialog').waitFor();
  check(await visible(p.getByRole('heading', { name: 'Gira el dispositivo' })), 'En vertical invita a girar el dispositivo');
  check((await p.locator('[inert]').count()) === 1, 'La app queda inerte pero montada (no pierde estado)');
  await p.screenshot({ path: join(shots, 'portrait.png') });
  await p.setViewportSize({ width: 852, height: 393 });
  await p.getByRole('dialog').waitFor({ state: 'detached' });
  check(await visible(p.getByRole('button', { name: /^Carpeta de expedientes/ })), 'Al girar aparece el escritorio sin recargar');
  await pctx.close();
} finally {
  await browser.close();
  // npx lanza vite como proceso hijo: se termina el grupo completo.
  process.kill(-server.pid, 'SIGTERM');
}

console.log(failures ? `\n${failures} comprobaciones fallidas` : '\nTodas las comprobaciones superadas');
process.exit(failures ? 1 : 0);
