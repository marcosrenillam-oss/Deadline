import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router';
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
  { to: '', label: 'Expediente', end: true },
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
  const urgent = !closed && remainingMs < 5 * 60_000;
  const hintsLeft = inv ? c.maxHints - inv.hintsUsed.length : 0;
  return (
    <main className={surface.wood}>
      <div className={`${surface.safe} ${s.workspace}`}>
        <nav className={s.rail} aria-label="Expediente">
          <div className={s.railTop}>
            <Link to="/" className={s.iconButton} aria-label="Volver al escritorio" onClick={() => sound.play('paper')}>
              ←
            </Link>
            <button
              className={s.clock}
              data-urgent={urgent || undefined}
              role="timer"
              aria-label={closed ? 'Expediente cerrado' : `Tiempo restante ${formatRemaining(remainingMs)}. Tocar para tapar el expediente`}
              disabled={closed}
              onClick={() => setPanel('pause')}
            >
              {closed ? 'CERRADO' : formatRemaining(remainingMs)}
            </button>
          </div>
          {TABS.map((t) => (
            <NavLink key={t.label} to={t.to ? `${base}/${t.to}` : base} end={t.end} className={s.tab} onClick={() => sound.play('page')}>
              {t.label}
              {t.to === 'evidencias' && unread > 0 && !closed && <span className={s.badge}>{unread}</span>}
            </NavLink>
          ))}
          {coop && (
            <button className={`${s.tab} ${s.coopTab}`} onClick={coop.openPanel}>
              {coop.role ? `${coop.role} · ${coop.roleTitle}` : 'Pareja'}
              {coop.session.proposal?.status === 'pending' && coop.session.proposal.from !== coop.role && <span className={s.badge}>!</span>}
            </button>
          )}
          <div className={s.tools}>
            <button className={s.iconButton} onClick={() => setPanel('notes')} aria-label="Libreta" title="Libreta">
              ✎
            </button>
            <button className={s.iconButton} onClick={() => setPanel('contradiction')} aria-label="Señalar una contradicción" title="Contradicción" disabled={closed}>
              ⚡︎
            </button>
            <button className={s.iconButton} onClick={() => setPanel('hints')} aria-label={`Pistas: quedan ${hintsLeft}`} title="Pistas" disabled={closed}>
              ?<span className={s.miniCount}>{hintsLeft}</span>
            </button>
          </div>
          {closed ? (
            <NavLink to={`${base}/informe`} className={`${s.tab} ${s.accuse}`}>
              Informe final
            </NavLink>
          ) : (
            <button className={`${s.tab} ${s.accuse}`} onClick={() => void navigate(`${base}/acusacion`)}>
              {coop ? 'Acusación conjunta' : 'Acusar'}
            </button>
          )}
        </nav>
        <section className={s.stage}>
          <Outlet />
        </section>
      </div>
      <div className={s.toasts} aria-live="polite">
        {toasts.map((t) => (
          <button key={t.id} className={s.toast} data-kind={t.kind} onClick={() => dismiss(t.id)}>
            {t.text}
          </button>
        ))}
      </div>
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

