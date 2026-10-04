// src/components/illustrations/EmptyState.jsx
// ─────────────────────────────────────────────────────────────────────────────
//   <EmptyState
//     art="emptySessions"
//     title="No revision sessions yet"
//     body="Start your first study session to begin tracking your progress."
//     action={<button className="btn btn-primary">Start a session</button>} />
//
// Illustration + concise copy + one clear action. Builds on the app's existing .empty-state
// layout class, so it drops into the same places the old icon-and-text blocks occupy.
//
//  art     any scene name from registry.js (emptySessions, emptyMistakes, emptyPapers,
//          emptyAnalytics, emptyNotes, emptyFlashcards, emptyExams, emptyPlan — or any other
//          scene). Pass art={null} for copy-only.
//  size    'md' (default, ≤230px art) · 'sm' (≤150px, for cards/sidebars) · 'inline' (no padding)
//  as      heading element (default h4 — matches the blocks this replaces)
// The artwork is decorative (aria-hidden): the title and body carry the meaning.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import Illustration from './Illustration'

export default function EmptyState({
  art = 'emptySessions', title, body, action, size = 'md', as: Heading = 'h4', className = '', style, children,
}) {
  const width = size === 'sm' ? 160 : 240
  return (
    <div className={`empty-state rf-empty rf-empty--${size}${className ? ` ${className}` : ''}`} style={style}>
      {art && (
        <div className="rf-empty__art">
          <Illustration name={art} width={width} />
        </div>
      )}
      {title && <Heading className="rf-empty__title">{title}</Heading>}
      {body && <p className="rf-empty__body">{body}</p>}
      {children}
      {action && <div className="rf-empty__action">{action}</div>}
    </div>
  )
}
