/**
 * Taxonomías cerradas del archivo DEADLINE.
 * Las etiquetas visibles están en español; los identificadores son estables y
 * nunca deben traducirse ni cambiarse una vez publicados (se usan en filtros,
 * estadísticas y sincronización).
 */

export const CASE_MODES = ['individual', 'daily', 'coop'] as const;
export type CaseMode = (typeof CASE_MODES)[number];

export const ERAS = [
  'antiquity',
  'medieval',
  'early-modern',
  'c19',
  'c20',
  'contemporary',
  'near-future',
  'dystopian-future',
] as const;
export type Era = (typeof ERAS)[number];

export const ERA_LABELS: Record<Era, string> = {
  antiquity: 'Antigüedad',
  medieval: 'Edad Media',
  'early-modern': 'Edad Moderna',
  c19: 'Siglo XIX',
  c20: 'Siglo XX',
  contemporary: 'Época contemporánea',
  'near-future': 'Futuro cercano',
  'dystopian-future': 'Futuro distópico',
};

export const CRIME_CATEGORIES = [
  'homicide',
  'disappearance',
  'kidnapping',
  'robbery',
  'blackmail',
  'conspiracy',
  'fraud',
  'unsolved',
] as const;
export type CrimeCategory = (typeof CRIME_CATEGORIES)[number];

export const CRIME_CATEGORY_LABELS: Record<CrimeCategory, string> = {
  homicide: 'Homicidios y muertes sospechosas',
  disappearance: 'Desapariciones',
  kidnapping: 'Secuestros',
  robbery: 'Robos y atracos',
  blackmail: 'Chantajes y extorsiones',
  conspiracy: 'Conspiraciones y corrupción',
  fraud: 'Fraudes y estafas',
  unsolved: 'Casos sin resolver',
};

export const ORIGINS = ['real', 'fiction', 'linked'] as const;
export type Origin = (typeof ORIGINS)[number];

export const ORIGIN_LABELS: Record<Origin, string> = {
  real: 'Inspirado en hechos reales',
  fiction: 'Ficción original',
  linked: 'Expediente vinculado',
};

/** Dificultad fija por diseño. No se elige ni se muestra antes de abrir el caso. */
export const DIFFICULTIES = ['detective', 'inspector', 'special-unit'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  detective: 'Detective',
  inspector: 'Inspector',
  'special-unit': 'Unidad Especial',
};

export const EVIDENCE_KINDS = [
  'photo',
  'object',
  'report',
  'letter',
  'record',
  'map',
  'document',
  'statement',
  'transcript',
  'physical',
  'digital',
  'press',
] as const;
export type EvidenceKind = (typeof EVIDENCE_KINDS)[number];

export const EVIDENCE_KIND_LABELS: Record<EvidenceKind, string> = {
  photo: 'Fotografía',
  object: 'Objeto',
  report: 'Informe',
  letter: 'Carta',
  record: 'Registro',
  map: 'Mapa',
  document: 'Documento',
  statement: 'Declaración',
  transcript: 'Transcripción',
  physical: 'Prueba física',
  digital: 'Evidencia digital',
  press: 'Recorte de prensa',
};

/** Límite temporal por modo (minutos). Un expediente puede declarar uno propio si el diseño lo justifica. */
export const DEFAULT_TIME_LIMIT_MINUTES: Record<CaseMode, number> = {
  individual: 60,
  daily: 60,
  coop: 120,
};
