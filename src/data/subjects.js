// src/data/subjects.js
// ─────────────────────────────────────────────────────────────────────────────
// AUDIT NOTES (v2 — reconciled against topics.js after its GCSE/AS-Level/A-Level rebuild)
//
// Every subject below was checked against what actually exists in topics.js (i.e. has a real
// topic list behind it) rather than assumed. Where the two files disagreed, the fix is documented
// inline next to the change. See topics.js's own header for the full audit trail on that side.
//
// FIXES APPLIED vs v1:
//   - GCSE_SUBJECTS: 'Business Studies' -> 'Business'. AQA's reformed spec (8132) is officially
//     titled "GCSE Business", not "GCSE Business Studies" — confirmed directly against AQA's
//     specification. topics.js's AQA GCSE key was renamed to match.
//   - GCSE_SUBJECTS: added 'Combined Science' — the generic title used by Edexcel/OCR/Eduqas/CCEA.
//     Only AQA splits Combined Science into two named routes ('Combined Science: Trilogy' and
//     'Combined Science: Synergy'); the other four boards just call it 'Combined Science'. Without
//     this entry, students on any board except AQA had no way to select their actual GCSE science
//     combination.
//   - GCSE_SUBJECTS: added 'Latin' — OCR offers GCSE Latin (J282) and topics.js has a full topic
//     list for it, but it was missing from this picker entirely.
//   - ALEVEL_SUBJECTS: 'Drama & Theatre Studies' -> 'Drama and Theatre'. Confirmed against AQA's
//     live specification (7262): the qualification is officially "A-level Drama and Theatre".
//   - ALEVEL_SUBJECTS: merged 'Design & Technology' and 'Product Design' into one entry, 'Design
//     and Technology: Product Design'. These were listed as two separate subjects, but AQA's A-level
//     (7552) is a single qualification with a compound title — there's no separate "Product Design"
//     A-level to distinguish it from. Having both in the list meant one of them could never resolve
//     to any topics.js content.
//   - ALEVEL_SUBJECTS: removed 'Engineering'. An extensive check against live 2026 specifications
//     and exam timetables (AQA, Edexcel, OCR, Eduqas, CCEA) turned up no evidence of a current
//     standalone A-level Engineering qualification from any of them — Engineering exists at GCSE
//     and as a BTEC (see BTEC_L2_SUBJECTS / BTEC_L3_SUBJECTS, both already list it), but not as an
//     A-level in its own right currently. If you know of a board that does offer this, it's easy to
//     add back — I just couldn't confirm it, and topics.js had zero content for it either way.
//   - ALEVEL_SUBJECTS: 'Environmental Science', 'English Language & Literature', 'Mandarin Chinese',
//     'Arabic', 'Film Studies' and 'Photography' were already listed here but had NO topics.js
//     content under any board — these are all real, currently-live qualifications (verified), so
//     topics.js was extended to cover them rather than removing them from this list.
//
// NEW IN v2:
//   - Added AS_LEVEL_SUBJECTS, mirroring the new ASLEVEL tier in topics.js. Built directly from
//     what topics.js actually contains (35 subjects) rather than just copying ALEVEL_SUBJECTS —
//     it's one entry short of ALEVEL_SUBJECTS (no Film Studies) because Eduqas's Film Studies has
//     no standalone AS-Level content in topics.js. If that gets added later, add it here too.
//   - GRADE_OPTIONS gained an 'AS-Level' scale: A, B, C, D, E, U — deliberately NO A*. A* only
//     exists at full A-level; AS-Level (whether the decoupled AQA/Edexcel/OCR/Eduqas standalone
//     qualification, or CCEA's linear first-half units) is graded on a five-point A–E scale. Using
//     the A-Level scale for AS-Level would let the app record a grade that doesn't exist.
//   - getGradeOptions() and getSubjectList() updated to recognise 'AS-Level' as a qualification value.
//   - SUBJECT_COLOURS: added a colour for the new 'Combined Science' and 'English Language &
//     Literature' entries; consolidated the Drama/Business/Design & Technology colour keys to match
//     the renamed subjects above; fixed two accidental colour collisions that would have made
//     same-list subjects indistinguishable in any UI that colour-codes by subject — Philosophy and
//     Psychology were both '#6d4c41', and History and Religious Studies were both '#795548'.
//   - Fixed a literal placeholder string, `"Subject Title"`, left in both BTEC_L2_SUBJECTS and
//     BTEC_L3_SUBJECTS — it isn't a real BTEC subject, just an unfilled template row.
//
// LEFT AS-IS (flagging rather than changing):
//   - EXAM_BOARDS keeps 'WJEC' (not 'Eduqas/WJEC') as the display value — topics.js's board-alias
//     resolution already maps 'WJEC' (and 'Eduqas') to its 'Eduqas/WJEC' data, and 'WJEC' reads
//     better as a picker label than the combined name, so no change needed here.
//   - EXAM_BOARDS also keeps 'Cambridge' (CIE). topics.js has zero content for this board — it's an
//     entirely different qualification family (IGCSE / Cambridge International A-Level) that wasn't
//     part of the topics.js rebuild. If the app lets a user pick Cambridge as a board today, they'll
//     hit an empty topic list. Left in rather than removed since that's a bigger, separate scope
//     decision, but worth knowing about.
//   - BTEC_L2_SUBJECTS / BTEC_L3_SUBJECTS otherwise untouched — topics.js doesn't cover BTEC (it's a
//     unit/assignment structure, not exam papers, so "topics" don't map the same way), so there was
//     nothing to reconcile there beyond the placeholder fix above.
//   - isTiered(): untouched. Tiering (Foundation/Higher) is a GCSE-only concept in England — AS-Level
//     and A-Level subjects are never tiered, so no AS-Level-specific handling was needed here.
//   - XP_REWARDS, LEVELS, BADGES: untouched — gamification config, not exam-specification data.
// ─────────────────────────────────────────────────────────────────────────────

