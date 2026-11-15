// src/components/RichText.jsx
// Shows AI-written or student-typed text as clean, formatted text: paragraphs, lists, headings, **bold**,
// *italic*, `code`, links and real maths symbols (x^2 -> x²). Everything is built as React elements and
// React escapes the text, so nothing in the text can inject markup. Pass greek only for AI maths text.
import React, { useMemo } from 'react'
import { formatMathSymbols } from '../utils/richText'

const CODE_STYLE = { background: 'var(--bg-hover)', padding: '1px 5px', borderRadius: 4, fontSize: '0.88em', fontFamily: 'monospace' }
// width 0 + min-width 100%: the box fills its container but its long lines do not count towards the container's minimum width, so a code block scrolls inside itself instead of widening a flex item or card.
const PRE_STYLE = { display: 'block', boxSizing: 'border-box', width: 0, minWidth: '100%', background: 'var(--bg-hover)', padding: '8px 10px', borderRadius: 8, fontSize: '0.85em', fontFamily: 'monospace', whiteSpace: 'pre', overflowX: 'auto' }
const STRONG_STYLE = { fontWeight: 700, color: 'var(--text-primary)' }
const LINK_STYLE = { color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 2 }

const isWord = ch => !!ch && /[A-Za-z0-9]/.test(ch)
const isSpace = ch => !ch || /\s/.test(ch)

function toText(v) {
  if (v == null || v === false) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'number') return String(v)
  if (Array.isArray(v)) return v.map(toText).join('\n')
  return ''
}

// Finds s[i..] = marker ... marker with non-space text just inside both markers. Returns { inner, end } or null.
function wrapped(s, i, marker) {
  const from = i + marker.length
  let j = s.indexOf(marker, from)
  while (j !== -1) {
    const inner = s.slice(from, j)
    if (inner && !/^\s/.test(inner) && !/\s$/.test(inner)) return { inner, end: j + marker.length }
    j = s.indexOf(marker, j + 1)
  }
  return null
}

// Finds *italic* starting at s[i]: the opening * must follow a non-word character and precede a non-space,
// the closing * must follow a non-space and precede a non-word character, so 2*3*4 and a*b*c are not italic.
function italic(s, i) {
  if (isWord(s[i - 1]) || s[i - 1] === '*' || isSpace(s[i + 1]) || s[i + 1] === '*') return null
  let j = s.indexOf('*', i + 1)
  while (j !== -1) {
    if (s[j - 1] !== '*' && s[j + 1] !== '*' && !isSpace(s[j - 1]) && !isWord(s[j + 1])) {
      return { inner: s.slice(i + 1, j), end: j + 1 }
    }
    j = s.indexOf('*', j + 1)
  }
  return null
}

