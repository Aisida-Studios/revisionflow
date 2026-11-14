import assert from 'node:assert/strict'
import { toLocalDateStr, parseLocalDate, localWeekStartStr, localMonthStartStr, addLocalDays, diffLocalDays } from '../src/utils/localDate.js'
import { currentWeekStart as srvWeek, currentMonthStart as srvMonth, xpPeriodPatch as srvPatch, effectivePeriodXP as srvEffective, periodFields as srvPeriodFields } from '../netlify/functions/lib/periods.js'
import { flashcardSetSource, isOfficialSet, isCommunitySet } from '../src/utils/provenance.js'
import { getBoundaries, scaleBoundariesToPaper, calculateGradeFromBoundaries } from '../src/data/paperDatabase.js'
import { miniTimerState, formatClock } from '../src/utils/miniTimerState.js'
import { buildTimerTabTitle } from '../src/utils/timerTabTitle.js'
import { actualSessionPatch } from '../src/utils/sessionRecord.js'
import { ALL_TIME, academicYearStart, resolveAnalyticsStart, earliestRecordDay, recordDay, inAnalyticsWindow, currentOrUnstamped, analyticsRangeStart, analyticsRangeDays } from '../src/utils/analyticsWindow.js'
import { buildSubjectKey } from '../src/utils/subjectKey.js'
import { resolveTargetGrade, targetGradeLabel, targetGradeForPrompt } from '../src/utils/gradeTargets.js'
import { parseSetTitle, setBoardLevel } from '../src/utils/flashcardMeta.js'
import { mergeOutcomes, hasOutcomes } from '../src/utils/progressMerge.js'
import { dropOptionsWhenCourseChanges, isSameCourse, isSavedCourse } from '../src/utils/subjectEdits.js'
import { topicKey, dropHiddenTopics, dropHiddenFromPapers } from '../src/utils/topicVisibility.js'
import { FRESH_REFERRAL_MS, timestampMs, isFreshReferral } from '../src/utils/referralReward.js'
import { PRIORITY_WEIGHT, fairOrder, pickFairest, normaliseTopics, weakTopicFocus, createFairShare } from '../src/utils/fairShare.js'
import { generateSchedule, scheduleFreePeriods, buildSubjectsFromProfile, longPaperWarnings } from '../src/utils/scheduler.js'
import { createDayPlan, layoutPlan, separateNeighbours, fitSessionLength, fillPlan, topUp } from '../src/utils/dayFill.js'
import ent from '../netlify/functions/lib/entitlementLogic.js'
import { describeEntitlement, freeUsesLabel, entitlementMessage, isUpgradeCode, FREE_FEATURES, PRO_ONLY_FEATURES } from '../src/utils/entitlementsCore.js'
import { makeFakeFirestore } from './helpers/fakeFirestore.js'
import { parseSetTitle as srvParseSetTitle, officialSetMeta as srvOfficialSetMeta } from '../netlify/functions/lib/setMeta.js'
import { gradePaper, staleGradeFix, customBoundarySetFor } from '../src/utils/attemptGrade.js'
import { validateQuestionStructure } from '../netlify/functions/lib/structure.js'
import { groupsFromQuestions } from '../src/utils/paperQuestions.js'
import { buildQuestions, distributionTotal, validateDistribution, validateScores, lostMarks, questionsWithLostMarks, maxQuestionMarks } from '../src/utils/paperQuestions.js'
import { summariseMistakes } from '../src/utils/mistakeStats.js'
import { sessionMinutes, isMeasuredSession } from '../src/utils/sessionTime.js'
import { computeSubjectPredictions, gradeToPercent, percentToGrade, PREDICTION_WEIGHTS } from '../src/utils/gradeInsights.js'
import { computeTopicRecommendations, RECOMMENDATION_WEIGHTS } from '../src/utils/recommendations.js'

let n = 0
const ok = (name, fn) => { fn(); n++; console.log('ok -', name) }
// Tests that talk to the (fake) database are async. The file is bundled as ESM, so top-level await works.
const okAsync = async (name, fn) => { await fn(); n++; console.log('ok -', name) }
const IN_LONDON = Intl.DateTimeFormat().resolvedOptions().timeZone === 'Europe/London'
const okLondon = (name, fn) => IN_LONDON ? ok(name, fn) : console.log('skip - ' + name + ' (needs TZ=Europe/London)')

ok('parseLocalDate gives LOCAL midnight, not UTC', () => {
  const d = parseLocalDate('2026-07-01')
  assert.equal(d.getHours(), 0); assert.equal(d.getDate(), 1); assert.equal(d.getMonth(), 6)
  assert.equal(toLocalDateStr(d), '2026-07-01')
})
okLondon('old toISOString().slice would be WRONG at 00:30 BST (proves why the helper exists)', () => {
  const d = new Date(2026, 6, 1, 0, 30)             // 00:30 on 1 July, local (BST)
  assert.equal(d.toISOString().slice(0, 10), '2026-06-30')   // the bug
  assert.equal(toLocalDateStr(d), '2026-07-01')               // the fix
})
ok('week start is the local Monday', () => {
  assert.equal(localWeekStartStr(new Date(2026, 9, 13)), '2026-10-12')  // Tue 13 Oct -> Mon 12 Oct
  assert.equal(localWeekStartStr(new Date(2026, 9, 18)), '2026-10-12')  // Sun 18 Oct -> Mon 12 Oct
  assert.equal(localWeekStartStr(new Date(2026, 9, 19)), '2026-10-19')  // Mon 19 Oct
})
okLondon('week start at 00:30 BST Monday is that Monday (UTC would say Sunday)', () => {
  assert.equal(localWeekStartStr(new Date(2026, 5, 1, 0, 30)), '2026-06-01')
})
ok('month start local', () => {
  assert.equal(localMonthStartStr(new Date(2026, 9, 1, 0, 10)), '2026-10-01')
})
ok('addLocalDays / diffLocalDays are DST-safe (clocks go back 25 Oct 2026, forward 29 Mar 2026)', () => {
  assert.equal(toLocalDateStr(addLocalDays('2026-10-24', 2)), '2026-10-26')
  assert.equal(diffLocalDays('2026-10-24', '2026-10-26'), 2)
  assert.equal(diffLocalDays('2026-03-28', '2026-03-30'), 2)
  assert.equal(toLocalDateStr(addLocalDays('2026-03-28', 2)), '2026-03-30')
})
ok('parseLocalDate rejects junk', () => {
  assert.equal(parseLocalDate(''), null); assert.equal(parseLocalDate('abc'), null); assert.equal(parseLocalDate(null), null)
})

const today = toLocalDateStr(new Date())
const inDays = n => toLocalDateStr(addLocalDays(today, n))
const topic = (o) => ({ id: o.name, subjectId: 'Physics', name: o.name, confidence: 2, board: 'AQA', updatedAt: { seconds: Math.floor(Date.now() / 1000) }, ...o })

ok('unrated topics are never recommended', () => {
  const r = computeTopicRecommendations({ topics: [topic({ name: 'A', confidence: null }), topic({ name: 'B', confidence: 0 })] })
  assert.equal(r.length, 0)
})
ok('low confidence scores per explicit weight and explains itself', () => {
  const r = computeTopicRecommendations({ topics: [topic({ name: 'Waves', confidence: 1 })] })
  assert.equal(r.length, 1)
  assert.equal(r[0].score, 2 * RECOMMENDATION_WEIGHTS.lowConfidencePerStep)
  assert.ok(r[0].reasons.length >= 1 && r[0].reasons.length <= 3)
})
ok('reasons are capped at 3 even when four factors apply', () => {
  const old = { seconds: Math.floor(Date.now() / 1000) - 40 * 86400 }
  const r = computeTopicRecommendations({
    topics: [topic({ name: 'Forces', confidence: 1, updatedAt: old })],
    mistakes: [{ subject: 'Physics', topic: 'Forces', resolved: false }],
    examDates: [{ subject: 'Physics', examDate: inDays(5) }],
  })
  assert.equal(r[0].reasons.length, 3)
  assert.ok(r[0].factors.length >= 4)
  assert.equal(r[0].reasons[0].includes('confidence'), true) // strongest factor first (60 pts)
})
ok('exam within 30 days now explains its points too', () => {
  const r = computeTopicRecommendations({ topics: [topic({ name: 'Atoms', confidence: 2 })], examDates: [{ subject: 'Physics', examDate: inDays(20) }] })
  assert.ok(r[0].reasons.some(t => /exam in 20 days/.test(t)))
  assert.equal(r[0].score, RECOMMENDATION_WEIGHTS.lowConfidencePerStep + RECOMMENDATION_WEIGHTS.examWithin30Days)
})
ok('resolved mistakes do not count', () => {
  const r = computeTopicRecommendations({ topics: [topic({ name: 'Energy', confidence: 2 })], mistakes: [{ subject: 'Physics', topic: 'Energy', resolved: true }] })
  assert.ok(!r[0].factors.some(f => f.key === 'unresolved_mistakes'))
})
ok('mistakes from a different subject instance do not collide', () => {
  const r = computeTopicRecommendations({
    topics: [topic({ name: 'Energy', confidence: 2, subjectKey: 'AQA|GCSE|Physics|Higher' })],
    mistakes: [{ subject: 'Physics', topic: 'Energy', resolved: false, subjectKey: 'OCR|GCSE|Physics|Higher' }],
  })
  assert.ok(!r[0].factors.some(f => f.key === 'unresolved_mistakes'))
})
ok('a completed session on the topic resets staleness', () => {
  const old = { seconds: Math.floor(Date.now() / 1000) - 60 * 86400 }
  const recent = { seconds: Math.floor(Date.now() / 1000) - 2 * 86400 }
  const stale = computeTopicRecommendations({ topics: [topic({ name: 'Optics', confidence: 2, updatedAt: old })] })
  assert.ok(stale[0].factors.some(f => f.key === 'idle'))
  const fresh = computeTopicRecommendations({
    topics: [topic({ name: 'Optics', confidence: 2, updatedAt: old })],
    sessions: [{ subject: 'Physics', topic: 'Optics', completed: true, completedAt: recent, date: inDays(-2) }],
  })
  assert.ok(!fresh[0].factors.some(f => f.key === 'idle'))
})
ok('heavy planned workload lowers the score', () => {
  const plan = [0, 1, 2].map(i => ({ subject: 'Physics', date: inDays(i + 1), isTask: false }))
  const base = computeTopicRecommendations({ topics: [topic({ name: 'X', confidence: 1 })] })[0].score
  const heavy = computeTopicRecommendations({ topics: [topic({ name: 'X', confidence: 1 })], sessions: plan })[0].score
  assert.equal(heavy, base + RECOMMENDATION_WEIGHTS.heavyWorkloadPenalty)
})

// ───────────────────────── predicted grade model ─────────────────────────
const profile = (subjects, extra = {}) => ({ qualification: 'GCSE', subjects, ...extra })
const phys = (extra = {}) => ({ name: 'Physics', board: 'AQA', qualification: 'GCSE', ...extra })
const paper = (pct, daysAgo, extra = {}) => ({ subject: 'Physics', percentage: pct, attemptDate: inDays(-daysAgo), ...extra })
const quiz = (pct, secondsAgo = 0) => ({ subject: 'Physics', percentage: pct, createdAt: { seconds: Math.floor(Date.now() / 1000) - secondsAgo } })
const rated = (k, conf) => Array.from({ length: k }, (_, i) => ({ id: 'r' + i, subjectId: 'Physics', name: 'T' + i, confidence: conf }))
const unrated = (k) => Array.from({ length: k }, (_, i) => ({ id: 'u' + i, subjectId: 'Physics', name: 'U' + i, confidence: null }))
const predict = (topics, papers, quizzes, prof, opts) => computeSubjectPredictions(topics, papers, quizzes, prof, opts)

