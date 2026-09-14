// src/pages/NotFound.jsx
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Compass, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const { user } = useAuth()
  const homeHref = user ? '/dashboard' : '/'

  return (
    <div style={{
      minHeight: '70vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '40px 20px', gap: 16,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 'var(--radius-lg)',
        background: 'var(--accent-pale)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
      }}>
        <Compass size={30} />
      </div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Page not found</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 360, margin: 0 }}>
        The page you're looking for doesn't exist, or the link may be out of date.
      </p>
      <Link to={homeHref} className="btn btn-primary" style={{ marginTop: 8 }}>
        <ArrowLeft size={16} />
        {user ? 'Back to dashboard' : 'Back to home'}
      </Link>
    </div>
  )
}
