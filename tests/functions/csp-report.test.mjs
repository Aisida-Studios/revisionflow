// tests/functions/csp-report.test.mjs
// netlify/functions/csp-report.js: the collector for Content-Security-Policy violation reports. It needs no Firebase, so the
// handler is called directly. console.log is captured so the tests can look at exactly what would reach a server log.
import { describe, test, beforeEach, afterEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { freshRequire, makeEvent, parse } from '../helpers/fakeAdmin.js'

let handler, internals, logged
const IP = '203.0.113.9'

beforeEach(() => {
  const mod = freshRequire('netlify/functions/csp-report.js')
  handler = mod.handler
  internals = mod._internals
  logged = []
  mock.method(console, 'log', (...args) => { logged.push(args.join(' ')) })
})
afterEach(() => { mock.restoreAll() })

const post = async (body, { type = 'application/csp-report', ip = IP, raw = false, base64 = false, method = 'POST' } = {}) =>
  parse(await handler(makeEvent({ method, body, raw, base64, headers: { 'content-type': type, 'x-nf-client-connection-ip': ip } })))

const legacy = (over = {}) => ({
  'csp-report': {
    'document-uri': 'https://www.revisionflow.co.uk/dashboard', 'effective-directive': 'script-src-elem', 'violated-directive': 'script-src-elem',
    'blocked-uri': 'https://cdn.example.test/lib.js', disposition: 'report', 'original-policy': "default-src 'self'", referrer: '', ...over,
  },
})

describe('what a report is turned into', () => {
  test('a legacy report-uri report becomes one log line with the directive, the blocked origin and the page path', async () => {
    const res = await post(legacy())
    assert.equal(res.status, 204)
    assert.deepEqual(logged, ['[csp-report] report script-src-elem blocked=https://cdn.example.test doc=/dashboard'])
  })

  test('a Reporting API batch is read too, up to five entries, and other report types are ignored', async () => {
    const entry = (i) => ({ type: 'csp-violation', url: 'https://www.revisionflow.co.uk/', body: { documentURL: `https://www.revisionflow.co.uk/p${i}`, effectiveDirective: 'img-src', blockedURL: `https://img${i}.example.test/x.png`, disposition: 'report' } })
    const body = [{ type: 'deprecation', body: { id: 'x' } }, ...Array.from({ length: 9 }, (_, i) => entry(i))]
    const res = await post(body, { type: 'application/reports+json' })
    assert.equal(res.status, 204)
    assert.equal(logged.length, internals.MAX_ENTRIES)
    assert.equal(logged[0], '[csp-report] report img-src blocked=https://img0.example.test doc=/p0')
    assert.ok(logged.every((l) => !l.includes('deprecation')))
  })

  test('a single { type, body } report is read, and plain application/json is accepted', async () => {
    const res = await post({ type: 'csp-violation', body: { documentURL: 'https://www.revisionflow.co.uk/study', effectiveDirective: 'connect-src', blockedURL: 'https://api.example.test/v1', disposition: 'enforce' } }, { type: 'application/json' })
    assert.equal(res.status, 204)
    assert.deepEqual(logged, ['[csp-report] enforce connect-src blocked=https://api.example.test doc=/study'])
  })

  test('a body Netlify delivered base64-encoded is decoded', async () => {
    const res = await post(legacy(), { base64: true })
    assert.equal(res.status, 204)
    assert.equal(logged.length, 1)
    assert.match(logged[0], /script-src-elem blocked=https:\/\/cdn\.example\.test/)
  })

  test('inline, eval and other keywords are kept as keywords; other schemes are reduced to the scheme', async () => {
    for (const [blocked, expected] of [['inline', 'inline'], ['eval', 'eval'], ['data', 'data'], ['blob:https://www.revisionflow.co.uk/abc', 'blob'], ['data:text/javascript,alert(1)', 'data'], ['javascript:alert(1)', 'javascript'], ['', 'unknown'], ['not a url', 'invalid']]) {
      logged.length = 0
      await post(legacy({ 'blocked-uri': blocked }))
      assert.match(logged[0], new RegExp(`blocked=${expected} `), `${blocked} -> ${expected}: ${logged[0]}`)
    }
  })

  test('a directive that is not a plain directive name is shown as unknown, and the first word of a violated-directive is used', async () => {
    await post(legacy({ 'effective-directive': undefined, 'violated-directive': "script-src 'self' https://apis.google.com" }))
    assert.match(logged[0], /^\[csp-report\] report script-src blocked=/)
    logged.length = 0
    await post(legacy({ 'effective-directive': '<script>alert(1)</script>', 'violated-directive': undefined }))
    assert.match(logged[0], /^\[csp-report\] report unknown blocked=/)
  })
})

describe('nothing a reporter controls reaches the log', () => {
  test('query strings, fragments, script samples, referrers, policies, source files and the caller\'s address are never logged', async () => {
    const SECRET = 'SECRET-TOKEN-9f8e7d'
    await post(legacy({
      'document-uri': `https://www.revisionflow.co.uk/reset?token=${SECRET}&email=student%40example.test#frag-${SECRET}`,
      'blocked-uri': `https://cdn.example.test/lib.js?key=${SECRET}#${SECRET}`,
      'script-sample': `fetch('/api?${SECRET}')`,
      referrer: `https://elsewhere.example.test/?${SECRET}`,
      'original-policy': `default-src 'self'; report-uri /x?${SECRET}`,
      'source-file': `https://www.revisionflow.co.uk/assets/app.js?${SECRET}`,
      'line-number': 12, 'column-number': 34, 'status-code': 200,
    }))
    const all = logged.join('\n')
    assert.equal(logged.length, 1)
    for (const leaked of [SECRET, 'student', 'example.test/lib', 'fetch(', 'elsewhere', 'default-src', 'app.js', IP, 'token=', 'email']) {
      assert.ok(!all.includes(leaked), `leaked: ${leaked}`)
    }
    assert.equal(all, '[csp-report] report script-src-elem blocked=https://cdn.example.test doc=/reset')
  })

  test('a long opaque id in the page path is replaced, and an e-mail address in it does not survive', async () => {
    await post(legacy({ 'document-uri': 'https://www.revisionflow.co.uk/u/k3j9Qz1LmN0pRsT7uVwXyZ2aBcD4/student@example.test' }))
    assert.ok(!logged[0].includes('k3j9Qz1LmN0pRsT7uVwXyZ2aBcD4'))
    assert.ok(!logged[0].includes('student@example.test'))
  })

  test('line breaks in any field cannot start a second log line', async () => {
    const nasty = 'inline\n[csp-report] report script-src blocked=fake doc=/forged'
    await post(legacy({ 'blocked-uri': nasty, 'document-uri': 'https://www.revisionflow.co.uk/a\nb\r\n[csp-report] forged', 'effective-directive': 'script-src\n[csp-report]', disposition: 'report\nforged' }))
    assert.equal(logged.length, 1)
    assert.ok(logged.every((l) => !/[\r\n]/.test(l)), JSON.stringify(logged))
    // Printable text in a path is a fact the page reported and may appear, but only inside doc=...; the line keeps its shape:
    // the fixed prefix, an allowlisted disposition and directive, one blocked value and one path with no spaces in it.
    assert.match(logged[0], /^\[csp-report\] (report|enforce|unknown) [a-z-]+ blocked=\S+ doc=\S*$/, logged[0])
    assert.match(logged[0], /^\[csp-report\] unknown script-src blocked=invalid doc=\/ab/)
  })

  test('values are bounded however long they are', async () => {
    await post(legacy({ 'document-uri': 'https://www.revisionflow.co.uk/' + 'a/'.repeat(2000), 'blocked-uri': 'https://' + 'x'.repeat(2000) + '.example.test/p' }))
    assert.ok(logged[0].length < 400, `line length ${logged[0].length}`)
  })
})

describe('refusals', () => {
  test('only POST is accepted; OPTIONS answers without a body', async () => {
    assert.equal((await post(undefined, { method: 'GET' })).status, 405)
    assert.equal((await post(undefined, { method: 'PUT' })).status, 405)
    assert.equal((await post(undefined, { method: 'OPTIONS' })).status, 204)
    assert.equal(logged.length, 0)
  })

  test('a missing body, an unsupported content type, bad JSON and an oversized body are refused and nothing is logged', async () => {
    assert.equal((await post(undefined)).status, 400)
    assert.equal((await post('', { raw: true })).status, 400)
    assert.equal((await post(JSON.stringify(legacy()), { raw: true, type: 'text/plain' })).status, 415)
    assert.equal((await post(JSON.stringify(legacy()), { raw: true, type: 'application/x-www-form-urlencoded' })).status, 415)
    assert.equal((await post('{nope', { raw: true })).status, 400)
    const big = legacy({ 'script-sample': 'x'.repeat(internals.MAX_BODY_BYTES) })
    assert.equal((await post(big)).status, 413)
    assert.equal((await post(Buffer.from(JSON.stringify(big)).toString('base64'), { raw: true, base64: true })).status, 413)
    assert.equal(logged.length, 0)
  })

  test('reports that are not CSP violations are accepted quietly and logged as nothing', async () => {
    for (const body of [{}, [], { hello: 'world' }, [{ type: 'network-error', body: {} }], 'text', 42, null, { 'csp-report': 'not an object' }, { type: 'csp-violation' }, [null, 1, 'x']]) {
      const res = await post(body)
      assert.equal(res.status, 204, JSON.stringify(body))
    }
    assert.equal(logged.length, 0)
  })

  test('errors are generic: they never repeat what was sent', async () => {
    const res = await post('{"csp-report": SECRET-TOKEN', { raw: true })
    assert.equal(res.status, 400)
    assert.ok(!JSON.stringify(res.json).includes('SECRET-TOKEN'))
  })
})

describe('volume', () => {
  test('one caller is limited, with Retry-After, and another caller is not affected', async () => {
    for (let i = 0; i < internals.LIMIT_PER_WINDOW; i++) assert.equal((await post(legacy())).status, 204)
    const refused = await post(legacy())
    assert.equal(refused.status, 429)
    assert.ok(Number(refused.headers['Retry-After']) >= 1)
    assert.equal(logged.length, internals.LIMIT_PER_WINDOW, 'a refused report is not logged')
    assert.equal((await post(legacy(), { ip: '198.51.100.20' })).status, 204)
  })

  test('the limit applies before the body is read, so a flood of bad bodies is also refused', async () => {
    for (let i = 0; i < internals.LIMIT_PER_WINDOW; i++) await post('{nope', { raw: true })
    assert.equal((await post('{nope', { raw: true })).status, 429)
  })

  test('the window resets, and the table of callers cannot grow without bound', () => {
    const t0 = 1_000_000
    for (let i = 0; i < internals.LIMIT_PER_WINDOW; i++) assert.ok(internals.withinLimit('k', t0).allowed)
    assert.equal(internals.withinLimit('k', t0).allowed, false)
    assert.ok(internals.withinLimit('k', t0 + 61_000).allowed, 'a new minute starts a new window')
    for (let i = 0; i < 2500; i++) internals.withinLimit('caller-' + i, t0 + 61_000)
    assert.ok(internals.hits.size <= 2001, `size ${internals.hits.size}`)
  })
})
