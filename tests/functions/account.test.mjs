// tests/functions/account.test.mjs
// netlify/functions/account.js (server-side account deletion) against the FAKE Admin SDK and a FAKE Stripe API.
// Fakes, not the emulator: they prove OUR logic (ordering, idempotency, retry, what is and is not deleted), not Firebase itself.
import { describe, test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { makeFakeAdmin, installFakeStripe, freshRequire, makeEvent, parse } from '../helpers/fakeAdmin.js'

const ENV_KEYS = ['STRIPE_SECRET_KEY', 'ACCOUNT_DELETE_BUDGET_MS', 'APP_CHECK_ENFORCE']
const savedEnv = {}
let fake, stripeFake, handler, internals

function makeStripe(subs) {
  const calls = []
  const err = (code) => Object.assign(new Error(code), { code })
  const state = { subs, failCancel: null, cancelLeavesActive: false }
  return {
    state, calls,
    subscriptions: {
      list: async (p) => { calls.push(['list', p.customer]); if (p.customer === 'cus_unknown') throw err('resource_missing'); return { data: Object.values(state.subs).filter((s) => s.customer === p.customer).map((s) => ({ ...s })), has_more: false } },
      retrieve: async (id) => { calls.push(['retrieve', id]); if (!state.subs[id]) throw err('resource_missing'); return { ...state.subs[id] } },
      cancel: async (id) => { calls.push(['cancel', id]); if (state.failCancel) { const e = state.failCancel; state.failCancel = null; throw e } if (!state.cancelLeavesActive) state.subs[id].status = 'canceled'; return { ...state.subs[id] } },
    },
    customers: { del: async () => { throw new Error('the Stripe customer record must never be deleted: it holds invoices we must retain') } },
  }
}

// Alice is the student being deleted. Everything else must survive, apart from references to her.
function seedWorld() {
  for (const uid of ['alice', 'bob', 'carol', 'dave']) fake.addAuthUser(uid)
  fake.seed({
    'users/alice': { displayName: 'Alice', profile: { email: 'alice@example.test' }, friends: ['bob', 'carol'], stripeCustomerId: 'cus_a', stripeSubId: 'sub_a', pushSubscription: { endpoint: 'https://push.example/x' }, xp: 500 },
    'users/alice/topics/t1': { confidence: 3 }, 'users/alice/sessions/s1': { minutes: 30 }, 'users/alice/notes/n1': { text: 'private note' },
    'users/alice/flashcardSets/f1': { title: 'Mine' }, 'users/alice/xpEvents/e1': { amount: 5 }, 'users/alice/usage/2026-11': { tutor: 4 },
    'users/bob': { displayName: 'Bob', friends: ['alice', 'carol'], referredBy: 'alice', referredAt: 1 },
    'users/carol': { displayName: 'Carol', friends: ['alice', 'bob'] },
    'users/dave': { displayName: 'Dave', friends: ['bob'] },
    'friendRequests/alice_dave': { from: 'alice', to: 'dave', fromName: 'Alice' },
    'friendRequests/erin_alice': { from: 'erin', to: 'alice', fromName: 'Erin' },
    'friendRequests/bob_carol': { from: 'bob', to: 'carol', fromName: 'Bob' },
    'friendPairs/p_ab': { members: ['alice', 'bob'] }, 'friendPairs/p_bc': { members: ['bob', 'carol'] },
    'publicFlashcards/set_alice1': { uid: 'alice', title: 'A1' }, 'publicFlashcards/set_alice2': { uid: 'alice', title: 'A2' }, 'publicFlashcards/set_dave': { uid: 'dave', title: 'D' },
    'stripeEvents/evt_1': { type: 'x', state: 'done' },
    // Shared AI-flashcard cache: generated content that other students use. The ids are neutral on purpose (no student name).
    'flashcardCache/cache_1': { board: 'AQA', level: 'GCSE', subject: 'Biology', topic: 'Cells', cards: [{ q: 'Q1', a: 'A1' }], views: 3, createdBy: 'alice' },
    'flashcardCache/cache_2': { board: 'AQA', level: 'GCSE', subject: 'Biology', topic: 'Enzymes', cards: [{ q: 'Q2', a: 'A2' }], views: 1, createdBy: 'bob' },
    'flashcardCache/cache_3': { board: 'AQA', level: 'GCSE', subject: 'Biology', topic: 'Osmosis', cards: [{ q: 'Q3', a: 'A3' }], views: 2 },
  })
}

const call = async (token, body, extra) => parse(await handler(makeEvent({ token, body, ...extra })))
const tok = (uid = 'alice', opts) => fake.tokenFor(uid, opts)
const dump = () => fake.paths('').map((p) => p + ' ' + JSON.stringify(fake.read(p))).join('\n')
const alicePaths = () => fake.paths('users/alice')

beforeEach(() => {
  for (const k of ENV_KEYS) savedEnv[k] = process.env[k]
  process.env.STRIPE_SECRET_KEY = 'sk_test_unit'; delete process.env.ACCOUNT_DELETE_BUDGET_MS; delete process.env.APP_CHECK_ENFORCE
  fake = makeFakeAdmin(); fake.install()
  seedWorld()
  stripeFake = makeStripe({ sub_a: { id: 'sub_a', customer: 'cus_a', status: 'active' } })
  installFakeStripe(stripeFake)
  const mod = freshRequire('netlify/functions/account.js')
  handler = mod.handler; internals = mod._internals
})
afterEach(() => { for (const k of ENV_KEYS) { if (savedEnv[k] === undefined) delete process.env[k]; else process.env[k] = savedEnv[k] } })

describe('a complete deletion', () => {
  test('removes the profile and EVERY subcollection, the sign-in record, and every reference in other students\' data; keeps everyone else\'s', async () => {
    const r = await call(tok(), { action: 'delete' })
    assert.equal(r.status, 200); assert.deepEqual(r.json, { state: 'completed' })
    assert.deepEqual(alicePaths(), [], 'users/alice and all subcollections must be gone')
    assert.equal(fake.authUsers.has('alice'), false)
    assert.deepEqual(fake.read('users/bob').friends, ['carol']); assert.deepEqual(fake.read('users/carol').friends, ['bob'])
    assert.equal(fake.read('users/bob').referredBy, undefined); assert.equal(fake.read('users/bob').referredAt, undefined)
    assert.equal(fake.exists('friendRequests/alice_dave'), false); assert.equal(fake.exists('friendRequests/erin_alice'), false)
    assert.ok(fake.exists('friendRequests/bob_carol'))
    assert.equal(fake.exists('friendPairs/p_ab'), false); assert.ok(fake.exists('friendPairs/p_bc'))
    assert.equal(fake.exists('publicFlashcards/set_alice1'), false); assert.equal(fake.exists('publicFlashcards/set_alice2'), false)
    assert.ok(fake.exists('publicFlashcards/set_dave'))
    assert.deepEqual(fake.read('users/dave').friends, ['bob']); assert.ok(fake.authUsers.has('bob'))
    assert.ok(fake.exists('stripeEvents/evt_1'))
    // The shared flashcard cache keeps every entry and its content (other students use them); only Alice's id is taken off hers.
    assert.deepEqual(fake.read('flashcardCache/cache_1'), { board: 'AQA', level: 'GCSE', subject: 'Biology', topic: 'Cells', cards: [{ q: 'Q1', a: 'A1' }], views: 3 })
    assert.equal(fake.read('flashcardCache/cache_2').createdBy, 'bob')
    assert.equal('createdBy' in fake.read('flashcardCache/cache_3'), false)
  })

  test('the subscription is cancelled AND confirmed, and the Stripe customer record is never deleted', async () => {
    await call(tok(), { action: 'delete' })
    assert.equal(stripeFake.state.subs.sub_a.status, 'canceled')
    assert.deepEqual(stripeFake.calls.map((c) => c[0]).filter((n) => n === 'cancel'), ['cancel'])
    const names = stripeFake.calls.map((c) => c[0]); assert.ok(names.lastIndexOf('retrieve') > names.indexOf('cancel'), 'it must re-read the subscription after cancelling')
  })

  test('the job record and the logs hold no uid, e-mail, name or content', async () => {
    const logs = []
    const orig = { log: console.log, warn: console.warn, error: console.error }
    console.log = (...a) => logs.push(a.join(' ')); console.warn = console.log; console.error = console.log
    try { await call(tok(), { action: 'delete' }) } finally { Object.assign(console, orig) }
    const jobPaths = fake.paths('accountDeletions/'); assert.equal(jobPaths.length, 1)
    const job = fake.read(jobPaths[0])
    assert.equal(job.state, 'completed'); assert.ok(job.expiresAt instanceof Date)
    const everything = jobPaths.join('\n') + JSON.stringify(job) + logs.join('\n')
    for (const secret of ['alice', 'alice@example.test', 'Alice']) assert.ok(!everything.includes(secret), `"${secret}" must not appear in the job record or logs`)
    // and nothing about her is left anywhere else in the database
    assert.ok(!/alice/i.test(dump().replace(/accountDeletions\/[^\n]*\n?/g, '')), 'no remaining document may mention the deleted student')
  })

  test('works for a student who never paid, without touching Stripe', async () => {
    fake.seed({ 'users/alice': { displayName: 'Alice', friends: [] } })
    const r = await call(tok(), { action: 'delete' })
    assert.equal(r.status, 200); assert.equal(stripeFake.calls.length, 0)
  })

  test('the shared-cache step clears only this student\'s id, however many entries there are (more than one page), and deletes nothing', async () => {
    const many = {}
    for (let i = 0; i < 450; i++) many[`flashcardCache/bulk_${i}`] = { board: 'AQA', level: 'GCSE', subject: 'Biology', topic: 'T' + i, cards: [], views: 1, createdBy: i % 2 ? 'alice' : 'bob' }
    fake.seed(many)
    const r = await call(tok(), { action: 'delete' })
    assert.equal(r.status, 200)
    const left = fake.paths('flashcardCache/').map((p) => fake.read(p))
    assert.equal(left.length, 453, 'no cache entry may be deleted')
    assert.equal(left.filter((d) => d.createdBy === 'alice').length, 0)
    assert.equal(left.filter((d) => d.createdBy === 'bob').length, 226, 'other students\' entries are untouched (225 bulk + 1)')
  })
})

describe('who may delete, and when', () => {
  test('needs a verified token, a recent sign-in and the right method; the body can never name another account', async () => {
    assert.equal((await call(undefined, { action: 'delete' })).status, 401)
    assert.equal((await call('garbage', { action: 'delete' })).status, 401)
    assert.equal(parse(await handler(makeEvent({ method: 'GET', token: tok() }))).status, 405)
    assert.equal((await call(tok(), { action: 'erase-all' })).status, 400)
    assert.equal(alicePaths().length > 0, true)
    const r = await call(tok('alice'), { action: 'delete', uid: 'bob', targetUid: 'bob' })
    assert.equal(r.status, 200)
    assert.ok(fake.exists('users/bob') && fake.authUsers.has('bob'), 'bob must be untouched')
    assert.deepEqual(alicePaths(), [])
  })

  test('a sign-in older than five minutes is refused with a code the app can act on, and nothing is changed or contacted', async () => {
    const r = await call(tok('alice', { authAgeSeconds: internals.RECENT_LOGIN_SECONDS + 60 }), { action: 'delete' })
    assert.equal(r.status, 401); assert.equal(r.json.code, 'recent_login_required')
    assert.ok(alicePaths().length > 0); assert.ok(fake.authUsers.has('alice')); assert.equal(stripeFake.calls.length, 0)
    assert.equal(fake.paths('accountDeletions/').length, 0)
  })

  test('a token belonging to an account that has already been deleted is refused (the app treats that as "already deleted")', async () => {
    await call(tok(), { action: 'delete' })
    const again = await call(tok(), { action: 'delete' })
    assert.equal(again.status, 401)
  })

  test('an e-mail/password student whose session was revoked cannot delete', async () => {
    fake.authUsers.get('alice').tokensValidAfter = Math.floor(Date.now() / 1000) + 3600
    assert.equal((await call(tok(), { action: 'delete' })).status, 401)
    assert.ok(alicePaths().length > 0)
  })

  test('deleting is rate limited per student: once the hourly allowance is used up the answer is 429 and nothing is deleted', async () => {
    const { hashKey } = freshRequire('netlify/functions/lib/rateLimit.js')
    fake.seed({ [`rateLimits/${hashKey('account.delete', 'alice')}`]: { route: 'account.delete', count: 120, windowStart: Date.now() } })
    handler = freshRequire('netlify/functions/account.js').handler
    const r = await call(tok(), { action: 'delete' })
    assert.equal(r.status, 429); assert.equal(r.json.code, 'rate_limited'); assert.ok(Number(r.headers['Retry-After']) >= 1)
    assert.ok(alicePaths().length > 0); assert.equal(stripeFake.calls.length, 0)
  })
})

describe('when something goes wrong', () => {
  test('if billing cannot be stopped NOTHING is deleted: not the data, not the sign-in record', async () => {
    stripeFake.state.failCancel = Object.assign(new Error('stripe is down SECRET-detail'), { type: 'StripeConnectionError' })
    const r = await call(tok(), { action: 'delete' })
    assert.equal(r.status, 503); assert.equal(r.json.state, 'failed'); assert.equal(r.json.code, 'deletion_incomplete')
    assert.ok(!JSON.stringify(r.json).includes('SECRET'))
    assert.ok(alicePaths().length > 0); assert.ok(fake.authUsers.has('alice'))
    assert.deepEqual(fake.read('users/bob').friends, ['alice', 'carol'])
    const job = fake.read(fake.paths('accountDeletions/')[0]); assert.equal(job.state, 'failed'); assert.equal(job.failure.step, 'subscription')
    assert.equal((await call(tok(), { action: 'delete' })).status, 200)            // and a retry then completes
    assert.deepEqual(alicePaths(), [])
  })

  test('if the shared-cache step fails, the profile and the sign-in record are still there, and a retry finishes', async () => {
    fake.failNext({ op: 'update', path: /^flashcardCache\// }, new Error('boom'), { times: 1 })
    const first = await call(tok(), { action: 'delete' })
    assert.equal(first.status, 503)
    assert.ok(alicePaths().length > 0, 'the profile must still be there'); assert.ok(fake.authUsers.has('alice'))
    const job = fake.read(fake.paths('accountDeletions/')[0]); assert.equal(job.failure.step, 'shared_cache')
    assert.equal((await call(tok(), { action: 'delete' })).status, 200)
    assert.deepEqual(alicePaths(), []); assert.equal('createdBy' in fake.read('flashcardCache/cache_1'), false)
  })

  test('a cancellation that Stripe does not actually carry out is treated as a failure, not as success', async () => {
    stripeFake.state.cancelLeavesActive = true
    const r = await call(tok(), { action: 'delete' })
    assert.equal(r.status, 503); assert.ok(alicePaths().length > 0); assert.ok(fake.authUsers.has('alice'))
  })

  test('without Stripe configured, a student who has a subscription cannot be deleted (it could not be cancelled); one without can', async () => {
    delete process.env.STRIPE_SECRET_KEY
    handler = freshRequire('netlify/functions/account.js').handler
    assert.equal((await call(tok(), { action: 'delete' })).status, 503)
    assert.ok(alicePaths().length > 0)
    fake.seed({ 'users/bob': { displayName: 'Bob', friends: [] } })
    assert.equal((await call(tok('bob'), { action: 'delete' })).status, 200)
  })

  test('a customer id from the other Stripe mode does not block deletion', async () => {
    fake.seed({ 'users/alice': { displayName: 'Alice', friends: [], stripeCustomerId: 'cus_unknown' } })
    assert.equal((await call(tok(), { action: 'delete' })).status, 200)
  })

  test('interrupted while deleting data: the sign-in record survives so the student can retry; the retry skips finished steps and completes', async () => {
    fake.failNext({ op: 'recursiveDelete', path: 'users/alice' }, new Error('timeout'), { times: 1 })
    const first = await call(tok(), { action: 'delete' })
    assert.equal(first.status, 503)
    assert.ok(fake.authUsers.has('alice'), 'the sign-in record must outlive a failed data deletion')
    const job = fake.read(fake.paths('accountDeletions/')[0])
    assert.deepEqual(job.done.slice(0, 7), ['subscription', 'friend_links', 'friend_requests', 'friend_pairs', 'shared_content', 'referrals', 'shared_cache'])
    assert.equal(job.failure.step, 'account_data')
    const cancelsBefore = stripeFake.calls.filter((c) => c[0] === 'cancel').length
    const second = await call(tok(), { action: 'delete' })
    assert.equal(second.status, 200)
    assert.equal(stripeFake.calls.filter((c) => c[0] === 'cancel').length, cancelsBefore, 'finished steps must not be repeated')
    assert.deepEqual(alicePaths(), []); assert.equal(fake.authUsers.has('alice'), false)
  })

  test('if removing the sign-in record fails the data is already gone, the job reports failure, and a retry finishes', async () => {
    fake.failNext({ op: 'deleteUser' }, new Error('auth unavailable'), { times: 1 })
    assert.equal((await call(tok(), { action: 'delete' })).status, 503)
    assert.deepEqual(alicePaths(), []); assert.ok(fake.authUsers.has('alice'))
    assert.equal((await call(tok(), { action: 'delete' })).status, 200)
    assert.equal(fake.authUsers.has('alice'), false)
  })

  test('a profile re-created by another open tab while the job runs is removed by the final sweep', async () => {
    const authApi = fake.admin.auth()
    const realDeleteUser = authApi.deleteUser
    let recreated = false
    authApi.deleteUser = async (uid) => {
      await realDeleteUser(uid)
      if (!recreated) { recreated = true; await fake.db.doc('users/alice').set({ displayName: 'recreated by a stale tab' }) }
    }
    assert.equal((await call(tok(), { action: 'delete' })).status, 200)
    assert.ok(recreated)
    assert.deepEqual(alicePaths(), [])
  })

  test('only one run at a time: while another call holds the lease the answer is 202 and nothing is executed; an expired lease is taken over', async () => {
    const id = internals.jobIdFor('alice')
    fake.seed({ [`accountDeletions/${id}`]: { state: 'running', step: 'friend_links', done: ['subscription'], attempts: 1, leaseUntil: Date.now() + 60000 } })
    const busy = await call(tok(), { action: 'delete' })
    assert.equal(busy.status, 202); assert.equal(busy.json.state, 'running')
    assert.ok(alicePaths().length > 0)
    fake.seed({ [`accountDeletions/${id}`]: { state: 'running', step: 'friend_links', done: ['subscription'], attempts: 1, leaseUntil: Date.now() - 1000 } })
    assert.equal((await call(tok(), { action: 'delete' })).status, 200)
    assert.deepEqual(alicePaths(), [])
  })

  test('a job already recorded as completed answers "completed" without repeating anything', async () => {
    const id = internals.jobIdFor('alice')
    fake.seed({ [`accountDeletions/${id}`]: { state: 'completed', done: [...internals.STEPS], attempts: 1 } })
    const r = await call(tok(), { action: 'delete' })
    assert.deepEqual(r.json, { state: 'completed' }); assert.equal(stripeFake.calls.length, 0); assert.ok(alicePaths().length > 0, 'it must not redo work for a completed record')
  })

  test('with a tiny time budget each call still makes progress and 202 asks the client to call again, ending in the same result', async () => {
    process.env.ACCOUNT_DELETE_BUDGET_MS = '0'
    handler = freshRequire('netlify/functions/account.js').handler
    let r, calls = 0
    do { r = await call(tok(), { action: 'delete' }); calls++ ; if (r.status === 202) assert.equal(r.json.state, 'running') } while (r.status === 202 && calls < 30)
    assert.equal(r.status, 200); assert.ok(calls > 1 && calls <= internals.STEPS.length)
    assert.deepEqual(alicePaths(), []); assert.equal(fake.authUsers.has('alice'), false)
  })
})

describe('status', () => {
  test('reports none / running / failed / completed from the job record and needs only a valid session', async () => {
    assert.deepEqual((await call(tok('alice', { authAgeSeconds: 99999 }), { action: 'status' })).json, { state: 'none' })
    const id = internals.jobIdFor('alice')
    fake.seed({ [`accountDeletions/${id}`]: { state: 'running', step: 'friend_links', leaseUntil: Date.now() + 60000 } })
    assert.deepEqual((await call(tok(), { action: 'status' })).json, { state: 'running', step: 'friend_links' })
    fake.seed({ [`accountDeletions/${id}`]: { state: 'running', step: 'friend_links', leaseUntil: Date.now() - 1 } })
    assert.equal((await call(tok(), { action: 'status' })).json.state, 'failed')
    assert.equal((await call(undefined, { action: 'status' })).status, 401)
  })
})
