import { z } from 'zod';
import { cloneKnowledge, type Knowledge } from '../case/conditions.ts';
import type { CaseFile } from '../case/schema.ts';
import type { BoardNode, Investigation } from '../investigation/state.ts';
import { commitShared, knowledgeOf, type Outcome } from './engine.ts';
import { newId } from '../util/id.ts';

/**
 * COOPERATIVO SIN SERVIDOR: PUESTA EN COMÚN.
 *
 * Cada investigador tiene su propia investigación. Compartir es explícito:
 * el jugador elige qué pone sobre la mesa (documentos, hechos, detalles,
 * declaraciones, fichas…) y su compañero lo incorpora. Funciona igual entre
 * dos dispositivos (por códigos) que en uno solo (mesa compartida).
 */

const ids = z.array(z.string()).default([]);

export const sharePayloadSchema = z.strictObject({
  evidence: ids,
  facts: ids,
  details: ids,
  lines: ids,
  timeline: ids,
  deductions: ids,
  contradictions: ids,
  secrets: ids,
  flags: ids,
});
export type SharePayload = z.infer<typeof sharePayloadSchema>;
export type ShareKey = keyof SharePayload;
export const SHARE_KEYS: ShareKey[] = ['evidence', 'facts', 'details', 'lines', 'timeline', 'deductions', 'contradictions', 'secrets', 'flags'];

export function emptyShare(): SharePayload {
  return { evidence: [], facts: [], details: [], lines: [], timeline: [], deductions: [], contradictions: [], secrets: [], flags: [] };
}

/** Todo lo que sabe un investigador, en forma de lo que se puede compartir. */
export function knowledgeShare(inv: Investigation): SharePayload {
  const k = knowledgeOf(inv);
  return {
    evidence: [...k.evidence],
    facts: [...k.facts],
    details: [...k.details],
    lines: [...inv.heardLines],
    timeline: [...k.timelineEvents],
    deductions: [...inv.deductions],
    contradictions: [...k.contradictions],
    secrets: [...k.secrets],
    flags: [...k.flags],
  };
}

/** Lo que este investigador sabe y aún no ha compartido (ni recibido del compañero). */
export function unshared(inv: Investigation, known: SharePayload): SharePayload {
  const cur = knowledgeShare(inv);
  const out = emptyShare();
  for (const key of SHARE_KEYS) {
    const seen = new Set(known[key]);
    out[key] = cur[key].filter((x) => !seen.has(x)).sort();
  }
  return out;
}

export function shareSize(p: SharePayload): number {
  return SHARE_KEYS.reduce((n, k) => n + p[k].length, 0);
}

export function unionShare(a: SharePayload, b: SharePayload): SharePayload {
  const out = emptyShare();
  for (const key of SHARE_KEYS) out[key] = [...new Set([...a[key], ...b[key]])].sort();
  return out;
}

/** Incorpora lo que comparte el compañero. Idempotente: recibirlo dos veces no cambia nada. */
export function mergeShared(c: CaseFile, inv: Investigation, p: SharePayload, now: number, from: string): Outcome<{ added: SharePayload }> {
  const k = knowledgeOf(inv);
  const valid = {
    evidence: new Set(c.evidence.map((e) => e.id)),
    facts: new Set(c.facts.map((f) => f.id)),
    details: new Set(c.evidence.flatMap((e) => e.details.map((d) => d.id))),
    timeline: new Set(c.timeline.map((t) => t.id)),
    deductions: new Set(c.deductions.map((d) => d.id)),
    contradictions: new Set(c.contradictions.map((x) => x.id)),
    secrets: new Set(c.secrets.map((x) => x.id)),
  };
  const added = emptyShare();
  const next: Record<keyof Knowledge, Set<string>> = cloneKnowledge(k);
  const take = (key: ShareKey, target: Set<string>, ok: (id: string) => boolean) => {
    for (const id of p[key]) if (ok(id) && !target.has(id)) (target.add(id), added[key].push(id));
  };
  take('evidence', next.evidence, (x) => valid.evidence.has(x));
  take('facts', next.facts, (x) => valid.facts.has(x));
  take('details', next.details, (x) => valid.details.has(x));
  take('timeline', next.timelineEvents, (x) => valid.timeline.has(x));
  take('contradictions', next.contradictions, (x) => valid.contradictions.has(x));
  take('secrets', next.secrets, (x) => valid.secrets.has(x));
  take('flags', next.flags, () => true);
  const heard = new Set(inv.heardLines);
  for (const l of p.lines) if (!heard.has(l)) (heard.add(l), added.lines.push(l));
  const deds = new Set(inv.deductions);
  for (const d of p.deductions) if (valid.deductions.has(d) && !deds.has(d)) (deds.add(d), added.deductions.push(d));
  if (shareSize(added) === 0) return { inv, result: { added } };
  return { inv: commitShared(c, inv, next, now, { heardLines: [...heard], deductions: [...deds] }, from), result: { added } };
}

// ─── Tablero compartido ──────────────────────────────────────────────────────

export const sharedBoardSchema = z.strictObject({
  nodes: z.array(z.strictObject({ ref: z.record(z.string(), z.string()), x: z.number(), y: z.number() })).max(200),
  edges: z.array(z.tuple([z.string(), z.string()])).max(400),
});
export type SharedBoard = z.infer<typeof sharedBoardSchema>;

const refKey = (ref: BoardNode['ref']) => JSON.stringify(ref);

export function exportBoard(inv: Investigation): SharedBoard {
  const byId = new Map(inv.board.nodes.map((n) => [n.id, n]));
  return {
    nodes: inv.board.nodes.map((n) => ({ ref: n.ref as unknown as Record<string, string>, x: n.x, y: n.y })),
    edges: inv.board.edges.flatMap((e) => {
      const a = byId.get(e.from);
      const b = byId.get(e.to);
      return a && b ? [[refKey(a.ref), refKey(b.ref)] as [string, string]] : [];
    }),
  };
}

/** Une el tablero del compañero con el propio: añade tarjetas e hilos que falten, sin mover los propios. */
export function mergeBoard(inv: Investigation, shared: SharedBoard): Investigation {
  const nodes = [...inv.board.nodes];
  const byRef = new Map(nodes.map((n) => [refKey(n.ref), n]));
  for (const sn of shared.nodes) {
    const key = JSON.stringify(sn.ref);
    if (byRef.has(key)) continue;
    const node: BoardNode = { id: newId(), ref: sn.ref as unknown as BoardNode['ref'], x: sn.x, y: sn.y, rotation: 0, pinColor: 'ivory' };
    nodes.push(node);
    byRef.set(key, node);
  }
  const edges = [...inv.board.edges];
  const has = (a: string, b: string) => edges.some((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a));
  for (const [ka, kb] of shared.edges) {
    const a = byRef.get(ka);
    const b = byRef.get(kb);
    if (a && b && !has(a.id, b.id)) edges.push({ id: newId(), from: a.id, to: b.id, style: 'dashed' });
  }
  return { ...inv, board: { ...inv.board, nodes, edges }, rev: inv.rev + 1 };
}
