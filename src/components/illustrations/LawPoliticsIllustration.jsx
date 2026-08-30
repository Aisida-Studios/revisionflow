// src/components/illustrations/LawPoliticsIllustration.jsx
import React from 'react'

export default function LawPoliticsIllustration({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of a set of scales" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <line x1="160" y1="50" x2="160" y2="250" stroke="var(--accent)" strokeWidth="4" />
        <line x1="90" y1="80" x2="230" y2="80" stroke="var(--accent)" strokeWidth="3.4" />
        <circle cx="160" cy="80" r="6" fill="var(--accent)" />
        <line x1="90" y1="80" x2="66" y2="146" stroke="var(--accent-light)" strokeWidth="2" />
        <line x1="90" y1="80" x2="114" y2="146" stroke="var(--accent-light)" strokeWidth="2" />
        <path d="M56 146 Q90 178 124 146 Z" fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="2.6" />
        <line x1="230" y1="80" x2="206" y2="146" stroke="var(--accent-light)" strokeWidth="2" />
        <line x1="230" y1="80" x2="254" y2="146" stroke="var(--accent-light)" strokeWidth="2" />
        <path d="M196 146 Q230 178 264 146 Z" fill="var(--accent)" fillOpacity="0.22" stroke="var(--accent)" strokeWidth="2.6" />
        <path d="M110 250 L210 250 L222 270 L98 270 Z" fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="2.6" />
      </g>
    </svg>
  )
}
