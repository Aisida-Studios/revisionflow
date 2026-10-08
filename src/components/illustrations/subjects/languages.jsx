// src/components/illustrations/subjects/languages.jsx
// One illustration per language — languages are different subjects and never share a picture.
//
//  • Seven languages get a recognisable STRUCTURE (French · German · Spanish · Italian ·
//    Portuguese · Latin · Classical Greek), drawn restrained in the family palette.
//  • Fourteen get a real SCRIPT LETTER in a speech bubble (Mandarin · Japanese · Arabic · Urdu ·
//    Persian · Hebrew · Russian · Greek · Bengali · Gujarati · Panjabi · Polish · Turkish · Welsh).
//    The letters are genuine Noto Sans outlines (glyphs.js), never hand-drawn pseudo-script.
// Every one sits on the same book stack with the same foliage framing, so they read as a set.
import React from 'react'
import { C, G, Shadow, BookStack, Deco, DecoFront } from '../kit'
import { useDetail } from '../IllustrationFrame'
import { GLYPHS } from './glyphs'

const r1 = (v) => Math.round(v * 10) / 10

/* ───────────────────────────── landmarks (origin = ground centre) ───────────────────────────── */

/** Iron lattice tower. ~150 tall. */
export function Eiffel({ x = 0, y = 0, s = 1 }) {
  const d = useDetail()
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={2} cy={2} rx={46} />
      <path d="M-36 0C-31-26-19-54-10-86L-6.4-118L-2.4-136L0-150L2.4-136L6.4-118L10-86C19-54 31-26 36 0H23C21-13 15-33 10-48H-10C-15-33-21-13-23 0Z" fill={C.mid} />
      <path d="M0-150L2.4-136L6.4-118L10-86C19-54 31-26 36 0H23C21-13 15-33 10-48H4Z" fill={C.deep} opacity="0.75" />
      <rect x="-15" y="-54" width="30" height="6.4" rx="2.2" fill={C.deep} />
      <rect x="-9.4" y="-92" width="18.8" height="5.4" rx="2" fill={C.deep} />
      <rect x="-5" y="-122" width="10" height="4" rx="1.6" fill={C.deep} />
      {d !== 'compact' && (
        <g stroke={C.mist} strokeWidth="1.3" strokeLinecap="round" opacity="0.55" fill="none">
          <path d="M-31-6L-17-42M-17-6L-27-40M31-6L17-42M17-6L27-40" />
          <path d="M-9-60L8-86M9-60L-8-86M-6-96L5-118M6-96L-5-118" />
        </g>
      )}
    </G>
  )
}

/** Neoclassical gate with six columns and a chariot. ~124 wide. */
export function BrandenburgGate({ x = 0, y = 0, s = 1 }) {
  const cols = [-50, -30, -10, 10, 30, 50]
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={2} cy={2} rx={66} />
      <rect x="-64" y="-8" width="128" height="8" rx="2" fill={C.warm2} />
      {cols.map((cx) => (
        <g key={cx}>
          <rect x={cx - 5.6} y="-56" width="11.2" height="48" fill={C.warm} />
          <rect x={cx + 0.6} y="-56" width="5" height="48" fill={C.warm2} opacity="0.85" />
          <rect x={cx - 7.4} y="-60" width="14.8" height="5" rx="1.4" fill={C.paper} />
        </g>
      ))}
      <rect x="-64" y="-72" width="128" height="13" rx="2" fill={C.paper} />
      <rect x="-64" y="-64" width="128" height="5" fill={C.warm3} opacity="0.4" />
      <rect x="-54" y="-86" width="108" height="14" rx="2" fill={C.warm2} />
      <g fill={C.deep}>
        <path d="M-17-86H17L14-92H-14Z" />
        {[-12, -6, 0, 6].map((hx, i) => <path key={i} d={`M${hx - 2.4} -92Q${hx - 2} ${-100 - i * 0.6} ${hx + 1} ${-101}Q${hx + 2.6} ${-100} ${hx + 2.4} -92Z`} />)}
        <rect x="9" y="-103" width="6" height="12" rx="3" />
        <circle cx="-16" cy="-90" r="3.6" />
      </g>
    </G>
  )
}

