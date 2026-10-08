// src/components/illustrations/subjects/creative.jsx
// Art & Design · Music · Drama & Performing Arts · Media & Film.
import React from 'react'
import { C, G, Shadow, Sheet, Deco, DecoFront } from '../kit'
import { useDetail } from '../IllustrationFrame'

const r1 = (v) => Math.round(v * 10) / 10

/* ───────────────────────────── parts ───────────────────────────── */

/** Artist's palette with paint. Origin = centre. */
export function PaintPalette({ x = 0, y = 0, r = 0, s = 1 }) {
  return (
    <G x={x} y={y} r={r} s={s}>
      <path d="M-62-6C-64-40-22-56 18-50C58-44 76-14 60 14C46 38 14 36 4 22C-4 12-16 14-20 24C-30 44-64 36-62-6Z" fill={C.shadow} opacity="0.28" transform="translate(3 5)" />
      <path d="M-62-6C-64-40-22-56 18-50C58-44 76-14 60 14C46 38 14 36 4 22C-4 12-16 14-20 24C-30 44-64 36-62-6Z" fill={C.warm} />
      <path d="M60 14C46 38 14 36 4 22C-4 12-16 14-20 24C-30 44-64 36-62-6C-50 26-8 20 8 28C28 38 52 30 60 14Z" fill={C.warm2} opacity="0.55" />
      <ellipse cx="-34" cy="-2" rx="9" ry="7" fill={C.display} />
      <ellipse cx="-34" cy="-2" rx="9" ry="7" fill="none" stroke={C.warm3} strokeWidth="1.2" opacity="0.6" />
      {[[-8, -34, C.deep, 10], [18, -36, C.blueMid, 10], [40, -22, C.gold, 10], [44, 2, C.mist, 9], [20, 8, C.amber, 9]].map(([cx, cy, f, rr], i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx={rr} ry={rr * 0.8} fill={f} />
          <ellipse cx={cx - rr * 0.3} cy={cy - rr * 0.3} rx={rr * 0.3} ry={rr * 0.2} fill={C.hi} opacity="0.45" />
        </g>
      ))}
    </G>
  )
}

/** Paintbrush lying along +x from the bristle tip. Origin = tip. */
export function Brush({ x = 0, y = 0, r = -40, len = 110, tone = 'blue' }) {
  const bristle = tone === 'green' ? C.deep : C.blue
  return (
    <g transform={`translate(${r1(x)} ${r1(y)}) rotate(${r})`}>
      <path d="M0 0C6-4 14-5 22-5V5C14 5 6 4 0 0Z" fill={bristle} />
      <path d="M4-1.6C10-3 16-3.6 22-3.6V0C14 0 8-0.4 4-1.6Z" fill={C.hi} opacity="0.22" />
      <rect x="21" y="-5.4" width="20" height="10.8" rx="2" fill={C.n3} />
      <path d="M26-5.4V5.4M31-5.4V5.4M36-5.4V5.4" stroke={C.n2} strokeWidth="0.9" />
      <path d={`M41-4.4L${len - 6}-2.4Q${len}-2 ${len} 0Q${len} 2 ${len - 6} 2.4L41 4.4Z`} fill={C.warm3} />
      <path d={`M41-3.4L${len - 8}-1.6V-0.4L41-1.2Z`} fill={C.hi} opacity="0.25" />
    </g>
  )
}

