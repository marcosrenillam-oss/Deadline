import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router';
import { CRIME_CATEGORIES, DIFFICULTIES, ERAS, formatCaseNumber, timeLimitMinutes, type CaseFile, type CaseRecord } from '@deadline/core';
import { fetchCatalog, loadCase, type CatalogEntry } from '../../cases/contentRepo.ts';
import { allStatuses, onDownloadStatus } from '../../cases/downloads.ts';
import { onArchiveSync, type SyncState } from '../../cases/startup.ts';
import { syncDailyLedger } from '../../storage/dailyRepo.ts';
import type { CaseAssetStatus } from '../../storage/db.ts';
import { allRecords } from '../../cases/investigationRepo.ts';
import { CRIME_CATEGORY_LABELS, DIFFICULTY_LABELS, ERA_LABELS, ORIGIN_LABELS } from '../../cases/labels.ts';
import { Stamp } from '../../ui/Stamp.tsx';
import { BrassBack } from '../../ui/BrassBack.tsx';
import { sound } from '../../audio/sound.ts';
import { haptic } from '../../audio/haptics.ts';
import s from './ArchiveScene.module.css';

type Shelf = 'all' | 'available' | 'in-progress' | 'solved' | 'archived' | 'locked';
const SHELVES: Array<{ id: Shelf; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'available', label: 'Por abrir' },
  { id: 'in-progress', label: 'En curso' },
  { id: 'solved', label: 'Resueltos' },
  { id: 'archived', label: 'Archivados' },
  { id: 'locked', label: 'Bloqueados' },
];
const STATUS_LABEL: Record<CaseRecord['status'], string> = { unopened: 'Sin abrir', 'in-progress': 'En curso', solved: 'Resuelto', closed: 'Cerrado' };

const fold = (t: string) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

interface Item {
  e: CatalogEntry;
  status: CaseRecord['status'];
  locked: boolean;
  unlockDay?: number;
}

/**
 * BIBLIOTECA: EL ARCHIVO DE CASOS.
 *
 * Una estantería de carpetas en la pared del despacho. Los separadores de
 * cartulina eligen qué baldas se ven (por abrir, en curso, resueltos,
 * archivados, bloqueados); la ficha de índice filtra por época, lugar,
 * crimen y dificultad. Al tocar una carpeta, sale de la estantería y se
 * abre su ficha de presentación: desde ahí se rompe el precinto.
 */
/** Estantería de los expedientes en pareja (se llega desde el teléfono). */
export function CoopShelfScene() {
  return <ArchiveScene coop />;
}

