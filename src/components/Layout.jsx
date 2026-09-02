// src/components/Layout.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, Award, ClipboardList, Target,
  BookOpen, Compass, GraduationCap, Timer as TimerIcon,
  AlertCircle, BarChart3, Users, Trophy, User, Settings, HelpCircle,
  ChevronsLeft, ChevronsRight, LogOut, Menu, Zap, Crown, Lock, X,
  Search, Bell,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import { useIsPro } from './ProGate'
import { resolveProfileIcon } from '../data/themes'

/* Route list — every path here matches App.jsx exactly (canonical paths,
   not the legacy /exam-dates, /past-papers, /ai-advisor, /tasks redirects).
   /tasks removed here and in App.jsx — Calendar now absorbs task management
   (backlog panel, task CRUD) so a separate Tasks page is redundant. */
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

// Quick-jump search over the same nav items already in the sidebar/drawer —
// filters a flat list of real routes, nothing fetched, nothing invented.
function QuickJump({ query, onNavigate }) {
  const flat = useMemo(
    () => NAV_GROUPS.flatMap((g) => g.items).filter((item) =>
      item.label.toLowerCase().includes(query.trim().toLowerCase())
    ),
    [query]
  )
  if (!query.trim()) return null
  return (
    <div className="quick-jump-panel">
      {flat.length ? (
        flat.slice(0, 8).map((item) => (
          <Link key={item.to} to={item.to} className="quick-jump-item" onClick={onNavigate}>
            <item.icon size={15} />
            <span>{item.label}</span>
          </Link>
        ))
      ) : (
        <p className="quick-jump-empty">No pages match "{query}"</p>
      )}
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
  const searchRef = useRef(null)

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
  }, [location.pathname])

  useEffect(() => {
    function onClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
    }
    function onEscape(e) {
      if (e.key === 'Escape') setSearchOpen(false)
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
              <span className="sidebar-logo">RF</span>
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
            <span className="sidebar-logo">RF</span>
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
                aria-label="Search pages"
                aria-expanded={searchOpen}
              >
                <Search size={17} />
              </button>
              {searchOpen && (
                <div className="quick-jump-dropdown">
                  <input
                    autoFocus
                    className="quick-jump-input"
                    placeholder="Jump to a page…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <QuickJump query={searchQuery} onNavigate={() => setSearchOpen(false)} />
                </div>
              )}
            </div>
            <Link to="/settings" className="utility-icon-btn" aria-label="Notification settings">
              <Bell size={17} />
            </Link>
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
