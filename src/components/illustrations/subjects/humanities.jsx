// src/components/illustrations/subjects/humanities.jsx
// English · History · Geography · Religion & Philosophy · Psychology · Law & Politics · Languages.
import React from 'react'
import { C, G, Leaf, Shadow, BookStack, Pencil, Deco, DecoFront, useUid } from '../kit'
import { useDetail } from '../IllustrationFrame'
import { GlyphBubble } from './languages'

const r1 = (v) => Math.round(v * 10) / 10

/* ───────────────────────────── parts ───────────────────────────── */

/** Open book, front-on. Origin = gutter at the bottom; ~128 wide × 84 tall. */
export function OpenBook({ x = 0, y = 0, s = 1, r = 0, cover = 'deep', lines = true }) {
  const d = useDetail()
  const cv = cover === 'blue' ? [C.blue, C.ink] : cover === 'cream' ? [C.warm2, C.warm3] : [C.deep, C.ink]
  const page = 'M0 10C-14 0-40-4-60-8V-60C-40-62-14-56 0-44Z'
  const rows = []
  if (lines && d !== 'compact') {
    for (let i = 0; i < 5; i += 1) {
      const dy = 14 + i * 7
      const p = `M-52 ${-60.5 + dy}C-38 ${-61 + dy} -18 ${-56 + dy} -8 ${-47 + dy}`
      const q = `M52 ${-60.5 + dy}C38 ${-61 + dy} 18 ${-56 + dy} 8 ${-47 + dy}`
      rows.push(<path key={`l${i}`} d={p} fill="none" stroke={C.mist} strokeWidth="2.3" strokeLinecap="round" />)
      rows.push(<path key={`r${i}`} d={q} fill="none" stroke={C.mist} strokeWidth="2.3" strokeLinecap="round" />)
    }
  }
  return (
    <G x={x} y={y} s={s} r={r}>
      <Shadow cx={2} cy={18} rx={76} />
      {/* cover boards, then the page block, then the pages — all built from the page outline */}
      <g transform="translate(0 10) scale(1.1 1)"><path d={page} fill={cv[0]} /></g>
      <g transform="translate(0 10) scale(-1.1 1)"><path d={page} fill={cv[0]} /></g>
      <g transform="translate(0 10) scale(1.1 1)"><path d={page} fill={cv[1]} opacity="0.25" /></g>
      <g transform="translate(0 5) scale(1.04 1)"><path d={page} fill={C.paper2} /></g>
      <g transform="translate(0 5) scale(-1.04 1)"><path d={page} fill={C.paper2} /></g>
      <path d={page} fill={C.paper} />
      <g transform="scale(-1 1)"><path d={page} fill={C.paper} /></g>
      <path d={page} fill={C.paper2} opacity="0.4" />
      <path d="M0 10V-44" stroke={C.paper2} strokeWidth="2.4" />
      {rows}
      {d !== 'compact' && <path d="M-4.5-44V-8L-0.5-12L3.5-8V-44Z" fill={C.amber} opacity="0.92" />}
    </G>
  )
}

/** Speech bubble. Origin = top-left. */
export function Bubble({ x = 0, y = 0, w = 70, h = 44, tone = 'paper', tail = 'left', marks = 'bars' }) {
  const fill = tone === 'deep' ? C.deep : tone === 'mint' ? C.mist : C.paper
  const mark = tone === 'deep' ? C.mist : C.leaf
  const tx = tail === 'left' ? w * 0.22 : w * 0.78
  const dir = tail === 'left' ? -1 : 1
  return (
    <G x={x} y={y}>
      <path d={`M${tx} ${h + 3}L${tx + dir * 12} ${h + 15}L${tx + dir * 16 - dir * 6} ${h + 3}Z`} fill={C.shadow} opacity="0.25" />
      <rect x="2" y="3" width={w} height={h} rx="12" fill={C.shadow} opacity="0.28" />
      <path d={`M${tx + dir * 14} ${h - 1}L${tx + dir * 12} ${h + 14}L${tx - dir * 2} ${h - 1}Z`} fill={fill} />
      <rect width={w} height={h} rx="12" fill={fill} stroke={tone === 'paper' ? C.paper2 : 'none'} strokeWidth="1" />
      {marks === 'bars' ? (
        <g stroke={mark} strokeWidth="3.4" strokeLinecap="round">
          <path d={`M${w * 0.18} ${h * 0.34}H${w * 0.82}M${w * 0.18} ${h * 0.64}H${w * 0.58}`} />
        </g>
      ) : (
        <g fill="none" stroke={mark} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d={`M${w * 0.2} ${h * 0.55}Q${w * 0.3} ${h * 0.2} ${w * 0.4} ${h * 0.55}T${w * 0.6} ${h * 0.55}T${w * 0.8} ${h * 0.55}`} />
        </g>
      )}
    </G>
  )
}

