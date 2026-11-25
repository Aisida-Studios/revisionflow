// tests/functions/public-data.test.mjs
// Unit tests of netlify/functions/public-data.js against the FAKE Admin SDK in tests/helpers/fakeAdmin.js (not the emulator).
import { describe, test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { makeFakeAdmin, freshRequire, makeEvent, parse } from '../helpers/fakeAdmin.js'

const require = createRequire(import.meta.url)
let fake, handler, internals, periods
const IP = { 'x-nf-client-connection-ip': '203.0.113.7' }
const call = async (token, body, extra = {}) => parse(await handler(makeEvent({ token, body, headers: IP, ...extra })))
const tok = (uid) => fake.tokenFor(uid)
const GOOGLE_PHOTO = 'https://lh3.googleusercontent.com/a/photo-abc=s96-c'

// Everything a real student document can hold, including what must NEVER be sent to another student.
const fullUser = (extra = {}) => ({
  displayName: 'Alice A', username: 'alice', avatarUrl: GOOGLE_PHOTO, xp: 500, streak: 4, profileIcon: 'rocket', badges: ['first_session'],
  subjects: [{ name: 'Biology', grade: '7', target: '9' }, { name: 'Physics', grade: '5' }], settings: { profilePublic: true, friendsCanSeeGrades: true },
  email: 'alice@example.test', profile: { email: 'alice@example.test', displayName: 'Alice A' }, stripeCustomerId: 'cus_SECRET', stripeSubId: 'sub_SECRET',
  isPro: true, betaUser: true, pushSubscription: { endpoint: 'https://push.example/SECRET', keys: { p256dh: 'k', auth: 'a' } },
  examDates: [{ subject: 'Biology', date: '2027-06-01' }], friends: ['bob'], referralCode: 'ALICE123', ...extra,
})

beforeEach(() => {
  fake = makeFakeAdmin()
  fake.install()
  for (const uid of ['alice', 'bob', 'carol', 'dave', 'eve']) fake.addAuthUser(uid)
  const week = require('../../netlify/functions/lib/periods.js')
  periods = week
  const wk = week.currentWeekStart(new Date(), 'UTC'); const mo = week.currentMonthStart(new Date(), 'UTC')
  fake.seed({
    'users/alice': fullUser({ friends: ['bob', 'carol'], xpWeekStart: wk, xpMonthStart: mo, xpThisWeek: 30, xpThisMonth: 90 }),
    'users/bob': fullUser({ displayName: 'Bob B', username: 'bobby', xp: 900, streak: 9, friends: ['alice'], xpWeekStart: wk, xpMonthStart: mo, xpThisWeek: 70, xpThisMonth: 200, email: 'bob@example.test' }),
    'users/carol': fullUser({ displayName: 'Carol C', username: 'carol', xp: 100, streak: 1, friends: ['alice'], hideNameFromLeaderboard: true, xpWeekStart: wk, xpMonthStart: mo, xpThisWeek: 10, xpThisMonth: 10 }),
    'users/dave': fullUser({ displayName: 'Dave D', username: 'dave', xp: 700, streak: 2, friends: [], hideNameFromLeaderboard: true, xpWeekStart: '1999-01-04', xpMonthStart: '1999-01-01', xpThisWeek: 999, xpThisMonth: 999 }),
    'users/eve': fullUser({ displayName: 'Eve Private', username: 'eve', xp: 300, streak: 3, friends: [], settings: { profilePublic: false, friendsCanSeeGrades: true } }),
  })
  const mod = freshRequire('netlify/functions/public-data.js')
  handler = mod.handler
  internals = mod._internals
})

const SECRETS = ['alice@example.test', 'bob@example.test', 'cus_SECRET', 'sub_SECRET', 'push.example', 'SECRET', 'ALICE123', '2027-06-01', 'betaUser', 'isPro', 'stripe', 'pushSubscription', 'examDates', 'referralCode']
const assertNoSecrets = (value) => { const text = JSON.stringify(value); for (const s of SECRETS) assert.ok(!text.includes(s), `leaked: ${s}`) }

describe('request plumbing', () => {
  test('wrong method, wrong content type, bad JSON and an oversized body are refused', async () => {
    assert.equal(parse(await handler(makeEvent({ method: 'GET', headers: IP }))).status, 405)
    assert.equal(parse(await handler(makeEvent({ body: '{"action":"profile"}', raw: true, headers: { ...IP, 'content-type': 'text/plain' } }))).status, 415)
    assert.equal(parse(await handler(makeEvent({ body: '{nope', raw: true, headers: IP }))).status, 400)
    assert.equal((await call(undefined, { action: 'profile', handle: 'x', pad: 'x'.repeat(40000) })).status, 413)
    assert.equal((await call(undefined, undefined)).status, 400)
  })

  test('only the profile action works without signing in; everything else needs a verified token', async () => {
    for (const action of ['leaderboard-friends', 'leaderboard-global', 'friend-profiles', 'search-users', 'anything-else']) {
      assert.equal((await call(undefined, { action })).status, 401, action)
      assert.equal((await call('not-a-token', { action })).status, 401, action)
    }
    assert.equal((await call(undefined, { action: 'profile', handle: 'bobby' })).status, 200)
    assert.equal((await call(tok('alice'), { action: 'unknown-action' })).status, 400)
  })

  test('responses are never cacheable and CORS is limited to the app\'s own origins (no wildcard)', async () => {
    const ok = parse(await handler(makeEvent({ body: { action: 'profile', handle: 'bobby' }, headers: { ...IP, origin: 'https://www.revisionflow.co.uk' } })))
    assert.equal(ok.headers['Cache-Control'], 'no-store')
    assert.equal(ok.headers['Access-Control-Allow-Origin'], 'https://www.revisionflow.co.uk')
    const evil = parse(await handler(makeEvent({ body: { action: 'profile', handle: 'bobby' }, headers: { ...IP, origin: 'https://evil.example' } })))
    assert.equal(evil.headers['Access-Control-Allow-Origin'], undefined)
  })

  test('an unexpected failure is answered with a generic error, never the internal message', async () => {
    fake.failNext({ op: 'query', path: 'users' }, new Error('SECRET internal detail projects/prod/databases/(default)'))
    const r = await call(tok('alice'), { action: 'leaderboard-global' })
    assert.equal(r.status, 500)
    assert.ok(!JSON.stringify(r.json).includes('SECRET'))
  })
})

describe('profile (public link)', () => {
  test('shows only the public subset, by username or by uid, and never anything private', async () => {
    for (const handle of ['bobby', 'bob']) {
      const r = await call(undefined, { action: 'profile', handle })
      assert.equal(r.status, 200, handle)
      assert.equal(r.json.uid, 'bob'); assert.equal(r.json.displayName, 'Bob B'); assert.equal(r.json.xp, 900)
      assert.deepEqual(r.json.badges, ['first_session'])
      assert.deepEqual(r.json.subjects, [{ name: 'Biology' }, { name: 'Physics' }])   // names only: no grades or targets
      assertNoSecrets(r.json)
      assert.deepEqual(Object.keys(r.json).sort(), ['avatarUrl', 'badges', 'displayName', 'hideNameFromLeaderboard', 'profileIcon', 'streak', 'subjects', 'uid', 'username', 'xp'])
    }
  })

  test('a private profile and an unknown handle look exactly the same (404)', async () => {
    const priv = await call(undefined, { action: 'profile', handle: 'eve' })
    const byUid = await call(undefined, { action: 'profile', handle: 'eve' })
    const unknown = await call(undefined, { action: 'profile', handle: 'nobody-here' })
    assert.equal(priv.status, 404); assert.equal(byUid.status, 404); assert.equal(unknown.status, 404)
    assert.deepEqual(priv.json, unknown.json)
  })

  test('subjects are hidden when the student turned that setting off', async () => {
    fake.seed({ 'users/bob': fullUser({ displayName: 'Bob B', username: 'bobby', settings: { profilePublic: true, friendsCanSeeGrades: false } }) })
    assert.deepEqual((await call(undefined, { action: 'profile', handle: 'bobby' })).json.subjects, [])
  })

  test('a malformed handle is a clean 404/400, never a 500, and never reaches an invalid document path', async () => {
    assert.equal((await call(undefined, { action: 'profile' })).status, 400)
    assert.equal((await call(undefined, { action: 'profile', handle: '' })).status, 400)
    for (const handle of ['a/b', '../users/bob', 'x'.repeat(200), { $ne: 1 }, ['bob'], 42, 'with space', '😀']) {
      const r = await call(undefined, { action: 'profile', handle })
      assert.ok(r.status === 404 || r.status === 400, `${JSON.stringify(handle)} -> ${r.status}`)
    }
  })

  test('names are cleaned, numbers are real numbers and only a Google photo is kept as the avatar', async () => {
    fake.seed({ 'users/bob': fullUser({ displayName: 'B\u0000o\u0007b' + 'x'.repeat(300), username: 'bobby', xp: '999999', streak: { n: 1 }, avatarUrl: 'https://tracker.example/pixel.gif', profileIcon: 'i'.repeat(200) }) })
    const r = (await call(undefined, { action: 'profile', handle: 'bobby' })).json
    assert.ok(!/[\u0000-\u001f]/.test(r.displayName)); assert.equal(r.displayName.length, 100)
    assert.equal(r.xp, 0); assert.equal(r.streak, 0)
    assert.equal(r.avatarUrl, '')
    assert.equal(r.profileIcon.length, 40)
    fake.seed({ 'users/bob': fullUser({ displayName: 'Bob', username: 'bobby' }) })
    assert.equal((await call(undefined, { action: 'profile', handle: 'bobby' })).json.avatarUrl, GOOGLE_PHOTO)
  })

  test('is rate limited per caller address (429 with Retry-After)', async () => {
    let last
    for (let i = 0; i < 61; i++) last = await call(undefined, { action: 'profile', handle: 'nobody' + i })
    assert.equal(last.status, 429); assert.equal(last.json.code, 'rate_limited'); assert.ok(Number(last.headers['Retry-After']) >= 1)
    const other = parse(await handler(makeEvent({ body: { action: 'profile', handle: 'bobby' }, headers: { 'x-nf-client-connection-ip': '198.51.100.9' } })))
    assert.equal(other.status, 200)
  })
})

describe('friends leaderboard', () => {
  test('contains the caller and the caller\'s friends only, with the period values the page reads', async () => {
    const r = await call(tok('alice'), { action: 'leaderboard-friends' })
    assert.equal(r.status, 200)
    assert.deepEqual(r.json.map((u) => u.uid).sort(), ['alice', 'bob', 'carol'])
    const me = r.json.find((u) => u.uid === 'alice'); const bob = r.json.find((u) => u.uid === 'bob')
    assert.equal(me.isCurrentUser, true); assert.equal(bob.isCurrentUser, false)
    assert.equal(bob.xpThisWeek, 70); assert.equal(bob.xpThisMonth, 200)
    assertNoSecrets(r.json)
  })

  test('a friend who chose to be Anonymous is sent without a name, username or avatar; the caller always sees themselves', async () => {
    const r = await call(tok('alice'), { action: 'leaderboard-friends' })
    const carol = r.json.find((u) => u.uid === 'carol')
    assert.equal(carol.displayName, 'Anonymous'); assert.equal(carol.username, null); assert.equal(carol.avatarUrl, ''); assert.equal(carol.hideNameFromLeaderboard, true)
    assert.ok(!JSON.stringify(r.json).includes('Carol'))
    fake.seed({ 'users/alice': fullUser({ friends: ['bob'], hideNameFromLeaderboard: true }) })
    const mine = (await call(tok('alice'), { action: 'leaderboard-friends' })).json.find((u) => u.uid === 'alice')
    assert.equal(mine.displayName, 'Alice A')
  })

  test('a non-existent friend is skipped, malformed ids are ignored and the number read is bounded', async () => {
    const many = Array.from({ length: 300 }, (_, i) => 'ghost' + i)
    fake.seed({ 'users/alice': fullUser({ friends: ['bob', 'a/b', { x: 1 }, 42, ...many] }) })
    const r = await call(tok('alice'), { action: 'leaderboard-friends' })
    assert.equal(r.status, 200)
    assert.deepEqual(r.json.map((u) => u.uid).sort(), ['alice', 'bob'])
  })
})

describe('global leaderboard', () => {
  test('is sorted by XP, bounded, and carries the period values', async () => {
    const r = await call(tok('alice'), { action: 'leaderboard-global', period: 'allTime', maxResults: 100 })
    assert.equal(r.status, 200)
    assert.deepEqual(r.json.map((u) => u.xp), [900, 700, 500, 300, 100])
    assert.ok(r.json.every((u) => 'xpThisWeek' in u && 'xpThisMonth' in u))
    assertNoSecrets(r.json)
  })

  test('students who chose to be Anonymous are anonymous in the data itself: no name, username, avatar or real uid', async () => {
    const r = await call(tok('alice'), { action: 'leaderboard-global' })
    const text = JSON.stringify(r.json)
    for (const leaked of ['Dave', 'Carol', '"dave"', '"carol"', 'dave', GOOGLE_PHOTO.length ? '"uid":"dave"' : '']) if (leaked) assert.ok(!text.includes(leaked), leaked)
    const hidden = r.json.filter((u) => u.hideNameFromLeaderboard)
    assert.equal(hidden.length, 2)
    for (const u of hidden) {
      assert.equal(u.displayName, 'Anonymous'); assert.equal(u.username, null); assert.equal(u.avatarUrl, '')
      assert.match(u.uid, /^anonymous-\d+$/)
    }
    assert.equal(new Set(r.json.map((u) => u.uid)).size, r.json.length, 'ids must stay unique so the page can key its rows')
  })

  test('a student who is hidden still finds their own row (real uid, real name)', async () => {
    const r = await call(tok('dave'), { action: 'leaderboard-global' })
    const mine = r.json.find((u) => u.uid === 'dave')
    assert.ok(mine); assert.equal(mine.displayName, 'Dave D')
    assert.equal(r.json.filter((u) => u.displayName === 'Dave D').length, 1)
  })

  test('This week / This month drop people with nothing in the current period and re-sort', async () => {
    const week = (await call(tok('alice'), { action: 'leaderboard-global', period: 'week' })).json
    assert.ok(!week.some((u) => u.xpThisWeek <= 0))
    assert.deepEqual(week.map((u) => u.xpThisWeek), [...week.map((u) => u.xpThisWeek)].sort((a, b) => b - a))
    assert.ok(!week.some((u) => u.xp === 700), 'dave\'s weekly counter is from 1999, so it must not count')
    const month = (await call(tok('alice'), { action: 'leaderboard-global', period: 'month' })).json
    assert.equal(month[0].xpThisMonth, 200)
  })

  test('maxResults is clamped, and nonsense values neither crash nor unbound the query', async () => {
    for (let i = 0; i < 150; i++) fake.seed({ [`users/bulk${i}`]: { displayName: 'b' + i, xp: 1000 + i, streak: 0 } })
    assert.equal((await call(tok('alice'), { action: 'leaderboard-global', maxResults: 100000 })).json.length, 100)
    assert.equal((await call(tok('alice'), { action: 'leaderboard-global', maxResults: 3 })).json.length, 3)
    for (const bad of [-5, 0, 'abc', null, 2.5, {}, [], '50']) {
      const r = await call(tok('alice'), { action: 'leaderboard-global', maxResults: bad })
      assert.equal(r.status, 200, JSON.stringify(bad))
      assert.ok(r.json.length >= 1 && r.json.length <= 100, JSON.stringify(bad))
    }
    assert.equal((await call(tok('alice'), { action: 'leaderboard-global', period: 'decade' })).status, 200)
  })
})

describe('friend-profiles', () => {
  test('answers only for the caller\'s own friends: a guessed uid gets nothing', async () => {
    const r = await call(tok('alice'), { action: 'friend-profiles', uids: ['bob', 'carol', 'dave', 'eve', 'alice', 'ghost'] })
    assert.equal(r.status, 200)
    assert.deepEqual(r.json.map((u) => u.uid).sort(), ['bob', 'carol'])
    assertNoSecrets(r.json)
    // a student with no friends learns nothing about anyone
    assert.deepEqual((await call(tok('eve'), { action: 'friend-profiles', uids: ['alice', 'bob'] })).json, [])
  })

  test('friends see each other\'s real names (Anonymous applies to leaderboards, not to the friend list)', async () => {
    const r = await call(tok('alice'), { action: 'friend-profiles', uids: ['carol'] })
    assert.equal(r.json[0].displayName, 'Carol C')
  })

  test('malformed input is ignored, duplicates collapse and the list is bounded', async () => {
    const r = await call(tok('alice'), { action: 'friend-profiles', uids: ['bob', 'bob', 'a/b', 7, null, { x: 1 }, ...Array.from({ length: 500 }, (_, i) => 'g' + i)] })
    assert.equal(r.status, 200); assert.deepEqual(r.json.map((u) => u.uid), ['bob'])
    assert.deepEqual((await call(tok('alice'), { action: 'friend-profiles', uids: 'bob' })).json, [])
    assert.deepEqual((await call(tok('alice'), { action: 'friend-profiles' })).json, [])
  })
})

describe('search-users', () => {
  test('finds students by name, ignoring case, never returns the caller, and sends only the public subset', async () => {
    const r = await call(tok('alice'), { action: 'search-users', term: '  BOB ' })
    assert.deepEqual(r.json.map((u) => u.uid), ['bob'])
    assertNoSecrets(r.json)
    assert.deepEqual((await call(tok('alice'), { action: 'search-users', term: 'alice' })).json, [])
  })

  test('a student with a private profile cannot be found by name (consistent with their profile link)', async () => {
    assert.deepEqual((await call(tok('alice'), { action: 'search-users', term: 'eve' })).json, [])
    assert.deepEqual((await call(tok('alice'), { action: 'search-users', term: 'private' })).json, [])
  })

  test('very short, empty, non-string and oversized terms return nothing (no directory browsing by letter)', async () => {
    for (const term of ['', ' ', 'a', 'b', 42, { $ne: '' }, ['bob'], 'x'.repeat(51), undefined, null]) {
      const r = await call(tok('alice'), { action: 'search-users', term })
      assert.equal(r.status, 200, JSON.stringify(term)); assert.deepEqual(r.json, [], JSON.stringify(term))
    }
  })

  test('returns at most ten results', async () => {
    for (let i = 0; i < 30; i++) fake.seed({ [`users/match${i}`]: { displayName: 'Sam ' + i, xp: 1, streak: 0 } })
    assert.equal((await call(tok('alice'), { action: 'search-users', term: 'sam' })).json.length, 10)
  })

  test('is rate limited per student (20 a minute)', async () => {
    let last
    for (let i = 0; i < 21; i++) last = await call(tok('alice'), { action: 'search-users', term: 'bo' })
    assert.equal(last.status, 429); assert.equal(last.json.code, 'rate_limited')
    assert.equal((await call(tok('bob'), { action: 'search-users', term: 'al' })).status, 200)
  })
})

describe('safeFields', () => {
  test('tolerates missing, null and wrongly typed fields', () => {
    for (const d of [{}, { profile: null }, { profile: 'x' }, { displayName: null, xp: null, badges: 'nope', subjects: 'nope', settings: 'nope' }, { subjects: [null, 5, { name: 7 }, { name: 'ok' }] }]) {
      const out = internals.safeFields('u1', d, { includeBadgesAndSubjects: true })
      assert.equal(out.uid, 'u1'); assert.equal(typeof out.displayName, 'string'); assert.equal(typeof out.xp, 'number')
      assert.ok(Array.isArray(out.badges)); assert.ok(Array.isArray(out.subjects))
    }
  })
})
