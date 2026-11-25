// netlify/functions/csp-report.js
// Collector for Content-Security-Policy violation reports (the `report-uri` of the Report-Only header in netlify.toml).
//
// WHY IT EXISTS: the enforced CSP still allows 'unsafe-inline' and 'unsafe-eval'. The Report-Only header carries a stricter
// candidate policy; browsers send a report here whenever the page would have broken under it, so the policy can be tightened
// from evidence instead of by trial and error, and only then enforced (CHANGES-EXPLAINED.md, "Content-Security-Policy (report-only)").
//
// WHAT IT DOES: reads a report, keeps three harmless facts from each (which directive, which ORIGIN was blocked, which page
// PATH) and writes one log line per report. It stores nothing and calls no other service.
//
// SECURITY MODEL
//   * Anyone can post here: browsers send reports without credentials, so there is nothing to authenticate. A report is
//     untrusted telemetry. No decision, no data and no other service depends on it; the worst a hostile caller can do is add
//     noise to the log, so the volume is limited and the body size is bounded.
//   * Nothing a reporter sends reaches the log as written. The log line is built only from allowlisted values: a directive
//     name (letters and hyphens), the blocked origin (never the path or query, which can hold tokens) or a keyword such as
//     "inline", and the page path (never the query or fragment, with long opaque ids replaced). The script sample, referrer,
//     original policy, source file and the caller's address are never read into the line, so a report cannot add lines
//     or put anything personal in the log.
//   * The limit is per function instance and in memory on purpose: a log-volume guard should not cost a Firestore write per
//     report. Netlify may run several instances, so it bounds noise rather than guaranteeing a total.
//
// CommonJS: netlify/functions/package.json sets "type":"commonjs"
'use strict'

const { route, scrub, header, HttpError } = require('./lib/http')
const { clientIp, hashKey } = require('./lib/rateLimit')

const MAX_BODY_BYTES = 8 * 1024
const MAX_ENTRIES = 5                  // reports read from one request (the Reporting API can batch several)
const WINDOW_MS = 60 * 1000
const LIMIT_PER_WINDOW = 30            // per caller, per instance
const MAX_KEYS = 2000
// application/csp-report is what `report-uri` sends; application/reports+json is the Reporting API; some browsers send plain JSON.
const BODY_TYPES = ['application/csp-report', 'application/reports+json', 'application/json']
const KEYWORDS = new Set(['inline', 'eval', 'data', 'blob', 'self', 'wasm-eval', 'trusted-types-policy', 'trusted-types-sink'])

const hits = new Map() // hashed caller -> { windowStart, count }

function withinLimit(key, now) {
  if (hits.size > MAX_KEYS) {
    for (const [k, v] of hits) if (now - v.windowStart >= WINDOW_MS) hits.delete(k)
    if (hits.size > MAX_KEYS) hits.clear()
  }
  const cur = hits.get(key)
  const windowStart = cur && now - cur.windowStart < WINDOW_MS ? cur.windowStart : now
  const count = (cur && windowStart === cur.windowStart ? cur.count : 0) + 1
  if (count > LIMIT_PER_WINDOW) return { allowed: false, retryAfter: Math.max(1, Math.ceil((windowStart + WINDOW_MS - now) / 1000)) }
  hits.set(key, { windowStart, count })
  return { allowed: true }
}

function readBody(event) {
  let raw = event.body
  if (raw == null || raw === '') throw new HttpError(400, 'A report body is required.', 'bad_request')
  // Netlify base64-encodes bodies whose content type it does not treat as text, and application/csp-report is one of them.
  if (event.isBase64Encoded) {
    if (String(raw).length > Math.ceil((MAX_BODY_BYTES * 4) / 3) + 4) throw new HttpError(413, 'Report is too large.', 'payload_too_large')
    raw = Buffer.from(raw, 'base64').toString('utf8')
  }
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) throw new HttpError(413, 'Report is too large.', 'payload_too_large')
  const type = String(header(event, 'content-type') || '').toLowerCase()
  if (!BODY_TYPES.some((t) => type.includes(t))) throw new HttpError(415, 'Unsupported content type.', 'unsupported_media_type')
  try { return JSON.parse(raw) } catch { throw new HttpError(400, 'Invalid JSON.', 'bad_json') }
}

// Each of these returns a short, safe value whatever it is given.
function directiveOf(v) {
  const first = String(v == null ? '' : v).trim().split(/\s+/)[0]
  return /^[a-z-]{1,40}$/.test(first) ? first : 'unknown'
}
function blockedOf(v) {
  const s = String(v == null ? '' : v).trim()
  if (!s) return 'unknown'
  if (KEYWORDS.has(s)) return s
  try {
    const u = new URL(s)
    // An http(s) address is reduced to its origin; any other scheme (javascript:, data:, ...) is reduced to the scheme alone.
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.origin.slice(0, 120) : u.protocol.replace(':', '').slice(0, 20)
  } catch { return 'invalid' }
}
function pathOf(v) {
  try { return scrub(new URL(String(v)).pathname).slice(0, 100) || '/' } catch { return 'unknown' }
}
function dispositionOf(v) { return v === 'enforce' || v === 'report' ? v : 'unknown' }

function describe(r) {
  const pick = (...keys) => { for (const k of keys) if (r[k] != null && r[k] !== '') return r[k]; return undefined }
  return {
    directive: directiveOf(pick('effective-directive', 'effectiveDirective', 'violated-directive', 'violatedDirective')),
    blocked: blockedOf(pick('blocked-uri', 'blockedURL', 'blockedUri')),
    doc: pathOf(pick('document-uri', 'documentURL', 'documentUri')),
    disposition: dispositionOf(pick('disposition')),
  }
}

// The legacy format is { "csp-report": {...} }; the Reporting API sends an array of { type, body } (or one such object).
function summarise(parsed) {
  const out = []
  const add = (r) => { if (out.length < MAX_ENTRIES && r && typeof r === 'object' && !Array.isArray(r)) out.push(describe(r)) }
  if (Array.isArray(parsed)) {
    for (const item of parsed.slice(0, 20)) if (item && typeof item === 'object' && item.type === 'csp-violation') add(item.body)
  } else if (parsed && typeof parsed === 'object') {
    if (parsed['csp-report'] && typeof parsed['csp-report'] === 'object') add(parsed['csp-report'])
    else if (parsed.type === 'csp-violation') add(parsed.body)
  }
  return out
}

const handler = route('csp-report', async (event) => {
  const limit = withinLimit(hashKey('csp-report', clientIp(event)), Date.now())
  if (!limit.allowed) throw new HttpError(429, 'Too many reports.', 'rate_limited', { retryAfter: limit.retryAfter })
  for (const r of summarise(readBody(event))) {
    console.log(`[csp-report] ${r.disposition} ${r.directive} blocked=${r.blocked} doc=${r.doc}`)
  }
  return { statusCode: 204, headers: { 'Cache-Control': 'no-store' }, body: '' }
})

module.exports = {
  handler,
  _internals: { summarise, describe, directiveOf, blockedOf, pathOf, withinLimit, hits, LIMIT_PER_WINDOW, MAX_ENTRIES, MAX_BODY_BYTES },
}
