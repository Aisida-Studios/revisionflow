// src/components/illustrations/badges/emblems.jsx
// One bold emblem per real badge (30 — see data/badges.js). Drawn centred on (0,0) inside a
// ~±27 box so they sit in the medallion face. Strokes are deliberately heavy: these render as
// small as 40px. Emblems take { a, b } = the category's primary and secondary accent colours.
import React from 'react'
import { C, G, Leaf, Sprig } from '../kit'
import { Cog } from '../subjects/stem'

const SW = 3.4
const line = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }

/* ── building blocks ───────────────────────────────────────────── */
function Soil() { return <ellipse cx="0" cy="24" rx="13" ry="3.4" fill={C.warm3} opacity="0.85" /> }

function MiniSheet({ x = 0, y = 0, r = 0, w = 30, h = 38, children, tone = C.paper }) {
  return (
    <G x={x} y={y} r={r}>
      <rect x={-w / 2 + 1.6} y={-h / 2 + 2.4} width={w} height={h} rx="4" fill={C.shadow} opacity="0.3" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="4" fill={tone} stroke={C.paper2} strokeWidth="1" />
      {children}
    </G>
  )
}

function Person({ x = 0, y = 0, s = 1, a, b }) {
  return (
    <G x={x} y={y} s={s}>
      <path d="M-14 24C-14 10-8 4 0 4S14 10 14 24Z" fill={b} />
      <path d="M0 4C8 4 14 10 14 24H5C5 14 3 8 0 4Z" fill={C.ink} opacity="0.16" />
      <circle cx="0" cy="-8" r="9.4" fill={a} />
      <circle cx="-3" cy="-11" r="3" fill={C.hi} opacity="0.3" />
    </G>
  )
}

function MiniCal({ x = 0, y = 0, a, b, filled = [], check = false }) {
  const cells = []
  for (let r = 0; r < 3; r += 1) for (let c = 0; c < 4; c += 1) {
    const i = r * 4 + c
    cells.push(<rect key={i} x={-16 + c * 8.4} y={-3 + r * 8.2} width="6.4" height="6" rx="1.6" fill={filled.includes(i) ? a : C.mist} />)
  }
  return (
    <G x={x} y={y}>
      <rect x="-20" y="-24" width="40" height="46" rx="6" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
      <path d="M-20-12V-18Q-20-24-14-24H14Q20-24 20-18V-12Z" fill={b} />
      <rect x="-11" y="-29" width="4.4" height="10" rx="2.2" fill={C.n3} stroke={C.n2} strokeWidth="0.8" />
      <rect x="7" y="-29" width="4.4" height="10" rx="2.2" fill={C.n3} stroke={C.n2} strokeWidth="0.8" />
      {cells}
      {check && <path d="M-9 16L-2 22L11 8" {...line} stroke={a} strokeWidth="4" />}
    </G>
  )
}

function Tree({ s = 1, big = false, a, b }) {
  return (
    <G s={s}>
      <ellipse cx="0" cy="25" rx="16" ry="3.6" fill={C.shadow} opacity="0.35" />
      <path d="M-3.4 25L-2-4H2L3.4 25Z" fill={C.warm3} />
      <circle cx="0" cy={big ? -12 : -9} r={big ? 18 : 15} fill={a} />
      <circle cx={big ? -13 : -11} cy={big ? -2 : 0} r={big ? 12 : 10} fill={b} />
      <circle cx={big ? 13 : 11} cy={big ? -1 : 1} r={big ? 12 : 10} fill={b} />
      <circle cx={big ? -4 : -3} cy={big ? -18 : -14} r={big ? 9 : 7} fill={C.leaf} opacity="0.9" />
      {big && <circle cx="9" cy="-20" r="6" fill={C.leaf} opacity="0.8" />}
    </G>
  )
}

