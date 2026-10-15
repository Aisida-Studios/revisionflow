// src/components/ProfileMenu.jsx
// The profile icon in the desktop top bar. It opens a menu instead of navigating straight away:
// who you are signed in as, the places an account menu normally leads, and log out.
// Closes on outside click, Escape, and navigation; the button reports its state to assistive tech.
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { User, Settings as SettingsIcon, HelpCircle, LogOut, Zap } from 'lucide-react'

export default function ProfileMenu({ user, profile, isPro, onLogout, avatar }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const buttonRef = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    const onKeyDown = (e) => { if (e.key === 'Escape') { setOpen(false); buttonRef.current?.focus() } }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const name = profile?.displayName || user?.displayName || 'Your account'

  return (
    <div className="quick-jump" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className="topbar-avatar-btn"
        onClick={() => setOpen(v => !v)}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {avatar}
      </button>
      {open && (
        <div className="quick-jump-dropdown quick-jump-dropdown--profile" role="menu" aria-label="Account">
          <div className="profile-menu-head">
            <div className="profile-menu-name">{name}</div>
            {user?.email && <div className="profile-menu-email">{user.email}</div>}
          </div>
          <Link to="/profile" className="quick-jump-item" role="menuitem"><User size={15} />Profile</Link>
          <Link to="/settings" className="quick-jump-item" role="menuitem"><SettingsIcon size={15} />Settings</Link>
          <Link to="/help" className="quick-jump-item" role="menuitem"><HelpCircle size={15} />Help</Link>
          {!isPro && <Link to="/pro" className="quick-jump-item" role="menuitem"><Zap size={15} />Upgrade to Pro</Link>}
          <button type="button" className="quick-jump-item profile-menu-logout" role="menuitem" onClick={onLogout}>
            <LogOut size={15} />Log out
          </button>
        </div>
      )}
    </div>
  )
}
