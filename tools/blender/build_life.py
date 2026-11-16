"""Deady's World : les 12 objets « ce que j'aime dans la vie » (musique, cinéma, jeu, sport, Japon, IA).

Usage :
    blender --background --python tools/blender/build_life.py -- <dossier_glb> [<image_planche.png>]

Tout est construit à partir de primitives (aucun modèle téléchargé, aucun service IA). Chaque objet est exporté
dans son GLB, en plusieurs maillages : le NOM de la matière (chrome, ivory, orange…) sert de clé côté three.js,
qui pose les vraies matières de studio. L'avant de l'objet regarde -Y (donc +Z une fois dans three.js).
"""
import math
import os
import sys

import bmesh
import bpy
from mathutils import Euler, Matrix, Vector

ARGS = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
OUT = ARGS[0] if ARGS else os.path.abspath("out/life")
SHEET = ARGS[1] if len(ARGS) > 1 else None
os.makedirs(OUT, exist_ok=True)

PALETTE = {
    "chrome": ((0.85, 0.86, 0.88, 1), 1.0, 0.08),
    "alu": ((0.72, 0.73, 0.76, 1), 1.0, 0.35),
    "ivory": ((0.88, 0.84, 0.73, 1), 0.0, 0.35),
    "orange": ((0.82, 0.3, 0.12, 1), 0.0, 0.4),
    "clay": ((0.7, 0.19, 0.09, 1), 0.0, 0.55),
    "cobalt": ((0.018, 0.074, 1.0, 1), 0.0, 0.2),
    "black": ((0.014, 0.015, 0.013, 1), 0.0, 0.3),
    "red": ((0.87, 0.085, 0.036, 1), 0.0, 0.3),
    "amber": ((0.9, 0.45, 0.05, 1), 0.0, 0.15),
    "blueglass": ((0.2, 0.42, 1.0, 1), 0.0, 0.1),
    "orangeglass": ((1.0, 0.42, 0.1, 1), 0.0, 0.1),
    "gold": ((0.95, 0.72, 0.2, 1), 1.0, 0.2),
}
_mats = {}


def mat(key):
    if key not in _mats:
        color, metallic, rough = PALETTE[key]
        m = bpy.data.materials.new(key)
        m.use_nodes = True
        b = m.node_tree.nodes["Principled BSDF"]
        b.inputs["Base Color"].default_value = color
        b.inputs["Metallic"].default_value = metallic
        b.inputs["Roughness"].default_value = rough
        m.diffuse_color = color
        _mats[key] = m
    return _mats[key]


def _finish(name, bm, key, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1), angle=40):
    """Transforme, crée l'objet, lisse par angle (arêtes vives conservées)."""
    m = Matrix.Translation(Vector(loc)) @ Euler(rot).to_matrix().to_4x4() @ Matrix.Diagonal((*scale, 1))
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    limit = math.radians(angle)
    for p in me.polygons:
        p.use_smooth = True
    sharp = me.attributes.new("sharp_edge", "BOOLEAN", "EDGE") if "sharp_edge" not in me.attributes else me.attributes["sharp_edge"]
    bm2 = bmesh.new()
    bm2.from_mesh(me)
    bm2.edges.ensure_lookup_table()
    flags = [len(e.link_faces) == 2 and e.calc_face_angle(0) > limit for e in bm2.edges]
    bm2.free()
    sharp.data.foreach_set("value", flags)
    me.materials.append(mat(key))
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def box(name, size, key, loc=(0, 0, 0), rot=(0, 0, 0), r=0.05, seg=4):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
    if r > 0:
        bmesh.ops.bevel(bm, geom=bm.edges[:], offset=min(r, min(size) * 0.49), segments=seg, profile=0.5, affect="EDGES")
    return _finish(name, bm, key, loc, rot)


