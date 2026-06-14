#!/usr/bin/env python3
"""Rasterize the body-map SVG geometry to a PNG for visual verification.
Approximates the same shapes used in app.js (paths treated as trapezoids)."""
import struct, zlib, os

GRAY = (57, 65, 79)
ACC = (76, 201, 176)
BG = (24, 27, 34)
W, H = 100, 205


def write_png(path, width, height, px):
    raw = bytearray()
    for row in px:
        raw.append(0)
        for (r, g, b) in row:
            raw += bytes((r, g, b))
    def chunk(t, d):
        return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        f.write(chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)))
        f.write(chunk(b'IDAT', zlib.compress(bytes(raw), 9)))
        f.write(chunk(b'IEND', b''))


def circle(cx, cy, r):
    return lambda x, y: (x - cx) ** 2 + (y - cy) ** 2 <= r * r

def ellipse(cx, cy, rx, ry):
    return lambda x, y: ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1

def rect(x0, y0, w, h):
    return lambda x, y: x0 <= x <= x0 + w and y0 <= y <= y0 + h

def trap(x_top0, x_top1, y0, x_bot0, x_bot1, y1):
    def f(x, y):
        if y < y0 or y > y1:
            return False
        t = (y - y0) / (y1 - y0)
        xl = x_top0 + (x_bot0 - x_top0) * t
        xr = x_top1 + (x_bot1 - x_top1) * t
        return xl <= x <= xr
    return f


BASE = [
    circle(50, 18, 11), rect(44, 27, 12, 7),
    trap(31, 69, 38, 37, 63, 95),         # torso
    circle(30, 40, 9), circle(70, 40, 9),  # delts
    rect(18, 44, 11, 34), rect(71, 44, 11, 34),  # upper arms
    rect(17, 76, 10, 32), rect(73, 76, 10, 32),  # forearms
    trap(37, 63, 94, 40, 60, 113),         # pelvis
    rect(36, 110, 12, 48), rect(52, 110, 12, 48),  # thighs
    rect(37, 155, 10, 44), rect(53, 155, 10, 44),  # shins
]

MUSCLES = {
    'chest': [ellipse(42, 52, 8, 7), ellipse(58, 52, 8, 7)],
    'frontdelt': [circle(30, 40, 8), circle(70, 40, 8)],
    'sidedelt': [circle(28, 42, 8), circle(72, 42, 8)],
    'reardelt': [circle(30, 40, 8), circle(70, 40, 8)],
    'biceps': [ellipse(22, 58, 5, 10), ellipse(78, 58, 5, 10)],
    'triceps': [ellipse(22, 58, 5, 11), ellipse(78, 58, 5, 11)],
    'forearm': [ellipse(21, 90, 5, 12), ellipse(79, 90, 5, 12)],
    'midback': [ellipse(50, 57, 13, 9)],
    'lats': [ellipse(39, 66, 7, 14), ellipse(61, 66, 7, 14)],
    'quads': [ellipse(42, 130, 6, 18), ellipse(58, 130, 6, 18)],
    'hamstrings': [ellipse(42, 132, 6, 18), ellipse(58, 132, 6, 18)],
    'glutes': [ellipse(44, 104, 8, 8), ellipse(56, 104, 8, 8)],
    'calves': [ellipse(42, 176, 5, 14), ellipse(58, 176, 5, 14)],
}


def render(muscles, gap, ox):
    """draw one figure into a column-region buffer (returns per-row list)."""
    hl = []
    for m in muscles:
        hl += MUSCLES[m]
    fig = [[None] * W for _ in range(H)]
    for y in range(H):
        for x in range(W):
            c = None
            if any(f(x, y) for f in BASE):
                c = GRAY
            if any(f(x, y) for f in hl):
                c = ACC
            fig[y][x] = c
    return fig


def main():
    sets = [
        ['chest', 'frontdelt'], ['sidedelt'], ['triceps'],
        ['lats', 'midback'], ['quads', 'glutes'], ['hamstrings'], ['calves'],
    ]
    pad = 8
    col_w = W + pad
    total_w = col_w * len(sets) + pad
    canvas = [[BG for _ in range(total_w)] for _ in range(H + 2 * pad)]
    for i, ms in enumerate(sets):
        fig = render(ms, pad, 0)
        ox = pad + i * col_w
        for y in range(H):
            for x in range(W):
                c = fig[y][x]
                if c:
                    canvas[y + pad][ox + x] = c
    out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'tools', 'body_preview.png')
    write_png(out, total_w, H + 2 * pad, canvas)
    print('wrote', out, total_w, 'x', H + 2 * pad)


if __name__ == '__main__':
    main()
