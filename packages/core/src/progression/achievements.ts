import type { CaseFile } from '../case/schema.ts';
import type { Investigation } from '../investigation/state.ts';
import { RANK_DEFINITIONS, rankFor, type Rank } from './ranks.ts';
import { rankStatsFor, type PlayerStats } from './stats.ts';

/**
 * LOGROS.
 *
 * - Cada logro se concede una sola vez y queda registrado con su fecha.
 * - Los secretos no muestran ni nombre ni condición hasta conseguirse.
 * - La recompensa en puntos va al saldo gastable, nunca al mérito: los
 *   rangos solo se ganan resolviendo casos.
 * - Algunos desbloquean una pieza de la oficina (ver cosmetics/catalog.ts).
 *
 * Dos tipos de comprobación:
 * - `check`: sobre las estadísticas globales (se reevalúa en cualquier momento).
 * - `caseCheck`: sobre un cierre concreto con su expediente delante
 *   (detalles ocultos, contradicciones). Solo se evalúa al cerrar.
 */

export interface AchievementContext {
  stats: PlayerStats;
  soloMerit: number;
  coopMerit: number;
}

export interface ClosureContext {
  c: CaseFile;
  inv: Investigation;
}

export interface AchievementDef {
  id: string;
  label: string;
  description: string;
  secret: boolean;
  /** Puntos gastables que concede. */
  reward: number;
  check?: (x: AchievementContext) => boolean;
  caseCheck?: (x: ClosureContext) => boolean;
  /** Progreso visible [actual, objetivo] para logros acumulativos. */
  progress?: (x: AchievementContext) => [number, number];
}

const solvedTotal = (x: AchievementContext) => x.stats.solo.solvedCases + x.stats.coop.solvedCases;
const perfectTotal = (x: AchievementContext) => x.stats.solo.perfect + x.stats.coop.perfect;

function reached(x: AchievementContext, rank: Rank): boolean {
  const idx = RANK_DEFINITIONS.findIndex((r) => r.id === rank);
  const solo = RANK_DEFINITIONS.findIndex((r) => r.id === rankFor(rankStatsFor(x.stats, 'solo', x.soloMerit)).id);
  const coop = RANK_DEFINITIONS.findIndex((r) => r.id === rankFor(rankStatsFor(x.stats, 'coop', x.coopMerit)).id);
  return Math.max(solo, coop) >= idx;
}

