// tests/functions/admin.test.mjs
// Unit tests of netlify/functions/admin.js against the FAKE Admin SDK (tests/helpers/fakeAdmin.js, not the emulator).
import { describe, test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { makeFakeAdmin, freshRequire, makeEvent, parse } from '../helpers/fakeAdmin.js'

let fake, handler, logs
const realConsole = { log: console.log, warn: console.warn, error: console.error }
const IP = { 'x-nf-client-connection-ip': '203.0.113.30' }
const OWNER = 'admin@example.test'

const call = async (token, body, extra = {}) => parse(await handler(makeEvent({ token, body, headers: IP, ...extra })))
const admin = (action, params = {}, tokenOpts = {}) => call(fake.tokenFor('admin', tokenOpts), { action, ...params })
const audit = () => fake.paths('adminAuditLog/').map((p) => fake.read(p)).sort((a, b) => a.timestamp.localeCompare(b.timestamp))
const auditActions = () => audit().map((a) => a.action)

beforeEach(() => {
  fake = makeFakeAdmin()
  fake.install()
  fake.addAuthUser('admin', { email: OWNER })
  for (const uid of ['alice', 'bob', 'carol']) fake.addAuthUser(uid)
  fake.addAuthUser('mallory', { email: 'mallory@example.test' })
  process.env.ADMIN_EMAILS = OWNER
  fake.seed({
    'users/alice': { displayName: 'Alice', email: 'alice@example.test', xp: 120, streak: 4, isPro: false, betaUser: false, createdAt: new Date('2026-01-03'), lastActivityDate: '2026-11-01', referredBy: 'bob',
      pushSubscription: { endpoint: 'https://fcm.googleapis.com/x', keys: { auth: 'a', p256dh: 'b' } }, stripeCustomerId: 'cus_123', stripeSubId: 'sub_123', examDates: [{ subject: 'Maths', date: '2027-06-01' }], subjects: [{ name: 'Maths' }], friends: ['bob'], referralCode: 'ALICE000', username: 'alice_r' },
    'users/bob': { displayName: 'Bob', email: 'bob@example.test', xp: 50, betaUser: true, createdAt: new Date('2026-02-03') },
    'users/carol': { displayName: 'Carol', email: 'carol@example.test', xp: 5, createdAt: new Date('2026-03-03') },
  })
  logs = []
  for (const k of ['log', 'warn', 'error']) console[k] = (...a) => { logs.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')) }
  handler = freshRequire('netlify/functions/admin.js').handler
})
afterEach(() => {
  Object.assign(console, realConsole)
  delete process.env.ADMIN_EMAILS
  delete process.env.APP_CHECK_ENFORCE
})

describe('who may call it', () => {
  test('only a verified admin: not signed out, not a student, not an unverified address, not a lookalike, not a revoked session', async () => {
    assert.equal((await call(undefined, { action: 'listUsers' })).status, 401)
    assert.equal((await call('garbage', { action: 'listUsers' })).status, 401)
    assert.equal((await call(fake.tokenFor('alice'), { action: 'listUsers' })).status, 403)
    assert.equal((await admin('listUsers', {}, { emailVerified: false })).status, 403)
    assert.equal((await admin('listUsers', {}, { email: 'ADMIN-lookalike@example.test' })).status, 403)
    assert.equal((await admin('listUsers', {}, { email: 'admin@example.test.evil.io' })).status, 403)
    fake.authUsers.get('admin').tokensValidAfter = Math.floor(Date.now() / 1000) + 30
    assert.equal((await admin('listUsers')).status, 401)
    assert.equal(fake.count('adminAuditLog/'), 0)
  })

  test('the e-mail the request CLAIMS is never trusted (the admin screen still sends callerEmail)', async () => {
    const r = await call(fake.tokenFor('mallory'), { action: 'setUserField', callerEmail: OWNER, adminEmail: OWNER, email: OWNER, targetUid: 'alice', field: 'isPro', value: true })
    assert.equal(r.status, 403)
    assert.equal(fake.read('users/alice').isPro, false)
    // and the real admin works whether or not it sends the field
    assert.equal((await admin('setUserField', { callerEmail: 'someone@else.test', targetUid: 'alice', field: 'isPro', value: true })).status, 200)
  })

  test('method, content type, JSON and size are checked; the answer is never cacheable and CORS has no wildcard', async () => {
    assert.equal(parse(await handler(makeEvent({ method: 'GET', headers: IP }))).status, 405)
    assert.equal(parse(await handler(makeEvent({ token: fake.tokenFor('admin'), body: '{}', raw: true, headers: { ...IP, 'content-type': 'text/plain' } }))).status, 415)
    assert.equal(parse(await handler(makeEvent({ token: fake.tokenFor('admin'), body: '{nope', raw: true, headers: IP }))).status, 400)
    assert.equal((await call(fake.tokenFor('admin'), [1])).status, 400)
    assert.equal((await admin('contentDraft', { kind: 'topicOverride', id: 'X', data: { pad: 'x'.repeat(1600000) } })).status, 413)
    const ok = await call(fake.tokenFor('admin'), { action: 'listUsers' }, { headers: { ...IP, origin: 'https://www.revisionflow.co.uk' } })
    assert.equal(ok.headers['Cache-Control'], 'no-store')
    assert.equal(ok.headers['Access-Control-Allow-Origin'], 'https://www.revisionflow.co.uk')
    const evil = await call(fake.tokenFor('admin'), { action: 'listUsers' }, { headers: { ...IP, origin: 'https://evil.example' } })
    assert.equal(evil.headers['Access-Control-Allow-Origin'], undefined)
  })

  test('a missing, odd or unknown action is a plain 400', async () => {
    for (const action of [undefined, null, '', 7, {}, ['listUsers'], 'dropEverything', '__proto__', 'x'.repeat(5000)]) {
      const r = await call(fake.tokenFor('admin'), { action })
      assert.equal(r.status, 400, String(action).slice(0, 20))
      assert.ok(!JSON.stringify(r.json).includes('xxxx'), 'the action name is not echoed back')
    }
    assert.equal(fake.count('adminAuditLog/'), 0)
  })

  test('with APP_CHECK_ENFORCE=true a request without a valid App Check token is refused', async () => {
    assert.equal((await admin('listUsers')).status, 200)
    process.env.APP_CHECK_ENFORCE = 'true'
    assert.equal((await admin('listUsers')).status, 401)
    assert.equal(parse(await handler(makeEvent({ token: fake.tokenFor('admin'), body: { action: 'listUsers' }, headers: { ...IP, 'x-firebase-appcheck': fake.appCheckToken } }))).status, 200)
  })
})

describe('plan flags (setUserField / bulkSetField)', () => {
  test('a flag is set, and the change is recorded with the VERIFIED admin, not a constant', async () => {
    const r = await admin('setUserField', { targetUid: 'alice', field: 'betaUser', value: true })
    assert.deepEqual(r.json, { ok: true })
    assert.equal(fake.read('users/alice').betaUser, true)
    const [entry] = audit()
    assert.equal(entry.action, 'setUserField')
    assert.equal(entry.actorEmail, OWNER)
    assert.equal(entry.actorUid, 'admin')
    assert.deepEqual(entry.details, { targetUid: 'alice', field: 'betaUser', value: true })
    assert.match(entry.timestamp, /^\d{4}-\d\d-\d\dT/)
  })

  test('only betaUser and isPro, only true/false, only real user ids; anything else changes nothing and records nothing', async () => {
    const before = JSON.stringify(fake.read('users/alice'))
    for (const field of ['xp', 'email', 'uid', 'isAdmin', 'stripeSubId', 'createdAt', '__proto__', 'constructor', '', 7, null, ['isPro'], { a: 1 }]) {
      assert.equal((await admin('setUserField', { targetUid: 'alice', field, value: true })).status, 400, String(field))
    }
    for (const value of ['true', 1, 0, null, {}, [], 'yes']) assert.equal((await admin('setUserField', { targetUid: 'alice', field: 'isPro', value })).status, 400, String(value))
    for (const targetUid of ['', 'a/b', '../users/alice', 'x'.repeat(200), 7, null, {}, 'alice bob', 'a.b']) assert.equal((await admin('setUserField', { targetUid, field: 'isPro', value: true })).status, 400, String(targetUid))
    assert.equal((await admin('setUserField', { field: 'isPro', value: true })).status, 400)
    assert.equal((await admin('setUserField', { targetUid: 'nobody', field: 'isPro', value: true })).status, 404)
    assert.equal(JSON.stringify(fake.read('users/alice')), before)
    assert.equal(fake.count('adminAuditLog/'), 0)
    assert.equal(fake.exists('users/nobody'), false, 'a missing user is not created by the update')
  })

  test('if the record of the change cannot be written, the change is not made (nothing unrecorded)', async () => {
    fake.failNext({ op: 'set', path: /^adminAuditLog\// }, new Error('audit store down'), { times: 5 })
    const r = await admin('setUserField', { targetUid: 'alice', field: 'isPro', value: true })
    assert.equal(r.status, 500)
    assert.equal(fake.read('users/alice').isPro, false)
    assert.equal(r.json.error, 'Something went wrong. Please try again.')
    assert.equal(r.json.code, 'server_error')
  })

  test('bulk: every user that exists is changed once, missing ones are skipped and counted, and nothing is half-applied on a bad list', async () => {
    const r = await admin('bulkSetField', { targetUids: ['alice', 'carol', 'alice', 'ghost'], field: 'betaUser', value: true })
    assert.deepEqual(r.json, { ok: true, updated: 2, skipped: 1 })
    assert.equal(fake.read('users/alice').betaUser, true)
    assert.equal(fake.read('users/carol').betaUser, true)
    assert.equal(fake.exists('users/ghost'), false)
    const [entry] = audit()
    assert.equal(entry.action, 'bulkSetField')
    assert.deepEqual(entry.details.targetUids, ['alice', 'carol', 'ghost'])
    assert.equal(entry.details.count, 2)

    const before = JSON.stringify(fake.read('users/bob'))
    for (const targetUids of [[], 'alice', null, {}, ['bob', 'a/b'], ['bob', 7], Array.from({ length: 1001 }, (_, i) => 'u' + i)]) {
      assert.equal((await admin('bulkSetField', { targetUids, field: 'isPro', value: true })).status, 400, JSON.stringify(targetUids)?.slice(0, 30))
    }
    assert.equal((await admin('bulkSetField', { targetUids: ['bob'], field: 'xp', value: true })).status, 400)
    assert.equal((await admin('bulkSetField', { targetUids: ['bob'], field: 'isPro', value: 'true' })).status, 400)
    assert.equal(JSON.stringify(fake.read('users/bob')), before)
    assert.equal(auditActions().length, 1)
  })
})

describe('reading students (listUsers / findByEmail)', () => {
  const PRIVATE = ['pushSubscription', 'stripeCustomerId', 'stripeSubId', 'examDates', 'subjects', 'friends', 'referralCode', 'username']

  test('a list holds only what the admin screens show: never push subscriptions, payment identifiers, exam dates or friends', async () => {
    const r = await admin('listUsers')
    assert.equal(r.status, 200)
    assert.equal(r.json.users.length, 3)
    const alice = r.json.users.find((u) => u.id === 'alice')
    assert.deepEqual(Object.keys(alice).sort(), ['betaUser', 'createdAt', 'displayName', 'email', 'id', 'isPro', 'lastActivityDate', 'referredBy', 'streak', 'xp'])
    for (const field of PRIVATE) assert.ok(!(field in alice), field)
    const text = JSON.stringify(r.json)
    for (const secret of ['cus_123', 'sub_123', 'fcm.googleapis.com', '2027-06-01', 'ALICE000']) assert.ok(!text.includes(secret), secret)
    assert.deepEqual(r.json.users.map((u) => u.id), ['carol', 'bob', 'alice'], 'newest first')
  })

  test('limitN must be a whole number, is capped at 500, and a filter may only be betaUser/isPro with true/false', async () => {
    for (const limitN of [0, -1, 1.5, '10', 'abc', null, {}]) assert.equal((await admin('listUsers', { limitN })).status, 400, String(limitN))
    assert.equal((await admin('listUsers', { limitN: 2 })).json.users.length, 2)
    fake.seed(Object.fromEntries(Array.from({ length: 520 }, (_, i) => [`users/bulk${i}`, { displayName: 'B' + i, createdAt: new Date(2026, 0, 1 + (i % 28)) }])))
    assert.equal((await admin('listUsers', { limitN: 100000 })).json.users.length, 500)

    const beta = await admin('listUsers', { filterField: 'betaUser', filterValue: true })
    assert.deepEqual(beta.json.users.map((u) => u.id), ['bob'])
    for (const [filterField, filterValue] of [['email', 'alice@example.test'], ['xp', 120], ['__proto__', true], ['betaUser', 'true'], ['betaUser', undefined], [['betaUser'], true], ['stripeCustomerId', 'cus_123'], ['email', true], ['pushSubscription', true], ['pushEnabled', true], ['profilePublic', false]]) {
      assert.equal((await admin('listUsers', { filterField, filterValue })).status, 400, `${filterField}=${filterValue}`)
    }
  })

  test('find by e-mail: any capitalisation, only the same allowlisted fields, and the record holds the account found, never the address typed', async () => {
    const r = await admin('findByEmail', { email: '  ALICE@Example.TEST ' })
    assert.equal(r.status, 200)
    assert.equal(r.json.user.id, 'alice')
    for (const field of PRIVATE) assert.ok(!(field in r.json.user), field)
    const [entry] = audit()
    assert.deepEqual({ action: entry.action, details: entry.details }, { action: 'findByEmail', details: { found: true, targetUid: 'alice' } })
    assert.ok(!JSON.stringify(entry).includes('example.test') || entry.actorEmail === OWNER)
    assert.ok(!JSON.stringify(entry.details).toLowerCase().includes('alice@'))

    const none = await admin('findByEmail', { email: 'nobody@example.test' })
    assert.deepEqual(none.json, { user: null })
    assert.deepEqual(audit()[1].details, { found: false })
    fake.addAuthUser('norecord', { email: 'norecord@example.test' })
    assert.deepEqual((await admin('findByEmail', { email: 'norecord@example.test' })).json, { user: null })
  })

  test('find by e-mail refuses things that are not an address', async () => {
    for (const email of [undefined, null, '', '   ', 'no-at-sign', 7, {}, ['a@b.c'], 'x'.repeat(300) + '@example.test']) assert.equal((await admin('findByEmail', { email })).status, 400, String(email).slice(0, 20))
  })
})

describe('resource links (shown to every student)', () => {
  const good = { subject: 'Maths', name: 'Corbettmaths', url: 'https://corbettmaths.com/contents/', keywords: 'Algebra, Equations ' }

  test('a good link is stored with cleaned keywords and recorded', async () => {
    const r = await admin('addResourceLink', good)
    assert.equal(r.status, 200)
    const stored = fake.read(`topicResourceLinks/${r.json.id}`)
    assert.deepEqual({ ...stored, createdAt: undefined }, { subject: 'Maths', name: 'Corbettmaths', url: good.url, site: 'Corbettmaths', keywords: ['algebra', 'equations'], createdAt: undefined })
    assert.match(stored.createdAt, /^\d{4}-/)
    assert.deepEqual(audit()[0].details, { subject: 'Maths', name: 'Corbettmaths', url: good.url })
    const list = await admin('listResourceLinks')
    assert.equal(list.json.links.length, 1)
  })

  test('only a plain https address is accepted: nothing that would run on click or leave the site unexpectedly', async () => {
    const bad = [
      'javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,<script>alert(1)</script>', 'vbscript:x', 'file:///etc/passwd', 'ftp://example.com/x',
      'http://example.com/x', '//example.com/x', '/relative/path', 'example.com', 'https://user:pass@example.com/', 'https://user@example.com/', 'https://example.com/a b',
      'https://example.com\\@evil.com', 'https://localhost/x', 'https://intranet/x', ' https://example.com/', 'https://example.com/\n', 'https://' + 'a'.repeat(2100) + '.com',
      '', null, 12, {}, ['https://example.com/'],
    ]
    for (const url of bad) assert.equal((await admin('addResourceLink', { ...good, url })).status, 400, String(url).slice(0, 40))
    assert.equal(fake.count('topicResourceLinks/'), 0)
    assert.equal(fake.count('adminAuditLog/'), 0)
  })

  test('the other fields must be sensible text; keywords are bounded', async () => {
    for (const patch of [{ subject: '' }, { subject: 7 }, { subject: 'x'.repeat(101) }, { name: undefined }, { name: 'n'.repeat(201) }, { keywords: '' }, { keywords: ' , ,' }, { keywords: [] }, { keywords: [1, 2] }, { keywords: {} }, { site: 's'.repeat(101) }, { site: 7 }]) {
      assert.equal((await admin('addResourceLink', { ...good, ...patch })).status, 400, JSON.stringify(patch).slice(0, 40))
    }
    const many = await admin('addResourceLink', { ...good, keywords: Array.from({ length: 80 }, (_, i) => 'k' + i).concat(['y'.repeat(81)]) })
    assert.equal(fake.read(`topicResourceLinks/${many.json.id}`).keywords.length, 40)
    assert.ok(fake.read(`topicResourceLinks/${many.json.id}`).keywords.every((k) => k.length <= 80))
    const arr = await admin('addResourceLink', { ...good, keywords: ['Already', 'Cleaned'], site: 'My site' })
    assert.deepEqual(fake.read(`topicResourceLinks/${arr.json.id}`).keywords, ['Already', 'Cleaned'])
    assert.equal(fake.read(`topicResourceLinks/${arr.json.id}`).site, 'My site')
  })

  test('bulk: valid rows are added, unusable ones are skipped and counted, and one record covers the batch', async () => {
    const rows = [
      { subject: 'Maths', name: 'A', url: 'https://a.example.com/', keywords: 'x|y | Z' },
      { subject: 'Maths', name: 'B', url: 'javascript:alert(1)', keywords: 'x' },
      { subject: 'Maths', name: 'C', url: 'https://c.example.com/' },
      { subject: 'Biology', name: 'D', url: 'https://d.example.com/', keywords: ['cells'], site: 'D site' },
      null, 'text', 7, ['x'],
    ]
    const r = await admin('bulkAddResourceLinks', { rows })
    assert.deepEqual(r.json, { ok: true, added: 2, skipped: 6 })
    const stored = fake.paths('topicResourceLinks/').map((p) => fake.read(p)).sort((a, b) => a.name.localeCompare(b.name))
    assert.deepEqual(stored[0].keywords, ['x', 'y', 'z'])
    assert.equal(stored[1].site, 'D site')
    assert.deepEqual(audit().map((a) => [a.action, a.details]), [['bulkAddResourceLinks', { added: 2, skipped: 6 }]])
    for (const bad of [[], 'rows', null, {}, Array.from({ length: 2001 }, () => ({}))]) assert.equal((await admin('bulkAddResourceLinks', { rows: bad })).status, 400)
  })

  test('delete needs a real id, is recorded first, and only removes that link', async () => {
    fake.seed({ 'topicResourceLinks/keep1': { name: 'keep' }, 'topicResourceLinks/drop1': { name: 'drop' } })
    for (const linkId of [undefined, '', 'a/b', '../x', 7, {}, 'x'.repeat(101)]) assert.equal((await admin('deleteResourceLink', { linkId })).status, 400, String(linkId))
    assert.equal(fake.count('topicResourceLinks/'), 2)
    assert.equal((await admin('deleteResourceLink', { linkId: 'drop1' })).status, 200)
    assert.deepEqual(fake.paths('topicResourceLinks/'), ['topicResourceLinks/keep1'])
    assert.deepEqual(audit().map((a) => [a.action, a.details]), [['deleteResourceLink', { linkId: 'drop1' }]])
    fake.failNext({ op: 'set', path: /^adminAuditLog\// }, new Error('down'), { times: 5 })
    assert.equal((await admin('deleteResourceLink', { linkId: 'keep1' })).status, 500)
    assert.ok(fake.exists('topicResourceLinks/keep1'), 'nothing deleted when it could not be recorded')
  })
})

describe('content pipeline (draft -> review -> approval)', () => {
  const draft = (kind, id, data, extra = {}) => admin('contentDraft', { kind, id, data, ...extra })
  const step = (action, draftId, extra = {}) => admin(action, { draftId, ...extra })

  test('nothing is live until an admin approves, every step is recorded, and approval names the VERIFIED approver', async () => {
    const d = await draft('topicOverride', 'AQA_GCSE_Maths_Algebra', { title: 'Algebra', provenance: { forged: true }, verified: false, updatedAt: 'x' })
    assert.deepEqual(d.json, { ok: true, draftId: 'topicOverride__AQA_GCSE_Maths_Algebra', status: 'draft' })
    assert.equal(fake.exists('topicOverrides/AQA_GCSE_Maths_Algebra'), false)
    const stored = fake.read('adminDrafts/topicOverride__AQA_GCSE_Maths_Algebra')
    assert.equal(stored.createdBy, OWNER)
    assert.deepEqual(stored.data, { title: 'Algebra' }, 'provenance / verified / updatedAt cannot be supplied by the draft')

    assert.equal((await step('contentApprove', d.json.draftId)).status, 409, 'cannot skip review')
    assert.equal((await step('contentSubmit', d.json.draftId)).status, 200)
    assert.equal((await step('contentSubmit', d.json.draftId)).status, 409)
    const ok = await step('contentApprove', d.json.draftId)
    assert.deepEqual(ok.json, { ok: true, status: 'approved' })
    const live = fake.read('topicOverrides/AQA_GCSE_Maths_Algebra')
    assert.equal(live.title, 'Algebra')
    assert.equal(live.verified, true)
    assert.equal(live.provenance.approvedBy, OWNER)
    assert.equal(live.provenance.draftId, d.json.draftId)
    assert.ok(live.createdAt && live.updatedAt)

    const again = await step('contentApprove', d.json.draftId)
    assert.deepEqual(again.json, { ok: true, status: 'approved', alreadyApproved: true })
    assert.deepEqual(auditActions(), ['contentDraft', 'contentSubmit', 'contentApprove'])
    assert.ok(audit().every((a) => a.actorEmail === OWNER && a.actorUid === 'admin'))
  })

  test('rejecting works until approval, and an approved draft cannot be rejected', async () => {
    const d = await draft('topicNote', 'note1', { text: 'x' })
    await step('contentSubmit', d.json.draftId)
    const r = await step('contentReject', d.json.draftId, { reason: 'r'.repeat(900) })
    assert.equal(r.status, 200)
    assert.equal(fake.read('adminDrafts/' + d.json.draftId).rejectedReason.length, 500)
    assert.equal((await step('contentApprove', d.json.draftId)).status, 409)
    const d2 = await draft('topicNote', 'note2', { text: 'y' })
    await step('contentSubmit', d2.json.draftId)
    await step('contentApprove', d2.json.draftId)
    assert.equal((await step('contentReject', d2.json.draftId)).status, 409)
    assert.equal((await step('contentSubmit', 'topicNote__missing')).status, 404)
  })

  test('if the approval cannot be recorded, nothing is published', async () => {
    const d = await draft('topicNote', 'note3', { text: 'z' })
    await step('contentSubmit', d.json.draftId)
    fake.failNext({ op: 'set', path: /^adminAuditLog\// }, new Error('down'), { times: 5 })
    assert.equal((await step('contentApprove', d.json.draftId)).status, 500)
    assert.equal(fake.exists('topicNotes/note3'), false)
    assert.equal(fake.read('adminDrafts/' + d.json.draftId).status, 'in_review')
  })

  test('a draft is checked: known kinds, safe ids, an object, a sensible size', async () => {
    for (const kind of ['users', 'adminDrafts', '__proto__', 'constructor', 'toString', 'hasOwnProperty', '', 7, undefined, null, ['topicNote'], { a: 1 }, 'topicOverrides']) assert.equal((await draft(kind, 'x', {})).status, 400, JSON.stringify(kind) + ' must not be a content kind')
    for (const id of ['', 'a/b', '../x', 'x'.repeat(201), 7, undefined, null, ['abc'], { a: 1 }, 'a b']) assert.equal((await draft('topicNote', id, {})).status, 400, JSON.stringify(id) + ' must not be a content id')
    for (const data of [undefined, null, 'text', 7, [1, 2]]) assert.equal((await draft('topicNote', 'n', data)).status, 400, JSON.stringify(data))
    assert.equal((await draft('topicNote', 'n', { big: 'x'.repeat(950000) })).status, 400)
    assert.equal((await draft('topicNote', 'n', {}, { op: 'merge' })).status, 400)
    assert.equal((await step('contentSubmit', 'bad/id')).status, 400)
    assert.equal((await step('contentApprove', undefined)).status, 400)
    assert.equal(fake.count('adminDrafts/'), 0)
  })

  test('a stored draft that does not name a real content kind is never approved, whatever put it there', async () => {
    fake.seed({
      'adminDrafts/evil1': { kind: '__proto__', id: 'x', op: 'set', data: { a: 1 }, status: 'in_review' },
      'adminDrafts/evil2': { kind: 'users', id: 'alice', op: 'set', data: { isPro: true }, status: 'in_review' },
      'adminDrafts/evil3': { kind: 'topicNote', id: '../users/alice', op: 'delete', data: null, status: 'in_review' },
    })
    for (const draftId of ['evil1', 'evil2', 'evil3']) assert.equal((await step('contentApprove', draftId)).status, 409, draftId)
    assert.equal(fake.read('users/alice').isPro, false)
    assert.equal(fake.count('adminAuditLog/'), 0)
  })

  test('an official paper structure that adds up is accepted (this used to fail with a server error) and one that does not is refused', async () => {
    const good = await draft('paperSpecOverride', 'AQA_GCSE_Maths_P1', { maxMarks: 80, level: 'GCSE', subject: 'Maths', questions: [{ num: 1, marks: 30, extra: 'dropped' }, { num: 2, marks: 50 }] })
    assert.equal(good.status, 200)
    assert.deepEqual(fake.read('adminDrafts/paperSpecOverride__AQA_GCSE_Maths_P1').data.questions, [{ num: 1, marks: 30 }, { num: 2, marks: 50 }])
    const wrongTotal = await draft('paperSpecOverride', 'AQA_GCSE_Maths_P2', { maxMarks: 80, level: 'GCSE', subject: 'Maths', questions: [{ num: 1, marks: 30 }] })
    assert.equal(wrongTotal.status, 400)
    assert.match(wrongTotal.json.error, /add up to 30 marks but the paper is worth 80/)
    assert.equal((await draft('paperSpecOverride', 'AQA_GCSE_Maths_P3', { maxMarks: 80, level: 'GCSE', subject: 'Maths', questions: [{ num: 2, marks: 80 }] })).status, 400)
    assert.equal((await draft('paperSpecOverride', 'AQA_GCSE_Maths_P4', { maxMarks: 10, questions: [{ num: 1, marks: 1.5 }] })).status, 400)
    assert.equal((await draft('paperSpecOverride', 'AQA_GCSE_Maths_P5', { questions: null })).status, 200, 'null removes the structure')
  })

  test('boundaries must carry a year and a source, and an official flashcard is forced to be official and public', async () => {
    for (const data of [{}, { year: '2024', source: 'AQA' }, { year: 2024 }, { year: 2024, source: '  ' }, { source: 'AQA' }]) assert.equal((await draft('boundaryOverride', 'AQA_GCSE_Maths', data)).status, 400, JSON.stringify(data))
    assert.equal((await draft('boundaryOverride', 'AQA_GCSE_Maths', { year: 2024, source: 'AQA published boundaries, June 2024' })).status, 200)
    const f = await draft('officialFlashcard', 'set1', { title: 'T', uid: 'someone-else', official: false, isPublic: false, authorType: 'user' })
    assert.equal(f.status, 200)
    const data = fake.read('adminDrafts/officialFlashcard__set1').data
    assert.deepEqual({ uid: data.uid, official: data.official, isPublic: data.isPublic, authorType: data.authorType }, { uid: 'official', official: true, isPublic: true, authorType: 'official' })
  })

  test('the draft list keeps the draft id as the id and can be filtered', async () => {
    const a = await draft('topicNote', 'l1', { text: 'a' })
    await draft('topicNote', 'l2', { text: 'b' })
    await step('contentSubmit', a.json.draftId)
    const all = await admin('contentListDrafts')
    assert.equal(all.json.drafts.length, 2)
    const inReview = await admin('contentListDrafts', { status: 'in_review' })
    assert.deepEqual(inReview.json.drafts.map((d) => [d.id, d.draftId, d.contentId]), [['topicNote__l1', 'topicNote__l1', 'l1']])
    assert.equal((await admin('contentListDrafts', { status: { $ne: 'x' } })).status, 200)
  })
})

describe('official flashcard sets', () => {
  beforeEach(() => {
    fake.seed({
      'publicFlashcards/s1': { uid: 'official', title: 'AQA GCSE Biology — Cells', subject: 'Biology' },
      'publicFlashcards/s2': { uid: 'official', title: 'Edexcel AS-Level Chemistry — Rates', subject: 'Chemistry' },
      'publicFlashcards/s3': { uid: 'official', title: 'Untitled set' },
      'publicFlashcards/s4': { uid: 'official', board: 'OCR', level: 'A-Level', title: 'x', subject: 'Physics', verified: true },
      'publicFlashcards/u1': { uid: 'alice', title: 'AQA GCSE Biology — Mine' },
    })
  })

  test('migrate stamps board and level on official sets only, and is recorded before it writes', async () => {
    const r = await admin('migrateOfficialSets')
    assert.deepEqual(r.json.summary, { scanned: 4, stamped: 2, alreadyFine: 1, unreadable: 1 })
    assert.deepEqual([fake.read('publicFlashcards/s1').board, fake.read('publicFlashcards/s1').level], ['AQA', 'GCSE'])
    assert.deepEqual([fake.read('publicFlashcards/s2').board, fake.read('publicFlashcards/s2').level], ['Edexcel', 'AS-Level'])
    assert.equal(fake.read('publicFlashcards/u1').board, undefined, 'a student\'s own set is never touched')
    assert.deepEqual(audit().map((a) => a.action), ['migrateOfficialSets'])
  })

  test('verify is a dry run unless confirm is exactly true; confirmed changes name the verified reviewer and are recorded', async () => {
    const dry = await admin('verifyOfficialSets', { filter: { board: 'AQA' } })
    assert.deepEqual(dry.json, { ok: true, dryRun: true, wouldVerify: 1, alreadyVerified: 1, total: 4 })
    for (const confirm of ['true', 1, 'yes', {}, null]) assert.equal((await admin('verifyOfficialSets', { filter: {}, confirm })).json.dryRun, true, String(confirm))
    assert.equal(fake.read('publicFlashcards/s1').verified, undefined)
    assert.equal(fake.count('adminAuditLog/'), 0)

    const done = await admin('verifyOfficialSets', { filter: { board: 'AQA', level: 'GCSE', subject: 'Biology' }, confirm: true })
    assert.deepEqual(done.json, { ok: true, verified: 1, alreadyVerified: 1 })
    const s1 = fake.read('publicFlashcards/s1')
    assert.equal(s1.verified, true)
    assert.equal(s1.verifiedBy, OWNER)
    assert.equal(s1.provenance.approvedBy, OWNER)
    assert.equal(s1.version, 1)
    assert.equal(fake.read('publicFlashcards/s2').verified, undefined)
    assert.deepEqual(audit()[0].details, { verified: 1, filter: { board: 'AQA', level: 'GCSE', subject: 'Biology' } })
  })

  test('an odd filter (not an object, numbers, nested values) is handled instead of crashing', async () => {
    for (const filter of ['AQA', 7, [], null, { board: 5 }, { level: { a: 1 } }, { subject: ['x'] }]) assert.equal((await admin('verifyOfficialSets', { filter })).status, 200, JSON.stringify(filter))
  })
})

describe('archiveSupersededQualificationData', () => {
  test('files away history that belongs to another qualification, only for a valid target, and records it first', async () => {
    fake.seed({
      'users/alice': { displayName: 'Alice', subjects: [{ name: 'Maths', qualification: 'A-Level' }], qualification: 'A-Level' },
      'users/alice/paperAttempts/p1': { subject: 'Maths', grade: '7' },               // a numeric grade can only be GCSE
      'users/alice/paperAttempts/p2': { subject: 'Maths', grade: 'A', qualification: 'A-Level' },
    })
    for (const targetUid of ['a/b', '../x', 7, {}, 'x'.repeat(200)]) assert.equal((await admin('archiveSupersededQualificationData', { targetUid })).status, 400, String(targetUid))
    assert.equal(fake.read('users/alice/paperAttempts/p1').archived, undefined)
    const r = await admin('archiveSupersededQualificationData', { targetUid: 'alice' })
    assert.equal(r.status, 200)
    assert.equal(r.json.summary.totalArchived, 1)
    assert.equal(fake.read('users/alice/paperAttempts/p1').archived, true)
    assert.equal(fake.read('users/alice/paperAttempts/p2').archived, undefined)
    assert.deepEqual(audit().map((a) => [a.action, a.details]), [['archiveSupersededQualificationData', { targetUid: 'alice', totalArchived: 1 }]])
    assert.equal((await admin('archiveSupersededQualificationData')).status, 200, 'no target means everyone, as before')
  })
})

describe('errors and logs', () => {
  test('an unexpected failure is a generic 500 and nothing identifying reaches the response or the logs', async () => {
    const token = fake.tokenFor('admin')
    fake.failNext({ op: 'query', path: 'users' }, new Error('boom reading projects/p/databases/(default)/documents/users/alice for alice@example.test'), { times: 3 })
    const r = await call(token, { action: 'listUsers' })
    assert.equal(r.status, 500)
    assert.deepEqual(r.json, { error: 'Something went wrong. Please try again.', code: 'server_error' })
    const text = logs.join('\n') + JSON.stringify(r.json)
    for (const secret of ['alice@example.test', 'users/alice', token, OWNER]) assert.ok(!text.includes(secret), 'leaked: ' + secret)
  })
})
