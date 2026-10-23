// src/pages/PublicProfile.jsx
import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { LEVELS, levelFromXP } from '../data/subjects'
import { BADGE_LIST } from '../data/badges'
import { resolveProfileIcon } from '../data/themes'
import SubjectTile from '../components/illustrations/SubjectTile'
import BadgeArt from '../components/illustrations/BadgeArt'
import { Zap, Star } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import './AccountPages.css'
import './Profile.css'

export default function PublicProfile() {
  const { username } = useParams()
  const [profileData, setProfileData] = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [notFound,    setNotFound]    = useState(false)

  useEffect(() => {
    if (!username) { setNotFound(true); setLoading(false); return }

    // getUserByUsername (src/utils/firestore.js) now calls netlify/functions/public-data.js,
    // which tries `username` as a uid first, then as a username field, and checks
    // settings.profilePublic server-side — so a private profile's data never reaches the
    // client at all, not just its rendering. No auth required, matching the existing
    // "a logged-out visitor can open a shared profile link" behaviour.
    import('../utils/firestore').then(({ getUserByUsername }) => {
      getUserByUsername(username).then(p => {
        if (p) setProfileData(p)
        else setNotFound(true)
        setLoading(false)
      }).catch(() => { setNotFound(true); setLoading(false) })
    })
  }, [username])

  // Student pages should not be indexed by search engines.
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => { meta.remove() }
  }, [])

  useEffect(() => {
    if (!profileData) return
    const previous = document.title
    document.title = (profileData.displayName || 'Student') + ' on RevisionFlow'
    return () => { document.title = previous }
  }, [profileData])

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
  const level = levelFromXP(p.xp)
  const lvl = LEVELS[Math.min(level - 1, LEVELS.length - 1)]
  const unlockedBadges = (p.badges||[]).map(id => BADGE_LIST.find(b => b.id===id)).filter(Boolean)
  const iconEmoji = resolveProfileIcon(p.profileIcon).emoji

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', padding:24 }}>
      <div className="ap-page ap-page--narrow">

        {/* Nav — works for signed-out users too */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', rowGap:12, marginBottom:32 }}>
          <Link to="/" className="pp-logo" style={{ textDecoration:'none' }}>
            <div className="pp-logo-mark"><Zap size={19} color="#fff" /></div>
            <span className="pp-logo-word">Revision<span>Flow</span></span>
          </Link>
          <div style={{ display:'flex', gap:8, marginLeft:'auto' }}>
            <Link to="/login"  className="btn btn-ghost btn-sm">Log in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Join free</Link>
          </div>
        </div>

        {/* Hero card */}
        <div className="card accent-card" style={{ padding:'28px 20px', textAlign:'center', marginBottom:20 }}>
          <div className="ap-avatar ap-avatar--xl" style={{ margin:'0 auto 16px', fontSize: iconEmoji ? '2.4rem' : undefined }}>
            {iconEmoji || (p.displayName||'U')[0].toUpperCase()}
          </div>
          <h2 style={{ marginBottom:4 }}>{p.displayName || 'Anonymous'}</h2>
          {p.username && (
            <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:4 }}>@{p.username}</p>
          )}
          {lvl && <p className="pf-level">Level {level} · {lvl.title}</p>}
          <div className="pf-stats" style={{ marginBottom:0 }}>
            <div><div className="pf-stat-num">{(p.xp||0).toLocaleString()}</div><div className="pf-stat-cap">XP</div></div>
            <div><div className="pf-stat-num">{p.streak||0}</div><div className="pf-stat-cap">Day streak</div></div>
            <div><div className="pf-stat-num">{unlockedBadges.length}</div><div className="pf-stat-cap">Badges</div></div>
          </div>
        </div>

        {/* Subjects: the server sends names only, and nothing if the student hides them */}
        {(p.subjects||[]).length > 0 && (
          <div className="card" style={{ marginBottom:20 }}>
            <h4 className="card-eyebrow" style={{ marginBottom:12, fontSize:'0.9rem' }}>Subjects</h4>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {p.subjects.map(s => (
                <span key={s.name} className="badge badge-grey"
                  style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'4px 12px 4px 4px', borderRadius:999 }}>
                  <SubjectTile subject={s.name} size={28} />
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
            <div className="ap-badge-tile-grid">
              {unlockedBadges.map(b => (
                <div key={b.id} className="ap-badge-tile ap-badge-tile--earned">
                  <div className="ap-badge-tile-icon"><BadgeArt id={b.id} size={56} /></div>
                  <div className="ap-badge-tile-name">{b.name}</div>
                  <div className="ap-badge-tile-desc">{b.desc}</div>
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
            RevisionFlow helps UK GCSE, AS-Level and A-Level students plan and track their revision.
          </p>
          <Link to="/signup" className="btn btn-primary">Create your account</Link>
        </div>

      </div>
    </div>
  )
}
