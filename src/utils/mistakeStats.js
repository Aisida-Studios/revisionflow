// src/utils/mistakeStats.js
// Aggregate views over a student's mistake log. Pass in mistakes already filtered to the current
// subject instances; nothing is estimated - every figure is a count or sum of recorded fields.

const UNCATEGORISED = 'Not categorised'
const NO_TOPIC = 'No topic recorded'

const marks = (m) => (typeof m.marksLost === 'number' && m.marksLost > 0 ? m.marksLost : 0)

export function summariseMistakes(mistakes, { limit = 5 } = {}) {
  const list = mistakes || []
  const open = list.filter(m => !m.resolved)
  const byCategory = new Map()
  const byTopic = new Map()

  for (const m of list) {
    const cat = m.category || UNCATEGORISED
    const c = byCategory.get(cat) || { category: cat, count: 0, openCount: 0, marksLost: 0 }
    c.count++; c.marksLost += marks(m); if (!m.resolved) c.openCount++
    byCategory.set(cat, c)

    const topic = (m.topic || '').trim() || NO_TOPIC
    const key = m.subject + '::' + topic.toLowerCase()
    const t = byTopic.get(key) || { subject: m.subject, topic, count: 0, openCount: 0, marksLost: 0, openMarksLost: 0 }
    t.count++; t.marksLost += marks(m)
    if (!m.resolved) { t.openCount++; t.openMarksLost += marks(m) }
    byTopic.set(key, t)
  }

  return {
    total: list.length,
    unresolved: open.length,
    resolved: list.length - open.length,
    openMarksLost: open.reduce((s, m) => s + marks(m), 0),
    byPriority: {
      high: open.filter(m => m.priority === 'high').length,
      medium: open.filter(m => m.priority === 'medium').length,
      low: open.filter(m => m.priority === 'low').length,
    },
    byCategory: [...byCategory.values()].sort((a, b) => b.count - a.count || a.category.localeCompare(b.category)).slice(0, limit),
    // Topics still costing marks first: that is where revising helps most.
    byTopic: [...byTopic.values()]
      .filter(t => t.openCount > 0)
      .sort((a, b) => b.openMarksLost - a.openMarksLost || b.openCount - a.openCount || a.topic.localeCompare(b.topic))
      .slice(0, limit),
  }
}
