/**
 * Prueba E2E de la Etapa 4: diario del día, reloj por marcas de tiempo
 * (con reloj simulado), avisos, tapar sin pausar, cierre por tiempo,
 * reapertura pagando puntos, descarga verificada, juego sin conexión y
 * detección de almacenamiento borrado por el sistema.
 *
 * Uso: npm run build && node e2e/stage4.mjs
 */
import { chromium, devices } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, '__screens__');
mkdirSync(shots, { recursive: true });
const BASE = 'http://localhost:4178';
/** Espera (hasta 5 s) a que el elemento sea visible: evita carreras con el pintado asíncrono. */
const visible = (locator) => locator.first().waitFor({ timeout: 5000 }).then(() => true, () => false);
let failures = 0;
const check = (cond, msg) => {
  console.log(`${cond ? '✔' : '✘'} ${msg}`);
  if (!cond) failures++;
};

const server = spawn('npx', ['vite', 'preview', '--port', '4178', '--strictPort'], { cwd: join(here, '..'), stdio: 'pipe', detached: true });
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('preview no arrancó')), 20000);
  server.stdout.on('data', (d) => String(d).includes('4178') && (clearTimeout(t), resolve()));
});

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ ...devices['iPhone 15 landscape'], viewport: { width: 852, height: 393 } });
  const p = await ctx.newPage();
  // Una recarga completa justo después de una acción puede abortar la escritura
  // de IndexedDB aún en curso (equivale a matar la app en ese instante). Las
  // navegaciones de la prueba esperan a que la escritura termine.
  const goto = async (url) => {
    await p.waitForTimeout(300);
    await p.goto(url);
  };
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => m.type() === 'error' && !/ERR_INTERNET_DISCONNECTED|Failed to load resource/.test(m.text()) && errors.push(m.text()));
  await p.clock.install({ time: new Date('2026-11-12T10:00:00') });
  const D = `${BASE}/expediente/DL-D-0001`;
  const idb = (fn) => p.evaluate((src) => new Promise((res) => {
    const r = indexedDB.open('deadline');
    r.onsuccess = () => res(new Function('db', `return (${src})(db)`)(r.result));
  }), fn.toString());
  const lupaTap = async (text) => {
    const b = p.getByRole('button', { name: 'Examinar con lupa' });
    if (await b.count()) await b.click();
    await p.getByText(text).first().click();
    await p.waitForTimeout(100);
  };
  const open = async (name) => {
    await goto(`${D}/evidencias`);
    await p.getByRole('link', { name }).first().click();
    await p.getByRole('button', { name: /Examinar con lupa|Lupa activa/ }).waitFor();
  };

  // ── Diario del día ────────────────────────────────────────────────────────
  await goto(BASE);
  await p.getByRole('button', { name: /^Calendario:.*Caso del día sin abrir/ }).waitFor();
  check(true, 'El calendario de la mesa avisa del caso del día');
  await p.getByRole('button', { name: /^Calendario:/ }).click();
  await p.waitForURL('**/calendario');
  await p.getByText('Cenizas en el Celio').waitFor();
  check(await visible(p.getByText('Día 1 de 500')), 'El calendario empieza en el día 1 de 500');
  await p.screenshot({ path: join(shots, 'calendar.png') });
  await p.getByText('Cenizas en el Celio').click();
  await p.getByRole('button', { name: /Romper el precinto/ }).click();
  await p.getByRole('timer').waitFor();
  await goto(D);
  await p.getByRole('heading', { name: 'Hechos documentados' }).waitFor();
  check(await visible(p.getByText('Inspirado en hechos reales').first()), 'El diario muestra su origen real');
  check(await visible(p.getByRole('heading', { name: 'Recreación narrativa' })), 'Separa los hechos documentados de la recreación');

  // Descubrimientos antes de que se acabe el tiempo
  await open(/Informe del vigil/);
  await lupaTap('Junto a él, el candelabro');
  await lupaTap('dentro seguía una bolsa');
  await lupaTap('Bajo el lecho de lectura');
  await open(/Examen del médico/);
  await lupaTap('Ni en la boca ni en la nariz');
  await open(/Declaración de Davo/);
  await lupaTap('Llevaba el pelo recogido');
  await goto(`${D}/interrogatorio/ch-filon`);
  await p.getByRole('tab', { name: /El arca/ }).click();
  await p.getByRole('button', { name: /¿Qué había en el arca/ }).click();
  await open(/Inventario del arca/);
  await lupaTap('Cofrecillo con los pagarés');
  await goto(`${D}/evidencias`);
  await p.getByRole('button', { name: 'Relacionar piezas' }).click();
  await p.getByRole('button', { name: /El dinero sigue en el arca/ }).click();
  await p.getByRole('button', { name: /Solo faltan los vencimientos/ }).click();
  await p.getByRole('button', { name: 'Relacionar', exact: true }).click();
  await p.getByText('No fue un saqueo').first().waitFor();
  check(true, 'Deducción del diario: no fue un saqueo');

  // ── Reloj: avisos, tapar sin pausar, expiración ──────────────────────────
  await p.clock.fastForward('50:30');
  await p.getByText('Quedan 10 minutos.').waitFor({ timeout: 5000 });
  check(true, 'Aviso a falta de 10 minutos (el reloj cuenta aunque no se haga nada)');
  await p.getByRole('timer').click();
  await p.getByText('Expediente tapado').waitFor();
  const before = await p.getByRole('heading', { name: /\d+:\d\d/ }).innerText();
  await p.clock.fastForward('02:00');
  await p.waitForTimeout(300);
  const after = await p.getByRole('heading', { name: /\d+:\d\d/ }).innerText();
  check(before !== after, `Tapar el expediente no detiene el reloj (${before} → ${after})`);
  await p.screenshot({ path: join(shots, 'pause.png') });
  await p.getByRole('button', { name: 'Destapar y seguir' }).click();
  await p.clock.fastForward('10:00');
  await p.getByRole('timer', { name: 'Expediente cerrado' }).waitFor({ timeout: 5000 });
  check(true, 'Al agotarse los 60 minutos el expediente se cierra solo');
  await goto(`${D}/informe`);
  await p.getByText('Cerrado por tiempo').first().waitFor();
  const points = await idb((db) => new Promise((res) => {
    const q = db.transaction('profile').objectStore('profile').get('local');
    q.onsuccess = () => res(q.result.points);
  }));
  check(points >= 150, `Los descubrimientos se cobran al cerrar por tiempo (${points} puntos)`);
  check((await p.getByRole('button', { name: 'Acusar' }).count()) === 0, 'Cerrado: ya no se puede acusar');

  // ── Reapertura (la primera es gratuita, la segunda se paga) ──────────────
  check(await visible(p.getByText(/primera reapertura de cada expediente es/)), 'Se anuncia que la primera reapertura es gratuita');
  await p.getByRole('button', { name: 'Reabrir gratis' }).click();
  await p.getByRole('button', { name: 'Confirmar', exact: true }).click();
  await p.getByRole('timer').waitFor();
  await p.waitForTimeout(400);
  const timer = await p.getByRole('timer').innerText();
  check(/^(1:00:00|59:5\d)$/.test(timer), `La reapertura empieza con reloj nuevo (${timer})`);
  const readState = () => idb((db) => new Promise((res) => {
    const t = db.transaction(['profile', 'investigations', 'caseRecords']);
    const pr = t.objectStore('profile').get('local');
    const inv = t.objectStore('investigations').getAll();
    const rec = t.objectStore('caseRecords').get('DL-D-0001');
    t.oncomplete = () => res({ points: pr.result.points, reopens: rec.result.reopens, attempts: inv.result.map((i) => ({ a: i.attempt, ev: i.knowledge.evidence, asked: i.knowledge.asked })) });
  }));
  const after2 = await readState();
  check(after2.points === points && after2.reopens === 1, `La primera reapertura no cobra puntos (${points} → ${after2.points})`);
  const second = after2.attempts.find((x) => x.a === 2);
  check(!!second && second.ev.includes('ev-alfiler') && second.ev.includes('ev-inventario'), 'Se conservan las evidencias descubiertas');
  check(!!second && second.asked.length === 0, 'Las conversaciones empiezan de cero');
  await goto(D);
  check(await visible(p.getByText(/Intento nº 2/)), 'El historial registra el segundo intento');

  await p.clock.fastForward('01:01:00');
  await p.getByRole('timer', { name: 'Expediente cerrado' }).waitFor({ timeout: 5000 });
  await goto(`${D}/informe`);
  await p.getByRole('button', { name: /Reabrir por 150 puntos/ }).click();
  await p.getByRole('button', { name: 'Confirmar y pagar' }).click();
  await p.getByRole('timer').waitFor();
  await p.waitForTimeout(400);
  const after3 = await readState();
  check(after3.points === points - 150 && after3.reopens === 2, `La segunda reapertura cuesta 150 puntos (${points} → ${after3.points})`);

  // ── Archivo completo guardado solo y juego sin conexión ──────────────────
  await goto(`${BASE}/archivo`);
  await p.clock.runFor(3000);
  check((await p.getByRole('button', { name: /Descargar/ }).count()) === 0, 'No hay que descargar nada a mano');
  await p.getByText(/Archivo completo en el dispositivo: \d+ expedientes/).waitFor({ timeout: 20000 });
  const catalogSize = await p.evaluate(async () => (await (await fetch('/content/catalog.json')).json()).cases?.length ?? (await (await fetch('/content/catalog.json')).json()).length);
  const verified = await idb((db) => new Promise((res) => {
    const q = db.transaction('caseAssets').objectStore('caseAssets').getAll();
    q.onsuccess = () => res(q.result.filter((x) => x.state === 'verified').length);
  }));
  check(verified === catalogSize, `Todos los expedientes del catálogo se guardan solos y verificados (${verified}/${catalogSize})`);
  const card = p.locator('li', { hasText: 'Revelado en negro' });
  check(await visible(card.getByText('✓ En el dispositivo')), 'Cada expediente indica que está en el dispositivo');
  const status = await idb((db) => new Promise((res) => {
    const q = db.transaction('caseAssets').objectStore('caseAssets').get('DL-I-0001');
    q.onsuccess = () => res(q.result);
  }));
  check(status.state === 'verified' && status.missing.length === 0 && status.bytesStored === status.bytesExpected, 'Todos los recursos presentes y verificados');
  await p.screenshot({ path: join(shots, 'archive-offline.png') });

  await ctx.setOffline(true);
  await goto(`${BASE}/archivo`);
  await p.getByText('Revelado en negro').click();
  await p.getByRole('button', { name: /Romper el precinto/ }).click();
  await p.getByRole('timer').waitFor();
  await goto(`${BASE}/expediente/DL-I-0001/evidencias/ev-croquis`);
  const img = p.locator('img[alt^="Croquis"]');
  await img.waitFor();
  await p.waitForFunction(() => {
    const i = document.querySelector('img[alt^="Croquis"]');
    return i && i.complete && i.naturalWidth > 0;
  });
  check(true, 'Sin conexión: el expediente descargado se abre con sus imágenes');
  await ctx.setOffline(false);

  // ── El sistema borra el almacenamiento (simulado) y se recupera solo ─────
  await p.evaluate(() => caches.delete('deadline-cases-v1'));
  await ctx.setOffline(true);
  await goto(`${BASE}/archivo`);
  await p.clock.runFor(4000);
  await p.locator('li', { hasText: 'Revelado en negro' }).getByText('Se guardará solo con conexión').waitFor({ timeout: 8000 });
  check(true, 'Si el sistema borra los recursos, el expediente deja de figurar como guardado');
  await ctx.setOffline(false);
  await p.evaluate(() => window.dispatchEvent(new Event('online')));
  await p.locator('li', { hasText: 'Revelado en negro' }).getByText('✓ En el dispositivo').waitFor({ timeout: 20000 });
  check(true, 'Al volver la conexión se vuelve a guardar solo');

  check(errors.length === 0, `Sin errores de consola${errors.length ? ': ' + errors.join(' | ') : ''}`);
} catch (err) {
  failures++;
  console.log('✘ Error inesperado:', err.message.split('\n').slice(0, 4).join(' | '));
} finally {
  await browser.close();
  process.kill(-server.pid, 'SIGTERM');
}
console.log(failures ? `\n${failures} comprobaciones fallidas` : '\nTodas las comprobaciones superadas');
process.exit(failures ? 1 : 0);
