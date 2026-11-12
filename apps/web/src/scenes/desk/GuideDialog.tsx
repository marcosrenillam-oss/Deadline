import { useEffect, useRef } from 'react';
import styles from './GuideDialog.module.css';

const ITEMS: Array<[string, string]> = [
  ['La carpeta', 'el archivo de expedientes: casos abiertos, resueltos y por abrir.'],
  ['El calendario', 'el caso del día. Si un día no puedes, pasa al archivo; no se pierde.'],
  ['El teléfono', 'la línea para investigar en pareja.'],
  ['La máquina de escribir', 'el registro de tus investigaciones y tus estadísticas.'],
  ['La libreta', 'tus notas, hipótesis y sospechas.'],
  ['La lámpara', 'luz, sonido, lectura, tu oficina y la copia de tu archivo. Su cadenita la enciende y apaga.'],
];

/** Explicación opcional e integrada: una nota manuscrita del comisario, nunca un tutorial obligatorio. */
export function GuideDialog({ open, onClose, onDismiss }: { open: boolean; onClose: () => void; onDismiss: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className={styles.dialog} onClose={onClose} onCancel={onClose} aria-labelledby="guide-title">
      <article className={styles.letter}>
        <header className={styles.head}>
          <p className={styles.kicker}>Nota sobre la mesa</p>
          <h2 id="guide-title" className={styles.title}>
            Bienvenido al archivo
          </h2>
          <p className={styles.body}>Aquí nadie le va a llevar de la mano. Todo lo que necesita está sobre esta mesa: toque lo que quiera usar.</p>
        </header>
        <ul className={styles.list}>
          {ITEMS.map(([k, v]) => (
            <li key={k}>
              <strong>{k}:</strong> {v}
            </li>
          ))}
        </ul>
        <p className={styles.sign}>— Comisaría central, sección de archivo</p>
        <div className={styles.actions}>
          <button className={styles.secondary} onClick={onClose}>
            Dejarla en la mesa
          </button>
          <button className={styles.primary} onClick={onDismiss}>
            Retirar la nota
          </button>
        </div>
      </article>
    </dialog>
  );
}
