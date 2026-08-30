// src/components/illustrations/PEIllustration.jsx
import React from 'react'

export default function PEIllustration({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of a runner" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" stroke="var(--accent)" strokeWidth="8">
        <circle cx="176" cy="72" r="20" fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="4" />
        <path d="M176 96 C 160 130, 172 148, 150 168" />
        <path d="M150 168 C 128 184, 96 182, 74 200" />
        <path d="M150 168 C 168 188, 172 214, 156 244" />
        <path d="M176 96 C 200 116, 236 118, 252 100" strokeWidth="7" />
        <path d="M176 96 C 168 122, 148 132, 118 128" strokeWidth="7" />
        <path d="M74 200 L54 216" strokeWidth="6" />
        <path d="M156 244 L188 256" strokeWidth="6" />
      </g>
      <path d="M60 268 Q160 288 260 268" fill="none" stroke="var(--accent-light)" strokeWidth="2" opacity="0.4" />
    </svg>
  )
}
