import {
  buildArchive,
  mergeArchiveData,
  normalizeSettings,
  parseArchive,
  type ArchiveData,
  type DeadlineArchive,
  type ImportMode,
} from '@deadline/core';
import { APP_VERSION } from '../platform/env.ts';
import { getDB } from './db.ts';
import { ensureProfile } from './profileRepo.ts';
import { setMeta } from './meta.ts';
import type { CoopSession } from '../cases/coopTypes.ts';

/** Reúne todo el estado del jugador guardado en el dispositivo. */
export async function collectLocalData(): Promise<ArchiveData> {
  const profile = await ensureProfile();
  const db = await getDB();
  const [settings, investigations, caseRecords, notes, dailyLedger, coopSessions] = await Promise.all([
    db.get('settings', 'device'),
    db.getAll('investigations'),
    db.getAll('caseRecords'),
    db.getAll('notes'),
    db.get('dailyLedger', 'ledger'),
    db.getAll('coopSessions'),
  ]);
  return {
    settings: normalizeSettings(settings),
    profile,
    investigations,
    caseRecords,
    notes,
    dailyLedger: dailyLedger ?? null,
    coopSessions: coopSessions as unknown as ArchiveData['coopSessions'],
  };
}

/** Prepara la copia sin marcarla como exportada (se puede preparar de antemano). */
export async function prepareArchive(now = Date.now()): Promise<DeadlineArchive> {
  return buildArchive(await collectLocalData(), { appVersion: APP_VERSION, now });
}

export async function markExported(at: number): Promise<void> {
  await setMeta('lastExportAt', at);
}

export async function exportArchive(now = Date.now()): Promise<DeadlineArchive> {
  const archive = await prepareArchive(now);
  await markExported(now);
  return archive;
}

export { parseArchive };

/** Aplica un archivo importado en una única transacción (todo o nada). */
export async function applyArchive(archive: DeadlineArchive, mode: ImportMode): Promise<ArchiveData> {
  const local = await collectLocalData();
  const next = mergeArchiveData(local, archive.data, mode);
  const db = await getDB();
  const tx = db.transaction(['settings', 'profile', 'investigations', 'caseRecords', 'notes', 'dailyLedger', 'coopSessions', 'meta'], 'readwrite');
  if (mode === 'replace') {
    await Promise.all([
      tx.objectStore('investigations').clear(),
      tx.objectStore('caseRecords').clear(),
      tx.objectStore('notes').clear(),
      tx.objectStore('dailyLedger').clear(),
      tx.objectStore('coopSessions').clear(),
    ]);
  }
  await tx.objectStore('settings').put(next.settings, 'device');
  await tx.objectStore('profile').put(next.profile, 'local');
  for (const x of next.investigations) await tx.objectStore('investigations').put(x);
  for (const x of next.caseRecords) await tx.objectStore('caseRecords').put(x);
  for (const x of next.notes) await tx.objectStore('notes').put(x);
  if (next.dailyLedger) await tx.objectStore('dailyLedger').put(next.dailyLedger, 'ledger');
  for (const x of next.coopSessions) await tx.objectStore('coopSessions').put(x as unknown as CoopSession);
  await tx.objectStore('meta').put({ key: 'lastImportAt', value: Date.now(), updatedAt: Date.now() });
  await tx.done;
  return next;
}
