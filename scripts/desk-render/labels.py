"""Texturas impresas del despacho (etiquetas, papel, corcho), con Pillow.

Uso: python3 scripts/desk-render/labels.py  → .cache/desk/*.png
"""
import os, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = os.path.join(os.path.dirname(__file__), '..', '..', '.cache', 'desk')
FONTS = os.path.join(os.path.dirname(__file__), '..', '..', 'node_modules', '@fontsource')
os.makedirs(OUT, exist_ok=True)


def font(family: str, file: str, size: int):
    return ImageFont.truetype(os.path.join(FONTS, family, 'files', file), size)


SERIF = lambda s: font('cormorant-garamond', 'cormorant-garamond-latin-600-normal.woff', s)
TYPE = lambda s: font('courier-prime', 'courier-prime-latin-400-normal.woff', s)
TYPEB = lambda s: font('courier-prime', 'courier-prime-latin-700-normal.woff', s)
SANS = lambda s: font('ibm-plex-sans-condensed', 'ibm-plex-sans-condensed-latin-600-normal.woff', s)
HAND = lambda s: font('caveat', 'caveat-latin-400-normal.woff', s)


def paper(w, h, tone=(233, 224, 200), seed=1, aged=0.6, fibers=True):
    rnd = random.Random(seed)
    img = Image.new('RGB', (w, h), tone)
    px = img.load()
    noise = Image.effect_noise((w, h), 18).convert('L')
    img = Image.blend(img, Image.merge('RGB', [noise] * 3), 0.06)
    d = ImageDraw.Draw(img, 'RGBA')
    if fibers:
        for _ in range(w * h // 900):
            x, y = rnd.random() * w, rnd.random() * h
            d.line([(x, y), (x + rnd.uniform(-10, 10), y + rnd.uniform(-10, 10))], fill=(110, 85, 50, 22))
    # bordes tostados
    edge = Image.new('L', (w, h), 0)
    ed = ImageDraw.Draw(edge)
    for i in range(40):
        ed.rectangle([i, i, w - 1 - i, h - 1 - i], outline=int(120 * aged * (1 - i / 40) ** 2))
    stain = Image.new('RGB', (w, h), (120, 85, 40))
    img = Image.composite(stain, img, edge.filter(ImageFilter.GaussianBlur(6)))
    for _ in range(int(4 * aged)):
        cx, cy, r = rnd.random() * w, rnd.random() * h, rnd.uniform(0.05, 0.2) * w
        blob = Image.new('L', (w, h), 0)
        ImageDraw.Draw(blob).ellipse([cx - r, cy - r, cx + r, cy + r], fill=int(30 * aged))
        img = Image.composite(stain, img, blob.filter(ImageFilter.GaussianBlur(r / 3)))
    return img


def stamp(img, text, center, angle, size=70, color=(130, 40, 36)):
    layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    f = SANS(size)
    tw = d.textlength(text, font=f)
    x, y = center
    d.rectangle([x - tw / 2 - 22, y - size * 0.75, x + tw / 2 + 22, y + size * 0.75], outline=color + (210,), width=8)
    d.text((x - tw / 2, y - size * 0.62), text, font=f, fill=color + (210,))
    # tinta irregular
    mask = Image.effect_noise(img.size, 80).convert('L').point(lambda v: 255 if v > 70 else 120)
    layer.putalpha(Image.composite(layer.getchannel('A'), Image.new('L', img.size, 0), mask))
    layer = layer.rotate(angle, center=center, resample=Image.BICUBIC)
    img.paste(layer, (0, 0), layer)


# Carpeta de expedientes (portada)
folder = paper(1200, 1560, (201, 169, 106), 3, 0.8)
d = ImageDraw.Draw(folder)
lab = paper(760, 420, (236, 228, 205), 4, 0.3)
ld = ImageDraw.Draw(lab)
for txt, f, y in [('ARCHIVO DE EXPEDIENTES', SANS(46), 60), ('DEADLINE', SERIF(130), 125), ('Timeless Crime Archive', HAND(54), 290)]:
    w = ld.textlength(txt, font=f)
    ld.text(((760 - w) / 2, y), txt, font=f, fill=(42, 34, 24))
folder.paste(lab.rotate(-1.2, expand=False, fillcolor=(201, 169, 106)), (220, 330))
stamp(folder, 'CONFIDENCIAL', (640, 1150), 12, 78)
folder.save(os.path.join(OUT, 'folder_cover.png'))

# Carpetas inferiores (sin texto)
for i, tone in enumerate([(190, 160, 100), (178, 150, 96)]):
    paper(1200, 1560, tone, 10 + i, 0.9).save(os.path.join(OUT, f'folder_{i}.png'))

# Hoja del calendario: cabecera roja y página en blanco (la fecha se pinta en la app)
cal = paper(900, 1100, (240, 233, 214), 21, 0.25)
d = ImageDraw.Draw(cal)
d.rectangle([0, 0, 900, 210], fill=(118, 45, 43))
cal.save(os.path.join(OUT, 'calendar_page.png'))

# Hoja de la máquina de escribir (en blanco: el texto lo pone la app)
paper(900, 1100, (236, 229, 210), 22, 0.2).save(os.path.join(OUT, 'typewriter_sheet.png'))

# Fichas del fichero
for i in range(6):
    c = paper(600, 380, (238, 231, 213) if i % 3 else (214, 186, 130), 30 + i, 0.3)
    d = ImageDraw.Draw(c)
    d.line([(0, 70), (600, 70)], fill=(150, 60, 55), width=3)
    for y in range(110, 380, 44):
        d.line([(0, y), (600, y)], fill=(120, 140, 180), width=2)
    if i == 0:
        d.text((24, 12), 'ARCHIVO PERSONAL', font=SANS(40), fill=(42, 34, 24))
    c.save(os.path.join(OUT, f'card_{i}.png'))

# Etiqueta de la libreta
nb = paper(500, 260, (234, 226, 204), 40, 0.4)
d = ImageDraw.Draw(nb)
w = d.textlength('NOTAS', font=SANS(78))
d.text(((500 - w) / 2, 70), 'NOTAS', font=SANS(78), fill=(42, 34, 24))
nb.save(os.path.join(OUT, 'notebook_label.png'))

# Corcho
rnd = random.Random(50)
cork = Image.new('RGB', (1400, 1000), (154, 107, 62))
d = ImageDraw.Draw(cork)
for _ in range(120000):
    v = rnd.random()
    col = (70, 40, 15) if v > 0.6 else (200, 150, 95) if v > 0.25 else (40, 22, 8)
    x, y = rnd.random() * 1400, rnd.random() * 1000
    d.rectangle([x, y, x + rnd.uniform(1, 4), y + rnd.uniform(1, 3)], fill=col)
cork.filter(ImageFilter.GaussianBlur(0.6)).save(os.path.join(OUT, 'cork.png'))

# Notas manuscritas para el corcho
for i, lines in enumerate([['¿22:12?', 'paraguas'], ['Coartada', 'del teatro'], ['Muelle 4']]):
    n = paper(500, 500, (243, 236, 212), 60 + i, 0.3)
    d = ImageDraw.Draw(n)
    for j, l in enumerate(lines):
        d.text((40, 90 + j * 110), l, font=HAND(110), fill=(40, 50, 95))
    n.save(os.path.join(OUT, f'note_{i}.png'))

# Papeles sueltos mecanografiados
for i, lines in enumerate([['INFORME Nº 0412', 'Agente: P.C. 4471', 'Hora: 08:41', '', 'El portal no presenta', 'señales de haber sido', 'forzado.'], ['DECLARACIÓN', '', 'Estuve en el teatro', 'toda la función.', '', 'Firmado:']]):
    pg = paper(900, 1160, (236, 229, 210), 70 + i, 0.5)
    d = ImageDraw.Draw(pg)
    for j, l in enumerate(lines):
        d.text((80, 90 + j * 66), l, font=TYPEB(46) if j == 0 else TYPE(42), fill=(40, 34, 26))
    pg.save(os.path.join(OUT, f'paper_{i}.png'))

# Placa de latón (sin texto: lo pone la app)
print('etiquetas listas en', os.path.abspath(OUT))
