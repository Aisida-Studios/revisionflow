// src/components/illustrations/MediaIllustration.jsx
import React from 'react'

export default function MediaIllustration({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of a film clapperboard and camera" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="60" y="120" width="150" height="110" rx="8" fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="3" />
        <path d="M60 120 L96 80 L226 80 L210 120 Z" fill="var(--accent)" fillOpacity="0.22" stroke="var(--accent)" strokeWidth="3" />
        <line x1="112" y1="80" x2="96" y2="120" stroke="var(--accent)" strokeWidth="3" />
        <line x1="150" y1="80" x2="134" y2="120" stroke="var(--accent)" strokeWidth="3" />
        <line x1="188" y1="80" x2="172" y2="120" stroke="var(--accent)" strokeWidth="3" />
        <circle cx="252" cy="200" r="34" fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="3" />
        <circle cx="252" cy="200" r="15" fill="var(--accent)" fillOpacity="0.3" stroke="var(--accent)" strokeWidth="2" />
        <rect x="230" y="168" width="44" height="14" rx="4" fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="2.2" />
      </g>
    </svg>
  )
}
