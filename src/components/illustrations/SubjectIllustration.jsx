// src/components/illustrations/SubjectIllustration.jsx
// ─────────────────────────────────────────────────────────────────────────────
//   <SubjectIllustration subject="Physics" size={96} />
//
// The one component for subject artwork. Pass the subject NAME exactly as the app already
// stores it (the resolver canonicalises it) or a theme id via `theme`.
//
//  • size      px, square. Drives the detail tier: ≤72 compact · ≤139 standard · ≥140 full.
//  • backdrop  soft mint disc behind the art. Defaults on from the standard tier up; the compact
//              tier (tiles that already have their own tinted container) omits it.
//  • label     accessible name — omit when the subject name is already printed nearby (decorative).
//
// Also exports componentForSubject(): a STABLE component per theme, for call sites that do
//   const Illustration = componentForSubject(name); <Illustration size={38} />
// (stable identity matters — a new component type per render would remount the SVG every time).
// ─────────────────────────────────────────────────────────────────────────────
import React, { memo } from 'react'
import IllustrationFrame, { detailFor } from './IllustrationFrame'
import { Disc } from './kit'
import { THEMES, THEME_ART, THEME_ASSETS, COMPACT_VIEWBOX, themeForSubject } from './registry/subjects'

function SubjectIllustration({
  subject, theme, size = 160, backdrop, detail, label, className, style, ...rest
}) {
  const resolved = theme && THEME_ART[theme] ? theme : themeForSubject(subject)
  const asset = THEME_ASSETS[resolved]

  if (asset) {
    return (
      <img
        src={asset}
        alt={label || ''}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className={className}
        style={{ display: 'block', maxWidth: '100%', height: 'auto', flexShrink: 0, ...style }}
        {...rest}
      />
    )
  }

  const Art = THEME_ART[resolved] || THEME_ART.generic
  const tier = detail || detailFor(size)
  const showDisc = backdrop ?? tier !== 'compact'
  // Disc-less compact tiles are cropped to the object (see COMPACT_VIEWBOX); everything else uses the full canvas.
  const viewBox = tier === 'compact' && !showDisc ? COMPACT_VIEWBOX[resolved] || '0 0 240 240' : '0 0 240 240'

  return (
    <IllustrationFrame viewBox={viewBox} size={size} detail={tier} label={label} className={className} style={style} {...rest}>
      {showDisc && <Disc />}
      <Art />
    </IllustrationFrame>
  )
}

const Memoised = memo(SubjectIllustration)
export default Memoised

/** theme id → stable component accepting { size, style, className, … }. */
export const THEME_COMPONENTS = Object.fromEntries(
  THEMES.map((theme) => {
    const Comp = (props) => <Memoised theme={theme} {...props} />
    Comp.displayName = `SubjectIllustration(${theme})`
    return [theme, Comp]
  }),
)

/** subject name → stable illustration component (generic study desk when unknown). */
export function componentForSubject(subjectName) {
  return THEME_COMPONENTS[themeForSubject(subjectName)] || THEME_COMPONENTS.generic
}
