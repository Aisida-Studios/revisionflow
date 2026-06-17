// src/data/themes.js
// Theme and profile icon definitions for RevisionFlow cosmetics system

export const THEMES = {
  default: {
    name: 'Default',
    unlock: 'free',
    accent: '#7c3aed',
    accentLight: '#a855f7',
    description: 'The classic RevisionFlow purple',
    bgOverrides: null,
    preview: ['#7c3aed', '#a855f7', '#4f46e5'],
  },
  midnight: {
    name: 'Midnight',
    unlock: 'free',
    accent: '#1d4ed8',
    accentLight: '#3b82f6',
    description: 'Deep ocean blue',
    bgOverrides: { bgBase: '#0a0e1a', bgCard: '#111827', bgSurface: '#1a2235' },
    preview: ['#1d4ed8', '#3b82f6', '#1e40af'],
  },
  forest: {
    name: 'Forest',
    unlock: 'xp_1000',
    unlockLabel: 'Reach 1,000 XP',
    accent: '#166534',
    accentLight: '#22c55e',
    description: 'Calm, focused green — unlocks at 1,000 XP',
    bgOverrides: { bgBase: '#0a120a', bgCard: '#0f1f0f', bgSurface: '#162516' },
    preview: ['#166534', '#22c55e', '#15803d'],
  },
  sunset: {
    name: 'Sunset',
    unlock: 'xp_2500',
    unlockLabel: 'Reach 2,500 XP',
    accent: '#b45309',
    accentLight: '#f59e0b',
    description: 'Warm amber tones — unlocks at 2,500 XP',
    bgOverrides: { bgBase: '#1a0e06', bgCard: '#1f1208', bgSurface: '#28180a' },
    preview: ['#b45309', '#f59e0b', '#92400e'],
  },
  ocean: {
    name: 'Ocean',
    unlock: 'xp_5000',
    unlockLabel: 'Reach 5,000 XP',
    accent: '#0e7490',
    accentLight: '#06b6d4',
    description: 'Deep sea teal — unlocks at 5,000 XP',
    bgOverrides: { bgBase: '#050e1a', bgCard: '#08141f', bgSurface: '#0e1f2e' },
    preview: ['#0e7490', '#06b6d4', '#155e75'],
  },
  rose: {
    name: 'Rose',
    unlock: 'badge_streak_14',
    unlockLabel: 'Get the 14-day streak badge',
    accent: '#be185d',
    accentLight: '#ec4899',
    description: 'Vibrant rose — unlock with a 14-day streak',
    bgOverrides: { bgBase: '#180a12', bgCard: '#1f0e18', bgSurface: '#2a1020' },
    preview: ['#be185d', '#ec4899', '#9d174d'],
  },
  galaxy: {
    name: 'Galaxy',
    unlock: 'badge_streak_30',
    unlockLabel: 'Get the 30-day streak badge',
    accent: '#4c1d95',
    accentLight: '#8b5cf6',
    description: 'Deep space purple — unlock with a 30-day streak',
    bgOverrides: { bgBase: '#0a0614', bgCard: '#110a1f', bgSurface: '#1a0f2e' },
    preview: ['#4c1d95', '#8b5cf6', '#3730a3'],
  },
  fire: {
    name: 'Fire',
    unlock: 'badge_fifty_papers',
    unlockLabel: 'Log 50 past papers',
    accent: '#b91c1c',
    accentLight: '#ef4444',
    description: 'Intense red — unlock by logging 50 past papers',
    bgOverrides: { bgBase: '#150506', bgCard: '#1f0808', bgSurface: '#280a0a' },
    preview: ['#b91c1c', '#ef4444', '#991b1b'],
  },
  // Premium themes
  neon: {
    name: 'Neon',
    unlock: 'premium',
    unlockLabel: 'RevisionFlow Pro',
    accent: '#059669',
    accentLight: '#10b981',
    description: 'Cyberpunk green — RevisionFlow Pro only',
    bgOverrides: { bgBase: '#050f0a', bgCard: '#08180f', bgSurface: '#0e2018' },
    preview: ['#059669', '#10b981', '#047857'],
  },
  minimal: {
    name: 'Minimal',
    unlock: 'premium',
    unlockLabel: 'RevisionFlow Pro',
    accent: '#374151',
    accentLight: '#6b7280',
    description: 'Ultra-clean grey — RevisionFlow Pro only',
    bgOverrides: { bgBase: '#0f1014', bgCard: '#161820', bgSurface: '#1e2028' },
    preview: ['#374151', '#6b7280', '#1f2937'],
  },
}

