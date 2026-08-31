// src/components/Layout.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore'
import {
  LayoutDashboard, CalendarDays, Award, ClipboardList, Target,
  BookOpen, Compass, GraduationCap, CheckSquare, Timer as TimerIcon,
  AlertCircle, BarChart3, Users, Trophy, User, Settings, HelpCircle,
  ChevronsLeft, ChevronsRight, LogOut, Menu, Zap, Crown, Lock, X,
  Search, Bell, Layers, ArrowRight, Check,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import { useIsPro } from './ProGate'
import { resolveProfileIcon } from '../data/themes'
import { db } from '../firebase'
import { getPermissionState, requestNotificationPermission } from '../utils/notifications'
import { getAllTopicsFlat } from '../data/topics'
import { buildTopicId } from '../utils/topicId'
import { SUBJECT_COLOURS } from '../data/subjects'
import {
  subscribeToNotifications, markNotificationRead, markAllNotificationsRead,
} from '../utils/notificationFeed'

/* Route list — every path here matches App.jsx exactly (canonical paths,
   not the legacy /exam-dates, /past-papers, /ai-advisor redirects). Nothing
   added, nothing removed relative to the current NAV_GROUPS/MOBILE_NAV —
   this redesign only changes how these render, not which routes exist. */
const NAV_GROUPS = [
  {
    label: null,
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/calendar', label: 'Calendar', icon: CalendarDays },
      { to: '/exams', label: 'Exam Dates', icon: Award },
      { to: '/papers', label: 'Past Papers', icon: ClipboardList },
      { to: '/topics', label: 'Topics', icon: Target },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/study', label: 'Study Tools', icon: BookOpen },
      { to: '/ai', label: 'AI Advisor', icon: Compass },
      { to: '/tutor', label: 'Tutor', icon: GraduationCap, pro: true },
      { to: '/tasks', label: 'Tasks', icon: CheckSquare },
      { to: '/timer', label: 'Timer', icon: TimerIcon },
      { to: '/mistakes', label: 'Mistakes', icon: AlertCircle },
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Social',
    items: [
      { to: '/friends', label: 'Friends', icon: Users },
      { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile', label: 'Profile', icon: User },
      { to: '/settings', label: 'Settings', icon: Settings },
      { to: '/help', label: 'Help', icon: HelpCircle },
    ],
  },
]

// Unchanged from the current implementation — same five items, same order.
const MOBILE_NAV = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/study', label: 'Study', icon: Zap },
  { to: '/topics', label: 'Topics', icon: Target },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { action: 'more', label: 'More', icon: Menu },
]

function ProFlag() {
  return (
    <span className="nav-pro-flag">
      <Lock size={10} /> Pro
    </span>
  )
}

function Avatar({ profile, user, size }) {
  const resolved = resolveProfileIcon(profile?.profileIcon)
  const initial = (profile?.displayName || user?.displayName || '?').trim()[0]?.toUpperCase() || '?'
  return (
    <span className={`sidebar-avatar ${size === 'sm' ? 'sidebar-avatar--sm' : ''}`}>
      {resolved?.emoji || initial}
    </span>
  )
}

/* Search across real data only: nav pages, the subjects the user actually
   takes (profile.subjects — already in memory, no fetch), and that
   subject's syllabus topics (data/topics.js's getAllTopicsFlat — static,
   synchronous, no Firestore read). Topic results link straight to
   /topics/:topicId using the same buildTopicId() scheme TopicDetail.jsx
   reads its Firestore doc by — same canonical ID everywhere, not a
   second convention. */
/* profile.subjects entries store the subject name under .name, not
   .subject — confirmed directly against where Settings.jsx constructs
   them ({ ...newSubj, qualification, targetGrade, id } where newSubj
   starts as { name, board, tier, ... }). This was read as s.subject
   everywhere below, which is always undefined on the real data — that's
   the actual bug: the subjects filter always returned nothing, and the
   topics loop's guard (if (!s?.subject) return) exited before ever
   calling getAllTopicsFlat, for every subject, every time. Both search
   categories broke from the same one wrong field name. */
function useSearchResults(query, profileSubjects) {
  const subjectTopics = useMemo(() => {
    if (!profileSubjects?.length) return []
    const out = []
    profileSubjects.forEach((s) => {
      if (!s?.name) return
      try {
        const topics = getAllTopicsFlat(s.board, s.name, s.qualification)
        topics.forEach((t) => out.push({
          name: t.name,
          subject: s.name,
          topicId: buildTopicId(s.board, s.qualification, s.name, t.name),
        }))
      } catch {
        // Static syllabus data may not cover every board/subject/qualification
        // combination yet — skip rather than let one bad combo break search.
      }
    })
    return out
  }, [profileSubjects])

  return useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return { pages: [], subjects: [], topics: [] }
    const pages = NAV_GROUPS.flatMap((g) => g.items).filter((i) => i.label.toLowerCase().includes(q))
    const subjects = (profileSubjects || []).filter((s) => s.name?.toLowerCase().includes(q))
    const topics = subjectTopics.filter((t) => t.name.toLowerCase().includes(q)).slice(0, 6)
    return { pages, subjects, topics }
  }, [query, profileSubjects, subjectTopics])
}

