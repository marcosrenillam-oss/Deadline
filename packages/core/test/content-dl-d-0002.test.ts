import { describe, expect, it } from 'vitest';
import { caseFileSchema } from '../src/case/schema.ts';
import { ask, compare, examine, findDetail, knowledgeOf, pointContradiction, startInvestigation } from '../src/engine/engine.ts';
import { accuse } from '../src/engine/resolution.ts';
import raw from '../../../content/cases/DL-D-0002/case.ts';

const c = caseFileSchema.parse(raw);
const T = 1_800_000_000_000;

describe('DL-D-0002 «Una nota falsa»: partida completa', () => {
  it('se resuelve con confesión siguiendo las pistas del expediente', () => {
    let inv = startInvestigation(c, { id: 'inv-dld00002', now: T });
    let t = T;
    const step = <R,>(r: { inv: typeof inv; result: R }) => ((inv = r.inv), r.result);
    // Escena: la copia, su barniz y la marca del taller
    step(examine(c, inv, 'ev-denuncia', ++t));
    step(findDetail(c, inv, 'ev-denuncia', 'dt-estuche', ++t));
    step(examine(c, inv, 'ev-copia', ++t));
    step(findDetail(c, inv, 'ev-copia', 'dt-barniz', ++t));
    step(findDetail(c, inv, 'ev-copia', 'dt-marca', ++t));
    // El violinista y el lacayo: el cambio fue en el descanso
    step(ask(c, inv, 'q-kranz-noche', ++t));
    step(ask(c, inv, 'q-kranz-solto', ++t));
    step(examine(c, inv, 'ev-kranz', ++t));
    step(findDetail(c, inv, 'ev-kranz', 'dt-apagado', ++t));
    step(examine(c, inv, 'ev-johann', ++t));
    step(findDetail(c, inv, 'ev-johann', 'dt-piano', ++t));
    step(findDetail(c, inv, 'ev-johann', 'dt-chal', ++t));
    expect(step(compare(c, inv, ['dt-apagado', 'dt-piano'], ++t)).deduction?.id).toBe('de-descanso');
    // Lotte miente sobre el descanso
    step(ask(c, inv, 'q-lotte-descanso', ++t));
    expect(step(pointContradiction(c, inv, { line: 'ln-lotte-cocina' }, { detail: 'dt-chal' }, ++t)).contradiction?.id).toBe('cx-lotte');
    // Weiss y su libro de encargos
    step(ask(c, inv, 'q-weiss-copia', ++t));
    step(pointContradiction(c, inv, { line: 'ln-weiss-quien' }, { detail: 'dt-marca' }, ++t));
    expect(knowledgeOf(inv).evidence.has('ev-libro-encargos')).toBe(true);
    step(examine(c, inv, 'ev-libro-encargos', ++t));
    step(findDetail(c, inv, 'ev-libro-encargos', 'dt-firma', ++t));
    // Portero → paquete → resguardo; secante
    expect(knowledgeOf(inv).evidence.has('ev-portero')).toBe(true);
    step(examine(c, inv, 'ev-portero', ++t));
    step(findDetail(c, inv, 'ev-portero', 'dt-paquete', ++t));
    step(ask(c, inv, 'q-lotte-paquete', ++t));
    step(examine(c, inv, 'ev-resguardo', ++t));
    step(findDetail(c, inv, 'ev-resguardo', 'dt-medidas', ++t));
    expect(step(compare(c, inv, ['dt-estuche', 'dt-medidas'], ++t)).deduction?.id).toBe('de-paquete');
    expect(knowledgeOf(inv).evidence.has('ev-secante')).toBe(true);
    step(examine(c, inv, 'ev-secante', ++t));
    step(findDetail(c, inv, 'ev-secante', 'dt-berg', ++t));
    step(ask(c, inv, 'q-lotte-final', ++t));
    expect(knowledgeOf(inv).flags.has('lotte-confiesa')).toBe(true);

    const record = { caseId: c.id, mode: c.mode, firstOpenedAt: T, attempts: [inv.id], status: 'in-progress' as const, bestScore: 0, rewardedKeys: [] };
    const out = accuse(c, inv, record, { culprits: ['ch-lotte'], motive: 'mo-venta', method: 'me-cambio', proof: 'ev-secante' }, ++t);
    expect(out.result.outcome).toBe('success');
    expect(out.ending?.id).toBe('en-confesion');
  });
});
