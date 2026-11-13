"""ESCENA DEL DESPACHO (Blender 4.0, Cycles).

Uso:
  blender -b --factory-startup -P scripts/desk-render/scene.py -- --preview
  blender -b --factory-startup -P scripts/desk-render/scene.py -- --final

Construye la mesa con recursos CC0 de Poly Haven (.cache/polyhaven) y
modelos propios, renderiza la imagen con la lámpara encendida y apagada,
un recorte por cada objeto interactivo y un JSON con sus zonas táctiles y
las esquinas de las superficies donde la app escribe (calendario, hoja de
la máquina, placa). Todo sale en apps/web/public/desk/.
"""
import bpy, bmesh, math, os, sys, json, glob
from mathutils import Vector, Matrix
from bpy_extras.object_utils import world_to_camera_view

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
PREVIEW = '--final' not in ARGS
ONLY = next((a.split('=')[1] for a in ARGS if a.startswith('--only=')), None)
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
PH = os.path.join(ROOT, '.cache', 'polyhaven')
LAB = os.path.join(ROOT, '.cache', 'desk')
OUT = os.path.join(ROOT, 'apps', 'web', 'public', 'desk') if not PREVIEW else os.path.join(ROOT, '.cache', 'desk-preview')
os.makedirs(OUT, exist_ok=True)

W, H = (2400, 1108) if not PREVIEW else (1200, 554)
SAMPLES = 256 if not PREVIEW else 24

# ─── Escena limpia ───────────────────────────────────────────────────────────
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = False  # el Blender de Ubuntu no trae OpenImageDenoise
scene.cycles.max_bounces = 6
scene.cycles.sample_clamp_indirect = 3.0
scene.cycles.use_adaptive_sampling = True
scene.render.resolution_x = W
scene.render.resolution_y = H
scene.render.film_transparent = False
try:
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look = 'AgX - Punchy'
except Exception:
    scene.view_settings.view_transform = 'Filmic'
scene.view_settings.exposure = 0.0

GROUPS: dict[str, list] = {}


def group(name: str, objs):
    GROUPS.setdefault(name, []).extend(objs)
    return objs


# ─── Materiales ──────────────────────────────────────────────────────────────

def pbsdf(name, color=(0.5, 0.5, 0.5), rough=0.5, metal=0.0, coat=0.0, spec=0.5):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if 'Coat Weight' in b.inputs:
        b.inputs['Coat Weight'].default_value = coat
    return m


def srgb(hexs):
    h = hexs.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)


