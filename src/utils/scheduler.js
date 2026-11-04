// Full algorithmic revision schedule generator
// Rule-based revision schedule generator for UK GCSE and A-Level students:
// - Paper rotation (content and exam practice rotate independently)
// - 2:1 content:exam ratio (configurable)
// - Emergency sessions day before each exam
// - Week-of-exam paper locking
// - Pre-exam day multi-sessions
// - Holiday handling
// - Tuesday caps
// - Sunday emergency-only sessions (unless the student turned Sunday on)
// - Time is FILLED: a day is planned across all its windows (utils/dayFill.js), subjects can repeat, long exam
//   papers get first pick of the time, and spare time is spread out as extra break (see "Plan the day" below)
// - Equal subjects get equal hours; a "High priority" subject gets about twice as many (utils/fairShare.js)

import { addDays, format, startOfWeek, isSameDay, differenceInDays, getISOWeek } from 'date-fns'
import { getPaperSpec } from '../data/paperDatabase'
import { parseLocalDate } from './examUtils'
import { buildSubjectKey } from './subjectKey'
import { getSubjectQualification } from '../data/subjects'
import { createFairShare } from './fairShare'
import { createDayPlan, layoutPlan, separateNeighbours, fitSessionLength, fillPlan, topUp, MIN_SHORT_SESSION, MAX_EXTRA_GAP } from './dayFill'

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
// Fallback only — getExamDuration checks the real per-board/tier paper database
// (paperDatabase.js's getPaperSpec) first. This table only kicks in when that
// specific board/tier/paper combination isn't in the database.
const EXAM_DURATIONS = {
  'Mathematics':      { default: 90 },
  'Further Mathematics': { default: 105 },
  'English Language': { default: 105 },
  'English Literature': { 1: 105, 2: 135 },
  'Biology':          { default: 105 },
  'Chemistry':        { default: 105 },
  'Physics':          { default: 105 },
  'Combined Science': { default: 75 },
  'Computer Science': { default: 75 },
  'Geography':        { default: 90 },
  'German':           { 1: 35, 2: 45, 3: 60, 4: 75 },
  'French':           { 1: 35, 2: 45, 3: 60, 4: 75 },
  'Spanish':          { 1: 35, 2: 45, 3: 60, 4: 75 },
  'Business Studies': { default: 105 },
  'History':          { default: 90 },
  'Religious Studies':{ default: 90 },
}

function getExamDuration(subject, paper, board, tier, level = 'GCSE') {
  if (board) {
    const spec = getPaperSpec(board, subject, tier, paper, level)
    if (spec?.duration) return spec.duration
  }
  const d = EXAM_DURATIONS[subject]
  if (!d) return 75
  return d[paper] ?? d.default ?? 75
}

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

// ── SESSION NAMING ────────────────────────────────────────────────────────────
const EXAM_YEARS = [2024, 2023, 2022, 2021, 2019, 2018, 2017, 2016]

function getSessionName(subject, paper, stype, counters, focusTopic) {
  const key = `${subject}-${paper}-${stype}`
  if (!counters[key]) counters[key] = 0
  const idx = counters[key]++

  if (stype === 'content') {
    return focusTopic
      ? `${subject} Paper ${paper} \u2013 ${focusTopic}`
      : `${subject} Paper ${paper} \u2013 Content Revision`
  } else {
    const yr = EXAM_YEARS[idx % EXAM_YEARS.length]
    return `${subject} Paper ${paper} \u2013 Exam Practice: ${yr} Paper`
  }
}

// ── TIME HELPERS ──────────────────────────────────────────────────────────────
function dayStartMin(date, availability) {
  const dow = date.getDay() // 0=Sun
  const dayName = DAY_NAMES[dow]
  const avail = availability[dayName]
  if (!avail || !avail.enabled) return null

  if (avail.startTime) {
    const [h, m] = avail.startTime.split(':').map(Number)
    return h * 60 + m
  }
  // Defaults
  if (dow === 0) return 15 * 60  // Sunday
  if (dow === 3) return 16 * 60  // Wednesday
  if (dow === 6) return 12 * 60  // Saturday
  return 17 * 60
}

function dayEndMin(date, availability, useExtended) {
  const dow = date.getDay()
  const dayName = DAY_NAMES[dow]
  const avail = availability[dayName]
  const explicit = avail?.endTime
    ? (() => { const [h, m] = avail.endTime.split(':').map(Number); return h * 60 + m })()
    : null
  if (useExtended) {
    // A floor, not a fallback — respects a later custom end time if the student already
    // set one, but guarantees at least 22:00 during study leave even if their normal
    // setting for this day is earlier (e.g. a normal 19:00 finish becomes 22:00).
    return Math.max(explicit ?? 0, 22 * 60)
  }
  return explicit ?? 21 * 60
}

function isHoliday(date, holidays) {
  if (!holidays) return false
  const day = new Date(date)
  day.setHours(0,0,0,0)
  return holidays.some(h => {
    if (!h?.start || !h?.end) return false
    const [sy, sm, sd] = String(h.start).slice(0,10).split('-').map(Number)
    const [ey, em, ed] = String(h.end).slice(0,10).split('-').map(Number)
    const start = new Date(sy, sm-1, sd); start.setHours(0,0,0,0)
    const end = new Date(ey, em-1, ed); end.setHours(23,59,59,999)
    return day >= start && day <= end
  })
}

