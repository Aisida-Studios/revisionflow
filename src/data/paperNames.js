// src/data/paperNames.js
//
// Real, board-published paper/component names — e.g. AQA GCSE Biology Paper 1 is
// officially "Cell biology; Organisation; Infection & response; Bioenergetics", not just
// "Paper 1". Sourced directly from AQA's own subject pages (transcribed from
// UK_Exam_Reference_Spreadsheet.xlsx's "Spec Topics" sheets, which the studio compiled from
// aqa.org.uk) and cross-checked against src/data/topics.js's actual paper numbering.
//
// Deliberately AQA-only, and paper-level only (not a finer per-unit breakdown within a
// paper). Two reasons:
//   1. Different boards number and name their own units differently, and topics.js mixes
//      several boards under similar-looking prefixes (e.g. multiple specs all use "B1",
//      "B2"... for completely different content) — a wrong confidently-displayed label
//      would actively mislead a student revising for a real exam, which is worse than the
//      plain "Paper N" fallback this replaces.
//   2. AS-Level is deliberately NOT included even for AQA — its paper structure/content
//      split doesn't reliably mirror A-Level's, and assuming it does risks the same problem.
//
// Falls back to null (caller keeps the existing plain "Paper N" label) for anything not
// covered here — every other board, AS-Level, and any AQA subject/paper this spreadsheet
// didn't include.
export const PAPER_NAMES = {
  'AQA|A-Level|Accounting|1': 'Financial Accounting',
  'AQA|A-Level|Accounting|2': 'Accounting for Analysis & Decision-Making',
  'AQA|A-Level|Biology|1': 'Biological Molecules, Cells & Organisms',
  'AQA|A-Level|Biology|2': 'Energy Transfers & Responses',
  'AQA|A-Level|Biology|3': 'Practical Skills & Synoptic',
  'AQA|A-Level|Business Studies|1': 'Business 1',
  'AQA|A-Level|Business Studies|2': 'Business 2',
  'AQA|A-Level|Business Studies|3': 'Business 3 (Synoptic)',
  'AQA|A-Level|Business|1': 'Business 1',
  'AQA|A-Level|Business|2': 'Business 2',
  'AQA|A-Level|Business|3': 'Business 3 (Synoptic)',
  'AQA|A-Level|Chemistry|1': 'Inorganic & Physical Chemistry',
  'AQA|A-Level|Chemistry|2': 'Organic & Physical Chemistry',
  'AQA|A-Level|Chemistry|3': 'Practical Skills & Synoptic',
  'AQA|A-Level|Computer Science|1': 'Computational Thinking & Programming',
  'AQA|A-Level|Computer Science|2': 'Computer Science Concepts',
  'AQA|A-Level|Economics|1': 'Markets and Market Failure',
  'AQA|A-Level|Economics|2': 'National and International Economy',
  'AQA|A-Level|Economics|3': 'Economic Principles & Issues',
  'AQA|A-Level|English Language|1': 'Language, the Individual and Society',
  'AQA|A-Level|English Language|2': 'Language Diversity and Change',
  'AQA|A-Level|English Literature|1': 'Love Through the Ages',
  'AQA|A-Level|English Literature|2': 'Texts in Shared Contexts',
  'AQA|A-Level|French|1': 'Listening, Reading & Writing',
  'AQA|A-Level|French|2': 'Writing',
  'AQA|A-Level|Further Mathematics|1': 'Compulsory Core Pure',
  'AQA|A-Level|Further Mathematics|2': 'Optional Routes',
  'AQA|A-Level|Further Mathematics|3': 'Optional Routes',
  'AQA|A-Level|Geography|1': 'Physical Geography',
  'AQA|A-Level|Geography|2': 'Human Geography',
  'AQA|A-Level|German|1': 'Listening, Reading & Writing',
  'AQA|A-Level|German|2': 'Writing',
  'AQA|A-Level|History|1': 'Breadth Study (2.5h)',
  'AQA|A-Level|History|2': 'Depth Study (2.5h)',
  'AQA|A-Level|Law|1': 'The Legal System & Criminal Law',
  'AQA|A-Level|Law|2': 'Law Making & The Law of Tort',
  'AQA|A-Level|Law|3': 'Further Law (Option)',
  'AQA|A-Level|Mathematics|1': 'Pure Mathematics 1',
  'AQA|A-Level|Mathematics|2': 'Pure Mathematics 2 + Statistics or Mechanics',
  'AQA|A-Level|Mathematics|3': 'Pure Mathematics 3 + Statistics or Mechanics',
  'AQA|A-Level|Media Studies|1': 'Media Products, Industries & Audiences',
  'AQA|A-Level|Media Studies|2': 'Media Forms & Products in Depth',
  'AQA|A-Level|Physics|1': 'Measurements & Fundamental Physics',
  'AQA|A-Level|Physics|2': 'Advanced Physics',
  'AQA|A-Level|Physics|3': 'Practical Skills + Option Topic',
  'AQA|A-Level|Politics|1': 'UK Politics & Core Political Ideas',
  'AQA|A-Level|Politics|2': 'UK Government & Political Ideas',
  'AQA|A-Level|Politics|3': 'Comparative Politics',
  'AQA|A-Level|Psychology|1': 'Introductory Topics in Psychology',
  'AQA|A-Level|Psychology|2': 'Psychology in Context',
  'AQA|A-Level|Psychology|3': 'Issues and Options in Psychology',
  'AQA|A-Level|Religious Studies|1': 'Philosophy of Religion',
  'AQA|A-Level|Religious Studies|2': 'Religion & Ethics',
  'AQA|A-Level|Religious Studies|3': 'Study of Religion / Dialogues',
  'AQA|A-Level|Sociology|1': 'Education + Theory & Methods 1',
  'AQA|A-Level|Sociology|2': 'Topics in Sociology',
  'AQA|A-Level|Sociology|3': 'Crime & Deviance + Theory & Methods 2',
  'AQA|A-Level|Spanish|1': 'Listening, Reading & Writing',
  'AQA|A-Level|Spanish|2': 'Writing',
  'AQA|GCSE|Business Studies|1': 'Influences of Operations & HRM',
  'AQA|GCSE|Business Studies|2': 'Influences of Marketing & Finance',
  'AQA|GCSE|Business|1': 'Influences of Operations & HRM',
  'AQA|GCSE|Business|2': 'Influences of Marketing & Finance',
  'AQA|GCSE|Computer Science|1': 'Computational Thinking & Programming',
  'AQA|GCSE|Computer Science|2': 'Computing Concepts',
  'AQA|GCSE|Economics|1': 'How Markets Work',
  'AQA|GCSE|Economics|2': 'How the Economy Works',
  'AQA|GCSE|English Language|1': 'Creative Reading & Writing',
  'AQA|GCSE|English Language|2': 'Writers\' Viewpoints & Perspectives',
  'AQA|GCSE|English Literature|1': 'Shakespeare & 19th-Century Novel',
  'AQA|GCSE|English Literature|2': 'Modern Texts, Poetry & Unseen Poetry',
  'AQA|GCSE|Geography|1': 'Living with the Physical Environment',
  'AQA|GCSE|Geography|2': 'Challenges in the Human Environment',
  'AQA|GCSE|Geography|3': 'Geographical Applications',
  'AQA|GCSE|History|1': 'Understanding the Modern World',
  'AQA|GCSE|History|2': 'Shaping the Nation',
  'AQA|GCSE|Mathematics|1': 'Non-Calculator',
  'AQA|GCSE|Mathematics|2': 'Calculator',
  'AQA|GCSE|Mathematics|3': 'Calculator',
  'AQA|GCSE|Media Studies|1': 'Media Products, Industries & Audiences',
  'AQA|GCSE|Media Studies|2': 'Understanding Media Forms & Products',
  'AQA|GCSE|Physical Education|1': 'Human Body & Movement',
  'AQA|GCSE|Physical Education|2': 'Socio-cultural Influences & Wellbeing',
  'AQA|GCSE|Psychology|1': 'Cognition & Behaviour',
  'AQA|GCSE|Psychology|2': 'Social Context & Behaviour',
  'AQA|GCSE|Religious Studies|1': 'Study of Religions',
  'AQA|GCSE|Religious Studies|2': 'Thematic Studies',
  'AQA|GCSE|Sociology|1': 'Families & Education',
  'AQA|GCSE|Sociology|2': 'Crime & Deviance & Social Stratification',
}


export function paperName(board, level, subject, paperNumber) {
  if (board !== 'AQA') return null
  const key = `AQA|${level}|${subject}|${paperNumber}`
  return PAPER_NAMES[key] || null
}
