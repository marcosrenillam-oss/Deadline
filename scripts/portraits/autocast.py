"""REPARTO AUTOMÁTICO: añade a cast.json los personajes de expedientes nuevos.

Uso: python3 scripts/portraits/autocast.py

Para cada personaje de content/cases/*/case.json que aún no esté en el
reparto, crea su entrada con la descripción `appearance` del expediente (o,
si falta, una a partir de edad, oficio y ficha) y el estilo de su época. Los
casos sin plantilla de época reciben una según `era`. Todo en blanco y negro
de archivo (D-071). Después: sd.py (solo genera lo que falta), finish.py,
integrate.py y `npm run content` — o todo junto con make_all.sh.
"""
import glob, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
CAST_PATH = os.path.join(HERE, 'cast.json')

ERA_STYLE = {
    'antiquity': ('encaustic', 'Fayum mummy portrait, flat encaustic painting on a wooden panel, {place}, head and shoulders of {who}, realistic painted face, large expressive eyes, plain ochre background, visible brush strokes', 'sculpture, relief, statue, 3d, frame, photograph'),
    'medieval': ('oil', 'medieval panel painting portrait, {place}, {who}, tempera on wood, realistic face, plain dark background, aged varnish', 'photograph, frame, modern'),
    'early-modern': ('oil', 'old master oil painting portrait, {place}, {who}, dark plain background, chiaroscuro, realistic face, aged varnish, canvas texture', 'photograph, frame, modern'),
    'c19': ('albumen', 'antique cabinet card studio portrait photograph, {place}, {who}, albumen print, sepia tone, soft studio window light, plain painted backdrop, natural skin texture, realistic', 'oval frame, ornate border, color'),
    'c20': ('press', 'vintage black and white photograph, {place}, head and shoulders portrait of {who}, film grain, natural light, realistic skin texture, sharp focus on the eyes', 'color'),
    'contemporary': ('press', 'black and white documentary portrait photograph, {place}, head and shoulders of {who}, film grain, natural light, realistic', 'color'),
    'near-future': ('scan', 'photorealistic citizen ID portrait photograph, near future, {place}, {who}, soft even studio light, plain background, realistic skin texture', 'cyberpunk neon, helmet, armor'),
    'dystopian-future': ('scan', 'photorealistic registry portrait photograph, dystopian future, {place}, {who}, harsh even light, plain background, realistic skin texture', 'neon, helmet, armor'),
}


def fallback(ch):
    age = ch.get('age')
    who = f"a {age}-year-old person" if age else 'an adult person'
    return f"{who}, {ch['occupation']}, {ch['summary']}"


def main():
    cast = json.load(open(CAST_PATH))
    have = {p['id'] + '@' + p['case'] for p in cast['people']}
    added = 0
    for path in sorted(glob.glob(os.path.join(ROOT, 'content', 'cases', '*', 'case.json'))):
        c = json.load(open(path))
        if c['id'] not in cast['cases']:
            style, prompt, neg = ERA_STYLE.get(c['era'], ERA_STYLE['contemporary'])
            cast['cases'][c['id']] = {'style': style, 'prompt': prompt.replace('{place}', c['eraLabel']), 'negative': neg}
        for ch in c['characters']:
            if ch['role'] == 'investigator' or f"{ch['id']}@{c['id']}" in have:
                continue
            cast['people'].append({'case': c['id'], 'id': ch['id'], 'prompt': ch.get('appearance') or fallback(ch)})
            added += 1
    json.dump(cast, open(CAST_PATH, 'w'), indent=1, ensure_ascii=False)
    print(f'{added} personajes nuevos en el reparto')


if __name__ == '__main__':
    main()
