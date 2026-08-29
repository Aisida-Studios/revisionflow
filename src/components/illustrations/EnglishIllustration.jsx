// src/components/illustrations/EnglishIllustration.jsx
import React from 'react'

export default function EnglishIllustration({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of an open book and quill" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M160 100 C 130 82, 80 78, 52 90 L52 226 C 80 214, 130 218, 160 236
             C 190 218, 240 214, 268 226 L268 90 C 240 78, 190 82, 160 100 Z"
          fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="3"
        />
        <line x1="160" y1="100" x2="160" y2="236" stroke="var(--accent-light)" strokeWidth="2" opacity="0.5" />
        <path d="M70 112 Q108 100 140 110" stroke="var(--accent)" strokeWidth="1.6" opacity="0.55" />
        <path d="M70 140 Q108 128 140 138" stroke="var(--accent)" strokeWidth="1.6" opacity="0.55" />
        <path d="M70 168 Q108 156 140 166" stroke="var(--accent)" strokeWidth="1.6" opacity="0.55" />
        <path d="M180 110 Q212 100 250 112" stroke="var(--accent)" strokeWidth="1.6" opacity="0.55" />
        <path d="M180 138 Q212 128 250 140" stroke="var(--accent)" strokeWidth="1.6" opacity="0.55" />
        <path
          d="M226 46 C 250 58, 262 84, 250 112 L 214 96 C 210 74, 210 56, 226 46 Z"
          fill="var(--accent)" fillOpacity="0.25" stroke="var(--accent)" strokeWidth="2.2"
        />
        <line x1="216" y1="96" x2="192" y2="118" stroke="var(--accent)" strokeWidth="2.4" />
      </g>
    </svg>
  )
}
