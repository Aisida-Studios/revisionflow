// tests/rules/firestore.rules.test.mjs
//
// Firestore security-rules tests. They need the Firebase Firestore EMULATOR, so they cannot run in a plain `node` process:
//
//     npm run test:rules
//
// (that script wraps `firebase emulators:exec`, which starts the emulator, sets FIRESTORE_EMULATOR_HOST for this process
// and stops it again; it needs Java 11+ and network access to download the emulator the first time).
//
// Every test uses synthetic users (alice, bob, carol). Nothing here touches a real Firebase project.
import { describe, test, before, after, beforeEach } from 'node:test'
import fs from 'node:fs'
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import {
  doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection, query, where, serverTimestamp, Timestamp, arrayUnion,
} from 'firebase/firestore'

const RULES = fs.readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8')
let env

before(async () => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error('FIRESTORE_EMULATOR_HOST is not set. Run these tests with `npm run test:rules` (it starts the emulator).')
  }
  env = await initializeTestEnvironment({ projectId: 'demo-revisionflow-rules', firestore: { rules: RULES } })
})
after(async () => { if (env) await env.cleanup() })
beforeEach(async () => { await env.clearFirestore() })

const as = (uid) => env.authenticatedContext(uid).firestore()
const anon = () => env.unauthenticatedContext().firestore()
// Put documents in place without going through the rules (what the Admin SDK / a past write would have done).
const seed = (fn) => env.withSecurityRulesDisabled(async (ctx) => fn(ctx.firestore()))
const seedUser = (uid, data = {}) => seed((db) => setDoc(doc(db, 'users', uid), { xp: 100, streak: 3, bestStreak: 5, badges: ['first_session'], level: 2, displayName: uid, ...data }))

// What src/utils/firestore.js ensureUser writes for a new account.
const newAccount = (extra = {}) => ({
  createdAt: serverTimestamp(), xp: 0, streak: 0, lastLogin: null, badges: [], referralCode: 'ALICE123',
  displayName: 'Alice', avatarUrl: '', profile: { displayName: 'Alice', email: 'alice@example.test', avatarUrl: '' }, ...extra,
})
// What awardXP writes to the xpEvents ledger.
const xpEvent = (extra = {}) => ({ amount: 20, reason: 'Task done', day: '2026-11-13', createdAt: serverTimestamp(), ...extra })
const communitySet = (uid, extra = {}) => ({
  uid, title: 'Cell biology', subject: 'Biology', topic: 'Cells', cards: [{ q: 'q', a: 'a' }], isPublic: true, cardCount: 1,
  author: 'Alice', authorType: 'user', createdAt: serverTimestamp(), updatedAt: serverTimestamp(), board: 'AQA', level: 'GCSE', setId: 's1', ...extra,
})
const generatedCache = (extra = {}) => ({
  board: 'AQA', level: 'GCSE', subject: 'Biology', topic: 'Cells', count: 10, cards: [{ q: 'q', a: 'a' }], slug: 'aqa_gcse_biology_cells_10',
  generatedAt: serverTimestamp(), views: 1, ...extra,
})

describe('anonymous visitors', () => {
  test('cannot read or write anything', async () => {
    await seedUser('alice')
    await seed((db) => setDoc(doc(db, 'publicFlashcards/s1'), communitySet('alice', { createdAt: Timestamp.now(), updatedAt: Timestamp.now() })))
    const db = anon()
    await assertFails(getDoc(doc(db, 'users/alice')))
    await assertFails(setDoc(doc(db, 'users/alice'), newAccount()))
    await assertFails(getDoc(doc(db, 'publicFlashcards/s1')))
    await assertFails(getDoc(doc(db, 'flashcardCache/x')))
    await assertFails(getDoc(doc(db, 'topicOverrides/x')))
    await assertFails(setDoc(doc(db, 'friendRequests/x'), { from: 'alice', to: 'bob' }))
  })
})

