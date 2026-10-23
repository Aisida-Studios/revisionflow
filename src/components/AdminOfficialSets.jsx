// src/components/AdminOfficialSets.jsx
// Admin tool for the RevisionFlow-made ("official") flashcard sets that already exist.
//  1. Old bulk-generated sets keep their board and level only in the title. "Fix board and level"
//     writes them as real fields (on the server) so the board filter can find them.
//  2. Those sets were never reviewed, so students see them as "Not yet reviewed". "Mark as reviewed"
//     records that an admin has checked them. It counts first and changes nothing until confirmed.
import { useState } from 'react'
import toast from 'react-hot-toast'
import { migrateOfficialSets, verifyOfficialSets } from '../utils/adminApi'
import { SUPPORTED_BOARDS } from '../data/boards'

export default function AdminOfficialSets() {
  const [busy, setBusy] = useState(false)
  const [board, setBoard] = useState('')
  const [level, setLevel] = useState('')
  const [subject, setSubject] = useState('')
  const [fixResult, setFixResult] = useState(null)
  const [count, setCount] = useState(null)       // { wouldVerify, alreadyVerified, total }

  async function run(fn) {
    setBusy(true)
    try { return await fn() }
    catch (e) { toast.error(e?.message || 'That did not work. Try again.'); return null }
    finally { setBusy(false) }
  }

  const fixBoards = () => run(async () => {
    const { summary } = await migrateOfficialSets()
    setFixResult(summary)
    toast.success(summary.stamped ? `Fixed board and level on ${summary.stamped} set(s)` : 'Nothing needed fixing')
  })

  const filter = () => ({ board, level, subject })

  const countUnreviewed = () => run(async () => {
    setCount(await verifyOfficialSets(filter(), false))
  })

  const markReviewed = () => run(async () => {
    const ok = window.confirm(`Mark ${count.wouldVerify} set(s) as reviewed?\n\nOnly do this for sets you have actually checked. Students will see them as Official - reviewed.`)
    if (!ok) return
    const res = await verifyOfficialSets(filter(), true)
    toast.success(`Marked ${res.verified} set(s) as reviewed`)
    setCount(null)
  })

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h4 style={{ marginBottom: 6, fontSize: '0.95rem' }}>RevisionFlow flashcard sets that already exist</h4>
      <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
        Sets made by the old bulk generator were published without a review and only have their board and level in the title.
        Fix the fields first, then review sets and mark them as reviewed.
      </p>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        <button className="btn btn-secondary btn-sm" onClick={fixBoards} disabled={busy}>Fix board and level on old sets</button>
        {fixResult && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {fixResult.scanned} checked, {fixResult.stamped} fixed, {fixResult.alreadyFine} already fine, {fixResult.unreadable} could not be read
          </span>
        )}
      </div>

      <div className="rf-config-grid" style={{ marginBottom: 12 }}>
        <select className="select" aria-label="Board" value={board} onChange={e => { setBoard(e.target.value); setCount(null) }}>
          <option value="">All boards</option>
          {SUPPORTED_BOARDS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>
        <select className="select" aria-label="Level" value={level} onChange={e => { setLevel(e.target.value); setCount(null) }}>
          <option value="">All levels</option>
          {['GCSE', 'AS-Level', 'A-Level'].map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <input className="input" aria-label="Subject" placeholder="Subject (optional, exact name)" value={subject}
          onChange={e => { setSubject(e.target.value); setCount(null) }} style={{ gridColumn: '1 / -1' }} />
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary btn-sm" onClick={countUnreviewed} disabled={busy}>Count sets not yet reviewed</button>
        {count && (
          <>
            <span style={{ fontSize: '0.82rem' }}>
              <strong>{count.wouldVerify}</strong> not yet reviewed ({count.alreadyVerified} already reviewed, {count.total} in total)
            </span>
            {count.wouldVerify > 0 && (
              <button className="btn btn-primary btn-sm" onClick={markReviewed} disabled={busy}>Mark {count.wouldVerify} as reviewed</button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
