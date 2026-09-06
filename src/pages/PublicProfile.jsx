// src/pages/PublicProfile.jsx
import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { LEVELS, SUBJECT_COLOURS } from '../data/subjects'
import { BADGE_LIST } from '../data/badges'
import { resolveProfileIcon } from '../data/themes'
import { Zap, Star } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import './AccountPages.css'

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
      justifyContent:'center', gap:16, background:'var(--bg-base)', padding:24, textAlign:'center' }}>
      <div className="ap-icon-circle" style={{ width:64, height:64 }}><Star size={28} /></div>
      <h2>Profile not found</h2>
      <p style={{ color:'var(--text-muted)', maxWidth:320 }}>
        This user either doesn&apos;t exist or has a private profile.
      </p>
      <Link to="/signup" className="btn btn-primary">Join RevisionFlow free</Link>
    </div>
  )

  const p = profileData
  const lvl = LEVELS[Math.min((p.level||1)-1, LEVELS.length-1)]
  const unlockedBadges = (p.badges||[]).map(id => BADGE_LIST.find(b => b.id===id)).filter(Boolean)
  const iconEmoji = resolveProfileIcon(p.profileIcon).emoji

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', padding:24 }}>
      <div className="ap-page ap-page--narrow">

        {/* Nav — works for signed-out users too */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
          <Link to="/" className="pp-logo" style={{ textDecoration:'none' }}>
            <div className="pp-logo-mark"><Zap size={19} color="#fff" /></div>
            <span className="pp-logo-word">Revision<span>Flow</span></span>
          </Link>
          <div style={{ display:'flex', gap:8 }}>
            <Link to="/login"  className="btn btn-ghost btn-sm">Log in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Join free</Link>
          </div>
        </div>

        {/* Hero card */}
        <div className="card accent-card" style={{ padding:32, textAlign:'center', marginBottom:20 }}>
          <div className="ap-avatar ap-avatar--xl" style={{ margin:'0 auto 16px', fontSize: iconEmoji ? '2.4rem' : undefined }}>
            {iconEmoji || (p.displayName||'U')[0].toUpperCase()}
          </div>
          <h2 style={{ marginBottom:4 }}>{p.displayName || 'Anonymous'}</h2>
          {p.username && (
            <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:16 }}>
              @{p.username}
            </p>
          )}
          {lvl && (
            <div className="badge badge-accent" style={{ marginBottom:16 }}>
              <Star size={12} /> Level {p.level||1} — {lvl.title}
            </div>
          )}
          <div style={{ display:'flex', gap:28, justifyContent:'center', flexWrap:'wrap' }}>
            <div>
              <div className="stat-num" style={{ color:'var(--accent-light)' }}>{(p.xp||0).toLocaleString()}</div>
              <div className="stat-cap">XP earned</div>
            </div>
            <div>
              <div className="stat-num" style={{ color:'var(--warning)' }}><span className="streak-fire">🔥</span> {p.streak||0}</div>
              <div className="stat-cap">Day streak</div>
            </div>
            <div>
              <div className="stat-num" style={{ color:'var(--accent-light)' }}>{unlockedBadges.length}</div>
              <div className="stat-cap">Badges</div>
            </div>
          </div>
        </div>

        {/* Subjects (only if settings allow) */}
        {p.settings?.friendsCanSeeGrades !== false && (p.subjects||[]).length > 0 && (
          <div className="card" style={{ marginBottom:20 }}>
            <h4 className="card-eyebrow" style={{ marginBottom:12, fontSize:'0.9rem' }}>Subjects</h4>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {p.subjects.map(s => (
                <span key={s.name} className="badge" style={{
                  background: SUBJECT_COLOURS[s.name] || 'var(--accent)',
                  color:'#fff', borderColor:'transparent' }}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        {unlockedBadges.length > 0 && (
          <div className="card" style={{ marginBottom:20 }}>
            <h4 className="card-eyebrow" style={{ marginBottom:12, fontSize:'0.9rem' }}>
              Badges <span style={{ color:'var(--text-muted)', fontWeight:400 }}>({unlockedBadges.length})</span>
            </h4>
            <div className="ap-badge-grid">
              {unlockedBadges.map(b => (
                <div key={b.id} className="ap-badge-chip ap-badge-chip--earned" title={b.name + ': ' + b.desc}>
                  <span className="ap-badge-chip-icon">{b.icon}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="card accent-card" style={{ textAlign:'center', padding:'28px 24px' }}>
          <div className="ap-icon-circle" style={{ margin:'0 auto 12px' }}><Zap size={18} /></div>
          <h4 style={{ marginBottom:6 }}>Track your own revision</h4>
          <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginBottom:16, maxWidth:300, marginLeft:'auto', marginRight:'auto' }}>
            Join {p.displayName?.split(' ')[0] || 'them'} on RevisionFlow — free revision platform for UK GCSE, AS-Level &amp; A-Level.
          </p>
          <Link to="/signup" className="btn btn-primary">Start revising free →</Link>
        </div>

      </div>
    </div>
  )
}
