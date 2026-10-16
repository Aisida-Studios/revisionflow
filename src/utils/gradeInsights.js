// src/utils/gradeInsights.js
//
// Estimated grade per subject, plus the student's current weakest topics.
//
// The estimate is a deterministic, explainable weighted model over evidence the student has
// actually produced - never an AI guess and never an official prediction. Every number that
// feeds it is returned in `factors` / `adjustments`, so the UI can show exactly how a grade was
// reached (see PREDICTION_WEIGHTS below for every constant).
//
// It maps blended percentages onto GENERIC percentage bands. That is NOT the per-paper
// grade-boundary lookup PastPapers.jsx does for a single paper's real marks (data/paperDatabase.js,
// which carries boundary provenance); real boundaries differ every paper, so this stays an
// estimate and is labelled as one.

import { toLocalDateStr, parseLocalDate, addLocalDays, diffLocalDays } from './localDate'

const GCSE_BANDS = [
  [90, '9'], [80, '8'], [70, '7'], [60, '6'], [50, '5'],
  [40, '4'], [30, '3'], [20, '2'], [10, '1'], [0, 'U'],
]
const ALEVEL_BANDS = [
  [90, 'A*'], [80, 'A'], [70, 'B'], [60, 'C'], [50, 'D'], [40, 'E'], [0, 'U'],
]
// AS-Level has no A* — kept as a separate table rather than reusing ALEVEL_BANDS.slice(1)
// so the two scales can't silently drift together if one changes later.
const ASLEVEL_BANDS = [
  [80, 'A'], [70, 'B'], [60, 'C'], [50, 'D'], [40, 'E'], [0, 'U'],
]

export function percentToGrade(pct, qualification) {
  const bands = qualification === 'A-Level' ? ALEVEL_BANDS
    : qualification === 'AS-Level' ? ASLEVEL_BANDS
    : GCSE_BANDS
  for (const [min, grade] of bands) {
    if (pct >= min) return grade
  }
  return bands[bands.length - 1][1]
}

// Confidence (1-5 self-rating) mapped to an implied percentage, for blending only -
// never shown to the user directly.
export function confidenceToPercent(confidence) {
  return { 1: 25, 2: 42, 3: 58, 4: 75, 5: 90 }[confidence] ?? 58
}

// Midpoint percentage of a grade's band (e.g. GCSE '6' -> 65). Used to turn a stated starting or
// current grade into a prior. Returns null for a grade this qualification doesn't have.
export function gradeToPercent(grade, qualification) {
  const bands = bandsFor(qualification)
  const i = bands.findIndex(([, g]) => String(g).toUpperCase() === String(grade || '').trim().toUpperCase())
  if (i === -1) return null
  const upper = i === 0 ? 100 : bands[i - 1][0]
  return Math.round((bands[i][0] + upper) / 2)
}

function bandsFor(qualification) {
  return qualification === 'A-Level' ? ALEVEL_BANDS
    : qualification === 'AS-Level' ? ASLEVEL_BANDS
    : GCSE_BANDS
}

// topics: raw docs from getTopicsWithConfidence - { subjectId, confidence, name, board,
// qualification, updatedAt, ... }. confidence is null/0 until the student actually rates
// a topic (see Topics.jsx handleSeedTopics) - only a genuine 1-5 rating counts here, so an
// unrated topic never gets treated as "weak".
export function computeWeakTopics(topics, limit = 6) {
  return (topics || [])
    .filter(t => (t.confidence || 0) > 0 && t.confidence <= 2 && t.subjectId)
    .sort((a, b) => (a.confidence || 0) - (b.confidence || 0) || (a.updatedAt?.seconds || 0) - (b.updatedAt?.seconds || 0))
    .slice(0, limit)
    .map(t => ({
      id: t.id, name: t.name, subject: t.subjectId,
      board: t.board, qualification: t.qualification, confidence: t.confidence || 0,
    }))
}

