/**
 * Transformación CSS (matrix3d) que lleva un rectángulo w×h a un
 * cuadrilátero arbitrario: así un texto HTML se «pinta» en perspectiva
 * sobre la hoja del calendario o la placa de la imagen renderizada.
 * Método de Heckbert (homografía cuadrado → cuadrilátero).
 */
export type Pt = [number, number];

function squareToQuad(p: [Pt, Pt, Pt, Pt]): number[] {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = p;
  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const sx = x0 - x1 + x2 - x3;
  const sy = y0 - y1 + y2 - y3;
  const det = dx1 * dy2 - dx2 * dy1;
  const g = (sx * dy2 - dx2 * sy) / det;
  const h = (dx1 * sy - sx * dy1) / det;
  return [x1 - x0 + g * x1, x3 - x0 + h * x3, x0, y1 - y0 + g * y1, y3 - y0 + h * y3, y0, g, h, 1];
}

/** matrix3d para un elemento de w×h px cuyas esquinas (arriba-izq, arriba-der, abajo-der, abajo-izq) van a `quad` (px). */
export function quadMatrix(w: number, h: number, quad: [Pt, Pt, Pt, Pt]): string {
  const [a, b, c, d, e, f, g, hh, i] = squareToQuad(quad) as [number, number, number, number, number, number, number, number, number];
  // De píxeles del elemento a cuadrado unidad, y del cuadrado al cuadrilátero.
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, c, f, 0, i];
  return `matrix3d(${m.map((v) => +v.toFixed(8)).join(',')})`;
}
