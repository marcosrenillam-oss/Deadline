import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router';
import { REOPEN_COST, formatCaseNumber, type CaseCatalogEntry, type CaseRecord, type Investigation } from '@deadline/core';
import { fetchCatalog } from '../../cases/contentRepo.ts';
import { listSessions } from '../../cases/coopRepo.ts';
import { getDB } from '../../storage/db.ts';
import { BrassBack } from '../../ui/BrassBack.tsx';
import { Stamp } from '../../ui/Stamp.tsx';
import { sound } from '../../audio/sound.ts';
import { haptic } from '../../audio/haptics.ts';
import { formatDuration } from '../../cases/labels.ts';
import s from './PersonalArchiveScene.module.css';
import { Ambience } from '../../ui/Ambience.tsx';

type Drawer = 'solved' | 'closed' | 'failed' | 'reopen';
const DRAWERS: Array<{ id: Drawer; label: string; hint: string }> = [
  { id: 'solved', label: 'Resueltos', hint: 'Expedientes con acusación aceptada.' },
  { id: 'closed', label: 'Cerrados', hint: 'Se agotó el tiempo sin acusación.' },
  { id: 'failed', label: 'Fallidos', hint: 'La acusación no se sostuvo.' },
  { id: 'reopen', label: 'Reabribles', hint: 'Puedes volver a abrirlos: la primera vez, gratis.' },
];
const OUTCOME: Record<string, string> = { success: 'Resuelto', partial: 'Resuelto a medias', failure: 'Acusación fallida', expired: 'Cerrado por tiempo' };

interface Row {
  e: CaseCatalogEntry;
  record: CaseRecord;
  last: Investigation | undefined;
  attempts: Investigation[];
  /** Ruta del informe si no es la del expediente individual (partidas en pareja). */
  report?: string;
}

/**
 * ARCHIVO PERSONAL: el archivador del despacho. Cuatro cajones con tus
 * investigaciones según cómo terminaron; los reabribles se distinguen con
 * una ficha roja y su coste.
 */
