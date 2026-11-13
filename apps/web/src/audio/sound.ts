/**
 * MOTOR DE SONIDO PROCEDIMENTAL.
 *
 * Todos los efectos y ambientes se sintetizan en el dispositivo con Web Audio:
 * no hay archivos de audio, ni descargas, ni licencias. Cada sonido se
 * construye con ruido filtrado y osciladores con envolventes cortas.
 *
 * iOS exige un gesto del usuario para iniciar el audio: `unlock()` se llama
 * en el primer toque. Con la app en segundo plano el ambiente se suspende.
 */

export type Sfx = 'paper' | 'page' | 'tear' | 'key' | 'ding' | 'switch' | 'phone' | 'tap' | 'stamp';
export type Ambience = 'rain' | 'night-city' | 'quiet';

interface Config {
  musicVolume: number;
  sfxVolume: number;
  ambienceVolume: number;
  ambience: Ambience;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private ambBus: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private ambNodes: AudioNode[] = [];
  private ambTimer: ReturnType<typeof setTimeout> | null = null;
  private config: Config = { musicVolume: 0.55, sfxVolume: 0.8, ambienceVolume: 0.5, ambience: 'rain' };
  private musicBus: GainNode | null = null;
  private musicEcho: DelayNode | null = null;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private musicNext = 0;
  private musicStep = 0;
  private playingAmbience: Ambience | null = null;

