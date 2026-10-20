import assert from 'node:assert/strict'
import { toLocalDateStr, parseLocalDate, localWeekStartStr, localMonthStartStr, addLocalDays, diffLocalDays } from '../src/utils/localDate.js'
import { currentWeekStart as srvWeek, currentMonthStart as srvMonth, xpPeriodPatch as srvPatch, effectivePeriodXP as srvEffective, periodFields as srvPeriodFields } from '../netlify/functions/lib/periods.js'
import { flashcardSetSource, isOfficialSet, isCommunitySet } from '../src/utils/provenance.js'
import { getBoundaries, scaleBoundariesToPaper, calculateGradeFromBoundaries } from '../src/data/paperDatabase.js'
import { miniTimerState, formatClock } from '../src/utils/miniTimerState.js'
import { ALL_TIME, academicYearStart, resolveAnalyticsStart, earliestRecordDay, recordDay, inAnalyticsWindow, currentOrUnstamped, analyticsRangeStart, analyticsRangeDays } from '../src/utils/analyticsWindow.js'
import { buildSubjectKey } from '../src/utils/subjectKey.js'
import { resolveTargetGrade, targetGradeLabel, targetGradeForPrompt } from '../src/utils/gradeTargets.js'
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

console.log(`\n${n} checks passed`)
