// src/data/resourceLinks.js
// ─────────────────────────────────────────────────────────────────────────────
// Per-topic resource matching.
//
// HONEST DESIGN NOTE: with 2,431+ topics across boards/levels, we cannot
// hand-verify an exact deep-link URL for every single one — sites restructure,
// slugs vary unpredictably, and a wrong guessed URL is worse than no link at all
// (it erodes trust). Instead we use a 4-tier system:
//
//   TIER 1 — VERIFIED_DEEP_LINKS: hand-checked exact URLs for the highest-traffic
//            GCSE Maths/Science/English topics. These are real, tested links.
//   TIER 2a — BOARD_LEVEL_HUBS: real, individually verified board+level-specific
//            revision-note hub pages (e.g. the actual AQA GCSE Biology page on
//            Save My Exams, not just "Save My Exams" generally) — verified against
//            a live fetch of each site's own subject index, not recalled from
//            training data, since exactly this kind of URL is what drifts over
//            time. Covers every subject each of AQA/Edexcel/OCR genuinely offers
//            at GCSE, plus A-Level for the subjects individually confirmed; see
//            the coverage note below for exactly what that does and doesn't include.
//   TIER 2b — SUBJECT_HUBS: each site's own stable topic-index/contents page for
//            that subject — won't 404, always lands somewhere useful. Used when
//            no board+level-specific entry exists.
//   TIER 3 — Google site-search: `site:domain query` — guaranteed to work for
//            literally any topic name, since we're not guessing a URL structure.
//
// resolveTopicResources() below returns the best available tier for a topic.
// ─────────────────────────────────────────────────────────────────────────────

// ── TIER 1: Hand-verified exact deep links ────────────────────────────────────
// Keyed by subject, then a partial-match array of [keywords, links].
// Keywords are matched case-insensitively against the topic name (substring).
export const VERIFIED_DEEP_LINKS = {
  'Mathematics': [
    {
      keywords: ['order of operations', 'bidmas', 'bodmas'],
      links: [
        { name: 'Corbett Maths — Order of Operations', url: 'https://corbettmaths.com/2013/06/08/order-of-operations/', site: 'Corbett Maths' },
        { name: 'Corbett Maths — Practice Questions', url: 'https://corbettmaths.com/2019/09/02/order-of-operations-practice-questions/', site: 'Corbett Maths' },
      ],
    },
    {
      keywords: ['prime factor', 'hcf', 'lcm'],
      links: [
        { name: 'Corbett Maths — HCF / LCM', url: 'https://corbettmaths.com/2012/08/03/lcm-and-hcf/', site: 'Corbett Maths' },
      ],
    },
    {
      keywords: ['standard form'],
      links: [
        { name: 'Corbett Maths — Standard Form', url: 'https://corbettmaths.com/2012/08/15/standard-form/', site: 'Corbett Maths' },
      ],
    },
    {
      keywords: ['percentage change', 'reverse percentage'],
      links: [
        { name: 'Corbett Maths — Percentage Change', url: 'https://corbettmaths.com/2012/08/19/percentage-change/', site: 'Corbett Maths' },
      ],
    },
    {
      keywords: ['simultaneous equations'],
      links: [
        { name: 'Corbett Maths — Simultaneous Equations', url: 'https://corbettmaths.com/2013/05/16/solving-simultaneous-equations/', site: 'Corbett Maths' },
      ],
    },
    {
      keywords: ['quadratic formula', 'completing the square'],
      links: [
        { name: 'Corbett Maths — Quadratic Formula', url: 'https://corbettmaths.com/2013/05/16/quadratic-equations/', site: 'Corbett Maths' },
      ],
    },
    {
      keywords: ['pythagoras'],
      links: [
        { name: "Corbett Maths — Pythagoras' Theorem", url: 'https://corbettmaths.com/2012/08/19/pythagoras/', site: 'Corbett Maths' },
      ],
    },
    {
      keywords: ['trigonometry', 'sohcahtoa'],
      links: [
        { name: 'Corbett Maths — Trigonometry', url: 'https://corbettmaths.com/2012/08/19/right-angled-trigonometry/', site: 'Corbett Maths' },
      ],
    },
  ],

  'Biology': [
    {
      keywords: ['photosynthesis'],
      links: [
        { name: 'Cognito — GCSE Biology (search Photosynthesis)', url: 'https://go.cognitoedu.org/biology', site: 'Cognito' },
      ],
    },
    {
      keywords: ['cell structure', 'cell division', 'mitosis'],
      links: [
        { name: 'Cognito — GCSE Biology (search Cell Biology)', url: 'https://go.cognitoedu.org/biology', site: 'Cognito' },
      ],
    },
    {
      keywords: ['respiration'],
      links: [
        { name: 'Cognito — GCSE Biology (search Respiration)', url: 'https://go.cognitoedu.org/biology', site: 'Cognito' },
      ],
    },
  ],

  'Chemistry': [
    {
      keywords: ['atomic structure'],
      links: [
        { name: 'Cognito — GCSE Chemistry (search Atomic Structure)', url: 'https://go.cognitoedu.org/chemistry', site: 'Cognito' },
      ],
    },
    {
      keywords: ['periodic table'],
      links: [
        { name: 'Cognito — GCSE Chemistry (search Periodic Table)', url: 'https://go.cognitoedu.org/chemistry', site: 'Cognito' },
      ],
    },
  ],

  'Physics': [
    {
      keywords: ['forces', 'newton'],
      links: [
        { name: 'Cognito — GCSE Physics (search Forces)', url: 'https://go.cognitoedu.org/physics', site: 'Cognito' },
      ],
    },
    {
      keywords: ['energy stores', 'energy transfer'],
      links: [
        { name: 'Cognito — GCSE Physics (search Energy)', url: 'https://go.cognitoedu.org/physics', site: 'Cognito' },
      ],
    },
  ],
}

