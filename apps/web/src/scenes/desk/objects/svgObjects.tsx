import type { LampMaterial, PhoneMaterial, TypewriterMaterial } from '../palettes.ts';

/**
 * Objetos dibujados en SVG vistos desde arriba (lámpara, teléfono, máquina
 * de escribir, decoración). Cada uno usa un viewBox propio y se escala con
 * su contenedor. Los ids de gradientes llevan prefijo para no colisionar.
 */

// ─── Lámpara ─────────────────────────────────────────────────────────────────

export function LampSvg({ id, m }: { id: string; m: LampMaterial }) {
  const p = `lamp-${id}`;
  if (id === 'lamp-brass') {
    return (
      <svg viewBox="0 0 230 190" width="100%" height="100%" aria-hidden="true">
        <defs>
          <radialGradient id={`${p}-dome`} cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor={m.shadeLight} />
            <stop offset="0.45" stopColor={m.shade} />
            <stop offset="1" stopColor={m.shadeDark} />
          </radialGradient>
          <radialGradient id={`${p}-base`} cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor={m.metalLight} />
            <stop offset="1" stopColor={m.metal} />
          </radialGradient>
        </defs>
        <ellipse cx="72" cy="150" rx="40" ry="36" fill="rgba(0,0,0,0.45)" transform="translate(6 7)" />
        <circle cx="72" cy="150" r="38" fill={`url(#${p}-base)`} stroke="rgba(0,0,0,0.35)" />
        <circle cx="72" cy="150" r="27" fill="none" stroke="rgba(255,255,255,0.25)" />
        <path d="M78 140 L140 86" stroke={m.metal} strokeWidth="9" strokeLinecap="round" />
        <path d="M78 140 L140 86" stroke={m.metalLight} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <circle cx="140" cy="86" r="62" fill="rgba(0,0,0,0.4)" transform="translate(7 8)" />
        <circle cx="140" cy="86" r="62" fill={`url(#${p}-dome)`} />
        <circle cx="140" cy="86" r="62" fill="none" stroke={m.shadeDark} strokeWidth="2" />
        <circle cx="140" cy="86" r="14" fill={m.metal} stroke={m.metalLight} strokeWidth="2" />
        <ellipse cx="118" cy="62" rx="22" ry="11" fill="rgba(255,255,255,0.28)" transform="rotate(-30 118 62)" />
        <g className="lamp-chain">
          <line x1="186" y1="128" x2="200" y2="158" stroke={m.metalLight} strokeWidth="2" strokeDasharray="2 3" />
          <circle cx="201" cy="161" r="5" fill={m.metalLight} stroke={m.metal} />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 230 190" width="100%" height="100%" aria-hidden="true">
      <defs>
        <linearGradient id={`${p}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={m.shadeDark} />
          <stop offset="0.28" stopColor={m.shade} />
          <stop offset="0.42" stopColor={m.shadeLight} />
          <stop offset="0.55" stopColor={m.shade} />
          <stop offset="1" stopColor={m.shadeDark} />
        </linearGradient>
        <linearGradient id={`${p}-brass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={m.metal} />
          <stop offset="0.4" stopColor={m.metalLight} />
          <stop offset="1" stopColor={m.metal} />
        </linearGradient>
        <radialGradient id={`${p}-base`} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor={m.metalLight} />
          <stop offset="1" stopColor={m.metal} />
        </radialGradient>
      </defs>
      {/* pie */}
      <ellipse cx="112" cy="150" rx="58" ry="30" fill="rgba(0,0,0,0.45)" transform="translate(7 8)" />
      <ellipse cx="112" cy="150" rx="58" ry="30" fill={`url(#${p}-base)`} stroke="rgba(0,0,0,0.35)" />
      <ellipse cx="112" cy="150" rx="44" ry="21" fill="none" stroke="rgba(255,255,255,0.22)" />
      <rect x="106" y="98" width="12" height="52" rx="4" fill={`url(#${p}-brass)`} />
      {/* pantalla de vidrio */}
      <rect x="22" y="44" width="190" height="62" rx="31" fill="rgba(0,0,0,0.42)" transform="translate(8 9)" />
      <rect x="22" y="44" width="190" height="62" rx="31" fill={`url(#${p}-glass)`} />
      <rect x="22" y="44" width="190" height="62" rx="31" fill="none" stroke={m.shadeDark} strokeWidth="2" />
      <rect x="36" y="58" width="150" height="9" rx="4.5" fill="rgba(255,255,255,0.32)" />
      <rect x="16" y="54" width="14" height="42" rx="5" fill={`url(#${p}-brass)`} />
      <rect x="204" y="54" width="14" height="42" rx="5" fill={`url(#${p}-brass)`} />
      <g className="lamp-chain">
        <line x1="150" y1="104" x2="158" y2="134" stroke={m.metalLight} strokeWidth="2" strokeDasharray="2 3" />
        <circle cx="159" cy="138" r="5" fill={m.metalLight} stroke={m.metal} />
      </g>
    </svg>
  );
}

// ─── Teléfono de disco ───────────────────────────────────────────────────────

export function PhoneSvg({ m }: { m: PhoneMaterial }) {
  const p = `phone-${m.body.slice(1)}`;
  const holes = Array.from({ length: 10 }, (_, i) => {
    const a = ((-60 - i * 28) * Math.PI) / 180;
    return { x: 100 + Math.cos(a) * 33, y: 132 + Math.sin(a) * 33, n: (i + 1) % 10 };
  });
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
      <defs>
        <linearGradient id={`${p}-body`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={m.light} />
          <stop offset="0.35" stopColor={m.body} />
          <stop offset="1" stopColor={m.dark} />
        </linearGradient>
        <linearGradient id={`${p}-hand`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={m.light} />
          <stop offset="0.5" stopColor={m.body} />
          <stop offset="1" stopColor={m.dark} />
        </linearGradient>
        <radialGradient id={`${p}-plate`} cx="45%" cy="40%" r="65%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor={m.plate} />
        </radialGradient>
      </defs>
      {/* cable rizado */}
      <path
        d="M24 150 q-10 6 -6 14 q8 6 2 14 q-8 6 -2 13 q8 5 0 12"
        fill="none"
        stroke={m.dark}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* cuerpo */}
      <path d="M38 58 Q100 40 162 58 L184 176 Q100 196 16 176 Z" fill="rgba(0,0,0,0.5)" transform="translate(7 8)" />
      <path d="M38 58 Q100 40 162 58 L184 176 Q100 196 16 176 Z" fill={`url(#${p}-body)`} />
      <path d="M44 66 Q100 52 156 66" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="3" />
      {/* disco */}
      <circle cx="100" cy="132" r="46" fill="rgba(0,0,0,0.35)" />
      <circle cx="100" cy="130" r="45" fill={`url(#${p}-plate)`} />
      {holes.map((h) => (
        <text key={h.n} x={h.x} y={h.y + 3} textAnchor="middle" fontSize="8" fontFamily="var(--font-type)" fill="#2a241a">
          {h.n}
        </text>
      ))}
      <g className="phone-dial">
        <circle cx="100" cy="130" r="44" fill="none" stroke="rgba(30,30,30,0.0)" />
        <path
          d={`M100 86 A44 44 0 1 1 99.9 86 Z ${holes.map((h) => `M${h.x + 8} ${h.y} A8 8 0 1 0 ${h.x - 8} ${h.y} A8 8 0 1 0 ${h.x + 8} ${h.y} Z`).join(' ')}`}
          fill="rgba(15,15,15,0.55)"
          fillRule="evenodd"
        />
        <path d="M134 158 L146 170" stroke="#c9c2b0" strokeWidth="3" strokeLinecap="round" />
      </g>
      <circle cx="100" cy="130" r="16" fill={m.plate} stroke="rgba(0,0,0,0.3)" />
      <text x="100" y="128" textAnchor="middle" fontSize="6.5" fontFamily="var(--font-type)" fontWeight="700" fill="#762d2b" letterSpacing="0.6">
        LÍNEA
      </text>
      <text x="100" y="136" textAnchor="middle" fontSize="6.5" fontFamily="var(--font-type)" fontWeight="700" fill="#2a241a" letterSpacing="0.6">
        PAREJA
      </text>
      {/* auricular */}
      <g className="phone-handset">
        <rect x="10" y="20" width="180" height="44" rx="20" fill="rgba(0,0,0,0.45)" transform="translate(8 10)" />
        <rect x="8" y="18" width="56" height="48" rx="20" fill={`url(#${p}-hand)`} />
        <rect x="136" y="18" width="56" height="48" rx="20" fill={`url(#${p}-hand)`} />
        <rect x="50" y="30" width="100" height="22" rx="10" fill={`url(#${p}-hand)`} />
        <rect x="56" y="33" width="88" height="5" rx="2.5" fill="rgba(255,255,255,0.18)" />
        <rect x="16" y="23" width="40" height="7" rx="3.5" fill="rgba(255,255,255,0.16)" />
        <rect x="144" y="23" width="40" height="7" rx="3.5" fill="rgba(255,255,255,0.16)" />
      </g>
    </svg>
  );
}

// ─── Máquina de escribir ─────────────────────────────────────────────────────

export function TypewriterSvg({ m, lines }: { m: TypewriterMaterial; lines: string[] }) {
  const p = `tw-${m.body.slice(1)}`;
  const rows = [10, 10, 9, 8];
  return (
    <svg viewBox="0 0 280 230" width="100%" height="100%" aria-hidden="true">
      <defs>
        <linearGradient id={`${p}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={m.light} />
          <stop offset="0.25" stopColor={m.body} />
          <stop offset="1" stopColor={m.dark} />
        </linearGradient>
        <linearGradient id={`${p}-platen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#111" />
          <stop offset="0.45" stopColor="#4a4a4a" />
          <stop offset="1" stopColor="#0b0b0b" />
        </linearGradient>
        <radialGradient id={`${p}-key`} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor={m.key} />
        </radialGradient>
      </defs>
      {/* sombra */}
      <path d="M26 74 H254 L266 218 Q140 230 14 218 Z" fill="rgba(0,0,0,0.5)" transform="translate(9 10)" />
      {/* hoja */}
      <g className="tw-paper">
        <rect x="62" y="0" width="156" height="78" fill="#ebe3cf" />
        <rect x="62" y="0" width="156" height="78" fill="none" stroke="rgba(0,0,0,0.12)" />
        {lines.map((l, i) => (
          <text key={i} x="72" y={16 + i * 12} fontSize={i === 0 ? 8.4 : 8} fontFamily="var(--font-type)" fontWeight={i === 0 ? 700 : 400} fill={i === 0 ? '#762d2b' : '#2a241a'}>
            {l}
          </text>
        ))}
      </g>
      {/* carro y rodillo */}
      <g className="tw-carriage">
        <rect x="4" y="58" width="272" height="26" rx="13" fill={`url(#${p}-platen)`} />
        <rect x="0" y="54" width="18" height="34" rx="6" fill={m.body} stroke={m.light} strokeWidth="1.5" />
        <rect x="262" y="54" width="18" height="34" rx="6" fill={m.body} stroke={m.light} strokeWidth="1.5" />
        <path d="M24 62 L6 40" stroke="#bdbdbd" strokeWidth="4" strokeLinecap="round" />
      </g>
      {/* cuerpo */}
      <path d="M26 84 H254 L266 218 Q140 230 14 218 Z" fill={`url(#${p}-body)`} />
      <path d="M30 90 H250" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
      {/* carretes de cinta */}
      <circle cx="84" cy="106" r="15" fill={m.dark} stroke={m.light} strokeWidth="1.5" />
      <circle cx="196" cy="106" r="15" fill={m.dark} stroke={m.light} strokeWidth="1.5" />
      <path d="M100 100 Q140 92 180 100 L176 116 Q140 108 104 116 Z" fill="#141414" />
      <rect x="128" y="96" width="24" height="10" rx="2" fill="#7a1e1c" />
      {/* teclado */}
      {rows.map((n, r) =>
        Array.from({ length: n }, (_, k) => {
          const w = 21;
          const x0 = 140 - ((n - 1) * w) / 2 + r * 2;
          return (
            <g key={`${r}-${k}`}>
              <circle cx={x0 + k * w} cy={136 + r * 18} r="8.2" fill="#9a9a9a" />
              <circle cx={x0 + k * w} cy={135 + r * 18} r="7" fill={`url(#${p}-key)`} />
            </g>
          );
        }),
      )}
      <rect x="78" y="204" width="124" height="9" rx="4.5" fill={`url(#${p}-key)`} stroke="#9a9a9a" />
    </svg>
  );
}

// ─── Decoración ──────────────────────────────────────────────────────────────

export function CoffeeSvg() {
  return (
    <svg viewBox="0 0 120 100" width="100%" height="100%" aria-hidden="true">
      <defs>
        <radialGradient id="coffee-liquid" cx="45%" cy="40%" r="60%">
          <stop offset="0" stopColor="#5a3b22" />
          <stop offset="0.7" stopColor="#2a170b" />
          <stop offset="1" stopColor="#140a04" />
        </radialGradient>
        <radialGradient id="coffee-china" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#fbf6ea" />
          <stop offset="1" stopColor="#cfc4ac" />
        </radialGradient>
      </defs>
      <circle cx="94" cy="76" r="17" fill="none" stroke="rgba(60,30,10,0.35)" strokeWidth="3" />
      <circle cx="50" cy="50" r="42" fill="rgba(0,0,0,0.45)" transform="translate(6 7)" />
      <circle cx="50" cy="50" r="42" fill="url(#coffee-china)" />
      <circle cx="50" cy="50" r="33" fill="none" stroke="rgba(0,0,0,0.12)" />
      <rect x="74" y="42" width="26" height="15" rx="7" fill="url(#coffee-china)" stroke="rgba(0,0,0,0.15)" />
      <circle cx="50" cy="50" r="27" fill="url(#coffee-china)" stroke="rgba(0,0,0,0.2)" />
      <circle cx="50" cy="50" r="22" fill="url(#coffee-liquid)" />
      <ellipse cx="43" cy="42" rx="8" ry="4" fill="rgba(255,240,220,0.18)" transform="rotate(-30 43 42)" />
    </svg>
  );
}

export function PolaroidsSvg() {
  const photo = (x: number, y: number, rot: number, caption: string, key: string) => (
    <g key={key} transform={`rotate(${rot} ${x + 34} ${y + 40})`}>
      <rect x={x} y={y} width="68" height="80" fill="rgba(0,0,0,0.45)" transform="translate(4 5)" />
      <rect x={x} y={y} width="68" height="80" fill="#efe9dc" />
      <rect x={x + 6} y={y + 6} width="56" height="54" fill="url(#pol-photo)" />
      <path d={`M${x + 30} ${y + 60} q4 -26 10 -30 q6 4 8 30 Z`} fill="rgba(0,0,0,0.55)" />
      <text x={x + 34} y={y + 74} textAnchor="middle" fontFamily="var(--font-hand)" fontSize="10" fill="#3d4a6b">
        {caption}
      </text>
    </g>
  );
  return (
    <svg viewBox="0 0 170 110" width="100%" height="100%" aria-hidden="true">
      <defs>
        <linearGradient id="pol-photo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6c6a5c" />
          <stop offset="0.6" stopColor="#3a3a33" />
          <stop offset="1" stopColor="#1d1c18" />
        </linearGradient>
      </defs>
      {photo(8, 14, -9, 'Muelle 4', 'a')}
      {photo(84, 8, 6, '¿1987?', 'b')}
    </svg>
  );
}