function QuickJump({ query, profile, onNavigate }) {
  const { pages, subjects, topics } = useSearchResults(query, profile?.subjects)
  const hasAny = pages.length || subjects.length || topics.length
  if (!query.trim()) return null
  return (
    <div className="quick-jump-panel">
      {!hasAny && <p className="quick-jump-empty">Nothing matches "{query}"</p>}
      {pages.length > 0 && (
        <>
          <p className="quick-jump-group-label">Pages</p>
          {pages.slice(0, 4).map((item) => (
            <Link key={item.to} to={item.to} className="quick-jump-item" onClick={onNavigate}>
              <item.icon size={15} />
              <span>{item.label}</span>
            </Link>
          ))}
        </>
      )}
      {subjects.length > 0 && (
        <>
          <p className="quick-jump-group-label">Subjects</p>
          {subjects.slice(0, 4).map((s) => (
            <Link key={s.name} to="/topics" className="quick-jump-item" onClick={onNavigate}>
              <span className="quick-jump-dot" style={{ background: SUBJECT_COLOURS?.[s.name] || 'var(--text-muted)' }} />
              <span>{s.name}</span>
            </Link>
          ))}
        </>
      )}
      {topics.length > 0 && (
        <>
          <p className="quick-jump-group-label">Topics</p>
          {topics.map((t) => (
            <Link key={t.topicId} to={`/topics/${t.topicId}`} className="quick-jump-item" onClick={onNavigate}>
              <Layers size={14} />
              <span>{t.name}</span>
              <span className="quick-jump-item-meta">{t.subject}</span>
            </Link>
          ))}

        </>
      )}
    </div>
  )
}

