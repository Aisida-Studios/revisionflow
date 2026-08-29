// src/pages/Landing.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import {
  Zap, Calendar, Brain, Trophy, Users, FileText,
  BarChart2, CheckSquare, MessageSquare, Sun, Moon,
  ArrowRight, Timer, Code2, GraduationCap, ClipboardCheck,
  Layers, Lock, ShieldCheck, Trash2, UserCheck, Eye, Mail,
  Leaf, FlaskConical, Atom, Sigma, Landmark, Cpu, TrendingUp,
  BookOpen,
} from 'lucide-react'
import './Landing.css'

// Real per-subject colours, pulled from src/data/subjects.js's
// SUBJECT_COLOURS rather than invented — a small, visually varied subset
// for the landing page, not the full 38-subject list.
const SUBJECTS_PREVIEW = [
  { name:'Biology',            icon:Leaf,         hex:'#27ae60', rgb:'39,174,96' },
  { name:'Chemistry',          icon:FlaskConical, hex:'#8e44ad', rgb:'142,68,173' },
  { name:'Physics',            icon:Atom,         hex:'#2980b9', rgb:'41,128,185' },
  { name:'Mathematics',        icon:Sigma,        hex:'#e74c3c', rgb:'231,76,60' },
  { name:'English Literature', icon:BookOpen,     hex:'#d35400', rgb:'211,84,0' },
  { name:'History',            icon:Landmark,     hex:'#795548', rgb:'121,85,72' },
  { name:'Computer Science',   icon:Cpu,          hex:'#3498db', rgb:'52,152,219' },
  { name:'Psychology',         icon:Brain,        hex:'#5e35b1', rgb:'94,53,177' },
]

const FEATURES_MAJOR = [
  { icon:Calendar,      title:'Smart Calendar',            desc:'AI-generated revision schedules with exam-paper rotation, a 2:1 content-to-practice ratio, and automatic locking as exams approach.' },
  { icon:Brain,         title:'Topic Confidence Tracker',  desc:'Rate your confidence topic by topic, spot weak spots on a heatmap, and get a clear suggestion for what to revise next.' },
  { icon:FileText,      title:'Past Paper Tracker',        desc:'Log your marks and get your grade calculated from real, board-published grade boundaries — plus analysis of where marks were lost.' },
  { icon:Layers,        title:'Flashcards',                desc:'Generate topic flashcards or build your own sets, then revise with spaced repetition that brings back the cards you keep missing.' },
  { icon:MessageSquare, title:'AI Revision Advisor',       desc:'Chat through a topic, get a predicted grade, or ask for a personalised study plan — powered by Mistral AI.' },
  { icon:BarChart2,     title:'Progress Analytics',        desc:'Grade progression graphs, subject averages, and a predicted final grade based on your actual trajectory.' },
]

