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

const MS_PER_DAY = 1000 * 60 * 60 * 24

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

// How many revision sessions are already scheduled for this subject in the next 7 days —
// used to gently de-weight subjects that are already well covered, rather than piling
// more recommendations onto a subject the student has already planned for.
function plannedSessionsNext7Days(subject, sessions, todayStr) {
  const in7 = new Date(); in7.setDate(in7.getDate() + 7)
  const in7Str = in7.getFullYear() + '-' + String(in7.getMonth() + 1).padStart(2, '0') + '-' + String(in7.getDate()).padStart(2, '0')
  return (sessions || []).filter(s =>
    !s.isTask && s.subject === subject && s.date >= todayStr && s.date <= in7Str
  ).length
}

/**
 * topics:    getTopicsWithConfidence() result — { id, subjectId, name, confidence, updatedAt, ... }
 * mistakes:  getMistakes() result, filtered/unfiltered is fine — { subject, topic, resolved, ... }
 * examDates: profile.examDates — { subject, examDate, ... }
 * sessions:  Calendar's own loaded sessions/tasks array (for workload dampening)
 * limit:     max recommendations to return
 */
export function computeTopicRecommendations({ topics, mistakes = [], examDates = [], sessions = [], limit = 6 }) {
  const todayStr = (() => {
    const d = new Date()
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
  })()

  const unresolvedMistakesByKey = {}
  for (const m of mistakes) {
    if (m.resolved) continue
    const key = m.subject + '::' + (m.topic || '').toLowerCase().trim()
    ;(unresolvedMistakesByKey[key] ||= []).push(m)
  }

  const scored = (topics || [])
    // Same "3 is the unrated default, not real evidence" rule computeWeakTopics uses —
    // a topic nobody has actually rated shouldn't show up as a confident recommendation.
    .filter(t => t.subjectId && (t.confidence || 0) > 0)
    .map(t => {
      const reasons = []
      let score = 0

      // Weakness — the dominant signal. confidence*20 matches the exact percentage
      // language already shown elsewhere in the app (Dashboard's weak-topics widget).
      const confPct = (t.confidence || 3) * 20
      if (t.confidence <= 2) {
        score += (3 - t.confidence) * 30
        reasons.push(`${confPct}% confidence — one of your lower-rated topics in ${t.subjectId}`)
      }

      // Exam proximity
      const examDays = nearestExamDays(t.subjectId, examDates)
      if (examDays != null) {
        if (examDays <= 14) { score += 25; reasons.push(`${t.subjectId} exam in ${examDays} day${examDays === 1 ? '' : 's'}`) }
        else if (examDays <= 30) { score += 10 }
      }

      // Unresolved mistake logged against this exact topic
      const mistakeKey = t.subjectId + '::' + (t.name || '').toLowerCase().trim()
      const topicMistakes = unresolvedMistakesByKey[mistakeKey] || []
      if (topicMistakes.length) {
        score += 20
        reasons.push(`You logged ${topicMistakes.length > 1 ? topicMistakes.length + ' unresolved mistakes' : 'an unresolved mistake'} here`)
      }

      // Staleness — only meaningful once a topic has actually been rated (updatedAt on a
      // never-touched default-3 topic is just whenever it was seeded, not "last revised").
      const idleDays = daysSince(t.updatedAt?.seconds)
      if (idleDays != null && idleDays >= 14 && t.confidence !== 3) {
        score += Math.min(15, Math.floor(idleDays / 7) * 3)
        reasons.push(`Not revisited in ${idleDays >= 21 ? Math.floor(idleDays / 7) + ' weeks' : idleDays + ' days'}`)
      }

      // Workload dampening — if this subject already has 3+ sessions planned this week,
      // pull it down rather than piling on more of the same recommendation.
      const planned = plannedSessionsNext7Days(t.subjectId, sessions, todayStr)
      if (planned >= 3) score -= 15

      return { id: t.id, subject: t.subjectId, topic: t.name, board: t.board, confidence: t.confidence, score, reasons }
    })
    .filter(r => r.score > 0 && r.reasons.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return scored
}
