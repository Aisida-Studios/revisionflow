// src/pages/Help.jsx
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { chatWithAI } from '../utils/ai'
import {
  HelpCircle, Send, BookOpen, Calendar, FileText, Brain,
  MessageSquare, Timer, BarChart2, Users, Trophy, Settings,
  Zap, ChevronDown, ChevronUp, Layers, ClipboardList, Gift,
  Star, Globe, Lock, Shield, Bell, Palette, Link2
} from 'lucide-react'

const APP_ARCHITECTURE = `RevisionFlow is a free UK GCSE, AS-Level and A-Level revision web app. AS-Level is a standalone qualification, kept completely separate from A-Level throughout the app (own topics, exam dates, past papers, grade scale) — not treated as "year one of A-Level". Here is the complete up-to-date feature set:

PAGES & FEATURES:
- Dashboard: Today's sessions, next exam countdown, streak, XP level bar (infinite levels, 1.15x XP formula), daily AI briefing, daily quests, badge showcase, recent papers carousel, referral code entry. New users see a personalised welcome card with their subjects listed and suggested first steps.
- Calendar: Monthly/weekly view, AI-powered 7-step schedule generator, ICS import/export. Tasks appear as coloured multi-day blocks spanning their full duration.
- Exam Dates: Add upcoming exams with subject, board, paper, date. Emergency Mode triggers when exam is within 7 days.
- Past Papers: Log paper attempts (score, grade, year, tier). Auto-fills grade boundaries (AQA/Edexcel/OCR, 2019–2025, 2026 estimated). Grade trajectory charts. Mistakes tab — log, view and manage mistakes from papers.
- Topics: Confidence ratings (1-5) per spec topic. Views: List, Heatmap, Priority (star + drag-reorder), Resources, Notes (per-subject revision notes), Mastery (cross-topic progress summary). All 6 boards, GCSE, AS-Level and A-Level, each kept fully separate. Each topic has a Resources button showing verified links + site-search fallbacks for Corbett Maths, Save My Exams, BBC Bitesize etc.
- Study Tools (/study): Three tabs:
  * Flashcards — AI generator (50 cards), saved sets (private/public), create custom sets, flip-card UI, confidence rating, Quizlet copy, CSV download, public sets library with search/filter
  * Quiz — Multiple choice, written, or mixed mode. Timed challenge mode (countdown bar per question). Quiz history with scores and time taken. Public quiz sets. Filter by subject.
  * Exam Questions — Realistic board-accurate questions (AQA/Edexcel/OCR/WJEC/Eduqas/CCEA). Correct command words per board per mark value. Mark scheme hidden until revealed. Examiner tips. Copy all button.
- AI Advisor / Answer Marker: Submit a question + your answer, choose subject/board/level/marks. AI marks it like a real examiner: awarded marks, credited points, not-credited points, AO breakdown, how to improve, examiner annotation. Recent marking history panel.
- Timer: Countdown with MM:SS input, Stopwatch with laps, 5 ambient sounds (Web Audio API), looping alert on finish, XP awarded on completion (1 XP/min, max 100).
- Analytics: Study time charts, subject distribution, grade trajectory, consistency heatmap.
- Friends: Add friends by username, accept/decline requests, friends leaderboard.
- Leaderboard: Global XP leaderboard with opt-out, profile icons shown.
- Profile: 30 badges (7 categories), public profile URL (/u/username), profile icon selector, badge audit button. Public profiles are viewable without login.
- Settings: Subjects/boards/tiers (with per-subject qualification — you can mix AS-Level and A-Level subjects on the same account), themes (10 colour themes, Pro/beta users unlock all), profile icon, privacy, notifications, grade boundaries viewer, qualification switcher (GCSE/AS-Level/A-Level/BTEC).
- Help: AI assistant + FAQ (this page).
- Emergency Mode: AI generates a last-minute revision plan when an exam is within 7 days.

GAMIFICATION:
- XP awarded automatically: session complete (+50/+75), task done (+20), note saved (+10), mistake logged (+10), mistake resolved (+20), paper logged (+100), friend added (+25 each), daily login (+10)
- Infinite levels using formula: XP needed = floor(100 × 1.15^(level-1))
- 30 badges across 7 categories: milestone, streak, mastery, improvement, consistency, social, special
- Badge audit: runs automatically on login, also triggerable manually from Profile page
- Daily quests: 3 quests per day, reset at midnight, +50 XP bonus for completing all 3
- XP popup toasts appear whenever XP is awarded
- Streaks: broken if you miss a day of actual activity (not just login)

REFERRALS:
- Each user has a unique referral code (first 8 chars of their UID), found in Profile
- Referral link: revision-flow.netlify.app/signup?ref=CODE
- When signing up with a code, the referrer's name is shown in real-time before you submit
- Both referrer and new user receive XP and unlock the Rocket profile icon
- Existing users can enter a referral code from the Dashboard

PUBLIC PROFILES:
- Every user gets a public profile at /u/username (or /u/uid if no username set)
- Viewable by anyone without logging in — shows name, level, XP, streak, badges, subjects
- Shareable link in Profile page
- Private by default if settings.profilePublic is set to false

FLASHCARDS & QUIZ:
- AI generates up to 50 flashcards per topic
- Quiz modes: multiple choice (AI generates wrong answers), written (AI-marked), mixed
- Timed challenge mode: configurable seconds per question, auto-advances on timeout
- Quiz history saved per user, viewable from Quiz tab
- Admin can bulk-generate public flashcard sets for all topics in a subject

EXAM QUESTIONS & MARKING:
- Board-specific: AQA, Edexcel, OCR, WJEC, Eduqas, CCEA at GCSE, AS-Level and A-Level
- Correct command words per board per mark value (e.g. AQA 6-mark = Evaluate/Discuss)
- Mark scheme formats: point-mark for lower marks, level-based for higher marks
- Maths questions use plain-text notation (no LaTeX)
- Answer Marker gives: score, grade estimate, credited/not-credited points, AO breakdown, how to improve, examiner note
- Recent marking history stored locally in session

RESOURCES (Topics page):
- Every topic has a Resources button
- 3-tier system: verified direct links (hand-checked) > subject hub pages > Google site-search for exact topic
- Admin can import additional verified links via Admin → Resources tab
- Cognito, Corbett Maths, Save My Exams, BBC Bitesize, PMT all covered

THEMES & CUSTOMISATION:
- 10 colour themes available in Settings → Appearance (all unlocked for beta/Pro users)
- 12 profile icons (emoji-based)
- Dark/light mode toggle in sidebar

AI CONFIG:
- Model: mistral-small-latest
- All features use full student context (subjects, topics, papers, mistakes, priorities, streaks)
- Daily briefing cached per day to Firestore

DATA STORAGE (Firebase Firestore):
- users/{uid}: main profile, XP, streak, badges, referral code, display name, username
- users/{uid}/sessions: revision sessions
- users/{uid}/paperAttempts: past paper results
- users/{uid}/topics: confidence ratings per topic
- users/{uid}/mistakes: mistake log
- users/{uid}/notes: revision notes
- users/{uid}/tasks: tasks
- users/{uid}/quests/{date}: daily quest progress
- users/{uid}/flashcardSets: saved flashcard sets
- users/{uid}/quizHistory: quiz results
- publicFlashcards: public flashcard sets
- topicNotes: AI-generated revision guide cache
- topicResourceLinks: admin-curated verified resource links`

