// src/pages/Timer.jsx — Professional Focus Timer
import { useState, useEffect, useRef, useCallback } from 'react'
import { useTimer } from '../context/TimerContext'
import { startSound, stopSound } from '../utils/timerSounds'
import { awardTimerXP, recordActivityStreak } from '../utils/firestore'
import { useAuth } from '../context/AuthContext'

/* ─── Formatting ─────────────────────────────────────────────── */
function fmt(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  if (h > 0) return `${h}:${pad(m)}:${pad(sec)}`
  return `${pad(m)}:${pad(sec)}`
}
function pad(n) { return String(n).padStart(2, '0') }

/* ─── Scenes ─────────────────────────────────────────────────── */
const SCENES = [
  { id: 'none',     label: 'None',      icon: '○',  bg: '',  overlay: '' },
  { id: 'forest',   label: 'Forest',    icon: '🌲', bg: 'forest',   overlay: 'rgba(0,8,2,0.55)'    },
  { id: 'rain',     label: 'Rain',      icon: '🌧', bg: 'rain',     overlay: 'rgba(2,5,15,0.6)'    },
  { id: 'ocean',    label: 'Ocean',     icon: '🌊', bg: 'ocean',    overlay: 'rgba(0,6,20,0.55)'   },
  { id: 'sunset',   label: 'Sunset',    icon: '🌅', bg: 'sunset',   overlay: 'rgba(8,0,5,0.45)'    },
  { id: 'snow',     label: 'Snow',      icon: '❄',  bg: 'snow',     overlay: 'rgba(2,4,15,0.6)'    },
  { id: 'aurora',   label: 'Aurora',    icon: '✦',  bg: 'aurora',   overlay: 'rgba(0,2,8,0.5)'     },
  { id: 'campfire', label: 'Campfire',  icon: '🔥', bg: 'campfire', overlay: 'rgba(4,1,0,0.5)'     },
  { id: 'meadow',   label: 'Meadow',    icon: '🌿', bg: 'meadow',   overlay: 'rgba(0,5,2,0.6)'     },
  { id: 'cosmos',   label: 'Space',     icon: '✦',  bg: 'cosmos',   overlay: 'rgba(0,0,4,0.5)'     },
  { id: 'storm',    label: 'Storm',     icon: '⚡', bg: 'storm',    overlay: 'rgba(2,3,8,0.65)'    },
  { id: 'library',  label: 'Library',   icon: '📚', bg: 'library',  overlay: 'rgba(4,2,0,0.6)'     },
]

/* ─── Ambient sounds ──────────────────────────────────────────── */
const AMBIENTS = [
  { id: 'none',        label: 'Off',          emoji: '○'  },
  { id: 'rain',        label: 'Rainfall',      emoji: '🌧' },
  { id: 'ocean',       label: 'Ocean waves',   emoji: '🌊' },
  { id: 'forest',      label: 'Forest birds',  emoji: '🌿' },
  { id: 'whitenoise',  label: 'White noise',   emoji: '〰' },
  { id: 'brownnoise',  label: 'Brown noise',   emoji: '🟤' },
  { id: 'cafe',        label: 'Coffee shop',   emoji: '☕' },
  { id: 'fireplace',   label: 'Fireplace',     emoji: '🔥' },
  { id: 'lofi',        label: 'Lo-fi beats',   emoji: '🎵' },
]

/* ─── Music playlists ─────────────────────────────────────────── */
const PLAYLISTS = [
  { id: 'lofi',       label: 'Lo-fi Hip Hop',   sub: 'Relaxed beats',       vid: 'jfKfPfyJRdk', thumb: '🎵' },
  { id: 'classical',  label: 'Classical',        sub: 'Focus & calm',        vid: 'mDDP91JGJl4', thumb: '🎻' },
  { id: 'rain',       label: 'Rain Sounds',      sub: 'Sleep & focus',       vid: 'q76bMs-NwRk', thumb: '🌧' },
  { id: 'jazz',       label: 'Jazz',             sub: 'Smooth & warm',       vid: 'DSGyEsJ17cI', thumb: '🎷' },
  { id: 'piano',      label: 'Solo Piano',       sub: 'Pure focus',          vid: 'UF9uh7MNqkY', thumb: '🎹' },
  { id: 'ambient',    label: 'Ambient',          sub: 'Atmospheric',         vid: 'HGl75kurxok', thumb: '🌌' },
  { id: 'brownnoise', label: 'Brown Noise',      sub: 'Deep concentration',  vid: 'RqzGzwTY-6w', thumb: '🟤' },
  { id: 'nature',     label: 'Nature Sounds',    sub: 'Outdoors',            vid: 'eKFTSSKCzWA', thumb: '🍃' },
]

/* ─── Alert tones ─────────────────────────────────────────────── */
const ALERTS = [
  { id: 'tibetan',  label: 'Tibetan Bowl' },
  { id: 'bell',     label: 'School Bell'  },
  { id: 'chime',    label: 'Wind Chime'  },
  { id: 'digital',  label: 'Digital'     },
  { id: 'gentle',   label: 'Soft Pulse'  },
]

