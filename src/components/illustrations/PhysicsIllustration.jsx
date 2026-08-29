// src/components/illustrations/PhysicsIllustration.jsx
import React from 'react'

export default function PhysicsIllustration({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of an atom" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g transform="translate(160,160)">
          <ellipse rx="120" ry="46" stroke="var(--accent-light)" strokeWidth="2" opacity="0.7" />
          <ellipse rx="120" ry="46" stroke="var(--accent-light)" strokeWidth="2" opacity="0.7" transform="rotate(60)" />
          <ellipse rx="120" ry="46" stroke="var(--accent-light)" strokeWidth="2" opacity="0.7" transform="rotate(120)" />
          <circle r="18" fill="var(--accent)" fillOpacity="0.25" stroke="var(--accent)" strokeWidth="2.6" />
          <circle cx="120" cy="0" r="10" fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="2" />
          <circle cx="-60" cy="39" r="10" fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="2" />
          <circle cx="-60" cy="-39" r="10" fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="2" />
        </g>
      </g>
    </svg>
  )
}
