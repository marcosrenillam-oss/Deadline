import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, normalizeSettings } from '../src/settings/settings.ts';
import { progressToNext, rankFor, RANK_DEFINITIONS } from '../src/progression/ranks.ts';
import { isValidUsername } from '../src/profile/profile.ts';
import { nextBackoff } from '../src/sync/queue.ts';
import { formatCaseNumber, toCatalogEntry, caseFileSchema } from '../src/case/schema.ts';
import { minimalCase } from './fixtures/minimal-case.ts';
import { newId } from '../src/util/id.ts';

describe('ajustes', () => {
  it('completa valores por defecto y descarta solo campos inválidos', () => {
    expect(normalizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    const s = normalizeSettings({ musicVolume: 0.2, sfxVolume: 7, legacy: true });
    expect(s.musicVolume).toBe(0.2);
    expect(s.sfxVolume).toBe(DEFAULT_SETTINGS.sfxVolume);
    expect('legacy' in s).toBe(false);
  });
});

describe('rangos', () => {
  const zero = { merit: 0, perfectSolves: 0, accuracy: 0, solvedByDifficulty: { detective: 0, inspector: 0, 'special-unit': 0 } };
  it('empieza en Novato y exige mérito, precisión y dificultad', () => {
    expect(rankFor(zero).id).toBe('rookie');
    const grinder = { ...zero, merit: 999_999, perfectSolves: 999, accuracy: 0.9, solvedByDifficulty: { detective: 500, inspector: 0, 'special-unit': 0 } };
    expect(rankFor(grinder).id).toBe('detective');
  });
  it('la escala tiene los seis rangos y el progreso está acotado', () => {
    expect(RANK_DEFINITIONS.map((r) => r.label)).toEqual(['Novato', 'Detective', 'Inspector', 'Inspector jefe', 'Comisario', 'Leyenda DEADLINE']);
    const p = progressToNext(zero);
    expect(p.next?.id).toBe('detective');
    expect(p.progress).toBeGreaterThanOrEqual(0);
    expect(p.progress).toBeLessThanOrEqual(1);
  });
});

describe('utilidades', () => {
  it('valida nombres de usuario', () => {
    expect(isValidUsername('Holmes_221')).toBe(true);
    expect(isValidUsername('ab')).toBe(false);
    expect(isValidUsername('con espacio')).toBe(false);
  });
  it('backoff exponencial acotado', () => {
    expect(nextBackoff(0, () => 0)).toBe(1000);
    expect(nextBackoff(50, () => 1)).toBe(600_000);
  });
  it('ficha de catálogo y número visible', () => {
    const entry = toCatalogEntry(caseFileSchema.parse(minimalCase()));
    expect(entry.number).toBe(9001);
    expect(formatCaseNumber(entry.id)).toBe('Nº 9001-I');
  });
  it('genera identificadores únicos', () => {
    expect(new Set(Array.from({ length: 100 }, newId)).size).toBe(100);
  });
});