/* ─── CSS scenes (injected once) ─────────────────────────────── */
const SCENE_CSS = `
.scn { position:absolute; inset:0; z-index:0; }
/* Forest */
.bg-forest { background: radial-gradient(ellipse at 40% 20%, #0a2010 0%, #051008 50%, #020804 100%); }
.bg-forest .moon { position:absolute; top:8%; right:12%; width:55px; height:55px; border-radius:50%; background: radial-gradient(circle, #fffbe8 60%, #f0d060 100%); box-shadow:0 0 30px 10px rgba(255,240,100,0.25); animation:moonGlow 5s ease-in-out infinite; }
.bg-forest .treeline { position:absolute; bottom:0; left:0; right:0; height:40%; background: linear-gradient(180deg, transparent 0%, #030d05 40%, #020a03 100%); clip-path: polygon(0%100%,4%70%,8%80%,12%55%,16%72%,20%50%,25%65%,30%48%,35%62%,40%45%,44%60%,48%42%,52%58%,56%44%,60%60%,64%46%,68%62%,72%48%,77%65%,82%50%,87%68%,92%54%,96%72%,100%60%,100%100%); }
.leaf { position:absolute; border-radius:50% 0 50% 0; animation:leafFall linear infinite; }
@keyframes leafFall { 0%{opacity:0;transform:translate(0,-20px) rotate(0deg)} 10%{opacity:.7} 90%{opacity:.3} 100%{opacity:0;transform:translate(60px,110vh) rotate(720deg)} }
@keyframes moonGlow { 0%,100%{box-shadow:0 0 30px 10px rgba(255,240,100,0.25)} 50%{box-shadow:0 0 45px 16px rgba(255,240,100,0.4)} }

/* Rain */
.bg-rain { background: linear-gradient(165deg, #0c1624 0%, #08101e 50%, #040c18 100%); }
.bg-rain::before { content:''; position:absolute; top:0; left:0; right:0; height:35%; background: radial-gradient(ellipse at 50% 0%, rgba(20,40,80,0.6) 0%, transparent 80%); animation:cloudPulse 7s ease-in-out infinite; }
.rain-drop { position:absolute; width:1px; background:linear-gradient(180deg,transparent,rgba(140,190,255,0.65)); animation:dropFall linear infinite; }
.bg-rain .puddle { position:absolute; bottom:0; left:0; right:0; height:6px; background: linear-gradient(180deg, rgba(30,60,120,0.5), rgba(10,30,80,0.8)); }
@keyframes dropFall { 0%{opacity:0;transform:translateY(-40px)} 15%{opacity:1} 85%{opacity:.7} 100%{opacity:0;transform:translateY(110vh)} }
@keyframes cloudPulse { 0%,100%{opacity:.5} 50%{opacity:.9} }

/* Ocean */
.bg-ocean { background: linear-gradient(195deg, #071525 0%, #0b2545 35%, #071530 70%, #040e1e 100%); }
.wave { position:absolute; left:-5%; right:-5%; height:60px; border-radius:50%; opacity:.15; animation:waveSweep ease-in-out infinite; }
.bg-ocean .stars-ocean { position:absolute; inset:0; }
@keyframes waveSweep { 0%,100%{transform:translateX(0) translateY(0) scaleX(1)} 50%{transform:translateX(2%) translateY(-8px) scaleX(.98)} }

/* Sunset */
.bg-sunset { background: linear-gradient(180deg, #120318 0%, #4a0d25 15%, #8b1a0e 30%, #d4420a 48%, #f06a1a 58%, #f8b84e 68%, #fde68a 74%, #e8d06a 78%, #1a0520 85%, #0a0218 100%); }
.bg-sunset::before { content:''; position:absolute; inset:0; background: radial-gradient(ellipse at 50% 68%, rgba(255,160,30,0.45) 0%, rgba(220,70,10,0.2) 25%, transparent 55%); animation:sunPulse 6s ease-in-out infinite; }
.bg-sunset .horizon { position:absolute; bottom:26%; left:0; right:0; height:1px; background: linear-gradient(90deg,transparent,rgba(255,200,100,0.6),transparent); }
@keyframes sunPulse { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }

/* Snow */
.bg-snow { background: linear-gradient(180deg, #0c1830 0%, #152040 40%, #0a1525 100%); }
.snowflake { position:absolute; color:rgba(230,240,255,0.85); font-style:normal; animation:snowFall linear infinite; }
@keyframes snowFall { 0%{transform:translateY(-30px) translateX(0) rotate(0deg);opacity:0} 10%{opacity:.9} 90%{opacity:.6} 100%{transform:translateY(108vh) translateX(50px) rotate(360deg);opacity:0} }

/* Aurora */
.bg-aurora { background: radial-gradient(ellipse at 50% 80%, #020a12 0%, #010608 100%); }
.aurora-band { position:absolute; left:-20%; right:-20%; height:55%; border-radius:0 0 60% 60%; animation:auroraShift ease-in-out infinite; }
.aurora-1 { top:-5%; background:linear-gradient(180deg,transparent 0%,rgba(0,220,120,0.12) 30%,rgba(0,180,200,0.18) 60%,transparent 100%); animation-duration:11s; }
.aurora-2 { top:-2%; background:linear-gradient(180deg,transparent 0%,rgba(120,0,220,0.08) 40%,rgba(0,200,160,0.14) 70%,transparent 100%); animation-duration:16s; animation-direction:reverse; }
.star { position:absolute; border-radius:50%; background:#fff; animation:twinkle ease-in-out infinite; }
@keyframes auroraShift { 0%,100%{transform:translateX(0) scaleX(1) skewX(0deg);opacity:.6} 33%{transform:translateX(4%) scaleX(.96) skewX(2deg);opacity:1} 66%{transform:translateX(-4%) scaleX(1.04) skewX(-2deg);opacity:.8} }
@keyframes twinkle { 0%,100%{opacity:.15;transform:scale(1)} 50%{opacity:1;transform:scale(1.6)} }

/* Campfire */
.bg-campfire { background: radial-gradient(ellipse at 50% 100%, #1e0800 0%, #0e0400 50%, #050200 100%); }
.fire-core { position:absolute; bottom:22%; left:50%; transform:translateX(-50%); animation:fireCore .25s ease-in-out infinite alternate; }
.fire-mid  { position:absolute; bottom:24%; left:50%; transform:translateX(-50%); animation:fireMid  .4s ease-in-out infinite alternate; }
.fire-glow { position:absolute; bottom:18%; left:50%; transform:translateX(-50%); width:120px; height:80px; border-radius:50%; background:radial-gradient(ellipse,rgba(255,100,0,0.35) 0%,transparent 70%); animation:fireGlow 1.5s ease-in-out infinite alternate; filter:blur(6px); }
@keyframes fireCore { 0%{transform:translateX(-50%) scaleX(1) scaleY(1);filter:brightness(1)}  100%{transform:translateX(-50%) scaleX(.88) scaleY(1.12) skewX(3deg);filter:brightness(1.2)} }
@keyframes fireMid  { 0%{transform:translateX(-50%) scaleX(1) scaleY(1) skewX(0deg);opacity:.8} 100%{transform:translateX(-50%) scaleX(.92) scaleY(1.1) skewX(-4deg);opacity:1} }
@keyframes fireGlow { 0%{transform:translateX(-50%) scale(1);opacity:.6} 100%{transform:translateX(-50%) scale(1.2);opacity:1} }
.ember { position:absolute; width:2px; height:2px; border-radius:50%; background:#ff6000; animation:emberRise linear infinite; }
@keyframes emberRise { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(var(--ex,15px),-120px);opacity:0} }
.log { position:absolute; bottom:20%; left:50%; height:10px; border-radius:4px; background:linear-gradient(90deg,#2a0d00,#3d1500,#2a0d00); }

/* Meadow */
.bg-meadow { background: linear-gradient(180deg, #0e1f38 0%, #0a1a2e 30%, #0c2018 60%, #071408 100%); }
.firefly { position:absolute; width:3px; height:3px; border-radius:50%; background:#aaff44; filter:blur(1px); animation:fireflyDrift ease-in-out infinite; }
@keyframes fireflyDrift { 0%,100%{transform:translate(0,0);opacity:0} 20%,80%{opacity:.9} 50%{transform:translate(var(--fx,25px),var(--fy,-18px));opacity:1} }
.bg-meadow .grass { position:absolute; bottom:0; left:0; right:0; height:25%; background:linear-gradient(180deg,transparent,#071008 60%); clip-path:polygon(0%100%,2%82%,4%90%,6%78%,8%88%,10%75%,12%85%,14%72%,16%82%,18%70%,20%80%,22%74%,24%85%,26%72%,28%80%,30%76%,32%86%,34%74%,36%82%,38%70%,40%78%,42%72%,44%84%,46%76%,48%82%,50%74%,52%86%,54%76%,56%80%,58%72%,60%82%,62%74%,64%86%,66%78%,68%82%,70%74%,72%84%,74%76%,76%80%,78%72%,80%82%,82%70%,84%80%,86%74%,88%84%,90%76%,92%82%,94%72%,96%80%,98%76%,100%82%,100%100%); }

/* Cosmos */
.bg-cosmos { background: radial-gradient(ellipse at 30% 40%, #08021a 0%, #040110 50%, #020008 100%); }
.bg-cosmos::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 25% 35%, rgba(80,0,180,0.14) 0%, transparent 40%), radial-gradient(ellipse at 70% 65%, rgba(0,40,180,0.1) 0%, transparent 35%); animation:nebula 14s ease-in-out infinite; }
.shooting-star { position:absolute; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.9),transparent); animation:shoot linear infinite; }
@keyframes nebula { 0%,100%{opacity:.5} 50%{opacity:1} }
@keyframes shoot { 0%{transform:translateX(-200px) translateY(0);opacity:0;width:0} 10%{opacity:1} 30%{opacity:0;width:120px} 100%{transform:translateX(120vw) translateY(60px);opacity:0;width:0} }

/* Storm */
.bg-storm { background: linear-gradient(180deg, #080e18 0%, #0c1420 40%, #080e18 100%); }
.bg-storm::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 50% 20%, rgba(15,30,60,0.7) 0%, transparent 60%); animation:stormCloud 4s ease-in-out infinite; }
.lightning { position:absolute; top:10%; left:30%; width:2px; height:0; background:rgba(200,220,255,0.9); animation:lightningStrike ease-in-out infinite; transform-origin:top; filter:blur(.5px); }
@keyframes lightningStrike { 0%,85%,100%{height:0;opacity:0} 88%{height:30vh;opacity:.9} 92%{height:35vh;opacity:.6} 95%{height:0;opacity:0} }
@keyframes stormCloud { 0%,100%{opacity:.6} 50%{opacity:1} }

/* Library */
.bg-library { background: linear-gradient(180deg, #0e0802 0%, #1a100400%, #110c06 50%, #0a0803 100%); }
.bg-library { background: linear-gradient(180deg, #12090300%, #0e0802 0%, #1a1004 30%, #110c06 70%, #0a0803 100%); }
.bg-library::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 30% 50%, rgba(80,40,0,0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(60,30,0,0.2) 0%, transparent 45%); animation:lampGlow 5s ease-in-out infinite; }
.book-shelf { position:absolute; left:0; right:0; height:18px; background:repeating-linear-gradient(90deg,#1a0d04 0px,#1a0d04 12px,#2a1506 12px,#2a1506 20px,#120a02 20px,#120a02 30px,#1e1006 30px,#1e1006 40px); opacity:.5; }
@keyframes lampGlow { 0%,100%{opacity:.7} 50%{opacity:1} }

/* Shared ring for circular progress on dark scenes */
.scene-ring { filter: drop-shadow(0 0 18px rgba(124,58,237,0.6)); }
`

