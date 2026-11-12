import { caseFileSchema, sha256Hex, type CaseFile } from '@deadline/core';
import { getDB, type CaseAssetStatus } from '../storage/db.ts';
import { requestPersistentStorage } from '../storage/persistence.ts';
import { assetUrlFor, caseJsonUrl, storeCase, type CatalogEntry } from './contentRepo.ts';

/**
 * DESCARGA VERIFICADA DE EXPEDIENTES.
 *
 * - El JSON del expediente se comprueba contra la huella del catálogo.
 * - Cada recurso se comprueba por tamaño y SHA-256 antes de guardarse en
 *   Cache Storage (la misma caché que usa el service worker para servirlo).
 * - Un expediente solo pasa a «disponible sin conexión» cuando TODO está
 *   presente y verificado. Las descargas interrumpidas se reanudan: solo se
 *   piden los recursos que faltan.
 * - iOS puede borrar el almacenamiento: `verifyAll` se ejecuta al arrancar y
 *   rebaja a «incompleto» lo que haya desaparecido.
 */

export const CASES_CACHE = 'deadline-cases-v1';

export type Progress = (done: number, total: number) => void;

const listeners = new Set<(caseId: string, status: CaseAssetStatus) => void>();
export function onDownloadStatus(fn: (caseId: string, status: CaseAssetStatus) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

async function setStatus(s: CaseAssetStatus): Promise<CaseAssetStatus> {
  await (await getDB()).put('caseAssets', s);
  listeners.forEach((fn) => fn(s.caseId, s));
  return s;
}

export async function getStatus(caseId: string): Promise<CaseAssetStatus | undefined> {
  return (await getDB()).get('caseAssets', caseId);
}

export async function allStatuses(): Promise<Record<string, CaseAssetStatus>> {
  const all = await (await getDB()).getAll('caseAssets');
  return Object.fromEntries(all.map((s) => [s.caseId, s]));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Petición con reintentos y espera exponencial (0,5 s, 1 s, 2 s). */
async function fetchWithRetry(url: string, attempts = 3): Promise<Response> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (res.ok) return res;
      last = new Error(`HTTP ${res.status}`);
      if (res.status === 404) break;
    } catch (e) {
      last = e;
    }
    await sleep(500 * 2 ** i);
  }
  throw last instanceof Error ? last : new Error(String(last));
}

function canCache(): boolean {
  return typeof caches !== 'undefined';
}

export async function downloadCase(entry: CatalogEntry, onProgress?: Progress): Promise<CaseAssetStatus> {
  const base: Omit<CaseAssetStatus, 'state' | 'missing' | 'bytesStored'> = {
    caseId: entry.id,
    contentVersion: entry.contentVersion,
    bytesExpected: entry.assetBytes,
    updatedAt: Date.now(),
  };
  if (!canCache()) return setStatus({ ...base, state: 'none', missing: [], bytesStored: 0 });
  await setStatus({ ...base, state: 'downloading', missing: [], bytesStored: 0 });
  void requestPersistentStorage();

  // 1. Expediente
  let data: CaseFile;
  try {
    const text = await (await fetchWithRetry(caseJsonUrl(entry.id))).text();
    if ((await sha256Hex(text)) !== entry.sha256) throw new Error('La huella del expediente no coincide con el catálogo');
    data = caseFileSchema.parse(JSON.parse(text));
    await storeCase(data);
  } catch (e) {
    return setStatus({ ...base, state: 'corrupt', missing: ['case.json'], bytesStored: 0, updatedAt: Date.now() });
  }

  // 2. Recursos (se reanuda: lo ya verificado no se vuelve a descargar)
  const cache = await caches.open(CASES_CACHE);
  const missing: string[] = [];
  let stored = 0;
  let done = 0;
  onProgress?.(0, data.assets.length);
  for (const a of data.assets) {
    const url = assetUrlFor(data.id, a);
    try {
      const hit = await cache.match(url);
      if (hit) {
        stored += a.bytes;
      } else {
        const res = await fetchWithRetry(url);
        const buf = await res.arrayBuffer();
        const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', buf))].map((b) => b.toString(16).padStart(2, '0')).join('');
        if (buf.byteLength !== a.bytes || digest !== a.sha256) throw new Error(`Recurso dañado: ${a.src}`);
        await cache.put(url, new Response(buf, { headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/octet-stream' } }));
        stored += a.bytes;
      }
    } catch {
      missing.push(a.id);
    }
    onProgress?.(++done, data.assets.length);
  }
  return setStatus({
    ...base,
    contentVersion: data.contentVersion,
    state: missing.length ? 'partial' : 'verified',
    missing,
    bytesStored: stored,
    ...(missing.length ? {} : { verifiedAt: Date.now() }),
    updatedAt: Date.now(),
  });
}

/**
 * Comprueba que lo descargado sigue ahí. Superficial: presencia en caché e
 * IndexedDB. A fondo (`deep`): vuelve a calcular las huellas.
 */
export async function verifyCase(caseId: string, opts: { deep?: boolean; catalogVersion?: number } = {}): Promise<CaseAssetStatus | undefined> {
  const status = await getStatus(caseId);
  if (!status || status.state === 'none' || status.state === 'downloading' || !canCache()) return status;
  const stored = await (await getDB()).get('caseContent', caseId);
  if (!stored || (opts.catalogVersion !== undefined && stored.contentVersion < opts.catalogVersion)) {
    return setStatus({ ...status, state: 'partial', missing: ['case.json'], updatedAt: Date.now() });
  }
  const cache = await caches.open(CASES_CACHE);
  const missing: string[] = [];
  for (const a of stored.data.assets) {
    const hit = await cache.match(assetUrlFor(caseId, a));
    if (!hit) {
      missing.push(a.id);
      continue;
    }
    if (opts.deep) {
      const buf = await hit.arrayBuffer();
      const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', buf))].map((b) => b.toString(16).padStart(2, '0')).join('');
      if (digest !== a.sha256) missing.push(a.id);
    }
  }
  const state = missing.length ? 'partial' : 'verified';
  if (state === status.state && missing.length === status.missing.length && !opts.deep) return status;
  return setStatus({ ...status, state, missing, updatedAt: Date.now(), ...(state === 'verified' ? { verifiedAt: Date.now() } : {}) });
}

export async function verifyAll(catalog: CatalogEntry[], deep = false): Promise<Record<string, CaseAssetStatus>> {
  const out: Record<string, CaseAssetStatus> = {};
  for (const e of catalog) {
    const s = await verifyCase(e.id, { deep, catalogVersion: e.contentVersion });
    if (s) out[e.id] = s;
  }
  return out;
}

/** Libera el espacio de un expediente (el progreso del jugador no se toca). */
export async function removeDownload(caseId: string): Promise<void> {
  const db = await getDB();
  const stored = await db.get('caseContent', caseId);
  if (stored && canCache()) {
    const cache = await caches.open(CASES_CACHE);
    await Promise.all(stored.data.assets.map((a) => cache.delete(assetUrlFor(caseId, a))));
  }
  await db.delete('caseContent', caseId);
  await db.delete('caseAssets', caseId);
}
