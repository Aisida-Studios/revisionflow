// src/components/LevelUpPopup.jsx
import { PartyPopper } from 'lucide-react'

export default function LevelUpPopup({ level, title, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 360, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>🎊</div>
        <h3 style={{ marginBottom: 4 }}>Level {level}!</h3>
        <p style={{ color: 'var(--accent-light)', fontWeight: 700, marginBottom: 4 }}>{title}</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 22 }}>
          Your consistency is paying off — keep it up.
        </p>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
          <PartyPopper size={15} /> Onward!
        </button>
      </div>
    </div>
  )
}
