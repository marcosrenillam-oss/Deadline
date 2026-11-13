import type { CaseMode, Difficulty, Origin } from '../case/taxonomy.ts';
import type { CaseRecord, Investigation } from '../investigation/state.ts';
import type { RankStats } from './ranks.ts';

/**
 * ESTADÍSTICAS DEL INVESTIGADOR.
 *
 * Se calculan siempre a partir de los datos guardados (investigaciones y
 * registros), nunca se acumulan aparte: así no pueden desincronizarse y una
 * copia de seguridad importada las recalcula sola.
 *
 * Cooperativo: en la mesa compartida las dos carpetas se cierran con la
 * misma acusación; se cuenta una sola vez por partida (`coopSessionId`).
 */

export interface CaseMeta {
  difficulty: Difficulty;
  mode: CaseMode;
  origin?: Origin;
  title?: string;
}

export interface ModeStats {
  /** Expedientes distintos abiertos. */
  opened: number;
  /** Intentos (aperturas y reaperturas; en pareja, partidas). */
  attempts: number;
  accusations: number;
  /** Acusaciones con el culpable correcto. */
  correctCulprit: number;
  /** Expedientes distintos resueltos con acta completa (culpable, motivo, método y prueba). */
  perfect: number;
  /** Expedientes distintos resueltos (total o parcialmente). */
  solvedCases: number;
  solvedByDifficulty: Record<Difficulty, number>;
  failures: number;
  expired: number;
  /** Precisión del culpable en las últimas 20 acusaciones (0..1). */
  recentAccuracy: number;
  hintsUsed: number;
  /** Media y mejor tiempo de las resoluciones (ms). */
  avgSolveMs: number | null;
  fastestSolveMs: number | null;
  /** Tiempo total transcurrido en investigaciones cerradas (ms). */
  totalPlayMs: number;
  pointsEarned: number;
}

export interface PlayerStats {
  solo: ModeStats;
  coop: ModeStats;
  daily: { solved: number; currentStreak: number; bestStreak: number };
  /** Piezas descubiertas en todas las investigaciones (con repeticiones entre intentos). */
  discoveries: { evidence: number; details: number; contradictions: number; secrets: number; deductions: number };
  /** Contadores para logros. */
  feats: {
    noHintSolves: number;
    fastSolves: number;
    lastMinuteSolves: number;
    nightSolves: number;
    reopenSolves: number;
    perfectTimelines: number;
    wrongCulprits: number;
    realCaseSolves: number;
    /** Mayor número de finales distintos vistos en un mismo expediente. */
    maxEndingsInOneCase: number;
    coopSameDeviceSolves: number;
    coopCorrespondenceSolves: number;
  };
}

export interface StatsInput {
  investigations: readonly Investigation[];
  records: readonly CaseRecord[];
  meta: (caseId: string) => CaseMeta | undefined;
  /** Modalidad de cada partida cooperativa (por id de partida). */
  coopMode?: (sessionId: string) => 'same-device' | 'correspondence' | undefined;
  now: number;
  /** Clave de día local (por defecto, la del dispositivo). */
  dayKey?: (t: number) => string;
  /** Hora local 0..23 (por defecto, la del dispositivo). */
  hourOf?: (t: number) => number;
}

const RECENT = 20;

export function localDayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function emptyMode(): ModeStats {
  return {
    opened: 0,
    attempts: 0,
    accusations: 0,
    correctCulprit: 0,
    perfect: 0,
    solvedCases: 0,
    solvedByDifficulty: { detective: 0, inspector: 0, 'special-unit': 0 },
    failures: 0,
    expired: 0,
    recentAccuracy: 0,
    hintsUsed: 0,
    avgSolveMs: null,
    fastestSolveMs: null,
    totalPlayMs: 0,
    pointsEarned: 0,
  };
}

const isSolved = (i: Investigation) => i.result !== undefined && (i.result.outcome === 'success' || i.result.outcome === 'partial');
const isPerfect = (i: Investigation) => {
  const c = i.result?.components;
  return !!c && c.culprit && c.motive && c.method && c.proof;
};

/** Quita la carpeta duplicada de la mesa compartida (misma partida, misma acusación). */
export function dedupeCoop(investigations: readonly Investigation[]): Investigation[] {
  const seen = new Set<string>();
  const out: Investigation[] = [];
  const sorted = [...investigations].sort((a, b) => a.startedAt - b.startedAt || a.id.localeCompare(b.id));
  for (const i of sorted) {
    if (i.mode === 'coop' && i.coopSessionId) {
      const key = `${i.coopSessionId}#${i.attempt}`;
      if (seen.has(key)) continue;
      seen.add(key);
    }
    out.push(i);
  }
  return out;
}

function streaks(days: readonly string[], today: string): { current: number; best: number } {
  const set = new Set(days);
  if (!set.size) return { current: 0, best: 0 };
  const sorted = [...set].sort();
  const toNum = (k: string) => Math.round(Date.UTC(Number(k.slice(0, 4)), Number(k.slice(5, 7)) - 1, Number(k.slice(8, 10))) / 86_400_000);
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    run = toNum(sorted[i]!) - toNum(sorted[i - 1]!) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  // La racha actual sigue viva si el último día resuelto es hoy o ayer.
  const last = toNum(sorted.at(-1)!);
  const gap = toNum(today) - last;
  let current = 0;
  if (gap <= 1) {
    current = 1;
    for (let i = sorted.length - 1; i > 0 && toNum(sorted[i]!) - toNum(sorted[i - 1]!) === 1; i--) current++;
  }
  return { current, best };
}

