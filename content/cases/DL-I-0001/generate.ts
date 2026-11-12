/**
 * Genera los recursos gráficos de DL-I-0001: hoja de contactos y croquis.
 * Se ejecuta desde scripts/build-content.ts. Salida: SVG autocontenido
 * (sin tipografías externas: un SVG dentro de <img> no puede cargarlas).
 */
import { FRAMES, SHEET, frameRect, type Figure, type FrameSpec } from './contactSheet.ts';

const MONO = "'Courier New', Courier, monospace";
const SERIF = "Georgia, 'Times New Roman', serif";

function person(x: number, y: number, opts: { seated?: boolean; tone?: string; hair?: boolean; coat?: boolean; arm?: 'up' | 'out' } = {}): string {
  const tone = opts.tone ?? '#1b1b1b';
  if (opts.seated) {
    return `<g fill="${tone}"><circle cx="${x}" cy="${y - 22}" r="6"/><path d="M${x - 8} ${y - 14} q8 -4 16 0 l2 16 h-20 z"/>${
      opts.arm === 'up' ? `<path d="M${x + 6} ${y - 12} l6 -8 l3 2 l-6 9 z"/><rect x="${x + 10}" y="${y - 24}" width="4" height="6" rx="1"/>` : ''
    }</g>`;
  }
  const body = opts.coat ? `<path d="M${x - 8} ${y - 30} q8 -5 16 0 l4 32 h-24 z"/>` : `<path d="M${x - 7} ${y - 30} q7 -4 14 0 l2 22 h-18 z"/><rect x="${x - 6}" y="${y - 9}" width="5" height="11"/><rect x="${x + 1}" y="${y - 9}" width="5" height="11"/>`;
  const hair = opts.hair ? `<path d="M${x - 7} ${y - 38} q7 -10 14 0 l1 9 q-8 -5 -16 0 z" fill="#3a3a3a"/>` : '';
  const arm = opts.arm === 'out' ? `<path d="M${x - 6} ${y - 27} l-12 6 l1 3 l12 -5 z"/>` : '';
  return `<g fill="${tone}"><circle cx="${x}" cy="${y - 36}" r="6"/>${hair}${body}${arm}</g>`;
}

function figure(f: Figure): string {
  switch (f) {
    case 'desmond-desk':
      return person(98, 92, { seated: true });
    case 'desmond-drink':
      return person(98, 92, { seated: true, arm: 'up' });
    case 'desmond-kitchen':
      return person(48, 104, { arm: 'out' });
    case 'desmond-pour':
      return `${person(48, 104, { arm: 'out' })}<path d="M30 74 q-2 6 0 10" stroke="#e8e2d2" stroke-width="1" fill="none"/>`;
    case 'nora-counter':
      return person(60, 104, { hair: true, tone: '#2a2a2a' });
    case 'nora-shelf':
      return `${person(30, 104, { hair: true, tone: '#2a2a2a', coat: true })}<rect x="34" y="64" width="12" height="9" fill="#6a6a6a"/>`;
    case 'nora-coat':
      return person(112, 100, { hair: true, tone: '#2a2a2a', coat: true });
    case 'hooded':
      // Figura encapuchada, de espaldas, con paraguas cerrado de mango en forma de pato.
      return `<g fill="#101010"><path d="M44 58 q6 -10 12 0 l2 10 h-16 z"/><path d="M40 68 q10 -4 20 0 l6 40 h-32 z"/></g>
        <g stroke="#101010" stroke-width="2" fill="none"><path d="M66 108 L70 76"/></g>
        <g fill="#101010"><ellipse cx="71" cy="73" rx="4" ry="3"/><path d="M74 72 l4 1 l-4 2 z"/></g>`;
    case 'portal-shadow':
      return `<g fill="#3c3c3c" opacity="0.85"><circle cx="105" cy="34" r="4"/><rect x="99" y="28" width="12" height="2"/><path d="M100 38 h10 l2 18 h-14 z"/></g>`;
  }
}

