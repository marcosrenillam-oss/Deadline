import { decodeCode, investigatorCardSchema, upsertFriend, type Friend } from '@deadline/core';
import { getDB } from '../storage/db.ts';
import { ensureProfile } from '../storage/profileRepo.ts';

export async function listFriends(): Promise<Friend[]> {
  return (await getDB()).getAll('friends');
}

export type ImportCardResult = { ok: true; status: 'added' | 'updated'; friend: Friend } | { ok: false; error: string };

/** Lee una tarjeta de investigador pegada (con o sin texto alrededor) y la guarda. */
export async function importCard(text: string, now = Date.now()): Promise<ImportCardResult> {
  const decoded = await decodeCode(text);
  if (!decoded.ok) return { ok: false, error: decoded.error };
  const parsed = investigatorCardSchema.safeParse(decoded.value);
  if (!parsed.success) return { ok: false, error: 'Ese código no es una tarjeta de investigador.' };
  const own = (await ensureProfile()).investigatorNumber;
  const db = await getDB();
  const tx = db.transaction('friends', 'readwrite');
  const r = upsertFriend(await tx.store.getAll(), parsed.data, own, now);
  if (r.status === 'self') {
    await tx.done;
    return { ok: false, error: 'Es tu propia tarjeta.' };
  }
  if (r.status === 'stale') {
    await tx.done;
    return { ok: false, error: 'Ya tienes una tarjeta igual o más reciente de este investigador.' };
  }
  const friend = r.friends.find((f) => f.number === parsed.data.n)!;
  await tx.store.put(friend);
  await tx.done;
  return { ok: true, status: r.status, friend };
}

export async function removeFriend(number: string): Promise<void> {
  await (await getDB()).delete('friends', number);
}
