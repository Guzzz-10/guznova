"""Genera las texturas procedurales de public/fx (humo y grano).

Solo hace falta correrlo si querés regenerarlas:
    pip install numpy scipy pillow
    python scripts/generate-textures.py
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

OUT = Path(__file__).resolve().parent.parent / "public" / "fx"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(1820)


def fractal(size: int, sigmas, weights) -> np.ndarray:
    """Ruido fractal sin costuras (mode='wrap'), normalizado 0..1."""
    acc = np.zeros((size, size), np.float32)
    for s, w in zip(sigmas, weights):
        n = ndi.gaussian_filter(rng.standard_normal((size, size)).astype(np.float32), s, mode="wrap")
        acc += w * n / n.std()
    acc -= acc.min()
    return acc / acc.max()


# Humo: blanco con alfa, volutas suaves y tileables.
fog = fractal(1024, (90, 42, 18, 7), (1.0, 0.55, 0.28, 0.12))
fog = np.clip((fog - 0.38) / 0.5, 0, 1) ** 1.6
alpha = (fog * 255).astype(np.uint8)
white = np.full_like(alpha, 255)
Image.fromarray(np.dstack([white, white, white, alpha]), "RGBA").save(OUT / "fog.png", optimize=True)

# Grano de película: gris medio con ruido fino (se usa con mix-blend-mode: overlay).
grain = rng.normal(128, 38, (512, 512)).clip(0, 255).astype(np.uint8)
Image.fromarray(grain, "L").save(OUT / "grain.png", optimize=True)
print("Texturas generadas en", OUT)
