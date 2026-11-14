import type { CSSProperties } from 'react';
import s from './Ambience.module.css';

function rnd(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

/**
 * AMBIENTE VIVO del despacho, común a las pantallas: polvo suspendido en el
 * haz de la lámpara, gotas que resbalan por el cristal de la ventana y un
 * leve parpadeo del filamento. Solo CSS (sin coste de JavaScript por
 * fotograma); con «reducir movimiento» queda quieto.
 */
export function Ambience({ rain = true, dust = 22 }: { rain?: boolean; dust?: number }) {
  return (
    <div className={s.ambience} aria-hidden="true">
      <div className={s.beam}>
        {Array.from({ length: dust }, (_, i) => (
          <i
            key={i}
            style={
              {
                '--x': `${rnd(i) * 100}%`,
                '--y': `${rnd(i + 50) * 100}%`,
                '--d': `${14 + rnd(i + 99) * 18}s`,
                '--delay': `${-rnd(i + 7) * 20}s`,
                '--s': `${1 + rnd(i + 3) * 2.4}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      {rain && (
        <div className={s.window}>
          {Array.from({ length: 14 }, (_, i) => (
            <b
              key={i}
              style={
                {
                  '--x': `${rnd(i + 200) * 100}%`,
                  '--d': `${3 + rnd(i + 300) * 5}s`,
                  '--delay': `${-rnd(i + 400) * 8}s`,
                  '--h': `${18 + rnd(i + 500) * 40}px`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}
      <div className={s.flicker} />
    </div>
  );
}
