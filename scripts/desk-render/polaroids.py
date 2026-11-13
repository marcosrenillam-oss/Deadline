"""Monta las dos polaroids del adorno «Instantáneas» (marco blanco, foto generada).

Uso: python3 scripts/desk-render/polaroids.py
"""
import os
from PIL import Image, ImageDraw, ImageEnhance

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, '.cache', 'portraits', 'sd')
OUT = os.path.join(ROOT, '.cache', 'desk')
os.makedirs(OUT, exist_ok=True)
for i in (1, 2):
    src = os.path.join(SRC, f'desk-polaroid-{i}.png')
    if not os.path.exists(src):
        continue
    photo = Image.open(src).convert('RGB').resize((440, 440), Image.LANCZOS)
    photo = ImageEnhance.Color(photo).enhance(0.8)
    card = Image.new('RGB', (500, 608), (238, 234, 222))
    card.paste(photo, (30, 30))
    d = ImageDraw.Draw(card)
    d.text((40, 500), ['Bow St. · 3:10', 'n.º 14 · ¿quién?'][i - 1], fill=(40, 50, 90))
    card.save(os.path.join(OUT, f'polaroid_{i}.png'))
    print('✔ polaroid', i)
