import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router';
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
  | { kind: 'fact'; id: string };

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
export function CaseWall() {
  const { c, k, inv, revealed, base, closed } = useCase();
  const navigate = useNavigate();
  const wallRef = useRef<HTMLDivElement>(null);
  const [centers, setCenters] = useState<Record<string, { x: number; y: number }>>({});
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [open, setOpen] = useState<{ pin: Pin; from: DOMRect } | null>(null);
  const { seen, remember } = useSeen(inv?.id);

  const people = revealed ? c.characters.filter((x) => x.role !== 'investigator') : visibleCharacters(c, k).filter((x) => x.role !== 'investigator');
  const evidence = revealed ? c.evidence : discoveredEvidence(c, k);
  const places = c.locations.filter((l) => revealed || evaluateCondition(l.appearsWhen, k));
  const facts = c.facts.filter((f) => k.facts.has(f.id) && f.important);
  const myRole = c.coop?.roles.find((r) => r.id === inv?.role);

  const pins = useMemo<Pin[]>(
    () => [
      { kind: 'case', id: c.id },
      ...people.map((p) => ({ kind: 'person' as const, id: p.id })),
      ...places.map((p) => ({ kind: 'place' as const, id: p.id })),
      ...facts.map((f) => ({ kind: 'fact' as const, id: f.id })),
      ...evidence.map((e) => ({ kind: 'evidence' as const, id: e.id })),
    ],
    [c.id, people.map((p) => p.id).join(), places.map((p) => p.id).join(), facts.map((f) => f.id).join(), evidence.map((e) => e.id).join()],
  );
  const fresh = new Set(pins.filter((p) => !seen.has(keyOf(p))).map(keyOf));
  const firstVisit = seen.size === 0;

  useEffect(() => {
    // Lo que ya se ha visto en el corcho no vuelve a caer al entrar otra vez.
    const t = setTimeout(() => remember(pins.map(keyOf)), 1500);
    return () => clearTimeout(t);
  }, [pins]);

  // Hilos: se miden los centros de las piezas una vez colocadas
  useLayoutEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;
    const measure = () => {
      const box = wall.getBoundingClientRect();
      const next: Record<string, { x: number; y: number }> = {};
      wall.querySelectorAll<HTMLElement>('[data-pin]').forEach((el) => {
        const r = el.getBoundingClientRect();
        next[el.dataset.pin!] = { x: r.left - box.left + wall.scrollLeft + r.width / 2, y: r.top - box.top + 14 };
      });
      setCenters(next);
      setSize({ w: wall.scrollWidth, h: wall.clientHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wall);
    const t = setTimeout(measure, 900);
    return () => (ro.disconnect(), clearTimeout(t));
  }, [pins.length]);

  const threads: Array<{ a: string; b: string; strong: boolean; label?: string }> = [];
  const visiblePeople = new Set(people.map((p) => p.id));
  for (const r of c.relationships) {
    if (visiblePeople.has(r.a) && visiblePeople.has(r.b) && (revealed || evaluateCondition(r.visibleWhen, k))) threads.push({ a: `person:${r.a}`, b: `person:${r.b}`, strong: false, label: r.label });
  }
  const evIds = new Set(evidence.map((e) => e.id));
  const pieceOwner = (piece: string) => (evIds.has(piece) ? piece : evidence.find((e) => e.details.some((d) => d.id === piece))?.id);
  for (const d of c.deductions) {
    if (!inv?.deductions.includes(d.id)) continue;
    const owners = [...new Set(d.combine.map(pieceOwner).filter((x): x is string => !!x))];
    for (let i = 1; i < owners.length; i++) threads.push({ a: `evidence:${owners[0]}`, b: `evidence:${owners[i]}`, strong: true, label: d.title });
  }

  const lift = (pin: Pin, el: HTMLElement) => {
    sound.play(pin.kind === 'evidence' ? 'paper' : 'tap');
    haptic('light');
    setOpen({ pin, from: el.getBoundingClientRect() });
  };

  const card = (pin: Pin, i: number) => {
    const key = keyOf(pin);
    const common = {
      'data-pin': key,
      'data-new': fresh.has(key) || undefined,
      style: { ...jitter(key), '--i': firstVisit ? i : fresh.has(key) ? [...fresh].indexOf(key) : 0 } as CSSProperties,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => lift(pin, e.currentTarget),
    };
    if (pin.kind === 'person') {
      const p = c.characters.find((x) => x.id === pin.id)!;
      return (
        <button key={key} className={s.polaroid} data-role={p.role} {...common} aria-label={`${p.name}, ${ROLE[p.role]}`}>
          <span className={s.pinHead} />
          <Portrait character={p} size={86} src={portraitUrl(c, p)} />
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

  const groups: Array<{ id: string; label: string; items: Pin[] }> = [
    { id: 'people', label: 'Personas', items: pins.filter((p) => p.kind === 'person') },
    { id: 'case', label: 'El caso', items: pins.filter((p) => p.kind === 'case' || p.kind === 'place' || p.kind === 'fact') },
    { id: 'evidence', label: 'Pruebas', items: pins.filter((p) => p.kind === 'evidence') },
  ];
  let idx = 0;

  return (
    <div className={s.frame}>
      <div ref={wallRef} className={`m-cork ${s.wall}`} aria-label="Corcho del caso">
        <svg className={s.threads} width={size.w} height={size.h} aria-hidden="true">
          {threads.map((t, i) => {
            const a = centers[t.a];
            const b = centers[t.b];
            if (!a || !b) return null;
            const sag = Math.min(70, Math.hypot(b.x - a.x, b.y - a.y) / 5);
            return <path key={i} className={t.strong ? s.brass : s.wool} d={`M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${(a.y + b.y) / 2 + sag} ${b.x} ${b.y}`} pathLength={1} />;
          })}
        </svg>
        {groups.map((g) =>
          g.items.length ? (
            <section key={g.id} className={s.group} data-group={g.id} aria-label={g.label}>
              <span className={s.groupLabel}>{g.label}</span>
              {g.id === 'case' && myRole && <h2 className={s.role}>{`Tu papel · ${myRole.id} · ${myRole.title}`}</h2>}
              <div className={s.items}>{g.items.map((p) => card(p, idx++))}</div>
            </section>
          ) : null,
        )}
        <div className={s.lampGlow} aria-hidden="true" />
      </div>
      {open && <Lifted pin={open.pin} from={open.from} onClose={() => setOpen(null)} go={(to) => (setOpen(null), void navigate(to))} />}
      <p className={s.hint}>
        Toca una pieza para acercarla.{' '}
        {!closed && (
          <Link to={`${base}/expediente`} className={s.hintLink}>
            Leer el expediente completo
          </Link>
        )}
      </p>
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
        <Portrait character={p} size={170} src={portraitUrl(c, p)} />
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
