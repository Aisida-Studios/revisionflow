// src/components/illustrations/index.js — public API of the illustration system.
//   import { SubjectIllustration, SubjectTile, Illustration, BadgeArt, EmptyState } from '../components/illustrations'
//
// Route pages (everything App.jsx loads with lazy()) can import from here freely.
// The APP SHELL cannot: anything App.jsx / main.jsx import statically ends up in the first download,
// and this barrel pulls in the whole artwork registry. In the shell (pop-ups, toasts, error screen)
// import from './lazy' instead — LazyIllustration / LazyBadgeArt load the artwork on demand.
export { default as SubjectIllustration, componentForSubject, THEME_COMPONENTS } from './SubjectIllustration'
export { default as SubjectTile } from './SubjectTile'
export { default as Illustration } from './Illustration'
export { default as BadgeArt } from './BadgeArt'
export { default as EmptyState } from './EmptyState'
export {
  THEMES, SCENE_NAMES, BADGE_IDS, themeForSubject, assetForSubject, normaliseSubject,
  THEME_ASSETS, SCENE_ASSETS,
} from './registry'
