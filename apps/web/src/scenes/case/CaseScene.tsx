import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router';
import { formatCaseNumber, formatRemaining } from '@deadline/core';
import { CaseProvider, useCase } from '../../cases/CaseProvider.tsx';
import { CRIME_CATEGORY_LABELS, ORIGIN_LABELS } from '../../cases/labels.ts';
import { sound } from '../../audio/sound.ts';
import { Stamp } from '../../ui/Stamp.tsx';
import surface from '../../ui/Surface.module.css';
import { NotebookPanel } from './NotebookPanel.tsx';
import { ContradictionTool } from './ContradictionTool.tsx';
import { HintsPanel } from './HintsPanel.tsx';
import s from './case.module.css';
import sh from './shell.module.css';
import { PocketWatch, tensionOf } from './PocketWatch.tsx';
import { DiscoveryLayer, EnvelopeIcon, FinalMinute, LensIcon, NotebookIcon, PhoneIcon, TimeUp } from './CaseObjects.tsx';

/** Ruta /expediente/:caseId — carga el expediente y muestra portada o espacio de trabajo. */
export function CaseScene() {
  const { caseId = '' } = useParams();
  return (
    <CaseProvider
      caseId={caseId}
      fallback={(st) => (
        <main className={surface.wood}>
          <div className={`${surface.safe} ${s.center}`}>
            <div className={`${surface.paper} ${s.notice}`}>
              {st.status === 'loading' ? (
                <p className={s.typed}>Sacando el expediente del archivo…</p>
              ) : (
                <>
                  <p className={s.typed}>{st.message}</p>
                  <Link to="/archivo" className={s.link}>
                    Volver al archivo
                  </Link>
                </>
              )}
            </div>
          </div>
        </main>
      )}
    >
      <CaseBody />
    </CaseProvider>
  );
}

function CaseBody() {
  const { inv, base } = useCase();
  return inv ? <Workspace /> : <Cover />;
}

/** Portada precintada: la dificultad no se muestra hasta abrirlo. */
function Cover() {
  const { c, open, base } = useCase();
  const [busy, setBusy] = useState(false);
  const location = useLocation();
  // Desde la ficha de la biblioteca ya se ha confirmado: se rompe el precinto al llegar.
  const breakSeal = (location.state as { breakSeal?: boolean } | null)?.breakSeal === true;
  const started = useRef(false);
  useEffect(() => {
    if (!breakSeal || started.current) return;
    started.current = true;
    setBusy(true);
    void open().finally(() => setBusy(false));
  }, [breakSeal, open]);
  if (breakSeal) return <main className={surface.wood} aria-busy="true" />;
  return (
    <main className={surface.wood}>
      <div className={`${surface.safe} ${s.coverLayout}`}>
        <Link to="/archivo" className={s.backLink}>
          ← Archivo
        </Link>
        <article className={`${surface.paper} ${surface.scene} ${s.cover}`} aria-labelledby="cover-title">
          <div className={s.coverTab}>{formatCaseNumber(c.id)}</div>
          <p className={s.kicker}>
            {c.eraLabel} · {CRIME_CATEGORY_LABELS[c.category]}
          </p>
          <h1 id="cover-title" className={s.coverTitle}>
            {c.title}
          </h1>
          {c.subtitle && <p className={s.coverSubtitle}>{c.subtitle}</p>}
          <p className={s.coverMeta}>
            {c.location.place} · {c.briefing.incidentDisplay}
          </p>
          <div className={s.coverStamps}>
            <Stamp tilt={-5}>{ORIGIN_LABELS[c.origin]}</Stamp>
            <Stamp tilt={3} tone="ink">
              Precintado
            </Stamp>
          </div>
          <p className={s.coverWarn}>
            Al romper el precinto empieza a correr el reloj: {c.timeLimitMinutes ?? 60} minutos. Salir de la app o bloquear el iPhone no lo detiene.
          </p>
          <button
            className={s.sealButton}
            disabled={busy}
            onClick={() => {
              setBusy(true);
              void open().finally(() => setBusy(false));
            }}
          >
            Romper el precinto y abrir
          </button>
        </article>
      </div>
    </main>
  );
}

const TABS = [
  { to: '', label: 'Corcho', end: true },
  { to: 'expediente', label: 'Expediente' },
  { to: 'evidencias', label: 'Evidencias' },
  { to: 'personas', label: 'Personas' },
  { to: 'cronologia', label: 'Cronología' },
  { to: 'tablero', label: 'Tablero' },
];

