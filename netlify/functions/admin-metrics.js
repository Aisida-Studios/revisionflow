// netlify/functions/admin-metrics.js
// Read-only admin analytics: revenue, growth, activation/funnel, engagement, churn risk.
//
// Deliberately a SEPARATE function from admin.js (own file, own route) rather than a new
// action bolted onto admin.js — that file may be under active work elsewhere, and this is a
// clean, additive, read-only surface with no reason to share a file with privileged writes.
// It duplicates admin.js's auth/response/audit-log helpers rather than importing them,
// matching this codebase's existing convention of self-contained Netlify functions (there's
// no shared lib module between netlify/functions/*.js currently).
//
// WHY THIS EXISTS: the admin panel's existing StatsTab computes stats client-side over
// listUsers' results, which are capped at 500 docs — past that, every stat silently
// undercounts with no indication anything was truncated. This function aggregates
// server-side, paginating through the ENTIRE users collection with no cap, so the numbers
// are actually correct regardless of how many users exist.
//
// SCALING NOTE: this still does a full collection scan on every call, field-masked with
// .select() to keep it cheap, which is fine at the pre-launch/beta scale this app is at
// today. It will NOT scale indefinitely — past a few thousand users (or once Netlify's
// function execution timeout becomes a real risk), replace this with a scheduled job that
// writes a precomputed `adminStats/daily` document instead of scanning live on every
// dashboard load. Flagging this now rather than silently building something that quietly
// breaks later.
//
// CommonJS — netlify/functions/package.json sets "type":"commonjs"

const ADMIN_EMAIL = 'femiaisida1@gmail.com'

// Pricing used only to ESTIMATE MRR from stored subscription status — this is a planning
// number, not an accounting one. Update these if RevisionFlow's prices change; there's no
// live Stripe price lookup here (see PRICING note below for why).
const MONTHLY_PRICE_GBP = 3.99
const ANNUAL_PRICE_GBP  = 29.99

let _admin = null
async function getAdmin() {
  if (_admin) return _admin
  const admin = require('firebase-admin')
  if (!admin.apps.length) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')
    admin.initializeApp({ credential: admin.credential.cert(sa) })
  }
  _admin = admin
  return admin
}

function respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Firebase-AppCheck',
    },
    body: JSON.stringify(body),
  }
}

async function verifyAdminToken(event) {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) throw new Error('No authorization token provided')
  const admin = await getAdmin()
  const decoded = await admin.auth().verifyIdToken(token)
  if (decoded.email !== ADMIN_EMAIL) throw new Error('Forbidden: not an admin account')
  return decoded
}

function logAdminAction(db, action, details = {}) {
  db.collection('adminAuditLog').add({
    action,
    actorEmail: ADMIN_EMAIL,
    details,
    timestamp: new Date().toISOString(),
  }).catch(e => console.warn('[admin-metrics] audit log write failed:', e.message))
}

