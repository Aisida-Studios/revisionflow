// src/components/illustrations/scenes/features.jsx
// Feature scenes (320 × 240). The Stage backdrop is added by <Illustration/>; these draw only
// the still-life. Scenes are objects, not people — the learning activity is the subject.
import React from 'react'
import { C, G, Shadow, Sheet, Pencil, BookStack, Laptop, PottedPlant } from '../kit'
import { useDetail } from '../IllustrationFrame'
import { OpenBook, Bubble } from '../subjects/humanities'
import { ChartCard, Calculator, Clipboard } from '../subjects/applied'
import {
  Desk, WindowFrame, Mug, Clock, Headphones, Highlighter, StickyNote, CardFan, Planner,
  Notebook, Worksheet, PencilCase, Shelf, Folder, SceneDeco,
} from './parts'

/* ───────────────────────────── Dashboard ───────────────────────────── */
export function DashboardScene() {
  const d = useDetail()
  const full = d === 'full'
  return (
    <g>
      <SceneDeco v="a" />
      {d !== 'compact' && <WindowFrame x={40} y={36} w={98} h={104} />}
      {full && <path d="M58 142H138L200 200H84Z" fill={C.goldPale} opacity="0.16" />}
      <Desk />
      {d !== 'compact' && <BookStack x={70} y={202} books={[{ w: 76, h: 15, tone: 'mid' }, { w: 66, h: 13, tone: 'cream', dx: 3 }, { w: 58, h: 12, tone: 'blueMid', dx: -2 }]} />}
      <Laptop x={164} y={198} s={1.1} ui="dashboard" />
      {d !== 'compact' && <PottedPlant x={262} y={202} s={1.18} kind="broad" />}
      {full && <Mug x={226} y={202} s={0.95} />}
      {full && <Pencil x={110} y={207} r={-3} len={64} />}
    </g>
  )
}

/* ───────────────────────────── Study ───────────────────────────── */
export function StudyScene() {
  const d = useDetail()
  const full = d === 'full'
  return (
    <g>
      <SceneDeco v="a" />
      <Desk />
      <OpenBook x={150} y={192} s={1.5} cover="cream" />
      {d !== 'compact' && (
        <g>
          <rect x="236" y="104" width="12" height="9" rx="2" fill={C.leaf} />
          <rect x="237" y="122" width="12" height="9" rx="2" fill={C.amber} />
          <rect x="237" y="140" width="12" height="9" rx="2" fill={C.blueMid} />
        </g>
      )}
      {full && <Highlighter x={78} y={208} r={-6} tone="gold" len={70} />}
      {full && <Highlighter x={84} y={217} r={-2} tone="leaf" len={66} />}
      {d !== 'compact' && <CardFan x={262} y={198} n={3} s={0.78} spread={15} base={-14} />}
      {d !== 'compact' && <PottedPlant x={58} y={202} s={0.78} kind="sprout" pot="sage" />}
    </g>
  )
}

/* ───────────────────────────── Calendar ───────────────────────────── */
export function CalendarScene({ empty = false }) {
  const d = useDetail()
  const marks = empty ? [] : [
    { i: 2, tone: 'leaf' }, { i: 3, tone: 'leaf' }, { i: 4, tone: 'leaf' }, { i: 8, tone: 'leaf' },
    { i: 10, tone: 'leaf' }, { i: 15, tone: 'leaf' }, { i: 16, tone: 'amber' }, { i: 17, tone: 'leaf' },
    { i: 22, tone: 'blue' }, { i: 24, tone: 'leaf' },
  ]
  return (
    <g>
      <SceneDeco v="a" />
      <Shadow cx={160} cy={206} rx={104} o={0.8} />
      <Planner x={84} y={36} w={152} h={156} marks={marks} empty={empty} />
      {d !== 'compact' && <PottedPlant x={54} y={204} s={0.95} kind="broad" />}
      {d !== 'compact' && <PottedPlant x={266} y={204} s={1.0} kind="slender" pot="sage" />}
    </g>
  )
}

