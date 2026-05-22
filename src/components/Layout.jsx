// src/components/Layout.jsx
import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { PROFILE_ICONS } from '../data/themes'
import PWAInstallBanner from './PWAInstallBanner'
import TopicUpdateBanner from './TopicUpdateBanner'
import {
  LayoutDashboard, Calendar, FileText, Brain,
  CheckSquare, Users, Trophy, User, MessageSquare,
  Clock, Settings, LogOut, Menu, Sun, Moon, Zap, Timer,
  BarChart2, Layers, HelpCircle
} from 'lucide-react'

const NAV = [
  { to: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/calendar',    label: 'Calendar',    icon: Calendar },
  { to: '/exams',       label: 'Exam Dates',  icon: Clock },
  { to: '/papers',      label: 'Past Papers', icon: FileText },
  { to: '/topics',      label: 'Topics',      icon: Brain },
  { to: '/study',       label: 'Study Tools', icon: Zap },
  { to: '/tasks',       label: 'Tasks',       icon: CheckSquare },
  { to: '/timer',       label: 'Timer',       icon: Timer },
  { to: '/analytics',   label: 'Analytics',   icon: BarChart2 },
  { to: '/ai',          label: 'AI Advisor',  icon: MessageSquare },
  { to: '/friends',     label: 'Friends',     icon: Users },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/profile',     label: 'Profile',     icon: User },
  { to: '/help',        label: 'Help',        icon: HelpCircle },
  { to: '/settings',    label: 'Settings',    icon: Settings },
]

const MOBILE_NAV = [
  { to: '/dashboard', label: 'Home',  icon: LayoutDashboard },
  { to: '/timer',     label: 'Timer', icon: Timer },
  { to: '/study',     label: 'Study', icon: Zap },
  { to: '/topics',    label: 'Topics',icon: Brain },
  { to: '/profile',   label: 'Me',    icon: User },
]

function xpForLevel(n) {
  return Math.floor(100 * Math.pow(1.15, n - 1))
}

function computeLevel(totalXP) {
  let lv = 1, cum = 0
  while (true) {
    const needed = xpForLevel(lv)
    if (cum + needed > totalXP) break
    cum += needed; lv++
  }
  return lv
}

const FULL_W      = 240
const COLLAPSED_W = 60

export default function Layout() {
  const { profile, logout } = useAuth()
  const { theme, toggle }   = useTheme()
  const navigate            = useNavigate()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed,  setCollapsed]  = useState(false)
  const [isMobile,   setIsMobile]   = useState(window.innerWidth <= 768)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const sidebarW = collapsed ? COLLAPSED_W : FULL_W

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  // XP calculations
  const totalXP     = profile?.xp || 0
  const level       = computeLevel(totalXP)
  let xpSoFar = 0
  for (let i = 1; i < level; i++) xpSoFar += xpForLevel(i)
  const xpThisLevel = totalXP - xpSoFar
  const xpNeeded    = xpForLevel(level)
  const xpPct       = Math.min(100, (xpThisLevel / xpNeeded) * 100)

  const iconId    = profile?.profileIcon || 'lightning'
  const iconEmoji = PROFILE_ICONS?.[iconId]?.emoji ?? null
  const initial   = (profile?.displayName || profile?.name || 'U')[0].toUpperCase()

  const avatarEl = (
    <div style={{
      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, var(--purple-700), var(--purple-400))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: iconEmoji ? '1.1rem' : '0.88rem', fontWeight: 700, userSelect: 'none',
    }}>
      {iconEmoji || initial}
    </div>
  )

  // Shared nav-item style factory
  const navStyle = (isActive, extraPad) => ({
    display: 'flex',
    alignItems: 'center',
    gap: collapsed ? 0 : 9,
    justifyContent: collapsed ? 'center' : 'flex-start',
    padding: collapsed ? '9px 0' : (extraPad || '7px 10px'),
    borderRadius: 8,
    fontSize: '0.84rem',
    fontWeight: isActive ? 600 : 400,
    color: isActive ? '#fff' : 'var(--text-secondary)',
    background: isActive ? 'var(--accent)' : 'transparent',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    whiteSpace: 'nowrap',
    transition: 'background 0.15s ease, color 0.15s ease',
    minHeight: 36,
  })

  return (
    <>
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 150,
              background: 'rgba(0,0,0,0.55)',
            }}
          />
        )}

        {/* ─── Sidebar ─── */}
        <aside style={{
          width: sidebarW,
          flexShrink: 0,
          position: 'fixed',
          top: 0, left: 0,
          height: '100vh',
          zIndex: 200,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: collapsed ? '16px 8px' : '16px 12px',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'width 0.2s ease, padding 0.2s ease, transform 0.2s ease',
          transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        }}>

          {/* Logo row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            marginBottom: 14,
            flexShrink: 0,
          }}>
            {!collapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Zap size={14} color="#fff" />
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.93rem', whiteSpace: 'nowrap' }}>
                  Revision<span style={{ color: 'var(--accent-light)' }}>Flow</span>
                </span>
              </div>
            )}
            <button
              onClick={() => { setCollapsed(x => !x); setMobileOpen(false) }}
              title={collapsed ? 'Expand' : 'Collapse'}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 6, cursor: 'pointer', color: 'var(--text-secondary)',
                width: 26, height: 26, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 800,
              }}
            >
              {collapsed ? '›' : '‹'}
            </button>
          </div>

          {/* User card (expanded) */}
          {profile && !collapsed && (
            <div style={{
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.28)',
              borderRadius: 10,
              padding: '10px 11px',
              marginBottom: 10,
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                {avatarEl}
                <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {profile.displayName || profile.name || 'Student'}
                  </div>
                  <div style={{ fontSize: '0.69rem', color: 'var(--text-muted)', marginTop: 1 }}>
                    Lv {level} · ⚡{totalXP.toLocaleString()} · 🔥{profile.streak || 0}
                  </div>
                </div>
              </div>
              {/* XP bar */}
              <div style={{ height: 4, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${xpPct}%`,
                  background: 'linear-gradient(90deg, var(--purple-700), var(--purple-400))',
                  borderRadius: 2, transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                <span>{xpThisLevel} / {xpNeeded} XP</span>
                <span>Lv {level + 1} →</span>
              </div>
            </div>
          )}

          {/* Collapsed: avatar only */}
          {profile && collapsed && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, flexShrink: 0 }}>
              {avatarEl}
            </div>
          )}

          {/* Nav */}
          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? label : undefined}
                style={({ isActive }) => navStyle(isActive)}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
                    {!collapsed && label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom: theme + logout */}
          <div style={{
            marginTop: 8, paddingTop: 8,
            borderTop: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: 1,
            flexShrink: 0,
          }}>
            <button
              onClick={toggle}
              title={collapsed ? (theme === 'dark' ? 'Light mode' : 'Dark mode') : undefined}
              style={navStyle(false)}
            >
              {theme === 'dark'
                ? <Sun size={16} style={{ flexShrink: 0, opacity: 0.7 }} />
                : <Moon size={16} style={{ flexShrink: 0, opacity: 0.7 }} />}
              {!collapsed && (theme === 'dark' ? 'Light mode' : 'Dark mode')}
            </button>
            <button
              onClick={handleLogout}
              title={collapsed ? 'Sign out' : undefined}
              style={{ ...navStyle(false), color: 'var(--danger)' }}
            >
              <LogOut size={16} style={{ flexShrink: 0, opacity: 0.85 }} />
              {!collapsed && 'Sign out'}
            </button>
          </div>
        </aside>

        {/* ─── Main content ─── */}
        <div style={{
          flex: 1,
          marginLeft: isMobile ? 0 : sidebarW,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.2s ease',
        }}>
          {/* Mobile top bar */}
          {isMobile && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 16px',
              background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
              position: 'sticky', top: 0, zIndex: 100,
            }}>
              <button
                onClick={() => setMobileOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', padding: 4 }}
              >
                <Menu size={22} />
              </button>
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>
                Revision<span style={{ color: 'var(--accent-light)' }}>Flow</span>
              </span>
              <button
                onClick={toggle}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 4 }}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          )}

          {/* Scrollable page area */}
          <div style={{
            flex: 1,
            padding: isMobile ? '16px 14px 90px' : '28px 32px',
            maxWidth: 1300,
            width: '100%',
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
          background: 'var(--bg-surface)', borderTop: '1px solid var(--border)',
          zIndex: 300, display: 'flex',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {MOBILE_NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 3, padding: '8px 2px',
                color: isActive ? 'var(--accent-light)' : 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: '0.67rem', fontWeight: 500,
                transition: 'color 0.15s',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}
    </>
  )
}