function fmtTime(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
}

// A planned session has no time yet; this gives it one once its window has been laid out.
function stampSession(session, date, startMin) {
  const endMin = startMin + session.duration
  session.start = fmtTime(startMin)
  session.end = fmtTime(endMin)
  session.startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(startMin / 60), startMin % 60).toISOString()
  session.endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(endMin / 60), endMin % 60).toISOString()
}

// ── MULTI-WINDOW AVAILABILITY ─────────────────────────────────────────────────
// A day can now have more than one study window (e.g. 15:00–17:00 AND 19:00–22:00), not
// just a single start/end. rangeToMinutes/getBaseWindows/getFreePeriodWindows/mergeWindows/
// getDayWindows turn whatever shape availability + the school timetable are in into one
// sorted, non-overlapping list of {start,end} minute windows for a given date — everything
// downstream (the day loop) just walks that list, so it behaves exactly as before when
// there's only one window.
function rangeToMinutes(range) {
  const [sh, sm] = String(range.start).split(':').map(Number)
  const [eh, em] = String(range.end).split(':').map(Number)
  return { start: sh * 60 + sm, end: eh * 60 + em }
}

function getBaseWindows(date, availability, useExtended) {
  const dow     = date.getDay()
  const dayName = DAY_NAMES[dow]
  const avail   = availability[dayName]
  if (!avail || !avail.enabled) return []

  if (Array.isArray(avail.ranges) && avail.ranges.length) {
    const ranges = avail.ranges
      .filter(r => r && r.start && r.end)
      .map(rangeToMinutes)
      .sort((a, b) => a.start - b.start)
    if (!ranges.length) return []
    // Extended-hours floor (study leave) only pushes out the LAST window of the day — it
    // stretches the final finish time, it doesn't also stretch an earlier, separate block
    // like a lunchtime slot.
    if (useExtended) {
      const last = ranges[ranges.length - 1]
      last.end = Math.max(last.end, 22 * 60)
    }
    return ranges
  }

  // Legacy single startTime/endTime fields — unchanged behaviour via the existing helpers,
  // so availability saved before multi-range support still works exactly as before.
  const start = dayStartMin(date, availability)
  if (start === null) return []
  const end = dayEndMin(date, availability, useExtended)
  return [{ start, end }]
}

// Fortnight (Week A / Week B) rotation. A period with no `week` field applies every week —
// that's what every period saved before this feature existed already looks like, so an
// un-migrated timetable keeps behaving exactly as it did with a single repeating week.
// `rotation`: { enabled: bool, evenWeekLabel: 'A'|'B' } — which label applies on ISO weeks
// with an even week number; the other label applies on odd ones. ISO week number (not a
// hand-picked anchor date) is what makes this well-defined for any date, past or future,
// from a single one-off "is this week A or B?" answer at setup time.
export function weekLabelForDate(date, rotation) {
  if (!rotation?.enabled) return null
  const evenLabel = rotation.evenWeekLabel === 'B' ? 'B' : 'A'
  const oddLabel  = evenLabel === 'A' ? 'B' : 'A'
  return getISOWeek(date) % 2 === 0 ? evenLabel : oddLabel
}

function getFreePeriodWindows(date, timetable, rotation) {
  if (!timetable) return []
  const dayName = DAY_NAMES[date.getDay()]
  const periods = timetable[dayName]
  if (!Array.isArray(periods)) return []
  const label = weekLabelForDate(date, rotation)
  return periods
    .filter(p => p && p.type === 'free' && p.startTime && p.endTime)
    .filter(p => !p.week || !label || p.week === label)
    .map(p => rangeToMinutes({ start: p.startTime, end: p.endTime }))
}

function mergeWindows(windows) {
  if (!windows.length) return []
  const sorted = [...windows].sort((a, b) => a.start - b.start)
  const merged = [{ ...sorted[0] }]
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1]
    const w    = sorted[i]
    if (w.start <= last.end) last.end = Math.max(last.end, w.end)
    else merged.push({ ...w })
  }
  return merged
}

// includeFreePeriods gates whether the student's school-timetable free periods count as
// extra study windows on top of their normal evening/weekend availability — independent of
// that day being "enabled" in availability, since a free period exists at school regardless
// of whether the student also revises that same evening.
function getDayWindows(date, availability, timetable, includeFreePeriods, useExtended, rotation) {
  const base = getBaseWindows(date, availability, useExtended)
  const free = includeFreePeriods ? getFreePeriodWindows(date, timetable, rotation) : []
  return mergeWindows([...base, ...free])
}

