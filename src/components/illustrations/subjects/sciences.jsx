// src/components/illustrations/subjects/sciences.jsx
// Biology · Chemistry · Physics · Combined/Applied Science · Environmental Science.
// Each export draws ONLY the artwork (the disc is applied by SubjectIllustration, so the
// backdrop is identical across the family). Coordinates: 240×240, disc centre (120,122).
import React from 'react'
import { C, G, Leaf, Shadow, Deco, DecoFront, useUid } from '../kit'
import { useDetail } from '../IllustrationFrame'

const r1 = (v) => Math.round(v * 10) / 10

/* ───────────────────────────── parts (exported for reuse in scenes) ───────────────────────────── */

/** Compound microscope. Origin (0,0) = base centre on the ground; ~125 wide × 160 tall. */
export function Microscope({ x = 0, y = 0, s = 1 }) {
  const d = useDetail()
  const id = useUid()
  return (
    <G x={x} y={y} s={s}>
      <defs>
        <linearGradient id={`${id}mt`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: 'var(--rfi-mid)' }} />
          <stop offset="0.45" style={{ stopColor: 'var(--rfi-deep)' }} />
          <stop offset="1" style={{ stopColor: 'var(--rfi-ink)' }} />
        </linearGradient>
        <linearGradient id={`${id}mm`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: 'var(--rfi-paper)' }} />
          <stop offset="0.5" style={{ stopColor: 'var(--rfi-neutral3)' }} />
          <stop offset="1" style={{ stopColor: 'var(--rfi-neutral2)' }} />
        </linearGradient>
      </defs>
      <Shadow cx={4} cy={2} rx={62} />
      {/* arm — drawn first so the stage block and head sit on top of it */}
      <path d="M32-12C60-14 66-52 52-82C44-98 32-106 16-110" fill="none" stroke={C.deep} strokeWidth="16" strokeLinecap="round" />
      <path d="M28-14C54-16 59-50 46-80C40-94 30-102 16-105" fill="none" stroke={C.mid} strokeWidth="3.4" strokeLinecap="round" opacity="0.55" />
      {/* base */}
      <path d="M-54-4Q-56-18-42-20H44Q58-18 56-4Q56 2 48 2H-46Q-54 2-54-4Z" fill={C.deep} />
      <path d="M-48-17Q-44-20-36-20H40Q50-19 52-12Q30-15-48-15Z" fill={C.mid} opacity="0.7" />
      {/* stage, clamped to the arm, with slide */}
      <rect x="-40" y="-52" width="82" height="7" rx="3" fill={`url(#${id}mm)`} />
      <rect x="34" y="-56" width="18" height="24" rx="4" fill={C.deep} />
      <rect x="-26" y="-59" width="34" height="7" rx="1.6" fill={C.bluePale} />
      <rect x="-26" y="-59" width="34" height="2.4" rx="1.2" fill={C.hi} opacity="0.5" />
      <circle cx="-9" cy="-55.6" r="2.4" fill={C.leaf} />
      {/* light source */}
      <rect x="-12" y="-34" width="8" height="14" fill={C.n2} opacity="0.55" />
      <ellipse cx="-8" cy="-36" rx="11" ry="4" fill={`url(#${id}mm)`} />
      {/* head link + body tube */}
      <path d="M-8-100L26-106L28-92L-10-86Z" fill={C.deep} />
      <G x={-12} y={-88} r={-13}>
        <rect x="-10" y="-50" width="20" height="60" rx="5" fill={`url(#${id}mt)`} />
        <rect x="-6" y="-46" width="3.6" height="52" rx="1.8" fill={C.hi} opacity="0.22" />
        {d !== 'compact' && <rect x="-10" y="-6" width="20" height="3" fill={C.ink} opacity="0.45" />}
        <rect x="-6.5" y="-68" width="13" height="19" rx="3" fill={C.ink} />
        <rect x="-8" y="-72" width="16" height="6" rx="2.4" fill={`url(#${id}mm)`} />
        <rect x="-5.5" y="10" width="11" height="9" rx="2" fill={`url(#${id}mm)`} />
        <rect x="-3.4" y="18" width="6.8" height="7" rx="1.6" fill={C.n2} />
      </G>
      {/* focus knob */}
      <circle cx="54" cy="-44" r="11" fill={`url(#${id}mm)`} />
      <circle cx="54" cy="-44" r="4.4" fill={C.n2} />
      <circle cx="54" cy="-44" r="11" fill="none" stroke={C.neutral} strokeWidth="1" opacity="0.5" />
    </G>
  )
}

