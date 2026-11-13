import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { sound } from '../audio/sound.ts';
import styles from './PhotoViewer.module.css';

interface Props {
  src: string;
  alt: string;
  caption?: string | undefined;
  onClose: () => void;
}

/**
 * VISOR DE FOTOGRAFÍAS. La copia se sostiene delante, sobre la mesa a oscuras:
 * pellizcar (o la rueda) amplía, arrastrar mueve, doble toque alterna 1×/2,5×
 * y los botones giran la copia de 90 en 90 grados. Escape o el fondo cierran.
 */
export function PhotoViewer({ src, alt, caption, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [view, setView] = useState({ s: 1, x: 0, y: 0, r: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ d: number; s: number; x: number; y: number; cx: number; cy: number } | null>(null);
  const lastTap = useRef(0);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    sound.play('paper');
  }, []);

  const clamp = (s: number) => Math.min(5, Math.max(1, s));

  const down = (e: RPointerEvent) => {
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length === 1) {
      const now = Date.now();
      if (now - lastTap.current < 280) {
        setView((v) => (v.s > 1 ? { ...v, s: 1, x: 0, y: 0 } : { ...v, s: 2.5 }));
        lastTap.current = 0;
      } else lastTap.current = now;
    }
    const [a, b] = pts;
    gesture.current = {
      d: a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0,
      s: view.s,
      x: view.x,
      y: view.y,
      cx: a && b ? (a.x + b.x) / 2 : (a?.x ?? 0),
      cy: a && b ? (a.y + b.y) / 2 : (a?.y ?? 0),
    };
  };
  const move = (e: RPointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    const pts = [...pointers.current.values()];
    const [a, b] = pts;
    if (a && b && g.d > 0) {
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      setView((v) => ({ ...v, s: clamp((g.s * d) / g.d), x: g.x + cx - g.cx, y: g.y + cy - g.cy }));
    } else if (a && view.s > 1) {
      setView((v) => ({ ...v, x: g.x + a.x - g.cx, y: g.y + a.y - g.cy }));
    }
  };
  const up = (e: RPointerEvent) => {
    pointers.current.delete(e.pointerId);
    const [a] = [...pointers.current.values()];
    gesture.current = a ? { d: 0, s: view.s, x: view.x, y: view.y, cx: a.x, cy: a.y } : null;
    if (view.s <= 1.01) setView((v) => ({ ...v, s: 1, x: 0, y: 0 }));
  };

  const rotate = (dir: 1 | -1) => {
    sound.play('paper');
    setView((v) => ({ ...v, r: v.r + dir * 90 }));
  };

  return (
    <dialog
      ref={ref}
      className={styles.viewer}
      aria-label={`Fotografía: ${alt}`}
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div
        className={styles.stage}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onWheel={(e) => setView((v) => ({ ...v, s: clamp(v.s * (e.deltaY < 0 ? 1.15 : 1 / 1.15)) }))}
        onClick={(e) => {
          if (e.target === e.currentTarget && view.s === 1) onClose();
        }}
      >
        <figure className={styles.print} style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.s}) rotate(${view.r}deg)` }}>
          <img src={src} alt={alt} draggable={false} />
        </figure>
      </div>
      <div className={styles.bar}>
        <button type="button" onClick={() => rotate(-1)} aria-label="Girar a la izquierda">
          ⟲
        </button>
        <button type="button" onClick={() => setView((v) => ({ ...v, s: clamp(v.s / 1.4) }))} aria-label="Alejar" disabled={view.s <= 1}>
          −
        </button>
        <span className={styles.zoom}>{Math.round(view.s * 100)} %</span>
        <button type="button" onClick={() => setView((v) => ({ ...v, s: clamp(v.s * 1.4) }))} aria-label="Acercar" disabled={view.s >= 5}>
          +
        </button>
        <button type="button" onClick={() => rotate(1)} aria-label="Girar a la derecha">
          ⟳
        </button>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
          ✕
        </button>
      </div>
      {caption && <p className={styles.caption}>{caption}</p>}
    </dialog>
  );
}
