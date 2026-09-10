// netlify/functions/tutor.js
// CommonJS — netlify/functions/package.json sets "type":"commonjs"
// MISTRAL_API_KEY must be set in Netlify env vars (no VITE_ prefix, never in .env.local)
//
// Rate limiting uses Firestore (Firebase Admin SDK) so limits persist across
// cold starts and function instances. Free users: 150 AI calls/day.
// Pro/beta users: unlimited (isPro or betaUser field on user doc).
//
// SECURITY MODEL:
//   Every request must include a valid Firebase ID token in the Authorization header.
//   The server verifies this token with Firebase Admin Auth (verifyUserToken below) and
//   uses ONLY the uid it decodes from that token — never a client-supplied uid field.
//   Previously uid was read straight from the request body, which meant anyone could
//   claim to be any user (stealing their Pro status or burning their daily allowance)
//   and, for the general request pool, omitting uid entirely bypassed rate limiting
//   altogether — an unauthenticated, unlimited proxy to the paid Mistral API. This
//   mirrors the verifyIdToken pattern already used correctly in admin.js/friends.js.
//
// RELIABILITY MODEL:
//   Netlify's synchronous function execution limit is a fixed 60 seconds — not configurable,
//   verified against docs.netlify.com/build/functions/configuration (Sept 2026). Previously
//   this function had no timeout of its own around the Mistral call, so a slow completion could
//   run until Netlify itself killed the function — which returns an HTML error page, not JSON,
//   and the frontend saw that as an opaque "non-JSON response (HTTP 502)". AI_REQUEST_TIMEOUT
//   below aborts the Mistral request well before that happens and returns a controlled JSON 504
//   instead. MAX_TOKENS was also cut from 8192 to 5000, and every individual AI feature in
//   src/utils/ai.js now asks for a maxTokens ceiling sized to what it actually needs (see that
//   file) — shorter requested completions are the biggest lever on how long a call can run.

const MISTRAL_URL        = 'https://api.mistral.ai/v1/chat/completions'
const MAX_TOKENS         = 5000    // hard server-side ceiling — enforced via Math.min() below no
                                    // matter what a client sends. Was 8192; see RELIABILITY MODEL.
const AI_REQUEST_TIMEOUT = 45000   // ms. Comfortably below Netlify's fixed 60s limit, leaving
                                    // headroom for the auth + Firestore work that happens first.
const FREE_LIMIT   = 150   // requests per 24h for free users

// ── Firebase Admin — lazy singleton ──────────────────────────────────────────
let _admin = null
async function getAdmin() {
  if (_admin) return _admin
  const admin = require('firebase-admin')
  if (!admin.apps.length) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')
    admin.initializeApp({ credential: admin.credential.cert(sa) })
  }
  _admin = admin
  return admin
}
async function getDb() {
  const admin = await getAdmin()
  return admin.firestore()
}

// ── Auth verification ─────────────────────────────────────────────────────────
// Extracts the Bearer token from the Authorization header and verifies it with
// Firebase Admin. Returns the decoded token (its .uid is the only uid this file trusts).
async function verifyUserToken(event) {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) throw new Error('No authorization token provided')
  const admin = await getAdmin()
  return admin.auth().verifyIdToken(token)
}

// ── Firestore rate limiter ────────────────────────────────────────────────────
// Reads/writes users/{uid}/usage/aiCalls
// { date: "YYYY-MM-DD", count: N }
// Resets automatically when the date changes.
async function checkRateLimit(uid) {
  // uid is verified upstream (verifyUserToken) before this is ever called, so this
  // branch shouldn't be reachable in practice — kept as a defensive fallback only.
  if (!uid) return { allowed: false, reason: 'Please sign in to use AI features.' }

  const db = await getDb()

  // Check if this user is Pro or beta — they get unlimited
  const userSnap = await db.collection('users').doc(uid).get()
  if (userSnap.exists) {
    const u = userSnap.data()
    if (u.isPro || u.betaUser) return { allowed: true, remaining: Infinity, isPro: true }
  }

  const today   = new Date().toISOString().slice(0, 10)  // "YYYY-MM-DD"
  const ref     = db.collection('users').doc(uid).collection('usage').doc('aiCalls')

  // Use a transaction so concurrent requests don't double-count
  const result = await db.runTransaction(async tx => {
    const snap = await tx.get(ref)
    const data = snap.exists ? snap.data() : null

    if (!data || data.date !== today) {
      // First call today — reset counter
      tx.set(ref, { date: today, count: 1 })
      return { allowed: true, remaining: FREE_LIMIT - 1 }
    }

    if (data.count >= FREE_LIMIT) {
      return { allowed: false, reason: "You've used today's AI help (" + FREE_LIMIT + '). More opens up tomorrow — Pro gets unlimited.' }
    }

    tx.update(ref, { count: data.count + 1 })
    return { allowed: true, remaining: FREE_LIMIT - (data.count + 1) }
  })

  return result
}

