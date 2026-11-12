import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { CRIME_CATEGORIES, DIFFICULTIES, ERAS, ORIGINS, formatCaseNumber, type CaseRecord } from '@deadline/core';
import { fetchCatalog, type CatalogEntry } from '../../cases/contentRepo.ts';
import { allRecords } from '../../cases/investigationRepo.ts';
import { CRIME_CATEGORY_LABELS, DIFFICULTY_LABELS, ERA_LABELS, ORIGIN_LABELS } from '../../cases/labels.ts';
import { BackToDesk } from '../../ui/BackToDesk.tsx';
import { Stamp } from '../../ui/Stamp.tsx';
import { sound } from '../../audio/sound.ts';
import surface from '../../ui/Surface.module.css';
import s from './ArchiveScene.module.css';

type Status = 'all' | 'unopened' | 'in-progress' | 'solved' | 'closed';
const STATUS_LABEL: Record<Exclude<Status, 'all'>, string> = { unopened: 'Sin abrir', 'in-progress': 'En curso', solved: 'Resuelto', closed: 'Cerrado' };

const fold = (t: string) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/**
 * BIBLIOTECA DE EXPEDIENTES. Búsqueda por título, número, lugar y palabras
 * clave; filtros por época, crimen, origen, estado y dificultad. La
 * dificultad solo se conoce (y se filtra) en casos ya abiertos.
 */
export function ArchiveScene() {
  const [catalog, setCatalog] = useState<CatalogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<Record<string, CaseRecord>>({});
  const [q, setQ] = useState('');
  const [era, setEra] = useState('');
  const [category, setCategory] = useState('');
  const [origin, setOrigin] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [status, setStatus] = useState<Status>('all');
  const [linked, setLinked] = useState(false);

  useEffect(() => {
    fetchCatalog().then(setCatalog, (e: unknown) => setError(e instanceof Error ? e.message : String(e)));
    void allRecords().then((rs) => setRecords(Object.fromEntries(rs.map((r) => [r.caseId, r]))));
  }, []);

  const statusOf = (id: string): Exclude<Status, 'all'> => records[id]?.status ?? 'unopened';

  const list = useMemo(() => {
    if (!catalog) return [];
    const needle = fold(q.trim());
    return catalog
      .filter((e) => e.mode === 'individual')
      .filter((e) => !needle || fold([e.title, e.subtitle ?? '', formatCaseNumber(e.id), e.id, e.city, e.place, e.eraLabel, ...e.keywords].join(' ')).includes(needle))
      .filter((e) => !era || e.era === era)
      .filter((e) => !category || e.category === category)
      .filter((e) => !origin || e.origin === origin)
      .filter((e) => !difficulty || (statusOf(e.id) !== 'unopened' && e.difficulty === difficulty))
      .filter((e) => status === 'all' || statusOf(e.id) === status)
      .filter((e) => !linked || e.linkedCaseIds.length > 0)
      .sort((a, b) => a.number - b.number);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, records, q, era, category, origin, difficulty, status, linked]);

  const select = (label: string, value: string, set: (v: string) => void, options: readonly string[], labels: Record<string, string>) => (
    <label className={s.select}>
      <span>{label}</span>
      <select value={value} onChange={(e) => set(e.target.value)}>
        <option value="">Todas</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {labels[o]}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <main className={surface.wood}>
      <div className={`${surface.safe} ${s.layout}`}>
        <aside className={`${s.filters} ${surface.scroll}`} aria-label="Búsqueda y filtros">
          <BackToDesk label="Escritorio" />
          <label className={s.search}>
            <span className="visually-hidden">Buscar</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Título, nº, lugar, palabra…" />
          </label>
          {select('Época', era, setEra, ERAS, ERA_LABELS)}
          {select('Crimen', category, setCategory, CRIME_CATEGORIES, CRIME_CATEGORY_LABELS)}
          {select('Origen', origin, setOrigin, ORIGINS, ORIGIN_LABELS)}
          <label className={s.select}>
            <span>Estado</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
              <option value="all">Todos</option>
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          {select('Dificultad', difficulty, setDifficulty, DIFFICULTIES, DIFFICULTY_LABELS)}
          {difficulty && <p className={s.note}>La dificultad solo se conoce en expedientes ya abiertos.</p>}
          <label className={s.check}>
            <input type="checkbox" checked={linked} onChange={(e) => setLinked(e.target.checked)} />
            Solo expedientes vinculados
          </label>
        </aside>
        <section className={`${s.drawer} ${surface.scroll}`} aria-label="Expedientes">
          {error && <p className={s.note}>No se pudo abrir el archivo: {error}</p>}
          {!catalog && !error && <p className={s.note}>Abriendo el cajón…</p>}
          {catalog && list.length === 0 && <p className={s.note}>Ningún expediente coincide con la búsqueda.</p>}
          <ul className={s.folders}>
            {list.map((e) => {
              const st = statusOf(e.id);
              return (
                <li key={e.id}>
                  <Link to={`/expediente/${e.id}`} className={s.folder} onClick={() => sound.play('paper')}>
                    <span className={s.tab}>{formatCaseNumber(e.id)}</span>
                    <span className={s.era}>{e.eraLabel}</span>
                    <span className={s.title}>{e.title}</span>
                    {e.subtitle && <span className={s.subtitle}>{e.subtitle}</span>}
                    <span className={s.meta}>
                      {CRIME_CATEGORY_LABELS[e.category]} · {ORIGIN_LABELS[e.origin]}
                      {st !== 'unopened' ? ` · ${DIFFICULTY_LABELS[e.difficulty]}` : ''}
                    </span>
                    {st !== 'unopened' && (
                      <span className={s.stamp}>
                        <Stamp tilt={-8} tone={st === 'solved' ? 'seal' : 'ink'}>
                          {STATUS_LABEL[st]}
                        </Stamp>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          {catalog && <p className={s.count}>{list.length} de {catalog.filter((e) => e.mode === 'individual').length} expedientes individuales en el archivo.</p>}
        </section>
      </div>
    </main>
  );
}
