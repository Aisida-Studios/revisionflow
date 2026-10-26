// src/pages/Timer.jsx — Focus timer: countdown, stopwatch and alarm.
// Styled with the shared design system (globals.css tokens + Timer.css) so it matches the rest of
// the app; the animated backgrounds are painted inside the timer card's stage rather than across
// the whole page. The live clock is mirrored into the browser tab by TimerContext.
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Bell, ChevronRight, Clock, Image as ImageIcon, Lightbulb, Maximize2, Minimize2,
  Music, Pause, Play, RotateCcw, SlidersHorizontal, Timer as TimerIcon, Volume2, Flag,
} from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useTimer } from '../context/TimerContext'
import { startSound, stopSound, setVolume as setSoundVolume } from '../utils/timerSounds'
import { awardTimerXP, recordActivityStreak } from '../utils/firestore'
import { useAuth } from '../context/AuthContext'
import './Timer.css'

/* ─── Formatting ─────────────────────────────────────────────── */
function fmt(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  if (h > 0) return `${h}:${pad(m)}:${pad(sec)}`
  return `${pad(m)}:${pad(sec)}`
}
function pad(n) { return String(n).padStart(2, '0') }

/* ─── Scenes ─────────────────────────────────────────────────── */
const SCENES = [
  { id: 'none',     label: 'None',      bg: '',  overlay: '' },
  { id: 'forest',   label: 'Forest',    bg: 'forest',   overlay: 'rgba(0,8,2,0.55)'    },
  { id: 'rain',     label: 'Rain',      bg: 'rain',     overlay: 'rgba(2,5,15,0.6)'    },
  { id: 'ocean',    label: 'Ocean',     bg: 'ocean',    overlay: 'rgba(0,6,20,0.55)'   },
  { id: 'sunset',   label: 'Sunset',    bg: 'sunset',   overlay: 'rgba(8,0,5,0.45)'    },
  { id: 'snow',     label: 'Snow',      bg: 'snow',     overlay: 'rgba(2,4,15,0.6)'    },
  { id: 'aurora',   label: 'Aurora',    bg: 'aurora',   overlay: 'rgba(0,2,8,0.5)'     },
  { id: 'campfire', label: 'Campfire',  bg: 'campfire', overlay: 'rgba(4,1,0,0.5)'     },
  { id: 'meadow',   label: 'Meadow',    bg: 'meadow',   overlay: 'rgba(0,5,2,0.6)'     },
  { id: 'cosmos',   label: 'Space',     bg: 'cosmos',   overlay: 'rgba(0,0,4,0.5)'     },
  { id: 'storm',    label: 'Storm',     bg: 'storm',    overlay: 'rgba(2,3,8,0.65)'    },
  { id: 'library',  label: 'Library',   bg: 'library',  overlay: 'rgba(4,2,0,0.6)'     },
]

/* ─── Ambient sounds ──────────────────────────────────────────── */
const AMBIENTS = [
  { id: 'none',        label: 'Off' },
  { id: 'rain',        label: 'Rainfall' },
  { id: 'ocean',       label: 'Ocean waves' },
  { id: 'forest',      label: 'Forest birds' },
  { id: 'whitenoise',  label: 'White noise' },
  { id: 'brownnoise',  label: 'Brown noise' },
  { id: 'cafe',        label: 'Coffee shop' },
  { id: 'fireplace',   label: 'Fireplace' },
  { id: 'lofi',        label: 'Lo-fi beats' },
]

/* ─── Music playlists ─────────────────────────────────────────── */
const PLAYLISTS = [
  // IDs verified against search results May 2026
  { id: 'lofi',       label: 'Lo-fi Hip Hop',   sub: 'Lofi Girl mix',        vid: 'CFGLoQIhmow' },
  { id: 'lofi2',      label: 'Lofi Mix',         sub: 'Beats to study to',   vid: 'CFGLoQIhmow' },
  { id: 'classical',  label: 'Classical',        sub: 'Mozart & Vivaldi',    vid: 'BMuknRb7woc' },
  { id: 'classical2', label: 'Classical Piano',  sub: '4 hours Halidon',     vid: 'PkjATKxRDO0' },
  { id: 'piano',      label: 'Solo Piano',       sub: 'Calm & focus',        vid: 'oiGmGFxsJi8' },
  { id: 'rain',       label: 'Rain Sounds',      sub: 'Sleep & focus',       vid: 'q76bMs-NwRk' },
  { id: 'ambient',    label: 'Ambient',          sub: 'Atmospheric',         vid: 'HGl75kurxok' },
  { id: 'brownnoise', label: 'Brown Noise',      sub: 'Deep concentration',  vid: 'RqzGzwTY-6w' },
  { id: 'nature',     label: 'Nature Sounds',    sub: 'Outdoors',            vid: 'eKFTSSKCzWA' },
  { id: 'jazz',       label: 'Jazz',             sub: '1AM study session',   vid: 'lTRiuFIWV54' },
]

