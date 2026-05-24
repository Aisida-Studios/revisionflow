// src/utils/timerSounds.js
// All ambient sounds generated via Web Audio API — no external files needed

let audioCtx = null
const activeNodes = []
let masterGainNode = null

function getCtx() {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    masterGainNode = audioCtx.createGain()
    masterGainNode.gain.value = 0.6
    masterGainNode.connect(audioCtx.destination)
  }
  return audioCtx
}

function getMaster() {
  getCtx()
  return masterGainNode
}

function stopAll() {
  activeNodes.forEach(n => {
    try { n.stop() } catch(e) {}
    try { n.disconnect() } catch(e) {}
  })
  activeNodes.length = 0
  if (audioCtx && audioCtx.state !== 'closed') {
    try { audioCtx.suspend() } catch(e) {}
  }
}

// ── Noise buffer helper ──────────────────────────────────────────
function makeNoise(ctx, seconds, amplitude = 1) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate)
  const data   = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * amplitude
  const src = ctx.createBufferSource()
  src.buffer = buffer
  src.loop   = true
  return src
}

// ── Rain ─────────────────────────────────────────────────────────
function playRain(master) {
  const ctx = getCtx()

  // Heavy rain — wide bandpass noise
  const rain = makeNoise(ctx, 3, 1)
  const bp   = ctx.createBiquadFilter()
  bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 0.6
  const g = ctx.createGain(); g.gain.value = 0.55
  rain.connect(bp); bp.connect(g); g.connect(master)
  rain.start(); activeNodes.push(rain)

  // High drip layer
  const drip = makeNoise(ctx, 2, 0.4)
  const hp   = ctx.createBiquadFilter()
  hp.type = 'highpass'; hp.frequency.value = 3000
  const gd = ctx.createGain(); gd.gain.value = 0.25
  drip.connect(hp); hp.connect(gd); gd.connect(master)
  drip.start(); activeNodes.push(drip)

  // Low rumble
  const rumble = makeNoise(ctx, 4, 0.5)
  const lp     = ctx.createBiquadFilter()
  lp.type = 'lowpass'; lp.frequency.value = 120
  const gr = ctx.createGain(); gr.gain.value = 0.3
  rumble.connect(lp); lp.connect(gr); gr.connect(master)
  rumble.start(); activeNodes.push(rumble)
}

// ── Ocean waves ──────────────────────────────────────────────────
function playOcean(master) {
  const ctx = getCtx()

  // Deep base noise
  const base = makeNoise(ctx, 5, 1)
  const lp   = ctx.createBiquadFilter()
  lp.type = 'lowpass'; lp.frequency.value = 400
  const gBase = ctx.createGain(); gBase.gain.value = 0.5
  base.connect(lp); lp.connect(gBase); gBase.connect(master)
  base.start(); activeNodes.push(base)

  // Swoosh layer — slow LFO volume modulation simulating wave cycle
  const swoosh = makeNoise(ctx, 4, 0.8)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'; bp.frequency.value = 600; bp.Q.value = 1.2
  const gSwoosh = ctx.createGain(); gSwoosh.gain.value = 0
  swoosh.connect(bp); bp.connect(gSwoosh); gSwoosh.connect(master)
  swoosh.start(); activeNodes.push(swoosh)

  // LFO for wave rhythm (8-second wave cycle)
  const lfo = ctx.createOscillator()
  lfo.type = 'sine'; lfo.frequency.value = 0.12   // ~8s period
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.35
  lfo.connect(lfoGain); lfoGain.connect(gSwoosh.gain)
  gSwoosh.gain.setValueAtTime(0.35, ctx.currentTime)
  lfo.start(); activeNodes.push(lfo)

  // Foam hiss — high frequency filtered noise
  const foam = makeNoise(ctx, 3, 0.3)
  const hp   = ctx.createBiquadFilter()
  hp.type = 'highpass'; hp.frequency.value = 2500
  const gFoam = ctx.createGain(); gFoam.gain.value = 0.2
  foam.connect(hp); hp.connect(gFoam); gFoam.connect(master)
  foam.start(); activeNodes.push(foam)
}

// ── Brown noise ──────────────────────────────────────────────────
function playBrownNoise(master) {
  const ctx = getCtx()
  const sr  = ctx.sampleRate

  // Generate proper brown noise (integrated white noise)
  const buffer = ctx.createBuffer(1, sr * 4, sr)
  const data   = buffer.getChannelData(0)
  let lastOut  = 0
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1
    data[i] = (lastOut + 0.02 * white) / 1.02
    lastOut  = data[i]
    data[i] *= 3.5  // Compensate for quietness
  }

  const src = ctx.createBufferSource()
  src.buffer = buffer; src.loop = true
  const g = ctx.createGain(); g.gain.value = 0.8
  src.connect(g); g.connect(master)
  src.start(); activeNodes.push(src)
}

