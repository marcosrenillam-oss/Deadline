/**
 * CÓDIGOS DE INTERCAMBIO.
 *
 * Sin servidor, los dispositivos se pasan información como texto: se puede
 * enviar por Mensajes, WhatsApp, AirDrop, correo o copiar y pegar.
 *
 *   DL1.<datos>[.<firma>]
 *
 * - datos: JSON comprimido (deflate-raw) en base64url.
 * - firma: HMAC-SHA256 con la clave de la partida (opcional). Sirve para
 *   rechazar códigos de otra partida o alterados por error; no es seguridad
 *   frente a alguien que tenga la invitación, porque la clave viaja en ella.
 */

export const CODE_PREFIX = 'DL1';

function toB64Url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Blob([bytes as unknown as ArrayBuffer]).stream().pipeThrough(stream as unknown as ReadableWritablePair<Uint8Array, Uint8Array>);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

async function hmac(keyB64: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', fromB64Url(keyB64) as unknown as ArrayBuffer, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return toB64Url(new Uint8Array(sig)).slice(0, 22); // 128 bits bastan para detectar errores y mezclas
}

export function newKey(): string {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return toB64Url(b);
}

export async function encodeCode(payload: unknown, key?: string): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(payload));
  const data = toB64Url(await pipe(json, new CompressionStream('deflate-raw')));
  return key ? `${CODE_PREFIX}.${data}.${await hmac(key, data)}` : `${CODE_PREFIX}.${data}`;
}

export type DecodeResult<T> = { ok: true; value: T; signed: boolean } | { ok: false; error: string };

/**
 * Decodifica un código. Si `key` se indica, la firma es obligatoria y debe
 * coincidir. Tolera espacios, saltos de línea y texto alrededor (como el que
 * añaden algunas apps de mensajería).
 */
export async function decodeCode<T = unknown>(text: string, key?: string): Promise<DecodeResult<T>> {
  const m = /DL1\.([A-Za-z0-9_-]+)(?:\.([A-Za-z0-9_-]+))?/.exec(text.replace(/\s+/g, ''));
  if (!m) return { ok: false, error: 'No es un código de DEADLINE.' };
  const [, data, sig] = m;
  if (key) {
    if (!sig) return { ok: false, error: 'El código no está firmado para esta partida.' };
    if ((await hmac(key, data!)) !== sig) return { ok: false, error: 'El código pertenece a otra partida o está incompleto.' };
  }
  try {
    const raw = await pipe(fromB64Url(data!), new DecompressionStream('deflate-raw'));
    return { ok: true, value: JSON.parse(new TextDecoder().decode(raw)) as T, signed: !!sig };
  } catch {
    return { ok: false, error: 'El código está incompleto o dañado. Cópialo entero.' };
  }
}
