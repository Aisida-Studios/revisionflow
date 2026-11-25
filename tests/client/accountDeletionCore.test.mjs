// tests/client/accountDeletionCore.test.mjs
// The browser side of account deletion (src/utils/accountDeletionCore.js) against a scripted fake server. Nothing here talks to
// Firebase or the network; the server's own behaviour is tested in tests/functions/account.test.mjs.
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import {
  requestAccountDeletion, reauthMessage, clearBrowserData, MAX_TRANSIENT_FAILURES,
  REAUTH_FLAG, REAUTH_FRESH_MS, markReauthStarted, peekReturnedReauth, clearReauthMark,
} from '../../src/utils/accountDeletionCore.js'

const reply = (status, body) => ({ status, ok: status < 400, json: async () => body })
const notJson = (status) => ({ status, ok: false, json: async () => { throw new SyntaxError('Unexpected token <') } })

// A scripted server: each call takes the next step (a reply, or an Error to throw); the last step repeats.
function script(...steps) {
  const calls = []
  const fetchFn = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body), headers: init.headers })
    const step = steps.length > 1 ? steps.shift() : steps[0]
    if (step instanceof Error) throw step
    return step
  }
  return { fetchFn, calls }
}
function harness(over = {}) {
  const tokenCalls = []
  const sleeps = []
  const progress = []
  const deps = {
    getToken: async (force) => { tokenCalls.push(force); return 'tok-' + tokenCalls.length },
    accountGone: async () => false,
    sleep: async (ms) => { sleeps.push(ms) },
    onProgress: (p) => progress.push(p),
    ...over,
  }
  return { deps, tokenCalls, sleeps, progress }
}
const run = (srv, h = harness(), extra = {}) => requestAccountDeletion({ ...h.deps, fetchFn: srv.fetchFn, ...extra })

