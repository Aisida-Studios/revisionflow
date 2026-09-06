// src/utils/scheduler.js
// Full algorithmic revision schedule generator
// Rule-based revision schedule generator for UK GCSE and A-Level students:
// - Paper rotation (content and exam practice rotate independently)
// - 2:1 content:exam ratio (configurable)
// - Emergency sessions day before each exam
// - Week-of-exam paper locking
// - Pre-exam day multi-sessions
// - Holiday handling
// - Tuesday caps
// - Sunday emergency-only sessions

import { addDays, format, startOfWeek, isSameDay, differenceInDays } from 'date-fns'
import { getPaperSpec } from '../data/paperDatabase'

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
      ? `${subject} Paper ${paper} – ${focusTopic}`
      : `${subject} Paper ${paper} – Content Revision`
  } else {
    const yr = EXAM_YEARS[idx % EXAM_YEARS.length]
    return `${subject} Paper ${paper} – Exam Practice: ${yr} Paper`
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
  return holidays.some(h => {
    const start = new Date(h.start)
    const end   = new Date(h.end)
    return date >= start && date <= end
  })
}

function fmtTime(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
}

// ── MAIN GENERATOR ────────────────────────────────────────────────────────────
export function generateSchedule(options) {
  const {
    subjects,          // [{ name, board, tier, papers: [1,2,3], ratio: [2,1], examDates: [{paper, date}] }]
    availability,      // { Monday: { enabled, startTime, endTime }, ... }
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

  // Build exam date lookup
  const examDateMap = {}  // 'subj-paper' -> Date
  const examsByDate = {}  // dateStr -> [{subj, paper}]

  subjects.forEach(s => {
    (s.examDates || []).forEach(ed => {
      const key = `${s.name}-${ed.paper}`
      const d   = new Date(ed.date)
      examDateMap[key] = d
      const ds = format(d, 'yyyy-MM-dd')
      if (!examsByDate[ds]) examsByDate[ds] = []
      examsByDate[ds].push({ subj: s.name, paper: ed.paper })
    })
  })

  // Emergency sessions map: prevDay -> [{subj, paper}]. Gated behind includeEmergency —
  // left empty when the toggle is off, which naturally makes both the "emergency first"
  // block below and Sunday's emergency-only handling no-ops (nothing to place).
  const emergencyMap = {}
  if (includeEmergency) {
    Object.entries(examDateMap).forEach(([key, edate]) => {
      const [subj, paper] = key.split('-')
      let prev = addDays(edate, -1)
      const ds = format(prev, 'yyyy-MM-dd')
      if (!emergencyMap[ds]) emergencyMap[ds] = []
      emergencyMap[ds].push({ subj, paper: parseInt(paper) })
    })
  }

  // Exams tomorrow map
  const examsTomorrow = {}
  Object.entries(examDateMap).forEach(([key, edate]) => {
    const [subj, paper] = key.split('-')
    const prev = format(addDays(edate, -1), 'yyyy-MM-dd')
    if (!examsTomorrow[prev]) examsTomorrow[prev] = []
    examsTomorrow[prev].push({ subj, paper: parseInt(paper) })
  })

  // Week subject round-robin
  const weekSubjSeen = {}

  function getWeekMon(d) {
    return format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  }

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
    const upcoming = Object.entries(examDateMap)
      .filter(([k]) => k.startsWith(`${subjName}-`) && examDateMap[k] >= date)
      .map(([, d]) => d)
    if (!upcoming.length) return baseRatio
    const nearestDays = differenceInDays(new Date(Math.min(...upcoming.map(d => d.getTime()))), date)
    if (nearestDays <= 7)  return [1, 3]
    if (nearestDays <= 21) return [1, 2]
    return baseRatio
  }

  function subjMeta(subjName) {
    return subjects.find(x => x.name === subjName)
  }

  function placeSession(date, currentMin, endMin, subjName, paper, stype, isEmergency = false) {
    const meta = subjMeta(subjName)
    const dur = isEmergency ? CONTENT_DUR
      : stype === 'content' ? CONTENT_DUR
      : getExamDuration(subjName, paper, meta?.board, meta?.tier, meta?.qualification)

    if (currentMin + dur > endMin) {
      // Try content if exam doesn't fit
      if (stype === 'exam' && currentMin + CONTENT_DUR <= endMin) {
        stype = 'content'
      } else {
        return null
      }
    }

    const name = isEmergency
      ? `EMERGENCY: ${subjName} Paper ${paper} – Final Revision`
      : getSessionName(subjName, paper, stype, counters, topicFocus[`${subjName}-${paper}`])

    const session = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      subject: subjName,
      paper,
      type: isEmergency ? 'Emergency Revision' : stype === 'content' ? 'Content Revision' : 'Exam Practice',
      title: name,
      date: format(date, 'yyyy-MM-dd'),
      start: fmtTime(currentMin),
      end:   fmtTime(currentMin + dur),
      startTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(),
        Math.floor(currentMin/60), currentMin%60).toISOString(),
      endTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(),
        Math.floor((currentMin+dur)/60), (currentMin+dur)%60).toISOString(),
      duration: dur,
      isEmergency,
      completed: false,
      source: 'generated',
    }
    return { session, newMin: currentMin + dur + GAP_MINUTES, stype }
  }

  // ── Day loop ────────────────────────────────────────────────────────────
  let current = new Date(startDate)
  const end   = new Date(endDate)

  while (current <= end) {
    const dateStr  = format(current, 'yyyy-MM-dd')
    const dow      = current.getDay()
    const isSunday = dow === 0

    // Update completed
    Object.entries(examDateMap).forEach(([key, edate]) => {
      if (edate < current) completed.add(key.replace('-', '-'))
    })

    const startMin = dayStartMin(current, availability)
    if (startMin === null && !isSunday) {
      current = addDays(current, 1)
      continue
    }

    // Holiday / unavailable period — a genuine blackout now. Previously this only
    // softened the day-cap rule on the specific capped weekday and did nothing on any
    // other day, so declaring a holiday barely changed what got scheduled. Skips
    // everything for the day, including emergency sessions — an explicitly-declared
    // unavailable period (e.g. a family trip) takes precedence over an exam being close.
    if (isHoliday(current, holidays)) {
      current = addDays(current, 1)
      continue
    }

    // Sunday: emergency sessions only
    if (isSunday) {
      const emergencies = emergencyMap[dateStr] || []
      if (!emergencies.length) { current = addDays(current, 1); continue }
      let curMin = 15 * 60  // Sunday always starts at 15:00
      const endMin = extendedFromDate && current >= new Date(extendedFromDate) ? 22 * 60 : 21 * 60
      emergencies.forEach(({ subj, paper }) => {
        const result = placeSession(current, curMin, endMin, subj, paper, 'content', true)
        if (result) { sessions.push(result.session); curMin = result.newMin }
      })
      current = addDays(current, 1)
      continue
    }

    const endMin = dayEndMin(current, availability,
      extendedFromDate && current >= new Date(extendedFromDate))

    // Day cap(s) — was a single hardcoded Tuesday-only rule; now any number of days can
    // each have their own max, and an optional flat maxSessionsPerDay applies everywhere.
    const dayCapForToday = dayCapMap[dow]
    const effectiveCap = [dayCapForToday, maxSessionsPerDay].filter(v => v != null)
    const isDayCapped = effectiveCap.length > 0
    const capLimit = isDayCapped ? Math.min(...effectiveCap) : Infinity

    let curMin = startMin
    let slotsUsed = 0

    // Emergency sessions first
    const emergencies = emergencyMap[dateStr] || []
    emergencies.forEach(({ subj, paper }) => {
      if (isDayCapped && slotsUsed >= capLimit) return
      if (curMin >= endMin) return
      const result = placeSession(current, curMin, endMin, subj, paper, 'content', true)
      if (result) { sessions.push(result.session); curMin = result.newMin; slotsUsed++ }
    })

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

    if (preExamSubjs.length > 0) {
      let i = 0
      while (curMin + CONTENT_DUR <= endMin) {
        if (isDayCapped && slotsUsed >= capLimit) break
        const subj = preExamSubjs[i % preExamSubjs.length]
        const ap = activePapers(subj).filter(p => preExamPapersMap[subj]?.includes(p))
        if (!ap.length) { i++; if (i > preExamSubjs.length * 3) break; continue }
        const stype = nextSessionType(subj)
        const paper = pickPaper(subj, stype, current, ap)
        if (!paper) { i++; continue }
        const dur = stype === 'content' ? CONTENT_DUR : getExamDuration(subj, paper, subjMeta(subj)?.board, subjMeta(subj)?.tier, subjMeta(subj)?.qualification)
        if (curMin + dur > endMin) {
          if (curMin + CONTENT_DUR <= endMin) {
            const result = placeSession(current, curMin, endMin, subj, paper, 'content')
            if (result) { sessions.push(result.session); curMin = result.newMin; typePtr[subj]++; slotsUsed++ }
          }
          break
        }
        const result = placeSession(current, curMin, endMin, subj, paper, stype)
        if (result) {
          sessions.push(result.session)
          curMin = result.newMin
          typePtr[subj]++
          slotsUsed++
        }
        i++
        if (i > 40) break
      }
    } else {
      // Normal sessions
      const wmon = getWeekMon(current)
      if (!weekSubjSeen[wmon]) weekSubjSeen[wmon] = new Set()

      const examsToday = examsByDate[dateStr] || []
      const examsTodayMap = {}
      examsToday.forEach(e => {
        if (!examsTodayMap[e.subj]) examsTodayMap[e.subj] = []
        examsTodayMap[e.subj].push(e.paper)
      })

      const notSeen = activeSubjects
        .filter(s => !weekSubjSeen[wmon].has(s.name))
        .sort((a,b) => (a.priority?0:1)-(b.priority?0:1))
      const seen = activeSubjects
        .filter(s => weekSubjSeen[wmon].has(s.name))
        .sort((a,b) => (a.priority?0:1)-(b.priority?0:1))
      const ordered = [...notSeen, ...seen]

      for (const subj of ordered) {
        if (curMin + CONTENT_DUR > endMin) break
        if (isDayCapped && slotsUsed >= capLimit) break

        const ap = activePapers(subj.name)
        if (!ap.length) continue

        const ratioToday = effectiveRatio(subj.name, subj.ratio, current)
        let stype = nextSessionType(subj.name, ratioToday)
        let paper = pickPaper(subj.name, stype, current)
        if (!paper) continue

        // Skip paper if its exam is today
        if (examsTodayMap[subj.name]?.includes(paper)) {
          const alts = ap.filter(p => !examsTodayMap[subj.name]?.includes(p))
          if (!alts.length) continue
          paper = alts[(stype === 'content' ? contentPtr[subj.name] : examPtr[subj.name]) % alts.length]
        }

        const dur = stype === 'content' ? CONTENT_DUR : getExamDuration(subj.name, paper, subj.board, subj.tier, subj.qualification)
        if (curMin + dur > endMin) {
          if (stype === 'exam' && curMin + CONTENT_DUR <= endMin) stype = 'content'
          else continue
        }

        const result = placeSession(current, curMin, endMin, subj.name, paper, stype)
        if (result) {
          sessions.push(result.session)
          curMin = result.newMin
          typePtr[subj.name]++
          advancePaperPtr(subj.name, result.stype, current)
          weekSubjSeen[wmon].add(subj.name)
          slotsUsed++
        }
      }
    }

    current = addDays(current, 1)
  }

  return sessions
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
      ?.sort() || [1, 2]

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
      qualification: s.qualification || 'GCSE',
      papers: papers.length ? papers : [1, 2],
      ratio,
      examDates,
      priority: ['Mathematics','Further Mathematics','Computer Science','Physics'].includes(s.name),
    }
  })
}