describe('cross-user isolation', () => {
  const OWNED = ['topics', 'sessions', 'paperAttempts', 'paperStructures', 'quizResults', 'mistakes', 'tasks', 'notes',
    'flashcardSets', 'notifications', 'settings', 'meta', 'aiData', 'quests', 'priorities', 'dailyBriefing', 'setProgress', 'xpEvents', 'usage']

  test("bob cannot read, create, update or delete alice's root document", async () => {
    await seedUser('alice')
    const bob = as('bob')
    await assertFails(getDoc(doc(bob, 'users/alice')))
    await assertFails(setDoc(doc(bob, 'users/alice'), newAccount()))
    await assertFails(updateDoc(doc(bob, 'users/alice'), { displayName: 'Mallory' }))
    await assertFails(deleteDoc(doc(bob, 'users/alice')))
  })

  for (const sub of OWNED) {
    test(`bob cannot read or write alice's ${sub}`, async () => {
      await seed((db) => setDoc(doc(db, `users/alice/${sub}/d1`), { x: 1 }))
      const bob = as('bob')
      await assertFails(getDoc(doc(bob, `users/alice/${sub}/d1`)))
      await assertFails(getDocs(collection(bob, `users/alice/${sub}`)))
      await assertFails(setDoc(doc(bob, `users/alice/${sub}/d2`), { x: 2 }))
      await assertFails(deleteDoc(doc(bob, `users/alice/${sub}/d1`)))
    })
  }

  test('a subcollection the rules do not list is denied, even to its owner', async () => {
    await assertFails(setDoc(doc(as('alice'), 'users/alice/somethingNew/d1'), { x: 1 }))
    await assertFails(getDoc(doc(as('alice'), 'users/alice/somethingNew/d1')))
  })
})

describe('legitimate student workflows', () => {
  test('a new account can create its own document (ensureUser)', async () => {
    await assertSucceeds(setDoc(doc(as('alice'), 'users/alice'), newAccount()))
  })

  test('sign-up and theme writes that merge a few fields into a document that does not exist yet', async () => {
    await assertSucceeds(setDoc(doc(as('alice'), 'users/alice'), { displayName: 'Alice', profile: { displayName: 'Alice' } }, { merge: true }))
    await assertSucceeds(setDoc(doc(as('carol'), 'users/carol'), { theme: 'sage' }, { merge: true }))
  })

  test('the owner reads and edits profile, settings, subjects and exam dates', async () => {
    await seedUser('alice')
    const db = as('alice')
    await assertSucceeds(getDoc(doc(db, 'users/alice')))
    await assertSucceeds(updateDoc(doc(db, 'users/alice'), {
      displayName: 'Alice B', username: 'alice_b', qualification: 'GCSE', theme: 'sage', profileIcon: 'rocket',
      subjects: [{ name: 'Biology', board: 'AQA', qualification: 'GCSE', options: {} }],
      examDates: { Biology: '2027-06-10' }, settings: { profilePublic: true, friendsCanSeeGrades: false },
      notificationSettings: { email: false }, onboardingComplete: true, pushEnabled: true, tourComplete: true,
    }))
  })

  test('every student-owned subcollection can be read, written and deleted by its owner', async () => {
    await seedUser('alice')
    const db = as('alice')
    for (const sub of ['topics', 'sessions', 'paperAttempts', 'paperStructures', 'quizResults', 'mistakes', 'tasks', 'notes',
      'flashcardSets', 'notifications', 'settings', 'meta', 'aiData', 'quests', 'priorities', 'dailyBriefing', 'setProgress']) {
      await assertSucceeds(setDoc(doc(db, `users/alice/${sub}/d1`), { x: 1 }))
      await assertSucceeds(getDoc(doc(db, `users/alice/${sub}/d1`)))
      await assertSucceeds(updateDoc(doc(db, `users/alice/${sub}/d1`), { x: 2 }))
      await assertSucceeds(deleteDoc(doc(db, `users/alice/${sub}/d1`)))
    }
  })

  test('progress on a set the student does not own (what persistSetOutcomes writes) is saved, updated, read and cleared by them alone', async () => {
    const fields = () => ({ cardMastery: { 'What is a cell?': 2 }, cardSchedule: { 'What is a cell?': { interval: 1, due: '2026-11-25' } }, lastStudiedAt: serverTimestamp() })
    const mine = doc(as('alice'), 'users/alice/setProgress/official_aqa_gcse_biology_cells')
    await assertSucceeds(setDoc(mine, fields(), { merge: true }))          // the first session
    await assertSucceeds(setDoc(mine, fields(), { merge: true }))          // a later session merges into the same record
    await assertSucceeds(getDoc(mine))
    const theirs = doc(as('bob'), 'users/alice/setProgress/official_aqa_gcse_biology_cells')
    await assertFails(getDoc(theirs))                                       // another student cannot read it...
    await assertFails(setDoc(theirs, fields(), { merge: true }))            // ...or change it...
    await assertFails(deleteDoc(theirs))                                    // ...or remove it
    await assertFails(getDoc(doc(anon(), 'users/alice/setProgress/official_aqa_gcse_biology_cells')))
    await assertSucceeds(deleteDoc(mine))
  })

  test('an XP award (what awardXP writes) is accepted', async () => {
    await seedUser('alice')
    const db = as('alice')
    await assertSucceeds(updateDoc(doc(db, 'users/alice'), { xp: 120, level: 2, xpWeekStart: '2026-11-09', xpMonthStart: '2026-11-01', xpTz: 'Europe/London', xpThisWeek: 20, xpThisMonth: 20 }))
    await assertSucceeds(setDoc(doc(db, 'users/alice/xpEvents/session:abc'), xpEvent({ amount: 50, reason: 'Session complete' })))
  })

  test('the largest single award (a 2000 XP badge) is accepted', async () => {
    await seedUser('alice')
    await assertSucceeds(updateDoc(doc(as('alice'), 'users/alice'), { xp: 2100, badges: ['first_session', 'streak_100'] }))
  })

  test('a streak that continues, restarts or is frozen is accepted', async () => {
    await seedUser('alice')
    const db = as('alice')
    await assertSucceeds(updateDoc(doc(db, 'users/alice'), { lastActivityDate: 'Fri Nov 13 2026', streak: 4, bestStreak: 5 }))
    await assertSucceeds(updateDoc(doc(db, 'users/alice'), { streak: 5, bestStreak: 5, freezesUsedThisWeek: 1, freezeWeekStart: 'Fri Nov 13 2026' }))
    await assertSucceeds(updateDoc(doc(db, 'users/alice'), { streak: 6, bestStreak: 6 }))
    await assertSucceeds(updateDoc(doc(db, 'users/alice'), { streak: 1 }))
  })

  test('earning one badge is accepted', async () => {
    await seedUser('alice')
    await assertSucceeds(updateDoc(doc(as('alice'), 'users/alice'), { badges: ['first_session', 'streak_3'], xp: 150 }))
  })

  test('the first activity of a brand-new streak starts at one', async () => {
    await seedUser('alice', { streak: 0, bestStreak: 0 })
    await assertSucceeds(updateDoc(doc(as('alice'), 'users/alice'), { streak: 1, bestStreak: 1, lastActivityDate: 'Fri Nov 13 2026' }))
  })

  test('the client can still read usage counters but not write them', async () => {
    await seed((db) => setDoc(doc(db, 'users/alice/usage/entitlements'), { mathsSolver: { used: 1 } }))
    await assertSucceeds(getDoc(doc(as('alice'), 'users/alice/usage/entitlements')))
    await assertFails(getDoc(doc(as('bob'), 'users/alice/usage/entitlements')))
  })
})

