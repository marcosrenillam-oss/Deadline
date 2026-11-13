import { useCallback, useEffect, useState } from 'react';
import { dailyIndexFor, toCivilDate, type DailyLedger } from '@deadline/core';
import { syncDailyLedger } from '../../storage/dailyRepo.ts';
import { fetchCatalog } from '../../cases/contentRepo.ts';
import { getDB } from '../../storage/db.ts';
import { getMeta } from '../../storage/meta.ts';

export interface DeskData {
  today: Date;
  ledger: DailyLedger | null;
  notes: number;
  investigations: number;
  solved: number;
  firstLaunchAt: number | null;
  /** Diario de hoy, si ya está en el archivo y el jugador aún no lo ha abierto. */
  todayDailyNew: boolean;
  /** Tablero de la investigación en curso más reciente (para el corcho). */
  activeBoard: { path: string; title: string } | null;
}

async function load(): Promise<DeskData> {
  const today = new Date();
  const db = await getDB();
  const [ledger, notes, investigations, records, firstLaunchAt, catalog, active] = await Promise.all([
    syncDailyLedger(today),
    db.getAll('notes'),
    db.count('investigations'),
    db.getAll('caseRecords'),
    getMeta<number>('firstLaunchAt'),
    fetchCatalog().catch(() => db.getAll('catalog')),
    db.getAllFromIndex('investigations', 'byStatus', 'active'),
  ]);
  const now = Date.now();
  const live = active.filter((i) => i.deadlineAt > now).sort((a, b) => b.updatedAt - a.updatedAt)[0];
  const activeBoard = live
    ? {
        path: live.mode === 'coop' && live.coopSessionId ? `/pareja/${live.coopSessionId}/tablero` : `/expediente/${live.caseId}/tablero`,
        title: catalog.find((e) => e.id === live.caseId)?.title ?? live.caseId,
      }
    : null;
  const todayIdx = dailyIndexFor(toCivilDate(today), ledger.calendarStart);
  const todayCase = catalog.find((e) => e.mode === 'daily' && e.dailyIndex === todayIdx);
  return {
    today,
    ledger,
    notes: notes.filter((n) => !n.deletedAt).length,
    investigations,
    solved: records.filter((r) => r.status === 'solved').length,
    firstLaunchAt: firstLaunchAt ?? null,
    todayDailyNew: !!todayCase && !records.some((r) => r.caseId === todayCase.id),
    activeBoard,
  };
}

/** Datos reales que la mesa muestra (fecha, diario, notas, actividad). Se refresca al volver a la app y a medianoche. */
export function useDeskData(): DeskData {
  const [data, setData] = useState<DeskData>({ today: new Date(), ledger: null, notes: 0, investigations: 0, solved: 0, firstLaunchAt: null, todayDailyNew: false, activeBoard: null });
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
