# Swap catalogue — exact code for every illustration swap

Companion to [`INTEGRATION_GUIDE.md`](./INTEGRATION_GUIDE.md). **81 swaps in 24 files**, each one applied to a copy of the repo, built with `npm run build` and linted (0 new problems; 4 old ones cleared). The code below is exactly what was applied.

## Two ways to apply them

1. **Script (recommended):** `python3 tools/illustration-swaps/apply_swaps.py --repo . --write` replays every swap and tells you which ones no longer match. Add `--files pages/Dashboard.jsx,…` or `--owner "Study"` to apply only what you own. Without `--write` it only reports.

2. **By hand:** for each swap, find the *Replace* block in the file (it must appear exactly once), put the *With* block in its place, add the listed imports, and remove any lucide imports the file lists as unused. If a *Replace* block is not found, the file has been edited since the snapshot — keep your edits and apply the same idea to the new code.

Indentation below is the indentation in the file. Line numbers (L123) refer to the snapshot the swaps were tested on and will drift.

## Index

| File | Owner | Swaps | Priorities |
|---|---|---|---|
| `pages/Dashboard.jsx` | Dashboard / Navigation chat | 7 | P0 P2 P3 |
| `pages/Profile.jsx` | Analytics / Progress chat | 5 | P0 P1 P2 |
| `pages/PublicProfile.jsx` | no declared owner — main chat (closest workstream: Analytics / Progress) | 4 | P0 P3 |
| `components/BadgeAuditButton.jsx` | no declared owner — main chat | 1 | P0 |
| `components/LevelUpPopup.jsx` | no declared owner — main chat | 1 | P1 |
| `components/OnboardingRecapPopup.jsx` | no declared owner — main chat | 1 | P1 |
| `components/ReferralRewardPopup.jsx` | no declared owner — main chat | 3 | P1 |
| `components/StreakCelebration.jsx` | no declared owner — main chat | 5 | P1 |
| `pages/NotFound.jsx` | no declared owner — main chat | 2 | P1 |
| `components/ErrorBoundary.jsx` | Global / infrastructure chat (shared file) | 1 | P1 |
| `main.jsx` | Global / infrastructure chat (shared file) | 1 | P1 |
| `pages/Pro.jsx` | Pro / Monetisation chat | 1 | P2 |
| `pages/Onboarding.jsx` | Onboarding chat | 6 | P2 P3 |
| `pages/Friends.jsx` | no declared owner — main chat | 1 | P2 |
| `pages/Leaderboard.jsx` | no declared owner — main chat | 1 | P2 |
| `pages/AIAdvisor.jsx` | no declared owner — main chat | 3 | P2 |
| `pages/Topics.jsx` | no declared owner — main chat (closest workstream: Study) | 5 | P2 |
| `pages/Analytics.jsx` | Analytics / Progress chat | 5 | P2 |
| `pages/TopicDetail.jsx` | no declared owner — main chat (closest workstream: Study) | 5 | P2 |
| `pages/Calendar.jsx` | no declared owner — main chat (closest workstream: Dashboard / Navigation) | 10 | P2 |
| `pages/Study.jsx` | Study chat | 8 | P2 |
| `pages/PastPapers.jsx` | Analytics / Progress chat | 2 | P2 |
| `pages/Landing.jsx` | Landing chat | 2 | P2 |
| `pages/Settings.jsx` | no declared owner — main chat | 1 | P2 |

Priorities: **P0** badges (the new badge art is not shown anywhere but the unlock toast until these land) · **P1** pop-ups, 404, error screen · **P2** empty states and subject tiles · **P3** polish.

---

## `pages/Dashboard.jsx`

**Owner:** Dashboard / Navigation chat · **Swaps:** 7

**Add these imports**

```jsx
import BadgeArt from '../components/illustrations/BadgeArt'
import Illustration from '../components/illustrations/Illustration'
import SubjectTile from '../components/illustrations/SubjectTile'
```
_(placement: after import { componentForSubject } from '../data/illustrationThemes' — anywhere among the other imports is fine)_

### P0 · `dash-badge-imports` — Delete the lucide badge-icon imports and the BADGE_ICONS map

**Delete**

```jsx
// Same lucide badge-icon set as Profile.jsx (src/data/badges.js has a lucideIcon name on every
// badge) — Trophy/Award/CalendarDays are already imported above, the rest are badge-only icons.
import {
  Rocket, FileText, Bot, UserCheck, Flame, Zap, Dumbbell, Gem, Crown, Medal,
  TrendingUp, Star, ArrowUpCircle, Library, Cog, Sunrise, Moon,
  Footprints, Swords, UserPlus, Users, Megaphone, Siren, Brain, Layers, CalendarCheck,
} from 'lucide-react'
const BADGE_ICONS = {
  Rocket, FileText, Bot, UserCheck, Flame, Zap, Dumbbell, Gem, Crown, Medal, Award, Trophy,
  TrendingUp, Star, ArrowUpCircle, Library, Cog, Sunrise, Moon, CalendarDays,
  Footprints, Swords, UserPlus, Users, Megaphone, Siren, Brain, Layers, CalendarCheck,
}
```

### P0 · `dash-badge-showcase` — Dashboard badge row: real badge art, locked first badge when empty

> Also fixes a bug: the old tooltip read `b.description`, but badges.js calls the field `desc`, so the description never showed.

**Replace**

```jsx
function BadgeShowcase({ earnedIds }) {
  const earned = (earnedIds || []).map((id) => BADGE_MAP[id]).filter(Boolean)
  if (!earned.length) {
    return <EmptyMini text="No badges yet — keep revising to unlock your first one." />
  }
  return (
    <div className="badge-showcase">
      {earned.slice(0, 8).map((b) => {
        const Icon = BADGE_ICONS[b.lucideIcon]
        return (
          <span key={b.id} className="badge-icon" title={`${b.name}${b.description ? ` — ${b.description}` : ''}`}>
            {Icon ? <Icon size={16} /> : b.icon}
          </span>
        )
      })}
      {earned.length > 8 && <span className="badge-icon badge-icon--more">+{earned.length - 8}</span>}
    </div>
  )
}

export default function Dashboard() {
```
**With**

```jsx
function BadgeShowcase({ earnedIds }) {
  const earned = (earnedIds || []).map((id) => BADGE_MAP[id]).filter(Boolean)
  if (!earned.length) {
    // The first badge, locked: shows what there is to win instead of a bare sentence.
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="rfi-holder"><BadgeArt id="first_session" size={48} earned={false} /></span>
        <EmptyMini text="No badges yet — keep revising to unlock your first one." />
      </div>
    )
  }
  return (
    <div className="badge-showcase">
      {earned.slice(0, 8).map((b) => (
        <span key={b.id} className="rfi-holder" title={`${b.name} — ${b.desc}`}>
          <BadgeArt id={b.id} size={40} label={b.name} />
        </span>
      ))}
      {earned.length > 8 && <span className="badge-icon badge-icon--more">+{earned.length - 8}</span>}
    </div>
  )
}

export default function Dashboard() {
```

### P2 · `dash-subject-badge` — Dashboard subject rows: each subject's own picture instead of a shared lucide icon

