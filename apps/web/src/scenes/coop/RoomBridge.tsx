import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useCase } from '../../cases/CaseProvider.tsx';
import { receive } from '../../cases/coopRepo.ts';
import type { CoopSession } from '../../cases/coopTypes.ts';
import { RoomLink, type RoomStatus } from '../../cases/room.ts';
import { sound } from '../../audio/sound.ts';
import { haptic } from '../../audio/haptics.ts';

/**
 * Puente con la sala en tiempo real durante la partida: lo que llega del
 * compañero se aplica solo (informes, propuesta, firma); lo que sale lo
 * envía el resto de la app a través de `link`.
 */
export function RoomBridge({
  session,
  setSession,
  linkRef,
  onStatus,
}: {
  session: CoopSession;
  setSession: (s: CoopSession) => void;
  linkRef: { current: RoomLink | null };
  onStatus: (s: RoomStatus, peers?: number) => void;
}) {
  const { c, refresh, notify, base } = useCase();
  const navigate = useNavigate();
  // Siempre la partida más reciente (la propuesta propia cambia la sesión fuera de aquí).
  const latest = useRef(session);
  latest.current = session;
  useEffect(() => {
    if (!session.room) return;
    const link = new RoomLink(
      session.room,
      `${session.me?.n ?? 'yo'}-${session.myRole ?? 'X'}`,
      (code) => {
        void (async () => {
          const r = await receive(c, latest.current, code);
          if (!r.ok) return; // códigos ya aplicados o del saludo inicial: se ignoran en silencio
          latest.current = r.value.session;
          setSession(r.value.session);
          await refresh();
          sound.play('stamp');
          haptic('confirm');
          if (r.value.kind === 'report') notify('info', r.value.added ? `Tu compañero te envía ${r.value.added} elementos: ya están en tu corcho.` : 'Tu compañero te ha escrito.');
          if (r.value.kind === 'propose') {
            notify('info', 'Tu compañero propone una acusación.');
            void navigate(`${base}/acusacion`);
          }
          if (r.value.kind === 'answer') {
            if (r.value.session.status === 'closed') void navigate(`${base}/informe`);
            else notify('info', 'Tu compañero no está de acuerdo con la acusación.');
          }
        })();
      },
      onStatus,
    );
    linkRef.current = link;
    return () => {
      link.close();
      linkRef.current = null;
    };
  }, [session.room, c.id]);
  return null;
}
