// src/components/BadgeAuditButton.jsx
// Lets users manually trigger a badge audit to retroactively
// earn any badges they deserve from past activity.

import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { runBadgeAudit } from '../utils/firestore'
import { BADGE_MAP } from '../data/badges'
import { ShieldCheck, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BadgeAuditButton() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState(null)

  async function handleAudit() {
    if (!user || loading) return
    setLoading(true)
    try {
      const { awarded } = await runBadgeAudit(user.uid)
      setLastResult(awarded)
      if (awarded.length === 0) {
        toast.success("You're all caught up — no missing badges!")
      } else {
        awarded.forEach(badgeId => {
          const badge = BADGE_MAP[badgeId]
          if (badge) {
            toast.success(`${badge.icon} Badge unlocked: ${badge.name} (+${badge.xp} XP)`, { duration: 4000 })
          }
        })
      }
    } catch (e) {
      toast.error('Audit failed: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button
        className="btn btn-secondary"
        onClick={handleAudit}
        disabled={loading}
        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
      >
        {loading
          ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
          : <ShieldCheck size={16} />}
        {loading ? 'Checking your activity…' : 'Check for missing badges'}
      </button>
      {lastResult !== null && !loading && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
          {lastResult.length === 0
            ? 'All badges up to date ✓'
            : `${lastResult.length} badge${lastResult.length !== 1 ? 's' : ''} awarded from past activity`}
        </p>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
