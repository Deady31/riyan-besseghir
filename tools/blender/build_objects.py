"""Deady's World : génération reproductible des objets 3D du portfolio (DA « Digital Art Studio »).

Usage :
    blender --background --python tools/blender/build_objects.py -- <dossier_glb> [<dossier_apercus>]

Chaque objet est construit de façon procédurale (aucun modèle téléchargé, aucun service IA), exporté en
GLB avec le pivot au centre, puis rendu en aperçu de studio sur fond ivoire. Les matières finales
(chrome, verre, aluminium…) sont posées côté three.js ; les GLB portent seulement une couleur de repli.
"""
import math
import os
import sys

import bmesh
import bpy
from mathutils import Vector

ARGS = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
OUT = ARGS[0] if ARGS else os.path.abspath("out/objects")
PREVIEW = ARGS[1] if len(ARGS) > 1 else None
os.makedirs(OUT, exist_ok=True)
if PREVIEW:
    os.makedirs(PREVIEW, exist_ok=True)

IVORY = (0.88, 0.84, 0.73, 1)
COBALT = (0.018, 0.074, 1.0, 1)
VERMILION = (0.87, 0.085, 0.036, 1)
INK = (0.014, 0.015, 0.013, 1)


# ---------------------------------------------------------------- outils


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def base_material(name, color, metallic=0.0, roughness=0.5):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    mat.diffuse_color = color
    return mat


def mesh_object(name, bm, material):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    me.materials.append(material)
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def recenter(ob):
    """Pivot au centre de la boîte englobante."""
    me = ob.data
    pts = [v.co for v in me.vertices]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    c = (lo + hi) / 2
    for v in me.vertices:
        v.co -= c
    me.update()


def uv_sphere(u, v, radius=1.0):
    bm = bmesh.new()
    try:
        bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=radius)
    except TypeError:
        bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, diameter=radius)
    return bm


# ---------------------------------------------------------------- objets


