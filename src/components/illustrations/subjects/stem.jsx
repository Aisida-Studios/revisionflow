// src/components/illustrations/subjects/stem.jsx
// Mathematics · Computer Science · Design & Technology.
import React from 'react'
import { C, G, Shadow, Sheet, Pencil, Laptop, Deco, DecoFront, useUid } from '../kit'
import { useDetail } from '../IllustrationFrame'
import { GlyphMark } from './GlyphMark'

const r1 = (v) => Math.round(v * 10) / 10

/* ───────────────────────────── parts ───────────────────────────── */

/** Set square (right-angle triangle with a cut-out). Origin = right-angle corner, legs go up and right. */
export function SetSquare({ x = 0, y = 0, r = 0, s = 1, up = 98, across = 82 }) {
  const d = useDetail()
  const k = 0.26
  const inner = `M${r1(across * 0.2)} ${-r1(up * 0.12)}H${r1(across * 0.52)}L${r1(across * 0.2)} ${-r1(up * 0.5)}Z`
  return (
    <G x={x} y={y} r={r} s={s}>
      <path d={`M3 4L${across + 3} 4L3 ${-up + 4}Z`} fill={C.shadow} opacity="0.3" />
      <path d={`M0 0H${across}L0 ${-up}Z ${inner}`} fill={C.bluePale} fillRule="evenodd" />
      <path d={`M0 0H${across}L0 ${-up}Z`} fill="none" stroke={C.blueMid} strokeWidth="1.8" strokeLinejoin="round" />
      <path d={`M${r1(across * 0.2)} ${-r1(up * 0.12)}H${r1(across * 0.52)}L${r1(across * 0.2)} ${-r1(up * 0.5)}Z`} fill="none" stroke={C.blueMid} strokeWidth="1.2" strokeLinejoin="round" />
      <path d={`M0 0H${across}L${r1(across * 0.7)} ${-r1(up * k * 0.4)}H0Z`} fill={C.hi} opacity="0.28" />
      {d !== 'compact' && (
        <path d={`M2 ${-up * 0.14}H10M2 ${-up * 0.3}H8M2 ${-up * 0.46}H10M2 ${-up * 0.62}H8M2 ${-up * 0.78}H10`} stroke={C.blue} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      )}
    </G>
  )
}

/** Wooden ruler with ticks. Origin = left-centre; extends along +x. */
export function Ruler({ x = 0, y = 0, r = 0, s = 1, len = 150, h = 20 }) {
  const d = useDetail()
  const ticks = []
  if (d !== 'compact') {
    for (let i = 0; i <= 30; i += 1) {
      const tx = 6 + (i * (len - 12)) / 30
      ticks.push(`M${r1(tx)} ${-h / 2}v${i % 5 === 0 ? 8 : 4.5}`)
    }
  }
  return (
    <G x={x} y={y} r={r} s={s}>
      <rect x="2" y={-h / 2 + 3} width={len} height={h} rx="3" fill={C.shadow} opacity="0.3" />
      <rect y={-h / 2} width={len} height={h} rx="3" fill={C.warm} />
      <rect y={h * 0.18} width={len} height={h * 0.32} rx="3" fill={C.warm2} opacity="0.55" />
      <rect y={-h / 2} width={len} height="3" rx="1.5" fill={C.hi} opacity="0.45" />
      {ticks.length > 0 && <path d={ticks.join('')} stroke={C.warm3} strokeWidth="1.1" />}
    </G>
  )
}

