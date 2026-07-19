// netlify/functions/ai.js
// CommonJS format — works regardless of package.json "type" setting
// MISTRAL_API_KEY must be set in Netlify env vars (no VITE_ prefix)

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions'
const MAX_TOKENS  = 8192
const DAILY_LIMIT = 150

const rateLimiter = new Map()

function checkRateLimit(uid) {
  if (!uid) return { allowed: true, remaining: DAILY_LIMIT }
  const now   = Date.now()
  const entry = rateLimiter.get(uid)
  if (!entry || now > entry.resetAt) {
    rateLimiter.set(uid, { count: 1, resetAt: now + 86400000 })
    return { allowed: true, remaining: DAILY_LIMIT - 1 }
  }
  if (entry.count >= DAILY_LIMIT) {
    const resetIn = Math.ceil((entry.resetAt - now) / 60000)
    return { allowed: false, reason: 'Daily AI limit reached. Resets in ' + resetIn + ' minutes.' }
  }
  entry.count++
  return { allowed: true, remaining: DAILY_LIMIT - entry.count }
}

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

const DEFAULT_SYSTEM = 'You are RevisionFlow\'s AI tutor — an expert on UK GCSE, AS-Level and A-Level revision. AS-Level is a standalone qualification, separate from A-Level. You give specific, practical, encouraging advice tailored to UK students. Be concise but thorough. Use bullet points where helpful.'

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

  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed' })
  }

  var body
  try {
    body = JSON.parse(event.body || '{}')
  } catch (e) {
    return respond(400, { error: 'Invalid JSON body' })
  }

  var messages    = body.messages
  var systemPrompt = body.systemPrompt
  var maxTokens   = body.maxTokens
  var uid         = body.uid

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return respond(400, { error: 'messages array is required' })
  }

  var rateCheck = checkRateLimit(uid || null)
  if (!rateCheck.allowed) {
    return respond(429, { error: rateCheck.reason })
  }

  var apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) {
    console.error('[AI proxy] MISTRAL_API_KEY not set')
    return respond(500, { error: 'AI service not configured. Set MISTRAL_API_KEY in Netlify environment variables.' })
  }

  var safeMessages = messages
    .filter(function(m) { return m.role === 'user' || m.role === 'assistant' })
    .map(function(m) { return { role: m.role, content: String(m.content || '').slice(0, 20000) } })
    .slice(-20)

  var fullMessages = [{ role: 'system', content: systemPrompt || DEFAULT_SYSTEM }].concat(safeMessages)

  try {
    var mistralRes = await fetch(MISTRAL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: Math.min(maxTokens || MAX_TOKENS, MAX_TOKENS),
      }),
    })

    if (!mistralRes.ok) {
      var errBody = {}
      try { errBody = await mistralRes.json() } catch(e) {}
      console.error('[AI proxy] Mistral error:', mistralRes.status, errBody)
      return respond(502, { error: 'AI request failed (' + mistralRes.status + '). Please try again.' })
    }

    var data = await mistralRes.json()
    var text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || ''

    if (!text) return respond(502, { error: 'AI returned an empty response.' })

    return respond(200, { text: text, provider: 'mistral', remaining: rateCheck.remaining })
  } catch (e) {
    console.error('[AI proxy] error:', e)
    return respond(503, { error: 'Could not reach the AI service. Check your connection.' })
  }
}
