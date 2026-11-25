// tests/functions/entitlements.test.mjs
// Unit tests of netlify/functions/entitlements.js (and, through it, lib/entitlementLogic.js) against the FAKE Admin SDK
// (tests/helpers/fakeAdmin.js, not the emulator). They prove our code's behaviour, not Firestore's or the rules'.
import { describe, test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { makeFakeAdmin, freshRequire, makeEvent, parse } from '../helpers/fakeAdmin.js'

const nodeRequire = createRequire(import.meta.url)
const { hashKey } = nodeRequire('../../netlify/functions/lib/rateLimit.js')
const ent = nodeRequire('../../netlify/functions/lib/entitlementLogic.js')   // pure decisions + wording; the same file the handler uses
const { CONFIG } = ent

let fake, handler, logs
const realConsole = { log: console.log, warn: console.warn, error: console.error }
const IP = { 'x-nf-client-connection-ip': '203.0.113.60' }
const FAILED = { error: 'Could not check your plan just now. Please try again.', code: 'plan_check_failed' }

const call = async (token, body, extra = {}) => parse(await handler(makeEvent({ token, body, headers: IP, ...extra })))
const ask = (uid, action, feature, more = {}) => call(fake.tokenFor(uid), { action, ...(feature === undefined ? {} : { feature }), ...more })
const usage = (uid) => fake.read(`users/${uid}/usage/lifetime`)
const rateDocs = () => fake.count('rateLimits/')
const full = (route, uid, limit) => fake.seed({ ['rateLimits/' + hashKey(route, uid)]: { route, count: limit, windowStart: Date.now(), expiresAt: new Date(Date.now() + 2 * 3600000) } })

beforeEach(() => {
  fake = makeFakeAdmin()
  fake.install()
  for (const uid of ['alice', 'bob', 'paula', 'bea', 'sue', 'gina', 'newbie']) fake.addAuthUser(uid)
  fake.seed({
    'users/alice': { displayName: 'Alice', isPro: false },                       // free
    'users/bob': { displayName: 'Bob' },                                         // free
    'users/paula': { displayName: 'Paula', isPro: true },                        // Pro
    'users/bea': { displayName: 'Bea', betaUser: true },                         // beta = lifetime free Pro
    'users/sue': { displayName: 'Sue', isPro: 'true', betaUser: 'true' },        // flags that are text, not booleans
    'users/gina': { displayName: 'Gina', isPro: false },                         // already has a generated timetable
    'users/gina/sessions/s1': { source: 'generated', subject: 'Maths' },
    'users/alice/sessions/m1': { source: 'manual', subject: 'Maths' },           // a session she added herself is not a timetable
    // 'newbie' is signed in but has no profile document
  })
  logs = []
  for (const k of ['log', 'warn', 'error']) console[k] = (...a) => { logs.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')) }
  handler = freshRequire('netlify/functions/entitlements.js').handler
})
afterEach(() => {
  Object.assign(console, realConsole)
  delete process.env.APP_CHECK_ENFORCE
})

describe('who may call it', () => {
  test('method, content type, JSON and size are checked; answers are never cacheable and CORS has no wildcard', async () => {
    const token = fake.tokenFor('alice')
    assert.equal(parse(await handler(makeEvent({ method: 'GET', headers: IP }))).status, 405)
    assert.equal(parse(await handler(makeEvent({ token, body: '{}', raw: true, headers: { ...IP, 'content-type': 'text/plain' } }))).status, 415)
    assert.equal(parse(await handler(makeEvent({ token, body: '{nope', raw: true, headers: IP }))).status, 400)
    assert.equal((await call(token, [1])).status, 400)
    assert.equal((await call(token, null)).status, 400)
    assert.equal((await call(token, { action: 'status', pad: 'x'.repeat(3000) })).status, 413)
    const ok = await call(token, { action: 'status' }, { headers: { ...IP, origin: 'https://www.revisionflow.co.uk' } })
    assert.equal(ok.status, 200)
    assert.equal(ok.headers['Cache-Control'], 'no-store')
    assert.equal(ok.headers['Access-Control-Allow-Origin'], 'https://www.revisionflow.co.uk')
    const evil = await call(token, { action: 'status' }, { headers: { ...IP, origin: 'https://evil.example' } })
    assert.equal(evil.headers['Access-Control-Allow-Origin'], undefined)
    assert.equal((await handler(makeEvent({ method: 'OPTIONS', headers: { ...IP, origin: 'https://www.revisionflow.co.uk' } }))).statusCode, 204)
  })

  test('only a signed-in account: not signed out, not a garbage or expired token (and nothing is touched)', async () => {
    assert.equal((await call(undefined, { action: 'consume', feature: 'timetable' })).status, 401)
    assert.equal((await call('garbage', { action: 'consume', feature: 'timetable' })).status, 401)
    assert.equal((await call(fake.tokenFor('alice', { expired: true }), { action: 'consume', feature: 'timetable' })).status, 401)
    assert.equal(fake.exists('users/alice/usage/lifetime'), false)
    assert.equal(rateDocs(), 0)
    assert.equal((await ask('newbie', 'status')).status, 200, 'an account with no profile document yet is still served')
  })

  test('the account is the verified token\'s: a uid in the body changes nothing', async () => {
    const r = await ask('alice', 'consume', 'timetable', { uid: 'bob', userId: 'bob', targetUid: 'bob', isPro: true, betaUser: true })
    assert.equal(r.status, 200)
    assert.equal(usage('alice').timetable, 1)
    assert.equal(fake.exists('users/bob/usage/lifetime'), false)
    const s = await ask('alice', 'status', undefined, { uid: 'paula', isPro: true })
    assert.equal(s.json.pro, false, 'claiming to be Pro in the request does not make the account Pro')
  })

  test('with APP_CHECK_ENFORCE=true a request without a valid App Check token is refused', async () => {
    assert.equal((await ask('alice', 'status')).status, 200)
    process.env.APP_CHECK_ENFORCE = 'true'
    assert.equal((await ask('alice', 'status')).status, 401)
    assert.equal(parse(await handler(makeEvent({ token: fake.tokenFor('alice'), body: { action: 'status' }, headers: { ...IP, 'x-firebase-appcheck': fake.appCheckToken } }))).status, 200)
  })

  test('a missing, odd or unknown action is a plain 400 that costs nothing and echoes nothing', async () => {
    for (const action of [undefined, null, '', 7, {}, ['status'], true, 'dropEverything', '__proto__', 'constructor', 'toString', 'x'.repeat(1000)]) {
      const r = await ask('alice', action)
      assert.equal(r.status, 400, JSON.stringify(action)?.slice(0, 30))
      assert.equal(r.json.code, 'bad_request')
      assert.ok(!JSON.stringify(r.json).includes('xxxx'))
    }
    assert.equal(rateDocs(), 0, 'refused before anything is counted')
    assert.equal(fake.exists('users/alice/usage/lifetime'), false)
  })
})

describe('status', () => {
  test('a free account sees every capped feature with its allowance, and the Pro-only list', async () => {
    const r = await ask('alice', 'status')
    assert.equal(r.status, 200)
    assert.equal(r.json.ok, true)
    assert.equal(r.json.pro, false)
    assert.deepEqual(Object.keys(r.json.features).sort(), Object.keys(CONFIG.free).sort())
    assert.deepEqual(r.json.proOnly, Object.keys(CONFIG.proOnly))
    assert.deepEqual(r.json.features.timedChallenge, { feature: 'timedChallenge', pro: false, lifetime: 3, usedLifetime: 0, remainingLifetime: 3, dailyLimit: null, dailyUsed: null, dailyRemaining: null, exhausted: false })
    assert.equal(r.json.features.timetable.exhausted, false, 'a session she added herself is not a generated timetable')
    assert.equal(fake.exists('users/alice/usage/lifetime'), false, 'looking does not write')
  })

  test('an account that already has a generated timetable shows it as used, without writing anything', async () => {
    const r = await ask('gina', 'status')
    assert.equal(r.json.features.timetable.usedLifetime, 1)
    assert.equal(r.json.features.timetable.exhausted, true)
    assert.equal(r.json.features.timedChallenge.exhausted, false)
    assert.equal(fake.exists('users/gina/usage/lifetime'), false)
  })

  test('Pro and beta accounts are never counted; flags that are text do not make an account Pro', async () => {
    for (const uid of ['paula', 'bea']) {
      const r = await ask(uid, 'status')
      assert.equal(r.json.pro, true, uid)
      assert.equal(r.json.features.timetable.pro, true)
      assert.equal(r.json.features.timetable.exhausted, false)
      assert.equal(r.json.features.timetable.lifetime, null)
    }
    for (const uid of ['sue', 'newbie']) assert.equal((await ask(uid, 'status')).json.pro, false, uid)
  })

  test('the lifetime allowances nothing counts (Maths solver, essay feedback, photo marking) are reported as unused', async () => {
    // Documented, not endorsed: see the header of entitlements.js. If these start being counted, this test should change with it.
    const r = await ask('alice', 'status')
    for (const f of ['mathsSolver', 'essayFeedback', 'photoMarking']) {
      assert.equal(r.json.features[f].usedLifetime, 0, f)
      assert.equal(r.json.features[f].remainingLifetime, CONFIG.free[f].lifetime, f)
    }
  })
})

describe('consume', () => {
  test('the free timetable: the first use is allowed and counted, the second is refused with the soft wording', async () => {
    const first = await ask('alice', 'consume', 'timetable')
    assert.equal(first.status, 200)
    assert.deepEqual(first.json, { ok: true, allowed: true, usedLifetime: 1, remainingLifetime: 0, dailyRemaining: null })
    assert.equal(usage('alice').timetable, 1)
    const second = await ask('alice', 'consume', 'timetable')
    assert.equal(second.status, 402)
    assert.equal(second.json.code, 'LIFETIME_EXHAUSTED')
    assert.equal(second.json.error, ent.messageFor('LIFETIME_EXHAUSTED', 'timetable'))
    assert.equal(second.json.error, "You've used your free timetable. Upgrade to Pro to generate another.")
    assert.equal(second.json.remainingLifetime, 0)
    assert.equal(usage('alice').timetable, 1, 'a refusal is not counted')
  })

  test('timed challenges have three free uses', async () => {
    const left = []
    for (let i = 0; i < 3; i++) { const r = await ask('bob', 'consume', 'timedChallenge'); assert.equal(r.status, 200, 'timedChallenge' + i); left.push(r.json.remainingLifetime) }
    assert.deepEqual(left, [2, 1, 0])
    const r = await ask('bob', 'consume', 'timedChallenge')
    assert.equal(r.status, 402)
    assert.equal(r.json.error, "You've used all 3 of your free " + CONFIG.free.timedChallenge.plural + '. Upgrade to Pro to keep going.')
    assert.equal(usage('bob').timedChallenge, 3)
  })

  // Recommended topics is a once-a-day feature (the rule is in lib/entitlementLogic.js): the first look on a day takes one of the
  // three free uses, and looking again the same day costs nothing, even when the allowance has just run out.
  test('recommended topics: three free days, and looking again the same day costs nothing', async () => {
    let r = await ask('bob', 'consume', 'recommendedTopics')
    assert.equal(r.status, 200); assert.equal(r.json.remainingLifetime, 2)
    for (let i = 0; i < 3; i++) { r = await ask('bob', 'consume', 'recommendedTopics'); assert.equal(r.status, 200, 'repeat ' + i); assert.equal(r.json.remainingLifetime, 2) }
    assert.equal(usage('bob').recommendedTopics, 1, 'only the first look of the day was counted')

    // Two earlier days already used: today's first look takes the third and last, and today's later looks are still free.
    fake.seed({ 'users/alice/usage/lifetime': { recommendedTopics: 2, daily: { recommendedTopics: { day: '2000-01-01', n: 1 } } } })
    r = await ask('alice', 'consume', 'recommendedTopics')
    assert.equal(r.status, 200); assert.equal(r.json.remainingLifetime, 0)
    r = await ask('alice', 'consume', 'recommendedTopics')
    assert.equal(r.status, 200, 'looking again after using the last one, on the same day, is free')
    assert.equal(usage('alice').recommendedTopics, 3)

    // Three earlier days, so nothing is left for today: refused, with the same wording as the other features.
    fake.seed({ 'users/gina/usage/lifetime': { recommendedTopics: 3, daily: { recommendedTopics: { day: '2000-01-01', n: 1 } } } })
    r = await ask('gina', 'consume', 'recommendedTopics')
    assert.equal(r.status, 402)
    assert.equal(r.json.error, "You've used all 3 of your free " + CONFIG.free.recommendedTopics.plural + '. Upgrade to Pro to keep going.')
    assert.equal(usage('gina').recommendedTopics, 3)
  })

  test('requests racing for the last free uses: exactly the allowance gets through', async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => ask('alice', 'consume', 'timedChallenge')))
    assert.deepEqual(results.map((r) => r.status).sort(), [200, 200, 200, 402, 402])
    assert.equal(usage('alice').timedChallenge, 3)
  })

  test('an account that already has a generated timetable has already used its free one, and that is remembered', async () => {
    const r = await ask('gina', 'consume', 'timetable')
    assert.equal(r.status, 402)
    assert.equal(r.json.code, 'LIFETIME_EXHAUSTED')
    assert.equal(usage('gina').timetable, 1)
  })

  test('Pro and beta accounts are never counted', async () => {
    for (const uid of ['paula', 'bea']) {
      for (let i = 0; i < 4; i++) {
        const r = await ask(uid, 'consume', 'timetable')
        assert.equal(r.status, 200, uid)
        assert.equal(r.json.pro, true)
      }
      assert.equal(fake.exists(`users/${uid}/usage/lifetime`), false, uid)
    }
    // text where a boolean belongs is not Pro
    assert.equal((await ask('sue', 'consume', 'timetable')).status, 200)
    assert.equal((await ask('sue', 'consume', 'timetable')).status, 402)
  })

  test('only the three browser-run features can be counted here; anything else is refused and counts nothing', async () => {
    for (const feature of ['mathsSolver', 'essayFeedback', 'photoMarking', 'timetableReschedule', 'paperAnalysis', 'nonsense', '__proto__', 'constructor', 'toString', '', 7, null, {}, ['timetable'], undefined]) {
      const r = await ask('alice', 'consume', feature)
      assert.equal(r.status, 400, JSON.stringify(feature))
      assert.equal(r.json.code, 'NOT_CONSUMABLE_HERE')
    }
    assert.equal(fake.exists('users/alice/usage/lifetime'), false)
  })

  test('if the plan cannot be checked nothing is allowed and nothing is counted (fail closed), and the use is still there afterwards', async () => {
    fake.failNext({ op: 'get', path: 'users/alice' }, new Error('store down'))
    const r = await ask('alice', 'consume', 'timetable')
    assert.equal(r.status, 500)
    assert.deepEqual(r.json, FAILED)
    assert.equal(fake.exists('users/alice/usage/lifetime'), false)
    assert.equal((await ask('alice', 'consume', 'timetable')).status, 200, 'the student did not lose their free use to our failure')
  })

  test('if recording the use fails, the browser is told no, and nothing is recorded', async () => {
    fake.failNext({ op: 'set', path: 'users/alice/usage/lifetime' }, new Error('write failed'))
    const r = await ask('alice', 'consume', 'timedChallenge')
    assert.equal(r.status, 500)
    assert.deepEqual(r.json, FAILED)
    assert.equal(fake.exists('users/alice/usage/lifetime'), false)
  })

  test('an unexpected failure is a plain answer, and nothing personal reaches the log', async () => {
    fake.failNext({ op: 'get', path: 'users/alice' }, new Error('boom alice@example.test projects/p/databases/(default)/documents/users/alice/x Bearer abc.def.ghi'))
    const r = await ask('alice', 'consume', 'timetable')
    assert.equal(r.status, 500)
    assert.deepEqual(r.json, FAILED)
    const text = logs.join('\n')
    assert.ok(text.includes('[entitlements] consume failed'))
    for (const secret of ['alice@example.test', 'users/alice', 'Bearer abc', 'abc.def.ghi']) assert.ok(!text.includes(secret), secret)
  })
})