/** Globe on a brass-and-wood stand. Origin = base centre on the ground. */
export function Globe({ x = 0, y = 0, s = 1 }) {
  const id = useUid()
  const d = useDetail()
  return (
    <G x={x} y={y} s={s}>
      <defs>
        <radialGradient id={`${id}g`} cx="36%" cy="30%" r="80%">
          <stop offset="0" style={{ stopColor: 'var(--rfi-blue-pale)' }} />
          <stop offset="0.55" style={{ stopColor: 'var(--rfi-blue-mid)' }} />
          <stop offset="1" style={{ stopColor: 'var(--rfi-blue)' }} />
        </radialGradient>
        <clipPath id={`${id}c`}><circle cx="0" cy="-104" r="50" /></clipPath>
      </defs>
      <Shadow cx={3} cy={2} rx={40} />
      {/* stand */}
      <ellipse cx="0" cy="-3" rx="34" ry="7" fill={C.warm3} />
      <ellipse cx="0" cy="-6" rx="34" ry="7" fill={C.warm2} />
      <rect x="-4.4" y="-58" width="8.8" height="54" fill={C.warm3} />
      <path d="M-48-104A52 52 0 0 0 0-52" fill="none" stroke={C.warm3} strokeWidth="3.6" strokeLinecap="round" />
      <circle cx="-50" cy="-110" r="3.6" fill={C.warm3} />
      {/* sphere */}
      <circle cx="0" cy="-104" r="50" fill={`url(#${id}g)`} />
      <g clipPath={`url(#${id}c)`}>
        <path d="M-34-124C-24-132-12-126-14-114C-16-104-24-100-22-88C-20-78-28-70-34-76C-42-86-36-98-42-108C-46-116-42-120-34-124Z" fill={C.leaf} />
        <path d="M2-130C14-136 30-128 28-114C26-102 34-94 28-80C22-68 10-70 6-82C2-94-6-100-4-112C-2-120-4-126 2-130Z" fill={C.mid} />
        <path d="M34-120C44-118 52-108 46-98C40-92 32-100 34-110Z" fill={C.leaf} />
        <path d="M-10-76C0-70 12-72 20-66C14-60 0-58-10-62Z" fill={C.soft} opacity="0.9" />
        {d !== 'compact' && (
          <g fill="none" stroke={C.hi} strokeWidth="1" opacity="0.32">
            <ellipse cx="0" cy="-104" rx="22" ry="50" /><ellipse cx="0" cy="-104" rx="50" ry="17" /><path d="M-50-104H50" />
          </g>
        )}
        <path d="M-40-128A52 52 0 0 1-8-150" fill="none" stroke={C.hi} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        <circle cx="0" cy="-104" r="50" fill="none" stroke={C.ink} strokeOpacity="0.12" strokeWidth="6" />
      </g>
    </G>
  )
}

/** Doric column section. Origin = base centre on the ground. */
export function Column({ x = 0, y = 0, s = 1, h = 118 }) {
  const top = -h
  const flutes = []
  for (let i = -2; i <= 2; i += 1) flutes.push(`M${i * 6.4} ${top + 18}V${-14}`)
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={3} cy={2} rx={34} />
      <rect x="-26" y="-12" width="52" height="12" rx="2.4" fill={C.warm2} />
      <rect x="-22" y="-20" width="44" height="9" rx="2" fill={C.warm} />
      <path d={`M-15 -18L-13 ${top + 16}H13L15 -18Z`} fill={C.warm} />
      <path d={`M3 -18L5 ${top + 16}H13L15 -18Z`} fill={C.warm2} opacity="0.85" />
      <path d={flutes.join('')} stroke={C.warm3} strokeWidth="1.3" opacity="0.55" />
      <rect x="-20" y={top + 8} width="40" height="9" rx="2" fill={C.warm} />
      <rect x="-27" y={top - 2} width="54" height="11" rx="2.4" fill={C.paper} />
      <rect x="-27" y={top + 5} width="54" height="4.4" fill={C.warm2} opacity="0.7" />
      <rect x="-27" y={top - 2} width="54" height="3" rx="1.5" fill={C.hi} opacity="0.6" />
    </G>
  )
}

