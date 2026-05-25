// src/utils/notifications.js
// Web Push notification system for RevisionFlow
// Uses VAPID keys — VAPID_PUBLIC_KEY must be set in vite env as VITE_VAPID_PUBLIC_KEY

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

// ── Permission ────────────────────────────────────────────────────
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function getPermissionState() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission // 'default' | 'granted' | 'denied'
}

// ── VAPID key helper ──────────────────────────────────────────────
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = window.atob(base64)
  const output  = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}

// ── Subscribe to Web Push ─────────────────────────────────────────
export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { error: 'Push notifications not supported on this device' }
  }
  if (!VAPID_PUBLIC_KEY) {
    return { error: 'VAPID public key not configured — add VITE_VAPID_PUBLIC_KEY to Netlify env vars' }
  }

  try {
    const reg  = await navigator.serviceWorker.ready
    const existing = await reg.pushManager.getSubscription()
    if (existing) return { subscription: existing.toJSON() }

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
    return { subscription: subscription.toJSON() }
  } catch(e) {
    return { error: e.message }
  }
}

export async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator)) return
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) await sub.unsubscribe()
  } catch(e) {}
}

export async function getCurrentSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    return sub ? sub.toJSON() : null
  } catch(e) { return null }
}

// ── Send via Netlify function ─────────────────────────────────────
export async function sendPushToSelf(title, message, url = '/') {
  const sub = await getCurrentSubscription()
  if (!sub) return
  try {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub, title, message, url }),
    })
  } catch(e) {}
}

// ── Local notification fallback (tab must be open) ────────────────
export function sendLocalNotification(title, body, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const n = new Notification(title, {
    body,
    icon:             '/favicon.svg',
    badge:            '/favicon.svg',
    tag:              options.tag || 'revisionflow',
    requireInteraction: options.requireInteraction || false,
    ...options,
  })
  if (options.onClick) n.onclick = options.onClick
  return n
}

// ── Timer finished notification ───────────────────────────────────
export function sendTimerNotification(label) {
  sendLocalNotification('⏱ Timer complete!', label || 'Your revision timer has finished.', {
    tag: 'timer-complete',
    requireInteraction: true,
  })
}

// ── Exam countdown notifications ───────────────────────────────────
// Schedules local notifications for upcoming exams (while tab is open)
// Real background notifications require the push server + saved subscriptions
export function scheduleExamReminders(examDates) {
  if (!examDates?.length) return []
  const ids = []

  examDates.forEach(exam => {
    if (!exam.examDate) return
    const [year, month, day] = exam.examDate.split('-').map(Number)
    const examDay = new Date(year, month - 1, day)
    const now     = new Date()

    // Night before reminder (8pm the evening before)
    const nightBefore = new Date(year, month - 1, day - 1)
    nightBefore.setHours(20, 0, 0, 0)
    if (nightBefore > now) {
      const id = setTimeout(() => {
        sendLocalNotification(
          `📝 Exam tomorrow: ${exam.subject}`,
          `${exam.subject} — ${exam.board || ''} ${exam.paper ? 'Paper ' + exam.paper : ''}. Good luck!`,
          { tag: `exam-eve-${exam.id}`, requireInteraction: true }
        )
      }, nightBefore.getTime() - now.getTime())
      ids.push(id)
    }

    // Morning of exam (7am)
    const morning = new Date(year, month - 1, day)
    morning.setHours(7, 0, 0, 0)
    if (morning > now) {
      const id = setTimeout(() => {
        sendLocalNotification(
          `🎯 Exam today: ${exam.subject}`,
          `Your ${exam.subject} exam is today. You've got this!`,
          { tag: `exam-day-${exam.id}`, requireInteraction: true }
        )
      }, morning.getTime() - now.getTime())
      ids.push(id)
    }
  })

  return ids // store these if you want to cancel them
}

// ── Daily revision reminder (tab-open fallback) ───────────────────
let dailyReminderTimeout = null

export function scheduleDailyReminder(timeStr, getSessionCount) {
  clearDailyReminder()
  function scheduleNext() {
    const now = new Date()
    const [hh, mm] = timeStr.split(':').map(Number)
    const next = new Date()
    next.setHours(hh, mm, 0, 0)
    if (next <= now) next.setDate(next.getDate() + 1)
    dailyReminderTimeout = setTimeout(async () => {
      const count = typeof getSessionCount === 'function' ? await getSessionCount() : 0
      sendLocalNotification(
        'RevisionFlow — Time to revise! 📚',
        count > 0
          ? `You have ${count} session${count !== 1 ? 's' : ''} today. Keep the streak going! 🔥`
          : "No sessions scheduled today — add one to stay on track.",
        { tag: 'daily-reminder' }
      )
      scheduleNext()
    }, next.getTime() - now.getTime())
  }
  scheduleNext()
}

export function clearDailyReminder() {
  if (dailyReminderTimeout) { clearTimeout(dailyReminderTimeout); dailyReminderTimeout = null }
}

// ── Session reminder ──────────────────────────────────────────────
export function scheduleSessionReminder(session, minutesBefore = 5) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return null
  const sessionTime = session.startTime ? new Date(session.startTime) : null
  if (!sessionTime) return null
  const delay = sessionTime.getTime() - minutesBefore * 60000 - Date.now()
  if (delay <= 0) return null
  return setTimeout(() => {
    sendLocalNotification(
      `Revision starting in ${minutesBefore} minutes`,
      session.title || `${session.subject}`,
      { tag: `session-${session.id}`, requireInteraction: true }
    )
  }, delay)
}

export function cancelReminder(timeoutId) {
  if (timeoutId) clearTimeout(timeoutId)
}
