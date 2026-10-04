// src/components/illustrations/scenes/parts.jsx
// Parts that only the scene artwork needs (desks, windows, planners, card fans…).
// Same conventions as ../kit.jsx: CSS-variable colours, local origins, detail-tier aware.
import React from 'react'
import { C, G, Leaf, Sprig, Shadow, useUid } from '../kit'
import { useDetail } from '../IllustrationFrame'

const r1 = (v) => Math.round(v * 10) / 10

/** Desk top seen edge-on: a slim wooden slab. */
export function Desk({ y = 202, x1 = 38, x2 = 282 }) {
  const w = x2 - x1
  return (
    <g>
      <rect x={x1 + 4} y={y + 8} width={w - 8} height="6" rx="3" fill={C.shadow} opacity="0.3" />
      <rect x={x1} y={y} width={w} height="10" rx="5" fill={C.warm2} />
      <rect x={x1} y={y} width={w} height="4" rx="2" fill={C.warm} />
      <rect x={x1} y={y + 6} width={w} height="4" rx="2" fill={C.warm3} opacity="0.45" />
    </g>
  )
}

/** Window with soft daylight and foliage outside. Origin = top-left. */
export function WindowFrame({ x = 0, y = 0, w = 92, h = 100 }) {
  const id = useUid()
  return (
    <G x={x} y={y}>
      <defs>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--rfi-paper)' }} />
          <stop offset="1" style={{ stopColor: 'var(--rfi-mist)' }} />
        </linearGradient>
        <clipPath id={`${id}wc`}><rect x="4" y="4" width={w - 8} height={h - 8} rx="3" /></clipPath>
      </defs>
      <rect x="2" y="3" width={w} height={h} rx="6" fill={C.shadow} opacity="0.2" />
      <rect width={w} height={h} rx="6" fill={C.paper2} />
      <rect x="4" y="4" width={w - 8} height={h - 8} rx="3" fill={`url(#${id}w)`} />
      <g clipPath={`url(#${id}wc)`} opacity="0.85">
        <ellipse cx={w * 0.28} cy={h * 0.86} rx="26" ry="20" fill={C.soft} />
        <ellipse cx={w * 0.7} cy={h * 0.92} rx="30" ry="22" fill={C.leaf} opacity="0.7" />
        <Leaf x={w * 0.2} y={h * 0.9} r={-24} l={44} tone="soft" />
        <Leaf x={w * 0.8} y={h * 0.9} r={26} l={50} tone="leaf" />
        <circle cx={w * 0.72} cy={h * 0.26} r="9" fill={C.goldPale} />
      </g>
      <path d={`M${w / 2} 4V${h - 4}M4 ${h / 2}H${w - 4}`} stroke={C.paper2} strokeWidth="3.4" />
    </G>
  )
}

/** Mug. Origin = base centre. */
export function Mug({ x = 0, y = 0, s = 1 }) {
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={2} cy={1} rx={16} />
      <path d="M12-24H14Q24-24 24-14T14-6H11" fill="none" stroke={C.paper2} strokeWidth="4.4" strokeLinecap="round" />
      <path d="M-13-28H13V-6Q13 0 7 0H-7Q-13 0-13-6Z" fill={C.paper} />
      <path d="M5-28H13V-6Q13 0 7 0H3Z" fill={C.paper2} opacity="0.9" />
      <ellipse cx="0" cy="-28" rx="13" ry="3.2" fill={C.warm3} />
      <path d="M-9-24V-10" stroke={C.hi} strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
    </G>
  )
}

/** Analog clock. Origin = centre. */
export function Clock({ x = 0, y = 0, s = 1, hands = [-30, 60] }) {
  const ticks = []
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2
    const r0 = i % 3 === 0 ? 20 : 23
    ticks.push(`M${r1(Math.sin(a) * r0)} ${r1(-Math.cos(a) * r0)}L${r1(Math.sin(a) * 26)} ${r1(-Math.cos(a) * 26)}`)
  }
  const hand = (deg, len) => {
    const a = (deg * Math.PI) / 180
    return `M0 0L${r1(Math.sin(a) * len)} ${r1(-Math.cos(a) * len)}`
  }
  return (
    <G x={x} y={y} s={s}>
      <circle cx="2" cy="4" r="34" fill={C.shadow} opacity="0.25" />
      <circle r="34" fill={C.deep} />
      <circle r="29" fill={C.paper} />
      <path d={ticks.join('')} stroke={C.deep} strokeWidth="2" strokeLinecap="round" />
      <path d={hand(hands[0], 14)} stroke={C.deep} strokeWidth="3.2" strokeLinecap="round" />
      <path d={hand(hands[1], 21)} stroke={C.amber} strokeWidth="2.6" strokeLinecap="round" />
      <circle r="3" fill={C.deep} />
      <path d="M-22-14Q-14-26 0-27" fill="none" stroke={C.hi} strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
    </G>
  )
}