/** Parchment scroll lying down. Origin = centre. */
export function Scroll({ x = 0, y = 0, r = 0, s = 1 }) {
  return (
    <G x={x} y={y} r={r} s={s}>
      <rect x="-34" y="-14" width="68" height="32" rx="3" fill={C.shadow} opacity="0.28" transform="translate(2 4)" />
      <path d="M-30-16H30V16H-30Z" fill={C.warm} />
      <path d="M-30 4H30V16H-30Z" fill={C.warm2} opacity="0.5" />
      <path d="M-20-6H18M-20 0H24M-20 6H10" stroke={C.warm3} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <rect x="-37" y="-19" width="12" height="38" rx="6" fill={C.warm2} />
      <ellipse cx="-31" cy="-19" rx="6" ry="3" fill={C.warm} />
      <rect x="25" y="-19" width="12" height="38" rx="6" fill={C.warm2} />
      <ellipse cx="31" cy="-19" rx="6" ry="3" fill={C.warm} />
    </G>
  )
}

/** Hourglass. Origin = base centre. */
export function Hourglass({ x = 0, y = 0, s = 1 }) {
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={2} cy={2} rx={22} />
      <path d="M-14-62C-14-46-3-40-3-31C-3-22-14-16-14 0H14C14-16 3-22 3-31C3-40 14-46 14-62Z" fill={C.paper} opacity="0.6" stroke={C.soft} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M-11-6C-11-14-3-20 0-24C3-20 11-14 11-6Z" fill={C.gold} />
      <path d="M-9-62H9C9-52 2-48 0-44C-2-48-9-52-9-62Z" fill={C.gold} opacity="0.55" />
      <path d="M0-44V-26" stroke={C.gold} strokeWidth="1.6" />
      <rect x="-19" y="-67" width="38" height="6.4" rx="3" fill={C.warm3} />
      <rect x="-19" y="-3" width="38" height="6.4" rx="3" fill={C.warm3} />
    </G>
  )
}

/** Lantern. Origin = base centre. */
export function Lantern({ x = 0, y = 0, s = 1 }) {
  const id = useUid()
  return (
    <G x={x} y={y} s={s}>
      <defs>
        <radialGradient id={`${id}lg`} cx="50%" cy="60%" r="60%">
          <stop offset="0" style={{ stopColor: 'var(--rfi-gold-pale)' }} />
          <stop offset="1" style={{ stopColor: 'var(--rfi-paper)' }} />
        </radialGradient>
      </defs>
      <Shadow cx={2} cy={2} rx={30} />
      <path d="M-8-102C-8-112 8-112 8-102" fill="none" stroke={C.warm3} strokeWidth="3" strokeLinecap="round" />
      <path d="M-20-86L-9-98H9L20-86Z" fill={C.deep} />
      <rect x="-22" y="-88" width="44" height="5" rx="2" fill={C.ink} opacity="0.7" />
      <rect x="-19" y="-83" width="38" height="68" rx="3" fill={`url(#${id}lg)`} />
      <rect x="-19" y="-83" width="38" height="68" rx="3" fill="none" stroke={C.warm3} strokeWidth="2.4" />
      <path d="M0-83V-15M-9.5-83V-15M9.5-83V-15" stroke={C.warm3} strokeWidth="1.2" opacity="0.6" />
      <path d="M0-30C-7-38-5-46 0-54C5-46 7-38 0-30Z" fill={C.gold} />
      <path d="M0-34C-3-39-2-44 0-48C2-44 3-39 0-34Z" fill={C.goldPale} />
      <rect x="-23" y="-17" width="46" height="9" rx="2.6" fill={C.deep} />
      <rect x="-17" y="-8" width="34" height="8" rx="2.6" fill={C.ink} opacity="0.85" />
    </G>
  )
}

