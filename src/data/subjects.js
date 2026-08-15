// src/data/subjects.js
// ─────────────────────────────────────────────────────────────────────────────
// AUDIT NOTES (v4 — naming-consistency pass across topics.js/paperDatabase.js/examDates2026.js/
// examDatabase.js, triggered by a systematic cross-file scan for subject-name mismatches)
//
// - Found and fixed real naming bugs (applied in the other files, not here): "Food Preparation
//   and Nutrition" vs "& Nutrition", "Chinese (Mandarin)"/bare "Chinese" vs "Mandarin Chinese",
//   an internal inconsistency where examDates2026.js used BOTH "Drama and Theatre" and "Drama &
//   Theatre" for the same AQA qualification, and inconsistent Cambridge National naming.
// - Two cases that LOOKED like the same bug turned out not to be, on verification against CCEA's
//   own specification pages: CCEA's GCSE Design & Technology equivalent is genuinely, officially
//   titled "Technology and Design" (ccea.org.uk/key-stage-4/gcse/subjects/gcse-technology-and-
//   design-2017), and CCEA's GCSE Business equivalent is genuinely, officially titled "Business
//   Studies" (ccea.org.uk/key-stage-4/gcse/subjects/gcse-business-studies-2017) — both distinct
//   from AQA/Edexcel's "Design & Technology" and "Business" specs, not misspellings of them. Both
//   already existed correctly in examDates2026.js's and paperDatabase.js's CCEA entries, but were
//   missing from this file's subject lists entirely — meaning a CCEA student had no way to select
//   either by its correct name. Added both here (GCSE and, since CCEA also offers a GCE version of
//   each, AS-Level/A-Level too) and added matching topics.js content under the correct CCEA names.
// ─────────────────────────────────────────────────────────────────────────────
// AUDIT NOTES (v3 — checked against topics.js/paperDatabase.js/examDates2026.js's July 2026
// AS-Level depth pass and 2027 dates addition; no data below needed changing)
//
// - Re-verified 'OCR' is still the correct board key to use throughout this app even though the
//   board itself legally renamed to "Cambridge OCR" in September 2025 — same organisation, same
//   qualifications, new corporate name. Not changed here since 'OCR' is what topics.js,
//   paperDatabase.js and examDates2026.js all key off; renaming it here alone would break every
//   lookup into those files. If the app's UI should start showing "Cambridge OCR" as a label,
//   that's a display-layer change (e.g. in Settings.jsx/Onboarding.jsx), not a data-key change.
// - GRADE_OPTIONS' AS-Level A–E (no A*) scale and EXAM_BOARDS' acknowledged 'Cambridge' (CIE) gap
//   were both re-checked and are correct as documented in the v2 notes below.
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
  'Computer Science', 'Engineering', 'Design & Technology', 'Technology and Design',
  'Art & Design', 'Music', 'Drama',
  'Physical Education',
  'French', 'German', 'Spanish', 'Mandarin Chinese', 'Arabic', 'Polish', 'Urdu', 'Latin',
  'Religious Studies', 'Sociology', 'Psychology',
  'Business', 'Business Studies', 'Economics',
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
  'Business', 'Business Studies', 'Economics', 'Accounting',
  'Law', 'Politics',
  'Media Studies', 'Film Studies',
  'Design and Technology: Product Design', 'Technology and Design',
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
  'Business', 'Business Studies', 'Economics', 'Accounting',
  'Law', 'Politics',
  'Media Studies',
  'Design and Technology: Product Design', 'Technology and Design',
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

// All qualification values the app understands, in the order they should appear in pickers.
export const QUALIFICATIONS = ['GCSE', 'AS-Level', 'A-Level', 'BTEC-L2', 'BTEC-L3']

// A student's account has one primary profile.qualification, but AS-Level and A-Level are
// deliberately mixable per-subject (e.g. A-Level Maths alongside AS-Level Further Maths) —
// see Settings/Onboarding. Every place that needs "what qualification is THIS subject at"
// should go through this helper rather than reading profile.qualification directly, so a
// per-subject override is never silently ignored. Falls back to the account-level
// qualification for subjects added before per-subject qualification existed.
export function getSubjectQualification(subject, profile) {
  return subject?.qualification || profile?.qualification || 'GCSE'
}

