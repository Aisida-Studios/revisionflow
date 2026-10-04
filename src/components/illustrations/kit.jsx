// src/components/illustrations/kit.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Shared drawing parts for the RevisionFlow illustration family.
//
// Every illustration is composed from these, which is what keeps ~60 pieces of artwork
// reading as one family: same rendering recipe (base tone → one shade shape → optional soft
// outline), same foliage, same paper/book/pencil construction, same shadows.
//
// CONVENTIONS
//  • Colours always come from C (CSS variables, see illustrations.css) — never a hex literal —
//    so light/dark adaptation happens in one place.
//  • Parts draw in local coordinates (origin documented per part) and are placed with x / y /
//    r (rotation, degrees) / s (scale). Nothing here assumes a canvas size.
//  • Hierarchy of detail: primary object = full recipe, supporting objects = base + shade,
//    decoration = base only. Parts check useDetail() to drop fine lines at small sizes.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useId } from 'react'
import { useDetail, useIllId } from './IllustrationFrame'

/** Unique id per rendered PART instance (safe for gradients/clipPaths even if a part appears twice). */
export function useUid() {
  return `u${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
}

export const C = {
  ink: 'var(--rfi-ink)', deep: 'var(--rfi-deep)', mid: 'var(--rfi-mid)', leaf: 'var(--rfi-leaf)',
  soft: 'var(--rfi-soft)', mist: 'var(--rfi-mist)', mint: 'var(--rfi-mint)',
  paper: 'var(--rfi-paper)', paper2: 'var(--rfi-paper2)',
  neutral: 'var(--rfi-neutral)', n2: 'var(--rfi-neutral2)', n3: 'var(--rfi-neutral3)',
  teal: 'var(--rfi-teal)', tealPale: 'var(--rfi-teal-pale)',
  blue: 'var(--rfi-blue)', blueMid: 'var(--rfi-blue-mid)', bluePale: 'var(--rfi-blue-pale)',
  warm: 'var(--rfi-warm)', warm2: 'var(--rfi-warm2)', warm3: 'var(--rfi-warm3)',
  gold: 'var(--rfi-gold)', goldPale: 'var(--rfi-gold-pale)',
  amber: 'var(--rfi-amber)', amberPale: 'var(--rfi-amber-pale)',
  ring: 'var(--rfi-ring)', shadow: 'var(--rfi-shadow)',
  display: 'var(--rfi-display)', screen: 'var(--rfi-screen)', glass: 'var(--rfi-glass)', hi: 'var(--rfi-hi)',
}

const r1 = (v) => Math.round(v * 10) / 10
const rad = (deg) => (deg * Math.PI) / 180

/** Placement wrapper: translate · rotate · scale. */
export function G({ x = 0, y = 0, r = 0, s = 1, o, children, ...rest }) {
  const t = `translate(${r1(x)} ${r1(y)})${r ? ` rotate(${r})` : ''}${s !== 1 ? ` scale(${s})` : ''}`
  return <g transform={t} opacity={o} {...rest}>{children}</g>
}

/* ═══════════════════════════ Backdrops & shadows ═══════════════════════════ */

/** Soft mint disc — the signature backdrop of subject artwork (square compositions). */
export function Disc({ cx = 120, cy = 122, r = 100 }) {
  const id = useIllId()
  return (
    <g>
      <defs>
        <radialGradient id={`${id}d`} cx="38%" cy="32%" r="78%">
          <stop offset="0" style={{ stopColor: 'var(--rfi-disc-hi)' }} />
          <stop offset="1" style={{ stopColor: 'var(--rfi-disc-lo)' }} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}d)`} />
      <circle cx={cx} cy={cy} r={r - 1.2} fill="none" stroke={C.ring} strokeWidth="1.3" />
    </g>
  )
}