const QUICK_QUESTIONS = [
  'How do I generate a revision schedule?',
  'How does the XP and level system work?',
  'How do I use flashcards and save a set?',
  'How do I use the quiz mode?',
  'How do I get my answer marked by AI?',
  'How do I log a past paper?',
  'How do I earn badges?',
  'What are daily quests?',
  'How does the referral system work?',
  'How do I view my public profile?',
  'How do I use Emergency Mode?',
  'How do I switch from GCSE to A-Level or AS-Level?',
  'How do I find resources for a topic?',
  'How do exam questions work?',
]

const FAQ = [
  {
    q: 'How do I get started?',
    a: 'Complete the onboarding flow after signup — add your subjects, exam boards, and target grades. You\'ll see a personalised welcome card on your Dashboard with suggested first steps. Then go to Calendar → Generate Schedule to create your first AI revision timetable, and add your exam dates so the app can count down and trigger Emergency Mode.'
  },
  {
    q: 'How does the level and XP system work?',
    a: 'You earn XP automatically for every action: completing sessions (+50), logging papers (+100), resolving mistakes (+20), saving notes (+10), completing tasks (+20), adding friends (+25), and daily logins (+10). Levels use an exponential formula so each level requires slightly more XP than the last. There are infinite levels — no cap. A floating XP popup appears every time you earn XP.'
  },
  {
    q: 'How do I use the flashcard system?',
    a: 'Go to Study Tools → Flashcards. Generate AI flashcards by picking a subject and topic (up to 50 cards), or create your own set manually. During a session, tap a card to flip it, then rate your confidence. Save sets to your account and optionally make them public for other students. You can also browse public sets from other users.'
  },
  {
    q: 'How does quiz mode work?',
    a: 'Go to Study Tools → Quiz. Pick a saved flashcard set, choose multiple choice, written, or mixed mode, set how many questions, and optionally turn on timed challenge mode (a countdown bar per question). Your results are saved to quiz history automatically. You can also browse public quiz sets.'
  },
  {
    q: 'How do I get my answer marked by AI?',
    a: 'Go to Study Tools → Answer Marker (or AI Advisor). Select your subject, exam board, level, and how many marks the question is worth. Paste the question and your answer, then hit Mark. The AI marks it like a real examiner — you get awarded marks, an estimated grade, what was credited and what was missed, AO breakdown, and specific tips to reach the next mark band. Your recent marks are saved in the session history panel on the left.'
  },
  {
    q: 'How do exam questions work?',
    a: 'Go to Study Tools → Exam Questions. Pick your subject, board, level, topic, number of questions, and total marks. The AI generates board-accurate questions using the correct command words and mark allocations for your board (e.g. AQA uses Evaluate for 6-mark questions). The mark scheme is hidden by default — click "Reveal mark scheme" to see it after you\'ve attempted the question.'
  },
  {
    q: 'How do I find resources for a topic?',
    a: 'In Topics, select your subject and find any topic in the list. Click the "Resources" button next to it. You\'ll see verified direct links (hand-checked), a subject hub link (always works), and site-search links for Save My Exams, PMT, and BBC Bitesize that search for your exact topic name.'
  },
  {
    q: 'How do I import flashcards to Quizlet?',
    a: 'After generating or studying a set, click "Quizlet import" — this copies all cards in tab-separated format (term[tab]definition). Then go to quizlet.com → Create → Import from Word/Google Docs → paste → set "Between term and definition" to Tab → Import. Done.'
  },
  {
    q: 'What are daily quests?',
    a: 'Each day you get 3 quests (e.g. log a past paper, write a note, resolve a mistake). Complete them to earn XP — completing all 3 gives an extra +50 XP bonus. Quests reset at midnight and progress is tracked automatically when you complete actions anywhere in the app.'
  },
  {
    q: 'How do I earn badges?',
    a: 'Badges are awarded automatically when you hit certain milestones — streaks, session counts, paper scores, friends added, etc. If you had activity before badges were introduced, go to Profile and click "Check for missing badges" to run a retroactive audit. New badges are also checked on every login.'
  },
  {
    q: 'How does the referral system work?',
    a: 'Your referral code is shown in Profile. Share your link (revision-flow.netlify.app/signup?ref=YOURCODE) with a friend. When they type your code into the signup form, your name appears in real-time confirming the code works. When they complete signup, you both get XP and unlock the Rocket profile icon. Existing users can enter a referral code from the Dashboard.'
  },
  {
    q: 'How do public profiles work?',
    a: 'Every user gets a public profile at /u/username (or /u/uid if no username is set). It shows your display name, level, XP, streak, badges, and subjects — no email or revision data. Public profiles are viewable without logging in, so you can share your link with anyone. Set a username in Settings to get a nicer URL like /u/femi instead of /u/abc12345.'
  },
  {
    q: 'What is Emergency Mode?',
    a: 'If you have an exam within the next 7 days, a red banner appears on your Dashboard. Click "Open Emergency Mode" and the AI generates a focused last-minute revision plan just for that exam — key topics, time allocation, and exam technique tips.'
  },
  {
    q: 'How do I track past papers and mistakes?',
    a: 'Go to Past Papers → Log Paper. Enter your score, grade, year, and paper number — grade boundaries are auto-filled. The app tracks your grade trajectory over time. Mistakes are in Past Papers → Mistakes tab: log specific errors, mark them as resolved when you understand them.'
  },
  {
    q: 'How do I use topic confidence ratings?',
    a: 'Go to Topics, select your subject, and rate each topic 1–5 (1=struggling, 5=strong). The AI uses these to personalise all advice. The Mastery tab shows your overall progress. Click Resources on any topic to find revision materials for that specific topic.'
  },
  {
    q: 'Can I use RevisionFlow for A-Levels or AS-Levels?',
    a: 'Yes. Go to Settings → Qualification and switch to AS-Level or A-Level. The app supports GCSE (9–1), AS-Level (A–E) and A-Level (A*–E) with correct grade scales and spec topics for all 6 boards — AS-Level is kept completely separate from A-Level (its own topics, exam dates and past papers), not treated as the first year of A-Level. You can even mix them: when switching, you can set each subject to AS-Level or A-Level individually, so e.g. A-Level Maths alongside AS-Level Further Maths works correctly. Topic lists, exam questions, and flashcards all adjust automatically.'
  },
  {
    q: 'Is my data private?',
    a: 'Yes. All data is stored in Firebase with security rules — only you can read your own revision data. Public profiles show only name/level/badges/subjects — no revision scores or email. You can delete your account from Settings. We never sell data or show ads. See /privacy for full details.'
  },
  {
    q: 'How do I export my revision calendar?',
    a: 'In Calendar, click the export button to download an .ics file. Import this into Google Calendar, Apple Calendar, or Outlook — all sessions and events will appear in your calendar app.'
  },
]

