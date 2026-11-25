// tests/functions/stripe.test.mjs
// netlify/functions/stripe.js against: the REAL `stripe` package for webhook signing/verification, and a FAKE Stripe API
// (subscriptions/customers/checkout/portal) + FAKE Admin SDK (tests/helpers/fakeAdmin.js). No network, no credentials.
import { describe, test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { makeFakeAdmin, installFakeStripe, freshRequire, makeEvent, parse } from '../helpers/fakeAdmin.js'

// The real package lives in netlify/functions/node_modules. An absolute path is used so the fake `stripe` module (below) does not
// intercept it. If it is not installed the signature tests are SKIPPED (visibly), never passed.
const realPath = new URL('../../netlify/functions/node_modules/stripe', import.meta.url).pathname
const haveReal = existsSync(realPath)
const realStripe = haveReal ? createRequire(import.meta.url)(realPath)('sk_test_dummy') : null
const SKIP = haveReal ? false : 'the real stripe package is not installed (cd netlify/functions && npm install)'

const SECRET = 'whsec_unit_test_secret'
const ENV_KEYS = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_MONTHLY_PRICE_ID', 'STRIPE_ANNUAL_PRICE_ID', 'SITE_URL', 'APP_CHECK_ENFORCE']
const savedEnv = {}
let fake, stripeFake, handler

function makeStripeFake({ subs = {}, customers = {} } = {}) {
  const calls = []
  const err = (code) => Object.assign(new Error(code), { code })
  return {
    webhooks: realStripe ? realStripe.webhooks : undefined,
    subscriptions: { retrieve: async (id) => { calls.push(['subscriptions.retrieve', id]); if (!subs[id]) throw err('resource_missing'); return structuredClone(subs[id]) } },
    customers: {
      retrieve: async (id) => { calls.push(['customers.retrieve', id]); if (!customers[id]) throw err('resource_missing'); return structuredClone(customers[id]) },
      create: async (params) => { calls.push(['customers.create', params]); const id = 'cus_new' + calls.length; customers[id] = { id, metadata: params.metadata }; return { id } },
    },
    billingPortal: { sessions: { create: async (p) => { calls.push(['portal.create', p]); return { url: 'https://billing.example/portal' } } } },
    checkout: { sessions: { create: async (p) => { calls.push(['checkout.create', p]); return { url: 'https://checkout.example/session' } } } },
    subs, customerData: customers, calls,
  }
}
const sub = (id, status, o = {}) => ({
  id, object: 'subscription', status, customer: o.customer || 'cus_1', current_period_end: o.periodEnd || 1900000000,
  metadata: o.metadata === undefined ? { firebaseUid: 'alice', plan: 'monthly' } : o.metadata,
  items: { data: [{ price: { id: o.price || 'price_monthly' } }] },
})
let evtCounter = 0
const evt = (type, object, o = {}) => ({ id: o.id || 'evt_' + (++evtCounter), object: 'event', type, created: 1800000000, livemode: o.livemode === true, data: { object } })

const signed = (event, { secret = SECRET, base64 = false, mutate } = {}) => {
  let payload = JSON.stringify(event)
  const sig = realStripe.webhooks.generateTestHeaderString({ payload, secret })
  if (mutate) payload = mutate(payload)
  return makeEvent({ raw: true, body: payload, base64, headers: { 'stripe-signature': sig } })
}
const send = async (event) => parse(await handler(event))
const user = (uid = 'alice') => fake.read('users/' + uid)

beforeEach(() => {
  for (const k of ENV_KEYS) savedEnv[k] = process.env[k]
  Object.assign(process.env, { STRIPE_SECRET_KEY: 'sk_test_unit', STRIPE_WEBHOOK_SECRET: SECRET, STRIPE_MONTHLY_PRICE_ID: 'price_monthly', STRIPE_ANNUAL_PRICE_ID: 'price_annual', SITE_URL: 'https://app.example' })
  delete process.env.APP_CHECK_ENFORCE
  fake = makeFakeAdmin(); fake.install()
  fake.addAuthUser('alice'); fake.addAuthUser('bob')
  fake.seed({ 'users/alice': { displayName: 'Alice', isPro: false, stripeCustomerId: 'cus_1' }, 'users/bob': { displayName: 'Bob' } })
  stripeFake = makeStripeFake({ customers: { cus_1: { id: 'cus_1', metadata: { firebaseUid: 'alice' } } } })
  installFakeStripe(stripeFake)
  handler = freshRequire('netlify/functions/stripe.js').handler
})
afterEach(() => { for (const k of ENV_KEYS) { if (savedEnv[k] === undefined) delete process.env[k]; else process.env[k] = savedEnv[k] } })

describe('webhook signature and transport', { skip: SKIP }, () => {
  test('a correctly signed event is accepted; a forged, tampered, wrongly-keyed or unsigned one is refused and writes nothing', async () => {
    stripeFake.subs.sub_1 = sub('sub_1', 'active')
    const good = evt('customer.subscription.created', { id: 'sub_1' })
    assert.equal((await send(signed(good))).status, 200)
    assert.equal(user().isPro, true)

    fake.seed({ 'users/alice': { stripeCustomerId: 'cus_1', isPro: false } })
    const before = fake.paths('stripeEvents/').length
    const forged = await send(signed(evt('customer.subscription.created', { id: 'sub_1' }), { secret: 'whsec_attacker' }))
    assert.equal(forged.status, 400)
    assert.deepEqual(forged.json, { error: 'Invalid signature.' }, 'the response must not explain or echo anything')
    const tampered = await send(signed(evt('customer.subscription.created', { id: 'sub_1' }), { mutate: (p) => p.replace('sub_1', 'sub_2') }))
    assert.equal(tampered.status, 400)
    const unsigned = await send(makeEvent({ raw: true, body: JSON.stringify(good), headers: { 'stripe-signature': 't=1,v1=deadbeef' } }))
    assert.equal(unsigned.status, 400)
    assert.equal(user().isPro, false)
    assert.equal(fake.paths('stripeEvents/').length, before)
  })

  test('a base64-encoded body (as Netlify may deliver it) is verified against the decoded bytes', async () => {
    stripeFake.subs.sub_1 = sub('sub_1', 'active')
    const r = await send(signed(evt('customer.subscription.created', { id: 'sub_1' }), { base64: true }))
    assert.equal(r.status, 200)
    assert.equal(user().isPro, true)
  })

  test('without a webhook secret configured the endpoint answers 503, not a guess', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET
    handler = freshRequire('netlify/functions/stripe.js').handler
    const r = await send(signed(evt('customer.subscription.created', { id: 'sub_1' })))
    assert.equal(r.status, 503)
  })

  test('a test-mode event sent to a live-mode server is acknowledged and ignored (and the reverse)', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_live_unit'
    handler = freshRequire('netlify/functions/stripe.js').handler
    stripeFake.subs.sub_1 = sub('sub_1', 'active')
    const r = await send(signed(evt('customer.subscription.created', { id: 'sub_1' }, { livemode: false })))
    assert.deepEqual(r.json, { received: true, ignored: 'mode_mismatch' })
    assert.equal(user().isPro, false)
    assert.equal(fake.paths('stripeEvents/').length, 0)
  })
})