describe('asking the server', () => {
  test('a completed answer is success: one POST with the action, the bearer token and any App Check header', async () => {
    const srv = script(reply(200, { state: 'completed' }))
    const h = harness({ appCheckHeaders: async () => ({ 'X-Firebase-AppCheck': 'ac' }) })
    assert.deepEqual(await run(srv, h), { ok: true })
    assert.equal(srv.calls.length, 1)
    assert.equal(srv.calls[0].url, '/api/account')
    assert.equal(srv.calls[0].init.method, 'POST')
    assert.deepEqual(srv.calls[0].body, { action: 'delete' })
    assert.equal(srv.calls[0].headers.Authorization, 'Bearer tok-1')
    assert.equal(srv.calls[0].headers['X-Firebase-AppCheck'], 'ac')
    assert.equal(srv.calls[0].headers['Content-Type'], 'application/json')
    assert.deepEqual(h.tokenCalls, [true], 'the first token is freshly refreshed')
  })

  test('while the server says running it asks again after the wait it names (kept between 1 and 10 seconds), reporting progress', async () => {
    const srv = script(reply(202, { state: 'running', retryAfterSeconds: 5 }), reply(202, { retryAfterSeconds: 0.2 }), reply(202, { retryAfterSeconds: 99 }), reply(202, {}), reply(202, { retryAfterSeconds: 'abc' }), reply(200, { state: 'completed' }))
    const h = harness()
    assert.deepEqual(await run(srv, h), { ok: true })
    assert.deepEqual(h.sleeps, [5000, 1000, 10000, 2000, 2000])
    assert.deepEqual(h.progress.map((p) => p.call), [1, 2, 3, 4, 5])
    assert.ok(h.progress.every((p) => p.state === 'running'))
    assert.deepEqual(h.tokenCalls, [true, false, false, false, false, false], 'only the first call forces a refresh')
  })

  test('the first token is refreshed again if that attempt failed, so the sign-in the student just confirmed is what the server sees', async () => {
    let n = 0
    const h = harness({ getToken: async (force) => { n++; h.tokenCalls.push(force); if (n === 1) throw new Error('offline'); return 'tok' } })
    const srv = script(reply(200, { state: 'completed' }))
    assert.deepEqual(await run(srv, h), { ok: true })
    assert.deepEqual(h.tokenCalls, [true, true])
  })

  test('a request for a fresh sign-in ends with a clear instruction and no more calls', async () => {
    const srv = script(reply(401, { error: 'Please confirm it is you by signing in again, then retry.', code: 'recent_login_required' }))
    const r = await run(srv)
    assert.equal(r.ok, false)
    assert.equal(r.reason, 'recent_login_required')
    assert.match(r.message, /confirm it is you again/)
    assert.equal(srv.calls.length, 1)
  })

  test('a refused token is success ONLY if Firebase says the account is gone (the server deletes the sign-in record near the end)', async () => {
    const mk = () => script(reply(202, { state: 'running', retryAfterSeconds: 1 }), reply(401, { error: 'Your session has expired. Please sign in again.', code: 'invalid_token' }))
    assert.deepEqual(await run(mk(), harness({ accountGone: async () => true })), { ok: true })
    const stillThere = await run(mk(), harness({ accountGone: async () => false }))
    assert.equal(stillThere.ok, false)
    assert.equal(stillThere.reason, 'sign_in_again')
    const unknown = await run(mk(), harness({ accountGone: async () => null }))
    assert.equal(unknown.ok, false)
    assert.equal(unknown.reason, 'offline')
    const throws = await run(mk(), harness({ accountGone: async () => { throw new Error('boom') } }))
    assert.equal(throws.ok, false, 'a failing check is never read as "gone"')
    // and the same on the very first call
    assert.deepEqual(await run(script(reply(401, { code: 'unauthenticated' })), harness({ accountGone: async () => true })), { ok: true })
    assert.equal((await run(script(reply(401, { code: 'unauthenticated' })), harness({ accountGone: async () => false }))).reason, 'sign_in_again')
  })

  test('too many attempts and "could not finish" show the server\'s own wording and are not retried automatically', async () => {
    // (the wordings below differ from this file's own defaults, so showing the server's wording is what the assertions prove)
    const limited = script(reply(429, { error: 'Please wait 15 minutes before trying again.', code: 'rate_limited' }))
    const r1 = await run(limited)
    assert.deepEqual(r1, { ok: false, reason: 'rate_limited', message: 'Please wait 15 minutes before trying again.' })
    assert.equal(limited.calls.length, 1)
    const msg = 'Some of your data is still being removed. Nothing has been lost; please try again shortly.'
    const incomplete = script(reply(503, { error: msg, code: 'deletion_incomplete', state: 'failed' }))
    assert.deepEqual(await run(incomplete), { ok: false, reason: 'failed', message: msg })
    assert.equal(incomplete.calls.length, 1)
    // no wording from the server: ours
    assert.match((await run(script(reply(429, {})))).message, /Too many attempts/)
    assert.match((await run(script(reply(503, { code: 'deletion_incomplete' })))).message, /could not finish deleting/)
  })

  test('gateway timeouts, odd bodies and network errors are retried, then the job carries on to completion', async () => {
    const srv = script(notJson(504), new Error('network'), reply(502, {}), reply(202, { retryAfterSeconds: 2 }), reply(200, { state: 'completed' }))
    const h = harness()
    assert.deepEqual(await run(srv, h), { ok: true })
    assert.equal(srv.calls.length, 5)
    assert.deepEqual(h.sleeps, [3000, 2000, 3000, 2000])
  })

  test('it gives up after several failures in a row, with the right reason', async () => {
    const net = script(new Error('network'))
    const r1 = await run(net)
    assert.equal(r1.ok, false)
    assert.equal(r1.reason, 'offline')
    assert.equal(net.calls.length, MAX_TRANSIENT_FAILURES)
    const gw = script(notJson(504))
    const r2 = await run(gw)
    assert.equal(r2.reason, 'failed')
    assert.equal(gw.calls.length, MAX_TRANSIENT_FAILURES)
    // a success in between starts the count again
    const mixed = script(notJson(504), notJson(504), notJson(504), notJson(504), reply(202, {}), notJson(504), notJson(504), notJson(504), notJson(504), reply(200, { state: 'completed' }))
    assert.deepEqual(await run(mixed), { ok: true })
  })

  test('a network error while the account is already gone is the finish line', async () => {
    const srv = script(reply(202, {}), new Error('network'))
    assert.deepEqual(await run(srv, harness({ accountGone: async () => true })), { ok: true })
  })

  test('an answer that is not exactly "completed" is never taken as success, and is not retried', async () => {
    for (const r of [reply(200, {}), reply(200, { state: 'none' }), reply(200, { state: 'failed' }), reply(200, 'ok'), reply(200, null), reply(204, null), reply(400, { error: 'x' }), reply(403, {}), reply(404, {}), reply(409, {}), notJson(200)]) {
      const srv = script(r)
      const out = await run(srv)
      assert.equal(out.ok, false, JSON.stringify(r.status))
      assert.equal(out.reason, 'failed')
      assert.equal(srv.calls.length, 1)
    }
  })

  test('it stops asking after a bounded number of calls and says it is still running', async () => {
    const srv = script(reply(202, { state: 'running', retryAfterSeconds: 1 }))
    const r = await run(srv, harness(), { maxCalls: 3 })
    assert.equal(r.ok, false)
    assert.equal(r.reason, 'still_running')
    assert.equal(srv.calls.length, 3)
  })
})

