// src/components/AdminUserDetail.jsx
// Per-student detail view for the admin Users tab — profile summary, subscription state,
// and real activity counts, in one place instead of hunting across Firestore by hand.
// Calls netlify/functions/admin-metrics.js's userDetail action (same file as the metrics
// dashboard — a distinct, cheap, on-demand action, not a new function for one small read).
import { useState, useEffect } from 'react'
import Skeleton from './Skeleton'
import { X, Mail, Calendar, Zap, BookOpen, AlertTriangle, FileText, HelpCircle } from 'lucide-react'

async function fetchUserDetail(uid) {
  const { getAuth } = await import('firebase/auth')
  const { app } = await import('../firebase')
  const currentUser = getAuth(app).currentUser
  const idToken = currentUser ? await currentUser.getIdToken() : ''
  const res = await fetch('/api/admin-metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
    body: JSON.stringify({ action: 'userDetail', uid }),
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || 'Failed to load user')
  return data
}

function Row({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', padding: '5px 0' }}>
      <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{icon}</span>
      <span style={{ color: 'var(--text-muted)', minWidth: 110 }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  )
}

export default function AdminUserDetail({ uid, onClose }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchUserDetail(uid)
      .then(d => { if (!cancelled) setData(d) })
      .catch(e => { if (!cancelled) setError(e.message) })
    return () => { cancelled = true }
  }, [uid])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div className="card" style={{ maxWidth: 480, width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: 20 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0 }}>{data?.profile?.name || 'Student'}</h3>
            {data?.profile?.email && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Mail size={12} /> {data.profile.email}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <p style={{ color: 'var(--error)', fontSize: '0.85rem' }}>
            <AlertTriangle size={14} style={{ verticalAlign: -2 }} /> {error}
          </p>
        )}

        {!data && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Skeleton height={16} /><Skeleton height={16} /><Skeleton height={16} /><Skeleton height={16} />
          </div>
        )}

        {data && (
          <>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {data.subscription.betaUser && <span className="badge badge-accent">Beta</span>}
              {data.subscription.isPro && !data.subscription.betaUser && <span className="badge badge-green">Paying Pro</span>}
              {!data.subscription.isPro && !data.subscription.betaUser && <span className="badge">Free</span>}
              {data.subscription.stripePaymentFailed && <span className="badge badge-amber">Payment failed</span>}
              {!data.profile.onboardingComplete && <span className="badge badge-amber">Onboarding incomplete</span>}
            </div>

            <Row icon={<Calendar size={13} />} label="Joined"
              value={data.profile.createdAt ? new Date(data.profile.createdAt).toLocaleDateString('en-GB') : '—'} />
            <Row icon={<BookOpen size={13} />} label="Qualification" value={data.profile.qualification || '—'} />
            <Row icon={<Zap size={13} />} label="XP / Level" value={`${data.profile.xp.toLocaleString()} XP · Lv ${data.profile.level}`} />
            <Row icon={<Zap size={13} />} label="Streak" value={`${data.profile.streak} days`} />

            {data.profile.subjects?.length > 0 && (
              <div style={{ margin: '10px 0' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Subjects</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {data.profile.subjects.map((s, i) => (
                    <span key={i} className="badge" style={{ fontSize: '0.72rem' }}>{s.name}{s.board ? ` (${s.board})` : ''}</span>
                  ))}
                </div>
              </div>
            )}

            {data.subscription.stripePlan && (
              <Row icon={<Zap size={13} />} label="Plan" value={`${data.subscription.stripePlan} · ${data.subscription.stripeSubStatus || '—'}`} />
            )}

            <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12 }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>Activity</p>
              <div className="grid-3" style={{ gap: 8 }}>
                <MiniStat icon={<Zap size={14} />} val={data.activity.sessionsCompleted} label="Sessions" />
                <MiniStat icon={<FileText size={14} />} val={data.activity.paperAttempts} label="Papers" />
                <MiniStat icon={<HelpCircle size={14} />} val={data.activity.quizResults} label="Quizzes" />
                <MiniStat icon={<AlertTriangle size={14} />} val={data.activity.mistakesLogged} label="Mistakes" />
                <MiniStat icon={<AlertTriangle size={14} />} val={data.activity.mistakesUnresolved} label="Unresolved" colour={data.activity.mistakesUnresolved > 0 ? 'var(--warning)' : undefined} />
                <MiniStat icon={<FileText size={14} />} val={data.activity.notesWritten} label="Notes" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function MiniStat({ icon, val, label, colour }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--bg-surface)', borderRadius: 8 }}>
      <div style={{ color: colour || 'var(--accent)' }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: '1rem', color: colour }}>{val}</div>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  )
}
