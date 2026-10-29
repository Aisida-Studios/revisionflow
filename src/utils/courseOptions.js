// src/utils/courseOptions.js
// Course options. Some courses let the student choose which blocks of topics they study (Further Maths
// applications, A-level Physics optional topic, History studies ...). TOPIC_OPTIONS in data/topics.js says which
// topics belong to which option; this file turns a student's choices into "which topics do I show".
//
// The choices live on the student's own subject entry, which is already private to them:
//   profile.subjects[i].options = { [slotId]: [optionId, ...] }
// Hiding is display-only. Nothing here deletes or edits a rating, note or mistake, so choosing a different option
// brings the earlier data straight back. A topic that is in no option is core and is always shown.
// Until a slot has a complete, valid choice nothing in that slot is hidden.
// A slot can depend on an earlier answer (slot.onlyIf = { slot, option }, for example the three WW1 text slots that
// only apply once "WW1 and its aftermath" is chosen). The chooser asks those slots only when they apply.

import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { TOPIC_OPTIONS } from '../data/topics'
import { canonicalBoard, DEFAULT_BOARD } from '../data/boards'
import { getSubjectQualification } from '../data/subjects'

// ── Finding the slots for a subject ───────────────────────────────────────
// Same level and board resolution as data/topics.js, so a subject always looks up the data its topics came from.
function levelKey(qualification) {
  if (!qualification || qualification === 'GCSE') return 'GCSE'
  if (['AS-Level', 'ASLEVEL', 'AS_LEVEL', 'AS'].includes(qualification)) return 'ASLEVEL'
  if (['A-Level', 'ALEVEL', 'A_LEVEL'].includes(qualification)) return 'ALEVEL'
  return null
}
const BOARD_KEYS = { WJEC: 'Eduqas/WJEC' }
const norm = s => String(s || '').trim().toLowerCase()

export function getOptionSlots(subjectName, board, qualification) {
  const level = levelKey(qualification)
  if (!level || !TOPIC_OPTIONS || !TOPIC_OPTIONS[level]) return []
  const canon = canonicalBoard(board) || DEFAULT_BOARD
  const entry = TOPIC_OPTIONS[level][BOARD_KEYS[canon] || canon]
  const slots = entry && entry[subjectName] && entry[subjectName].slots
  return Array.isArray(slots) ? slots : []
}

export function slotsForSubject(subject, profile) {
  return subject ? getOptionSlots(subject.name, subject.board, getSubjectQualification(subject, profile)) : []
}

export function hasOptions(subject, profile) {
  return slotsForSubject(subject, profile).length > 0
}

// ── Reading and checking a choice ─────────────────────────────────────────
function optionOf(slot, id) {
  return slot.options.find(o => o.id === id)
}

// The ids chosen for a slot, in the slot's own order, ignoring anything that is not an option of this slot.
export function chosenIds(subject, slot) {
  const raw = subject && subject.options && subject.options[slot.id]
  if (!Array.isArray(raw)) return []
  const set = new Set(raw)
  return slot.options.map(o => o.id).filter(id => set.has(id))
}

// Complete means exactly `pick` options, and every chosen option has everything it requires chosen too.
export function isSlotComplete(slot, ids) {
  const set = new Set(ids)
  if (set.size !== (slot.pick || 1)) return false
  return ids.every(id => ((optionOf(slot, id) || {}).requires || []).every(r => set.has(r)))
}

// Which choices the student has made, per slot: { [slotId]: [optionId, ...] }.
export function chosenMap(subject, slots) {
  return Object.fromEntries(slots.map(s => [s.id, chosenIds(subject, s)]))
}

