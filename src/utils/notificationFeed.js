// src/utils/notificationFeed.js
//
// In-app notification feed. This is a separate concern from
// utils/notifications.js, which handles Web Push (OS/browser-level)
// permission and scheduling — this is the in-app bell: a stored, readable
// history at users/{uid}/notifications.
//
// Nothing in the app writes to this collection yet. Badges, streaks,
// friend requests etc. currently all fire their own one-off local popups
// instead (see the Global* components mounted in App.jsx). This file is
// the read/write plumbing so a real producer can be wired up later
// without inventing a second schema — createNotification() below is that
// hook. Until something calls it, the feed is genuinely empty, and the
// bell shows an honest empty state rather than invented content.
//
// Needs a security rule mirroring the app's other per-user subcollections
// (e.g. users/{uid}/topics, users/{uid}/sessions). If those are covered
// by a single users/{uid}/{document=**} wildcard rule, nothing further is
// needed. If they're declared individually, add:
//
//   match /users/{uid}/notifications/{notifId} {
//     allow read, update, delete: if request.auth != null && request.auth.uid == uid;
//     allow create: if request.auth != null && request.auth.uid == uid;
//   }

import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot,
  query, orderBy, limit, serverTimestamp, writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'

const MAX_NOTIFICATIONS = 30

// Live-subscribes to the most recent notifications, newest first. Returns
// an unsubscribe function — call it on unmount.
export function subscribeToNotifications(uid, callback) {
  if (!uid) return () => {}
  const q = query(
    collection(db, 'users', uid, 'notifications'),
    orderBy('createdAt', 'desc'),
    limit(MAX_NOTIFICATIONS)
  )
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    () => callback([]) // e.g. rules not deployed yet — fail to an empty feed, not a crash
  )
}

// The hook for future producers: award a badge, hit a streak milestone,
// get a friend request, etc. — call this with a short title and, if the
// notification should be clickable, a link (an in-app path like '/exams').
export async function createNotification(uid, { type = 'system', title, body = '', link = null }) {
  if (!uid || !title) return
  await addDoc(collection(db, 'users', uid, 'notifications'), {
    type, title, body, link, read: false, createdAt: serverTimestamp(),
  })
}

export async function markNotificationRead(uid, notifId) {
  if (!uid || !notifId) return
  await updateDoc(doc(db, 'users', uid, 'notifications', notifId), { read: true })
}

export async function markAllNotificationsRead(uid, notifications) {
  const unread = (notifications || []).filter((n) => !n.read)
  if (!uid || !unread.length) return
  const batch = writeBatch(db)
  unread.forEach((n) => batch.update(doc(db, 'users', uid, 'notifications', n.id), { read: true }))
  await batch.commit()
}

export async function deleteNotification(uid, notifId) {
  if (!uid || !notifId) return
  await deleteDoc(doc(db, 'users', uid, 'notifications', notifId))
}
