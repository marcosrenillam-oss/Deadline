import {
  applyEffects,
  cloneKnowledge,
  deserializeKnowledge,
  emptyKnowledge,
  evaluateCondition,
  serializeKnowledge,
  type Condition,
  type Effect,
  type Knowledge,
  type SerializedKnowledge,
} from '../case/conditions.ts';
import type {
  CaseFile,
  Character,
  Contradiction,
  Deduction,
  Evidence,
  HiddenDetail,
  Interrogation,
  Line,
  Question,
  StatementRef,
  TheoryOption,
  TimelineEvent,
  Topic,
} from '../case/schema.ts';
import { DEFAULT_TIME_LIMIT_MINUTES } from '../case/taxonomy.ts';
import { emptyBoard, type Investigation } from '../investigation/state.ts';
import { deadlineFor } from '../timer/timer.ts';

/**
 * MOTOR DE INVESTIGACIÓN.
 *
 * Funciones puras: reciben el expediente (contenido inmutable) y el estado de
 * la investigación, y devuelven un estado nuevo más el resultado de la acción.
 * La interfaz nunca modifica el conocimiento directamente: todo pasa por aquí,
 * de modo que las mismas reglas valen para cualquier expediente.
 */

export type Outcome<T = undefined> = { inv: Investigation; result: T };

// ─── Utilidades de conocimiento ──────────────────────────────────────────────

export function knowledgeOf(inv: Investigation): Knowledge {
  return deserializeKnowledge(inv.knowledge);
}

/**
 * Aplica las reglas automáticas hasta que no hay cambios: hechos deducidos,
 * evidencias que aparecen solas, secretos que se revelan, eventos de
 * cronología que se desbloquean.
 */
export function settle(c: CaseFile, k: Knowledge): Knowledge {
  let cur = k;
  for (let i = 0; i < 100; i++) {
    const pending: Effect[] = [];
    for (const f of c.facts) if (f.derivedWhen && !cur.facts.has(f.id) && evaluateCondition(f.derivedWhen, cur)) pending.push({ grantFact: f.id });
    for (const e of c.evidence) if (e.autoDiscoverWhen && !cur.evidence.has(e.id) && evaluateCondition(e.autoDiscoverWhen, cur)) pending.push({ grantEvidence: e.id });
    for (const s of c.secrets) if (s.revealedWhen && !cur.secrets.has(s.id) && evaluateCondition(s.revealedWhen, cur)) pending.push({ revealSecret: s.id });
    for (const t of c.timeline) if (t.autoUnlockWhen && !cur.timelineEvents.has(t.id) && evaluateCondition(t.autoUnlockWhen, cur)) pending.push({ unlockTimelineEvent: t.id });
    if (pending.length === 0) return cur;
    cur = applyEffects(cur, pending);
  }
  return cur;
}

function commit(c: CaseFile, inv: Investigation, k: Knowledge, now: number, extra: Partial<Investigation> = {}, log?: { type: string; ref?: string }): Investigation {
  const settled = settle(c, k);
  return {
    ...inv,
    ...extra,
    knowledge: serializeKnowledge(settled),
    lastObservedAt: Math.max(inv.lastObservedAt, now),
    log: log ? [...inv.log, { at: now, type: log.type, ...(log.ref ? { ref: log.ref } : {}) }] : inv.log,
    rev: inv.rev + 1,
    updatedAt: now,
  };
}

// ─── Inicio ──────────────────────────────────────────────────────────────────

export function timeLimitMinutes(c: CaseFile): number {
  return c.timeLimitMinutes ?? DEFAULT_TIME_LIMIT_MINUTES[c.mode];
}

export function startInvestigation(
  c: CaseFile,
  opts: { id: string; now: number; attempt?: number; carried?: SerializedKnowledge; workspace?: Partial<Pick<Investigation, 'board' | 'timeline' | 'evidenceMarks' | 'associations' | 'deductions'>> },
): Investigation {
  let k = opts.carried ? deserializeKnowledge(opts.carried) : emptyKnowledge();
  k = applyEffects(k, [
    ...c.briefing.initialFacts.map((x) => ({ grantFact: x })),
    ...c.briefing.initialEvidence.map((x) => ({ grantEvidence: x })),
    ...c.briefing.initialTimeline.map((x) => ({ unlockTimelineEvent: x })),
  ]);
  const base: Investigation = {
    id: opts.id,
    caseId: c.id,
    caseVersion: c.contentVersion,
    mode: c.mode,
    attempt: opts.attempt ?? 1,
    status: 'active',
    startedAt: opts.now,
    deadlineAt: deadlineFor(opts.now, timeLimitMinutes(c)),
    lastObservedAt: opts.now,
    knowledge: serializeKnowledge(emptyKnowledge()),
    heardLines: [],
    hintsUsed: [],
    evidenceMarks: {},
    associations: [],
    board: emptyBoard(),
    timeline: [],
    deductions: [],
    log: [],
    rev: 0,
    updatedAt: opts.now,
    ...opts.workspace,
  };
  return commit(c, base, k, opts.now, {}, { type: opts.attempt && opts.attempt > 1 ? 'reopen' : 'open' });
}

