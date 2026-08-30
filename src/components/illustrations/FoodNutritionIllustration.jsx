// src/components/illustrations/FoodNutritionIllustration.jsx
import React from 'react'

export default function FoodNutritionIllustration({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" role="img" aria-label="Illustration of an apple with a fork and knife" style={style}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M160 120 C 130 100, 90 116, 84 156 C 78 200, 106 240, 138 240
             C 148 240, 152 236, 160 236 C 168 236, 172 240, 182 240
             C 214 240, 242 200, 236 156 C 230 116, 190 100, 160 120 Z"
          fill="var(--accent-pale)" stroke="var(--accent-light)" strokeWidth="3"
        />
        <path d="M160 120 C 158 104, 164 92, 178 86" stroke="var(--accent)" strokeWidth="3" />
        <path d="M178 86 C 194 82, 204 90, 202 100 C 188 104, 178 98, 178 86 Z"
          fill="var(--accent)" fillOpacity="0.3" stroke="var(--accent)" strokeWidth="2" />
        <line x1="76" y1="150" x2="76" y2="230" stroke="var(--accent-light)" strokeWidth="3" />
        <line x1="68" y1="150" x2="68" y2="176" stroke="var(--accent-light)" strokeWidth="2.4" />
        <line x1="84" y1="150" x2="84" y2="176" stroke="var(--accent-light)" strokeWidth="2.4" />
        <path d="M244 150 L244 230 M244 150 C 236 150, 236 176, 244 178" stroke="var(--accent-light)" strokeWidth="3" />
      </g>
    </svg>
  )
}
