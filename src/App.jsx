// src/App.jsx
import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { usePushNotifications } from './hooks/usePushNotifications'
import { AppProvider } from './context/AppContext'
import { TimerProvider } from './context/TimerContext'
import { PriorityProvider } from './context/PriorityContext'
import Layout from './components/Layout'
import LoadingScreen from './components/LoadingScreen'
import { Toaster } from 'react-hot-toast'
import XPToast from './components/XPToast'
import StreakCelebration from './components/StreakCelebration'

// Global streak celebration — reads from AuthContext, renders anywhere in app
function GlobalStreakCelebration() {
  const { streakCelebration, clearStreakCelebration } = useAuth()
  if (!streakCelebration) return null
  return <StreakCelebration streak={streakCelebration.streak} onClose={clearStreakCelebration} />
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
                    <Route path="/mistakes" element={<Navigate to="/papers" replace />} />
                    <Route path="/mastery"  element={<Navigate to="/topics" replace />} />
                    <Route path="/past-papers"   element={<Navigate to="/papers" replace />} />
                    <Route path="/exam-dates"    element={<Navigate to="/exams" replace />} />
                    <Route path="/topic-mastery" element={<Navigate to="/mastery" replace />} />
                    <Route path="/ai-advisor"    element={<Navigate to="/ai" replace />} />

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' } }} />
            <XPToast />
            <GlobalStreakCelebration />
            </PriorityProvider>
          </TimerProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
