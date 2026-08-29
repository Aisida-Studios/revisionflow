// src/data/illustrationThemes.js
//
// Maps every subject string used across GCSE/A-Level/AS-Level/BTEC (see subjects.js,
// untouched) to one of a small set of illustration THEMES, rather than one bespoke
// image per exact subject string — "French", "German" and "Latin" sharing a single
// "languages" illustration is a better design decision than nine near-identical
// images, not a shortcut.
//
// THEME_ASSETS is the single place a real generated image gets registered once you
// have one: drop the file at public/illustrations/<theme>.png (or .svg) and change
// that theme's `null` below to the path. Until then, SubjectIllustration.jsx falls
// back to a hand-coded SVG automatically — every subject always renders something,
// nothing ever silently shows a blank box while assets are still being produced.

export const THEMES = [
  'biology', 'chemistry', 'physics', 'maths', 'english', 'history', 'geography',
  'computerScience', 'languages', 'art', 'music', 'drama', 'pe',
  'religionPhilosophy', 'psychology', 'business', 'lawPolitics', 'media',
  'designTech', 'foodNutrition', 'environmentalScience', 'health', 'generic',
]

// Register a real generated asset here once you have one — e.g. biology: '/illustrations/biology.png'
export const THEME_ASSETS = {
  biology: null, chemistry: null, physics: null, maths: null, english: null,
  history: null, geography: null, computerScience: null, languages: null,
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

export function assetForSubject(subjectName) {
  return THEME_ASSETS[themeForSubject(subjectName)] || null
}
