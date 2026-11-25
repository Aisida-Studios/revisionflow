// tests/rules/rules-static.test.mjs
//
// OFFLINE checks on firestore.rules. They run in plain Node (`npm run test:rules:static`), with no emulator.
//
// What this is NOT: it does not evaluate the rules, so it proves nothing about who can read or write what. That is the job
// of tests/rules/firestore.rules.test.mjs, which needs the Firestore emulator. What this does prove is the consistency that
// is easy to break by accident and expensive to find in production:
//   * the file is structurally sound (balanced, correct header, catch-all deny last, every `allow` terminated),
//   * every collection the app or a server function uses has a rule (the project rule: no collection without a rule),
//   * every field a server function writes to a user document is on the server-owned list,
//   * the hardened file has not dropped any rule the owner's own policy had.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = new URL('../../', import.meta.url).pathname
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8')
if (!fs.existsSync(path.join(ROOT, 'firestore.rules'))) {
  throw new Error('firestore.rules is missing from the repository root. Save the complete rules text from the delivery message there, then run this again.')
}
const RULES = read('firestore.rules')

// What the owner's own policy (the rules text supplied on 23 November 2026) already declared, as plain lists, so the hardened
// file can be checked against it without keeping a second copy of the rules in the repository. If you add a collection to
// your policy and to firestore.rules, add it to the right list here.
const OWNER_SERVER_OWNED = ['isPro', 'betaUser', 'isAdmin', 'admin', 'stripeCustomerId', 'stripeSubId', 'stripeSubStatus', 'stripePlan',
  'stripePaymentFailed', 'referredBy', 'referredAt', 'friends']
const OWNER_TOP_LEVEL = ['users', 'topicOverrides', 'examDateOverrides', 'paperSpecOverrides', 'boundaryOverrides', 'adminDrafts',
  'adminAuditLog', 'publicFlashcards', 'topicNotes', 'flashcardCache', 'friendRequests']
const OWNER_UNDER_USERS = ['topics', 'sessions', 'paperAttempts', 'paperStructures', 'quizResults', 'mistakes', 'tasks', 'notes',
  'flashcardSets', 'notifications', 'settings', 'meta', 'aiData', 'quests', 'priorities', 'dailyBriefing', 'xpEvents', 'setProgress', 'usage']

// Remove // comments without touching a `//` inside a string such as 'https://.*'.
function stripComments(src) {
  let out = ''
  let inString = false
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (inString) { out += c; if (c === "'" && src[i - 1] !== '\\') inString = false; continue }
    if (c === "'") { inString = true; out += c; continue }
    if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; out += '\n'; continue }
    out += c
  }
  return out
}
const CODE = stripComments(RULES)

// Blank out string contents so brackets inside them (e.g. a regex) are not counted.
const withoutStrings = (src) => src.replace(/'(?:[^'\\]|\\.)*'/g, "''")

function walk(dir, exts, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, exts, out)
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p)
  }
  return out
}

// Collections declared by the rules: top-level `match /name/{id}` blocks, and the ones nested under users/{uid}.
function declaredCollections(code) {
  const text = withoutStrings(stripComments(code))
  const top = new Set()
  const nested = new Set()
  const stack = []
  const re = /match\s+\/([A-Za-z0-9_]+)\/\{[^}]*\}\s*\{|match\s+\/\{[^}]*\}\s*\{|\{|\}/g
  let m
  while ((m = re.exec(text))) {
    if (m[0] === '}') { stack.pop(); continue }
    if (m[0] === '{') { stack.push(null); continue }
    const name = m[1] || null
    // Depth: stack holds `service` (depth 0) and `/databases/{database}/documents` (depth 1) blocks first.
    if (name && stack.length === 2) top.add(name)
    if (name && stack.length === 3 && stack[2] === 'users') nested.add(name)
    stack.push(name)
  }
  return { top, nested }
}
const DECLARED = declaredCollections(RULES)

