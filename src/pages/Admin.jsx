// src/pages/Admin.jsx
// RevisionFlow admin panel — only accessible to femiaisida1@gmail.com
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import {
  collection, getDocs, doc, updateDoc, query,
  orderBy, limit, where, getDoc, setDoc, writeBatch,
} from 'firebase/firestore'
import toast from 'react-hot-toast'
import { Shield, Users, Star, Search, CheckCircle, XCircle,
  BarChart2, Zap, RefreshCw, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'

const ADMIN_EMAIL = 'femiaisida1@gmail.com'

function Section({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
        borderBottom: open ? '1px solid var(--border)' : 'none',
      }}>
        <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon} {title}
        </h4>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div style={{ padding: '16px 18px' }}>{children}</div>}
    </div>
  )
}

export default function Admin() {
  const { user, profile } = useAuth()
  const [tab, setTab] = useState('users')

  // Gate: only admin email
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <Shield size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
        <h3>Access denied</h3>
        <p style={{ color: 'var(--text-muted)' }}>Admin panel is restricted.</p>
      </div>
    )
  }

  const TABS = ['users', 'beta', 'stats']

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Shield size={22} color="var(--accent)" />
        <h2 style={{ margin: 0 }}>Admin Panel</h2>
        <span className="badge badge-red">Internal only</span>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'users' && <UsersTab />}
      {tab === 'beta'  && <BetaTab />}
      {tab === 'stats' && <StatsTab />}
    </div>
  )
}

