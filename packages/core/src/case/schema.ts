import { z } from 'zod';
import { conditionSchema, effectSchema } from './conditions.ts';
import {
  CASE_MODES,
  CRIME_CATEGORIES,
  DIFFICULTIES,
  ERAS,
  EVIDENCE_KINDS,
  ORIGINS,
} from './taxonomy.ts';

/**
 * ESQUEMA DE UN EXPEDIENTE (contenido estático, idéntico para todos los jugadores).
 *
 * Convenciones:
 * - Todos los identificadores internos son únicos dentro del expediente, sea
 *   cual sea su tipo (el validador lo comprueba). Prefijos recomendados:
 *   ch- personajes · ev- evidencias · dt- detalles · fa- hechos · lo- lugares ·
 *   te- eventos de cronología · in- interrogatorios · tp- temas · q- preguntas ·
 *   ln- líneas de diálogo citables · cx- contradicciones · se- secretos ·
 *   de- deducciones · mo- motivos · me- métodos · hl- líneas de pista ·
 *   ob- objetivos · en- finales · as- recursos.
 * - El tiempo dentro de la ficción se expresa en minutos relativos al
 *   momento del incidente (t = 0), con un texto de época para mostrar. Así el
 *   motor funciona igual en el año 64 que en 2096.
 * - Nada de lo que hay aquí es estado del jugador.
 */

const id = z.string().regex(/^[a-z]{1,3}-[a-z0-9-]+$/, 'Identificador interno con prefijo, p. ej. "ev-carta-sellada"');
const text = z.string().min(1);
const optionalCondition = conditionSchema.optional();
const effects = z.array(effectSchema).default([]);

export const CASE_ID_PATTERN = /^DL-[IDC]-\d{4}$/;
export const SCHEMA_VERSION = 1 as const;

// ─── Recursos ────────────────────────────────────────────────────────────────

export const assetSchema = z.strictObject({
  id,
  kind: z.enum(['image', 'audio']),
  /** Ruta relativa al directorio de recursos del caso, o `shared/...` para recursos reutilizados entre casos. */
  src: z.string().regex(/^(shared\/)?[a-z0-9/_.-]+\.(webp|avif|jpg|png|svg|m4a|mp3|ogg|opus)$/),
  bytes: z.number().int().positive(),
  /** SHA-256 en hexadecimal; se usa para verificar descargas offline. */
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  /** Texto alternativo obligatorio para accesibilidad. */
  alt: text,
  credit: z.string().optional(),
});
export type Asset = z.infer<typeof assetSchema>;

// ─── Bloques de documento ─────────────────────────────────────────────────────

/** Contenido de documentos (informes, cartas, declaraciones…) en bloques tipados. */
export const docBlockSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('heading'), text }),
  z.strictObject({ type: z.literal('paragraph'), text }),
  /** Texto mecanografiado. */
  z.strictObject({ type: z.literal('typed'), text }),
  /** Anotación manuscrita. */
  z.strictObject({ type: z.literal('handwritten'), text, author: z.string().optional() }),
  z.strictObject({ type: z.literal('quote'), text, speaker: z.string().optional(), lineId: id.optional() }),
  z.strictObject({ type: z.literal('field'), label: text, value: text }),
  z.strictObject({ type: z.literal('table'), header: z.array(z.string()).optional(), rows: z.array(z.array(z.string())).min(1) }),
  z.strictObject({ type: z.literal('image'), asset: id, caption: z.string().optional() }),
  /** Pasaje tachado/censurado que se vuelve legible al cumplirse una condición. */
  z.strictObject({ type: z.literal('redacted'), text, revealedWhen: optionalCondition }),
  z.strictObject({ type: z.literal('stamp'), text }),
  z.strictObject({ type: z.literal('signature'), name: text }),
]);
export type DocBlock = z.infer<typeof docBlockSchema>;

// ─── Personajes, lugares, relaciones ─────────────────────────────────────────

