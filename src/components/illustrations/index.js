// src/components/illustrations/index.js — public API of the illustration system.
//   import { SubjectIllustration, Illustration, BadgeArt, EmptyState } from '../components/illustrations'
export { default as SubjectIllustration, componentForSubject, THEME_COMPONENTS } from './SubjectIllustration'
export { default as Illustration } from './Illustration'
export { default as BadgeArt } from './BadgeArt'
export { default as EmptyState } from './EmptyState'
export {
  THEMES, SCENE_NAMES, BADGE_IDS, themeForSubject, assetForSubject, normaliseSubject,
  THEME_ASSETS, SCENE_ASSETS,
} from './registry'
