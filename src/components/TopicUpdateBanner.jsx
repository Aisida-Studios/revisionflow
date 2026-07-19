// src/components/TopicUpdateBanner.jsx
// Shows a one-time banner to all users when topics data has been updated.
// Dismissal is saved to Firestore so it persists across devices.

import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

// ── Bump this version string whenever you push a topics update ──
const CURRENT_TOPICS_VERSION = '3.0-as-level'

export default function TopicUpdateBanner() {
  const { user } = useAuth()
  const [show, setShow] = useState(false)
  const [dismissing, setDismissing] = useState(false)

  useEffect(() => {
    if (!user) return

    const check = async () => {
      try {
        const ref = doc(db, 'users', user.uid)
        const snap = await getDoc(ref)
        const seenVersion = snap.data()?.topicsVersionSeen

        if (seenVersion !== CURRENT_TOPICS_VERSION) {
          setShow(true)
        }
      } catch (err) {
        // Silently fail — don't block the app for a banner
        console.error('TopicUpdateBanner check failed:', err)
      }
    }

    check()
  }, [user])

  const dismiss = async () => {
    setDismissing(true)
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        { topicsVersionSeen: CURRENT_TOPICS_VERSION },
        { merge: true }
      )
    } catch (err) {
      console.error('Failed to save banner dismissal:', err)
    }
    setShow(false)
    setDismissing(false)
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.25rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      width: 'min(92vw, 480px)',
      background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
      borderRadius: '14px',
      padding: '1rem 1.25rem',
      boxShadow: '0 8px 32px rgba(79,70,229,0.35)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      color: '#fff',
      animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0);    }
        }
      `}</style>

      {/* Icon */}
      <div style={{
        fontSize: '1.4rem',
        lineHeight: 1,
        flexShrink: 0,
        marginTop: '2px',
      }}>
        📚
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.3 }}>
          AS-Level is here
        </p>
        <p style={{
          margin: '0.3rem 0 0',
          fontSize: '0.82rem',
          opacity: 0.88,
          lineHeight: 1.45,
        }}>
          AS-Level now has its own topic lists, kept completely separate from A-Level —
          same subject, different spec. Head to the{' '}
          <strong>Topics</strong> page to see the new data.
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        disabled={dismissing}
        aria-label="Dismiss"
        style={{
          flexShrink: 0,
          background: 'rgba(255,255,255,0.18)',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '0.8rem',
          fontWeight: 600,
          padding: '0.35rem 0.7rem',
          marginTop: '1px',
          whiteSpace: 'nowrap',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
      >
        {dismissing ? '...' : 'Got it'}
      </button>
    </div>
  )
}
