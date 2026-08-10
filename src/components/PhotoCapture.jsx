// src/components/PhotoCapture.jsx
// Reusable "take a photo or upload one, turn it into text" widget. Used by the Tutor
// page (both Maths and English) and the Answer Marker. Doesn't do anything with the
// extracted text itself — the parent decides where it goes via onExtracted.
//
// Uses <input type="file" capture="environment"> for the camera rather than a custom
// navigator.mediaDevices video stream — on mobile this opens the OS's own camera app
// (with its own focus/flash/etc.), which is more reliable across browsers than building
// a live in-page preview, and on desktop it just falls back to a normal file picker.
import React, { useState, useRef } from 'react'
import { extractTextFromImage } from '../utils/ai'
import { Camera, Upload, X, Loader2 } from 'lucide-react'

const MAX_DIMENSION = 1600   // longest edge, px — plenty for legible text, keeps payload small
const JPEG_QUALITY   = 0.82
const MAX_SOURCE_BYTES = 20 * 1024 * 1024 // sanity ceiling on the ORIGINAL file, before compression

function compressImage(file) {
  return new Promise((resolve, reject) => {
    // FileReader -> data: URI, not URL.createObjectURL() -> blob: URI. This app's CSP
    // (netlify.toml) is `img-src 'self' data: https:` — data: is allowed, blob: isn't,
    // so loading a blob: URL into an <img>/Image() is silently blocked by the browser.
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) { height = Math.round(height * MAX_DIMENSION / width); width = MAX_DIMENSION }
          else { width = Math.round(width * MAX_DIMENSION / height); height = MAX_DIMENSION }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
      }
      img.onerror = () => reject(new Error('Could not load that image'))
      img.src = reader.result
    }
    reader.onerror = () => reject(new Error('Could not read that file'))
    reader.readAsDataURL(file)
  })
}

export default function PhotoCapture({ uid, kind, onExtracted, label }) {
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const cameraRef = useRef(null)
  const uploadRef = useRef(null)

  async function handleFile(file) {
    if (!file) return
    setError('')
    if (!file.type.startsWith('image/')) {
      setError('That doesn\u2019t look like an image \u2014 try a photo or screenshot instead')
      return
    }
    if (file.size > MAX_SOURCE_BYTES) {
      setError('That file is too large')
      return
    }

    setLoading(true)
    try {
      const dataUrl = await compressImage(file)
      setPreview(dataUrl)
      const res = await extractTextFromImage(dataUrl, kind, uid)
      if (res.error) { setError(res.error); return }
      const text = (res.text || '').trim()
      if (!text) { setError('Could not read any text from that photo \u2014 try a clearer or better-lit shot'); return }
      onExtracted(text)
    } catch (e) {
      setError('Could not read that image: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  function clear() {
    setPreview(null); setError('')
    if (cameraRef.current) cameraRef.current.value = ''
    if (uploadRef.current) uploadRef.current.value = ''
  }

  return (
    <div>
      {!preview && (
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => cameraRef.current?.click()} disabled={loading}>
            <Camera size={14} /> Take photo
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => uploadRef.current?.click()} disabled={loading}>
            <Upload size={14} /> Upload photo
          </button>
          {label && <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{label}</span>}
        </div>
      )}

      <input ref={cameraRef} type="file" accept="image/*" capture="environment"
        style={{ display:'none' }} onChange={e => handleFile(e.target.files?.[0])} />
      <input ref={uploadRef} type="file" accept="image/*"
        style={{ display:'none' }} onChange={e => handleFile(e.target.files?.[0])} />

      {preview && (
        <div style={{ marginTop:10, display:'flex', gap:10, alignItems:'center' }}>
          <img src={preview} alt="" style={{ width:56, height:56, objectFit:'cover', borderRadius:10, border:'1px solid var(--border)', flexShrink:0 }} />
          {loading ? (
            <span style={{ fontSize:'0.8rem', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:6 }}>
              <Loader2 size={14} style={{ animation:'spin 0.7s linear infinite' }} /> Reading the photo…
            </span>
          ) : (
            <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
              <X size={13} /> Remove photo
            </button>
          )}
        </div>
      )}
      {error && <p style={{ color:'var(--danger)', fontSize:'0.78rem', marginTop:6 }}>{error}</p>}
    </div>
  )
}
