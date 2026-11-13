"""VARIANTES DEL DESPACHO (personalizaciones) con la misma escena y la misma luz.

Uso:
  blender -b --factory-startup -P scripts/desk-render/variants.py -- [--only=phone,decor] [--preview]

Reutiliza scene.py (sin renderizar la base) y produce en .cache/desk-var/:
  desk_<id>_{on,off}.png       mesa completa con otra madera y otro vade
  patch_<id>_{on,off}.png      el recuadro de un objeto con otro material
                               (lámpara, teléfono, máquina, libreta)
  lift_<id>.png                recorte del objeto para la animación de cogerlo
  decor_<id>_{on,off}.png      adorno con su sombra sobre fondo transparente
y variants.json con la posición de cada recuadro. finalize_variants.py los
convierte a WebP en apps/web/public/desk/var/.
"""
import bpy, bmesh, math, os, sys, json
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
MY_ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
ONLY_SLOTS = next((a.split('=')[1].split(',') for a in MY_ARGS if a.startswith('--only=')), None)
VPREVIEW = '--preview' in MY_ARGS
VOUT = os.path.join(ROOT, '.cache', 'desk-var')
os.makedirs(VOUT, exist_ok=True)

# Construye la escena completa sin renderizar nada.
sys.argv = [sys.argv[0], '--', '--final', '--only=none']
NS = {'__file__': os.path.join(HERE, 'scene.py'), '__name__': 'scene'}
exec(compile(open(os.path.join(HERE, 'scene.py')).read(), 'scene.py', 'exec'), NS)
bpy_scene = NS['scene']
GROUPS = NS['GROUPS']
pbsdf, srgb, textured, tex = NS['pbsdf'], NS['srgb'], NS['textured'], NS['tex']
spot, fill, bg, bulb_mat = NS['spot'], NS['fill'], NS['bg'], NS['bulb_mat']
project = NS['project']
W, H = NS['W'], NS['H']
bpy_scene.cycles.samples = 16 if VPREVIEW else 256
if VPREVIEW:
    bpy_scene.render.resolution_percentage = 25
    VOUT = os.path.join(ROOT, '.cache', 'desk-var-preview')
    os.makedirs(VOUT, exist_ok=True)
meta = {'width': W, 'height': H, 'desk': [], 'patches': {}, 'decor': {}}


def light(on):
    spot.data.energy = 85 if on else 0
    bsdf = bulb_mat.node_tree.nodes['Principled BSDF']
    if 'Emission Strength' in bsdf.inputs:
        bsdf.inputs['Emission Strength'].default_value = 8.0 if on else 0.0
    fill.data.energy = 30 if on else 45
    bg.inputs['Strength'].default_value = 0.12 if on else 0.2


def render(path):
    bpy_scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print('✔', os.path.basename(path), flush=True)


def bbox_of(objs, pad):
    dg = bpy.context.evaluated_depsgraph_get()
    pts = []
    for o in objs:
        ev = o.evaluated_get(dg)
        for c in ev.bound_box:
            pts.append(project(ev.matrix_world @ Vector(c)))
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    x0, x1 = max(0, min(xs) - pad), min(1, max(xs) + pad)
    y0, y1 = max(0, min(ys) - pad), min(1, max(ys) + pad)
    return [x0, y0, x1, y1]


def border(box):
    x0, y0, x1, y1 = box
    s = bpy_scene.render
    s.use_border = True
    s.use_crop_to_border = True
    s.border_min_x, s.border_max_x = x0, x1
    s.border_min_y, s.border_max_y = 1 - y1, 1 - y0


def no_border():
    bpy_scene.render.use_border = False


def mat(name):
    return bpy.data.materials[name]


def set_color(m, hexs, rough=None, metal=None, coat=None):
    b = m.node_tree.nodes['Principled BSDF']
    if b.inputs['Base Color'].is_linked:
        for l in list(b.inputs['Base Color'].links):
            m.node_tree.links.remove(l)
    b.inputs['Base Color'].default_value = (*srgb(hexs), 1)
    if rough is not None:
        b.inputs['Roughness'].default_value = rough
    if metal is not None:
        b.inputs['Metallic'].default_value = metal
    if coat is not None and 'Coat Weight' in b.inputs:
        b.inputs['Coat Weight'].default_value = coat