export const EXAM_BOARDS = ['AQA', 'Edexcel', 'OCR', 'WJEC', 'CCEA', 'Cambridge']

export const GCSE_SUBJECTS = [
  'Biology', 'Chemistry', 'Physics', 'Combined Science', 'Combined Science: Trilogy', 'Combined Science: Synergy',
  'Mathematics', 'Further Mathematics', 'Statistics',
  'English Language', 'English Literature',
  'History', 'Geography',
  'Computer Science', 'Engineering', 'Design & Technology',
  'Art & Design', 'Music', 'Drama',
  'Physical Education',
  'French', 'German', 'Spanish', 'Mandarin Chinese', 'Arabic', 'Polish', 'Urdu', 'Latin',
  'Religious Studies', 'Sociology', 'Psychology',
  'Business', 'Economics',
  'Media Studies', 'Film Studies',
  'Food Preparation & Nutrition',
]

export const ALEVEL_SUBJECTS = [
  'Biology', 'Chemistry', 'Physics',
  'Mathematics', 'Further Mathematics', 'Statistics',
  'English Language', 'English Literature', 'English Language & Literature',
  'History', 'Geography',
  'Computer Science',
  'Art & Design', 'Photography', 'Music', 'Drama and Theatre',
  'Physical Education',
  'French', 'German', 'Spanish', 'Mandarin Chinese', 'Arabic', 'Latin', 'Classical Greek',
  'Religious Studies', 'Philosophy', 'Sociology', 'Psychology',
  'Business', 'Economics', 'Accounting',
  'Law', 'Politics',
  'Media Studies', 'Film Studies',
  'Design and Technology: Product Design',
  'Environmental Science',
]

// New tier — AS-Level is a genuinely separate, narrower qualification from A-Level (or, for CCEA,
// the first-half linear units), not just "year one of the A-level list". One entry short of
// ALEVEL_SUBJECTS: no 'Film Studies' (Eduqas's AS-Level Film Studies isn't in topics.js — A-Level
// only). Keep this list in sync with topics.js's ASLEVEL union if that changes.
export const AS_LEVEL_SUBJECTS = [
  'Biology', 'Chemistry', 'Physics',
  'Mathematics', 'Further Mathematics', 'Statistics',
  'English Language', 'English Literature', 'English Language & Literature',
  'History', 'Geography',
  'Computer Science',
  'Art & Design', 'Photography', 'Music', 'Drama and Theatre',
  'Physical Education',
  'French', 'German', 'Spanish', 'Mandarin Chinese', 'Arabic', 'Latin', 'Classical Greek',
  'Religious Studies', 'Philosophy', 'Sociology', 'Psychology',
  'Business', 'Economics', 'Accounting',
  'Law', 'Politics',
  'Media Studies',
  'Design and Technology: Product Design',
  'Environmental Science',
]

