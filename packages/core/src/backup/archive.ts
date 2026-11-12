import { z } from 'zod';
import { caseRecordSchema, investigationSchema, noteSchema, type CaseRecord, type Investigation, type Note } from '../investigation/state.ts';
import { localProfileSchema, type LocalProfile } from '../profile/profile.ts';
import { normalizeSettings, type Settings } from '../settings/settings.ts';
import { dailyLedgerSchema } from '../daily/ledgerSchema.ts';
import type { DailyLedger } from '../daily/schedule.ts';
import { sanitizeLoadout } from '../cosmetics/catalog.ts';

/**
 * ARCHIVO PERSONAL: COPIA DE SEGURIDAD EXPORTABLE.
 *
 * Sin cuentas ni servidor, la única forma de conservar el progreso fuera del
 * navegador (o de llevarlo a otro iPhone) es exportarlo a un archivo.
 *
 * - El archivo es JSON legible, con formato y versión explícitos.
 * - Lleva una suma SHA-256 de su contenido: detecta archivos dañados o
 *   truncados. NO es una firma: cualquiera puede editar el archivo y
 *   recalcularla. Sin servidor no hay forma de impedir la manipulación.
 * - El contenido de los expedientes no se exporta (viene con la app); solo
 *   el estado del jugador.
 */

export const ARCHIVE_FORMAT = 'deadline-archive' as const;
export const ARCHIVE_VERSION = 1 as const;

export interface ArchiveData {
  settings: Settings;
  profile: LocalProfile;
  investigations: Investigation[];
  caseRecords: CaseRecord[];
  notes: Note[];
  dailyLedger: DailyLedger | null;
  /** Partidas cooperativas (estructura propia de la app; se validan al importar). */
  coopSessions: Array<{ id: string; updatedAt: number } & Record<string, unknown>>;
}

const archiveDataSchema = z.strictObject({
  settings: z.unknown(),
  profile: localProfileSchema,
  investigations: z.array(investigationSchema),
  caseRecords: z.array(caseRecordSchema),
  notes: z.array(noteSchema),
  dailyLedger: dailyLedgerSchema.nullable(),
  coopSessions: z.array(z.looseObject({ id: z.string(), updatedAt: z.number() })).default([]),
});

const archiveSchema = z.strictObject({
  format: z.literal(ARCHIVE_FORMAT),
  version: z.literal(ARCHIVE_VERSION),
  exportedAt: z.number().int(),
  appVersion: z.string(),
  investigatorNumber: z.string(),
  checksum: z.string().regex(/^[a-f0-9]{64}$/),
  data: archiveDataSchema,
});

export interface DeadlineArchive {
  format: typeof ARCHIVE_FORMAT;
  version: typeof ARCHIVE_VERSION;
  exportedAt: number;
  appVersion: string;
  investigatorNumber: string;
  checksum: string;
  data: ArchiveData;
}

/** JSON con claves ordenadas: la misma información produce siempre el mismo texto. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_k, v: unknown) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
    }
    return v;
  });
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function buildArchive(data: ArchiveData, meta: { appVersion: string; now: number }): Promise<DeadlineArchive> {
  return {
    format: ARCHIVE_FORMAT,
    version: ARCHIVE_VERSION,
    exportedAt: meta.now,
    appVersion: meta.appVersion,
    investigatorNumber: data.profile.investigatorNumber,
    checksum: await sha256Hex(canonicalJson(data)),
    data,
  };
}

export type ParseResult =
  | { ok: true; archive: DeadlineArchive; summary: ArchiveSummary }
  | { ok: false; error: string };

export interface ArchiveSummary {
  investigatorNumber: string;
  exportedAt: number;
  investigations: number;
  solvedCases: number;
  notes: number;
  dailyUnlocked: number;
}

export function summarize(a: DeadlineArchive): ArchiveSummary {
  return {
    investigatorNumber: a.investigatorNumber,
    exportedAt: a.exportedAt,
    investigations: a.data.investigations.length,
    solvedCases: a.data.caseRecords.filter((r) => r.status === 'solved').length,
    notes: a.data.notes.filter((n) => !n.deletedAt).length,
    dailyUnlocked: (a.data.dailyLedger?.highestUnlocked ?? -1) + 1,
  };
}

/** Lee y valida un archivo exportado. Nunca lanza: devuelve un error legible. */
export async function parseArchive(text: string): Promise<ParseResult> {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'El archivo no es un JSON válido. ¿Está completo?' };
  }
  if (!raw || typeof raw !== 'object' || (raw as { format?: unknown }).format !== ARCHIVE_FORMAT) {
    return { ok: false, error: 'No es un archivo de DEADLINE.' };
  }
  const version = (raw as { version?: unknown }).version;
  if (typeof version === 'number' && version > ARCHIVE_VERSION) {
    return { ok: false, error: 'El archivo procede de una versión más reciente de DEADLINE. Actualiza la aplicación primero.' };
  }
  const parsed = archiveSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: `El archivo tiene datos no válidos (${first ? first.path.join('.') : 'desconocido'}).` };
  }
  const p = parsed.data;
  const expected = await sha256Hex(canonicalJson((raw as { data: unknown }).data));
  if (expected !== p.checksum) {
    return { ok: false, error: 'La suma de control no coincide: el archivo está dañado o ha sido modificado.' };
  }
  const archive: DeadlineArchive = {
    ...p,
    data: {
      ...p.data,
      settings: normalizeSettings(p.data.settings),
      profile: { ...p.data.profile, equipped: sanitizeLoadout(p.data.profile.equipped, p.data.profile.unlockedCosmetics) },
    },
  };
  return { ok: true, archive, summary: summarize(archive) };
}