def cyl(name, radius, depth, key, loc=(0, 0, 0), rot=(0, 0, 0), r=0.02, verts=56, r2=None, scale=(1, 1, 1)):
    """Cylindre d'axe Z (ou cône tronqué si r2), bords de chapeau adoucis."""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=radius, radius2=radius if r2 is None else r2, depth=depth)
    if r > 0:
        rim = [e for e in bm.edges if any(len(f.verts) > 4 for f in e.link_faces)]
        bmesh.ops.bevel(bm, geom=rim, offset=min(r, depth * 0.45), segments=3, profile=0.5, affect="EDGES")
    return _finish(name, bm, key, loc, rot, scale)


def ball(name, radius, key, loc=(0, 0, 0), scale=(1, 1, 1), rot=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=24, radius=radius)
    return _finish(name, bm, key, loc, rot, scale, angle=80)


def ring(name, big, small, key, loc=(0, 0, 0), rot=(0, 0, 0), seg=64, sub=14):
    """Tore d'axe Z."""
    bm = bmesh.new()
    rows = []
    for i in range(seg):
        a = 2 * math.pi * i / seg
        rows.append([
            bm.verts.new(((big + small * math.cos(2 * math.pi * j / sub)) * math.cos(a), (big + small * math.cos(2 * math.pi * j / sub)) * math.sin(a), small * math.sin(2 * math.pi * j / sub)))
            for j in range(sub)
        ])
    for i in range(seg):
        for j in range(sub):
            bm.faces.new((rows[i][j], rows[(i + 1) % seg][j], rows[(i + 1) % seg][(j + 1) % sub], rows[i][(j + 1) % sub]))
    return _finish(name, bm, key, loc, rot, angle=80)


def tube(name, points, radius, key):
    """Câble : courbe lissée passant par les points, épaissie."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 5
    cu.resolution_u = 14
    sp = cu.splines.new("NURBS")
    sp.points.add(len(points) - 1)
    for p, co in zip(sp.points, points):
        p.co = (*co, 1)
    sp.use_endpoint_u = True
    sp.order_u = 4
    tmp = bpy.data.objects.new(name + "_c", cu)
    bpy.context.scene.collection.objects.link(tmp)
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg))
    bpy.data.objects.remove(tmp)
    for p in me.polygons:
        p.use_smooth = True
    me.materials.append(mat(key))
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


X90 = (math.pi / 2, 0, 0)  # axe Z -> axe Y (face avant vers -Y)
Y90 = (0, math.pi / 2, 0)  # axe Z -> axe X


# ---------------------------------------------------------------- les 12 objets


def robot():
    """Clin d'œil à la mascotte pixel de Claude Code : corps large, deux yeux carrés, bras courts, quatre pattes."""
    o = [box("Body", (2.0, 1.0, 1.15), "clay", (0, 0, 0.3), r=0.07)]
    for sx in (-1, 1):
        o.append(box("Arm", (0.3, 0.6, 0.38), "clay", (sx * 1.13, 0, 0.2), r=0.06))
        o.append(box("Eye", (0.17, 0.08, 0.36), "black", (sx * 0.47, -0.5, 0.48), r=0.02))
        for lx in (0.34, 0.8):
            o.append(box("Leg", (0.2, 0.5, 0.5), "clay", (sx * lx, 0, -0.5), r=0.05))
    return o


def earphones():
    o = []
    for sx in (-1, 1):
        o.append(ball("Bud", 0.36, "blueglass", (sx * 0.75, 0, 0.75), scale=(1, 0.8, 1)))
        o.append(cyl("Grill", 0.2, 0.08, "chrome", (sx * 0.75, -0.29, 0.75), X90, r=0.01))
        o.append(cyl("Stem", 0.085, 0.75, "blueglass", (sx * 0.75, 0.05, 0.25), r=0.03))
        o.append(tube("Wire", [(sx * 0.75, 0.05, -0.1), (sx * 0.8, 0.0, -0.5), (sx * 0.45, 0.05, -0.85), (0, 0, -1.0)], 0.03, "ivory"))
    o.append(box("Split", (0.16, 0.12, 0.26), "blueglass", (0, 0, -1.05), r=0.04))
    o.append(tube("Cable", [(0, 0, -1.15), (0.1, 0.1, -1.5), (-0.25, 0, -1.8), (0.3, -0.1, -2.0), (0.55, 0, -1.7)], 0.035, "ivory"))
    o.append(cyl("Jack", 0.07, 0.3, "chrome", (0.62, 0, -1.55), (0, 0.5, 0), r=0.02))
    return o


