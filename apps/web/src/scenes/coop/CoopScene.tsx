import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import type { CaseFile, InvitePacket } from '@deadline/core';
import { fetchCatalog, loadCase, portraitUrl, type CatalogEntry } from '../../cases/contentRepo.ts';
import { formatCaseNumber, timeLimitMinutes } from '@deadline/core';
import { CRIME_CATEGORY_LABELS, DIFFICULTY_LABELS } from '../../cases/labels.ts';
import { Portrait } from '../../ui/Portrait.tsx';
import { acceptInvite, completeHandshake, createInvite, createSameDevice, listSessions, readInvite, saveSession } from '../../cases/coopRepo.ts';
import { RoomLink, newRoomCode, normalizeRoomCode, type RoomStatus } from '../../cases/room.ts';
import { getInvestigation } from '../../cases/investigationRepo.ts';
import type { CoopSession } from '../../cases/coopTypes.ts';
import { BackToDesk } from '../../ui/BackToDesk.tsx';
import { sound } from '../../audio/sound.ts';
import surface from '../../ui/Surface.module.css';
import { CodeBox, PasteBox } from './CodeBox.tsx';
import s from './coop.module.css';
import { Ambience } from '../../ui/Ambience.tsx';

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
  const [roomInput, setRoomInput] = useState('');
  const [roomState, setRoomState] = useState<RoomStatus | null>(null);
  const link = useRef<RoomLink | null>(null);
  const joinedRoom = useRef<string | null>(null);
  useEffect(() => () => link.current?.close(), []);

  /** Partidas abiertas cuyo reloj ya se agotó (se cierran del todo al abrirlas). */
  const [expired, setExpired] = useState<Set<string>>(new Set());
  const reload = () =>
    void listSessions().then(async (list) => {
      setSessions(list);
      const now = Date.now();
      const out = new Set<string>();
      for (const x of list) {
        if (x.status !== 'active') continue;
        const id = x.investigationIds.shared ?? x.investigationIds[x.myRole ?? 'A'] ?? x.investigationIds.A;
        const inv = id ? await getInvestigation(id) : undefined;
        if (inv && inv.status === 'active' && inv.deadlineAt <= now) out.add(x.id);
        else if (inv && inv.status === 'expired') out.add(x.id);
      }
      setExpired(out);
    });
  // Vuelta desde la estantería con un expediente elegido: /telefono?caso=DL-C-0001
  const [params] = useSearchParams();
  useEffect(() => {
    const caso = params.get('caso');
    if (caso) {
      setPicked(caso);
      setView({ v: 'new' });
    }
  }, [params]);

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
      const created = await createInvite(await loadCase(picked), role);
      // Sala en tiempo real: la invitación viaja sola; el compañero solo escribe el código de sala.
      const sess = await saveSession({ ...created, room: newRoomCode() });
      reload();
      go({ v: 'host', session: sess });
      openHostRoom(sess);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const openHostRoom = (sess: CoopSession) => {
    link.current?.close();
    if (!sess.room) return;
    link.current = new RoomLink(
      sess.room,
      `${sess.me?.n ?? 'host'}-host`,
      (code) => {
        void completeHandshake(sess, code).then((r) => {
          if (r.ok) {
            sound.play('phone');
            void navigate(`/pareja/${r.value.id}`);
          }
        });
      },
      setRoomState,
    );
    if (sess.inviteCode) link.current.send(sess.inviteCode);
  };

  const joinRoom = (raw: string) => {
    const code = normalizeRoomCode(raw);
    if (code.length < 4) return setError('Escribe el código de la sala que te ha dado tu compañero.');
    setError(null);
    link.current?.close();
    joinedRoom.current = code;
    link.current = new RoomLink(
      code,
      `guest-${Math.random().toString(36).slice(2, 8)}`,
      (incoming) => {
        void readInvite(incoming).then((r) => {
          if (r.ok) go({ v: 'guest-review', invite: r.value.invite, c: r.value.c });
        });
      },
      setRoomState,
    );
  };

  const pickedCase = catalog.find((e) => e.id === picked);
  const [pickedFile, setPickedFile] = useState<CaseFile | null>(null);
  useEffect(() => {
    setPickedFile(null);
    if (picked) void loadCase(picked).then(setPickedFile, () => setPickedFile(null));
  }, [picked]);

  return (
    <main className={surface.wood}>
      <Ambience />
      <div className={`${surface.safe} ${s.layout}`}>
        <aside className={s.side}>
          <BackToDesk label="Escritorio" />
          <button className={s.sideButton} aria-pressed={view.v === 'list'} onClick={() => (reload(), go({ v: 'list' }))}>
            Mis partidas
          </button>
          <button
            className={s.sideButton}
            aria-pressed={view.v === 'new' || view.v === 'host'}
            onClick={() => (picked ? go({ v: 'new' }) : (sound.play('paper'), void navigate('/telefono/expedientes')))}
          >
            Nueva investigación
          </button>
          <button className={s.sideButton} aria-pressed={view.v === 'join' || view.v.startsWith('guest')} onClick={() => go({ v: 'join' })}>
            Unirme a una sala
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
                      <button className={s.session} onClick={() => (go({ v: 'host', session: x }), openHostRoom(x))}>
                        <span className={s.sessionTitle}>{titleOf(x.caseId)}</span>
                        <span className={s.small}>Correspondencia · {STATUS[x.status]}</span>
                      </button>
                    ) : (
                      <Link to={`/pareja/${x.id}`} className={s.session}>
                        <span className={s.sessionTitle}>{titleOf(x.caseId)}</span>
                        <span className={s.small}>
                          {x.mode === 'same-device' ? 'Mesa compartida' : `Correspondencia con ${x.partner?.a ?? x.partner?.n ?? '—'} · eres ${x.myRole}`} ·{' '}
                          {expired.has(x.id) ? 'Tiempo agotado: cooperativa incompleta' : STATUS[x.status]}
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
              <button className={s.secondary} onClick={() => (sound.play('paper'), void navigate('/telefono/expedientes'))}>
                {pickedCase ? 'Elegir otro expediente en la estantería' : 'Elegir expediente en la estantería'}
              </button>
              {pickedCase && (
                <article className={`m-manila ${s.ficha}`} aria-label={`Ficha de ${pickedCase.title}`}>
                  <p className={s.era}>
                    {formatCaseNumber(pickedCase.id)} · {pickedCase.eraLabel} · {DIFFICULTY_LABELS[pickedCase.difficulty]}
                  </p>
                  <h2 className={s.fichaTitle}>{pickedCase.title}</h2>
                  <p className={s.p}>{pickedFile ? pickedFile.briefing.summary : 'Sacando el expediente del archivo…'}</p>
                  {pickedFile && (
                    <>
                      <p className={s.small}>
                        {CRIME_CATEGORY_LABELS[pickedCase.category]} · {pickedCase.place}, {pickedCase.city} · {timeLimitMinutes(pickedFile)} minutos para los dos
                      </p>
                      <ul className={s.faces} aria-label="Personas del caso">
                        {pickedFile.characters
                          .filter((ch) => ch.role !== 'investigator')
                          .map((ch) => (
                            <li key={ch.id}>
                              <Portrait character={ch} size={44} src={portraitUrl(pickedFile, ch)} />
                              <span>{ch.name}</span>
                            </li>
                          ))}
                      </ul>
                    </>
                  )}
                </article>
              )}
              {pickedCase && (
                <div className={s.room}>
                  <div className={s.station} data-role="shared">
                    <span className={s.stationLamp} aria-hidden="true" />
                    <span className={s.stationTag}>Mesa compartida</span>
                    <h2 className={s.h2}>En este iPhone</h2>
                    <p className={s.p}>Os pasáis el teléfono. Cada uno ve solo su carpeta y pone sobre la mesa lo que quiera compartir. Reloj de 120 minutos desde ya.</p>
                    <button className={s.primary} disabled={busy} onClick={() => void startTable()}>
                      Empezar en este iPhone
                    </button>
                  </div>
                  <div className={s.pair}>
                    <div className={s.station} data-role="A">
                      <span className={s.stationLamp} aria-hidden="true" />
                      <span className={s.stationTag}>Puesto A · Archivo</span>
                      <p className={s.p}>Documentos, registros y expedientes antiguos.</p>
                      <button className={s.secondary} disabled={busy} onClick={() => void startInvite('A')}>
                        Seré A
                      </button>
                    </div>
                    <svg className={s.wire} viewBox="0 0 80 60" aria-hidden="true">
                      <path d="M0 30 C 20 0, 60 60, 80 30" />
                    </svg>
                    <div className={s.station} data-role="B">
                      <span className={s.stationLamp} aria-hidden="true" />
                      <span className={s.stationTag}>Puesto B · Calle</span>
                      <p className={s.p}>Testigos, escenas y lo que se ve a pie de calle.</p>
                      <button className={s.secondary} disabled={busy} onClick={() => void startInvite('B')}>
                        Seré B
                      </button>
                    </div>
                  </div>
                  <p className={s.small}>
                    En dos iPhone, sin servidor ni conexión en tiempo real: os pasáis códigos por Mensajes, WhatsApp o AirDrop. Elige tu puesto; tu compañero tendrá el otro.
                  </p>
                </div>
              )}
            </>
          )}

          {view.v === 'host' && (
            <>
              <h2 className={s.h2}>{titleOf(view.session.caseId)}</h2>
              {view.session.room && (
                <div className={s.roomCard}>
                  <span className={s.era}>Sala en tiempo real</span>
                  <span className={s.roomCode}>{view.session.room}</span>
                  <p className={s.p}>
                    Dile este código a tu compañero: en su teléfono, «Unirme a una sala». La partida empieza sola cuando entre.{' '}
                    {roomState === 'online' ? 'Sala abierta, esperando…' : roomState === 'offline' ? 'Sin conexión: usa los códigos de abajo.' : 'Abriendo la sala…'}
                  </p>
                </div>
              )}
              <p className={s.p}>Sin conexión: 1 · Envía esta invitación a tu compañero. 2 · Cuando la acepte, te devolverá un código de aceptación: pégalo aquí y empezará vuestra investigación.</p>
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
            <form
              className={s.roomCard}
              onSubmit={(e) => {
                e.preventDefault();
                joinRoom(roomInput);
              }}
            >
              <label className={s.era} htmlFor="room-code">
                Unirme a una sala
              </label>
              <input id="room-code" className={s.roomInput} value={roomInput} onChange={(e) => setRoomInput(normalizeRoomCode(e.target.value))} placeholder="K7P2QX" autoCapitalize="characters" autoCorrect="off" maxLength={8} />
              <button className={s.primary} disabled={roomInput.length < 4}>
                Entrar en la sala
              </button>
              {roomState && <p className={s.small}>{roomState === 'online' ? 'Dentro de la sala: esperando la invitación…' : roomState === 'offline' ? 'Sin conexión con la sala.' : 'Conectando…'}</p>}
            </form>
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
                  let sess = await acceptInvite(view.invite, view.c);
                  if (joinedRoom.current && link.current) {
                    sess = await saveSession({ ...sess, room: joinedRoom.current });
                    if (sess.acceptCode) link.current.send(sess.acceptCode);
                    setBusy(false);
                    sound.play('phone');
                    void navigate(`/pareja/${sess.id}`);
                    return;
                  }
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
