import { lazy, Suspense, useState } from 'react';
import { useSettings } from '../../settings/SettingsProvider.tsx';
import { DeskScene2D } from './DeskScene.tsx';
import { webglAvailableCached } from './webgl.ts';

const Desk3DScene = lazy(async () => ({ default: (await import('../desk3d/Desk3DScene.tsx')).Desk3DScene }));

/**
 * La mesa del despacho: en 3D con luz y sombras reales (calidad
 * cinematográfica) o en 2D (gráficos ligeros, o si el dispositivo no puede
 * dibujar WebGL). Las dos son el mismo menú con los mismos objetos.
 */
export function DeskScene() {
  const { settings } = useSettings();
  const [failed, setFailed] = useState(false);
  if (settings.graphics === 'light' || failed || !webglAvailableCached()) return <DeskScene2D />;
  return (
    <Suspense fallback={<main style={{ position: 'absolute', inset: 0, background: '#0c0b09' }} aria-busy="true" />}>
      <Desk3DScene onFail={() => setFailed(true)} />
    </Suspense>
  );
}
