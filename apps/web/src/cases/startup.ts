import { fetchCatalog } from './contentRepo.ts';
import { downloadCase, verifyAll } from './downloads.ts';
import { syncDailyLedger } from '../storage/dailyRepo.ts';

/** Diarios que se precargan por delante del día actual (texto y recursos). */
export const DAILY_PREFETCH_DAYS = 7;

/**
 * Mantenimiento al arrancar, en segundo plano:
 * 1. Comprueba que lo descargado sigue en el dispositivo (iOS puede borrarlo).
 * 2. Con conexión, precarga los diarios de los próximos días, para que el
 *    desbloqueo diario nunca dependa de tener red.
 */
export async function runStartupMaintenance(): Promise<void> {
  let catalog;
  try {
    catalog = await fetchCatalog();
  } catch {
    return;
  }
  const statuses = await verifyAll(catalog);
  if (!navigator.onLine) return;
  const ledger = await syncDailyLedger();
  const from = Math.max(0, ledger.highestUnlocked);
  const upcoming = catalog.filter((e) => e.mode === 'daily' && e.dailyIndex !== undefined && e.dailyIndex >= from && e.dailyIndex < from + DAILY_PREFETCH_DAYS);
  for (const e of upcoming) {
    const st = statuses[e.id];
    if (st?.state === 'verified' && st.contentVersion >= e.contentVersion) continue;
    await downloadCase(e).catch(() => undefined);
  }
}
