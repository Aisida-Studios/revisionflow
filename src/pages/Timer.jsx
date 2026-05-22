// src/pages/Timer.jsx
import { useState, useEffect, useRef } from 'react'
import { useTimer } from '../context/TimerContext'
import { TIMER_SOUNDS, startSound, stopSound, playSessionEndBell } from '../utils/timerSounds'
import { awardTimerXP, recordActivityStreak } from '../utils/firestore'
import { useAuth } from '../context/AuthContext'

function fmt(s) {
  const h   = Math.floor(s / 3600)
  const m   = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

const PRESETS = [
  { label:'5 min',  s:300  },
  { label:'10 min', s:600  },
  { label:'15 min', s:900  },
  { label:'25 min', s:1500 },
  { label:'30 min', s:1800 },
  { label:'45 min', s:2700 },
  { label:'60 min', s:3600 },
  { label:'90 min', s:5400 },
]

// Real animated nature backgrounds using free Unsplash/Pexels video sources
// Each has a CSS fallback gradient for when video hasn't loaded yet
const AMBIENTS = [
  {
    id: 'forest',
    label: '🌲 Forest',
    fallback: 'radial-gradient(ellipse at 30% 70%, #0d2b1a 0%, #051508 100%)',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
    overlay: 'rgba(0,8,0,0.45)',
  },
  {
    id: 'rain',
    label: '🌧 Rain',
    fallback: 'linear-gradient(160deg, #0d1b2a 0%, #060e16 100%)',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-surface-of-a-lake-18312-large.mp4',
    overlay: 'rgba(0,5,15,0.5)',
  },
  {
    id: 'ocean',
    label: '🌊 Ocean',
    fallback: 'radial-gradient(ellipse at 50% 0%, #0a3d62 0%, #020b13 100%)',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
    overlay: 'rgba(0,10,30,0.45)',
  },
  {
    id: 'campfire',
    label: '🔥 Campfire',
    fallback: 'radial-gradient(ellipse at 50% 80%, #3d1c0a 0%, #080301 100%)',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-campfire-at-night-in-forest-4919-large.mp4',
    overlay: 'rgba(5,2,0,0.4)',
  },
  {
    id: 'aurora',
    label: '✨ Aurora',
    fallback: 'linear-gradient(135deg, #0d2b1a 0%, #0a1a2e 50%, #1a0a2e 100%)',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-stars-and-galaxies-backgrounds-1166-large.mp4',
    overlay: 'rgba(0,2,10,0.4)',
  },
  {
    id: 'meadow',
    label: '🌿 Meadow',
    fallback: 'linear-gradient(160deg, #1a3a1a 0%, #051405 100%)',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-green-plants-and-vegetation-near-the-sea-14082-large.mp4',
    overlay: 'rgba(0,10,0,0.4)',
  },
  {
    id: 'waterfall',
    label: '💧 Waterfall',
    fallback: 'linear-gradient(180deg, #0a2a3a 0%, #020d16 100%)',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-forest-2213-large.mp4',
    overlay: 'rgba(0,8,15,0.45)',
  },
  {
    id: 'snow',
    label: '❄️ Snow',
    fallback: 'linear-gradient(180deg, #1a2a3a 0%, #0d1525 100%)',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-snowfall-6785-large.mp4',
    overlay: 'rgba(5,10,20,0.45)',
  },
  {
    id: 'sunset',
    label: '🌅 Sunset',
    fallback: 'linear-gradient(180deg, #ff6b35 0%, #6c1a2a 80%, #2c0a1a 100%)',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-sunset-on-a-calm-sea-4369-large.mp4',
    overlay: 'rgba(15,2,0,0.4)',
  },
  {
    id: 'none',
    label: '✕ None',
    fallback: '',
    video: null,
    overlay: null,
  },
]

const PLAYLISTS = [
  { id:'lofi',       label:'☕ Lo-fi Study',  vid:'jfKfPfyJRdk' },
  { id:'classical',  label:'🎻 Classical',    vid:'mDDP91JGJl4' },
  { id:'rain',       label:'🌧 Rain Sounds',  vid:'q76bMs-NwRk' },
  { id:'ambient',    label:'🌌 Ambient',      vid:'HGl75kurxok' },
  { id:'piano',      label:'🎹 Piano',        vid:'UF9uh7MNqkY' },
  { id:'brownnoise', label:'🎧 Brown Noise',  vid:'RqzGzwTY-6w' },
]

const ALERT_SOUNDS = [
  { id:'bell',   label:'🔔 Bell'   },
  { id:'chime',  label:'🎵 Chime'  },
  { id:'beep',   label:'📟 Beep'   },
  { id:'gentle', label:'🌙 Gentle' },
]

export default function Timer() {
  const timer = useTimer()
  const { user } = useAuth()
  const [tab,              setTab]              = useState('countdown')
  const [ambient,          setAmbient]          = useState('none')
  const [uploadedBg,       setUploadedBg]       = useState(null)
  const [alertSound,       setAlertSound]       = useState('bell')
  const [ambientSound,     setAmbientSound]     = useState('none')
  const [showAmbient,      setShowAmbient]      = useState(false)
  const [showMusic,        setShowMusic]        = useState(false)
  const [showSounds,       setShowSounds]       = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [isFullscreen,     setIsFullscreen]     = useState(false)
  const [customMinutes,    setCustomMinutes]    = useState('')
  const [alarmTime,        setAlarmTime]        = useState('')
  const [alarmCountdown,   setAlarmCountdown]   = useState('')
  const [videoLoaded,      setVideoLoaded]      = useState(false)
  const containerRef = useRef(null)
  const videoRef     = useRef(null)

  const currentAmbient = AMBIENTS.find(a => a.id === ambient) || AMBIENTS[AMBIENTS.length - 1]

  // ── Video background: load/unload when ambient changes ───────────────────
  useEffect(() => {
    setVideoLoaded(false)
    if (videoRef.current) {
      videoRef.current.load()
    }
  }, [ambient])

  // ── Ambient sound: start/stop when selection or timer running state changes ──
  useEffect(() => {
    if (timer.cdRunning && ambientSound !== 'none') {
      startSound(ambientSound)
    } else {
      stopSound()
    }
    return () => stopSound()
  }, [ambientSound, timer.cdRunning])

  // ── Alert sound when timer finishes ──
  const prevSignal = useRef(timer.timerFinishedSignal)
  const alertInterval = useRef(null)

  function startLoopingAlert() {
    playAlertSound()
    alertInterval.current = setInterval(playAlertSound, 2500)
  }
  function stopLoopingAlert() {
    if (alertInterval.current) { clearInterval(alertInterval.current); alertInterval.current = null }
  }

  useEffect(() => {
    if (timer.timerFinishedSignal !== prevSignal.current) {
      prevSignal.current = timer.timerFinishedSignal
      startLoopingAlert()
      stopSound()
      if (timer.musicAutoStop && selectedPlaylist) setSelectedPlaylist(null)
      if (user && timer.cdTotal > 0) {
        const minutes = Math.floor(timer.cdTotal / 60)
        awardTimerXP(user.uid, minutes).catch(() => {})
        recordActivityStreak(user.uid).catch(() => {})
      }
    }
  }, [timer.timerFinishedSignal])

  useEffect(() => () => stopLoopingAlert(), [])

  function playAlertSound() {
    try {
      const ctx   = new (window.AudioContext || window.webkitAudioContext)()
      const freqs = { bell: 880, chime: 1046, beep: 440, gentle: 528 }
      const freq  = freqs[alertSound] || 880
      const isBeep = alertSound === 'beep'
      const PULSES = 3, PULSE_DUR = 0.6, PULSE_GAP = 0.8
      for (let i = 0; i < PULSES; i++) {
        const startAt = ctx.currentTime + i * PULSE_GAP
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.frequency.value = isBeep ? freq : freq * (1 + i * 0.05)
        osc.type = isBeep ? 'square' : 'sine'
        gain.gain.setValueAtTime(0, startAt)
        gain.gain.linearRampToValueAtTime(0.35, startAt + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, startAt + PULSE_DUR)
        osc.start(startAt); osc.stop(startAt + PULSE_DUR)
      }
    } catch (e) {}
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  function handleBgUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadedBg(URL.createObjectURL(file))
    setAmbient('upload')
  }

  function setAlarmFromTime() {
    if (!alarmTime) return
    const [h, m] = alarmTime.split(':').map(Number)
    const target = new Date()
    target.setHours(h, m, 0, 0)
    if (target < new Date()) target.setDate(target.getDate() + 1)
    timer.setAlarm(target)
  }

  function setAlarmFromCountdown() {
    const mins = parseInt(alarmCountdown)
    if (!mins || mins <= 0) return
    timer.setAlarm(new Date(Date.now() + mins * 60000))
  }

  // Background style for the upload case
  const uploadBgStyle = ambient === 'upload' && uploadedBg
    ? { backgroundImage:`url(${uploadedBg})`, backgroundSize:'cover', backgroundPosition:'center' }
    : null

  const cdPct         = timer.cdTotal > 0 ? (timer.cdRemaining / timer.cdTotal) * 100 : 0
  const circumference = 2 * Math.PI * 90
  const hasVideo      = currentAmbient.video && ambient !== 'upload' && ambient !== 'none'

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: isFullscreen ? 0 : undefined,
        background: uploadBgStyle ? undefined : (currentAmbient.fallback || 'var(--bg-base)'),
        ...uploadBgStyle,
        transition: 'background 0.5s',
      }}
    >
      {/* ── Animated video background ── */}
      {hasVideo && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={() => setVideoLoaded(true)}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: videoLoaded ? 1 : 0,
            transition: 'opacity 1.2s ease',
            zIndex: 0,
          }}
        >
          <source src={currentAmbient.video} type="video/mp4" />
        </video>
      )}

      {/* ── Overlay for readability ── */}
      {(hasVideo || uploadBgStyle) && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: hasVideo ? currentAmbient.overlay : 'rgba(0,0,0,0.3)',
        }} />
      )}

      {/* ── All content sits above the video ── */}
      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* ── Top bar ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1.5rem', background:'rgba(0,0,0,0.35)', backdropFilter:'blur(12px)', flexWrap:'wrap', gap:8 }}>
          <h2 style={{ margin:0, color:'white', fontSize:'1.25rem', fontWeight:700 }}>⏱ Timer</h2>
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
            <button onClick={() => { setShowSounds(!showSounds); setShowAmbient(false); setShowMusic(false) }} style={btnStyle('#1a6b4a')}>🎶 Sounds</button>
            <button onClick={() => { setShowAmbient(!showAmbient); setShowSounds(false); setShowMusic(false) }} style={btnStyle('#6c3483')}>🎨 Ambience</button>
            <button onClick={() => { setShowMusic(!showMusic); setShowSounds(false); setShowAmbient(false) }} style={btnStyle('#1a5276')}>🎵 Music</button>
            <button onClick={toggleFullscreen} style={btnStyle('#1e8449')}>{isFullscreen ? '⊠ Exit' : '⛶ Full'}</button>
          </div>
        </div>

        {/* ── Sounds panel ── */}
        {showSounds && (
          <div style={{ padding:'1rem 1.5rem', background:'rgba(0,0,0,0.6)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ marginBottom:12 }}>
              <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.8rem', fontWeight:600, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                🎶 Ambient sound (plays while timer runs)
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
                {TIMER_SOUNDS.map(s => (
                  <button key={s.id} onClick={() => setAmbientSound(s.id)}
                    style={{ ...btnStyle(ambientSound === s.id ? 'var(--accent)' : '#333'), fontSize:'0.8rem', padding:'0.3rem 0.75rem' }}>
                    {s.emoji} {s.label}
                  </button>
                ))}
              </div>
              {ambientSound !== 'none' && timer.cdRunning && (
                <p style={{ color:'#4ade80', fontSize:'0.75rem', marginTop:6 }}>● Playing now</p>
              )}
            </div>
            <div>
              <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.8rem', fontWeight:600, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                🔔 Alert sound (plays when timer ends)
              </div>
              <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', alignItems:'center' }}>
                {ALERT_SOUNDS.map(s => (
                  <button key={s.id} onClick={() => setAlertSound(s.id)}
                    style={{ ...btnStyle(alertSound === s.id ? '#e67e22' : '#333'), fontSize:'0.8rem', padding:'0.3rem 0.75rem' }}>
                    {s.label}
                  </button>
                ))}
                <button onClick={playAlertSound} style={{ ...btnStyle('#555'), fontSize:'0.75rem', padding:'0.25rem 0.6rem' }}>Test ▶</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Ambience panel ── */}
        {showAmbient && (
          <div style={{ padding:'1rem 1.5rem', background:'rgba(0,0,0,0.6)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.8rem', fontWeight:600, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>
              Animated backgrounds
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginBottom:'0.75rem' }}>
              {AMBIENTS.map(a => (
                <button key={a.id} onClick={() => setAmbient(a.id)}
                  style={{ ...btnStyle(ambient === a.id ? 'var(--accent)' : '#333'), fontSize:'0.8rem', padding:'0.3rem 0.7rem' }}>
                  {a.label}
                </button>
              ))}
            </div>
            <label style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.85rem', cursor:'pointer' }}>
              📁 Upload image:
              <input type="file" accept="image/*" onChange={handleBgUpload} style={{ marginLeft:'0.5rem' }} />
            </label>
          </div>
        )}

        {/* ── Music panel ── */}
        {showMusic && (
          <div style={{ padding:'1rem 1.5rem', background:'rgba(0,0,0,0.6)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'0.75rem' }}>
              <label style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <input type="checkbox" checked={timer.musicAutoStop} onChange={e => timer.setMusicAutoStop(e.target.checked)} />
                Auto-stop music when timer finishes
              </label>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginBottom:'0.75rem' }}>
              {PLAYLISTS.map(p => (
                <button key={p.id} onClick={() => setSelectedPlaylist(selectedPlaylist?.id === p.id ? null : p)}
                  style={{ ...btnStyle(selectedPlaylist?.id === p.id ? 'var(--accent)' : '#333'), fontSize:'0.8rem' }}>
                  {p.label}
                </button>
              ))}
            </div>
            {selectedPlaylist && (
              <div style={{ borderRadius:8, overflow:'hidden', maxWidth:480 }}>
                <iframe key={selectedPlaylist.id} width="100%" height="80"
                  src={`https://www.youtube.com/embed/${selectedPlaylist.vid}?autoplay=1&controls=1`}
                  allow="autoplay; encrypted-media"
                  style={{ border:'none', display:'block' }}
                />
              </div>
            )}
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{ display:'flex', gap:0, padding:'1rem 1.5rem 0', background:'rgba(0,0,0,0.25)' }}>
          {['countdown','stopwatch','alarm'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:'0.6rem 1.2rem', border:'none', cursor:'pointer', fontWeight:600,
              textTransform:'capitalize', fontSize:'0.9rem',
              background: tab === t ? 'var(--accent)' : 'transparent',
              color:       tab === t ? 'white' : 'rgba(255,255,255,0.6)',
              borderRadius:'8px 8px 0 0', transition:'all 0.2s',
            }}>{t}</button>
          ))}
        </div>

        {/* ── Main content ── */}
        <div style={{ padding:'2rem 1.5rem', display:'flex', flexDirection:'column', alignItems:'center', gap:'1.5rem', minHeight:400 }}>

          {/* ── COUNTDOWN ── */}
          {tab === 'countdown' && (
            <>
              <div style={{ position:'relative', width:220, height:220 }}>
                <svg width="220" height="220" style={{ transform:'rotate(-90deg)' }}>
                  <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
                  <circle cx="110" cy="110" r="90" fill="none"
                    stroke={timer.cdFinished ? '#e74c3c' : 'var(--accent)'}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - cdPct / 100)}
                    strokeLinecap="round"
                    style={{ transition:'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:'2.5rem', fontWeight:700, color:'white', fontVariantNumeric:'tabular-nums' }}>
                    {fmt(timer.cdRemaining)}
                  </span>
                  {timer.cdFinished && (
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
                      <span style={{ color:'#e74c3c', fontSize:'0.85rem', fontWeight:600 }}>Finished!</span>
                      <button onClick={()=>{stopLoopingAlert();timer.cdReset();stopSound()}}
                        style={{...btnStyle('#e74c3c'),fontSize:'0.75rem',padding:'4px 12px'}}>
                        ✓ Dismiss
                      </button>
                    </div>
                  )}
                  {ambientSound !== 'none' && timer.cdRunning && (
                    <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.7rem', marginTop:4 }}>
                      {TIMER_SOUNDS.find(s => s.id === ambientSound)?.emoji} playing
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', justifyContent:'center' }}>
                {PRESETS.map(p => (
                  <button key={p.s} onClick={() => timer.cdSetPreset(p.s)}
                    style={{ ...btnStyle('#333'), fontSize:'0.8rem', padding:'0.3rem 0.75rem' }}>
                    {p.label}
                  </button>
                ))}
                <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                  <input type="number" placeholder="Custom min" value={customMinutes}
                    onChange={e => setCustomMinutes(e.target.value)}
                    style={{ width:90, padding:'0.3rem 0.5rem', borderRadius:6, border:'1px solid rgba(255,255,255,0.2)', background:'rgba(0,0,0,0.4)', color:'white', fontSize:'0.8rem' }} />
                  <button onClick={() => { if (customMinutes) timer.cdSetPreset(parseInt(customMinutes) * 60) }}
                    style={{ ...btnStyle('var(--accent)'), fontSize:'0.8rem', padding:'0.3rem 0.7rem' }}>Set</button>
                </div>
              </div>

              <div style={{ display:'flex', gap:'0.75rem' }}>
                {!timer.cdRunning ? (
                  <button onClick={timer.cdStart} style={bigBtn('var(--accent)')}>▶ Start</button>
                ) : (
                  <button onClick={timer.cdPause} style={bigBtn('#e67e22')}>⏸ Pause</button>
                )}
                <button onClick={() => { timer.cdReset(); stopSound() }} style={bigBtn('#555')}>↺ Reset</button>
              </div>
            </>
          )}

          {/* ── STOPWATCH ── */}
          {tab === 'stopwatch' && (
            <>
              <div style={{ fontSize:'3.5rem', fontWeight:700, color:'white', fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em' }}>
                {fmt(timer.swElapsed)}
              </div>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                {!timer.swRunning ? (
                  <button onClick={timer.swStart} style={bigBtn('var(--accent)')}>▶ Start</button>
                ) : (
                  <>
                    <button onClick={timer.swPause} style={bigBtn('#e67e22')}>⏸ Pause</button>
                    <button onClick={timer.swLap}   style={bigBtn('#1a5276')}>🏁 Lap</button>
                  </>
                )}
                <button onClick={timer.swReset} style={bigBtn('#555')}>↺ Reset</button>
              </div>
              {timer.swLaps.length > 0 && (
                <div style={{ width:'100%', maxWidth:320 }}>
                  <h4 style={{ color:'rgba(255,255,255,0.6)', margin:'0 0 0.5rem', fontSize:'0.85rem' }}>Laps</h4>
                  <div style={{ maxHeight:180, overflowY:'auto', display:'flex', flexDirection:'column', gap:'0.25rem' }}>
                    {timer.swLaps.map((lap, i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'0.35rem 0.75rem', background:'rgba(255,255,255,0.08)', borderRadius:6 }}>
                        <span style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.85rem' }}>Lap {i+1}</span>
                        <span style={{ color:'white', fontWeight:600, fontSize:'0.85rem', fontVariantNumeric:'tabular-nums' }}>{fmt(lap)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── ALARM ── */}
          {tab === 'alarm' && (
            <>
              {timer.alarmFired && (
                <div style={{ padding:'1rem 1.5rem', background:'#e74c3c22', border:'1px solid #e74c3c', borderRadius:10, color:'#e74c3c', fontWeight:600, fontSize:'1.1rem', textAlign:'center' }}>
                  ⏰ Alarm!
                  <button onClick={timer.clearAlarm} style={{ marginLeft:'1rem', ...btnStyle('#e74c3c'), fontSize:'0.85rem' }}>Dismiss</button>
                </div>
              )}
              {timer.alarmTarget && !timer.alarmFired && (
                <div style={{ padding:'0.75rem 1.25rem', background:'rgba(255,255,255,0.08)', borderRadius:8, color:'rgba(255,255,255,0.8)', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'1rem' }}>
                  ⏰ Set for {timer.alarmTarget.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                  <button onClick={timer.clearAlarm} style={{ ...btnStyle('#555'), fontSize:'0.75rem', padding:'0.2rem 0.5rem' }}>Clear</button>
                </div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem', width:'100%', maxWidth:340 }}>
                <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:10, padding:'1.25rem' }}>
                  <h4 style={{ margin:'0 0 0.75rem', color:'white', fontSize:'0.95rem' }}>⏰ Set clock time</h4>
                  <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
                    <input type="time" value={alarmTime} onChange={e => setAlarmTime(e.target.value)}
                      style={{ flex:1, padding:'0.5rem', borderRadius:6, border:'1px solid rgba(255,255,255,0.2)', background:'rgba(0,0,0,0.4)', color:'white', fontSize:'1rem' }} />
                    <button onClick={setAlarmFromTime} style={bigBtn('var(--accent)')}>Set</button>
                  </div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:10, padding:'1.25rem' }}>
                  <h4 style={{ margin:'0 0 0.75rem', color:'white', fontSize:'0.95rem' }}>⏱ Countdown alarm</h4>
                  <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
                    <input type="number" placeholder="Minutes" value={alarmCountdown} onChange={e => setAlarmCountdown(e.target.value)} min="1"
                      style={{ flex:1, padding:'0.5rem', borderRadius:6, border:'1px solid rgba(255,255,255,0.2)', background:'rgba(0,0,0,0.4)', color:'white', fontSize:'1rem' }} />
                    <button onClick={setAlarmFromCountdown} style={bigBtn('var(--accent)')}>Set</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function btnStyle(bg) {
  return {
    background:bg, color:'white', border:'none', borderRadius:8,
    padding:'0.4rem 0.9rem', cursor:'pointer', fontWeight:600, fontSize:'0.85rem',
    transition:'opacity 0.15s',
  }
}
function bigBtn(bg) {
  return {
    background:bg, color:'white', border:'none', borderRadius:10,
    padding:'0.65rem 1.5rem', cursor:'pointer', fontWeight:700, fontSize:'1rem',
    transition:'opacity 0.15s',
  }
}
