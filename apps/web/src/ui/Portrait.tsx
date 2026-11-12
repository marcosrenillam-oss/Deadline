import type { Character } from '@deadline/core';

/**
 * Retrato de ficha provisional: silueta generada a partir del personaje
 * (pelo, sombrero, gafas, cuello) sobre el fondo de una foto policial.
 * Los retratos realistas llegarán con la producción artística (Etapa 8);
 * la silueta es honesta: no finge ser una fotografía.
 */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function Portrait({ character, size = 120 }: { character: Pick<Character, 'id' | 'name' | 'age'>; size?: number }) {
  const h = hash(character.id);
  const hair = h % 4; // 0 corto, 1 largo, 2 recogido, 3 sombrero
  const glasses = (h >> 3) % 3 === 0;
  const collar = (h >> 5) % 3;
  const shade = ['#1d1c1a', '#262420', '#1a1a1c'][(h >> 7) % 3];
  const id = `pt-${character.id}`;
  return (
    <svg viewBox="0 0 100 120" width={size} height={size * 1.2} role="img" aria-label={`Ficha de ${character.name} (silueta)`}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bdb6a6" />
          <stop offset="1" stopColor="#8c8577" />
        </linearGradient>
      </defs>
      <rect width="100" height="120" fill={`url(#${id}-bg)`} />
      {[20, 40, 60, 80, 100].map((y) => (
        <g key={y}>
          <line x1="0" y1={y} x2="100" y2={y} stroke="rgba(40,36,30,0.25)" strokeWidth="0.6" />
          <text x="2" y={y - 1.5} fontSize="4" fontFamily="var(--font-type)" fill="rgba(40,36,30,0.45)">
            {(2 - y / 100).toFixed(1)}
          </text>
        </g>
      ))}
      <g fill={shade}>
        <path d="M14 120 Q16 88 50 84 Q84 88 86 120 Z" />
        <rect x="42" y="70" width="16" height="18" rx="5" />
        <ellipse cx="50" cy="52" rx="17" ry="21" />
        {hair === 1 && <path d="M31 50 Q30 26 50 26 Q70 26 69 50 L72 80 Q66 74 64 60 L36 60 Q34 74 28 80 Z" />}
        {hair === 2 && <circle cx="50" cy="28" r="8" />}
        {hair === 3 && (
          <>
            <ellipse cx="50" cy="35" rx="27" ry="5" />
            <path d="M36 35 Q36 18 50 18 Q64 18 64 35 Z" />
          </>
        )}
        {hair === 0 && <path d="M33 46 Q33 28 50 28 Q67 28 67 46 Q60 38 50 38 Q40 38 33 46 Z" />}
      </g>
      {glasses && (
        <g fill="none" stroke="#6f6a60" strokeWidth="1.4">
          <circle cx="43" cy="52" r="5" />
          <circle cx="57" cy="52" r="5" />
          <line x1="48" y1="52" x2="52" y2="52" />
        </g>
      )}
      {collar === 0 && <path d="M42 86 L50 100 L58 86" fill="none" stroke="#d8d2c4" strokeWidth="2" />}
      {collar === 1 && <path d="M47 88 L50 104 L53 88 Z" fill="#5a2a28" />}
      <rect x="20" y="106" width="60" height="12" fill="#151412" />
      <text x="50" y="114.5" textAnchor="middle" fontSize="5.4" fontFamily="var(--font-type)" fill="#e6ddc9" letterSpacing="0.4">
        {character.name.toUpperCase().slice(0, 22)}
      </text>
    </svg>
  );
}
