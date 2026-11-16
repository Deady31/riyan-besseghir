"""Portrait « estampe / riso » : la silhouette de Riyan en trois plaques d'impression (ivoire, vermillon, encre).

Usage : python tools/portrait/build_portrait.py
Entrée : public/media/riyan.webp (photo sur fond blanc). Sorties : public/media/portrait/{fill,dots,ink}.webp + preview.png
Tout est calculé localement (numpy, scipy, Pillow) : aucune image ne quitte la machine.

 - fill : la silhouette pleine en ivoire (détourage par le fond blanc, bord lissé) ;
 - dots : trame vermillon (demi-tons, grille à 45°) ;
 - ink  : trame d'encre dans les ombres (grille à 15°) + contour net de la silhouette + traits des détails (yeux, barbe, plis).
Les plaques se superposent comme à l'impression ; le site les fait apparaître l'une après l'autre.
"""
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "public", "media", "riyan.webp")
OUT = os.path.join(ROOT, "public", "media", "portrait")
os.makedirs(OUT, exist_ok=True)

W = 900  # largeur de sortie
SS = 2  # sur-échantillonnage pour des points nets

IVORY = (241, 235, 221)
VERMILION = (240, 82, 53)
INK = (32, 33, 31)

photo = Image.open(SRC).convert("RGB")
H = round(photo.height * W / photo.width)
photo = photo.resize((W * SS, H * SS), Image.LANCZOS)
rgb = np.asarray(photo).astype(np.float32) / 255.0
lum = 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]

# ---- silhouette : tout ce qui n'est pas le blanc du fond. La chemise est blanche elle aussi et touche le fond au col :
# une fermeture morphologique large (par distance, donc rapide) referme cette brèche, puis on remplit les trous.
nonwhite = rgb.min(axis=2) <= 0.9
nonwhite = ndi.binary_opening(nonwhite, iterations=2)
R = 26 * SS
# marge de fond autour de l'image : sans elle, la fermeture se « colle » aux bords du cadre
PAD = R + 4
padded = np.pad(nonwhite, PAD, constant_values=False)
grown = ndi.distance_transform_edt(~padded) <= R
closed = ndi.distance_transform_edt(grown) > R
mask = (closed | padded)[PAD:-PAD, PAD:-PAD]
mask = mask | nonwhite
mask = ndi.binary_fill_holes(mask)
lab2, n2 = ndi.label(mask)
if n2 > 1:
    sizes = ndi.sum(mask, lab2, range(1, n2 + 1))
    mask = lab2 == (1 + int(np.argmax(sizes)))
# le bord est resserré d'un pixel et demi pour ne garder aucune frange blanche du fond
mask = ndi.binary_erosion(mask, iterations=int(1.5 * SS))
soft = ndi.gaussian_filter(mask.astype(np.float32), 1.6 * SS)
alpha = np.clip((soft - 0.5) * 6 + 0.5, 0, 1)
mask = alpha > 0.5

# ---- tons : on étire le contraste pour que le visage et les plis ressortent
inside = lum[mask]
lo, hi = np.percentile(inside, 3), np.percentile(inside, 97)
tone = np.clip((lum - lo) / max(hi - lo, 1e-3), 0, 1)
tone = ndi.gaussian_filter(tone, 0.8 * SS)
dark = 1.0 - tone  # 1 = très sombre


def halftone(darkness, cell, angle, lo_t, hi_t, gain, color):
    """Trame de points sur grille tournée ; le rayon grandit avec l'obscurité entre lo_t et hi_t."""
    h, w = darkness.shape
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    a = math.radians(angle)
    ca, sa = math.cos(a), math.sin(a)
    c = cell * SS
    span = int(math.hypot(w, h) / c) + 2
    cx, cy = w / 2, h / 2
    for i in range(-span, span):
        for j in range(-span, span):
            x = cx + (i * ca - j * sa) * c
            y = cy + (i * sa + j * ca) * c
            if x < 0 or y < 0 or x >= w or y >= h:
                continue
            xi, yi = int(x), int(y)
            if not mask[yi, xi]:
                continue
            v = darkness[max(0, yi - 2):yi + 3, max(0, xi - 2):xi + 3].mean()
            t = (v - lo_t) / (hi_t - lo_t)
            if t <= 0.02:
                continue
            r = min(c * 0.72, c * 0.72 * math.sqrt(min(1.0, t)) * gain)
            d.ellipse((x - r, y - r, x + r, y + r), fill=color + (255,))
    return img


def to_out(img_rgba, name, clip=True):
    if clip:
        a = np.asarray(img_rgba).copy()
        a[..., 3] = (a[..., 3].astype(np.float32) * np.clip(alpha + 0.0, 0, 1)).astype(np.uint8)
        img_rgba = Image.fromarray(a, "RGBA")
    out = img_rgba.resize((W, H), Image.LANCZOS)
    out.save(os.path.join(OUT, name), "WEBP", lossless=True, quality=100, method=6)
    return out


# ---- plaque 1 : silhouette ivoire
fill = np.zeros((H * SS, W * SS, 4), np.uint8)
fill[..., :3] = IVORY
fill[..., 3] = (alpha * 255).astype(np.uint8)
fill_img = to_out(Image.fromarray(fill, "RGBA"), "fill.webp", clip=False)

# ---- plaque 2 : demi-tons vermillon
dots = halftone(dark, 9, 45, 0.18, 0.72, 1.05, VERMILION)
dots_img = to_out(dots, "dots.webp")

# ---- plaque 3 : ombres en encre + contour + traits
ink_dots = halftone(dark, 6, 15, 0.55, 0.9, 1.0, INK)
gx = ndi.sobel(tone, axis=1)
gy = ndi.sobel(tone, axis=0)
mag = ndi.gaussian_filter(np.hypot(gx, gy), 0.6 * SS)
mag = mag / max(np.percentile(mag[mask], 99), 1e-3)
lines = (mag > 0.38) & ndi.binary_erosion(mask, iterations=int(4 * SS))
lines = ndi.binary_dilation(lines, iterations=max(1, SS // 2))
outline = ndi.binary_dilation(mask, iterations=int(3.2 * SS)) & ~ndi.binary_erosion(mask, iterations=int(0.8 * SS))
ink = np.asarray(ink_dots).copy()
extra = lines | outline
ink[extra, :3] = INK
ink[extra, 3] = 255
ink_img = to_out(Image.fromarray(ink, "RGBA"), "ink.webp", clip=False)

# ---- aperçu : les trois plaques sur l'aplat cobalt
tile = Image.new("RGBA", (W + 160, H + 80), (37, 77, 255, 255))
for layer in (fill_img, dots_img, ink_img):
    tile.alpha_composite(layer, (80, 80))
tile.convert("RGB").save(os.path.join(OUT, "preview.png"))
for n in ("fill", "dots", "ink"):
    print(n, os.path.getsize(os.path.join(OUT, n + ".webp")) // 1024, "Ko")
