// src/utils/richText.js
// Shared clean-up for AI output and student-typed text. Pure functions: no React, no DOM.
//   convertMathNotation(text, { greek })  maths notation and LaTeX-lite -> real symbols
//   formatMathSymbols(text, opts)         the same, but leaves code spans, code blocks and URLs untouched
//   autoFormatTyped(value, caret)         for text boxes: converts finished tokens only, keeps the caret in place
//   stripMarkers(text)                    plain text with **, __, backticks and leading # removed
// Greek-word conversion (pi, theta, ...) is for AI maths text only: pass { greek: true }. Never use it on notes.

const SUPERSCRIPT = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '\u2212': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', n: 'ⁿ', i: 'ⁱ',
}

const SUBSCRIPT = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '\u2212': '₋', '=': '₌', '(': '₍', ')': '₎',
  a: 'ₐ', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', o: 'ₒ', p: 'ₚ', r: 'ᵣ', s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', x: 'ₓ',
}

const VULGAR = {
  '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾', '1/5': '⅕', '2/5': '⅖', '3/5': '⅗', '4/5': '⅘',
  '1/6': '⅙', '5/6': '⅚', '1/7': '⅐', '1/8': '⅛', '3/8': '⅜', '5/8': '⅝', '7/8': '⅞', '1/9': '⅑',
}

const GREEK_WORDS = {
  pi: 'π', theta: 'θ', alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ',
  epsilon: 'ε', lambda: 'λ', mu: 'μ', sigma: 'σ', omega: 'ω', phi: 'φ', rho: 'ρ',
}
const GREEK_RE = /\b(pi|theta|alpha|beta|gamma|delta|epsilon|lambda|mu|sigma|omega|phi|rho)\b/g

const LATEX_SYMBOLS = {
  times: '×', div: '÷', cdot: '·', pm: '±', mp: '∓',
  leq: '≤', le: '≤', geq: '≥', ge: '≥', neq: '≠', ne: '≠', approx: '≈', equiv: '≡', sim: '∼', propto: '∝',
  infty: '∞', to: '→', rightarrow: '→', leftarrow: '←', leftrightarrow: '↔',
  Rightarrow: '⇒', Leftarrow: '⇐', Leftrightarrow: '⇔', implies: '⇒', iff: '⇔',
  therefore: '∴', because: '∵', angle: '∠', perp: '⊥', parallel: '∥',
  circ: '°', degree: '°', ldots: '…', dots: '…', cdots: '…',
  sum: 'Σ', int: '∫', partial: '∂', nabla: '∇', in: '∈', notin: '∉', cup: '∪', cap: '∩',
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε', zeta: 'ζ', eta: 'η',
  theta: 'θ', vartheta: 'ϑ', iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π',
  rho: 'ρ', sigma: 'σ', tau: 'τ', upsilon: 'υ', phi: 'φ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π', Sigma: 'Σ', Upsilon: 'Υ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
}
const LATEX_WRAPPERS = new Set(['text', 'textbf', 'textit', 'mathrm', 'mathbf', 'mathit', 'mathbb', 'mathcal', 'operatorname', 'boldsymbol', 'underline', 'emph'])
const LATEX_SIZING = new Set(['left', 'right', 'big', 'Big', 'bigg', 'Bigg', 'bigl', 'bigr', 'Bigl', 'Bigr', 'biggl', 'biggr'])
const LATEX_SPACES = new Set([',', ';', ':', ' ', 'quad', 'qquad'])
const LATEX_LITERALS = new Set(['%', '$', '&', '#', '_', '{', '}'])

