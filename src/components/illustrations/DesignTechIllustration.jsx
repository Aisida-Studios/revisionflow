// src/components/illustrations/DesignTechIllustration.jsx
import React from 'react'

export default function DesignTechIllustration({ size = 160, style = {} }) {
  const teeth = Array.from({ length: 8 }, (_, i) => i * 45)
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of a gear, pencil and ruler" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g transform="translate(140,140)">
          {teeth.map(a => (
            <rect key={a} x="-7" y="-58" width="14" height="16" rx="2" fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="1.8" transform={`rotate(${a})`} />
          ))}
          <circle r="46" fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="3" />
          <circle r="16" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="2.6" />
        </g>
        <g transform="translate(190,190) rotate(35)">
          <rect x="0" y="0" width="16" height="90" rx="2" fill="var(--accent)" fillOpacity="0.25" stroke="var(--accent)" strokeWidth="2.4" />
          <path d="M0 90 L8 108 L16 90 Z" fill="var(--accent)" fillOpacity="0.25" stroke="var(--accent)" strokeWidth="2.4" />
        </g>
      </g>
    </svg>
  )
}
