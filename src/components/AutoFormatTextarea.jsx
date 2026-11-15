// src/components/AutoFormatTextarea.jsx
// A textarea that tidies what a student types as they type: x^2 becomes x², 1/2 becomes ½, <= becomes ≤.
// Only finished words are converted (the word the caret is touching is left alone until it is finished), the
// caret stays where it was, and everything is converted once more on blur. **bold** markers stay in the text
// and are shown as bold wherever the text is displayed (see RichText), because a text box cannot show bold.
// Use onValueChange(newValue) instead of onChange; every other prop goes straight to the textarea.
import { forwardRef, useLayoutEffect, useRef } from 'react'
import { autoFormatTyped } from '../utils/richText'

const AutoFormatTextarea = forwardRef(function AutoFormatTextarea({ value, onValueChange, onBlur, onCompositionEnd, ...rest }, ref) {
  // Converting the text moves the caret to the end, so the wanted caret position is kept here and put back
  // as soon as React has written the new text into the box (before the next key can be pressed).
  const wanted = useRef(null)

  useLayoutEffect(() => {
    const w = wanted.current
    if (!w) return
    wanted.current = null
    if (document.activeElement !== w.el) return
    try { w.el.setSelectionRange(w.pos, w.pos) } catch { /* the box cannot take a selection right now */ }
  })

  function apply(el) {
    const raw = el.value
    const res = autoFormatTyped(raw, el.selectionStart)
    if (res.value !== raw && res.caret != null) {
      wanted.current = { el, pos: res.caret }
      // If the parent never re-renders with the new text there is nothing to restore.
      requestAnimationFrame(() => { if (wanted.current && wanted.current.el === el) wanted.current = null })
    }
    if (onValueChange) onValueChange(res.value)
  }

  function handleChange(e) {
    // While a keyboard is still composing a word (phones, Japanese, Chinese), do not touch the text: it is
    // converted when the word is committed.
    if (e.nativeEvent && e.nativeEvent.isComposing) {
      if (onValueChange) onValueChange(e.target.value)
      return
    }
    apply(e.target)
  }

  function handleCompositionEnd(e) {
    if (onCompositionEnd) onCompositionEnd(e)
    apply(e.target)
  }

  function handleBlur(e) {
    if (onBlur) onBlur(e)
    const raw = e.target.value
    const res = autoFormatTyped(raw, null)
    if (res.value !== raw && onValueChange) onValueChange(res.value)
  }

  return (
    <textarea
      ref={ref}
      {...rest}
      value={value == null ? '' : value}
      onChange={handleChange}
      onBlur={handleBlur}
      onCompositionEnd={handleCompositionEnd}
    />
  )
})

export default AutoFormatTextarea
