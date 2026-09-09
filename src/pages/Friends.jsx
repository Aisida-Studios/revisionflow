// src/pages/Friends.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  sendFriendRequest, acceptFriendRequest, declineFriendRequest,
  removeFriend, getFriendProfiles, getUserByUsername, searchUsersByName,
  getReceivedRequests
} from '../utils/firestore'
import { LEVELS } from '../data/subjects'
import ReferralCard from '../components/ReferralCard'
import toast from 'react-hot-toast'
import { UserPlus, UserCheck, UserX, Users, Search } from 'lucide-react'
import './AccountPages.css'

// Shows a real profile photo when one is available (Google sign-in), falling back to the
// initial letter — on missing avatarUrl, or if the image fails to load (photo URLs can expire).
function PersonAvatar({ name, avatarUrl, size = 'md' }) {
  const [imgError, setImgError] = useState(false)
  if (avatarUrl && !imgError) {
    return <div className={`ap-avatar ap-avatar--${size}`}><img src={avatarUrl} alt="" onError={() => setImgError(true)} /></div>
  }
  return <div className={`ap-avatar ap-avatar--${size}`}>{(name || 'U')[0].toUpperCase()}</div>
}

export default function Friends() {
  const { user, profile, refreshProfile } = useAuth()
  const [friends,       setFriends]       = useState([])
  const [requests,      setRequests]      = useState([])
  const [search,        setSearch]        = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching,     setSearching]     = useState(false)
  const [tab,           setTab]           = useState('friends')

  useEffect(() => {
    if (!profile || !user) return

    // profile.friends is an array of UIDs (fixed — no longer a number)
    const friendUids = Array.isArray(profile.friends) ? profile.friends : []
    if (friendUids.length) {
      getFriendProfiles(friendUids).then(setFriends)
    } else {
      setFriends([])
    }

    getReceivedRequests(user.uid).then(allReqs => {
      // allReqs items: { id: docId, from: senderUid, to: currentUid }
      // Filter out requests from people already friends (compare r.from against friend UIDs)
      const active = allReqs.filter(r => !friendUids.includes(r.from))
      setRequests(active)
    })
  }, [profile, user])

  async function handleSearch(e) {
    e.preventDefault()
    const q = search.trim()
    if (!q) return
    setSearching(true)
    setSearchResults([])
    try {
      const byUsername = await getUserByUsername(q.toLowerCase())
      const byName     = await searchUsersByName(q)
      // Normalise: both return { uid, displayName, ... } — use uid as the key
      const seen = new Set()
      const combined = [...(byUsername ? [byUsername] : []), ...byName]
        .filter(u => {
          const id = u.uid || u.id
          if (id === user.uid)  return false
          if (seen.has(id))     return false
          seen.add(id)
          return true
        })
        .map(u => ({ ...u, uid: u.uid || u.id }))
      setSearchResults(combined)
      if (!combined.length) toast.error('No users found')
    } catch (err) {
      toast.error('Search failed: ' + err.message)
    } finally {
      setSearching(false)
    }
  }

  async function handleSendRequest(toUid) {
    try {
      await sendFriendRequest(user.uid, toUid)
      toast.success('Friend request sent!')
    } catch (err) {
      toast.error('Could not send request: ' + err.message)
    }
  }

  // req is a full request object: { id: docId, from: senderUid, to: currentUid }
  async function handleAccept(req) {
    try {
      await acceptFriendRequest(req.id)
      await refreshProfile()
      setRequests(r => r.filter(r2 => r2.id !== req.id))
      toast.success('Friend added!')
    } catch (err) {
      toast.error('Could not accept request: ' + err.message)
    }
  }

  async function handleDecline(req) {
    try {
      await declineFriendRequest(req.id)
      setRequests(r => r.filter(r2 => r2.id !== req.id))
    } catch (err) {
      toast.error('Could not decline request: ' + err.message)
    }
  }

  async function handleRemove(friendUid) {
    if (!confirm('Remove this friend?')) return
    try {
      await removeFriend(friendUid)
      setFriends(f => f.filter(u => u.uid !== friendUid))
      await refreshProfile()
    } catch (err) {
      toast.error('Could not remove friend: ' + err.message)
    }
  }

  const friendUids         = Array.isArray(profile?.friends) ? profile.friends : []
  const isAlreadyFriend    = (uid) => friendUids.includes(uid)
  const hasIncomingRequest = (uid) => requests.some(r => r.from === uid)
  const hasSentRequest     = (uid) => (profile?.sentFriendRequests || []).includes(uid)

  const initial = (name) => (name || 'U')[0].toUpperCase()

  return (
    <div className="fade-in ap-page ap-page--md">
      <div className="ap-page-head">
        <h2>Friends</h2>
        <span className="badge badge-accent"><Users size={12} /> {friends.length} friend{friends.length === 1 ? '' : 's'}</span>
      </div>

      {/* ── Referral card — invite friends ── */}
      <div style={{ marginBottom: 20 }}>
        <ReferralCard />
      </div>

      {/* ── Search ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h4 className="card-eyebrow" style={{ marginBottom: 2 }}>Find a friend</h4>
        <p className="card-sub-line">Search by username or display name</p>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: searchResults.length ? 14 : 0 }}>
          <div className="ap-search-wrap">
            <Search size={16} />
            <input
              className="input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by username or name…"
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={searching || !search.trim()}>
            {searching ? <div className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.35)' }} /> : <Search size={16} />}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="ap-person-list" style={{ borderTop: '1.5px solid var(--border)', marginTop: 4 }}>
            {searchResults.map(u => (
              <div key={u.uid} className="ap-person-row">
                <PersonAvatar name={u.displayName} avatarUrl={u.avatarUrl} size="sm" />
                <div className="ap-person-main">
                  <div className="ap-person-name">{u.displayName || 'Anonymous'}</div>
                  <div className="ap-person-meta">Level {u.level || 1}</div>
                </div>
                {isAlreadyFriend(u.uid) ? (
                  <span className="badge badge-green"><UserCheck size={12} /> Friends</span>
                ) : hasSentRequest(u.uid) ? (
                  <span className="badge badge-grey">Request sent</span>
                ) : hasIncomingRequest(u.uid) ? (
                  <button className="btn btn-primary btn-sm" onClick={() => handleAccept(requests.find(r => r.from === u.uid))}>
                    Accept request
                  </button>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => handleSendRequest(u.uid)}>
                    <UserPlus size={14} /> Add friend
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabs: Friends / Requests ── */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={`tab${tab === 'friends' ? ' active' : ''}`} onClick={() => setTab('friends')}>
          Friends ({friends.length})
        </button>
        <button className={`tab${tab === 'requests' ? ' active' : ''}`} onClick={() => setTab('requests')}>
          Requests
          {requests.length > 0 && <span className="badge badge-red" style={{ marginLeft: 4, padding: '1px 6px' }}>{requests.length}</span>}
        </button>
      </div>

      {tab === 'friends' && (
        friends.length === 0 ? (
          <div className="empty-state">
            <div className="ap-icon-circle" style={{ width: 56, height: 56 }}><Users size={26} /></div>
            <h4>No friends yet</h4>
            <p>Share your referral link above or search by username to add friends.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: '4px 16px' }}>
            <div className="ap-person-list">
              {friends.map(f => {
                const lvl = LEVELS[Math.min((f.level || 1) - 1, LEVELS.length - 1)]
                return (
                  <div key={f.uid} className="ap-person-row">
                    <PersonAvatar name={f.displayName} avatarUrl={f.avatarUrl} />
                    <div className="ap-person-main">
                      <div className="ap-person-name">{f.displayName}</div>
                      <div className="ap-person-meta">
                        Level {f.level || 1}{lvl ? ` · ${lvl.title}` : ''} · <span className="streak-fire">🔥</span> {f.streak || 0} · {(f.xp || 0).toLocaleString()} XP
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleRemove(f.uid)} aria-label={`Remove ${f.displayName}`}>
                      <UserX size={15} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      )}

      {tab === 'requests' && (
        requests.length === 0 ? (
          <div className="empty-state">
            <div className="ap-icon-circle" style={{ width: 56, height: 56 }}><UserPlus size={26} /></div>
            <p>No pending friend requests</p>
          </div>
        ) : (
          <div className="card" style={{ padding: '4px 16px' }}>
            <div className="ap-person-list">
              {requests.map(req => (
                <div key={req.id} className="ap-person-row">
                  <div className="ap-avatar ap-avatar--md">{initial(req.fromName || req.from)}</div>
                  <div className="ap-person-main">
                    <div className="ap-person-name">{req.fromName || 'RevisionFlow user'}</div>
                    <div className="ap-person-meta">Wants to be your study buddy</div>
                  </div>
                  <div className="ap-person-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => handleAccept(req)}>
                      <UserCheck size={14} /> Accept
                    </button>
                    <button className="btn btn-secondary btn-icon btn-sm" onClick={() => handleDecline(req)} aria-label="Decline request">
                      <UserX size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  )
}
