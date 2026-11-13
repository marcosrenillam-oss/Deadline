import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { LampMaterial, NotebookMaterial, PhoneMaterial, TypewriterMaterial } from '../desk/palettes.ts';
import { brushedRoughness, corkTexture, paperCanvas, photoCanvas, tex, typedSheet } from './textures.ts';

/**
 * OBJETOS DEL DESPACHO EN 3D.
 *
 * Unidades: 1 = 10 cm. La superficie de la mesa está en y = 0; la cámara
 * mira desde delante y arriba. Cada objeto interactivo devuelve su grupo,
 * un volumen de toque generoso (invisible), el punto al que se acerca la
 * cámara y una función `pose(t)` que coloca su animación de apertura en el
 * instante t ∈ [0, 1]. Las animaciones son distintas para cada objeto.
 */

export type DeskObjectId = 'folder' | 'calendar' | 'cabinet' | 'phone' | 'typewriter' | 'notebook' | 'lamp' | 'board' | 'nameplate' | 'guide' | 'chain';

export interface DeskObject {
  id: DeskObjectId;
  group: THREE.Group;
  hit: THREE.Mesh;
  focus: THREE.Vector3;
  pose: (t: number) => void;
}

const HIT = new THREE.MeshBasicMaterial({ visible: false });
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

function shadow<T extends THREE.Object3D>(o: T, cast = true, receive = true): T {
  o.traverse((x) => {
    if ((x as THREE.Mesh).isMesh) {
      x.castShadow = cast;
      x.receiveShadow = receive;
    }
  });
  return o;
}

function hitBox(w: number, h: number, d: number, at: THREE.Vector3Like): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), HIT);
  m.position.set(at.x, at.y, at.z);
  return m;
}

const std = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o);
export const brass = () => std({ color: '#b08d4f', metalness: 1, roughness: 0.32, roughnessMap: brushedRoughness() });
const chrome = () => std({ color: '#c9c6bf', metalness: 1, roughness: 0.18 });

// ─── Carpeta de expedientes (biblioteca) ────────────────────────────────────

export function buildFolder(investigator: string): DeskObject {
  const group = new THREE.Group();
  const manila = (seed: number) => tex(paperCanvas(512, 640, '#c7a76b', seed, 0.5)[0]);
  // Pila de carpetas
  for (let i = 0; i < 3; i++) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.035, 4.2), std({ map: manila(40 + i), roughness: 0.85 }));
    f.position.set((i - 1) * 0.12, 0.02 + i * 0.04, (1 - i) * 0.08);
    f.rotation.y = (i - 1) * 0.05;
    group.add(f);
  }
  // Carpeta superior: hoja interior y tapa articulada en el lomo izquierdo
  const top = new THREE.Group();
  top.position.y = 0.14;
  group.add(top);
  const sheet = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8, 3.8),
    std({ map: tex(typedSheet(['ÍNDICE DEL ARCHIVO', 'Casos individuales', 'Casos del día', 'Expedientes vinculados', '', 'Sección de homicidios', 'Desapariciones · Robos', 'Chantajes · Fraudes'], { w: 512, h: 700, seed: 9 })), roughness: 0.9 }),
  );
  sheet.rotation.x = -Math.PI / 2;
  sheet.position.set(0.05, 0.005, 0.05);
  top.add(sheet);
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.0), std({ map: tex(photoCanvas(5, { sepia: true })), roughness: 0.6 }));
  photo.rotation.set(-Math.PI / 2, 0, 0.12);
  photo.position.set(0.6, 0.012, -0.9);
  top.add(photo);

  const hinge = new THREE.Group();
  hinge.position.set(-1.6, 0.01, 0);
  top.add(hinge);
  const [cc, ctx] = paperCanvas(640, 840, '#c9a96a', 17, 0.55);
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(40,30,20,0.85)';
  ctx.font = '700 44px "IBM Plex Sans Condensed", sans-serif';
  ctx.fillText('ARCHIVO DE', 320, 230);
  ctx.fillText('EXPEDIENTES', 320, 285);
  ctx.font = '600 92px "Cormorant Garamond", serif';
  ctx.fillText('DEADLINE', 320, 420);
  ctx.font = '28px "Courier Prime", monospace';
  ctx.fillText(`Investigador ${investigator}`, 320, 500);
  ctx.save();
  ctx.translate(330, 650);
  ctx.rotate(-0.16);
  ctx.strokeStyle = 'rgba(118,45,43,0.85)';
  ctx.lineWidth = 7;
  ctx.strokeRect(-170, -48, 340, 96);
  ctx.fillStyle = 'rgba(118,45,43,0.85)';
  ctx.font = '700 54px "IBM Plex Sans Condensed", sans-serif';
  ctx.fillText('CONFIDENCIAL', 0, 20);
  ctx.restore();
  const cover = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.03, 4.2), [
    std({ color: '#b8965a', roughness: 0.9 }),
    std({ color: '#b8965a', roughness: 0.9 }),
    std({ map: tex(cc), roughness: 0.85 }),
    std({ color: '#c2a165', roughness: 0.9 }),
    std({ color: '#b8965a', roughness: 0.9 }),
    std({ color: '#b8965a', roughness: 0.9 }),
  ]);
  cover.position.set(1.6, 0.03, 0);
  hinge.add(cover);
  const tab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 0.35), std({ color: '#c9a96a', roughness: 0.9 }));
  tab.position.set(2.6, 0.03, -2.25);
  hinge.add(tab);
  shadow(group);

  const base = { y: 0, z: 0 };
  return {
    id: 'folder',
    group,
    hit: hitBox(3.6, 0.8, 4.6, { x: 0, y: 0.3, z: 0 }),
    focus: new THREE.Vector3(0, 0.5, 0),
    pose: (t) => {
      const lift = easeOut(seg(t, 0, 0.45));
      const open = easeInOut(seg(t, 0.35, 1));
      group.position.y = base.y + lift * 0.9;
      group.position.z = base.z + lift * 1.4;
      group.rotation.x = lift * 0.35;
      hinge.rotation.z = open * 2.75;
    },
  };
}

