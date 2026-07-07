// src/components/Layout.jsx — UI v3
import React, { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useIsPro } from '../components/ProGate'
import { useTheme } from '../context/ThemeContext'
import { PROFILE_ICONS } from '../data/themes'
import {
  LayoutDashboard, Calendar, FileText, Brain, CheckSquare,
  Users, Trophy, User, MessageSquare, Clock, Settings, LogOut,
  Menu, Sun, Moon, Zap, Timer, BarChart2, HelpCircle, X,
  ChevronLeft, ChevronRight, Crown,
} from 'lucide-react'

const NAV = [
  { to:'/dashboard',   label:'Dashboard',    icon:LayoutDashboard, emoji:'🏠' },
  { to:'/calendar',    label:'Calendar',     icon:Calendar,        emoji:'📅' },
  { to:'/exams',       label:'Exam Dates',   icon:Clock,           emoji:'📆' },
  { to:'/papers',      label:'Past Papers',  icon:FileText,        emoji:'📄' },
  { to:'/topics',      label:'Topics',       icon:Brain,           emoji:'🧠' },
  { to:'/study',       label:'Study Tools',  icon:Zap,             emoji:'✨' },
  { to:'/tasks',       label:'Tasks',        icon:CheckSquare,     emoji:'✅' },
  { to:'/timer',       label:'Timer',        icon:Timer,           emoji:'⏱'  },
  { to:'/analytics',   label:'Analytics',    icon:BarChart2,       emoji:'📊' },
  { to:'/ai',          label:'AI Advisor',   icon:MessageSquare,   emoji:'🤖' },
  { to:'/friends',     label:'Friends',      icon:Users,           emoji:'👥' },
  { to:'/leaderboard', label:'Leaderboard',  icon:Trophy,          emoji:'🏆' },
  { to:'/profile',     label:'Profile',      icon:User,            emoji:'👤' },
  { to:'/settings',    label:'Settings',     icon:Settings,        emoji:'⚙️'  },
  { to:'/help',        label:'Help',         icon:HelpCircle,      emoji:'❓' },
]

const MOBILE_NAV = [
  { to:'/dashboard',   label:'Home',   icon:LayoutDashboard },
  { to:'/study',       label:'Study',  icon:Zap },
  { to:'/topics',      label:'Topics', icon:Brain },
  { to:'/ai',          label:'AI',     icon:MessageSquare },
  { to:'/profile',     label:'Me',     icon:User },
]

