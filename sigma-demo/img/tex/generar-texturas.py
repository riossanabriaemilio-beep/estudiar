"""Genera las texturas del corte del alfajor a partir de la foto del envase.
La foto da la paleta exacta y la estructura; el ruido da la nitidez."""
import numpy as np
from PIL import Image, ImageOps, ImageFilter
import sys
FOTO = '/home/user/estudiar/sigma-demo/assets-sigma/farmacity.png'
OUT = '/home/user/estudiar/sigma-demo/img/tex/'
rng = np.random.default_rng(7)
a = Image.open(FOTO).convert('RGB')

def lum(x): return x[..., 0] * .299 + x[..., 1] * .587 + x[..., 2] * .114

def ruido(n, beta, ax=1.0, ay=1.0, seed=0):
    """ruido espectral 1/f^beta, sin costuras (tileable). ax/ay estiran la dirección."""
    r = np.random.default_rng(seed)
    w = r.normal(size=(n, n))
    fy = np.fft.fftfreq(n)[:, None] * ay
    fx = np.fft.fftfreq(n)[None, :] * ax
    f = np.sqrt(fx ** 2 + fy ** 2); f[0, 0] = 1
    s = np.fft.ifft2(np.fft.fft2(w) / f ** beta).real
    s -= s.min(); s /= s.max()
    return s

def rampa(ref, bins=64):
    """color promedio de la foto según luminancia → paleta exacta"""
    px = ref.reshape(-1, 3).astype(float)
    L = lum(px)
    order = np.argsort(L)
    px, L = px[order], L[order]
    chunks = np.array_split(np.arange(len(L)), bins)
    cols = np.array([px[c].mean(0) for c in chunks])
    qs = np.array([L[c].mean() for c in chunks])
    return cols, L

def colorear(campo, ref):
    """ecualiza el campo a la distribución de luminancia de la foto y lo pinta con su paleta"""
    cols, Ls = rampa(ref)
    flat = campo.ravel()
    rank = np.argsort(np.argsort(flat)) / (len(flat) - 1)
    idx = np.clip((rank * (len(cols) - 1)), 0, len(cols) - 1)
    lo = np.floor(idx).astype(int); hi = np.minimum(lo + 1, len(cols) - 1); t = (idx - lo)[:, None]
    rgb = cols[lo] * (1 - t) + cols[hi] * t
    return rgb.reshape(campo.shape + (3,))

def estructura(box, n, k=6):
    """la foto escalada sin deformar (k veces) y repetida en espejo, para que no haya costuras"""
    c = a.crop(box); c = c.resize((c.width * k, c.height * k), Image.BICUBIC)
    m = Image.new('RGB', (c.width * 2, c.height * 2))
    m.paste(c, (0, 0)); m.paste(ImageOps.mirror(c), (c.width, 0))
    m.paste(ImageOps.flip(c), (0, c.height)); m.paste(ImageOps.flip(ImageOps.mirror(c)), (c.width, c.height))
    t = Image.new('RGB', (n, n))
    for y in range(0, n, m.height):
        for x in range(0, n, m.width): t.paste(m, (x, y))
    return lum(np.asarray(t).astype(float)) / 255

N = 512
# ---------- galletita de cacao ----------
ref_g = np.concatenate([np.asarray(a.crop((152, 336, 220, 348))).reshape(-1, 3),
                        np.asarray(a.crop((160, 291, 200, 302))).reshape(-1, 3)])
ref_g = ref_g[lum(ref_g.astype(float)) < 150]  # sin los trozos de maní
est = estructura((152, 336, 220, 348), N)
miga = ruido(N, 0.55, seed=1)          # miga fina
grumos = ruido(N, 1.1, seed=2)         # grumos medianos
poros = ruido(N, 0.35, seed=3)
campo = 0.3 * est + 0.4 * miga + 0.3 * grumos
campo -= 0.45 * np.clip((poros - 0.66) * 6, 0, 1)   # poros oscuros
# poros y migas sueltas, como la esponja de la galletita en la foto
from PIL import ImageDraw
capa = Image.new('L', (N, N), 128); dr = ImageDraw.Draw(capa)
for k in range(1400):
    x, y = rng.uniform(0, N, 2); r = rng.uniform(1.2, 3.8)
    oscuro = rng.random() < 0.7
    dr.ellipse([x - r * rng.uniform(.7, 1.3), y - r, x + r * rng.uniform(.7, 1.3), y + r], fill=int(rng.uniform(0, 40)) if oscuro else int(rng.uniform(200, 255)))
