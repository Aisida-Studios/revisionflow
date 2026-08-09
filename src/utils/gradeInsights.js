// src/utils/gradeInsights.js
//
// Blends quiz history + past paper scores + confidence ratings into a rough predicted
// grade per subject, and surfaces the student's current weakest topics.
//
// This is deliberately a simpler, generic percentage-band estimate — NOT the calibrated,
// per-subject grade-boundary lookup PastPapers.jsx already does properly for a single
// paper's actual marks (see data/paperDatabase.js). A blended estimate across three
// different signal types can't honestly claim that precision, so it's presented as a
// rough indicator rather than an official prediction.

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

// Confidence (1-5 self-rating) mapped to an implied percentage, for blending only —
// never shown to the user directly.
export function confidenceToPercent(confidence) {
  return { 1: 25, 2: 42, 3: 58, 4: 75, 5: 90 }[confidence] ?? 58
}

// topics: raw docs from getTopicsWithConfidence — { subjectId, confidence, name, board,
// qualification, updatedAt, ... }. Only confidence <= 2 counts as "weak" — 3 is the
// default every topic is seeded at (see Topics.jsx handleSeedTopics), not necessarily a
// genuine self-rating, so treating it as "weak" would flood this list with unrated topics.
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

// Blends quiz history + past paper scores + confidence ratings into a rough predicted
// grade, per subject the student has actually done something in. Requires at least one
// real quiz or paper result — confidence alone (especially the untouched default of 3)
// isn't real evidence, so a subject with nothing but default-rated topics gets no
// prediction rather than a fabricated-looking one.
export function computeSubjectPredictions(topics, paperAttempts, quizResults, profile) {
  const subjects = new Set([
    ...(paperAttempts || []).map(p => p.subject),
    ...(quizResults || []).map(q => q.subject),
  ].filter(Boolean))

  const out = []
  for (const subject of subjects) {
    const papers = (paperAttempts || []).filter(p => p.subject === subject && p.percentage != null)
    const quizzes = (quizResults || [])
      .filter(q => q.subject === subject && q.percentage != null)
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 10) // most recent 10 — recent performance should count more than a stale average
    if (!papers.length && !quizzes.length) continue

    const subjTopics = (topics || []).filter(t => t.subjectId === subject)
    const ratedTopics = subjTopics.filter(t => (t.confidence || 0) > 0 && t.confidence !== 3)
    const confidencePct = ratedTopics.length
      ? ratedTopics.reduce((s, t) => s + confidenceToPercent(t.confidence), 0) / ratedTopics.length
      : null

    const paperAvg = papers.length ? papers.reduce((s, p) => s + p.percentage, 0) / papers.length : null
    const quizAvg  = quizzes.length ? quizzes.reduce((s, q) => s + q.percentage, 0) / quizzes.length : null

    // Weight whichever sources actually have data for this subject; real papers count for
    // the most (closest to genuine exam conditions), confidence for the least.
    const weighted = [[paperAvg, 0.5], [quizAvg, 0.3], [confidencePct, 0.2]].filter(([v]) => v != null)
    const totalWeight = weighted.reduce((s, [, w]) => s + w, 0)
    const blendedPct = Math.round(weighted.reduce((s, [v, w]) => s + v * w, 0) / totalWeight)

    const subjProfile = profile?.subjects?.find(s => s.name === subject)
    const qualification = subjProfile?.qualification || subjTopics[0]?.qualification || profile?.qualification || 'GCSE'
    const board = subjProfile?.board || subjTopics[0]?.board || papers[0]?.board || 'AQA'

    out.push({
      subject, board, qualification,
      grade: percentToGrade(blendedPct, qualification),
      percentage: blendedPct,
      sources: { papers: papers.length, quizzes: quizzes.length, topicsRated: ratedTopics.length },
    })
  }
  return out.sort((a, b) => a.percentage - b.percentage) // weakest subject first — most actionable
}