export const characterSchema = z.strictObject({
  id,
  name: text,
  role: z.enum(['victim', 'suspect', 'witness', 'investigator', 'other']),
  age: z.number().int().min(0).max(200).optional(),
  /** Para épocas o casos donde la edad no se conoce con exactitud ("unos cuarenta"). */
  ageLabel: z.string().optional(),
  occupation: text,
  portrait: id.optional(),
  /** Frase de ficha. */
  summary: text,
  biography: text,
  /** Rasgos de carácter: guían el tono del diálogo y se muestran como notas del investigador. */
  personality: z.array(text).default([]),
  relationToVictim: z.string().optional(),
  /** Motivo aparente; puede permanecer oculto hasta descubrir algo. */
  motive: z.strictObject({ text, visibleWhen: optionalCondition }).optional(),
  /** Coartada declarada. La verdad se cuenta en la solución, no aquí. */
  alibi: z.strictObject({ claim: text, visibleWhen: optionalCondition }).optional(),
  /** Si existe, el personaje no aparece en la investigación hasta cumplirse. */
  appearsWhen: optionalCondition,
});
export type Character = z.infer<typeof characterSchema>;

export const locationSchema = z.strictObject({
  id,
  name: text,
  description: text,
  asset: id.optional(),
  appearsWhen: optionalCondition,
});
export type Location = z.infer<typeof locationSchema>;

export const relationshipSchema = z.strictObject({
  id,
  a: id,
  b: id,
  label: text,
  description: z.string().optional(),
  visibleWhen: optionalCondition,
});
export type Relationship = z.infer<typeof relationshipSchema>;

export const secretSchema = z.strictObject({
  id,
  characterId: id.optional(),
  text,
  /** Si se define, el secreto se revela automáticamente al cumplirse (además de por efectos). */
  revealedWhen: optionalCondition,
  /** Puntuación por descubrirlo (solo la primera vez por jugador). */
  points: z.number().int().min(0).default(0),
});
export type Secret = z.infer<typeof secretSchema>;

// ─── Hechos y evidencias ─────────────────────────────────────────────────────

/** Unidad mínima de conocimiento. Es lo que "sabe" el jugador. */
export const factSchema = z.strictObject({
  id,
  text,
  /** Si se define, el hecho se deduce automáticamente cuando se cumple. */
  derivedWhen: optionalCondition,
  important: z.boolean().default(false),
});
export type Fact = z.infer<typeof factSchema>;

export const hiddenDetailSchema = z.strictObject({
  id,
  /** Lo que el jugador advierte al encontrarlo. */
  label: text,
  description: text,
  /** Zona normalizada (0..1) sobre la imagen de la evidencia donde está el detalle. */
  region: z
    .strictObject({ x: z.number().min(0).max(1), y: z.number().min(0).max(1), w: z.number().min(0).max(1), h: z.number().min(0).max(1) })
    .optional(),
  /** Requisito previo para poder advertirlo (p. ej. haber leído otro documento). */
  requires: optionalCondition,
  effects,
  points: z.number().int().min(0).default(0),
});
export type HiddenDetail = z.infer<typeof hiddenDetailSchema>;

export const evidenceSchema = z.strictObject({
  id,
  kind: z.enum(EVIDENCE_KINDS),
  title: text,
  /** Fecha del documento en la ficción, en texto de época. */
  dated: z.string().optional(),
  /** Procedencia: quién lo aporta, dónde se encontró. */
  source: z.string().optional(),
  summary: text,
  asset: id.optional(),
  body: z.array(docBlockSchema).default([]),
  details: z.array(hiddenDetailSchema).default([]),
  related: z
    .strictObject({
      characters: z.array(id).default([]),
      locations: z.array(id).default([]),
      events: z.array(id).default([]),
    })
    .default({ characters: [], locations: [], events: [] }),
  /** Efectos al examinarla por primera vez. */
  onExamine: effects,
  /** Se obtiene automáticamente al cumplirse (además de por efectos o por estar en el expediente inicial). */
  autoDiscoverWhen: optionalCondition,
  /** Verdad oculta sobre la pieza, revelada en el informe final. */
  reliability: z.enum(['reliable', 'doubtful', 'forged', 'misleading']).default('reliable'),
  decisive: z.boolean().default(false),
  points: z.number().int().min(0).default(0),
  /** Solo cooperativo con información dividida: qué investigador la recibe. */
  holder: z.enum(['A', 'B', 'both']).optional(),
});
export type Evidence = z.infer<typeof evidenceSchema>;

