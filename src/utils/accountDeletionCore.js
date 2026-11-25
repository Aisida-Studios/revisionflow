// src/utils/accountDeletionCore.js
// The browser's side of permanent account deletion, with no Firebase imports so it can be tested on its own (the wiring to
// Firebase Auth is in accountDeletion.js). The server does the deleting (netlify/functions/account.js): this asks it to, keeps
// asking while it answers "running", and decides what each refusal means for the student.
//
// Two rules run through all of it:
//   * Success is only ever reported when the server says "completed", or when Firebase itself says the account no longer exists.
//     A missing answer, an odd answer or an error is never taken as "deleted".
//   * What this browser still holds (local storage, caches, a push subscription) is cleared only after that, never before.

export const MAX_CALLS = 90                  // one call is at most ~10 s of server work, so this is several minutes of trying
export const MAX_TRANSIENT_FAILURES = 5      // consecutive network errors / gateway timeouts before giving up for now

const MESSAGES = {
  recent: 'For your safety, please confirm it is you again, then press Delete.',
  signIn: 'Your session has ended. Please sign out, sign back in, and delete your account straight away.',
  busy: 'Too many attempts. Please wait a while and try again.',
  offline: 'We could not reach RevisionFlow. Check your connection and try again.',
  failed: 'We could not finish deleting your account yet. Nothing has been lost. Please try again in a few minutes.',
  running: 'Your account is still being deleted. Press Delete again to carry on where it left off.',
}

const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// `accountGone()` is true when Firebase says the account no longer exists, false when it does, and null when that cannot be
// told (offline, or no signed-in user). It must never throw, but is guarded anyway.
async function goneOrUnknown(accountGone) {
  try { return await accountGone() } catch { return null }
}

// Ask the server to delete the signed-in student's account and keep asking while it works. Never throws. Resolves to
//   { ok: true }
//   { ok: false, reason, message }   reason: recent_login_required | sign_in_again | rate_limited | failed | offline | still_running
export async function requestAccountDeletion({
  getToken,                         // (forceRefresh: boolean) => Promise<string>   the ID token of the signed-in user
  accountGone,                      // () => Promise<true | false | null>
  fetchFn,                          // fetch
  appCheckHeaders = async () => ({}),
  sleep = defaultSleep,
  onProgress = () => {},
  maxCalls = MAX_CALLS,
}) {
  let transient = 0
  let refreshed = false           // true once a freshly refreshed token has been obtained
  for (let call = 1; call <= maxCalls; call++) {
    let res
    let data
    try {
      // The first token is freshly refreshed (and again if that attempt failed), so the sign-in the student has just confirmed is
      // the one the server sees.
      const token = await getToken(!refreshed)
      refreshed = true
      res = await fetchFn('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token, ...(await appCheckHeaders()) },
        body: JSON.stringify({ action: 'delete' }),
      })
      data = await res.json().catch(() => ({}))
    } catch {
      // Offline, or the token could not be refreshed. If Firebase says the account is gone, that is the finish line.
      if (await goneOrUnknown(accountGone) === true) return { ok: true }
      if (++transient >= MAX_TRANSIENT_FAILURES) return { ok: false, reason: 'offline', message: MESSAGES.offline }
      await sleep(2000)
      continue
    }
    if (!data || typeof data !== 'object') data = {}

    if (res.status === 200 && data.state === 'completed') return { ok: true }

    if (res.status === 202 || (res.status === 200 && data.state === 'running')) {
      transient = 0
      onProgress({ state: 'running', call })
      const wait = Math.min(10, Math.max(1, Number(data.retryAfterSeconds) || 2))
      await sleep(wait * 1000)
      continue
    }

    if (res.status === 401) {
      if (data.code === 'recent_login_required') return { ok: false, reason: 'recent_login_required', message: MESSAGES.recent }
      // The server removes the sign-in record near the end of the job, after which every token stops working. So a refused
      // token can mean "already finished": only Firebase can say, and only "gone" counts.
      const gone = await goneOrUnknown(accountGone)
      if (gone === true) return { ok: true }
      if (gone === null) return { ok: false, reason: 'offline', message: MESSAGES.offline }
      return { ok: false, reason: 'sign_in_again', message: MESSAGES.signIn }
    }

    if (res.status === 429) return { ok: false, reason: 'rate_limited', message: typeof data.error === 'string' && data.error ? data.error : MESSAGES.busy }

    if (res.status === 503 && data.code === 'deletion_incomplete') return { ok: false, reason: 'failed', message: typeof data.error === 'string' && data.error ? data.error : MESSAGES.failed }

    if (res.status >= 500) {
      // A gateway timeout (the platform cut a long call short), a blip, a restart: the job record lets the next call carry on.
      if (++transient >= MAX_TRANSIENT_FAILURES) return { ok: false, reason: 'failed', message: MESSAGES.failed }
      await sleep(3000)
      continue
    }

    return { ok: false, reason: 'failed', message: MESSAGES.failed }
  }
  return { ok: false, reason: 'still_running', message: MESSAGES.running }
}

