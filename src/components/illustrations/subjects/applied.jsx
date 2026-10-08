// src/components/illustrations/subjects/applied.jsx
// Business & Economics · PE & Sport · Food & Nutrition · Health & Care · Generic study desk.
import React from 'react'
import { C, G, Leaf, Shadow, Pencil, BookStack, PottedPlant, Foliage, Deco, DecoFront, useUid } from '../kit'
import { OpenBook } from './humanities'
import { useDetail } from '../IllustrationFrame'
import { GlyphMark } from './GlyphMark'

const r1 = (v) => Math.round(v * 10) / 10

/* ───────────────────────────── parts ───────────────────────────── */

/** Bar chart on a card. Origin = top-left; 100 × 78. */
export function ChartCard({ x = 0, y = 0, r = 0, s = 1, w = 100, h = 78, empty = false }) {
  const bars = [0.32, 0.5, 0.42, 0.68, 0.86]
  const bw = (w - 28) / 5 - 4
  return (
    <G x={x} y={y} r={r} s={s}>
      <rect x="3" y="4" width={w} height={h} rx="7" fill={C.shadow} opacity="0.28" />
      <rect width={w} height={h} rx="7" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
      <path d={`M12 ${h - 14}H${w - 10}M12 12V${h - 14}`} stroke={C.soft} strokeWidth="1.4" strokeLinecap="round" />
      {!empty && bars.map((b, i) => (
        <rect key={i} x={16 + i * (bw + 4)} y={h - 14 - b * (h - 30)} width={bw} height={b * (h - 30)} rx="2.2" fill={[C.mist, C.soft, C.mist, C.leaf, C.deep][i]} />
      ))}
      {!empty && <path d={`M16 ${h - 30}L${w * 0.36} ${h - 40}L${w * 0.54} ${h - 34}L${w - 16} ${h - 58}`} fill="none" stroke={C.amber} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />}
      {!empty && <circle cx={w - 16} cy={h - 58} r="3.4" fill={C.paper} stroke={C.amber} strokeWidth="2" />}
      {empty && <path d={`M12 ${h * 0.3}H${w - 10}M12 ${h * 0.5}H${w - 10}M12 ${h * 0.7}H${w - 10}`} stroke={C.mist} strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />}
      {empty && <path d={`M16 ${h - 24}Q${w * 0.35} ${h - 40} ${w * 0.55} ${h - 34}T${w - 16} ${h - 48}`} fill="none" stroke={C.soft} strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" />}
    </G>
  )
}

/** Stack of coins (plain discs — no currency symbols). Origin = base centre. */
export function Coins({ x = 0, y = 0, s = 1, n = 4 }) {
  const out = []
  for (let i = 0; i < n; i += 1) {
    const cy = -i * 7
    out.push(
      <g key={i}>
        <path d={`M-17 ${cy - 6}V${cy}A17 6 0 0 0 17 ${cy}V${cy - 6}Z`} fill={C.warm3} />
        <ellipse cx="0" cy={cy - 6} rx="17" ry="6" fill={C.gold} />
        <ellipse cx="0" cy={cy - 6} rx="11" ry="3.6" fill="none" stroke={C.goldPale} strokeWidth="1.4" />
      </g>,
    )
  }
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={2} cy={1} rx={22} />
      {out}
    </G>
  )
}

/** Pocket calculator. Origin = bottom-centre. */
export function Calculator({ x = 0, y = 0, r = 0, s = 1 }) {
  return (
    <G x={x} y={y} r={r} s={s}>
      <Shadow cx={2} cy={2} rx={28} />
      <rect x="-24" y="-66" width="48" height="66" rx="7" fill={C.deep} />
      <rect x="-24" y="-66" width="16" height="66" rx="7" fill={C.mid} opacity="0.35" />
      <rect x="-18" y="-60" width="36" height="16" rx="3" fill={C.display} />
      <path d="M2-52H14" stroke={C.leaf} strokeWidth="3" strokeLinecap="round" />
      {[0, 1, 2].flatMap((row) => [0, 1, 2].map((col) => (
        <rect key={`${row}${col}`} x={-17 + col * 12.4} y={-38 + row * 11} width="9" height="8" rx="2.2" fill={col === 2 && row === 2 ? C.amber : C.soft} />
      )))}
    </G>
  )
}