// 'applies'  : ask it, and filter by it once it is complete.
// 'pending'  : it depends on an answer that has not been given yet. Not asked, nothing hidden, like an undecided option.
// 'excluded' : the answer it depends on was given and was a different option. Not asked, its topics are hidden.
// Answers already given for a slot that does not apply are kept, and used again if its condition becomes true.
export function slotState(slots, slot, chosen, seen = new Set()) {
  const cond = slot.onlyIf
  if (!cond || seen.has(slot.id)) return 'applies'
  const parent = slots.find(s => s.id === cond.slot)
  if (!parent) return 'applies'
  const parentState = slotState(slots, parent, chosen, new Set([...seen, slot.id]))
  if (parentState !== 'applies') return parentState
  const ids = chosen[parent.id] || []
  if (!isSlotComplete(parent, ids)) return 'pending'
  return ids.includes(cond.option) ? 'applies' : 'excluded'
}

export function applicableSlots(slots, chosen) {
  return slots.filter(slot => slotState(slots, slot, chosen) === 'applies')
}

export function needsOptionChoice(subject, profile) {
  const slots = slotsForSubject(subject, profile)
  const chosen = chosenMap(subject, slots)
  return applicableSlots(slots, chosen).some(slot => !isSlotComplete(slot, chosen[slot.id]))
}

// "Mechanics, Statistics" for a short summary line. Empty when nothing complete is chosen.
export function optionsSummary(subject, profile) {
  const slots = slotsForSubject(subject, profile)
  const chosen = chosenMap(subject, slots)
  const labels = []
  for (const slot of applicableSlots(slots, chosen)) {
    if (!isSlotComplete(slot, chosen[slot.id])) continue
    chosen[slot.id].forEach(id => labels.push(optionOf(slot, id).label))
  }
  return labels.join(', ')
}

// ── The chooser's rules ───────────────────────────────────────────────────
function requiredBy(slot, id, seen = new Set()) {
  const opt = optionOf(slot, id)
  for (const r of (opt && opt.requires) || []) {
    if (!seen.has(r)) { seen.add(r); requiredBy(slot, r, seen) }
  }
  return seen
}

function labelList(slot, ids) {
  const labels = ids.map(id => (optionOf(slot, id) || {}).label || id)
  return labels.length > 1 ? labels.slice(0, -1).join(', ') + ' and ' + labels[labels.length - 1] : labels[0] || ''
}

// Ticking an option also ticks what it requires; unticking an option also unticks whatever needs it. When that would
// go over `pick`, the earliest other choices make room. Returns the new ids and a short sentence saying what moved.
export function toggleOption(slot, ids, id) {
  const pick = slot.pick || 1
  const opt = optionOf(slot, id)
  if (!opt) return { ids, note: '' }
  const order = slot.options.map(o => o.id)
  const sorted = list => order.filter(x => list.includes(x))

  if (pick === 1) return { ids: [id], note: '' }

  if (ids.includes(id)) {
    const gone = new Set([id])
    let grew = true
    while (grew) {
      grew = false
      for (const o of slot.options) {
        if (!gone.has(o.id) && ids.includes(o.id) && (o.requires || []).some(r => gone.has(r))) { gone.add(o.id); grew = true }
      }
    }
    const others = [...gone].filter(x => x !== id)
    return {
      ids: sorted(ids.filter(x => !gone.has(x))),
      note: others.length ? labelList(slot, sorted(others)) + ' needs ' + opt.label + ', so it was removed too.' : '',
    }
  }

  const needed = [...requiredBy(slot, id), id]
  if (needed.length > pick) return { ids, note: opt.label + ' needs more options than this choice allows.' }
  let next = [...ids.filter(x => !needed.includes(x)), ...needed]
  const dropped = []
  while (next.length > pick) {
    // Make room with an option nothing else depends on first (earliest first), so Further Pure 1 + 2 becomes
    // Further Pure 1 + the new choice rather than losing both.
    const spare = next.filter(x => !needed.includes(x))
    const victim = spare.find(x => !next.some(y => y !== x && ((optionOf(slot, y) || {}).requires || []).includes(x))) || spare[0]
    if (!victim) break
    const gone = new Set([victim])
    let grew = true
    while (grew) {
      grew = false
      for (const o of slot.options) {
        if (!gone.has(o.id) && next.includes(o.id) && !needed.includes(o.id) && (o.requires || []).some(r => gone.has(r))) { gone.add(o.id); grew = true }
      }
    }
    next = next.filter(x => !gone.has(x))
    dropped.push(...gone)
  }
  const added = needed.filter(x => x !== id && !ids.includes(x))
  const parts = []
  if (added.length) parts.push(opt.label + ' needs ' + labelList(slot, sorted(added)) + ', so ' + (added.length > 1 ? 'those were' : 'that was') + ' added.')
  if (dropped.length) parts.push(labelList(slot, sorted(dropped)) + ' ' + (dropped.length > 1 ? 'were' : 'was') + ' removed to keep ' + pick + '.')
  return { ids: sorted(next), note: parts.join(' ') }
}