> This deletes SUBJECT_ICONS (which fell back to the same graduation-cap icon for every subject outside the ten it listed). `.subject-badge` in globals.css is now unused — the Design System chat can delete it. No `tint` on purpose: SUBJECT_COLOURS contains purples, and a neutral tile keeps the calm look.

**Replace**

```jsx
/* Small subject-colour icon badge for list rows (Upcoming Exams, Subject
   Overview). No per-topic icon set exists in the codebase yet — grepped
   Topics.jsx/TopicDetail.jsx to confirm — so this is a deliberately light,
   easily-swappable stand-in built from SUBJECT_COLOURS (real, existing
   data) and lucide-react (already a dependency), not a second
   illustration architecture. Swap the icon map for real per-topic
   illustrations here, in one place, once they exist. */
const SUBJECT_ICONS = {
  Biology: Leaf, Chemistry: FlaskConical, Physics: Atom,
  Mathematics: Calculator, 'Further Mathematics': Calculator, Statistics: Calculator,
  'English Language': BookOpen, 'English Literature': BookOpen,
  History: Landmark, Geography: Globe2, 'Computer Science': Cpu,
}
function SubjectBadge({ subject }) {
  const Icon = SUBJECT_ICONS[subject] || GraduationCap
  const colour = SUBJECT_COLOURS?.[subject] || 'var(--text-muted)'
  return (
    <span className="subject-badge" style={{ color: colour, background: `${colour}1a` }}>
      <Icon size={14} />
    </span>
  )
}
```
**With**

```jsx
/* Small subject tile for list rows (Upcoming Exams, Subject Overview): the subject's own picture
   from src/components/illustrations. SubjectTile uses the compact tier — one object, cropped to the
   tile — so it stays legible at this size. */
function SubjectBadge({ subject }) {
  return <SubjectTile subject={subject} size={32} />
}
```

### P3 · `dash-empty-mini` — Dashboard EmptyMini: optional artwork

> Use `art` on at most three cards at once; the rest stay text-only so a brand-new dashboard stays calm.

**Replace**

```jsx
function EmptyMini({ text, to, label }) {
  return (
    <div className="mini-empty">
      <p>{text}</p>
      {to && <Link to={to} className="card-footer-link">{label} <ArrowRight size={13} /></Link>}
    </div>
  )
}
```
**With**

```jsx
function EmptyMini({ text, to, label, art }) {
  return (
    <div className="mini-empty" style={art ? { textAlign: 'center' } : undefined}>
      {art && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
          <Illustration name={art} width={120} />
        </div>
      )}
      <p>{text}</p>
      {to && <Link to={to} className="card-footer-link">{label} <ArrowRight size={13} /></Link>}
    </div>
  )
}
```

### P3 · `dash-empty-upcoming` — Upcoming sessions card: empty-sessions art

**Replace**

```jsx
<EmptyMini text="Nothing scheduled yet." to="/calendar" label="Plan your week" />
```
**With**

```jsx
<EmptyMini art="emptySessions" text="Nothing scheduled yet." to="/calendar" label="Plan your week" />
```

### P3 · `dash-empty-recent` — Recent activity card: study art

**Replace**

```jsx
<EmptyMini text="Your first session will show up here." to="/study" label="Start studying" />
```
**With**

```jsx
<EmptyMini art="study" text="Your first session will show up here." to="/study" label="Start studying" />
```

### P3 · `dash-empty-grades` — Predicted grades card: empty-analytics art

**Replace**

```jsx
<EmptyMini text="Complete a quiz or past paper to see predicted grades." to="/papers" label="Try a paper" />
```
**With**

```jsx
<EmptyMini art="emptyAnalytics" text="Complete a quiz or past paper to see predicted grades." to="/papers" label="Try a paper" />
```

**Then remove the now-unused lucide imports:** `Leaf`, `FlaskConical`, `Atom`, `Calculator`, `Landmark`, `Globe2`, `Cpu`, `GraduationCap` (only if nothing else in the file uses them).

---

## `pages/Profile.jsx`

**Owner:** Analytics / Progress chat · **Swaps:** 5

**Add these imports**

```jsx
import BadgeArt from '../components/illustrations/BadgeArt'
import SubjectTile from '../components/illustrations/SubjectTile'
```
_(placement: after import ReferralCard from '../components/ReferralCard' — anywhere among the other imports is fine)_

### P0 · `profile-badge-imports` — Delete the lucide badge-icon imports and the BADGE_ICONS map

**Delete**

```jsx
import {
  Rocket, FileText, Bot, UserCheck, Flame, Dumbbell, Gem, Medal, Award, Trophy,
  TrendingUp, Star, ArrowUpCircle, Library, Cog, Sunrise, Moon, CalendarDays,
  Footprints, Swords, UserPlus, Users, Megaphone, Siren, Brain, Layers, CalendarCheck,
} from 'lucide-react'

// Every badge carries a lucideIcon name (src/data/badges.js) — this looks it up to a real
// component. Kept as an explicit map rather than a dynamic import because ES imports need
// static names; Dashboard.jsx still uses the emoji `icon` field directly and is unaffected.
const BADGE_ICONS = {
  Rocket, FileText, Bot, UserCheck, Flame, Zap, Dumbbell, Gem, Crown, Medal, Award, Trophy,
  TrendingUp, Star, ArrowUpCircle, Library, Cog, Sunrise, Moon, CalendarDays,
  Footprints, Swords, UserPlus, Users, Megaphone, Siren, Brain, Layers, CalendarCheck,
}
```

### P0 · `profile-badge-tiles` — Profile badge browser: real badge art, locked badges drained of colour

> Do NOT keep the `ap-badge-tile-icon--locked` class: BadgeArt already dims locked badges, and the two multiply (0.45 × 0.45 ≈ 0.2).

**Replace**

```jsx
            const unlocked = earnedIds.includes(b.id)
            const Icon = BADGE_ICONS[b.lucideIcon]
            return (
              <div key={b.id} title={b.desc} className={`ap-badge-tile${unlocked ? ' ap-badge-tile--earned' : ''}`}>
                <div className={`ap-badge-tile-icon${unlocked ? '' : ' ap-badge-tile-icon--locked'}`}>
                  {Icon ? <Icon size={22} /> : b.icon}
                </div>
```
**With**

```jsx
            const unlocked = earnedIds.includes(b.id)
            return (
              <div key={b.id} title={b.desc} className={`ap-badge-tile${unlocked ? ' ap-badge-tile--earned' : ''}`}>
                <div className="ap-badge-tile-icon">
                  <BadgeArt id={b.id} size={56} earned={unlocked} />
                </div>
```

### P1 · `profile-milestone` — Streak-milestone modal: the matching streak badge instead of 👑💎💪⚡

**Replace**

```jsx
            <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>
              {milestoneStreak >= 100 ? '👑' : milestoneStreak >= 30 ? '💎' : milestoneStreak >= 14 ? '💪' : '⚡'}
            </div>
```
**With**

```jsx
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <BadgeArt
                id={milestoneStreak >= 100 ? 'streak_100' : milestoneStreak >= 30 ? 'streak_30' : milestoneStreak >= 14 ? 'streak_14' : 'streak_7'}
                size={104}
              />
            </div>
```

### P2 · `profile-subject-tile` — Profile → Your subjects: the subject tile instead of a 10px colour dot

**Replace**

