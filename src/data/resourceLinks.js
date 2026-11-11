// src/data/resourceLinks.js
// ─────────────────────────────────────────────────────────────────────────────
// Per-topic resource matching.
//
// With 2,400+ topics across boards and levels, an exact page cannot be confirmed for every
// topic, and a wrong guessed URL is worse than no link at all (it erodes trust). So links
// come in four tiers:
//
//   TIER 1  — VERIFIED_DEEP_LINKS: exact topic pages (currently Corbett Maths videos and
//             practice questions for common GCSE Maths topics). Topics.jsx shows these under
//             "Verified direct links", so only a page that was opened and found to cover that
//             topic belongs here. A subject hub does not: it goes in Tier 2b.
//   TIER 2a — BOARD_LEVEL_HUBS: board + level specific revision pages on Save My Exams and
//             Physics & Maths Tutor, keyed `${subject}|${board}|${level}`.
//   TIER 2b — SUBJECT_HUBS: one stable index page per subject, shown alongside Tier 2a (or on
//             its own when no board + level page exists).
//   TIER 3  — Google site-search (`site:domain query`): works for any topic name because no
//             URL structure is guessed.
//
// URL check, November 2026 (every page was fetched live, none recalled from memory):
//   - Opened directly and loaded as the page the link name describes: every Tier 1 page and
//     every Corbett Maths, Physics & Maths Tutor, Cognito, tutor2u, Dr Frost, Craig'n'Dave,
//     Simply Psychology and ReviseSociology URL below, plus these Save My Exams pages: GCSE
//     Biology revision notes, GCSE Science, Physics, AQA A-Level Biology, Physics and Further
//     Maths, and AQA A-Level English Language & Literature past papers.
//   - Save My Exams: AQA A-Level Chemistry and AQA GCSE Combined Science: Synergy were
//     confirmed from search results showing the page titles. Every other Save My Exams course
//     page is a link in that site's own navigation menus (read from its GCSE Biology page); it
//     was not opened one by one.
//   - NOT checked: the four BBC Bitesize pages in SUBJECT_HUBS (bbc.co.uk could not be opened by
//     the tools used for this check).
// Sites restructure and slugs change, so re-run this check each exam year.
//
// resolveTopicResources() below returns the best available tier for a topic.
// ─────────────────────────────────────────────────────────────────────────────

// ── TIER 1: Exact topic pages, each opened and checked ────────────────────────
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
        { name: 'Corbett Maths — LCM and HCF using Product of Primes', url: 'https://corbettmaths.com/2012/08/20/lcm-and-hcf-using-product-of-primes/', site: 'Corbett Maths' },
        { name: 'Corbett Maths — Common Factors and HCF', url: 'https://corbettmaths.com/2012/08/24/common-factors-and-hcf/', site: 'Corbett Maths' },
        { name: 'Corbett Maths — LCM and Common Multiples', url: 'https://corbettmaths.com/2012/08/11/lcm-and-common-multiples/', site: 'Corbett Maths' },
      ],
    },
    {
      keywords: ['standard form'],
      links: [
        { name: 'Corbett Maths — Standard Form', url: 'https://corbettmaths.com/2013/04/28/standard-form/', site: 'Corbett Maths' },
      ],
    },
    {
      keywords: ['percentage change', 'reverse percentage'],
      links: [
        { name: 'Corbett Maths — Percentage Change', url: 'https://corbettmaths.com/2013/03/31/percentage-change/', site: 'Corbett Maths' },
        { name: 'Corbett Maths — Reverse Percentages', url: 'https://corbettmaths.com/2013/02/15/reverse-percentages/', site: 'Corbett Maths' },
      ],
    },
    {
      keywords: ['simultaneous equations'],
      links: [
        { name: 'Corbett Maths — Simultaneous Equations (Elimination)', url: 'https://corbettmaths.com/2013/03/05/simultaneous-equations-elimination-method/', site: 'Corbett Maths' },
        { name: 'Corbett Maths — Simultaneous Equations (Substitution)', url: 'https://corbettmaths.com/2013/05/07/solving-simultaneous-equations-by-substitution/', site: 'Corbett Maths' },
      ],
    },
    {
      keywords: ['quadratic formula'],
      links: [
        { name: 'Corbett Maths — Quadratic Formula', url: 'https://corbettmaths.com/2013/04/24/quadratic-formula/', site: 'Corbett Maths' },
      ],
    },
    {
      keywords: ['completing the square'],
      links: [
        { name: 'Corbett Maths — Completing the Square', url: 'https://corbettmaths.com/2013/12/29/completing-the-square-video-10/', site: 'Corbett Maths' },
        { name: 'Corbett Maths — Completing the Square Practice Questions', url: 'https://corbettmaths.com/2019/08/22/completing-the-square-practice-questions/', site: 'Corbett Maths' },
      ],
    },
    {
      keywords: ['pythagoras'],
      links: [
        { name: "Corbett Maths — Pythagoras' Theorem", url: 'https://corbettmaths.com/2012/08/19/pythagoras-video/', site: 'Corbett Maths' },
      ],
    },
    {
      keywords: ['trigonometry', 'sohcahtoa'],
      links: [
        { name: 'Corbett Maths — Trigonometry', url: 'https://corbettmaths.com/2018/04/25/trigonometry-videos/', site: 'Corbett Maths' },
      ],
    },
  ],

  // No exact science topic pages have been confirmed. Cognito's subject pages list exam-board
  // courses, not individual topics, so those links sit in SUBJECT_HUBS (Tier 2b) instead.
  'Biology': [],
  'Chemistry': [],
  'Physics': [],
}

