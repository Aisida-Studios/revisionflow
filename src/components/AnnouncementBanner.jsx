// src/components/AnnouncementBanner.jsx
// Shows the single most relevant admin-authored announcement for the signed-in student
// (see netlify/functions/announcements.js — audience targeting is resolved server-side from
// the caller's own verified token, not trusted from the client).
//
// NOT YET MOUNTED ANYWHERE. This is a ready-to-drop-in component — actually showing it
// needs one import + one line in the app's root layout (Layout.jsx / App.jsx), both of
// which are shared infrastructure outside this chat's file ownership. See the delivery
// notes for the exact one-line change needed.
//
// Dismissal pattern (localStorage + Firestore sync) mirrors the existing, currently-
// unmounted UpdatePrompt.jsx component exactly, for consistency with how this app already
// does "seen this, don't show it again" — including across a student's own devices.
import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { X, Info, CheckCircle, AlertTriangle } from 'lucide-react'

const TYPE_STYLE = {
  info:    { bg: 'var(--accent-pale)',  border: 'var(--accent)',         fg: 'var(--accent)',  Icon: Info },
  success: { bg: 'var(--success-pale)', border: 'var(--success-border)', fg: 'var(--success)', Icon: CheckCircle },
  warning: { bg: 'var(--warning-pale)', border: 'var(--warning-border)', fg: 'var(--warning)',  Icon: AlertTriangle },
}

async function fetchActiveAnnouncements(user) {
  const idToken = await user.getIdToken()
  const res = await fetch('/api/announcements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
    body: JSON.stringify({ action: 'active' }),
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || 'Failed to load announcements')
  return data.announcements || []
}

export default function AnnouncementBanner() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [dismissedIds, setDismissedIds] = useState(new Set())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    fetchActiveAnnouncements(user)
      .then(async list => {
        if (cancelled) return
        // Cross-device dismissal record — same collection/doc UpdatePrompt already uses,
        // keyed by announcement id instead of a single hardcoded update id.
        let remoteDismissed = {}
        try {
          const snap = await getDoc(doc(db, 'users', user.uid, 'meta', 'announcementDismissals'))
          if (snap.exists()) remoteDismissed = snap.data() || {}
        } catch (_) {}
        const dismissed = new Set(Object.keys(remoteDismissed).filter(k => remoteDismissed[k]))
        for (const a of list) {
          if (localStorage.getItem('announcement-dismissed-' + a.id) === '1') dismissed.add(a.id)
        }
        if (!cancelled) {
          setDismissedIds(dismissed)
          setItems(list)
          setLoaded(true)
        }
      })
      .catch(() => setLoaded(true)) // fail quiet — a broken banner should never block the app
    return () => { cancelled = true }
  }, [user])

  async function dismiss(id) {
    setDismissedIds(prev => new Set(prev).add(id))
    localStorage.setItem('announcement-dismissed-' + id, '1')
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'meta', 'announcementDismissals'),
          { [id]: true, [`${id}_dismissedAt`]: serverTimestamp() }, { merge: true })
      } catch (_) {}
    }
  }

  if (!loaded) return null
  const current = items.find(a => !dismissedIds.has(a.id))
  if (!current) return null

  const style = TYPE_STYLE[current.type] || TYPE_STYLE.info
  const Icon = style.Icon

  return (
    <div style={{
      marginBottom: 20, padding: '14px 18px',
      background: style.bg, border: `1px solid ${style.border}`, borderRadius: 'var(--radius-lg)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div style={{ background: style.fg, padding: 7, borderRadius: 8, flexShrink: 0, display: 'flex' }}>
          <Icon size={16} color="white" />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{current.message}</div>
          {current.linkUrl && (
            <a href={current.linkUrl} style={{ fontSize: '0.8rem', fontWeight: 600, color: style.fg }}>
              {current.linkText || 'Learn more'} →
            </a>
          )}
        </div>
      </div>
      <button onClick={() => dismiss(current.id)} aria-label="Dismiss"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, flexShrink: 0 }}>
        <X size={16} />
      </button>
    </div>
  )
}
