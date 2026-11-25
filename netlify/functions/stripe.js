// netlify/functions/stripe.js
// CommonJS - netlify/functions/package.json has "type":"commonjs"
//
// Two entry points on one URL:
//   POST /api/stripe  { action: 'create-portal' | 'create-checkout', plan }   (signed-in student)  -> { url }
//   POST /api/stripe  (Stripe webhook, identified by the stripe-signature header)
//
// SECURITY MODEL
//   * Student actions: the uid is ONLY the one in the verified Firebase ID token. Nothing in the body says who is calling.
//   * Webhook: authenticated by Stripe's signature over the RAW body (Netlify may base64-encode it, which is undone first).
//     Pro is granted ONLY from a subscription that this server fetched from Stripe itself - never from fields in the event
//     payload, which may be old, and never from anything the browser sent.
//
// WHY EVENTS ARE NOT APPLIED AS RECEIVED
//   Stripe delivers events at least once, retries on any non-2xx, and does not guarantee order. Applying each payload as it
//   arrives meant a late customer.subscription.updated (status "active") could switch Pro back on AFTER the subscription had
//   been cancelled, and a stale "deleted" event for an old subscription could switch it off for a student who had re-subscribed.
//   So every subscription/invoice event only says "subscription X changed": the handler re-reads X from Stripe and writes the
//   current state. Re-processing the same event, or processing events in any order, ends in the same place.
//   Each event id is also recorded once in the server-only `stripeEvents` collection (state processing/done/failed), so a
//   duplicate delivery is acknowledged without work, and an event that failed is retried (Stripe retries on our 500).
//
//   "incomplete" means the first payment is still being confirmed: isPro is left exactly as it is until Stripe reports a final
//   state. A test-mode event sent to a live-mode server (or the reverse) is acknowledged and ignored.
//
// Required Netlify env vars:
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_MONTHLY_PRICE_ID, STRIPE_ANNUAL_PRICE_ID,
//   FIREBASE_SERVICE_ACCOUNT, SITE_URL (https://www.revisionflow.co.uk)
'use strict'

const { route, parseJsonBody, respond, HttpError, header } = require('./lib/http')
const { getAdmin, verifyUser, enforceAppCheck } = require('./lib/auth')
const { enforceRateLimit } = require('./lib/rateLimit')

const UID_RE = /^[A-Za-z0-9_-]{1,128}$/
const PLANS = ['monthly', 'annual']
const ACTIVE = ['active', 'trialing']
const PAYMENT_PROBLEM = ['past_due', 'unpaid']
const PROCESSING_LEASE_MS = 2 * 60 * 1000          // another delivery of the same event may be mid-flight for this long
const EVENT_RECORD_TTL_MS = 30 * 24 * 60 * 60 * 1000

let _stripe = null
function getStripe() {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new HttpError(503, 'Payments are not available right now.', 'not_configured')
  _stripe = require('stripe')(key)
  return _stripe
}

const siteUrl = () => process.env.SITE_URL || 'https://www.revisionflow.co.uk'

// ── Webhook ──────────────────────────────────────────────────────────────────
const periodEndOf = (sub) => (typeof sub.current_period_end === 'number' ? sub.current_period_end : sub.items && sub.items.data && sub.items.data[0] && sub.items.data[0].current_period_end)

// The plan comes from the price actually being billed (a change made in the Stripe billing portal does not update the
// subscription metadata, so metadata alone goes stale); metadata is only the fallback.
function planOf(sub) {
  const priceId = sub && sub.items && sub.items.data && sub.items.data[0] && sub.items.data[0].price && sub.items.data[0].price.id
  if (priceId && process.env.STRIPE_ANNUAL_PRICE_ID && priceId === process.env.STRIPE_ANNUAL_PRICE_ID) return 'annual'
  if (priceId && process.env.STRIPE_MONTHLY_PRICE_ID && priceId === process.env.STRIPE_MONTHLY_PRICE_ID) return 'monthly'
  return sub && sub.metadata && sub.metadata.plan === 'annual' ? 'annual' : 'monthly'
}

async function uidForSubscription(stripe, sub) {
  let uid = sub.metadata && sub.metadata.firebaseUid
  if (!uid && sub.customer) {
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
    const customer = await stripe.customers.retrieve(customerId)
    if (customer && !customer.deleted) uid = customer.metadata && customer.metadata.firebaseUid
  }
  return typeof uid === 'string' && UID_RE.test(uid) ? uid : null
}

