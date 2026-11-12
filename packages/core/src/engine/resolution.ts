import { evaluateCondition } from '../case/conditions.ts';
import type { CaseFile, Ending } from '../case/schema.ts';
import type { Accusation, CaseRecord, Investigation } from '../investigation/state.ts';
import { ACCUSATION_POINTS, HINT_PENALTY_PCT, rewardKey } from '../progression/rules.ts';
import { knowledgeOf } from './engine.ts';

/**
 * ACUSACIÓN, PUNTUACIÓN E INFORME.
 *
 * La acusación se evalúa por criterios (culpables, motivo, método, prueba),
 * nunca comparando textos. Las recompensas por descubrimientos solo se
 * cobran la primera vez para este expediente (registro `rewardedKeys`).
 */

export type InvestigationResult = NonNullable<Investigation['result']>;

export interface Components {
  culprit: boolean;
  motive: boolean;
  method: boolean;
  proof: boolean;
}

export function judge(c: CaseFile, a: Pick<Accusation, 'culprits' | 'motive' | 'method' | 'proof'>): Components {
  const want = new Set(c.solution.culprits);
  const got = new Set(a.culprits);
  return {
    culprit: want.size === got.size && [...want].every((x) => got.has(x)),
    motive: a.motive === c.solution.motive,
    method: a.method === c.solution.method,
    proof: c.solution.proof.includes(a.proof),
  };
}

export function pickEnding(c: CaseFile, a: Pick<Accusation, 'culprits'>, comp: Components, inv: Investigation): Ending {
  const k = knowledgeOf(inv);
  const fits = (want: string | undefined, ok: boolean) => want === undefined || (want === 'correct' ? ok : want === 'incorrect' ? !ok : false);
  for (const e of c.endings) {
    const w = e.when;
    if (w.culprit && w.culprit !== 'correct' && w.culprit !== 'incorrect') {
      if (!a.culprits.includes(w.culprit)) continue;
    } else if (!fits(w.culprit, comp.culprit)) continue;
    if (!fits(w.motive, comp.motive) || !fits(w.method, comp.method) || !fits(w.proof, comp.proof)) continue;
    if (!evaluateCondition(w.knowledge, k)) continue;
    return e;
  }
  return c.endings[c.endings.length - 1]!;
}

/**
 * Cronología del jugador frente a la verdadera: cobertura de eventos clave y
 * orden relativo correcto (pares bien ordenados). Los eventos falsos que el
 * jugador haya dado por buenos se informan aparte.
 */
export function timelineAccuracy(c: CaseFile, inv: Investigation): { accuracy: number; falsePlaced: string[] } {
  const byId = new Map(c.timeline.map((t) => [t.id, t]));
  const placed = inv.timeline.flatMap((e) => (e.eventId ? [e.eventId] : []));
  const falsePlaced = placed.filter((id) => byId.get(id)?.veracity === 'false' && !inv.timeline.find((e) => e.eventId === id)?.flagged);
  const keyTrue = c.timeline.filter((t) => t.key && t.veracity === 'true');
  const placedKey = placed.filter((id) => keyTrue.some((t) => t.id === id));
  const coverage = keyTrue.length ? placedKey.length / keyTrue.length : 0;
  let pairs = 0;
  let good = 0;
  for (let i = 0; i < placedKey.length; i++) {
    for (let j = i + 1; j < placedKey.length; j++) {
      const a = byId.get(placedKey[i]!)!;
      const b = byId.get(placedKey[j]!)!;
      if (a.t === b.t) continue;
      pairs++;
      if (a.t < b.t) good++;
    }
  }
  const order = pairs ? good / pairs : placedKey.length > 0 ? 1 : 0;
  const penalty = Math.min(0.5, falsePlaced.length * 0.1);
  return { accuracy: Math.max(0, coverage * order - penalty), falsePlaced };
}

/** Recompensas por descubrimientos aún no cobradas. */
function discoveryRewards(c: CaseFile, inv: Investigation, rewarded: ReadonlySet<string>): Array<{ key: string; label: string; points: number }> {
  const k = knowledgeOf(inv);
  const out: Array<{ key: string; label: string; points: number }> = [];
  const add = (key: string, label: string, points: number) => {
    if (points > 0 && !rewarded.has(key)) out.push({ key, label, points });
  };
  for (const e of c.evidence) if (k.evidence.has(e.id)) add(rewardKey('evidence', e.id), `Evidencia: ${e.title}`, e.points);
  for (const e of c.evidence) for (const d of e.details) if (k.details.has(d.id)) add(rewardKey('detail', d.id), `Detalle: ${d.label}`, d.points);
  for (const s of c.secrets) if (k.secrets.has(s.id)) add(rewardKey('secret', s.id), 'Secreto descubierto', s.points);
  for (const x of c.contradictions) if (k.contradictions.has(x.id)) add(rewardKey('contradiction', x.id), `Contradicción: ${x.title}`, x.points);
  for (const d of c.deductions) if (inv.deductions.includes(d.id)) add(rewardKey('deduction', d.id), `Deducción: ${d.title}`, d.points);
  for (const o of c.objectives) if (evaluateCondition(o.completeWhen, k)) add(rewardKey('objective', o.id), `Objetivo: ${o.text}`, o.points);
  return out;
}

export interface Settlement {
  inv: Investigation;
  record: CaseRecord;
  result: InvestigationResult;
  ending?: Ending;
}

