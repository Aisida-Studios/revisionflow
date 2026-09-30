import { boardSelectOptions } from '../data/boards'

// The <option> list for any exam-board <select>. Shows the supported boards (Eduqas and WJEC as the
// single "Eduqas / WJEC" option) and — only when the current value is a legacy/unsupported board such
// as 'Cambridge' — that value as a disabled option, so existing data stays visible without anyone
// being able to newly choose it. Pair it with value={canonicalBoard(x)} on the <select> so a value
// stored under an alias spelling (e.g. 'Eduqas') still shows as selected.
export default function BoardOptions({ current }) {
  return (
    <>
      {boardSelectOptions(current).map(o => (
        <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
      ))}
    </>
  )
}