export function ArchiveScene({ coop = false }: { coop?: boolean } = {}) {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<CatalogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<Record<string, CaseRecord>>({});
  const [q, setQ] = useState('');
  const [era, setEra] = useState('');
  const [category, setCategory] = useState('');
  const [place, setPlace] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [mode, setMode] = useState<'' | 'individual' | 'daily'>('');
  const [shelf, setShelf] = useState<Shelf>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dailyUnlocked, setDailyUnlocked] = useState(-1);
  const [downloads, setDownloads] = useState<Record<string, CaseAssetStatus>>({});
  const [sync, setSync] = useState<SyncState>({ running: false, done: 0, total: 0 });
  const [picked, setPicked] = useState<{ item: Item; from: DOMRect } | null>(null);

  useEffect(() => {
    fetchCatalog().then(setCatalog, (e: unknown) => setError(e instanceof Error ? e.message : String(e)));
    void allRecords().then((rs) => setRecords(Object.fromEntries(rs.map((r) => [r.caseId, r]))));
    void allStatuses().then(setDownloads);
    void syncDailyLedger().then((l) => setDailyUnlocked(l.highestUnlocked));
    const offSync = onArchiveSync(setSync);
    const offStatus = onDownloadStatus((id, st) => setDownloads((d) => ({ ...d, [id]: st })));
    return () => {
      offSync();
      offStatus();
    };
  }, []);

  const items = useMemo<Item[]>(() => {
    if (!catalog) return [];
    return catalog
      .filter((e) => (coop ? e.mode === 'coop' : e.mode !== 'coop'))
      .map((e) => {
        const locked = e.mode === 'daily' && (e.dailyIndex ?? 0) > dailyUnlocked;
        return { e, status: records[e.id]?.status ?? 'unopened', locked, ...(locked ? { unlockDay: (e.dailyIndex ?? 0) + 1 } : {}) };
      });
  }, [catalog, records, dailyUnlocked, coop]);

  const places = useMemo(() => [...new Set(items.map((i) => i.e.city))].sort(), [items]);

  const list = useMemo(() => {
    const needle = fold(q.trim());
    return items
      .filter((i) => {
        switch (shelf) {
          case 'available':
            return !i.locked && i.status === 'unopened';
          case 'in-progress':
            return i.status === 'in-progress';
          case 'solved':
            return i.status === 'solved';
          case 'archived':
            return i.status === 'closed';
          case 'locked':
            return i.locked;
          default:
            return true;
        }
      })
      .filter((i) => !mode || i.e.mode === mode)
      .filter((i) => !needle || fold([i.e.title, i.e.subtitle ?? '', formatCaseNumber(i.e.id), i.e.id, i.e.city, i.e.place, i.e.eraLabel, ...i.e.keywords].join(' ')).includes(needle))
      .filter((i) => !era || i.e.era === era)
      .filter((i) => !category || i.e.category === category)
      .filter((i) => !place || i.e.city === place)
      .filter((i) => !difficulty || i.e.difficulty === difficulty)
      .sort((a, b) => Number(a.locked) - Number(b.locked) || (a.e.dailyIndex ?? -1) - (b.e.dailyIndex ?? -1) || a.e.number - b.e.number);
  }, [items, q, shelf, mode, era, category, place, difficulty]);

  const activeFilters = [era, category, place, difficulty, mode].filter(Boolean).length;
  const counts = useMemo(() => Object.fromEntries(SHELVES.map((sh) => [sh.id, items.filter((i) => (sh.id === 'all' ? true : sh.id === 'available' ? !i.locked && i.status === 'unopened' : sh.id === 'in-progress' ? i.status === 'in-progress' : sh.id === 'solved' ? i.status === 'solved' : sh.id === 'archived' ? i.status === 'closed' : i.locked)).length])), [items]);

  const pick = (item: Item, el: HTMLElement) => {
    sound.play('paper');
    haptic('light');
    setPicked({ item, from: el.getBoundingClientRect() });
  };

  const select = (label: string, value: string, set: (v: string) => void, options: readonly string[], labels: Record<string, string>, all = 'Todas') => (
    <label className={s.field}>
      <span>{label}</span>
      <select value={value} onChange={(e) => set(e.target.value)}>
        <option value="">{all}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {labels[o] ?? o}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <main className={`m-room ${s.room}`}>
      <header className={s.header}>
        {coop ? <BrassBack to="/telefono" label="Teléfono" /> : <BrassBack />}
        <h1 className={s.title}>{coop ? 'Expedientes en pareja' : 'Archivo de expedientes'}</h1>
        <label className={s.search}>
          <span className="visually-hidden">Buscar</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Título, nº, lugar, palabra…" />
        </label>
        <button className={s.indexBtn} aria-expanded={filtersOpen} onClick={() => (sound.play('page'), setFiltersOpen((v) => !v))}>
          Ficha de índice{activeFilters ? ` · ${activeFilters}` : ''}
        </button>
      </header>

      <nav className={s.dividers} aria-label="Baldas del archivo">
        {SHELVES.map((sh) => (
          <button key={sh.id} className={s.divider} aria-pressed={shelf === sh.id} onClick={() => (sound.play('page'), setShelf(sh.id))}>
            {sh.label}
            <span className={s.count}>{counts[sh.id] ?? 0}</span>
          </button>
        ))}
      </nav>

      {filtersOpen && (
        <div className={`m-index ${s.index}`} role="group" aria-label="Filtros">
          {select('Época', era, setEra, ERAS, ERA_LABELS)}
          {select('Lugar', place, setPlace, places, Object.fromEntries(places.map((p) => [p, p])), 'Todos')}
          {select('Crimen', category, setCategory, CRIME_CATEGORIES, CRIME_CATEGORY_LABELS, 'Todos')}
          {select('Dificultad', difficulty, setDifficulty, DIFFICULTIES, DIFFICULTY_LABELS)}
          {!coop && (
          <label className={s.field}>
            <span>Tipo</span>
            <select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
              <option value="">Todos</option>
              <option value="individual">Individuales</option>
              <option value="daily">Diarios</option>
            </select>
          </label>
          )}
          {activeFilters > 0 && (
            <button className={s.clear} onClick={() => (setEra(''), setCategory(''), setPlace(''), setDifficulty(''), setMode(''))}>
              Quitar filtros
            </button>
          )}
        </div>
      )}

      <section className={s.shelf} aria-label="Expedientes">
        {error && <p className={s.note}>No se pudo abrir el archivo: {error}</p>}
        {!catalog && !error && <p className={s.note}>Abriendo el archivo…</p>}
        {catalog && list.length === 0 && <p className={s.note}>Ninguna carpeta en esta balda con estos filtros.</p>}
        <ul className={s.folders}>
          {list.map((item, i) => (
            <li key={item.e.id} style={{ '--i': i, '--tilt': `${((item.e.number * 37) % 7) - 3}deg` } as CSSProperties}>
              <Folder item={item} stored={downloads[item.e.id]} picked={picked?.item.e.id === item.e.id} onPick={pick} />
            </li>
          ))}
        </ul>
        <div className={`m-desk-edge ${s.plank}`} aria-hidden="true" />
      </section>

      <p className={s.syncLine} role="status">
        {sync.running
          ? `Guardando el archivo en el dispositivo: ${sync.done} de ${sync.total}…`
          : sync.total && sync.done >= sync.total
            ? `Archivo completo en el dispositivo: ${sync.total} expedientes, también sin conexión.`
            : `${list.length} carpetas en esta balda.`}
      </p>

      {picked && (
        <CaseSheet
          item={picked.item}
          from={picked.from}
          record={records[picked.item.e.id]}
          onClose={() => setPicked(null)}
          coop={coop}
          onOpen={(breakSeal) =>
            coop ? navigate(`/telefono?caso=${picked.item.e.id}`) : navigate(`/expediente/${picked.item.e.id}`, breakSeal ? { state: { breakSeal: true } } : undefined)
          }
        />
      )}
    </main>
  );
}

