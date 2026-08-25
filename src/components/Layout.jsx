// src/components/Layout.jsx — UI v3
import React, { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useIsPro, ProBadge } from '../components/ProGate'
import { useTheme } from '../context/ThemeContext'
import { resolveProfileIcon } from '../data/themes'
import { LEVELS, levelFromXP } from '../data/subjects'
import {
  LayoutDashboard, Calendar, FileText, Brain, CheckSquare,
  Users, Trophy, User, MessageSquare, Clock, Settings, LogOut,
  Menu, Sun, Moon, Zap, Timer, BarChart2, HelpCircle, X,
  ChevronLeft, ChevronRight, Crown, GraduationCap, RotateCcw,
  MoreHorizontal,
} from 'lucide-react'

// Grouped for the desktop sidebar — primary destinations ungrouped at the top,
// then Tools / Social / Account with a small uppercase heading each (heading
// omitted entirely when the sidebar is collapsed, same as every label already
// was). Icons render for real now — emoji dropped from primary nav iconography.
const NAV_GROUPS = [
  {
    heading: null,
    items: [
      { to:'/dashboard', label:'Dashboard',   icon:LayoutDashboard },
      { to:'/calendar',  label:'Calendar',    icon:Calendar },
      { to:'/exams',     label:'Exam Dates',  icon:Clock },
      { to:'/papers',    label:'Past Papers', icon:FileText },
      { to:'/topics',    label:'Topics',      icon:Brain },
    ],
  },
  {
    heading: 'Tools',
    items: [
      { to:'/study',     label:'Study Tools', icon:Zap },
      { to:'/ai',        label:'AI Advisor',  icon:MessageSquare },
      { to:'/tutor',     label:'Tutor',       icon:GraduationCap, pro:true },
      { to:'/tasks',     label:'Tasks',       icon:CheckSquare },
      { to:'/timer',     label:'Timer',       icon:Timer },
      { to:'/mistakes',  label:'Mistakes',    icon:RotateCcw },
      { to:'/analytics', label:'Analytics',   icon:BarChart2 },
    ],
  },
  {
    heading: 'Social',
    items: [
      { to:'/friends',     label:'Friends',     icon:Users },
      { to:'/leaderboard', label:'Leaderboard', icon:Trophy },
    ],
  },
  {
    heading: 'Account',
    items: [
      { to:'/profile',  label:'Profile',  icon:User },
      { to:'/settings', label:'Settings', icon:Settings },
      { to:'/help',     label:'Help',     icon:HelpCircle },
    ],
  },
]

// Mobile bottom nav — five items per the redesign brief. "More" isn't a route:
// it opens the same slide-in drawer the hamburger button already opens (full
// NAV_GROUPS), so there's one "everything else" surface, not two to keep in
// sync, and no new page/route needed for it.
const MOBILE_NAV = [
  { to:'/dashboard', label:'Home',     icon:LayoutDashboard },
  { to:'/study',     label:'Study',    icon:Zap },
  { to:'/topics',    label:'Topics',   icon:Brain },
  { to:'/calendar',  label:'Calendar', icon:Calendar },
  { action:'more',   label:'More',     icon:MoreHorizontal },
]