/** Three horseshoe arches with striped voussoirs. ~128 wide. */
export function StripedArches({ x = 0, y = 0, s = 1 }) {
  const arch = 'M-14 0V-22A15.4 15.4 0 1 1 14-22V0'
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={2} cy={2} rx={68} />
      <rect x="-66" y="-84" width="132" height="84" rx="3" fill={C.warm} />
      <rect x="22" y="-84" width="44" height="84" fill={C.warm2} opacity="0.55" />
      <rect x="-66" y="-84" width="132" height="6" rx="3" fill={C.warm3} opacity="0.6" />
      {[-40, 0, 40].map((cx) => (
        <g key={cx} transform={`translate(${cx} -4)`}>
          <path d={`${arch}Z`} fill={C.deep} />
          <path d="M-9 0V-22A10.4 10.4 0 1 1 9-22V0Z" fill={C.ink} opacity="0.5" />
          <path d={arch} fill="none" stroke={C.amber} strokeWidth="9" />
          <path d={arch} fill="none" stroke={C.paper} strokeWidth="9" strokeDasharray="5.2 5.2" />
          <path d="M-14 0V-22A15.4 15.4 0 1 1 14-22V0" fill="none" stroke={C.warm3} strokeWidth="1" opacity="0.5" transform="scale(1.34 1.2) translate(0 3)" />
        </g>
      ))}
    </G>
  )
}

/** Leaning tower. ~120 tall, leans 5°. */
export function PisaTower({ x = 0, y = 0, s = 1 }) {
  const tiers = 6
  const out = []
  for (let i = 0; i < tiers; i += 1) {
    const ty = -i * 17 - 17
    out.push(
      <g key={i}>
        <rect x="-17" y={ty} width="34" height="17" fill={i % 2 ? C.paper : C.mist} />
        <rect x="6" y={ty} width="11" height="17" fill={C.soft} opacity="0.6" />
        {[-12, -6, 0, 6, 12].map((ax) => <rect key={ax} x={ax - 1.7} y={ty + 4} width="3.4" height="9" rx="1.7" fill={C.soft} />)}
        <rect x="-18.4" y={ty - 1.2} width="36.8" height="2.6" rx="1.3" fill={C.paper2} />
      </g>,
    )
  }
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={10} cy={2} rx={44} />
      <g transform="rotate(5)">
        {out}
        <rect x="-12.6" y={-tiers * 17 - 14} width="25.2" height="14" fill={C.paper} />
        <rect x="3" y={-tiers * 17 - 14} width="9.6" height="14" fill={C.soft} opacity="0.6" />
        <path d={`M-14.4 ${-tiers * 17 - 14}Q0 ${-tiers * 17 - 27} 14.4 ${-tiers * 17 - 14}Z`} fill={C.deep} />
      </g>
    </G>
  )
}

/** Blue-and-white ceramic tile panel (azulejo). ~112 wide. */
export function Azulejo({ x = 0, y = 0, s = 1 }) {
  const tile = (cx, cy, k) => (
    <g key={k} transform={`translate(${cx} ${cy})`}>
      <rect x="-17" y="-17" width="34" height="34" rx="2" fill={C.paper} />
      {[[-17, -17, 0], [17, -17, 90], [17, 17, 180], [-17, 17, 270]].map(([qx, qy, r]) => (
        <path key={r} d="M0 0H13A13 13 0 0 1 0 13Z" fill={C.blue} opacity="0.85" transform={`translate(${qx} ${qy}) rotate(${r})`} />
      ))}
      {[0, 90, 180, 270].map((r) => <ellipse key={r} cx="0" cy="-8.4" rx="3.6" ry="6.6" fill={C.blueMid} transform={`rotate(${r})`} />)}
      <circle r="3.6" fill={C.blue} />
    </g>
  )
  const tiles = []
  for (let r = 0; r < 3; r += 1) for (let c = 0; c < 3; c += 1) tiles.push(tile((c - 1) * 36, (r - 1) * 36 - 56, `${r}${c}`))
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={2} cy={2} rx={62} />
      <rect x="-60" y="-114" width="120" height="116" rx="7" fill={C.bluePale} />
      <rect x="-60" y="-114" width="120" height="116" rx="7" fill="none" stroke={C.blue} strokeWidth="1.6" opacity="0.5" />
      {tiles}
    </G>
  )
}

