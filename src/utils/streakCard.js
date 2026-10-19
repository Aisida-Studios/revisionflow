// src/utils/streakCard.js
// Generates a shareable streak card image using Canvas API
// Returns a data URL PNG suitable for download or Web Share API
//
// Design note: the previous version leaned on near-black backgrounds with lots of
// 4-25%-opacity white "frosted glass" overlays. Every pixel was technically opaque, but
// against a dark phone background or a dark-mode Instagram/TikTok feed it read as washed-out
// and hard to see — easy to mistake for a transparent PNG. Rebuilt Duolingo-style instead:
// one fully-saturated solid background colour, a solid (not translucent) white content card,
// and high-contrast text everywhere. Nothing on this card should ever look "see-through".

export async function generateStreakCard({
  displayName,
  streak,
  xp,
  level,
  levelTitle,
  badges,
  subjects,
  bestStreak,
  profileIcon,
  accentColor = '#14532d',
}) {
  const W = 1080, H = 1080  // Square for Instagram/TikTok

  const canvas  = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx     = canvas.getContext('2d')

  const dark = darken(accentColor, 40)

  // ── Solid, fully-saturated background (no gradients-to-black, no translucency) ────
  ctx.fillStyle = accentColor
  ctx.fillRect(0, 0, W, H)

  // Chunky decorative shapes (solid, low-key darker/lighter tone of the same colour —
  // Duolingo-style playful background detail, not a moody glow)
  circleSolid(ctx, W * 0.88, H * 0.08, 130, lighten(accentColor, 25))
  circleSolid(ctx, W * 0.06, H * 0.92, 160, dark)
  circleSolid(ctx, W * 0.92, H * 0.90, 90, dark)

  // ── Branding strip ──────────────────────────────────────────────────
  ctx.font = 'bold 30px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  ctx.fillText('RevisionFlow', 72, 96)
  ctx.font = '24px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillText('revisionflow.netlify.app', 72, 128)

  // ── Solid white content card ────────────────────────────────────────
  const cardX = 56, cardY = 168, cardW = W - 112, cardH = H - 168 - 56
  roundRect(ctx, cardX, cardY, cardW, cardH, 36)
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  // ── Avatar — solid colour circle, bold ring, no translucency ───────
  const avatarX = W / 2, avatarY = cardY + 100, avatarR = 66
  ctx.beginPath()
  ctx.arc(avatarX, avatarY, avatarR + 8, 0, Math.PI * 2)
  ctx.fillStyle = accentColor
  ctx.fill()
  ctx.beginPath()
  ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2)
  ctx.fillStyle = lighten(accentColor, 15)
  ctx.fill()
  ctx.font = `${avatarR * 0.85}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(profileIcon || displayName?.[0]?.toUpperCase() || 'R', avatarX, avatarY + 4)

  // ── Display name + level ────────────────────────────────────────────
  ctx.textBaseline = 'alphabetic'
  ctx.font = 'bold 48px -apple-system, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#1a1a1f'
  ctx.fillText(truncate(displayName || 'Student', 18), W / 2, avatarY + 108)

  const lvlText = `Level ${level} · ${levelTitle}`
  ctx.font = 'bold 26px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = accentColor
  ctx.fillText(lvlText, W / 2, avatarY + 144)

  // ── Main streak number — bold solid orange badge, no glow-on-black tricks ──
  const streakBadgeY = avatarY + 200
  roundRect(ctx, W / 2 - 220, streakBadgeY, 440, 230, 32)
  ctx.fillStyle = '#fff4e8'
  ctx.fill()

  ctx.textAlign = 'center'
  drawIcon(ctx, 'flame', W / 2, streakBadgeY + 56, 84, { fill: '#f97316', stroke: '#f97316', lineWidth: 1.5 })

  ctx.font = 'bold 110px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = '#f97316'
  ctx.fillText(String(streak), W / 2, streakBadgeY + 195)

  ctx.font = 'bold 28px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = '#c2410c'
  ctx.fillText('DAY STREAK', W / 2, streakBadgeY + 228)

  // ── Stats row — solid coloured badges, high-contrast white text ────
  const statsY = streakBadgeY + 260
  const stats = [
    { label: 'XP',          val: formatXP(xp),              icon: 'zap',    bg: accentColor },
    { label: 'Best streak', val: `${bestStreak || streak}d`, icon: 'trophy', bg: dark },
    { label: 'Badges',      val: String(badges),             icon: 'award',  bg: accentColor },
  ]
  const gap = 20
  const statW = (cardW - 64 - gap * 2) / 3
  stats.forEach((s, i) => {
    const x  = cardX + 32 + i * (statW + gap)
    const cx = x + statW / 2

    roundRect(ctx, x, statsY, statW, 118, 20)
    ctx.fillStyle = s.bg
    ctx.fill()

    ctx.textAlign = 'center'
    drawIcon(ctx, s.icon, cx, statsY + 30, 32, { stroke: '#ffffff', lineWidth: 2 })

    ctx.font = 'bold 34px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(s.val, cx, statsY + 78)

    ctx.font = 'bold 20px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillText(s.label, cx, statsY + 102)
  })

  // ── Subjects row — solid pill badges ────────────────────────────────
  if (subjects?.length) {
    const subY    = statsY + 148
    const subList = subjects.slice(0, 4)
    const subW    = Math.min(180, (cardW - 64) / subList.length)
    const totalW  = subList.length * (subW + 10) - 10
    const startX  = (W - totalW) / 2
    subList.forEach((s, i) => {
      const x = startX + i * (subW + 10)
      roundRect(ctx, x, subY, subW, 44, 22)
      ctx.fillStyle = '#f2f2f0'
      ctx.fill()
      ctx.font = 'bold 19px -apple-system, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = accentColor
      ctx.fillText(truncate(s, 11), x + subW / 2, subY + 28)
    })
  }

  // ── Bottom CTA ────────────────────────────────────────────────────
  ctx.font = 'bold 24px -apple-system, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#8c8c8c'
  ctx.fillText('Join the revision revolution', W / 2, cardY + cardH - 32)

  return canvas.toDataURL('image/png')
}

// ── Helpers ───────────────────────────────────────────────────────────
// Small icons for the card, drawn as vector paths so the image never depends on an emoji font.
// Geometry is lucide's (the same shapes the app's UI icons use), in a 24 x 24 box.
const ICON_PATHS = {
  flame: ['M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'],
  zap: ['M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z'],
  trophy: [
    'M6 9H4.5a2.5 2.5 0 0 1 0-5H6', 'M18 9h1.5a2.5 2.5 0 0 0 0-5H18', 'M4 22h16',
    'M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22',
    'M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22',
    'M18 2H6v7a6 6 0 0 0 12 0V2Z',
  ],
  award: [
    'm15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526',
    'M18 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0z',
  ],
}

function drawIcon(ctx, name, cx, cy, size, { stroke, fill, lineWidth = 2 } = {}) {
  const paths = ICON_PATHS[name]
  if (!paths || typeof Path2D === 'undefined') return
  ctx.save()
  ctx.translate(cx - size / 2, cy - size / 2)
  ctx.scale(size / 24, size / 24)
  ctx.lineWidth = lineWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  paths.forEach(d => {
    const p = new Path2D(d)
    if (fill)   { ctx.fillStyle = fill;     ctx.fill(p) }
    if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(p) }
  })
  ctx.restore()
}

function roundRect(ctx, x, y, w, h, r) {
  if (typeof r === 'number') r = [r, r, r, r]
  ctx.beginPath()
  ctx.moveTo(x + r[0], y)
  ctx.lineTo(x + w - r[1], y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r[1])
  ctx.lineTo(x + w, y + h - r[2])
  ctx.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h)
  ctx.lineTo(x + r[3], y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r[3])
  ctx.lineTo(x, y + r[0])
  ctx.quadraticCurveTo(x, y, x + r[0], y)
  ctx.closePath()
}

function circleSolid(ctx, x, y, r, colour) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = colour
  ctx.fill()
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function lighten(hex, amount) {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount)
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount)
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function darken(hex, amount) {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount)
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount)
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function formatXP(xp) {
  if (!xp) return '0'
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
  return String(xp)
}

function truncate(str, max) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}
