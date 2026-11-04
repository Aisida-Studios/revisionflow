// src/utils/dayFill.js
// Planning one day of study windows for the schedule generator (utils/scheduler.js). No dependencies, so it is covered
// by tests/utils.test.js. All times are minutes since midnight.
//
// A day is planned in two steps. First sessions are ADDED to windows (best fit, with the gap between sessions counted)
// until nothing else fits, so the available time is used. Then each window is LAID OUT in time: sessions start at the
// beginning of the window and any time left over is spread between them as extra break, rather than all of it being
// left empty at the end of the window.

// The shortest session worth scheduling. Time left in a window after the full-length sessions is topped up with one
// shorter session if it is at least this long.
export const MIN_SHORT_SESSION = 25

// The most extra break added between two sessions when spare time is spread out, on top of the student's own gap.
export const MAX_EXTRA_GAP = 60

// How far a free-period session may be stretched past the normal session length to use a free period up completely
// (a 50 minute free period gets one 50 minute session, not a 45 minute one and 5 wasted minutes).
export const MAX_STRETCH = 15

// windows: [{ start, end }] in minutes. gap: minutes of break required between two sessions in the same window.
export function createDayPlan(windows, gap = 0) {
  const wins = (windows || []).map(w => ({ start: w.start, end: w.end, items: [], used: 0 }))
  const length = (win) => win.end - win.start
  // What the window has to find room for to take one more session of `dur` minutes.
  const need = (win, dur) => (win.items.length ? win.used + gap : 0) + dur

  return {
    windows: wins,
    gap,
    // The window a session of `dur` minutes fits in, or -1. Best fit: the window that would be left with the least spare
    // time, so a long session is not shut out by short ones taking the roomy windows. Ties go to the earliest.
    fit(dur) {
      let best = -1, bestSpare = Infinity
      wins.forEach((win, i) => {
        const spare = length(win) - need(win, dur)
        if (spare >= 0 && spare < bestSpare) { best = i; bestSpare = spare }
      })
      return best
    },
    // Put a session of `dur` minutes into window i (call fit() first).
    add(i, session, dur) {
      const win = wins[i]
      win.used = need(win, dur)
      win.items.push({ session, dur, startMin: null })
    },
    // Minutes still free in window i for one more session, break included. 0 when there is none.
    spare(i) {
      const win = wins[i]
      return Math.max(0, length(win) - (win.items.length ? win.used + gap : 0))
    },
    count() { return wins.reduce((n, w) => n + w.items.length, 0) },
  }
}

// Reorder a window's sessions so two of the same key (the subject) are not next to each other, where the other sessions
// make that possible. The first session never moves (emergency sessions are placed first and stay first).
export function separateNeighbours(items, keyOf = (it) => it.session.subject) {
  const out = [...items]
  for (let i = 1; i < out.length; i++) {
    if (keyOf(out[i]) !== keyOf(out[i - 1])) continue
    let j = i + 1
    while (j < out.length && keyOf(out[j]) === keyOf(out[i - 1])) j++
    if (j < out.length) { const [moved] = out.splice(j, 1); out.splice(i, 0, moved) }
  }
  return out
}

// Give every session in the plan its start time. The first session starts when the window does. Spare time in the
// window is shared out as extra break between the sessions (up to maxExtraGap each, in multiples of `step` minutes), so
// a 4 hour window with two sessions does not have both squashed into the first 2 hours.
export function layoutPlan(plan, { maxExtraGap = 0, step = 5 } = {}) {
  plan.windows.forEach(win => {
    const k = win.items.length
    if (!k) return
    const slack = (win.end - win.start) - win.used
    let extra = 0
    if (k > 1 && slack > 0 && maxExtraGap > 0) {
      extra = Math.min(maxExtraGap, Math.floor(slack / (k - 1) / step) * step)
    }
    let pos = win.start
    win.items.forEach(it => { it.startMin = pos; pos += it.dur + plan.gap + extra })
  })
}