/** Stopwatch. Origin = centre. */
export function Stopwatch({ x = 0, y = 0, s = 1 }) {
  const ticks = []
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2
    const r0 = i % 3 === 0 ? 26 : 29
    ticks.push(`M${r1(Math.sin(a) * r0)} ${r1(-Math.cos(a) * r0)}L${r1(Math.sin(a) * 33)} ${r1(-Math.cos(a) * 33)}`)
  }
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={3} cy={56} rx={34} />
      <rect x="-6" y="-58" width="12" height="9" rx="2.6" fill={C.n2} />
      <rect x="-10" y="-64" width="20" height="8" rx="3.4" fill={C.n3} />
      <G r={42}><rect x="-4" y="-54" width="8" height="8" rx="2" fill={C.n2} transform="translate(0 -6)" /></G>
      <circle r="46" fill={C.deep} />
      <circle r="46" fill="none" stroke={C.ink} strokeWidth="1.4" opacity="0.4" />
      <circle r="38" fill={C.paper} />
      <path d={ticks.join('')} stroke={C.deep} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M0 4L12-22" stroke={C.amber} strokeWidth="3" strokeLinecap="round" />
      <path d="M0 0L-18-6" stroke={C.deep} strokeWidth="3" strokeLinecap="round" />
      <circle r="4.4" fill={C.deep} />
      <path d="M-34-20Q-22-38 0-38" fill="none" stroke={C.hi} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    </G>
  )
}

/** Dumbbell lying on the ground. Origin = bar centre; weights reach ±24 vertically. */
export function Dumbbell({ x = 0, y = 0, s = 1, r = 0 }) {
  return (
    <G x={x} y={y} s={s} r={r}>
      <Shadow cx={2} cy={25} rx={58} />
      <rect x="-40" y="-5.4" width="80" height="10.8" rx="5.4" fill={C.n2} />
      <rect x="-40" y="-5.4" width="80" height="3.6" rx="1.8" fill={C.hi} opacity="0.4" />
      <path d="M-40-2H40" stroke={C.neutral} strokeWidth="1" opacity="0.4" />
      {[-1, 1].map((k) => (
        <g key={k} transform={`scale(${k} 1)`}>
          <rect x="30" y="-24" width="14" height="48" rx="5" fill={C.deep} />
          <rect x="30" y="-24" width="5" height="48" rx="2.5" fill={C.mid} opacity="0.7" />
          <rect x="43" y="-16" width="10" height="32" rx="4" fill={C.mid} />
          <rect x="43" y="-16" width="3.6" height="32" rx="1.8" fill={C.hi} opacity="0.25" />
          <rect x="30" y="-24" width="14" height="6" rx="3" fill={C.hi} opacity="0.2" />
        </g>
      ))}
    </G>
  )
}

/** Bowl of fresh produce. Origin = base centre. */
export function ProduceBowl({ x = 0, y = 0, s = 1 }) {
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={3} cy={2} rx={46} />
      <Leaf x={-20} y={-34} r={-38} l={46} tone="mid" />
      <Leaf x={20} y={-34} r={36} l={48} tone="leaf" />
      <Leaf x={0} y={-36} r={-4} l={52} tone="deep" />
      <circle cx="-16" cy="-36" r="11" fill={C.amber} />
      <circle cx="-19" cy="-40" r="3.2" fill={C.hi} opacity="0.4" />
      <path d="M-16-47Q-12-52-8-48" fill="none" stroke={C.deep} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="14" cy="-32" r="9" fill={C.goldPale} />
      <circle cx="14" cy="-32" r="9" fill="none" stroke={C.gold} strokeWidth="1.4" />
      <path d="M-46-38H46Q46-8 22-2Q0 2-22-2Q-46-8-46-38Z" fill={C.paper} />
      <path d="M46-38Q46-8 22-2Q8 1-6 1Q30-6 38-38Z" fill={C.paper2} opacity="0.8" />
      <path d="M-46-38H46" stroke={C.soft} strokeWidth="3" strokeLinecap="round" />
      <path d="M-40-26Q-26-20-10-20" fill="none" stroke={C.soft} strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
    </G>
  )
}

/** Chopping board with a wooden spoon. Origin = centre. */
export function ChoppingBoard({ x = 0, y = 0, r = 0, s = 1 }) {
  return (
    <G x={x} y={y} r={r} s={s}>
      <rect x="-40" y="-52" width="80" height="104" rx="12" fill={C.shadow} opacity="0.28" transform="translate(3 5)" />
      <rect x="-40" y="-52" width="80" height="104" rx="12" fill={C.warm2} />
      <rect x="-40" y="-52" width="22" height="104" rx="11" fill={C.hi} opacity="0.14" />
      <circle cx="0" cy="-40" r="5" fill={C.warm3} opacity="0.6" />
      <path d="M-26-20H26M-26-8H20M-26 4H26" stroke={C.warm3} strokeWidth="1.2" opacity="0.4" />
    </G>
  )
}

