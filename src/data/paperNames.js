// src/data/paperNames.js
//
// Board-published paper/component names — e.g. AQA GCSE Maths Paper 1 is officially
// "Non-calculator", AQA A-level Politics Paper 2 is "The government and politics of the USA"
// plus "Comparative politics", not just "Paper N".
//
// Every label below was checked against the "Specification at a glance" page of that AQA
// qualification (aqa.org.uk/subjects/<subject>/<level>/<spec>/specification/specification-at-a-glance),
// read in November 2026 (two exceptions: A-level Accounting was checked against AQA's specification
// PDF, and GCSE Religious Studies against its "Scheme of assessment" page). Two kinds of label:
//   - AQA prints a title for the paper (e.g. "Paper 1: Influences of operations and HRM on
//     business activity"): the label is that title, shortened only by dropping connecting words.
//   - AQA prints no title and only a content line (e.g. A-level Biology "Any content from topics
//     1-4"): the label is built from that content line: AQA's own topic/section numbers, usually
//     with the first and last topic named so the range is clear.
// Papers that are not written exams (non-exam assessment, coursework, spoken-language
// endorsement) are deliberately left out, so the caller keeps the plain "Paper N" label.
//
// Paper numbers follow AQA's own numbering. src/data/topics.js groups some AQA subjects' topics
// under a different paper number than AQA does (for example A-level Biology topics 4 and 7-8,
// A-level Computer Science, A-level French/German/Spanish paper 2); for those the label here
// describes AQA's paper, so it will not match the topics shown under it until topics.js is
// renumbered. A-level English Literature is specification A (7712) and GCSE Religious Studies
// is specification A (8062); AQA's B specifications for those subjects have different papers.
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
// covered here — every other board, AS-Level, and any AQA subject/paper not listed.
export const PAPER_NAMES = {
  'AQA|A-Level|Accounting|1': 'Financial Accounting',
  'AQA|A-Level|Accounting|2': 'Accounting for Analysis & Decision-Making',
  'AQA|A-Level|Biology|1': 'Topics 1–4: Molecules to Genetic Information',
  'AQA|A-Level|Biology|2': 'Topics 5–8: Energy to Gene Expression',
  'AQA|A-Level|Biology|3': 'Practical Skills & Synoptic',
  'AQA|A-Level|Business Studies|1': 'Business 1',
  'AQA|A-Level|Business Studies|2': 'Business 2',
  'AQA|A-Level|Business Studies|3': 'Business 3',
  'AQA|A-Level|Business|1': 'Business 1',
  'AQA|A-Level|Business|2': 'Business 2',
  'AQA|A-Level|Business|3': 'Business 3',
  'AQA|A-Level|Chemistry|1': 'Inorganic & Physical Chemistry',
  'AQA|A-Level|Chemistry|2': 'Organic & Physical Chemistry',
  'AQA|A-Level|Chemistry|3': 'Practical Skills & Synoptic',
  'AQA|A-Level|Computer Science|1': 'On-Screen Exam (Programming & Theory)',
  'AQA|A-Level|Computer Science|2': 'Written Exam (Data, Systems & Networks)',
  'AQA|A-Level|Economics|1': 'Markets and Market Failure',
  'AQA|A-Level|Economics|2': 'National and International Economy',
  'AQA|A-Level|Economics|3': 'Economic Principles & Issues',
  'AQA|A-Level|English Language|1': 'Language, the Individual and Society',
  'AQA|A-Level|English Language|2': 'Language Diversity and Change',
  'AQA|A-Level|English Literature|1': 'Love Through the Ages (Lit A)',
  'AQA|A-Level|English Literature|2': 'Texts in Shared Contexts (Lit A)',
  'AQA|A-Level|French|1': 'Listening, Reading & Writing',
  'AQA|A-Level|French|2': 'Writing',
  'AQA|A-Level|Further Mathematics|1': 'Compulsory Core Pure',
  'AQA|A-Level|Further Mathematics|2': 'Compulsory Core Pure',
  'AQA|A-Level|Further Mathematics|3': 'Optional Content (Discrete, Mechanics, Statistics)',
  'AQA|A-Level|Geography|1': 'Physical Geography',
  'AQA|A-Level|Geography|2': 'Human Geography',
  'AQA|A-Level|German|1': 'Listening, Reading & Writing',
  'AQA|A-Level|German|2': 'Writing',
  'AQA|A-Level|History|1': 'Breadth Study (2.5h)',
  'AQA|A-Level|History|2': 'Depth Study (2.5h)',
  'AQA|A-Level|Law|1': 'The Legal System & Criminal Law',
  'AQA|A-Level|Law|2': 'The Legal System & Tort',
  'AQA|A-Level|Law|3': 'The Legal System & Contract or Human Rights',
  'AQA|A-Level|Mathematics|1': 'Pure Mathematics',
  'AQA|A-Level|Mathematics|2': 'Pure Mathematics & Mechanics',
  'AQA|A-Level|Mathematics|3': 'Pure Mathematics & Statistics',
  'AQA|A-Level|Media Studies|1': 'Media One',
  'AQA|A-Level|Media Studies|2': 'Media Two',
  'AQA|A-Level|Physics|1': 'Sections 1–5 & 6.1: Measurements to Periodic Motion',
  'AQA|A-Level|Physics|2': 'Sections 6.2, 7 & 8: Thermal, Fields, Nuclear',
  'AQA|A-Level|Physics|3': 'Practical Skills + Option Topic',
  'AQA|A-Level|Politics|1': 'Government & Politics of the UK',
  'AQA|A-Level|Politics|2': 'USA Government & Comparative Politics',
  'AQA|A-Level|Politics|3': 'Political Ideas',
  'AQA|A-Level|Psychology|1': 'Introductory Topics in Psychology',
  'AQA|A-Level|Psychology|2': 'Psychology in Context',
  'AQA|A-Level|Psychology|3': 'Issues and Options in Psychology',
  'AQA|A-Level|Religious Studies|1': 'Philosophy of Religion & Ethics',
  'AQA|A-Level|Religious Studies|2': 'Study of Religion & Dialogues',
  'AQA|A-Level|Sociology|1': 'Education with Theory & Methods',
  'AQA|A-Level|Sociology|2': 'Topics in Sociology',
  'AQA|A-Level|Sociology|3': 'Crime & Deviance with Theory & Methods',
  'AQA|A-Level|Spanish|1': 'Listening, Reading & Writing',
  'AQA|A-Level|Spanish|2': 'Writing',
  'AQA|GCSE|Biology|1': 'Topics 1–4: Cell Biology to Bioenergetics',
  'AQA|GCSE|Biology|2': 'Topics 5–7: Homeostasis to Ecology',
  'AQA|GCSE|Business Studies|1': 'Influences of Operations & HRM',
  'AQA|GCSE|Business Studies|2': 'Influences of Marketing & Finance',
  'AQA|GCSE|Business|1': 'Influences of Operations & HRM',
  'AQA|GCSE|Business|2': 'Influences of Marketing & Finance',
  'AQA|GCSE|Chemistry|1': 'Topics 1–5: Atomic Structure to Energy Changes',
  'AQA|GCSE|Chemistry|2': 'Topics 6–10: Rate & Extent of Change to Resources',
  'AQA|GCSE|Combined Science: Trilogy|1': 'Biology 1 (Topics 1–4)',
  'AQA|GCSE|Combined Science: Trilogy|2': 'Biology 2 (Topics 5–7)',
  'AQA|GCSE|Combined Science: Trilogy|3': 'Chemistry 1 (Topics 8–12)',
  'AQA|GCSE|Combined Science: Trilogy|4': 'Chemistry 2 (Topics 13–17)',
  'AQA|GCSE|Combined Science: Trilogy|5': 'Physics 1 (Topics 18–21)',
  'AQA|GCSE|Combined Science: Trilogy|6': 'Physics 2 (Topics 22–24)',
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
  'AQA|GCSE|Media Studies|1': 'Media One',
  'AQA|GCSE|Media Studies|2': 'Media Two',
  'AQA|GCSE|Physical Education|1': 'Human Body & Movement',
  'AQA|GCSE|Physical Education|2': 'Socio-cultural Influences & Wellbeing',
  'AQA|GCSE|Physics|1': 'Topics 1–4: Energy to Atomic Structure',
  'AQA|GCSE|Physics|2': 'Topics 5–8: Forces to Space Physics',
  'AQA|GCSE|Psychology|1': 'Cognition & Behaviour',
  'AQA|GCSE|Psychology|2': 'Social Context & Behaviour',
  'AQA|GCSE|Religious Studies|1': 'Study of Religions (Spec A)',
  'AQA|GCSE|Religious Studies|2': 'Thematic Studies (Spec A)',
  'AQA|GCSE|Sociology|1': 'Families & Education',
  'AQA|GCSE|Sociology|2': 'Crime & Deviance & Social Stratification',
}


export function paperName(board, level, subject, paperNumber) {
  if (board !== 'AQA') return null
  const key = `AQA|${level}|${subject}|${paperNumber}`
  return PAPER_NAMES[key] || null
}