ok('no real results -> no prediction (confidence and a stated grade alone are not evidence)', () => {
  assert.deepEqual(predict(rated(5, 5), [], [], profile([phys({ currentGrade: '9' })])), [])
})
ok('a dropped subject is never predicted', () => {
  assert.deepEqual(predict([], [{ subject: 'Chemistry', percentage: 80, attemptDate: today }], [], profile([phys()])), [])
})
ok('single paper: result is that paper, evidence is limited, range is wide', () => {
  const [p] = predict([], [paper(65, 3)], [], profile([phys()]))
  assert.equal(p.percentage, 65); assert.equal(p.grade, '6')
  assert.equal(p.coverage, 'limited'); assert.equal(p.range.marginPct, PREDICTION_WEIGHTS.marginLimited)
  assert.equal(p.range.low, percentToGrade(53, 'GCSE')); assert.equal(p.range.high, percentToGrade(77, 'GCSE'))
  assert.equal(p.evidenceSummary, 'Based on 1 paper')
  assert.equal(p.label, 'Estimated grade'); assert.equal(p.estimated, true)
})
ok('hand-worked blend: papers 80,60 + quiz 50 + 4 topics at 4/5 + current grade 6  ->  67%', () => {
  const [p] = predict(rated(4, 4), [paper(80, 1), paper(60, 10)], [quiz(50)], profile([phys({ currentGrade: '6' })]))
  assert.equal(p.percentage, 67); assert.equal(p.grade, '6')
  const w = Object.fromEntries(p.factors.map(f => [f.key, f.weight]))
  assert.equal(w.papers, 0.47); assert.equal(w.quizzes, 0.23); assert.equal(w.topicMastery, 0.23); assert.equal(w.priorGrade, 0.07)
  assert.equal(Math.round(p.factors.reduce((s, f) => s + f.weight, 0) * 100), 100)
  assert.equal(p.evidenceSummary, 'Based on 2 papers, 1 quiz and 4 rated topics')
})
ok('newest paper counts for more than an older one', () => {
  const newestHigh = predict([], [paper(90, 1), paper(50, 20)], [], profile([phys()]))[0].percentage
  const newestLow  = predict([], [paper(50, 1), paper(90, 20)], [], profile([phys()]))[0].percentage
  assert.ok(newestHigh > newestLow)
})
ok('exam proximity steepens recency decay: 74 on exam day vs 72 with no date vs 71 when 200 days out', () => {
  const papers = [paper(90, 1), paper(50, 20)]
  const day0   = predict([], papers, [], profile([phys()]), { examDates: [{ subject: 'Physics', examDate: today }] })[0]
  const noDate = predict([], papers, [], profile([phys()]))[0]
  const far    = predict([], papers, [], profile([phys()]), { examDates: [{ subject: 'Physics', examDate: inDays(200) }] })[0]
  assert.equal(day0.percentage, 74); assert.equal(noDate.percentage, 72); assert.equal(far.percentage, 71)
  assert.equal(day0.daysToExam, 0)
  assert.ok(far.notes.some(t => /days away/.test(t)))
})
ok('unrated topics are ignored, and mastery counts for less until half the topics are rated', () => {
  const half = predict([...rated(4, 4), ...unrated(0)], [paper(60, 1)], [], profile([phys()]))[0]
  const few  = predict([...rated(4, 4), ...unrated(10)], [paper(60, 1)], [], profile([phys()]))[0]
  const mHalf = half.factors.find(f => f.key === 'topicMastery'), mFew = few.factors.find(f => f.key === 'topicMastery')
  assert.ok(mFew.weight < mHalf.weight)
  assert.match(mFew.detail, /4 of 14 topics rated/); assert.match(mFew.detail, /counts for less/)
  assert.equal(predict(unrated(8), [paper(60, 1)], [], profile([phys()]))[0].factors.some(f => f.key === 'topicMastery'), false)
})
ok('question-level factor needs 3+ extended-answer (>=4 mark) questions', () => {
  const qs = (n, max, got) => Array.from({ length: n }, (_, i) => ({ num: String(i + 1), marks: max, scored: got }))
  const few  = predict([], [paper(70, 1, { questionMarks: qs(2, 6, 3) })], [], profile([phys()]))[0]
  const many = predict([], [paper(70, 1, { questionMarks: [...qs(3, 6, 3), ...qs(5, 2, 2)] })], [], profile([phys()]))[0]
  assert.equal(few.factors.some(f => f.key === 'questions'), false)
  const q = many.factors.find(f => f.key === 'questions')
  assert.equal(q.valuePct, 50)                       // 9 of 18 on the three 6-markers; the 2-markers are excluded
  assert.equal(many.sources.extendedQuestions, 3)
  assert.ok(many.percentage < 70)                    // weak extended answers pull the estimate below the paper's own 70%
})
ok('starting grade is used when no current grade, and fades as results build up', () => {
  const lone = predict([], [paper(40, 1)], [], profile([phys()], { startingGrades: { Physics: '9' } }))[0]
  const lots = predict([], [1, 2, 3, 4, 5, 6].map(i => paper(40, i)), [], profile([phys()], { startingGrades: { Physics: '9' } }))[0]
  assert.equal(lone.factors.find(f => f.key === 'priorGrade').label, 'Your starting grade')
  assert.ok(lone.percentage > lots.percentage)       // the lofty prior drags a lone result up more than six results
  assert.equal(lots.factors.find(f => f.key === 'priorGrade').weight, 0.06) // 5 papers kept: floor 0.1*0.25 = 0.025 of (0.40 + 0.025) = 0.0588
})
ok('study consistency: +3 for 9+ study days, -3 for none, absent without sessions', () => {
  const done = d => ({ subject: 'Physics', completed: true, isTask: false, date: inDays(-d) })
  const base = predict([], [paper(60, 1)], [], profile([phys()]), { sessions: [] })[0]
  const busy = predict([], [paper(60, 1)], [], profile([phys()]), { sessions: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(done) })[0]
  const none = predict([], [paper(60, 1)], [], profile([phys()]))[0]
  assert.equal(base.adjustments[0].points, -3); assert.equal(busy.adjustments[0].points, 3)
  assert.equal(base.percentage, 57); assert.equal(busy.percentage, 63)
  assert.deepEqual(none.adjustments, []); assert.ok(none.notes.includes('Study consistency was not included.'))
  // two completed sessions on the SAME day are one study day; sessions outside the window don't count
  const same = predict([], [paper(60, 1)], [], profile([phys()]), { sessions: [done(0), done(0), done(20)] })[0]
  assert.match(same.adjustments[0].detail, /on 1 of the last 14 days/)
})
ok('A-Level / AS-Level use their own scales, and grade <-> percent round-trips by band', () => {
  assert.equal(gradeToPercent('A*', 'A-Level'), 95); assert.equal(gradeToPercent('A', 'AS-Level'), 90)
  assert.equal(gradeToPercent('9', 'GCSE'), 95); assert.equal(gradeToPercent('U', 'GCSE'), 5); assert.equal(gradeToPercent('Z', 'GCSE'), null)
  assert.equal(percentToGrade(85, 'AS-Level'), 'A'); assert.equal(percentToGrade(95, 'AS-Level'), 'A')   // AS has no A*
  assert.equal(percentToGrade(95, 'A-Level'), 'A*')
  const [p] = predict([], [{ subject: 'Physics', percentage: 92, attemptDate: today }], [], profile([phys({ qualification: 'A-Level' })], { qualification: 'A-Level' }))
  assert.equal(p.grade, 'A*')
})
ok('output stays backward compatible for existing consumers', () => {
  const [p] = predict(rated(2, 3), [paper(70, 1)], [quiz(60)], profile([phys()]))
  for (const k of ['subject', 'board', 'qualification', 'grade', 'percentage']) assert.ok(k in p, k)
  for (const k of ['papers', 'quizzes', 'topicsRated']) assert.equal(typeof p.sources[k], 'number', k)
})
ok('weakest subject sorts first', () => {
  const prof = profile([phys(), { name: 'Maths', board: 'AQA', qualification: 'GCSE' }])
  const out = predict([], [paper(80, 1), { subject: 'Maths', percentage: 40, attemptDate: today }], [], prof)
  assert.deepEqual(out.map(o => o.subject), ['Maths', 'Physics'])
})

// ───────────────────────── real study time ─────────────────────────
ok('sessionMinutes: measured time wins (even 0), then the plan, never an invented default', () => {
  assert.equal(sessionMinutes({ actualDuration: 37, duration: 60 }), 37)
  assert.equal(sessionMinutes({ actualDuration: 0, duration: 60 }), 0)       // timer ran ~0 minutes: that is the truth
  assert.equal(sessionMinutes({ duration: 60 }), 60)                         // ticked off by hand: the student's own plan
  assert.equal(sessionMinutes({ duration: '45' }), 45)
  assert.equal(sessionMinutes({}), 0)                                        // used to be silently counted as 45
  assert.equal(sessionMinutes({ duration: 'abc' }), 0)
  assert.equal(sessionMinutes(null), 0)
  assert.equal(isMeasuredSession({ actualDuration: 12 }), true)
  assert.equal(isMeasuredSession({ duration: 12 }), false)
})

// ───────────────── server XP periods must agree with the client's local ones ─────────────────
const fakeAdmin = { firestore: { FieldValue: { increment: (n) => ({ inc: n }) } } }
const at = (iso) => new Date(iso)

ok('server week/month keys use the USER\'s timezone (UTC would be a different week/month)', () => {
  const justAfterMidnightBST = at('2026-05-31T23:30:00Z')                  // Mon 1 Jun 00:30 in London
  assert.equal(srvWeek(justAfterMidnightBST, 'Europe/London'), '2026-06-01')
  assert.equal(srvWeek(justAfterMidnightBST, 'UTC'), '2026-05-25')           // the old server answer: a week behind
  assert.equal(srvMonth(at('2026-09-30T23:30:00Z'), 'Europe/London'), '2026-10-01')
  assert.equal(srvMonth(at('2026-09-30T23:30:00Z'), 'UTC'), '2026-09-01')
  assert.equal(srvWeek(at('2026-10-12T03:00:00Z'), 'America/New_York'), '2026-10-05') // still Sunday night in New York
  assert.equal(srvWeek(at('2026-10-12T03:00:00Z'), 'UTC'), '2026-10-12')
  assert.equal(srvWeek(at('2026-10-25T12:00:00Z'), 'Europe/London'), '2026-10-19')   // the day the clocks go back
})
ok('an unknown timezone name falls back to UTC instead of throwing', () => {
  assert.equal(srvWeek(at('2026-10-14T12:00:00Z'), 'Not/AZone'), srvWeek(at('2026-10-14T12:00:00Z'), 'UTC'))
  assert.equal(srvWeek(at('2026-10-14T12:00:00Z')), '2026-10-12')
})
ok('REGRESSION: a server-side award in the boundary hour adds to the week instead of wiping it', () => {
  const now = at('2026-05-31T23:30:00Z')   // Monday 00:30 in London, still Sunday in UTC
  const doc = { xpTz: 'Europe/London', xpWeekStart: '2026-06-01', xpMonthStart: '2026-06-01', xpThisWeek: 40, xpThisMonth: 90 }
  const patch = srvPatch(fakeAdmin, doc, 25, now)
  assert.deepEqual(patch.xpThisWeek, { inc: 25 })       // incremented, not reset to 25
  assert.deepEqual(patch.xpThisMonth, { inc: 25 })
  assert.equal(patch.xpWeekStart, '2026-06-01')
  assert.equal(srvEffective(doc, 'week', now), 40)      // leaderboard still shows the 40 already earned
})
ok('a genuinely new week resets the weekly counter but keeps the monthly one', () => {
  const doc = { xpTz: 'Europe/London', xpWeekStart: '2026-10-05', xpMonthStart: '2026-10-01', xpThisWeek: 40, xpThisMonth: 90 }
  const patch = srvPatch(fakeAdmin, doc, 25, at('2026-10-14T12:00:00Z'))
  assert.equal(patch.xpThisWeek, 25); assert.deepEqual(patch.xpThisMonth, { inc: 25 })
  assert.equal(srvEffective(doc, 'week', at('2026-10-14T12:00:00Z')), 0)       // stale week reads as 0
  assert.equal(srvEffective(doc, 'month', at('2026-10-14T12:00:00Z')), 90)
  assert.equal(srvEffective({ xp: 500 }, 'allTime'), 500)
})
ok('REGRESSION: every leaderboard row carries both period values, so the global This week and This month tabs are not all zero', () => {
  const now = at('2026-10-14T12:00:00Z')
  const active = { xp: 900, xpTz: 'Europe/London', xpWeekStart: '2026-10-12', xpMonthStart: '2026-10-01', xpThisWeek: 120, xpThisMonth: 340 }
  assert.deepEqual(srvPeriodFields(active, now), { xpThisWeek: 120, xpThisMonth: 340 })
  const lapsed = { xp: 900, xpTz: 'Europe/London', xpWeekStart: '2026-10-05', xpMonthStart: '2026-09-01', xpThisWeek: 120, xpThisMonth: 340 }
  assert.deepEqual(srvPeriodFields(lapsed, now), { xpThisWeek: 0, xpThisMonth: 0 })   // stale periods read as zero
  assert.deepEqual(srvPeriodFields({ xp: 5 }, now), { xpThisWeek: 0, xpThisMonth: 0 })
})
ok('a legacy doc with no xpTz is read as UTC, exactly as the old code wrote it', () => {
  const doc = { xpWeekStart: '2026-10-12', xpMonthStart: '2026-10-01', xpThisWeek: 10, xpThisMonth: 10 }
  assert.deepEqual(srvPatch(fakeAdmin, doc, 5, at('2026-10-14T12:00:00Z')).xpThisWeek, { inc: 5 })
})
ok('PROPERTY: server keys (in the process timezone) equal the client\'s local keys every 30 min for 400 days', () => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const start = Date.UTC(2026, 0, 1)
  let checked = 0
  for (let t = start; t < start + 400 * 86400000; t += 30 * 60000) {
    const d = new Date(t)
    assert.equal(srvWeek(d, tz), localWeekStartStr(d), 'week @ ' + d.toISOString() + ' in ' + tz)
    assert.equal(srvMonth(d, tz), localMonthStartStr(d), 'month @ ' + d.toISOString() + ' in ' + tz)
    checked++
  }
  assert.equal(checked, 400 * 48)
})

// ───────────────── paper question structure ─────────────────
ok('custom distribution: 20 marks as 5 questions of 4 marks', () => {
  const groups = [{ count: 5, marks: 4 }]
  assert.equal(distributionTotal(groups), 20)
  const v = validateDistribution(groups, { maxMarks: 20, qualification: 'A-Level', subject: 'Physics' })
  assert.deepEqual([v.ok, v.total, v.errors], [true, 20, []])
  const qs = buildQuestions(groups)
  assert.deepEqual(qs.map(q => q.num), [1, 2, 3, 4, 5]); assert.ok(qs.every(q => q.marks === 4 && q.scored === 0))
})
ok('mixed distribution numbers questions in order and must match the paper total', () => {
  const groups = [{ count: 4, marks: 1 }, { count: 2, marks: 6 }, { count: 1, marks: 4 }]
  assert.deepEqual(buildQuestions(groups).map(q => q.marks), [1, 1, 1, 1, 6, 6, 4])
  assert.equal(validateDistribution(groups, { maxMarks: 20, qualification: 'GCSE', subject: 'Chemistry' }).ok, true)
  const bad = validateDistribution(groups, { maxMarks: 24, qualification: 'GCSE', subject: 'Chemistry' })
  assert.equal(bad.ok, false); assert.match(bad.errors[0], /add up to 20 marks but the paper is worth 24/)
})
ok('no 8-mark questions in GCSE science, but 8-markers are fine elsewhere', () => {
  assert.equal(maxQuestionMarks('GCSE', 'Biology'), 6); assert.equal(maxQuestionMarks('GCSE', 'Combined Science'), 6)
  assert.equal(maxQuestionMarks('A-Level', 'Biology'), null); assert.equal(maxQuestionMarks('GCSE', 'English Literature'), null)
  const eight = [{ count: 1, marks: 8 }, { count: 2, marks: 6 }]
  const sci = validateDistribution(eight, { maxMarks: 20, qualification: 'GCSE', subject: 'Physics' })
  assert.equal(sci.ok, false); assert.match(sci.errors[0], /GCSE Physics question is worth at most 6/)
  assert.equal(validateDistribution(eight, { maxMarks: 20, qualification: 'GCSE', subject: 'English Literature' }).ok, true)
  assert.equal(validateDistribution(eight, { maxMarks: 20, qualification: 'A-Level', subject: 'Physics' }).ok, true)
})
ok('distribution input is validated: empty, zero, fractional and oversized', () => {
  const ctx = { maxMarks: 10, qualification: 'A-Level', subject: 'Maths' }
  assert.equal(validateDistribution([], ctx).ok, false)
  assert.equal(validateDistribution([{ count: 0, marks: 2 }], ctx).ok, false)
  assert.equal(validateDistribution([{ count: 2, marks: 2.5 }], ctx).ok, false)
  assert.equal(validateDistribution([{ count: 61, marks: 1 }], { ...ctx, maxMarks: 61 }).ok, false)
})
ok('per-question scores must be in range and add up to the logged score', () => {
  const qs = buildQuestions([{ count: 3, marks: 4 }]).map((q, i) => ({ ...q, scored: [4, 1, 3][i] }))
  assert.deepEqual(validateScores(qs, { score: 8 }), { ok: true, total: 8, errors: [] })
  assert.match(validateScores(qs, { score: 9 }).errors[0], /add up to 8 but you logged 9/)
  assert.equal(validateScores([{ num: 1, marks: 4, scored: 5 }], { score: 5 }).ok, false)   // above the question's marks
  assert.equal(validateScores([{ num: 1, marks: 4, scored: -1 }], {}).ok, false)
  assert.equal(validateScores([{ num: 1, marks: 4, scored: 2.5 }], {}).ok, false)
})
ok('lost marks per question, biggest loss first', () => {
  const qs = [{ num: 1, marks: 4, scored: 4 }, { num: 2, marks: 4, scored: 1 }, { num: 3, marks: 6, scored: 0 }, { num: 4, marks: 2, scored: 1 }]
  assert.equal(lostMarks(qs[1]), 3)
  assert.deepEqual(questionsWithLostMarks(qs).map(q => q.num), [3, 2, 4])
})

