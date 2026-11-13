import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { DESK_MATERIALS, LAMP_MATERIALS, NOTEBOOK_MATERIALS, PHONE_MATERIALS, TYPEWRITER_MATERIALS, lampShape, pick } from '../desk/palettes.ts';
import {
  buildBadge,
  buildCabinet,
  buildCalendar,
  buildCoffee,
  buildCorkBoard,
  buildFolder,
  buildGuideNote,
  buildLamp,
  buildMagnifier,
  buildNameplate,
  buildNotebook,
  buildPen,
  buildPhone,
  buildPhotos,
  buildTypewriter,
  ringPhone,
  type CalendarFace,
  type DeskObject,
  type DeskObjectId,
  type LampObject,
} from './objects.ts';
import { leatherTexture, wallTexture, woodRoughness, woodTexture } from './textures.ts';

/**
 * ESCENARIO 3D DEL DESPACHO.
 *
 * - Render bajo demanda: solo se dibuja cuando algo se mueve (polvo en la
 *   luz, parallax, animaciones). En reposo y sin efectos, cero consumo.
 * - Con «reducir movimiento» no hay polvo, deriva de cámara ni parallax;
 *   las aperturas se resuelven con un fundido corto.
 * - Si el iPhone tiene poca memoria o falla WebGL, la app usa la mesa 2D.
 */

export interface DeskData {
  loadout: Record<string, string>;
  investigator: string;
  nameplate: { name: string; rank: string };
  calendar: CalendarFace;
  typewriter: string[];
  notes: number;
  guide: boolean;
}

export interface StageOptions {
  reducedMotion: boolean;
  lampOn: boolean;
  lightIntensity: number;
  lightTone: 'warm' | 'neutral' | 'cold';
}

const TONE: Record<StageOptions['lightTone'], string> = { warm: '#ffc98a', neutral: '#ffe6c4', cold: '#dfe8ff' };
const CAMERA_HOME = new THREE.Vector3(0, 12.8, 14.2);
const LOOK_HOME = new THREE.Vector3(0, 1.0, -1.2);

const LAYOUT: Record<Exclude<DeskObjectId, 'chain'>, { p: [number, number, number]; r: number }> = {
  typewriter: { p: [-5.6, 0, -2.3], r: 0.18 },
  phone: { p: [2.1, 0, -2.9], r: -0.22 },
  lamp: { p: [6.0, 0, -2.6], r: -0.35 },
  folder: { p: [-0.9, 0, 0.6], r: 0.1 },
  calendar: { p: [-6.4, 0, 1.7], r: 0.45 },
  notebook: { p: [4.1, 0, 1.6], r: -0.22 },
  cabinet: { p: [9.6, -3.9, -5.1], r: -0.25 },
  board: { p: [-1.2, 3.3, -6.15], r: 0 },
  nameplate: { p: [-0.6, 0, 3.55], r: 0 },
  guide: { p: [-3.7, 0, 3.0], r: 0 },
};

export class DeskStage {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(30, 2, 0.1, 100);
  private objects = new Map<DeskObjectId, DeskObject>();
  private lamp!: LampObject;
  private spot!: THREE.SpotLight;
  private glow!: THREE.PointLight;
  private ambient!: THREE.HemisphereLight;
  private moon!: THREE.DirectionalLight;
  private dust!: THREE.Points;
  private dustSpeeds: Float32Array = new Float32Array(0);
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private frame = 0;
  private running = false;
  private last = 0;
  private opts: StageOptions;
  private parallax = new THREE.Vector2();
  private parallaxTarget = new THREE.Vector2();
  private anims: Array<{ start: number; dur: number; step: (t: number) => void; done?: () => void }> = [];
  private camFrom = { pos: CAMERA_HOME.clone(), look: LOOK_HOME.clone() };
  private camTo: { pos: THREE.Vector3; look: THREE.Vector3 } | null = null;
  private camT = 0;
  private highlight: { obj: DeskObject; until: number } | null = null;
  private data: DeskData;
  private decor: THREE.Object3D | null = null;

  constructor(canvas: HTMLCanvasElement, data: DeskData, opts: StageOptions) {
    this.data = data;
    this.opts = opts;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'default' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene.background = new THREE.Color('#0c0b09');
    this.scene.fog = new THREE.Fog('#0c0b09', 22, 40);
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.22;
    pmrem.dispose();
    this.build();
    this.applyOptions(opts);
    this.camera.position.copy(CAMERA_HOME);
    this.camera.lookAt(LOOK_HOME);
  }

  // ─── Construcción ──────────────────────────────────────────────────────────

