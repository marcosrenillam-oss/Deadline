import { describe, expect, it } from 'vitest';
import { caseFileSchema } from '../src/case/schema.ts';
import { examine, findDetail, ask, pointContradiction, startInvestigation } from '../src/engine/engine.ts';
import { accuse, expire } from '../src/engine/resolution.ts';
import type { CaseRecord, Investigation } from '../src/investigation/state.ts';
import { computeStats, dedupeCoop, rankStatsFor, type CaseMeta } from '../src/progression/stats.ts';
import { ACHIEVEMENTS, newAchievements } from '../src/progression/achievements.ts';
import { COSMETICS, earnedCosmetics, sanitizeLoadout } from '../src/cosmetics/catalog.ts';
import { upsertFriend, type InvestigatorCard } from '../src/profile/profile.ts';
import { minimalCase } from './fixtures/minimal-case.ts';

const c = caseFileSchema.parse(minimalCase());
const T0 = Date.UTC(2026, 10, 12, 10);
const record = (): CaseRecord => ({ caseId: c.id, mode: c.mode, firstOpenedAt: T0, attempts: ['inv-00000001'], status: 'in-progress', bestScore: 0, rewardedKeys: [] });
const meta = (): CaseMeta => ({ difficulty: c.difficulty, mode: c.mode, origin: 'real' });
const noon = () => 12;

function investigate(id: string, start: number): Investigation {
  let inv = startInvestigation(c, { id, now: start });
  inv = examine(c, inv, 'ev-maceta', start + 1).inv;
  inv = findDetail(c, inv, 'ev-maceta', 'dt-huella', start + 2).inv;
  inv = examine(c, inv, 'ev-botas', start + 3).inv;
  inv = ask(c, inv, 'q-hale-noche', start + 4).inv;
  inv = pointContradiction(c, inv, { line: 'ln-hale-dormia' }, { fact: 'fa-barro' }, start + 5).inv;
  inv = ask(c, inv, 'q-hale-deudas', start + 6).inv;
  return examine(c, inv, 'ev-pagare', start + 7).inv;
}

const perfect = { culprits: ['ch-hale'], motive: 'mo-deuda', method: 'me-llave', proof: 'ev-botas' };

describe('estadísticas', () => {
  it('cuentan resoluciones, actas impecables, precisión y tiempos', () => {
    const solved = accuse(c, investigate('inv-00000001', T0), record(), perfect, T0 + 10 * 60_000).inv;
    const wrong = accuse(c, investigate('inv-00000002', T0 + 1), record(), { ...perfect, culprits: ['ch-otro'] }, T0 + 20 * 60_000).inv;
    const s = computeStats({ investigations: [solved, wrong], records: [], meta, now: T0, hourOf: noon });
    expect(s.solo.solvedCases).toBe(1);
    expect(s.solo.perfect).toBe(1);
    expect(s.solo.accusations).toBe(2);
    expect(s.solo.recentAccuracy).toBe(0.5);
    expect(s.solo.solvedByDifficulty[c.difficulty]).toBe(1);
    expect(s.solo.fastestSolveMs).toBe(10 * 60_000);
    expect(s.feats.noHintSolves).toBe(1);
    expect(s.feats.fastSolves).toBe(1);
    expect(s.feats.wrongCulprits).toBe(1);
    expect(s.feats.realCaseSolves).toBe(1);
    expect(rankStatsFor(s, 'solo', 500)).toMatchObject({ merit: 500, perfectSolves: 1, accuracy: 0.5 });
  });

  it('el cierre por tiempo no cuenta como acusación', () => {
    const inv = investigate('inv-00000001', T0);
    const ex = expire(c, { ...inv }, record(), inv.deadlineAt + 1).inv;
    const s = computeStats({ investigations: [ex], records: [], meta, now: T0 });
    expect(s.solo.expired).toBe(1);
    expect(s.solo.accusations).toBe(0);
  });

  it('la mesa compartida cuenta una sola vez por partida', () => {
    const a = { ...accuse(c, investigate('inv-0000000a', T0), record(), perfect, T0 + 60_000).inv, mode: 'coop' as const, coopSessionId: 'coop-1' };
    const b = { ...a, id: 'inv-0000000b', startedAt: T0 + 1 };
    expect(dedupeCoop([a, b])).toHaveLength(1);
    const s = computeStats({ investigations: [a, b], records: [], meta, coopMode: () => 'same-device', now: T0, hourOf: noon });
    expect(s.coop.solvedCases).toBe(1);
    expect(s.coop.attempts).toBe(1);
    expect(s.feats.coopSameDeviceSolves).toBe(1);
  });

  it('rachas de casos del día por días locales consecutivos', () => {
    const day = 86_400_000;
    const daily = (i: number) => ({ ...accuse(c, investigate(`inv-d000000${i}`, T0 + i * day), record(), perfect, T0 + i * day + 60_000).inv, caseId: `dl-${i}`, mode: 'daily' as const });
    const invs = [0, 1, 2, 4].map(daily);
    const key = (t: number) => new Date(t).toISOString().slice(0, 10);
    const s = computeStats({ investigations: invs, records: [], meta: () => ({ difficulty: 'detective', mode: 'daily' }), now: T0 + 4 * day, dayKey: key, hourOf: noon });
    expect(s.daily.solved).toBe(4);
    expect(s.daily.bestStreak).toBe(3);
    expect(s.daily.currentStreak).toBe(1);
  });
});

