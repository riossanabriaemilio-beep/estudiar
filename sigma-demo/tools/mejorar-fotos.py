"""Mejora de resolución x4 con Real-ESRGAN (ncnn, en CPU), por bloques."""
import sys, time, numpy as np, ncnn
from PIL import Image
net = ncnn.Net(); net.opt.use_vulkan_compute = False; net.opt.num_threads = 8
net.load_param('models/realesrgan-x4plus.param'); net.load_model('models/realesrgan-x4plus.bin')
def sr(img, tile=160, pad=12):
    a = np.asarray(img.convert('RGB')).astype(np.float32) / 255
    H, W, _ = a.shape; S = 4
    out = np.zeros((H * S, W * S, 3), np.float32)
    for y in range(0, H, tile):
        for x in range(0, W, tile):
            y0, x0 = max(0, y - pad), max(0, x - pad)
            y1, x1 = min(H, y + tile + pad), min(W, x + tile + pad)
            blk = np.ascontiguousarray(a[y0:y1, x0:x1].transpose(2, 0, 1))
            ex = net.create_extractor()
            ex.input('data', ncnn.Mat(blk))
            _, o = ex.extract('output')
            o = np.array(o).transpose(1, 2, 0)
            ty, tx = (y - y0) * S, (x - x0) * S
            hh, ww = min(tile, H - y) * S, min(tile, W - x) * S
            out[y * S:y * S + hh, x * S:x * S + ww] = o[ty:ty + hh, tx:tx + ww]
    return Image.fromarray((np.clip(out, 0, 1) * 255 + .5).astype(np.uint8))
if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    t = time.time(); im = Image.open(src)
    alpha = im.getchannel('A') if im.mode == 'RGBA' else None
    o = sr(im)
    if alpha is not None: o.putalpha(alpha.resize(o.size, Image.LANCZOS))
    o.save(dst); print(src, im.size, '->', o.size, round(time.time() - t, 1), 's')