/** Drawing compass (dividers). Origin = hinge; legs reach down to y≈+120. */
export function DrawingCompass({ x = 0, y = 0, s = 1, spread = 27 }) {
  const id = useUid()
  const needleX = -spread
  const penX = spread + 3
  return (
    <G x={x} y={y} s={s}>
      <defs>
        <linearGradient id={`${id}cm`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: 'var(--rfi-paper)' }} />
          <stop offset="0.5" style={{ stopColor: 'var(--rfi-neutral3)' }} />
          <stop offset="1" style={{ stopColor: 'var(--rfi-neutral2)' }} />
        </linearGradient>
      </defs>
      {/* handle */}
      <rect x="-4.6" y="-34" width="9.2" height="26" rx="3.6" fill={C.deep} />
      <path d="M-4.6-28H4.6M-4.6-22H4.6M-4.6-16H4.6" stroke={C.ink} strokeWidth="1" opacity="0.35" />
      <rect x="-3" y="-33" width="2.2" height="24" rx="1.1" fill={C.hi} opacity="0.25" />
      {/* needle leg */}
      <path d={`M-2 0L${needleX} 88`} stroke={`url(#${id}cm)`} strokeWidth="8" strokeLinecap="round" />
      <path d={`M${needleX} 88L${needleX - 0.6} 106`} stroke={C.ink} strokeWidth="2.4" strokeLinecap="round" />
      {/* pencil leg with joint */}
      <path d={`M2 0L${penX} 80`} stroke={`url(#${id}cm)`} strokeWidth="7" strokeLinecap="round" />
      <path d={`M${penX} 80L${penX + 0.6} 96`} stroke={C.warm2} strokeWidth="6" strokeLinecap="round" />
      <path d={`M${penX + 0.5} 94L${penX + 0.7} 106`} stroke={C.ink} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx={penX} cy="80" r="3.2" fill={C.n2} />
      {/* hinge */}
      <circle r="8.4" fill={`url(#${id}cm)`} />
      <circle r="3.2" fill={C.n2} />
      <circle r="8.4" fill="none" stroke={C.neutral} strokeWidth="0.9" opacity="0.5" />
    </G>
  )
}

/** CPU / microchip. Origin = centre. */
export function Chip({ x = 0, y = 0, r = 0, s = 1 }) {
  const d = useDetail()
  const pins = []
  for (let i = 0; i < 5; i += 1) {
    const o = -16 + i * 8
    pins.push(<rect key={`t${i}`} x={o - 1.6} y="-27" width="3.2" height="7" rx="1" fill={C.n2} />)
    pins.push(<rect key={`b${i}`} x={o - 1.6} y="20" width="3.2" height="7" rx="1" fill={C.n2} />)
    pins.push(<rect key={`l${i}`} x="-27" y={o - 1.6} width="7" height="3.2" rx="1" fill={C.n2} />)
    pins.push(<rect key={`r${i}`} x="20" y={o - 1.6} width="7" height="3.2" rx="1" fill={C.n2} />)
  }
  return (
    <G x={x} y={y} r={r} s={s}>
      <rect x="-21" y="-17" width="46" height="46" rx="6" fill={C.shadow} opacity="0.3" />
      {pins}
      <rect x="-22" y="-22" width="44" height="44" rx="6" fill={C.deep} />
      <rect x="-22" y="-22" width="44" height="12" rx="6" fill={C.mid} opacity="0.5" />
      <rect x="-12" y="-12" width="24" height="24" rx="3" fill={C.ink} opacity="0.85" />
      {d !== 'compact' && <path d="M-6-6H6M-6 0H6M-6 6H2" stroke={C.leaf} strokeWidth="1.8" strokeLinecap="round" />}
      <circle cx="-17" cy="-17" r="1.8" fill={C.paper} opacity="0.8" />
    </G>
  )
}

/** Gear. Origin = centre. */
export function Cog({ x = 0, y = 0, s = 1, n = 10, ro = 40, ri = 31, hole = 11, tone = 'deep' }) {
  const pts = []
  for (let i = 0; i < n; i += 1) {
    const a0 = (i / n) * Math.PI * 2
    const w = (Math.PI * 2) / n
    const seg = [[a0 - w * 0.34, ri], [a0 - w * 0.2, ro], [a0 + w * 0.2, ro], [a0 + w * 0.34, ri]]
    seg.forEach(([a, rr]) => pts.push(`${r1(Math.cos(a) * rr)} ${r1(Math.sin(a) * rr)}`))
  }
  const base = tone === 'deep' ? C.deep : tone === 'mid' ? C.mid : C.soft
  const hi = tone === 'deep' ? C.mid : C.mist
  return (
    <G x={x} y={y} s={s}>
      <path d={`M${pts.join('L')}Z`} fill={base} />
      <path d={`M${pts.slice(0, Math.ceil(pts.length / 2)).join('L')}`} fill="none" stroke={hi} strokeWidth="2.4" strokeLinejoin="round" opacity="0.55" />
      <circle r={ri - 8} fill="none" stroke={hi} strokeWidth="1.2" opacity="0.6" />
      <circle r={hole} fill={C.display} />
      <circle r={hole} fill="none" stroke={C.ink} strokeWidth="1.2" opacity="0.35" />
    </G>
  )
}

