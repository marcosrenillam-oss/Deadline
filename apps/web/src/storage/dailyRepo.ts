import { advanceDailyLedger, createDailyLedger, toCivilDate, type DailyLedger } from '@deadline/core';
import { getDB } from './db.ts';

const KEY = 'ledger';

/**
 * Lee el calendario de diarios y lo avanza según la fecha local.
 * La primera vez fija el inicio del calendario en el día de hoy.
 */
export async function syncDailyLedger(now = new Date()): Promise<DailyLedger> {
  const db = await getDB();
  const tx = db.transaction('dailyLedger', 'readwrite');
  const today = toCivilDate(now);
  const current = (await tx.store.get(KEY)) ?? createDailyLedger(today);
  const next = advanceDailyLedger(current, today);
  if (next !== current || !(await tx.store.getKey(KEY))) await tx.store.put(next, KEY);
  await tx.done;
  return next;
}
