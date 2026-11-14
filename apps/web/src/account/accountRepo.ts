/**
 * CUENTA DEL INVESTIGADOR (D-083): usuario y contraseña en el servidor de
 * DEADLINE y copia del progreso. El juego sigue siendo local primero: todo
 * se guarda en el dispositivo y, con cuenta y conexión, se sube una copia
 * (el mismo archivo de la exportación manual). Al entrar en otro iPhone o
 * tras borrar la app, se baja y se fusiona con lo local.
 */
import { parseArchive, prepareArchive, applyArchive } from '../storage/backup.ts';
import { getMeta, setMeta } from '../storage/meta.ts';
import { serverUrl } from '../platform/server.ts';

export interface Account {
  username: string;
  token: string;
  lastSyncAt?: number;
}

const KEY = 'account';
const SKIP_KEY = 'accountSkipped';

export async function getAccount(): Promise<Account | undefined> {
  return getMeta<Account>(KEY);
}
export async function accountSkipped(): Promise<boolean> {
  return !!(await getMeta<boolean>(SKIP_KEY));
}
export async function skipAccount(): Promise<void> {
  await setMeta(SKIP_KEY, true);
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

async function call(path: string, init: RequestInit): Promise<Response> {
  return fetch(serverUrl() + path, { ...init, headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
}

async function auth(kind: 'account' | 'login', username: string, password: string): Promise<Result<Account>> {
  try {
    const r = await call(`/v1/${kind}`, { method: 'POST', body: JSON.stringify({ u: username.trim().toLowerCase(), p: password }) });
    const body = (await r.json().catch(() => ({}))) as { token?: string; username?: string; error?: string };
    if (!r.ok || !body.token) return { ok: false, error: body.error ?? `El servidor respondió ${r.status}.` };
    const acc: Account = { username: body.username ?? username, token: body.token };
    await setMeta(KEY, acc);
    return { ok: true, value: acc };
  } catch {
    return { ok: false, error: 'Sin conexión con el archivo central. Inténtalo con conexión.' };
  }
}

/** Crea la cuenta y sube el progreso que ya hay en este dispositivo. */
export async function createAccount(username: string, password: string): Promise<Result<Account>> {
  const r = await auth('account', username, password);
  if (r.ok) await syncProgress();
  return r;
}

/** Entra con una cuenta existente: baja su progreso, lo fusiona con lo local y vuelve a subirlo. */
export async function login(username: string, password: string): Promise<Result<Account>> {
  const r = await auth('login', username, password);
  if (r.ok) await syncProgress();
  return r;
}

export async function logout(): Promise<void> {
  await setMeta(KEY, undefined);
}

let syncing: Promise<SyncResult> | null = null;
export type SyncResult = 'synced' | 'offline' | 'unauthorized' | 'no-account';

/** Baja la copia del servidor (si la hay), la fusiona y sube la copia resultante. */
export function syncProgress(): Promise<SyncResult> {
  syncing ??= (async (): Promise<SyncResult> => {
    const acc = await getAccount();
    if (!acc) return 'no-account';
    const headers = { Authorization: `Bearer ${acc.token}` };
    try {
      const got = await fetch(`${serverUrl()}/v1/progress`, { headers });
      if (got.status === 401) return 'unauthorized';
      if (got.status === 200) {
        const body = (await got.json()) as { archive: unknown };
        const parsed = await parseArchive(JSON.stringify(body.archive));
        if (parsed.ok) await applyArchive(parsed.archive, 'merge');
      }
      const archive = await prepareArchive();
      const put = await fetch(`${serverUrl()}/v1/progress`, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(archive) });
      if (put.status === 401) return 'unauthorized';
      if (!put.ok) return 'offline';
      await setMeta(KEY, { ...acc, lastSyncAt: Date.now() });
      return 'synced';
    } catch {
      return 'offline';
    }
  })().finally(() => {
    syncing = null;
  });
  return syncing;
}
