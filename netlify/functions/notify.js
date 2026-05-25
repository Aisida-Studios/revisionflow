// netlify/functions/notify.js
// Sends Web Push notifications to one or many subscribers
// Called by: scheduled function (daily reminders) or manual triggers
// CommonJS — netlify/functions/package.json sets "type":"commonjs"

const webpush = require('web-push')

const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY
const ADMIN_EMAIL   = 'femiaisida1@gmail.com'

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

module.exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '' }
  }

  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' })

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return respond(500, { error: 'VAPID keys not configured in Netlify environment variables' })
  }

  webpush.setVapidDetails(`mailto:${ADMIN_EMAIL}`, VAPID_PUBLIC, VAPID_PRIVATE)

  let body
  try { body = JSON.parse(event.body || '{}') } catch(e) { return respond(400, { error: 'Invalid JSON' }) }

  const { subscription, subscriptions, title, message, url, callerEmail } = body

  // Auth check for batch sends (single subscription sends are from the server itself)
  if (subscriptions && callerEmail !== ADMIN_EMAIL) {
    return respond(403, { error: 'Forbidden' })
  }

  const payload = JSON.stringify({
    title: title || 'RevisionFlow 📚',
    body:  message || 'Time to revise!',
    icon:  '/favicon.svg',
    badge: '/favicon.svg',
    url:   url || '/',
    timestamp: Date.now(),
  })

  // Single subscription send
  if (subscription) {
    try {
      await webpush.sendNotification(subscription, payload)
      return respond(200, { ok: true })
    } catch(e) {
      if (e.statusCode === 410) return respond(200, { ok: true, expired: true })
      return respond(500, { error: e.message })
    }
  }

  // Batch send to multiple subscriptions
  if (subscriptions && Array.isArray(subscriptions)) {
    const results = { sent: 0, expired: 0, failed: 0 }
    await Promise.all(subscriptions.map(async sub => {
      try {
        await webpush.sendNotification(sub, payload)
        results.sent++
      } catch(e) {
        if (e.statusCode === 410) results.expired++
        else results.failed++
      }
    }))
    return respond(200, { ok: true, ...results })
  }

  return respond(400, { error: 'subscription or subscriptions required' })
}
