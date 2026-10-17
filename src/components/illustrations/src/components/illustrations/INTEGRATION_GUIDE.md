# Using the illustrations to their full potential

Guide for the main chat, from the illustration chat. Covers `src/components/illustrations/` — **57 subject pictures · 28 scenes · 30 badges**.

The library is finished and in the repo, but most screens that should show it still draw a lucide icon or an emoji. What is left is **wiring, not drawing**. All 81 swaps are written out with exact code in [`SWAP_CATALOGUE.md`](./SWAP_CATALOGUE.md), and `tools/illustration-swaps/apply_swaps.py` applies them for you. Do the badges first.

Everything below was checked against the snapshot of the repo the illustration chat was given. **Your current code is authoritative** — the script and the catalogue both tell you when a spot has changed.

**Where the files live in the repo**

| File | Purpose |
|---|---|
| `src/components/illustrations/INTEGRATION_GUIDE.md` | this guide |
| `src/components/illustrations/SWAP_CATALOGUE.md` | exact before / after code for every swap |
| `tools/illustration-swaps/apply_swaps.py` + `swaps.json` | replays the swaps on your checkout (Python 3, standard library only) |
| `tools/illustration-swaps/find_emoji.mjs` | lists the emoji still used as pictures (Node, already required by the app) |

---

## 0. What to do, in order

1. **Check the library is in the repo.** `src/components/illustrations/` must contain `index.js`, `lazy.jsx`, `SubjectTile.jsx`, `props.jsx` and `scenes/states.jsx` (the newest files), and `pages/Mistakes.jsx` / `pages/ExamDates.jsx` must be the versions that import `EmptyState` and `SubjectTile`. The components import their own stylesheet — add nothing to `globals.css`. **Then delete the 22 superseded per-subject files** (`PhysicsIllustration.jsx` and the rest, listed in §13). Nothing imports them any more (`data/illustrationThemes.js` was the only importer and is now a re-export shim), so leaving them is harmless, but they are dead code that will confuse the next chat.
2. **Dry run.** `python3 tools/illustration-swaps/apply_swaps.py --repo .` changes nothing; it reports which swaps still match your current files. (The 81 swaps are written as 88 find-and-replace edits, because some swaps also add an import or remove an unused icon; the report counts edits.)
3. **Apply, owner by owner.** `--write --files pages/Dashboard.jsx,pages/Profile.jsx` (see §9 for who owns what). P0 first.
4. **Mount the ErrorBoundary** (`main.jsx`, a one-line change for the Global chat — §1, point 5).
5. **Verify** with the checklist in §8: build, light and dark, 320 / 375 / 768 / 1280, leftover greps.
6. **Report** in the Project's format, including every swap you could not apply and why.

Priorities used throughout:

| | What | Why first |
|---|---|---|
| **P0** | Badges: Dashboard, Profile, PublicProfile, audit toast (7 swaps, 4 files) | The 30 new badge emblems are shown **nowhere** except the unlock toast |
| **P1** | App-shell pop-ups, 404, error screen (15 swaps) | Emoji and a dead error screen on the most visible moments |
| **P2** | Empty states and subject tiles (51 swaps) | Where most "plain icon + sentence" screens live |
| **P3** | Polish (8 swaps) | Small wins |

---

## 1. Why the art is not used everywhere yet

Five reasons, in order of how much they explain.

