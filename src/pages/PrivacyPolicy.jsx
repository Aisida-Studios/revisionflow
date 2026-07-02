// src/pages/PrivacyPolicy.jsx
// GDPR-compliant privacy policy for RevisionFlow
// Data controller: Oluwafemi Aisida, England, United Kingdom
// Last updated: July 2026

import { Link } from 'react-router-dom'
import { ArrowLeft, Zap } from 'lucide-react'

const SECTION_STYLE = { marginBottom: '2rem' }
const H2_STYLE = { fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }
const P_STYLE = { color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '0.75rem' }
const UL_STYLE = { color: 'var(--text-secondary)', lineHeight: 1.9, paddingLeft: '1.5rem', marginBottom: '0.75rem' }

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', borderBottom:'1px solid var(--border)', background:'var(--bg-surface)' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', color:'var(--text-primary)', fontWeight:800, fontSize:'1.05rem' }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#7c3aed,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Zap size={18} color="#fff"/>
          </div>
          Revision<span style={{ color:'var(--accent-light)' }}>Flow</span>
        </Link>
        <div style={{ display:'flex', gap:10 }}>
          <Link to="/" className="btn btn-secondary btn-sm"><ArrowLeft size={14}/> Back</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get started free</Link>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h1 style={{ marginBottom: '0.4rem' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Last updated: 1 July 2026 · Effective date: 1 July 2026
        </p>

        <div style={{ padding:'14px 18px', background:'rgba(124,58,237,0.08)', border:'1px solid var(--accent)', borderRadius:'var(--radius-md)', marginBottom:'2rem', fontSize:'0.875rem', lineHeight:1.7 }}>
          This Privacy Policy explains how <strong>RevisionFlow</strong> ("we", "us", "our") collects, uses, stores and protects your personal data when you use our revision tracking application at <strong>revisionflow.netlify.app</strong>. This policy complies with the <strong>UK General Data Protection Regulation (UK GDPR)</strong> and the <strong>Data Protection Act 2018</strong>.
        </div>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>1. Data Controller</h2>
          <p style={P_STYLE}>The data controller responsible for your personal data is:</p>
          <p style={P_STYLE}>
            <strong>Oluwafemi Aisida</strong><br/>
            England, United Kingdom<br/>
            Contact: <a href="mailto:femiaisida1@gmail.com" style={{ color:'var(--accent-light)' }}>femiaisida1@gmail.com</a>
          </p>
          <p style={P_STYLE}>
            RevisionFlow is an independent educational web application. It is not a registered company. If you have any questions about how your data is handled, please contact us at the email address above.
          </p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>2. What Data We Collect and Why</h2>
          <p style={P_STYLE}>We collect only the data necessary to provide the RevisionFlow service. The legal basis for each type of processing is noted below.</p>

          <p style={{ ...P_STYLE, fontWeight:600 }}>Account data (lawful basis: contract performance)</p>
          <ul style={UL_STYLE}>
            <li>Email address — used to create and authenticate your account</li>
            <li>Display name and username — displayed on your profile and leaderboard</li>
            <li>Password — stored as a cryptographic hash by Firebase Authentication; we never see your password in plain text</li>
            <li>Profile photo (if you sign in with Google) — displayed on your profile</li>
          </ul>

          <p style={{ ...P_STYLE, fontWeight:600 }}>Revision data (lawful basis: contract performance)</p>
          <ul style={UL_STYLE}>
            <li>Subjects, exam board, qualification level and target grades</li>
            <li>Revision sessions: subject, date, duration, session type, completion status, notes</li>
            <li>Past paper attempts: subject, paper, year, score, percentage, grade, boundaries</li>
            <li>Topic confidence ratings (1–5) per specification topic</li>
            <li>Logged mistakes: subject, topic, description, resolution status</li>
            <li>Tasks: title, due date, priority, completion status</li>
            <li>Notes: subject, content, created date</li>
            <li>Exam dates: subject, board, date</li>
            <li>Flashcard sets: title, subject, topic, cards (front/back), visibility (private/public)</li>
            <li>Quiz results: set title, score, time taken, mode (saved to your quiz history)</li>
            <li>Topic resource preferences: which resource links you open (not tracked — links open externally)</li>
          </ul>

          <p style={{ ...P_STYLE, fontWeight:600 }}>Gamification data (lawful basis: contract performance)</p>
          <ul style={UL_STYLE}>
            <li>XP points, level, current streak, best streak, session count</li>
            <li>Earned badges and achievement dates</li>
          </ul>

          <p style={{ ...P_STYLE, fontWeight:600 }}>Social features (lawful basis: legitimate interests / consent)</p>
          <ul style={UL_STYLE}>
            <li>Friends list: UIDs of connected users</li>
            <li>Friend requests: sender and recipient UIDs</li>
            <li>Leaderboard data: display name, XP, level and streak visible to other users (opt-out available in Settings)</li>
            <li>Public profile: if you set a username, your profile page (<code>/u/username</code>) is publicly accessible without login and shows your display name, level, XP, streak, badges and subjects. No email or revision scores are shown.</li>
            <li>Referral code: a non-personal code derived from the first 8 characters of your user ID, used to track referrals</li>
          </ul>

          <p style={{ ...P_STYLE, fontWeight:600 }}>AI interaction data (lawful basis: contract performance)</p>
          <ul style={UL_STYLE}>
            <li>Messages sent to the AI Advisor, Mark Answer, Grade Predictor, Flashcard Generator, and Study Plan features</li>
            <li>Your revision data (subjects, grades, recent sessions) included in AI prompts to personalise responses</li>
            <li>These are processed by <strong>Mistral AI</strong> via their API</li>
          </ul>

          <p style={{ ...P_STYLE, fontWeight:600 }}>Technical data (lawful basis: legitimate interests)</p>
          <ul style={UL_STYLE}>
            <li>Browser local storage: app preferences (dark mode, dismissed banners, tour completion)</li>
            <li>Service worker cache: static app assets for offline functionality</li>
            <li>No IP addresses, device fingerprints, or tracking pixels are collected by us</li>
          </ul>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>3. How We Use Your Data</h2>
          <ul style={UL_STYLE}>
            <li>To provide, operate and maintain the RevisionFlow application</li>
            <li>To personalise AI-generated study advice, grade predictions, and revision plans</li>
            <li>To calculate your XP, streaks, badges and leaderboard position</li>
            <li>To enable social features (friends, leaderboard) where you have chosen to use them</li>
            <li>To send browser push notifications for session reminders and timer alerts (only if you grant permission)</li>
            <li>To maintain your session history for the Analytics page</li>
          </ul>
          <p style={P_STYLE}><strong>We do not:</strong> sell your data, use it for advertising, share it with third parties beyond those listed below, or use it for any purpose other than operating RevisionFlow.</p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>4. Third-Party Services and Data Transfers</h2>
          <p style={P_STYLE}>We use the following third-party services to operate RevisionFlow. Each processes your data only to the extent necessary to provide their service to us.</p>

          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
              <thead>
                <tr style={{ borderBottom:'2px solid var(--border)' }}>
                  {['Service','Purpose','Data transferred','Location','Privacy policy'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'8px 12px', color:'var(--text-muted)', fontWeight:600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Google Firebase','Authentication, Firestore database, hosting infrastructure','Email, display name, all Firestore data','EU / USA (SCCs apply)','firebase.google.com/support/privacy'],
                  ['Mistral AI','AI Advisor, answer marking, study plan generation','Your messages + summarised revision context','EU','mistral.ai/privacy'],
                  ['Netlify','Web hosting, deployment, and serverless functions (admin operations, AI proxy)','IP addresses in server logs (Netlify standard logging)','USA (SCCs apply)','netlify.com/privacy'],
                ].map(([s,p,d,l,url]) => (
                  <tr key={s} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'10px 12px', fontWeight:600 }}>{s}</td>
                    <td style={{ padding:'10px 12px', color:'var(--text-secondary)' }}>{p}</td>
                    <td style={{ padding:'10px 12px', color:'var(--text-secondary)' }}>{d}</td>
                    <td style={{ padding:'10px 12px', color:'var(--text-secondary)', whiteSpace:'nowrap' }}>{l}</td>
                    <td style={{ padding:'10px 12px' }}><a href={`https://${url}`} target="_blank" rel="noreferrer" style={{ color:'var(--accent-light)', fontSize:'0.8rem' }}>{url}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ ...P_STYLE, marginTop:'1rem' }}>
            <strong>International transfers:</strong> Where data is transferred outside the UK/EEA (to USA-based servers), this is covered by Standard Contractual Clauses (SCCs) as permitted under UK GDPR Article 46, or adequacy decisions where applicable.
          </p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>5. Data Retention</h2>
          <ul style={UL_STYLE}>
            <li><strong>Account data:</strong> retained until you delete your account</li>
            <li><strong>Revision data:</strong> retained until you delete your account or manually delete specific entries</li>
            <li><strong>AI conversation history:</strong> not retained by us — AI messages are stateless API calls; Mistral AI and Google retain call data per their own policies (typically 30 days for abuse monitoring)</li>
            <li><strong>Browser local storage:</strong> retained in your browser until you clear it or uninstall the PWA</li>
            <li><strong>Netlify server logs:</strong> retained per Netlify's standard policy (30 days)</li>
          </ul>
          <p style={P_STYLE}>When you delete your account (Settings → Account → Delete Account), all Firestore documents associated with your UID are permanently deleted. This action is irreversible.</p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>6. Your Rights Under UK GDPR</h2>
          <p style={P_STYLE}>You have the following rights regarding your personal data:</p>
          <ul style={UL_STYLE}>
            <li><strong>Right of access (Article 15):</strong> You can request a copy of all personal data we hold about you</li>
            <li><strong>Right to rectification (Article 16):</strong> You can correct inaccurate data via your Settings page at any time</li>
            <li><strong>Right to erasure (Article 17):</strong> You can delete your entire account and all associated data via Settings → Delete Account</li>
            <li><strong>Right to restrict processing (Article 18):</strong> You can request that we stop processing your data in certain circumstances</li>
            <li><strong>Right to data portability (Article 20):</strong> You can request an export of your data in a machine-readable format</li>
            <li><strong>Right to object (Article 21):</strong> You can object to processing based on legitimate interests</li>
            <li><strong>Right to withdraw consent:</strong> Where processing is based on consent (e.g. leaderboard visibility), you can withdraw it at any time in Settings</li>
          </ul>
          <p style={P_STYLE}>
            To exercise any of these rights, contact us at <a href="mailto:femiaisida1@gmail.com" style={{ color:'var(--accent-light)' }}>femiaisida1@gmail.com</a>. We will respond within <strong>30 days</strong>. You also have the right to lodge a complaint with the <strong>Information Commissioner's Office (ICO)</strong> at <a href="https://ico.org.uk" target="_blank" rel="noreferrer" style={{ color:'var(--accent-light)' }}>ico.org.uk</a> or by phone on 0303 123 1113.
          </p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>7. Security</h2>
          <ul style={UL_STYLE}>
            <li>All data is transmitted over HTTPS (TLS 1.2+)</li>
            <li>Firebase Firestore security rules restrict each user to their own data only — no user can read another user's revision data</li>
            <li>Passwords are hashed using Firebase Authentication's bcrypt-based system — we never store or transmit plain-text passwords</li>
            <li>API keys for AI services are stored as environment variables on Netlify servers and are never exposed in the client-side bundle to end users</li>
            <li>Firebase Authentication uses industry-standard OAuth 2.0 for Google sign-in</li>
          </ul>
          <p style={P_STYLE}>Despite these measures, no internet transmission is 100% secure. In the event of a data breach that is likely to result in a risk to your rights and freedoms, we will notify you and the ICO within 72 hours as required by UK GDPR Article 33.</p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>8. Cookies and Local Storage</h2>
          <p style={P_STYLE}>RevisionFlow does <strong>not</strong> use advertising cookies, tracking cookies, or third-party analytics cookies.</p>
          <p style={P_STYLE}>We use the following technologies:</p>
          <ul style={UL_STYLE}>
            <li><strong>Firebase Authentication session cookie:</strong> A secure, HTTP-only session token to keep you logged in. This is strictly necessary for the app to function and does not require consent under PECR.</li>
            <li><strong>localStorage:</strong> Used to store your UI preferences (dark/light mode, dismissed banners, tour completion status). This data stays on your device and is never transmitted to our servers.</li>
            <li><strong>Service worker cache:</strong> Used to cache static assets for offline use. Contains no personal data.</li>
          </ul>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>9. Children and Age Requirements</h2>
          <p style={P_STYLE}>RevisionFlow is designed for GCSE and A-Level students. Under UK GDPR and the Children and Families Act, special rules apply to users under 13. <strong>Users under 13 must not create an account without verifiable parental consent.</strong></p>
          <p style={P_STYLE}>We recommend the service for users aged <strong>13 and over</strong>. If we become aware that a child under 13 has registered without parental consent, we will delete their account and associated data promptly.</p>
          <p style={P_STYLE}>Parents or guardians who believe their child has registered may contact us at <a href="mailto:femiaisida1@gmail.com" style={{ color:'var(--accent-light)' }}>femiaisida1@gmail.com</a> to request deletion.</p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>10. Public Profile and Leaderboard</h2>
          <p style={P_STYLE}>If you set a username (in Settings), your public profile at <code>/u/username</code> is visible to <strong>anyone with the link — including people who are not logged in</strong>. It shows your display name, level, XP, streak, badge count, and subject list. <strong>No email address, revision scores, or grade data are ever shown publicly.</strong> If you have not set a username, your profile is accessible at <code>/u/uid</code> (your Firebase UID, which is non-guessable).</p>
          <p style={P_STYLE}>To make your profile private, go to Settings → Privacy and disable "Public profile". This prevents your profile from loading for anyone other than you.</p>
          <p style={P_STYLE}>The global leaderboard shows your display name, XP, level and streak to other logged-in users. You can:</p>
          <ul style={UL_STYLE}>
            <li>Hide your real name and appear as "Anonymous" (Leaderboard → Hide my name)</li>
            <li>Remove yourself from the global leaderboard entirely (Leaderboard → Hide me from global)</li>
          </ul>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>11. AI Data Processing</h2>
          <p style={P_STYLE}>When you use AI features (Chat, Grade Predictor, Mark Answer, Flashcards, Study Plan), your message and a summary of your relevant revision data is sent to Mistral AI's API. This is processed on their servers to generate a response.</p>
          <p style={P_STYLE}><strong>Important:</strong> Mistral AI's API terms state that API data is <em>not</em> used to train their models by default. However, Mistral may retain request logs for up to 30 days for abuse detection. We recommend not entering sensitive personal information beyond what is needed for revision advice.</p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>12. Changes to This Policy</h2>
          <p style={P_STYLE}>We may update this Privacy Policy from time to time. When we make significant changes, we will display a notice within the app and update the "Last updated" date above. Continued use of RevisionFlow after changes are posted constitutes your acceptance of the updated policy.</p>
          <p style={P_STYLE}><strong>July 2026 update:</strong> Added sections covering flashcard sets and quiz history data; clarified that public profiles are viewable without login; added referral code to social data list; updated data collection to reflect quiz result storage.</p>
          <p style={P_STYLE}>For minor changes (e.g. clarifications), we will simply update the date. For material changes (e.g. new data uses or third parties), we will seek renewed consent where required by UK GDPR.</p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>13. Contact and Complaints</h2>
          <p style={P_STYLE}>For any privacy-related questions, requests or complaints:</p>
          <p style={P_STYLE}>
            <strong>Email:</strong> <a href="mailto:femiaisida1@gmail.com" style={{ color:'var(--accent-light)' }}>femiaisida1@gmail.com</a><br/>
            <strong>Response time:</strong> Within 30 days of receipt
          </p>
          <p style={P_STYLE}>If you are not satisfied with our response, you have the right to complain to the <strong>Information Commissioner's Office (ICO)</strong>:</p>
          <ul style={UL_STYLE}>
            <li>Website: <a href="https://ico.org.uk/make-a-complaint" target="_blank" rel="noreferrer" style={{ color:'var(--accent-light)' }}>ico.org.uk/make-a-complaint</a></li>
            <li>Phone: 0303 123 1113</li>
            <li>Address: Information Commissioner's Office, Wycliffe House, Water Lane, Wilmslow, SK9 5AF</li>
          </ul>
        </section>

        {/* Footer */}
        <div style={{ borderTop:'1px solid var(--border)', paddingTop:24, marginTop:32, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <Link to="/" className="btn btn-secondary btn-sm"><ArrowLeft size={14}/> Back to home</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Start revising free →</Link>
        </div>
      </div>
    </div>
  )
}