/** Scales of justice. Origin = base centre. */
export function Scales({ x = 0, y = 0, s = 1 }) {
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={2} cy={2} rx={34} />
      <path d="M-24 0Q-22-14-10-16H10Q22-14 24 0Z" fill={C.deep} />
      <rect x="-30" y="-6" width="60" height="7" rx="2.6" fill={C.ink} opacity="0.8" />
      <rect x="-3.6" y="-116" width="7.2" height="102" rx="2" fill={C.gold} />
      <rect x="-3.6" y="-116" width="2.4" height="102" rx="1.2" fill={C.hi} opacity="0.35" />
      <circle cx="0" cy="-120" r="7.4" fill={C.gold} />
      <circle cx="-2" cy="-122" r="2.4" fill={C.hi} opacity="0.5" />
      <rect x="-60" y="-110" width="120" height="6" rx="3" fill={C.gold} />
      <path d="M-56-104L-76-50H-36ZM56-104L36-50H76Z" fill="none" stroke={C.warm3} strokeWidth="1.4" />
      <path d="M-82-50H-30Q-34-34-56-34T-82-50Z" fill={C.warm2} />
      <path d="M-82-50H-30Q-31-46-33-42H-79Q-81-46-82-50Z" fill={C.warm3} opacity="0.5" />
      <path d="M30-50H82Q78-34 56-34T30-50Z" fill={C.warm2} />
      <path d="M30-50H82Q81-46 79-42H33Q31-46 30-50Z" fill={C.warm3} opacity="0.5" />
    </G>
  )
}

/** Gavel + block. Origin = block centre on the ground. */
export function Gavel({ x = 0, y = 0, r = 0, s = 1 }) {
  return (
    <G x={x} y={y} r={r} s={s}>
      <Shadow cx={2} cy={2} rx={28} />
      <rect x="-24" y="-9" width="48" height="9" rx="3" fill={C.warm3} />
      <rect x="-20" y="-14" width="40" height="6" rx="2.6" fill={C.warm2} />
      <G x={-2} y={-40} r={-30}>
        <rect x="-3" y="-4" width="7" height="58" rx="3.4" fill={C.warm2} />
        <rect x="-26" y="-18" width="52" height="22" rx="5" fill={C.warm3} />
        <rect x="-26" y="-18" width="52" height="7" rx="3.5" fill={C.warm2} opacity="0.6" />
        <rect x="-26" y="-18" width="8" height="22" rx="3.5" fill={C.ink} opacity="0.35" />
        <rect x="18" y="-18" width="8" height="22" rx="3.5" fill={C.ink} opacity="0.35" />
      </G>
    </G>
  )
}

/** Head in profile with foliage inside. Origin (0,0) = centre of the neck base. */
export function HeadProfile({ x = 0, y = 0, s = 1 }) {
  const id = useUid()
  const d = useDetail()
  const path = 'M-28 78C-24 56-28 48-34 38C-50 22-54-2-46-24C-36-54-8-70 20-64C44-60 56-40 56-22C56-16 60-8 64 0C66 4 70 10 66 14C64 17 58 17 57 20C58 24 60 26 57 29C56 32 58 35 55 39C52 46 48 50 40 52C34 54 32 60 34 66V78Z'
  return (
    <G x={x} y={y} s={s}>
      <defs>
        <linearGradient id={`${id}h`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--rfi-mist)' }} />
          <stop offset="1" style={{ stopColor: 'var(--rfi-soft)' }} />
        </linearGradient>
        <clipPath id={`${id}hc`}><path d={path} /></clipPath>
      </defs>
      <Shadow cx={4} cy={80} rx={46} />
      <path d={path} fill={`url(#${id}h)`} />
      <g clipPath={`url(#${id}hc)`}>
        <path d="M30-70C50-60 62-40 60-20L40 78H-60V-70Z" fill={C.leaf} opacity="0.18" />
      </g>
      <path d={path} fill="none" stroke={C.mid} strokeWidth="1.4" strokeLinejoin="round" opacity="0.55" />
      <path d="M44-2C46 2 50 4 52 3" fill="none" stroke={C.mid} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      {/* the thinking part: leaves growing inside the head */}
      <g>
        <path d="M-8 24C-8 6-6-8 2-22" fill="none" stroke={C.deep} strokeWidth="2.4" strokeLinecap="round" />
        <Leaf x={-6} y={14} r={-52} l={30} tone="deep" />
        <Leaf x={-4} y={6} r={48} l={32} tone="mid" />
        <Leaf x={-1} y={-6} r={-46} l={28} tone="leaf" />
        <Leaf x={2} y={-14} r={44} l={26} tone="deep" />
        <Leaf x={3} y={-24} r={-8} l={24} tone="mid" />
        {d !== 'compact' && <Leaf x={-30} y={4} r={-82} l={18} tone="leaf" o={0.9} />}
      </g>
    </G>
  )
}

