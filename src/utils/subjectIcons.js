// src/utils/subjectIcons.js
// Small, shared subject -> lucide icon lookup. Colour identity for subjects already
// exists (subjectColour() in data/subjects.js) — this adds a matching icon so subject
// badges/rows/headers get a consistent glyph + colour pair across Calendar and Study.
//
// The icon choices below are NOT invented here — src/pages/Landing.jsx already
// establishes the canonical icon for 8 subjects in its SUBJECTS_PREVIEW array
// ("Consistent subject colours across the whole app, so your calendar, topics and
// progress are easy to scan at a glance"), and its colour hexes are confirmed to match
// SUBJECT_COLOURS exactly:
//   Biology=Leaf, Chemistry=FlaskConical, Physics=Atom, Mathematics=Sigma,
//   'English Literature'=BookOpen, History=Landmark, 'Computer Science'=Cpu,
//   Psychology=Brain
// Those 8 are reused verbatim below. Every other key mirrors subjects.js's
// SUBJECT_COLOURS object 1:1 (same keys, same 'default' fallback, same BTEC handling)
// so this can never drift out of sync with the subject list itself.
import {
  Leaf, FlaskConical, Atom, Sigma, Calculator, BookOpen, Landmark, Globe2,
  Cpu, Wrench, Ruler, Palette, Camera, Music2, Drama, Dumbbell, Languages,
  Users, Brain, Briefcase, TrendingUp, Scale, Vote, Clapperboard, ChefHat,
} from 'lucide-react'

export const SUBJECT_ICONS = {
  // Sciences
  'Biology': Leaf,
  'Chemistry': FlaskConical,
  'Physics': Atom,
  'Combined Science': FlaskConical,
  'Combined Science: Trilogy': FlaskConical,
  'Combined Science: Synergy': FlaskConical,
  'Environmental Science': Leaf,
  // Maths
  'Mathematics': Sigma,
  'Further Mathematics': Sigma,
  'Statistics': Calculator,
  // English
  'English Language': BookOpen,
  'English Literature': BookOpen,
  'English Language & Literature': BookOpen,
  // Humanities
  'History': Landmark,
  'Geography': Globe2,
  'Religious Studies': BookOpen,
  'Philosophy': BookOpen,
  'Sociology': Users,
  'Psychology': Brain,
  'Law': Scale,
  'Politics': Vote,
  // Computing / technical
  'Computer Science': Cpu,
  'Engineering': Wrench,
  'Design & Technology': Ruler,
  'Design and Technology: Product Design': Ruler,
  'Technology and Design': Ruler,
  // Creative / performance
  'Art & Design': Palette,
  'Photography': Camera,
  'Music': Music2,
  'Drama': Drama,
  'Drama and Theatre': Drama,
  'Media Studies': Clapperboard,
  'Film Studies': Clapperboard,
  // PE
  'Physical Education': Dumbbell,
  // Languages
  'French': Languages,
  'German': Languages,
  'Spanish': Languages,
  'Mandarin Chinese': Languages,
  'Arabic': Languages,
  'Polish': Languages,
  'Urdu': Languages,
  'Latin': Languages,
  'Classical Greek': Languages,
  // Business / vocational
  'Business': Briefcase,
  'Business Studies': Briefcase,
  'Economics': TrendingUp,
  'Accounting': Calculator,
  'Food Preparation & Nutrition': ChefHat,
  'default': BookOpen,
}

// Light fallback for subjects not yet in the exact table above (e.g. newer
// TIERED_SUBJECTS additions like Bengali/Modern Hebrew/Panjabi that may not have
// their own SUBJECT_COLOURS entry yet either) — same graceful-degradation spirit
// as subjectColour()'s own SUBJECT_COLOURS[name] || SUBJECT_COLOURS.default.
const FALLBACK_RULES = [
  [/language|bengali|gujarati|hebrew|japanese|persian|portuguese|russian|turkish|welsh|panjabi|punjabi/i, Languages],
  [/business|hospitality|travel and tourism|enterprise/i, Briefcase],
  [/health and social care|childhood/i, Users],
  [/construction|built environment|vehicle technology/i, Ruler],
]

export function getSubjectIcon(name) {
  if (!name) return SUBJECT_ICONS.default
  if (name.startsWith('BTEC')) return Briefcase
  if (SUBJECT_ICONS[name]) return SUBJECT_ICONS[name]
  for (const [re, Icon] of FALLBACK_RULES) if (re.test(name)) return Icon
  return SUBJECT_ICONS.default
}

// Mirrors the isBiologyLike pattern already established in TopicDetail.jsx, so any
// screen choosing between the existing CellIllustration and SeedlingIllustration picks
// the same way a biology-flavoured subject/topic does everywhere else in the app.
export function isBiologyLike(name) {
  return /biology/i.test(name || '')
}
