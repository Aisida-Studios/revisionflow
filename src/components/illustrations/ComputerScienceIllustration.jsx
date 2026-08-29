// src/components/illustrations/ComputerScienceIllustration.jsx
import React from 'react'

export default function ComputerScienceIllustration({ size = 160, style = {} }) {
  const pins = [70, 110, 150, 190, 230]
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of a microchip" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {pins.map(x => (
          <g key={x}>
            <line x1={x} y1="52" x2={x} y2="76" stroke="var(--accent-light)" strokeWidth="3" />
            <line x1={x} y1="244" x2={x} y2="268" stroke="var(--accent-light)" strokeWidth="3" />
          </g>
        ))}
        <line x1="52" y1="110" x2="76" y2="110" stroke="var(--accent-light)" strokeWidth="3" />
        <line x1="52" y1="160" x2="76" y2="160" stroke="var(--accent-light)" strokeWidth="3" />
        <line x1="52" y1="210" x2="76" y2="210" stroke="var(--accent-light)" strokeWidth="3" />
        <line x1="244" y1="110" x2="268" y2="110" stroke="var(--accent-light)" strokeWidth="3" />
        <line x1="244" y1="160" x2="268" y2="160" stroke="var(--accent-light)" strokeWidth="3" />
        <line x1="244" y1="210" x2="268" y2="210" stroke="var(--accent-light)" strokeWidth="3" />
        <rect x="76" y="76" width="168" height="168" rx="14"
          fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="3" />
        <rect x="112" y="112" width="96" height="96" rx="8" fill="none" stroke="var(--accent)" strokeWidth="2" />
        <path d="M132 112 L132 96 M188 112 L188 96 M112 132 L96 132 M112 188 L96 188"
          stroke="var(--accent)" strokeWidth="1.6" opacity="0.6" />
        <circle cx="160" cy="160" r="6" fill="var(--accent)" opacity="0.6" />
      </g>
    </svg>
  )
}
