import { normalizeSettings, type Settings } from '@deadline/core';
import { getDB } from './db.ts';

const KEY = 'device';

export async function loadSettings(): Promise<Settings> {
  const db = await getDB();
  return normalizeSettings(await db.get('settings', KEY));
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await getDB();
  await db.put('settings', normalizeSettings(settings), KEY);
}
