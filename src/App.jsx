// src/App.jsx
import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { BadgeProvider } from './context/BadgeContext'
import { usePushNotifications } from './hooks/usePushNotifications'
import { AppProvider } from './context/AppContext'
import { TimerProvider } from './context/TimerContext'
import { PriorityProvider } from './context/PriorityContext'
import Layout from './components/Layout'
import LoadingScreen from './components/LoadingScreen'
import { Toaster } from 'react-hot-toast'
import XPToast from './components/XPToast'
import StreakCelebration from './components/StreakCelebration'
import TooltipTour from './components/TooltipTour'
import ReferralRewardPopup from './components/ReferralRewardPopup'
import FriendRequestPopup from './components/FriendRequestPopup'
import LevelUpPopup from './components/LevelUpPopup'
import OnboardingRecapPopup from './components/OnboardingRecapPopup'

// Global streak celebration — reads from AuthContext, renders anywhere in app
function GlobalStreakCelebration() {
  const { streakCelebration, clearStreakCelebration } = useAuth()
  if (!streakCelebration) return null
  return <StreakCelebration streak={streakCelebration.streak} onClose={clearStreakCelebration} />
}

// Global onboarding tour. Previously mounted only inside Dashboard.jsx, which meant it could
// never navigate away from the dashboard without unmounting itself (Dashboard.jsx is the tour's
// parent — leaving the route it's rendered on removes it from the tree). Moved here, alongside
// XPToast/GlobalStreakCelebration, specifically so it survives route changes and can actually
// show the Calendar/Topics/AI Advisor/Timer pages it talks about (see TooltipTour.jsx).
// Must render INSIDE <BrowserRouter> (for useNavigate/useLocation to work) but OUTSIDE <Routes>
// (so no individual <Route> unmounting takes it down when the tour navigates between pages).
function GlobalTooltipTour() {
  const { user, profile } = useAuth()
  const showTour = !!profile
    && profile.onboardingComplete
    && !profile.tourComplete
    && !localStorage.getItem('tour_complete')
  if (!showTour) return null
  return (
    <TooltipTour profile={profile} onComplete={async () => {
      localStorage.setItem('tour_complete', '1')
      if (user) {
        try {
          const { updateDoc, doc } = await import('firebase/firestore')
          const { db } = await import('./firebase')
          await updateDoc(doc(db, 'users', user.uid), { tourComplete: true })
        } catch (e) {}
      }
    }} />
  )
}

// Global referral reward popup — covers BOTH sides of a referral. The referred user gets an
// immediate, locally-triggered version at the point they enter a code (see Dashboard.jsx); the
// referrer usually isn't looking at the app at that exact moment, so their side is detected via
// AuthContext's profile listener (badges array gaining 'referral' since the last snapshot) and
// shown next time they're active, wherever that is in the app.
function GlobalReferralReward() {
  const { referralReward, clearReferralReward } = useAuth()
  if (!referralReward) return null
  return <ReferralRewardPopup variant={referralReward.variant} onClose={clearReferralReward} />
}

// Global "new friend request" popup. Checked Friends.jsx first — it only shows a passive badge
// count on the Requests tab, nothing fires when a request actually arrives, so this is new.
function GlobalFriendRequest() {
  const { newFriendRequest, clearNewFriendRequest } = useAuth()
  if (!newFriendRequest) return null
  return <FriendRequestPopup request={newFriendRequest} onClose={clearNewFriendRequest} />
}

// Global level-up popup. Detection lives in AuthContext (profile.level actually gets written by
// awardXP now — previously nothing did, which is why Profile.jsx always showed "Level 1").
function GlobalLevelUp() {
  const { levelUp, clearLevelUp } = useAuth()
  if (!levelUp) return null
  return <LevelUpPopup level={levelUp.level} title={levelUp.title} onClose={clearLevelUp} />
}

// Global post-onboarding XP recap. Deliberately decoupled from Onboarding.jsx itself — see
// AuthContext.jsx for why (shown once the tour completes, not the moment onboarding saves).
function GlobalOnboardingRecap() {
  const { profile, onboardingRecap, clearOnboardingRecap } = useAuth()
  if (!onboardingRecap) return null
  return <OnboardingRecapPopup breakdown={onboardingRecap} displayName={profile?.displayName} onClose={clearOnboardingRecap} />
}


