// src/pages/Leaderboard.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getLeaderboard, getGlobalLeaderboard,
  updateUserProfile, checkAndAwardBadge,
} from '../utils/firestore'
import { resolveProfileIcon } from '../data/themes'
import toast from 'react-hot-toast'
import { Trophy, Users, Globe, Lock, Crown } from 'lucide-react'
import './AccountPages.css'

function Avatar({ icon, name }) {
  const emoji = icon ? resolveProfileIcon(icon).emoji : null
  const letter = (name || 'A')[0].toUpperCase()
  return (
    <div className="ap-avatar ap-avatar--md" style={emoji ? { fontSize: '1.3rem' } : undefined}>
      {emoji || letter}
    </div>
  )
}

function RankBadge({ rank }) {
  const cls = rank === 0 ? 'ap-rank ap-rank--1' : rank === 1 ? 'ap-rank ap-rank--2' : rank === 2 ? 'ap-rank ap-rank--3' : 'ap-rank'
  return <span className={cls}>{rank + 1}</span>
}

function BoardRow({ entry, rank, isMe }) {
  const name = entry.hideNameFromLeaderboard ? 'Anonymous' : (entry.displayName || 'Anonymous')
  return (
    <div className={`ap-person-row${isMe ? ' ap-row--me' : ''}`}>
      <RankBadge rank={rank} />
      <Avatar icon={entry.profileIcon} name={name} />
      <div className="ap-person-main">
        <div className="ap-person-name" style={{ fontWeight: isMe ? 800 : 700 }}>
          {name} {isMe && <span style={{ fontSize: '0.7rem', color: 'var(--accent-light)', fontWeight: 700 }}>(you)</span>}
        </div>
        <div className="ap-person-meta"><span className="streak-fire">🔥</span> {entry.streak || 0} day streak</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--accent-light)' }}>
          {(entry.xp || 0).toLocaleString()}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>XP</div>
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
  const myRankColour = myRank === 0 ? 'var(--gold)' : myRank === 1 ? 'var(--text-secondary)' : myRank === 2 ? 'var(--warning)' : 'var(--text-primary)'

  return (
    <div className="fade-in ap-page ap-page--md">
      <div className="ap-page-head">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={22} color="var(--warning)" /> Leaderboard
          </h2>
          <p className="ap-page-sub">Compete with friends and the RevisionFlow community</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={toggleHideName} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isHidden ? <Globe size={14} /> : <Lock size={14} />}
          {isHidden ? 'Show my name' : 'Hide my name'}
        </button>
      </div>

      {/* Your rank card */}
      {myRank >= 0 && myEntry && (
        <div className="card accent-card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: myRankColour, minWidth: 44, textAlign: 'center' }}>
            #{myRank + 1}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>Your rank on the {tab === 'friends' ? 'friends' : 'global'} board</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {(myEntry.xp || 0).toLocaleString()} XP · <span className="streak-fire">🔥</span> {myEntry.streak || 0} day streak
            </div>
          </div>
          {myRank === 0 && <Crown size={22} color="var(--gold)" />}
        </div>
      )}

      {/* Tab bar */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={'tab' + (tab === 'friends' ? ' active' : '')} onClick={() => setTab('friends')}>
          <Users size={14} /> Friends
        </button>
        <button className={'tab' + (tab === 'global' ? ' active' : '')} onClick={() => setTab('global')}>
          <Globe size={14} /> Global
        </button>
      </div>

      {/* Board */}
      {loading ? (
        <div className="card" style={{ padding: '4px 16px' }}>
          <div className="ap-person-list">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="ap-person-row">
                <div className="skeleton-pulse" style={{ width: 30, height: 30, borderRadius: '50%' }} />
                <div className="skeleton-pulse" style={{ width: 44, height: 44, borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton-pulse" style={{ width: '40%', height: 14, borderRadius: 4, marginBottom: 6 }} />
                  <div className="skeleton-pulse" style={{ width: '25%', height: 11, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : topBoard.length === 0 ? (
        <div className="empty-state">
          {tab === 'friends' ? (
            <>
              <div className="ap-icon-circle" style={{ width: 56, height: 56 }}><Users size={26} /></div>
              <p>No friends yet — add friends to see them here!</p>
              <Link to="/friends" className="btn btn-primary btn-sm">Find friends</Link>
            </>
          ) : (
            <>
              <div className="ap-icon-circle" style={{ width: 56, height: 56 }}><Globe size={26} /></div>
              <p>Global board loading…</p>
            </>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: '4px 16px' }}>
          <div className="ap-person-list">
            {topBoard.map((entry, idx) => (
              <BoardRow
                key={entry.uid}
                entry={entry}
                rank={idx}
                isMe={entry.uid === user?.uid}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
