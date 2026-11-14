import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router';
import { DAILY_TOTAL } from '@deadline/core';
import { sectionById } from '../../app/sections.ts';
import { sound, type Sfx } from '../../audio/sound.ts';
import { haptic } from '../../audio/haptics.ts';
import { useProfile } from '../../profile/ProfileProvider.tsx';
import { useSettings } from '../../settings/SettingsProvider.tsx';
import { useProgress } from '../../progression/useProgress.ts';
import { useOnline } from '../../platform/hooks.ts';
import { useDeskData } from '../desk/useDeskData.ts';
import { GuideDialog } from '../desk/GuideDialog.tsx';
import { startMotion } from './motion.ts';
import { quadMatrix, type Pt } from './perspective.ts';
import s from './PhotoDesk.module.css';

type Target = 'folder' | 'calendar' | 'cabinet' | 'phone' | 'typewriter' | 'notebook' | 'lamp' | 'board' | 'nameplate';

interface DeskMeta {
  width: number;
  height: number;
  objects: Record<Target, { hull: Pt[]; crop?: [number, number, number, number] }>;
  surfaces: { calendar: [Pt, Pt, Pt, Pt]; typewriter: [Pt, Pt, Pt, Pt]; nameplate: [Pt, Pt, Pt, Pt] };
  lamp: Pt;
  /** Hay piezas de oficina renderizadas (desk/var/variants.json). */
  variants?: boolean;
}

const META: Record<Target, { name: string; hint: string; sfx: Sfx[] }> = {
  folder: { name: 'Carpeta de expedientes', hint: 'La biblioteca: todos los casos del archivo.', sfx: ['paper'] },
  calendar: { name: 'Calendario', hint: 'El caso del día y los 500 diarios.', sfx: ['tear'] },
  cabinet: { name: 'Fichero', hint: 'Tu archivo personal: resueltos, cerrados, fallidos y reabribles.', sfx: ['paper'] },
  phone: { name: 'Teléfono', hint: 'Investigación en pareja.', sfx: ['phone'] },
  typewriter: { name: 'Máquina de escribir', hint: 'Registro, estadísticas, logros y clasificación.', sfx: ['key', 'ding'] },
  notebook: { name: 'Libreta', hint: 'Tus notas, hipótesis y sospechas.', sfx: ['page'] },
  lamp: { name: 'Lámpara', hint: 'Luz, sonido, lectura y oficina. Mantén pulsada la pantalla verde para apagarla.', sfx: ['switch'] },
  board: { name: 'Corcho', hint: 'El tablero de la investigación en curso.', sfx: ['tap'] },
  nameplate: { name: 'Placa', hint: 'Tu ficha de investigador.', sfx: ['stamp'] },
};
const ROUTE: Partial<Record<Target, string>> = {
  folder: sectionById('archive').path,
  calendar: sectionById('daily').path,
  cabinet: sectionById('personal').path,
  phone: sectionById('coop').path,
  typewriter: sectionById('history').path,
  notebook: sectionById('notebook').path,
  lamp: sectionById('settings').path,
  nameplate: '/perfil',
};
/** Personalizaciones renderizadas aparte (scripts/desk-render/variants.py). */
interface VariantMeta {
  desk: string[];
  patches: Partial<Record<'lamp' | 'phone' | 'typewriter' | 'notebook', { box: [number, number, number, number]; lift: [number, number, number, number]; variants: string[] }>>;
  decor: Record<string, [number, number, number, number]>;
}
const PATCH_SLOTS = ['lamp', 'phone', 'typewriter', 'notebook'] as const;
type PatchSlot = (typeof PATCH_SLOTS)[number];

const ORDER: Target[] = ['folder', 'calendar', 'cabinet', 'phone', 'typewriter', 'notebook', 'lamp', 'board', 'nameplate'];
const LONG_PRESS_MS = 450;
const BASE = import.meta.env.BASE_URL;

