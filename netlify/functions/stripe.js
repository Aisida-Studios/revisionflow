// netlify/functions/stripe.js
// CommonJS — netlify/functions/package.json has "type":"commonjs"
//
// Handles two things:
//   POST /api/stripe  { action:'create-checkout', uid, plan }  → returns { url }
//   POST /api/stripe  { action:'webhook' }                     → Stripe webhook handler
//
// Required Netlify env vars:
//   STRIPE_SECRET_KEY          — sk_live_... (or sk_test_... for testing)
//   STRIPE_WEBHOOK_SECRET      — whsec_... from stripe listen --forward-to
//   STRIPE_MONTHLY_PRICE_ID    — price_... for £3.99/month
//   STRIPE_ANNUAL_PRICE_ID     — price_... for £29.99/year
//   FIREBASE_SERVICE_ACCOUNT   — JSON string of your Firebase service account
//   SITE_URL                   — https://revision-flow.netlify.app

const stripe      = require('stripe')(process.env.STRIPE_SECRET_KEY)
const admin       = require('firebase-admin')

// ── Firebase Admin init (singleton) ──────────────────────────────────────────
if (!admin.apps.length) {
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')
  admin.initializeApp({ credential: admin.credential.cert(sa) })
}
const db = admin.firestore()

// ── CORS / response helpers ───────────────────────────────────────────────────
function respond(status, body) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify(body),
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
module.exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return respond(200, {})

  // ── Stripe webhook — raw body required, no JSON parse ──────────────────────
  const sig = event.headers['stripe-signature']
  if (sig) {
    let stripeEvent
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        event.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      return respond(400, { error: 'Webhook signature verification failed: ' + err.message })
    }
    return handleWebhook(stripeEvent)
  }

  // ── Regular API call ───────────────────────────────────────────────────────
  let body
  try { body = JSON.parse(event.body || '{}') } catch { return respond(400, { error: 'Invalid JSON' }) }

  const { action, uid, plan } = body

  // ── Create Checkout session ────────────────────────────────────────────────
  if (action === 'create-checkout') {
    if (!uid || !plan) return respond(400, { error: 'uid and plan required' })

    const priceId = plan === 'annual'
      ? process.env.STRIPE_ANNUAL_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID

    if (!priceId) return respond(500, { error: 'Price ID not configured for plan: ' + plan })

    // Look up or create Stripe customer tied to this Firebase uid
    let customerId
    try {
      const userDoc = await db.collection('users').doc(uid).get()
      customerId = userDoc.data()?.stripeCustomerId
    } catch {}

    if (!customerId) {
      // Get email from Firebase Auth
      let email
      try { email = (await admin.auth().getUser(uid)).email } catch {}
      const customer = await stripe.customers.create({
        email,
        metadata: { firebaseUid: uid },
      })
      customerId = customer.id
      await db.collection('users').doc(uid).update({ stripeCustomerId: customerId })
    } else {
      // Verify the stored customer ID is valid in the current mode (test vs live).
      // If not — e.g. a live ID used with test keys — create a fresh one.
      try {
        await stripe.customers.retrieve(customerId)
      } catch (e) {
        if (e.code === 'resource_missing') {
          let email
          try { email = (await admin.auth().getUser(uid)).email } catch {}
          const customer = await stripe.customers.create({
            email,
            metadata: { firebaseUid: uid },
          })
          customerId = customer.id
          await db.collection('users').doc(uid).update({ stripeCustomerId: customerId })
        } else {
          throw e
        }
      }
    }

    const siteUrl = process.env.SITE_URL || 'https://revision-flow.netlify.app'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: siteUrl + '/pro/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url:  siteUrl + '/pro',
      metadata: { firebaseUid: uid, plan },
      subscription_data: {
        metadata: { firebaseUid: uid, plan },
      },
      allow_promotion_codes: true,
    })

    return respond(200, { url: session.url })
  }

  return respond(400, { error: 'Unknown action: ' + action })
}

// ── Webhook event handler ─────────────────────────────────────────────────────
async function handleWebhook(event) {
  const obj = event.data.object

  // Helper: get Firebase uid from Stripe metadata (customer or subscription)
  async function getUid(obj) {
    let uid = obj?.metadata?.firebaseUid
    if (!uid && obj?.customer) {
      const cust = await stripe.customers.retrieve(obj.customer)
      uid = cust?.metadata?.firebaseUid
    }
    return uid
  }

  try {
    switch (event.type) {
      // ── Subscription activated (initial checkout or reactivation) ──────────
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = obj
        const uid = await getUid(sub)
        if (!uid) break
        const active = sub.status === 'active' || sub.status === 'trialing'
        await db.collection('users').doc(uid).update({
          isPro:              active,
          stripeSubId:        sub.id,
          stripeSubStatus:    sub.status,
          stripePlan:         sub.metadata?.plan || 'monthly',
          stripeCurrentPeriodEnd: sub.current_period_end,
          proActivatedAt:     active ? admin.firestore.FieldValue.serverTimestamp() : null,
        })
        break
      }

      // ── Subscription cancelled / payment failed ────────────────────────────
      case 'customer.subscription.deleted': {
        const uid = await getUid(obj)
        if (!uid) break
        await db.collection('users').doc(uid).update({
          isPro:           false,
          stripeSubStatus: 'canceled',
          stripeSubId:     null,
        })
        break
      }

      // ── Invoice payment failed — don't immediately revoke, Stripe retries ──
      case 'invoice.payment_failed': {
        const uid = await getUid(obj)
        if (!uid) break
        // Just log — Stripe will send subscription.updated → deleted after retries exhaust
        await db.collection('users').doc(uid).update({ stripePaymentFailed: true })
        break
      }

      case 'invoice.payment_succeeded': {
        const uid = await getUid(obj)
        if (!uid) break
        await db.collection('users').doc(uid).update({ stripePaymentFailed: false })
        break
      }
    }
  } catch (err) {
    console.error('[stripe webhook]', event.type, err.message)
    return respond(500, { error: err.message })
  }

  return respond(200, { received: true })
}
