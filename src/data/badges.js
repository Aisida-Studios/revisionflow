// src/data/badges.js
// All badge definitions for RevisionFlow
// NOTE: exports BADGE_LIST and BADGE_MAP (not BADGES) to avoid name clash with subjects.js

export const BADGE_LIST = [
  // ── Milestones ──────────────────────────────────────────────────────────────
  { id: 'first_session',    name: 'First Step',       icon: '🚀', xp: 50,   desc: 'Log your first revision session',                   category: 'milestone', hint: 'Go to Calendar and log a session' },
  { id: 'first_paper',      name: 'Paper Trail',      icon: '📄', xp: 75,   desc: 'Log your first past paper',                        category: 'milestone', hint: 'Go to Past Papers and log a result' },
  { id: 'first_ai',         name: 'AI Student',       icon: '🤖', xp: 50,   desc: 'Use the AI Advisor for the first time',             category: 'milestone', hint: 'Ask the AI Advisor anything' },
  { id: 'profile_complete', name: 'All Set Up',       icon: '✅', xp: 100,  desc: 'Complete your profile with subjects and exam dates', category: 'milestone', hint: 'Add subjects in Settings and exam dates in Exam Dates' },

  // ── Streaks ─────────────────────────────────────────────────────────────────
  { id: 'streak_3',   name: 'Warming Up',     icon: '🔥', xp: 50,   desc: '3-day revision streak',   category: 'streak', hint: 'Log a session 3 days in a row' },
  { id: 'streak_7',   name: 'Week Warrior',   icon: '⚡', xp: 150,  desc: '7-day revision streak',   category: 'streak', hint: 'Log a session every day for a week' },
  { id: 'streak_14',  name: 'Fortnight Force',icon: '💪', xp: 300,  desc: '14-day revision streak',  category: 'streak', hint: 'Log a session every day for 2 weeks' },
  { id: 'streak_30',  name: 'Iron Will',      icon: '💎', xp: 600,  desc: '30-day revision streak',  category: 'streak', hint: 'Log a session every day for a whole month' },
  { id: 'streak_100', name: 'Legendary',      icon: '👑', xp: 2000, desc: '100-day revision streak', category: 'streak', hint: '100 days straight — the ultimate commitment' },

  // ── Subject Mastery ─────────────────────────────────────────────────────────
  { id: 'mastery_bronze', name: 'Getting There',  icon: '🥉', xp: 100, desc: 'Rate 10 topics at confidence 4 or 5 in one subject',       category: 'mastery', hint: 'Go to Topics and rate your confidence on each topic' },
  { id: 'mastery_silver', name: 'Almost There',   icon: '🥈', xp: 250, desc: 'Rate 20 topics at confidence 4 or 5 in one subject',       category: 'mastery', hint: 'Keep rating topics across your subjects' },
  { id: 'mastery_gold',   name: 'Subject Master', icon: '🥇', xp: 500, desc: 'Rate ALL topics at confidence 4 or 5 in one subject',      category: 'mastery', hint: 'Achieve high confidence in every topic of a subject' },

  // ── Improvement ─────────────────────────────────────────────────────────────
  { id: 'grade_up',     name: 'Level Up',        icon: '📈', xp: 150, desc: 'Improve your grade by 1 on a past paper vs your previous attempt', category: 'improvement', hint: 'Do a past paper, then score higher on the next one' },
  { id: 'full_marks',   name: 'Perfect Paper',   icon: '💯', xp: 400, desc: 'Score 90% or more on any past paper',                          category: 'improvement', hint: 'Ace a past paper with 90%+' },
  { id: 'comeback',     name: 'Comeback Kid',    icon: '⚡', xp: 200, desc: 'Bring a topic from confidence 1 up to confidence 4 or 5',       category: 'improvement', hint: 'Work on your weakest topics until you feel confident' },
  { id: 'ten_papers',   name: 'Paper Collector', icon: '📚', xp: 200, desc: 'Log 10 past paper attempts',                                   category: 'improvement', hint: 'Past papers are the best revision — do 10 of them' },
  { id: 'fifty_papers', name: 'Exam Machine',    icon: '⚙️', xp: 500, desc: 'Log 50 past paper attempts',                                   category: 'improvement', hint: 'Serious exam prep — 50 papers logged' },

  // ── Consistency ─────────────────────────────────────────────────────────────
  { id: 'early_bird',       name: 'Early Bird',      icon: '🌅', xp: 75,  desc: 'Log a revision session before 8am',                        category: 'consistency', hint: 'Start a session before 8 in the morning' },
  { id: 'night_owl',        name: 'Night Owl',       icon: '🦉', xp: 75,  desc: 'Log a revision session after 10pm',                        category: 'consistency', hint: 'Start a session after 10pm' },
  { id: 'weekend_warrior',  name: 'Weekend Warrior', icon: '📅', xp: 100, desc: 'Revise on both Saturday and Sunday in the same weekend',    category: 'consistency', hint: 'Log sessions on Saturday AND Sunday' },
  { id: 'marathon_session', name: 'Marathon',        icon: '🏃', xp: 200, desc: 'Complete a 2-hour timer session in one go',                 category: 'consistency', hint: 'Use the timer for a 120-minute session' },
  { id: 'quests_complete',  name: 'Quest Hunter',    icon: '🗡️', xp: 150, desc: 'Complete all 3 daily quests in one day',                   category: 'consistency', hint: 'Finish every daily quest on the dashboard' },

  // ── Social ───────────────────────────────────────────────────────────────────
  { id: 'first_friend',  name: 'Study Buddy',  icon: '👥', xp: 50,  desc: 'Add your first friend on RevisionFlow',                       category: 'social', hint: 'Go to Friends and add someone by username' },
  { id: 'three_friends', name: 'Study Group',  icon: '🤝', xp: 100, desc: 'Have 3 or more friends on RevisionFlow',                      category: 'social', hint: 'Invite your classmates' },
  { id: 'top_three',     name: 'Top Ranker',   icon: '🏆', xp: 300, desc: 'Reach the top 3 on the XP leaderboard',                      category: 'social', hint: 'Earn enough XP to get into the top 3' },
  { id: 'referral',      name: 'Recruiter',    icon: '📣', xp: 200, desc: 'Invite a friend who signs up using your referral code',       category: 'social', hint: 'Share your referral code from your Profile page' },

  // ── Special ──────────────────────────────────────────────────────────────────
  { id: 'emergency_mode', name: 'Clutch Player', icon: '🚨', xp: 100, desc: 'Use Emergency Mode when an exam is within 24 hours', category: 'special', hint: 'Open Emergency Mode the day before an exam' },
  { id: 'ai_plan',        name: 'Strategist',    icon: '🧠', xp: 100, desc: 'Generate your first AI study plan',                  category: 'special', hint: 'Go to AI Advisor → Study Plan and generate a plan' },
  { id: 'flashcard_gen',  name: 'Flash Master',  icon: '⚡', xp: 75,  desc: 'Generate a set of AI flashcards',                    category: 'special', hint: 'Go to AI Advisor → Flashcards' },
  { id: 'ten_sessions',   name: 'Committed',     icon: '📖', xp: 150, desc: 'Complete 10 revision sessions',                      category: 'milestone', hint: 'Complete 10 sessions from your calendar' },
]

