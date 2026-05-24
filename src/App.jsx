// src/App.jsx
import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { TimerProvider } from './context/TimerContext'
import { PriorityProvider } from './context/PriorityContext'
import Layout from './components/Layout'
import { Toaster } from 'react-hot-toast'
import XPToast from './components/XPToast'

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

// ── Guards ────────────────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function PublicOnly({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : children
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
                    <Route path="/u/:username" element={<PublicProfile />} />

                    {/* Auth — no sidebar */}
                    <Route path="/login"  element={<PublicOnly><Login /></PublicOnly>} />
                    <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />

                    {/* Onboarding — no sidebar */}
                    <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />

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
            </PriorityProvider>
          </TimerProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