// Read subscription `subId` from Stripe and write what is true NOW to the student's document.
// Returns a short label (used only by tests and logs).
async function syncSubscription(db, admin, stripe, subId) {
  let sub
  try {
    sub = await stripe.subscriptions.retrieve(subId)
  } catch (err) {
    // Not in this Stripe mode (for example a test id against live keys): nothing to apply, and retrying can never help.
    if (err && err.code === 'resource_missing') return 'subscription_missing'
    throw err
  }
  const uid = await uidForSubscription(stripe, sub)
  if (!uid) return 'no_uid'

  const FieldValue = admin.firestore.FieldValue
  const userRef = db.collection('users').doc(uid)
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef)
    if (!snap.exists) return 'no_user'                       // account deleted: acknowledge, do not make Stripe retry for days
    const user = snap.data()
    const status = sub.status
    if (status === 'incomplete') return 'pending'            // payment still being confirmed: leave isPro as it is
    const currentId = user.stripeSubId || null
    const periodEnd = periodEndOf(sub)

    if (ACTIVE.includes(status)) {
      const patch = {
        isPro: true,
        stripeSubId: sub.id,
        stripeSubStatus: status,
        stripePlan: planOf(sub),
        stripePaymentFailed: false,
      }
      if (typeof periodEnd === 'number') patch.stripeCurrentPeriodEnd = periodEnd
      if (user.isPro !== true || currentId !== sub.id || !user.proActivatedAt) patch.proActivatedAt = FieldValue.serverTimestamp()
      tx.update(userRef, patch)
      return 'active'
    }

    // Ended / unpaid / past due: only the student's CURRENT subscription may switch Pro off. An old, cancelled subscription
    // that Stripe reports late must not cancel a newer one.
    if (currentId && currentId !== sub.id) return 'stale'
    const patch = {
      isPro: false,
      stripeSubStatus: status,
      stripePlan: planOf(sub),
      stripePaymentFailed: PAYMENT_PROBLEM.includes(status),
    }
    if (typeof periodEnd === 'number') patch.stripeCurrentPeriodEnd = periodEnd
    if (status === 'canceled') patch.stripeSubId = null
    tx.update(userRef, patch)
    return 'inactive'
  })
}

const subscriptionIdOf = (obj) => (obj && (typeof obj.subscription === 'string' ? obj.subscription : obj.subscription && obj.subscription.id)) || null

async function processEvent(db, admin, stripe, event) {
  const obj = event.data && event.data.object
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      return obj && obj.id ? syncSubscription(db, admin, stripe, obj.id) : 'ignored'
    case 'invoice.payment_failed':
    case 'invoice.payment_succeeded': {
      const subId = subscriptionIdOf(obj)
      return subId ? syncSubscription(db, admin, stripe, subId) : 'ignored'
    }
    default:
      return 'ignored'
  }
}

// Record the event id once. 'process' = go ahead, 'done' = already handled, 'busy' = another delivery is working on it.
async function claimEvent(db, event) {
  const ref = db.collection('stripeEvents').doc(event.id)
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const now = Date.now()
    if (!snap.exists) {
      tx.create(ref, { type: event.type, created: event.created || null, state: 'processing', claimedAt: now, attempts: 1, expiresAt: new Date(now + EVENT_RECORD_TTL_MS) })
      return 'process'
    }
    const prev = snap.data()
    if (prev.state === 'done') return 'done'
    if (prev.state === 'processing' && now - (prev.claimedAt || 0) < PROCESSING_LEASE_MS) return 'busy'
    tx.update(ref, { state: 'processing', claimedAt: now, attempts: (prev.attempts || 1) + 1 })
    return 'process'
  })
}

