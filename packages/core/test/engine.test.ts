import { describe, expect, it } from 'vitest';
import { caseFileSchema } from '../src/case/schema.ts';
import { parseInline, plainText } from '../src/case/schema.ts';
import {
  accusableSuspects,
  ask,
  compare,
  detailAtPoint,
  examine,
  findDetail,
  knowledgeOf,
  methodsAvailable,
  motivesAvailable,
  nextHintLine,
  pointContradiction,
  startInvestigation,
  useHint,
} from '../src/engine/engine.ts';
import { accuse, expire, timelineAccuracy } from '../src/engine/resolution.ts';
import type { CaseRecord } from '../src/investigation/state.ts';
import { minimalCase } from './fixtures/minimal-case.ts';

const c = caseFileSchema.parse(minimalCase());
const T0 = 1_800_000_000_000;
const record = (): CaseRecord => ({ caseId: c.id, mode: c.mode, firstOpenedAt: T0, attempts: ['inv-00000001'], status: 'in-progress', bestScore: 0, rewardedKeys: [] });

function solveAll() {
  let inv = startInvestigation(c, { id: 'inv-00000001', now: T0 });
  inv = examine(c, inv, 'ev-maceta', T0 + 1).inv;
  inv = findDetail(c, inv, 'ev-maceta', 'dt-huella', T0 + 2).inv;
  inv = examine(c, inv, 'ev-botas', T0 + 3).inv;
  inv = ask(c, inv, 'q-hale-noche', T0 + 4).inv;
  inv = pointContradiction(c, inv, { line: 'ln-hale-dormia' }, { fact: 'fa-barro' }, T0 + 5).inv;
  inv = ask(c, inv, 'q-hale-deudas', T0 + 6).inv;
  inv = examine(c, inv, 'ev-pagare', T0 + 7).inv;
  return inv;
}

