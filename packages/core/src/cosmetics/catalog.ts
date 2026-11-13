/**
 * COSMÉTICOS DE LA OFICINA.
 *
 * Cada objeto del escritorio tiene un hueco con variantes intercambiables.
 * La personalización cambia materiales y acabados, nunca la composición: la
 * mesa sigue siendo la misma mesa y cada objeto conserva su sitio y función.
 *
 * Variantes de serie y desbloqueables: con puntos (se compran en Lámpara →
 * Oficina), con logros o con rangos (se conceden solas).
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

  // ── Desbloqueables (Etapa 7) ──────────────────────────────────────────────
  { id: 'desk-oak', slot: 'desk', label: 'Roble de archivo', description: 'Roble claro de los muebles del archivo central, con vade azul marino.', unlock: { kind: 'points', cost: 600 } },
  { id: 'desk-baize', slot: 'desk', label: 'Tapete de sala de pruebas', description: 'Nogal y fieltro verde billar, como la mesa donde se exponen las pruebas.', unlock: { kind: 'achievement', achievementId: 'spotless-file' } },
  { id: 'desk-legend', slot: 'desk', label: 'Mesa de la Leyenda', description: 'Laca negra con pespunte dorado. Solo una persona del archivo trabaja en ella.', unlock: { kind: 'rank', rank: 'legend' } },
  { id: 'lamp-opaline', slot: 'lamp', label: 'Opalina blanca', description: 'Pantalla de vidrio opalino que da una luz lechosa y suave.', unlock: { kind: 'points', cost: 400 } },
  { id: 'lamp-seal', slot: 'lamp', label: 'Pantalla lacre', description: 'Vidrio rojo oscuro, como el sello de los expedientes cerrados.', unlock: { kind: 'achievement', achievementId: 'streak-7' } },
  { id: 'phone-ivory', slot: 'phone', label: 'Marfil de centralita', description: 'Teléfono de disco color marfil, de los que había en las centralitas.', unlock: { kind: 'points', cost: 350 } },
  { id: 'phone-brass', slot: 'phone', label: 'Latón de inspección', description: 'Carcasa de latón bruñido: el teléfono de quien ya tiene galones.', unlock: { kind: 'rank', rank: 'inspector' } },
  { id: 'typewriter-cream', slot: 'typewriter', label: 'Crema de redacción', description: 'Máquina de redacción en esmalte crema.', unlock: { kind: 'points', cost: 450 } },
  { id: 'typewriter-burgundy', slot: 'typewriter', label: 'Burdeos reglamentario', description: 'Esmalte burdeos con teclas marfil. Se entrega con la placa de detective.', unlock: { kind: 'rank', rank: 'detective' } },
  { id: 'notebook-black', slot: 'notebook', label: 'Hule negro', description: 'Libreta de tapas de hule negro, resistente a la lluvia.', unlock: { kind: 'points', cost: 250 } },
  { id: 'notebook-green', slot: 'notebook', label: 'Tela verde de pareja', description: 'Libreta de tela verde. Un regalo del primer compañero.', unlock: { kind: 'achievement', achievementId: 'two-badges' } },
  { id: 'decor-magnifier', slot: 'decor', label: 'Lupa de mango', description: 'Lupa de latón y mango de madera. No se le escapa nada.', unlock: { kind: 'achievement', achievementId: 'eagle-eye' } },
  { id: 'decor-badge', slot: 'decor', label: 'Placa de inspector jefe', description: 'La placa de latón, sobre su funda de cuero.', unlock: { kind: 'rank', rank: 'chief-inspector' } },
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

/** Texto de cómo se consigue una pieza bloqueada. */
export function unlockLabel(item: CosmeticItem, achievementLabel: (id: string) => string | undefined, rankLabel: (id: string) => string | undefined): string {
  switch (item.unlock.kind) {
    case 'default':
      return 'De serie';
    case 'points':
      return `${item.unlock.cost} puntos`;
    case 'achievement':
      return `Logro: ${achievementLabel(item.unlock.achievementId) ?? item.unlock.achievementId}`;
    case 'rank':
      return `Rango: ${rankLabel(item.unlock.rank) ?? item.unlock.rank}`;
  }
}

/**
 * Piezas que se ganan solas al conseguir logros o rangos (no las de puntos,
 * que se compran). `ranks` son los ids de rango alcanzados (individual o en pareja).
 */
export function earnedCosmetics(achievementIds: readonly string[], ranks: readonly string[]): string[] {
  return COSMETICS.filter(
    (c) => (c.unlock.kind === 'achievement' && achievementIds.includes(c.unlock.achievementId)) || (c.unlock.kind === 'rank' && ranks.includes(c.unlock.rank)),
  ).map((c) => c.id);
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
