// src/pages/Landing.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import {
  Zap, Calendar, Brain, Trophy, Users, FileText,
  BarChart2, CheckSquare, MessageSquare, Sun, Moon,
  ArrowRight, Flame, BookOpen, Timer, Code2, GraduationCap
} from 'lucide-react'

const FEATURES = [
  { icon:Calendar,      title:'Smart Calendar',      desc:'AI-generated revision schedules with paper rotation, 2:1 content/exam ratio, emergency sessions, and pre-exam locking.' },
  { icon:Brain,         title:'Topic Tracker',        desc:'Rate confidence per topic, view a heatmap of strengths and weaknesses, and get AI-powered next-topic suggestions.' },
  { icon:FileText,      title:'Past Paper Tracker',   desc:'Log marks per question, auto-calculate grades from real boundaries, and get AI weakness analysis.' },
  { icon:BarChart2,     title:'Progress Analytics',   desc:'Grade progression graphs, subject averages, and AI-predicted final grades based on your trajectory.' },
  { icon:MessageSquare, title:'AI Revision Advisor',  desc:'Chat, grade predictor, answer marker, flashcard generator, resource recommendations — all powered by Mistral AI.' },
  { icon:Trophy,        title:'Gamification',         desc:'Earn XP, level up, unlock 14 badges, maintain streaks, and compete on leaderboards with friends.' },
  { icon:Users,         title:'Social Features',      desc:'Add friends, compare streaks and XP, and stay accountable together.' },
  { icon:Timer,         title:'Study Timer',          desc:'Countdown timer, stopwatch, and alarm clock with multiple sound options. Pop out as a floating widget.' },
  { icon:CheckSquare,   title:'Tasks & Deadlines',    desc:'To-do list with due dates, priorities, and subject tags. Overdue tasks highlighted automatically.' },
]

const STATS = [
  { value:'11+',  label:'Subjects' },
  { value:'All',  label:'UK boards' },
  { value:'AI',   label:'Powered' },
  { value:'Free', label:'Always' },
]

