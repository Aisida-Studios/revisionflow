// src/components/ReferralCard.jsx
// Shows the user's referral link with a copy button and QR code.
// Add this to the Profile page and the Friends page.

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { getReferralUrl } from '../utils/referrals'
import { Copy, Check, Share2 } from 'lucide-react'

export default function ReferralCard() {
  const { user, profile } = useAuth()
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const referralUrl = user ? getReferralUrl(user.uid) : ''

  // Generate QR code using a free API (no library needed)
  useEffect(() => {
    if (!referralUrl) return
    const encoded = encodeURIComponent(referralUrl)
    setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encoded}&bgcolor=ffffff&color=14532d&margin=4`)
  }, [referralUrl])

  function copyLink() {
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  async function shareLink() {
    if (navigator.share) {
      await navigator.share({
        title: 'RevisionFlow',
        text: 'I use RevisionFlow for my GCSE revision — free revision tracker. Join using my link and we both get XP!',
        url: referralUrl,
      })
    } else {
      copyLink()
    }
  }

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <h4 style={{ marginBottom: 4 }}>Invite friends</h4>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
        Share your link. When a friend signs up, you both get XP — you get 200, they get 100.
      </p>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Left: link + buttons */}
        <div style={{ flex: 1, minWidth: 200 }}>
          {/* Referral link box */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            color: 'var(--text-muted)',
            wordBreak: 'break-all',
            marginBottom: 10,
          }}>
            {referralUrl}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={copyLink} style={{ flex: 1 }}>
              {copied
                ? <><Check size={13} /> Copied!</>
                : <><Copy size={13} /> Copy link</>}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={shareLink}>
              <Share2 size={13} /> Share
            </button>
          </div>

          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 10 }}>
            Your code: <strong style={{ color: 'var(--text-primary)' }}>{user ? user.uid.slice(0, 8).toUpperCase() : '—'}</strong>
          </p>
        </div>

        {/* Right: QR code */}
        {qrDataUrl && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={qrDataUrl}
              alt="QR code for referral link"
              width={100}
              height={100}
              style={{ borderRadius: 8, border: '1px solid var(--border)' }}
            />
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Screenshot to share
            </p>
          </div>
        )}
      </div>

      {/* Reward info */}
      <div style={{
        marginTop: 14,
        padding: '8px 12px',
        background: 'rgba(34,197,94,0.08)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(34,197,94,0.2)',
        fontSize: '0.8rem',
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <span>🎁 You get: <strong>+200 XP</strong></span>
        <span>🎁 They get: <strong>+100 XP</strong></span>
        <span>🏅 Earn the <strong>Recruiter</strong> badge</span>
      </div>
    </div>
  )
}
