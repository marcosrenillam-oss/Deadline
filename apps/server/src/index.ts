/**
 * SERVIDOR DE DEADLINE (Cloudflare Workers + Durable Objects, plan gratuito).
 *
 *  POST /v1/account      {u, p}         crea la cuenta → {token}
 *  POST /v1/login        {u, p}         → {token}
 *  GET  /v1/progress     (Bearer)       última copia del progreso → {archive, updatedAt} | 204
 *  PUT  /v1/progress     (Bearer)       guarda la copia del progreso → {updatedAt}
 *  GET  /v1/room/:code   (WebSocket)    sala en tiempo real para jugar en pareja
 *
 * Contraseñas con PBKDF2-SHA256 (100 000 iteraciones, el máximo de Workers) y sal propia; los
 * tokens se guardan solo como hash. No hay correo ni datos personales: un
 * nombre de usuario, la contraseña cifrada y la copia del archivo del juego.
 */

export interface Env {
  VAULT: DurableObjectNamespace;
  ROOMS: DurableObjectNamespace;
  ALLOWED_ORIGINS: string;
}

const USERNAME = /^[a-z0-9_]{3,20}$/;
const ROOM = /^[A-Z0-9]{4,8}$/;
const MAX_ARCHIVE = 4 * 1024 * 1024;

function cors(req: Request, env: Env): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  const ok = env.ALLOWED_ORIGINS.split(',').map((x) => x.trim()).includes(origin);
  return ok
    ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Max-Age': '86400',
        Vary: 'Origin',
      }
    : { Vary: 'Origin' };
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers } });

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const h = cors(req, env);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
    try {
      if (url.pathname === '/v1/health') return json({ ok: true, service: 'deadline' }, 200, h);
      const room = url.pathname.match(/^\/v1\/room\/([A-Za-z0-9]{4,8})$/);
      if (room) {
        const code = room[1]!.toUpperCase();
        if (!ROOM.test(code)) return json({ error: 'Código de sala no válido.' }, 400, h);
        if (req.headers.get('Upgrade') !== 'websocket') return json({ error: 'Se esperaba una conexión en tiempo real.' }, 426, h);
        return env.ROOMS.get(env.ROOMS.idFromName(code)).fetch(req);
      }
      if (url.pathname.startsWith('/v1/')) {
        // Cuentas y progreso: un único almacén (suficiente para un juego entre amigos).
        const res = await env.VAULT.get(env.VAULT.idFromName('vault')).fetch(req);
        const out = new Response(res.body, res);
        for (const [k, v] of Object.entries(h)) out.headers.set(k, v);
        return out;
      }
      return json({ error: 'No encontrado.' }, 404, h);
    } catch (e) {
      return json({ error: 'Error del servidor.', detail: e instanceof Error ? e.message : String(e) }, 500, h);
    }
  },
};

// ─── Utilidades de cifrado ───────────────────────────────────────────────────

const enc = new TextEncoder();
const b64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const randomToken = (n = 32) => b64(crypto.getRandomValues(new Uint8Array(n)));
async function sha256(text: string): Promise<string> {
  return b64(await crypto.subtle.digest('SHA-256', enc.encode(text)));
}
async function pbkdf2(password: string, salt: string, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations }, key, 256);
  return b64(bits);
}
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
const ITERATIONS = 100_000; // máximo que admite Workers

// ─── Almacén de cuentas y progreso ───────────────────────────────────────────

export class Vault {
  private sql: SqlStorage;
  private attempts = new Map<string, number[]>();

