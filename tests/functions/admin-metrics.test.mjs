// tests/functions/admin-metrics.test.mjs
// Unit tests of netlify/functions/admin-metrics.js against the FAKE Admin SDK (tests/helpers/fakeAdmin.js, not the emulator).
import { describe, test, beforeEach, afterEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { makeFakeAdmin, freshRequire, makeEvent, parse, Timestamp } from '../helpers/fakeAdmin.js'

let fake, handler, internals, logs
const realConsole = { log: console.log, warn: console.warn, error: console.error }
const IP = { 'x-nf-client-connection-ip': '203.0.113.40' }
const OWNER = 'admin@example.test'
const DAY = 86400000
const ts = (daysAgo = 0) => Timestamp.fromMillis(Date.now() - daysAgo * DAY)
const utcDay = (daysAgo = 0) => new Date(Date.now() - daysAgo * DAY).toISOString().slice(0, 10)

const call = async (token, body, extra = {}) => parse(await handler(makeEvent({ token, body, headers: IP, ...extra })))
const dash = (body = {}, tokenOpts = {}) => call(fake.tokenFor('admin', tokenOpts), body)
const detail = (uid, tokenOpts = {}) => call(fake.tokenFor('admin', tokenOpts), { action: 'userDetail', uid })
const audit = () => fake.paths('adminAuditLog/').map((p) => fake.read(p)).sort((a, b) => a.timestamp.localeCompare(b.timestamp))

beforeEach(() => {
  fake = makeFakeAdmin()
  fake.install()
  fake.addAuthUser('admin', { email: OWNER })
  fake.addAuthUser('alice')
  process.env.ADMIN_EMAILS = OWNER
  logs = []
  for (const k of ['log', 'warn', 'error']) console[k] = (...a) => { logs.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')) }
  const mod = freshRequire('netlify/functions/admin-metrics.js')
  handler = mod.handler
  internals = mod._internals
})
afterEach(() => {
  mock.timers.reset()
  Object.assign(console, realConsole)
  delete process.env.ADMIN_EMAILS
  delete process.env.APP_CHECK_ENFORCE
})

describe('who may call it', () => {
  test('only a verified admin: not signed out, not a student, not an unverified or look-alike address', async () => {
    assert.equal(parse(await handler(makeEvent({ method: 'GET', headers: IP }))).status, 405)
    assert.equal((await call(undefined, {})).status, 401)
    assert.equal((await call('garbage', {})).status, 401)
    assert.equal((await call(fake.tokenFor('alice'), {})).status, 403)
    assert.equal((await dash({}, { emailVerified: false })).status, 403)
    assert.equal((await dash({}, { email: 'ADMIN-lookalike@example.test' })).status, 403)
    assert.equal((await dash({ action: 'userDetail', uid: 'alice' }, { email: 'admin@example.test.evil.io' })).status, 403)
    assert.equal(audit().length, 0)
    assert.equal((await dash()).status, 200)
  })

  test('the body is checked: JSON only, small, an object (and an empty body is the dashboard, as before)', async () => {
    const token = fake.tokenFor('admin')
    assert.equal(parse(await handler(makeEvent({ token, body: '{}', raw: true, headers: { ...IP, 'content-type': 'text/plain' } }))).status, 415)
    assert.equal(parse(await handler(makeEvent({ token, body: '{nope', raw: true, headers: IP }))).status, 400)
    assert.equal((await call(token, [1])).status, 400)
    assert.equal((await call(token, { pad: 'x'.repeat(5000) })).status, 413)
    assert.equal((await call(token, undefined)).status, 200)
    for (const action of [7, null, {}, ['userDetail'], 'dropEverything', '__proto__']) assert.equal((await call(token, { action })).status, 400, JSON.stringify(action))
  })

  test('answers are never cacheable and CORS is limited to the app\'s own origins', async () => {
    const ok = await call(fake.tokenFor('admin'), {}, { headers: { ...IP, origin: 'https://www.revisionflow.co.uk' } })
    assert.equal(ok.headers['Cache-Control'], 'no-store')
    assert.equal(ok.headers['Access-Control-Allow-Origin'], 'https://www.revisionflow.co.uk')
    const evil = await call(fake.tokenFor('admin'), {}, { headers: { ...IP, origin: 'https://evil.example' } })
    assert.equal(evil.headers['Access-Control-Allow-Origin'], undefined)
  })

  test('with APP_CHECK_ENFORCE=true a request without a valid App Check token is refused', async () => {
    assert.equal((await dash()).status, 200)
    process.env.APP_CHECK_ENFORCE = 'true'
    assert.equal((await dash()).status, 401)
    assert.equal(parse(await handler(makeEvent({ token: fake.tokenFor('admin'), body: {}, headers: { ...IP, 'x-firebase-appcheck': fake.appCheckToken } }))).status, 200)
  })
})

describe('the dashboard', () => {
  function seedPeople() {
    fake.seed({
      'users/p1': { displayName: 'Paying Monthly', email: 'p1@example.test', isPro: true, stripePlan: 'monthly', createdAt: ts(1), onboardingComplete: true, xp: 100, streak: 3, lastLogin: ts(0) },
      'users/p2': { displayName: 'Paying Annual', email: 'p2@example.test', isPro: true, stripePlan: 'annual', createdAt: ts(3), onboardingComplete: true, xp: 300, streak: 0, lastLogin: ts(2) },
      'users/p3': { displayName: 'Beta', email: 'p3@example.test', isPro: true, betaUser: true, createdAt: ts(10), xp: 0, lastLogin: ts(20) },
      'users/p4': { displayName: 'Free', email: 'p4@example.test', createdAt: ts(0), xp: 200, streak: 1 },
      'users/p5': { displayName: 'Old, failed payment', email: 'p5@example.test', stripePaymentFailed: true, createdAt: ts(40), xp: 'not a number' },
    })
  }

  test('numbers come out exactly (revenue is an estimate from stored plan flags; beta users are not paying)', async () => {
    seedPeople()
    const r = await dash()
    assert.equal(r.status, 200)
    const m = r.json
    assert.deepEqual(m.totals, { totalUsers: 5, betaCount: 1, payingCount: 2, freeCount: 2 })
    assert.equal(m.revenue.monthlyPayers, 1)
    assert.equal(m.revenue.annualPayers, 1)
    assert.equal(m.revenue.mrrGbp, Math.round((internals.MONTHLY_PRICE_GBP + internals.ANNUAL_PRICE_GBP / 12) * 100) / 100)
    assert.equal(m.revenue.arrGbp, Math.round((internals.MONTHLY_PRICE_GBP + internals.ANNUAL_PRICE_GBP / 12) * 12 * 100) / 100)
    assert.equal(m.revenue.paymentFailedCount, 1)
    assert.equal(m.revenue.conversionRate, 40)
    assert.equal(m.growth.signupsLast7, 3)           // p1, p2, p4  (p3 is 10 days old, p5 is 40)
    assert.equal(m.growth.signupsLast30, 4)          // + p3
    assert.equal(Object.values(m.growth.signupsByDay).reduce((a, b) => a + b, 0), 4)
    assert.deepEqual({ rate: m.activation.onboardingCompletionRate, n: m.activation.onboardedCount, active: m.activation.activeLast7Estimate }, { rate: 40, n: 2, active: 2 })
    assert.deepEqual(m.engagement, { avgXp: 120, usersWithActiveStreak: 2 })    // (100+300+0+200+0)/5, streak > 0: p1 and p4
    assert.ok(Array.isArray(m.notes) && m.notes.length >= 3)
  })

  test('only aggregate numbers about students leave the dashboard (no names, e-mail addresses or ids)', async () => {
    seedPeople()
    const text = JSON.stringify((await dash()).json)
    for (const secret of ['p1@example.test', 'Paying Monthly', 'Beta', 'users/p1', '"p1"', 'p5@example.test']) assert.ok(!text.includes(secret), 'leaked: ' + secret)
  })

  test('there is no cap on how many users are counted (it pages through the whole collection)', async () => {
    fake.seed(Object.fromEntries(Array.from({ length: 2350 }, (_, i) => [`users/bulk${String(i).padStart(5, '0')}`, { createdAt: ts(1), xp: 10 }])))
    const r = await dash()
    assert.equal(r.json.totals.totalUsers, 2350)
    assert.equal(r.json.engagement.avgXp, 10)
  })

  test('AI usage is call counts for the last seven days, bucketed by the UTC date the counters are stamped with', async () => {
    fake.seed({
      'users/u1/usage/aiCalls': { date: utcDay(0), count: 5 },
      'users/u1/usage/imageScans': { date: utcDay(0), count: 2 },
      'users/u2/usage/aiCalls': { date: utcDay(0), count: 7 },
      'users/u2/usage/advisorChats': { date: utcDay(3), count: 4 },
      'users/u3/usage/essayFeedback': { date: utcDay(6), count: 1 },
      'users/u3/usage/aiCalls': { date: utcDay(10), count: 99 },      // too old
      'users/u4/usage/mystery': { date: utcDay(0), count: 'many' },   // not a number: counted as 0, not NaN
    })
    const ai = (await dash()).json.aiUsage
    assert.equal(ai.available, true)
    assert.equal(ai.totalCallsToday, 14)
    assert.equal(ai.totalCallsWeek, 19)
    assert.equal(ai.activeAiUsersToday, 3)
    assert.deepEqual(ai.byFeatureToday.map((f) => [f.key, f.count]), [['aiCalls', 12], ['imageScans', 2], ['mystery', 0]])
    assert.equal(ai.byFeatureToday[0].label, 'AI Advisor / general chat (daily cap)')
    assert.deepEqual(ai.byFeatureWeek.map((f) => f.key), ['aiCalls', 'advisorChats', 'imageScans', 'essayFeedback', 'mystery'])
  })

  test('just after midnight in British Summer Time the counters (dated in UTC) still land in "today"', async () => {
    // 23:30 UTC on 15 June is 00:30 on 16 June in London. tutor.js stamps its counters 2026-06-15.
    mock.timers.enable({ apis: ['Date'], now: Date.UTC(2026, 5, 15, 23, 30) })
    fake.seed({ 'users/u1/usage/aiCalls': { date: '2026-06-15', count: 9 }, 'users/u1/usage/imageScans': { date: '2026-06-14', count: 1 } })
    const ai = (await dash()).json.aiUsage
    assert.equal(ai.totalCallsToday, 9)
    assert.equal(ai.totalCallsWeek, 10)
  })

  test('if the AI usage query fails the rest of the dashboard still loads, with a short, scrubbed reason', async () => {
    seedPeople()
    fake.failNext({ op: 'query', path: '*group*/usage' }, new Error('9 FAILED_PRECONDITION: needs an index for projects/p/databases/(default)/documents/users/alice/usage (alice@example.test)'), { times: 3 })
    const r = await dash()
    assert.equal(r.status, 200)
    assert.equal(r.json.totals.totalUsers, 5)
    assert.equal(r.json.aiUsage.available, false)
    assert.match(r.json.aiUsage.error, /needs an index/)
    const text = r.json.aiUsage.error + logs.join('\n')
    assert.ok(!text.includes('alice@example.test') && !text.includes('users/alice'))
  })

  test('the recent audit trail comes back newest first, and each look at the dashboard is recorded with the verified admin', async () => {
    fake.seed({ 'adminAuditLog/a1': { action: 'setUserField', actorEmail: OWNER, details: {}, timestamp: '2026-11-01T10:00:00.000Z' }, 'adminAuditLog/a2': { action: 'contentApprove', actorEmail: OWNER, details: {}, timestamp: '2026-11-02T10:00:00.000Z' } })
    const r = await dash()
    assert.deepEqual(r.json.auditLog.map((a) => a.action), ['contentApprove', 'setUserField'])
    const mine = audit().filter((a) => a.action === 'viewMetrics')
    assert.equal(mine.length, 1)
    assert.deepEqual({ email: mine[0].actorEmail, uid: mine[0].actorUid }, { email: OWNER, uid: 'admin' })
  })

  test('the dashboard (aggregate numbers only) still loads if its own audit entry cannot be written', async () => {
    seedPeople()
    fake.failNext({ op: 'set', path: /^adminAuditLog\// }, new Error('audit store down'), { times: 5 })
    const r = await dash()
    assert.equal(r.status, 200)
    assert.equal(r.json.totals.totalUsers, 5)
    assert.ok(logs.some((l) => l.includes('could not record a dashboard view')))
  })

  test('the full scan is rate limited per admin (60 an hour) so a stolen token cannot run up reads', async () => {
    for (let i = 0; i < 60; i++) assert.equal((await dash()).status, 200, 'refresh ' + i)
    const r = await dash()
    assert.equal(r.status, 429)
    assert.ok(Number(r.headers['Retry-After']) >= 1)
    assert.equal((await detail('alice')).status, 404, 'the student view has its own, separate allowance (this user has no document)')
  })
})

describe('one student\'s record', () => {
  const seedAlice = () => fake.seed({
    'users/alice': { displayName: 'Alice', email: 'alice@example.test', createdAt: ts(30), qualification: 'GCSE', xp: 250, level: 3, streak: 5, onboardingComplete: true, lastLogin: ts(1),
      subjects: [{ name: 'Maths', board: 'AQA', secret: 'x' }, { name: 'Biology' }, null, 'junk'],
      isPro: true, stripePlan: 'monthly', stripeSubStatus: 'active', stripeCurrentPeriodEnd: 1893456000, stripePaymentFailed: false, proActivatedAt: '2026-10-01',
      stripeCustomerId: 'cus_SHOULD_NOT_LEAVE', pushSubscription: { endpoint: 'https://fcm.googleapis.com/x' } },
    'users/alice/sessions/s1': { completed: true }, 'users/alice/sessions/s2': { completed: true }, 'users/alice/sessions/s3': { completed: false },
    'users/alice/paperAttempts/p1': { grade: '6' },
    'users/alice/quizResults/q1': { score: 3 }, 'users/alice/quizResults/q2': { score: 4 },
    'users/alice/mistakes/m1': { resolved: false }, 'users/alice/mistakes/m2': { resolved: true }, 'users/alice/mistakes/m3': { resolved: false },
    'users/alice/notes/n1': { text: 'private note text' },
  })

  test('the record is returned (counts, plan, profile) and nothing else: no payment ids, no push subscription, no note text', async () => {
    seedAlice()
    const r = await detail('alice')
    assert.equal(r.status, 200)
    assert.deepEqual(r.json.activity, { sessionsCompleted: 2, paperAttempts: 1, quizResults: 2, mistakesLogged: 3, mistakesUnresolved: 2, notesWritten: 1 })
    assert.equal(r.json.profile.name, 'Alice')
    assert.equal(r.json.profile.email, 'alice@example.test')
    assert.deepEqual(r.json.profile.subjects, [{ name: 'Maths', board: 'AQA' }, { name: 'Biology', board: null }])
    assert.equal(r.json.subscription.isPro, true)
    assert.equal(r.json.subscription.stripePlan, 'monthly')
    const text = JSON.stringify(r.json)
    for (const secret of ['cus_SHOULD_NOT_LEAVE', 'fcm.googleapis.com', 'private note text', '"secret"']) assert.ok(!text.includes(secret), 'leaked: ' + secret)
  })

  test('looking at a record is written to the audit trail BEFORE it is read, with the verified admin and the account looked at', async () => {
    seedAlice()
    fake.failNext({ op: 'set', path: /^adminAuditLog\// }, new Error('audit store down'), { times: 1 })
    const refused = await detail('alice')
    assert.equal(refused.status, 500)
    assert.ok(!JSON.stringify(refused.json).includes('alice@example.test'), 'no record was returned when it could not be recorded')
    assert.equal(audit().length, 0)

    const ok = await detail('alice')
    assert.equal(ok.status, 200)
    assert.deepEqual(audit().map((a) => [a.action, a.details, a.actorEmail, a.actorUid]), [['viewUserDetail', { uid: 'alice' }, OWNER, 'admin']])
  })

  test('an unknown student is a 404, a bad id is a 400 and is not recorded', async () => {
    assert.equal((await detail('nobody')).status, 404)
    for (const uid of [undefined, null, 7, '', 'a/b', '../users/alice', ['alice'], { a: 1 }, 'x'.repeat(129), 'has space']) {
      const before = audit().length
      assert.equal((await call(fake.tokenFor('admin'), { action: 'userDetail', uid })).status, 400, JSON.stringify(uid))
      assert.equal(audit().length, before)
    }
  })

  test('a malformed record does not take the screen down', async () => {
    fake.seed({ 'users/weird': { displayName: { a: 1 }, subjects: 'not a list', createdAt: 'yesterday', lastLogin: 12345 } })
    const r = await detail('weird')
    assert.equal(r.status, 200)
    assert.deepEqual(r.json.profile.subjects, [])
    assert.equal(r.json.profile.createdAt, null)
  })
})

describe('errors and logs', () => {
  test('an unexpected failure is a generic 500, and nothing identifying reaches the response or the logs', async () => {
    const token = fake.tokenFor('admin')
    fake.failNext({ op: 'query', path: 'users' }, new Error('boom reading projects/p/databases/(default)/documents/users/alice for alice@example.test'), { times: 3 })
    const r = await call(token, {})
    assert.equal(r.status, 500)
    assert.deepEqual(r.json, { error: 'Something went wrong. Please try again.', code: 'server_error' })
    const text = logs.join('\n') + JSON.stringify(r.json)
    for (const secret of ['alice@example.test', 'users/alice', token, OWNER]) assert.ok(!text.includes(secret), 'leaked: ' + secret)
  })
})