// ── Fireplace ────────────────────────────────────────────────────
function playFireplace(master) {
  const ctx = getCtx()

  // Crackling base — filtered noise
  const base = makeNoise(ctx, 3, 1)
  const bp   = ctx.createBiquadFilter()
  bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 0.5
  const gBase = ctx.createGain(); gBase.gain.value = 0.4
  base.connect(bp); bp.connect(gBase); gBase.connect(master)
  base.start(); activeNodes.push(base)

  // Low fire roar
  const roar = makeNoise(ctx, 4, 0.7)
  const lp   = ctx.createBiquadFilter()
  lp.type = 'lowpass'; lp.frequency.value = 200
  const gRoar = ctx.createGain(); gRoar.gain.value = 0.35
  roar.connect(lp); lp.connect(gRoar); gRoar.connect(master)
  roar.start(); activeNodes.push(roar)

  // High crackle
  const crackle = makeNoise(ctx, 2, 0.4)
  const hp      = ctx.createBiquadFilter()
  hp.type = 'highpass'; hp.frequency.value = 1800
  const gCrackle = ctx.createGain(); gCrackle.gain.value = 0.3
  crackle.connect(hp); hp.connect(gCrackle); gCrackle.connect(master)
  crackle.start(); activeNodes.push(crackle)

  // Slow LFO to simulate fire breathing
  const lfo = ctx.createOscillator()
  lfo.type = 'sine'; lfo.frequency.value = 0.3
  const lfoG = ctx.createGain(); lfoG.gain.value = 0.12
  lfo.connect(lfoG); lfoG.connect(gBase.gain)
  lfo.start(); activeNodes.push(lfo)

  // Random crackle pops
  function pop() {
    if (!audioCtx || audioCtx.state === 'closed') return
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sawtooth'
    o.frequency.value = 200 + Math.random() * 600
    g.gain.setValueAtTime(0.08 + Math.random() * 0.12, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)
    o.connect(g); g.connect(master)
    o.start(); o.stop(ctx.currentTime + 0.07)
    activeNodes.push(o)
    const t = setTimeout(pop, 300 + Math.random() * 1200)
    activeNodes.push({ stop: () => clearTimeout(t), disconnect: () => {} })
  }
  setTimeout(pop, 500)
}

// ── White noise ──────────────────────────────────────────────────
function playWhiteNoise(master) {
  const ctx = getCtx()
  const src = makeNoise(ctx, 3, 1)
  const g   = ctx.createGain(); g.gain.value = 0.5
  src.connect(g); g.connect(master)
  src.start(); activeNodes.push(src)
}

// ── Forest ───────────────────────────────────────────────────────
function playForest(master) {
  const ctx = getCtx()

  // Wind
  const wind = makeNoise(ctx, 4, 0.5)
  const lp   = ctx.createBiquadFilter()
  lp.type = 'lowpass'; lp.frequency.value = 350
  const gWind = ctx.createGain(); gWind.gain.value = 0.3
  wind.connect(lp); lp.connect(gWind); gWind.connect(master)
  wind.start(); activeNodes.push(wind)

  // Wind LFO
  const lfo = ctx.createOscillator()
  lfo.type = 'sine'; lfo.frequency.value = 0.08
  const lfoG = ctx.createGain(); lfoG.gain.value = 0.1
  lfo.connect(lfoG); lfoG.connect(gWind.gain)
  lfo.start(); activeNodes.push(lfo)

  // Bird chirps
  function chirp() {
    if (!audioCtx || audioCtx.state === 'closed') return
    const o  = ctx.createOscillator()
    const g  = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(1800 + Math.random() * 400, ctx.currentTime)
    o.frequency.linearRampToValueAtTime(2400 + Math.random() * 300, ctx.currentTime + 0.07)
    o.frequency.linearRampToValueAtTime(1600 + Math.random() * 200, ctx.currentTime + 0.14)
    g.gain.setValueAtTime(0, ctx.currentTime)
    g.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.03)
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.16)
    o.connect(g); g.connect(master)
    o.start(); o.stop(ctx.currentTime + 0.18)
    activeNodes.push(o)
    const t = setTimeout(chirp, 3000 + Math.random() * 9000)
    activeNodes.push({ stop: () => clearTimeout(t), disconnect: () => {} })
  }
  setTimeout(chirp, 1000 + Math.random() * 2000)
}

