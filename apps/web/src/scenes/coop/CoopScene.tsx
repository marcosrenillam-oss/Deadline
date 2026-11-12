import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import type { CaseFile, InvitePacket } from '@deadline/core';
import { fetchCatalog, loadCase, type CatalogEntry } from '../../cases/contentRepo.ts';
import { acceptInvite, completeHandshake, createInvite, createSameDevice, listSessions, readInvite } from '../../cases/coopRepo.ts';
import type { CoopSession } from '../../cases/coopTypes.ts';
import { BackToDesk } from '../../ui/BackToDesk.tsx';
import { sound } from '../../audio/sound.ts';
import surface from '../../ui/Surface.module.css';
import { CodeBox, PasteBox } from './CodeBox.tsx';
import s from './coop.module.css';

type View =
  | { v: 'list' }
  | { v: 'new' }
  | { v: 'join' }
  | { v: 'host'; session: CoopSession }
  | { v: 'guest-review'; invite: InvitePacket; c: CaseFile }
  | { v: 'guest-ready'; session: CoopSession };

const STATUS: Record<CoopSession['status'], string> = { pending: 'Esperando a tu compañero', active: 'En curso', closed: 'Cerrada' };

/**
 * EL TELÉFONO: investigación en pareja, sin servidor.
 * - Mesa compartida: dos detectives con un solo iPhone.
 * - Correspondencia: cada uno en su iPhone, intercambiando códigos.
 */