// ─── Calendario de sobremesa (casos del día) ─────────────────────────────────

export interface CalendarFace {
  day: string;
  month: string;
  weekday: string;
  label: string;
  fresh: boolean;
}

function calendarPage(f: CalendarFace, seed: number): HTMLCanvasElement {
  const [c, ctx] = paperCanvas(512, 600, '#efe8d6', seed, 0.25);
  ctx.fillStyle = '#762d2b';
  ctx.fillRect(0, 0, 512, 120);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#efe6d2';
  ctx.font = '700 46px "IBM Plex Sans Condensed", sans-serif';
  ctx.fillText(f.month.toUpperCase(), 256, 80);
  ctx.fillStyle = '#1e1b17';
  ctx.font = '600 250px "Cormorant Garamond", serif';
  ctx.fillText(f.day, 256, 370);
  ctx.font = '34px "Courier Prime", monospace';
  ctx.fillText(f.weekday, 256, 440);
  ctx.fillStyle = '#762d2b';
  ctx.font = '700 28px "IBM Plex Sans Condensed", sans-serif';
  ctx.fillText(f.label.toUpperCase(), 256, 520);
  if (f.fresh) {
    ctx.strokeStyle = 'rgba(118,45,43,0.85)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(256, 290, 150, 125, -0.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = '40px "Caveat", cursive';
    ctx.fillText('¡caso nuevo!', 360, 585);
  }
  return c;
}

export function buildCalendar(face: CalendarFace): DeskObject & { setFace: (f: CalendarFace) => void } {
  const group = new THREE.Group();
  const W = 2.1;
  const H = 2.4;
  const lean = 0.42;
  const wood = std({ color: '#2a1b10', roughness: 0.55 });
  // Caballete trasero
  const back = new THREE.Mesh(new THREE.BoxGeometry(W + 0.1, H, 0.06), wood);
  back.rotation.x = lean;
  back.position.set(0, (H / 2) * Math.cos(lean), -0.55);
  group.add(back);
  const baseBar = new THREE.Mesh(new THREE.BoxGeometry(W + 0.2, 0.1, 1.5), wood);
  baseBar.position.set(0, 0.05, 0.05);
  group.add(baseBar);
  // Hojas: soporte delantero inclinado y bloque de páginas
  const front = new THREE.Group();
  front.position.set(0, H * Math.cos(lean) - 0.02, -0.05);
  front.rotation.x = -lean;
  group.add(front);
  const pageMat = std({ map: tex(calendarPage(face, 61)), roughness: 0.92 });
  const nextMat = std({ map: tex(calendarPage({ ...face, fresh: false }, 62)), roughness: 0.92 });
  const stack = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.14), [std({ color: '#ddd3bd' }), std({ color: '#ddd3bd' }), std({ color: '#ddd3bd' }), std({ color: '#ddd3bd' }), nextMat, std({ color: '#2a1b10' })]);
  stack.position.set(0, -H / 2, -0.08);
  front.add(stack);
  // Hoja de hoy, articulada en las anillas
  const leaf = new THREE.Group();
  front.add(leaf);
  const page = new THREE.Mesh(new THREE.PlaneGeometry(W, H), pageMat);
  page.position.set(0, -H / 2, 0.005);
  leaf.add(page);
  const pageBack = new THREE.Mesh(new THREE.PlaneGeometry(W, H), std({ color: '#d8ceb6', roughness: 0.95 }));
  pageBack.rotation.y = Math.PI;
  pageBack.position.set(0, -H / 2, 0.001);
  leaf.add(pageBack);
  // Anillas
  for (const x of [-0.65, 0, 0.65]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 20), chrome());
    ring.rotation.y = Math.PI / 2;
    ring.position.set(x, 0, 0);
    front.add(ring);
  }
  shadow(group);
  const setFace = (f: CalendarFace) => {
    pageMat.map?.dispose();
    pageMat.map = tex(calendarPage(f, 61));
    pageMat.needsUpdate = true;
  };
  return {
    id: 'calendar',
    group,
    hit: hitBox(2.6, 2.6, 2.0, { x: 0, y: 1.1, z: -0.1 }),
    focus: new THREE.Vector3(0, 1.1, 0),
    setFace,
    pose: (t) => {
      const lift = easeOut(seg(t, 0, 0.35));
      group.position.y = lift * 0.25;
      leaf.rotation.x = -easeInOut(seg(t, 0.15, 0.9)) * Math.PI * 0.92;
    },
  };
}