// ── TIER 2a: Real board+level-specific hub pages ───────────────────────────────
// Every URL below was individually confirmed against a live fetch of savemyexams.com
// (its own /subjects/ and /a-level/ index pages, which list every subject+board with a
// real href) or physicsandmathstutor.com (whose own nav confirms its exact 8-subject
// coverage), not recalled from training data or extrapolated from a guessed pattern.
// Keyed by `${subject}|${board}|${level}`. Covers GCSE across AQA/Edexcel/OCR for every
// subject each board actually offers there, plus A-Level for the subjects individually
// confirmed with a real course-page URL. A subject/board/level not listed here genuinely
// isn't offered by that exam board on that site (e.g. AQA doesn't do A-Level Law; OCR's
// GCSE lineup is narrower than AQA's) — falls through to Tier 2b/3 below, same as before.
const BOARD_LEVEL_HUBS = {
  'Arabic|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Arabic', url: 'https://www.savemyexams.com/gcse/arabic/edexcel/', site: 'Save My Exams' }],
  'Art & Design|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Art & Design', url: 'https://www.savemyexams.com/gcse/art-and-design/aqa/art-craft-and-design/', site: 'Save My Exams' }],
  'Biology|AQA|A-Level': [{ name: 'Save My Exams — AQA A-Level Biology', url: 'https://www.savemyexams.com/a-level/biology/aqa/17/', site: 'Save My Exams' }, { name: 'Physics & Maths Tutor — AQA A-Level Biology', url: 'https://www.physicsandmathstutor.com/biology-revision/a-level-aqa/', site: 'Physics & Maths Tutor' }],
  'Biology|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Biology', url: 'https://www.savemyexams.com/gcse/biology/aqa/18/revision-notes/', site: 'Save My Exams' }, { name: 'Physics & Maths Tutor — AQA GCSE Biology', url: 'https://www.physicsandmathstutor.com/biology-revision/gcse-aqa/', site: 'Physics & Maths Tutor' }],
  'Biology|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Biology', url: 'https://www.savemyexams.com/gcse/biology/edexcel/18/revision-notes/', site: 'Save My Exams' }],
  'Biology|OCR|GCSE': [{ name: 'Save My Exams — OCR GCSE Biology', url: 'https://www.savemyexams.com/gcse/biology/ocr/a-gateway/16/revision-notes/', site: 'Save My Exams' }],
  'Business Studies|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Business Studies', url: 'https://www.savemyexams.com/gcse/business/aqa/17/revision-notes/', site: 'Save My Exams' }],
  'Business Studies|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Business Studies', url: 'https://www.savemyexams.com/gcse/business/edexcel/19/revision-notes/', site: 'Save My Exams' }],
  'Business Studies|OCR|GCSE': [{ name: 'Save My Exams — OCR GCSE Business Studies', url: 'https://www.savemyexams.com/gcse/business/ocr/17/revision-notes/', site: 'Save My Exams' }],
  'Business|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Business', url: 'https://www.savemyexams.com/gcse/business/aqa/17/revision-notes/', site: 'Save My Exams' }],
  'Business|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Business', url: 'https://www.savemyexams.com/gcse/business/edexcel/19/revision-notes/', site: 'Save My Exams' }],
  'Business|OCR|GCSE': [{ name: 'Save My Exams — OCR GCSE Business', url: 'https://www.savemyexams.com/gcse/business/ocr/17/revision-notes/', site: 'Save My Exams' }],
  'Chemistry|AQA|A-Level': [{ name: 'Save My Exams — AQA A-Level Chemistry', url: 'https://www.savemyexams.com/a-level/chemistry/aqa/17/', site: 'Save My Exams' }, { name: 'Physics & Maths Tutor — AQA A-Level Chemistry', url: 'https://www.physicsandmathstutor.com/chemistry-revision/a-level-aqa/', site: 'Physics & Maths Tutor' }],
  'Chemistry|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Chemistry', url: 'https://www.savemyexams.com/gcse/chemistry/aqa/18/revision-notes/', site: 'Save My Exams' }, { name: 'Physics & Maths Tutor — AQA GCSE Chemistry', url: 'https://www.physicsandmathstutor.com/chemistry-revision/gcse-aqa/', site: 'Physics & Maths Tutor' }],
  'Chemistry|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Chemistry', url: 'https://www.savemyexams.com/gcse/chemistry/edexcel/18/revision-notes/', site: 'Save My Exams' }],
  'Chemistry|OCR|GCSE': [{ name: 'Save My Exams — OCR GCSE Chemistry', url: 'https://www.savemyexams.com/gcse/chemistry/ocr/a-gateway/16/revision-notes/', site: 'Save My Exams' }],
  'Combined Science: Synergy|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Combined Science: Synergy', url: 'https://www.savemyexams.com/gcse/science/aqa/combined-science-synergy/16/physical-sciences/', site: 'Save My Exams' }],
  'Combined Science: Trilogy|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Combined Science: Trilogy', url: 'https://www.savemyexams.com/gcse/science/aqa/combined-science-trilogy/16/', site: 'Save My Exams' }],
  'Combined Science|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Combined Science', url: 'https://www.savemyexams.com/gcse/science/aqa/combined-science-trilogy/16/', site: 'Save My Exams' }],
  'Computer Science|AQA|A-Level': [{ name: 'Physics & Maths Tutor — AQA A-Level Computer Science', url: 'https://www.physicsandmathstutor.com/computer-science-revision/a-level-aqa/', site: 'Physics & Maths Tutor' }],
  'Computer Science|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Computer Science', url: 'https://www.savemyexams.com/gcse/computer-science/aqa/20/revision-notes/', site: 'Save My Exams' }, { name: 'Physics & Maths Tutor — AQA GCSE Computer Science', url: 'https://www.physicsandmathstutor.com/computer-science-revision/gcse-aqa/', site: 'Physics & Maths Tutor' }],
  'Computer Science|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Computer Science', url: 'https://www.savemyexams.com/gcse/computer-science/edexcel/20/revision-notes/', site: 'Save My Exams' }],
  'Computer Science|OCR|GCSE': [{ name: 'Save My Exams — OCR GCSE Computer Science', url: 'https://www.savemyexams.com/gcse/computer-science/ocr/22/revision-notes/', site: 'Save My Exams' }],
  'Design & Technology|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Design & Technology', url: 'https://www.savemyexams.com/gcse/design-and-technology/aqa/17/revision-notes/', site: 'Save My Exams' }],
  'Design & Technology|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Design & Technology', url: 'https://www.savemyexams.com/gcse/design-and-technology/edexcel/', site: 'Save My Exams' }],
  'Drama|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Drama', url: 'https://www.savemyexams.com/gcse/drama/aqa/', site: 'Save My Exams' }],
  'Economics|AQA|A-Level': [{ name: 'Physics & Maths Tutor — AQA A-Level Economics', url: 'https://www.physicsandmathstutor.com/economics-revision/a-level-aqa/', site: 'Physics & Maths Tutor' }],
  'Economics|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Economics', url: 'https://www.savemyexams.com/gcse/economics/aqa/', site: 'Save My Exams' }, { name: 'Physics & Maths Tutor — AQA GCSE Economics', url: 'https://www.physicsandmathstutor.com/economics-revision/gcse-aqa/', site: 'Physics & Maths Tutor' }],
  'English Language & Literature|AQA|A-Level': [{ name: 'Save My Exams — AQA A-Level English Language & Literature', url: 'https://www.savemyexams.com/a-level/english-language-and-literature/aqa/', site: 'Save My Exams' }],
  'English Language|AQA|A-Level': [{ name: 'Physics & Maths Tutor — AQA A-Level English Language', url: 'https://www.physicsandmathstutor.com/english-revision/a-level-aqa/', site: 'Physics & Maths Tutor' }],
  'English Language|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE English Language', url: 'https://www.savemyexams.com/gcse/english-language/aqa/17/revision-notes/', site: 'Save My Exams' }, { name: 'Physics & Maths Tutor — AQA GCSE English Language', url: 'https://www.physicsandmathstutor.com/english-revision/gcse-aqa/', site: 'Physics & Maths Tutor' }],
  'English Language|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE English Language', url: 'https://www.savemyexams.com/gcse/english-language/edexcel/15/revision-notes/', site: 'Save My Exams' }],
  'English Literature|AQA|A-Level': [{ name: 'Physics & Maths Tutor — AQA A-Level English Literature', url: 'https://www.physicsandmathstutor.com/english-revision/a-level-aqa/', site: 'Physics & Maths Tutor' }],
  'English Literature|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE English Literature', url: 'https://www.savemyexams.com/gcse/english-literature/aqa/17/revision-notes/', site: 'Save My Exams' }, { name: 'Physics & Maths Tutor — AQA GCSE English Literature', url: 'https://www.physicsandmathstutor.com/english-revision/gcse-aqa/', site: 'Physics & Maths Tutor' }],
  'English Literature|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE English Literature', url: 'https://www.savemyexams.com/gcse/english-literature/edexcel/17/revision-notes/', site: 'Save My Exams' }],
  'Food Preparation & Nutrition|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Food Preparation & Nutrition', url: 'https://www.savemyexams.com/gcse/food-and-nutrition/aqa/food-preparation-and-nutrition/16/revision-notes/', site: 'Save My Exams' }],
  'French|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE French', url: 'https://www.savemyexams.com/gcse/french/aqa/24/revision-notes/', site: 'Save My Exams' }],
  'French|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE French', url: 'https://www.savemyexams.com/gcse/french/edexcel/', site: 'Save My Exams' }],
  'Further Mathematics|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Further Mathematics', url: 'https://www.savemyexams.com/gcse/further-maths/aqa/20/revision-notes/', site: 'Save My Exams' }],
  'Geography|AQA|A-Level': [{ name: 'Physics & Maths Tutor — AQA A-Level Geography', url: 'https://www.physicsandmathstutor.com/geography-revision/a-level-aqa/', site: 'Physics & Maths Tutor' }],
  'Geography|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Geography', url: 'https://www.savemyexams.com/gcse/geography/aqa/18/revision-notes/', site: 'Save My Exams' }, { name: 'Physics & Maths Tutor — AQA GCSE Geography', url: 'https://www.physicsandmathstutor.com/geography-revision/gcse-aqa/', site: 'Physics & Maths Tutor' }],
  'Geography|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Geography', url: 'https://www.savemyexams.com/gcse/geography/edexcel/a/18/revision-notes/', site: 'Save My Exams' }],
  'Geography|OCR|GCSE': [{ name: 'Save My Exams — OCR GCSE Geography', url: 'https://www.savemyexams.com/gcse/geography/ocr/b/18/revision-notes/', site: 'Save My Exams' }],
  'German|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE German', url: 'https://www.savemyexams.com/gcse/german/aqa/24/revision-notes/', site: 'Save My Exams' }],
  'German|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE German', url: 'https://www.savemyexams.com/gcse/german/edexcel/', site: 'Save My Exams' }],
  'History|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE History', url: 'https://www.savemyexams.com/gcse/history/aqa/16/', site: 'Save My Exams' }],
  'History|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE History', url: 'https://www.savemyexams.com/gcse/history/edexcel/24/', site: 'Save My Exams' }],
  'Latin|OCR|GCSE': [{ name: 'Save My Exams — OCR GCSE Latin', url: 'https://www.savemyexams.com/gcse/latin/ocr/', site: 'Save My Exams' }],
  'Mathematics|AQA|A-Level': [{ name: 'Physics & Maths Tutor — AQA A-Level Mathematics', url: 'https://www.physicsandmathstutor.com/maths-revision/a-level-aqa/', site: 'Physics & Maths Tutor' }],
  'Mathematics|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Mathematics', url: 'https://www.savemyexams.com/gcse/maths/aqa/22/higher/revision-notes/', site: 'Save My Exams' }, { name: 'Physics & Maths Tutor — AQA GCSE Mathematics', url: 'https://www.physicsandmathstutor.com/maths-revision/gcse-aqa/', site: 'Physics & Maths Tutor' }],
  'Mathematics|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Mathematics', url: 'https://www.savemyexams.com/gcse/maths/edexcel/22/higher/revision-notes/', site: 'Save My Exams' }],
  'Mathematics|OCR|GCSE': [{ name: 'Save My Exams — OCR GCSE Mathematics', url: 'https://www.savemyexams.com/gcse/maths/ocr/22/higher/revision-notes/', site: 'Save My Exams' }],
  'Media Studies|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Media Studies', url: 'https://www.savemyexams.com/gcse/media-studies/aqa/', site: 'Save My Exams' }],
  'Music|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Music', url: 'https://www.savemyexams.com/gcse/music/aqa/', site: 'Save My Exams' }],
  'Physical Education|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Physical Education', url: 'https://www.savemyexams.com/gcse/physical-education/aqa/16/revision-notes/', site: 'Save My Exams' }],
  'Physical Education|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Physical Education', url: 'https://www.savemyexams.com/gcse/physical-education/edexcel/', site: 'Save My Exams' }],
  'Physical Education|OCR|GCSE': [{ name: 'Save My Exams — OCR GCSE Physical Education', url: 'https://www.savemyexams.com/gcse/physical-education/ocr/', site: 'Save My Exams' }],
  'Physics|AQA|A-Level': [{ name: 'Save My Exams — AQA A-Level Physics', url: 'https://www.savemyexams.com/a-level/physics/aqa/17/', site: 'Save My Exams' }, { name: 'Physics & Maths Tutor — AQA A-Level Physics', url: 'https://www.physicsandmathstutor.com/physics-revision/a-level-aqa/', site: 'Physics & Maths Tutor' }],
  'Physics|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Physics', url: 'https://www.savemyexams.com/gcse/physics/aqa/18/revision-notes/', site: 'Save My Exams' }, { name: 'Physics & Maths Tutor — AQA GCSE Physics', url: 'https://www.physicsandmathstutor.com/physics-revision/gcse-aqa/', site: 'Physics & Maths Tutor' }],
  'Physics|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Physics', url: 'https://www.savemyexams.com/gcse/physics/edexcel/18/revision-notes/', site: 'Save My Exams' }],
  'Physics|OCR|GCSE': [{ name: 'Save My Exams — OCR GCSE Physics', url: 'https://www.savemyexams.com/gcse/physics/ocr/a-gateway/16/revision-notes/', site: 'Save My Exams' }],
  'Polish|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Polish', url: 'https://www.savemyexams.com/gcse/polish/aqa/', site: 'Save My Exams' }],
  'Psychology|AQA|A-Level': [{ name: 'Physics & Maths Tutor — AQA A-Level Psychology', url: 'https://www.physicsandmathstutor.com/psychology-revision/a-level-aqa/', site: 'Physics & Maths Tutor' }],
  'Psychology|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Psychology', url: 'https://www.savemyexams.com/gcse/psychology/aqa/19/revision-notes/', site: 'Save My Exams' }, { name: 'Physics & Maths Tutor — AQA GCSE Psychology', url: 'https://www.physicsandmathstutor.com/psychology-revision/gcse-aqa/', site: 'Physics & Maths Tutor' }],
  'Psychology|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Psychology', url: 'https://www.savemyexams.com/gcse/psychology/edexcel/', site: 'Save My Exams' }],
  'Psychology|OCR|GCSE': [{ name: 'Save My Exams — OCR GCSE Psychology', url: 'https://www.savemyexams.com/gcse/psychology/ocr/17/revision-notes/', site: 'Save My Exams' }],
  'Religious Studies|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Religious Studies', url: 'https://www.savemyexams.com/gcse/religious-studies/aqa/a/18/revision-notes/', site: 'Save My Exams' }],
  'Religious Studies|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Religious Studies', url: 'https://www.savemyexams.com/gcse/religious-studies/edexcel/a/16/', site: 'Save My Exams' }],
  'Sociology|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Sociology', url: 'https://www.savemyexams.com/gcse/sociology/aqa/17/revision-notes/', site: 'Save My Exams' }],
  'Spanish|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Spanish', url: 'https://www.savemyexams.com/gcse/spanish/aqa/24/revision-notes/', site: 'Save My Exams' }],
  'Spanish|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Spanish', url: 'https://www.savemyexams.com/gcse/spanish/edexcel/', site: 'Save My Exams' }],
  'Statistics|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Statistics', url: 'https://www.savemyexams.com/gcse/statistics/aqa/17/higher/revision-notes/', site: 'Save My Exams' }],
  'Statistics|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Statistics', url: 'https://www.savemyexams.com/gcse/statistics/edexcel/17/higher/revision-notes/', site: 'Save My Exams' }],
  'Urdu|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Urdu', url: 'https://www.savemyexams.com/gcse/urdu/aqa/', site: 'Save My Exams' }],
}