describe('webhook state handling', { skip: SKIP }, () => {
  test('activation writes Pro state from the subscription fetched from Stripe, with plan taken from the billed price', async () => {
    stripeFake.subs.sub_1 = sub('sub_1', 'active', { price: 'price_annual', metadata: { firebaseUid: 'alice', plan: 'monthly' }, periodEnd: 1950000000 })
    await send(signed(evt('customer.subscription.created', { id: 'sub_1', status: 'canceled' /* a lying payload must be ignored */ })))
    const u = user()
    assert.equal(u.isPro, true); assert.equal(u.stripeSubId, 'sub_1'); assert.equal(u.stripeSubStatus, 'active')
    assert.equal(u.stripePlan, 'annual'); assert.equal(u.stripeCurrentPeriodEnd, 1950000000)
    assert.equal(u.stripePaymentFailed, false); assert.ok(u.proActivatedAt)
  })

  test('the event payload is never trusted: a payload claiming "active" for a subscription Stripe says is cancelled does NOT grant Pro', async () => {
    stripeFake.subs.sub_1 = sub('sub_1', 'canceled')
    await send(signed(evt('customer.subscription.updated', { id: 'sub_1', status: 'active', metadata: { firebaseUid: 'alice' } })))
    assert.notEqual(user().isPro, true)
  })

  test('events arriving out of order end in the true state (late "updated: active" after cancellation does not re-grant Pro)', async () => {
    stripeFake.subs.sub_1 = sub('sub_1', 'active')
    await send(signed(evt('customer.subscription.created', { id: 'sub_1' })))
    assert.equal(user().isPro, true)
    stripeFake.subs.sub_1 = sub('sub_1', 'canceled')                       // Stripe's truth is now: cancelled
    await send(signed(evt('customer.subscription.deleted', { id: 'sub_1' })))
    assert.equal(user().isPro, false); assert.equal(user().stripeSubId, null); assert.equal(user().stripeSubStatus, 'canceled')
    await send(signed(evt('customer.subscription.updated', { id: 'sub_1', status: 'active' })))   // delayed older event
    assert.equal(user().isPro, false, 'a late event must not undo the cancellation')
  })

  test('a stale cancellation of an OLD subscription does not switch off a newer active one', async () => {
    stripeFake.subs.sub_old = sub('sub_old', 'canceled'); stripeFake.subs.sub_new = sub('sub_new', 'active')
    await send(signed(evt('customer.subscription.created', { id: 'sub_new' })))
    assert.equal(user().stripeSubId, 'sub_new')
    const r = await send(signed(evt('customer.subscription.deleted', { id: 'sub_old' })))
    assert.equal(r.status, 200)
    assert.equal(user().isPro, true); assert.equal(user().stripeSubId, 'sub_new')
  })

  test('"incomplete" leaves Pro exactly as it was, both when it was off and when it was on', async () => {
    stripeFake.subs.sub_1 = sub('sub_1', 'incomplete')
    await send(signed(evt('customer.subscription.created', { id: 'sub_1' })))
    assert.notEqual(user().isPro, true); assert.equal(user().stripeSubId, undefined)
    fake.seed({ 'users/alice': { stripeCustomerId: 'cus_1', isPro: true, stripeSubId: 'sub_0', stripeSubStatus: 'active' } })
    await send(signed(evt('customer.subscription.updated', { id: 'sub_1' })))
    assert.equal(user().isPro, true); assert.equal(user().stripeSubId, 'sub_0')
  })

  test('payment trouble: past_due switches Pro off and flags the payment; a later successful payment restores it', async () => {
    stripeFake.subs.sub_1 = sub('sub_1', 'active')
    await send(signed(evt('customer.subscription.created', { id: 'sub_1' })))
    stripeFake.subs.sub_1 = sub('sub_1', 'past_due')
    await send(signed(evt('invoice.payment_failed', { id: 'in_1', subscription: 'sub_1', customer: 'cus_1' })))
    assert.equal(user().isPro, false); assert.equal(user().stripePaymentFailed, true); assert.equal(user().stripeSubId, 'sub_1')
    stripeFake.subs.sub_1 = sub('sub_1', 'active')
    await send(signed(evt('invoice.payment_succeeded', { id: 'in_2', subscription: 'sub_1', customer: 'cus_1' })))
    assert.equal(user().isPro, true); assert.equal(user().stripePaymentFailed, false)
  })

  test('a late invoice event cannot flip the payment flag back, because state is re-read rather than copied from the event', async () => {
    stripeFake.subs.sub_1 = sub('sub_1', 'active')
    await send(signed(evt('customer.subscription.created', { id: 'sub_1' })))
    await send(signed(evt('invoice.payment_failed', { id: 'in_old', subscription: 'sub_1', customer: 'cus_1' }))) // old failure delivered late; Stripe says active
    assert.equal(user().stripePaymentFailed, false); assert.equal(user().isPro, true)
  })

  test('the same event delivered twice is applied once; its record holds only an id, type and timings', async () => {
    stripeFake.subs.sub_1 = sub('sub_1', 'active')
    const e = evt('customer.subscription.created', { id: 'sub_1' }, { id: 'evt_dup' })
    assert.equal((await send(signed(e))).status, 200)
    const retrievals = stripeFake.calls.filter((c) => c[0] === 'subscriptions.retrieve').length
    const again = await send(signed(e))
    assert.deepEqual(again.json, { received: true, duplicate: true })
    assert.equal(stripeFake.calls.filter((c) => c[0] === 'subscriptions.retrieve').length, retrievals)
    const rec = fake.read('stripeEvents/evt_dup')
    assert.equal(rec.state, 'done'); assert.equal(rec.type, 'customer.subscription.created')
    assert.ok(!JSON.stringify(rec).includes('alice'))
  })

  test('a failure is answered with a generic 500 and recorded as failed; Stripe\'s retry then succeeds', async () => {
    stripeFake.subs.sub_1 = sub('sub_1', 'active')
    const e = evt('customer.subscription.created', { id: 'sub_1' }, { id: 'evt_retry' })
    fake.failNext({ op: 'update', path: 'users/alice' }, new Error('SECRET firestore detail'), { times: 1 })
    const first = await send(signed(e))
    assert.equal(first.status, 500); assert.ok(!JSON.stringify(first.json).includes('SECRET'))
    assert.equal(fake.read('stripeEvents/evt_retry').state, 'failed')
    assert.notEqual(user().isPro, true)
    assert.equal((await send(signed(e))).status, 200)
    assert.equal(user().isPro, true); assert.equal(fake.read('stripeEvents/evt_retry').state, 'done')
    assert.equal(fake.read('stripeEvents/evt_retry').attempts, 2)
  })

  test('an event another delivery is still processing gets 409 (Stripe retries); a stale claim is taken over', async () => {
    stripeFake.subs.sub_1 = sub('sub_1', 'active')
    fake.seed({ 'stripeEvents/evt_busy': { type: 'customer.subscription.created', state: 'processing', claimedAt: Date.now(), attempts: 1 } })
    assert.equal((await send(signed(evt('customer.subscription.created', { id: 'sub_1' }, { id: 'evt_busy' })))).status, 409)
    assert.notEqual(user().isPro, true)
    fake.seed({ 'stripeEvents/evt_stale': { type: 'customer.subscription.created', state: 'processing', claimedAt: Date.now() - 10 * 60 * 1000, attempts: 1 } })
    assert.equal((await send(signed(evt('customer.subscription.created', { id: 'sub_1' }, { id: 'evt_stale' })))).status, 200)
    assert.equal(user().isPro, true)
  })

  test('the student is found through the customer when the subscription has no metadata; with neither, the event is acknowledged', async () => {
    stripeFake.subs.sub_1 = sub('sub_1', 'active', { metadata: {} })
    await send(signed(evt('customer.subscription.created', { id: 'sub_1' })))
    assert.equal(user().isPro, true)
    stripeFake.subs.sub_2 = sub('sub_2', 'active', { metadata: {}, customer: 'cus_unknown' })
    stripeFake.customerData.cus_unknown = { id: 'cus_unknown', metadata: {} }
    const r = await send(signed(evt('customer.subscription.created', { id: 'sub_2' })))
    assert.equal(r.status, 200); assert.equal(fake.read('users/bob').isPro, undefined)
  })

  test('a malformed uid in Stripe metadata is never used as a document path', async () => {
    stripeFake.subs.sub_1 = sub('sub_1', 'active', { metadata: { firebaseUid: '../admin/x' } })
    stripeFake.customerData.cus_1.metadata = {}
    assert.equal((await send(signed(evt('customer.subscription.created', { id: 'sub_1' })))).status, 200)
    assert.deepEqual(fake.paths('users/'), ['users/alice', 'users/bob'])
    assert.notEqual(user().isPro, true)
  })

  test('if the student\'s account no longer exists the event is acknowledged (no endless retries) and nothing is created', async () => {
    stripeFake.subs.sub_1 = sub('sub_1', 'active', { metadata: { firebaseUid: 'ghost' } })
    const r = await send(signed(evt('customer.subscription.created', { id: 'sub_1' }, { id: 'evt_ghost' })))
    assert.equal(r.status, 200); assert.equal(fake.exists('users/ghost'), false)
    assert.equal(fake.read('stripeEvents/evt_ghost').outcome, 'no_user')
  })

  test('a subscription that does not exist in this Stripe mode is acknowledged, and unrelated event types are ignored', async () => {
    assert.equal((await send(signed(evt('customer.subscription.updated', { id: 'sub_unknown' })))).status, 200)
    assert.equal((await send(signed(evt('charge.refunded', { id: 'ch_1' })))).status, 200)
    assert.equal((await send(signed(evt('invoice.payment_failed', { id: 'in_x', subscription: null })))).status, 200)
    assert.notEqual(user().isPro, true)
  })
})