// ───────────────── mistake aggregates ─────────────────
ok('mistake summary: counts, open marks, categories and topics still costing marks', () => {
  const ms = [
    { subject: 'Physics', topic: 'Forces', category: 'Calculation', marksLost: 3, priority: 'high', resolved: false },
    { subject: 'Physics', topic: 'forces', category: 'Calculation', marksLost: 2, priority: 'medium', resolved: false },
    { subject: 'Physics', topic: 'Forces', category: 'Careless error', marksLost: 4, priority: 'low', resolved: true },
    { subject: 'Physics', topic: 'Waves', category: 'Knowledge gap', priority: 'high', resolved: false },
    { subject: 'Chemistry', topic: 'Forces', category: '', marksLost: 1, priority: 'low', resolved: false },
  ]
  const s = summariseMistakes(ms)
  assert.equal(s.total, 5); assert.equal(s.unresolved, 4); assert.equal(s.resolved, 1)
  assert.equal(s.openMarksLost, 6)                                    // 3 + 2 + 1; the resolved 4 is not "open"
  assert.deepEqual(s.byPriority, { high: 2, medium: 1, low: 1 })
  assert.deepEqual(s.byCategory.map(c => [c.category, c.count]), [['Calculation', 2], ['Careless error', 1], ['Knowledge gap', 1], ['Not categorised', 1]])
  const forces = s.byTopic.find(t => t.subject === 'Physics' && t.topic.toLowerCase() === 'forces')
  assert.deepEqual([forces.count, forces.openCount, forces.openMarksLost, forces.marksLost], [3, 2, 5, 9])  // case-insensitive topic merge
  assert.equal(s.byTopic[0].subject, 'Physics')                         // most open marks first
  assert.ok(!s.byTopic.some(t => t.openCount === 0))                    // fully-resolved topics drop out
  assert.equal(summariseMistakes([]).total, 0)
})

// ───────────────── content provenance ─────────────────
ok('only admin-approved sets are official; older unreviewed "official" sets are unverified', () => {
  assert.equal(flashcardSetSource({ uid: 'official', authorType: 'official', verified: true }), 'official')
  assert.equal(flashcardSetSource({ uid: 'official', authorType: 'official' }), 'unverified')   // published straight from AI before review existed
  assert.equal(flashcardSetSource({ uid: 'official', verified: false }), 'unverified')
  assert.equal(flashcardSetSource({ authorType: 'official' }), 'unverified')
  assert.equal(isOfficialSet({ uid: 'official', verified: true }), true)
  assert.equal(isOfficialSet({ uid: 'official' }), false)
})
ok('user sets are community, or student-created for their own author, and AI drafts say so', () => {
  assert.equal(flashcardSetSource({ uid: 'u1' }, 'u2'), 'community')
  assert.equal(flashcardSetSource({ uid: 'u1' }, 'u1'), 'student')
  assert.equal(flashcardSetSource({ uid: 'u1', origin: 'ai-generated-draft' }, 'u2'), 'ai-draft')
  assert.equal(isCommunitySet({ uid: 'u1' }, 'u2'), true); assert.equal(isCommunitySet({ uid: 'official', verified: true }, 'u2'), false)
  assert.equal(flashcardSetSource(null), 'unverified')
})

// ───────────────── official structures: server and client rules must agree ─────────────────
ok('server and client validators give the same answer on one table of cases', () => {
  const cases = [
    { groups: [{ count: 5, marks: 4 }], maxMarks: 20, level: 'A-Level', subject: 'Physics', ok: true },
    { groups: [{ count: 5, marks: 4 }], maxMarks: 24, level: 'A-Level', subject: 'Physics', ok: false },
    { groups: [{ count: 1, marks: 8 }, { count: 2, marks: 6 }], maxMarks: 20, level: 'GCSE', subject: 'Physics', ok: false },
    { groups: [{ count: 1, marks: 8 }, { count: 2, marks: 6 }], maxMarks: 20, level: 'A-Level', subject: 'Physics', ok: true },
    { groups: [{ count: 1, marks: 8 }, { count: 2, marks: 6 }], maxMarks: 20, level: 'GCSE', subject: 'English Literature', ok: true },
    { groups: [{ count: 4, marks: 1 }, { count: 2, marks: 6 }, { count: 1, marks: 4 }], maxMarks: 20, level: 'GCSE', subject: 'Chemistry', ok: true },
    { groups: [{ count: 3, marks: 6 }], maxMarks: 18, level: 'GCSE', subject: 'Combined Science', ok: true },
    { groups: [{ count: 70, marks: 1 }], maxMarks: 70, level: 'A-Level', subject: 'Maths', ok: false },
    { groups: [{ count: 2, marks: 0 }], maxMarks: 0, level: 'A-Level', subject: 'Maths', ok: false },
  ]
  for (const c of cases) {
    const client = validateDistribution(c.groups, { maxMarks: c.maxMarks, qualification: c.level, subject: c.subject }).ok
    const server = validateQuestionStructure(buildQuestions(c.groups).map(q => ({ num: q.num, marks: q.marks })), { maxMarks: c.maxMarks, level: c.level, subject: c.subject }).ok
    assert.equal(client, c.ok, 'client: ' + JSON.stringify(c.groups) + ' ' + c.level + ' ' + c.subject)
    assert.equal(server, c.ok, 'server: ' + JSON.stringify(c.groups) + ' ' + c.level + ' ' + c.subject)
  }
})
ok('server also refuses a structure the client builder could never produce', () => {
  const ctx = { maxMarks: 6, level: 'A-Level', subject: 'Maths' }
  assert.equal(validateQuestionStructure([{ num: 1, marks: 3 }, { num: 3, marks: 3 }], ctx).ok, false)   // numbering skips 2
  assert.equal(validateQuestionStructure([{ num: 1, marks: 2.5 }, { num: 2, marks: 3.5 }], ctx).ok, false)
  assert.equal(validateQuestionStructure([{ num: 1, marks: 3 }, { num: 2, marks: 3 }], { ...ctx, maxMarks: undefined }).ok, false)
  assert.equal(validateQuestionStructure([], ctx).ok, false); assert.equal(validateQuestionStructure(null, ctx).ok, false)
  assert.equal(validateQuestionStructure([{ num: 1, marks: 3 }, { num: 2, marks: 3 }], ctx).ok, true)
})
ok('a stored structure round-trips into editable groups, merging equal neighbours', () => {
  const groups = [{ count: 4, marks: 1 }, { count: 2, marks: 6 }, { count: 1, marks: 4 }]
  assert.deepEqual(groupsFromQuestions(buildQuestions(groups)), groups)
  assert.deepEqual(groupsFromQuestions(buildQuestions([{ count: 2, marks: 3 }, { count: 1, marks: 3 }])), [{ count: 3, marks: 3 }])
  assert.deepEqual(groupsFromQuestions([]), []); assert.deepEqual(groupsFromQuestions(null), [])
})

// ───────────────── past paper grades: percentage, not raw marks ─────────────────
ok('REGRESSION: 75/80 is graded by percentage, not as 75 out of the whole subject (240)', () => {
  const maths = getBoundaries('AQA', 'Mathematics', 'Higher', 2025, 'GCSE')
  assert.equal(maths.maxMarks, 240)                                             // the boundary set is for the whole subject
  assert.equal(calculateGradeFromBoundaries(75, maths), '4')                    // the old behaviour: 75 vs marks out of 240
  assert.equal(calculateGradeFromBoundaries(75, maths, 80), '9')                // by percentage: 93.75%
  assert.equal(gradePaper({ score: 75, maxMarks: 80, boundarySet: maths }).grade, '9')
  const alevel = getBoundaries('AQA', 'Physics', null, 2025, 'A-Level')
  assert.equal(calculateGradeFromBoundaries(75, alevel), 'D'); assert.equal(calculateGradeFromBoundaries(75, alevel, 80), 'A*')
})
ok('boundaries convert to the paper by percentage, rounded UP to whole marks', () => {
  const set = { maxMarks: 240, boundaries: [219, 190, 160, null, 0], grades: ['9', '8', '7', '6', '5'] }
  const sc = scaleBoundariesToPaper(set, 80)
  assert.deepEqual(sc.boundaries, [73, 64, 54, null, 0]); assert.equal(sc.maxMarks, 80); assert.equal(sc.scaledFrom, 240)
  assert.equal(calculateGradeFromBoundaries(73, set, 80), '9'); assert.equal(calculateGradeFromBoundaries(72, set, 80), '8')   // 72/80 = 90% < 219/240 = 91.25%
  assert.equal(scaleBoundariesToPaper(set, 240), set)                                                                         // same total: untouched
  assert.equal(scaleBoundariesToPaper(null, 80), null); assert.equal(scaleBoundariesToPaper(set, 0), set)
})
ok('a boundary set already out of the paper total is compared on raw marks (custom boundaries)', () => {
  const custom = { maxMarks: 80, boundaries: [70, 60, 50], grades: ['9', '8', '7'] }
  assert.equal(gradePaper({ score: 65, maxMarks: 80, boundarySet: custom, custom: true, year: 2025 }).grade, '8')
  const g = gradePaper({ score: 65, maxMarks: 80, boundarySet: custom, custom: true, year: 2025 }).gradeProvenance
  assert.deepEqual([g.source, g.verified, g.estimated], ['Student-entered boundaries', false, true])
})
ok('the saved provenance says when marks were converted, and flags the grade as an estimate', () => {
  const maths = getBoundaries('AQA', 'Mathematics', 'Higher', 2025, 'GCSE')
  const r = gradePaper({ score: 75, maxMarks: 80, boundarySet: maths, year: 2025 })
  assert.equal(r.gradeProvenance.scaledFrom, 240); assert.equal(r.gradeProvenance.estimated, true)
  assert.match(r.gradeProvenance.label, /Converted by percentage from the whole-subject total \(240\) to this paper \(80\)/)
  assert.deepEqual(gradePaper({ score: 'x', maxMarks: 80, boundarySet: maths }), { grade: null, gradeProvenance: null })
  assert.deepEqual(gradePaper({ score: 5, maxMarks: 0, boundarySet: maths }), { grade: null, gradeProvenance: null })
})
ok('saved grades produced by the old behaviour are corrected; anything else is left alone', () => {
  const maths = getBoundaries('AQA', 'Mathematics', 'Higher', 2025, 'GCSE')
  const base = { score: 75, maxMarks: 80, grade: '4' }
  assert.deepEqual(staleGradeFix(base, maths), { grade: '9' })                                        // the reported case
  assert.equal(staleGradeFix({ ...base, grade: '9' }, maths), null)                                  // already right
  assert.equal(staleGradeFix({ ...base, grade: '6' }, maths), null)                                  // matches neither: typed by hand / custom, don't touch
  assert.equal(staleGradeFix({ ...base, customBoundaries: [70, 60] }, maths), null)                  // custom boundaries
  assert.equal(staleGradeFix({ ...base, gradeProvenance: { source: 'Student-entered boundaries' } }, maths), null)
  assert.equal(staleGradeFix({ ...base, maxMarks: 240, score: 200 }, maths), null)                   // paper = whole subject: nothing to fix
  assert.equal(staleGradeFix(base, null), null); assert.equal(staleGradeFix(null, maths), null)
})
ok('stored custom boundaries can be rebuilt for a later edit', () => {
  assert.deepEqual(customBoundarySetFor({ customBoundaries: [70, 60], customBoundariesMax: 80, customGrades: ['9', '8'] }), { boundaries: [70, 60], maxMarks: 80, grades: ['9', '8'] })
  assert.equal(customBoundarySetFor({ score: 5 }), null); assert.equal(customBoundarySetFor(null), null)
})

