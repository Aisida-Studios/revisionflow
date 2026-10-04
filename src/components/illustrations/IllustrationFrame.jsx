// src/components/illustrations/IllustrationFrame.jsx
// ─────────────────────────────────────────────────────────────────────────────
// The one <svg> root every RevisionFlow illustration renders through. It owns:
//
//  • Accessibility — decorative by default (aria-hidden, no role). Pass `label` ONLY when the
//    artwork carries meaning that isn't already in nearby text; it then becomes role="img".
//  • Per-instance ids — gradients get an id unique to each rendered instance (useId), so two
//    copies of the same illustration on a page never fight over `url(#…)` references.
//  • Detail tiers — artwork is designed once but drawn at three levels so it stays legible at
//    38px tiles and rich at 150px+ hero spots (see detailFor()). Parts read the tier through
//    useDetail() instead of every page passing flags around.
//  • Responsive safety — width/height attributes give the intrinsic size, while the .rfi class
//    (illustrations.css) caps it at 100% of its container and keeps the aspect ratio, so artwork
//    can never cause horizontal overflow at 320px.
// ─────────────────────────────────────────────────────────────────────────────
import React, { createContext, useContext, useId } from 'react'
import './illustrations.css'

const DetailContext = createContext('full')
const IdContext = createContext('rfi')

/** 'compact' | 'standard' | 'full' — what the current illustration instance should draw. */
export const useDetail = () => useContext(DetailContext)
/** Instance-unique id prefix for gradients/clipPaths. */
export const useIllId = () => useContext(IdContext)

/**
 * Map a rendered pixel width to a detail tier.
 *   compact  (≤72px)  — one primary object, no backdrop clutter, heavier relative strokes.
 *   standard (≤139px) — primary object + one supporting element.
 *   full     (≥140px) — complete composition.
 * Thresholds match the sizes the app really uses (38, 42, 58, 64 · 84, 88 · 150).
 */
export function detailFor(px) {
  if (!px || px >= 140) return 'full'
  if (px <= 72) return 'compact'
  return 'standard'
}

function parseViewBox(vb) {
  const [, , w, h] = vb.split(/\s+/).map(Number)
  return { w, h }
}

export default function IllustrationFrame({
  viewBox = '0 0 240 240',
  size,            // square shorthand → width & height
  width,           // explicit width (height follows the viewBox ratio unless given)
  height,
  detail,          // force a tier; otherwise derived from the rendered width
  label,           // accessible name — omit for decorative artwork
  className = '',
  style,
  children,
  ...rest
}) {
  const { w: vbW, h: vbH } = parseViewBox(viewBox)
  const px = size ?? width ?? vbW
  const outW = size ?? width ?? vbW
  const outH = size ?? height ?? Math.round((outW * vbH) / vbW)
  const tier = detail || detailFor(px)
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')

  const a11y = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`rfi rfi--${tier}${className ? ` ${className}` : ''}`}
      viewBox={viewBox}
      width={outW}
      height={outH}
      focusable="false"
      style={style}
      {...a11y}
      {...rest}
    >
      <IdContext.Provider value={`rfi${uid}`}>
        <DetailContext.Provider value={tier}>{children}</DetailContext.Provider>
      </IdContext.Provider>
    </svg>
  )
}
