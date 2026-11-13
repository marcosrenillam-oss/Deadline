"""Convierte los renders PNG del despacho a WebP para la app.

Uso: python3 scripts/desk-render/finalize.py
"""
import glob, os
from PIL import Image, ImageEnhance, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'apps', 'web', 'public', 'desk')
# Fondo para las pantallas 2D: la misma mesa, desenfocada y en penumbra.
base = os.path.join(OUT, 'desk_on.png')
if os.path.exists(base):
    bd = Image.open(base).convert('RGB').resize((1200, 554), Image.LANCZOS).filter(ImageFilter.GaussianBlur(14))
    bd = ImageEnhance.Brightness(bd).enhance(0.42)
    bd.save(os.path.join(OUT, 'backdrop.webp'), 'WEBP', quality=72, method=6)
    print('backdrop.webp', os.path.getsize(os.path.join(OUT, 'backdrop.webp')) // 1024, 'KB')

for png in sorted(glob.glob(os.path.join(OUT, '*.png'))):
    im = Image.open(png)
    dest = png[:-4] + '.webp'
    if im.mode == 'RGBA':
        im.save(dest, 'WEBP', quality=86, method=6)
    else:
        im.convert('RGB').save(dest, 'WEBP', quality=84, method=6)
    os.remove(png)
    print(f'{os.path.basename(dest):22s} {os.path.getsize(dest) // 1024} KB')
