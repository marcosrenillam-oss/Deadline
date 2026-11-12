import { z } from 'zod';

/**
 * Perfil público del investigador. El servidor es el dueño de estos datos;
 * el cliente guarda una copia para mostrarla offline.
 */
export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

/** Normaliza un nombre de usuario para comprobar unicidad (sin distinguir mayúsculas). */
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidUsername(raw: string): boolean {
  return USERNAME_PATTERN.test(normalizeUsername(raw));
}

/** Número de investigador: único e inalterable, asignado por el servidor (p. ej. "DL-48213-K"). */
export const INVESTIGATOR_NUMBER_PATTERN = /^DL-\d{5}-[A-Z]$/;

export const profileSchema = z.strictObject({
  userId: z.string(),
  username: z.string().regex(USERNAME_PATTERN),
  displayName: z.string().max(40).optional(),
  investigatorNumber: z.string().regex(INVESTIGATOR_NUMBER_PATTERN),
  avatar: z.string().optional(),
  createdAt: z.number().int(),
  soloRank: z.string(),
  coopRank: z.string(),
  points: z.number().int().min(0),
  soloMerit: z.number().int().min(0),
  coopMerit: z.number().int().min(0),
  equippedCosmetics: z.record(z.string(), z.string()),
});
export type Profile = z.infer<typeof profileSchema>;
