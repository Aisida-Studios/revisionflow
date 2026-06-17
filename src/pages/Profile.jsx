// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { getPaperAttempts, getMistakes } from '../utils/firestore'
import { generateProgressReport } from '../utils/pdfReport'
import { generateTimetablePDF } from '../utils/pdfTimetable'
import { LEVELS, SUBJECT_COLOURS } from '../data/subjects'
import { BADGE_LIST, BADGE_CATEGORIES } from '../data/badges'
import { PROFILE_ICONS } from '../data/themes'
import { gradeColour } from '../utils/calendar'
import ReferralCard from '../components/ReferralCard'
import { Zap, Flame, Trophy, Copy, Check, Download, Loader, Share2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import BadgeAuditButton from '../components/BadgeAuditButton'

export default function Profile() {
  const { user, profile } = useAuth()
  const [copied,      setCopied]      = useState(false)
  const [exporting,   setExporting]   = useState(false)
  const [timetabling, setTimetabling] = useState(false)
  const [showCard,        setShowCard]        = useState(false)
  const [cardUrl,         setCardUrl]         = useState(null)
  const [cardLoading,     setCardLoading]     = useState(false)
  const [showMilestone,   setShowMilestone]   = useState(false)
  const [milestoneStreak, setMilestoneStreak] = useState(0)

  const lvl     = LEVELS[Math.min((profile?.level || 1) - 1, LEVELS.length - 1)]
  const nextLvl = LEVELS[Math.min((profile?.level || 1),     LEVELS.length - 1)]
  const xpPct   = profile ? Math.min(100, ((profile.xp || 0) / (nextLvl?.xpRequired || 100)) * 100) : 0

  const earnedIds      = profile?.badges || []
  const unlockedBadges = BADGE_LIST.filter(b => earnedIds.includes(b.id))
  const iconId         = profile?.profileIcon || 'lightning'
  const iconEmoji      = PROFILE_ICONS?.[iconId]?.emoji || null

  // Detect streak milestones and prompt to share
  useEffect(() => {
    if (!profile?.streak) return
    const s = profile.streak
    const MILESTONES = [7, 14, 30, 50, 100, 200, 365]
    if (!MILESTONES.includes(s)) return
    const key = 'streak_card_prompted_' + s
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, '1')
    setMilestoneStreak(s)
    setShowMilestone(true)
  }, [profile?.streak])
  const profileUrl     = `${window.location.origin}/u/${profile?.username || user?.uid}`

  function copyLink() {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Profile link copied!')
  }

  async function generateCard() {
    setCardLoading(true)
    setShowCard(true)
    try {
      const { generateStreakCard } = await import('../utils/streakCard')
      const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#7c3aed'
      const url = await generateStreakCard({
        displayName: profile?.displayName || user?.displayName || 'Student',
        streak:      profile?.streak      || 0,
        xp:          profile?.xp         || 0,
        level:       profile?.level       || 1,
        levelTitle:  lvl?.title           || 'Studier',
        badges:      (profile?.badges     || []).length,
        bestStreak:  profile?.bestStreak  || profile?.streak || 0,
        subjects:    (profile?.subjects   || []).map(s => typeof s === 'string' ? s : s.name).filter(Boolean),
        profileIcon: iconEmoji,
        accentColor,
      })
      setCardUrl(url)
    } catch(e) {
      toast.error('Could not generate card: ' + e.message)
      setShowCard(false)
    } finally {
      setCardLoading(false)
    }
  }

  function downloadCard() {
    if (!cardUrl) return
    const a = document.createElement('a')
    a.href     = cardUrl
    a.download = 'revisionflow-streak.png'
    a.click()
  }

  async function shareCard() {
    if (!cardUrl) return
    if (navigator.share && navigator.canShare) {
      try {
        const blob = await (await fetch(cardUrl)).blob()
        const file = new File([blob], 'revisionflow-streak.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My RevisionFlow streak',
            text:  `${profile?.streak || 0} day streak on RevisionFlow! Join me at revisionflow.netlify.app`,
          })
          return
        }
      } catch(e) {}
    }
    // Fallback: copy link
    downloadCard()
    toast.success('Card downloaded — share it on Instagram or TikTok!')
  }

  async function handleExportPDF() {
    if (!user) return
    setExporting(true)
    try {
      const [papers, mistakes, topicsSnap] = await Promise.all([
        getPaperAttempts(user.uid, null),
        getMistakes(user.uid, null),
        getDocs(collection(db, 'users', user.uid, 'topics')),
      ])
      const topics    = topicsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      const examDates = profile?.examDates || []
      const filename  = await generateProgressReport(profile, papers, topics, mistakes, examDates)
      toast.success(`Report exported: ${filename}`)
    } catch (err) {
      console.error(err)
      toast.error('Export failed — try again')
    } finally { setExporting(false) }
  }

  async function handleTimetablePDF() {
    setTimetabling(true)
    try {
      const { collection: col, getDocs: gd } = await import('firebase/firestore')
      const { db: fdb } = await import('../firebase')
      const sessSnap = await gd(col(fdb, 'users', user.uid, 'sessions'))
      const sessions = sessSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      await generateTimetablePDF(profile, sessions, profile?.examDates || [])
      toast.success('Timetable PDF exported!')
    } catch (err) {
      console.error(err)
      toast.error('Export failed — try again')
    } finally { setTimetabling(false) }
  }

  return (
    <div className="fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>

      {/* ── Milestone celebration modal ── */}
      {showMilestone && (
        <div className="modal-overlay" onClick={() => setShowMilestone(false)}>
          <div className="modal" style={{ maxWidth: 440, textAlign: 'center', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>
              {milestoneStreak >= 100 ? '👑' : milestoneStreak >= 30 ? '💎' : milestoneStreak >= 14 ? '💪' : '⚡'}
            </div>
            <h3 style={{ marginBottom: 8 }}>{milestoneStreak}-day streak!</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: '0.9rem', lineHeight: 1.6 }}>
              {milestoneStreak >= 100
                ? 'You are absolutely legendary. 100 days of consistent revision.'
                : milestoneStreak >= 30
                ? 'A whole month of daily revision. That discipline will pay off in your exams.'
                : milestoneStreak >= 14
                ? 'Two weeks straight. You are building real momentum.'
                : 'A full week of revision. Keep it going!'}
              {' '}Share your streak and inspire others!
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => { setShowMilestone(false); generateCard() }}>
                <Share2 size={14} /> Share my streak card
              </button>
              <button className="btn btn-ghost" onClick={() => setShowMilestone(false)}>
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Streak card modal ── */}
      {showCard && (
        <div className="modal-overlay" onClick={() => setShowCard(false)}>
          <div className="modal" style={{ maxWidth: 520, padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title"><Share2 size={16} /> Streak Card</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCard(false)}><X size={18} /></button>
            </div>
            {cardLoading ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} />
                <div style={{ marginTop: 10, fontSize: '0.875rem' }}>Generating your card...</div>
              </div>
            ) : cardUrl ? (
              <>
                <img src={cardUrl} alt="Streak card" style={{ width: '100%', borderRadius: 12, marginBottom: 16, display: 'block' }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={shareCard}>
                    <Share2 size={14} /> Share
                  </button>
                  <button className="btn btn-secondary" onClick={downloadCard}>
                    <Download size={14} /> Download
                  </button>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
                  Post to Instagram Stories, TikTok, or Twitter with #RevisionFlow
                </p>
              </>
            ) : null}
          </div>
        </div>
      )}


      {/* ── Header card ── */}
      <div className="card accent-card" style={{ marginBottom: 20, padding: 28, textAlign: 'center' }}>
        {/* Avatar */}
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.8rem', margin: '0 auto 14px' }}>
          {iconEmoji || (profile?.displayName || 'U')[0].toUpperCase()}
        </div>

        <h2 style={{ marginBottom: 4 }}>{profile?.displayName}</h2>
        {profile?.username && <p style={{ fontSize: '0.875rem', marginBottom: 14 }}>@{profile.username}</p>}

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
          {[
            { label: 'XP',      val: (profile?.xp || 0).toLocaleString(),                                col: 'var(--accent-light)' },
            { label: 'Streak',  val: <><span className="streak-fire">🔥</span>{profile?.streak || 0}</>, col: 'var(--warning)' },
            { label: 'Level',   val: `Lv.${profile?.level || 1}`,                                        col: 'var(--purple-300)' },
            { label: 'Badges',  val: unlockedBadges.length,                                               col: 'var(--success)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.col, display: 'flex', alignItems: 'center', gap: 4 }}>{s.val}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* XP progress bar */}
        <div className="progress-bar" style={{ maxWidth: 360, margin: '0 auto 6px' }}>
          <div className="progress-fill xp-bar-fill" style={{ width: `${xpPct}%` }} />
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          {profile?.xp || 0} / {nextLvl?.xpRequired} XP to Level {(profile?.level || 1) + 1} — {lvl?.title}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={generateCard} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Share2 size={14} /> Share streak card
          </button>
          <button className="btn btn-secondary btn-sm" onClick={copyLink}>
            {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Share profile</>}
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleExportPDF} disabled={exporting}>
            {exporting
              ? <><Loader size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> Generating…</>
              : <><Download size={13} /> Progress report</>}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleTimetablePDF} disabled={timetabling}>
            {timetabling
              ? <><Loader size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> Generating…</>
              : <><Download size={13} /> Timetable PDF</>}
          </button>
        </div>
      </div>

      {/* ── Referral card ── */}
      <div style={{ marginBottom: 20 }}>
        <ReferralCard />
      </div>

      {/* ── Subjects ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h4 style={{ marginBottom: 14 }}>Your subjects</h4>
        {(profile?.subjects || []).length === 0 ? (
          <p>No subjects added. Go to Settings to add subjects.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {(profile?.subjects || []).map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: SUBJECT_COLOURS[s.name] || 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{s.name}</span>
                  <span className="badge badge-grey">{s.board}</span>
                  {s.tier && s.tier !== 'N/A' && <span className="badge badge-purple">{s.tier}</span>}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {profile?.startingGrades?.[s.name] && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Start: <strong>{profile.startingGrades[s.name]}</strong>
                    </span>
                  )}
                  {s.currentGrade && (
                    <span style={{ fontWeight: 800, color: gradeColour(s.currentGrade), fontSize: '1rem' }}>{s.currentGrade}</span>
                  )}
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <span style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1rem' }}>{s.targetGrade || profile?.targetGrades?.[s.name] || 9}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Badges ── */}
      <BadgeAuditButton />
      
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h4>Badges ({unlockedBadges.length}/{BADGE_LIST.length})</h4>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{BADGE_LIST.length - unlockedBadges.length} remaining</span>
        </div>
        <p style={{ fontSize: '0.8rem', marginBottom: 14 }}>
          Complete sessions, maintain streaks, and hit milestones to earn badges and XP.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 8 }}>
          {BADGE_LIST.map(b => {
            const unlocked = earnedIds.includes(b.id)
            return (
              <div key={b.id} title={b.desc}
                style={{ padding: 10, borderRadius: 'var(--radius-md)', textAlign: 'center', border: `1px solid ${unlocked ? 'rgba(124,58,237,0.45)' : 'var(--border)'}`, background: unlocked ? 'rgba(124,58,237,0.12)' : 'var(--bg-surface)', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ fontSize: '1.5rem', marginBottom: 4, opacity: unlocked ? 1 : 0.35 }}>{b.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '0.78rem', lineHeight: 1.2, color: unlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>{b.name}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.3, opacity: unlocked ? 1 : 0.6 }}>{b.desc}</div>
                {unlocked && <div style={{ marginTop: 4, fontSize: '0.68rem', color: 'var(--accent-light)', fontWeight: 600 }}>+{b.xp} XP ✓</div>}
                {!unlocked && <div style={{ marginTop: 4, fontSize: '0.68rem', color: 'var(--text-muted)' }}>🔒 {b.hint || 'Keep going!'}</div>}
              </div>
            )
          })}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