const count = (get: (x: AchievementContext) => number, goal: number) => ({
  check: (x: AchievementContext) => get(x) >= goal,
  progress: (x: AchievementContext): [number, number] => [Math.min(goal, get(x)), goal],
});

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  { id: 'first-signature', label: 'Primera firma', description: 'Resuelve tu primer expediente.', secret: false, reward: 100, ...count(solvedTotal, 1) },
  { id: 'clean-record', label: 'Acta impecable', description: 'Resuelve un expediente con culpable, motivo, método y prueba correctos.', secret: false, reward: 150, ...count(perfectTotal, 1) },
  { id: 'no-crutches', label: 'Sin muletas', description: 'Resuelve un expediente sin consultar ninguna pista.', secret: false, reward: 150, ...count((x) => x.stats.feats.noHintSolves, 1) },
  { id: 'against-the-clock', label: 'Contrarreloj', description: 'Resuelve un expediente con más de la mitad del tiempo por delante.', secret: false, reward: 150, ...count((x) => x.stats.feats.fastSolves, 1) },
  { id: 'chronicler', label: 'Cronista', description: 'Resuelve un expediente con la cronología perfectamente ordenada.', secret: false, reward: 120, ...count((x) => x.stats.feats.perfectTimelines, 1) },
  { id: 'second-chance', label: 'Segunda oportunidad', description: 'Resuelve un expediente que habías tenido que reabrir.', secret: false, reward: 100, ...count((x) => x.stats.feats.reopenSolves, 1) },
  { id: 'eagle-eye', label: 'Ojo de lince', description: 'Encuentra todos los detalles ocultos de un expediente.', secret: false, reward: 200, caseCheck: ({ c, inv }) => allDetails(c, inv) },
  { id: 'not-a-comma', label: 'Ni una coma', description: 'Señala todas las contradicciones de un expediente.', secret: false, reward: 200, caseCheck: ({ c, inv }) => c.contradictions.length > 0 && c.contradictions.every((x) => inv.knowledge.contradictions.includes(x.id)) },
  { id: 'all-terrain', label: 'Todo terreno', description: 'Resuelve al menos un expediente de cada dificultad.', secret: false, reward: 300, ...count((x) => (['detective', 'inspector', 'special-unit'] as const).filter((d) => x.stats.solo.solvedByDifficulty[d] + x.stats.coop.solvedByDifficulty[d] > 0).length, 3) },
  { id: 'spotless-file', label: 'Expediente limpio', description: 'Consigue cinco actas impecables.', secret: false, reward: 400, ...count(perfectTotal, 5) },
  { id: 'newspaper-library', label: 'Hemeroteca', description: 'Resuelve un expediente inspirado en hechos reales.', secret: false, reward: 100, ...count((x) => x.stats.feats.realCaseSolves, 1) },
  { id: 'streak-3', label: 'Constancia', description: 'Resuelve el caso del día tres días seguidos.', secret: false, reward: 120, ...count((x) => x.stats.daily.bestStreak, 3) },
  { id: 'streak-7', label: 'Semana en vela', description: 'Resuelve el caso del día siete días seguidos.', secret: false, reward: 250, ...count((x) => x.stats.daily.bestStreak, 7) },
  { id: 'streak-30', label: 'Mes de guardia', description: 'Resuelve el caso del día treinta días seguidos.', secret: false, reward: 600, ...count((x) => x.stats.daily.bestStreak, 30) },
  { id: 'ten-dailies', label: 'Hoja tras hoja', description: 'Resuelve diez casos del día.', secret: false, reward: 200, ...count((x) => x.stats.daily.solved, 10) },
  { id: 'two-badges', label: 'Dos placas', description: 'Resuelve tu primer expediente en pareja.', secret: false, reward: 150, ...count((x) => x.stats.coop.solvedCases, 1) },
  { id: 'shared-table', label: 'Mesa compartida', description: 'Resuelve un expediente en pareja con un solo iPhone.', secret: false, reward: 100, ...count((x) => x.stats.feats.coopSameDeviceSolves, 1) },
  { id: 'registered-mail', label: 'Correo certificado', description: 'Resuelve un expediente en pareja por correspondencia, entre dos iPhone.', secret: false, reward: 150, ...count((x) => x.stats.feats.coopCorrespondenceSolves, 1) },
  { id: 'rank-detective', label: 'Placa de detective', description: 'Alcanza el rango de Detective.', secret: false, reward: 200, check: (x) => reached(x, 'detective') },
  { id: 'rank-inspector', label: 'Galones de inspector', description: 'Alcanza el rango de Inspector.', secret: false, reward: 400, check: (x) => reached(x, 'inspector') },
  { id: 'rank-chief-inspector', label: 'Despacho propio', description: 'Alcanza el rango de Inspector jefe.', secret: false, reward: 700, check: (x) => reached(x, 'chief-inspector') },
  { id: 'rank-commissioner', label: 'La firma del comisario', description: 'Alcanza el rango de Comisario.', secret: false, reward: 1000, check: (x) => reached(x, 'commissioner') },
  { id: 'rank-legend', label: 'Leyenda', description: 'Alcanza el rango de Leyenda DEADLINE.', secret: false, reward: 2000, check: (x) => reached(x, 'legend') },

  // Secretos: no se muestran hasta conseguirse.
  { id: 'by-a-hair', label: 'Al filo', description: 'Resolviste un expediente con menos de un minuto en el reloj.', secret: true, reward: 200, check: (x) => x.stats.feats.lastMinuteSolves > 0 },
  { id: 'night-shift', label: 'Turno de noche', description: 'Cerraste un expediente entre la medianoche y las cinco de la mañana.', secret: true, reward: 100, check: (x) => x.stats.feats.nightSolves > 0 },
  { id: 'miscarriage', label: 'Error judicial', description: 'Acusaste a alguien que no lo hizo. Le pasa a los mejores.', secret: true, reward: 50, check: (x) => x.stats.feats.wrongCulprits > 0 },
  { id: 'all-roads', label: 'Todos los caminos', description: 'Viste tres finales distintos de un mismo expediente.', secret: true, reward: 250, check: (x) => x.stats.feats.maxEndingsInOneCase >= 3 },
  { id: 'cold-reading', label: 'Lectura en frío', description: 'Resolviste un expediente sin hacer una sola pregunta.', secret: true, reward: 300, caseCheck: ({ inv }) => solvedOk(inv) && !inv.log.some((l) => l.type === 'ask') },
];

function solvedOk(inv: Investigation): boolean {
  return inv.result?.outcome === 'success' || inv.result?.outcome === 'partial';
}

function allDetails(c: CaseFile, inv: Investigation): boolean {
  const ids = new Set<string>();
  for (const e of c.evidence) for (const d of e.details) ids.add(d.id);
  return ids.size > 0 && [...ids].every((id) => inv.knowledge.details.includes(id));
}

export function achievementById(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/**
 * Logros nuevos: los que se cumplen ahora y aún no estaban concedidos.
 * Con `closure` también se evalúan los ligados a un cierre concreto.
 */
export function newAchievements(ctx: AchievementContext, already: readonly string[], closure?: ClosureContext): AchievementDef[] {
  const have = new Set(already);
  return ACHIEVEMENTS.filter((a) => {
    if (have.has(a.id)) return false;
    if (a.check?.(ctx)) return true;
    if (closure && a.caseCheck?.(closure)) return true;
    return false;
  });
}
