import { beforeEach, describe, expect, it } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { getDB, resetDBForTests } from './db.ts';
import { applyArchive, collectLocalData, exportArchive, parseArchive } from './backup.ts';
import { ensureProfile } from './profileRepo.ts';
import { syncDailyLedger } from './dailyRepo.ts';
import { getMeta } from './meta.ts';

beforeEach(async () => {
  await resetDBForTests();
  globalThis.indexedDB = new IDBFactory();
});

const note = (id: string, text: string) => ({ id, kind: 'note' as const, text, refs: [], pinned: false, done: false, createdAt: 1, updatedAt: 1, rev: 0 });

describe('copia de seguridad local', () => {
  it('perfil y calendario se crean una sola vez', async () => {
    const a = await ensureProfile(1000);
    const b = await ensureProfile(2000);
    expect(b.investigatorNumber).toBe(a.investigatorNumber);
    const l1 = await syncDailyLedger(new Date(2026, 10, 12, 10));
    const l2 = await syncDailyLedger(new Date(2026, 10, 14, 23));
    expect(l1.calendarStart).toBe('2026-11-12');
    expect(l1.highestUnlocked).toBe(0);
    expect(l2.highestUnlocked).toBe(2);
  });

  it('exporta, se pierde el dispositivo y se restaura en otro', async () => {
    const profile = await ensureProfile();
    await syncDailyLedger();
    await (await getDB()).put('notes', note('note-0001', 'Sospecho del notario'));
    const archive = await exportArchive();
    expect(await getMeta('lastExportAt')).toBe(archive.exportedAt);
    const text = JSON.stringify(archive);

    // Otro iPhone (base de datos vacía)
    await resetDBForTests();
    globalThis.indexedDB = new IDBFactory();
    const parsed = await parseArchive(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    await applyArchive(parsed.archive, 'replace');
    const restored = await collectLocalData();
    expect(restored.profile.investigatorNumber).toBe(profile.investigatorNumber);
    expect(restored.notes.map((n) => n.text)).toEqual(['Sospecho del notario']);
    expect(restored.dailyLedger?.calendarStart).toBe(archive.data.dailyLedger?.calendarStart);
  });

  it('fusionar conserva lo que solo existe en el dispositivo', async () => {
    await ensureProfile();
    const archive = await exportArchive();
    await (await getDB()).put('notes', note('note-local', 'Solo aquí'));
    await applyArchive(archive, 'merge');
    expect((await collectLocalData()).notes.map((n) => n.id)).toEqual(['note-local']);
    await applyArchive(archive, 'replace');
    expect((await collectLocalData()).notes).toEqual([]);
  });
});