def textured(name, diff, nor=None, rough=None, scale=(1, 1), rough_value=0.6, tint=None, bump=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord')
    mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (scale[0], scale[1], 1)
    nt.links.new(tc.outputs['UV'], mp.inputs['Vector'])

    def img(path, non_color=False):
        n = nt.nodes.new('ShaderNodeTexImage')
        n.image = bpy.data.images.load(path, check_existing=True)
        if non_color:
            n.image.colorspace_settings.name = 'Non-Color'
        nt.links.new(mp.outputs['Vector'], n.inputs['Vector'])
        return n

    d = img(diff)
    if tint:
        mix = nt.nodes.new('ShaderNodeMix')
        mix.data_type = 'RGBA'
        mix.blend_type = 'MULTIPLY'
        mix.inputs['Factor'].default_value = 1.0
        nt.links.new(d.outputs['Color'], mix.inputs[6])
        mix.inputs[7].default_value = (*tint, 1)
        nt.links.new(mix.outputs[2], b.inputs['Base Color'])
    else:
        nt.links.new(d.outputs['Color'], b.inputs['Base Color'])
    if rough:
        r = img(rough, True)
        nt.links.new(r.outputs['Color'], b.inputs['Roughness'])
    else:
        b.inputs['Roughness'].default_value = rough_value
    if nor:
        n = img(nor, True)
        nm = nt.nodes.new('ShaderNodeNormalMap')
        nm.inputs['Strength'].default_value = bump
        nt.links.new(n.outputs['Color'], nm.inputs['Color'])
        nt.links.new(nm.outputs['Normal'], b.inputs['Normal'])
    return m


def label_mat(name, file, rough=0.8):
    return textured(name, os.path.join(LAB, file), rough_value=rough)


# ─── Primitivas ──────────────────────────────────────────────────────────────

def finish(o, mat=None, bevel=0.0, seg=3, smooth=True):
    if mat:
        o.data.materials.append(mat)
    if bevel:
        mod = o.modifiers.new('bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = seg
        mod.limit_method = 'ANGLE'
    if smooth:
        for p in o.data.polygons:
            p.use_smooth = True
        if bevel:
            o.modifiers.new('wn', 'WEIGHTED_NORMAL')
    return o


def box(name, size, loc, rot=(0, 0, 0), mat=None, bevel=0.002, seg=3):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    return finish(o, mat, bevel, seg)


def cyl(name, r, depth, loc, rot=(0, 0, 0), mat=None, verts=48, bevel=0.0):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.object
    o.name = name
    return finish(o, mat, bevel, 2)


def plane(name, size, loc, rot=(0, 0, 0), mat=None):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.scale = (size[0], size[1], 1)
    bpy.ops.object.transform_apply(scale=True)
    if mat:
        o.data.materials.append(mat)
    return o


def printed(name, size, loc, rot_z, file, rough=0.85, tilt=0.0):
    """Superficie impresa (papel, etiqueta) orientada correctamente hacia la cámara."""
    return plane(name, size, loc, (tilt, 0, rot_z), label_mat(name, file, rough))


def torus(name, R, r, loc, rot=(0, 0, 0), mat=None):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=loc, rotation=rot, major_segments=48, minor_segments=12)
    o = bpy.context.object
    o.name = name
    return finish(o, mat)


def parent_all(objs, root_name, loc=(0, 0, 0), rot_z=0.0):
    root = bpy.data.objects.new(root_name, None)
    bpy.context.collection.objects.link(root)
    for o in objs:
        if o.parent is None:
            o.parent = root
    root.location = loc
    root.rotation_euler = (0, 0, rot_z)
    return root


def import_gltf(asset, loc, rot=(0, 0, 0), scale=1.0, group_name=None, keep=None, move=None):
    path = glob.glob(os.path.join(PH, asset, '*.gltf'))[0]
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    if keep:
        for o in list(new):
            if o.type == 'MESH' and not any(k in o.name for k in keep):
                bpy.data.objects.remove(o, do_unlink=True)
                new.remove(o)
    for name, l in (move or {}).items():
        for o in new:
            if name in o.name:
                o.location = l
    root = bpy.data.objects.new(asset + '_root', None)
    bpy.context.collection.objects.link(root)
    for o in new:
        if o.parent is None:
            o.parent = root
    root.location = loc
    root.rotation_euler = rot
    root.scale = (scale, scale, scale)
    meshes = [o for o in new if o.type == 'MESH']
    if group_name:
        group(group_name, meshes)
    return root, meshes


# ─── Mesa y vade ─────────────────────────────────────────────────────────────

def tex(asset, key):
    return os.path.join(PH, asset, f'{key}.jpg')


desk_mat = textured('walnut', tex('black_walnut_veneer_01', 'Diffuse'), tex('black_walnut_veneer_01', 'nor_gl'), tex('black_walnut_veneer_01', 'Rough'), scale=(2.2, 1.3), tint=(0.62, 0.42, 0.30))
desk = box('desk', (2.6, 1.6, 0.05), (0, 0, -0.025), mat=desk_mat, bevel=0.004)
leather = textured('leather', tex('brown_leather', 'Diffuse'), tex('brown_leather', 'nor_gl'), tex('brown_leather', 'Rough'), scale=(1.4, 0.8), tint=(0.32, 0.42, 0.33), bump=0.6)
blotter = box('blotter', (0.98, 0.56, 0.004), (0.02, -0.05, 0.002), mat=leather, bevel=0.002)
DESK_SURFACES = [desk, blotter]
TOP = 0.004  # altura del vade

# ─── Máquina de escribir (modelo propio) ────────────────────────────────────

def typewriter():
    enamel = pbsdf('tw_enamel', srgb('#1b1a19'), 0.28, 0.2, coat=0.6)
    keycap = pbsdf('tw_key', srgb('#e8dfc8'), 0.35)
    chrome = pbsdf('chrome', (0.8, 0.8, 0.78), 0.12, 1.0)
    rubber = pbsdf('rubber', (0.02, 0.02, 0.02), 0.6)
    p = []
    p.append(box('tw_base', (0.40, 0.31, 0.05), (0, 0, 0.025), mat=enamel, bevel=0.012, seg=4))
    p.append(box('tw_deck', (0.38, 0.17, 0.05), (0, -0.04, 0.055), rot=(math.radians(-14), 0, 0), mat=enamel, bevel=0.012, seg=4))
    p.append(box('tw_hood', (0.40, 0.12, 0.07), (0, 0.10, 0.075), mat=enamel, bevel=0.015, seg=4))
    rows = [10, 10, 9, 8]
    for r, n in enumerate(rows):
        for i in range(n):
            x = (i - (n - 1) / 2) * 0.031 + r * 0.006
            y = 0.03 - r * 0.033
            z = 0.095 - r * 0.009
            k = cyl(f'tw_key_{r}_{i}', 0.0105, 0.008, (x, y, z), mat=keycap, verts=24)
            p.append(k)
            p.append(torus(f'tw_ring_{r}_{i}', 0.0108, 0.0016, (x, y, z + 0.004), mat=chrome))
            p.append(cyl(f'tw_stem_{r}_{i}', 0.002, 0.03, (x, y, z - 0.018), mat=chrome, verts=8))
    p.append(box('tw_space', (0.17, 0.016, 0.008), (0.01, -0.115, 0.052), mat=keycap, bevel=0.003))
    p.append(cyl('tw_platen', 0.022, 0.46, (0, 0.135, 0.125), rot=(0, math.pi / 2, 0), mat=rubber))
    for x in (-0.24, 0.24):
        p.append(cyl(f'tw_knob_{x}', 0.026, 0.02, (x, 0.135, 0.125), rot=(0, math.pi / 2, 0), mat=enamel, bevel=0.003))
    p.append(cyl('tw_lever', 0.004, 0.10, (-0.22, 0.10, 0.165), rot=(math.radians(60), 0, math.radians(-30)), mat=chrome))
    for x in (-0.11, 0.11):
        p.append(cyl(f'tw_spool_{x}', 0.03, 0.008, (x, 0.09, 0.112), mat=rubber))
    sheet = plane('tw_sheet', (0.21, 0.22), (0, 0.205, 0.215), rot=(math.radians(62), 0, 0), mat=label_mat('tw_sheet', 'typewriter_sheet.png', 0.9))
    p.append(sheet)
    return p, sheet


tw_parts, tw_sheet = typewriter()
group('typewriter', tw_parts)
tw_root = parent_all(tw_parts, 'typewriter', (-0.62, 0.21, TOP), math.radians(14))
tw_root.scale = (0.88, 0.88, 0.88)

# ─── Teléfono de disco (modelo propio) ──────────────────────────────────────

def phone():
    bake = pbsdf('bakelite', srgb('#141312'), 0.22, 0.0, coat=0.8)
    chrome = bpy.data.materials['chrome']
    plate = pbsdf('dial_plate', srgb('#e2d9c2'), 0.4)
    p = []
    p.append(box('ph_body', (0.20, 0.22, 0.07), (0, 0, 0.035), mat=bake, bevel=0.03, seg=6))
    p.append(box('ph_top', (0.17, 0.12, 0.05), (0, 0.04, 0.085), mat=bake, bevel=0.022, seg=6))
    # dial
    p.append(cyl('ph_plate', 0.062, 0.006, (0, -0.045, 0.074), rot=(math.radians(-18), 0, 0), mat=plate))
    wheel = cyl('ph_wheel', 0.066, 0.005, (0, -0.045, 0.080), rot=(math.radians(-18), 0, 0), mat=chrome)
    for i in range(10):
        a = math.radians(-60 + i * 30)
        cutter = cyl(f'ph_cut_{i}', 0.0095, 0.03, (math.cos(a) * 0.046, -0.045 + math.sin(a) * 0.046 * math.cos(math.radians(18)), 0.080 + math.sin(a) * 0.046 * math.sin(math.radians(18))), rot=(math.radians(-18), 0, 0), verts=24)
        mod = wheel.modifiers.new(f'hole{i}', 'BOOLEAN')
        mod.object = cutter
        mod.operation = 'DIFFERENCE'
        cutter.hide_render = True
        cutter.hide_viewport = True
    p.append(wheel)
    p.append(cyl('ph_center', 0.022, 0.006, (0, -0.045, 0.082), rot=(math.radians(-18), 0, 0), mat=bake))
    # horquilla y auricular
    for x in (-0.07, 0.07):
        p.append(box(f'ph_prong_{x}', (0.02, 0.03, 0.04), (x, 0.05, 0.125), mat=bake, bevel=0.006))
    p.append(cyl('ph_handle', 0.019, 0.16, (0, 0.05, 0.15), rot=(0, math.pi / 2, 0), mat=bake, bevel=0.004))
    for x in (-0.095, 0.095):
        p.append(cyl(f'ph_cup_{x}', 0.034, 0.045, (x, 0.05, 0.14), mat=bake, bevel=0.01))
    # cable rizado
    curve = bpy.data.curves.new('cord', 'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = 0.004
    sp = curve.splines.new('POLY')
    pts = []
    for i in range(240):
        s = i / 239
        pts.append((-0.10 - s * 0.16 + math.cos(s * 80) * 0.008, -0.02 - s * 0.10 + math.sin(s * 80) * 0.008, 0.02 + (1 - s) * 0.02))
    sp.points.add(len(pts) - 1)
    for pt, co in zip(sp.points, pts):
        pt.co = (*co, 1)
    cord = bpy.data.objects.new('ph_cord', curve)
    cord.data.materials.append(bake)
    bpy.context.collection.objects.link(cord)
    p.append(cord)
    return p


ph_parts = phone()
group('phone', ph_parts)
parent_all(ph_parts, 'phone', (0.17, 0.25, TOP), math.radians(-12))

# ─── Carpetas de expedientes (biblioteca) ───────────────────────────────────

def folders():
    p = []
    manila = pbsdf('manila', srgb('#b8965a'), 0.85)
    for i, f in enumerate(['folder_1.png', 'folder_0.png']):
        x, y, z, r = (i - 1) * 0.012, (i - 1) * -0.01, 0.002 + i * 0.004, math.radians((i - 1) * 4)
        p.append(box(f'fo_{i}', (0.27, 0.35, 0.003), (x, y, z), rot=(0, 0, r), mat=manila, bevel=0.0008))
        p.append(printed(f'fo_{i}_top', (0.27, 0.35), (x, y, z + 0.0016), r, f))
    p.append(printed('fo_sheet', (0.21, 0.29), (0.035, 0.0, 0.0112), math.radians(-6), 'paper_0.png', 0.9))
    p.append(box('fo_cover', (0.27, 0.35, 0.003), (0.01, 0.005, 0.0135), rot=(0, 0, math.radians(2)), mat=manila, bevel=0.0008))
    p.append(printed('fo_cover_top', (0.27, 0.35), (0.01, 0.005, 0.0151), math.radians(2), 'folder_cover.png'))
    p.append(box('fo_tab', (0.08, 0.025, 0.003), (0.08, 0.19, 0.0135), mat=manila, bevel=0.0008))
    return p


fo = folders()
group('folder', fo)
parent_all(fo, 'folder', (-0.20, -0.06, TOP), math.radians(6))

# ─── Calendario de sobremesa ────────────────────────────────────────────────

def calendar():
    wood = pbsdf('cal_wood', srgb('#2a1b10'), 0.45, coat=0.4)
    chrome = bpy.data.materials['chrome']
    p = []
    p.append(box('cal_base', (0.19, 0.12, 0.014), (0, 0, 0.007), mat=wood, bevel=0.003))
    lean = math.radians(58)
    p.append(box('cal_stack', (0.17, 0.004, 0.19), (0, 0.0, 0.095), rot=(-(math.pi / 2 - lean), 0, 0), mat=pbsdf('cal_pages', srgb('#ddd3bd'), 0.9), bevel=0.001))
    page = plane('cal_page', (0.165, 0.185), (0, -0.003 - 0.002, 0.096), rot=(lean, 0, 0), mat=label_mat('cal_page', 'calendar_page.png', 0.85))
    p.append(page)
    for x in (-0.05, 0, 0.05):
        p.append(torus(f'cal_ring_{x}', 0.009, 0.0016, (x, 0.045, 0.178), rot=(0, math.pi / 2, 0), mat=chrome))
    return p, page


cal_parts, cal_page = calendar()
group('calendar', cal_parts)
parent_all(cal_parts, 'calendar', (-0.60, -0.14, TOP), math.radians(18))

# ─── Fichero (archivo personal) ─────────────────────────────────────────────

def card_box():
    oak = textured('oak', tex('dark_wood', 'Diffuse'), tex('dark_wood', 'nor_gl'), tex('dark_wood', 'Rough'), scale=(0.4, 0.4), tint=(0.75, 0.55, 0.38))
    brass = pbsdf('brass', srgb('#b08d4f'), 0.3, 1.0)
    p = []
    Wb, Db, Hb = 0.17, 0.24, 0.10
    t = 0.008
    p.append(box('cb_floor', (Wb, Db, t), (0, 0, t / 2), mat=oak, bevel=0.002))
    for sx in (-1, 1):
        p.append(box(f'cb_side_{sx}', (t, Db, Hb), (sx * (Wb / 2 - t / 2), 0, Hb / 2), mat=oak, bevel=0.002))
    for sy in (-1, 1):
        p.append(box(f'cb_end_{sy}', (Wb, t, Hb), (0, sy * (Db / 2 - t / 2), Hb / 2), mat=oak, bevel=0.002))
    for i in range(6):
        y = 0.09 - i * 0.032
        p.append(printed(f'cb_card_{i}', (Wb - 2.5 * t, 0.105), (0, y, 0.058), 0, f'card_{i}.png', tilt=math.radians(76)))
    p.append(box('cb_pull', (0.045, 0.008, 0.012), (0, -Db / 2 - 0.004, 0.06), mat=brass, bevel=0.003))
    p.append(box('cb_holder', (0.06, 0.003, 0.025), (0, -Db / 2 - 0.0015, 0.08), mat=brass, bevel=0.001))
    return p


cb = card_box()
group('cabinet', cb)
parent_all(cb, 'cabinet', (-0.24, 0.27, TOP), math.radians(-4))

# ─── Corcho con pistas ──────────────────────────────────────────────────────

def cork_board():
    frame = pbsdf('frame', srgb('#2b1c11'), 0.45, coat=0.3)
    p = []
    p.append(box('co_frame', (0.36, 0.24, 0.012), (0, 0, 0.006), mat=frame, bevel=0.003))
    p.append(printed('co_cork', (0.335, 0.215), (0, 0, 0.0122), 0, 'cork.png', 0.95))
    pins = []
    for i, (x, y, f, rz) in enumerate([(-0.11, 0.04, 'note_0.png', 5), (0.0, 0.05, 'paper_1.png', -4), (0.11, 0.03, 'note_1.png', 3), (-0.05, -0.05, 'note_2.png', -6)]):
        p.append(printed(f'co_item_{i}', (0.08, 0.08 if 'note' in f else 0.1), (x, y, 0.0156), math.radians(rz), f))
        pin = bpy.ops.mesh.primitive_uv_sphere_add(radius=0.006, location=(x, y + 0.03, 0.02))
        pinobj = bpy.context.object
        pinobj.data.materials.append(pbsdf(f'pin_{i}', srgb('#a12a24') if i % 2 == 0 else srgb('#d8b45a'), 0.25, 0.1))
        for poly in pinobj.data.polygons:
            poly.use_smooth = True
        p.append(pinobj)
        pins.append((x, y + 0.03, 0.022))
    red = pbsdf('thread', srgb('#9d1f1c'), 0.6)
    for a, b in [(0, 1), (1, 2), (0, 3), (3, 2)]:
        c = bpy.data.curves.new(f'th_{a}{b}', 'CURVE')
        c.dimensions = '3D'
        c.bevel_depth = 0.0009
        s = c.splines.new('POLY')
        s.points.add(1)
        s.points[0].co = (*pins[a], 1)
        s.points[1].co = (*pins[b], 1)
        o = bpy.data.objects.new(f'thread_{a}{b}', c)
        o.data.materials.append(red)
        bpy.context.collection.objects.link(o)
        p.append(o)
    return p


co = cork_board()
group('board', co)
parent_all(co, 'board', (0.17, -0.25, TOP), math.radians(-3))

# ─── Libreta y lápiz ────────────────────────────────────────────────────────

def notebook():
    cover = textured('nb_leather', tex('brown_leather', 'Diffuse'), tex('brown_leather', 'nor_gl'), tex('brown_leather', 'Rough'), scale=(0.5, 0.6), tint=(0.85, 0.6, 0.45))
    p = []
    p.append(box('nb_back', (0.15, 0.21, 0.004), (0, 0, 0.002), mat=cover, bevel=0.002))
    p.append(box('nb_pages', (0.142, 0.204, 0.014), (0.002, 0, 0.011), mat=pbsdf('nb_pages', srgb('#e8e0ca'), 0.9), bevel=0.001))
    p.append(box('nb_cover', (0.15, 0.21, 0.004), (0, 0, 0.020), mat=cover, bevel=0.002))
    p.append(box('nb_band', (0.008, 0.212, 0.024), (0.055, 0, 0.012), mat=pbsdf('band', (0.02, 0.02, 0.02), 0.5)))
    p.append(printed('nb_label', (0.06, 0.032), (-0.01, 0.06, 0.0223), 0, 'notebook_label.png'))
    pencil = cyl('pencil', 0.0045, 0.17, (0.095, -0.01, 0.0045), rot=(math.pi / 2, 0, math.radians(8)), mat=pbsdf('pencil', srgb('#c99a2e'), 0.45), verts=6)
    p.append(pencil)
    return p


nb = notebook()
group('notebook', nb)
parent_all(nb, 'notebook', (0.47, -0.17, TOP), math.radians(-10))

# ─── Placa ───────────────────────────────────────────────────────────────────

def nameplate():
    wood = pbsdf('np_wood', srgb('#2b1a0f'), 0.35, coat=0.6)
    brass = bpy.data.materials['brass']
    p = []
    p.append(box('np_block', (0.22, 0.04, 0.03), (0, 0, 0.015), mat=wood, bevel=0.004))
    plate = plane('np_plate', (0.20, 0.022), (0, -0.012, 0.022), rot=(math.radians(55), 0, 0), mat=brass)
    p.append(plate)
    return p, plate


np_parts, np_plate = nameplate()
group('nameplate', np_parts)
parent_all(np_parts, 'nameplate', (-0.22, -0.285, TOP), 0)

# ─── Lámpara (Poly Haven) y su luz ───────────────────────────────────────────
def banker_lamp():
    brass = bpy.data.materials['brass']
    glass = bpy.data.materials.new('green_glass')
    glass.use_nodes = True
    gb = glass.node_tree.nodes['Principled BSDF']
    gb.inputs['Base Color'].default_value = (*srgb('#1d5a3c'), 1)
    gb.inputs['Roughness'].default_value = 0.08
    if 'Coat Weight' in gb.inputs:
        gb.inputs['Coat Weight'].default_value = 1.0
    if 'Emission Color' in gb.inputs:
        gb.inputs['Emission Color'].default_value = (*srgb('#5fae84'), 1)
        gb.inputs['Emission Strength'].default_value = 0.0
    p = []
    p.append(cyl('lp_base', 0.075, 0.018, (0, 0, 0.009), mat=brass, bevel=0.006))
    p.append(cyl('lp_stem', 0.007, 0.30, (0, 0.02, 0.16), mat=brass))
    bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=0.30, location=(0, -0.01, 0.32), rotation=(0, math.pi / 2, 0), vertices=64, end_fill_type='NOTHING')
    shade = bpy.context.object
    shade.name = 'lp_shade'
    bm = bmesh.new()
    bm.from_mesh(shade.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.x < -0.001 + 0 and False], context='VERTS')
    bm.to_mesh(shade.data)
    bm.free()
    # media caña: se recorta la mitad inferior con un booleano
    cutter = box('lp_cut', (0.5, 0.3, 0.1), (0, -0.01, 0.27), mat=None, bevel=0)
    mod = shade.modifiers.new('half', 'BOOLEAN')
    mod.object = cutter
    mod.operation = 'DIFFERENCE'
    cutter.hide_render = True
    cutter.hide_viewport = True
    sol = shade.modifiers.new('thick', 'SOLIDIFY')
    sol.thickness = 0.003
    finish(shade, glass)
    p.append(shade)
    for x in (-0.15, 0.15):
        p.append(cyl(f'lp_cap_{x}', 0.071, 0.006, (x, -0.01, 0.32), rot=(0, math.pi / 2, 0), mat=brass))
    bulb = bpy.ops.mesh.primitive_uv_sphere_add(radius=0.022, location=(0, -0.01, 0.29))
    bulbo = bpy.context.object
    em = bpy.data.materials.new('bulb')
    em.use_nodes = True
    eb = em.node_tree.nodes['Principled BSDF']
    eb.inputs['Base Color'].default_value = (1, 0.9, 0.75, 1)
    if 'Emission Color' in eb.inputs:
        eb.inputs['Emission Color'].default_value = (1, 0.78, 0.5, 1)
        eb.inputs['Emission Strength'].default_value = 8.0
    bulbo.data.materials.append(em)
    p.append(bulbo)
    # cadenita
    for i in range(10):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0025, location=(0.09, -0.06, 0.29 - i * 0.007))
        b = bpy.context.object
        b.data.materials.append(brass)
        p.append(b)
    return p, glass, em


