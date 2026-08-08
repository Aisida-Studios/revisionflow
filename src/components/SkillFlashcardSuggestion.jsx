// src/components/SkillFlashcardSuggestion.jsx
// Shown on the Answer Marker once marking history shows a consistently weak command word.
// Generates a small set of skill-focused flashcards (reusing the existing parseFlashcards
// format) and saves them through the existing saveFlashcardSet — same place every other
// generated set in the app ends up, so "My Sets" and Quiz both pick it up for free.
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { analyzeCommandWordWeakness } from '../utils/commandWords'
import { generateSkillFlashcards, parseFlashcards } from '../utils/ai'

export default function SkillFlashcardSuggestion({ attempts, subject, board, level, uid, exampleQuestion }) {
  const [cards, setCards] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const weak = analyzeCommandWordWeakness(attempts)
  if (!weak) return null

  async function handleGenerate() {
    setLoading(true)
    setCards(null)
    try {
      const res = await generateSkillFlashcards(subject, board, level, weak.commandWord, exampleQuestion, 3, uid)
      if (res.error) { toast.error(res.error); return }
      const parsed = parseFlashcards(res.text || '')
      if (!parsed.length) { toast.error('Could not build flashcards from that — try again'); return }
      setCards(parsed)
    } catch (e) {
      toast.error('Could not generate flashcards: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!cards || !uid) return
    setSaving(true)
    try {
      const { saveFlashcardSet } = await import('../utils/firestore')
      await saveFlashcardSet(uid, {
        title: weak.commandWord + ' practice — ' + subject,
        subject, topic: weak.commandWord + ' practice',
        cards, isPublic: false,
      })
      setSaved(true)
      toast.success('Saved to My Sets!')
    } catch (e) {
      toast.error('Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      marginTop: 14, padding: '14px 16px', borderRadius: 'var(--radius-md)',
      background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.25)',
    }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-light)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
        Next step
      </div>
      <p style={{ fontSize: '0.85rem', lineHeight: 1.55, marginBottom: 10 }}>
        You're averaging <strong>{weak.avgPct}%</strong> on <strong>{weak.commandWord.toLowerCase()}</strong>-style questions
        {weak.count > 1 ? ` across your last ${weak.count} marks` : ''} — want 3 flashcards focused on just that skill?
      </p>

      {!cards && (
        <button className="btn btn-primary btn-sm" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate 3 ' + weak.commandWord + ' flashcards'}
        </button>
      )}

      {cards && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {cards.map((c, i) => (
            <div key={i} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 3 }}>{c.q}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{c.a}</div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving || saved}>
              {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save to My Sets'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleGenerate} disabled={loading}>
              {loading ? '…' : 'Different 3'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
