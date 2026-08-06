// src/components/ThemeSelector.jsx
// Drop this into Settings.jsx — lets users pick and unlock themes and icons

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { THEMES, PROFILE_ICONS, isUnlocked, applyTheme, eligibleBadgeIcons } from '../data/themes'
import { Lock } from 'lucide-react'

export default function ThemeSelector() {
  const { profile, user, refreshProfile } = useAuth()
  const [activeTheme, setActiveTheme] = useState(
    localStorage.getItem('revisionflow_theme') || 'default'
  )
  const [activeIcon, setActiveIcon] = useState(profile?.profileIcon || 'lightning')
  const [saving, setSaving] = useState(false)

  async function selectTheme(themeId) {
    const theme = THEMES[themeId]
    if (!isUnlocked(theme.unlock, profile)) return
    setActiveTheme(themeId)
    applyTheme(themeId)
    setSaving(true)
    await setDoc(doc(db, 'users', user.uid), { theme: themeId }, { merge: true })
    setSaving(false)
  }

  async function selectIcon(iconId) {
    const icon = PROFILE_ICONS[iconId]
    if (!isUnlocked(icon.unlock, profile)) return
    setActiveIcon(iconId)
    setSaving(true)
    await setDoc(doc(db, 'users', user.uid), { profileIcon: iconId }, { merge: true })
    await refreshProfile()
    setSaving(false)
  }

  async function selectBadgeIcon(badgeId) {
    if (!(profile?.badges || []).includes(badgeId)) return
    const value = `badge:${badgeId}`
    setActiveIcon(value)
    setSaving(true)
    await setDoc(doc(db, 'users', user.uid), { profileIcon: value }, { merge: true })
    await refreshProfile()
    setSaving(false)
  }

  return (
    <div>
      {/* Themes section */}
      <div style={{ marginBottom: 28 }}>
        <h4 style={{ marginBottom: 4 }}>Theme</h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 14 }}>
          Changes your accent colour. Earn themes by gaining XP and badges.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
          {Object.entries(THEMES).map(([id, theme]) => {
            const unlocked = isUnlocked(theme.unlock, profile)
            const active = activeTheme === id
            return (
              <button
                key={id}
                onClick={() => selectTheme(id)}
                disabled={!unlocked}
                style={{
                  textAlign: 'left',
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'var(--accent-bg, rgba(124,58,237,0.08))' : 'var(--bg-surface)',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  opacity: unlocked ? 1 : 0.6,
                  position: 'relative',
                  transition: 'border-color 0.15s',
                }}
              >
                {/* Colour swatches */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                  {theme.preview.map((color, i) => (
                    <div key={i} style={{
                      width: 16, height: 16,
                      borderRadius: '50%',
                      background: color,
                    }} />
                  ))}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{theme.name}</div>
                {!unlocked && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    🔒 {theme.unlockLabel}
                  </div>
                )}
                {active && unlocked && (
                  <div style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--accent)',
                  }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Profile icons section */}
      <div>
        <h4 style={{ marginBottom: 4 }}>Profile icon</h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 14 }}>
          Shown on your profile and leaderboard. Earn icons through badges and XP.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {Object.entries(PROFILE_ICONS).map(([id, icon]) => {
            const unlocked = isUnlocked(icon.unlock, profile)
            const active = activeIcon === id
            return (
              <button
                key={id}
                onClick={() => selectIcon(id)}
                disabled={!unlocked}
                title={unlocked ? icon.name : `🔒 ${icon.unlockLabel}`}
                style={{
                  width: 52, height: 52,
                  borderRadius: 12,
                  border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'var(--accent-bg, rgba(124,58,237,0.08))' : 'var(--bg-surface)',
                  fontSize: '1.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  opacity: unlocked ? 1 : 0.45,
                  position: 'relative',
                  transition: 'border-color 0.15s',
                }}
              >
                {icon.emoji}
                {!unlocked && (
                  <div style={{
                    position: 'absolute', bottom: -2, right: -2,
                    background: 'var(--bg-card)',
                    borderRadius: '50%',
                    padding: 1,
                  }}>
                    <Lock size={10} color="var(--text-muted)" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Badge icons section — badges whose emoji isn't already a Profile icon option above */}
      <div style={{ marginTop: 24 }}>
        <h4 style={{ marginBottom: 4 }}>Badge icons</h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 14 }}>
          Use an earned badge as your icon instead. Earn a badge to unlock it here.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {eligibleBadgeIcons().map(badge => {
            const earned = (profile?.badges || []).includes(badge.id)
            const active = activeIcon === `badge:${badge.id}`
            return (
              <button
                key={badge.id}
                onClick={() => selectBadgeIcon(badge.id)}
                disabled={!earned}
                title={earned ? badge.name : `🔒 ${badge.name} — ${badge.desc}`}
                style={{
                  width: 52, height: 52,
                  borderRadius: 12,
                  border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'var(--accent-bg, rgba(124,58,237,0.08))' : 'var(--bg-surface)',
                  fontSize: '1.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: earned ? 'pointer' : 'not-allowed',
                  opacity: earned ? 1 : 0.45,
                  position: 'relative',
                  transition: 'border-color 0.15s',
                }}
              >
                {badge.icon}
                {!earned && (
                  <div style={{
                    position: 'absolute', bottom: -2, right: -2,
                    background: 'var(--bg-card)',
                    borderRadius: '50%',
                    padding: 1,
                  }}>
                    <Lock size={10} color="var(--text-muted)" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {saving && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 12 }}>
          Saving...
        </p>
      )}
    </div>
  )
}
