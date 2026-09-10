#!/usr/bin/env python3
"""Regenerate the web brand assets from brand/charak-logo-source.png.

The source is a ~1MB square render on a cream background. The web needs it
with a transparent background (the footer is dark), cropped, and much
smaller. Run from the repo root: python3 brand/build-assets.py
"""
from PIL import Image
import numpy as np
import os

SRC = "brand/charak-logo-source.png"
# Content bounds measured from the source: the emblem and the चरक wordmark
# are separated by a band of empty rows at y=913..926.
EMBLEM = (264, 98, 977, 913)
LOCKUP = (264, 98, 977, 1137)
CREAM = (251, 247, 240)  # --cream


def cutout(path):
    """Lift the artwork off its cream background into a clean alpha channel."""
    a = np.array(Image.open(path).convert("RGB")).astype(float)
    bg = a[0, 0].copy()
    alpha = np.clip(np.abs(a - bg).max(2) / 48.0, 0, 1)
    # un-premultiply so antialiased edges don't carry a cream halo on dark
    safe = np.where(alpha[..., None] > 0.01, alpha[..., None], 1)
    rgb = np.clip(bg + (a - bg) / safe, 0, 255)
    return Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), "RGBA")


def square(im):
    s = max(im.size)
    out = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    out.paste(im, ((s - im.size[0]) // 2, (s - im.size[1]) // 2))
    return out


def save(img, path, w, sq=False):
    im = square(img) if sq else img.copy()
    im.thumbnail((w, w * 4), Image.LANCZOS)
    im = im.quantize(colors=128, method=Image.FASTOCTREE).convert("RGBA")
    im.save(path, optimize=True)
    print(f"{path:38} {im.size}  {os.path.getsize(path) / 1024:.1f}K")


def main():
    full = cutout(SRC)
    emblem, lockup = full.crop(EMBLEM), full.crop(LOCKUP)

    save(emblem, "public/images/charak-mark.png", 192)
    save(lockup, "public/images/charak-logo.png", 480)
    save(emblem, "public/favicon-32.png", 32, sq=True)
    save(emblem, "public/apple-touch-icon.png", 180, sq=True)

    # social preview: the lockup centred on cream
    og = Image.new("RGB", (1200, 630), CREAM)
    h = 430
    w = int(lockup.size[0] * h / lockup.size[1])
    art = lockup.resize((w, h), Image.LANCZOS)
    og.paste(art, ((1200 - w) // 2, (630 - h) // 2), art)
    og.save("public/og-image.jpg", quality=88, optimize=True)
    print(f"{'public/og-image.jpg':38} {og.size}  "
          f"{os.path.getsize('public/og-image.jpg') / 1024:.1f}K")


if __name__ == "__main__":
    main()