def mp3():
    o = [box("Case", (1.25, 0.26, 2.3), "alu", r=0.12, seg=6)]
    o.append(box("Screen", (0.98, 0.04, 0.82), "black", (0, -0.13, 0.58), r=0.015))
    o.append(cyl("Wheel", 0.46, 0.04, "ivory", (0, -0.13, -0.5), X90, r=0.012))
    o.append(cyl("Center", 0.16, 0.06, "alu", (0, -0.14, -0.5), X90, r=0.015))
    o.append(cyl("Port", 0.06, 0.05, "black", (0.35, 0, 1.15), r=0.0))
    return o


def vinyl():
    o = [cyl("Disc", 1.3, 0.05, "black", rot=X90, r=0.015, verts=96)]
    for rr in (0.62, 0.8, 0.98, 1.14):
        o.append(ring("Groove", rr, 0.012, "black", (0, -0.026, 0), X90, seg=96, sub=6))
    o.append(cyl("Label", 0.44, 0.06, "red", rot=X90, r=0.008))
    o.append(cyl("LabelRing", 0.3, 0.064, "ivory", rot=X90, r=0.004))
    o.append(cyl("LabelCore", 0.27, 0.068, "red", rot=X90, r=0.004))
    o.append(cyl("Hole", 0.05, 0.075, "chrome", rot=X90, r=0.01))
    return o


def walkman():
    o = [box("Shell", (1.5, 0.5, 2.2), "orangeglass", r=0.1, seg=5)]
    o.append(box("Tape", (1.15, 0.2, 0.74), "ivory", (0, -0.02, 0.2), r=0.04))
    o.append(box("Window", (0.7, 0.04, 0.3), "black", (0, -0.13, 0.2), r=0.02))
    for sx in (-1, 1):
        o.append(cyl("Reel", 0.13, 0.06, "ivory", (sx * 0.22, -0.14, 0.2), X90, r=0.01, verts=24))
    for i, x in enumerate((-0.5, -0.17, 0.17, 0.5)):
        o.append(box("Key", (0.24, 0.3, 0.12), "red" if i == 0 else "chrome", (x, 0, 1.14), r=0.03))
    o.append(box("Plate", (1.2, 0.04, 0.5), "chrome", (0, -0.25, -0.7), r=0.02))
    o.append(cyl("Volume", 0.13, 0.12, "chrome", (0.78, 0, 0.5), Y90, r=0.02, verts=28))
    return o


def camera():
    o = [box("Body", (2.2, 0.75, 1.15), "black", (0, 0, -0.1), r=0.12, seg=5)]
    o.append(box("Top", (2.24, 0.79, 0.3), "alu", (0, 0, 0.5), r=0.07))
    o.append(box("Base", (2.24, 0.79, 0.16), "alu", (0, 0, -0.66), r=0.05))
    o.append(box("Prism", (0.72, 0.6, 0.3), "alu", (0, 0, 0.76), r=0.08))
    o.append(cyl("LensBase", 0.56, 0.3, "alu", (0, -0.5, -0.1), X90, r=0.03))
    o.append(cyl("LensBarrel", 0.48, 0.5, "black", (0, -0.85, -0.1), X90, r=0.03))
    o.append(cyl("LensRing", 0.5, 0.1, "chrome", (0, -1.08, -0.1), X90, r=0.02))
    o.append(ball("Glass", 0.4, "blueglass", (0, -1.05, -0.1), scale=(1, 0.32, 1)))
    o.append(cyl("Shutter", 0.11, 0.12, "chrome", (0.78, 0, 0.7), r=0.02))
    o.append(cyl("Dial", 0.2, 0.12, "chrome", (-0.76, 0, 0.7), r=0.02, verts=28))
    o.append(box("Finder", (0.3, 0.05, 0.18), "black", (0, -0.31, 0.78), r=0.02))
    return o


