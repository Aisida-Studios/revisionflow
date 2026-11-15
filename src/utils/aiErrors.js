// src/utils/aiErrors.js
// Whether a failed AI request is worth sending again. callAI() reports its failures as a plain message, so this reads
// the message: a timeout, a dropped connection, a reply cut off part-way, an empty reply and a server error (5xx) are
// usually gone a moment later; a used-up daily allowance, a sign-in problem or a client error (4xx) is not.
// Pure: no network, so it is tested.

export function isTransientAIError(message) {
  const m = String(message == null ? '' : message)
  if (!m) return false
  if (/used today|more opens up tomorrow|daily|allowance|limit|sign in|forbidden|unauthori[sz]ed|\b4\d\d\b/i.test(m)) return false
  return /timed out|could not reach|non-json|cut off|empty response|failed \(5\d\d\)|temporarily|unavailable|try again/i.test(m)
}

// Runs an AI request and, when it fails in a way that passes, runs it once more after a short pause. Resolves to the
// last result, which is a success or the same { error } shape as before.
export async function withOneRetry(run, { delay = 1500, wait = (ms) => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
  let res = await run()
  if (res && res.error && isTransientAIError(res.error)) {
    await wait(delay)
    res = await run()
  }
  return res
}