const FEATURES = [
  { icon: BookOpen,      title: 'Dashboard',        desc: 'XP, streak, next exam countdown, daily quests, AI briefing, welcome card for new users', colour: 'var(--accent)' },
  { icon: Calendar,      title: 'Calendar',          desc: 'AI schedule generator, multi-day task blocks, ICS import/export', colour: '#3b82f6' },
  { icon: FileText,      title: 'Past Papers',       desc: 'Grade tracking, boundaries (2019–2025, 2026 estimated), mistakes log', colour: '#f59e0b' },
  { icon: Brain,         title: 'Topics',            desc: 'Confidence ratings, heatmap, priority, notes, mastery tab, per-topic resource links', colour: '#8b5cf6' },
  { icon: Layers,        title: 'Flashcards',        desc: 'AI generator (50 cards), custom sets, public library, quiz mode, timed challenge', colour: '#a855f7' },
  { icon: ClipboardList, title: 'Exam Questions',    desc: 'Board-accurate questions (all 6 boards), real command words, hidden mark schemes, examiner tips', colour: '#7c3aed' },
  { icon: Star,          title: 'Answer Marker',     desc: 'AI marks like a real examiner — score, AO breakdown, credited/not-credited, how to improve', colour: '#ec4899' },
  { icon: MessageSquare, title: 'AI Advisor',        desc: 'Chat, grade predictor, next steps, resource recommendations', colour: '#06b6d4' },
  { icon: Timer,         title: 'Timer',             desc: 'Countdown/stopwatch, ambient sounds, XP per minute', colour: '#f97316' },
  { icon: BarChart2,     title: 'Analytics',         desc: 'Study charts, subject distribution, grade trajectory, heatmap', colour: '#22c55e' },
  { icon: Users,         title: 'Friends',           desc: 'Add friends, friends leaderboard, referral system with name preview', colour: '#f97316' },
  { icon: Trophy,        title: 'Gamification',      desc: 'Infinite levels, 30 badges, daily quests, XP popups, activity-based streaks', colour: '#eab308' },
  { icon: Link2,         title: 'Resources',         desc: 'Per-topic verified links + site-search fallbacks (Corbett, Save My Exams, BBC Bitesize, PMT)', colour: '#10b981' },
  { icon: Globe,         title: 'Public Profiles',   desc: 'Shareable profile URL viewable without login — shows level, badges, subjects', colour: '#6366f1' },
  { icon: Palette,       title: 'Customisation',     desc: '10 colour themes (all unlocked for beta users), 12 profile icons, dark/light mode', colour: '#e879f9' },
  { icon: Shield,        title: 'Privacy & Safety',  desc: 'GDPR compliant, Firebase security rules, account deletion', colour: '#64748b' },
]

