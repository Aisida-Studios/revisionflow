// src/data/curriculum/index.js
// ─────────────────────────────────────────────────────────────────────────────
// Read-only access to the curriculum provenance registry.
//
//   manifest.json   (generated)  one record per board × qualification × subject dataset in
//                                topics.js: verification status, specification code/version,
//                                sources, unresolved issues.
//   provenance.json (curated)    the evidence the manifest is built from.
//   specs/*.json                 official specification structure + how each point maps onto
//                                topics.js (only for datasets that have been compared in detail).
//
// This is PROVENANCE, not curriculum content. Topic titles and ids still come from
// data/topics.js (via data/overrides.js getMergedTopicsFlat — never replace that with a static
// lookup). Verification metadata must not be rendered as if it were part of a topic title.
//
// Importing this module pulls manifest.json into the bundle, so import it only where provenance
// is actually shown (e.g. an admin/QA screen). The subject pickers use the much smaller generated
// availability.js instead.
// ─────────────────────────────────────────────────────────────────────────────

import manifest from './manifest.json'
import { canonicalBoard } from '../boards'

export const CURRICULUM_MANIFEST = manifest

const byId = new Map(manifest.datasets.map(d => [d.id, d]))

/** @returns the registry record for a dataset, or null when topics.js has no such dataset. */
export function getDatasetRecord(board, qualification, subject) {
  return byId.get(`${canonicalBoard(board)}|${qualification}|${subject}`) || null
}

/** 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'AWAITING_VERIFICATION' | 'BLOCKED' | 'UNSUPPORTED' (null if unknown dataset) */
export function getVerificationStatus(board, qualification, subject) {
  return getDatasetRecord(board, qualification, subject)?.verificationStatus ?? null
}

/** Datasets by status, e.g. for an admin dashboard. */
export function countByStatus() {
  const c = { VERIFIED: 0, PARTIALLY_VERIFIED: 0, AWAITING_VERIFICATION: 0, BLOCKED: 0, UNSUPPORTED: 0 }
  for (const d of manifest.datasets) c[d.verificationStatus] += 1
  return c
}

/** The source records (title, url, tier, accessedAt …) cited by a dataset. */
export function getSourcesFor(record) {
  return (record?.sourceIds || []).map(id => ({ id, ...manifest.sources[id] }))
}
