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
  'desk-oak': { wood: ['#7a5a36', '#5c4126', '#3a2815'], grain: '#26180b', blotter: '#1f2c45', blotterEdge: '#121a2b', stitch: 'rgba(220,206,170,0.45)' },
  'desk-baize': { wood: ['#4a3020', '#33210f', '#1d130a'], grain: '#120a05', blotter: '#1d5236', blotterEdge: '#0f3020', stitch: 'rgba(230,221,201,0.35)' },
  'desk-legend': { wood: ['#1e1b18', '#141210', '#080706'], grain: '#000000', blotter: '#171715', blotterEdge: '#0a0a09', stitch: 'rgba(212,175,98,0.75)' },
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
  'lamp-opaline': { shade: '#d9d3c4', shadeLight: '#fbf8f0', shadeDark: '#9a9384', metal: '#a08a5c', metalLight: '#e6d4a4' },
  'lamp-seal': { shade: '#6b2224', shadeLight: '#b65b55', shadeDark: '#320b0c', metal: '#9c7a42', metalLight: '#e2c27a' },
};

/** Forma de la lámpara: cúpula de latón o pantalla de banquero (las demás variantes de vidrio). */
export function lampShape(id: string): 'lamp-brass' | 'lamp-banker' {
  return id === 'lamp-brass' ? 'lamp-brass' : 'lamp-banker';
}

export interface PhoneMaterial {
  body: string;
  light: string;
  dark: string;
  plate: string;
}
export const PHONE_MATERIALS: Record<string, PhoneMaterial> = {
  'phone-bakelite': { body: '#191817', light: '#4a4744', dark: '#050505', plate: '#d9d0bb' },
  'phone-oxblood': { body: '#5e1b1b', light: '#9a4740', dark: '#2a0808', plate: '#e6ddc9' },
  'phone-ivory': { body: '#d8cfb8', light: '#f6f0e0', dark: '#8f8670', plate: '#2a2620' },
  'phone-brass': { body: '#9a7838', light: '#e6c77f', dark: '#4e3814', plate: '#171715' },
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
  'typewriter-cream': { body: '#cfc5aa', light: '#efe8d4', dark: '#857c64', key: '#2a2620' },
  'typewriter-burgundy': { body: '#5a1f22', light: '#8f4a48', dark: '#2a0a0c', key: '#efe6cf' },
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
  'notebook-black': { cover: '#1d1c1a', light: '#45423d', dark: '#080807', band: '#762d2b' },
  'notebook-green': { cover: '#2f4a36', light: '#56735c', dark: '#16261a', band: '#141413' },
};

export function pick<T>(map: Record<string, T>, id: string | undefined, fallback: string): T {
  return map[id ?? ''] ?? map[fallback]!;
}
