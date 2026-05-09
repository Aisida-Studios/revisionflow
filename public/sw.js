// RevisionFlow Service Worker v4 — fixed response clone bug
const CACHE_STATIC  = 'rf-static-v4'
const CACHE_DYNAMIC = 'rf-dynamic-v4'

const STATIC_ASSETS = ['/', '/index.html', '/manifest.json']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_STATIC).then(c => c.addAll(STATIC_ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_STATIC && k !== CACHE_DYNAMIC).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  // Ignore non-http(s) schemes — chrome-extension, data, blob etc.
  if (!e.request.url.startsWith('http')) return
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET') return
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('securetoken.googleapis.com') ||
    url.hostname.includes('apis.google.com') ||
    url.hostname.includes('generativelanguage.googleapis.com') ||
    url.hostname.includes('api.mistral.ai')
  ) return

  // Navigation — network first, fall back to cached index.html
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          // Clone BEFORE doing anything else with the response
          const clone = res.clone()
          caches.open(CACHE_DYNAMIC).then(c => c.put(e.request, clone))
          return res
        })
        .catch(() => caches.match('/index.html'))
    )
    return
  }

  // Static assets — cache first, update in background
  if (url.pathname.match(/\.(js|css|woff2?|ttf|png|jpg|svg|ico|webp)$/) || url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const networkFetch = fetch(e.request).then(res => {
          if (res.ok && res.status < 400) {
            // Clone BEFORE consuming
            const clone = res.clone()
            caches.open(CACHE_STATIC).then(c => c.put(e.request, clone))
          }
          return res
        }).catch(() => cached)
        return cached || networkFetch
      })
    )
    return
  }

  // Everything else — network first, cache as fallback
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok && res.status < 400) {
          // Clone BEFORE consuming
          const clone = res.clone()
          caches.open(CACHE_DYNAMIC).then(c => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
