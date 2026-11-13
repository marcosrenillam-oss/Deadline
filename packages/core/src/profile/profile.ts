import { z } from 'zod';
import { COSMETIC_SLOTS, DEFAULT_LOADOUT, type CosmeticSlot } from '../cosmetics/catalog.ts';

/**
 * PERFIL LOCAL DEL INVESTIGADOR.
 *
 * Versión local-first: no hay cuentas ni registro central. El perfil vive
 * en el dispositivo y viaja con las copias de seguridad (exportar/importar).
 *
 * Consecuencias honestas:
 * - El número de investigador se genera en el dispositivo. Es aleatorio
 *   (100 000 combinaciones) pero no hay garantía global de unicidad.
 * - El nombre visible no es único: no hay nadie que lo compruebe.
 * - Puntos y rangos no son verificables por terceros.
 */

export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

/** Normaliza un alias (minúsculas, sin espacios laterales). */
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidUsername(raw: string): boolean {
  return USERNAME_PATTERN.test(normalizeUsername(raw));
}

/** "DL-48213-K": cinco cifras y letra de control (como la del DNI, detecta erratas al copiarlo). */
export const INVESTIGATOR_NUMBER_PATTERN = /^DL-\d{5}-[A-Z]$/;
const CONTROL_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

export function investigatorControlLetter(digits: string): string {
  return CONTROL_LETTERS.charAt(Number(digits) % 23);
}

export function generateInvestigatorNumber(random: () => number = secureRandom): string {
  const digits = String(Math.floor(random() * 100_000)).padStart(5, '0');
  return `DL-${digits}-${investigatorControlLetter(digits)}`;
}

export function isValidInvestigatorNumber(n: string): boolean {
  if (!INVESTIGATOR_NUMBER_PATTERN.test(n)) return false;
  return investigatorControlLetter(n.slice(3, 8)) === n.charAt(9);
}

function secureRandom(): number {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return buf[0]! / 2 ** 32;
}

const loadoutShape = Object.fromEntries(COSMETIC_SLOTS.map((s) => [s, z.string()])) as Record<CosmeticSlot, z.ZodString>;

export const localProfileSchema = z.strictObject({
  investigatorNumber: z.string().regex(INVESTIGATOR_NUMBER_PATTERN),
  /** Alias opcional para identificarse en el cooperativo y en las tarjetas de investigador. */
  alias: z.string().regex(USERNAME_PATTERN).optional(),
  /** Retrato: 'preset:<n>' (silueta de ficha) o una foto propia como data URL reducida (≤ 200 KB). */
  avatar: z.string().max(200_000).optional(),
  createdAt: z.number().int(),
  /** Cosmético equipado en cada hueco de la oficina. */
  equipped: z.strictObject(loadoutShape),
  /** Cosméticos desbloqueados (además de los de serie). */
  unlockedCosmetics: z.array(z.string()).default([]),
  /** Saldo de puntos gastables (Etapa 7). */
  points: z.number().int().min(0).default(0),
  /** Mérito acumulado, no gastable: determina los rangos (Etapa 7). */
  soloMerit: z.number().int().min(0).default(0),
  coopMerit: z.number().int().min(0).default(0),
  /** Logros conseguidos, con la fecha en que se consiguieron. */
  achievements: z.array(z.strictObject({ id: z.string(), at: z.number().int() })).default([]),
  updatedAt: z.number().int(),
});
export type LocalProfile = z.infer<typeof localProfileSchema>;

export function createLocalProfile(now: number, random?: () => number): LocalProfile {
  return {
    investigatorNumber: generateInvestigatorNumber(random),
    createdAt: now,
    equipped: { ...DEFAULT_LOADOUT },
    unlockedCosmetics: [],
    points: 0,
    soloMerit: 0,
    coopMerit: 0,
    achievements: [],
    updatedAt: now,
  };
}

/**
 * TARJETA DE INVESTIGADOR: lo que un jugador comparte de sí mismo con sus
 * amigos (por código). Son datos declarados: nadie puede verificarlos.
 */
export const investigatorCardSchema = z.strictObject({
  t: z.literal('card'),
  n: z.string().regex(INVESTIGATOR_NUMBER_PATTERN),
  a: z.string().regex(USERNAME_PATTERN).optional(),
  soloRank: z.string(),
  coopRank: z.string(),
  soloMerit: z.number().int().min(0),
  coopMerit: z.number().int().min(0),
  solved: z.number().int().min(0),
  /** Actas impecables y logros (opcionales: tarjetas antiguas no los traen). */
  perfect: z.number().int().min(0).optional(),
  ach: z.number().int().min(0).optional(),
  at: z.number().int(),
});
export type InvestigatorCard = z.infer<typeof investigatorCardSchema>;

/** Amigo añadido a la clasificación local: su última tarjeta importada. */
export const friendSchema = z.strictObject({
  number: z.string().regex(INVESTIGATOR_NUMBER_PATTERN),
  card: investigatorCardSchema,
  addedAt: z.number().int(),
  updatedAt: z.number().int(),
});
export type Friend = z.infer<typeof friendSchema>;

/**
 * Incorpora una tarjeta a la lista de amigos. Una tarjeta más antigua que la
 * guardada no la sustituye; la propia tarjeta no se puede añadir.
 */
export function upsertFriend(friends: readonly Friend[], card: InvestigatorCard, own: string, now: number): { friends: Friend[]; status: 'added' | 'updated' | 'stale' | 'self' } {
  if (card.n === own) return { friends: [...friends], status: 'self' };
  const prev = friends.find((f) => f.number === card.n);
  if (prev && prev.card.at >= card.at) return { friends: [...friends], status: 'stale' };
  const next: Friend = { number: card.n, card, addedAt: prev?.addedAt ?? now, updatedAt: now };
  return { friends: [...friends.filter((f) => f.number !== card.n), next], status: prev ? 'updated' : 'added' };
}
