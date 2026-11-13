import { fetchCatalog } from './contentRepo.ts';
import { downloadCase, verifyAll } from './downloads.ts';
import { requestPersistentStorage } from '../storage/persistence.ts';
import { syncDailyLedger } from '../storage/dailyRepo.ts';

/**
 * ARCHIVO COMPLETO EN EL DISPOSITIVO (D-060).
 *
 * Todos los expedientes del catálogo se descargan solos, sin que el jugador
 * tenga que pedirlo: al arrancar, al recuperar la conexión y cuando una
 * actualización publica casos nuevos o corregidos. Cada descarga se verifica
 * (huella SHA-256 del texto y de cada recurso) antes de darla por buena.
 *
 * Orden: primero los diarios que se desbloquean antes, luego el resto. Así,
 * si la conexión se corta a mitad, lo más urgente ya está.
 */

export interface SyncState {
  running: boolean;
  done: number;
  total: number;
}

let current: Promise<void> | null = null;
let state: SyncState = { running: false, done: 0, total: 0 };
const listeners = new Set<(s: SyncState) => void>();

export function onArchiveSync(fn: (s: SyncState) => void): () => void {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

function emit(next: SyncState): void {
  state = next;
  for (const fn of listeners) fn(state);
}

/** Descarga todo lo que falte o esté desactualizado. Varias llamadas a la vez comparten la misma tarea. */
export function syncWholeArchive(): Promise<void> {
  current ??= run().finally(() => {
    current = null;
  });
  return current;
}

async function run(): Promise<void> {
  let catalog;
  try {
    catalog = await fetchCatalog();
  } catch {
    return;
  }
  const statuses = await verifyAll(catalog);
  const pending = catalog.filter((e) => {
    const st = statuses[e.id];
    return !(st?.state === 'verified' && st.contentVersion >= e.contentVersion);
  });
  if (!pending.length) {
    emit({ running: false, done: catalog.length, total: catalog.length });
    return;
  }
  if (!navigator.onLine) {
    emit({ running: false, done: catalog.length - pending.length, total: catalog.length });
    return;
  }
  // La primera vez que se guarda el archivo, se pide almacenamiento persistente.
  void requestPersistentStorage().catch(() => false);
  const ledger = await syncDailyLedger().catch(() => null);
  const from = Math.max(0, ledger?.highestUnlocked ?? 0);
  const priority = (e: (typeof catalog)[number]) =>
    e.mode === 'daily' && e.dailyIndex !== undefined ? (e.dailyIndex >= from ? e.dailyIndex - from : 1000 + e.dailyIndex) : 500;
  pending.sort((a, b) => priority(a) - priority(b));

  let done = catalog.length - pending.length;
  emit({ running: true, done, total: catalog.length });
  for (const e of pending) {
    if (!navigator.onLine) break;
    const st = await downloadCase(e).catch(() => undefined);
    if (st?.state === 'verified') done++;
    emit({ running: true, done, total: catalog.length });
  }
  emit({ running: false, done, total: catalog.length });
}

/** Mantenimiento al arrancar y cada vez que vuelve la conexión o la app. */
export function startArchiveSync(): void {
  const go = () => void syncWholeArchive().catch((err: unknown) => console.warn('[archivo]', err));
  go();
  window.addEventListener('online', go);
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && go());
}
