import {
  COSMETICS,
  RANK_DEFINITIONS,
  computeStats,
  earnedCosmetics,
  localDayKey,
  newAchievements,
  rankFor,
  rankStatsFor,
  type AchievementDef,
  type CaseFile,
  type CaseMeta,
  type Investigation,
  type LocalProfile,
  type PlayerStats,
  type RankDefinition,
} from '@deadline/core';
import { getDB } from '../storage/db.ts';
import type { CoopSession } from '../cases/coopTypes.ts';
import { announce } from './announcements.ts';

/**
 * PROGRESIÓN LOCAL: estadísticas, rangos, logros y piezas de la oficina.
 *
 * Las estadísticas se recalculan a partir de lo guardado; los logros y las
 * piezas conseguidas se guardan en el perfil (una sola vez cada uno).
 */

export interface Progress {
  stats: PlayerStats;
  soloRank: RankDefinition;
  coopRank: RankDefinition;
}

interface Snapshot {
  investigations: Investigation[];
  meta: Map<string, CaseMeta>;
  coop: Map<string, CoopSession['mode']>;
}

async function snapshot(): Promise<Snapshot> {
  const db = await getDB();
  const [investigations, catalog, sessions] = await Promise.all([db.getAll('investigations'), db.getAll('catalog'), db.getAll('coopSessions')]);
  const meta = new Map<string, CaseMeta>(catalog.map((e) => [e.id, { difficulty: e.difficulty, mode: e.mode, origin: e.origin, title: e.title }]));
  return { investigations, meta, coop: new Map(sessions.map((s) => [s.id, s.mode])) };
}

function statsFrom(s: Snapshot, now: number, extraMeta?: [string, CaseMeta]): PlayerStats {
  if (extraMeta) s.meta.set(extraMeta[0], extraMeta[1]);
  return computeStats({
    investigations: s.investigations,
    records: [],
    meta: (id) => s.meta.get(id),
    coopMode: (id) => s.coop.get(id),
    now,
    dayKey: localDayKey,
  });
}

export function ranksOf(stats: PlayerStats, profile: Pick<LocalProfile, 'soloMerit' | 'coopMerit'>): { soloRank: RankDefinition; coopRank: RankDefinition } {
  return {
    soloRank: rankFor(rankStatsFor(stats, 'solo', profile.soloMerit)),
    coopRank: rankFor(rankStatsFor(stats, 'coop', profile.coopMerit)),
  };
}

export async function loadProgress(profile: LocalProfile, now = Date.now()): Promise<Progress> {
  const stats = statsFrom(await snapshot(), now);
  return { stats, ...ranksOf(stats, profile) };
}

const rankIndex = (r: RankDefinition) => RANK_DEFINITIONS.findIndex((d) => d.id === r.id);

/** Rangos alcanzados (todos los inferiores incluidos), individual o en pareja. */
function reachedRanks(solo: RankDefinition, coop: RankDefinition): string[] {
  const top = Math.max(rankIndex(solo), rankIndex(coop));
  return RANK_DEFINITIONS.slice(0, top + 1).map((r) => r.id);
}

export interface ProgressionOutcome {
  achievements: AchievementDef[];
  cosmetics: string[];
  rankUps: Array<{ mode: 'solo' | 'coop'; rank: RankDefinition }>;
  profile: LocalProfile;
}

/**
 * Evalúa logros, ascensos y piezas ganadas y los guarda en el perfil.
 * Se llama tras cada cierre (con el expediente, para los logros de cierre) y
 * al arrancar (para recoger lo que llegue con una copia importada).
 * `before` es el perfil anterior al cierre, para detectar ascensos.
 */
