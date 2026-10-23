// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { collection, getDocs } from 'firebase/firestore'
import { db, auth, getAppCheckHeader } from '../firebase'
import { getPaperAttempts, getMistakes } from '../utils/firestore'
import { generateProgressReport } from '../utils/pdfReport'
import { generateTimetablePDF } from '../utils/pdfTimetable'
import { LEVELS, getSubjectQualification } from '../data/subjects'
import { BADGE_LIST } from '../data/badges'
import { resolveProfileIcon } from '../data/themes'
import { gradeColour } from '../utils/calendar'
import { resolveTargetGrade } from '../utils/gradeTargets'
import ReferralCard from '../components/ReferralCard'
import SubjectTile from '../components/illustrations/SubjectTile'
import BadgeArt from '../components/illustrations/BadgeArt'
import { Zap, Copy, Check, Download, Loader, Share2, X, Crown, Settings, Lock } from 'lucide-react'
import { useIsPro, ProBadge } from '../components/ProGate'
import toast from 'react-hot-toast'
import BadgeAuditButton from '../components/BadgeAuditButton'
import './AccountPages.css'
import './Profile.css'

// Opens a Stripe Customer Portal session for subscription management
function ManageSubButton({ uid }) {
  const [loading, setLoading] = React.useState(false)

  async function openPortal() {
    if (!uid) return
    setLoading(true)
    try {
      const idToken = await auth.currentUser?.getIdToken()
      const res  = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (idToken || ''), ...(await getAppCheckHeader()) },
        body: JSON.stringify({ action: 'create-portal', uid }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else throw new Error(data.error || 'Could not open portal')
    } catch(e) {
      toast.error(e.message)
    }
    setLoading(false)
  }

  return (
    <button onClick={openPortal} disabled={loading}
      className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
      <Settings size={13} /> {loading ? 'Opening…' : 'Manage subscription'}
    </button>
  )
}