/* ── milestone ────────────────────────────────────────────────── */
export const FirstSession = ({ a }) => (
  <g>
    <Soil />
    <path d="M0 23V4" stroke={C.deep} strokeWidth="3.4" strokeLinecap="round" />
    <Leaf x={0} y={8} r={-52} l={26} tone="leaf" />
    <Leaf x={0} y={8} r={52} l={26} tone="mid" />
    <Leaf x={0} y={-2} r={0} l={14} tone="deep" />
  </g>
)
export const FirstPaper = ({ a, b }) => (
  <MiniSheet r={-6}>
    <rect x="-9" y="-13" width="12" height="4" rx="2" fill={b} />
    <path d="M-9-4H9M-9 2H5" stroke={C.mist} strokeWidth="2.6" strokeLinecap="round" />
    <path d="M-8 12L-2 17L9 6" {...line} stroke={a} strokeWidth="3.6" />
  </MiniSheet>
)
export const FirstAI = ({ a, b }) => (
  <g>
    <circle r="22" fill="none" stroke={a} strokeWidth="3.4" />
    <circle r="22" fill="none" stroke={C.paper} strokeWidth="1" opacity="0.5" />
    <path d="M0-16V-12M0 12V16M-16 0H-12M12 0H16" stroke={a} strokeWidth="2.6" strokeLinecap="round" />
    <G r={36}>
      <path d="M0-15L6 0L0 15L-6 0Z" fill={C.ink} opacity="0.12" transform="translate(1.6 1.6)" />
      <path d="M0-15L6 0H-6Z" fill={C.amber} />
      <path d="M0 15L6 0H-6Z" fill={a} />
    </G>
    <circle r="2.6" fill={C.paper} />
  </g>
)
export const ProfileComplete = ({ a, b }) => (
  <g>
    <rect x="-24" y="-17" width="48" height="34" rx="6" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
    <circle cx="-10" cy="-3" r="6" fill={b} />
    <path d="M-18 13C-18 6-14 3-10 3S-2 6-2 13Z" fill={b} />
    <path d="M4-6H17M4 1H14" stroke={C.mist} strokeWidth="3" strokeLinecap="round" />
    <circle cx="17" cy="14" r="10" fill={a} />
    <path d="M12.4 14L16 17.6L22 10.6" {...line} stroke={C.paper} strokeWidth="3" />
  </g>
)

/* ── streak: a plant that keeps growing ───────────────────────── */
export const Streak3 = () => (
  <g>
    <Soil />
    <path d="M0 23V2" stroke={C.deep} strokeWidth="3.4" strokeLinecap="round" />
    <Leaf x={0} y={9} r={-54} l={24} tone="leaf" />
    <Leaf x={0} y={9} r={54} l={24} tone="mid" />
    <Leaf x={0} y={0} r={0} l={16} tone="deep" />
  </g>
)
export const Streak7 = () => (
  <g>
    <Soil />
    <Sprig x={0} y={24} l={50} n={6} bend={0.12} tone="mid" size={0.85} />
  </g>
)
export const Streak14 = () => (
  <g>
    <Soil />
    <Sprig x={-6} y={24} l={42} n={4} bend={-0.4} tone="leaf" size={0.8} />
    <Sprig x={6} y={24} l={48} n={5} bend={0.4} tone="mid" size={0.8} flip />
  </g>
)
export const Streak30 = ({ a, b }) => <Tree a={C.deep} b={C.mid} />
export const Streak100 = () => <Tree big a={C.deep} b={C.mid} />

/* ── mastery (tier is carried by the rim; the emblem counts leaves) ── */
function MasteryBook({ leaves, a, b }) {
  return (
    <g>
      <path d="M0 24C-8 17-20 15-26 16V-4C-20-5-8-3 0 4Z" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
      <path d="M0 24C8 17 20 15 26 16V-4C20-5 8-3 0 4Z" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
      <path d="M0 4V24" stroke={C.paper2} strokeWidth="2" />
      <path d="M-20 6C-14 6-8 8-5 11M-20 12C-14 12-8 14-5 17M20 6C14 6 8 8 5 11M20 12C14 12 8 14 5 17" stroke={C.mist} strokeWidth="2" strokeLinecap="round" fill="none" />
      {leaves >= 1 && <Leaf x={0} y={2} r={0} l={20} tone="leaf" />}
      {leaves >= 2 && <Leaf x={-1} y={4} r={-52} l={19} tone="mid" />}
      {leaves >= 2 && <Leaf x={1} y={4} r={52} l={19} tone="mid" />}
      {leaves >= 3 && <Leaf x={-2} y={8} r={-86} l={15} tone="deep" />}
      {leaves >= 3 && <Leaf x={2} y={8} r={86} l={15} tone="deep" />}
    </g>
  )
}
export const MasteryBronze = (p) => <MasteryBook leaves={1} {...p} />
export const MasterySilver = (p) => <MasteryBook leaves={2} {...p} />
export const MasteryGold = (p) => <MasteryBook leaves={3} {...p} />

