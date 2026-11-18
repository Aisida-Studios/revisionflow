// tests/tutor.counting.test.js
// Runs the REAL netlify/functions/tutor.js against an in-memory Firestore and a fake Mistral, to prove how free uses are
// counted for the Maths solver, essay feedback and photo-scan marking: counted before the AI runs, refused before it is
// paid for, and given back when the failure was ours. Run with: npm run test:tutor
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { makeFakeFirestore } from './helpers/fakeFirestore.js'

const here = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const esbuild = require('esbuild')
const bundle = join(tmpdir(), 'rf-tutor-under-test.cjs')
await esbuild.build({
  entryPoints: [join(here, '../netlify/functions/tutor.js')], bundle: true, platform: 'node', format: 'cjs', outfile: bundle, logLevel: 'error',
  alias: { 'firebase-admin': join(here, 'helpers/firebaseAdminStub.cjs') },
})
const { handler } = require(bundle)
process.env.FIREBASE_SERVICE_ACCOUNT = '{}'
process.env.MISTRAL_API_KEY = 'test-key'

// A clock the test controls: the counters are per UTC day.
const RealDate = Date
const BASE = RealDate.UTC(2026, 10, 16, 12, 0, 0)
let nowMs = BASE
globalThis.Date = class extends RealDate { constructor(...a) { if (a.length === 0) super(nowMs); else super(...a) } static now() { return nowMs } }
const nextDay = () => { nowMs += 24 * 3600 * 1000 }
const TODAY = '2026-11-16'

let mistral
globalThis.fetch = async () => {
  mistral.calls++
  if (mistral.mode === 'error') return { ok: false, status: 500, text: async () => 'boom', json: async () => ({}) }
  const content = mistral.mode === 'empty' ? '' : 'An answer.'
  return { ok: true, status: 200, text: async () => '', json: async () => ({ choices: [{ message: { content } }] }) }
}
const fresh = (seed = {}) => { nowMs = BASE; globalThis.__db = makeFakeFirestore({ 'users/u1': {}, ...seed }); mistral = { calls: 0, mode: 'ok' } }     // every scenario starts on the same day
const life = (uid = 'u1') => globalThis.__db.read(`users/${uid}/usage/lifetime`)
const call = async (uid, body) => {
  const res = await handler({ httpMethod: 'POST', headers: { authorization: 'Bearer good:' + uid }, body: JSON.stringify({ messages: [{ role: 'user', content: 'Solve it' }], ...body }) })
  return { status: res.statusCode, body: JSON.parse(res.body) }
}
const IMG = 'data:image/jpeg;base64,AAAA'

let n = 0
const ok = async (name, fn) => { await fn(); n++; console.log('ok - ' + name) }