/** Petri dish with cultured cells. Origin = dish centre on the ground. */
export function PetriDish({ x = 0, y = 0, s = 1 }) {
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={2} cy={2} rx={30} />
      <ellipse cx="0" cy="-6" rx="28" ry="9.5" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
      <ellipse cx="0" cy="-6" rx="23" ry="7" fill={C.mist} />
      <ellipse cx="0" cy="-6" rx="23" ry="7" fill={C.leaf} opacity="0.35" />
      {[[-9, -7, 3], [4, -9, 2.4], [10, -4, 3.2], [-2, -3, 2.2], [-14, -5, 2]].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={C.mid} opacity="0.75" />
      ))}
      <path d="M-24-3Q0 8 24-3" fill="none" stroke={C.paper} strokeWidth="2" opacity="0.8" />
    </G>
  )
}

/** Conical (Erlenmeyer) flask with liquid. Origin = base centre. */
export function Flask({ x = 0, y = 0, s = 1, liquid = 'leaf' }) {
  const id = useUid()
  const [l1, l2] = liquid === 'blue' ? ['var(--rfi-blue-mid)', 'var(--rfi-blue)'] : ['var(--rfi-leaf)', 'var(--rfi-deep)']
  return (
    <G x={x} y={y} s={s}>
      <defs>
        <linearGradient id={`${id}fl`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: l1 }} />
          <stop offset="1" style={{ stopColor: l2 }} />
        </linearGradient>
        <clipPath id={`${id}fc`}><path d="M-12-122H12V-88L44-18Q48 0 34 0H-34Q-48 0-44-18L-12-88Z" /></clipPath>
      </defs>
      <Shadow cx={3} cy={1.5} rx={46} />
      {/* glass body */}
      <path d="M-12-122H12V-88L44-18Q48 0 34 0H-34Q-48 0-44-18L-12-88Z" fill={C.paper} opacity="0.55" />
      {/* liquid (clipped to glass) */}
      <g clipPath={`url(#${id}fc)`}>
        <path d="M-60-52Q-30-60 0-52T60-52V4H-60Z" fill={`url(#${id}fl)`} />
        <path d="M-60-52Q-30-60 0-52T60-52" fill="none" stroke={C.hi} strokeWidth="1.6" opacity="0.5" />
      </g>
      <path d="M-12-122H12V-88L44-18Q48 0 34 0H-34Q-48 0-44-18L-12-88Z" fill="none" stroke={C.soft} strokeWidth="2" strokeLinejoin="round" />
      {/* lip + highlights */}
      <rect x="-15" y="-127" width="30" height="8" rx="3.5" fill={C.paper} stroke={C.soft} strokeWidth="1.6" />
      <path d="M-8-112V-90L-32-28" fill="none" stroke={C.hi} strokeWidth="3.2" strokeLinecap="round" opacity="0.75" />
      <path d="M22-74L36-34" fill="none" stroke={C.hi} strokeWidth="1.8" strokeLinecap="round" opacity="0.35" />
    </G>
  )
}

