// src/components/illustrations/scenes/rewards.jsx
// Gamification scenes: streak (consistency), achievement, mastery. No flames, no trophy clip-art.
import React from 'react'
import { C, Sprig, Shadow, BookStack, PottedPlant } from '../kit'
import { useDetail } from '../IllustrationFrame'
import { Medallion, RibbonTails, SceneDeco } from './parts'

/* ───────────── Streak: seven plants, one per day, each a little taller ───────────── */
export function StreakScene() {
  const d = useDetail()
  const days = 7
  return (
    <g>
      <path d="M34 200Q160 190 286 200" fill="none" stroke={C.warm2} strokeWidth="6" strokeLinecap="round" />
      <path d="M34 204Q160 194 286 204" fill="none" stroke={C.shadow} strokeWidth="5" strokeLinecap="round" opacity="0.4" />
      {Array.from({ length: days }, (_, i) => {
        const x = 54 + i * 35.5
        const h = 22 + i * 14
        const gy = 198 - Math.sin((i / (days - 1)) * Math.PI) * 4
        return (
          <g key={i}>
            <Shadow cx={x + 2} cy={gy + 3} rx={12} o={0.8} />
            <Sprig x={x} y={gy} l={h} n={Math.min(2 + i, 7)} bend={i % 2 ? 0.14 : -0.14} tone={i < 3 ? 'soft' : i < 5 ? 'leaf' : 'mid'} size={i > 4 ? 0.74 : 0.9} />
            {d !== 'compact' && <circle cx={x} cy={gy + 18} r="4.2" fill={C.leaf} />}
          </g>
        )
      })}
    </g>
  )
}

/* ───────────── Achievement: laurel medallion on ribbons ───────────── */
export function AchievementScene() {
  const d = useDetail()
  return (
    <g>
      <Shadow cx={160} cy={208} rx={86} o={0.8} />
      <RibbonTails x={160} y={150} len={58} />
      {d !== 'compact' && (
        <g>
          <Sprig x={112} y={178} l={96} n={7} bend={-0.9} tone="leaf" r={-12} />
          <Sprig x={208} y={178} l={96} n={7} bend={0.9} tone="soft" flip r={12} />
        </g>
      )}
      <Medallion x={160} y={112} r={52} />
    </g>
  )
}

/* ───────────── Mastery: growth that has completed ───────────── */
export function MasteryScene() {
  const d = useDetail()
  return (
    <g>
      <SceneDeco v="l" />
      <BookStack x={106} y={204} books={[{ w: 118, h: 18, tone: 'deep' }, { w: 104, h: 15, tone: 'cream', dx: 4 }, { w: 90, h: 14, tone: 'blueMid', dx: -3 }]} />
      <PottedPlant x={206} y={204} s={1.7} kind="broad" />
      {d !== 'compact' && (
        <g>
          <path d="M82 154Q70 176 78 196" fill="none" stroke={C.leaf} strokeWidth="5" strokeLinecap="round" />
          <Medallion x={74} y={176} r={20} />
        </g>
      )}
    </g>
  )
}
