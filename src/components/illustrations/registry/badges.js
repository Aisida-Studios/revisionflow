// src/components/illustrations/registry/badges.js
// Which emblem belongs to which badge id. See subjects.js for why the registry is split by domain.
import * as E from '../badges/emblems'


/**
 * One entry per REAL badge in data/badges.js (30). `tone` picks the medallion palette in
 * BadgeArt.jsx (mastery tiers carry their own metal rim; streak_100 gets a gold rim); `Emblem`
 * is the picture inside. Unknown ids fall back to a leaf emblem — nothing throws.
 */
export const BADGE_ART = {
  // milestones
  first_session:    { tone: 'milestone',   Emblem: E.FirstSession },
  first_paper:      { tone: 'milestone',   Emblem: E.FirstPaper },
  first_ai:         { tone: 'milestone',   Emblem: E.FirstAI },
  profile_complete: { tone: 'milestone',   Emblem: E.ProfileComplete },
  // streaks — a plant that keeps growing
  streak_3:   { tone: 'streak',    Emblem: E.Streak3 },
  streak_7:   { tone: 'streak',    Emblem: E.Streak7 },
  streak_14:  { tone: 'streak',    Emblem: E.Streak14 },
  streak_30:  { tone: 'streak',    Emblem: E.Streak30 },
  streak_100: { tone: 'legendary', Emblem: E.Streak100 },
  // subject mastery
  mastery_bronze: { tone: 'bronze', Emblem: E.MasteryBronze },
  mastery_silver: { tone: 'silver', Emblem: E.MasterySilver },
  mastery_gold:   { tone: 'gold',   Emblem: E.MasteryGold },
  // improvement
  grade_up:     { tone: 'improvement', Emblem: E.GradeUp },
  full_marks:   { tone: 'improvement', Emblem: E.FullMarks },
  comeback:     { tone: 'improvement', Emblem: E.Comeback },
  ten_papers:   { tone: 'improvement', Emblem: E.TenPapers },
  fifty_papers: { tone: 'improvement', Emblem: E.FiftyPapers },
  // consistency
  early_bird:       { tone: 'consistency', Emblem: E.EarlyBird },
  night_owl:        { tone: 'consistency', Emblem: E.NightOwl },
  weekend_warrior:  { tone: 'consistency', Emblem: E.WeekendWarrior },
  marathon_session: { tone: 'consistency', Emblem: E.Marathon },
  quests_complete:  { tone: 'consistency', Emblem: E.QuestsComplete },
  // social
  first_friend:  { tone: 'social', Emblem: E.FirstFriend },
  three_friends: { tone: 'social', Emblem: E.ThreeFriends },
  top_three:     { tone: 'social', Emblem: E.TopThree },
  referral:      { tone: 'social', Emblem: E.Referral },
  // special
  emergency_mode: { tone: 'special', Emblem: E.EmergencyMode },
  ai_plan:        { tone: 'special', Emblem: E.AIPlan },
  flashcard_gen:  { tone: 'special', Emblem: E.FlashcardGen },
  ten_sessions:   { tone: 'special', Emblem: E.TenSessions },
}
export const BADGE_IDS = Object.keys(BADGE_ART)
export const FALLBACK_BADGE = { tone: 'special', Emblem: E.GenericEmblem }