def snapshot(m):
    b = m.node_tree.nodes['Principled BSDF']
    links = [(l.from_socket, l.to_socket) for l in b.inputs['Base Color'].links]
    vals = {k: (b.inputs[k].default_value[:] if hasattr(b.inputs[k].default_value, '__len__') else b.inputs[k].default_value)
            for k in ('Base Color', 'Roughness', 'Metallic', 'Coat Weight') if k in b.inputs}
    return m, links, vals


def restore(snap):
    m, links, vals = snap
    b = m.node_tree.nodes['Principled BSDF']
    for k, v in vals.items():
        b.inputs[k].default_value = v
    for a, z in links:
        m.node_tree.links.new(a, z)


def set_tint(m, rgb):
    """Cambia el tinte de un material con textura (nodo de mezcla «tint» de textured())."""
    for n in m.node_tree.nodes:
        if n.type == 'MIX' and n.data_type == 'RGBA' and not n.inputs[7].is_linked:
            n.inputs[7].default_value = (*rgb, 1)
            return True
        if n.type == 'MIX_RGB' and not n.inputs['Color2'].is_linked:
            n.inputs['Color2'].default_value = (*rgb, 1)
            return True
    return False


# ─── Variantes por objeto ────────────────────────────────────────────────────

def lamp_variant(vid):
    glass = mat('green_glass')
    if vid == 'lamp-opaline':
        set_color(glass, '#e4ddcc', rough=0.25)
        b = glass.node_tree.nodes['Principled BSDF']
        if 'Subsurface Weight' in b.inputs:
            b.inputs['Subsurface Weight'].default_value = 0.6
    elif vid == 'lamp-seal':
        set_color(glass, '#6b1f22', rough=0.08)
    elif vid == 'lamp-brass':
        set_color(glass, '#c9a35a', rough=0.22, metal=1.0, coat=0.0)


PHONE = {'phone-oxblood': ('#5e1b1b', 0.25, 0.0, '#e6ddc9'), 'phone-ivory': ('#d8cfb8', 0.3, 0.0, '#2a2620'),
         'phone-brass': ('#b8924f', 0.28, 1.0, '#171715')}
TYPEWRITER = {'typewriter-olive': ('#4a5135', '#efe6cf'), 'typewriter-cream': ('#d2c8ac', '#2a2620'),
              'typewriter-burgundy': ('#5a1f22', '#efe6cf')}
NOTEBOOK = {'notebook-oxblood': ((0.55, 0.16, 0.18), None), 'notebook-black': (None, '#1d1c1a'),
            'notebook-green': ((0.32, 0.62, 0.40), None)}


def phone_variant(vid):
    col, rough, metal, plate = PHONE[vid]
    set_color(mat('bakelite'), col, rough=rough, metal=metal)
    set_color(mat('dial_plate'), plate)


def typewriter_variant(vid):
    body, key = TYPEWRITER[vid]
    set_color(mat('tw_enamel'), body)
    set_color(mat('tw_key'), key)


def notebook_variant(vid):
    tint, flat = NOTEBOOK[vid]
    m = mat('nb_leather')
    if tint:
        set_tint(m, tint)
    else:
        set_color(m, flat, rough=0.35, coat=0.6)


SLOTS = {
    'lamp': ('lamp', ['lamp-opaline', 'lamp-seal', 'lamp-brass'], lamp_variant, ['green_glass']),
    'phone': ('phone', list(PHONE), phone_variant, ['bakelite', 'dial_plate']),
    'typewriter': ('typewriter', list(TYPEWRITER), typewriter_variant, ['tw_enamel', 'tw_key']),
    'notebook': ('notebook', list(NOTEBOOK), notebook_variant, ['nb_leather']),
}


def tint_snapshot(m):
    for n in m.node_tree.nodes:
        if n.type == 'MIX' and n.data_type == 'RGBA' and not n.inputs[7].is_linked:
            return n, n.inputs[7].default_value[:]
    return None


bpy_scene.render.image_settings.file_format = 'PNG'
all_meshes = [o for o in bpy.data.objects if o.type in ('MESH', 'CURVE')]

