// src/utils/topicVisibility.js
// Applies a student's course options (the optional papers or topics they did not choose) to plain lists of topics.
// utils/courseOptions.js decides WHICH topics are hidden (hiddenTopicNames); this file only removes them from a list,
// so it needs no Firebase and is covered by tests/utils.test.js. Hiding is display-only: nothing here deletes or edits
// a stored rating, note or mistake, so choosing a different option brings the earlier data straight back.

// Same normalisation as courseOptions.js: names are compared lower-case and trimmed.
export const topicKey = (name) => String(name || '').trim().toLowerCase()

// A list of topic names (strings) or topic objects ({ name }) without the hidden ones. `hidden` is the Set that
// hiddenTopicNames(subject, profile) returns. The same array comes back when nothing is hidden.
export function dropHiddenTopics(list, hidden) {
  const arr = Array.isArray(list) ? list : []
  if (!hidden || !hidden.size) return arr
  return arr.filter(t => !hidden.has(topicKey(typeof t === 'string' ? t : t && t.name)))
}

// { paperNumber: [topic names] } (the shape getTopicsForSubject returns) with the hidden topics removed from every
// paper. The input is never changed; the same object comes back when nothing is hidden.
export function dropHiddenFromPapers(papers, hidden) {
  if (!papers || typeof papers !== 'object') return {}
  if (!hidden || !hidden.size) return papers
  const out = {}
  Object.keys(papers).forEach(k => { out[k] = dropHiddenTopics(papers[k], hidden) })
  return out
}
