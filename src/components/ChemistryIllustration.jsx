// src/components/illustrations/ChemistryIllustration.jsx
// Same pattern as CellIllustration/SeedlingIllustration — inline SVG using CSS
// variables so it adapts to dark mode, { size, style } prop shape.
import React from 'react'

export default function ChemistryIllustration({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of a chemistry flask" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M170 46 L170 116 L100 236 Q88 260 118 260 L246 260 Q276 260 264 236 L194 116 L194 46 Z"
          fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="3"
        />
        <path
          d="M112 248 Q182 220 252 248 L246 236 Q182 210 118 236 Z"
          fill="var(--accent)" fillOpacity="0.25" stroke="var(--accent)" strokeWidth="2"
        />
        <line x1="148" y1="46" x2="216" y2="46" stroke="var(--accent-light)" strokeWidth="2.4" />
        <circle cx="168" cy="198" r="6" fill="var(--accent)" opacity="0.6" />
        <circle cx="206" cy="216" r="4.5" fill="var(--accent)" opacity="0.6" />
        <circle cx="188" cy="180" r="4" fill="var(--accent)" opacity="0.6" />
        <circle cx="252" cy="112" r="8" stroke="var(--accent-light)" strokeWidth="1.8" />
        <circle cx="280" cy="88" r="6" stroke="var(--accent-light)" strokeWidth="1.8" />
        <line x1="258" y1="105" x2="276" y2="92" stroke="var(--accent-light)" strokeWidth="1.6" />
      </g>
    </svg>
  )
}