/* ── improvement ─────────────────────────────────────────────── */
export const GradeUp = ({ a, b }) => (
  <g>
    <rect x="-22" y="6" width="12" height="16" rx="2.4" fill={b} />
    <rect x="-6" y="-4" width="12" height="26" rx="2.4" fill={b} />
    <rect x="10" y="-14" width="12" height="36" rx="2.4" fill={a} />
    <path d="M-20-4L-4-14L6-20" {...line} stroke={C.amber} strokeWidth="3.6" />
    <path d="M-2-22L8-20L5-10" {...line} stroke={C.amber} strokeWidth="3.6" />
  </g>
)
export const FullMarks = ({ a }) => (
  <MiniSheet r={5} w={32} h={40}>
    <path d="M-10-12H8M-10-6H4" stroke={C.mist} strokeWidth="2.6" strokeLinecap="round" />
    <circle cx="2" cy="8" r="11" fill="none" stroke={a} strokeWidth="3.6" />
    <path d="M-3.4 8L0.4 12L8 3.4" {...line} stroke={C.deep} strokeWidth="3.6" />
  </MiniSheet>
)
export const Comeback = ({ a, b }) => (
  <g>
    <path d="M-22 14C-22 16-6 20 4 8C12-2 2-14 2-14" {...line} stroke={a} strokeWidth="5" />
    <path d="M-6-14L2-22L10-12" {...line} stroke={a} strokeWidth="5" />
    <Leaf x={14} y={20} r={30} l={14} tone="leaf" />
    <circle cx="-22" cy="14" r="3.4" fill={b} />
  </g>
)
export const TenPapers = ({ a, b }) => (
  <g>
    <MiniSheet x={-5} y={2} r={-12} w={28} h={36} tone={C.paper2} />
    <MiniSheet x={2} y={0} r={-3} w={28} h={36} />
    <MiniSheet x={9} y={-1} r={9} w={28} h={36}>
      <rect x="-9" y="-13" width="11" height="4" rx="2" fill={a} />
      <path d="M-9-3H9M-9 3H7M-9 9H3" stroke={C.mist} strokeWidth="2.6" strokeLinecap="round" />
    </MiniSheet>
  </g>
)
export const FiftyPapers = ({ a, b }) => (
  <g>
    <Cog x={-6} y={-4} s={0.56} tone="deep" />
    <MiniSheet x={11} y={7} r={8} w={22} h={28}>
      <path d="M-6-6H6M-6 0H5M-6 6H2" stroke={C.mist} strokeWidth="2.2" strokeLinecap="round" />
    </MiniSheet>
    <circle cx="14" cy="-14" r="8" fill={C.amber} />
    <path d="M10.4-14L13-11.4L18-17" {...line} stroke={C.paper} strokeWidth="2.6" />
  </g>
)

/* ── consistency ─────────────────────────────────────────────── */
export const EarlyBird = ({ a, b }) => (
  <g>
    <path d="M-26 12H26" stroke={b} strokeWidth="3.4" strokeLinecap="round" />
    <path d="M-16 12A16 16 0 0 1 16 12Z" fill={C.amber} />
    <path d="M-16 12A16 16 0 0 1 0-4" fill="none" stroke={C.goldPale} strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
    <path d="M0-14V-22M-18-8L-24-14M18-8L24-14M-24 2H-30M24 2H30" stroke={C.amber} strokeWidth="3.2" strokeLinecap="round" />
    <path d="M-22 20H-8M8 20H18" stroke={b} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
  </g>
)
export const NightOwl = ({ a, b }) => (
  <g>
    <path d="M10-22A22 22 0 1 0 22 10A17 17 0 0 1 10-22Z" fill={C.warm3} />
    <path d="M10-22A22 22 0 0 0-14 4" fill="none" stroke={C.goldPale} strokeWidth="2.6" strokeLinecap="round" opacity="0.7" />
    <path d="M16-12L18-7L23-6L18-4L16 1L14-4L9-6L14-7Z" fill={C.amber} />
    <circle cx="-2" cy="-16" r="2.4" fill={C.amber} />
    <circle cx="20" cy="14" r="2" fill={C.amber} />
  </g>
)
export const WeekendWarrior = ({ a, b }) => <MiniCal a={C.amber} b={b} filled={[6, 7]} />
export const Marathon = ({ a, b }) => (
  <g>
    <rect x="-4" y="-27" width="8" height="6" rx="2" fill={C.n2} />
    <circle cy="3" r="21" fill={b} />
    <circle cy="3" r="16.5" fill={C.paper} />
    <path d="M0 3V-9" stroke={b} strokeWidth="3.6" strokeLinecap="round" />
    <path d="M0 3L9 8" stroke={C.amber} strokeWidth="3.4" strokeLinecap="round" />
    <path d="M-13 3A13 13 0 0 1 0-10" fill="none" stroke={a} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
  </g>
)
export const QuestsComplete = ({ a, b }) => (
  <g>
    <rect x="-18" y="-22" width="36" height="46" rx="6" fill={b} />
    <rect x="-14" y="-17" width="28" height="38" rx="3" fill={C.paper} />
    <rect x="-8" y="-26" width="16" height="8" rx="3" fill={C.n2} />
    {[-10, 0, 10].map((yy) => (
      <g key={yy}>
        <path d={`M-10 ${yy}l3 3l6-7`} {...line} stroke={a} strokeWidth="3" />
        <path d={`M1 ${yy + 1}H10`} stroke={C.mist} strokeWidth="3" strokeLinecap="round" />
      </g>
    ))}
  </g>
)

