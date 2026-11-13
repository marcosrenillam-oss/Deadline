import { useEffect, useRef, useState } from 'react';
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
import { DeskStage, type DeskData } from './stage.ts';
import type { DeskObjectId } from './objects.ts';
import { startMotion } from './motion.ts';
import s from './Desk3DScene.module.css';

type Target = Exclude<DeskObjectId, 'chain'>;

const META: Record<Target, { name: string; hint: string; sfx: Sfx[] }> = {
  folder: { name: 'Carpeta de expedientes', hint: 'La biblioteca: todos los casos del archivo.', sfx: ['paper'] },
  calendar: { name: 'Calendario', hint: 'El caso del día y los 500 diarios.', sfx: ['tear'] },
  cabinet: { name: 'Archivador', hint: 'Tu archivo personal: resueltos, cerrados, fallidos y reabribles.', sfx: ['paper'] },
  phone: { name: 'Teléfono', hint: 'Investigación en pareja.', sfx: ['phone'] },
  typewriter: { name: 'Máquina de escribir', hint: 'Registro, estadísticas, logros y clasificación.', sfx: ['key', 'ding'] },
  notebook: { name: 'Libreta', hint: 'Tus notas, hipótesis y sospechas.', sfx: ['page'] },
  lamp: { name: 'Lámpara', hint: 'Luz, sonido, lectura y oficina. La cadenita la enciende y apaga.', sfx: ['switch'] },
  board: { name: 'Corcho', hint: 'El tablero de la investigación en curso.', sfx: ['tap'] },
  nameplate: { name: 'Placa', hint: 'Tu ficha de investigador.', sfx: ['stamp'] },
  guide: { name: 'Nota de bienvenida', hint: 'Cómo funciona la mesa.', sfx: ['paper'] },
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

const LONG_PRESS_MS = 450;

/**
 * Un único escenario 3D vive mientras la app está abierta: al volver al
 * despacho se recoloca, no se vuelve a construir (crear el contexto WebGL y
 * las texturas cuesta). Se reconstruye solo si cambia la decoración.
 */
let shared: { stage: DeskStage; canvas: HTMLCanvasElement; key: string } | null = null;

function reducedMotion(setting: 'system' | 'on' | 'off'): boolean {
  if (setting === 'on') return true;
  if (setting === 'off') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** THE DETECTIVE'S DESK en 3D: la mesa es el menú. */
export function Desk3DScene({ onFail }: { onFail: () => void }) {
  const navigate = useNavigate();
  const host = useRef<HTMLDivElement>(null);
  const stageRef = useRef<DeskStage | null>(null);
  const { settings, update } = useSettings();
  const { profile } = useProfile();
  const progress = useProgress();
  const data = useDeskData();
  const online = useOnline();
  const [label, setLabel] = useState<{ id: Target; x: number; y: number; text?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const press = useRef<{ id: DeskObjectId | null; timer: ReturnType<typeof setTimeout> | null; long: boolean; x: number; y: number } | null>(null);

  const rm = reducedMotion(settings.reducedMotion);
  const loadout = profile?.equipped;
  const loadoutKey = loadout ? Object.values(loadout).join('|') : '';

  // Textos que se pintan sobre los objetos
  const day = String(data.today.getDate());
  const month = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(data.today);
  const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(data.today);
  const dailyIndex = data.ledger?.highestUnlocked ?? -1;
  const investigator = profile?.investigatorNumber ?? '—';
  const rank = progress?.soloRank.label ?? 'Novato';
  const opened = data.firstLaunchAt ? new Date(data.firstLaunchAt).toLocaleDateString('es-ES') : '—';
  const deskData: DeskData = {
    loadout: loadout ?? {},
    investigator,
    nameplate: { name: profile?.alias ?? 'Investigador', rank: `${rank} · ${investigator}` },
    calendar: { day, month, weekday, label: dailyIndex >= 0 ? `Diario nº ${dailyIndex + 1} de ${DAILY_TOTAL}` : 'Calendario sin iniciar', fresh: data.todayDailyNew },
    typewriter: [
      'REGISTRO',
      `Oficina: ${opened}`,
      `Investigaciones: ${data.investigations}`,
      `Resueltos: ${data.solved}`,
      `Logros: ${profile?.achievements.length ?? 0}`,
      online ? 'Línea abierta' : 'Sin conexión',
    ],
    notes: data.notes,
    guide: !settings.deskGuideDismissed,
  };
  const dataRef = useRef(deskData);
  dataRef.current = deskData;

  // Montaje del escenario (compartido entre visitas)
  useEffect(() => {
    if (!profile || !host.current) return;
    let stage: DeskStage;
    try {
      if (!shared || shared.key !== loadoutKey) {
        shared?.stage.dispose();
        const canvas = document.createElement('canvas');
        canvas.className = s.canvas!;
        stage = new DeskStage(canvas, dataRef.current, { reducedMotion: rm, lampOn: settings.lampOn, lightIntensity: settings.lightIntensity, lightTone: settings.lightTone });
        shared = { stage, canvas, key: loadoutKey };
      } else {
        stage = shared.stage;
        stage.reset();
      }
    } catch (err) {
      console.error('[desk3d] No se pudo crear la escena', err);
      onFail();
      return;
    }
    const el = host.current;
    el.prepend(shared.canvas);
    stageRef.current = stage;
    const ro = new ResizeObserver(() => stage.resize(el.clientWidth, el.clientHeight));
    ro.observe(el);
    stage.resize(el.clientWidth, el.clientHeight);
    stage.start();
    const lost = (e: Event) => {
      e.preventDefault();
      onFail();
    };
    shared.canvas.addEventListener('webglcontextlost', lost);
    const onVis = () => (document.hidden ? stage.stop() : stage.start());
    document.addEventListener('visibilitychange', onVis);
    requestAnimationFrame(() => setReady(true));
    return () => {
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      shared?.canvas.removeEventListener('webglcontextlost', lost);
      stage.stop();
      shared?.canvas.remove();
      stageRef.current = null;
    };
    // El escenario se crea una vez por decoración; datos y ajustes se aplican aparte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!profile, loadoutKey]);

  // Datos vivos sobre los objetos
  const dataKey = JSON.stringify([deskData.calendar, deskData.typewriter, deskData.notes, deskData.nameplate, deskData.guide]);
  useEffect(() => {
    stageRef.current?.updateData(dataRef.current);
  }, [dataKey]);

  // Ajustes de luz y movimiento
  useEffect(() => {
    stageRef.current?.applyOptions({ reducedMotion: rm, lampOn: settings.lampOn, lightIntensity: settings.lightIntensity, lightTone: settings.lightTone });
  }, [rm, settings.lampOn, settings.lightIntensity, settings.lightTone]);

  // Profundidad con el movimiento del iPhone (si el jugador lo activó)
  useEffect(() => {
    if (!settings.deviceMotion || rm) return;
    return startMotion((x, y) => stageRef.current?.setParallax(x, y));
  }, [settings.deviceMotion, rm]);

  const activate = async (id: DeskObjectId) => {
    const stage = stageRef.current;
    if (!stage || busy) return;
    sound.unlock();
    if (id === 'chain') {
      sound.play('switch');
      haptic('light');
      void stage.pullChain();
      update({ lampOn: !settings.lampOn });
      return;
    }
    const meta = META[id];
    meta.sfx.forEach((x, i) => (i === 0 ? sound.play(x) : setTimeout(() => sound.play(x), 260)));
    haptic('light');
    stage.touch(id);
    if (id === 'guide') {
      setGuideOpen(true);
      return;
    }
    let path = ROUTE[id];
    if (id === 'board') {
      if (!data.activeBoard) {
        const p = stage.screenPosition('board');
        if (p) setLabel({ id, ...p, text: 'No tienes ninguna investigación en curso. El corcho se llena cuando abres un expediente.' });
        return;
      }
      path = data.activeBoard.path;
    }
    if (!path) return;
    setBusy(true);
    setLabel(null);
    await stage.open(id, rm ? 0 : 820);
    // Fundido a negro: la cámara ya se ha acercado al objeto; la pantalla siguiente aparece desde la penumbra.
    if (!rm) {
      setLeaving(true);
      await new Promise((r) => setTimeout(r, 220));
    }
    void navigate(path);
  };

  // Toque y pulsación larga sobre el canvas
  const onPointerDown = (e: React.PointerEvent) => {
    const stage = stageRef.current;
    if (!stage || busy) return;
    const id = stage.pick(e.clientX, e.clientY);
    const p = { id, timer: null as ReturnType<typeof setTimeout> | null, long: false, x: e.clientX, y: e.clientY };
    if (id) {
      p.timer = setTimeout(() => {
        p.long = true;
        const target = (id === 'chain' ? 'lamp' : id) as Target;
        const pos = stage.screenPosition(target);
        if (pos) setLabel({ id: target, ...pos });
        haptic('light');
        stage.touch(target);
      }, LONG_PRESS_MS);
    }
    press.current = p;
    if (!id) setLabel(null);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const p = press.current;
    const el = host.current;
    // Sin giroscopio, arrastrar el dedo inclina ligeramente la vista.
    if (p && el && !settings.deviceMotion) stageRef.current?.setParallax(((e.clientX - p.x) / el.clientWidth) * 2, ((e.clientY - p.y) / el.clientHeight) * 2);
    if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 14 && p.timer) {
      clearTimeout(p.timer);
      p.timer = null;
    }
  };
  const onPointerUp = () => {
    const p = press.current;
    press.current = null;
    if (!settings.deviceMotion) stageRef.current?.setParallax(0, 0);
    if (!p) return;
    if (p.timer) clearTimeout(p.timer);
    if (p.id && !p.long && p.timer !== null) void activate(p.id);
  };

  const targets: Target[] = ['folder', 'calendar', 'cabinet', 'phone', 'typewriter', 'notebook', 'lamp', 'board', 'nameplate', ...(settings.deskGuideDismissed ? [] : (['guide'] as Target[]))];
  const describe = (id: Target): string => {
    if (id === 'calendar') return `${META.calendar.name}: ${weekday} ${day} de ${month}. ${deskData.calendar.label}${data.todayDailyNew ? '. Caso del día sin abrir' : ''}`;
    if (id === 'typewriter') return `${META.typewriter.name}: ${sectionById('history').title}. ${deskData.typewriter.slice(1).join('. ')}`;
    if (id === 'notebook') return `${META.notebook.name}: ${data.notes} anotaciones`;
    if (id === 'nameplate') return `Placa: ${rank}, investigador ${investigator}. Abrir tu ficha`;
    if (id === 'folder') return `${META.folder.name}: ${sectionById('archive').title}`;
    if (id === 'phone') return `${META.phone.name}: ${sectionById('coop').title}`;
    if (id === 'lamp') return 'Lámpara: ajustes de luz, sonido, lectura, oficina y archivo personal';
    if (id === 'board') return data.activeBoard ? `Corcho: tablero de «${data.activeBoard.title}»` : 'Corcho: sin investigación en curso';
    return `${META[id].name}: ${META[id].hint}`;
  };

  return (
    <main className={s.scene} data-ready={ready || undefined} data-leaving={leaving || undefined}>
      <div
        ref={host}
        className={s.host}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          if (press.current?.timer) clearTimeout(press.current.timer);
          press.current = null;
        }}
        onContextMenu={(e) => e.preventDefault()}
      />
      <div className={s.vignette} aria-hidden="true" />
      {/* Navegación accesible (VoiceOver, teclado): los mismos objetos, como botones. */}
      <nav className={s.sr} aria-label="Objetos de la mesa">
        {targets.map((id) => (
          <button key={id} onClick={() => void activate(id)} aria-label={describe(id)}>
            {META[id].name}
          </button>
        ))}
        <button onClick={() => void activate('chain')} aria-pressed={settings.lampOn} aria-label={settings.lampOn ? 'Apagar la lámpara' : 'Encender la lámpara'}>
          Cadenita
        </button>
      </nav>
      {label && (
        <div className={s.label} style={{ left: label.x, top: label.y }} role="status">
          <strong>{META[label.id].name}</strong>
          <span>{label.text ?? META[label.id].hint}</span>
        </div>
      )}
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
