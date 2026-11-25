// netlify/functions/lib/profile.js
// Clean-up for the profile fields other students get to see (display name and avatar), shared by every function that hands
// one student's profile data to another (public-data, friends, referral).
//
// Avatars: in this app an avatar URL only ever comes from the Google account photo (Firebase Auth `photoURL`; there is no
// field where a student types a link). The Firestore rules still let a student write any https:// string to their own
// avatarUrl, and every classmate's browser would then load that image when it appears on a leaderboard or friend list, which
// tells whoever hosts it the viewer's IP address and browser. So a URL is only passed on when it is https and its host is a
// Google photo host. Anything else is replaced by '' and the interface falls back to the student's initial or icon. Set
// AVATAR_HOSTS (comma separated host suffixes) in Netlify if another sign-in provider is ever added.
'use strict'

const DEFAULT_AVATAR_HOSTS = ['googleusercontent.com', 'ggpht.com']

const cleanName = (v, max = 100) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max)

function avatarHostSuffixes(env = process.env) {
  const configured = String(env.AVATAR_HOSTS || '').split(',').map((s) => s.trim().toLowerCase().replace(/^\.+/, '')).filter(Boolean)
  return configured.length ? configured : DEFAULT_AVATAR_HOSTS
}

function safeAvatarUrl(value, env = process.env) {
  if (typeof value !== 'string' || !value || value.length > 2048) return ''
  let url
  try { url = new URL(value) } catch { return '' }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) return ''
  const host = url.hostname.toLowerCase()
  return avatarHostSuffixes(env).some((suffix) => host === suffix || host.endsWith('.' + suffix)) ? value : ''
}

module.exports = { cleanName, safeAvatarUrl, avatarHostSuffixes, DEFAULT_AVATAR_HOSTS }