// ─── Archivador (archivo personal) ───────────────────────────────────────────

export function buildCabinet(): DeskObject {
  const group = new THREE.Group();
  const metal = std({ color: '#4a5038', metalness: 0.55, roughness: 0.55, roughnessMap: brushedRoughness(43) });
  const W = 2.8;
  const H = 6.2;
  const D = 2.8;
  const body = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 2, 0.06), metal);
  body.position.y = H / 2;
  group.add(body);
  const labels = ['RESUELTOS', 'CERRADOS', 'FALLIDOS', 'REABRIBLES'];
  const drawers: THREE.Group[] = [];
  labels.forEach((text, i) => {
    const d = new THREE.Group();
    d.position.set(0, H - 0.85 - i * 1.48, D / 2);
    const front = new THREE.Mesh(new RoundedBoxGeometry(W - 0.25, 1.32, 0.12, 2, 0.04), metal);
    d.add(front);
    // Cuerpo del cajón (se ve al abrir) con fichas
    const box = new THREE.Mesh(new THREE.BoxGeometry(W - 0.4, 1.0, D - 0.3), std({ color: '#3d4230', metalness: 0.4, roughness: 0.6 }));
    box.position.set(0, -0.05, -(D - 0.3) / 2 - 0.06);
    d.add(box);
    if (i === 0) {
      for (let k = 0; k < 9; k++) {
        const card = new THREE.Mesh(new THREE.BoxGeometry(W - 0.6, 0.9, 0.02), std({ color: k % 3 === 0 ? '#c7a76b' : '#e6dcc4', roughness: 0.9 }));
        card.position.set(0, 0.35, -0.3 - k * 0.24);
        card.rotation.x = -0.12;
        d.add(card);
      }
    }
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.09, 0.14), brass());
    handle.position.set(0, -0.25, 0.12);
    d.add(handle);
    const [lc, lctx] = paperCanvas(256, 96, '#e9e0c9', 70 + i, 0.3);
    lctx.fillStyle = '#2a241a';
    lctx.font = '700 34px "IBM Plex Sans Condensed", sans-serif';
    lctx.textAlign = 'center';
    lctx.fillText(text, 128, 60);
    const label = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.3), std({ map: tex(lc), roughness: 0.9 }));
    label.position.set(0, 0.2, 0.065);
    d.add(label);
    const holder = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.38, 0.02), brass());
    holder.position.set(0, 0.2, 0.055);
    d.add(holder);
    drawers.push(d);
    group.add(d);
  });
  shadow(group);
  const top = drawers[0]!;
  return {
    id: 'cabinet',
    group,
    hit: hitBox(W + 0.3, H, D + 0.6, { x: 0, y: H / 2, z: 0.2 }),
    focus: new THREE.Vector3(0, H - 1, D / 2),
    pose: (t) => {
      top.position.z = D / 2 + easeOut(seg(t, 0.05, 0.85)) * 1.9;
    },
  };
}

// ─── Teléfono de disco (cooperativo) ─────────────────────────────────────────