export const BTEC_L2_SUBJECTS = [
  "Animal Care",
  "Applied Science",
  "Art and Design",
  "Business",
  "Children and Young People's Workforce",
  "Construction and the Built Environment",
  "Creative Media Production",
  "Engineering",
  "Health and Social Care",
  "Hospitality",
  "Information Technology",
  "Land-based Technology",
  "Performing Arts",
  "Public Services",
  "Sport",
  "Travel and Tourism",
  "Vehicle Technology"
]

export const BTEC_L3_SUBJECTS = [
  "Animal Management",
  "Applied Human Biology",
  "Applied Law",
  "Applied Psychology",
  "Applied Science",
  "Art and Design",
  "Business",
  "Children's Play, Learning & Development",
  "Computing",
  "Construction & Built Environment",
  "Creative Media Production",
  "Engineering",
  "Enterprise & Entrepreneurship",
  "Esports",
  "Forensic & Criminal Investigation",
  "Health and Social Care",
  "Hospitality",
  "Information Technology",
  "Land and Environment",
  "Music",
  "Music Technology",
  "Performing Arts",
  "Public Services",
  "Sport",
  "Sport and Exercise Science",
  "Travel and Tourism"
]

export const GRADE_OPTIONS = {
  GCSE:                ['9','8','7','6','5','4','3','2','1','U'],
  'GCSE-Foundation':   ['5','4','3','2','1','U'],
  'Combined Science':  ['9-9','9-8','8-8','8-7','7-7','7-6','6-6','6-5','5-5','5-4','4-4','4-3','3-3','U'],
  'Combined-Foundation':['5-5','5-4','4-4','4-3','3-3','U'],
  'AS-Level':          ['A','B','C','D','E','U'],
  'A-Level':           ['A*','A','B','C','D','E','U'],
  'BTEC-L2':           ['D*','D','M','P','U'],
  'BTEC-L3':           ['D*D*','D*D','DD','DM','MM','MP','PP','U'],
}

export function getGradeOptions(subjectName, qualification, tier) {
  // Qualification takes absolute priority — must check before subject name
  if (qualification === 'BTEC-L3') return GRADE_OPTIONS['BTEC-L3']
  if (qualification === 'BTEC-L2') return GRADE_OPTIONS['BTEC-L2']
  if (qualification === 'AS-Level') return GRADE_OPTIONS['AS-Level']
  if (qualification === 'A-Level') return GRADE_OPTIONS['A-Level']

  if (!subjectName) return GRADE_OPTIONS.GCSE

  // Subject-name overrides (for subjects with unusual grading under GCSE qual)
  if (subjectName.startsWith('BTEC National')) return GRADE_OPTIONS['BTEC-L3']
  if (subjectName.startsWith('BTEC Tech Award')) return GRADE_OPTIONS['BTEC-L2']
  if (subjectName.includes('Combined Science')) {
    return tier === 'Foundation' ? GRADE_OPTIONS['Combined-Foundation'] : GRADE_OPTIONS['Combined Science']
  }
  if (tier === 'Foundation') return GRADE_OPTIONS['GCSE-Foundation']
  return GRADE_OPTIONS.GCSE
}

export function getSubjectList(qualification) {
  if (qualification === 'A-Level') return ALEVEL_SUBJECTS
  if (qualification === 'AS-Level') return AS_LEVEL_SUBJECTS
  if (qualification === 'BTEC-L2') return BTEC_L2_SUBJECTS
  if (qualification === 'BTEC-L3') return BTEC_L3_SUBJECTS
  return GCSE_SUBJECTS
}