export default function Profile() {
  const { user, profile } = useAuth()
  const { isPro, isBeta } = useIsPro()
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
  // Was (profile.xp / nextLvl.xpRequired) — comparing raw cumulative XP directly against the
  // NEXT level's cumulative threshold, rather than measuring progress within the current level
  // (i.e. subtracting out the XP that already went toward reaching the current level). Same class
  // of bug as the one just fixed in Layout.jsx/Dashboard.jsx's XP bars — this is the third copy.
  const xpPct   = profile
    ? Math.min(100, (((profile.xp || 0) - (lvl?.xpRequired || 0)) / Math.max(1, (nextLvl?.xpRequired || 100) - (lvl?.xpRequired || 0))) * 100)
    : 0

  const earnedIds      = profile?.badges || []
  const unlockedBadges = BADGE_LIST.filter(b => earnedIds.includes(b.id))
  const iconEmoji      = resolveProfileIcon(profile?.profileIcon).emoji
  const [avatarError, setAvatarError] = useState(false)
  const hasRealAvatar  = !!profile?.avatarUrl && !avatarError

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
      const url = await generateStreakCard({
        displayName: profile?.displayName || user?.displayName || 'Student',
        streak:      profile?.streak      || 0,
        xp:          profile?.xp         || 0,
        level:       profile?.level       || 1,
        levelTitle:  lvl?.title           || 'Studier',
        badges:      (profile?.badges     || []).length,
        bestStreak:  profile?.bestStreak  || profile?.streak || 0,
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
            text:  (profile?.streak || 0) + ' day streak on RevisionFlow.',
            url:   'https://www.revisionflow.co.uk',
          })
          return
        }
      } catch(e) {
        if (e && e.name === 'AbortError') return
      }
    }
    downloadCard()
    toast.success('Card saved to your device')
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
    <div className="fade-in ap-page ap-page--md">

      {/* ── Milestone celebration modal ── */}
      {showMilestone && (
        <div className="modal-overlay" onClick={() => setShowMilestone(false)}>
          <div className="modal" style={{ maxWidth: 440, textAlign: 'center', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <BadgeArt
                id={milestoneStreak >= 100 ? 'streak_100' : milestoneStreak >= 30 ? 'streak_30' : milestoneStreak >= 14 ? 'streak_14' : 'streak_7'}
                size={104}
              />
            </div>
            <h3 style={{ marginBottom: 8 }}>{milestoneStreak}-day streak</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: '0.9rem', lineHeight: 1.6 }}>
              {milestoneStreak >= 100
                  ? '100 days of revising in a row.'
                  : milestoneStreak >= 30
                  ? 'A month of revising every day.'
                  : milestoneStreak >= 14
                  ? 'Two weeks of revising every day.'
                  : 'A full week of revising every day.'}
                {' '}You can save a card with your streak to share.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => { setShowMilestone(false); generateCard() }}>
                <Share2 size={14} /> Make a streak card
              </button>
              <button className="btn btn-ghost" onClick={() => setShowMilestone(false)}>
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Streak card modal ── */}
      {showCard && (
        <div className="modal-overlay" onClick={() => setShowCard(false)}>
          <div className="modal" style={{ maxWidth: 520, padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '1.05rem' }}><Share2 size={16} /> Streak card</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCard(false)}><X size={18} /></button>
            </div>
            {cardLoading ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} />
                <div style={{ marginTop: 10, fontSize: '0.875rem' }}>Making your card…</div>
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
                  The card shows your name, level, streak, XP and badge count.
                </p>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* ── Header card ── */}
      <div className="card accent-card" style={{ marginBottom: 20, padding: 28, textAlign: 'center' }}>
        <div className="ap-avatar ap-avatar--xl" style={{ margin: '0 auto 14px', fontSize: (!hasRealAvatar && iconEmoji) ? '2.4rem' : undefined }}>
          {hasRealAvatar
            ? <img src={profile.avatarUrl} alt="" onError={() => setAvatarError(true)} />
            : (iconEmoji || (profile?.displayName || 'U')[0].toUpperCase())}
        </div>

        <h2 style={{ marginBottom: 4, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
          {profile?.displayName}
          {isPro && <ProBadge style={{ fontSize:'0.7rem', padding:'3px 10px' }} />}
        </h2>
        {profile?.username && <p style={{ fontSize: '0.875rem', marginBottom: 4 }}>@{profile.username}</p>}
        <p className="pf-level">Level {profile?.level || 1} · {lvl?.title}</p>

        {/* Stats row */}
        <div className="pf-stats">
          <div><div className="pf-stat-num">{(profile?.xp || 0).toLocaleString()}</div><div className="pf-stat-cap">XP</div></div>
          <div><div className="pf-stat-num">{profile?.streak || 0}</div><div className="pf-stat-cap">Day streak</div></div>
          <div><div className="pf-stat-num">{unlockedBadges.length}</div><div className="pf-stat-cap">Badges</div></div>
        </div>

        {/* XP progress bar */}
        <div className="progress-bar" style={{ maxWidth: 360, margin: '0 auto 6px' }}>
          <div className="progress-fill xp-bar-fill" style={{ width: xpPct + '%' }} />
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          {profile?.xp || 0} / {nextLvl?.xpRequired} XP to Level {(profile?.level || 1) + 1}
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

      {/* ── Pro subscription card ── */}
      {(isPro || isBeta) && (
        <div className="card gold-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Crown size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  RevisionFlow Pro
                  {isBeta && <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>LIFETIME</span>}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {isBeta
                    ? 'Beta user — lifetime free access to all Pro features'
                    : profile?.stripePlan === 'annual'
                      ? '£29.99/year · ' + (profile?.stripeCurrentPeriodEnd ? 'renews ' + new Date(profile.stripeCurrentPeriodEnd * 1000).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : 'annual plan')
                      : '£3.99/month · ' + (profile?.stripeCurrentPeriodEnd ? 'renews ' + new Date(profile.stripeCurrentPeriodEnd * 1000).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : 'monthly plan')
                  }
                </div>
              </div>
            </div>
            {!isBeta && (
              <ManageSubButton uid={user?.uid} />
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
            {['Higher AI limits', '50-card flashcard sets', 'Timed quiz mode', 'All 10 themes', 'All 12 icons'].map(f => (
              <span key={f} className="badge badge-gold">
                <Check size={10} /> {f}
              </span>
            ))}
          </div>
        </div>
      )}
      {!isPro && (
        <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 650, fontSize: '0.88rem', marginBottom: 2 }}>Upgrade to Pro</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Higher AI limits, all themes, timed quiz — from £3.99/mo</div>
          </div>
          <Link to="/pro" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}><Zap size={13} /> Upgrade</Link>
        </div>
      )}

      {/* ── Subjects ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h4 className="card-eyebrow" style={{ marginBottom: 2 }}>Your subjects</h4>
        {(profile?.subjects || []).length === 0 ? (
          <p className="card-sub-line" style={{ margin: '8px 0 0' }}>No subjects added. Go to Settings to add subjects.</p>
        ) : (
          <div className="pf-subjects">
            {(profile?.subjects || []).map(s => {
              const subjQual = getSubjectQualification(s, profile)
              const target = resolveTargetGrade(s, profile)
              const start = profile?.startingGrades?.[s.name]
              const meta = [s.board, subjQual, s.tier && s.tier !== 'N/A' ? s.tier : null].filter(Boolean).join(' · ')
              return (
                <div key={s.name} className="pf-subject">
                  <SubjectTile subject={s.name} size={36} />
                  <div className="pf-subject-main">
                    <div className="pf-subject-name">{s.name}</div>
                    <div className="pf-subject-meta">{meta}{start ? ' · Started on ' + start : ''}</div>
                  </div>
                  <div className="pf-subject-grades">
                    <div className="pf-grade">
                      <span className="pf-grade-label">Now</span>
                      <span className="pf-grade-val" style={{ color: s.currentGrade ? gradeColour(s.currentGrade) : 'var(--text-muted)' }}>{s.currentGrade || '–'}</span>
                    </div>
                    <div className="pf-grade">
                      <span className="pf-grade-label">Target</span>
                      {target ? <span className="pf-grade-val">{target}</span> : <span className="pf-muted">Not set</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Badges ── */}
      <BadgeAuditButton />

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h4 className="card-eyebrow" style={{ margin: 0 }}>Badges ({unlockedBadges.length}/{BADGE_LIST.length})</h4>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{BADGE_LIST.length - unlockedBadges.length} remaining</span>
        </div>
        <p className="card-sub-line">Complete sessions, maintain streaks, and hit milestones to earn badges and XP.</p>
        <div className="ap-badge-tile-grid">
          {BADGE_LIST.map(b => {
            const unlocked = earnedIds.includes(b.id)
            return (
              <div key={b.id} title={b.desc} className={`ap-badge-tile${unlocked ? ' ap-badge-tile--earned' : ''}`}>
                <div className="ap-badge-tile-icon">
                  <BadgeArt id={b.id} size={56} earned={unlocked} />
                </div>
                <div className={`ap-badge-tile-name${unlocked ? '' : ' ap-badge-tile-name--locked'}`}>{b.name}</div>
                <div className="ap-badge-tile-desc">{b.desc}</div>
                {unlocked
                  ? <div className="ap-badge-tile-status" style={{ color: 'var(--accent-light)' }}>+{b.xp} XP <Check size={11} /></div>
                  : <div className="ap-badge-tile-status" style={{ color: 'var(--text-muted)' }}><Lock size={10} /> {b.hint || 'Keep going!'}</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