def master_sculpture():
    """Trèfle épais, au tube qui gonfle et se pince : sculpture organique, point focal du hero.

    Le tube suit un nœud de trèfle ; son rayon varie le long de la courbe pour donner un volume
    souple plutôt qu'un tuyau régulier. Les repères sont transportés sans torsion (rotation minimizing
    frames), avec une correction répartie pour que le tube se referme sans couture.
    """
    seg, tube = 168, 28
    scale = 0.56

    def curve(t):
        return Vector(
            (
                math.sin(t) + 2.0 * math.sin(2 * t),
                math.cos(t) - 2.0 * math.cos(2 * t),
                -1.15 * math.sin(3 * t),
            )
        ) * scale

    def radius(t):
        return 0.34 * (1.0 + 0.30 * math.sin(3 * t + 0.8) + 0.12 * math.sin(t * 2 + 2.0))

    pts = [curve(2 * math.pi * i / seg) for i in range(seg)]
    tans = []
    for i in range(seg):
        tans.append((pts[(i + 1) % seg] - pts[i - 1]).normalized())

    normals = []
    n0 = tans[0].cross(Vector((0, 0, 1)))
    if n0.length < 1e-4:
        n0 = tans[0].cross(Vector((1, 0, 0)))
    normals.append(n0.normalized())
    for i in range(1, seg):
        v1 = pts[i] - pts[i - 1]
        c1 = v1.dot(v1)
        rl = normals[i - 1] - (2.0 / c1) * v1.dot(normals[i - 1]) * v1
        tl = tans[i - 1] - (2.0 / c1) * v1.dot(tans[i - 1]) * v1
        v2 = tans[i] - tl
        c2 = v2.dot(v2)
        n = rl - (2.0 / c2) * v2.dot(rl) * v2 if c2 > 1e-12 else rl
        normals.append(n.normalized())

    # Correction de la couture : angle entre le repère transporté en fin de boucle et le repère initial.
    v1 = pts[0] - pts[seg - 1]
    c1 = v1.dot(v1)
    end_n = normals[-1] - (2.0 / c1) * v1.dot(normals[-1]) * v1
    end_n = (end_n - tans[0] * end_n.dot(tans[0])).normalized()
    cosang = max(-1.0, min(1.0, end_n.dot(normals[0])))
    ang = math.acos(cosang)
    if end_n.cross(normals[0]).dot(tans[0]) < 0:
        ang = -ang

    bm = bmesh.new()
    rings = []
    for i in range(seg):
        t = 2 * math.pi * i / seg
        corr = ang * i / seg
        tan = tans[i]
        nrm = normals[i]
        nrm = nrm * math.cos(corr) + tan.cross(nrm) * math.sin(corr)
        bin_ = tan.cross(nrm)
        r = radius(t)
        ring = []
        for j in range(tube):
            a = 2 * math.pi * j / tube
            ring.append(bm.verts.new(pts[i] + (nrm * math.cos(a) + bin_ * math.sin(a)) * r))
        rings.append(ring)
    for i in range(seg):
        for j in range(tube):
            bm.faces.new((rings[i][j], rings[(i + 1) % seg][j], rings[(i + 1) % seg][(j + 1) % tube], rings[i][(j + 1) % tube]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return mesh_object("MasterSculpture", bm, base_material("CHROME", (0.82, 0.83, 0.86, 1), 1.0, 0.06))


def glass_orb():
    bm = uv_sphere(64, 32)
    for v in bm.verts:
        v.co.z *= 0.9
    return mesh_object("GlassOrb", bm, base_material("GLASS", (0.75, 0.8, 1.0, 1), 0.0, 0.03))


def brushed_ring():
    bm = bmesh.new()
    major, minor_a, minor_b = 1.0, 0.085, 0.13
    seg, tube = 128, 24
    verts = []
    for i in range(seg):
        a = 2 * math.pi * i / seg
        ring = []
        for j in range(tube):
            b = 2 * math.pi * j / tube
            r = major + minor_a * math.cos(b)
            ring.append(bm.verts.new((r * math.cos(a), r * math.sin(a), minor_b * math.sin(b))))
        verts.append(ring)
    for i in range(seg):
        for j in range(tube):
            bm.faces.new((verts[i][j], verts[(i + 1) % seg][j], verts[(i + 1) % seg][(j + 1) % tube], verts[i][(j + 1) % tube]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return mesh_object("BrushedRing", bm, base_material("ALUMINIUM", (0.75, 0.76, 0.78, 1), 1.0, 0.35))


def cobalt_form():
    """Forme gonflée asymétrique, très lisse."""
    bm = uv_sphere(96, 48)
    for v in bm.verts:
        n = v.co.normalized()
        th = math.atan2(n.y, n.x)
        ph = math.acos(max(-1.0, min(1.0, n.z)))
        r = 1.0 + 0.30 * math.sin(2 * th + 1.0) * math.sin(2 * ph) + 0.20 * math.cos(3 * ph + th) + 0.12 * math.sin(th - 2 * ph)
        v.co = n * r
        v.co.x *= 1.15
        v.co.z *= 0.82
    return mesh_object("CobaltForm", bm, base_material("COBALT_GLOSS", COBALT, 0.0, 0.12))


def satellites():
    """3 sphères et 2 cubes arrondis, dans un même fichier (nœuds nommés)."""
    objs = []
    for name, pos, rad in (("SatSphereA", (0, 0, 0), 0.14), ("SatSphereB", (0.9, 0.3, 0.25), 0.09), ("SatSphereC", (-0.7, -0.35, 0.4), 0.06)):
        bm = uv_sphere(32, 16, rad)
        for v in bm.verts:
            v.co += Vector(pos)
        objs.append(mesh_object(name, bm, base_material("SAT", (0.85, 0.85, 0.88, 1), 1.0, 0.1)))
    for name, pos, size in (("SatCubeA", (0.35, -0.6, -0.2), 0.12), ("SatCubeB", (-0.4, 0.55, -0.35), 0.08)):
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=size * 2)
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=size * 0.35, segments=4, affect="EDGES")
        for v in bm.verts:
            v.co += Vector(pos)
        objs.append(mesh_object(name, bm, base_material("SAT_COLOR", VERMILION, 0.0, 0.2)))
    return objs


def glass_slab():
    """Plaque de verre 3:4 à bords nets, support du titre hero."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= 1.5
        v.co.y *= 0.06
        v.co.z *= 2.0
    bmesh.ops.bevel(bm, geom=list(bm.edges), offset=0.012, segments=2, affect="EDGES")
    return mesh_object("GlassSlab", bm, base_material("GLASS", (0.75, 0.8, 1.0, 1), 0.0, 0.03))


BUILDERS = {
    "master-sculpture": master_sculpture,
    "glass-orb": glass_orb,
    "brushed-ring": brushed_ring,
    "cobalt-form": cobalt_form,
    "satellites": satellites,
    "glass-slab": glass_slab,
}


# ---------------------------------------------------------------- export


def export(name, objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    path = os.path.join(OUT, f"{name}.glb")
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=False,
        export_yup=True,
        export_animations=False,
        export_cameras=False,
        export_lights=False,
    )
    tris = sum(len(o.data.polygons) for o in objs)  # quads comptés, approximation
    tri_exact = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in objs)
    print(f"EXPORT {name}: {os.path.getsize(path) / 1024:.0f} Ko, {tri_exact} triangles ({tris} faces)")


# ---------------------------------------------------------------- aperçus studio


def preview_setup():
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.samples = 40
    sc.cycles.use_denoising = True
    sc.render.resolution_x = sc.render.resolution_y = 720
    sc.render.film_transparent = False
    sc.view_settings.view_transform = "Standard"
    w = bpy.data.worlds.new("W")
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = IVORY
    bg.inputs["Strength"].default_value = 0.55
    sc.world = w

    def card(name, loc, size, rot, emit=None, color=INK):
        bm = bmesh.new()
        bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=1.0)
        me = bpy.data.meshes.new(name)
        bm.to_mesh(me)
        bm.free()
        o = bpy.data.objects.new(name, me)
        o.scale = (size[0], size[1], 1)
        o.location = loc
        o.rotation_euler = rot
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        nt = m.node_tree
        nt.nodes.clear()
        out = nt.nodes.new("ShaderNodeOutputMaterial")
        if emit:
            em = nt.nodes.new("ShaderNodeEmission")
            em.inputs["Color"].default_value = (1, 0.97, 0.92, 1)
            em.inputs["Strength"].default_value = emit
            nt.links.new(em.outputs[0], out.inputs[0])
        else:
            df = nt.nodes.new("ShaderNodeBsdfDiffuse")
            df.inputs["Color"].default_value = color
            nt.links.new(df.outputs[0], out.inputs[0])
        o.data.materials.append(m)
        bpy.context.scene.collection.objects.link(o)
        return o

    # Softboxes (reflets rectangulaires) et drapeaux noirs (contraste dans le chrome).
    card("SoftboxKey", (-4.2, -2.2, 3.4), (1.6, 2.4), (math.radians(60), 0, math.radians(-40)), emit=14)
    card("SoftboxTop", (0.4, 0.6, 5.2), (2.6, 1.4), (0, 0, 0), emit=7)
    card("SoftboxFill", (4.6, -1.0, 1.4), (1.0, 2.0), (math.radians(90), 0, math.radians(90)), emit=4)
    card("FlagL", (-4.6, 1.8, 0.4), (1.2, 2.2), (math.radians(90), 0, math.radians(70)))
    card("FlagR", (3.8, 2.6, 0.6), (1.0, 2.0), (math.radians(90), 0, math.radians(-110)))
    floor = card("Floor", (0, 0, -1.25), (14, 14), (0, 0, 0), color=IVORY)
    floor.name = "Floor"
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = 70
    cam = bpy.data.objects.new("Cam", cam_data)
    cam.location = (0, -10.5, 1.1)
    cam.rotation_euler = (math.radians(87), 0, 0)
    sc.collection.objects.link(cam)
    sc.camera = cam


def preview_material(kind):
    m = bpy.data.materials.new(f"PV_{kind}")
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    if kind == "chrome":
        b.inputs["Base Color"].default_value = (0.9, 0.91, 0.94, 1)
        b.inputs["Metallic"].default_value = 1
        b.inputs["Roughness"].default_value = 0.04
    elif kind == "alu":
        b.inputs["Base Color"].default_value = (0.8, 0.81, 0.83, 1)
        b.inputs["Metallic"].default_value = 1
        b.inputs["Roughness"].default_value = 0.32
    elif kind == "glass":
        b.inputs["Base Color"].default_value = (0.62, 0.7, 1.0, 1)
        b.inputs["Transmission Weight"].default_value = 1
        b.inputs["Roughness"].default_value = 0.02
        b.inputs["IOR"].default_value = 1.45
    elif kind == "cobalt":
        b.inputs["Base Color"].default_value = COBALT
        b.inputs["Roughness"].default_value = 0.14
        b.inputs["Coat Weight"].default_value = 1
        b.inputs["Coat Roughness"].default_value = 0.03
    return m


PREVIEW_KIND = {
    "master-sculpture": "chrome",
    "glass-orb": "glass",
    "brushed-ring": "alu",
    "cobalt-form": "cobalt",
    "satellites": "chrome",
    "glass-slab": "glass",
}


def render_preview(name, objs, floor_z, cam_dist):
    sc = bpy.context.scene
    for o in bpy.data.objects:
        if o.type == "MESH" and o.name not in {"SoftboxKey", "SoftboxTop", "SoftboxFill", "FlagL", "FlagR", "Floor"}:
            o.hide_render = o not in objs
    mat = preview_material(PREVIEW_KIND[name])
    saved = []
    for o in objs:
        saved.append(list(o.data.materials))
        o.data.materials.clear()
        o.data.materials.append(mat)
        if name == "satellites" and o.name.startswith("SatCube"):
            o.data.materials.clear()
            o.data.materials.append(preview_material("cobalt"))
    bpy.data.objects["Floor"].location.z = floor_z
    sc.camera.location = (0, -cam_dist, 0.9)
    sc.render.filepath = os.path.join(PREVIEW, f"{name}.png")
    bpy.ops.render.render(write_still=True)
    for o, ms in zip(objs, saved):
        o.data.materials.clear()
        for m in ms:
            o.data.materials.append(m)
    print(f"PREVIEW {sc.render.filepath}")


# ---------------------------------------------------------------- main

reset_scene()
built = {}
for key, fn in BUILDERS.items():
    res = fn()
    objs = res if isinstance(res, list) else [res]
    for o in objs:
        recenter(o) if key != "satellites" else None
    built[key] = objs
    export(key, objs)

if PREVIEW:
    preview_setup()
    dist = {"master-sculpture": 9.5, "glass-orb": 7.5, "brushed-ring": 8.0, "cobalt-form": 9.0, "satellites": 6.5, "glass-slab": 13.0}
    floor = {"master-sculpture": -0.75, "glass-orb": -1.1, "brushed-ring": -0.8, "cobalt-form": -1.1, "satellites": -1.0, "glass-slab": -2.2}
    for key, objs in built.items():
        for o in objs:
            o.location = (0, 0, 0)
        render_preview(key, objs, floor[key], dist[key])
