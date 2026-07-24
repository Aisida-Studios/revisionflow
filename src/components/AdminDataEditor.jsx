// src/components/AdminDataEditor.jsx
// Lets admin add/edit/remove topics, exam dates, paper specs & grade boundaries, topic notes,
// and flashcard sets — the "edit all public data" request. Topics/exam dates/paper data are
// static JS files at build time (see src/data/overrides.js for why and how the override layer
// works); notes and flashcards were already Firestore-backed, so those are direct edits.

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, orderBy, limit as fsLimit } from 'firebase/firestore'
import { db } from '../firebase'
import { Section } from '../pages/Admin'
import { EXAM_BOARDS, getSubjectList } from '../data/subjects'
import {
  getTopicOverride, saveTopicOverride,
  listExamDateOverrides, saveExamDateOverride, deleteExamDateOverride,
  getPaperSpecOverride, savePaperSpecOverride,
  getBoundaryOverride, saveBoundaryOverride,
} from '../data/overrides'

const LEVELS = ['GCSE', 'AS-Level', 'A-Level']

const TABS = [
  { id: 'topics',   label: 'Topics' },
  { id: 'examdates', label: 'Exam Dates' },
  { id: 'papers',   label: 'Papers & Boundaries' },
  { id: 'notes',    label: 'Topic Notes' },
  { id: 'flashcards', label: 'Flashcards' },
]

export default function AdminDataEditor() {
  const [tab, setTab] = useState('topics')
  return (
    <div>
      <div className="tabs" style={{ marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}
            style={tab === t.id ? { background: 'var(--bg-card)', color: 'var(--accent-light)' } : {}}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'topics' && <TopicsEditor />}
      {tab === 'examdates' && <ExamDatesEditor />}
      {tab === 'papers' && <PapersEditor />}
      {tab === 'notes' && <NotesEditor />}
      {tab === 'flashcards' && <FlashcardsEditor />}
    </div>
  )
}