const FEATURES_LIST = [
  { icon:GraduationCap, title:'AI Tutor', pro:true, desc:"A Maths step-by-step solver and structured English essay feedback, built around how each subject is actually marked." },
  { icon:Trophy,        title:'Gamification',       desc:'Earn XP, level up, unlock 14 badges, and keep a streak going — without it getting in the way of revising.' },
  { icon:Users,         title:'Social Features',    desc:'Add friends, compare streaks and XP, and keep each other accountable.' },
  { icon:Timer,         title:'Study Timer',        desc:'Countdown timer, stopwatch and alarm clock — pop it out as a floating widget while you work.' },
  { icon:CheckSquare,   title:'Tasks & Deadlines',  desc:'A to-do list with due dates, priorities and subject tags. Overdue tasks are flagged automatically.' },
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
            <div className="lp-logo-mark"><Zap size={19} color="#fff"/></div>
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

      {/* Hero — two columns: copy, then a real-data product-preview mockup */}
      <section className="hero-section" style={{maxWidth:1120,margin:'0 auto',padding:'88px 24px 56px'}}>
        <div className="lp-hero-grid">
          <div className="lp-hero-copy">
            <div className="lp-eyebrow">For UK GCSE, AS-Level &amp; A-Level students</div>

            <h1 className="lp-hero-title">
              Your revision,<br/>
              <span style={{color:'var(--accent-light)'}}>finally organised.</span>
            </h1>

            <p className="lp-hero-sub">
              Exam calendars, past paper tracking, topic confidence heatmaps and AI-assisted
              study tools — matched exactly to your board. Free to use.
            </p>

            <div className="lp-hero-cta">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Start revising free <ArrowRight size={17}/>
              </Link>
              <div className="lp-hero-microcopy">No card required</div>
            </div>
          </div>

          <div className="lp-hero-visual">
            <div className="lp-preview-card lp-preview-card--back">
              <div className="lp-preview-head">
                <span className="lp-preview-icon" style={{background:'rgba(142,68,173,0.14)'}}>
                  <FlaskConical size={16} color="#8e44ad"/>
                </span>
                <span className="lp-preview-subject">Chemistry</span>
              </div>
              <div className="lp-preview-topic">Organic Chemistry</div>
            </div>

            <div className="lp-preview-card lp-preview-card--front">
              <div className="lp-preview-head">
                <span className="lp-preview-icon" style={{background:'rgba(39,174,96,0.14)'}}>
                  <Leaf size={16} color="#27ae60"/>
                </span>
                <span className="lp-preview-subject">Biology</span>
              </div>
              <div className="lp-preview-topic">Cell Biology</div>
              <div className="lp-preview-confidence">
                <span className="lp-preview-pct">72%</span>
                <span className="lp-preview-trend"><TrendingUp size={12}/> +8% this month</span>
              </div>
              <div className="lp-mock-track"><div className="lp-mock-fill" style={{width:'72%'}}/></div>
            </div>
          </div>
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

      {/* Subject colour strip */}
      <section className="lp-subjects-section">
        <div className="lp-subjects-head">
          <h2>A colour for every subject</h2>
          <p style={{color:'var(--text-secondary)'}}>Consistent subject colours across the whole app, so your calendar, topics and progress are easy to scan at a glance.</p>
        </div>
        <div className="lp-subjects-row">
          {SUBJECTS_PREVIEW.map(s=>(
            <div key={s.name} className="lp-subject-chip">
              <span className="lp-subject-chip-icon" style={{background:`rgba(${s.rgb},0.14)`}}>
                <s.icon size={15} color={s.hex}/>
              </span>
              <span className="lp-subject-chip-name">{s.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features — a spotlight feature, a grid of major features, then a compact list */}
      <section id="features" style={{padding:'8px 24px 88px',maxWidth:1100,margin:'0 auto'}}>
        <div className="lp-features-head">
          <h2>Everything you need to get a 9</h2>
          <p>Built by a student, for students. Every feature is designed around how revision actually works.</p>
        </div>

        <div className="lp-feature-hero">
          <div>
            <div className="lp-feature-hero-icon"><ClipboardCheck size={21} color="var(--accent-light)"/></div>
            <h3>Answer Marker</h3>
            <p>Type your answer, or photograph your handwritten working, and get examiner-style marking
              in seconds — the marks you'd actually get, an AO breakdown, and exactly what would have
              earned the rest.</p>
          </div>
          <div className="lp-feature-hero-visual">
            <div className="lp-mock-label">Your answer, marked</div>
            <div className="lp-mock-score">
              <span className="lp-mock-score-num">7</span>
              <span className="lp-mock-score-total">/ 9 marks</span>
            </div>
            <div className="lp-mock-bars">
              <div className="lp-mock-bar-row"><span>AO1</span><div className="lp-mock-track"><div className="lp-mock-fill" style={{width:'100%'}}/></div><span>3/3</span></div>
              <div className="lp-mock-bar-row"><span>AO2</span><div className="lp-mock-track"><div className="lp-mock-fill" style={{width:'75%'}}/></div><span>3/4</span></div>
              <div className="lp-mock-bar-row"><span>AO3</span><div className="lp-mock-track"><div className="lp-mock-fill" style={{width:'50%'}}/></div><span>1/2</span></div>
            </div>
            <div className="lp-mock-note">Missing: a named example for AO2</div>
          </div>
        </div>

        <div className="grid-3">
          {FEATURES_MAJOR.map(f=>(
            <div key={f.title} className="card lp-feature-card">
              <div className="lp-feature-icon"><f.icon size={18} color="var(--accent-light)"/></div>
              <h4>{f.title}</h4>
              <p className="lp-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="lp-list">
          {FEATURES_LIST.map(f=>(
            <div key={f.title} className="lp-list-item">
              <f.icon size={18} className="lp-list-icon"/>
              <div>
                <div className="lp-list-title">{f.title}{f.pro && <span className="badge badge-gold">PRO</span>}</div>
                <div className="lp-list-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About / creator */}
      <section id="about" style={{padding:'56px 24px',maxWidth:820,margin:'0 auto'}}>
        <div className="lp-about-grid">
          <div>
            <div className="lp-avatar">F</div>
            <div className="lp-about-name">Oluwafemi Aisida</div>
            <div className="lp-about-role">Founded by a GCSE student</div>
            <div className="lp-about-badges">
              <span className="lp-badge-accent"><Code2 size={13}/> React + Firebase + Mistral AI</span>
              <span className="lp-badge-accent"><GraduationCap size={13}/> Aspiring CS @ Oxbridge</span>
              <span className="lp-badge-accent"><Zap size={13}/> Open to all students</span>
            </div>
          </div>
          <p className="lp-about-copy">
            I built RevisionFlow because I needed it. During my own GCSEs, I couldn't find a tool
            that actually matched how revision works — the right exam board's spec, real grade
            boundaries, past papers that reflect an actual grade. So I built one myself, with
            paper rotation, exam-proximity locking, board-accurate grade boundaries, and AI tools
            that are genuinely useful rather than bolted on. It's also become the centrepiece of
            my Computer Science application to Oxford and Cambridge — but first, it's the tool I
            wanted to exist. Read the <Link to="/privacy">Privacy Policy</Link> for how your data is handled.
          </p>
        </div>
      </section>

      {/* GDPR / Data trust section */}
      <section className="lp-trust-section">
        <div className="lp-trust-inner">
          <div className="lp-trust-head">
            <h2>Your data, your control</h2>
            <p>RevisionFlow is built by Aisida Studios, not a corporation. We handle your data with care and full transparency.</p>
          </div>
          <div className="lp-list">
            {TRUST.map(item => (
              <div key={item.title} className="lp-list-item">
                <item.icon size={18} className="lp-list-icon"/>
                <div>
                  <div className="lp-list-title">{item.title}</div>
                  <div className="lp-list-desc">{item.desc}</div>
                </div>
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
              <div className="lp-logo-mark" style={{width:28,height:28}}><Zap size={15} color="#fff"/></div>
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