export type ImportMode = 'replace' | 'merge';

/**
 * Combina el estado local con el de un archivo.
 * - replace: el archivo sustituye por completo al dispositivo.
 * - merge: une ambos sin perder nada; ante el mismo elemento gana la versión
 *   más reciente. Las recompensas cobradas se unen (nunca se cobran dos veces).
 */
export function mergeArchiveData(local: ArchiveData, incoming: ArchiveData, mode: ImportMode): ArchiveData {
  if (mode === 'replace') return incoming;

  const byNewest = <T extends { updatedAt: number }>(a: T[], b: T[], key: (x: T) => string): T[] => {
    const map = new Map<string, T>();
    for (const x of [...a, ...b]) {
      const prev = map.get(key(x));
      if (!prev || x.updatedAt > prev.updatedAt) map.set(key(x), x);
    }
    return [...map.values()];
  };

  const STATUS_RANK: Record<CaseRecord['status'], number> = { unopened: 0, 'in-progress': 1, closed: 2, solved: 3 };
  const records = new Map<string, CaseRecord>(local.caseRecords.map((r) => [r.caseId, r]));
  for (const r of incoming.caseRecords) {
    const l = records.get(r.caseId);
    if (!l) {
      records.set(r.caseId, r);
      continue;
    }
    const winner = STATUS_RANK[r.status] > STATUS_RANK[l.status] ? r : l;
    const solvedAt = [l.solvedAt, r.solvedAt].filter((x): x is number => x !== undefined);
    const merged: CaseRecord = {
      ...winner,
      firstOpenedAt: Math.min(l.firstOpenedAt, r.firstOpenedAt),
      attempts: [...new Set([...l.attempts, ...r.attempts])],
      bestScore: Math.max(l.bestScore, r.bestScore),
      rewardedKeys: [...new Set([...l.rewardedKeys, ...r.rewardedKeys])].sort(),
    };
    if (solvedAt.length) merged.solvedAt = Math.min(...solvedAt);
    records.set(r.caseId, merged);
  }

  let dailyLedger = local.dailyLedger ?? incoming.dailyLedger;
  if (local.dailyLedger && incoming.dailyLedger) {
    const [early, late] = local.dailyLedger.calendarStart <= incoming.dailyLedger.calendarStart ? [local.dailyLedger, incoming.dailyLedger] : [incoming.dailyLedger, local.dailyLedger];
    dailyLedger = early.calendarStart === late.calendarStart
      ? { calendarStart: early.calendarStart, highestUnlocked: Math.max(early.highestUnlocked, late.highestUnlocked), unlockedOn: { ...late.unlockedOn, ...early.unlockedOn } }
      : early;
  }

  const unlocked = [...new Set([...local.profile.unlockedCosmetics, ...incoming.profile.unlockedCosmetics])].sort();
  const newerProfile = incoming.profile.updatedAt > local.profile.updatedAt ? incoming.profile : local.profile;
  const profile: LocalProfile = {
    ...newerProfile,
    // El número de investigador del dispositivo más antiguo se conserva.
    investigatorNumber: local.profile.createdAt <= incoming.profile.createdAt ? local.profile.investigatorNumber : incoming.profile.investigatorNumber,
    createdAt: Math.min(local.profile.createdAt, incoming.profile.createdAt),
    unlockedCosmetics: unlocked,
    points: Math.max(local.profile.points, incoming.profile.points),
    soloMerit: Math.max(local.profile.soloMerit, incoming.profile.soloMerit),
    coopMerit: Math.max(local.profile.coopMerit, incoming.profile.coopMerit),
    equipped: sanitizeLoadout(newerProfile.equipped, unlocked),
  };

  return {
    settings: local.settings,
    profile,
    investigations: byNewest(local.investigations, incoming.investigations, (x) => x.id),
    caseRecords: [...records.values()],
    notes: byNewest(local.notes, incoming.notes, (x) => x.id),
    dailyLedger,
    coopSessions: byNewest(local.coopSessions, incoming.coopSessions, (x) => x.id),
  };
}

export function archiveFileName(a: Pick<DeadlineArchive, 'investigatorNumber' | 'exportedAt'>): string {
  const d = new Date(a.exportedAt);
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `deadline-${a.investigatorNumber}-${stamp}.json`;
}
