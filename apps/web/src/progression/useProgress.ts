import { useEffect, useState } from 'react';
import { useProfile } from '../profile/ProfileProvider.tsx';
import { loadProgress, type Progress } from './progressionRepo.ts';

/** Estadísticas y rangos reales del investigador; se recalculan cuando cambia el perfil. */
export function useProgress(): Progress | null {
  const { profile } = useProfile();
  const [progress, setProgress] = useState<Progress | null>(null);
  useEffect(() => {
    if (!profile) return;
    let alive = true;
    loadProgress(profile).then(
      (p) => alive && setProgress(p),
      (err: unknown) => console.error('[progresión] No se pudieron calcular las estadísticas', err),
    );
    return () => {
      alive = false;
    };
  }, [profile]);
  return progress;
}
