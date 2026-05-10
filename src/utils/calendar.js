// src/utils/calendar.js
import { format, addDays, startOfWeek, eachDayOfInterval,
         isSameDay, differenceInDays } from 'date-fns'

// ── KNOWN SUBJECTS & ALIASES ──────────────────────────────────────────────────
export const KNOWN_SUBJECTS = [
  'Mathematics','Further Mathematics','English Language','English Literature',
  'Biology','Chemistry','Physics','Combined Science','Geography','History',
  'Computer Science','German','French','Spanish','Business Studies','Business',
  'Religious Studies','Psychology','Sociology','Art & Design','Music','Drama',
  'Physical Education','PE','Maths','Further Maths','Comp Sci','Eng Lit','Eng Lang',
  'Science','Economics','Media Studies','Film Studies','Law',
]

const SUBJECT_ALIASES = {
  'Maths':             'Mathematics',
  'Further Maths':     'Further Mathematics',
  'Comp Sci':          'Computer Science',
  'Eng Lit':           'English Literature',
  'Eng Lang':          'English Language',
  'Business':          'Business Studies',
  'PE':                'Physical Education',
  'Science':           'Combined Science',
}

const BOARD_PREFIXES = ['AQA','Edexcel','OCR','WJEC','CCEA','Cambridge','Pearson']

const SESSION_TYPE_KEYWORDS = {
  'Content Revision':   ['content revision','content session','notes','learning'],
  'Exam Practice':      ['exam practice','past paper','exam question','mock','specimen'],
  'Emergency Revision': ['emergency','final revision','last minute','⚠'],
}

// ── SESSION TITLE PARSER ──────────────────────────────────────────────────────
export function parseSessionTitle(title) {
  if (!title) return {}
  const result = {}
  const t = title.toLowerCase()

  // Session type
  for (const [type, keywords] of Object.entries(SESSION_TYPE_KEYWORDS)) {
    if (keywords.some(k => t.includes(k))) {
      result.type = type
      if (type === 'Emergency Revision') result.isEmergency = true
      break
    }
  }

  // Paper number
  const paperMatch = title.match(/Paper\s+(\d+)/i) || title.match(/\bP(\d)\b/)
  if (paperMatch) result.paper = paperMatch[1]

  // Exam year
  const yearMatch = title.match(/\b(20\d{2})\b/)
  if (yearMatch) result.examYear = yearMatch[1]

  // Board
  for (const board of BOARD_PREFIXES) {
    if (title.toUpperCase().includes(board.toUpperCase())) {
      result.board = board
      break
    }
  }

  // Subject — strip known prefixes then match
  let cleaned = title
    .replace(/^⚠\s*EMERGENCY:\s*/i, '')
    .replace(/\s*[–\-]\s*.+$/, '')              // remove after dash
    .replace(new RegExp(`^(${BOARD_PREFIXES.join('|')})\\s+`, 'i'), '')
    .replace(/\b(Higher|Foundation|Level\s*2)\b/gi, '')
    .replace(/Paper\s*\d+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  for (const subj of KNOWN_SUBJECTS) {
    if (cleaned.toLowerCase().includes(subj.toLowerCase())) {
      result.subject = SUBJECT_ALIASES[subj] || subj
      break
    }
  }

  // Fallback: use cleaned title if it looks like a subject name
  if (!result.subject && cleaned.length >= 3 && cleaned.length <= 50) {
    result.subject = cleaned
    result.subjectUnrecognised = true
  }

  return result
}

// ── ICS PARSER — handles folded lines, TZID, all DTSTART formats ──────────────
export function parseICS(icsText) {
  // Step 1: unfold lines (RFC 5545 — continuation lines start with space or tab)
  const unfolded = icsText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n[ \t]/g, '')   // unfold: join continuation lines

  const lines   = unfolded.split('\n')
  const events  = []
  let current   = null

  for (const raw of lines) {
    const line = raw.trim()

    if (line === 'BEGIN:VEVENT') {
      current = {}
      continue
    }
    if (line === 'END:VEVENT') {
      if (current) events.push(current)
      current = null
      continue
    }
    if (!current) continue

    // Split key (possibly with params) from value
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue

    const keyPart = line.slice(0, colonIdx)
    const val     = line.slice(colonIdx + 1)

    // Key may have params e.g. DTSTART;TZID=Europe/London
    const key = keyPart.split(';')[0].toUpperCase()

    switch (key) {
      case 'SUMMARY':     current.title       = unescapeICS(val); break
      case 'DTSTART':     current.start       = parseICSDate(val); break
      case 'DTEND':       current.end         = parseICSDate(val); break
      case 'DURATION':    current.icsDuration = val; break
      case 'DESCRIPTION': current.description = unescapeICS(val); break
      case 'LOCATION':    current.location    = unescapeICS(val); break
      case 'UID':         current.uid         = val; break
      case 'CATEGORIES':  current.categories  = val; break
    }
  }

  // Enrich with parsed session metadata
  return events
    .filter(e => e.title || e.description)
    .map(e => {
      const parsed   = parseSessionTitle(e.title || '')
      const duration = e.start && e.end
        ? Math.round((e.end.getTime() - e.start.getTime()) / 60000)
        : parseDuration(e.icsDuration) || 45
      return { ...e, ...parsed, duration }
    })
}