// ── Hiding topics ─────────────────────────────────────────────────────────
// Names (lower case) of the topics the student has not chosen. A slot without a complete choice hides nothing.
export function hiddenTopicNames(subject, profile) {
  const hidden = new Set()
  const shown = new Set()
  const slots = slotsForSubject(subject, profile)
  const chosen = chosenMap(subject, slots)
  for (const slot of slots) {
    const state = slotState(slots, slot, chosen)
    if (state === 'pending') continue
    if (state === 'excluded') {
      for (const o of slot.options) for (const t of o.topics || []) hidden.add(norm(t))
      continue
    }
    if (!isSlotComplete(slot, chosen[slot.id])) continue
    for (const o of slot.options) {
      const target = chosen[slot.id].includes(o.id) ? shown : hidden
      for (const t of o.topics || []) target.add(norm(t))
    }
  }
  shown.forEach(n => hidden.delete(n))
  return hidden
}

function subjectFor(profile, topic) {
  const name = topic.subjectId || topic.subject
  const subjects = (profile && profile.subjects) || []
  const sameName = subjects.filter(s => s.name === name)
  if (sameName.length <= 1) return sameName[0] || null
  return sameName.find(s =>
    (!topic.board || canonicalBoard(s.board) === canonicalBoard(topic.board)) &&
    (!topic.qualification || getSubjectQualification(s, profile) === topic.qualification)) || sameName[0]
}

// Topic documents ({ name, subjectId | subject, board, qualification }) the student should see.
export function filterTopicsByOptions(topics, profile) {
  const list = topics || []
  if (!list.length || !profile || !(profile.subjects || []).length) return list
  const cache = new Map()
  return list.filter(t => {
    const subject = subjectFor(profile, t)
    if (!subject) return true
    const key = subject.name + '|' + subject.board + '|' + getSubjectQualification(subject, profile)
    if (!cache.has(key)) cache.set(key, hiddenTopicNames(subject, profile))
    const hidden = cache.get(key)
    return hidden.size === 0 || !hidden.has(norm(t.name))
  })
}

// A list built for one subject, for example the result of getMergedTopicsFlat(board, subject, level).
export function filterSpecTopics(specTopics, subject, profile) {
  const list = specTopics || []
  const hidden = hiddenTopicNames(subject, profile)
  return hidden.size === 0 ? list : list.filter(t => !hidden.has(norm(t.name)))
}

export function isTopicHidden(topic, profile) {
  const subject = subjectFor(profile, topic)
  return !!subject && hiddenTopicNames(subject, profile).has(norm(topic.name))
}

// ── Saving ────────────────────────────────────────────────────────────────
// The subjects array with this subject's options replaced. Everything else on every subject is left alone.
export function withSubjectOptions(subjects, subject, options, profile) {
  const same = s => s.name === subject.name
    && canonicalBoard(s.board) === canonicalBoard(subject.board)
    && getSubjectQualification(s, profile) === getSubjectQualification(subject, profile)
  return (subjects || []).map(s => same(s) ? { ...s, options } : s)
}

// users/{uid} is owner-only in the Firestore rules and `subjects` is not a server-owned field, so no rule change
// is needed. Call refreshProfile() afterwards so every screen sees the choice.
export async function saveSubjectOptions(uid, profile, subject, options) {
  await updateDoc(doc(db, 'users', uid), { subjects: withSubjectOptions(profile.subjects, subject, options, profile) })
}
