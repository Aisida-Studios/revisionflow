// tests/helpers/fakeAdmin.js
//
// A FAKE of the parts of `firebase-admin` the Netlify functions use: Firestore (documents, subcollections, queries,
// batches, transactions with optimistic retry, recursiveDelete, FieldValue sentinels), Auth (verifyIdToken with the real
// "deleted users still pass unless checkRevoked" behaviour, deleteUser, getUser) and App Check.
//
// IT IS NOT THE FIREBASE EMULATOR AND PROVES NOTHING ABOUT SECURITY RULES. It exists so the real function code (friends,
// account, stripe, ...) can be exercised, including failure and retry paths, without credentials or network. Any test using
// it is a unit test of our code against our understanding of the Admin SDK; behaviour that matters in production (query
// planning, index requirements, real transaction contention, rules) is verified separately and listed as manual checks.
//
// Failure injection:  fake.failNext({ op: 'recursiveDelete', path: /^users\/u1$/ }, new Error('boom'), { times: 1 })
import Module, { createRequire } from 'node:module'

const nodeRequire = createRequire(import.meta.url)

// ---- values -----------------------------------------------------------------------------------------------------------
export class Timestamp {
  constructor(ms) { this._ms = ms; this.seconds = Math.floor(ms / 1000); this.nanoseconds = (ms % 1000) * 1e6 }
  static now() { return new Timestamp(Date.now()) }
  static fromMillis(ms) { return new Timestamp(ms) }
  static fromDate(d) { return new Timestamp(d.getTime()) }
  toMillis() { return this._ms }
  toDate() { return new Date(this._ms) }
}
class Sentinel { constructor(kind, arg) { this.kind = kind; this.arg = arg } }
export const FieldValue = {
  increment: (n) => new Sentinel('increment', n),
  arrayUnion: (...xs) => new Sentinel('arrayUnion', xs),
  arrayRemove: (...xs) => new Sentinel('arrayRemove', xs),
  serverTimestamp: () => new Sentinel('serverTimestamp'),
  delete: () => new Sentinel('delete'),
}

const isPlain = (v) => v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) && !(v instanceof Timestamp) && !(v instanceof Sentinel)
function clone(v) {
  if (v === undefined || v === null) return v
  if (v instanceof Date) return new Date(v.getTime())
  if (v instanceof Timestamp) return new Timestamp(v._ms)
  if (Array.isArray(v)) return v.map(clone)
  if (typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[k] = clone(v[k]); return o }
  return v
}
const same = (a, b) => JSON.stringify(a instanceof Timestamp ? a._ms : a) === JSON.stringify(b instanceof Timestamp ? b._ms : b)

function getPath(obj, path) {
  let cur = obj
  for (const part of path.split('.')) { if (cur == null || typeof cur !== 'object') return undefined; cur = cur[part] }
  return cur
}
function setPath(obj, path, value) {
  const parts = path.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) { if (!isPlain(cur[parts[i]])) cur[parts[i]] = {}; cur = cur[parts[i]] }
  if (value === DELETE) delete cur[parts[parts.length - 1]]
  else cur[parts[parts.length - 1]] = value
}
const DELETE = Symbol('delete')

function resolve(value, existing) {
  if (value instanceof Sentinel) {
    switch (value.kind) {
      case 'increment': return (typeof existing === 'number' ? existing : 0) + value.arg
      case 'arrayUnion': { const base = Array.isArray(existing) ? existing.slice() : []; for (const x of value.arg) if (!base.some((y) => same(x, y))) base.push(clone(x)); return base }
      case 'arrayRemove': return (Array.isArray(existing) ? existing : []).filter((y) => !value.arg.some((x) => same(x, y)))
      case 'serverTimestamp': return Timestamp.now()
      case 'delete': return DELETE
      default: throw new Error('unknown sentinel')
    }
  }
  if (isPlain(value)) { const o = {}; for (const k of Object.keys(value)) o[k] = resolve(value[k], existing && typeof existing === 'object' ? existing[k] : undefined); return o }
  if (Array.isArray(value)) return value.map((v) => resolve(v, undefined))
  return clone(value)
}
function stripDeleted(o) { for (const k of Object.keys(o)) { if (o[k] === DELETE) delete o[k]; else if (isPlain(o[k])) stripDeleted(o[k]) } return o }
function mergeInto(target, src) {
  for (const k of Object.keys(src)) {
    if (src[k] === DELETE) delete target[k]
    else if (isPlain(src[k]) && isPlain(target[k])) mergeInto(target[k], src[k])
    else target[k] = src[k]
  }
  return target
}

