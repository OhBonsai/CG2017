# -*- coding:utf-8 -*- 
# Created by Bonsai on 17-3-21.^_^
from PIL import Image
import json
import math
from construct import *

r"""
DEV_ENV: python2.7
REQUIREMENT: Pillow, construct2.8.2+

this script for generate chinese texture.
hzk16k is texture binary file, you can replace it to get other awesome font.
But you should change script little if the font you use which isn't 16*16 lattice font file.

in: chinese letters

exports:
    1. texture.png
    2. splice.json stores each letter position in format(left-top-x, left-top-y, width, height)
"""

what_i_say = u'明知道伤心总是难免的，在每一个梦醒时分。明知道爱情总是难舍难分，何必在意那一点点温存！'

s = Pointer(
    this.off, Bitwise(Array(256, BitsInteger(1)))
)
s1 = Bitwise(Array(288, BitsInteger(1)))
map = json.load(open('code.json', 'r'))
font_stream = open('hzk16k', 'rb')
blob = b''
with open('hzk16k', 'rb') as f:
    blob = f.read()

word_set = []
for i in xrange(0, len(what_i_say)):
    if what_i_say != '':
        word_set.append(what_i_say[i])
word_set = list(set(word_set))

size = int(math.ceil(math.sqrt(len(what_i_say))))
# texture_side_length should be power of two
length = 0
exponnent = 0
while length < size * 16:
    exponnent += 1
    length = 2 ** exponnent

texture = Image.new('RGBA', (length, length), (255, 255, 255, 0))
pixels = texture.load()

splice = {}
for i, word in enumerate(word_set):
    code = map[word]
    area_code = int(str(code)[:-2])
    index_code = int(str(code)[-2:])
    off = (94 * (area_code - 1) + (index_code - 1)) * 32

    bit_list = list(s.parse(blob, context=Container(off=off)))

    pixel_start_x_pos = i % size
    pixel_start_y_pos = int(i / size)

    for idx, value in enumerate(bit_list):
        x_off = idx % 16
        y_off = int(idx / 16)
        x_pos = pixel_start_x_pos * 16 + x_off
        y_pos = pixel_start_y_pos * 16 + y_off
        # white
        if value == 1:
            pixels[x_pos, y_pos] = (255, 255, 255, 255)
            # pixels[x_pos, y_pos] = (0, 0, 0, 255)

    # left top width height
    splice[word] = ((i % size) / 1.0 / (length / 16),
                    (i / size) / 1.0 / (length / 16),
                    1.0 / (length / 16),
                    1.0 / (length / 16))

json.dump(splice, open('splice.json', 'w'))
texture.save('texture.png')