/* ───────────────────────── compositions ───────────────────────── */

export function EnglishArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      {!compact && (
        <g>
          <Leaf x={148} y={158} r={25} l={104} w={25} tone="leaf" b={8} />
          <path d="M148 158L152 140" stroke={C.ink} strokeWidth="2.6" strokeLinecap="round" />
        </g>
      )}
      <OpenBook x={120} y={compact ? 158 : 168} s={compact ? 1.2 : 1.1} />
      <DecoFront side="left" />
    </g>
  )
}

export function HistoryArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="c" />
      {d === 'full' && <Hourglass x={176} y={166} s={1.0} />}
      <Column x={compact ? 98 : 100} y={compact ? 196 : 192} s={compact ? 1.06 : 1.04} />
      <Scroll x={compact ? 152 : 152} y={compact ? 186 : 188} r={-8} s={compact ? 1.2 : 1.05} />
      <DecoFront side="right" />
    </g>
  )
}

export function GeographyArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      {d === 'full' && (
        <g transform="rotate(-8 64 182)">
          <rect x="32" y="164" width="66" height="42" rx="3" fill={C.shadow} opacity="0.25" transform="translate(2 4)" />
          <rect x="32" y="164" width="22" height="42" rx="2" fill={C.warm} />
          <rect x="54" y="164" width="22" height="42" fill={C.paper} />
          <rect x="76" y="164" width="22" height="42" rx="2" fill={C.warm} />
          <path d="M54 164V206M76 164V206" stroke={C.warm2} strokeWidth="1" />
          <path d="M36 194Q54 176 70 186T94 176" fill="none" stroke={C.soft} strokeWidth="1.5" />
          <path d="M36 202Q56 188 72 196T94 188" fill="none" stroke={C.soft} strokeWidth="1.5" />
          <path d="M40 172Q52 180 56 194T76 206" fill="none" stroke={C.blueMid} strokeWidth="2" strokeLinecap="round" />
          <path d="M80 170C80 165 90 165 90 170C90 175 85 178 85 178C85 178 80 175 80 170Z" fill={C.amber} />
          <circle cx="85" cy="170" r="1.8" fill={C.paper} />
        </g>
      )}
      <Globe x={compact ? 120 : 136} y={compact ? 200 : 198} s={compact ? 1.16 : 1.0} />
      <DecoFront side="right" />
    </g>
  )
}

export function PhilosophyArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      {!compact && <BookStack x={120} y={196} books={[{ w: 98, h: 15, tone: 'deep' }, { w: 86, h: 13, tone: 'cream', dx: 3 }]} />}
      <Lantern x={compact ? 120 : 120} y={compact ? 196 : 168} s={compact ? 1.12 : 1.0} />
      {d === 'full' && (
        <g>
          <circle cx="120" cy="104" r="46" fill={C.goldPale} opacity="0.28" />
          <circle cx="120" cy="104" r="64" fill={C.goldPale} opacity="0.14" />
        </g>
      )}
      <DecoFront side="right" />
    </g>
  )
}

export function PsychologyArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      <HeadProfile x={compact ? 118 : 114} y={compact ? 126 : 120} s={compact ? 1.12 : 1.02} />
      {d === 'full' && (
        <g fill={C.paper} stroke={C.soft} strokeWidth="1.4">
          <circle cx="182" cy="62" r="4" /><circle cx="192" cy="48" r="5.6" /><circle cx="176" cy="34" r="9" />
        </g>
      )}
    </g>
  )
}

export function LawArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="b" />
      {d === 'full' && <BookStack x={60} y={196} s={0.9} books={[{ w: 62, h: 14, tone: 'deep' }, { w: 54, h: 12, tone: 'warm', dx: 2 }]} />}
      <Scales x={compact ? 120 : 120} y={compact ? 192 : 188} s={compact ? 1.05 : 0.96} />
      {!compact && <Gavel x={186} y={199} r={0} s={0.7} />}
    </g>
  )
}

