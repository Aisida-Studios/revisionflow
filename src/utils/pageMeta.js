// src/utils/pageMeta.js
// Per-page title and search metadata for a single-page app. index.html ships one static title,
// description and canonical for every route, so each page sets its own when it mounts and puts the
// defaults back when it unmounts.
import { useEffect } from 'react'

const SITE = 'https://www.revisionflow.co.uk'
const DEFAULT_TITLE = 'RevisionFlow'

// Finds a tag in <head>, or creates it. Returns { el, created }.
function headTag(selector, create) {
  let el = document.head.querySelector(selector)
  if (el) return { el, created: false }
  el = create()
  document.head.appendChild(el)
  return { el, created: true }
}

function makeMeta(name) {
  return () => { const m = document.createElement('meta'); m.setAttribute('name', name); return m }
}

// usePageMeta({ title, description, path, noindex })
//   title        document title, for example 'Sign in | RevisionFlow'
//   description  meta description shown in search results
//   path         this page's own path, for example '/login'; sets the canonical URL
//   noindex      true for pages that must stay out of search results
// The title goes back to the plain site title on leaving; TimerContext adopts whatever the title
// is as its base, so a running timer keeps working across pages.
export function usePageMeta({ title, description, path, noindex } = {}) {
  useEffect(() => {
    const undo = []

    // Sets one attribute on a tag and queues the matching restore.
    function set(selector, create, attr, value) {
      const { el, created } = headTag(selector, create)
      const previous = el.getAttribute(attr)
      el.setAttribute(attr, value)
      undo.push(() => {
        if (created) el.remove()
        else if (previous !== null) el.setAttribute(attr, previous)
      })
    }

    if (title) {
      document.title = title
      undo.push(() => { document.title = DEFAULT_TITLE })
    }
    if (description) set('meta[name="description"]', makeMeta('description'), 'content', description)
    if (path) set('link[rel="canonical"]', () => { const l = document.createElement('link'); l.setAttribute('rel', 'canonical'); return l }, 'href', SITE + path)
    if (noindex) set('meta[name="robots"]', makeMeta('robots'), 'content', 'noindex')

    return () => undo.forEach(fn => fn())
  }, [title, description, path, noindex])
}