  constructor(private state: DurableObjectState) {
    this.sql = state.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS accounts (
      username TEXT PRIMARY KEY, salt TEXT NOT NULL, hash TEXT NOT NULL, iterations INTEGER NOT NULL, created_at INTEGER NOT NULL)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS tokens (token_hash TEXT PRIMARY KEY, username TEXT NOT NULL, created_at INTEGER NOT NULL)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS progress (username TEXT PRIMARY KEY, archive TEXT NOT NULL, updated_at INTEGER NOT NULL)`);
  }

  private limited(username: string): boolean {
    const now = Date.now();
    const recent = (this.attempts.get(username) ?? []).filter((t) => now - t < 60_000);
    recent.push(now);
    this.attempts.set(username, recent);
    return recent.length > 6;
  }

  private async issue(username: string): Promise<string> {
    const token = randomToken();
    this.sql.exec('INSERT INTO tokens (token_hash, username, created_at) VALUES (?, ?, ?)', await sha256(token), username, Date.now());
    return token;
  }

  private async who(req: Request): Promise<string | null> {
    const auth = req.headers.get('Authorization') ?? '';
    const m = auth.match(/^Bearer ([A-Za-z0-9_-]{20,})$/);
    if (!m) return null;
    const row = this.sql.exec('SELECT username FROM tokens WHERE token_hash = ?', await sha256(m[1]!)).toArray()[0];
    return row ? String(row.username) : null;
  }

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    if (req.method === 'POST' && (url.pathname === '/v1/account' || url.pathname === '/v1/login')) {
      const body = (await req.json().catch(() => null)) as { u?: string; p?: string } | null;
      const u = String(body?.u ?? '').trim().toLowerCase();
      const p = String(body?.p ?? '');
      if (!USERNAME.test(u)) return json({ error: 'El usuario admite de 3 a 20 letras minúsculas, números o «_».' }, 400);
      if (p.length < 8 || p.length > 200) return json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, 400);
      if (this.limited(u)) return json({ error: 'Demasiados intentos. Espera un minuto.' }, 429);
      const existing = this.sql.exec('SELECT salt, hash, iterations FROM accounts WHERE username = ?', u).toArray()[0];
      if (url.pathname === '/v1/account') {
        if (existing) return json({ error: 'Ese nombre de usuario ya existe. Elige otro o entra con tu contraseña.' }, 409);
        const salt = randomToken(16);
        this.sql.exec('INSERT INTO accounts (username, salt, hash, iterations, created_at) VALUES (?, ?, ?, ?, ?)', u, salt, await pbkdf2(p, salt, ITERATIONS), ITERATIONS, Date.now());
        return json({ token: await this.issue(u), username: u }, 201);
      }
      if (!existing) return json({ error: 'Usuario o contraseña incorrectos.' }, 401);
      const hash = await pbkdf2(p, String(existing.salt), Number(existing.iterations));
      if (!timingSafeEqual(hash, String(existing.hash))) return json({ error: 'Usuario o contraseña incorrectos.' }, 401);
      return json({ token: await this.issue(u), username: u });
    }
    if (url.pathname === '/v1/progress') {
      const user = await this.who(req);
      if (!user) return json({ error: 'Sesión caducada: vuelve a entrar.' }, 401);
      if (req.method === 'GET') {
        const row = this.sql.exec('SELECT archive, updated_at FROM progress WHERE username = ?', user).toArray()[0];
        if (!row) return new Response(null, { status: 204 });
        return json({ archive: JSON.parse(String(row.archive)), updatedAt: Number(row.updated_at) });
      }
      if (req.method === 'PUT') {
        const text = await req.text();
        if (text.length > MAX_ARCHIVE) return json({ error: 'La copia es demasiado grande.' }, 413);
        let parsed: { format?: string };
        try {
          parsed = JSON.parse(text);
        } catch {
          return json({ error: 'Copia no válida.' }, 400);
        }
        if (parsed.format !== 'deadline-archive') return json({ error: 'Copia no válida.' }, 400);
        const now = Date.now();
        this.sql.exec('INSERT INTO progress (username, archive, updated_at) VALUES (?, ?, ?) ON CONFLICT(username) DO UPDATE SET archive = excluded.archive, updated_at = excluded.updated_at', user, text, now);
        return json({ updatedAt: now });
      }
    }
    return json({ error: 'No encontrado.' }, 404);
  }
}

// ─── Salas en tiempo real (pareja) ───────────────────────────────────────────

interface RoomMessage {
  id: number;
  from: string;
  kind: 'code' | 'hello' | 'bye';
  code?: string;
  at: number;
}

/**
 * Una sala por código. Cada mensaje que entra se reenvía a los demás y se
 * guarda (últimos 300), para que quien se conecte tarde lo reciba al entrar.
 * Los mensajes son los mismos códigos firmados del modo sin servidor: la
 * sala solo los transporta, no los lee.
 */
export class Room {
  private sql: SqlStorage;

  constructor(private state: DurableObjectState) {
    this.sql = state.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, sender TEXT NOT NULL, kind TEXT NOT NULL, code TEXT, at INTEGER NOT NULL)`);
  }

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const client = (url.searchParams.get('client') ?? '').slice(0, 64) || randomToken(8);
    const after = Number(url.searchParams.get('after') ?? '0') || 0;
    const pair = new WebSocketPair();
    const [a, b] = [pair[0], pair[1]];
    this.state.acceptWebSocket(b, [client]);
    // Al entrar: lo que se perdió mientras no estaba
    const missed = this.sql.exec('SELECT id, sender, kind, code, at FROM messages WHERE id > ? AND sender != ? ORDER BY id LIMIT 300', after, client).toArray();
    for (const m of missed) b.send(JSON.stringify({ id: Number(m.id), from: String(m.sender), kind: String(m.kind), code: m.code ?? undefined, at: Number(m.at) }));
    const peers = this.state.getWebSockets().length;
    this.broadcast({ id: 0, from: client, kind: 'hello', at: Date.now() }, b);
    b.send(JSON.stringify({ id: 0, from: 'room', kind: 'hello', at: Date.now(), peers }));
    return new Response(null, { status: 101, webSocket: a });
  }

  private broadcast(msg: RoomMessage, except?: WebSocket) {
    const text = JSON.stringify(msg);
    for (const ws of this.state.getWebSockets()) if (ws !== except) ws.send(text);
  }

  async webSocketMessage(ws: WebSocket, data: string | ArrayBuffer) {
    if (typeof data !== 'string' || data.length > 64_000) return;
    let msg: { kind?: string; code?: string };
    try {
      msg = JSON.parse(data);
    } catch {
      return;
    }
    if (msg.kind !== 'code' || typeof msg.code !== 'string' || !msg.code.startsWith('DL1.')) return;
    const [sender] = this.state.getTags(ws);
    const at = Date.now();
    this.sql.exec('INSERT INTO messages (sender, kind, code, at) VALUES (?, ?, ?, ?)', sender ?? '?', 'code', msg.code, at);
    const id = Number(this.sql.exec('SELECT last_insert_rowid() AS id').toArray()[0]!.id);
    this.sql.exec('DELETE FROM messages WHERE id <= ?', id - 300);
    this.broadcast({ id, from: sender ?? '?', kind: 'code', code: msg.code, at }, ws);
    ws.send(JSON.stringify({ id, from: 'room', kind: 'ack', at }));
  }

  async webSocketClose(ws: WebSocket) {
    const [sender] = this.state.getTags(ws);
    this.broadcast({ id: 0, from: sender ?? '?', kind: 'bye', at: Date.now() }, ws);
  }
}
