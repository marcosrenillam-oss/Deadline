"""Convierte las variantes renderizadas (.cache/desk-var) a WebP para la app.

Uso: python3 scripts/desk-render/finalize_variants.py

- Mesas completas: WebP con pérdida.
- Recuadros de objetos (patch_*): se les funde el borde (10 px) para que
  encajen sin costura sobre la imagen base, aunque el grano del render difiera.
- Adornos y recortes (decor_*, lift_*): WebP con transparencia.
Escribe apps/web/public/desk/var/ y su variants.json.
"""
import glob, json, os, shutil
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, '.cache', 'desk-var')
OUT = os.path.join(ROOT, 'apps', 'web', 'public', 'desk', 'var')
os.makedirs(OUT, exist_ok=True)
FEATHER = 10


def feathered(im):
    rgb = im.convert('RGB')
    w, h = rgb.size
    x = np.minimum(np.arange(w), np.arange(w)[::-1]) / FEATHER
    y = np.minimum(np.arange(h), np.arange(h)[::-1]) / FEATHER
    a = np.clip(np.minimum(y[:, None], x[None, :]), 0, 1)
    a = a * a * (3 - 2 * a)
    out = rgb.copy()
    out.putalpha(Image.fromarray((a * 255).astype(np.uint8)))
    return out


total = 0
for png in sorted(glob.glob(os.path.join(SRC, '*.png'))):
    name = os.path.basename(png)[:-4]
    im = Image.open(png)
    dest = os.path.join(OUT, name + '.webp')
    if name.startswith('desk_'):
        im.convert('RGB').save(dest, 'WEBP', quality=80, method=6)
    elif name.startswith('patch_'):
        feathered(im).save(dest, 'WEBP', quality=86, method=6)
    else:
        im.save(dest, 'WEBP', quality=86, method=6)
    total += os.path.getsize(dest)
    print(f'{name + ".webp":42s} {os.path.getsize(dest) // 1024:4d} KB')
shutil.copy(os.path.join(SRC, 'variants.json'), os.path.join(OUT, 'variants.json'))
# La app solo pide las variantes si desk.json dice que existen (sin peticiones fallidas).
dj = os.path.join(OUT, '..', 'desk.json')
meta = json.load(open(dj))
meta['variants'] = True
json.dump(meta, open(dj, 'w'), indent=1)
print(f'Total {total // 1024} KB')