function timeAgo(date) {
  if (!date) return ''
  const mins = Math.round((Date.now() - date.getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

/* Bell panel: a real, live-subscribed notification feed (empty until
   something calls createNotification — see utils/notificationFeed.js —
   no invented history) plus the real Web Push settings that were here
   before. Two genuinely different things stacked in one panel: things
   that already happened (feed) vs. whether you'll be told about things
   that happen next (push toggles). */
function NotificationPanel({ user, profile }) {
  const [notifications, setNotifications] = useState([])
  const [permission, setPermission] = useState(() => getPermissionState())
  const [busy, setBusy] = useState(false)
  const settings = profile?.notificationSettings || {}
  const examRemindersOn = settings.examReminders !== false // defaults on, per usePushNotifications
  const dailyReminderOn = !!settings.dailyReminder
  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!user) return
    return subscribeToNotifications(user.uid, setNotifications)
  }, [user])

  async function handleEnable() {
    setBusy(true)
    try {
      await requestNotificationPermission()
    } finally {
      setPermission(getPermissionState())
      setBusy(false)
    }
  }

  async function toggle(key) {
    if (!user) return
    const next = { ...settings }
    if (key === 'examReminders') next.examReminders = settings.examReminders === false
    else next[key] = !settings[key]
    try {
      await updateDoc(doc(db, 'users', user.uid), { notificationSettings: next })
    } catch {
      // Non-fatal — the checkbox will just reflect Firestore's last-known state.
    }
  }

  function handleItemClick(n) {
    if (!n.read) markNotificationRead(user.uid, n.id).catch(() => {})
  }

  return (
    <div className="notif-panel">
      <div className="notif-panel-head">
        <p className="quick-jump-group-label" style={{ margin: 0 }}>Notifications</p>
        {unreadCount > 0 && (
          <button
            type="button"
            className="notif-mark-all"
            onClick={() => markAllNotificationsRead(user.uid, notifications).catch(() => {})}
          >
            <Check size={12} /> Mark all read
          </button>
        )}
      </div>

      <div className="notif-feed">
        {notifications.length === 0 ? (
          <p className="notif-empty">You're all caught up — nothing here yet.</p>
        ) : (
          notifications.map((n) => {
            const created = n.createdAt?.toDate ? n.createdAt.toDate() : null
            const Row = n.link ? Link : 'div'
            return (
              <Row
                key={n.id}
                {...(n.link ? { to: n.link } : {})}
                className={`notif-item ${n.read ? '' : 'notif-item--unread'}`}
                onClick={() => handleItemClick(n)}
              >
                {!n.read && <span className="notif-unread-dot" />}
                <div className="notif-item-main">
                  <span className="notif-item-title">{n.title}</span>
                  {n.body && <span className="notif-item-body">{n.body}</span>}
                </div>
                <span className="notif-item-time">{timeAgo(created)}</span>
              </Row>
            )
          })
        )}
      </div>

      <div className="notif-divider" />
      <p className="quick-jump-group-label" style={{ margin: '0 0 8px' }}>Push settings</p>
      {permission === 'granted' ? (
        <div className="notif-toggles">
          <label className="notif-toggle-row">
            <span>Exam reminders</span>
            <input type="checkbox" checked={examRemindersOn} onChange={() => toggle('examReminders')} />
          </label>
          <label className="notif-toggle-row">
            <span>Daily study reminder</span>
            <input type="checkbox" checked={dailyReminderOn} onChange={() => toggle('dailyReminder')} />
          </label>
        </div>
      ) : permission === 'denied' ? (
        <p className="notif-blocked-text">Blocked in your browser settings — enable them there to turn this on.</p>
      ) : (
        <div className="notif-enable">
          <p>Turn on notifications for exam countdowns and daily study reminders.</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleEnable} disabled={busy}>
            {busy ? 'Requesting…' : 'Enable notifications'}
          </button>
        </div>
      )}
      <Link to="/settings" className="card-footer-link">All settings <ArrowRight size={13} /></Link>
    </div>
  )
}