/* ─── Particle generator ──────────────────────────────────────── */
function Particles({ scene }) {
  const memo = useRef({})
  if (!memo.current[scene]) {
    const list = []
    if (scene === 'forest') {
      list.push({ type: 'div', cls: 'moon' })
      list.push({ type: 'div', cls: 'treeline' })
      for (let i = 0; i < 14; i++) list.push({ type: 'leaf', i,
        style: { left: Math.random()*100+'%', width:(8+Math.random()*10)+'px', height:(8+Math.random()*9)+'px',
          background:`hsl(${108+~~(Math.random()*30)},${50+~~(Math.random()*25)}%,${12+~~(Math.random()*10)}%)`,
          animationDuration:(9+Math.random()*11)+'s', animationDelay:(Math.random()*9)+'s' } })
    }
    if (scene === 'rain') {
      for (let i = 0; i < 70; i++) list.push({ type: 'drop', i,
        style: { left: Math.random()*100+'%', height:(12+Math.random()*22)+'px',
          animationDuration:(0.35+Math.random()*0.5)+'s', animationDelay:(Math.random()*2)+'s',
          transform:`skewX(${-8+Math.random()*4}deg)` } })
      list.push({ type: 'div', cls: 'puddle' })
    }
    if (scene === 'ocean') {
      for (let i = 0; i < 4; i++) list.push({ type: 'wave', i,
        style: { bottom:(i*14)+'%', borderTop:`1px solid rgba(40,120,200,${0.06+i*0.04})`,
          animationDuration:(4+i*1.5)+'s', animationDelay:(i*0.8)+'s' } })
      for (let i = 0; i < 60; i++) list.push({ type: 'star', i: 'o'+i,
        style: { left:Math.random()*100+'%', top:Math.random()*55+'%',
          width:(1+Math.random()*2)+'px', height:(1+Math.random()*2)+'px',
          animationDuration:(2+Math.random()*4)+'s', animationDelay:(Math.random()*4)+'s', opacity:Math.random()*.7+.2 } })
    }
    if (scene === 'snow') {
      for (let i = 0; i < 45; i++) list.push({ type: 'snowflake', i,
        style: { left:Math.random()*100+'%', fontSize:(8+Math.random()*13)+'px',
          animationDuration:(7+Math.random()*10)+'s', animationDelay:(Math.random()*9)+'s' } })
    }
    if (scene === 'aurora' || scene === 'cosmos') {
      const count = scene === 'cosmos' ? 150 : 70
      for (let i = 0; i < count; i++) list.push({ type: 'star', i,
        style: { left:Math.random()*100+'%', top:Math.random()*(scene==='cosmos'?100:75)+'%',
          width:(1+Math.random()*2.5)+'px', height:(1+Math.random()*2.5)+'px',
          animationDuration:(2+Math.random()*5)+'s', animationDelay:(Math.random()*5)+'s', opacity:Math.random()*.8+.2 } })
      if (scene === 'aurora') {
        list.push({ type: 'div', cls: 'aurora-band aurora-1' })
        list.push({ type: 'div', cls: 'aurora-band aurora-2' })
      }
      if (scene === 'cosmos') {
        for (let i = 0; i < 4; i++) list.push({ type: 'shooting', i,
          style: { top:(10+Math.random()*40)+'%', left:(Math.random()*30)+'%',
            animationDuration:(3+Math.random()*5)+'s', animationDelay:(i*4+Math.random()*6)+'s',
            transform:`rotate(${-20+Math.random()*10}deg)` } })
      }
    }
    if (scene === 'campfire') {
      list.push({ type: 'div', cls: 'fire-glow' })
      list.push({ type: 'svg', sub: 'mid' })
      list.push({ type: 'svg', sub: 'core' })
      list.push({ type: 'div', cls: 'log', style: { width:'70px', transform:'translateX(-50%) rotate(-8deg)', bottom:'20%' } })
      list.push({ type: 'div', cls: 'log', style: { width:'55px', transform:'translateX(-40%) rotate(10deg)', bottom:'19%' } })
      for (let i = 0; i < 18; i++) list.push({ type: 'ember', i,
        style: { bottom:'24%', left:(47+Math.random()*6)+'%',
          '--ex':(Math.random()*40-20)+'px',
          animationDuration:(1+Math.random()*2)+'s', animationDelay:(Math.random()*2.5)+'s' } })
    }
    if (scene === 'meadow') {
      list.push({ type: 'div', cls: 'grass' })
      for (let i = 0; i < 22; i++) list.push({ type: 'firefly', i,
        style: { left:(8+Math.random()*84)+'%', top:(25+Math.random()*55)+'%',
          '--fx':(Math.random()*50-25)+'px', '--fy':(Math.random()*35-18)+'px',
          animationDuration:(3+Math.random()*6)+'s', animationDelay:(Math.random()*6)+'s' } })
    }
    if (scene === 'storm') {
      for (let i = 0; i < 55; i++) list.push({ type: 'drop', i,
        style: { left:Math.random()*100+'%', height:(15+Math.random()*25)+'px',
          animationDuration:(0.3+Math.random()*0.4)+'s', animationDelay:(Math.random()*1.5)+'s',
          transform:'skewX(-12deg)', opacity:.8 } })
      list.push({ type: 'div', cls: 'lightning', style: { left:(20+Math.random()*60)+'%', animationDuration:'6s', animationDelay:'2s' } })
      list.push({ type: 'div', cls: 'lightning', style: { left:(30+Math.random()*40)+'%', animationDuration:'9s', animationDelay:'5s', height:0 } })
    }
    if (scene === 'library') {
      for (let i = 0; i < 5; i++) list.push({ type: 'div', cls: 'book-shelf',
        style: { top:(15+i*18)+'%' } })
    }
    memo.current[scene] = list
  }
  return memo.current[scene].map((p, idx) => {
    const k = p.i ?? p.cls ?? p.sub ?? idx
    if (p.type === 'leaf')       return <div key={k} className="leaf" style={p.style} />
    if (p.type === 'drop')       return <div key={k} className="rain-drop" style={p.style} />
    if (p.type === 'wave')       return <div key={k} className="wave" style={p.style} />
    if (p.type === 'star')       return <div key={k} className="star" style={p.style} />
    if (p.type === 'snowflake')  return <div key={k} className="snowflake" style={p.style}>❄</div>
    if (p.type === 'ember')      return <div key={k} className="ember" style={p.style} />
    if (p.type === 'firefly')    return <div key={k} className="firefly" style={p.style} />
    if (p.type === 'shooting')   return <div key={k} className="shooting-star" style={p.style} />
    if (p.type === 'div')        return <div key={k} className={p.cls} style={p.style} />
    if (p.type === 'svg' && p.sub === 'core') return (
      <div key="fire-core" className="fire-core">
        <svg width="36" height="60" viewBox="0 0 36 60">
          <ellipse cx="18" cy="42" rx="14" ry="18" fill="rgba(255,80,0,0.9)" />
          <ellipse cx="18" cy="32" rx="9"  ry="24" fill="rgba(255,160,20,0.95)" />
          <ellipse cx="18" cy="22" rx="5"  ry="16" fill="rgba(255,220,80,0.9)" />
        </svg>
      </div>
    )
    if (p.type === 'svg' && p.sub === 'mid') return (
      <div key="fire-mid" className="fire-mid">
        <svg width="60" height="80" viewBox="0 0 60 80" style={{opacity:.7}}>
          <ellipse cx="30" cy="60" rx="26" ry="22" fill="rgba(200,60,0,0.8)" />
          <ellipse cx="30" cy="45" rx="18" ry="32" fill="rgba(240,120,10,0.75)" />
          <ellipse cx="30" cy="30" rx="10" ry="24" fill="rgba(255,190,40,0.7)" />
        </svg>
      </div>
    )
    return null
  })
}

