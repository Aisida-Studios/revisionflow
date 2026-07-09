// src/components/StreakCelebration.jsx
// Duolingo-style streak animation that fires when user extends their streak.
// Usage: <StreakCelebration streak={7} onClose={() => setShowStreak(false)} />

import { useState, useEffect } from 'react'
import { Flame } from 'lucide-react'

// Confetti piece
function Piece({ colour, x, delay, duration, size }) {
  return (
    <div style={{
      position: 'absolute',
      left: x + '%',
      top: '-10px',
      width: size,
      height: size,
      borderRadius: size / 2,
      background: colour,
      animation: `confettiFall ${duration}s ${delay}s cubic-bezier(0.25,0.46,0.45,0.94) forwards`,
    }} />
  )
}

const COLOURS = ['#7c3aed','#a855f7','#f59e0b','#10b981','#3b82f6','#f43f5e','#ec4899','#06b6d4']

export default function StreakCelebration({ streak, onClose }) {
  const [visible, setVisible] = useState(true)
  const [count,   setCount]   = useState(0)

  // Animate the number counting up
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setCount(i)
      if (i >= streak) clearInterval(interval)
    }, 60)
    return () => clearInterval(interval)
  }, [streak])

  // Auto-close after 3.5s
  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onClose?.() }, 3500)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    colour: COLOURS[i % COLOURS.length],
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 1.5 + Math.random() * 1.2,
    size: 6 + Math.random() * 8,
  }))

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes streakPop {
          0%   { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          50%  { transform: scale(1.15) rotate(4deg); opacity: 1; }
          70%  { transform: scale(0.95) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes fireWobble {
          0%,100% { transform: scale(1) rotate(-3deg); filter: brightness(1); }
          25%      { transform: scale(1.1) rotate(3deg); filter: brightness(1.3); }
          75%      { transform: scale(0.95) rotate(-1deg); filter: brightness(0.95); }
        }
        @keyframes bgFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cardBounce {
          0%   { transform: scale(0.7) translateY(40px); opacity: 0; }
          60%  { transform: scale(1.05) translateY(-8px); opacity: 1; }
          80%  { transform: scale(0.98) translateY(2px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={() => { setVisible(false); onClose?.() }}
        style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'bgFadeIn 0.2s ease forwards',
          overflow: 'hidden',
        }}>

        {/* Confetti */}
        {pieces.map(p => <Piece key={p.id} {...p} />)}

        {/* Card */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'white',
            borderRadius: 28,
            padding: '40px 48px',
            textAlign: 'center',
            maxWidth: 340,
            width: '90%',
            boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
            animation: 'cardBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
            position: 'relative',
            border: '3px solid #f3e8ff',
          }}>

          {/* Fire emoji with wobble */}
          <div style={{
            fontSize: '5rem', lineHeight: 1, marginBottom: 8,
            animation: 'fireWobble 1.4s ease-in-out infinite',
            display: 'inline-block',
          }}>🔥</div>

          {/* Streak count */}
          <div style={{
            fontSize: '5.5rem', fontWeight: 900, lineHeight: 1,
            color: '#f59e0b', letterSpacing: '-0.04em',
            animation: 'streakPop 0.5s 0.2s cubic-bezier(0.34,1.56,0.64,1) both',
            textShadow: '0 4px 0 #d97706',
          }}>
            {count}
          </div>

          <div style={{
            fontSize: '1.1rem', fontWeight: 900, color: '#1e1033',
            marginTop: 8, marginBottom: 6, letterSpacing: '-0.01em',
          }}>
            Day Streak! 🎉
          </div>

          <p style={{
            fontSize: '0.9rem', color: '#6b7280', margin: '0 0 24px',
            lineHeight: 1.6,
          }}>
            {streak >= 30
              ? "You're absolutely crushing it. Legendary focus! 💪"
              : streak >= 14
              ? "Two weeks strong! Your dedication is paying off."
              : streak >= 7
              ? "One whole week of revising every day. Keep it up!"
              : streak >= 3
              ? "Three days in a row — you're building a habit!"
              : "You're on a roll! Come back tomorrow to keep it going."}
          </p>

          {/* Keep it going bar */}
          <div style={{
            background: '#f3e8ff', borderRadius: 999, height: 10, marginBottom: 20,
            overflow: 'hidden', border: '2px solid #e9d5ff',
          }}>
            <div style={{
              height: '100%', borderRadius: 999,
              background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
              width: `${Math.min(100, (streak / 30) * 100)}%`,
              transition: 'width 1.2s 0.5s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: '0 0 8px rgba(168,85,247,0.6)',
            }} />
          </div>

          <button
            onClick={() => { setVisible(false); onClose?.() }}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: '#fff', border: 'none', borderRadius: 999,
              padding: '13px 32px', fontSize: '1rem', fontWeight: 800,
              cursor: 'pointer', width: '100%',
              boxShadow: '0 4px 0 #5b21b6, 0 6px 20px rgba(124,58,237,0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 0 #5b21b6, 0 10px 24px rgba(124,58,237,0.4)' }}
            onMouseLeave={e => { e.target.style.transform = ''; e.target.style.boxShadow = '0 4px 0 #5b21b6, 0 6px 20px rgba(124,58,237,0.35)' }}
            onMouseDown={e => { e.target.style.transform = 'translateY(2px)'; e.target.style.boxShadow = '0 1px 0 #5b21b6' }}>
            Keep it up! 💪
          </button>
        </div>
      </div>
    </>
  )
}
