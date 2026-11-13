import * as THREE from 'three';
import { drawWood } from '../desk/woodTexture.ts';
import type { DeskMaterial } from '../desk/palettes.ts';

/**
 * MATERIALES DEL DESPACHO, GENERADOS EN EL DISPOSITIVO.
 *
 * Ninguna textura es una imagen descargada: madera, cuero, papel, corcho,
 * metal y fotografías se pintan en <canvas> con ruido determinista (la
 * misma semilla da siempre el mismo dibujo). Así la app no pesa más, no
 * depende de recursos de terceros y funciona sin conexión.
 */

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

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!];
}

function grain(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number, seed: number): void {
  const r = rng(seed);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * amount;
    d[i] = Math.max(0, Math.min(255, d[i]! + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1]! + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2]! + n));
  }
  ctx.putImageData(img, 0, 0);
}

export function tex(c: HTMLCanvasElement, opts: { srgb?: boolean; repeat?: [number, number]; aniso?: number } = {}): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  if (opts.srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
  if (opts.repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...opts.repeat);
  }
  t.anisotropy = opts.aniso ?? 4;
  return t;
}

const cache = new Map<string, THREE.Texture>();
function cached(key: string, make: () => THREE.Texture): THREE.Texture {
  let t = cache.get(key);
  if (!t) cache.set(key, (t = make()));
  return t;
}

// ─── Madera ──────────────────────────────────────────────────────────────────

export function woodTexture(key: string, m: DeskMaterial): THREE.Texture {
  return cached(`wood:${key}`, () => tex(drawWood(m, 2048, 1024)!, { aniso: 8 }));
}

