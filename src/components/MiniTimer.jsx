// src/components/MiniTimer.jsx
// The timer, popped out. Whenever a countdown or stopwatch is running (or paused part-way) and you are
// NOT on the Timer page, this sits at the top of the sidebar (or in the mobile top bar) so you can see
// the time, pause or resume, and jump back. It reads the same shared timer the Timer page uses, so
// nothing is duplicated and leaving the page never stops anything.
import { Link, useLocation } from 'react-router-dom'
import { Pause, Play, Timer as TimerIcon, X } from 'lucide-react'
import { useTimer } from '../context/TimerContext'
import { miniTimerState, formatClock } from '../utils/miniTimerState'

// variant: 'sidebar' (full width, with a label) | 'collapsed' (narrow rail) | 'pill' (mobile top bar)
export default function MiniTimer({ variant = 'sidebar' }) {
  const timer = useTimer()
  const { pathname } = useLocation()
  const state = miniTimerState(timer)
  if (!state || pathname.startsWith('/timer')) return null

  const done = state.kind === 'finished' || state.kind === 'alarm'
  const time = done ? '00:00' : formatClock(state.seconds)

  function toggle() {
    if (state.kind === 'countdown') state.running ? timer.cdPause() : timer.cdStart()
    else if (state.kind === 'stopwatch') state.running ? timer.swPause() : timer.swStart()
  }
  function dismiss() {
    if (state.kind === 'alarm') timer.clearAlarm()
    else timer.cdReset()
  }

  const openLabel = done ? `${state.label}. Open the timer` : `${state.label}: ${time}${state.running ? ' running' : ' paused'}. Open the timer`
  const action = done ? (
    <button type="button" className="mini-timer-btn" onClick={dismiss} aria-label="Dismiss"><X size={14} /></button>
  ) : (
    <button type="button" className="mini-timer-btn" onClick={toggle} aria-label={state.running ? 'Pause timer' : 'Resume timer'}>
      {state.running ? <Pause size={14} /> : <Play size={14} />}
    </button>
  )

  return (
    <div className={`mini-timer mini-timer--${variant}${done ? ' is-done' : ''}${state.running ? ' is-running' : ''}`}>
      <Link to="/timer" className="mini-timer-main" aria-label={openLabel} title={openLabel}>
        <TimerIcon size={variant === 'collapsed' ? 15 : 16} aria-hidden="true" />
        <span className="mini-timer-text">
          <span className="mini-timer-time">{done ? state.label : time}</span>
          {variant === 'sidebar' && !done && <span className="mini-timer-label">{state.label}{state.running ? '' : ' (paused)'}</span>}
        </span>
      </Link>
      {action}
    </div>
  )
}
