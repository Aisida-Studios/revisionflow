// src/pages/Timer.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useTimer } from '../context/TimerContext'
import { TIMER_SOUNDS, startSound, stopSound } from '../utils/timerSounds'
import { awardTimerXP, recordActivityStreak } from '../utils/firestore'
import { useAuth } from '../context/AuthContext'

function fmt(s) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

const PRESETS = [
  { label:'5m',  s:300  }, { label:'10m', s:600  },
  { label:'15m', s:900  }, { label:'25m', s:1500 },
  { label:'30m', s:1800 }, { label:'45m', s:2700 },
  { label:'60m', s:3600 }, { label:'90m', s:5400 },
]

// CSS-animated nature backgrounds — no external video files needed
// Each scene uses pure CSS keyframe animations
const SCENES = [
  { id:'none',      label:'None',        icon:'✕' },
  { id:'forest',    label:'Forest',      icon:'🌲' },
  { id:'rain',      label:'Rain',        icon:'🌧' },
  { id:'ocean',     label:'Ocean',       icon:'🌊' },
  { id:'sunset',    label:'Sunset',      icon:'🌅' },
  { id:'snow',      label:'Snow',        icon:'❄️'  },
  { id:'aurora',    label:'Aurora',      icon:'✨' },
  { id:'campfire',  label:'Campfire',    icon:'🔥' },
  { id:'meadow',    label:'Meadow',      icon:'🌿' },
  { id:'cosmos',    label:'Space',       icon:'🌌' },
]

const PLAYLISTS = [
  { id:'lofi',       label:'Lo-fi',      vid:'jfKfPfyJRdk' },
  { id:'classical',  label:'Classical',  vid:'mDDP91JGJl4' },
  { id:'rain',       label:'Rain',       vid:'q76bMs-NwRk' },
  { id:'ambient',    label:'Ambient',    vid:'HGl75kurxok' },
  { id:'piano',      label:'Piano',      vid:'UF9uh7MNqkY' },
  { id:'brownnoise', label:'Brown noise',vid:'RqzGzwTY-6w' },
]

const ALERT_SOUNDS = [
  { id:'bell',   label:'Bell'   },
  { id:'chime',  label:'Chime'  },
  { id:'beep',   label:'Beep'   },
  { id:'gentle', label:'Gentle' },
]

