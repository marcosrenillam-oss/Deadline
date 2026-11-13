import { formatRemaining } from '@deadline/core';
import s from './shell.module.css';

export type Tension = 'calm' | 'warn' | 'danger' | 'final' | 'closed';

export function tensionOf(remainingMs: number, closed: boolean): Tension {
  if (closed) return 'closed';
  if (remainingMs <= 60_000) return 'final';
  if (remainingMs <= 5 * 60_000) return 'danger';
  if (remainingMs <= 10 * 60_000) return 'warn';
  return 'calm';
}

/**
 * EL CRONÓMETRO: un reloj de bolsillo. La aguja y el arco rojo muestran el
 * tiempo que queda; los dígitos, el valor exacto. La tensión sube por
 * fases (10 min, 5 min, último minuto). Solo dibuja: el cálculo del tiempo
 * sigue siendo el de las marcas de tiempo reales (nunca lo altera).
 */
export function PocketWatch({ remainingMs, totalMs, closed, onClick }: { remainingMs: number; totalMs: number; closed: boolean; onClick: () => void }) {
  const t = tensionOf(remainingMs, closed);
  const frac = closed ? 0 : Math.max(0, Math.min(1, remainingMs / totalMs));
  const R = 20;
  const C = 2 * Math.PI * R;
  // La aguja de los segundos gira de verdad; la de la carátula marca lo consumido.
  const secAngle = ((60 - Math.floor((remainingMs / 1000) % 60)) % 60) * 6;
  const usedAngle = (1 - frac) * 360;
  return (
    <button
      className={s.watch}
      data-tension={t}
      role="timer"
      aria-label={closed ? 'Expediente cerrado' : `Tiempo restante ${formatRemaining(remainingMs)}. Tocar para tapar el expediente`}
      disabled={closed}
      onClick={onClick}
    >
      <svg viewBox="0 0 56 56" className={s.dial} aria-hidden="true">
        <defs>
          <radialGradient id="pw-case" cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor="#f3dfa6" />
            <stop offset="0.55" stopColor="#b08d4f" />
            <stop offset="1" stopColor="#5e451a" />
          </radialGradient>
          <radialGradient id="pw-face" cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor="#fbf6ea" />
            <stop offset="1" stopColor="#ddd2b8" />
          </radialGradient>
        </defs>
        <rect x="24" y="0" width="8" height="6" rx="2" fill="url(#pw-case)" />
        <circle cx="28" cy="30" r="26" fill="url(#pw-case)" />
        <circle cx="28" cy="30" r="23" fill="url(#pw-face)" />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1="28" y1="9.5" x2="28" y2={i % 3 ? 11.5 : 13} stroke="#2a241a" strokeWidth={i % 3 ? 0.8 : 1.6} transform={`rotate(${i * 30} 28 30)`} />
        ))}
        <circle
          cx="28"
          cy="30"
          r={R}
          fill="none"
          stroke="#9a2a24"
          strokeOpacity="0.55"
          strokeWidth="2.2"
          strokeDasharray={`${C * frac} ${C}`}
          transform="rotate(-90 28 30)"
          className={s.arc}
        />
        <line x1="28" y1="30" x2="28" y2="15" stroke="#1e1b17" strokeWidth="1.8" strokeLinecap="round" transform={`rotate(${usedAngle} 28 30)`} className={s.hand} />
        {!closed && <line x1="28" y1="33" x2="28" y2="12" stroke="#9a2a24" strokeWidth="0.8" transform={`rotate(${secAngle} 28 30)`} className={s.second} />}
        <circle cx="28" cy="30" r="1.8" fill="#1e1b17" />
      </svg>
      <span className={s.digits}>{closed ? 'CERRADO' : formatRemaining(remainingMs)}</span>
    </button>
  );
}