test('the parser sees the collections it should (guards the checks below against silently passing)', () => {
  assert.ok(DECLARED.top.has('users') && DECLARED.top.has('publicFlashcards') && DECLARED.top.has('friendRequests'), [...DECLARED.top].join(','))
  assert.ok(DECLARED.nested.has('sessions') && DECLARED.nested.has('xpEvents') && DECLARED.nested.has('usage'), [...DECLARED.nested].join(','))
  assert.ok(DECLARED.top.size >= 15, 'expected at least 15 top-level collections, saw ' + DECLARED.top.size)
  assert.ok(DECLARED.nested.size >= 15, 'expected at least 15 nested collections, saw ' + DECLARED.nested.size)
})

test('structure: header, balanced brackets, catch-all deny last, every allow terminated', () => {
  assert.match(CODE.trimStart(), /^rules_version\s*=\s*'2';/)
  assert.match(CODE, /service\s+cloud\.firestore\s*\{/)
  const flat = withoutStrings(CODE)
  for (const [open, close] of [['{', '}'], ['(', ')'], ['[', ']']]) {
    let depth = 0
    for (const ch of flat) {
      if (ch === open) depth++
      if (ch === close) depth--
      assert.ok(depth >= 0, `unbalanced ${close}`)
    }
    assert.equal(depth, 0, `unbalanced ${open}${close}`)
  }
  const catchAll = flat.lastIndexOf('match /{document=**}')
  assert.ok(catchAll > 0, 'missing catch-all match')
  assert.match(flat.slice(catchAll), /match \/\{document=\*\*\}\s*\{\s*allow read, write: if false;\s*\}/)
  assert.equal(flat.slice(catchAll).match(/match\s+\//g).length, 1, 'nothing may follow the catch-all')
  const allows = flat.match(/\ballow\b/g).length
  const terminated = flat.match(/\ballow\s+[a-z, ]+(?::\s*if\s+[^;{}]+)?;/g)
  assert.equal(terminated.length, allows, 'every allow statement must end with a semicolon')
  assert.ok(!/if\s+true\b/.test(flat), 'no rule may be unconditionally open')
})

test('every client-side collection has a rule', () => {
  const used = new Set()
  const usedNested = new Set()
  for (const file of walk(path.join(ROOT, 'src'), ['.js', '.jsx'])) {
    const src = fs.readFileSync(file, 'utf8')
    for (const m of src.matchAll(/(?:collection|doc)\(\s*db\s*,\s*'([A-Za-z]+)'/g)) used.add(m[1])
    for (const m of src.matchAll(/(?:collection|doc)\(\s*db\s*,\s*'users'\s*,\s*[^,()]+,\s*'([A-Za-z]+)'/g)) usedNested.add(m[1])
  }
  assert.ok(used.size >= 6 && usedNested.size >= 10, 'scan found too little: ' + [...used] + ' / ' + [...usedNested])
  for (const c of used) assert.ok(DECLARED.top.has(c), `src uses top-level collection "${c}" but firestore.rules has no match for it`)
  for (const c of usedNested) assert.ok(DECLARED.nested.has(c), `src uses users/{uid}/${c} but firestore.rules has no match for it`)
})

test('every collection a Netlify function uses has an explicit rule (even if it is deny-all)', () => {
  const used = new Set()
  for (const file of walk(path.join(ROOT, 'netlify/functions'), ['.js'])) {
    if (file.includes('node_modules')) continue
    const src = fs.readFileSync(file, 'utf8')
    for (const m of src.matchAll(/\.collection\('([A-Za-z]+)'\)/g)) used.add(m[1])
  }
  assert.ok(used.has('users') && used.has('announcements'), 'scan found too little: ' + [...used])
  const known = new Set([...DECLARED.top, ...DECLARED.nested])
  for (const c of used) assert.ok(known.has(c), `a Netlify function uses collection "${c}" but firestore.rules has no match for it`)
})

function serverOwnedKeys(code) {
  const m = stripComments(code).match(/function\s+serverOwnedKeys\(\)\s*\{\s*return\s*\[([^\]]*)\]/)
  assert.ok(m, 'serverOwnedKeys() not found')
  return new Set([...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]))
}

test('every field a server function writes to a user document is server-owned', () => {
  const owned = serverOwnedKeys(RULES)
  const REQUIRED = ['isPro', 'betaUser', 'isAdmin', 'admin', 'stripeCustomerId', 'stripeSubId', 'stripeSubStatus', 'stripePlan',
    'stripePaymentFailed', 'stripeCurrentPeriodEnd', 'proActivatedAt', 'referredBy', 'referredAt', 'friends']
  for (const k of REQUIRED) assert.ok(owned.has(k), `${k} must be server-owned`)
  // Anything the Stripe handler writes with an object-literal key.
  const stripeSrc = read('netlify/functions/stripe.js')
  const written = new Set([...stripeSrc.matchAll(/\b(stripe[A-Z][A-Za-z]*|proActivatedAt|isPro)\s*:/g)].map((m) => m[1]))
  assert.ok(written.size >= 5, 'stripe.js scan found too little: ' + [...written])
  for (const k of written) assert.ok(owned.has(k), `stripe.js writes "${k}" to the user document but it is not in serverOwnedKeys()`)
  // The referral and friends functions write referredBy / referredAt / friends.
  assert.match(read('netlify/functions/referral.js') + read('netlify/functions/friends.js'), /referredBy[\s\S]*friends|friends[\s\S]*referredBy/)
})

test('the owner\'s server-owned list is still fully covered', () => {
  const owned = serverOwnedKeys(RULES)
  for (const k of OWNER_SERVER_OWNED) assert.ok(owned.has(k), `${k} was server-owned in the owner's rules and must stay so`)
})

test('the hardened file keeps every collection the owner\'s policy had (including users/{uid}/setProgress)', () => {
  for (const c of OWNER_TOP_LEVEL) assert.ok(DECLARED.top.has(c), `top-level rule for "${c}" was dropped`)
  for (const c of OWNER_UNDER_USERS) assert.ok(DECLARED.nested.has(c), `users/{uid}/${c} rule was dropped`)
})

test('server-only collections are closed to clients', () => {
  const flat = withoutStrings(CODE)
  for (const c of ['adminDrafts', 'adminAuditLog', 'announcements', 'topicResourceLinks', 'rateLimits', 'stripeEvents', 'accountDeletions', 'friendPairs']) {
    assert.match(flat, new RegExp(`match\\s+/${c}/\\{id\\}\\s*\\{\\s*allow read, write: if false;\\s*\\}`), `${c} must be deny-all`)
  }
  assert.match(flat, /match \/usage\/\{id\}\s*\{\s*allow read: if isOwner\(uid\);\s*allow write: if false;\s*\}/)
})

test('client friend-request creation is closed and the user document cannot be deleted by the client', () => {
  const flat = withoutStrings(CODE)
  const fr = flat.slice(flat.indexOf('match /friendRequests/{id}'))
  assert.match(fr.slice(0, fr.indexOf('match /{document=**}')), /allow create: if false;/)
  const userBlock = flat.slice(flat.indexOf('match /users/{uid}'), flat.indexOf('match /topics/{id}'))
  assert.match(userBlock, /allow delete: if false;/, 'the user document must not be deletable by the client')
})

test('referral codes: the rules bound the stored code, and the server only honours a code the owner\'s uid produces', () => {
  // The rules cannot prove a code belongs to its uid, so they only bound the field on update and on create...
  assert.ok(CODE.includes("textOk(request.resource.data.referralCode, 16)"), 'referralCode must be length-bounded on update')
  assert.ok(CODE.includes("textOk(request.resource.data.get('referralCode', ''), 16)"), 'referralCode must be length-bounded on create')
  // ...so the function that pays rewards must derive ownership from the document id, not from the stored field.
  const fn = read('netlify/functions/referral.js')
  assert.match(fn, /codeOf\(d\.id\) === code/, 'referral.js must match the code against the owner\'s uid')
  assert.match(fn, /slice\(0, 8\)\.toUpperCase\(\)/)
  // and that derivation must be the same one the client uses to create the code
  assert.match(read('src/utils/referrals.js'), /uid\.slice\(0, 8\)\.toUpperCase\(\)/)
})
