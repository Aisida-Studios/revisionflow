// tests/functions/announcements.test.mjs
// Unit tests of netlify/functions/announcements.js against the FAKE Admin SDK (tests/helpers/fakeAdmin.js, not the emulator).
// They prove our code's behaviour; they do not prove Firestore index or rules behaviour (see CHANGES-EXPLAINED.md, "Tests: what they prove and what they do not").
import { describe, test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { makeFakeAdmin, freshRequire, makeEvent, parse, Timestamp } from '../helpers/fakeAdmin.js'

const nodeRequire = createRequire(import.meta.url)
const { hashKey } = nodeRequire('../../netlify/functions/lib/rateLimit.js')   // pure function of (salt, route, id)
const { DEFAULT_ADMIN_EMAILS } = nodeRequire('../../netlify/functions/lib/auth.js')   // the address used when ADMIN_EMAILS is not set

let fake, handler, internals, logs
const realConsole = { log: console.log, warn: console.warn, error: console.error }
const IP = { 'x-nf-client-connection-ip': '203.0.113.50' }
const OWNER = 'admin@example.test'
const DAY = 86400000
const GENERIC = { error: 'Something went wrong. Please try again.', code: 'server_error' }
const iso = (days = 0) => new Date(Date.now() + days * DAY).toISOString()

const call = async (token, body, extra = {}) => parse(await handler(makeEvent({ token, body, headers: IP, ...extra })))
const student = (uid, body = { action: 'active' }, tokenOpts = {}) => call(fake.tokenFor(uid, tokenOpts), body)
const admin = (action, params = {}, tokenOpts = {}) => call(fake.tokenFor('admin', tokenOpts), { action, ...params })
const audit = () => fake.paths('adminAuditLog/').map((p) => fake.read(p)).sort((a, b) => a.timestamp.localeCompare(b.timestamp))
const stored = () => fake.paths('announcements/')
const ids = (r) => r.json.announcements.map((a) => a.id)
// A stored announcement, with the defaults the function itself would have written.
const ann = (id, over = {}) => fake.seed({
  ['announcements/' + id]: { message: 'Message ' + id, type: 'info', audience: 'all', linkUrl: null, linkText: null, expiresAt: null, active: true, createdAt: iso(-1), createdBy: OWNER, ...over },
})

beforeEach(() => {
  fake = makeFakeAdmin()
  fake.install()
  fake.addAuthUser('admin', { email: OWNER })
  for (const uid of ['alice', 'paula', 'bea', 'betty', 'sue', 'newbie']) fake.addAuthUser(uid)
  process.env.ADMIN_EMAILS = OWNER
  fake.seed({
    'users/alice': { displayName: 'Alice', isPro: false, betaUser: false },          // free
    'users/paula': { displayName: 'Paula', isPro: true, betaUser: false },           // a paying subscriber
    'users/bea': { displayName: 'Bea', isPro: true, betaUser: true },                // beta cohort (lifetime Pro)
    'users/betty': { displayName: 'Betty', isPro: false, betaUser: true },           // beta flag only
    'users/sue': { displayName: 'Sue', isPro: 'true', betaUser: 'true' },            // flags that are text, not booleans
    // 'newbie' is signed in but has no profile document yet
  })
  logs = []
  for (const k of ['log', 'warn', 'error']) console[k] = (...a) => { logs.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')) }
  const mod = freshRequire('netlify/functions/announcements.js')
  handler = mod.handler
  internals = mod._internals
})
afterEach(() => {
  Object.assign(console, realConsole)
  delete process.env.ADMIN_EMAILS
  delete process.env.APP_CHECK_ENFORCE
})

describe('who may call it', () => {
  test('method, content type, JSON and size are checked; answers are never cacheable and CORS has no wildcard', async () => {
    const token = fake.tokenFor('alice')
    assert.equal(parse(await handler(makeEvent({ method: 'GET', headers: IP }))).status, 405)
    assert.equal(parse(await handler(makeEvent({ token, body: '{}', raw: true, headers: { ...IP, 'content-type': 'text/plain' } }))).status, 415)
    assert.equal(parse(await handler(makeEvent({ token, body: '{nope', raw: true, headers: IP }))).status, 400)
    assert.equal(parse(await handler(makeEvent({ token, headers: IP }))).status, 400, 'no body at all')
    assert.equal((await call(token, [1])).status, 400)
    assert.equal((await call(token, { action: 'active', pad: 'x'.repeat(9000) })).status, 413)
    const ok = await call(token, { action: 'active' }, { headers: { ...IP, origin: 'https://www.revisionflow.co.uk' } })
    assert.equal(ok.status, 200)
    assert.equal(ok.headers['Cache-Control'], 'no-store')
    assert.equal(ok.headers['Access-Control-Allow-Origin'], 'https://www.revisionflow.co.uk')
    const evil = await call(token, { action: 'active' }, { headers: { ...IP, origin: 'https://evil.example' } })
    assert.equal(evil.headers['Access-Control-Allow-Origin'], undefined)
    assert.equal((await handler(makeEvent({ method: 'OPTIONS', headers: { ...IP, origin: 'https://www.revisionflow.co.uk' } }))).statusCode, 204)
  })

  test('a missing or odd action is a plain 400; an unknown one is refused to everyone but a verified admin', async () => {
    for (const action of [undefined, null, '', 7, {}, ['active'], true]) {
      assert.equal((await student('alice', { action })).status, 400, JSON.stringify(action))
    }
    assert.equal((await call(undefined, { action: 'dropEverything' })).status, 401, 'signed out: nothing is revealed about which actions exist')
    assert.equal((await student('alice', { action: 'dropEverything' })).status, 403)
    assert.equal((await admin('dropEverything')).status, 400)
    for (const action of ['__proto__', 'constructor', 'toString', 'x'.repeat(5000)]) {
      const r = await admin(action)
      assert.equal(r.status, 400, action.slice(0, 20))
      assert.ok(!JSON.stringify(r.json).includes('xxxx'), 'the action name is not echoed back')
    }
    assert.equal(audit().length, 0)
  })

  test('with APP_CHECK_ENFORCE=true a request without a valid App Check token is refused', async () => {
    assert.equal((await student('alice')).status, 200)
    process.env.APP_CHECK_ENFORCE = 'true'
    assert.equal((await student('alice')).status, 401)
    assert.equal(parse(await handler(makeEvent({ token: fake.tokenFor('alice'), body: { action: 'active' }, headers: { ...IP, 'x-firebase-appcheck': fake.appCheckToken } }))).status, 200)
  })

  test('`active` needs a signed-in account: not signed out, not a garbage or expired token', async () => {
    ann('x')
    assert.equal((await call(undefined, { action: 'active' })).status, 401)
    assert.equal((await call('garbage', { action: 'active' })).status, 401)
    assert.equal((await student('alice', { action: 'active' }, { expired: true })).status, 401)
    assert.equal((await student('newbie')).status, 200, 'an account with no profile document yet is still served')
  })

  test('create, update, delete and list need a VERIFIED admin: not signed out, not a student, not an unverified or look-alike address, not a revoked session', async () => {
    ann('keep', { message: 'Original' })
    const attempts = [['create', { message: 'Hello' }], ['update', { id: 'keep', message: 'Changed' }], ['delete', { id: 'keep' }], ['list', {}]]
    for (const [action, params] of attempts) {
      const body = { action, ...params }
      assert.equal((await call(undefined, body)).status, 401, action + ' signed out')
      assert.equal((await call('garbage', body)).status, 401, action + ' garbage token')
      const asStudent = await call(fake.tokenFor('alice'), body)
      assert.equal(asStudent.status, 403, action + ' student')
      assert.ok(!JSON.stringify(asStudent.json).includes('Original'), action + ' reveals nothing')
      assert.equal((await admin(action, params, { emailVerified: false })).status, 403, action + ' unverified address')
      assert.equal((await admin(action, params, { email: 'ADMIN-lookalike@example.test' })).status, 403, action + ' look-alike')
      assert.equal((await admin(action, params, { email: 'admin@example.test.evil.io' })).status, 403, action + ' suffix trick')
    }
    fake.authUsers.get('admin').tokensValidAfter = Math.floor(Date.now() / 1000) + 30
    for (const [action, params] of attempts) assert.equal((await admin(action, params)).status, 401, action + ' revoked session')
    assert.deepEqual(stored(), ['announcements/keep'])
    assert.equal(fake.read('announcements/keep').message, 'Original')
    assert.equal(audit().length, 0)
  })

  test('the e-mail the request CLAIMS is never trusted, and the admin list comes from ADMIN_EMAILS, not a constant in the file', async () => {
    const r = await call(fake.tokenFor('alice'), { action: 'create', message: 'Hi', callerEmail: OWNER, adminEmail: OWNER, email: OWNER, createdBy: OWNER })
    assert.equal(r.status, 403)
    assert.equal(stored().length, 0)
    // the previous hard-coded owner address no longer works unless it is on the configured list
    assert.ok(DEFAULT_ADMIN_EMAILS.length > 0 && !DEFAULT_ADMIN_EMAILS.includes(OWNER), 'the built-in default is a different address from the configured one')
    assert.equal((await admin('list', {}, { email: DEFAULT_ADMIN_EMAILS[0] })).status, 403)
    process.env.ADMIN_EMAILS = OWNER + ',second-admin@example.test'
    fake.addAuthUser('second', { email: 'second-admin@example.test' })
    assert.equal((await call(fake.tokenFor('second', { email: 'second-admin@example.test' }), { action: 'list' })).status, 200)
  })
})

describe('what a student is shown (`active`)', () => {
  test('exactly what the banner needs: id, message, type and link, and nothing about audience, expiry, author or state', async () => {
    ann('x', { message: 'Hello', type: 'success', audience: 'free', linkUrl: '/pro', linkText: 'See Pro', expiresAt: iso(3) })
    const r = await student('alice')
    assert.deepEqual(r.json, { announcements: [{ id: 'x', message: 'Hello', type: 'success', linkUrl: '/pro', linkText: 'See Pro' }] })
  })

  test('at most three, newest first (sorted on the server, whatever order they were stored in)', async () => {
    ann('a', { createdAt: iso(-5) }); ann('e', { createdAt: iso(-1) }); ann('c', { createdAt: iso(-3) }); ann('b', { createdAt: iso(-4) }); ann('d', { createdAt: iso(-2) })
    assert.deepEqual(ids(await student('alice')), ['e', 'd', 'c'])
  })

  test('the audience matrix: free, paying Pro, beta and "everyone", resolved from the account on the server', async () => {
    for (const audience of ['all', 'free', 'pro', 'beta']) ann('for-' + audience, { audience })
    const expected = {
      alice: ['all', 'free'],            // free
      paula: ['all', 'pro'],             // paying subscriber: sees "pro", not "free"
      bea: ['all', 'beta'],              // beta (isPro AND betaUser): beta only, never the paying-subscriber message
      betty: ['all', 'beta'],            // betaUser without isPro
      sue: ['all', 'free'],              // 'true' as text is not true: treated as free
      newbie: ['all', 'free'],           // no profile document
    }
    for (const [uid, audiences] of Object.entries(expected)) {
      const r = await student(uid)
      assert.equal(r.status, 200, uid)
      assert.deepEqual(ids(r).sort(), audiences.map((a) => 'for-' + a).sort(), uid)
    }
  })

  test('nothing in the request can change who the caller is or what audience they get', async () => {
    ann('for-beta', { audience: 'beta' }); ann('for-free', { audience: 'free' })
    const r = await student('alice', { action: 'active', uid: 'bea', userId: 'bea', isPro: true, betaUser: true, audience: 'beta', email: 'bea@example.test' })
    assert.deepEqual(ids(r), ['for-free'])
  })

  test('inactive, expired and unreadable-expiry announcements are not shown; no expiry and a future expiry are', async () => {
    ann('live-none'); ann('live-future', { expiresAt: iso(2) })
    ann('off', { active: false }); ann('past', { expiresAt: iso(-1) })
    ann('timestamp', { expiresAt: Timestamp.fromMillis(Date.now() + DAY) })      // not an ISO string
    ann('number', { expiresAt: Date.now() + DAY }); ann('words', { expiresAt: 'tomorrow' }); ann('zzz', { expiresAt: 'zzz' })
    // 30 minutes ago, written with a +05:00 offset: its wall-clock text is later than "now", but the instant has passed
    ann('offset-past', { expiresAt: new Date(Date.now() - 30 * 60000 + 5 * 3600000).toISOString().replace('Z', '+05:00') })
    assert.deepEqual(ids(await student('alice')).sort(), ['live-future', 'live-none'])
  })

  test('a stored record that is missing optional fields still works (no audience = everyone, no type = info)', async () => {
    fake.seed({ 'announcements/bare': { message: 'Bare', active: true, createdAt: iso(-1) } })
    assert.deepEqual((await student('alice')).json.announcements, [{ id: 'bare', message: 'Bare', type: 'info', linkUrl: null, linkText: null }])
  })

  test('a stored record that cannot be shown safely is skipped: unknown audience, blank or non-text message', async () => {
    ann('weird-audience', { audience: 'admins' })
    ann('blank', { message: '   ' }); ann('number', { message: 12 }); ann('missing', { message: undefined })
    ann('fine', { message: 'Fine' })
    for (const uid of ['alice', 'paula', 'bea']) assert.deepEqual(ids(await student(uid)), ['fine'], uid)
  })

  test('a stored message is capped at 500 characters and an unknown type shows as info', async () => {
    ann('long', { message: 'y'.repeat(900), type: 'danger' })
    const [a] = (await student('alice')).json.announcements
    assert.equal(a.message.length, internals.MESSAGE_MAX)
    assert.equal(a.type, 'info')
  })

  test('a stored dangerous link is dropped when served, but the message is still shown', async () => {
    ann('bad-link', { linkUrl: 'javascript:alert(document.cookie)', linkText: 'Click me' })
    const [a] = (await student('alice')).json.announcements
    assert.equal(a.message, 'Message bad-link')
    assert.equal(a.linkUrl, null)
    assert.equal(a.linkText, null)
  })

  test('publicView re-checks every link, whatever was stored', () => {
    for (const linkUrl of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,<script>alert(1)</script>', '//evil.example/x', '/\\evil.example', 'http://example.com/', 'https:example.com',
      'https://user:pass@example.com/', 'vbscript:x', ' /pro', 12345, { href: '/pro' }, ['/pro'], true]) {
      const v = internals.publicView({ id: 'x', message: 'Hi', type: 'info', linkUrl, linkText: 'Click' })
      assert.equal(v.linkUrl, null, JSON.stringify(linkUrl))
      assert.equal(v.linkText, null, JSON.stringify(linkUrl))
      assert.equal(v.message, 'Hi')
    }
    const good = internals.publicView({ id: 'x', message: 'Hi', type: 'warning', linkUrl: 'https://www.revisionflow.co.uk/pro', linkText: 'Plans' })
    assert.deepEqual(good, { id: 'x', message: 'Hi', type: 'warning', linkUrl: 'https://www.revisionflow.co.uk/pro', linkText: 'Plans' })
    assert.equal(internals.publicView({ id: 'x', message: 'Hi', linkUrl: '/pro', linkText: 'y'.repeat(61) }).linkText, null, 'over-long link text is dropped, the link stays')
    assert.equal(internals.publicView({ id: 'x', message: 'Hi', linkUrl: '/pro', linkText: 'y'.repeat(61) }).linkUrl, '/pro')
  })

  test('`active` is limited per account (120 an hour); one account hitting it does not slow another', async () => {
    for (let i = 0; i < 120; i++) assert.equal((await student('alice')).status, 200, 'call ' + i)
    const r = await student('alice')
    assert.equal(r.status, 429)
    assert.equal(r.json.code, 'rate_limited')
    assert.ok(Number(r.headers['Retry-After']) >= 1)
    assert.equal((await student('paula')).status, 200)
  })

  test('if the rate-limit store is down the banner still loads (per-instance counters take over)', async () => {
    fake.failNext({ op: 'get', path: /^rateLimits\// }, new Error('store down'), { times: 3 })
    assert.equal((await student('alice')).status, 200)
  })

  test('an unexpected failure is a generic answer, and nothing personal reaches the log', async () => {
    fake.failNext({ op: 'query', path: 'announcements' }, new Error('boom alice@example.test projects/p/databases/(default)/documents/users/alice/secret Bearer abc.def.ghi'))
    const r = await student('alice')
    assert.equal(r.status, 500)
    assert.deepEqual(r.json, GENERIC)
    const text = logs.join('\n')
    assert.ok(text.includes('[announcements]'))
    for (const secret of ['alice@example.test', 'users/alice', 'Bearer abc', 'abc.def.ghi']) assert.ok(!text.includes(secret), secret)
  })
})

describe('field checks', () => {
  test('a link is only a plain https:// address or a path inside this site', () => {
    const OK = ['/pro', '/study?tab=notes#top', '/a/b-c_d.e~f', '/x?y=1&z=%20', 'https://www.revisionflow.co.uk/pro', 'https://example.com', 'https://example.com/a?b=c&d=e', 'HTTPS://Example.com/x', "/pro's"]
    const NO = ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', '  javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'vbscript:msgbox(1)', 'blob:https://example.com/x', 'file:///etc/passwd',
      'ftp://example.com/x', 'http://example.com/x', 'https:example.com', 'https:/example.com', 'https://user:pass@example.com/', 'https://user@example.com/', 'https://localhost/x', 'https://exa mple.com',
      '//evil.example/x', '/\\evil.example', '/\\\\evil.example', '/pro now', '/pro\n', '/pro\t', ' /pro', 'pro', 'www.example.com', '/a"b', '/a<b', '/a>b', '/a`b', '/a{b}', '/a|b', '/a^b', '/a[b]',
      '/pro‮', '/café', 'https://example.com/' + 'x'.repeat(500), 7, {}, ['/pro'], true,
      // new URL() quietly drops tabs/newlines and turns a backslash into "/", so these parse as valid https addresses on their own;
      // the stored text must not carry them.
      'https://exa\tmple.com', 'https://example.com/a\nb', 'https://example.com/a\u0000b', 'https://example.com/a\\b']
    for (const v of OK) assert.deepEqual(internals.checkLinkUrl(v), { ok: true, value: v }, String(v))
    for (const v of NO) assert.equal(internals.checkLinkUrl(v).ok, false, JSON.stringify(v).slice(0, 60))
    for (const v of [undefined, null, '']) assert.deepEqual(internals.checkLinkUrl(v), { ok: true, value: null }, 'blank means no link')
  })

  test('an expiry is a real date written year-month-day, stored as an ISO instant', () => {
    assert.deepEqual(internals.checkExpiresAt('2026-12-01'), { ok: true, value: '2026-12-01T00:00:00.000Z' })
    assert.deepEqual(internals.checkExpiresAt('2026-12-01T23:59:59+01:00'), { ok: true, value: '2026-12-01T22:59:59.000Z' })
    assert.equal(internals.checkExpiresAt('2026-12-01T23:59:59.000Z').value, '2026-12-01T23:59:59.000Z')
    for (const v of ['tomorrow', '1', '12/01/2026', '2026-13-45', '2026-12-01T25:00:00Z', 7, {}, ['2026-12-01'], 'x'.repeat(41)]) assert.equal(internals.checkExpiresAt(v).ok, false, JSON.stringify(v))
    for (const v of [undefined, null, '']) assert.deepEqual(internals.checkExpiresAt(v), { ok: true, value: null })
  })

  test('isLive compares real instants and hides an expiry it cannot read', () => {
    const now = Date.parse('2026-11-16T12:00:00Z')
    for (const v of [undefined, null, '', '2026-11-16T12:00:01Z', '2026-12-01', '2026-11-16T23:00:00+05:00']) assert.equal(internals.isLive(v, now), true, String(v))
    for (const v of ['2026-11-16T12:00:00Z', '2026-11-15', '2026-11-16T17:00:00+05:00', 'tomorrow', 'zzz', '1', 0, 4102444800000, new Date('2030-01-01'), Timestamp.fromMillis(4102444800000), {}, []]) assert.equal(internals.isLive(v, now), false, JSON.stringify(v))
  })

  test('audienceMatches', () => {
    const m = internals.audienceMatches
    assert.deepEqual(['all', 'free', 'pro', 'beta', 'nope', undefined].map((a) => m(a, false, false)), [true, true, false, false, false, false])
    assert.deepEqual(['all', 'free', 'pro', 'beta'].map((a) => m(a, true, false)), [true, false, true, false])
    assert.deepEqual(['all', 'free', 'pro', 'beta'].map((a) => m(a, true, true)), [true, false, false, true])
    assert.deepEqual(['all', 'free', 'pro', 'beta'].map((a) => m(a, false, true)), [true, false, false, true])
  })
})

describe('admin: create', () => {
  test('creates an announcement with sensible defaults, recorded against the VERIFIED admin', async () => {
    const r = await admin('create', { message: '  Mock exams start Monday  ', createdBy: 'mallory@example.test', active: false, createdAt: '2001-01-01T00:00:00.000Z', id: 'forced-id' })
    assert.equal(r.status, 200)
    assert.equal(r.json.ok, true)
    assert.match(r.json.id, /^[A-Za-z0-9_-]+$/)
    assert.notEqual(r.json.id, 'forced-id')
    const { createdAt, ...rest } = fake.read('announcements/' + r.json.id)
    assert.deepEqual(rest, { message: 'Mock exams start Monday', type: 'info', audience: 'all', linkUrl: null, linkText: null, expiresAt: null, active: true, createdBy: OWNER })
    assert.ok(Math.abs(Date.parse(createdAt) - Date.now()) < 60000, 'createdAt is the server clock, not the request')
    const [entry] = audit()
    assert.equal(entry.action, 'createAnnouncement')
    assert.equal(entry.actorEmail, OWNER)
    assert.equal(entry.actorUid, 'admin')
    assert.deepEqual(entry.details, { id: r.json.id, audience: 'all', type: 'info' })
    assert.match(entry.timestamp, /^\d{4}-\d\d-\d\dT/)
  })

  test('every field is stored as validated: text trimmed, expiry as an ISO instant, link text only kept with a link', async () => {
    const r = await admin('create', { message: 'Pro prices change', type: 'warning', audience: 'pro', linkUrl: 'https://www.revisionflow.co.uk/pro', linkText: '  See the plans ', expiresAt: '2026-12-01T23:59:59+01:00' })
    const { createdAt, ...doc } = fake.read('announcements/' + r.json.id)
    assert.deepEqual(doc, { message: 'Pro prices change', type: 'warning', audience: 'pro', linkUrl: 'https://www.revisionflow.co.uk/pro', linkText: 'See the plans', expiresAt: '2026-12-01T22:59:59.000Z', active: true, createdBy: OWNER })
    const orphan = await admin('create', { message: 'No link', linkText: 'Orphan text' })
    assert.equal(fake.read('announcements/' + orphan.json.id).linkText, null)
  })

  test('the admin screen\'s own shapes work: null or empty for the optional fields', async () => {
    assert.equal((await admin('create', { message: 'a', linkUrl: null, linkText: null, expiresAt: null })).status, 200)
    assert.equal((await admin('create', { message: 'b', linkUrl: '', linkText: '', expiresAt: '' })).status, 200)
    assert.equal((await admin('create', { message: 'c', type: 'info', audience: 'all', linkUrl: '/pro', linkText: 'See what\'s new', expiresAt: new Date('2026-12-01T23:59:59').toISOString() })).status, 200)
    assert.equal(stored().length, 3)
  })

  test('bad input is refused with a plain 400, and nothing is stored or recorded', async () => {
    const BAD = [
      {}, { message: '' }, { message: '   ' }, { message: 7 }, { message: null }, { message: ['x'] }, { message: { a: 1 } }, { message: 'x'.repeat(501) },
      { message: 'ok', type: 'danger' }, { message: 'ok', type: null }, { message: 'ok', type: 7 }, { message: 'ok', type: ['info'] },
      { message: 'ok', audience: 'everyone' }, { message: 'ok', audience: 'ALL' }, { message: 'ok', audience: null }, { message: 'ok', audience: ['all'] },
      { message: 'ok', linkUrl: 'x'.repeat(501) }, { message: 'ok', linkUrl: 7 }, { message: 'ok', linkUrl: {} }, { message: 'ok', linkUrl: 'javascript:alert(1)' }, { message: 'ok', linkUrl: '//evil.example' },
      { message: 'ok', linkText: 'x'.repeat(61) }, { message: 'ok', linkText: 7 },
      { message: 'ok', expiresAt: 'tomorrow' }, { message: 'ok', expiresAt: 7 }, { message: 'ok', expiresAt: '1' }, { message: 'ok', expiresAt: '2026-13-45' }, { message: 'ok', expiresAt: 'x'.repeat(100) }, { message: 'ok', expiresAt: {} },
    ]
    for (const body of BAD) {
      const r = await admin('create', body)
      assert.equal(r.status, 400, JSON.stringify(body).slice(0, 70))
      assert.equal(r.json.code, 'bad_request')
    }
    assert.equal(stored().length, 0)
    assert.equal(audit().length, 0)
    const echoed = await admin('create', { message: 'ok', linkUrl: 'javascript:alert(document.cookie)' })
    assert.ok(!JSON.stringify(echoed.json).includes('document.cookie'), 'the refused value is not echoed back')
  })

  test('the record of the change is written FIRST: if it cannot be written, nothing is created', async () => {
    fake.failNext({ op: 'set', path: /^adminAuditLog\// }, new Error('audit store down'), { times: 5 })
    const r = await admin('create', { message: 'Hello' })
    assert.equal(r.status, 500)
    assert.deepEqual(r.json, GENERIC)
    assert.equal(stored().length, 0)
  })

  test('if saving fails after the record was written, the caller gets a generic error and the log carries no detail', async () => {
    fake.failNext({ op: 'set', path: /^announcements\// }, new Error('write failed for alice@example.test at projects/p/databases/(default)/documents/announcements/secret'))
    const r = await admin('create', { message: 'Hello' })
    assert.equal(r.status, 500)
    assert.deepEqual(r.json, GENERIC)
    const text = logs.join('\n')
    assert.ok(!text.includes('alice@example.test') && !text.includes('announcements/secret'))
  })

  test('admin actions are limited per admin (600 an hour); a student\'s allowance is separate', async () => {
    fake.seed({ ['rateLimits/' + hashKey('announcements.admin', 'admin')]: { route: 'announcements.admin', count: 600, windowStart: Date.now(), expiresAt: new Date(Date.now() + 2 * 3600000) } })
    const r = await admin('create', { message: 'Hello' })
    assert.equal(r.status, 429)
    assert.equal(r.json.code, 'rate_limited')
    assert.ok(Number(r.headers['Retry-After']) >= 1)
    assert.equal(stored().length, 0)
    assert.equal(audit().length, 0)
    assert.equal((await student('alice')).status, 200)
  })
})

describe('admin: list', () => {
  test('lists everything for the admin screen, newest first: inactive, expired and every audience included', async () => {
    ann('l1', { createdAt: iso(-3), audience: 'beta' }); ann('l2', { createdAt: iso(-1), active: false }); ann('l3', { createdAt: iso(-2), expiresAt: iso(-1) })
    const r = await admin('list')
    assert.equal(r.status, 200)
    assert.deepEqual(ids(r), ['l2', 'l3', 'l1'])
    assert.equal(r.json.announcements[0].createdBy, OWNER)
    assert.equal(r.json.announcements[0].active, false)
    assert.equal(audit().length, 0, 'announcement text is public to the audience: reading the list is not an audited event')
  })
})

describe('admin: update', () => {
  test('changes only the fields sent, validated, and records the change', async () => {
    ann('a1', { message: 'Old', type: 'info', audience: 'all', linkUrl: '/pro', linkText: 'Plans', expiresAt: iso(5) })
    assert.deepEqual((await admin('update', { id: 'a1', active: false })).json, { ok: true })
    let doc = fake.read('announcements/a1')
    assert.equal(doc.active, false)
    assert.equal(doc.message, 'Old')
    assert.equal(doc.linkUrl, '/pro')

    const r = await admin('update', { id: 'a1', message: ' New ', type: 'success', audience: 'beta', linkUrl: '', linkText: '', expiresAt: null, active: true })
    assert.equal(r.status, 200)
    const { createdAt, ...rest } = fake.read('announcements/a1')
    assert.ok(createdAt)
    assert.deepEqual(rest, { message: 'New', type: 'success', audience: 'beta', linkUrl: null, linkText: null, expiresAt: null, active: true, createdBy: OWNER })

    assert.deepEqual(audit().map((a) => [a.action, a.actorEmail, a.details.id]), [['updateAnnouncement', OWNER, 'a1'], ['updateAnnouncement', OWNER, 'a1']])
    assert.deepEqual(audit()[0].details.patch, { active: false })
  })

  test('fields that are not editable are ignored, including prototype keys', async () => {
    ann('a2')
    const before = fake.read('announcements/a2')
    const token = fake.tokenFor('admin')
    const raw = '{"action":"update","id":"a2","active":false,"createdBy":"mallory@example.test","createdAt":"2001-01-01T00:00:00.000Z","__proto__":{"message":"pwned"},"constructor":{"x":1}}'
    const r = parse(await handler(makeEvent({ token, body: raw, raw: true, headers: IP })))
    assert.equal(r.status, 200)
    assert.deepEqual(fake.read('announcements/a2'), { ...before, active: false })
    assert.equal({}.message, undefined, 'Object.prototype is untouched')
    assert.equal((await admin('update', { id: 'a2', createdBy: 'x', createdAt: 'y', foo: 1 })).status, 400, 'only unknown fields = nothing to update')
    assert.equal((await admin('update', { id: 'a2' })).status, 400)
  })

  test('an id that is not a plain document id is a 400; one that does not exist is a 404 and creates nothing', async () => {
    ann('a3')
    for (const id of [undefined, '', 'a/b', '../announcements/a3', 7, null, {}, ['a3'], 'x'.repeat(101), 'a b', 'a.b']) {
      assert.equal((await admin('update', { id, active: false })).status, 400, JSON.stringify(id)?.slice(0, 30))
    }
    const r = await admin('update', { id: 'ghost', active: false })
    assert.equal(r.status, 404)
    assert.equal(r.json.code, 'not_found')
    assert.equal(fake.exists('announcements/ghost'), false)
    assert.equal(fake.read('announcements/a3').active, true)
    assert.equal(audit().length, 0)
  })

  test('bad values are a 400 and change nothing', async () => {
    ann('a4', { message: 'Keep', linkUrl: '/pro', linkText: 'Plans', expiresAt: iso(5) })
    const before = JSON.stringify(fake.read('announcements/a4'))
    for (const patch of [{ message: '' }, { message: '   ' }, { message: 7 }, { message: 'x'.repeat(501) }, { type: 'danger' }, { audience: 'everyone' }, { active: 'false' }, { active: 0 }, { active: null },
      { linkUrl: 'javascript:alert(1)' }, { linkUrl: '//evil.example' }, { linkUrl: 7 }, { linkText: 'x'.repeat(61) }, { expiresAt: 'tomorrow' }, { expiresAt: 7 }]) {
      assert.equal((await admin('update', { id: 'a4', ...patch })).status, 400, JSON.stringify(patch).slice(0, 60))
    }
    assert.equal(JSON.stringify(fake.read('announcements/a4')), before)
    assert.equal(audit().length, 0)
  })

  test('the record of the change is written FIRST: if it cannot be written, nothing changes', async () => {
    ann('a5', { message: 'Original' })
    fake.failNext({ op: 'set', path: /^adminAuditLog\// }, new Error('audit store down'), { times: 5 })
    const r = await admin('update', { id: 'a5', message: 'Changed' })
    assert.equal(r.status, 500)
    assert.deepEqual(r.json, GENERIC)
    assert.equal(fake.read('announcements/a5').message, 'Original')
  })
})

describe('admin: delete', () => {
  test('deletes one announcement, records it, and leaves the others', async () => {
    ann('d1'); ann('d2')
    const r = await admin('delete', { id: 'd1' })
    assert.deepEqual(r.json, { ok: true })
    assert.deepEqual(stored(), ['announcements/d2'])
    assert.deepEqual(audit().map((a) => [a.action, a.actorEmail, a.details]), [['deleteAnnouncement', OWNER, { id: 'd1' }]])
  })

  test('an id that is not a plain document id deletes nothing', async () => {
    ann('d3')
    for (const id of [undefined, '', 'a/b', '../announcements/d3', 7, null, {}, ['d3'], 'x'.repeat(101), 'a b', 'a.b']) {
      assert.equal((await admin('delete', { id })).status, 400, JSON.stringify(id)?.slice(0, 30))
    }
    assert.deepEqual(stored(), ['announcements/d3'])
    assert.equal(audit().length, 0)
  })

  test('deleting something that is already gone is not an error', async () => {
    assert.deepEqual((await admin('delete', { id: 'ghost' })).json, { ok: true })
  })

  test('the record of the change is written FIRST: if it cannot be written, nothing is deleted', async () => {
    ann('d4')
    fake.failNext({ op: 'set', path: /^adminAuditLog\// }, new Error('audit store down'), { times: 5 })
    const r = await admin('delete', { id: 'd4' })
    assert.equal(r.status, 500)
    assert.deepEqual(r.json, GENERIC)
    assert.deepEqual(stored(), ['announcements/d4'])
  })
})