describe('logros', () => {
  it('se conceden una vez y los de cierre miran el expediente', () => {
    const solved = accuse(c, investigate('inv-00000001', T0), record(), perfect, T0 + 10 * 60_000).inv;
    const stats = computeStats({ investigations: [solved], records: [], meta, now: T0, hourOf: noon });
    const ctx = { stats, soloMerit: 0, coopMerit: 0 };
    const got = newAchievements(ctx, [], { c, inv: solved }).map((a) => a.id);
    expect(got).toEqual(expect.arrayContaining(['first-signature', 'clean-record', 'no-crutches', 'against-the-clock', 'newspaper-library', 'not-a-comma']));
    expect(got).not.toContain('miscarriage');
    expect(newAchievements(ctx, got, { c, inv: solved })).toEqual([]);
  });

  it('todos los ids son únicos y las piezas de logro apuntan a logros existentes', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const item of COSMETICS) if (item.unlock.kind === 'achievement') expect(ids).toContain(item.unlock.achievementId);
  });

  it('logros y rangos conceden piezas de oficina; las bloqueadas no se pueden equipar', () => {
    expect(earnedCosmetics(['eagle-eye'], ['rookie', 'detective'])).toEqual(expect.arrayContaining(['decor-magnifier', 'typewriter-burgundy']));
    expect(sanitizeLoadout({ desk: 'desk-oak' }, []).desk).toBe('desk-walnut');
    expect(sanitizeLoadout({ desk: 'desk-oak' }, ['desk-oak']).desk).toBe('desk-oak');
  });
});

describe('clasificación entre amigos', () => {
  const card = (n: string, at: number): InvestigatorCard => ({ t: 'card', n, soloRank: 'rookie', coopRank: 'rookie', soloMerit: 100, coopMerit: 0, solved: 1, at });
  it('añade, actualiza solo con tarjetas más nuevas y rechaza la propia', () => {
    let r = upsertFriend([], card('DL-00001-R', 10), 'DL-00002-W', 50);
    expect(r.status).toBe('added');
    r = upsertFriend(r.friends, card('DL-00001-R', 5), 'DL-00002-W', 60);
    expect(r.status).toBe('stale');
    r = upsertFriend(r.friends, card('DL-00001-R', 20), 'DL-00002-W', 70);
    expect(r.status).toBe('updated');
    expect(r.friends[0]).toMatchObject({ addedAt: 50, updatedAt: 70 });
    expect(upsertFriend(r.friends, card('DL-00002-W', 1), 'DL-00002-W', 80).status).toBe('self');
  });
});
