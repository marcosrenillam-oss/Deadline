/**
 * Prueba del servidor en local (wrangler dev): cuentas, progreso y sala.
 * Uso: npm test -w @deadline/server
 */
import { spawn } from 'node:child_process';

const PORT = 8799;
const BASE = process.env.SERVER_URL ?? `http://127.0.0.1:${PORT}`;
let failures = 0;
const check = (cond: unknown, msg: string) => {
  console.log(`${cond ? '✔' : '✘'} ${msg}`);
  if (!cond) failures++;
};

const REMOTE = !!process.env.SERVER_URL;
const dev = REMOTE ? null : spawn('npx', ['wrangler', 'dev', '--port', String(PORT), '--ip', '127.0.0.1', '--persist-to', '.wrangler/test-state'], {
  cwd: new URL('..', import.meta.url).pathname,
  stdio: 'pipe',
  detached: true,
  env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
});
let log = '';
dev?.stdout.on('data', (d) => (log += d));
dev?.stderr.on('data', (d) => (log += d));
const up = async () => {
  for (let i = 0; i < 120; i++) {
    try {
      const r = await fetch(`${BASE}/v1/health`);
      if (r.ok) return;
    } catch {
      /* aún arrancando */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('wrangler dev no arrancó:\n' + log.slice(-2000));
};

const post = (path: string, body: unknown, token?: string) =>
  fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });

try {
  await up();
  const user = `prueba_${Date.now() % 100000}`;
  const created = await post('/v1/account', { u: user, p: 'secreto123' });
  const { token } = (await created.json()) as { token: string };
  check(created.status === 201 && token, 'Se crea una cuenta con usuario y contraseña');
  check(created.headers.get('access-control-allow-origin') === 'http://localhost:5173', 'CORS para la app');
  check((await post('/v1/account', { u: user, p: 'otraclave99' })).status === 409, 'No se repiten nombres de usuario');
  check((await post('/v1/login', { u: user, p: 'mala_clave' })).status === 401, 'Contraseña incorrecta: rechazada');
  const login = await post('/v1/login', { u: user, p: 'secreto123' });
  const t2 = ((await login.json()) as { token: string }).token;
  check(login.status === 200 && t2, 'Se entra con la contraseña correcta');
  check((await fetch(`${BASE}/v1/progress`, { headers: { Authorization: `Bearer ${t2}` } })).status === 204, 'Cuenta nueva sin copia de progreso');
  const archive = { format: 'deadline-archive', version: 1, data: { hola: 1 } };
  const put = await fetch(`${BASE}/v1/progress`, { method: 'PUT', headers: { Authorization: `Bearer ${t2}` }, body: JSON.stringify(archive) });
  check(put.status === 200, 'Se guarda la copia del progreso');
  const got = (await (await fetch(`${BASE}/v1/progress`, { headers: { Authorization: `Bearer ${token}` } })).json()) as { archive: typeof archive };
  check(got.archive.data.hola === 1, 'Se recupera el progreso desde otra sesión');
  check((await fetch(`${BASE}/v1/progress`, { headers: { Authorization: 'Bearer xxxxxxxxxxxxxxxxxxxxxxxx' } })).status === 401, 'Sin sesión válida no hay progreso');

  // Sala en tiempo real
  const ROOMC = REMOTE ? 'T' + Math.random().toString(36).slice(2, 7).toUpperCase() : 'ABCD12';
  const open = (client: string, after = 0) =>
    new Promise<{ ws: WebSocket; inbox: Array<{ kind: string; code?: string; id: number }> }>((res, rej) => {
      const ws = new WebSocket(`${BASE.replace(/^http/, 'ws')}/v1/room/${ROOMC}?client=${client}&after=${after}`);
      const inbox: Array<{ kind: string; code?: string; id: number }> = [];
      ws.onmessage = (e) => inbox.push(JSON.parse(String(e.data)));
      ws.onopen = () => res({ ws, inbox });
      ws.onerror = () => rej(new Error('ws'));
    });
  const a = await open('A');
  const b = await open('B');
  a.ws.send(JSON.stringify({ kind: 'code', code: 'DL1.prueba.uno' }));
  await new Promise((r) => setTimeout(r, 500));
  check(b.inbox.some((m) => m.kind === 'code' && m.code === 'DL1.prueba.uno'), 'La sala entrega el código al compañero al instante');
  b.ws.close();
  a.ws.send(JSON.stringify({ kind: 'code', code: 'DL1.prueba.dos' }));
  await new Promise((r) => setTimeout(r, 300));
  const b2 = await open('B', 0);
  await new Promise((r) => setTimeout(r, 500));
  check(b2.inbox.filter((m) => m.kind === 'code').length >= 2, 'Al volver a entrar, se recibe lo enviado mientras no estaba');
  check(!b2.inbox.some((m) => m.kind === 'code' && m.code === undefined), 'Mensajes bien formados');
  a.ws.close();
  b2.ws.close();
} catch (e) {
  failures++;
  console.log('✘ Error:', e instanceof Error ? e.message : e);
} finally {
  try {
    if (dev) process.kill(-dev.pid!, 'SIGTERM');
  } catch {
    /* ya cerrado */
  }
}
console.log(failures ? `\n${failures} comprobaciones fallidas` : '\nTodas las comprobaciones superadas');
process.exit(failures ? 1 : 0);