/** Soft stage — the wide, slightly tilted backdrop of scene artwork (landscape compositions). */
export function Stage({ cx = 160, cy = 128, rx = 146, ry = 100, rot = -3 }) {
  const id = useIllId()
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      <defs>
        <radialGradient id={`${id}s`} cx="38%" cy="30%" r="80%">
          <stop offset="0" style={{ stopColor: 'var(--rfi-disc-hi)' }} />
          <stop offset="1" style={{ stopColor: 'var(--rfi-disc-lo)' }} />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id}s)`} />
      <ellipse cx={cx} cy={cy} rx={rx - 1.2} ry={ry - 1.2} fill="none" stroke={C.ring} strokeWidth="1.3" />
    </g>
  )
}

/** Soft contact shadow: two stacked ellipses read as a blurred edge without any filter cost. */
export function Shadow({ cx = 0, cy = 0, rx = 40, ry, o = 1 }) {
  const h = ry ?? Math.max(3, rx * 0.13)
  return (
    <g opacity={o}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={h} fill={C.shadow} opacity="0.45" />
      <ellipse cx={cx} cy={cy} rx={rx * 0.72} ry={h * 0.7} fill={C.shadow} opacity="0.55" />
    </g>
  )
}

/* ═══════════════════════════════ Foliage ═══════════════════════════════ */

const TONES = {
  deep: [C.deep, C.ink],
  mid: [C.mid, C.deep],
  leaf: [C.leaf, C.mid],
  soft: [C.soft, C.leaf],
  mist: [C.mist, C.soft],
}

/** One leaf. Origin = leaf base, pointing up (negative y). b bends the tip sideways. */
export function Leaf({ x = 0, y = 0, r = 0, l = 40, w, b = 0, tone = 'mid', rib = true, o }) {
  const ww = w ?? l * 0.37
  const c1R = `${r1(ww * 0.95)} ${r1(-l * 0.1)}`
  const c2R = `${r1(ww * 1.1 + b * 0.7)} ${r1(-l * 0.66)}`
  const c1L = `${r1(-ww * 0.95)} ${r1(-l * 0.1)}`
  const c2L = `${r1(-ww * 1.1 + b * 0.7)} ${r1(-l * 0.66)}`
  const tip = `${r1(b)} ${r1(-l)}`
  const mid = `${r1(b * 0.2)} ${r1(-l * 0.55)}`
  const [base, shade] = TONES[tone] || TONES.mid
  const d = useDetail()
  return (
    <g transform={`translate(${r1(x)} ${r1(y)}) rotate(${r})`} opacity={o}>
      <path d={`M0 0C${c1R} ${c2R} ${tip}C${c2L} ${c1L} 0 0Z`} fill={base} />
      <path d={`M0 0C${c1R} ${c2R} ${tip}Q${mid} 0 0Z`} fill={shade} opacity="0.5" />
      {rib && d !== 'compact' && (
        <path d={`M0 0Q${mid} ${tip}`} fill="none" stroke={C.ink} strokeOpacity="0.26"
          strokeWidth={r1(Math.max(0.7, l * 0.02))} strokeLinecap="round" />
      )}
    </g>
  )
}

/** A leafy sprig. Origin = stem base, growing up; flip mirrors the leaf order. */
export function Sprig({ x = 0, y = 0, r = 0, l = 80, n = 5, bend = 0.3, tone = 'mid', flip = false, size = 1, o }) {
  const P0 = [0, 0]
  const P1 = [bend * l * 0.45, -l * 0.55]
  const P2 = [bend * l * 0.32, -l * 0.98]
  const at = (t) => [
    (1 - t) * (1 - t) * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0],
    (1 - t) * (1 - t) * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1],
  ]
  const ang = (t) => {
    const dx = 2 * (1 - t) * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0])
    const dy = 2 * (1 - t) * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1])
    return (Math.atan2(dx, -dy) * 180) / Math.PI
  }
  const leaves = []
  for (let i = 0; i < n; i += 1) {
    const t = 0.24 + (0.66 * i) / Math.max(1, n - 1)
    const side = (i % 2 === 0 ? 1 : -1) * (flip ? -1 : 1)
    const [px, py] = at(t)
    const L = l * 0.4 * (1 - 0.42 * t) * size
    leaves.push(
      <Leaf key={i} x={px} y={py} r={r1(ang(t) + side * (54 - 10 * t))} l={L} tone={tone} b={side * L * 0.1} />,
    )
  }
  const [tx, ty] = at(1)
  const [, shade] = TONES[tone] || TONES.mid
  return (
    <g transform={`translate(${r1(x)} ${r1(y)}) rotate(${r})`} opacity={o}>
      <path d={`M0 0Q${r1(P1[0])} ${r1(P1[1])} ${r1(P2[0])} ${r1(P2[1])}`} fill="none" stroke={shade}
        strokeWidth={r1(Math.max(1.1, l * 0.024))} strokeLinecap="round" />
      {leaves}
      <Leaf x={tx} y={ty} r={r1(ang(1))} l={l * 0.27 * size} tone={tone} />
    </g>
  )
}

const POTS = {
  cream: [C.warm, C.warm2, C.paper],
  sage: [C.soft, C.leaf, C.mist],
  white: [C.paper, C.paper2, C.paper],
  slate: [C.n2, C.neutral, C.n3],
}

/** Ceramic pot. Origin = bottom centre on the ground. Exposed so scenes can place their own foliage. */
export function Pot({ x = 0, y = 0, s = 1, tone = 'cream' }) {
  const [body, shade, hi] = POTS[tone] || POTS.cream
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={2} cy={1.5} rx={26} />
      <path d="M-22-34L-15-4Q-14.5 0-10 0H10Q14.5 0 15-4L22-34Z" fill={body} />
      <path d="M8-34H22L15.2-4.4Q14.6 0 10 0H5.5Z" fill={shade} opacity="0.75" />
      <ellipse cx="0" cy="-41" rx="23" ry="4.4" fill={shade} />
      <rect x="-25" y="-42" width="50" height="10" rx="3.6" fill={body} />
      <rect x="9" y="-42" width="16" height="10" rx="3.6" fill={shade} opacity="0.6" />
      <rect x="-22" y="-40" width="26" height="2.6" rx="1.3" fill={hi} opacity="0.7" />
      <ellipse cx="0" cy="-42.4" rx="20" ry="3" fill={C.warm3} />
    </G>
  )
}

const PLANT_SETS = {
  // [angle°, length, tone, width ratio]
  broad: [[-64, 30, 'deep', 0.5], [62, 32, 'deep', 0.5], [-40, 46, 'mid', 0.46], [40, 48, 'leaf', 0.46],
    [-16, 62, 'leaf', 0.44], [14, 68, 'mid', 0.44], [-2, 44, 'soft', 0.42]],
  slender: [[-30, 52, 'mid', 0.3], [30, 54, 'mid', 0.3], [-14, 70, 'leaf', 0.27], [12, 78, 'deep', 0.27], [0, 58, 'soft', 0.26]],
  spiky: [[-26, 60, 'deep', 0.2], [24, 56, 'deep', 0.2], [-11, 80, 'mid', 0.18], [10, 88, 'leaf', 0.18], [1, 70, 'mid', 0.17]],
  sprout: [[-34, 30, 'leaf', 0.5], [34, 30, 'mid', 0.5], [0, 22, 'soft', 0.46]],
}

/** Loose foliage emerging from a point (origin = soil line centre). */
export function Foliage({ x = 0, y = 0, s = 1, kind = 'broad' }) {
  const set = PLANT_SETS[kind] || PLANT_SETS.broad
  return (
    <G x={x} y={y} s={s}>
      {set.map(([a, len, tone, wr], i) => {
        const bx = Math.sin(rad(a)) * len * 0.26
        const by = -Math.cos(rad(a)) * len * 0.26
        return (
          <g key={i}>
            <path d={`M0 0L${r1(bx)} ${r1(by)}`} stroke={C.deep} strokeWidth="1.6" strokeLinecap="round" />
            <Leaf x={bx} y={by} r={a} l={len * 0.8} w={len * 0.8 * wr} tone={tone} b={a < 0 ? -len * 0.06 : len * 0.06} />
          </g>
        )
      })}
    </G>
  )
}

/** Potted plant. Origin = pot bottom centre. */
export function PottedPlant({ x = 0, y = 0, s = 1, kind = 'broad', pot = 'cream' }) {
  return (
    <G x={x} y={y} s={s}>
      <Foliage y={-42} kind={kind} />
      <Pot tone={pot} />
    </G>
  )
}

/* ═══════════════════════════ Paper goods ═══════════════════════════ */

const COVERS = {
  deep: [C.deep, C.ink], mid: [C.mid, C.deep], leaf: [C.leaf, C.mid], soft: [C.soft, C.leaf],
  mist: [C.mist, C.soft], blue: [C.blue, C.ink], blueMid: [C.blueMid, C.blue],
  warm: [C.warm2, C.warm3], cream: [C.warm, C.warm2], paper: [C.paper, C.paper2], slate: [C.neutral, C.ink],
}

/** A single book lying flat, spine left, pages right. Origin = top-left. */
export function Book({ x = 0, y = 0, w = 96, h = 14, tone = 'deep', r = 0 }) {
  const [cover, edge] = COVERS[tone] || COVERS.deep
  const d = useDetail()
  return (
    <g transform={`translate(${r1(x)} ${r1(y)})${r ? ` rotate(${r} ${w / 2} ${h / 2})` : ''}`}>
      <rect width={w} height={h} rx={Math.min(2.6, h * 0.22)} fill={cover} />
      <rect y={h * 0.78} width={w} height={h * 0.22} rx={Math.min(2, h * 0.18)} fill={edge} opacity="0.35" />
      <rect x={w * 0.085} y={h * 0.2} width={w * 0.9} height={h * 0.58} rx="1.2" fill={C.paper} />
      {d !== 'compact' && h >= 10 && (
        <path d={`M${r1(w * 0.13)} ${r1(h * 0.42)}H${r1(w * 0.96)}M${r1(w * 0.13)} ${r1(h * 0.62)}H${r1(w * 0.96)}`}
          stroke={C.paper2} strokeWidth="0.8" />
      )}
      <rect width={w * 0.07} height={h} rx={Math.min(2.2, h * 0.2)} fill={C.hi} opacity="0.15" />
    </g>
  )
}

/** Books stacked bottom → top. Origin = bottom centre of the stack. */
export function BookStack({ x = 0, y = 0, s = 1, books = [] }) {
  let cy = 0
  const out = []
  books.forEach((b, i) => {
    const w = b.w ?? 96
    const h = b.h ?? 14
    cy -= h
    out.push(<Book key={i} x={(b.dx ?? 0) - w / 2} y={cy} w={w} h={h} tone={b.tone} r={b.r} />)
  })
  const base = books[0]?.w ?? 96
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={3} cy={1.5} rx={base * 0.56} />
      {out}
    </G>
  )
}

/** Sheet of paper with abstract (never real) text. Origin = top-left; r rotates about the centre. */
export function Sheet({ x = 0, y = 0, w = 72, h = 94, r = 0, lines = 6, head = true, fold = true, tone = 'paper', accent = 'leaf', shadow = true }) {
  const d = useDetail()
  const fill = tone === 'paper' ? C.paper : C[tone] || C.paper
  const rows = []
  const top = head ? h * 0.3 : h * 0.14
  const gap = (h * 0.82 - top) / Math.max(1, lines)
  for (let i = 0; i < lines; i += 1) {
    const ww = (w - w * 0.26) * (i === lines - 1 ? 0.55 : i % 3 === 1 ? 0.86 : 1)
    rows.push(<rect key={i} x={w * 0.13} y={top + i * gap} width={ww} height="3" rx="1.5" fill={C.mist} />)
  }
  return (
    <g transform={`translate(${r1(x)} ${r1(y)})${r ? ` rotate(${r} ${w / 2} ${h / 2})` : ''}`}>
      {shadow && <rect x="2.5" y="4" width={w} height={h} rx="4" fill={C.shadow} opacity="0.4" />}
      <rect width={w} height={h} rx="4" fill={fill} stroke={C.paper2} strokeWidth="1" />
      {head && <rect x={w * 0.13} y={h * 0.11} width={w * 0.42} height="5" rx="2.5" fill={C[accent] || C.leaf} />}
      {d !== 'compact' && rows}
      {fold && (
        <>
          <path d={`M${w - 15} 0H${w - 4}Q${w} 0 ${w} 4V15Z`} fill={C.paper2} />
          <path d={`M${w - 15} 0L${w} 15H${w - 11}Q${w - 15} 15 ${w - 15} 11Z`} fill={C.mist} />
        </>
      )}
    </g>
  )
}

/** Pencil lying along +x from its tip. Origin = the tip; r rotates about the tip. */
export function Pencil({ x = 0, y = 0, r = -35, len = 86, tone = 'gold' }) {
  const body = tone === 'blue' ? C.blueMid : tone === 'green' ? C.leaf : C.gold
  const shade = tone === 'blue' ? C.blue : tone === 'green' ? C.mid : C.warm3
  return (
    <g transform={`translate(${r1(x)} ${r1(y)}) rotate(${r})`}>
      <path d="M0 0L13-4.4V4.4Z" fill={C.warm} />
      <path d="M0 0L13 4.4V0Z" fill={C.warm2} opacity="0.6" />
      <path d="M0 0L4.2-1.5V1.5Z" fill={C.ink} />
      <rect x="13" y="-4.4" width={len - 31} height="8.8" fill={body} />
      <rect x="13" y="0.4" width={len - 31} height="4" fill={shade} opacity="0.55" />
      <rect x="13" y="-3.4" width={len - 31} height="1.8" fill={C.hi} opacity="0.28" />
      <rect x={len - 18} y="-4.4" width="8" height="8.8" fill={C.n3} />
      <path d={`M${len - 15.5} -4.4V4.4M${len - 12.5} -4.4V4.4`} stroke={C.n2} strokeWidth="0.8" />
      <rect x={len - 10} y="-4.4" width="10" height="8.8" rx="3" fill={C.amber} />
    </g>
  )
}

/* ═══════════════════════════════ Devices ═══════════════════════════════ */

/** Open laptop, front-on. Origin = bottom centre of the base. ui: 'dashboard' | 'code' | 'chart' | 'blank' */
export function Laptop({ x = 0, y = 0, s = 1, ui = 'dashboard' }) {
  const d = useDetail()
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={0} cy={2} rx={78} />
      {/* base */}
      <path d="M-74-5H74L70 2Q69.4 4 67 4H-67Q-69.4 4-70 2Z" fill={C.n3} />
      <path d="M-74-5H74L73.4-3H-73.4Z" fill={C.paper} opacity="0.75" />
      <rect x="-14" y="-5" width="28" height="3" rx="1.5" fill={C.n2} opacity="0.7" />
      {/* lid + bezel */}
      <rect x="-64" y="-92" width="128" height="88" rx="7" fill={C.screen} />
      <rect x="-59.5" y="-87.5" width="119" height="79" rx="3.5" fill={C.display} />
      {ui === 'dashboard' && (
        <g>
          <rect x="-59.5" y="-87.5" width="119" height="9" rx="3.5" fill={C.mist} />
          <rect x="-59.5" y="-80" width="26" height="71.5" fill={C.mint} />
          {d !== 'compact' && <path d="M-54-70H-40M-54-62H-44M-54-54H-40M-54-46H-46" stroke={C.soft} strokeWidth="2.6" strokeLinecap="round" />}
          <rect x="-28" y="-72" width="40" height="22" rx="3" fill={C.paper} stroke={C.mist} strokeWidth="0.8" />
          <rect x="17" y="-72" width="38" height="22" rx="3" fill={C.paper} stroke={C.mist} strokeWidth="0.8" />
          <path d="M-24-56Q-16-62-10-57T2-60T8-66" fill="none" stroke={C.leaf} strokeWidth="2" strokeLinecap="round" />
          <rect x="21" y="-66" width="24" height="3" rx="1.5" fill={C.soft} />
          <rect x="21" y="-59" width="14" height="3" rx="1.5" fill={C.mist} />
          <rect x="-28" y="-44" width="83" height="28" rx="3" fill={C.paper} stroke={C.mist} strokeWidth="0.8" />
          <rect x="-22" y="-32" width="8" height="12" rx="1.5" fill={C.mist} />
          <rect x="-10" y="-38" width="8" height="18" rx="1.5" fill={C.soft} />
          <rect x="2" y="-30" width="8" height="10" rx="1.5" fill={C.mist} />
          <rect x="14" y="-36" width="8" height="16" rx="1.5" fill={C.leaf} />
          <rect x="26" y="-26" width="22" height="3" rx="1.5" fill={C.mist} />
          <rect x="26" y="-33" width="14" height="3" rx="1.5" fill={C.soft} />
        </g>
      )}
      {ui === 'code' && (
        <g>
          <rect x="-59.5" y="-87.5" width="119" height="79" rx="3.5" fill={C.screen} />
          <rect x="-59.5" y="-87.5" width="119" height="8" rx="3.5" fill={C.deep} opacity="0.55" />
          <path d="M-12-60L-26-48L-12-36M12-60L26-48L12-36" fill="none" stroke={C.leaf} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6-66L-6-30" stroke={C.mist} strokeWidth="3.6" strokeLinecap="round" />
          {d !== 'compact' && <path d="M-50-24H-18M-50-17H-30M-10-24H20M-10-17H6" stroke={C.mid} strokeWidth="2.6" strokeLinecap="round" />}
        </g>
      )}
      {ui === 'chart' && (
        <g>
          <rect x="-52" y="-62" width="104" height="46" rx="3" fill={C.paper} />
          <path d="M-44-26L-26-36L-10-30L10-46L30-40L44-52" fill="none" stroke={C.leaf} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="44" cy="-52" r="3.2" fill={C.paper} stroke={C.leaf} strokeWidth="2" />
        </g>
      )}
      {/* soft glass sheen */}
      <path d="M-59.5-87.5H-6L-34-8.5H-59.5Z" fill={C.glass} opacity="0.3" />
    </G>
  )
}

/* ═══════════════════════════ Standard decoration ═══════════════════════════ */

/**
 * The family's shared foliage framing for subject discs. Every subject uses the same sprig
 * placements (varied only by variant) so the set reads as one family. Drawn BEHIND the
 * primary object; <DecoFront/> adds a small leaf pair in front.
 *  a — sprigs on both sides      b — one tall sprig, right      c — one tall sprig, left
 */
export function Deco({ v = 'a' }) {
  const d = useDetail()
  if (d === 'compact') return null
  const std = d === 'standard'
  return (
    <g>
      {(v === 'a' || v === 'c') && <Sprig x={40} y={180} l={std ? 70 : 88} n={std ? 4 : 6} bend={-0.5} tone="soft" />}
      {(v === 'a' || v === 'b') && <Sprig x={205} y={188} l={std ? 62 : 80} n={std ? 4 : 5} bend={0.55} tone="leaf" flip />}
      {v === 'b' && !std && <Sprig x={40} y={186} l={46} n={3} bend={-0.4} tone="mist" />}
      {v === 'c' && !std && <Sprig x={203} y={190} l={44} n={3} bend={0.4} tone="mist" flip />}
    </g>
  )
}

/** Small leaf pair in front of the primary object (lower corner). Omitted in the compact tier:
 *  at ≤72px it is a 4px smudge that only widens the object's footprint inside its tile. */
export function DecoFront({ side = 'left' }) {
  const d = useDetail()
  if (d === 'compact') return null
  const left = side === 'left'
  const x = left ? 46 : 196
  const dir = left ? 1 : -1
  return (
    <g>
      <Leaf x={x} y={200} r={dir * -42} l={30} tone="mid" />
      <Leaf x={x + dir * 7} y={201} r={dir * -6} l={26} tone="leaf" />
      <Leaf x={x + dir * 12} y={201} r={dir * 30} l={20} tone="soft" />
    </g>
  )
}