```jsx
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: SUBJECT_COLOURS[s.name] || 'var(--accent)', flexShrink: 0 }} />
```
**With**

```jsx
                <SubjectTile subject={s.name} size={32} />
```

### P2 · `profile-colours-import` — Profile: SUBJECT_COLOURS is no longer used

**Replace**

```jsx
import { LEVELS, SUBJECT_COLOURS, getSubjectQualification } from '../data/subjects'
```
**With**

```jsx
import { LEVELS, getSubjectQualification } from '../data/subjects'
```

---

## `pages/PublicProfile.jsx`

**Owner:** no declared owner — main chat (closest workstream: Analytics / Progress) · **Swaps:** 4

**Add these imports**

```jsx
import BadgeArt from '../components/illustrations/BadgeArt'
import SubjectTile from '../components/illustrations/SubjectTile'
```
_(placement: after import { resolveProfileIcon } from '../data/themes' — anywhere among the other imports is fine)_

### P0 · `public-badge-imports` — Delete the lucide badge-icon imports and the BADGE_ICONS map

**Delete**

```jsx
import {
  Rocket, FileText, Bot, UserCheck, Flame, Dumbbell, Gem, Crown, Medal, Award, Trophy,
  TrendingUp, ArrowUpCircle, Library, Cog, Sunrise, Moon, CalendarDays,
  Footprints, Swords, UserPlus, Users, Megaphone, Siren, Brain, Layers, CalendarCheck,
} from 'lucide-react'

// Same badge icon lookup as Profile.jsx — see src/data/badges.js for the lucideIcon field.
const BADGE_ICONS = {
  Rocket, FileText, Bot, UserCheck, Flame, Zap, Dumbbell, Gem, Crown, Medal, Award, Trophy,
  TrendingUp, Star, ArrowUpCircle, Library, Cog, Sunrise, Moon, CalendarDays,
  Footprints, Swords, UserPlus, Users, Megaphone, Siren, Brain, Layers, CalendarCheck,
}
```

### P0 · `public-badge-chips` — Public profile badges: real badge art

**Replace**

```jsx
              {unlockedBadges.map(b => {
                const Icon = BADGE_ICONS[b.lucideIcon]
                return (
                  <div key={b.id} className="ap-badge-chip ap-badge-chip--earned" title={b.name + ': ' + b.desc}>
                    <span className="ap-badge-chip-icon">{Icon ? <Icon size={20} /> : b.icon}</span>
                  </div>
                )
              })}
```
**With**

```jsx
              {unlockedBadges.map(b => (
                <div key={b.id} className="ap-badge-chip ap-badge-chip--earned" title={b.name + ': ' + b.desc}>
                  <span className="ap-badge-chip-icon"><BadgeArt id={b.id} size={44} label={b.name} /></span>
                </div>
              ))}
```

### P3 · `public-subject-chips` — Public profile → Subjects: neutral chip with the subject tile instead of a solid colour pill

> Optional. It also removes the saturated white-on-colour pills (several of SUBJECT_COLOURS are purple).

**Replace**

```jsx
              {p.subjects.map(s => (
                <span key={s.name} className="badge" style={{
                  background: SUBJECT_COLOURS[s.name] || 'var(--accent)',
                  color:'#fff', borderColor:'transparent' }}>
                  {s.name}
                </span>
              ))}
```
**With**

```jsx
              {p.subjects.map(s => (
                <span key={s.name} className="badge badge-grey"
                  style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'4px 12px 4px 4px', borderRadius:999 }}>
                  <SubjectTile subject={s.name} size={28} />
                  {s.name}
                </span>
              ))}
```

### P3 · `public-colours-import` — PublicProfile: SUBJECT_COLOURS is no longer used

**Replace**

```jsx
import { LEVELS, SUBJECT_COLOURS } from '../data/subjects'
```
**With**

```jsx
import { LEVELS } from '../data/subjects'
```

---

## `components/BadgeAuditButton.jsx`

**Owner:** no declared owner — main chat · **Swaps:** 1

**Add these imports**

```jsx
import BadgeArt from './illustrations/BadgeArt'
```
_(placement: after import toast from 'react-hot-toast' — anywhere among the other imports is fine)_

### P0 · `audit-toast` — Retroactive-audit toast: badge art as the toast icon, no emoji

> react-hot-toast accepts any React node as `icon`.

**Replace**

```jsx
toast.success(`${badge.icon} Badge unlocked: ${badge.name} (+${badge.xp} XP)`, { duration: 4000 })
```
**With**

```jsx
toast.success(`Badge unlocked: ${badge.name} (+${badge.xp} XP)`, { duration: 4000, icon: <BadgeArt id={badge.id} size={28} /> })
```

---

## `components/LevelUpPopup.jsx`

**Owner:** no declared owner — main chat · **Swaps:** 1

**Add these imports**

```jsx
import { LazyIllustration } from './illustrations/lazy'
```
_(placement: after import { PartyPopper } from 'lucide-react' — anywhere among the other imports is fine)_

### P1 · `levelup` — Level-up pop-up: laurel medallion scene instead of 🎊

**Replace**

```jsx
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>🎊</div>
```
**With**

```jsx
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <LazyIllustration name="achievement" width={200} />
        </div>
```

---

## `components/OnboardingRecapPopup.jsx`

**Owner:** no declared owner — main chat · **Swaps:** 1

**Add these imports**

```jsx
import { LazyIllustration } from './illustrations/lazy'
```
_(placement: after import { Zap } from 'lucide-react' — anywhere among the other imports is fine)_

### P1 · `recap` — Onboarding recap pop-up: success scene instead of 🎉

**Replace**

```jsx
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>🎉</div>
```
**With**

```jsx
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <LazyIllustration name="success" width={180} />
        </div>
```

---

## `components/ReferralRewardPopup.jsx`

**Owner:** no declared owner — main chat · **Swaps:** 3

**Add these imports**

```jsx
import { LazyBadgeArt, LazyIllustration } from './illustrations/lazy'
```
_(placement: after import { Gift, X } from 'lucide-react' — anywhere among the other imports is fine)_

### P1 · `referral-copy` — Referral pop-up: Recruiter badge / welcome scene instead of 📣🚀

> The 🚀 row is the emoji profile avatar that is being unlocked, so it deliberately stays.

**Replace**

```jsx
const COPY = {
  referrer: {
    emoji: '📣',
    title: 'Referral successful!',
    body: 'Someone just joined RevisionFlow using your link.',
    rewards: [
      { icon: '⚡', label: '+200 XP' },
      { icon: '📣', label: 'Recruiter badge earned' },
      { icon: '🚀', label: 'Rocket icon unlocked' },
    ],
  },
  referred: {
    emoji: '🚀',
    title: 'Referral applied!',
```
**With**

```jsx
const COPY = {
  referrer: {
    badge: 'referral',          // the Recruiter badge they just earned
    title: 'Referral successful!',
    body: 'Someone just joined RevisionFlow using your link.',
    rewards: [
      { icon: <Zap size={18} />, label: '+200 XP' },
      { icon: <LazyBadgeArt id="referral" size={26} />, label: 'Recruiter badge earned' },
      { icon: '🚀', label: 'Rocket icon unlocked' },   // 🚀 stays: it IS the emoji avatar being unlocked
    ],
  },
  referred: {
    scene: 'welcome',
    title: 'Referral applied!',
```