  get unlocked(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  /** Debe llamarse dentro de un gesto del usuario (pointerdown/click). */
  unlock(): void {
    if (typeof window === 'undefined' || !('AudioContext' in window || 'webkitAudioContext' in window)) return;
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.connect(this.master);
      this.ambBus = this.ctx.createGain();
      this.ambBus.connect(this.master);
      // Música: bus propio con un eco discreto (sala de club pequeña).
      this.musicBus = this.ctx.createGain();
      this.musicBus.connect(this.master);
      this.musicEcho = this.ctx.createDelay(1);
      this.musicEcho.delayTime.value = 0.42;
      const fb = this.ctx.createGain();
      fb.gain.value = 0.28;
      const echoOut = this.ctx.createGain();
      echoOut.gain.value = 0.35;
      this.musicEcho.connect(fb).connect(this.musicEcho);
      this.musicEcho.connect(echoOut).connect(this.musicBus);
      this.noise = this.makeNoise(4);
      this.applyVolumes();
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return;
        if (document.hidden) void this.ctx.suspend();
        else void this.ctx.resume();
      });
    }
    if (this.ctx.state !== 'running') void this.ctx.resume();
    this.syncAmbience();
    this.syncMusic();
  }

  configure(next: Partial<Config>): void {
    this.config = { ...this.config, ...next };
    this.applyVolumes();
    this.syncAmbience();
    this.syncMusic();
  }

  // ─── Música de investigación (generativa) ─────────────────────────────────
  // Jazz nocturno en La menor: colchón de acordes, contrabajo pulsado,
  // escobillas y notas sueltas de vibráfono. Se compone en tiempo real con
  // pequeñas variaciones aleatorias: nunca suena igual, no hay archivos.

  private syncMusic(): void {
    const on = !!this.ctx && this.config.musicVolume > 0;
    if (on && !this.musicTimer && this.ctx) {
      this.musicNext = this.ctx.currentTime + 0.3;
      this.musicTimer = setInterval(() => this.scheduleMusic(), 200);
    } else if (!on && this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private scheduleMusic(): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running' || !this.musicBus) return;
    const beat = 60 / 62;
    // Am9 · Fmaj7 · Dm9 · E7(b9): dos compases por acorde.
    const chords = [
      { root: 110, voices: [220, 261.63, 329.63, 493.88] },
      { root: 87.31, voices: [174.61, 220, 261.63, 329.63] },
      { root: 73.42, voices: [174.61, 220, 261.63, 329.63] },
      { root: 82.41, voices: [207.65, 246.94, 293.66, 349.23] },
    ];
    const scale = [440, 523.25, 587.33, 659.25, 783.99, 880];
    while (this.musicNext < ctx.currentTime + 1.2) {
      const t = this.musicNext;
      const step = this.musicStep;
      const beatInBar = step % 4;
      const chord = chords[Math.floor(step / 8) % chords.length]!;
      if (step % 8 === 0) for (const f of chord.voices) this.pad(t, f, beat * 8);
      if (beatInBar === 0 || beatInBar === 2) this.bass(t, beatInBar === 0 ? chord.root : chord.root * 1.5);
      else if (Math.random() < 0.3) this.bass(t, chord.root * (Math.random() < 0.5 ? 1.335 : 1.189));
      if (beatInBar === 1 || beatInBar === 3) this.brush(t, 0.05);
      else this.brush(t, 0.022);
      if (Math.random() < 0.22) this.vibes(t + (Math.random() < 0.5 ? 0 : beat / 2), scale[Math.floor(Math.random() * scale.length)]!);
      this.musicNext += beat;
      this.musicStep++;
    }
  }

  private pad(at: number, freq: number, dur: number): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = freq;
    o.detune.value = (Math.random() - 0.5) * 8;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.022, at + 1.6);
    g.gain.setValueAtTime(0.022, at + dur - 1.2);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur + 0.8);
    o.connect(f).connect(g).connect(this.musicBus!);
    o.start(at);
    o.stop(at + dur + 1);
  }

  private bass(at: number, freq: number): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq * 1.02, at);
    o.frequency.exponentialRampToValueAtTime(freq, at + 0.05);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.16, at + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.75);
    o.connect(g).connect(this.musicBus!);
    o.start(at);
    o.stop(at + 0.8);
  }

  private brush(at: number, gain: number): void {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 5200;
    f.Q.value = 0.6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gain, at + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
    src.connect(f).connect(g).connect(this.musicBus!);
    src.start(at, Math.random() * 3);
    src.stop(at + 0.25);
  }

  private vibes(at: number, freq: number): void {
    const ctx = this.ctx!;
    for (const [mult, amp] of [
      [1, 0.05],
      [4, 0.008],
    ] as const) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq * mult;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(amp, at + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 1.6);
      o.connect(g);
      g.connect(this.musicBus!);
      g.connect(this.musicEcho!);
      o.start(at);
      o.stop(at + 1.7);
    }
  }

  play(kind: Sfx): void {
    const ctx = this.ctx;
    if (!ctx || !this.sfxBus || this.config.sfxVolume <= 0 || ctx.state !== 'running') return;
    const t = ctx.currentTime;
    switch (kind) {
      case 'paper':
        this.noiseBurst({ at: t, dur: 0.22, type: 'bandpass', freq: 2600, q: 0.7, gain: 0.5, sweepTo: 1400 });
        this.noiseBurst({ at: t + 0.08, dur: 0.16, type: 'bandpass', freq: 3800, q: 0.9, gain: 0.25 });
        break;
      case 'page':
        this.noiseBurst({ at: t, dur: 0.3, type: 'bandpass', freq: 1800, q: 0.5, gain: 0.32, sweepTo: 3200 });
        break;
      case 'tear':
        for (let i = 0; i < 7; i++) this.noiseBurst({ at: t + i * 0.022, dur: 0.03, type: 'highpass', freq: 2500, q: 0.7, gain: 0.35 });
        break;
      case 'key':
        this.noiseBurst({ at: t, dur: 0.035, type: 'highpass', freq: 1800, q: 0.7, gain: 0.7 });
        this.tone({ at: t, freq: 140, dur: 0.06, gain: 0.35, type: 'triangle' });
        break;
      case 'ding':
        this.tone({ at: t, freq: 2093, dur: 1.1, gain: 0.16, type: 'sine' });
        this.tone({ at: t, freq: 3136, dur: 0.7, gain: 0.07, type: 'sine' });
        break;
      case 'switch':
        this.noiseBurst({ at: t, dur: 0.02, type: 'highpass', freq: 3000, q: 0.7, gain: 0.6 });
        this.tone({ at: t, freq: 900, dur: 0.03, gain: 0.15, type: 'square' });
        this.noiseBurst({ at: t + 0.05, dur: 0.015, type: 'highpass', freq: 4000, q: 0.7, gain: 0.3 });
        break;
      case 'phone':
        // Golpe de la horquilla y eco de la campana interna.
        this.noiseBurst({ at: t, dur: 0.05, type: 'lowpass', freq: 900, q: 0.7, gain: 0.6 });
        this.tone({ at: t + 0.02, freq: 1180, dur: 0.5, gain: 0.07, type: 'sine' });
        this.tone({ at: t + 0.02, freq: 1580, dur: 0.4, gain: 0.05, type: 'sine' });
        break;
      case 'stamp':
        this.tone({ at: t, freq: 90, dur: 0.12, gain: 0.6, type: 'sine' });
        this.noiseBurst({ at: t, dur: 0.06, type: 'lowpass', freq: 700, q: 0.7, gain: 0.5 });
        break;
      case 'tap':
        this.noiseBurst({ at: t, dur: 0.03, type: 'bandpass', freq: 1200, q: 1, gain: 0.3 });
        break;
    }
  }

  private applyVolumes(): void {
    if (!this.ctx || !this.sfxBus || !this.ambBus) return;
    const t = this.ctx.currentTime;
    // Curva perceptual: el oído percibe el volumen de forma logarítmica.
    this.sfxBus.gain.setTargetAtTime(this.config.sfxVolume ** 2, t, 0.05);
    this.ambBus.gain.setTargetAtTime(this.config.ambienceVolume ** 2 * 0.6, t, 0.4);
    this.musicBus?.gain.setTargetAtTime(this.config.musicVolume ** 2, t, 0.5);
  }

  private makeNoise(seconds: number): AudioBuffer {
    const ctx = this.ctx!;
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  private noiseBurst(o: { at: number; dur: number; type: BiquadFilterType; freq: number; q: number; gain: number; sweepTo?: number }): void {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = 0.9 + Math.random() * 0.2;
    const f = ctx.createBiquadFilter();
    f.type = o.type;
    f.frequency.setValueAtTime(o.freq, o.at);
    if (o.sweepTo) f.frequency.exponentialRampToValueAtTime(o.sweepTo, o.at + o.dur);
    f.Q.value = o.q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, o.at);
    g.gain.exponentialRampToValueAtTime(o.gain, o.at + Math.min(0.01, o.dur / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, o.at + o.dur);
    src.connect(f).connect(g).connect(this.sfxBus!);
    src.start(o.at, Math.random() * 3);
    src.stop(o.at + o.dur + 0.02);
  }

  private tone(o: { at: number; freq: number; dur: number; gain: number; type: OscillatorType }): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = o.type;
    osc.frequency.value = o.freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, o.at);
    g.gain.exponentialRampToValueAtTime(o.gain, o.at + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, o.at + o.dur);
    osc.connect(g).connect(this.sfxBus!);
    osc.start(o.at);
    osc.stop(o.at + o.dur + 0.02);
  }

  // ─── Ambiente ──────────────────────────────────────────────────────────────

  private syncAmbience(): void {
    if (!this.ctx || this.ctx.state === 'closed') return;
    const want = this.config.ambienceVolume > 0 ? this.config.ambience : 'quiet';
    if (want === this.playingAmbience) return;
    this.stopAmbience();
    this.playingAmbience = want;
    if (want === 'rain') this.startRain();
    else if (want === 'night-city') this.startNightCity();
  }

  private stopAmbience(): void {
    for (const n of this.ambNodes) {
      try {
        (n as AudioScheduledSourceNode).stop?.();
      } catch {
        /* ya detenido */
      }
      n.disconnect();
    }
    this.ambNodes = [];
    if (this.ambTimer) clearTimeout(this.ambTimer);
    this.ambTimer = null;
    this.playingAmbience = null;
  }

  private loopNoise(filters: Array<{ type: BiquadFilterType; freq: number; q?: number }>, gain: number): GainNode {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    let node: AudioNode = src;
    for (const f of filters) {
      const b = ctx.createBiquadFilter();
      b.type = f.type;
      b.frequency.value = f.freq;
      b.Q.value = f.q ?? 0.7;
      node.connect(b);
      node = b;
      this.ambNodes.push(b);
    }
    const g = ctx.createGain();
    g.gain.value = 0;
    g.gain.setTargetAtTime(gain, ctx.currentTime, 1.5);
    node.connect(g).connect(this.ambBus!);
    src.start();
    this.ambNodes.push(src, g);
    return g;
  }

  /** Lluvia contra la ventana: lecho de ruido filtrado + gotas sueltas. */
  private startRain(): void {
    const ctx = this.ctx!;
    const bed = this.loopNoise([{ type: 'highpass', freq: 400 }, { type: 'lowpass', freq: 5200 }], 0.22);
    this.loopNoise([{ type: 'lowpass', freq: 260 }], 0.12);
    // Ráfagas lentas de intensidad.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const depth = ctx.createGain();
    depth.gain.value = 0.06;
    lfo.connect(depth).connect(bed.gain);
    lfo.start();
    this.ambNodes.push(lfo, depth);
    const drop = () => {
      if (this.playingAmbience !== 'rain' || !this.ctx) return;
      const t = this.ctx.currentTime;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noise;
      const f = this.ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 2500 + Math.random() * 3500;
      f.Q.value = 6;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.08, t + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      src.connect(f).connect(g).connect(this.ambBus!);
      src.start(t, Math.random() * 3);
      src.stop(t + 0.07);
      this.ambTimer = setTimeout(drop, 40 + Math.random() * 260);
    };
    drop();
  }

  /** Ciudad de noche: rumor grave lejano y algún paso de coche. */
  private startNightCity(): void {
    const ctx = this.ctx!;
    this.loopNoise([{ type: 'lowpass', freq: 160 }, { type: 'lowpass', freq: 220 }], 0.5);
    this.loopNoise([{ type: 'bandpass', freq: 700, q: 0.4 }], 0.025);
    const pass = () => {
      if (this.playingAmbience !== 'night-city' || !this.ctx) return;
      const t = this.ctx.currentTime;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noise;
      src.loop = true;
      const f = this.ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.Q.value = 1.2;
      f.frequency.setValueAtTime(300, t);
      f.frequency.linearRampToValueAtTime(520, t + 2.5);
      f.frequency.linearRampToValueAtTime(260, t + 6);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.09, t + 2.5);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 6);
      src.connect(f).connect(g).connect(this.ambBus!);
      src.start(t);
      src.stop(t + 6.1);
      this.ambTimer = setTimeout(pass, 9000 + Math.random() * 16000);
    };
    this.ambTimer = setTimeout(pass, 3000);
    void ctx;
  }
}

export const sound = new SoundEngine();
