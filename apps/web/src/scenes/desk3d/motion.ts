/**
 * PROFUNDIDAD CON EL MOVIMIENTO DEL IPHONE.
 *
 * iOS solo entrega la orientación del dispositivo si el usuario lo permite
 * en respuesta a un toque. Se pide desde Ajustes → Luz al activar la opción
 * (nunca al abrir la app). Sin permiso, la mesa funciona igual: el
 * parallax se obtiene arrastrando el dedo.
 */

type OrientationCtor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };

export function motionSupported(): boolean {
  return typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
}

/** Pide permiso (iOS 13+). Debe llamarse dentro de un toque del usuario. */
export async function requestMotionPermission(): Promise<boolean> {
  if (!motionSupported()) return false;
  const ctor = DeviceOrientationEvent as OrientationCtor;
  if (typeof ctor.requestPermission !== 'function') return true;
  try {
    return (await ctor.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}

/** Empieza a escuchar la inclinación; devuelve la función para parar. Valores en [-1, 1]. */
export function startMotion(cb: (x: number, y: number) => void): () => void {
  if (!motionSupported()) return () => undefined;
  let base: { a: number; b: number } | null = null;
  const onOrient = (e: DeviceOrientationEvent) => {
    if (e.beta === null || e.gamma === null) return;
    // En horizontal, los ejes del dispositivo se intercambian.
    const angle = (screen.orientation?.angle ?? 90) % 360;
    const [a, b] = angle === 90 ? [e.beta, -e.gamma] : angle === 270 ? [-e.beta, e.gamma] : [e.gamma, e.beta];
    base ??= { a, b };
    // La referencia se adapta despacio a la postura del jugador.
    base = { a: base.a * 0.995 + a * 0.005, b: base.b * 0.995 + b * 0.005 };
    cb((a - base.a) / 12, (b - base.b) / 12);
  };
  window.addEventListener('deviceorientation', onOrient);
  return () => window.removeEventListener('deviceorientation', onOrient);
}