describe('what to tell the student when confirming their identity fails', () => {
  test('known Firebase codes, our own codes, and anything else', () => {
    const cases = {
      'rf/password-required': /Enter your password/, 'auth/wrong-password': /not right/, 'auth/invalid-credential': /not right/, 'auth/invalid-login-credentials': /not right/,
      'auth/too-many-requests': /Too many attempts/, 'auth/popup-closed-by-user': /cancelled/, 'auth/cancelled-popup-request': /cancelled/, 'auth/popup-blocked': /blocked the Google window/,
      'auth/user-mismatch': /different account/, 'auth/network-request-failed': /Check your connection/, 'rf/unsupported-provider': /sign back in/,
      'auth/operation-not-supported-in-this-environment': /usual browser/, 'auth/web-storage-unsupported': /usual browser/, 'rf/redirect-stalled': /Google did not open/,
      'auth/something-new': /could not confirm it is you/,
    }
    for (const [code, re] of Object.entries(cases)) assert.match(reauthMessage({ code }), re, code)
    for (const err of [undefined, null, {}, new Error('x'), 'text']) assert.match(reauthMessage(err), /could not confirm it is you/)
    for (const code of Object.keys(cases)) assert.ok(!/auth\/|rf\//.test(reauthMessage({ code })), 'no internal code is shown to the student: ' + code)
  })
})

describe('confirming with Google inside the installed app (the trip to Google and back)', () => {
  // A stand-in for sessionStorage.
  const store = (over = {}) => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)) }, removeItem: (k) => { m.delete(k) }, ...over } }
  const T0 = 1_700_000_000_000

  test('nothing is remembered until the page is about to leave for Google', () => {
    assert.equal(peekReturnedReauth(store(), T0), false)
  })

  test('a mark made just before leaving is recognised on the way back, and looking at it does not use it up', () => {
    const s = store()
    assert.equal(markReauthStarted(s, T0), true)
    assert.equal(s.getItem(REAUTH_FLAG), String(T0))
    assert.equal(peekReturnedReauth(s, T0 + 30_000), true)
    assert.equal(peekReturnedReauth(s, T0 + 30_000), true, 'a second look (React may create a component twice) sees the same thing')
  })

  test('the mark goes stale before the server\'s five-minute rule does, so a student is never let through on an old confirmation', () => {
    assert.ok(REAUTH_FRESH_MS < 5 * 60 * 1000)
    const s = store(); markReauthStarted(s, T0)
    assert.equal(peekReturnedReauth(s, T0 + REAUTH_FRESH_MS - 1), true)
    assert.equal(peekReturnedReauth(s, T0 + REAUTH_FRESH_MS), false)
    assert.equal(peekReturnedReauth(s, T0 + 60 * 60 * 1000), false)
  })

  test('a mark from the future, or a damaged one, is ignored', () => {
    const s = store(); markReauthStarted(s, T0)
    assert.equal(peekReturnedReauth(s, T0 - 1), false)
    for (const junk of ['', 'abc', '0', '-5', 'NaN', 'Infinity', '12abc']) {
      s.setItem(REAUTH_FLAG, junk)
      assert.equal(peekReturnedReauth(s, T0), false, JSON.stringify(junk))
    }
  })

  test('forgetting the mark clears it (after an attempt, on cancel, or when Google never opened)', () => {
    const s = store(); markReauthStarted(s, T0)
    clearReauthMark(s)
    assert.equal(peekReturnedReauth(s, T0 + 1), false)
    assert.equal(s.getItem(REAUTH_FLAG), null)
  })

  test('storage that refuses to be used never throws: it says it could not remember, so no redirect is started that could not be recognised', () => {
    const broken = store({ setItem() { throw new Error('SecurityError') }, getItem() { throw new Error('SecurityError') }, removeItem() { throw new Error('SecurityError') } })
    assert.equal(markReauthStarted(broken, T0), false)
    assert.equal(peekReturnedReauth(broken, T0), false)
    assert.doesNotThrow(() => clearReauthMark(broken))
    assert.equal(markReauthStarted(null, T0), false)
    assert.equal(peekReturnedReauth(undefined, T0), false)
    assert.doesNotThrow(() => clearReauthMark(null))
  })
})