function unescapeICS(str) {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
}

function parseDuration(dur) {
  if (!dur) return null
  // e.g. PT45M, PT1H30M
  const h = dur.match(/(\d+)H/)?.[1] || 0
  const m = dur.match(/(\d+)M/)?.[1] || 0
  return parseInt(h) * 60 + parseInt(m)
}

export function parseICSDate(str) {
  if (!str) return null
  try {
    // Remove any TZID param if present (already stripped by key parser, but handle raw value)
    const s = str.split(':').pop().trim()

    // All-day: YYYYMMDD
    if (/^\d{8}$/.test(s)) {
      return new Date(
        parseInt(s.slice(0,4)),
        parseInt(s.slice(4,6)) - 1,
        parseInt(s.slice(6,8)),
        9, 0, 0   // default 09:00 for all-day events
      )
    }

    // DateTime: YYYYMMDDTHHmmss[Z]
    if (/^\d{8}T\d{6}/.test(s)) {
      const yr  = parseInt(s.slice(0,4))
      const mo  = parseInt(s.slice(4,6)) - 1
      const dy  = parseInt(s.slice(6,8))
      const hr  = parseInt(s.slice(9,11))
      const min = parseInt(s.slice(11,13))
      const sec = parseInt(s.slice(13,15))

      if (s.endsWith('Z')) {
        // UTC — convert to local (UK = UTC+0 winter, UTC+1 summer)
        const utc = new Date(Date.UTC(yr, mo, dy, hr, min, sec))
        return utc
      }
      // Local time (no Z) — treat as-is
      return new Date(yr, mo, dy, hr, min, sec)
    }

    // ISO 8601 fallback
    const d = new Date(s)
    return isNaN(d.getTime()) ? null : d
  } catch {
    return null
  }
}

// ── CSV IMPORT ────────────────────────────────────────────────────────────────
export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/"/g,''))
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line)
    const obj  = {}
    headers.forEach((h, i) => { obj[h] = (vals[i]||'').trim().replace(/"/g,'') })
    const titleField = obj.title || obj['session name'] || obj.summary || obj.subject || ''
    const parsed     = parseSessionTitle(titleField)
    return {
      ...obj, ...parsed,
      title: titleField,
      start: obj.date || obj.start || obj.dtstart ? new Date(obj.date||obj.start||obj.dtstart) : null,
    }
  }).filter(r => r.title || r.subject)
}

function parseCSVLine(line) {
  const result = []; let current = ''; let inQuotes = false
  for (const ch of line) {
    if (ch === '"') inQuotes = !inQuotes
    else if (ch === ',' && !inQuotes) { result.push(current); current = '' }
    else current += ch
  }
  result.push(current)
  return result
}