// ── TIER 2a: Board + level specific hub pages ─────────────────────────────────
// Save My Exams course pages (each a link in that site's own navigation, see the check note at
// the top) and Physics & Maths Tutor pages (each opened). Keyed by `${subject}|${board}|${level}`.
// A subject/board/level that is not listed has no confirmed page of this kind and falls through
// to Tier 2b/3. Physics & Maths Tutor has no revision pages for GCSE Economics, GCSE Psychology
// or A-level English Language (past papers only), so those list Save My Exams only. The Save My
// Exams Mathematics and Statistics links open the Higher tier notes; the site has Foundation too.
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
  'Combined Science: Synergy|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Combined Science: Synergy', url: 'https://www.savemyexams.com/gcse/science/aqa/combined-science-synergy/16/', site: 'Save My Exams' }],
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
  'Economics|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Economics', url: 'https://www.savemyexams.com/gcse/economics/aqa/', site: 'Save My Exams' }],
  'English Language & Literature|AQA|A-Level': [{ name: 'Save My Exams — AQA A-Level English Language & Literature past papers', url: 'https://www.savemyexams.com/a-level/english-language-and-literature/aqa/past-papers/', site: 'Save My Exams' }],
  'English Language|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE English Language', url: 'https://www.savemyexams.com/gcse/english-language/aqa/17/revision-notes/', site: 'Save My Exams' }, { name: 'Physics & Maths Tutor — AQA GCSE English Language', url: 'https://www.physicsandmathstutor.com/english-revision/gcse-aqa-language/', site: 'Physics & Maths Tutor' }],
  'English Language|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE English Language', url: 'https://www.savemyexams.com/gcse/english-language/edexcel/15/revision-notes/', site: 'Save My Exams' }],
  'English Literature|AQA|A-Level': [{ name: 'Physics & Maths Tutor — AQA A-Level English Literature', url: 'https://www.physicsandmathstutor.com/english-revision/a-level-aqa/', site: 'Physics & Maths Tutor' }],
  'English Literature|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE English Literature', url: 'https://www.savemyexams.com/gcse/english-literature/aqa/17/revision-notes/', site: 'Save My Exams' }, { name: 'Physics & Maths Tutor — AQA GCSE English Literature', url: 'https://www.physicsandmathstutor.com/english-revision/gcse-aqa/', site: 'Physics & Maths Tutor' }],
  'English Literature|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE English Literature', url: 'https://www.savemyexams.com/gcse/english-literature/edexcel/17/revision-notes/', site: 'Save My Exams' }],
  'Food Preparation & Nutrition|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Food Preparation & Nutrition', url: 'https://www.savemyexams.com/gcse/food-and-nutrition/aqa/food-preparation-and-nutrition/16/revision-notes/', site: 'Save My Exams' }],
  'French|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE French', url: 'https://www.savemyexams.com/gcse/french/aqa/24/revision-notes/', site: 'Save My Exams' }],
  'French|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE French', url: 'https://www.savemyexams.com/gcse/french/edexcel/', site: 'Save My Exams' }],
  'Further Mathematics|AQA|A-Level': [{ name: 'Save My Exams — AQA A-Level Further Mathematics', url: 'https://www.savemyexams.com/a-level/further-maths/aqa/', site: 'Save My Exams' }, { name: 'Physics & Maths Tutor — A-Level Further Maths Core Pure', url: 'https://www.physicsandmathstutor.com/maths-revision/further-core-pure/', site: 'Physics & Maths Tutor' }],
  'Further Mathematics|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Further Mathematics', url: 'https://www.savemyexams.com/gcse/further-maths/aqa/20/revision-notes/', site: 'Save My Exams' }],
  'Further Mathematics|Edexcel|A-Level': [{ name: 'Physics & Maths Tutor — A-Level Further Maths Core Pure', url: 'https://www.physicsandmathstutor.com/maths-revision/further-core-pure/', site: 'Physics & Maths Tutor' }],
  'Further Mathematics|OCR|A-Level': [{ name: 'Physics & Maths Tutor — A-Level Further Maths Core Pure', url: 'https://www.physicsandmathstutor.com/maths-revision/further-core-pure/', site: 'Physics & Maths Tutor' }],
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
  'Mathematics|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Mathematics (Higher tier)', url: 'https://www.savemyexams.com/gcse/maths/aqa/22/higher/revision-notes/', site: 'Save My Exams' }, { name: 'Physics & Maths Tutor — AQA GCSE Mathematics questions by topic', url: 'https://www.physicsandmathstutor.com/maths-revision/gcse-questions-aqa/', site: 'Physics & Maths Tutor' }],
  'Mathematics|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Mathematics (Higher tier)', url: 'https://www.savemyexams.com/gcse/maths/edexcel/22/higher/revision-notes/', site: 'Save My Exams' }],
  'Mathematics|OCR|GCSE': [{ name: 'Save My Exams — OCR GCSE Mathematics (Higher tier)', url: 'https://www.savemyexams.com/gcse/maths/ocr/22/higher/revision-notes/', site: 'Save My Exams' }],
  'Media Studies|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Media Studies', url: 'https://www.savemyexams.com/gcse/media-studies/aqa/', site: 'Save My Exams' }],
  'Music|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Music', url: 'https://www.savemyexams.com/gcse/music/aqa/', site: 'Save My Exams' }],
  'Physical Education|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Physical Education', url: 'https://www.savemyexams.com/gcse/physical-education/aqa/16/revision-notes/', site: 'Save My Exams' }],
  'Physical Education|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Physical Education', url: 'https://www.savemyexams.com/gcse/physical-education/edexcel/', site: 'Save My Exams' }],
  'Physical Education|OCR|GCSE': [{ name: 'Save My Exams — OCR GCSE Physical Education', url: 'https://www.savemyexams.com/gcse/physical-education/ocr/', site: 'Save My Exams' }],
  'Physics|AQA|A-Level': [{ name: 'Save My Exams — AQA A-Level Physics', url: 'https://www.savemyexams.com/a-level/physics/aqa/17/', site: 'Save My Exams' }, { name: 'Physics & Maths Tutor — AQA A-Level Physics', url: 'https://www.physicsandmathstutor.com/physics-revision/a-level-aqa/', site: 'Physics & Maths Tutor' }],
  'Physics|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Physics', url: 'https://www.savemyexams.com/gcse/physics/aqa/18/revision-notes/', site: 'Save My Exams' }, { name: 'Physics & Maths Tutor — AQA GCSE Physics', url: 'https://www.physicsandmathstutor.com/physics-revision/gcse-aqa/', site: 'Physics & Maths Tutor' }],
  'Physics|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Physics', url: 'https://www.savemyexams.com/gcse/physics/edexcel/18/revision-notes/', site: 'Save My Exams' }],
  'Physics|OCR|GCSE': [{ name: 'Save My Exams — OCR GCSE Physics', url: 'https://www.savemyexams.com/gcse/physics/ocr/a-gateway/16/revision-notes/', site: 'Save My Exams' }],
  'Polish|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Polish', url: 'https://www.savemyexams.com/gcse/polish/aqa/17/revision-notes/', site: 'Save My Exams' }],
  'Psychology|AQA|A-Level': [{ name: 'Physics & Maths Tutor — AQA A-Level Psychology', url: 'https://www.physicsandmathstutor.com/psychology-revision/a-level-aqa/', site: 'Physics & Maths Tutor' }],
  'Psychology|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Psychology', url: 'https://www.savemyexams.com/gcse/psychology/aqa/19/revision-notes/', site: 'Save My Exams' }],
  'Psychology|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Psychology', url: 'https://www.savemyexams.com/gcse/psychology/edexcel/', site: 'Save My Exams' }],
  'Psychology|OCR|GCSE': [{ name: 'Save My Exams — OCR GCSE Psychology', url: 'https://www.savemyexams.com/gcse/psychology/ocr/17/revision-notes/', site: 'Save My Exams' }],
  'Religious Studies|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Religious Studies', url: 'https://www.savemyexams.com/gcse/religious-studies/aqa/a/18/revision-notes/', site: 'Save My Exams' }],
  'Religious Studies|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Religious Studies', url: 'https://www.savemyexams.com/gcse/religious-studies/edexcel/a/16/', site: 'Save My Exams' }],
  'Sociology|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Sociology', url: 'https://www.savemyexams.com/gcse/sociology/aqa/17/revision-notes/', site: 'Save My Exams' }],
  'Spanish|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Spanish', url: 'https://www.savemyexams.com/gcse/spanish/aqa/24/revision-notes/', site: 'Save My Exams' }],
  'Spanish|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Spanish', url: 'https://www.savemyexams.com/gcse/spanish/edexcel/', site: 'Save My Exams' }],
  'Statistics|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Statistics (Higher tier)', url: 'https://www.savemyexams.com/gcse/statistics/aqa/17/higher/revision-notes/', site: 'Save My Exams' }],
  'Statistics|Edexcel|GCSE': [{ name: 'Save My Exams — Edexcel GCSE Statistics (Higher tier)', url: 'https://www.savemyexams.com/gcse/statistics/edexcel/17/higher/revision-notes/', site: 'Save My Exams' }],
  'Urdu|AQA|GCSE': [{ name: 'Save My Exams — AQA GCSE Urdu', url: 'https://www.savemyexams.com/gcse/urdu/aqa/', site: 'Save My Exams' }],
}