export function Workspace() {
  const { c, inv, k, closed, remainingMs, toasts, dismiss, base, coop } = useCase();
  const navigate = useNavigate();
  const [panel, setPanel] = useState<'notes' | 'contradiction' | 'hints' | 'pause' | null>(null);
  const unread = c.evidence.filter((e) => k.evidence.has(e.id) && !k.examined.has(e.id)).length;
  const hintsLeft = inv ? c.maxHints - inv.hintsUsed.length : 0;
  const totalMs = inv ? inv.deadlineAt - inv.startedAt : 1;
  const tension = tensionOf(remainingMs, closed);
  const expired = inv?.status === 'expired';
  const quiet = toasts.filter((t) => !['evidence', 'contradiction', 'deduction', 'secret'].includes(t.kind));
  const location = useLocation();
  // Cerrado es cerrado: solo queda el informe final (y reabrir, si se puede).
  if (closed && !location.pathname.endsWith('/informe')) return <Navigate to={`${base}/informe`} replace />;
  if (closed) {
    return (
      <main className={`m-room ${sh.room}`} data-tension="closed">
        <header className={sh.bar}>
          <Link to="/" className={`m-brass ${sh.back}`} aria-label="Volver al escritorio" onClick={() => sound.play('paper')}>
            ←
          </Link>
          <nav className={sh.tabs} aria-label="Expediente">
            <span className={`${sh.tab} active`}>Informe final</span>
          </nav>
          <PocketWatch remainingMs={0} totalMs={1} closed onClick={() => undefined} />
        </header>
        <section className={`m-manila ${sh.folder}`}>
          <div className={sh.stage}>
            <Outlet />
          </div>
        </section>
        <TimeUp trigger={expired} />
      </main>
    );
  }
  return (
    <main className={`m-room ${sh.room}`} data-tension={tension}>
      <header className={sh.bar}>
        <Link to="/" className={`m-brass ${sh.back}`} aria-label="Volver al escritorio" onClick={() => sound.play('paper')}>
          ←
        </Link>
        <nav className={sh.tabs} aria-label="Expediente">
          {TABS.map((t) => (
            <NavLink key={t.label} to={t.to ? `${base}/${t.to}` : base} end={t.end} className={sh.tab} onClick={() => sound.play('page')}>
              {t.label}
              {t.to === 'evidencias' && unread > 0 && !closed && <span className={sh.badge}>{unread}</span>}
            </NavLink>
          ))}
        </nav>
        <div className={sh.tools}>
          {coop && (
            <button className={sh.tool} onClick={coop.openPanel} aria-label={coop.role ? `${coop.role} · ${coop.roleTitle}` : 'Pareja'}>
              <PhoneIcon />
              <span className={sh.toolLabel}>{coop.role ? `Papel ${coop.role}` : 'Pareja'}</span>
              {coop.session.proposal?.status === 'pending' && coop.session.proposal.from !== coop.role && <span className={sh.badge}>!</span>}
            </button>
          )}
          <button className={sh.tool} onClick={() => (sound.play('page'), setPanel('notes'))} aria-label="Libreta">
            <NotebookIcon />
            <span className={sh.toolLabel}>Libreta</span>
          </button>
          <button className={sh.tool} onClick={() => (sound.play('tap'), setPanel('contradiction'))} aria-label="Señalar una contradicción" disabled={closed}>
            <LensIcon />
            <span className={sh.toolLabel}>Contradecir</span>
          </button>
          <button className={sh.tool} onClick={() => (sound.play('paper'), setPanel('hints'))} aria-label={`Pistas: quedan ${hintsLeft}`} disabled={closed}>
            <EnvelopeIcon />
            <span className={sh.toolLabel}>Pistas ({hintsLeft})</span>
          </button>
          {closed ? (
            <NavLink to={`${base}/informe`} className={sh.seal}>
              Informe final
            </NavLink>
          ) : (
            <button className={sh.seal} onClick={() => (sound.play('stamp'), void navigate(`${base}/acusacion`))}>
              {coop ? 'Acusación conjunta' : 'Acusar'}
            </button>
          )}
        </div>
        <PocketWatch remainingMs={remainingMs} totalMs={totalMs} closed={closed} onClick={() => setPanel('pause')} />
      </header>
      <section className={`m-manila ${sh.folder}`}>
        <div className={sh.stage}>
          <Outlet />
        </div>
      </section>
      <div className={s.toasts} aria-live="polite">
        {quiet.map((t) => (
          <button key={t.id} className={s.toast} data-kind={t.kind} onClick={() => dismiss(t.id)}>
            {t.text}
          </button>
        ))}
        {toasts
          .filter((t) => !quiet.includes(t))
          .map((t) => (
            <span key={t.id} className="visually-hidden">
              {t.text}
            </span>
          ))}
      </div>
      <DiscoveryLayer toasts={toasts} />
      <FinalMinute active={tension === 'final'} />
      <TimeUp trigger={expired} />
      <NotebookPanel open={panel === 'notes'} onClose={() => setPanel(null)} caseId={c.id} />
      <ContradictionTool open={panel === 'contradiction'} onClose={() => setPanel(null)} />
      <HintsPanel open={panel === 'hints'} onClose={() => setPanel(null)} />
      {panel === 'pause' && (
        <div className={s.pause} role="dialog" aria-modal="true" aria-labelledby="pause-title">
          <p className={s.pauseKicker}>Expediente tapado</p>
          <h2 id="pause-title" className={s.pauseTime}>
            {formatRemaining(remainingMs)}
          </h2>
          <p className={s.pauseText}>Tapar la carpeta no detiene el reloj: el tiempo sigue corriendo aunque no mires, salgas de la app o bloquees el iPhone.</p>
          <button className={s.primary} onClick={() => setPanel(null)} autoFocus>
            Destapar y seguir
          </button>
        </div>
      )}
    </main>
  );
}