// Inline CSS for each animated scene
const SCENE_CSS = `
  /* ── Forest ── */
  .scene-forest { background: linear-gradient(180deg, #0a1f0a 0%, #0d2e0d 40%, #061206 100%); }
  .scene-forest::before {
    content:''; position:absolute; inset:0;
    background: radial-gradient(ellipse at 50% 30%, rgba(20,60,10,0.6) 0%, transparent 70%);
    animation: forestLight 8s ease-in-out infinite;
  }
  @keyframes forestLight {
    0%,100% { opacity:0.6; transform:translateY(0); }
    50% { opacity:1; transform:translateY(-6px); }
  }
  .scene-forest .leaf {
    position:absolute; border-radius:50% 0 50% 0; opacity:0;
    animation: leafFall linear infinite;
  }
  @keyframes leafFall {
    0% { opacity:0; transform:translateX(0) translateY(-20px) rotate(0deg); }
    10% { opacity:0.7; }
    90% { opacity:0.4; }
    100% { opacity:0; transform:translateX(80px) translateY(105vh) rotate(720deg); }
  }

  /* ── Rain ── */
  .scene-rain { background: linear-gradient(180deg, #0d1520 0%, #0a1020 50%, #060c18 100%); }
  .scene-rain::before {
    content:''; position:absolute; inset:0;
    background: radial-gradient(ellipse at 50% 0%, rgba(30,60,100,0.4) 0%, transparent 60%);
    animation: rainCloud 6s ease-in-out infinite;
  }
  @keyframes rainCloud {
    0%,100% { opacity:0.5; } 50% { opacity:0.9; }
  }
  .rain-drop {
    position:absolute; width:1px; background:linear-gradient(180deg,transparent,rgba(150,200,255,0.6));
    animation: rainFall linear infinite;
  }
  @keyframes rainFall {
    0% { transform:translateY(-100px); opacity:0; }
    10% { opacity:1; }
    90% { opacity:0.7; }
    100% { transform:translateY(105vh); opacity:0; }
  }

  /* ── Ocean ── */
  .scene-ocean { background: linear-gradient(180deg, #0a1a2e 0%, #0d2a4a 50%, #061020 100%); }
  .scene-ocean::before {
    content:''; position:absolute; bottom:0; left:0; right:0; height:45%;
    background: linear-gradient(180deg, transparent, rgba(10,60,120,0.5) 40%, rgba(5,30,80,0.8));
    animation: oceanWave 5s ease-in-out infinite;
  }
  @keyframes oceanWave {
    0%,100% { transform:translateY(0) scaleX(1); }
    50% { transform:translateY(-12px) scaleX(1.02); }
  }
  .scene-ocean::after {
    content:''; position:absolute; inset:0;
    background: radial-gradient(ellipse at 50% 110%, rgba(0,80,160,0.35) 0%, transparent 60%);
    animation: oceanShimmer 4s ease-in-out infinite alternate;
  }
  @keyframes oceanShimmer {
    0% { opacity:0.4; } 100% { opacity:0.9; }
  }

  /* ── Sunset ── */
  .scene-sunset { background: linear-gradient(180deg, #1a0520 0%, #6b1a2a 25%, #c4420a 55%, #f27322 70%, #ffd700 85%, #0a0520 100%); }
  .scene-sunset::before {
    content:''; position:absolute; inset:0;
    background: radial-gradient(ellipse at 50% 72%, rgba(255,180,0,0.5) 0%, rgba(200,60,0,0.2) 30%, transparent 60%);
    animation: sunPulse 6s ease-in-out infinite;
  }
  @keyframes sunPulse {
    0%,100% { opacity:0.7; transform:scale(1); }
    50% { opacity:1; transform:scale(1.05); }
  }
  .scene-sunset::after {
    content:''; position:absolute; inset:0;
    background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%, rgba(0,0,0,0.3) 100%);
  }

  /* ── Snow ── */
  .scene-snow { background: linear-gradient(180deg, #0d1525 0%, #1a2540 50%, #0a1020 100%); }
  .snowflake {
    position:absolute; color:rgba(255,255,255,0.8); font-size:12px;
    animation: snowFall linear infinite;
    user-select:none; pointer-events:none;
  }
  @keyframes snowFall {
    0% { transform:translateY(-30px) translateX(0) rotate(0deg); opacity:0; }
    10% { opacity:0.9; }
    90% { opacity:0.6; }
    100% { transform:translateY(105vh) translateX(60px) rotate(360deg); opacity:0; }
  }

  /* ── Aurora ── */
  .scene-aurora { background: linear-gradient(180deg, #020510 0%, #050d20 50%, #020508 100%); }
  .scene-aurora::before {
    content:''; position:absolute; top:0; left:-20%; right:-20%; height:60%;
    background: linear-gradient(180deg,
      rgba(0,200,100,0) 0%,
      rgba(0,200,100,0.12) 20%,
      rgba(0,150,200,0.18) 40%,
      rgba(150,0,200,0.12) 60%,
      transparent 100%
    );
    animation: auroraWave 10s ease-in-out infinite;
    border-radius: 0 0 60% 60%;
  }
  @keyframes auroraWave {
    0%,100% { transform:translateX(0) scaleX(1) skewX(0deg); opacity:0.6; }
    33% { transform:translateX(5%) scaleX(0.95) skewX(3deg); opacity:1; }
    66% { transform:translateX(-5%) scaleX(1.05) skewX(-3deg); opacity:0.8; }
  }
  .scene-aurora::after {
    content:''; position:absolute; top:5%; left:-30%; right:-30%; height:50%;
    background: linear-gradient(180deg,
      transparent 0%,
      rgba(100,0,200,0.08) 30%,
      rgba(0,200,150,0.14) 60%,
      transparent 100%
    );
    animation: auroraWave2 14s ease-in-out infinite reverse;
    border-radius: 0 0 40% 40%;
  }
  @keyframes auroraWave2 {
    0%,100% { transform:translateX(0) scaleX(1); opacity:0.5; }
    50% { transform:translateX(8%) scaleX(0.9); opacity:1; }
  }
  .star { position:absolute; width:2px; height:2px; background:#fff; border-radius:50%; animation:twinkle ease-in-out infinite; }
  @keyframes twinkle {
    0%,100% { opacity:0.2; transform:scale(1); }
    50% { opacity:1; transform:scale(1.5); }
  }

  /* ── Campfire ── */
  .scene-campfire { background: radial-gradient(ellipse at 50% 100%, #1a0800 0%, #0a0400 60%, #050200 100%); }
  .scene-campfire::before {
    content:''; position:absolute; bottom:25%; left:50%; transform:translateX(-50%);
    width:80px; height:100px;
    background: radial-gradient(ellipse, rgba(255,120,0,0.8) 0%, rgba(200,50,0,0.4) 50%, transparent 80%);
    animation: fireFlicker 0.3s ease-in-out infinite alternate;
    border-radius:50% 50% 30% 30%;
    filter:blur(3px);
  }
  @keyframes fireFlicker {
    0% { transform:translateX(-50%) scaleX(1) scaleY(1) skewX(0deg); opacity:0.9; }
    100% { transform:translateX(-50%) scaleX(0.92) scaleY(1.08) skewX(4deg); opacity:1; }
  }
  .scene-campfire::after {
    content:''; position:absolute; inset:0;
    background: radial-gradient(ellipse at 50% 90%, rgba(255,80,0,0.2) 0%, rgba(150,30,0,0.08) 40%, transparent 70%);
    animation: fireGlow 1.5s ease-in-out infinite alternate;
  }
  @keyframes fireGlow {
    0% { opacity:0.6; } 100% { opacity:1; }
  }
  .ember { position:absolute; width:2px; height:2px; background:#ff6000; border-radius:50%; animation:emberFloat linear infinite; }
  @keyframes emberFloat {
    0% { transform:translateY(0) translateX(0); opacity:1; }
    100% { transform:translateY(-120px) translateX(var(--drift,20px)); opacity:0; }
  }

  /* ── Meadow ── */
  .scene-meadow { background: linear-gradient(180deg, #0d1f3a 0%, #1a3a2a 30%, #0d2a1a 70%, #061208 100%); }
  .scene-meadow::before {
    content:''; position:absolute; inset:0;
    background: radial-gradient(ellipse at 30% 40%, rgba(30,80,20,0.3) 0%, transparent 50%),
                radial-gradient(ellipse at 70% 60%, rgba(20,60,15,0.25) 0%, transparent 40%);
    animation: meadowBreeze 8s ease-in-out infinite;
  }
  @keyframes meadowBreeze {
    0%,100% { transform:translateX(0); opacity:0.7; }
    50% { transform:translateX(8px); opacity:1; }
  }
  .firefly { position:absolute; width:3px; height:3px; background:#aaff00; border-radius:50%; animation:fireflyFloat ease-in-out infinite; filter:blur(1px); }
  @keyframes fireflyFloat {
    0%,100% { transform:translate(0,0); opacity:0; }
    20%,80% { opacity:0.9; }
    50% { transform:translate(var(--dx,30px),var(--dy,-20px)); opacity:1; }
  }

  /* ── Cosmos ── */
  .scene-cosmos { background: radial-gradient(ellipse at 50% 50%, #060215 0%, #020108 100%); }
  .scene-cosmos::before {
    content:''; position:absolute; inset:0;
    background: radial-gradient(ellipse at 30% 40%, rgba(100,0,200,0.12) 0%, transparent 50%),
                radial-gradient(ellipse at 70% 60%, rgba(0,50,200,0.1) 0%, transparent 45%);
    animation: nebulaPulse 12s ease-in-out infinite;
  }
  @keyframes nebulaPulse {
    0%,100% { opacity:0.5; transform:scale(1); }
    50% { opacity:1; transform:scale(1.05); }
  }
`