/** Over-ear headphones, front-on. Origin = band apex centre. */
export function Headphones({ x = 0, y = 0, s = 1 }) {
  return (
    <G x={x} y={y} s={s}>
      <path d="M-46 62C-50 6-30-4 0-4S50 6 46 62" fill="none" stroke={C.shadow} strokeWidth="11" strokeLinecap="round" opacity="0.25" transform="translate(2 4)" />
      <path d="M-46 62C-50 6-30-4 0-4S50 6 46 62" fill="none" stroke={C.deep} strokeWidth="10" strokeLinecap="round" />
      <path d="M-44 46C-46 12-28 2 0 2" fill="none" stroke={C.mid} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      {[-1, 1].map((k) => (
        <g key={k} transform={`translate(${k * 46} 62)`}>
          <rect x="-15" y="-6" width="30" height="48" rx="14" fill={C.mid} />
          <rect x={k > 0 ? -15 : 2} y="-6" width="13" height="48" rx="6.5" fill={C.deep} opacity="0.5" />
          <rect x={k > 0 ? -22 : 8} y="2" width="14" height="32" rx="7" fill={C.ink} opacity="0.85" />
          <rect x="-8" y="2" width="5" height="30" rx="2.5" fill={C.hi} opacity="0.22" />
        </g>
      ))}
    </G>
  )
}

/** Highlighter pen lying along +x. Origin = tip. */
export function Highlighter({ x = 0, y = 0, r = 0, tone = 'gold', len = 70 }) {
  const body = tone === 'leaf' ? C.leaf : tone === 'blue' ? C.blueMid : C.gold
  const dark = tone === 'leaf' ? C.mid : tone === 'blue' ? C.blue : C.warm3
  return (
    <g transform={`translate(${r1(x)} ${r1(y)}) rotate(${r})`}>
      <path d="M0 0L9-5V5Z" fill={body} />
      <rect x="9" y="-5.6" width="14" height="11.2" rx="2" fill={C.paper} opacity="0.9" />
      <rect x="23" y="-7" width={len - 23} height="14" rx="4" fill={body} />
      <rect x="23" y="1" width={len - 23} height="6" rx="3" fill={dark} opacity="0.5" />
      <rect x="27" y="-5.4" width={len - 36} height="2.6" rx="1.3" fill={C.hi} opacity="0.35" />
      <rect x={len - 8} y="-7" width="8" height="14" rx="3" fill={dark} />
    </g>
  )
}

/** Sticky note. Origin = top-left. */
export function StickyNote({ x = 0, y = 0, r = 0, s = 1, tone = 'gold', size = 40, lines = true }) {
  const fill = tone === 'leaf' ? C.mist : tone === 'blue' ? C.bluePale : C.goldPale
  return (
    <G x={x} y={y} r={r} s={s}>
      <rect x="2" y="3" width={size} height={size} rx="2" fill={C.shadow} opacity="0.28" />
      <rect width={size} height={size} rx="2" fill={fill} />
      <path d={`M0 ${size - 9}Q${size * 0.5} ${size - 6} ${size} ${size - 10}V${size}H0Z`} fill={C.ink} opacity="0.05" />
      {lines && <path d={`M${size * 0.16} ${size * 0.28}H${size * 0.8}M${size * 0.16} ${size * 0.5}H${size * 0.62}`} stroke={C.soft} strokeWidth="2.4" strokeLinecap="round" />}
    </G>
  )
}