capa = np.asarray(capa.filter(ImageFilter.GaussianBlur(0.6))).astype(float) / 255
campo = campo + (capa - 0.5) * 0.9
rgb = colorear(campo, ref_g)
alto = campo.copy()
# trozos de maní con el color de la foto
mani = np.asarray(a.crop((160, 291, 200, 302))).reshape(-1, 3).astype(float)
mani = mani[lum(mani) > 190]
col_mani = mani.mean(0) if len(mani) else np.array([226, 190, 120])
col_mani = 0.4 * col_mani + 0.6 * np.array([228, 170, 104])
print('color maní de la foto', col_mani.round())
yy, xx = np.mgrid[0:N, 0:N]
ruido_chico = ruido(N, 0.8, seed=11)
for k in range(22):
    cx, cy = rng.uniform(0, N, 2)
    r = rng.uniform(8, 16)
    ang = rng.uniform(0, np.pi)
    dx = (xx - cx + N / 2) % N - N / 2; dy = (yy - cy + N / 2) % N - N / 2
    u = dx * np.cos(ang) + dy * np.sin(ang); v = -dx * np.sin(ang) + dy * np.cos(ang)
    th = np.arctan2(v, u)
    irregular = 1 + 0.08 * np.sin(th * 3 + k) + 0.06 * np.sin(th * 7 + 2 * k)
    d = np.sqrt((u / 1.4) ** 2 + v ** 2) / (r * irregular)
    m = np.clip((1 - d) * 4, 0, 1)
    sombra = 0.82 + 0.3 * np.clip(-v / r, -1, 1)   # luz desde arriba
    rgb = rgb * (1 - m[..., None]) + (col_mani * np.clip(sombra, .6, 1.1))[..., None].transpose(1, 2, 0) * m[..., None] if False else rgb * (1 - m[..., None]) + (col_mani[None, None, :] * np.clip(sombra, .6, 1.1)[..., None] * (0.82 + 0.3 * ruido_chico[..., None])) * m[..., None]
    grano = 0.85 + 0.3 * ruido_chico[..., None]
    alto = alto * (1 - m) + (0.9) * m
Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).save(OUT + 'galleta.webp', quality=90, method=6)
Image.fromarray((np.clip(alto, 0, 1) * 255).astype(np.uint8)).save(OUT + 'galleta-alto.webp', quality=88, method=6)

# ---------- relleno ----------
ref_r = np.asarray(a.crop((155, 310, 240, 326))).reshape(-1, 3)
est = estructura((155, 310, 240, 326), N)
vetas = ruido(N, 1.2, ax=5.0, ay=1.0, seed=5)   # estirado horizontal: arrastre del cuchillo
suave = ruido(N, 1.6, seed=6)
campo = 0.12 * est + 0.28 * vetas + 0.6 * suave
rgb = colorear(campo, ref_r)
# brillos finos como en la foto (vetas claras)
brillo = ruido(N, 1.0, ax=6.0, ay=1.0, seed=8)
lineas = np.exp(-((brillo - 0.55) / 0.018) ** 2)
lineas *= ruido(N, 1.3, seed=9) > 0.55
hl = np.asarray(a.crop((155, 310, 240, 326))).reshape(-1, 3).astype(float)
col_hl = hl[np.argsort(lum(hl))[-20:]].mean(0)
print('brillo relleno', col_hl.round())
rgb = rgb * (1 - 0.7 * lineas[..., None]) + col_hl * 0.7 * lineas[..., None]
Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).save(OUT + 'relleno.webp', quality=90, method=6)
Image.fromarray((np.clip(campo * 0.7 + lineas * 0.3, 0, 1) * 255).astype(np.uint8)).save(OUT + 'relleno-alto.webp', quality=88, method=6)

# vista previa
p = Image.new('RGB', (1024, 512))
p.paste(Image.open(OUT + 'galleta.webp').convert('RGB'), (0, 0))
p.paste(Image.open(OUT + 'relleno.webp').convert('RGB'), (512, 0))
p.save(sys.argv[1] if len(sys.argv) > 1 else '/tmp/prev.png')