// ── ICS EXPORT ────────────────────────────────────────────────────────────────
export function generateICS(sessions) {
  const fmtDt = (d) => {
    const dt = d instanceof Date ? d : new Date(d)
    if (isNaN(dt.getTime())) return null
    return format(dt, "yyyyMMdd'T'HHmmss")
  }

  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0',
    'PRODID:-//RevisionFlow//EN',
    'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:RevisionFlow Schedule',
    'X-WR-TIMEZONE:Europe/London',
    'METHOD:PUBLISH',
  ]

  for (const s of sessions) {
    const start = s.startTime ? new Date(s.startTime) : s.date ? new Date(s.date+'T'+(s.start||'09:00')) : null
    const end   = s.endTime   ? new Date(s.endTime)
                : start       ? new Date(start.getTime() + (s.duration||45)*60000)
                : null

    if (!start || isNaN(start.getTime())) continue

    const dtStart = fmtDt(start)
    const dtEnd   = end && !isNaN(end.getTime()) ? fmtDt(end) : fmtDt(new Date(start.getTime()+45*60000))

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${s.id||Math.random().toString(36).slice(2)}@revisionflow`)
    lines.push(`DTSTART:${dtStart}`)
    lines.push(`DTEND:${dtEnd}`)
    lines.push(`SUMMARY:${(s.title||s.subject||'Revision').replace(/,/g,'\\,')}`)
    if (s.notes||s.description) {
      lines.push(`DESCRIPTION:${(s.notes||s.description||'').replace(/\n/g,'\\n').replace(/,/g,'\\,')}`)
    }
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function downloadICS(sessions, filename = 'revisionflow-calendar.ics') {
  const content = generateICS(sessions)
  const blob    = new Blob([content], { type:'text/calendar;charset=utf-8' })
  const url     = URL.createObjectURL(blob)
  const a       = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ── CALENDAR GRID HELPERS ─────────────────────────────────────────────────────
export function getMonthDays(year, month) {
  const first    = new Date(year, month, 1)
  const last     = new Date(year, month+1, 0)
  const startPad = first.getDay() === 0 ? 6 : first.getDay() - 1
  const days     = []
  for (let i = startPad; i > 0; i--)
    days.push({ date: addDays(first, -i), otherMonth: true })
  for (let d = 1; d <= last.getDate(); d++)
    days.push({ date: new Date(year, month, d), otherMonth: false })
  while (days.length % 7 !== 0)
    days.push({ date: addDays(last, days.length - last.getDate() - startPad + 1), otherMonth: true })
  return days
}

export function getWeekDays(date) {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end: addDays(start, 6) })
}

export function sessionsForDay(sessions, date) {
  return sessions.filter(s => {
    const d = s.startTime ? new Date(s.startTime) : s.date ? new Date(s.date) : null
    return d && !isNaN(d.getTime()) && isSameDay(d, date)
  }).sort((a, b) => {
    const ta = a.start || ''
    const tb = b.start || ''
    return ta.localeCompare(tb)
  })
}

// ── COUNTDOWN HELPERS ─────────────────────────────────────────────────────────
// Canonical day difference — always date-only, no time contamination.
// Exam dates stored as YYYY-MM-DD parse as midnight UTC which in BST (UTC+1)
// becomes 11pm the night before. Stripping time from both sides gives the
// correct whole-number answer consistently across all components.
export function daysUntilExam(examDateStr) {
  if (!examDateStr) return null
  const parts = String(examDateStr).slice(0, 10).split('-').map(Number)
  const examDay = new Date(parts[0], parts[1] - 1, parts[2]) // local midnight on exam day
  const today = new Date()
  today.setHours(0, 0, 0, 0)                                 // local midnight today
  return Math.round((examDay - today) / 86400000)
}

export function countdownLabel(examDate) {
  const days = daysUntilExam(examDate)
  if (days === null) return '—'
  if (days < 0)   return 'Completed'
  if (days === 0) return 'TODAY'
  if (days === 1) return 'Tomorrow'
  if (days < 7)   return days + ' days'
  if (days < 14)  return '1 week'
  if (days < 21)  return '2 weeks'
  return Math.ceil(days / 7) + ' weeks'
}

export function countdownUrgency(examDate) {
  const days = daysUntilExam(examDate)
  if (days === null || days < 0) return 'done'
  if (days <= 7)  return 'urgent'
  if (days <= 21) return 'soon'
  return 'normal'
}

export function gradeColour(grade) {
  const map = {
    '9':'#7c3aed','8':'#2563eb','7':'#0891b2','6':'#059669',
    '5':'#65a30d','4':'#ca8a04','3':'#d97706','2':'#ea580c',
    '1':'#dc2626','U':'#6b7280',
    'A*':'#7c3aed','A':'#2563eb','B':'#059669','C':'#ca8a04','D':'#d97706','E':'#dc2626',
  }
  return map[grade] || '#6b7280'
}

export function calculateGrade(score, maxMarks, boundaries) {
  if (!boundaries) return null
  const grades = ['9','8','7','6','5','4','3','2','1']
  for (let i = 0; i < boundaries.length; i++) {
    if (boundaries[i] !== null && score >= boundaries[i]) return grades[i]
  }
  return 'U'
}
