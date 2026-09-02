// src/components/PriorityList.jsx
import { useState, useCallback } from 'react'
import { usePriority } from '../context/PriorityContext'
import { subjectColour } from '../data/subjects'
import { Flame, GripVertical, Star as StarIcon, TrendingDown } from 'lucide-react'

function StarRating({ value = 3, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <span
          key={n}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          style={{
            fontSize: '1.1rem', cursor: 'pointer',
            color: n <= (hover || value) ? '#f59e0b' : 'var(--text-muted)',
            transition: 'color 0.1s',
          }}
        >★</span>
      ))}
    </div>
  )
}

export default function PriorityList({ topics = [], profile }) {
  const { priorities, setPriority, reorder, loading } = usePriority()
  const [dragIdx, setDragIdx] = useState(null)
  const [filter, setFilter] = useState('all')

  // Merge topics with priority data
  const allTopics = topics.map(t => ({
    ...t,
    priority: priorities.find(p => p.id === t.id) || null,
    rating: priorities.find(p => p.id === t.id)?.rating ?? 3,
    order: priorities.find(p => p.id === t.id)?.order ?? 999,
  }))

  // Build display list: prioritised topics first (rated 4-5), then rest
  const prioritised = [...allTopics]
    .filter(t => t.rating >= 4)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

  const allSorted = [...allTopics].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating
    return (a.order ?? 999) - (b.order ?? 999)
  })

  const filtered = filter === 'high' ? allSorted.filter(t => t.rating >= 4)
    : filter === 'low' ? allSorted.filter(t => t.rating <= 2)
    : allSorted

  const handleRate = useCallback(async (topic, rating) => {
    await setPriority(topic.id, topic.subjectId, topic.name, rating)
  }, [setPriority])

  // Drag and drop for prioritised list
  const onDragStart = (idx) => setDragIdx(idx)
  const onDragOver = (e, idx) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) return
    const newList = [...prioritised]
    const dragged = newList.splice(dragIdx, 1)[0]
    newList.splice(idx, 0, dragged)
    reorder(newList.map((t, i) => ({ ...t, order: i })))
    setDragIdx(idx)
  }
  const onDragEnd = () => setDragIdx(null)

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading priorities…</div>

  return (
    <div>
      {/* Top priority list - drag to reorder */}
      {prioritised.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Flame size={16} style={{ color: 'var(--warning)' }} /> Your Top Priorities
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Drag to reorder</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {prioritised.map((t, idx) => (
              <div
                key={t.id}
                draggable
                onDragStart={() => onDragStart(idx)}
                onDragOver={(e) => onDragOver(e, idx)}
                onDragEnd={onDragEnd}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.6rem 0.9rem',
                  background: dragIdx === idx ? 'var(--accent-pale)' : 'var(--bg-surface)',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  cursor: 'grab',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ color: 'var(--text-muted)', minWidth: 20, display: 'flex' }}><GripVertical size={15} /></span>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: subjectColour(t.subjectId),
                }} />
                <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {t.name}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.subjectId}</span>
                <StarRating value={t.rating} onChange={(r) => handleRate(t, r)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '0.25rem' }}>Show:</span>
        {['all','high','low'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.3rem 0.75rem', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: filter === f ? 'var(--accent)' : 'var(--bg-surface)',
            color: filter === f ? 'white' : 'var(--text-secondary)',
            fontSize: '0.8rem', fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            {f === 'high' && <StarIcon size={12} />}
            {f === 'low' && <TrendingDown size={12} />}
            {f === 'all' ? 'All Topics' : f === 'high' ? 'High Priority' : 'Needs Work'}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {filtered.length} topics
        </span>
      </div>

      {/* All topics with ratings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No topics found. Add subjects and topics first.
          </div>
        )}
        {filtered.map(t => (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.5rem 0.9rem',
            background: 'var(--bg-surface)', borderRadius: 8,
            border: '1px solid var(--border)',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: subjectColour(t.subjectId),
            }} />
            <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{t.name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 80, textAlign: 'right' }}>
              {t.subjectId}
            </span>
            <StarRating value={t.rating} onChange={(r) => handleRate(t, r)} />
          </div>
        ))}
      </div>
    </div>
  )
}