for slot, (group, variants, apply, mats) in SLOTS.items():
    if ONLY_SLOTS and slot not in ONLY_SLOTS:
        continue
    objs = GROUPS[group]
    box = bbox_of(objs, 0.03)
    meta['patches'][slot] = {'box': [round(v, 4) for v in box], 'variants': variants}
    for vid in variants:
        snaps = [snapshot(mat(n)) for n in mats]
        tints = [tint_snapshot(mat(n)) for n in mats]
        apply(vid)
        # Recuadro con la escena entera (sombras y reflejos incluidos), luz encendida y apagada
        bpy_scene.render.film_transparent = False
        bpy_scene.render.image_settings.color_mode = 'RGB'
        border(box)
        for on in (True, False):
            light(on)
            render(os.path.join(VOUT, f"patch_{vid}_{'on' if on else 'off'}.png"))
        # Recorte del objeto para la animación (como obj_<id>)
        light(True)
        bpy_scene.render.film_transparent = True
        bpy_scene.render.image_settings.color_mode = 'RGBA'
        keep = set(objs)
        for o in all_meshes:
            o.is_holdout = o not in keep
        cut = bbox_of(objs, 0.02)
        border(cut)
        render(os.path.join(VOUT, f'lift_{vid}.png'))
        meta['patches'][slot].setdefault('lift', [round(v, 4) for v in cut])
        for o in all_meshes:
            o.is_holdout = False
        for sn in snaps:
            restore(sn)
        for t in tints:
            if t:
                t[0].inputs[7].default_value = t[1]
    no_border()

# ─── Adornos: cada uno con su sombra sobre la mesa (capturador de sombras) ───

def coffee_cup():
    meshes = NS['PROP_ASSETS']['tea_set_01']
    cup = next(o for o in meshes if 'cup' in o.name)
    dg = bpy.context.evaluated_depsgraph_get()
    ev = cup.evaluated_get(dg)
    pts = [ev.matrix_world @ Vector(c) for c in ev.bound_box]
    cx = sum(p.x for p in pts) / 8
    cy = sum(p.y for p in pts) / 8
    top = max(p.z for p in pts)
    rx = (max(p.x for p in pts) - min(p.x for p in pts)) / 2
    bpy.ops.mesh.primitive_cylinder_add(radius=rx * 0.82, depth=0.002, location=(cx, cy, top - 0.012), vertices=48)
    coffee = bpy.context.object
    m = pbsdf('coffee', srgb('#1a0d06'), 0.08, coat=1.0)
    coffee.data.materials.append(m)
    return meshes + [coffee]


def polaroids():
    out = []
    for i, (img, loc, rz) in enumerate([('polaroid_1.png', (0.29, -0.01, NS['TOP'] + 0.0008), -0.35),
                                        ('polaroid_2.png', (0.36, -0.07, NS['TOP'] + 0.0016), 0.12)]):
        path = os.path.join(ROOT, '.cache', 'desk', img)
        if not os.path.exists(path):
            continue
        out.append(NS['printed'](f'polaroid_{i}', (0.088, 0.107), loc, rz, img, 0.6))
    return out


def badge():
    leather = textured('badge_leather', tex('brown_leather', 'Diffuse'), tex('brown_leather', 'nor_gl'), tex('brown_leather', 'Rough'), scale=(0.3, 0.3), tint=(0.18, 0.11, 0.07))
    brass = mat('brass')
    x, y, z = -0.64, -0.06, NS['TOP']
    wallet = NS['box']('badge_wallet', (0.085, 0.12, 0.008), (x, y, z + 0.004), rot=(0, 0, math.radians(-22)), mat=leather, bevel=0.004)
    bm = bmesh.new()
    pts = [(0, 0.045), (0.034, 0.03), (0.03, -0.01), (0, -0.045), (-0.03, -0.01), (-0.034, 0.03)]
    vs = [bm.verts.new((px, py, 0)) for px, py in pts]
    f = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [e for e in ext['geom'] if isinstance(e, bmesh.types.BMVert)]:
        v.co.z += 0.004
    me = bpy.data.meshes.new('badge')
    bm.to_mesh(me)
    bm.free()
    shield = bpy.data.objects.new('badge_shield', me)
    bpy.context.collection.objects.link(shield)
    shield.location = (x, y + 0.01, z + 0.0085)
    shield.rotation_euler = (0, 0, math.radians(-22))
    me.materials.append(brass)
    bev = shield.modifiers.new('bev', 'BEVEL')
    bev.width = 0.0015
    bev.segments = 3
    return [wallet, shield]


