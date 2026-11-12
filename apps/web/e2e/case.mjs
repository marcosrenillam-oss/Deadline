/**
 * Prueba E2E: resolver DL-I-0001 «Revelado en negro» de principio a fin a
 * través de la interfaz, como lo haría un jugador (Chromium, iPhone 15 en
 * horizontal). Comprueba también el modo archivo y el informe final.
 *
 * Uso: npm run build && node e2e/case.mjs
 */
import { chromium, devices } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, '__screens__');
mkdirSync(shots, { recursive: true });
const BASE = 'http://localhost:4177';
let failures = 0;
const check = (cond, msg) => {
  console.log(`${cond ? '✔' : '✘'} ${msg}`);
  if (!cond) failures++;
};

const server = spawn('npx', ['vite', 'preview', '--port', '4177', '--strictPort'], { cwd: join(here, '..'), stdio: 'pipe', detached: true });
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('preview no arrancó')), 20000);
  server.stdout.on('data', (d) => String(d).includes('4177') && (clearTimeout(t), resolve()));
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
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const C = `${BASE}/expediente/DL-I-0001`;

  const openEvidence = async (name) => {
    await goto(`${C}/evidencias`);
    await p.getByRole('link', { name }).first().click();
    await p.getByRole('button', { name: /Examinar con lupa|Lupa activa/ }).waitFor();
  };
  const lupa = async () => {
    const b = p.getByRole('button', { name: 'Examinar con lupa' });
    if (await b.count()) await b.click();
  };
  const tapText = async (text) => {
    await p.getByText(text, { exact: false }).first().click();
    await p.waitForTimeout(120);
  };
  const knows = (key, id) => p.evaluate(([k, i]) => new Promise((res) => {
    const r = indexedDB.open('deadline');
    r.onsuccess = () => {
      const tx = r.result.transaction('investigations');
      const q = tx.objectStore('investigations').getAll();
      q.onsuccess = () => res(q.result.some((inv) => inv.knowledge[k].includes(i)));
    };
  }), [key, id]);

  // Archivo → portada → abrir
  await goto(`${BASE}/archivo`);
  await p.getByText('Revelado en negro').click();
  await p.getByRole('button', { name: /Romper el precinto/ }).click();
  await p.getByRole('timer').waitFor();
  check(/59:5\d|1:00:00/.test(await p.getByRole('timer').innerText()), 'El reloj arranca en 60 minutos al romper el precinto');

  // Informe del agente: el portal no fue forzado
  await openEvidence(/Informe del agente/);
  await lupa();
  await tapText('Me persono en el nº 41');
  check(!(await knows('details', 'dt-portal')), 'Una frase sin detalle no revela nada');
  await tapText('El portal de la calle no presenta');
  check(await knows('facts', 'fa-sin-forzar'), 'La lupa revela un detalle oculto en el texto');

  // Autopsia → laboratorio
  await openEvidence(/Informe de autopsia/);
  check(await knows('evidence', 'ev-laboratorio'), 'Leer la autopsia trae el análisis del laboratorio');
  await openEvidence(/Análisis del laboratorio/);
  await lupa();
  await tapText('Cianuro potásico en el té del termo');
  await tapText('El frasco y el tirador del armario');
  check(await knows('facts', 'fa-envenenado-termo'), 'El veneno estaba en el termo');

  // Cámara → hoja de contactos
  await openEvidence(/Nikon F3/);
  await lupa();
  await tapText('El contador marca 36');
  check(await knows('evidence', 'ev-contactos'), 'El carrete terminado da la hoja de contactos');

  // Hoja de contactos: tocar fotogramas con la lupa
  await openEvidence(/Hoja de contactos/);
  await lupa();
  const regions = { '21:42': 22, '22:02': 24, '22:12': 25, '22:32': 27, '23:12': 31 };
  for (const [time, i] of Object.entries(regions)) {
    const col = i % 6;
    const row = Math.floor(i / 6);
    const fx = (42 + col * 190 + 90) / 1200;
    const fy = (52 + row * 152 + 60) / 980;
    const img = p.locator('img[alt^="Hoja de contactos"]');
    // Desplaza el visor (como haría el jugador) hasta que el fotograma quede a la vista.
    await img.evaluate((el, f) => {
      const scroller = el.closest('[class*="imageScroll"]');
      const sheet = el.closest('article');
      sheet.scrollTop = scroller.offsetTop - 10;
      scroller.scrollTop = el.offsetHeight * f - scroller.clientHeight / 2;
    }, fy);
    const box = await img.boundingBox();
    await p.mouse.click(box.x + box.width * fx, box.y + box.height * fy);
    await p.waitForTimeout(150);
    void time;
  }
  check(await knows('details', 'dt-f2212'), 'Tocar el fotograma de las 22:12 revela la figura del paraguas');
  check(await knows('details', 'dt-f2142') && (await knows('details', 'dt-f2312')), 'Se advierten los demás fotogramas relevantes');
  await p.screenshot({ path: join(shots, 'case-contacts.png') });

  // Fotografía enmarcada y relación de piezas
  await openEvidence(/Fotografía enmarcada/);
  await goto(`${C}/evidencias`);
  await p.getByRole('button', { name: 'Relacionar piezas' }).click();
  await p.getByRole('button', { name: /22:12 — Una figura/ }).click();
  await p.getByRole('button', { name: /Fotografía enmarcada/ }).click();
  await p.getByRole('button', { name: 'Relacionar', exact: true }).click();
  await p.getByText('El paraguas del pato', { exact: false }).first().waitFor();
  check(await knows('facts', 'fa-paraguas-imogen'), 'Relacionar fotograma y fotografía identifica el paraguas');
  await p.getByRole('button', { name: /22:02 — Ashcroft bebe/ }).click();
  await p.getByRole('button', { name: /22:32 — Ashcroft se sirve/ }).click();
  await p.getByRole('button', { name: 'Relacionar', exact: true }).click();
  check(await knows('facts', 'fa-ventana'), 'Relacionar 22:02 y 22:32 acota la ventana del veneno');
  await p.screenshot({ path: join(shots, 'case-relate.png') });

  // Julian → carta del abogado
  await goto(`${C}/interrogatorio/ch-julian`);
  await p.getByRole('tab', { name: /El estudio/ }).click();
  await p.getByRole('button', { name: /planes inmediatos/ }).click();
  check(await knows('evidence', 'ev-carta-abogado'), 'Price menciona al abogado y aparece la carta');
  await openEvidence(/Carta del bufete/);
  await lupa();
  await tapText('remitimos copia de la presente');
  check(await knows('facts', 'fa-imogen-sabia'), 'Imogen recibió copia de la carta');

  // Imogen: coartada, entrada, acomodador
  await goto(`${C}/interrogatorio/ch-imogen`);
  await p.getByRole('button', { name: /¿Dónde estaba el viernes/ }).click();
  await p.getByRole('button', { name: /toda la función/ }).click();
  await p.getByRole('button', { name: /demostrar dónde se sentaba/ }).click();
  await p.screenshot({ path: join(shots, 'case-interrogation.png') });
  await openEvidence(/Entrada de teatro/);
  await lupa();
  await tapText('un sello de tinta azul');
  check(await knows('evidence', 'ev-acomodador'), 'La butaca lleva a la declaración del acomodador');
  await openEvidence(/Declaración del acomodador/);

  // Contradicción: la butaca frente al acomodador
  await p.getByRole('button', { name: 'Señalar una contradicción' }).click();
  const dialog = p.getByRole('dialog', { name: 'Señalar una contradicción' });
  const cols = dialog.locator('[class*="column"]');
  await cols.nth(0).getByRole('button', { name: /No me moví de mi butaca/ }).click();
  await cols.nth(1).getByRole('button', { name: /Declaración del acomodador/ }).click();
  await dialog.getByRole('button', { name: 'Señalar', exact: true }).click();
  await dialog.getByText('Imogen se movió de su butaca').first().waitFor();
  check(await knows('contradictions', 'cx-teatro'), 'Se señala la contradicción de la coartada');
  await p.screenshot({ path: join(shots, 'case-contradiction.png') });
  await p.keyboard.press('Escape');

  // Confrontación final
  await goto(`${C}/interrogatorio/ch-imogen`);
  await p.getByRole('tab', { name: /Su matrimonio/ }).click();
  await p.getByRole('button', { name: /La cámara de Desmond la fotografió/ }).click();
  await p.getByText('Él siempre tenía que quedarse con la última foto').waitFor();
  check(true, 'La confrontación final quiebra a Imogen');

  // Cronología y tablero
  await goto(`${C}/cronologia`);
  for (const t of ['Ashcroft bebe del termo sin daño', 'Una figura envenena el termo', 'Ashcroft se sirve del termo', 'Muerte de Desmond Ashcroft']) {
    await p.getByRole('button', { name: new RegExp(t) }).click();
  }
  check((await p.locator('ol li').count()) === 4, 'Se construye la cronología');
  await goto(`${C}/tablero`);
  await p.getByRole('button', { name: '+ Añadir' }).click();
  const picker = p.getByRole('dialog', { name: 'Añadir al tablero' });
  await picker.getByRole('button', { name: 'Imogen Ashcroft', exact: true }).click();
  await picker.getByRole('button', { name: 'Hoja de contactos del carrete', exact: true }).click();
  await p.keyboard.press('Escape');
  await p.getByRole('button', { name: 'Conectar' }).click();
  await p.getByRole('button', { name: /Persona: Imogen/ }).click();
  await p.getByRole('button', { name: /Evidencia: Hoja de contactos/ }).click();
  await p.waitForTimeout(500);
  const board = await p.evaluate(() => new Promise((res) => {
    const r = indexedDB.open('deadline');
    r.onsuccess = () => {
      const q = r.result.transaction('investigations').objectStore('investigations').getAll();
      q.onsuccess = () => res(q.result[0].board);
    };
  }));
  check(board.nodes.length === 2 && board.edges.length === 1, 'El tablero guarda tarjetas e hilos');
  await p.screenshot({ path: join(shots, 'case-board.png') });

  // Acusación
  await goto(`${C}/acusacion`);
  await p.getByRole('button', { name: /Imogen Ashcroft/ }).click();
  await p.getByText('Impedir que el lunes la apartara').click();
  await p.getByText('Echó cianuro del propio estudio').click();
  await p.getByRole('radiogroup').nth(2).getByText('Hoja de contactos del carrete').click();
  await p.getByRole('button', { name: 'Firmar el acta' }).click();
  await p.getByRole('button', { name: 'Sellar la acusación' }).click();
  await p.waitForURL('**/informe');
  await p.getByRole('heading', { name: 'La última foto' }).waitFor();
  check(true, 'Acusación completa con confesión: final «La última foto»');
  const total = Number((await p.locator('tr', { hasText: 'Total' }).locator('td').last().innerText()).trim());
  check(total > 800, `Puntuación obtenida: ${total}`);
  check(await p.getByText('Caso resuelto').first().isVisible(), 'Informe con sello de caso resuelto');
  await p.screenshot({ path: join(shots, 'case-report.png') });

  // Modo archivo: todo consultable, lo omitido marcado
  await goto(`${C}/evidencias`);
  check((await p.getByText('No encontrada').count()) > 0, 'En modo archivo se ven las evidencias no encontradas');
  check((await p.getByRole('button', { name: 'Acusar' }).count()) === 0, 'Un expediente cerrado no admite otra acusación');

  // Archivo y escritorio reflejan el resultado
  await goto(`${BASE}/archivo`);
  await p.getByRole('link', { name: /Revelado en negro/ }).getByText('Resuelto').waitFor();
  check(true, 'El archivo marca el expediente como resuelto');
  await goto(BASE);
  const solvedOnDesk = await p
    .getByRole('button', { name: /^Máquina de escribir.*Casos resueltos: 1/ })
    .waitFor({ timeout: 5000 })
    .then(() => true, () => false);
  check(solvedOnDesk, 'La máquina de escribir registra el caso resuelto');

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