function Folder({ item, stored, picked, onPick }: { item: Item; stored: CaseAssetStatus | undefined; picked: boolean; onPick: (i: Item, el: HTMLElement) => void }) {
  const { e, status, locked } = item;
  const ref = useRef<HTMLButtonElement>(null);
  const onDevice = stored?.state === 'verified' && stored.contentVersion >= e.contentVersion;
  return (
    <button
      ref={ref}
      className={`m-manila ${s.folder}`}
      data-mode={e.mode}
      data-status={status}
      data-locked={locked || undefined}
      data-picked={picked || undefined}
      onClick={() => ref.current && onPick(item, ref.current)}
      aria-label={`${e.title}. ${e.eraLabel}. ${locked ? `Bloqueado hasta el día ${item.unlockDay}` : STATUS_LABEL[status]}`}
    >
      <span className={s.tab}>{e.mode === 'daily' ? `Diario nº ${(e.dailyIndex ?? 0) + 1}` : formatCaseNumber(e.id)}</span>
      <span className={`m-paper ${s.label}`}>
        <span className={s.era}>{e.eraLabel}</span>
        <span className={s.fTitle}>{e.title}</span>
        <span className={s.place}>{e.city}</span>
      </span>
      <span className={s.meta}>{CRIME_CATEGORY_LABELS[e.category]}</span>
      {locked ? (
        <span className={s.seal} aria-hidden="true">
          Día {item.unlockDay}
        </span>
      ) : (
        status !== 'unopened' && (
          <span className={s.stamp}>
            <Stamp tilt={-10} tone={status === 'solved' ? 'seal' : 'ink'}>
              {STATUS_LABEL[status]}
            </Stamp>
          </span>
        )
      )}
      <span className={s.device}>{onDevice ? '✓ En el dispositivo' : stored?.state === 'downloading' ? 'Guardando…' : 'Se guardará con conexión'}</span>
    </button>
  );
}

