import type { Difficulty } from '../case/taxonomy.ts';

/**
 * Reglas económicas base. Propuesta inicial; se calibrarán en la Etapa 7.
 * Versión local-first: estas reglas se aplican en el dispositivo, que es la
 * única autoridad. No son verificables por terceros (ver docs/LOCAL_FIRST.md).
 */

/** Puntos por componente de la acusación, según dificultad. */
export const ACCUSATION_POINTS: Record<Difficulty, { culprit: number; motive: number; method: number; proof: number; solveBonus: number }> = {
  detective: { culprit: 300, motive: 120, method: 120, proof: 160, solveBonus: 100 },
  inspector: { culprit: 450, motive: 180, method: 180, proof: 240, solveBonus: 200 },
  'special-unit': { culprit: 650, motive: 260, method: 260, proof: 340, solveBonus: 400 },
};

/** Coste de reabrir un expediente cerrado. */
export const REOPEN_COST: Record<Difficulty, number> = {
  detective: 150,
  inspector: 300,
  'special-unit': 500,
};

/** Penalización por nivel de pista consumido (porcentaje del total de la acusación). */
export const HINT_PENALTY_PCT: Record<1 | 2 | 3, number> = { 1: 3, 2: 6, 3: 10 };

/**
 * Las recompensas por descubrimientos (evidencias, secretos, contradicciones,
 * objetivos) solo se cobran la primera vez en toda la vida del jugador para
 * ese expediente. Repetir o reabrir un caso resuelto no suma puntos de
 * acusación de nuevo; solo puede mejorar `bestScore` (mérito, no saldo).
 */
export function rewardKey(kind: 'evidence' | 'detail' | 'secret' | 'contradiction' | 'deduction' | 'objective' | 'solve', id = ''): string {
  return id ? `${kind}:${id}` : kind;
}
