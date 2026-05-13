// src/pages/Leaderboard.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { checkAndAwardBadge, getLeaderboard, getGlobalLeaderboard, updateUserProfile } from '../utils/firestore'
import { LEVELS } from '../data/subjects'
import { PROFILE_ICONS } from '../data/themes'
import { Trophy, Flame, Zap, Globe, Users, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Leaderboard() {
  const { user, profile, refreshProfile } = useAuth()
  const [tab,          setTab]          = useState('friends')
  const [friendsBoard, setFriendsBoard] = useState([])
  const [globalBoard,  setGlobalBoard]  = useState([])
  const [loadingF,     setLoadingF]     = useState(true)
  const [loadingG,     setLoadingG]     = useState(false)

  useEffect(() => {
    if (!user || !profile) return
    getLeaderboard(Array.isArray(profile.friends) ? profile.friends : [], user.uid)
    // Check top_three badge on global board
    ;(async () => {
      try {
        const { getGlobalLeaderboard } = await import('../utils/firestore')
        const board = await getGlobalLeaderboard(10)
        const rank  = board.findIndex(u => u.uid === user.uid)
        if (rank >= 0 && rank < 3) checkAndAwardBadge(user.uid, 'top_three').catch(()=>{})
      } catch {}
    })()
      .then(d => { setFriendsBoard(d); setLoadingF(false) })
  }, [user, profile])

  useEffect(() => {
    if (tab !== 'global' || globalBoard.length) return
    setLoadingG(true)
    getGlobalLeaderboard(100).then(d => { setGlobalBoard(d); setLoadingG(false) })
  }, [tab])

  async function toggleHideName() {
    const newVal = !(profile?.hideNameFromLeaderboard)
    await updateUserProfile(user.uid, { hideNameFromLeaderboard: newVal })
    await refreshProfile()
    setGlobalBoard([])
    toast.success(newVal ? 'You now appear as "Anonymous" on the global board' : 'Your name is visible again')
  }

  async function toggleVisibility() {
    const isHidden = profile?.showOnGlobalLeaderboard === false
    await updateUserProfile(user.uid, { showOnGlobalLeaderboard: isHidden })
    await refreshProfile()
    setGlobalBoard([])
    toast.success(isHidden ? 'You are now visible on the global leaderboard' : 'You are now hidden from the global leaderboard')
  }

  const medals   = ['🥇','🥈','🥉']
  const isHidden = profile?.showOnGlobalLeaderboard === false

  function UserAvatar({ u, size = 40 }) {
    const iconId    = u.profileIcon || 'lightning'
    const iconEmoji = PROFILE_ICONS?.[iconId]?.emoji || null
    return (
      <div style={{
        width:size, height:size, borderRadius:'50%',
        background:'linear-gradient(135deg,var(--purple-700),var(--purple-400))',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize: iconEmoji ? size * 0.55 + 'px' : size * 0.4 + 'px',
        fontWeight:700, flexShrink:0, userSelect:'none',
      }}>
        {iconEmoji || (u.displayName||'A')[0].toUpperCase()}
      </div>
    )
  }

  function LeaderRow({ u, i, isMe, showBadges }) {
    const lvl = LEVELS[Math.min((u.level||1)-1, LEVELS.length-1)]
    return (
      <div className="card" style={{
        display:'flex', alignItems:'center', gap:14,
        background: isMe ? 'rgba(124,58,237,0.12)' : 'var(--bg-card)',
        border:     isMe ? '1px solid var(--accent)' : '1px solid var(--border)',
      }}>
        <div style={{width:36,textAlign:'center',fontWeight:800,fontSize:i<3?'1.5rem':'1.1rem',flexShrink:0}}>
          {i < 3 ? medals[i] : <span style={{color:'var(--text-muted)'}}>{i+1}</span>}
        </div>

        <UserAvatar u={u} size={40} />

        <div style={{flex:1,overflow:'hidden'}}>
          <div style={{fontWeight:700,fontSize:'0.95rem'}}>
            {u.displayName}
            {isMe && <span style={{color:'var(--accent-light)',fontSize:'0.75rem',marginLeft:6}}>(you)</span>}
          </div>
          <div style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>
            Level {u.level||1} · {lvl?.title}
            {showBadges && u.badges > 0 && ` · ${u.badges} badge${u.badges!==1?'s':''}`}
          </div>
        </div>

        <div style={{display:'flex',gap:16,alignItems:'center'}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontWeight:800,color:'var(--warning)',fontSize:'1.1rem',display:'flex',alignItems:'center',gap:4}}>
              <Flame size={14}/>{u.streak||0}
            </div>
            <div style={{fontSize:'0.68rem',color:'var(--text-muted)'}}>streak</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontWeight:800,color:'var(--accent-light)',fontSize:'1.1rem',display:'flex',alignItems:'center',gap:4}}>
              <Zap size={14}/>{(u.xp||0).toLocaleString()}
            </div>
            <div style={{fontSize:'0.68rem',color:'var(--text-muted)'}}>XP</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div>
          <h2 style={{display:'flex',alignItems:'center',gap:10}}><Trophy size={24} color="var(--warning)"/> Leaderboard</h2>
          <p>Ranked by total XP</p>
        </div>
        {tab==='global' && (
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <button className="btn btn-secondary btn-sm" onClick={toggleHideName}>
              <EyeOff size={14}/> {profile?.hideNameFromLeaderboard ? 'Show my name' : 'Hide my name'}
            </button>
            <button className={`btn btn-sm ${isHidden?'btn-primary':'btn-secondary'}`} onClick={toggleVisibility}>
              <Globe size={14}/> {isHidden ? 'Rejoin global' : 'Hide from global'}
            </button>
          </div>
        )}
      </div>

      <div className="tabs" style={{marginBottom:20}}>
        <button className={`tab${tab==='friends'?' active':''}`} onClick={()=>setTab('friends')}>
          <Users size={14} style={{marginRight:5}}/> Friends
        </button>
        <button className={`tab${tab==='global'?' active':''}`} onClick={()=>setTab('global')}>
          <Globe size={14} style={{marginRight:5}}/> Global Top 100
        </button>
      </div>

      {tab==='friends' && (
        loadingF ? <div className="loading-center"><div className="spinner"/></div> :
        friendsBoard.length===0 ? (
          <div className="empty-state"><Trophy size={48} style={{opacity:0.3}}/><p>Add friends to compete on the friends leaderboard</p></div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {friendsBoard.map((u,i)=><LeaderRow key={u.id} u={u} i={i} isMe={u.id===user.uid} showBadges={false}/>)}
          </div>
        )
      )}

      {tab==='global' && (
        <>
          {isHidden && (
            <div style={{padding:'8px 14px',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:'var(--radius-md)',fontSize:'0.82rem',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
              <EyeOff size={14} color="var(--warning)"/>
              You are hidden from the global leaderboard.
            </div>
          )}
          {loadingG ? <div className="loading-center"><div className="spinner"/></div> :
           globalBoard.length===0 ? <div className="empty-state"><p>No users yet</p></div> : (
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {globalBoard.map((u,i)=><LeaderRow key={u.id||i} u={u} i={i} isMe={u.id===user.uid} showBadges={true}/>)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