/** Index cards fanned from a pivot. Origin = pivot (bottom-left of the cards). */
export function CardFan({ x = 0, y = 0, s = 1, n = 3, spread = 16, w = 82, h = 54, filled = true, base = -16 }) {
  const out = []
  for (let i = 0; i < n; i += 1) {
    const a = base + i * spread
    const front = i === n - 1
    out.push(
      <g key={i} transform={`rotate(${a})`}>
        <rect x="2" y={-h + 3} width={w} height={h} rx="5" fill={C.shadow} opacity="0.28" />
        <rect y={-h} width={w} height={h} rx="5" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
        {filled && (
          <g>
            <rect x="9" y={-h + 10} width={w * 0.5} height="4.6" rx="2.3" fill={front ? C.leaf : C.soft} />
            <rect x="9" y={-h + 21} width={w - 20} height="3.4" rx="1.7" fill={C.mist} />
            <rect x="9" y={-h + 29} width={w - 30} height="3.4" rx="1.7" fill={C.mist} />
          </g>
        )}
      </g>,
    )
  }
  return <G x={x} y={y} s={s}>{out}</G>
}

/** Wall/desk planner page with day cells. Origin = top-left. */
export function Planner({ x = 0, y = 0, r = 0, s = 1, w = 150, h = 148, marks = [], empty = false }) {
  const d = useDetail()
  const cols = 7
  const rows = 5
  const padX = 12
  const gx = 3.6
  const cw = (w - padX * 2 - gx * (cols - 1)) / cols
  const top = 54
  const ch = (h - top - 12 - 3.6 * (rows - 1)) / rows
  const cells = []
  for (let rIdx = 0; rIdx < rows; rIdx += 1) {
    for (let c = 0; c < cols; c += 1) {
      const i = rIdx * cols + c
      const m = marks.find((mk) => mk.i === i)
      const fill = m ? (m.tone === 'amber' ? C.amber : m.tone === 'blue' ? C.blueMid : m.tone === 'deep' ? C.deep : C.leaf) : C.mint
      cells.push(
        <rect key={i} x={padX + c * (cw + gx)} y={top + rIdx * (ch + 3.6)} width={cw} height={ch} rx="3.4" fill={fill} opacity={m ? 1 : 0.9} />,
      )
    }
  }
  return (
    <G x={x} y={y} r={r} s={s}>
      <rect x="3" y="5" width={w} height={h} rx="10" fill={C.shadow} opacity="0.28" />
      <rect width={w} height={h} rx="10" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
      <path d={`M0 10Q0 0 10 0H${w - 10}Q${w} 0 ${w} 10V30H0Z`} fill={C.deep} />
      <rect x="0" y="22" width={w} height="8" fill={C.deep} />
      {[0.22, 0.78].map((k) => (
        <g key={k}>
          <rect x={w * k - 3.4} y="-7" width="6.8" height="20" rx="3.4" fill={C.n3} stroke={C.n2} strokeWidth="1" />
        </g>
      ))}
      <rect x={w * 0.5 - 22} y="11" width="44" height="6" rx="3" fill={C.mist} opacity="0.9" />
      {d !== 'compact' && (
        <g fill={C.soft}>
          {Array.from({ length: cols }, (_, c) => (
            <rect key={c} x={padX + c * (cw + gx) + cw * 0.18} y="40" width={cw * 0.64} height="3.6" rx="1.8" />
          ))}
        </g>
      )}
      {cells}
      {empty && (
        <rect x={padX + 3 * (cw + gx) - 2} y={top + 2 * (ch + 3.6) - 2} width={cw + 4} height={ch + 4} rx="5" fill="none" stroke={C.amber} strokeWidth="2" strokeDasharray="3.5 3.5" />
      )}
    </G>
  )
}

