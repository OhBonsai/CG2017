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

def generate_lattice(code, f_stream):
    area_code = int(str(code)[0:2])
    index_code = int(str(code)[2:])
    off = (94 * (area_code - 1) + (index_code - 1)) * 32

    f_stream.seek(off)
    cur_blob = f_stream.read(32)
    lattice = []

    for i in range(0, 32, 4):
        bit32 = cur_blob[i: i+4]
        if bit32 == b'':
            continue
        int_v = reduce(lambda x, y: x << 8 | y, bit32)
        str_v = str(hex(int_v))
        attach_0_str = ''
        for j in range(10 - len(str_v)):
            attach_0_str += '0'
        str_v = str_v[:2] + attach_0_str + str_v[2:]
        # int_v = int(str_v, 16)
        lattice.append(str_v)

    return lattice


code_dict = json.load(open('code.json', 'r'))
result = {}
with open('hzk16k', 'rb') as f:
    for k in code_dict:
        result[k] = generate_lattice(code_dict[k], f)

print(result['爱'])


