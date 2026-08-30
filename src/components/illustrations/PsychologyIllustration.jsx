// src/components/illustrations/PsychologyIllustration.jsx
import React from 'react'

export default function PsychologyIllustration({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of a head in profile with a thought spiral" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M120 240 C 80 232, 60 190, 66 150 C 70 118, 96 92, 130 82
             C 128 70, 138 60, 150 62 C 148 72, 152 78, 160 78
             C 190 80, 216 104, 222 136 C 234 138, 242 148, 240 160
             C 238 170, 228 174, 220 172 C 220 196, 204 218, 180 228
             L 182 250 L 160 250 L 156 232 C 144 234, 130 238, 120 240 Z"
          fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="3"
        />
        <path
          d="M140 140 C 140 128, 150 122, 158 128 C 166 134, 162 144, 154 144
             C 148 144, 146 138, 150 136"
          stroke="var(--accent)" strokeWidth="2.4" opacity="0.75"
        />
        <circle cx="200" cy="128" r="3" fill="var(--accent)" opacity="0.6" />
      </g>
    </svg>
  )
}