async function handleWebhook(event) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) { console.error('[stripe webhook] STRIPE_WEBHOOK_SECRET is not set'); return respond(503, { error: 'Webhook is not configured.' }, event) }
  const stripe = getStripe()

  let stripeEvent
  try {
    // Netlify may base64-encode the body; the signature is over the exact original bytes.
    const raw = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : (event.body || '')
    stripeEvent = stripe.webhooks.constructEvent(raw, header(event, 'stripe-signature'), secret)
  } catch {
    // Deliberately says nothing about WHY it failed (and never echoes the error text back).
    console.error('[stripe webhook] signature verification failed')
    return respond(400, { error: 'Invalid signature.' }, event)
  }

  // A test-mode event must never change live data (or the reverse).
  const key = process.env.STRIPE_SECRET_KEY || ''
  if ((/^(sk|rk)_live_/.test(key) && stripeEvent.livemode === false) || (/^(sk|rk)_test_/.test(key) && stripeEvent.livemode === true)) {
    console.warn('[stripe webhook] ignoring an event from the other Stripe mode')
    return respond(200, { received: true, ignored: 'mode_mismatch' }, event)
  }

  const admin = getAdmin()
  const db = admin.firestore()
  const claim = await claimEvent(db, stripeEvent)
  if (claim === 'done') return respond(200, { received: true, duplicate: true }, event)
  if (claim === 'busy') return respond(409, { error: 'Event is already being processed.' }, event)

  const ref = db.collection('stripeEvents').doc(stripeEvent.id)
  try {
    const outcome = await processEvent(db, admin, stripe, stripeEvent)
    await ref.set({ state: 'done', processedAt: admin.firestore.FieldValue.serverTimestamp(), outcome }, { merge: true })
    console.log(`[stripe webhook] ${stripeEvent.type} -> ${outcome}`)
    return respond(200, { received: true }, event)
  } catch (err) {
    console.error(`[stripe webhook] ${stripeEvent.type} failed (${err && err.type ? err.type : err && err.code ? err.code : 'error'})`)
    await ref.set({ state: 'failed', failedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true }).catch(() => {})
    return respond(500, { error: 'Webhook processing failed.' }, event)   // Stripe retries
  }
}

// ── Student actions ──────────────────────────────────────────────────────────
async function handleApi(event) {
  await enforceAppCheck(event)
  const decoded = await verifyUser(event)
  const uid = decoded.uid
  const body = parseJsonBody(event, { maxBytes: 2048, allowEmpty: false })
  const action = String(body.action || '')
  const admin = getAdmin()
  const db = admin.firestore()

  if (action !== 'create-portal' && action !== 'create-checkout') throw new HttpError(400, 'Unknown action.', 'unknown_action')
  await enforceRateLimit(db, event, { route: 'stripe.session', uid, limit: 10, windowSec: 3600, message: 'Too many attempts. Please wait a few minutes.' })
  const stripe = getStripe()
  const userRef = db.collection('users').doc(uid)
  const userSnap = await userRef.get()
  if (!userSnap.exists) throw new HttpError(400, 'Account not found.', 'bad_request')
  const user = userSnap.data()

  if (action === 'create-portal') {
    if (!user.stripeCustomerId) throw new HttpError(400, 'No Stripe customer found. Please contact support.', 'no_customer')
    const session = await stripe.billingPortal.sessions.create({ customer: user.stripeCustomerId, return_url: siteUrl() + '/profile' })
    return respond(200, { url: session.url }, event)
  }

  // create-checkout
  const plan = body.plan
  if (!PLANS.includes(plan)) throw new HttpError(400, 'Choose a monthly or annual plan.', 'bad_request')
  const priceId = plan === 'annual' ? process.env.STRIPE_ANNUAL_PRICE_ID : process.env.STRIPE_MONTHLY_PRICE_ID
  if (!priceId) { console.error(`[stripe] price id for the ${plan} plan is not configured`); throw new HttpError(503, 'Subscriptions are not available right now.', 'not_configured') }
  // A second subscription would bill twice. Plan changes and cancellation go through the billing portal.
  if (user.stripeSubId && ACTIVE.includes(user.stripeSubStatus)) {
    throw new HttpError(409, 'You already have an active subscription. You can manage it from your profile.', 'already_subscribed')
  }

  const emailOf = async () => { try { return (await admin.auth().getUser(uid)).email } catch { return undefined } }
  const newCustomer = async () => {
    const customer = await stripe.customers.create({ email: await emailOf(), metadata: { firebaseUid: uid } })
    await userRef.update({ stripeCustomerId: customer.id })
    return customer.id
  }
  let customerId = user.stripeCustomerId
  if (!customerId) {
    customerId = await newCustomer()
  } else {
    // A stored id from the other mode (live id with test keys, or the reverse) is replaced by a fresh customer.
    try { await stripe.customers.retrieve(customerId) } catch (err) {
      if (err && err.code === 'resource_missing') customerId = await newCustomer(); else throw err
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: siteUrl() + '/pro/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: siteUrl() + '/pro',
    metadata: { firebaseUid: uid, plan },
    subscription_data: { metadata: { firebaseUid: uid, plan } },
    allow_promotion_codes: true,
  })
  return respond(200, { url: session.url }, event)
}

module.exports.handler = route('stripe', async (event) => {
  if (header(event, 'stripe-signature')) return handleWebhook(event)
  return handleApi(event)
})

// Exported for tests only.
module.exports._internals = { planOf, periodEndOf }
