import { useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import styles from './UpdateNotice.module.css';

/** Pantallas donde una recarga interrumpiría una investigación. */
const inCase = () => /\/(expediente|pareja)\//.test(window.location.pathname);
const CHECK_EVERY_MS = 30 * 60_000;

/**
 * ACTUALIZACIONES AUTOMÁTICAS (D-059).
 *
 * - Al volver a la app y cada media hora se pregunta si hay una edición
 *   nueva (iOS apenas lo comprueba por su cuenta en una app instalada).
 * - Si la hay, se instala sola en cuanto el jugador no está dentro de un
 *   expediente: en la mesa o en cualquier otra pantalla. Dentro de un caso
 *   espera a que vuelva a la mesa, para no interrumpir la investigación.
 * - El progreso vive en IndexedDB; la recarga no lo toca.
 */
export function UpdateNotice() {
  const registration = useRef<ServiceWorkerRegistration | undefined>(undefined);
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW: (_url: string, r: ServiceWorkerRegistration | undefined) => {
      registration.current = r;
    },
    onRegisterError: (err: unknown) => console.error('[sw] Registro fallido', err),
  });

  // Buscar ediciones nuevas al volver a la app y periódicamente.
  useEffect(() => {
    const check = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) void registration.current?.update().catch(() => undefined);
    };
    document.addEventListener('visibilitychange', check);
    const t = setInterval(check, CHECK_EVERY_MS);
    return () => {
      document.removeEventListener('visibilitychange', check);
      clearInterval(t);
    };
  }, []);

  // Instalarla sola en cuanto no se esté dentro de un expediente.
  useEffect(() => {
    if (!needRefresh) return;
    let done = false;
    const tryApply = () => {
      if (done || inCase()) return;
      done = true;
      // Un respiro para que terminen las escrituras pendientes en IndexedDB.
      setTimeout(() => void updateServiceWorker(true), 1200);
    };
    tryApply();
    const t = setInterval(tryApply, 2000);
    return () => clearInterval(t);
  }, [needRefresh, updateServiceWorker]);

  // Dentro de un caso, aviso breve que no estorba (se retira solo).
  const [note, setNote] = useState(false);
  useEffect(() => {
    if (!needRefresh || !inCase()) return;
    setNote(true);
    const t = setTimeout(() => setNote(false), 6000);
    return () => clearTimeout(t);
  }, [needRefresh]);

  useEffect(() => {
    if (!offlineReady) return;
    const t = setTimeout(() => setOfflineReady(false), 4500);
    return () => clearTimeout(t);
  }, [offlineReady, setOfflineReady]);

  if (needRefresh && note) {
    return (
      <div className={styles.slip} role="status">
        <p className={styles.text}>Hay una nueva edición del archivo. Se instalará sola cuando vuelvas a la mesa.</p>
      </div>
    );
  }
  if (offlineReady) {
    return (
      <div className={styles.slip} role="status">
        <p className={styles.text}>La aplicación ya puede abrirse sin conexión.</p>
      </div>
    );
  }
  return null;
}
