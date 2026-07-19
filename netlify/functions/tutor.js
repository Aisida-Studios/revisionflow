// netlify/functions/tutor.js
// CommonJS — netlify/functions/package.json sets "type":"commonjs"
// MISTRAL_API_KEY must be set in Netlify env vars (no VITE_ prefix, never in .env.local)
//
// Rate limiting uses Firestore (Firebase Admin SDK) so limits persist across
// cold starts and function instances. Free users: 150 AI calls/day.
// Pro/beta users: unlimited (isPro or betaUser field on user doc).

const MISTRAL_URL  = 'https://api.mistral.ai/v1/chat/completions'
const MAX_TOKENS   = 8192
const FREE_LIMIT   = 150   // requests per 24h for free users

// ── Firebase Admin — lazy singleton ──────────────────────────────────────────
let _db = null
async function getDb() {
  if (_db) return _db
  const admin = require('firebase-admin')
  if (!admin.apps.length) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')
    admin.initializeApp({ credential: admin.credential.cert(sa) })
  }
  _db = admin.firestore()
  return _db
}

// ── Firestore rate limiter ────────────────────────────────────────────────────
// Reads/writes users/{uid}/usage/aiCalls
// { date: "YYYY-MM-DD", count: N }
// Resets automatically when the date changes.
async function checkRateLimit(uid) {
  // No uid = unauthenticated call, allow through (will be blocked upstream)
  if (!uid) return { allowed: true, remaining: FREE_LIMIT }

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
      return { allowed: false, reason: 'Daily AI limit reached (' + FREE_LIMIT + '/day on free plan). Resets at midnight.' }
    }

    tx.update(ref, { count: data.count + 1 })
    return { allowed: true, remaining: FREE_LIMIT - (data.count + 1) }
  })

  return result
}

// ── Response helper ───────────────────────────────────────────────────────────
function respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify(body),
  }
}

const DEFAULT_SYSTEM = "You are RevisionFlow's AI tutor — an expert on UK GCSE, AS-Level and A-Level revision. AS-Level is a standalone qualification, separate from A-Level — keep their content and grading scale (A-E vs A*-E) distinct. You give specific, practical, encouraging advice tailored to UK students. Be concise but thorough. Use bullet points where helpful. Focus on actionable recommendations. Always reference specific free resources where relevant: Maths: Dr Frost Maths, 1stclassmaths, Corbettmaths, PMT. Sciences: Cognito, PMT, SaveMyExams, Primrose Kitten. Computer Science: Craig 'n' Dave, CS GCSE Guru, Seneca. English: Mr Bruff, SaveMyExams. All subjects: Seneca, PMT, SaveMyExams."

// ── Main handler ──────────────────────────────────────────────────────────────
module.exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' })

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch(e) {
    return respond(400, { error: 'Invalid JSON body' })
  }

  const { messages, systemPrompt, maxTokens, uid } = body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return respond(400, { error: 'messages array is required' })
  }

  // ── Rate limit check (Firestore-backed, survives cold starts) ────────────
  let rateCheck
  try {
    rateCheck = await checkRateLimit(uid || null)
  } catch(e) {
    // If Firestore is unreachable, fail open (don't block users) but log it
    console.error('[tutor] rate limit check failed:', e.message)
    rateCheck = { allowed: true, remaining: FREE_LIMIT }
  }

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

  const fullMessages = [{ role: 'system', content: systemPrompt || DEFAULT_SYSTEM }].concat(safeMessages)

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
    })

    if (!mistralRes.ok) {
      let errBody = {}
      try { errBody = await mistralRes.json() } catch(e) {}
      console.error('[tutor] Mistral error:', mistralRes.status, errBody)
      return respond(502, { error: 'AI request failed (' + mistralRes.status + '). Please try again.' })
    }

    const data = await mistralRes.json()
    const text = data?.choices?.[0]?.message?.content || ''

    if (!text) return respond(502, { error: 'AI returned an empty response.' })

    return respond(200, {
      text,
      provider:  'mistral',
      remaining: rateCheck.isPro ? null : rateCheck.remaining,
    })
  } catch(e) {
    console.error('[tutor] error:', e)
    return respond(503, { error: 'Could not reach the AI service. Check your connection.' })
  }
}