// How to use a free period of `span` minutes: how many sessions of the normal length `standard` it holds (with `gap`
// minutes between them) and how long each should be so they use the period up. A little longer than normal is fine
// (up to maxStretch); a free period shorter than a normal session gets one shorter session; one too short to be worth
// a session (under minLen) gets none.
export function fitSessionLength(span, standard, gap, { maxStretch = MAX_STRETCH, minLen = MIN_SHORT_SESSION } = {}) {
  if (!(span >= Math.min(minLen, standard))) return { count: 0, len: 0 }
  const count = Math.max(1, Math.floor((span + gap) / (standard + gap)))
  const len = Math.min(standard + maxStretch, Math.floor((span - (count - 1) * gap) / count))
  return { count, len }
}

// Fill a plan with sessions until nothing else fits or the daily cap is reached.
//   pool             the subjects that can be placed (any objects; only passed through to the callbacks)
//   order(pool)      the pool fairest first (utils/fairShare.js): the subject furthest below its share of minutes
//   dueCandidate(s)  what this subject is due for next: { stype: 'content' | 'exam', dur, ... } or null
//   fillerCandidate(s) an extra content session for this subject: { dur, ... } or null. Used when its exam practice is
//                    due but does not fit anywhere, so the time is still used WITHOUT using up the exam practice turn
//   place(candidate, windowIndex, isFiller)  records the session; the caller advances its own pointers
//   capReached()     true once today's session cap is used
// Two steps:
//  1. Exam practice that is due and fits goes first, once per subject. Exam papers are the long sessions and the hardest
//     to fit, so they get first pick of the time instead of being squeezed out and quietly turned into content, which is
//     how long papers ended up under-practised. A paper that cannot fit anywhere (longer than every window) gets no such
//     priority, otherwise that subject would stay "exam due" for ever and jump the queue.
//  2. Everything else, ONE session at a time, re-ordering after every session so the subject furthest below its share of
//     MINUTES always goes next. (Handing every subject one session per round gave subjects with long sessions more
//     minutes than the rest.)
export function fillPlan(plan, { pool, order, dueCandidate, fillerCandidate, place, capReached = () => false }) {
  const dueNow = order(pool).map(s => dueCandidate(s)).filter(c => c && c.dur > 0 && c.stype === 'exam')
  for (const c of dueNow) {
    if (capReached()) return
    const w = plan.fit(c.dur)
    if (w >= 0) place(c, w, false)
  }
  for (;;) {
    if (capReached()) return
    let placed = false
    for (const s of order(pool)) {
      const c = dueCandidate(s)
      if (!c || !(c.dur > 0)) continue
      let use = c, w = plan.fit(c.dur), filler = false
      if (w < 0 && c.stype === 'exam') {
        const f = fillerCandidate(s)
        const wf = f && f.dur > 0 ? plan.fit(f.dur) : -1
        if (wf >= 0) { use = f; w = wf; filler = true }
      }
      if (w < 0) continue
      place(use, w, filler)
      placed = true
      break
    }
    if (!placed) return
  }
}

// Time left in a window that is too short for a full session: one shorter content session, fairest subject first.
//   maxLen        the normal session length (a shorter one is only worth it below this)
//   placeShort(candidate, windowIndex, minutes)  records a session of that many minutes
export function topUp(plan, { pool, order, fillerCandidate, placeShort, capReached = () => false, minShort = MIN_SHORT_SESSION, maxLen }) {
  for (let wi = 0; wi < plan.windows.length && !capReached(); wi++) {
    const room = Math.min(plan.spare(wi), maxLen)
    if (room < Math.min(minShort, maxLen)) continue
    for (const s of order(pool)) {
      const f = fillerCandidate(s)
      if (!f) continue
      placeShort(f, wi, room)
      break
    }
  }
}