/** Metronome. Origin = base centre. */
export function Metronome({ x = 0, y = 0, s = 1 }) {
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={2} cy={2} rx={34} />
      <path d="M-30 0L-16-96H16L30 0Z" fill={C.warm2} />
      <path d="M8-96H16L30 0H14Z" fill={C.warm3} opacity="0.6" />
      <path d="M-22-6L-11-88H11L22-6Z" fill={C.warm} />
      <path d="M-22-6L-11-88H-4L-14-6Z" fill={C.hi} opacity="0.35" />
      <path d="M-14-24H14M-12-38H12M-10-52H10M-8-66H8" stroke={C.warm3} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      <rect x="-34" y="-6" width="68" height="9" rx="3" fill={C.deep} />
      <rect x="-20" y="-100" width="40" height="8" rx="3" fill={C.deep} />
      <G x={0} y={-10} r={16}>
        <rect x="-1.4" y="-78" width="2.8" height="78" rx="1.4" fill={C.ink} opacity="0.75" />
        <rect x="-6.4" y="-60" width="12.8" height="14" rx="3" fill={C.gold} />
        <rect x="-6.4" y="-60" width="12.8" height="4" rx="2" fill={C.hi} opacity="0.35" />
      </G>
      <circle cx="0" cy="-10" r="4.6" fill={C.n3} stroke={C.n2} strokeWidth="1" />
    </G>
  )
}

/** Sheet music: abstract staves and notes (no real notation). Origin = top-left. */
export function SheetMusic({ x = 0, y = 0, r = 0, s = 1 }) {
  const d = useDetail()
  const staff = (oy) => <path key={oy} d={[0, 1, 2, 3, 4].map((i) => `M12 ${oy + i * 5}H72`).join('')} stroke={C.soft} strokeWidth="0.9" />
  return (
    <G x={x} y={y} r={r} s={s}>
      <rect x="3" y="4" width="84" height="104" rx="4" fill={C.shadow} opacity="0.28" />
      <rect width="84" height="104" rx="4" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
      {[16, 48, 80].map(staff)}
      {d !== 'compact' && (
        <g fill={C.deep} stroke={C.deep} strokeWidth="1.4">
          {[[22, 31], [34, 26], [46, 33], [58, 24]].map(([cx, cy], i) => (
            <g key={i}><ellipse cx={cx} cy={cy} rx="3.6" ry="2.8" transform={`rotate(-20 ${cx} ${cy})`} stroke="none" /><path d={`M${cx + 3.2} ${cy - 1}V${cy - 18}`} fill="none" /></g>
          ))}
          <path d="M37 8L61 6" strokeWidth="3" fill="none" />
        </g>
      )}
    </G>
  )
}

/** Theatre mask. Origin = centre. mood: 'smile' | 'frown' */
export function Mask({ x = 0, y = 0, r = 0, s = 1, mood = 'smile', tone = 'paper' }) {
  const fill = tone === 'paper' ? C.paper : tone === 'deep' ? C.mid : C.soft
  const shade = tone === 'paper' ? C.paper2 : tone === 'deep' ? C.deep : C.leaf
  const mouth = mood === 'smile' ? 'M-16 14Q0 34 16 14Q0 22-16 14Z' : 'M-15 26Q0 10 15 26Q0 18-15 26Z'
  const brow = mood === 'smile' ? 'M-24-12Q-17-20-8-14M8-14Q17-20 24-12' : 'M-24-14Q-16-10-8-18M8-18Q16-10 24-14'
  return (
    <G x={x} y={y} r={r} s={s}>
      <path d="M0-38C24-38 38-24 38-4C38 24 20 42 0 42C-20 42-38 24-38-4C-38-24-24-38 0-38Z" fill={C.shadow} opacity="0.3" transform="translate(3 5)" />
      <path d="M0-38C24-38 38-24 38-4C38 24 20 42 0 42C-20 42-38 24-38-4C-38-24-24-38 0-38Z" fill={fill} />
      <path d="M14-36C30-30 38-18 38-4C38 24 20 42 0 42C14 30 20 8 14-36Z" fill={shade} opacity="0.55" />
      <path d="M-22-4Q-14-12-6-4Q-14 4-22-4ZM6-4Q14-12 22-4Q14 4 6-4Z" fill={C.ink} opacity="0.78" />
      <path d={brow} fill="none" stroke={shade} strokeWidth="2.2" strokeLinecap="round" />
      <path d={mouth} fill={C.ink} opacity="0.78" />
    </G>
  )
}

