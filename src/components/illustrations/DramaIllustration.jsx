// src/components/illustrations/DramaIllustration.jsx
import React from 'react'

export default function DramaIllustration({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of theatre masks" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="118" cy="164" rx="62" ry="80" fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="3" />
        <circle cx="94" cy="138" r="7" fill="var(--accent)" />
        <circle cx="142" cy="138" r="7" fill="var(--accent)" />
        <path d="M86 196 Q118 172 150 196" stroke="var(--accent)" strokeWidth="2.6" />
        <ellipse cx="216" cy="188" rx="62" ry="80" fill="var(--accent)" fillOpacity="0.22" stroke="var(--accent)" strokeWidth="3" />
        <circle cx="192" cy="162" r="7" fill="var(--accent)" />
        <circle cx="240" cy="162" r="7" fill="var(--accent)" />
        <path d="M184 224 Q216 250 248 224" stroke="var(--accent)" strokeWidth="2.6" />
      </g>
    </svg>
  )
}
