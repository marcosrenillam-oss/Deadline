import { lazy, Suspense, useState } from 'react';
import { useSettings } from '../../settings/SettingsProvider.tsx';
import { DeskScene2D } from './DeskScene.tsx';

const PhotoDesk = lazy(async () => ({ default: (await import('../deskphoto/PhotoDesk.tsx')).PhotoDesk }));

/**
 * La mesa del despacho: fotorrealista (renderizada con Blender, calidad
 * cinematográfica) o en 2D (gráficos ligeros). Las dos son el mismo menú
 * con los mismos objetos.
 */
export function DeskScene() {
  const { settings } = useSettings();
  const [failed, setFailed] = useState(false);
  if (settings.graphics === 'light' || failed) return <DeskScene2D />;
  return (
    <Suspense fallback={<main style={{ position: 'absolute', inset: 0, background: '#0c0b09' }} aria-busy="true" />}>
      <PhotoDesk onFail={() => setFailed(true)} />
    </Suspense>
  );
}
