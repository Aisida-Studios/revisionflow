// src/components/illustrations/MusicIllustration.jsx
import React from 'react'

export default function MusicIllustration({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of musical notes" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <line x1="120" y1="200" x2="120" y2="90" stroke="var(--accent)" strokeWidth="4" />
        <line x1="210" y1="180" x2="210" y2="70" stroke="var(--accent)" strokeWidth="4" />
        <path d="M120 90 L210 70" stroke="var(--accent)" strokeWidth="8" />
        <ellipse cx="98" cy="212" rx="26" ry="19" transform="rotate(-18 98 212)"
          fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="3" />
        <ellipse cx="188" cy="192" rx="26" ry="19" transform="rotate(-18 188 192)"
          fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="3" />
        <path d="M210 70 C 240 78, 250 96, 236 112" stroke="var(--accent-light)" strokeWidth="2.6" opacity="0.7" />
      </g>
    </svg>
  )
}
