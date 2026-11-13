import bpy, os, glob, mathutils
root = os.path.abspath('.cache/polyhaven')
for d in sorted(os.listdir(root)):
    blends = glob.glob(os.path.join(root, d, '*.gltf'))
    if not blends: continue
    bpy.ops.object.select_all(action='DESELECT')
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=blends[0])
    objs = [o for o in bpy.data.objects if o not in before]
    meshes = [o for o in objs if o.type == 'MESH']
    pts = []
    for o in meshes:
        for c in o.bound_box:
            pts.append(o.matrix_world @ mathutils.Vector(c))
    if pts:
        mn = mathutils.Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
        mx = mathutils.Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
        print(f'{d:28s} objs={len(objs):3d} size={tuple(round(v,3) for v in (mx-mn))} min={tuple(round(v,3) for v in mn)}')
    else:
        print(d, 'sin mallas', [o.type for o in objs][:5])