// ─── Consultas ───────────────────────────────────────────────────────────────

const byId = <T extends { id: string }>(list: readonly T[], id: string): T | undefined => list.find((x) => x.id === id);

export function visibleCharacters(c: CaseFile, k: Knowledge): Character[] {
  return c.characters.filter((ch) => evaluateCondition(ch.appearsWhen, k));
}

export function discoveredEvidence(c: CaseFile, k: Knowledge): Evidence[] {
  return c.evidence.filter((e) => k.evidence.has(e.id));
}

export function isVisible(cond: Condition | undefined, k: Knowledge): boolean {
  return evaluateCondition(cond, k);
}

/** Detalles de una evidencia que el jugador puede advertir ahora mismo. */
export function findableDetails(e: Evidence, k: Knowledge): HiddenDetail[] {
  return e.details.filter((d) => !k.details.has(d.id) && evaluateCondition(d.requires, k));
}

export function availableInterrogations(c: CaseFile, k: Knowledge): Interrogation[] {
  return c.interrogations.filter((it) => {
    const ch = byId(c.characters, it.characterId);
    return evaluateCondition(it.availableWhen, k) && evaluateCondition(ch?.appearsWhen, k);
  });
}

export function availableTopics(it: Interrogation, k: Knowledge): Topic[] {
  return it.topics.filter((t) => evaluateCondition(t.availableWhen, k));
}

export interface QuestionView {
  question: Question;
  asked: boolean;
  /** Puede formularse ahora (no preguntada o repetible). */
  askable: boolean;
}

export function questionsFor(topic: Topic, k: Knowledge): QuestionView[] {
  const out: QuestionView[] = [];
  for (const q of topic.questions) {
    if (!evaluateCondition(q.requires, k)) continue;
    if (q.presentEvidence && !k.evidence.has(q.presentEvidence)) continue;
    if (q.contradiction && !k.contradictions.has(q.contradiction)) continue;
    const asked = k.asked.has(q.id);
    out.push({ question: q, asked, askable: !asked || q.repeatable });
  }
  return out;
}

export function motivesAvailable(c: CaseFile, k: Knowledge): TheoryOption[] {
  return c.accusation.motives.filter((m) => evaluateCondition(m.availableWhen, k));
}

export function methodsAvailable(c: CaseFile, k: Knowledge): TheoryOption[] {
  return c.accusation.methods.filter((m) => evaluateCondition(m.availableWhen, k));
}

export function accusableSuspects(c: CaseFile, k: Knowledge): Character[] {
  const ids = c.accusation.suspects ?? c.characters.filter((ch) => ch.role === 'suspect').map((ch) => ch.id);
  return visibleCharacters(c, k).filter((ch) => ids.includes(ch.id));
}

export function unlockedTimeline(c: CaseFile, k: Knowledge): TimelineEvent[] {
  return c.timeline.filter((t) => k.timelineEvents.has(t.id));
}

/** Todas las líneas de diálogo y citas, indexadas por id. */
export function lineIndex(c: CaseFile): Map<string, { line: Line | { text: string; speaker?: string }; characterId?: string; evidenceId?: string }> {
  const map = new Map<string, { line: Line | { text: string; speaker?: string }; characterId?: string; evidenceId?: string }>();
  for (const it of c.interrogations) {
    for (const l of it.opening) if (l.id) map.set(l.id, { line: l, characterId: it.characterId });
    for (const t of it.topics) for (const q of t.questions) for (const r of q.responses) for (const l of r.lines) if (l.id) map.set(l.id, { line: l, characterId: it.characterId });
  }
  for (const e of c.evidence) for (const b of e.body) if (b.type === 'quote' && b.lineId) map.set(b.lineId, { line: { text: b.text, ...(b.speaker ? { speaker: b.speaker } : {}) }, evidenceId: e.id });
  return map;
}

/** ¿Conoce el jugador esta afirmación? Solo se pueden enfrentar afirmaciones conocidas. */
export function knowsStatement(ref: StatementRef, k: Knowledge, heardLines: readonly string[]): boolean {
  if ('evidence' in ref) return k.evidence.has(ref.evidence);
  if ('line' in ref) return heardLines.includes(ref.line);
  if ('fact' in ref) return k.facts.has(ref.fact);
  return k.details.has(ref.detail);
}

export function statementKey(ref: StatementRef): string {
  const [kind, id] = Object.entries(ref)[0] as [string, string];
  return `${kind}:${id}`;
}