// ── TIER 2b: Stable subject hub / contents pages (won't 404) ──────────────────
export const SUBJECT_HUBS = {
  'Mathematics':         [{ name: 'Corbett Maths — Full Topic List', url: 'https://corbettmaths.com/contents/', site: 'Corbett Maths' }, { name: 'PMT — Maths Revision', url: 'https://www.physicsandmathstutor.com/maths-revision/', site: 'Physics & Maths Tutor' }],
  'Further Mathematics': [{ name: 'Dr Frost Maths', url: 'https://www.drfrostmaths.com', site: 'Dr Frost Maths' }],
  'Biology':             [{ name: 'Cognito — All Biology Topics', url: 'https://go.cognitoedu.org/biology', site: 'Cognito' }, { name: 'Save My Exams — GCSE Biology (all boards)', url: 'https://www.savemyexams.com/gcse/biology/', site: 'Save My Exams' }],
  'Chemistry':           [{ name: 'Cognito — All Chemistry Topics', url: 'https://go.cognitoedu.org/chemistry', site: 'Cognito' }, { name: 'PMT — Chemistry Revision (all boards)', url: 'https://www.physicsandmathstutor.com/chemistry-revision/', site: 'Physics & Maths Tutor' }],
  'Physics':             [{ name: 'Cognito — All Physics Topics', url: 'https://go.cognitoedu.org/physics', site: 'Cognito' }, { name: 'Save My Exams — Physics (all boards/levels)', url: 'https://www.savemyexams.com/subjects/physics/', site: 'Save My Exams' }],
  'Combined Science':    [{ name: 'Cognito — Combined Science', url: 'https://go.cognitoedu.org/gcse', site: 'Cognito' }, { name: 'Save My Exams — AQA GCSE Science', url: 'https://www.savemyexams.com/gcse/science/aqa/', site: 'Save My Exams' }],
  'English Language':    [{ name: 'BBC Bitesize — English Language', url: 'https://www.bbc.co.uk/bitesize/subjects/zr9d7ty', site: 'BBC Bitesize' }],
  'English Literature':  [{ name: 'BBC Bitesize — English Literature', url: 'https://www.bbc.co.uk/bitesize/subjects/zm8ng82', site: 'BBC Bitesize' }],
  'History':             [{ name: 'BBC Bitesize — History', url: 'https://www.bbc.co.uk/bitesize/subjects/zk26n39', site: 'BBC Bitesize' }],
  'Geography':           [{ name: 'BBC Bitesize — Geography', url: 'https://www.bbc.co.uk/bitesize/subjects/zkw76sg', site: 'BBC Bitesize' }],
  'Computer Science':    [{ name: "Craig'n'Dave — All Topics", url: 'https://www.craigndave.org', site: "Craig'n'Dave" }],
  'Business Studies':    [{ name: 'Tutor2u — Business', url: 'https://www.tutor2u.net/business', site: 'Tutor2u' }],
  'Economics':           [{ name: 'Tutor2u — Economics', url: 'https://www.tutor2u.net/economics', site: 'Tutor2u' }],
  'Psychology':          [{ name: 'Simply Psychology', url: 'https://www.simplypsychology.org', site: 'Simply Psychology' }],
  'Sociology':           [{ name: 'ReviseSociology', url: 'https://revisesociology.com', site: 'ReviseSociology' }],
}