/** Beaker with graduations. Origin = base centre. */
export function Beaker({ x = 0, y = 0, s = 1, liquid = 'blue' }) {
  const id = useUid()
  const [l1, l2] = liquid === 'blue' ? ['var(--rfi-blue-pale)', 'var(--rfi-blue-mid)'] : ['var(--rfi-mist)', 'var(--rfi-leaf)']
  return (
    <G x={x} y={y} s={s}>
      <defs>
        <linearGradient id={`${id}bk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: l1 }} />
          <stop offset="1" style={{ stopColor: l2 }} />
        </linearGradient>
      </defs>
      <Shadow cx={2} cy={1.5} rx={28} />
      <path d="M-22-62V-6Q-22 0-16 0H16Q22 0 22-6V-62Z" fill={C.paper} opacity="0.55" />
      <path d="M-20-34H20V-6Q20-2 16-2H-16Q-20-2-20-6Z" fill={`url(#${id}bk)`} />
      <path d="M-20-34Q-10-38 0-34T20-34" fill="none" stroke={C.hi} strokeWidth="1.4" opacity="0.55" />
      <path d="M-22-62V-6Q-22 0-16 0H16Q22 0 22-6V-62" fill="none" stroke={C.soft} strokeWidth="2" strokeLinejoin="round" />
      <path d="M-26-62H26" stroke={C.soft} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M-22-50H-12M-22-40H-16M-22-30H-12M-22-20H-16" stroke={C.neutral} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <path d="M-15-56V-10" stroke={C.hi} strokeWidth="2.6" strokeLinecap="round" opacity="0.6" />
    </G>
  )
}

/** Test tube, standing. Origin = base centre. */
export function TestTube({ x = 0, y = 0, s = 1, r = 0, tone = 'leaf' }) {
  const fill = tone === 'blue' ? C.blueMid : tone === 'gold' ? C.gold : C.leaf
  return (
    <G x={x} y={y} s={s} r={r}>
      <path d="M-7-70V-6Q-7 0 0 0T7-6V-70Z" fill={C.paper} opacity="0.55" />
      <path d="M-6.4-30H6.4V-6Q6.4-1 0-1T-6.4-6Z" fill={fill} />
      <path d="M-7-70V-6Q-7 0 0 0T7-6V-70" fill="none" stroke={C.soft} strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="-9" y="-74" width="18" height="6" rx="3" fill={C.paper} stroke={C.soft} strokeWidth="1.4" />
      <path d="M-3.4-62V-12" stroke={C.hi} strokeWidth="2" strokeLinecap="round" opacity="0.65" />
    </G>
  )
}

/** Benzene-style ring molecule. Origin = ring centre. */
export function Molecule({ x = 0, y = 0, s = 1 }) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2
    return [r1(Math.cos(a) * 18), r1(Math.sin(a) * 18)]
  })
  const tone = [C.deep, C.blue, C.deep, C.leaf, C.deep, C.blue]
  return (
    <G x={x} y={y} s={s}>
      <path d={`M${pts.map((p) => p.join(' ')).join('L')}Z`} fill="none" stroke={C.soft} strokeWidth="2.6" strokeLinejoin="round" />
      <circle r="9" fill="none" stroke={C.soft} strokeWidth="1.6" opacity="0.8" />
      {pts.map(([px, py], i) => (
        <g key={i}>
          <circle cx={px} cy={py} r="5.4" fill={tone[i]} />
          <circle cx={px - 1.6} cy={py - 1.8} r="1.6" fill={C.hi} opacity="0.5" />
        </g>
      ))}
    </G>
  )
}

/** Atom with nucleus cluster and three orbits. Origin = nucleus centre. */
export function Atom({ x = 0, y = 0, s = 1, rx = 84, ry = 30 }) {
  const d = useDetail()
  const orbit = [
    { rot: 0, c: C.blue, e: [0.5, 3.9] },
    { rot: 60, c: C.leaf, e: [2.2, 5.3] },
    { rot: 120, c: C.deep, e: [1.2, 4.4] },
  ]
  const pos = (rot, t) => {
    const px = Math.cos(t) * rx
    const py = Math.sin(t) * ry
    const a = (rot * Math.PI) / 180
    return [r1(px * Math.cos(a) - py * Math.sin(a)), r1(px * Math.sin(a) + py * Math.cos(a))]
  }
  return (
    <G x={x} y={y} s={s}>
      {orbit.map((o) => (
        <ellipse key={o.rot} rx={rx} ry={ry} fill="none" stroke={o.c} strokeWidth="2.6" opacity="0.85" transform={`rotate(${o.rot})`} />
      ))}
      {orbit.flatMap((o) =>
        o.e.map((t, i) => {
          const [ex, ey] = pos(o.rot, t)
          return (
            <g key={`${o.rot}-${i}`}>
              <circle cx={ex} cy={ey} r="8" fill={o.c} />
              <circle cx={ex - 2.4} cy={ey - 2.6} r="2.6" fill={C.hi} opacity="0.5" />
            </g>
          )
        }),
      )}
      {d === 'compact' ? (
        <g>
          <circle r="17" fill={C.deep} />
          <circle cx="-5" cy="-6" r="6" fill={C.mid} opacity="0.7" />
        </g>
      ) : (
        <g>
          {[[-7, -5, C.deep], [7, -6, C.blue], [8, 6, C.mid], [-6, 7, C.leaf], [0, 0, C.deep]].map(([cx, cy, f], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="9.6" fill={f} stroke={C.ink} strokeOpacity="0.22" strokeWidth="1" />
              <circle cx={cx - 2.8} cy={cy - 3} r="3" fill={C.hi} opacity="0.4" />
            </g>
          ))}
        </g>
      )}
    </G>
  )
}

/* ─────────────────────────────── compositions ─────────────────────────────── */

export function BiologyArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      <Microscope x={compact ? 116 : 118} y={compact ? 200 : 194} s={compact ? 1.18 : 1.02} />
      {d === 'full' && <PetriDish x={58} y={196} s={0.95} />}
      <DecoFront side="right" />
    </g>
  )
}

