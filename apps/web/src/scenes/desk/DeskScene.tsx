import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router';
import { DAILY_TOTAL, rankFor } from '@deadline/core';
import { sectionById, type SectionId } from '../../app/sections.ts';
import { sound, type Sfx } from '../../audio/sound.ts';
import { haptic } from '../../audio/haptics.ts';
import { useProfile } from '../../profile/ProfileProvider.tsx';
import { useSettings } from '../../settings/SettingsProvider.tsx';
import { useOnline } from '../../platform/hooks.ts';
import { DESK_MATERIALS, LAMP_MATERIALS, NOTEBOOK_MATERIALS, PHONE_MATERIALS, TYPEWRITER_MATERIALS, pick } from './palettes.ts';
import { woodTextureUrl } from './woodTexture.ts';
import { useDeskData } from './useDeskData.ts';
import { CoffeeSvg, LampSvg, PhoneSvg, PolaroidsSvg, TypewriterSvg } from './objects/svgObjects.tsx';
import { CalendarVisual, FolderVisual, GuideNoteVisual, Nameplate, NotebookVisual } from './objects/paperObjects.tsx';
import { GuideDialog } from './GuideDialog.tsx';
import styles from './DeskScene.module.css';

type DeskObject = 'lamp' | 'folder' | 'calendar' | 'phone' | 'typewriter' | 'notebook';

const OBJECTS: Record<DeskObject, { section: SectionId; sfx: Sfx[] }> = {
  lamp: { section: 'settings', sfx: ['switch'] },
  folder: { section: 'archive', sfx: ['paper'] },
  calendar: { section: 'daily', sfx: ['tear'] },
  phone: { section: 'coop', sfx: ['phone'] },
  typewriter: { section: 'history', sfx: ['key', 'ding'] },
  notebook: { section: 'notebook', sfx: ['page'] },
};

const OPEN_DELAY_MS = 430;

