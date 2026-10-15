// src/utils/adminApi.js
// Client helper for /api/admin. The server verifies the Firebase ID token and admin identity;
// nothing here is trusted. Privileged content writes follow draft → review → approval.
import { auth, getAppCheckHeader } from '../firebase'

async function adminFetch(action, params = {}) {
  const currentUser = auth.currentUser
  if (!currentUser) throw new Error('Not signed in')
  const idToken = await currentUser.getIdToken()
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + idToken,
      ...(await getAppCheckHeader()),
    },
    body: JSON.stringify({ action, ...params }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.error) throw new Error(data.error || 'Admin call failed')
  return data
}

// Create a draft and put it straight into the review queue. It is NOT live until approved.
export async function submitContentForReview(kind, id, data, op = 'set') {
  const { draftId } = await adminFetch('contentDraft', { kind, id, data, op })
  await adminFetch('contentSubmit', { draftId })
  return draftId
}

export const listContentDrafts = (status) => adminFetch('contentListDrafts', { status })
export const approveContentDraft = (draftId) => adminFetch('contentApprove', { draftId })
export const rejectContentDraft  = (draftId, reason) => adminFetch('contentReject', { draftId, reason })