// ───────────────── analytics window: counted from the day the student chooses ─────────────────
ok('the start day is the student\'s choice; the default is the start of the academic year; "all" means no limit', () => {
  const oct = new Date(2026, 9, 15, 14, 0)                                                            // 15 Oct 2026
  const spring = new Date(2027, 2, 10, 9, 0)                                                          // 10 Mar 2027: still the 2026-27 year
  assert.equal(academicYearStart(oct), '2026-09-01')
  assert.equal(academicYearStart(spring), '2026-09-01')
  assert.equal(academicYearStart(new Date(2027, 8, 1)), '2027-09-01')                                  // rolls over on 1 September
  assert.equal(resolveAnalyticsStart({}, oct), '2026-09-01')                                           // nothing chosen yet
  assert.equal(resolveAnalyticsStart(null, oct), '2026-09-01')
  assert.equal(resolveAnalyticsStart({ analyticsStart: '2026-10-01' }, oct), '2026-10-01')             // their own day
  assert.equal(resolveAnalyticsStart({ analyticsStart: '2025-01-05' }, oct), '2025-01-05')             // may go back as far as they like
  assert.equal(resolveAnalyticsStart({ analyticsStart: ALL_TIME }, oct), '')                           // everything recorded
  assert.equal(resolveAnalyticsStart({ analyticsStart: 'banana' }, oct), '2026-09-01')                 // unreadable: default
  assert.equal(resolveAnalyticsStart({ analyticsStart: '2026-13-45' }, oct), '2026-09-01')             // not a real day: default
  assert.equal(resolveAnalyticsStart({ analyticsStart: '' }, oct), '2026-09-01')                       // cleared: default
})
ok('records count from the start day for every record type, using the local calendar day', () => {
  assert.equal(inAnalyticsWindow({ date: '2026-08-31' }, '2026-09-01'), false)
  assert.equal(inAnalyticsWindow({ date: '2026-09-01' }, '2026-09-01'), true)
  assert.equal(inAnalyticsWindow({ attemptDate: '2026-09-02' }, '2026-09-01'), true)
  assert.equal(inAnalyticsWindow({ attemptDate: '2026-08-15' }, '2026-09-01'), false)
  assert.equal(inAnalyticsWindow({ attemptDate: '2026-08-15' }, ''), true)                             // all time: nothing is cut off
  assert.equal(recordDay({ date: '2026-09-05', attemptDate: '2026-01-01' }), '2026-09-05')            // the record's own date wins
  assert.equal(inAnalyticsWindow({}, ''), false); assert.equal(inAnalyticsWindow(null, ''), false)    // no usable date: not counted
  assert.deepEqual(['2026-08-30', '2026-09-02'].map(d => inAnalyticsWindow({ date: d }, '2026-09-01')), [false, true])
})
okLondon('timestamps are converted to the LOCAL day (00:30 BST on 1 Sep is still 1 Sep)', () => {
  const justAfterMidnightBST = Date.UTC(2026, 7, 31, 23, 30) / 1000                                    // 2026-08-31T23:30Z = 00:30 on 1 Sep in London
  assert.equal(recordDay({ createdAt: { seconds: justAfterMidnightBST } }), '2026-09-01')
  assert.equal(inAnalyticsWindow({ createdAt: { seconds: justAfterMidnightBST } }, '2026-09-01'), true)
  assert.equal(inAnalyticsWindow({ startTime: '2026-08-31T22:59:00Z' }, '2026-09-01'), false)         // 23:59 BST on 31 Aug
})
ok('timestamps, Dates and ISO strings all resolve to a day', () => {
  const noon = new Date(2026, 8, 10, 12, 0)
  assert.equal(recordDay({ createdAt: noon }), '2026-09-10')
  assert.equal(recordDay({ createdAt: { seconds: Math.floor(noon.getTime() / 1000) } }), '2026-09-10')
  assert.equal(recordDay({ completedAt: noon.toISOString() }), '2026-09-10')
  assert.equal(recordDay({ createdAt: 'not a date' }), null)
})
ok('ranges never reach back before the start day; 0 means the whole period; all time begins at the earliest record', () => {
  const now = new Date(2026, 9, 15, 14, 0)                                                            // 15 Oct 2026
  const opt = { start: '2026-09-01', now }
  assert.equal(toLocalDateStr(analyticsRangeStart(0, opt)), '2026-09-01')
  assert.equal(toLocalDateStr(analyticsRangeStart(7, opt)), '2026-10-08')
  assert.equal(toLocalDateStr(analyticsRangeStart(30, opt)), '2026-09-15')
  assert.equal(toLocalDateStr(analyticsRangeStart(90, opt)), '2026-09-01')                            // clamped: 90 days back would be July
  assert.equal(analyticsRangeStart(0, opt).getHours(), 0)                                            // local midnight
  assert.equal(analyticsRangeDays(analyticsRangeStart(0, opt), now), 45)                             // 1 Sep .. 15 Oct inclusive
  assert.equal(analyticsRangeDays(analyticsRangeStart(7, opt), now), 8)
  assert.equal(analyticsRangeDays(new Date(2030, 0, 1), now), 1)                                     // never below 1
  const earliest = earliestRecordDay([{ date: '2026-03-02' }, { attemptDate: '2025-11-20' }, {}, null])
  assert.equal(earliest, '2025-11-20')
  assert.equal(toLocalDateStr(analyticsRangeStart(0, { start: '', earliestDay: earliest, now })), '2025-11-20')   // all time
  assert.equal(toLocalDateStr(analyticsRangeStart(30, { start: '', earliestDay: earliest, now })), '2026-09-15')  // last 30 days still works
  assert.equal(toLocalDateStr(analyticsRangeStart(0, { start: '', earliestDay: null, now })), '2026-10-15')       // nothing recorded: today
  assert.equal(earliestRecordDay([]), null)
})
ok('current-course filter keeps unstamped records, drops other courses and hidden ones', () => {
  const profile = { qualification: 'GCSE', subjects: [{ name: 'Physics', board: 'AQA', qualification: 'GCSE', tier: 'Higher' }] }
  const mine = buildSubjectKey({ board: 'AQA', qualification: 'GCSE', subject: 'Physics', tier: 'Higher' })
  const other = buildSubjectKey({ board: 'OCR', qualification: 'A-Level', subject: 'Physics' })
  const recs = [
    { id: 'legacy', subject: 'Physics' },                                                            // never stamped: kept
    { id: 'mine', subject: 'Physics', subjectKey: mine },
    { id: 'other', subject: 'Physics', subjectKey: other },                                          // a different course: dropped
    { id: 'hidden', subject: 'Physics', subjectKey: mine, archived: true },                          // the student hid it: dropped
    { id: 'derived', subject: 'Physics', qualification: 'GCSE', board: 'AQA', tier: 'Higher' },       // no key but matches: kept
    { id: 'wrongqual', subject: 'Physics', qualification: 'A-Level', board: 'AQA' },
  ]
  assert.deepEqual(currentOrUnstamped(recs, profile).map(r => r.id), ['legacy', 'mine', 'derived'])
  assert.deepEqual(currentOrUnstamped(null, profile), [])
})

// ───────────────── pop-out timer ─────────────────
ok('clock formatting', () => {
  assert.equal(formatClock(0), '00:00'); assert.equal(formatClock(65), '01:05'); assert.equal(formatClock(1500), '25:00')
  assert.equal(formatClock(3600), '1:00:00'); assert.equal(formatClock(3725), '1:02:05')
  assert.equal(formatClock(-5), '00:00'); assert.equal(formatClock('x'), '00:00'); assert.equal(formatClock(59.9), '00:59')
})
ok('the pop-out shows only when a timer is actually in use', () => {
  const idle = { cdRunning: false, cdFinished: false, cdRemaining: 1500, cdTotal: 1500, swRunning: false, swElapsed: 0, alarmFired: false, linkedSessionId: null }
  assert.equal(miniTimerState(idle), null)                                              // untouched countdown: nothing to show
  assert.equal(miniTimerState(null), null)
  assert.deepEqual(miniTimerState({ ...idle, cdRunning: true, cdRemaining: 1490 }), { kind: 'countdown', running: true, seconds: 1490, label: 'Countdown' })
  assert.deepEqual(miniTimerState({ ...idle, cdRemaining: 900 }), { kind: 'countdown', running: false, seconds: 900, label: 'Countdown' })   // paused part-way
  assert.deepEqual(miniTimerState({ ...idle, swRunning: true, swElapsed: 42 }), { kind: 'stopwatch', running: true, seconds: 42, label: 'Stopwatch' })
  assert.equal(miniTimerState({ ...idle, swElapsed: 90 }).running, false)               // paused stopwatch with time on it still shows
})
ok('a linked session reads as a session timer; finished and alarm states are shown until dismissed', () => {
  const base = { cdRunning: true, cdFinished: false, cdRemaining: 600, cdTotal: 1500, swRunning: false, swElapsed: 0, alarmFired: false, linkedSessionId: 'abc' }
  assert.equal(miniTimerState(base).label, 'Session timer')
  assert.deepEqual(miniTimerState({ ...base, cdRunning: false, cdFinished: true, cdRemaining: 0 }), { kind: 'finished', running: false, seconds: 0, label: "Time's up" })
  assert.equal(miniTimerState({ ...base, alarmFired: true }).kind, 'alarm')              // an alarm outranks a running countdown
  assert.equal(miniTimerState({ ...base, cdRunning: true, swRunning: true, swElapsed: 5 }).kind, 'countdown')   // countdown wins over stopwatch
})

ok('REGRESSION: old official flashcard sets carry board and level only in their title; the filter reads them from there, never from the viewer', () => {
  const titles = [
    ['Edexcel GCSE Physics \u2014 Waves', { board: 'Edexcel', level: 'GCSE', subject: 'Physics', topic: 'Waves' }],
    ['WJEC A-Level Biology \u2014 Enzymes', { board: 'WJEC', level: 'A-Level', subject: 'Biology', topic: 'Enzymes' }],
    ['Eduqas GCSE English Literature', { board: 'WJEC', level: 'GCSE', subject: 'English Literature', topic: '' }],
    ['OCR AS-Level Chemistry \u2014 Rates', { board: 'OCR', level: 'AS-Level', subject: 'Chemistry', topic: 'Rates' }],
    ['Pearson Edexcel A Level Mathematics \u2014 Calculus', { board: 'Edexcel', level: 'A-Level', subject: 'Mathematics', topic: 'Calculus' }],
    ['CCEA GCSE Biology \u2014 Cells', { board: 'CCEA', level: 'GCSE', subject: 'Biology', topic: 'Cells' }],
    ['AQA GCSE History', { board: 'AQA', level: 'GCSE', subject: 'History', topic: '' }],
  ]
  for (const [title, want] of titles) {
    assert.deepEqual(parseSetTitle(title), want, title)
    assert.deepEqual(srvParseSetTitle(title), want, 'server twin: ' + title)      // browser and server agree
  }
  assert.equal(parseSetTitle('My OCR revision notes'), null)                       // not the generated format
  assert.equal(parseSetTitle('OCR Physics \u2014 Waves'), null)                     // no level: not guessed
  // Official set with no stamped fields: read from the title. Stamped aliases are canonicalised.
  assert.deepEqual(setBoardLevel({ uid: 'official', title: 'Edexcel GCSE Physics \u2014 Waves' }), { board: 'Edexcel', level: 'GCSE' })
  assert.deepEqual(setBoardLevel({ uid: 'official', board: 'Eduqas', level: 'GCSE', title: 'x' }), { board: 'WJEC', level: 'GCSE' })
  assert.deepEqual(setBoardLevel({ authorType: 'official', board: 'Pearson Edexcel', level: 'A Level' }), { board: 'Edexcel', level: 'A-Level' })
  // A community set is never guessed from its title, and nothing is guessed from the viewer's profile.
  assert.deepEqual(setBoardLevel({ uid: 'someStudent', title: 'Edexcel GCSE Physics \u2014 Waves' }), { board: '', level: '' })
  assert.deepEqual(setBoardLevel({ uid: 'someStudent', board: 'OCR', level: 'GCSE' }), { board: 'OCR', level: 'GCSE' })
  assert.deepEqual(srvOfficialSetMeta({ uid: 'official', title: 'WJEC A-Level Biology \u2014 Enzymes' }), { board: 'WJEC', level: 'A-Level' })
})
okLondon('a session finished from the timer records the REAL start and minutes; the plan is kept as planned*', () => {
  const planned = { date: '2026-10-20', start: '17:00', startTime: '2026-10-20T16:00:00.000Z', endTime: '2026-10-20T17:00:00.000Z', duration: 60 }
  const started = new Date(2026, 9, 21, 9, 5, 30).getTime()           // 21 Oct, 09:05 local: a day later than planned
  const ended = started + 23 * 60000
  const p = actualSessionPatch(planned, { actualMinutes: 23, startedAtMs: started, endedAtMs: ended })
  assert.equal(p.date, '2026-10-21'); assert.equal(p.start, '09:05'); assert.equal(p.duration, 23); assert.equal(p.actualDuration, 23)
  assert.equal(p.startTime, new Date(started).toISOString()); assert.equal(p.endTime, new Date(ended).toISOString())
  assert.equal(p.plannedDate, '2026-10-20'); assert.equal(p.plannedStart, '17:00'); assert.equal(p.plannedDuration, 60)   // the plan is kept
  const again = actualSessionPatch({ ...planned, ...p }, { actualMinutes: 30, startedAtMs: started, endedAtMs: ended })
  assert.equal(again.plannedDate, '2026-10-20'); assert.equal(again.plannedDuration, 60)                                 // the ORIGINAL plan survives a second write
  assert.deepEqual(actualSessionPatch(planned, {}), {})                                                                   // no measurement: the plan is untouched
  assert.deepEqual(actualSessionPatch(planned, { actualMinutes: 0, startedAtMs: started }), { actualDuration: 0 })         // the timer never ran: nothing about the plan changes
  assert.equal(actualSessionPatch(planned, { actualMinutes: 0.4, startedAtMs: started }).duration, undefined)             // under a minute: duration left alone
  for (const v of Object.values(p)) assert.notEqual(v, undefined)                                                          // Firestore rejects undefined
})
ok('course options are cleared when a subject\'s board or qualification changes, and kept otherwise', () => {
  const prev = [{ id: 'a', name: 'History', board: 'AQA', qualification: 'GCSE', options: { slot1: ['x'] } }, { id: 'b', name: 'Geography', board: 'OCR', qualification: 'GCSE', options: ['y'] }]
  const same = dropOptionsWhenCourseChanges(prev.map(s => ({ ...s })), prev)
  assert.deepEqual(same[0].options, { slot1: ['x'] }); assert.deepEqual(same[1].options, ['y'])           // nothing changed: kept
  const changed = dropOptionsWhenCourseChanges([{ ...prev[0], board: 'Edexcel' }, { ...prev[1], qualification: 'A-Level' }], prev)
  assert.equal('options' in changed[0], false); assert.equal('options' in changed[1], false)            // board / qualification changed: cleared
  assert.equal(changed[0].name, 'History')                                                              // everything else is kept
  assert.equal('options' in dropOptionsWhenCourseChanges([{ ...prev[0], board: 'aqa' }], prev)[0], true)                  // same board in another spelling: kept
  const added = dropOptionsWhenCourseChanges([{ id: 'new', name: 'Art', board: 'AQA', options: ['z'] }], prev)
  assert.deepEqual(added[0].options, ['z'])                                                             // a brand-new subject has nothing to compare against
  assert.deepEqual(dropOptionsWhenCourseChanges(null, null), [])
})
ok('saving progress folds per-card outcomes into mastery and the spaced-repetition schedule without touching other cards', () => {
  const before = { mastery: { A: 3, B: 1 }, schedule: { A: { box: 2, dueDate: '2026-10-20' }, B: { box: 1, dueDate: '2026-10-15' } } }
  const out = mergeOutcomes(before.mastery, before.schedule, { A: 3, C: 2, B: 1, D: 9 })
  assert.equal(out.mastery.A, 3); assert.equal(out.mastery.B, 1); assert.equal(out.mastery.C, 2)
  assert.equal(out.mastery.D, undefined)                               // an invalid outcome is ignored
  assert.equal(out.schedule.A.box, 3)                                   // got it: promoted a box
  assert.equal(out.schedule.B.box, 1)                                   // missed: back to box 1
  assert.equal(out.schedule.C.box, 1)                                   // partly, never scheduled: holds the first box
  assert.equal(before.schedule.A.box, 2)                                // the inputs are not mutated
  assert.deepEqual(mergeOutcomes(undefined, undefined, undefined), { mastery: {}, schedule: {} })
  assert.equal(hasOutcomes({}), false); assert.equal(hasOutcomes({ A: 3 }), true); assert.equal(hasOutcomes(null), false)
})
ok('REGRESSION: AS-Level subjects never show an impossible target of 9; an invalid stored target reads as Not set', () => {
  const as = { qualification: 'AS-Level' }
  assert.equal(resolveTargetGrade({ name: 'Mathematics', qualification: 'AS-Level', targetGrade: '9' }, as), null)
  assert.equal(targetGradeLabel({ name: 'Mathematics', qualification: 'AS-Level', targetGrade: '9' }, as), 'Not set')
  assert.equal(resolveTargetGrade({ name: 'Mathematics', qualification: 'AS-Level', targetGrade: 'B' }, as), 'B')
  assert.equal(resolveTargetGrade({ name: 'Mathematics', qualification: 'AS-Level', targetGrade: 'A*' }, as), null)   // no A* at AS-Level
  assert.equal(resolveTargetGrade({ name: 'Physics', qualification: 'A-Level', targetGrade: 'A*' }, as), 'A*')
  assert.equal(resolveTargetGrade({ name: 'Physics', qualification: 'A-Level', targetGrade: '9' }, as), null)
  assert.equal(resolveTargetGrade({ name: 'Mathematics', qualification: 'GCSE', tier: 'Higher', targetGrade: '9' }, { qualification: 'GCSE' }), '9')
  assert.equal(resolveTargetGrade({ name: 'Mathematics', qualification: 'GCSE', tier: 'Foundation', targetGrade: '9' }, { qualification: 'GCSE' }), null)   // Foundation tops out at 5
  assert.equal(resolveTargetGrade({ name: 'Mathematics', qualification: 'AS-Level' }, { ...as, targetGrades: { Mathematics: 'C' } }), 'C')   // per-subject map still honoured when valid
  assert.equal(targetGradeForPrompt({ name: 'Biology', qualification: 'AS-Level' }, null), 'not set')                  // never an invented number
})

