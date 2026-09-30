// src/components/AdminAnnouncementsTab.jsx
// Create/manage the announcements AnnouncementBanner.jsx displays in-app. Talks to
// netlify/functions/announcements.js directly (own small dispatcher), not admin.js.
import { useState, useEffect, useCallback } from 'react'
import { Section } from './Section'
import Skeleton from './Skeleton'
import toast from 'react-hot-toast'
import { Megaphone, Trash2, Eye, EyeOff, Plus } from 'lucide-react'

async function callAnnouncements(action, params = {}) {
  const { getAuth } = await import('firebase/auth')
  const { app } = await import('../firebase')
  const currentUser = getAuth(app).currentUser
  const idToken = currentUser ? await currentUser.getIdToken() : ''
  const res = await fetch('/api/announcements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
    body: JSON.stringify({ action, ...params }),
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || 'Request failed')
  return data
}

const emptyForm = { message: '', type: 'info', audience: 'all', linkUrl: '', linkText: '', expiresAt: '' }

export default function AdminAnnouncementsTab() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await callAnnouncements('list')
      setItems(data.announcements || [])
    } catch (e) { toast.error(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    if (!form.message.trim()) { toast.error('Message is required'); return }
    setSaving(true)
    try {
      await callAnnouncements('create', {
        message: form.message.trim(),
        type: form.type,
        audience: form.audience,
        linkUrl: form.linkUrl.trim() || null,
        linkText: form.linkText.trim() || null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt + 'T23:59:59').toISOString() : null,
      })
      toast.success('Announcement created')
      setForm(emptyForm)
      load()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  async function toggleActive(a) {
    try {
      await callAnnouncements('update', { id: a.id, active: !a.active })
      setItems(list => list.map(x => x.id === a.id ? { ...x, active: !a.active } : x))
      toast.success(a.active ? 'Deactivated' : 'Activated')
    } catch (e) { toast.error(e.message) }
  }

  async function remove(a) {
    if (!confirm('Delete this announcement? This can\'t be undone.')) return
    try {
      await callAnnouncements('delete', { id: a.id })
      setItems(list => list.filter(x => x.id !== a.id))
      toast.success('Deleted')
    } catch (e) { toast.error(e.message) }
  }

  const now = new Date().toISOString()

  return (
    <div>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Megaphone size={15} /> Not mounted yet
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
          The display component (AnnouncementBanner.jsx) exists and is ready, but isn't wired into the app layout yet —
          that's one line in Layout.jsx/App.jsx, outside this chat's file ownership. Announcements created here won't
          be visible to students until that's done.
        </p>
      </div>

      <Section title="New announcement" icon={<Plus size={16} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label className="label">Message</label>
            <textarea className="input" rows={3} value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="e.g. We've fixed board mixing in Topics and Past Papers — see what changed." />
          </div>
          <div className="grid-2" style={{ gap: 10 }}>
            <div>
              <label className="label">Type</label>
              <select className="select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
              </select>
            </div>
            <div>
              <label className="label">Audience</label>
              <select className="select" value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}>
                <option value="all">Everyone</option>
                <option value="free">Free users</option>
                <option value="pro">Paying Pro (not beta)</option>
                <option value="beta">Beta users</option>
              </select>
            </div>
          </div>
          <div className="grid-2" style={{ gap: 10 }}>
            <div>
              <label className="label">Link URL (optional)</label>
              <input className="input" value={form.linkUrl} onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))} placeholder="/pro" />
            </div>
            <div>
              <label className="label">Link text (optional)</label>
              <input className="input" value={form.linkText} onChange={e => setForm(f => ({ ...f, linkText: e.target.value }))} placeholder="See what's new" />
            </div>
          </div>
          <div>
            <label className="label">Expires (optional)</label>
            <input className="input" type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} style={{ maxWidth: 200 }} />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Leave blank for no expiry — deactivate manually below instead.</p>
          </div>
          <button className="btn btn-primary" onClick={handleCreate} disabled={saving} style={{ alignSelf: 'flex-start' }}>
            {saving ? 'Creating…' : 'Create announcement'}
          </button>
        </div>
      </Section>

      <Section title={`All announcements (${items.length})`} icon={<Megaphone size={16} />}>
        {loading ? <Skeleton height={100} /> : items.length === 0 ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>None yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map(a => {
              const expired = a.expiresAt && a.expiresAt < now
              return (
                <div key={a.id} style={{
                  padding: '10px 14px', borderRadius: 10, background: 'var(--bg-surface)',
                  border: '1px solid var(--border)', opacity: (a.active && !expired) ? 1 : 0.55,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', marginBottom: 4 }}>{a.message}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {a.type} · {a.audience} {expired && '· expired'} {!a.active && !expired && '· inactive'}
                        {a.createdAt && ' · ' + new Date(a.createdAt).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => toggleActive(a)} title={a.active ? 'Deactivate' : 'Activate'}>
                        {a.active ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => remove(a)} title="Delete">
                        <Trash2 size={13} color="var(--error)" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Section>
    </div>
  )
}
