// src/utils/entitlementsCore.js
// The pure half of the browser's view of the Free / Pro entitlement model: no Firebase, no network, so it is covered by
// tests/utils.test.js. DISPLAY ONLY: it lets the interface say "2 of 5 free solves left" and show an upgrade prompt, but it
// is never the authority. The server (netlify/functions/entitlements.js and tutor.js, using netlify/functions/lib/
// entitlementLogic.js) decides, so a request the browser thinks is fine can still be refused.
//
// The numbers come from the same JSON file the server reads, so the two cannot disagree about a limit.
import CONFIG from '../../netlify/functions/lib/entitlementConfig.json'

export const FREE_FEATURES = Object.keys(CONFIG.free)
export const PRO_ONLY_FEATURES = Object.keys(CONFIG.proOnly)
export const isCappedFeature = (feature) => Object.prototype.hasOwnProperty.call(CONFIG.free, feature)
export const entitlementLabel = (feature) => (CONFIG.free[feature] || {}).label || (CONFIG.proOnly || {})[feature] || ''

const utcDay = (now = new Date()) => now.toISOString().slice(0, 10)
const nonNeg = (n) => (Number.isFinite(n) && n > 0 ? Math.floor(n) : 0)

// What an account's counts look like for one capped feature, worked out from its usage/lifetime document. This mirrors
// describeStatus() in netlify/functions/lib/entitlementLogic.js (a test checks they agree); the server's answer wins.
export function describeEntitlement(feature, doc, { pro = false, day = utcDay() } = {}) {
  const f = CONFIG.free[feature]
  if (!f) return null
  if (pro) return { feature, pro: true, lifetime: null, usedLifetime: null, remainingLifetime: null, dailyLimit: null, dailyUsed: null, dailyRemaining: null, exhausted: false }
  const d = doc || {}
  const usedLifetime = nonNeg(d[feature])
  const rec = d.daily && d.daily[feature]
  const dailyUsed = rec && rec.day === day ? nonNeg(rec.n) : 0
  const remainingLifetime = Math.max(0, f.lifetime - usedLifetime)
  return {
    feature, pro: false, lifetime: f.lifetime, usedLifetime, remainingLifetime,
    dailyLimit: f.daily || null, dailyUsed: f.daily ? dailyUsed : null,
    dailyRemaining: f.daily ? Math.max(0, f.daily - dailyUsed) : null,
    exhausted: remainingLifetime === 0,
  }
}

// "2 of 5 free Maths solves left", or null when there is nothing to say (Pro and beta accounts see no counters).
export function freeUsesLabel(status) {
  if (!status || status.pro || status.remainingLifetime == null) return null
  const f = CONFIG.free[status.feature]
  if (!f) return null
  if (status.lifetime === 1) return status.remainingLifetime ? `1 free ${f.single} left` : `Your free ${f.single} is used`
  return `${status.remainingLifetime} of ${status.lifetime} free ${f.plural} left`
}

// The server tells the browser WHY it said no with a machine-readable code. These two mean "offer Pro".
export const isUpgradeCode = (code) => code === 'LIFETIME_EXHAUSTED' || code === 'PRO_REQUIRED'

// The wording for a refusal, for when the browser has to say it before (or without) hearing from the server. This mirrors
// messageFor() in netlify/functions/lib/entitlementLogic.js (a test checks they agree). Soft by design: never "quota" or
// "rate limit", and Pro is "more", never "unlimited".
export function entitlementMessage(code, feature) {
  const f = CONFIG.free[feature]
  if (code === 'PRO_REQUIRED') return `${(CONFIG.proOnly || {})[feature] || (f && f.label) || 'This'} is a Pro feature.`
  if (!f) return 'That is not available right now.'
  if (code === 'LIFETIME_EXHAUSTED') {
    const used = f.lifetime === 1 ? `your free ${f.single}` : `all ${f.lifetime} of your free ${f.plural}`
    return `You've used ${used}. ${f.upgradeHint || 'Upgrade to Pro to keep going.'}`
  }
  if (code === 'DAILY_LIMIT') return `You've used today's free ${f.plural}. More opens up tomorrow, or upgrade to Pro for more.`
  return 'That is not available right now.'
}
