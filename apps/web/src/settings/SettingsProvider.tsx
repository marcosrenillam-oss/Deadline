import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_SETTINGS, normalizeSettings, type Settings } from '@deadline/core';
import { loadSettings, saveSettings } from '../storage/settingsRepo.ts';

interface SettingsContextValue {
  settings: Settings;
  /** true cuando ya se han leído los ajustes guardados. */
  loaded: boolean;
  update: (patch: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/** Traslada los ajustes visuales al documento (variables CSS y atributos). */
export function applySettingsToDocument(s: Settings, root: HTMLElement = document.documentElement): void {
  root.style.setProperty('--text-scale', String(s.textScale));
  root.style.setProperty('--light-intensity', String(s.lightIntensity));
  root.dataset.lightTone = s.lightTone;
  root.dataset.reducedMotion = s.reducedMotion;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSettings()
      .then((s) => {
        if (!cancelled) setSettings(s);
      })
      .catch((err: unknown) => console.error('[settings] No se pudieron leer los ajustes', err))
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => applySettingsToDocument(settings), [settings]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = normalizeSettings({ ...prev, ...patch });
      saveSettings(next).catch((err: unknown) => console.error('[settings] No se pudieron guardar los ajustes', err));
      return next;
    });
  }, []);

  const value = useMemo(() => ({ settings, loaded, update }), [settings, loaded, update]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings debe usarse dentro de <SettingsProvider>');
  return ctx;
}