def film_reel():
    o = []
    for y in (-0.2, 0.2):
        o.append(ring("Rim", 1.2, 0.07, "chrome", (0, y, 0), X90, seg=80, sub=10))
        o.append(cyl("Hub", 0.32, 0.06, "chrome", (0, y, 0), X90, r=0.015))
        for k in range(5):
            a = 2 * math.pi * k / 5 + math.pi / 2
            o.append(box("Spoke", (0.95, 0.045, 0.26), "chrome", (0.72 * math.cos(a), y, 0.72 * math.sin(a)), (0, -a, 0), r=0.02))
    o.append(cyl("Film", 0.86, 0.34, "amber", rot=X90, r=0.01, verts=72))
    o.append(cyl("Axle", 0.11, 0.56, "black", rot=X90, r=0.02))
    o.append(box("Strip", (0.9, 0.3, 0.03), "amber", (1.2, 0, -0.72), (0, 0.5, 0), r=0.01))
    return o


def gamepad():
    o = [ball("Core", 0.62, "blueglass", (0, 0, 0.1), scale=(1.55, 0.55, 0.85))]
    for sx in (-1, 1):
        o.append(ball("Wing", 0.52, "blueglass", (sx * 0.9, 0, 0.18), scale=(1, 0.62, 1)))
        o.append(ball("Grip", 0.4, "blueglass", (sx * 1.12, 0.06, -0.55), scale=(0.85, 0.7, 1.75), rot=(0, sx * 0.24, 0)))
        o.append(cyl("StickBase", 0.19, 0.06, "black", (sx * 0.42, -0.27, -0.2), X90, r=0.02))
        o.append(cyl("Stick", 0.14, 0.2, "black", (sx * 0.42, -0.37, -0.2), X90, r=0.05))
        o.append(box("Shoulder", (0.5, 0.3, 0.16), "alu", (sx * 0.9, 0.02, 0.68), r=0.06))
    o.append(box("PadH", (0.4, 0.07, 0.13), "black", (-0.9, -0.34, 0.2), r=0.025))
    o.append(box("PadV", (0.13, 0.07, 0.4), "black", (-0.9, -0.34, 0.2), r=0.025))
    for dx, dz, key in ((0, 0.16, "cobalt"), (0.16, 0, "red"), (0, -0.16, "ivory"), (-0.16, 0, "orange")):
        o.append(cyl("Btn", 0.075, 0.07, key, (0.9 + dx, -0.34, 0.2 + dz), X90, r=0.02, verts=24))
    for sx in (-1, 1):
        o.append(box("Start", (0.13, 0.05, 0.06), "black", (sx * 0.16, -0.34, 0.22), r=0.02))
    return o


