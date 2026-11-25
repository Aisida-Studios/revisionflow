// netlify/functions/lib/auth.js
// Shared identity checks for the Netlify functions (CommonJS).
//
// WHY: every function carried its own copy of getAdmin(), verifyUserToken() and checkAppCheck(). The copies differed in what
// they tolerated (an unparseable FIREBASE_SERVICE_ACCOUNT became `{}` and failed later with a confusing error), the admin gate
// compared the token's e-mail without checking that the address was verified, and App Check failures logged err.message.
// This file is the one place those decisions live.
//
// What it guarantees to a caller:
//   * verifyUser()   -> the identity comes ONLY from a verified Firebase ID token. Nothing in the request body is ever trusted
//                       to say who the caller is.
//   * requireAdmin() -> verified token + verified e-mail + e-mail on the admin list, with revocation checked.
//   * enforceAppCheck() -> monitor-only unless APP_CHECK_ENFORCE=true, exactly as before (App Check is an abuse signal, not
//                       an authorisation check, and nothing here treats it as one).
'use strict'

const { HttpError, header } = require('./http')

// Kept as the default so existing deployments keep working; set ADMIN_EMAILS (comma separated) in Netlify to replace it.
const DEFAULT_ADMIN_EMAILS = ['femiaisida1@gmail.com']

let _admin = null
function getAdmin() {
  if (_admin) return _admin
  const admin = require('firebase-admin')
  if (!admin.apps.length) {
    let serviceAccount
    try { serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '') } catch {
      // Say nothing about what is wrong with the secret: only that the server is not set up.
      throw new HttpError(503, 'The service is not available right now.', 'not_configured')
    }
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  }
  _admin = admin
  return admin
}

// A Firebase ID token is a JWT (letters, digits, '.', '-', '_'). The pattern only rejects a header with odd characters in it; the
// token itself is verified by Firebase. ':' is allowed so that the stand-in tokens of tests/helpers/firebaseAdminStub.cjs
// ("good:<uid>", used by tests/tutor.counting.test.js) get as far as that stub's own check.
function bearerToken(event) {
  const value = String(header(event, 'authorization') || '')
  const m = /^Bearer\s+([A-Za-z0-9._~+/=:-]+)\s*$/i.exec(value)
  return m ? m[1] : null
}

// Verify the caller's Firebase ID token.
//   checkRevoked        also rejects a token whose session was revoked or whose account was deleted (one extra Auth lookup:
//                       use it for anything destructive or administrative).
//   maxAuthAgeSeconds   require that the person really signed in this recently (the token's auth_time), for actions that
//                       must be a fresh decision such as deleting an account.
async function verifyUser(event, { checkRevoked = false, maxAuthAgeSeconds = null } = {}) {
  const token = bearerToken(event)
  if (!token) throw new HttpError(401, 'Sign in to continue.', 'unauthenticated')
  const admin = getAdmin()
  let decoded
  try {
    decoded = await admin.auth().verifyIdToken(token, checkRevoked === true)
  } catch {
    throw new HttpError(401, 'Your session has expired. Please sign in again.', 'invalid_token')
  }
  if (!decoded || typeof decoded.uid !== 'string' || !decoded.uid) throw new HttpError(401, 'Your session has expired. Please sign in again.', 'invalid_token')
  if (maxAuthAgeSeconds != null) {
    const authTime = Number(decoded.auth_time)
    const age = Math.floor(Date.now() / 1000) - authTime
    if (!Number.isFinite(authTime) || age > maxAuthAgeSeconds) {
      throw new HttpError(401, 'Please confirm it is you by signing in again, then retry.', 'recent_login_required')
    }
  }
  return decoded
}

function adminEmails(env = process.env) {
  const raw = env.ADMIN_EMAILS || env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAILS.join(',')
  return new Set(String(raw).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean))
}

// Admin gate: a verified, non-revoked token whose VERIFIED e-mail is on the admin list. (An unverified address proves nothing:
// anyone can type an address into a sign-up form.)
async function requireAdmin(event) {
  const decoded = await verifyUser(event, { checkRevoked: true })
  const email = String(decoded.email || '').toLowerCase()
  if (decoded.email_verified !== true || !email || !adminEmails().has(email)) throw new HttpError(403, 'Forbidden.', 'forbidden')
  return decoded
}

// App Check: returns whether the request carried a valid token. It never throws on its own.
async function checkAppCheck(event) {
  const token = header(event, 'x-firebase-appcheck')
  if (!token) return false
  try {
    await getAdmin().appCheck().verifyToken(token)
    return true
  } catch {
    return false
  }
}

// Monitor mode by default: only APP_CHECK_ENFORCE=true turns a missing or invalid token into a refusal.
async function enforceAppCheck(event) {
  const valid = await checkAppCheck(event)
  if (!valid && process.env.APP_CHECK_ENFORCE === 'true') throw new HttpError(401, 'Request verification failed.', 'app_check_failed')
  return valid
}

module.exports = { getAdmin, bearerToken, verifyUser, requireAdmin, adminEmails, checkAppCheck, enforceAppCheck, DEFAULT_ADMIN_EMAILS }
