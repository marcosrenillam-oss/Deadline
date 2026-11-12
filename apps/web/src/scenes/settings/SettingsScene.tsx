import { useState } from 'react';
import { BackToDesk } from '../../ui/BackToDesk.tsx';
import surface from '../../ui/Surface.module.css';
import { sound } from '../../audio/sound.ts';
import { LightPanel, SoundPanel, TouchPanel, ReadingPanel } from './panels.tsx';
import { OfficePanel } from './OfficePanel.tsx';
import { ArchivePanel } from './ArchivePanel.tsx';
import styles from './SettingsScene.module.css';

const TABS = [
  { id: 'light', label: 'Luz', Panel: LightPanel },
  { id: 'sound', label: 'Sonido', Panel: SoundPanel },
  { id: 'touch', label: 'Tacto', Panel: TouchPanel },
  { id: 'reading', label: 'Lectura', Panel: ReadingPanel },
  { id: 'office', label: 'Oficina', Panel: OfficePanel },
  { id: 'archive', label: 'Archivo', Panel: ArchivePanel },
] as const;

type TabId = (typeof TABS)[number]['id'];

/** LA LÁMPARA: ajustes de la oficina. Cada cambio se guarda al instante en el dispositivo. */
export function SettingsScene() {
  const [tab, setTab] = useState<TabId>('light');
  const current = TABS.find((t) => t.id === tab) ?? TABS[0];
  const { Panel } = current;
  return (
    <main className={surface.wood}>
      <div className={`${surface.safe} ${styles.layout}`}>
        <nav className={styles.side} aria-label="Apartados de ajustes">
          <BackToDesk label="Escritorio" />
          <div role="tablist" aria-orientation="vertical" className={styles.tabs}>
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={t.id === tab}
                aria-controls={`panel-${t.id}`}
                className={styles.tab}
                onClick={() => {
                  sound.play('page');
                  setTab(t.id);
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </nav>
        <section
          key={tab}
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          className={`${surface.card} ${surface.scene} ${surface.scroll} ${styles.panel}`}
        >
          <h1 className={styles.title}>{current.id === 'archive' ? 'Archivo personal' : current.label}</h1>
          <Panel />
        </section>
      </div>
    </main>
  );
}
