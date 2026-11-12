import { Link } from 'react-router';
import { SECTIONS } from '../../app/sections.ts';
import { useOnline } from '../../platform/hooks.ts';
import { Stamp } from '../../ui/Stamp.tsx';
import surface from '../../ui/Surface.module.css';
import styles from './DeskScene.module.css';

/**
 * ESCRITORIO — versión de la Etapa 1.
 *
 * Es un índice provisional sobre la mesa: valida la navegación, las zonas
 * seguras, la tipografía y la iluminación. El escritorio cenital con objetos
 * interactivos (carpeta, calendario, teléfono, máquina, lámpara, libreta)
 * sustituye esta pantalla en la Etapa 2.
 */
export function DeskScene() {
  const online = useOnline();
  return (
    <main className={surface.wood}>
      <div className={`${surface.safe} ${styles.layout}`}>
        <section className={`${surface.paper} ${surface.scene} ${styles.folder}`} aria-labelledby="desk-title">
          <div className={styles.tab} aria-hidden="true">
            ARCHIVO
          </div>
          <p className={styles.kicker}>Timeless Crime Archive</p>
          <h1 id="desk-title" className={styles.title}>
            DEADLINE
          </h1>
          <p className={styles.lede}>Cada expediente es un crimen que espera a alguien capaz de leerlo.</p>
          <div className={styles.stamps}>
            <Stamp tilt={-6}>Etapa 1 · Cimientos</Stamp>
            <Stamp tilt={3} tone="ink">
              {online ? 'Línea abierta' : 'Sin conexión'}
            </Stamp>
          </div>
        </section>

        <nav className={`${surface.card} ${surface.scene} ${surface.scroll} ${styles.index}`} aria-label="Secciones">
          <h2 className={styles.indexTitle}>Índice provisional</h2>
          <p className={styles.indexNote}>La mesa interactiva llega en la Etapa 2.</p>
          <ul className={styles.list}>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <Link to={s.path} className={styles.row} viewTransition>
                  <span className={styles.object}>{s.object}</span>
                  <span className={styles.dest}>{s.title}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/diagnostico" className={styles.diag} viewTransition>
            Diagnóstico técnico del dispositivo
          </Link>
        </nav>
      </div>
    </main>
  );
}
