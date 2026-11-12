import { createLocalProfile, localProfileSchema, sanitizeLoadout, type CosmeticSlot, type LocalProfile } from '@deadline/core';
import { getDB } from './db.ts';

const KEY = 'local';

/** Devuelve el perfil local; lo crea la primera vez (sin registro, sin red). */
export async function ensureProfile(now = Date.now()): Promise<LocalProfile> {
  const db = await getDB();
  const tx = db.transaction('profile', 'readwrite');
  const existing = await tx.store.get(KEY);
  const parsed = existing ? localProfileSchema.safeParse(existing) : null;
  if (parsed?.success) {
    await tx.done;
    return { ...parsed.data, equipped: sanitizeLoadout(parsed.data.equipped, parsed.data.unlockedCosmetics) };
  }
  const fresh = createLocalProfile(now);
  await tx.store.put(fresh, KEY);
  await tx.done;
  return fresh;
}

export async function saveProfile(profile: LocalProfile): Promise<void> {
  const db = await getDB();
  await db.put('profile', localProfileSchema.parse(profile), KEY);
}

export async function equipCosmetic(slot: CosmeticSlot, itemId: string): Promise<LocalProfile> {
  const p = await ensureProfile();
  const next: LocalProfile = { ...p, equipped: sanitizeLoadout({ ...p.equipped, [slot]: itemId }, p.unlockedCosmetics), updatedAt: Date.now() };
  await saveProfile(next);
  return next;
}