/* ─── Alert sound engine ─────────────────────────────────────── */
function playAlert(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (type === 'tibetan') {
      // Rich harmonic bowl
      [0, 0.4, 0.85].forEach((delay, i) => {
        const f = [220, 329.6, 440][i]
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.type = 'sine'; o.frequency.value = f
        g.gain.setValueAtTime(0, ctx.currentTime + delay)
        g.gain.linearRampToValueAtTime(0.28, ctx.currentTime + delay + 0.06)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 3.5)
        o.connect(g); g.connect(ctx.destination)
        o.start(ctx.currentTime + delay); o.stop(ctx.currentTime + delay + 3.6)
        // Harmonics
        const o2 = ctx.createOscillator(), g2 = ctx.createGain()
        o2.type = 'sine'; o2.frequency.value = f * 2.756
        g2.gain.setValueAtTime(0, ctx.currentTime + delay)
        g2.gain.linearRampToValueAtTime(0.08, ctx.currentTime + delay + 0.04)
        g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 2.5)
        o2.connect(g2); g2.connect(ctx.destination)
        o2.start(ctx.currentTime + delay); o2.stop(ctx.currentTime + delay + 2.6)
      })
    } else if (type === 'bell') {
      [0, 0.55, 1.1].forEach((delay, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.type = 'sine'; o.frequency.value = 880 * Math.pow(1.26, i)
        g.gain.setValueAtTime(0.35, ctx.currentTime + delay)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 1.8)
        o.connect(g); g.connect(ctx.destination)
        o.start(ctx.currentTime + delay); o.stop(ctx.currentTime + delay + 2)
      })
    } else if (type === 'chime') {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.type = 'sine'; o.frequency.value = f
        g.gain.setValueAtTime(0, ctx.currentTime + i*0.18)
        g.gain.linearRampToValueAtTime(0.22, ctx.currentTime + i*0.18 + 0.04)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i*0.18 + 1.6)
        o.connect(g); g.connect(ctx.destination)
        o.start(ctx.currentTime + i*0.18); o.stop(ctx.currentTime + i*0.18 + 1.8)
      })
    } else if (type === 'digital') {
      [0, 0.22, 0.44].forEach(delay => {
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.type = 'square'; o.frequency.value = 880
        g.gain.setValueAtTime(0.15, ctx.currentTime + delay)
        g.gain.setValueAtTime(0, ctx.currentTime + delay + 0.14)
        o.connect(g); g.connect(ctx.destination)
        o.start(ctx.currentTime + delay); o.stop(ctx.currentTime + delay + 0.15)
      })
    } else if (type === 'gentle') {
      [0, 0.6, 1.2].forEach((delay, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.type = 'sine'; o.frequency.value = 528 + i * 66
        g.gain.setValueAtTime(0, ctx.currentTime + delay)
        g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + delay + 0.15)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 2.2)
        o.connect(g); g.connect(ctx.destination)
        o.start(ctx.currentTime + delay); o.stop(ctx.currentTime + delay + 2.4)
      })
    }
  } catch(e) {}
}

