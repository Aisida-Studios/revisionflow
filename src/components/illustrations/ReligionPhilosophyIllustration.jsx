// src/components/illustrations/ReligionPhilosophyIllustration.jsx
import React from 'react'

export default function ReligionPhilosophyIllustration({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of a candle and an open book" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M150 90 C 158 74, 172 74, 180 90 C 188 106, 172 118, 165 130 C 158 118, 142 106, 150 90 Z"
          fill="var(--gold)" fillOpacity="0.6" stroke="var(--gold)" strokeWidth="2"
        />
        <rect x="146" y="128" width="28" height="90" rx="6" fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="2.6" />
        <line x1="146" y1="150" x2="174" y2="150" stroke="var(--accent-light)" strokeWidth="1.6" opacity="0.5" />
        <path
          d="M70 250 C 100 236, 140 234, 160 244 C 180 234, 220 236, 250 250 L250 260
             C 220 246, 180 244, 160 254 C 140 244, 100 246, 70 260 Z"
          fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="2.6"
        />
        <line x1="160" y1="244" x2="160" y2="254" stroke="var(--accent-light)" strokeWidth="1.6" opacity="0.5" />
      </g>
    </svg>
  )
}