describe('server-owned fields', () => {
  const FIELDS = {
    isPro: true, betaUser: true, isAdmin: true, admin: true, stripeCustomerId: 'cus_x', stripeSubId: 'sub_x',
    stripeSubStatus: 'active', stripePlan: 'annual', stripePaymentFailed: false, stripeCurrentPeriodEnd: 1893456000,
    proActivatedAt: Timestamp.now(), referredBy: 'bob', referredAt: Timestamp.now(), friends: ['bob'],
  }
  for (const [key, value] of Object.entries(FIELDS)) {
    test(`a student cannot set ${key} on an existing account`, async () => {
      await seedUser('alice')
      await assertFails(updateDoc(doc(as('alice'), 'users/alice'), { [key]: value }))
    })
    test(`a student cannot create an account that already has ${key}`, async () => {
      await assertFails(setDoc(doc(as('alice'), 'users/alice'), newAccount({ [key]: value })))
    })
    test(`a student cannot change ${key} once the server has set it`, async () => {
      await seedUser('alice', { [key]: key === 'friends' ? [] : 'seeded' })
      await assertFails(updateDoc(doc(as('alice'), 'users/alice'), { [key]: value }))
    })
  }

  test('a student cannot add themselves to friends with arrayUnion, or fake a Pro upgrade next to a legitimate edit', async () => {
    await seedUser('alice')
    await assertFails(updateDoc(doc(as('alice'), 'users/alice'), { friends: arrayUnion('bob') }))
    await assertFails(updateDoc(doc(as('alice'), 'users/alice'), { displayName: 'Alice', isPro: true }))
  })

  test('an account holding server-owned fields can still update its other fields', async () => {
    await seedUser('alice', { isPro: true, stripeCustomerId: 'cus_x', friends: ['bob'] })
    await assertSucceeds(updateDoc(doc(as('alice'), 'users/alice'), { theme: 'sage' }))
  })

  test('the client cannot write usage counters', async () => {
    await seedUser('alice')
    await assertFails(setDoc(doc(as('alice'), 'users/alice/usage/entitlements'), { mathsSolver: { used: 0 } }))
    await assertFails(setDoc(doc(as('alice'), 'users/alice/usage/ai-2026-11-13'), { count: 0 }))
  })

  test('the user document cannot be deleted from the client', async () => {
    await seedUser('alice')
    await assertFails(deleteDoc(doc(as('alice'), 'users/alice')))
  })
})