export default function Help() {
  const { profile } = useAuth()
  const [question, setQuestion] = useState('')
  const [answer,   setAnswer]   = useState('')
  const [loading,  setLoading]  = useState(false)
  const [openFaq,  setOpenFaq]  = useState(null)
  const [openCat,  setOpenCat]  = useState('getting-started')

  async function ask(q) {
    const query = q || question.trim()
    if (!query) return
    setLoading(true)
    setAnswer('')
    setQuestion('')

    const prompt = `You are the help assistant for RevisionFlow, a UK revision web app. Answer concisely and helpfully.

APP ARCHITECTURE:
${APP_ARCHITECTURE}

USER: ${profile?.displayName || 'Student'} (${profile?.qualification || 'GCSE'}, ${(profile?.subjects || []).length} subjects)

QUESTION: ${query}

Give a clear, friendly answer specific to RevisionFlow. Be concise (2-4 sentences). Mention which page or feature to use.`

    try {
      const res = await chatWithAI([{ role: 'user', content: prompt }], '')
      setAnswer(typeof res === 'string' ? res : res?.text || "Sorry, I couldn't find an answer.")
    } catch {
      setAnswer('Sorry, something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const faqCategories = [
    { id: 'getting-started', label: 'Getting Started',  questions: FAQ.filter((_, i) => [0, 15, 16].includes(i)) },
    { id: 'xp-badges',       label: 'XP & Badges',      questions: FAQ.filter((_, i) => [1, 9].includes(i)) },
    { id: 'study-tools',     label: 'Study Tools',       questions: FAQ.filter((_, i) => [2, 3, 4, 5, 6, 7].includes(i)) },
    { id: 'features',        label: 'Features',          questions: FAQ.filter((_, i) => [8, 10, 11, 12, 13, 14, 17].includes(i)) },
    { id: 'privacy',         label: 'Privacy & Data',    questions: FAQ.filter((_, i) => [16].includes(i)) },
  ]

  return (
    <div className="fade-in" style={{ maxWidth: 780, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <HelpCircle size={22} color="var(--accent-light)" /> Help Centre
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Everything you need to know about RevisionFlow · Last updated July 2026
        </p>
      </div>

      {/* AI assistant */}
      <div className="card accent-card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Zap size={16} color="var(--accent-light)" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Ask AI anything about RevisionFlow</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && ask()}
            placeholder="e.g. How does timed quiz mode work?"
          />
          <button className="btn btn-primary" onClick={() => ask()} disabled={loading || !question.trim()} style={{ flexShrink: 0 }}>
            {loading ? '…' : <><Send size={14} /> Ask</>}
          </button>
        </div>
        {(loading || answer) && (
          <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(124,58,237,0.08)', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', lineHeight: 1.7 }}>
            <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--accent-light)', fontSize: '0.78rem' }}>✨ RevisionFlow Assistant</div>
            {loading
              ? <span style={{ color: 'var(--text-muted)' }}>Finding answer…</span>
              : <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{answer}</p>
            }
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
          {QUICK_QUESTIONS.map(q => (
            <button key={q} onClick={() => ask(q)} className="btn btn-secondary btn-sm" style={{ borderRadius: 20, fontSize: '0.76rem', padding: '4px 12px' }}>
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* What's new banner */}
      <div style={{ marginBottom: 24, padding: '14px 18px', background: 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(168,85,247,0.05))', borderRadius: 12, border: '1px solid rgba(124,58,237,0.25)' }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--accent-light)', marginBottom: 8 }}>🆕 Recently added</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
          <span>✦ <strong>Quiz mode</strong> — Timed challenge, multiple choice, written, history tracking, public quiz sets</span>
          <span>✦ <strong>Exam Questions revamp</strong> — Real board-accurate questions with correct command words, hidden mark schemes, examiner tips for all 6 boards</span>
          <span>✦ <strong>Answer Marker revamp</strong> — Full examiner-style marking with AO breakdown, credited/not-credited points, mark band improvement tips</span>
          <span>✦ <strong>Per-topic resources</strong> — Resources button on every topic with verified links + site-search fallbacks</span>
          <span>✦ <strong>Public profiles</strong> — Viewable without login at /u/username</span>
          <span>✦ <strong>Referral preview</strong> — See the referrer's name in real-time when entering a code on signup</span>
          <span>✦ <strong>Personalised welcome</strong> — New users see a welcome card and personalised tour on first login</span>
          <span>✦ <strong>Admin: bulk flashcards</strong> — Generate 50-card public sets for every topic in a subject</span>
          <span>✦ <strong>All themes unlocked</strong> for beta users</span>
          <span>✦ <strong>A-Level topic fix</strong> — Switching to A-Level now correctly loads A-Level spec topics</span>
          <span>✦ <strong>AS-Level launch</strong> — AS-Level is now a fully separate qualification from A-Level everywhere: onboarding, topics, exam dates, past papers and settings, with its own 2026 exam dates for AQA, Edexcel, OCR and Eduqas. Mix AS-Level and A-Level subjects on one account.</span>
          <span>✦ <strong>Board/level separation fix</strong> — Fixed several places where the same subject at a different exam board or qualification (e.g. AQA A-Level Physics vs AQA GCSE Physics) could show the wrong topics, exam dates or grade boundaries. They're now always kept fully separate.</span>
        </div>
      </div>

      {/* FAQ — categorised */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ marginBottom: 14, fontSize: '1rem' }}>Frequently Asked Questions</h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {faqCategories.map(cat => (
            <button
              key={cat.id}
              className={`btn btn-sm ${openCat === cat.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setOpenCat(openCat === cat.id ? null : cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {faqCategories.filter(cat => cat.id === openCat).map(cat => (
          <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cat.questions.map((item, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === `${cat.id}-${i}` ? null : `${cat.id}-${i}`)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.88rem', textAlign: 'left', gap: 10 }}
                >
                  {item.q}
                  {openFaq === `${cat.id}-${i}` ? <ChevronUp size={16} style={{ flexShrink: 0 }} /> : <ChevronDown size={16} style={{ flexShrink: 0 }} />}
                </button>
                {openFaq === `${cat.id}-${i}` && (
                  <div style={{ padding: '0 18px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Feature overview grid */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Feature Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {FEATURES.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} className="card" style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${f.colour}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={f.colour} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{f.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* XP quick reference */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h4 style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
          <Zap size={16} color="var(--accent-light)" /> XP Quick Reference
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
          {[
            { action: 'Complete a session',     xp: '+50 (or +75 for 60+ min)' },
            { action: 'Log a past paper',        xp: '+100' },
            { action: 'Complete a task',         xp: '+20' },
            { action: 'Save a note',             xp: '+10' },
            { action: 'Log a mistake',           xp: '+10' },
            { action: 'Resolve a mistake',       xp: '+20' },
            { action: 'Add a friend',            xp: '+25 each' },
            { action: 'Daily login',             xp: '+10' },
            { action: 'Timer session',           xp: '+1/min (max 100)' },
            { action: 'Complete a quest',        xp: '+15 to +40' },
            { action: 'All 3 quests done',       xp: '+50 bonus' },
            { action: 'Earn a badge',            xp: '+50 to +600' },
            { action: 'Referral accepted',       xp: '+100–200' },
          ].map(r => (
            <div key={r.action} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.action}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-light)', flexShrink: 0, marginLeft: 8 }}>{r.xp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
        <h4 style={{ marginBottom: 6 }}>Still need help?</h4>
        <p style={{ fontSize: '0.85rem', marginBottom: 4 }}>
          Contact us at <strong style={{ color: 'var(--accent-light)' }}>femiaisida1@gmail.com</strong>
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>We usually respond within 24 hours</p>
      </div>
    </div>
  )
}