// ── MAIN GENERATOR ────────────────────────────────────────────────────────────
export function generateSchedule(options) {
  const {
    subjects,          // [{ name, board, tier, papers: [1,2,3], ratio: [2,1], examDates: [{paper, date}] }]
    availability,      // { Monday: { enabled, ranges: [{start,end}, ...] }, ... } — or legacy { enabled, startTime, endTime }
    startDate,         // Date
    endDate,           // Date
    holidays = [],     // [{ start, end }] — full blackout dates, zero sessions scheduled
    contentRatio = 2,  // default content sessions per exam session
    examRatio = 1,
    contentDuration = 45,
    sessionGap = 30,
    dayCaps = [],          // [{ day: 'Tuesday', max: 1 }, ...] — was a single day, now any number
    maxSessionsPerDay = null, // NEW: a flat cap applying to every day, independent of dayCaps
    includeEmergency = true,
    extendedFromDate = null, // Date from which end time has a 22:00 floor (not just a fallback)
    dynamicRatio = false,  // NEW: bias a subject toward more exam practice as its exam nears
    topicFocus = {},   // { 'Subject-paper': 'Weakest topic name' } — optional, from real confidence data
    timetable = null,          // NEW: { Monday: [{ type:'lesson'|'free', label, startTime, endTime, week? }], ... }
    includeFreePeriods = false, // NEW: also treat the timetable's free periods as extra study windows
    rotation = null,           // NEW: { enabled, evenWeekLabel } — fortnight Week A/B rotation for the timetable
  } = options

  const CONTENT_DUR = contentDuration || 45
  const GAP_MINUTES  = sessionGap ?? 30
  const dayCapMap = {}  // day-index (0-6) -> max sessions
  dayCaps.forEach(({ day, max }) => {
    const idx = DAY_NAMES.indexOf(day)
    if (idx >= 0) dayCapMap[idx] = max
  })

  const sessions    = []
  const counters    = {}  // session name counters
  const completed   = new Set()  // (subj, paper) whose exam has passed

  // Paper rotation pointers — separate for content and exam
  const contentPtr = {}
  const examPtr    = {}
  const typePtr    = {}  // overall content/exam cycle position

  subjects.forEach(s => {
    contentPtr[s.name] = 0
    examPtr[s.name]    = 0
    typePtr[s.name]    = 0
  })

  // Build exam date lookup. An exam date that cannot be read is skipped rather than allowed to stop the whole schedule.
  const examDateMap = {}  // 'subj-paper' -> Date
  const examsByDate = {}  // dateStr -> [{subj, paper}]
  const examByKey   = new Map()  // 'subj-paper' -> { subj, paper, date } kept as data, so nothing has to split a key back
                                 // apart (a subject name may contain a '-')

  subjects.forEach(s => {
    (s.examDates || []).forEach(ed => {
      const key = `${s.name}-${ed.paper}`
      const d   = parseLocalDate(ed.date) // never new Date(ed.date) — that's UTC midnight, which in BST can land the exam on the wrong local day and shift every session placed relative to it
      if (!d) return
      examDateMap[key] = d
      const ds = format(d, 'yyyy-MM-dd')
      if (!examsByDate[ds]) examsByDate[ds] = []
      examsByDate[ds].push({ subj: s.name, paper: ed.paper })
      examByKey.set(key, { subj: s.name, paper: parseInt(ed.paper), date: d })
    })
  })
  // A paused subject (a 0:0 ratio, "Paused — no sessions generated" in the settings) gets no sessions at all. That includes
  // the emergency and day-before-exam sessions, which used to be placed for it anyway.
  const isPaused = (s) => { const r = s.ratio || [contentRatio, examRatio]; return r[0] === 0 && r[1] === 0 }
  const pausedNames = new Set(subjects.filter(isPaused).map(s => s.name))
  const examList = [...examByKey.values()].filter(e => !pausedNames.has(e.subj))

  // Emergency sessions map: prevDay -> [{subj, paper}]. Gated behind includeEmergency —
  // left empty when the toggle is off, which naturally makes both the "emergency first"
  // block below and Sunday's emergency-only handling no-ops (nothing to place).
  const emergencyMap = {}
  if (includeEmergency) {
    examList.forEach(({ subj, paper, date }) => {
      const ds = format(addDays(date, -1), 'yyyy-MM-dd')
      if (!emergencyMap[ds]) emergencyMap[ds] = []
      emergencyMap[ds].push({ subj, paper })
    })
  }

  // Exams tomorrow map
  const examsTomorrow = {}
  examList.forEach(({ subj, paper, date }) => {
    const prev = format(addDays(date, -1), 'yyyy-MM-dd')
    if (!examsTomorrow[prev]) examsTomorrow[prev] = []
    examsTomorrow[prev].push({ subj, paper })
  })

  // Fair-share rotation (utils/fairShare.js). Which subject is placed next, and which topic a content session is about,
  // follows each subject's and topic's total minutes so far, so equal weights give equal hours. Without this the order
  // fell back to list order every day and the first subjects in a profile took most of the slots.
  const share = createFairShare({ subjects, topicFocus })

  function activePapers(subjName) {
    const s = subjects.find(x => x.name === subjName)
    if (!s) return []
    return (s.papers || [1, 2]).filter(p => !completed.has(`${subjName}-${p}`))
  }

  function weekOfExamPapers(subjName, date) {
    const wmon = startOfWeek(date, { weekStartsOn: 1 })
    const wend = addDays(wmon, 6)
    return activePapers(subjName).filter(p => {
      const ed = examDateMap[`${subjName}-${p}`]
      return ed && ed >= wmon && ed <= wend
    })
  }

  function pickPaper(subjName, stype, date, preExamPapers = null) {
    const ap = activePapers(subjName)
    if (!ap.length) return null

    if (preExamPapers) {
      const candidates = preExamPapers.filter(p => ap.includes(p))
      if (!candidates.length) return null
      const ptr = stype === 'content' ? contentPtr[subjName] : examPtr[subjName]
      return candidates[ptr % candidates.length]
    }

    const imminent = weekOfExamPapers(subjName, date)
    if (imminent.length) {
      imminent.sort((a,b) => (examDateMap[`${subjName}-${a}`]||new Date(9999,0,1)) - (examDateMap[`${subjName}-${b}`]||new Date(9999,0,1)))
      return imminent[0]
    }

    if (stype === 'content') return ap[contentPtr[subjName] % ap.length]
    return ap[examPtr[subjName] % ap.length]
  }

  function advancePaperPtr(subjName, stype, date) {
    const ap = activePapers(subjName)
    if (!ap.length) return
    if (weekOfExamPapers(subjName, date).length) return  // locked
    if (stype === 'content') contentPtr[subjName] = (contentPtr[subjName] + 1) % ap.length
    else examPtr[subjName] = (examPtr[subjName] + 1) % ap.length
  }

  function nextSessionType(subjName, overrideRatio) {
    const s = subjects.find(x => x.name === subjName)
    const ratio = overrideRatio || s?.ratio || [contentRatio, examRatio]
    const total = ratio[0] + ratio[1]
    if (total === 0) return 'exam'
    return typePtr[subjName] % total < ratio[0] ? 'content' : 'exam'
  }

  // NEW: when dynamicRatio is on, a subject's content:exam balance shifts toward exam
  // practice as its real exam date gets close — grounded in the same examDateMap used
  // for emergency sessions, not a guess. Falls back to the subject's normal/base ratio
  // whenever there's no exam data or the feature is off.
  function effectiveRatio(subjName, baseRatio, date) {
    if (!dynamicRatio) return baseRatio
    // A 0 on either side (exam practice only, or content only) is the student's own choice, so it is left alone.
    if (Array.isArray(baseRatio) && (baseRatio[0] === 0 || baseRatio[1] === 0)) return baseRatio
    const upcoming = examList
      .filter(e => e.subj === subjName && e.date >= date)
      .map(e => e.date)
    if (!upcoming.length) return baseRatio
    const nearestDays = differenceInDays(new Date(Math.min(...upcoming.map(d => d.getTime()))), date)
    if (nearestDays <= 7)  return [1, 3]
    if (nearestDays <= 21) return [1, 2]
    return baseRatio
  }

  function subjMeta(subjName) {
    return subjects.find(x => x.name === subjName)
  }

  // A session without its clock time (stampSession adds that once the day has been laid out). durOverride is for the
  // shorter top-up sessions that use up time too short for a full one.
  function buildSession(date, subjName, paper, stype, isEmergency = false, durOverride = null) {
    const meta = subjMeta(subjName)
    const dur = durOverride
      || (isEmergency ? CONTENT_DUR
        : stype === 'content' ? CONTENT_DUR
        : getExamDuration(subjName, paper, meta?.board, meta?.tier, meta?.qualification))

    // Content sessions rotate through the paper's focus topics (utils/fairShare.js) instead of all being about one.
    const focusTopic = (!isEmergency && stype === 'content') ? share.topicFor(subjName, paper) : null
    const name = isEmergency
      ? `EMERGENCY: ${subjName} Paper ${paper} \u2013 Final Revision`
      : getSessionName(subjName, paper, stype, counters, focusTopic)

    const session = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      subject: subjName,
      board: meta?.board,
      qualification: meta?.qualification,
      tier: meta?.tier,
      subjectKey: meta ? buildSubjectKey({ board: meta.board, qualification: meta.qualification, subject: subjName, tier: meta.tier }) : null,
      paper,
      type: isEmergency ? 'Emergency Revision' : stype === 'content' ? 'Content Revision' : 'Exam Practice',
      title: name,
      date: format(date, 'yyyy-MM-dd'),
      duration: dur,
      isEmergency,
      completed: false,
      source: 'generated',
      // Which topic a content session is about, when the paper has focus topics (left out otherwise: Firestore
      // does not accept undefined). The free-period pass reads it to carry on the rotation.
      ...(focusTopic ? { focusTopic } : {}),
    }
    return { session, dur }
  }

  // Sunday's emergency-only branch places sessions one after another at a fixed time.
  function placeSession(date, currentMin, endMin, subjName, paper, stype, isEmergency = false) {
    const built = buildSession(date, subjName, paper, stype, isEmergency)
    if (currentMin + built.dur > endMin) return null
    stampSession(built.session, date, currentMin)
    return { session: built.session, newMin: currentMin + built.dur + GAP_MINUTES, stype }
  }

  // Sessions placed outside the day plan go through here, so the fair-share totals always match what was scheduled.
  function commit(session) {
    sessions.push(session)
    share.record(session)
  }

  // ── Day loop ────────────────────────────────────────────────────────────────
  let current = new Date(startDate)
  const end   = new Date(endDate)

  while (current <= end) {
    const dateStr  = format(current, 'yyyy-MM-dd')
    const dow      = current.getDay()
    const isSunday = dow === 0

    // Update completed
    Object.entries(examDateMap).forEach(([key, edate]) => {
      if (edate < current) completed.add(key)
    })

    // Holiday / unavailable period — a genuine blackout now. Previously this only
    // softened the day-cap rule on the specific capped weekday and did nothing on any
    // other day, so declaring a holiday barely changed what got scheduled. Skips
    // everything for the day, including emergency sessions and free periods — an
    // explicitly-declared unavailable period (e.g. a family trip) takes precedence over
    // an exam being close.
    if (isHoliday(current, holidays)) {
      current = addDays(current, 1)
      continue
    }

    // Sunday stays emergency-only (a fixed window, not part of the multi-range availability system, and free periods
    // don't apply) UNLESS the student turned Sunday on in their availability. The availability step lists Sunday as a
    // day they can pick, and that choice used to be ignored. When it is on, Sunday is handled like any other day below.
    if (isSunday && !availability?.Sunday?.enabled) {
      const emergencies = emergencyMap[dateStr] || []
      if (!emergencies.length) { current = addDays(current, 1); continue }
      let curMin = 15 * 60  // Sunday always starts at 15:00
      const endMin = extendedFromDate && current >= new Date(extendedFromDate) ? 22 * 60 : 21 * 60
      emergencies.forEach(({ subj, paper }) => {
        const result = placeSession(current, curMin, endMin, subj, paper, 'content', true)
        if (result) { commit(result.session); curMin = result.newMin }
      })
      current = addDays(current, 1)
      continue
    }

    // One or more study windows for today: normal availability (a single legacy range, or
    // the new multi-range list) plus, when the toggle is on, the school timetable's free
    // periods. Everything below walks this list instead of one fixed start/end, so a day
    // with a single window behaves exactly as before.
    const windows = getDayWindows(current, availability, timetable, includeFreePeriods,
      extendedFromDate && current >= new Date(extendedFromDate), rotation)
    if (!windows.length) {
      current = addDays(current, 1)
      continue
    }

    // Day cap(s) — was a single hardcoded Tuesday-only rule; now any number of days can
    // each have their own max, and an optional flat maxSessionsPerDay applies everywhere.
    // The cap is per DAY, so it's tracked once here and shared across all of today's windows.
    const dayCapForToday = dayCapMap[dow]
    const effectiveCap = [dayCapForToday, maxSessionsPerDay].filter(v => v != null)
    const isDayCapped = effectiveCap.length > 0
    const capLimit = isDayCapped ? Math.min(...effectiveCap) : Infinity

    let slotsUsed = 0

    // Active subjects (not all papers completed, and not paused via ratio [0,0])
    const activeSubjects = subjects.filter(s => {
      const r = s.ratio || [contentRatio, examRatio]
      if (r[0] === 0 && r[1] === 0) return false // explicitly paused
      return activePapers(s.name).length > 0
    })

    // Pre-exam day: fill with tomorrow's exam subjects
    const tmrExams = examsTomorrow[dateStr] || []
    const preExamSubjs = [...new Set(tmrExams.map(e => e.subj))]
    const preExamPapersMap = {}
    tmrExams.forEach(e => {
      if (!preExamPapersMap[e.subj]) preExamPapersMap[e.subj] = []
      preExamPapersMap[e.subj].push(e.paper)
    })
    const isPreExam = preExamSubjs.length > 0

    const examsToday = examsByDate[dateStr] || []
    const examsTodayMap = {}
    examsToday.forEach(e => {
      if (!examsTodayMap[e.subj]) examsTodayMap[e.subj] = []
      examsTodayMap[e.subj].push(e.paper)
    })

    // ── Plan the day ──────────────────────────────────────────────────────────
    // Sessions are first PLANNED across all of today's windows together (utils/dayFill.js) and then laid out in time.
    // The old loop gave each subject at most one session a day and stopped, so an evening with more time than subjects
    // was left part empty, and an exam paper that did not fit right after another session was quietly turned into a
    // content session. Now it keeps going, round after round, until nothing else fits or the daily cap is reached:
    //   - the order each round is fair share (utils/fairShare.js): equal subjects get equal hours, "High priority" about twice;
    //   - a subject whose turn is exam practice goes ahead of the content turns, and if its paper still cannot fit it is
    //     NOT used up: the time is filled with an extra content session and the exam practice is tried again next time;
    //   - time too short for a full session gets one shorter session;
    //   - time still left over is spread between the sessions as extra break, instead of all being left at the end.
    const plan = createDayPlan(windows, GAP_MINUTES)
    const capReached = () => isDayCapped && slotsUsed >= capLimit
    const pool = isPreExam ? preExamSubjs.map(subjMeta).filter(Boolean) : activeSubjects

    const durationFor = (name, paper, stype) => stype === 'content' ? CONTENT_DUR
      : getExamDuration(name, paper, subjMeta(name)?.board, subjMeta(name)?.tier, subjMeta(name)?.qualification)

    // The paper a session of this type would be about today, or null when there is none.
    function paperFor(name, stype) {
      const ap = activePapers(name)
      if (!ap.length) return null
      if (isPreExam) {
        const pre = ap.filter(p => preExamPapersMap[name]?.includes(p))
        return pre.length ? pickPaper(name, stype, current, pre) : null
      }
      let paper = pickPaper(name, stype, current)
      if (!paper) return null
      // Skip paper if its exam is today
      if (examsTodayMap[name]?.includes(paper)) {
        const alts = ap.filter(p => !examsTodayMap[name]?.includes(p))
        if (!alts.length) return null
        paper = alts[(stype === 'content' ? contentPtr[name] : examPtr[name]) % alts.length]
      }
      return paper
    }
    // What this subject is due for next, following its content : exam ratio.
    function dueCandidate(subj) {
      const stype = nextSessionType(subj.name, isPreExam ? undefined : effectiveRatio(subj.name, subj.ratio, current))
      const paper = paperFor(subj.name, stype)
      return paper ? { name: subj.name, paper, stype, dur: durationFor(subj.name, paper, stype) } : null
    }
    // An extra content session that does not use up the subject's exam practice turn. Never for a subject the student set
    // to exam practice only (a content ratio of 0): their choice stands, so its time is simply left for other subjects.
    function fillerCandidate(subj) {
      if ((subj.ratio || [contentRatio, examRatio])[0] === 0) return null
      const paper = paperFor(subj.name, 'content')
      return paper ? { name: subj.name, paper, stype: 'content', dur: CONTENT_DUR } : null
    }
    function addToPlan(w, built) {
      plan.add(w, built.session, built.dur)
      share.record(built.session)
      slotsUsed++
    }
    function placeCandidate(c, w, isFiller) {
      addToPlan(w, buildSession(current, c.name, c.paper, c.stype, false))
      if (!isFiller) typePtr[c.name]++
      if (!isPreExam) advancePaperPtr(c.name, c.stype, current)
    }

    // 1. Emergency sessions (the day before an exam) take their place first, in the first window they fit.
    for (const { subj, paper } of emergencyMap[dateStr] || []) {
      if (capReached()) break
      const built = buildSession(current, subj, paper, 'content', true)
      const w = plan.fit(built.dur)
      if (w >= 0) addToPlan(w, built)
    }

    // 2. Full-length sessions.
    fillPlan(plan, { pool, order: (list) => share.order(list), dueCandidate, fillerCandidate, place: placeCandidate, capReached })

    // 3. Time too short for a full session.
    topUp(plan, {
      pool, order: (list) => share.order(list), fillerCandidate, capReached, maxLen: CONTENT_DUR,
      placeShort: (c, w, minutes) => {
        addToPlan(w, buildSession(current, c.name, c.paper, 'content', false, minutes))
        if (!isPreExam) advancePaperPtr(c.name, 'content', current)
      },
    })

    // 4. Lay each window out in time. Spare time becomes extra break between sessions, and the same subject is not
    //    placed twice in a row where the other sessions allow it.
    plan.windows.forEach(win => { win.items = separateNeighbours(win.items) })
    layoutPlan(plan, { maxExtraGap: MAX_EXTRA_GAP })
    plan.windows.forEach(win => win.items.forEach(it => {
      stampSession(it.session, current, it.startMin)
      sessions.push(it.session)
    }))

    current = addDays(current, 1)
  }

  return sessions
}