lp_parts, lamp_glass, bulb_mat = banker_lamp()
group('lamp', lp_parts)
parent_all(lp_parts, 'lamp', (0.62, 0.25, TOP), math.radians(-160))

# Foco de la lámpara: cálido, con sombras suaves
bpy.ops.object.light_add(type='SPOT', location=(0.61, 0.24, 0.235))
spot = bpy.context.object
spot.name = 'lamp_spot'
spot.data.energy = 85
spot.data.color = (1.0, 0.78, 0.52)
spot.data.spot_size = math.radians(150)
spot.data.spot_blend = 0.9
spot.data.shadow_soft_size = 0.05
d = Vector((0.05, -0.12, 0.0)) - spot.location
spot.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()

# Luz de relleno fría (ventana) y ambiente
bpy.ops.object.light_add(type='AREA', location=(-1.2, 0.6, 1.4))
fill = bpy.context.object
fill.data.energy = 30
fill.data.size = 1.2
fill.data.color = (0.62, 0.72, 1.0)
fill.rotation_euler = (Vector((0, 0, 0)) - fill.location).to_track_quat('-Z', 'Y').to_euler()

world = bpy.data.worlds.new('world')
scene.world = world
world.use_nodes = True
env = world.node_tree.nodes.new('ShaderNodeTexEnvironment')
env.image = bpy.data.images.load(os.path.join(PH, 'anniversary_lounge', 'anniversary_lounge_1k.hdr'))
bg = world.node_tree.nodes['Background']
bg.inputs['Strength'].default_value = 0.12
world.node_tree.links.new(env.outputs['Color'], bg.inputs['Color'])

