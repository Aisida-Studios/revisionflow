// src/components/illustrations/BusinessIllustration.jsx
import React from 'react'

export default function BusinessIllustration({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of a bar chart and coins" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <line x1="70" y1="240" x2="70" y2="90" stroke="var(--accent-light)" strokeWidth="2" opacity="0.5" />
        <line x1="70" y1="240" x2="220" y2="240" stroke="var(--accent-light)" strokeWidth="2" opacity="0.5" />
        <rect x="90" y="180" width="26" height="60" rx="4" fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="2.4" />
        <rect x="128" y="150" width="26" height="90" rx="4" fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="2.4" />
        <rect x="166" y="115" width="26" height="125" rx="4" fill="var(--accent)" fillOpacity="0.25" stroke="var(--accent)" strokeWidth="2.4" />
        <path d="M96 132 L134 100 L172 118 L206 78" stroke="var(--accent)" strokeWidth="2.6" />
        <path d="M188 78 L206 78 L206 96" stroke="var(--accent)" strokeWidth="2.6" />
        <circle cx="248" cy="220" r="20" fill="var(--gold)" fillOpacity="0.3" stroke="var(--gold)" strokeWidth="2.2" />
        <circle cx="236" cy="234" r="20" fill="var(--gold)" fillOpacity="0.45" stroke="var(--gold)" strokeWidth="2.2" />
      </g>
    </svg>
  )
}
