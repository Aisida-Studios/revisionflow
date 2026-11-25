// tests/client/serviceWorker.test.mjs
// public/sw.js, run for real (node:vm) against a fake Cache Storage, fake fetch and fake clients. No browser is needed, and
// nothing here touches the network.
//
// What is proved: the worker never inspects, stores or answers from a cache for private paths (/api/, /.netlify/, /__/) or for
// requests carrying credentials; it stores only ordinary successful same-origin answers that do not ask not to be stored; a
// missing script is never kept as if it were the app's HTML; a notification can only ever open a page on this site; and an
// update keeps the stored push key while removing the old "dynamic" cache.
// What is not proved: behaviour in a real browser (installation timing, update flow, real Cache Storage quotas).
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const ORIGIN = 'https://www.revisionflow.co.uk'
const SOURCE = readFileSync(new URL('../../public/sw.js', import.meta.url), 'utf8')
const STATIC = 'rf-static-v8'
const PUSH_CACHE = 'revisionflow-push-config'
const abs = (u) => new URL(u, ORIGIN).href
const plain = (v) => JSON.parse(JSON.stringify(v))

// What fetch() hands a service worker for a same-origin answer has type "basic"; a hand-made Response has type "default".
function answer(body, init = {}, extra = {}) {
  const r = new Response(body, init)
  Object.defineProperty(r, 'type', { value: extra.type || 'basic' })
  if (extra.redirected) Object.defineProperty(r, 'redirected', { value: true })
  return r
}
const html = (body = '<!doctype html><title>app</title>', headers = {}, init = {}) => answer(body, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', ...headers }, ...init })
const script = (body = 'console.log(1)', headers = {}, init = {}, extra = {}) => answer(body, { status: 200, headers: { 'content-type': 'application/javascript', ...headers }, ...init }, extra)

function makeWorld() {
  const world = {
    listeners: {}, stores: new Map(), fetchCalls: [], opened: [], shown: [], posted: [], claimed: 0, skipped: 0,
    windowClients: [], subscribeOpts: null,
    fetchImpl: async () => { throw new TypeError('network down') },
  }
  const keyOf = (req) => (typeof req === 'string' ? abs(req) : req.url)
  const storeOf = (name) => { if (!world.stores.has(name)) world.stores.set(name, new Map()); return world.stores.get(name) }
  const fetchFn = async (req) => { world.fetchCalls.push(typeof req === 'string' ? abs(req) : req.url); return world.fetchImpl(req) }
  const caches = {
    async open(name) {
      const m = storeOf(name)
      return {
        async put(req, res) { m.set(keyOf(req), res) },
        async add(req) {
          const res = await fetchFn(typeof req === 'string' ? { url: abs(req), method: 'GET', mode: 'cors', headers: new Headers() } : req)
          if (!res.ok) throw new TypeError('bad response status')
          m.set(keyOf(req), res)
        },
        async match(req) { const r = m.get(keyOf(req)); return r ? r.clone() : undefined },
      }
    },
    async keys() { return [...world.stores.keys()] },
    async delete(name) { return world.stores.delete(name) },
    async match(req) { for (const m of world.stores.values()) { const r = m.get(keyOf(req)); if (r) return r.clone() } return undefined },
  }
  const clients = {
    claim: async () => { world.claimed++ },
    matchAll: async () => world.windowClients,
    openWindow: async (u) => { world.opened.push(u); return {} },
  }
  const selfObj = {
    location: { origin: ORIGIN },
    addEventListener: (type, fn) => { (world.listeners[type] ||= []).push(fn) },
    skipWaiting: () => { world.skipped++ },
    clients,
    registration: {
      // Objects built inside the sandbox have the sandbox's prototypes, which strict deepEqual rejects; a JSON round trip makes plain ones.
      showNotification: async (title, options) => { world.shown.push(plain({ title, options })) },
      pushManager: { subscribe: async (opts) => { world.subscribeOpts = opts; return { toJSON: () => ({ endpoint: 'https://push.example/new' }) } } },
    },
  }
  vm.runInContext(SOURCE, vm.createContext({ self: selfObj, caches, fetch: fetchFn, clients, Response, URL, Headers, atob, Uint8Array, Promise, console }), { filename: 'sw.js' })

  const flush = () => new Promise((r) => setImmediate(r))
  world.dispatch = async (type, event = {}) => {
    const waits = []
    let responded
    const ev = { ...event, waitUntil: (p) => { waits.push(Promise.resolve(p)) }, respondWith: (p) => { responded = Promise.resolve(p) } }
    for (const fn of world.listeners[type] || []) fn(ev)
    const response = responded ? await responded : undefined
    await flush()
    await Promise.all(waits)
    await flush()
    return { intercepted: Boolean(responded), response }
  }
  world.get = (url, { method = 'GET', mode = 'cors', headers = {} } = {}) =>
    world.dispatch('fetch', { request: { url: abs(url), method, mode, headers: new Headers(headers) } })
  world.keys = (cacheName = STATIC) => [...(world.stores.get(cacheName) || new Map()).keys()]
  world.cached = async (url, cacheName = STATIC) => { const m = world.stores.get(cacheName); const r = m && m.get(abs(url)); return r ? r.clone() : undefined }
  world.click = async (url, { omitData = false } = {}) => {
    let closed = false
    await world.dispatch('notificationclick', { notification: { data: omitData ? undefined : { url }, close: () => { closed = true } } })
    return closed
  }
  return world
}

describe('install and activate', () => {
  test('installing keeps the app shell and takes over without waiting', async () => {
    const w = makeWorld()
    w.fetchImpl = async () => html()
    await w.dispatch('install')
    assert.deepEqual(w.keys(), [abs('/'), abs('/index.html'), abs('/manifest.json')])
    assert.equal(w.skipped, 1)
  })

  test('one file being unavailable does not stop the worker installing', async () => {
    const w = makeWorld()
    w.fetchImpl = async (req) => { if (req.url.endsWith('/manifest.json')) throw new TypeError('offline'); return html() }
    await w.dispatch('install')                      // would reject (and fail the test) if install failed
    assert.deepEqual(w.keys(), [abs('/'), abs('/index.html')])
    assert.equal(w.skipped, 1)
  })

  test('activating removes every cache except the current one and the push key, including the old dynamic cache', async () => {
    const w = makeWorld()
    for (const name of ['rf-static-v7', 'rf-dynamic-v7', STATIC, PUSH_CACHE, 'something-else']) w.stores.set(name, new Map([[abs('/x'), html()]]))
    await w.dispatch('activate')
    assert.deepEqual([...w.stores.keys()].sort(), [PUSH_CACHE, STATIC].sort())
    assert.equal(w.claimed, 1)
  })
})

describe('private requests are not this worker\'s business', () => {
  const PRIVATE = ['/api/tutor', '/api/', '/api', '/.netlify/functions/tutor', '/.netlify', '/__/auth/handler?apiKey=k&state=s', '/__/auth/iframe']
  for (const path of PRIVATE) {
    for (const mode of ['cors', 'navigate']) {
      test(`GET ${path} (${mode}) is never inspected, fetched or stored`, async () => {
        const w = makeWorld()
        w.fetchImpl = async () => script('{"private":true}', { 'content-type': 'application/json' })
        const r = await w.get(path, { mode })
        assert.equal(r.intercepted, false)
        assert.equal(w.fetchCalls.length, 0)
        assert.equal(w.stores.size, 0)
      })
    }
  }

  test('a request that carries an Authorization header is never inspected or stored, whatever the path', async () => {
    const w = makeWorld()
    w.fetchImpl = async () => script()
    for (const path of ['/assets/app.js', '/logo.png', '/study']) {
      for (const mode of ['cors', 'navigate']) {
        const r = await w.get(path, { mode, headers: { Authorization: 'Bearer abc' } })
        assert.equal(r.intercepted, false, `${path} ${mode}`)
      }
    }
    assert.equal(w.fetchCalls.length, 0)
    assert.equal(w.stores.size, 0)
  })

  test('writes and other-origin requests are left alone', async () => {
    const w = makeWorld()
    w.fetchImpl = async () => script()
    assert.equal((await w.get('/assets/app.js', { method: 'POST' })).intercepted, false)
    assert.equal((await w.get('/assets/app.js', { method: 'PUT' })).intercepted, false)
    const other = await w.dispatch('fetch', { request: { url: 'https://fonts.googleapis.com/css?family=Manrope', method: 'GET', mode: 'cors', headers: new Headers() } })
    assert.equal(other.intercepted, false)
    assert.equal(w.fetchCalls.length, 0)
    assert.equal(w.stores.size, 0)
  })

  test('a same-origin GET that is neither a page nor a built file (a data file, a future endpoint) goes straight to the network and is never stored', async () => {
    const w = makeWorld()
    w.fetchImpl = async () => answer('{"mistakes":[1,2]}', { status: 200, headers: { 'content-type': 'application/json' } })
    for (const path of ['/data/mistakes.json', '/export', '/some-endpoint?x=1']) {
      const r = await w.get(path)
      assert.equal(r.intercepted, false, path)
    }
    assert.equal(w.fetchCalls.length, 0)
    assert.equal(w.stores.size, 0)
  })
})

describe('page loads (navigation)', () => {
  test('a good page load refreshes the one shell copy, and only that', async () => {
    const w = makeWorld()
    w.fetchImpl = async () => html('<!doctype html><title>v2</title>')
    const r = await w.get('/study?topic=1', { mode: 'navigate' })
    assert.equal(r.intercepted, true)
    assert.match(await r.response.text(), /v2/)
    assert.deepEqual(w.keys(), [abs('/index.html')])
    assert.match(await (await w.cached('/index.html')).text(), /v2/)
  })

  test('the home page counts as an app route', async () => {
    const w = makeWorld()
    w.fetchImpl = async () => html()
    await w.get('/', { mode: 'navigate' })
    assert.deepEqual(w.keys(), [abs('/index.html')])
  })

  const NOT_THE_SHELL = [
    ['a separate .html page', '/landing.html', () => html()],
    ['a server error', '/study', () => html('<!doctype html>oops', {}, { status: 500 })],
    ['a not-found page', '/study', () => html('<!doctype html>nope', {}, { status: 404 })],
    ['a page that says no-store', '/study', () => html('<!doctype html>x', { 'cache-control': 'no-store' })],
    ['a page that says private', '/study', () => html('<!doctype html>x', { 'cache-control': 'private, max-age=0' })],
    ['a redirected answer', '/study', () => answer('<!doctype html>x', { status: 200, headers: { 'content-type': 'text/html' } }, { redirected: true })],
    ['an answer that is not HTML', '/study', () => answer('{"a":1}', { status: 200, headers: { 'content-type': 'application/json' } })],
    ['a partial answer', '/study', () => html('<!doctype html>x', {}, { status: 206 })],
  ]
  for (const [label, path, make] of NOT_THE_SHELL) {
    test(`${label} is returned to the page but never stored as the shell`, async () => {
      const w = makeWorld()
      w.fetchImpl = async () => make()
      const r = await w.get(path, { mode: 'navigate' })
      assert.equal(r.intercepted, true)
      assert.ok(r.response)
      assert.deepEqual(w.keys(), [])
    })
  }

  test('offline, the shell is served for any app route', async () => {
    const w = makeWorld()
    w.fetchImpl = async () => html('<!doctype html><title>shell</title>')
    await w.dispatch('install')
    w.fetchImpl = async () => { throw new TypeError('offline') }
    const r = await w.get('/dashboard', { mode: 'navigate' })
    assert.equal(r.intercepted, true)
    assert.match(await r.response.text(), /shell/)
  })

  test('offline with nothing stored, the page gets a network error rather than a made-up answer', async () => {
    const w = makeWorld()
    const r = await w.get('/dashboard', { mode: 'navigate' })
    assert.equal(r.intercepted, true)
    assert.equal(r.response.type, 'error')
    assert.equal(r.response.status, 0)
  })
})

describe('built files (scripts, styles, fonts, images)', () => {
  test('a good answer is returned and stored', async () => {
    const w = makeWorld()
    w.fetchImpl = async () => script('console.log("a")')
    const r = await w.get('/assets/index-abc123.js')
    assert.equal(r.intercepted, true)
    assert.equal(await r.response.text(), 'console.log("a")')
    assert.deepEqual(w.keys(), [abs('/assets/index-abc123.js')])
  })

  test('once stored, it is served from the store when the network is down', async () => {
    const w = makeWorld()
    w.fetchImpl = async () => script('console.log("a")')
    await w.get('/assets/index-abc123.js')
    w.fetchImpl = async () => { throw new TypeError('offline') }
    const r = await w.get('/assets/index-abc123.js')
    assert.equal(await r.response.text(), 'console.log("a")')
  })

  test('with a stored copy, the page gets it at once and the store is refreshed in the background', async () => {
    const w = makeWorld()
    w.fetchImpl = async () => script('old')
    await w.get('/assets/app.js')
    w.fetchImpl = async () => script('new')
    const r = await w.get('/assets/app.js')
    assert.equal(await r.response.text(), 'old')
    assert.equal(await (await w.cached('/assets/app.js')).text(), 'new')
  })

  test('offline with nothing stored is a network error', async () => {
    const w = makeWorld()
    const r = await w.get('/assets/app.js')
    assert.equal(r.response.type, 'error')
  })

  test('HTML in place of a script (a missing file answered with the app page) is refused and never stored', async () => {
    const w = makeWorld()
    w.fetchImpl = async () => html('<!doctype html><title>app</title>')
    const r = await w.get('/assets/gone-abc.js')
    assert.equal(r.response.type, 'error')
    assert.deepEqual(w.keys(), [])
  })

  test('HTML is not stored over a good copy, and the good copy is still served', async () => {
    const w = makeWorld()
    w.fetchImpl = async () => script('good')
    await w.get('/assets/app.js')
    w.fetchImpl = async () => html()
    const r = await w.get('/assets/app.js')
    assert.equal(await r.response.text(), 'good')
    assert.equal(await (await w.cached('/assets/app.js')).text(), 'good')
  })

  const NOT_STORED = [
    ['says no-store', () => script('x', { 'cache-control': 'no-store' })],
    ['says private', () => script('x', { 'cache-control': 'private, max-age=60' })],
    ['says Vary: *', () => script('x', { vary: '*' })],
    ['is not found', () => script('x', {}, { status: 404 })],
    ['is a server error', () => script('x', {}, { status: 500 })],
    ['is a partial answer', () => script('x', {}, { status: 206 })],
    ['was redirected', () => script('x', {}, {}, { redirected: true })],
    ['is not a plain same-origin answer (cors)', () => script('x', {}, {}, { type: 'cors' })],
    ['is not a plain same-origin answer (opaque)', () => script('x', {}, {}, { type: 'opaque' })],
  ]
  for (const [label, make] of NOT_STORED) {
    test(`an answer that ${label} is returned but never stored`, async () => {
      const w = makeWorld()
      w.fetchImpl = async () => make()
      const r = await w.get('/assets/app.js')
      assert.equal(r.intercepted, true)
      assert.ok(r.response)
      assert.deepEqual(w.keys(), [])
    })
  }

  test('fonts and images are treated the same way as scripts', async () => {
    const w = makeWorld()
    w.fetchImpl = async () => answer('bytes', { status: 200, headers: { 'content-type': 'font/woff2' } })
    for (const path of ['/fonts/manrope.woff2', '/logo.png', '/favicon.svg', '/styles/site.css']) await w.get(path)
    assert.equal(w.keys().length, 4)
  })
})

describe('nothing private ever ends up in Cache Storage', () => {
  test('after a mixed run of requests, only the shell and built files are stored', async () => {
    const w = makeWorld()
    w.fetchImpl = async (req) => {
      const p = new URL(req.url).pathname
      if (p.endsWith('.js') || p.endsWith('.css') || p.endsWith('.png')) return script('static')
      if (p.startsWith('/api/') || p.startsWith('/.netlify/')) return answer('{"uid":"u1","notes":["secret"]}', { status: 200, headers: { 'content-type': 'application/json' } })
      return html()
    }
    const calls = [
      ['/api/tutor', {}], ['/api/public-data?x=1', {}], ['/.netlify/functions/account', {}], ['/__/auth/handler?state=s', { mode: 'navigate' }],
      ['/assets/a.js', {}], ['/assets/a.js', { headers: { Authorization: 'Bearer t' } }], ['/assets/a.css', {}], ['/logo.png', {}],
      ['/dashboard', { mode: 'navigate' }], ['/study?topic=7', { mode: 'navigate' }], ['/export.json', {}], ['/api/', { mode: 'navigate' }],
    ]
    for (const [path, opts] of calls) await w.get(path, opts)
    const stored = w.keys()
    assert.ok(stored.length >= 3, 'something sensible was stored')
    for (const key of stored) {
      const p = new URL(key).pathname
      assert.ok(!/^\/(api|\.netlify|__)(\/|$)/.test(p), `private path stored: ${p}`)
      assert.ok(p === '/index.html' || /\.(js|css|woff2?|ttf|png|jpg|svg|ico|webp)$/.test(p) || p.startsWith('/assets/'), `unexpected entry: ${p}`)
    }
    assert.deepEqual([...w.stores.keys()], [STATIC])
  })
})

describe('notifications', () => {
  const showWith = async (payload) => {
    const w = makeWorld()
    await w.dispatch('push', { data: { json: () => payload } })
    return w.shown[0]
  }

  test('a normal notification keeps its text, its site link and its icons', async () => {
    const n = await showWith({ title: 'Revise now', body: 'Maths is next', icon: '/favicon.svg', badge: '/favicon.svg', url: '/study?topic=1#top', tag: 'daily', requireInteraction: true })
    assert.equal(n.title, 'Revise now')
    assert.equal(n.options.body, 'Maths is next')
    assert.equal(n.options.icon, '/favicon.svg')
    assert.equal(n.options.badge, '/favicon.svg')
    assert.equal(n.options.tag, 'daily')
    assert.equal(n.options.requireInteraction, true)
    assert.deepEqual(n.options.data, { url: '/study?topic=1#top' })
  })

  test('a link or icon that points anywhere but this site is replaced', async () => {
    const n = await showWith({ icon: 'https://tracker.example/pixel.png', badge: '//tracker.example/b.png', url: 'https://evil.example/phish' })
    assert.equal(n.options.icon, '/favicon.svg')
    assert.equal(n.options.badge, '/favicon.svg')
    assert.deepEqual(n.options.data, { url: '/' })
  })

  test('a full address on this site is reduced to its path', async () => {
    const n = await showWith({ url: `${ORIGIN}/calendar?week=2` })
    assert.deepEqual(n.options.data, { url: '/calendar?week=2' })
  })

  test('text is bounded, wrong types fall back to the defaults, and at most two actions are kept', async () => {
    const n = await showWith({
      title: 'T'.repeat(500), body: 'B'.repeat(2000), tag: 'g'.repeat(300), requireInteraction: 'yes',
      actions: [{ action: 'a', title: 'A' }, { action: 'b', title: 'B' }, { action: 'c', title: 'C' }, { action: 5, title: 'bad' }, null],
    })
    assert.equal(n.title.length, 100)
    assert.equal(n.options.body.length, 300)
    assert.equal(n.options.tag.length, 64)
    assert.equal(n.options.requireInteraction, false)
    assert.deepEqual(n.options.actions, [{ action: 'a', title: 'A' }, { action: 'b', title: 'B' }])
    const d = await showWith({ title: 42, body: ['x'], tag: {}, actions: 'nope' })
    assert.equal(d.title, 'RevisionFlow')
    assert.equal(d.options.body, 'Time to revise!')
    assert.equal(d.options.tag, 'revisionflow')
    assert.deepEqual(d.options.actions, [])
  })

  test('a payload that is not JSON, not an object, or missing still shows the default notification', async () => {
    for (const data of [{ json: () => { throw new SyntaxError('bad') } }, { json: () => 'a string' }, { json: () => null }, undefined]) {
      const w = makeWorld()
      await w.dispatch('push', { data })
      assert.equal(w.shown[0].title, 'RevisionFlow')
      assert.equal(w.shown[0].options.body, 'Time to revise!')
      assert.deepEqual(w.shown[0].options.data, { url: '/' })
    }
  })

  describe('clicking one', () => {
    const OUTSIDE = ['https://evil.example/phish', '//evil.example/x', 'javascript:alert(1)', 'data:text/html,hi', '/\\evil.example', 'http://www.revisionflow.co.uk.evil.example/', '/ok\nbad', `/${'a'.repeat(600)}`, '', 42, null]
    for (const url of OUTSIDE) {
      test(`${JSON.stringify(typeof url === 'string' ? url.slice(0, 40) : url)} opens the home page, never that address`, async () => {
        const w = makeWorld()
        assert.equal(await w.click(url), true, 'the notification is closed')
        assert.deepEqual(w.opened, ['/'])
      })
    }

    test('a notification with no data opens the home page', async () => {
      const w = makeWorld()
      await w.click(undefined, { omitData: true })
      assert.deepEqual(w.opened, ['/'])
    })

    test('a path on this site is opened as given', async () => {
      const w = makeWorld()
      await w.click('/study?topic=3#cards')
      assert.deepEqual(w.opened, ['/study?topic=3#cards'])
    })

    test('an open tab of this site is focused and sent there, instead of opening another window', async () => {
      const w = makeWorld()
      const log = []
      w.windowClients = [{ url: `${ORIGIN}/dashboard`, focus: async () => { log.push('focus') }, navigate: async (u) => { log.push(['navigate', u]) } }]
      await w.click('/calendar')
      assert.deepEqual(log, ['focus', ['navigate', '/calendar']])
      assert.deepEqual(w.opened, [])
    })

    test('a window on another origin is never focused or navigated', async () => {
      const w = makeWorld()
      const log = []
      w.windowClients = [
        { url: 'https://www.revisionflow.co.uk.evil.example/', focus: async () => { log.push('focus-evil') }, navigate: async () => { log.push('navigate-evil') } },
        { url: 'https://evil.example/?https://www.revisionflow.co.uk', focus: async () => { log.push('focus-evil2') }, navigate: async () => { log.push('navigate-evil2') } },
      ]
      await w.click('/calendar')
      assert.deepEqual(log, [])
      assert.deepEqual(w.opened, ['/calendar'])
    })

    test('if the open tab cannot be navigated, a new window is opened instead', async () => {
      const w = makeWorld()
      w.windowClients = [{ url: `${ORIGIN}/dashboard`, focus: async () => {}, navigate: async () => { throw new TypeError('uncontrolled client') } }]
      await w.click('/calendar')
      assert.deepEqual(w.opened, ['/calendar'])
    })
  })
})

describe('the stored push key', () => {
  const KEY = 'B' + 'A'.repeat(86)

  test('a well-formed key from the page is stored', async () => {
    const w = makeWorld()
    await w.dispatch('message', { data: { type: 'SET_VAPID_KEY', key: KEY } })
    const stored = await w.cached('/__push-config/vapid-public-key', PUSH_CACHE)
    assert.equal(await stored.text(), KEY)
  })

  const BAD = ['', 'short', KEY + '<script>', KEY + ' ', 'x'.repeat(500), 12345, { key: KEY }, null, undefined, ['a']]
  for (const key of BAD) {
    test(`${JSON.stringify(typeof key === 'string' ? key.slice(0, 30) : key)} is not stored`, async () => {
      const w = makeWorld()
      await w.dispatch('message', { data: { type: 'SET_VAPID_KEY', key } })
      assert.equal(w.stores.size, 0)
    })
  }

  test('other messages, and messages with no data, are ignored', async () => {
    const w = makeWorld()
    for (const data of [{ type: 'SOMETHING_ELSE', key: KEY }, 'SET_VAPID_KEY', null, undefined, 7]) await w.dispatch('message', { data })
    assert.equal(w.stores.size, 0)
  })

  test('an update keeps the stored key, so an expired subscription can renew itself', async () => {
    const w = makeWorld()
    await w.dispatch('message', { data: { type: 'SET_VAPID_KEY', key: KEY } })
    for (const name of ['rf-static-v7', 'rf-dynamic-v7']) w.stores.set(name, new Map())
    await w.dispatch('activate')
    const posted = []
    w.windowClients = [{ url: `${ORIGIN}/`, postMessage: (m) => posted.push(plain(m)) }]
    await w.dispatch('pushsubscriptionchange', { oldSubscription: null })
    assert.ok(w.subscribeOpts, 'it renewed the subscription by itself')
    assert.equal(w.subscribeOpts.userVisibleOnly, true)
    assert.ok(w.subscribeOpts.applicationServerKey instanceof Uint8Array)
    assert.equal(posted.length, 1)
    assert.equal(posted[0].type, 'PUSH_SUBSCRIPTION_CHANGED')
  })

  test('with no key anywhere, an open page is asked to subscribe again', async () => {
    const w = makeWorld()
    const posted = []
    w.windowClients = [{ url: `${ORIGIN}/`, postMessage: (m) => posted.push(plain(m)) }]
    await w.dispatch('pushsubscriptionchange', { oldSubscription: null })
    assert.equal(w.subscribeOpts, null)
    assert.deepEqual(posted, [{ type: 'PUSH_RESUBSCRIBE_NEEDED' }])
  })
})