describe('gamification bounds', () => {
  test('XP cannot go down, jump past the largest award, or be set to a huge number', async () => {
    await seedUser('alice')
    const ref = doc(as('alice'), 'users/alice')
    await assertFails(updateDoc(ref, { xp: 50 }))
    await assertFails(updateDoc(ref, { xp: 100 + 2001 }))
    await assertFails(updateDoc(ref, { xp: 999999999 }))
    await assertFails(updateDoc(ref, { xp: '5000' }))
    await assertFails(updateDoc(ref, { xp: 150.5 }))
  })
  test('level, weekly and monthly XP are bounded', async () => {
    await seedUser('alice', { xpThisWeek: 10, xpThisMonth: 10 })
    const ref = doc(as('alice'), 'users/alice')
    await assertFails(updateDoc(ref, { level: 5000 }))
    await assertFails(updateDoc(ref, { level: -1 }))
    await assertFails(updateDoc(ref, { xpThisWeek: 100000 }))
    await assertFails(updateDoc(ref, { xpThisMonth: 100000 }))
    await assertFails(updateDoc(ref, { xpThisWeek: -5 }))
  })
  test('a streak cannot jump by more than one, and the best streak cannot exceed the real streak', async () => {
    await seedUser('alice')   // streak 3, best 5
    const ref = doc(as('alice'), 'users/alice')
    await assertFails(updateDoc(ref, { streak: 7 }))
    await assertFails(updateDoc(ref, { streak: 365, bestStreak: 365 }))
    await assertFails(updateDoc(ref, { bestStreak: 99 }))
    await assertFails(updateDoc(ref, { streak: -1 }))
  })
  test('badges are earned one at a time', async () => {
    await seedUser('alice')
    const ref = doc(as('alice'), 'users/alice')
    await assertFails(updateDoc(ref, { badges: ['first_session', 'streak_3', 'streak_7'] }))
    await assertFails(updateDoc(ref, { badges: 'all' }))
  })
  test('a new account cannot start with XP, a streak or badges', async () => {
    const db = as('alice')
    await assertFails(setDoc(doc(db, 'users/alice'), newAccount({ xp: 100 })))
    await assertFails(setDoc(doc(db, 'users/alice'), newAccount({ streak: 10 })))
    await assertFails(setDoc(doc(db, 'users/alice'), newAccount({ badges: ['streak_100'] })))
    await assertFails(setDoc(doc(db, 'users/alice'), newAccount({ level: 50 })))
    await assertFails(setDoc(doc(db, 'users/alice'), newAccount({ xpThisWeek: 500 })))
  })
})

