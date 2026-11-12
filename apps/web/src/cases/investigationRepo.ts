import { newId, startInvestigation, type CaseFile, type CaseRecord, type Investigation, type LocalProfile } from '@deadline/core';
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
