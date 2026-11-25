// netlify/functions/lib/audit.js
// The admin audit trail: one document per privileged action in adminAuditLog, written by admin.js (every change) and
// admin-metrics.js (every look at one student's record), read back by admin-metrics.js. The collection is server-only in
// firestore.rules, so no browser can add to it, edit it or erase it.
//
// It is AWAITED, and callers write it BEFORE they act: if the record cannot be written the request fails and nothing changes. The
// record can say a little more than happened (the change then failed), never less. The actor is the VERIFIED admin from
// lib/auth.js requireAdmin, never anything in the request body.
// CommonJS — netlify/functions/package.json sets "type":"commonjs"
'use strict'

async function logAdminAction(db, actor, action, details = {}) {
  await db.collection('adminAuditLog').add({
    action,
    actorEmail: actor.email,
    actorUid: actor.uid,
    details,
    timestamp: new Date().toISOString(),
  })
}

module.exports = { logAdminAction }