function xpForLevel(n) { return Math.floor(100 * Math.pow(1.15, n-1)) }
function computeLevel(xp) {
  let lv=1,cum=0
  while(true){const n=xpForLevel(lv);if(cum+n>xp)break;cum+=n;lv++}
  return lv
}

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
    const fn = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  function toggleCollapse() {
    setCollapsed(v => { const n=!v; localStorage.setItem('sidebar-collapsed',n?'1':'0'); return n })
  }

  async function handleLogout() { await logout(); navigate('/login') }

  // XP
  const totalXP     = profile?.xp || 0
  const level       = computeLevel(totalXP)
  let cum = 0; for (let i=1;i<level;i++) cum+=xpForLevel(i)
  const xpThisLevel = totalXP - cum
  const xpNeeded    = xpForLevel(level)
  const xpPct       = Math.min(100, Math.round(xpThisLevel/xpNeeded*100))

  const iconEmoji = PROFILE_ICONS?.[profile?.profileIcon||'lightning']?.emoji ?? null
  const initial   = (profile?.displayName||'U')[0].toUpperCase()

  const FULL_W = 252, COLL_W = 64
  const sw     = collapsed ? COLL_W : FULL_W

  const Avatar = ({ size=38 }) => (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:'linear-gradient(135deg,#7c3aed,#a855f7)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:iconEmoji?(size*0.45)+'px':(size*0.35)+'px', fontWeight:800,
      border:'2.5px solid rgba(168,85,247,0.5)',
      userSelect:'none', boxShadow:'0 2px 8px rgba(124,58,237,0.3)',
    }}>
      {iconEmoji||initial}
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{
          position:'fixed', inset:0, zIndex:299,
          background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)',
        }} />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        width: sw, flexShrink:0,
        position:'fixed', top:0, left:0, height:'100dvh',
        zIndex:300,
        background: 'var(--bg-card)',
        borderRight:'2px solid var(--border)',
        display:'flex', flexDirection:'column',
        padding: collapsed ? '14px 8px' : '16px 14px',
        overflowY:'auto', overflowX:'hidden',
        transition:'width 0.22s cubic-bezier(0.4,0,0.2,1), padding 0.22s',
        transform: isMobile ? (mobileOpen?'translateX(0)':'translateX(-100%)') : 'none',
        boxShadow: isMobile && mobileOpen ? '4px 0 32px rgba(0,0,0,0.15)' : 'none',
      }}>

        {/* Logo */}
        <div style={{
          display:'flex', alignItems:'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          marginBottom:16, flexShrink:0, minHeight:36,
        }}>
          {!collapsed && (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{
                width:32, height:32, borderRadius:10, flexShrink:0,
                background:'linear-gradient(135deg,#7c3aed,#a855f7)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 4px 12px rgba(124,58,237,0.4)',
              }}>
                <Zap size={16} color="#fff" />
              </div>
              <span style={{ fontWeight:900, fontSize:'0.95rem', letterSpacing:'-0.02em', color:'var(--text-primary)' }}>
                Revision<span style={{ color:'var(--accent)' }}>Flow</span>
              </span>
            </div>
          )}
          {!isMobile && (
            <button onClick={toggleCollapse} title={collapsed?'Expand':'Collapse'}
              style={{
                background:'var(--bg-muted)', border:'2px solid var(--border)',
                borderRadius:8, cursor:'pointer', color:'var(--text-muted)',
                width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.15s', flexShrink:0,
              }}>
              {collapsed ? <ChevronRight size={13}/> : <ChevronLeft size={13}/>}
            </button>
          )}
          {isMobile && (
            <button onClick={()=>setMobileOpen(false)}
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:4 }}>
              <X size={20}/>
            </button>
          )}
        </div>

        {/* User card */}
        {profile && !collapsed && (
          <div style={{
            background:'linear-gradient(135deg,var(--accent-pale),var(--bg-muted))',
            border:'2px solid var(--border-strong)',
            borderRadius:16, padding:'12px 14px', marginBottom:12, flexShrink:0,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <Avatar size={38}/>
              <div style={{ overflow:'hidden', flex:1, minWidth:0 }}>
                <div style={{
                  fontWeight:800, fontSize:'0.84rem', overflow:'hidden',
                  textOverflow:'ellipsis', whiteSpace:'nowrap',
                  display:'flex', alignItems:'center', gap:6,
                }}>
                  {profile.displayName||'Student'}
                  {isPro && (
                    <span style={{
                      display:'inline-flex', alignItems:'center', gap:2,
                      padding:'1px 6px', borderRadius:999,
                      background:'linear-gradient(135deg,#7c3aed,#a855f7)',
                      color:'#fff', fontSize:'0.55rem', fontWeight:900,
                      letterSpacing:'0.05em', flexShrink:0,
                    }}>⚡PRO</span>
                  )}
                </div>
                <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:1, fontWeight:500 }}>
                  Lv {level} &nbsp;·&nbsp; ⚡{totalXP>=1000?(totalXP/1000).toFixed(1)+'k':totalXP} &nbsp;·&nbsp; 🔥{profile.streak||0}
                </div>
              </div>
            </div>
            {/* Fat XP bar */}
            <div className="progress-bar" style={{ height:10 }}>
              <div className="progress-fill xp-bar-fill" style={{ width:xpPct+'%' }}/>
            </div>
            <div style={{
              display:'flex', justifyContent:'space-between', marginTop:4,
              fontSize:'0.62rem', color:'var(--text-muted)', fontWeight:500,
            }}>
              <span>{xpThisLevel.toLocaleString()} XP</span>
              <span>{xpPct}% → Lv {level+1}</span>
            </div>
          </div>
        )}

        {/* Collapsed avatar */}
        {profile && collapsed && (
          <div style={{ display:'flex', justifyContent:'center', marginBottom:10, flexShrink:0 }}>
            <Avatar size={36}/>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:2, overflowY:'auto', overflowX:'hidden' }}>
          {NAV.map(({ to, label, icon:Icon, emoji }) => (
            <NavLink key={to} to={to} title={collapsed ? label : undefined}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center',
                gap: collapsed ? 0 : 9,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '9px 0' : '9px 12px',
                borderRadius: 12,
                fontSize:'0.85rem', fontWeight: isActive ? 800 : 500,
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive
                  ? 'linear-gradient(135deg,var(--accent),var(--purple-500))'
                  : 'transparent',
                textDecoration:'none',
                cursor:'pointer',
                width:'100%',
                whiteSpace:'nowrap',
                minHeight:38,
                border:'none',
                transition:'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
                boxShadow: isActive ? '0 4px 12px rgba(124,58,237,0.35), 0 2px 0 var(--purple-800)' : 'none',
                transform: isActive ? 'scale(1.01)' : 'scale(1)',
              })}>
              {({ isActive }) => (
                <>
                  <span style={{ fontSize:'1rem', flexShrink:0 }}>{emoji}</span>
                  {!collapsed && <span>{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Pro CTA */}
        {!isPro && !collapsed && (
          <a href="/pro" style={{
            display:'flex', alignItems:'center', gap:10,
            margin:'10px 0 4px', padding:'12px 14px', borderRadius:16,
            background:'linear-gradient(135deg,var(--accent-pale),var(--bg-muted))',
            border:'2px solid var(--border-strong)',
            textDecoration:'none', flexShrink:0,
            transition:'all 0.2s',
          }}>
            <span style={{ fontSize:'1.3rem' }}>⚡</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:800, fontSize:'0.8rem', color:'var(--accent)' }}>Upgrade to Pro</div>
              <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Unlimited AI · from £3.99/mo</div>
            </div>
          </a>
        )}
        {!isPro && collapsed && (
          <a href="/pro" title="Upgrade to Pro" style={{
            display:'flex', justifyContent:'center', alignItems:'center',
            margin:'8px 0 4px', padding:'9px', borderRadius:12,
            background:'var(--accent-pale)', border:'2px solid var(--border-strong)',
            textDecoration:'none', fontSize:'1.2rem', flexShrink:0,
          }}>⚡</a>
        )}

        {/* Bottom buttons */}
        <div style={{ borderTop:'2px solid var(--border)', paddingTop:8, marginTop:6, display:'flex', flexDirection:'column', gap:2, flexShrink:0 }}>
          {[
            { label: theme==='dark'?'Light mode':'Dark mode', icon: theme==='dark'?Sun:Moon, onClick:toggle, colour:'var(--text-secondary)' },
            { label:'Sign out', icon:LogOut, onClick:handleLogout, colour:'var(--danger)' },
          ].map(({ label, icon:Icon, onClick, colour }) => (
            <button key={label} onClick={onClick} title={collapsed?label:undefined}
              style={{
                display:'flex', alignItems:'center',
                gap: collapsed ? 0 : 9,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '9px 0' : '9px 12px',
                borderRadius:12, border:'none', cursor:'pointer',
                background:'transparent', color: colour, width:'100%',
                fontSize:'0.85rem', fontWeight:500, minHeight:36,
                transition:'background 0.15s',
              }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <Icon size={15} style={{ flexShrink:0 }}/>
              {!collapsed && label}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{
        marginLeft: isMobile ? 0 : sw,
        minHeight:'100dvh', display:'flex', flexDirection:'column',
        transition:'margin-left 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}>

        {/* Mobile top bar */}
        {isMobile && (
          <header style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'10px 16px',
            background:'var(--bg-card)', borderBottom:'2px solid var(--border)',
            position:'sticky', top:0, zIndex:200,
            boxShadow:'0 2px 16px rgba(0,0,0,0.08)',
          }}>
            <button onClick={()=>setMobileOpen(true)}
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-primary)', padding:6, borderRadius:8 }}>
              <Menu size={22}/>
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{
                width:26, height:26, borderRadius:8,
                background:'linear-gradient(135deg,#7c3aed,#a855f7)',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <Zap size={13} color="#fff"/>
              </div>
              <span style={{ fontWeight:900, fontSize:'1rem', letterSpacing:'-0.02em' }}>
                Revision<span style={{ color:'var(--accent)' }}>Flow</span>
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              {profile && (
                <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:700, display:'flex', gap:6 }}>
                  <span>🔥{profile.streak||0}</span>
                  <span>⚡{totalXP>=1000?(totalXP/1000).toFixed(1)+'k':totalXP}</span>
                </div>
              )}
              <button onClick={toggle}
                style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', padding:6, borderRadius:8 }}>
                {theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}
              </button>
            </div>
          </header>
        )}

        {/* Mobile XP strip */}
        {isMobile && profile && (
          <div className="progress-bar" style={{ height:6, borderRadius:0, border:'none' }}>
            <div className="progress-fill xp-bar-fill" style={{ width:xpPct+'%', transition:'width 0.8s ease', borderRadius:0 }}/>
          </div>
        )}

        {/* Page */}
        <main style={{
          flex:1,
          padding: isMobile ? '16px 14px 96px' : '28px 32px',
          maxWidth:1280, width:'100%',
        }}>
          <Outlet/>
        </main>
      </div>

      {/* Mobile bottom nav */}
      {isMobile && (
        <nav style={{
          position:'fixed', bottom:0, left:0, right:0, zIndex:400,
          background:'var(--bg-card)',
          borderTop:'2px solid var(--border)',
          display:'flex',
          paddingBottom:'env(safe-area-inset-bottom)',
          boxShadow:'0 -4px 24px rgba(0,0,0,0.1)',
        }}>
          {MOBILE_NAV.map(({ to, label, icon:Icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              flex:1, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center',
              gap:3, padding:'10px 4px',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              textDecoration:'none', fontSize:'0.67rem', fontWeight:700,
              background: isActive ? 'var(--accent-pale)' : 'transparent',
              borderTop: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              transition:'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
            })}>
              {({ isActive }) => (
                <>
                  <div style={{
                    transform: isActive ? 'scale(1.15) translateY(-1px)' : 'scale(1)',
                    transition:'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                  }}>
                    <Icon size={20} strokeWidth={isActive?2.5:1.8}/>
                  </div>
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
