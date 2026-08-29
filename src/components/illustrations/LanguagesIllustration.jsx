// src/components/illustrations/LanguagesIllustration.jsx
import React from 'react'

export default function LanguagesIllustration({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of two speech bubbles" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M60 76 h140 a20 20 0 0 1 20 20 v76 a20 20 0 0 1 -20 20 h-96 l-30 30 v-30 h-14 a20 20 0 0 1 -20 -20 v-76 a20 20 0 0 1 20 -20 Z"
          fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="3"
        />
        <path
          d="M256 110 h-40 a16 16 0 0 0 -16 16 v58 a16 16 0 0 0 16 16 h64 l24 24 v-24 h6 a16 16 0 0 0 16 -16 v-58 a16 16 0 0 0 -16 -16 h-54 Z"
          fill="var(--accent)" fillOpacity="0.22" stroke="var(--accent)" strokeWidth="2.6"
        />
        <path d="M88 118 Q160 106 172 118" stroke="var(--accent)" strokeWidth="2" opacity="0.6" />
        <path d="M88 146 Q140 134 168 146" stroke="var(--accent)" strokeWidth="2" opacity="0.6" />
        <path d="M88 174 Q130 164 152 174" stroke="var(--accent)" strokeWidth="2" opacity="0.6" />
      </g>
    </svg>
  )
}
