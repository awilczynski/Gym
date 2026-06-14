#!/usr/bin/env python3
"""Generate PNG app icons (no external deps).

Draws a simple dumbbell glyph on a dark rounded background.
Outputs: icons/icon-192.png, icon-512.png, icon-512-maskable.png
"""
import struct
import zlib
import os

BG = (15, 17, 21)          # #0f1115
PLATE = (76, 201, 176)     # accent #4cc9b0
BAR = (232, 234, 237)      # light bar


def write_png(path, width, height, pixels):
    """pixels: list of rows, each row list of (r,g,b)."""
    raw = bytearray()
    for row in pixels:
        raw.append(0)  # filter type 0
        for (r, g, b) in row:
            raw += bytes((r, g, b))

    def chunk(typ, data):
        c = struct.pack('>I', len(data)) + typ + data
        c += struct.pack('>I', zlib.crc32(typ + data) & 0xffffffff)
        return c

    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)  # 8-bit RGB
    idat = zlib.compress(bytes(raw), 9)
    with open(path, 'wb') as f:
        f.write(sig)
        f.write(chunk(b'IHDR', ihdr))
        f.write(chunk(b'IDAT', idat))
        f.write(chunk(b'IEND', b''))


def make(size, maskable=False):
    px = [[BG for _ in range(size)] for _ in range(size)]

    # rounded corners (skip for maskable -> full bleed background)
    radius = 0 if maskable else int(size * 0.18)

    def in_rounded(x, y):
        if radius == 0:
            return True
        for (cx, cy) in ((radius, radius), (size - radius, radius),
                         (radius, size - radius), (size - radius, size - radius)):
            if ((x < radius and y < radius) or (x >= size - radius and y < radius) or
                    (x < radius and y >= size - radius) or (x >= size - radius and y >= size - radius)):
                pass
        # check each corner region
        if x < radius and y < radius:
            return (x - radius) ** 2 + (y - radius) ** 2 <= radius ** 2
        if x >= size - radius and y < radius:
            return (x - (size - radius)) ** 2 + (y - radius) ** 2 <= radius ** 2
        if x < radius and y >= size - radius:
            return (x - radius) ** 2 + (y - (size - radius)) ** 2 <= radius ** 2
        if x >= size - radius and y >= size - radius:
            return (x - (size - radius)) ** 2 + (y - (size - radius)) ** 2 <= radius ** 2
        return True

    # safe-zone scaling: for maskable, draw glyph smaller (inside 80% center)
    scale = 0.62 if maskable else 0.74
    cx, cy = size / 2, size / 2
    half_w = size * scale / 2  # half overall dumbbell width

    bar_h = size * 0.085
    plate_w = size * 0.085
    inner_plate_w = size * 0.06
    plate_h = size * 0.40
    inner_plate_h = size * 0.30

    bar_x0, bar_x1 = cx - half_w, cx + half_w
    bar_y0, bar_y1 = cy - bar_h / 2, cy + bar_h / 2

    # plate rectangles (outer + inner) on both sides
    def rect(x, y, w, h):
        return (x - w / 2, x + w / 2, y - h / 2, y + h / 2)

    outer_l = rect(bar_x0 + plate_w / 2, cy, plate_w, plate_h)
    inner_l = rect(bar_x0 + plate_w + inner_plate_w / 2, cy, inner_plate_w, inner_plate_h)
    outer_r = rect(bar_x1 - plate_w / 2, cy, plate_w, plate_h)
    inner_r = rect(bar_x1 - plate_w - inner_plate_w / 2, cy, inner_plate_w, inner_plate_h)

    def inside(rc, x, y):
        return rc[0] <= x <= rc[1] and rc[2] <= y <= rc[3]

    for y in range(size):
        for x in range(size):
            if not in_rounded(x, y):
                continue  # leave transparent? we use opaque RGB; keep BG-ish
            color = None
            if inside(outer_l, x, y) or inside(outer_r, x, y) or inside(inner_l, x, y) or inside(inner_r, x, y):
                color = PLATE
            elif bar_x0 <= x <= bar_x1 and bar_y0 <= y <= bar_y1:
                color = BAR
            if color:
                px[y][x] = color
    return px


def main():
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    icons_dir = os.path.join(here, 'icons')
    os.makedirs(icons_dir, exist_ok=True)

    for size in (192, 512):
        write_png(os.path.join(icons_dir, f'icon-{size}.png'), size, size, make(size))
        print(f'wrote icon-{size}.png')
    write_png(os.path.join(icons_dir, 'icon-512-maskable.png'), 512, 512, make(512, maskable=True))
    print('wrote icon-512-maskable.png')


if __name__ == '__main__':
    main()
