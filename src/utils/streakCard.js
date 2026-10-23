// src/utils/streakCard.js
// Share card as a 1080 x 1080 PNG: the streak, a row of growing plants, the student's name and level, and three
// stats. Deliberately plain: Manrope, deep green on white, no emoji, no flame, nothing animated. Drawn on a canvas
// so it never depends on an emoji font or on the page's theme.

const W = 1080
const H = 1080
const FONT = "Manrope, -apple-system, 'Segoe UI', system-ui, sans-serif"
const C = {
  bg: '#F4F7F3', panel: '#FFFFFF', panelLine: '#D9E3D9', rule: '#E3EAE3',
  ink: '#0F172A', green: '#14532D', body: '#3F5A47', muted: '#5B6B61', faint: '#7A8A80',
  stem: '#2F6B3F', leafA: '#4F8A5B', leafB: '#7DB38A', soil: '#C8D5C8', brand: '#16A34A',
}

export async function generateStreakCard({
  displayName = 'Student', streak = 0, xp = 0, level = 1, levelTitle = '', badges = 0, bestStreak = 0,
} = {}) {
  await loadFonts()

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'alphabetic'

  // Page and panel
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, W, H)
  roundRect(ctx, 40, 40, 1000, 1000, 40)
  ctx.fillStyle = C.panel
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = C.panelLine
  ctx.stroke()

  // Header: mark, wordmark, address
  roundRect(ctx, 96, 96, 64, 64, 18)
  ctx.fillStyle = C.green
  ctx.fill()
  drawBolt(ctx, 128, 128, 34)
  ctx.textAlign = 'left'
  ctx.font = '800 44px ' + FONT
  ctx.fillStyle = C.ink
  ctx.fillText('Revision', 180, 141)
  const revW = ctx.measureText('Revision').width
  ctx.fillStyle = C.brand
  ctx.fillText('Flow', 180 + revW, 141)
  ctx.textAlign = 'right'
  ctx.font = '600 30px ' + FONT
  ctx.fillStyle = C.faint
  ctx.fillText('revisionflow.co.uk', 984, 140)

  // The streak
  ctx.textAlign = 'center'
  ctx.fillStyle = C.green
  const count = String(Math.max(0, Math.round(streak)))
  ctx.font = '800 ' + (count.length >= 4 ? 220 : count.length === 3 ? 270 : 320) + 'px ' + FONT
  ctx.fillText(count, W / 2, 452)
  ctx.font = '700 52px ' + FONT
  ctx.fillStyle = C.body
  ctx.fillText('day streak', W / 2, 530)

  // Growing plants, one per day up to nine, each a little taller than the last
  const plants = Math.min(9, Math.max(1, Math.round(streak)))
  const span = Math.min(480, 64 * (plants - 1))
  const left = W / 2 - span / 2
  const soilY = 690
  ctx.strokeStyle = C.soil
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(280, soilY)
  ctx.lineTo(800, soilY)
  ctx.stroke()
  for (let i = 0; i < plants; i++) {
    const t = plants === 1 ? 0.5 : i / (plants - 1)
    drawPlant(ctx, plants === 1 ? W / 2 : left + span * t, soilY, 52 + 76 * t, (i % 2 ? 1 : -1) * 6)
  }

  // Name and level
  ctx.textAlign = 'center'
  ctx.font = '800 54px ' + FONT
  ctx.fillStyle = C.ink
  ctx.fillText(fit(ctx, displayName, 820), W / 2, 790)
  ctx.font = '600 34px ' + FONT
  ctx.fillStyle = C.muted
  ctx.fillText('Level ' + level + (levelTitle ? ' \u00b7 ' + levelTitle : ''), W / 2, 840)

  // Stats
  ctx.fillStyle = C.rule
  ctx.fillRect(96, 884, 888, 2)
  const stats = [
    [formatCount(xp), 'XP'],
    [String(Math.max(bestStreak || 0, streak || 0)), 'Best streak'],
    [String(badges), 'Badges'],
  ]
  stats.forEach(([value, label], i) => {
    const cx = 96 + 888 * (i * 2 + 1) / 6
    ctx.font = '800 58px ' + FONT
    ctx.fillStyle = C.green
    ctx.fillText(value, cx, 956)
    ctx.font = '600 30px ' + FONT
    ctx.fillStyle = C.muted
    ctx.fillText(label, cx, 998)
  })

  return canvas.toDataURL('image/png')
}

// ── Helpers ───────────────────────────────────────────────────────────────
async function loadFonts() {
  try {
    await Promise.all(['600', '700', '800'].map(w => document.fonts.load(w + ' 48px Manrope')))
    await document.fonts.ready
  } catch (e) { /* the system font is used instead */ }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// The lightning mark from the app's logo (lucide's Zap shape, 24 x 24), filled white.
const BOLT = 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z'
function drawBolt(ctx, cx, cy, size) {
  if (typeof Path2D === 'undefined') return
  ctx.save()
  ctx.translate(cx - size / 2, cy - size / 2)
  ctx.scale(size / 24, size / 24)
  ctx.fillStyle = '#FFFFFF'
  ctx.fill(new Path2D(BOLT))
  ctx.restore()
}

// One pointed leaf rising from (x, y), turned by `angle` radians from vertical.
function leaf(ctx, x, y, len, angle, colour) {
  const w = len * 0.42
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(w, -len * 0.5, 0, -len)
  ctx.quadraticCurveTo(-w, -len * 0.5, 0, 0)
  ctx.fillStyle = colour
  ctx.fill()
  ctx.restore()
}

function drawPlant(ctx, x, baseY, h, lean) {
  ctx.strokeStyle = C.stem
  ctx.lineWidth = Math.max(4, h * 0.055)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x, baseY)
  ctx.quadraticCurveTo(x + lean, baseY - h * 0.55, x, baseY - h * 0.92)
  ctx.stroke()
  const pairs = h > 100 ? 3 : h > 72 ? 2 : 1
  for (let i = 0; i < pairs; i++) {
    const y = baseY - h * (0.3 + i * 0.22)
    const len = h * (0.34 - i * 0.04)
    leaf(ctx, x, y, len, -0.95, C.leafA)
    leaf(ctx, x, y - len * 0.12, len, 0.95, C.leafB)
  }
  leaf(ctx, x, baseY - h * 0.92, h * 0.26, 0, C.leafA)
}

function fit(ctx, text, maxWidth) {
  let t = String(text || '').trim() || 'Student'
  if (ctx.measureText(t).width <= maxWidth) return t
  while (t.length > 1 && ctx.measureText(t + '\u2026').width > maxWidth) t = t.slice(0, -1)
  return t.trimEnd() + '\u2026'
}

function formatCount(n) {
  const v = Math.max(0, Math.round(n || 0))
  return v >= 10000 ? (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : v.toLocaleString('en-GB')
}