/** Clapperboard. Origin = bottom-centre of the slate. */
export function Clapperboard({ x = 0, y = 0, r = 0, s = 1 }) {
  const stripes = []
  for (let i = 0; i < 6; i += 1) {
    stripes.push(<path key={i} d={`M${-50 + i * 17} -50l9 0l-7 16l-9 0Z`} fill={i % 2 ? C.paper : C.deep} />)
  }
  return (
    <G x={x} y={y} r={r} s={s}>
      <Shadow cx={3} cy={2} rx={58} />
      <rect x="-52" y="-62" width="104" height="62" rx="5" fill={C.screen} />
      <rect x="-52" y="-62" width="104" height="8" fill={C.ink} opacity="0.5" />
      <path d="M-42-40H-8M-42-28H12M-42-16H-22" stroke={C.mist} strokeWidth="3" strokeLinecap="round" opacity="0.85" />
      <path d="M20-40H40M20-28H40M20-16H40" stroke={C.leaf} strokeWidth="3" strokeLinecap="round" />
      <G x={-50} y={-64} r={-14}>
        <rect y="-17" width="104" height="17" rx="3" fill={C.paper} />
        <g transform="translate(50 17)">{stripes}</g>
        <rect y="-17" width="104" height="17" rx="3" fill="none" stroke={C.ink} strokeOpacity="0.3" strokeWidth="1.2" />
        <circle cx="0" cy="0" r="3.4" fill={C.n2} />
      </G>
    </G>
  )
}

/** Film strip. Origin = centre; lies along +x. */
export function FilmStrip({ x = 0, y = 0, r = 0, s = 1, len = 120 }) {
  const holes = []
  for (let i = 0; i < Math.floor(len / 12); i += 1) {
    holes.push(<rect key={`a${i}`} x={-len / 2 + 5 + i * 12} y="-11" width="6" height="4" rx="1" fill={C.display} />)
    holes.push(<rect key={`b${i}`} x={-len / 2 + 5 + i * 12} y="7" width="6" height="4" rx="1" fill={C.display} />)
  }
  return (
    <G x={x} y={y} r={r} s={s}>
      <rect x={-len / 2} y="-14" width={len} height="28" rx="3" fill={C.screen} />
      {holes}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={-len / 2 + 8 + i * 38} y="-6" width="30" height="12" rx="1.6" fill={[C.leaf, C.bluePale, C.soft][i]} />
      ))}
    </G>
  )
}

/* ───────────────────────── compositions ───────────────────────── */

export function ArtArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      {d === 'full' && (
        <g>
          <Sheet x={128} y={50} w={62} h={80} r={9} lines={0} head={false} fold={false} />
          <g transform="rotate(9 159 90)" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M142 112C142 96 152 86 160 74C168 86 178 96 178 112C178 122 170 128 160 128C150 128 142 122 142 112Z" stroke={C.leaf} strokeWidth="2.4" />
            <path d="M160 74V126" stroke={C.soft} strokeWidth="1.6" />
          </g>
        </g>
      )}
      <PaintPalette x={compact ? 120 : 112} y={compact ? 132 : 148} s={compact ? 1.12 : 1.02} />
      {!compact && <Brush x={64} y={198} r={-46} len={112} />}
      <DecoFront side="right" />
    </g>
  )
}

export function MusicArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="b" />
      {!compact && <SheetMusic x={124} y={48} r={7} s={0.9} />}
      <Metronome x={compact ? 120 : 96} y={compact ? 198 : 196} s={compact ? 1.22 : 1.12} />
      <DecoFront side="left" />
    </g>
  )
}

