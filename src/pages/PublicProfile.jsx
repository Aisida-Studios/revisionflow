// src/pages/PublicProfile.jsx
import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getUserByUsername } from '../utils/firestore'
import { LEVELS, SUBJECT_COLOURS } from '../data/subjects'
import { BADGE_LIST } from '../data/badges'
import { PROFILE_ICONS } from '../data/themes'
import { Zap, Flame, Trophy, Star } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'

export default function PublicProfile() {
  const { username } = useParams()
  const [profileData, setProfileData] = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [notFound,    setNotFound]    = useState(false)

  useEffect(() => {
    if (!username) { setNotFound(true); setLoading(false); return }

    // Strategy:
    // 1. Try treating `username` as a uid (direct doc GET — always allowed, even without login)
    // 2. If the doc exists and has a matching username field → show it
    // 3. If the doc's username doesn't match, try a WHERE username==x query
    //    (requires login under new Firestore rules)
    // 4. Fall back to "not found"
    import('../utils/firestore').then(({ getUserByUsername }) => {
      // First try direct uid lookup
      import('firebase/firestore').then(({ doc, getDoc }) => {
        import('../firebase').then(({ db }) => {
          getDoc(doc(db, 'users', username)).then(snap => {
            if (snap.exists()) {
              const p = { uid: snap.id, ...snap.data() }
              if (p.settings?.profilePublic !== false) {
                setProfileData(p); setLoading(false)
              } else {
                setNotFound(true); setLoading(false)
              }
              return
            }
            // Not a uid — try username query (may require auth)
            getUserByUsername(username).then(p => {
              if (p && p.settings?.profilePublic !== false) {
                setProfileData(p)
              } else {
                setNotFound(true)
              }
              setLoading(false)
            }).catch(() => { setNotFound(true); setLoading(false) })
          }).catch(() => { setNotFound(true); setLoading(false) })
        })
      })
    })
  }, [username])

  if (loading) return <LoadingScreen />

  if (notFound) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', gap:16, background:'var(--bg-base)' }}>
      <div style={{ fontSize:'4rem' }}>👤</div>
      <h2>Profile not found</h2>
      <p style={{ color:'var(--text-muted)', textAlign:'center', maxWidth:320 }}>
        This user either doesn&apos;t exist or has a private profile.
      </p>
      <Link to="/signup" className="btn btn-primary">Join RevisionFlow free</Link>
    </div>
  )

  const p = profileData
  const lvl = LEVELS[Math.min((p.level||1)-1, LEVELS.length-1)]
  const unlockedBadges = (p.badges||[]).map(id => BADGE_LIST.find(b => b.id===id)).filter(Boolean)
  const iconId    = p.profileIcon || 'lightning'
  const iconEmoji = PROFILE_ICONS?.[iconId]?.emoji || null

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', padding:24 }}>
      <div style={{ maxWidth:640, margin:'0 auto' }}>

        {/* Nav — works for signed-out users too */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}>
            <Zap size={20} color="var(--accent-light)" />
            <span style={{ fontWeight:800, color:'var(--text-primary)' }}>RevisionFlow</span>
          </Link>
          <div style={{ display:'flex', gap:8 }}>
            <Link to="/login"  className="btn btn-ghost btn-sm">Log in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Join free</Link>
          </div>
        </div>

        {/* Hero card */}
        <div className="card accent-card" style={{ padding:32, textAlign:'center', marginBottom:20 }}>
          <div style={{ width:80, height:80, borderRadius:'50%',
            background:'linear-gradient(135deg,#7c3aed,#a855f7)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontWeight:800, fontSize:'2.2rem', margin:'0 auto 16px' }}>
            {iconEmoji || (p.displayName||'U')[0].toUpperCase()}
          </div>
          <h2 style={{ marginBottom:4 }}>{p.displayName || 'Anonymous'}</h2>
          {p.username && (
            <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:16 }}>
              @{p.username}
            </p>
          )}
          {lvl && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px',
              borderRadius:999, background:'rgba(124,58,237,0.12)', marginBottom:16,
              fontSize:'0.8rem', fontWeight:700, color:'var(--accent-light)' }}>
              <Star size={12} /> Level {p.level||1} — {lvl.title}
            </div>
          )}
          <div style={{ display:'flex', gap:28, justifyContent:'center', flexWrap:'wrap' }}>
            <div>
              <div style={{ fontSize:'1.6rem', fontWeight:800, color:'var(--accent-light)' }}>
                {(p.xp||0).toLocaleString()}
              </div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>XP earned</div>
            </div>
            <div>
              <div style={{ fontSize:'1.6rem', fontWeight:800, color:'var(--warning)' }}>
                🔥 {p.streak||0}
              </div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>Day streak</div>
            </div>
            <div>
              <div style={{ fontSize:'1.6rem', fontWeight:800, color:'var(--purple-300)' }}>
                {unlockedBadges.length}
              </div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>Badges</div>
            </div>
          </div>
        </div>

        {/* Subjects (only if settings allow) */}
        {p.settings?.friendsCanSeeGrades !== false && (p.subjects||[]).length > 0 && (
          <div className="card" style={{ marginBottom:20 }}>
            <h4 style={{ marginBottom:12, fontSize:'0.9rem' }}>Subjects</h4>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {p.subjects.map(s => (
                <span key={s.name} style={{ display:'flex', alignItems:'center', gap:6,
                  padding:'4px 12px', borderRadius:999,
                  background: SUBJECT_COLOURS[s.name] || 'var(--accent)',
                  color:'#fff', fontSize:'0.82rem', fontWeight:600 }}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        {unlockedBadges.length > 0 && (
          <div className="card" style={{ marginBottom:20 }}>
            <h4 style={{ marginBottom:12, fontSize:'0.9rem' }}>
              Badges <span style={{ color:'var(--text-muted)', fontWeight:400 }}>({unlockedBadges.length})</span>
            </h4>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {unlockedBadges.map(b => (
                <div key={b.id} title={b.name + ': ' + b.desc}
                  style={{ width:48, height:48, borderRadius:10,
                    background:'rgba(124,58,237,0.1)', border:'1px solid var(--border)',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem',
                    cursor:'default' }}>
                  {b.icon}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign:'center', padding:'28px 24px', borderRadius:16,
          background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.15)' }}>
          <div style={{ fontSize:'1.5rem', marginBottom:8 }}>⚡</div>
          <h4 style={{ marginBottom:6 }}>Track your own revision</h4>
          <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginBottom:16, maxWidth:300, margin:'0 auto 16px' }}>
            Join {p.displayName?.split(' ')[0] || 'them'} on RevisionFlow — free AI-powered revision for UK GCSE &amp; A-Level.
          </p>
          <Link to="/signup" className="btn btn-primary">Start revising free →</Link>
        </div>

      </div>
    </div>
  )
}