/** Roman aqueduct: two tiers of round arches, punched through so the backdrop shows. ~150 wide. */
export function Aqueduct({ x = 0, y = 0, s = 1 }) {
  const big = [-48, 0, 48].map((cx) => `M${cx - 17} 0V-22A17 17 0 0 1 ${cx + 17} -22V0Z`).join('')
  const small = Array.from({ length: 6 }, (_, i) => {
    const cx = -62.5 + i * 25
    return `M${cx - 8} -46V-56A8 8 0 0 1 ${cx + 8} -56V-46Z`
  }).join('')
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={2} cy={2} rx={80} />
      <path d={`M-76-44H76V0H-76Z ${big}`} fill={C.warm} fillRule="evenodd" />
      <path d={`M-76-80H76V-44H-76Z ${small}`} fill={C.warm2} fillRule="evenodd" />
      <path d="M26-44H76V0H66Q66-22 48-22Q30-22 30 0H26Z" fill={C.warm3} opacity="0.3" />
      <rect x="-76" y="-86" width="152" height="7" rx="2" fill={C.warm3} />
      <rect x="-76" y="-47" width="152" height="3.6" fill={C.warm3} opacity="0.5" />
    </G>
  )
}

/** Greek temple front: pediment, seven columns, stepped base. ~132 wide. */
export function Parthenon({ x = 0, y = 0, s = 1 }) {
  const cols = [-51, -34, -17, 0, 17, 34, 51]
  return (
    <G x={x} y={y} s={s}>
      <Shadow cx={2} cy={2} rx={72} />
      <rect x="-68" y="-5" width="136" height="5" rx="1.6" fill={C.warm2} />
      <rect x="-64" y="-10" width="128" height="5" rx="1.6" fill={C.warm} />
      {cols.map((cx) => (
        <g key={cx}>
          <rect x={cx - 5} y="-62" width="10" height="52" fill={C.warm} />
          <rect x={cx + 1} y="-62" width="4" height="52" fill={C.warm2} opacity="0.9" />
          <rect x={cx - 6.8} y="-66" width="13.6" height="5" rx="1.4" fill={C.paper} />
        </g>
      ))}
      <rect x="-64" y="-76" width="128" height="10" rx="1.6" fill={C.paper} />
      <rect x="-64" y="-70" width="128" height="4" fill={C.warm3} opacity="0.4" />
      <path d="M-68-76L0-102L68-76Z" fill={C.warm} />
      <path d="M-50-79L0-97L50-79Z" fill={C.warm2} opacity="0.8" />
      <circle cx="0" cy="-86" r="3" fill={C.leaf} />
    </G>
  )
}

/* ───────────────────────────── glyph speech bubble ───────────────────────────── */

const BUBBLES = {
  deep:  { fill: C.deep,  glyph: C.paper },
  teal:  { fill: C.teal,  glyph: C.paper },
  blue:  { fill: C.blue,  glyph: C.paper },
  mid:   { fill: C.mid,   glyph: C.paper },
  gold:  { fill: C.gold,  glyph: C.ink },
  paper: { fill: C.paper, glyph: C.deep, edge: true },
  paperTeal: { fill: C.paper, glyph: C.teal, edge: true },
  paperBlue: { fill: C.paper, glyph: C.blue, edge: true },
  paperMid:  { fill: C.paper, glyph: C.mid, edge: true },
}

/** Speech bubble holding one script letter. Origin = bubble centre; ~96 × 80. */
export function GlyphBubble({ x = 0, y = 0, s = 1, glyph, tone = 'deep' }) {
  const t = BUBBLES[tone] || BUBBLES.deep
  return (
    <G x={x} y={y} s={s}>
      <rect x="-45" y="-34" width="96" height="80" rx="24" fill={C.shadow} opacity="0.28" />
      <path d="M-28 36L-44 62L-6 40Z" fill={t.fill} />
      <rect x="-48" y="-40" width="96" height="80" rx="24" fill={t.fill} stroke={t.edge ? t.glyph : 'none'} strokeOpacity="0.5" strokeWidth="2.4" />
      <path d="M-28 38L-44 62L-8 40Z" fill={t.fill} stroke={t.edge ? t.glyph : 'none'} strokeOpacity="0.5" strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="-26" y="36" width="22" height="6" fill={t.fill} />
      <g transform="scale(0.56)"><path d={GLYPHS[glyph]} fill={t.glyph} /></g>
    </G>
  )
}

/* ───────────────────────────── compositions ───────────────────────────── */