describe('refund', () => {
  test('a timetable use is given back when no timetable was saved, and can then be used again', async () => {
    assert.equal((await ask('alice', 'consume', 'timetable')).status, 200)
    const r = await ask('alice', 'refund', 'timetable')
    assert.equal(r.status, 200)
    assert.deepEqual(r.json, { ok: true, refunded: true, usedLifetime: 0, remainingLifetime: 1 })
    assert.equal(usage('alice').timetable, 0)
    assert.equal((await ask('alice', 'consume', 'timetable')).status, 200)
  })

  test('nothing is given back if a generated timetable exists: the use was spent', async () => {
    fake.seed({ 'users/alice/usage/lifetime': { timetable: 1 }, 'users/alice/sessions/g1': { source: 'generated' } })
    const r = await ask('alice', 'refund', 'timetable')
    assert.equal(r.status, 409)
    assert.equal(r.json.code, 'NOT_REFUNDABLE')
    assert.equal(usage('alice').timetable, 1)
  })

  test('a refund never goes below zero, a second one gives nothing more back, and Pro accounts have nothing to give back', async () => {
    assert.deepEqual((await ask('bob', 'refund', 'timetable')).json, { ok: true, refunded: false })
    assert.equal(fake.exists('users/bob/usage/lifetime'), false)
    assert.equal((await ask('bob', 'consume', 'timetable')).status, 200)
    assert.equal((await ask('bob', 'refund', 'timetable')).json.refunded, true)
    assert.equal((await ask('bob', 'refund', 'timetable')).json.refunded, false)
    assert.equal(usage('bob').timetable, 0)
    assert.deepEqual((await ask('paula', 'refund', 'timetable')).json, { ok: true, refunded: false, pro: true })
  })

  test('only the timetable can be given back; every other feature is refused and untouched', async () => {
    fake.seed({ 'users/alice/usage/lifetime': { timedChallenge: 2, recommendedTopics: 1, mathsSolver: 3 } })
    for (const feature of ['timedChallenge', 'recommendedTopics', 'mathsSolver', 'nonsense', '__proto__', '', 7, null, {}, undefined]) {
      const r = await ask('alice', 'refund', feature)
      assert.equal(r.status, 400, JSON.stringify(feature))
      assert.equal(r.json.code, 'NOT_REFUNDABLE')
    }
    assert.deepEqual({ ...usage('alice') }, { timedChallenge: 2, recommendedTopics: 1, mathsSolver: 3 })
  })
})