// Everything inside these is left exactly as written: code blocks, code spans and web addresses.
const PROTECTED = /(```[\s\S]*?```|`[^`\n]*`|https?:\/\/[^\s<>"]+)/g

// ── small helpers ────────────────────────────────────────────────────────────

// Maps every character through the table, or returns null if any character has no symbol.
function mapAll(map, s) {
  let out = ''
  for (const ch of s) {
    const m = map[ch]
    if (!m) return null
    out += m
  }
  return out
}

// Reads a {...} group starting at s[at] (nested braces allowed). Returns { text, end } or null.
function readGroup(s, at) {
  if (s[at] !== '{') return null
  let depth = 0
  for (let j = at; j < s.length; j++) {
    const ch = s[j]
    if (ch === '\\') { j++; continue }
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return { text: s.slice(at + 1, j), end: j + 1 }
    }
  }
  return null
}

// A LaTeX argument: a {group} or a single letter/digit (\frac12, \sqrt2).
function readArg(s, at) {
  let k = at
  while (s[k] === ' ') k++
  if (s[k] === '{') return readGroup(s, k)
  if (k < s.length && /[A-Za-z0-9]/.test(s[k])) return { text: s[k], end: k + 1 }
  return null
}

// Index of the ")" that closes the "(" at s[open], or -1.
function matchParen(s, open) {
  let depth = 0
  for (let j = open; j < s.length; j++) {
    if (s[j] === '(') depth++
    else if (s[j] === ')') {
      depth--
      if (depth === 0) return j
    }
  }
  return -1
}

function fracText(a, b) {
  const top = a.trim()
  const bottom = b.trim()
  const vulgar = VULGAR[top + '/' + bottom]
  if (vulgar) return vulgar
  const neg = /^([-\u2212])\s*([A-Za-z0-9.]+)$/.exec(top)
  if (neg) return neg[1] + fracText(neg[2], bottom)
  const wrap = t => (/^[A-Za-z0-9.°π]+$/.test(t) ? t : '(' + t + ')')
  return wrap(top) + '/' + wrap(bottom)
}

function rootText(root, inner) {
  const body = /^[A-Za-z0-9.π]+$/.test(inner) ? inner : '(' + inner + ')'
  const r = root.trim()
  if (!r) return '√' + body
  if (r === '3') return '∛' + body
  if (r === '4') return '∜' + body
  const sup = mapAll(SUPERSCRIPT, r)
  return (sup !== null ? sup : '(' + r + ')') + '√' + body
}

// ── LaTeX-lite ───────────────────────────────────────────────────────────────

// Removes maths delimiters: \( \), \[ \], $$ $$ and short $...$ (only when the content does not start or end
// with a space and looks like maths, so "$5 and $6" and "$5-$6" are left alone).
function stripMathDelimiters(s) {
  let out = s
  if (out.indexOf('\\(') !== -1) out = out.replace(/\\\(([\s\S]*?)\\\)/g, (m, inner) => inner.trim())
  if (out.indexOf('\\[') !== -1) out = out.replace(/\\\[([\s\S]*?)\\\]/g, (m, inner) => inner.trim())
  if (out.indexOf('$') !== -1) {
    out = out.replace(/\$\$([\s\S]+?)\$\$/g, (m, inner) => inner.trim())
    out = out.replace(/\$([^\s$](?:[^$\n]{0,78}[^\s$])?)\$/g, (m, inner) => (/[A-Za-z\\^_{}=]/.test(inner) ? inner : m))
  }
  return out
}

function convertLatex(src, depth) {
  if (depth > 8) return src
  let out = ''
  let i = 0
  while (i < src.length) {
    const c = src[i]
    if (c !== '\\') { out += c; i++; continue }
    const letters = /^[A-Za-z]+/.exec(src.slice(i + 1, i + 25))
    const name = letters ? letters[0] : src.charAt(i + 1)
    if (!name) { out += c; i++; continue }
    const after = i + 1 + name.length

    if (name === 'frac' || name === 'dfrac' || name === 'tfrac') {
      const a = readArg(src, after)
      const b = a && readArg(src, a.end)
      if (a && b) {
        out += fracText(convertLatex(a.text, depth + 1), convertLatex(b.text, depth + 1))
        i = b.end
        continue
      }
    } else if (name === 'sqrt') {
      let k = after
      let root = ''
      if (src[k] === '[') {
        const close = src.indexOf(']', k)
        if (close > k) { root = src.slice(k + 1, close); k = close + 1 }
      }
      const a = readArg(src, k)
      if (a) {
        out += rootText(root, convertLatex(a.text, depth + 1))
        i = a.end
        continue
      }
    } else if (LATEX_WRAPPERS.has(name)) {
      const a = readArg(src, after)
      if (a) { out += convertLatex(a.text, depth + 1); i = a.end; continue }
    } else if (LATEX_SIZING.has(name)) {
      i = after
      if (src[i] === '.') i++
      continue
    } else if (name === '!') {
      i = after
      continue
    } else if (LATEX_SPACES.has(name)) {
      out += ' '
      i = after
      continue
    } else if (LATEX_LITERALS.has(name)) {
      out += name
      i = after
      continue
    } else if (Object.prototype.hasOwnProperty.call(LATEX_SYMBOLS, name)) {
      out += LATEX_SYMBOLS[name]
      i = after
      continue
    }
    // Unknown command (or a \frac with missing arguments): leave it exactly as written.
    out += src.slice(i, after)
    i = after
  }
  return out
}

// ── plain-text notation ──────────────────────────────────────────────────────

// sqrt(x+y) -> √(x+y); sqrt 9 / sqrt2 / sqrt x -> √9 / √2 / √x. "sqrt is" is left alone.
function convertSqrt(s) {
  if (!/sqrt/i.test(s)) return s
  const re = /\bsqrt(\s?\(|\s?\d+(?:\.\d+)?|\s?[A-Za-z](?![A-Za-z]))/gi
  let out = ''
  let last = 0
  let m
  while ((m = re.exec(s)) !== null) {
    if (m[1].endsWith('(')) {
      const open = m.index + m[0].length - 1
      const close = matchParen(s, open)
      if (close < 0) continue
      out += s.slice(last, m.index) + '√(' + s.slice(open + 1, close) + ')'
      last = close + 1
      re.lastIndex = last
    } else {
      out += s.slice(last, m.index) + '√' + m[1].trim()
      last = m.index + m[0].length
    }
  }
  return out + s.slice(last)
}

// Exponents (^2, ^-2, ^{10}, ^(n+1), ^n, ^\circ) and subscripts (H_2O, H_2SO_4, x_{10}).
// Anything that has no real superscript or subscript form is left readable, never half converted.
function convertScripts(src) {
  if (src.indexOf('^') === -1 && src.indexOf('_') === -1) return src
  let out = ''
  let i = 0
  while (i < src.length) {
    const c = src[i]

    if (c === '^') {
      const next = src[i + 1]
      if (next === '°') { out += '°'; i += 2; continue }
      if (next === '{') {
        const g = readGroup(src, i + 1)
        if (g) {
          const inner = g.text.trim()
          if (!inner) { i = g.end; continue }
          const sup = mapAll(SUPERSCRIPT, inner.replace(/\s+/g, ''))
          if (inner === '°') out += '°'
          else if (sup !== null) out += sup
          else out += /^[A-Za-z0-9]$/.test(inner) ? '^' + inner : '^(' + inner + ')'
          i = g.end
          continue
        }
      }
      if (next === '(') {
        const close = matchParen(src, i + 1)
        if (close > 0) {
          const sup = mapAll(SUPERSCRIPT, src.slice(i + 1, close + 1).replace(/\s+/g, ''))
          if (sup !== null) { out += sup; i = close + 1; continue }
        }
      }
      const dm = /^[-+\u2212]?\d+/.exec(src.slice(i + 1, i + 12))
      if (dm) { out += mapAll(SUPERSCRIPT, dm[0]); i += 1 + dm[0].length; continue }
      if ((next === 'n' || next === 'i') && !/[A-Za-z0-9]/.test(src.charAt(i + 2))) {
        out += SUPERSCRIPT[next]
        i += 2
        continue
      }
      out += c
      i++
      continue
    }

    if (c === '_') {
      if (src[i + 1] === '{') {
        const g = readGroup(src, i + 1)
        if (g) {
          const inner = g.text.trim()
          if (!inner) { i = g.end; continue }
          const sub = mapAll(SUBSCRIPT, inner.replace(/\s+/g, ''))
          if (sub !== null) out += sub
          else out += /^[A-Za-z0-9]$/.test(inner) ? '_' + inner : '_(' + inner + ')'
          i = g.end
          continue
        }
      }
      const dm = /^\d+/.exec(src.slice(i + 1, i + 8))
      if (dm && src[i + 1 + dm[0].length] !== '_') {
        // Only after a chemical-style or single-letter symbol (H_2O, CO_2, Ca(OH)_2, x_1), never snake_case words.
        const prev = /([A-Za-z]+|\))$/.exec(out)
        if (prev) {
          const run = prev[1]
          const before = out.charAt(out.length - run.length - 1)
          const ok = run === ')' || ((run.length === 1 || /^[A-Z]/.test(run)) && !/[A-Za-z_]/.test(before))
          if (ok) { out += mapAll(SUBSCRIPT, dm[0]); i += 1 + dm[0].length; continue }
        }
      }
      out += c
      i++
      continue
    }

    out += c
    i++
  }
  return out
}

function convertOperators(s) {
  return s
    .replace(/<=(?![>=])/g, '≤')
    .replace(/(^|[^=<])>=(?!=)/g, '$1≥')
    .replace(/(^|[^!=])!=(?!=)/g, '$1≠')
    .replace(/\+\/-|\+-/g, '±')
    .replace(/-->/g, '→')
    .replace(/(\s)->(?=\s)/g, '$1→')
    .replace(/(\d)([ \t]*)\*(?=[ \t]*\d)/g, '$1$2×')
}

// 1/2 -> ½ only when it stands alone: not inside dates (1/2/2024), longer numbers (12/25, 1/20, 0.5/2) or a/b/c.
function convertFractions(s) {
  return s.replace(/(^|[^\w./,])(\d)\/(\d)(?![\d/]|[.,]\d)/g, (m, pre, a, b) => {
    const v = VULGAR[a + '/' + b]
    return v ? pre + v : m
  })
}

// ── public API ───────────────────────────────────────────────────────────────

export function convertMathNotation(text, opts) {
  if (typeof text !== 'string' || !text) return text
  let out = stripMathDelimiters(text)
  if (out.indexOf('\\') !== -1) out = convertLatex(out, 0)
  out = convertSqrt(out)
  out = convertScripts(out)
  out = convertOperators(out)
  out = convertFractions(out)
  if (opts && opts.greek) out = out.replace(GREEK_RE, w => GREEK_WORDS[w])
  return out
}

export function formatMathSymbols(text, opts) {
  if (typeof text !== 'string' || !text) return text
  const parts = text.split(PROTECTED)
  for (let k = 0; k < parts.length; k += 2) parts[k] = convertMathNotation(parts[k], opts)
  return parts.join('')
}

// For text boxes. value is the box's text, caret is its caret position (or null on blur: convert everything).
// The run of non-space characters that ends exactly at the caret is the word being typed: it is left alone,
// so typing x^10 never becomes x¹0. It is converted as soon as a space, a new line or another word follows.
export function autoFormatTyped(value, caret) {
  if (typeof value !== 'string') return { value, caret }
  if (!Number.isInteger(caret) || caret < 0 || caret > value.length) {
    return { value: formatMathSymbols(value), caret: null }
  }
  const before = value.slice(0, caret)
  const after = value.slice(caret)
  const tail = (/\S+$/.exec(before) || [''])[0]
  const head = before.slice(0, before.length - tail.length)
  const newHead = formatMathSymbols(head)
  return { value: newHead + tail + formatMathSymbols(after), caret: newHead.length + tail.length }
}

// Plain text for toasts, titles and input defaults.
export function stripMarkers(text) {
  if (typeof text !== 'string') return ''
  return text
    .replace(/\*\*\*(?=\S)([^\n]*?\S)\*\*\*/g, '$1')
    .replace(/\*\*(?=\S)([^\n]*?\S)\*\*/g, '$1')
    .replace(/(^|[^A-Za-z0-9_])__(?=[^\s_])([^\n]*?[^\s_])__(?![A-Za-z0-9_])/g, '$1$2')
    .replace(/\*\*/g, (m, at, str) => (/[A-Za-z0-9]/.test(str.charAt(at - 1)) && /[A-Za-z0-9]/.test(str.charAt(at + 2)) ? m : ''))
    .replace(/`+/g, '')
    .replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm, '')
    .trim()
}