  private build(): void {
    const s = this.scene;
    const d = this.data;
    const deskId = d.loadout.desk ?? 'desk-walnut';
    const deskM = pick(DESK_MATERIALS, deskId, 'desk-walnut');

    // Mesa
    const top = new THREE.Mesh(
      new RoundedBoxGeometry(20, 0.6, 11.5, 4, 0.12),
      new THREE.MeshStandardMaterial({ map: woodTexture(deskId, deskM), roughness: 0.48, roughnessMap: woodRoughness(), metalness: 0 }),
    );
    top.position.set(0, -0.3, -0.2);
    top.receiveShadow = true;
    s.add(top);
    const blotter = new THREE.Mesh(
      new RoundedBoxGeometry(10.2, 0.03, 6.0, 2, 0.012),
      new THREE.MeshStandardMaterial({ map: leatherTexture(deskM.blotter, deskM.blotterEdge, deskM.stitch), roughness: 0.78 }),
    );
    blotter.position.set(0.2, 0.0, 1.1);
    blotter.receiveShadow = true;
    s.add(blotter);

    // Pared
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(46, 18), new THREE.MeshStandardMaterial({ map: wallTexture(), roughness: 0.92 }));
    wall.position.set(0, 3.8, -6.4);
    wall.receiveShadow = true;
    s.add(wall);

    // Objetos interactivos
    const eq = d.loadout;
    const add = (o: DeskObject) => {
      const l = LAYOUT[o.id as Exclude<DeskObjectId, 'chain'>];
      o.group.position.set(...l.p);
      o.group.rotation.y = l.r;
      o.hit.userData.id = o.id;
      o.group.add(o.hit);
      o.group.userData.home = { p: o.group.position.clone(), r: o.group.rotation.clone() };
      s.add(o.group);
      this.objects.set(o.id, o);
    };
    add(buildTypewriter(pick(TYPEWRITER_MATERIALS, eq.typewriter, 'typewriter-black'), d.typewriter));
    add(buildPhone(pick(PHONE_MATERIALS, eq.phone, 'phone-bakelite')));
    const lampId = eq.lamp ?? 'lamp-banker';
    this.lamp = buildLamp(lampShape(lampId), pick(LAMP_MATERIALS, lampId, 'lamp-banker'));
    add(this.lamp);
    this.lamp.chain.userData.id = 'chain';
    this.lamp.group.add(this.lamp.chain);
    add(buildFolder(d.investigator));
    add(buildCalendar(d.calendar));
    add(buildNotebook(pick(NOTEBOOK_MATERIALS, eq.notebook, 'notebook-leather'), d.notes));
    add(buildCabinet());
    add(buildCorkBoard());
    add(buildNameplate(d.nameplate));
    if (d.guide) add(buildGuideNote());

    // Atrezo
    const pen = buildPen();
    pen.position.set(2.6, 0.03, 2.9);
    pen.rotation.y = 0.5;
    s.add(pen);
    this.setDecor(eq.decor ?? 'decor-coffee');

    // Luz: lámpara (foco con sombras), resplandor de la pantalla, luna fría y ambiente.
    const bulbWorld = this.lamp.group.localToWorld(this.lamp.bulb.clone());
    this.spot = new THREE.SpotLight('#ffc98a', 180, 0, 1.0, 0.85, 1.6);
    this.spot.position.copy(bulbWorld);
    this.spot.target.position.set(0.5, 0, 0.6);
    this.spot.castShadow = true;
    this.spot.shadow.mapSize.set(1024, 1024);
    this.spot.shadow.bias = -0.0004;
    this.spot.shadow.normalBias = 0.03;
    this.spot.shadow.radius = 6;
    this.spot.shadow.camera.near = 0.5;
    this.spot.shadow.camera.far = 30;
    s.add(this.spot, this.spot.target);
    this.glow = new THREE.PointLight('#ffb870', 6, 9, 2);
    this.glow.position.copy(bulbWorld).add(new THREE.Vector3(0, 0.4, 0));
    s.add(this.glow);
    this.moon = new THREE.DirectionalLight('#8fa3c8', 0.35);
    this.moon.position.set(-8, 12, 4);
    s.add(this.moon);
    this.ambient = new THREE.HemisphereLight('#3a3428', '#0b0806', 0.35);
    s.add(this.ambient);