export function CoopScene() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>({ v: 'list' });
  const [sessions, setSessions] = useState<CoopSession[]>([]);
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = () => void listSessions().then(setSessions);
  useEffect(() => {
    reload();
    fetchCatalog().then((cat) => setCatalog(cat.filter((e) => e.mode === 'coop')), () => undefined);
  }, []);

  const titleOf = (id: string) => catalog.find((e) => e.id === id)?.title ?? id;
  const go = (v: View) => {
    setError(null);
    sound.play('page');
    setView(v);
  };

  const startTable = async () => {
    if (!picked) return;
    setBusy(true);
    try {
      const sess = await createSameDevice(await loadCase(picked));
      void navigate(`/pareja/${sess.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const startInvite = async (role: 'A' | 'B') => {
    if (!picked) return;
    setBusy(true);
    try {
      const sess = await createInvite(await loadCase(picked), role);
      reload();
      go({ v: 'host', session: sess });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const pickedCase = catalog.find((e) => e.id === picked);

  return (
    <main className={surface.wood}>
      <div className={`${surface.safe} ${s.layout}`}>
        <aside className={s.side}>
          <BackToDesk label="Escritorio" />
          <button className={s.sideButton} aria-pressed={view.v === 'list'} onClick={() => (reload(), go({ v: 'list' }))}>
            Mis partidas
          </button>
          <button className={s.sideButton} aria-pressed={view.v === 'new' || view.v === 'host'} onClick={() => go({ v: 'new' })}>
            Nueva investigación
          </button>
          <button className={s.sideButton} aria-pressed={view.v === 'join' || view.v.startsWith('guest')} onClick={() => go({ v: 'join' })}>
            Unirme con un código
          </button>
        </aside>

        <section className={`${s.main} ${surface.scroll}`}>
          <h1 className={s.title}>Investigación en pareja</h1>
          {error && <p className={s.error}>{error}</p>}

          {view.v === 'list' && (
            <>
              {sessions.length === 0 && <p className={s.hand}>Todavía no has investigado en pareja. Empieza una partida o únete con el código de un compañero.</p>}
              <ul className={s.sessions}>
                {sessions.map((x) => (
                  <li key={x.id}>
                    {x.status === 'pending' && x.host ? (
                      <button className={s.session} onClick={() => go({ v: 'host', session: x })}>
                        <span className={s.sessionTitle}>{titleOf(x.caseId)}</span>
                        <span className={s.small}>Correspondencia · {STATUS[x.status]}</span>
                      </button>
                    ) : (
                      <Link to={`/pareja/${x.id}`} className={s.session}>
                        <span className={s.sessionTitle}>{titleOf(x.caseId)}</span>
                        <span className={s.small}>
                          {x.mode === 'same-device' ? 'Mesa compartida' : `Correspondencia con ${x.partner?.a ?? x.partner?.n ?? '—'} · eres ${x.myRole}`} · {STATUS[x.status]}
                        </span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}

          {view.v === 'new' && (
            <>
              <p className={s.p}>Los expedientes cooperativos están escritos para dos: en los de información dividida, cada uno ve una mitad del caso.</p>
              <div className={s.cases}>
                {catalog.map((e) => (
                  <button key={e.id} className={s.caseCard} aria-pressed={picked === e.id} onClick={() => setPicked(e.id)}>
                    <span className={s.era}>{e.eraLabel}</span>
                    <span className={s.sessionTitle}>{e.title}</span>
                    {e.subtitle && <span className={s.small}>{e.subtitle}</span>}
                  </button>
                ))}
                {catalog.length === 0 && <p className={s.hand}>No hay expedientes cooperativos en tu archivo. Conéctate para actualizarlo.</p>}
              </div>
              {pickedCase && (
                <>
                  <h2 className={s.h2}>En este iPhone</h2>
                  <p className={s.p}>Mesa compartida: os pasáis el teléfono. Cada uno ve solo su carpeta y pone sobre la mesa lo que quiera compartir. Reloj de 120 minutos desde ya.</p>
                  <button className={s.primary} disabled={busy} onClick={() => void startTable()}>
                    Empezar en este iPhone
                  </button>
                  <h2 className={s.h2}>En dos iPhone</h2>
                  <p className={s.p}>
                    Correspondencia: cada uno en su teléfono, sin servidor. Os pasáis códigos por Mensajes, WhatsApp o AirDrop. Elige tu papel; tu compañero tendrá el otro.
                  </p>
                  <div className={s.row}>
                    <button className={s.secondary} disabled={busy} onClick={() => void startInvite('A')}>
                      Seré A · Archivo
                    </button>
                    <button className={s.secondary} disabled={busy} onClick={() => void startInvite('B')}>
                      Seré B · Calle
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {view.v === 'host' && (
            <>
              <h2 className={s.h2}>{titleOf(view.session.caseId)}</h2>
              <p className={s.p}>1 · Envía esta invitación a tu compañero. 2 · Cuando la acepte, te devolverá un código de aceptación: pégalo aquí y empezará vuestra investigación.</p>
              {view.session.inviteCode && <CodeBox code={view.session.inviteCode} label="Invitación" />}
              <PasteBox
                label="Código de aceptación de tu compañero"
                action="Empezar"
                busy={busy}
                onCode={async (code) => {
                  setBusy(true);
                  const r = await completeHandshake(view.session, code);
                  setBusy(false);
                  if (!r.ok) return setError(r.error);
                  void navigate(`/pareja/${r.value.id}`);
                }}
              />
            </>
          )}

          {view.v === 'join' && (
            <PasteBox
              label="Invitación de tu compañero"
              action="Leer invitación"
              busy={busy}
              onCode={async (code) => {
                setBusy(true);
                const r = await readInvite(code);
                setBusy(false);
                if (!r.ok) return setError(r.error);
                go({ v: 'guest-review', invite: r.value.invite, c: r.value.c });
              }}
            />
          )}

          {view.v === 'guest-review' && (
            <>
              <h2 className={s.h2}>{view.c.title}</h2>
              <p className={s.p}>
                Te invita {view.invite.host.a ?? view.invite.host.n}. Tu papel: <strong>{view.invite.hostRole === 'A' ? 'B' : 'A'} · {view.c.coop?.roles.find((r) => r.id !== view.invite.hostRole)?.title}</strong>.
              </p>
              <p className={s.hand}>{view.c.coop?.roles.find((r) => r.id !== view.invite.hostRole)?.briefing}</p>
              <p className={s.p}>Al pulsar «Preparado» empieza el reloj de {view.c.timeLimitMinutes ?? 120} minutos para los dos.</p>
              <button
                className={s.primary}
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  const sess = await acceptInvite(view.invite, view.c);
                  setBusy(false);
                  reload();
                  go({ v: 'guest-ready', session: sess });
                }}
              >
                Preparado
              </button>
            </>
          )}

          {view.v === 'guest-ready' && (
            <>
              <h2 className={s.h2}>{titleOf(view.session.caseId)}</h2>
              <p className={s.p}>El reloj ya corre. Envía este código a tu compañero para que su reloj empiece en el mismo instante.</p>
              {view.session.acceptCode && <CodeBox code={view.session.acceptCode} label="Código de aceptación" />}
              <button className={s.primary} onClick={() => void navigate(`/pareja/${view.session.id}`)}>
                Ir a la mesa
              </button>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
