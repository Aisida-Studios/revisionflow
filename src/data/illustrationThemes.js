// src/data/illustrationThemes.js
// ─────────────────────────────────────────────────────────────────────────────
// COMPATIBILITY RE-EXPORTS ONLY. Subject → artwork mapping and the artwork itself now live in
// src/components/illustrations/ (registry/subjects.js is the single source of truth for subjects;
// scenes.js and badges.js sit beside it). This file exists so
// existing imports — Dashboard, Topics, TopicDetail, Study — keep working unchanged. Prefer
//   import { componentForSubject } from '../components/illustrations'
// in new code; delete this file once nothing imports it.
// ─────────────────────────────────────────────────────────────────────────────
export { THEMES, THEME_ASSETS, themeForSubject, assetForSubject } from '../components/illustrations/registry/subjects'
export { THEME_COMPONENTS, componentForSubject } from '../components/illustrations/SubjectIllustration'
