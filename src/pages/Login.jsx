// src/pages/Login.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.code === 'auth/invalid-credential' ? 'Invalid email or password' : err.message)
    } finally { setLoading(false) }
  }

  async function handleGoogle() {
    setLoading(true)
    try {
      await loginWithGoogle()
      navigate('/dashboard')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24,background:'var(--bg-base)'}}>
      <div style={{width:'100%',maxWidth:400}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{width:52,height:52,borderRadius:14,background:'linear-gradient(135deg,#7c3aed,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',boxShadow:'0 0 24px rgba(124,58,237,0.4)'}}>
            <Zap size={26} color="#fff"/>
          </div>
          <h2>Welcome back</h2>
          <p style={{marginTop:6}}>Sign in to RevisionFlow</p>
        </div>

        <div className="card" style={{padding:28}}>
          {/* Google */}
          <button className="btn btn-secondary" style={{width:'100%',marginBottom:20,gap:10}} onClick={handleGoogle} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
            <div className="divider" style={{flex:1,margin:0}}/><span style={{fontSize:'0.8rem',color:'var(--text-muted)',whiteSpace:'nowrap'}}>or email</span><div className="divider" style={{flex:1,margin:0}}/>
          </div>

          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="label">Email</label>
              <div style={{position:'relative'}}>
                <Mail size={16} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}/>
                <input className="input" style={{paddingLeft:38}} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@school.ac.uk" required/>
              </div>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <label className="label">Password</label>
                <button type="button" style={{fontSize:'0.78rem',color:'var(--accent-light)',background:'none',border:'none',cursor:'pointer'}} onClick={() => setResetMode(true)}>Forgot password?</button>
              </div>
              <div style={{position:'relative'}}>
                <Lock size={16} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}/>
                <input className="input" style={{paddingLeft:38,paddingRight:40}} type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/>
                <button type="button" style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)'}} onClick={()=>setShowPw(!showPw)}>
                  {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{width:'100%',marginTop:4}}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p style={{textAlign:'center',marginTop:20,fontSize:'0.875rem'}}>
            Don't have an account?{' '}
            <Link to="/signup" style={{color:'var(--accent-light)',fontWeight:600}}>Sign up free</Link>
          </p>
        </div>

        {/* Reset modal */}
        {resetMode && <ResetModal onClose={()=>setResetMode(false)}/>}
      </div>
    </div>
  )
}

function ResetModal({ onClose }) {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  async function handleReset(e) {
    e.preventDefault()
    try { await resetPassword(email); setSent(true) }
    catch (err) { toast.error(err.message) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Reset password</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        {sent ? (
          <p>Check your email for a reset link.</p>
        ) : (
          <form onSubmit={handleReset} style={{display:'flex',flexDirection:'column',gap:16}}>
            <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" required/>
            <button className="btn btn-primary" type="submit">Send reset link</button>
          </form>
        )}
      </div>
    </div>
  )
}