export default function Landing() {
  const { theme, toggle } = useTheme()

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-base)'}}>

      {/* Nav */}
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',borderBottom:'1px solid var(--border)',position:'sticky',top:0,zIndex:100,background:'rgba(15,10,30,0.85)',backdropFilter:'blur(12px)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:34,height:34,borderRadius:9,background:'linear-gradient(135deg,#7c3aed,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Zap size={19} color="#fff"/>
          </div>
          <span style={{fontWeight:800,fontSize:'1.15rem'}}>Revision<span style={{color:'var(--accent-light)'}}>Flow</span></span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <button className="btn btn-ghost btn-icon" onClick={toggle}>{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button>
          <Link to="/login"  className="btn btn-secondary btn-sm">Sign in</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{textAlign:'center',padding:'80px 24px 60px',maxWidth:820,margin:'0 auto'}}>
        <div className="badge badge-amber" style={{marginBottom:12,display:'inline-flex',gap:6}}>
          <Calendar size={12}/> Beta closes 31 July 2026 · Launching GCSE Results Day, 20 August 2026
        </div>
        <br/>
        <div className="badge badge-purple" style={{marginBottom:20,display:'inline-flex',gap:6}}>
          <Flame size={12}/> Built for GCSE, AS-Level & A-Level students in the UK
        </div>
        <h1 style={{marginBottom:20,lineHeight:1.1}}>
          Your AI-powered<br/>
          <span className="gradient-text">revision command centre</span>
        </h1>
        <p style={{fontSize:'1.1rem',maxWidth:580,margin:'0 auto 36px',lineHeight:1.7}}>
          Smart revision calendars, past paper tracking, topic confidence heatmaps,
          AI advice, streaks, and social features — all in one place. Free forever.
        </p>
        <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
          <Link to="/signup" className="btn btn-primary btn-lg">Start revising free <ArrowRight size={17}/></Link>
          <Link to="/login"  className="btn btn-secondary btn-lg">Sign in</Link>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginTop:52,padding:'20px',borderRadius:'var(--radius-xl)',background:'var(--bg-card)',border:'1px solid var(--border)',maxWidth:560,margin:'52px auto 0'}}>
          {STATS.map(s=>(
            <div key={s.label} style={{textAlign:'center'}}>
              <div style={{fontSize:'1.6rem',fontWeight:800,color:'var(--accent-light)'}}>{s.value}</div>
              <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{padding:'40px 24px 80px',maxWidth:1100,margin:'0 auto'}}>
        <h2 style={{textAlign:'center',marginBottom:10}}>Everything you need to get a 9</h2>
        <p style={{textAlign:'center',maxWidth:480,margin:'0 auto 44px'}}>
          Built by a student, for students. Every feature is designed around how revision actually works.
        </p>
        <div className="grid-3" style={{gap:18}}>
          {FEATURES.map(f=>(
            <div key={f.title} className="card" style={{display:'flex',flexDirection:'column',gap:10}}>
              <div style={{width:38,height:38,borderRadius:9,background:'rgba(124,58,237,0.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <f.icon size={19} color="var(--accent-light)"/>
              </div>
              <h4>{f.title}</h4>
              <p style={{fontSize:'0.85rem',lineHeight:1.6}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About / Creator section */}
      <section style={{padding:'60px 24px',maxWidth:760,margin:'0 auto',textAlign:'center'}}>
        <div className="card accent-card" style={{padding:36}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,marginBottom:20}}>
            <div style={{width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem'}}>
              F
            </div>
            <div style={{textAlign:'left'}}>
              <div style={{fontWeight:700,fontSize:'1.05rem'}}>Oluwafemi Aisida · <a href="/privacy" style={{color:"inherit",opacity:0.6,textDecoration:"underline"}}>Privacy Policy</a></div>
              <div style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>Founded by a GCSE student · Aspiring CS @ Oxford/Cambridge</div>
            </div>
          </div>
          <p style={{lineHeight:1.8,marginBottom:16}}>
            RevisionFlow was built from scratch as a real portfolio project for my Oxbridge Computer Science application.
            I built it because I needed it — a genuine revision tool that works the way GCSE revision actually works,
            not just a generic task manager. It handles paper rotation, exam proximity locking, grade boundary calculations,
            and AI-powered personalisation.
          </p>
          <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
            <div className="badge badge-purple"><Code2 size={11}/> React + Firebase + Mistral AI</div>
            <div className="badge badge-purple"><GraduationCap size={11}/> GCSE 2026</div>
            <div className="badge badge-purple"><Zap size={11}/> Open to all students</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'56px 24px',textAlign:'center',background:'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(168,85,247,0.04))',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
        <h2 style={{marginBottom:10}}>Ready to level up your revision?</h2>
        <p style={{marginBottom:28}}>Free to use. No credit card. Start in 2 minutes.</p>
        <Link to="/signup" className="btn btn-primary btn-lg">Create your free account <ArrowRight size={17}/></Link>
      </section>

      {/* GDPR / Data trust section */}
      <section style={{padding:'48px 40px',background:'var(--bg-surface)',borderTop:'1px solid var(--border)'}}>
        <div style={{maxWidth:860,margin:'0 auto'}}>
          <h2 style={{textAlign:'center',marginBottom:8,fontSize:'1.4rem'}}>Your data, your control</h2>
          <p style={{textAlign:'center',color:'var(--text-secondary)',marginBottom:32,maxWidth:560,margin:'0 auto 32px'}}>
            RevisionFlow is built by Aisida Studios, not a corporation. We handle your data with care and full transparency.
          </p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:28}}>
            {[
              { icon:'🔒', title:'No data selling', desc:'Your revision data is never sold, shared with advertisers, or used for any purpose outside RevisionFlow.' },
              { icon:'🇬🇧', title:'UK GDPR compliant', desc:'We comply fully with the UK General Data Protection Regulation and the Data Protection Act 2018.' },
              { icon:'🗑️', title:'Delete anytime', desc:'Delete your account and all associated data permanently from Settings at any time — no questions asked.' },
              { icon:'👶', title:'Age 13+', desc:'Designed for secondary school students. Users under 13 require parental consent. We do not knowingly collect data from under-13s.' },
              { icon:'🤖', title:'AI transparency', desc:'AI requests use Mistral AI. Mistral does not train on API data by default and may retain request logs for up to 30 days for abuse detection.' },
              { icon:'📧', title:'Right to access', desc:'Email admin@revisionflow.co.uk to request a copy of your data, corrections, or deletion under UK GDPR Article 15–17.' },
            ].map(item => (
              <div key={item.title} style={{padding:'16px',background:'var(--bg-card)',borderRadius:'var(--radius-md)',border:'1px solid var(--border)'}}>
                <div style={{fontSize:'1.5rem',marginBottom:8}}>{item.icon}</div>
                <div style={{fontWeight:700,fontSize:'0.9rem',marginBottom:4}}>{item.title}</div>
                <div style={{fontSize:'0.8rem',color:'var(--text-secondary)',lineHeight:1.6}}>{item.desc}</div>
              </div>
            ))}
          </div>
          <p style={{textAlign:'center',fontSize:'0.82rem',color:'var(--text-muted)'}}>
            Read our full{' '}
            <Link to="/privacy" style={{color:'var(--accent-light)',fontWeight:600}}>Privacy Policy</Link>
            {' '}· Complaints to the{' '}
            <a href="https://ico.org.uk" target="_blank" rel="noreferrer" style={{color:'var(--accent-light)'}}>ICO</a>
            {' '}· Contact:{' '}
            <a href="mailto:admin@revisionflow.co.uk" style={{color:'var(--accent-light)'}}>admin@revisionflow.co.uk</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{padding:'28px 40px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10,borderTop:'1px solid var(--border)'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <Zap size={15} color="var(--accent-light)"/>
          <span style={{fontWeight:700,fontSize:'0.88rem'}}>RevisionFlow</span>
        </div>
        <p style={{fontSize:'0.78rem',margin:0,color:'var(--text-muted)'}}>
          Built by <strong style={{color:'var(--accent-light)'}}>Aisida Studios · <a href="/privacy" style={{color:"inherit",opacity:0.6,textDecoration:"underline"}}>Privacy Policy</a></strong> · GCSE, AS-Level & A-Level students · Free · AI-powered
        </p>
        <div style={{display:'flex',gap:14}}>
          <Link to="/login"  style={{fontSize:'0.8rem',color:'var(--text-secondary)'}}>Sign in</Link>
          <Link to="/signup" style={{fontSize:'0.8rem',color:'var(--accent-light)'}}>Get started</Link>
        </div>
      </footer>
    </div>
  )
}
