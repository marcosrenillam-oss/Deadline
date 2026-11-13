/**
 * Pantallas de arranque de iOS (apple-touch-startup-image) en horizontal,
 * renderizadas con Chromium. iOS exige una imagen exacta por tamaño de
 * pantalla; sin ella muestra un fondo liso al abrir la app instalada.
 * Uso: npm run splash  (escribe en apps/web/public/splash y reescribe el bloque
 * de <link> de apps/web/index.html entre las marcas splash:start y splash:end).
 */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'apps/web/public/splash');
mkdirSync(out, { recursive: true });
const font = (f) => readFileSync(join(root, 'node_modules/@fontsource', f)).toString('base64');
const cg = font('cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2');
const plex = font('ibm-plex-sans-condensed/files/ibm-plex-sans-condensed-latin-500-normal.woff2');

/** Pantallas en puntos (vertical) y densidad. */
const DEVICES = [
  [440, 956, 3], // 16 Pro Max
  [402, 874, 3], // 16 Pro
  [430, 932, 3], // 15/16 Plus, 15 Pro Max, 14 Pro Max
  [393, 852, 3], // 15, 15 Pro, 16, 14 Pro
  [428, 926, 3], // 14 Plus, 13 Pro Max, 12 Pro Max
  [390, 844, 3], // 14, 13, 13 Pro, 12, 12 Pro
  [375, 812, 3], // 13 mini, 12 mini, 11 Pro, XS, X
  [414, 896, 3], // 11 Pro Max, XS Max
  [414, 896, 2], // 11, XR
  [414, 736, 3], // 8 Plus
  [375, 667, 2], // SE (2.ª y 3.ª gen.), 8
];

const html = (w, h, dpr) => `<!doctype html><html><head><style>
@font-face { font-family: CG; src: url(data:font/woff2;base64,${cg}) format('woff2'); font-weight: 600; }
@font-face { font-family: PX; src: url(data:font/woff2;base64,${plex}) format('woff2'); font-weight: 500; }
html,body { margin:0; width:${w}px; height:${h}px; overflow:hidden; background:#171715; }
.s { width:100%; height:100%; display:grid; place-items:center; align-content:center; gap:${h * 0.03}px;
  background: radial-gradient(ellipse 60% 75% at 26% 22%, rgba(255,196,128,0.13), transparent 70%),
              radial-gradient(ellipse 120% 100% at 50% 40%, transparent 45%, rgba(0,0,0,0.6) 100%),
              linear-gradient(180deg, #24201b, #171715 60%, #100f0d); }
.seal { width:${h * 0.24}px; aspect-ratio:1; border-radius:50%; display:grid; place-items:center; position:relative;
  background: radial-gradient(circle at 35% 30%, #9a4440, #762D2B 55%, #561f1d);
  box-shadow: inset 0 0 0 ${h * 0.004}px rgba(0,0,0,0.25), 0 ${h * 0.01}px ${h * 0.03}px rgba(0,0,0,0.6); }
.seal::before { content:''; position:absolute; inset:9%; border-radius:50%; border:${Math.max(1, h * 0.002)}px solid rgba(230,221,201,0.55); }
.mono { font-family: CG; font-weight:600; color:#E6DDC9; font-size:${h * 0.09}px; line-height:1; transform: translateY(-3%); }
.t { font-family: CG; font-weight:600; color:#E6DDC9; font-size:${h * 0.075}px; letter-spacing:0.28em; text-indent:0.28em; }
.k { font-family: PX; font-weight:500; color:#C4AD83; font-size:${h * 0.026}px; letter-spacing:0.4em; text-indent:0.4em; text-transform:uppercase; opacity:0.85; }
</style></head><body><div class="s"><div class="seal"><span class="mono">DL</span></div><div class="t">DEADLINE</div><div class="k">Timeless Crime Archive</div></div></body></html>`;

const browser = await chromium.launch();
const links = [];
for (const [pw, ph, dpr] of DEVICES) {
  // Horizontal: el ancho de la imagen es el lado largo.
  const w = ph;
  const h = pw;
  const file = `splash-${w * dpr}x${h * dpr}.jpg`;
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  await page.setContent(html(w, h, dpr));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(out, file), type: 'jpeg', quality: 82 });
  await page.close();
  links.push(
    `<link rel="apple-touch-startup-image" media="(device-width: ${pw}px) and (device-height: ${ph}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: landscape)" href="%BASE_URL%splash/${file}" />`,
  );
  console.log('✔', file);
}
await browser.close();
const indexPath = join(root, 'apps/web/index.html');
const index = readFileSync(indexPath, 'utf8');
const block = `<!-- splash:start -->\n    ${links.join('\n    ')}\n    <!-- splash:end -->`;
writeFileSync(indexPath, index.replace(/<!-- splash:start -->[\s\S]*<!-- splash:end -->/, block));
