import { describe, expect, it } from 'vitest';
import { caseFileSchema, type CaseFileInput } from '../src/case/schema.ts';
import { validateCase } from '../src/case/validate.ts';
import { availableInterrogations, examine, findDetail, knowledgeOf, startInvestigation, ask } from '../src/engine/engine.ts';
import { emptyShare, exportBoard, mergeBoard, mergeShared, shareSize, unionShare, unshared } from '../src/engine/coop.ts';
import { decodeCode, encodeCode, newKey } from '../src/exchange/codec.ts';
import { invitePacket, reportPacket, sameAccusation } from '../src/exchange/packets.ts';
import { minimalCase } from './fixtures/minimal-case.ts';

/** El caso de prueba convertido en cooperativo de información dividida. */
function splitCase(): CaseFileInput {
  const c = minimalCase();
  c.id = 'DL-C-9001';
  c.mode = 'coop';
  c.coop = { style: 'split', roles: [{ id: 'A', title: 'Archivo', briefing: 'Papeles.' }, { id: 'B', title: 'Calle', briefing: 'Escena.' }] };
  const holders: Record<string, 'A' | 'B' | 'both'> = { 'ev-informe': 'both', 'ev-maceta': 'B', 'ev-botas': 'B', 'ev-pagare': 'A' };
  c.evidence.forEach((e) => (e.holder = holders[e.id]!));
  c.interrogations![0]!.holder = 'B';
  c.interrogations![1]!.holder = 'A';
  return c;
}
const c = caseFileSchema.parse(splitCase());
const T0 = 1_800_000_000_000;

describe('cooperativo de información dividida', () => {
  it('el caso dividido es válido y resoluble entre los dos', () => {
    const r = validateCase(splitCase());
    expect(r.errors).toEqual([]);
  });

  it('cada papel recibe solo sus piezas e interrogatorios', () => {
    const a = startInvestigation(c, { id: 'inv-aaaaaaaa', now: T0, role: 'A' });
    const b = startInvestigation(c, { id: 'inv-bbbbbbbb', now: T0, role: 'B' });
    expect([...knowledgeOf(a).evidence]).toEqual(['ev-informe']);
    expect([...knowledgeOf(b).evidence].sort()).toEqual(['ev-informe', 'ev-maceta']);
    expect(availableInterrogations(c, knowledgeOf(a), a.role).map((i) => i.id)).toEqual(['in-pryce']);
    expect(availableInterrogations(c, knowledgeOf(b), b.role).map((i) => i.id)).toEqual(['in-hale']);
    expect(ask(c, a, 'q-hale-noche', T0).result.lines).toEqual([]);
  });

  it('una acción propia no entrega piezas del compañero', () => {
    let b = startInvestigation(c, { id: 'inv-bbbbbbbb', now: T0, role: 'B' });
    b = ask(c, b, 'q-hale-noche', T0).inv;
    b = ask(c, b, 'q-hale-deudas', T0).inv; // el pagaré aparecería, pero es del papel A
    expect(knowledgeOf(b).evidence.has('ev-pagare')).toBe(false);
  });

  it('poner en común: lo compartido se incorpora y es idempotente', () => {
    let b = startInvestigation(c, { id: 'inv-bbbbbbbb', now: T0, role: 'B' });
    b = examine(c, b, 'ev-maceta', T0).inv;
    b = findDetail(c, b, 'ev-maceta', 'dt-huella', T0).inv;
    b = ask(c, b, 'q-hale-noche', T0).inv;
    const out = unshared(b, emptyShare());
    expect(out.evidence).toContain('ev-botas');
    expect(out.lines).toContain('ln-hale-dormia');
    let a = startInvestigation(c, { id: 'inv-aaaaaaaa', now: T0, role: 'A' });
    const r = mergeShared(c, a, out, T0 + 1, 'B');
    a = r.inv;
    expect(knowledgeOf(a).evidence.has('ev-botas')).toBe(true);
    expect(a.heardLines).toContain('ln-hale-dormia');
    expect(a.log.at(-1)).toMatchObject({ type: 'received', ref: 'B' });
    const again = mergeShared(c, a, out, T0 + 2, 'B');
    expect(again.inv).toBe(a);
    expect(shareSize(again.result.added)).toBe(0);
    expect(shareSize(unshared(b, unionShare(out, emptyShare())))).toBe(0);
  });

  it('tablero compartido: añade tarjetas e hilos que faltan', () => {
    const base = startInvestigation(c, { id: 'inv-aaaaaaaa', now: T0, role: 'A' });
    const mine = { ...base, board: { ...base.board, nodes: [{ id: 'n1', ref: { kind: 'character' as const, id: 'ch-hale' }, x: 0, y: 0, rotation: 0, pinColor: 'red' as const }], edges: [] } };
    const theirs = {
      ...base,
      board: {
        ...base.board,
        nodes: [
          { id: 'm1', ref: { kind: 'character' as const, id: 'ch-hale' }, x: 50, y: 50, rotation: 0, pinColor: 'red' as const },
          { id: 'm2', ref: { kind: 'evidence' as const, id: 'ev-botas' }, x: 200, y: 50, rotation: 0, pinColor: 'red' as const },
        ],
        edges: [{ id: 'e1', from: 'm1', to: 'm2', style: 'thread' as const }],
      },
    };
    const merged = mergeBoard(mine, exportBoard(theirs));
    expect(merged.board.nodes).toHaveLength(2);
    expect(merged.board.nodes[0]!.x).toBe(0); // no mueve lo propio
    expect(merged.board.edges).toHaveLength(1);
    expect(mergeBoard(merged, exportBoard(theirs)).board.edges).toHaveLength(1);
  });
});

describe('códigos de intercambio', () => {
  it('ida y vuelta, firma y rechazo de códigos ajenos o dañados', async () => {
    const key = newKey();
    const payload = { t: 'report', sid: 'sess-12345', seq: 1, from: 'A', share: emptyShare(), notes: ['Hola'], at: 1 };
    const code = await encodeCode(payload, key);
    expect(code.startsWith('DL1.')).toBe(true);
    const ok = await decodeCode(`Mira esto:\n${code}\n`, key);
    expect(ok.ok && reportPacket.parse(ok.value).notes).toEqual(['Hola']);
    expect((await decodeCode(code, newKey())).ok).toBe(false);
    expect((await decodeCode(code.slice(0, -8), key)).ok).toBe(false);
    expect((await decodeCode('hola', key)).ok).toBe(false);
  });

  it('la invitación lleva la clave y no va firmada', async () => {
    const inv = { t: 'invite', sid: 'sess-12345', caseId: 'DL-C-0001', cv: 1, hostRole: 'A', host: { n: 'DL-48213-M', a: 'holmes' }, key: newKey(), at: 1 };
    const code = await encodeCode(inv);
    const r = await decodeCode(code);
    expect(r.ok && invitePacket.parse(r.value).key).toBe(inv.key);
  });

  it('compara acusaciones sin importar el orden de los culpables', () => {
    expect(sameAccusation({ culprits: ['a', 'b'], motive: 'm', method: 'x', proof: 'p' }, { culprits: ['b', 'a'], motive: 'm', method: 'x', proof: 'p' })).toBe(true);
    expect(sameAccusation({ culprits: ['a'], motive: 'm', method: 'x', proof: 'p' }, { culprits: ['a'], motive: 'n', method: 'x', proof: 'p' })).toBe(false);
  });
});