// ── The model ────────────────────────────────────────────────────────────────────────────
// Every constant that shapes an estimate lives here.
export const PREDICTION_WEIGHTS = Object.freeze({
  // Base weight of each evidence factor. A factor with no data drops out and the rest are
  // re-normalised, so the weights below only ever express relative importance.
  papers: 0.40,        // recency-weighted % of the most recent papers
  questions: 0.10,     // % on extended-answer questions (>= 4 marks) from question-level breakdowns
  quizzes: 0.20,       // recency-weighted % of the most recent quizzes
  topicMastery: 0.20,  // average of rated-topic confidence (self-assessed, so the weakest evidence)
  priorGrade: 0.10,    // the student's stated current grade, else their starting grade
  maxPapers: 5,
  maxQuizzes: 10,
  minExtendedQuestions: 3,   // extended-answer questions needed before that factor counts
  extendedQuestionMarks: 4,
  masteryFullWeightAt: 0.5,  // topic mastery has full weight once half the topics are rated
  // The prior fades as real results accumulate (it never drops below this share of its weight).
  priorFloor: 0.25,
  priorFadesOverEvidence: 6, // papers + half-quizzes at which the prior is at its floor
  // Study consistency nudges the estimate by at most +/- this many percentage points.
  consistencyMaxPoints: 3,
  consistencyWindowDays: 14,
  consistencyLowDays: 1,     // studied on this many days or fewer -> full negative nudge
  consistencyHighDays: 9,    // studied on this many days or more  -> full positive nudge
  // Recency decay between successive results (1 = newest). Closer to the exam = steeper decay,
  // so recent form counts for more as the exam approaches.
  decayFar: 0.9,             // exam 180+ days away (or no date set: 0.85)
  decayNear: 0.7,            // exam today
  decayNoDate: 0.85,
  decayHorizonDays: 180,
  // Likely-range half-width, in percentage points, by how much evidence there is.
  marginLimited: 12, marginModerate: 8, marginGood: 5,
})

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

function daysToNearestExam(subject, examDates, todayStr) {
  const days = (examDates || [])
    .filter(e => e.subject === subject && e.examDate)
    .map(e => diffLocalDays(todayStr, String(e.examDate).slice(0, 10)))
    .filter(d => Number.isFinite(d) && d >= 0)
  return days.length ? Math.min(...days) : null
}

function decayFor(daysToExam) {
  const W = PREDICTION_WEIGHTS
  if (daysToExam == null) return W.decayNoDate
  const nearness = 1 - Math.min(daysToExam, W.decayHorizonDays) / W.decayHorizonDays // 0 far .. 1 exam day
  return clamp(W.decayFar - (W.decayFar - W.decayNear) * nearness, W.decayNear, W.decayFar)
}

// Weighted mean of values ordered newest -> oldest, weights decay^0, decay^1, ...
function recencyWeightedMean(values, decay) {
  let num = 0, den = 0
  values.forEach((v, i) => { const w = Math.pow(decay, i); num += v * w; den += w })
  return den ? num / den : null
}

function attemptTime(p) {
  if (p.attemptDate) { const d = parseLocalDate(p.attemptDate); if (d) return d.getTime() }
  return (p.createdAt?.seconds || 0) * 1000
}

// Distinct local days in the last `windowDays` on which a session for this subject was COMPLETED.
function studyDaysInWindow(subject, sessions, todayStr, windowDays) {
  const earliest = toLocalDateStr(addLocalDays(todayStr, -(windowDays - 1)))
  const days = new Set()
  for (const s of sessions || []) {
    if (!s.completed || s.isTask || s.subject !== subject || !s.date) continue
    if (s.date >= earliest && s.date <= todayStr) days.add(s.date)
  }
  return days.size
}

function consistencyPoints(studyDays) {
  const W = PREDICTION_WEIGHTS
  const t = clamp((studyDays - W.consistencyLowDays) / (W.consistencyHighDays - W.consistencyLowDays), 0, 1)
  return Math.round((-W.consistencyMaxPoints + 2 * W.consistencyMaxPoints * t) * 10) / 10
}

function plural(n, word) { return `${n} ${word}${n === 1 ? '' : 's'}` }

