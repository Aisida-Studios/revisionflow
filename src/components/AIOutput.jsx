// src/components/AIOutput.jsx
// Wraps all AI outputs with: markdown rendering, summarise button, collapse, copy
import { useState } from 'react'
import { chatWithAI } from '../utils/ai'

function renderMarkdown(text) {
  if (!text) return null
  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('#### ')) {
      elements.push(
        <div key={i} style={{ color:'var(--accent-light)', fontWeight:700, fontSize:'0.85rem', marginTop:'0.6rem', marginBottom:'0.1rem', textTransform:'uppercase', letterSpacing:'0.04em' }}>
          {inlineFormat(line.slice(5))}
        </div>
      )
      i++; continue
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} style={{ color:'var(--text-primary)', margin:'0.75rem 0 0.3rem', fontSize:'0.95rem', fontWeight:700 }}>
          {inlineFormat(line.slice(4))}
        </h4>
      )
    } else if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} style={{ color:'var(--text-primary)', margin:'0.75rem 0 0.35rem', fontSize:'1rem', fontWeight:700 }}>
          {inlineFormat(line.slice(3))}
        </h3>
      )
    } else if (line.startsWith('# ')) {
      elements.push(
        <h2 key={i} style={{ color:'var(--text-primary)', margin:'0.75rem 0 0.35rem', fontSize:'1.1rem', fontWeight:700 }}>
          {inlineFormat(line.slice(2))}
        </h2>
      )
    } else if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ')) {
      const items = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('• ') || lines[i].startsWith('* '))) {
        items.push(
          <li key={i} style={{ marginBottom:'0.25rem' }}>
            {inlineFormat(lines[i].slice(2))}
          </li>
        )
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin:'0.4rem 0', paddingLeft:'1.25rem', color:'var(--text-secondary)' }}>
          {items}
        </ul>
      )
      continue
    } else if (/^\d+\.\s/.test(line)) {
      const items = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(
          <li key={i} style={{ marginBottom:'0.25rem' }}>
            {inlineFormat(lines[i].replace(/^\d+\.\s/, ''))}
          </li>
        )
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ margin:'0.4rem 0', paddingLeft:'1.25rem', color:'var(--text-secondary)' }}>
          {items}
        </ol>
      )
      continue
    } else if (line.trim() === '') {
      elements.push(<br key={i} />)
    } else {
      // Lines that are entirely **bold** get rendered as a styled heading
      const boldLineMatch = line.match(/^\*\*(.+?)\*\*:?$/)
      if (boldLineMatch) {
        elements.push(
          <div key={i} style={{ fontWeight:700, color:'var(--text-primary)', marginTop:'0.6rem', marginBottom:'0.1rem', fontSize:'0.9rem' }}>
            {inlineFormat(boldLineMatch[1])}
          </div>
        )
      } else {
        elements.push(
          <p key={i} style={{ margin:'0.25rem 0', color:'var(--text-secondary)', lineHeight:1.65 }}>
            {inlineFormat(line)}
          </p>
        )
      }
    }
    i++
  }
  return elements
}

function inlineFormat(text) {
  const parts = []
  // Match **bold**, *italic*, `code`, and [text](url)
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((https?:\/\/[^\s)]+)\))/g
  let last = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    if (match[0].startsWith('**')) {
      parts.push(
        <strong key={match.index} style={{ color:'var(--text-primary)', fontWeight:700 }}>
          {match[2]}
        </strong>
      )
    } else if (match[0].startsWith('*')) {
      parts.push(<em key={match.index}>{match[3]}</em>)
    } else if (match[0].startsWith('`')) {
      parts.push(
        <code key={match.index} style={{ background:'var(--bg-surface)', padding:'1px 5px', borderRadius:3, fontSize:'0.85em', fontFamily:'monospace' }}>
          {match[4]}
        </code>
      )
    } else if (match[0].startsWith('[')) {
      parts.push(
        <a key={match.index} href={match[6]} target="_blank" rel="noopener noreferrer"
          style={{ color:'var(--accent-light)', textDecoration:'underline' }}>
          {match[5]}
        </a>
      )
    }
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length ? parts : text
}