// What to tell the student when confirming their identity did not work. `err.code` is a Firebase Auth code, or one of ours (rf/...).
export function reauthMessage(err) {
  switch (err && err.code) {
    case 'rf/password-required': return 'Enter your password to confirm it is you.'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials': return 'That password is not right.'
    case 'auth/too-many-requests': return 'Too many attempts. Please wait a few minutes and try again.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request': return 'Confirmation was cancelled. Nothing has been deleted.'
    case 'auth/popup-blocked': return 'Your browser blocked the Google window. Allow pop-ups for this site and try again, or sign out, sign back in and delete your account straight away.'
    case 'auth/user-mismatch': return 'That is a different account from the one you are signed in with.'
    case 'auth/network-request-failed': return 'We could not reach the sign-in service. Check your connection and try again.'
    case 'auth/operation-not-supported-in-this-environment':
    case 'auth/web-storage-unsupported': return 'Google confirmation is not available in this browser. Open RevisionFlow in your usual browser and try again there.'
    case 'rf/redirect-stalled': return 'Google did not open. Try again.'
    case 'rf/unsupported-provider': return 'Sign out, sign back in, and delete your account straight away.'
    default: return 'We could not confirm it is you. Please try again.'
  }
}

// ---- Confirming with Google inside the installed app ----------------------------------------------------------------------
// In the installed app a Google pop-up cannot report back to the page (the reason utils/firestore.js signs in with a redirect
// there), so confirming leaves the page for Google and comes back to it. These helpers carry "the student has just done that"
// across the round trip, so the dialog can finish the job instead of sending them round again. They only decide whether to ask
// the student AGAIN: the server insists on a sign-in from the last five minutes whatever this says, so a stale or forged mark
// cannot make a deletion happen that the server would refuse.
export const REAUTH_FLAG = 'rf_delete_reauth'
export const REAUTH_FRESH_MS = 4 * 60 * 1000          // inside the server's five-minute rule, with a minute to spare

// Remember that the page is about to leave for Google. Returns false when the browser would not store it (then the caller must
// not start a redirect it could not recognise on the way back, or the student would be sent round again for ever).
export function markReauthStarted(storage, now = Date.now()) {
  try { storage.setItem(REAUTH_FLAG, String(now)); return true } catch { return false }
}

// True when the page has just come back from Google after a mark made less than REAUTH_FRESH_MS ago. Changes nothing, so it is
// safe to call while a component is being created (React may do that twice).
export function peekReturnedReauth(storage, now = Date.now()) {
  try {
    const started = Number(storage.getItem(REAUTH_FLAG))
    return Number.isFinite(started) && started > 0 && now - started >= 0 && now - started < REAUTH_FRESH_MS
  } catch { return false }
}

// Forget the mark: after a deletion attempt, when the dialog is closed, or when the redirect did not happen.
export function clearReauthMark(storage) {
  try { storage.removeItem(REAUTH_FLAG) } catch { /* nothing to forget */ }
}

// The databases Firebase's own libraries create, for browsers that cannot list databases (indexedDB.databases()).
const KNOWN_DATABASES = ['firebaseLocalStorageDb', 'firebase-heartbeat-database', 'firebase-installations-database', 'firebase-messaging-database']

function deleteDatabase(idb, name, timeoutMs) {
  return new Promise((resolve) => {
    let done = false
    let timer = null
    // Whichever comes first ends the wait: the database reporting back, or the time limit (a delete that is blocked or never
    // answers must not hold the page up). The timer is cleared so none is left running.
    const finish = () => { if (!done) { done = true; clearTimeout(timer); resolve() } }
    timer = setTimeout(finish, timeoutMs)
    try {
      const req = idb.deleteDatabase(name)
      req.onsuccess = finish
      req.onerror = finish
      req.onblocked = finish        // another connection is open: it closes when the page is left, which happens next
    } catch { finish() }
  })
}

// Forget this account on this device: push subscription, service-worker caches, local and session storage, IndexedDB. Every
// step is tried even if an earlier one fails. Never throws. Returns the outcome of each step, e.g. [['push', true], ...].
export async function clearBrowserData(env = globalThis, { dbTimeoutMs = 1500 } = {}) {
  const outcome = []
  const run = async (name, fn) => {
    try { await fn(); outcome.push([name, true]) } catch { outcome.push([name, false]) }
  }
  await run('push', async () => {
    const sw = env.navigator && env.navigator.serviceWorker
    if (!sw || typeof sw.getRegistration !== 'function') return
    const reg = await sw.getRegistration()
    const sub = reg && reg.pushManager ? await reg.pushManager.getSubscription() : null
    if (sub) await sub.unsubscribe()
  })
  await run('caches', async () => {
    if (!env.caches) return
    for (const key of await env.caches.keys()) await env.caches.delete(key)
  })
  await run('localStorage', async () => { if (env.localStorage) env.localStorage.clear() })
  await run('sessionStorage', async () => { if (env.sessionStorage) env.sessionStorage.clear() })
  await run('indexedDB', async () => {
    const idb = env.indexedDB
    if (!idb) return
    const names = typeof idb.databases === 'function' ? (await idb.databases()).map((d) => d && d.name).filter(Boolean) : KNOWN_DATABASES
    await Promise.all(names.map((name) => deleteDatabase(idb, name, dbTimeoutMs)))
  })
  return outcome
}