await ok('Maths solver: 2 a day and 5 in all; the AI is never called for a refused one', async () => {
  fresh()
  let r = await call('u1', { feature: 'mathsSolver' })
  assert.equal(r.status, 200); assert.deepEqual(r.body.entitlement, { feature: 'mathsSolver', remainingLifetime: 4, dailyRemaining: 1 })
  r = await call('u1', { feature: 'mathsSolver' }); assert.deepEqual(r.body.entitlement, { feature: 'mathsSolver', remainingLifetime: 3, dailyRemaining: 0 })
  const before = mistral.calls
  r = await call('u1', { feature: 'mathsSolver' })
  assert.equal(r.status, 429); assert.equal(r.body.code, 'DAILY_LIMIT'); assert.equal(mistral.calls, before)
  nextDay(); await call('u1', { feature: 'mathsSolver' }); await call('u1', { feature: 'mathsSolver' })
  nextDay(); r = await call('u1', { feature: 'mathsSolver' })
  assert.equal(r.status, 200); assert.equal(r.body.entitlement.remainingLifetime, 0)
  const spent = mistral.calls
  r = await call('u1', { feature: 'mathsSolver' })
  assert.equal(r.status, 402); assert.equal(r.body.code, 'LIFETIME_EXHAUSTED'); assert.equal(mistral.calls, spent)
  assert.equal(life().mathsSolver, 5)
})
await ok('a failed AI call gives the use back, and so does an empty answer', async () => {
  fresh(); mistral.mode = 'error'
  let r = await call('u1', { feature: 'mathsSolver' })
  assert.ok(r.status >= 500); assert.equal(r.body.entitlement, undefined)
  assert.equal(life().mathsSolver, 0); assert.equal(life().daily.mathsSolver.n, 0)
  mistral.mode = 'empty'; r = await call('u1', { feature: 'mathsSolver' })
  assert.equal(r.status, 502); assert.equal(life().mathsSolver, 0)
  mistral.mode = 'ok'; r = await call('u1', { feature: 'mathsSolver' })
  assert.equal(r.status, 200); assert.equal(r.body.entitlement.remainingLifetime, 4)         // nothing was lost to the failures
})
await ok('a refusal by the general daily pool gives the use back', async () => {
  fresh({ 'users/u1/usage/aiCalls': { date: TODAY, count: 150 } })
  const r = await call('u1', { feature: 'mathsSolver' })
  assert.equal(r.status, 429); assert.equal(mistral.calls, 0); assert.equal(life().mathsSolver, 0)
})
await ok('an allowance check that fails returns 503, never calls the AI, and gives the use back', async () => {
  fresh()
  const db = globalThis.__db, real = db.runTransaction.bind(db); let t = 0
  db.runTransaction = async (fn) => { t++; if (t === 2) throw new Error('unavailable'); return real(fn) }     // 1 = the free-use count, 2 = the general pool
  const r = await call('u1', { feature: 'mathsSolver' })
  assert.equal(r.status, 503); assert.equal(r.body.code, 'TEMPORARILY_UNAVAILABLE'); assert.equal(mistral.calls, 0); assert.equal(life().mathsSolver, 0)
})
await ok('Pro and beta accounts are never counted and are told nothing about free uses', async () => {
  fresh({ 'users/p1': { isPro: true }, 'users/b1': { betaUser: true } })
  for (const uid of ['p1', 'b1']) for (let i = 0; i < 8; i++) {
    const r = await call(uid, { feature: 'mathsSolver' })
    assert.equal(r.status, 200); assert.equal(r.body.entitlement, undefined)
  }
  assert.equal(life('p1'), undefined); assert.equal(life('b1'), undefined)
})
await ok('a request with no feature tag is not counted at all', async () => {
  fresh(); const r = await call('u1', {})
  assert.equal(r.status, 200); assert.equal(r.body.entitlement, undefined); assert.equal(life(), undefined)
})
await ok('photo-scan marking counts with the image request, and the 4th is refused before the AI', async () => {
  fresh()
  for (const left of [2, 1, 0]) { const r = await call('u1', { feature: 'photoMarking', imageBase64: IMG }); assert.equal(r.status, 200); assert.equal(r.body.entitlement.remainingLifetime, left) }
  const spent = mistral.calls
  const r = await call('u1', { feature: 'photoMarking', imageBase64: IMG })
  assert.equal(r.status, 402); assert.equal(r.body.code, 'LIFETIME_EXHAUSTED'); assert.equal(mistral.calls, spent)
})
await ok('essay feedback: 1 a day and 2 in all', async () => {
  fresh()
  let r = await call('u1', { feature: 'essayFeedback' }); assert.equal(r.status, 200); assert.equal(r.body.entitlement.remainingLifetime, 1)
  r = await call('u1', { feature: 'essayFeedback' }); assert.equal(r.status, 429); assert.equal(r.body.code, 'DAILY_LIMIT')
  nextDay(); r = await call('u1', { feature: 'essayFeedback' }); assert.equal(r.status, 200); assert.equal(r.body.entitlement.remainingLifetime, 0)
  nextDay(); r = await call('u1', { feature: 'essayFeedback' }); assert.equal(r.status, 402); assert.equal(r.body.code, 'LIFETIME_EXHAUSTED')
})
console.log(`\n${n} tutor counting checks passed`)