/** Heart with a pulse line. Origin = centre. */
export function Heart({ x = 0, y = 0, s = 1 }) {
  const id = useUid()
  return (
    <G x={x} y={y} s={s}>
      <defs>
        <linearGradient id={`${id}hr`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--rfi-leaf)' }} />
          <stop offset="1" style={{ stopColor: 'var(--rfi-deep)' }} />
        </linearGradient>
      </defs>
      <Shadow cx={2} cy={62} rx={36} />
      <path d="M0 56C-62 12-72-34-40-52C-20-62 0-48 0-34C0-48 20-62 40-52C72-34 62 12 0 56Z" fill={`url(#${id}hr)`} />
      <path d="M-44-44C-58-30-58-4-40 16" fill="none" stroke={C.hi} strokeWidth="4" strokeLinecap="round" opacity="0.4" />
      <path d="M-62 4H-24L-14-14L2 28L14-2H62" fill="none" stroke={C.paper} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
    </G>
  )
}

/** Clipboard with checklist. Origin = top-left; 74 × 98. */
export function Clipboard({ x = 0, y = 0, r = 0, s = 1, ticks = 3, w = 74, h = 98 }) {
  const rows = []
  for (let i = 0; i < 4; i += 1) {
    const yy = 28 + i * 17
    const done = i < ticks
    rows.push(
      <g key={i}>
        <rect x="11" y={yy} width="11" height="11" rx="3" fill={done ? C.leaf : C.display} stroke={done ? 'none' : C.soft} strokeWidth="1.4" />
        {done && <path d={`M13.4 ${yy + 5.6}L16.2 ${yy + 8.4}L20 ${yy + 3}`} fill="none" stroke={C.paper} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
        <rect x="28" y={yy + 2.6} width={i === 3 ? 22 : 34} height="4.4" rx="2.2" fill={C.mist} />
      </g>,
    )
  }
  return (
    <G x={x} y={y} r={r} s={s}>
      <rect x="3" y="5" width={w} height={h} rx="8" fill={C.shadow} opacity="0.28" />
      <rect width={w} height={h} rx="8" fill={C.mid} />
      <rect x="6" y="12" width={w - 12} height={h - 20} rx="4" fill={C.paper} />
      {rows}
      <rect x={w / 2 - 15} y="2" width="30" height="14" rx="5" fill={C.n2} />
      <rect x={w / 2 - 10} y="-2" width="20" height="9" rx="4.4" fill={C.n3} />
    </G>
  )
}

/* ───────────────────────── compositions ───────────────────────── */

export function BusinessArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      <ChartCard x={compact ? 56 : 62} y={compact ? 62 : 54} w={compact ? 128 : 112} h={compact ? 100 : 88} r={-4} />
      {!compact && <Coins x={66} y={198} n={4} s={0.98} />}
      {d === 'full' && <Calculator x={172} y={198} r={6} s={0.95} />}
      {!compact && d !== 'full' && <Coins x={170} y={198} n={3} s={0.9} />}
      <DecoFront side="left" />
    </g>
  )
}

export function PEArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="c" />
      <Stopwatch x={compact ? 120 : 130} y={compact ? 116 : 92} s={compact ? 1.34 : 1.04} />
      {!compact && <Dumbbell x={112} y={168} s={0.84} r={-4} />}
      <DecoFront side="right" />
    </g>
  )
}

export function FoodNutritionArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      {!compact && <ChoppingBoard x={160} y={126} r={12} s={0.86} />}
      <ProduceBowl x={compact ? 120 : 110} y={compact ? 196 : 190} s={compact ? 1.3 : 1.14} />
      {d === 'full' && (
        <g>
          <path d="M184 150L148 196" stroke={C.warm3} strokeWidth="6" strokeLinecap="round" />
          <ellipse cx="186" cy="146" rx="10" ry="14" transform="rotate(35 186 146)" fill={C.warm2} />
        </g>
      )}
      <DecoFront side="left" />
    </g>
  )
}

export function HealthArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      {d === 'full' && <Clipboard x={32} y={92} r={-8} ticks={3} w={66} h={88} />}
      <Heart x={compact ? 120 : 130} y={compact ? 118 : 112} s={compact ? 1.2 : 0.98} />
      <DecoFront side="right" />
    </g>
  )
}

/** The generic study desk: notebook, books, plant, pencil. Fallback for unknown subjects and the
 *  dashboard's "nothing scheduled" state. (At compact size it is a stack of books with a sprout, so
 *  it never reads as a specific subject's open book.) */
export function GenericArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      {compact ? (
        <g>
          <BookStack x={120} y={198} s={1.16} books={[{ w: 100, h: 17, tone: 'mid' }, { w: 88, h: 15, tone: 'cream', dx: 3 }, { w: 76, h: 14, tone: 'blueMid', dx: -3 }]} />
          <Foliage x={120} y={146} kind="sprout" s={1.2} />
        </g>
      ) : (
        <g>
          <BookStack x={62} y={174} s={0.9} books={[{ w: 66, h: 14, tone: 'mid' }, { w: 56, h: 12, tone: 'cream', dx: 3 }]} />
          <PottedPlant x={176} y={176} s={0.86} kind="broad" />
          <OpenBook x={120} y={196} s={0.96} cover="cream" />
          {d === 'full' && <Pencil x={128} y={206} r={-12} len={70} />}
        </g>
      )}
      <DecoFront side="left" />
    </g>
  )
}


