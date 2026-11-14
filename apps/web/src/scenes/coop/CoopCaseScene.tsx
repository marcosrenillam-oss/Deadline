import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { CaseProvider } from '../../cases/CaseProvider.tsx';
import { RoomLink, type RoomStatus } from '../../cases/room.ts';
import { RoomBridge } from './RoomBridge.tsx';
import { withdraw as withdrawProposal, answer as answerProposal, getSession, otherRole, propose as proposeAccusation, saveSession } from '../../cases/coopRepo.ts';
import type { CoopApi, CoopSession } from '../../cases/coopTypes.ts';
import { loadCase } from '../../cases/contentRepo.ts';
import { useProfile } from '../../profile/ProfileProvider.tsx';
import { Workspace } from '../case/CaseScene.tsx';
import surface from '../../ui/Surface.module.css';
import { CoopPanel } from './CoopPanel.tsx';
import s from './coop.module.css';

/** Ruta /pareja/:sessionId — el expediente de una partida cooperativa. */
export function CoopCaseScene() {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const { reload: reloadProfile } = useProfile();
  const [session, setSession] = useState<CoopSession | null | undefined>(undefined);
  const [panel, setPanel] = useState(false);
  const [lastCode, setLastCode] = useState<{ code: string; label: string } | null>(null);
  const [passing, setPassing] = useState(false);
  const [generation, setGeneration] = useState(0);
  const room = useRef<RoomLink | null>(null);
  const [roomStatus, setRoomStatus] = useState<{ s: RoomStatus; peers?: number } | null>(null);

  useEffect(() => {
    void getSession(sessionId).then((x) => setSession(x ?? null));
  }, [sessionId]);

  const role = session?.mode === 'same-device' ? session.activeRole : session?.myRole;
  const investigationId = session ? (role ? session.investigationIds[role] : session.investigationIds.shared) : undefined;
  const base = `/pareja/${sessionId}`;

  const api = useMemo<CoopApi | undefined>(() => {
    if (!session) return undefined;
    return {
      session,
      role,
      roleTitle: role ? `${role === 'A' ? 'Papel A' : 'Papel B'}` : 'Compartida',
      propose: async (a) => {
        const out = await proposeAccusation(session, role ?? 'A', a);
        setSession(out.session);
        if (out.code) {
          setLastCode({ code: out.code, label: 'Propuesta de acusación para tu compañero' });
          // Con sala, la propuesta llega sola; sin ella, se abre el panel para enviar el código.
          if (room.current) room.current.send(out.code);
          else setPanel(true);
        }
      },
      answer: async (agree) => {
        const c = await loadCase(session.caseId);
        const out = await answerProposal(c, session, agree);
        setSession(out.session);
        if (out.code) {
          setLastCode({ code: out.code, label: agree ? 'Firma de la acusación para tu compañero' : 'Rechazo para tu compañero' });
          room.current?.send(out.code);
        }
        await reloadProfile();
        setGeneration((g) => g + 1);
        if (!agree && !room.current) setPanel(true);
      },
      openPanel: () => setPanel(true),
      withdraw: async () => {
        setSession(await withdrawProposal(session));
        setLastCode(null);
      },
    };
  }, [session, role, reloadProfile]);

  if (session === undefined) return <main className={surface.wood} />;
  if (session === null) return <Navigate to="/telefono" replace />;
  if (session.status === 'pending') return <Navigate to="/telefono" replace />;

  return (
    <CaseProvider
      key={`${investigationId}-${generation}`}
      caseId={session.caseId}
      {...(investigationId ? { investigationId } : {})}
      base={base}
      {...(api ? { coop: api } : {})}
      fallback={() => <main className={surface.wood} />}
    >
      <Workspace />
      {session.room && <RoomBridge session={session} setSession={setSession} linkRef={room} onStatus={(st, peers) => setRoomStatus({ s: st, peers })} />}
      {session.room && roomStatus && (
        <div className={s.roomBadge} data-status={roomStatus.s} role="status">
          Sala {session.room} · {roomStatus.s === 'online' ? 'conectados' : roomStatus.s === 'connecting' ? 'conectando…' : 'sin conexión, se enviará al volver'}
        </div>
      )}
      <CoopPanel
        deliver={session.room ? (code) => room.current?.send(code) : undefined}
        open={panel}
        onClose={() => setPanel(false)}
        session={session}
        setSession={setSession}
        lastCode={lastCode ?? session.outbox ?? null}
        onPass={() => {
          setPanel(false);
          setPassing(true);
        }}
      />
      {passing && role && (
        <div className={s.pass} role="dialog" aria-modal="true" aria-labelledby="pass-title">
          <p className={s.passKicker}>Mesa compartida</p>
          <h2 id="pass-title" className={s.passTitle}>
            Pasa el iPhone a {otherRole(role)}
          </h2>
          <p className={s.passText}>{role}, no mires: lo que hay en la carpeta de tu compañero es solo suyo hasta que lo ponga sobre la mesa. El reloj sigue corriendo.</p>
          <button
            className={s.primary}
            onClick={async () => {
              const next = await saveSession({ ...session, activeRole: otherRole(role) });
              setSession(next);
              setPassing(false);
              void navigate(base);
            }}
          >
            Soy {otherRole(role)}: continuar
          </button>
        </div>
      )}
    </CaseProvider>
  );
}