### P1 · `referral-copy2` — Referral pop-up (referred side): lucide Zap for the XP row

**Replace**

```jsx
      { icon: '⚡', label: '+100 XP' },
      { icon: '🚀', label: 'Rocket icon unlocked' },
```
**With**

```jsx
      { icon: <Zap size={18} />, label: '+100 XP' },
      { icon: '🚀', label: 'Rocket icon unlocked' },
```

### P1 · `referral-art` — Referral pop-up: render the art

**Replace**

```jsx
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>{copy.emoji}</div>
```
**With**

```jsx
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          {copy.badge
            ? <LazyBadgeArt id={copy.badge} size={88} />
            : <LazyIllustration name={copy.scene} width={180} />}
        </div>
```

---

## `components/StreakCelebration.jsx`

**Owner:** no declared owner — main chat · **Swaps:** 5

**Add these imports**

```jsx
import { LazyIllustration } from './illustrations/lazy'
```
_(placement: after import { useState, useEffect } from 'react' — anywhere among the other imports is fine)_

### P1 · `streak-art` — Streak celebration: the streak scene instead of a wobbling 🔥

> The artwork is static on purpose. The card itself keeps its bounce, and the count keeps its pop.

**Replace**

```jsx
          {/* Fire emoji with wobble */}
          <div style={{
            fontSize: '5rem', lineHeight: 1, marginBottom: 8,
            animation: 'fireWobble 1.4s ease-in-out infinite',
            display: 'inline-block',
          }}>🔥</div>
```
**With**

```jsx
          {/* Seven plants, each a little taller than the last */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
            <LazyIllustration name="streak" width={220} />
          </div>
```

### P1 · `streak-wobble-css` — Streak celebration: delete the now-unused fireWobble keyframes

**Replace**

```jsx
        @keyframes fireWobble {
          0%,100% { transform: scale(1) rotate(-3deg); filter: brightness(1); }
          25%      { transform: scale(1.1) rotate(3deg); filter: brightness(1.3); }
          75%      { transform: scale(0.95) rotate(-1deg); filter: brightness(0.95); }
        }
```
**With**

```jsx

```

### P1 · `streak-copy1` — Streak celebration copy: drop emoji

**Replace**

```jsx
Day Streak! 🎉
```
**With**

```jsx
Day streak!
```

### P1 · `streak-copy2` — Streak celebration copy: drop emoji

**Replace**

```jsx
You're absolutely crushing it. Legendary focus! 💪
```
**With**

```jsx
You're absolutely crushing it. Legendary focus!
```

### P1 · `streak-copy3` — Streak celebration copy: drop emoji

**Replace**

```jsx
Keep it up! 💪
```
**With**

```jsx
Keep it up!
```

---

## `pages/NotFound.jsx`

**Owner:** no declared owner — main chat · **Swaps:** 2

### P1 · `notfound-import` — NotFound: imports

**Replace**

```jsx
import { Compass, ArrowLeft } from 'lucide-react'
```
**With**

```jsx
import { ArrowLeft } from 'lucide-react'
import Illustration from '../components/illustrations/Illustration'
```

### P1 · `notfound-art` — 404 page: the "missing page" scene instead of a compass tile

**Replace**

```jsx
      <div style={{
        width: 64, height: 64, borderRadius: 'var(--radius-lg)',
        background: 'var(--accent-pale)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
      }}>
        <Compass size={30} />
      </div>
```
**With**

```jsx
      <Illustration name="notFound" width={260} />
```

---

## `components/ErrorBoundary.jsx`

**Owner:** Global / infrastructure chat (shared file) · **Swaps:** 1

### P1 · `errorboundary` — ErrorBoundary: calm error scene, theme tokens, no purple button

> ErrorBoundary is defined but NEVER MOUNTED: nothing imports it. See the next patch.

**Replace**

```jsx
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('RevisionFlow caught error:', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg, #0f0f0f)', color: 'var(--text-primary, #fff)',
          padding: '2rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ color: '#aaa', marginBottom: '1.5rem', maxWidth: 400 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload() }}
            style={{
              background: '#6c63ff', color: 'white', border: 'none',
              borderRadius: 8, padding: '0.65rem 1.5rem', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.95rem',
            }}
          >
            Reload app
          </button>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              marginTop: '0.75rem', background: 'transparent',
              color: '#aaa', border: 'none', cursor: 'pointer', fontSize: '0.85rem',
            }}
          >
            Try without reloading
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
```
**With**

```jsx
import { Component } from 'react'
import { LazyIllustration } from './illustrations/lazy'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('RevisionFlow caught error:', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-base, #0c0f0d)', color: 'var(--text-primary, #fff)',
          padding: '2rem', textAlign: 'center',
        }}>
          {/* Lazy + self-guarded: this screen must never throw, or the user is back to a blank page. */}
          <LazyIllustration name="error" width={240} />
          <h2 style={{ margin: '0.5rem 0' }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-secondary, #aaa)', marginBottom: '1.5rem', maxWidth: 400 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => { this.setState({ error: null }); window.location.reload() }}
          >
            Reload app
          </button>
          <button
            className="btn btn-ghost"
            style={{ marginTop: '0.75rem' }}
            onClick={() => this.setState({ error: null })}
          >
            Try without reloading
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
```

---

## `main.jsx`

**Owner:** Global / infrastructure chat (shared file) · **Swaps:** 1

### P1 · `main-mount-eb` — Mount ErrorBoundary (currently dead code: a render error gives a blank page)

**Replace**

```jsx
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```
**With**

```jsx
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
```

---

## `pages/Pro.jsx`

**Owner:** Pro / Monetisation chat · **Swaps:** 1

**Add these imports**

