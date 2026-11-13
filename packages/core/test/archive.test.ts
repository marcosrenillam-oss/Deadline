import { describe, expect, it } from 'vitest';
import { buildArchive, mergeArchiveData, parseArchive, archiveFileName, type ArchiveData } from '../src/backup/archive.ts';
import { createLocalProfile } from '../src/profile/profile.ts';
import { DEFAULT_SETTINGS } from '../src/settings/settings.ts';
import { createDailyLedger, type CivilDate } from '../src/daily/schedule.ts';
import type { CaseRecord, Note } from '../src/investigation/state.ts';

const note = (id: string, text: string, updatedAt: number): Note => ({ id, kind: 'note', text, refs: [], pinned: false, done: false, createdAt: 1, updatedAt, rev: 0 });
const record = (caseId: string, patch: Partial<CaseRecord> = {}): CaseRecord => ({
  caseId, mode: 'individual', firstOpenedAt: 100, attempts: ['inv-aaaaaaaa'], status: 'in-progress', bestScore: 0, rewardedKeys: [], ...patch,
});

function sample(): ArchiveData {
  return {
    settings: { ...DEFAULT_SETTINGS, textScale: 1.2 },
    profile: { ...createLocalProfile(1000, () => 0.5), alias: 'holmes' },
    investigations: [],
    caseRecords: [record('DL-I-0001', { rewardedKeys: ['evidence:ev-a'] })],
    notes: [note('note-0001', 'El jardinero mintió', 50)],
    dailyLedger: { ...createDailyLedger('2026-11-12' as CivilDate), highestUnlocked: 2, unlockedOn: { 0: '2026-11-12', 1: '2026-11-13', 2: '2026-11-14' } },
    coopSessions: [],
    friends: [],
  };
}

describe('archivo personal', () => {
  it('exporta e importa sin pérdidas', async () => {
    const archive = await buildArchive(sample(), { appVersion: '0.2.0', now: 1_800_000_000_000 });
    const parsed = await parseArchive(JSON.stringify(archive, null, 2));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.archive.data).toEqual(sample());
    expect(parsed.summary).toMatchObject({ investigations: 0, notes: 1, dailyUnlocked: 3 });
    expect(archiveFileName(archive)).toMatch(/^deadline-DL-50000-[A-Z]-\d{8}\.json$/);
  });

  it('detecta archivos dañados, ajenos o de versiones futuras', async () => {
    const archive = await buildArchive(sample(), { appVersion: '0.2.0', now: 1 });
    const tampered = JSON.parse(JSON.stringify(archive));
    tampered.data.notes[0].text = 'Otra cosa';
    expect((await parseArchive(JSON.stringify(tampered))).ok).toBe(false);
    expect((await parseArchive('{"hola":1}')).ok).toBe(false);
    expect((await parseArchive('{trunc')).ok).toBe(false);
    const future = await parseArchive(JSON.stringify({ ...archive, version: 9 }));
    expect(future.ok === false && future.error.includes('más reciente')).toBe(true);
  });

  it('fusiona sin duplicar recompensas y conserva lo más reciente', () => {
    const local = sample();
    const incoming = sample();
    incoming.profile = { ...incoming.profile, investigatorNumber: 'DL-00001-R', createdAt: 5000, points: 300, updatedAt: 9000 };
    incoming.notes = [note('note-0001', 'Editada en el otro iPhone', 99), note('note-0002', 'Nueva', 10)];
    incoming.caseRecords = [record('DL-I-0001', { status: 'solved', solvedAt: 777, bestScore: 900, attempts: ['inv-bbbbbbbb'], rewardedKeys: ['evidence:ev-a', 'solve'] })];
    const merged = mergeArchiveData(local, incoming, 'merge');
    expect(merged.notes.find((n) => n.id === 'note-0001')?.text).toBe('Editada en el otro iPhone');
    expect(merged.notes).toHaveLength(2);
    const r = merged.caseRecords[0]!;
    expect(r.status).toBe('solved');
    expect(r.attempts.sort()).toEqual(['inv-aaaaaaaa', 'inv-bbbbbbbb']);
    expect(r.rewardedKeys).toEqual(['evidence:ev-a', 'solve']);
    expect(merged.profile.investigatorNumber).toBe(local.profile.investigatorNumber);
    expect(merged.profile.points).toBe(300);
    expect(merged.settings).toEqual(local.settings);
  });

  it('reemplazar sustituye por completo', () => {
    const incoming = sample();
    incoming.notes = [];
    expect(mergeArchiveData(sample(), incoming, 'replace').notes).toEqual([]);
  });
});