// ── FREE PERIOD SCHEDULER ─────────────────────────────────────────────────────
// Deliberately a separate function rather than folded into generateSchedule()'s day loop:
// free periods are a supplementary, opt-in layer sourced from the school timetable (not the
// Availability step), and keeping it independent means the "use my free periods" toggle is
// just "call this too, and merge its output in" — turning it on or off never touches
// generateSchedule's own day-caps, emergency handling, or paper-rotation state.
//
// Its paper-rotation pointers are intentionally separate from generateSchedule's own —
// a free-period session and an evening session on the same day can occasionally cover the
// same paper. That's an accepted trade-off for keeping the two passes independent rather
// than threading shared mutable state between two functions called from two different places.
export function scheduleFreePeriods(options) {
  const {
    subjects,          // same shape as generateSchedule's `subjects`, incl. per-subject ratio
    timetable,         // { Monday: [{ type:'lesson'|'free', label, startTime, endTime, week? }], ... }
    startDate,         // Date
    endDate,           // Date
    holidays = [],     // same full-day blackout list generateSchedule uses
    contentDuration = 45,
    sessionGap = 30,
    topicFocus = {},
    rotation = null,   // { enabled, evenWeekLabel } — fortnight Week A/B rotation for the timetable
    existingSessions = [], // sessions generateSchedule already placed over the same dates: this pass carries on from their totals
  } = options

  const CONTENT_DUR = contentDuration || 45
  const GAP_MINUTES  = sessionGap ?? 30

  const sessions  = []
  const counters  = {}
  const completed = new Set()
  // Free periods have NO priority bias: every subject counts the same here, however the student ranked their subjects
  // for evening study, and what the evening pass gave each subject is not "made up" here. The evening pass is carried
  // on only for the ROTATION (who was placed last, which topic is next), so the same subjects are not favoured twice.
  const share = createFairShare({ subjects, topicFocus, existingSessions, equalWeights: true, carryMinutes: false })
  // A short break inside a double free period. The student's own gap setting is for evening study.
  const FP_GAP = Math.min(GAP_MINUTES, 10)

  const contentPtr = {}
  const examPtr    = {}
  const typePtr    = {}
  subjects.forEach(s => {
    contentPtr[s.name] = 0
    examPtr[s.name]    = 0
    typePtr[s.name]    = 0
  })

  const examDateMap = {}
  const examsByDate = {}
  subjects.forEach(s => {
    (s.examDates || []).forEach(ed => {
      const key = `${s.name}-${ed.paper}`
      const d   = parseLocalDate(ed.date) // see note on the equivalent block above — same fix
      if (!d) return
      examDateMap[key] = d
      const ds = format(d, 'yyyy-MM-dd')
      if (!examsByDate[ds]) examsByDate[ds] = []
      examsByDate[ds].push({ subj: s.name, paper: ed.paper })
    })
  })

  function activePapers(subjName) {
    const s = subjects.find(x => x.name === subjName)
    if (!s) return []
    return (s.papers || [1, 2]).filter(p => !completed.has(`${subjName}-${p}`))
  }
  function subjMeta(subjName) { return subjects.find(x => x.name === subjName) }

  function pickPaper(subjName, stype) {
    const ap = activePapers(subjName)
    if (!ap.length) return null
    return stype === 'content' ? ap[contentPtr[subjName] % ap.length] : ap[examPtr[subjName] % ap.length]
  }
  function nextSessionType(subjName, ratio) {
    const total = ratio[0] + ratio[1]
    if (total === 0) return 'exam'
    return typePtr[subjName] % total < ratio[0] ? 'content' : 'exam'
  }
  function advancePaperPtr(subjName, stype) {
    const ap = activePapers(subjName)
    if (!ap.length) return
    if (stype === 'content') contentPtr[subjName] = (contentPtr[subjName] + 1) % ap.length
    else examPtr[subjName] = (examPtr[subjName] + 1) % ap.length
  }

  // A session without its clock time (stampSession adds that once the free period has been planned).
  function buildSession(date, subjName, paper, stype, dur) {
    const meta = subjMeta(subjName)
    const focusTopic = stype === 'content' ? share.topicFor(subjName, paper) : null
    const name = getSessionName(subjName, paper, stype, counters, focusTopic)
    const session = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      subject: subjName,
      board: meta?.board,
      qualification: meta?.qualification,
      tier: meta?.tier,
      subjectKey: meta ? buildSubjectKey({ board: meta.board, qualification: meta.qualification, subject: subjName, tier: meta.tier }) : null,
      paper,
      type: stype === 'content' ? 'Content Revision' : 'Exam Practice',
      title: name,
      date: format(date, 'yyyy-MM-dd'),
      duration: dur,
      isEmergency: false,
      completed: false,
      source: 'generated',
      // Distinguishes these for display only — same 'generated' source, so the existing
      // "replace previously generated sessions" logic in CalendarGenerator.jsx still cleans
      // these up too when the student regenerates their schedule.
      viaFreePeriod: true,
      ...(focusTopic ? { focusTopic } : {}),
    }
    return { session, dur }
  }

  let current = new Date(startDate)
  const end   = new Date(endDate)

  while (current <= end) {
    Object.entries(examDateMap).forEach(([key, edate]) => { if (edate < current) completed.add(key) })

    if (isHoliday(current, holidays)) { current = addDays(current, 1); continue }

    const dayName = DAY_NAMES[current.getDay()]
    const weekLabel = weekLabelForDate(current, rotation)
    const periods = (timetable?.[dayName] || [])
      .filter(p => p && p.type === 'free' && p.startTime && p.endTime)
      .filter(p => !p.week || !weekLabel || p.week === weekLabel)
    if (!periods.length) { current = addDays(current, 1); continue }

    const dateStr = format(current, 'yyyy-MM-dd')
    const examsTodayMap = {}
    ;(examsByDate[dateStr] || []).forEach(e => {
      if (!examsTodayMap[e.subj]) examsTodayMap[e.subj] = []
      examsTodayMap[e.subj].push(e.paper)
    })

    const activeSubjects = subjects.filter(s => {
      const r = s.ratio || [2, 1]
      if (r[0] === 0 && r[1] === 0) return false
      return activePapers(s.name).length > 0
    })
    if (!activeSubjects.length) { current = addDays(current, 1); continue }

    // The paper a session of this type would be about today, or null.
    function paperFor(name, stype) {
      const ap = activePapers(name)
      let paper = pickPaper(name, stype)
      if (!paper) return null
      if (examsTodayMap[name]?.includes(paper)) {
        const alts = ap.filter(p => !examsTodayMap[name]?.includes(p))
        if (!alts.length) return null
        paper = alts[0]
      }
      return paper
    }

    // ALWAYS fill the free periods. Every free period is planned on its own, whatever its length (and with no daily
    // cap: free periods are separate from the evening caps). Sessions are sized to use the period up: a 50 minute
    // free period gets one 50 minute session, a double period two, a short one a shorter session, and anything too
    // short to be worth a session none. Subjects repeat when there is more free time than subjects.
    const windows = mergeWindows(periods.map(p => rangeToMinutes({ start: p.startTime, end: p.endTime })))
    for (const win of windows) {
      const fit = fitSessionLength(win.end - win.start, CONTENT_DUR, FP_GAP)
      if (!fit.count) continue
      const plan = createDayPlan([{ start: win.start, end: win.end }], FP_GAP)
      const addToPlan = (built) => { plan.add(0, built.session, built.dur); share.record(built.session) }

      const durationFor = (name, paper, stype) => stype === 'content' ? fit.len
        : getExamDuration(name, paper, subjMeta(name)?.board, subjMeta(name)?.tier, subjMeta(name)?.qualification)
      const dueCandidate = (subj) => {
        const stype = nextSessionType(subj.name, subj.ratio || [2, 1])
        const paper = paperFor(subj.name, stype)
        return paper ? { name: subj.name, paper, stype, dur: durationFor(subj.name, paper, stype) } : null
      }
      const fillerCandidate = (subj) => {
        if ((subj.ratio || [2, 1])[0] === 0) return null   // exam practice only: no filler content (see generateSchedule)
        const paper = paperFor(subj.name, 'content')
        return paper ? { name: subj.name, paper, stype: 'content', dur: fit.len } : null
      }

      fillPlan(plan, {
        pool: activeSubjects, order: (list) => share.order(list), dueCandidate, fillerCandidate,
        place: (c, w, isFiller) => {
          addToPlan(buildSession(current, c.name, c.paper, c.stype, c.dur))
          if (!isFiller) typePtr[c.name]++
          advancePaperPtr(c.name, c.stype)
        },
      })
      topUp(plan, {
        pool: activeSubjects, order: (list) => share.order(list), fillerCandidate, maxLen: fit.len,
        placeShort: (c, w, minutes) => {
          addToPlan(buildSession(current, c.name, c.paper, 'content', minutes))
          advancePaperPtr(c.name, 'content')
        },
      })

      plan.windows.forEach(w => { w.items = separateNeighbours(w.items) })
      layoutPlan(plan)
      plan.windows.forEach(w => w.items.forEach(it => {
        stampSession(it.session, current, it.startMin)
        sessions.push(it.session)
      }))
    }

    current = addDays(current, 1)
  }

  return sessions
}

