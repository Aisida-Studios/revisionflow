// src/pages/PublicProfile.jsx
import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getUserByUsername } from '../utils/firestore'
import { LEVELS, SUBJECT_COLOURS } from '../data/subjects'
import { BADGE_LIST } from '../data/badges'
import { Zap, Flame, Trophy } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'

export default function PublicProfile() {
  const { username } = useParams()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getUserByUsername(username).then(p => {
      if (p && (p.settings?.profilePublic !== false)) { setProfileData(p) }
      else setNotFound(true)
      setLoading(false)
    })
  }, [username])

  if (loading) return <LoadingScreen />

  if (notFound) return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,background:'var(--bg-base)'}}>
      <div style={{fontSize:'4rem'}}>👤</div>
      <h2>Profile not found</h2>
      <p>This user either doesn't exist or has a private profile.</p>
      <Link to="/" className="btn btn-primary">Go home</Link>
    </div>
  )

  const p = profileData
  const lvl = LEVELS[Math.min((p.level||1)-1,LEVELS.length-1)]
  const unlockedBadges = (p.badges||[]).map(id=>BADGE_LIST.find(b=>b.id===id)).filter(Boolean)

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-base)',padding:24}}>
      <div style={{maxWidth:640,margin:'0 auto'}}>
        {/* Nav */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:32}}>
          <Link to="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
            <Zap size={20} color="var(--accent-light)"/>
            <span style={{fontWeight:800}}>RevisionFlow</span>
          </Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Join free</Link>
        </div>

        <div className="card accent-card" style={{padding:32,textAlign:'center',marginBottom:20}}>
          <div style={{width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'2rem',margin:'0 auto 16px'}}>
            {(p.displayName||'U')[0].toUpperCase()}
          </div>
          <h2 style={{marginBottom:4}}>{p.displayName}</h2>
          {p.username&&<p style={{marginBottom:16}}>@{p.username}</p>}
          <div style={{display:'flex',gap:24,justifyContent:'center'}}>
            <div><div style={{fontSize:'1.5rem',fontWeight:800,color:'var(--accent-light)'}}>{(p.xp||0).toLocaleString()}</div><div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>XP</div></div>
            <div><div style={{fontSize:'1.5rem',fontWeight:800,color:'var(--warning)'}}>🔥{p.streak||0}</div><div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>Streak</div></div>
            <div><div style={{fontSize:'1.5rem',fontWeight:800,color:'var(--purple-300)'}}>Lv.{p.level||1}</div><div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{lvl?.title}</div></div>
          </div>
        </div>

        {p.settings?.friendsCanSeeGrades && (p.subjects||[]).length>0 && (
          <div className="card" style={{marginBottom:20}}>
            <h4 style={{marginBottom:12}}>Subjects</h4>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {p.subjects.map(s=>(
                <span key={s.name} style={{display:'flex',alignItems:'center',gap:6,padding:'4px 10px',borderRadius:999,background:SUBJECT_COLOURS[s.name]||'var(--accent)',color:'#fff',fontSize:'0.82rem',fontWeight:600}}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {unlockedBadges.length>0&&(
          <div className="card" style={{marginBottom:20}}>
            <h4 style={{marginBottom:12}}>Badges ({unlockedBadges.length})</h4>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {unlockedBadges.map(b=>(
                <div key={b.id} title={`${b.name}: ${b.desc}`} style={{width:48,height:48,borderRadius:10,background:'rgba(124,58,237,0.15)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.6rem'}}>
                  {b.icon}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{textAlign:'center',padding:24}}>
          <p style={{marginBottom:16}}>Track your own revision with RevisionFlow</p>
          <Link to="/signup" className="btn btn-primary">Start revising free →</Link>
        </div>
      </div>
    </div>
  )
}
