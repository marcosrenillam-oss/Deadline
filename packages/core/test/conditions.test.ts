import { describe, expect, it } from 'vitest';
import { applyEffects, deserializeKnowledge, emptyKnowledge, evaluateCondition, serializeKnowledge } from '../src/case/conditions.ts';

describe('condiciones', () => {
  const k = applyEffects(emptyKnowledge(), [{ grantFact: 'fa-a' }, { grantEvidence: 'ev-b' }, { setFlag: 'x' }]);

  it('evalúa hojas y combinadores', () => {
    expect(evaluateCondition(undefined, k)).toBe(true);
    expect(evaluateCondition({ fact: 'fa-a' }, k)).toBe(true);
    expect(evaluateCondition({ fact: 'fa-z' }, k)).toBe(false);
    expect(evaluateCondition({ all: [{ fact: 'fa-a' }, { evidence: 'ev-b' }] }, k)).toBe(true);
    expect(evaluateCondition({ any: [{ fact: 'fa-z' }, { flag: 'x' }] }, k)).toBe(true);
    expect(evaluateCondition({ not: { flag: 'x' } }, k)).toBe(false);
    expect(evaluateCondition({ atLeast: 2, of: [{ fact: 'fa-a' }, { fact: 'fa-z' }, { flag: 'x' }] }, k)).toBe(true);
    expect(evaluateCondition({ atLeast: 3, of: [{ fact: 'fa-a' }, { fact: 'fa-z' }, { flag: 'x' }] }, k)).toBe(false);
  });

  it('applyEffects es inmutable', () => {
    const before = emptyKnowledge();
    const after = applyEffects(before, [{ grantFact: 'fa-a' }]);
    expect(before.facts.size).toBe(0);
    expect(after.facts.has('fa-a')).toBe(true);
  });

  it('serializa y deserializa sin pérdidas', () => {
    expect(serializeKnowledge(deserializeKnowledge(serializeKnowledge(k)))).toEqual(serializeKnowledge(k));
  });
});
