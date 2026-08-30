// src/utils/subjectIcons.js
// Small, shared subject -> lucide icon lookup. Colour identity for subjects already
// exists (subjectColour() in data/subjects.js) — this adds a matching icon so subject
// badges/rows/headers get a consistent glyph + colour pair across Calendar and Study,
// rather than each page inventing its own mapping or falling back to emoji.
//
// Deliberately keyword-based rather than one entry per exact subject string: subjects.js
// has 100+ subject names across GCSE/AS/A-level/BTEC and they don't need 100+ distinct
// icons to be "distinctive" — colour (already unique per subject) does the fine-grained
// differentiation, the icon communicates the subject *family* at a glance.
import {
  FlaskConical, Calculator, BookText, Landmark, Globe2, Cpu, Palette,
  Music2, Drama, Dumbbell, Languages, Users, Brain, Briefcase, Scale,
  Clapperboard, Ruler, Leaf, Camera, ChefHat, HeartPulse, BookOpen,
} from 'lucide-react'

const RULES = [
  [/biology|human biology|environmental science/i, Leaf],
  [/chemistry/i, FlaskConical],
  [/physics/i, FlaskConical],
  [/combined science|applied science/i, FlaskConical],
  [/math|statistics/i, Calculator],
  [/english/i, BookText],
  [/history/i, Landmark],
  [/geography/i, Globe2],
  [/computer science|computing|information technology|esports/i, Cpu],
  [/art|photography/i, Camera],
  [/design.*technology|technology.*design|product design|engineering/i, Ruler],
  [/music/i, Music2],
  [/drama|theatre|performing arts/i, Drama],
  [/physical education|sport/i, Dumbbell],
  [/french|german|spanish|mandarin|chinese|arabic|polish|urdu|latin|greek|bengali|gujarati|japanese|persian|portuguese|russian|turkish|welsh|panjabi|hebrew/i, Languages],
  [/religious studies|philosophy/i, BookOpen],
  [/sociology|psychology|health and social care|childhood/i, Users],
  [/business|economics|accounting|enterprise|hospitality|travel and tourism/i, Briefcase],
  [/law|politics/i, Scale],
  [/media studies|film studies|creative media/i, Clapperboard],
  [/food preparation|nutrition|catering/i, ChefHat],
  [/animal|land-based|land and environment/i, Leaf],
  [/construction|built environment|vehicle technology/i, Ruler],
  [/forensic/i, Brain],
]

export function getSubjectIcon(name) {
  if (!name) return BookOpen
  for (const [re, Icon] of RULES) if (re.test(name)) return Icon
  return BookOpen
}

// Mirrors the isBiologyLike pattern already established in TopicDetail.jsx, so any
// screen choosing between the existing CellIllustration and SeedlingIllustration picks
// the same way a biology-flavoured subject/topic does everywhere else in the app.
export function isBiologyLike(name) {
  return /biology/i.test(name || '')
}