/* ── Users tab ─────────────────────────────────────────────────── */
function UsersTab() {
  const [users,    setUsers]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(0)
  const PAGE_SIZE = 25

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    try {
      const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(200)))
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch(e) { toast.error('Failed to load users: ' + e.message) }
    finally { setLoading(false) }
  }

  async function toggleBeta(u) {
    try {
      await updateDoc(doc(db, 'users', u.id), { betaUser: !u.betaUser })
      setUsers(us => us.map(x => x.id === u.id ? { ...x, betaUser: !x.betaUser } : x))
      toast.success((u.betaUser ? 'Removed' : 'Granted') + ' beta for ' + (u.displayName || u.email))
    } catch(e) { toast.error(e.message) }
  }

  async function togglePro(u) {
    try {
      await updateDoc(doc(db, 'users', u.id), { isPro: !u.isPro })
      setUsers(us => us.map(x => x.id === u.id ? { ...x, isPro: !x.isPro } : x))
      toast.success((u.isPro ? 'Removed' : 'Granted') + ' Pro for ' + (u.displayName || u.email))
    } catch(e) { toast.error(e.message) }
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return !q || (u.displayName || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
  })
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const pages = Math.ceil(filtered.length / PAGE_SIZE)

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <input className="input" style={{ maxWidth: 280 }} placeholder="Search by name or email…"
          value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
        <button className="btn btn-secondary btn-sm" onClick={loadUsers}>
          <RefreshCw size={13} /> Refresh
        </button>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {filtered.length} users
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Loading…</div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {paged.map(u => (
              <div key={u.id} style={{ padding: '10px 14px', borderRadius: 10,
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {u.displayName || '(no name)'}
                    {u.betaUser && <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>Beta</span>}
                    {u.isPro    && <span className="badge badge-green"  style={{ fontSize: '0.65rem' }}>Pro</span>}
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {u.email || u.id.slice(0, 12)} · XP {(u.xp || 0).toLocaleString()} · Streak {u.streak || 0}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => toggleBeta(u)}
                    className={'btn btn-sm ' + (u.betaUser ? 'btn-primary' : 'btn-secondary')}
                    style={{ fontSize: '0.75rem' }}>
                    {u.betaUser ? '★ Beta' : '+ Beta'}
                  </button>
                  <button onClick={() => togglePro(u)}
                    className={'btn btn-sm ' + (u.isPro ? 'btn-primary' : 'btn-secondary')}
                    style={{ fontSize: '0.75rem' }}>
                    {u.isPro ? '✓ Pro' : '+ Pro'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
              {Array.from({ length: pages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={'btn btn-sm ' + (page === i ? 'btn-primary' : 'btn-secondary')}
                  style={{ minWidth: 36 }}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ── Beta tab ──────────────────────────────────────────────────── */
function BetaTab() {
  const [betaUsers,  setBetaUsers]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [bulkInput,  setBulkInput]  = useState('')
  const [bulkResult, setBulkResult] = useState(null)
  const [searching,  setSearching]  = useState(false)
  const [query_,     setQuery_]     = useState('')
  const [found,      setFound]      = useState(null)

  useEffect(() => { loadBetaUsers() }, [])

  async function loadBetaUsers() {
    setLoading(true)
    try {
      const snap = await getDocs(query(collection(db, 'users'), where('betaUser', '==', true)))
      setBetaUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch(e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  async function searchUser() {
    if (!query_.trim()) return
    setSearching(true); setFound(null)
    try {
      // Try by email field first
      const q1 = await getDocs(query(collection(db, 'users'), where('email', '==', query_.trim().toLowerCase()), limit(1)))
      if (!q1.empty) { setFound({ id: q1.docs[0].id, ...q1.docs[0].data() }); setSearching(false); return }
      // Try by displayName
      const q2 = await getDocs(query(collection(db, 'users'), where('displayName', '==', query_.trim()), limit(1)))
      if (!q2.empty) { setFound({ id: q2.docs[0].id, ...q2.docs[0].data() }); setSearching(false); return }
      toast.error('No user found with that email or name')
    } catch(e) { toast.error(e.message) }
    finally { setSearching(false) }
  }

  async function grantBeta(userId, name) {
    await updateDoc(doc(db, 'users', userId), { betaUser: true })
    toast.success('Beta granted to ' + name)
    setFound(f => f ? { ...f, betaUser: true } : f)
    loadBetaUsers()
  }

  async function revokeBeta(userId, name) {
    await updateDoc(doc(db, 'users', userId), { betaUser: false })
    toast.success('Beta revoked from ' + name)
    setBetaUsers(u => u.filter(x => x.id !== userId))
  }

  async function bulkGrantBeta() {
    // Accepts newline-separated emails or UIDs
    const lines = bulkInput.split('\n').map(l => l.trim()).filter(Boolean)
    if (!lines.length) return
    const results = { granted: [], notFound: [], alreadyBeta: [] }
    const batch = writeBatch(db)

    for (const line of lines) {
      try {
        // Try as UID first (direct doc lookup)
        const directSnap = await getDoc(doc(db, 'users', line))
        if (directSnap.exists()) {
          const d = directSnap.data()
          if (d.betaUser) { results.alreadyBeta.push(d.displayName || line); continue }
          batch.update(doc(db, 'users', line), { betaUser: true })
          results.granted.push(d.displayName || line)
          continue
        }
        // Try as email
        const emailSnap = await getDocs(query(collection(db, 'users'), where('email', '==', line.toLowerCase()), limit(1)))
        if (!emailSnap.empty) {
          const d = emailSnap.docs[0].data()
          if (d.betaUser) { results.alreadyBeta.push(d.displayName || line); continue }
          batch.update(emailSnap.docs[0].ref, { betaUser: true })
          results.granted.push(d.displayName || line)
        } else {
          results.notFound.push(line)
        }
      } catch(e) { results.notFound.push(line) }
    }

    await batch.commit()
    setBulkResult(results)
    loadBetaUsers()
    toast.success(`Granted beta to ${results.granted.length} user(s)`)
  }

  return (
    <div>
      <Section title="Beta users" icon={<Star size={15} />}>
        {loading ? <div style={{ color: 'var(--text-muted)' }}>Loading…</div> : (
          <>
            <div style={{ marginBottom: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {betaUsers.length} users have lifetime beta access
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
              {betaUsers.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{u.displayName || '(no name)'}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 8 }}>{u.email || u.id.slice(0, 12)}</span>
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', fontSize: '0.75rem' }}
                    onClick={() => revokeBeta(u.id, u.displayName || u.email)}>
                    Revoke
                  </button>
                </div>
              ))}
              {!betaUsers.length && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No beta users flagged yet.</p>}
            </div>
          </>
        )}
      </Section>

      <Section title="Find & flag individual user" icon={<Search size={15} />}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input className="input" placeholder="Email address or display name"
            value={query_} onChange={e => setQuery_(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchUser()} />
          <button className="btn btn-primary" onClick={searchUser} disabled={searching || !query_.trim()}>
            {searching ? '…' : 'Find'}
          </button>
        </div>
        {found && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <div style={{ fontWeight: 600 }}>{found.displayName || '(no name)'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {found.email} · XP {(found.xp || 0).toLocaleString()} · {found.betaUser ? '✓ Already beta' : 'Not beta'}
              </div>
            </div>
            {found.betaUser ? (
              <span className="badge badge-purple">Beta ✓</span>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => grantBeta(found.id, found.displayName || found.email)}>
                Grant beta
              </button>
            )}
          </div>
        )}
      </Section>

      <Section title="Bulk grant beta" icon={<Users size={15} />} defaultOpen={false}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 10 }}>
          Paste one email address or Firestore UID per line. The tool will match each against users and grant beta in a single batch.
        </p>
        <textarea className="textarea" style={{ minHeight: 120, fontFamily: 'monospace', fontSize: '0.82rem' }}
          value={bulkInput} onChange={e => setBulkInput(e.target.value)}
          placeholder={'user@example.com\nanother@example.com\nFirestoreUID123'} />
        <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={bulkGrantBeta} disabled={!bulkInput.trim()}>
          Grant beta to all
        </button>
        {bulkResult && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bulkResult.granted.length > 0 && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <div style={{ fontWeight: 700, color: 'var(--success)', marginBottom: 4 }}>
                  <CheckCircle size={13} style={{ marginRight: 6 }} />Granted ({bulkResult.granted.length})
                </div>
                <div style={{ fontSize: '0.8rem' }}>{bulkResult.granted.join(', ')}</div>
              </div>
            )}
            {bulkResult.alreadyBeta.length > 0 && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                <div style={{ fontWeight: 700, color: 'var(--warning)', marginBottom: 4 }}>Already beta ({bulkResult.alreadyBeta.length})</div>
                <div style={{ fontSize: '0.8rem' }}>{bulkResult.alreadyBeta.join(', ')}</div>
              </div>
            )}
            {bulkResult.notFound.length > 0 && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: 4 }}>
                  <XCircle size={13} style={{ marginRight: 6 }} />Not found ({bulkResult.notFound.length})
                </div>
                <div style={{ fontSize: '0.8rem' }}>{bulkResult.notFound.join(', ')}</div>
              </div>
            )}
          </div>
        )}
      </Section>
    </div>
  )
}

