/**
 * Prueba E2E del cooperativo sin servidor (Etapa 6).
 *  1. Mesa compartida (un dispositivo): información dividida, poner sobre la
 *     mesa, pase de turno, deducciones con piezas de los dos papeles,
 *     acusación conjunta firmada por ambos.
 *  2. Correspondencia: dos contextos de navegador independientes (como dos
 *     iPhone, cada uno con su IndexedDB) intercambian invitación, aceptación,
 *     informes de campo, mensajes y la acusación conjunta por códigos.
 *
 * Uso: npm run build && node e2e/coop.mjs
 */
import { chromium, devices } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, '__screens__');
mkdirSync(shots, { recursive: true });
const BASE = 'http://localhost:4179';
const visible = (locator) => locator.first().waitFor({ timeout: 5000 }).then(() => true, () => false);
let failures = 0;
const check = (cond, msg) => {
  console.log(`${cond ? '✔' : '✘'} ${msg}`);
  if (!cond) failures++;
};

const server = spawn('npx', ['vite', 'preview', '--port', '4179', '--strictPort'], { cwd: join(here, '..'), stdio: 'pipe', detached: true });
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('preview no arrancó')), 20000);
  server.stdout.on('data', (d) => String(d).includes('4179') && (clearTimeout(t), resolve()));
});

const browser = await chromium.launch();
const device = { ...devices['iPhone 15 landscape'], viewport: { width: 852, height: 393 } };

/** Utilidades sobre una página (un "iPhone"). */
function phone(p) {
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errors.push(m.text()));
  const pause = () => p.waitForTimeout(300);
  return {
    p,
    errors,
    async evidence(name) {
      await p.getByRole('navigation', { name: 'Expediente' }).getByRole('link', { name: /^Evidencias/ }).click();
      await p.getByRole('link', { name }).first().click();
      await p.getByRole('button', { name: /Examinar con lupa|Lupa activa/ }).waitFor();
    },
    async tap(text, exact = false) {
      const b = p.getByRole('button', { name: 'Examinar con lupa' });
      if (await b.count()) await b.click();
      await p.getByText(text, { exact }).first().click();
      await pause();
    },
    async relate(a, b) {
      await p.getByRole('navigation', { name: 'Expediente' }).getByRole('link', { name: /^Evidencias/ }).click();
      // Si el modo «relacionar» sigue activo de la vez anterior, no hace falta volver a abrirlo.
      const open = p.getByRole('button', { name: 'Relacionar piezas' });
      await p.getByRole('button', { name: /^(Relacionar piezas|Terminar)$/ }).waitFor();
      if (await open.count()) await open.click();
      // Solo las fichas seleccionables (los avisos también son botones con el mismo texto).
      await p.locator('button[aria-pressed]', { hasText: a }).first().click();
      await p.locator('button[aria-pressed]', { hasText: b }).first().click();
      await p.getByRole('button', { name: 'Relacionar', exact: true }).click();
      await pause();
    },
    async knows(key, id) {
      return p.evaluate(
        ([k, i]) =>
          new Promise((res) => {
            const r = indexedDB.open('deadline');
            r.onsuccess = () => {
              const q = r.result.transaction('investigations').objectStore('investigations').getAll();
              q.onsuccess = () => res(q.result.some((inv) => inv.status === 'active' && inv.knowledge[k].includes(i)));
            };
          }),
        [key, id],
      );
    },
    async panel() {
      await p.getByRole('button', { name: /Papel [AB]/ }).click();
      await p.getByRole('dialog').waitFor();
    },
    async closePanel() {
      await p.keyboard.press('Escape');
      await pause();
    },
  };
}

