import { describe, expect, it } from 'vitest';
import { caseFileSchema } from '../src/case/schema.ts';
import { ask, compare, examine, findDetail, knowledgeOf, pointContradiction, startInvestigation } from '../src/engine/engine.ts';
import { accuse } from '../src/engine/resolution.ts';
import raw from '../../../content/cases/DL-C-0002/case.ts';

const c = caseFileSchema.parse(raw);
const T = 1_800_000_000_000;

describe('DL-C-0002 «La carta de marear»: partida completa (expediente compartido)', () => {
  it('se resuelve con confesión', () => {
    let inv = startInvestigation(c, { id: 'inv-dlc00002', now: T });
    let t = T;
    const step = <R,>(r: { inv: typeof inv; result: R }) => ((inv = r.inv), r.result);
    const look = (ev: string, ...details: string[]) => {
      step(examine(c, inv, ev, ++t));
      for (const d of details) step(findDetail(c, inv, ev, d, ++t));
    };
    look('ev-carta1', 'dt-zeemeeuw', 'dt-g-carta', 'dt-filigrana');
    look('ev-carta2', 'dt-recibidos', 'dt-bermellon');
    look('ev-registro-papel', 'dt-papel-casa');
    look('ev-llaves', 'dt-llaves');
    expect(step(compare(c, inv, ['dt-filigrana', 'dt-papel-casa'], ++t)).deduction?.id).toBe('de-papel');
    // Pago: Leonor y el sacristán
    step(ask(c, inv, 'q-leonor-cartas', ++t));
    step(ask(c, inv, 'q-leonor-casa', ++t));
    look('ev-cuentas', 'dt-empeno', 'dt-empeno-texto');
    expect(step(compare(c, inv, ['dt-recibidos', 'dt-empeno-texto'], ++t)).deduction?.id).toBe('de-pago');
    expect(step(pointContradiction(c, inv, { line: 'ln-leonor-nada' }, { detail: 'dt-empeno-texto' }, ++t)).contradiction?.id).toBe('cx-leonor');
    look('ev-sacristan', 'dt-mozo-tinta');
    // Van Aken y el porte de las copias
    step(ask(c, inv, 'q-vanaken-zeemeeuw', ++t));
    look('ev-libro-vanaken', 'dt-mozo');
    // Tomás: su letra
    step(ask(c, inv, 'q-tomas-oficio', ++t));
    look('ev-muestra-letra', 'dt-g-topo');
    expect(step(compare(c, inv, ['dt-g-carta', 'dt-g-topo'], ++t)).deduction?.id).toBe('de-letra');
    step(ask(c, inv, 'q-tomas-flamenco', ++t));
    expect(step(pointContradiction(c, inv, { line: 'ln-tomas-flamenco' }, { detail: 'dt-mozo' }, ++t)).contradiction?.id).toBe('cx-tomas');
    // Zamudio y el libro de pasajeros
    step(ask(c, inv, 'q-zamudio-llaves', ++t));
    step(ask(c, inv, 'q-zamudio-tomas', ++t));
    look('ev-licencia', 'dt-licencia', 'dt-licencia-quien');
    expect(step(compare(c, inv, ['dt-mozo-tinta', 'dt-licencia-quien'], ++t)).deduction?.id).toBe('de-dinero');
    step(ask(c, inv, 'q-arriaga-tomas', ++t));
    step(ask(c, inv, 'q-tomas-final', ++t));
    expect(knowledgeOf(inv).flags.has('tomas-confiesa')).toBe(true);

    const record = { caseId: c.id, mode: c.mode, firstOpenedAt: T, attempts: [inv.id], status: 'in-progress' as const, bestScore: 0, rewardedKeys: [] };
    const out = accuse(c, inv, record, { culprits: ['ch-tomas'], motive: 'mo-pasaje', method: 'me-cartas', proof: 'ev-licencia' }, ++t);
    expect(out.result.outcome).toBe('success');
    expect(out.ending?.id).toBe('en-confesion');
  });
});
