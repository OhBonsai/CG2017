# -*- coding:utf-8 -*- 
# Created by Bonsai on 17-1-18.^_^
# python3.4
import json
import sys
from functools import reduce

# □ □ □ □ □ □ □ ■ □ □ □ □ □ □ □ □
# □ □ □ □ □ □ □ ■ □ □ □ □ □ □ □ □
# □ □ □ □ □ □ □ ■ □ □ ■ □ □ □ □ □
# □ □ □ □ □ ■ □ ■ □ □ □ ■ □ □ □ □
# □ □ □ ■ ■ □ □ ■ □ □ □ □ □ □ □ □
# □ □ □ □ ■ □ □ ■ □ ■ ■ ■ □ □ □ □
# □ □ □ □ ■ ■ ■ ■ ■ □ □ □ □ □ □ □
# □ □ ■ ■ ■ □ □ □ ■ □ □ ■ □ □ □ □
# □ □ □ □ ■ □ ■ □ ■ □ ■ □ □ □ □ □
# □ □ □ □ ■ ■ □ □ □ ■ □ □ □ □ □ □
# □ □ ■ ■ ■ □ □ □ ■ ■ □ □ □ □ □ □
# ■ ■ □ □ ■ □ ■ ■ □ □ ■ □ □ ■ □ □
# □ □ □ ■ ■ □ □ □ □ □ □ ■ □ ■ □ □
# □ □ □ □ ■ □ □ □ □ □ □ □ ■ ■ □ □
# □ □ □ □ □ □ □ □ □ □ □ □ □ ■ □ □
# □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □

# 0000000100000000
# 0000000100000000
# 0000000100100000
# 0000010100010000
# 0001100100000000
# 0000100101110000
# 0000111110000000
# 0011100010010000
# 0000101010100000
# 0000110001000000
# 0011100011000000
# 1100101100100100
# 0001100000010100
# 0000100000001100
# 0000000000000100
# 0000000000000000

# 0x100
# 0x100
# 0x120
# 0x510
# 0x1900
# 0x970
# 0xf80
# 0x3890

# 0xaa0
# 0xc40
# 0x38c0
# 0xcb24
# 0x1814
# 0x80c
# 0x4
# 0x0


# uvec4 hanzi_top = [0x01000100, 0x01200510, 0x19000970, 0x0f903890]
# uvec4 hanzi_bottom = [0x0aa00c40, 0x38c0cb24, 0x1814080c, 0x00040000]


han_zi = '我'
PER_SIZE = 16
code_dict = json.load(open('code.json', 'r'))
code = code_dict[han_zi]

area_code = int(str(code)[0:2])
index_code = int(str(code)[2:])
off = (94 * (area_code - 1) + (index_code - 1)) * int(PER_SIZE * PER_SIZE / 8)

with open('hzk16k', 'rb') as f:
    f.seek(off)
    han_zi_blob = f.read(int(PER_SIZE * PER_SIZE / 8))

for i in range(0, 32, 4):
    t = han_zi_blob[i:i + 4]
    if t == b'':
        continue
    v = reduce(lambda x, y: x << 8 | y, t)
    print((hex(v)))


for i in range(0, PER_SIZE * PER_SIZE, int(PER_SIZE / 8)):
    t = han_zi_blob[i:i + int(PER_SIZE / 8)]
    if t == b'':
        continue
    v = reduce(lambda x, y: x << 8 | y, t)
    for j in range(PER_SIZE-1, -1, -1):
        if v >> j & 1:
            sys.stdout.write('■ ')
        else:
            sys.stdout.write('□ ')
    print()
