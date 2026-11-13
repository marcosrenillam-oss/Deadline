import type { DeskMaterial } from './palettes.ts';

/**
 * Textura de madera generada en un <canvas> del dispositivo: tablones
 * horizontales con veta ondulada, nudos y poro fino. Se genera una vez por
 * material y se reutiliza (URL de objeto en memoria). Sin imágenes externas.
 */
const cache = new Map<string, string>();

function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function woodTextureUrl(key: string, m: DeskMaterial): Promise<string | null> {
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === 'undefined') return null;
  const canvas = drawWood(m, 1600, 800);
  if (!canvas) return null;
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.86));
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  cache.set(key, url);
  return url;
}

/** Dibuja la madera en un canvas nuevo (lo usan la mesa 2D y la 3D). */
export function drawWood(m: DeskMaterial, W: number, H: number): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const r = rng(1953);

  // Base: degradado del material
  const base = ctx.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, m.wood[0]);
  base.addColorStop(0.55, m.wood[1]);
  base.addColorStop(1, m.wood[2]);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  // Tablones horizontales con ligera variación de tono
  const planks = 5;
  const ph = H / planks;
  for (let p = 0; p < planks; p++) {
    ctx.fillStyle = `rgba(${r() > 0.5 ? '255,220,180' : '0,0,0'},${0.02 + r() * 0.05})`;
    ctx.fillRect(0, p * ph, W, ph);
  }

  // Veta: líneas onduladas de grosor y opacidad variables
  ctx.lineCap = 'round';
  for (let i = 0; i < 520; i++) {
    const y0 = r() * H;
    const amp = 2 + r() * 9;
    const freq = 0.002 + r() * 0.006;
    const phase = r() * Math.PI * 2;
    ctx.strokeStyle = m.grain;
    ctx.globalAlpha = 0.04 + r() * 0.16;
    ctx.lineWidth = 0.6 + r() * 2.2;
    ctx.beginPath();
    const x0 = -50 + r() * 200;
    const len = 400 + r() * 1400;
    for (let x = x0; x < x0 + len; x += 8) {
      const y = y0 + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 3.1) * amp * 0.25;
      if (x === x0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Brillos de la veta
  for (let i = 0; i < 140; i++) {
    const y0 = r() * H;
    ctx.strokeStyle = 'rgba(255,225,190,1)';
    ctx.globalAlpha = 0.015 + r() * 0.035;
    ctx.lineWidth = 1 + r() * 3;
    ctx.beginPath();
    const x0 = r() * W;
    ctx.moveTo(x0, y0);
    ctx.bezierCurveTo(x0 + 200, y0 + (r() - 0.5) * 12, x0 + 400, y0 + (r() - 0.5) * 12, x0 + 600 + r() * 500, y0 + (r() - 0.5) * 8);
    ctx.stroke();
  }

  // Nudos
  for (let k = 0; k < 4; k++) {
    const cx = r() * W;
    const cy = r() * H;
    for (let ring = 0; ring < 9; ring++) {
      ctx.globalAlpha = 0.08 + ring * 0.01;
      ctx.strokeStyle = m.grain;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 6 + ring * 7, 2 + ring * 2.4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Juntas entre tablones
  ctx.globalAlpha = 0.55;
  for (let p = 1; p < planks; p++) {
    const y = p * ph + (r() - 0.5) * 6;
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, y, W, 2);
    ctx.fillStyle = 'rgba(255,230,200,0.06)';
    ctx.fillRect(0, y + 2, W, 1);
  }

  // Poro fino
  ctx.globalAlpha = 1;
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * 14;
    d[i] = Math.max(0, Math.min(255, d[i]! + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1]! + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2]! + n));
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}
