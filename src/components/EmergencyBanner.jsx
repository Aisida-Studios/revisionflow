// src/components/EmergencyBanner.jsx
// Paste this near the top of Dashboard.jsx
// Shows automatically when an exam is within 7 days

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AlertTriangle, Zap } from 'lucide-react'

// Self-contained day calculator — no import needed
function daysUntilExam(dateStr) {
  if (!dateStr) return null
  var p = String(dateStr).slice(0, 10).split('-').map(Number)
  var ex = new Date(p[0], p[1] - 1, p[2])
  var td = new Date(); td.setHours(0, 0, 0, 0)
  return Math.round((ex - td) / 86400000)
}

export default function EmergencyBanner() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const nextUrgentExam = useMemo(() => {
    return (profile?.examDates || [])
      .filter(e => {
        const d = daysUntilExam(e.examDate)
        return d >= 0 && d <= 7
      })
      .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))[0]
  }, [profile])

  if (!nextUrgentExam) return null

  const days = daysUntilExam(nextUrgentExam.examDate)
  const isToday = days === 0

  return (
    <div
      onClick={() => navigate('/emergency')}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 18px',
        borderRadius: 12,
        background: isToday ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)',
        border: `2px solid ${isToday ? 'rgba(239,68,68,0.6)' : 'rgba(239,68,68,0.3)'}`,
        cursor: 'pointer',
        marginBottom: 16,
        transition: 'background 0.2s',
      }}
    >
      <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#ef4444' }}>
          {isToday
            ? `Your ${nextUrgentExam.subject} exam is TODAY`
            : `${nextUrgentExam.subject} exam in ${days} day${days !== 1 ? 's' : ''}`}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Tap to open Emergency Mode — AI revision plan for your last few days
        </p>
      </div>
      <div className="btn btn-primary btn-sm" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
        <Zap size={12} /> Open
      </div>
    </div>
  )
}
