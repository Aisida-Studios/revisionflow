// src/components/illustrations/GeographyIllustration.jsx
import React from 'react'

export default function GeographyIllustration({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of a globe and mountain" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="140" cy="140" r="92" fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="3" />
        <ellipse cx="140" cy="140" rx="92" ry="34" stroke="var(--accent)" strokeWidth="1.4" opacity="0.5" />
        <line x1="48" y1="140" x2="232" y2="140" stroke="var(--accent)" strokeWidth="1.4" opacity="0.5" />
        <path d="M140 48 C 100 90, 100 190, 140 232" stroke="var(--accent)" strokeWidth="1.4" opacity="0.5" />
        <path d="M140 48 C 180 90, 180 190, 140 232" stroke="var(--accent)" strokeWidth="1.4" opacity="0.5" />
        <path
          d="M150 260 L214 150 L246 200 L280 150 L294 260 Z"
          fill="var(--accent)" fillOpacity="0.25" stroke="var(--accent)" strokeWidth="2.6"
        />
        <path d="M214 150 L228 172 L200 172 Z" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.6" />
      </g>
    </svg>
  )
}