// Exam papers that are longer than every study window the student has. The generator can never place those as exam
// practice (there is nowhere for a paper that long to go), so it fills the time with content sessions instead, and
// the student should be told rather than find it out later. Looks at the week from startDate; a subject that is paused
// or set to content only is skipped, as is a paper whose exam date has already passed.
export function longPaperWarnings({ subjects = [], availability, startDate, extendedFromDate = null }) {
  if (!startDate) return []
  const start = new Date(startDate)
  let longest = 0
  for (let i = 0; i < 7; i++) {
    const day = addDays(start, i)
    const useExtended = !!(extendedFromDate && day >= extendedFromDate)
    getBaseWindows(day, availability, useExtended).forEach(w => { longest = Math.max(longest, w.end - w.start) })
  }
  const out = []
  subjects.forEach(s => {
    const r = s.ratio || [2, 1]
    if (r[1] === 0) return                                  // paused (0:0) or content only: no exam practice wanted
    const gone = new Set((s.examDates || []).filter(e => { const d = parseLocalDate(e.date); return d && d < start }).map(e => String(e.paper)))
    ;(s.papers || []).forEach(paper => {
      if (gone.has(String(paper))) return
      const minutes = getExamDuration(s.name, paper, s.board, s.tier, s.qualification)
      if (minutes > longest) out.push({ subject: s.name, paper, minutes, longest })
    })
  })
  return out
}