/** Ficha de presentación: la carpeta sale de la estantería y se abre. */
function CaseSheet({
  item,
  from,
  record,
  coop,
  onClose,
  onOpen,
}: {
  item: Item;
  from: DOMRect;
  record: CaseRecord | undefined;
  coop: boolean;
  onClose: () => void;
  onOpen: (breakSeal: boolean) => void;
}) {
  const { e, status, locked } = item;
  const [c, setC] = useState<CaseFile | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    void loadCase(e.id).then(setC, () => setC(null));
  }, [e.id]);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const startStyle = {
    '--from-x': `${from.left + from.width / 2 - vw / 2}px`,
    '--from-y': `${from.top + from.height / 2 - vh / 2}px`,
    '--from-s': `${Math.min(from.width / Math.min(vw * 0.86, 760), 0.6)}`,
  } as CSSProperties;
  const opened = status !== 'unopened';
  return (
    <dialog ref={dialog} className={s.sheetDialog} onClose={onClose} onClick={(ev) => ev.target === dialog.current && dialog.current?.close()} aria-labelledby="sheet-title">
      <article className={s.spread} style={startStyle}>
        <div className={`m-manila ${s.leftPage}`}>
          <p className={s.kicker}>
            {e.mode === 'daily' ? `Caso del día nº ${(e.dailyIndex ?? 0) + 1}` : formatCaseNumber(e.id)} · {ORIGIN_LABELS[e.origin]}
          </p>
          <h2 id="sheet-title" className={s.sheetTitle}>
            {e.title}
          </h2>
          {e.subtitle && <p className={s.sheetSubtitle}>{e.subtitle}</p>}
          <p className={s.summary}>{c ? c.briefing.summary : 'Sacando el expediente del archivo…'}</p>
          {c && <p className={s.incident}>{c.briefing.incidentDisplay}</p>}
        </div>
        <div className={`m-paper ${s.rightPage}`}>
          <dl className={s.facts}>
            <div>
              <dt>Época</dt>
              <dd>
                {e.eraLabel} · {ERA_LABELS[e.era]}
              </dd>
            </div>
            <div>
              <dt>Lugar</dt>
              <dd>
                {e.place}, {e.city}
              </dd>
            </div>
            <div>
              <dt>Crimen</dt>
              <dd>{CRIME_CATEGORY_LABELS[e.category]}</dd>
            </div>
            <div>
              <dt>Dificultad</dt>
              <dd>{DIFFICULTY_LABELS[e.difficulty]}</dd>
            </div>
            <div>
              <dt>Tiempo</dt>
              <dd>{c ? `${timeLimitMinutes(c)} minutos desde que rompes el precinto` : '—'}</dd>
            </div>
            {record && record.attempts.length > 0 && (
              <div>
                <dt>Tu historial</dt>
                <dd>
                  {record.attempts.length} intento{record.attempts.length > 1 ? 's' : ''} · mejor puntuación {record.bestScore} · {STATUS_LABEL[status]}
                </dd>
              </div>
            )}
          </dl>
          {coop ? (
            <>
              <p className={s.warn}>Para dos detectives. El reloj empieza cuando elijáis cómo jugarlo: en este iPhone o cada uno en el suyo.</p>
              <button className={s.sealBtn} onClick={() => (sound.play('phone'), haptic('confirm'), onOpen(false))}>
                Investigar en pareja
              </button>
            </>
          ) : locked ? (
            <p className={s.lockedNote}>Este caso del día se desbloquea el día {item.unlockDay} de tu calendario.</p>
          ) : opened ? (
            <button className={s.primary} onClick={() => (sound.play('paper'), onOpen(false))}>
              {status === 'in-progress' ? 'Volver a la investigación' : 'Abrir el expediente'}
            </button>
          ) : (
            <>
              <p className={s.warn}>Al romper el precinto empieza a correr el reloj. Salir de la app o bloquear el iPhone no lo detiene.</p>
              <button className={s.sealBtn} onClick={() => (sound.play('stamp'), haptic('confirm'), onOpen(true))}>
                Romper el precinto
              </button>
            </>
          )}
          <button className={s.secondary} onClick={() => dialog.current?.close()}>
            Devolver a la estantería
          </button>
        </div>
      </article>
    </dialog>
  );
}
