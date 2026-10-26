import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { completeSession } from '../utils/firestore';
import { buildTimerTabTitle, BASE_TITLE } from '../utils/timerTabTitle';

const TimerContext = createContext(null);

// ── Timestamp-based timekeeping ─────────────────────────────────────────────
// Browsers throttle or freeze setInterval in background tabs, so counting ticks drifts. Each
// timer stores authoritative timestamps instead and derives what to display from Date.now():
//   startedAt           ms timestamp of the current run segment (null while paused/stopped)
//   accumulatedSeconds  seconds banked from earlier run segments (pause/resume)
//   pausedAt            ms timestamp of the last pause (null while running)
// The interval below only triggers re-renders; it is never the source of truth. We also
// recompute immediately on visibilitychange/focus so a returning tab is correct at once.

const freshClock = () => ({ startedAt: null, accumulatedSeconds: 0, pausedAt: null });

function elapsedSeconds(clock, now) {
  const running = clock.startedAt != null ? Math.max(0, (now - clock.startedAt) / 1000) : 0;
  return clock.accumulatedSeconds + running;
}

export function TimerProvider({ children }) {
  const [now, setNow] = useState(() => Date.now());

  // Countdown
  const [cdTotal, setCdTotal] = useState(25 * 60);
  const [cdClock, setCdClock] = useState(freshClock);
  const [cdFinished, setCdFinished] = useState(false);

  // Stopwatch
  const [swClock, setSwClock] = useState(freshClock);
  const [swLaps, setSwLaps] = useState([]);

  // Alarm
  const [alarmTarget, setAlarmTarget] = useState(null); // Date object
  const [alarmFired, setAlarmFired] = useState(false);

  // Music auto-stop
  const [musicAutoStop, setMusicAutoStop] = useState(true);
  const [timerFinishedSignal, setTimerFinishedSignal] = useState(0); // increment to signal finish

  // Linked calendar/dashboard session (/timer?sessionId=ABC). Held in memory only — the URL
  // is the source of truth for which session a timer run belongs to.
  const { user } = useAuth();
  const [linkedSessionId, setLinkedSessionId] = useState(null);
  const [sessionResult, setSessionResult] = useState(null); // { sessionId, completed, alreadyCompleted, minutes } | { sessionId, error }
  const linkedSessionRef   = useRef(null);
  const completingRef      = useRef(null);   // session id currently being completed (in-flight guard)
  const focusBankedRef     = useRef(0);      // focus seconds banked from earlier countdown presets
  const cdClockRef         = useRef(freshClock());
  const cdTotalRef         = useRef(cdTotal);
  const swClockRef         = useRef(freshClock());
  const swBaselineRef      = useRef(0);      // stopwatch seconds already on the clock when the session was linked
  const userRef            = useRef(user);

  const notifiedRef = useRef(false);
  const cdFinishHandledRef = useRef(false);

  // Keep refs in step with state so event-time callbacks always read the latest values.
  cdClockRef.current = cdClock;
  cdTotalRef.current = cdTotal;
  swClockRef.current = swClock;
  userRef.current    = user;

  // Focused seconds for the linked session: countdown time (capped at each preset's length, so a
  // throttled background tab can't over-credit) or stopwatch time, whichever is larger.
  const getFocusSeconds = useCallback(() => {
    const t = Date.now();
    const cd = focusBankedRef.current + Math.min(cdTotalRef.current, elapsedSeconds(cdClockRef.current, t));
    const sw = elapsedSeconds(swClockRef.current, t) - swBaselineRef.current;
    return Math.max(0, Math.floor(Math.max(cd, sw)));
  }, []);

  // Complete the linked session exactly once: completeSession() flips the flag in a transaction
  // and pays XP keyed to the session id, so retries, double clicks and a calendar "Done" racing
  // the timer all resolve to a single award. Also records the streak and daily quest.
  const finishLinkedSession = useCallback(async () => {
    const id = linkedSessionRef.current;
    const uid = userRef.current?.uid;
    if (!id || !uid || completingRef.current === id) return null;
    completingRef.current = id;
    const seconds = getFocusSeconds();
    try {
      const res = await completeSession(uid, id, '', { actualDurationMinutes: seconds / 60 });
      const result = res.completed
        ? { sessionId: id, completed: true, alreadyCompleted: !!res.alreadyCompleted, minutes: Math.round(seconds / 60) }
        : { sessionId: id, error: 'That session no longer exists.' };
      setSessionResult(result);
      linkedSessionRef.current = null;
      focusBankedRef.current = 0;
      swBaselineRef.current = 0;
      setLinkedSessionId(null);
      return result;
    } catch (err) {
      setSessionResult({ sessionId: id, error: err.message || 'Could not complete the session.' });
      return null;
    } finally {
      completingRef.current = null;
    }
  }, [getFocusSeconds]);

  const linkSession = useCallback((id) => {
    if (!id || linkedSessionRef.current === id) return;
    linkedSessionRef.current = id;
    // Only time that passes after linking counts toward the session, so leftover time on
    // either clock from an earlier run isn't credited to it.
    const t = Date.now();
    focusBankedRef.current = -Math.min(cdTotalRef.current, elapsedSeconds(cdClockRef.current, t));
    swBaselineRef.current  = elapsedSeconds(swClockRef.current, t);
    setSessionResult(null);
    setLinkedSessionId(id);
  }, []);

  const unlinkSession = useCallback(() => {
    linkedSessionRef.current = null;
    focusBankedRef.current = 0;
    swBaselineRef.current = 0;
    setLinkedSessionId(null);
  }, []);

  // Bank elapsed countdown time (for the linked session) before a preset change or reset
  // throws the current clock away.
  const bankFocus = () => {
    if (!linkedSessionRef.current) return;
    focusBankedRef.current += Math.min(cdTotalRef.current, elapsedSeconds(cdClockRef.current, Date.now()));
  };

  const cdRunning = cdClock.startedAt != null;
  const swRunning = swClock.startedAt != null;

  // Derived display values
  const cdRemaining = Math.max(0, Math.ceil(cdTotal - elapsedSeconds(cdClock, now)));
  const swElapsed = Math.floor(elapsedSeconds(swClock, now));

  // Tick only while something is live; the tick merely refreshes `now`.
  useEffect(() => {
    if (!cdRunning && !swRunning && !alarmTarget) return undefined;
    const id = setInterval(() => setNow(Date.now()), 250);
    const refresh = () => setNow(Date.now());
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [cdRunning, swRunning, alarmTarget]);

  // ── Browser tab title ────────────────────────────────────────────────────
  // Mirrors the live clock into document.title, so a running countdown stays visible in the tab
  // strip while the student is reading a PDF or working in another app — same idea as a Google
  // timer. Lives in the provider (not the Timer page) because a timer started on /timer keeps
  // running after navigating away. The previous title is restored once nothing is running, and
  // untouched while idle so pages that set their own title (e.g. PublicProfile) are left alone.
  const baseTitleRef  = useRef(typeof document !== 'undefined' ? (document.title || BASE_TITLE) : BASE_TITLE);
  const titleShownRef = useRef(false);
  useEffect(() => {
    const title = buildTimerTabTitle({
      cdRemaining, cdTotal, cdRunning, cdFinished, swElapsed, swRunning, alarmFired,
      cdPaused: !cdRunning && cdClock.pausedAt != null,
    });
    if (title) {
      if (document.title !== title) document.title = title;
      titleShownRef.current = true;
    } else if (titleShownRef.current) {
      document.title = baseTitleRef.current || BASE_TITLE;
      titleShownRef.current = false;
    }
  }, [cdRemaining, cdTotal, cdRunning, cdFinished, swElapsed, swRunning, alarmFired, cdClock.pausedAt]);

  // --- Countdown completion (fires exactly once per run, even after a long background gap) ---
  useEffect(() => {
    if (cdRunning && cdRemaining <= 0 && !cdFinishHandledRef.current) {
      cdFinishHandledRef.current = true;
      setCdClock(c => ({ startedAt: null, accumulatedSeconds: cdTotal, pausedAt: null }));
      setCdFinished(true);
      setTimerFinishedSignal(s => s + 1);
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('RevisionFlow Timer', { body: 'Countdown finished!' });
      }
      // Runs here (not in the Timer page) so a countdown that ends while the student is on
      // another page still completes its session.
      if (linkedSessionRef.current) finishLinkedSession();
    }
  }, [cdRunning, cdRemaining, cdTotal, finishLinkedSession]);

  const cdStart = useCallback(() => {
    cdFinishHandledRef.current = false;
    setCdFinished(false);
    setCdClock(c => {
      if (c.startedAt != null) return c;
      // Restarting a finished countdown begins from the full duration.
      const base = c.accumulatedSeconds >= cdTotal ? 0 : c.accumulatedSeconds;
      return { startedAt: Date.now(), accumulatedSeconds: base, pausedAt: null };
    });
    setNow(Date.now());
  }, [cdTotal]);

  const cdPause = useCallback(() => {
    setCdClock(c => {
      if (c.startedAt == null) return c;
      const t = Date.now();
      return { startedAt: null, accumulatedSeconds: c.accumulatedSeconds + (t - c.startedAt) / 1000, pausedAt: t };
    });
  }, []);

  const cdReset = useCallback((total) => {
    bankFocus();
    cdClockRef.current = freshClock();
    if (total != null) cdTotalRef.current = total;
    cdFinishHandledRef.current = false;
    setCdFinished(false);
    setCdClock(freshClock());
    if (total != null) setCdTotal(total);
  }, []);

  const cdSetPreset = useCallback((seconds) => {
    bankFocus();
    cdClockRef.current = freshClock();
    cdTotalRef.current = seconds;
    cdFinishHandledRef.current = false;
    setCdFinished(false);
    setCdClock(freshClock());
    setCdTotal(seconds);
  }, []);

  // --- Stopwatch ---
  const swStart = useCallback(() => {
    setSwClock(c => (c.startedAt != null ? c : { startedAt: Date.now(), accumulatedSeconds: c.accumulatedSeconds, pausedAt: null }));
    setNow(Date.now());
  }, []);
  const swPause = useCallback(() => {
    setSwClock(c => {
      if (c.startedAt == null) return c;
      const t = Date.now();
      return { startedAt: null, accumulatedSeconds: c.accumulatedSeconds + (t - c.startedAt) / 1000, pausedAt: t };
    });
  }, []);
  const swReset = useCallback(() => { swClockRef.current = freshClock(); swBaselineRef.current = 0; setSwClock(freshClock()); setSwLaps([]); }, []);
  const swLap = useCallback(() => {
    setSwLaps(l => [...l, Math.floor(elapsedSeconds(swClock, Date.now()))]);
  }, [swClock]);

  // --- Alarm (compares wall-clock time, so it is already throttling-safe) ---
  useEffect(() => {
    if (alarmTarget && !notifiedRef.current && now >= alarmTarget.getTime()) {
      notifiedRef.current = true;
      setAlarmFired(true);
      setTimerFinishedSignal(s => s + 1);
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('RevisionFlow Alarm', { body: 'Your alarm is going off!' });
      }
    }
  }, [alarmTarget, now]);

  const setAlarm = useCallback((date) => { notifiedRef.current = false; setAlarmFired(false); setAlarmTarget(date); }, []);
  const clearAlarm = useCallback(() => { notifiedRef.current = false; setAlarmTarget(null); setAlarmFired(false); }, []);

  return (
    <TimerContext.Provider value={{
      // Countdown
      cdTotal, cdRemaining, cdRunning, cdFinished,
      cdStart, cdPause, cdReset, cdSetPreset,
      // Stopwatch
      swElapsed, swRunning, swLaps,
      swStart, swPause, swReset, swLap,
      // Alarm
      alarmTarget, alarmFired, setAlarm, clearAlarm,
      // Music
      musicAutoStop, setMusicAutoStop,
      timerFinishedSignal,
      // Linked session (calendar / dashboard → /timer?sessionId=ABC)
      linkedSessionId, sessionResult, linkSession, unlinkSession, finishLinkedSession, getFocusSeconds,
      clearSessionResult: () => setSessionResult(null),
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  return useContext(TimerContext);
}