# ─── Atrezo (Poly Haven) ─────────────────────────────────────────────────────
PROPS = []
for asset, loc, rot, sc, keep, move in [
    ('Camera_01', (0.70, -0.08, TOP), (0, 0, math.radians(110)), 1.0, None, None),
    ('service_pistol', (0.50, 0.02, TOP + 0.016), (math.radians(90), 0, math.radians(-25)), 0.95, ['_a'], None),
    ('round_spectacles', (0.33, 0.13, TOP + 0.01), (math.radians(90), 0, math.radians(30)), 1.0, None, None),
    ('vintage_pocket_watch', (-0.40, -0.20, TOP + 0.007), (math.radians(90), 0, math.radians(15)), 1.0, None, None),
    ('vintage_lighter', (-0.38, 0.11, TOP + 0.007), (math.radians(90), 0, math.radians(40)), 1.0, None, None),
    ('magnifying_glass_01', (0.36, -0.30, TOP + 0.013), (math.radians(90), 0, math.radians(-60)), 0.9, None, None),
    ('fishermans_hat', (-0.80, -0.38, TOP + 0.03), (0, 0, math.radians(35)), 1.1, None, None),
    ('tea_set_01', (-0.03, 0.27, TOP), (0, 0, 0), 1.0, ['cup_small_01', 'saucer_circular_04'], {'saucer_circular_04': (0.15, -0.06, 0.0)}),
    ('vintage_stapler', (0.36, 0.31, TOP + 0.013), (math.radians(90), 0, math.radians(170)), 1.0, None, None),
]:
    root, meshes = import_gltf(asset, loc, rot, sc, keep=keep, move=move)
    if asset == 'tea_set_01':
        root.location = (loc[0] - 0.15, loc[1] + 0.06, loc[2])
    PROPS.extend(meshes)

