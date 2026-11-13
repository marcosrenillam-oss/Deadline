"""ACABADO DE ÉPOCA para los retratos renderizados.

Uso: python3 scripts/portraits/finish.py [--only=id,id]

Lee .cache/portraits/sd/<id>.png (generado por sd.py) y escribe el retrato final en el
directorio del caso (content/cases/<caso>/portraits/<id>.webp) con el
tratamiento de su época:

  albumen    Viena 1888: copia a la albúmina sobre cartón de estudio.
  press      Londres 1987: copia en gelatina de plata, grano de Tri-X.
  scan       Nueva Atenas 2096: imagen de registro digital.
  encaustic  Roma 64 d. C.: retrato a la encáustica sobre tabla (estilo El Fayum).
  oil        Sevilla 1588: óleo sobre lienzo con barniz envejecido.

Todo es procedimiento propio con Pillow y numpy: sin servicios externos.
"""
import json, os, sys, zlib
import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageFont, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
RAW = os.path.join(ROOT, '.cache', 'portraits', 'sd')
ARGS = dict(a.lstrip('-').split('=', 1) if '=' in a else (a.lstrip('-'), True) for a in sys.argv[1:])
OUT_W, OUT_H = 480, 600


def f32(im):
    return np.asarray(im, dtype=np.float32) / 255.0


def img(a):
    return Image.fromarray(np.clip(a * 255 + 0.5, 0, 255).astype(np.uint8))


def lum(a):
    return a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722


def grain(shape, rng, size=1.0, amount=0.05):
    h, w = shape[:2]
    n = rng.standard_normal((int(h / size) + 1, int(w / size) + 1)).astype(np.float32)
    g = Image.fromarray(((n * 0.25 + 0.5).clip(0, 1) * 255).astype(np.uint8)).resize((w, h), Image.BILINEAR)
    return (f32(g) - 0.5) * 2 * amount


def vignette(h, w, strength=0.5, oval=False, power=2.2):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    nx = (x / w - 0.5) * 2
    ny = (y / h - 0.5) * 2
    r = np.sqrt(nx ** 2 + (ny * (0.85 if oval else 1.0)) ** 2)
    return 1 - strength * np.clip(r, 0, 1.6) ** power


def cover(im, w, h, focus=0.42):
    s = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = (im.width - w) // 2
    y = int((im.height - h) * focus)
    return im.crop((x, y, x + w, y + h))


def font(size, bold=False):
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',
              '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'):
        if os.path.exists(f):
            return ImageFont.truetype(f, size)
    return ImageFont.load_default()


def bw(im, rng):
    """Blanco y negro de archivo (petición del usuario: todos los retratos, como fotos antiguas)."""
    L = lum(f32(im.convert('RGB')))
    L = np.clip(0.5 + (L - 0.5) * 1.05, 0, 1)
    return np.repeat(L[..., None], 3, axis=2)


# ─── Estilos ─────────────────────────────────────────────────────────────────
# La imagen generada ya trae la época (película, albúmina, encáustica, óleo):
# aquí solo se unifica el soporte físico del archivo, con mano ligera.

def albumen(im, rng, meta):
    a = f32(im.convert('RGB'))
    L = lum(a)
    L = np.clip(L * 0.9 + 0.06, 0, 1)
    L *= vignette(*L.shape, 0.35, oval=True)
    L += grain(L.shape, rng, 1.3, 0.02)
    sh = np.array([0.2, 0.11, 0.08])
    hi = np.array([0.97, 0.9, 0.74])
    c = sh + (hi - sh) * np.clip(L, 0, 1)[..., None]
    photo = img(c)
    pw, ph = photo.size
    m = 22
    card = Image.new('RGB', (pw + 2 * m, ph + 2 * m + 40), (214, 200, 168))
    ca = f32(card)
    ca += grain(ca.shape, rng, 3, 0.025)[..., None]
    ca *= vignette(*ca.shape[:2], 0.22)[..., None]
    card = img(ca)
    d = ImageDraw.Draw(card)
    d.rectangle((m - 5, m - 5, m + pw + 4, m + ph + 4), outline=(160, 128, 64), width=2)
    card.paste(photo, (m, m))
    studio = meta.get('studio', 'Atelier · Wien')
    f = font(16)
    tw = d.textlength(studio, font=f)
    d.text(((card.width - tw) / 2, m + ph + 12), studio, fill=(110, 82, 40), font=f)
    return card


def press(im, rng, meta):
    a = f32(im.convert('RGB'))
    L = lum(a)
    L = np.clip(0.5 + (L - 0.5) * 1.06, 0, 1)
    L += grain(L.shape, rng, 1.4, 0.035)
    L = np.clip(L, 0.02, 0.97)
    photo = img(np.stack([L * 0.99, L, L * 0.975], -1))
    m = 16
    sheet = Image.new('RGB', (photo.width + 2 * m, photo.height + 2 * m), (238, 236, 230))
    sheet.paste(photo, (m, m))
    return sheet


