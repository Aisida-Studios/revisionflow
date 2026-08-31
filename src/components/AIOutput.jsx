// src/components/AIOutput.jsx
import React, { useState } from 'react'

// Converts **bold**, *italic*, `code`, and [text](url) inline
function inlineFormat(text) {
  if (!text) return null
  const parts = []
  // Pattern: **bold** | *italic* | `code` | [text](url)
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((https?:\/\/[^\s)]+)\))/g
  let last = 0
  let m
  let key = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={key++}>{text.slice(last, m.index)}</span>)
    const full = m[0]
    if (full.startsWith('**'))      parts.push(<strong key={key++} style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m[2]}</strong>)
    else if (full.startsWith('*'))  parts.push(<em key={key++}>{m[3]}</em>)
    else if (full.startsWith('`'))  parts.push(<code key={key++} style={{ background: 'var(--bg-hover)', padding: '1px 5px', borderRadius: 4, fontSize: '0.88em', fontFamily: 'monospace' }}>{m[4]}</code>)
    else if (full.startsWith('['))  parts.push(<a key={key++} href={m[6]} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-light)' }}>{m[5]}</a>)
    last = m.index + full.length
  }
  if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>)
  return parts.length ? parts : text
}

function renderMarkdown(text) {
  if (!text) return null
  const elements = []
  const lines = text.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // Skip empty lines (add spacing)
    if (!trimmed) {
      elements.push(<div key={i} style={{ height: '0.4rem' }} />)
      i++
      continue
    }

    // H3: ### heading
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={i} style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.8rem 0 0.3rem' }}>
          {inlineFormat(trimmed.slice(4))}
        </h3>
      )
      i++; continue
    }

    // H2: ## heading
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={i} style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.9rem 0 0.3rem' }}>
          {inlineFormat(trimmed.slice(3))}
        </h3>
      )
      i++; continue
    }

    // Horizontal rule
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(trimmed)) {
      elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.6rem 0' }} />)
      i++; continue
    }

    // Bullet: - or * or •
    if (/^[-*•]\s/.test(trimmed)) {
      const bulletItems = []
      while (i < lines.length && /^[-*•]\s/.test(lines[i].trim())) {
        bulletItems.push(
          <li key={i} style={{ marginBottom: '0.2rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {inlineFormat(lines[i].trim().replace(/^[-*•]\s/, ''))}
          </li>
        )
        i++
      }
      elements.push(<ul key={`ul-${i}`} style={{ margin: '0.25rem 0', paddingLeft: '1.2rem' }}>{bulletItems}</ul>)
      continue
    }

    // Numbered list: 1. 2. etc
    if (/^\d+\.\s/.test(trimmed)) {
      const numItems = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        numItems.push(
          <li key={i} style={{ marginBottom: '0.2rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {inlineFormat(lines[i].trim().replace(/^\d+\.\s/, ''))}
          </li>
        )
        i++
      }
      elements.push(<ol key={`ol-${i}`} style={{ margin: '0.25rem 0', paddingLeft: '1.2rem' }}>{numItems}</ol>)
      continue
    }

    // Everything else — paragraph. inlineFormat handles ALL ** inside
    elements.push(
      <p key={i} style={{ margin: '0.2rem 0', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
        {inlineFormat(trimmed)}
      </p>
    )
    i++
  }

  return elements
}

export default function AIOutput({ text, label, compact }) {
  const [showSummary, setShowSummary] = useState(false)
  const [summary,     setSummary]     = useState('')
  const [sumLoading,  setSumLoading]  = useState(false)

  async function handleSummarise() {
    if (summary) { setShowSummary(s => !s); return }
    setSumLoading(true)
    setShowSummary(true)
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Summarise this in 3 bullet points:\n\n' + text }],
        }),
      })
      const data = await res.json()
      setSummary(data.text || 'Could not summarise.')
    } catch {
      setSummary('Could not summarise.')
    }
    setSumLoading(false)
  }

  if (!text) return null

  return (
    <div>
      <div style={{ fontSize: compact ? '0.85rem' : '0.9rem', lineHeight: 1.7 }}>
        {renderMarkdown(text)}
      </div>

      {!compact && (
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={handleSummarise}
            style={{
              fontSize: '0.75rem', fontWeight: 600,
              color: 'var(--accent-light)', background: 'var(--accent-bg)',
              border: '1px solid var(--accent-pale)', borderRadius: 6,
              padding: '3px 10px', cursor: 'pointer',
            }}
          >
            {showSummary ? 'Hide summary' : 'Summarise'}
          </button>
        </div>
      )}

      {showSummary && (
        <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--accent-bg)', borderRadius: 8, border: '1px solid var(--accent-pale)', fontSize: '0.83rem' }}>
          {sumLoading ? 'Summarising…' : renderMarkdown(summary)}
        </div>
      )}
    </div>
  )
}
