// src/components/FriendRequestPopup.jsx
// Checked Friends.jsx first (per the task) — it only shows a passive badge count on its
// Requests tab, nothing fires when a request actually arrives. This is genuinely new.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { acceptFriendRequest, declineFriendRequest } from '../utils/firestore'
import toast from 'react-hot-toast'
import { UserPlus, UserCheck, UserX } from 'lucide-react'

export default function FriendRequestPopup({ request, onClose }) {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  async function handleAccept() {
    setBusy(true)
    try {
      await acceptFriendRequest(request.id)
      await refreshProfile()
      toast.success('Friend added!')
      onClose()
    } catch (err) {
      toast.error('Could not accept request: ' + err.message)
      setBusy(false)
    }
  }

  async function handleDecline() {
    setBusy(true)
    try {
      await declineFriendRequest(request.id)
      onClose()
    } catch (err) {
      toast.error('Could not decline request: ' + err.message)
      setBusy(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
            background: 'var(--brand-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '1.2rem',
          }}>
            <UserPlus size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>New friend request</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>{request.fromName || 'A RevisionFlow user'}</strong> wants to be your study buddy
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAccept} disabled={busy}>
            <UserCheck size={15} /> Accept
          </button>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleDecline} disabled={busy}>
            <UserX size={15} /> Decline
          </button>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', marginTop: 8 }}
          disabled={busy}
          onClick={() => { onClose(); navigate('/friends') }}
        >
          View all requests
        </button>
      </div>
    </div>
  )
}