1. **Scope and ownership.** The illustration chat was told to build the artwork system, not to restyle pages, and the Project rules say a chat must not edit files another workstream owns. So the library was delivered and wired only where nobody else owns the file: `Mistakes.jsx`, `ExamDates.jsx`, `BadgeContext.jsx` (unlock toast and celebration), plus an automatic upgrade of every existing `componentForSubject()` call (Dashboard "next session" picture, Topics, TopicDetail, Study, Landing). Every other page was left for its owner — and the hand-off list for them did not exist until this guide.
2. **Badges are drawn by three private icon maps.** `Dashboard.jsx`, `Profile.jsx` and `PublicProfile.jsx` each carry their own copy of the same 29-icon lucide `BADGE_ICONS` map and render `badge.lucideIcon` (or the emoji `badge.icon`) from `data/badges.js`. Nothing in those pages knows `BadgeArt` exists. That is why the new badge art is only visible in the unlock toast.
3. **Four places had no art.** Friends, Leaderboard, the 404 page and the error screen. Added since: scenes `friends`, `leaderboard`, `notFound`, `error`.
4. **Two traps would have made a naive import expensive.** App.jsx imports `XPToast`, `StreakCelebration`, `ReferralRewardPopup`, `LevelUpPopup` and `OnboardingRecapPopup` statically, so importing artwork into them puts it in every visitor's first download. Added since: `lazy.jsx` (§2). The artwork code was also trimmed: a page that only shows empty states now downloads about 14 kB gzip instead of about 28 kB.
5. **`ErrorBoundary.jsx` is dead code.** Nothing imports it, so a render error shows a blank page. The swaps rebuild it with the `error` scene and mount it in `main.jsx` (a shared file: Global chat).