describe('xpEvents ledger', () => {
  test('a valid event can be created once, by its owner', async () => {
    await seedUser('alice')
    await assertSucceeds(setDoc(doc(as('alice'), 'users/alice/xpEvents/e1'), xpEvent()))
    await assertFails(setDoc(doc(as('bob'), 'users/alice/xpEvents/e2'), xpEvent()))
  })
  test('events cannot be edited or removed', async () => {
    await seedUser('alice')
    await seed((db) => setDoc(doc(db, 'users/alice/xpEvents/e1'), { amount: 20, reason: 'Task done', day: '2026-11-13', createdAt: Timestamp.now() }))
    await assertFails(updateDoc(doc(as('alice'), 'users/alice/xpEvents/e1'), { amount: 2000 }))
    await assertFails(setDoc(doc(as('alice'), 'users/alice/xpEvents/e1'), xpEvent({ amount: 2000 })))
    await assertFails(deleteDoc(doc(as('alice'), 'users/alice/xpEvents/e1')))
    await assertSucceeds(getDoc(doc(as('alice'), 'users/alice/xpEvents/e1')))
  })
  test('malformed events are rejected', async () => {
    await seedUser('alice')
    const db = as('alice')
    for (const bad of [xpEvent({ amount: 0 }), xpEvent({ amount: 2001 }), xpEvent({ amount: 1.5 }), xpEvent({ amount: '20' }),
      xpEvent({ reason: 'x'.repeat(121) }), xpEvent({ day: 'today' }), xpEvent({ day: '2026-11-13T10:00:00Z' }),
      xpEvent({ createdAt: Timestamp.fromDate(new Date('2020-01-01')) }), xpEvent({ extra: 'field' }), { amount: 20, reason: 'x', day: '2026-11-13' }]) {
      await assertFails(setDoc(doc(db, 'users/alice/xpEvents/bad'), bad))
    }
  })
})

describe('server-only and content collections', () => {
  test('override collections are readable by signed-in students and never writable', async () => {
    for (const col of ['topicOverrides', 'examDateOverrides', 'paperSpecOverrides', 'boundaryOverrides']) {
      await seed((db) => setDoc(doc(db, `${col}/o1`), { x: 1 }))
      await assertSucceeds(getDoc(doc(as('alice'), `${col}/o1`)))
      await assertFails(setDoc(doc(as('alice'), `${col}/o2`), { x: 1 }))
      await assertFails(updateDoc(doc(as('alice'), `${col}/o1`), { x: 2 }))
      await assertFails(deleteDoc(doc(as('alice'), `${col}/o1`)))
    }
  })
  test('admin and bookkeeping collections are closed to every client', async () => {
    for (const col of ['adminDrafts', 'adminAuditLog', 'announcements', 'topicResourceLinks', 'rateLimits', 'stripeEvents', 'accountDeletions', 'friendPairs']) {
      await seed((db) => setDoc(doc(db, `${col}/d1`), { x: 1 }))
      await assertFails(getDoc(doc(as('alice'), `${col}/d1`)))
      await assertFails(setDoc(doc(as('alice'), `${col}/d2`), { x: 1 }))
      await assertFails(deleteDoc(doc(as('alice'), `${col}/d1`)))
    }
  })
  test('a collection the rules do not list is denied (default deny)', async () => {
    await assertFails(setDoc(doc(as('alice'), 'brandNewCollection/x'), { x: 1 }))
    await assertFails(getDoc(doc(as('alice'), 'brandNewCollection/x')))
  })
  test('topicNotes are readable and no longer writable', async () => {
    await seed((db) => setDoc(doc(db, 'topicNotes/n1'), { text: 'x' }))
    await assertSucceeds(getDoc(doc(as('alice'), 'topicNotes/n1')))
    await assertFails(setDoc(doc(as('alice'), 'topicNotes/n2'), { text: 'x' }))
    await assertFails(updateDoc(doc(as('alice'), 'topicNotes/n1'), { text: 'y' }))
  })
})