export default function Layout() {
  // Defensive fallback for modal positioning: .modal-overlay is meant to be position:fixed
  // and cover the true viewport regardless of scroll (see the transform:none fix in
  // globals.css for the actual root cause of why it wasn't). This doesn't fix positioning
  // itself — a correctly-fixed overlay doesn't need it — but scrolling to top the instant one
  // appears means even a still-hijacked overlay lands where the user is currently looking,
  // rather than wherever "middle of the full document" happens to fall. Cheap, global, and
  // needs no changes on any individual page's modal.
  useEffect(() => {
    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue
          const isModal = node.classList?.contains('modal-overlay') || node.querySelector?.('.modal-overlay')
          if (isModal) { window.scrollTo({ top: 0, behavior: 'instant' }); return }
        }
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setMobileOpen(false)
  }, [location.pathname])

  function toggleCollapse() {
    setCollapsed(v => { const n=!v; localStorage.setItem('sidebar-collapsed',n?'1':'0'); return n })
  }

  async function handleLogout() { await logout(); navigate('/login') }

  // XP — uses the canonical LEVELS/levelFromXP from data/subjects.js (previously a local
  // duplicate of the same logic, using an older/easier curve — see subjects.js for why that
  // mattered beyond just tidiness: it's also what caused Profile.jsx to disagree with this bar).
  const totalXP      = profile?.xp || 0
  const level        = levelFromXP(totalXP)
  const currentLvlXp = LEVELS[level - 1]?.xpRequired || 0
  const nextLvlXp     = LEVELS[level]?.xpRequired ?? (currentLvlXp + 1000000) // top of table — no further requirement to show
  const xpThisLevel  = totalXP - currentLvlXp
  const xpNeeded     = nextLvlXp - currentLvlXp
  const xpPct        = Math.min(100, Math.round((xpThisLevel / xpNeeded) * 100))

  const iconEmoji = resolveProfileIcon(profile?.profileIcon).emoji ?? null
  const initial   = (profile?.displayName||'U')[0].toUpperCase()

  const FULL_W = 252, COLL_W = 64
  const sw     = collapsed ? COLL_W : FULL_W

  const Avatar = ({ size=38 }) => (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:'linear-gradient(135deg,var(--accent),var(--accent-light))',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:iconEmoji?(size*0.45)+'px':(size*0.35)+'px', fontWeight:800,
      border:'2.5px solid rgba(34,197,94,0.4)',
      userSelect:'none', boxShadow:'var(--shadow-sm)',
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
                background:'linear-gradient(135deg,var(--accent),var(--accent-light))',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'var(--shadow-sm)',
              }}>
                <Zap size={16} color="#fff" />
              </div>
              <span style={{ fontWeight:800, fontSize:'0.95rem', letterSpacing:'-0.02em', color:'var(--text-primary)' }}>
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
                      background:'linear-gradient(135deg,#f59e0b,#fbbf24)',
                      color:'#fff', fontSize:'0.55rem', fontWeight:800,
                      letterSpacing:'0.05em', flexShrink:0,
                    }}><Crown size={9}/>PRO</span>
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
          {NAV_GROUPS.map(group => (
            <React.Fragment key={group.heading || 'primary'}>
              {group.heading && !collapsed && (
                <div style={{
                  fontSize:'0.68rem', fontWeight:700, color:'var(--text-muted)',
                  textTransform:'uppercase', letterSpacing:'0.06em',
                  padding:'14px 12px 6px',
                }}>{group.heading}</div>
              )}
              {group.items.map(({ to, label, icon:Icon, pro }) => (
                <NavLink key={to} to={to} title={collapsed ? label : undefined}
                  style={({ isActive }) => ({
                    display:'flex', alignItems:'center',
                    gap: collapsed ? 0 : 9,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '9px 0' : '9px 12px',
                    borderRadius: 12,
                    fontSize:'0.85rem', fontWeight: isActive ? 700 : 500,
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
                    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                    transform: isActive ? 'scale(1.01)' : 'scale(1)',
                  })}>
                  {({ isActive }) => (
                    <>
                      <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} style={{ flexShrink:0 }}/>
                      {!collapsed && <span style={{ flex:1 }}>{label}</span>}
                      {!collapsed && pro && !isPro && <ProBadge style={{ fontSize:'0.55rem', padding:'0 5px', flexShrink:0 }} />}
                    </>
                  )}
                </NavLink>
              ))}
            </React.Fragment>
          ))}
        </nav>

        {/* Pro CTA */}
        {!isPro && !collapsed && (
          <a href="/pro" style={{
            display:'flex', alignItems:'center', gap:10,
            margin:'10px 0 4px', padding:'12px 14px', borderRadius:16,
            background:'linear-gradient(135deg,var(--gold-pale),var(--bg-muted))',
            border:'2px solid var(--gold-border)',
            textDecoration:'none', flexShrink:0,
            transition:'all 0.2s',
          }}>
            <Crown size={20} color="var(--gold)" style={{ flexShrink:0 }}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:'0.8rem', color:'var(--gold)' }}>Upgrade to Pro</div>
              <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Unlimited AI · from £3.99/mo</div>
            </div>
          </a>
        )}
        {!isPro && collapsed && (
          <a href="/pro" title="Upgrade to Pro" style={{
            display:'flex', justifyContent:'center', alignItems:'center',
            margin:'8px 0 4px', padding:'9px', borderRadius:12,
            background:'var(--gold-pale)', border:'2px solid var(--gold-border)',
            textDecoration:'none', flexShrink:0,
          }}><Crown size={18} color="var(--gold)"/></a>
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
                background:'linear-gradient(135deg,var(--accent),var(--accent-light))',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <Zap size={13} color="#fff"/>
              </div>
              <span style={{ fontWeight:800, fontSize:'1rem', letterSpacing:'-0.02em' }}>
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
        <main className={isMobile ? 'main-content' : undefined} style={{
          flex:1,
          paddingTop: isMobile ? 16 : 28,
          paddingLeft: isMobile ? 14 : 32,
          paddingRight: isMobile ? 14 : 32,
          // paddingBottom deliberately omitted on mobile: a `padding` shorthand (or even a
          // longhand paddingBottom: 0) would still out-specificity the .main-content class
          // below, inline styles beat classes regardless of the value — so the class's
          // calc(88px + env(safe-area-inset-bottom)) needs this property genuinely unset here,
          // not just set to something that happens to look similar.
          paddingBottom: isMobile ? undefined : 28,
          // Previously a hard maxWidth:1280 with no margin:auto — on a collapsed sidebar or a
          // wide monitor, the extra width freed up simply went unused as blank space bolted onto
          // the right edge only (no auto margins to centre it). Raised the cap so collapsing the
          // sidebar or having a wide screen actually gets used up to a still-readable width, and
          // centred it so anything beyond that cap is symmetric empty space, not a lopsided gutter.
          maxWidth:1600, width:'100%', margin:'0 auto', boxSizing:'border-box',
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
          {MOBILE_NAV.map(({ to, label, icon:Icon, action }) =>
            action === 'more' ? (
              <button key="more" onClick={() => setMobileOpen(true)} style={{
                flex:1, display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center',
                gap:3, padding:'10px 4px', border:'none', cursor:'pointer',
                background: mobileOpen ? 'var(--accent-pale)' : 'transparent',
                color: mobileOpen ? 'var(--accent)' : 'var(--text-muted)',
                fontSize:'0.67rem', fontWeight:700,
                borderTop: mobileOpen ? '2px solid var(--accent)' : '2px solid transparent',
                transition:'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
              }}>
                <Icon size={20} strokeWidth={mobileOpen?2.5:1.8}/>
                <span>{label}</span>
              </button>
            ) : (
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
            )
          )}
        </nav>
      )}
    </>
  )
}
