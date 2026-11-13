import { z } from 'zod';
import { serializedKnowledgeSchema } from '../case/conditions.ts';
import { CASE_MODES } from '../case/taxonomy.ts';

/**
 * ESTADO DE INVESTIGACIÓN DEL JUGADOR.
 *
 * Separado por completo del contenido del expediente. Cada intento (apertura
 * o reapertura) es una `Investigation` distinta; el `CaseRecord` agrupa los
 * intentos de un mismo caso y guarda qué recompensas ya se cobraron para que
 * reabrir o repetir no permita acumular puntos.
 *
 * Todas las marcas de tiempo reales son milisegundos epoch (UTC).
 */

export const INVESTIGATION_STATUSES = ['active', 'solved', 'failed', 'expired', 'abandoned'] as const;
export type InvestigationStatus = (typeof INVESTIGATION_STATUSES)[number];

const uuid = z.string().min(8);

export const boardNodeSchema = z.strictObject({
  id: uuid,
  ref: z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('character'), id: z.string() }),
    z.strictObject({ kind: z.literal('evidence'), id: z.string() }),
    z.strictObject({ kind: z.literal('location'), id: z.string() }),
    z.strictObject({ kind: z.literal('event'), id: z.string() }),
    z.strictObject({ kind: z.literal('motive'), id: z.string() }),
    /** Tarjeta libre escrita por el jugador (teoría, pregunta, idea). */
    z.strictObject({ kind: z.literal('theory'), text: z.string().max(280) }),
  ]),
  /** Posición en el corcho, en unidades del tablero (independiente de la pantalla). */
  x: z.number(),
  y: z.number(),
  rotation: z.number().min(-15).max(15).default(0),
  pinColor: z.enum(['red', 'brass', 'black', 'ivory']).default('red'),
});
export type BoardNode = z.infer<typeof boardNodeSchema>;

export const boardEdgeSchema = z.strictObject({
  id: uuid,
  from: uuid,
  to: uuid,
  label: z.string().max(80).optional(),
  style: z.enum(['thread', 'dashed', 'conflict']).default('thread'),
});
export type BoardEdge = z.infer<typeof boardEdgeSchema>;

export const boardStateSchema = z.strictObject({
  nodes: z.array(boardNodeSchema),
  edges: z.array(boardEdgeSchema),
  /** Vista guardada (desplazamiento y zoom). */
  viewport: z.strictObject({ x: z.number(), y: z.number(), zoom: z.number().min(0.25).max(3) }),
});
export type BoardState = z.infer<typeof boardStateSchema>;

export const playerTimelineEntrySchema = z.strictObject({
  id: uuid,
  /** Evento desbloqueado del expediente, o entrada libre del jugador. */
  eventId: z.string().optional(),
  customLabel: z.string().max(140).optional(),
  /** Hora que el jugador cree que tuvo lugar, en minutos relativos al incidente. */
  t: z.number().int().optional(),
  evidence: z.array(z.string()).default([]),
  characters: z.array(z.string()).default([]),
  /** El jugador lo marca como dudoso o contradictorio. */
  flagged: z.boolean().default(false),
});
export type PlayerTimelineEntry = z.infer<typeof playerTimelineEntrySchema>;

export const accusationSchema = z.strictObject({
  culprits: z.array(z.string()).min(1),
  motive: z.string(),
  method: z.string(),
  proof: z.string(),
  submittedAt: z.number().int(),
});
export type Accusation = z.infer<typeof accusationSchema>;