# Papeles sueltos y fotos
p0 = printed('loose_paper', (0.21, 0.29), (0.10, 0.06, TOP + 0.0006), math.radians(-18), 'paper_1.png', 0.9)
PROPS.append(p0)

# ─── Cámara cenital ──────────────────────────────────────────────────────────
cam_data = bpy.data.cameras.new('cam')
cam_data.lens = 26
cam_data.sensor_width = 36
cam = bpy.data.objects.new('cam', cam_data)
bpy.context.collection.objects.link(cam)
cam.location = (0, -0.03, 1.27)
cam.rotation_euler = (math.radians(4), 0, 0)
scene.camera = cam
cam_data.dof.use_dof = True
cam_data.dof.focus_distance = 1.25
cam_data.dof.aperture_fstop = 5.6

# ─── Metadatos para la app ───────────────────────────────────────────────────
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()


def project(v):
    p = world_to_camera_view(scene, cam, v)
    return [round(p.x, 4), round(1 - p.y, 4)]


def hull(points):
    pts = sorted(set(map(tuple, points)))
    if len(pts) < 3:
        return pts
    cross = lambda o, a, b: (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lower, upper = [], []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]


def region(objs):
    pts = []
    for o in objs:
        if o.type == 'MESH':
            ev = o.evaluated_get(dg)
            me = ev.to_mesh()
            step = max(1, len(me.vertices) // 400)
            for i in range(0, len(me.vertices), step):
                pts.append(project(ev.matrix_world @ me.vertices[i].co))
            ev.to_mesh_clear()
        else:
            for c in o.bound_box:
                pts.append(project(o.matrix_world @ Vector(c)))
    return hull(pts)


def quad(plane_obj):
    m = plane_obj.matrix_world
    # Esquinas en orden: arriba-izquierda, arriba-derecha, abajo-derecha, abajo-izquierda (en la textura)
    corners = [Vector((-0.5, 0.5, 0)), Vector((0.5, 0.5, 0)), Vector((0.5, -0.5, 0)), Vector((-0.5, -0.5, 0))]
    me = plane_obj.data
    xs = [v.co.x for v in me.vertices]
    ys = [v.co.y for v in me.vertices]
    sx, sy = max(xs) - min(xs), max(ys) - min(ys)
    return [project(m @ Vector((c.x * sx, c.y * sy, 0))) for c in corners]


meta = {
    'width': W,
    'height': H,
    'objects': {k: {'hull': region(v)} for k, v in GROUPS.items()},
    'surfaces': {'calendar': quad(cal_page), 'typewriter': quad(tw_sheet), 'nameplate': quad(np_plate)},
    'lamp': project(spot.location),
}

# ─── Renders ─────────────────────────────────────────────────────────────────

def render(path):
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'
if ONLY in (None, 'on'):
    render(os.path.join(OUT, 'desk_on.png'))
if ONLY in (None, 'off') and not PREVIEW:
    spot.data.energy = 0
    if 'Emission Strength' in bulb_mat.node_tree.nodes['Principled BSDF'].inputs:
        bulb_mat.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 0.0
    fill.data.energy = 45
    bg.inputs['Strength'].default_value = 0.2
    render(os.path.join(OUT, 'desk_off.png'))
    spot.data.energy = 85
    fill.data.energy = 30
    bg.inputs['Strength'].default_value = 0.12

# Recortes por objeto: todo lo demás es «holdout» (deja agujero transparente)
if ONLY in (None, 'cutouts') and not PREVIEW:
    scene.render.film_transparent = True
    scene.render.image_settings.color_mode = 'RGBA'
    scene.cycles.samples = 96
    all_meshes = [o for o in bpy.data.objects if o.type in ('MESH', 'CURVE')]
    for name, objs in GROUPS.items():
        keep = set(objs)
        for o in all_meshes:
            o.is_holdout = o not in keep
        hl = meta['objects'][name]['hull']
        xs = [p[0] for p in hl]
        ys = [p[1] for p in hl]
        pad = 0.02
        x0, x1 = max(0, min(xs) - pad), min(1, max(xs) + pad)
        y0, y1 = max(0, min(ys) - pad), min(1, max(ys) + pad)
        scene.render.use_border = True
        scene.render.use_crop_to_border = True
        scene.render.border_min_x, scene.render.border_max_x = x0, x1
        scene.render.border_min_y, scene.render.border_max_y = 1 - y1, 1 - y0
        render(os.path.join(OUT, f'obj_{name}.png'))
        meta['objects'][name]['crop'] = [round(x0, 4), round(y0, 4), round(x1 - x0, 4), round(y1 - y0, 4)]
    for o in all_meshes:
        o.is_holdout = False
    scene.render.use_border = False

with open(os.path.join(OUT, 'desk.json'), 'w') as f:
    json.dump(meta, f, indent=1)
print('LISTO', OUT)
