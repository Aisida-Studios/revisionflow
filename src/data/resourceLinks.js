// src/data/resourceLinks.js
// ─────────────────────────────────────────────────────────────────────────────
// Per-topic resource matching.
//
// HONEST DESIGN NOTE: with 2,431+ topics across boards/levels, we cannot
// hand-verify an exact deep-link URL for every single one — sites restructure,
// slugs vary unpredictably, and a wrong guessed URL is worse than no link at all
// (it erodes trust). Instead we use a 3-tier system:
//
//   TIER 1 — VERIFIED_DEEP_LINKS: hand-checked exact URLs for the highest-traffic
//            GCSE Maths/Science/English topics. These are real, tested links.
//   TIER 2 — SUBJECT_HUBS: each site's own stable topic-index/contents page for
//            that subject — won't 404, always lands somewhere useful.
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
        { name: 'Cognito — Photosynthesis', url: 'https://www.cognitoedu.org/topics/photosynthesis-gcse', site: 'Cognito' },
      ],
    },
    {
      keywords: ['cell structure', 'cell division', 'mitosis'],
      links: [
        { name: 'Cognito — Cell Biology', url: 'https://www.cognitoedu.org/topics/cell-structure-gcse', site: 'Cognito' },
      ],
    },
    {
      keywords: ['respiration'],
      links: [
        { name: 'Cognito — Respiration', url: 'https://www.cognitoedu.org/topics/cellular-respiration-gcse', site: 'Cognito' },
      ],
    },
  ],

  'Chemistry': [
    {
      keywords: ['atomic structure'],
      links: [
        { name: 'Cognito — Atomic Structure', url: 'https://www.cognitoedu.org/topics/atomic-structure-gcse', site: 'Cognito' },
      ],
    },
    {
      keywords: ['periodic table'],
      links: [
        { name: 'Cognito — The Periodic Table', url: 'https://www.cognitoedu.org/topics/the-periodic-table-gcse', site: 'Cognito' },
      ],
    },
  ],

  'Physics': [
    {
      keywords: ['forces', 'newton'],
      links: [
        { name: 'Cognito — Forces', url: 'https://www.cognitoedu.org/topics/forces-gcse', site: 'Cognito' },
      ],
    },
    {
      keywords: ['energy stores', 'energy transfer'],
      links: [
        { name: 'Cognito — Energy', url: 'https://www.cognitoedu.org/topics/energy-gcse', site: 'Cognito' },
      ],
    },
  ],
}

// ── TIER 2: Stable subject hub / contents pages (won't 404) ───────────────────
export const SUBJECT_HUBS = {
  'Mathematics':         [{ name: 'Corbett Maths — Full Topic List', url: 'https://corbettmaths.com/contents/', site: 'Corbett Maths' }],
  'Further Mathematics': [{ name: 'Dr Frost Maths', url: 'https://www.drfrostmaths.com', site: 'Dr Frost Maths' }],
  'Biology':             [{ name: 'Cognito — All Biology Topics', url: 'https://www.cognitoedu.org/subjects/biology', site: 'Cognito' }],
  'Chemistry':           [{ name: 'Cognito — All Chemistry Topics', url: 'https://www.cognitoedu.org/subjects/chemistry', site: 'Cognito' }],
  'Physics':             [{ name: 'Cognito — All Physics Topics', url: 'https://www.cognitoedu.org/subjects/physics', site: 'Cognito' }],
  'Combined Science':    [{ name: 'Cognito — Combined Science', url: 'https://www.cognitoedu.org', site: 'Cognito' }],
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
 * Always returns at least the Tier 3 search links, so the UI never shows
 * an empty state.
 */
export function resolveTopicResources(subject, topicName) {
  const result = { verified: [], hub: [], search: [] }
  const lower = (topicName || '').toLowerCase()

  // Tier 1
  const subjEntries = VERIFIED_DEEP_LINKS[subject] || []
  for (const entry of subjEntries) {
    if (entry.keywords.some(k => lower.includes(k))) {
      result.verified.push(...entry.links)
    }
  }

  // Tier 2
  result.hub = SUBJECT_HUBS[subject] || []

  // Tier 3 — always present
  result.search = SEARCH_SITES.map(site => buildSearchLink(site, topicName))

  return result
}