/**
 * Estimated grade per subject the student has real results in.
 *
 * Requires at least one real quiz or paper result - confidence alone isn't evidence on its own
 * (a subject with nothing but unrated topics gets no estimate rather than a fabricated-looking
 * one). Only the student's CURRENTLY active subjects are estimated. paperAttempts / quizResults /
 * topics should already be filtered to each subject's current subject instance before being passed
 * in (see filterToCurrentSubjectInstance in utils/subjectKey.js) - this function decides which
 * subjects have enough data, it doesn't re-derive what "current" means.
 *
 * options (all optional):
 *   sessions   - the student's sessions; enables the study-consistency adjustment
 *   examDates  - defaults to profile.examDates; enables exam-proximity recency weighting
 *   now        - Date, for tests
 *
 * Backward compatible: `grade`, `percentage` and `sources.{papers,quizzes,topicsRated}` are
 * unchanged. New: evidenceSummary, coverage, range, factors, adjustments, notes.
 */
export function computeSubjectPredictions(topics, paperAttempts, quizResults, profile, options = {}) {
  const W = PREDICTION_WEIGHTS
  const activeSubjects = profile?.subjects || []
  const sessions = Array.isArray(options.sessions) ? options.sessions : null
  const examDates = options.examDates || profile?.examDates || []
  const todayStr = toLocalDateStr(options.now || new Date())

  const out = []
  for (const subjProfile of activeSubjects) {
    const subject = subjProfile.name
    const qualification = subjProfile.qualification || profile?.qualification || 'GCSE'

    const allPapers = (paperAttempts || [])
      .filter(p => p.subject === subject && p.percentage != null)
      .sort((a, b) => attemptTime(b) - attemptTime(a))
    const papers = allPapers.slice(0, W.maxPapers)
    const quizzes = (quizResults || [])
      .filter(q => q.subject === subject && q.percentage != null)
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, W.maxQuizzes)
    if (!papers.length && !quizzes.length) continue

    const subjTopics = (topics || []).filter(t => t.subjectId === subject)
    const board = subjProfile.board || subjTopics[0]?.board || papers[0]?.board || 'AQA'
    const daysToExam = daysToNearestExam(subject, examDates, todayStr)
    const decay = decayFor(daysToExam)

    // ── Evidence factors (each: a percentage and a base weight) ──
    const factors = []

    const paperPct = recencyWeightedMean(papers.map(p => p.percentage), decay)
    if (paperPct != null) {
      factors.push({ key: 'papers', label: 'Recent past papers', valuePct: paperPct, baseWeight: W.papers,
        detail: `${plural(papers.length, 'paper')}, newest counted most` })
    }

    // Question-level: extended-answer questions (>= 4 marks) across the papers with a breakdown.
    let qScored = 0, qMax = 0, qCount = 0
    for (const p of papers) {
      for (const q of p.questionMarks || []) {
        const max = Number(q.marks), got = Number(q.scored)
        if (max >= W.extendedQuestionMarks && Number.isFinite(got)) { qScored += got; qMax += max; qCount++ }
      }
    }
    if (qCount >= W.minExtendedQuestions && qMax > 0) {
      factors.push({ key: 'questions', label: 'Extended-answer questions', valuePct: (qScored / qMax) * 100, baseWeight: W.questions,
        detail: `${plural(qCount, 'question')} worth ${W.extendedQuestionMarks}+ marks` })
    }

    const quizPct = recencyWeightedMean(quizzes.map(q => q.percentage), decay)
    if (quizPct != null) {
      factors.push({ key: 'quizzes', label: 'Recent quizzes', valuePct: quizPct, baseWeight: W.quizzes,
        detail: `${plural(quizzes.length, 'quiz')}, newest counted most` })
    }

    const ratedTopics = subjTopics.filter(t => (t.confidence || 0) > 0)
    if (ratedTopics.length) {
      const ratedFraction = subjTopics.length ? ratedTopics.length / subjTopics.length : 1
      const masteryPct = ratedTopics.reduce((s, t) => s + confidenceToPercent(t.confidence), 0) / ratedTopics.length
      const scale = Math.min(1, ratedFraction / W.masteryFullWeightAt)
      factors.push({ key: 'topicMastery', label: 'Topic confidence', valuePct: masteryPct, baseWeight: W.topicMastery * scale,
        detail: `${ratedTopics.length} of ${subjTopics.length} topics rated${scale < 1 ? ' (counts for less until half are rated)' : ''}` })
    }

    const stated = subjProfile.currentGrade || profile?.startingGrades?.[subject]
    const priorPct = stated ? gradeToPercent(stated, qualification) : null
    const realEvidence = Math.min(papers.length + quizzes.length * 0.5, W.priorFadesOverEvidence)
    if (priorPct != null) {
      const fade = Math.max(W.priorFloor, 1 - realEvidence / W.priorFadesOverEvidence)
      factors.push({ key: 'priorGrade', label: subjProfile.currentGrade ? 'Your current grade' : 'Your starting grade', valuePct: priorPct,
        baseWeight: W.priorGrade * fade, detail: `${stated} - counts for less as real results build up` })
    }

    // Normalise the weights of whichever factors have data.
    const totalWeight = factors.reduce((s, f) => s + f.baseWeight, 0)
    factors.forEach(f => { f.weight = f.baseWeight / totalWeight })
    let blended = factors.reduce((s, f) => s + f.valuePct * f.weight, 0)

    // ── Adjustments ──
    const adjustments = []
    if (sessions) {
      const days = studyDaysInWindow(subject, sessions, todayStr, W.consistencyWindowDays)
      const pts = consistencyPoints(days)
      blended += pts
      adjustments.push({ key: 'consistency', label: 'Study consistency', points: pts,
        detail: `Studied ${subject} on ${days} of the last ${W.consistencyWindowDays} days` })
    }
    const blendedPct = Math.round(clamp(blended, 0, 100))

    // ── Evidence coverage ──
    const evidenceScore = Math.min(papers.length, W.maxPapers) * 2 + Math.min(quizzes.length, W.maxQuizzes) * 0.5 + (ratedTopics.length >= 5 ? 1 : 0)
    const coverage = evidenceScore >= 6 ? 'good' : evidenceScore >= 3 ? 'moderate' : 'limited'
    const margin = coverage === 'good' ? W.marginGood : coverage === 'moderate' ? W.marginModerate : W.marginLimited
    const low = percentToGrade(clamp(blendedPct - margin, 0, 100), qualification)
    const high = percentToGrade(clamp(blendedPct + margin, 0, 100), qualification)

    const parts = []
    if (papers.length) parts.push(plural(papers.length, 'paper'))
    if (quizzes.length) parts.push(plural(quizzes.length, 'quiz').replace('quizs', 'quizzes'))
    if (ratedTopics.length) parts.push(`${plural(ratedTopics.length, 'rated topic')}`)
    const evidenceSummary = 'Based on ' + (parts.length > 1 ? parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1] : parts[0])

    const notes = ['Estimated from generic percentage bands - real grade boundaries differ for every paper.']
    if (daysToExam != null && daysToExam > 60) notes.push(`Your exam is ${daysToExam} days away, so this is where you are now, not a forecast of exam day.`)
    if (!sessions) notes.push('Study consistency was not included.')

    out.push({
      subject, board, qualification,
      grade: percentToGrade(blendedPct, qualification),
      percentage: blendedPct,
      label: 'Estimated grade',
      estimated: true,
      range: { low, high, marginPct: margin },
      coverage,
      evidenceSummary,
      sources: { papers: papers.length, quizzes: quizzes.length, topicsRated: ratedTopics.length, extendedQuestions: qCount },
      factors: factors.map(f => ({ key: f.key, label: f.label, valuePct: Math.round(f.valuePct), weight: Math.round(f.weight * 100) / 100, detail: f.detail })),
      adjustments,
      daysToExam,
      notes,
    })
  }
  return out.sort((a, b) => a.percentage - b.percentage) // weakest subject first - most actionable
}
