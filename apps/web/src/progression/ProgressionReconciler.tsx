import { useEffect } from 'react';
import { useProfile } from '../profile/ProfileProvider.tsx';
import { applyProgression } from './progressionRepo.ts';

/**
 * Al arrancar (y tras importar una copia) recoge los logros y piezas que
 * correspondan a lo ya guardado. Los logros de cierre solo se evalúan al
 * cerrar un caso, porque necesitan el expediente delante.
 */
export function ProgressionReconciler() {
  const { profile } = useProfile();
  const ready = !!profile;
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => void applyProgression().catch((e: unknown) => console.error('[progresión]', e)), 1500);
    return () => clearTimeout(t);
    // Los cierres posteriores llaman a applyProgression directamente.
  }, [ready]);
  return null;
}