// ─── Acciones ────────────────────────────────────────────────────────────────

/** Abre una evidencia por primera vez (o de nuevo, sin efecto). */
export function examine(c: CaseFile, inv: Investigation, evidenceId: string, now: number): Outcome<{ first: boolean }> {
  const k = knowledgeOf(inv);
  const e = byId(c.evidence, evidenceId);
  if (!e || !k.evidence.has(evidenceId) || k.examined.has(evidenceId)) return { inv, result: { first: false } };
  const next = cloneKnowledge(applyEffects(k, e.onExamine));
  next.examined.add(evidenceId);
  // Las citas de un documento se consideran leídas al examinarlo.
  const quotes = e.body.flatMap((b) => (b.type === 'quote' && b.lineId ? [b.lineId] : []));
  const heardLines = [...new Set([...inv.heardLines, ...quotes])];
  return { inv: commit(c, inv, next, now, { heardLines }, { type: 'examine', ref: evidenceId }), result: { first: true } };
}

/** El jugador señala un detalle (con la lupa o tocando la imagen). */
export function findDetail(c: CaseFile, inv: Investigation, evidenceId: string, detailId: string, now: number): Outcome<{ detail?: HiddenDetail }> {
  const k = knowledgeOf(inv);
  const e = byId(c.evidence, evidenceId);
  const d = e?.details.find((x) => x.id === detailId);
  if (!e || !d || !k.evidence.has(evidenceId) || k.details.has(detailId) || !evaluateCondition(d.requires, k)) return { inv, result: {} };
  const next = cloneKnowledge(applyEffects(k, d.effects));
  next.details.add(d.id);
  return { inv: commit(c, inv, next, now, {}, { type: 'detail', ref: d.id }), result: { detail: d } };
}

/** Busca un detalle con región que contenga el punto (coordenadas normalizadas 0..1). */
export function detailAtPoint(e: Evidence, k: Knowledge, x: number, y: number): HiddenDetail | undefined {
  return findableDetails(e, k).find((d) => d.region && x >= d.region.x && x <= d.region.x + d.region.w && y >= d.region.y && y <= d.region.y + d.region.h);
}

export interface AskResult {
  lines: Line[];
  question?: Question;
  /** Variante de respuesta usada (se guarda en el diario para reconstruir la transcripción). */
  variant?: number;
}

export function ask(c: CaseFile, inv: Investigation, questionId: string, now: number): Outcome<AskResult> {
  const k = knowledgeOf(inv);
  for (const it of availableInterrogations(c, k)) {
    for (const t of availableTopics(it, k)) {
      const view = questionsFor(t, k).find((v) => v.question.id === questionId);
      if (!view) continue;
      if (!view.askable) return { inv, result: { lines: [], question: view.question } };
      const q = view.question;
      let index = q.responses.findIndex((r) => evaluateCondition(r.when, k));
      if (index < 0) index = q.responses.length - 1;
      const variant = q.responses[index]!;
      const next = cloneKnowledge(applyEffects(k, variant.effects));
      next.asked.add(q.id);
      const heard = variant.lines.flatMap((l) => (l.id ? [l.id] : []));
      const heardLines = [...new Set([...inv.heardLines, ...heard])];
      return { inv: commit(c, inv, next, now, { heardLines }, { type: 'ask', ref: `${q.id}#${index}` }), result: { lines: variant.lines, question: q, variant: index } };
    }
  }
  return { inv, result: { lines: [] } };
}

/** Relacionar piezas: si forman una deducción del caso, se establece. */
export function compare(c: CaseFile, inv: Investigation, pieces: string[], now: number): Outcome<{ deduction?: Deduction; already?: boolean }> {
  const k = knowledgeOf(inv);
  const set = new Set(pieces);
  const known = (p: string) => k.evidence.has(p) || k.details.has(p) || k.facts.has(p);
  if (pieces.length < 2 || !pieces.every(known)) return { inv, result: {} };
  // Basta con que las piezas elegidas contengan todas las de la deducción (y no sobren más de una).
  const d = c.deductions.find((x) => x.combine.every((p) => set.has(p)) && set.size <= x.combine.length + 1);
  if (!d) return { inv: commit(c, inv, k, now, {}, { type: 'compare-miss' }), result: {} };
  if (inv.deductions.includes(d.id)) return { inv, result: { deduction: d, already: true } };
  const next = applyEffects(k, d.effects);
  return { inv: commit(c, inv, next, now, { deductions: [...inv.deductions, d.id] }, { type: 'deduction', ref: d.id }), result: { deduction: d } };
}

