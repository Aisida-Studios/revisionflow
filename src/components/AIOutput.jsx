// src/components/AIOutput.jsx
import React, { useState } from 'react'
import { callAI } from '../utils/ai'

const SUPERSCRIPT_MAP = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻','+':'⁺' }
const SUBSCRIPT_MAP   = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉' }
const GREEK_LETTERS = {
  pi: 'π', theta: 'θ', alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ',
  epsilon: 'ε', lambda: 'λ', mu: 'μ', sigma: 'σ', omega: 'ω', phi: 'φ', rho: 'ρ',
}

function toSuperscript(s) { return s.split('').map(c => SUPERSCRIPT_MAP[c] ?? c).join('') }
function toSubscript(s)   { return s.split('').map(c => SUBSCRIPT_MAP[c] ?? c).join('') }

// Converts plain-text maths notation (x^2, sqrt(x), <=, pi, ...) into real symbols. Applied
// per-segment (see formatMathSymbols below) so it never touches text inside backtick code
// spans — a Computer Science answer showing actual code with ^ or _ in it shouldn't get
// "corrected" into superscripts/subscripts.
function convertMathNotation(text) {
  let out = text

  // Square roots: sqrt(x+y) -> √(x+y), sqrt(x) -> √x, sqrtx / sqrt 9 -> √x / √9
  out = out.replace(/sqrt\(([^()]+)\)/gi, (_, inner) => '√(' + inner + ')')
  out = out.replace(/sqrt\s?([a-zA-Z0-9]+)/gi, (_, inner) => '√' + inner)

  // Exponents: x^2 -> x², x^(2+3) -> x⁽²⁺³⁾, x^-1 -> x⁻¹
  out = out.replace(/\^\(([^()]+)\)/g, (_, inner) => '⁽' + toSuperscript(inner) + '⁾')
  out = out.replace(/\^(-?\d+)/g, (_, digits) => toSuperscript(digits))

  // Simple chemistry-style subscripts after a letter — H_2O -> H₂O. Deliberately narrow (only
  // letter-then-underscore-then-digits) so it doesn't touch snake_case identifiers in code.
  out = out.replace(/([A-Za-z])_(\d+)(?![a-zA-Z_])/g, (_, letter, digits) => letter + toSubscript(digits))

  // Comparison / arithmetic
  out = out
    .replace(/<=/g, '≤')
    .replace(/>=/g, '≥')
    .replace(/(?<![!=])!=/g, '≠')
    .replace(/\+\/-|\+-/g, '±')
    .replace(/-->/g, '→')

  // Greek letters — whole word only
  for (const [word, symbol] of Object.entries(GREEK_LETTERS)) {
    out = out.replace(new RegExp('\\b' + word + '\\b', 'g'), symbol)
  }

  return out
}

// Splits on ```code blocks``` and `inline code`, converts maths notation in everything else,
// leaves code segments completely untouched, then reassembles in the original order.
function formatMathSymbols(text) {
  if (typeof text !== 'string' || !text) return text
  const segments = text.split(/(```[\s\S]*?```|`[^`]*`)/g)
  return segments.map(seg => (seg.startsWith('`') ? seg : convertMathNotation(seg))).join('')
}

// Converts **bold**, *italic*, `code`, and [text](url) inline
function inlineFormat(text) {
  if (typeof text !== 'string' || !text) return null
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
  if (typeof text !== 'string') {
    console.warn('[AIOutput] renderMarkdown got a non-string value:', text)
    text = Array.isArray(text) ? text.join('\n') : String(text)
  }
  text = formatMathSymbols(text)
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

export default function AIOutput({ text, label, compact, onSummarise }) {
  const [showSummary, setShowSummary] = useState(false)
  const [summary,     setSummary]     = useState('')
  const [sumLoading,  setSumLoading]  = useState(false)

  async function handleSummarise() {
    if (summary) { setShowSummary(s => !s); return }
    setSumLoading(true)
    setShowSummary(true)
    try {
      if (onSummarise) {
        const result = await onSummarise(text)
        setSummary(result || 'Could not summarise.')
      } else {
        const result = await callAI('Summarise this in 3 bullet points:\n\n' + text)
        setSummary(result.text || result.error || 'Could not summarise.')
      }
    } catch {
      setSummary('Could not summarise.')
    }
    setSumLoading(false)
  }

  if (!text) return null

  return (
    <div>
      {!compact && (
        <div style={{ marginBottom: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
        <div style={{ marginBottom: 12, padding: '10px 14px', background: 'var(--accent-bg)', borderRadius: 8, border: '1px solid var(--accent-pale)', fontSize: '0.83rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 }}>
            Summary
          </div>
          {sumLoading ? 'Summarising…' : renderMarkdown(summary)}
        </div>
      )}

      <div style={{ fontSize: compact ? '0.85rem' : '0.9rem', lineHeight: 1.7 }}>
        {renderMarkdown(text)}
      </div>
    </div>
  )
}