// ── Per-feature daily limiter ─────────────────────────────────────────────────
// Generic version of the image-scan limiter above, so chat and essay feedback can reuse
// the same logic instead of three near-identical copies. Each feature gets its own doc
// at users/{uid}/usage/{featureKey}, kept separate from the general usage/aiCalls
// counter, so using one feature heavily doesn't eat into another's allowance.
//
// Wording is deliberately soft — no "rate limit", "quota", or "throttled" anywhere the
// student sees it. It reads as a daily amount that tops back up, not a penalty.
async function checkFeatureLimit(uid, featureKey, freeLimit, proLimit, label) {
  if (!uid) return { allowed: false, reason: `Please sign in to use ${label}.` }

  const db = await getDb()
  const userSnap = await db.collection('users').doc(uid).get()
  const isPro = userSnap.exists && !!(userSnap.data().isPro || userSnap.data().betaUser)
  const limit = isPro ? proLimit : freeLimit

  const today = new Date().toISOString().slice(0, 10)
  const ref   = db.collection('users').doc(uid).collection('usage').doc(featureKey)

  return db.runTransaction(async tx => {
    const snap = await tx.get(ref)
    const data = snap.exists ? snap.data() : null

    if (!data || data.date !== today) {
      tx.set(ref, { date: today, count: 1 })
      return { allowed: true, remaining: limit - 1 }
    }

    if (data.count >= limit) {
      return {
        allowed: false,
        reason: `You've used today's ${label} (${limit}). More opens up tomorrow` + (isPro ? '.' : ' — Pro gets a higher daily amount.'),
      }
    }

    tx.update(ref, { count: data.count + 1 })
    return { allowed: true, remaining: limit - (data.count + 1) }
  })
}

const IMAGE_FREE_LIMIT = 5
const IMAGE_PRO_LIMIT  = 25
const checkImageRateLimit = (uid) => checkFeatureLimit(uid, 'imageScans', IMAGE_FREE_LIMIT, IMAGE_PRO_LIMIT, 'photo scans')

const CHAT_FREE_LIMIT = 30
const CHAT_PRO_LIMIT  = 150
const checkChatLimit = (uid) => checkFeatureLimit(uid, 'advisorChats', CHAT_FREE_LIMIT, CHAT_PRO_LIMIT, 'AI Advisor messages')

const ESSAY_FREE_LIMIT = 3
const ESSAY_PRO_LIMIT  = 15
const checkEssayLimit = (uid) => checkFeatureLimit(uid, 'essayFeedback', ESSAY_FREE_LIMIT, ESSAY_PRO_LIMIT, 'essay feedback requests')

// ── Response helper ───────────────────────────────────────────────────────────
function respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    body: JSON.stringify(body),
  }
}

const DEFAULT_SYSTEM = "You are RevisionFlow's AI tutor — an expert on UK GCSE, AS-Level and A-Level revision. AS-Level is a standalone qualification, separate from A-Level — keep their content and grading scale (A-E vs A*-E) distinct. You give specific, practical, encouraging advice tailored to UK students. Be concise but thorough. Use bullet points where helpful. Focus on actionable recommendations. Always reference specific free resources where relevant: Maths: Dr Frost Maths, 1stclassmaths, Corbettmaths, PMT. Sciences: Cognito, PMT, SaveMyExams, Primrose Kitten. Computer Science: Craig 'n' Dave, CS GCSE Guru, Seneca. English: Mr Bruff, SaveMyExams. All subjects: Seneca, PMT, SaveMyExams."