export function PersonalArchiveScene() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [drawer, setDrawer] = useState<Drawer>('solved');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const db = await getDB();
      const [catalog, records, invs] = await Promise.all([fetchCatalog().catch(() => db.getAll('catalog')), db.getAll('caseRecords'), db.getAll('investigations')]);
      const byCase = new Map<string, Investigation[]>();
      for (const i of invs) byCase.set(i.caseId, [...(byCase.get(i.caseId) ?? []), i]);
      const sessions = await listSessions();
      const out: Row[] = [];
      for (const r of records) {
        const e = catalog.find((x) => x.id === r.caseId);
        if (!e) continue;
        const attempts = (byCase.get(r.caseId) ?? []).sort((a, b) => b.attempt - a.attempt);
        const last = attempts[0];
        // Partidas en pareja: el informe vive en su mesa (/pareja/<sesión>/informe).
        const session = e.mode === 'coop' && last ? sessions.find((x) => Object.values(x.investigationIds).includes(last.id)) : undefined;
        out.push({ e, record: r, last, attempts, ...(session ? { report: `/pareja/${session.id}/informe` } : {}) });
      }
      setRows(out);
    })();
  }, []);

  const inDrawer = (row: Row, d: Drawer): boolean => {
    const active = row.last?.status === 'active';
    const outcome = row.last?.result?.outcome;
    switch (d) {
      case 'solved':
        return row.record.status === 'solved';
      case 'closed':
        return !active && outcome === 'expired';
      case 'failed':
        return !active && outcome === 'failure';
      case 'reopen':
        return !active && !!row.last?.result && row.e.mode !== 'coop';
    }
  };
  const counts = useMemo(() => Object.fromEntries(DRAWERS.map((d) => [d.id, rows?.filter((r) => inDrawer(r, d.id)).length ?? 0])), [rows]);
  const list = (rows ?? []).filter((r) => inDrawer(r, drawer)).sort((a, b) => (b.last?.closedAt ?? 0) - (a.last?.closedAt ?? 0));

  return (
    <main className={`m-room ${s.room}`}>
      <Ambience />
      {/* El archivo central se pierde al fondo: filas de archivadores sin fin */}
      <div className={s.endless} aria-hidden="true" />
      <header className={s.header}>
        <BrassBack />
        <h1 className={s.title}>Archivo personal</h1>
      </header>
      <div className={s.body}>
        {/* El archivador */}
        <nav className={`m-steel ${s.cabinet}`} aria-label="Cajones del archivo">
          {DRAWERS.map((d) => (
            <button
              key={d.id}
              className={`m-steel ${s.drawer}`}
              aria-pressed={drawer === d.id}
              onClick={() => {
                if (d.id === drawer) return;
                sound.play('paper');
                haptic('light');
                setDrawer(d.id);
                setExpanded(null);
              }}
            >
              <span className={`m-brass ${s.holder}`}>
                <span className={s.card}>{d.label}</span>
              </span>
              <span className={s.handle} aria-hidden="true" />
              <span className={s.drawerCount}>{counts[d.id]}</span>
            </button>
          ))}
        </nav>

        {/* Contenido del cajón abierto */}
        <section className={s.contents} key={drawer} aria-label={DRAWERS.find((d) => d.id === drawer)!.label}>
          <p className={s.hint}>{DRAWERS.find((d) => d.id === drawer)!.hint}</p>
          {rows && list.length === 0 && <p className={s.empty}>Este cajón está vacío.</p>}
          <ul className={s.files}>
            {list.map((row, i) => {
              const r = row.last?.result;
              const reopens = row.record.reopens ?? 0;
              const cost = reopens === 0 ? 0 : REOPEN_COST[row.e.difficulty];
              return (
                <li key={row.e.id} style={{ '--i': i } as CSSProperties}>
                  <article className={`m-manila ${s.file}`} data-drawer={drawer}>
                    <header className={s.fileHead}>
                      <span className={s.num}>{row.e.mode === 'daily' ? `Diario nº ${(row.e.dailyIndex ?? 0) + 1}` : formatCaseNumber(row.e.id)}</span>
                      <span className={s.era}>
                        {row.e.eraLabel}
                        {row.e.mode === 'coop' ? ' · En pareja' : ''}
                      </span>
                    </header>
                    <h2 className={s.fileTitle}>{row.e.title}</h2>
                    {r && (
                      <span className={s.stamp}>
                        <Stamp tilt={-9} tone={r.outcome === 'success' || r.outcome === 'partial' ? 'seal' : 'ink'}>
                          {OUTCOME[r.outcome] ?? ''}
                        </Stamp>
                      </span>
                    )}
                    <dl className={s.data}>
                      <div>
                        <dt>Intentos</dt>
                        <dd>{row.attempts.length}</dd>
                      </div>
                      <div>
                        <dt>Mejor</dt>
                        <dd>{row.record.bestScore} pts</dd>
                      </div>
                      {r && (
                        <div>
                          <dt>Último</dt>
                          <dd>
                            {new Date(row.last!.closedAt ?? row.last!.startedAt).toLocaleDateString('es-ES')} · {formatDuration(r.elapsedMs)}
                          </dd>
                        </div>
                      )}
                    </dl>
                    {drawer === 'reopen' && <p className={s.reopen}>{cost === 0 ? 'Primera reapertura: gratis' : `Reabrir: ${cost} puntos`}</p>}
                    <div className={s.actions}>
                      <button className={s.link} onClick={() => (sound.play('paper'), navigate(row.report ?? `/expediente/${row.e.id}/informe`))}>
                        {drawer === 'reopen' ? 'Reabrir o ver informe' : 'Ver informe'}
                      </button>
                      {row.attempts.length > 1 && (
                        <button className={s.link} aria-expanded={expanded === row.e.id} onClick={() => setExpanded(expanded === row.e.id ? null : row.e.id)}>
                          Intentos
                        </button>
                      )}
                    </div>
                    {expanded === row.e.id && (
                      <ol className={s.attempts} reversed>
                        {row.attempts.map((a) => (
                          <li key={a.id}>
                            Intento {a.attempt} · {new Date(a.startedAt).toLocaleDateString('es-ES')} · {a.result ? `${OUTCOME[a.result.outcome]} · ${a.result.total} pts` : 'en curso'}
                          </li>
                        ))}
                      </ol>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