// ── TIER 3: Universal site-search fallback ─────────────────────────────────────
// Always works because we're not guessing a URL structure — Google does the
// matching for us. Available for every topic on every subject.
const SEARCH_SITES = [
  { name: 'Save My Exams',          domain: 'savemyexams.com' },
  { name: 'Physics & Maths Tutor',  domain: 'physicsandmathstutor.com' },
  { name: 'BBC Bitesize',           domain: 'bbc.co.uk/bitesize' },
]

function buildSearchLink(site, query) {
  const q = encodeURIComponent('site:' + site.domain + ' ' + query)
  return {
    name: site.name + ' — search "' + query + '"',
    url: 'https://www.google.com/search?q=' + q,
    site: site.name,
    isSearch: true,
  }
}

/**
 * Returns the best available resources for a given subject + topic name.
 * `board` and `level` are optional — pass them when known (both Topics.jsx and
 * TopicDetail.jsx have them on every topic doc) to unlock Tier 2a's real
 * board+level-specific hub pages; omitted, this behaves exactly as before.
 * Always returns at least the Tier 3 search links, so the UI never shows
 * an empty state.
 */
export function resolveTopicResources(subject, topicName, board, level) {
  const result = { verified: [], hub: [], search: [] }
  const lower = (topicName || '').toLowerCase()

  // Tier 1
  const subjEntries = VERIFIED_DEEP_LINKS[subject] || []
  for (const entry of subjEntries) {
    if (entry.keywords.some(k => lower.includes(k))) {
      result.verified.push(...entry.links)
    }
  }

  // Tier 2a (board+level-specific) then Tier 2b (subject-general), deduped by URL
  const specific = (board && level) ? (BOARD_LEVEL_HUBS[`${subject}|${board}|${level}`] || []) : []
  const generic  = SUBJECT_HUBS[subject] || []
  const seen = new Set()
  result.hub = [...specific, ...generic].filter(l => {
    if (seen.has(l.url)) return false
    seen.add(l.url)
    return true
  })

  // Tier 3 — always present
  result.search = SEARCH_SITES.map(site => buildSearchLink(site, topicName))

  return result
}