// Generate particles for each scene
function SceneParticles({ scene }) {
  const particles = useRef([])

  if (particles.current.length === 0 || particles.current[0].scene !== scene) {
    const list = []
    if (scene === 'forest') {
      for (let i = 0; i < 12; i++) {
        list.push({ scene, type:'leaf', key:i,
          style: {
            left: Math.random()*100+'%', top: '-20px',
            width: (8+Math.random()*10)+'px', height: (8+Math.random()*10)+'px',
            background: `hsl(${100+Math.random()*40},${50+Math.random()*30}%,${15+Math.random()*15}%)`,
            animationDuration: (8+Math.random()*12)+'s',
            animationDelay: (Math.random()*8)+'s',
          }
        })
      }
    } else if (scene === 'rain') {
      for (let i = 0; i < 60; i++) {
        const dur = 0.4+Math.random()*0.6
        list.push({ scene, type:'drop', key:i,
          style: {
            left: Math.random()*100+'%', height: (10+Math.random()*20)+'px',
            animationDuration: dur+'s', animationDelay: (Math.random()*2)+'s',
          }
        })
      }
    } else if (scene === 'snow') {
      for (let i = 0; i < 40; i++) {
        list.push({ scene, type:'snowflake', key:i,
          style: {
            left: Math.random()*100+'%',
            fontSize: (8+Math.random()*14)+'px',
            animationDuration: (6+Math.random()*10)+'s',
            animationDelay: (Math.random()*8)+'s',
          }
        })
      }
    } else if (scene === 'campfire') {
      for (let i = 0; i < 15; i++) {
        list.push({ scene, type:'ember', key:i,
          style: {
            bottom: '25%', left: (47+Math.random()*6)+'%',
            '--drift': (Math.random()*40-20)+'px',
            animationDuration: (1+Math.random()*2)+'s',
            animationDelay: (Math.random()*2)+'s',
          }
        })
      }
    } else if (scene === 'meadow') {
      for (let i = 0; i < 18; i++) {
        list.push({ scene, type:'firefly', key:i,
          style: {
            left: (10+Math.random()*80)+'%', top: (30+Math.random()*50)+'%',
            '--dx': (Math.random()*60-30)+'px', '--dy': (Math.random()*40-20)+'px',
            animationDuration: (3+Math.random()*5)+'s',
            animationDelay: (Math.random()*5)+'s',
          }
        })
      }
    } else if (scene === 'aurora' || scene === 'cosmos') {
      const count = scene === 'cosmos' ? 120 : 60
      for (let i = 0; i < count; i++) {
        list.push({ scene, type:'star', key:i,
          style: {
            left: Math.random()*100+'%', top: Math.random()*80+'%',
            width: (1+Math.random()*2)+'px', height: (1+Math.random()*2)+'px',
            animationDuration: (2+Math.random()*4)+'s',
            animationDelay: (Math.random()*4)+'s',
            opacity: Math.random()*0.8+0.2,
          }
        })
      }
    }
    particles.current = list
  }

  return particles.current.map(p => {
    if (p.type === 'leaf')       return <div key={p.key} className="leaf" style={p.style} />
    if (p.type === 'drop')       return <div key={p.key} className="rain-drop" style={p.style} />
    if (p.type === 'snowflake')  return <div key={p.key} className="snowflake" style={p.style}>❄</div>
    if (p.type === 'ember')      return <div key={p.key} className="ember" style={p.style} />
    if (p.type === 'firefly')    return <div key={p.key} className="firefly" style={p.style} />
    if (p.type === 'star')       return <div key={p.key} className="star" style={p.style} />
    return null
  })
}

