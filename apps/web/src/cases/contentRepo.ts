import { caseFileSchema, type CaseCatalogEntry, type CaseFile } from '@deadline/core';
import { getDB } from '../storage/db.ts';

/**
 * Contenido de los expedientes. Se sirve como archivos estáticos junto a la
 * app (content/catalog.json, content/cases/<ID>/case.json + recursos) y se
 * guarda en IndexedDB al abrirlo. La descarga verificada para jugar sin
 * conexión de forma garantizada llega en la Etapa 4.
 */

const BASE = `${import.meta.env.BASE_URL}content`;

export interface CatalogEntry extends CaseCatalogEntry {
  sha256: string;
}

export async function fetchCatalog(): Promise<CatalogEntry[]> {
  const db = await getDB();
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const stored = (await db.getAll('catalog')) as CatalogEntry[];
    if (stored.length) return stored;
  }
  try {
    const res = await fetch(`${BASE}/catalog.json`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { cases: CatalogEntry[] };
    const tx = db.transaction('catalog', 'readwrite');
    for (const entry of json.cases) await tx.store.put(entry);
    await tx.done;
    return json.cases;
  } catch (err) {
    // Sin red: el catálogo guardado la última vez.
    const stored = (await db.getAll('catalog')) as CatalogEntry[];
    if (stored.length) return stored;
    throw err;
  }
}

export async function loadCase(id: string): Promise<CaseFile> {
  const db = await getDB();
  const stored = await db.get('caseContent', id);
  const catalog = (await db.get('catalog', id)) as CatalogEntry | undefined;
  if (stored && (!catalog || stored.contentVersion >= catalog.contentVersion)) return stored.data;
  const res = await fetch(caseJsonUrl(id));
  if (!res.ok) {
    if (stored) return stored.data;
    throw new Error(res.status === 404 ? 'Este expediente no figura en el archivo.' : `No se pudo abrir el expediente (HTTP ${res.status}).`);
  }
  const data = caseFileSchema.parse(await res.json());
  await db.put('caseContent', { id, contentVersion: data.contentVersion, data, storedAt: Date.now() });
  return data;
}

/**
 * URL de un recurso. Lleva la huella del contenido (?v=) para que una
 * corrección publicada nunca se confunda con la copia guardada.
 */
export function assetUrl(caseId: string, c: CaseFile, assetId: string): string | undefined {
  const a = c.assets.find((x) => x.id === assetId);
  if (!a) return undefined;
  return assetUrlFor(caseId, a);
}

export function assetUrlFor(caseId: string, a: { src: string; sha256: string }): string {
  const path = a.src.startsWith('shared/') ? `${BASE}/${a.src}` : `${BASE}/cases/${caseId}/${a.src}`;
  return `${path}?v=${a.sha256.slice(0, 12)}`;
}

export function caseJsonUrl(caseId: string): string {
  return `${BASE}/cases/${caseId}/case.json`;
}

/** Guarda en IndexedDB un expediente ya verificado. */
export async function storeCase(data: CaseFile): Promise<void> {
  const db = await getDB();
  await db.put('caseContent', { id: data.id, contentVersion: data.contentVersion, data, storedAt: Date.now() });
}