describe('motor de investigación', () => {
  it('arranca con el conocimiento inicial y el límite de tiempo del modo', () => {
    const inv = startInvestigation(c, { id: 'inv-00000001', now: T0 });
    const k = knowledgeOf(inv);
    expect([...k.evidence].sort()).toEqual(['ev-informe', 'ev-maceta']);
    expect(k.facts.has('fa-dos-llaves')).toBe(true);
    expect(inv.deadlineAt - inv.startedAt).toBe(60 * 60_000);
    expect(inv.status).toBe('active');
  });

  it('recorre la cadena de descubrimientos sin orden obligatorio', () => {
    const inv = solveAll();
    const k = knowledgeOf(inv);
    expect(k.evidence.has('ev-botas')).toBe(true);
    expect(k.evidence.has('ev-pagare')).toBe(true); // aparece al preguntar por deudas
    expect(k.facts.has('fa-deuda')).toBe(true); // se deduce al examinar el pagaré
    expect(k.contradictions.has('cx-coartada')).toBe(true);
    expect(k.secrets.has('se-trato')).toBe(true); // se revela solo
    expect(k.timelineEvents.has('te-entrada')).toBe(true);
    expect(inv.heardLines).toContain('ln-hale-dormia');
    expect(inv.heardLines).toContain('ln-pagare');
  });

  it('las respuestas dependen de lo que sabe el jugador', () => {
    let early = startInvestigation(c, { id: 'inv-00000001', now: T0 });
    early = examine(c, early, 'ev-maceta', T0).inv;
    early = findDetail(c, early, 'ev-maceta', 'dt-huella', T0).inv;
    expect(ask(c, early, 'q-hale-botas', T0).result.lines[0]?.tone).toBe('evasion');
    const late = solveAll();
    const r = ask(c, late, 'q-hale-botas', T0 + 9);
    expect(r.result.lines[0]?.tone).toBe('admission');
    expect(knowledgeOf(r.inv).flags.has('hale-confiesa')).toBe(true);
  });

  it('no permite preguntas ocultas ni repetir preguntas', () => {
    const inv = startInvestigation(c, { id: 'inv-00000001', now: T0 });
    expect(ask(c, inv, 'q-hale-deudas', T0).result.lines).toEqual([]); // requiere haber preguntado antes
    const once = ask(c, inv, 'q-hale-noche', T0).inv;
    const twice = ask(c, once, 'q-hale-noche', T0 + 1);
    expect(twice.result.lines).toEqual([]);
    expect(twice.inv).toBe(once);
  });

  it('las contradicciones se aceptan en cualquier orden y solo si se conocen', () => {
    const fresh = startInvestigation(c, { id: 'inv-00000001', now: T0 });
    expect(pointContradiction(c, fresh, { fact: 'fa-barro' }, { line: 'ln-hale-dormia' }, T0).result.contradiction).toBeUndefined();
    let inv = solveAll();
    const again = pointContradiction(c, inv, { fact: 'fa-barro' }, { line: 'ln-hale-dormia' }, T0 + 10);
    expect(again.result.already).toBe(true);
    inv = pointContradiction(c, inv, { evidence: 'ev-informe' }, { fact: 'fa-barro' }, T0 + 11).inv;
    expect(inv.log.at(-1)?.type).toBe('contradiction-miss');
  });

  it('comparar piezas sin relación no deduce nada', () => {
    const inv = solveAll();
    expect(compare(c, inv, ['ev-informe', 'ev-botas'], T0).result.deduction).toBeUndefined();
  });

  it('pistas progresivas, limitadas y solo mientras son pertinentes', () => {
    let inv = startInvestigation(c, { id: 'inv-00000001', now: T0 });
    const levels: number[] = [];
    for (let i = 0; i < 4; i++) {
      const r = useHint(c, inv, T0 + i);
      if (r.result.hint) levels.push(r.result.hint.level);
      inv = r.inv;
    }
    expect(levels).toEqual([1, 2, 3]);
    expect(nextHintLine(c, inv)).toBeUndefined();
    expect(nextHintLine(c, solveAll())).toBeUndefined(); // ya no es pertinente
  });

  it('hipótesis de motivo y método aparecen al tener base', () => {
    const fresh = startInvestigation(c, { id: 'inv-00000001', now: T0 });
    expect(motivesAvailable(c, knowledgeOf(fresh)).map((m) => m.id)).toEqual(['mo-celos']);
    const inv = solveAll();
    expect(motivesAvailable(c, knowledgeOf(inv)).map((m) => m.id)).toEqual(['mo-deuda', 'mo-celos']);
    expect(methodsAvailable(c, knowledgeOf(inv)).map((m) => m.id)).toContain('me-llave');
    expect(accusableSuspects(c, knowledgeOf(inv)).map((s) => s.id)).toEqual(['ch-hale', 'ch-pryce']);
  });

  it('detalles por región de imagen', () => {
    const e = { ...c.evidence[1]!, details: [{ ...c.evidence[1]!.details[0]!, region: { x: 0.4, y: 0.4, w: 0.2, h: 0.2 } }] };
    const inv = startInvestigation(c, { id: 'inv-00000001', now: T0 });
    expect(detailAtPoint(e, knowledgeOf(inv), 0.5, 0.5)?.id).toBe('dt-huella');
    expect(detailAtPoint(e, knowledgeOf(inv), 0.1, 0.1)).toBeUndefined();
  });
});

