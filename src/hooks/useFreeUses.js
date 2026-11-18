// src/hooks/useFreeUses.js
// What is left of a free allowance, for a page to show ("2 of 5 free Maths solves left"). It asks the server once (see
// utils/entitlementsClient.js) and is then kept up to date from what each answer reports: pass what the server said ({
// remainingLifetime, dailyRemaining }) to update(). Pro and beta accounts, and anyone whose plan could not be checked, get no
// label, so they see no counters. Pass { enabled: false } for an account already known to be Pro and nothing is fetched.
import { useCallback, useEffect, useState } from 'react'
import { fetchEntitlementStatus, freeUsesLabel } from '../utils/entitlementsClient'

export function useFreeUses(feature, { enabled = true } = {}) {
  const [status, setStatus] = useState(null)
  useEffect(() => {
    if (!enabled) { setStatus(null); return undefined }
    let live = true
    fetchEntitlementStatus().then(res => {
      if (!live || !res || !res.ok) return
      setStatus(res.pro ? { feature, pro: true } : (res.features && res.features[feature]) || null)
    })
    return () => { live = false }
  }, [feature, enabled])
  const update = useCallback((left) => {
    if (!left || left.remainingLifetime == null) return
    setStatus(prev => (prev && !prev.pro
      ? { ...prev, remainingLifetime: left.remainingLifetime, dailyRemaining: left.dailyRemaining != null ? left.dailyRemaining : prev.dailyRemaining, exhausted: left.remainingLifetime === 0 }
      : prev))
  }, [])
  const known = !!status && !status.pro
  return { status, label: freeUsesLabel(status), update, known, exhausted: known && status.remainingLifetime === 0 }
}