export default function AIOutput({ text, onSummarise, loading = false, label = 'AI Response', compact = false }) {
  const [collapsed,      setCollapsed]      = useState(false)
  const [summary,        setSummary]        = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [showSummary,    setShowSummary]    = useState(false)
  const [copied,         setCopied]         = useState(false)

  async function handleSummarise() {
    if (summary) { setShowSummary(s => !s); return }
    setSummaryLoading(true)
    setShowSummary(true)
    try {
      // Use onSummarise prop if provided, otherwise fall back to built-in
      if (onSummarise) {
        const result = await onSummarise(text)
        setSummary(result)
      } else {
        const res = await chatWithAI(
          [{ role:'user', content:`Summarise this in 3 bullet points, max 15 words each. No preamble:\n\n${text}` }],
          {}
        )
        setSummary(res.text || res.error || 'Could not summarise.')
      }
    } catch(e) {
      setSummary('Could not generate summary.')
    }
    setSummaryLoading(false)
  }

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!text && !loading) return null

  // Compact mode: just markdown, no chrome
  if (compact) {
    return (
      <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
        {loading ? <div className="spinner" style={{width:16,height:16}}/> : renderMarkdown(text)}
      </div>
    )
  }

  return (
    <div style={{
      background:'var(--bg-surface)',
      border:'1px solid var(--border)',
      borderRadius:12,
      overflow:'hidden',
    }}>
      {/* Header bar */}
      <div style={{
        display:'flex', alignItems:'center', gap:'0.5rem',
        padding:'0.6rem 0.9rem',
        background:'var(--bg-card)',
        borderBottom:'1px solid var(--border)',
      }}>
        <span style={{ fontSize:'0.8rem', color:'var(--text-muted)', flex:1, fontWeight:600 }}>
          ✨ {label}
        </span>
        {text && !loading && (
          <>
            <button onClick={handleSummarise} style={iconBtn(showSummary ? 'var(--accent)' : undefined)} title="Summarise this">
              {showSummary ? '✦ Hide summary' : '✦ Summarise'}
            </button>
            <button onClick={handleCopy} style={iconBtn()} title="Copy to clipboard">
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
            <button onClick={() => setCollapsed(c => !c)} style={iconBtn()} title={collapsed ? 'Expand' : 'Minimise'}>
              {collapsed ? '⬇ Expand' : '⬆ Minimise'}
            </button>
          </>
        )}
      </div>

      {/* Summary panel */}
      {showSummary && (
        <div style={{
          padding:'0.75rem 1rem',
          background:'rgba(124,58,237,0.06)',
          borderBottom:'1px solid var(--border)',
        }}>
          <div style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--accent-light)', marginBottom:'0.4rem' }}>
            📋 Summary
          </div>
          {summaryLoading
            ? <div style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>Summarising…</div>
            : <div style={{ fontSize:'0.875rem', lineHeight:1.6 }}>{renderMarkdown(summary)}</div>
          }
        </div>
      )}

      {/* Main content */}
      {!collapsed && (
        <div style={{ padding:'0.9rem 1rem' }}>
          {loading
            ? <div style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>✨ Generating…</div>
            : <div style={{ fontSize:'0.9rem', lineHeight:1.7 }}>{renderMarkdown(text)}</div>
          }
        </div>
      )}
    </div>
  )
}

function iconBtn(bg) {
  return {
    background:   bg || 'transparent',
    color:        bg ? '#fff' : 'var(--text-muted)',
    border:       bg ? 'none' : '1px solid var(--border)',
    borderRadius: 6,
    padding:      '0.25rem 0.6rem',
    cursor:       'pointer',
    fontSize:     '0.75rem',
    fontWeight:   600,
    whiteSpace:   'nowrap',
    transition:   'background 0.15s',
  }
}
