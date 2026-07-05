// src/components/Layout.jsx
import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useIsPro } from '../components/ProGate'
import { useTheme } from '../context/ThemeContext'
import { PROFILE_ICONS } from '../data/themes'
import PWAInstallBanner from './PWAInstallBanner'
import TopicUpdateBanner from './TopicUpdateBanner'
import {
  LayoutDashboard, Calendar, FileText, Brain,
  CheckSquare, Users, Trophy, User, MessageSquare,
  Clock, Settings, LogOut, Menu, Sun, Moon, Zap, Timer,
  BarChart2, HelpCircle, X, ChevronLeft, ChevronRight
} from 'lucide-react'

const NAV = [
  { to: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard, emoji: '🏠' },
  { to: '/calendar',    label: 'Calendar',    icon: Calendar,         emoji: '📅' },
  { to: '/exams',       label: 'Exam Dates',  icon: Clock,            emoji: '📆' },
  { to: '/papers',      label: 'Past Papers', icon: FileText,         emoji: '📄' },
  { to: '/topics',      label: 'Topics',      icon: Brain,            emoji: '🧠' },
  { to: '/study',       label: 'Study Tools', icon: Zap,              emoji: '✨' },
  { to: '/tasks',       label: 'Tasks',       icon: CheckSquare,      emoji: '✅' },
  { to: '/timer',       label: 'Timer',       icon: Timer,            emoji: '⏱' },
  { to: '/analytics',   label: 'Analytics',   icon: BarChart2,        emoji: '📊' },
  { to: '/ai',          label: 'AI Advisor',  icon: MessageSquare,    emoji: '🤖' },
  { to: '/friends',     label: 'Friends',     icon: Users,            emoji: '👥' },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy,           emoji: '🏆' },
  { to: '/profile',     label: 'Profile',     icon: User,             emoji: '👤' },
  { to: '/help',        label: 'Help',        icon: HelpCircle,       emoji: '❓' },
  { to: '/settings',    label: 'Settings',    icon: Settings,         emoji: '⚙️' },
]

const MOBILE_NAV = [
  { to: '/dashboard',   label: 'Home',    icon: LayoutDashboard },
  { to: '/study',       label: 'Study',   icon: Zap },
  { to: '/topics',      label: 'Topics',  icon: Brain },
  { to: '/ai',          label: 'AI',      icon: MessageSquare },
  { to: '/profile',     label: 'Me',      icon: User },
]

function xpForLevel(n)    { return Math.floor(100 * Math.pow(1.15, n - 1)) }
function computeLevel(xp) {
  let lv = 1, cum = 0
  while (true) { const n = xpForLevel(lv); if (cum + n > xp) break; cum += n; lv++ }
  return lv
}

const FULL_W      = 244
const COLLAPSED_W = 62