function reducedMotion(): boolean {
  const attr = document.documentElement.dataset.reducedMotion;
  if (attr === 'on') return true;
  if (attr === 'off') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * THE DETECTIVE'S DESK.
 * La mesa es el menú: cada objeto abre su sección. Vista cenital, lámpara
 * arriba a la izquierda, sombras hacia abajo a la derecha.
 */
export function DeskScene() {
  const navigate = useNavigate();
  const { settings, update } = useSettings();
  const { profile } = useProfile();
  const data = useDeskData();
  const online = useOnline();
  const [opening, setOpening] = useState<DeskObject | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [wood, setWood] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const eq = profile?.equipped;
  const deskId = eq?.desk ?? 'desk-walnut';
  const desk = pick(DESK_MATERIALS, deskId, 'desk-walnut');
  const lampId = eq?.lamp ?? 'lamp-banker';
  const lamp = pick(LAMP_MATERIALS, lampId, 'lamp-banker');
  const phone = pick(PHONE_MATERIALS, eq?.phone, 'phone-bakelite');
  const typewriter = pick(TYPEWRITER_MATERIALS, eq?.typewriter, 'typewriter-black');
  const notebook = pick(NOTEBOOK_MATERIALS, eq?.notebook, 'notebook-leather');
  const decor = eq?.decor ?? 'decor-coffee';

  useEffect(() => {
    let alive = true;
    void woodTextureUrl(deskId, desk).then((url) => alive && setWood(url));
    return () => {
      alive = false;
    };
  }, [deskId, desk]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const activate = (obj: DeskObject) => {
    if (opening) return;
    const { section, sfx } = OBJECTS[obj];
    sound.unlock();
    sfx.forEach((s, i) => (i === 0 ? sound.play(s) : setTimeout(() => sound.play(s), 260)));
    haptic('light');
    const path = sectionById(section).path;
    if (reducedMotion()) {
      void navigate(path);
      return;
    }
    setOpening(obj);
    timer.current = setTimeout(() => void navigate(path, { viewTransition: true }), OPEN_DELAY_MS);
  };

  const toggleLamp = () => {
    sound.unlock();
    sound.play('switch');
    haptic('light');
    update({ lampOn: !settings.lampOn });
  };

  // Datos visibles en los objetos
  const day = String(data.today.getDate());
  const month = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(data.today);
  const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(data.today);
  const dailyIndex = data.ledger?.highestUnlocked ?? -1;
  const dailyLabel = dailyIndex >= 0 ? `Diario nº ${dailyIndex + 1} de ${DAILY_TOTAL}` : 'Calendario sin iniciar';
  const investigator = profile?.investigatorNumber ?? '—';
  const rank = profile
    ? rankFor({ merit: profile.soloMerit, perfectSolves: 0, accuracy: 0, solvedByDifficulty: { detective: 0, inspector: 0, 'special-unit': 0 } }).label
    : '';
  const opened = data.firstLaunchAt ? new Date(data.firstLaunchAt).toLocaleDateString('es-ES') : '—';
  const twLines = [
    'REGISTRO DE INVESTIGACIONES',
    `Oficina abierta el ${opened}`,
    `Investigaciones: ${data.investigations}`,
    `Casos resueltos: ${data.solved}`,
    online ? 'Línea: abierta' : 'Línea: sin conexión',
  ];

  const objectProps = (obj: DeskObject) => ({
    'data-object': obj,
    'data-opening': opening === obj ? 'true' : undefined,
    className: styles.object,
    onClick: () => activate(obj),
    disabled: opening !== null && opening !== obj,
  });

  const sceneStyle = {
    '--wood-0': desk.wood[0],
    '--wood-1': desk.wood[1],
    '--wood-2': desk.wood[2],
    '--blotter': desk.blotter,
    '--blotter-edge': desk.blotterEdge,
    '--stitch': desk.stitch,
    ...(wood ? { '--wood-image': `url(${wood})` } : {}),
  } as CSSProperties;

  return (
    <main className={styles.scene} style={sceneStyle} data-opening={opening ?? undefined}>
      <div className={styles.wood} aria-hidden="true" />
      <div className={styles.safe}>
        <div className={styles.stage}>
          <div className={styles.blotter} aria-hidden="true" />

          {decor === 'decor-coffee' && (
            <div className={styles.decor} data-decor="coffee" aria-hidden="true">
              <CoffeeSvg />
            </div>
          )}
          {decor === 'decor-polaroids' && (
            <div className={styles.decor} data-decor="polaroids" aria-hidden="true">
              <PolaroidsSvg />
            </div>
          )}

          <button {...objectProps('folder')} aria-label={`Carpeta de expedientes: ${sectionById('archive').title}`}>
            <FolderVisual investigator={investigator} />
          </button>

          <button {...objectProps('typewriter')} aria-label={`Máquina de escribir: ${sectionById('history').title}. ${twLines.slice(1).join('. ')}`}>
            <TypewriterSvg m={typewriter} lines={twLines} />
          </button>

          <button {...objectProps('calendar')} aria-label={`Calendario: ${weekday} ${day} de ${month}. ${dailyLabel}${data.todayDailyNew ? '. Caso del día sin abrir' : ''}`}>
            <CalendarVisual day={day} month={month} weekday={weekday} dailyLabel={dailyLabel} fresh={data.todayDailyNew} />
          </button>

          <button {...objectProps('notebook')} aria-label={`Libreta: ${data.notes} anotaciones`}>
            <NotebookVisual m={notebook} count={data.notes} />
          </button>

          <button {...objectProps('phone')} aria-label={`Teléfono: ${sectionById('coop').title}`}>
            <PhoneSvg m={phone} />
          </button>

          <button {...objectProps('lamp')} data-lamp={lampId} aria-label="Lámpara: ajustes de luz, sonido, lectura, oficina y archivo personal">
            <LampSvg id={lampId} m={lamp} />
          </button>
          <button
            className={styles.chain}
            data-lamp={lampId}
            onClick={toggleLamp}
            aria-pressed={settings.lampOn}
            aria-label={settings.lampOn ? 'Apagar la lámpara' : 'Encender la lámpara'}
          />

          <button
            className={styles.nameplate}
            aria-label={`Placa: ${rank}, investigador ${investigator}. Abrir tu ficha`}
            onClick={() => {
              sound.play('stamp');
              void navigate('/perfil');
            }}
          >
            <Nameplate investigator={profile?.alias ? `${profile.alias} · ${investigator}` : investigator} rank={rank} />
          </button>

          {!settings.deskGuideDismissed && (
            <button className={styles.object} data-object="guide" onClick={() => setGuideOpen(true)} aria-label="Nota de bienvenida: cómo funciona la mesa">
              <GuideNoteVisual />
            </button>
          )}

        </div>
      </div>

      {/* Iluminación: penumbra general y halo de la lámpara (sobre toda la pantalla) */}
      <div className={styles.lightShade} aria-hidden="true" />
      <div className={styles.lightGlow} aria-hidden="true" />

      <div className={`${styles.safe} ${styles.overlay}`}>
        <div className={styles.stage}>
          <div className={styles.dust} aria-hidden="true">
            {Array.from({ length: 9 }, (_, i) => (
              <i key={i} style={{ '--i': i } as CSSProperties} />
            ))}
          </div>
          {opening && (
            <div className={styles.tag} data-for={opening} role="status">
              {sectionById(OBJECTS[opening].section).title}
            </div>
          )}
        </div>
      </div>
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
