// src/pages/Landing.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import {
  Zap, Calendar, Brain, Trophy, Users, FileText,
  BarChart2, CheckSquare, MessageSquare, Sun, Moon,
  ArrowRight, Timer, Code2, GraduationCap, ClipboardCheck,
  Layers, Lock, ShieldCheck, Trash2, UserCheck, Eye, Mail,
  CheckCircle2,
} from 'lucide-react'
import './Landing.css'

const FEATURES = [
  { icon:Calendar,       title:'Smart Calendar',            desc:'AI-generated revision schedules with exam-paper rotation, a 2:1 content-to-practice ratio, and automatic locking as exams approach.' },
  { icon:Brain,          title:'Topic Confidence Tracker',  desc:'Rate your confidence topic by topic, spot weak spots on a heatmap, and get a clear suggestion for what to revise next.' },
  { icon:FileText,       title:'Past Paper Tracker',        desc:'Log your marks and get your grade calculated from real, board-published grade boundaries — plus analysis of where marks were lost.' },
  { icon:ClipboardCheck, title:'Answer Marker',             desc:'Submit an answer, typed or photographed, and get examiner-style marking: awarded marks, an AO breakdown, and exactly how to improve.' },
  { icon:Layers,         title:'Flashcards',                desc:'Generate topic flashcards or build your own sets, then revise with spaced repetition that brings back the cards you keep missing.' },
  { icon:MessageSquare,  title:'AI Revision Advisor',       desc:'Chat through a topic, get a predicted grade, or ask for a personalised study plan — powered by Mistral AI.' },
  { icon:GraduationCap,  title:'AI Tutor',                  desc:'A Maths step-by-step solver and structured English essay feedback, built around how each subject is actually marked.', pro:true },
  { icon:BarChart2,      title:'Progress Analytics',        desc:'Grade progression graphs, subject averages, and a predicted final grade based on your actual trajectory.' },
  { icon:Trophy,         title:'Gamification',              desc:'Earn XP, level up, unlock 14 badges, and keep a streak going — without it getting in the way of revising.' },
  { icon:Users,          title:'Social Features',           desc:'Add friends, compare streaks and XP, and keep each other accountable.' },
  { icon:Timer,          title:'Study Timer',               desc:'Countdown timer, stopwatch and alarm clock with several sound options — pop it out as a floating widget.' },
  { icon:CheckSquare,    title:'Tasks & Deadlines',         desc:'A to-do list with due dates, priorities and subject tags. Overdue tasks are flagged automatically.' },
]

const STATS = [
  { value:'5',    label:'Exam boards' },
  { value:'38',   label:'GCSE subjects' },
  { value:'3',    label:'Qualifications' },
  { value:'Free', label:'To start' },
]

const TRUST = [
  { icon:Lock,        title:'No data selling',   desc:'Your revision data is never sold, shared with advertisers, or used for any purpose outside RevisionFlow.' },
  { icon:ShieldCheck,  title:'UK GDPR compliant', desc:'We comply fully with the UK General Data Protection Regulation and the Data Protection Act 2018.' },
  { icon:Trash2,       title:'Delete anytime',    desc:'Delete your account and all associated data permanently from Settings at any time — no questions asked.' },
  { icon:UserCheck,    title:'Age 13+',           desc:'Designed for secondary school students. Users under 13 require parental consent. We do not knowingly collect data from under-13s.' },
  { icon:Eye,          title:'AI transparency',   desc:'AI requests use Mistral AI. Mistral does not train on API data by default and may retain request logs for up to 30 days for abuse detection.' },
  { icon:Mail,         title:'Right to access',   desc:'Email admin@revisionflow.co.uk to request a copy of your data, corrections, or deletion under UK GDPR Article 15–17.' },
]

