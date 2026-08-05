// src/components/DailyQuests.jsx
// Shows 3 daily quests on the dashboard.
// Progress is tracked in Firestore at users/{uid}/quests/{today's date}
//
// This used to also have its own "Done" button that let a user self-report any quest as complete
// with zero verification that they'd actually done it — running in parallel with, and completely
// independent from, the real detection in autoCompleteQuest() (firestore.js), which fires from the
// actual action functions (completeSession, addNote, resolveMistake, etc.) when something genuinely
// happens. That meant quests could be "completed" without doing the thing at all, and (separately)
// it awarded its own 50 XP "all quests" bonus under a different reason string than the real one —
// two competing, drifting copies of the same bonus logic. Removed the button entirely: this
// component is now a pure read-only view of what autoCompleteQuest has actually detected, via the
// same onSnapshot listener it already had.

import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { getDailyQuests } from '../data/badges'
import { CheckCircle, Circle } from 'lucide-react'

export default function DailyQuests() {
  const { user } = useAuth()
  const [quests, setQuests] = useState([])
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(true)
  const today = new Date().toDateString().replace(/ /g, '_')

  useEffect(() => {
    if (!user) return
    // Set up quests for today
    const dailyQuests = getDailyQuests(user.uid)
    setQuests(dailyQuests)
    // Real-time listener — ticks automatically the moment autoCompleteQuest writes to this doc
    // from wherever the underlying real action happened (Calendar, Topics, Study, Mistakes, etc.)
    const ref = doc(db, 'users', user.uid, 'quests', today)
    const unsub = onSnapshot(ref, (snap) => {
      setProgress(snap.exists() ? snap.data() : {})
      setLoading(false)
    })
    return () => unsub()
  }, [user])

  const completedCount = quests.filter(q => progress[q.id]).length

  if (loading) return null

  return (
    <div className="card" style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Daily quests</h4>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: completedCount === quests.length && quests.length > 0 ? 'var(--success)' : 'var(--text-muted)',
          background: completedCount === quests.length && quests.length > 0 ? 'rgba(34,197,94,0.1)' : 'var(--bg-hover)',
          padding: '2px 8px',
          borderRadius: 20,
        }}>
          {completedCount}/{quests.length} done {completedCount === quests.length && quests.length > 0 ? '🎉 +50 bonus XP' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {quests.map(quest => {
          const done = !!progress[quest.id]
          return (
            <div
              key={quest.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: done ? 'rgba(34,197,94,0.08)' : 'var(--bg-surface)',
                border: `1px solid ${done ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                opacity: done ? 0.8 : 1,
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{quest.icon}</span>
              <span style={{
                flex: 1,
                fontSize: '0.85rem',
                textDecoration: done ? 'line-through' : 'none',
                color: done ? 'var(--text-muted)' : 'var(--text-primary)',
              }}>
                {quest.desc}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-light)', fontWeight: 600, flexShrink: 0 }}>
                +{quest.xp} XP
              </span>
              {done
                ? <CheckCircle size={16} color="var(--success)" style={{ flexShrink: 0 }} />
                : <Circle size={16} color="var(--text-muted)" style={{ flexShrink: 0, opacity: 0.5 }} />
              }
            </div>
          )
        })}
      </div>

      <p style={{ margin: '10px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        Quests complete automatically as you use the app, and reset at midnight. Complete all {quests.length||3} for a +50 XP bonus.
      </p>
    </div>
  )
}