export function buildPhone(m: PhoneMaterial): DeskObject {
  const group = new THREE.Group();
  const bakelite = std({ color: m.body, roughness: 0.28, metalness: 0.05 });
  const body = new THREE.Mesh(new RoundedBoxGeometry(2.1, 0.75, 2.4, 4, 0.3), bakelite);
  body.position.y = 0.37;
  group.add(body);
  const slope = new THREE.Mesh(new RoundedBoxGeometry(1.8, 0.5, 1.0, 4, 0.22), bakelite);
  slope.position.set(0, 0.78, -0.62);
  group.add(slope);
  // Dial: placa numerada, disco con agujeros y tope
  const dial = new THREE.Group();
  dial.position.set(0, 0.78, 0.42);
  dial.rotation.x = 0.35;
  group.add(dial);
  const [pc, pctx] = paperCanvas(256, 256, m.plate, 51, 0.2);
  pctx.translate(128, 128);
  pctx.fillStyle = '#1e1b17';
  pctx.font = '700 26px "IBM Plex Sans Condensed", sans-serif';
  pctx.textAlign = 'center';
  pctx.textBaseline = 'middle';
  for (let n = 0; n < 10; n++) {
    const a = -Math.PI / 3 + (n * Math.PI * 1.5) / 9;
    pctx.fillText(String((n + 1) % 10), Math.cos(a) * 92, Math.sin(a) * 92);
  }
  pctx.font = '600 22px "Cormorant Garamond", serif';
  pctx.fillText('DL', 0, 0);
  const plate = new THREE.Mesh(new THREE.CircleGeometry(0.72, 48), std({ map: tex(pc), roughness: 0.5 }));
  plate.rotation.x = -Math.PI / 2;
  dial.add(plate);
  const wheelShape = new THREE.Shape();
  wheelShape.absarc(0, 0, 0.75, 0, Math.PI * 2, false);
  for (let n = 0; n < 10; n++) {
    const a = -Math.PI / 3 + (n * Math.PI * 1.5) / 9;
    const hole = new THREE.Path();
    hole.absarc(Math.cos(a) * 0.53, Math.sin(a) * 0.53, 0.12, 0, Math.PI * 2, true);
    wheelShape.holes.push(hole);
  }
  const center = new THREE.Path();
  center.absarc(0, 0, 0.22, 0, Math.PI * 2, true);
  wheelShape.holes.push(center);
  const wheel = new THREE.Mesh(new THREE.ExtrudeGeometry(wheelShape, { depth: 0.05, bevelEnabled: false, curveSegments: 24 }), chrome());
  wheel.rotation.x = -Math.PI / 2;
  wheel.position.y = 0.02;
  dial.add(wheel);
  // Horquilla y auricular
  for (const x of [-0.75, 0.75]) {
    const prong = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.35, 0.3), bakelite);
    prong.position.set(x, 1.12, -0.75);
    group.add(prong);
  }
  const handset = new THREE.Group();
  handset.position.set(0, 1.44, -0.75);
  group.add(handset);
  const grip = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 1.7, 6, 16), bakelite);
  grip.rotation.z = Math.PI / 2;
  handset.add(grip);
  for (const x of [-1.05, 1.05]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.26, 0.42, 24), bakelite);
    cup.position.set(x, -0.1, 0);
    handset.add(cup);
  }
  // Cable rizado hasta la mesa
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 60; i++) {
    const s = i / 60;
    pts.push(new THREE.Vector3(-1.1 - s * 0.9 + Math.cos(s * 40) * 0.07, 0.4 - s * 0.35 + Math.sin(s * 40) * 0.07, 0.2 + s * 0.9));
  }
  const cord = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, 0.03, 6), bakelite);
  group.add(cord);
  shadow(group);
  return {
    id: 'phone',
    group,
    hit: hitBox(2.8, 2.0, 2.9, { x: 0, y: 0.9, z: 0 }),
    focus: new THREE.Vector3(0, 1, 0),
    pose: (t) => {
      const lift = easeOut(seg(t, 0, 0.6));
      handset.position.y = 1.44 + lift * 0.9;
      handset.rotation.x = lift * 0.5;
      handset.rotation.z = lift * 0.25;
      wheel.rotation.z = Math.sin(seg(t, 0.2, 1) * Math.PI) * 0.9;
    },
  };
}

/** Pequeña vibración del teléfono que «suena» un instante. */
export function ringPhone(o: DeskObject, t: number): void {
  o.group.rotation.z = Math.sin(t * 90) * 0.012 * (1 - t);
}

// ─── Máquina de escribir (historial) ─────────────────────────────────────────

export function buildTypewriter(m: TypewriterMaterial, lines: string[]): DeskObject & { setLines: (l: string[]) => void } {
  const group = new THREE.Group();
  const enamel = std({ color: m.body, roughness: 0.35, metalness: 0.15 });
  const base = new THREE.Mesh(new RoundedBoxGeometry(4.0, 0.5, 3.4, 4, 0.2), enamel);
  base.position.y = 0.25;
  group.add(base);
  // Cuerpo escalonado: el teclado sube hacia el carro
  const deck = new THREE.Mesh(new RoundedBoxGeometry(3.8, 0.5, 1.6, 4, 0.2), enamel);
  deck.position.set(0, 0.55, 0.15);
  deck.rotation.x = 0.22;
  group.add(deck);
  const hood = new THREE.Mesh(new RoundedBoxGeometry(4.0, 0.8, 1.3, 4, 0.25), enamel);
  hood.position.set(0, 0.85, -1.0);
  group.add(hood);
  // Teclado: teclas redondas en filas escalonadas (una sola malla instanciada)
  const rows = [10, 10, 9, 8];
  const count = rows.reduce((a, b) => a + b, 0);
  const keyGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.1, 18);
  const keys = new THREE.InstancedMesh(keyGeo, std({ color: m.key, roughness: 0.4 }), count);
  const rings = new THREE.InstancedMesh(new THREE.TorusGeometry(0.13, 0.025, 6, 18), chrome(), count);
  const mtx = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const ringQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
  let k = 0;
  rows.forEach((n, r) => {
    for (let i = 0; i < n; i++) {
      const p = new THREE.Vector3((i - (n - 1) / 2) * 0.34 + r * 0.06, 0.92 - r * 0.1, -0.05 + r * 0.36);
      mtx.compose(p, q, new THREE.Vector3(1, 1, 1));
      keys.setMatrixAt(k, mtx);
      mtx.compose(p.clone().setY(p.y + 0.05), ringQ, new THREE.Vector3(1, 1, 1));
      rings.setMatrixAt(k, mtx);
      k++;
    }
  });
  group.add(keys, rings);
  const space = new THREE.Mesh(new RoundedBoxGeometry(2.0, 0.08, 0.18, 2, 0.04), std({ color: m.key, roughness: 0.4 }));
  space.position.set(0.1, 0.55, 1.35);
  group.add(space);
  // Carro: rodillo, papel y palanca
  const carriage = new THREE.Group();
  carriage.position.set(0, 1.42, -1.15);
  group.add(carriage);
  const platen = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 4.6, 24), std({ color: '#141414', roughness: 0.5 }));
  platen.rotation.z = Math.PI / 2;
  carriage.add(platen);
  for (const x of [-2.4, 2.4]) {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.22, 24), enamel);
    knob.rotation.z = Math.PI / 2;
    knob.position.x = x;
    carriage.add(knob);
  }
  const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8), chrome());
  lever.position.set(-2.3, 0.35, 0.3);
  lever.rotation.set(0.6, 0, 0.7);
  carriage.add(lever);
  const sheetMat = std({ map: tex(typedSheet(lines, { w: 512, h: 560, seed: 13 })), roughness: 0.92, side: THREE.DoubleSide });
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 2.5), sheetMat);
  paper.position.set(0, 1.2, -0.25);
  paper.rotation.x = -0.22;
  carriage.add(paper);
  // Carretes de cinta
  for (const x of [-1.2, 1.2]) {
    const spool = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 24), std({ color: '#111', roughness: 0.5 }));
    spool.position.set(x, 1.28, -0.75);
    group.add(spool);
  }
  shadow(group);
  const setLines = (l: string[]) => {
    sheetMat.map?.dispose();
    sheetMat.map = tex(typedSheet(l, { w: 512, h: 560, seed: 13 }));
    sheetMat.needsUpdate = true;
  };
  return {
    id: 'typewriter',
    group,
    hit: hitBox(4.6, 3.2, 3.8, { x: 0, y: 1.2, z: 0 }),
    focus: new THREE.Vector3(0, 1.5, -0.5),
    setLines,
    pose: (t) => {
      carriage.position.x = -easeInOut(seg(t, 0, 0.7)) * 1.1;
      carriage.position.y = 1.42 + Math.sin(seg(t, 0.6, 1) * Math.PI) * 0.05;
      paper.position.y = 1.2 + easeOut(seg(t, 0.3, 1)) * 0.4;
    },
  };
}

