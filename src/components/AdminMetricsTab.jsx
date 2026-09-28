// src/components/AdminMetricsTab.jsx
// Real, server-aggregated admin metrics: revenue, growth, activation, engagement.
//
// Calls /api/admin-metrics (netlify/functions/admin-metrics.js) — a separate function/file
// from admin.js on purpose, so this stays independent of whatever else is in flight on that
// file. Visual patterns (StatCard, recharts AreaChart with CSS-variable colours, Section)
// are copied from Analytics.jsx / Admin.jsx's own existing conventions rather than inventing
// a new look for one tab.
import { useState, useEffect, useCallback } from 'react'
import { Section } from './Section'
import Skeleton from './Skeleton'
import toast from 'react-hot-toast'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  PoundSterling, Users, TrendingUp, UserCheck, AlertTriangle, RefreshCw, Info,
} from 'lucide-react'

async function fetchMetrics() {
  let idToken = ''
  let appCheckHeader = {}
  try {
    const { getAuth } = await import('firebase/auth')
    const { app, getAppCheckHeader } = await import('../firebase')
    const currentUser = getAuth(app).currentUser
    if (currentUser) idToken = await currentUser.getIdToken()
    appCheckHeader = await getAppCheckHeader()
  } catch (e) { console.warn('[AdminMetricsTab] could not get ID token:', e.message) }

  const res = await fetch('/api/admin-metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken, ...appCheckHeader },
    body: JSON.stringify({}),
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || 'Failed to load metrics')
  return data
}

// Sparse {date: count} -> dense last-N-days array, so the chart shows real zero-days rather
// than skipping straight over them (a gap that looks like missing data, not zero signups).
function buildDailySeries(signupsByDay, days = 30) {
  const out = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000)
    const key = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
    out.push({ date: key.slice(5), count: (signupsByDay || {})[key] || 0 })
  }
  return out
}

function StatCard({ icon, label, val, sub, colour, loading }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '14px 10px' }}>
      <div style={{ color: colour || 'var(--accent-light)', marginBottom: 4 }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: '1.35rem', color: colour || 'var(--accent-light)' }}>
        {loading ? <Skeleton height={26} width={60} style={{ margin: '0 auto' }} /> : val}
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.3 }}>
        {loading ? <Skeleton height={11} width={70} style={{ margin: '4px auto 0' }} /> : label}
      </div>
      {sub && !loading && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

export default function AdminMetricsTab() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await fetchMetrics())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
        <AlertTriangle size={28} color="var(--error)" style={{ marginBottom: 10 }} />
        <p style={{ margin: '0 0 12px' }}>{error}</p>
        <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14} /> Retry</button>
      </div>
    )
  }

  const t = data?.totals || {}
  const r = data?.revenue || {}
  const g = data?.growth || {}
  const a = data?.activation || {}
  const e = data?.engagement || {}
  const series = buildDailySeries(g.signupsByDay, 30)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
          {data ? `As of ${new Date(data.generatedAt).toLocaleString('en-GB')}` : 'Loading…'}
        </p>
        <button className="btn btn-secondary btn-sm" onClick={() => { load(); toast.success('Refreshing…') }} disabled={loading}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      <div className="grid-3" style={{ gap: 10, marginBottom: 16 }}>
        <StatCard loading={loading} icon={<PoundSterling size={18} />} colour="var(--success)"
          val={loading ? '' : `£${r.mrrGbp?.toFixed(2) ?? '0.00'}`} label="MRR (estimated)"
          sub={loading ? '' : `£${r.arrGbp?.toFixed(0) ?? 0} ARR`} />
        <StatCard loading={loading} icon={<Users size={18} />} colour="var(--accent)"
          val={loading ? '' : t.totalUsers ?? 0} label="Total users" />
        <StatCard loading={loading} icon={<TrendingUp size={18} />} colour="var(--info)"
          val={loading ? '' : `${r.conversionRate ?? 0}%`} label="Free → paying conversion" />
        <StatCard loading={loading} icon={<UserCheck size={18} />} colour="var(--accent)"
          val={loading ? '' : t.payingCount ?? 0} label="Paying subscribers"
          sub={loading ? '' : `${r.monthlyPayers ?? 0} monthly · ${r.annualPayers ?? 0} annual`} />
        <StatCard loading={loading} icon={<Users size={18} />} colour="var(--warning)"
          val={loading ? '' : t.betaCount ?? 0} label="Beta (lifetime free Pro)" />
        <StatCard loading={loading} icon={<UserCheck size={18} />} colour="var(--info)"
          val={loading ? '' : `${a.onboardingCompletionRate ?? 0}%`} label="Onboarding completion" />
      </div>

      {!loading && r.paymentFailedCount > 0 && (
        <div className="card" style={{ padding: '10px 14px', marginBottom: 16, borderLeft: '3px solid var(--warning)' }}>
          <AlertTriangle size={14} color="var(--warning)" style={{ verticalAlign: -2, marginRight: 6 }} />
          <strong>{r.paymentFailedCount}</strong> subscriber{r.paymentFailedCount !== 1 ? 's have' : ' has'} a failed payment on file — Stripe will retry, but worth checking these aren't stuck.
        </div>
      )}

      <Section title="Signups — last 30 days" icon={<TrendingUp size={16} />}>
        {loading ? <Skeleton height={180} /> : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={series}>
              <defs>
                <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
              <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.78rem' }} />
              <Area type="monotone" dataKey="count" name="Signups" stroke="var(--accent)" fill="url(#signupGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
        {!loading && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>
            {g.signupsLast7 ?? 0} in the last 7 days · {g.signupsLast30 ?? 0} in the last 30
          </p>
        )}
      </Section>

      <Section title="Engagement" icon={<Users size={16} />} defaultOpen={false}>
        {loading ? <Skeleton height={40} /> : (
          <p style={{ fontSize: '0.85rem', margin: 0 }}>
            Average XP per user: <strong>{e.avgXp ?? 0}</strong> · Users with an active streak: <strong>{e.usersWithActiveStreak ?? 0}</strong> ·
            Active in last 7 days (estimate): <strong>{a.activeLast7Estimate ?? 0}</strong>
          </p>
        )}
      </Section>

      {!loading && data?.notes?.length > 0 && (
        <div className="card" style={{ padding: '10px 14px', marginTop: 4 }}>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', gap: 6, margin: '0 0 4px' }}>
            <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} /> <strong>What's estimated, not exact:</strong>
          </p>
          <ul style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0, paddingLeft: 20 }}>
            {data.notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}