export default function Timer() {
  const timer = useTimer()
  const { user } = useAuth()
  const [tab,           setTab]           = useState('countdown')
  const [scene,         setScene]         = useState('none')
  const [alertSound,    setAlertSound]    = useState('bell')
  const [ambientSound,  setAmbientSound]  = useState('none')
  const [playlist,      setPlaylist]      = useState(null)
  const [panel,         setPanel]         = useState(null)  // 'ambience'|'sounds'|'music'|null
  const [customMins,    setCustomMins]    = useState('')
  const [alarmTime,     setAlarmTime]     = useState('')
  const [alarmCountdown,setAlarmCountdown]= useState('')
  const [fullscreen,    setFullscreen]    = useState(false)
  const containerRef = useRef(null)
  const alertRef     = useRef(null)

  const currentScene = SCENES.find(s => s.id === scene) || SCENES[0]
  const isBackgrounded = scene !== 'none'

  // Ambient sound
  useEffect(() => {
    if (timer.cdRunning && ambientSound !== 'none') startSound(ambientSound)
    else stopSound()
    return () => stopSound()
  }, [ambientSound, timer.cdRunning])

  // Timer finish
  const prevSignal = useRef(timer.timerFinishedSignal)
  useEffect(() => {
    if (timer.timerFinishedSignal === prevSignal.current) return
    prevSignal.current = timer.timerFinishedSignal
    stopSound()
    loopAlert()
    if (timer.musicAutoStop) setPlaylist(null)
    if (user && timer.cdTotal > 0) {
      awardTimerXP(user.uid, Math.floor(timer.cdTotal/60)).catch(()=>{})
      recordActivityStreak(user.uid).catch(()=>{})
    }
  }, [timer.timerFinishedSignal])

  function loopAlert() {
    playAlert()
    alertRef.current = setInterval(playAlert, 2800)
  }
  function stopAlert() {
    clearInterval(alertRef.current)
  }
  useEffect(() => () => stopAlert(), [])

  function playAlert() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const freqs = { bell:880, chime:1046, beep:440, gentle:528 }
      const freq = freqs[alertSound]||880
      for (let i=0;i<3;i++) {
        const t = ctx.currentTime + i*0.7
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = alertSound==='beep'?'square':'sine'
        o.frequency.value = freq*(1+i*0.04)
        g.gain.setValueAtTime(0,t)
        g.gain.linearRampToValueAtTime(0.3,t+0.04)
        g.gain.exponentialRampToValueAtTime(0.001,t+0.55)
        o.connect(g); g.connect(ctx.destination)
        o.start(t); o.stop(t+0.6)
      }
    } catch(e){}
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }
  useEffect(() => {
    const h = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  const cdPct   = timer.cdTotal > 0 ? (timer.cdRemaining / timer.cdTotal)*100 : 0
  const circum  = 2*Math.PI*90
  const textCol = isBackgrounded ? 'white' : 'var(--text-primary)'
  const mutedCol= isBackgrounded ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)'

  const panelStyle = {
    padding:'1rem 1.5rem',
    background: isBackgrounded ? 'rgba(0,0,0,0.62)' : 'var(--bg-surface)',
    backdropFilter:'blur(16px)',
    borderBottom: isBackgrounded ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--border)',
  }

  return (
    <>
      <style>{SCENE_CSS}</style>
      <div
        ref={containerRef}
        className={scene !== 'none' ? `scene-${scene}` : ''}
        style={{
          minHeight:'100%', position:'relative', overflow:'hidden',
          borderRadius: fullscreen?0:'var(--radius-lg)',
          background: scene === 'none' ? 'var(--bg-base)' : undefined,
          transition:'background 0.6s',
        }}
      >
        {/* Particles layer */}
        {scene !== 'none' && (
          <div style={{ position:'absolute', inset:0, zIndex:1, pointerEvents:'none', overflow:'hidden' }}>
            <SceneParticles scene={scene} />
          </div>
        )}

        {/* Content */}
        <div style={{ position:'relative', zIndex:2 }}>

          {/* Top bar */}
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'0.85rem 1.25rem', flexWrap:'wrap', gap:8,
            background: isBackgrounded ? 'rgba(0,0,0,0.45)' : 'var(--bg-surface)',
            backdropFilter: isBackgrounded ? 'blur(12px)' : undefined,
            borderBottom: isBackgrounded ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--border)',
          }}>
            <span style={{ fontWeight:800, fontSize:'1.1rem', color:textCol }}>⏱ Timer</span>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {[
                { id:'ambience', emoji:'🎨', label:'Scene' },
                { id:'sounds',   emoji:'🎶', label:'Sounds' },
                { id:'music',    emoji:'🎵', label:'Music' },
              ].map(p => (
                <button key={p.id} onClick={() => setPanel(panel===p.id?null:p.id)}
                  style={{
                    padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer',
                    fontWeight:600, fontSize:'0.8rem', display:'flex', alignItems:'center', gap:5,
                    background: panel===p.id
                      ? 'var(--accent)'
                      : isBackgrounded ? 'rgba(255,255,255,0.15)' : 'var(--bg-card)',
                    color: panel===p.id ? 'white' : textCol,
                    backdropFilter:'blur(8px)',
                  }}
                >{p.emoji} {p.label}</button>
              ))}
              <button onClick={toggleFullscreen}
                style={{ padding:'6px 10px', borderRadius:8, border:'none', cursor:'pointer',
                  background: isBackgrounded?'rgba(255,255,255,0.15)':'var(--bg-card)',
                  color:textCol, fontSize:'0.8rem', backdropFilter:'blur(8px)',
                }}>
                {fullscreen ? '⊠' : '⛶'}
              </button>
            </div>
          </div>

          {/* Scene picker */}
          {panel === 'ambience' && (
            <div style={panelStyle}>
              <div style={{ fontSize:'0.75rem', fontWeight:600, color:mutedCol, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Animated background</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {SCENES.map(s => (
                  <button key={s.id} onClick={() => setScene(s.id)}
                    style={{
                      padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer',
                      fontWeight:600, fontSize:'0.8rem',
                      background: scene===s.id ? 'var(--accent)' : isBackgrounded?'rgba(255,255,255,0.12)':'var(--bg-card)',
                      color: scene===s.id ? 'white' : textCol,
                    }}>
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sounds picker */}
          {panel === 'sounds' && (
            <div style={panelStyle}>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:'0.75rem', fontWeight:600, color:mutedCol, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>🎶 Ambient (plays while running)</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {TIMER_SOUNDS.map(s => (
                    <button key={s.id} onClick={() => setAmbientSound(s.id)}
                      style={{ padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer',
                        fontWeight:600, fontSize:'0.8rem',
                        background: ambientSound===s.id?'var(--accent)':isBackgrounded?'rgba(255,255,255,0.12)':'var(--bg-card)',
                        color: ambientSound===s.id?'white':textCol,
                      }}>
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>
                {ambientSound !== 'none' && timer.cdRunning && (
                  <div style={{ marginTop:6, fontSize:'0.72rem', color:'#4ade80' }}>● Playing</div>
                )}
              </div>
              <div>
                <div style={{ fontSize:'0.75rem', fontWeight:600, color:mutedCol, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>🔔 Alert sound (when timer ends)</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                  {ALERT_SOUNDS.map(s => (
                    <button key={s.id} onClick={() => setAlertSound(s.id)}
                      style={{ padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer',
                        fontWeight:600, fontSize:'0.8rem',
                        background: alertSound===s.id?'#e67e22':isBackgrounded?'rgba(255,255,255,0.12)':'var(--bg-card)',
                        color: alertSound===s.id?'white':textCol,
                      }}>
                      {s.label}
                    </button>
                  ))}
                  <button onClick={playAlert}
                    style={{ padding:'5px 10px', borderRadius:8, border:'none', cursor:'pointer', fontSize:'0.75rem',
                      background: isBackgrounded?'rgba(255,255,255,0.1)':'var(--bg-hover)', color:textCol }}>
                    Test ▶
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Music picker */}
          {panel === 'music' && (
            <div style={panelStyle}>
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', color:mutedCol, fontSize:'0.85rem', marginBottom:12 }}>
                <input type="checkbox" checked={timer.musicAutoStop||false} onChange={e=>timer.setMusicAutoStop(e.target.checked)} />
                Stop music when timer ends
              </label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
                {PLAYLISTS.map(p => (
                  <button key={p.id} onClick={() => setPlaylist(playlist?.id===p.id?null:p)}
                    style={{ padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer',
                      fontWeight:600, fontSize:'0.8rem',
                      background: playlist?.id===p.id?'var(--accent)':isBackgrounded?'rgba(255,255,255,0.12)':'var(--bg-card)',
                      color: playlist?.id===p.id?'white':textCol,
                    }}>
                    {p.label}
                  </button>
                ))}
              </div>
              {playlist && (
                <iframe key={playlist.id} width="100%" height="80"
                  src={`https://www.youtube.com/embed/${playlist.vid}?autoplay=1&controls=1`}
                  allow="autoplay; encrypted-media"
                  style={{ border:'none', borderRadius:8, display:'block', maxWidth:480 }}
                />
              )}
            </div>
          )}

          {/* Tabs */}
          <div style={{
            display:'flex', gap:0, padding:'0.85rem 1.25rem 0',
            background: isBackgrounded ? 'rgba(0,0,0,0.3)' : 'var(--bg-surface)',
          }}>
            {['countdown','stopwatch','alarm'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding:'7px 18px', border:'none', cursor:'pointer',
                fontWeight:600, textTransform:'capitalize', fontSize:'0.88rem',
                background: tab===t ? 'var(--accent)' : 'transparent',
                color: tab===t ? 'white' : mutedCol,
                borderRadius:'8px 8px 0 0', transition:'all 0.18s',
              }}>{t}</button>
            ))}
          </div>

          {/* Main area */}
          <div style={{ padding:'2rem 1.5rem', display:'flex', flexDirection:'column', alignItems:'center', gap:'1.75rem', minHeight:380 }}>

            {/* COUNTDOWN */}
            {tab === 'countdown' && (<>
              <div style={{ position:'relative', width:220, height:220 }}>
                <svg width="220" height="220" style={{ transform:'rotate(-90deg)', filter: isBackgrounded?'drop-shadow(0 0 12px rgba(124,58,237,0.5))':'none' }}>
                  <circle cx="110" cy="110" r="90" fill="none"
                    stroke={isBackgrounded?'rgba(255,255,255,0.12)':'var(--bg-hover)'} strokeWidth="10" />
                  <circle cx="110" cy="110" r="90" fill="none"
                    stroke={timer.cdFinished?'#ef4444':'var(--accent)'}
                    strokeWidth="10" strokeDasharray={circum}
                    strokeDashoffset={circum*(1-cdPct/100)}
                    strokeLinecap="round"
                    style={{ transition:'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6 }}>
                  <span style={{ fontSize:'2.6rem', fontWeight:800, color:textCol, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em' }}>
                    {fmt(timer.cdRemaining)}
                  </span>
                  {timer.cdFinished && (
                    <button onClick={()=>{stopAlert();timer.cdReset();stopSound()}}
                      style={{ padding:'5px 14px', borderRadius:8, border:'none', cursor:'pointer',
                        background:'#ef4444', color:'white', fontWeight:700, fontSize:'0.8rem' }}>
                      ✓ Dismiss
                    </button>
                  )}
                  {ambientSound!=='none' && timer.cdRunning && !timer.cdFinished && (
                    <span style={{ fontSize:'0.7rem', color:mutedCol }}>
                      {TIMER_SOUNDS.find(s=>s.id===ambientSound)?.emoji} playing
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', justifyContent:'center' }}>
                {PRESETS.map(p => (
                  <button key={p.s} onClick={()=>timer.cdSetPreset(p.s)}
                    style={{ padding:'6px 14px', borderRadius:8, border:'none', cursor:'pointer',
                      fontWeight:600, fontSize:'0.82rem',
                      background: isBackgrounded?'rgba(255,255,255,0.14)':'var(--bg-card)',
                      color:textCol }}>
                    {p.label}
                  </button>
                ))}
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <input type="number" placeholder="Custom" value={customMins}
                    onChange={e=>setCustomMins(e.target.value)} min="1" max="999"
                    style={{ width:76, padding:'6px 10px', borderRadius:8,
                      border:`1px solid ${isBackgrounded?'rgba(255,255,255,0.2)':'var(--border)'}`,
                      background: isBackgrounded?'rgba(0,0,0,0.35)':'var(--bg-input)',
                      color:textCol, fontSize:'0.82rem', outline:'none' }}
                  />
                  <button onClick={()=>{if(customMins)timer.cdSetPreset(parseInt(customMins)*60)}}
                    style={{ padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer',
                      background:'var(--accent)', color:'white', fontWeight:700, fontSize:'0.82rem' }}>
                    Set
                  </button>
                </div>
              </div>

              <div style={{ display:'flex', gap:10 }}>
                {!timer.cdRunning ? (
                  <button onClick={timer.cdStart} style={bigBtn('var(--accent)')}>▶ Start</button>
                ) : (
                  <button onClick={timer.cdPause} style={bigBtn('#e67e22')}>⏸ Pause</button>
                )}
                <button onClick={()=>{timer.cdReset();stopSound();stopAlert()}} style={bigBtn(isBackgrounded?'rgba(255,255,255,0.18)':'var(--bg-card)', textCol)}>↺ Reset</button>
              </div>
            </>)}

            {/* STOPWATCH */}
            {tab === 'stopwatch' && (<>
              <div style={{ fontSize:'3.75rem', fontWeight:800, color:textCol, fontVariantNumeric:'tabular-nums',
                letterSpacing:'-0.03em', textShadow: isBackgrounded?'0 2px 20px rgba(0,0,0,0.5)':'none' }}>
                {fmt(timer.swElapsed)}
              </div>
              <div style={{ display:'flex', gap:10 }}>
                {!timer.swRunning ? (
                  <button onClick={timer.swStart} style={bigBtn('var(--accent)')}>▶ Start</button>
                ) : (<>
                  <button onClick={timer.swPause} style={bigBtn('#e67e22')}>⏸ Pause</button>
                  <button onClick={timer.swLap}   style={bigBtn('#1a5276')}>🏁 Lap</button>
                </>)}
                <button onClick={timer.swReset} style={bigBtn(isBackgrounded?'rgba(255,255,255,0.18)':'var(--bg-card)', textCol)}>↺</button>
              </div>
              {timer.swLaps?.length > 0 && (
                <div style={{ width:'100%', maxWidth:300 }}>
                  <div style={{ fontSize:'0.8rem', fontWeight:600, color:mutedCol, marginBottom:8 }}>Laps</div>
                  <div style={{ maxHeight:160, overflowY:'auto', display:'flex', flexDirection:'column', gap:4 }}>
                    {timer.swLaps.map((lap,i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 12px',
                        background: isBackgrounded?'rgba(255,255,255,0.1)':'var(--bg-surface)', borderRadius:8 }}>
                        <span style={{ fontSize:'0.82rem', color:mutedCol }}>Lap {i+1}</span>
                        <span style={{ fontSize:'0.82rem', fontWeight:700, color:textCol, fontVariantNumeric:'tabular-nums' }}>{fmt(lap)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>)}

            {/* ALARM */}
            {tab === 'alarm' && (<>
              {timer.alarmFired && (
                <div style={{ padding:'1rem 1.5rem', background:'rgba(239,68,68,0.2)', border:'1px solid #ef4444',
                  borderRadius:12, color:'#ef4444', fontWeight:700, fontSize:'1.1rem', textAlign:'center' }}>
                  ⏰ Alarm!
                  <button onClick={timer.clearAlarm}
                    style={{ marginLeft:12, padding:'4px 12px', borderRadius:8, border:'none', cursor:'pointer',
                      background:'#ef4444', color:'white', fontWeight:700 }}>
                    Dismiss
                  </button>
                </div>
              )}
              {timer.alarmTarget && !timer.alarmFired && (
                <div style={{ padding:'10px 16px', background: isBackgrounded?'rgba(255,255,255,0.1)':'var(--bg-surface)',
                  borderRadius:10, color:textCol, fontSize:'0.9rem', display:'flex', alignItems:'center', gap:12 }}>
                  ⏰ {timer.alarmTarget.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                  <button onClick={timer.clearAlarm}
                    style={{ padding:'3px 10px', borderRadius:8, border:'none', cursor:'pointer', fontSize:'0.75rem',
                      background: isBackgrounded?'rgba(255,255,255,0.2)':'var(--bg-hover)', color:textCol }}>
                    Clear
                  </button>
                </div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:14, width:'100%', maxWidth:320 }}>
                <div style={{ background: isBackgrounded?'rgba(255,255,255,0.1)':'var(--bg-surface)',
                  borderRadius:12, padding:'1.1rem', border:`1px solid ${isBackgrounded?'rgba(255,255,255,0.12)':'var(--border)'}` }}>
                  <div style={{ fontWeight:700, color:textCol, marginBottom:10, fontSize:'0.92rem' }}>⏰ Set clock time</div>
                  <div style={{ display:'flex', gap:10 }}>
                    <input type="time" value={alarmTime} onChange={e=>setAlarmTime(e.target.value)}
                      style={{ flex:1, padding:'8px 10px', borderRadius:8,
                        border:`1px solid ${isBackgrounded?'rgba(255,255,255,0.2)':'var(--border)'}`,
                        background: isBackgrounded?'rgba(0,0,0,0.3)':'var(--bg-input)',
                        color:textCol, fontSize:'0.95rem', outline:'none' }} />
                    <button onClick={() => {
                      if (!alarmTime) return
                      const [h,m] = alarmTime.split(':').map(Number)
                      const t = new Date(); t.setHours(h,m,0,0)
                      if (t < new Date()) t.setDate(t.getDate()+1)
                      timer.setAlarm(t)
                    }} style={bigBtn('var(--accent)')}>Set</button>
                  </div>
                </div>
                <div style={{ background: isBackgrounded?'rgba(255,255,255,0.1)':'var(--bg-surface)',
                  borderRadius:12, padding:'1.1rem', border:`1px solid ${isBackgrounded?'rgba(255,255,255,0.12)':'var(--border)'}` }}>
                  <div style={{ fontWeight:700, color:textCol, marginBottom:10, fontSize:'0.92rem' }}>⏱ Countdown alarm</div>
                  <div style={{ display:'flex', gap:10 }}>
                    <input type="number" placeholder="Minutes" value={alarmCountdown}
                      onChange={e=>setAlarmCountdown(e.target.value)} min="1"
                      style={{ flex:1, padding:'8px 10px', borderRadius:8,
                        border:`1px solid ${isBackgrounded?'rgba(255,255,255,0.2)':'var(--border)'}`,
                        background: isBackgrounded?'rgba(0,0,0,0.3)':'var(--bg-input)',
                        color:textCol, fontSize:'0.95rem', outline:'none' }} />
                    <button onClick={() => {
                      const m = parseInt(alarmCountdown)
                      if (m>0) timer.setAlarm(new Date(Date.now()+m*60000))
                    }} style={bigBtn('var(--accent)')}>Set</button>
                  </div>
                </div>
              </div>
            </>)}
          </div>
        </div>
      </div>
    </>
  )
}

function bigBtn(bg, color='white') {
  return {
    background:bg, color, border:'none', borderRadius:10,
    padding:'10px 24px', cursor:'pointer', fontWeight:700,
    fontSize:'0.95rem', transition:'opacity 0.15s',
  }
}