function reducedMotion(setting: 'system' | 'on' | 'off'): boolean {
  if (setting === 'on') return true;
  if (setting === 'off') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * EL DESPACHO FOTORREALISTA (D-069).
 * La mesa es una imagen renderizada con Blender a partir de recursos CC0;
 * los objetos siguen siendo el menú: zonas táctiles con su forma exacta,
 * recorte que se levanta al abrir, lámpara que se enciende y textos vivos
 * pintados en perspectiva sobre el calendario, la máquina y la placa.
 */
export function PhotoDesk({ onFail }: { onFail: () => void }) {
  const navigate = useNavigate();
  const { settings, update } = useSettings();
  const { profile } = useProfile();
  const progress = useProgress();
  const data = useDeskData();
  const online = useOnline();
  const [meta, setMeta] = useState<DeskMeta | null>(null);
  const [variants, setVariants] = useState<VariantMeta | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [box, setBox] = useState({ w: 0, h: 0, x: 0, y: 0 });
  const [label, setLabel] = useState<{ id: Target; text?: string } | null>(null);
  const [opening, setOpening] = useState<Target | null>(null);
  const [touched, setTouched] = useState<Target | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const host = useRef<HTMLDivElement>(null);
  const press = useRef<{ id: Target; timer: ReturnType<typeof setTimeout> | null; long: boolean; x: number; y: number } | null>(null);
  const rm = reducedMotion(settings.reducedMotion);

  useEffect(() => {
    fetch(`${BASE}desk/desk.json`)
      .then((r) => (r.ok ? (r.json() as Promise<DeskMeta>) : Promise.reject(new Error(String(r.status)))))
      .then((m) => {
        setMeta(m);
        // Sin variantes renderizadas la mesa se ve con su equipo de serie.
        if (m.variants)
          fetch(`${BASE}desk/var/variants.json`)
            .then((r) => (r.ok ? (r.json() as Promise<VariantMeta>) : null))
            .then(setVariants, () => setVariants(null));
      }, () => onFail());
  }, [onFail]);

  const equipped = profile?.equipped;
  const deskVariant = equipped && variants?.desk.includes(equipped.desk) ? equipped.desk : null;
  const patchFor = (slot: PatchSlot): string | null => {
    const id = equipped?.[slot];
    return id && variants?.patches[slot]?.variants.includes(id) ? id : null;
  };
  const decor = equipped && variants?.decor[equipped.decor] ? equipped.decor : null;
  const pct = (b: [number, number, number, number]) =>
    ({ left: `${b[0] * 100}%`, top: `${b[1] * 100}%`, width: `${(b[2] - b[0]) * 100}%`, height: `${(b[3] - b[1]) * 100}%` }) as CSSProperties;

  /** Una iluminación de la mesa: base (o mesa personalizada), objetos cambiados y adorno. */
  const layer = (lit: 'on' | 'off') => (
    <div className={lit === 'on' ? s.plateOn : s.plate} aria-hidden="true">
      <img
        className={s.full}
        src={deskVariant ? `${BASE}desk/var/desk_${deskVariant}_${lit}.webp` : `${BASE}desk/desk_${lit}.webp`}
        alt=""
        draggable={false}
        onLoad={lit === 'on' ? () => setLoaded(true) : undefined}
      />
      {PATCH_SLOTS.map((slot) => {
        const id = patchFor(slot);
        const box = variants?.patches[slot]?.box;
        return id && box ? <img key={slot} className={s.patch} src={`${BASE}desk/var/patch_${id}_${lit}.webp`} alt="" draggable={false} style={pct(box)} /> : null;
      })}
      {decor && variants && <img className={s.patch} src={`${BASE}desk/var/decor_${decor}_${lit}.webp`} alt="" draggable={false} style={pct(variants.decor[decor]!)} />}
    </div>
  );

  // La imagen cubre toda la pantalla manteniendo su proporción (como object-fit: cover).
  useEffect(() => {
    const el = host.current;
    if (!el || !meta) return;
    const fit = () => {
      const ar = meta.width / meta.height;
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      const w = Math.max(vw, vh * ar) * 1.04;
      const h = w / ar;
      setBox({ w, h, x: (vw - w) / 2, y: (vh - h) / 2 });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [meta]);

  useEffect(() => {
    if (!settings.deviceMotion || rm) return;
    return startMotion((x, y) => setTilt({ x, y }));
  }, [settings.deviceMotion, rm]);

  // Textos vivos
  const day = String(data.today.getDate());
  const month = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(data.today);
  const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(data.today);
  const dailyIndex = data.ledger?.highestUnlocked ?? -1;
  const dailyLabel = dailyIndex >= 0 ? `Diario nº ${dailyIndex + 1} de ${DAILY_TOTAL}` : 'Calendario sin iniciar';
  const investigator = profile?.investigatorNumber ?? '—';
  const rank = progress?.soloRank.label ?? 'Novato';
  const opened = data.firstLaunchAt ? new Date(data.firstLaunchAt).toLocaleDateString('es-ES') : '—';
  const lines = [`Oficina: ${opened}`, `Investigaciones: ${data.investigations}`, `Resueltos: ${data.solved}`, `Logros: ${profile?.achievements.length ?? 0}`, online ? 'Línea abierta' : 'Sin conexión'];

  const px = (p: Pt): Pt => [p[0] * box.w, p[1] * box.h];
  const poly = (t: Target) => meta?.objects[t]?.hull.map((p) => `${p[0] * box.w},${p[1] * box.h}`).join(' ') ?? '';
  const center = (t: Target): Pt => {
    const hl = meta?.objects[t]?.hull ?? [[0.5, 0.5]];
    return [hl.reduce((a, p) => a + p[0], 0) / hl.length, hl.reduce((a, p) => a + p[1], 0) / hl.length];
  };

  const activate = async (id: Target) => {
    if (opening) return;
    sound.unlock();
    META[id].sfx.forEach((x, i) => (i === 0 ? sound.play(x) : setTimeout(() => sound.play(x), 260)));
    haptic('light');
    let path = ROUTE[id];
    if (id === 'board') {
      if (!data.activeBoard) {
        setLabel({ id, text: 'No tienes ninguna investigación en curso. El corcho se llena cuando abres un expediente.' });
        return;
      }
      path = data.activeBoard.path;
    }
    if (!path) return;
    setLabel(null);
    setOpening(id);
    await new Promise((r) => setTimeout(r, rm ? 80 : 900));
    void navigate(path);
  };

  const toggleLamp = () => {
    sound.unlock();
    sound.play('switch');
    haptic('light');
    update({ lampOn: !settings.lampOn });
  };

  const down = (id: Target, e: React.PointerEvent) => {
    if (opening) return;
    const p = { id, timer: null as ReturnType<typeof setTimeout> | null, long: false, x: e.clientX, y: e.clientY };
    setTouched(id);
    p.timer = setTimeout(() => {
      p.long = true;
      haptic('light');
      // Mantener pulsada la lámpara la enciende o apaga; en los demás, rótulo.
      if (id === 'lamp') toggleLamp();
      else setLabel({ id });
    }, LONG_PRESS_MS);
    press.current = p;
  };
  const up = () => {
    const p = press.current;
    press.current = null;
    setTouched(null);
    setTilt((t) => (settings.deviceMotion ? t : { x: 0, y: 0 }));
    if (!p) return;
    if (p.timer) clearTimeout(p.timer);
    if (!p.long && p.timer !== null) void activate(p.id);
  };
  const move = (e: React.PointerEvent) => {
    const p = press.current;
    const el = host.current;
    if (!el) return;
    if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 14 && p.timer) {
      clearTimeout(p.timer);
      p.timer = null;
    }
    if (p && !settings.deviceMotion && !rm) setTilt({ x: ((e.clientX - p.x) / el.clientWidth) * 2, y: ((e.clientY - p.y) / el.clientHeight) * 2 });
  };

  const focus = opening ? center(opening) : null;
  const stageStyle = {
    width: box.w,
    height: box.h,
    left: box.x,
    top: box.y,
    transform: focus
      ? `scale(1.55)`
      : `translate(${-tilt.x * 10}px, ${-tilt.y * 6}px)`,
    transformOrigin: focus ? `${focus[0] * 100}% ${focus[1] * 100}%` : '50% 50%',
  } as CSSProperties;
  const lamp = meta?.lamp ?? [0.85, 0.2];

  const describe = (id: Target): string => {
    if (id === 'calendar') return `Calendario: ${weekday} ${day} de ${month}. ${dailyLabel}${data.todayDailyNew ? '. Caso del día sin abrir' : ''}`;
    if (id === 'typewriter') return `Máquina de escribir: ${sectionById('history').title}. ${lines.join('. ')}. Resueltos: ${data.solved}`;
    if (id === 'notebook') return `Libreta: ${data.notes} anotaciones`;
    if (id === 'nameplate') return `Placa: ${rank}, investigador ${investigator}. Abrir tu ficha`;
    if (id === 'folder') return `Carpeta de expedientes: ${sectionById('archive').title}`;
    if (id === 'phone') return `Teléfono: ${sectionById('coop').title}`;
    if (id === 'lamp') return 'Lámpara: ajustes de luz, sonido, lectura, oficina y archivo personal';
    if (id === 'board') return data.activeBoard ? `Corcho: tablero de «${data.activeBoard.title}»` : 'Corcho: sin investigación en curso';
    return 'Archivador: tu archivo personal';
  };

  const labelPos = label ? center(label.id) : null;

  return (
    <main className={s.scene} data-ready={(loaded && box.w > 0) || undefined} data-lamp={settings.lampOn ? 'on' : 'off'} data-opening={opening ?? undefined} onPointerUp={up} onPointerCancel={up} onPointerMove={move} onContextMenu={(e) => e.preventDefault()}>
      <div ref={host} className={s.host}>
        {meta && box.w > 0 && (
          <div className={s.stage} style={stageStyle}>
            {layer('off')}
            {layer('on')}
            {/* Halo de la lámpara y polvo en el haz */}
            <div className={s.glow} style={{ left: `${lamp[0] * 100}%`, top: `${lamp[1] * 100}%` }} aria-hidden="true" />
            {!rm && settings.lampOn && (
              <div className={s.dust} style={{ left: `${lamp[0] * 100}%`, top: `${lamp[1] * 100}%` }} aria-hidden="true">
                {Array.from({ length: 14 }, (_, i) => (
                  <i key={i} style={{ '--i': i } as CSSProperties} />
                ))}
              </div>
            )}
            {/* Textos vivos en perspectiva */}
            <div className={s.surface} style={{ transform: quadMatrix(300, 336, meta.surfaces.calendar.map(px) as [Pt, Pt, Pt, Pt]) }}>
              <div className={s.calMonth}>{month}</div>
              <div className={s.calDay}>{day}</div>
              <div className={s.calWeek}>{weekday}</div>
              <div className={s.calLabel}>{dailyLabel}</div>
              {data.todayDailyNew && <div className={s.calFresh}>¡caso nuevo!</div>}
            </div>
            <div className={s.surface} style={{ transform: quadMatrix(400, 44, meta.surfaces.nameplate.map(px) as [Pt, Pt, Pt, Pt]) }}>
              <div className={s.plaque}>
                <span>{profile?.alias ?? 'Investigador'}</span>
                <small>
                  {rank} · {investigator}
                </small>
              </div>
            </div>
            {/* Objeto que se abre: su recorte se levanta sobre la mesa */}
            {opening && (PATCH_SLOTS as readonly string[]).includes(opening) && patchFor(opening as PatchSlot) && variants?.patches[opening as PatchSlot]?.lift ? (
              <img
                className={s.lift}
                src={`${BASE}desk/var/lift_${patchFor(opening as PatchSlot)}.webp`}
                alt=""
                style={pct(variants.patches[opening as PatchSlot]!.lift)}
              />
            ) : opening && meta.objects[opening]?.crop && (
              <img
                className={s.lift}
                src={`${BASE}desk/obj_${opening}.webp`}
                alt=""
                style={{
                  left: `${meta.objects[opening].crop![0] * 100}%`,
                  top: `${meta.objects[opening].crop![1] * 100}%`,
                  width: `${meta.objects[opening].crop![2] * 100}%`,
                  height: `${meta.objects[opening].crop![3] * 100}%`,
                }}
              />
            )}
            {/* Zonas táctiles con la forma de cada objeto */}
            <svg className={s.hits} viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true">
              {ORDER.map((id) => (
                <polygon key={id} points={poly(id)} data-touched={touched === id || undefined} onPointerDown={(e) => down(id, e)} />
              ))}
            </svg>
          </div>
        )}
      </div>
      <div className={s.vignette} aria-hidden="true" />
      {label && labelPos && (
        <div className={s.label} style={{ left: box.x + labelPos[0] * box.w, top: box.y + labelPos[1] * box.h }} role="status">
          <strong>{META[label.id].name}</strong>
          <span>{label.text ?? META[label.id].hint}</span>
        </div>
      )}
      {!settings.deskGuideDismissed && (
        <button className={s.guide} onClick={() => (sound.play('paper'), setGuideOpen(true))} aria-label="Nota de bienvenida: cómo funciona la mesa">
          Bienvenido. Toca los objetos de la mesa; mantén pulsado para saber qué es cada uno.
        </button>
      )}
      <nav className={s.sr} aria-label="Objetos de la mesa">
        {ORDER.map((id) => (
          <button key={id} onClick={() => void activate(id)} aria-label={describe(id)}>
            {META[id].name}
          </button>
        ))}
        <button onClick={toggleLamp} aria-pressed={settings.lampOn} aria-label={settings.lampOn ? 'Apagar la lámpara' : 'Encender la lámpara'}>
          Cadenita
        </button>
      </nav>
      <GuideDialog
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        onDismiss={() => {
          sound.play('paper');
          update({ deskGuideDismissed: true });
          setGuideOpen(false);
        }}
      />
    </main>
  );
}