/* ─── Alert tones ─────────────────────────────────────────────── */
const ALERTS = [
  { id: 'tibetan',  label: 'Tibetan Bowl' },
  { id: 'bell',     label: 'School Bell'  },
  { id: 'chime',    label: 'Wind Chime'  },
  { id: 'digital',  label: 'Digital'     },
  { id: 'gentle',   label: 'Soft Pulse'  },
]

/* Scene CSS (forest / rain / cosmos / …) lives in Timer.css — it is page-scoped there,
   so it is no longer injected as a <style> tag on every visit to this page. */

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
    if (p.type === 'snowflake')  return <div key={k} className="snowflake" style={p.style}>•</div>
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

  // Scheduled session this timer run belongs to: /timer?sessionId=ABC
  const [searchParams] = useSearchParams()
  const sessionIdParam = searchParams.get('sessionId')
  const activeSessionId = sessionIdParam || timer.linkedSessionId
  const [linkedSession, setLinkedSession] = useState(null)
  const [sessionLoadError, setSessionLoadError] = useState(null)
  const [completing, setCompleting] = useState(false)

  const containerRef = useRef(null)
  const alertLoopRef = useRef(null)
  const prevSignal   = useRef(timer.timerFinishedSignal)

  const sc = SCENES.find(s => s.id === scene) || SCENES[0]
  const onScene = scene !== 'none'

  // ── Ambient sound ─────────────────────────────────────────────
  useEffect(() => {
    if (timer.cdRunning && ambient !== 'none') startSound(ambient, volume)
    else stopSound()
    return () => stopSound()
  }, [ambient, timer.cdRunning])

  // ── Volume change (live, no restart needed) ────────────────────
  useEffect(() => {
    if (timer.cdRunning && ambient !== 'none') setSoundVolume(volume)
  }, [volume])

  // ── Timer finish ───────────────────────────────────────────────
  useEffect(() => {
    if (timer.timerFinishedSignal === prevSignal.current) return
    prevSignal.current = timer.timerFinishedSignal
    stopSound()
    playAlert(alertType)
    alertLoopRef.current = setInterval(() => playAlert(alertType), 3500)
    if (timer.musicAutoStop) setPlaylist(null)
    if (user && timer.cdTotal > 0) {
      // A linked session is paid once through completeSession() (keyed to the session id, run
      // from TimerContext), so the per-minute timer XP is skipped for it — no double payment.
      if (!timer.linkedSessionId) awardTimerXP(user.uid, Math.floor(timer.cdTotal / 60)).catch(() => {})
      recordActivityStreak(user.uid).catch(() => {})
    }
  }, [timer.timerFinishedSignal])

  // ── Linked session: load it for display and attach this timer run to it ──
  useEffect(() => {
    if (!activeSessionId || !user) { setLinkedSession(null); return }
    let cancelled = false
    setSessionLoadError(null)
    getDoc(doc(db, 'users', user.uid, 'sessions', activeSessionId)).then(snap => {
      if (cancelled) return
      if (!snap.exists()) { setLinkedSession(null); setSessionLoadError('This session no longer exists.'); return }
      const data = { ...snap.data(), id: snap.id }
      setLinkedSession(data)
      if (!sessionIdParam || data.completed) return // only a ?sessionId= link attaches the timer, and never to a finished session
      const isNewLink = timer.linkedSessionId !== snap.id
      // Preset first, then link, so the reset isn't counted as focus time for this session.
      if (isNewLink && !timer.cdRunning && data.duration > 0) timer.cdSetPreset(Math.round(data.duration) * 60)
      timer.linkSession(snap.id)
    }).catch(err => { if (!cancelled) setSessionLoadError(err.message || 'Could not load the session.') })
    return () => { cancelled = true }
  }, [activeSessionId, sessionIdParam, user?.uid])

  async function completeLinkedSession() {
    if (completing) return
    setCompleting(true)
    const result = await timer.finishLinkedSession()
    if (result?.completed) { timer.cdPause(); timer.swPause() }
    setCompleting(false)
  }

  function dismissAlert() {
    clearInterval(alertLoopRef.current)
    timer.cdReset()
    stopSound()
  }

  useEffect(() => () => clearInterval(alertLoopRef.current), [])

  // ── Fullscreen (the timer card becomes the whole screen) ───────
  // State is driven by the fullscreenchange listener rather than set optimistically, so a browser
  // that refuses requestFullscreen (iOS Safari on a <div>) never leaves the page thinking it is
  // fullscreen. The stage also renders its own Exit button while fullscreen — the header is off
  // screen at that point.
  async function toggleFs() {
    try {
      if (!document.fullscreenElement) await containerRef.current?.requestFullscreen?.()
      else await document.exitFullscreen()
    } catch {
      setFullscreen(false)
    }
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

  const openPanel = (id) => setPanel(p => (p === id ? null : id))

  // Side-column summaries — plain-language status for each of the three clocks.
  const ambientLabel = AMBIENTS.find(a => a.id === ambient)?.label || 'Off'
  const alertLabel   = ALERTS.find(a => a.id === alertType)?.label || 'Off'
  const musicLabel   = playlist?.label || 'Off'
  const countdownStatus = timer.cdFinished
    ? 'Finished'
    : timer.cdRunning
      ? `${fmt(timer.cdRemaining)} running`
      : timer.cdRemaining < timer.cdTotal ? `${fmt(timer.cdRemaining)} paused` : 'Ready'
  const stopwatchStatus = timer.swRunning
    ? `${fmt(timer.swElapsed)} running`
    : timer.swElapsed > 0 ? `${fmt(timer.swElapsed)} paused` : 'Ready'
  const alarmStatus = timer.alarmFired
    ? 'Ringing'
    : timer.alarmTarget ? timer.alarmTarget.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Off'

  return (
    <div className="timer-page fade-in">
      {/* ── Header ── */}
      <header className="timer-header">
        <div>
          <h2 className="timer-title"><TimerIcon size={22} /> Timer</h2>
          <p className="timer-subtitle">
            Countdown, stopwatch or alarm. It keeps running while you move around RevisionFlow,
            and the live time now shows in your browser tab as well.
          </p>
        </div>
        <div className="timer-header-actions">
          <button
            type="button"
            className={`btn btn-sm ${panel === 'scene' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => openPanel('scene')}
            aria-expanded={panel === 'scene'}
          >
            <ImageIcon size={15} /> Scene
          </button>
          <button
            type="button"
            className={`btn btn-sm ${panel === 'sound' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => openPanel('sound')}
            aria-expanded={panel === 'sound'}
          >
            <Volume2 size={15} /> Sound
          </button>
          <button
            type="button"
            className={`btn btn-sm ${panel === 'music' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => openPanel('music')}
            aria-expanded={panel === 'music'}
          >
            <Music size={15} /> Music
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={toggleFs}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            {fullscreen ? 'Exit' : 'Fullscreen'}
          </button>
        </div>
      </header>

      {/* ── Scheduled session this run belongs to (/timer?sessionId=ABC) ── */}
      {(linkedSession || sessionLoadError || timer.sessionResult) && (
        <div className="card timer-session-card">
          <div className="timer-session-info">
            <p className="timer-eyebrow">Scheduled session</p>
            {sessionLoadError && <div className="timer-session-note is-error">{sessionLoadError}</div>}
            {!sessionLoadError && linkedSession && (
              <div className="timer-session-title">
                {linkedSession.title || linkedSession.subject}
                {linkedSession.duration
                  ? <span className="timer-session-note" style={{ fontWeight: 500 }}> · {linkedSession.duration} min planned</span>
                  : null}
              </div>
            )}
            {timer.sessionResult && timer.sessionResult.sessionId === activeSessionId && (
              <div className={`timer-session-note ${timer.sessionResult.error ? 'is-error' : 'is-ok'}`}>
                {timer.sessionResult.error
                  ? timer.sessionResult.error
                  : timer.sessionResult.alreadyCompleted
                    ? 'Already completed — nothing was added twice.'
                    : `Session completed — ${timer.sessionResult.minutes} min logged.`}
              </div>
            )}
            {!timer.sessionResult && linkedSession?.completed && (
              <div className="timer-session-note">This session is already completed.</div>
            )}
          </div>
          <div className="timer-session-actions">
            {timer.linkedSessionId && timer.linkedSessionId === activeSessionId && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={completeLinkedSession}
                disabled={completing}
              >
                {completing ? 'Completing…' : 'Complete session'}
              </button>
            )}
            {timer.sessionResult && (
              <Link to="/calendar" className="btn btn-secondary btn-sm">Back to calendar</Link>
            )}
          </div>
        </div>
      )}

      {/* ── Option panels ── */}
      {panel === 'scene' && (
        <div className="card timer-panel">
          <p className="timer-panel-label">Animated background</p>
          <div className="timer-chip-row">
            {SCENES.map(s => (
              <button
                key={s.id}
                type="button"
                className={`timer-chip${scene === s.id ? ' is-active' : ''}`}
                onClick={() => setScene(s.id)}
                aria-pressed={scene === s.id}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {panel === 'sound' && (
        <div className="card timer-panel">
          <p className="timer-panel-label">Ambient sound (plays while the countdown runs)</p>
          <div className="timer-chip-row">
            {AMBIENTS.map(a => (
              <button
                key={a.id}
                type="button"
                className={`timer-chip${ambient === a.id ? ' is-active' : ''}`}
                onClick={() => setAmbient(a.id)}
                aria-pressed={ambient === a.id}
              >
                {a.label}
              </button>
            ))}
          </div>
          {ambient !== 'none' && (
            <div className="timer-volume">
              <span className="timer-volume-label">Volume</span>
              <input
                type="range" min="0" max="1" step="0.05" value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                aria-label="Ambient sound volume"
              />
              <span className="timer-volume-label">{Math.round(volume * 100)}%</span>
            </div>
          )}

          <p className="timer-panel-label" style={{ marginTop: 18 }}>Alert tone (plays when the timer ends)</p>
          <div className="timer-chip-row">
            {ALERTS.map(a => (
              <button
                key={a.id}
                type="button"
                className={`timer-chip${alertType === a.id ? ' is-active' : ''}`}
                onClick={() => setAlertType(a.id)}
                aria-pressed={alertType === a.id}
              >
                {a.label}
              </button>
            ))}
            <button type="button" className="timer-chip" onClick={() => playAlert(alertType)}>
              <Play size={11} style={{ verticalAlign: -1, marginRight: 4 }} /> Test
            </button>
          </div>
        </div>
      )}

      {panel === 'music' && (
        <div className="card timer-panel">
          <label className="timer-check" style={{ marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={timer.musicAutoStop || false}
              onChange={e => timer.setMusicAutoStop(e.target.checked)}
            />
            Stop music when the timer ends
          </label>
          <div className="timer-music-grid">
            {PLAYLISTS.map(p => (
              <button
                key={p.id}
                type="button"
                className={`timer-music-card${playlist?.id === p.id ? ' is-active' : ''}`}
                onClick={() => setPlaylist(playlist?.id === p.id ? null : p)}
                aria-pressed={playlist?.id === p.id}
              >
                <span className="timer-music-name">{p.label}</span>
                <span className="timer-music-sub">{p.sub}</span>
              </button>
            ))}
          </div>
          {playlist && (
            <div className="timer-music-frame">
              <iframe
                key={playlist.id}
                width="100%"
                height="90"
                title={`${playlist.label} — study music`}
                src={`https://www.youtube.com/embed/${playlist.vid}?autoplay=1&controls=1`}
                allow="autoplay; encrypted-media"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Mode tabs ── */}
      <div className="tabs timer-tabs" role="tablist" aria-label="Timer mode">
        {[
          { id: 'countdown', label: 'Countdown', icon: TimerIcon },
          { id: 'stopwatch', label: 'Stopwatch', icon: Clock },
          { id: 'alarm',     label: 'Alarm',     icon: Bell },
        ].map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      <div className="timer-layout">
        {/* ════ Stage: the clock itself, also the fullscreen focus view ════ */}
        <section
          ref={containerRef}
          className={`card timer-stage${onScene ? ' is-scene' : ''}${tab === 'countdown' && timer.cdFinished ? ' is-finished' : ''}`}
        >
          {onScene && (
            <>
              <div className={`timer-scene-layer scn bg-${sc.bg}`} aria-hidden="true">
                <Particles scene={scene} />
              </div>
              <div className="timer-scene-overlay" style={{ background: sc.overlay }} aria-hidden="true" />
            </>
          )}

          {fullscreen && (
            <button type="button" className="timer-fs-exit" onClick={toggleFs}>
              <Minimize2 size={15} /> Exit fullscreen
            </button>
          )}

          <div className="timer-stage-content">

            {/* ════ COUNTDOWN ════ */}
            {tab === 'countdown' && (<>
              <div className="timer-ring">
                <svg width={w} height={w} viewBox={`0 0 ${w} ${w}`} className="timer-ring-svg" aria-hidden="true">
                  <circle className="timer-ring-track" cx={cx} cy={cx} r={100} fill="none" strokeWidth={12} />
                  {Array.from({ length: 60 }, (_, i) => {
                    const angle = (i / 60) * 2 * Math.PI - Math.PI / 2
                    const r1 = i % 5 === 0 ? 88 : 92, r2 = 98
                    return (
                      <line
                        key={i}
                        className="timer-ring-tick"
                        x1={cx + r1 * Math.cos(angle)} y1={cx + r1 * Math.sin(angle)}
                        x2={cx + r2 * Math.cos(angle)} y2={cx + r2 * Math.sin(angle)}
                        strokeWidth={i % 5 === 0 ? 2 : 1}
                      />
                    )
                  })}
                  <circle
                    className="timer-ring-progress"
                    cx={cx} cy={cx} r={100} fill="none"
                    strokeWidth={12} strokeLinecap="round"
                    strokeDasharray={circum}
                    strokeDashoffset={circum * (1 - pct)}
                  />
                </svg>
                <div className="timer-ring-inner">
                  {timer.cdFinished ? (
                    <>
                      <div className="timer-display timer-display--finished">Time&rsquo;s up</div>
                      <button type="button" className="btn btn-danger btn-sm" onClick={dismissAlert}>Dismiss</button>
                    </>
                  ) : (
                    <>
                      <span className="timer-display" role="timer">{fmt(timer.cdRemaining)}</span>
                      <span className="timer-display-sub">
                        {timer.cdRunning
                          ? 'remaining'
                          : timer.cdRemaining === timer.cdTotal
                            ? `of ${fmt(timer.cdTotal)}`
                            : 'paused'}
                      </span>
                      {ambient !== 'none' && timer.cdRunning && (
                        <span className="timer-display-sub">
                          <Volume2 size={12} />{ambientLabel} playing
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="timer-controls">
                {!timer.cdRunning ? (
                  <button type="button" className="btn btn-primary btn-lg" onClick={timer.cdStart}>
                    <Play size={18} /> {timer.cdRemaining === timer.cdTotal ? 'Start' : 'Resume'}
                  </button>
                ) : (
                  <button type="button" className="btn btn-primary btn-lg" onClick={timer.cdPause}>
                    <Pause size={18} /> Pause
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { timer.cdReset(); stopSound(); clearInterval(alertLoopRef.current) }}
                >
                  <RotateCcw size={16} /> Reset
                </button>
              </div>

              <div className="timer-chips">
                {[[-300, '−5m'], [-30, '−30s'], [30, '+30s'], [300, '+5m']].map(([d, l]) => (
                  <button key={l} type="button" className="timer-pill" onClick={() => adjust(d)}>{l}</button>
                ))}
              </div>

              <div className="timer-chips timer-chips--presets">
                {[[5, '5m'], [10, '10m'], [15, '15m'], [20, '20m'], [25, '25m'], [30, '30m'], [45, '45m'], [60, '60m'], [90, '90m']].map(([mins, label]) => (
                  <button
                    key={mins}
                    type="button"
                    className={`timer-pill${timer.cdTotal === mins * 60 && !timer.cdRunning ? ' is-active' : ''}`}
                    onClick={() => timer.cdSetPreset(mins * 60)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="timer-exact">
                <span className="timer-exact-label">Set exact</span>
                {[
                  ['h', inputH, setInputH, 'hh'],
                  ['m', inputM, setInputM, 'mm'],
                  ['s', inputS, setInputS, 'ss'],
                ].map(([unit, val, setter, ph], i) => (
                  <span key={unit} className="timer-exact-field">
                    {i > 0 && <span className="timer-exact-sep">:</span>}
                    <input
                      value={val}
                      onChange={e => setter(e.target.value)}
                      placeholder={ph}
                      maxLength={2}
                      inputMode="numeric"
                      aria-label={unit === 'h' ? 'Hours' : unit === 'm' ? 'Minutes' : 'Seconds'}
                    />
                  </span>
                ))}
                <button type="button" className="timer-pill timer-exact-set" onClick={applyExactTime}>Set</button>
              </div>
            </>)}

            {/* ════ STOPWATCH ════ */}
            {tab === 'stopwatch' && (<>
              <div className="timer-big-time" role="timer">{fmt(timer.swElapsed)}</div>
              {timer.swLaps?.length > 0 && (
                <div className="timer-display-sub" style={{ fontSize: '1rem', fontWeight: 600 }}>
                  Lap {timer.swLaps.length + 1} · {fmt(timer.swElapsed - (timer.swLaps[timer.swLaps.length - 1] || 0))}
                </div>
              )}

              <div className="timer-controls">
                {!timer.swRunning ? (
                  <button type="button" className="btn btn-primary btn-lg" onClick={timer.swStart}>
                    <Play size={18} /> {timer.swElapsed === 0 ? 'Start' : 'Resume'}
                  </button>
                ) : (<>
                  <button type="button" className="btn btn-primary btn-lg" onClick={timer.swPause}>
                    <Pause size={18} /> Pause
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={timer.swLap}>
                    <Flag size={16} /> Lap
                  </button>
                </>)}
                <button type="button" className="btn btn-secondary" onClick={timer.swReset}>
                  <RotateCcw size={16} /> Reset
                </button>
              </div>

              {timer.swLaps?.length > 0 ? (
                <div className="timer-laps">
                  {[...timer.swLaps].reverse().map((lap, i) => {
                    const lapNum = timer.swLaps.length - i
                    const lapTime = lap - (timer.swLaps[lapNum - 2] || 0)
                    const best = Math.min(...timer.swLaps.map((l, j) => l - (timer.swLaps[j - 1] || 0)))
                    return (
                      <div key={lapNum} className="timer-lap">
                        <span className="timer-lap-label">Lap {lapNum}</span>
                        <span className={`timer-lap-split${lapTime === best ? ' is-best' : ''}`}>{fmt(lapTime)}</span>
                        <span className="timer-lap-total">{fmt(lap)}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="timer-lap-empty">No laps yet — hit Lap while the stopwatch runs.</p>
              )}
            </>)}

            {/* ════ ALARM ════ */}
            {tab === 'alarm' && (<>
              {timer.alarmFired && (
                <div className="timer-alarm-hero">
                  <div className="timer-alarm-ring"><Bell size={30} /></div>
                  <p className="timer-alarm-hero-title">Alarm ringing</p>
                  <button type="button" className="btn btn-danger" onClick={timer.clearAlarm}>Dismiss</button>
                </div>
              )}

              {timer.alarmTarget && !timer.alarmFired && (
                <div className="timer-alarm-active">
                  <Bell size={16} />
                  Set for {timer.alarmTarget.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={timer.clearAlarm}>Clear</button>
                </div>
              )}

              <div className="timer-alarm-grid">
                <div className="timer-alarm-card">
                  <p className="timer-alarm-card-title"><Clock size={15} /> Set a clock time</p>
                  <div className="timer-alarm-row">
                    <input
                      type="time"
                      className="input"
                      aria-label="Alarm time"
                      value={alarmTime}
                      onChange={e => setAlarmTime(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        if (!alarmTime) return
                        const [h, m] = alarmTime.split(':').map(Number)
                        const t = new Date(); t.setHours(h, m, 0, 0)
                        if (t < new Date()) t.setDate(t.getDate() + 1)
                        timer.setAlarm(t)
                      }}
                    >
                      Set
                    </button>
                  </div>
                </div>

                <div className="timer-alarm-card">
                  <p className="timer-alarm-card-title"><TimerIcon size={15} /> Countdown alarm</p>
                  <div className="timer-alarm-row">
                    <input
                      type="number"
                      className="input"
                      placeholder="Minutes from now"
                      aria-label="Minutes from now"
                      min="1"
                      value={alarmMins}
                      onChange={e => setAlarmMins(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => { const m = parseInt(alarmMins); if (m > 0) timer.setAlarm(new Date(Date.now() + m * 60000)) }}
                    >
                      Set
                    </button>
                  </div>
                </div>
              </div>
            </>)}

          </div>
        </section>

        {/* ════ Side column ════ */}
        <aside className="timer-side">
          <section className="card">
            <h3 className="timer-side-title"><SlidersHorizontal size={17} /> Focus setup</h3>
            <div className="timer-setup">
              <button type="button" className="timer-setup-row" onClick={() => openPanel('scene')}>
                <span className="timer-setup-icon"><ImageIcon size={15} /></span>
                <span className="timer-setup-main">
                  <span className="timer-setup-label">Background</span>
                  <span className="timer-setup-value">{sc.label}</span>
                </span>
                <ChevronRight size={15} className="timer-setup-chevron" />
              </button>
              <button type="button" className="timer-setup-row" onClick={() => openPanel('sound')}>
                <span className="timer-setup-icon"><Volume2 size={15} /></span>
                <span className="timer-setup-main">
                  <span className="timer-setup-label">Ambient sound</span>
                  <span className="timer-setup-value">{ambientLabel}</span>
                </span>
                <ChevronRight size={15} className="timer-setup-chevron" />
              </button>
              <button type="button" className="timer-setup-row" onClick={() => openPanel('sound')}>
                <span className="timer-setup-icon"><Bell size={15} /></span>
                <span className="timer-setup-main">
                  <span className="timer-setup-label">Alert tone</span>
                  <span className="timer-setup-value">{alertLabel}</span>
                </span>
                <ChevronRight size={15} className="timer-setup-chevron" />
              </button>
              <button type="button" className="timer-setup-row" onClick={() => openPanel('music')}>
                <span className="timer-setup-icon"><Music size={15} /></span>
                <span className="timer-setup-main">
                  <span className="timer-setup-label">Study music</span>
                  <span className="timer-setup-value">{musicLabel}</span>
                </span>
                <ChevronRight size={15} className="timer-setup-chevron" />
              </button>
            </div>
            <div className="timer-side-divider" />
            <label className="timer-check">
              <input
                type="checkbox"
                checked={timer.musicAutoStop || false}
                onChange={e => timer.setMusicAutoStop(e.target.checked)}
              />
              Stop music when the timer ends
            </label>
          </section>

          <section className="card">
            <h3 className="timer-side-title"><Clock size={17} /> Right now</h3>
            <div className="timer-status">
              <div className="timer-status-row">
                <span className="timer-status-label">Countdown</span>
                <span className={`timer-status-value${timer.cdRunning ? ' is-live' : ''}`}>{countdownStatus}</span>
              </div>
              <div className="timer-status-row">
                <span className="timer-status-label">Stopwatch</span>
                <span className={`timer-status-value${timer.swRunning ? ' is-live' : ''}`}>{stopwatchStatus}</span>
              </div>
              <div className="timer-status-row">
                <span className="timer-status-label">Alarm</span>
                <span className={`timer-status-value${timer.alarmTarget ? ' is-live' : ''}`}>{alarmStatus}</span>
              </div>
            </div>
            <div className="timer-side-divider" />
            <p className="timer-tip">
              <Lightbulb size={13} style={{ verticalAlign: -2, marginRight: 5, color: 'var(--gold)' }} />
              Leave this page and the timer keeps running — a mini timer appears in the sidebar
              (top bar on mobile) so you can pause or jump straight back.
            </p>
            <p className="timer-tip">
              The live time also sits in your browser tab, so it stays visible while you work in
              another tab.
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}