function inline(s, kc, depth) {
  if (!s) return []
  if (depth > 6) return [s]
  const out = []
  let buf = ''
  let i = 0
  const flush = () => { if (buf) { out.push(buf); buf = '' } }
  const push = node => { flush(); out.push(node) }

  while (i < s.length) {
    const c = s[i]

    if (c === '\\' && /[*_`[\]()#]/.test(s.charAt(i + 1))) { buf += s[i + 1]; i += 2; continue }

    if (c === '`') {
      const j = s.indexOf('`', i + 1)
      if (j > i + 1) {
        push(<code key={kc.n++} style={CODE_STYLE}>{s.slice(i + 1, j)}</code>)
        i = j + 1
        continue
      }
      buf += c; i++
      continue
    }

    if (c === '*' && s[i + 1] === '*') {
      const triple = s[i + 2] === '*' ? wrapped(s, i, '***') : null
      if (triple) {
        push(<strong key={kc.n++} style={STRONG_STYLE}><em>{inline(triple.inner, kc, depth + 1)}</em></strong>)
        i = triple.end
        continue
      }
      const bold = wrapped(s, i, '**')
      if (bold) {
        push(<strong key={kc.n++} style={STRONG_STYLE}>{inline(bold.inner, kc, depth + 1)}</strong>)
        i = bold.end
        continue
      }
      // A ** with nothing to close it is a stray marker: drop it, unless it sits between letters or digits (2**3).
      if (isWord(s[i - 1]) && isWord(s[i + 2])) buf += '**'
      i += 2
      continue
    }

    if (c === '_' && s[i + 1] === '_' && !isWord(s[i - 1])) {
      const bold = wrapped(s, i, '__')
      if (bold && !isWord(s[bold.end])) {
        push(<strong key={kc.n++} style={STRONG_STYLE}>{inline(bold.inner, kc, depth + 1)}</strong>)
        i = bold.end
        continue
      }
    }

    if (c === '*') {
      const it = italic(s, i)
      if (it) {
        push(<em key={kc.n++}>{inline(it.inner, kc, depth + 1)}</em>)
        i = it.end
        continue
      }
    }

    if (c === '[') {
      const m = /^\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/.exec(s.slice(i))
      if (m) {
        push(<a key={kc.n++} href={m[2]} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>{inline(m[1], kc, depth + 1)}</a>)
        i += m[0].length
        continue
      }
    }

    if (c === 'h' && !isWord(s[i - 1]) && /^https?:\/\//.test(s.slice(i, i + 8))) {
      const m = /^https?:\/\/[^\s<>]+/.exec(s.slice(i))
      if (m) {
        let url = m[0]
        while (/[.,;:!?'")\]}]$/.test(url) && !(url.endsWith(')') && url.includes('('))) url = url.slice(0, -1)
        if (/^https?:\/\/[^/]+/.test(url)) {
          push(<a key={kc.n++} href={url} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>{url}</a>)
          i += url.length
          continue
        }
      }
    }

    buf += c
    i++
  }
  flush()
  return out
}

function renderLines(lines, kc) {
  const nodes = []
  lines.forEach((line, idx) => {
    if (idx > 0) nodes.push(<br key={kc.n++} />)
    inline(line, kc, 0).forEach(n => nodes.push(n))
  })
  return nodes
}

// ── blocks ───────────────────────────────────────────────────────────────────

const indentOf = ws => ws.replace(/\t/g, '    ').length

function parseBlocks(src) {
  const lines = src.replace(/\r\n?/g, '\n').split('\n')
  const blocks = []
  let para = null
  let items = null
  let code = null
  const flushPara = () => { if (para) { blocks.push({ t: 'p', lines: para }); para = null } }
  const flushList = () => { if (items) { blocks.push({ t: 'list', items }); items = null } }

  for (const raw of lines) {
    if (code) {
      if (/^\s*```/.test(raw)) { blocks.push({ t: 'code', text: code.join('\n') }); code = null } else code.push(raw)
      continue
    }
    if (/^\s*```/.test(raw)) { flushPara(); flushList(); code = []; continue }
    if (!raw.trim()) { flushPara(); flushList(); continue }

    const heading = /^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/.exec(raw)
    if (heading) { flushPara(); flushList(); blocks.push({ t: 'h', text: heading[1] }); continue }

    if (/^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/.test(raw)) { flushPara(); flushList(); blocks.push({ t: 'hr' }); continue }

    const bullet = /^(\s*)([-*•])\s+(.*)$/.exec(raw)
    const numbered = bullet ? null : /^(\s*)(\d{1,3})[.)]\s+(.*)$/.exec(raw)
    if (bullet || numbered) {
      flushPara()
      if (!items) items = []
      const m = bullet || numbered
      items.push({ indent: indentOf(m[1]), ordered: !!numbered, start: numbered ? Number(m[2]) : 0, text: m[3].trim() })
      continue
    }

    if (items && /^\s{2,}\S/.test(raw)) { items[items.length - 1].text += '\n' + raw.trim(); continue }

    flushList()
    if (!para) para = []
    para.push(raw.trim())
  }
  if (code) blocks.push({ t: 'code', text: code.join('\n') })
  flushPara()
  flushList()
  return blocks
}

function renderList(items, kc, nested) {
  const base = items[0].indent
  const groups = []
  for (let i = 0; i < items.length;) {
    let j = i + 1
    while (j < items.length && items[j].indent > base) j++
    groups.push({ item: items[i], kids: items.slice(i + 1, j) })
    i = j
  }
  const ordered = items[0].ordered
  const Tag = ordered ? 'ol' : 'ul'
  const start = ordered && items[0].start > 1 ? items[0].start : undefined
  return (
    <Tag key={kc.n++} start={start} style={{ margin: nested ? '0.15em 0 0' : '0 0 0.55em', paddingLeft: '1.3em' }}>
      {groups.map(g => (
        <li key={kc.n++} style={{ margin: '0.15em 0' }}>
          {renderLines(g.item.text.split('\n'), kc)}
          {g.kids.length ? renderList(g.kids, kc, true) : null}
        </li>
      ))}
    </Tag>
  )
}

function renderBlocks(blocks, kc) {
  return blocks.map((b, bi) => {
    const first = bi === 0
    const last = bi === blocks.length - 1
    const gap = last ? 0 : '0.55em'
    if (b.t === 'h') {
      return <p key={kc.n++} style={{ margin: (first ? '0' : '0.35em') + ' 0 ' + (last ? '0' : '0.25em'), fontWeight: 700, color: 'var(--text-primary)' }}>{inline(b.text, kc, 0)}</p>
    }
    if (b.t === 'hr') return <hr key={kc.n++} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.6em 0' }} />
    if (b.t === 'code') return <pre key={kc.n++} style={{ ...PRE_STYLE, margin: '0 0 ' + gap }}><code>{b.text}</code></pre>
    if (b.t === 'list') {
      const list = renderList(b.items, kc, false)
      return last ? React.cloneElement(list, { style: { ...list.props.style, margin: 0 } }) : list
    }
    return <p key={kc.n++} style={{ margin: '0 0 ' + gap }}>{renderLines(b.lines, kc)}</p>
  })
}

export default function RichText({ text, greek = false, style, className }) {
  const blocks = useMemo(() => parseBlocks(formatMathSymbols(toText(text), { greek })), [text, greek])
  if (!blocks.length) return null
  return (
    <div className={className} style={{ minWidth: 0, overflowWrap: 'anywhere', ...style }}>
      {renderBlocks(blocks, { n: 0 })}
    </div>
  )
}
