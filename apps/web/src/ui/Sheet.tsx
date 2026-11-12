import { useEffect, useRef, type ReactNode } from 'react';
import styles from './Sheet.module.css';

/**
 * Hoja superpuesta (libreta, herramientas). Usa <dialog> nativo: gestiona el
 * foco, Escape y la accesibilidad sin código propio.
 */
export function Sheet({ open, onClose, title, side = 'right', children }: { open: boolean; onClose: () => void; title: string; side?: 'right' | 'center'; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={styles.sheet}
      data-side={side}
      onClose={onClose}
      onCancel={onClose}
      aria-label={title}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className={styles.inner}>
          <header className={styles.head}>
            <h2 className={styles.title}>{title}</h2>
            <button className={styles.close} onClick={onClose} aria-label="Cerrar">
              ✕
            </button>
          </header>
          <div className={styles.body}>{children}</div>
        </div>
      )}
    </dialog>
  );
}
