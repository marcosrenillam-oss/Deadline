/**
 * Avisos de progresión (logros, ascensos, piezas nuevas). Se emiten desde
 * cualquier punto (cierre de un caso, partida en pareja, arranque) y los
 * muestra una sola capa en la raíz de la app, sea cual sea la pantalla.
 */
export interface Announcement {
  kind: 'achievement' | 'rank' | 'cosmetic';
  title: string;
  detail: string;
}

const EVENT = 'deadline:announce';

export function announce(a: Announcement): void {
  window.dispatchEvent(new CustomEvent<Announcement>(EVENT, { detail: a }));
}

export function onAnnounce(fn: (a: Announcement) => void): () => void {
  const h = (e: Event) => fn((e as CustomEvent<Announcement>).detail);
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}
