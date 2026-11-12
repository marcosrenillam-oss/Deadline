import { describe, expect, it } from 'vitest';
import { validateCase, exploreReachable } from '../src/case/validate.ts';
import { minimalCase } from './fixtures/minimal-case.ts';

describe('validateCase', () => {
  it('acepta el expediente de prueba sin errores ni avisos', () => {
    const r = validateCase(minimalCase());
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it('rechaza esquemas mal formados', () => {
    const c = minimalCase() as Record<string, unknown>;
    c.id = 'CASO-1';
    const r = validateCase(c);
    expect(r.ok).toBe(false);
    expect(r.errors[0]?.path).toBe('id');
  });

  it('detecta identificadores duplicados entre colecciones', () => {
    const c = minimalCase();
    c.facts!.push({ id: 'ev-botas', text: 'duplicado' });
    const r = validateCase(c);
    expect(r.errors.some((e) => e.message.includes('duplicado'))).toBe(true);
  });

  it('detecta referencias rotas en condiciones y efectos', () => {
    const c = minimalCase();
    c.evidence[0]!.onExamine = [{ grantFact: 'fa-inexistente' }];
    c.accusation.motives[1]!.availableWhen = { detail: 'dt-nada' };
    const r = validateCase(c);
    expect(r.errors.map((e) => e.path)).toEqual(expect.arrayContaining(['evidence.0.onExamine.0', 'accusation.motives.1.availableWhen']));
  });

  it('detecta referencias del tipo equivocado', () => {
    const c = minimalCase();
    c.solution.proof = ['ch-hale'];
    const r = validateCase(c);
    expect(r.errors.some((e) => e.path === 'solution.proof.0' && e.message.includes('se esperaba evidence'))).toBe(true);
  });

  it('exige final de reserva, última respuesta incondicional y marcas activadas', () => {
    const c = minimalCase();
    c.endings.pop();
    const q = c.interrogations![0]!.topics[0]!.questions[2]!;
    q.responses.reverse();
    c.hints![0]!.relevantWhen = { flag: 'nunca-activada' };
    const r = validateCase(c);
    const msgs = r.errors.map((e) => e.message).join('\n');
    expect(msgs).toContain('reserva');
    expect(msgs).toContain('incondicional');
    expect(msgs).toContain('nunca-activada');
  });

  it('exige separar hechos documentados en casos de origen real', () => {
    const c = minimalCase();
    c.origin = 'real';
    expect(validateCase(c).errors.some((e) => e.path === 'historical')).toBe(true);
  });

  it('exige coherencia entre modo e identificador', () => {
    const c = minimalCase();
    c.mode = 'daily';
    const msgs = validateCase(c).errors.map((e) => e.message).join('\n');
    expect(msgs).toContain('no corresponde al modo');
    expect(msgs).toContain('dailyIndex');
  });

  it('en cooperativo dividido toda evidencia tiene receptor', () => {
    const c = minimalCase();
    c.id = 'DL-C-9001';
    c.mode = 'coop';
    c.coop = { style: 'split', roles: [{ id: 'A', title: 'Archivo', briefing: 'x' }, { id: 'B', title: 'Calle', briefing: 'y' }] };
    const r = validateCase(c);
    expect(r.errors.filter((e) => e.message.includes('receptor')).length).toBe(c.evidence.length);
  });

  it('detecta un caso irresoluble: la prueba definitiva no se puede obtener', () => {
    const c = minimalCase();
    c.evidence[1]!.details = [];
    const r = validateCase(c);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.path === 'solution.proof')).toBe(true);
    expect(r.errors.some((e) => e.path === 'solution.method')).toBe(true);
  });

  it('avisa de contenido inalcanzable', () => {
    const c = minimalCase();
    c.evidence.push({ id: 'ev-huerfana', kind: 'letter', title: 'Carta', summary: 'Nunca aparece', body: [{ type: 'paragraph', text: '...' }] });
    const r = validateCase(c);
    expect(r.ok).toBe(true);
    expect(r.warnings.some((w) => w.message.includes('ev-huerfana'))).toBe(true);
  });
});

describe('exploreReachable', () => {
  it('recorre la cadena completa: detalle → evidencia → hecho → contradicción → secreto', () => {
    const r = validateCase(minimalCase());
    const { knowledge, lines } = exploreReachable(r.data!);
    expect(knowledge.details.has('dt-huella')).toBe(true);
    expect(knowledge.evidence.has('ev-botas')).toBe(true);
    expect(knowledge.facts.has('fa-barro')).toBe(true);
    expect(knowledge.facts.has('fa-deuda')).toBe(true);
    expect(lines.has('ln-hale-dormia')).toBe(true);
    expect(knowledge.contradictions.has('cx-coartada')).toBe(true);
    expect(knowledge.secrets.has('se-trato')).toBe(true);
    expect(knowledge.flags.has('hale-confiesa')).toBe(true);
  });
});
