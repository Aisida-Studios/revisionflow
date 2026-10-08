// src/components/illustrations/registry/subjects.js
// ─────────────────────────────────────────────────────────────────────────────
// THE single place that decides which artwork belongs to which SUBJECT. Scenes and badges are
// mapped in the sibling files scenes.js / badges.js — one folder, every mapping defined once,
// split only so a page that renders a subject picture doesn't also download every scene and badge.
// Nothing else in the repo maps subjects to artwork: data/illustrationThemes.js only re-exports.
//
// ONE PICTURE PER SUBJECT
// Different subjects never share artwork: Mathematics, Further Mathematics and Statistics are
// three pictures; French, German and Latin are three pictures; English Language, English
// Literature and English Language & Literature are three. A picture is shared ONLY by true
// aliases — the same subject under different board/specification labels:
//   • Combined Science · Combined Science: Trilogy · Combined Science: Synergy · Applied Science
//   • Business · Business Studies
//   • Design & Technology · Technology and Design · Design and Technology: Product Design
//   • Drama · Drama and Theatre
// (Variants such as "Biology A"/"Biology B", "Art & Design: Fine Art" and exam tiers resolve to
// their subject through the same keywords, so board options never need their own entries.)
//
// SUBJECT → THEME
//   1. normaliseSubject(): case, "&"↔"and", punctuation, diacritics and spacing are folded away,
//      so "Computer Science", "computer  science " and "Computer-Science" are ONE key.
//   2. The longest whole-word KEYWORD found in the normalised name wins. Whole-word matching
//      matters ("Children and Young People's Workforce" must not hit "pe"; "physics" must not
//      match "physical education"); longest-wins is what lets "further mathematics" beat
//      "mathematics" and "classical greek" beat "greek".
//   3. No match → 'generic' (the study-desk composition). Languages without their own picture
//      (e.g. Korean, Dutch, Irish) resolve to the neutral 'languages' speech-bubble picture.
// This module never edits subjects.js — it only reads names handed to it.
// ─────────────────────────────────────────────────────────────────────────────
import { BiologyArt, ChemistryArt, PhysicsArt, ScienceArt, EnvironmentalScienceArt } from '../subjects/sciences'
import {
  MathsArt, FurtherMathsArt, StatisticsArt, ComputerScienceArt, DesignTechArt, EngineeringArt,
} from '../subjects/stem'
import {
  EnglishArt, EnglishLanguageArt, EnglishLangLitArt, HistoryArt, GeographyArt, ReligiousStudiesArt,
  PhilosophyArt, PsychologyArt, SociologyArt, LawArt, PoliticsArt, LanguagesArt,
} from '../subjects/humanities'
import {
  FrenchArt, GermanArt, SpanishArt, ItalianArt, PortugueseArt, LatinArt, ClassicalGreekArt, GreekArt,
  RussianArt, PolishArt, TurkishArt, WelshArt, MandarinArt, JapaneseArt, ArabicArt, UrduArt,
  PersianArt, HebrewArt, BengaliArt, GujaratiArt, PanjabiArt,
} from '../subjects/languages'
import { ArtArt, PhotographyArt, MusicArt, DramaArt, FilmArt, MediaStudiesArt } from '../subjects/creative'
import {
  BusinessArt, EconomicsArt, AccountingArt, PEArt, FoodNutritionArt, HealthArt, GenericArt,
} from '../subjects/applied'

/* ───────────────────────────── subjects ───────────────────────────── */

export const THEMES = [
  // sciences
  'biology', 'chemistry', 'physics', 'science', 'environmentalScience',
  // maths & computing
  'maths', 'furtherMaths', 'statistics', 'computerScience',
  // english
  'englishLiterature', 'englishLanguage', 'englishLangLit',
  // humanities
  'history', 'geography', 'religiousStudies', 'philosophy', 'psychology', 'sociology', 'law', 'politics',
  // languages (+ a neutral picture for languages that have no illustration of their own)
  'french', 'german', 'spanish', 'italian', 'portuguese', 'latin', 'classicalGreek', 'greek',
  'russian', 'polish', 'turkish', 'welsh', 'mandarin', 'japanese', 'arabic', 'urdu', 'persian',
  'hebrew', 'bengali', 'gujarati', 'panjabi', 'languages',
  // creative & media
  'art', 'photography', 'music', 'drama', 'film', 'media',
  // technology, business & applied
  'designTech', 'engineering', 'business', 'economics', 'accounting', 'pe', 'foodNutrition', 'health',
  'generic',
]

