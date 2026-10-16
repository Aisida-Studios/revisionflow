// src/components/ProvenanceBadge.jsx
// A small label saying where content came from (see utils/provenance.js).
import { PROVENANCE_LABELS } from '../utils/provenance'

const COLOURS = {
  official:   'var(--success)',
  community:  'var(--text-secondary)',
  student:    'var(--text-secondary)',
  'ai-draft': 'var(--warning)',
  unverified: 'var(--warning)',
}

export default function ProvenanceBadge({ source }) {
  const colour = COLOURS[source] || 'var(--text-muted)'
  return (
    <span className="badge" style={{ color: colour, border: `1px solid ${colour}`, background: 'transparent', fontSize: '0.66rem', marginLeft: 6 }}>
      {PROVENANCE_LABELS[source] || 'Unverified'}
    </span>
  )
}

// Shown above AI-generated learning content (topic notes, guides). Content an admin has approved is
// labelled as reviewed; everything else is plainly an AI draft the student should check.
export function AiContentNotice({ verified = false }) {
  if (verified) {
    return (
      <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <ProvenanceBadge source="official" /> Reviewed by RevisionFlow.
      </p>
    )
  }
  return (
    <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
      <ProvenanceBadge source="ai-draft" /> Written by AI and not reviewed. Check it against your specification and your teacher's notes before relying on it.
    </p>
  )
}
