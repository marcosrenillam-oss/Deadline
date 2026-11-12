/**
 * HÁPTICOS.
 *
 * - Android/Chromium: Vibration API.
 * - iOS: Safari NO implementa navigator.vibrate. Desde iOS 18, alternar un
 *   `<input type="checkbox" switch>` mediante su <label> produce el "tic"
 *   háptico del sistema. Se usa como mejora progresiva. Requiere un gesto del
 *   usuario y no permite elegir intensidad.  [verificar en iPhone físico]
 * - Resto: no hace nada (la experiencia no depende de ello).
 */

let enabled = true;
let label: HTMLLabelElement | null = null;

export function setHapticsEnabled(v: boolean): void {
  enabled = v;
}

function iosSwitch(): HTMLLabelElement {
  if (label) return label;
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.setAttribute('switch', '');
  input.id = 'deadline-haptic-switch';
  input.tabIndex = -1;
  input.setAttribute('aria-hidden', 'true');
  label = document.createElement('label');
  label.htmlFor = input.id;
  label.setAttribute('aria-hidden', 'true');
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;left:-10px;top:-10px';
  box.append(input, label);
  document.body.append(box);
  return label;
}

export type HapticKind = 'light' | 'confirm';

export function haptic(kind: HapticKind = 'light'): void {
  if (!enabled || typeof navigator === 'undefined') return;
  if (typeof navigator.vibrate === 'function') {
    navigator.vibrate(kind === 'light' ? 8 : [10, 40, 14]);
    return;
  }
  try {
    const l = iosSwitch();
    l.click();
    if (kind === 'confirm') setTimeout(() => l.click(), 90);
  } catch {
    /* sin soporte: silencio */
  }
}

/** Indica si el dispositivo tiene algún mecanismo háptico conocido. */
export function hapticsSupport(): 'vibration' | 'ios-switch' | 'none' {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') return 'vibration';
  if (/iPhone|iPad/.test(navigator.userAgent)) return 'ios-switch';
  return 'none';
}