describe('community flashcards', () => {
  test('a student can publish, edit and withdraw their own community set', async () => {
    const db = as('alice')
    await assertSucceeds(setDoc(doc(db, 'publicFlashcards/s1'), communitySet('alice')))
    await assertSucceeds(setDoc(doc(db, 'publicFlashcards/s1'), communitySet('alice', { title: 'Cell biology v2' })))
    await assertSucceeds(deleteDoc(doc(db, 'publicFlashcards/s1')))
  })
  test('other students can read it but not change or delete it', async () => {
    await seed((db) => setDoc(doc(db, 'publicFlashcards/s1'), { ...communitySet('alice'), createdAt: Timestamp.now(), updatedAt: Timestamp.now() }))
    await assertSucceeds(getDoc(doc(as('bob'), 'publicFlashcards/s1')))
    await assertFails(setDoc(doc(as('bob'), 'publicFlashcards/s1'), communitySet('alice', { title: 'Hijacked' })))
    await assertFails(updateDoc(doc(as('bob'), 'publicFlashcards/s1'), { title: 'Hijacked' }))
    await assertFails(deleteDoc(doc(as('bob'), 'publicFlashcards/s1')))
  })
  test('impersonation is rejected: someone else\'s uid, "official" status, staff author types, reviewed or AI-generated flags', async () => {
    const db = as('alice')
    await assertFails(setDoc(doc(db, 'publicFlashcards/a'), communitySet('bob')))
    await assertFails(setDoc(doc(db, 'publicFlashcards/b'), communitySet('official')))
    await assertFails(setDoc(doc(db, 'publicFlashcards/c'), communitySet('alice', { authorType: 'official' })))
    await assertFails(setDoc(doc(db, 'publicFlashcards/d'), communitySet('alice', { authorType: 'staff' })))
    await assertFails(setDoc(doc(db, 'publicFlashcards/e'), communitySet('alice', { official: true })))
    await assertFails(setDoc(doc(db, 'publicFlashcards/f'), communitySet('alice', { verified: true })))
    await assertFails(setDoc(doc(db, 'publicFlashcards/g'), communitySet('alice', { aiGenerated: true })))
  })
  test('private study progress and unknown fields cannot ride along, and sizes are bounded', async () => {
    const db = as('alice')
    await assertFails(setDoc(doc(db, 'publicFlashcards/h'), communitySet('alice', { cardMastery: { 0: 'mastered' } })))
    await assertFails(setDoc(doc(db, 'publicFlashcards/i'), communitySet('alice', { cardSchedule: { 0: 1 } })))
    await assertFails(setDoc(doc(db, 'publicFlashcards/j'), communitySet('alice', { lastStudiedAt: serverTimestamp() })))
    await assertFails(setDoc(doc(db, 'publicFlashcards/k'), communitySet('alice', { cards: Array.from({ length: 501 }, () => ({ q: 'q', a: 'a' })) })))
    await assertFails(setDoc(doc(db, 'publicFlashcards/l'), communitySet('alice', { cards: 'not a list' })))
    await assertFails(setDoc(doc(db, 'publicFlashcards/m'), communitySet('alice', { title: 'x'.repeat(201) })))
    await assertFails(setDoc(doc(db, 'publicFlashcards/n'), communitySet('alice', { author: 'x'.repeat(101) })))
  })
})

