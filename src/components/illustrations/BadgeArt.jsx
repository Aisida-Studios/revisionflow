// src/components/illustrations/BadgeArt.jsx
// ─────────────────────────────────────────────────────────────────────────────
//   <BadgeArt id="streak_7" size={64} />            earned medallion
//   <BadgeArt id="streak_7" size={64} earned={false} />   same artwork, drained of colour
//   <BadgeArt id="streak_7" size={28} frame="none" />     emblem only, for tight chips
//
// Educational medallions rather than game stickers: a calm category-coloured rim, a soft face,
// one bold emblem. Mastery tiers use restrained metal rims; streaks grow from sprout to tree.
// Ids come from data/badges.js; which emblem belongs to which id lives in registry.js.
// ─────────────────────────────────────────────────────────────────────────────
import React, { memo } from 'react'
import IllustrationFrame, { detailFor } from './IllustrationFrame'
import { C, Leaf } from './kit'
import { BADGE_ART, FALLBACK_BADGE } from './registry/badges'

const TONES = {
  milestone:   { rim: C.deep,    shade: C.ink,      face: C.mint,     a: C.deep,    b: C.leaf },
  streak:      { rim: C.mid,     shade: C.deep,     face: C.mist,     a: C.deep,    b: C.leaf },
  legendary:   { rim: C.gold,    shade: C.warm3,    face: C.mist,     a: C.deep,    b: C.leaf },
  bronze:      { rim: C.warm3,   shade: C.ink,      face: C.warm,     a: C.warm3,   b: C.warm2 },
  silver:      { rim: C.n2,      shade: C.neutral,  face: C.paper,    a: C.neutral, b: C.n2 },
  gold:        { rim: C.gold,    shade: C.warm3,    face: C.goldPale, a: C.warm3,   b: C.gold },
  improvement: { rim: C.blue,    shade: C.ink,      face: C.bluePale, a: C.blue,    b: C.blueMid },
  consistency: { rim: C.warm2,   shade: C.warm3,    face: C.warm,     a: C.warm3,   b: C.warm3 },
  social:      { rim: C.teal,    shade: C.deep,     face: C.tealPale, a: C.teal,    b: C.teal },
  special:     { rim: C.neutral, shade: C.ink,      face: C.paper,    a: C.neutral, b: C.n2 },
}

function BadgeArt({ id, size = 64, earned = true, frame = 'medal', label, className = '', style, ...rest }) {
  const art = BADGE_ART[id] || FALLBACK_BADGE
  const t = TONES[art.tone] || TONES.special
  const { Emblem } = art
  const tier = detailFor(size)
  const medal = frame !== 'none'

  return (
    <IllustrationFrame
      viewBox="0 0 96 96"
      size={size}
      detail={tier}
      label={label}
      className={`${earned ? '' : 'rfi-locked'}${className ? ` ${className}` : ''}`.trim()}
      style={style}
      {...rest}
    >
      {medal && (
        <g>
          <circle cx="49.5" cy="52" r="44" fill={C.shadow} opacity="0.3" />
          <circle cx="48" cy="48" r="45" fill={t.rim} />
          <path d="M3 48A45 45 0 0 0 93 48Z" fill={t.shade} opacity="0.32" />
          <circle cx="48" cy="48" r="38.5" fill={t.shade} opacity="0.28" />
          <circle cx="48" cy="48" r="37" fill={t.face} />
          <circle cx="48" cy="48" r="37" fill="none" stroke={C.ink} strokeOpacity="0.12" strokeWidth="1.2" />
          <path d="M18 34A33 33 0 0 1 44 15" fill="none" stroke={C.hi} strokeWidth="3.4" strokeLinecap="round" opacity="0.4" />
          {tier !== 'compact' && (
            <g>
              <Leaf x={20} y={82} r={-42} l={17} tone="mid" />
              <Leaf x={27} y={85} r={-12} l={14} tone="leaf" />
            </g>
          )}
        </g>
      )}
      <g transform={medal ? 'translate(48 48)' : 'translate(48 48) scale(1.75)'}>
        <Emblem a={t.a} b={t.b} />
      </g>
    </IllustrationFrame>
  )
}

export default memo(BadgeArt)