export function accuse(c: CaseFile, inv: Investigation, record: CaseRecord, a: Omit<Accusation, 'submittedAt'>, now: number): Settlement {
  const accusation: Accusation = { ...a, submittedAt: now };
  const comp = judge(c, accusation);
  const ending = pickEnding(c, accusation, comp, inv);
  const outcome = ending.outcome;
  const rewarded = new Set(record.rewardedKeys);
  const pts = { ...ACCUSATION_POINTS[c.difficulty], ...stripUndefined(c.scoring ?? {}) };
  const lines: Array<{ label: string; points: number }> = [];
  const newKeys: string[] = [];
  const firstSolve = !rewarded.has(rewardKey('solve'));

  // La acusación solo puntúa la primera vez que se resuelve el expediente.
  let accusationSubtotal = 0;
  if (firstSolve && comp.culprit) {
    lines.push({ label: 'Culpable identificado', points: pts.culprit });
    accusationSubtotal += pts.culprit;
    if (comp.motive) (lines.push({ label: 'Motivo', points: pts.motive }), (accusationSubtotal += pts.motive));
    if (comp.method) (lines.push({ label: 'Método', points: pts.method }), (accusationSubtotal += pts.method));
    if (comp.proof) (lines.push({ label: 'Prueba definitiva', points: pts.proof }), (accusationSubtotal += pts.proof));
    if (outcome === 'success') (lines.push({ label: 'Acusación completa', points: pts.solveBonus }), (accusationSubtotal += pts.solveBonus));
    const penaltyPct = inv.hintsUsed.reduce((sum, key) => sum + (HINT_PENALTY_PCT[Number(key.split(':')[1]) as 1 | 2 | 3] ?? 0), 0);
    if (penaltyPct > 0) {
      const p = -Math.round((accusationSubtotal * Math.min(60, penaltyPct)) / 100);
      lines.push({ label: `Pistas utilizadas (${inv.hintsUsed.length})`, points: p });
      accusationSubtotal += p;
    }
    newKeys.push(rewardKey('solve'));
  }

  const timeline = timelineAccuracy(c, inv);
  if (firstSolve && comp.culprit && timeline.accuracy > 0) {
    const p = Math.round(timeline.accuracy * 100);
    lines.push({ label: `Cronología (${Math.round(timeline.accuracy * 100)} %)`, points: p });
  }

  for (const r of discoveryRewards(c, inv, rewarded)) {
    lines.push({ label: r.label, points: r.points });
    newKeys.push(r.key);
  }

  const total = Math.max(0, lines.reduce((s, l) => s + l.points, 0));
  const result: InvestigationResult = {
    outcome,
    endingId: ending.id,
    components: comp,
    score: lines,
    total,
    timelineAccuracy: timeline.accuracy,
    falseEventsPlaced: timeline.falsePlaced,
    newRewardKeys: newKeys,
    elapsedMs: Math.max(0, Math.min(now, inv.deadlineAt) - inv.startedAt),
  };
  const solved = outcome !== 'failure';
  const nextInv: Investigation = {
    ...inv,
    status: solved ? 'solved' : 'failed',
    accusation,
    result,
    closedAt: now,
    log: [...inv.log, { at: now, type: 'accuse', ref: outcome }],
    rev: inv.rev + 1,
    updatedAt: now,
  };
  const nextRecord: CaseRecord = {
    ...record,
    status: solved ? 'solved' : 'closed',
    bestScore: Math.max(record.bestScore, total),
    rewardedKeys: [...new Set([...record.rewardedKeys, ...newKeys])].sort(),
    carriedKnowledge: nextInv.knowledge,
    ...(solved && record.solvedAt === undefined ? { solvedAt: now } : {}),
  };
  delete nextRecord.activeInvestigationId;
  return { inv: nextInv, record: nextRecord, result, ending };
}

/**
 * Cierre por tiempo agotado: sin acusación ni puntos de acusación, pero los
 * descubrimientos hechos sí se cobran (una sola vez, como siempre).
 */
export function expire(c: CaseFile, inv: Investigation, record: CaseRecord, now: number): Settlement {
  const timeline = timelineAccuracy(c, inv);
  const rewards = discoveryRewards(c, inv, new Set(record.rewardedKeys));
  const result: InvestigationResult = {
    outcome: 'expired',
    components: { culprit: false, motive: false, method: false, proof: false },
    score: rewards.map((r) => ({ label: r.label, points: r.points })),
    total: rewards.reduce((sum, r) => sum + r.points, 0),
    timelineAccuracy: timeline.accuracy,
    falseEventsPlaced: timeline.falsePlaced,
    newRewardKeys: rewards.map((r) => r.key),
    elapsedMs: inv.deadlineAt - inv.startedAt,
  };
  const nextInv: Investigation = { ...inv, status: 'expired', result, closedAt: inv.deadlineAt, log: [...inv.log, { at: now, type: 'expire' }], rev: inv.rev + 1, updatedAt: now };
  const nextRecord: CaseRecord = {
    ...record,
    status: record.status === 'solved' ? 'solved' : 'closed',
    bestScore: Math.max(record.bestScore, result.total),
    rewardedKeys: [...new Set([...record.rewardedKeys, ...result.newRewardKeys])].sort(),
    carriedKnowledge: nextInv.knowledge,
  };
  delete nextRecord.activeInvestigationId;
  return { inv: nextInv, record: nextRecord, result };
}

function stripUndefined<T extends object>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>;
}