def scan(im, rng, meta):
    a = bw(im, rng)
    rows = (np.arange(a.shape[0]) % 3 == 0).astype(np.float32)[:, None, None] * 0.025
    a = a * (1 - rows)
    out = img(a)
    d = ImageDraw.Draw(out, 'RGBA')
    w, h = out.size
    for (x0, y0, sx, sy) in ((12, 12, 1, 1), (w - 13, 12, -1, 1), (12, h - 13, 1, -1), (w - 13, h - 13, -1, -1)):
        d.line((x0, y0, x0 + 26 * sx, y0), fill=(120, 230, 255, 200), width=2)
        d.line((x0, y0, x0, y0 + 26 * sy), fill=(120, 230, 255, 200), width=2)
    f = font(13)
    d.rectangle((0, h - 28, w, h), fill=(8, 20, 28, 170))
    d.text((14, h - 22), meta.get('code', 'REGISTRO'), fill=(150, 235, 255, 230), font=f)
    return out


def painted(im, rng, meta, warm=(1.03, 0.99, 0.9), vig=0.3):
    a = bw(im, rng) * np.array(warm)
    h, w = a.shape[:2]
    a *= vignette(h, w, vig, power=2.0)[..., None]
    a += grain((h, w), rng, 1.6, 0.012)[..., None]
    return img(a)


def encaustic(im, rng, meta):
    return painted(im, rng, meta, (1.04, 0.99, 0.88), 0.25)


def oil(im, rng, meta):
    return painted(im, rng, meta, (1.03, 0.98, 0.86), 0.35)


STYLES = {'albumen': albumen, 'press': press, 'scan': scan, 'encaustic': encaustic, 'oil': oil}


def main():
    cast = json.load(open(os.path.join(ROOT, 'scripts', 'portraits', 'cast.json')))
    only = ARGS.get('only')
    for p in cast['people']:
        if only and p['id'] not in str(only).split(','):
            continue
        src = os.path.join(RAW, f"{p['id']}.png")
        if not os.path.exists(src):
            print('· falta', src)
            continue
        rng = np.random.default_rng(zlib.crc32(p['id'].encode()))
        style = cast['cases'][p['case']]['style']
        im = cover(Image.open(src), OUT_W, OUT_H)
        out = STYLES[style](im, rng, {**cast['cases'][p['case']], **p})
        out = out.convert('RGB')
        out.thumbnail((OUT_W, OUT_H + 120), Image.LANCZOS)
        dest_dir = os.path.join(ROOT, 'content', 'cases', p['case'], 'portraits')
        os.makedirs(dest_dir, exist_ok=True)
        dest = os.path.join(dest_dir, f"{p['id']}.webp")
        out.save(dest, 'WEBP', quality=80, method=6)
        print('✔', dest, out.size, os.path.getsize(dest) // 1024, 'KB')


def print_border(im, color, m=14, tilt_rng=None):
    sheet = Image.new('RGB', (im.width + 2 * m, im.height + 2 * m), color)
    sheet.paste(im, (m, m))
    return sheet


def finish_images():
    """Fotografías de pruebas: copia del archivo con el soporte de cada época."""
    only = ARGS.get('only')
    for it in CAST_IMAGES():
        if only and it['id'] not in str(only).split(','):
            continue
        src = os.path.join(RAW, f"{it['id']}.png")
        if not os.path.exists(src):
            continue
        rng = np.random.default_rng(zlib.crc32(it['id'].encode()))
        style = CASES()[it['case']]['style']
        im = Image.open(src).convert('RGB')
        im = im.resize((im.width * 3 // 2, im.height * 3 // 2), Image.LANCZOS)
        a = f32(im)
        if style == 'press':
            L = lum(a)
            L = np.clip(0.5 + (L - 0.5) * 1.05, 0, 1) + grain(L.shape, rng, 1.5, 0.03)
            out = print_border(img(np.stack([L, L, L * 0.985], -1)), (236, 234, 228))
        elif style == 'albumen':
            L = lum(a) * vignette(*a.shape[:2], 0.3)
            c = np.array([0.2, 0.11, 0.08]) + (np.array([0.97, 0.9, 0.74]) - np.array([0.2, 0.11, 0.08])) * np.clip(L, 0, 1)[..., None]
            out = print_border(img(c), (222, 210, 182))
        elif style == 'scan':
            out = img(a)
            d = ImageDraw.Draw(out, 'RGBA')
            label = it.get('overlay')
            if label:
                d.rectangle((0, out.height - 30, out.width, out.height), fill=(0, 0, 0, 150))
                d.text((12, out.height - 24), label, fill=(170, 255, 190, 230), font=font(14))
        else:
            out = print_border(img(a * vignette(*a.shape[:2], 0.2)[..., None]), (240, 236, 226), m=10)
        dest_dir = os.path.join(ROOT, 'content', 'cases', it['case'], 'img')
        os.makedirs(dest_dir, exist_ok=True)
        dest = os.path.join(dest_dir, f"{it['id']}.webp")
        out.save(dest, 'WEBP', quality=78, method=6)
        print('✔', dest, out.size, os.path.getsize(dest) // 1024, 'KB')


def _cast():
    return json.load(open(os.path.join(ROOT, 'scripts', 'portraits', 'cast.json')))


def CAST_IMAGES():
    return _cast().get('images', [])


def CASES():
    return _cast()['cases']


if __name__ == '__main__':
    main()
    finish_images()
