import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router';
import { availableInterrogations, discoveredEvidence, evaluateCondition, formatCaseNumber, visibleCharacters } from '@deadline/core';
import { useCase } from '../../cases/CaseProvider.tsx';
import { assetUrl, portraitUrl } from '../../cases/contentRepo.ts';
import { CRIME_CATEGORY_LABELS, EVIDENCE_KIND_LABELS } from '../../cases/labels.ts';
import { Portrait } from '../../ui/Portrait.tsx';
import { sound } from '../../audio/sound.ts';
import { haptic } from '../../audio/haptics.ts';
import s from './wall.module.css';

const ROLE: Record<string, string> = { victim: 'Víctima', suspect: 'Sospechoso', witness: 'Testigo', investigator: 'Investigador', other: 'Otro' };

type Pin =
  | { kind: 'case'; id: string }
  | { kind: 'person'; id: string }
  | { kind: 'evidence'; id: string }
  | { kind: 'place'; id: string }
  | { kind: 'fact'; id: string }
  | { kind: 'timeline'; id: string };

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
/** Inclinación y desplazamiento estables de cada pieza: el corcho parece clavado a mano. */
const jitter = (id: string) => {
  const h = hash(id);
  return { '--tilt': `${((h % 9) - 4) * 0.8}deg`, '--dx': `${((h >> 4) % 13) - 6}px`, '--dy': `${((h >> 8) % 11) - 5}px` } as CSSProperties;
};
const keyOf = (p: Pin) => `${p.kind}:${p.id}`;

function useSeen(invId: string | undefined) {
  const storageKey = `deadline:wall:${invId ?? 'none'}`;
  const [seen] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(storageKey) ?? '[]') as string[]);
    } catch {
      return new Set();
    }
  });
  const remember = (keys: string[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...new Set([...seen, ...keys])]));
    } catch {
      /* sin almacenamiento: las piezas solo se animan otra vez */
    }
  };
  return { seen, remember };
}

/**
 * EL CORCHO DEL CASO. La pantalla principal del expediente: todo lo que se
 * sabe, clavado en la pared. Las personas son polaroids con su retrato, las
 * pruebas fichas con su foto, los hechos notas amarillas y los lugares
 * tarjetas; los hilos unen las relaciones y las deducciones establecidas.
 * Lo nuevo cae del aire y se clava; tocar cualquier pieza la acerca.
 */
/** Tamaño de cada pieza en el lienzo del corcho (unidades del lienzo). */
const CELL = { person: [150, 210], evidence: [184, 178], small: [170, 150], case: [240, 210] } as const;
const GAP = 90;

interface Placed {
  pin: Pin;
  x: number;
  y: number;
  w: number;
}

/** Coloca las piezas en zonas: personas a la izquierda, el caso en el centro, las pruebas a la derecha. */
function layout(groups: { people: Pin[]; center: Pin[]; evidence: Pin[] }) {
  const out: Placed[] = [];
  const top = 70;
  let x = 60;
  const zones: Array<{ label: string; x: number }> = [];
  // Personas: dos filas
  const pr = 2;
  zones.push({ label: 'Personas', x });
  groups.people.forEach((pin, i) => out.push({ pin, x: x + Math.floor(i / pr) * CELL.person[0], y: top + (i % pr) * CELL.person[1], w: 112 }));
  x += Math.max(1, Math.ceil(groups.people.length / pr)) * CELL.person[0] + GAP;
  // El caso: carpeta arriba, notas y lugares debajo en dos columnas
  zones.push({ label: 'El caso', x });
  const [caseCard, ...rest] = groups.center;
  if (caseCard) out.push({ pin: caseCard, x, y: top, w: 230 });
  rest.forEach((pin, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    out.push({ pin, x: x + col * CELL.small[0], y: top + CELL.case[1] + row * CELL.small[1], w: 146 });
  });
  x += Math.max(CELL.case[0], 2 * CELL.small[0]) + GAP;
  // Pruebas: tres filas
  const er = 3;
  zones.push({ label: 'Pruebas', x });
  groups.evidence.forEach((pin, i) => out.push({ pin, x: x + Math.floor(i / er) * CELL.evidence[0], y: top + (i % er) * CELL.evidence[1], w: 150 }));
  x += Math.max(1, Math.ceil(groups.evidence.length / er)) * CELL.evidence[0] + 40;
  const rowsCenter = Math.ceil(rest.length / 2);
  const height = Math.max(top + pr * CELL.person[1], top + er * CELL.evidence[1], top + CELL.case[1] + rowsCenter * CELL.small[1]) + 40;
  return { placed: out, width: Math.max(x, 900), height: Math.max(height, 560), zones };
}

