// src/components/PWAInstallBanner.jsx
// "Install RevisionFlow": a dismissible banner for the Dashboard (default export) and a card for Settings
// (PWAInstallCard). Chrome and Edge give an install prompt (utils/pwaInstall.js); iOS has none, so it gets a short how-to.

import React, { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'
import { isStandaloneApp } from '../utils/authUi'
import { canPromptInstall, wasInstalled, subscribeInstall, promptInstall } from '../utils/pwaInstall'

const DISMISS_KEY = 'pwa-banner-dismissed'

export function usePWAInstall() {
  const [, setTick] = useState(0)
  useEffect(() => subscribeInstall(() => setTick(n => n + 1)), [])
  return { prompt: canPromptInstall(), installed: wasInstalled() || isStandaloneApp(), install: promptInstall }
}

function isIOS() {
  const ua = navigator.userAgent
  const ipadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return (/iphone|ipad|ipod/i.test(ua) || ipadOS) && !window.MSStream
}

function readDismissed() {
  try { return localStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
}

function writeDismissed() {
  try { localStorage.setItem(DISMISS_KEY, '1') } catch { return }
}

function IOSGuide({ onClose, onDone }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 340 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Install on iPhone / iPad</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close" style={{ minWidth: 44, minHeight: 44 }}>
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
        <button className="btn btn-secondary" style={{ marginTop: 16, width: '100%', minHeight: 44 }} onClick={onDone}>
          Got it
        </button>
      </div>
    </div>
  )
}

export default function PWAInstallBanner({ style }) {
  const { prompt, installed, install } = usePWAInstall()
  const [dismissed, setDismissed] = useState(readDismissed)
  const [showGuide, setShowGuide] = useState(false)
  const ios = isIOS()

  if (installed || dismissed || (!prompt && !ios)) return null

  function dismiss() {
    writeDismissed()
    setDismissed(true)
  }

  return (
    <>
      <div className="card" role="region" aria-label="Install RevisionFlow"
        style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '12px 8px 12px 16px', marginBottom: 16, ...style }}>
        <Smartphone size={20} aria-hidden="true" style={{ color: 'var(--accent-light)', flexShrink: 0 }} />
        <div style={{ flex: '1 1 160px', minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Install RevisionFlow</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Add it to your home screen for quick access</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
          {ios ? (
            <button className="btn btn-primary" style={{ minHeight: 44 }} onClick={() => setShowGuide(true)}>How?</button>
          ) : (
            <button className="btn btn-primary" style={{ minHeight: 44 }} onClick={install}><Download size={14}/> Install</button>
          )}
          <button className="btn btn-ghost btn-icon" onClick={dismiss} aria-label="Dismiss" style={{ minWidth: 44, minHeight: 44 }}>
            <X size={16}/>
          </button>
        </div>
      </div>
      {showGuide && <IOSGuide onClose={() => setShowGuide(false)} onDone={() => { setShowGuide(false); dismiss() }} />}
    </>
  )
}

export function PWAInstallCard({ style }) {
  const { prompt, installed, install } = usePWAInstall()
  const [showGuide, setShowGuide] = useState(false)
  const ios = isIOS()

  if (!installed && !prompt && !ios) return null

  return (
    <>
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, ...style }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 220px', minWidth: 0 }}>
          <Smartphone size={20} aria-hidden="true" style={{ color: 'var(--accent-light)', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <h4 className="card-eyebrow" style={{ margin: 0 }}>Install the app</h4>
            <p className="card-sub-line">
              {installed ? 'RevisionFlow is installed on this device.' : 'Add RevisionFlow to your home screen to open it like an app.'}
            </p>
          </div>
        </div>
        {!installed && (ios ? (
          <button className="btn btn-secondary" style={{ minHeight: 44, marginLeft: 'auto' }} onClick={() => setShowGuide(true)}>How to install</button>
        ) : (
          <button className="btn btn-secondary" style={{ minHeight: 44, marginLeft: 'auto' }} onClick={install}><Download size={14}/> Install</button>
        ))}
      </div>
      {showGuide && <IOSGuide onClose={() => setShowGuide(false)} onDone={() => setShowGuide(false)} />}
    </>
  )
}