// ─── Libreta (notas) ─────────────────────────────────────────────────────────

export function buildNotebook(m: NotebookMaterial, count: number): DeskObject & { setCount: (n: number) => void } {
  const group = new THREE.Group();
  const leather = std({ color: m.cover, roughness: 0.7 });
  const W = 2.3;
  const D = 3.1;
  const back = new THREE.Mesh(new RoundedBoxGeometry(W, 0.06, D, 2, 0.03), leather);
  back.position.y = 0.03;
  group.add(back);
  const [lc, lctx] = paperCanvas(512, 700, '#f0e9d6', 81, 0.2);
  lctx.strokeStyle = 'rgba(70,90,140,0.35)';
  for (let y = 90; y < 700; y += 36) {
    lctx.beginPath();
    lctx.moveTo(30, y);
    lctx.lineTo(482, y);
    lctx.stroke();
  }
  lctx.font = '34px "Caveat", cursive';
  lctx.fillStyle = 'rgba(40,50,90,0.85)';
  ;['¿Quién tenía la llave?', 'La coartada no cuadra', 'Volver a la escena', 'Hora: 22:12 →'].forEach((l, i) => lctx.fillText(l, 50, 120 + i * 72));
  const pages = new THREE.Mesh(new THREE.BoxGeometry(W - 0.12, 0.22, D - 0.1), [
    std({ color: '#e8e0ca' }),
    std({ color: '#e8e0ca' }),
    std({ map: tex(lc), roughness: 0.95 }),
    std({ color: '#e8e0ca' }),
    std({ color: '#e8e0ca' }),
    std({ color: '#e8e0ca' }),
  ]);
  pages.position.set(0.04, 0.17, 0);
  group.add(pages);
  const hinge = new THREE.Group();
  hinge.position.set(-W / 2, 0.29, 0);
  group.add(hinge);
  const cover = new THREE.Mesh(new RoundedBoxGeometry(W, 0.06, D, 2, 0.03), leather);
  cover.position.x = W / 2;
  hinge.add(cover);
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.36, D + 0.02), std({ color: m.band, roughness: 0.6 }));
  band.position.set(W / 2 - 0.35, 0.17, 0);
  group.add(band);
  const labelMat = std({ roughness: 0.85 });
  const drawLabel = (n: number) => {
    const [c, ctx] = paperCanvas(256, 128, '#e9e0c9', 88, 0.35);
    ctx.fillStyle = '#2a241a';
    ctx.textAlign = 'center';
    ctx.font = '700 30px "IBM Plex Sans Condensed", sans-serif';
    ctx.fillText('NOTAS', 128, 54);
    ctx.font = '30px "Courier Prime", monospace';
    ctx.fillText(String(n), 128, 100);
    labelMat.map?.dispose();
    labelMat.map = tex(c);
    labelMat.needsUpdate = true;
  };
  drawLabel(count);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), labelMat);
  label.rotation.x = -Math.PI / 2;
  label.position.set(W / 2 - 0.2, 0.035, -0.6);
  cover.add(label);
  // Lápiz
  const pencil = new THREE.Group();
  const wood = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 6), std({ color: '#c99a2e', roughness: 0.5 }));
  pencil.add(wood);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.25, 6), std({ color: '#e0c49a', roughness: 0.8 }));
  tip.position.y = 1.42;
  pencil.add(tip);
  const eraser = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.18, 12), std({ color: '#b5524d', roughness: 0.8 }));
  eraser.position.y = -1.38;
  pencil.add(eraser);
  pencil.rotation.set(Math.PI / 2, 0, 0.12);
  pencil.position.set(W / 2 + 0.35, 0.08, 0.1);
  group.add(pencil);
  shadow(group);
  return {
    id: 'notebook',
    group,
    hit: hitBox(W + 0.8, 0.8, D + 0.4, { x: 0.2, y: 0.3, z: 0 }),
    focus: new THREE.Vector3(0, 0.4, 0),
    setCount: drawLabel,
    pose: (t) => {
      const lift = easeOut(seg(t, 0, 0.4));
      group.position.y = lift * 0.5;
      group.position.z = lift * 0.6;
      band.visible = t < 0.2;
      hinge.rotation.z = easeInOut(seg(t, 0.2, 1)) * 2.9;
    },
  };
}