export const investigationSchema = z.strictObject({
  id: uuid,
  caseId: z.string(),
  caseVersion: z.number().int(),
  mode: z.enum(CASE_MODES),
  /** Cooperativo de información dividida: papel de este investigador. */
  role: z.enum(['A', 'B']).optional(),
  /** Cooperativo: partida a la que pertenece. */
  coopSessionId: z.string().optional(),
  /** 1 para la primera apertura; se incrementa en cada reapertura. */
  attempt: z.number().int().min(1),
  status: z.enum(INVESTIGATION_STATUSES),
  /** Inicio real. En cooperativo lo fija el servidor. */
  startedAt: z.number().int(),
  /** Límite absoluto = startedAt + límite del caso. Nunca se recalcula en cliente. */
  deadlineAt: z.number().int(),
  closedAt: z.number().int().optional(),
  /** Mayor instante de reloj observado; detecta relojes manipulados hacia atrás. */
  lastObservedAt: z.number().int(),
  knowledge: serializedKnowledgeSchema,
  /** Líneas de diálogo escuchadas (citables en contradicciones). */
  heardLines: z.array(z.string()),
  /** Niveles de pista consumidos, como "hl-xxx:1". */
  hintsUsed: z.array(z.string()),
  /** Marcas del jugador sobre evidencias (subrayar, archivar como irrelevante…). */
  evidenceMarks: z.record(z.string(), z.enum(['starred', 'dismissed'])),
  /** Asociaciones manuales evidencia → personajes/eventos/lugares hechas por el jugador. */
  associations: z.array(z.strictObject({ evidenceId: z.string(), targetId: z.string() })),
  board: boardStateSchema,
  timeline: z.array(playerTimelineEntrySchema),
  /** Deducciones (relaciones entre piezas) que el jugador ha establecido. */
  deductions: z.array(z.string()),
  /** Diario de actividad: alimenta el historial y el informe final. */
  log: z.array(z.strictObject({ at: z.number().int(), type: z.string(), ref: z.string().optional() })),
  accusation: accusationSchema.optional(),
  /** Resultado de la acusación (o del cierre por tiempo), guardado para el informe. */
  result: z
    .strictObject({
      outcome: z.enum(['success', 'partial', 'failure', 'expired']),
      endingId: z.string().optional(),
      components: z.strictObject({ culprit: z.boolean(), motive: z.boolean(), method: z.boolean(), proof: z.boolean() }),
      score: z.array(z.strictObject({ label: z.string(), points: z.number().int() })),
      total: z.number().int(),
      timelineAccuracy: z.number().min(0).max(1),
      falseEventsPlaced: z.array(z.string()),
      newRewardKeys: z.array(z.string()),
      elapsedMs: z.number().int(),
    })
    .optional(),
  /** Revisión local monótona; la usa la cola de sincronización. */
  rev: z.number().int().min(0),
  updatedAt: z.number().int(),
});
export type Investigation = z.infer<typeof investigationSchema>;

/** Resumen persistente de un expediente para un jugador, a través de todos sus intentos. */
export const caseRecordSchema = z.strictObject({
  caseId: z.string(),
  mode: z.enum(CASE_MODES),
  firstOpenedAt: z.number().int(),
  attempts: z.array(uuid),
  activeInvestigationId: uuid.optional(),
  status: z.enum(['unopened', 'in-progress', 'solved', 'closed']),
  bestScore: z.number().int().min(0).default(0),
  solvedAt: z.number().int().optional(),
  /**
   * Claves de recompensas ya cobradas ("evidence:ev-x", "secret:se-y",
   * "solve", "objective:ob-z"…). El servidor es la autoridad; el cliente
   * mantiene una copia para mostrar la previsión de puntos offline.
   */
  rewardedKeys: z.array(z.string()),
  /** Reaperturas hechas (la primera de cada expediente es gratuita). */
  reopens: z.number().int().min(0).optional(),
  /** Conocimiento acumulado de intentos anteriores (se conserva al reabrir). */
  carriedKnowledge: serializedKnowledgeSchema.optional(),
});
export type CaseRecord = z.infer<typeof caseRecordSchema>;

export const noteSchema = z.strictObject({
  id: uuid,
  /** Nota ligada a un expediente, o nota general de la libreta. */
  caseId: z.string().optional(),
  kind: z.enum(['note', 'hypothesis', 'suspicion', 'reminder', 'observation']),
  text: z.string().max(4000),
  /** Referencias que el jugador vincula (evidencias, personajes…). */
  refs: z.array(z.string()).default([]),
  pinned: z.boolean().default(false),
  done: z.boolean().default(false),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
  deletedAt: z.number().int().optional(),
  rev: z.number().int().min(0),
});
export type Note = z.infer<typeof noteSchema>;

export function emptyBoard(): BoardState {
  return { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } };
}
