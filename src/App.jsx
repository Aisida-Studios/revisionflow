// src/App.jsx
// First, so Chrome's one-off beforeinstallprompt event is captured before anything else runs (see utils/pwaInstall.js).
import './utils/pwaInstall'
import { Suspense, lazy, useEffect, useState } from 'react'
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
import { usePageMeta } from './utils/pageMeta'
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

// Global referral reward popup — covers BOTH sides of a referral, and both are detected by
// AuthContext's profile listener. The referrer usually isn't looking at the app at that exact moment,
// so their side (badges array gaining 'referral' since the last snapshot) is shown next time they're
// active, wherever that is. The referred user's side (referredBy stamped on the new account) shows up
// wherever they are right after signing up, because the Signup page unmounts too early to show it.
// An existing user who enters a code later gets an immediate, local version (see Dashboard.jsx).
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
const NotFound      = lazy(() => import('./pages/NotFound'))
const Login         = lazy(() => import('./pages/Login'))
const Signup        = lazy(() => import('./pages/Signup'))
const Onboarding    = lazy(() => import('./pages/Onboarding'))
const Dashboard     = lazy(() => import('./pages/Dashboard'))
const Topics        = lazy(() => import('./pages/Topics'))
const TopicDetail   = lazy(() => import('./pages/TopicDetail'))
const Calendar      = lazy(() => import('./pages/Calendar'))
const Timer         = lazy(() => import('./pages/Timer'))
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

// How long someone who is already signed in waits on the sign-in pages for their profile before being sent on anyway.
const PROFILE_WAIT_MS = 8000

function PublicOnly({ children }) {
  const { user, profile, loading } = useAuth()
  const waitingForProfile = !loading && !!user && !profile
  const [gaveUp, setGaveUp] = useState(false)
  useEffect(() => {
    if (!waitingForProfile) { setGaveUp(false); return undefined }
    const timer = setTimeout(() => setGaveUp(true), PROFILE_WAIT_MS)
    return () => clearTimeout(timer)
  }, [waitingForProfile])
  if (loading) return <LoadingScreen />
  if (!user) return children
  // Wait for the profile, so a new account goes straight to the right page instead of flashing the dashboard first.
  // If it never arrives (the read failed, or the profile document does not exist) carry on to the app as before
  // rather than sit on a loading screen forever.
  if (!profile) return gaveUp ? <Navigate to="/dashboard" replace /> : <LoadingScreen />
  // Logged in but onboarding not done — go to onboarding
  if (!profile.onboardingComplete) return <Navigate to="/onboarding" replace />
  return <Navigate to="/dashboard" replace />
}

// index.html no longer carries one canonical URL for every route (that pointed every page at the home page). These
// public pages get their own here, because their own files do not set it: the privacy policy is frozen and the Pro
// page's copy edit is still to come. Login and Signup set theirs with usePageMeta.
function WithCanonical({ path, children }) {
  usePageMeta({ path })
  return children
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
                    <Route path="/"            element={<WithCanonical path="/"><Landing /></WithCanonical>} />
                    <Route path="/privacy"     element={<WithCanonical path="/privacy"><PrivacyPolicy /></WithCanonical>} />
                    <Route path="/pro"         element={<WithCanonical path="/pro"><Pro /></WithCanonical>} />
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
                      <Route path="/topics/:topicId" element={<TopicDetail />} />
                      <Route path="/study"       element={<Study />} />
                      <Route path="/tutor"       element={<Navigate to="/ai?tab=tutor" replace />} />
                      <Route path="/mistakes"    element={<Mistakes />} />
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
                    <Route path="/topic-mastery" element={<Navigate to="/topics" replace />} />
                    <Route path="/ai-advisor"    element={<Navigate to="/ai" replace />} />
                    <Route path="/tasks"         element={<Navigate to="/calendar" replace />} />

                    {/* Catch-all */}
                    <Route path="*" element={<NotFound />} />
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
