// RevisionFlow Service Worker v6 — Web Push + caching (same-origin only fetch handling)
const CACHE_STATIC  = 'rf-static-v6'
const CACHE_DYNAMIC = 'rf-dynamic-v6'
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
// Same-origin requests only. Cross-origin requests (Google Fonts, Firebase, Mistral, Stripe,
// etc.) are left completely alone — not even inspected — so the browser handles them with its
// own normal network behaviour. Trying to selectively allow/deny specific cross-origin hostnames
// here previously missed some (fonts.googleapis.com/fonts.gstatic.com), and a failed cross-origin
// fetch with nothing cached yet could resolve respondWith() with undefined, which throws
// "Failed to convert value to 'Response'" — and that failure could cascade into unrelated
// same-page requests (e.g. dynamic JS chunk imports) failing too.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  let url
  try { url = new URL(e.request.url) } catch (err) { return }
  if (url.origin !== self.location.origin) return

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => { const clone = res.clone(); caches.open(CACHE_DYNAMIC).then(c => c.put(e.request, clone)); return res })
        .catch(() => caches.match('/index.html').then(cached => cached || Response.error()))
    )
    return
  }

  if (url.pathname.match(/\.(js|css|woff2?|ttf|png|jpg|svg|ico|webp)$/) || url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const networkFetch = fetch(e.request).then(res => {
          if (res.ok && res.status < 400) { const clone = res.clone(); caches.open(CACHE_STATIC).then(c => c.put(e.request, clone)) }
          return res
        }).catch(() => cached || Response.error())
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
      .catch(() => caches.match(e.request).then(cached => cached || Response.error()))
  )
})

// ── Push ─────────────────────────────────────────────────────────
self.addEventListener('push', e => {
  let data = { title: 'RevisionFlow', body: 'Time to revise!', url: '/', icon: '/favicon.svg', badge: '/favicon.svg' }
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

// ── Push subscription lifecycle ───────────────────────────────────
// A service worker cannot read Vite env vars, so the page hands us the public
// VAPID key (SET_VAPID_KEY message) and we persist it in Cache Storage.
const VAPID_CACHE = 'revisionflow-push-config'
const VAPID_KEY_URL = '/__push-config/vapid-public-key'

async function saveVapidKey(key) {
  if (!key) return
  const cache = await caches.open(VAPID_CACHE)
  await cache.put(VAPID_KEY_URL, new Response(key))
}

async function loadVapidKey() {
  const cache = await caches.open(VAPID_CACHE)
  const res = await cache.match(VAPID_KEY_URL)
  return res ? res.text() : null
}

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(raw, c => c.charCodeAt(0))
}

async function notifyClients(message) {
  const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  all.forEach(c => c.postMessage(message))
}

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SET_VAPID_KEY') e.waitUntil(saveVapidKey(e.data.key))
})

self.addEventListener('pushsubscriptionchange', e => {
  e.waitUntil((async () => {
    try {
      // Prefer the key the expired subscription used; fall back to the stored one.
      const oldKey = e.oldSubscription && e.oldSubscription.options && e.oldSubscription.options.applicationServerKey
      let applicationServerKey = oldKey || null
      if (!applicationServerKey) {
        const stored = await loadVapidKey()
        if (stored) applicationServerKey = urlBase64ToUint8Array(stored)
      }
      if (!applicationServerKey) {
        // No key available: ask any open page to resubscribe with its env key.
        await notifyClients({ type: 'PUSH_RESUBSCRIBE_NEEDED' })
        return
      }
      const subscription = await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })
      await notifyClients({
        type: 'PUSH_SUBSCRIPTION_CHANGED',
        subscription: subscription.toJSON(),
        oldEndpoint: e.oldSubscription ? e.oldSubscription.endpoint : null,
      })
    } catch (err) {
      await notifyClients({ type: 'PUSH_RESUBSCRIBE_NEEDED' })
    }
  })())
})
