// src/utils/topicId.js
// ─────────────────────────────────────────────────────────────────────────────
// Canonical topic-document-ID scheme.
//
// WHY THIS FILE EXISTS:
// Topic confidence docs (users/{uid}/topics/{id}) were previously keyed as
// `${subjectName}_${topicName}` (sanitised) — with NO exam board and NO
// qualification (GCSE / AS-Level / A-Level / BTEC) in the key at all. That
// meant AQA GCSE Physics "Waves" and, say, a same-named A-Level topic could
// collide in Firestore, and switching board or qualification for a subject
// didn't give you a fresh topic list — it silently reused/overwrote the old
// one. This file is the single source of truth for building topic IDs so
// every part of the app (Topics, Onboarding, the topic-refresh banner) uses
// the exact same scheme and never re-implements it slightly differently.
//
// NEW FORMAT:  `${boardToken}_${qualToken}_${subject}_${topic}` (sanitised)
//   e.g. 'AQA_GCSE_Physics_Waves_Properties_and_behaviour'
//        'AQA_ALEVEL_Physics_Fields_Gravitational_Electric_and_Magnetic_Fields'
// OLD FORMAT (pre-migration): `${subject}_${topic}` — no board, no qualification.
// ─────────────────────────────────────────────────────────────────────────────

// Maps a qualification value (as stored on profile.qualification / subject.qualification)
// to a short, ID-safe token. Deliberately distinct tokens for AS-Level vs A-Level —
// they must never resolve to the same prefix.
const QUALIFICATION_TOKENS = {
  'GCSE':        'GCSE',
  'AS-Level':    'ASLEVEL',
  'A-Level':     'ALEVEL',
  'BTEC-L2':     'BTECL2',
  'BTEC-L3':     'BTECL3',
}

// Recognised board tokens once sanitised (letters/numbers only). Used both to build
// new IDs and, in isLegacyTopicId below, to recognise the new format.
const BOARD_TOKENS = ['AQA', 'Edexcel', 'OCR', 'WJEC', 'Eduqas', 'CCEA', 'Cambridge']
const QUALIFICATION_TOKEN_VALUES = Object.values(QUALIFICATION_TOKENS)

export function normalizeQualificationToken(qualification) {
  return QUALIFICATION_TOKENS[qualification] || 'GCSE'
}

function sanitize(str) {
  return String(str || '').replace(/[^a-zA-Z0-9_]/g, '_')
}

/**
 * Builds the canonical topic document ID for a given board + qualification +
 * subject + topic name. Always includes board and qualification so topics from
 * different boards or different qualifications (GCSE vs AS-Level vs A-Level)
 * can never collide, even if the topic name text happens to match.
 */
export function buildTopicId(board, qualification, subjectName, topicName) {
  const boardTok = sanitize(board || 'AQA')
  const qualTok = normalizeQualificationToken(qualification)
  const raw = `${boardTok}_${qualTok}_${sanitize(subjectName)}_${sanitize(topicName)}`
  // Collapse repeated underscores left over from sanitising punctuation-heavy topic names.
  return raw.replace(/_+/g, '_').slice(0, 160)
}

/**
 * Heuristic check for whether an existing topic doc ID predates the board/qualification
 * prefix (i.e. it's just `${subject}_${topic}`). We can't know the exact old subject/topic
 * split, so instead we check whether the ID *starts* with a recognised
 * `${boardToken}_${qualificationToken}_` pair — that's the one thing every ID built by
 * buildTopicId() will have, and no legacy ID (which starts directly with a subject name
 * like "Physics_..." or "English_Language_...") will ever accidentally match.
 */
export function isLegacyTopicId(id) {
  if (!id) return false
  for (const board of BOARD_TOKENS) {
    const boardSan = sanitize(board)
    if (id === boardSan || id.startsWith(boardSan + '_')) {
      const rest = id.slice(boardSan.length + 1)
      for (const qualTok of QUALIFICATION_TOKEN_VALUES) {
        if (rest === qualTok || rest.startsWith(qualTok + '_')) {
          return false // already in the new format
        }
      }
    }
  }
  return true
}