// Map for O(1) lookup by id
export const BADGE_MAP = Object.fromEntries(BADGE_LIST.map(b => [b.id, b]))

export const BADGE_CATEGORIES = [
  { id: 'milestone',   label: 'Milestones' },
  { id: 'streak',      label: 'Streaks' },
  { id: 'mastery',     label: 'Subject Mastery' },
  { id: 'improvement', label: 'Improvement' },
  { id: 'consistency', label: 'Consistency' },
  { id: 'social',      label: 'Social' },
  { id: 'special',     label: 'Special' },
]

// ── XP multipliers ────────────────────────────────────────────────────────────
export const XP_MULTIPLIERS = {
  streak_7:  1.25,
  streak_14: 1.5,
  streak_30: 2.0,
  exam_week: 1.5,
  weekend:   1.1,
}

export function calculateXPWithMultipliers(baseXP, profile) {
  let multiplier = 1
  const streak = profile?.streak || 0
  if (streak >= 30)      multiplier *= XP_MULTIPLIERS.streak_30
  else if (streak >= 14) multiplier *= XP_MULTIPLIERS.streak_14
  else if (streak >= 7)  multiplier *= XP_MULTIPLIERS.streak_7

  if ([0, 6].includes(new Date().getDay())) multiplier *= XP_MULTIPLIERS.weekend

  const nextExam = (profile?.examDates || [])
    .filter(e => new Date(e.examDate) > new Date())
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))[0]
  if (nextExam && (new Date(nextExam.examDate) - new Date()) / 86400000 <= 7)
    multiplier *= XP_MULTIPLIERS.exam_week

  return Math.round(baseXP * multiplier)
}

// ── Daily quests ─────────────────────────────────────────────────────────────
export const DAILY_QUEST_POOL = [
  { id: 'log_session',     desc: 'Log a revision session',          xp: 30, icon: '📖' },
  { id: 'rate_topics',     desc: 'Rate a topic confidence',         xp: 20, icon: '⭐' },
  { id: 'log_paper',       desc: 'Log a past paper result',         xp: 40, icon: '📄' },
  { id: 'use_ai',          desc: 'Ask the AI Advisor a question',   xp: 15, icon: '🤖' },
  { id: 'timer_25',        desc: 'Complete a 25-minute timer',      xp: 25, icon: '⏱️' },
  { id: 'resolve_mistake', desc: 'Resolve a logged mistake',        xp: 20, icon: '✅' },
  { id: 'add_note',        desc: 'Write a revision note',           xp: 15, icon: '📝' },
  { id: 'add_friend',      desc: 'Add a friend',                    xp: 20, icon: '🤝' },
]

export function getDailyQuests(uid) {
  const today = new Date().toDateString()
  const seed  = simpleHash(uid + today)
  const shuffled = [...DAILY_QUEST_POOL].sort((a, b) => simpleHash(seed + a.id) - simpleHash(seed + b.id))
  return shuffled.slice(0, 3)
}

function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export const WEEKLY_CHALLENGES = [
  { id: 'week_streak',    desc: 'Revise every day this week',           xp: 300, icon: '🔥' },
  { id: 'week_papers_3',  desc: 'Log 3 past papers this week',          xp: 200, icon: '📄' },
  { id: 'week_topics_15', desc: 'Rate 15 topic confidences this week',  xp: 150, icon: '⭐' },
  { id: 'week_ai_5',      desc: 'Use the AI Advisor 5 times this week', xp: 100, icon: '🤖' },
]
