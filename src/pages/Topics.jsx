// src/pages/Topics.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import PriorityList from '../components/PriorityList'
import { useAuth } from '../context/AuthContext'
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { awardXP, autoCompleteQuest, migrateLegacyTopicDocs, saveNote, getNotes, deleteNote } from '../utils/firestore'
import { getTopicAdvice } from '../utils/ai'
import AIOutput from '../components/AIOutput'
import { getMergedTopicsFlat } from '../data/overrides'
import { resolveTopicResources } from '../data/resourceLinks'
import { subjectColour, getSubjectQualification } from '../data/subjects'
import { componentForSubject } from '../data/illustrationThemes'
import { getSubjectIcon } from '../utils/subjectIcons'
import { buildTopicId } from '../utils/topicId'
import { CONF_LABELS, CONF_COLOURS, displayTopicName, groupTopicsByPaper } from '../utils/topicDisplay'
import toast from 'react-hot-toast'
import {
  Plus, X, Brain, Trash2, Grid, BarChart2, Star, ExternalLink, BookOpen,
  StickyNote, Layers, Link2, Search, GraduationCap, CheckCircle2, Pencil,
} from 'lucide-react'
import { format } from 'date-fns'
import './Topics.css'

// Evidence-based revision resource links per subject (unchanged real curated data)
const SUBJECT_RESOURCES = {
  'Mathematics': [
    { name:'Corbettmaths', url:'https://corbettmaths.com', desc:'Videos and practice questions for every GCSE maths topic' },
    { name:'Maths Genie', url:'https://www.mathsgenie.co.uk', desc:'Past papers, grade boundaries, and topic-specific questions' },
    { name:'Dr Frost Maths', url:'https://www.drfrostmaths.com', desc:'Full GCSE and A-Level practice with worked solutions' },
    { name:'Desmos Graphing Calculator', url:'https://www.desmos.com/calculator', desc:'Free online graphing tool — essential for visualising functions' },
  ],
  'Further Mathematics': [
    { name:'Maths Genie A-Level', url:'https://www.mathsgenie.co.uk/newalevel.php', desc:'A-Level and Further Maths resources' },
    { name:'Dr Frost Maths', url:'https://www.drfrostmaths.com', desc:'Further Maths topic-by-topic practice' },
    { name:'Physics & Maths Tutor', url:'https://www.physicsandmathstutor.com/maths-revision/', desc:'A-Level Maths and Further Maths revision' },
  ],
  'Biology': [
    { name:'Cognito (YouTube)', url:'https://www.youtube.com/@CognitoEdu', desc:'Clear, concise GCSE and A-Level Biology videos' },
    { name:'Save My Exams — Biology', url:'https://www.savemyexams.com/gcse/biology/', desc:'Topic notes, flashcards and past paper questions' },
    { name:'BBC Bitesize Biology', url:'https://www.bbc.co.uk/bitesize/examspecs/zpgwxyc', desc:'AQA GCSE Biology revision with quizzes' },
    { name:'FreeScienceLessons', url:'https://www.youtube.com/@Freesciencelessons', desc:'Comprehensive GCSE Biology YouTube series' },
  ],
  'Chemistry': [
    { name:'Cognito (YouTube)', url:'https://www.youtube.com/@CognitoEdu', desc:'GCSE and A-Level Chemistry explained clearly' },
    { name:'Save My Exams — Chemistry', url:'https://www.savemyexams.com/gcse/chemistry/', desc:'AQA/Edexcel/OCR Chemistry notes and questions' },
    { name:'Chemrevise', url:'https://chemrevise.org', desc:'A-Level Chemistry detailed notes by Neil Goalby' },
    { name:'FreeScienceLessons', url:'https://www.youtube.com/@Freesciencelessons', desc:'GCSE Chemistry full course on YouTube' },
  ],
  'Physics': [
    { name:'Physics & Maths Tutor', url:'https://www.physicsandmathstutor.com/physics-revision/', desc:'A-Level Physics topic notes, past papers and mark schemes' },
    { name:'Cognito (YouTube)', url:'https://www.youtube.com/@CognitoEdu', desc:'GCSE and A-Level Physics videos' },
    { name:'Save My Exams — Physics', url:'https://www.savemyexams.com/gcse/physics/', desc:'Physics revision notes and practice questions' },
    { name:'Isaac Physics', url:'https://isaacphysics.org', desc:'Free A-Level Physics problems and hints — excellent for deep practice' },
  ],
  'Combined Science': [
    { name:'FreeScienceLessons', url:'https://www.youtube.com/@Freesciencelessons', desc:'Full GCSE Combined Science (Trilogy/Synergy) video series' },
    { name:'Save My Exams — Sciences', url:'https://www.savemyexams.com/gcse/', desc:'Combined Science notes for all exam boards' },
    { name:'Cognito (YouTube)', url:'https://www.youtube.com/@CognitoEdu', desc:'GCSE science videos across all three sciences' },
  ],
  'English Language': [
    { name:'Mr Bruff (YouTube)', url:'https://www.youtube.com/@mrbruff', desc:'GCSE English Language and Literature — one of the best YouTube channels' },
    { name:'BBC Bitesize English Language', url:'https://www.bbc.co.uk/bitesize/subjects/zr9d7ty', desc:'GCSE English Language revision guides' },
    { name:'AQA English Language Resources', url:'https://www.aqa.org.uk/subjects/english/gcse/english-language-8700', desc:'Official AQA spec, sample papers and mark schemes' },
  ],
  'English Literature': [
    { name:'Mr Bruff (YouTube)', url:'https://www.youtube.com/@mrbruff', desc:'Set text analysis videos for all major GCSE set texts' },
    { name:'Litcharts', url:'https://www.litcharts.com', desc:'Detailed literary analysis, themes, and quotes for set texts' },
    { name:'SparkNotes', url:'https://www.sparknotes.com', desc:'Study guides for all major set texts — good for context' },
    { name:'No Fear Shakespeare', url:'https://www.sparknotes.com/shakespeare/', desc:'Modern English translation alongside Shakespeare text' },
  ],
  'History': [
    { name:'Seneca Learning — History', url:'https://app.senecalearning.com', desc:'Free adaptive learning for GCSE and A-Level History' },
    { name:'BBC Bitesize History', url:'https://www.bbc.co.uk/bitesize/subjects/zk26n39', desc:'GCSE History topic guides and quizzes' },
    { name:'Mr Allsop History (YouTube)', url:'https://www.youtube.com/@MrAllsopHistory', desc:'Excellent GCSE and A-Level History videos' },
    { name:'Save My Exams — History', url:'https://www.savemyexams.com/gcse/history/', desc:'Topic notes and questions for all major exam boards' },
  ],
  'Geography': [
    { name:'Seneca Learning — Geography', url:'https://app.senecalearning.com', desc:'Adaptive GCSE Geography revision' },
    { name:'Cool Geography', url:'https://www.coolgeography.co.uk', desc:'Comprehensive GCSE and A-Level Geography notes' },
    { name:'BBC Bitesize Geography', url:'https://www.bbc.co.uk/bitesize/subjects/zkw76sg', desc:'GCSE Geography case studies and revision' },
    { name:'Geography All The Way (YouTube)', url:'https://www.youtube.com/@GeographyAllTheWay', desc:'GCSE Geography YouTube tutorials' },
  ],
  'Computer Science': [
    { name:"Craig'n'Dave (YouTube)", url:'https://www.youtube.com/@craigndave', desc:'The best GCSE and A-Level Computer Science YouTube channel' },
    { name:'Revision Village CS', url:'https://www.revisionvillage.com', desc:'Computer Science topic resources' },
    { name:'BBC Bitesize Computer Science', url:'https://www.bbc.co.uk/bitesize/subjects/z34k7ty', desc:'GCSE Computer Science revision' },
    { name:'CS Field Guide', url:'https://www.csfieldguide.org.nz', desc:'Free interactive CS concepts — excellent for algorithms and data structures' },
  ],
  'Business Studies': [
    { name:'Tutor2u Business', url:'https://www.tutor2u.net/business', desc:'Free GCSE and A-Level Business revision notes, flashcards, essays' },
    { name:'BBC Bitesize Business', url:'https://www.bbc.co.uk/bitesize/subjects/zpsvr82', desc:'GCSE Business Studies topic guides' },
    { name:'Business Studies Online (YouTube)', url:'https://www.youtube.com/@BusinessStudiesOnline', desc:'GCSE and A-Level Business YouTube videos' },
  ],
  'Economics': [
    { name:'Tutor2u Economics', url:'https://www.tutor2u.net/economics', desc:'Comprehensive A-Level and GCSE Economics revision' },
    { name:'Econplusdal (YouTube)', url:'https://www.youtube.com/@econplusdal', desc:'A-Level Economics — one of the best YouTube channels' },
    { name:'Economics Explained (YouTube)', url:'https://www.youtube.com/@EconomicsExplained', desc:'Real-world examples that make economics concepts stick' },
  ],
  'Psychology': [
    { name:'PsychLogic (YouTube)', url:'https://www.youtube.com/@PsychLogicUK', desc:'A-Level Psychology videos covering all major topics' },
    { name:'Simply Psychology', url:'https://www.simplypsychology.org', desc:'Free psychology study guides and research summaries' },
    { name:'Save My Exams — Psychology', url:'https://www.savemyexams.com/a-level/psychology/', desc:'AQA A-Level Psychology revision notes and questions' },
    { name:'Tutor2u Psychology', url:'https://www.tutor2u.net/psychology', desc:'Revision notes, flashcards and model answers' },
  ],
  'Sociology': [
    { name:'Tutor2u Sociology', url:'https://www.tutor2u.net/sociology', desc:'A-Level Sociology revision notes and topic summaries' },
    { name:'ReviseSociology', url:'https://revisesociology.com', desc:'Detailed A-Level Sociology notes across all topics' },
    { name:'Sociology Live (YouTube)', url:'https://www.youtube.com/@SociologyLive', desc:'A-Level Sociology video revision' },
  ],
  'French': [
    { name:'BBC Languages French', url:'https://www.bbc.co.uk/languages/french/', desc:'Grammar guides, vocabulary and listening practice' },
    { name:'Kwiziq French', url:'https://french.kwiziq.com', desc:'Personalised French grammar practice with explanations' },
    { name:'LanguageTransfer French', url:'https://www.languagetransfer.org/french', desc:'Free audio course — excellent for building intuition' },
    { name:'Collins Easy Learning French', url:'https://collins.co.uk', desc:'Grammar reference and vocabulary resources' },
  ],
  'German': [
    { name:'BBC Languages German', url:'https://www.bbc.co.uk/languages/german/', desc:'Grammar and vocabulary resources' },
    { name:'LanguageTransfer German', url:'https://www.languagetransfer.org/german', desc:'Free audio course for building grammar intuition' },
    { name:'Deutsch lernen (YouTube — Easy German)', url:'https://www.youtube.com/@EasyGerman', desc:'Real conversational German with subtitles' },
    { name:'Deutsche Welle', url:'https://www.dw.com/en/learn-german/s-2469', desc:'Free structured German courses at all levels' },
  ],
  'Spanish': [
    { name:'BBC Languages Spanish', url:'https://www.bbc.co.uk/languages/spanish/', desc:'Grammar and vocabulary revision' },
    { name:'LanguageTransfer Spanish', url:'https://www.languagetransfer.org/spanish', desc:'The best free beginner Spanish audio course' },
    { name:'Notes in Spanish (YouTube)', url:'https://www.youtube.com/@notesinspanish', desc:'Real conversational Spanish at multiple levels' },
    { name:'Lingolia Spanish', url:'https://espanol.lingolia.com/en/', desc:'Clear explanations of Spanish grammar rules' },
  ],
  'Religious Studies': [
    { name:'BBC Bitesize RS', url:'https://www.bbc.co.uk/bitesize/subjects/z7hs34j', desc:'GCSE Religious Studies revision guides' },
    { name:'RS Revision (YouTube)', url:'https://www.youtube.com/@RSRevision', desc:'GCSE and A-Level RS topic videos' },
    { name:'Tutor2u RE', url:'https://www.tutor2u.net/religious-studies', desc:'A-Level Religious Studies notes and resources' },
  ],
  'Law': [
    { name:"Law Teacher", url:'https://www.lawteacher.net', desc:'Free law essays, notes and problem question guides' },
    { name:'Tutor2u Law', url:'https://www.tutor2u.net/law', desc:'A-Level Law revision notes and exam technique guides' },
    { name:'E-Law Resources', url:'https://e-lawresources.co.uk', desc:'OCR and AQA A-Level Law case summaries and topic guides' },
  ],
  'Media Studies': [
    { name:'BBC Bitesize Media Studies', url:'https://www.bbc.co.uk/bitesize/subjects/ztnygk7', desc:'GCSE Media Studies revision guides' },
    { name:'Media Studies Tutor (YouTube)', url:'https://www.youtube.com/@MediaStudiesTutor', desc:'GCSE and A-Level Media Studies revision videos' },
  ],
}

