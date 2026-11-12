import { describe, expect, it, beforeEach } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { DEFAULT_SETTINGS } from '@deadline/core';
import { DB_VERSION, getDB, resetDBForTests, storeCounts } from './db.ts';
import { loadSettings, saveSettings } from './settingsRepo.ts';
import { getMeta, setMeta } from './meta.ts';

beforeEach(async () => {
  await resetDBForTests();
  globalThis.indexedDB = new IDBFactory();
});

describe('IndexedDB', () => {
  it('crea todos los almacenes en la versión actual', async () => {
    const db = await getDB();
    expect(db.version).toBe(DB_VERSION);
    expect([...db.objectStoreNames].sort()).toEqual(
      ['caseAssets', 'caseContent', 'caseRecords', 'catalog', 'dailyLedger', 'investigations', 'meta', 'notes', 'profile', 'settings', 'syncQueue'].sort(),
    );
    const counts = await storeCounts();
    expect(Object.values(counts).every((n) => n === 0)).toBe(true);
  });

  it('ajustes: devuelve valores por defecto y persiste cambios normalizados', async () => {
    expect(await loadSettings()).toEqual(DEFAULT_SETTINGS);
    await saveSettings({ ...DEFAULT_SETTINGS, textScale: 1.2, lightTone: 'cold' });
    await resetDBForTests(); // simula reabrir la app
    const s = await loadSettings();
    expect(s.textScale).toBe(1.2);
    expect(s.lightTone).toBe('cold');
  });

  it('meta: lectura y escritura clave-valor', async () => {
    await setMeta('firstLaunchAt', 123);
    expect(await getMeta<number>('firstLaunchAt')).toBe(123);
  });

  it('índices de investigaciones por caso', async () => {
    const db = await getDB();
    const base = {
      caseVersion: 1, mode: 'individual' as const, attempt: 1, status: 'active' as const, startedAt: 1, deadlineAt: 2, lastObservedAt: 1,
      knowledge: { facts: [], evidence: [], examined: [], details: [], contradictions: [], secrets: [], asked: [], flags: [], timelineEvents: [] },
      heardLines: [], hintsUsed: [], evidenceMarks: {}, associations: [], board: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
      timeline: [], deductions: [], log: [], rev: 0, updatedAt: 1,
    };
    await db.put('investigations', { ...base, id: 'inv-00001', caseId: 'DL-I-0001' });
    await db.put('investigations', { ...base, id: 'inv-00002', caseId: 'DL-I-0001', attempt: 2 });
    await db.put('investigations', { ...base, id: 'inv-00003', caseId: 'DL-I-0002' });
    expect(await db.countFromIndex('investigations', 'byCase', 'DL-I-0001')).toBe(2);
  });
});
