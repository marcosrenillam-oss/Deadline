import { carryOverKnowledge, carryOverWorkspace, newId, reopenCost, startInvestigation, type CaseFile, type CaseRecord, type Investigation, type LocalProfile } from '@deadline/core';
import { getDB } from '../storage/db.ts';

export async function getRecord(caseId: string): Promise<CaseRecord | undefined> {
  return (await getDB()).get('caseRecords', caseId);
}

export async function getInvestigation(id: string): Promise<Investigation | undefined> {
  return (await getDB()).get('investigations', id);
}

/** Última investigación de un caso (activa o cerrada). */
export async function latestInvestigation(caseId: string): Promise<Investigation | undefined> {
  const all = await (await getDB()).getAllFromIndex('investigations', 'byCase', caseId);
  return all.sort((a, b) => b.attempt - a.attempt)[0];
}

export async function saveInvestigation(inv: Investigation): Promise<void> {
  await (await getDB()).put('investigations', inv);
}

export async function saveRecord(r: CaseRecord): Promise<void> {
  await (await getDB()).put('caseRecords', r);
}

export async function allRecords(): Promise<CaseRecord[]> {
  return (await getDB()).getAll('caseRecords');
}

/** Abre un expediente: crea la investigación y el registro en una sola transacción. El reloj empieza aquí. */
export async function openInvestigation(c: CaseFile, now = Date.now()): Promise<{ inv: Investigation; record: CaseRecord }> {
  const db = await getDB();
  const tx = db.transaction(['caseRecords', 'investigations'], 'readwrite');
  const prev = await tx.objectStore('caseRecords').get(c.id);
  const attempt = (prev?.attempts.length ?? 0) + 1;
  const inv = startInvestigation(c, { id: newId(), now, attempt, ...(prev?.carriedKnowledge ? { carried: prev.carriedKnowledge } : {}) });
  const record: CaseRecord = {
    caseId: c.id,
    mode: c.mode,
    firstOpenedAt: prev?.firstOpenedAt ?? now,
    attempts: [...(prev?.attempts ?? []), inv.id],
    activeInvestigationId: inv.id,
    status: 'in-progress',
    bestScore: prev?.bestScore ?? 0,
    rewardedKeys: prev?.rewardedKeys ?? [],
    ...(prev?.solvedAt !== undefined ? { solvedAt: prev.solvedAt } : {}),
    ...(prev?.carriedKnowledge ? { carriedKnowledge: prev.carriedKnowledge } : {}),
  };
  await tx.objectStore('investigations').put(inv);
  await tx.objectStore('caseRecords').put(record);
  await tx.done;
  return { inv, record };
}

/** Todas las investigaciones (intentos) de un caso, de la más reciente a la más antigua. */
export async function attemptsOf(caseId: string): Promise<Investigation[]> {
  const all = await (await getDB()).getAllFromIndex('investigations', 'byCase', caseId);
  return all.sort((a, b) => b.attempt - a.attempt);
}

export class NotEnoughPoints extends Error {
  constructor(
    readonly cost: number,
    readonly balance: number,
  ) {
    super(`Reabrir cuesta ${cost} puntos y tienes ${balance}.`);
  }
}

/**
 * Reabre un expediente cerrado: cobra los puntos y crea una investigación
 * nueva (reloj nuevo) que conserva descubrimientos, tablero y cronología.
 * Todo en una transacción: o se cobra y se abre, o no pasa nada.
 */
export async function reopenInvestigation(c: CaseFile, now = Date.now()): Promise<{ inv: Investigation; record: CaseRecord; profile: LocalProfile }> {
  const db = await getDB();
  const tx = db.transaction(['caseRecords', 'investigations', 'profile'], 'readwrite');
  const record = await tx.objectStore('caseRecords').get(c.id);
  const profile = await tx.objectStore('profile').get('local');
  const prevId = record?.attempts.at(-1);
  const prev = prevId ? await tx.objectStore('investigations').get(prevId) : undefined;
  if (!record || !profile || !prev || prev.status === 'active') {
    tx.abort();
    throw new Error('Este expediente no está cerrado.');
  }
  const cost = reopenCost(c);
  if (profile.points < cost) {
    tx.abort();
    throw new NotEnoughPoints(cost, profile.points);
  }
  const inv = startInvestigation(c, {
    id: newId(),
    now,
    attempt: record.attempts.length + 1,
    carried: carryOverKnowledge(prev.knowledge),
    workspace: carryOverWorkspace(prev),
  });
  const nextRecord: CaseRecord = { ...record, attempts: [...record.attempts, inv.id], activeInvestigationId: inv.id, status: record.status === 'solved' ? 'solved' : 'in-progress' };
  const nextProfile: LocalProfile = { ...profile, points: profile.points - cost, updatedAt: now };
  await tx.objectStore('investigations').put(inv);
  await tx.objectStore('caseRecords').put(nextRecord);
  await tx.objectStore('profile').put(nextProfile, 'local');
  await tx.done;
  return { inv, record: nextRecord, profile: nextProfile };
}

/** Cierra un caso guardando investigación, registro y puntos del perfil a la vez. */
export async function settleCase(inv: Investigation, record: CaseRecord, points: number): Promise<LocalProfile | undefined> {
  const db = await getDB();
  const tx = db.transaction(['investigations', 'caseRecords', 'profile'], 'readwrite');
  await tx.objectStore('investigations').put(inv);
  await tx.objectStore('caseRecords').put(record);
  const profile = await tx.objectStore('profile').get('local');
  let next: LocalProfile | undefined;
  if (profile && points > 0) {
    const coop = inv.mode === 'coop';
    next = {
      ...profile,
      points: profile.points + points,
      soloMerit: profile.soloMerit + (coop ? 0 : points),
      coopMerit: profile.coopMerit + (coop ? points : 0),
      updatedAt: Date.now(),
    };
    await tx.objectStore('profile').put(next, 'local');
  }
  await tx.done;
  return next;
}