export const PROFILE_ICONS = {
  lightning: { emoji: '⚡', unlock: 'free',                name: 'Lightning' },
  book:       { emoji: '📚', unlock: 'free',                name: 'Books' },
  pencil:     { emoji: '✏️', unlock: 'free',                name: 'Pencil' },
  fire:       { emoji: '🔥', unlock: 'badge_streak_7',      name: 'Fire',         unlockLabel: '7-day streak badge' },
  diamond:    { emoji: '💎', unlock: 'badge_streak_30',     name: 'Diamond',      unlockLabel: '30-day streak badge' },
  trophy:     { emoji: '🏆', unlock: 'badge_top_three',     name: 'Trophy',       unlockLabel: 'Top 3 leaderboard badge' },
  rocket:     { emoji: '🚀', unlock: 'xp_1000',             name: 'Rocket',       unlockLabel: '1,000 XP' },
  star:       { emoji: '⭐', unlock: 'xp_5000',             name: 'Star',         unlockLabel: '5,000 XP' },
  crown:      { emoji: '👑', unlock: 'xp_10000',            name: 'Crown',        unlockLabel: '10,000 XP' },
  brain:      { emoji: '🧠', unlock: 'badge_mastery_gold',  name: 'Brain',        unlockLabel: 'Subject Master badge' },
  robot:      { emoji: '🤖', unlock: 'premium',             name: 'Robot',        unlockLabel: 'RevisionFlow Pro' },
  gem:        { emoji: '💠', unlock: 'premium',             name: 'Gem',          unlockLabel: 'RevisionFlow Pro' },
}

// Check if a theme/icon is unlocked for a given user profile
export function isUnlocked(unlockKey, profile) {
  if (unlockKey === 'free') return true
  if (unlockKey === 'premium') return profile?.isPro === true || profile?.betaUser === true

  if (unlockKey.startsWith('xp_')) {
    const required = parseInt(unlockKey.replace('xp_', ''))
    return (profile?.xp || 0) >= required
  }

  if (unlockKey.startsWith('badge_')) {
    const badgeId = unlockKey.replace('badge_', '')
    return (profile?.badges || []).includes(badgeId)
  }

  return false
}

// Apply a theme by setting CSS variables on the root element
export function applyTheme(themeId) {
  const theme = THEMES[themeId] || THEMES.default

  // Remove any previously injected theme style
  const old = document.getElementById('rf-theme-override')
  if (old) old.remove()

  // Inject a <style> tag that overrides CSS vars with highest specificity
  // This beats any :root{} definition in globals.css
  const hex = theme.accent
  const light = theme.accentLight

  // Derive rgba transparent versions
  function hexToRgb(h) {
    const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16), b = parseInt(h.slice(5,7),16)
    return `${r},${g},${b}`
  }

  const rgb = hexToRgb(hex)
  const rgbLight = hexToRgb(light)

  const style = document.createElement('style')
  style.id = 'rf-theme-override'
  style.textContent = `
    :root, [data-theme], [data-theme="dark"], [data-theme="light"] {
      --accent: ${hex} !important;
      --accent-light: ${light} !important;
      --accent-bg: rgba(${rgb}, 0.12) !important;
      --accent-hover: rgba(${rgb}, 0.08) !important;
      --purple-400: ${light} !important;
      --purple-300: ${light} !important;
      --purple-700: ${hex} !important;
    }
    .progress-fill, .xp-bar-fill { background: ${hex} !important; }
    .gradient-text { background: linear-gradient(135deg, ${hex}, ${light}) !important; -webkit-background-clip: text !important; }
    .btn-primary { background: ${hex} !important; }
    .btn-primary:hover { background: ${light} !important; }
  `
  document.head.appendChild(style)

  // Apply background overrides for dark mode themed backgrounds
  if (theme.bgOverrides) {
    const { bgBase, bgCard, bgSurface } = theme.bgOverrides
    style.textContent += `
      [data-theme="dark"] {
        --bg-base: ${bgBase} !important;
        --bg-card: ${bgCard} !important;
        --bg-surface: ${bgSurface} !important;
        --bg-input: ${bgCard} !important;
      }
    `
  }

  root.dataset.rfColorTheme = themeId
  localStorage.setItem('revisionflow_theme', themeId)
}

// Keep a reference so we don't need document query each time
const root = document.documentElement

// Load saved theme on app start — call this in main.jsx or App.jsx
export function loadSavedTheme() {
  const saved = localStorage.getItem('revisionflow_theme')
  if (saved && THEMES[saved]) applyTheme(saved)
}