/** Ruta raíz del expediente: el corcho ya está siempre de fondo. */
export function CaseHome() {
  return null;
}

export function CaseWall() {
  const { c, k, inv, revealed, base, closed } = useCase();
  const navigate = useNavigate();
  const viewRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<{ pin: Pin; from: DOMRect } | null>(null);
  const { seen, remember } = useSeen(inv?.id);

  const people = revealed ? c.characters.filter((x) => x.role !== 'investigator') : visibleCharacters(c, k).filter((x) => x.role !== 'investigator');
  const evidence = revealed ? c.evidence : discoveredEvidence(c, k);
  const places = c.locations.filter((l) => revealed || evaluateCondition(l.appearsWhen, k));
  const facts = c.facts.filter((f) => k.facts.has(f.id) && f.important);
  const myRole = c.coop?.roles.find((r) => r.id === inv?.role);

  const sig = [people, places, facts, evidence].map((l) => l.map((x) => x.id).join()).join('|');
  const groups = useMemo(
    () => ({
      people: people.map((p) => ({ kind: 'person' as const, id: p.id })),
      center: [
        { kind: 'case' as const, id: c.id },
        { kind: 'timeline' as const, id: 'timeline' },
        ...facts.map((f) => ({ kind: 'fact' as const, id: f.id })),
        ...places.map((p) => ({ kind: 'place' as const, id: p.id })),
      ],
      evidence: evidence.map((e) => ({ kind: 'evidence' as const, id: e.id })),
    }),
    [c.id, sig],
  );
  const { placed, width, height, zones } = useMemo(() => layout(groups), [groups]);
  const pins = placed.map((p) => p.pin);
  const fresh = new Set(pins.filter((p) => !seen.has(keyOf(p))).map(keyOf));
  const firstVisit = seen.size === 0;
  const freshList = [...fresh];

  useEffect(() => {
    // Lo que ya se ha visto en el corcho no vuelve a caer al entrar otra vez.
    const t = setTimeout(() => remember(pins.map(keyOf)), 1500);
    return () => clearTimeout(t);
  }, [sig]);

  // ── Cámara: el corcho entero se ve pequeño; se acerca con los dedos ──
  const [cam, setCam] = useState({ s: 1, x: 0, y: 0, fit: 1 });
  const fitView = () => {
    const el = viewRef.current;
    if (!el) return;
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    const fit = Math.min(vw / width, vh / height);
    setCam({ s: fit, x: (vw - width * fit) / 2, y: (vh - height * fit) / 2, fit });
  };
  useLayoutEffect(() => {
    fitView();
    const el = viewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(fitView);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height]);

  const clampCam = (n: { s: number; x: number; y: number; fit: number }) => {
    const el = viewRef.current;
    if (!el) return n;
    const s2 = Math.min(Math.max(n.s, n.fit * 0.9), Math.max(2.2, n.fit * 3));
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    const w = width * s2;
    const h = height * s2;
    const x = w <= vw ? (vw - w) / 2 : Math.min(40, Math.max(vw - w - 40, n.x));
    const y = h <= vh ? (vh - h) / 2 : Math.min(40, Math.max(vh - h - 40, n.y));
    return { ...n, s: s2, x, y };
  };
  const zoomAt = (factor: number, px: number, py: number) =>
    setCam((c0) => {
      const s2 = Math.min(Math.max(c0.s * factor, c0.fit * 0.9), Math.max(2.2, c0.fit * 3));
      const k2 = s2 / c0.s;
      return clampCam({ ...c0, s: s2, x: px - (px - c0.x) * k2, y: py - (py - c0.y) * k2 });
    });

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ d: number; s: number; x: number; y: number; cx: number; cy: number; moved: boolean } | null>(null);
  const dragged = useRef(false);
  const lastTap = useRef(0);
  const local = (e: { clientX: number; clientY: number }) => {
    const r = viewRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, local(e));
    const pts = [...pointers.current.values()];
    const [a, b] = pts;
    dragged.current = false;
    gesture.current = {
      d: a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0,
      s: cam.s,
      x: cam.x,
      y: cam.y,
      cx: a && b ? (a.x + b.x) / 2 : a!.x,
      cy: a && b ? (a.y + b.y) / 2 : a!.y,
      moved: false,
    };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, local(e));
    const g = gesture.current;
    if (!g) return;
    const [a, b] = [...pointers.current.values()];
    if (a && b && g.d > 0) {
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      const s2 = g.s * (d / g.d);
      const k2 = s2 / g.s;
      dragged.current = true;
      setCam((c0) => clampCam({ ...c0, s: s2, x: cx - (g.cx - g.x) * k2, y: cy - (g.cy - g.y) * k2 }));
    } else if (a) {
      const dx = a.x - g.cx;
      const dy = a.y - g.cy;
      if (!g.moved && Math.hypot(dx, dy) < 7) return;
      g.moved = true;
      dragged.current = true;
      if (!(e.target as Element).hasPointerCapture?.(e.pointerId)) (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      setCam((c0) => clampCam({ ...c0, x: g.x + dx, y: g.y + dy }));
    }
  };
  const onUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    const [a] = [...pointers.current.values()];
    gesture.current = a ? { d: 0, s: cam.s, x: cam.x, y: cam.y, cx: a.x, cy: a.y, moved: true } : null;
    if (!dragged.current) {
      const now = Date.now();
      const p = local(e);
      // Doble toque en el corcho vacío: acercar ahí, o volver a verlo entero
      if (now - lastTap.current < 300 && (e.target as Element).closest('[data-pin]') === null) {
        if (cam.s > cam.fit * 1.3) fitView();
        else zoomAt(2.2, p.x, p.y);
        lastTap.current = 0;
      } else lastTap.current = now;
    }
  };

  const threads: Array<{ a: string; b: string; strong: boolean }> = [];
  const visiblePeople = new Set(people.map((p) => p.id));
  for (const r of c.relationships) {
    if (visiblePeople.has(r.a) && visiblePeople.has(r.b) && (revealed || evaluateCondition(r.visibleWhen, k))) threads.push({ a: `person:${r.a}`, b: `person:${r.b}`, strong: false });
  }
  const evIds = new Set(evidence.map((e) => e.id));
  const pieceOwner = (piece: string) => (evIds.has(piece) ? piece : evidence.find((e) => e.details.some((d) => d.id === piece))?.id);
  for (const d of c.deductions) {
    if (!inv?.deductions.includes(d.id)) continue;
    const owners = [...new Set(d.combine.map(pieceOwner).filter((x): x is string => !!x))];
    for (let i = 1; i < owners.length; i++) threads.push({ a: `evidence:${owners[0]}`, b: `evidence:${owners[i]}`, strong: true });
  }
  const anchor = new Map(placed.map((p) => [keyOf(p.pin), { x: p.x + p.w / 2, y: p.y + 8 }]));

  const lift = (pin: Pin, el: HTMLElement) => {
    if (dragged.current) return;
    sound.play(pin.kind === 'evidence' ? 'paper' : 'tap');
    haptic('light');
    if (pin.kind === 'timeline') return void navigate(`${base}/cronologia`);
    setOpen({ pin, from: el.getBoundingClientRect() });
  };

  const card = (pin: Pin, i: number) => {
    const key = keyOf(pin);
    const common = {
      'data-pin': key,
      'data-new': fresh.has(key) || undefined,
      style: { ...jitter(key), ...pos(key), '--i': firstVisit ? i : fresh.has(key) ? freshList.indexOf(key) : 0 } as CSSProperties,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => lift(pin, e.currentTarget),
    };
    if (pin.kind === 'person') {
      const p = c.characters.find((x) => x.id === pin.id)!;
      return (
        <button key={key} className={s.polaroid} data-role={p.role} {...common} aria-label={`${p.name}, ${ROLE[p.role]}`}>
          <span className={s.pinHead} />
          <Portrait character={p} size={86} src={portraitUrl(c, p)} recreation={c.origin === 'real'} />
          <span className={s.caption}>{p.name}</span>
          <span className={s.sub}>{ROLE[p.role]}</span>
        </button>
      );
    }
    if (pin.kind === 'evidence') {
      const e = c.evidence.find((x) => x.id === pin.id)!;
      const img = e.body.find((b) => b.type === 'image');
      const src = img && img.type === 'image' ? assetUrl(c.id, c, img.asset) : e.asset ? assetUrl(c.id, c, e.asset) : undefined;
      const unread = !k.examined.has(e.id) && !closed;
      return (
        <button key={key} className={s.evidence} data-kind={e.kind} data-photo={!!src || undefined} {...common} aria-label={`Prueba: ${e.title}${unread ? ', sin leer' : ''}`}>
          <span className={s.pinHead} />
          {src && <img className={s.thumb} src={src} alt="" loading="lazy" draggable={false} />}
          <span className={s.kindLabel}>{EVIDENCE_KIND_LABELS[e.kind]}</span>
          <span className={s.evTitle}>{e.title}</span>
          {unread && <span className={s.unread}>Sin leer</span>}
        </button>
      );
    }
    if (pin.kind === 'place') {
      const l = c.locations.find((x) => x.id === pin.id)!;
      return (
        <button key={key} className={s.place} {...common} aria-label={`Lugar: ${l.name}`}>
          <span className={s.tape} />
          <span className={s.kindLabel}>Lugar</span>
          <span className={s.evTitle}>{l.name}</span>
        </button>
      );
    }
    if (pin.kind === 'timeline') {
      const placedEvents = inv?.timeline.length ?? 0;
      return (
        <button key={key} className={s.place} data-timeline {...common} aria-label="Cronología: ordenar los hechos">
          <span className={s.tape} />
          <span className={s.kindLabel}>Cronología</span>
          <span className={s.evTitle}>{placedEvents ? `${placedEvents} hechos en orden` : 'Ordena lo que pasó'}</span>
        </button>
      );
    }
    if (pin.kind === 'fact') {
      const f = c.facts.find((x) => x.id === pin.id)!;
      return (
        <button key={key} className={s.note} {...common} aria-label={`Hecho: ${f.text}`}>
          <span className={s.noteText}>{f.text}</span>
        </button>
      );
    }
    return (
      <button key={key} className={s.caseCard} {...common} aria-label={`Expediente: ${c.title}`}>
        <span className={s.pinHead} />
        <span className={s.kindLabel}>
          {formatCaseNumber(c.id)} · {c.eraLabel}
        </span>
        <span className={s.caseTitle}>{c.title}</span>
        <span className={s.caseLine}>{CRIME_CATEGORY_LABELS[c.category]}</span>
        <span className={s.caseLine}>{c.briefing.incidentDisplay}</span>
      </button>
    );
  };

  const placedBy = new Map(placed.map((p) => [keyOf(p.pin), p]));
  function pos(key: string): CSSProperties {
    const p = placedBy.get(key);
    return p ? ({ left: p.x, top: p.y, position: 'absolute' } as CSSProperties) : {};
  }

  return (
    <div className={s.frame}>
      <div
        ref={viewRef}
        className={s.viewport}
        aria-label="Corcho del caso"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onWheel={(e) => {
          const p = local(e);
          zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, p.x, p.y);
        }}
        onClickCapture={(e) => {
          if (dragged.current) {
            e.stopPropagation();
            e.preventDefault();
            dragged.current = false;
          }
        }}
      >
        <div className={`m-cork ${s.canvas}`} style={{ width, height, transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.s})` }}>
          {zones.map((z) => (
            <span key={z.label} className={s.groupLabel} style={{ left: z.x, top: 22 }}>
              {z.label}
            </span>
          ))}
          {myRole && <h2 className={s.role} style={{ left: zones[1]?.x ?? 0, top: 46 }}>{`Tu papel · ${myRole.id} · ${myRole.title}`}</h2>}
          <svg className={s.threads} width={width} height={height} aria-hidden="true">
            {threads.map((t, i) => {
              const a = anchor.get(t.a);
              const b = anchor.get(t.b);
              if (!a || !b) return null;
              const sag = Math.min(80, Math.hypot(b.x - a.x, b.y - a.y) / 5);
              return <path key={i} className={t.strong ? s.brass : s.wool} d={`M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${(a.y + b.y) / 2 + sag} ${b.x} ${b.y}`} pathLength={1} />;
            })}
          </svg>
          {placed.map((p, i) => card(p.pin, i))}
          <div className={s.lampGlow} aria-hidden="true" />
        </div>
      </div>
      <div className={s.zoomBar}>
        <button type="button" onClick={() => zoomAt(1 / 1.4, (viewRef.current?.clientWidth ?? 0) / 2, (viewRef.current?.clientHeight ?? 0) / 2)} aria-label="Alejar el corcho">
          −
        </button>
        <button type="button" onClick={fitView} aria-label="Ver el corcho entero">
          ⤢
        </button>
        <button type="button" onClick={() => zoomAt(1.4, (viewRef.current?.clientWidth ?? 0) / 2, (viewRef.current?.clientHeight ?? 0) / 2)} aria-label="Acercar el corcho">
          +
        </button>
      </div>
      {open && <Lifted pin={open.pin} from={open.from} onClose={() => setOpen(null)} go={(to) => (setOpen(null), void navigate(to))} />}
      {!closed && <p className={s.hint}>Pellizca para acercar · arrastra para moverte · toca una pieza para abrirla</p>}
    </div>
  );
}

/** La pieza tocada sale del corcho y se acerca, con lo que se sabe de ella. */
function Lifted({ pin, from, onClose, go }: { pin: Pin; from: DOMRect; onClose: () => void; go: (to: string) => void }) {
  const { c, k, inv, base, closed } = useCase();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const start = {
    '--fx': `${from.left + from.width / 2 - vw / 2}px`,
    '--fy': `${from.top + from.height / 2 - vh / 2}px`,
    '--fs': `${Math.max(0.2, from.width / Math.min(vw * 0.8, 640))}`,
  } as CSSProperties;
  let body: React.ReactNode = null;
  if (pin.kind === 'person') {
    const p = c.characters.find((x) => x.id === pin.id)!;
    const canAsk = !closed && availableInterrogations(c, k, inv?.role).some((it) => it.characterId === p.id);
    body = (
      <div className={s.liftPerson}>
        <Portrait character={p} size={170} src={portraitUrl(c, p)} recreation={c.origin === 'real'} />
        <div>
          <p className={s.kindLabel}>{ROLE[p.role]}</p>
          <h2 className={s.liftTitle}>{p.name}</h2>
          <p className={s.liftSub}>
            {p.occupation}
            {p.age ? ` · ${p.age} años` : p.ageLabel ? ` · ${p.ageLabel}` : ''}
          </p>
          <p className={s.liftText}>{p.summary}</p>
          <div className={s.liftActions}>
            <button className={s.primary} onClick={() => go(`${base}/personas/${p.id}`)}>
              Ficha completa
            </button>
            {canAsk && (
              <button className={s.secondary} onClick={() => (sound.play('phone'), go(`${base}/interrogatorio/${p.id}`))}>
                Interrogar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  } else if (pin.kind === 'evidence') {
    const e = c.evidence.find((x) => x.id === pin.id)!;
    const img = e.body.find((b) => b.type === 'image');
    const src = img && img.type === 'image' ? assetUrl(c.id, c, img.asset) : e.asset ? assetUrl(c.id, c, e.asset) : undefined;
    body = (
      <div className={s.liftEvidence}>
        {src && <img className={s.liftImg} src={src} alt={e.title} />}
        <div>
          <p className={s.kindLabel}>
            {EVIDENCE_KIND_LABELS[e.kind]}
            {e.source ? ` · ${e.source}` : ''}
          </p>
          <h2 className={s.liftTitle}>{e.title}</h2>
          <p className={s.liftText}>{e.summary}</p>
          <div className={s.liftActions}>
            <button className={s.primary} onClick={() => go(`${base}/evidencias/${e.id}`)}>
              {closed ? 'Ver la prueba' : 'Examinar la prueba'}
            </button>
          </div>
        </div>
      </div>
    );
  } else if (pin.kind === 'place') {
    const l = c.locations.find((x) => x.id === pin.id)!;
    body = (
      <div>
        <p className={s.kindLabel}>Lugar</p>
        <h2 className={s.liftTitle}>{l.name}</h2>
        <p className={s.liftText}>{l.description}</p>
      </div>
    );
  } else if (pin.kind === 'fact') {
    const f = c.facts.find((x) => x.id === pin.id)!;
    body = (
      <div>
        <p className={s.kindLabel}>Lo que ya sabes</p>
        <p className={s.liftHand}>{f.text}</p>
      </div>
    );
  } else {
    body = (
      <div>
        <p className={s.kindLabel}>
          {formatCaseNumber(c.id)} · {c.eraLabel}
        </p>
        <h2 className={s.liftTitle}>{c.title}</h2>
        {c.subtitle && <p className={s.liftSub}>{c.subtitle}</p>}
        <p className={s.liftText}>{c.briefing.summary}</p>
        <div className={s.liftActions}>
          <button className={s.primary} onClick={() => go(`${base}/expediente`)}>
            Leer el expediente completo
          </button>
        </div>
      </div>
    );
  }
  return (
    <dialog ref={ref} className={s.liftDialog} onClose={onClose} onClick={(ev) => ev.target === ref.current && ref.current?.close()} aria-label="Pieza del corcho">
      <article className={`m-paper ${s.lifted}`} data-kind={pin.kind} style={start}>
        <button className={s.close} onClick={() => ref.current?.close()} aria-label="Devolver al corcho">
          ✕
        </button>
        {body}
      </article>
    </dialog>
  );
}