/** Relación entre piezas que el jugador establece al compararlas. */
export const deductionSchema = z.strictObject({
  id,
  title: text,
  /** Piezas (evidencias, detalles o hechos) que hay que relacionar entre sí. El orden no importa. */
  combine: z.array(id).min(2).max(4),
  explanation: text,
  effects,
  points: z.number().int().min(0).default(0),
});
export type Deduction = z.infer<typeof deductionSchema>;

/** Referencia a una afirmación concreta que puede contradecir a otra. */
export const statementRefSchema = z.union([
  z.strictObject({ evidence: id }),
  z.strictObject({ line: id }),
  z.strictObject({ fact: id }),
  z.strictObject({ detail: id }),
]);
export type StatementRef = z.infer<typeof statementRefSchema>;

export const contradictionSchema = z.strictObject({
  id,
  title: text,
  a: statementRefSchema,
  b: statementRefSchema,
  explanation: text,
  effects,
  points: z.number().int().min(0).default(0),
});
export type Contradiction = z.infer<typeof contradictionSchema>;

// ─── Interrogatorios ─────────────────────────────────────────────────────────

export const lineSchema = z.strictObject({
  /** Solo necesario si la línea puede citarse en una contradicción. */
  id: id.optional(),
  speaker: z.enum(['subject', 'detective', 'narration']).default('subject'),
  text,
  /** Cómo se comporta el personaje en esta línea (verdad oculta, para el informe y el tono). */
  tone: z.enum(['truth', 'lie', 'evasion', 'confusion', 'admission', 'neutral']).default('neutral'),
});
export type Line = z.infer<typeof lineSchema>;

export const responseVariantSchema = z.strictObject({
  /** Primera variante cuya condición se cumple. La última debe ser incondicional. */
  when: optionalCondition,
  lines: z.array(lineSchema).min(1),
  effects,
});
export type ResponseVariant = z.infer<typeof responseVariantSchema>;

export const questionSchema = z.strictObject({
  id,
  /** Lo que dice el detective, escrito con naturalidad. */
  prompt: text,
  kind: z.enum(['ask', 'press', 'confront', 'present', 'contradiction']),
  /** Condición para que la pregunta aparezca. */
  requires: optionalCondition,
  /** Para `present`: evidencia que se muestra al sospechoso. */
  presentEvidence: id.optional(),
  /** Para `contradiction`: contradicción que se señala. */
  contradiction: id.optional(),
  responses: z.array(responseVariantSchema).min(1),
  /** Por defecto una pregunta ya formulada queda marcada y no se repite. */
  repeatable: z.boolean().default(false),
});
export type Question = z.infer<typeof questionSchema>;

export const topicSchema = z.strictObject({
  id,
  label: text,
  kind: z.enum(['events', 'person', 'victim', 'alibi', 'document', 'personal', 'other']),
  /** Personaje del que trata el tema, cuando aplica. */
  about: id.optional(),
  availableWhen: optionalCondition,
  questions: z.array(questionSchema).min(1),
});
export type Topic = z.infer<typeof topicSchema>;

export const interrogationSchema = z.strictObject({
  id,
  characterId: id,
  setting: z.string().optional(),
  availableWhen: optionalCondition,
  opening: z.array(lineSchema).min(1),
  topics: z.array(topicSchema).min(1),
  /** Cooperativo dividido: quién puede dirigir este interrogatorio. */
  holder: z.enum(['A', 'B', 'both']).optional(),
});
export type Interrogation = z.infer<typeof interrogationSchema>;

// ─── Cronología ──────────────────────────────────────────────────────────────

export const timelineEventSchema = z.strictObject({
  id,
  /** Minutos relativos al incidente (t = 0). Negativo = antes. */
  t: z.number().int(),
  /** Texto de época: "Hacia la segunda vigilia", "23:40". */
  display: text,
  title: text,
  description: text,
  characters: z.array(id).default([]),
  location: id.optional(),
  evidence: z.array(id).default([]),
  /** Un evento declarado por alguien puede ser falso; no pertenece a la cronología verdadera. */
  veracity: z.enum(['true', 'false']).default('true'),
  claimedBy: id.optional(),
  /** Evento clave: pesa en la comparación con la cronología del jugador. */
  key: z.boolean().default(false),
  autoUnlockWhen: optionalCondition,
});
export type TimelineEvent = z.infer<typeof timelineEventSchema>;

// ─── Acusación, solución, finales ────────────────────────────────────────────