export function computeStats(input: StatsInput): PlayerStats {
  const dayKey = input.dayKey ?? localDayKey;
  const hourOf = input.hourOf ?? ((t: number) => new Date(t).getHours());
  const all = dedupeCoop(input.investigations);
  const solo = emptyMode();
  const coop = emptyMode();
  const opened = { solo: new Set<string>(), coop: new Set<string>() };
  const solved = { solo: new Set<string>(), coop: new Set<string>() };
  const perfect = { solo: new Set<string>(), coop: new Set<string>() };
  const solveTimes = { solo: [] as number[], coop: [] as number[] };
  const accusationsInOrder = { solo: [] as boolean[], coop: [] as boolean[] };
  const endings = new Map<string, Set<string>>();
  const dailyDays: string[] = [];
  const dailySolvedCases = new Set<string>();
  const discoveries = { evidence: 0, details: 0, contradictions: 0, secrets: 0, deductions: 0 };
  const feats: PlayerStats['feats'] = {
    noHintSolves: 0,
    fastSolves: 0,
    lastMinuteSolves: 0,
    nightSolves: 0,
    reopenSolves: 0,
    perfectTimelines: 0,
    wrongCulprits: 0,
    realCaseSolves: 0,
    maxEndingsInOneCase: 0,
    coopSameDeviceSolves: 0,
    coopCorrespondenceSolves: 0,
  };

  const closedInOrder = all.filter((i) => i.result).sort((a, b) => (a.closedAt ?? 0) - (b.closedAt ?? 0));
  for (const i of all) {
    const bucket = i.mode === 'coop' ? 'coop' : 'solo';
    const m = bucket === 'coop' ? coop : solo;
    opened[bucket].add(i.caseId);
    m.attempts++;
    m.hintsUsed += i.hintsUsed.length;
    discoveries.evidence += i.knowledge.evidence.length;
    discoveries.details += i.knowledge.details.length;
    discoveries.contradictions += i.knowledge.contradictions.length;
    discoveries.secrets += i.knowledge.secrets.length;
    discoveries.deductions += i.deductions.length;
  }

  for (const i of closedInOrder) {
    const r = i.result!;
    const bucket = i.mode === 'coop' ? 'coop' : 'solo';
    const m = bucket === 'coop' ? coop : solo;
    const meta = input.meta(i.caseId);
    m.pointsEarned += r.total;
    m.totalPlayMs += r.elapsedMs;
    if (r.endingId) {
      const set = endings.get(i.caseId) ?? new Set<string>();
      set.add(r.endingId);
      endings.set(i.caseId, set);
    }
    if (r.outcome === 'expired') {
      m.expired++;
      continue;
    }
    m.accusations++;
    accusationsInOrder[bucket].push(r.components.culprit);
    if (r.components.culprit) m.correctCulprit++;
    else feats.wrongCulprits++;
    if (!isSolved(i)) {
      m.failures++;
      continue;
    }
    const limit = i.deadlineAt - i.startedAt;
    const left = limit - r.elapsedMs;
    solveTimes[bucket].push(r.elapsedMs);
    if (!solved[bucket].has(i.caseId)) {
      solved[bucket].add(i.caseId);
      if (meta) m.solvedByDifficulty[meta.difficulty]++;
      if (meta?.origin === 'real') feats.realCaseSolves++;
    }
    if (isPerfect(i)) perfect[bucket].add(i.caseId);
    if (i.hintsUsed.length === 0) feats.noHintSolves++;
    if (left >= limit / 2) feats.fastSolves++;
    if (left < 60_000) feats.lastMinuteSolves++;
    const closed = i.closedAt ?? i.startedAt + r.elapsedMs;
    if (hourOf(closed) < 5) feats.nightSolves++;
    if (i.attempt > 1) feats.reopenSolves++;
    if (r.timelineAccuracy >= 1) feats.perfectTimelines++;
    if (i.mode === 'daily' || meta?.mode === 'daily') {
      dailyDays.push(dayKey(closed));
      dailySolvedCases.add(i.caseId);
    }
    if (i.mode === 'coop' && i.coopSessionId) {
      const mode = input.coopMode?.(i.coopSessionId);
      if (mode === 'same-device') feats.coopSameDeviceSolves++;
      if (mode === 'correspondence') feats.coopCorrespondenceSolves++;
    }
  }

  for (const [bucket, m] of [['solo', solo], ['coop', coop]] as const) {
    m.opened = opened[bucket].size;
    m.solvedCases = solved[bucket].size;
    m.perfect = perfect[bucket].size;
    const recent = accusationsInOrder[bucket].slice(-RECENT);
    m.recentAccuracy = recent.length ? recent.filter(Boolean).length / recent.length : 0;
    const t = solveTimes[bucket];
    m.avgSolveMs = t.length ? Math.round(t.reduce((a, b) => a + b, 0) / t.length) : null;
    m.fastestSolveMs = t.length ? Math.min(...t) : null;
  }
  for (const set of endings.values()) feats.maxEndingsInOneCase = Math.max(feats.maxEndingsInOneCase, set.size);
  const s = streaks(dailyDays, dayKey(input.now));

  return { solo, coop, daily: { solved: dailySolvedCases.size, currentStreak: s.current, bestStreak: s.best }, discoveries, feats };
}

/** Datos para el rango: mérito acumulado más lo que exige cada ascenso. */
export function rankStatsFor(stats: PlayerStats, mode: 'solo' | 'coop', merit: number): RankStats {
  const m = stats[mode];
  return { merit, perfectSolves: m.perfect, accuracy: m.recentAccuracy, solvedByDifficulty: { ...m.solvedByDifficulty } };
}

export function emptyStats(): PlayerStats {
  return computeStats({ investigations: [], records: [], meta: () => undefined, now: 0 });
}