function frame(f: FrameSpec): string {
  const r = frameRect(f.index);
  const bulb = f.redLight ? '#c43a2f' : '#5a5a5a';
  const glow = f.redLight ? `<circle cx="150" cy="22" r="10" fill="#c43a2f" opacity="0.25"/>` : '';
  const dark = f.redLight || f.index >= 25 ? 0.12 : 0;
  return `<g transform="translate(${r.x} ${r.y})">
    <clipPath id="c${f.index}"><rect width="180" height="120"/></clipPath>
    <g clip-path="url(#c${f.index})">
      <rect width="180" height="120" fill="#bdb8ad"/>
      <rect y="86" width="180" height="34" fill="#8f8a80"/>
      <!-- estantería -->
      <rect x="8" y="14" width="40" height="34" fill="#9d978b"/><rect x="8" y="30" width="40" height="2" fill="#5f5a52"/>
      <rect x="12" y="20" width="6" height="10" fill="#6d675d"/><rect x="20" y="18" width="5" height="12" fill="#7a746a"/><rect x="28" y="34" width="14" height="10" fill="#6d675d"/>
      <!-- cocina: encimera, tetera y termo -->
      <rect x="6" y="70" width="52" height="16" fill="#77726a"/><rect x="12" y="62" width="10" height="8" rx="2" fill="#4c4944"/>
      <rect x="28" y="56" width="5" height="14" rx="1.5" fill="#d8d4ca" stroke="#3f3c38" stroke-width="0.8"/>
      <!-- portal con cristal esmerilado -->
      <rect x="92" y="18" width="28" height="52" fill="#6d685f"/><rect x="96" y="22" width="20" height="34" fill="#dcd8cf"/>
      <!-- mesa de trabajo y teléfono -->
      <rect x="70" y="82" width="56" height="6" fill="#4e4a44"/><rect x="74" y="88" width="3" height="18" fill="#4e4a44"/><rect x="119" y="88" width="3" height="18" fill="#4e4a44"/>
      <rect x="112" y="76" width="9" height="6" rx="1.5" fill="#1f1f1f"/>
      <!-- puerta del cuarto oscuro y lámpara de aviso -->
      ${glow}<circle cx="150" cy="22" r="4" fill="${bulb}"/>
      <rect x="136" y="30" width="30" height="76" fill="#55514a"/><circle cx="160" cy="70" r="1.6" fill="#b9b3a6"/>
      ${f.figures.map(figure).join('')}
      <rect width="180" height="120" fill="#000" opacity="${dark}"/>
      <!-- respaldo de datos: fecha y hora impresas -->
      <text x="174" y="114" text-anchor="end" font-family="${MONO}" font-size="9" font-weight="700" fill="#ff8a2a" opacity="0.92">87 11 13  ${f.time}</text>
    </g>
  </g>`;
}

