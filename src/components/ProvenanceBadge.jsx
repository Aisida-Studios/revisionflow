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