// ── PREFERENCE DEFAULTS ───────────────────────────────────────────────────────
export const SCHEDULE_DEFAULTS = {
  contentRatio: 2,
  examRatio: 1,
  dayCaps: [],
  maxSessionsPerDay: null,
  sessionGap: 30,
  includeEmergency: true,
  dynamicRatio: false,
  holidays: [],
}

export function buildSubjectsFromProfile(profile) {
  return (profile?.subjects || []).map(s => {
    const papers = profile?.examDates
      ?.filter(e => e.subject === s.name)
      ?.map(e => parseInt(e.paper))
      ?.filter((v,i,a) => a.indexOf(v)===i)
      ?.sort((a, b) => a - b) || [1, 2]

    const examDates = (profile?.examDates || [])
      .filter(e => e.subject === s.name)
      .map(e => ({ paper: parseInt(e.paper), date: e.examDate }))

    // Subject-specific ratios
    let ratio = [2, 1]
    if (s.name === 'English Language') ratio = [0, 1]
    else if (s.name === 'English Literature') ratio = [1, 2]

    return {
      name: s.name,
      board: s.board,
      tier: s.tier,
      qualification: getSubjectQualification(s, profile),   // the course it is really studied at, never assumed GCSE
      papers: papers.length ? papers : [1, 2],
      ratio,
      examDates,
      priority: false,   // chosen by the student (CalendarGenerator, "High priority"); no subject gets extra hours by default
    }
  })
}