/** Señalar dos afirmaciones como contradictorias. */
export function pointContradiction(c: CaseFile, inv: Investigation, a: StatementRef, b: StatementRef, now: number): Outcome<{ contradiction?: Contradiction; already?: boolean }> {
  const k = knowledgeOf(inv);
  if (!knowsStatement(a, k, inv.heardLines) || !knowsStatement(b, k, inv.heardLines)) return { inv, result: {} };
  const ka = statementKey(a);
  const kb = statementKey(b);
  const x = c.contradictions.find((cx) => {
    const ca = statementKey(cx.a);
    const cb = statementKey(cx.b);
    return (ca === ka && cb === kb) || (ca === kb && cb === ka);
  });
  if (!x) return { inv: commit(c, inv, k, now, {}, { type: 'contradiction-miss' }), result: {} };
  if (k.contradictions.has(x.id)) return { inv, result: { contradiction: x, already: true } };
  const next = cloneKnowledge(applyEffects(k, x.effects));
  next.contradictions.add(x.id);
  return { inv: commit(c, inv, next, now, {}, { type: 'contradiction', ref: x.id }), result: { contradiction: x } };
}

// ─── Pistas ──────────────────────────────────────────────────────────────────

export interface HintView {
  lineId: string;
  topic: string;
  level: 1 | 2 | 3;
  text: string;
}

export function hintsUsedCount(inv: Investigation): number {
  return inv.hintsUsed.length;
}

/** Pistas ya reveladas, en orden. */
export function revealedHints(c: CaseFile, inv: Investigation): HintView[] {
  return inv.hintsUsed.flatMap((key) => {
    const [lineId, lvl] = key.split(':');
    const line = c.hints.find((h) => h.id === lineId);
    const level = Number(lvl) as 1 | 2 | 3;
    return line ? [{ lineId: line.id, topic: line.topic, level, text: line.steps[level - 1]! }] : [];
  });
}

function levelUsed(inv: Investigation, lineId: string): number {
  return inv.hintsUsed.filter((k) => k.startsWith(`${lineId}:`)).length;
}

/** Siguiente pista disponible: la primera línea pertinente que aún tenga niveles. */
export function nextHintLine(c: CaseFile, inv: Investigation): { lineId: string; level: 1 | 2 | 3 } | undefined {
  if (inv.hintsUsed.length >= c.maxHints) return undefined;
  const k = knowledgeOf(inv);
  for (const h of c.hints) {
    const used = levelUsed(inv, h.id);
    if (used < 3 && evaluateCondition(h.relevantWhen, k)) return { lineId: h.id, level: (used + 1) as 1 | 2 | 3 };
  }
  return undefined;
}

export function useHint(c: CaseFile, inv: Investigation, now: number): Outcome<{ hint?: HintView }> {
  const next = nextHintLine(c, inv);
  if (!next) return { inv, result: {} };
  const line = c.hints.find((h) => h.id === next.lineId)!;
  const key = `${next.lineId}:${next.level}`;
  return {
    inv: { ...inv, hintsUsed: [...inv.hintsUsed, key], log: [...inv.log, { at: now, type: 'hint', ref: key }], rev: inv.rev + 1, updatedAt: now },
    result: { hint: { lineId: line.id, topic: line.topic, level: next.level, text: line.steps[next.level - 1]! } },
  };
}

// ─── Mutaciones del espacio de trabajo (sin efecto en el conocimiento) ───────

export function patchWorkspace(inv: Investigation, patch: Partial<Pick<Investigation, 'board' | 'timeline' | 'evidenceMarks' | 'associations'>>, now: number): Investigation {
  return { ...inv, ...patch, rev: inv.rev + 1, updatedAt: now, lastObservedAt: Math.max(inv.lastObservedAt, now) };
}

/** Transcripción de un interrogatorio a partir del diario de actividad. */
export function transcriptOf(it: Interrogation, inv: Investigation): Array<{ question: Question; lines: Line[]; at: number }> {
  const questions = new Map(it.topics.flatMap((t) => t.questions.map((q) => [q.id, q] as const)));
  const out: Array<{ question: Question; lines: Line[]; at: number }> = [];
  for (const entry of inv.log) {
    if (entry.type !== 'ask' || !entry.ref) continue;
    const [qid, idx] = entry.ref.split('#');
    const q = questions.get(qid!);
    const r = q?.responses[Number(idx ?? 0)];
    if (q && r) out.push({ question: q, lines: r.lines, at: entry.at });
  }
  return out;
}

/** Diferencias de conocimiento entre dos estados (para avisar de descubrimientos). */
export function knowledgeDiff(before: Knowledge, after: Knowledge): Record<keyof Knowledge, string[]> {
  const out = {} as Record<keyof Knowledge, string[]>;
  for (const key of Object.keys(after) as Array<keyof Knowledge>) out[key] = [...after[key]].filter((x) => !before[key].has(x));
  return out;
}