describe('limits', () => {
  test('each action has its own hourly allowance per account (status 300, consume 120, refund 60)', async () => {
    full('entitlements.consume', 'alice', 120)
    const blocked = await ask('alice', 'consume', 'timedChallenge')
    assert.equal(blocked.status, 429)
    assert.equal(blocked.json.code, 'rate_limited')
    assert.ok(Number(blocked.headers['Retry-After']) >= 1)
    assert.equal(fake.exists('users/alice/usage/lifetime'), false, 'a limited request is not counted')
    assert.equal((await ask('alice', 'status')).status, 200, 'status has its own allowance')
    assert.equal((await ask('bob', 'consume', 'timedChallenge')).status, 200, 'another account is unaffected')

    full('entitlements.status', 'alice', 300)
    assert.equal((await ask('alice', 'status')).status, 429)
    full('entitlements.refund', 'alice', 60)
    assert.equal((await ask('alice', 'refund', 'timetable')).status, 429)
  })

  test('the allowance is exactly the stated number of requests', async () => {
    full('entitlements.refund', 'bob', 59)
    assert.equal((await ask('bob', 'refund', 'timetable')).status, 200, 'the 60th is allowed')
    assert.equal((await ask('bob', 'refund', 'timetable')).status, 429, 'the 61st is not')
  })

  test('if the rate-limit store is down the endpoint still works (per-instance counters take over)', async () => {
    fake.failNext({ op: 'get', path: /^rateLimits\// }, new Error('store down'), { times: 3 })
    assert.equal((await ask('alice', 'status')).status, 200)
  })
})
