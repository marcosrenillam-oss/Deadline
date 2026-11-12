import { useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import {
  evaluateCondition,
  motivesAvailable,
  newId,
  patchWorkspace,
  unlockedTimeline,
  visibleCharacters,
  type BoardNode,
  type BoardState,
} from '@deadline/core';
import { useCase } from '../../cases/CaseProvider.tsx';
import { Sheet } from '../../ui/Sheet.tsx';
import { sound } from '../../audio/sound.ts';
import { haptic } from '../../audio/haptics.ts';
import s from './board.module.css';

const W = 170;
const H = 92;
type Mode = 'move' | 'connect' | 'delete';
type Ref = BoardNode['ref'];

/**
 * 5 · TABLERO. Corcho con tarjetas e hilos que el jugador coloca y conecta a
 * mano. Arrastrar mueve; en modo «Conectar» se tocan dos tarjetas; en modo
 * «Quitar» se toca una tarjeta o un hilo. Todo se guarda solo.
 */
export function BoardTab() {
  const { c, k, inv, closed, patch } = useCase();
  const [mode, setMode] = useState<Mode>('move');
  const [first, setFirst] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [theory, setTheory] = useState('');
  const [live, setLive] = useState<Record<string, { x: number; y: number }>>({});
  const [liveView, setLiveView] = useState<BoardState['viewport'] | null>(null);
  const corkRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ kind: 'node' | 'pan'; id?: string; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  if (!inv) return null;
  const board = inv.board;
  const view = liveView ?? board.viewport;

  const label = (ref: Ref): { kind: string; text: string } => {
    switch (ref.kind) {
      case 'character':
        return { kind: 'Persona', text: c.characters.find((x) => x.id === ref.id)?.name ?? '?' };
      case 'evidence':
        return { kind: 'Evidencia', text: c.evidence.find((x) => x.id === ref.id)?.title ?? '?' };
      case 'location':
        return { kind: 'Lugar', text: c.locations.find((x) => x.id === ref.id)?.name ?? '?' };
      case 'event': {
        const t = c.timeline.find((x) => x.id === ref.id);
        return { kind: t?.display ?? 'Acontecimiento', text: t?.title ?? '?' };
      }
      case 'motive':
        return { kind: 'Motivo', text: c.accusation.motives.find((x) => x.id === ref.id)?.label ?? '?' };
      case 'theory':
        return { kind: 'Teoría', text: ref.text };
    }
  };

  const save = (b: BoardState) => patch((i) => patchWorkspace(i, { board: b }, Date.now()));
  const posOf = (n: BoardNode) => live[n.id] ?? { x: n.x, y: n.y };

  /** Primer hueco libre del área visible, en espiral desde el centro: las tarjetas nuevas nunca se tapan. */
  const freeSlot = (nodes: BoardNode[]): { x: number; y: number } => {
    const el = corkRef.current;
    const vw = (el?.clientWidth ?? 700) / view.zoom;
    const vh = (el?.clientHeight ?? 300) / view.zoom;
    const ox = -view.x / view.zoom;
    const oy = -view.y / view.zoom;
    const stepX = W + 24;
    const stepY = H + 30;
    const cols = Math.max(1, Math.floor((vw - 20) / stepX));
    const rows = Math.max(1, Math.floor((vh - 20) / stepY));
    const free = (x: number, y: number) => nodes.every((n) => Math.abs(n.x - x) >= W + 8 || Math.abs(n.y - y) >= H + 8);
    for (let r = 0; r < rows + 6; r++) {
      for (let c = 0; c < cols; c++) {
        const x = Math.round(ox + 16 + c * stepX);
        const y = Math.round(oy + 16 + r * stepY);
        if (free(x, y)) return { x, y };
      }
    }
    return { x: Math.round(ox + 16), y: Math.round(oy + 16 + (rows + 6) * stepY) };
  };

  const addNode = (ref: Ref) => {
    const slot = freeSlot(board.nodes);
    const node: BoardNode = {
      id: newId(),
      ref,
      x: slot.x,
      y: slot.y,
      rotation: Math.round((Math.random() - 0.5) * 6),
      pinColor: (['red', 'brass', 'black', 'ivory'] as const)[board.nodes.length % 4]!,
    };
    sound.play('stamp');
    haptic('light');
    save({ ...board, nodes: [...board.nodes, node] });
  };

  const tapNode = (id: string) => {
    if (closed) return;
    if (mode === 'delete') {
      save({ ...board, nodes: board.nodes.filter((n) => n.id !== id), edges: board.edges.filter((e) => e.from !== id && e.to !== id) });
      sound.play('paper');
      return;
    }
    if (mode === 'connect') {
      if (!first) return setFirst(id);
      if (first !== id && !board.edges.some((e) => (e.from === first && e.to === id) || (e.from === id && e.to === first))) {
        save({ ...board, edges: [...board.edges, { id: newId(), from: first, to: id, style: 'thread' }] });
        sound.play('tap');
        haptic('light');
      }
      setFirst(null);
    }
  };

  const onDown = (e: RPointerEvent, nodeId?: string) => {
    if (closed && nodeId) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const n = nodeId ? board.nodes.find((x) => x.id === nodeId) : undefined;
    drag.current = n
      ? { kind: 'node', id: n.id, sx: e.clientX, sy: e.clientY, ox: posOf(n).x, oy: posOf(n).y, moved: false }
      : { kind: 'pan', sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y, moved: false };
  };
  const onMove = (e: RPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    if (!d.moved) return;
    if (d.kind === 'node' && mode === 'move' && d.id) setLive((l) => ({ ...l, [d.id!]: { x: d.ox + dx / view.zoom, y: d.oy + dy / view.zoom } }));
    if (d.kind === 'pan') setLiveView({ ...view, x: d.ox + dx, y: d.oy + dy });
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.kind === 'node' && d.id) {
      if (!d.moved) return tapNode(d.id);
      const p = live[d.id];
      if (p) save({ ...board, nodes: board.nodes.map((n) => (n.id === d.id ? { ...n, x: Math.round(p.x), y: Math.round(p.y) } : n)) });
      setLive({});
    } else if (d.kind === 'pan' && liveView) {
      save({ ...board, viewport: liveView });
      setLiveView(null);
    }
  };
  const zoomBy = (f: number) => save({ ...board, viewport: { ...view, zoom: Math.min(2, Math.max(0.4, Math.round(view.zoom * f * 100) / 100)) } });

  const options: Array<{ group: string; items: Array<{ ref: Ref; text: string }> }> = [
    { group: 'Personas', items: visibleCharacters(c, k).map((x) => ({ ref: { kind: 'character' as const, id: x.id }, text: x.name })) },
    { group: 'Evidencias', items: c.evidence.filter((x) => k.evidence.has(x.id)).map((x) => ({ ref: { kind: 'evidence' as const, id: x.id }, text: x.title })) },
    { group: 'Lugares', items: c.locations.filter((x) => evaluateCondition(x.appearsWhen, k)).map((x) => ({ ref: { kind: 'location' as const, id: x.id }, text: x.name })) },
    { group: 'Acontecimientos', items: unlockedTimeline(c, k).map((x) => ({ ref: { kind: 'event' as const, id: x.id }, text: `${x.display} · ${x.title}` })) },
    { group: 'Motivos posibles', items: motivesAvailable(c, k).map((x) => ({ ref: { kind: 'motive' as const, id: x.id }, text: x.label })) },
  ];
  const onBoard = new Set(board.nodes.map((n) => JSON.stringify(n.ref)));

  return (
    <div className={s.wrap}>
      {!closed && (
        <div className={s.toolbar}>
          <button className={s.tool} onClick={() => setAdding(true)}>
            + Añadir
          </button>
          {(['move', 'connect', 'delete'] as const).map((m) => (
            <button
              key={m}
              className={s.tool}
              aria-pressed={mode === m}
              onClick={() => {
                setMode(m);
                setFirst(null);
              }}
            >
              {{ move: 'Mover', connect: 'Conectar', delete: 'Quitar' }[m]}
            </button>
          ))}
          <span className={s.spacer} />
          <button className={s.tool} onClick={() => zoomBy(1 / 1.2)} aria-label="Alejar">
            −
          </button>
          <button className={s.tool} onClick={() => zoomBy(1.2)} aria-label="Acercar">
            +
          </button>
        </div>
      )}
      <div ref={corkRef} className={s.cork} onPointerDown={(e) => onDown(e)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} data-mode={mode}>
        {board.nodes.length === 0 && <p className={s.empty}>Corcho vacío. Añade personas, pruebas y acontecimientos, y únelos con hilo.</p>}
        <div className={s.layer} style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}>
          <svg className={s.threads} width="1" height="1" aria-hidden="true">
            {board.edges.map((e) => {
              const a = board.nodes.find((n) => n.id === e.from);
              const b = board.nodes.find((n) => n.id === e.to);
              if (!a || !b) return null;
              const pa = posOf(a);
              const pb = posOf(b);
              const x1 = pa.x + W / 2;
              const y1 = pa.y + 10;
              const x2 = pb.x + W / 2;
              const y2 = pb.y + 10;
              const sag = Math.min(60, Math.hypot(x2 - x1, y2 - y1) / 6);
              const d = `M${x1} ${y1} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag} ${x2} ${y2}`;
              return (
                <g key={e.id}>
                  <path d={d} className={s.thread} />
                  {mode === 'delete' && !closed && (
                    <path
                      d={d}
                      className={s.threadHit}
                      onPointerDown={(ev) => ev.stopPropagation()}
                      onClick={() => save({ ...board, edges: board.edges.filter((x) => x.id !== e.id) })}
                    />
                  )}
                </g>
              );
            })}
          </svg>
          {board.nodes.map((n) => {
            const p = posOf(n);
            const l = label(n.ref);
            return (
              <div
                key={n.id}
                className={s.card}
                data-kind={n.ref.kind}
                data-first={first === n.id || undefined}
                style={{ left: p.x, top: p.y, width: W, minHeight: H, transform: `rotate(${n.rotation}deg)` }}
                onPointerDown={(e) => onDown(e, n.id)}
                role="button"
                tabIndex={0}
                aria-label={`${l.kind}: ${l.text}`}
                onKeyDown={(e) => e.key === 'Enter' && tapNode(n.id)}
              >
                <span className={s.pin} data-color={n.pinColor} />
                <span className={s.cardKind}>{l.kind}</span>
                <span className={s.cardText}>{l.text}</span>
              </div>
            );
          })}
        </div>
        {mode === 'connect' && <p className={s.hint}>{first ? 'Ahora toca la segunda tarjeta.' : 'Toca la primera tarjeta que quieres unir.'}</p>}
      </div>
      <Sheet open={adding} onClose={() => setAdding(false)} title="Añadir al tablero">
        {options.map((g) =>
          g.items.length ? (
            <div key={g.group} className={s.group}>
              <p className={s.groupLabel}>{g.group}</p>
              <div className={s.chips}>
                {g.items.map((o) => (
                  <button key={JSON.stringify(o.ref)} className={s.chip} disabled={onBoard.has(JSON.stringify(o.ref))} onClick={() => addNode(o.ref)}>
                    {o.text}
                  </button>
                ))}
              </div>
            </div>
          ) : null,
        )}
        <form
          className={s.group}
          onSubmit={(e) => {
            e.preventDefault();
            if (!theory.trim()) return;
            addNode({ kind: 'theory', text: theory.trim().slice(0, 280) });
            setTheory('');
          }}
        >
          <label className={s.groupLabel} htmlFor="board-theory">
            Teoría propia
          </label>
          <textarea id="board-theory" className={s.theory} value={theory} onChange={(e) => setTheory(e.target.value)} rows={2} placeholder="¿Y si quien entró tenía llave?" />
          <button className={s.tool} disabled={!theory.trim()}>
            Clavar en el corcho
          </button>
        </form>
      </Sheet>
    </div>
  );
}