// ---- Firestore ------------------------------------------------------------------------------------------------------
export function makeFakeAdmin({ appCheckToken = 'valid-appcheck' } = {}) {
  const store = new Map()          // path -> { data, version }
  const failures = []              // { op, path, error, times }
  const calls = { recursiveDelete: [], deleteUser: [], authLookups: 0 }
  const errCode = (code, message) => Object.assign(new Error(message || code), { code })

  function maybeFail(op, path) {
    for (const f of failures) {
      if (f.times <= 0) continue
      const opOk = !f.op || f.op === op
      const pathOk = !f.path || (f.path instanceof RegExp ? f.path.test(path) : f.path === path)
      if (opOk && pathOk) { f.times--; throw f.error }
    }
  }

  const snapshotOf = (path) => {
    const e = store.get(path)
    const id = path.split('/').pop()
    return { id, ref: docRef(path), exists: !!e, data: () => (e ? clone(e.data) : undefined), get: (f) => (e ? getPath(e.data, f) : undefined) }
  }
  const applySet = (path, data, merge) => {
    const e = store.get(path)
    let next
    if (merge && e) next = stripDeleted(mergeInto(clone(e.data), resolve(data, e.data)))
    else next = stripDeleted(resolve(data, undefined))
    store.set(path, { data: next, version: (e ? e.version : 0) + 1 })
  }
  const applyUpdate = (path, data) => {
    const e = store.get(path)
    if (!e) throw errCode(5, `NOT_FOUND: No document to update: ${path}`)
    const next = clone(e.data)
    for (const k of Object.keys(data)) {
      const v = resolve(data[k], getPath(e.data, k))
      setPath(next, k, v)
    }
    store.set(path, { data: stripDeleted(next), version: e.version + 1 })
  }
  const applyCreate = (path, data) => {
    if (store.has(path)) throw errCode(6, `ALREADY_EXISTS: Document already exists: ${path}`)
    applySet(path, data, false)
  }
  const applyDelete = (path) => { store.delete(path) }

  const immediateChildren = (colPath) => [...store.keys()].filter((p) => p.startsWith(colPath + '/') && !p.slice(colPath.length + 1).includes('/'))

  function docRef(path) {
    const parts = path.split('/')
    return {
      id: parts[parts.length - 1], path,
      get parent() { return collRef(parts.slice(0, -1).join('/')) },
      collection: (name) => collRef(`${path}/${name}`),
      get: async () => { maybeFail('get', path); return snapshotOf(path) },
      set: async (data, opts) => { maybeFail('set', path); applySet(path, data, !!(opts && opts.merge)) },
      update: async (data) => { maybeFail('update', path); applyUpdate(path, data) },
      create: async (data) => { maybeFail('create', path); applyCreate(path, data) },
      delete: async () => { maybeFail('delete', path); applyDelete(path) },
      listCollections: async () => {
        const names = new Set()
        for (const p of store.keys()) if (p.startsWith(path + '/')) names.add(p.slice(path.length + 1).split('/')[0])
        return [...names].map((n) => collRef(`${path}/${n}`))
      },
    }
  }

  function matches(data, f) {
    const v = getPath(data, f.field)
    const cmp = (a, b) => (a instanceof Timestamp ? a._ms : a) - (b instanceof Timestamp ? b._ms : b)
    switch (f.op) {
      case '==': return same(v, f.value)
      case '!=': return !same(v, f.value)
      case 'in': return Array.isArray(f.value) && f.value.some((x) => same(v, x))
      case 'array-contains': return Array.isArray(v) && v.some((x) => same(x, f.value))
      case '>': return v !== undefined && (typeof v === 'string' ? v > f.value : cmp(v, f.value) > 0)
      case '>=': return v !== undefined && (typeof v === 'string' ? v >= f.value : cmp(v, f.value) >= 0)
      case '<': return v !== undefined && (typeof v === 'string' ? v < f.value : cmp(v, f.value) < 0)
      case '<=': return v !== undefined && (typeof v === 'string' ? v <= f.value : cmp(v, f.value) <= 0)
      default: throw new Error('fake: unsupported operator ' + f.op)
    }
  }

  // Every document path in the store whose collection is called `group` (a collection-group query), or the immediate children
  // of one collection.
  const candidates = (path, group) => {
    if (!group) return immediateChildren(path)
    return [...store.keys()].filter((p) => { const seg = p.split('/'); return seg.length % 2 === 0 && seg[seg.length - 2] === group })
  }

  // `extra`: { group } for a collection-group query, { after } (a document path) for startAfter().
  function collRef(path, filters = [], max = Infinity, order = null, extra = {}) {
    const run = () => {
      let paths = candidates(path, extra.group).filter((p) => filters.every((f) => matches(store.get(p).data, f)))
      if (order) {
        const keyOf = (p) => (order.field === '__name__' ? p : getPath(store.get(p).data, order.field))
        paths.sort((a, b) => { const x = keyOf(a), y = keyOf(b); return (x < y ? -1 : x > y ? 1 : 0) * (order.dir === 'desc' ? -1 : 1) })
      }
      if (extra.after) {
        const i = paths.indexOf(extra.after)
        paths = i >= 0 ? paths.slice(i + 1) : paths.filter((p) => (order && order.dir === 'desc' ? p < extra.after : p > extra.after))
      }
      return paths.slice(0, max).map(snapshotOf)
    }
    const label = extra.group ? `*group*/${extra.group}` : path
    const query = {
      path, _run: run,
      where: (field, op, value) => collRef(path, [...filters, { field, op, value }], max, order, extra),
      orderBy: (field, dir = 'asc') => collRef(path, filters, max, { field, dir }, extra),
      limit: (n) => collRef(path, filters, n, order, extra),
      startAfter: (snap) => collRef(path, filters, max, order, { ...extra, after: snap.ref ? snap.ref.path : snap.path }),
      select: () => query,
      get: async () => { maybeFail('query', label); const docs = run(); return { docs, size: docs.length, empty: docs.length === 0, forEach: (fn) => docs.forEach(fn) } },
      count: () => ({ get: async () => ({ data: () => ({ count: run().length }) }) }),
    }
    const segs = path.split('/')
    return {
      ...query, id: path.split('/').pop(),
      // users/u1/usage -> the document users/u1 (a top-level collection has no parent document)
      get parent() { return segs.length >= 3 ? docRef(segs.slice(0, -1).join('/')) : null },
      doc: (id) => docRef(`${path}/${id || 'auto' + Math.random().toString(36).slice(2, 12)}`),
      add: async (data) => { const ref = docRef(`${path}/auto${Math.random().toString(36).slice(2, 14)}`); await ref.set(data); return ref },
    }
  }

  const db = {
    collection: (name) => collRef(name),
    collectionGroup: (name) => collRef('*', [], Infinity, null, { group: name }),
    doc: (path) => docRef(path),
    // Like the Admin SDK: snapshots for several references at once (missing documents come back with exists === false).
    getAll: async (...refs) => { for (const r of refs) maybeFail('get', r.path); return refs.map((r) => snapshotOf(r.path)) },
    batch: () => {
      const ops = []
      const b = {
        set: (ref, data, opts) => { ops.push(() => { maybeFail('set', ref.path); applySet(ref.path, data, !!(opts && opts.merge)) }); return b },
        update: (ref, data) => { ops.push(() => { maybeFail('update', ref.path); applyUpdate(ref.path, data) }); return b },
        create: (ref, data) => { ops.push(() => { maybeFail('create', ref.path); applyCreate(ref.path, data) }); return b },
        delete: (ref) => { ops.push(() => { maybeFail('delete', ref.path); applyDelete(ref.path) }); return b },
        commit: async () => {
          // All-or-nothing, like the real batch: validate by running against a copy, then apply.
          const backup = new Map([...store].map(([k, v]) => [k, { data: clone(v.data), version: v.version }]))
          try { ops.forEach((op) => op()) } catch (err) { store.clear(); backup.forEach((v, k) => store.set(k, v)); throw err }
        },
      }
      return b
    },
    recursiveDelete: async (ref) => {
      calls.recursiveDelete.push(ref.path)
      maybeFail('recursiveDelete', ref.path)
      for (const p of [...store.keys()]) if (p === ref.path || p.startsWith(ref.path + '/')) store.delete(p)
    },
    runTransaction: async (fn) => {
      for (let attempt = 1; ; attempt++) {
        const reads = new Map(); const writes = []
        const tx = {
          get: async (target) => {
            await new Promise((r) => setTimeout(r, 0))
            if (target && typeof target._run === 'function') { const docs = target._run(); docs.forEach((d) => reads.set(d.ref.path, store.get(d.ref.path).version)); return { docs, size: docs.length, empty: docs.length === 0 } }
            const e = store.get(target.path); reads.set(target.path, e ? e.version : 0); maybeFail('get', target.path); return snapshotOf(target.path)
          },
          set: (ref, data, opts) => { writes.push(() => { maybeFail('set', ref.path); applySet(ref.path, data, !!(opts && opts.merge)) }); return tx },
          update: (ref, data) => { writes.push(() => { maybeFail('update', ref.path); applyUpdate(ref.path, data) }); return tx },
          create: (ref, data) => { writes.push(() => { maybeFail('create', ref.path); applyCreate(ref.path, data) }); return tx },
          delete: (ref) => { writes.push(() => { maybeFail('delete', ref.path); applyDelete(ref.path) }); return tx },
        }
        const result = await fn(tx)
        const conflict = [...reads].some(([p, v]) => (store.has(p) ? store.get(p).version : 0) !== v)
        if (conflict) { if (attempt >= 5) throw errCode(10, 'ABORTED: too much contention'); continue }
        const backup = new Map([...store].map(([k, v]) => [k, { data: clone(v.data), version: v.version }]))
        try { writes.forEach((w) => w()) } catch (err) { store.clear(); backup.forEach((v, k) => store.set(k, v)); throw err }
        return result
      }
    },
  }

  // ---- Auth -----------------------------------------------------------------------------------------------------------
  const authUsers = new Map()    // uid -> { uid, email, emailVerified, disabled, tokensValidAfter }
  const authApi = {
    verifyIdToken: async (token, checkRevoked = false) => {
      calls.authLookups++
      maybeFail('verifyIdToken', 'auth')
      let claims
      try { claims = JSON.parse(Buffer.from(String(token).replace(/^fake\./, ''), 'base64url').toString('utf8')) } catch { throw errCode('auth/argument-error', 'Decoding Firebase ID token failed') }
      if (!claims || !claims.uid) throw errCode('auth/argument-error', 'bad token')
      if (claims.expired) throw errCode('auth/id-token-expired', 'expired')
      if (checkRevoked) {
        const u = authUsers.get(claims.uid)
        if (!u) throw errCode('auth/user-not-found', 'no user')
        if (u.disabled) throw errCode('auth/user-disabled', 'disabled')
        if (u.tokensValidAfter && claims.auth_time < u.tokensValidAfter) throw errCode('auth/id-token-revoked', 'revoked')
      }
      return { uid: claims.uid, email: claims.email, email_verified: claims.email_verified, auth_time: claims.auth_time, iat: claims.auth_time }
    },
    getUserByEmail: async (email) => { const u = [...authUsers.values()].find((x) => String(x.email).toLowerCase() === String(email).toLowerCase()); if (!u) throw errCode('auth/user-not-found', 'no user'); return { ...u } },
    getUser: async (uid) => { maybeFail('getUser', uid); const u = authUsers.get(uid); if (!u) throw errCode('auth/user-not-found', 'no user'); return { ...u } },
    deleteUser: async (uid) => { calls.deleteUser.push(uid); maybeFail('deleteUser', uid); if (!authUsers.has(uid)) throw errCode('auth/user-not-found', 'no user'); authUsers.delete(uid) },
    revokeRefreshTokens: async (uid) => { const u = authUsers.get(uid); if (!u) throw errCode('auth/user-not-found', 'no user'); u.tokensValidAfter = Math.floor(Date.now() / 1000) + 1 },
    updateUser: async (uid, patch) => { const u = authUsers.get(uid); if (!u) throw errCode('auth/user-not-found', 'no user'); Object.assign(u, patch) },
  }

  const appCheckApi = { verifyToken: async (token) => { if (token !== appCheckToken) throw new Error('invalid app check token'); return { appId: 'test' } } }

  const firestoreFn = () => db
  firestoreFn.FieldValue = FieldValue
  firestoreFn.Timestamp = Timestamp
  const admin = {
    apps: [{ name: '[DEFAULT]' }],
    initializeApp: () => {},
    credential: { cert: (x) => x },
    firestore: firestoreFn,
    auth: () => authApi,
    appCheck: () => appCheckApi,
  }

  const fake = {
    admin, db, authUsers, calls,
    // Put data in place (no rules, no checks), e.g. fake.seed({ 'users/u1': { xp: 1 } })
    seed: (docs) => { for (const [p, d] of Object.entries(docs)) applySet(p, d, false) },
    read: (path) => (store.has(path) ? clone(store.get(path).data) : undefined),
    exists: (path) => store.has(path),
    paths: (prefix = '') => [...store.keys()].filter((p) => p.startsWith(prefix)).sort(),
    count: (prefix) => [...store.keys()].filter((p) => p.startsWith(prefix)).length,
    addAuthUser: (uid, extra = {}) => { authUsers.set(uid, { uid, email: `${uid}@example.test`, emailVerified: true, disabled: false, ...extra }) },
    // A fake ID token. auth_time defaults to "just now"; pass authAgeSeconds to simulate a sign-in that is older.
    tokenFor: (uid, { authAgeSeconds = 5, email, emailVerified = true, expired = false } = {}) =>
      'fake.' + Buffer.from(JSON.stringify({ uid, email: email || `${uid}@example.test`, email_verified: emailVerified, auth_time: Math.floor(Date.now() / 1000) - authAgeSeconds, expired })).toString('base64url'),
    failNext: (match, error, { times = 1 } = {}) => { failures.push({ ...match, error: error instanceof Error ? error : new Error(String(error)), times }) },
    clearFailures: () => { failures.length = 0 },
    appCheckToken,
    // Make `require('firebase-admin')` return this fake. Call before loading the function under test.
    install() { provide('firebase-admin', admin) },
  }
  return fake
}