    // Polvo en suspensión dentro del haz
    const N = 160;
    const pos = new Float32Array(N * 3);
    this.dustSpeeds = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = bulbWorld.x - 5 + Math.random() * 6;
      pos[i * 3 + 1] = Math.random() * 3.2;
      pos[i * 3 + 2] = bulbWorld.z - 1 + Math.random() * 4.5;
      this.dustSpeeds[i] = 0.02 + Math.random() * 0.06;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 32;
    const sc = sprite.getContext('2d')!;
    const g = sc.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,230,190,1)');
    g.addColorStop(1, 'rgba(255,230,190,0)');
    sc.fillStyle = g;
    sc.fillRect(0, 0, 32, 32);
    this.dust = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ size: 0.06, map: new THREE.CanvasTexture(sprite), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    s.add(this.dust);
  }

  setDecor(decor: string): void {
    if (this.decor) this.scene.remove(this.decor);
    let o: THREE.Object3D | null = null;
    if (decor === 'decor-coffee') {
      o = buildCoffee();
      o.position.set(-2.6, 0, -2.6);
    } else if (decor === 'decor-polaroids') {
      o = buildPhotos(300);
      o.position.set(-3.4, 0, -1.7);
    } else if (decor === 'decor-magnifier') {
      o = buildMagnifier();
      o.position.set(2.2, 0.05, 0.9);
      o.rotation.y = -0.6;
    } else if (decor === 'decor-badge') {
      o = buildBadge();
      o.position.set(-2.8, 0, -2.4);
      o.rotation.y = 0.3;
    }
    this.decor = o;
    if (o) this.scene.add(o);
    this.requestRender();
  }

  // ─── Datos y opciones ───────────────────────────────────────────────────────

  updateData(d: Partial<DeskData>): void {
    this.data = { ...this.data, ...d };
    if (d.calendar) (this.objects.get('calendar') as unknown as { setFace: (f: CalendarFace) => void }).setFace(d.calendar);
    if (d.typewriter) (this.objects.get('typewriter') as unknown as { setLines: (l: string[]) => void }).setLines(d.typewriter);
    if (d.notes !== undefined) (this.objects.get('notebook') as unknown as { setCount: (n: number) => void }).setCount(d.notes);
    if (d.nameplate) (this.objects.get('nameplate') as unknown as { setText: (t: { name: string; rank: string }) => void }).setText(d.nameplate);
    if (d.guide === false) {
      const g = this.objects.get('guide');
      if (g) {
        this.scene.remove(g.group);
        this.objects.delete('guide');
      }
    }
    this.requestRender();
  }

  applyOptions(o: StageOptions): void {
    this.opts = o;
    const on = o.lampOn;
    const k = o.lightIntensity;
    this.spot.color.set(TONE[o.lightTone]);
    this.spot.intensity = on ? 190 * k : 0;
    this.glow.intensity = on ? 7 * k : 0;
    this.lamp.bulbMat.emissiveIntensity = on ? 2.4 : 0.05;
    this.lamp.shadeMat.emissiveIntensity = on ? 0.12 : 0;
    this.moon.intensity = on ? 0.3 : 0.55;
    this.ambient.intensity = on ? 0.55 : 0.22;
    this.scene.environmentIntensity = on ? 0.22 : 0.08;
    this.dust.visible = on && !o.reducedMotion;
    this.requestRender();
  }

  /** Inclinación del dispositivo o del dedo, normalizada a [-1, 1]. */
  setParallax(x: number, y: number): void {
    if (this.opts.reducedMotion) return;
    this.parallaxTarget.set(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)));
    this.requestRender();
  }

  // ─── Interacción ────────────────────────────────────────────────────────────

  /** Objeto bajo un punto de la pantalla (coordenadas del canvas en píxeles CSS). */
  pick(x: number, y: number): DeskObjectId | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const targets: THREE.Object3D[] = [this.lamp.chain];
    for (const o of this.objects.values()) targets.push(o.hit);
    const hit = this.raycaster.intersectObjects(targets, false)[0];
    return (hit?.object.userData.id as DeskObjectId | undefined) ?? null;
  }

  /** Posición en pantalla (px CSS) de un objeto, para colocar su etiqueta. */
  screenPosition(id: DeskObjectId): { x: number; y: number } | null {
    const o = this.objects.get(id);
    if (!o) return null;
    const p = o.group.localToWorld(o.focus.clone()).project(this.camera);
    const rect = this.renderer.domElement.getBoundingClientRect();
    return { x: rect.left + ((p.x + 1) / 2) * rect.width, y: rect.top + ((1 - p.y) / 2) * rect.height };
  }

  /** Señal visual breve al tocar: el objeto se ilumina y da un pequeño respingo. */
  touch(id: DeskObjectId): void {
    const o = this.objects.get(id === 'chain' ? 'lamp' : id);
    if (!o) return;
    this.highlight = { obj: o, until: performance.now() + 380 };
    if (id === 'phone') this.animate(600, (t) => ringPhone(o, t));
    this.requestRender();
  }

  pullChain(): Promise<void> {
    return new Promise((res) => this.animate(380, (t) => this.lamp.pullChain(t), res));
  }

  /** Abre un objeto: su animación propia y la cámara que se acerca. */
  open(id: DeskObjectId, duration = 900): Promise<void> {
    const o = this.objects.get(id);
    if (!o) return Promise.resolve();
    if (this.opts.reducedMotion) {
      o.pose(1);
      this.requestRender();
      return new Promise((r) => setTimeout(r, 120));
    }
    const target = o.group.localToWorld(o.focus.clone());
    this.camFrom = { pos: this.camera.position.clone(), look: LOOK_HOME.clone() };
    this.camTo = {
      pos: this.camera.position.clone().lerp(target.clone().add(new THREE.Vector3(0, 3.2, 4.2)), 0.55),
      look: LOOK_HOME.clone().lerp(target, 0.75),
    };
    this.camT = 0;
    return new Promise((res) =>
      this.animate(
        duration,
        (t) => {
          o.pose(t);
          this.camT = t;
        },
        res,
      ),
    );
  }

  /** Devuelve todo a su sitio (al volver al despacho). */
  reset(): void {
    for (const o of this.objects.values()) o.pose(0);
    this.camTo = null;
    this.camT = 0;
    this.camera.position.copy(CAMERA_HOME);
    this.camera.lookAt(LOOK_HOME);
    this.requestRender();
  }

  private animate(dur: number, step: (t: number) => void, done?: () => void): void {
    this.anims.push({ start: performance.now(), dur, step, ...(done ? { done } : {}) });
    this.requestRender();
  }

  // ─── Bucle ──────────────────────────────────────────────────────────────────

  resize(w: number, h: number): void {
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // En pantallas menos panorámicas se abre el encuadre para que quepa la mesa.
    this.camera.fov = w / h < 1.9 ? 36 : 32;
    this.camera.updateProjectionMatrix();
    this.requestRender();
  }

  /** Activo cuando hay efectos continuos (polvo, parallax). */
  private get ambientMotion(): boolean {
    return !this.opts.reducedMotion && this.opts.lampOn;
  }

  start(): void {
    this.running = true;
    this.requestRender();
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  requestRender(): void {
    if (!this.running || this.frame) return;
    this.frame = requestAnimationFrame((t) => this.tick(t));
  }

  private tick(now: number): void {
    this.frame = 0;
    const dt = Math.min(0.05, this.last ? (now - this.last) / 1000 : 0.016);
    this.last = now;
    let busy = false;

    // Animaciones en curso
    for (const a of [...this.anims]) {
      const t = Math.min(1, (now - a.start) / a.dur);
      a.step(t);
      if (t >= 1) {
        this.anims.splice(this.anims.indexOf(a), 1);
        a.done?.();
      } else busy = true;
    }

    // Cámara: acercamiento + parallax suave + leve respiración
    this.parallax.lerp(this.parallaxTarget, 0.08);
    if (this.parallax.distanceTo(this.parallaxTarget) > 0.001) busy = true;
    const ease = this.camT < 0.5 ? 4 * this.camT ** 3 : 1 - Math.pow(-2 * this.camT + 2, 3) / 2;
    const pos = this.camTo ? this.camFrom.pos.clone().lerp(this.camTo.pos, ease) : CAMERA_HOME.clone();
    const look = this.camTo ? this.camFrom.look.clone().lerp(this.camTo.look, ease) : LOOK_HOME.clone();
    const breathe = this.ambientMotion ? Math.sin(now / 4200) * 0.06 : 0;
    pos.x += this.parallax.x * 0.7;
    pos.y += -this.parallax.y * 0.35 + breathe;
    this.camera.position.copy(pos);
    this.camera.lookAt(look);

    // Señal al tocar
    if (this.highlight) {
      const left = this.highlight.until - now;
      const k = Math.max(0, left / 380);
      const home = this.highlight.obj.group.userData.home as { p: THREE.Vector3 } | undefined;
      if (home && !this.anims.length) this.highlight.obj.group.position.y = home.p.y + Math.sin(k * Math.PI) * 0.12;
      if (left <= 0) this.highlight = null;
      else busy = true;
    }

    // Polvo
    if (this.dust.visible) {
      const p = this.dust.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) {
        let y = p.getY(i) + this.dustSpeeds[i]! * dt * (i % 2 ? 1 : -0.6);
        if (y > 3.4) y = 0;
        if (y < 0) y = 3.4;
        p.setY(i, y);
        p.setX(i, p.getX(i) + Math.sin(now / 2000 + i) * dt * 0.02);
      }
      p.needsUpdate = true;
      busy = true;
    }

    this.renderer.render(this.scene, this.camera);
    if (this.running && (busy || this.ambientMotion)) {
      // Con solo efectos ambientales basta media cadencia: ahorra batería.
      if (!busy || this.anims.length === 0) setTimeout(() => this.requestRender(), 33);
      else this.requestRender();
    }
  }

  dispose(): void {
    this.stop();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      for (const mat of mats) mat.dispose();
    });
    this.renderer.dispose();
  }
}

