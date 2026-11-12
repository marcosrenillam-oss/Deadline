/**
 * COSMÉTICOS DE LA OFICINA.
 *
 * Cada objeto del escritorio tiene un hueco con variantes intercambiables.
 * La personalización cambia materiales y acabados, nunca la composición: la
 * mesa sigue siendo la misma mesa y cada objeto conserva su sitio y función.
 *
 * Etapa 2: variantes de serie. Etapa 7: variantes desbloqueables con puntos,
 * logros o rangos (el campo `unlock` ya lo contempla).
 */

export const COSMETIC_SLOTS = ['desk', 'lamp', 'phone', 'typewriter', 'notebook', 'decor'] as const;
export type CosmeticSlot = (typeof COSMETIC_SLOTS)[number];

export const COSMETIC_SLOT_LABELS: Record<CosmeticSlot, string> = {
  desk: 'Mesa',
  lamp: 'Lámpara',
  phone: 'Teléfono',
  typewriter: 'Máquina de escribir',
  notebook: 'Libreta',
  decor: 'Objeto personal',
};

export type CosmeticUnlock =
  | { kind: 'default' }
  | { kind: 'points'; cost: number }
  | { kind: 'achievement'; achievementId: string }
  | { kind: 'rank'; rank: string };

export interface CosmeticItem {
  id: string;
  slot: CosmeticSlot;
  label: string;
  description: string;
  unlock: CosmeticUnlock;
}

const D: CosmeticUnlock = { kind: 'default' };

export const COSMETICS: readonly CosmeticItem[] = [
  { id: 'desk-walnut', slot: 'desk', label: 'Nogal de comisaría', description: 'Nogal oscuro con vade de cuero verde. Gastado por décadas de codos y expedientes.', unlock: D },
  { id: 'desk-mahogany', slot: 'desk', label: 'Caoba de despacho', description: 'Caoba rojiza y vade burdeos, como la mesa de un juez de instrucción.', unlock: D },
  { id: 'desk-ebony', slot: 'desk', label: 'Ébano nocturno', description: 'Madera casi negra y vade de fieltro gris. Para quien trabaja de madrugada.', unlock: D },

  { id: 'lamp-banker', slot: 'lamp', label: 'Lámpara de banquero', description: 'Pantalla de vidrio verde y pie de latón.', unlock: D },
  { id: 'lamp-brass', slot: 'lamp', label: 'Flexo de latón', description: 'Campana de latón pulido que concentra la luz.', unlock: D },

  { id: 'phone-bakelite', slot: 'phone', label: 'Baquelita negra', description: 'Teléfono de disco reglamentario.', unlock: D },
  { id: 'phone-oxblood', slot: 'phone', label: 'Rojo sello', description: 'Teléfono de disco lacado en rojo oscuro: la línea directa.', unlock: D },

  { id: 'typewriter-black', slot: 'typewriter', label: 'Portátil negra', description: 'Máquina portátil de carcasa negra y teclas redondas.', unlock: D },
  { id: 'typewriter-olive', slot: 'typewriter', label: 'Verde oliva', description: 'Máquina de oficina con carcasa verde oliva.', unlock: D },

  { id: 'notebook-leather', slot: 'notebook', label: 'Cuero tabaco', description: 'Libreta de cuero con cinta elástica y lápiz.', unlock: D },
  { id: 'notebook-oxblood', slot: 'notebook', label: 'Tela burdeos', description: 'Libreta encuadernada en tela burdeos.', unlock: D },

  { id: 'decor-coffee', slot: 'decor', label: 'Taza de café', description: 'Café solo, ya frío. Y el cerco que deja en todos los informes.', unlock: D },
  { id: 'decor-polaroids', slot: 'decor', label: 'Instantáneas', description: 'Dos polaroids de un caso antiguo que nunca se cerró del todo.', unlock: D },
  { id: 'decor-none', slot: 'decor', label: 'Mesa despejada', description: 'Nada fuera de lo imprescindible.', unlock: D },
];

export const DEFAULT_LOADOUT: Record<CosmeticSlot, string> = {
  desk: 'desk-walnut',
  lamp: 'lamp-banker',
  phone: 'phone-bakelite',
  typewriter: 'typewriter-black',
  notebook: 'notebook-leather',
  decor: 'decor-coffee',
};

export function cosmeticsForSlot(slot: CosmeticSlot): CosmeticItem[] {
  return COSMETICS.filter((c) => c.slot === slot);
}

export function isCosmeticAvailable(item: CosmeticItem, unlocked: readonly string[]): boolean {
  return item.unlock.kind === 'default' || unlocked.includes(item.id);
}

/** Corrige un equipamiento con ids desconocidos, de otro hueco o bloqueados. */
export function sanitizeLoadout(loadout: Partial<Record<string, string>>, unlocked: readonly string[] = []): Record<CosmeticSlot, string> {
  const out = { ...DEFAULT_LOADOUT };
  for (const slot of COSMETIC_SLOTS) {
    const item = COSMETICS.find((c) => c.id === loadout[slot]);
    if (item && item.slot === slot && isCosmeticAvailable(item, unlocked)) out[slot] = item.id;
  }
  return out;
}
