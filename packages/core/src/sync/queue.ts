import { z } from 'zod';

/**
 * ─── RESERVADO PARA UNA FUTURA VERSIÓN CON SERVIDOR ───
 * La versión actual es local-first y no sincroniza con ningún servidor. El
 * almacén `syncQueue` de IndexedDB existe pero permanece vacío. Se conserva
 * para no tener que migrar datos si algún día se añade un backend.
 *
 * COLA DE SINCRONIZACIÓN (offline-first).
 *
 * Cada cambio local relevante para el servidor se registra como una
 * operación idempotente con `opId` único. El servidor descarta operaciones
 * ya aplicadas, de modo que reintentar nunca duplica recompensas.
 * Las entidades llevan `rev` para detectar conflictos.
 */
export const SYNC_OP_KINDS = [
  'investigation.upsert',
  'investigation.accuse',
  'caseRecord.upsert',
  'note.upsert',
  'note.delete',
  'settings.update',
  'daily.ledger',
] as const;
export type SyncOpKind = (typeof SYNC_OP_KINDS)[number];

export const syncOpSchema = z.strictObject({
  opId: z.string().min(8),
  kind: z.enum(SYNC_OP_KINDS),
  /** Clave de la entidad afectada; permite compactar varias ediciones seguidas. */
  entityKey: z.string(),
  payload: z.unknown(),
  baseRev: z.number().int().min(0),
  createdAt: z.number().int(),
  attempts: z.number().int().min(0),
  lastError: z.string().optional(),
  nextAttemptAt: z.number().int(),
});
export type SyncOp = z.infer<typeof syncOpSchema>;

/** Las operaciones "upsert" sobre la misma entidad se compactan; las acusaciones nunca. */
export function isCompactable(kind: SyncOpKind): boolean {
  return kind !== 'investigation.accuse';
}

/** Reintento con espera exponencial y jitter, acotado a 10 minutos. */
export function nextBackoff(attempts: number, random: () => number = Math.random): number {
  const base = Math.min(600_000, 2_000 * 2 ** attempts);
  return Math.round(base / 2 + random() * (base / 2));
}
