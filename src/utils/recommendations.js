// src/utils/recommendations.js
//
// Calendar's "Recommended topics" — scores the student's own topics against real,
// already-collected data and explains itself in plain, checkable terms. Every signal
// below comes from something the student actually did or set:
//   - confidence          -> users/{uid}/topics (see firestore.getTopicsWithConfidence)
//   - exam proximity      -> profile.examDates
//   - unresolved mistakes -> users/{uid}/mistakes (see Mistakes.jsx)
//   - staleness           -> topic.updatedAt (when its confidence was last touched)
//   - planned workload    -> sessions already on the calendar for that subject
//
// Nothing here is invented or "AI thinks" — computeWeakTopics/confidence-band language
// already exists in gradeInsights.js and is reused rather than re-derived, so this can't
// silently drift from what the Dashboard's own weak-topics widget considers "weak".
//
// This module only SCORES and EXPLAINS. It never writes to Firestore and never touches
// the calendar — turning a recommendation into an actual scheduled session is a separate,
// explicit action the student takes (see Calendar.jsx's "Schedule" button), never automatic.

import { daysUntilExam } from './examUtils'
import { todayLocalStr, toLocalDateStr, addLocalDays } from './localDate'

const MS_PER_DAY = 1000 * 60 * 60 * 24

// Every point a topic can earn or lose, in one place. Nothing else in this file decides priority.
// A recommendation's score is the sum of the factors that apply to it, and each factor that adds
// points also contributes the sentence the student sees under "Why this topic?".
export const RECOMMENDATION_WEIGHTS = Object.freeze({
  lowConfidencePerStep: 30, // x (3 - confidence) when confidence <= 2   -> 30 (rated 2) or 60 (rated 1)
  examWithin14Days: 25,
  examWithin30Days: 10,
  unresolvedMistake: 20,    // once per topic, however many mistakes are logged against it
  idlePerWeek: 3,           // x whole weeks since last revised, once idle >= 14 days
  idleCap: 15,
  heavyWorkloadPenalty: -15, // subject already has >= heavyWorkloadSessions planned in the next 7 days
  heavyWorkloadSessions: 3,
  maxReasons: 3,
})

function daysSince(timestampSeconds) {
  if (!timestampSeconds) return null
  return Math.floor((Date.now() - timestampSeconds * 1000) / MS_PER_DAY)
}

// Nearest upcoming exam date (days from now) for a subject, or null if none set.
function nearestExamDays(subject, examDates) {
  const matches = (examDates || []).filter(e => e.subject === subject)
  if (!matches.length) return null
  const days = matches.map(e => daysUntilExam(e.examDate)).filter(d => d != null && d >= 0)
  return days.length ? Math.min(...days) : null
}

// How many revision sessions are already scheduled for this subject in the next 7 days -
// used to gently de-weight subjects that are already well covered, rather than piling
// more recommendations onto a subject the student has already planned for.
function plannedSessionsNext7Days(subject, sessions, todayStr) {
  const in7Str = toLocalDateStr(addLocalDays(todayStr, 7))
  return (sessions || []).filter(s =>
    !s.isTask && s.subject === subject && s.date >= todayStr && s.date <= in7Str
  ).length
}

// When the student last actually revised this topic: the later of (a) when they last re-rated it
// and (b) their most recent COMPLETED session on that topic. Rating a topic is a weak signal on its
// own, so a finished session on the topic counts as revision too.
function lastRevisedSeconds(topic, sessions) {
  let latest = topic.updatedAt?.seconds || 0
  const name = (topic.name || '').toLowerCase().trim()
  for (const s of sessions || []) {
    if (!s.completed || s.isTask || s.subject !== topic.subjectId) continue
    if ((s.topic || '').toLowerCase().trim() !== name) continue
    const t = s.completedAt?.seconds || 0
    if (t > latest) latest = t
  }
  return latest || null
}