/** Rugosidad de la madera: la veta brilla menos que el barniz. */
export function woodRoughness(): THREE.Texture {
  return cached('wood-rough', () => {
    const [c, ctx] = canvas(512, 256);
    ctx.fillStyle = '#7a7a7a';
    ctx.fillRect(0, 0, 512, 256);
    const r = rng(77);
    for (let i = 0; i < 260; i++) {
      ctx.strokeStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},${0.05 + r() * 0.1})`;
      ctx.lineWidth = 0.5 + r() * 2;
      const y = r() * 256;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(170, y + (r() - 0.5) * 10, 340, y + (r() - 0.5) * 10, 512, y + (r() - 0.5) * 6);
      ctx.stroke();
    }
    grain(ctx, 512, 256, 30, 78);
    return tex(c, { srgb: false });
  });
}

// ─── Cuero ───────────────────────────────────────────────────────────────────

export function leatherTexture(color: string, edge: string, stitch: string, seed = 11): THREE.Texture {
  return cached(`leather:${color}:${edge}:${stitch}`, () => {
    const W = 1024;
    const H = 640;
    const [c, ctx] = canvas(W, H);
    const g = ctx.createRadialGradient(W * 0.45, H * 0.4, 40, W / 2, H / 2, W * 0.7);
    g.addColorStop(0, color);
    g.addColorStop(1, edge);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const r = rng(seed);
    // Manchas y desgaste
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = `rgba(${r() > 0.6 ? '255,240,220' : '0,0,0'},${0.015 + r() * 0.04})`;
      ctx.beginPath();
      ctx.ellipse(r() * W, r() * H, 10 + r() * 70, 6 + r() * 40, r() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // Arañazos
    for (let i = 0; i < 60; i++) {
      ctx.strokeStyle = `rgba(255,235,210,${0.03 + r() * 0.06})`;
      ctx.lineWidth = 0.6;
      const x = r() * W;
      const y = r() * H;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (r() - 0.5) * 80, y + (r() - 0.5) * 30);
      ctx.stroke();
    }
    // Borde rebajado y pespunte
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 18;
    ctx.strokeRect(9, 9, W - 18, H - 18);
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = stitch;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(30, 30, W - 60, H - 60);
    ctx.setLineDash([]);
    grain(ctx, W, H, 18, seed + 1);
    return tex(c);
  });
}

// ─── Papel ───────────────────────────────────────────────────────────────────

export function paperCanvas(w: number, h: number, tone = '#e6dcc4', seed = 3, aged = 0.6): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = tone;
  ctx.fillRect(0, 0, w, h);
  const r = rng(seed);
  // Fibras
  for (let i = 0; i < w * 0.4; i++) {
    ctx.strokeStyle = `rgba(90,70,40,${0.03 + r() * 0.04})`;
    ctx.lineWidth = 0.5;
    const x = r() * w;
    const y = r() * h;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (r() - 0.5) * 14, y + (r() - 0.5) * 14);
    ctx.stroke();
  }
  // Manchas de humedad y bordes tostados
  for (let i = 0; i < 6 * aged; i++) {
    const g = ctx.createRadialGradient(r() * w, r() * h, 2, r() * w, r() * h, 20 + r() * w * 0.25);
    g.addColorStop(0, `rgba(140,100,50,${0.06 * aged})`);
    g.addColorStop(1, 'rgba(140,100,50,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  const edge = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  edge.addColorStop(0, 'rgba(120,85,40,0)');
  edge.addColorStop(1, `rgba(120,85,40,${0.35 * aged})`);
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, w, h);
  grain(ctx, w, h, 10, seed + 7);
  return [c, ctx];
}

/** Hoja mecanografiada con líneas (máquina de escribir, documentos). */
export function typedSheet(lines: string[], opts: { w?: number; h?: number; title?: boolean; seed?: number } = {}): HTMLCanvasElement {
  const w = opts.w ?? 512;
  const h = opts.h ?? 640;
  const [c, ctx] = paperCanvas(w, h, '#ebe3cf', opts.seed ?? 5, 0.35);
  ctx.textBaseline = 'top';
  lines.forEach((l, i) => {
    const first = i === 0 && opts.title !== false;
    ctx.font = `${first ? 700 : 400} ${first ? 26 : 24}px "Courier Prime", "Courier New", monospace`;
    ctx.fillStyle = first ? '#762d2b' : 'rgba(30,26,20,0.88)';
    ctx.fillText(l, 36, 40 + i * 38);
  });
  return c;
}

// ─── Corcho ──────────────────────────────────────────────────────────────────

export function corkTexture(): THREE.Texture {
  return cached('cork', () => {
    const W = 1024;
    const H = 640;
    const [c, ctx] = canvas(W, H);
    ctx.fillStyle = '#9a6b3e';
    ctx.fillRect(0, 0, W, H);
    const r = rng(21);
    for (let i = 0; i < 26000; i++) {
      const v = r();
      ctx.fillStyle = v > 0.6 ? `rgba(70,40,15,${0.25 + r() * 0.35})` : v > 0.25 ? `rgba(200,150,95,${0.2 + r() * 0.3})` : `rgba(40,22,8,${0.3 + r() * 0.3})`;
      ctx.fillRect(r() * W, r() * H, 1 + r() * 3.5, 1 + r() * 3);
    }
    // Agujeros de chinchetas antiguas
    for (let i = 0; i < 70; i++) {
      ctx.fillStyle = 'rgba(25,14,5,0.7)';
      ctx.beginPath();
      ctx.arc(r() * W, r() * H, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    return tex(c);
  });
}

// ─── Pared y metal ───────────────────────────────────────────────────────────

/** Pared del despacho: friso de madera oscura abajo y papel pintado verde noche arriba. */
export function wallTexture(): THREE.Texture {
  return cached('wall', () => {
    const W = 2048;
    const H = 1024;
    const [c, ctx] = canvas(W, H);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1d2620');
    g.addColorStop(1, '#141a16');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // Papel pintado de rayas finas
    for (let x = 0; x < W; x += 32) {
      ctx.fillStyle = 'rgba(200,190,150,0.035)';
      ctx.fillRect(x, 0, 3, H * 0.62);
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(x + 14, 0, 1, H * 0.62);
    }
    // Friso de madera
    ctx.fillStyle = '#21160e';
    ctx.fillRect(0, H * 0.62, W, H * 0.38);
    ctx.fillStyle = '#3a2717';
    ctx.fillRect(0, H * 0.62, W, 10);
    for (let x = 0; x < W; x += 256) {
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 6;
      ctx.strokeRect(x + 24, H * 0.62 + 40, 208, H * 0.38 - 70);
      ctx.strokeStyle = 'rgba(255,220,180,0.05)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 30, H * 0.62 + 46, 196, H * 0.38 - 82);
    }
    grain(ctx, W, H, 12, 31);
    return tex(c);
  });
}

export function brushedRoughness(seed = 41): THREE.Texture {
  return cached(`brushed:${seed}`, () => {
    const [c, ctx] = canvas(256, 256);
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(0, 0, 256, 256);
    const r = rng(seed);
    for (let i = 0; i < 400; i++) {
      ctx.strokeStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},${0.06 + r() * 0.08})`;
      ctx.lineWidth = 0.5 + r();
      const y = r() * 256;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y + (r() - 0.5) * 4);
      ctx.stroke();
    }
    return tex(c, { srgb: false });
  });
}

