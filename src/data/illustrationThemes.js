// src/data/illustrationThemes.js
//
// Maps every subject string used across GCSE/A-Level/AS-Level/BTEC (see subjects.js,
// untouched) to one of a small set of illustration THEMES, rather than one bespoke
// image per exact subject string — "French", "German" and "Latin" sharing a single
// "languages" illustration is a better design decision than nine near-identical
// images, not a shortcut.
//
// Two registries:
//  - THEME_COMPONENTS: themes with a real coded SVG component (built the same way
//    as CellIllustration/SeedlingIllustration — { size, style } props, CSS-variable
//    colours so they adapt to dark mode). Import and use these directly.
//  - THEME_ASSETS: themes still waiting on a real generated image. Drop a file at
//    public/illustrations/<theme>.png and set its path here once you have one —
//    SubjectIllustration below falls back to the generic seedling until then, so
//    nothing ever renders blank.
import CellIllustration from '../components/illustrations/CellIllustration'
import SeedlingIllustration from '../components/illustrations/SeedlingIllustration'
import ChemistryIllustration from '../components/illustrations/ChemistryIllustration'
import PhysicsIllustration from '../components/illustrations/PhysicsIllustration'
import MathsIllustration from '../components/illustrations/MathsIllustration'
import EnglishIllustration from '../components/illustrations/EnglishIllustration'
import HistoryIllustration from '../components/illustrations/HistoryIllustration'
import GeographyIllustration from '../components/illustrations/GeographyIllustration'
import ComputerScienceIllustration from '../components/illustrations/ComputerScienceIllustration'
import LanguagesIllustration from '../components/illustrations/LanguagesIllustration'

export const THEMES = [
  'biology', 'chemistry', 'physics', 'maths', 'english', 'history', 'geography',
  'computerScience', 'languages', 'art', 'music', 'drama', 'pe',
  'religionPhilosophy', 'psychology', 'business', 'lawPolitics', 'media',
  'designTech', 'foodNutrition', 'environmentalScience', 'health', 'generic',
]

// Themes with a real coded illustration component. 13 of 23 done so far —
// the rest render the generic seedling until they're built or a real asset lands.
export const THEME_COMPONENTS = {
  biology: CellIllustration,
  chemistry: ChemistryIllustration,
  physics: PhysicsIllustration,
  maths: MathsIllustration,
  english: EnglishIllustration,
  history: HistoryIllustration,
  geography: GeographyIllustration,
  computerScience: ComputerScienceIllustration,
  languages: LanguagesIllustration,
  generic: SeedlingIllustration,
}

// Register a real generated asset here once you have one — e.g. art: '/illustrations/art.png'
export const THEME_ASSETS = {
  art: null, music: null, drama: null, pe: null, religionPhilosophy: null,
  psychology: null, business: null, lawPolitics: null, media: null,
  designTech: null, foodNutrition: null, environmentalScience: null, health: null,
}

const SUBJECT_THEME_MAP = {
  'Biology': 'biology', 'Combined Science': 'biology', 'Combined Science: Trilogy': 'biology',
  'Combined Science: Synergy': 'biology', 'Applied Science': 'biology', 'Applied Human Biology': 'biology',

  'Chemistry': 'chemistry',

  'Physics': 'physics',

  'Mathematics': 'maths', 'Further Mathematics': 'maths', 'Statistics': 'maths',

  'English Language': 'english', 'English Literature': 'english', 'English Language & Literature': 'english',

  'History': 'history',

  'Geography': 'geography', 'Environmental Science': 'environmentalScience',
  'Land and Environment': 'environmentalScience', 'Animal Care': 'environmentalScience',
  'Animal Management': 'environmentalScience',

  'Computer Science': 'computerScience', 'Computing': 'computerScience',
  'Information Technology': 'computerScience', 'Esports': 'computerScience',

  'French': 'languages', 'German': 'languages', 'Spanish': 'languages', 'Mandarin Chinese': 'languages',
  'Arabic': 'languages', 'Polish': 'languages', 'Urdu': 'languages', 'Latin': 'languages',
  'Classical Greek': 'languages',

  'Art & Design': 'art', 'Art and Design': 'art', 'Photography': 'art',

  'Music': 'music', 'Music Technology': 'music',

  'Drama': 'drama', 'Drama and Theatre': 'drama', 'Performing Arts': 'drama',

  'Physical Education': 'pe', 'Sport': 'pe', 'Sport and Exercise Science': 'pe',

  'Religious Studies': 'religionPhilosophy', 'Philosophy': 'religionPhilosophy',

  'Psychology': 'psychology', 'Applied Psychology': 'psychology', 'Sociology': 'psychology',

  'Business': 'business', 'Business Studies': 'business', 'Economics': 'business',
  'Accounting': 'business', 'Enterprise & Entrepreneurship': 'business',

  'Law': 'lawPolitics', 'Applied Law': 'lawPolitics', 'Politics': 'lawPolitics',
  'Forensic & Criminal Investigation': 'lawPolitics', 'Public Services': 'lawPolitics',

  'Media Studies': 'media', 'Film Studies': 'media', 'Creative Media Production': 'media',

  'Design & Technology': 'designTech', 'Technology and Design': 'designTech', 'Engineering': 'designTech',
  'Design and Technology: Product Design': 'designTech', 'Construction and the Built Environment': 'designTech',
  'Construction & Built Environment': 'designTech', 'Vehicle Technology': 'designTech',
  'Land-based Technology': 'designTech',

  'Food Preparation & Nutrition': 'foodNutrition', 'Hospitality': 'foodNutrition', 'Travel and Tourism': 'foodNutrition',

  'Health and Social Care': 'health', "Children and Young People's Workforce": 'health',
  "Children's Play, Learning & Development": 'health',
}

export function themeForSubject(subjectName) {
  return SUBJECT_THEME_MAP[subjectName] || 'generic'
}

// Primary lookup: a real coded illustration component for this subject, or the
// generic seedling if that theme hasn't been built yet.
export function componentForSubject(subjectName) {
  return THEME_COMPONENTS[themeForSubject(subjectName)] || SeedlingIllustration
}

// Secondary lookup: a real generated image path, for themes registered in
// THEME_ASSETS instead of (or in addition to) a coded component.
export function assetForSubject(subjectName) {
  return THEME_ASSETS[themeForSubject(subjectName)] || null
}
