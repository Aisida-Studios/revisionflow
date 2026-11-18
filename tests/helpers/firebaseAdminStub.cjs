// tests/helpers/firebaseAdminStub.cjs
// A stand-in for firebase-admin so a Netlify function can run under test. Tokens look like "good:<uid>"; the database is
// whatever the test puts in globalThis.__db (see helpers/fakeFirestore.js).
module.exports = {
  apps: [],
  initializeApp() { this.apps.push({}) },
  credential: { cert: () => ({}) },
  auth: () => ({ verifyIdToken: async (t) => { if (!String(t).startsWith('good:')) throw new Error('bad token'); return { uid: String(t).slice(5) } } }),
  appCheck: () => ({ verifyToken: async () => ({}) }),
  firestore: () => globalThis.__db,
}
