/**
 * Materiales de cada variante cosmética. Los ids vienen del catálogo de
 * @deadline/core; aquí solo se traducen a color y textura.
 */
export interface DeskMaterial {
  wood: [string, string, string];
  grain: string;
  blotter: string;
  blotterEdge: string;
  stitch: string;
}

export const DESK_MATERIALS: Record<string, DeskMaterial> = {
  'desk-walnut': { wood: ['#4a3020', '#33210f', '#1d130a'], grain: '#120a05', blotter: '#29473a', blotterEdge: '#173025', stitch: 'rgba(214,196,150,0.45)' },
  'desk-mahogany': { wood: ['#5a271b', '#3f1a11', '#240d08'], grain: '#170604', blotter: '#4f1a1f', blotterEdge: '#2e0c10', stitch: 'rgba(222,190,150,0.42)' },
  'desk-ebony': { wood: ['#2b2621', '#1c1814', '#0d0b09'], grain: '#050403', blotter: '#3a3b3c', blotterEdge: '#222324', stitch: 'rgba(200,200,200,0.3)' },
};

export interface LampMaterial {
  shade: string;
  shadeLight: string;
  shadeDark: string;
  metal: string;
  metalLight: string;
}
export const LAMP_MATERIALS: Record<string, LampMaterial> = {
  'lamp-banker': { shade: '#1d5a3c', shadeLight: '#5fae84', shadeDark: '#0b2d1c', metal: '#b08d4f', metalLight: '#ecd398' },
  'lamp-brass': { shade: '#a9823d', shadeLight: '#f0d38c', shadeDark: '#5a4019', metal: '#8e6d34', metalLight: '#e2c27a' },
};

export interface PhoneMaterial {
  body: string;
  light: string;
  dark: string;
  plate: string;
}
export const PHONE_MATERIALS: Record<string, PhoneMaterial> = {
  'phone-bakelite': { body: '#191817', light: '#4a4744', dark: '#050505', plate: '#d9d0bb' },
  'phone-oxblood': { body: '#5e1b1b', light: '#9a4740', dark: '#2a0808', plate: '#e6ddc9' },
};

export interface TypewriterMaterial {
  body: string;
  light: string;
  dark: string;
  key: string;
}
export const TYPEWRITER_MATERIALS: Record<string, TypewriterMaterial> = {
  'typewriter-black': { body: '#1b1a19', light: '#4b4946', dark: '#060606', key: '#e6ddc9' },
  'typewriter-olive': { body: '#4a5135', light: '#7c8660', dark: '#232816', key: '#efe6cf' },
};

export interface NotebookMaterial {
  cover: string;
  light: string;
  dark: string;
  band: string;
}
export const NOTEBOOK_MATERIALS: Record<string, NotebookMaterial> = {
  'notebook-leather': { cover: '#5b3a22', light: '#8a5f3b', dark: '#2e1c0f', band: '#151413' },
  'notebook-oxblood': { cover: '#5b2026', light: '#8c3d42', dark: '#2c0c10', band: '#141212' },
};

export function pick<T>(map: Record<string, T>, id: string | undefined, fallback: string): T {
  return map[id ?? ''] ?? map[fallback]!;
}
