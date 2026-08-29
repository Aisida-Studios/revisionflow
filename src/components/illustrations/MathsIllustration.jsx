// src/components/illustrations/MathsIllustration.jsx
import React from 'react'

export default function MathsIllustration({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of a line graph and geometry tools" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M60 70 L60 250 L262 250" stroke="var(--accent-light)" strokeWidth="2.6" />
        <path d="M60 210 C 110 210, 120 130, 160 130 C 200 130, 210 90, 262 76"
          stroke="var(--accent)" strokeWidth="4" />
        <circle cx="160" cy="130" r="7" fill="var(--accent-pale)" stroke="var(--accent)" strokeWidth="2.4" />
        <circle cx="262" cy="76" r="7" fill="var(--accent-pale)" stroke="var(--accent)" strokeWidth="2.4" />
        <g transform="translate(96,150)" opacity="0.85">
          <path d="M0 90 L36 10 L72 90" stroke="var(--accent-light)" strokeWidth="2.2" fill="var(--accent-pale)" fillOpacity="0.5" />
          <line x1="14" y1="60" x2="58" y2="60" stroke="var(--accent-light)" strokeWidth="2" />
          <circle cx="36" cy="10" r="4" fill="var(--accent-light)" />
        </g>
      </g>
    </svg>
  )
}