export function LanguagesArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      {!compact && <Bubble x={46} y={48} w={78} h={46} tone="paper" tail="left" marks="bars" />}
      {!compact && <Bubble x={112} y={36} w={78} h={48} tone="deep" tail="right" marks="wave" />}
      {compact && <Bubble x={74} y={44} w={92} h={56} tone="deep" tail="left" marks="wave" />}
      <BookStack x={120} y={196} s={compact ? 1.1 : 1.0} books={[{ w: 112, h: 17, tone: 'mid' }, { w: 98, h: 14, tone: 'cream', dx: 3 }, { w: 86, h: 13, tone: 'blueMid', dx: -3 }]} />
      {d === 'full' && <Pencil x={150} y={160} r={-30} len={64} tone="blue" />}
      <DecoFront side="left" />
    </g>
  )
}


/* ═════ English Language · English Language & Literature · Religious Studies · Sociology · Politics ═════ */

/** Magnifying glass. Origin = lens centre. */
export function Magnifier({ x = 0, y = 0, r = 0, s = 1 }) {
  return (
    <G x={x} y={y} r={r} s={s}>
      <circle cx="3" cy="5" r="24" fill={C.shadow} opacity="0.25" />
      <rect x="20" y="-5.4" width="38" height="10.8" rx="5.4" fill={C.warm3} transform="rotate(45)" />
      <rect x="20" y="-5.4" width="38" height="3.4" rx="1.7" fill={C.hi} opacity="0.3" transform="rotate(45)" />
      <circle r="23" fill={C.bluePale} opacity="0.45" />
      <circle r="23" fill="none" stroke={C.n2} strokeWidth="5.4" />
      <circle r="23" fill="none" stroke={C.n3} strokeWidth="1.6" opacity="0.8" />
      <path d="M-14-12A18 18 0 0 1-2-18" fill="none" stroke={C.hi} strokeWidth="3.4" strokeLinecap="round" opacity="0.7" />
    </G>
  )
}

/** Ink bottle. Origin = base centre. */
export function Inkwell({ x = 0, y = 0, s = 1 }) {
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={2} cy={2} rx={30} />
      <path d="M-25 0V-24Q-25-37-12-37H12Q25-37 25-24V0Q25 2 21 2H-21Q-25 2-25 0Z" fill={C.bluePale} opacity="0.7" />
      <path d="M-23-19H23V-1Q23 1 21 1H-21Q-23 1-23-1Z" fill={C.ink} />
      <ellipse cx="0" cy="-19" rx="23" ry="3.4" fill={C.blue} opacity="0.7" />
      <path d="M-25 0V-24Q-25-37-12-37H12Q25-37 25-24V0" fill="none" stroke={C.soft} strokeWidth="1.6" />
      <rect x="-9.4" y="-46" width="18.8" height="11" rx="3.4" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
      <path d="M-18-30V-6" stroke={C.hi} strokeWidth="3.2" strokeLinecap="round" opacity="0.6" />
    </G>
  )
}

export function EnglishLanguageArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      <G x={compact ? 98 : 94} y={compact ? 132 : 124} r={-5} s={compact ? 1.08 : 1}>
        <rect x="-46" y="-60" width="92" height="118" rx="6" fill={C.shadow} opacity="0.28" transform="translate(3 5)" />
        <rect x="-46" y="-60" width="92" height="118" rx="6" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
        <rect x="-34" y="-48" width="40" height="6" rx="3" fill={C.leaf} />
        <rect x="-38" y="-22" width="76" height="14" rx="4" fill={C.amberPale} />
        {[-32, -16, 0, 14, 28, 42].map((yy, i) => (
          <rect key={yy} x="-34" y={yy - (i === 1 ? 0 : 0)} width={i === 1 ? 58 : i % 2 ? 62 : 70} height="4.6" rx="2.3" fill={i === 1 ? C.soft : C.mist} />
        ))}
        <path d="M-34-4q4 4 8 0t8 0t8 0t8 0" fill="none" stroke={C.amber} strokeWidth="2" strokeLinecap="round" />
      </G>
      {!compact && <Magnifier x={134} y={150} s={0.98} />}
      <GlyphBubble x={compact ? 150 : 168} y={compact ? 78 : 70} s={compact ? 0.72 : 0.66} glyph="quote" tone="deep" />
      <DecoFront side="right" />
    </g>
  )
}