describe('forgetting the account on this device', () => {
  function fakeEnv({ failing = [], databases = true, hangingDelete = false, blocked = false } = {}) {
    const log = []
    const store = (name) => ({ clear() { if (failing.includes(name)) throw new Error(name + ' failed'); log.push(name) } })
    const sub = { unsubscribe: async () => { if (failing.includes('push')) throw new Error('push failed'); log.push('push') } }
    const idb = {
      deleteDatabase: (name) => {
        log.push('db:' + name)
        const req = {}
        if (!hangingDelete) queueMicrotask(() => (blocked ? req.onblocked && req.onblocked() : req.onsuccess && req.onsuccess()))
        return req
      },
    }
    if (databases) idb.databases = async () => [{ name: 'db1' }, { name: 'db2' }, {}]
    return {
      log,
      env: {
        navigator: { serviceWorker: { getRegistration: async () => ({ pushManager: { getSubscription: async () => sub } }) } },
        caches: { keys: async () => ['shell', 'api'], delete: async (k) => { if (failing.includes('caches')) throw new Error('caches failed'); log.push('cache:' + k); return true } },
        localStorage: store('localStorage'),
        sessionStorage: store('sessionStorage'),
        indexedDB: idb,
      },
    }
  }

  test('push subscription, caches, local and session storage and IndexedDB are all cleared', async () => {
    const { env, log } = fakeEnv()
    const out = await clearBrowserData(env, { dbTimeoutMs: 50 })
    assert.deepEqual(out, [['push', true], ['caches', true], ['localStorage', true], ['sessionStorage', true], ['indexedDB', true]])
    assert.deepEqual(log, ['push', 'cache:shell', 'cache:api', 'localStorage', 'sessionStorage', 'db:db1', 'db:db2'])
  })

  test('one step failing does not stop the others, and is reported', async () => {
    for (const failing of ['push', 'caches', 'localStorage', 'sessionStorage']) {
      const { env, log } = fakeEnv({ failing: [failing] })
      const out = await clearBrowserData(env, { dbTimeoutMs: 50 })
      assert.deepEqual(out.filter(([, ok]) => !ok).map(([name]) => name), [failing])
      assert.ok(log.includes('db:db1'), 'IndexedDB still cleared when ' + failing + ' failed')
    }
  })

  test('browsers that cannot list databases get the ones Firebase creates; a blocked or hanging delete does not hang the page', async () => {
    const a = fakeEnv({ databases: false })
    await clearBrowserData(a.env, { dbTimeoutMs: 50 })
    assert.deepEqual(a.log.filter((l) => l.startsWith('db:')), ['db:firebaseLocalStorageDb', 'db:firebase-heartbeat-database', 'db:firebase-installations-database', 'db:firebase-messaging-database'])
    const b = fakeEnv({ blocked: true })
    assert.equal((await clearBrowserData(b.env, { dbTimeoutMs: 50 })).find(([n]) => n === 'indexedDB')[1], true)
    const started = Date.now()
    const c = fakeEnv({ hangingDelete: true })
    assert.equal((await clearBrowserData(c.env, { dbTimeoutMs: 30 })).find(([n]) => n === 'indexedDB')[1], true)
    assert.ok(Date.now() - started < 1500)
  })

  test('an environment with none of these APIs is fine', async () => {
    const out = await clearBrowserData({}, { dbTimeoutMs: 10 })
    assert.deepEqual(out.map(([, ok]) => ok), [true, true, true, true, true])
  })
})
