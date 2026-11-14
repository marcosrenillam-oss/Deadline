"""INTEGRA retratos e imágenes en los expedientes (content/cases/*/case.ts).

Uso: python3 scripts/portraits/integrate.py

Para cada personaje con retrato en content/cases/<caso>/portraits/<id>.webp
añade `portrait: 'pt-<id>'` y su recurso; para cada imagen de prueba en
content/cases/<caso>/img/<id>.webp añade el recurso y un bloque de imagen al
principio del cuerpo de la evidencia. Es idempotente: si ya está, no repite.
`npm run content` recalcula después tamaños y SHA-256.
"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
CAST = json.load(open(os.path.join(HERE, 'cast.json')))


def ts(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


def size_of(path):
    from PIL import Image
    with Image.open(path) as im:
        return im.size


def add_asset(src, entry):
    if f"id: {ts(entry['id'])}" in src:
        return src
    line = (f"    {{ id: {ts(entry['id'])}, kind: 'image', src: {ts(entry['src'])}, bytes: 0, sha256: '', "
            f"width: {entry['width']}, height: {entry['height']}, alt: {ts(entry['alt'])}{', credit: ' + ts(entry['credit']) if entry.get('credit') else ''} }},\n")
    if re.search(r'\n  assets: \[\],\n', src):
        return src.replace('\n  assets: [],\n', '\n  assets: [\n' + line + '  ],\n', 1)
    m = re.search(r'\n  assets: \[\n', src)
    assert m, 'sin assets'
    return src[:m.end()] + line + src[m.end():]


CREDIT = 'Generada para DEADLINE con un modelo de imagen de pesos abiertos (Realistic Vision 5.1, CreativeML OpenRAIL-M). Persona inventada.'
CREDIT_REAL = 'Recreación artística generada para DEADLINE con un modelo de imagen de pesos abiertos (Realistic Vision 5.1, CreativeML OpenRAIL-M). No es una fotografía de la persona real.'
CREDIT_IMG = 'Generada para DEADLINE con un modelo de imagen de pesos abiertos (Realistic Vision 5.1, CreativeML OpenRAIL-M).'


def main():
    by_case = {}
    for p in CAST['people']:
        by_case.setdefault(p['case'], {'people': [], 'images': []})['people'].append(p)
    for i in CAST.get('images', []):
        by_case.setdefault(i['case'], {'people': [], 'images': []})['images'].append(i)
    for case, items in by_case.items():
        path = os.path.join(ROOT, 'content', 'cases', case, 'case.ts')
        if not os.path.exists(path):
            continue  # p. ej. imágenes del despacho (DESK)
        src = open(path).read()
        data = json.load(open(os.path.join(ROOT, 'content', 'cases', case, 'case.json')))
        names = {c['id']: c['name'] for c in data['characters']}
        for p in items['people']:
            f = os.path.join(ROOT, 'content', 'cases', case, 'portraits', p['id'] + '.webp')
            if not os.path.exists(f):
                continue
            aid = 'pt-' + p['id'][3:]
            w, h = size_of(f)
            real = data.get('origin') == 'real'
            alt = f"Recreación artística del retrato de {names.get(p['id'], p['id'])}." if real else f"Retrato de {names.get(p['id'], p['id'])}."
            src = add_asset(src, {'id': aid, 'src': f"portraits/{p['id']}.webp", 'width': w, 'height': h,
                                  'alt': alt, 'credit': CREDIT_REAL if real else CREDIT})
            m = re.search(r"(?<![A-Za-z])id: " + re.escape(ts(p['id'])) + r",\n", src)
            assert m, p['id']
            block_end = src.find('\n    },', m.end())
            if 'portrait:' not in src[m.end():block_end]:
                indent = re.search(r'\n( *)id: ' + re.escape(ts(p['id'])), src).group(1)
                src = src[:m.end()] + f"{indent}portrait: {ts(aid)},\n" + src[m.end():]
        for i in items['images']:
            f = os.path.join(ROOT, 'content', 'cases', case, 'img', i['id'] + '.webp')
            if not os.path.exists(f):
                continue
            aid = 'im-' + i['id'][4:]
            w, h = size_of(f)
            src = add_asset(src, {'id': aid, 'src': f"img/{i['id']}.webp", 'width': w, 'height': h, 'alt': i['alt'], 'credit': CREDIT_IMG})
            m = re.search(r"(?<![A-Za-z])id: " + re.escape(ts(i['evidence'])) + r",", src)
            assert m, i['evidence']
            b = src.find('body: [', m.end())
            if f"asset: {ts(aid)}" in src[m.end():b + 400]:
                continue
            nl = src.rfind('\n', 0, b)
            indent = src[nl + 1:b]
            block = f"\n{indent}  {{ type: 'image', asset: {ts(aid)}, caption: {ts(i['caption'])} }},"
            src = src[:b + len('body: [')] + block + src[b + len('body: ['):]
        open(path, 'w').write(src)
        print('✔', case)


if __name__ == '__main__':
    main()
