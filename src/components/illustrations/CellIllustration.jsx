// src/components/illustrations/CellIllustration.jsx
// Soft line-art cell graphic in the app's sage-green palette. Built as inline SVG
// (not a static image) so it recolours correctly between light and dark mode via
// CSS variables, and stays crisp at any size — a static PNG/JPEG export can't do
// either. Used on science-flavoured empty states and hero spots (e.g. the topic
// detail page) in place of a generic icon.
import React from 'react'

export default function CellIllustration({ size = 160, style = {} }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 320 320"
      role="img" aria-label="Illustration of a plant cell"
      style={style}
    >
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Outer membrane */}
        <path
          d="M182 32 C 248 28, 302 62, 316 122 C 330 178, 302 232, 240 252
             C 178 270, 108 262, 68 218 C 30 176, 34 108, 78 68 C 112 38, 150 34, 182 32 Z"
          fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="3"
        />
        {/* Nucleus */}
        <ellipse cx="162" cy="140" rx="46" ry="40" transform="rotate(-8 162 140)"
          fill="var(--accent)" fillOpacity="0.22" stroke="var(--accent)" strokeWidth="2.5" />
        <circle cx="148" cy="128" r="3.2" fill="var(--accent)" opacity="0.6" />
        <circle cx="175" cy="135" r="2.4" fill="var(--accent)" opacity="0.6" />
        <circle cx="158" cy="152" r="2.8" fill="var(--accent)" opacity="0.6" />
        {/* Organelles */}
        <ellipse cx="248" cy="98" rx="19" ry="12" transform="rotate(25 248 98)"
          fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="1.8" />
        <path d="M234 96 Q248 99 261 102" stroke="var(--accent-light)" strokeWidth="1" opacity="0.55" />
        <ellipse cx="252" cy="188" rx="18" ry="11" transform="rotate(-15 252 188)"
          fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="1.8" />
        <path d="M239 186 Q252 188 265 186" stroke="var(--accent-light)" strokeWidth="1" opacity="0.55" />
        <ellipse cx="118" cy="222" rx="16" ry="10" transform="rotate(10 118 222)"
          fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="1.8" />
        <circle cx="88" cy="118" r="9" fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="1.8" />
        <circle cx="196" cy="228" r="7.5" fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="1.8" />
      </g>
    </svg>
  )
}
