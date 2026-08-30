// src/components/illustrations/ArtIllustration.jsx
import React from 'react'

export default function ArtIllustration({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of an artist's palette" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M160 56 C 226 56, 274 100, 274 158 C 274 202, 244 210, 216 202
             C 198 196, 200 176, 214 172 C 230 168, 232 150, 216 144
             C 150 150, 90 190, 90 230 C 46 210, 46 130, 90 90 C 108 72, 132 56, 160 56 Z"
          fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="3"
        />
        <circle cx="120" cy="120" r="11" fill="var(--accent)" opacity="0.5" />
        <circle cx="100" cy="160" r="11" fill="var(--accent)" opacity="0.35" />
        <circle cx="140" cy="180" r="10" fill="var(--accent)" opacity="0.25" />
        <circle cx="170" cy="100" r="10" fill="var(--accent)" opacity="0.4" />
        <path d="M232 214 L268 250" stroke="var(--accent-light)" strokeWidth="4" />
        <ellipse cx="276" cy="258" rx="14" ry="8" transform="rotate(45 276 258)" fill="var(--accent)" fillOpacity="0.3" stroke="var(--accent)" strokeWidth="2" />
      </g>
    </svg>
  )
}
