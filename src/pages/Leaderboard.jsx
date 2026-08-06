// src/pages/Leaderboard.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getLeaderboard, getGlobalLeaderboard,
  updateUserProfile, checkAndAwardBadge,
} from '../utils/firestore'
import { resolveProfileIcon } from '../data/themes'
import toast from 'react-hot-toast'
import { Trophy, Users, Globe, Lock, Crown } from 'lucide-react'

function Avatar({ icon, name, size = 32 }) {
  const emoji = icon ? resolveProfileIcon(icon).emoji : null
  const letter = (name || 'A')[0].toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg,var(--purple-700),var(--purple-400))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: emoji ? size * 0.55 + 'px' : size * 0.4 + 'px',
      fontWeight: 700, userSelect: 'none',
    }}>
      {emoji || letter}
    </div>
  )
}

function RankBadge({ rank }) {
  const medals = ['🥇', '🥈', '🥉']
  if (rank < 3) return <span style={{ fontSize: '1.4rem' }}>{medals[rank]}</span>
  return (
    <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>
      {rank + 1}
    </span>
  )
}

function BoardRow({ entry, rank, isMe }) {
  const name = entry.hideNameFromLeaderboard ? 'Anonymous' : (entry.displayName || 'Anonymous')
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px', borderRadius: 10,
      background: isMe ? 'rgba(124,58,237,0.1)' : 'var(--bg-surface)',
      border: `1px solid ${isMe ? 'rgba(124,58,237,0.35)' : 'var(--border)'}`,
    }}>
      <RankBadge rank={rank} />
      <Avatar icon={entry.profileIcon} name={name} />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontWeight: isMe ? 700 : 500, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name} {isMe && <span style={{ fontSize: '0.7rem', color: 'var(--accent-light)' }}>(you)</span>}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          🔥 {entry.streak || 0} day streak
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--accent-light)' }}>
          ⚡ {(entry.xp || 0).toLocaleString()}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>XP</div>
      </div>
    </div>
  )
}

export default function Leaderboard() {
  const { user, profile, refreshProfile } = useAuth()
  const [tab,          setTab]          = useState('friends')
  const [friendsBoard, setFriendsBoard] = useState([])
  const [globalBoard,  setGlobalBoard]  = useState([])
  const [loadingF,     setLoadingF]     = useState(true)
  const [loadingG,     setLoadingG]     = useState(false)

  // Guard: profile.friends may be a number (from increment()) not an array
  const friendUids = Array.isArray(profile?.friends) ? profile.friends : []

  useEffect(() => {
    if (!user || !profile) return
    setLoadingF(true)
    getLeaderboard(friendUids, user.uid)
      .then(d => { setFriendsBoard(d || []); setLoadingF(false) })
      .catch(() => setLoadingF(false))
  }, [user, profile])

  useEffect(() => {
    if (tab !== 'global' || globalBoard.length) return
    setLoadingG(true)
    getGlobalLeaderboard(100)
      .then(d => {
        setGlobalBoard(d || [])
        setLoadingG(false)
        // Check top_three badge
        const rank = (d || []).findIndex(u => u.uid === user?.uid)
        if (rank >= 0 && rank < 3) {
          checkAndAwardBadge(user.uid, 'top_three').catch(() => {})
        }
      })
      .catch(() => setLoadingG(false))
  }, [tab])

  async function toggleHideName() {
    const newVal = !(profile?.hideNameFromLeaderboard)
    await updateUserProfile(user.uid, { hideNameFromLeaderboard: newVal })
    await refreshProfile()
    setGlobalBoard([]) // force reload
    toast.success(newVal ? 'You now appear as "Anonymous" on the global board' : 'Your name is visible again')
  }

  const board        = tab === 'friends' ? friendsBoard : globalBoard
  const loading      = tab === 'friends' ? loadingF : loadingG
  const myRank       = board.findIndex(u => u.uid === user?.uid)
  const myEntry      = board[myRank]
  const topBoard     = board.slice(0, 100)
  const isHidden     = profile?.hideNameFromLeaderboard

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={22} color="var(--warning)" /> Leaderboard
          </h2>
          <p style={{ marginTop: 4, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Compete with friends and the RevisionFlow community
          </p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={toggleHideName}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {isHidden ? <Globe size={14} /> : <Lock size={14} />}
          {isHidden ? 'Show my name' : 'Hide my name'}
        </button>
      </div>

      {/* Your rank card */}
      {myRank >= 0 && myEntry && (
        <div className="card accent-card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: '2rem' }}>
            {myRank === 0 ? '🥇' : myRank === 1 ? '🥈' : myRank === 2 ? '🥉' : `#${myRank + 1}`}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>Your rank on {tab === 'friends' ? 'friends' : 'global'} board</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ⚡ {(myEntry.xp || 0).toLocaleString()} XP · 🔥 {myEntry.streak || 0} day streak
            </div>
          </div>
          {myRank === 0 && <Crown size={20} color="var(--warning)" />}
        </div>
      )}

      {/* Tab bar */}
      <div className="tabs" style={{ marginBottom: 20, padding: 4 }}>
        <button className={'tab' + (tab === 'friends' ? ' active' : '')} onClick={() => setTab('friends')}>
          <Users size={14} /> Friends
        </button>
        <button className={'tab' + (tab === 'global' ? ' active' : '')} onClick={() => setTab('global')}>
          <Globe size={14} /> Global
        </button>
      </div>

      {/* Board */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ height: 60, background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)', animation: 'pulse 1.5s ease infinite' }} />
          ))}
        </div>
      ) : topBoard.length === 0 ? (
        <div className="empty-state">
          {tab === 'friends' ? (
            <>
              <Users size={32} style={{ opacity: 0.3 }} />
              <p>No friends yet — add friends to see them here!</p>
              <a href="/friends" className="btn btn-primary btn-sm">Find friends</a>
            </>
          ) : (
            <>
              <Globe size={32} style={{ opacity: 0.3 }} />
              <p>Global board loading…</p>
            </>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {topBoard.map((entry, idx) => (
            <BoardRow
              key={entry.uid}
              entry={entry}
              rank={idx}
              isMe={entry.uid === user?.uid}
            />
          ))}
        </div>
      )}
    </div>
  )
}