export function contactSheetSvg(): string {
  const strips: string[] = [];
  for (let row = 0; row < 6; row++) {
    const y = 52 + row * 152 - 14;
    strips.push(`<rect x="28" y="${y}" width="1150" height="150" fill="#121110"/>`);
    for (let k = 0; k < 46; k++) {
      strips.push(`<rect x="${36 + k * 25}" y="${y + 3}" width="12" height="7" rx="1.5" fill="#efe9dc" opacity="0.9"/>`);
      strips.push(`<rect x="${36 + k * 25}" y="${y + 142}" width="12" height="7" rx="1.5" fill="#efe9dc" opacity="0.9"/>`);
    }
    for (let c = 0; c < 6; c++) {
      const n = row * 6 + c + 1;
      strips.push(`<text x="${42 + c * 190 + 4}" y="${y + 141}" font-family="${MONO}" font-size="6.5" fill="#e8b74a">${n} ▸ KODAK TRI-X 400</text>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SHEET.width} ${SHEET.height}" width="${SHEET.width}" height="${SHEET.height}">
  <rect width="${SHEET.width}" height="${SHEET.height}" fill="#ece6d6"/>
  <text x="34" y="26" font-family="${MONO}" font-size="14" fill="#2a241a">LAB. FOTOGRÁFICO M.P. — CARRETE Nº 1 · NIKON F3 (A. ASHCROFT) · REVELADO 14-XI-87</text>
  ${strips.join('\n')}
  ${FRAMES.map(frame).join('\n')}
  <text x="34" y="${SHEET.height - 12}" font-family="${MONO}" font-size="12" fill="#5a4d37">Copia de contacto · Prueba nº 1 · Ref. WEC/87/11/0412-F</text>
</svg>`;
}

export function croquisSvg(): string {
  const ink = '#2b3b63';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
  <rect width="1000" height="700" fill="#efe9da"/>
  <g stroke="#c9bfa9" stroke-width="1">${Array.from({ length: 34 }, (_, i) => `<line x1="0" y1="${i * 21}" x2="1000" y2="${i * 21}"/>`).join('')}</g>
  <text x="40" y="48" font-family="${MONO}" font-size="20" font-weight="700" fill="#2a241a">CROQUIS — 41 GREEK STREET, 1ª PLANTA</text>
  <text x="40" y="72" font-family="${MONO}" font-size="14" fill="#5a4d37">P.C. 4471 G. Rhodes · 14-XI-87 · Sin escala</text>
  <g fill="none" stroke="${ink}" stroke-width="5">
    <rect x="80" y="110" width="840" height="520"/>
    <line x1="640" y1="110" x2="640" y2="330"/><line x1="640" y1="390" x2="640" y2="630"/>
  </g>
  <g fill="none" stroke="${ink}" stroke-width="3">
    <!-- escalera / portal (al fondo, frente a la cámara) -->
    <rect x="380" y="110" width="120" height="70"/>
    ${Array.from({ length: 6 }, (_, i) => `<line x1="380" y1="${118 + i * 10}" x2="500" y2="${118 + i * 10}"/>`).join('')}
    <!-- cocina -->
    <rect x="96" y="126" width="200" height="60"/>
    <circle cx="140" cy="156" r="14"/><rect x="200" y="140" width="16" height="32"/>
    <!-- estantería -->
    <rect x="96" y="210" width="34" height="200"/>
    <!-- mesa de trabajo -->
    <rect x="330" y="300" width="200" height="90"/>
    <!-- puerta del cuarto oscuro -->
    <path d="M640 330 a60 60 0 0 1 -60 60" stroke-dasharray="6 6"/>
    <!-- mesa de ampliación -->
    <rect x="720" y="160" width="160" height="80"/>
    <rect x="680" y="420" width="225" height="60"/>
  </g>
  <!-- cámara y su encuadre -->
  <g stroke="${ink}" stroke-width="2.5" fill="none">
    <path d="M470 580 L150 190 M470 580 L640 330" stroke-dasharray="10 8"/>
    <rect x="455" y="580" width="30" height="22" fill="${ink}"/>
  </g>
  <g font-family="${SERIF}" font-style="italic" font-size="22" fill="${ink}">
    <text x="104" y="210" font-size="18">cocina (tetera, termo)</text>
    <text x="150" y="360" transform="rotate(-90 150 360)" font-size="18">archivo</text>
    <text x="340" y="345">mesa de trabajo</text>
    <text x="350" y="372" font-size="17">(teléfono)</text>
    <text x="660" y="140">CUARTO OSCURO</text>
    <text x="722" y="208" font-size="17">ampliadora</text>
    <text x="690" y="456" font-size="16">cubetas · armario de químicos</text>
    <text x="560" y="300" font-size="17">lámpara roja ▲</text>
    <text x="386" y="205" font-size="17">portal (cristal esmerilado)</text>
    <text x="495" y="600" font-size="17">cámara en trípode</text>
    <text x="700" y="610" font-size="17">cuerpo</text>
  </g>
  <g stroke="#7a1e1c" stroke-width="3" fill="none"><line x1="760" y1="545" x2="790" y2="575"/><line x1="790" y1="545" x2="760" y2="575"/></g>
</svg>`;
}

export function generateAssets(): Record<string, string> {
  return { 'contactos.svg': contactSheetSvg(), 'croquis.svg': croquisSvg() };
}