describe('student actions (checkout and billing portal)', () => {
  const call = async (token, body) => parse(await handler(makeEvent({ token, body })))
  const tok = (uid) => fake.tokenFor(uid)

  test('requires a verified sign-in, a JSON object and a known action', async () => {
    assert.equal((await call(undefined, { action: 'create-checkout', plan: 'monthly' })).status, 401)
    assert.equal((await call('garbage', { action: 'create-checkout', plan: 'monthly' })).status, 401)
    assert.equal((await call(tok('alice'), { action: 'refund-everything' })).status, 400)
    assert.equal(parse(await handler(makeEvent({ method: 'GET', token: tok('alice') }))).status, 405)
    assert.equal(stripeFake.calls.length, 0)
  })

  test('checkout validates the plan, ties the session to the SIGNED-IN student and ignores any uid in the body', async () => {
    assert.equal((await call(tok('alice'), { action: 'create-checkout', plan: 'lifetime' })).status, 400)
    assert.equal((await call(tok('alice'), { action: 'create-checkout' })).status, 400)
    const r = await call(tok('alice'), { action: 'create-checkout', plan: 'annual', uid: 'bob', firebaseUid: 'bob' })
    assert.equal(r.status, 200); assert.equal(r.json.url, 'https://checkout.example/session')
    const [, params] = stripeFake.calls.find((c) => c[0] === 'checkout.create')
    assert.equal(params.metadata.firebaseUid, 'alice'); assert.equal(params.subscription_data.metadata.firebaseUid, 'alice')
    assert.equal(params.customer, 'cus_1'); assert.equal(params.line_items[0].price, 'price_annual')
    assert.equal(params.success_url, 'https://app.example/pro/success?session_id={CHECKOUT_SESSION_ID}')
  })

  test('a student who already has an active subscription cannot start a second one', async () => {
    fake.seed({ 'users/alice': { stripeCustomerId: 'cus_1', stripeSubId: 'sub_1', stripeSubStatus: 'active', isPro: true } })
    const r = await call(tok('alice'), { action: 'create-checkout', plan: 'monthly' })
    assert.equal(r.status, 409); assert.equal(r.json.code, 'already_subscribed')
    assert.equal(stripeFake.calls.filter((c) => c[0] === 'checkout.create').length, 0)
  })

  test('a first-time customer is created for the signed-in uid and stored; a stored id from the other Stripe mode is replaced', async () => {
    const r = await call(tok('bob'), { action: 'create-checkout', plan: 'monthly' })
    assert.equal(r.status, 200)
    const created = stripeFake.calls.find((c) => c[0] === 'customers.create')[1]
    assert.deepEqual(created.metadata, { firebaseUid: 'bob' })
    assert.ok(fake.read('users/bob').stripeCustomerId.startsWith('cus_new'))
    fake.seed({ 'users/alice': { stripeCustomerId: 'cus_from_other_mode' } })
    const again = await call(tok('alice'), { action: 'create-checkout', plan: 'monthly' })
    assert.equal(again.status, 200)
    assert.ok(fake.read('users/alice').stripeCustomerId.startsWith('cus_new'))
  })

  test('a missing price id is a clear 503 and is not echoed with internal names', async () => {
    delete process.env.STRIPE_ANNUAL_PRICE_ID
    handler = freshRequire('netlify/functions/stripe.js').handler
    const r = await call(tok('alice'), { action: 'create-checkout', plan: 'annual' })
    assert.equal(r.status, 503); assert.ok(!/STRIPE|price_/i.test(JSON.stringify(r.json)))
  })

  test('the billing portal opens the SIGNED-IN student\'s customer only; none stored is a clear 400', async () => {
    const ok = await call(tok('alice'), { action: 'create-portal', customer: 'cus_someone_else', uid: 'bob' })
    assert.equal(ok.status, 200)
    assert.equal(stripeFake.calls.find((c) => c[0] === 'portal.create')[1].customer, 'cus_1')
    assert.equal((await call(tok('bob'), { action: 'create-portal' })).status, 400)
  })

  test('starting sessions is rate limited per student', async () => {
    let last
    for (let i = 0; i < 11; i++) last = await call(tok('alice'), { action: 'create-portal' })
    assert.equal(last.status, 429)
  })
})