/* ─── Main Timer component ───────────────────────────────────── */
export default function Timer() {
  const timer = useTimer()
  const { user } = useAuth()

  const [tab,       setTab]       = useState('countdown')
  const [scene,     setScene]     = useState('none')
  const [ambient,   setAmbient]   = useState('none')
  const [volume,    setVolume]    = useState(0.6)
  const [alertType, setAlertType] = useState('tibetan')
  const [playlist,  setPlaylist]  = useState(null)
  const [panel,     setPanel]     = useState(null)
  const [fullscreen,setFullscreen]= useState(false)

  // Exact time input
  const [inputH, setInputH] = useState('')
  const [inputM, setInputM] = useState('25')
  const [inputS, setInputS] = useState('')

  // Alarm
  const [alarmTime,setAlarmTime] = useState('')
  const [alarmMins,setAlarmMins] = useState('')

  const containerRef = useRef(null)
  const alertLoopRef = useRef(null)
  const prevSignal   = useRef(timer.timerFinishedSignal)

  const sc = SCENES.find(s => s.id === scene) || SCENES[0]
  const onScene = scene !== 'none'

  // ── Ambient sound with volume ──────────────────────────────────
  useEffect(() => {
    if (timer.cdRunning && ambient !== 'none') {
      startSound(ambient, volume)
    } else stopSound()
    return () => stopSound()
  }, [ambient, timer.cdRunning, volume])

  // ── Timer finish ───────────────────────────────────────────────
  useEffect(() => {
    if (timer.timerFinishedSignal === prevSignal.current) return
    prevSignal.current = timer.timerFinishedSignal
    stopSound()
    playAlert(alertType)
    alertLoopRef.current = setInterval(() => playAlert(alertType), 3500)
    if (timer.musicAutoStop) setPlaylist(null)
    if (user && timer.cdTotal > 0) {
      awardTimerXP(user.uid, Math.floor(timer.cdTotal / 60)).catch(() => {})
      recordActivityStreak(user.uid).catch(() => {})
    }
  }, [timer.timerFinishedSignal])

  function dismissAlert() {
    clearInterval(alertLoopRef.current)
    timer.cdReset()
    stopSound()
  }

  useEffect(() => () => clearInterval(alertLoopRef.current), [])

  // ── Fullscreen ─────────────────────────────────────────────────
  function toggleFs() {
    if (!document.fullscreenElement) { containerRef.current?.requestFullscreen(); setFullscreen(true) }
    else { document.exitFullscreen(); setFullscreen(false) }
  }
  useEffect(() => {
    const h = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  // ── Set exact time ─────────────────────────────────────────────
  function applyExactTime() {
    const h = parseInt(inputH)||0, m = parseInt(inputM)||0, s = parseInt(inputS)||0
    const total = h*3600 + m*60 + s
    if (total > 0) timer.cdSetPreset(total)
  }

  // ── Adjust ────────────────────────────────────────────────────
  function adjust(delta) {
    const next = Math.max(0, timer.cdRemaining + delta)
    const wasRunning = timer.cdRunning
    if (wasRunning) timer.cdPause()
    setTimeout(() => {
      timer.cdSetPreset(next)
      if (wasRunning) timer.cdStart()
    }, 0)
  }

  // ── Derived display ────────────────────────────────────────────
  const pct    = timer.cdTotal > 0 ? timer.cdRemaining / timer.cdTotal : 0
  const circum = 2 * Math.PI * 100
  const w      = 240  // ring SVG size
  const cx     = w / 2

  const col  = (light) => light ? 'rgba(255,255,255,0.9)' : 'var(--text-primary)'
  const muted= (light) => light ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)'
  const textC = onScene ? col(true) : col(false)
  const mutedC= onScene ? muted(true) : muted(false)

  const glass = (opacity=0.5) => ({
    background: onScene ? `rgba(0,0,0,${opacity})` : 'var(--bg-surface)',
    backdropFilter: onScene ? 'blur(18px) saturate(180%)' : 'none',
    border: onScene ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--border)',
  })

  const chip = (active) => ({
    padding: '5px 13px', borderRadius: 20, border: 'none', cursor: 'pointer',
    fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.18s',
    background: active
      ? 'var(--accent)'
      : onScene ? 'rgba(255,255,255,0.1)' : 'var(--bg-card)',
    color: active ? 'white' : textC,
    backdropFilter: onScene ? 'blur(8px)' : 'none',
  })

  return (
    <>
      <style>{SCENE_CSS}</style>
      <div ref={containerRef}
        className={onScene ? `scn bg-${sc.bg}` : ''}
        style={{
          minHeight: '100dvh', position: 'relative', overflow: 'hidden',
          background: onScene ? undefined : 'var(--bg-base)',
          borderRadius: fullscreen ? 0 : 'var(--radius-lg)',
        }}
      >
        {/* Particles */}
        {onScene && (
          <div style={{ position:'absolute',inset:0,zIndex:1,pointerEvents:'none',overflow:'hidden' }}>
            <Particles scene={scene} />
          </div>
        )}
        {/* Overlay */}
        {onScene && <div style={{ position:'absolute',inset:0,zIndex:2,background:sc.overlay,backdropFilter:'blur(0.5px)' }} />}

        {/* ── Content ── */}
        <div style={{ position:'relative',zIndex:3,display:'flex',flexDirection:'column',minHeight:'100dvh' }}>

          {/* Top bar */}
          <div style={{ ...glass(0.55), padding:'0.7rem 1rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontWeight:800, fontSize:'1rem', color:textC, letterSpacing:'-0.01em' }}>⏱ Timer</span>
              {onScene && <span style={{ fontSize:'0.72rem', color:mutedC, padding:'2px 8px', borderRadius:12, background:'rgba(255,255,255,0.1)' }}>{sc.icon} {sc.label}</span>}
            </div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap', alignItems:'center' }}>
              {[
                { id:'scene',  label:'🎨 Scene'  },
                { id:'sounds', label:'🎶 Sound'  },
                { id:'music',  label:'🎵 Music'  },
              ].map(p => (
                <button key={p.id} onClick={() => setPanel(panel === p.id ? null : p.id)} style={chip(panel === p.id)}>
                  {p.label}
                </button>
              ))}
              <button onClick={toggleFs} style={{ ...chip(false), padding:'5px 8px' }}>
                {fullscreen ? '⊠' : '⛶'}
              </button>
            </div>
          </div>

          {/* Panels */}
          {panel === 'scene' && (
            <div style={{ ...glass(0.62), padding:'1rem 1.1rem', borderTop:'none' }}>
              <div style={{ fontSize:'0.7rem', fontWeight:700, color:mutedC, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Animated background</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {SCENES.map(s => (
                  <button key={s.id} onClick={() => setScene(s.id)} style={chip(scene === s.id)}>
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {panel === 'sounds' && (
            <div style={{ ...glass(0.62), padding:'1rem 1.1rem', borderTop:'none' }}>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:'0.7rem', fontWeight:700, color:mutedC, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Ambient (plays while timer runs)</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
                  {AMBIENTS.map(a => (
                    <button key={a.id} onClick={() => setAmbient(a.id)} style={chip(ambient === a.id)}>
                      {a.emoji} {a.label}
                    </button>
                  ))}
                </div>
                {ambient !== 'none' && (
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:'0.75rem', color:mutedC }}>Volume</span>
                    <input type="range" min="0" max="1" step="0.05" value={volume}
                      onChange={e => setVolume(parseFloat(e.target.value))}
                      style={{ flex:1, maxWidth:160, accentColor:'var(--accent)' }} />
                    <span style={{ fontSize:'0.75rem', color:mutedC, minWidth:30 }}>{Math.round(volume*100)}%</span>
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize:'0.7rem', fontWeight:700, color:mutedC, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Alert tone (plays when timer ends)</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                  {ALERTS.map(a => (
                    <button key={a.id} onClick={() => setAlertType(a.id)} style={chip(alertType === a.id)}>
                      {a.label}
                    </button>
                  ))}
                  <button onClick={() => playAlert(alertType)} style={{ ...chip(false), fontSize:'0.75rem' }}>
                    ▶ Test
                  </button>
                </div>
              </div>
            </div>
          )}

          {panel === 'music' && (
            <div style={{ ...glass(0.62), padding:'1rem 1.1rem', borderTop:'none' }}>
              <label style={{ display:'flex', alignItems:'center', gap:8, color:mutedC, fontSize:'0.82rem', marginBottom:12, cursor:'pointer' }}>
                <input type="checkbox" checked={timer.musicAutoStop||false} onChange={e => timer.setMusicAutoStop(e.target.checked)} style={{ accentColor:'var(--accent)' }} />
                Stop music when timer ends
              </label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:6, marginBottom:12 }}>
                {PLAYLISTS.map(p => (
                  <button key={p.id} onClick={() => setPlaylist(playlist?.id === p.id ? null : p)}
                    style={{ ...chip(playlist?.id === p.id), textAlign:'left', padding:'8px 12px', borderRadius:10, display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:'1.2rem' }}>{p.thumb}</span>
                    <div>
                      <div style={{ fontSize:'0.8rem', fontWeight:700, lineHeight:1.2 }}>{p.label}</div>
                      <div style={{ fontSize:'0.68rem', opacity:0.7, lineHeight:1.2 }}>{p.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
              {playlist && (
                <div style={{ borderRadius:10, overflow:'hidden', border:`1px solid ${onScene?'rgba(255,255,255,0.1)':'var(--border)'}` }}>
                  <iframe key={playlist.id} width="100%" height="90"
                    src={`https://www.youtube.com/embed/${playlist.vid}?autoplay=1&controls=1`}
                    allow="autoplay; encrypted-media" style={{ border:'none', display:'block' }} />
                </div>
              )}
            </div>
          )}

          {/* ── Tab bar ── */}
          <div style={{ ...glass(0.45), padding:'0.5rem 1rem', borderTop:'none', display:'flex', gap:4 }}>
            {['countdown','stopwatch','alarm'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding:'6px 16px', border:'none', cursor:'pointer', borderRadius:8,
                fontWeight:600, fontSize:'0.85rem', textTransform:'capitalize', transition:'all 0.18s',
                background: tab===t ? 'var(--accent)' : 'transparent',
                color: tab===t ? 'white' : mutedC,
              }}>{t}</button>
            ))}
          </div>

          {/* ── Main content ── */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'1.5rem 1rem', gap:'1.5rem' }}>

            {/* ════ COUNTDOWN ════ */}
            {tab === 'countdown' && (<>

              {/* Ring */}
              <div style={{ position:'relative' }}>
                <svg width={w} height={w} className={onScene ? 'scene-ring' : ''} style={{ transform:'rotate(-90deg)' }}>
                  <circle cx={cx} cy={cx} r={100} fill="none"
                    stroke={onScene ? 'rgba(255,255,255,0.07)' : 'var(--bg-hover)'} strokeWidth={12} />
                  <circle cx={cx} cy={cx} r={100} fill="none"
                    stroke={timer.cdFinished ? 'var(--danger)' : 'var(--accent)'}
                    strokeWidth={12} strokeLinecap="round"
                    strokeDasharray={circum}
                    strokeDashoffset={circum * (1 - pct)}
                    style={{ transition:'stroke-dashoffset 1s linear, stroke 0.4s' }}
                  />
                  {/* Tick marks */}
                  {Array.from({length:60},(_,i) => {
                    const angle = (i/60)*2*Math.PI - Math.PI/2
                    const r1 = i%5===0 ? 88 : 92, r2 = 98
                    return <line key={i}
                      x1={cx+r1*Math.cos(angle)} y1={cx+r1*Math.sin(angle)}
                      x2={cx+r2*Math.cos(angle)} y2={cx+r2*Math.sin(angle)}
                      stroke={onScene?'rgba(255,255,255,0.18)':'rgba(124,58,237,0.2)'}
                      strokeWidth={i%5===0?2:1}
                    />
                  })}
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4 }}>
                  {timer.cdFinished ? (
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:'1.5rem', fontWeight:800, color:'var(--danger)', marginBottom:8 }}>Done!</div>
                      <button onClick={dismissAlert}
                        style={{ padding:'8px 20px', borderRadius:20, border:'none', cursor:'pointer',
                          background:'var(--danger)', color:'white', fontWeight:700, fontSize:'0.85rem' }}>
                        ✓ Dismiss
                      </button>
                    </div>
                  ) : (
                    <>
                      <span style={{ fontSize:'2.8rem', fontWeight:800, color:textC, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.03em', lineHeight:1 }}>
                        {fmt(timer.cdRemaining)}
                      </span>
                      {timer.cdTotal > 0 && (
                        <span style={{ fontSize:'0.72rem', color:mutedC }}>
                          of {fmt(timer.cdTotal)}
                        </span>
                      )}
                      {ambient !== 'none' && timer.cdRunning && (
                        <span style={{ fontSize:'0.68rem', color:mutedC, marginTop:2 }}>
                          {AMBIENTS.find(a=>a.id===ambient)?.emoji} playing
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* ±30s / ±5m adjust buttons */}
              <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap', justifyContent:'center' }}>
                {[[-300,'-5m'],[-30,'-30s'],[30,'+30s'],[300,'+5m']].map(([d,l]) => (
                  <button key={l} onClick={() => adjust(d)} style={{
                    padding:'6px 13px', borderRadius:20, border:`1px solid ${onScene?'rgba(255,255,255,0.15)':'var(--border)'}`,
                    background:'transparent', color:textC, fontSize:'0.8rem', fontWeight:600, cursor:'pointer',
                    transition:'all 0.15s',
                  }}>{l}</button>
                ))}
              </div>

              {/* Preset chips */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, justifyContent:'center', maxWidth:420 }}>
                {[[5,'5m'],[10,'10m'],[15,'15m'],[20,'20m'],[25,'25m'],[30,'30m'],[45,'45m'],[60,'60m'],[90,'90m']].map(([mins,label]) => (
                  <button key={mins} onClick={() => timer.cdSetPreset(mins*60)} style={chip(timer.cdTotal===mins*60 && !timer.cdRunning)}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Exact time input */}
              <div style={{ display:'flex', alignItems:'center', gap:6, ...glass(0.4), padding:'8px 14px', borderRadius:12 }}>
                <span style={{ fontSize:'0.75rem', color:mutedC, marginRight:4 }}>Set exact:</span>
                {[['h',inputH,setInputH,2,'hh'],['m',inputM,setInputM,2,'mm'],['s',inputS,setInputS,2,'ss']].map(([unit,val,setter,w,ph],i) => (
                  <div key={unit} style={{ display:'flex', alignItems:'center', gap:i>0?4:0 }}>
                    {i>0 && <span style={{ color:mutedC, fontSize:'0.9rem' }}>:</span>}
                    <input value={val} onChange={e=>setter(e.target.value)} placeholder={ph}
                      style={{ width:38, padding:'4px 6px', borderRadius:6, border:`1px solid ${onScene?'rgba(255,255,255,0.15)':'var(--border)'}`,
                        background: onScene?'rgba(0,0,0,0.3)':'var(--bg-input)', color:textC, fontSize:'0.85rem',
                        textAlign:'center', outline:'none' }}
                      maxLength={2} />
                  </div>
                ))}
                <button onClick={applyExactTime} style={{ ...chip(false), padding:'5px 10px', marginLeft:4 }}>Set</button>
              </div>

              {/* Controls */}
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                {!timer.cdRunning ? (
                  <button onClick={timer.cdStart} style={playBtn(onScene)}>▶ Start</button>
                ) : (
                  <button onClick={timer.cdPause} style={playBtn(onScene, '#e67e22')}>⏸ Pause</button>
                )}
                <button onClick={() => { timer.cdReset(); stopSound(); clearInterval(alertLoopRef.current) }}
                  style={{ ...chip(false), padding:'10px 20px', fontSize:'0.9rem' }}>↺ Reset</button>
              </div>
            </>)}

            {/* ════ STOPWATCH ════ */}
            {tab === 'stopwatch' && (<>
              <div style={{ fontSize:'4rem', fontWeight:800, color:textC, fontVariantNumeric:'tabular-nums',
                letterSpacing:'-0.04em', textShadow: onScene?'0 2px 24px rgba(0,0,0,0.5)':'none', lineHeight:1 }}>
                {fmt(timer.swElapsed)}
              </div>
              {timer.swLaps?.length > 0 && (
                <div style={{ fontSize:'1.1rem', fontWeight:600, color:mutedC }}>
                  Lap {timer.swLaps.length+1} · {fmt(timer.swElapsed - (timer.swLaps[timer.swLaps.length-1]||0))}
                </div>
              )}
              <div style={{ display:'flex', gap:10 }}>
                {!timer.swRunning ? (
                  <button onClick={timer.swStart} style={playBtn(onScene)}>▶ Start</button>
                ) : (<>
                  <button onClick={timer.swPause} style={playBtn(onScene,'#e67e22')}>⏸ Pause</button>
                  <button onClick={timer.swLap} style={playBtn(onScene,'#1a5276')}>🏁 Lap</button>
                </>)}
                <button onClick={timer.swReset} style={{ ...chip(false), padding:'10px 18px', fontSize:'0.9rem' }}>↺</button>
              </div>
              {timer.swLaps?.length > 0 && (
                <div style={{ width:'100%', maxWidth:320, maxHeight:200, overflowY:'auto' }}>
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    {[...timer.swLaps].reverse().map((lap,i) => {
                      const lapNum = timer.swLaps.length - i
                      const lapTime = lap - (timer.swLaps[lapNum-2]||0)
                      const best = Math.min(...timer.swLaps.map((l,j)=>l-(timer.swLaps[j-1]||0)))
                      return (
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                          padding:'7px 14px', borderRadius:8, ...glass(0.35) }}>
                          <span style={{ fontSize:'0.8rem', color:mutedC }}>Lap {lapNum}</span>
                          <span style={{ fontSize:'0.8rem', fontWeight:700, color: lapTime===best?'var(--success)':textC, fontVariantNumeric:'tabular-nums' }}>
                            {fmt(lapTime)}
                          </span>
                          <span style={{ fontSize:'0.75rem', color:mutedC, fontVariantNumeric:'tabular-nums' }}>{fmt(lap)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>)}

            {/* ════ ALARM ════ */}
            {tab === 'alarm' && (<>
              {timer.alarmFired && (
                <div style={{ padding:'1.25rem 2rem', background:'rgba(239,68,68,0.18)', border:'1px solid var(--danger)',
                  borderRadius:14, textAlign:'center' }}>
                  <div style={{ fontSize:'1.8rem', marginBottom:8 }}>⏰</div>
                  <div style={{ fontWeight:800, fontSize:'1.2rem', color:'var(--danger)', marginBottom:12 }}>Alarm!</div>
                  <button onClick={timer.clearAlarm}
                    style={{ padding:'8px 24px', borderRadius:20, border:'none', cursor:'pointer',
                      background:'var(--danger)', color:'white', fontWeight:700 }}>
                    Dismiss
                  </button>
                </div>
              )}
              {timer.alarmTarget && !timer.alarmFired && (
                <div style={{ ...glass(0.4), padding:'10px 18px', borderRadius:12, display:'flex', alignItems:'center', gap:12, color:textC }}>
                  <span style={{ fontSize:'1.1rem' }}>⏰</span>
                  <span style={{ fontWeight:600 }}>{timer.alarmTarget.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                  <button onClick={timer.clearAlarm} style={{ ...chip(false), padding:'4px 10px', fontSize:'0.75rem' }}>Clear</button>
                </div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:12, width:'100%', maxWidth:340 }}>
                <div style={{ ...glass(0.42), borderRadius:14, padding:'1.1rem' }}>
                  <div style={{ fontWeight:700, color:textC, marginBottom:10, fontSize:'0.9rem' }}>⏰ Set clock time</div>
                  <div style={{ display:'flex', gap:8 }}>
                    <input type="time" value={alarmTime} onChange={e=>setAlarmTime(e.target.value)}
                      style={{ flex:1, padding:'9px 12px', borderRadius:8,
                        border:`1px solid ${onScene?'rgba(255,255,255,0.15)':'var(--border)'}`,
                        background:onScene?'rgba(0,0,0,0.3)':'var(--bg-input)',
                        color:textC, fontSize:'1rem', outline:'none' }} />
                    <button onClick={() => {
                      if (!alarmTime) return
                      const [h,m]=alarmTime.split(':').map(Number)
                      const t=new Date(); t.setHours(h,m,0,0)
                      if (t<new Date()) t.setDate(t.getDate()+1)
                      timer.setAlarm(t)
                    }} style={playBtn(onScene)}>Set</button>
                  </div>
                </div>
                <div style={{ ...glass(0.42), borderRadius:14, padding:'1.1rem' }}>
                  <div style={{ fontWeight:700, color:textC, marginBottom:10, fontSize:'0.9rem' }}>⏱ Countdown alarm</div>
                  <div style={{ display:'flex', gap:8 }}>
                    <input type="number" placeholder="Minutes" value={alarmMins} onChange={e=>setAlarmMins(e.target.value)} min="1"
                      style={{ flex:1, padding:'9px 12px', borderRadius:8,
                        border:`1px solid ${onScene?'rgba(255,255,255,0.15)':'var(--border)'}`,
                        background:onScene?'rgba(0,0,0,0.3)':'var(--bg-input)',
                        color:textC, fontSize:'1rem', outline:'none' }} />
                    <button onClick={() => { const m=parseInt(alarmMins); if(m>0) timer.setAlarm(new Date(Date.now()+m*60000)) }}
                      style={playBtn(onScene)}>Set</button>
                  </div>
                </div>
              </div>
            </>)}

          </div>{/* end main content */}
        </div>{/* end content wrapper */}
      </div>
    </>
  )
}

function playBtn(onScene, bg='var(--accent)') {
  return {
    padding:'11px 28px', borderRadius:24, border:'none', cursor:'pointer',
    fontWeight:700, fontSize:'0.95rem', color:'white',
    background:bg, boxShadow:`0 4px 18px ${bg==='var(--accent)'?'rgba(124,58,237,0.45)':'rgba(0,0,0,0.3)'}`,
    transition:'all 0.18s',
  }
}
