/**
 * Genera los iconos PNG de la PWA a partir de un diseño HTML/CSS renderizado
 * con Chromium (Playwright). Uso: npm run icons
 * Diseño: sello de lacre rojo sobre tinta, monograma "DL" en marfil.
 */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'apps/web/public/icons');
mkdirSync(out, { recursive: true });

const font = readFileSync(join(root, 'node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2')).toString('base64');

/** maskable: el contenido debe caber en el 80 % central (zona segura). */
const html = (size, { maskable = false, plain = false } = {}) => `<!doctype html><html><head><style>
@font-face { font-family: CG; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 600; }
html,body { margin:0; width:${size}px; height:${size}px; background:#171715; }
.wrap { width:100%; height:100%; display:grid; place-items:center;
  background: radial-gradient(circle at 30% 25%, rgba(255,196,128,0.10), transparent 60%), #171715; }
.seal { width:${maskable ? 58 : plain ? 86 : 74}%; aspect-ratio:1; border-radius:50%; display:grid; place-items:center; position:relative;
  background: radial-gradient(circle at 35% 30%, #9a4440, #762D2B 55%, #561f1d);
  box-shadow: inset 0 0 0 ${size * 0.018}px rgba(0,0,0,0.25), inset 0 ${size * 0.02}px ${size * 0.04}px rgba(255,255,255,0.12), 0 ${size * 0.02}px ${size * 0.05}px rgba(0,0,0,0.6); }
.seal::before { content:''; position:absolute; inset:9%; border-radius:50%; border:${Math.max(1, size * 0.008)}px solid rgba(230,221,201,0.55); }
.mono { font-family: CG; font-weight:600; color:#E6DDC9; font-size:${size * (maskable ? 0.25 : plain ? 0.4 : 0.32)}px; letter-spacing:0.02em; line-height:1; transform: translateY(-3%);
  text-shadow: 0 ${size * 0.006}px 0 rgba(0,0,0,0.35); }
</style></head><body><div class="wrap"><div class="seal"><span class="mono">DL</span></div></div></body></html>`;

const targets = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'icon-maskable-512.png', size: 512, opts: { maskable: true } },
  { file: 'apple-touch-icon-180.png', size: 180 },
  { file: 'favicon-32.png', size: 32, opts: { plain: true } },
];

const browser = await chromium.launch();
for (const t of targets) {
  const page = await browser.newPage({ viewport: { width: t.size, height: t.size }, deviceScaleFactor: 1 });
  await page.setContent(html(t.size, t.opts));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(out, t.file), omitBackground: false });
  await page.close();
  console.log('✔', t.file);
}
await browser.close();
