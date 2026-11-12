import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import styles from './UpdateNotice.module.css';

/**
 * Avisos del service worker. Las actualizaciones nunca se aplican solas:
 * el jugador elige el momento (no interrumpimos una investigación).
 */
export function UpdateNotice() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError: (err: unknown) => console.error('[sw] Registro fallido', err),
  });

  useEffect(() => {
    if (!offlineReady) return;
    const t = setTimeout(() => setOfflineReady(false), 4500);
    return () => clearTimeout(t);
  }, [offlineReady, setOfflineReady]);

  if (needRefresh) {
    return (
      <div className={styles.slip} role="status">
        <p className={styles.text}>Hay una nueva edición del archivo.</p>
        <div className={styles.actions}>
          <button className={styles.secondary} onClick={() => setNeedRefresh(false)}>
            Más tarde
          </button>
          <button className={styles.primary} onClick={() => void updateServiceWorker(true)}>
            Actualizar
          </button>
        </div>
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
