import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { archiveFileName, type ArchiveSummary, type DeadlineArchive, type ImportMode } from '@deadline/core';
import { applyArchive, markExported, parseArchive, prepareArchive } from '../../storage/backup.ts';
import { getMeta } from '../../storage/meta.ts';
import { formatBytes, getStorageStatus, requestPersistentStorage, type StorageStatus } from '../../storage/persistence.ts';
import { useProfile } from '../../profile/ProfileProvider.tsx';
import { useSettings } from '../../settings/SettingsProvider.tsx';
import { sound } from '../../audio/sound.ts';
import { haptic } from '../../audio/haptics.ts';
import { ActionButton, Field } from '../../ui/Controls.tsx';
import { fetchCatalog } from '../../cases/contentRepo.ts';
import { verifyAll } from '../../cases/downloads.ts';
import styles from './ArchivePanel.module.css';

const DAY = 86_400_000;

function fileFor(archive: DeadlineArchive): File {
  return new File([JSON.stringify(archive, null, 2)], archiveFileName(archive), { type: 'application/json' });
}

function download(file: File): void {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

type ImportState =
  | { step: 'idle' }
  | { step: 'error'; message: string }
  | { step: 'review'; archive: DeadlineArchive; summary: ArchiveSummary; confirmReplace: boolean }
  | { step: 'done'; mode: ImportMode };

/**
 * ARCHIVO PERSONAL: copia de seguridad del progreso.
 * Sin cuentas ni servidor, exportar es la única forma de conservar el
 * progreso si el sistema borra los datos o se cambia de iPhone.
 */
export function ArchivePanel() {
  const { profile, reload: reloadProfile } = useProfile();
  const { reload: reloadSettings } = useSettings();
  const [prepared, setPrepared] = useState<DeadlineArchive | null>(null);
  const [lastExport, setLastExport] = useState<number | null>(null);
  const [storage, setStorage] = useState<StorageStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [imp, setImp] = useState<ImportState>({ step: 'idle' });
  const [offline, setOffline] = useState<{ ready: number; total: number; bytes: number } | null>(null);
  const [checking, setChecking] = useState(false);

  const checkDownloads = async (deep: boolean) => {
    setChecking(true);
    try {
      const catalog = await fetchCatalog();
      const st = await verifyAll(catalog, deep);
      const ready = Object.values(st).filter((x) => x.state === 'verified');
      setOffline({ ready: ready.length, total: catalog.length, bytes: ready.reduce((n, x) => n + x.bytesStored, 0) });
      if (deep) setMessage(`Comprobación terminada: ${ready.length} expedientes íntegros.`);
    } catch {
      setOffline(null);
    } finally {
      setChecking(false);
    }
  };
  useEffect(() => {
    void checkDownloads(false);
  }, []);
  const input = useRef<HTMLInputElement>(null);

  const refresh = () => {
    // Se prepara de antemano: iOS solo abre la hoja de compartir dentro del gesto del usuario.
    void prepareArchive().then(setPrepared, (e: unknown) => setMessage(`No se pudo preparar la copia: ${String(e)}`));
    void getMeta<number>('lastExportAt').then((v) => setLastExport(v ?? null));
    void getStorageStatus().then(setStorage);
  };
  useEffect(refresh, []);

  const share = async () => {
    if (!prepared) return;
    const file = fileFor(prepared);
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Archivo DEADLINE' });
      } else {
        download(file);
      }
      await markExported(prepared.exportedAt);
      sound.play('stamp');
      haptic('confirm');
      setMessage('Copia entregada. Guárdala en Archivos, iCloud Drive o donde prefieras.');
      refresh();
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return; // el jugador cerró la hoja
      setMessage(`No se pudo compartir: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const saveFile = async () => {
    if (!prepared) return;
    download(fileFor(prepared));
    await markExported(prepared.exportedAt);
    setMessage('Archivo descargado.');
    refresh();
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    const result = await parseArchive(await f.text());
    if (input.current) input.current.value = '';
    setImp(result.ok ? { step: 'review', archive: result.archive, summary: result.summary, confirmReplace: false } : { step: 'error', message: result.error });
  };

  const apply = async (archive: DeadlineArchive, mode: ImportMode) => {
    await applyArchive(archive, mode);
    await Promise.all([reloadSettings(), reloadProfile()]);
    sound.play('stamp');
    haptic('confirm');
    setImp({ step: 'done', mode });
    refresh();
  };

  const stale = lastExport === null || Date.now() - lastExport > 14 * DAY;

  return (
    <>
      <Field label="Número de investigador" hint="Generado en este dispositivo. Viaja con tus copias.">
        <span className={styles.badge}>{profile?.investigatorNumber ?? '—'}</span>
      </Field>

      <Field
        label="Última copia"
        hint={stale ? 'Haz una copia de vez en cuando: es lo único que protege tu progreso fuera de este iPhone.' : 'Tu archivo está respaldado.'}
      >
        <span className={stale ? `${styles.badge} ${styles.warn}` : styles.badge}>{lastExport ? new Date(lastExport).toLocaleDateString('es-ES') : 'Nunca'}</span>
      </Field>

      <div className={styles.row}>
        <ActionButton tone="seal" disabled={!prepared} onClick={() => void share()}>
          Exportar copia
        </ActionButton>
        <ActionButton disabled={!prepared} onClick={() => void saveFile()}>
          Descargar archivo
        </ActionButton>
        <ActionButton onClick={() => input.current?.click()}>Importar copia</ActionButton>
        <input ref={input} type="file" accept="application/json,.json" hidden onChange={(e) => void onFile(e.target.files?.[0])} />
      </div>
      {message && <p className={styles.message} role="status">{message}</p>}

      {imp.step === 'error' && (
        <div className={styles.slip} role="alert">
          <p>{imp.message}</p>
          <ActionButton onClick={() => setImp({ step: 'idle' })}>Entendido</ActionButton>
        </div>
      )}

      {imp.step === 'review' && (
        <div className={styles.slip} role="dialog" aria-label="Revisar copia importada">
          <p className={styles.slipTitle}>Copia de {imp.summary.investigatorNumber}</p>
          <p>
            Exportada el {new Date(imp.summary.exportedAt).toLocaleString('es-ES')} · {imp.summary.investigations} investigaciones · {imp.summary.solvedCases} casos
            resueltos · {imp.summary.notes} notas · {imp.summary.dailyUnlocked} diarios desbloqueados.
          </p>
          <p className={styles.small}>
            <strong>Fusionar</strong> une la copia con lo que hay en este iPhone sin perder nada. <strong>Reemplazar</strong> borra el progreso de este iPhone y
            deja solo el de la copia.
          </p>
          <div className={styles.row}>
            <ActionButton tone="seal" onClick={() => void apply(imp.archive, 'merge')}>
              Fusionar
            </ActionButton>
            {imp.confirmReplace ? (
              <ActionButton onClick={() => void apply(imp.archive, 'replace')}>Confirmar: reemplazar todo</ActionButton>
            ) : (
              <ActionButton onClick={() => setImp({ ...imp, confirmReplace: true })}>Reemplazar</ActionButton>
            )}
            <ActionButton onClick={() => setImp({ step: 'idle' })}>Cancelar</ActionButton>
          </div>
        </div>
      )}

      {imp.step === 'done' && (
        <p className={styles.message} role="status">
          Copia {imp.mode === 'merge' ? 'fusionada' : 'restaurada'} correctamente.
        </p>
      )}

      <Field label="Espacio usado" hint={storage?.persisted ? 'El sistema ha concedido almacenamiento persistente.' : 'El sistema puede liberar este espacio si falta memoria o si la app no se usa durante semanas.'}>
        <span className={styles.badge}>{storage ? formatBytes(storage.usage) : '—'}</span>
      </Field>
      {storage?.supported && !storage.persisted && (
        <div className={styles.row}>
          <ActionButton
            onClick={async () => {
              const ok = await requestPersistentStorage();
              setMessage(ok ? 'Almacenamiento persistente concedido.' : 'El sistema no lo ha concedido ahora. Haz copias igualmente.');
              refresh();
            }}
          >
            Pedir almacenamiento persistente
          </ActionButton>
        </div>
      )}

      <Field
        label="Expedientes en el dispositivo"
        hint={offline ? `${formatBytes(offline.bytes)} de recursos verificados. Todo el archivo se guarda solo al haber conexión, también los casos nuevos de cada actualización.` : 'Calculando…'}
      >
        <span className={styles.badge}>{offline ? `${offline.ready} de ${offline.total}` : '—'}</span>
      </Field>
      <div className={styles.row}>
        <ActionButton disabled={checking} onClick={() => void checkDownloads(true)}>
          {checking ? 'Comprobando…' : 'Comprobar descargas a fondo'}
        </ActionButton>
      </div>

      <details className={styles.details}>
        <summary>Qué significa guardar todo en el dispositivo</summary>
        <ul>
          <li>Tu progreso vive solo en este navegador o app instalada. No hay cuenta ni copia en la nube.</li>
          <li>iOS puede borrar los datos de una app web si falta espacio o si pasa mucho tiempo sin abrirse. Borrar los datos de Safari también los elimina.</li>
          <li>La app instalada en la pantalla de inicio y Safari guardan datos por separado.</li>
          <li>Si pierdes el iPhone sin copia, el progreso no se puede recuperar.</li>
          <li>La copia es un archivo JSON legible: no la compartas si no quieres que otros vean tus notas.</li>
          <li>Las puntuaciones no se pueden verificar desde fuera: cualquiera podría editar su archivo. Es un juego entre personas de confianza.</li>
        </ul>
      </details>
      <Link to="/diagnostico" className={styles.diag}>
        Diagnóstico técnico del dispositivo
      </Link>
    </>
  );
}
