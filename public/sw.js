// RevisionFlow Service Worker v8 — Web Push + conservative same-origin caching
//
// What this worker may keep in Cache Storage, and nothing else:
//   • the app shell (/, /index.html, /manifest.json), refreshed from the network whenever the network is reachable;
//   • built static files from this origin (hashed JS/CSS, fonts, images).
// What it never stores and never answers from a cache: anything under /api/, /.netlify/ or /__/ (the API, the Netlify
// functions and the Firebase auth helper), any request that carries an Authorization header, and any response that says
// Cache-Control: no-store or private. Those requests are not inspected at all, so the browser handles them exactly as if
// this worker were not here. Cross-origin requests (Google Fonts, Firebase, Stripe, ...) are left alone in the same way.
//
// v7 also stored every other same-origin GET that came back 200, which would have kept a copy of any private JSON a GET
// endpoint returned. v8 has no such catch-all, and when it activates it deletes every cache except the two named below,
// which removes v7's "dynamic" cache from browsers that already have one.
const CACHE_STATIC     = 'rf-static-v8'
const VAPID_CACHE      = 'revisionflow-push-config'
const KEEP_CACHES      = [CACHE_STATIC, VAPID_CACHE]
const SHELL            = '/index.html'
const STATIC_ASSETS    = ['/', SHELL, '/manifest.json']
const PRIVATE_PREFIXES = ['/api/', '/.netlify/', '/__/']
const STATIC_FILE_RE   = /\.(js|css|woff2?|ttf|png|jpg|svg|ico|webp)$/
const DEFAULT_ICON     = '/favicon.svg'

// ── Install ──────────────────────────────────────────────────────
self.addEventListener('install', e => {
  // Each file is added on its own, so one that is briefly unavailable cannot stop the worker installing (and with it push).
  e.waitUntil(caches.open(CACHE_STATIC).then(c => Promise.all(STATIC_ASSETS.map(u => c.add(u).catch(() => {})))))
  self.skipWaiting()
})

// ── Activate ─────────────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !KEEP_CACHES.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

// ── Helpers ──────────────────────────────────────────────────────
const isPrivatePath = pathname => PRIVATE_PREFIXES.some(p => pathname.startsWith(p) || pathname === p.slice(0, -1))
const isHtml = res => /text\/html/i.test(res.headers.get('content-type') || '')

// A response may be kept only if it is an ordinary, successful, same-origin answer that does not ask not to be stored.
function mayStore(request, res) {
  if (!res || res.status !== 200 || res.type !== 'basic' || res.redirected) return false
  if (request.headers && request.headers.has('authorization')) return false
  if (/\b(no-store|private)\b/i.test(res.headers.get('cache-control') || '')) return false
  if ((res.headers.get('vary') || '').includes('*')) return false
  return true
}

// Cache writes carry on after the response has been handed back. If the event has already finished, waitUntil refuses;
// the write still proceeds, so that refusal is ignored.
function keepAlive(e, promise) {
  try { e.waitUntil(promise) } catch (err) { /* event already finished */ }
}

// ── Fetch ────────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  const req = e.request
  if (req.method !== 'GET') return
  let url
  try { url = new URL(req.url) } catch (err) { return }
  if (url.origin !== self.location.origin) return
  if (isPrivatePath(url.pathname)) return
  if (req.headers.has('authorization')) return

  if (req.mode === 'navigate') {
    e.respondWith(handleNavigation(e, req, url))
    return
  }

  if (STATIC_FILE_RE.test(url.pathname) || url.pathname.startsWith('/assets/')) {
    e.respondWith(handleStatic(e, req))
    return
  }
  // Anything else on this origin is not this worker's business: it goes to the network and nothing is stored.
})

async function handleNavigation(e, req, url) {
  try {
    const res = await fetch(req)
    // Every app route is answered with the same index.html, so one good copy is enough for offline use. Other pages (a .html
    // file, an error page, a redirect) are never stored as the shell.
    if (mayStore(req, res) && isHtml(res) && !/\.html?$/i.test(url.pathname)) {
      const copy = res.clone()
      keepAlive(e, caches.open(CACHE_STATIC).then(c => c.put(SHELL, copy)).catch(() => {}))
    }
    return res
  } catch (err) {
    try {
      const cache = await caches.open(CACHE_STATIC)
      return (await cache.match(SHELL)) || Response.error()
    } catch (err2) {
      return Response.error()
    }
  }
}