try {
  // ═══ 1 · MESA COMPARTIDA ════════════════════════════════════════════════
  const ctx = await browser.newContext(device);
  const t = phone(await ctx.newPage());
  const { p } = t;
  await p.goto(`${BASE}/telefono`);
  await p.getByRole('button', { name: 'Nueva investigación' }).click();
  await p.getByRole('button', { name: /Punto de rocío/ }).click();
  await p.getByRole('button', { name: 'Empezar en este iPhone' }).click();
  await p.waitForURL('**/pareja/**');
  await p.getByRole('heading', { name: /Tu papel · A/ }).waitFor();
  check(/2:00:00|1:59:5\d/.test(await p.getByRole('timer').innerText()), 'Partida en pareja con reloj de 120 minutos');
  await p.getByRole('navigation', { name: 'Expediente' }).getByRole('link', { name: /^Evidencias/ }).click();
  await p.getByRole('link', { name: /Registro de accesos/ }).waitFor();
  check((await p.getByRole('link', { name: /Informe de la escena/ }).count()) === 0, 'A no ve las piezas de B (información dividida)');

  // A: accesos y consola
  await t.evidence(/Registro de accesos/);
  await t.tap('23:20', true);
  await t.evidence(/Actividad de la consola/);
  await t.tap('22:58–23:31', true);
  check(await t.knows('details', 'dt-macro'), 'A descubre la macro en la consola');
  await t.evidence(/Informes semanales/);
  await t.tap('Capacidad máxima de diseño');
  await t.evidence(/Diario de la terminal T-3/);
  await t.tap('eliminación definitiva');
  await t.relate(/Más agua de la que la torre/, /«Reservas_reales», borrada/);
  check(await t.knows('facts', 'fa-motivo'), 'A deduce el motivo con sus propios registros');
  await p.screenshot({ path: join(shots, 'coop-a.png') });

  // A pone todo sobre la mesa y pasa el turno
  await t.panel();
  await p.getByRole('button', { name: 'Poner sobre la mesa' }).click();
  await p.getByText(/Has puesto \d+ elementos sobre la mesa/).waitFor();
  check(true, 'A pone sus hallazgos sobre la mesa');
  await p.screenshot({ path: join(shots, 'coop-table-panel.png') });
  await p.getByRole('button', { name: 'Pasar el turno a B' }).click();
  await p.getByRole('heading', { name: 'Pasa el iPhone a B' }).waitFor();
  await p.screenshot({ path: join(shots, 'coop-pass.png') });
  await p.getByRole('button', { name: 'Soy B: continuar' }).click();
  await p.getByRole('heading', { name: /Tu papel · B/ }).waitFor();
  check(true, 'Pantalla de pase de turno y cambio a B');
  await p.getByRole('navigation', { name: 'Expediente' }).getByRole('link', { name: /^Evidencias/ }).click();
  check(await visible(p.getByRole('link', { name: /Actividad de la consola/ })), 'B recibe lo que A puso sobre la mesa');

  // B: escena, dron, deducciones cruzadas
  await t.evidence(/Informe de la escena/);
  await t.tap('No lleva encima su tarjeta');
  await t.evidence(/Capturas del dron/);
  await t.tap('23:14', true);
  await t.relate(/Falta su tarjeta/, /La tarjeta de Selene, a las 23:20/);
  check(await t.knows('facts', 'fa-tarjeta-usada'), 'Deducción con una pieza de cada papel: la tarjeta usada tras la muerte');
  await t.relate(/Pulsaciones de reloj/, /La chaqueta naranja, a las 23:14/);
  check(await t.knows('facts', 'fa-coartada-falsa'), 'Deducción cruzada: la coartada de Draganis es una macro');

  // B: Draganis, taquilla, forense
  await p.getByRole('navigation', { name: 'Expediente' }).getByRole('link', { name: 'Personas' }).click();
  await p.getByRole('link', { name: /Nikos Draganis/ }).click();
  await p.getByRole('link', { name: 'Interrogar' }).click();
  await p.getByRole('button', { name: /¿Dónde estaba anoche/ }).click();
  await p.getByRole('button', { name: /chaqueta de mantenimiento/ }).click();
  await t.evidence(/Registro de la taquilla 12/);
  await t.tap('La manga derecha tiene un desgarrón');
  await t.evidence(/Informe forense/);
  await t.tap('Bajo las uñas de la mano derecha');
  await t.relate(/Fibras naranjas bajo las uñas/, /Un desgarrón en la manga/);
  check(await t.knows('facts', 'fa-chaqueta'), 'Las fibras llevan a la chaqueta de la taquilla 12');
  await p.getByRole('navigation', { name: 'Expediente' }).getByRole('link', { name: 'Personas' }).click();
  await p.getByRole('link', { name: /Nikos Draganis/ }).click();
  await p.getByRole('link', { name: 'Interrogar' }).click();
  await p.getByRole('tab', { name: /Selene Markou/ }).click();
  await p.getByRole('button', { name: /Una macro tecleaba por usted/ }).click();
  await p.getByText(/Solo quería la tarjeta/).waitFor();
  check(true, 'Confrontación final: Draganis confiesa');

  // B propone la acusación conjunta
  await p.getByRole('button', { name: 'Acusación conjunta' }).click();
  await p.getByRole('button', { name: /Nikos Draganis/ }).click();
  await p.getByText('Impedir que salieran a la luz').click();
  await p.getByText('La empujó desde la pasarela').click();
  await p.getByRole('radiogroup').nth(2).getByText('Registro de la taquilla 12').click();
  await p.getByRole('button', { name: 'Firmar el acta' }).click();
  await p.getByRole('button', { name: 'Proponer al compañero' }).click();
  await p.getByRole('heading', { name: 'Esperando a tu compañero' }).waitFor();
  check(true, 'B propone la acusación: falta la firma de A');

  // Pase a A, que firma
  await t.panel();
  await p.getByRole('button', { name: 'Pasar el turno a A' }).click();
  await p.getByRole('button', { name: 'Soy A: continuar' }).click();
  await p.getByRole('heading', { name: /Tu papel · A/ }).waitFor();
  await p.getByRole('button', { name: 'Acusación conjunta' }).click();
  await p.getByRole('heading', { name: 'Tu compañero propone esta acusación' }).waitFor();
  await p.screenshot({ path: join(shots, 'coop-proposal.png') });
  await p.getByRole('button', { name: 'Firmar la acusación' }).click();
  await p.getByRole('heading', { name: 'Agua clara' }).waitFor({ timeout: 8000 });
  check(true, 'A firma: final «Agua clara» (confesión) para la pareja');
  await p.screenshot({ path: join(shots, 'coop-report.png') });
  const prof = await p.evaluate(() => new Promise((res) => {
    const r = indexedDB.open('deadline');
    r.onsuccess = () => {
      const t = r.result.transaction(['profile', 'investigations']);
      const pr = t.objectStore('profile').get('local');
      const iv = t.objectStore('investigations').getAll();
      t.oncomplete = () => res({ coop: pr.result.coopMerit, solo: pr.result.soloMerit, statuses: iv.result.map((i) => i.status) });
    };
  }));
  check(prof.coop > 0 && prof.solo === 0, `El mérito va al rango en pareja (${prof.coop}), no al individual`);
  check(prof.statuses.filter((x) => x === 'solved').length === 2, 'Las dos carpetas quedan resueltas');
  check(t.errors.length === 0, `Sin errores de consola en la mesa compartida${t.errors.length ? ': ' + t.errors.join(' | ') : ''}`);
  await ctx.close();

  // ═══ 1b · MESA COMPARTIDA CON EXPEDIENTE COMPARTIDO ════════════════════
  {
    const ctxS = await browser.newContext(device);
    const sh = phone(await ctxS.newPage());
    const q = sh.p;
    await q.goto(`${BASE}/telefono`);
    await q.getByRole('button', { name: 'Nueva investigación' }).click();
    await q.getByRole('button', { name: /La carta de marear/ }).click();
    await q.getByRole('button', { name: 'Empezar en este iPhone' }).click();
    await q.waitForURL('**/pareja/**');
    await q.getByRole('navigation', { name: 'Expediente' }).getByRole('link', { name: /^Evidencias/ }).click();
    check(await visible(q.getByRole('link', { name: /Primera carta anónima/ })), 'Expediente compartido: los dos ven todas las piezas');
    await q.getByRole('button', { name: 'Acusación conjunta' }).click();
    await q.getByRole('button', { name: /Rodrigo Zamudio/ }).click();
    await q.getByText('Arruinar a Arriaga para quedarse con su cátedra').click();
    await q.getByText('Amenazó con una denuncia firmada').click();
    await q.getByRole('radiogroup').nth(2).getByText('Primera carta anónima').click();
    await q.getByRole('button', { name: 'Firmar el acta' }).click();
    await q.getByRole('button', { name: 'Proponer al compañero' }).click();
    await q.getByRole('heading', { name: 'Esperando a tu compañero' }).waitFor();
    check((await q.getByRole('button', { name: 'Firmar la acusación' }).count()) === 0, 'Quien propone no puede firmar su propia propuesta');
    await q.getByRole('button', { name: 'Soy el compañero: revisar la propuesta' }).click();
    await q.getByRole('heading', { name: 'Tu compañero propone esta acusación' }).waitFor();
    await q.getByRole('button', { name: 'Firmar la acusación' }).click();
    await q.getByRole('heading', { name: 'El rival' }).waitFor({ timeout: 8000 });
    check(true, 'Expediente compartido: propuesta, entrega en mano, firma y final de la pareja');
    check(sh.errors.length === 0, `Sin errores de consola en el expediente compartido${sh.errors.length ? ': ' + sh.errors.join(' | ') : ''}`);
    await ctxS.close();
  }

  // ═══ 2 · CORRESPONDENCIA (dos dispositivos) ═════════════════════════════
  const host = phone(await (await browser.newContext(device)).newPage());
  const guest = phone(await (await browser.newContext(device)).newPage());
  await host.p.goto(`${BASE}/perfil`);
  await host.p.getByLabel('Alias').fill('archivera');
  await host.p.getByRole('button', { name: 'Guardar' }).click();
  await host.p.getByText('Alias guardado: archivera').waitFor();
  check(true, 'Perfil: alias guardado');
  await host.p.getByRole('button', { name: 'Generar mi tarjeta' }).click();
  check(/^DL1\./.test(await host.p.getByLabel('Tu tarjeta').inputValue()), 'Perfil: tarjeta de investigador en código');
  await host.p.screenshot({ path: join(shots, 'profile.png') });

  await host.p.goto(`${BASE}/telefono`);
  await host.p.getByRole('button', { name: 'Nueva investigación' }).click();
  await host.p.getByRole('button', { name: /Punto de rocío/ }).click();
  await host.p.getByRole('button', { name: 'Seré A' }).click();
  const invite = await host.p.getByLabel('Invitación').inputValue();
  check(invite.startsWith('DL1.') && invite.length < 400, `Invitación en código (${invite.length} caracteres)`);
  await host.p.screenshot({ path: join(shots, 'coop-invite.png') });

  await guest.p.goto(`${BASE}/telefono`);
  await guest.p.getByRole('button', { name: 'Unirme con un código' }).click();
  await guest.p.getByLabel('Invitación de tu compañero').fill(`Te mando esto: ${invite} ¡vamos!`);
  await guest.p.getByRole('button', { name: 'Leer invitación' }).click();
  await guest.p.getByText(/Te invita archivera/).waitFor();
  check(true, 'El invitado lee la invitación (aunque venga con texto alrededor)');
  await guest.p.getByRole('button', { name: 'Preparado' }).click();
  const accept = await guest.p.getByLabel('Código de aceptación').inputValue();
  await guest.p.getByRole('button', { name: 'Ir a la mesa' }).click();
  await guest.p.getByRole('heading', { name: /Tu papel · B/ }).waitFor();

  await host.p.getByLabel('Código de aceptación de tu compañero').fill(accept);
  await host.p.getByRole('button', { name: 'Empezar' }).click();
  await host.p.getByRole('heading', { name: /Tu papel · A/ }).waitFor();
  const [th, tg] = [await host.p.getByRole('timer').innerText(), await guest.p.getByRole('timer').innerText()];
  const secs = (x) => x.split(':').map(Number).reduce((a, b) => a * 60 + b, 0);
  check(Math.abs(secs(th) - secs(tg)) <= 3, `Relojes alineados en los dos dispositivos (${th} / ${tg})`);

  // B descubre y envía un informe con mensaje
  await guest.evidence(/Informe de la escena/);
  await guest.tap('No lleva encima su tarjeta');
  await guest.panel();
  await guest.p.getByPlaceholder('Mensaje para tu compañero').fill('¿Ves algo de su tarjeta en tus registros?');
  await guest.p.getByRole('button', { name: 'Preparar el informe' }).click();
  const report = await guest.p.getByLabel('Informe de campo para tu compañero').inputValue();
  check(report.startsWith('DL1.') && report.split('.').length === 3, `Informe de campo firmado (${report.length} caracteres)`);
  await guest.p.screenshot({ path: join(shots, 'coop-report-code.png') });
  await guest.closePanel();

  // A lo recibe
  await host.panel();
  await host.p.getByLabel('Recibir un código de tu compañero').fill(report);
  await host.p.getByRole('button', { name: 'Recibir', exact: true }).click();
  await host.p.getByText(/Informe recibido: \d+ elementos nuevos/).waitFor();
  check(await visible(host.p.getByText('¿Ves algo de su tarjeta en tus registros?')), 'El mensaje llega al compañero');
  await host.p.getByLabel('Recibir un código de tu compañero').fill(report);
  await host.p.getByRole('button', { name: 'Recibir', exact: true }).click();
  await host.p.getByText('Informe recibido: nada nuevo.').waitFor();
  check(true, 'Recibir dos veces el mismo informe no duplica nada');
  const tampered = report.slice(0, 20) + (report[20] === 'A' ? 'B' : 'A') + report.slice(21);
  await host.p.getByLabel('Recibir un código de tu compañero').fill(tampered);
  await host.p.getByRole('button', { name: 'Recibir', exact: true }).click();
  check(await visible(host.p.getByText(/otra partida o está incompleto|incompleto o dañado/)), 'Un código alterado se rechaza');
  await host.closePanel();
  await host.evidence(/Registro de accesos/);
  await host.tap('23:20', true);
  await host.relate(/Falta su tarjeta/, /La tarjeta de Selene, a las 23:20/);
  check(await host.knows('facts', 'fa-tarjeta-usada'), 'A combina una pieza recibida de B con la suya');

  // Propuesta rechazada
  const proposeAs = async (ph, culprit, unpick) => {
    await ph.p.getByRole('button', { name: 'Acusación conjunta' }).click();
    // Tras un rechazo, el acta conserva la selección anterior para poder corregirla.
    if (unpick) await ph.p.getByRole('button', { name: new RegExp(unpick), pressed: true }).click();
    await ph.p.getByRole('button', { name: new RegExp(culprit) }).click();
    await ph.p.getByText('Quedarse con la jefatura de la torre').click();
    await ph.p.getByText('Saboteó la barandilla del nivel 9').click();
    await ph.p.getByRole('radiogroup').nth(2).getByText('Parte de incidencia').click();
    await ph.p.getByRole('button', { name: 'Firmar el acta' }).click();
    await ph.p.getByRole('button', { name: 'Proponer al compañero' }).click();
    return ph.p.getByLabel('Propuesta de acusación para tu compañero').first().inputValue();
  };
  let proposal = await proposeAs(host, 'Petros Ladas');
  await host.closePanel();
  await guest.panel();
  await guest.p.getByLabel('Recibir un código de tu compañero').fill(proposal);
  await guest.p.getByRole('button', { name: 'Recibir', exact: true }).click();
  await guest.p.getByRole('heading', { name: 'Tu compañero propone esta acusación' }).waitFor();
  await guest.p.getByRole('button', { name: 'No estoy de acuerdo' }).click();
  const rejection = await guest.p.getByLabel('Rechazo para tu compañero').inputValue();
  await guest.closePanel();
  await host.panel();
  await host.p.getByLabel('Recibir un código de tu compañero').fill(rejection);
  await host.p.getByRole('button', { name: 'Recibir', exact: true }).click();
  check(await visible(host.p.getByText('No estoy de acuerdo con la acusación.')), 'Un rechazo vuelve al proponente y el caso sigue abierto');
  await host.closePanel();

  // Propuesta aceptada: los dos dispositivos cierran con el mismo final
  proposal = await proposeAs(host, 'Nikos Draganis', 'Petros Ladas');
  await host.closePanel();
  await guest.panel();
  await guest.p.getByLabel('Recibir un código de tu compañero').fill(proposal);
  await guest.p.getByRole('button', { name: 'Recibir', exact: true }).click();
  await guest.p.getByRole('button', { name: 'Firmar la acusación' }).click();
  await guest.p.waitForURL('**/informe');
  await guest.panel();
  const sig = await guest.p.getByLabel('Firma de la acusación para tu compañero').inputValue();
  await guest.closePanel();
  const endingGuest = await guest.p.getByRole('heading', { level: 1 }).last().innerText();
  await host.panel();
  await host.p.getByLabel('Recibir un código de tu compañero').fill(sig);
  await host.p.getByRole('button', { name: 'Recibir', exact: true }).click();
  await host.p.waitForURL('**/informe');
  await host.p.getByRole('heading', { name: 'El culpable, sin el porqué' }).waitFor();
  await guest.p.goto(guest.p.url().replace(/\/acusacion$/, '/informe'));
  await guest.p.getByRole('heading', { name: 'El culpable, sin el porqué' }).waitFor();
  check(true, `Acusación firmada por los dos: mismo final en ambos dispositivos («El culpable, sin el porqué»; ${endingGuest ? 'ok' : ''})`);
  check(host.errors.length === 0 && guest.errors.length === 0, `Sin errores de consola en la correspondencia${[...host.errors, ...guest.errors].length ? ': ' + [...host.errors, ...guest.errors].join(' | ') : ''}`);
} catch (err) {
  failures++;
  console.log('✘ Error inesperado:', err.message.split('\n').slice(0, 4).join(' | '));
} finally {
  await browser.close();
  process.kill(-server.pid, 'SIGTERM');
}
console.log(failures ? `\n${failures} comprobaciones fallidas` : '\nTodas las comprobaciones superadas');
process.exit(failures ? 1 : 0);