/* ── social ──────────────────────────────────────────────────── */
export const FirstFriend = ({ a, b }) => (
  <g>
    <Person x={-9} y={0} s={0.96} a={C.paper} b={b} />
    <Person x={11} y={4} s={0.9} a={a} b={a} />
    <circle cx="19" cy="-14" r="8" fill={C.amber} />
    <path d="M19-18V-10M15-14H23" stroke={C.paper} strokeWidth="2.6" strokeLinecap="round" />
  </g>
)
export const ThreeFriends = ({ a, b }) => (
  <g>
    <Person x={-14} y={6} s={0.82} a={C.paper2} b={C.soft} />
    <Person x={14} y={6} s={0.82} a={C.paper2} b={C.soft} />
    <Person x={0} y={0} s={0.98} a={C.paper} b={b} />
  </g>
)
export const TopThree = ({ a, b }) => (
  <g>
    <rect x="-24" y="2" width="14" height="22" rx="2.4" fill={C.soft} />
    <rect x="-8" y="-8" width="16" height="32" rx="2.4" fill={a} />
    <rect x="10" y="8" width="14" height="16" rx="2.4" fill={C.soft} />
    <path d="M-17 12H-17M0 4V10" stroke={C.paper} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
    <Leaf x={0} y={-10} r={-30} l={14} tone="leaf" />
    <Leaf x={0} y={-10} r={30} l={14} tone="mid" />
    <Leaf x={0} y={-12} r={0} l={14} tone="deep" />
  </g>
)
export const Referral = ({ a, b }) => (
  <g>
    <path d="M-24 14C-18 4-10 8-4 2" fill="none" stroke={b} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="1 5.5" />
    <path d="M-2-16L24-4L-2 8L2-4Z" fill={a} />
    <path d="M2-4L24-4L-2 8Z" fill={C.ink} opacity="0.18" />
    <path d="M-2-16L2-4L24-4Z" fill={C.paper} opacity="0.35" />
    <path d="M2-4L6 14L10 4Z" fill={b} />
  </g>
)

/* ── special ─────────────────────────────────────────────────── */
export const EmergencyMode = ({ a, b }) => (
  <g>
    <circle cx="-12" cy="-16" r="7" fill={C.amber} />
    <circle cx="12" cy="-16" r="7" fill={C.amber} />
    <circle cy="3" r="20" fill={C.neutral} />
    <circle cy="3" r="15.4" fill={C.paper} />
    <path d="M0 3V-8M0 3L8 8" stroke={C.deep} strokeWidth="3.4" strokeLinecap="round" />
    <path d="M-14 24L-18 28M14 24L18 28" stroke={C.neutral} strokeWidth="3.4" strokeLinecap="round" />
    <path d="M-14 3A14 14 0 0 1-4-10" fill="none" stroke={C.amber} strokeWidth="3.2" strokeLinecap="round" />
  </g>
)
export const AIPlan = ({ a, b }) => (
  <g>
    <path d="M-18 16C-6 16-8-2 2-2S12-14 16-14" fill="none" stroke={b} strokeWidth="2.8" strokeLinecap="round" strokeDasharray="1 6" />
    <circle cx="-18" cy="16" r="6.4" fill={a} />
    <circle cx="2" cy="-2" r="5.4" fill={C.paper} stroke={a} strokeWidth="3" />
    <path d="M16-14V-30" stroke={C.deep} strokeWidth="3" strokeLinecap="round" />
    <path d="M16-30L28-25L16-20Z" fill={C.amber} />
    <circle cx="16" cy="-14" r="3.4" fill={C.deep} />
  </g>
)
export const FlashcardGen = ({ a, b }) => (
  <g>
    {[[-12, -16, C.paper2], [-4, 0, C.paper], [4, 12, C.paper]].map(([rot, yy, f], i) => (
      <G key={i} y={yy * 0.55} r={rot * 0.7}>
        <rect x="-20" y="-11" width="40" height="26" rx="4" fill={C.shadow} opacity="0.25" transform="translate(1.4 2.2)" />
        <rect x="-20" y="-13" width="40" height="26" rx="4" fill={f} stroke={C.paper2} strokeWidth="1" />
        {i === 2 && <path d="M-12-5H8M-12 3H0" stroke={a} strokeWidth="3.2" strokeLinecap="round" />}
      </G>
    ))}
  </g>
)
export const TenSessions = ({ a, b }) => <MiniCal a={a} b={b} filled={[0, 1, 2, 4, 5, 6, 8, 9]} check />

/** Fallback emblem for unknown badge ids. */
export const GenericEmblem = () => (
  <g>
    <Soil />
    <Leaf x={0} y={14} r={-28} l={30} tone="mid" />
    <Leaf x={0} y={14} r={28} l={30} tone="leaf" />
  </g>
)
