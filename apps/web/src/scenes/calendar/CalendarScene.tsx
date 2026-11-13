import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { DAILY_TOTAL, addDays, dailyIndexFor, daysBetween, toCivilDate, type CaseRecord, type CivilDate, type DailyLedger } from '@deadline/core';
import { fetchCatalog, type CatalogEntry } from '../../cases/contentRepo.ts';
import { allRecords } from '../../cases/investigationRepo.ts';
import { syncDailyLedger } from '../../storage/dailyRepo.ts';
import { BrassBack } from '../../ui/BrassBack.tsx';
import { Stamp } from '../../ui/Stamp.tsx';
import { sound } from '../../audio/sound.ts';
import { haptic } from '../../audio/haptics.ts';
import { CRIME_CATEGORY_LABELS } from '../../cases/labels.ts';
import s from './CalendarScene.module.css';

const STATUS: Record<string, string> = { 'in-progress': 'En curso', solved: 'Resuelto', closed: 'Cerrado' };
const WEEK = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function civil(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}
const fmt = (date: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('es-ES', o).format(civil(date));

type DayState = 'before' | 'today' | 'solved' | 'played' | 'archived' | 'locked' | 'drafting';

/**
 * EL CALENDARIO: 500 expedientes, uno por día desde el primer arranque.
 * El taco de sobremesa muestra el día elegido (su hoja pasa al cambiar);
 * la hoja del mes sirve para elegir fecha; la tira de abajo son los 500
 * días. Todos los expedientes ya están en el archivo: la fecha solo decide
 * cuándo se abren.
 */
export function CalendarScene() {
  const navigate = useNavigate();
  const [ledger, setLedger] = useState<DailyLedger | null>(null);
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [records, setRecords] = useState<Record<string, CaseRecord>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [month, setMonth] = useState<{ y: number; m: number } | null>(null);
  const [flip, setFlip] = useState(0);

  useEffect(() => {
    void syncDailyLedger().then(setLedger);
    fetchCatalog().then(setCatalog, () => undefined);
    void allRecords().then((rs) => setRecords(Object.fromEntries(rs.map((r) => [r.caseId, r]))));
  }, []);

  const today = toCivilDate(new Date());
  const todayIdx = ledger ? dailyIndexFor(today, ledger.calendarStart) : 0;
  const byIndex = useMemo(() => new Map(catalog.filter((e) => e.mode === 'daily').map((e) => [e.dailyIndex!, e])), [catalog]);

  useEffect(() => {
    if (!ledger) return;
    setSelected((x) => x ?? todayIdx);
    const d = civil(today);
    setMonth((x) => x ?? { y: d.getFullYear(), m: d.getMonth() });
  }, [ledger, today, todayIdx]);

  if (!ledger || selected === null || !month) return <main className="m-room" aria-busy="true" />;

  const stateOf = (i: number): DayState => {
    if (i < 0) return 'before';
    if (i > ledger.highestUnlocked) return 'locked';
    const e = byIndex.get(i);
    if (!e) return 'drafting';
    const st = records[e.id]?.status;
    if (st === 'solved') return 'solved';
    if (st === 'in-progress' || st === 'closed') return 'played';
    return i === todayIdx ? 'today' : 'archived';
  };
  const dateOf = (i: number): CivilDate => (ledger.unlockedOn[i] as CivilDate | undefined) ?? addDays(ledger.calendarStart, i);
  const solved = catalog.filter((e) => e.mode === 'daily' && records[e.id]?.status === 'solved').length;

  const choose = (i: number) => {
    if (i === selected || i < 0 || i >= DAILY_TOTAL) return;
    sound.play('tear');
    haptic('light');
    setFlip((f) => f + 1);
    setSelected(i);
    const d = civil(dateOf(i));
    setMonth({ y: d.getFullYear(), m: d.getMonth() });
  };

  // Hoja del mes
  const first = new Date(month.y, month.m, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(month.y, month.m + 1, 0).getDate();
  const cells = Array.from({ length: offset + daysInMonth }, (_, k) => (k < offset ? null : k - offset + 1));
  const idxForDay = (d: number) => daysBetween(ledger.calendarStart, toCivilDate(new Date(month.y, month.m, d)));

  const e = byIndex.get(selected);
  const st = stateOf(selected);
  const record = e ? records[e.id] : undefined;

  return (
    <main className={`m-room ${s.room}`}>
      <header className={s.header}>
        <BrassBack />
        <h1 className={s.title}>Casos del día</h1>
        <p className={s.started}>Tu calendario empezó el {fmt(ledger.calendarStart, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </header>

      <div className={s.desk}>
        {/* Taco de sobremesa con la hoja del día elegido */}
        <section className={s.block} aria-label="Día elegido">
          <div className={s.rings} aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className={`m-paper ${s.page}`} key={flip} data-flip={flip > 0 || undefined}>
            <div className={s.pageHead}>{fmt(dateOf(selected), { month: 'long', year: 'numeric' })}</div>
            <div className={s.pageDay}>{fmt(dateOf(selected), { day: 'numeric' })}</div>
            <div className={s.pageWeek}>{fmt(dateOf(selected), { weekday: 'long' })}</div>
            <div className={s.pageIdx}>
              Día {selected + 1} de {DAILY_TOTAL}
            </div>
            <div className={s.pageCase}>
              {st === 'locked' ? (
                <p className={s.hand}>Se abre el {fmt(dateOf(selected), { day: 'numeric', month: 'long' })}. El expediente ya está en tu archivo, precintado.</p>
              ) : st === 'drafting' ? (
                <p className={s.hand}>Este expediente todavía está en redacción. Llegará solo con una próxima edición del archivo.</p>
              ) : e ? (
                <>
                  <p className={s.caseEra}>
                    {e.eraLabel} · {CRIME_CATEGORY_LABELS[e.category]}
                  </p>
                  <p className={s.caseTitle}>{e.title}</p>
                  {record && record.status !== 'unopened' && (
                    <span className={s.stamp}>
                      <Stamp tilt={-8} tone={record.status === 'solved' ? 'seal' : 'ink'}>
                        {STATUS[record.status] ?? ''}
                      </Stamp>
                    </span>
                  )}
                  {!record || record.status === 'unopened' ? (
                    <button className={s.seal} onClick={() => (sound.play('stamp'), haptic('confirm'), navigate(`/expediente/${e.id}`, { state: { breakSeal: true } }))}>
                      Romper el precinto
                    </button>
                  ) : (
                    <button className={s.open} onClick={() => (sound.play('paper'), navigate(`/expediente/${e.id}`))}>
                      {record.status === 'in-progress' ? 'Seguir investigando' : 'Abrir el expediente'}
                    </button>
                  )}
                </>
              ) : null}
            </div>
          </div>
          <div className={s.flipNav}>
            <button onClick={() => choose(selected - 1)} disabled={selected <= 0} aria-label="Día anterior">
              ‹
            </button>
            <button onClick={() => choose(todayIdx)} disabled={selected === todayIdx}>
              Hoy
            </button>
            <button onClick={() => choose(selected + 1)} disabled={selected >= DAILY_TOTAL - 1} aria-label="Día siguiente">
              ›
            </button>
          </div>
        </section>

        <div className={s.right}>
        {/* Hoja del mes */}
        <section className={`m-paper ${s.month}`} aria-label="Mes">
          <div className={s.monthHead}>
            <button onClick={() => setMonth({ y: month.m === 0 ? month.y - 1 : month.y, m: month.m === 0 ? 11 : month.m - 1 })} aria-label="Mes anterior">
              ‹
            </button>
            <span>{((t) => t.charAt(0).toUpperCase() + t.slice(1))(new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(first))}</span>
            <button onClick={() => setMonth({ y: month.m === 11 ? month.y + 1 : month.y, m: month.m === 11 ? 0 : month.m + 1 })} aria-label="Mes siguiente">
              ›
            </button>
          </div>
          <div className={s.grid}>
            {WEEK.map((w) => (
              <span key={w} className={s.weekday}>
                {w}
              </span>
            ))}
            {cells.map((d, k) => {
              if (d === null) return <span key={`e${k}`} />;
              const i = idxForDay(d);
              const state = i >= DAILY_TOTAL ? 'before' : stateOf(i);
              return (
                <button
                  key={k}
                  className={s.cell}
                  data-state={state}
                  data-selected={i === selected || undefined}
                  data-today={i === todayIdx || undefined}
                  disabled={state === 'before'}
                  onClick={() => choose(i)}
                  aria-label={`${d}: ${state === 'before' ? 'fuera del calendario' : `día ${i + 1}, ${LABEL[state]}`}`}
                >
                  {d}
                </button>
              );
            })}
          </div>
          <ul className={s.legend}>
            {(['today', 'solved', 'played', 'archived', 'locked'] as const).map((k) => (
              <li key={k} data-state={k}>
                {LABEL[k]}
              </li>
            ))}
          </ul>
        </section>
      {/* Los 500 días */}
        <section className={s.strip} aria-label={`Progreso: ${solved} de ${DAILY_TOTAL} diarios resueltos`}>
          <div className={s.marks} aria-hidden="true">
            {Array.from({ length: DAILY_TOTAL }, (_, i) => (
              <i key={i} data-state={stateOf(i)} data-selected={i === selected || undefined} />
            ))}
          </div>
          <p className={s.stripText}>
            {solved} resueltos · {Math.max(0, ledger.highestUnlocked + 1)} abiertos · {DAILY_TOTAL} en total
          </p>
        </section>
        </div>
      </div>

    </main>
  );
}

const LABEL: Record<DayState, string> = {
  before: '',
  today: 'hoy, sin abrir',
  solved: 'resuelto',
  played: 'jugado',
  archived: 'sin jugar, en el archivo',
  locked: 'precintado',
  drafting: 'en redacción',
};
