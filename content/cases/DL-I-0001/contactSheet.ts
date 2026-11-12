/**
 * Hoja de contactos del carrete de la Nikon (DL-I-0001).
 * Fuente única de verdad: el generador dibuja los fotogramas a partir de
 * estos datos y el expediente usa las mismas coordenadas para las regiones
 * de los detalles ocultos. 36 fotogramas, uno cada 10 minutos desde las 18:02.
 */

export const SHEET = { width: 1200, height: 980 } as const;
const FRAME_W = 180;
const FRAME_H = 120;
const COLS = 6;

export type Figure =
  | 'desmond-desk'
  | 'desmond-drink'
  | 'desmond-kitchen'
  | 'desmond-pour'
  | 'nora-counter'
  | 'nora-shelf'
  | 'nora-coat'
  | 'hooded'
  | 'portal-shadow';

export interface FrameSpec {
  index: number;
  time: string;
  redLight: boolean;
  figures: Figure[];
}

function timeOf(i: number): string {
  const m = 18 * 60 + 2 + i * 10;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

function figuresFor(i: number): { red: boolean; figures: Figure[] } {
  if (i <= 11) return { red: false, figures: ['desmond-desk', i % 3 === 0 ? 'nora-shelf' : 'nora-counter'] };
  if (i === 12) return { red: false, figures: ['desmond-desk', 'nora-coat'] };
  if (i <= 17) return { red: false, figures: ['desmond-desk'] };
  if (i <= 20) return { red: true, figures: [] };
  if (i === 21) return { red: false, figures: ['desmond-kitchen'] };
  if (i === 22) return { red: false, figures: ['desmond-desk', 'nora-shelf'] };
  if (i === 23) return { red: false, figures: ['desmond-desk'] };
  if (i === 24) return { red: false, figures: ['desmond-drink'] };
  if (i === 25) return { red: true, figures: ['hooded'] };
  if (i === 26) return { red: true, figures: [] };
  if (i === 27) return { red: true, figures: ['desmond-pour'] };
  if (i === 31) return { red: true, figures: ['portal-shadow'] };
  return { red: true, figures: [] };
}

export const FRAMES: FrameSpec[] = Array.from({ length: 36 }, (_, i) => {
  const f = figuresFor(i);
  return { index: i, time: timeOf(i), redLight: f.red, figures: f.figures };
});

export function frameRect(i: number): { x: number; y: number; w: number; h: number } {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  return { x: 42 + col * 190, y: 52 + row * 152, w: FRAME_W, h: FRAME_H };
}

/** Región normalizada (0..1) de un fotograma, para los detalles del expediente. */
export function frameRegion(time: string): { x: number; y: number; w: number; h: number } {
  const f = FRAMES.find((x) => x.time === time);
  if (!f) throw new Error(`Fotograma inexistente: ${time}`);
  const r = frameRect(f.index);
  const round = (n: number) => Math.round(n * 10000) / 10000;
  return { x: round(r.x / SHEET.width), y: round(r.y / SHEET.height), w: round(r.w / SHEET.width), h: round(r.h / SHEET.height) };
}