// ─── Lámpara (ajustes) ───────────────────────────────────────────────────────

export interface LampObject extends DeskObject {
  bulb: THREE.Vector3;
  shadeMat: THREE.MeshPhysicalMaterial;
  bulbMat: THREE.MeshStandardMaterial;
  chain: THREE.Mesh;
  pullChain: (t: number) => void;
}

export function buildLamp(kind: 'lamp-banker' | 'lamp-brass', m: LampMaterial): LampObject {
  const group = new THREE.Group();
  const metal = std({ color: m.metal, metalness: 1, roughness: 0.3, roughnessMap: brushedRoughness(44) });
  const shadeMat = new THREE.MeshPhysicalMaterial({ color: m.shade, roughness: 0.12, metalness: kind === 'lamp-brass' ? 0.9 : 0.05, clearcoat: 1, clearcoatRoughness: 0.08, side: THREE.DoubleSide, emissive: m.shadeLight, emissiveIntensity: 0 });
  const bulbMat = std({ color: '#fff3d6', emissive: '#ffd59a', emissiveIntensity: 2 });
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.95, 0.2, 40), metal);
  foot.position.y = 0.1;
  group.add(foot);
  const chainLink = new THREE.Group();
  const bulb = new THREE.Vector3();
  if (kind === 'lamp-brass') {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 12), metal);
    arm.position.set(0.5, 1.3, 0.35);
    arm.rotation.set(0.35, 0, -0.4);
    group.add(arm);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.0, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2.1), shadeMat);
    dome.position.set(1.0, 2.55, 0.9);
    dome.rotation.set(0.5, 0, -0.6);
    group.add(dome);
    bulb.set(1.05, 2.3, 0.95);
  } else {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.0, 12), metal);
    stem.position.set(0, 1.1, -0.2);
    group.add(stem);
    const yoke = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.035, 8, 32, Math.PI), metal);
    yoke.position.set(0, 2.1, -0.2);
    yoke.rotation.set(0, Math.PI / 2, 0);
    group.add(yoke);
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 2.4, 40, 1, true, -Math.PI / 2, Math.PI), shadeMat);
    shade.rotation.z = Math.PI / 2;
    shade.position.set(0, 2.25, -0.2);
    group.add(shade);
    for (const x of [-1.2, 1.2]) {
      const cap = new THREE.Mesh(new THREE.CircleGeometry(0.58, 32, 0, Math.PI), shadeMat);
      cap.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
      cap.position.set(x, 2.25, -0.2);
      group.add(cap);
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.03, 6, 32, Math.PI), metal);
      band.rotation.y = Math.PI / 2;
      band.position.set(x, 2.25, -0.2);
      group.add(band);
    }
    bulb.set(0, 2.0, -0.2);
  }
  const bulbMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 12), bulbMat);
  bulbMesh.position.copy(bulb);
  group.add(bulbMesh);
  // Cadenita
  const chainTop = kind === 'lamp-brass' ? new THREE.Vector3(1.5, 2.0, 1.4) : new THREE.Vector3(0.8, 1.7, 0.4);
  for (let i = 0; i < 9; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), metal);
    b.position.set(0, -i * 0.09, 0);
    chainLink.add(b);
  }
  const pull = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.2, 12), metal);
  pull.position.y = -0.9;
  chainLink.add(pull);
  chainLink.position.copy(chainTop);
  group.add(chainLink);
  const chainHit = hitBox(0.7, 1.4, 0.7, { x: chainTop.x, y: chainTop.y - 0.6, z: chainTop.z });
  shadow(group, true, false);
  return {
    id: 'lamp',
    group,
    hit: hitBox(3.4, 3.2, 2.2, { x: 0, y: 1.6, z: -0.2 }),
    focus: new THREE.Vector3(0, 1.8, 0),
    bulb,
    shadeMat,
    bulbMat,
    chain: chainHit,
    pullChain: (t) => {
      chainLink.position.y = chainTop.y - Math.sin(t * Math.PI) * 0.18;
    },
    pose: (t) => {
      group.rotation.y = Math.sin(seg(t, 0, 1) * Math.PI) * 0.08;
    },
  };
}

// ─── Corcho de investigación (pared) ─────────────────────────────────────────