export function DramaArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      {!compact && <ellipse cx="120" cy="196" rx="74" ry="9" fill={C.goldPale} opacity="0.34" />}
      {!compact && <ellipse cx="120" cy="196" rx="48" ry="5.4" fill={C.goldPale} opacity="0.4" />}
      <Mask x={compact ? 98 : 94} y={compact ? 120 : 124} r={-14} s={compact ? 1.5 : 1.3} mood="frown" tone="deep" />
      <Mask x={compact ? 144 : 148} y={compact ? 134 : 138} r={12} s={compact ? 1.5 : 1.3} mood="smile" tone="paper" />
      <DecoFront side="left" />
    </g>
  )
}

export function FilmArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      {!compact && <FilmStrip x={118} y={184} r={-4} len={132} />}
      <Clapperboard x={compact ? 120 : 120} y={compact ? 182 : 160} r={-3} s={compact ? 1.2 : 1.05} />
      {d === 'full' && (
        <g transform="translate(176 62)">
          <circle r="16" fill={C.deep} />
          <path d="M-4-7L8 0L-4 7Z" fill={C.paper} />
        </g>
      )}
      <DecoFront side="right" />
    </g>
  )
}


/* ═════════════════════════ Photography · Media Studies ═════════════════════════ */

/** Camera, front-on. Origin = body centre. */
export function Camera({ x = 0, y = 0, s = 1, r = 0 }) {
  return (
    <G x={x} y={y} s={s} r={r}>
      <Shadow cx={3} cy={46} rx={68} />
      <rect x="-26" y="-48" width="30" height="16" rx="4" fill={C.n2} />
      <rect x="-22" y="-45" width="22" height="9" rx="2" fill={C.display} />
      <rect x="34" y="-46" width="24" height="12" rx="3" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
      <rect x="-56" y="-44" width="16" height="9" rx="3" fill={C.amber} />
      <rect x="-64" y="-34" width="128" height="76" rx="12" fill={C.deep} />
      <rect x="22" y="-34" width="42" height="76" rx="12" fill={C.ink} opacity="0.22" />
      <path d="M-64-22V-24Q-64-34-52-34H52Q64-34 64-24V-8H-64Z" fill={C.n3} />
      <rect x="-64" y="-10" width="128" height="3.4" fill={C.ink} opacity="0.28" />
      <rect x="-64" y="-34" width="128" height="4" rx="2" fill={C.hi} opacity="0.4" />
      <circle cy="10" r="33" fill={C.n2} />
      <circle cy="10" r="28.4" fill={C.screen} />
      <circle cy="10" r="22" fill={C.blueMid} />
      <circle cy="10" r="14" fill={C.blue} />
      <circle cy="10" r="6" fill={C.ink} />
      <path d="M-16-2A22 22 0 0 1-4-10" fill="none" stroke={C.hi} strokeWidth="3.4" strokeLinecap="round" opacity="0.75" />
      <circle cx="9" cy="1" r="2.6" fill={C.hi} opacity="0.6" />
    </G>
  )
}

/** Instant print. Origin = centre. */
export function Polaroid({ x = 0, y = 0, r = 0, s = 1 }) {
  return (
    <G x={x} y={y} r={r} s={s}>
      <rect x="-26" y="-31" width="54" height="66" rx="3" fill={C.shadow} opacity="0.3" />
      <rect x="-27" y="-33" width="54" height="66" rx="3" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
      <rect x="-22" y="-28" width="44" height="44" rx="1.6" fill={C.bluePale} />
      <circle cx="10" cy="-15" r="5.4" fill={C.goldPale} />
      <path d="M-22 16V4Q-10-7 2 4T22 0V16Z" fill={C.leaf} />
      <path d="M-22 16V10Q-4 2 22 12V16Z" fill={C.mid} />
    </G>
  )
}

export function PhotographyArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      {!compact && <Polaroid x={186} y={150} r={10} s={0.96} />}
      {d === 'full' && <Polaroid x={54} y={156} r={-9} s={0.84} />}
      <Camera x={compact ? 120 : 116} y={compact ? 124 : 134} s={compact ? 1.22 : 1.02} />
      <DecoFront side="right" />
    </g>
  )
}

