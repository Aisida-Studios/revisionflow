// src/components/illustrations/subjects/GlyphMark.jsx
// Draws one authentic letterform / notation mark from glyphs.js. Glyph paths are normalised to
// ~92 units tall, centred on (0,0); scale with `s`.
import React from 'react'
import { GLYPHS } from './glyphs'

export function GlyphMark({ x = 0, y = 0, s = 1, glyph, fill, opacity }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <path d={GLYPHS[glyph]} fill={fill} />
    </g>
  )
}
