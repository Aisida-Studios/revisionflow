// tests/functions/friends.test.mjs
// Unit tests of netlify/functions/friends.js against the FAKE Admin SDK in tests/helpers/fakeAdmin.js (not the emulator).
import { describe, test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { makeFakeAdmin, freshRequire, makeEvent, parse } from '../helpers/fakeAdmin.js'

let fake, handler, internals
const call = async (token, body, extra = {}) => parse(await handler(makeEvent({ token, body, ...extra })))

beforeEach(() => {
  fake = makeFakeAdmin()
  fake.install()
  for (const uid of ['alice', 'bob', 'carol']) fake.addAuthUser(uid)
  fake.seed({
    'users/alice': { displayName: 'Alice', avatarUrl: 'https://lh3.googleusercontent.com/a/alice-photo=s96-c', xp: 100, friends: [], badges: [] },
    'users/bob': { displayName: 'Bob', profile: { displayName: 'Bob Profile', avatarUrl: 'http://insecure.example/bob.png' }, xp: 10, friends: [], badges: [] },
    'users/carol': { displayName: 'Carol', xp: 0, friends: [], badges: ['first_friend'] },
  })
  const mod = freshRequire('netlify/functions/friends.js')
  handler = mod.handler
  internals = mod._internals
})
const tok = (uid) => fake.tokenFor(uid)

describe('request plumbing', () => {
  test('no token, a bad token, the wrong method, a wrong content type and an oversized body are all refused', async () => {
    assert.equal((await call(undefined, { action: 'request', toUid: 'bob' })).status, 401)
    assert.equal((await call('not-a-token', { action: 'request', toUid: 'bob' })).status, 401)
    assert.equal(parse(await handler(makeEvent({ method: 'GET', token: tok('alice') }))).status, 405)
    assert.equal(parse(await handler(makeEvent({ token: tok('alice'), body: '{"action":"request"}', raw: true, headers: { 'content-type': 'text/plain' } }))).status, 415)
    assert.equal(parse(await handler(makeEvent({ token: tok('alice'), body: JSON.stringify({ action: 'request', pad: 'x'.repeat(5000) }) }))).status, 413)
    assert.equal((await call(tok('alice'), { action: 'nonsense' })).status, 400)
    assert.equal((await call(tok('alice'), [1, 2])).status, 400)
    assert.equal(fake.count('friendRequests/'), 0)
  })

  test('responses are never cacheable, and CORS is limited to the app\'s own origins', async () => {
    const ok = parse(await handler(makeEvent({ token: tok('alice'), body: { action: 'decline', requestId: 'nothing' }, headers: { origin: 'https://www.revisionflow.co.uk' } })))
    assert.equal(ok.status, 200)
    assert.equal(ok.headers['Cache-Control'], 'no-store')
    assert.equal(ok.headers['Access-Control-Allow-Origin'], 'https://www.revisionflow.co.uk')
    const evil = parse(await handler(makeEvent({ token: tok('alice'), body: { action: 'decline', requestId: 'nothing' }, headers: { origin: 'https://evil.example' } })))
    assert.equal(evil.headers['Access-Control-Allow-Origin'], undefined)
    const preflight = await handler(makeEvent({ method: 'OPTIONS', headers: { origin: 'https://evil.example' } }))
    assert.equal(preflight.statusCode, 204)
    assert.equal(preflight.headers['Access-Control-Allow-Origin'], undefined)
  })

  test('an unexpected failure is answered with a generic error, never the internal message', async () => {
    fake.failNext({ op: 'query', path: 'friendRequests' }, new Error('SECRET internal detail: projects/prod/databases/(default)'))
    const r = await call(tok('alice'), { action: 'request', toUid: 'bob' })
    assert.equal(r.status, 500)
    assert.ok(!JSON.stringify(r.json).includes('SECRET'))
    assert.equal(r.json.code, 'server_error')
  })
})

describe('sending a request', () => {
  test('creates one request whose sender fields come from the sender\'s profile, not from the request body', async () => {
    const r = await call(tok('alice'), { action: 'request', toUid: 'bob', from: 'carol', fromName: 'RevisionFlow Support', fromAvatarUrl: 'https://tracker.example/p.gif' })
    assert.equal(r.status, 200)
    assert.deepEqual(r.json, { sent: true })
    const doc = fake.read('friendRequests/alice_bob')
    assert.equal(doc.from, 'alice'); assert.equal(doc.to, 'bob')
    assert.equal(doc.fromName, 'Alice')
    assert.equal(doc.fromAvatarUrl, 'https://lh3.googleusercontent.com/a/alice-photo=s96-c')
    assert.ok(doc.createdAt)
    assert.equal(fake.count('friendRequests/'), 1)
  })

  test('an insecure avatar URL is dropped, control characters are stripped and the name is capped', async () => {
    fake.seed({ 'users/bob': { displayName: 'B\u0000o\u0007b' + 'x'.repeat(200), avatarUrl: 'http://insecure.example/bob.png', friends: [] } })
    await call(tok('bob'), { action: 'request', toUid: 'alice' })
    const doc = fake.read('friendRequests/bob_alice')
    assert.equal(doc.fromAvatarUrl, '')
    assert.ok(!/[\u0000-\u001f]/.test(doc.fromName)); assert.equal(doc.fromName.length, 100)
  })

  test('only a Google photo host is passed on as an avatar: any other https link (a tracking pixel) is dropped', async () => {
    for (const url of ['https://tracker.example/p.gif', 'https://lh3.googleusercontent.com.evil.example/a.png', 'https://evil-googleusercontent.com/a.png',
                       'https://user:pw@lh3.googleusercontent.com/a.png', 'https://lh3.googleusercontent.com:8443/a.png', 'javascript:alert(1)']) {
      fake.seed({ 'users/bob': { displayName: 'Bob', avatarUrl: url, friends: [] } })
      await call(tok('bob'), { action: 'request', toUid: 'alice' })
      assert.equal(fake.read('friendRequests/bob_alice').fromAvatarUrl, '', url)
      await fake.db.doc('friendRequests/bob_alice').delete()
    }
  })

  test('sending the same request twice keeps one request', async () => {
    await call(tok('alice'), { action: 'request', toUid: 'bob' })
    const again = await call(tok('alice'), { action: 'request', toUid: 'bob' })
    assert.deepEqual(again.json, { sent: true, duplicate: true })
    assert.equal(fake.count('friendRequests/'), 1)
  })

  test('refuses yourself, malformed ids, unknown students, existing friends and a request you already received', async () => {
    assert.equal((await call(tok('alice'), { action: 'request', toUid: 'alice' })).status, 400)
    for (const bad of [undefined, '', 'a/b', 'x'.repeat(200), 42, { $ne: 1 }, 'with space']) {
      assert.equal((await call(tok('alice'), { action: 'request', toUid: bad })).status, 400, JSON.stringify(bad))
    }
    assert.deepEqual((await call(tok('alice'), { action: 'request', toUid: 'nobody' })).json, { sent: false, reason: 'not_found' })
    fake.seed({ 'users/alice': { displayName: 'Alice', friends: ['bob'] } })
    assert.deepEqual((await call(tok('alice'), { action: 'request', toUid: 'bob' })).json, { sent: false, reason: 'already_friends' })
    await call(tok('carol'), { action: 'request', toUid: 'bob' })
    assert.deepEqual((await call(tok('bob'), { action: 'request', toUid: 'carol' })).json, { sent: false, reason: 'incoming_pending' })
    assert.equal(fake.count('friendRequests/'), 1)
  })

  test('a student cannot have more than the allowed number of requests waiting', async () => {
    for (let i = 0; i < internals.MAX_OUTGOING_PENDING; i++) {
      fake.seed({ [`users/t${i}`]: { displayName: 't' + i }, [`friendRequests/alice_t${i}`]: { from: 'alice', to: 't' + i } })
    }
    const r = await call(tok('alice'), { action: 'request', toUid: 'bob' })
    assert.deepEqual(r.json, { sent: false, reason: 'too_many_pending' })
    assert.equal(fake.exists('friendRequests/alice_bob'), false)
  })

  test('a recipient whose inbox is full receives nothing more', async () => {
    for (let i = 0; i < 50; i++) fake.seed({ [`friendRequests/s${i}_bob`]: { from: 's' + i, to: 'bob' } })
    const r = await call(tok('alice'), { action: 'request', toUid: 'bob' })
    assert.deepEqual(r.json, { sent: false, reason: 'recipient_unavailable' })
  })

  test('sending is rate limited per student (429 with Retry-After), and the limiter stores no uid or address', async () => {
    let last
    for (let i = 0; i < 21; i++) last = await call(tok('alice'), { action: 'request', toUid: 'ghost' + i })
    assert.equal(last.status, 429)
    assert.equal(last.json.code, 'rate_limited')
    assert.ok(Number(last.headers['Retry-After']) >= 1)
    const stored = fake.paths('rateLimits/')
    assert.ok(stored.length >= 1)
    for (const p of stored) assert.ok(!p.includes('alice'), 'the rate-limit document id must not contain the uid')
    assert.ok(!JSON.stringify(stored.map((p) => fake.read(p))).includes('alice'))
  })
})

describe('accepting', () => {
  const befriend = async () => { await call(tok('alice'), { action: 'request', toUid: 'bob' }); return call(tok('bob'), { action: 'accept', requestId: 'alice_bob' }) }

  test('adds both students to each other\'s list, removes the request, pays the reward and the first-friend badge once', async () => {
    const r = await befriend()
    assert.deepEqual(r.json, { accepted: true, xpAwarded: true })
    assert.deepEqual(fake.read('users/alice').friends, ['bob'])
    assert.deepEqual(fake.read('users/bob').friends, ['alice'])
    assert.equal(fake.exists('friendRequests/alice_bob'), false)
    assert.equal(fake.read('users/alice').xp, 100 + 25 + 50)
    assert.equal(fake.read('users/bob').xp, 10 + 25 + 50)
    assert.deepEqual(fake.read('users/alice').badges, ['first_friend'])
    assert.equal(fake.read('users/alice').xpThisWeek, 75)
    assert.equal(fake.count('friendPairs/'), 1)
    assert.deepEqual([...fake.read(fake.paths('friendPairs/')[0]).members].sort(), ['alice', 'bob'])
  })

  test('a student who already holds the badge only gets the reward, not the badge XP again', async () => {
    await call(tok('carol'), { action: 'request', toUid: 'alice' })
    await call(tok('alice'), { action: 'accept', requestId: 'carol_alice' })
    assert.equal(fake.read('users/carol').xp, 25)
    assert.deepEqual(fake.read('users/carol').badges, ['first_friend'])
    assert.equal(fake.read('users/alice').xp, 100 + 25 + 50)
  })

  test('only the recipient can accept: the sender and a third party get 403 and nothing changes', async () => {
    await call(tok('alice'), { action: 'request', toUid: 'bob' })
    for (const who of ['alice', 'carol']) {
      const r = await call(tok(who), { action: 'accept', requestId: 'alice_bob' })
      assert.equal(r.status, 403, who)
    }
    assert.deepEqual(fake.read('users/alice').friends, []); assert.deepEqual(fake.read('users/bob').friends, [])
    assert.ok(fake.exists('friendRequests/alice_bob'))
    assert.equal(fake.read('users/bob').xp, 10)
  })

  test('accepting a request that does not exist, or twice, changes nothing', async () => {
    assert.deepEqual((await call(tok('bob'), { action: 'accept', requestId: 'nope' })).json, { accepted: false, reason: 'not_found' })
    await befriend()
    const xp = fake.read('users/bob').xp
    assert.deepEqual((await call(tok('bob'), { action: 'accept', requestId: 'alice_bob' })).json, { accepted: false, reason: 'not_found' })
    assert.equal(fake.read('users/bob').xp, xp)
  })

  test('remove, request again and accept again does NOT pay the reward a second time (the old XP loop)', async () => {
    await befriend()
    const after = { alice: fake.read('users/alice').xp, bob: fake.read('users/bob').xp }
    await call(tok('alice'), { action: 'remove', friendUid: 'bob' })
    for (let i = 0; i < 3; i++) {
      await call(tok('alice'), { action: 'request', toUid: 'bob' })
      const r = await call(tok('bob'), { action: 'accept', requestId: 'alice_bob' })
      assert.deepEqual(r.json, { accepted: true, xpAwarded: false })
      await call(tok('bob'), { action: 'remove', friendUid: 'alice' })
    }
    assert.equal(fake.read('users/alice').xp, after.alice)
    assert.equal(fake.read('users/bob').xp, after.bob)
    assert.equal(fake.count('friendPairs/'), 1)
  })

  test('once a student has reached the number of rewarded friendships, further friendships are made but pay nothing', async () => {
    for (let i = 0; i < internals.MAX_REWARDED_FRIENDSHIPS; i++) fake.seed({ [`friendPairs/seed${i}`]: { members: ['bob', 'other' + i] } })
    await call(tok('alice'), { action: 'request', toUid: 'bob' })
    const r = await call(tok('bob'), { action: 'accept', requestId: 'alice_bob' })
    assert.deepEqual(r.json, { accepted: true, xpAwarded: false })
    assert.deepEqual(fake.read('users/bob').friends, ['alice'])
    assert.equal(fake.read('users/bob').xp, 10); assert.equal(fake.read('users/alice').xp, 100)
  })

  test('if the sender\'s account is gone the stale request is cleared and nothing is half-applied', async () => {
    await call(tok('alice'), { action: 'request', toUid: 'bob' })
    fake.seed({}); await fake.db.doc('users/alice').delete()
    const r = await call(tok('bob'), { action: 'accept', requestId: 'alice_bob' })
    assert.deepEqual(r.json, { accepted: false, reason: 'sender_gone' })
    assert.equal(fake.exists('friendRequests/alice_bob'), false)
    assert.deepEqual(fake.read('users/bob').friends, [])
  })

  test('it is atomic: a failure while writing the second student leaves BOTH lists, the XP and the request untouched', async () => {
    await call(tok('alice'), { action: 'request', toUid: 'bob' })
    fake.failNext({ op: 'update', path: 'users/bob' }, new Error('write failed'), { times: 1 })
    const r = await call(tok('bob'), { action: 'accept', requestId: 'alice_bob' })
    assert.equal(r.status, 500)
    assert.deepEqual(fake.read('users/alice').friends, [])
    assert.deepEqual(fake.read('users/bob').friends, [])
    assert.equal(fake.read('users/alice').xp, 100)
    assert.ok(fake.exists('friendRequests/alice_bob'))
    assert.equal(fake.count('friendPairs/'), 0)
    // and a retry then succeeds
    assert.equal((await call(tok('bob'), { action: 'accept', requestId: 'alice_bob' })).json.accepted, true)
  })

  test('legacy requests with a random document id can still be accepted', async () => {
    fake.seed({ 'friendRequests/legacyAutoId123': { from: 'alice', fromName: 'Alice', to: 'bob' } })
    assert.equal((await call(tok('bob'), { action: 'accept', requestId: 'legacyAutoId123' })).json.accepted, true)
  })

  test('a malformed request id is refused', async () => {
    for (const bad of ['', 'a/b', 'x'.repeat(400), undefined]) assert.equal((await call(tok('bob'), { action: 'accept', requestId: bad })).status, 400)
  })
})

describe('declining and removing', () => {
  test('the recipient can decline and the sender can withdraw; a third party cannot', async () => {
    await call(tok('alice'), { action: 'request', toUid: 'bob' })
    assert.equal((await call(tok('carol'), { action: 'decline', requestId: 'alice_bob' })).status, 403)
    assert.ok(fake.exists('friendRequests/alice_bob'))
    assert.deepEqual((await call(tok('bob'), { action: 'decline', requestId: 'alice_bob' })).json, { declined: true })
    assert.equal(fake.exists('friendRequests/alice_bob'), false)
    await call(tok('alice'), { action: 'request', toUid: 'bob' })
    assert.deepEqual((await call(tok('alice'), { action: 'decline', requestId: 'alice_bob' })).json, { declined: true })
    assert.deepEqual((await call(tok('bob'), { action: 'decline', requestId: 'alice_bob' })).json, { declined: true }) // already gone
  })

  test('removing a friend updates both lists, is idempotent and tolerates a missing account', async () => {
    fake.seed({ 'users/alice': { friends: ['bob', 'carol'] }, 'users/bob': { friends: ['alice'] }, 'users/carol': { friends: ['alice'] } })
    assert.deepEqual((await call(tok('alice'), { action: 'remove', friendUid: 'bob' })).json, { removed: true })
    assert.deepEqual(fake.read('users/alice').friends, ['carol'])
    assert.deepEqual(fake.read('users/bob').friends, [])
    assert.deepEqual(fake.read('users/carol').friends, ['alice'])
    assert.equal((await call(tok('alice'), { action: 'remove', friendUid: 'bob' })).status, 200)
    await fake.db.doc('users/carol').delete()
    assert.equal((await call(tok('alice'), { action: 'remove', friendUid: 'carol' })).status, 200)
    assert.deepEqual(fake.read('users/alice').friends, [])
  })

  test('remove validates its input and can only ever remove the caller from another list', async () => {
    assert.equal((await call(tok('alice'), { action: 'remove', friendUid: 'alice' })).status, 400)
    assert.equal((await call(tok('alice'), { action: 'remove', friendUid: 'a/b' })).status, 400)
    fake.seed({ 'users/bob': { friends: ['carol'] } })
    await call(tok('alice'), { action: 'remove', friendUid: 'bob' })
    assert.deepEqual(fake.read('users/bob').friends, ['carol'], 'a stranger\'s unrelated friends must be untouched')
  })
})