export default function Topics() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [topics, setTopics] = useState([])
  const [allTopics, setAllTopics] = useState([])
  const [selSubj, setSelSubj] = useState(() => searchParams.get('subject') || 'All')
  const [showAdd, setShowAdd] = useState(false)
  const [aiAdvice, setAiAdvice] = useState({})
  const [loadingAI, setLoadingAI] = useState(null)
  const [openResources, setOpenResources] = useState(null)
  const [view, setView] = useState('list')
  const [selected, setSelected] = useState([])
  const [newTopic, setNewTopic] = useState({ name:'', confidence:3, notes:'' })
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState([])
  const [noteForm, setNoteForm] = useState({ title:'', content:'' })
  const [editingNote, setEditingNote] = useState(null)
  const [noteSaving, setNoteSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [confFilter, setConfFilter] = useState(null) // 'weak' | 'mid' | 'strong' | null
  const [specTotals, setSpecTotals] = useState({})   // { [subjectName]: total spec topic count }

  const subjects   = profile?.subjects?.map(s=>s.name) || []
  const selSubjObj  = profile?.subjects?.find(s => s.name === selSubj)
  const selBoard    = selSubjObj?.board || 'AQA'
  const selLevel    = getSubjectQualification(selSubjObj, profile)

  useEffect(() => {
    if (!user) return
    loadTopics()
    if (selSubj && selSubj !== 'All') loadNotes()
    setSearch('')
    setConfFilter(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selSubj])

  // One-off fetch of each enrolled subject's total spec-topic count (getMergedTopicsFlat is
  // overrides-aware — never swap for the static-only getAllTopicsFlat), so the "All Subjects"
  // summary cards and the per-subject header can show a real "X of Y tracked" instead of just
  // a raw count with nothing to compare it to.
  useEffect(() => {
    if (!user || !profile?.subjects?.length) return
    let cancelled = false
    ;(async () => {
      const entries = await Promise.all(profile.subjects.map(async (s) => {
        const level = getSubjectQualification(s, profile)
        try {
          const list = await getMergedTopicsFlat(s.board || 'AQA', s.name, level)
          return [s.name, list.length]
        } catch (e) {
          return [s.name, null]
        }
      }))
      if (!cancelled) setSpecTotals(Object.fromEntries(entries))
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, JSON.stringify((profile?.subjects || []).map(s => [s.name, s.board, getSubjectQualification(s, profile)]))])

  async function loadTopics() {
    const snap = await getDocs(collection(db,'users',user.uid,'topics'))
    const raw = snap.docs.map(d=>({id:d.id,...d.data()}))
    // Silently re-key any topic docs still on the old `${subject}_${topic}` id scheme (no board or
    // qualification) to the new board+qualification-scoped scheme. No-ops once already migrated.
    const all = await migrateLegacyTopicDocs(user.uid, raw, profile?.subjects, profile?.qualification)
    setAllTopics(all)
    if (selSubj === 'All') {
      setTopics(all)
    } else {
      // subjectId alone isn't enough once a subject's switched qualification (e.g. GCSE
      // Physics -> AS-Level Physics) — both sets of topic docs share that name, so without the
      // qualification check here they'd show up blended together on this page.
      setTopics(all.filter(t=>t.subjectId===selSubj && (t.qualification||selLevel)===selLevel))
    }
  }

  async function loadNotes() {
    if (!user || !selSubj || selSubj === 'All') return
    const all = await getNotes(user.uid)
    setNotes(all.filter(n => n.subject === selSubj))
  }

  async function handleSaveNote() {
    if (!noteForm.title || !selSubj) return
    setNoteSaving(true)
    try {
      if (editingNote) {
        await saveNote(user.uid, { ...editingNote, ...noteForm, subject: selSubj, updatedAt: new Date().toISOString() })
      } else {
        await saveNote(user.uid, { ...noteForm, subject: selSubj, createdAt: new Date().toISOString() })
      }
      setNoteForm({ title:'', content:'' })
      setEditingNote(null)
      await loadNotes()
      toast.success('Note saved')
    } catch(e) { toast.error('Failed to save note') }
    setNoteSaving(false)
  }

  async function handleDeleteNote(id) {
    await deleteNote(user.uid, id)
    setNotes(ns => ns.filter(n => n.id !== id))
    toast.success('Note deleted')
  }

  async function handleSeedTopics() {
    if (!selSubj || selSubj === 'All') return
    setLoading(true)
    const subj = profile?.subjects?.find(s=>s.name===selSubj)
    const subjQual = getSubjectQualification(subj, profile)
    const topicList = await getMergedTopicsFlat(subj?.board||'AQA', selSubj, subjQual)
    if (!topicList.length) { toast.error('No topics found for this subject/board'); setLoading(false); return }
    for (const t of topicList) {
      const id = buildTopicId(subj?.board||'AQA', subjQual, selSubj, t.name)
      await setDoc(doc(db,'users',user.uid,'topics',id), {
        name:t.name, paper:t.paper, subjectId:selSubj, board:subj?.board||'AQA', qualification:subjQual,
        confidence:3, notes:'', createdAt:serverTimestamp(), updatedAt:serverTimestamp(),
      }, { merge:true })
    }
    await loadTopics()
    toast.success(`Loaded ${topicList.length} topics for ${selSubj}`)
    setLoading(false)
  }

  async function addTopic() {
    if (!newTopic.name || !selSubj || selSubj === 'All') return
    const id = buildTopicId(selBoard, selLevel, selSubj, newTopic.name)
    await setDoc(doc(db,'users',user.uid,'topics',id), {
      ...newTopic, subjectId:selSubj, board:selBoard, qualification:selLevel, createdAt:serverTimestamp(), updatedAt:serverTimestamp()
    }, { merge:true })
    await awardXP(user.uid, 10, 'Topic added')
    await loadTopics()
    setNewTopic({ name:'', confidence:3, notes:'' })
    setShowAdd(false)
    toast.success('Topic added +10 XP')
  }

  async function updateConf(topicId, conf) {
    await updateDoc(doc(db,'users',user.uid,'topics',topicId), { confidence:conf, updatedAt:serverTimestamp() })
    setTopics(ts=>ts.map(t=>t.id===topicId?{...t,confidence:conf}:t))
    setAllTopics(ts=>ts.map(t=>t.id===topicId?{...t,confidence:conf}:t))
    await autoCompleteQuest(user.uid, 'rate_topics')
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db,'users',user.uid,'topics',id))
    setTopics(ts=>ts.filter(t=>t.id!==id))
    setAllTopics(ts=>ts.filter(t=>t.id!==id))
  }

  async function handleBulkDelete() {
    await Promise.all(selected.map(id=>deleteDoc(doc(db,'users',user.uid,'topics',id))))
    setTopics(ts=>ts.filter(t=>!selected.includes(t.id)))
    setAllTopics(ts=>ts.filter(t=>!selected.includes(t.id)))
    setSelected([])
    toast.success(`Deleted ${selected.length} topics`)
  }

  async function getAIAdvice(topic) {
    setLoadingAI(topic.id)
    const res = await getTopicAdvice(selSubj, topic.name, topic.confidence||3, [], user.uid)
    setAiAdvice(a=>({...a,[topic.id]:res.text||res.error||'Could not load advice — check your connection'}))
    setLoadingAI(null)
  }
  function toggleSelect(id) { setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]) }

  // Same current-qualification rule loadTopics() already applies for a single selected subject,
  // applied consistently for every subject here too — otherwise a switched subject's old- and
  // new-qualification topic docs would blend together in the "All Subjects" summary cards.
  function topicsForSubject(name) {
    const subj = profile?.subjects?.find(s => s.name === name)
    const level = getSubjectQualification(subj, profile)
    return allTopics.filter(t => t.subjectId === name && (t.qualification||level) === level)
  }

  const searching = search.trim().length > 0
  const searchLower = search.trim().toLowerCase()

  const subjectSummaries = subjects.map(name => {
    const docs = topicsForSubject(name)
    const pct = docs.length ? Math.round(docs.reduce((s,t)=>s+(t.confidence||3),0)/docs.length*20) : 0
    return { name, count: docs.length, total: specTotals[name], pct, subj: profile?.subjects?.find(s=>s.name===name) }
  })
  const visibleSubjectSummaries = searching
    ? subjectSummaries.filter(s => s.name.toLowerCase().includes(searchLower))
    : subjectSummaries

  const weak   = topics.filter(t=>(t.confidence||3)<=2)
  const mid    = topics.filter(t=>(t.confidence||3)===3)
  const strong = topics.filter(t=>(t.confidence||3)>=4)

  let filteredTopics = topics
  if (searching) filteredTopics = filteredTopics.filter(t => t.name.toLowerCase().includes(searchLower) || displayTopicName(t.name).toLowerCase().includes(searchLower))
  if (confFilter === 'weak')   filteredTopics = filteredTopics.filter(t=>(t.confidence||3)<=2)
  if (confFilter === 'mid')    filteredTopics = filteredTopics.filter(t=>(t.confidence||3)===3)
  if (confFilter === 'strong') filteredTopics = filteredTopics.filter(t=>(t.confidence||3)>=4)
  const sortedFiltered = [...filteredTopics].sort((a,b)=>(a.confidence||3)-(b.confidence||3))
  const paperGroups = groupTopicsByPaper(sortedFiltered)
  const showPaperHeaders = paperGroups.length > 1

  const SubjectIllustration = selSubj !== 'All' ? componentForSubject(selSubj) : null
  const selSpecTotal = specTotals[selSubj]

  return (
    <div className="fade-in">
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <h2 style={{marginBottom:2}}>Topics</h2>
          <p style={{color:'var(--text-muted)',fontSize:'0.85rem',margin:0}}>Track your confidence, topic by topic.</p>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {selected.length>0&&<button className="btn btn-danger btn-sm" onClick={handleBulkDelete}><Trash2 size={14}/> Delete {selected.length}</button>}
          {selSubj!=='All'&&<button className="btn btn-secondary btn-sm" onClick={handleSeedTopics} disabled={loading}>{loading?'Loading…':'Reload spec topics'}</button>}
          {selSubj!=='All'&&<button className="btn btn-primary btn-sm" onClick={()=>setShowAdd(true)}><Plus size={14}/> Add topic</button>}
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="empty-state">
          <GraduationCap size={40} className="topics-empty-illustration" style={{opacity:0.35}} />
          <p>Add your subjects to start tracking topics</p>
          <button className="btn btn-primary" onClick={()=>navigate('/settings')}>Go to settings</button>
        </div>
      ) : (
        <>
          {/* Toolbar: search + subject rail */}
          <div className="topics-toolbar">
            <div className="topics-searchbar">
              <div className="topics-search-input-wrap">
                <Search size={16}/>
                <input
                  className="input"
                  placeholder={selSubj==='All' ? 'Search subjects…' : `Search ${selSubj} topics…`}
                  value={search}
                  onChange={e=>setSearch(e.target.value)}
                />
                {search && <button className="topics-search-clear" onClick={()=>setSearch('')} aria-label="Clear search"><X size={14}/></button>}
              </div>
            </div>
            <div className="subject-rail">
              <button className={`subject-pill${selSubj==='All'?' active':''}`} onClick={()=>{setSelSubj('All');setSelected([])}}>
                <span className="subject-pill-all-icon"><Layers size={12}/></span> All Subjects
              </button>
              {subjects.map(s=>{
                const Icon = getSubjectIcon(s)
                const colour = subjectColour(s)
                return (
                  <button key={s} className={`subject-pill${selSubj===s?' active':''}`} onClick={()=>{setSelSubj(s);setSelected([])}}>
                    <span className="subject-pill-icon" style={{background:`${colour}1f`,color:colour}}><Icon size={12}/></span>
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {selSubj === 'All' ? (
            // ── All Subjects — summary cards ──
            visibleSubjectSummaries.length === 0 ? (
              <div className="empty-state">
                <Search size={28} style={{opacity:0.3}}/>
                <p>No subjects match "{search}"</p>
              </div>
            ) : (
              <div className="subject-summary-grid">
                {visibleSubjectSummaries.map(s => {
                  const Illustration = componentForSubject(s.name)
                  const colour = subjectColour(s.name)
                  const band = s.count ? CONF_COLOURS[Math.max(1,Math.min(5,Math.round(s.pct/20)))] : 'var(--text-muted)'
                  return (
                    <button key={s.name} className="card card-interactive subject-summary-card" onClick={()=>{setSelSubj(s.name);setSelected([]);setSearch('')}}>
                      <div className="subject-summary-top">
                        <div className="subject-summary-illustration" style={{background:`${colour}14`}}>
                          <Illustration size={38}/>
                        </div>
                        <div className="subject-summary-text">
                          <div className="subject-summary-name">{s.name}</div>
                          <div className="subject-summary-meta">{s.subj?.board||'AQA'} · {getSubjectQualification(s.subj, profile)}</div>
                        </div>
                        <div className="subject-summary-pct" style={{color:band}}>{s.count ? `${s.pct}%` : '—'}</div>
                      </div>
                      <div className="thin-progress"><div className="thin-progress-fill" style={{width:`${s.pct}%`,background:colour}}/></div>
                      <div className="subject-summary-foot">
                        {s.total!=null ? `${Math.min(s.count,s.total)} of ${s.total} spec topics tracked` : `${s.count} topic${s.count!==1?'s':''} tracked`}
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          ) : (
            <>
              {/* Subject header */}
              <div className="card topic-subject-header" style={{marginBottom:18}}>
                <div className="topic-subject-illustration">
                  {SubjectIllustration && <SubjectIllustration size={42}/>}
                </div>
                <div className="topic-subject-header-info">
                  <h3 style={{marginBottom:0}}>{selSubj}</h3>
                  <div className="topic-subject-header-meta">
                    {selBoard} · {selLevel}{selSpecTotal!=null?` · ${Math.min(topics.length,selSpecTotal)} of ${selSpecTotal} spec topics tracked`:''}
                  </div>
                </div>
              </div>

              {topics.length===0 ? (
                <div className="empty-state">
                  {SubjectIllustration
                    ? <SubjectIllustration size={64} className="topics-empty-illustration" style={{opacity:0.4}}/>
                    : <Layers size={36} className="topics-empty-illustration" style={{opacity:0.3}}/>}
                  <p>No topics yet for {selSubj}</p>
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn btn-primary" onClick={handleSeedTopics} disabled={loading}>{loading?'Loading…':'Load spec topics'}</button>
                    <button className="btn btn-secondary" onClick={()=>setShowAdd(true)}>Add manually</button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Confidence filter chips + view toggle */}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:12}}>
                    <div className="conf-filter-row">
                      {[{k:'weak',l:'Struggling',c:weak.length,col:'var(--danger)'},{k:'mid',l:'Building',c:mid.length,col:'var(--warning)'},{k:'strong',l:'Strong',c:strong.length,col:'var(--success)'}].map(s=>(
                        <button key={s.k} className={`conf-filter-chip${confFilter===s.k?' active':''}`} style={{color:s.col}} onClick={()=>setConfFilter(f=>f===s.k?null:s.k)} title={`Show only ${s.l.toLowerCase()} topics`}>
                          <span className="conf-filter-chip-num">{s.c}</span>
                          <span className="conf-filter-chip-label">{s.l}</span>
                        </button>
                      ))}
                    </div>
                    <div className="tabs" style={{padding:3}}>
                      <button className={`tab${view==='list'?' active':''}`} onClick={()=>setView('list')}><BarChart2 size={14}/> List</button>
                      <button className={`tab${view==='heat'?' active':''}`} onClick={()=>setView('heat')}><Grid size={14}/> Heatmap</button>
                      <button className={`tab${view==='priority'?' active':''}`} onClick={()=>setView('priority')}><Star size={14}/> Priority</button>
                      <button className={`tab${view==='resources'?' active':''}`} onClick={()=>setView('resources')}><ExternalLink size={14}/> Resources</button>
                      <button className={`tab${view==='notes'?' active':''}`} onClick={()=>setView('notes')}><StickyNote size={14}/> Notes</button>
                      <button className={`tab${view==='mastery'?' active':''}`} onClick={()=>setView('mastery')}><Layers size={14}/> Mastery</button>
                    </div>
                  </div>

                  {view==='priority' ? (
                    <PriorityList topics={topics} profile={profile} />
                  ) : view==='resources' ? (
                    <div>
                      <div style={{padding:'10px 14px',borderRadius:10,background:'var(--accent-pale)',border:'1px solid var(--border-strong)',marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
                        <div>
                          <div style={{fontWeight:600,fontSize:'0.85rem'}}>Revision guides for {selSubj}</div>
                          <div style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:2}}>Worked examples, mark scheme language and exam technique per topic</div>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={()=>navigate('/study?tab=notes&subject='+encodeURIComponent(selSubj)+'&board='+encodeURIComponent(selBoard)+'&level='+encodeURIComponent(selLevel||'GCSE'))}>
                          <BookOpen size={13}/> Open guides
                        </button>
                      </div>
                      <ResourcesPanel subject={selSubj} allSubjects={subjects}/>
                    </div>
                  ) : view==='notes' ? (
                    <div>
                      <div style={{marginBottom:16}}>
                        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
                          <input className="input" placeholder="Note title…" value={noteForm.title} onChange={e=>setNoteForm(f=>({...f,title:e.target.value}))}/>
                          <textarea className="textarea" style={{minHeight:100}} placeholder="Write your revision notes here…" value={noteForm.content} onChange={e=>setNoteForm(f=>({...f,content:e.target.value}))}/>
                          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                            {editingNote&&<button className="btn btn-ghost btn-sm" onClick={()=>{setEditingNote(null);setNoteForm({title:'',content:''})}}>Cancel</button>}
                            <button className="btn btn-primary btn-sm" onClick={handleSaveNote} disabled={noteSaving||!noteForm.title}>
                              <BookOpen size={13}/> {noteSaving?'Saving…':editingNote?'Update note':'Save note'}
                            </button>
                          </div>
                        </div>
                        {notes.length===0?(
                          <div className="empty-state" style={{padding:'20px 0'}}>
                            <StickyNote size={28} style={{opacity:0.3}}/>
                            <p style={{fontSize:'0.875rem'}}>No notes yet for {selSubj}</p>
                          </div>
                        ):(
                          <div style={{display:'flex',flexDirection:'column',gap:8}}>
                            {notes.map(n=>(
                              <div key={n.id} className="card">
                                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10}}>
                                  <div style={{flex:1}}>
                                    <div style={{fontWeight:700,fontSize:'0.88rem',marginBottom:4}}>{n.title}</div>
                                    <div style={{fontSize:'0.82rem',color:'var(--text-secondary)',whiteSpace:'pre-wrap',lineHeight:1.6}}>{n.content}</div>
                                    {n.createdAt&&<div style={{fontSize:'0.68rem',color:'var(--text-muted)',marginTop:6}}>{format(new Date(n.createdAt),'d MMM yyyy')}</div>}
                                  </div>
                                  <div style={{display:'flex',gap:5,flexShrink:0}}>
                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>{setEditingNote(n);setNoteForm({title:n.title,content:n.content})}}><Pencil size={12}/></button>
                                    <button className="btn btn-ghost btn-icon btn-sm" style={{color:'var(--danger)'}} onClick={()=>handleDeleteNote(n.id)}><Trash2 size={12}/></button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : view==='mastery' ? (
                    <div>
                      {(() => {
                        const total = filteredTopics.length
                        const mastered = filteredTopics.filter(t=>(t.confidence||3)>=4).length
                        const pct = total>0?Math.round((mastered/total)*100):0
                        return (
                          <div>
                            <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20,padding:'14px 16px',background:'linear-gradient(135deg,var(--accent-pale),var(--bg-muted))',borderRadius:12,border:'1px solid var(--border-strong)'}}>
                              <div style={{textAlign:'center',minWidth:70}}>
                                <div style={{fontSize:'2rem',fontWeight:800,color:'var(--accent-light)'}}>{pct}%</div>
                                <div style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>Mastered</div>
                              </div>
                              <div style={{flex:1}}>
                                <div style={{height:8,background:'var(--bg-hover)',borderRadius:4,overflow:'hidden'}}>
                                  <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,var(--accent),var(--accent-light))',borderRadius:4,transition:'width 0.5s ease'}}/>
                                </div>
                                <div style={{display:'flex',justifyContent:'space-between',marginTop:5,fontSize:'0.72rem',color:'var(--text-muted)'}}>
                                  <span>{mastered} strong (4-5)</span><span>{total-mastered} to improve</span>
                                </div>
                              </div>
                            </div>
                            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:6}}>
                              {[5,4,3,2,1].map(conf=>{
                                const confTopics = filteredTopics.filter(t=>(t.confidence||3)===conf)
                                if(!confTopics.length) return null
                                const confCols={5:'var(--success)',4:'#84cc16',3:'var(--warning)',2:'#f97316',1:'var(--danger)'}
                                return confTopics.map(t=>(
                                  <div key={t.id} style={{padding:'8px 10px',borderRadius:8,background:`${confCols[conf]}15`,border:`1px solid ${confCols[conf]}40`,cursor:'pointer'}}
                                    onClick={()=>updateConf(t.id, conf<5?conf+1:5)} title={`${displayTopicName(t.name)} — click to increase confidence`}>
                                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:4,marginBottom:3}}>
                                      <div style={{fontSize:'0.75rem',fontWeight:600,lineHeight:1.3}}>{displayTopicName(t.name)}</div>
                                      <Link to={`/topics/${t.id}`} onClick={e=>e.stopPropagation()} title="Open topic"
                                        style={{flexShrink:0,color:'var(--text-muted)',display:'flex',marginTop:1}}>
                                        <ExternalLink size={11}/>
                                      </Link>
                                    </div>
                                    <div style={{display:'flex',gap:2}}>{[1,2,3,4,5].map(n=>(
                                      <div key={n} style={{width:7,height:7,borderRadius:2,background:conf>=n?confCols[conf]:'var(--bg-hover)'}}/>
                                    ))}</div>
                                  </div>
                                ))
                              })}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  ) : view==='heat' ? (
                    <div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:6}}>
                        {sortedFiltered.map(t=>{
                          const conf = t.confidence||3
                          const bg = conf===1?'rgba(239,68,68,0.25)':conf===2?'rgba(249,115,22,0.2)':conf===3?'rgba(245,158,11,0.15)':conf===4?'rgba(132,204,22,0.15)':'rgba(34,197,94,0.2)'
                          const border = conf===1?'rgba(239,68,68,0.5)':conf===2?'rgba(249,115,22,0.4)':conf===3?'rgba(245,158,11,0.3)':conf===4?'rgba(132,204,22,0.3)':'rgba(34,197,94,0.4)'
                          return (
                            <div key={t.id} style={{padding:'8px 10px',borderRadius:'var(--radius-md)',background:bg,border:`1px solid ${border}`,cursor:'pointer',position:'relative'}}
                              title={`${displayTopicName(t.name)} — ${CONF_LABELS[conf]}`}>
                              <Link to={`/topics/${t.id}`} style={{fontSize:'0.78rem',fontWeight:600,lineHeight:1.3,marginBottom:4,display:'block',color:'inherit',textDecoration:'none'}}>
                                {displayTopicName(t.name)}
                              </Link>
                              <div className="conf-dots" style={{gap:3}}>
                                {[1,2,3,4,5].map(n=>(
                                  <div key={n} className={`conf-dot${conf>=n?` active-${n}`:''}`} style={{width:8,height:8}}
                                    onClick={()=>updateConf(t.id,n)}/>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div style={{display:'flex',gap:16,marginTop:16,flexWrap:'wrap',fontSize:'0.78rem',color:'var(--text-muted)'}}>
                        {[[1,'Struggling','var(--danger)'],[2,'Needs work','#f97316'],[3,'Getting there','var(--warning)'],[4,'Good','#84cc16'],[5,'Strong','var(--success)']].map(([n,l,c])=>(
                          <div key={n} style={{display:'flex',alignItems:'center',gap:4}}>
                            <div style={{width:10,height:10,borderRadius:2,background:c,opacity:0.7}}/>
                            {l}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // ── List view ──
                    sortedFiltered.length===0 ? (
                      <div className="empty-state">
                        <Search size={28} style={{opacity:0.3}}/>
                        <p>No topics match your search or filter</p>
                      </div>
                    ) : (
                      <div>
                        {paperGroups.map(group => (
                          <div key={group.key}>
                            {showPaperHeaders && <div className="paper-group-label">{group.label}</div>}
                            <div style={{display:'flex',flexDirection:'column',gap:8}}>
                              {group.topics.map(t => (
                                <TopicRow
                                  key={t.id}
                                  topic={t}
                                  subject={selSubj}
                                  board={selBoard}
                                  level={selLevel}
                                  selected={selected.includes(t.id)}
                                  onToggleSelect={()=>toggleSelect(t.id)}
                                  onSetConfidence={n=>updateConf(t.id,n)}
                                  onOpenAdvice={()=>getAIAdvice(t)}
                                  loadingAdvice={loadingAI===t.id}
                                  advice={aiAdvice[t.id]}
                                  onToggleResources={()=>setOpenResources(openResources===t.id?null:t.id)}
                                  resourcesOpen={openResources===t.id}
                                  onDelete={()=>handleDelete(t.id)}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      {showAdd&&(
        <div className="modal-overlay" onClick={()=>setShowAdd(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title">Add topic</span><button className="btn btn-ghost btn-icon" onClick={()=>setShowAdd(false)}><X size={18}/></button></div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div><label className="label">Topic name</label><input className="input" placeholder="e.g. Quadratic equations" value={newTopic.name} onChange={e=>setNewTopic(t=>({...t,name:e.target.value}))}/></div>
              <div>
                <label className="label">Confidence</label>
                <div className="conf-dots" style={{gap:8}}>
                  {[1,2,3,4,5].map(n=>(
                    <div key={n} className={`conf-dot${newTopic.confidence>=n?` active-${n}`:''}`} style={{width:20,height:20,cursor:'pointer'}} onClick={()=>setNewTopic(t=>({...t,confidence:n}))} title={CONF_LABELS[n]}/>
                  ))}
                </div>
                <span style={{fontSize:'0.78rem',color:CONF_COLOURS[newTopic.confidence],marginTop:4,display:'block'}}>{CONF_LABELS[newTopic.confidence]}</span>
              </div>
              <div><label className="label">Notes</label><textarea className="textarea" style={{minHeight:60}} value={newTopic.notes} onChange={e=>setNewTopic(t=>({...t,notes:e.target.value}))}/></div>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                <button className="btn btn-secondary" onClick={()=>setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={addTopic} disabled={!newTopic.name}>Add topic</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Topic row (List view) ───────────────────────────────────────────────────
function TopicRow({ topic, subject, board, level, selected, onToggleSelect, onSetConfidence, onOpenAdvice, loadingAdvice, advice, onToggleResources, resourcesOpen, onDelete }) {
  const navigate = useNavigate()
  const conf = topic.confidence || 3
  const cleanName = displayTopicName(topic.name)
  const showRaw = cleanName !== topic.name
  const Icon = getSubjectIcon(subject)
  const colour = subjectColour(subject)
  const subDone = (topic.subtopics||[]).filter(s=>s.done).length
  const subTotal = (topic.subtopics||[]).length

  return (
    <div className="card topic-row" style={{borderLeft:`3px solid ${CONF_COLOURS[conf]}`}}>
      <input type="checkbox" className="topic-row-select" checked={selected} onChange={onToggleSelect} aria-label={`Select ${cleanName}`}/>
      <div className="topic-row-icon" style={{background:`${colour}1a`,color:colour}}><Icon size={16}/></div>
      <div className="topic-row-main">
        <Link to={`/topics/${topic.id}`} className="topic-row-title">{cleanName}</Link>
        {showRaw && <div className="topic-row-sub" title={topic.name}>{topic.name}</div>}
        {subTotal>0 && <div className="topic-row-subprogress"><CheckCircle2 size={11}/> {subDone}/{subTotal} sub-topics</div>}
      </div>
      <div className="topic-row-right">
        <div className="topic-row-conf">
          <span className="confidence-pct" style={{color:CONF_COLOURS[conf]}}>{conf*20}%</span>
          <div className="conf-dots">
            {[1,2,3,4,5].map(n=>(
              <div key={n} className={`conf-dot${conf>=n?` active-${n}`:''}`} onClick={()=>onSetConfidence(n)} title={CONF_LABELS[n]}/>
            ))}
          </div>
        </div>
        <div className="topic-row-actions">
          <button className="btn btn-ghost btn-icon btn-sm" title="Study guide"
            onClick={()=>navigate('/study?tab=notes&topic='+encodeURIComponent(topic.name)+'&subject='+encodeURIComponent(subject)+'&board='+encodeURIComponent(board)+'&level='+encodeURIComponent(level||'GCSE'))}>
            <BookOpen size={13}/>
          </button>
          <button className="btn btn-ghost btn-icon btn-sm" title="AI advice" onClick={onOpenAdvice} disabled={loadingAdvice}>
            {loadingAdvice ? '…' : <Brain size={13}/>}
          </button>
          <button className="btn btn-ghost btn-icon btn-sm" title="Resources" onClick={onToggleResources}><Link2 size={13}/></button>
          <button className="btn btn-ghost btn-icon btn-sm" style={{color:'var(--danger)'}} title="Delete" onClick={onDelete}><Trash2 size={13}/></button>
        </div>
      </div>
      {advice && (
        <div style={{marginTop:10,width:'100%'}}>
          <AIOutput text={advice} label={`AI Advice — ${cleanName}`} />
        </div>
      )}
      {resourcesOpen && (
        <div style={{width:'100%'}}>
          <TopicResourcesPanel subject={subject} topicName={topic.name} />
        </div>
      )}
    </div>
  )
}

// ── Per-topic resources panel — shows tiered links for one specific topic ──────
function TopicResourcesPanel({ subject, topicName }) {
  const { verified, hub, search } = resolveTopicResources(subject, topicName)
  const linkStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    padding: '9px 12px', borderRadius: 14, background: 'var(--bg-card)',
    border: '2px solid var(--border)', textDecoration: 'none', color: 'inherit',
    fontSize: '0.82rem', fontWeight: 600,
  }
  return (
    <div style={{ marginTop: 10, padding: '12px 14px', borderRadius: 16,
      background: 'var(--bg-card)', border: '2px solid var(--border)' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-light)',
        letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
        Resources for "{displayTopicName(topicName)}"
      </div>

      {verified.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700, marginBottom: 5 }}>
            ✓ Verified direct links
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {verified.map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noreferrer" style={linkStyle}>
                <span>{l.name}</span>
                <ExternalLink size={12} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
              </a>
            ))}
          </div>
        </div>
      )}

      {hub.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 5 }}>
            Subject hub
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {hub.map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noreferrer" style={linkStyle}>
                <span>{l.name}</span>
                <ExternalLink size={12} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
              </a>
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 5 }}>
          Search for this exact topic
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {search.map((l, i) => (
            <a key={i} href={l.url} target="_blank" rel="noreferrer" style={{ ...linkStyle, background: 'var(--bg-hover)' }}>
              <span>{l.site}</span>
              <ExternalLink size={12} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function ResourcesPanel({ subject, allSubjects }) {
  const [selSubj, setSelSubj] = useState(subject || allSubjects[0] || '')
  const resources = SUBJECT_RESOURCES[selSubj] || []

  // Generic resources available for all subjects
  const generic = [
    { name:'Seneca Learning', url:'https://app.senecalearning.com', desc:'Free adaptive revision across all GCSE/A-Level subjects. Proven to improve grades 2× vs re-reading.' },
    { name:'Save My Exams', url:'https://www.savemyexams.com', desc:'Topic notes, flashcards and past paper questions for every major subject and exam board.' },
    { name:'Physics & Maths Tutor', url:'https://www.physicsandmathstutor.com', desc:'A-Level and GCSE resources, past papers and mark schemes across sciences and maths.' },
    { name:'BBC Bitesize', url:'https://www.bbc.co.uk/bitesize/levels/z98jmp3', desc:'Free GCSE revision across all subjects with quizzes and interactive content.' },
    { name:'Khan Academy', url:'https://www.khanacademy.org', desc:'Free video lessons and practice exercises for maths, sciences and more — especially good for filling in gaps.' },
    { name:'Quizlet', url:'https://quizlet.com', desc:'Create or use pre-made flashcard sets for any subject — good for definitions and vocabulary.' },
    { name:'Past Papers — AQA', url:'https://www.aqa.org.uk/past-papers', desc:'Official AQA past papers and mark schemes, free to download.' },
    { name:'Past Papers — Edexcel', url:'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', desc:'Official Pearson/Edexcel past papers.' },
    { name:'Past Papers — OCR', url:'https://www.ocr.org.uk/administration/support-and-tools/past-papers-finder/', desc:'Official OCR past papers and mark schemes.' },
  ]

  return (
    <div style={{padding:'4px 0'}}>
      {/* Subject selector */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,flexWrap:'wrap'}}>
        <label className="label" style={{margin:0,whiteSpace:'nowrap'}}>Resources for:</label>
        <select className="select" style={{flex:1,maxWidth:280}} value={selSubj} onChange={e=>setSelSubj(e.target.value)}>
          {allSubjects.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Subject-specific resources */}
      {resources.length > 0 && (
        <div style={{marginBottom:20}}>
          <h4 style={{marginBottom:10,fontSize:'0.9rem',color:'var(--accent-light)'}}>
            Best resources for {selSubj}
          </h4>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:10}}>
            {resources.map(r => (
              <a key={r.name} href={r.url} target="_blank" rel="noreferrer"
                style={{display:'flex',flexDirection:'column',gap:4,padding:'12px 14px',background:'var(--bg-card)',borderRadius:'var(--radius-md)',border:'2px solid var(--border)',textDecoration:'none',color:'inherit'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                  <span style={{fontWeight:700,fontSize:'0.875rem',color:'var(--text-primary)'}}>{r.name}</span>
                  <ExternalLink size={13} style={{flexShrink:0,color:'var(--text-muted)'}}/>
                </div>
                <span style={{fontSize:'0.78rem',color:'var(--text-secondary)',lineHeight:1.5}}>{r.desc}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {resources.length === 0 && (
        <div style={{padding:'12px 14px',background:'var(--bg-card)',borderRadius:'var(--radius-md)',border:'2px solid var(--border)',marginBottom:20,fontSize:'0.875rem',color:'var(--text-secondary)'}}>
          No subject-specific resources listed yet for {selSubj}. Use the general resources below.
        </div>
      )}

      {/* General resources */}
      <h4 style={{marginBottom:10,fontSize:'0.9rem',color:'var(--text-muted)'}}>
        General revision resources (all subjects)
      </h4>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:10}}>
        {generic.map(r => (
          <a key={r.name} href={r.url} target="_blank" rel="noreferrer"
            style={{display:'flex',flexDirection:'column',gap:4,padding:'12px 14px',background:'var(--bg-card)',borderRadius:'var(--radius-md)',border:'2px solid var(--border)',textDecoration:'none',color:'inherit'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
              <span style={{fontWeight:700,fontSize:'0.875rem',color:'var(--text-primary)'}}>{r.name}</span>
              <ExternalLink size={13} style={{flexShrink:0,color:'var(--text-muted)'}}/>
            </div>
            <span style={{fontSize:'0.78rem',color:'var(--text-secondary)',lineHeight:1.5}}>{r.desc}</span>
          </a>
        ))}
      </div>

      <p style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:12,lineHeight:1.6}}>
        All resources listed are free. Clicking opens them in a new tab. Use the AI Advice button on individual topics for personalised recommendations for specific topics.
      </p>
    </div>
  )
}
