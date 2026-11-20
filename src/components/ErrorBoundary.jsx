// src/components/ErrorBoundary.jsx
import { Component } from 'react'
import { LazyIllustration } from './illustrations/lazy'

// After a new version is deployed, a page that is still open asks for page files that no longer exist on the server
// (Safari says "Importing a module script failed", Chrome "Failed to fetch dynamically imported module"). Loading the
// app again fetches the new version, so that is done automatically, once, instead of showing an error.
const CHUNK_ERROR = /Importing a module script failed|Failed to fetch dynamically imported module|error loading dynamically imported module|Loading (CSS )?chunk \S+ failed|ChunkLoadError/i
const RELOAD_KEY = 'rf-update-reload-at'
const RELOAD_GAP_MS = 60 * 1000

function isChunkError(error) {
  return !!error && (error.name === 'ChunkLoadError' || CHUNK_ERROR.test(String(error.message || error)))
}

// Reloads the page unless it already did so in the last minute, so a file that is really missing cannot cause a loop.
// Returns true when a reload was started.
function reloadForUpdate() {
  try {
    if (Date.now() - Number(sessionStorage.getItem(RELOAD_KEY) || 0) < RELOAD_GAP_MS) return false
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    return false
  }
  window.location.reload()
  return true
}

if (typeof window !== 'undefined') window.addEventListener('vite:preloadError', () => { reloadForUpdate() })

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, updating: false }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('RevisionFlow caught error:', error, info)
    if (isChunkError(error)) this.setState({ updating: reloadForUpdate() })
  }
  render() {
    const { error, updating } = this.state
    if (!error) return this.props.children
    const shell = {
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base, #0c0f0d)', color: 'var(--text-primary, #fff)',
      padding: '2rem', textAlign: 'center',
    }
    if (isChunkError(error)) {
      const offline = typeof navigator !== 'undefined' && navigator.onLine === false
      const title = updating ? 'Updating RevisionFlow' : offline ? 'You appear to be offline' : 'RevisionFlow has been updated'
      const body = updating ? 'Loading the latest version…' : offline ? 'Reconnect to the internet, then reload the app.' : 'A new version is available. Reload to get it.'
      return (
        <div role="status" style={shell}>
          <h2 style={{ margin: '0.5rem 0' }}>{title}</h2>
          <p style={{ color: 'var(--text-secondary, #aaa)', marginBottom: '1.5rem', maxWidth: 400 }}>{body}</p>
          {!updating && (
            <button className="btn btn-primary" style={{ minHeight: 44 }} onClick={() => window.location.reload()}>
              Reload app
            </button>
          )}
        </div>
      )
    }
    return (
      <div style={shell}>
        {/* Lazy + self-guarded: this screen must never throw, or the user is back to a blank page. */}
        <LazyIllustration name="error" width={240} />
        <h2 style={{ margin: '0.5rem 0' }}>Something went wrong</h2>
        <p style={{ color: 'var(--text-secondary, #aaa)', marginBottom: '1.5rem', maxWidth: 400 }}>
          {error?.message || 'An unexpected error occurred.'}
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
}
