// src/components/illustrations/Illustration.jsx
// ─────────────────────────────────────────────────────────────────────────────
//   <Illustration name="calendar" width={280} />
//
// Feature / state / reward artwork on a 320×240 canvas (4:3). Names live in registry.js
// (SCENE_NAMES). Subject artwork is a different component: <SubjectIllustration/>.
//
//  • width     px (default 280). Height follows the 4:3 ratio and the art never exceeds its
//              container. Detail tier is derived from the width (a 320px-wide scene is "full").
//  • backdrop  the soft stage behind the still-life. On by default (off for scenes that draw
//              their own ground).
//  • label     accessible name — omit when nearby text already says what this is (decorative).
// ─────────────────────────────────────────────────────────────────────────────
import React, { memo } from 'react'
import IllustrationFrame, { detailFor } from './IllustrationFrame'
import { Stage } from './kit'
import { SCENE_ART, SCENE_ASSETS, SCENES_WITHOUT_STAGE } from './registry/scenes'

function Illustration({ name, width = 280, height, backdrop, detail, label, className, style, ...rest }) {
  const Art = SCENE_ART[name]
  if (!Art) {
    if (import.meta.env && import.meta.env.DEV) console.warn(`[Illustration] unknown scene "${name}"`)
    return null
  }

  const asset = SCENE_ASSETS[name]
  if (asset) {
    return (
      <img
        src={asset}
        alt={label || ''}
        width={width}
        height={height ?? Math.round((width * 3) / 4)}
        loading="lazy"
        decoding="async"
        className={className}
        style={{ display: 'block', maxWidth: '100%', height: 'auto', flexShrink: 0, ...style }}
        {...rest}
      />
    )
  }

  const tier = detail || detailFor(Math.round(width * 0.75))
  const showStage = backdrop ?? !SCENES_WITHOUT_STAGE.has(name)

  return (
    <IllustrationFrame viewBox="0 0 320 240" width={width} height={height} detail={tier} label={label} className={className} style={style} {...rest}>
      {showStage && <Stage />}
      <Art />
    </IllustrationFrame>
  )
}

export default memo(Illustration)