// ── Main handler ──────────────────────────────────────────────────────────────
module.exports.handler = async function(event) {
  const requestStart = Date.now()

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' })

  // ── Verify Firebase ID token before doing anything else ──────────────────
  // uid comes exclusively from here from this point on — never from the body.
  const authStart = Date.now()
  let decoded
  try {
    decoded = await verifyUserToken(event)
  } catch (e) {
    return respond(401, { error: 'Please sign in to use AI features.' })
  }
  const uid = decoded.uid
  const authMs = Date.now() - authStart

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch(e) {
    return respond(400, { error: 'Invalid JSON body' })
  }

  const { messages, systemPrompt, maxTokens, imageBase64, feature } = body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return respond(400, { error: 'messages array is required' })
  }

  // Images arrive pre-compressed by the client (PhotoCapture.jsx resizes to max 1600px
  // JPEG before encoding) — this is a defence-in-depth cap against a payload big enough
  // to blow Netlify's ~6MB synchronous function limit, not the primary size control.
  if (imageBase64 && imageBase64.length > 6_000_000) {
    return respond(400, { error: 'That image is too large. Try a lower-resolution photo.' })
  }

  // ── Daily allowance check (Firestore-backed, survives cold starts) ────────
  // Photo scans, AI Advisor chat, and essay feedback each have their own dedicated
  // allowance (checkImageRateLimit/checkChatLimit/checkEssayLimit) — those three are the
  // most expensive or most open-ended call types, so they're kept separate from the
  // general pool rather than being able to crowd out everything else. Anything else
  // (flashcards, exam questions, marking, topic notes, ...) shares the general pool.
  const allowanceStart = Date.now()
  let rateCheck
  try {
    if (imageBase64) rateCheck = await checkImageRateLimit(uid)
    else if (feature === 'advisorChat') rateCheck = await checkChatLimit(uid)
    else if (feature === 'essayFeedback') rateCheck = await checkEssayLimit(uid)
    else rateCheck = await checkRateLimit(uid)
  } catch(e) {
    // If Firestore is unreachable, fail open (don't block users) but log it
    console.error('[tutor] allowance check failed:', e.message)
    rateCheck = { allowed: true, remaining: FREE_LIMIT }
  }
  const allowanceMs = Date.now() - allowanceStart

  if (!rateCheck.allowed) {
    return respond(429, { error: rateCheck.reason })
  }

  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) {
    console.error('[tutor] MISTRAL_API_KEY not set in Netlify environment variables')
    return respond(500, { error: 'AI service not configured.' })
  }

  // Sanitise messages — only user/assistant roles, max 20k chars each, last 20
  const safeMessages = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role, content: String(m.content || '').slice(0, 20000) }))
    .slice(-20)

  // Vision: Mistral's vision-capable models (mistral-small-latest included, as of their
  // current docs) accept a multi-part content array on the SAME /v1/chat/completions
  // endpoint — [{type:'text',...}, {type:'image_url', image_url:{url:'data:...'}}] —
  // rather than a plain string. Only the last user message gets rewritten this way, and
  // only when an image was actually sent, so every existing text-only caller is
  // completely unaffected.
  if (imageBase64) {
    for (let i = safeMessages.length - 1; i >= 0; i--) {
      if (safeMessages[i].role === 'user') {
        safeMessages[i] = {
          role: 'user',
          content: [
            { type: 'text', text: safeMessages[i].content },
            { type: 'image_url', image_url: { url: imageBase64 } },
          ],
        }
        break
      }
    }
  }

  const fullMessages = [{ role: 'system', content: systemPrompt || DEFAULT_SYSTEM }].concat(safeMessages)

  const controller    = new AbortController()
  const timeoutId     = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT)
  const mistralStart  = Date.now()

  try {
    const mistralRes = await fetch(MISTRAL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model:      'mistral-small-latest',
        messages:   fullMessages,
        temperature: 0.7,
        max_tokens:  Math.min(maxTokens || MAX_TOKENS, MAX_TOKENS),
      }),
      signal: controller.signal,
    })

    if (!mistralRes.ok) {
      let errBody = {}
      try { errBody = await mistralRes.json() } catch(e) {}
      console.error('[tutor] Mistral error:', mistralRes.status, errBody)

      // Distinguish upstream failure modes instead of returning 502 for all of them — each
      // needs a different message, and 401/403 specifically means someone needs to go look
      // at the Netlify env vars, not that the student should retry.
      if (mistralRes.status === 401 || mistralRes.status === 403) {
        console.error('[tutor] Mistral auth/config error — check MISTRAL_API_KEY in Netlify env vars')
        return respond(500, { error: 'AI service is temporarily unavailable. Please try again shortly.' })
      }
      if (mistralRes.status === 429) {
        // Mistral's own rate limit — not the same thing as RevisionFlow's daily allowance
        // (which also returns 429, above, with its own reason text). Using a different status
        // here keeps the frontend from showing "you've used today's AI help" for the wrong reason.
        return respond(503, { error: 'The AI service is busy right now. Please try again in a moment.' })
      }
      if (mistralRes.status >= 500) {
        return respond(502, { error: 'The AI service had a problem on its end. Please try again.' })
      }
      return respond(502, { error: 'AI request failed. Please try again.' })
    }

    const data = await mistralRes.json()
    const text = data?.choices?.[0]?.message?.content || ''

    if (!text) return respond(502, { error: 'AI returned an empty response.' })

    console.log('[tutor] feature=' + (feature || 'general') + ' auth=' + authMs + 'ms allowance=' + allowanceMs + 'ms mistral=' + (Date.now() - mistralStart) + 'ms total=' + (Date.now() - requestStart) + 'ms')

    return respond(200, {
      text,
      provider:  'mistral',
      remaining: rateCheck.isPro ? null : rateCheck.remaining,
    })
  } catch(e) {
    if (e.name === 'AbortError') {
      console.error('[tutor] Mistral request timed out after ' + AI_REQUEST_TIMEOUT + 'ms — feature=' + (feature || 'general'))
      return respond(504, { error: 'The AI request took too long. Please try again.' })
    }
    console.error('[tutor] error:', e)
    return respond(503, { error: 'Could not reach the AI service. Check your connection.' })
  } finally {
    clearTimeout(timeoutId)
  }
}
