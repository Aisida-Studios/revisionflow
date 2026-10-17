// src/components/illustrations/SubjectTile.jsx
// ─────────────────────────────────────────────────────────────────────────────
//   <SubjectTile subject="Biology" size={32} />
//   <SubjectTile subject={s.name} size={36} tint={SUBJECT_COLOURS[s.name]} />
//
// A subject's own picture on a small rounded tile: the thing to put in front of a subject name in
// a list row, a settings row or a picker, so subjects can be told apart at a glance.
//
//  • subject  the subject NAME exactly as the app stores it (the same resolver as
//             <SubjectIllustration/>). `theme` accepts a theme id instead.
//  • size     px, square. Meant for 28–64. Below 28 the picture stops reading — keep the colour
//             dot or the lucide icon there. From 72 up use <SubjectIllustration/> itself.
//  • tint     optional CSS colour (e.g. SUBJECT_COLOURS[name]) mixed gently into the tile so it
//             lines up with the subject-colour dots used elsewhere. Omit it for the neutral mint tile.
//  • label    accessible name — omit when the subject name is printed next to the tile (decorative).
//
// The picture is the compact tier: one object, cropped to fill the tile (see COMPACT_VIEWBOX).
// ─────────────────────────────────────────────────────────────────────────────
import React, { memo } from 'react'
import SubjectIllustration from './SubjectIllustration'
import './illustrations.css'

const MIN_SIZE = 28
const MAX_SIZE = 72

function SubjectTile({ subject, theme, size = 32, tint, label, className = '', style, ...rest }) {
  if (import.meta.env && import.meta.env.DEV && (size < MIN_SIZE || size > MAX_SIZE)) {
    console.warn(`[SubjectTile] size ${size}px is outside ${MIN_SIZE}–${MAX_SIZE}. ` +
      (size < MIN_SIZE ? 'The picture will not read this small — use a colour dot or an icon.' : 'Use <SubjectIllustration/> for larger artwork.'))
  }
  const art = Math.round(size * 0.9)
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }
  // Invalid where color-mix() is unsupported → the declaration is dropped and the stylesheet's plain tile shows.
  const tinted = tint ? { background: `color-mix(in srgb, ${tint} 14%, var(--rfi-tile-bg))` } : null

  return (
    <span
      className={`rfi-tile${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.3), ...tinted, ...style }}
      {...a11y}
      {...rest}
    >
      <SubjectIllustration subject={subject} theme={theme} size={art} detail="compact" backdrop={false} />
    </span>
  )
}

export default memo(SubjectTile)