// Local calendar-day string (UK), not UTC — a signup at 00:30 BST shouldn't land on
// yesterday's bucket. Firestore Admin SDK timestamps carry a real Date via .toDate().
function ukDayStr(date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

// Paginates through the ENTIRE users collection, field-masked to only what's aggregated
// below — no 500-doc cap, no silent undercounting. Returns the full doc-data array; fine at
// current scale (see SCALING NOTE above), not intended to stay this way forever.
async function fetchAllUserFields(db) {
  const FIELDS = [
    'createdAt', 'isPro', 'betaUser', 'stripePlan', 'stripeSubStatus',
    'stripePaymentFailed', 'stripeCurrentPeriodEnd', 'onboardingComplete',
    'xp', 'streak', 'lastLogin', 'qualification',
  ]
  const PAGE = 1000
  let all = []
  let last = null
  for (;;) {
    let q = db.collection('users').orderBy('__name__').select(...FIELDS).limit(PAGE)
    if (last) q = q.startAfter(last)
    const snap = await q.get()
    if (snap.empty) break
    all = all.concat(snap.docs.map(d => d.data()))
    last = snap.docs[snap.docs.length - 1]
    if (snap.docs.length < PAGE) break
  }
  return all
}

// AI feature usage is tracked per-user at users/{uid}/usage/{featureKey} by tutor.js's rate
// limiter (see checkRateLimit/checkFeatureLimit there) as { date: 'YYYY-MM-DD', count: N },
// reset per day. A collectionGroup query reads every user's usage docs in one pass rather
// than iterating each user's subcollection individually. This is CALL COUNTS only, not
// tokens or £ cost — Mistral bills by token, and a photo scan or essay-feedback call uses
// far more tokens than a quick chat message, so a cost figure derived from counts alone
// would be misleading rather than just imprecise. Real cost needs either Mistral's own
// usage dashboard or token-count logging added to tutor.js — neither exists yet.
const AI_FEATURE_LABELS = {
  aiCalls:       'AI Advisor / general chat (daily cap)',
  imageScans:    'Photo scans',
  advisorChats:  'AI Advisor messages',
  essayFeedback: 'Essay feedback requests',
}

async function fetchAiUsage(db) {
  const now = new Date()
  const days = []
  for (let i = 0; i < 7; i++) {
    days.push(new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now.getTime() - i * 86400000)))
  }
  try {
    // 'in' queries support up to 30 values — 7 is comfortably inside that.
    const snap = await db.collectionGroup('usage').where('date', 'in', days).get()
    const byFeature = {} // featureKey -> total calls across all users, last 7 days
    const byFeatureToday = {} // same, today only
    const today = days[0]
    let totalCallsWeek = 0
    let totalCallsToday = 0
    let activeUsersToday = new Set()
    for (const doc of snap.docs) {
      const featureKey = doc.id // doc id IS the featureKey (see tutor.js)
      const data = doc.data()
      const count = typeof data.count === 'number' ? data.count : 0
      byFeature[featureKey] = (byFeature[featureKey] || 0) + count
      totalCallsWeek += count
      if (data.date === today) {
        byFeatureToday[featureKey] = (byFeatureToday[featureKey] || 0) + count
        totalCallsToday += count
        const uid = doc.ref.parent.parent?.id
        if (uid) activeUsersToday.add(uid)
      }
    }
    return {
      available: true,
      totalCallsToday, totalCallsWeek,
      activeAiUsersToday: activeUsersToday.size,
      byFeatureToday: Object.entries(byFeatureToday).map(([key, count]) => ({ key, label: AI_FEATURE_LABELS[key] || key, count })).sort((a, b) => b.count - a.count),
      byFeatureWeek: Object.entries(byFeature).map(([key, count]) => ({ key, label: AI_FEATURE_LABELS[key] || key, count })).sort((a, b) => b.count - a.count),
    }
  } catch (e) {
    // Most likely cause: the collection-group query needs a composite index Firestore
    // hasn't been asked to build yet — the real error names the console URL to create it.
    // Fail soft rather than take the whole metrics endpoint down over this one section.
    console.warn('[admin-metrics] AI usage query failed:', e.message)
    return { available: false, error: e.message }
  }
}

async function fetchRecentAuditLog(db, limitN = 50) {
  try {
    const snap = await db.collection('adminAuditLog').orderBy('timestamp', 'desc').limit(limitN).get()
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.warn('[admin-metrics] audit log fetch failed:', e.message)
    return []
  }
}

