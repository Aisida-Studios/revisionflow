// src/utils/streakCard.js
// Generates a shareable streak card image using Canvas API
// Returns a data URL PNG suitable for download or Web Share API

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

  // ── Background gradient ───────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0,   '#0a0012')
  bg.addColorStop(0.5, '#0d0018')
  bg.addColorStop(1,   '#100020')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // ── Noise texture overlay (subtle grain) ─────────────────────────
  const grain = ctx.createImageData(W, H)
  for (let i = 0; i < grain.data.length; i += 4) {
    const v = Math.floor(Math.random() * 18)
    grain.data[i] = grain.data[i+1] = grain.data[i+2] = v
    grain.data[i+3] = 22
  }
  ctx.putImageData(grain, 0, 0)

  // ── Accent glow circles ───────────────────────────────────────────
  const glows = [
    { x: 0.15, y: 0.1,  r: 340, c: accentColor, a: 0.13 },
    { x: 0.85, y: 0.85, r: 380, c: '#ec4899',   a: 0.09 },
    { x: 0.5,  y: 0.5,  r: 280, c: accentColor, a: 0.06 },
  ]
  glows.forEach(g => {
    const rad = ctx.createRadialGradient(g.x*W, g.y*H, 0, g.x*W, g.y*H, g.r)
    rad.addColorStop(0, hexToRgba(g.c, g.a))
    rad.addColorStop(1, hexToRgba(g.c, 0))
    ctx.fillStyle = rad
    ctx.fillRect(0, 0, W, H)
  })

  // ── Card panel (frosted glass effect) ────────────────────────────
  roundRect(ctx, 60, 60, W-120, H-120, 40)
  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // ── Top accent bar ────────────────────────────────────────────────
  const barGrad = ctx.createLinearGradient(60, 0, W-60, 0)
  barGrad.addColorStop(0,   accentColor)
  barGrad.addColorStop(0.5, lighten(accentColor, 30))
  barGrad.addColorStop(1,   '#ec4899')
  roundRect(ctx, 60, 60, W-120, 6, [3, 3, 0, 0])
  ctx.fillStyle = barGrad
  ctx.fill()

  // ── Branding ──────────────────────────────────────────────────────
  ctx.font = 'bold 28px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.textAlign = 'left'
  ctx.fillText('RevisionFlow', 108, 130)

  // Dot separator
  ctx.beginPath()
  ctx.arc(108 + ctx.measureText('RevisionFlow').width + 14, 124, 3, 0, Math.PI*2)
  ctx.fillStyle = accentColor
  ctx.fill()

  ctx.font = '26px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.fillText('revisionflow.netlify.app', 108 + ctx.measureText('RevisionFlow').width + 26, 130)

  // ── Profile icon / avatar ─────────────────────────────────────────
  const avatarX = W/2, avatarY = 230, avatarR = 72
  // Outer ring gradient
  const ringGrad = ctx.createLinearGradient(avatarX-avatarR, avatarY-avatarR, avatarX+avatarR, avatarY+avatarR)
  ringGrad.addColorStop(0, accentColor)
  ringGrad.addColorStop(1, '#ec4899')
  ctx.beginPath()
  ctx.arc(avatarX, avatarY, avatarR + 5, 0, Math.PI*2)
  ctx.strokeStyle = ringGrad
  ctx.lineWidth = 4
  ctx.stroke()
  // Inner circle
  ctx.beginPath()
  ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI*2)
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.fill()
  // Icon or initials
  ctx.font = `${avatarR * 0.85}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(profileIcon || displayName?.[0]?.toUpperCase() || '📚', avatarX, avatarY)

  // ── Display name ──────────────────────────────────────────────────
  ctx.textBaseline = 'alphabetic'
  ctx.font = 'bold 52px -apple-system, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = accentColor
  ctx.shadowBlur = 20
  ctx.fillText(truncate(displayName || 'Student', 18), W/2, 348)
  ctx.shadowBlur = 0

  // Level badge under name
  const lvlText = `Level ${level} · ${levelTitle}`
  ctx.font = '28px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.fillText(lvlText, W/2, 390)

  // ── Main streak number ────────────────────────────────────────────
  // Fire emoji
  ctx.font = '110px serif'
  ctx.textAlign = 'center'
  ctx.fillText('🔥', W/2, 530)

  ctx.font = 'bold 140px -apple-system, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.shadowColor = '#f97316'
  ctx.shadowBlur = 40
  ctx.fillStyle = '#ffffff'
  ctx.fillText(String(streak), W/2, 670)
  ctx.shadowBlur = 0

  ctx.font = 'bold 36px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText('day streak', W/2, 718)

  // ── Stats row ─────────────────────────────────────────────────────
  const stats = [
    { label: 'XP',          val: formatXP(xp),      emoji: '⚡' },
    { label: 'Best streak', val: `${bestStreak || streak}d`, emoji: '🏆' },
    { label: 'Badges',      val: String(badges),     emoji: '🎖' },
  ]
  const statW = (W - 120 - 80) / 3  // 3 cols with padding
  stats.forEach((s, i) => {
    const cx = 100 + i * (statW + 40) + statW/2

    // Stat card background
    roundRect(ctx, 100 + i * (statW + 40), 752, statW, 110, 16)
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.font = '32px serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(s.emoji, cx, 792)

    ctx.font = 'bold 34px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(s.val, cx, 832)

    ctx.font = '22px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fillText(s.label, cx, 858)
  })

  // ── Subjects row ──────────────────────────────────────────────────
  if (subjects?.length) {
    const subList = subjects.slice(0, 5)
    const subW    = Math.min(160, (W - 200) / subList.length)
    const totalW  = subList.length * (subW + 8) - 8
    const startX  = (W - totalW) / 2
    subList.forEach((s, i) => {
      const x = startX + i * (subW + 8)
      roundRect(ctx, x, 888, subW, 38, 8)
      ctx.fillStyle = hexToRgba(accentColor, 0.25)
      ctx.fill()
      ctx.strokeStyle = hexToRgba(accentColor, 0.5)
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.font = '20px -apple-system, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.fillText(truncate(s, 10), x + subW/2, 912)
    })
  }

  // ── Bottom CTA ────────────────────────────────────────────────────
  ctx.font = '24px -apple-system, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.fillText('Join the revision revolution 🚀', W/2, 965)

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

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3), 16)
  const g = parseInt(hex.slice(3,5), 16)
  const b = parseInt(hex.slice(5,7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function lighten(hex, amount) {
  const r = Math.min(255, parseInt(hex.slice(1,3), 16) + amount)
  const g = Math.min(255, parseInt(hex.slice(3,5), 16) + amount)
  const b = Math.min(255, parseInt(hex.slice(5,7), 16) + amount)
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`
}

function formatXP(xp) {
  if (!xp) return '0'
  if (xp >= 1000) return `${(xp/1000).toFixed(1)}k`
  return String(xp)
}

function truncate(str, max) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max-1) + '…' : str
}
