// src/components/PWAInstallBanner.jsx
// Shows a subtle "Add to Home Screen" banner when the browser fires
// the beforeinstallprompt event (Chrome/Edge/Android).
// iOS doesn't fire that event so we show a manual instruction instead.

import React, { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'

export function usePWAInstall() {
  const [prompt, setPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }
    function handler(e) {
      e.preventDefault()
      setPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function install() {
    if (!prompt) return false
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setPrompt(null)
    return outcome === 'accepted'
  }

  return { prompt, installed, install }
}

// Detect iOS
function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !window.MSStream
}

export default function PWAInstallBanner() {
  const { prompt, installed, install } = usePWAInstall()
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('pwa-banner-dismissed') === '1'
  )
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  // Don't show if already installed, dismissed, or no prompt and not iOS
  const ios = isIOS()
  if (installed || dismissed) return null
  if (!prompt && !ios) return null

  function dismiss() {
    localStorage.setItem('pwa-banner-dismissed', '1')
    setDismissed(true)
  }

  return (
    <>
      <div className="above-mobile-nav" style={{
        position: 'fixed', '--fixed-bottom-offset': '16px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 1000, width: 'calc(100% - 32px)', maxWidth: 420,
        background: 'var(--bg-card)',
        border: '1px solid var(--accent)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px 16px',
        boxShadow: '0 8px 32px rgba(20,83,45,0.2)',
        display: 'flex', alignItems: 'center', gap: 12,
        animation: 'slideUp 0.3s ease',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: 'var(--brand-gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Smartphone size={20} color="#fff"/>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Install RevisionFlow</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Add to your home screen for quick access
          </div>
        </div>
        {ios ? (
          <button className="btn btn-primary btn-sm" onClick={() => setShowIOSGuide(true)}>
            How?
          </button>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={install}>
            <Download size={13}/> Install
          </button>
        )}
        <button className="btn btn-ghost btn-icon btn-sm" onClick={dismiss}>
          <X size={16}/>
        </button>
      </div>

      {showIOSGuide && (
        <div className="modal-overlay" onClick={() => setShowIOSGuide(false)}>
          <div className="modal" style={{ maxWidth: 340 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Install on iPhone / iPad</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowIOSGuide(false)}>
                <X size={18}/>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.875rem' }}>
              {[
                { step: 1, text: 'Tap the Share button at the bottom of Safari (the box with an arrow)' },
                { step: 2, text: 'Scroll down and tap "Add to Home Screen"' },
                { step: 3, text: 'Tap "Add" in the top right — done!' },
              ].map(({ step, text }) => (
                <div key={step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--accent)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.78rem',
                  }}>{step}</div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-secondary" style={{ marginTop: 16, width: '100%' }}
              onClick={() => { setShowIOSGuide(false); dismiss() }}>
              Got it
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(100%); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}