export const theoryOptionSchema = z.strictObject({
  id,
  label: text,
  /** Las hipótesis de motivo/método aparecen cuando el jugador tiene base para formularlas. */
  availableWhen: optionalCondition,
});
export type TheoryOption = z.infer<typeof theoryOptionSchema>;

export const accusationMatchSchema = z.strictObject({
  /** 'correct' | 'incorrect' | id de personaje concreto acusado. */
  culprit: z.string().optional(),
  motive: z.enum(['correct', 'incorrect']).optional(),
  method: z.enum(['correct', 'incorrect']).optional(),
  proof: z.enum(['correct', 'incorrect']).optional(),
  knowledge: optionalCondition,
});
export type AccusationMatch = z.infer<typeof accusationMatchSchema>;

export const endingSchema = z.strictObject({
  id,
  when: accusationMatchSchema,
  outcome: z.enum(['success', 'partial', 'failure']),
  title: text,
  text,
});
export type Ending = z.infer<typeof endingSchema>;

export const solutionSchema = z.strictObject({
  /** Varios culpables para conspiraciones; el jugador debe señalar a todos. */
  culprits: z.array(id).min(1),
  motive: id,
  method: id,
  /** Evidencias que sirven como prueba definitiva; la primera es la ideal. */
  proof: z.array(id).min(1),
  whatHappened: text,
  reconstruction: z.array(text).min(1),
  decisiveEvidence: z.array(id).min(1),
  /** Verdad sobre coartadas y engaños, para el informe final. */
  alibiTruths: z.array(z.strictObject({ characterId: id, truth: text })).default([]),
});
export type Solution = z.infer<typeof solutionSchema>;

// ─── Ayuda, objetivos, puntuación ────────────────────────────────────────────

export const hintLineSchema = z.strictObject({
  id,
  /** Línea de investigación a la que orienta (no se muestra hasta usarla). */
  topic: text,
  /** La línea solo se ofrece mientras sea pertinente (p. ej. "aún no sabe X"). */
  relevantWhen: optionalCondition,
  /** Tres niveles progresivos: sutil, intermedio, concreto. Nunca nombran al culpable. */
  steps: z.tuple([text, text, text]),
});
export type HintLine = z.infer<typeof hintLineSchema>;

export const objectiveSchema = z.strictObject({
  id,
  text,
  completeWhen: conditionSchema,
  points: z.number().int().min(0),
  /** Objetivo secreto: no se muestra hasta completarse. */
  hidden: z.boolean().default(false),
});
export type Objective = z.infer<typeof objectiveSchema>;

export const scoringOverridesSchema = z.strictObject({
  culprit: z.number().int().min(0).optional(),
  motive: z.number().int().min(0).optional(),
  method: z.number().int().min(0).optional(),
  proof: z.number().int().min(0).optional(),
});

// ─── Expediente completo ─────────────────────────────────────────────────────