export default function Layout() {
  const { profile, logout } = useAuth()
  const { isPro }           = useIsPro()
  const { theme, toggle }   = useTheme()
  const navigate            = useNavigate()
  const location            = useLocation()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed,  setCollapsed]  = useState(() => localStorage.getItem('sidebar-collapsed') === '1')
  const [isMobile,   setIsMobile]   = useState(window.innerWidth <= 768)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Close mobile nav on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  function toggleCollapse() {
    setCollapsed(v => {
      const next = !v
      localStorage.setItem('sidebar-collapsed', next ? '1' : '0')
      return next
    })
  }

  async function handleLogout() { await logout(); navigate('/login') }

  // XP calculations
  const totalXP     = profile?.xp || 0
  const level       = computeLevel(totalXP)
  let xpSoFar = 0
  for (let i = 1; i < level; i++) xpSoFar += xpForLevel(i)
  const xpThisLevel = totalXP - xpSoFar
  const xpNeeded    = xpForLevel(level)
  const xpPct       = Math.min(100, Math.round((xpThisLevel / xpNeeded) * 100))

  const iconId    = profile?.profileIcon || 'lightning'
  const iconEmoji = PROFILE_ICONS?.[iconId]?.emoji ?? null
  const initial   = (profile?.displayName || 'U')[0].toUpperCase()
  const sidebarW  = collapsed ? COLLAPSED_W : FULL_W

  const Avatar = () => (
    <div style={{
      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: iconEmoji ? '1.2rem' : '0.9rem', fontWeight: 800,
      boxShadow: '0 0 0 2px rgba(168,85,247,0.4)',
      userSelect: 'none', flexShrink: 0,
    }}>
      {iconEmoji || initial}
    </div>
  )

  return (
    <>
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div onClick={() => setMobileOpen(false)} style={{
            position: 'fixed', inset: 0, zIndex: 150,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
          }} />
        )}

        {/* ─── Sidebar ─── */}
        <aside style={{
          width: sidebarW, flexShrink: 0,
          position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 200,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          padding: collapsed ? '16px 8px' : '16px 12px',
          overflowY: 'auto', overflowX: 'hidden',
          transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), padding 0.22s',
          transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        }}>

          {/* Logo row */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            marginBottom: 16, flexShrink: 0,
          }}>
            {!collapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 12px rgba(124,58,237,0.4)',
                }}>
                  <Zap size={15} color="#fff" />
                </div>
                <span style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                  Revision<span style={{ color: 'var(--accent-light)' }}>Flow</span>
                </span>
              </div>
            )}
            <button onClick={toggleCollapse}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 7, cursor: 'pointer', color: 'var(--text-muted)',
                width: 28, height: 28, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {/* User card */}
          {profile && !collapsed && (
            <div style={{
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.25)',
              borderRadius: 12, padding: '11px 12px',
              marginBottom: 12, flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                <Avatar />
                <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 800, fontSize: '0.83rem',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {profile.displayName || 'Student'}
                    {isPro && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 2,
                        padding: '1px 6px', borderRadius: 999,
                        background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
                        color: '#fff', fontSize: '0.56rem', fontWeight: 800,
                        letterSpacing: '0.05em', flexShrink: 0,
                      }}>⚡PRO</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>
                    Lv {level} &nbsp;·&nbsp; ⚡{totalXP.toLocaleString()} &nbsp;·&nbsp; 🔥{profile.streak || 0}
                  </div>
                </div>
              </div>
              {/* Animated XP bar */}
              <div style={{ height: 5, background: 'var(--bg-hover)', borderRadius: 99, overflow: 'hidden' }}>
                <div className="xp-bar-fill" style={{
                  height: '100%', width: xpPct + '%',
                  borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', marginTop: 4,
                fontSize: '0.63rem', color: 'var(--text-muted)',
              }}>
                <span>{xpThisLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP</span>
                <span>{xpPct}% → Lv {level + 1}</span>
              </div>
            </div>
          )}

          {/* Collapsed avatar */}
          {profile && collapsed && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, flexShrink: 0 }}>
              <Avatar />
            </div>
          )}

          {/* Nav links */}
          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} title={collapsed ? label : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: collapsed ? 0 : 8,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '10px 0' : '8px 11px',
                  borderRadius: 10,
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive
                    ? 'linear-gradient(135deg, var(--purple-700), var(--purple-500))'
                    : 'transparent',
                  textDecoration: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
                  minHeight: 38,
                  boxShadow: isActive ? '0 3px 10px rgba(124,58,237,0.4)' : 'none',
                  letterSpacing: isActive ? '0.01em' : 0,
                })}
                onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateX(2px)' } }}
                onMouseLeave={e => { if (!e.currentTarget.getAttribute('aria-current')) { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; e.currentTarget.style.transform = '' } }}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.65 }} />
                    {!collapsed && <span>{label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Pro CTA */}
          {!isPro && !collapsed && (
            <a href="/pro" style={{
              display: 'flex', alignItems: 'center', gap: 9,
              margin: '10px 0 4px', padding: '10px 12px', borderRadius: 12,
              background: 'linear-gradient(135deg,rgba(124,58,237,0.18),rgba(168,85,247,0.08))',
              border: '1px solid rgba(124,58,237,0.35)',
              textDecoration: 'none', flexShrink: 0,
              transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(124,58,237,0.15)',
            }}>
              <span style={{ fontSize: '1.1rem' }}>⚡</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.78rem', color: 'var(--accent-light)' }}>Upgrade to Pro</div>
                <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>from £3.99/mo · unlimited AI</div>
              </div>
            </a>
          )}
          {!isPro && collapsed && (
            <a href="/pro" title="Upgrade to Pro" style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              margin: '8px 0 4px', padding: '9px', borderRadius: 10,
              background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
              textDecoration: 'none', fontSize: '1.1rem', flexShrink: 0,
            }}>⚡</a>
          )}

          {/* Bottom: theme + logout */}
          <div style={{
            marginTop: 6, paddingTop: 8,
            borderTop: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0,
          }}>
            {[
              {
                label: theme === 'dark' ? 'Light mode' : 'Dark mode',
                icon: theme === 'dark' ? Sun : Moon,
                onClick: toggle,
                color: 'var(--text-secondary)',
              },
              {
                label: 'Sign out',
                icon: LogOut,
                onClick: handleLogout,
                color: 'var(--danger)',
              },
            ].map(({ label, icon: Icon, onClick, color }) => (
              <button key={label} onClick={onClick} title={collapsed ? label : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: collapsed ? 0 : 8,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '9px 0' : '8px 11px',
                  borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: 'transparent', color, width: '100%',
                  fontSize: '0.84rem', fontWeight: 500,
                  transition: 'background 0.15s', minHeight: 36,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Icon size={15} style={{ flexShrink: 0, opacity: 0.8 }} />
                {!collapsed && label}
              </button>
            ))}
          </div>
        </aside>

        {/* ─── Main content ─── */}
        <div style={{
          flex: 1, marginLeft: isMobile ? 0 : sidebarW,
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          transition: 'margin-left 0.22s cubic-bezier(0.4,0,0.2,1)',
        }}>

          {/* Mobile top bar */}
          {isMobile && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px',
              background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
              position: 'sticky', top: 0, zIndex: 100,
              boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
            }}>
              <button onClick={() => setMobileOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 6, borderRadius: 8 }}>
                <Menu size={22} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 900, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                  Revision<span style={{ color: 'var(--accent-light)' }}>Flow</span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {profile && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    🔥{profile.streak || 0} &nbsp;⚡{totalXP >= 1000 ? (totalXP/1000).toFixed(1)+'k' : totalXP}
                  </div>
                )}
                <button onClick={toggle}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 6, borderRadius: 8 }}>
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* XP bar strip on mobile */}
          {isMobile && profile && (
            <div style={{ height: 3, background: 'var(--bg-hover)', overflow: 'hidden' }}>
              <div className="xp-bar-fill" style={{
                height: '100%', width: xpPct + '%', transition: 'width 0.8s ease',
              }} />
            </div>
          )}

          {/* Page content */}
          <div style={{
            flex: 1,
            padding: isMobile ? '14px 14px 92px' : '28px 32px',
            maxWidth: 1300, width: '100%',
          }}>
            <TopicUpdateBanner />
            <Outlet />
          </div>
        </div>
      </div>

      <PWAInstallBanner />

      {/* Mobile bottom nav */}
      {isMobile && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border)',
          zIndex: 300,
          display: 'flex',
          paddingBottom: 'env(safe-area-inset-bottom)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.35)',
        }}>
          {MOBILE_NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 3, padding: '9px 2px',
              color: isActive ? 'var(--accent-light)' : 'var(--text-muted)',
              textDecoration: 'none', fontSize: '0.67rem', fontWeight: 600,
              transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
              background: isActive ? 'rgba(124,58,237,0.1)' : 'transparent',
            })}>
              {({ isActive }) => (
                <>
                  <div style={{ transform: isActive ? 'scale(1.1) translateY(-1px)' : 'scale(1)', transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}>
                    <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
                  </div>
                  <span style={{ letterSpacing: '0.01em' }}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}
    </>
  )
}
