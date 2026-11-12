import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_SETTINGS, normalizeSettings, type Settings } from '@deadline/core';
import { loadSettings, saveSettings } from '../storage/settingsRepo.ts';
import { sound } from '../audio/sound.ts';
import { setHapticsEnabled } from '../audio/haptics.ts';

interface SettingsContextValue {
  settings: Settings;
  /** true cuando ya se han leído los ajustes guardados. */
  loaded: boolean;
  update: (patch: Partial<Settings>) => void;
  /** Vuelve a leer los ajustes guardados (p. ej. tras importar un archivo). */
  reload: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/** Traslada los ajustes visuales al documento (variables CSS y atributos). */
export function applySettingsToDocument(s: Settings, root: HTMLElement = document.documentElement): void {
  root.style.setProperty('--text-scale', String(s.textScale));
  root.style.setProperty('--light-intensity', String(s.lampOn ? s.lightIntensity : 0));
  root.dataset.lamp = s.lampOn ? 'on' : 'off';
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

  useEffect(() => {
    applySettingsToDocument(settings);
    sound.configure({ sfxVolume: settings.sfxVolume, ambienceVolume: settings.ambienceVolume, ambience: settings.officeAmbience });
    setHapticsEnabled(settings.haptics);
  }, [settings]);

  const reload = useCallback(async () => {
    setSettings(await loadSettings());
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = normalizeSettings({ ...prev, ...patch });
      saveSettings(next).catch((err: unknown) => console.error('[settings] No se pudieron guardar los ajustes', err));
      return next;
    });
  }, []);

  const value = useMemo(() => ({ settings, loaded, update, reload }), [settings, loaded, update, reload]);
  // No se pinta nada hasta leer los ajustes guardados: evita que la mesa
  // aparezca un instante con los valores por defecto (luz, nota, texto).
  // La lectura de IndexedDB tarda milisegundos; el fondo ya es color tinta.
  return <SettingsContext.Provider value={value}>{loaded ? children : null}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings debe usarse dentro de <SettingsProvider>');
  return ctx;
}