// ── TIER 2b: Stable subject hub / contents pages ──────────────────────────────
export const SUBJECT_HUBS = {
  'Mathematics':         [{ name: 'Corbett Maths — Full Topic List', url: 'https://corbettmaths.com/contents/', site: 'Corbett Maths' }, { name: 'PMT — Maths Revision', url: 'https://www.physicsandmathstutor.com/maths-revision/', site: 'Physics & Maths Tutor' }],
  'Further Mathematics': [{ name: 'Dr Frost Maths', url: 'https://www.drfrost.org/', site: 'Dr Frost Maths' }],
  'Biology':             [{ name: 'Cognito — GCSE Biology', url: 'https://go.cognitoedu.org/biology', site: 'Cognito' }, { name: 'Save My Exams — GCSE Biology (all boards)', url: 'https://www.savemyexams.com/gcse/biology/revision-notes/', site: 'Save My Exams' }],
  'Chemistry':           [{ name: 'Cognito — GCSE Chemistry', url: 'https://go.cognitoedu.org/chemistry', site: 'Cognito' }, { name: 'PMT — Chemistry Revision (all boards)', url: 'https://www.physicsandmathstutor.com/chemistry-revision/', site: 'Physics & Maths Tutor' }],
  'Physics':             [{ name: 'Cognito — GCSE Physics', url: 'https://go.cognitoedu.org/physics', site: 'Cognito' }, { name: 'Save My Exams — Physics (all boards/levels)', url: 'https://www.savemyexams.com/subjects/physics/', site: 'Save My Exams' }],
  'Combined Science':    [{ name: 'Cognito — GCSE Revision (all subjects)', url: 'https://go.cognitoedu.org/gcse', site: 'Cognito' }, { name: 'Save My Exams — GCSE Science (all boards)', url: 'https://www.savemyexams.com/gcse/science/', site: 'Save My Exams' }],
  // The four BBC Bitesize URLs below were NOT checked (bbc.co.uk could not be opened in the November 2026 check).
  'English Language':    [{ name: 'BBC Bitesize — English Language', url: 'https://www.bbc.co.uk/bitesize/subjects/zr9d7ty', site: 'BBC Bitesize' }],
  'English Literature':  [{ name: 'BBC Bitesize — English Literature', url: 'https://www.bbc.co.uk/bitesize/subjects/zm8ng82', site: 'BBC Bitesize' }],
  'History':             [{ name: 'BBC Bitesize — History', url: 'https://www.bbc.co.uk/bitesize/subjects/zk26n39', site: 'BBC Bitesize' }],
  'Geography':           [{ name: 'BBC Bitesize — Geography', url: 'https://www.bbc.co.uk/bitesize/subjects/zkw76sg', site: 'BBC Bitesize' }],
  'Computer Science':    [{ name: "Craig'n'Dave — Computer Science resources", url: 'https://craigndave.org/', site: "Craig'n'Dave" }],
  'Business Studies':    [{ name: 'Tutor2u — Free Business resources', url: 'https://www.tutor2u.net/free/business', site: 'Tutor2u' }],
  'Business':            [{ name: 'Tutor2u — Free Business resources', url: 'https://www.tutor2u.net/free/business', site: 'Tutor2u' }],
  'Economics':           [{ name: 'Tutor2u — Free Economics resources', url: 'https://www.tutor2u.net/free/economics', site: 'Tutor2u' }],
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