export function buildCorkBoard(): DeskObject {
  const group = new THREE.Group();
  const W = 6.6;
  const H = 3.4;
  const board = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.12), std({ map: corkTexture(), roughness: 0.95 }));
  group.add(board);
  const frameMat = std({ color: '#2b1c11', roughness: 0.5 });
  for (const [w, h, x, y] of [
    [W + 0.3, 0.18, 0, H / 2 + 0.06],
    [W + 0.3, 0.18, 0, -H / 2 - 0.06],
    [0.18, H, -W / 2 - 0.06, 0],
    [0.18, H, W / 2 + 0.06, 0],
  ] as const) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.22), frameMat);
    f.position.set(x, y, 0.03);
    group.add(f);
  }
  const pins: THREE.Mesh[] = [];
  const pinAt: THREE.Vector3[] = [];
  const items: Array<{ x: number; y: number; w: number; h: number; rot: number; c: HTMLCanvasElement; pin: string }> = [
    { x: -2.2, y: 0.7, w: 1.4, h: 1.15, rot: -0.06, c: photoCanvas(101, { sepia: true }), pin: '#a12a24' },
    { x: -0.4, y: 1.0, w: 1.15, h: 1.4, rot: 0.05, c: photoCanvas(102, { polaroid: true, caption: '¿Muelle 4?' }), pin: '#a12a24' },
    { x: 1.6, y: 0.6, w: 1.4, h: 1.15, rot: -0.03, c: photoCanvas(103), pin: '#d8b45a' },
    { x: -1.4, y: -0.95, w: 1.5, h: 1.0, rot: 0.04, c: typedSheet(['INFORME', 'Testigo: 22:12', 'Paraguas negro'], { w: 384, h: 256, seed: 104 }), pin: '#1f1f1f' },
    { x: 1.1, y: -1.0, w: 1.2, h: 0.85, rot: -0.07, c: typedSheet(['COARTADA', '¿Teatro?', 'Comprobar'], { w: 360, h: 256, seed: 105 }), pin: '#a12a24' },
    { x: 2.65, y: -0.7, w: 0.95, h: 1.2, rot: 0.08, c: photoCanvas(106, { polaroid: true, caption: '1987' }), pin: '#d8b45a' },
  ];
  for (const it of items) {
    const card = new THREE.Mesh(new THREE.PlaneGeometry(it.w, it.h), std({ map: tex(it.c), roughness: 0.75 }));
    card.position.set(it.x, it.y, 0.075);
    card.rotation.z = it.rot;
    group.add(card);
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), std({ color: it.pin, roughness: 0.3, metalness: 0.1 }));
    const p = new THREE.Vector3(it.x, it.y + it.h / 2 - 0.12, 0.16);
    pin.position.copy(p);
    group.add(pin);
    pins.push(pin);
    pinAt.push(p);
  }
  // Hilo rojo entre pistas
  const thread = std({ color: '#9d1f1c', roughness: 0.6 });
  for (const [a, b] of [
    [0, 1],
    [1, 2],
    [0, 3],
    [3, 4],
    [4, 2],
    [2, 5],
  ] as const) {
    const pa = pinAt[a]!;
    const pb = pinAt[b]!;
    const mid = pa.clone().lerp(pb, 0.5);
    mid.z += 0.02;
    mid.y -= 0.08;
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(pa, mid, pb), 16, 0.012, 5), thread);
    group.add(tube);
  }
  shadow(group, true, true);
  return {
    id: 'board',
    group,
    hit: hitBox(W + 0.4, H + 0.4, 0.6, { x: 0, y: 0, z: 0.1 }),
    focus: new THREE.Vector3(0, 0, 0.2),
    pose: (t) => {
      pins.forEach((p, i) => {
        p.position.z = (pinAt[i]?.z ?? 0.16) + Math.sin(seg(t, i * 0.06, 0.5 + i * 0.06) * Math.PI) * 0.12;
      });
    },
  };
}

// ─── Placa (ficha del investigador) ──────────────────────────────────────────

export function buildNameplate(text: { name: string; rank: string }): DeskObject & { setText: (t: { name: string; rank: string }) => void } {
  const group = new THREE.Group();
  const prism = new THREE.Shape();
  prism.moveTo(-0.45, 0);
  prism.lineTo(0.45, 0);
  prism.lineTo(0.12, 0.5);
  prism.lineTo(-0.12, 0.5);
  prism.closePath();
  const block = new THREE.Mesh(new THREE.ExtrudeGeometry(prism, { depth: 3.4, bevelEnabled: false }), std({ color: '#2b1a0f', roughness: 0.4 }));
  block.rotation.y = Math.PI / 2;
  block.position.set(-1.7, 0, 0);
  group.add(block);
  const plateMat = std({ metalness: 1, roughness: 0.28 });
  const draw = (t: { name: string; rank: string }) => {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 200;
    const ctx = c.getContext('2d')!;
    const g = ctx.createLinearGradient(0, 0, 0, 200);
    g.addColorStop(0, '#e9cf8f');
    g.addColorStop(0.5, '#b08d4f');
    g.addColorStop(1, '#8e6d34');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 200);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(40,26,8,0.9)';
    ctx.font = '600 70px "Cormorant Garamond", serif';
    ctx.fillText(t.name, 512, 92);
    ctx.font = '600 40px "IBM Plex Sans Condensed", sans-serif';
    ctx.fillText(t.rank.toUpperCase(), 512, 160);
    plateMat.map?.dispose();
    plateMat.map = tex(c);
    plateMat.needsUpdate = true;
  };
  draw(text);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 0.55), plateMat);
  plate.position.set(0, 0.26, 0.29);
  plate.rotation.x = -0.58;
  group.add(plate);
  shadow(group);
  return {
    id: 'nameplate',
    group,
    hit: hitBox(3.8, 0.9, 1.2, { x: 0, y: 0.3, z: 0 }),
    focus: new THREE.Vector3(0, 0.3, 0),
    setText: draw,
    pose: (t) => {
      group.position.y = Math.sin(seg(t, 0, 1) * Math.PI) * 0.25;
    },
  };
}

