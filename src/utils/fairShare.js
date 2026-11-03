// src/utils/fairShare.js
// Fair-share rotation for the revision schedule generator (utils/scheduler.js). No dependencies, so it is covered by
// tests/utils.test.js.
//
// Everyone who can be picked (a subject, or a topic within a paper) has a WEIGHT (1 unless told otherwise) and a running
// total of the minutes they have already been given. The next pick is whoever is furthest BELOW their fair share, which
// means the smallest minutes / weight. So:
//   - equal weights give equal minutes. Nobody is favoured for being first in a list;
//   - a weight of 2 gives about twice the minutes of a weight of 1.
// Ties go to whoever was picked longest ago (never picked comes first), then to list order. That tie-break is what keeps
// the rotation moving. The generator used to fall back to list order every day, so the first subjects in a profile
// took most of the slots.

// How many times the hours of an ordinary subject a subject marked "High priority" gets.
export const PRIORITY_WEIGHT = 2

const positive = (n) => (typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : 1)

// Who is further below their fair share goes first. Compared as used[a] * weight[b] < used[b] * weight[a], which is the
// same as used[a] / weight[a] < used[b] / weight[b] without dividing (so no rounding can create a false tie).
function fairer(a, b, used, weight, last, index) {
  const wa = positive(weight[a]), wb = positive(weight[b])
  const lhs = (used[a] || 0) * wb, rhs = (used[b] || 0) * wa
  if (lhs !== rhs) return lhs - rhs
  const la = last[a] === undefined ? -1 : last[a], lb = last[b] === undefined ? -1 : last[b]
  if (la !== lb) return la - lb
  return index[a] - index[b]
}

// `keys` in fairest-first order. `used`, `weight` and `last` are plain objects keyed by the same names.
export function fairOrder(keys, used = {}, weight = {}, last = {}) {
  const index = {}
  keys.forEach((k, i) => { index[k] = i })
  return [...keys].sort((a, b) => fairer(a, b, used, weight, last, index))
}

// The single fairest key, or undefined for an empty list.
export function pickFairest(keys, used = {}, weight = {}, last = {}) {
  return fairOrder(keys, used, weight, last)[0]
}

// A paper's focus topics in whatever shape the caller has: one name (the old behaviour), a list of names, or a list of
// { name, weight }. Empty names are dropped and a name that appears twice counts once.
export function normaliseTopics(focus) {
  if (!focus) return []
  if (typeof focus === 'string') return [{ name: focus, weight: 1 }]
  if (!Array.isArray(focus)) return []
  const seen = new Set()
  const out = []
  focus.forEach(t => {
    const name = typeof t === 'string' ? t : t && t.name
    if (!name || seen.has(name)) return
    seen.add(name)
    out.push({ name, weight: positive(typeof t === 'string' ? 1 : t.weight) })
  })
  return out
}

// A paper's focus topics for the generator: the topics the student has rated low (confidence 1 or 2; unrated and
// middling topics are never treated as weak), weakest first, each weighted by how weak. Equal confidence means equal
// weight, so equal hours. Returns [] when there is nothing to focus on.
export function weakTopicFocus(topicRows, subjectName, paperTopicNames) {
  const onPaper = new Set(paperTopicNames || [])
  return (topicRows || [])
    .filter(t => t && t.subjectId === subjectName && onPaper.has(t.name) && t.confidence > 0 && t.confidence <= 2)
    .sort((a, b) => (a.confidence - b.confidence) || String(a.name).localeCompare(String(b.name)))
    .map(t => ({ name: t.name, weight: 3 - t.confidence }))
}

// The state one generator pass keeps while it places sessions.
//   subjects         [{ name, priority }]  priority gives PRIORITY_WEIGHT
//   topicFocus       { 'Subject-paper': name | [names] | [{ name, weight }] }
//   existingSessions sessions already placed by an earlier pass over the same dates, so a second pass (school free
//                    periods) carries on from the first pass's totals instead of starting from zero
export function createFairShare({ subjects = [], topicFocus = {}, existingSessions = [] } = {}) {
  const used = {}, last = {}, weight = {}
  const topicUsed = {}, topicLast = {}
  let seq = 0
  subjects.forEach(s => { if (s && s.name) weight[s.name] = s.priority ? PRIORITY_WEIGHT : 1 })

  const share = {
    // The subjects (objects with a .name) fairest first.
    order(list) {
      const byName = new Map(list.map(s => [s.name, s]))
      return fairOrder(list.map(s => s.name), used, weight, last).map(name => byName.get(name))
    },
    // The topic the next content session on this paper should be about, or null when the paper has no focus topics.
    // It does not record anything: record() does that once the session has actually been placed.
    topicFor(subjectName, paper) {
      const key = `${subjectName}-${paper}`
      const topics = normaliseTopics(topicFocus[key])
      if (!topics.length) return null
      if (topics.length === 1) return topics[0].name
      const w = {}
      topics.forEach(t => { w[t.name] = t.weight })
      return pickFairest(topics.map(t => t.name), topicUsed[key] || {}, w, topicLast[key] || {})
    },
    // Count a session that has been placed.
    record(session) {
      if (!session || !session.subject) return
      const mins = Number(session.duration) > 0 ? Number(session.duration) : 0
      seq += 1
      used[session.subject] = (used[session.subject] || 0) + mins
      last[session.subject] = seq
      if (session.focusTopic && session.type === 'Content Revision') {
        const key = `${session.subject}-${session.paper}`
        if (!topicUsed[key]) { topicUsed[key] = {}; topicLast[key] = {} }
        topicUsed[key][session.focusTopic] = (topicUsed[key][session.focusTopic] || 0) + mins
        topicLast[key][session.focusTopic] = seq
      }
    },
    usedMinutes(subjectName) { return used[subjectName] || 0 },
  }
  ;(existingSessions || []).forEach(s => share.record(s))
  return share
}
