/**
 * CRONÓMETRO BASADO EN MARCAS DE TIEMPO REALES.
 *
 * El tiempo nunca se cuenta sumando "ticks": se calcula siempre como
 * `deadlineAt - ahora`. Si iOS suspende la PWA, bloquea el iPhone o el
 * jugador cierra la app, al volver el cálculo sigue siendo correcto.
 * Pausar no detiene el reloj (decisión de diseño).
 *
 * Protección frente a manipulación del reloj del dispositivo:
 * - `lastObservedAt` guarda el mayor instante visto. Si el reloj retrocede,
 *   se usa ese valor (el tiempo no puede "devolverse").
 * - Con conexión, `serverOffsetMs` corrige el reloj local con el del
 *   servidor, que es la autoridad (obligatoria en cooperativo).
 */

export interface TimerSnapshot {
  /** Instante efectivo usado para el cálculo (tras corregir y blindar). */
  now: number;
  elapsedMs: number;
  remainingMs: number;
  expired: boolean;
  /** El reloj local retrocedió respecto a lo ya observado. */
  clockWentBack: boolean;
}

export interface TimerInput {
  startedAt: number;
  deadlineAt: number;
  lastObservedAt: number;
  /** Reloj local (Date.now()). */
  localNow: number;
  /** servidor - local, en ms. 0 si nunca se ha sincronizado. */
  serverOffsetMs?: number;
}

export function readTimer(input: TimerInput): TimerSnapshot {
  const corrected = input.localNow + (input.serverOffsetMs ?? 0);
  const clockWentBack = corrected < input.lastObservedAt;
  const now = Math.max(corrected, input.lastObservedAt, input.startedAt);
  const remainingMs = Math.max(0, input.deadlineAt - now);
  return {
    now,
    elapsedMs: Math.min(now - input.startedAt, input.deadlineAt - input.startedAt),
    remainingMs,
    expired: remainingMs === 0,
    clockWentBack,
  };
}

export function deadlineFor(startedAt: number, limitMinutes: number): number {
  return startedAt + limitMinutes * 60_000;
}

/**
 * Estima el desfase con el servidor a partir de un intercambio petición/respuesta
 * (algoritmo tipo NTP simplificado: se asume latencia simétrica).
 */
export function estimateServerOffset(sentAtLocal: number, serverTime: number, receivedAtLocal: number): { offsetMs: number; rttMs: number } {
  const rttMs = Math.max(0, receivedAtLocal - sentAtLocal);
  const offsetMs = Math.round(serverTime + rttMs / 2 - receivedAtLocal);
  return { offsetMs, rttMs };
}

/** "47:09" / "1:58:03". */
export function formatRemaining(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(h > 0 ? 2 : 1, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