/* ───────────────────────── compositions ───────────────────────── */

export function MathsArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      {d === 'full' && <Sheet x={140} y={64} w={56} h={72} r={8} lines={0} head={false} fold={false} />}
      {d === 'full' && (
        <g transform="rotate(8 168 100)">
          <path d="M150 84V122H186" fill="none" stroke={C.soft} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M153 118Q164 70 183 112" fill="none" stroke={C.leaf} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="168" cy="82" r="2.4" fill={C.deep} />
        </g>
      )}
      <SetSquare x={compact ? 50 : 48} y={compact ? 194 : 192} r={-6} s={compact ? 1.0 : 0.95} />
      <Ruler x={compact ? 52 : 56} y={compact ? 184 : 190} r={compact ? -8 : -6} len={compact ? 136 : 140} />
      <DrawingCompass x={compact ? 118 : 124} y={compact ? 74 : 72} s={compact ? 1.14 : 1.04} />
      {d === 'full' && <Pencil x={150} y={197} r={-168} len={70} tone="green" />}
    </g>
  )
}

export function ComputerScienceArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="b" />
      {d === 'full' && (
        <g transform="translate(150 52)">
          <rect x="3" y="4" width="50" height="34" rx="6" fill={C.shadow} opacity="0.3" />
          <rect width="50" height="34" rx="6" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
          <rect width="50" height="9" rx="6" fill={C.mist} />
          <circle cx="8" cy="4.5" r="1.8" fill={C.leaf} /><circle cx="14" cy="4.5" r="1.8" fill={C.soft} /><circle cx="20" cy="4.5" r="1.8" fill={C.soft} />
          <path d="M8 17L14 22L8 27" fill="none" stroke={C.deep} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 27H32" stroke={C.leaf} strokeWidth="2.4" strokeLinecap="round" />
        </g>
      )}
      <Laptop x={compact ? 120 : 126} y={compact ? 186 : 188} s={compact ? 0.98 : 0.92} ui="code" />
      {!compact && (
        <>
          <path d="M82 176H66Q60 176 60 170V158" fill="none" stroke={C.soft} strokeWidth="1.8" />
          <circle cx="60" cy="156" r="2.4" fill={C.leaf} />
        </>
      )}
      {!compact && <Chip x={56} y={178} r={-10} s={d === 'full' ? 0.9 : 0.8} />}
      <DecoFront side="right" />
    </g>
  )
}

export function DesignTechArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="c" />
      {/* blueprint sheet with an isometric block */}
      {!compact && (
        <g transform="rotate(7 150 100)">
          <rect x="106" y="52" width="92" height="76" rx="4" fill={C.shadow} opacity="0.28" transform="translate(3 4)" />
          <rect x="106" y="52" width="92" height="76" rx="4" fill={C.bluePale} stroke={C.blueMid} strokeWidth="1" />
          <path d="M118 52V128M130 52V128M142 52V128M154 52V128M166 52V128M178 52V128M190 52V128M106 66H198M106 80H198M106 94H198M106 108H198M106 122H198" stroke={C.blueMid} strokeWidth="0.6" opacity="0.5" />
          <path d="M138 98L160 88L182 98L160 108Z M138 98V82L160 72L182 82V98 M160 72V88 M160 108V92" fill="none" stroke={C.blue} strokeWidth="1.8" strokeLinejoin="round" />
        </g>
      )}
      <Ruler x={54} y={190} r={-10} len={128} />
      <Cog x={compact ? 118 : 92} y={compact ? 124 : 134} s={compact ? 1.45 : 1.1} />
      {!compact && <Cog x={150} y={164} s={0.66} tone="soft" n={8} ro={40} ri={32} hole={11} />}
      <DecoFront side="right" />
    </g>
  )
}


/* ═════════════════ Further Mathematics · Statistics · Engineering ═════════════════ */

