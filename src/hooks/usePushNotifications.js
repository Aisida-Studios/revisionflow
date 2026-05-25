// src/hooks/usePushNotifications.js
// Manages Web Push subscription lifecycle — call once at app root
import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  subscribeToPush, getCurrentSubscription,
  getPermissionState, scheduleExamReminders,
  scheduleDailyReminder, clearDailyReminder,
} from '../utils/notifications'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

export function usePushNotifications() {
  const { user, profile } = useAuth()
  const scheduledIds = useRef([])

  // ── Subscribe & save subscription to Firestore ──────────────────
  useEffect(() => {
    if (!user || !profile) return
    if (getPermissionState() !== 'granted') return

    async function syncSubscription() {
      const result = await subscribeToPush()
      if (result.subscription) {
        // Save subscription to Firestore so the server can push to this device
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            pushSubscription: result.subscription,
            pushEnabled: true,
          })
        } catch(e) {}
      }
    }
    syncSubscription()
  }, [user?.uid, profile?.notificationSettings?.pushEnabled])

  // ── Listen for subscription changes from service worker ──────────
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const handler = async (e) => {
      if (e.data?.type === 'PUSH_SUBSCRIPTION_CHANGED' && user) {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            pushSubscription: e.data.subscription,
          })
        } catch(err) {}
      }
    }
    navigator.serviceWorker.addEventListener('message', handler)
    return () => navigator.serviceWorker.removeEventListener('message', handler)
  }, [user?.uid])

  // ── Schedule local exam reminders & daily reminder ───────────────
  useEffect(() => {
    if (!profile) return
    const settings = profile.notificationSettings || {}

    // Clear any previously scheduled reminders
    scheduledIds.current.forEach(id => clearTimeout(id))
    scheduledIds.current = []

    // Exam reminders (works while tab open; push server handles background)
    if (settings.examReminders !== false && profile.examDates?.length) {
      const ids = scheduleExamReminders(profile.examDates)
      scheduledIds.current.push(...ids)
    }

    // Daily reminder (tab-open fallback for when push isn't available)
    if (settings.dailyReminder && settings.reminderTime) {
      scheduleDailyReminder(settings.reminderTime, () => 0)
    } else {
      clearDailyReminder()
    }

    return () => {
      scheduledIds.current.forEach(id => clearTimeout(id))
      clearDailyReminder()
    }
  }, [profile?.notificationSettings, profile?.examDates])
}
