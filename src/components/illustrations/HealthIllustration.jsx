// src/components/illustrations/HealthIllustration.jsx
import React from 'react'

export default function HealthIllustration({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of a heart with a pulse line" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M160 220 C 100 180, 66 148, 66 110 C 66 84, 86 66, 110 66
             C 130 66, 148 78, 160 96 C 172 78, 190 66, 210 66
             C 234 66, 254 84, 254 110 C 254 148, 220 180, 160 220 Z"
          fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="3"
        />
        <path d="M84 128 L120 128 L136 100 L152 156 L168 118 L180 128 L236 128"
          stroke="var(--accent)" strokeWidth="3" fill="none" />
      </g>
    </svg>
  )
}