DECOR = {
    'decor-coffee': coffee_cup,
    'decor-magnifier': lambda: NS['PROP_ASSETS']['magnifying_glass_01'],
    'decor-polaroids': polaroids,
    'decor-badge': badge,
}

if not ONLY_SLOTS or 'decor' in ONLY_SLOTS:
    desk_objs = NS['DESK_SURFACES']
    for did, make in DECOR.items():
        objs = make()
        if not objs:
            continue
        for o in objs:
            o.hide_render = False
        keep = set(objs)
        all_now = [o for o in bpy.data.objects if o.type in ('MESH', 'CURVE')]
        hidden = []
        for o in all_now:
            if o in keep:
                continue
            if o in desk_objs:
                o.is_shadow_catcher = True
            elif not o.hide_render:
                # El resto de la mesa no aparece, pero sigue proyectando su luz/sombra
                o.is_holdout = True
                hidden.append(o)
        bpy_scene.render.film_transparent = True
        bpy_scene.render.image_settings.color_mode = 'RGBA'
        box = bbox_of(objs, 0.035)
        border(box)
        meta['decor'][did] = [round(v, 4) for v in box]
        for on in (True, False):
            light(on)
            render(os.path.join(VOUT, f"decor_{did}_{'on' if on else 'off'}.png"))
        for o in all_now:
            o.is_holdout = False
            o.is_shadow_catcher = False
        for o in objs:
            o.hide_render = True
        no_border()

# ─── Mesas: madera y vade de cada variante (imagen completa) ────────────────
DESKS = {
    'desk-mahogany': ((0.78, 0.30, 0.20), (0.40, 0.11, 0.13)),
    'desk-ebony': ((0.22, 0.19, 0.17), (0.20, 0.20, 0.21)),
    'desk-oak': ((1.05, 0.80, 0.52), (0.10, 0.15, 0.30)),
    'desk-baize': (None, (0.10, 0.36, 0.20)),
    'desk-legend': ('lacquer', (0.09, 0.09, 0.085)),
}
if not ONLY_SLOTS or 'desk' in ONLY_SLOTS:
    walnut = mat('walnut')
    leather = mat('leather')
    wsnap = tint_snapshot(walnut)
    lsnap = tint_snapshot(leather)
    bpy_scene.render.film_transparent = False
    bpy_scene.render.image_settings.color_mode = 'RGB'
    no_border()
    desk_obj = NS['desk']
    for vid, (wood, blot) in DESKS.items():
        if ONLY_SLOTS and 'desk' in ONLY_SLOTS and len(ONLY_SLOTS) > 1 and vid not in ONLY_SLOTS:
            continue
        orig = list(desk_obj.data.materials)
        if wood == 'lacquer':
            desk_obj.data.materials[0] = pbsdf('lacquer', srgb('#15120f'), 0.12, coat=1.0)
        elif wood:
            set_tint(walnut, wood)
        set_tint(leather, blot)
        for on in (True, False):
            light(on)
            render(os.path.join(VOUT, f"desk_{vid}_{'on' if on else 'off'}.png"))
        meta['desk'].append(vid)
        desk_obj.data.materials[0] = orig[0]
        if wsnap:
            wsnap[0].inputs[7].default_value = wsnap[1]
        if lsnap:
            lsnap[0].inputs[7].default_value = lsnap[1]

prev = {}
vj = os.path.join(VOUT, 'variants.json')
if os.path.exists(vj):
    prev = json.load(open(vj))
for k in ('patches', 'decor'):
    prev.setdefault(k, {}).update(meta[k])
prev['desk'] = sorted(set(prev.get('desk', [])) | set(meta['desk']))
prev['width'], prev['height'] = W, H
json.dump(prev, open(vj, 'w'), indent=1)
print('LISTO', VOUT)