export function EnglishLangLitArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="b" />
      {!compact && (
        <g>
          <path d="M170 168L190 108" stroke={C.warm3} strokeWidth="2" strokeLinecap="round" />
          <Leaf x={168} y={170} r={22} l={92} w={22} tone="leaf" b={7} />
        </g>
      )}
      <BookStack x={compact ? 118 : 100} y={198} books={[{ w: 108, h: 18, tone: 'deep' }, { w: 94, h: 15, tone: 'cream', dx: 3 }, { w: 82, h: 13, tone: 'warm', dx: -3 }]} />
      {!compact && <Inkwell x={170} y={198} s={1.05} />}
      <GlyphBubble x={compact ? 120 : 98} y={compact ? 86 : 84} s={compact ? 0.82 : 0.72} glyph="quote" tone="paperMid" />
    </g>
  )
}

/** Wooden A-frame book stand. Origin = ground centre. */
export function BookStand({ x = 0, y = 0, s = 1, children }) {
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={2} cy={2} rx={48} />
      <path d="M-36 0L-6-64M36 0L6-64" stroke={C.warm3} strokeWidth="7" strokeLinecap="round" />
      <path d="M-22-26H22" stroke={C.warm2} strokeWidth="5" strokeLinecap="round" />
      <rect x="-48" y="-72" width="96" height="9" rx="3" fill={C.warm2} />
      <rect x="-48" y="-79" width="96" height="7.4" rx="3" fill={C.warm} />
      {children}
    </G>
  )
}

/** Candle with a small flame. Origin = base centre. */
export function Candle({ x = 0, y = 0, s = 1, glow = true }) {
  return (
    <G x={x} y={y} s={s}>
      {glow && <circle cx="0" cy="-66" r="34" fill={C.goldPale} opacity="0.26" />}
      <Shadow cx={2} cy={2} rx={20} />
      <ellipse cx="0" cy="-1" rx="18" ry="4.6" fill={C.warm2} />
      <rect x="-9" y="-50" width="18" height="48" rx="2.4" fill={C.paper} />
      <rect x="2" y="-50" width="7" height="48" rx="2.4" fill={C.paper2} opacity="0.8" />
      <path d="M-9-50H9L9-44Q4-40 3-46Q0-38-4-46Q-7-40-9-44Z" fill={C.hi} opacity="0.7" />
      <path d="M0-52V-57" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M0-58C-7-66-5-74 0-82C5-74 7-66 0-58Z" fill={C.gold} />
      <path d="M0-61C-3.4-66-2.4-70 0-74C2.4-70 3.4-66 0-61Z" fill={C.goldPale} />
    </G>
  )
}

export function ReligiousStudiesArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      <BookStand x={compact ? 120 : 110} y={compact ? 196 : 194} s={compact ? 1.18 : 1.0}>
        <OpenBook x={0} y={-86} s={0.88} cover="cream" />
      </BookStand>
      {!compact && <Candle x={184} y={196} s={0.98} glow={d === 'full'} />}
      {d === 'full' && [[56, 150], [66, 134], [49, 124]].map(([ox, oy], i) => <ellipse key={i} cx={ox} cy={oy} rx="3.6" ry="5" fill={C.deep} transform={`rotate(${i * 24 - 20} ${ox} ${oy})`} />)}
      <DecoFront side="left" />
    </g>
  )
}

/** Head-and-shoulders figure. Origin = centre of the shoulders' baseline. */
export function Figure({ x = 0, y = 0, s = 1, tone = 'soft' }) {
  const f = {
    paper: [C.paper, C.paper2], soft: [C.soft, C.leaf], leaf: [C.leaf, C.mid],
    blue: [C.blueMid, C.blue], warm: [C.warm2, C.warm3], mid: [C.mid, C.deep], teal: [C.teal, C.deep],
  }[tone]
  return (
    <G x={x} y={y} s={s}>
      <circle cx="2" cy="4" r="22" fill={C.shadow} opacity="0.2" />
      <path d="M-17 22C-17 6-9-2 0-2S17 6 17 22Z" fill={f[0]} />
      <path d="M0-2C9-2 17 6 17 22H7C7 10 5 2 0-2Z" fill={f[1]} opacity="0.55" />
      <circle cy="-16" r="11" fill={f[0]} />
      <circle cx="3" cy="-14" r="8" fill={f[1]} opacity="0.35" />
      <circle cx="-3.4" cy="-19" r="3.4" fill={C.hi} opacity="0.35" />
    </G>
  )
}

