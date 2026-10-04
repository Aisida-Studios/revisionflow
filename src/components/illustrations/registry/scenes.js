// src/components/illustrations/registry/scenes.js
// Which artwork belongs to which feature / state / reward scene (320×240). See subjects.js for
// why the registry is split by domain (bundle weight) rather than kept in one file.
import {
  DashboardScene, StudyScene, CalendarScene, PastPapersScene, MistakesScene, AnalyticsScene, ExamScene,
  FocusScene, SuccessScene, RevisionScene, WelcomeScene, ResourcesScene, AssistantScene,
} from '../scenes/features'
import { StreakScene, AchievementScene, MasteryScene } from '../scenes/rewards'
import {
  EmptySessionsScene, EmptyAnalyticsScene, EmptyMistakesScene, EmptyPapersScene, EmptyNotesScene,
  EmptyFlashcardsScene, EmptyExamsScene, EmptyPlanScene,
} from '../scenes/empty'


/**
 * Feature / state / reward scenes, drawn on a 320×240 landscape canvas.
 *   features  dashboard · study · calendar · pastPapers · mistakes · analytics · exam · focus ·
 *             revision · resources · assistant · welcome
 *   rewards   success · streak · achievement · mastery
 *   empty     emptySessions · emptyMistakes · emptyPapers · emptyAnalytics · emptyNotes ·
 *             emptyFlashcards · emptyExams · emptyPlan
 */
export const SCENE_ART = {
  dashboard: DashboardScene, study: StudyScene, calendar: CalendarScene, pastPapers: PastPapersScene,
  mistakes: MistakesScene, analytics: AnalyticsScene, exam: ExamScene, focus: FocusScene,
  revision: RevisionScene, resources: ResourcesScene, assistant: AssistantScene, welcome: WelcomeScene,
  success: SuccessScene, streak: StreakScene, achievement: AchievementScene, mastery: MasteryScene,
  emptySessions: EmptySessionsScene, emptyMistakes: EmptyMistakesScene, emptyPapers: EmptyPapersScene,
  emptyAnalytics: EmptyAnalyticsScene, emptyNotes: EmptyNotesScene, emptyFlashcards: EmptyFlashcardsScene,
  emptyExams: EmptyExamsScene, emptyPlan: EmptyPlanScene,
}
export const SCENE_NAMES = Object.keys(SCENE_ART)

/** Scenes that draw their own ground and read better without the soft stage behind them. */
export const SCENES_WITHOUT_STAGE = new Set(['streak'])

/** Same swap-in hook as THEME_ASSETS, per scene (e.g. dashboard: '/illustrations/dashboard.webp'). */
export const SCENE_ASSETS = Object.fromEntries(SCENE_NAMES.map((n) => [n, null]))