// ── Browser tab title (Google-timer style countdown in the tab strip) ───────
ok('tab title shows a running countdown as mm:ss', () => {
  assert.equal(buildTimerTabTitle({ cdTotal: 1500, cdRemaining: 1499, cdRunning: true }), '24:59 · Countdown — RevisionFlow')
})
ok('tab title shows an hours-long countdown as h:mm:ss', () => {
  assert.equal(buildTimerTabTitle({ cdTotal: 5400, cdRemaining: 4865, cdRunning: true }), '1:21:05 · Countdown — RevisionFlow')
})
ok('tab title marks a paused countdown and keeps the time', () => {
  assert.equal(buildTimerTabTitle({ cdTotal: 1500, cdRemaining: 600, cdRunning: false, cdPaused: true }), '10:00 · Paused — RevisionFlow')
})
ok('tab title still shows a countdown paused before the first whole second ticked away', () => {
  assert.equal(buildTimerTabTitle({ cdTotal: 1500, cdRemaining: 1500, cdRunning: false, cdPaused: true }), '25:00 · Paused — RevisionFlow')
})
ok('tab title is untouched for a countdown still sitting at full length', () => {
  assert.equal(buildTimerTabTitle({ cdTotal: 1500, cdRemaining: 1500, cdRunning: false }), null)
})
ok('tab title shows the stopwatch while it runs and when paused', () => {
  assert.equal(buildTimerTabTitle({ swElapsed: 754, swRunning: true }), '12:34 · Stopwatch — RevisionFlow')
  assert.equal(buildTimerTabTitle({ swElapsed: 754, swRunning: false }), '12:34 · Stopwatch paused — RevisionFlow')
})
ok('tab title prioritises finished / alarm states over the clocks', () => {
  assert.equal(buildTimerTabTitle({ cdTotal: 1500, cdRemaining: 0, cdFinished: true, swElapsed: 30, swRunning: true }), "Time's up — RevisionFlow")
  assert.equal(buildTimerTabTitle({ alarmFired: true }), 'Alarm — RevisionFlow')
})
ok('tab title is empty when nothing is running', () => {
  assert.equal(buildTimerTabTitle(), null)
  assert.equal(buildTimerTabTitle({ cdTotal: 1500, cdRemaining: 1500 }), null)
})

// ── Course options: hiding topics the student did not choose ─────────────────
ok('topicKey compares names lower-case and trimmed, like courseOptions.js', () => {
  assert.equal(topicKey('  Further Pure 2 '), 'further pure 2')
  assert.equal(topicKey(null), ''); assert.equal(topicKey(undefined), '')
})
ok('dropHiddenTopics removes hidden names from a list of strings, ignoring case and spacing', () => {
  const hidden = new Set(['mechanics', 'further pure 2'])
  assert.deepEqual(dropHiddenTopics(['Mechanics', 'Statistics', 'FURTHER PURE 2', '  mechanics  ', 'Core Pure'], hidden), ['Statistics', 'Core Pure'])
})
ok('dropHiddenTopics works on topic objects and returns the same array when nothing is hidden', () => {
  const rows = [{ name: 'Mechanics' }, { name: 'Statistics' }, { name: null }, null]
  assert.deepEqual(dropHiddenTopics(rows, new Set(['mechanics'])), [{ name: 'Statistics' }, { name: null }, null])
  assert.equal(dropHiddenTopics(rows, new Set()), rows)
  assert.equal(dropHiddenTopics(rows, undefined), rows)
  assert.deepEqual(dropHiddenTopics(undefined, new Set(['x'])), [])
})
ok('dropHiddenFromPapers filters every paper without changing the input', () => {
  const papers = { 1: ['Algebra', 'Mechanics'], 2: ['Statistics', 'Mechanics'], 3: ['Calculus'] }
  assert.deepEqual(dropHiddenFromPapers(papers, new Set(['mechanics'])), { 1: ['Algebra'], 2: ['Statistics'], 3: ['Calculus'] })
  assert.deepEqual(papers[1], ['Algebra', 'Mechanics'])
  assert.equal(dropHiddenFromPapers(papers, new Set()), papers)
  assert.deepEqual(dropHiddenFromPapers(null, new Set(['x'])), {})
})
ok('isSavedCourse matches on subject, board and qualification (Eduqas and WJEC are one board)', () => {
  const profile = { qualification: 'A-Level' }
  const saved = [{ name: 'Further Mathematics', board: 'WJEC', qualification: 'A-Level' }, { name: 'Physics', board: 'AQA' }]
  assert.equal(isSavedCourse(saved, { name: 'Further Mathematics', board: 'Eduqas', qualification: 'A-Level' }, profile), true)
  assert.equal(isSavedCourse(saved, { name: 'Physics', board: 'AQA', qualification: 'A-Level' }, profile), true)    // saved entry stores no qualification: the profile's is used
  assert.equal(isSavedCourse(saved, { name: 'Physics', board: 'AQA', qualification: 'AS-Level' }, profile), false)  // AS-Level is a different course
  assert.equal(isSavedCourse(saved, { name: 'Physics', board: 'OCR', qualification: 'A-Level' }, profile), false)
  assert.equal(isSavedCourse(saved, { name: 'Chemistry', board: 'AQA', qualification: 'A-Level' }, profile), false)
  assert.equal(isSavedCourse(undefined, { name: 'Physics' }, profile), false)
  assert.equal(isSameCourse(null, { name: 'Physics' }, profile), false)
})

// ── Referred-side referral popup ─────────────────────────────────────────────
ok('timestampMs reads a Firestore Timestamp, { seconds }, a Date or a number, and 0 for anything else', () => {
  assert.equal(timestampMs({ toMillis: () => 1234 }), 1234)
  assert.equal(timestampMs({ seconds: 10, nanoseconds: 500000000 }), 10500)
  assert.equal(timestampMs(new Date(2026, 10, 3)), new Date(2026, 10, 3).getTime())
  assert.equal(timestampMs(99), 99)
  assert.equal(timestampMs(null), 0); assert.equal(timestampMs('soon'), 0); assert.equal(timestampMs({}), 0)
})
ok('isFreshReferral is true only for a referral stamped in the last few minutes that has not been shown', () => {
  const now = 1_800_000_000_000
  const stamp = (offsetMs) => ({ toMillis: () => now + offsetMs })
  assert.equal(isFreshReferral({ referredBy: 'abc', referredAt: stamp(-30_000) }, now), true)
  assert.equal(isFreshReferral({ referredBy: 'abc', referredAt: stamp(-FRESH_REFERRAL_MS + 1000) }, now), true)
  assert.equal(isFreshReferral({ referredBy: 'abc', referredAt: stamp(-FRESH_REFERRAL_MS - 1000) }, now), false)   // referred a while ago
  assert.equal(isFreshReferral({ referredBy: 'abc', referredAt: stamp(-3 * 24 * 3600 * 1000) }, now), false)      // referred days ago
  assert.equal(isFreshReferral({ referredBy: 'abc', referredAt: stamp(60_000) }, now), true)                       // device clock a minute behind
  assert.equal(isFreshReferral({ referredBy: 'abc', referredAt: stamp(3 * 24 * 3600 * 1000) }, now), false)        // clock days behind: not a new referral
  assert.equal(isFreshReferral({ referredBy: 'abc', referredAt: stamp(-1000), referredRewardShown: true }, now), false)
  assert.equal(isFreshReferral({ referredAt: stamp(-1000) }, now), false)                                          // not referred
  assert.equal(isFreshReferral({ referredBy: 'abc' }, now), false)                                                 // no timestamp yet
  assert.equal(isFreshReferral(null, now), false)
})

// ── Calendar generator: fair share (utils/fairShare.js) ──────────────────────
ok('fairOrder gives equal subjects equal turns instead of falling back to list order', () => {
  const keys = ['A', 'B', 'C', 'D', 'E', 'F']
  const used = {}, last = {}; let seq = 0
  for (let day = 0; day < 30; day++) fairOrder(keys, used, {}, last).slice(0, 2).forEach(k => { used[k] = (used[k] || 0) + 45; last[k] = ++seq })
  keys.forEach(k => assert.equal(used[k], 450))          // 60 turns across 6 keys: 10 each, the first keys in the list are not favoured
})
ok('fairOrder gives a weight-2 key about twice the turns', () => {
  const keys = ['A', 'B', 'C', 'D'], weight = { A: PRIORITY_WEIGHT }
  const used = {}, last = {}; let seq = 0
  for (let i = 0; i < 40; i++) { const k = pickFairest(keys, used, weight, last); used[k] = (used[k] || 0) + 45; last[k] = ++seq }
  assert.deepEqual(used, { A: 16 * 45, B: 8 * 45, C: 8 * 45, D: 8 * 45 })
})
ok('fairOrder treats a missing, zero, negative or non-numeric weight as 1', () => {
  const keys = ['A', 'B', 'C', 'D']
  const used = {}, last = {}; let seq = 0
  const weight = { A: 0, B: -3, C: NaN, D: 'big' }
  for (let i = 0; i < 40; i++) { const k = pickFairest(keys, used, weight, last); used[k] = (used[k] || 0) + 1; last[k] = ++seq }
  keys.forEach(k => assert.equal(used[k], 10))
  assert.equal(pickFairest([]), undefined)
})
ok('normaliseTopics accepts a name, names or { name, weight }, drops empties and duplicates, and fixes bad weights', () => {
  assert.deepEqual(normaliseTopics('Waves'), [{ name: 'Waves', weight: 1 }])
  assert.deepEqual(normaliseTopics(['Waves', { name: 'Forces', weight: 2 }, '', null, 'Waves', { name: 'Light', weight: -1 }]),
    [{ name: 'Waves', weight: 1 }, { name: 'Forces', weight: 2 }, { name: 'Light', weight: 1 }])
  assert.deepEqual(normaliseTopics(undefined), []); assert.deepEqual(normaliseTopics(42), [])
})
ok('weakTopicFocus keeps only rated-weak topics on that paper, weakest weighted most, equal confidence equal weight', () => {
  const rows = [
    { subjectId: 'Physics', name: 'Waves',  confidence: 1 }, { subjectId: 'Physics', name: 'Forces', confidence: 2 },
    { subjectId: 'Physics', name: 'Atoms',  confidence: 2 }, { subjectId: 'Physics', name: 'Energy', confidence: 3 },     // not weak
    { subjectId: 'Physics', name: 'Space',  confidence: 0 },                                                             // unrated is never weak
    { subjectId: 'Physics', name: 'Magnets', confidence: 1 },                                                            // weak but on another paper
    { subjectId: 'Biology', name: 'Cells',  confidence: 1 },                                                             // another subject
  ]
  assert.deepEqual(weakTopicFocus(rows, 'Physics', ['Waves', 'Forces', 'Atoms', 'Energy', 'Space']),
    [{ name: 'Waves', weight: 2 }, { name: 'Atoms', weight: 1 }, { name: 'Forces', weight: 1 }])
  assert.deepEqual(weakTopicFocus(rows, 'Chemistry', ['Waves']), []); assert.deepEqual(weakTopicFocus(null, 'Physics', null), [])
})
ok('createFairShare rotates a paper through its topics, with equal weights giving equal minutes', () => {
  const share = createFairShare({ subjects: [{ name: 'Physics' }], topicFocus: { 'Physics-1': ['Waves', 'Forces', 'Atoms', 'Light'] } })
  const first = share.topicFor('Physics', 1)
  assert.equal(share.topicFor('Physics', 1), first)                                  // choosing records nothing
  const got = {}
  for (let i = 0; i < 40; i++) { const t = share.topicFor('Physics', 1); got[t] = (got[t] || 0) + 1; share.record({ subject: 'Physics', paper: 1, type: 'Content Revision', focusTopic: t, duration: 45 }) }
  assert.deepEqual(got, { Waves: 10, Forces: 10, Atoms: 10, Light: 10 })
  assert.equal(share.topicFor('Physics', 2), null)                                   // a paper with no focus topics
})
ok('createFairShare weights topics and still accepts the old single-name focus', () => {
  const share = createFairShare({ topicFocus: { 'P-1': [{ name: 'Big', weight: 2 }, { name: 'Small', weight: 1 }], 'P-2': 'Only' } })
  const got = {}
  for (let i = 0; i < 30; i++) { const t = share.topicFor('P', 1); got[t] = (got[t] || 0) + 1; share.record({ subject: 'P', paper: 1, type: 'Content Revision', focusTopic: t, duration: 30 }) }
  assert.deepEqual(got, { Big: 20, Small: 10 })
  assert.equal(share.topicFor('P', 2), 'Only')
})
ok('createFairShare carries on from sessions an earlier pass already placed', () => {
  const earlier = [{ subject: 'A', paper: 1, duration: 90, type: 'Content Revision' }, { subject: 'B', paper: 1, duration: 45, type: 'Content Revision' }]
  const share = createFairShare({ subjects: [{ name: 'A' }, { name: 'B' }, { name: 'C' }], existingSessions: earlier })
  assert.equal(share.usedMinutes('A'), 90)
  assert.deepEqual(share.order([{ name: 'A' }, { name: 'B' }, { name: 'C' }]).map(s => s.name), ['C', 'B', 'A'])
})

