// src/components/AdminAutoGenerate.jsx
// One-button content generation across every subject/board/level, instead of the old flow of
// manually picking one subject at a time and clicking generate. Cache-aware (skips anything
// already done, using the same topicNotes/flashcardCache/publicFlashcards caches everything
// else reads from) and retries failed/invalid generations automatically before giving up on an
// item — so a transient API error on one topic doesn't derail the whole run.
//
// IMPORTANT REALITY CHECK, surfaced in the UI itself: a full run across all ~3,700 topics in
// this app is roughly 2-4 hours of continuous API calls (rate-limited on purpose, same as the
// old per-subject generator). This is designed to be safely interrupted and resumed — since
// every item is cache-checked before generating, clicking "Start" again after a stop (or a
// closed tab) just picks back up on whatever's still missing, at no extra cost for what's
// already done.

import React, { useState, useRef } from 'react'
import toast from 'react-hot-toast'

const LEVELS = ['GCSE', 'AS-Level', 'A-Level']
const BOARDS = ['AQA', 'Edexcel', 'OCR', 'WJEC', 'Eduqas', 'CCEA']
const MAX_ATTEMPTS = 3
const BATCH_SIZE = 5
const DELAY_MS = 1600 // rate-limit pacing — applied once per batch, and only when that batch actually hit the API (all-cached batches don't pace)

function validateNote(text) {
  if (!text || text.trim().length < 150) return 'Note too short (likely a failed/empty generation)'
  const lower = text.toLowerCase()
  if (lower.includes("i can't help") || lower.includes('as an ai') || lower.includes('i cannot assist')) {
    return 'Response looks like a refusal, not a revision note'
  }
  return null // valid
}

function validateFlashcards(cards) {
  if (!Array.isArray(cards) || cards.length < 5) return 'Fewer than 5 cards parsed (likely a malformed response)'
  return null
}