const BOOK_SETS = {
  a: [{ w: 112, h: 17, tone: 'mid' }, { w: 98, h: 14, tone: 'cream', dx: 3 }, { w: 86, h: 13, tone: 'blueMid', dx: -3 }],
  b: [{ w: 112, h: 17, tone: 'deep' }, { w: 98, h: 14, tone: 'warm', dx: -3 }, { w: 86, h: 13, tone: 'cream', dx: 3 }],
  c: [{ w: 112, h: 17, tone: 'blue' }, { w: 98, h: 14, tone: 'cream', dx: 3 }, { w: 86, h: 13, tone: 'mid', dx: -3 }],
  d: [{ w: 112, h: 17, tone: 'warm' }, { w: 98, h: 14, tone: 'deep', dx: -3 }, { w: 86, h: 13, tone: 'cream', dx: 3 }],
  e: [{ w: 112, h: 17, tone: 'soft' }, { w: 98, h: 14, tone: 'cream', dx: 3 }, { w: 86, h: 13, tone: 'deep', dx: -3 }],
}

function GlyphLanguage({ glyph, tone, books = 'a' }) {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      {compact ? (
        <g>
          <GlyphBubble x={120} y={104} s={1.18} glyph={glyph} tone={tone} />
          <BookStack x={120} y={198} s={1.0} books={BOOK_SETS[books].slice(0, 1)} />
        </g>
      ) : (
        <g>
          <GlyphBubble x={118} y={84} s={1.0} glyph={glyph} tone={tone} />
          <BookStack x={120} y={198} books={BOOK_SETS[books]} />
        </g>
      )}
      <DecoFront side="left" />
    </g>
  )
}

function LandmarkLanguage({ Landmark, y = 182, s = 1, books = 'a', ox = 0 }) {
  const d = useDetail()
  const compact = d === 'compact'
  return (
    <g>
      <Deco v="a" />
      <Landmark x={120 + ox} y={compact ? y + 2 : y} s={compact ? s * 1.02 : s} />
      <BookStack x={120} y={compact ? 200 : 199} s={compact ? 1.06 : 0.96} books={compact ? BOOK_SETS[books].slice(0, 2) : BOOK_SETS[books]} />
      <DecoFront side="left" />
    </g>
  )
}

/* structures */
export const FrenchArt = () => <LandmarkLanguage Landmark={Eiffel} y={178} s={0.84} books="b" />
export const GermanArt = () => <LandmarkLanguage Landmark={BrandenburgGate} y={176} s={0.98} books="d" />
export const SpanishArt = () => <LandmarkLanguage Landmark={StripedArches} y={176} s={0.94} books="a" />
export const ItalianArt = () => <LandmarkLanguage Landmark={PisaTower} y={178} s={0.9} books="e" ox={-4} />
export const PortugueseArt = () => <LandmarkLanguage Landmark={Azulejo} y={180} s={0.9} books="c" />
export const LatinArt = () => <LandmarkLanguage Landmark={Aqueduct} y={176} s={0.86} books="d" />
export const ClassicalGreekArt = () => <LandmarkLanguage Landmark={Parthenon} y={176} s={0.9} books="e" />

/* script letters */
export const MandarinArt = () => <GlyphLanguage glyph="mandarin" tone="deep" books="a" />
export const JapaneseArt = () => <GlyphLanguage glyph="japanese" tone="paper" books="c" />
export const ArabicArt = () => <GlyphLanguage glyph="arabic" tone="teal" books="b" />
export const UrduArt = () => <GlyphLanguage glyph="urdu" tone="paperTeal" books="a" />
export const PersianArt = () => <GlyphLanguage glyph="persian" tone="blue" books="d" />
export const HebrewArt = () => <GlyphLanguage glyph="hebrew" tone="paperBlue" books="b" />
export const RussianArt = () => <GlyphLanguage glyph="russian" tone="blue" books="e" />
export const GreekArt = () => <GlyphLanguage glyph="greek" tone="paperBlue" books="a" />
export const BengaliArt = () => <GlyphLanguage glyph="bengali" tone="mid" books="d" />
export const GujaratiArt = () => <GlyphLanguage glyph="gujarati" tone="paperMid" books="c" />
export const PanjabiArt = () => <GlyphLanguage glyph="panjabi" tone="gold" books="b" />
export const PolishArt = () => <GlyphLanguage glyph="polish" tone="paper" books="a" />
export const TurkishArt = () => <GlyphLanguage glyph="turkish" tone="teal" books="d" />
export const WelshArt = () => <GlyphLanguage glyph="welsh" tone="deep" books="c" />