Small gaps were also closed: a **subject tile** (a subject's own picture on a small rounded square) so subject lists can show each subject's picture instead of a colour dot or a shared icon.

---

## 2. Pick the right component

| You are drawing… | Use | Size |
|---|---|---|
| A subject's identity next to its name (list row, settings row, picker, chip) | `<SubjectTile subject={name} size={32} />` | 28 – 48 (never < 28, never > 72) |
| A subject hero (topic header, subject card, a "next session" card) | `<SubjectIllustration subject={name} size={160} />` | 72 and up |
| A feature, state or celebration scene | `<Illustration name="achievement" width={240} />` | width 160 – 320 |
| "Nothing here yet" | `<EmptyState art="emptyPapers" title body action size />` | `md` (≤ 240 px art), `sm` (≤ 160), `inline` |
| A badge, earned or locked | `<BadgeArt id={badge.id} size={56} earned={unlocked} />` | 28 toast · 40 dashboard row · 56 profile tile · 88 celebration · 120+ hero |
| Anything mounted by the **app shell** (`App.jsx` / `main.jsx` and what they import: pop-ups, toasts, ErrorBoundary) | `LazyIllustration` / `LazyBadgeArt` from `components/illustrations/lazy` | same props |

Props worth knowing:

- **`SubjectIllustration` / `SubjectTile`** take the subject **name exactly as the app stores it**. Resolution is by keyword, so `"Maths"` and `"Further Maths"` get different pictures, `"A-Level Biology"` and `"GCSE Biology"` get the same one (qualification never changes the art — do not build art keys from level), and an unknown name gets the generic picture. `label` is only needed when no subject name is printed next to it. The tile is a neutral mint square by default and **every swap uses that default**. `tint` (optional) mixes a colour into the tile, for example `SUBJECT_COLOURS[name]`; several of those colours are purple (Chemistry, Music, Photography, Design & Technology), so leave `tint` out unless the design owner asks for coloured tiles.
- **`Illustration`**: `name`, `width` (height follows 4:3), `backdrop` (the soft ground behind it, on by default), `label`. Detail is chosen from the size automatically.
- **`BadgeArt`**: `id` (a real badge id from `data/badges.js`; an id with no emblem still renders a neutral medal), `earned={false}` for locked, `frame="none"` for emblem-only chips, `label`.
- **`EmptyState`**: builds on the app's existing `.empty-state` class, so it drops into the block it replaces. `art={null}` gives copy only. `action` takes any element.
- **Route pages** (everything `App.jsx` loads with `lazy()`) import the components directly (`../components/illustrations/EmptyState`). **Never import the barrel (`components/illustrations`) from the app shell.**

Download cost (production build, gzip; each loads only on pages that use it):

| Page shows… | Adds |
|---|---|
| Empty states / any scene | ≈ 14 kB |
| Badges | ≈ 10 kB |
| Subject pictures or tiles (all 57) | ≈ 31 kB |
| Pop-ups via `lazy.jsx` | nothing until the pop-up appears |

A page that shows all three kinds (the Dashboard, after the swaps) downloads about 43 kB gzip of artwork in total, because they share one 6 kB chunk. With all 81 swaps applied the **first-download bundle grows by 0.6 kB** (344.17 → 344.79 kB gzip), which is the two lazy wrappers plus the mounted ErrorBoundary.

---

## 3. Rules that keep it premium rather than decorated

1. **Words first.** The title and the action carry the meaning; the picture never does. Art is decorative by default (`aria-hidden`); pass `label` only when the picture says something the nearby text does not.
2. **One hero picture per screen region.** Do not stack two scenes, and do not repeat a scene down a list — lists get `SubjectTile` or a small badge, not a scene per row.
3. **Positive empty states.** "Nothing here yet" means "ready for you", never "something broke". Pattern: *Title* (what this will show) · *one sentence* (what happens when you add one) · *one action*.
   - "No papers logged yet" / "Log a past paper to see your grade and where marks were lost." / **Log a paper**
   - "No saved sets yet" / "Generate or create flashcards first."
4. **Errors stay calm.** The `error` scene always comes with an obvious way back (a button), never just a stack of text.
5. **Locked badges.** `earned={false}` already drains the colour and fades the badge. **Do not also dim the parent** (`opacity`, `filter`) — it double-dims to near invisible. Put badges in a `.rfi-holder` span when they sit inside inline or flex rows.
6. **Do not use `title=` as the only description.** It does not exist on touch. Show badge name and "how to earn it" as text somewhere on the screen.
7. **Icon versus illustration.** lucide icons remain right for controls, nav, small status marks (under about 24 px) and table cells. Pictures are for identity and feeling. Do not use a lucide icon at 48 px as a stand-in for a picture, and do not use a picture where an icon will do.
8. **Do not recolour.** The art uses its own `--rfi-*` tokens (green-led, light and dark). Do not tint it with CSS filters, `opacity` on the parent, or accent variables — users can unlock accent themes, and the artwork must not follow them.
9. **Keep it still.** No animation on the art.
10. **Do not decorate dense screens.** No scenes inside data tables, heatmaps, forms, the timer, navigation or buttons.

"Full potential" means every place that currently fakes a picture with an emoji or an icon, every empty state, every celebration, every list of subjects and every badge. It does not mean putting art on every screen.

---

## 4. Where everything goes

### 4.1 Already in place (no work needed)

- Subject pictures wherever `componentForSubject()` was already called (Dashboard "next session", Topics, TopicDetail, Study, Landing hero through the `CellIllustration` shim).
- `Mistakes.jsx` and `ExamDates.jsx`: empty states, and the subject tile in front of each subject name (instead of a 7 px colour dot on mistakes, nothing on exam rows).
- `BadgeContext.jsx`: unlock toast and celebration use `BadgeArt` (lazy).

### 4.2 Covered by the 81 swaps

| Where | What goes in | Component |
|---|---|---|
| Dashboard | badge row (real art; first badge shown locked when none earned) · subject rows get a tile · four empty cards | `BadgeArt` 40/48 · `SubjectTile` 32 · `EmptyState sm` |
| Profile | badge browser (locked ones drained) · streak-milestone modal shows the real streak badge instead of emoji · subject rows | `BadgeArt` 56 · `SubjectTile` |
| Public profile | badge chips · subject chips | `BadgeArt` 44 · `SubjectTile` |
| Badge audit toast | badge as the toast icon | `BadgeArt` 28 |
| Pop-ups | level-up (`achievement`) · onboarding recap (`success`) · referral reward (Recruiter badge / `welcome`) · streak (`streak`, replaces the wobbling emoji) | `LazyIllustration` / `LazyBadgeArt` |
| 404 and errors | `notFound` · `error`, with the ErrorBoundary actually mounted | `LazyIllustration` |
| Pro activated | `achievement` | `Illustration` |
| Onboarding | step 1 `welcome` · friends step `friends` · done step `success` · subject chips get a tile | `Illustration` · `SubjectTile` |
| Friends · Leaderboard | `friends` / `leaderboard` empty states (title by period) | `EmptyState` |
| AI Advisor | chat (`assistant`), plan (`emptyPlan`), resources (`resources`) empty states | `EmptyState` / `Illustration` |
| Topics · TopicDetail | no subjects · no match · no notes · no papers · guide failed · topic not found; the "no topics yet" subject picture at readable size | `EmptyState` |
| Analytics · PastPapers | five and two empty states | `EmptyState` |
| Calendar | nothing today / upcoming / recommended; subject tiles on exam rows, upcoming rows, recommendations, session cards | `EmptyState` · `SubjectTile` |
| Study | six empty or intro states; subject tiles on flashcard-set cards | `EmptyState` · `SubjectTile` |
| Landing hero · Settings | hero preview uses `SubjectIllustration`; "Your subjects" rows get a tile | |

### 4.3 Scenes with no home in the app yet (owner's call)

Nine scenes have no placement in the swaps because they are feature artwork, not state artwork. Use them where a screen introduces a feature, not as filler.

| Scene | Where it fits | Whose decision |
|---|---|---|
| `calendar` · `pastPapers` · `analytics` · `revision` · `assistant` · `mastery` · `focus` · `mistakes` · `exam` · `dashboard` | **Landing** feature cards. `FEATURES_MAJOR` (Smart Calendar → `calendar`, Past Paper Tracker → `pastPapers`, Topic Confidence → `mastery`, Flashcards → `revision`, AI Revision Advisor → `assistant`, Progress Analytics → `analytics`) and `FEATURES_LIST` (Study Timer → `focus`, Tasks & Deadlines → `exam`, Social → `friends`). Gamification: a row of six real `BadgeArt` instead of a scene. | Landing chat. Only if the section's layout can take 4:3 pictures; do not squeeze them into icon-sized slots. |
| `dashboard` · `calendar` · `analytics` · `study` · `revision` | **TooltipTour** steps (currently emoji headings: calendar, confidence, flashcards, …): one scene per step at width 160–200. | Onboarding / Dashboard chat |
| `mastery` | A "topic mastered" celebration (TopicDetail when confidence reaches the top; Study when a set is cleared). Needs a product trigger. | Study chat |
| `exam` | An exam-week card (Dashboard) or the ExamDates header. | Dashboard chat |

### 4.4 Candidates for subject tiles that were not swapped

Not in the 81 swaps; check each file, then use `SubjectTile` wherever a subject name is shown with a colour dot or a generic icon: `components/PriorityList.jsx`, `PastPapers.jsx` rows, Analytics per-subject rows, AI Advisor subject pickers, Timer subject select. Keep the colour dot below 28 px.

### 4.5 Deliberately not illustration material

lucide UI icons, navigation, buttons, charts and tables, the Timer's ambient scenes (a functional feature), the Google logos on Login/Signup, and the user-selectable emoji **profile avatars** (`ThemeSelector.jsx` and `data/themes.js` read `badge.icon` on purpose — which is why `data/badges.js` must keep its `icon` field).

---

## 5. Scene picker (all 28)

Every scene is an object-only still life (no people, no robots). Sizes: width 160 – 320.

| Scene | Shows | Use it for | In the swaps |
|---|---|---|---|
| `dashboard` | laptop with a small chart, books, mug, plant | feature intro | — |
| `study` | open textbook with tabs, highlighters, a note | study hub; empty recent activity | Dashboard |
| `calendar` | wall calendar, colour-coded days | feature intro | — |
| `pastPapers` | stack of marked papers with a tick | feature intro | — |
| `mistakes` | worksheet, highlighted line, "fixed" tick | feature intro | — |
| `analytics` | bars, trend line, donut | feature intro | — |
| `exam` | clock, paper, calculator, pencil pot | exam week, deadlines | — |
| `focus` | headphones around an open book, timer ring | focus mode intro | — |
| `revision` | fan of flashcards with a note | revision / flashcards intro | — |
| `resources` | bookshelf with folders | resources, library | AI Advisor |
| `assistant` | open book with two speech bubbles (no robot) | AI Advisor, AI Tutor | AI Advisor |
| `welcome` | closed green notebook, pencil, plant | first use, onboarding step 1, "add your subjects" | Onboarding, Topics |
| `success` | ticked clipboard with a big tick | something finished | Onboarding, recap pop-up |
| `streak` | seven sprigs, each a little taller | streak celebration | Streak pop-up |
| `achievement` | laurel medallion on ribbons | level-up, Pro activated | Level-up, Pro |
| `mastery` | tall plant on books, small medallion | topic or subject mastered | — |
| `friends` | two notebooks side by side, mugs, speech bubbles | no friends yet; onboarding friends | Friends, Leaderboard, Onboarding |
| `leaderboard` | podium of three book stacks | empty leaderboard | Leaderboard |
| `notFound` | dashed page outline with a magnifier | 404; "no results" | NotFound, Topics, TopicDetail |
| `error` | laptop with an amber reload arrow | error boundary; "could not load" | ErrorBoundary, TopicDetail |
| `emptySessions` | blank calendar, one dashed cell | no sessions | Dashboard, Analytics, Calendar |
| `emptyMistakes` | clean worksheet, dashed box, pencil | no mistakes logged | Mistakes, Study |
| `emptyPapers` | tidy tray of blank papers | no papers | PastPapers, Analytics, Study, TopicDetail |
| `emptyAnalytics` | empty graph with a dashed trend | no data yet | Dashboard, Analytics, Calendar, PastPapers |
| `emptyNotes` | blank notepad and pencil | no notes | Topics, TopicDetail |
| `emptyFlashcards` | blank index cards, sticky note | no flashcard sets | Study |
| `emptyExams` | planner with one date, clock | no exams | ExamDates, Calendar |
| `emptyPlan` | week board with blank sticky notes | no plan generated | AI Advisor |

---

## 6. Badges, specifically

- All **30** badge ids in `data/badges.js` have their own emblem, grouped into tones: milestone, streak (sprout to tree), mastery (bronze / silver / gold rims), improvement, consistency, social, special, legendary.
- **Use `BadgeArt id={badge.id}` anywhere a badge is shown.** Stop rendering `badge.icon` (emoji) and `badge.lucideIcon` in UI. They remain in the data for the profile-avatar picker only.
- The seven P0 swaps do this for Dashboard, Profile, PublicProfile and the audit toast, and delete the three duplicate `BADGE_ICONS` maps.
- Also worth doing (not in the swaps, owner's call): a row of six real badges in Landing's Gamification feature; the Recruiter badge in the referral card; a badge strip on leaderboard rows if the layout has room (size 28, `frame="none"` if tight).
- **Adding a badge:** add it to `data/badges.js` and ask the illustration chat for the emblem (`registry/badges.js`). Until then it shows the neutral fallback medal, so nothing breaks.
- Locked state, sizes and the double-dim trap: §2 and §3 rule 5.

---

## 7. Subjects, specifically

- 57 pictures. Shared pictures exist only for true aliases (for example "English Lang & Lit"). Different subjects always differ: Maths is not Further Maths.
- **`SubjectTile`** goes in front of a subject name in any list. **`SubjectIllustration`** is for heroes. The two share the same resolver, so a subject always looks like itself.
- Languages use one drawn letter of their script on the picture (authentic glyph shapes), not words.
- The Dashboard "next session" picture is hidden at 480 px and below (`.growth-illustration` in `globals.css`) and faded at 1024 px and below. That is a Dashboard / Design System decision. Two ways to keep the subject identity on phones:
  - **Keep the picture** (checked on a copy of the repo at 320 and 390 px, light and dark). It goes in `src/styles/globals.css` after the existing `max-width: 480px` block, which is the Global / Design System chat's file, so hand this to them rather than pasting it yourself:
    ```css
    @media (max-width: 480px) {
      .growth-illustration { display: block !important; width: 84px; right: 10px; bottom: 10px; opacity: 1; }
      .next-session-subject, .next-session-topic { max-width: calc(100% - 92px) !important; }
    }
    ```
  - **Or** show a `SubjectTile` in that card's header and leave the CSS alone.

---

## 8. Verify

**Build and lint.** `npm run build` must pass. The dry run introduced 0 new lint problems and cleared 4 old ones.

**Leftover finders** (from the repo root):

```bash
# badge icon maps and fields still rendered in UI (only data/badges.js, ThemeSelector and data/themes.js should remain)
grep -rn "BADGE_ICONS\|lucideIcon\|badge\.icon\|b\.icon" src --include=*.jsx --include=*.js

# hand-built empty states still to convert
grep -rn 'className="empty-state"' src/pages src/components

# emoji used as pictures (see Appendix A for the ones that stay). Plain symbols such as ✓ ★ → are not reported.
node tools/illustration-swaps/find_emoji.mjs --counts      # per-file counts
node tools/illustration-swaps/find_emoji.mjs               # every line

# the barrel must not be imported by the app shell
grep -n "components/illustrations'" src/App.jsx src/main.jsx src/components/XPToast.jsx \
  src/components/StreakCelebration.jsx src/components/LevelUpPopup.jsx \
  src/components/ReferralRewardPopup.jsx src/components/OnboardingRecapPopup.jsx src/components/ErrorBoundary.jsx

# legacy shims: once nothing imports them, delete CellIllustration.jsx and data/illustrationThemes.js
grep -rn "CellIllustration\|illustrationThemes" src --include=*.jsx --include=*.js
```

**Look at it.** Each changed page in light and dark mode at 320, 375, 768 and 1280 px:

- no horizontal scroll, nothing wider than its card, art never overlaps text;
- locked badges look drained, not invisible;
- the picture is not the only thing on an empty state (title, sentence and a button are there);
- art is `aria-hidden` unless you passed `label`;
- the 404 and error screens show a way back.

**Bundle.** The first-download bundle should stay within about 1 kB of before. If it grows by more, something in the shell imports the barrel.

---

## 9. Who applies what

Ownership follows the Project's map. Files the map does not list have no declared owner; the main chat can take them. Run the script with `--files` so each chat only touches its own files (`--list` shows the same table).

| File | Owner | Swaps |
|---|---|---|
| `pages/Dashboard.jsx` | Dashboard / Navigation | 7 |
| `pages/Profile.jsx` · `pages/PastPapers.jsx` · `pages/Analytics.jsx` | Analytics / Progress | 5 · 2 · 5 |
| `pages/Study.jsx` | Study | 8 |
| `pages/Onboarding.jsx` | Onboarding | 6 |
| `pages/Landing.jsx` | Landing | 2 |
| `pages/Pro.jsx` | Pro / Monetisation | 1 |
| `main.jsx` · `components/ErrorBoundary.jsx` | Global / infrastructure (shared files) | 1 · 1 |
| `pages/PublicProfile.jsx` | no declared owner (closest: Analytics / Progress) | 4 |
| `pages/Topics.jsx` · `pages/TopicDetail.jsx` | no declared owner (closest: Study) | 5 · 5 |
| `pages/Calendar.jsx` | no declared owner (closest: Dashboard / Navigation) | 10 |
| `pages/Friends.jsx` · `pages/Leaderboard.jsx` · `pages/AIAdvisor.jsx` · `pages/Settings.jsx` · `pages/NotFound.jsx` | no declared owner | 1 · 1 · 3 · 1 · 2 |
| `components/BadgeAuditButton.jsx` · `LevelUpPopup.jsx` · `OnboardingRecapPopup.jsx` · `ReferralRewardPopup.jsx` · `StreakCelebration.jsx` | no declared owner (app-shell pop-ups) | 1 · 1 · 1 · 3 · 5 |

A shared-file change (`main.jsx`, `ErrorBoundary.jsx`) is small and directly required by this task; say so in the report.

---

## 10. Appendix A — emoji still in the source after the swaps

Counts are lines containing an emoji, as reported by `find_emoji.mjs` (225 in the snapshot, 206 after the swaps). The swaps remove the ones that act as pictures. What is left, and what to do:

| File | Lines | What they are | Suggested action |
|---|---|---|---|
| `data/badges.js` | 40 | the `icon` field on each badge | **Keep.** The profile-avatar picker reads it. UI uses `BadgeArt`. |
| `data/themes.js` · `components/ThemeSelector.jsx` | 13 · 3 | selectable avatars and theme glyphs; lock marks | Keep (user choice). Lock marks: lucide `Lock`. |
| `data/subjects.js` | 14 | subject emoji `icon` fields | Stop rendering them where a tile now shows; keep the data until a grep shows no reader. |
| `pages/Timer.jsx` | 42 | focus-ambient scenes (growing tree and the like) | Keep — a functional feature. A future bespoke piece (plant growth stages) is possible; ask the illustration chat. |
| `pages/Analytics.jsx` | 19 | stat-card headings (trophy, chart, pin, flame, calendar) | Analytics chat: replace with lucide icons — these are labels, not pictures. |
| `pages/Onboarding.jsx` | 12 | feature list and stat headings (book, clock, robot, trophy, flame, globe, chart) | Onboarding chat: lucide icons, or a scene per step. |
| `components/TooltipTour.jsx` | 11 | emoji in tour step titles | Scene thumbnails per step (§4.3) or lucide icons. |
| `utils/streakCard.js` · `utils/notifications.js` · `utils/pdfReport.js` | 6 · 5 · 1 | share-card canvas text, notification text, PDF text | Plain text outputs: either keep, or drop emoji from copy. Not for illustration. |
| Flame emoji (about 20 lines: Analytics, Onboarding, Leaderboard, Friends, Profile, PublicProfile, Admin, Timer, notifications, pdfReport, streakCard, and the `data/` files) | ~20 | streak markers | The illustration system deliberately has no flames (the streak scene is a row of growing plants). A lucide `Sprout` or the streak badge keeps the language consistent. Design decision. |
| `components/ReferralCard.jsx` · `ReferralRewardPopup.jsx` · `DailyQuests.jsx` · `MemoryAidButton.jsx` · `TopicUpdateBanner.jsx` · `Calendar.jsx` · `Signup.jsx` · `Admin*.jsx` · `Help.jsx` · `AIAdvisor.jsx` | 1 – 7 each | inline decoration in text or buttons | lucide icons or plain text. Do not change `Help.jsx`, privacy or AI-disclosure wording. |

Leftover finder: the third command in §8.

## 11. Appendix B — found along the way (not illustration work)

1. **`pages/Study.jsx`, `WriteMode`, line ~314:** the textarea's `onKeyDown` calls `check()`, which does not exist in that component (the one at ~423 belongs to `SpellMode`). Pressing Ctrl+Enter throws a `ReferenceError` in the handler and does nothing. Study chat.
2. **`pages/Study.jsx`, line ~2483, "Recent marks" list:** `style={{ …, color, … }}` uses an undefined variable; the one defined above is spelled `colour`. It runs while rendering each marked history item, so once the list has an item with a mark it throws during render. With no ErrorBoundary mounted that is a blank page. Fix: `color: colour`. Study chat. Re-check on current code before fixing.
3. **`npm ci` fails** on the lockfile in the snapshot (`jspdf`, `jspdf-autotable`, `dompurify` out of sync with `package.json`). `npm install` works. Worth regenerating the lockfile so deploys are reproducible.
4. **`ErrorBoundary` mount** is in the swaps (`main.jsx`, wrapping `<App />`); it is the one change that affects every page, so look at it after applying.

---

## 12. Prompt to paste into the main chat

```text
You are the main chat for RevisionFlow. The illustration chat has finished the artwork library
(src/components/illustrations/ — 57 subject pictures, 28 scenes, 30 badges), but most screens still draw lucide
icons or emoji where that artwork belongs. The most visible gap: the 30 new badge emblems appear only in the
unlock toast, not on the Dashboard, Profile or public profile.

Read these Project docs in full before touching any file:
  claude/illustration-integration-guide.md   what to use where, the rules, the order of work
  claude/illustration-swap-catalogue.md      exact before/after code for all 81 swaps in 24 files
and fetch claude/illustration-apply-swaps.py + claude/illustration-swaps.json + claude/illustration-find-emoji.mjs (the
script that applies them, and the emoji finder), or ask me to upload them as tools/illustration-swaps/apply_swaps.py,
swaps.json and find_emoji.mjs.

Then:
0. Deliver every changed file individually and in full, as the Project rules require. The catalogue and the script are a
   specification for you to apply, not patches to hand back.
1. Inspect the current repo. The guide was tested on a snapshot; the current code is authoritative. Delete the 22 superseded
   per-subject files listed in guide section 13 once the grep there confirms nothing imports them.
2. Run apply_swaps.py WITHOUT --write and read the report. A swap that no longer matches is applied by hand from the
   catalogue — keep any recent edits in that spot.
3. Apply with --write --files … only for files you own. For files another chat owns, give that owner their section of
   the catalogue (guide section 9 has the routing table). Never overwrite another chat's recent work.
4. Order: badges (P0) -> pop-ups, 404, ErrorBoundary (P1) -> empty states and subject tiles (P2) -> polish (P3).
5. After each file: scan the whole file (braces, imports, hooks, undefined variables), run npm run build, and look at
   the page in light and dark mode at 320, 375, 768 and 1280 px.
6. Do not edit anything inside src/components/illustrations/. If a scene, badge or subject picture is missing, tell me.
7. Follow the guide's rules: words first, one picture per screen region, no emoji, lucide icons for controls only,
   lazy wrappers (illustrations/lazy) for anything the app shell imports, and never dim a locked badge's parent.

Final response in the usual format: Files changed / Files deliberately not changed / Potential follow-up, listing every swap
you could not apply and why.
```

---

## 13. Appendix C — superseded files to delete

The first version of the artwork was one hand-drawn file per subject family, all in `src/components/illustrations/`. This library replaces every one of them (57 subject pictures instead of 23). `data/illustrationThemes.js`, their only importer, is now a re-export of the new registry, so these 22 files are unused:

```text
ArtIllustration.jsx                  GeographyIllustration.jsx            PEIllustration.jsx
BusinessIllustration.jsx             HealthIllustration.jsx               PhysicsIllustration.jsx
ChemistryIllustration.jsx            HistoryIllustration.jsx              PsychologyIllustration.jsx
ComputerScienceIllustration.jsx      LanguagesIllustration.jsx            ReligionPhilosophyIllustration.jsx
DesignTechIllustration.jsx           LawPoliticsIllustration.jsx          SeedlingIllustration.jsx
DramaIllustration.jsx                MathsIllustration.jsx
EnglishIllustration.jsx              MediaIllustration.jsx
EnvironmentalScienceIllustration.jsx MusicIllustration.jsx
FoodNutritionIllustration.jsx
```

Check first. This must print nothing:

```bash
grep -rnE "(Art|Business|Chemistry|ComputerScience|DesignTech|Drama|English|EnvironmentalScience|FoodNutrition|Geography|Health|History|Languages|LawPolitics|Maths|Media|Music|PE|Physics|Psychology|ReligionPhilosophy|Seedling)Illustration['\"]" src
```

Then delete:

```bash
cd src/components/illustrations
git rm ArtIllustration.jsx BusinessIllustration.jsx ChemistryIllustration.jsx ComputerScienceIllustration.jsx \
  DesignTechIllustration.jsx DramaIllustration.jsx EnglishIllustration.jsx EnvironmentalScienceIllustration.jsx \
  FoodNutritionIllustration.jsx GeographyIllustration.jsx HealthIllustration.jsx HistoryIllustration.jsx \
  LanguagesIllustration.jsx LawPoliticsIllustration.jsx MathsIllustration.jsx MediaIllustration.jsx \
  MusicIllustration.jsx PEIllustration.jsx PhysicsIllustration.jsx PsychologyIllustration.jsx \
  ReligionPhilosophyIllustration.jsx SeedlingIllustration.jsx
```

Two shims stay for now: `CellIllustration.jsx` (until Landing imports `SubjectIllustration`, swap `landing-hero`) and `data/illustrationThemes.js` (until the last command in §8 finds nothing importing it). Delete each when its importer is gone.
