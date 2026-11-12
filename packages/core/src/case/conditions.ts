import { z } from 'zod';

/**
 * Lenguaje de condiciones de los expedientes.
 *
 * Todo lo que en un caso "depende de lo que sabe el jugador" (aparición de
 * evidencias, opciones de interrogatorio, revelación de secretos, objetivos
 * secundarios, finales alternativos…) se expresa con este pequeño lenguaje
 * declarativo, en lugar de con código específico de cada caso. Así el motor
 * es reutilizable y los casos se pueden validar estáticamente.
 */
export type Condition =
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }
  /** El jugador conoce un hecho. */
  | { fact: string }
  /** El jugador ha descubierto (tiene en su poder) una evidencia. */
  | { evidence: string }
  /** El jugador ha examinado una evidencia (la ha abierto). */
  | { examined: string }
  /** El jugador ha encontrado un detalle oculto dentro de una evidencia. */
  | { detail: string }
  /** El jugador ha señalado correctamente una contradicción. */
  | { contradiction: string }
  /** Se ha revelado un secreto de un personaje. */
  | { secret: string }
  /** El jugador ha elegido una opción concreta de interrogatorio. */
  | { asked: string }
  /** Marca narrativa libre activada por un efecto. */
  | { flag: string }
  /** Al menos `min` de las condiciones se cumplen. */
  | { atLeast: number; of: Condition[] };

export const conditionSchema: z.ZodType<Condition> = z.lazy(() =>
  z.union([
    z.strictObject({ all: z.array(conditionSchema).min(1) }),
    z.strictObject({ any: z.array(conditionSchema).min(1) }),
    z.strictObject({ not: conditionSchema }),
    z.strictObject({ fact: z.string().min(1) }),
    z.strictObject({ evidence: z.string().min(1) }),
    z.strictObject({ examined: z.string().min(1) }),
    z.strictObject({ detail: z.string().min(1) }),
    z.strictObject({ contradiction: z.string().min(1) }),
    z.strictObject({ secret: z.string().min(1) }),
    z.strictObject({ asked: z.string().min(1) }),
    z.strictObject({ flag: z.string().min(1) }),
    z.strictObject({
      atLeast: z.number().int().min(1),
      of: z.array(conditionSchema).min(1),
    }),
  ]),
);

/**
 * Efectos que producen las acciones del jugador (preguntar, confrontar,
 * examinar un detalle…). Igual que las condiciones, son datos, no código.
 */
export type Effect =
  | { grantFact: string }
  | { grantEvidence: string }
  | { revealSecret: string }
  | { setFlag: string }
  | { unlockTimelineEvent: string };

export const effectSchema: z.ZodType<Effect> = z.union([
  z.strictObject({ grantFact: z.string().min(1) }),
  z.strictObject({ grantEvidence: z.string().min(1) }),
  z.strictObject({ revealSecret: z.string().min(1) }),
  z.strictObject({ setFlag: z.string().min(1) }),
  z.strictObject({ unlockTimelineEvent: z.string().min(1) }),
]);

/**
 * Conocimiento acumulado del jugador en una investigación. Es la única
 * entrada que necesitan las condiciones. Se serializa como arrays para
 * IndexedDB / red; en memoria se usa la versión con Set.
 */
export interface Knowledge {
  facts: ReadonlySet<string>;
  evidence: ReadonlySet<string>;
  examined: ReadonlySet<string>;
  details: ReadonlySet<string>;
  contradictions: ReadonlySet<string>;
  secrets: ReadonlySet<string>;
  asked: ReadonlySet<string>;
  flags: ReadonlySet<string>;
  timelineEvents: ReadonlySet<string>;
}

export type KnowledgeKey = keyof Knowledge;

export const KNOWLEDGE_KEYS: readonly KnowledgeKey[] = [
  'facts',
  'evidence',
  'examined',
  'details',
  'contradictions',
  'secrets',
  'asked',
  'flags',
  'timelineEvents',
];

export type SerializedKnowledge = Record<KnowledgeKey, string[]>;

