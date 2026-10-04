// src/components/illustrations/scenes/empty.jsx
// Empty-state scenes. Each says "you haven't started this yet" with a positive metaphor
// (blank planner, clean sheet, empty graph waiting for data, tidy tray) — never "something broke".
import React from 'react'
import { C, G, Shadow, Pencil, PottedPlant } from '../kit'
import { useDetail } from '../IllustrationFrame'
import { CalendarScene, AnalyticsScene } from './features'
import { Worksheet, CardFan, StickyNote, Clock, Planner, SceneDeco } from './parts'

export const EmptySessionsScene = () => <CalendarScene empty />
export const EmptyAnalyticsScene = () => <AnalyticsScene empty />

/** Clean worksheet: nothing to fix yet. */
export function EmptyMistakesScene() {
  const d = useDetail()
  return (
    <g>
      <SceneDeco v="a" />
      <Shadow cx={160} cy={206} rx={92} o={0.8} />
      <Worksheet x={100} y={40} r={-2} w={120} h={152}>
        {[34, 50, 66, 82, 98, 114].map((yy, i) => (
          <rect key={yy} x="14" y={yy} width={i % 3 === 2 ? 56 : 90} height="4.6" rx="2.3" fill={C.mist} />
        ))}
        <rect x="10" y="126" width="100" height="18" rx="5" fill="none" stroke={C.soft} strokeWidth="1.6" strokeDasharray="4 5" />
      </Worksheet>
      {d !== 'compact' && <Pencil x={214} y={198} r={-24} len={84} />}
      {d !== 'compact' && <PottedPlant x={274} y={204} s={0.84} kind="slender" pot="sage" />}
    </g>
  )
}

/** Tidy tray of blank papers. */
export function EmptyPapersScene() {
  const d = useDetail()
  return (
    <g>
      <SceneDeco v="a" />
      <Shadow cx={160} cy={208} rx={104} o={0.8} />
      <path d="M72 150L88 190H232L248 150Z" fill={C.warm3} opacity="0.6" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={92 + i * 2} y={116 - i * 6} width="136" height="76" rx="5" fill={i === 3 ? C.paper : C.paper2} stroke={C.paper2} strokeWidth="1" transform={`rotate(${(i - 1.5) * 1.6} 160 150)`} />
      ))}
      <path d="M72 150L88 192H232L248 150Z" fill={C.warm2} />
      <path d="M72 150H248L246 156H74Z" fill={C.warm} />
      <path d="M72 150L88 192" stroke={C.warm3} strokeWidth="1.2" opacity="0.5" />
      <rect x="112" y="108" width="56" height="6" rx="3" fill={C.leaf} />
      {d !== 'compact' && <Pencil x={172} y={118} r={-12} len={80} />}
      {d !== 'compact' && <PottedPlant x={272} y={204} s={0.84} kind="broad" />}
    </g>
  )
}

/** Blank notepad + pen. */
export function EmptyNotesScene() {
  const d = useDetail()
  return (
    <g>
      <SceneDeco v="a" />
      <Shadow cx={160} cy={206} rx={86} o={0.8} />
      <G x={108} y={46} r={-3}>
        <rect x="3" y="5" width="104" height="146" rx="8" fill={C.shadow} opacity="0.28" />
        <rect width="104" height="146" rx="8" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
        <rect width="104" height="22" rx="8" fill={C.deep} />
        <rect y="12" width="104" height="10" fill={C.deep} />
        {[16, 40, 64, 88].map((x) => <rect key={x} x={x - 3} y="-6" width="7" height="18" rx="3.5" fill={C.n3} stroke={C.n2} strokeWidth="1" />)}
        {[40, 58, 76, 94, 112, 130].map((yy) => <path key={yy} d={`M12 ${yy}H92`} stroke={C.mist} strokeWidth="1.6" />)}
      </G>
      {d !== 'compact' && <Pencil x={216} y={196} r={-26} len={82} tone="green" />}
      {d !== 'compact' && <PottedPlant x={272} y={204} s={0.82} kind="slender" pot="sage" />}
    </g>
  )
}

/** Blank index cards. */
export function EmptyFlashcardsScene() {
  const d = useDetail()
  return (
    <g>
      <SceneDeco v="a" />
      <Shadow cx={160} cy={206} rx={100} o={0.8} />
      <CardFan x={102} y={192} n={3} spread={15} base={-18} w={112} h={74} s={1.1} filled={false} />
      {d !== 'compact' && <StickyNote x={218} y={120} r={7} tone="gold" size={44} lines={false} />}
      {d !== 'compact' && <PottedPlant x={270} y={204} s={0.8} kind="broad" />}
    </g>
  )
}

/** Planner with a single date waiting to be filled — no exams on the horizon yet. */
export function EmptyExamsScene() {
  const d = useDetail()
  return (
    <g>
      <SceneDeco v="a" />
      <Shadow cx={158} cy={206} rx={100} o={0.8} />
      <Planner x={74} y={40} w={142} h={148} empty />
      {d !== 'compact' && <Clock x={248} y={96} s={0.98} hands={[-20, 90]} />}
      {d !== 'compact' && <PottedPlant x={262} y={204} s={0.82} kind="slender" pot="sage" />}
    </g>
  )
}

/** A week board with blank sticky notes — a plan waiting to be made. */
export function EmptyPlanScene() {
  const d = useDetail()
  return (
    <g>
      <SceneDeco v="a" />
      <Shadow cx={160} cy={206} rx={112} o={0.8} />
      <G x={58} y={50}>
        <rect x="3" y="5" width="204" height="138" rx="10" fill={C.shadow} opacity="0.28" />
        <rect width="204" height="138" rx="10" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
        <rect width="204" height="20" rx="10" fill={C.deep} />
        <rect y="10" width="204" height="10" fill={C.deep} />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x={10 + i * 39} y="30" width="34" height="100" rx="5" fill={C.mint} />
            <rect x={14 + i * 39} y="35" width="20" height="4" rx="2" fill={C.soft} />
          </g>
        ))}
        <rect x="49" y="46" width="34" height="28" rx="3" fill="none" stroke={C.amber} strokeWidth="1.8" strokeDasharray="4 4" />
        <rect x="127" y="78" width="34" height="28" rx="3" fill="none" stroke={C.soft} strokeWidth="1.8" strokeDasharray="4 4" />
      </G>
      {d !== 'compact' && <StickyNote x={236} y={50} r={8} tone="gold" size={40} lines={false} />}
      {d !== 'compact' && <PottedPlant x={270} y={206} s={0.8} kind="broad" />}
    </g>
  )
}