export function SociologyArt() {
  const d = useDetail()
  const compact = d === 'compact'
  const R = compact ? 48 : 52
  const cx = 120
  const cy = compact ? 112 : 110
  const tones = ['blue', 'leaf', 'warm', 'mid', 'teal']
  const pts = tones.map((_, i) => {
    const a = (-90 + i * 72) * (Math.PI / 180)
    return [r1(cx + Math.cos(a) * R), r1(cy + Math.sin(a) * R)]
  })
  const links = []
  for (let i = 0; i < 5; i += 1) {
    links.push(`M${pts[i].join(' ')}L${pts[(i + 1) % 5].join(' ')}`)
    links.push(`M${pts[i].join(' ')}L${pts[(i + 2) % 5].join(' ')}`)
  }
  return (
    <g>
      <Deco v="a" />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.soft} strokeWidth="1.6" strokeDasharray="3 6" opacity="0.8" />
      <path d={links.join('')} stroke={C.soft} strokeWidth="2" strokeLinecap="round" opacity="0.85" fill="none" />
      <circle cx={cx} cy={cy} r="9" fill={C.amber} />
      <circle cx={cx - 2.4} cy={cy - 2.6} r="2.8" fill={C.hi} opacity="0.5" />
      {pts.map(([px, py], i) => <Figure key={i} x={px} y={py + 4} s={compact ? 1.0 : 0.92} tone={tones[i]} />)}
      <DecoFront side="left" />
    </g>
  )
}

/** Ballot box with a paper going in. Origin = base centre. */
export function BallotBox({ x = 0, y = 0, s = 1 }) {
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={3} cy={2} rx={56} />
      <G x={4} y={-78} r={-7}>
        <rect x="-20" y="-34" width="40" height="58" rx="3" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
        <rect x="-13" y="-26" width="20" height="4.4" rx="2.2" fill={C.leaf} />
        {[-12, 0, 12].map((yy) => <g key={yy}><rect x="-13" y={yy - 2} width="8" height="8" rx="1.6" fill="none" stroke={C.soft} strokeWidth="1.4" /><rect x="-1" y={yy} width="12" height="3.6" rx="1.8" fill={C.mist} /></g>)}
        <path d="M-12 -0.4l3 3.4l5-6.4" fill="none" stroke={C.leaf} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </G>
      <rect x="-44" y="-62" width="88" height="62" rx="6" fill={C.deep} />
      <rect x="14" y="-62" width="30" height="62" rx="6" fill={C.ink} opacity="0.28" />
      <rect x="-50" y="-72" width="100" height="14" rx="5" fill={C.mid} />
      <rect x="-50" y="-72" width="100" height="4" rx="2" fill={C.hi} opacity="0.3" />
      <rect x="-24" y="-67" width="48" height="5" rx="2.5" fill={C.ink} />
      <rect x="-26" y="-46" width="52" height="32" rx="4" fill={C.paper} />
      <path d="M-12-30l7 7l14-15" fill="none" stroke={C.leaf} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </G>
  )
}

/** Speaker's lectern with a microphone. Origin = base centre. */
export function Podium({ x = 0, y = 0, s = 1 }) {
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={2} cy={2} rx={32} />
      <path d="M-26 0L-22-66H22L26 0Z" fill={C.warm2} />
      <path d="M8-66H22L26 0H12Z" fill={C.warm3} opacity="0.4" />
      <path d="M-17-8L-14-58H14L17-8Z" fill={C.warm} />
      <rect x="-31" y="-74" width="62" height="9" rx="3" fill={C.warm3} />
      <path d="M0-74V-98Q0-106 10-106" fill="none" stroke={C.n2} strokeWidth="2.6" strokeLinecap="round" />
      <ellipse cx="14" cy="-106" rx="7" ry="4.6" fill={C.screen} />
      <ellipse cx="12" cy="-107.4" rx="2.6" ry="1.6" fill={C.hi} opacity="0.5" />
    </G>
  )
}

export function PoliticsArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="b" />
      {!compact && <Podium x={176} y={198} s={0.96} />}
      <BallotBox x={compact ? 120 : 102} y={compact ? 198 : 198} s={compact ? 1.34 : 1.06} />
      <DecoFront side="left" />
    </g>
  )
}
