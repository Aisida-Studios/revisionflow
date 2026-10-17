// src/components/illustrations/scenes/states.jsx
// Scenes for the places the first round of artwork did not reach: the social screens (friends,
// leaderboard) and the two "off the happy path" screens (page not found, something went wrong).
// Same rules as every other scene: still-life objects only, no people, no text, no alarm colours —
// a missing page is "go and look for it", an error is "reload and carry on".
import React from 'react'
import { C, G, Shadow, Pencil, BookStack, Laptop, PottedPlant, Sprig, Sheet, useUid } from '../kit'
import { useDetail } from '../IllustrationFrame'
import { Bubble, Magnifier } from '../props'
import { Desk, Mug, Notebook, SceneDeco } from './parts'

/* ───────────────────────────── Friends: a study pair ─────────────────────────────
   Two notebooks leaning together, a mug each, and a short conversation above. */
export function FriendsScene() {
  const d = useDetail()
  const id = useUid()
  return (
    <g>
      <SceneDeco v="a" />
      <defs>
        {/* the notebooks' bookmark ribbons hang below their covers; stop them at the underside of the desk */}
        <clipPath id={`${id}c`}><rect x="0" y="0" width="320" height="211" /></clipPath>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <G x={104} y={202} r={4}><Notebook x={0} y={0} w={78} h={110} tone="deep" /></G>
        <G x={236} y={202} r={-4}><Notebook x={-78} y={0} w={78} h={110} tone="blue" /></G>
      </g>
      <Desk />
      {d !== 'compact' && <Mug x={66} y={202} s={1.05} />}
      {d !== 'compact' && <Mug x={254} y={202} s={1.05} />}
      <G x={64} y={28}><Bubble w={94} h={50} tone="paper" tail="left" marks="bars" /></G>
      <G x={164} y={44}><Bubble w={92} h={48} tone="deep" tail="right" marks="wave" /></G>
    </g>
  )
}

/* ───────────────────────────── Leaderboard: a podium of books ─────────────────────────────
   Three stacks, tallest in the middle, a sprig on top. No trophy, no medal. */
export function LeaderboardScene() {
  const d = useDetail()
  const second = [{ w: 74, h: 18, tone: 'blueMid' }, { w: 66, h: 15, tone: 'cream', dx: 2 }, { w: 58, h: 14, tone: 'mid', dx: -2 }]
  const first = [{ w: 84, h: 20, tone: 'deep' }, { w: 76, h: 17, tone: 'cream', dx: 3 }, { w: 70, h: 16, tone: 'blueMid', dx: -2 }, { w: 62, h: 15, tone: 'mid', dx: 2 }, { w: 54, h: 13, tone: 'cream', dx: -1 }]
  const third = [{ w: 68, h: 17, tone: 'mid' }, { w: 60, h: 14, tone: 'cream', dx: -2 }]
  const topOfFirst = 202 - first.reduce((n, b) => n + b.h, 0)
  return (
    <g>
      <SceneDeco v="a" />
      <Desk />
      <BookStack x={84} y={202} books={second} />
      <BookStack x={160} y={202} books={first} />
      <BookStack x={236} y={202} books={third} />
      {d !== 'compact' && <Sprig x={160} y={topOfFirst + 1} l={40} n={5} bend={0.12} tone="leaf" size={0.95} />}
    </g>
  )
}

/* ───────────────────────────── Not found: the page that is not there ─────────────────────────────
   A dashed outline where a page should be, and a magnifier looking for it. */
export function NotFoundScene() {
  const d = useDetail()
  return (
    <g>
      <SceneDeco v="a" />
      <Shadow cx={160} cy={206} rx={96} o={0.8} />
      <G x={98} y={46} r={-2}>
        <rect width="112" height="150" rx="7" fill={C.paper} opacity="0.34" />
        <rect x="1" y="1" width="110" height="148" rx="6" fill="none" stroke={C.leaf} strokeWidth="2.2" strokeDasharray="6 6" />
        {[34, 52, 70, 88].map((yy, i) => (
          <rect key={yy} x="16" y={yy} width={i === 3 ? 44 : 80} height="4.6" rx="2.3" fill={C.mist} />
        ))}
      </G>
      <Magnifier x={196} y={148} r={-8} s={1.5} />
      {d !== 'compact' && <Pencil x={74} y={200} r={-12} len={78} tone="blue" />}
      {d !== 'compact' && <PottedPlant x={274} y={204} s={0.86} kind="broad" />}
    </g>
  )
}

/* ───────────────────────────── Error: calm, with an obvious way back ─────────────────────────────
   A laptop whose screen shows one reload arrow. Amber, not red; nothing is broken or on fire. */
export function ErrorScene() {
  const d = useDetail()
  return (
    <g>
      <SceneDeco v="a" />
      <Desk />
      <Laptop x={160} y={200} s={1.18} ui="blank" />
      <G x={160} y={144}>
        <circle r="23" fill={C.paper} opacity="0.9" />
        <path d="M-12-14A17 17 0 1 1-17 4" fill="none" stroke={C.amber} strokeWidth="5" strokeLinecap="round" />
        <path d="M-22-10L-8-22L-6-6Z" fill={C.amber} />
      </G>
      {d !== 'compact' && <Mug x={62} y={202} s={1.05} />}
      {d !== 'compact' && <PottedPlant x={272} y={202} s={0.92} kind="broad" />}
      {d === 'full' && <Sheet x={36} y={116} w={40} h={52} r={-9} lines={3} head={false} fold={false} />}
    </g>
  )
}