/** Closed notebook with bookmark and elastic band. Origin = bottom-left. */
export function Notebook({ x = 0, y = 0, r = 0, s = 1, w = 84, h = 110, tone = 'deep' }) {
  const cover = tone === 'cream' ? C.warm : tone === 'blue' ? C.blue : C.deep
  const edge = tone === 'cream' ? C.warm2 : tone === 'blue' ? C.ink : C.ink
  return (
    <G x={x} y={y} r={r} s={s}>
      <rect x="3" y={-h + 5} width={w} height={h} rx="7" fill={C.shadow} opacity="0.28" />
      <rect y={-h} width={w} height={h} rx="7" fill={cover} />
      <rect y={-h} width="10" height={h} rx="5" fill={edge} opacity="0.4" />
      <rect x="14" y={-h + 14} width={w - 28} height="22" rx="4" fill={C.paper} opacity="0.92" />
      <path d={`M24 ${-h + 22}H${w - 30}M24 ${-h + 29}H${w - 44}`} stroke={C.soft} strokeWidth="2.6" strokeLinecap="round" />
      <rect x={w - 24} y={-h} width="6" height={h + 12} fill={C.amber} />
      <path d={`M${w - 24} ${12}L${w - 21} 7L${w - 18} 12Z`} fill={C.amber} />
      <rect x={w - 4} y={-h} width="3" height={h} rx="1.5" fill={C.hi} opacity="0.2" />
    </G>
  )
}

/** Worksheet used by the mistakes scenes. Origin = top-left; 120 × 150. */
export function Worksheet({ x = 0, y = 0, r = 0, s = 1, w = 120, h = 150, children }) {
  return (
    <G x={x} y={y} r={r} s={s}>
      <rect x="3" y="5" width={w} height={h} rx="6" fill={C.shadow} opacity="0.28" />
      <rect width={w} height={h} rx="6" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
      <rect x="14" y="14" width={w * 0.4} height="6" rx="3" fill={C.leaf} />
      <path d={`M${w - 15} 0H${w - 6}Q${w} 0 ${w} 6V15Z`} fill={C.paper2} />
      {children}
    </G>
  )
}

/** Simple pencil case. Origin = bottom-left. */
export function PencilCase({ x = 0, y = 0, r = 0, s = 1 }) {
  return (
    <G x={x} y={y} r={r} s={s}>
      <Shadow cx={38} cy={2} rx={46} />
      {[[12, -62, C.gold], [26, -68, C.blueMid], [40, -64, C.leaf]].map(([px, py, f], i) => (
        <g key={i} transform={`rotate(${(i - 1) * 6} ${px} 0)`}>
          <rect x={px - 4} y={py} width="8" height={-py - 6} rx="1.4" fill={f} />
          <path d={`M${px - 4} ${py}L${px} ${py - 9}L${px + 4} ${py}Z`} fill={C.warm} />
          <path d={`M${px - 1.4} ${py - 5}L${px} ${py - 9}L${px + 1.4} ${py - 5}Z`} fill={C.ink} />
        </g>
      ))}
      <rect y="-36" width="78" height="36" rx="12" fill={C.deep} />
      <rect y="-36" width="78" height="12" rx="6" fill={C.mid} opacity="0.55" />
      <rect x="8" y="-26" width="62" height="3.4" rx="1.7" fill={C.ink} opacity="0.3" />
      <rect x="58" y="-24" width="12" height="20" rx="3" fill={C.soft} opacity="0.9" />
    </G>
  )
}

/** Bookshelf unit. Origin = top-left; 180 × 150. */
export function Shelf({ x = 0, y = 0, w = 180, h = 150 }) {
  const books = (rowY, seed) => {
    const palette = [C.deep, C.mid, C.warm2, C.blueMid, C.soft, C.warm, C.leaf, C.neutral]
    const out = []
    let bx = 12
    let i = seed
    while (bx < w - 34) {
      const bw = 9 + ((i * 7) % 8)
      const bh = 34 + ((i * 13) % 22)
      out.push(
        <g key={`${rowY}-${i}`}>
          <rect x={bx} y={rowY - bh} width={bw} height={bh} rx="1.8" fill={palette[i % palette.length]} />
          <rect x={bx + 1.6} y={rowY - bh + 6} width={bw - 3.2} height="2.4" rx="1.2" fill={C.hi} opacity="0.4" />
        </g>,
      )
      bx += bw + 1.6
      i += 1
    }
    return out
  }
  return (
    <G x={x} y={y}>
      <rect x="3" y="5" width={w} height={h} rx="6" fill={C.shadow} opacity="0.25" />
      <rect width={w} height={h} rx="6" fill={C.warm2} />
      <rect x="6" y="6" width={w - 12} height={h - 12} rx="3" fill={C.warm3} opacity="0.5" />
      <g>{books(h * 0.5, 2)}</g>
      <g>{books(h - 8, 5)}</g>
      <rect x="0" y={h * 0.5} width={w} height="7" fill={C.warm} />
      <rect x="0" y={h * 0.5} width={w} height="2.6" fill={C.hi} opacity="0.3" />
      <rect x="0" y={h - 8} width={w} height="8" rx="3" fill={C.warm} />
    </G>
  )
}