// ── Calendar generator: planning a day (utils/dayFill.js) ────────────────────
ok('createDayPlan packs best fit with the break between sessions counted', () => {
  const plan = createDayPlan([{ start: 600, end: 660 }, { start: 1020, end: 1260 }], 30)    // a 1 hour window and a 4 hour window
  assert.equal(plan.fit(45), 0)                      // the small window: the big one stays free for a long session
  assert.equal(plan.fit(105), 1)
  assert.equal(plan.fit(300), -1)
  plan.add(0, { id: 'a' }, 45)
  assert.equal(plan.fit(45), 1)                      // 45 + 30 + 45 no longer fits one hour
  assert.equal(plan.spare(0), 0)
  plan.add(1, { id: 'b' }, 105)
  assert.equal(plan.spare(1), 240 - (105 + 30))
  assert.equal(plan.count(), 2)
})
ok('layoutPlan starts at the window start and spreads spare time as extra break, up to the maximum', () => {
  const plan = createDayPlan([{ start: 1020, end: 1260 }], 30)                              // 17:00 to 21:00
  plan.add(0, { n: 1 }, 45); plan.add(0, { n: 2 }, 45)
  layoutPlan(plan, { maxExtraGap: 60 })
  const [a, b] = plan.windows[0].items
  assert.equal(a.startMin, 1020)
  assert.equal(b.startMin - (a.startMin + 45), 90)   // the 30 minute gap plus 60 extra (the spare time was 120)
  layoutPlan(plan, { maxExtraGap: 0 })
  assert.equal(plan.windows[0].items[1].startMin, 1020 + 45 + 30)
  const three = createDayPlan([{ start: 1020, end: 1260 }], 30)
  ;[1, 2, 3].forEach(k => three.add(0, { k }, 45))
  layoutPlan(three, { maxExtraGap: 60 })
  assert.deepEqual(three.windows[0].items.map(i => i.startMin), [1020, 1115, 1210])         // the last ends at 21:00 or before
})
ok('separateNeighbours keeps the same subject apart where it can and never moves the first session', () => {
  const mk = (...s) => s.map(x => ({ session: { subject: x } }))
  const subs = (items) => separateNeighbours(items).map(i => i.session.subject).join('')
  assert.equal(subs(mk('A', 'A', 'B', 'C')), 'ABAC')
  assert.equal(subs(mk('A', 'B', 'B', 'A')), 'ABAB')
  assert.equal(subs(mk('A', 'B', 'B', 'B')), 'ABBB')     // nothing to swap with
  assert.equal(subs(mk('A', 'A')), 'AA')
})
ok('fitSessionLength sizes sessions so a free period is used up', () => {
  assert.deepEqual(fitSessionLength(50, 45, 10), { count: 1, len: 50 })      // one 50 minute session, not 45 and 5 wasted
  assert.deepEqual(fitSessionLength(100, 45, 10), { count: 2, len: 45 })
  assert.deepEqual(fitSessionLength(110, 45, 10), { count: 2, len: 50 })
  assert.deepEqual(fitSessionLength(40, 45, 10), { count: 1, len: 40 })      // shorter than a normal session: one shorter session
  assert.deepEqual(fitSessionLength(65, 45, 10), { count: 1, len: 60 })      // stretched by at most 15
  assert.deepEqual(fitSessionLength(25, 45, 10), { count: 1, len: 25 })
  assert.deepEqual(fitSessionLength(20, 45, 10), { count: 0, len: 0 })       // too short to be worth a session
})
ok('fillPlan places exam practice that fits first, then one session at a time, fairest first', () => {
  const plan = createDayPlan([{ start: 0, end: 200 }], 10)
  const used = { A: 0, B: 0 }, state = { A: 'exam' }, placed = []
  fillPlan(plan, {
    pool: [{ n: 'B' }, { n: 'A' }],
    order: (list) => [...list].sort((x, y) => used[x.n] - used[y.n]),
    dueCandidate: (s) => s.n === 'A' ? (state.A === 'exam' ? { n: 'A', stype: 'exam', dur: 120 } : { n: 'A', stype: 'content', dur: 50 }) : { n: 'B', stype: 'content', dur: 50 },
    fillerCandidate: (s) => ({ n: s.n, stype: 'content', dur: 50 }),
    place: (c, w, filler) => { plan.add(w, c, c.dur); used[c.n] += c.dur; placed.push(`${c.n}:${c.stype}${filler ? '*' : ''}`); if (c.n === 'A' && !filler) state.A = 'content' },
  })
  assert.deepEqual(placed, ['A:exam', 'B:content'])        // the long paper got the time first, B filled what was left
})
ok('fillPlan fills with extra content when an exam paper cannot fit anywhere, and respects the daily cap', () => {
  const plan = createDayPlan([{ start: 0, end: 100 }], 10)
  const placed = []
  fillPlan(plan, {
    pool: [{ n: 'A' }], order: (l) => l,
    dueCandidate: () => ({ n: 'A', stype: 'exam', dur: 120 }),            // longer than the window
    fillerCandidate: () => ({ n: 'A', stype: 'content', dur: 40 }),
    place: (c, w, filler) => { plan.add(w, c, c.dur); placed.push(filler ? 'filler' : c.stype) },
  })
  assert.deepEqual(placed, ['filler', 'filler'])                          // 40 + 10 + 40, and the exam turn was never used up
  let n = 0
  const capped = createDayPlan([{ start: 0, end: 1000 }], 0), got = []
  fillPlan(capped, { pool: [{ n: 'A' }], order: (l) => l, dueCandidate: () => ({ n: 'A', stype: 'content', dur: 10 }), fillerCandidate: () => null,
    place: (c, w) => { capped.add(w, c, c.dur); n++; got.push(n) }, capReached: () => n >= 3 })
  assert.deepEqual(got, [1, 2, 3])
})
ok('topUp adds one shorter session where a window has room for it, and none where the room is too short', () => {
  const plan = createDayPlan([{ start: 0, end: 100 }, { start: 200, end: 220 }], 10)
  plan.add(0, {}, 50)
  const got = []
  topUp(plan, { pool: [{ n: 'A' }], order: (l) => l, fillerCandidate: (s) => ({ n: s.n }), maxLen: 60, placeShort: (c, w, m) => { got.push(`${w}:${m}`); plan.add(w, c, m) } })
  assert.deepEqual(got, ['0:40'])                                          // 100 - (50 + 10); the 20 minute window is too short to be worth a session
})

