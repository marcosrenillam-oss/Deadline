/**
 * SALA EN TIEMPO REAL para jugar en pareja (servidor DEADLINE, D-083).
 *
 * Transporta los mismos códigos firmados del modo sin servidor (invitación,
 * aceptación, informes, propuesta, respuesta): la sala no los lee, solo los
 * reparte. Si se corta la conexión, reintenta; al volver recibe lo que se
 * perdió (cursor guardado en el dispositivo). Sin red, siempre queda pegar
 * los códigos a mano.
 */
import { SERVER_URL } from '../platform/server.ts';

export type RoomStatus = 'connecting' | 'online' | 'offline';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function newRoomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join('');
}
export const normalizeRoomCode = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);

const cursorKey = (room: string, client: string) => `deadline:room:${room}:${client}`;

export class RoomLink {
  private ws: WebSocket | null = null;
  private closed = false;
  private retry = 0;
  private queue: string[] = [];
  status: RoomStatus = 'connecting';

  constructor(
    readonly room: string,
    private readonly client: string,
    private readonly onCode: (code: string) => void,
    private readonly onStatus: (s: RoomStatus, peers?: number) => void = () => undefined,
  ) {
    this.open();
  }

  private get after(): number {
    try {
      return Number(localStorage.getItem(cursorKey(this.room, this.client)) ?? '0') || 0;
    } catch {
      return 0;
    }
  }
  private set after(v: number) {
    try {
      localStorage.setItem(cursorKey(this.room, this.client), String(v));
    } catch {
      /* sin almacenamiento: se reciben de nuevo y se descartan como repetidos */
    }
  }

  private setStatus(s: RoomStatus, peers?: number) {
    this.status = s;
    this.onStatus(s, peers);
  }

  private open() {
    if (this.closed) return;
    this.setStatus('connecting');
    const url = `${SERVER_URL.replace(/^http/, 'ws')}/v1/room/${this.room}?client=${encodeURIComponent(this.client)}&after=${this.after}`;
    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      return this.later();
    }
    this.ws = ws;
    ws.onopen = () => {
      this.retry = 0;
      this.setStatus('online');
      for (const code of this.queue.splice(0)) ws.send(JSON.stringify({ kind: 'code', code }));
    };
    ws.onmessage = (e) => {
      let m: { id?: number; kind?: string; code?: string; peers?: number; from?: string };
      try {
        m = JSON.parse(String(e.data));
      } catch {
        return;
      }
      if (m.kind === 'hello' && m.from === 'room') this.setStatus('online', m.peers);
      if (m.kind === 'hello' && m.from !== 'room') this.setStatus('online', 2);
      if (m.kind === 'code' && m.code) {
        if (m.id && m.id > this.after) this.after = m.id;
        this.onCode(m.code);
      }
    };
    ws.onclose = () => {
      this.ws = null;
      this.later();
    };
    ws.onerror = () => ws.close();
  }

  private later() {
    if (this.closed) return;
    this.setStatus('offline');
    const wait = Math.min(15000, 1000 * 2 ** this.retry++);
    setTimeout(() => this.open(), wait);
  }

  /** Envía un código al compañero; si no hay conexión, sale en cuanto vuelva. */
  send(code: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify({ kind: 'code', code }));
    else this.queue.push(code);
  }

  close() {
    this.closed = true;
    this.ws?.close();
  }
}
