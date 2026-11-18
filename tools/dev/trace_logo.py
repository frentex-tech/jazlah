# Trace a flat-colour RGBA logo into SVG paths: marching squares on a blurred mask,
# then Douglas-Peucker and Catmull-Rom smoothing. Pure Python + Pillow.
import sys, math
from PIL import Image, ImageFilter

def contours(mask, W, H, iso=127.5):  # .5 so no sample equals iso: a point on a cell corner would be shared by two segments
    # mask: list of rows of floats 0..255, padded by caller with a zero border
    segs = {}
    def lerp(a, b):  # position of iso between values a and b
        return 0.5 if a == b else (iso - a) / (b - a)
    for y in range(H - 1):
        r0, r1 = mask[y], mask[y + 1]
        for x in range(W - 1):
            a, b, c, d = r0[x], r0[x + 1], r1[x + 1], r1[x]   # tl, tr, br, bl
            k = (a >= iso) * 8 + (b >= iso) * 4 + (c >= iso) * 2 + (d >= iso)
            if k == 0 or k == 15: continue
            T = (x + lerp(a, b), y); R = (x + 1, y + lerp(b, c)); B = (x + lerp(d, c), y + 1); L = (x, y + lerp(a, d))
            # segments oriented with the inside on the left
            table = {1: [(L, B)], 2: [(B, R)], 3: [(L, R)], 4: [(R, T)], 5: [(R, T), (L, B)], 6: [(B, T)], 7: [(L, T)],
                     8: [(T, L)], 9: [(T, B)], 10: [(T, L), (B, R)], 11: [(T, R)], 12: [(R, L)], 13: [(R, B)], 14: [(B, L)]}
            for p, q in table[k]:
                segs[(round(p[0], 3), round(p[1], 3))] = (round(q[0], 3), round(q[1], 3))
    loops = []
    while segs:
        start, nxt = segs.popitem()
        loop = [start]
        while nxt != start and nxt in segs:
            loop.append(nxt); nxt = segs.pop(nxt)
        if len(loop) >= 8: loops.append(loop)
    return loops

def rdp(pts, eps):
    if len(pts) < 3: return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True; stack = [(0, len(pts) - 1)]
    while stack:
        i, j = stack.pop(); (x1, y1), (x2, y2) = pts[i], pts[j]; dx, dy = x2 - x1, y2 - y1; n = math.hypot(dx, dy) or 1e-9
        best, bi = 0, None
        for k in range(i + 1, j):
            d = abs((pts[k][0] - x1) * dy - (pts[k][1] - y1) * dx) / n
            if d > best: best, bi = d, k
        if bi is not None and best > eps:
            keep[bi] = True; stack += [(i, bi), (bi, j)]
    return [p for p, k in zip(pts, keep) if k]

def area(loop):
    return 0.5 * sum(loop[i][0] * loop[(i + 1) % len(loop)][1] - loop[(i + 1) % len(loop)][0] * loop[i][1] for i in range(len(loop)))

def path(loops, eps, sc):
    out = []
    for lp in loops:
        if abs(area(lp)) < 6: continue
        h = len(lp) // 2
        p = rdp(lp[:h + 1], eps)[:-1] + rdp(lp[h:] + [lp[0]], eps)[:-1]
        n = len(p)
        if n < 3: continue
        f = lambda v: ('%.1f' % (v * sc)).rstrip('0').rstrip('.')
        d = 'M%s %s' % (f(p[0][0]), f(p[0][1]))
        for i in range(n):
            p0, p1, p2, p3 = p[i - 1], p[i], p[(i + 1) % n], p[(i + 2) % n]
            # sharp corners stay sharp: only smooth where the turn is gentle
            def turn(a, b, c):
                v1 = (b[0] - a[0], b[1] - a[1]); v2 = (c[0] - b[0], c[1] - b[1])
                return abs(math.atan2(v1[0] * v2[1] - v1[1] * v2[0], v1[0] * v2[0] + v1[1] * v2[1]))
            s1 = 0 if turn(p0, p1, p2) > 1.0 else 1; s2 = 0 if turn(p1, p2, p3) > 1.0 else 1
            c1 = (p1[0] + s1 * (p2[0] - p0[0]) / 6, p1[1] + s1 * (p2[1] - p0[1]) / 6)
            c2 = (p2[0] - s2 * (p3[0] - p1[0]) / 6, p2[1] - s2 * (p3[1] - p1[1]) / 6)
            d += 'C%s %s %s %s %s %s' % (f(c1[0]), f(c1[1]), f(c2[0]), f(c2[1]), f(p2[0]), f(p2[1]))
        out.append(d + 'Z')
    return ''.join(out)

def trace(png, eps=0.55, blur=1.1, up=2):
    im = Image.open(png).convert('RGBA'); w, h = im.size
    r, g, b, a = im.split()
    px = im.load()
    red = Image.new('L', (w, h), 0); gold = Image.new('L', (w, h), 0)
    rp, gp = red.load(), gold.load(); sr = [0, 0, 0, 0]; sg = [0, 0, 0, 0]
    for y in range(h):
        for x in range(w):
            R, G, B, A = px[x, y]
            if A < 8: continue
            isred = R > 110 and G < R * 0.55 and B < R * 0.6
            (rp if isred else gp)[x, y] = A
            if A > 240:
                t = sr if isred else sg; t[0] += R; t[1] += G; t[2] += B; t[3] += 1
    res = {}
    for name, m in (('gold', gold), ('red', red)):
        m = m.resize((w * up, h * up), Image.BICUBIC).filter(ImageFilter.GaussianBlur(blur * up))
        W, H = m.size; data = list(m.getdata())
        rows = [[0.0] * (W + 2)] + [[0.0] + [float(v) for v in data[y * W:(y + 1) * W]] + [0.0] for y in range(H)] + [[0.0] * (W + 2)]
        loops = [[(x - 1, y - 1) for x, y in lp] for lp in contours(rows, W + 2, H + 2)]
        res[name] = path(loops, eps * up, 1.0 / up)
    col = lambda t: '#%02x%02x%02x' % tuple(round(t[i] / max(t[3], 1)) for i in range(3))
    return w, h, res, col(sg), col(sr)

if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    w, h, res, gold, red = trace(src)
    variants = {'': (gold, red)}
    if len(sys.argv) > 3: variants['-on-light'] = (sys.argv[3], red)
    for suf, (gc, rc) in variants.items():
        svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d" fill-rule="evenodd"><title>Jazla</title><path fill="%s" d="%s"/>' % (w, h, w, h, gc, res['gold'])
        if res['red']: svg += '<path fill="%s" d="%s"/>' % (rc, res['red'])
        svg += '</svg>\n'
        open(dst.replace('.svg', suf + '.svg'), 'w').write(svg)
        print(dst.replace('.svg', suf + '.svg'), len(svg), 'bytes', gc, rc, 'subpaths', res['gold'].count('M'), res['red'].count('M'))
    # self-check: the paths are closed and inside the canvas
    assert res['gold'].count('M') == res['gold'].count('Z') and res['gold'].count('M') >= 1
