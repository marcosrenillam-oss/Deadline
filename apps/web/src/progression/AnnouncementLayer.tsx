import { useEffect, useRef, useState } from 'react';
import { onAnnounce, type Announcement } from './announcements.ts';
import { sound } from '../audio/sound.ts';
import { haptic } from '../audio/haptics.ts';
import { useProfile } from '../profile/ProfileProvider.tsx';
import s from './AnnouncementLayer.module.css';

const KICKER: Record<Announcement['kind'], string> = { achievement: 'Logro', rank: 'Ascenso', cosmetic: 'Oficina' };
const SHOW_MS = 6500;

/** Tiras de papel mecanografiadas que anuncian logros y ascensos, de una en una. */
export function AnnouncementLayer() {
  const { reload } = useProfile();
  const [queue, setQueue] = useState<Array<Announcement & { id: number }>>([]);
  const seq = useRef(0);

  useEffect(
    () =>
      onAnnounce((a) => {
        setQueue((q) => [...q, { ...a, id: ++seq.current }]);
        void reload();
      }),
    [reload],
  );

  const current = queue[0];
  useEffect(() => {
    if (!current) return;
    sound.play(current.kind === 'rank' ? 'stamp' : 'ding');
    haptic(current.kind === 'rank' ? 'confirm' : 'light');
    const t = setTimeout(() => setQueue((q) => q.slice(1)), SHOW_MS);
    return () => clearTimeout(t);
  }, [current]);

  if (!current) return null;
  return (
    <div className={s.layer} role="status" aria-live="polite">
      <button key={current.id} className={s.slip} data-kind={current.kind} onClick={() => setQueue((q) => q.slice(1))} aria-label={`${KICKER[current.kind]}: ${current.title}. ${current.detail}. Tocar para cerrar`}>
        <span className={s.kicker}>{KICKER[current.kind]}</span>
        <strong className={s.title}>{current.title}</strong>
        <span className={s.detail}>{current.detail}</span>
        {queue.length > 1 && <span className={s.more}>+{queue.length - 1}</span>}
      </button>
    </div>
  );
}