function computeMetrics(users) {
  const now = new Date()
  const todayStr = ukDayStr(now)
  const daysAgoStr = n => ukDayStr(new Date(now.getTime() - n * 86400000))
  const since7  = daysAgoStr(7)
  const since30 = daysAgoStr(30)

  let totalUsers = 0
  let betaCount = 0
  let payingCount = 0
  let monthlyPayers = 0
  let annualPayers = 0
  let paymentFailedCount = 0
  let onboardedCount = 0
  let signups7 = 0
  let signups30 = 0
  let activeLast7 = 0 // by lastLogin, if present
  let totalXp = 0
  let usersWithStreak = 0
  const signupsByDay = {} // 'YYYY-MM-DD' -> count, last 30 days

  for (const u of users) {
    totalUsers++

    const createdAtDate = u.createdAt?.toDate ? u.createdAt.toDate() : null
    if (createdAtDate) {
      const day = ukDayStr(createdAtDate)
      if (day >= since30) signupsByDay[day] = (signupsByDay[day] || 0) + 1
      if (day >= since7) signups7++
      if (day >= since30) signups30++
    }

    const isBeta = !!u.betaUser
    // Matches ProGate.jsx's own isStripe definition exactly: isPro true AND not a beta grant —
    // i.e. an actual paying subscriber, not lifetime-free-Pro from the beta cohort.
    const isPaying = !!u.isPro && !isBeta
    if (isBeta) betaCount++
    if (isPaying) {
      payingCount++
      if (u.stripePlan === 'annual') annualPayers++
      else monthlyPayers++ // default bucket — stripePlan defaults to 'monthly' in the webhook too
    }
    if (u.stripePaymentFailed) paymentFailedCount++
    if (u.onboardingComplete) onboardedCount++

    const lastLoginDate = u.lastLogin?.toDate ? u.lastLogin.toDate() : (typeof u.lastLogin === 'string' ? new Date(u.lastLogin) : null)
    if (lastLoginDate && ukDayStr(lastLoginDate) >= since7) activeLast7++

    if (typeof u.xp === 'number') totalXp += u.xp
    if (typeof u.streak === 'number' && u.streak > 0) usersWithStreak++
  }

  const mrr = monthlyPayers * MONTHLY_PRICE_GBP + annualPayers * (ANNUAL_PRICE_GBP / 12)
  const arr = mrr * 12

  return {
    generatedAt: now.toISOString(),
    totals: {
      totalUsers, betaCount, payingCount,
      freeCount: totalUsers - betaCount - payingCount,
    },
    revenue: {
      // Estimated from stored subscription status, not a live Stripe query — see PRICING
      // note at the top of this file if prices change and this drifts from reality.
      mrrGbp: Math.round(mrr * 100) / 100,
      arrGbp: Math.round(arr * 100) / 100,
      monthlyPayers, annualPayers,
      paymentFailedCount,
      conversionRate: totalUsers ? Math.round((payingCount / totalUsers) * 1000) / 10 : 0,
    },
    growth: {
      signupsLast7: signups7,
      signupsLast30: signups30,
      signupsByDay, // sparse — only days with at least one signup
    },
    activation: {
      onboardingCompletionRate: totalUsers ? Math.round((onboardedCount / totalUsers) * 1000) / 10 : 0,
      onboardedCount,
      // best-effort — lastLogin isn't stamped everywhere yet (see note in the response), so
      // this likely undercounts rather than overcounts real activity
      activeLast7Estimate: activeLast7,
    },
    engagement: {
      avgXp: totalUsers ? Math.round(totalXp / totalUsers) : 0,
      usersWithActiveStreak: usersWithStreak,
    },
    notes: [
      'Revenue is estimated from stored subscription status (isPro/stripePlan), not a live Stripe query.',
      'activeLast7Estimate relies on profile.lastLogin, which may not be stamped on every login path — treat as a lower bound, not exact.',
      'AI usage below is call counts, not £ cost or tokens — Mistral bills by token, and different features use very different amounts of it. Check Mistral\'s own usage dashboard for actual spend.',
      'No signup-source/channel field exists yet, so growth cannot be broken down by marketing channel. Add capture at signup (e.g. a UTM param written into ensureUser\'s initialData) before running paid acquisition, or this will be unattributable in hindsight.',
    ],
  }
}