// ── Lazy pages ────────────────────────────────────────────────────────────────
const Landing       = lazy(() => import('./pages/Landing'))
const Login         = lazy(() => import('./pages/Login'))
const Signup        = lazy(() => import('./pages/Signup'))
const Onboarding    = lazy(() => import('./pages/Onboarding'))
const Dashboard     = lazy(() => import('./pages/Dashboard'))
const Topics        = lazy(() => import('./pages/Topics'))
const Calendar      = lazy(() => import('./pages/Calendar'))
const Timer         = lazy(() => import('./pages/Timer'))
const Tasks         = lazy(() => import('./pages/Tasks'))
const Mistakes      = lazy(() => import('./pages/Mistakes'))
const PastPapers    = lazy(() => import('./pages/PastPapers'))
const Analytics     = lazy(() => import('./pages/Analytics'))
const ExamDates     = lazy(() => import('./pages/ExamDates'))
const AIAdvisor     = lazy(() => import('./pages/AIAdvisor'))
const Friends       = lazy(() => import('./pages/Friends'))
const Leaderboard   = lazy(() => import('./pages/Leaderboard'))
const Profile       = lazy(() => import('./pages/Profile'))
const PublicProfile = lazy(() => import('./pages/PublicProfile'))
const Settings      = lazy(() => import('./pages/Settings'))
const EmergencyMode = lazy(() => import('./pages/EmergencyMode'))
const Admin         = lazy(() => import('./pages/Admin'))
const Help          = lazy(() => import('./pages/Help'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const Study        = lazy(() => import('./pages/Study'))
const Tutor        = lazy(() => import('./pages/Tutor'))
const Pro          = lazy(() => import('./pages/Pro'))

// ── Guards ────────────────────────────────────────────────────────────────────
// Redirects to /login if not authenticated.
// Redirects to /onboarding if authenticated but onboarding not complete.
function PrivateRoute({ children }) {
  usePushNotifications()
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  // Profile loaded and onboarding not done → send to onboarding
  if (profile && !profile.onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }
  return children
}

// For the onboarding route itself — must be logged in but onboarding not complete
// (prevents going back to onboarding after finishing it)
function OnboardingRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (profile?.onboardingComplete) return <Navigate to="/dashboard" replace />
  return children
}

function PublicOnly({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return children
  // Logged in but onboarding not done — go to onboarding
  if (profile && !profile.onboardingComplete) return <Navigate to="/onboarding" replace />
  return <Navigate to="/dashboard" replace />
}

function PageLoader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--bg-base)' }}>
      <div className="spinner" />
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BadgeProvider>
        <AppProvider>
          <TimerProvider>
            <PriorityProvider>
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public — no sidebar */}
                    <Route path="/"            element={<Landing />} />
                    <Route path="/privacy"     element={<PrivacyPolicy />} />
                    <Route path="/pro"         element={<Pro />} />
                    <Route path="/pro/success"  element={<Pro />} />
                    <Route path="/u/:username" element={<PublicProfile />} />

                    {/* Auth — no sidebar */}
                    <Route path="/login"  element={<PublicOnly><Login /></PublicOnly>} />
                    <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />

                    {/* Onboarding — no sidebar, requires auth but not onboardingComplete */}
                    <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />

                    {/* Protected — all wrapped in Layout */}
                    <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                      <Route path="/dashboard"   element={<Dashboard />} />
                      <Route path="/calendar"    element={<Calendar />} />
                      <Route path="/exams"       element={<ExamDates />} />
                      <Route path="/papers"      element={<PastPapers />} />
                      <Route path="/topics"      element={<Topics />} />
                      <Route path="/study"       element={<Study />} />
                      <Route path="/tutor"       element={<Tutor />} />
                      <Route path="/mistakes"    element={<Mistakes />} />
                      <Route path="/tasks"       element={<Tasks />} />
                      <Route path="/timer"       element={<Timer />} />
                      <Route path="/analytics"   element={<Analytics />} />
                      <Route path="/ai"          element={<AIAdvisor />} />
                      <Route path="/friends"     element={<Friends />} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                      <Route path="/profile"     element={<Profile />} />
                      <Route path="/settings"    element={<Settings />} />
                      <Route path="/emergency"   element={<EmergencyMode />} />
                      <Route path="/admin"       element={<Admin />} />
                      <Route path="/help"        element={<Help />} />
                    </Route>

                    {/* Legacy URL redirects */}
                    <Route path="/notes"    element={<Navigate to="/topics" replace />} />
                    <Route path="/mastery"  element={<Navigate to="/topics" replace />} />
                    <Route path="/past-papers"   element={<Navigate to="/papers" replace />} />
                    <Route path="/exam-dates"    element={<Navigate to="/exams" replace />} />
                    <Route path="/topic-mastery" element={<Navigate to="/mastery" replace />} />
                    <Route path="/ai-advisor"    element={<Navigate to="/ai" replace />} />

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Suspense>
                <GlobalTooltipTour />
                <GlobalReferralReward />
                <GlobalFriendRequest />
                <GlobalLevelUp />
                <GlobalOnboardingRecap />
              </BrowserRouter>
            <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' } }} />
            <XPToast />
            <GlobalStreakCelebration />
            </PriorityProvider>
          </TimerProvider>
        </AppProvider>
        </BadgeProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