export async function applyProgression(opts: { closure?: { c: CaseFile; inv: Investigation }; before?: Pick<LocalProfile, 'soloMerit' | 'coopMerit'>; now?: number; silent?: boolean } = {}): Promise<ProgressionOutcome | null> {
  const now = opts.now ?? Date.now();
  const snap = await snapshot();
  const extra: [string, CaseMeta] | undefined = opts.closure ? [opts.closure.c.id, { difficulty: opts.closure.c.difficulty, mode: opts.closure.c.mode, origin: opts.closure.c.origin, title: opts.closure.c.title }] : undefined;
  const stats = statsFrom(snap, now, extra);

  const db = await getDB();
  const tx = db.transaction('profile', 'readwrite');
  const profile = await tx.store.get('local');
  if (!profile) {
    await tx.done;
    return null;
  }
  const achievementsBefore = profile.achievements ?? [];
  const ctx = { stats, soloMerit: profile.soloMerit, coopMerit: profile.coopMerit };
  const fresh = newAchievements(ctx, achievementsBefore.map((a) => a.id), opts.closure);
  const ranks = ranksOf(stats, profile);
  const allAchievementIds = [...achievementsBefore.map((a) => a.id), ...fresh.map((a) => a.id)];
  const earned = earnedCosmetics(allAchievementIds, reachedRanks(ranks.soloRank, ranks.coopRank));
  const newCosmetics = earned.filter((id) => !profile.unlockedCosmetics.includes(id));

  const rankUps: ProgressionOutcome['rankUps'] = [];
  if (opts.before) {
    const prev = ranksOf(stats, opts.before);
    if (rankIndex(ranks.soloRank) > rankIndex(prev.soloRank)) rankUps.push({ mode: 'solo', rank: ranks.soloRank });
    if (rankIndex(ranks.coopRank) > rankIndex(prev.coopRank)) rankUps.push({ mode: 'coop', rank: ranks.coopRank });
  }

  if (!fresh.length && !newCosmetics.length) {
    await tx.done;
    if (!opts.silent) for (const r of rankUps) announce({ kind: 'rank', title: r.rank.label, detail: `${r.mode === 'solo' ? 'Nuevo rango individual' : 'Nuevo rango en pareja'}. ${r.rank.description}` });
    return { achievements: [], cosmetics: [], rankUps, profile };
  }

  const next: LocalProfile = {
    ...profile,
    points: profile.points + fresh.reduce((s, a) => s + a.reward, 0),
    achievements: [...achievementsBefore, ...fresh.map((a) => ({ id: a.id, at: now }))],
    unlockedCosmetics: [...new Set([...profile.unlockedCosmetics, ...newCosmetics])].sort(),
    updatedAt: now,
  };
  await tx.store.put(next, 'local');
  await tx.done;

  if (!opts.silent) {
    for (const r of rankUps) announce({ kind: 'rank', title: r.rank.label, detail: `${r.mode === 'solo' ? 'Nuevo rango individual' : 'Nuevo rango en pareja'}. ${r.rank.description}` });
    for (const a of fresh) announce({ kind: 'achievement', title: a.label, detail: `${a.description}${a.reward ? ` · +${a.reward} puntos` : ''}` });
    for (const id of newCosmetics) {
      const item = COSMETICS.find((c) => c.id === id);
      if (item) announce({ kind: 'cosmetic', title: item.label, detail: 'Nueva pieza para tu oficina. Equípala en Lámpara → Oficina.' });
    }
  }
  return { achievements: fresh, cosmetics: newCosmetics, rankUps, profile: next };
}

export class CannotPurchase extends Error {}

/** Compra una pieza de la oficina con puntos (transacción: o se cobra y se desbloquea, o nada). */
export async function purchaseCosmetic(itemId: string, now = Date.now()): Promise<LocalProfile> {
  const item = COSMETICS.find((c) => c.id === itemId);
  if (!item || item.unlock.kind !== 'points') throw new CannotPurchase('Esa pieza no se vende.');
  const db = await getDB();
  const tx = db.transaction('profile', 'readwrite');
  const profile = await tx.store.get('local');
  if (!profile) {
    tx.abort();
    throw new CannotPurchase('No hay perfil.');
  }
  if (profile.unlockedCosmetics.includes(itemId)) {
    await tx.done;
    return profile;
  }
  if (profile.points < item.unlock.cost) {
    tx.abort();
    throw new CannotPurchase(`Cuesta ${item.unlock.cost} puntos y tienes ${profile.points}.`);
  }
  const next: LocalProfile = { ...profile, points: profile.points - item.unlock.cost, unlockedCosmetics: [...profile.unlockedCosmetics, itemId].sort(), updatedAt: now };
  await tx.store.put(next, 'local');
  await tx.done;
  return next;
}
