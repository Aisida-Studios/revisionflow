// tests/functions/http.test.mjs
// Unit tests of the shared request helpers in netlify/functions/lib/http.js (no Firebase needed).
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const http = require('../../netlify/functions/lib/http.js')

describe('scrub (what may reach a server log)', () => {
  test('removes bearer tokens, JWTs, e-mail addresses and Stripe keys', () => {
    const jwt = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJ1aWQiOiJhYmMifQ.c2lnbmF0dXJl'
    const out = http.scrub(`Bearer ${jwt} for student@example.test with sk_live_AbCdEf123456 and whsec_test_abcdef`)
    for (const leaked of [jwt, 'student@example.test', 'sk_live_AbCdEf123456', 'whsec_test_abcdef']) assert.ok(!out.includes(leaked), leaked)
  })

  test('removes Firestore document paths and long opaque ids (uids, Stripe object ids)', () => {
    const uid = 'k3j9Qz1LmN0pRsT7uVwXyZ2aBcD4'
    const out = http.scrub(`NOT_FOUND: No document to update: projects/prod-app/databases/(default)/documents/users/${uid}/profile; customer cus_Nf3TnQw9hR7uJk2LmPqRsT and sub_1Pabcdef0123456789xyz`)
    assert.ok(!out.includes(uid))
    assert.ok(!out.includes('cus_Nf3TnQw9hR7uJk2LmPqRsT'))
    assert.ok(!out.includes('sub_1Pabcdef0123456789xyz'))
    assert.match(out, /NOT_FOUND/)
    assert.match(out, /\[path\]/)
  })

  test('keeps ordinary operational words so a log is still useful', () => {
    const out = http.scrub('Missing or insufficient permissions. FIREBASE_SERVICE_ACCOUNT is not set')
    assert.match(out, /Missing or insufficient permissions/)
    assert.match(out, /FIREBASE_SERVICE_ACCOUNT/)
  })

  test('is bounded and tolerates null, undefined and huge input without hanging', () => {
    assert.equal(http.scrub(null), '')
    assert.equal(http.scrub(undefined), '')
    const started = Date.now()
    const out = http.scrub('a1'.repeat(500000))
    assert.ok(out.length <= 300)
    assert.ok(Date.now() - started < 500, 'scrub must not take long on a huge message')
  })
})

describe('parseJsonBody', () => {
  const event = (body, extra = {}) => ({ httpMethod: 'POST', headers: { 'content-type': 'application/json' }, body, ...extra })

  test('accepts a JSON object, including base64-encoded bodies (Netlify may send either)', () => {
    assert.deepEqual(http.parseJsonBody(event('{"a":1}')), { a: 1 })
    assert.deepEqual(http.parseJsonBody(event(Buffer.from('{"a":1}').toString('base64'), { isBase64Encoded: true })), { a: 1 })
  })

  test('refuses arrays, scalars, null, invalid JSON, a wrong content type and an oversized body', () => {
    for (const bad of ['[1]', '5', 'null', '"x"']) assert.throws(() => http.parseJsonBody(event(bad)), (e) => e.status === 400, bad)
    assert.throws(() => http.parseJsonBody(event('{nope')), (e) => e.status === 400 && e.code === 'bad_json')
    assert.throws(() => http.parseJsonBody(event('{"a":1}', { headers: { 'content-type': 'text/plain' } })), (e) => e.status === 415)
    assert.throws(() => http.parseJsonBody(event(JSON.stringify({ pad: 'x'.repeat(100) })), { maxBytes: 50 }), (e) => e.status === 413 && e.code === 'payload_too_large')
    // The size limit counts bytes, not characters, and applies after base64 decoding.
    assert.throws(() => http.parseJsonBody(event(JSON.stringify({ pad: '€'.repeat(20) })), { maxBytes: 50 }), (e) => e.status === 413)
    const big = Buffer.from(JSON.stringify({ pad: 'x'.repeat(100) })).toString('base64')
    assert.throws(() => http.parseJsonBody(event(big, { isBase64Encoded: true }), { maxBytes: 50 }), (e) => e.status === 413)
  })

  test('an empty body is allowed only when asked for', () => {
    assert.deepEqual(http.parseJsonBody(event('')), {})
    assert.throws(() => http.parseJsonBody(event(''), { allowEmpty: false }), (e) => e.status === 400)
  })
})
