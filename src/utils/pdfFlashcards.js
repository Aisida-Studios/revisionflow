import { jsPDF } from 'jspdf'
import { format } from 'date-fns'

const ACCENT=[20,83,45], DARK=[20,28,24], GREY=[100,100,120], WHITE=[255,255,255]

export function generateFlashcardsPDF(set) {
  const cards = Array.isArray(set?.cards) ? set.cards : []
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' })
  const W=210, H=297, M=12
  doc.setFillColor(...ACCENT); doc.rect(0,0,W,24,'F')
  doc.setTextColor(...WHITE); doc.setFont('helvetica','bold'); doc.setFontSize(15)
  doc.text((set?.title || 'Flashcard Set').slice(0,70), M, 15)
  doc.setFont('helvetica','normal'); doc.setFontSize(7)
  doc.text(`${set?.subject || ''}${set?.topic ? ' Â· '+set.topic : ''} Â· ${cards.length} cards`, W-M, 15, {align:'right'})

  let y=32
  const gap=7, cardH=42
  cards.forEach((card,i)=>{
    if (y+cardH > H-16) { doc.addPage(); y=18 }
    doc.setFillColor(248,250,249); doc.setDrawColor(210,225,215)
    doc.roundedRect(M,y,W-M*2,cardH,3,3,'FD')
    doc.setTextColor(...ACCENT); doc.setFont('helvetica','bold'); doc.setFontSize(7)
    doc.text(`CARD ${i+1}`,M+5,y+7)
    doc.setTextColor(...DARK); doc.setFontSize(9); doc.setFont('helvetica','bold')
    doc.text(doc.splitTextToSize(String(card.q||''),W-M*2-10),M+5,y+14,{maxWidth:W-M*2-10})
    doc.setTextColor(...GREY); doc.setFont('helvetica','normal'); doc.setFontSize(8)
    const answerY=y+26
    doc.text(doc.splitTextToSize('Answer: '+String(card.a||''),W-M*2-10),M+5,answerY,{maxWidth:W-M*2-10})
    y += cardH+gap
  })
  const pages=doc.internal.getNumberOfPages()
  for(let p=1;p<=pages;p++){
    doc.setPage(p); doc.setFillColor(...ACCENT); doc.rect(0,H-7,W,7,'F')
    doc.setTextColor(...WHITE); doc.setFontSize(6)
    doc.text('RevisionFlow â€” Flashcards',M,H-2.5)
    doc.text(`Page ${p} of ${pages} Â· ${format(new Date(),'d MMM yyyy')}`,W-M,H-2.5,{align:'right'})
  }
  doc.save(`flashcards-${(set?.title||'set').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'set'}.pdf`)
}
