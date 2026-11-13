let cached: boolean | undefined;

/** ¿Puede este dispositivo dibujar WebGL? (se comprueba una sola vez). */
export function webglAvailableCached(): boolean {
  if (cached !== undefined) return cached;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') ?? c.getContext('webgl');
    cached = !!gl;
    (gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
}
