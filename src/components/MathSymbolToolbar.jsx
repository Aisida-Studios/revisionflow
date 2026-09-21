// src/components/MathSymbolToolbar.jsx
// Drop-in row of maths symbol buttons for a text input/textarea. Pass a ref to the actual DOM
// node plus the field's current value and onChange so symbols insert at the cursor position
// rather than always at the end.
const SYMBOLS = [
  { label: 'x²', insert: '²' },
  { label: 'x³', insert: '³' },
  { label: '√',  insert: '√' },
  { label: 'π',  insert: 'π' },
  { label: '≤',  insert: '≤' },
  { label: '≥',  insert: '≥' },
  { label: '±',  insert: '±' },
  { label: '÷',  insert: '÷' },
  { label: '×',  insert: '×' },
  { label: 'θ',  insert: 'θ' },
  { label: 'Δ',  insert: 'Δ' },
  { label: '∞',  insert: '∞' },
]

export default function MathSymbolToolbar({ fieldRef, value, onChange }) {
  function insertSymbol(symbol) {
    const el = fieldRef?.current
    const current = value ?? ''
    const start = el?.selectionStart ?? current.length
    const end   = el?.selectionEnd   ?? current.length
    const newValue = current.slice(0, start) + symbol + current.slice(end)
    onChange(newValue)
    if (el) {
      requestAnimationFrame(() => {
        el.focus()
        const pos = start + symbol.length
        el.setSelectionRange(pos, pos)
      })
    }
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
      {SYMBOLS.map(s => (
        <button
          key={s.label}
          type="button"
          // Prevents the field from losing focus/selection when a button is clicked — without
          // this, by the time onClick fires the browser has already blurred the field and reset
          // its selection, so symbols would only ever be insertable at the end.
          onMouseDown={e => e.preventDefault()}
          onClick={() => insertSymbol(s.insert)}
          title={s.label}
          style={{
            minWidth: 26, height: 24, padding: '0 5px', borderRadius: 5,
            border: '1px solid var(--border)', background: 'var(--bg-surface)',
            color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer', lineHeight: 1,
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