// ─── Nota de bienvenida ──────────────────────────────────────────────────────

export function buildGuideNote(): DeskObject {
  const group = new THREE.Group();
  const [c, ctx] = paperCanvas(400, 400, '#f1e9d2', 91, 0.3);
  ctx.fillStyle = 'rgba(40,50,90,0.9)';
  ctx.font = '44px "Caveat", cursive';
  ['Bienvenido.', 'Toca cualquier', 'objeto de la mesa.', 'Mantén pulsado', 'para saber qué es.'].forEach((l, i) => ctx.fillText(l, 34, 80 + i * 62));
  const note = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), std({ map: tex(c), roughness: 0.9 }));
  note.rotation.set(-Math.PI / 2, 0, 0.18);
  note.position.y = 0.035;
  group.add(note);
  shadow(group, false, true);
  return { id: 'guide', group, hit: hitBox(1.7, 0.4, 1.7, { x: 0, y: 0.1, z: 0 }), focus: new THREE.Vector3(0, 0.2, 0), pose: () => undefined };
}

// ─── Atrezo (no interactivo) ─────────────────────────────────────────────────

export function buildCoffee(): THREE.Group {
  const g = new THREE.Group();
  const china = std({ color: '#efe8da', roughness: 0.25 });
  const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(0.45, 0), new THREE.Vector2(0.5, 0.1), new THREE.Vector2(0.55, 0.9), new THREE.Vector2(0.5, 0.92), new THREE.Vector2(0.45, 0.12), new THREE.Vector2(0, 0.12)];
  const cup = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), china);
  g.add(cup);
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.47, 32), std({ color: '#24140a', roughness: 0.1 }));
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 0.72;
  g.add(coffee);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 8, 20, Math.PI * 1.2), china);
  handle.position.set(0.58, 0.5, 0);
  handle.rotation.z = -Math.PI * 0.6;
  g.add(handle);
  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.7, 0.06, 40), china);
  saucer.position.y = -0.02;
  g.add(saucer);
  return shadow(g);
}

export function buildMagnifier(): THREE.Group {
  const g = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 12, 40), brass());
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.07;
  g.add(rim);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.55, 40), new THREE.MeshPhysicalMaterial({ color: '#dfe8e4', roughness: 0.02, transmission: 0.0, transparent: true, opacity: 0.28, clearcoat: 1 }));
  lens.rotation.x = -Math.PI / 2;
  lens.position.y = 0.08;
  g.add(lens);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.3, 16), std({ color: '#5a2a1a', roughness: 0.35 }));
  handle.rotation.z = Math.PI / 2;
  handle.position.set(1.25, 0.1, 0);
  g.add(handle);
  return shadow(g);
}

export function buildPhotos(seed: number): THREE.Group {
  const g = new THREE.Group();
  [0, 1, 2].forEach((i) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.35), std({ map: tex(photoCanvas(seed + i, { polaroid: true, caption: ['Muelle 4', '¿1987?', '22:12'][i]! })), roughness: 0.6 }));
    p.rotation.set(-Math.PI / 2, 0, (i - 1) * 0.35);
    p.position.set(i * 0.7, 0.012 + i * 0.004, (i % 2) * 0.3);
    g.add(p);
  });
  return shadow(g, false, true);
}

export function buildBadge(): THREE.Group {
  const g = new THREE.Group();
  const wallet = new THREE.Mesh(new RoundedBoxGeometry(1.6, 0.08, 1.2, 2, 0.04), std({ color: '#2a170c', roughness: 0.6 }));
  wallet.position.y = 0.04;
  g.add(wallet);
  const star = new THREE.Shape();
  for (let i = 0; i < 12; i++) {
    const r = i % 2 ? 0.22 : 0.42;
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    if (i === 0) star.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else star.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const badge = new THREE.Mesh(new THREE.ExtrudeGeometry(star, { depth: 0.05, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 }), brass());
  badge.rotation.x = -Math.PI / 2;
  badge.position.y = 0.1;
  g.add(badge);
  return shadow(g);
}

export function buildPen(): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 1.7, 16), std({ color: '#141414', roughness: 0.2, metalness: 0.3 }));
  body.rotation.z = Math.PI / 2;
  body.position.y = 0.07;
  g.add(body);
  const nib = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 16), brass());
  nib.rotation.z = -Math.PI / 2;
  nib.position.set(1.0, 0.07, 0);
  g.add(nib);
  const clip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.03), brass());
  clip.position.set(-0.5, 0.15, 0);
  g.add(clip);
  return shadow(g);
}