export const SUBJECT_COLOURS = {
  'Biology':'#27ae60','Chemistry':'#8e44ad','Physics':'#2980b9',
  'Combined Science':'#0d9488',
  'Combined Science: Trilogy':'#16a085','Combined Science: Synergy':'#1abc9c',
  'Mathematics':'#e74c3c','Further Mathematics':'#c0392b','Statistics':'#e67e22',
  'English Language':'#f39c12','English Literature':'#d35400','English Language & Literature':'#ef6c00',
  'History':'#795548','Geography':'#4caf50',
  'Computer Science':'#3498db','Engineering':'#607d8b',
  'Design & Technology':'#9c27b0','Design and Technology: Product Design':'#7b1fa2',
  'Art & Design':'#e91e63','Photography':'#6a1b9a','Music':'#673ab7','Drama':'#ff5722','Drama and Theatre':'#ff5722',
  'Physical Education':'#ff9800',
  'French':'#1565c0','German':'#b71c1c','Spanish':'#e65100',
  'Mandarin Chinese':'#c62828','Arabic':'#1b5e20','Polish':'#283593','Urdu':'#4a148c',
  'Latin':'#5d4037','Classical Greek':'#4e342e',
  'Religious Studies':'#8d6e63','Philosophy':'#6d4c41','Sociology':'#546e7a','Psychology':'#5e35b1',
  'Business':'#00897b','Economics':'#00acc1','Accounting':'#0097a7',
  'Law':'#37474f','Politics':'#1a237e',
  'Media Studies':'#ad1457','Film Studies':'#880e4f',
  'Food Preparation & Nutrition':'#558b2f',
  'Environmental Science':'#2e7d32',
  'default':'#546e7a',
}

export function subjectColour(name) {
  if (!name) return SUBJECT_COLOURS.default
  if (name.startsWith('BTEC')) return '#e65100'
  return SUBJECT_COLOURS[name] || SUBJECT_COLOURS.default
}

export function isTiered(subjectName) {
  const tiered = ['Mathematics','Further Mathematics','Biology','Chemistry','Physics',
    'Combined Science','Combined Science: Trilogy','Combined Science: Synergy','Statistics']
  return tiered.includes(subjectName)
}

export const XP_REWARDS = {
  sessionCompleted: 50,
  paperCompleted: 100,
  streakDay: 25,
  streakWeek: 100,
  streakMonth: 500,
  friendAdded: 20,
  onboardingComplete: 200,
  topicConfidenceUpdated: 10,
  mistakeLogged: 15,
  noteAdded: 10,
}

export const LEVELS = Array.from({ length: 50 }, (_, i) => ({
  level: i + 1,
  xpRequired: Math.floor(100 * Math.pow(1.15, i)),
  title: [
    'Newcomer','Studier','Consistent','Rising','Focused',
    'Dedicated','Diligent','Scholar','High Achiever','Master',
  ][Math.floor(i / 5)] || 'Legend',
}))

export const BADGES = [
  { id: 'first_session',    name: 'First Step',      desc: 'Complete your first revision session',     icon: '🎯', xp: 50 },
  { id: 'streak_3',         name: 'Hat Trick',        desc: '3-day revision streak',                    icon: '🔥', xp: 75 },
  { id: 'streak_7',         name: 'Week Warrior',     desc: '7-day revision streak',                    icon: '💪', xp: 150 },
  { id: 'streak_30',        name: 'Monthly Master',   desc: '30-day revision streak',                   icon: '🏆', xp: 500 },
  { id: 'paper_10',         name: 'Paper Pusher',     desc: 'Complete 10 past papers',                  icon: '📝', xp: 100 },
  { id: 'paper_50',         name: 'Exam Expert',      desc: 'Complete 50 past papers',                  icon: '🎓', xp: 300 },
  { id: 'all_subjects',     name: 'Balanced Scholar', desc: 'Revise all your subjects in one week',     icon: '⚖️', xp: 200 },
  { id: 'session_100',      name: 'Centurion',        desc: '100 revision sessions completed',          icon: '💯', xp: 400 },
  { id: 'friend_5',         name: 'Study Squad',      desc: 'Add 5 friends',                           icon: '👥', xp: 100 },
  { id: 'grade_9',          name: 'Grade Master',     desc: 'Score a grade 9 on a past paper',          icon: '⭐', xp: 200 },
  { id: 'perfect_paper',    name: 'Perfectionist',    desc: 'Score 100% on a past paper',              icon: '💎', xp: 500 },
  { id: 'mistake_log_20',   name: 'Error Analyst',    desc: 'Log 20 mistakes in your mistake tracker', icon: '🔍', xp: 100 },
  { id: 'calendar_import',  name: 'Planner',          desc: 'Import a revision calendar',               icon: '📅', xp: 50 },
  { id: 'ai_plan',          name: 'AI Student',       desc: 'Generate an AI study plan',               icon: '🤖', xp: 75 },
]