async function handleStatic(e, req) {
  const cache = await caches.open(CACHE_STATIC)
  const cached = await cache.match(req)
  const network = fetch(req).then(res => {
    // A missing script, style or image used to come back as the app's index.html (the catch-all rewrite) and was cached as
    // if it were the file. HTML is never a valid answer here, so it is refused and never stored.
    if (isHtml(res)) return Response.error()
    if (mayStore(req, res)) {
      const copy = res.clone()
      keepAlive(e, cache.put(req, copy).catch(() => {}))
    }
    return res
  }).catch(() => cached || Response.error())
  return cached || network
}

// ── Push ─────────────────────────────────────────────────────────
// Only a path on this site is ever used, for the notification's link and for its icons. Anything else (another host, a
// "//host" or "javascript:" address, control characters, a backslash) becomes the fallback.
function sitePath(raw, fallback) {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > 500 || /[\u0000-\u001f\u007f\\]/.test(raw)) return fallback
  try {
    const u = new URL(raw, self.location.origin)
    return u.origin === self.location.origin ? u.pathname + u.search + u.hash : fallback
  } catch (err) {
    return fallback
  }
}
const text = (v, max, fallback) => (typeof v === 'string' && v.trim() ? v.slice(0, max) : fallback)

self.addEventListener('push', e => {
  let data = {}
  try {
    if (e.data) {
      const parsed = e.data.json()
      if (parsed && typeof parsed === 'object') data = parsed
    }
  } catch (err) { /* not JSON: show the default notification */ }

  const actions = Array.isArray(data.actions)
    ? data.actions
        .filter(a => a && typeof a.action === 'string' && typeof a.title === 'string')
        .slice(0, 2)
        .map(a => ({ action: a.action.slice(0, 32), title: a.title.slice(0, 32) }))
    : []

  e.waitUntil(
    self.registration.showNotification(text(data.title, 100, 'RevisionFlow'), {
      body:               text(data.body, 300, 'Time to revise!'),
      icon:               sitePath(data.icon, DEFAULT_ICON),
      badge:              sitePath(data.badge, DEFAULT_ICON),
      tag:                text(data.tag, 64, 'revisionflow'),
      data:               { url: sitePath(data.url, '/') },
      requireInteraction: data.requireInteraction === true,
      actions,
      vibrate: [100, 50, 100],
    })
  )
})

// ── Notification click ───────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close()
  const target = sitePath(e.notification.data && e.notification.data.url, '/')

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Reuse an open tab of this site, if there is one. A window on any other origin is never navigated.
      for (const client of windowClients) {
        let sameOrigin = false
        try { sameOrigin = new URL(client.url).origin === self.location.origin } catch (err) { /* unreadable address */ }
        if (sameOrigin && 'focus' in client) {
          return Promise.resolve(client.focus())
            .then(() => ('navigate' in client ? client.navigate(target) : null))
            .catch(() => (clients.openWindow ? clients.openWindow(target) : null))
        }
      }
      if (clients.openWindow) return clients.openWindow(target)
    })
  )
})

// ── Push subscription lifecycle ───────────────────────────────────
// A service worker cannot read Vite env vars, so the page hands us the public
// VAPID key (SET_VAPID_KEY message) and we persist it in Cache Storage.
const VAPID_KEY_URL = '/__push-config/vapid-public-key'
const VAPID_KEY_RE  = /^[A-Za-z0-9_-]{40,200}={0,2}$/

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
  const d = e.data
  // Only a well-formed public key is stored; anything else is ignored.
  if (d && d.type === 'SET_VAPID_KEY' && typeof d.key === 'string' && VAPID_KEY_RE.test(d.key)) e.waitUntil(saveVapidKey(d.key))
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
