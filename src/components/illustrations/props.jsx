// src/components/illustrations/props.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Still-life props that more than one kind of artwork uses: an open book, a speech bubble, a
// magnifier, a chart card, a calculator, a clipboard and a cog. Subject pictures, scenes and badges
// all import them from here.
//
// WHY A FILE OF THEIR OWN: they used to live in subjects/humanities, applied and stem, which also
// import the language-script data (subjects/languages.jsx → subjects/glyphs.js, ~13 kB). A page that
// only needed an empty-state scene or a badge therefore downloaded every language's letterforms.
// Keep this file free of imports from subjects/ so scenes and badges never pay for subject art.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { C, G, Shadow } from './kit'
import { useDetail } from './IllustrationFrame'

const r1 = (v) => Math.round(v * 10) / 10

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