describe('acusación y puntuación', () => {
  const full = { culprits: ['ch-hale'], motive: 'mo-deuda', method: 'me-llave', proof: 'ev-botas' };

  it('acusación completa: final de éxito, puntos y recompensas registradas', () => {
    const s = accuse(c, solveAll(), record(), full, T0 + 20 * 60_000);
    expect(s.result.outcome).toBe('success');
    expect(s.ending?.id).toBe('en-exito');
    expect(s.inv.status).toBe('solved');
    expect(s.record.status).toBe('solved');
    expect(s.result.total).toBeGreaterThan(700);
    expect(s.result.newRewardKeys).toEqual(expect.arrayContaining(['solve', 'secret:se-trato', 'contradiction:cx-coartada', 'objective:ob-trato']));
    expect(s.result.elapsedMs).toBe(20 * 60_000);
  });

  it('acusar a otro: final negativo y expediente cerrado', () => {
    const s = accuse(c, solveAll(), record(), { ...full, culprits: ['ch-pryce'] }, T0 + 1);
    expect(s.result.outcome).toBe('failure');
    expect(s.inv.status).toBe('failed');
    expect(s.record.status).toBe('closed');
    expect(s.result.score.some((l) => l.label === 'Culpable identificado')).toBe(false);
  });

  it('culpable correcto con motivo erróneo: final parcial', () => {
    const s = accuse(c, solveAll(), record(), { ...full, motive: 'mo-celos' }, T0 + 1);
    expect(s.result.outcome).toBe('partial');
    expect(s.result.components).toEqual({ culprit: true, motive: false, method: true, proof: true });
  });

  it('no se cobran dos veces las recompensas al repetir', () => {
    const first = accuse(c, solveAll(), record(), full, T0 + 1);
    const again = accuse(c, solveAll(), first.record, full, T0 + 2);
    expect(again.result.total).toBe(0);
    expect(again.record.bestScore).toBe(first.result.total);
  });

  it('las pistas penalizan la acusación', () => {
    let inv = startInvestigation(c, { id: 'inv-00000001', now: T0 });
    inv = useHint(c, inv, T0).inv;
    inv = { ...solveAll(), hintsUsed: inv.hintsUsed };
    const withHint = accuse(c, inv, record(), full, T0 + 1).result;
    const without = accuse(c, solveAll(), record(), full, T0 + 1).result;
    expect(withHint.total).toBeLessThan(without.total);
  });

  it('la cronología puntúa cobertura y orden, y señala eventos falsos', () => {
    const inv = solveAll();
    const good = { ...inv, timeline: [{ id: 'tl-000001', eventId: 'te-cierre', evidence: [], characters: [], flagged: false }, { id: 'tl-000002', eventId: 'te-entrada', evidence: [], characters: [], flagged: false }] };
    expect(timelineAccuracy(c, good).accuracy).toBe(1);
    const bad = { ...inv, timeline: [{ id: 'tl-000002', eventId: 'te-entrada', evidence: [], characters: [], flagged: false }, { id: 'tl-000001', eventId: 'te-cierre', evidence: [], characters: [], flagged: false }, { id: 'tl-000003', eventId: 'te-dormia', evidence: [], characters: [], flagged: false }] };
    const r = timelineAccuracy(c, bad);
    expect(r.accuracy).toBe(0);
    expect(r.falsePlaced).toEqual(['te-dormia']);
  });

  it('tiempo agotado: cerrado sin puntos de acusación', () => {
    const s = expire(c, solveAll(), record(), T0 + 2 * 3_600_000);
    expect(s.inv.status).toBe('expired');
    expect(s.result.score.some((l) => l.label === 'Culpable identificado')).toBe(false);
    expect(s.record.rewardedKeys).not.toContain('solve');
    expect(s.record.carriedKnowledge).toBeDefined();
  });
});

describe('detalles en el texto', () => {
  it('separa y limpia marcas de detalle', () => {
    expect(parseInline('La puerta {{dt-x|no estaba forzada}}, dijo.')).toEqual([{ text: 'La puerta ' }, { text: 'no estaba forzada', detail: 'dt-x' }, { text: ', dijo.' }]);
    expect(plainText('A {{dt-x|b}} c')).toBe('A b c');
  });
});

describe('cierre por tiempo y reapertura', () => {
  it('al agotarse el tiempo se cobran los descubrimientos, una sola vez', async () => {
    const { expire: exp } = await import('../src/engine/resolution.ts');
    const s = exp(c, solveAll(), record(), T0 + 2 * 3_600_000);
    expect(s.result.total).toBeGreaterThan(0);
    expect(s.result.score.some((l) => l.label.startsWith('Contradicción'))).toBe(true);
    const again = exp(c, solveAll(), s.record, T0 + 3 * 3_600_000);
    expect(again.result.total).toBe(0);
  });

  it('reabrir conserva descubrimientos y trabajo, pero no las conversaciones', async () => {
    const { carryOverKnowledge, carryOverWorkspace, reopenCost } = await import('../src/engine/reopen.ts');
    const prev = { ...solveAll(), board: { nodes: [], edges: [], viewport: { x: 5, y: 5, zoom: 1 } } };
    const next = startInvestigation(c, { id: 'inv-00000002', now: T0 + 5, attempt: 2, carried: carryOverKnowledge(prev.knowledge), workspace: carryOverWorkspace(prev) });
    const k = knowledgeOf(next);
    expect(k.evidence.has('ev-botas')).toBe(true);
    expect(k.facts.has('fa-barro')).toBe(true);
    expect(k.asked.size).toBe(0);
    expect(k.contradictions.size).toBe(0);
    expect(next.board.viewport.x).toBe(5);
    expect(next.attempt).toBe(2);
    expect(next.log[0]?.type).toBe('reopen');
    expect(next.deadlineAt - next.startedAt).toBe(60 * 60_000);
    expect(reopenCost(c)).toBe(150);
  });
});