// Per-user drill-down for the admin user-detail view. Uses count() aggregation queries
// (firebase-admin v13 supports these) rather than fetching full subcollections — a handful
// of small counting queries per lookup, not a bulk document read, and only ever run for one
// user at a time when an admin actually opens their detail view, not in bulk like the
// collection-group AI-usage query above.
async function fetchUserDetail(db, uid) {
  const userSnap = await db.collection('users').doc(uid).get()
  if (!userSnap.exists) return null
  const u = userSnap.data()

  const countOf = async (sub, filterFn) => {
    let q = db.collection('users').doc(uid).collection(sub)
    if (filterFn) q = filterFn(q)
    const snap = await q.count().get()
    return snap.data().count
  }

  const [sessionsCount, paperAttemptsCount, quizResultsCount, mistakesCount, unresolvedMistakesCount, notesCount] = await Promise.all([
    countOf('sessions', q => q.where('completed', '==', true)),
    countOf('paperAttempts'),
    countOf('quizResults'),
    countOf('mistakes'),
    countOf('mistakes', q => q.where('resolved', '==', false)),
    countOf('notes'),
  ])

  return {
    profile: {
      name: u.displayName || null,
      email: u.email || null,
      createdAt: u.createdAt?.toDate ? u.createdAt.toDate().toISOString() : null,
      qualification: u.qualification || null,
      subjects: (u.subjects || []).map(s => ({ name: s.name, board: s.board || null })),
      xp: u.xp || 0,
      level: u.level || 1,
      streak: u.streak || 0,
      onboardingComplete: !!u.onboardingComplete,
      lastLogin: u.lastLogin?.toDate ? u.lastLogin.toDate().toISOString() : (typeof u.lastLogin === 'string' ? u.lastLogin : null),
    },
    subscription: {
      isPro: !!u.isPro,
      betaUser: !!u.betaUser,
      stripePlan: u.stripePlan || null,
      stripeSubStatus: u.stripeSubStatus || null,
      stripeCurrentPeriodEnd: u.stripeCurrentPeriodEnd || null,
      stripePaymentFailed: !!u.stripePaymentFailed,
      proActivatedAt: u.proActivatedAt || null,
    },
    activity: {
      sessionsCompleted: sessionsCount,
      paperAttempts: paperAttemptsCount,
      quizResults: quizResultsCount,
      mistakesLogged: mistakesCount,
      mistakesUnresolved: unresolvedMistakesCount,
      notesWritten: notesCount,
    },
  }
}

module.exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Firebase-AppCheck',
      },
      body: '',
    }
  }
  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' })

  try {
    await verifyAdminToken(event)
  } catch (e) {
    console.warn('[admin-metrics] auth failed:', e.message)
    return respond(403, { error: 'Forbidden' })
  }

  let body = {}
  try { body = JSON.parse(event.body || '{}') } catch (_) {}

  try {
    const admin = await getAdmin()
    const db = admin.firestore()

    // Per-user drill-down — a distinct, cheap, on-demand action, kept in this file rather
    // than a new one since it's the same admin-analytics concern as everything else here.
    if (body.action === 'userDetail') {
      if (!body.uid) return respond(400, { error: 'uid required' })
      const detail = await fetchUserDetail(db, body.uid)
      if (!detail) return respond(404, { error: 'User not found' })
      logAdminAction(db, 'viewUserDetail', { uid: body.uid })
      return respond(200, detail)
    }

    // Default (no action / existing behaviour, unchanged) — full metrics dashboard.
    const [users, aiUsage, auditLog] = await Promise.all([
      fetchAllUserFields(db),
      fetchAiUsage(db),
      fetchRecentAuditLog(db, 50),
    ])
    const metrics = computeMetrics(users)
    metrics.aiUsage = aiUsage
    metrics.auditLog = auditLog
    logAdminAction(db, 'viewMetrics', { totalUsers: metrics.totals.totalUsers })
    return respond(200, metrics)
  } catch (e) {
    console.error('[admin-metrics] error:', e)
    return respond(500, { error: 'Failed: ' + e.message })
  }
}
