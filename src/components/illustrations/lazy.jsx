// src/components/illustrations/lazy.jsx
// ─────────────────────────────────────────────────────────────────────────────
//   import { LazyIllustration, LazyBadgeArt } from '../components/illustrations/lazy'
//
//   <LazyIllustration name="achievement" width={200} />
//   <LazyBadgeArt id="streak_7" size={88} />
//
// Same props as <Illustration/> and <BadgeArt/>, but the artwork is a separate chunk that is only
// downloaded when the component first renders.
//
// WHEN TO USE WHICH
//  • Route pages (anything in App.jsx's lazy() list): import Illustration / BadgeArt / EmptyState
//    directly. The page chunk already loads on demand, so the art simply rides along with it.
//  • Anything mounted in the app shell — App.jsx imports XPToast, StreakCelebration,
//    ReferralRewardPopup, LevelUpPopup, OnboardingRecapPopup statically, and ErrorBoundary would be
//    imported in main.jsx — use THESE wrappers. A direct import would put the whole scene registry
//    (~7 kB gzip) in the bundle every visitor downloads, to serve pop-ups most people see rarely.
//
// Behaviour
//  • While the chunk loads, an empty box of the final size is shown, so the layout never jumps.
//  • If the chunk fails to load (offline, stale cache after a deploy), the art is simply omitted.
//    The pop-up around it still works. This matters most for ErrorBoundary: its fallback must never
//    throw, or the user is back to a blank page.
// ─────────────────────────────────────────────────────────────────────────────
import React, { Component, Suspense, lazy } from 'react'

const Illustration = lazy(() => import('./Illustration'))
const BadgeArt = lazy(() => import('./BadgeArt'))

class ArtBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error) {
    if (typeof console !== 'undefined') console.warn('[illustrations] artwork not shown:', error && error.message)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function Placeholder({ width, height }) {
  // Inline styles on purpose: illustrations.css is part of the lazy chunk and is not loaded yet.
  return <span aria-hidden="true" style={{ display: 'inline-block', width, height, maxWidth: '100%' }} />
}

/** <Illustration/> in its own chunk. Scenes are 4:3, so the placeholder is width × 0.75. */
export function LazyIllustration({ width = 280, height, ...props }) {
  const h = height ?? Math.round((width * 3) / 4)
  return (
    <ArtBoundary>
      <Suspense fallback={<Placeholder width={width} height={h} />}>
        <Illustration width={width} height={height} {...props} />
      </Suspense>
    </ArtBoundary>
  )
}

/** <BadgeArt/> in its own chunk. Badges are square. */
export function LazyBadgeArt({ size = 64, ...props }) {
  return (
    <ArtBoundary>
      <Suspense fallback={<Placeholder width={size} height={size} />}>
        <BadgeArt size={size} {...props} />
      </Suspense>
    </ArtBoundary>
  )
}