describe('shared flashcard cache', () => {
  test('a signed-in student can store a generated set and quiz distractors once', async () => {
    const db = as('alice')
    await assertSucceeds(setDoc(doc(db, 'flashcardCache/aqa_gcse_biology_cells_10'), generatedCache()))
    await assertSucceeds(setDoc(doc(db, 'flashcardCache/distractors_abc123'), { cardCount: 5, distractors: [{ card: 0, wrong: ['a', 'b', 'c'] }], generatedAt: serverTimestamp() }))
    await assertSucceeds(setDoc(doc(db, 'flashcardCache/with_provenance'), generatedCache({ createdBy: 'alice' })))
  })
  test('quiz answer options are stored the way saveCachedDistractors writes them: { version: 2, byCard, generatedAt } under distractors2_<set id>', async () => {
    const db = as('alice')
    await assertSucceeds(setDoc(doc(db, 'flashcardCache/distractors2_s1'), {
      version: 2, byCard: { k1: ['a', 'b', 'c'], k2: ['d', 'e', 'f'] }, generatedAt: serverTimestamp(),
    }))
    // Nothing else may ride along, the shape stays bounded, and the entry still has to look unreviewed and fresh.
    await assertFails(setDoc(doc(db, 'flashcardCache/distractors2_s2'), { version: 2, byCard: {}, generatedAt: serverTimestamp(), extraField: 'x' }))
    await assertFails(setDoc(doc(db, 'flashcardCache/distractors2_s3'), { version: 2, byCard: { k: ['a'] }, generatedAt: Timestamp.fromDate(new Date('2020-01-01')) }))
    await assertFails(setDoc(doc(db, 'flashcardCache/distractors2_s4'), { version: 2, byCard: { k: ['a'] }, generatedAt: serverTimestamp(), verified: true }))
    await assertFails(setDoc(doc(db, 'flashcardCache/distractors2_s5'), { version: 2, byCard: { k: ['a'] }, generatedAt: serverTimestamp(), createdBy: 'bob' }))
    await assertFails(setDoc(doc(db, 'flashcardCache/distractors2_s6'), { version: 0, byCard: { k: ['a'] }, generatedAt: serverTimestamp() }))
    await assertFails(setDoc(doc(db, 'flashcardCache/distractors2_s7'), { version: '2', byCard: { k: ['a'] }, generatedAt: serverTimestamp() }))
    await assertFails(setDoc(doc(db, 'flashcardCache/distractors2_s8'), { version: 2, byCard: ['not', 'a', 'map'], generatedAt: serverTimestamp() }))
    const tooMany = Object.fromEntries(Array.from({ length: 1001 }, (_, i) => ['k' + i, ['a']]))
    await assertFails(setDoc(doc(db, 'flashcardCache/distractors2_s9'), { version: 2, byCard: tooMany, generatedAt: serverTimestamp() }))
    // The largest allowed map is accepted, so the limit is a limit and not a refusal of everything big.
    const most = Object.fromEntries(Array.from({ length: 1000 }, (_, i) => ['k' + i, ['a']]))
    await assertSucceeds(setDoc(doc(db, 'flashcardCache/distractors2_s10'), { version: 2, byCard: most, generatedAt: serverTimestamp() }))
  })
  test('everyone signed in can read it; anonymous visitors cannot', async () => {
    await seed((db) => setDoc(doc(db, 'flashcardCache/c1'), { ...generatedCache(), generatedAt: Timestamp.now() }))
    await assertSucceeds(getDoc(doc(as('bob'), 'flashcardCache/c1')))
    await assertFails(getDoc(doc(anon(), 'flashcardCache/c1')))
  })
  test('provenance cannot be forged, reviewed status cannot be claimed, and shapes are bounded', async () => {
    const db = as('alice')
    await assertFails(setDoc(doc(db, 'flashcardCache/a1'), generatedCache({ createdBy: 'bob' })))
    await assertFails(setDoc(doc(db, 'flashcardCache/a2'), generatedCache({ verified: true })))
    await assertFails(setDoc(doc(db, 'flashcardCache/a3'), generatedCache({ views: 9999 })))
    await assertFails(setDoc(doc(db, 'flashcardCache/a4'), generatedCache({ cards: Array.from({ length: 121 }, () => ({ q: 'q', a: 'a' })) })))
    await assertFails(setDoc(doc(db, 'flashcardCache/a5'), generatedCache({ extraField: 'x' })))
    await assertFails(setDoc(doc(db, 'flashcardCache/bad id!'), generatedCache()))
    await assertFails(setDoc(doc(db, 'flashcardCache/' + 'x'.repeat(221)), generatedCache()))
    await assertFails(setDoc(doc(db, 'flashcardCache/a6'), generatedCache({ generatedAt: Timestamp.fromDate(new Date('2020-01-01')) })))
    await assertFails(setDoc(doc(db, 'flashcardCache/a7'), generatedCache({ subject: 'x'.repeat(121) })))
  })
  test('an entry can only have its view count raised by one; nobody can rewrite or delete it', async () => {
    await seed((db) => setDoc(doc(db, 'flashcardCache/c1'), { ...generatedCache(), generatedAt: Timestamp.now() }))
    const ref = doc(as('bob'), 'flashcardCache/c1')
    await assertSucceeds(updateDoc(ref, { views: 2 }))
    await assertFails(updateDoc(ref, { views: 100 }))
    await assertFails(updateDoc(ref, { views: 1 }))
    await assertFails(updateDoc(ref, { cards: [{ q: 'poison', a: 'poison' }] }))
    await assertFails(updateDoc(ref, { views: 3, cards: [] }))
    await assertFails(setDoc(ref, generatedCache({ cards: [{ q: 'poison', a: 'poison' }] })))
    await assertFails(deleteDoc(ref))
  })
})