def lucky_cat():
    o = [ball("Body", 0.78, "ivory", (0, 0, -0.5), scale=(1, 0.9, 1.05))]
    o.append(ball("Head", 0.68, "ivory", (0, -0.03, 0.55), scale=(1.1, 0.95, 0.95)))
    for sx in (-1, 1):
        o.append(cyl("Ear", 0.25, 0.42, "ivory", (sx * 0.43, 0, 1.15), (0, sx * 0.3, 0), r=0.0, r2=0.03, verts=24))
        o.append(cyl("EarIn", 0.14, 0.26, "cobalt", (sx * 0.42, -0.1, 1.12), (0, sx * 0.3, 0), r=0.0, r2=0.02, verts=20))
        o.append(ball("Eye", 0.075, "black", (sx * 0.27, -0.6, 0.62), scale=(1, 0.5, 1.3)))
        o.append(ball("Foot", 0.25, "ivory", (sx * 0.4, -0.5, -1.15), scale=(1, 1.25, 0.7)))
        o.append(tube("Whisk", [(sx * 0.3, -0.63, 0.44), (sx * 0.55, -0.62, 0.47), (sx * 0.82, -0.5, 0.45)], 0.013, "black"))
    o.append(ball("Nose", 0.055, "red", (0, -0.66, 0.5), scale=(1.2, 0.6, 0.8)))
    o.append(ring("Collar", 0.52, 0.085, "cobalt", (0, -0.02, 0.05), (0.12, 0, 0)))
    o.append(ball("Bell", 0.15, "gold", (0, -0.56, -0.06)))
    o.append(ball("ArmUp", 0.24, "ivory", (0.72, -0.12, 0.42), scale=(0.9, 0.9, 2.0), rot=(0, -0.12, 0)))
    o.append(ball("PawUp", 0.27, "ivory", (0.77, -0.24, 0.96), scale=(1, 1.1, 0.95)))
    o.append(ball("ArmDown", 0.23, "ivory", (-0.62, -0.38, -0.5), scale=(0.9, 1.0, 1.5)))
    o.append(box("Coin", (0.5, 0.09, 0.72), "gold", (-0.3, -0.72, -0.55), (0, 0.1, 0), r=0.04))
    return o


def dumbbell():
    o = [cyl("Bar", 0.11, 2.6, "chrome", rot=Y90, r=0.02)]
    o.append(cyl("Grip", 0.125, 0.95, "alu", rot=Y90, r=0.01, verts=40))
    for sx in (-1, 1):
        o.append(cyl("PlateBig", 0.62, 0.22, "chrome", (sx * 0.92, 0, 0), Y90, r=0.06, verts=8))
        o.append(cyl("PlateMid", 0.5, 0.18, "chrome", (sx * 1.13, 0, 0), Y90, r=0.05, verts=8))
        o.append(cyl("Collar", 0.19, 0.14, "alu", (sx * 0.72, 0, 0), Y90, r=0.02))
        o.append(cyl("Cap", 0.15, 0.1, "alu", (sx * 1.28, 0, 0), Y90, r=0.03))
    return o


def stopwatch():
    o = [cyl("Case", 1.0, 0.36, "alu", rot=X90, r=0.1, verts=80)]
    o.append(ring("Bezel", 0.93, 0.06, "chrome", (0, -0.17, 0), X90, seg=80, sub=10))
    o.append(cyl("Face", 0.88, 0.04, "ivory", (0, -0.175, 0), X90, r=0.0, verts=80))
    for k in range(12):
        a = 2 * math.pi * k / 12
        big = k % 3 == 0
        o.append(box("Tick", (0.05 if big else 0.03, 0.02, 0.17 if big else 0.1), "black", (0.72 * math.sin(a), -0.2, 0.72 * math.cos(a)), (0, a, 0), r=0.0))
    o.append(box("Hand", (0.045, 0.025, 0.74), "orange", (0.2, -0.22, 0.24), (0, 0.7, 0), r=0.01))
    o.append(cyl("Pin", 0.07, 0.07, "chrome", (0, -0.22, 0), X90, r=0.015, verts=24))
    o.append(cyl("Neck", 0.12, 0.22, "chrome", (0, 0, 1.08), r=0.02))
    o.append(cyl("Crown", 0.2, 0.16, "orange", (0, 0, 1.24), r=0.04, verts=28))
    o.append(ring("Loop", 0.2, 0.035, "chrome", (0, 0, 1.44), X90, seg=40, sub=8))
    for sx in (-1, 1):
        o.append(cyl("Pusher", 0.085, 0.24, "chrome", (sx * 0.74, 0, 0.82), (0, sx * 0.72, 0), r=0.02, verts=24))
    return o


