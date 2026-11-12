import { z } from 'zod';

/** Ajustes locales del dispositivo (se sincronizan con el perfil cuando haya cuenta). */
export const settingsSchema = z.strictObject({
  musicVolume: z.number().min(0).max(1).default(0.55),
  sfxVolume: z.number().min(0).max(1).default(0.8),
  haptics: z.boolean().default(true),
  /** Intensidad de la lámpara del escritorio. */
  lightIntensity: z.number().min(0.3).max(1).default(0.85),
  /** Tonalidad de la luz: cálida (tungsteno), neutra o fría (fluorescente). */
  lightTone: z.enum(['warm', 'neutral', 'cold']).default('warm'),
  /** Ambiente sonoro de la oficina. */
  officeAmbience: z.enum(['rain', 'night-city', 'quiet', 'radio']).default('rain'),
  /** Escala del texto de lectura (documentos, diálogos). */
  textScale: z.number().min(0.85).max(1.5).default(1),
  /** 'system' respeta prefers-reduced-motion. */
  reducedMotion: z.enum(['system', 'on', 'off']).default('system'),
  /** Explicación breve integrada en el escritorio (opcional, se puede cerrar). */
  deskGuideDismissed: z.boolean().default(false),
});
export type Settings = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: Settings = settingsSchema.parse({});

/** Valida y completa unos ajustes guardados (tolera versiones antiguas). */
export function normalizeSettings(raw: unknown): Settings {
  const base = typeof raw === 'object' && raw !== null ? raw : {};
  const known = Object.fromEntries(Object.entries(base).filter(([k]) => k in settingsSchema.shape));
  const parsed = settingsSchema.safeParse(known);
  if (parsed.success) return parsed.data;
  // Si algún campo concreto es inválido, se descarta solo ese campo.
  const fixed: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(known)) {
    const field = settingsSchema.shape[k as keyof Settings];
    if (field.safeParse(v).success) fixed[k] = v;
  }
  return settingsSchema.parse(fixed);
}
