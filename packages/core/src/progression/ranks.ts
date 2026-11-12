/**
 * RANGOS. Dos progresiones independientes (individual y cooperativa) con la
 * misma escala. Los ascensos combinan mérito acumulado, precisión y
 * dificultad superada: no basta con jugar muchas partidas.
 *
 * Los umbrales son la propuesta inicial de diseño; se ajustarán con datos
 * de prueba en la Etapa 7. El servidor es quien decide los ascensos.
 */

export const RANKS = ['rookie', 'detective', 'inspector', 'chief-inspector', 'commissioner', 'legend'] as const;
export type Rank = (typeof RANKS)[number];

export interface RankRequirement {
  /** Puntos de mérito acumulados (no gastables; distintos del saldo de puntos). */
  merit: number;
  /** Expedientes resueltos con acusación completamente correcta. */
  perfectSolves: number;
  /** Precisión mínima de acusación (correctas / formuladas) sobre los últimos casos. */
  minAccuracy: number;
  /** Casos resueltos de cada dificultad exigidos. */
  solvedByDifficulty: { detective: number; inspector: number; 'special-unit': number };
}

export interface RankDefinition {
  id: Rank;
  label: string;
  description: string;
  /** Identificador del grabado de la insignia (recurso SVG de la app). */
  insignia: string;
  requirement: RankRequirement;
}

export const RANK_DEFINITIONS: readonly RankDefinition[] = [
  {
    id: 'rookie',
    label: 'Novato',
    description: 'Acabas de recibir tu placa y una mesa con más polvo que expedientes.',
    insignia: 'insignia-rookie',
    requirement: { merit: 0, perfectSolves: 0, minAccuracy: 0, solvedByDifficulty: { detective: 0, inspector: 0, 'special-unit': 0 } },
  },
  {
    id: 'detective',
    label: 'Detective',
    description: 'Sabes leer una coartada y desconfiar de un testigo demasiado seguro.',
    insignia: 'insignia-detective',
    requirement: { merit: 1500, perfectSolves: 3, minAccuracy: 0.4, solvedByDifficulty: { detective: 3, inspector: 0, 'special-unit': 0 } },
  },
  {
    id: 'inspector',
    label: 'Inspector',
    description: 'Los casos ambiguos llegan a tu mesa porque otros no supieron cerrarlos.',
    insignia: 'insignia-inspector',
    requirement: { merit: 6000, perfectSolves: 12, minAccuracy: 0.55, solvedByDifficulty: { detective: 8, inspector: 4, 'special-unit': 0 } },
  },
  {
    id: 'chief-inspector',
    label: 'Inspector jefe',
    description: 'Diriges investigaciones donde cada testimonio esconde otro.',
    insignia: 'insignia-chief-inspector',
    requirement: { merit: 15000, perfectSolves: 30, minAccuracy: 0.65, solvedByDifficulty: { detective: 12, inspector: 12, 'special-unit': 3 } },
  },
  {
    id: 'commissioner',
    label: 'Comisario',
    description: 'Tu firma cierra expedientes que llevaban décadas abiertos.',
    insignia: 'insignia-commissioner',
    requirement: { merit: 35000, perfectSolves: 70, minAccuracy: 0.72, solvedByDifficulty: { detective: 15, inspector: 25, 'special-unit': 12 } },
  },
  {
    id: 'legend',
    label: 'Leyenda DEADLINE',
    description: 'En el archivo se cuentan tus casos como se cuentan las historias de fantasmas.',
    insignia: 'insignia-legend',
    requirement: { merit: 80000, perfectSolves: 160, minAccuracy: 0.8, solvedByDifficulty: { detective: 20, inspector: 40, 'special-unit': 35 } },
  },
];

export interface RankStats {
  merit: number;
  perfectSolves: number;
  accuracy: number;
  solvedByDifficulty: { detective: number; inspector: number; 'special-unit': number };
}

function meets(s: RankStats, r: RankRequirement): boolean {
  return (
    s.merit >= r.merit &&
    s.perfectSolves >= r.perfectSolves &&
    s.accuracy >= r.minAccuracy &&
    s.solvedByDifficulty.detective >= r.solvedByDifficulty.detective &&
    s.solvedByDifficulty.inspector >= r.solvedByDifficulty.inspector &&
    s.solvedByDifficulty['special-unit'] >= r.solvedByDifficulty['special-unit']
  );
}

/** Rango más alto cuyos requisitos se cumplen (los rangos son acumulativos). */
export function rankFor(stats: RankStats): RankDefinition {
  let current = RANK_DEFINITIONS[0]!;
  for (const def of RANK_DEFINITIONS) {
    if (meets(stats, def.requirement)) current = def;
    else break;
  }
  return current;
}

/** Progreso 0..1 hacia el siguiente rango (media de criterios, cada uno acotado a 1). */
export function progressToNext(stats: RankStats): { next: RankDefinition | undefined; progress: number } {
  const current = rankFor(stats);
  const idx = RANK_DEFINITIONS.findIndex((d) => d.id === current.id);
  const next = RANK_DEFINITIONS[idx + 1];
  if (!next) return { next: undefined, progress: 1 };
  const r = next.requirement;
  const ratio = (v: number, req: number) => (req <= 0 ? 1 : Math.min(1, v / req));
  const parts = [
    ratio(stats.merit, r.merit),
    ratio(stats.perfectSolves, r.perfectSolves),
    ratio(stats.accuracy, r.minAccuracy),
    ratio(stats.solvedByDifficulty.detective, r.solvedByDifficulty.detective),
    ratio(stats.solvedByDifficulty.inspector, r.solvedByDifficulty.inspector),
    ratio(stats.solvedByDifficulty['special-unit'], r.solvedByDifficulty['special-unit']),
  ];
  return { next, progress: parts.reduce((a, b) => a + b, 0) / parts.length };
}