def puffy_star():
    """Étoile gonflable à cinq branches : un patron plat très subdivisé puis gonflé, avec une couture au bord."""
    bm = bmesh.new()
    top = bm.verts.new((0, -0.42, 0))
    bot = bm.verts.new((0, 0.42, 0))
    outer = []
    for i in range(10):
        a = math.pi / 2 + 2 * math.pi * i / 10
        rr = 1.25 if i % 2 == 0 else 0.62
        outer.append(bm.verts.new((rr * math.cos(a), 0, rr * math.sin(a))))
    for i in range(10):
        a, b = outer[i], outer[(i + 1) % 10]
        bm.faces.new((top, a, b))
        bm.faces.new((bot, b, a))
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=2, use_grid_fill=True)
    me = bpy.data.meshes.new("Star")
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new("Star", me)
    bpy.context.scene.collection.objects.link(ob)
    sub = ob.modifiers.new("sub", "SUBSURF")
    sub.levels = 3
    dg = bpy.context.evaluated_depsgraph_get()
    done = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    bpy.data.objects.remove(ob)
    for p in done.polygons:
        p.use_smooth = True
    done.materials.append(mat("cobalt"))
    star = bpy.data.objects.new("Star", done)
    bpy.context.scene.collection.objects.link(star)
    valve = cyl("Valve", 0.07, 0.1, "ivory", (0.5, -0.27, -0.42), X90, r=0.02, verts=20)
    return [star, valve]


OBJECTS = {
    "life-robot": robot,
    "life-earphones": earphones,
    "life-mp3": mp3,
    "life-vinyl": vinyl,
    "life-walkman": walkman,
    "life-camera": camera,
    "life-reel": film_reel,
    "life-gamepad": gamepad,
    "life-cat": lucky_cat,
    "life-dumbbell": dumbbell,
    "life-stopwatch": stopwatch,
    "life-star": puffy_star,
}


def export(name, objs):
    bpy.ops.object.select_all(action="DESELECT")
    for ob in objs:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    path = os.path.join(OUT, f"{name}.glb")
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB", use_selection=True, export_apply=True, export_yup=True,
        export_animations=False, export_cameras=False, export_lights=False,
    )
    tris = sum(sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in objs)
    print(f"EXPORT {name}: {os.path.getsize(path) / 1024:.0f} Ko, {tris} triangles, {len(objs)} maillages")


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _mats.clear()
    built = {}
    for i, (name, fn) in enumerate(OBJECTS.items()):
        objs = fn()
        export(name, objs)
        built[name] = objs
        # Planche de contrôle : 4 colonnes x 3 lignes, vue de trois quarts face.
        col, row = i % 4, i // 4
        for ob in objs:
            ob.location.x += col * 3.6
            ob.location.z -= row * 3.6
    if not SHEET:
        return
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_WORKBENCH"
    sc.display.shading.light = "STUDIO"
    sc.display.shading.color_type = "MATERIAL"
    sc.display.shading.show_shadows = True
    sc.display.shading.show_cavity = True
    sc.render.resolution_x, sc.render.resolution_y = 1800, 1350
    sc.render.film_transparent = False
    world = bpy.data.worlds.new("w")
    world.color = (0.88, 0.84, 0.73)
    sc.world = world
    cam_data = bpy.data.cameras.new("cam")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = 15.5
    cam = bpy.data.objects.new("cam", cam_data)
    sc.collection.objects.link(cam)
    target = Vector((5.4, 0, -3.6))
    cam.location = target + Vector((7, -30, 6))
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
    sc.camera = cam
    sc.render.filepath = SHEET
    bpy.ops.render.render(write_still=True)
    print("SHEET", SHEET)


main()