/**
 * topics:    getTopicsWithConfidence() result - { id, subjectId, name, confidence, updatedAt, ... }
 * mistakes:  getMistakes() result, filtered/unfiltered is fine - { subject, topic, resolved, ... }
 * examDates: profile.examDates - { subject, examDate, ... }
 * sessions:  Calendar's own loaded sessions/tasks array (for workload dampening and revision recency)
 * limit:     max recommendations to return
 *
 * Each result: { id, subject, topic, board, confidence, score, reasons: string[1..3], factors }.
 * `reasons` is what the UI shows under "Why this topic?"; `factors` lists every scoring component
 * with its points so the ranking can always be traced back to explicit weights.
 */
export function computeTopicRecommendations({ topics, mistakes = [], examDates = [], sessions = [], limit = 6 }) {
  const W = RECOMMENDATION_WEIGHTS
  const todayStr = todayLocalStr()

  const unresolvedMistakesByKey = {}
  for (const m of mistakes) {
    if (m.resolved) continue
    const key = m.subject + '::' + (m.topic || '').toLowerCase().trim()
    ;(unresolvedMistakesByKey[key] ||= []).push(m)
  }

  const scored = (topics || [])
    // A topic that's never been rated (confidence null/0) shouldn't show up as a
    // confident recommendation.
    .filter(t => t.subjectId && (t.confidence || 0) > 0)
    .map(t => {
      const factors = [] // { key, points, text }

      // Weakness - the dominant signal. confidence*20 matches the exact percentage
      // language already shown elsewhere in the app (Dashboard's weak-topics widget).
      if (t.confidence <= 2) {
        factors.push({
          key: 'low_confidence',
          points: (3 - t.confidence) * W.lowConfidencePerStep,
          text: `${t.confidence * 20}% confidence - one of your lower-rated topics in ${t.subjectId}`,
        })
      }

      // Exam proximity
      const examDays = nearestExamDays(t.subjectId, examDates)
      if (examDays != null) {
        if (examDays <= 14) {
          factors.push({ key: 'exam_soon', points: W.examWithin14Days, text: `${t.subjectId} exam in ${examDays} day${examDays === 1 ? '' : 's'}` })
        } else if (examDays <= 30) {
          factors.push({ key: 'exam_close', points: W.examWithin30Days, text: `${t.subjectId} exam in ${examDays} days` })
        }
      }

      // Unresolved mistake logged against this exact topic. If both records carry a subject
      // instance key they must match, so another board's topic of the same name can't collide.
      const mistakeKey = t.subjectId + '::' + (t.name || '').toLowerCase().trim()
      const topicMistakes = (unresolvedMistakesByKey[mistakeKey] || [])
        .filter(m => !(m.subjectKey && t.subjectKey) || m.subjectKey === t.subjectKey)
      if (topicMistakes.length) {
        factors.push({
          key: 'unresolved_mistakes',
          points: W.unresolvedMistake,
          text: `You logged ${topicMistakes.length > 1 ? topicMistakes.length + ' unresolved mistakes' : 'an unresolved mistake'} here`,
        })
      }

      // Time since last revised - every topic reaching this point has been rated at least once.
      const idleDays = daysSince(lastRevisedSeconds(t, sessions))
      if (idleDays != null && idleDays >= 14) {
        factors.push({
          key: 'idle',
          points: Math.min(W.idleCap, Math.floor(idleDays / 7) * W.idlePerWeek),
          text: `Not revisited in ${idleDays >= 21 ? Math.floor(idleDays / 7) + ' weeks' : idleDays + ' days'}`,
        })
      }

      // Workload dampening - if this subject already has several sessions planned this week,
      // pull it down rather than piling on more of the same recommendation.
      let score = factors.reduce((sum, f) => sum + f.points, 0)
      if (plannedSessionsNext7Days(t.subjectId, sessions, todayStr) >= W.heavyWorkloadSessions) {
        score += W.heavyWorkloadPenalty
        factors.push({ key: 'heavy_workload', points: W.heavyWorkloadPenalty, text: null })
      }

      // At most three reasons, strongest first, so "Why this topic?" stays short and concrete.
      const reasons = factors
        .filter(f => f.text && f.points > 0)
        .sort((a, b) => b.points - a.points)
        .slice(0, W.maxReasons)
        .map(f => f.text)

      return { id: t.id, subject: t.subjectId, topic: t.name, board: t.board, confidence: t.confidence, score, reasons, factors }
    })
    .filter(r => r.score > 0 && r.reasons.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return scored
}
