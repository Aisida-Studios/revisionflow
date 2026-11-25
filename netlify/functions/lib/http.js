// netlify/functions/lib/http.js
// Shared HTTP plumbing for the Netlify functions (CommonJS, like every function in this folder).
//
// WHY: each function used to carry its own copy of respond(), CORS handling and JSON parsing. The copies had drifted: every
// one answered `Access-Control-Allow-Origin: *`, none limited the body size or checked the content type, and several echoed
// err.message to the caller. Everything below is the one place those decisions live.
'use strict'

class HttpError extends Error {
  // `message` is what the caller is told, so it must never contain internals. `code` is a stable machine-readable string.
  constructor(status, message, code, extra) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code || null
    this.extra = extra || null
  }
}

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  // API answers are per-user and must never sit in a shared cache or in the service worker.
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
}

// Origins allowed to call the API from a browser. The app and its API share an origin (Netlify rewrites /api/* to the
// function), so ordinary use needs no CORS at all; the list exists for previews and local development.
function allowedOrigins(env = process.env) {
  const list = new Set()
  for (const raw of [env.URL, env.DEPLOY_PRIME_URL, env.SITE_ORIGIN, 'https://www.revisionflow.co.uk', 'https://revisionflow.co.uk', 'https://revision-flow.netlify.app']) {
    if (raw) list.add(String(raw).replace(/\/+$/, ''))
  }
  for (const raw of String(env.ALLOWED_ORIGINS || '').split(',')) {
    const o = raw.trim().replace(/\/+$/, '')
    if (o) list.add(o)
  }
  // Local development only: Netlify sets NETLIFY_DEV=true for `netlify dev`.
  if (env.NETLIFY_DEV === 'true') { list.add('http://localhost:8888'); list.add('http://localhost:5173') }
  return list
}

function header(event, name) {
  const h = (event && event.headers) || {}
  const lower = name.toLowerCase()
  for (const k of Object.keys(h)) if (k.toLowerCase() === lower) return h[k]
  return undefined
}

function corsHeaders(event, methods = 'POST, OPTIONS') {
  const origin = header(event, 'origin')
  if (!origin || !allowedOrigins().has(origin)) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Firebase-AppCheck',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  }
}

function respond(statusCode, body, event, extraHeaders) {
  return {
    statusCode,
    headers: { ...JSON_HEADERS, ...corsHeaders(event), ...(extraHeaders || {}) },
    body: JSON.stringify(body),
  }
}

// Read and validate a JSON request body: size-limited, JSON content type, a plain object.
function parseJsonBody(event, { maxBytes = 32 * 1024, allowEmpty = true } = {}) {
  let raw = event.body
  if (raw == null || raw === '') {
    if (allowEmpty) return {}
    throw new HttpError(400, 'A JSON body is required.', 'bad_request')
  }
  if (event.isBase64Encoded) raw = Buffer.from(raw, 'base64').toString('utf8')
  if (Buffer.byteLength(raw, 'utf8') > maxBytes) throw new HttpError(413, 'Request body is too large.', 'payload_too_large')
  const type = String(header(event, 'content-type') || '').toLowerCase()
  if (!type.includes('application/json')) throw new HttpError(415, 'Content-Type must be application/json.', 'unsupported_media_type')
  let parsed
  try { parsed = JSON.parse(raw) } catch { throw new HttpError(400, 'Invalid JSON.', 'bad_json') }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new HttpError(400, 'The JSON body must be an object.', 'bad_request')
  return parsed
}

// Strip things that must never reach a log: bearer tokens, JWTs, e-mail addresses, Stripe keys, Firestore document paths (they
// contain user ids) and other long opaque ids (uids, Stripe object ids, push endpoints). Operational messages such as
// "NOT_FOUND" or "Missing or insufficient permissions" survive, which is all a log needs.
function scrub(text) {
  return String(text == null ? '' : text)
    .slice(0, 2000)                                  // bound the work first: error messages can be large
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [redacted]')
    .replace(/eyJ[A-Za-z0-9._-]{10,}/g, '[jwt]')
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[email]')
    .replace(/\b(sk|rk|pk|whsec)_(live|test)_[A-Za-z0-9]+/g, '[stripe-key]')
    .replace(/\/documents\/[^\s"')]+/g, '/documents/[path]')
    .replace(/\b(?=[A-Za-z0-9_-]*\d)(?=[A-Za-z0-9_-]*[A-Za-z])[A-Za-z0-9_-]{20,}\b/g, '[id]')
    .slice(0, 300)
}

// Wrap a handler: OPTIONS, method check, a uniform error shape, and logging that carries no personal data.
function route(name, handler, { methods = ['POST'] } = {}) {
  const allow = [...methods, 'OPTIONS'].join(', ')
  return async function wrapped(event, context) {
    const method = String(event.httpMethod || '').toUpperCase()
    if (method === 'OPTIONS') return { statusCode: 204, headers: { ...corsHeaders(event, allow), 'Cache-Control': 'no-store' }, body: '' }
    if (!methods.includes(method)) return respond(405, { error: 'Method not allowed.', code: 'method_not_allowed' }, event, { Allow: allow })
    try {
      return await handler(event, context)
    } catch (err) {
      if (err instanceof HttpError) {
        const headers = err.extra && err.extra.retryAfter ? { 'Retry-After': String(err.extra.retryAfter) } : undefined
        return respond(err.status, { error: err.message, ...(err.code ? { code: err.code } : {}), ...(err.extra && err.extra.body ? err.extra.body : {}) }, event, headers)
      }
      console.error(`[${name}] unhandled ${err && err.name ? err.name : 'error'}: ${scrub(err && err.message)}`)
      return respond(500, { error: 'Something went wrong. Please try again.', code: 'server_error' }, event)
    }
  }
}

module.exports = { HttpError, respond, corsHeaders, allowedOrigins, parseJsonBody, scrub, route, header }
