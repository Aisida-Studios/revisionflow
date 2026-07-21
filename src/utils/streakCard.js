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
  accentColor = '#7c3aed',
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
  ctx.fillText(profileIcon || displayName?.[0]?.toUpperCase() || '📚', avatarX, avatarY + 4)

  // ── Display name + level ────────────────────────────────────────────
  ctx.textBaseline = 'alphabetic'
  ctx.font = 'bold 48px -apple-system, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#1a1025'
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

  ctx.font = '90px serif'
  ctx.textAlign = 'center'
  ctx.fillText('🔥', W / 2, streakBadgeY + 95)

  ctx.font = 'bold 110px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = '#f97316'
  ctx.fillText(String(streak), W / 2, streakBadgeY + 195)

  ctx.font = 'bold 28px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = '#c2410c'
  ctx.fillText('DAY STREAK', W / 2, streakBadgeY + 228)

  // ── Stats row — solid coloured badges, high-contrast white text ────
  const statsY = streakBadgeY + 260
  const stats = [
    { label: 'XP',          val: formatXP(xp),              emoji: '⚡', bg: accentColor },
    { label: 'Best streak', val: `${bestStreak || streak}d`, emoji: '🏆', bg: dark },
    { label: 'Badges',      val: String(badges),             emoji: '🎖', bg: accentColor },
  ]
  const gap = 20
  const statW = (cardW - 64 - gap * 2) / 3
  stats.forEach((s, i) => {
    const x  = cardX + 32 + i * (statW + gap)
    const cx = x + statW / 2

    roundRect(ctx, x, statsY, statW, 118, 20)
    ctx.fillStyle = s.bg
    ctx.fill()

    ctx.font = '30px serif'
    ctx.textAlign = 'center'
    ctx.fillText(s.emoji, cx, statsY + 40)

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
      ctx.fillStyle = '#f4f0fa'
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
  ctx.fillStyle = '#9b8bb0'
  ctx.fillText('Join the revision revolution 🚀', W / 2, cardY + cardH - 32)

  return canvas.toDataURL('image/png')
}

// ── Helpers ───────────────────────────────────────────────────────────
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
