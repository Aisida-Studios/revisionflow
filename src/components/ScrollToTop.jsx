// src/components/ScrollToTop.jsx
import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() { setVisible(window.scrollY > 400) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className="above-mobile-nav"
      style={{
        position: 'fixed',
        right: 16,
        '--fixed-bottom-offset': '16px',
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        zIndex: 40,
      }}
    >
      <ArrowUp size={18} />
    </button>
  )
}// src/components/ScrollToTop.jsx
import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() { setVisible(window.scrollY > 400) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className="above-mobile-nav"
      style={{
        position: 'fixed',
        right: 16,
        '--fixed-bottom-offset': '16px',
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        zIndex: 40,
      }}
    >
      <ArrowUp size={18} />
    </button>
  )
}