/* ───────────────────────────── Past papers ───────────────────────────── */
export function PastPapersScene() {
  const d = useDetail()
  return (
    <g>
      <SceneDeco v="a" />
      <Shadow cx={166} cy={204} rx={100} o={0.8} />
      <Sheet x={96} y={44} w={104} h={138} r={-10} lines={5} />
      <Sheet x={120} y={40} w={104} h={138} r={7} lines={5} />
      <G x={112} y={50} r={-2}>
        <rect x="3" y="5" width="108" height="144" rx="5" fill={C.shadow} opacity="0.3" />
        <rect width="108" height="144" rx="5" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
        <rect x="14" y="14" width="44" height="6" rx="3" fill={C.leaf} />
        {[34, 50, 66, 82, 98].map((yy, i) => (
          <rect key={yy} x="14" y={yy} width={i % 2 ? 62 : 76} height="4" rx="2" fill={C.mist} />
        ))}
        {d !== 'compact' && [32, 64, 96].map((yy) => (
          <path key={yy} d={`M${96} ${yy}l4 5l9-12`} fill="none" stroke={C.leaf} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        <circle cx="82" cy="124" r="15" fill={C.paper} stroke={C.leaf} strokeWidth="3.4" />
        <path d="M75 124l5 5l10-11" fill="none" stroke={C.deep} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 126H60M14 136H46" stroke={C.mist} strokeWidth="4" strokeLinecap="round" />
        <path d="M24 0V-10Q24-14 28-14T32-10V12" fill="none" stroke={C.n2} strokeWidth="2" strokeLinecap="round" />
      </G>
      {d !== 'compact' && <Pencil x={206} y={196} r={-22} len={84} />}
      {d !== 'compact' && <PottedPlant x={276} y={204} s={0.8} kind="broad" />}
    </g>
  )
}

/* ───────────────────────────── Mistakes: flag → understand → improve ───────────────────────────── */
export function MistakesScene() {
  const d = useDetail()
  return (
    <g>
      <SceneDeco v="a" />
      <Shadow cx={170} cy={206} rx={96} o={0.8} />
      <Worksheet x={98} y={38} r={-3} w={124} h={156}>
        <rect x="14" y="32" width="74" height="5" rx="2.5" fill={C.mist} />
        <rect x="8" y="46" width="108" height="19" rx="5" fill={C.amberPale} />
        <rect x="14" y="52" width="82" height="5" rx="2.5" fill={C.soft} />
        <path d="M14 63q4 4 8 0t8 0t8 0t8 0t8 0t8 0" fill="none" stroke={C.amber} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M100 64C116 70 116 86 98 90" fill="none" stroke={C.leaf} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M103 84L97 90L104 94" fill="none" stroke={C.leaf} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="14" y="86" width="70" height="6" rx="3" fill={C.leaf} />
        <circle cx="100" cy="112" r="11" fill={C.leaf} />
        <path d="M94.4 112l4 4l7.4-8" fill="none" stroke={C.paper} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="14" y="108" width="60" height="5" rx="2.5" fill={C.mid} opacity="0.85" />
        {[128, 140].map((yy, i) => <rect key={yy} x="14" y={yy} width={i ? 52 : 86} height="4.4" rx="2.2" fill={C.mist} />)}
      </Worksheet>
      {d !== 'compact' && (
        <G x={60} y={198} r={-10}>
          <Shadow cx={16} cy={3} rx={20} />
          <rect width="34" height="15" rx="3" fill={C.paper} />
          <rect x="18" width="16" height="15" rx="3" fill={C.soft} />
          <rect width="34" height="3" rx="1.5" fill={C.hi} opacity="0.5" />
        </G>
      )}
      {d !== 'compact' && <Pencil x={208} y={198} r={-24} len={84} />}
      {d !== 'compact' && <PottedPlant x={274} y={204} s={0.82} kind="slender" pot="sage" />}
    </g>
  )
}

/* ───────────────────────────── Analytics ───────────────────────────── */
export function AnalyticsScene({ empty = false }) {
  const d = useDetail()
  const C2 = 2 * Math.PI * 22
  return (
    <g>
      <SceneDeco v="a" />
      <Shadow cx={160} cy={206} rx={108} o={0.8} />
      <ChartCard x={66} y={48} w={172} h={122} r={-3} empty={empty} />
      {!empty && (
        <G x={196} y={104} r={4}>
          <rect x="3" y="5" width="76" height="76" rx="10" fill={C.shadow} opacity="0.28" />
          <rect width="76" height="76" rx="10" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
          <g transform="translate(38 38) rotate(-90)">
            <circle r="22" fill="none" stroke={C.mist} strokeWidth="9" />
            <circle r="22" fill="none" stroke={C.leaf} strokeWidth="9" strokeDasharray={`${C2 * 0.62} ${C2}`} strokeLinecap="round" />
            <circle r="22" fill="none" stroke={C.amber} strokeWidth="9" strokeDasharray={`${C2 * 0.16} ${C2}`} strokeDashoffset={-C2 * 0.68} strokeLinecap="round" />
          </g>
        </G>
      )}
      {d !== 'compact' && (
        <G x={44} y={150} r={-6}>
          <rect x="3" y="4" width="72" height="34" rx="8" fill={C.shadow} opacity="0.28" />
          <rect width="72" height="34" rx="8" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
          <path d={empty ? 'M10 24H62' : 'M10 26L24 18L36 22L50 10L62 14'} fill="none" stroke={empty ? C.soft : C.deep} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={empty ? '3 5' : undefined} />
        </G>
      )}
      {d === 'full' && <PottedPlant x={290} y={206} s={0.62} kind="broad" />}
    </g>
  )
}

/* ───────────────────────────── Exam ───────────────────────────── */
export function ExamScene() {
  const d = useDetail()
  return (
    <g>
      <SceneDeco v="a" />
      <Desk />
      <Sheet x={104} y={70} w={96} h={128} r={-4} lines={6} />
      {d !== 'compact' && <Clock x={236} y={88} s={1.14} hands={[-24, 140]} />}
      {d !== 'compact' && <PencilCase x={40} y={202} s={0.92} />}
      {d === 'full' && <Calculator x={224} y={202} r={0} s={0.88} />}
    </g>
  )
}

/* ───────────────────────────── Focus ───────────────────────────── */
export function FocusScene() {
  const d = useDetail()
  const R = 2 * Math.PI * 24
  return (
    <g>
      <SceneDeco v="a" />
      <Shadow cx={150} cy={208} rx={100} o={0.8} />
      <OpenBook x={150} y={206} s={1.22} cover="deep" />
      <Headphones x={150} y={58} s={1.12} />
      {d !== 'compact' && (
        <G x={252} y={82}>
          <circle cx="2" cy="4" r="30" fill={C.shadow} opacity="0.25" />
          <circle r="30" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
          <g transform="rotate(-90)">
            <circle r="24" fill="none" stroke={C.mist} strokeWidth="7" />
            <circle r="24" fill="none" stroke={C.leaf} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${R * 0.7} ${R}`} />
          </g>
          <path d="M0 0V-12M0 0L8 5" stroke={C.deep} strokeWidth="2.6" strokeLinecap="round" />
        </G>
      )}
      {d !== 'compact' && <PottedPlant x={52} y={204} s={0.86} kind="spiky" pot="white" />}
    </g>
  )
}

/* ───────────────────────────── Success ───────────────────────────── */
export function SuccessScene() {
  const d = useDetail()
  return (
    <g>
      <SceneDeco v="l" />
      <Shadow cx={158} cy={208} rx={90} o={0.8} />
      <Clipboard x={108} y={42} r={-3} s={1.36} ticks={4} />
      <G x={214} y={160}>
        <circle cx="2" cy="4" r="27" fill={C.shadow} opacity="0.28" />
        <circle r="26" fill={C.deep} />
        <circle r="21" fill={C.mid} />
        <path d="M-10 0L-3 8L11-8" fill="none" stroke={C.paper} strokeWidth="5.2" strokeLinecap="round" strokeLinejoin="round" />
      </G>
      {d !== 'compact' && <PottedPlant x={270} y={204} s={1.2} kind="broad" />}
    </g>
  )
}

/* ───────────────────────────── Revision ───────────────────────────── */
export function RevisionScene() {
  const d = useDetail()
  return (
    <g>
      <SceneDeco v="a" />
      <Desk />
      <CardFan x={102} y={198} n={4} spread={13} base={-24} w={108} h={70} s={1.06} />
      {d !== 'compact' && <StickyNote x={214} y={112} r={6} tone="gold" size={46} />}
      {d === 'full' && <Highlighter x={64} y={212} r={-3} tone="blue" len={62} />}
      {d !== 'compact' && <PottedPlant x={272} y={202} s={0.86} kind="slender" pot="cream" />}
    </g>
  )
}

/* ───────────────────────────── Welcome (first use) ───────────────────────────── */
export function WelcomeScene() {
  const d = useDetail()
  return (
    <g>
      <SceneDeco v="a" />
      <Desk />
      <Notebook x={110} y={200} r={-4} w={96} h={126} />
      {d !== 'compact' && <Mug x={196} y={202} s={1.05} />}
      {d !== 'compact' && <PottedPlant x={252} y={202} s={1.1} kind="broad" />}
      {d === 'full' && <Pencil x={72} y={210} r={-2} len={66} />}
    </g>
  )
}

/* ───────────────────────────── Resources ───────────────────────────── */
export function ResourcesScene() {
  const d = useDetail()
  return (
    <g>
      <SceneDeco v="a" />
      <Shadow cx={166} cy={206} rx={104} o={0.8} />
      <Shelf x={80} y={44} w={172} h={146} />
      {d !== 'compact' && <PottedPlant x={226} y={44} s={0.56} kind="slender" pot="sage" />}
      {d !== 'compact' && <Folder x={186} y={206} s={1.0} />}
    </g>
  )
}

/* ───────────────────────────── Assistant (a useful academic helper — no robots, no sparkles) ───────────────────────────── */
export function AssistantScene() {
  const d = useDetail()
  return (
    <g>
      <SceneDeco v="a" />
      <Desk />
      <OpenBook x={150} y={194} s={1.26} cover="cream" />
      <G x={52} y={34}><Bubble w={100} h={56} tone="paper" tail="left" marks="bars" /></G>
      <G x={146} y={56}><Bubble w={112} h={60} tone="deep" tail="right" marks="bars" /></G>
      {d === 'full' && <Pencil x={214} y={204} r={-8} len={72} tone="blue" />}
    </g>
  )
}
