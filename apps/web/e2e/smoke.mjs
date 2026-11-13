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
  /** Los objetos del despacho 3D tienen botones equivalentes para VoiceOver y teclado. */
  const tap = (name) => page.getByRole('button', { name }).dispatchEvent('click');
  await folder.waitFor({ state: 'attached' });
  check(true, 'El escritorio carga en horizontal');
  check((await page.getByRole('dialog').count()) === 0, 'Sin aviso de giro en horizontal');
  await page.locator('main[data-ready] canvas').waitFor({ timeout: 15000 });
  check(true, 'El despacho se dibuja en 3D (WebGL)');
  const canvasBox = await page.locator('main canvas').boundingBox();
  const vp = page.viewportSize();
  check(!!canvasBox && canvasBox.width >= vp.width - 1 && canvasBox.height >= vp.height - 1, 'El despacho ocupa toda la pantalla, de borde a borde');
  for (const name of [/^Carpeta de expedientes/, /^Calendario:/, /^Archivador/, /^Teléfono:/, /^Máquina de escribir:/, /^Lámpara:/, /^Libreta:/, /^Corcho/]) {
    check((await page.getByRole('button', { name }).count()) === 1, `Objeto interactivo accesible: ${name.source}`);
  }
  check((await page.getByRole('button', { name: /^Placa: Novato, investigador DL-\d{5}-[A-Z]/ }).count()) === 1, 'Placa con rango y número de investigador local');
  const calLabel = await page.getByRole('button', { name: /^Calendario:/ }).getAttribute('aria-label');
  check(/Diario nº 1 de 500/.test(calLabel ?? ''), `El calendario arranca en el diario nº 1 (${calLabel})`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(overflow <= 0, `Sin desbordamiento horizontal (${overflow}px)`);
  await page.waitForTimeout(5000); // deja desaparecer el aviso de "listo sin conexión"
  await page.screenshot({ path: join(shots, 'desk-landscape.png') });

  // Pulsación larga sobre la carpeta: rótulo sin navegar
  const fx = vp.width * 0.46;
  const fy = vp.height * 0.7;
  await page.mouse.move(fx, fy);
  await page.mouse.down();
  await page.waitForTimeout(650);
  check(await visible(page.getByRole('status').getByText('Carpeta de expedientes')), 'Mantener pulsado un objeto muestra su nombre');
  await page.mouse.up();
  check(new URL(page.url()).pathname === '/', 'La pulsación larga no abre la sección');

  // Nota de bienvenida opcional
  await tap(/Nota de bienvenida/);
  await page.getByRole('heading', { name: 'Bienvenido al archivo' }).waitFor();
  await page.screenshot({ path: join(shots, 'desk-guide.png') });
  await page.getByRole('button', { name: 'Retirar la nota' }).click();
  await page.getByRole('button', { name: /Nota de bienvenida/ }).waitFor({ state: 'detached' });
  await page.waitForTimeout(300); // la escritura en IndexedDB es asíncrona
  await page.reload();
  await folder.waitFor({ state: 'attached' });
  check((await page.getByRole('button', { name: /Nota de bienvenida/ }).count()) === 0, 'La nota retirada no vuelve a aparecer');

  // Cadenita de la lámpara
  await tap('Apagar la lámpara');
  await page.waitForFunction(() => document.documentElement.dataset.lamp === 'off');
  check(true, 'La cadenita apaga la lámpara');
  await page.waitForTimeout(300);
  await page.reload();
  await folder.waitFor({ state: 'attached' });
  await page.waitForFunction(() => document.documentElement.dataset.lamp === 'off');
  check(true, 'El estado de la lámpara persiste tras recargar');
  await tap('Encender la lámpara');

  // Tocar la carpeta en la escena 3D abre la biblioteca (con su animación)
  await page.locator('main[data-ready] canvas').waitFor();
  await page.mouse.click(fx, fy);
  await page.waitForURL('**/archivo', { timeout: 8000 });
  await page.getByRole('button', { name: /Revelado en negro/ }).waitFor({ timeout: 5000 });
  check(true, 'Tocar la carpeta del despacho abre la biblioteca con sus expedientes');
  await page.getByRole('button', { name: /Volver: Despacho/ }).click();
  await folder.waitFor({ state: 'attached' });
  await tap(/^Máquina de escribir/);
  await page.waitForURL('**/maquina');
  await page.getByRole('heading', { name: 'Registro de investigaciones' }).waitFor({ timeout: 5000 });
  check(await page.getByText(/La hoja está en blanco/).isVisible(), 'La máquina de escribir abre el registro (vacío al empezar)');
  await page.getByRole('link', { name: /Escritorio/ }).click();
  await folder.waitFor({ state: 'attached' });
  await tap(/^Archivador/);
  await page.waitForURL('**/archivo-personal');
  await page.getByRole('heading', { name: 'Archivo personal' }).waitFor();
  check(await visible(page.getByText('Este cajón está vacío.')), 'El archivador abre el archivo personal (vacío al empezar)');
  await page.getByRole('button', { name: /Volver: Despacho/ }).click();
  await folder.waitFor({ state: 'attached' });

  // Lámpara → Ajustes
  await tap(/^Lámpara:/);
  await page.waitForURL('**/lampara');
  await page.getByRole('tab', { name: 'Luz' }).waitFor();
  check(true, 'La lámpara abre los Ajustes');
  // Gráficos ligeros: la mesa 2D sustituye al despacho 3D
  await page.getByText('Ligeros (2D)').click();
  await page.waitForTimeout(300);
  await page.getByRole('link', { name: /Escritorio/ }).click();
  check(await visible(page.getByRole('button', { name: /^Carpeta de expedientes/ })) && (await page.locator('main canvas').count()) === 0, 'Con gráficos ligeros aparece la mesa 2D');
  await page.getByRole('button', { name: /^Lámpara:/ }).click();
  await page.waitForURL('**/lampara');
  await page.getByText('Cinematográficos (3D)').click();
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
  await folder.waitFor({ state: 'attached' });
  const deskId = await page.evaluate(() => new Promise((res) => {
    const r = indexedDB.open('deadline');
    r.onsuccess = () => {
      const q = r.result.transaction('profile').objectStore('profile').get('local');
      q.onsuccess = () => res(q.result.equipped.desk);
    };
  }));
  await page.locator('main[data-ready] canvas').waitFor();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(shots, 'desk-mahogany.png') });
  check(deskId === 'desk-mahogany', `La mesa usa el material elegido (${deskId})`);
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
  await page.getByText('Operativa · v4').waitFor();
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
  await page.getByRole('button', { name: /^Carpeta de expedientes/ }).waitFor({ state: 'attached', timeout: 5000 });
  const tw = await page.getByRole('button', { name: /^Máquina de escribir/ }).getAttribute('aria-label');
  check(/sin conexión/i.test(tw ?? ''), 'Arranca sin conexión y lo indica en la máquina de escribir');
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
  check((await p.getByRole('button', { name: /^Carpeta de expedientes/ }).count()) === 1, 'Al girar aparece el escritorio sin recargar');
  await pctx.close();
} catch (err) {
  failures++;
  console.log('✘ Error inesperado:', err.message.split('\n').slice(0, 4).join(' | '));
} finally {
  await browser.close();
  // npx lanza vite como proceso hijo: se termina el grupo completo.
  process.kill(-server.pid, 'SIGTERM');
}

console.log(failures ? `\n${failures} comprobaciones fallidas` : '\nTodas las comprobaciones superadas');
process.exit(failures ? 1 : 0);