// ── Calendar generator: the engine itself ────────────────────────────────────
const gSubj = (name, extra = {}) => ({ name, board: 'AQA', tier: 'N/A', qualification: 'GCSE', papers: [1, 2], ratio: [2, 1], examDates: [], priority: false, ...extra })
const gAvail = (start = '17:00', end = '20:00') => {
  const a = {}
  ;['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach(d => { a[d] = { enabled: true, ranges: [{ start, end }] } })
  a.Sunday = { enabled: false }
  return a
}
const gBase = { startDate: new Date(2027, 0, 4), endDate: new Date(2027, 1, 28), holidays: [], contentDuration: 45, sessionGap: 30, includeEmergency: true }   // Mon 4 Jan to Sun 28 Feb 2027
const gMinutes = (sessions) => { const m = {}; sessions.forEach(s => { m[s.subject] = (m[s.subject] || 0) + s.duration }); return m }
const gDow = (s) => { const [y, m, d] = s.date.split('-').map(Number); return new Date(y, m - 1, d).getDay() }

ok('generator: subjects with the same settings and no priority get (almost) equal hours', () => {
  const subjects = ['History', 'Geography', 'Biology', 'Chemistry', 'French', 'Spanish'].map(nm => gSubj(nm))
  const m = gMinutes(generateSchedule({ ...gBase, subjects, availability: gAvail() }))
  const v = subjects.map(s => m[s.name])
  assert.ok(Math.max(...v) - Math.min(...v) <= 150, 'hours by subject: ' + JSON.stringify(m))   // was 350 to 1980 minutes: the first subjects in the list took most slots
})
ok('generator: one subject marked high priority gets about twice the hours of the others', () => {
  const subjects = ['Mathematics', 'History', 'Geography', 'French', 'Spanish'].map((nm, i) => gSubj(nm, { priority: i === 0 }))
  const m = gMinutes(generateSchedule({ ...gBase, subjects, availability: gAvail() }))
  const others = ['History', 'Geography', 'French', 'Spanish'].map(k => m[k]); const avg = others.reduce((a, b) => a + b, 0) / others.length
  assert.ok(m.Mathematics / avg > 1.7 && m.Mathematics / avg < 2.3, JSON.stringify(m))
})
ok('generator: equally weak topics on a paper get equal minutes, and each session says which topic it is about', () => {
  const four = ['Cold War', 'Weimar', 'Elizabethan', 'Health']
  const topicFocus = { 'History-1': four, 'History-2': four }
  const out = generateSchedule({ ...gBase, subjects: [gSubj('History'), gSubj('Geography')], availability: gAvail(), topicFocus })
  const byTopic = {}; out.filter(s => s.focusTopic).forEach(s => { byTopic[s.focusTopic] = (byTopic[s.focusTopic] || 0) + s.duration })
  const v = four.map(t => byTopic[t])
  assert.ok(v.every(Boolean) && Math.max(...v) - Math.min(...v) <= 90, JSON.stringify(byTopic))
  const s1 = out.find(s => s.focusTopic)
  assert.ok(s1.title.includes(s1.focusTopic) && s1.type === 'Content Revision')
  assert.ok(out.filter(s => s.subject === 'Geography').every(s => s.focusTopic === undefined))        // no focus data: generic title, and no undefined field for Firestore
  assert.ok(out.filter(s => s.type === 'Exam Practice').every(s => !('focusTopic' in s)))
})
ok('generator: weakest topics get more turns, and the old single-topic focus still works', () => {
  const topicFocus = { 'Geography-1': [{ name: 'Rivers', weight: 2 }, { name: 'Coasts', weight: 1 }], 'Geography-2': [{ name: 'Rivers', weight: 2 }, { name: 'Coasts', weight: 1 }] }
  const out = generateSchedule({ ...gBase, subjects: [gSubj('Geography'), gSubj('History')], availability: gAvail(), topicFocus })
  const r = out.filter(s => s.focusTopic === 'Rivers').length, c = out.filter(s => s.focusTopic === 'Coasts').length
  assert.ok(r / c > 1.6 && r / c < 2.4, `${r} vs ${c}`)
  const legacy = generateSchedule({ ...gBase, subjects: [gSubj('History')], availability: gAvail(), topicFocus: { 'History-1': 'Weimar', 'History-2': 'Weimar' } })
  assert.deepEqual([...new Set(legacy.filter(s => s.type === 'Content Revision').map(s => s.focusTopic))], ['Weimar'])
})
ok('generator: Sunday is used when the student turned it on, and stays emergency-only when they did not', () => {
  const on = gAvail(); on.Sunday = { enabled: true, ranges: [{ start: '10:00', end: '12:00' }] }
  const subjects = [gSubj('History'), gSubj('Geography')]
  const withSunday = generateSchedule({ ...gBase, subjects, availability: on }).filter(s => gDow(s) === 0)
  assert.ok(withSunday.length > 0 && withSunday.every(s => s.start >= '10:00' && s.end <= '12:00'))
  assert.equal(generateSchedule({ ...gBase, subjects, availability: gAvail() }).filter(s => gDow(s) === 0).length, 0)
})
ok('generator: a paused subject gets nothing, a hyphenated subject name still gets its emergency session, a bad exam date is skipped', () => {
  const subjects = [
    gSubj('Food-Tech', { examDates: [{ paper: 1, date: '2027-02-10' }] }),
    gSubj('French', { ratio: [0, 0], examDates: [{ paper: 1, date: '2027-02-10' }] }),
    gSubj('History', { examDates: [{ paper: 1, date: 'not a date' }] }),
  ]
  const out = generateSchedule({ ...gBase, subjects, availability: gAvail() })
  assert.equal(out.filter(s => s.subject === 'French').length, 0)
  assert.deepEqual(out.filter(s => s.subject === 'Food-Tech' && s.isEmergency).map(s => s.date), ['2027-02-09'])
  assert.ok(out.some(s => s.subject === 'History'))
})
ok('generator: the dynamic ratio leaves an exam-practice-only subject as exam practice only', () => {
  const subjects = [gSubj('English Language', { ratio: [0, 1], examDates: [{ paper: 1, date: '2027-02-20' }, { paper: 2, date: '2027-02-22' }] })]
  const out = generateSchedule({ ...gBase, subjects, availability: gAvail(), dynamicRatio: true })
  assert.equal(out.filter(s => s.type === 'Content Revision').length, 0)
  assert.ok(out.filter(s => s.type === 'Exam Practice').length > 0)
})
ok('generator: an evening with more time than subjects is filled, not left part empty', () => {
  // content only: this is about spare evening time being filled, and a two-hour exam paper would not fit in it anyway
  const out = generateSchedule({ ...gBase, subjects: [gSubj('History', { ratio: [1, 0] }), gSubj('Geography', { ratio: [1, 0] })], availability: gAvail('17:00', '21:00') })
  const byDay = {}; out.forEach(s => { (byDay[s.date] = byDay[s.date] || []).push(s) })
  const days = Object.values(byDay)
  assert.ok(days.length >= 40)
  assert.ok(days.every(l => l.length >= 3), 'two subjects used to get one session each: ' + Math.min(...days.map(l => l.length)))
  const mins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
  assert.ok(days.every(l => 21 * 60 - Math.max(...l.map(s => mins(s.end))) <= 15), 'the evening ends with spare time left over')
})
ok('generator: with a daily cap the sessions are spread through the evening instead of bunched at the start', () => {
  const subjects = ['History', 'Geography', 'Biology'].map(nm => gSubj(nm, { ratio: [1, 0] }))      // content only, as above
  const out = generateSchedule({ ...gBase, subjects, availability: gAvail('17:00', '21:00'), maxSessionsPerDay: 2 })
  const byDay = {}; out.forEach(s => { (byDay[s.date] = byDay[s.date] || []).push(s) })
  const mins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
  assert.ok(Object.values(byDay).every(l => l.length === 2))
  Object.values(byDay).forEach(l => {
    const [a, b] = [...l].sort((x, y) => mins(x.start) - mins(y.start))
    assert.ok(mins(b.start) - mins(a.end) > 30, 'second session starts straight after the first')      // more than the 30 minute gap
    assert.ok(mins(b.start) - mins(a.end) <= 90 && mins(b.end) <= 21 * 60)
  })
})
ok('generator: long exam papers are not squeezed out, and minutes stay even between subjects', () => {
  const subjects = ['History', 'Geography', 'Biology', 'Chemistry', 'French', 'Spanish'].map(nm => gSubj(nm))
  const out = generateSchedule({ ...gBase, subjects, availability: gAvail() })
  subjects.forEach(s => assert.ok(out.filter(x => x.subject === s.name && x.type === 'Exam Practice').length >= 3, `${s.name} got too little exam practice`))
  const m = gMinutes(out), v = subjects.map(s => m[s.name])
  assert.ok(Math.max(...v) - Math.min(...v) <= 200, JSON.stringify(m))      // some papers run to two hours, so a subject can be one long paper ahead
})
ok('generator: a subject set to exam practice only never gets filler content, even when its paper does not fit', () => {
  const out = generateSchedule({ ...gBase, subjects: [gSubj('Chemistry', { ratio: [0, 1] }), gSubj('History')], availability: gAvail('17:00', '18:00') })   // Chemistry's paper is longer than one hour
  assert.equal(out.filter(s => s.subject === 'Chemistry').length, 0)
  assert.ok(out.filter(s => s.subject === 'History').length > 40)
})
const gFree = (a, b) => ({ type: 'free', startTime: a, endTime: b })
const gTimetable = { Monday: [gFree('10:00', '10:50')], Tuesday: [gFree('10:00', '11:40')], Wednesday: [gFree('10:00', '10:40')], Thursday: [gFree('10:00', '10:15')], Friday: [gFree('10:00', '10:50'), gFree('13:00', '14:40')] }
ok('generator: free periods are always filled, whatever their length', () => {
  const subjects = ['History', 'Geography', 'Biology'].map(nm => gSubj(nm))
  const out = scheduleFreePeriods({ ...gBase, subjects, timetable: gTimetable })
  const total = (dow, from) => out.filter(s => gDow(s) === dow && (!from || s.start >= from)).reduce((n, s) => n + s.duration, 0)
  const each = (dow) => { const by = {}; out.filter(s => gDow(s) === dow).forEach(s => { (by[s.date] = by[s.date] || []).push(s) }); return Object.values(by) }
  each(1).forEach(l => { assert.equal(l.length, 1); assert.equal(l[0].start, '10:00'); assert.equal(l[0].end, '10:50') })   // 50 minutes: one 50 minute session
  each(3).forEach(l => { assert.equal(l.length, 1); assert.equal(l[0].duration, 40) })                                     // 40 minutes: one shorter session
  assert.equal(out.filter(s => gDow(s) === 4).length, 0)                                                                    // 15 minutes is too short to be worth a session
  each(2).forEach(l => assert.ok(l.reduce((n, s) => n + s.duration, 0) >= 90))                                              // 100 minutes: two sessions (or one long paper)
  assert.ok(each(2).some(l => l.length === 2), 'a double free period holds two sessions')
  each(5).forEach(l => assert.ok(l.reduce((n, s) => n + s.duration, 0) >= 140))                                             // 50 minutes plus 100 minutes
  assert.ok(total(1) > 0 && total(2) > 0)
  out.forEach(s => assert.ok(s.viaFreePeriod === true && s.completed === false))
})
ok('generator: free periods have no priority bias, and are not limited by the evening daily caps', () => {
  const subjects = ['History', 'Geography', 'Biology'].map((nm, i) => gSubj(nm, { priority: i === 0 }))      // History is "High priority"
  const evening = generateSchedule({ ...gBase, subjects, availability: gAvail(), maxSessionsPerDay: 1 })
  const free = scheduleFreePeriods({ ...gBase, subjects, timetable: gTimetable, maxSessionsPerDay: 1, dayCaps: [{ day: 'Tuesday', max: 1 }] })
  const eve = gMinutes(evening)
  assert.ok(eve.History > eve.Geography * 1.5, 'high priority still applies to the evening: ' + JSON.stringify(eve))
  const m = gMinutes(free), v = subjects.map(s => m[s.name])
  assert.ok(Math.max(...v) - Math.min(...v) <= 120, 'free periods favoured a subject: ' + JSON.stringify(m))
  const byDay = {}; free.filter(s => gDow(s) === 2).forEach(s => { (byDay[s.date] = byDay[s.date] || []).push(s) })
  assert.ok(Object.values(byDay).some(l => l.length === 2), 'the daily cap must not apply to free periods')
})
ok('generator: free periods carry on the rotation from the evening pass without making up its minutes', () => {
  const subjects = ['History', 'Geography', 'Biology', 'French', 'Spanish'].map(nm => gSubj(nm))
  const cfg = { ...gBase, endDate: new Date(2027, 0, 20) }                         // three Mondays: 4, 11 and 18 January
  const evening = generateSchedule({ ...cfg, subjects, availability: { Monday: { enabled: true, ranges: [{ start: '17:00', end: '17:50' }] } } })
  const timetable = { Monday: [gFree('10:00', '10:50')] }
  const independent = scheduleFreePeriods({ ...cfg, subjects, timetable })
  const carried = scheduleFreePeriods({ ...cfg, subjects, timetable, existingSessions: evening })
  assert.deepEqual(evening.map(s => s.subject), ['History', 'Geography', 'Biology'])
  assert.deepEqual(independent.map(s => s.subject), ['History', 'Geography', 'Biology'])    // the same three subjects twice
  assert.deepEqual(carried.map(s => s.subject), ['French', 'Spanish', 'History'])           // the subjects that missed out come first
})
ok('longPaperWarnings names the exam papers that are longer than every study window', () => {
  const subjects = [gSubj('Chemistry'), gSubj('History', { ratio: [3, 0] }), gSubj('Biology', { ratio: [0, 0] })]
  const w = longPaperWarnings({ subjects, availability: gAvail('17:00', '18:00'), startDate: new Date(2027, 0, 4) })
  assert.ok(w.length > 0 && w.every(x => x.subject === 'Chemistry' && x.minutes > 60 && x.longest === 60))     // content-only and paused subjects are not flagged
  assert.deepEqual(longPaperWarnings({ subjects, availability: gAvail('17:00', '21:00'), startDate: new Date(2027, 0, 4) }), [])   // a 4 hour window holds any paper
  const past = [gSubj('Chemistry', { examDates: [{ paper: 1, date: '2026-12-01' }, { paper: 2, date: '2026-12-02' }] })]
  assert.deepEqual(longPaperWarnings({ subjects: past, availability: gAvail('17:00', '18:00'), startDate: new Date(2027, 0, 4) }), [])   // exams already sat
})
ok('buildSubjectsFromProfile uses the real qualification, numeric paper order, and gives no subject extra priority', () => {
  const out = buildSubjectsFromProfile({ qualification: 'A-Level', subjects: [{ name: 'Mathematics', board: 'AQA' }, { name: 'Physics', board: 'AQA', qualification: 'AS-Level' }],
    examDates: [{ subject: 'Mathematics', paper: '10', examDate: '2027-06-01' }, { subject: 'Mathematics', paper: '2', examDate: '2027-06-02' }, { subject: 'Mathematics', paper: '1', examDate: '2027-06-03' }] })
  assert.deepEqual(out.map(s => s.qualification), ['A-Level', 'AS-Level'])
  assert.deepEqual(out[0].papers, [1, 2, 10])
  assert.deepEqual(out.map(s => s.priority), [false, false])
})
ok('generator: across many random set-ups no session overlaps, leaves the student\'s availability, lands on a holiday, goes over the daily cap, or is for a paused subject', () => {
  const rng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
  const NAMES = ['Mathematics', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'French', 'Spanish']
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const mins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  for (let seed = 1; seed <= 60; seed++) {
    const r = rng(seed)
    const start = new Date(2027, 0, 4 + Math.floor(r() * 14)), end = new Date(2027, 0, 4 + 30 + Math.floor(r() * 60))
    const subjects = [...NAMES].sort(() => r() - 0.5).slice(0, 2 + Math.floor(r() * 6)).map(nm => gSubj(nm, {
      ratio: [[2, 1], [1, 1], [0, 1], [1, 2], [0, 0]][Math.floor(r() * 5)], priority: r() < 0.25,
      examDates: r() < 0.6 ? [{ paper: 1, date: ymd(new Date(2027, 0, 20 + Math.floor(r() * 60))) }] : [] }))
    const availability = {}
    DAYS.forEach(d => { availability[d] = { enabled: r() < 0.75, ranges: [{ start: `${15 + Math.floor(r() * 3)}:00`, end: `${19 + Math.floor(r() * 3)}:30` }] } })
    const holidays = r() < 0.4 ? [{ start: ymd(new Date(2027, 0, 12)), end: ymd(new Date(2027, 0, 16)) }] : []
    const cap = r() < 0.35 ? 1 + Math.floor(r() * 3) : null
    const out = generateSchedule({ ...gBase, startDate: start, endDate: end, subjects, availability, holidays, dynamicRatio: r() < 0.4, maxSessionsPerDay: cap })
    const byDay = {}
    out.forEach(s => { (byDay[s.date] = byDay[s.date] || []).push(s) })
    Object.entries(byDay).forEach(([date, list]) => {
      const av = availability[DAYS[gDow(list[0])]]
      assert.ok(!holidays.some(h => date >= h.start && date <= h.end), `seed ${seed}: session on holiday ${date}`)
      const sorted = [...list].sort((a, b) => mins(a.start) - mins(b.start))
      for (let i = 1; i < sorted.length; i++) assert.ok(mins(sorted[i].start) >= mins(sorted[i - 1].end), `seed ${seed}: overlap on ${date}`)
      if (av.enabled) {
        list.forEach(s => assert.ok(mins(s.start) >= mins(av.ranges[0].start) && mins(s.end) <= mins(av.ranges[0].end), `seed ${seed}: ${s.subject} outside availability on ${date}`))
        if (cap) assert.ok(list.length <= cap, `seed ${seed}: ${list.length} sessions on ${date}, over the cap of ${cap}`)
      } else {
        list.forEach(s => assert.ok(s.isEmergency, `seed ${seed}: session on a day that is off, ${date}`))
      }
    })
    subjects.filter(s => s.ratio[0] === 0 && s.ratio[1] === 0).forEach(s => assert.equal(out.filter(x => x.subject === s.name).length, 0, `seed ${seed}: paused ${s.name} scheduled`))
  }
})

// ── Free / Pro entitlements (netlify/functions/lib/entitlementLogic.js, src/utils/entitlementsCore.js) ──────────
const E_DAY1 = new Date('2026-11-05T10:00:00Z'), E_DAY2 = new Date('2026-11-06T10:00:00Z'), E_DAY3 = new Date('2026-11-07T10:00:00Z')
const freeUser = (extra = {}) => ({ 'users/u1': { displayName: 'A', ...extra } })

ok('entitlement config holds the agreed numbers, and every Pro-only feature is listed', () => {
  const f = ent.CONFIG.free
  assert.deepEqual([f.mathsSolver.lifetime, f.mathsSolver.daily], [5, 2])
  assert.deepEqual([f.essayFeedback.lifetime, f.essayFeedback.daily], [2, 1])
  assert.deepEqual([f.timedChallenge.lifetime, f.recommendedTopics.lifetime, f.photoMarking.lifetime, f.timetable.lifetime], [3, 3, 3, 1])
  assert.deepEqual(Object.keys(ent.CONFIG.proOnly).sort(), ['deepAnalytics', 'exports', 'multiSubjectPredictions', 'paperAnalysis', 'parentReport', 'timetableReschedule'])
  assert.ok(!FREE_FEATURES.includes('lifetime') && !FREE_FEATURES.includes('aiCalls'))      // would collide with documents tutor.js and this module already use
  assert.deepEqual(FREE_FEATURES, Object.keys(f)); assert.deepEqual(PRO_ONLY_FEATURES, Object.keys(ent.CONFIG.proOnly))
})
ok('Pro means isPro or betaUser, strictly', () => {
  assert.equal(ent.isProUser({ isPro: true }), true); assert.equal(ent.isProUser({ betaUser: true }), true)
  assert.equal(ent.isProUser({ isPro: 'true' }), false); assert.equal(ent.isProUser({}), false); assert.equal(ent.isProUser(null), false)
})
ok('decideConsume: first use, daily cap, lifetime cap (lifetime is reported first)', () => {
  const d1 = ent.decideConsume('mathsSolver', {}, { day: '2026-11-05' })
  assert.equal(d1.allowed, true); assert.equal(d1.usedLifetime, 1); assert.equal(d1.remainingLifetime, 4); assert.equal(d1.dailyRemaining, 1)
  assert.deepEqual(d1.write, { mathsSolver: 1, daily: { mathsSolver: { day: '2026-11-05', n: 1 } } })
  const today = { mathsSolver: 2, daily: { mathsSolver: { day: '2026-11-05', n: 2 } } }
  const d2 = ent.decideConsume('mathsSolver', today, { day: '2026-11-05' })
  assert.equal(d2.allowed, false); assert.equal(d2.code, 'DAILY_LIMIT'); assert.equal(d2.remainingLifetime, 3); assert.equal(d2.dailyRemaining, 0)
  assert.equal(ent.decideConsume('mathsSolver', today, { day: '2026-11-06' }).allowed, true)              // a new day resets the daily count only
  const spent = { mathsSolver: 5, daily: { mathsSolver: { day: '2026-11-05', n: 2 } } }
  assert.equal(ent.decideConsume('mathsSolver', spent, { day: '2026-11-05' }).code, 'LIFETIME_EXHAUSTED')   // both caps reached: told to upgrade, not to wait
  assert.equal(ent.decideConsume('timedChallenge', { timedChallenge: 2 }, {}).remainingLifetime, 0)          // a feature with no daily cap
  assert.equal(ent.decideConsume('timedChallenge', { timedChallenge: 3 }, {}).code, 'LIFETIME_EXHAUSTED')
  assert.equal(ent.decideConsume('nonsense', {}, {}).code, 'UNKNOWN_FEATURE')
  assert.equal(ent.decideConsume('mathsSolver', { mathsSolver: 99 }, { pro: true }).allowed, true)           // Pro has no lifetime cap
})
ok('decideRefund gives one use back, never below zero, and only touches today\'s daily count', () => {
  const doc = { mathsSolver: 3, daily: { mathsSolver: { day: '2026-11-05', n: 2 } } }
  assert.deepEqual(ent.decideRefund('mathsSolver', doc, { day: '2026-11-05' }).write, { mathsSolver: 2, daily: { mathsSolver: { day: '2026-11-05', n: 1 } } })
  assert.deepEqual(ent.decideRefund('mathsSolver', doc, { day: '2026-11-06' }).write, { mathsSolver: 2 })     // yesterday's daily count is left alone
  assert.equal(ent.decideRefund('mathsSolver', {}, {}).refunded, false)
  assert.equal(ent.decideRefund('timetable', { timetable: 0 }, {}).refunded, false)
})
ok('every refusal is worded softly: no quota, rate limit or throttling, and Pro is never "unlimited"', () => {
  for (const feature of FREE_FEATURES) for (const code of ['LIFETIME_EXHAUSTED', 'DAILY_LIMIT', 'PRO_REQUIRED']) {
    const m = ent.messageFor(code, feature)
    assert.ok(m && !/quota|rate limit|throttl|unlimited/i.test(m), `${feature}/${code}: ${m}`)
  }
  for (const feature of PRO_ONLY_FEATURES) assert.match(ent.messageFor('PRO_REQUIRED', feature), /is a Pro feature\.$/)
  assert.equal(ent.messageFor('LIFETIME_EXHAUSTED', 'timetable'), "You've used your free timetable. Upgrade to Pro to generate another.")
})
ok('the browser\'s numbers and wording agree with the server\'s', () => {
  const docs = [undefined, {}, { mathsSolver: 2 }, { mathsSolver: 5 }, { essayFeedback: 1, daily: { essayFeedback: { day: '2026-11-05', n: 1 } } }, { essayFeedback: 1, daily: { essayFeedback: { day: '2026-11-04', n: 1 } } }, { timetable: 1 }, { timedChallenge: 7 }]
  for (const feature of FREE_FEATURES) for (const doc of docs) for (const pro of [false, true]) {
    assert.deepEqual(describeEntitlement(feature, doc, { pro, day: '2026-11-05' }), ent.describeStatus(feature, doc, { pro, day: '2026-11-05' }), `${feature} ${JSON.stringify(doc)} pro=${pro}`)
  }
  for (const feature of [...FREE_FEATURES, ...PRO_ONLY_FEATURES]) for (const code of ['LIFETIME_EXHAUSTED', 'DAILY_LIMIT', 'PRO_REQUIRED']) assert.equal(entitlementMessage(code, feature), ent.messageFor(code, feature), `${feature}/${code}`)
  assert.equal(describeEntitlement('nonsense', {}, {}), null)
})
ok('freeUsesLabel says how many free uses are left, and nothing at all for Pro', () => {
  assert.equal(freeUsesLabel(describeEntitlement('mathsSolver', { mathsSolver: 3 }, {})), '2 of 5 free Maths solves left')
  assert.equal(freeUsesLabel(describeEntitlement('timetable', {}, {})), '1 free timetable left')
  assert.equal(freeUsesLabel(describeEntitlement('timetable', { timetable: 1 }, {})), 'Your free timetable is used')
  assert.equal(freeUsesLabel(describeEntitlement('mathsSolver', {}, { pro: true })), null)
  assert.equal(freeUsesLabel(null), null)
  assert.equal(isUpgradeCode('LIFETIME_EXHAUSTED'), true); assert.equal(isUpgradeCode('PRO_REQUIRED'), true); assert.equal(isUpgradeCode('DAILY_LIMIT'), false)
})
ok('denialResponse gives the browser a machine-readable code and the right status', () => {
  const r = (code) => ent.denialResponse({ code, message: 'm', remainingLifetime: 0, dailyRemaining: 0 })
  assert.deepEqual([r('LIFETIME_EXHAUSTED').status, r('PRO_REQUIRED').status, r('DAILY_LIMIT').status, r('UNKNOWN_FEATURE').status], [402, 402, 429, 400])
  assert.deepEqual(r('DAILY_LIMIT').body, { error: 'm', code: 'DAILY_LIMIT', remainingLifetime: 0, dailyRemaining: 0 })
})
await okAsync('consumeLifetimeUse counts a free account across days: 2 a day, 5 in all, then it is for Pro', async () => {
  const db = makeFakeFirestore(freeUser())
  const use = (now) => ent.consumeLifetimeUse(db, 'u1', 'mathsSolver', { now })
  assert.equal((await use(E_DAY1)).allowed, true); assert.equal((await use(E_DAY1)).allowed, true)
  assert.equal((await use(E_DAY1)).code, 'DAILY_LIMIT')
  assert.equal((await use(E_DAY2)).allowed, true); assert.equal((await use(E_DAY2)).allowed, true)
  assert.equal((await use(E_DAY2)).code, 'DAILY_LIMIT')
  const fifth = await use(E_DAY3); assert.equal(fifth.allowed, true); assert.equal(fifth.remainingLifetime, 0)
  assert.equal((await use(E_DAY3)).code, 'LIFETIME_EXHAUSTED')
  assert.equal((await use(new Date('2026-12-25T10:00:00Z'))).code, 'LIFETIME_EXHAUSTED')                  // the lifetime allowance never resets
  assert.equal(db.read('users/u1/usage/lifetime').mathsSolver, 5)
})
await okAsync('ten requests racing for the one free timetable: exactly one gets it', async () => {
  const db = makeFakeFirestore(freeUser())
  const results = await Promise.all(Array.from({ length: 10 }, () => ent.consumeLifetimeUse(db, 'u1', 'timetable', { now: E_DAY1, seedUsed: async () => 0 })))
  assert.equal(results.filter(r => r.allowed).length, 1)
  assert.equal(results.filter(r => r.code === 'LIFETIME_EXHAUSTED').length, 9)
  assert.equal(db.read('users/u1/usage/lifetime').timetable, 1)                                            // never double counted
})
await okAsync('Pro and beta accounts are never counted and nothing is written for them', async () => {
  const db = makeFakeFirestore({ 'users/p1': { isPro: true }, 'users/b1': { betaUser: true } })
  for (const uid of ['p1', 'b1']) for (let i = 0; i < 8; i++) { const r = await ent.consumeLifetimeUse(db, uid, 'mathsSolver', { now: E_DAY1 }); assert.equal(r.allowed, true); assert.equal(r.pro, true) }
  assert.equal((await ent.refundLifetimeUse(db, 'p1', 'mathsSolver')).pro, true)
  assert.deepEqual(db.allWrites(), [])
})
await okAsync('an account that already has a generated schedule has used its free timetable, and nothing is deleted', async () => {
  const db = makeFakeFirestore({ 'users/u1': {}, 'users/u1/sessions/s1': { source: 'generated', date: '2026-11-01' }, 'users/u2': {} })
  let asked = 0
  const seed = (count) => async () => { asked++; return count }
  const r1 = await ent.consumeLifetimeUse(db, 'u1', 'timetable', { now: E_DAY1, seedUsed: seed(1) })
  assert.equal(r1.allowed, false); assert.equal(r1.code, 'LIFETIME_EXHAUSTED')
  assert.equal(db.read('users/u1/usage/lifetime').timetable, 1)                                            // remembered
  await ent.consumeLifetimeUse(db, 'u1', 'timetable', { now: E_DAY1, seedUsed: seed(1) })
  assert.equal(asked, 1)                                                                                   // not worked out again
  assert.ok(db.read('users/u1/sessions/s1'))                                                               // the existing schedule is untouched
  assert.equal((await ent.consumeLifetimeUse(db, 'u2', 'timetable', { now: E_DAY1, seedUsed: seed(0) })).allowed, true)   // no schedule yet: the free one is available
  assert.equal((await ent.consumeLifetimeUse(db, 'u2', 'timetable', { now: E_DAY1, seedUsed: seed(0) })).code, 'LIFETIME_EXHAUSTED')
})
await okAsync('a use is given back after a failure, once, and never below zero', async () => {
  const db = makeFakeFirestore(freeUser())
  await ent.consumeLifetimeUse(db, 'u1', 'timetable', { now: E_DAY1 })
  const back = await ent.refundLifetimeUse(db, 'u1', 'timetable', { now: E_DAY1 })
  assert.equal(back.refunded, true); assert.equal(db.read('users/u1/usage/lifetime').timetable, 0)
  assert.equal((await ent.refundLifetimeUse(db, 'u1', 'timetable', { now: E_DAY1 })).refunded, false)
  assert.equal((await ent.consumeLifetimeUse(db, 'u1', 'timetable', { now: E_DAY1 })).allowed, true)       // the free use is available again
  await ent.consumeLifetimeUse(db, 'u1', 'essayFeedback', { now: E_DAY1 })
  await ent.refundLifetimeUse(db, 'u1', 'essayFeedback', { now: E_DAY1 })
  assert.equal((await ent.consumeLifetimeUse(db, 'u1', 'essayFeedback', { now: E_DAY1 })).allowed, true)    // today's 1-a-day cap came back too
})
await okAsync('requireProFeature turns a free account away from a Pro-only feature, and an unknown feature is never counted', async () => {
  const db = makeFakeFirestore({ ...freeUser(), 'users/p1': { isPro: true } })
  const no = await ent.requireProFeature(db, 'u1', 'timetableReschedule')
  assert.equal(no.allowed, false); assert.equal(no.code, 'PRO_REQUIRED'); assert.equal(no.message, 'Automatic rescheduling is a Pro feature.')
  assert.equal((await ent.requireProFeature(db, 'p1', 'timetableReschedule')).allowed, true)
  assert.equal((await ent.consumeLifetimeUse(db, 'u1', 'nonsense')).code, 'UNKNOWN_FEATURE')
  assert.deepEqual(db.allWrites(), [])
})
await okAsync('getStatus reports every capped feature, includes work already done, and shows nothing counted for Pro', async () => {
  const db = makeFakeFirestore({ ...freeUser(), 'users/u1/usage/lifetime': { mathsSolver: 3 }, 'users/p1': { betaUser: true } })
  const s = await ent.getStatus(db, 'u1', { now: E_DAY1, seeds: { timetable: 1 } })
  assert.equal(s.pro, false); assert.equal(s.features.mathsSolver.remainingLifetime, 2); assert.equal(s.features.timetable.exhausted, true)
  assert.equal(s.features.timedChallenge.remainingLifetime, 3); assert.deepEqual(s.proOnly, PRO_ONLY_FEATURES)
  const p = await ent.getStatus(db, 'p1', { now: E_DAY1 })
  assert.equal(p.pro, true); assert.ok(Object.values(p.features).every(f => f.pro === true && f.remainingLifetime === null))
})
await okAsync('the fake database: tx.update changes only the fields it is given and refuses a missing document, like the real one', async () => {
  const db = makeFakeFirestore({ 'users/u1/usage/aiCalls': { date: '2026-11-14', count: 3, extra: 'kept' } })
  const ref = db.collection('users').doc('u1').collection('usage').doc('aiCalls')
  await db.runTransaction(async tx => { await tx.get(ref); tx.update(ref, { count: 4 }) })
  assert.deepEqual(db.read('users/u1/usage/aiCalls'), { date: '2026-11-14', count: 4, extra: 'kept' })
  const gone = db.collection('users').doc('u1').collection('usage').doc('missing')
  await assert.rejects(db.runTransaction(async tx => { await tx.get(gone); tx.update(gone, { count: 1 }); tx.set(ref, { date: 'x', count: 9 }) }), /NOT_FOUND/)
  assert.equal(db.read('users/u1/usage/aiCalls').count, 4)             // nothing from the failed transaction was applied
  assert.equal(db.read('users/u1/usage/missing'), undefined)
})

console.log(`\n${n} checks passed`)
