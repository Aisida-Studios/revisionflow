// RevisionFlow Service Worker v5 — Web Push + caching
const CACHE_STATIC  = 'rf-static-v5'
const CACHE_DYNAMIC = 'rf-dynamic-v5'
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json']

// ── Install ──────────────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_STATIC).then(c => c.addAll(STATIC_ASSETS)))
  self.skipWaiting()
})

// ── Activate ─────────────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_STATIC && k !== CACHE_DYNAMIC).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch ────────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  if (!e.request.url.startsWith('http')) return
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET') return
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('securetoken.googleapis.com') ||
    url.hostname.includes('apis.google.com') ||
    url.hostname.includes('api.mistral.ai')
  ) return

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => { const clone = res.clone(); caches.open(CACHE_DYNAMIC).then(c => c.put(e.request, clone)); return res })
        .catch(() => caches.match('/index.html'))
    )
    return
  }

  if (url.pathname.match(/\.(js|css|woff2?|ttf|png|jpg|svg|ico|webp)$/) || url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const networkFetch = fetch(e.request).then(res => {
          if (res.ok && res.status < 400) { const clone = res.clone(); caches.open(CACHE_STATIC).then(c => c.put(e.request, clone)) }
          return res
        }).catch(() => cached)
        return cached || networkFetch
      })
    )
    return
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok && res.status < 400) { const clone = res.clone(); caches.open(CACHE_DYNAMIC).then(c => c.put(e.request, clone)) }
        return res
      })
      .catch(() => caches.match(e.request))
  )
})

// ── Push ─────────────────────────────────────────────────────────
self.addEventListener('push', e => {
  let data = { title: 'RevisionFlow 📚', body: 'Time to revise!', url: '/', icon: '/favicon.svg', badge: '/favicon.svg' }
  try { if (e.data) data = { ...data, ...e.data.json() } } catch(err) {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body:             data.body,
      icon:             data.icon  || '/favicon.svg',
      badge:            data.badge || '/favicon.svg',
      tag:              data.tag   || 'revisionflow',
      data:             { url: data.url || '/' },
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || [],
      vibrate: [100, 50, 100],
    })
  )
})

// ── Notification click ───────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = (e.notification.data && e.notification.data.url) || '/'

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Focus existing tab if open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      // Otherwise open new window
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})

// ── Push subscription change ──────────────────────────────────────
// Re-subscribe if the push service expires the subscription
self.addEventListener('pushsubscriptionchange', e => {
  e.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: self.VAPID_PUBLIC_KEY,
    }).then(subscription => {
      // Post back to app so it can save the new subscription
      return self.clients.matchAll().then(clients => {
        clients.forEach(c => c.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED', subscription: subscription.toJSON() }))
      })
    }).catch(() => {})
  )
})