/* ── Stats tab ─────────────────────────────────────────────────── */
function StatsTab() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const usersSnap = await getDocs(query(collection(db, 'users'), limit(500)))
        const users = usersSnap.docs.map(d => d.data())
        const total = users.length
        const beta  = users.filter(u => u.betaUser).length
        const pro   = users.filter(u => u.isPro).length
        const active7 = users.filter(u => {
          if (!u.lastActivityDate) return false
          const d = new Date(u.lastActivityDate)
          return (Date.now() - d.getTime()) < 7 * 86400000
        }).length
        const avgXP  = Math.round(users.reduce((s, u) => s + (u.xp || 0), 0) / Math.max(total, 1))
        const avgStr = Math.round(users.reduce((s, u) => s + (u.streak || 0), 0) / Math.max(total, 1))
        const topUsers = [...users].sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 10)
          .map(u => ({ name: u.displayName || '(anon)', xp: u.xp || 0, streak: u.streak || 0, beta: u.betaUser, pro: u.isPro }))
        setStats({ total, beta, pro, active7, avgXP, avgStr, topUsers })
      } catch(e) { toast.error(e.message) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading stats…</div>
  if (!stats)  return null

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total users',     val: stats.total,   icon: <Users size={16} />,   colour: 'var(--accent-light)' },
          { label: 'Beta users',      val: stats.beta,    icon: <Star size={16} />,    colour: 'var(--warning)' },
          { label: 'Pro users',       val: stats.pro,     icon: <Zap size={16} />,     colour: 'var(--success)' },
          { label: 'Active (7d)',     val: stats.active7, icon: <BarChart2 size={16} />,colour: 'var(--info)' },
          { label: 'Avg XP',          val: stats.avgXP.toLocaleString(), icon: <Zap size={16} />, colour: 'var(--purple-300)' },
          { label: 'Avg streak',      val: stats.avgStr + 'd', icon: <BarChart2 size={16} />, colour: 'var(--warning)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '14px 10px' }}>
            <div style={{ color: s.colour, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontWeight: 800, fontSize: '1.4rem', color: s.colour }}>{s.val}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Section title="Top 10 users by XP" icon={<BarChart2 size={15} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {stats.topUsers.map((u, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 14px', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', minWidth: 20 }}>#{i+1}</span>
              <span style={{ fontWeight: 600, flex: 1 }}>{u.name}</span>
              {u.beta && <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>Beta</span>}
              {u.pro  && <span className="badge badge-green"  style={{ fontSize: '0.65rem' }}>Pro</span>}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🔥 {u.streak}d</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-light)' }}>{u.xp.toLocaleString()} XP</span>
            </div>
          ))}
        </div>
      </Section>

      <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 10,
        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
          <AlertTriangle size={15} color="var(--warning)" />
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--warning)' }}>Before enabling Stripe</span>
        </div>
        <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <li>All existing users with accounts should have <code>betaUser: true</code> set</li>
          <li>Beta users must be excluded from all Pro gates — check <code>isPro()</code> hook includes <code>betaUser</code></li>
          <li>Confirm {stats.beta} beta users flagged before flipping any paywall</li>
        </ul>
      </div>
    </div>
  )
}