/** theme → coded artwork. */
export const THEME_ART = {
  biology: BiologyArt, chemistry: ChemistryArt, physics: PhysicsArt, science: ScienceArt,
  environmentalScience: EnvironmentalScienceArt,
  maths: MathsArt, furtherMaths: FurtherMathsArt, statistics: StatisticsArt, computerScience: ComputerScienceArt,
  englishLiterature: EnglishArt, englishLanguage: EnglishLanguageArt, englishLangLit: EnglishLangLitArt,
  history: HistoryArt, geography: GeographyArt, religiousStudies: ReligiousStudiesArt, philosophy: PhilosophyArt,
  psychology: PsychologyArt, sociology: SociologyArt, law: LawArt, politics: PoliticsArt,
  french: FrenchArt, german: GermanArt, spanish: SpanishArt, italian: ItalianArt, portuguese: PortugueseArt,
  latin: LatinArt, classicalGreek: ClassicalGreekArt, greek: GreekArt, russian: RussianArt, polish: PolishArt,
  turkish: TurkishArt, welsh: WelshArt, mandarin: MandarinArt, japanese: JapaneseArt, arabic: ArabicArt,
  urdu: UrduArt, persian: PersianArt, hebrew: HebrewArt, bengali: BengaliArt, gujarati: GujaratiArt,
  panjabi: PanjabiArt, languages: LanguagesArt,
  art: ArtArt, photography: PhotographyArt, music: MusicArt, drama: DramaArt, film: FilmArt, media: MediaStudiesArt,
  designTech: DesignTechArt, engineering: EngineeringArt, business: BusinessArt, economics: EconomicsArt,
  accounting: AccountingArt, pe: PEArt, foodNutrition: FoodNutritionArt, health: HealthArt, generic: GenericArt,
}

/**
 * Replace any coded theme with a commissioned/raster image later by setting its path here
 * (e.g. biology: '/illustrations/biology.webp'). SubjectIllustration prefers an asset when set.
 */
export const THEME_ASSETS = Object.fromEntries(THEMES.map((t) => [t, null]))

/**
 * Compact-tier framing. At ≤72px a subject is drawn without its disc and foliage, so the 240-unit
 * canvas would leave the object floating in padding. These per-theme viewBoxes crop to each
 * object's measured bounds (+5% margin) so every tile fills consistently. Generated by measuring
 * the compact render in headless Chromium (getBBox); re-measure if a compact composition changes.
 */
export const COMPACT_VIEWBOX = {
  biology: '10 1 221 221',
  chemistry: '33 45 180 180',
  physics: '12 10 216 216',
  science: '27 20 196 196',
  environmentalScience: '28 44 184 184',
  maths: '26 27 179 179',
  furtherMaths: '39 32 166 166',
  statistics: '39 32 166 166',
  computerScience: '36 63 168 168',
  englishLiterature: '22 38 201 201',
  englishLanguage: '30 41 170 170',
  englishLangLit: '36 45 170 170',
  history: '50 61 164 164',
  geography: '15 12 206 206',
  religiousStudies: '26 23 191 191',
  philosophy: '51 67 142 142',
  psychology: '26 39 192 192',
  sociology: '45 34 154 154',
  law: '25 34 189 189',
  politics: '33 37 182 182',
  french: '36 44 175 175',
  german: '48 68 149 149',
  spanish: '50 81 146 146',
  italian: '44 59 158 158',
  portuguese: '50 71 146 146',
  latin: '45 79 154 154',
  classicalGreek: '49 74 147 147',
  greek: '40 49 166 166',
  russian: '40 49 166 166',
  polish: '40 49 166 166',
  turkish: '40 49 166 166',
  welsh: '40 49 166 166',
  mandarin: '40 49 166 166',
  japanese: '40 49 166 166',
  arabic: '40 49 166 166',
  urdu: '40 49 166 166',
  persian: '40 49 166 166',
  hebrew: '40 49 166 166',
  bengali: '40 49 166 166',
  gujarati: '40 49 166 166',
  panjabi: '40 49 166 166',
  languages: '34 36 179 179',
  art: '43 45 161 161',
  photography: '32 37 183 183',
  music: '50 70 143 143',
  drama: '20 30 206 206',
  film: '24 25 181 181',
  media: '30 37 186 186',
  designTech: '44 60 149 149',
  engineering: '29 50 172 172',
  business: '49 33 152 152',
  economics: '41 34 161 161',
  accounting: '19 52 193 193',
  pe: '28 22 183 183',
  foodNutrition: '36 59 169 169',
  health: '38 43 164 164',
  generic: '52 87 143 143',
}

