// src/utils/pdfReport.js
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'

const PURPLE  = [124, 58,  237]
const DARK    = [26,  17,  46]
const MID     = [44,  62,  80]
const WHITE   = [255, 255, 255]
const SUCCESS = [34,  197, 94]
const WARNING = [245, 158, 11]
const DANGER  = [239, 68,  68]

function gradeRgb(grade) {
  const map = {
    '9':[124,58,237],'8':[37,99,235],'7':[8,145,178],'6':[5,150,105],
    '5':[101,163,13],'4':[202,138,4],'3':[217,119,6],'2':[234,88,12],
    '1':[220,38,38],'U':[107,114,128],
    'A*':[124,58,237],'A':[37,99,235],'B':[5,150,105],'C':[202,138,4],
    'D':[217,119,6],'E':[220,38,38],
  }
  return map[String(grade)] || [107,114,128]
}

export async function generateProgressReport(profile, paperAttempts, topics, mistakes, examDates) {
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 14
  let y = 0

  function newPage() {
    doc.addPage()
    doc.setFillColor(...DARK)
    doc.rect(0,0,W,10,'F')
    doc.setTextColor(...WHITE)
    doc.setFontSize(7)
    doc.setFont('helvetica','italic')
    doc.text(`RevisionFlow · ${profile?.displayName||'Student'}`, M, 6.5)
    doc.text(`Generated ${format(new Date(),'d MMM yyyy')}`, W-M, 6.5, {align:'right'})
    y = 22
  }

  function checkSpace(n) { if (y+n > H-20) newPage() }

  function sectionHeader(title) {
    checkSpace(16)
    doc.setFillColor(...PURPLE)
    doc.roundedRect(M,y,W-M*2,8,2,2,'F')
    doc.setTextColor(...WHITE)
    doc.setFont('helvetica','bold')
    doc.setFontSize(9)
    doc.text(title, M+4, y+5.5)
    y += 12
  }

  function bodyText(text) {
    checkSpace(7)
    doc.setTextColor(60,50,90)
    doc.setFont('helvetica','normal')
    doc.setFontSize(8.5)
    const lines = doc.splitTextToSize(text, W-M*2)
    doc.text(lines, M, y)
    y += lines.length*5+2
  }

  // ── Cover ────────────────────────────────────────────────────────────────
  doc.setFillColor(...DARK)
  doc.rect(0,0,W,H,'F')
  doc.setFillColor(...PURPLE)
  doc.rect(0,H*0.35,W,H*0.3,'F')
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica','bold')
  doc.setFontSize(26)
  doc.text('RevisionFlow',W/2,80,{align:'center'})
  doc.setFontSize(13)
  doc.setTextColor(200,180,255)
  doc.text('Progress Report',W/2,92,{align:'center'})
  doc.setFillColor(44,62,80)
  doc.roundedRect(M*2,105,W-M*4,28,3,3,'F')
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica','bold')
  doc.setFontSize(15)
  doc.text(profile?.displayName||'Student',W/2,116,{align:'center'})
  doc.setFont('helvetica','normal')
  doc.setFontSize(9)
  doc.setTextColor(180,160,220)
  doc.text(`Level ${profile?.level||1}  ·  ${profile?.xp||0} XP  ·  ${profile?.streak||0} day streak`,W/2,126,{align:'center'})

  const boxW=36,boxH=22,boxY=148,gap=5
  const startX=(W-(boxW*4+gap*3))/2
  ;[
    {label:'Subjects',value:(profile?.subjects||[]).length,col:PURPLE},
    {label:'Papers',  value:(paperAttempts||[]).length,    col:[37,99,235]},
    {label:'Topics',  value:(topics||[]).length,           col:[5,150,105]},
    {label:'Mistakes',value:(mistakes||[]).length,         col:[217,119,6]},
  ].forEach((s,i)=>{
    const bx=startX+i*(boxW+gap)
    doc.setFillColor(...s.col)
    doc.roundedRect(bx,boxY,boxW,boxH,2,2,'F')
    doc.setTextColor(...WHITE)
    doc.setFont('helvetica','bold')
    doc.setFontSize(14)
    doc.text(String(s.value),bx+boxW/2,boxY+boxH*0.55,{align:'center'})
    doc.setFontSize(6.5)
    doc.setFont('helvetica','normal')
    doc.text(s.label,bx+boxW/2,boxY+boxH*0.82,{align:'center'})
  })
  doc.setTextColor(150,130,200)
  doc.setFontSize(8)
  doc.setFont('helvetica','italic')
  doc.text(`Generated ${format(new Date(),'EEEE, d MMMM yyyy')}`,W/2,184,{align:'center'})

  // ── Page 2: Subjects & Exams ─────────────────────────────────────────────
  newPage()
  sectionHeader('Subjects & Grade Targets')
  if ((profile?.subjects||[]).length > 0) {
    doc.autoTable({
      startY:y,
      head:[['Subject','Level','Board','Tier','Starting','Current','Target']],
      body:profile.subjects.map(s=>[s.name,s.qualification||profile.qualification||'GCSE',s.board,s.tier&&s.tier!=='N/A'?s.tier:'–',profile.startingGrades?.[s.name]||'–',s.currentGrade||'–',s.targetGrade||'9']),
      margin:{left:M,right:M},
      styles:{fontSize:8.5,cellPadding:3,textColor:[30,20,50]},
      headStyles:{fillColor:DARK,textColor:WHITE,fontStyle:'bold',fontSize:8},
      alternateRowStyles:{fillColor:[248,245,255]},
      columnStyles:{0:{fontStyle:'bold'},5:{fontStyle:'bold'}},
      didParseCell(d){if(d.section==='body'&&d.column.index===5)d.cell.styles.textColor=gradeRgb(d.cell.raw)},
      theme:'grid',
    })
    y=doc.lastAutoTable.finalY+8
  }

  if ((examDates||[]).length > 0) {
    checkSpace(20)
    sectionHeader('Exam Countdown')
    const upcoming=(examDates||[]).filter(e=>new Date(e.examDate)>=new Date()).sort((a,b)=>new Date(a.examDate)-new Date(b.examDate)).slice(0,10)
    if(upcoming.length){
      doc.autoTable({
        startY:y,
        head:[['Subject','Paper','Date','Days']],
        body:upcoming.map(e=>{const d=Math.ceil((new Date(e.examDate)-new Date())/86400000);return[e.subject,`Paper ${e.paper}`,format(new Date(e.examDate),'d MMM yyyy'),d<=0?'Today!':d===1?'Tomorrow':`${d} days`]}),
        margin:{left:M,right:M},
        styles:{fontSize:8.5,cellPadding:3,textColor:[30,20,50]},
        headStyles:{fillColor:DARK,textColor:WHITE,fontStyle:'bold',fontSize:8},
        alternateRowStyles:{fillColor:[248,245,255]},
        didParseCell(d){if(d.section==='body'&&d.column.index===3){const v=parseInt(d.cell.raw);d.cell.styles.textColor=(d.cell.raw==='Today!'||d.cell.raw==='Tomorrow')?DANGER:v<=14?WARNING:SUCCESS;d.cell.styles.fontStyle='bold'}},
        theme:'grid',
      })
      y=doc.lastAutoTable.finalY+8
    }
  }

  // ── Page 3: Papers ───────────────────────────────────────────────────────
  if ((paperAttempts||[]).length > 0) {
    newPage()
    sectionHeader('Past Paper Performance')
    const subjs=[...new Set(paperAttempts.map(a=>a.subject))]
    doc.autoTable({
      startY:y,
      head:[['Subject','Papers','Avg %','Latest','Best Grade','Best %']],
      body:subjs.map(s=>{const sub=paperAttempts.filter(a=>a.subject===s);const avg=Math.round(sub.reduce((sum,a)=>sum+(a.percentage||0),0)/sub.length);const best=sub.reduce((b,a)=>(a.percentage||0)>(b.percentage||0)?a:b,sub[0]);return[s,sub.length,`${avg}%`,sub[0]?.grade||'–',best?.grade||'–',`${best?.percentage||0}%`]}),
      margin:{left:M,right:M},
      styles:{fontSize:8.5,cellPadding:3,textColor:[30,20,50]},
      headStyles:{fillColor:DARK,textColor:WHITE,fontStyle:'bold',fontSize:8},
      alternateRowStyles:{fillColor:[248,245,255]},
      didParseCell(d){if(d.section==='body'&&(d.column.index===3||d.column.index===4)){d.cell.styles.textColor=gradeRgb(d.cell.raw);d.cell.styles.fontStyle='bold'}},
      theme:'grid',
    })
    y=doc.lastAutoTable.finalY+8
    checkSpace(30)
    doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...MID)
    doc.text('Recent attempts (last 20)',M,y);y+=6
    doc.autoTable({
      startY:y,
      head:[['Subject','Paper','Board','Year','Score','%','Grade']],
      body:paperAttempts.slice(0,20).map(a=>[a.subject,`P${a.paper}`,a.board,String(a.year),`${a.score}/${a.maxMarks}`,`${a.percentage}%`,a.grade||'–']),
      margin:{left:M,right:M},
      styles:{fontSize:7.5,cellPadding:2.5,textColor:[30,20,50]},
      headStyles:{fillColor:MID,textColor:WHITE,fontStyle:'bold',fontSize:7.5},
      alternateRowStyles:{fillColor:[248,245,255]},
      didParseCell(d){if(d.section==='body'&&d.column.index===6){d.cell.styles.textColor=gradeRgb(d.cell.raw);d.cell.styles.fontStyle='bold'}},
      theme:'grid',
    })
    y=doc.lastAutoTable.finalY+8
  }

  // ── Page 4: Topics ───────────────────────────────────────────────────────
  if ((topics||[]).length > 0) {
    newPage()
    sectionHeader('Topic Confidence Overview')
    const subjs=[...new Set(topics.map(t=>t.subjectId).filter(Boolean))]
    for(const subj of subjs){
      checkSpace(20)
      doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...MID)
      doc.text(subj,M,y);y+=5
      const st=topics.filter(t=>t.subjectId===subj)
      const counts=[1,2,3,4,5].map(c=>st.filter(t=>(t.confidence||3)===c).length)
      const maxVal=Math.max(...counts,1)
      const barW=(W-M*2)/5-3,barMaxH=14
      counts.forEach((count,i)=>{
        const bh=Math.max(1.5,(count/maxVal)*barMaxH),bx=M+i*(barW+3),by=y+barMaxH-bh
        doc.setFillColor(...[[239,68,68],[249,115,22],[245,158,11],[132,204,22],[34,197,94]][i])
        doc.rect(bx,by,barW,bh,'F')
        doc.setFontSize(6);doc.setFont('helvetica','bold');doc.setTextColor(60,50,90)
        if(count>0)doc.text(String(count),bx+barW/2,by-1,{align:'center'})
        doc.setFont('helvetica','normal');doc.setFontSize(5.5)
        doc.text(['1','2','3','4','5'][i],bx+barW/2,y+barMaxH+4,{align:'center'})
      })
      const weak=st.filter(t=>(t.confidence||3)<=2).slice(0,5)
      if(weak.length){doc.setFontSize(7);doc.setFont('helvetica','bold');doc.setTextColor(60,50,90);doc.text('Weakest:',M,y+8);doc.setFont('helvetica','normal');doc.setTextColor(...DANGER);weak.forEach((t,i)=>doc.text(`• ${t.name}`,M+2,y+13+i*4.5))}
      y+=barMaxH+22
    }
  }

  // ── Page 5: Mistakes & Summary ───────────────────────────────────────────
  newPage()
  if((mistakes||[]).length>0){
    sectionHeader('Mistake Log Summary')
    const byS={}
    mistakes.forEach(m=>{if(!byS[m.subject])byS[m.subject]={total:0,unresolved:0};byS[m.subject].total++;if(!m.resolved)byS[m.subject].unresolved++})
    doc.autoTable({
      startY:y,
      head:[['Subject','Total','Unresolved','Resolved']],
      body:Object.entries(byS).map(([s,d])=>[s,d.total,d.unresolved,d.total-d.unresolved]),
      margin:{left:M,right:M},
      styles:{fontSize:8.5,cellPadding:3,textColor:[30,20,50]},
      headStyles:{fillColor:DARK,textColor:WHITE,fontStyle:'bold',fontSize:8},
      alternateRowStyles:{fillColor:[248,245,255]},
      didParseCell(d){if(d.section==='body'&&d.column.index===2&&parseInt(d.cell.raw)>0){d.cell.styles.textColor=DANGER;d.cell.styles.fontStyle='bold'}if(d.section==='body'&&d.column.index===3)d.cell.styles.textColor=SUCCESS},
      theme:'grid',
    })
    y=doc.lastAutoTable.finalY+10
  }

  checkSpace(40)
  sectionHeader('Gamification Summary')
  const gW=(W-M*2-10)/3,gY=y
  ;[{label:'Total XP',value:(profile?.xp||0).toLocaleString(),col:PURPLE},{label:'Level',value:String(profile?.level||1),col:[37,99,235]},{label:'Day Streak',value:`${profile?.streak||0} 🔥`,col:WARNING}].forEach((s,i)=>{
    const bx=M+i*(gW+5)
    doc.setFillColor(...s.col);doc.roundedRect(bx,gY,gW,20,3,3,'F')
    doc.setTextColor(...WHITE);doc.setFont('helvetica','bold');doc.setFontSize(15)
    doc.text(s.value,bx+gW/2,gY+12,{align:'center'})
    doc.setFontSize(7);doc.setFont('helvetica','normal')
    doc.text(s.label,bx+gW/2,gY+18,{align:'center'})
  })
  y=gY+28
  if((profile?.badges||[]).length>0)bodyText(`Badges earned: ${profile.badges.length} — great work!`)

  // Footer
  const pages=doc.internal.getNumberOfPages()
  for(let p=1;p<=pages;p++){
    doc.setPage(p)
    doc.setTextColor(150,130,200);doc.setFont('helvetica','italic');doc.setFontSize(7)
    doc.text(`RevisionFlow · ${profile?.displayName||'Student'} · ${format(new Date(),'d MMMM yyyy')}`,W/2,H-6,{align:'center'})
  }

  const filename=`RevisionFlow_Report_${(profile?.displayName||'Student').replace(/\s/g,'_')}_${format(new Date(),'yyyy-MM-dd')}.pdf`
  doc.save(filename)
  return filename
}