export function ChemistryArt() {
  const d = useDetail()
  const compact = d === 'compact'
  const std = d !== 'compact'
  return (
    <g>
      <Deco v="b" />
      {std && <Molecule x={72} y={62} s={d === 'full' ? 1 : 0.85} />}
      {std && <Beaker x={170} y={194} s={1.1} />}
      {d === 'full' && <TestTube x={52} y={196} r={-12} tone="gold" />}
      {d === 'full' && <TestTube x={66} y={197} r={3} tone="blue" />}
      <Flask x={compact ? 120 : 114} y={compact ? 200 : 194} s={compact ? 1.2 : 1.08} />
      {std && (
        <g fill={C.paper} stroke={C.soft} strokeWidth="1.4">
          <circle cx="106" cy="40" r="5" /><circle cx="120" cy="28" r="3.4" /><circle cx="112" cy="17" r="2.4" />
        </g>
      )}
      <DecoFront side="right" />
    </g>
  )
}

export function PhysicsArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      {!compact && <Shadow cx={120} cy={198} rx={48} o={0.8} />}
      <Atom x={120} y={compact ? 118 : 112} s={compact ? 1.12 : 1} />
      {d === 'full' && (
        <path d="M44 176Q58 158 72 176T100 176T128 176T156 176T184 176" fill="none" stroke={C.soft} strokeWidth="3.2" strokeLinecap="round" />
      )}
      <DecoFront side="left" />
    </g>
  )
}

/** Combined / applied science: flask + orbit ring + leaf — the three sciences in one picture. */
export function ScienceArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="c" />
      {!compact && <Atom x={160} y={84} s={0.62} />}
      {d === 'full' && <PetriDish x={176} y={198} s={0.9} />}
      <Flask x={compact ? 120 : 104} y={compact ? 200 : 194} s={compact ? 1.2 : 0.98} liquid="leaf" />
      {!compact && <Leaf x={148} y={198} r={30} l={34} tone="mid" />}
      {!compact && <Leaf x={154} y={199} r={62} l={26} tone="leaf" />}
    </g>
  )
}

export function EnvironmentalScienceArt() {
  const d = useDetail()
  const compact = d === 'compact'
  const id = useUid()
  return (
    <g>
      <defs><clipPath id={`${id}e`}><circle cx="120" cy="122" r="99" /></clipPath></defs>
      {!compact && <circle cx="172" cy="60" r="14" fill={C.gold} opacity="0.85" />}
      <g clipPath={`url(#${id}e)`}>
        <path d="M10 186Q70 160 130 176T236 168V232H10Z" fill={C.soft} opacity="0.85" />
        <path d="M10 202Q80 180 140 192T236 186V232H10Z" fill={C.leaf} />
      </g>
      {/* tree */}
      <G x={108} y={192} s={compact ? 1.25 : 1.1}>
        <Shadow cx={4} cy={2} rx={34} />
        <path d="M-5 0L-3-52H3L5 0Z" fill={C.warm3} />
        <path d="M0-30L-20-48" stroke={C.warm3} strokeWidth="3" strokeLinecap="round" />
        <circle cx="0" cy="-74" r="32" fill={C.deep} />
        <circle cx="-22" cy="-56" r="20" fill={C.mid} />
        <circle cx="22" cy="-58" r="21" fill={C.mid} />
        <circle cx="-6" cy="-84" r="19" fill={C.leaf} />
        <circle cx="14" cy="-76" r="12" fill={C.leaf} opacity="0.9" />
        <circle cx="-14" cy="-90" r="6" fill={C.hi} opacity="0.18" />
      </G>
      {!compact && (
        <G x={178} y={186} s={0.95}>
          <path d="M-2.4 0L-1.2-70H1.2L2.4 0Z" fill={C.n2} />
          <G y={-70}>
            <path d="M0 0L-4-38L4-38Z" fill={C.n3} stroke={C.n2} strokeWidth="1" />
            <path d="M0 0L33 11L29 3Z" fill={C.n3} stroke={C.n2} strokeWidth="1" />
            <path d="M0 0L-29 17L-23 7Z" fill={C.n3} stroke={C.n2} strokeWidth="1" />
            <circle r="4" fill={C.n2} />
          </G>
        </G>
      )}
      {d === 'full' && <path d="M58 76C58 76 46 92 46 100A12 12 0 0 0 70 100C70 92 58 76 58 76Z" fill={C.blueMid} />}
    </g>
  )
}
