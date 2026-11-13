import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { DAILY_TOTAL, addDays, dailyIndexFor, toCivilDate, type CaseRecord, type DailyLedger } from '@deadline/core';
import { fetchCatalog, type CatalogEntry } from '../../cases/contentRepo.ts';
import { allRecords } from '../../cases/investigationRepo.ts';
import { allStatuses } from '../../cases/downloads.ts';
import { syncDailyLedger } from '../../storage/dailyRepo.ts';
import type { CaseAssetStatus } from '../../storage/db.ts';
import { BackToDesk } from '../../ui/BackToDesk.tsx';
import { Stamp } from '../../ui/Stamp.tsx';
import { sound } from '../../audio/sound.ts';
import surface from '../../ui/Surface.module.css';
import s from './CalendarScene.module.css';

const STATUS: Record<string, string> = { 'in-progress': 'En curso', solved: 'Resuelto', closed: 'Cerrado' };

function civilLabel(date: string, opts: Intl.DateTimeFormatOptions): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('es-ES', opts).format(new Date(y!, m! - 1, d!));
}

/**
 * EL CALENDARIO: un expediente nuevo cada día durante 500 días. El calendario
 * de cada jugador empieza el día de su primer arranque. Un diario no jugado
 * pasa al archivo permanente: ninguno se pierde.
 */
export function CalendarScene() {
  const [ledger, setLedger] = useState<DailyLedger | null>(null);
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [records, setRecords] = useState<Record<string, CaseRecord>>({});
  const [downloads, setDownloads] = useState<Record<string, CaseAssetStatus>>({});

  useEffect(() => {
    void syncDailyLedger().then(setLedger);
    fetchCatalog().then(setCatalog, () => undefined);
    void allRecords().then((rs) => setRecords(Object.fromEntries(rs.map((r) => [r.caseId, r]))));
    void allStatuses().then(setDownloads);
  }, []);

  if (!ledger) return <main className={surface.wood} />;
  const today = toCivilDate(new Date());
  const todayIdx = dailyIndexFor(today, ledger.calendarStart);
  const byIndex = new Map(catalog.filter((e) => e.mode === 'daily').map((e) => [e.dailyIndex!, e]));
  const solved = catalog.filter((e) => e.mode === 'daily' && records[e.id]?.status === 'solved').length;
  const todayCase = byIndex.get(todayIdx);
  const days = Array.from({ length: Math.max(0, ledger.highestUnlocked + 1) }, (_, i) => i).reverse();

  return (
    <main className={surface.wood}>
      <div className={`${surface.safe} ${s.layout}`}>
        <aside className={s.side}>
          <BackToDesk label="Escritorio" />
          <div className={`${s.block} ${surface.scene}`}>
            <div className={s.blockHead}>{civilLabel(today, { month: 'long' })}</div>
            <span className={s.blockDay}>{civilLabel(today, { day: 'numeric' })}</span>
            <span className={s.blockWeek}>{civilLabel(today, { weekday: 'long' })}</span>
            <span className={s.blockDaily}>Día {todayIdx + 1} de {DAILY_TOTAL}</span>
          </div>
          <p className={s.progress}>
            Diarios resueltos: {solved} de {DAILY_TOTAL}
            <span className={s.bar} style={{ ['--p' as string]: `${(solved / DAILY_TOTAL) * 100}%` }} />
          </p>
          <p className={s.note}>Tu calendario empezó el {civilLabel(ledger.calendarStart, { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
        </aside>

        <section className={`${s.main} ${surface.scroll}`}>
          <h1 className={s.title}>El caso de hoy</h1>
          {todayCase ? (
            <Link to={`/expediente/${todayCase.id}`} className={s.today} onClick={() => sound.play('tear')}>
              <span className={s.era}>{todayCase.eraLabel}</span>
              <span className={s.caseTitle}>{todayCase.title}</span>
              {todayCase.subtitle && <span className={s.subtitle}>{todayCase.subtitle}</span>}
              <span className={s.meta}>
                {downloads[todayCase.id]?.state === 'verified' ? '✓ En el dispositivo' : 'Guardándose en el dispositivo…'}
              </span>
              {records[todayCase.id] && records[todayCase.id]!.status !== 'unopened' && (
                <span className={s.stamp}>
                  <Stamp tilt={-8}>{STATUS[records[todayCase.id]!.status] ?? ''}</Stamp>
                </span>
              )}
            </Link>
          ) : (
            <p className={s.pending}>El expediente del día {todayIdx + 1} todavía está en redacción. Llegará con una próxima edición del archivo.</p>
          )}

          <h2 className={s.h2}>Días anteriores</h2>
          {days.length <= 1 && <p className={s.note}>Hoy es tu primer día. Los diarios que no juegues pasarán aquí y al archivo; ninguno se pierde.</p>}
          <ul className={s.days}>
            {days
              .filter((i) => i !== todayIdx)
              .map((i) => {
                const e = byIndex.get(i);
                const st = e ? records[e.id]?.status : undefined;
                const date = ledger.unlockedOn[i] ?? addDays(ledger.calendarStart, i);
                const content = (
                  <>
                    <span className={s.dayNum}>Día {i + 1}</span>
                    <span className={s.dayDate}>{civilLabel(date, { day: 'numeric', month: 'short' })}</span>
                    <span className={s.dayTitle}>{e ? e.title : 'En redacción'}</span>
                    <span className={s.dayStatus}>{e ? (st && st !== 'unopened' ? STATUS[st] : 'Sin jugar · en el archivo') : ''}</span>
                  </>
                );
                return (
                  <li key={i}>
                    {e ? (
                      <Link to={`/expediente/${e.id}`} className={s.day} data-status={st ?? 'unopened'}>
                        {content}
                      </Link>
                    ) : (
                      <div className={s.day} data-status="none">
                        {content}
                      </div>
                    )}
                  </li>
                );
              })}
          </ul>
        </section>
      </div>
    </main>
  );
}