/** Manila folder with papers. Origin = bottom-left; 84 × 62. */
export function Folder({ x = 0, y = 0, r = 0, s = 1 }) {
  return (
    <G x={x} y={y} r={r} s={s}>
      <Shadow cx={42} cy={2} rx={46} />
      <rect x="6" y="-58" width="68" height="44" rx="3" fill={C.paper} transform="rotate(-4 40 -36)" />
      <rect x="10" y="-62" width="68" height="44" rx="3" fill={C.paper} stroke={C.paper2} strokeWidth="1" transform="rotate(3 44 -40)" />
      <path d="M12-50H48M12-42H60" stroke={C.mist} strokeWidth="2.6" strokeLinecap="round" transform="rotate(3 44 -40)" />
      <path d="M0 0V-48Q0-52 4-52H26L32-44H78Q82-44 82-40V0Z" fill={C.warm2} />
      <path d="M0 0V-34Q0-38 4-38H78Q82-38 82-34V0Z" fill={C.warm} />
      <rect x="0" y="-38" width="82" height="3" fill={C.hi} opacity="0.35" />
    </G>
  )
}

/** Medallion with laurel-free rim. Origin = centre. */
export function Medallion({ x = 0, y = 0, s = 1, r = 40, emblem = 'sprig' }) {
  const k = r / 40
  return (
    <G x={x} y={y} s={s}>
      <circle cx="2" cy="4" r={r + 2} fill={C.shadow} opacity="0.28" />
      <circle r={r} fill={C.deep} />
      <circle r={r - 5} fill={C.mid} />
      <circle r={r - 9} fill={C.paper} />
      <circle r={r - 9} fill="none" stroke={C.soft} strokeWidth="1.4" />
      {emblem === 'sprig' && (
        <g transform={`scale(${k})`}>
          <path d="M0 18V-10" stroke={C.deep} strokeWidth="2.6" strokeLinecap="round" />
          <Leaf x={0} y={6} r={-52} l={20} tone="leaf" />
          <Leaf x={0} y={6} r={52} l={20} tone="mid" />
          <Leaf x={0} y={-4} r={-48} l={18} tone="mid" />
          <Leaf x={0} y={-4} r={48} l={18} tone="leaf" />
          <Leaf x={0} y={-10} r={0} l={16} tone="deep" />
        </g>
      )}
      <path d={`M${-r * 0.6} ${-r * 0.6}Q${-r * 0.2} ${-r * 0.92} ${r * 0.3} ${-r * 0.84}`} fill="none" stroke={C.hi} strokeWidth="3" strokeLinecap="round" opacity="0.35" />
    </G>
  )
}

/** Ribbon tails hanging from a point. Origin = attach point. */
export function RibbonTails({ x = 0, y = 0, s = 1, len = 52 }) {
  return (
    <G x={x} y={y} s={s}>
      <path d={`M-18 0L-30 ${len}L-20 ${len - 9}L-10 ${len}L-2 0Z`} fill={C.leaf} />
      <path d={`M18 0L30 ${len}L20 ${len - 9}L10 ${len}L2 0Z`} fill={C.mid} />
      <path d={`M-18 0L-10 ${len}L-2 0Z`} fill={C.ink} opacity="0.12" />
    </G>
  )
}

/** Foliage framing for scene stages (landscape counterpart of Deco). */
export function SceneDeco({ v = 'a' }) {
  const d = useDetail()
  if (d === 'compact') return null
  const std = d === 'standard'
  return (
    <g>
      {(v === 'a' || v === 'l') && <Sprig x={36} y={190} l={std ? 70 : 90} n={std ? 4 : 6} bend={-0.5} tone="soft" />}
      {(v === 'a' || v === 'r') && <Sprig x={286} y={196} l={std ? 64 : 84} n={std ? 4 : 5} bend={0.55} tone="leaf" flip />}
    </g>
  )
}