export const SUBJECT_COLOURS = {
  'Biology':'#27ae60','Chemistry':'#8e44ad','Physics':'#2980b9',
  'Combined Science':'#0d9488',
  'Combined Science: Trilogy':'#16a085','Combined Science: Synergy':'#1abc9c',
  'Mathematics':'#e74c3c','Further Mathematics':'#c0392b','Statistics':'#e67e22',
  'English Language':'#f39c12','English Literature':'#d35400','English Language & Literature':'#ef6c00',
  'History':'#795548','Geography':'#4caf50',
  'Computer Science':'#3498db','Engineering':'#607d8b',
  'Design & Technology':'#9c27b0','Design and Technology: Product Design':'#7b1fa2','Technology and Design':'#8e24aa',
  'Art & Design':'#e91e63','Photography':'#6a1b9a','Music':'#673ab7','Drama':'#ff5722','Drama and Theatre':'#ff5722',
  'Physical Education':'#ff9800',
  'French':'#1565c0','German':'#b71c1c','Spanish':'#e65100',
  'Mandarin Chinese':'#c62828','Arabic':'#1b5e20','Polish':'#283593','Urdu':'#4a148c',
  'Latin':'#5d4037','Classical Greek':'#4e342e',
  'Religious Studies':'#8d6e63','Philosophy':'#6d4c41','Sociology':'#546e7a','Psychology':'#5e35b1',
  'Business':'#00897b','Business Studies':'#00897b','Economics':'#00acc1','Accounting':'#0097a7',
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

// Foundation/Higher tiering is a GCSE-only concept in England (never AS-Level or A-Level — see
// audit note above). This was previously duplicated, slightly differently, in both
// examDates2026.js and paperDatabase.js (examDates2026.js and paperDatabase.js agreed with each
// other on the modern-language subjects but this list here didn't have them at all, meaning
// isTiered('French') returned false — wrong, GCSE French *is* tiered). This is now the one place
// it's defined; the other two files import it from here instead of keeping their own copy.
//
// 2026-08-14 data-fixing-chat pass: removed 'Further Mathematics' (it isn't tiered — GCSE FM is a
// single untiered paper, and paperDatabase.js already stored it that way; having it here made the
// UI capable of showing a nonsensical Higher/Foundation choice for a qualification that has none).
// Added 'Bengali', 'Modern Hebrew', 'Panjabi' — confirmed tiered (Higher/Foundation) against AQA's
// official June 2025 grade boundaries document, but missing here, which meant getBoundaries()
// couldn't find their real boundary data even once it existed in paperDatabase.js.
// Same pass, second update: added 'Arabic', 'Greek', 'Gujarati', 'Japanese', 'Persian',
// 'Portuguese', 'Russian', 'Turkish' — Edexcel-only community languages, confirmed tiered against
// Pearson's official June 2025 GCSE grade boundaries document, same missing-from-list problem.
export const TIERED_SUBJECTS = [
  'Mathematics','Biology','Chemistry','Physics',
  'Combined Science','Combined Science: Trilogy','Combined Science: Synergy','Statistics',
  'Arabic','Bengali','French','German','Greek','Gujarati','Italian','Japanese','Mandarin Chinese',
  'Modern Hebrew','Panjabi','Persian','Polish','Portuguese','Russian','Spanish','Turkish','Urdu',
  'Welsh Second Language',
]

export function isTiered(subjectName) {
  return TIERED_SUBJECTS.includes(subjectName)
}

export const XP_REWARDS = {
  sessionCompleted: 50,
  paperCompleted: 100,
  streakDay: 25,
  streakWeek: 100,
  streakMonth: 500,
  friendAdded: 20,
  onboardingComplete: 100, // was 200 and, separately, never actually used anywhere — Onboarding.jsx
                            // computes its own xpPreview instead. Aligned to match that value now
                            // that xpPreview is capped (see Onboarding.jsx) rather than left stale.
  topicConfidenceUpdated: 10,
  mistakeLogged: 15,
  noteAdded: 10,
}

// LEVELS — rebuilt as a genuinely CUMULATIVE curve (harder + fixes a real bug, not just a balance
// tweak). The previous formula, xpRequired: Math.floor(100 * Math.pow(1.15, i)), produced a
// standalone growing number per level (100, 115, 132, 152…) that was never actually a running
// total — but profile.xp only ever grows (awardXP does xp: increment(amount), it never resets),
// and Profile.jsx compares profile.xp directly against nextLvl.xpRequired. Once a user had done
// almost anything, their raw XP total would blow straight past these small per-level numbers,
// so the XP bar had no real ceiling to climb toward. xpRequired below is now the actual cumulative
// XP needed to REACH that level (level 1 = 0, needing 150 more to hit level 2, then a compounding
// 12% more XP per level after that), so profile.xp vs nextLvl.xpRequired is a meaningful comparison
// again. See levelFromXP() below and awardXP() in firestore.js, which now actually calls it —
// previously nothing ever wrote profile.level at all (not even an initial value in ensureUser),
// which is the direct cause of Profile.jsx always showing "Level 1" regardless of XP earned.
export const LEVELS = (() => {
  const levels = []
  let cumulative = 0
  let increment  = 150
  for (let i = 0; i < 50; i++) {
    levels.push({
      level: i + 1,
      xpRequired: cumulative,
      title: [
        'Newcomer','Studier','Consistent','Rising','Focused',
        'Dedicated','Diligent','Scholar','High Achiever','Master',
      ][Math.floor(i / 5)] || 'Legend',
    })
    cumulative += increment
    increment = Math.floor(increment * 1.12)
  }
  return levels
})()

// Given a cumulative XP total, returns the level it corresponds to (1–50, clamped at the top).
// LEVELS is sorted ascending by xpRequired, so this is "the highest level whose threshold has
// been met" — plain linear scan since the list is only 50 entries long, not worth a binary search.
export function levelFromXP(xp) {
  let lvl = 1
  for (const l of LEVELS) {
    if ((xp || 0) >= l.xpRequired) lvl = l.level
    else break
  }
  return lvl
}

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
