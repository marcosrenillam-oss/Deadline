import { useState } from 'react';
import { APP_VERSION, BUILD_TIME } from '../../platform/env.ts';
import { useOnline } from '../../platform/hooks.ts';
import { formatBytes, requestPersistentStorage } from '../../storage/persistence.ts';
import { BackToDesk } from '../../ui/BackToDesk.tsx';
import surface from '../../ui/Surface.module.css';
import { idbRoundTrip, useDiagnostics } from './useDiagnostics.ts';
import styles from './DiagnosticsScene.module.css';

const yesNo = (v: boolean | null | undefined) => (v === null || v === undefined ? '—' : v ? 'Sí' : 'No');

/**
 * Diagnóstico técnico real del dispositivo. Pensado para las pruebas en
 * iPhone físico: modo standalone, zonas seguras, almacenamiento, IndexedDB
 * y service worker.
 */
export function DiagnosticsScene() {
  const { data, refresh } = useDiagnostics();
  const online = useOnline();
  const [roundTrip, setRoundTrip] = useState<string>('—');
  const [persistMsg, setPersistMsg] = useState<string | null>(null);

  const runRoundTrip = async () => {
    setRoundTrip('Probando…');
    try {
      setRoundTrip(`Correcta · ${(await idbRoundTrip()).toFixed(1)} ms`);
    } catch (err) {
      setRoundTrip(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
    refresh();
  };

  const askPersist = async () => {
    const granted = await requestPersistentStorage();
    setPersistMsg(granted ? 'Concedido por el sistema.' : 'El sistema no lo ha concedido (habitual en iOS hasta que la app se usa con frecuencia).');
    refresh();
  };

  const rows: Array<[string, string]> = data
    ? [
        ['Versión', `${APP_VERSION} · ${new Date(BUILD_TIME).toLocaleString('es-ES')}`],
        ['Modo', data.standalone ? 'App instalada (standalone)' : 'Navegador'],
        ['iOS', yesNo(data.ios)],
        ['Pantalla táctil', yesNo(data.coarsePointer)],
        ['Conexión', online ? 'En línea' : 'Sin conexión'],
        ['Orientación', data.orientation],
        ['Viewport', `${data.viewport.w} × ${data.viewport.h} · ${data.viewport.dpr}x`],
        ['Zonas seguras', `↑${data.safeArea.top} →${data.safeArea.right} ↓${data.safeArea.bottom} ←${data.safeArea.left}`],
        ['IndexedDB', data.idb.ok ? `Operativa · v${data.idb.version}` : `Error: ${data.idb.error}`],
        ['Registros locales', data.idb.counts ? Object.entries(data.idb.counts).map(([k, v]) => `${k} ${v}`).join(' · ') : '—'],
        ['Primer arranque', data.firstLaunchAt ? new Date(data.firstLaunchAt).toLocaleString('es-ES') : '—'],
        ['Almacenamiento usado', `${formatBytes(data.storage.usage)} de ${formatBytes(data.storage.quota)}`],
        ['Persistente', yesNo(data.storage.persisted)],
        [
          'Service worker',
          !data.serviceWorker.supported
            ? 'No soportado'
            : data.serviceWorker.registered
              ? `Registrado · ${data.serviceWorker.state ?? '—'} · ${data.serviceWorker.controlled ? 'controla la página' : 'aún no controla'}`
              : 'No registrado',
        ],
        ['Prueba de escritura', roundTrip],
      ]
    : [];

  return (
    <main className={surface.wood}>
      <div className={`${surface.safe} ${styles.layout}`}>
        <header className={styles.nav}>
          <BackToDesk />
        </header>
        <section className={`${surface.card} ${surface.scene} ${surface.scroll} ${styles.sheet}`} aria-labelledby="diag-title">
          <h1 id="diag-title" className={styles.title}>
            Diagnóstico técnico
          </h1>
          {!data ? (
            <p className={styles.loading}>Leyendo el dispositivo…</p>
          ) : (
            <dl className={styles.grid}>
              {rows.map(([k, v]) => (
                <div key={k} className={styles.row}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className={styles.actions}>
            <button className={styles.button} onClick={() => void runRoundTrip()}>
              Probar escritura local
            </button>
            <button className={styles.button} onClick={() => void askPersist()}>
              Solicitar almacenamiento persistente
            </button>
            <button className={styles.button} onClick={refresh}>
              Releer
            </button>
          </div>
          {persistMsg && <p className={styles.note}>{persistMsg}</p>}
        </section>
      </div>
    </main>
  );
}