export default function Landing() {
  const { theme, toggle } = useTheme()

  return (
    <div className="lp-page">

      {/* Nav */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link to="/" className="lp-logo">
            <div className="lp-logo-mark">
              <Zap size={19} color="#fff"/>
            </div>
            <span className="lp-logo-word">Revision<span>Flow</span></span>
          </Link>

          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <Link to="/pro">Pricing</Link>
            <a href="#about">About</a>
          </div>

          <div className="lp-nav-actions">
            <button className="btn btn-ghost btn-icon" onClick={toggle} aria-label="Toggle theme">
              {theme==='dark' ? <Sun size={18}/> : <Moon size={18}/>}
            </button>
            <Link to="/login" className="lp-nav-signin">Sign in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section" style={{textAlign:'center',maxWidth:820,margin:'0 auto',padding:'96px 24px 64px'}}>
        <div className="lp-eyebrow">
          <CheckCircle2 size={13}/> Matched exactly to AQA, Edexcel, OCR, WJEC/Eduqas &amp; CCEA
        </div>

        <h1 className="lp-hero-title">
          Your revision,<br/>
          <span className="gradient-text">finally organised.</span>
        </h1>

        <p className="lp-hero-sub">
          Exam calendars, past paper tracking, topic confidence heatmaps, and AI-assisted
          study tools — built for GCSE, AS-Level and A-Level. Free to use.
        </p>

        <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
          <Link to="/signup" className="btn btn-primary btn-lg">
            Start revising free <ArrowRight size={17}/>
          </Link>
          <div className="lp-hero-microcopy">No card required</div>
        </div>

        {/* Stats */}
        <div className="hero-stats">
          {STATS.map(s=>(
            <div key={s.label} className="lp-stat">
              <div className="lp-stat-value">{s.value}</div>
              <div className="lp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{padding:'40px 24px 88px',maxWidth:1100,margin:'0 auto'}}>
        <div className="lp-features-head">
          <h2>Everything you need to get a 9</h2>
          <p>Built by a student, for students. Every feature is designed around how revision actually works.</p>
        </div>
        <div className="grid-3">
          {FEATURES.map(f=>(
            <div key={f.title} className="card lp-feature-card">
              <div className="lp-feature-top">
                <div className="lp-feature-icon">
                  <f.icon size={19} color="var(--accent-light)"/>
                </div>
                {f.pro && <span className="badge badge-gold">PRO</span>}
              </div>
              <h4>{f.title}</h4>
              <p className="lp-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About / Creator section */}
      <section id="about" style={{padding:'64px 24px',maxWidth:760,margin:'0 auto'}}>
        <div className="card accent-card" style={{padding:36}}>
          <div className="lp-about-head">
            <div className="lp-avatar">F</div>
            <div>
              <div style={{fontWeight:700,fontSize:'1.05rem'}}>
                Oluwafemi Aisida · <Link to="/privacy" style={{color:'inherit',opacity:0.6,textDecoration:'underline'}}>Privacy Policy</Link>
              </div>
              <div style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>Founded by a GCSE student · Aspiring CS @ Oxford/Cambridge</div>
            </div>
          </div>
          <p style={{lineHeight:1.8,marginBottom:20}}>
            I built RevisionFlow because I needed it. During my own GCSEs, I couldn't find a tool
            that actually matched how revision works — the right exam board's spec, real grade
            boundaries, past papers that reflect an actual grade. So I built one myself, with
            paper rotation, exam-proximity locking, board-accurate grade boundaries, and AI tools
            that are genuinely useful rather than bolted on. It's also become the centrepiece of
            my Computer Science application to Oxford and Cambridge — but first, it's the tool I
            wanted to exist.
          </p>
          <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
            <span className="lp-badge-accent"><Code2 size={11}/> React + Firebase + Mistral AI</span>
            <span className="lp-badge-accent"><GraduationCap size={11}/> GCSE 2026</span>
            <span className="lp-badge-accent"><Zap size={11}/> Open to all students</span>
          </div>
        </div>
      </section>

      {/* GDPR / Data trust section */}
      <section className="lp-trust-section">
        <div className="lp-trust-inner">
          <div className="lp-trust-head">
            <h2>Your data, your control</h2>
            <p>RevisionFlow is built by Aisida Studios, not a corporation. We handle your data with care and full transparency.</p>
          </div>
          <div className="lp-trust-grid">
            {TRUST.map(item => (
              <div key={item.title} className="lp-trust-card">
                <div className="lp-trust-icon"><item.icon size={17} color="var(--accent)"/></div>
                <div className="lp-trust-title">{item.title}</div>
                <div className="lp-trust-desc">{item.desc}</div>
              </div>
            ))}
          </div>
          <p className="lp-trust-foot">
            Read our full{' '}
            <Link to="/privacy" style={{color:'var(--accent-light)',fontWeight:600}}>Privacy Policy</Link>
            {' '}· Complaints to the{' '}
            <a href="https://ico.org.uk" target="_blank" rel="noreferrer" style={{color:'var(--accent-light)'}}>ICO</a>
            {' '}· Contact:{' '}
            <a href="mailto:admin@revisionflow.co.uk" style={{color:'var(--accent-light)'}}>admin@revisionflow.co.uk</a>
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="lp-cta-band">
        <h2>Ready to level up your revision?</h2>
        <p>Free to use. No credit card. Start in 2 minutes.</p>
        <Link to="/signup" className="btn btn-lg lp-cta-btn">
          Create your free account <ArrowRight size={17}/>
        </Link>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-top">
            <Link to="/" className="lp-logo">
              <div className="lp-logo-mark" style={{width:28,height:28}}>
                <Zap size={15} color="#fff"/>
              </div>
              <span className="lp-logo-word" style={{fontSize:'0.95rem'}}>Revision<span>Flow</span></span>
            </Link>
            <div className="lp-footer-links">
              <a href="#features">Features</a>
              <Link to="/pro">Pricing</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/login">Sign in</Link>
              <Link to="/signup">Get started</Link>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>© 2026 Aisida Studios</span>
            <span>Built for UK GCSE, AS-Level and A-Level students</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
