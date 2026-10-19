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