// ── Café ─────────────────────────────────────────────────────────
function playCafe(master) {
  const ctx = getCtx()

  const murmur = makeNoise(ctx, 4, 1)
  const bp     = ctx.createBiquadFilter()
  bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 1.2
  const g = ctx.createGain(); g.gain.value = 0.35
  murmur.connect(bp); bp.connect(g); g.connect(master)
  murmur.start(); activeNodes.push(murmur)

  function clink() {
    if (!audioCtx || audioCtx.state === 'closed') return
    const o = ctx.createOscillator()
    const gain = ctx.createGain()
    o.type = 'triangle'; o.frequency.value = 1100 + Math.random() * 300
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    o.connect(gain); gain.connect(master)
    o.start(); o.stop(ctx.currentTime + 0.5)
    activeNodes.push(o)
    const t = setTimeout(clink, 7000 + Math.random() * 14000)
    activeNodes.push({ stop: () => clearTimeout(t), disconnect: () => {} })
  }
  setTimeout(clink, 3000)
}

// ── Lo-fi ────────────────────────────────────────────────────────
function playLofi(master) {
  const ctx = getCtx()
  const chords = [
    [220, 261.63, 329.63], [174.61, 220, 261.63],
    [261.63, 329.63, 392], [196, 246.94, 293.66],
  ]
  const CHORD_DUR = 2.5
  let startTime = ctx.currentTime

  function scheduleChords() {
    chords.forEach((chord, ci) => {
      chord.forEach(freq => {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = 'sine'; o.frequency.value = freq
        g.gain.setValueAtTime(0, startTime + ci * CHORD_DUR)
        g.gain.linearRampToValueAtTime(0.08, startTime + ci * CHORD_DUR + 0.2)
        g.gain.linearRampToValueAtTime(0, startTime + ci * CHORD_DUR + CHORD_DUR - 0.1)
        o.connect(g); g.connect(master)
        o.start(startTime + ci * CHORD_DUR)
        o.stop(startTime + ci * CHORD_DUR + CHORD_DUR)
        activeNodes.push(o)
      })
    })
    startTime += chords.length * CHORD_DUR
  }

  scheduleChords()
  const iv = setInterval(() => {
    if (!audioCtx || audioCtx.state === 'closed') { clearInterval(iv); return }
    scheduleChords()
  }, chords.length * CHORD_DUR * 1000)
  activeNodes.push({ stop: () => clearInterval(iv), disconnect: () => {} })
}

// ── Public API ───────────────────────────────────────────────────

export const TIMER_SOUNDS = [
  { id: 'none',       label: 'Off',           emoji: '○'  },
  { id: 'rain',       label: 'Rain',          emoji: '🌧' },
  { id: 'ocean',      label: 'Ocean waves',   emoji: '🌊' },
  { id: 'forest',     label: 'Forest',        emoji: '🌿' },
  { id: 'fireplace',  label: 'Fireplace',     emoji: '🔥' },
  { id: 'brownnoise', label: 'Brown noise',   emoji: '🟤' },
  { id: 'whitenoise', label: 'White noise',   emoji: '〰' },
  { id: 'cafe',       label: 'Coffee shop',   emoji: '☕' },
  { id: 'lofi',       label: 'Lo-fi',         emoji: '🎵' },
]

export function startSound(id, volume = 0.6) {
  stopAll()
  if (!id || id === 'none') return
  try {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    // Set master volume
    masterGainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), ctx.currentTime)
    const master = masterGainNode
    if      (id === 'rain')       playRain(master)
    else if (id === 'ocean')      playOcean(master)
    else if (id === 'forest')     playForest(master)
    else if (id === 'fireplace')  playFireplace(master)
    else if (id === 'brownnoise') playBrownNoise(master)
    else if (id === 'whitenoise') playWhiteNoise(master)
    else if (id === 'cafe')       playCafe(master)
    else if (id === 'lofi')       playLofi(master)
  } catch(e) { console.warn('Audio error:', e.message) }
}

export function setVolume(volume) {
  if (!masterGainNode || !audioCtx) return
  masterGainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), audioCtx.currentTime, 0.05)
}

export function stopSound() { stopAll() }

export function playSessionEndBell() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[0, 0.3, 0.6].forEach((delay, i) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'; o.frequency.value = [523.25, 659.25, 783.99][i]
      g.gain.setValueAtTime(0.35, ctx.currentTime + delay)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 1.5)
      o.connect(g); g.connect(ctx.destination)
      o.start(ctx.currentTime + delay); o.stop(ctx.currentTime + delay + 2)
    })
  } catch(e) {}
}
