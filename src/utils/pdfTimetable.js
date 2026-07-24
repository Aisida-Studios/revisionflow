// src/utils/pdfTimetable.js
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format, startOfWeek, addDays } from 'date-fns'

const PURPLE = [124,58,237]
const DARK   = [15,10,30]
const LIGHT  = [245,243,255]
const WHITE  = [255,255,255]
const GREY   = [100,100,120]

const PALETTE = [[167,139,250],[96,165,250],[52,211,153],[251,191,36],[248,113,113],[236,72,153],[34,211,238],[132,204,22],[249,115,22],[168,85,247]]
const SUBJECT_PDF_COLOURS = {}
let paletteIdx = 0
function subjectColour(name) {
  if (!SUBJECT_PDF_COLOURS[name]) { SUBJECT_PDF_COLOURS[name] = PALETTE[paletteIdx % PALETTE.length]; paletteIdx++ }
  return SUBJECT_PDF_COLOURS[name]
}

export async function generateTimetablePDF(profile, sessions, examDates) {
  const doc = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' })
  const W=297, H=210, M=12

  doc.setFillColor(...PURPLE)
  doc.rect(0,0,W,22,'F')
  doc.setTextColor(...WHITE)
  doc.setFontSize(15)
  doc.setFont('helvetica','bold')
  doc.text('RevisionFlow — Revision Timetable', M, 14)
  doc.setFontSize(9)
  doc.setFont('helvetica','normal')
  doc.text(`${profile?.displayName||'Student'}  ·  ${format(new Date(),'d MMMM yyyy')}`, W-M, 14, {align:'right'})

  let y = 28

  // ── Exam Dates section — full table ────────────────────────────────────────
  const upcoming = (examDates||[])
    .filter(e=>new Date(e.examDate)>=new Date())
    .sort((a,b)=>new Date(a.examDate)-new Date(b.examDate))

  if (upcoming.length) {
    doc.setFillColor(...PURPLE)
    doc.rect(M,y,W-M*2,6,'F')
    doc.setTextColor(...WHITE)
    doc.setFontSize(7.5)
    doc.setFont('helvetica','bold')
    doc.text('EXAM DATES', M+3, y+4)
    y += 6

    // Headers
    const cols = [70, 40, 35, 35, 50, 40]
    const headers = ['Subject','Board','Paper','Date','Days remaining','Grade target']
    let hx = M
    doc.setFillColor(230,225,255)
    doc.rect(M, y, W-M*2, 5.5, 'F')
    doc.setTextColor(...DARK)
    doc.setFontSize(6.5)
    doc.setFont('helvetica','bold')
    headers.forEach((h,i)=>{ doc.text(h, hx+2, y+3.8); hx+=cols[i] })
    y += 5.5

    upcoming.forEach((e,idx)=>{
      const days = Math.ceil((new Date(e.examDate)-new Date())/86400000)
      const daysLabel = days <= 0 ? 'TODAY!' : days === 1 ? 'Tomorrow' : `${days} days`
      const isToday = days <= 0
      const isUrgent = days <= 7

      doc.setFillColor(...(idx%2===0 ? [248,245,255] : [255,255,255]))
      doc.rect(M, y, W-M*2, 7, 'F')
      doc.setDrawColor(220,215,240)
      doc.rect(M, y, W-M*2, 7, 'S')

      // Urgency colour bar on left
      if (isToday) doc.setFillColor(239,68,68)
      else if (isUrgent) doc.setFillColor(245,158,11)
      else doc.setFillColor(34,197,94)
      doc.rect(M, y, 2, 7, 'F')

      const rowData = [
        e.subject || '–',
        e.board || '–',
        `Paper ${e.paper}${e.paperName ? ` (${e.paperName})` : ''}`,
        format(new Date(e.examDate), 'd MMM yyyy'),
        daysLabel,
        e.targetGrade ? `Target: ${e.targetGrade}` : '–',
      ]
      let rx = M
      doc.setFont('helvetica', idx===0?'bold':'normal')
      doc.setFontSize(6.5)
      rowData.forEach((val,i)=>{
        if (i === 4) {
          doc.setTextColor(...(isToday ? [239,68,68] : isUrgent ? [180,90,0] : [5,100,50]))
          doc.setFont('helvetica','bold')
        } else {
          doc.setTextColor(...DARK)
          doc.setFont('helvetica','normal')
        }
        const truncated = val.length > 22 ? val.slice(0,20)+'…' : val
        doc.text(truncated, rx+3, y+4.5)
        rx += cols[i]
      })
      y += 7
    })
    y += 6
  }

  const weekStart = startOfWeek(new Date(),{weekStartsOn:1})
  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const colW = (W-M*2)/7
  const rowH = 18

  doc.setFontSize(9);doc.setFont('helvetica','bold');doc.setTextColor(...DARK)
  doc.text('4-Week Revision Schedule', M, y);y+=4

  for (let week=0; week<4; week++) {
    const wStart = addDays(weekStart,week*7)
    const wEnd   = addDays(wStart,6)

    doc.setFillColor(...PURPLE);doc.rect(M,y,W-M*2,5.5,'F')
    doc.setTextColor(...WHITE);doc.setFontSize(6.5);doc.setFont('helvetica','bold')
    doc.text(`Week of ${format(wStart,'d MMM')} – ${format(wEnd,'d MMM yyyy')}`, M+3, y+3.8)
    y+=5.5

    DAYS.forEach((day,i)=>{
      doc.setFillColor(230,225,255);doc.rect(M+i*colW,y,colW,4.5,'F')
      doc.setTextColor(...DARK);doc.setFontSize(6.5);doc.setFont('helvetica','bold')
      doc.text(`${day} ${format(addDays(wStart,i),'d')}`,M+i*colW+colW/2,y+3.2,{align:'center'})
    })
    y+=4.5

    for (let row=0; row<3; row++) {
      DAYS.forEach((_,i)=>{
        const dayStr = format(addDays(wStart,i),'yyyy-MM-dd')
        const daySessions = (sessions||[]).filter(s=>{const sd=s.date||(s.startTime?String(s.startTime).substring(0,10):null);return sd===dayStr&&!s.completed}).sort((a,b)=>(a.start||'').localeCompare(b.start||''))
        const session = daySessions[row]
        const x=M+i*colW, cellY=y+row*rowH
        doc.setFillColor(...WHITE);doc.setDrawColor(220,215,240);doc.rect(x,cellY,colW,rowH,'FD')
        if (session) {
          const rgb=subjectColour(session.subject)
          doc.setFillColor(...rgb.map(c=>Math.min(255,c+60)));doc.rect(x,cellY,2,rowH,'F')
          doc.setTextColor(...DARK);doc.setFontSize(6);doc.setFont('helvetica','bold')
          doc.text((session.subject||'').slice(0,16),x+4,cellY+5)
          doc.setFont('helvetica','normal');doc.setFontSize(5.5);doc.setTextColor(...GREY)
          const t=session.type==='Content Revision'?'Content':session.type==='Exam Practice'?'Exam prac.':(session.type||'').slice(0,14)
          doc.text(t,x+4,cellY+10)
          if(session.start)doc.text(session.start,x+4,cellY+14.5)
        }
      })
    }
    y+=3*rowH+2
    if(y>H-20&&week<3){doc.addPage('landscape');y=14}
  }

  const pages=doc.internal.getNumberOfPages()
  for(let p=1;p<=pages;p++){
    doc.setPage(p)
    doc.setFillColor(...PURPLE);doc.rect(0,H-7,W,7,'F')
    doc.setTextColor(...WHITE);doc.setFontSize(6);doc.setFont('helvetica','normal')
    doc.text('RevisionFlow — www.revisionflow.co.uk', M, H-2.5)
    doc.text(`Page ${p} of ${pages}`, W-M, H-2.5, {align:'right'})
  }

  doc.save(`revision-timetable-${format(new Date(),'yyyy-MM-dd')}.pdf`)
}
