import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CosmeticSlot, LocalProfile } from '@deadline/core';
import { ensureProfile, equipCosmetic } from '../storage/profileRepo.ts';

interface ProfileContextValue {
  profile: LocalProfile | null;
  equip: (slot: CosmeticSlot, itemId: string) => Promise<void>;
  reload: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

/** Perfil local del investigador (se crea en el primer arranque, sin registro). */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<LocalProfile | null>(null);

  const reload = useCallback(async () => {
    try {
      setProfile(await ensureProfile());
    } catch (err) {
      console.error('[profile] No se pudo leer el perfil local', err);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const equip = useCallback(async (slot: CosmeticSlot, itemId: string) => {
    setProfile(await equipCosmetic(slot, itemId));
  }, []);

  const value = useMemo(() => ({ profile, equip, reload }), [profile, equip, reload]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile debe usarse dentro de <ProfileProvider>');
  return ctx;
}
