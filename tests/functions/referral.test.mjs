// tests/functions/referral.test.mjs
// Unit tests of netlify/functions/referral.js against the FAKE Admin SDK in tests/helpers/fakeAdmin.js (not the emulator).
import { describe, test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { makeFakeAdmin, freshRequire, makeEvent, parse } from '../helpers/fakeAdmin.js'

let fake, handler, internals
const IP = { 'x-nf-client-connection-ip': '203.0.113.7' }
const call = async (token, body, extra = {}) => parse(await handler(makeEvent({ token, body, headers: IP, ...extra })))
const tok = (uid) => fake.tokenFor(uid)

// A referral code is the first 8 characters of the uid, upper-cased (src/utils/referrals.js).
const OWNER = 'ownerAB12CDEFGH'        // -> OWNERAB1
const OWNER_CODE = 'OWNERAB1'

beforeEach(() => {
  fake = makeFakeAdmin()
  fake.install()
  for (const uid of [OWNER, 'newKid0001', 'newKid0002', 'mallory0001', 'bystander01']) fake.addAuthUser(uid)
  fake.seed({
    [`users/${OWNER}`]: { displayName: 'Olive Owner', referralCode: OWNER_CODE, xp: 1000, badges: [], email: 'owner@example.test', friends: ['someone'] },
    'users/newKid0001': { displayName: 'Nia', referralCode: 'NEWKID00', xp: 0, badges: [] },
    'users/newKid0002': { displayName: 'Noor', referralCode: 'NEWKID00', xp: 0, badges: [] },
    'users/mallory0001': { displayName: 'Mallory', referralCode: 'MALLORY0', xp: 0, badges: [] },
    'users/bystander01': { displayName: 'Bea', referralCode: 'BYSTANDE', xp: 5, badges: [] },
  })
  const mod = freshRequire('netlify/functions/referral.js')
  handler = mod.handler
  internals = mod._internals
})

describe('request plumbing', () => {
  test('wrong method, wrong content type, oversized body, bad JSON and an unknown action are refused', async () => {
    assert.equal(parse(await handler(makeEvent({ method: 'GET', headers: IP }))).status, 405)
    assert.equal(parse(await handler(makeEvent({ body: '{"action":"lookup"}', raw: true, headers: { ...IP, 'content-type': 'text/plain' } }))).status, 415)
    assert.equal((await call(undefined, { action: 'lookup', code: OWNER_CODE, pad: 'x'.repeat(2000) })).status, 413)
    assert.equal(parse(await handler(makeEvent({ body: '{nope', raw: true, headers: IP }))).status, 400)
    assert.equal((await call(undefined, { action: 'delete-everything' })).status, 400)
    assert.equal((await call(undefined, [1])).status, 400)
    assert.equal((await call(undefined, undefined)).status, 400)
  })

  test('responses are never cacheable and CORS is limited to the app\'s own origins', async () => {
    const ok = parse(await handler(makeEvent({ body: { action: 'lookup', code: OWNER_CODE }, headers: { ...IP, origin: 'https://www.revisionflow.co.uk' } })))
    assert.equal(ok.headers['Cache-Control'], 'no-store')
    assert.equal(ok.headers['Access-Control-Allow-Origin'], 'https://www.revisionflow.co.uk')
    const evil = parse(await handler(makeEvent({ body: { action: 'lookup', code: OWNER_CODE }, headers: { ...IP, origin: 'https://evil.example' } })))
    assert.equal(evil.headers['Access-Control-Allow-Origin'], undefined)
  })

  test('an unexpected failure is answered with a generic error, never the internal message', async () => {
    fake.failNext({ op: 'query', path: 'users' }, new Error('SECRET internal detail'))
    const r = await call(undefined, { action: 'lookup', code: OWNER_CODE })
    assert.equal(r.status, 500)
    assert.ok(!JSON.stringify(r.json).includes('SECRET'))
  })
})

describe('lookup (no sign-in)', () => {
  test('returns only a display name: no uid, e-mail, XP, friends or other profile data', async () => {
    const r = await call(undefined, { action: 'lookup', code: OWNER_CODE })
    assert.equal(r.status, 200)
    assert.deepEqual(r.json, { found: true, displayName: 'Olive Owner' })
    const text = JSON.stringify(r.json)
    for (const secret of [OWNER, 'owner@example.test', '1000', 'someone']) assert.ok(!text.includes(secret), secret)
  })

  test('the code may be typed in lower case or with spaces', async () => {
    assert.deepEqual((await call(undefined, { action: 'lookup', code: '  ownerab1 ' })).json, { found: true, displayName: 'Olive Owner' })
  })

  test('an unknown or malformed code finds nothing, and malformed codes never reach the database', async () => {
    assert.deepEqual((await call(undefined, { action: 'lookup', code: 'ZZZZZZZZ' })).json, { found: false })
    fake.failNext({ op: 'query', path: 'users' }, new Error('must not be reached'), { times: 50 })
    for (const bad of ['', 'SHORT', 'TOOLONG123', 'bad code', 'OWNER-B1', { $ne: 1 }, ['OWNERAB1'], null, 12345678]) {
      const r = await call(undefined, { action: 'lookup', code: bad })
      assert.equal(r.status, 200, JSON.stringify(bad))
      assert.deepEqual(r.json, { found: false }, JSON.stringify(bad))
    }
  })

  test('the name is cleaned (control characters removed, 100 character cap) and falls back to "a friend"', async () => {
    fake.seed({ [`users/${OWNER}`]: { displayName: 'O\u0000l\u0007ive' + 'x'.repeat(300), referralCode: OWNER_CODE } })
    const r = await call(undefined, { action: 'lookup', code: OWNER_CODE })
    assert.ok(!/[\u0000-\u001f]/.test(r.json.displayName)); assert.equal(r.json.displayName.length, 100)
    fake.seed({ [`users/${OWNER}`]: { referralCode: OWNER_CODE } })
    assert.equal((await call(undefined, { action: 'lookup', code: OWNER_CODE })).json.displayName, 'a friend')
  })

  test('is rate limited per caller address (429 with Retry-After) and the limiter stores no address', async () => {
    let last
    for (let i = 0; i < 31; i++) last = await call(undefined, { action: 'lookup', code: 'ZZZZZZZZ' })
    assert.equal(last.status, 429)
    assert.equal(last.json.code, 'rate_limited')
    assert.ok(Number(last.headers['Retry-After']) >= 1)
    const stored = JSON.stringify(fake.paths('rateLimits/').map((p) => fake.read(p)).concat(fake.paths('rateLimits/')))
    assert.ok(!stored.includes('203.0.113.7'))
    // A different address is unaffected.
    const other = parse(await handler(makeEvent({ body: { action: 'lookup', code: 'ZZZZZZZZ' }, headers: { 'x-nf-client-connection-ip': '198.51.100.9' } })))
    assert.equal(other.status, 200)
  })
})

describe('a code only counts for the account it really belongs to', () => {
  test('copying someone else\'s code into your own profile does not make lookup show your name', async () => {
    fake.seed({ 'users/mallory0001': { displayName: 'Mallory the Forger', referralCode: OWNER_CODE } })
    const r = await call(undefined, { action: 'lookup', code: OWNER_CODE })
    assert.deepEqual(r.json, { found: true, displayName: 'Olive Owner' })
  })

  test('a code stored only on an account whose uid does not produce it finds nothing', async () => {
    fake.seed({ 'users/mallory0001': { displayName: 'Mallory', referralCode: 'FORGED99', xp: 0, badges: [] } })
    assert.deepEqual((await call(undefined, { action: 'lookup', code: 'FORGED99' })).json, { found: false })
    const r = await call(tok('newKid0001'), { action: 'apply', code: 'FORGED99' })
    assert.deepEqual(r.json, { applied: false, reason: 'code_not_found' })
    assert.equal(fake.read('users/mallory0001').xp, 0)
    assert.deepEqual(fake.read('users/mallory0001').badges, [])
    assert.equal(fake.read('users/newKid0001').referredBy, undefined)
  })

  test('applying a copied code pays the REAL owner, never the account that copied it', async () => {
    fake.seed({ 'users/mallory0001': { displayName: 'Mallory', referralCode: OWNER_CODE, xp: 0, badges: [] } })
    const r = await call(tok('newKid0001'), { action: 'apply', code: OWNER_CODE })
    assert.deepEqual(r.json, { applied: true, rewarded: true })
    assert.equal(fake.read('users/newKid0001').referredBy, OWNER)
    assert.equal(fake.read(`users/${OWNER}`).xp, 1000 + internals.REFERRER_XP + internals.REFERRAL_BADGE.xp)
    assert.equal(fake.read('users/mallory0001').xp, 0)
    assert.deepEqual(fake.read('users/mallory0001').badges, [])
  })

  test('the real owner is still found when other profiles carry the same copied code', async () => {
    for (let i = 0; i < 20; i++) fake.seed({ [`users/a${String(i).padStart(2, '0')}forged`]: { displayName: 'forger ' + i, referralCode: OWNER_CODE } })
    assert.deepEqual((await call(undefined, { action: 'lookup', code: OWNER_CODE })).json, { found: true, displayName: 'Olive Owner' })
  })

  test('the code is re-checked inside the transaction: an owner who changed it in the meantime is not paid', async () => {
    // runTransaction call #1 is the rate limiter, call #2 is the referral itself: change the owner's stored code just before #2.
    const original = fake.db.runTransaction
    let calls = 0
    fake.db.runTransaction = async (fn) => {
      calls++
      if (calls === 2) fake.seed({ [`users/${OWNER}`]: { displayName: 'Olive Owner', referralCode: 'CHANGED1', xp: 1000, badges: [] } })
      return original(fn)
    }
    const r = await call(tok('newKid0001'), { action: 'apply', code: OWNER_CODE })
    assert.equal(calls, 2)
    assert.deepEqual(r.json, { applied: false, reason: 'code_not_found' })
    assert.equal(fake.read(`users/${OWNER}`).xp, 1000)
    assert.equal(fake.read('users/newKid0001').referredBy, undefined)
    assert.equal(fake.read('users/newKid0001').xp, 0)
  })
})

describe('apply (signed in)', () => {
  test('requires a signed-in student, and the identity comes only from the verified token', async () => {
    assert.equal((await call(undefined, { action: 'apply', code: OWNER_CODE })).status, 401)
    assert.equal((await call('not-a-token', { action: 'apply', code: OWNER_CODE })).status, 401)
    // A body that claims to be someone else is ignored.
    const r = await call(tok('newKid0001'), { action: 'apply', code: OWNER_CODE, uid: 'bystander01', newUid: 'bystander01', referredBy: 'bystander01' })
    assert.equal(r.status, 200)
    assert.equal(fake.read('users/newKid0001').referredBy, OWNER)
    assert.equal(fake.read('users/bystander01').referredBy, undefined)
  })

  test('links the student, pays both sides once, awards the badge and the icon, and stamps the link', async () => {
    const r = await call(tok('newKid0001'), { action: 'apply', code: OWNER_CODE })
    assert.deepEqual(r.json, { applied: true, rewarded: true })
    const me = fake.read('users/newKid0001'); const owner = fake.read(`users/${OWNER}`)
    assert.equal(me.referredBy, OWNER); assert.ok(me.referredAt)
    assert.equal(me.xp, internals.REFERRED_XP)
    assert.ok(me.unlockedIcons.includes('rocket'))
    assert.equal(owner.xp, 1000 + internals.REFERRER_XP + internals.REFERRAL_BADGE.xp)
    assert.ok(owner.badges.includes('referral'))
    assert.ok(owner.unlockedIcons.includes('rocket'))
    assert.equal(me.xpThisWeek, internals.REFERRED_XP); assert.equal(me.xpThisMonth, internals.REFERRED_XP)
    assert.equal(owner.xpThisWeek, internals.REFERRER_XP + internals.REFERRAL_BADGE.xp)
  })

  test('a referrer who already has the badge is paid the XP only', async () => {
    fake.seed({ [`users/${OWNER}`]: { displayName: 'Olive Owner', referralCode: OWNER_CODE, xp: 1000, badges: ['referral'] } })
    await call(tok('newKid0001'), { action: 'apply', code: OWNER_CODE })
    const owner = fake.read(`users/${OWNER}`)
    assert.equal(owner.xp, 1000 + internals.REFERRER_XP)
    assert.deepEqual(owner.badges, ['referral'])
  })

  test('applying twice (or a second code later) pays nothing more', async () => {
    await call(tok('newKid0001'), { action: 'apply', code: OWNER_CODE })
    const again = await call(tok('newKid0001'), { action: 'apply', code: OWNER_CODE })
    assert.deepEqual(again.json, { applied: false, reason: 'already_referred' })
    const other = await call(tok('newKid0001'), { action: 'apply', code: 'BYSTANDE' })
    assert.deepEqual(other.json, { applied: false, reason: 'already_referred' })
    assert.equal(fake.read('users/newKid0001').xp, internals.REFERRED_XP)
    assert.equal(fake.read(`users/${OWNER}`).xp, 1000 + internals.REFERRER_XP + internals.REFERRAL_BADGE.xp)
    assert.equal(fake.read('users/bystander01').xp, 5)
  })

  test('two simultaneous calls from the same student pay exactly once', async () => {
    const results = await Promise.all([
      call(tok('newKid0001'), { action: 'apply', code: OWNER_CODE }),
      call(tok('newKid0001'), { action: 'apply', code: OWNER_CODE }),
    ])
    const applied = results.filter((r) => r.json.applied === true)
    assert.equal(applied.length, 1, JSON.stringify(results.map((r) => r.json)))
    assert.equal(fake.read(`users/${OWNER}`).xp, 1000 + internals.REFERRER_XP + internals.REFERRAL_BADGE.xp)
    assert.equal(fake.read('users/newKid0001').xp, internals.REFERRED_XP)
  })

  test('you cannot refer yourself, by your own code or by one that resolves to you', async () => {
    const own = await call(tok(OWNER), { action: 'apply', code: OWNER_CODE })
    assert.deepEqual(own.json, { applied: false, reason: 'self_referral' })
    assert.equal(fake.read(`users/${OWNER}`).xp, 1000)
    assert.equal(fake.read(`users/${OWNER}`).referredBy, undefined)
  })

  test('unknown and malformed codes change nothing', async () => {
    assert.deepEqual((await call(tok('newKid0001'), { action: 'apply', code: 'NOSUCH12' })).json, { applied: false, reason: 'code_not_found' })
    for (const bad of ['', 'x', 'WAYTOOLONGCODE', 'bad code!', { $gt: '' }, null]) {
      assert.deepEqual((await call(tok('newKid0001'), { action: 'apply', code: bad })).json, { applied: false, reason: 'invalid_code' }, JSON.stringify(bad))
    }
    assert.equal(fake.read('users/newKid0001').referredBy, undefined)
    assert.equal(fake.read('users/newKid0001').xp, 0)
  })

  test('a student with no profile document yet can still be linked (the document is created, not rejected)', async () => {
    fake.addAuthUser('freshUser01')
    const r = await call(tok('freshUser01'), { action: 'apply', code: OWNER_CODE })
    assert.deepEqual(r.json, { applied: true, rewarded: true })
    assert.equal(fake.read('users/freshUser01').referredBy, OWNER)
    assert.equal(fake.read('users/freshUser01').xp, internals.REFERRED_XP)
  })

  test('a referrer stops earning after the cap, but the new student is still linked and is told nothing is wrong', async () => {
    for (let i = 0; i < internals.MAX_REWARDED_REFERRALS; i++) fake.seed({ [`users/kid${String(i).padStart(3, '0')}xyz`]: { displayName: 'k' + i, referredBy: OWNER } })
    const before = fake.read(`users/${OWNER}`).xp
    const r = await call(tok('newKid0001'), { action: 'apply', code: OWNER_CODE })
    assert.deepEqual(r.json, { applied: true, rewarded: false })
    assert.equal(fake.read('users/newKid0001').referredBy, OWNER)
    assert.equal(fake.read('users/newKid0001').xp, 0)
    assert.equal(fake.read(`users/${OWNER}`).xp, before)
    assert.deepEqual(fake.read(`users/${OWNER}`).badges, [])
  })

  test('the cap is exactly the allowed number: the last rewarded referral is the 25th', async () => {
    for (let i = 0; i < internals.MAX_REWARDED_REFERRALS - 1; i++) fake.seed({ [`users/kid${String(i).padStart(3, '0')}xyz`]: { displayName: 'k' + i, referredBy: OWNER } })
    assert.deepEqual((await call(tok('newKid0001'), { action: 'apply', code: OWNER_CODE })).json, { applied: true, rewarded: true })
    assert.deepEqual((await call(tok('newKid0002'), { action: 'apply', code: OWNER_CODE })).json, { applied: true, rewarded: false })
  })

  test('is rate limited per student (10 an hour)', async () => {
    let last
    for (let i = 0; i < 11; i++) last = await call(tok('bystander01'), { action: 'apply', code: 'ZZZZZZZZ' })
    assert.equal(last.status, 429)
    assert.equal(last.json.code, 'rate_limited')
  })

  test('if the write fails nothing is half-paid: no link, no XP, no badge', async () => {
    fake.failNext({ op: 'set', path: 'users/newKid0001' }, new Error('SECRET write failure'))
    const r = await call(tok('newKid0001'), { action: 'apply', code: OWNER_CODE })
    assert.equal(r.status, 500)
    assert.ok(!JSON.stringify(r.json).includes('SECRET'))
    assert.equal(fake.read('users/newKid0001').referredBy, undefined)
    assert.equal(fake.read('users/newKid0001').xp, 0)
    assert.equal(fake.read(`users/${OWNER}`).xp, 1000)
    assert.deepEqual(fake.read(`users/${OWNER}`).badges, [])
    // and a retry then succeeds exactly once
    const retry = await call(tok('newKid0001'), { action: 'apply', code: OWNER_CODE })
    assert.deepEqual(retry.json, { applied: true, rewarded: true })
  })
})
