// netlify/functions/lib/rateLimit.js
// Fixed-window rate limiting for the Netlify functions (CommonJS).
//
// Counters live in the server-only Firestore collection `rateLimits` (clients can neither read nor write it: see
// firestore.rules), so the limit holds across function instances. The document id is a salted hash of "route|caller", so the
// collection holds no uid, no IP address and no e-mail: just a route name, a count and the window it belongs to. Each document
// carries `expiresAt`; set a Firestore TTL policy on that field (CHANGES-EXPLAINED.md, "Rate limits and the Firestore time-to-live
// setting") so old windows are cleaned up.
//
// If Firestore itself is unreachable the limiter falls back to per-instance memory counters instead of failing every request:
// weaker, but it keeps the app usable and still blunts a flood. A fallback is logged (without any caller detail).
'use strict'

const crypto = require('crypto')
const { HttpError, header } = require('./http')

const memory = new Map() // `${hash}` -> { windowStart, count }
const MEMORY_MAX_KEYS = 5000

function hashKey(route, id) {
  const salt = process.env.RATE_LIMIT_SALT || 'revisionflow'
  return crypto.createHash('sha256').update(`${salt}|${route}|${id}`).digest('hex').slice(0, 40)
}

// Netlify sets x-nf-client-connection-ip; x-forwarded-for is the fallback. Only used to derive a hash, never stored.
function clientIp(event) {
  const direct = header(event, 'x-nf-client-connection-ip')
  if (direct) return String(direct).trim()
  const fwd = String(header(event, 'x-forwarded-for') || '').split(',')[0].trim()
  return fwd || 'unknown'
}

function memoryConsume(hash, limit, windowMs, now) {
  if (memory.size > MEMORY_MAX_KEYS) {
    for (const [k, v] of memory) if (now - v.windowStart >= windowMs) memory.delete(k)
    if (memory.size > MEMORY_MAX_KEYS) memory.clear()
  }
  const cur = memory.get(hash)
  const windowStart = cur && now - cur.windowStart < windowMs ? cur.windowStart : now
  const count = (cur && windowStart === cur.windowStart ? cur.count : 0) + 1
  if (count > limit) return { allowed: false, retryAfter: Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000)) }
  memory.set(hash, { windowStart, count })
  return { allowed: true, remaining: limit - count }
}

// Count one request against `limit` per `windowSec` for this caller on this route.
// Returns { allowed, remaining?, retryAfter? }; use enforceRateLimit() to turn a refusal into a 429.
async function consumeRateLimit(db, { route, id, limit, windowSec, now = Date.now() }) {
  const windowMs = windowSec * 1000
  const hash = hashKey(route, id)
  try {
    const ref = db.collection('rateLimits').doc(hash)
    return await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref)
      const cur = snap.exists ? snap.data() : null
      const windowStart = cur && typeof cur.windowStart === 'number' && now - cur.windowStart < windowMs ? cur.windowStart : now
      const count = (cur && windowStart === cur.windowStart ? Number(cur.count) || 0 : 0) + 1
      if (count > limit) return { allowed: false, retryAfter: Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000)) }
      tx.set(ref, { route, count, windowStart, expiresAt: new Date(windowStart + windowMs + 60 * 60 * 1000) })
      return { allowed: true, remaining: limit - count }
    })
  } catch (err) {
    console.warn(`[rate-limit] store unavailable for ${route}; using in-memory counters (${err && err.code ? err.code : 'error'})`)
    return memoryConsume(hash, limit, windowMs, now)
  }
}

// `by` is 'uid' (pass uid) or 'ip' (the caller's address is read from the event). Throws HttpError 429 with Retry-After.
async function enforceRateLimit(db, event, { route, by = 'uid', uid, limit, windowSec, message }) {
  const id = by === 'ip' ? clientIp(event) : String(uid || '')
  if (!id) throw new HttpError(401, 'Sign in to continue.', 'unauthenticated')
  const result = await consumeRateLimit(db, { route, id, limit, windowSec })
  if (!result.allowed) {
    throw new HttpError(429, message || 'Too many requests. Please wait a moment and try again.', 'rate_limited', { retryAfter: result.retryAfter })
  }
  return result
}

function _resetMemoryForTests() { memory.clear() }

module.exports = { consumeRateLimit, enforceRateLimit, clientIp, hashKey, _resetMemoryForTests }