/* ═══════════════════════════ Economics · Accounting ═══════════════════════════ */

/** Supply & demand diagram. Origin = card centre; 128 × 100. */
export function SupplyDemand({ x = 0, y = 0, r = 0, s = 1 }) {
  return (
    <G x={x} y={y} r={r} s={s}>
      <rect x="-61" y="-45" width="128" height="100" rx="8" fill={C.shadow} opacity="0.28" />
      <rect x="-64" y="-50" width="128" height="100" rx="8" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
      <path d="M-50 36H52M-50 36V-38" stroke={C.soft} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M-46 28C-22 22 6-2 38-30" fill="none" stroke={C.leaf} strokeWidth="4" strokeLinecap="round" />
      <path d="M-46-30C-18-16 8 12 38 30" fill="none" stroke={C.blue} strokeWidth="4" strokeLinecap="round" />
      <path d="M-5 -1V36M-5 -1H-50" stroke={C.amber} strokeWidth="2.2" strokeDasharray="4 4" strokeLinecap="round" fill="none" />
      <circle cx="-5" cy="-1" r="6" fill={C.paper} stroke={C.amber} strokeWidth="3.4" />
    </G>
  )
}

/** A coin standing on its edge, showing £. Origin = centre. */
export function PoundCoin({ x = 0, y = 0, s = 1, r = 0 }) {
  return (
    <G x={x} y={y} s={s} r={r}>
      <Shadow cx={3} cy={26} rx={24} />
      <circle cx="3" cy="3" r="26" fill={C.warm3} />
      <circle r="26" fill={C.gold} />
      <circle r="21" fill="none" stroke={C.goldPale} strokeWidth="2.4" />
      <GlyphMark s={0.34} glyph="pound" fill={C.warm3} />
      <path d="M-18-14A22 22 0 0 1-4-22" fill="none" stroke={C.hi} strokeWidth="3" strokeLinecap="round" opacity="0.55" />
    </G>
  )
}

export function EconomicsArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      <SupplyDemand x={compact ? 120 : 112} y={compact ? 112 : 102} r={compact ? 0 : -3} s={compact ? 1.12 : 1} />
      {!compact && <PoundCoin x={186} y={164} s={0.96} r={8} />}
      {d === 'full' && <Coins x={62} y={198} n={3} s={0.92} />}
      <DecoFront side="left" />
    </g>
  )
}

/** Till receipt with a torn edge. Origin = top-left; 38 × 108. */
export function Receipt({ x = 0, y = 0, r = 0, s = 1 }) {
  return (
    <G x={x} y={y} r={r} s={s}>
      <path d={`M3 4H41V96${'l-6.3 9l-6.3-9'.repeat(3)}Z`} fill={C.shadow} opacity="0.28" />
      <path d={`M0 0H38V92${'l-6.3 9l-6.3-9'.repeat(3)}Z`} fill={C.paper} stroke={C.paper2} strokeWidth="1" />
      <rect x="7" y="9" width="24" height="5" rx="2.5" fill={C.leaf} />
      {[22, 31, 40, 49, 58].map((yy, i) => <g key={yy}><rect x="7" y={yy} width={i % 2 ? 12 : 16} height="3.4" rx="1.7" fill={C.mist} /><rect x="24" y={yy} width="7" height="3.4" rx="1.7" fill={C.soft} /></g>)}
      <rect x="7" y="72" width="24" height="5" rx="2.5" fill={C.deep} />
    </G>
  )
}

export function AccountingArt() {
  const d = useDetail()
  const compact = d === 'compact'
  const bx = compact ? 100 : 118
  const by = compact ? 150 : 170
  const bs = compact ? 0.98 : 1.08
  return (
    <g>
      <Deco v="a" />
      {!compact && <Receipt x={44} y={74} r={-8} s={1.04} />}
      <OpenBook x={bx} y={by} s={bs} cover="cream" />
      <g transform={`translate(${bx} ${by}) scale(${bs})`}>
        <path d="M-16-44V4M-30-48V0M-44-52V-5M16-44V4M30-48V0M44-52V-5" stroke={C.soft} strokeWidth="1" opacity="0.9" />
      </g>
      <Calculator x={compact ? 164 : 182} y={198} r={5} s={compact ? 1.1 : 0.88} />
      {d === 'full' && <Pencil x={92} y={206} r={-6} len={64} tone="green" />}
      <DecoFront side="left" />
    </g>
  )
}
