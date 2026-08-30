// src/components/illustrations/EnvironmentalScienceIllustration.jsx
import React from 'react'

export default function EnvironmentalScienceIllustration({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of a leaf and a sprout" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M160 60 C 220 80, 240 150, 200 210 C 180 240, 140 250, 110 232
             C 130 210, 140 180, 138 150 C 136 116, 145 84, 160 60 Z"
          fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="3"
        />
        <path d="M160 76 C 155 120, 150 170, 118 226" stroke="var(--accent)" strokeWidth="2" opacity="0.6" />
        <path d="M148 120 Q168 116 182 128" stroke="var(--accent)" strokeWidth="1.6" opacity="0.5" />
        <path d="M140 160 Q162 156 178 168" stroke="var(--accent)" strokeWidth="1.6" opacity="0.5" />
        <path d="M90 260 Q160 274 230 260" stroke="var(--accent-light)" strokeWidth="2" opacity="0.4" />
        <path d="M150 260 C 148 240, 155 226, 168 220" stroke="var(--accent)" strokeWidth="3" />
        <path d="M168 220 C 182 214, 192 220, 192 230 C 180 234, 170 230, 168 220 Z"
          fill="var(--accent)" fillOpacity="0.3" stroke="var(--accent)" strokeWidth="2" />
      </g>
    </svg>
  )
}
