import { sectionById, type SectionId } from '../../app/sections.ts';
import { BackToDesk } from '../../ui/BackToDesk.tsx';
import { Stamp } from '../../ui/Stamp.tsx';
import surface from '../../ui/Surface.module.css';
import styles from './SectionScene.module.css';

/**
 * Pantalla de una sección que aún no está construida. No simula nada:
 * indica qué contendrá y en qué etapa del plan se implementa.
 */
export function SectionScene({ id }: { id: SectionId }) {
  const s = sectionById(id);
  return (
    <main className={surface.wood}>
      <div className={`${surface.safe} ${styles.layout}`}>
        <header className={styles.nav}>
          <BackToDesk />
        </header>
        <article className={`${surface.paper} ${surface.scene} ${surface.scroll} ${styles.sheet}`} aria-labelledby="section-title">
          <div className={styles.head}>
            <p className={styles.object}>{s.object}</p>
            <Stamp tilt={-5}>{`En preparación · Etapa ${s.stage}`}</Stamp>
          </div>
          <h1 id="section-title" className={styles.title}>
            {s.title}
          </h1>
          <p className={styles.desc}>{s.description}</p>
          <h2 className={styles.subhead}>Contendrá</h2>
          <ul className={styles.list}>
            {s.contents.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </article>
      </div>
    </main>
  );
}
