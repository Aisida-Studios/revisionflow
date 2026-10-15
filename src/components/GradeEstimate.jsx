// src/components/GradeEstimate.jsx
// One way to show a predicted grade everywhere (Dashboard, AI page, Emergency Mode).
// It is always labelled "Estimated grade", always says what evidence it rests on, and offers the
// full working so a student can see exactly why the grade is what it is.
// `prediction` is one entry from computeSubjectPredictions() in utils/gradeInsights.js.
import { gradeColour } from '../utils/calendar'

const COVERAGE = {
  limited:  { text: 'Limited evidence',  colour: 'var(--warning)' },
  moderate: { text: 'Moderate evidence', colour: 'var(--text-secondary)' },
  good:     { text: 'Good evidence',     colour: 'var(--success)' },
}

export function rangeText(p) {
  return p?.range && p.range.low !== p.range.high ? `${p.range.low} to ${p.range.high}` : null
}

// compact: a single caption line for list rows. full: grade, range, evidence and the working.
export default function GradeEstimate({ prediction: p, variant = 'full' }) {
  if (!p) return null
  const cov = COVERAGE[p.coverage] || COVERAGE.limited
  const range = rangeText(p)

  if (variant === 'compact') {
    return (
      <span className="plain-row-meta" style={{ display: 'block', fontSize: '0.74rem' }}>
        {p.evidenceSummary}{range ? ` · likely ${range}` : ''}
      </span>
    )
  }

  return (
    <div>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        {p.label || 'Estimated grade'}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', margin: '2px 0 6px' }}>
        <span style={{ fontSize: '2.2rem', fontWeight: 800, color: gradeColour(p.grade) }}>{p.grade}</span>
        {range && <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>likely range {range}</span>}
      </div>
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        {p.evidenceSummary}. <span style={{ color: cov.colour, fontWeight: 600 }}>{cov.text}.</span>
      </p>

      <details style={{ marginTop: 10 }}>
        <summary style={{ cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>How this was worked out</summary>
        <div style={{ marginTop: 8, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '4px 6px 4px 0' }}>Evidence</th>
                <th style={{ padding: '4px 6px' }}>Scored</th>
                <th style={{ padding: '4px 0 4px 6px' }}>Weight</th>
              </tr>
            </thead>
            <tbody>
              {p.factors.map(f => (
                <tr key={f.key} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '5px 6px 5px 0' }}>
                    {f.label}
                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.74rem' }}>{f.detail}</span>
                  </td>
                  <td style={{ padding: '5px 6px', whiteSpace: 'nowrap' }}>{f.valuePct}%</td>
                  <td style={{ padding: '5px 0 5px 6px', whiteSpace: 'nowrap' }}>{Math.round(f.weight * 100)}%</td>
                </tr>
              ))}
              {p.adjustments.map(a => (
                <tr key={a.key} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '5px 6px 5px 0' }}>
                    {a.label}
                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.74rem' }}>{a.detail}</span>
                  </td>
                  <td colSpan={2} style={{ padding: '5px 0 5px 6px', whiteSpace: 'nowrap' }}>{a.points > 0 ? '+' : ''}{a.points} points</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ margin: '8px 0 0', fontSize: '0.74rem', color: 'var(--text-muted)' }}>Result: {p.percentage}% overall. {p.notes.join(' ')}</p>
        </div>
      </details>

      <p style={{ margin: '10px 0 0', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
        An estimate from your own results, not an official or teacher prediction.
      </p>
    </div>
  )
}
