// src/components/illustrations/HistoryIllustration.jsx
import React from 'react'

export default function HistoryIllustration({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of a rolled scroll" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="76" y="90" width="168" height="120" rx="6"
          fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="2.6" />
        <ellipse cx="76" cy="150" rx="16" ry="60" fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="2.6" />
        <ellipse cx="244" cy="150" rx="16" ry="60" fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="2.6" />
        <line x1="106" y1="118" x2="212" y2="118" stroke="var(--accent)" strokeWidth="1.6" opacity="0.5" />
        <line x1="106" y1="140" x2="212" y2="140" stroke="var(--accent)" strokeWidth="1.6" opacity="0.5" />
        <line x1="106" y1="162" x2="190" y2="162" stroke="var(--accent)" strokeWidth="1.6" opacity="0.5" />
        <line x1="106" y1="184" x2="212" y2="184" stroke="var(--accent)" strokeWidth="1.6" opacity="0.5" />
        <circle cx="160" cy="240" r="20" fill="var(--accent)" fillOpacity="0.3" stroke="var(--accent)" strokeWidth="2.2" />
        <path d="M150 240 L157 247 L172 232" stroke="var(--accent)" strokeWidth="2" />
      </g>
    </svg>
  )
}