export const caseFileSchema = z.strictObject({
  schemaVersion: z.literal(SCHEMA_VERSION),
  id: z.string().regex(CASE_ID_PATTERN, 'Formato DL-<I|D|C>-0000'),
  /** Versión del contenido; se incrementa con cada corrección publicada. */
  contentVersion: z.number().int().min(1),
  mode: z.enum(CASE_MODES),
  /** Solo diarios: posición 0..499 en el calendario. */
  dailyIndex: z.number().int().min(0).max(499).optional(),
  title: text,
  subtitle: z.string().optional(),
  origin: z.enum(ORIGINS),
  /** Obligatorio en casos inspirados en hechos reales: separa lo documentado de lo inventado. */
  historical: z
    .strictObject({
      documented: z.array(text).min(1),
      hypotheses: z.array(text).default([]),
      dramatized: z.array(text).min(1),
      documentedResolution: text,
      sources: z.array(text).min(1),
    })
    .optional(),
  links: z.array(z.strictObject({ caseId: z.string().regex(CASE_ID_PATTERN), note: text, revealedWhen: optionalCondition })).default([]),
  era: z.enum(ERAS),
  /** Rótulo de época visible: "Roma, año 64 d. C.". */
  eraLabel: text,
  /** Año aproximado (negativo = a. C.) para ordenar y filtrar. */
  year: z.number().int(),
  location: z.strictObject({ city: text, place: text, country: z.string().optional() }),
  category: z.enum(CRIME_CATEGORIES),
  difficulty: z.enum(DIFFICULTIES),
  keywords: z.array(text).default([]),
  timeLimitMinutes: z.number().int().min(10).max(240).optional(),
  ambience: z.strictObject({ music: text, mood: z.enum(['tense', 'melancholic', 'opulent', 'cold', 'urban', 'rural', 'ritual']) }),
  maxHints: z.number().int().min(0).max(9),
  briefing: z.strictObject({
    incidentDisplay: text,
    summary: text,
    context: text,
    background: text,
    victim: id.optional(),
    initialFacts: z.array(id).default([]),
    initialEvidence: z.array(id).default([]),
    initialTimeline: z.array(id).default([]),
  }),
  coop: z
    .strictObject({
      style: z.enum(['shared', 'split']),
      roles: z.tuple([
        z.strictObject({ id: z.literal('A'), title: text, briefing: text }),
        z.strictObject({ id: z.literal('B'), title: text, briefing: text }),
      ]),
    })
    .optional(),
  characters: z.array(characterSchema).min(2),
  locations: z.array(locationSchema).default([]),
  relationships: z.array(relationshipSchema).default([]),
  facts: z.array(factSchema).default([]),
  evidence: z.array(evidenceSchema).min(1),
  deductions: z.array(deductionSchema).default([]),
  contradictions: z.array(contradictionSchema).default([]),
  secrets: z.array(secretSchema).default([]),
  interrogations: z.array(interrogationSchema).default([]),
  timeline: z.array(timelineEventSchema).min(2),
  accusation: z.strictObject({
    /** Por defecto, todos los personajes con rol `suspect`. */
    suspects: z.array(id).optional(),
    motives: z.array(theoryOptionSchema).min(2),
    methods: z.array(theoryOptionSchema).min(2),
  }),
  solution: solutionSchema,
  endings: z.array(endingSchema).min(2),
  hints: z.array(hintLineSchema).default([]),
  objectives: z.array(objectiveSchema).default([]),
  scoring: scoringOverridesSchema.optional(),
  assets: z.array(assetSchema).default([]),
});

/** Expediente tal y como se escribe (con campos por defecto opcionales). */
export type CaseFileInput = z.input<typeof caseFileSchema>;
/** Expediente normalizado tras validar el esquema. */
export type CaseFile = z.infer<typeof caseFileSchema>;

/**
 * Ficha de catálogo: lo mínimo para la biblioteca y los filtros sin cargar
 * el expediente completo. La dificultad está, pero la interfaz no la muestra
 * hasta que el jugador abre el caso.
 */
export interface CaseCatalogEntry {
  id: string;
  number: number;
  mode: CaseFile['mode'];
  dailyIndex?: number;
  title: string;
  subtitle?: string;
  origin: CaseFile['origin'];
  era: CaseFile['era'];
  eraLabel: string;
  year: number;
  city: string;
  place: string;
  category: CaseFile['category'];
  difficulty: CaseFile['difficulty'];
  keywords: string[];
  linkedCaseIds: string[];
  contentVersion: number;
  /** Tamaño total de los recursos, para estimar descargas. */
  assetBytes: number;
}

export function caseNumber(caseId: string): number {
  return Number(caseId.slice(-4));
}

export function formatCaseNumber(caseId: string): string {
  const mode = caseId.charAt(3);
  return `Nº ${caseId.slice(-4)}-${mode}`;
}

export function toCatalogEntry(c: CaseFile): CaseCatalogEntry {
  return {
    id: c.id,
    number: caseNumber(c.id),
    mode: c.mode,
    ...(c.dailyIndex !== undefined ? { dailyIndex: c.dailyIndex } : {}),
    title: c.title,
    ...(c.subtitle !== undefined ? { subtitle: c.subtitle } : {}),
    origin: c.origin,
    era: c.era,
    eraLabel: c.eraLabel,
    year: c.year,
    city: c.location.city,
    place: c.location.place,
    category: c.category,
    difficulty: c.difficulty,
    keywords: c.keywords,
    linkedCaseIds: c.links.map((l) => l.caseId),
    contentVersion: c.contentVersion,
    assetBytes: c.assets.reduce((sum, a) => sum + a.bytes, 0),
  };
}