// ─── Fotografías analógicas ──────────────────────────────────────────────────

/** Fotografía en blanco y negro o sepia, con grano, viñeta y una silueta de escena. */
export function photoCanvas(seed: number, opts: { sepia?: boolean; polaroid?: boolean; caption?: string } = {}): HTMLCanvasElement {
  const W = 360;
  const H = opts.polaroid ? 430 : 300;
  const [c, ctx] = canvas(W, H);
  const r = rng(seed);
  const border = opts.polaroid ? 18 : 12;
  ctx.fillStyle = opts.polaroid ? '#efe9dc' : '#e8e2d2';
  ctx.fillRect(0, 0, W, H);
  const pw = W - border * 2;
  const ph = opts.polaroid ? pw : H - border * 2;
  const tone = opts.sepia ? [120, 96, 66] : [96, 96, 92];
  const sky = ctx.createLinearGradient(0, border, 0, border + ph);
  sky.addColorStop(0, `rgb(${tone[0]! + 60},${tone[1]! + 58},${tone[2]! + 52})`);
  sky.addColorStop(1, `rgb(${tone[0]! - 50},${tone[1]! - 50},${tone[2]! - 46})`);
  ctx.fillStyle = sky;
  ctx.fillRect(border, border, pw, ph);
  ctx.save();
  ctx.beginPath();
  ctx.rect(border, border, pw, ph);
  ctx.clip();
  // Escena: horizonte de edificios o figura
  const kind = Math.floor(r() * 3);
  ctx.fillStyle = `rgba(${tone[0]! - 80},${tone[1]! - 80},${tone[2]! - 76},0.9)`;
  if (kind === 0) {
    let x = border;
    while (x < border + pw) {
      const bw = 20 + r() * 50;
      const bh = ph * (0.25 + r() * 0.45);
      ctx.fillRect(x, border + ph - bh, bw, bh);
      x += bw + 2;
    }
  } else if (kind === 1) {
    const cx = border + pw * (0.3 + r() * 0.4);
    ctx.beginPath();
    ctx.ellipse(cx, border + ph * 0.42, pw * 0.08, ph * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - pw * 0.2, border + ph);
    ctx.quadraticCurveTo(cx, border + ph * 0.5, cx + pw * 0.2, border + ph);
    ctx.fill();
  } else {
    ctx.fillRect(border, border + ph * 0.65, pw, ph * 0.35);
    ctx.fillStyle = `rgba(${tone[0]! - 100},${tone[1]! - 100},${tone[2]! - 96},0.9)`;
    ctx.fillRect(border + pw * 0.15, border + ph * 0.45, pw * 0.25, ph * 0.3);
    ctx.fillRect(border + pw * 0.55, border + ph * 0.5, pw * 0.3, ph * 0.25);
  }
  const vig = ctx.createRadialGradient(W / 2, border + ph / 2, ph * 0.2, W / 2, border + ph / 2, ph * 0.8);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vig;
  ctx.fillRect(border, border, pw, ph);
  ctx.restore();
  if (opts.caption) {
    ctx.font = '26px "Caveat", cursive';
    ctx.fillStyle = '#3d4a6b';
    ctx.textAlign = 'center';
    ctx.fillText(opts.caption, W / 2, border + ph + 46);
  }
  grain(ctx, W, H, 26, seed + 3);
  return c;
}
