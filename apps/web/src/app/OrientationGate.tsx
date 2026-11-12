import type { ReactNode } from 'react';
import { hasCoarsePointer } from '../platform/env.ts';
import { useIsPortrait } from '../platform/hooks.ts';
import styles from './OrientationGate.module.css';

/**
 * DEADLINE se juega en horizontal. iOS no permite bloquear la orientación
 * desde una PWA, así que en vertical se superpone una invitación a girar.
 * La aplicación NO se desmonta: girar el iPhone a mitad de un interrogatorio
 * no pierde ningún estado.
 */
export function OrientationGate({ children }: { children: ReactNode }) {
  const portrait = useIsPortrait();
  const touch = hasCoarsePointer();
  return (
    <>
      <div className={styles.app} aria-hidden={portrait || undefined} inert={portrait || undefined}>
        {children}
      </div>
      {portrait && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="rotate-title">
          <div className={styles.device} aria-hidden="true">
            <div className={styles.screen}>
              <span className={styles.mark}>DL</span>
            </div>
          </div>
          <p className={styles.kicker}>Archivo DEADLINE</p>
          <h1 id="rotate-title" className={styles.title}>
            {touch ? 'Gira el dispositivo' : 'Amplía la ventana'}
          </h1>
          <p className={styles.body}>
            {touch
              ? 'La mesa de investigación se extiende en horizontal. Gira tu iPhone para sentarte frente a ella.'
              : 'La mesa de investigación necesita una ventana más ancha que alta.'}
          </p>
        </div>
      )}
    </>
  );
}