/* ── Topics ─────────────────────────────────────────────────────────────── */
function TopicsEditor() {
  const [level, setLevel] = useState('GCSE')
  const [board, setBoard] = useState('AQA')
  const [subject, setSubject] = useState('')
  const [staticTopics, setStaticTopics] = useState([])
  const [override, setOverride] = useState({ added: [], removedNames: [], renamed: {} })
  const [newTopicName, setNewTopicName] = useState('')
  const [newTopicPaper, setNewTopicPaper] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const subjectList = getSubjectList(level)

  useEffect(() => { if (subjectList.length && !subject) setSubject(subjectList[0]) }, [level])

  useEffect(() => {
    if (!subject || !board || !level) return
    setLoading(true)
    Promise.all([
      import('../data/topics').then(m => m.getTopicsForSubject(board, subject, level) || {}),
      getTopicOverride(board, level, subject),
    ]).then(([papers, ov]) => {
      const flat = [...new Set(Object.values(papers).flat().filter(t => typeof t === 'string' && t.trim()))]
      setStaticTopics(flat)
      setOverride(ov || { added: [], removedNames: [], renamed: {} })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [board, level, subject])

  async function save(next) {
    setSaving(true)
    try {
      await saveTopicOverride(board, level, subject, next)
      setOverride(next)
      toast.success('Saved')
    } catch (e) { toast.error('Save failed: ' + e.message) }
    setSaving(false)
  }

  function addTopic() {
    if (!newTopicName.trim()) return
    save({ ...override, added: [...(override.added || []), { name: newTopicName.trim(), paper: newTopicPaper.trim() || 'Admin-added' }] })
    setNewTopicName(''); setNewTopicPaper('')
  }
  function removeAdded(i) {
    save({ ...override, added: override.added.filter((_, idx) => idx !== i) })
  }
  function hideStatic(name) {
    save({ ...override, removedNames: [...new Set([...(override.removedNames || []), name])] })
  }
  function unhideStatic(name) {
    save({ ...override, removedNames: (override.removedNames || []).filter(n => n !== name) })
  }

  const removedSet = new Set(override.removedNames || [])
  const visibleStatic = staticTopics.filter(t => !removedSet.has(t))
  const hiddenStatic = staticTopics.filter(t => removedSet.has(t))

  return (
    <div>
      <div className="grid-3" style={{ gap: 10, marginBottom: 16 }}>
        <select className="select" value={level} onChange={e => { setLevel(e.target.value); setSubject('') }}>
          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select className="select" value={board} onChange={e => setBoard(e.target.value)}>
          {EXAM_BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select className="select" value={subject} onChange={e => setSubject(e.target.value)}>
          {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p> : (
        <>
          <Section title={`Add a topic (${visibleStatic.length + (override.added?.length || 0)} currently listed)`} icon="➕">
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input className="input" placeholder="Topic name" value={newTopicName} onChange={e => setNewTopicName(e.target.value)} style={{ flex: 2 }} />
              <input className="input" placeholder="Paper/component (optional)" value={newTopicPaper} onChange={e => setNewTopicPaper(e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn-primary btn-sm" onClick={addTopic} disabled={saving}>Add</button>
            </div>
          </Section>

          <Section title="Current topics" icon="📋" defaultOpen={false}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
              {visibleStatic.map(name => (
                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'var(--bg-card)', borderRadius: 8 }}>
                  <span style={{ fontSize: '0.85rem' }}>{name}</span>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => hideStatic(name)} disabled={saving}>Hide</button>
                </div>
              ))}
              {(override.added || []).map((t, i) => (
                <div key={'added-' + i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'rgba(124,58,237,0.08)', borderRadius: 8 }}>
                  <span style={{ fontSize: '0.85rem' }}>{t.name} <span className="badge badge-purple" style={{ marginLeft: 6 }}>admin-added</span></span>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => removeAdded(i)} disabled={saving}>Remove</button>
                </div>
              ))}
            </div>
          </Section>

          {hiddenStatic.length > 0 && (
            <Section title={`Hidden topics (${hiddenStatic.length})`} icon="🙈" defaultOpen={false}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {hiddenStatic.map(name => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'var(--bg-card)', borderRadius: 8, opacity: 0.6 }}>
                    <span style={{ fontSize: '0.85rem' }}>{name}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => unhideStatic(name)} disabled={saving}>Unhide</button>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  )
}

/* ── Exam dates ─────────────────────────────────────────────────────────── */
function ExamDatesEditor() {
  const [level, setLevel] = useState('GCSE')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ board: 'AQA', subject: '', tier: 'N/A', paper: '1', paperName: '', date: '' })

  useEffect(() => { load() }, [level])

  async function load() {
    setLoading(true)
    try { setEntries(await listExamDateOverrides(level)) } catch (e) { toast.error('Load failed: ' + e.message) }
    setLoading(false)
  }

  async function addEntry(e) {
    e.preventDefault()
    if (!form.subject || !form.date) { toast.error('Subject and date required'); return }
    try {
      await saveExamDateOverride({ ...form, level, paper: parseInt(form.paper) || 1 })
      toast.success('Saved — this shows for students immediately')
      setForm({ board: form.board, subject: '', tier: 'N/A', paper: '1', paperName: '', date: '' })
      load()
    } catch (e) { toast.error('Save failed: ' + e.message) }
  }

  async function removeEntry(id) {
    if (!window.confirm('Delete this exam date entry?')) return
    try { await deleteExamDateOverride(id); load() } catch (e) { toast.error('Delete failed: ' + e.message) }
  }

  return (
    <div>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
        Add a new date (e.g. for 2027, or a subject/board combo not in the static data) or override
        an existing static entry — matched by board + subject + paper number. Takes effect for
        students immediately, no deploy needed.
      </p>
      <select className="select" value={level} onChange={e => setLevel(e.target.value)} style={{ marginBottom: 14, maxWidth: 200 }}>
        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
      </select>

      <Section title="Add / override an exam date" icon="➕">
        <form onSubmit={addEntry} className="grid-3" style={{ gap: 10 }}>
          <select className="select" value={form.board} onChange={e => setForm(f => ({ ...f, board: e.target.value }))}>
            {EXAM_BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <input className="input" placeholder="Subject (exact name)" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
          <input className="input" placeholder="Tier (N/A if untiered)" value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))} />
          <input className="input" type="number" placeholder="Paper number" value={form.paper} onChange={e => setForm(f => ({ ...f, paper: e.target.value }))} />
          <input className="input" placeholder="Paper name" value={form.paperName} onChange={e => setForm(f => ({ ...f, paperName: e.target.value }))} />
          <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <button className="btn btn-primary" type="submit">Save</button>
        </form>
      </Section>

      <Section title={`Admin entries for ${level} (${entries.length})`} icon="📋" defaultOpen={false}>
        {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p> : entries.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No admin overrides for {level} yet — the static 2026 dates are used as-is.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {entries.map(e => (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 8, fontSize: '0.85rem' }}>
                <span>{e.board} · {e.subject} P{e.paper} · {e.paperName} · <strong>{e.date}</strong>{e.removed && <span className="badge badge-grey" style={{ marginLeft: 6 }}>hidden</span>}</span>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => removeEntry(e.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

/* ── Papers & boundaries ────────────────────────────────────────────────── */
function PapersEditor() {
  const [level, setLevel] = useState('GCSE')
  const [board, setBoard] = useState('AQA')
  const [subject, setSubject] = useState('')
  const [paper, setPaper] = useState('1')
  const [spec, setSpec] = useState({ maxMarks: '', duration: '' })
  const [bounds, setBounds] = useState({ maxMarks: '', boundaries: '', grades: '' })
  const [saving, setSaving] = useState(false)

  const subjectList = getSubjectList(level)
  useEffect(() => { if (subjectList.length && !subject) setSubject(subjectList[0]) }, [level])

  useEffect(() => {
    if (!subject) return
    getPaperSpecOverride(board, level, subject, parseInt(paper) || 1).then(s => {
      setSpec(s ? { maxMarks: s.maxMarks, duration: s.duration } : { maxMarks: '', duration: '' })
    })
    getBoundaryOverride(board, level, subject).then(b => {
      setBounds(b ? { maxMarks: b.maxMarks, boundaries: (b.boundaries || []).join(', '), grades: (b.grades || []).join(', ') } : { maxMarks: '', boundaries: '', grades: '' })
    })
  }, [board, level, subject, paper])

  async function saveSpec() {
    setSaving(true)
    try {
      await savePaperSpecOverride(board, level, subject, parseInt(paper) || 1, {
        maxMarks: parseInt(spec.maxMarks) || null, duration: parseInt(spec.duration) || null,
      })
      toast.success('Paper spec saved')
    } catch (e) { toast.error('Save failed: ' + e.message) }
    setSaving(false)
  }

  async function saveBounds() {
    setSaving(true)
    try {
      await saveBoundaryOverride(board, level, subject, {
        maxMarks: parseInt(bounds.maxMarks) || null,
        boundaries: bounds.boundaries.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n)),
        grades: bounds.grades.trim() ? bounds.grades.split(',').map(s => s.trim()) : null,
      })
      toast.success('Grade boundaries saved')
    } catch (e) { toast.error('Save failed: ' + e.message) }
    setSaving(false)
  }

  return (
    <div>
      <div className="grid-3" style={{ gap: 10, marginBottom: 16 }}>
        <select className="select" value={level} onChange={e => { setLevel(e.target.value); setSubject('') }}>
          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select className="select" value={board} onChange={e => setBoard(e.target.value)}>
          {EXAM_BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select className="select" value={subject} onChange={e => setSubject(e.target.value)}>
          {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <Section title="Paper spec (max marks + duration)" icon="📄">
        <div className="grid-3" style={{ gap: 10, marginBottom: 10 }}>
          <input className="input" placeholder="Paper number" value={paper} onChange={e => setPaper(e.target.value)} />
          <input className="input" type="number" placeholder="Max marks" value={spec.maxMarks} onChange={e => setSpec(s => ({ ...s, maxMarks: e.target.value }))} />
          <input className="input" type="number" placeholder="Duration (minutes)" value={spec.duration} onChange={e => setSpec(s => ({ ...s, duration: e.target.value }))} />
        </div>
        <button className="btn btn-primary btn-sm" onClick={saveSpec} disabled={saving}>Save spec</button>
      </Section>

      <Section title="Grade boundaries (whole subject, not per-paper)" icon="📊">
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
          Boundaries as a comma-separated list, highest grade first (e.g. GCSE: 9,8,7,6,5,4,3,2,1 marks — A-Level: A*,A,B,C,D,E marks). Grades field is optional; defaults to 9-1.
        </p>
        <div className="grid-2" style={{ gap: 10, marginBottom: 10 }}>
          <input className="input" type="number" placeholder="Max marks" value={bounds.maxMarks} onChange={e => setBounds(b => ({ ...b, maxMarks: e.target.value }))} />
          <input className="input" placeholder="Grade labels (optional, e.g. A*,A,B,C,D,E)" value={bounds.grades} onChange={e => setBounds(b => ({ ...b, grades: e.target.value }))} />
        </div>
        <input className="input" placeholder="Mark boundaries, comma-separated, highest first" value={bounds.boundaries} onChange={e => setBounds(b => ({ ...b, boundaries: e.target.value }))} style={{ marginBottom: 10, width: '100%' }} />
        <button className="btn btn-primary btn-sm" onClick={saveBounds} disabled={saving}>Save boundaries</button>
      </Section>
    </div>
  )
}

/* ── Topic notes ────────────────────────────────────────────────────────── */
function NotesEditor() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // slug of note being edited
  const [draft, setDraft] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const snap = await getDocs(query(collection(db, 'topicNotes'), orderBy('generatedAt', 'desc'), fsLimit(100)))
      setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) { toast.error('Load failed: ' + e.message) }
    setLoading(false)
  }

  function startEdit(note) { setEditing(note.id); setDraft(note.text || '') }

  async function saveEdit(id) {
    try {
      await setDoc(doc(db, 'topicNotes', id), { text: draft, updatedAt: new Date() }, { merge: true })
      toast.success('Saved')
      setEditing(null)
      load()
    } catch (e) { toast.error('Save failed: ' + e.message) }
  }

  async function removeNote(id) {
    if (!window.confirm('Delete this note? Students will get a freshly-generated one next time it\'s requested.')) return
    try { await deleteDoc(doc(db, 'topicNotes', id)); load() } catch (e) { toast.error('Delete failed: ' + e.message) }
  }

  return (
    <div>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
        Most recent 100 topic notes. Deleting one just clears the cache for that topic — it'll
        regenerate next time a student (or the auto-generate tool) requests it.
      </p>
      {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notes.map(n => (
            <div key={n.id} className="card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{n.board} {n.level} {n.subject} — {n.topic}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {editing === n.id ? (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => saveEdit(n.id)}>Save</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-secondary btn-sm" onClick={() => startEdit(n)}>Edit</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => removeNote(n.id)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
              {editing === n.id ? (
                <textarea className="input" value={draft} onChange={e => setDraft(e.target.value)} style={{ width: '100%', minHeight: 200, fontFamily: 'monospace', fontSize: '0.8rem' }} />
              ) : (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxHeight: 60, overflow: 'hidden' }}>{(n.text || '').slice(0, 200)}…</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Flashcards ─────────────────────────────────────────────────────────── */
function FlashcardsEditor() {
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [draftCards, setDraftCards] = useState([])

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const snap = await getDocs(query(collection(db, 'publicFlashcards'), orderBy('createdAt', 'desc'), fsLimit(100)))
      setSets(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(s => s.authorType === 'official'))
    } catch (e) { toast.error('Load failed: ' + e.message) }
    setLoading(false)
  }

  function startEdit(set) { setEditing(set.id); setDraftCards(set.cards || []) }

  function updateCard(i, field, val) {
    setDraftCards(cards => cards.map((c, idx) => idx === i ? { ...c, [field]: val } : c))
  }
  function removeCard(i) { setDraftCards(cards => cards.filter((_, idx) => idx !== i)) }
  function addCard() { setDraftCards(cards => [...cards, { q: '', a: '' }]) }

  async function saveEdit(id) {
    try {
      await setDoc(doc(db, 'publicFlashcards', id), { cards: draftCards, cardCount: draftCards.length, updatedAt: new Date() }, { merge: true })
      toast.success('Saved')
      setEditing(null)
      load()
    } catch (e) { toast.error('Save failed: ' + e.message) }
  }

  async function removeSet(id) {
    if (!window.confirm('Delete this flashcard set? Students browsing premade quizzes will no longer see it.')) return
    try { await deleteDoc(doc(db, 'publicFlashcards', id)); load() } catch (e) { toast.error('Delete failed: ' + e.message) }
  }

  return (
    <div>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
        Official flashcard sets students can browse as premade quizzes (Study Tools → Quiz).
      </p>
      {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sets.map(s => (
            <div key={s.id} className="card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.title} <span className="badge badge-grey">{s.cardCount} cards</span></span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {editing === s.id ? (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => saveEdit(s.id)}>Save</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-secondary btn-sm" onClick={() => startEdit(s)}>Edit cards</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => removeSet(s.id)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
              {editing === s.id && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {draftCards.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input className="input" placeholder="Question" value={c.q} onChange={e => updateCard(i, 'q', e.target.value)} style={{ flex: 1 }} />
                      <input className="input" placeholder="Answer" value={c.a} onChange={e => updateCard(i, 'a', e.target.value)} style={{ flex: 1 }} />
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => removeCard(i)}>✕</button>
                    </div>
                  ))}
                  <button className="btn btn-secondary btn-sm" onClick={addCard} style={{ alignSelf: 'flex-start' }}>+ Add card</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
