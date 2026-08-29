// src/components/illustrations/SeedlingIllustration.jsx
// Soft line-art growing-plant graphic in the app's sage-green palette — the general-
// purpose companion to CellIllustration for non-science contexts (progress, "next
// session", empty states). Same reasoning: inline SVG over a static image so it
// adapts to dark mode and stays crisp at any size.
import React from 'react'

export default function SeedlingIllustration({ size = 160, style = {} }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 320 320"
      role="img" aria-label="Illustration of a growing plant"
      style={style}
    >
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M90 268 Q160 280 230 268" stroke="var(--accent-light)" strokeWidth="2" opacity="0.35" />
        <path d="M160 268 C 155 220, 164 178, 148 128" stroke="var(--accent)" strokeWidth="3.4" />
        <path d="M156 198 C 128 186, 104 189, 82 168" stroke="var(--accent)" strokeWidth="3" />
        <path
          d="M82 168 C 60 150, 55 122, 78 104 C 100 120, 105 148, 82 168 Z"
          fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="2.4"
        />
        <path d="M82 168 C 82 148, 81 130, 78 106" stroke="var(--accent-light)" strokeWidth="1" opacity="0.5" />
        <path d="M154 164 C 184 154, 206 158, 226 136" stroke="var(--accent)" strokeWidth="3" />
        <path
          d="M226 136 C 248 120, 253 94, 234 76 C 210 91, 203 118, 226 136 Z"
          fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="2.4"
        />
        <path d="M226 136 C 229 116, 231 96, 234 78" stroke="var(--accent-light)" strokeWidth="1" opacity="0.5" />
        {/* Flower */}
        <g>
          <circle cx="148" cy="112" r="15" fill="var(--bg-card)" stroke="var(--accent-light)" strokeWidth="2" />
          <circle cx="168" cy="124" r="15" fill="var(--bg-card)" stroke="var(--accent-light)" strokeWidth="2" />
          <circle cx="168" cy="146" r="15" fill="var(--bg-card)" stroke="var(--accent-light)" strokeWidth="2" />
          <circle cx="148" cy="158" r="15" fill="var(--bg-card)" stroke="var(--accent-light)" strokeWidth="2" />
          <circle cx="130" cy="134" r="15" fill="var(--bg-card)" stroke="var(--accent-light)" strokeWidth="2" />
          <circle cx="150" cy="134" r="9" fill="var(--gold)" opacity="0.85" />
        </g>
      </g>
    </svg>
  )
}