/** Wireframe surface z = sin·cos, in simple isometric projection. Origin = surface centre. */
export function SurfaceMesh({ x = 0, y = 0, n = 7, step = 10.5, amp = 9 }) {
  const pt = (i, j) => {
    const u = i - (n - 1) / 2
    const v = j - (n - 1) / 2
    const z = Math.sin(u * 0.95) * Math.cos(v * 0.95) * amp
    return `${r1((u - v) * step * 0.87)} ${r1((u + v) * step * 0.5 - z)}`
  }
  const rows = []
  const cols = []
  for (let a = 0; a < n; a += 1) {
    const rr = []
    const cc = []
    for (let b = 0; b < n; b += 1) { rr.push(pt(b, a)); cc.push(pt(a, b)) }
    rows.push(`M${rr.join('L')}`)
    cols.push(`M${cc.join('L')}`)
  }
  return (
    <G x={x} y={y}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={cols.join('')} stroke={C.leaf} strokeWidth="1.8" />
        <path d={rows.join('')} stroke={C.blue} strokeWidth="1.8" />
      </g>
    </G>
  )
}

export function FurtherMathsArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      <G x={compact ? 120 : 116} y={compact ? 112 : 104} r={compact ? 0 : -3} s={compact ? 1.12 : 1}>
        <rect x="-66" y="-54" width="132" height="108" rx="9" fill={C.shadow} opacity="0.28" transform="translate(3 5)" />
        <rect x="-66" y="-54" width="132" height="108" rx="9" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
        <path d="M-52 42H54M-52 42V-42" stroke={C.soft} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M54 42l-5-3.4M54 42l-5 3.4M-52-42l-3.4 5M-52-42l3.4 5" stroke={C.soft} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <SurfaceMesh x={2} y={-2} />
      </G>
      {!compact && <GlyphMark x={50} y={160} s={0.88} glyph="integral" fill={C.deep} />}
      {!compact && (
        <G x={178} y={166}>
          <circle cx="2" cy="4" r="25" fill={C.shadow} opacity="0.28" />
          <circle r="25" fill={C.deep} />
          <circle r="20" fill={C.mid} />
          <GlyphMark s={0.3} glyph="sigma" fill={C.paper} />
        </G>
      )}
      {d === 'full' && <Pencil x={92} y={200} r={-4} len={74} tone="blue" />}
    </g>
  )
}

/** Die with pips. Origin = centre. */
export function Die({ x = 0, y = 0, r = 0, s = 1, pips = 5 }) {
  const P = {
    3: [[-8, -8], [0, 0], [8, 8]],
    4: [[-8, -8], [8, -8], [-8, 8], [8, 8]],
    5: [[-8, -8], [8, -8], [0, 0], [-8, 8], [8, 8]],
    6: [[-8, -9], [8, -9], [-8, 0], [8, 0], [-8, 9], [8, 9]],
  }[pips]
  return (
    <G x={x} y={y} r={r} s={s}>
      <rect x="-15" y="-13" width="34" height="34" rx="7" fill={C.shadow} opacity="0.3" />
      <rect x="-17" y="-17" width="34" height="34" rx="7" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
      <rect x="-17" y="8" width="34" height="9" rx="4.5" fill={C.paper2} opacity="0.55" />
      {P.map(([px, py], i) => <circle key={i} cx={px} cy={py} r="3.5" fill={C.deep} />)}
    </G>
  )
}

export function StatisticsArt() {
  const d = useDetail()
  const compact = d === 'compact'
  const heights = [0.14, 0.3, 0.55, 0.82, 1, 0.82, 0.55, 0.3, 0.14]
  const curve = []
  for (let t = -3.2; t <= 3.21; t += 0.2) curve.push(`${r1(t * 17.5)} ${r1(38 - 74 * Math.exp((-t * t) / 2))}`)
  return (
    <g>
      <Deco v="a" />
      <G x={compact ? 120 : 114} y={compact ? 112 : 100} r={compact ? 0 : -3} s={compact ? 1.12 : 1}>
        <rect x="-66" y="-56" width="132" height="112" rx="9" fill={C.shadow} opacity="0.28" transform="translate(3 5)" />
        <rect x="-66" y="-56" width="132" height="112" rx="9" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
        {heights.map((h, i) => (
          <rect key={i} x={-57 + i * 12.8} y={38 - h * 74} width="11.2" height={h * 74} rx="2" fill={i === 4 ? C.leaf : i % 2 ? C.mist : C.soft} />
        ))}
        <path d={`M${curve.join('L')}`} fill="none" stroke={C.deep} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M0-44V38" stroke={C.amber} strokeWidth="2.2" strokeDasharray="4 4" strokeLinecap="round" />
        <path d="M-60 38H60" stroke={C.soft} strokeWidth="2" strokeLinecap="round" />
      </G>
      {!compact && <Die x={154} y={176} r={14} pips={5} />}
      {!compact && <Die x={112} y={186} r={-10} pips={3} s={0.86} />}
      {d === 'full' && (
        <G x={176} y={74}>
          <rect x="3" y="4" width="46" height="38" rx="6" fill={C.shadow} opacity="0.28" />
          <rect width="46" height="38" rx="6" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
          {[[8, 28], [14, 20], [20, 22], [26, 14], [32, 16], [38, 8]].map(([px, py], i) => <circle key={i} cx={px} cy={py} r="2.4" fill={C.leaf} />)}
          <path d="M6 30L40 6" stroke={C.deep} strokeWidth="2" strokeLinecap="round" />
        </G>
      )}
    </g>
  )
}

