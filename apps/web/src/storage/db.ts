import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { CoopSession } from '../cases/coopTypes.ts';
import type { CaseCatalogEntry, CaseFile, CaseRecord, DailyLedger, Friend, Investigation, LocalProfile, Note, Settings, SyncOp } from '@deadline/core';

/**
 * BASE DE DATOS LOCAL (IndexedDB).
 *
 * Qué vive aquí y qué no:
 * - Aquí: catálogo, contenido JSON de los expedientes descargados, estado de
 *   verificación de recursos, investigaciones, registros por caso, notas,
 *   registro de diarios, ajustes y cola de sincronización.
 * - Fuera (Cache Storage, gestionado en la Etapa 4): imágenes y audio de los
 *   expedientes. Se verifican contra el manifiesto (bytes + SHA-256) antes de
 *   marcar un caso como disponible offline.
 *
 * iOS puede desalojar el almacenamiento de una PWA. Por eso:
 * - se solicita almacenamiento persistente (no garantizado en iOS),
 * - el estado de recursos se re-verifica al abrir un caso,
 * - el jugador puede exportar su archivo personal a un fichero e importarlo
 *   (no hay servidor: es la única copia fuera del navegador).
 */

export const DB_NAME = 'deadline';
export const DB_VERSION = 4;

export type AssetState = 'none' | 'downloading' | 'partial' | 'verified' | 'corrupt';

export interface CaseAssetStatus {
  caseId: string;
  contentVersion: number;
  state: AssetState;
  /** Ids de recursos que faltan o no superaron la verificación. */
  missing: string[];
  bytesExpected: number;
  bytesStored: number;
  verifiedAt?: number;
  updatedAt: number;
}

export interface StoredCaseContent {
  id: string;
  contentVersion: number;
  data: CaseFile;
  storedAt: number;
}

export interface DeadlineDB extends DBSchema {
  meta: { key: string; value: { key: string; value: unknown; updatedAt: number } };
  settings: { key: string; value: Settings };
  /** v2 · Perfil local (clave 'local'). */
  profile: { key: string; value: LocalProfile };
  catalog: {
    key: string;
    value: CaseCatalogEntry;
    indexes: { byMode: string; byEra: string; byCategory: string; byDaily: number };
  };
  caseContent: { key: string; value: StoredCaseContent };
  caseAssets: { key: string; value: CaseAssetStatus; indexes: { byState: string } };
  investigations: { key: string; value: Investigation; indexes: { byCase: string; byStatus: string } };
  caseRecords: { key: string; value: CaseRecord; indexes: { byStatus: string; byMode: string } };
  notes: { key: string; value: Note; indexes: { byCase: string; byUpdated: number } };
  dailyLedger: { key: string; value: DailyLedger };
  /** v3 · Partidas cooperativas (mesa compartida y correspondencia). */
  coopSessions: { key: string; value: CoopSession; indexes: { byCase: string; byUpdated: number } };
  /** v4 · Clasificación entre amigos (tarjetas importadas), por número de investigador. */
  friends: { key: string; value: Friend };
  /** Reservado para una futura versión con servidor; vacío en la versión local-first. */
  syncQueue: { key: string; value: SyncOp; indexes: { byNextAttempt: number; byEntity: string } };
}

export type DeadlineDatabase = IDBPDatabase<DeadlineDB>;

/**
 * Migraciones incrementales. Nunca se edita una migración publicada:
 * se añade un nuevo `case` y se sube DB_VERSION.
 */
export function upgrade(db: DeadlineDatabase, oldVersion: number): void {
  if (oldVersion < 1) {
    {
      db.createObjectStore('meta', { keyPath: 'key' });
      db.createObjectStore('settings');
      const catalog = db.createObjectStore('catalog', { keyPath: 'id' });
      catalog.createIndex('byMode', 'mode');
      catalog.createIndex('byEra', 'era');
      catalog.createIndex('byCategory', 'category');
      catalog.createIndex('byDaily', 'dailyIndex');
      db.createObjectStore('caseContent', { keyPath: 'id' });
      const assets = db.createObjectStore('caseAssets', { keyPath: 'caseId' });
      assets.createIndex('byState', 'state');
      const inv = db.createObjectStore('investigations', { keyPath: 'id' });
      inv.createIndex('byCase', 'caseId');
      inv.createIndex('byStatus', 'status');
      const rec = db.createObjectStore('caseRecords', { keyPath: 'caseId' });
      rec.createIndex('byStatus', 'status');
      rec.createIndex('byMode', 'mode');
      const notes = db.createObjectStore('notes', { keyPath: 'id' });
      notes.createIndex('byCase', 'caseId');
      notes.createIndex('byUpdated', 'updatedAt');
      db.createObjectStore('dailyLedger');
      const queue = db.createObjectStore('syncQueue', { keyPath: 'opId' });
      queue.createIndex('byNextAttempt', 'nextAttemptAt');
      queue.createIndex('byEntity', 'entityKey');
    }
  }
  if (oldVersion < 2) {
    db.createObjectStore('profile');
  }
  if (oldVersion < 3) {
    const coop = db.createObjectStore('coopSessions', { keyPath: 'id' });
    coop.createIndex('byCase', 'caseId');
    coop.createIndex('byUpdated', 'updatedAt');
  }
  if (oldVersion < 4) {
    db.createObjectStore('friends', { keyPath: 'number' });
  }
  // Futuras versiones: if (oldVersion < 5) { … }
}

let dbPromise: Promise<DeadlineDatabase> | null = null;

export function getDB(): Promise<DeadlineDatabase> {
  if (!dbPromise) {
    dbPromise = openDB<DeadlineDB>(DB_NAME, DB_VERSION, {
      upgrade: (db, oldVersion) => upgrade(db, oldVersion),
      blocked: () => console.warn('[db] Otra pestaña con una versión antigua bloquea la actualización'),
      blocking: () => {
        // Otra pestaña necesita una versión nueva: cerramos para no bloquearla.
        void dbPromise?.then((db) => db.close());
        dbPromise = null;
      },
      terminated: () => {
        // iOS puede cerrar la conexión en segundo plano; se reabrirá en el próximo acceso.
        dbPromise = null;
      },
    }).catch((err: unknown) => {
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

/** Solo para pruebas. */
export async function resetDBForTests(): Promise<void> {
  if (dbPromise) (await dbPromise).close();
  dbPromise = null;
}

export async function storeCounts(): Promise<Record<string, number>> {
  const db = await getDB();
  const names = [...db.objectStoreNames];
  const counts: Record<string, number> = {};
  await Promise.all(names.map(async (n) => (counts[n] = await db.count(n))));
  return counts;
}