// ---- module interception ----------------------------------------------------------------------------------------------
// `require('firebase-admin')` is resolved to a made-up path that we pre-fill in require.cache, so the real package does not
// need to be installed (and can never be reached by accident).
const FAKE_IDS = { 'firebase-admin': '/__fake__/firebase-admin.js', stripe: '/__fake__/stripe.js', 'web-push': '/__fake__/web-push.js' }
let hooked = false
function provide(name, exportsObj) {
  if (!hooked) {
    hooked = true
    const original = Module._resolveFilename
    Module._resolveFilename = function (request, ...rest) { return FAKE_IDS[request] || original.call(this, request, ...rest) }
  }
  const id = FAKE_IDS[name]
  nodeRequire.cache[id] = { id, filename: id, loaded: true, exports: exportsObj, children: [], paths: [] }
}

// A fake `stripe` constructor: `require('stripe')(key)` returns `instance`.
export function installFakeStripe(instance) {
  provide('stripe', function Stripe() { return instance })
}
// A fake `web-push` module.
export function installFakeWebPush(instance) { provide('web-push', instance) }

// Load a CommonJS module from netlify/functions fresh (so a new fake admin / env is picked up), together with its lib/ helpers.
export function freshRequire(relFromRepoRoot) {
  const root = new URL('../../', import.meta.url).pathname
  const target = nodeRequire.resolve(root + relFromRepoRoot)
  for (const key of Object.keys(nodeRequire.cache)) {
    if (key.startsWith(root + 'netlify/functions/')) delete nodeRequire.cache[key]
  }
  return nodeRequire(target)
}

// Build a Netlify-style event.
export function makeEvent({ method = 'POST', body, token, headers = {}, raw = false, base64 = false } = {}) {
  const h = { 'content-type': 'application/json', ...headers }
  if (token) h.authorization = 'Bearer ' + token
  let payload = body
  if (body !== undefined && !raw) payload = JSON.stringify(body)
  if (payload !== undefined && base64) payload = Buffer.from(payload).toString('base64')
  return { httpMethod: method, headers: h, body: payload, isBase64Encoded: !!base64 }
}
export const parse = (res) => ({ status: res.statusCode, json: res.body ? JSON.parse(res.body) : null, headers: res.headers })
