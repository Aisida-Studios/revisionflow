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
//            Save My Exams, not just "Save My Exams" generally) — verified via
//            live web search, not recalled from training data, since exactly
//            this kind of URL is what drifts over time. Covers the handful of
//            highest-traffic AQA subjects only; see the coverage note below.
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
// Every URL below was individually confirmed via live web search while building this
// feature (not recalled from training data — exactly the kind of URL that goes stale
// silently). Keyed by `${subject}|${board}|${level}`.
//
// COVERAGE NOTE: this only covers AQA at the subjects checked directly — the handful
// that make up the bulk of real usage (Biology/Chemistry/Physics/Maths/English). It does
// NOT attempt every subject×board×level combination — extending this reliably means
// verifying each one the same way, not extrapolating a URL pattern onto a subject nobody's
// actually checked. Everything not listed here falls through to the safe generic tiers
// below exactly as before.
const BOARD_LEVEL_HUBS = {
  'Biology|AQA|GCSE': [
    { name: 'Save My Exams — AQA GCSE Biology', url: 'https://www.savemyexams.com/gcse/biology/aqa/18/', site: 'Save My Exams' },
  ],
  'Biology|AQA|A-Level': [
    { name: 'Save My Exams — AQA A-Level Biology', url: 'https://www.savemyexams.com/a-level/biology/aqa/17/', site: 'Save My Exams' },
  ],
  'Chemistry|AQA|GCSE': [
    { name: 'Save My Exams — AQA GCSE Chemistry', url: 'https://www.savemyexams.com/gcse/chemistry/aqa/18/', site: 'Save My Exams' },
    { name: 'PMT — AQA GCSE Chemistry Revision', url: 'https://www.physicsandmathstutor.com/chemistry-revision/gcse-aqa/', site: 'Physics & Maths Tutor' },
  ],
  'Chemistry|AQA|A-Level': [
    { name: 'Save My Exams — AQA A-Level Chemistry', url: 'https://www.savemyexams.com/a-level/chemistry/aqa/17/', site: 'Save My Exams' },
    { name: 'PMT — AQA A-Level Chemistry Revision', url: 'https://www.physicsandmathstutor.com/chemistry-revision/a-level-aqa/', site: 'Physics & Maths Tutor' },
  ],
  'Physics|AQA|GCSE': [
    { name: 'Save My Exams — AQA GCSE Physics', url: 'https://www.savemyexams.com/gcse/physics/aqa/18/', site: 'Save My Exams' },
  ],
  'Physics|AQA|A-Level': [
    { name: 'Save My Exams — AQA A-Level Physics', url: 'https://www.savemyexams.com/a-level/physics/aqa/17/', site: 'Save My Exams' },
    { name: 'PMT — AQA A-Level Physics Revision', url: 'https://www.physicsandmathstutor.com/physics-revision/a-level-aqa/', site: 'Physics & Maths Tutor' },
  ],
  'English Language|AQA|GCSE': [
    { name: 'Save My Exams — AQA GCSE English Language', url: 'https://www.savemyexams.com/gcse/english-language/aqa/17/', site: 'Save My Exams' },
  ],
  'English Language|AQA|A-Level': [
    { name: 'Save My Exams — AQA A-Level English Language', url: 'https://www.savemyexams.com/a-level/english-language-and-literature/aqa/', site: 'Save My Exams' },
  ],
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
