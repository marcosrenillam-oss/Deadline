"""Descarga los recursos CC0 de Poly Haven que usa el render del despacho.

Uso: python3 scripts/desk-render/fetch_assets.py
Se guardan en .cache/polyhaven/<id>/ (fuera del repositorio). Todos los
recursos de Poly Haven son CC0: uso libre, sin atribución obligatoria
(se citan igualmente en docs/ART_CREDITS.md).
"""
import json, os, sys, urllib.request, hashlib

ROOT = os.path.join(os.path.dirname(__file__), '..', '..', '.cache', 'polyhaven')
API = 'https://api.polyhaven.com/files/'

# (id, tipo, resolución)
ASSETS = [
    # Modelos
    ('Camera_01', 'model', '1k'),
    ('magnifying_glass_01', 'model', '1k'),
    ('round_spectacles', 'model', '1k'),
    ('vintage_pocket_watch', 'model', '1k'),
    ('vintage_lighter', 'model', '1k'),
    ('cigarette_case', 'model', '1k'),
    ('service_pistol', 'model', '1k'),
    ('fishermans_hat', 'model', '1k'),
    ('postcard_set_01', 'model', '1k'),
    ('office_notepads', 'model', '1k'),
    ('vintage_stapler', 'model', '1k'),
    ('desk_lamp_arm_01', 'model', '1k'),
    ('vintage_wooden_drawer_01', 'model', '1k'),
    ('binder_notebook', 'model', '1k'),
    ('tea_set_01', 'model', '1k'),
    # Texturas
    ('black_walnut_veneer_01', 'texture', '2k'),
    ('dark_wood', 'texture', '2k'),
    ('brown_leather', 'texture', '2k'),
    ('fabric_leather_02', 'texture', '1k'),
    # Iluminación
    ('anniversary_lounge', 'hdri', '1k'),
    ('cinema_lobby', 'hdri', '1k'),
]


UA = {'User-Agent': 'deadline-desk-render/1.0'}


def open_url(url: str, timeout: int):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout)


def get(url: str, dest: str, md5: str | None = None) -> None:
    if os.path.exists(dest) and (md5 is None or hashlib.md5(open(dest, 'rb').read()).hexdigest() == md5):
        return
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open_url(url, 120) as r, open(dest + '.part', 'wb') as f:
        f.write(r.read())
    os.replace(dest + '.part', dest)


def main() -> None:
    for aid, kind, res in ASSETS:
        info = json.load(open_url(API + aid, 60))
        base = os.path.join(ROOT, aid)
        if kind == 'hdri':
            h = info['hdri'][res]['hdr']
            get(h['url'], os.path.join(base, f'{aid}_{res}.hdr'), h['md5'])
        elif kind == 'texture':
            # Mapas sueltos: color, normal (OpenGL) y rugosidad.
            for key in ('Diffuse', 'nor_gl', 'Rough'):
                f = info[key][res]['jpg']
                get(f['url'], os.path.join(base, f'{key}.jpg'), f['md5'])
        else:
            # glTF: legible por cualquier Blender (los .blend nuevos no los abre la 4.0).
            g = info['gltf'][res]['gltf']
            get(g['url'], os.path.join(base, os.path.basename(g['url'])), g['md5'])
            for rel, f in g.get('include', {}).items():
                get(f['url'], os.path.join(base, rel), f['md5'])
        print('✔', aid, flush=True)


if __name__ == '__main__':
    sys.exit(main())