/** theme → plain-language keywords (matched as whole words after normalisation). */
const THEME_KEYWORDS = {
  biology: ['biology', 'human biology'],
  chemistry: ['chemistry'],
  physics: ['physics', 'astronomy'],
  science: ['science', 'combined science', 'applied science', 'trilogy', 'synergy'],
  environmentalScience: [
    'environmental', 'environmental science', 'land and environment', 'animal care', 'animal management',
    'animal science', 'agriculture', 'horticulture', 'earth science', 'countryside',
  ],

  maths: ['mathematics', 'maths', 'math', 'mathematical', 'mathematical studies'],
  furtherMaths: ['further mathematics', 'further maths'],
  statistics: ['statistics', 'statistical', 'probability'],
  computerScience: ['computer science', 'computing', 'information technology', 'ict', 'esports', 'digital'],

  englishLiterature: ['english', 'english literature', 'literature'],
  englishLanguage: ['english language', 'creative writing'],
  englishLangLit: ['english language and literature'],

  history: ['history', 'ancient history', 'classical civilisation', 'classical civilization', 'archaeology'],
  geography: ['geography', 'travel and tourism', 'tourism', 'geology'],
  religiousStudies: ['religious studies', 'religious education', 'religion', 'theology', 'biblical studies'],
  philosophy: ['philosophy', 'ethics'],
  psychology: ['psychology'],
  sociology: ['sociology', 'social science', 'criminology', 'anthropology'],
  law: ['law', 'citizenship', 'public services', 'forensic', 'criminal', 'legal'],
  politics: ['politics', 'government and politics', 'political', 'international relations'],

  french: ['french'], german: ['german'], spanish: ['spanish'], italian: ['italian'],
  portuguese: ['portuguese'], latin: ['latin'], classicalGreek: ['classical greek', 'ancient greek', 'biblical greek'],
  greek: ['greek', 'modern greek'], russian: ['russian'], polish: ['polish'], turkish: ['turkish'],
  welsh: ['welsh', 'welsh second language'], mandarin: ['mandarin chinese', 'mandarin', 'chinese', 'cantonese'],
  japanese: ['japanese'], arabic: ['arabic'], urdu: ['urdu'], persian: ['persian', 'farsi'],
  hebrew: ['hebrew', 'modern hebrew', 'biblical hebrew'], bengali: ['bengali'], gujarati: ['gujarati'],
  panjabi: ['panjabi', 'punjabi'],
  languages: [
    'languages', 'modern foreign languages', 'korean', 'dutch', 'irish', 'gaelic', 'swedish', 'danish',
    'norwegian', 'hindi', 'tamil', 'swahili',
  ],

  art: ['art', 'art and design', 'art craft and design', 'fine art', 'graphic communication', 'graphic design', 'textile design'],
  photography: ['photography'],
  music: ['music', 'music technology'],
  drama: ['drama', 'dance', 'theatre', 'theatre studies', 'performing arts', 'drama and theatre'],
  film: ['film studies', 'film'],
  media: ['media studies', 'media', 'creative media', 'journalism'],

  designTech: [
    'design and technology', 'technology and design', 'design technology', 'product design', 'construction',
    'vehicle', 'land based technology', 'textiles', 'electronics',
  ],
  engineering: ['engineering'],
  business: ['business', 'business studies', 'enterprise', 'finance', 'financial', 'marketing', 'retail', 'management'],
  economics: ['economics'],
  accounting: ['accounting'],
  pe: ['physical education', 'sport', 'sports', 'exercise', 'fitness', 'sport and exercise science', 'exercise science'],
  foodNutrition: ['food', 'nutrition', 'food science', 'hospitality', 'catering', 'cookery', 'home economics'],
  health: ['health', 'health and social care', 'health science', 'social care', 'childcare', 'children', 'childhood', 'early years', 'nursing', 'care'],
}

/** Fold a subject name to its canonical lookup form (see header). Exported for the QA script & callers. */
export function normaliseSubject(name) {
  return String(name ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

// Longest keyword first so "further mathematics" beats "mathematics" and "computer science" beats "science".
const KEYWORD_INDEX = Object.entries(THEME_KEYWORDS)
  .flatMap(([theme, words]) => words.map((w) => [` ${normaliseSubject(w)} `, theme, normaliseSubject(w).length]))
  .sort((a, b) => b[2] - a[2])

const themeCache = new Map()

/** subject name (any casing/punctuation) → theme id. Unknown / empty → 'generic'. */
export function themeForSubject(subjectName) {
  const key = normaliseSubject(subjectName)
  if (!key) return 'generic'
  if (themeCache.has(key)) return themeCache.get(key)
  const padded = ` ${key} `
  const hit = KEYWORD_INDEX.find(([kw]) => padded.includes(kw))
  const theme = hit ? hit[1] : 'generic'
  themeCache.set(key, theme)
  return theme
}

/** Raster/commissioned asset path for this subject's theme, or null (coded artwork is used). */
export function assetForSubject(subjectName) {
  return THEME_ASSETS[themeForSubject(subjectName)] || null
}
