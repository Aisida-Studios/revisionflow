// src/utils/pdfTimetable.js
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format, startOfWeek, addDays } from 'date-fns'
import { daysUntilExam, parseLocalDate } from './examUtils'

const ACCENT = [20,83,45]
const DARK   = [20,28,24]
const LIGHT  = [230,245,236]
const WHITE  = [255,255,255]
const GREY   = [100,100,120]

const PALETTE = [[13,148,136],[96,165,250],[52,211,153],[251,191,36],[248,113,113],[236,72,153],[34,211,238],[132,204,22],[249,115,22],[22,101,52]]
const SUBJECT_PDF_COLOURS = {}
let paletteIdx = 0
function subjectColour(name) {
  if (!SUBJECT_PDF_COLOURS[name]) { SUBJECT_PDF_COLOURS[name] = PALETTE[paletteIdx % PALETTE.length]; paletteIdx++ }
  return SUBJECT_PDF_COLOURS[name]
}

export async function generateTimetablePDF(profile, sessions, examDates) {
  const doc = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' })
  const W=297, H=210, M=12

  doc.setFillColor(...ACCENT)
  doc.rect(0,0,W,22,'F')
  doc.setTextColor(...WHITE)
  doc.setFontSize(15)
  doc.setFont('helvetica','bold')
  doc.text('RevisionFlow â€” Revision Timetable', M, 14)
  doc.setFontSize(9)
  doc.setFont('helvetica','normal')
  doc.text(`${profile?.displayName||'Student'}  Â·  ${format(new Date(),'d MMMM yyyy')}`, W-M, 14, {align:'right'})

  let y = 28

  // â”€â”€ Exam Dates section â€” full table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const upcoming = (examDates||[])
    .map(e => ({ ...e, daysLeft: daysUntilExam(e.examDate) }))
    .filter(e => e.daysLeft != null && e.daysLeft >= 0)
    .sort((a,b) => a.daysLeft - b.daysLeft)

  if (upcoming.length) {
    doc.setFillColor(...ACCENT)
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
    doc.setFillColor(224,242,229)
    doc.rect(M, y, W-M*2, 5.5, 'F')
    doc.setTextColor(...DARK)
    doc.setFontSize(6.5)
    doc.setFont('helvetica','bold')
    headers.forEach((h,i)=>{ doc.text(h, hx+2, y+3.8); hx+=cols[i] })
    y += 5.5

    upcoming.forEach((e,idx)=>{
      const days = e.daysLeft
      const daysLabel = days <= 0 ? 'TODAY!' : days === 1 ? 'Tomorrow' : `${days} days`
      const isToday = days <= 0
      const isUrgent = days <= 7

      doc.setFillColor(...(idx%2===0 ? [243,248,245] : [255,255,255]))
      doc.rect(M, y, W-M*2, 7, 'F')
      doc.setDrawColor(210,225,215)
      doc.rect(M, y, W-M*2, 7, 'S')

      // Urgency colour bar on left
      if (isToday) doc.setFillColor(239,68,68)
      else if (isUrgent) doc.setFillColor(245,158,11)
      else doc.setFillColor(34,197,94)
      doc.rect(M, y, 2, 7, 'F')

      const rowData = [
        e.subject || 'â€“',
        e.board || 'â€“',
        `Paper ${e.paper}${e.paperName ? ` (${e.paperName})` : ''}`,
        format(parseLocalDate(e.examDate), 'd MMM yyyy'),
        daysLabel,
        e.targetGrade ? `Target: ${e.targetGrade}` : 'â€“',
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
        const truncated = val.length > 22 ? val.slice(0,20)+'â€¦' : val
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

    doc.setFillColor(...ACCENT);doc.rect(M,y,W-M*2,5.5,'F')
    doc.setTextColor(...WHITE);doc.setFontSize(6.5);doc.setFont('helvetica','bold')
    doc.text(`Week of ${format(wStart,'d MMM')} â€“ ${format(wEnd,'d MMM yyyy')}`, M+3, y+3.8)
    y+=5.5

    DAYS.forEach((day,i)=>{
      doc.setFillColor(224,242,229);doc.rect(M+i*colW,y,colW,4.5,'F')
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
        doc.setFillColor(...WHITE);doc.setDrawColor(210,225,215);doc.rect(x,cellY,colW,rowH,'FD')
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
    doc.setFillColor(...ACCENT);doc.rect(0,H-7,W,7,'F')
    doc.setTextColor(...WHITE);doc.setFontSize(6);doc.setFont('helvetica','normal')
    doc.text('RevisionFlow â€” www.revisionflow.co.uk', M, H-2.5)
    doc.text(`Page ${p} of ${pages}`, W-M, H-2.5, {align:'right'})
  }

  doc.save(`revision-timetable-${format(new Date(),'yyyy-MM-dd')}.pdf`)
}


// Printable export of the editable school timetable itself. This intentionally exports
// the student's configured lesson/free-period grid rather than the generated revision schedule.
export async function generateSchoolTimetablePDF(profile, timetable, rotation, holidays = [], blank = false) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const W = 297, H = 210, M = 10
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  const allPeriods = DAYS.flatMap(day => (timetable?.[day] || []).filter(Boolean))
  const times = [...new Set(allPeriods.flatMap(p => [p.startTime, p.endTime]).filter(Boolean))].sort()
  const rows = []
  for (let i = 0; i < times.length - 1; i++) rows.push([times[i], times[i+1]])

  doc.setFillColor(...ACCENT); doc.rect(0,0,W,22,'F')
  doc.setTextColor(...WHITE); doc.setFont('helvetica','bold'); doc.setFontSize(15)
  doc.text(`RevisionFlow â€” ${blank ? 'Blank School Timetable' : 'School Timetable'}`, M, 14)
  doc.setFont('helvetica','normal'); doc.setFontSize(8.5)
  doc.text(profile?.displayName || 'Student', W-M, 14, { align:'right' })

  let y = 29
  if (rotation?.enabled) {
    doc.setTextColor(...DARK); doc.setFontSize(7)
    doc.text(`Two-week rotation enabled Â· even ISO weeks = Week ${rotation.evenWeekLabel}`, M, y)
    y += 5
  }

  const colW = (W - M*2 - 18) / 7
  const timeW = 18
  const headerH = 7
  const rowH = Math.max(10, Math.min(18, (H - y - 32) / Math.max(rows.length, 1)))
  doc.setFillColor(224,242,229); doc.rect(M,y,timeW,headerH,'F')
  doc.setTextColor(...DARK); doc.setFont('helvetica','bold'); doc.setFontSize(7)
  doc.text('Time', M+2, y+4.8)
  DAYS.forEach((day,i)=>{
    const x=M+timeW+i*colW
    doc.setFillColor(224,242,229); doc.rect(x,y,colW,headerH,'F')
    doc.text(day.slice(0,3), x+colW/2, y+4.8, {align:'center'})
  })
  y += headerH

  if (!rows.length) {
    doc.setFont('helvetica','normal'); doc.setTextColor(...GREY); doc.setFontSize(8)
    doc.text('No periods have been added yet.', M+timeW+5, y+10)
  } else {
    rows.forEach(([start,end])=>{
      doc.setFillColor(248,250,249); doc.rect(M,y,timeW,rowH,'FD')
      doc.setTextColor(...GREY); doc.setFontSize(6); doc.setFont('helvetica','normal')
      doc.text(`${start}`,M+2,y+rowH/2-1)
      doc.text(`${end}`,M+2,y+rowH/2+3)
      DAYS.forEach((day,i)=>{
        const x=M+timeW+i*colW
        doc.setFillColor(...WHITE); doc.rect(x,y,colW,rowH,'FD')
        const periods=(timetable?.[day]||[]).filter(p => p && p.startTime && p.endTime &&
          p.startTime <= start && p.endTime >= end &&
          (!rotation?.enabled || !p.week || p.week === 'A' || p.week === 'B'))
        if (!blank) {
          periods.slice(0,2).forEach((p,pi)=>{
            const label=(p.label || (p.type==='free'?'Free period':'Lesson')).slice(0,25)
            doc.setTextColor(...DARK); doc.setFont('helvetica','bold'); doc.setFontSize(6)
            doc.text(label,x+2,y+5+pi*5)
            if (rotation?.enabled && p.week) {
              doc.setFont('helvetica','normal'); doc.setTextColor(...GREY); doc.setFontSize(5)
              doc.text(`Week ${p.week}`,x+2,y+8+pi*5)
            }
          })
        }
      })
      y += rowH
    })
  }

  const activeHolidays=(holidays||[]).filter(h=>h?.start && h?.end)
  if (activeHolidays.length) {
    const startY = Math.min(y+7,H-27)
    doc.setTextColor(...DARK); doc.setFont('helvetica','bold'); doc.setFontSize(7)
    doc.text('Holiday dates', M, startY)
    doc.setFont('helvetica','normal'); doc.setFontSize(6)
    activeHolidays.slice(0,8).forEach((h,i)=>doc.text(`${h.label||'School holiday'} Â· ${h.start} â€“ ${h.end}`, M, startY+5+i*3.5))
  }

  doc.setFillColor(...ACCENT); doc.rect(0,H-7,W,7,'F')
  doc.setTextColor(...WHITE); doc.setFontSize(6)
  doc.text('RevisionFlow â€” www.revisionflow.co.uk', M, H-2.5)
  doc.text(`Generated ${format(new Date(),'d MMM yyyy')}`, W-M, H-2.5, {align:'right'})
  doc.save(`${blank ? 'blank-' : ''}school-timetable-${format(new Date(),'yyyy-MM-dd')}.pdf`)
}
