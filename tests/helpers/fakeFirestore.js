// tests/helpers/fakeFirestore.js
// A small in-memory stand-in for the Admin SDK's Firestore, just enough for netlify/functions/lib/entitlementLogic.js and
// netlify/functions/entitlements.js: documents and subcollections by path, get/set (with merge)/update, simple where().limit()
// queries, and runTransaction with optimistic concurrency: a transaction whose reads changed under it is retried, like
// the real one, so two requests racing for the last free use really do race here.
const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)))
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v)
function deepMerge(target, src) {
  const out = { ...target }
  for (const k of Object.keys(src)) out[k] = isObj(src[k]) && isObj(out[k]) ? deepMerge(out[k], src[k]) : clone(src[k])
  return out
}
const later = () => new Promise(r => setTimeout(r, 0))

export function makeFakeFirestore(initial = {}) {
  const store = new Map(Object.entries(initial).map(([path, data]) => [path, { data: clone(data), version: 1 }]))
  const log = { writes: [] }

  const snapshot = (path) => { const e = store.get(path); return { id: path.split('/').pop(), exists: !!e, data: () => (e ? clone(e.data) : undefined) } }
  const write = (path, data, opts) => {
    const e = store.get(path)
    if (opts && opts.shallow) {
      // tx.update(): replace the given top-level fields, keep the rest; the document has to exist already
      if (!e) throw new Error(`NOT_FOUND: no document to update: ${path}`)
      store.set(path, { data: { ...e.data, ...clone(data) }, version: e.version + 1 })
      log.writes.push(path)
      return
    }
    store.set(path, { data: opts && opts.merge && e ? deepMerge(e.data, data) : clone(data), version: (e ? e.version : 0) + 1 })
    log.writes.push(path)
  }
  const docRef = (path) => ({ path, id: path.split('/').pop(), collection: (name) => collRef(`${path}/${name}`), get: async () => snapshot(path), set: async (data, opts) => write(path, data, opts) })
  const collRef = (path, filters = [], max = Infinity) => ({
    path,
    doc: (id) => docRef(`${path}/${id}`),
    where: (field, op, value) => collRef(path, [...filters, { field, op, value }], max),
    limit: (n) => collRef(path, filters, n),
    get: async () => {
      const prefix = `${path}/`
      const docs = [...store.entries()]
        .filter(([p]) => p.startsWith(prefix) && !p.slice(prefix.length).includes('/'))
        .filter(([, e]) => filters.every(f => f.op === '==' && e.data[f.field] === f.value))
        .slice(0, max)
        .map(([p]) => snapshot(p))
      return { empty: docs.length === 0, size: docs.length, docs }
    },
  })

  return {
    collection: (name) => collRef(name),
    runTransaction: async (fn) => {
      for (let attempt = 1; ; attempt++) {
        const reads = new Map(), writes = []
        const tx = {
          get: async (ref) => { await later(); const e = store.get(ref.path); reads.set(ref.path, e ? e.version : 0); return snapshot(ref.path) },
          set: (ref, data, opts) => { writes.push({ path: ref.path, data, opts }) },
          update: (ref, data) => { writes.push({ path: ref.path, data, opts: { shallow: true } }) },
        }
        const result = await fn(tx)
        const conflict = [...reads].some(([path, v]) => (store.has(path) ? store.get(path).version : 0) !== v)
        if (conflict) { if (attempt >= 5) throw new Error('ABORTED: too much contention'); continue }
        // an update to a document that does not exist fails the whole transaction before anything is applied
        const present = new Set(store.keys())
        for (const w of writes) {
          if (w.opts && w.opts.shallow) { if (!present.has(w.path)) throw new Error(`NOT_FOUND: no document to update: ${w.path}`) }
          else present.add(w.path)
        }
        writes.forEach(w => write(w.path, w.data, w.opts))
        return result
      }
    },
    // for assertions
    read: (path) => (store.has(path) ? clone(store.get(path).data) : undefined),
    writesTo: (path) => log.writes.filter(p => p === path).length,
    allWrites: () => [...log.writes],
  }
}