describe('friend requests', () => {
  const legacyRequest = (from, to, extra = {}) => ({ from, fromName: 'Alice', fromAvatarUrl: '', to, createdAt: serverTimestamp(), ...extra })

  test('a client can no longer create a friend request (the server does, via /api/friends)', async () => {
    await assertFails(setDoc(doc(as('alice'), 'friendRequests/r1'), legacyRequest('alice', 'bob')))
    await assertFails(setDoc(doc(as('alice'), 'friendRequests/alice_bob'), legacyRequest('alice', 'bob')))
  })
  test('spoofing is rejected: someone else as the sender, an invented name, an invented avatar', async () => {
    await assertFails(setDoc(doc(as('mallory'), 'friendRequests/r1'), legacyRequest('alice', 'bob')))
    await assertFails(setDoc(doc(as('mallory'), 'friendRequests/r2'), legacyRequest('mallory', 'bob', { fromName: 'RevisionFlow Support' })))
    await assertFails(setDoc(doc(as('mallory'), 'friendRequests/r3'), legacyRequest('mallory', 'bob', { fromAvatarUrl: 'https://tracker.example/pixel.gif' })))
  })
  test('only the two people involved can read a request; either can withdraw it; nobody can edit it', async () => {
    await seed((db) => setDoc(doc(db, 'friendRequests/r1'), { from: 'alice', fromName: 'Alice', fromAvatarUrl: '', to: 'bob', createdAt: Timestamp.now() }))
    await assertSucceeds(getDoc(doc(as('alice'), 'friendRequests/r1')))
    await assertSucceeds(getDoc(doc(as('bob'), 'friendRequests/r1')))
    await assertFails(getDoc(doc(as('carol'), 'friendRequests/r1')))
    await assertFails(updateDoc(doc(as('bob'), 'friendRequests/r1'), { fromName: 'x' }))
    await assertFails(deleteDoc(doc(as('carol'), 'friendRequests/r1')))
    await assertSucceeds(deleteDoc(doc(as('bob'), 'friendRequests/r1')))
  })
  test('the incoming-requests listener (where to == me) works, and a listing of other people\'s requests does not', async () => {
    await seed((db) => setDoc(doc(db, 'friendRequests/r1'), { from: 'alice', fromName: 'Alice', fromAvatarUrl: '', to: 'bob', createdAt: Timestamp.now() }))
    await assertSucceeds(getDocs(query(collection(as('bob'), 'friendRequests'), where('to', '==', 'bob'))))
    await assertFails(getDocs(query(collection(as('carol'), 'friendRequests'), where('to', '==', 'bob'))))
    await assertFails(getDocs(collection(as('carol'), 'friendRequests')))
  })
})

describe('malformed and oversized user data', () => {
  test('profile text is bounded and avatars must be https links', async () => {
    await seedUser('alice')
    const ref = doc(as('alice'), 'users/alice')
    await assertFails(updateDoc(ref, { displayName: 'x'.repeat(101) }))
    await assertFails(updateDoc(ref, { username: 'x'.repeat(51) }))
    await assertFails(updateDoc(ref, { displayName: { nested: 'object' } }))
    await assertFails(updateDoc(ref, { avatarUrl: 'http://example.test/a.png' }))
    await assertFails(updateDoc(ref, { avatarUrl: 'javascript:alert(1)' }))
    await assertFails(updateDoc(ref, { avatarUrl: 'https://example.test/' + 'a'.repeat(2100) }))
    await assertSucceeds(updateDoc(ref, { displayName: 'x'.repeat(100), username: 'x'.repeat(50), avatarUrl: 'https://lh3.googleusercontent.com/a/photo' }))
    await assertSucceeds(updateDoc(ref, { avatarUrl: '' }))
  })
  test('the referral code is a short string (the server, not the rules, decides whom a code belongs to)', async () => {
    await seedUser('alice')
    const ref = doc(as('alice'), 'users/alice')
    await assertFails(updateDoc(ref, { referralCode: 'X'.repeat(17) }))
    await assertFails(updateDoc(ref, { referralCode: { code: 'ALICE123' } }))
    await assertFails(updateDoc(ref, { referralCode: 12345678 }))
    await assertSucceeds(updateDoc(ref, { referralCode: 'ALICE123' }))
    await assertFails(setDoc(doc(as('bob'), 'users/bob'), newAccount({ referralCode: 'X'.repeat(17) })))
    await assertSucceeds(setDoc(doc(as('bob'), 'users/bob'), newAccount({ referralCode: 'BOB12345' })))
  })
  test('an older account whose stored values would fail today\'s checks can still update other fields', async () => {
    await seedUser('alice', { displayName: 'x'.repeat(300), avatarUrl: 'http://old.example/a.png', xp: 5000, level: 9999, badges: new Array(200).fill('b') })
    await assertSucceeds(updateDoc(doc(as('alice'), 'users/alice'), { theme: 'sage', onboardingComplete: true }))
  })
})
