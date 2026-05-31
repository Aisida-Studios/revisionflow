// src/pages/Admin.jsx
// RevisionFlow admin panel — only accessible to femiaisida1@gmail.com
// All Firestore writes go through /api/admin (server-side) to bypass client rules
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  Shield, Users, Star, Search, CheckCircle, XCircle,
  BarChart2, Zap, RefreshCw, AlertTriangle, ChevronDown, ChevronUp,
} from 'lucide-react'

const ADMIN_EMAIL = 'femiaisida1@gmail.com'

/* ── Admin API helper ──────────────────────────────────────────── */
async function adminCall(action, callerEmail, params = {}) {
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, callerEmail, ...params }),
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || 'Admin call failed')
  return data
}

/* ── Section wrapper ───────────────────────────────────────────── */
function Section({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
        borderBottom: open ? '1px solid var(--border)' : 'none',
      }}>
        <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem' }}>
          {icon} {title}
        </h4>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div style={{ padding: '16px 18px' }}>{children}</div>}
    </div>
  )
}

/* ── Main page ─────────────────────────────────────────────────── */
/* ── Content tab — bulk AI generation ─────────────────────────────────────── */
function ContentTab({ email }) {
  const [subject,   setSubject]   = useState('')
  const [board,     setBoard]     = useState('AQA')
  const [level,     setLevel]     = useState('GCSE')
  const [topics,    setTopics]    = useState([])
  const [progress,  setProgress]  = useState(null)  // { done, total, current, errors }
  const [running,   setRunning]   = useState(false)
  const [log,       setLog]       = useState([])
  const stopRef = useRef(false)  // ref-based stop flag — not subject to stale closure

  const SUBJECTS_BY_LEVEL = {
    GCSE: ['Mathematics','English Language','English Literature','Biology','Chemistry','Physics',
           'Combined Science','History','Geography','French','Spanish','German',
           'Computer Science','Business','Economics','Psychology','Sociology',
           'Religious Studies','Art & Design','Music','Physical Education','Statistics'],
    'A-Level': ['Mathematics','Further Mathematics','Biology','Chemistry','Physics',
                'History','Geography','English Literature','Computer Science',
                'Economics','Psychology','Business','Sociology','Philosophy'],
  }

  const subjectList = SUBJECTS_BY_LEVEL[level] || SUBJECTS_BY_LEVEL['GCSE']

  async function loadTopics() {
    if (!subject) return
    try {
      const { getTopicsForSubject } = await import('../data/topics')
      const papers = getTopicsForSubject(board, subject, level) || {}
      const flat = Object.values(papers).flat().filter(t => typeof t === 'string' && t.trim())
      const list = [...new Set(flat)]
      setTopics(list)
    } catch(e) { toast.error(e.message) }
  }

  useEffect(() => { loadTopics() }, [subject, board, level])

  function addLog(msg, type = 'info') {
    setLog(l => [...l, { msg, type, ts: new Date().toLocaleTimeString() }])
  }

  async function runBulkGenerate() {
    if (!topics.length || !subject) { toast.error('Select a subject with topics first'); return }
    stopRef.current = false
    setRunning(true)
    setLog([])
    setProgress({ done: 0, total: topics.length, current: '', errors: 0 })
    addLog('Starting bulk generation: ' + topics.length + ' topics for ' + board + ' ' + level + ' ' + subject)

    try {
      const { generateTopicNote, getTopicNoteFromCache, saveTopicNoteToCache } = await import('../utils/ai')
      let done = 0, errors = 0

      for (const topic of topics) {
        if (stopRef.current) { addLog('Stopped by user', 'error'); break }
        setProgress(p => ({ ...p, current: topic }))
        addLog('Checking cache: ' + topic)

        try {
          const cached = await getTopicNoteFromCache(board, level, subject, topic)
          if (cached) {
            addLog('CACHED (skipping): ' + topic, 'cached')
            done++
            setProgress(p => ({ ...p, done }))
            continue
          }

          addLog('Generating: ' + topic)
          const res = await generateTopicNote({ subject, board, level, topic, uid: null })
          if (res.error) {
            addLog('ERROR: ' + topic + ' — ' + res.error, 'error')
            errors++
          } else {
            await saveTopicNoteToCache(board, level, subject, topic, res.text)
            addLog('DONE: ' + topic, 'success')
            done++
          }
        } catch(e) {
          addLog('ERROR: ' + topic + ' — ' + e.message, 'error')
          errors++
        }

        setProgress(p => ({ ...p, done, errors }))
        await new Promise(r => setTimeout(r, 1500))
      }

      addLog('Complete: ' + done + ' generated, ' + errors + ' errors', done > 0 ? 'success' : 'error')
    } catch(e) {
      addLog('Fatal error: ' + e.message, 'error')
    } finally {
      setRunning(false)
      setProgress(p => p ? ({ ...p, current: '' }) : null)
    }
  }

  const logColour = { info: 'var(--text-muted)', success: 'var(--success)', error: 'var(--danger)', cached: 'var(--info)' }

  return (
    <div>
      <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10, background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Bulk topic note generator</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Pre-generates revision guides for every topic in a subject. Cached globally — all students get instant access.
          Already-cached topics are skipped. Costs API tokens but saves them for every future student request.
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10, marginBottom: 14 }}>
          <div>
            <label className="label">Level</label>
            <select className="select" value={level} onChange={e => { setLevel(e.target.value); setSubject('') }}>
              <option value="GCSE">GCSE</option>
              <option value="A-Level">A-Level</option>
            </select>
          </div>
          <div>
            <label className="label">Board</label>
            <select className="select" value={board} onChange={e => setBoard(e.target.value)}>
              {['AQA','Edexcel','OCR','WJEC','Eduqas','CCEA'].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Subject</label>
            <select className="select" value={subject} onChange={e => setSubject(e.target.value)}>
              <option value="">Select subject</option>
              {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {topics.length > 0 && (
          <div style={{ marginBottom: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {topics.length} topics found for {board} {level} {subject}
          </div>
        )}

        {progress && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
              <span>{progress.done}/{progress.total} topics</span>
              <span>{progress.errors > 0 && <span style={{ color: 'var(--danger)' }}>{progress.errors} errors</span>}</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: Math.round(progress.done/progress.total*100)+'%', background: 'var(--accent)', borderRadius: 3, transition: 'width 0.3s' }} />
            </div>
            {progress.current && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 5 }}>Processing: {progress.current}</div>}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={runBulkGenerate} disabled={running || !subject || !topics.length}>
            {running ? 'Generating...' : `Generate all ${topics.length} topics`}
          </button>
          {running && (
            <button className="btn btn-secondary" onClick={() => { stopRef.current = true; setRunning(false) }}>Stop</button>
          )}
        </div>
      </div>

      {log.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
            Generation log
            <button className="btn btn-ghost btn-sm" onClick={() => setLog([])}>Clear</button>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto', padding: '8px 14px', fontFamily: 'monospace', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {log.map((l, i) => (
              <div key={i} style={{ color: logColour[l.type] || 'var(--text-muted)' }}>
                <span style={{ opacity: 0.5, marginRight: 8 }}>{l.ts}</span>{l.msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


export default function Admin() {
  const { user } = useAuth()
  const [tab, setTab] = useState('users')

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <Shield size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
        <h3>Access denied</h3>
        <p style={{ color: 'var(--text-muted)' }}>Admin panel is restricted.</p>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Shield size={22} color="var(--accent)" />
        <h2 style={{ margin: 0 }}>Admin Panel</h2>
        <span className="badge badge-red">Internal only</span>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {['users', 'beta', 'stats', 'content'].map(t => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      {tab === 'users' && <UsersTab email={user.email} />}
      {tab === 'beta'  && <BetaTab  email={user.email} />}
      {tab === 'stats'   && <StatsTab   email={user.email} />}
      {tab === 'content' && <ContentTab email={user.email} />}
    </div>
  )
}

/* ── Users tab ─────────────────────────────────────────────────── */
function UsersTab({ email }) {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [page,    setPage]    = useState(0)
  const PAGE_SIZE = 25

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await adminCall('listUsers', email, { limitN: 300 })
      setUsers(data.users || [])
    } catch(e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  async function setField(uid, field, value, label) {
    try {
      await adminCall('setUserField', email, { targetUid: uid, field, value })
      setUsers(us => us.map(u => u.id === uid ? { ...u, [field]: value } : u))
      toast.success(label)
    } catch(e) { toast.error('Failed: ' + e.message) }
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
        <button className="btn btn-secondary btn-sm" onClick={load}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
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
                    {u.email || u.id.slice(0, 16)} · {(u.xp || 0).toLocaleString()} XP · 🔥 {u.streak || 0}d
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => setField(u.id, 'betaUser', !u.betaUser,
                    (u.betaUser ? 'Beta revoked' : 'Beta granted') + ' — ' + (u.displayName || u.email))}
                    className={'btn btn-sm ' + (u.betaUser ? 'btn-primary' : 'btn-secondary')}
                    style={{ fontSize: '0.75rem' }}>
                    {u.betaUser ? '★ Beta' : '+ Beta'}
                  </button>
                  <button onClick={() => setField(u.id, 'isPro', !u.isPro,
                    (u.isPro ? 'Pro revoked' : 'Pro granted') + ' — ' + (u.displayName || u.email))}
                    className={'btn btn-sm ' + (u.isPro ? 'btn-primary' : 'btn-secondary')}
                    style={{ fontSize: '0.75rem' }}>
                    {u.isPro ? '⚡ Pro' : '+ Pro'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
              {Array.from({ length: pages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={'btn btn-sm ' + (page === i ? 'btn-primary' : 'btn-secondary')}
                  style={{ minWidth: 36 }}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ── Beta tab ──────────────────────────────────────────────────── */
function BetaTab({ email }) {
  const [betaUsers,    setBetaUsers]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [searchQ,      setSearchQ]      = useState('')
  const [searching,    setSearching]    = useState(false)
  const [found,        setFound]        = useState(null)
  const [bulkInput,    setBulkInput]    = useState('')
  const [bulkLoading,  setBulkLoading]  = useState(false)
  const [bulkResult,   setBulkResult]   = useState(null)

  useEffect(() => { loadBeta() }, [])

  async function loadBeta() {
    setLoading(true)
    try {
      const data = await adminCall('listUsers', email, { filterField: 'betaUser', filterValue: true, limitN: 500 })
      setBetaUsers(data.users || [])
    } catch(e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  async function findUser() {
    if (!searchQ.trim()) return
    setSearching(true); setFound(null)
    try {
      const data = await adminCall('findByEmail', email, { email: searchQ.trim() })
      if (data.user) setFound(data.user)
      else toast.error('No user found with that email')
    } catch(e) { toast.error(e.message) }
    finally { setSearching(false) }
  }

  async function grantBeta(uid, name) {
    try {
      await adminCall('setUserField', email, { targetUid: uid, field: 'betaUser', value: true })
      toast.success('Beta granted to ' + name)
      setFound(f => f ? { ...f, betaUser: true } : f)
      loadBeta()
    } catch(e) { toast.error(e.message) }
  }

  async function revokeBeta(uid, name) {
    try {
      await adminCall('setUserField', email, { targetUid: uid, field: 'betaUser', value: false })
      toast.success('Beta revoked from ' + name)
      setBetaUsers(us => us.filter(u => u.id !== uid))
    } catch(e) { toast.error(e.message) }
  }

  async function bulkGrant() {
    const lines = bulkInput.split('\n').map(l => l.trim()).filter(Boolean)
    if (!lines.length) return
    setBulkLoading(true); setBulkResult(null)

    const results = { granted: [], notFound: [], alreadyBeta: [] }

    for (const line of lines) {
      try {
        // Try find by email
        const data = await adminCall('findByEmail', email, { email: line })
        const user = data.user
        if (!user) { results.notFound.push(line); continue }
        if (user.betaUser) { results.alreadyBeta.push(user.displayName || line); continue }
        await adminCall('setUserField', email, { targetUid: user.id, field: 'betaUser', value: true })
        results.granted.push(user.displayName || line)
      } catch(e) { results.notFound.push(line) }
    }

    setBulkResult(results)
    setBulkLoading(false)
    if (results.granted.length) loadBeta()
    toast.success('Done — ' + results.granted.length + ' user(s) granted beta')
  }

  return (
    <div>
      {/* What beta means */}
      <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(124,58,237,0.06)',
        border: '1px solid rgba(124,58,237,0.2)', marginBottom: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Star size={15} color="var(--accent)" /> What beta means
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong>Beta (betaUser: true)</strong> — lifetime free access. These users signed up early and were promised they'd never pay. When Stripe launches, the <code>isPro()</code> hook must treat betaUser as equivalent to isPro so they never hit a paywall.<br />
          <strong>Pro (isPro: true)</strong> — active paying subscriber. Set manually here for now; will be automated by Stripe webhooks later.
        </div>
      </div>

      <Section title={`Current beta users (${betaUsers.length})`} icon={<Star size={15} />}>
        {loading ? <div style={{ color: 'var(--text-muted)' }}>Loading…</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
            {betaUsers.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No beta users flagged yet — use the tools below to add them.</p>
            )}
            {betaUsers.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{u.displayName || '(no name)'}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 8 }}>{u.email || u.id.slice(0, 14)}</span>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', fontSize: '0.75rem' }}
                  onClick={() => revokeBeta(u.id, u.displayName || u.email)}>
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Find by email & flag" icon={<Search size={15} />}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input className="input" placeholder="Email address"
            value={searchQ} onChange={e => setSearchQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && findUser()} />
          <button className="btn btn-primary" onClick={findUser} disabled={searching || !searchQ.trim()}>
            {searching ? '…' : 'Find'}
          </button>
        </div>
        {found && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--bg-surface)',
            border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <div style={{ fontWeight: 600 }}>{found.displayName || '(no name)'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {found.email} · XP {(found.xp || 0).toLocaleString()} · {found.betaUser ? '★ Already beta' : 'Not beta'}
              </div>
            </div>
            {found.betaUser
              ? <span className="badge badge-purple">Beta ✓</span>
              : <button className="btn btn-primary btn-sm" onClick={() => grantBeta(found.id, found.displayName || found.email)}>
                  Grant beta
                </button>
            }
          </div>
        )}
      </Section>

      <Section title="Bulk grant beta by email" icon={<Users size={15} />} defaultOpen={false}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 10 }}>
          One email address per line. Matches against the email field in Firestore.
        </p>
        <textarea className="textarea" style={{ minHeight: 120, fontFamily: 'monospace', fontSize: '0.82rem' }}
          value={bulkInput} onChange={e => setBulkInput(e.target.value)}
          placeholder={'user@example.com\nanother@example.com'} />
        <button className="btn btn-primary" style={{ marginTop: 10 }}
          onClick={bulkGrant} disabled={bulkLoading || !bulkInput.trim()}>
          {bulkLoading ? 'Granting…' : 'Grant beta to all'}
        </button>

        {bulkResult && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bulkResult.granted.length > 0 && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.3)' }}>
                <div style={{ fontWeight: 700, color: 'var(--success)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={13} /> Granted ({bulkResult.granted.length})
                </div>
                <div style={{ fontSize: '0.8rem' }}>{bulkResult.granted.join(', ')}</div>
              </div>
            )}
            {bulkResult.alreadyBeta.length > 0 && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.25)' }}>
                <div style={{ fontWeight: 700, color: 'var(--warning)', marginBottom: 4 }}>
                  Already beta ({bulkResult.alreadyBeta.length})
                </div>
                <div style={{ fontSize: '0.8rem' }}>{bulkResult.alreadyBeta.join(', ')}</div>
              </div>
            )}
            {bulkResult.notFound.length > 0 && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)' }}>
                <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <XCircle size={13} /> Not found ({bulkResult.notFound.length})
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
function StatsTab({ email }) {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await adminCall('listUsers', email, { limitN: 500 })
        const users = data.users || []
        const total = users.length
        const beta  = users.filter(u => u.betaUser).length
        const pro   = users.filter(u => u.isPro).length
        const active7 = users.filter(u => {
          if (!u.lastActivityDate) return false
          return (Date.now() - new Date(u.lastActivityDate).getTime()) < 7 * 86400000
        }).length
        const avgXP  = total ? Math.round(users.reduce((s, u) => s + (u.xp || 0), 0) / total) : 0
        const avgStr = total ? Math.round(users.reduce((s, u) => s + (u.streak || 0), 0) / total) : 0
        const topUsers = [...users].sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 10)
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
          { label: 'Total users',  val: stats.total,                    colour: 'var(--accent-light)', icon: <Users size={16} />    },
          { label: 'Beta users',   val: stats.beta,                     colour: 'var(--warning)',       icon: <Star size={16} />     },
          { label: 'Pro users',    val: stats.pro,                      colour: 'var(--success)',       icon: <Zap size={16} />      },
          { label: 'Active (7d)',  val: stats.active7,                  colour: 'var(--info)',          icon: <BarChart2 size={16} />},
          { label: 'Avg XP',       val: stats.avgXP.toLocaleString(),   colour: 'var(--purple-300)',    icon: <Zap size={16} />      },
          { label: 'Avg streak',   val: stats.avgStr + 'd',             colour: 'var(--warning)',       icon: <BarChart2 size={16} />},
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '14px 10px' }}>
            <div style={{ color: s.colour, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontWeight: 800, fontSize: '1.35rem', color: s.colour }}>{s.val}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Section title="Top 10 by XP" icon={<BarChart2 size={15} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {stats.topUsers.map((u, i) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 14px', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', minWidth: 24 }}>#{i+1}</span>
              <span style={{ fontWeight: 600, flex: 1, fontSize: '0.88rem' }}>{u.displayName || '(anon)'}</span>
              {u.betaUser && <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>Beta</span>}
              {u.isPro    && <span className="badge badge-green"  style={{ fontSize: '0.65rem' }}>Pro</span>}
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>🔥 {u.streak || 0}d</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-light)' }}>
                {(u.xp || 0).toLocaleString()} XP
              </span>
            </div>
          ))}
        </div>
      </Section>

      <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 10,
        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--warning)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={15} /> Pre-Stripe checklist
        </div>
        <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.9 }}>
          <li>{stats.beta > 0 ? '✓' : '✗'} {stats.beta} beta user{stats.beta !== 1 ? 's' : ''} flagged</li>
          <li>✗ isPro() hook — must return true if betaUser OR isPro (not built yet)</li>
          <li>✗ Stripe webhook — must set isPro: true on payment, false on cancel (not built yet)</li>
          <li>✗ Paywall gates on Pro features (not built yet)</li>
        </ul>
      </div>
    </div>
  )
}