/** Safety helmet. Origin = centre of the brim. */
export function HardHat({ x = 0, y = 0, s = 1 }) {
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={2} cy={8} rx={56} />
      <path d="M-34-4C-34-44-16-62 0-62S34-44 34-4Z" fill={C.gold} />
      <path d="M8-60C26-52 34-34 34-4H12C14-28 14-44 8-60Z" fill={C.warm3} opacity="0.4" />
      <path d="M-26-14C-26-38-14-52-2-56" fill="none" stroke={C.goldPale} strokeWidth="5" strokeLinecap="round" opacity="0.8" />
      <rect x="-7" y="-63" width="14" height="60" rx="6" fill={C.goldPale} opacity="0.85" />
      <rect x="-9" y="-63" width="4" height="60" rx="2" fill={C.hi} opacity="0.35" />
      <rect x="-50" y="-8" width="100" height="12" rx="6" fill={C.gold} />
      <rect x="-50" y="0" width="100" height="4" rx="2" fill={C.warm3} opacity="0.5" />
      <rect x="-50" y="-8" width="100" height="3.6" rx="1.8" fill={C.hi} opacity="0.3" />
    </G>
  )
}

/** Open-ended spanner. Origin = centre of the jaw head; the handle extends along +x. */
export function Spanner({ x = 0, y = 0, r = 0, s = 1, len = 112 }) {
  const head = 'M-14.8-6L3-6V6L-14.8 6A16 16 0 1 0-14.8-6Z'
  return (
    <G x={x} y={y} r={r} s={s}>
      <path d={head} fill={C.shadow} opacity="0.28" transform="translate(2 4)" />
      <rect x="10" y="-6.4" width={len - 10} height="12.8" rx="6.4" fill={C.shadow} opacity="0.28" transform="translate(2 4)" />
      <rect x="10" y="-6.4" width={len - 10} height="12.8" rx="6.4" fill={C.n2} />
      <rect x="10" y="1.6" width={len - 10} height="4.8" rx="2.4" fill={C.neutral} opacity="0.55" />
      <rect x="10" y="-6.4" width={len - 10} height="3.6" rx="1.8" fill={C.hi} opacity="0.45" />
      <path d={head} fill={C.n2} />
      <path d="M-4-15A16 16 0 0 1 12-8" fill="none" stroke={C.hi} strokeWidth="2.6" strokeLinecap="round" opacity="0.6" />
      <circle cx={len - 8} cy="0" r="3.2" fill={C.neutral} />
    </G>
  )
}

export function EngineeringArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="c" />
      {!compact && (
        <g transform="rotate(-8 150 96)">
          <rect x="104" y="52" width="96" height="76" rx="4" fill={C.shadow} opacity="0.26" transform="translate(3 4)" />
          <rect x="104" y="52" width="96" height="76" rx="4" fill={C.bluePale} stroke={C.blueMid} strokeWidth="1" />
          <path d="M116 52V128M128 52V128M140 52V128M152 52V128M164 52V128M176 52V128M188 52V128M104 66H200M104 80H200M104 94H200M104 108H200M104 122H200" stroke={C.blueMid} strokeWidth="0.6" opacity="0.5" />
          <path d="M122 112V76H146M122 94H140M158 112A18 18 0 0 0 176 94V76" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
      <Spanner x={compact ? 60 : 62} y={compact ? 190 : 186} r={compact ? -34 : -30} len={compact ? 128 : 124} />
      <HardHat x={compact ? 116 : 112} y={compact ? 140 : 132} s={compact ? 1.3 : 1.08} />
      {!compact && <Cog x={178} y={172} s={0.62} tone="deep" n={9} />}
    </g>
  )
}