/** Folded newspaper. Origin = centre; 92 × 116. */
export function Newspaper({ x = 0, y = 0, r = 0, s = 1 }) {
  return (
    <G x={x} y={y} r={r} s={s}>
      <rect x="-43" y="-53" width="92" height="116" rx="4" fill={C.shadow} opacity="0.28" />
      <rect x="-46" y="-58" width="92" height="116" rx="4" fill={C.paper} stroke={C.paper2} strokeWidth="1" />
      <rect x="-38" y="-50" width="76" height="11" rx="2" fill={C.deep} />
      <rect x="-38" y="-33" width="76" height="6" rx="2" fill={C.ink} opacity="0.85" />
      <rect x="-38" y="-23" width="50" height="6" rx="2" fill={C.ink} opacity="0.85" />
      <rect x="-38" y="-11" width="34" height="28" rx="2" fill={C.bluePale} />
      <path d="M-38 17V9Q-28 0-20 9T-4 5V17Z" fill={C.leaf} />
      <circle cx="-14" cy="-3" r="3.6" fill={C.goldPale} />
      {[-9, -1, 7, 15].map((yy, i) => <rect key={yy} x="0" y={yy} width={i % 2 ? 34 : 38} height="3.6" rx="1.8" fill={C.mist} />)}
      {[26, 34, 42, 50].map((yy, i) => (
        <g key={yy}><rect x="-38" y={yy} width={i % 2 ? 32 : 36} height="3.4" rx="1.7" fill={C.mist} /><rect x="2" y={yy} width={i % 2 ? 36 : 30} height="3.4" rx="1.7" fill={C.mist} /></g>
      ))}
      <path d="M0 -58V58" stroke={C.paper2} strokeWidth="1.4" />
    </G>
  )
}

/** Retro television. Origin = base centre. */
export function RetroTV({ x = 0, y = 0, s = 1 }) {
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={2} cy={8} rx={54} />
      <path d="M-8-66L-24-90M8-66L24-90" stroke={C.n2} strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="-24" cy="-91" r="3.2" fill={C.n2} />
      <circle cx="24" cy="-91" r="3.2" fill={C.n2} />
      <rect x="-34" y="-3" width="12" height="9" rx="3" fill={C.warm3} />
      <rect x="22" y="-3" width="12" height="9" rx="3" fill={C.warm3} />
      <rect x="-48" y="-68" width="96" height="68" rx="11" fill={C.warm2} />
      <rect x="22" y="-68" width="26" height="68" rx="11" fill={C.warm3} opacity="0.4" />
      <rect x="-48" y="-68" width="96" height="4" rx="2" fill={C.hi} opacity="0.35" />
      <rect x="-40" y="-60" width="60" height="50" rx="9" fill={C.screen} />
      <rect x="-37" y="-57" width="54" height="44" rx="7" fill={C.display} />
      <path d="M-18-46L0-35L-18-24Z" fill={C.leaf} />
      <path d="M-34-20Q-20-26-6-20" fill="none" stroke={C.soft} strokeWidth="2" strokeLinecap="round" />
      <circle cx="35" cy="-48" r="6.6" fill={C.warm3} />
      <circle cx="35" cy="-30" r="6.6" fill={C.warm3} />
      <path d="M31-18H39M31-14H39M31-10H39" stroke={C.warm3} strokeWidth="1.4" strokeLinecap="round" />
    </G>
  )
}

export function MediaStudiesArt() {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      <Newspaper x={compact ? 98 : 88} y={compact ? 124 : 118} r={-7} s={compact ? 1.12 : 1} />
      <RetroTV x={compact ? 152 : 160} y={compact ? 192 : 196} s={compact ? 1.0 : 0.94} />
      {d === 'full' && (
        <g fill="none" stroke={C.leaf} strokeWidth="2.6" strokeLinecap="round">
          <path d="M184 76Q192 70 200 76" /><path d="M180 66Q192 56 204 66" />
        </g>
      )}
    </g>
  )
}
