// tests/functions/notify.test.mjs
// Unit tests of netlify/functions/notify.js against the FAKE Admin SDK and a FAKE web-push (tests/helpers/fakeAdmin.js).
// Nothing here sends a real push or touches the network.
import { describe, test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { makeFakeAdmin, installFakeWebPush, freshRequire, makeEvent, parse } from '../helpers/fakeAdmin.js'

let fake, handler, internals, push, logs
const realConsole = { log: console.log, warn: console.warn, error: console.error }
const IP = { 'x-nf-client-connection-ip': '203.0.113.20' }
const KEYS = { p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM', auth: 'tBHItJI5svbpez7KI4CCXg' }
const FCM = 'https://fcm.googleapis.com/fcm/send/dG9rZW4tZm9yLXRlc3Rpbmc'
const sub = (endpoint = FCM, extra = {}) => ({ endpoint, keys: { ...KEYS }, ...extra })

function installPush() {
  push = { vapid: [], sent: [], behaviour: () => ({}) }
  installFakeWebPush({
    setVapidDetails: (...a) => { push.vapid.push(a) },
    sendNotification: async (subscription, payload, options) => {
      push.sent.push({ subscription, payload: JSON.parse(payload), options })
      const b = push.behaviour(subscription)
      if (b.throw) throw b.throw
      return { statusCode: 201 }
    },
  })
}
const call = async (token, body, extra = {}) => parse(await handler(makeEvent({ token, body, headers: IP, ...extra })))
const self = (uid, body = {}, extra) => call(fake.tokenFor(uid), { subscription: sub(), ...body }, extra)
const adminCall = (body, tokenOpts = {}) => call(fake.tokenFor('admin', tokenOpts), body)

beforeEach(() => {
  fake = makeFakeAdmin()
  fake.install()
  for (const uid of ['alice', 'bob']) fake.addAuthUser(uid)
  fake.addAuthUser('admin', { email: 'admin@example.test' })
  fake.addAuthUser('mallory', { email: 'mallory@example.test' })
  process.env.ADMIN_EMAILS = 'admin@example.test'
  process.env.VAPID_PUBLIC_KEY = 'BPublicKeyForTestsOnly'
  process.env.VAPID_PRIVATE_KEY = 'PrivateKeyForTestsOnly'
  installPush()
  logs = []
  for (const k of ['log', 'warn', 'error']) console[k] = (...a) => { logs.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')) }
  const mod = freshRequire('netlify/functions/notify.js')
  handler = mod.handler
  internals = mod._internals
})
afterEach(() => {
  Object.assign(console, realConsole)
  for (const k of ['ADMIN_EMAILS', 'VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'VAPID_SUBJECT', 'PUSH_ENDPOINT_HOSTS']) delete process.env[k]
})

describe('request plumbing', () => {
  test('wrong method, no sign-in, wrong content type, bad JSON and an oversized body are refused and nothing is sent', async () => {
    assert.equal(parse(await handler(makeEvent({ method: 'GET', headers: IP }))).status, 405)
    assert.equal((await call(undefined, { subscription: sub() })).status, 401)
    assert.equal((await call('not-a-token', { subscription: sub() })).status, 401)
    assert.equal(parse(await handler(makeEvent({ token: fake.tokenFor('alice'), body: '{}', raw: true, headers: { ...IP, 'content-type': 'text/plain' } }))).status, 415)
    assert.equal(parse(await handler(makeEvent({ token: fake.tokenFor('alice'), body: '{nope', raw: true, headers: IP }))).status, 400)
    assert.equal((await call(fake.tokenFor('alice'), undefined)).status, 400)
    assert.equal((await self('alice', { pad: 'x'.repeat(9000) })).status, 413)
    assert.equal((await call(fake.tokenFor('alice'), {})).status, 400)
    assert.equal(push.sent.length, 0)
  })

  test('answers are never cacheable and CORS is limited to the app\'s own origins', async () => {
    const own = await self('alice', {}, { headers: { ...IP, origin: 'https://www.revisionflow.co.uk' } })
    assert.equal(own.headers['Cache-Control'], 'no-store')
    assert.equal(own.headers['Access-Control-Allow-Origin'], 'https://www.revisionflow.co.uk')
    const evil = await self('alice', {}, { headers: { ...IP, origin: 'https://evil.example' } })
    assert.equal(evil.headers['Access-Control-Allow-Origin'], undefined)
  })
})

describe('a student\'s own device', () => {
  test('a normal subscription from each browser family is sent to, with a bounded lifetime and timeout', async () => {
    const endpoints = [
      FCM, 'https://fcm.googleapis.com/wp/abcDEF_123',
      'https://updates.push.services.mozilla.com/wpush/v2/gAAAAAB',
      'https://web.push.apple.com/QGyZ0000',
      'https://wns2-par02p.notify.windows.com/w/?token=BQYAAAB',
    ]
    for (const endpoint of endpoints) {
      push.sent.length = 0
      const r = await self('alice', { subscription: sub(endpoint) })
      assert.equal(r.status, 200, endpoint)
      assert.deepEqual(r.json, { ok: true })
      assert.equal(push.sent.length, 1)
      assert.equal(push.sent[0].subscription.endpoint, endpoint)
      assert.deepEqual(push.sent[0].options, { TTL: 3600, timeout: 10000 })
    }
    assert.equal(push.vapid.length, 1, 'VAPID details are set once')
    assert.equal(push.vapid[0][0], 'mailto:admin@example.test')
  })

  test('only the fields web-push needs are passed on', async () => {
    await self('alice', { subscription: { ...sub(), expirationTime: null, __proto__: { x: 1 }, extra: 'ignored', keys: { ...KEYS, other: 'x' } } })
    assert.deepEqual(Object.keys(push.sent[0].subscription).sort(), ['endpoint', 'keys'])
    assert.deepEqual(Object.keys(push.sent[0].subscription.keys).sort(), ['auth', 'p256dh'])
  })

  test('THE SERVER NEVER CALLS an address that is not a known push service (no probing of hosts, ports or internal addresses)', async () => {
    const bad = [
      'https://evil.example/collect', 'http://fcm.googleapis.com/fcm/send/x', 'https://fcm.googleapis.com.evil.example/fcm/send/x',
      'https://evilfcm.googleapis.com.example.org/x', 'https://notfcm.googleapis.com.attacker.io/', 'https://fcm.googleapis.com@evil.example/x',
      'https://fcm.googleapis.com:fakepass@evil.example/x', 'https://user:pass@fcm.googleapis.com/fcm/send/x', 'https://user@fcm.googleapis.com/fcm/send/x', 'https://evil.example\\@fcm.googleapis.com/x', 'https://evil.example#@fcm.googleapis.com/x',
      'https://fcm.googleapis.com:8443/fcm/send/x', 'https://fcm.googleapis.com:22/x', 'https://127.0.0.1/', 'https://localhost/', 'https://[::1]/',
      'https://169.254.169.254/latest/meta-data/', 'https://metadata.google.internal/', 'https://10.0.0.5/', 'ftp://fcm.googleapis.com/x',
      'javascript:alert(1)', 'file:///etc/passwd', '//fcm.googleapis.com/x', 'fcm.googleapis.com/x', '', ' ' + FCM, FCM + ' ', FCM + '\n', 'https://fcm.googleapis.com/x y',
      'https://fcm.googleapis.com./x', 'https://xn--fcm-9ea.googleapis.com/x', 'https://FCM.GOOGLEAPIS.COM.evil.example/x', 'https://apple.com/', 'https://google.com/',
      'https://mozilla.com/', 'https://windows.com/', 'https://sub.notify.windows.com.evil.example/x', 'https://x.push.apple.com.evil.example/x',
      'https://' + 'a'.repeat(2100) + '.fcm.googleapis.com/', 12345, null, {}, [FCM], true,
    ]
    for (const endpoint of bad) {
      const r = await self('alice', { subscription: sub(endpoint) })
      assert.equal(r.status, 400, String(endpoint).slice(0, 60))
      assert.equal(r.json.code, 'bad_subscription')
    }
    assert.equal(push.sent.length, 0)
  })

  test('PUSH_ENDPOINT_HOSTS adds a service (host names only), and does not loosen anything else', async () => {
    process.env.PUSH_ENDPOINT_HOSTS = 'push.example-service.net, not a host, ../x, 127.0.0.1'
    assert.equal(internals.pushEndpointHost('https://push.example-service.net/abc'), 'push.example-service.net')
    assert.equal(internals.pushEndpointHost('https://eu.push.example-service.net/abc'), 'eu.push.example-service.net')
    assert.equal(internals.pushEndpointHost('https://127.0.0.1/abc'), null)
    assert.equal(internals.pushEndpointHost('https://example-service.net/abc'), null)
    assert.equal(internals.pushEndpointHost('https://push.example-service.net:444/abc'), null)
  })

  test('both URL parsers must agree on the host, and keys must look like base64url keys', async () => {
    // a host written two ways must never be accepted when the two parsers could read it differently
    assert.equal(internals.pushEndpointHost('https://fcm.googleapis.com/fcm/send/x'), 'fcm.googleapis.com')
    for (const keys of [undefined, null, {}, { p256dh: KEYS.p256dh }, { auth: KEYS.auth }, { p256dh: 1, auth: 2 }, { p256dh: 'short', auth: KEYS.auth },
      { p256dh: KEYS.p256dh, auth: 'has spaces and !!' }, { p256dh: 'x'.repeat(300), auth: KEYS.auth }, 'string', [KEYS.p256dh]]) {
      const r = await self('alice', { subscription: { endpoint: FCM, keys } })
      assert.equal(r.status, 400, JSON.stringify(keys)?.slice(0, 40))
    }
    for (const subscription of ['https://fcm.googleapis.com/x', 7, [], null, true]) assert.equal((await self('alice', { subscription })).status, 400)
    assert.equal(push.sent.length, 0)
  })

  test('the notification text is bounded and cleaned, and the link can only be a path inside this site', async () => {
    await self('alice', { title: 'T'.repeat(500), message: 'line1\nline2\u0000\u0007  spaced   out ' + 'm'.repeat(1000), url: '/dashboard?tab=1' })
    const p = push.sent[0].payload
    assert.equal(p.title.length, internals.TITLE_MAX)
    assert.equal(p.body.length, internals.MESSAGE_MAX)
    assert.ok(!/[\u0000-\u001f]/.test(p.body))
    assert.ok(p.body.startsWith('line1 line2 spaced out'))
    assert.equal(p.url, '/dashboard?tab=1')
    assert.equal(p.icon, '/favicon.svg')

    for (const url of ['https://evil.example/x', '//evil.example', '/\\evil.example', 'javascript:alert(1)', 'data:text/html,hi', '/ spaced', '/<script>', 7, null, {}, '/' + 'a'.repeat(300)]) {
      push.sent.length = 0
      await self('alice', { url })
      assert.equal(push.sent[0].payload.url, '/', String(url).slice(0, 40))
    }
    push.sent.length = 0
    await self('alice', { title: 42, message: { a: 1 } })
    assert.equal(push.sent[0].payload.title, 'RevisionFlow')
    assert.equal(push.sent[0].payload.body, 'Time to revise!')
  })

  test('a subscription the browser has dropped (410 or 404) is reported as expired, not as an error', async () => {
    for (const statusCode of [410, 404]) {
      push.behaviour = () => ({ throw: Object.assign(new Error('gone'), { statusCode }) })
      const r = await self('alice')
      assert.equal(r.status, 200)
      assert.deepEqual(r.json, { ok: true, expired: true })
    }
  })

  test('any other failure is a generic error: no host names, no provider text, and only a status code in the log', async () => {
    push.behaviour = () => ({ throw: Object.assign(new Error('getaddrinfo ENOTFOUND internal-db.corp.example (alice@example.test)'), { statusCode: 403, body: 'secret provider body' }) })
    const r = await self('alice')
    assert.equal(r.status, 502)
    assert.equal(r.json.code, 'push_failed')
    const text = JSON.stringify(r.json) + logs.join('\n')
    for (const leak of ['ENOTFOUND', 'internal-db', 'secret provider body', 'alice@example.test', FCM, KEYS.auth, KEYS.p256dh]) assert.ok(!text.includes(leak), 'leaked: ' + leak)
    assert.ok(logs.some((l) => l.includes('(HTTP 403)')))
    push.behaviour = () => ({ throw: new Error('socket hang up') })
    assert.equal((await self('alice')).status, 502)
  })

  test('each account may send 20 an hour', async () => {
    for (let i = 0; i < 20; i++) assert.equal((await self('alice')).status, 200, 'send ' + i)
    const r = await self('alice')
    assert.equal(r.status, 429)
    assert.ok(Number(r.headers['Retry-After']) >= 1)
    assert.equal((await self('bob')).status, 200)
  })

  test('without VAPID keys (or with unusable ones) the answer is a generic "not available" and nothing is sent', async () => {
    delete process.env.VAPID_PRIVATE_KEY
    const mod = freshRequire('netlify/functions/notify.js')
    const r = parse(await mod.handler(makeEvent({ token: fake.tokenFor('alice'), body: { subscription: sub() }, headers: IP })))
    assert.equal(r.status, 503)
    assert.ok(!/VAPID|env/i.test(JSON.stringify(r.json)))
    assert.equal(push.sent.length, 0)

    process.env.VAPID_PRIVATE_KEY = 'bad'
    push.vapid.length = 0
    installFakeWebPush({ setVapidDetails: () => { throw new Error('Vapid private key should be 32 bytes') }, sendNotification: async () => { push.sent.push(1) } })
    const mod2 = freshRequire('netlify/functions/notify.js')
    const r2 = parse(await mod2.handler(makeEvent({ token: fake.tokenFor('alice'), body: { subscription: sub() }, headers: IP })))
    assert.equal(r2.status, 503)
    assert.ok(!JSON.stringify(r2.json).includes('32 bytes'))
    assert.equal(push.sent.length, 0)
  })
})

describe('admin broadcast', () => {
  const many = (n, endpoint = FCM) => Array.from({ length: n }, (_, i) => sub(endpoint + i))

  test('only a verified admin may broadcast: not a signed-in student, not an unverified e-mail, not another address', async () => {
    assert.equal((await call(fake.tokenFor('alice'), { subscriptions: many(2) })).status, 403)
    assert.equal((await adminCall({ subscriptions: many(2) }, { emailVerified: false })).status, 403)
    assert.equal((await adminCall({ subscriptions: many(2) }, { email: 'ADMIN-lookalike@example.test' })).status, 403)
    assert.equal(push.sent.length, 0)
  })

  test('the admin gate is the shared one: revoked sessions and signed-out requests are refused', async () => {
    assert.equal((await call(undefined, { subscriptions: many(1) })).status, 401)
    const t = fake.tokenFor('admin', { authAgeSeconds: 5000 })
    fake.authUsers.get('admin').tokensValidAfter = Math.floor(Date.now() / 1000) + 10
    assert.equal((await call(t, { subscriptions: many(1) })).status, 401)
  })

  test('a verified admin reaches every valid subscription, and unusable entries are counted as failed and never sent', async () => {
    push.behaviour = (s) => (s.endpoint.endsWith('3') ? { throw: Object.assign(new Error('gone'), { statusCode: 410 }) } : s.endpoint.endsWith('4') ? { throw: new Error('boom') } : {})
    const subs = [...many(5), sub('https://evil.example/x'), { endpoint: FCM }, 'junk', null]
    const r = await adminCall({ subscriptions: subs, title: 'Exams soon', message: 'Revise', url: '/dashboard' })
    assert.equal(r.status, 200)
    assert.deepEqual(r.json, { ok: true, sent: 3, expired: 1, failed: 1 + 4 })
    assert.equal(push.sent.length, 5, 'only the five valid ones were attempted')
    assert.ok(push.sent.every((s) => s.payload.title === 'Exams soon' && s.options.timeout === 10000))
    assert.ok(push.sent.every((s) => internals.pushEndpointHost(s.subscription.endpoint)))
  })

  test('size and shape are bounded', async () => {
    assert.equal((await adminCall({ subscriptions: [] })).status, 400)
    assert.equal((await adminCall({ subscriptions: 'x' })).status, 400)
    assert.equal((await adminCall({ subscriptions: null })).status, 400)
    assert.equal((await adminCall({ subscriptions: many(internals.MAX_BROADCAST + 1) })).status, 400)
    assert.equal(push.sent.length, 0)
    assert.equal((await adminCall({ subscriptions: many(internals.MAX_BROADCAST) })).json.sent, internals.MAX_BROADCAST)
  })

  test('broadcasts are rate limited (20 an hour) and the limit is separate from students\' own sends', async () => {
    for (let i = 0; i < 20; i++) assert.equal((await adminCall({ subscriptions: many(1) })).status, 200, 'broadcast ' + i)
    assert.equal((await adminCall({ subscriptions: many(1) })).status, 429)
  })
})
