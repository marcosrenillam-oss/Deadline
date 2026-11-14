import { useEffect, useRef, useState } from 'react';
import type { Toast } from '../../cases/CaseProvider.tsx';
import s from './shell.module.css';

/** Herramientas del investigador dibujadas como objetos de la mesa. */

export function NotebookIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <rect x="9" y="6" width="22" height="29" rx="2" fill="#5b3a22" />
      <rect x="10" y="7" width="20" height="27" rx="1.5" fill="#6e4a2c" />
      <rect x="25" y="6" width="2.4" height="29" fill="#151413" />
      <rect x="31" y="8" width="1.6" height="25" fill="#e8e0ca" />
      <path d="M33 4 L35 6 L22 33 L19.5 34 L20 31.5 Z" fill="#c99a2e" />
      <path d="M19.5 34 L20 31.5 L22 33 Z" fill="#2a241a" />
    </svg>
  );
}

export function LensIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="17" cy="17" r="10" fill="rgba(220,232,228,0.25)" stroke="#c9a35a" strokeWidth="3" />
      <path d="M12 13 Q15 10 19 11" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M24.5 24.5 L33 33" stroke="#5a2a1a" strokeWidth="5" strokeLinecap="round" />
      <path d="M13 21 L16 15 L19 19 L22 13" stroke="#9a2a24" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

/** Hilo rojo entre dos chinchetas: relacionar piezas. */
export function ThreadIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="M9 28 C 16 10, 24 34, 31 12" fill="none" stroke="#b11f1f" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="9" cy="28" r="4.5" fill="#d23b2f" stroke="#5a0d0d" />
      <circle cx="31" cy="12" r="4.5" fill="#d8b25a" stroke="#6e521f" />
    </svg>
  );
}

export function EnvelopeIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <rect x="5" y="10" width="30" height="21" rx="1" fill="#e9e0c8" />
      <path d="M5 10 L20 22 L35 10" fill="none" stroke="#b9ab8c" strokeWidth="1.2" />
      <circle cx="20" cy="22" r="4" fill="#762d2b" />
      <text x="20" y="24.4" textAnchor="middle" fontSize="6" fill="#efe6d2" fontFamily="serif">?</text>
    </svg>
  );
}

export function PhoneIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <rect x="8" y="18" width="24" height="15" rx="5" fill="#1d1c1a" />
      <circle cx="20" cy="25.5" r="5" fill="#d9d0bb" />
      <path d="M6 14 Q20 6 34 14 L32 18 Q20 12 8 18 Z" fill="#2a2826" />
    </svg>
  );
}

const KIND_LABEL: Partial<Record<Toast['kind'], string>> = {
  evidence: 'Nueva evidencia',
  contradiction: 'Contradicción',
  deduction: 'Deducción',
  secret: 'Secreto',
};

/**
 * DESCUBRIMIENTO: el entorno se oscurece un instante, la pieza se acerca a
 * cámara con su sello y vuelve a su sitio. No bloquea: se puede seguir
 * tocando la pantalla mientras ocurre.
 */
export function DiscoveryLayer({ toasts }: { toasts: Toast[] }) {
  const [shown, setShown] = useState<Toast | null>(null);
  const seen = useRef(new Set<number>());
  useEffect(() => {
    const next = toasts.find((t) => KIND_LABEL[t.kind] && !seen.current.has(t.id));
    if (!next) return;
    seen.current.add(next.id);
    setShown(next);
    const t = setTimeout(() => setShown((x) => (x?.id === next.id ? null : x)), 2100);
    return () => clearTimeout(t);
  }, [toasts]);
  if (!shown) return null;
  const text = shown.text.replace(/^(Nueva evidencia|Contradicción): /, '');
  return (
    <div className={s.discovery} key={shown.id} aria-hidden="true">
      <div className={`m-paper ${s.discoveryCard}`} data-kind={shown.kind}>
        <span className={s.discoveryStamp}>{KIND_LABEL[shown.kind]}</span>
        <span className={s.discoveryText}>{text}</span>
      </div>
    </div>
  );
}

/** Último minuto: los bordes de la pantalla laten en rojo. */
export function FinalMinute({ active }: { active: boolean }) {
  return active ? <div className={s.finalVignette} aria-hidden="true" /> : null;
}

/** Cierre por tiempo: la carpeta se cierra y cae el sello. Una sola vez, al ocurrir. */
export function TimeUp({ trigger }: { trigger: boolean }) {
  const [show, setShow] = useState(false);
  const prev = useRef(trigger);
  useEffect(() => {
    if (trigger && !prev.current) {
      setShow(true);
      const t = setTimeout(() => setShow(false), 2600);
      prev.current = trigger;
      return () => clearTimeout(t);
    }
    prev.current = trigger;
  }, [trigger]);
  if (!show) return null;
  return (
    <div className={s.timeUp} role="status">
      <span className={s.timeUpStamp}>Tiempo agotado</span>
    </div>
  );
}
