// src/utils/topicDisplay.js
// Small shared display helpers for the Topics list + Topic Detail pages. Both pages
// need the exact same confidence scale/colours and the same "unit – category: specifics"
// name-cleanup rule — previously each file kept its own copy of these, which is exactly
// the kind of thing that quietly drifts apart after a few edits in only one file. Kept in
// one place instead.

export const CONF_LABELS  = ['', 'Struggling', 'Needs work', 'Getting there', 'Good', 'Strong']
export const CONF_COLOURS = ['', 'var(--danger)', '#f97316', 'var(--warning)', '#84cc16', 'var(--success)']

// 'B1 – Cell Structure: Eukaryotic and Prokaryotic Cells' -> 'Cell Structure'.
// Many (not all) topic names in src/data/topics.js follow this "unit – category: specific"
// convention. Returns null when a name doesn't follow it — callers fall back to the full name.
export function parseCategory(name) {
  if (!name) return null
  const afterDash = name.includes(' – ') ? name.split(' – ')[1] : name
  if (!afterDash?.includes(':')) return null
  return afterDash.split(':')[0].trim() || null
}

// The name to actually show a student: the cleaned-up category when the naming convention
// applies, otherwise the topic's full raw name.
export function displayTopicName(name) {
  return parseCategory(name) || name
}

// Every topic doc has a `.paper` field (set when seeded from the spec, or 'Admin-added' for
// manually-added topics) — the only real, always-present structural grouping already in the
// data. Groups a topic array by paper, sorting numeric papers ascending and any non-numeric
// label (e.g. 'Admin-added') last. Returns [{ key, label, topics }, ...].
export function groupTopicsByPaper(topics) {
  const groups = new Map()
  for (const t of topics) {
    const key = t.paper != null && t.paper !== '' ? String(t.paper) : 'General'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(t)
  }
  const entries = Array.from(groups.entries())
  entries.sort(([a], [b]) => {
    const na = Number(a), nb = Number(b)
    const aNum = !Number.isNaN(na), bNum = !Number.isNaN(nb)
    if (aNum && bNum) return na - nb
    if (aNum) return -1
    if (bNum) return 1
    return a.localeCompare(b)
  })
  return entries.map(([key, ts]) => ({
    key,
    label: /^\d+$/.test(key) ? `Paper ${key}` : key,
    topics: ts,
  }))
}