```jsx
import Illustration from '../components/illustrations/Illustration'
```
_(placement: after import { Check, Lock, Crown, ArrowLeft, RotateCcw, Code2, GraduationCap } from 'lucide-rea — anywhere among the other imports is fine)_

### P2 · `pro-success` — Pro activated screen: achievement scene instead of a gold crown circle

**Replace**

```jsx
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: 'var(--gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Crown size={32} color="#fff" />
          </div>
          <h2 style={{ marginBottom: 8 }}>
            {isBeta ? 'You have lifetime Pro access ✨' : 'Welcome to RevisionFlow Pro! 🎉'}
          </h2>
```
**With**

```jsx
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <Illustration name="achievement" width={220} />
          </div>
          <h2 style={{ marginBottom: 8 }}>
            {isBeta ? 'You have lifetime Pro access' : 'Welcome to RevisionFlow Pro!'}
          </h2>
```

---

## `pages/Onboarding.jsx`

**Owner:** Onboarding chat · **Swaps:** 6

**Add these imports**

```jsx
import Illustration from '../components/illustrations/Illustration'
import SubjectTile from '../components/illustrations/SubjectTile'
```
_(placement: after import Illustration from '../components/illustrations/Illustration'; after import { Zap, Plus, X, ChevronRight, ChevronLeft, Check, Brain, Sparkles } from 'lucide-re — anywhere among the other imports is fine)_

### P2 · `onb-stepicons` — Onboarding: delete STEP_ICONS (declared, never used)

**Replace**

```jsx
const STEP_ICONS = ['👋','🎓','📚','🎯','📅','🤖','👥','🎉']
```
**With**

```jsx

```

### P2 · `onb-step0` — Onboarding step 1: welcome scene instead of 👋

**Replace**

```jsx
              <div style={{ fontSize:'3.5rem', marginBottom:12 }}>👋</div>
```
**With**

```jsx
              <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}><Illustration name="welcome" width={200} /></div>
```

### P2 · `onb-step6` — Onboarding friends step: friends scene instead of 👥

**Replace**

```jsx
              <div style={{ fontSize:'3rem', marginBottom:12 }}>👥</div>
```
**With**

```jsx
              <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}><Illustration name="friends" width={200} /></div>
```

### P2 · `onb-step7` — Onboarding done step: success scene instead of 🎉

**Replace**

```jsx
              <div style={{ fontSize:'4rem', marginBottom:12, position:'relative', zIndex:1 }}>🎉</div>
```
**With**

```jsx
              <div style={{ display:'flex', justifyContent:'center', marginBottom:8, position:'relative', zIndex:1 }}><Illustration name="success" width={200} /></div>
```

### P3 · `onb-subject-chip` — Onboarding subject chips: room for the tile (padding)

**Replace**

```jsx
                      display:'flex', alignItems:'center', gap:6, padding:'6px 12px',
                      borderRadius:999, fontWeight:700, fontSize:'0.8rem',
```
**With**

```jsx
                      display:'flex', alignItems:'center', gap:6, padding:'4px 12px 4px 4px',
                      borderRadius:999, fontWeight:700, fontSize:'0.8rem',
```

### P3 · `onb-subject-chip2` — Onboarding subject chips: the subject tile in front of the name

> Optional. Keep the chip's own colours; the tile is neutral.

**Replace**

```jsx
                      animation:'chipIn 0.25s ease',
                    }}>
                      {s.name}
```
**With**

```jsx
                      animation:'chipIn 0.25s ease',
                    }}>
                      <SubjectTile subject={s.name} size={28} />
                      {s.name}
```

---

## `pages/Friends.jsx`

**Owner:** no declared owner — main chat · **Swaps:** 1

**Add these imports**

```jsx
import EmptyState from '../components/illustrations/EmptyState'
```
_(placement: after the `lucide-react` import — anywhere among the other imports is fine)_

### P2 · `friends-empty` — Friends: "No friends yet"

_snapshot line ≈ 200_

**Replace**

```jsx
          <div className="empty-state">
            <div className="ap-icon-circle" style={{ width: 56, height: 56 }}><Users size={26} /></div>
            <h4>No friends yet</h4>
            <p>Share your referral link above or search by username to add friends.</p>
          </div>
```
**With**

```jsx
          <EmptyState
            art="friends"
            title="No friends yet"
            body="Share your referral link above or search by username to add friends."
          />
```

---

## `pages/Leaderboard.jsx`

**Owner:** no declared owner — main chat · **Swaps:** 1

**Add these imports**

```jsx
import EmptyState from '../components/illustrations/EmptyState'
```
_(placement: after the `lucide-react` import — anywhere among the other imports is fine)_

### P2 · `leaderboard-empty` — Leaderboard: empty board (friends / global, by period)

_snapshot line ≈ 194_

**Replace**

```jsx
        <div className="empty-state">
          {tab === 'friends' ? (
            <>
              <div className="ap-icon-circle" style={{ width: 56, height: 56 }}><Users size={26} /></div>
              <p>{period === 'allTime' ? 'No friends yet — add friends to see them here!' : `No friend XP logged ${periodLabel} yet.`}</p>
              {period === 'allTime' && <Link to="/friends" className="btn btn-primary btn-sm">Find friends</Link>}
            </>
          ) : (
            <>
              <div className="ap-icon-circle" style={{ width: 56, height: 56 }}><Globe size={26} /></div>
              <p>{period === 'allTime' ? 'Global board loading…' : `No one has earned XP ${periodLabel} yet — be the first!`}</p>
            </>
          )}
        </div>
```
**With**

```jsx
        <EmptyState
          art={tab === 'friends' ? 'friends' : 'leaderboard'}
          title={tab === 'friends'
            ? (period === 'allTime' ? 'No friends yet' : `No friend XP logged ${periodLabel} yet`)
            : (period === 'allTime' ? 'Global board loading…' : `No one has earned XP ${periodLabel} yet`)}
          body={tab === 'friends'
            ? (period === 'allTime' ? 'Add friends to see them here.' : undefined)
            : (period === 'allTime' ? undefined : 'Be the first!')}
          action={tab === 'friends' && period === 'allTime'
            ? <Link to="/friends" className="btn btn-primary btn-sm">Find friends</Link>
            : undefined}
        />
```

---

## `pages/AIAdvisor.jsx`

**Owner:** no declared owner — main chat · **Swaps:** 3

**Add these imports**

```jsx
import EmptyState from '../components/illustrations/EmptyState'
import Illustration from '../components/illustrations/Illustration'
```
_(placement: after the `lucide-react` import — anywhere among the other imports is fine)_

### P2 · `ai-chat-empty` — AI Advisor chat (no messages yet): assistant scene instead of a compass tile

**Replace**

```jsx
<div className="ap-chat-empty-icon"><Compass size={24} /></div>
```
**With**

```jsx
<Illustration name="assistant" width={190} />
```

### P2 · `ai-plan-empty` — AI Advisor plan tab: nothing generated yet

_snapshot line ≈ 534_

**Replace**

```jsx
            <div className="empty-state">
              <div className="ap-icon-circle" style={{width:56,height:56}}><TrendingUp size={26} /></div>
              <p>Click Generate to build your personalised revision plan</p>
              <p style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>Uses your exam dates, subjects, and grade targets</p>
            </div>
```
**With**

```jsx
            <EmptyState
              art="emptyPlan"
              size="sm"
              as="p"
              title="Click Generate to build your personalised revision plan"
              body="Uses your exam dates, subjects, and grade targets"
            />
```

### P2 · `ai-resources-empty` — AI Advisor resources tab: no subjects

_snapshot line ≈ 440_

**Replace**

```jsx
            <div className="empty-state">
              <div className="ap-icon-circle" style={{width:56,height:56}}><BookOpen size={26} /></div>
              <p>Add subjects in Settings to get personalised resources</p>
            </div>
```
**With**

```jsx
            <EmptyState art="resources" size="sm" as="p" title="Add subjects in Settings to get personalised resources" />
```

---

## `pages/Topics.jsx`

**Owner:** no declared owner — main chat (closest workstream: Study) · **Swaps:** 5

**Add these imports**

```jsx
import EmptyState from '../components/illustrations/EmptyState'
```
_(placement: after the `lucide-react` import — anywhere among the other imports is fine)_

### P2 · `topics-nomatch-topics` — Topics: no topics match the search or filter

_snapshot line ≈ 630_

**Replace**

```jsx
                      <div className="empty-state">
                        <Search size={28} style={{opacity:0.3}}/>
                        <p>No topics match your search or filter</p>
                      </div>
```
**With**

```jsx
                      <EmptyState art="notFound" size="sm" as="p" title="No topics match your search or filter" />
```

### P2 · `topics-notes` — Topics: no notes yet for the subject

_snapshot line ≈ 522_

**Replace**

```jsx
                          <div className="empty-state" style={{padding:'20px 0'}}>
                            <StickyNote size={28} style={{opacity:0.3}}/>
                            <p style={{fontSize:'0.875rem'}}>No notes yet for {selSubj}</p>
                          </div>
```
**With**

```jsx
                          <EmptyState art="emptyNotes" size="sm" as="p" title={`No notes yet for ${selSubj}`} />
```

### P2 · `topics-nomatch-subjects` — Topics: no subjects match the search

_snapshot line ≈ 414_

**Replace**

```jsx
              <div className="empty-state">
                <Search size={28} style={{opacity:0.3}}/>
                <p>No subjects match "{search}"</p>
              </div>
```
**With**

```jsx
              <EmptyState art="notFound" size="sm" as="p" title={`No subjects match "${search}"`} />
```

### P2 · `topics-nosubjects` — Topics: no subjects added yet

_snapshot line ≈ 373_

**Replace**

```jsx
        <div className="empty-state">
          <GraduationCap size={40} className="topics-empty-illustration" style={{opacity:0.35}} />
          <p>Add your subjects to start tracking topics</p>
          <button className="btn btn-primary" onClick={()=>navigate('/settings')}>Go to settings</button>
        </div>
```
**With**

```jsx
        <EmptyState
          art="welcome"
          title="Add your subjects to start tracking topics"
          action={<button className="btn btn-primary" onClick={()=>navigate('/settings')}>Go to settings</button>}
        />
```

### P2 · `topics-subject-art` — Topics: "no topics yet" shows the subject picture at a readable size, not at 40% opacity

**Replace**

```jsx
<SubjectIllustration size={64} className="topics-empty-illustration" style={{opacity:0.4}}/>
```
**With**

```jsx
<SubjectIllustration size={120} className="topics-empty-illustration"/>
```

**Then remove the now-unused lucide imports:** `GraduationCap` (only if nothing else in the file uses them).

---

## `pages/Analytics.jsx`

**Owner:** Analytics / Progress chat · **Swaps:** 5

**Add these imports**

```jsx
import EmptyState from '../components/illustrations/EmptyState'
```
_(placement: after the `lucide-react` import — anywhere among the other imports is fine)_

### P2 · `analytics-nopapers` — Analytics: no papers logged

_snapshot line ≈ 642_

**Replace**

```jsx
            <div className="empty-state" style={{ padding: '16px 0' }}><p>No papers logged yet — log papers in Past Papers</p></div>
```
**With**

```jsx
            <EmptyState
              art="emptyPapers"
              size="sm"
              as="p"
              title="No papers logged yet"
              body="Log papers in Past Papers to see your scores here."
            />
```

### P2 · `analytics-trajectory` — Analytics: not enough papers for a trajectory

_snapshot line ≈ 626_

**Replace**

```jsx
            <div className="empty-state" style={{ padding: '16px 0' }}><p>Log at least 2 papers for {gradeSub} to see your trajectory</p></div>
```
**With**

```jsx
            <EmptyState
              art="emptyAnalytics"
              size="sm"
              as="p"
              title="Not enough papers yet"
              body={`Log at least 2 papers for ${gradeSub} to see your trajectory.`}
            />
```

### P2 · `analytics-noconfidence` — Analytics: no confidence ratings

_snapshot line ≈ 545_

**Replace**

```jsx
            <div className="empty-state" style={{ padding: '16px 0' }}>
              <Brain size={32} style={{ opacity: 0.3 }} />
              <p>Rate topics in the Topics page to see your confidence breakdown</p>
            </div>
```
**With**

```jsx
            <EmptyState
              art="emptyAnalytics"
              size="sm"
              as="p"
              title="No confidence ratings yet"
              body="Rate topics in the Topics page to see your confidence breakdown."
            />
```

### P2 · `analytics-nosessions` — Analytics: no sessions logged

_snapshot line ≈ 468_

**Replace**

```jsx
            <div className="empty-state" style={{ padding: '16px 0' }}><p>No sessions logged yet</p></div>
```
**With**

```jsx
            <EmptyState art="emptySessions" size="sm" as="p" title="No sessions logged yet" />
```

### P2 · `analytics-nocompleted` — Analytics: no completed sessions in the period

_snapshot line ≈ 348_

**Replace**

```jsx
            <div className="empty-state" style={{ padding: '16px 0' }}><p>No completed sessions in this period</p></div>
```
**With**

```jsx
            <EmptyState art="emptyAnalytics" size="sm" as="p" title="No completed sessions in this period" />
```

---

## `pages/TopicDetail.jsx`

**Owner:** no declared owner — main chat (closest workstream: Study) · **Swaps:** 5

**Add these imports**

```jsx
import EmptyState from '../components/illustrations/EmptyState'
```
_(placement: after the `lucide-react` import — anywhere among the other imports is fine)_

### P2 · `topicdetail-papers` — Topic detail: no past-paper questions tagged

_snapshot line ≈ 632_

**Replace**

```jsx
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <ClipboardList size={28} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: '0.875rem' }}>No logged past-paper questions tagged with this topic yet</p>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/papers')}>Log a past paper</button>
            </div>
```
**With**

```jsx
            <EmptyState
              art="emptyPapers"
              size="sm"
              as="p"
              title="No logged past-paper questions tagged with this topic yet"
              action={<button className="btn btn-secondary btn-sm" onClick={() => navigate('/papers')}>Log a past paper</button>}
            />
```

### P2 · `topicdetail-questions` — Topic detail: generate exam-style questions prompt

_snapshot line ≈ 615_

**Replace**

```jsx
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <Brain size={28} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: '0.875rem' }}>Generate exam-style questions for exactly this topic</p>
            </div>
```
**With**

```jsx
            <EmptyState art="emptyPapers" size="sm" as="p" title="Generate exam-style questions for exactly this topic" />
```

### P2 · `topicdetail-notes` — Topic detail: no notes

_snapshot line ≈ 566_

**Replace**

```jsx
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <StickyNote size={28} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: '0.875rem' }}>No notes yet on {displayName}</p>
            </div>
```
**With**

```jsx
            <EmptyState art="emptyNotes" size="sm" as="p" title={`No notes yet on ${displayName}`} />
```

### P2 · `topicdetail-guide-failed` — Topic detail: guide failed to load (calm error scene)

_snapshot line ≈ 524_

**Replace**

```jsx
            <div className="empty-state">
              <BookOpen size={32} style={{ opacity: 0.3 }} />
              <p>Couldn't load a guide for this topic — check your connection and try again.</p>
              <button className="btn btn-primary btn-sm" onClick={() => loadGuide(false)}>Try again</button>
            </div>
```
**With**

```jsx
            <EmptyState
              art="error"
              size="sm"
              as="p"
              title="Couldn't load a guide for this topic"
              body="Check your connection and try again."
              action={<button className="btn btn-primary btn-sm" onClick={() => loadGuide(false)}>Try again</button>}
            />
```

### P2 · `topicdetail-missing` — Topic detail: topic not found

_snapshot line ≈ 297_

**Replace**

```jsx
      <div className="fade-in empty-state">
        <ClipboardList size={32} style={{ opacity: 0.35 }} />
        <p>That topic couldn't be found — it may have been deleted.</p>
        <button className="btn btn-primary" onClick={() => navigate('/topics')}>Back to topics</button>
      </div>
```
**With**

```jsx
      <EmptyState
        className="fade-in"
        art="notFound"
        title="That topic couldn't be found"
        body="It may have been deleted."
        action={<button className="btn btn-primary" onClick={() => navigate('/topics')}>Back to topics</button>}
      />
```

---

## `pages/Calendar.jsx`

**Owner:** no declared owner — main chat (closest workstream: Dashboard / Navigation) · **Swaps:** 10

**Add these imports**

```jsx
import EmptyState from '../components/illustrations/EmptyState'
import SubjectTile from '../components/illustrations/SubjectTile'
```
_(placement: after the `lucide-react` import — anywhere among the other imports is fine)_

### P2 · `calendar-recs` — Calendar: no recommendations

_snapshot line ≈ 756_

**Replace**

```jsx
              <div className="empty-state" style={{padding:'18px 0'}}>
                <CheckCircle2 size={26} style={{opacity:0.35}}/>
                <p style={{fontSize:'0.85rem'}}>
                  {recommendations.length === 0
                    ? 'Nothing stands out right now — rate a few topics in Topics to get personalised suggestions here.'
                    : 'No recommendations for that subject right now.'}
                </p>
              </div>
```
**With**

```jsx
              <EmptyState
                art="emptyAnalytics"
                size="sm"
                as="p"
                title={recommendations.length === 0
                  ? 'Nothing stands out right now — rate a few topics in Topics to get personalised suggestions here.'
                  : 'No recommendations for that subject right now.'}
              />
```

### P2 · `calendar-upcoming` — Calendar: nothing coming up

_snapshot line ≈ 674_

**Replace**

```jsx
                <div className="empty-state" style={{padding:'28px 0'}}>
                  <CalendarDays size={28} style={{opacity:0.35}}/>
                  <p style={{fontSize:'0.875rem'}}>Nothing coming up yet</p>
                  <p style={{fontSize:'0.78rem'}}>Add a session, or set your exam dates so they show up here.</p>
                </div>
```
**With**

```jsx
                <EmptyState
                  art="emptyExams"
                  size="sm"
                  as="p"
                  title="Nothing coming up yet"
                  body="Add a session, or set your exam dates so they show up here."
                />
```

### P2 · `calendar-day` — Calendar: nothing scheduled on the selected day

_snapshot line ≈ 639_

**Replace**

```jsx
                <div className="empty-state" style={{padding:'28px 0'}}>
                  <CalendarX2 size={28} style={{opacity:0.35}}/>
                  <p style={{fontSize:'0.875rem'}}>Nothing scheduled on this day</p>
                  <button className="btn btn-primary btn-sm" onClick={()=>{setAddPrefill(null);setShowAdd(true)}}>Add session</button>
                </div>
```
**With**

```jsx
                <EmptyState
                  art="emptySessions"
                  size="sm"
                  as="p"
                  title="Nothing scheduled on this day"
                  action={<button className="btn btn-primary btn-sm" onClick={()=>{setAddPrefill(null);setShowAdd(true)}}>Add session</button>}
                />
```

### P2 · `calendar-exam-tile` — Calendar → selected day → exam row: the subject tile

> The row title already says "{subject} exam", so the graduation-cap glyph adds nothing.

**Replace**

```jsx
<div className="rf-upcoming-icon" style={{background:subjectColour(e.subject)}}><GraduationCap size={15}/></div>
```
**With**

```jsx
<SubjectTile subject={e.subject} size={32} />
```

### P2 · `calendar-upcoming-itemicon` — Calendar → Upcoming: ItemIcon is no longer needed

**Replace**

```jsx
                    const ItemIcon = item.kind==='exam' ? GraduationCap : item.kind==='task' ? ListTodo : getSubjectIcon(item.subject)
```
**With**

```jsx

```

### P2 · `calendar-upcoming-tile` — Calendar → Upcoming: the subject tile for exams and sessions (tasks keep their list icon)

> Exams stay recognisable from the countdown on the right (`rf-upcoming-when`).

**Replace**

```jsx
                        <div className="rf-upcoming-icon" style={{background: item.subject ? subjectColour(item.subject) : 'var(--text-muted)'}}>
                          <ItemIcon size={15}/>
                        </div>
```
**With**

```jsx
                        {item.kind==='task' || !item.subject
                          ? <div className="rf-upcoming-icon" style={{background: item.subject ? subjectColour(item.subject) : 'var(--text-muted)'}}><ListTodo size={15}/></div>
                          : <SubjectTile subject={item.subject} size={32} />}
```

### P2 · `calendar-rec-tile` — Calendar → recommended topics: the subject tile

**Replace**

```jsx
                      <div className="rf-rec-icon" style={{background:subjectColour(rec.subject)}}>
                        {React.createElement(getSubjectIcon(rec.subject), {size:15})}
                      </div>
```
**With**

```jsx
                      <SubjectTile subject={rec.subject} size={32} />
```

### P2 · `calendar-sessioncard-tile` — Calendar → session card: the subject tile (tasks keep their list icon)

**Replace**

```jsx
      <div style={{width:32,height:32,borderRadius:9,background:accent,flexShrink:0,
        display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>
        <Icon size={15}/>
      </div>
```
**With**

```jsx
      {s.isTask
        ? <div style={{width:32,height:32,borderRadius:9,background:accent,flexShrink:0,
            display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}><ListTodo size={15}/></div>
        : <SubjectTile subject={s.subject} size={32} />}
```

### P2 · `calendar-sessioncard-icon` — Calendar → session card: Icon is no longer needed

**Replace**

```jsx
  const Icon   = s.isTask ? ListTodo : getSubjectIcon(s.subject)
```
**With**

```jsx

```

### P2 · `calendar-icon-import` — Calendar: getSubjectIcon is no longer used

**Replace**

```jsx
import { getSubjectIcon } from '../utils/subjectIcons'
```
**With**

```jsx

```

**Then remove the now-unused lucide imports:** `CalendarX2` (only if nothing else in the file uses them).

---

## `pages/Study.jsx`

**Owner:** Study chat · **Swaps:** 8

**Add these imports**

```jsx
import EmptyState from '../components/illustrations/EmptyState'
import SubjectTile from '../components/illustrations/SubjectTile'
```
_(placement: after the `lucide-react` import — anywhere among the other imports is fine)_

### P2 · `study-questions` — Study: exam-style questions intro

_snapshot line ≈ 3195_

**Replace**

```jsx
            <div className="empty-state">
              <div className="rf-hero-icon" style={{ background: 'var(--accent-pale)', color: 'var(--accent)' }}><ClipboardList size={26}/></div>
              <h4>Generate exam-style questions</h4>
              <p style={{ maxWidth: 360, textAlign: 'center', fontSize: '0.875rem' }}>
                Select your subject, board, and topic above. Try answering each one yourself, then reveal the mark scheme when you're ready.
              </p>
            </div>
```
**With**

```jsx
            <EmptyState
              art="emptyPapers"
              title="Generate exam-style questions"
              body="Select your subject, board, and topic above. Try answering each one yourself, then reveal the mark scheme when you're ready."
            />
```

### P2 · `study-pubsets` — Study: no public sets / filters match

_snapshot line ≈ 2971_

**Replace**

```jsx
                  <div className="empty-state">
                    <Users size={32} style={{ opacity: 0.3 }} />
                    {pubSets.length === 0 ? <p>No public sets yet — be the first to share one!</p> : (
                      <>
                        <p>No sets match those filters</p>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setPubBoardFilter(''); setPubLevelFilter('') }}>Clear board/level filters</button>
                      </>
                    )}
                  </div>
```
**With**

```jsx
                  <EmptyState
                    art="emptyFlashcards"
                    size="sm"
                    as="p"
                    title={pubSets.length === 0 ? 'No public sets yet — be the first to share one!' : 'No sets match those filters'}
                    action={pubSets.length === 0 ? undefined : (
                      <button className="btn btn-secondary btn-sm" onClick={() => { setPubBoardFilter(''); setPubLevelFilter('') }}>Clear board/level filters</button>
                    )}
                  />
```

### P2 · `study-nosets2` — Study: flashcards, no saved sets (with the three actions)

_snapshot line ≈ 2908_

**Replace**

```jsx
                  <div className="empty-state">
                    <div className="rf-hero-icon" style={{ background: 'var(--accent-pale)', color: 'var(--accent)' }}><Layers size={26}/></div>
                    <p>No saved sets yet</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => setFlashTab('generate')}>Generate with AI</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setShowCreate(true)}>Create manually</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setShowPaste(true)}><ClipboardList size={13}/> Import</button>
                    </div>
                  </div>
```
**With**

```jsx
                  <EmptyState
                    art="emptyFlashcards"
                    title="No saved sets yet"
                    action={<>
                      <button className="btn btn-primary btn-sm" onClick={() => setFlashTab('generate')}>Generate with AI</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setShowCreate(true)}>Create manually</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setShowPaste(true)}><ClipboardList size={13}/> Import</button>
                    </>}
                  />
```

### P2 · `study-marker` — Study: marked result placeholder

_snapshot line ≈ 2521_

**Replace**

```jsx
            <div className="card empty-state" style={{ padding: '48px 24px' }}>
              <div className="rf-hero-icon" style={{ background: 'var(--accent-pale)', color: 'var(--accent)' }}><PenLine size={26}/></div>
              <h4>Your marked result appears here</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: 280, textAlign: 'center' }}>
                Fill in the form, paste your answer, and hit Mark. You get awarded marks, what was missing, examiner annotation, and how to improve.
              </p>
            </div>
```
**With**

```jsx
            <EmptyState
              className="card"
              art="emptyMistakes"
              title="Your marked result appears here"
              body="Fill in the form, paste your answer, and hit Mark. You get awarded marks, what was missing, examiner annotation, and how to improve."
              style={{ padding: '48px 24px' }}
            />
```

### P2 · `study-nopublic` — Study: no public sets for the subject

_snapshot line ≈ 1625_

**Replace**

```jsx
            <div className="empty-state" style={{ padding: '16px 0' }}>
              <Users size={32} style={{ opacity: 0.3 }} />
              <p>No public sets for this subject yet</p>
            </div>
```
**With**

```jsx
            <EmptyState art="emptyFlashcards" size="sm" as="p" title="No public sets for this subject yet" />
```

### P2 · `study-nosets` — Study: no saved flashcard sets (my sets tab)

_snapshot line ≈ 1588_

**Replace**

```jsx
            <div className="empty-state" style={{ padding: '16px 0' }}>
              <BookOpen size={32} style={{ opacity: 0.3 }} />
              <p>No saved sets yet — generate or create flashcards first</p>
            </div>
```
**With**

```jsx
            <EmptyState art="emptyFlashcards" size="sm" as="p" title="No saved sets yet" body="Generate or create flashcards first." />
```

### P2 · `study-set-tiles` — Study → flashcard sets (my sets · public sets · saved-set cards): the subject tile instead of a coloured square with a lucide icon

_snapshot line ≈ 1604_

> The same 4-line square appears 3 times (pristine-snapshot lines 1604, 1641, 2923) — replace all three. `getSubjectIcon` is then unused in Study.jsx: delete its import (next swap). `subjectColour` is still used elsewhere in the file.

**Replace**

```jsx
                      <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: subjectColour(set.subject),
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        {React.createElement(getSubjectIcon(set.subject), { size: 15 })}
                      </div>
```
**With**

```jsx
<SubjectTile subject={set.subject} size={32} />
```

### P2 · `study-icon-import` — Study: getSubjectIcon is no longer used

**Replace**

```jsx
import { getSubjectIcon } from '../utils/subjectIcons'
```
**With**

```jsx

```

---

## `pages/PastPapers.jsx`

**Owner:** Analytics / Progress chat · **Swaps:** 2

**Add these imports**

```jsx
import EmptyState from '../components/illustrations/EmptyState'
```
_(placement: after the `lucide-react` import — anywhere among the other imports is fine)_

### P2 · `papers-empty` — Past papers: nothing logged yet

**Replace**

```jsx
<div className="empty-state"><FileText size={40} style={{opacity:0.3}}/><h4>No papers logged</h4><button className="btn btn-primary" onClick={()=>setShowAdd(true)}>Log your first paper</button></div>
```
**With**

```jsx
<EmptyState art="emptyPapers" title="No papers logged" body="Log a paper to see your grade, your trend and where marks were lost." action={<button className="btn btn-primary" onClick={()=>setShowAdd(true)}>Log your first paper</button>} />
```

### P2 · `papers-graph` — Past papers: not enough papers for the graph

**Replace**

```jsx
<div className="empty-state"><p>Log at least 2 papers to see a progress graph</p></div>
```
**With**

```jsx
<EmptyState art="emptyAnalytics" size="sm" as="p" title="Log at least 2 papers to see a progress graph" />
```

**Then remove the now-unused lucide imports:** `FileText` (only if nothing else in the file uses them).

---

## `pages/Landing.jsx`

**Owner:** Landing chat · **Swaps:** 2

### P2 · `landing-hero` — Landing hero preview: SubjectIllustration instead of the CellIllustration shim

> Then delete CellIllustration.jsx.

**Replace**

```jsx
<CellIllustration size={88} style={{flexShrink:0}}/>
```
**With**

```jsx
<SubjectIllustration subject="Biology" size={88} style={{flexShrink:0}}/>
```

### P2 · `landing-hero-import` — Landing: import

**Replace**

```jsx
import CellIllustration from '../components/illustrations/CellIllustration'
```
**With**

```jsx
import SubjectIllustration from '../components/illustrations/SubjectIllustration'
```

---

## `pages/Settings.jsx`

**Owner:** no declared owner — main chat · **Swaps:** 1

**Add these imports**

```jsx
import SubjectTile from '../components/illustrations/SubjectTile'
```
_(placement: after import BoardOptions from '../components/BoardOptions' — anywhere among the other imports is fine)_

### P2 · `settings-subject-tile` — Settings → Your subjects: a tile in front of each subject name

> `.ap-subject-row-id` is already a flex row with a gap and min-width:0, so nothing else changes. The tile is aria-hidden because the name is printed next to it.

**Replace**

```jsx
                  <div className="ap-subject-row-id">
                    <span className="ap-subject-row-name">{s.name}</span>
```
**With**

```jsx
                  <div className="ap-subject-row-id">
                    <SubjectTile subject={s.name} size={32} />
                    <span className="ap-subject-row-name">{s.name}</span>
```