export default function AdminAutoGenerate() {
  const [levels,  setLevels]  = useState([...LEVELS])
  const [boards,  setBoards]  = useState([...BOARDS])
  const [types,   setTypes]   = useState(['notes', 'flashcards'])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(null) // { done, total, cached, generated, failed, current }
  const [log, setLog] = useState([])
  const [failures, setFailures] = useState([]) // [{ label, reason }] — every item that gave up after MAX_ATTEMPTS
  const stopRef = useRef(false)

  function toggle(arr, setArr, val) {
    setArr(a => a.includes(val) ? a.filter(x => x !== val) : [...a, val])
  }

  function addLog(msg, type = 'info') {
    setLog(l => [...l.slice(-300), { msg, type, ts: new Date().toLocaleTimeString() }])
  }

  function copyFailureReport() {
    const text = failures.map(f => `${f.label} — ${f.reason}`).join('\n')
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`Copied ${failures.length} failure(s) to clipboard`))
      .catch(() => toast.error('Could not copy — clipboard access blocked'))
  }

  const [migrating, setMigrating] = useState(false)

  async function runMigrationOnly() {
    setMigrating(true)
    addLog('Checking for existing flashcard sets made before cache-checking existed…')
    try {
      const fs = await import('../utils/firestore')
      const result = await fs.migrateLegacyOfficialFlashcardSets()
      addLog(`Done — ${result.migrated} recognized, ${result.skipped} already fine, ${result.unparseable} unparseable titles left untouched`, 'success')
    } catch (e) {
      addLog('Migration failed: ' + e.message, 'error')
    }
    setMigrating(false)
  }

  async function buildQueue() {
    const { getSubjectsForBoard, getTopicsForSubject } = await import('../data/topics')
    const queue = []
    for (const level of levels) {
      for (const board of boards) {
        let subjects = []
        try { subjects = getSubjectsForBoard(board, level) || [] } catch (e) { continue }
        for (const subject of subjects) {
          let papers = {}
          try { papers = getTopicsForSubject(board, subject, level) || {} } catch (e) { continue }
          const topicList = [...new Set(Object.values(papers).flat().filter(t => typeof t === 'string' && t.trim()))]
          for (const topic of topicList) {
            if (types.includes('notes'))      queue.push({ kind: 'note', board, level, subject, topic })
            if (types.includes('flashcards')) queue.push({ kind: 'flashcard', board, level, subject, topic })
          }
        }
      }
    }
    return queue
  }

  // A 504/non-JSON failure specifically means the function was cut off mid-generation — the
  // one case where asking for less content next attempt actually improves the odds of finishing
  // in time. Any other failure (a genuine API error, a validation problem) isn't helped by fewer
  // tokens, so only this specific shape of error triggers the step-down.
  function looksLikeTimeout(msg) {
    return typeof msg === 'string' && (msg.includes('ran too long') || msg.includes('timed out'))
  }

  async function processItem(item, ai, fs) {
    if (item.kind === 'note') {
      const cached = await ai.getTopicNoteFromCache(item.board, item.level, item.subject, item.topic)
      if (cached) return { status: 'cached' }

      let lastReason = 'Unknown error'
      let maxTokens = 4096 // per-call budget now that generateTopicNote splits internally — see ai.js
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const res = await ai.generateTopicNote({ subject: item.subject, board: item.board, level: item.level, topic: item.topic, uid: null, maxTokens })
        if (res.error) {
          lastReason = res.error
          addLog(`Attempt ${attempt}/${MAX_ATTEMPTS} failed (${item.board} ${item.level} ${item.subject} — ${item.topic}): ${res.error}`, 'error')
          if (looksLikeTimeout(res.error)) {
            maxTokens = Math.max(2200, maxTokens - 900)
            addLog(`  → retrying with a smaller token budget (${maxTokens})`, 'info')
          }
          continue
        }
        const problem = validateNote(res.text)
        if (problem) {
          lastReason = problem
          addLog(`Attempt ${attempt}/${MAX_ATTEMPTS} invalid (${item.board} ${item.level} ${item.subject} — ${item.topic}): ${problem}`, 'error')
          continue
        }
        await ai.saveTopicNoteToCache(item.board, item.level, item.subject, item.topic, res.text)
        return { status: 'generated' }
      }
      return { status: 'failed', reason: lastReason }
    }

    if (item.kind === 'flashcard') {
      const existingOfficial = await fs.getOfficialFlashcardSet(item.board, item.level, item.subject, item.topic)
      if (existingOfficial) return { status: 'cached' }
      const cachedRaw = await ai.getFlashcardSetFromCache(item.board, item.level, item.subject, item.topic, 50)
      if (cachedRaw?.cards?.length) {
        await fs.saveOfficialFlashcardSet(item.board, item.level, item.subject, item.topic, cachedRaw.cards)
        return { status: 'cached' }
      }

      let lastReason = 'Unknown error'
      let maxTokens = 4096 // per-call budget — two 25-card calls instead of one 50-card call
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const res1 = await ai.generateFlashcards(item.subject, item.topic, 25, null, maxTokens,
          'Focus ONLY on core definitions, key terms, and direct factual recall.')
        if (res1.error) {
          lastReason = res1.error
          addLog(`Attempt ${attempt}/${MAX_ATTEMPTS} failed (${item.board} ${item.level} ${item.subject} — ${item.topic}): ${res1.error}`, 'error')
          if (looksLikeTimeout(res1.error)) {
            maxTokens = Math.max(2200, maxTokens - 900)
            addLog(`  → retrying with a smaller token budget (${maxTokens})`, 'info')
          }
          continue
        }
        const res2 = await ai.generateFlashcards(item.subject, item.topic, 25, null, maxTokens,
          'Focus ONLY on application, worked scenarios, and common misconceptions — do NOT write simple definition-recall cards, those are covered separately.')
        if (res2.error) {
          lastReason = res2.error
          addLog(`Attempt ${attempt}/${MAX_ATTEMPTS} failed (${item.board} ${item.level} ${item.subject} — ${item.topic}): ${res2.error}`, 'error')
          if (looksLikeTimeout(res2.error)) {
            maxTokens = Math.max(2200, maxTokens - 900)
            addLog(`  → retrying with a smaller token budget (${maxTokens})`, 'info')
          }
          continue
        }
        const cards1 = ai.parseFlashcards(res1.text || '')
        const cards2raw = ai.parseFlashcards(res2.text || '')
        // Two independent calls for the same topic can still land on the same question despite
        // the different focus hints — cheap safety net, drop exact (case-insensitive) repeats.
        const seen = new Set(cards1.map(c => (c.q || '').trim().toLowerCase()))
        const cards2 = cards2raw.filter(c => {
          const key = (c.q || '').trim().toLowerCase()
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        const cards = [...cards1, ...cards2]
        const problem = validateFlashcards(cards)
        if (problem) {
          lastReason = problem
          addLog(`Attempt ${attempt}/${MAX_ATTEMPTS} invalid (${item.board} ${item.level} ${item.subject} — ${item.topic}): ${problem}`, 'error')
          continue
        }
        await fs.saveOfficialFlashcardSet(item.board, item.level, item.subject, item.topic, cards)
        ai.saveFlashcardSetToCache(item.board, item.level, item.subject, item.topic, 50, cards).catch(() => {})
        return { status: 'generated' }
      }
      return { status: 'failed', reason: lastReason }
    }
  }

  async function start() {
    if (!levels.length || !boards.length || !types.length) {
      toast.error('Pick at least one level, board, and content type')
      return
    }
    stopRef.current = false
    setRunning(true)
    setLog([])
    setFailures([])
    addLog('Building queue…')

    const ai = await import('../utils/ai')
    const fs = await import('../utils/firestore')

    if (types.includes('flashcards')) {
      addLog('Checking for existing flashcard sets made before cache-checking existed…')
      const migResult = await fs.migrateLegacyOfficialFlashcardSets()
      if (migResult.migrated > 0) addLog(`Recognized ${migResult.migrated} existing flashcard set(s) so they won't be regenerated`, 'success')
      if (migResult.unparseable > 0) addLog(`${migResult.unparseable} existing set(s) had a title I couldn't match to a board/level — left as-is, won't block the run`, 'error')
    }

    const queue = await buildQueue()
    if (!queue.length) {
      addLog('Nothing matches this scope', 'error')
      setRunning(false)
      return
    }
    addLog(`Queue built: ${queue.length} items (${levels.join(', ')} · ${boards.join(', ')} · ${types.join(' + ')})`)
    setProgress({ done: 0, total: queue.length, cached: 0, generated: 0, failed: 0, current: '' })

    let done = 0, cachedCount = 0, generated = 0, failed = 0
    const startTime = Date.now()

    for (let i = 0; i < queue.length; i += BATCH_SIZE) {
      if (stopRef.current) { addLog('Stopped — click Start again any time to resume (already-done items are skipped for free)', 'error'); break }

      const batch = queue.slice(i, i + BATCH_SIZE)
      const labels = batch.map(item => `${item.kind === 'note' ? '📝' : '🃏'} ${item.board} ${item.level} ${item.subject} — ${item.topic}`)
      setProgress(p => ({ ...p, current: labels.join('  ·  ') }))

      // Batch runs concurrently — up to BATCH_SIZE items in flight at once, instead of one
      // network round-trip at a time. Each item still gets its own cache check + retries.
      const results = await Promise.all(batch.map(async (item, idx) => {
        const label = labels[idx]
        try {
          const result = await processItem(item, ai, fs)
          if (result.status === 'cached') addLog(`Already done, skipped: ${label}`, 'cached')
          else if (result.status === 'generated') addLog(`Generated: ${label}`, 'success')
          else addLog(`Gave up after ${MAX_ATTEMPTS} attempts: ${label} — ${result.reason}`, 'error')
          return { status: result.status, label, reason: result.reason }
        } catch (e) {
          addLog(`Unexpected error on ${label}: ${e.message}`, 'error')
          return { status: 'failed', label, reason: e.message || 'Unexpected error' }
        }
      }))

      const newFailures = results.filter(r => r.status === 'failed').map(r => ({ label: r.label, reason: r.reason }))
      if (newFailures.length) setFailures(f => [...f, ...newFailures])

      for (const r of results) {
        done++
        if (r.status === 'cached') cachedCount++
        else if (r.status === 'generated') generated++
        else failed++
      }

      const elapsed = Date.now() - startTime
      const perItem = done > 0 ? elapsed / done : 0
      const remaining = Math.round((queue.length - done) * perItem / 60000)
      setProgress({ done, total: queue.length, cached: cachedCount, generated, failed, current: '', etaMinutes: remaining })

      // Only pace when this batch actually made API calls — a batch that was 100% cache
      // hits (the normal case on a re-run/resume) moves straight on to the next batch.
      // Skipped on the last batch too, since there's nothing left to be polite to the API for.
      const batchHitApi = results.some(r => r.status !== 'cached')
      const isLastBatch = i + BATCH_SIZE >= queue.length
      if (batchHitApi && !isLastBatch && !stopRef.current) {
        await new Promise(r => setTimeout(r, DELAY_MS))
      }
    }

    addLog(`Run finished: ${generated} generated, ${cachedCount} already done, ${failed} gave up after retries`, failed > 0 ? 'error' : 'success')
    setRunning(false)
  }

  const logColour = { info: 'var(--text-muted)', success: 'var(--success)', error: 'var(--danger)', cached: 'var(--info)' }
  const pct = progress ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h4 style={{ margin: 0 }}>Auto-generate everything missing</h4>
      </div>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
        One button instead of picking a subject at a time. Checks the cache for every topic first
        and only generates what's actually missing, so it's always safe to stop and restart —
        nothing already done gets regenerated or costs API tokens twice.
        A full run across every level/board/subject is roughly <strong>2–4 hours</strong> of
        continuous calls (this app has ~3,700 individual topics) — narrow the scope below if you'd
        rather run it in chunks, e.g. just GCSE first.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 14 }}>
        <div>
          <label className="label">Levels</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {LEVELS.map(l => (
              <button key={l} disabled={running} onClick={() => toggle(levels, setLevels, l)}
                style={{ padding: '4px 10px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: running ? 'default' : 'pointer',
                  border: `1px solid ${levels.includes(l) ? 'var(--accent)' : 'var(--border)'}`,
                  background: levels.includes(l) ? 'rgba(124,58,237,0.15)' : 'transparent',
                  color: levels.includes(l) ? 'var(--accent-light)' : 'var(--text-muted)' }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Boards</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {BOARDS.map(b => (
              <button key={b} disabled={running} onClick={() => toggle(boards, setBoards, b)}
                style={{ padding: '4px 10px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: running ? 'default' : 'pointer',
                  border: `1px solid ${boards.includes(b) ? 'var(--accent)' : 'var(--border)'}`,
                  background: boards.includes(b) ? 'rgba(124,58,237,0.15)' : 'transparent',
                  color: boards.includes(b) ? 'var(--accent-light)' : 'var(--text-muted)' }}>
                {b}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Content</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[['notes', 'Topic notes'], ['flashcards', 'Flashcards']].map(([v, label]) => (
              <button key={v} disabled={running} onClick={() => toggle(types, setTypes, v)}
                style={{ padding: '4px 10px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: running ? 'default' : 'pointer',
                  border: `1px solid ${types.includes(v) ? 'var(--accent)' : 'var(--border)'}`,
                  background: types.includes(v) ? 'rgba(124,58,237,0.15)' : 'transparent',
                  color: types.includes(v) ? 'var(--accent-light)' : 'var(--text-muted)' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {progress && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6, flexWrap: 'wrap', gap: 4 }}>
            <span>{progress.done}/{progress.total} ({pct}%)</span>
            <span style={{ display: 'flex', gap: 10 }}>
              <span style={{ color: 'var(--success)' }}>{progress.generated} generated</span>
              <span style={{ color: 'var(--info)' }}>{progress.cached} already done</span>
              {progress.failed > 0 && <span style={{ color: 'var(--danger)' }}>{progress.failed} failed</span>}
            </span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: pct + '%', background: 'var(--accent)', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
          {progress.current && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
              {progress.current}
              {progress.etaMinutes != null && progress.etaMinutes > 0 && ` · ~${progress.etaMinutes} min remaining`}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" onClick={start} disabled={running}>
          {running ? 'Running…' : progress ? 'Resume (skips what\'s already done)' : 'Start'}
        </button>
        {running && (
          <button className="btn btn-secondary" onClick={() => { stopRef.current = true }}>Stop</button>
        )}
        {!running && (
          <button className="btn btn-secondary" onClick={runMigrationOnly} disabled={migrating}>
            {migrating ? 'Checking…' : 'Just recognize existing flashcard sets'}
          </button>
        )}
      </div>

      {failures.length > 0 && (
        <div style={{ marginTop: 16, border: '1px solid var(--danger)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Failures ({failures.length})</span>
            <button className="btn btn-ghost btn-sm" onClick={copyFailureReport}>Copy report</button>
          </div>
          <div style={{ maxHeight: 260, overflowY: 'auto', padding: '8px 14px', fontFamily: 'monospace', fontSize: '0.73rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {failures.map((f, i) => (
              <div key={i} style={{ color: 'var(--danger)' }}>{f.label} — {f.reason}</div>
            ))}
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div style={{ marginTop: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
            Log
            <button className="btn btn-ghost btn-sm" onClick={() => setLog([])}>Clear</button>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto', padding: '8px 14px', fontFamily: 'monospace', fontSize: '0.73rem', display: 'flex', flexDirection: 'column', gap: 3 }}>
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
