"""Portrait simple : la photo détourée de Riyan, avec un filtre léger, en autocollant (bord crème + contour prune).

Usage : python tools/portrait/build_portrait_v2.py
Entrée : public/media/riyan.webp (photo sur fond blanc). Sorties : public/media/portrait/{naturel,nb,duo}.webp
et un comparatif scratch (chemin en argument facultatif). Tout est calculé localement.

 - naturel : couleurs de la photo, contraste et chaleur très légèrement relevés, grain fin ;
 - nb      : noir et blanc doux façon film, grain fin ;
 - duo     : deux tons, prune dans les ombres et crème dans les lumières (palette du site).
"""
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "public", "media", "riyan.webp")
OUT = os.path.join(ROOT, "public", "media", "portrait")
os.makedirs(OUT, exist_ok=True)

W = 900
CREAM = np.array([255, 246, 229], np.float32) / 255
PLUM = np.array([43, 15, 58], np.float32) / 255
VIOLET = (108, 43, 255)

photo = Image.open(SRC).convert("RGB")
H = round(photo.height * W / photo.width)
photo = photo.resize((W, H), Image.LANCZOS)
rgb = np.asarray(photo).astype(np.float32) / 255.0
lum = 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]

# ---- détourage : tout sauf le blanc du fond ; fermeture large pour la chemise qui touche le fond au col
nonwhite = rgb.min(axis=2) <= 0.9
nonwhite = ndi.binary_opening(nonwhite, iterations=1)
R = 26
PAD = R + 4
padded = np.pad(nonwhite, PAD, constant_values=False)
grown = ndi.distance_transform_edt(~padded) <= R
closed = (ndi.distance_transform_edt(grown) > R)[PAD:-PAD, PAD:-PAD]
mask = ndi.binary_fill_holes(closed | nonwhite)
lab, n = ndi.label(mask)
if n > 1:
    sizes = ndi.sum(mask, lab, range(1, n + 1))
    mask = lab == (1 + int(np.argmax(sizes)))
mask = ndi.binary_erosion(mask, iterations=1)
alpha = np.clip(ndi.gaussian_filter(mask.astype(np.float32), 1.0) * 1.6 - 0.3, 0, 1)

rng = np.random.default_rng(7)
grain = rng.normal(0, 1, (H, W)).astype(np.float32)
grain = ndi.gaussian_filter(grain, 0.6)


def curve(x, contrast=1.08, lift=0.02):
    return np.clip((x - 0.5) * contrast + 0.5 + lift, 0, 1)


def sticker(color, name):
    """Pose l'image détourée sur un bord crème puis un contour prune, comme un autocollant."""
    edge = ndi.distance_transform_edt(~mask)
    cream_band = edge <= 9
    plum_band = (edge <= 13) & ~cream_band
    out = np.zeros((H, W, 4), np.float32)
    out[plum_band, :3] = PLUM
    out[plum_band, 3] = 1
    out[cream_band, :3] = CREAM
    out[cream_band, 3] = 1
    a = alpha[..., None]
    out[..., :3] = color * a + out[..., :3] * (1 - a)
    out[..., 3] = np.maximum(out[..., 3], alpha)
    # bord adouci du contour extérieur
    soft = np.clip(13.8 - edge, 0, 1)
    out[..., 3] = np.where(mask, 1.0, np.minimum(out[..., 3], soft))
    img = Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), "RGBA")
    img.save(os.path.join(OUT, name + ".webp"), "WEBP", quality=90, method=6)
    return img


# 1. naturel : un soupçon de contraste et de chaleur, grain fin
nat = curve(rgb, 1.06, 0.01)
nat = nat * np.array([1.02, 1.0, 0.97], np.float32)
nat = np.clip(nat + grain[..., None] * 0.018, 0, 1)
img_nat = sticker(nat, "naturel")

# 2. noir et blanc doux façon film : noirs relevés (pas d'aplat noir), grain fin
bw = curve(lum, 1.12, 0.03)
bw = 0.06 + bw * 0.92
bw = np.clip(bw + grain * 0.03, 0, 1)
img_nb = sticker(np.repeat(bw[..., None], 3, axis=2), "nb")

# 3. duotone prune -> crème (dégradé continu, aucune trame)
t = np.clip(curve(lum, 1.15, 0.04), 0, 1)[..., None]
duo = PLUM * (1 - t) + CREAM * t
duo = np.clip(duo + grain[..., None] * 0.02, 0, 1)
img_duo = sticker(duo, "duo")

for k in ("naturel", "nb", "duo"):
    print(k, os.path.getsize(os.path.join(OUT, k + ".webp")) // 1024, "Ko")

# ---- comparatif sur le bloc violet du hero
if len(sys.argv) > 1:
    pad = 50
    tile_w, tile_h = W + 2 * pad, H + 2 * pad
    sheet = Image.new("RGB", (3 * tile_w + 4 * 30, tile_h + 2 * 30 + 50), (43, 15, 58))
    for i, (img, label) in enumerate(((img_nat, "1 · naturel"), (img_nb, "2 · noir et blanc doux"), (img_duo, "3 · deux tons prune / crème"))):
        tile = Image.new("RGBA", (tile_w, tile_h), VIOLET + (255,))
        tile.alpha_composite(img, (pad, pad))
        sheet.paste(tile.convert("RGB"), (30 + i * (tile_w + 30), 80))
    try:
        from PIL import ImageDraw, ImageFont
        d = ImageDraw.Draw(sheet)
        f = ImageFont.truetype("arialbd.ttf", 34)
        for i, label in enumerate(("1 · naturel", "2 · noir et blanc doux", "3 · deux tons prune / crème")):
            d.text((30 + i * (tile_w + 30), 26), label, fill=(255, 246, 229), font=f)
    except OSError:
        pass
    sheet.thumbnail((2400, 2400))
    sheet.save(sys.argv[1])
    print("comparatif :", sys.argv[1])