export default function Layout() {
  const { user, profile, logout } = useAuth()
  const { isPro } = useIsPro()
  const location = useLocation()

  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('rf_sidebar_collapsed') === '1'
  )
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= 768
  )
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const searchRef = useRef(null)
  const notifRef = useRef(null)

  // Same 768px threshold the app already uses elsewhere (globals.css's
  // --sidebar-w breakpoints and .mobile-bottom-nav both key off it too) —
  // kept as JS state rather than moved to a pure-CSS toggle because the
  // sidebar's collapsed/expanded width also has to be known here for the
  // .main-content offset below.
  useEffect(() => {
    function onResize() { setIsMobile(window.innerWidth <= 768) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setMobileOpen(false)
    setSearchOpen(false)
    setSearchQuery('')
    setNotifOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function onClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    function onEscape(e) {
      if (e.key === 'Escape') { setSearchOpen(false); setNotifOpen(false) }
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])

  // Defensive fix carried over as-is: a modal mounting while the page is
  // mid-scroll can render below the fold. Watches for .modal-overlay being
  // added and snaps scroll back to top when it happens.
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1 && node.classList?.contains('modal-overlay')) {
            window.scrollTo({ top: 0, behavior: 'instant' })
          }
        }
      }
    })
    observer.observe(document.body, { childList: true })
    return () => observer.disconnect()
  }, [])

  function toggleCollapse() {
    setCollapsed((prev) => {
      localStorage.setItem('rf_sidebar_collapsed', prev ? '0' : '1')
      return !prev
    })
  }

  return (
    <div className="shell">
      {!isMobile && (
        <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
          <div className="sidebar-brand">
            <Link to="/dashboard" className="sidebar-brand-link">
              <span className="sidebar-logo"><Zap size={16} /></span>
              {!collapsed && <span>RevisionFlow</span>}
            </Link>
            <button
              type="button"
              className="sidebar-collapse-btn"
              onClick={toggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
            </button>
          </div>

          <nav className="sidebar-nav" aria-label="Primary">
            {NAV_GROUPS.map((group, gi) => (
              <div className="nav-group" key={group.label || `group-${gi}`}>
                {group.label && !collapsed && <p className="nav-group-label">{group.label}</p>}
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon size={18} />
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && item.pro && !isPro && <ProFlag />}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            {!isPro && (
              <Link to="/pro" className="sidebar-upgrade" title={collapsed ? 'Upgrade to Pro' : undefined}>
                <Crown size={16} />
                {!collapsed && <span>Upgrade to Pro</span>}
              </Link>
            )}
            <Link to="/profile" className="sidebar-user" title={collapsed ? (profile?.displayName || 'Your profile') : undefined}>
              <Avatar profile={profile} user={user} />
              {!collapsed && (
                <span className="sidebar-user-name">{profile?.displayName || 'Your profile'}</span>
              )}
            </Link>
            <button type="button" className="nav-item nav-item--muted" onClick={logout} title={collapsed ? 'Log out' : undefined}>
              <LogOut size={18} />
              {!collapsed && <span>Log out</span>}
            </button>
          </div>
        </aside>
      )}

      {isMobile && (
        <header className="topbar">
          <Link to="/dashboard" className="topbar-brand">
            <span className="sidebar-logo"><Zap size={16} /></span>
            <span>RevisionFlow</span>
          </Link>
          <button type="button" className="topbar-avatar-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Avatar profile={profile} user={user} size="sm" />
          </button>
        </header>
      )}

      <main className="main-content" style={!isMobile && collapsed ? { marginLeft: 64 } : undefined}>
        {!isMobile && (
          <div className="desktop-utility-bar">
            <div className="quick-jump" ref={searchRef}>
              <button
                type="button"
                className="utility-icon-btn"
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Search pages, subjects, topics"
                aria-expanded={searchOpen}
              >
                <Search size={17} />
              </button>
              {searchOpen && (
                <div className="quick-jump-dropdown">
                  <input
                    autoFocus
                    className="quick-jump-input"
                    placeholder="Search pages, subjects, topics…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <QuickJump query={searchQuery} profile={profile} onNavigate={() => setSearchOpen(false)} />
                </div>
              )}
            </div>
            <div className="quick-jump" ref={notifRef}>
              <button
                type="button"
                className="utility-icon-btn"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Notifications"
                aria-expanded={notifOpen}
              >
                <Bell size={17} />
                {getPermissionState() !== 'granted' && <span className="utility-dot" aria-hidden="true" />}
              </button>
              {notifOpen && (
                <div className="quick-jump-dropdown quick-jump-dropdown--notif">
                  <NotificationPanel user={user} profile={profile} />
                </div>
              )}
            </div>
            <Link to="/profile" aria-label="Your profile">
              <Avatar profile={profile} user={user} size="sm" />
            </Link>
          </div>
        )}
        <Outlet />
      </main>

      {isMobile && (
        <nav className="mobile-bottom-nav" aria-label="Bottom navigation">
          {MOBILE_NAV.map((item) => (
            item.action === 'more' ? (
              <button
                key="more"
                type="button"
                className={`mobile-nav-item ${mobileOpen ? 'mobile-nav-item--active' : ''}`}
                onClick={() => setMobileOpen(true)}
              >
                <item.icon size={22} />
                <span>{item.label}</span>
              </button>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `mobile-nav-item ${isActive ? 'mobile-nav-item--active' : ''}`}
              >
                <item.icon size={22} />
                <span>{item.label}</span>
              </NavLink>
            )
          ))}
        </nav>
      )}

      {isMobile && mobileOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-head">
              <Avatar profile={profile} user={user} />
              <span className="sidebar-user-name">{profile?.displayName || 'Your profile'}</span>
              <button type="button" className="btn-icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={18} />
              </button>
            </div>
            <nav className="mobile-drawer-nav" aria-label="All pages">
              {NAV_GROUPS.map((group, gi) => (
                <div className="nav-group" key={group.label || `mgroup-${gi}`}>
                  {group.label && <p className="nav-group-label">{group.label}</p>}
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
                    >
                      <item.icon size={18} />
                      <span>{item.label}</span>
                      {item.pro && !isPro && <ProFlag />}
                    </NavLink>
                  ))}
                </div>
              ))}
            </nav>
            {!isPro && (
              <Link to="/pro" className="sidebar-upgrade" style={{ margin: '4px 16px 12px' }}>
                <Crown size={16} /><span>Upgrade to Pro</span>
              </Link>
            )}
            <button
              type="button"
              className="nav-item nav-item--muted"
              style={{ margin: '0 16px 16px' }}
              onClick={logout}
            >
              <LogOut size={18} /><span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
