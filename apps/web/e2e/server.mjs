/**
 * Prueba E2E del servidor (D-083) con wrangler dev en local:
 *  1. Credencial al entrar: crear cuenta; recuperar el progreso en otro «iPhone».
 *  2. Sala en tiempo real: invitación, aceptación, propuesta y firma sin pegar códigos.
 * Uso: npm run build && node e2e/server.mjs
 */
import { chromium, devices } from 'playwright';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, '__screens__');
const BASE = 'http://localhost:4181';
const API = 'http://127.0.0.1:8798';
const visible = (l) => l.first().waitFor({ timeout: 8000 }).then(() => true, () => false);
let failures = 0;
const check = (c, m) => (console.log(`${c ? '✔' : '✘'} ${m}`), c || failures++);

const api = spawn('npx', ['wrangler', 'dev', '--port', '8798', '--ip', '127.0.0.1', '--persist-to', '.wrangler/e2e-state'], { cwd: join(here, '..', '..', 'server'), stdio: 'pipe', detached: true, env: { ...process.env, WRANGLER_SEND_METRICS: 'false' } });
const web = spawn('npx', ['vite', 'preview', '--port', '4181', '--strictPort'], { cwd: join(here, '..'), stdio: 'pipe', detached: true });
await new Promise((res, rej) => {
  const t = setTimeout(() => rej(new Error('preview no arrancó')), 20000);
  web.stdout.on('data', (d) => String(d).includes('4181') && (clearTimeout(t), res()));
});
for (let i = 0; i < 120; i++) {
  try {
    if ((await fetch(`${API}/v1/health`)).ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch();
const device = { ...devices['iPhone 15 landscape'], viewport: { width: 852, height: 393 } };
async function phone({ gate = false } = {}) {
  const ctx = await browser.newContext(device);
  await ctx.addInitScript(([apiUrl, g]) => {
    localStorage.setItem('deadline:server', apiUrl);
    if (g) localStorage.setItem('deadline:test-account-gate', '1');
  }, [API, gate]);
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  return { ctx, p, errors };
}

try {
  // ═══ 1 · CREDENCIAL ═══════════════════════════════════════════════════
  const user = `det_${Date.now() % 1000000}`;
  const a = await phone({ gate: true });
  await a.p.goto(BASE);
  await a.p.getByRole('heading', { name: 'Crea tu credencial' }).waitFor();
  check(true, 'Al entrar por primera vez se pide crear la credencial');
  await a.p.screenshot({ path: join(shots, 'account-gate.png') });
  await a.p.getByLabel('Usuario').fill(user);
  await a.p.getByLabel('Contraseña').fill('clave-segura-1');
  await a.p.getByRole('button', { name: 'Crear y entrar' }).click();
  await a.p.getByRole('heading', { name: 'Crea tu credencial' }).waitFor({ state: 'detached' });
  await a.p.goto(`${BASE}/perfil`);
  await a.p.getByLabel('Alias').fill('archivera_x');
  await a.p.getByRole('button', { name: 'Guardar', exact: true }).click();
  await a.p.getByText('Alias guardado').waitFor();
  await a.p.getByRole('button', { name: 'Guardar ahora' }).click();
  await a.p.getByText('Copia guardada en el archivo central.').waitFor();
  check(await visible(a.p.getByText(`Conectado como ${user}`)), 'La ficha muestra la cuenta y guarda la copia');

  const b = await phone({ gate: true });
  await b.p.goto(BASE);
  await b.p.getByRole('button', { name: 'Ya tengo cuenta' }).click();
  await b.p.getByLabel('Usuario').fill(user);
  await b.p.getByLabel('Contraseña').fill('clave-segura-1');
  await b.p.getByRole('button', { name: 'Entrar', exact: true }).click();
  await b.p.getByRole('heading', { name: 'Entra con tu credencial' }).waitFor({ state: 'detached' });
  await b.p.goto(`${BASE}/perfil`);
  check((await b.p.getByLabel('Alias').inputValue()) === 'archivera_x', 'En otro iPhone, al entrar se recupera el progreso (alias incluido)');
  await a.ctx.close();
  await b.ctx.close();

  // ═══ 2 · SALA EN TIEMPO REAL ═════════════════════════════════════════
  const host = await phone();
  const guest = await phone();
  await host.p.goto(`${BASE}/telefono`);
  await host.p.getByRole('button', { name: 'Nueva investigación' }).click();
  await host.p.getByRole('button', { name: /Punto de rocío/ }).first().click();
  await host.p.getByRole('button', { name: 'Investigar en pareja' }).click();
  await host.p.getByRole('button', { name: 'Seré A' }).click();
  const room = (await host.p.locator('[class*="roomCode"]').innerText()).trim();
  check(/^[A-Z0-9]{6}$/.test(room), `La sala tiene un código corto (${room})`);
  await host.p.screenshot({ path: join(shots, 'room-host.png') });
  await guest.p.goto(`${BASE}/telefono`);
  await guest.p.getByRole('button', { name: 'Unirme a una sala' }).click();
  await guest.p.getByLabel('Unirme a una sala').fill(room);
  await guest.p.getByRole('button', { name: 'Entrar en la sala' }).click();
  await guest.p.getByRole('button', { name: 'Preparado' }).click({ timeout: 15000 });
  check(true, 'La invitación llega sola por la sala');
  await guest.p.waitForURL('**/pareja/**', { timeout: 15000 });
  await host.p.waitForURL('**/pareja/**', { timeout: 15000 });
  check(true, 'La aceptación vuelve sola: los dos empiezan a la vez, sin pegar códigos');

  await host.p.getByRole('button', { name: 'Acusación conjunta' }).click();
  await host.p.getByRole('heading', { name: 'Proponer la acusación conjunta' }).waitFor();
  await host.p.getByRole('button', { name: /Petros Ladas/ }).click();
  await host.p.getByText('Quedarse con la jefatura de la torre').click();
  await host.p.getByText('Saboteó la barandilla del nivel 9').click();
  await host.p.getByRole('radiogroup').nth(2).getByText('Parte de incidencia').click();
  await host.p.getByRole('button', { name: 'Firmar el acta' }).click();
  await host.p.getByRole('button', { name: 'Proponer al compañero' }).click();
  await guest.p.getByRole('heading', { name: 'Tu compañero propone esta acusación' }).waitFor({ timeout: 15000 });
  check(true, 'La propuesta aparece sola en el iPhone del compañero');
  await guest.p.getByRole('button', { name: 'Firmar la acusación' }).click();
  await guest.p.waitForURL('**/informe');
  await host.p.waitForURL('**/informe', { timeout: 15000 });
  const [th, tg] = [await host.p.locator('tr', { hasText: 'Total' }).last().innerText(), await guest.p.locator('tr', { hasText: 'Total' }).last().innerText()];
  check(th === tg, `Al firmar, el caso se cierra a la vez en los dos con el mismo informe (${th.replace(/\s+/g, ' ')})`);
  await host.p.screenshot({ path: join(shots, 'room-closed.png') });
  check(host.errors.length === 0 && guest.errors.length === 0, `Sin errores de página${[...host.errors, ...guest.errors].join(' | ')}`);
} catch (err) {
  failures++;
  console.log('✘ Error inesperado:', err.message.split('\n').slice(0, 8).join(' | '));
} finally {
  await browser.close();
  for (const s of [api, web]) {
    try {
      process.kill(-s.pid, 'SIGTERM');
    } catch {}
  }
}
console.log(failures ? `\n${failures} comprobaciones fallidas` : '\nTodas las comprobaciones superadas');
process.exit(failures ? 1 : 0);
