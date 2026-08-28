// src/context/BadgeContext.jsx
// Listens to the user's Firestore profile for new badges in real time.
// When a new badge appears, fires either a toast (minor) or full-screen celebration (rare).

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'
import { BADGE_MAP } from '../data/badges'
import toast from 'react-hot-toast'

// Rare badges get the full-screen treatment. Previously referenced session_100, paper_50,
// perfect_paper, grade_9, all_subjects and monthly_master — none of which exist as ids in
// BADGE_LIST (see data/badges.js) at all, only in a separate, older 14-badge list in
// data/subjects.js that this component used to import badge details from instead. That mismatch
// meant BADGES.find(b => b.id === id) returned undefined for roughly 25 of the real 30 badges,
// so `if (!badge) return` silently skipped the popup entirely for most actual badge awards.
const RARE_BADGE_IDS = [
  'streak_30', 'streak_100', 'mastery_gold', 'fifty_papers',
  'full_marks', 'marathon_session', 'quests_complete',
]

const BadgeContext = createContext(null)

export function BadgeProvider({ children }) {
  const { user } = useAuth()
  const [celebration, setCelebration] = useState(null)  // badge object for full-screen
  const knownBadgesRef = useRef(null)  // tracks what we already know about

  useEffect(() => {
    if (!user) return

    const unsub = onSnapshot(doc(db, 'users', user.uid), snap => {
      if (!snap.exists()) return
      const current = snap.data().badges || []

      // On first load, mark all current badges as seen in localStorage
      if (knownBadgesRef.current === null) {
        const stored = localStorage.getItem(`seen_badges_${user.uid}`)
        const seenSet = stored ? new Set(JSON.parse(stored)) : new Set(current)
        
        // Add current to seen set to be sure (syncing DB with LocalStorage)
        current.forEach(id => seenSet.add(id))
        localStorage.setItem(`seen_badges_${user.uid}`, JSON.stringify([...seenSet]))
        
        knownBadgesRef.current = seenSet
        return
      }

      // Find badges in 'current' that aren't in our 'seen' set
      const newBadges = current.filter(id => !knownBadgesRef.current.has(id))
      
      if (newBadges.length > 0) {
        const updatedSet = new Set(knownBadgesRef.current)
        newBadges.forEach(id => {
          updatedSet.add(id)
          const badge = BADGE_MAP[id]
          if (!badge) return

          if (RARE_BADGE_IDS.includes(id)) {
            setCelebration(badge)
          } else {
            toast.custom((t) => (
              <BadgeToast badge={badge} visible={t.visible} onDismiss={() => toast.dismiss(t.id)}/>
            ), { duration: 5000 })
          }
        })
        knownBadgesRef.current = updatedSet
        localStorage.setItem(`seen_badges_${user.uid}`, JSON.stringify([...updatedSet]))
      }
    })

    return () => unsub()
  }, [user])

  return (
    <BadgeContext.Provider value={{ celebration, setCelebration }}>
      {children}
      {celebration && (
        <BadgeCelebration badge={celebration} onClose={() => setCelebration(null)}/>
      )}
    </BadgeContext.Provider>
  )
}

export function useBadge() {
  return useContext(BadgeContext)
}

// ── Toast notification (minor badges) ────────────────────────────────────────
function BadgeToast({ badge, visible, onDismiss }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      background: 'var(--bg-card)',
      border: '1px solid var(--accent)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 8px 32px rgba(20,83,45,0.25)',
      maxWidth: 340,
      animation: visible ? 'slideInRight 0.3s ease' : 'slideOutRight 0.3s ease',
      cursor: 'pointer',
    }} onClick={onDismiss}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: 'var(--accent-pale)',
        border: '1px solid var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.8rem', flexShrink: 0,
      }}>
        {badge.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Badge unlocked!
          </span>
        </div>
        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{badge.name}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{badge.desc}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--warning)', marginTop: 3, fontWeight: 600 }}>+{badge.xp} XP</div>
      </div>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
      `}</style>
    </div>
  )
}

// ── Full-screen celebration (rare badges) ─────────────────────────────────────
function BadgeCelebration({ badge, onClose }) {
  const [phase, setPhase] = useState('enter')  // enter → show → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 100)
    const t2 = setTimeout(() => setPhase('exit'), 4500)
    const t3 = setTimeout(() => onClose(), 5000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      transition: 'opacity 0.5s',
      opacity: phase === 'enter' ? 0 : phase === 'exit' ? 0 : 1,
      cursor: 'pointer',
    }}>
      {/* Confetti particles */}
      <Confetti/>

      {/* Badge card */}
      <div style={{
        textAlign: 'center',
        transform: phase === 'enter' ? 'scale(0.5) translateY(40px)' : phase === 'exit' ? 'scale(0.95) translateY(-20px)' : 'scale(1) translateY(0)',
        transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        maxWidth: 360, padding: 16,
        maxHeight: '90dvh', overflowY: 'auto',
      }}>
        {/* Glow ring */}
        <div style={{
          width: 140, height: 140,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.35) 0%, rgba(34,197,94,0) 70%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          animation: 'badgePulse 1.5s ease-in-out infinite',
        }}>
          <div style={{
            width: 110, height: 110,
            borderRadius: '50%',
            background: 'var(--brand-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3.5rem',
            boxShadow: '0 0 50px rgba(34,197,94,0.7), 0 0 100px rgba(34,197,94,0.35)',
          }}>
            {badge.icon}
          </div>
        </div>

        <div style={{
          fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-light)',
          textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8,
        }}>
          🏆 Badge Unlocked!
        </div>

        <div style={{
          fontSize: '2rem', fontWeight: 800, color: '#fff',
          marginBottom: 8, lineHeight: 1.2,
        }}>
          {badge.name}
        </div>

        <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>
          {badge.desc}
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 20px',
          background: 'rgba(245,158,11,0.2)',
          border: '1px solid rgba(245,158,11,0.4)',
          borderRadius: 999,
          color: 'var(--warning)', fontWeight: 700, fontSize: '1.1rem',
        }}>
          ✨ +{badge.xp} XP
        </div>

        <div style={{ marginTop: 20, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
          Tap anywhere to close
        </div>
      </div>

      <style>{`
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// ── Simple confetti ───────────────────────────────────────────────────────────
function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left:     `${Math.random() * 100}%`,
    delay:    `${Math.random() * 0.8}s`,
    duration: `${1.5 + Math.random() * 1.5}s`,
    size:     `${6 + Math.random() * 8}px`,
    color:    ['#16a34a','#0d9488','#f59e0b','#10b981','#3b82f6','#ef4444','#ec4899'][Math.floor(Math.random()*7)],
    shape:    Math.random() > 0.5 ? '50%' : '2px',
  }))

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          top: '-20px',
          left: p.left,
          width: p.size,
          height: p.size,
          background: p.color,
          borderRadius: p.shape,
          animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
        }}/>
      ))}
    </div>
  )
}
