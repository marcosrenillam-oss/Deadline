/**
 * CALENDARIO DE CASOS DIARIOS.
 *
 * Los 500 diarios vienen precargados. El calendario de cada jugador empieza
 * el día de su primer arranque (versión local-first, sin servidor que fije
 * una fecha común): el día 1 siempre es el diario nº 1. Cada día local del
 * jugador desbloquea el siguiente índice. Las fechas se manejan como "días civiles" (Y-M-D) y la
 * diferencia se calcula con aritmética UTC sobre esa fecha, de modo que los
 * cambios de horario de verano no producen días de 23 o 25 horas.
 *
 * Reglas anti-duplicado / anti-retroceso:
 * - Un índice desbloqueado no vuelve a bloquearse aunque el reloj retroceda.
 * - Adelantar el reloj local solo desbloquea por adelantado hasta que el
 *   servidor reconcilia: el servidor acepta como máximo el día del huso
 *   horario más adelantado (UTC+14) para su propio instante.
 */

export const DAILY_TOTAL = 500;

/** Día civil, p. ej. "2026-12-01". */
export type CivilDate = `${number}-${number}-${number}`;

export function toCivilDate(d: Date): CivilDate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}` as CivilDate;
}

export function parseCivilDate(s: string): { y: number; m: number; d: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!match) throw new Error(`Fecha civil no válida: ${s}`);
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

export function daysBetween(from: string, to: string): number {
  const a = parseCivilDate(from);
  const b = parseCivilDate(to);
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000);
}

export function addDays(date: string, days: number): CivilDate {
  const p = parseCivilDate(date);
  const t = new Date(Date.UTC(p.y, p.m - 1, p.d + days));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}` as CivilDate;
}

/**
 * Índice del diario de hoy (0..499) o -1 si el calendario aún no ha empezado.
 * Pasado el día 500 se mantiene en 499: todos están en el archivo.
 */
export function dailyIndexFor(today: string, calendarStart: string): number {
  const n = daysBetween(calendarStart, today);
  if (n < 0) return -1;
  return Math.min(n, DAILY_TOTAL - 1);
}

export interface DailyLedger {
  /** Día civil en que empieza el calendario de este jugador (índice 0). */
  calendarStart: CivilDate;
  /** Mayor índice desbloqueado alguna vez (nunca disminuye). */
  highestUnlocked: number;
  /** Fecha civil local en la que se desbloqueó cada índice. */
  unlockedOn: Record<number, CivilDate>;
}

export function createDailyLedger(calendarStart: CivilDate): DailyLedger {
  return { calendarStart, highestUnlocked: -1, unlockedOn: {} };
}

/** Avanza el registro según la fecha local actual. Puro e idempotente. */
export function advanceDailyLedger(ledger: DailyLedger, today: CivilDate): DailyLedger {
  const calendarStart = ledger.calendarStart;
  const target = dailyIndexFor(today, calendarStart);
  if (target <= ledger.highestUnlocked) return ledger;
  const unlockedOn = { ...ledger.unlockedOn };
  for (let i = ledger.highestUnlocked + 1; i <= target; i++) {
    // Los índices que se "saltaron" (app sin abrir) constan desbloqueados el día que les tocaba.
    unlockedOn[i] = addDays(calendarStart, i);
  }
  return { calendarStart, highestUnlocked: target, unlockedOn };
}

export type DailyStatus = 'locked' | 'today' | 'archived';

/** Un diario no jugado el día que le tocaba pasa al archivo permanente; nunca se pierde. */
export function dailyStatus(index: number, ledger: DailyLedger, today: CivilDate): DailyStatus {
  if (index > ledger.highestUnlocked) return 'locked';
  return index === dailyIndexFor(today, ledger.calendarStart) ? 'today' : 'archived';
}

/**
 * ─── Reservado para una futura versión con servidor ───
 * Sin servidor no hay forma de impedir que alguien adelante el reloj del
 * dispositivo para desbloquear diarios antes de tiempo (solo se perjudica
 * a sí mismo). Estas funciones quedan listas para cuando exista.
 *
 * Reconciliación con el servidor: el máximo índice legítimo es el del día
 * civil en UTC+14 para el instante del servidor (ningún huso va por delante).
 */
export function maxLegitimateDailyIndex(serverNowMs: number, calendarStart: string): number {
  const ahead = new Date(serverNowMs + 14 * 3_600_000);
  const civil = `${ahead.getUTCFullYear()}-${String(ahead.getUTCMonth() + 1).padStart(2, '0')}-${String(ahead.getUTCDate()).padStart(2, '0')}`;
  return dailyIndexFor(civil, calendarStart);
}

export function reconcileDailyLedger(local: DailyLedger, serverMaxIndex: number, serverLedger?: DailyLedger): DailyLedger {
  const merged: DailyLedger = { calendarStart: serverLedger?.calendarStart ?? local.calendarStart, highestUnlocked: Math.max(local.highestUnlocked, serverLedger?.highestUnlocked ?? -1), unlockedOn: { ...serverLedger?.unlockedOn, ...local.unlockedOn } };
  // Lo que el servidor ya registró manda sobre la fecha local.
  if (serverLedger) Object.assign(merged.unlockedOn, serverLedger.unlockedOn);
  if (merged.highestUnlocked > serverMaxIndex) {
    for (let i = serverMaxIndex + 1; i <= merged.highestUnlocked; i++) delete merged.unlockedOn[i];
    merged.highestUnlocked = serverMaxIndex;
  }
  return merged;
}
