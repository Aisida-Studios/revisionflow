// src/components/Section.jsx
// Small collapsible card section, used throughout the admin panel (Admin.jsx and
// AdminDataEditor.jsx both use this). Lives in its own file specifically so neither of those two
// has to import it from the other — that would create a circular import between them.
import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function Section({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
        borderBottom: open ? '1px solid var(--border)' : 'none',
      }}>
        <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem' }}>
          {icon} {title}
        </h4>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div style={{ padding: '16px 18px' }}>{children}</div>}
    </div>
  )
}
