import { useCallback, useEffect, useState } from 'react';
import type { DailyLedger } from '@deadline/core';
import { syncDailyLedger } from '../../storage/dailyRepo.ts';
import { getDB } from '../../storage/db.ts';
import { getMeta } from '../../storage/meta.ts';

export interface DeskData {
  today: Date;
  ledger: DailyLedger | null;
  notes: number;
  investigations: number;
  solved: number;
  firstLaunchAt: number | null;
}

async function load(): Promise<DeskData> {
  const today = new Date();
  const db = await getDB();
  const [ledger, notes, investigations, records, firstLaunchAt] = await Promise.all([
    syncDailyLedger(today),
    db.getAll('notes'),
    db.count('investigations'),
    db.getAll('caseRecords'),
    getMeta<number>('firstLaunchAt'),
  ]);
  return {
    today,
    ledger,
    notes: notes.filter((n) => !n.deletedAt).length,
    investigations,
    solved: records.filter((r) => r.status === 'solved').length,
    firstLaunchAt: firstLaunchAt ?? null,
  };
}

/** Datos reales que la mesa muestra (fecha, diario, notas, actividad). Se refresca al volver a la app y a medianoche. */
export function useDeskData(): DeskData {
  const [data, setData] = useState<DeskData>({ today: new Date(), ledger: null, notes: 0, investigations: 0, solved: 0, firstLaunchAt: null });
  const refresh = useCallback(() => {
    load().then(setData, (err: unknown) => console.error('[desk] No se pudieron leer los datos locales', err));
  }, []);
  useEffect(() => {
    refresh();
    const onVisible = () => !document.hidden && refresh();
    document.addEventListener('visibilitychange', onVisible);
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5).getTime() - now.getTime();
    const t = setTimeout(refresh, midnight);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearTimeout(t);
    };
  }, [refresh]);
  return data;
}