export const serializedKnowledgeSchema = z.strictObject({
  facts: z.array(z.string()),
  evidence: z.array(z.string()),
  examined: z.array(z.string()),
  details: z.array(z.string()),
  contradictions: z.array(z.string()),
  secrets: z.array(z.string()),
  asked: z.array(z.string()),
  flags: z.array(z.string()),
  timelineEvents: z.array(z.string()),
});

export function emptyKnowledge(): Knowledge {
  return {
    facts: new Set(),
    evidence: new Set(),
    examined: new Set(),
    details: new Set(),
    contradictions: new Set(),
    secrets: new Set(),
    asked: new Set(),
    flags: new Set(),
    timelineEvents: new Set(),
  };
}

export function serializeKnowledge(k: Knowledge): SerializedKnowledge {
  const out = {} as SerializedKnowledge;
  for (const key of KNOWLEDGE_KEYS) out[key] = [...k[key]].sort();
  return out;
}

export function deserializeKnowledge(s: SerializedKnowledge): Knowledge {
  const out = {} as Record<KnowledgeKey, Set<string>>;
  for (const key of KNOWLEDGE_KEYS) out[key] = new Set(s[key]);
  return out;
}

/** Evalúa una condición. Ausencia de condición (`undefined`) = siempre cierta. */
export function evaluateCondition(cond: Condition | undefined, k: Knowledge): boolean {
  if (cond === undefined) return true;
  if ('all' in cond) return cond.all.every((c) => evaluateCondition(c, k));
  if ('any' in cond) return cond.any.some((c) => evaluateCondition(c, k));
  if ('not' in cond) return !evaluateCondition(cond.not, k);
  if ('atLeast' in cond) {
    let hits = 0;
    for (const c of cond.of) {
      if (evaluateCondition(c, k)) hits++;
      if (hits >= cond.atLeast) return true;
    }
    return false;
  }
  if ('fact' in cond) return k.facts.has(cond.fact);
  if ('evidence' in cond) return k.evidence.has(cond.evidence);
  if ('examined' in cond) return k.examined.has(cond.examined);
  if ('detail' in cond) return k.details.has(cond.detail);
  if ('contradiction' in cond) return k.contradictions.has(cond.contradiction);
  if ('secret' in cond) return k.secrets.has(cond.secret);
  if ('asked' in cond) return k.asked.has(cond.asked);
  if ('flag' in cond) return k.flags.has(cond.flag);
  return assertNever(cond);
}

/** Aplica efectos de forma inmutable y devuelve el nuevo conocimiento. */
export function applyEffects(k: Knowledge, effects: readonly Effect[]): Knowledge {
  if (effects.length === 0) return k;
  const next = cloneKnowledge(k);
  for (const e of effects) {
    if ('grantFact' in e) next.facts.add(e.grantFact);
    else if ('grantEvidence' in e) next.evidence.add(e.grantEvidence);
    else if ('revealSecret' in e) next.secrets.add(e.revealSecret);
    else if ('setFlag' in e) next.flags.add(e.setFlag);
    else if ('unlockTimelineEvent' in e) next.timelineEvents.add(e.unlockTimelineEvent);
    else assertNever(e);
  }
  return next;
}

export function cloneKnowledge(k: Knowledge): Record<KnowledgeKey, Set<string>> {
  const out = {} as Record<KnowledgeKey, Set<string>>;
  for (const key of KNOWLEDGE_KEYS) out[key] = new Set(k[key]);
  return out;
}

/** Recorre una condición y devuelve todas las referencias que contiene (para validación). */
export function collectConditionRefs(
  cond: Condition | undefined,
  out: Array<{ kind: string; id: string }> = [],
): Array<{ kind: string; id: string }> {
  if (cond === undefined) return out;
  if ('all' in cond) cond.all.forEach((c) => collectConditionRefs(c, out));
  else if ('any' in cond) cond.any.forEach((c) => collectConditionRefs(c, out));
  else if ('not' in cond) collectConditionRefs(cond.not, out);
  else if ('atLeast' in cond) cond.of.forEach((c) => collectConditionRefs(c, out));
  else {
    const [kind, id] = Object.entries(cond)[0] as [string, string];
    out.push({ kind, id });
  }
  return out;
}

function assertNever(x: never): never {
  throw new Error(`Valor no contemplado: ${JSON.stringify(x)}`);
}
