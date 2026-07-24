// src/data/examDates2026.js
// 2026 GCSE, AS-Level and A-Level exam dates — all major UK boards
// Sources: AQA, Edexcel, OCR, WJEC/Eduqas, CCEA published timetables
// Note: Some dates are confirmed, others estimated from typical timetabling patterns

// TIERED_SUBJECTS/isTiered now live in subjects.js — this used to be its own, separately
// maintained list here (and a third one in paperDatabase.js) which had drifted out of sync with
// each other. Re-exported here so existing imports of `isTiered` from this file keep working.
export { TIERED_SUBJECTS, isTiered } from './subjects'

// ── GCSE 2026 EXAM DATES ──────────────────────────────────────────────────────
const GCSE_2026 = [
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Art & Design (Art, Craft & Design)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Portfolio & Externally Set Assignment",
    "date": "Submit by 31 May 2026"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Art & Design (Fine Art)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Portfolio & Externally Set Assignment",
    "date": "Submit by 31 May 2026"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Art & Design (Graphic Communication)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Portfolio & Externally Set Assignment",
    "date": "Submit by 31 May 2026"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Art & Design (Textile Design)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Portfolio & Externally Set Assignment",
    "date": "Submit by 31 May 2026"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Art & Design (Three-dimensional Design)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Portfolio & Externally Set Assignment",
    "date": "Submit by 31 May 2026"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Art & Design (Photography)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Portfolio & Externally Set Assignment",
    "date": "Submit by 31 May 2026"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Bengali",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening (F/H)",
    "date": "2026-06-03"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Bengali",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Reading (F/H)",
    "date": "2026-06-03"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Bengali",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Writing (F/H)",
    "date": "2026-06-11"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (F/H)",
    "date": "2026-05-12"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (F/H)",
    "date": "2026-06-08"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Operations and HRM",
    "date": "2026-05-11"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Business",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Marketing and Finance",
    "date": "2026-05-21"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (F/H)",
    "date": "2026-05-18"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (F/H)",
    "date": "2026-06-12"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Chinese (Mandarin)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening (F/H)",
    "date": "2026-05-11"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Chinese (Mandarin)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Reading (F/H)",
    "date": "2026-05-11"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Chinese (Mandarin)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Writing (F/H)",
    "date": "2026-05-18"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Citizenship Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2026-05-07"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Citizenship Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2026-05-14"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Combined Science: Trilogy",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 Biology (F/H)",
    "date": "2026-05-12"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Combined Science: Trilogy",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 Biology (F/H)",
    "date": "2026-06-08"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Combined Science: Trilogy",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 Chemistry (F/H)",
    "date": "2026-05-18"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Combined Science: Trilogy",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 Chemistry (F/H)",
    "date": "2026-06-12"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Combined Science: Trilogy",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 Physics (F/H)",
    "date": "2026-06-02"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Combined Science: Trilogy",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 Physics (F/H)",
    "date": "2026-06-15"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Combined Science: Synergy",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Life & Environmental Sciences (F/H)",
    "date": "2026-05-12"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Combined Science: Synergy",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Life & Environmental Sciences (F/H)",
    "date": "2026-06-02"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Combined Science: Synergy",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Physical Sciences (F/H)",
    "date": "2026-06-08"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Combined Science: Synergy",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Physical Sciences (F/H)",
    "date": "2026-06-12"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Computational Thinking & Programming (choice of language)",
    "date": "2026-05-13"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Computing Concepts",
    "date": "2026-05-19"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Dance",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Performance & Choreography (NEA)",
    "date": "Submit by 07 May 2026"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Dance",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Dance Appreciation (Written)",
    "date": "2026-06-12"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Design and Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Written Paper",
    "date": "2026-06-10"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Drama",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Understanding Drama (Written)",
    "date": "2026-05-08"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: How Markets Work",
    "date": "2026-05-08"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: How the Economy Works",
    "date": "2026-05-22"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Engineering",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Written Paper",
    "date": "2026-06-01"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Explorations in Creative Reading & Writing",
    "date": "2026-05-21"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Writers' Viewpoints & Perspectives",
    "date": "2026-06-05"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Shakespeare & 19th Century Novel",
    "date": "2026-05-11"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Modern Texts and Poetry",
    "date": "2026-05-19"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Food Preparation and Nutrition",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2026-06-11"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "French",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening (F/H)",
    "date": "2026-05-20"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "French",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Reading (F/H)",
    "date": "2026-05-20"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "French",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Writing (F/H)",
    "date": "2026-06-04"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Living with the Physical Environment",
    "date": "2026-05-13"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Challenges in the Human Environment",
    "date": "2026-06-03"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Geographical Applications",
    "date": "2026-06-11"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "German",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening (F/H)",
    "date": "2026-05-07"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "German",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Reading (F/H)",
    "date": "2026-05-07"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "German",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Writing (F/H)",
    "date": "2026-05-14"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Understanding the Modern World (2h combined \u2013 options 1A+1B)",
    "date": "2026-05-15"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Shaping the Nation (2h combined \u2013 options 2A+2B)",
    "date": "2026-06-04"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Italian",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening (F/H)",
    "date": "2026-05-22"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Italian",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Reading (F/H)",
    "date": "2026-05-22"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Italian",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Writing (F/H)",
    "date": "2026-06-01"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Non-Calculator (F/H)",
    "date": "2026-05-14"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Calculator (F/H)",
    "date": "2026-06-03"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Calculator (F/H)",
    "date": "2026-06-10"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2026-05-18"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2026-06-02"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Modern Hebrew",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening (F/H)",
    "date": "2026-06-10"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Modern Hebrew",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Writing (F/H)",
    "date": "2026-06-17"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Music",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Understanding Music (Written)",
    "date": "2026-06-05"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Panjabi",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening (F/H)",
    "date": "2026-06-02"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Panjabi",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Writing (F/H)",
    "date": "2026-06-10"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Human Body & Movement",
    "date": "2026-05-22"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Socio-cultural Influences & Wellbeing",
    "date": "2026-06-01"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (F/H)",
    "date": "2026-06-02"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (F/H)",
    "date": "2026-06-15"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Polish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening (F/H)",
    "date": "2026-06-02"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Polish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Writing (F/H)",
    "date": "2026-06-12"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Cognition and Behaviour",
    "date": "2026-05-07"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Social Context and Behaviour",
    "date": "2026-05-14"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Religious Studies A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Study of Religions (2 options)",
    "date": "2026-05-12"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Religious Studies A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2A or 2B: Thematic Studies",
    "date": "2026-05-20"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Religious Studies B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Catholic Christianity",
    "date": "2026-05-12"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Religious Studies B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Perspectives on Faith",
    "date": "2026-05-20"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Families and Education",
    "date": "2026-05-08"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Crime, Deviance & Social Stratification",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening (F/H)",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Reading (F/H)",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Writing (F/H)",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Statistics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Statistics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "TBC"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Arabic",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening (F/H)",
    "date": "2026-05-22"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Arabic",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading (F/H)",
    "date": "2026-05-22"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Arabic",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing (F/H)",
    "date": "2026-06-02"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Astronomy",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Naked-eye Astronomy",
    "date": "2026-06-01"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Astronomy",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Telescopic Astronomy",
    "date": "2026-06-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Biblical Hebrew",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Language",
    "date": "2026-05-07"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Biblical Hebrew",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 2: Literature",
    "date": "2026-05-19"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (F/H)",
    "date": "2026-05-12"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (F/H)",
    "date": "2026-06-08"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Investigating Small Business",
    "date": "2026-05-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Business",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Building a Business",
    "date": "2026-05-21"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (F/H)",
    "date": "2026-05-18"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (F/H)",
    "date": "2026-06-09"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Chinese",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening (F/H)",
    "date": "2026-05-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Chinese",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading (F/H)",
    "date": "2026-05-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Chinese",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing (F/H)",
    "date": "2026-05-18"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Citizenship Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2026-05-07"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Citizenship Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2026-05-14"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Combined Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Biology 1 (F/H)",
    "date": "2026-05-12"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Combined Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Chemistry 1 (F/H)",
    "date": "2026-05-18"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Combined Science",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Physics 1 (F/H)",
    "date": "2026-06-02"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Combined Science",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Biology 2 (F/H)",
    "date": "2026-06-08"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Combined Science",
    "tier": "N/A",
    "paper": 5,
    "paperName": "Paper 5: Chemistry 2 (F/H)",
    "date": "11 Jun 2026"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Combined Science",
    "tier": "N/A",
    "paper": 6,
    "paperName": "Paper 6: Physics 2 (F/H)",
    "date": "15 Jun 2026"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Principles of Computer Science",
    "date": "2026-05-13"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Application of Computational Thinking (On-screen, IDE)",
    "date": "2026-05-19"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Drama",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 3: Theatre Makers in Practice (Written)",
    "date": "2026-05-08"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Design & Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1 (choice of material/system)",
    "date": "2026-06-10"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Fiction & Imaginative Writing",
    "date": "2026-05-21"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Non-Fiction & Transactional Writing",
    "date": "2026-06-05"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "English Language 2.0",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Non-Fiction Texts",
    "date": "2026-05-21"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "English Language 2.0",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Contemporary Texts",
    "date": "2026-06-05"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Shakespeare & Post-1914 Literature",
    "date": "2026-05-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: 19th-Century Novel & Poetry since 1789",
    "date": "2026-05-19"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "French",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Listening (F/H)",
    "date": "2026-05-20"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "French",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading (F/H)",
    "date": "2026-06-04"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "French",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing (F/H)",
    "date": "2026-06-08"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Geography A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: The Physical Environment",
    "date": "2026-05-13"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Geography A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: The Human Environment",
    "date": "2026-06-03"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Geography A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Geographical Investigations: Fieldwork & UK Challenges",
    "date": "2026-06-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Geography B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Global Geographical Issues",
    "date": "2026-05-13"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Geography B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: UK Geographical Issues",
    "date": "2026-06-03"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Geography B",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: People & Environment Issues \u2013 Making Decisions",
    "date": "2026-06-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "German",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Listening (F/H)",
    "date": "2026-05-07"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "German",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading (F/H)",
    "date": "2026-05-14"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "German",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing (F/H)",
    "date": "2026-06-01"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Greek",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening (F/H)",
    "date": "2026-06-10"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Greek",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading (F/H)",
    "date": "2026-06-10"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Gujarati",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening (F/H)",
    "date": "2026-06-01"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Gujarati",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing (F/H)",
    "date": "2026-06-09"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Thematic Study & Historic Environment",
    "date": "2026-05-15"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Period Study & British Depth Study",
    "date": "2026-06-04"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Modern Depth Study",
    "date": "2026-06-09"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Italian",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening (F/H)",
    "date": "2026-05-22"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Italian",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading (F/H)",
    "date": "2026-05-22"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Italian",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing (F/H)",
    "date": "2026-06-01"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Japanese",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening (F/H)",
    "date": "2026-06-01"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Japanese",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading (F/H)",
    "date": "2026-06-01"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Japanese",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing (F/H)",
    "date": "2026-06-09"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Non-Calculator (F/H)",
    "date": "2026-05-14"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Calculator (F/H)",
    "date": "2026-06-03"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Calculator (F/H)",
    "date": "2026-06-10"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Music",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 3: Appraising",
    "date": "2026-06-05"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Fitness & Body Systems",
    "date": "2026-05-22"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 2: Health & Performance",
    "date": "2026-06-01"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Persian",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening (F/H)",
    "date": "2026-06-02"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (F/H)",
    "date": "2026-06-02"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (F/H)",
    "date": "2026-06-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Portuguese",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening (F/H)",
    "date": "2026-06-02"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2026-05-07"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2026-05-14"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Religious Studies A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Area of Study 1 \u2013 Study of Religion",
    "date": "2026-05-12"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Religious Studies A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Area of Study 2 \u2013 Study of Second Religion",
    "date": "2026-05-20"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Religious Studies A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Philosophy & Ethics",
    "date": "2026-06-01"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Religious Studies B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Religion & Ethics",
    "date": "2026-05-12"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Religious Studies B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Religion, Peace & Conflict",
    "date": "2026-05-20"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Religious Studies B",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Religion, Philosophy & Social Justice",
    "date": "2026-06-01"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Russian",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening (F/H)",
    "date": "2026-06-02"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Russian",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing (F/H)",
    "date": "2026-06-10"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Listening (F/H)",
    "date": "2026-06-09"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading (F/H)",
    "date": "11 Jun 2026"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing (F/H)",
    "date": "2026-06-17"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Statistics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (F/H)",
    "date": "2026-06-02"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Turkish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening (F/H)",
    "date": "2026-05-07"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Turkish",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading (F/H)",
    "date": "2026-05-07"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Turkish",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing (F/H)",
    "date": "2026-05-22"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Urdu",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening (F/H)",
    "date": "2026-05-18"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Urdu",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing (F/H)",
    "date": "2026-06-02"
  },

  // ── OCR GCSE 2026 — Source: OCR Final Timetable June 2026 (published August 2025) ──
  { "board": "OCR", "level": "GCSE", "subject": "Biology A", "tier": "Foundation", "paper": 1, "paperName": "Paper 1 (Foundation)", "date": "2026-05-12" },
  { "board": "OCR", "level": "GCSE", "subject": "Biology A", "tier": "Foundation", "paper": 2, "paperName": "Paper 2 (Foundation)", "date": "2026-06-08" },
  { "board": "OCR", "level": "GCSE", "subject": "Biology A", "tier": "Higher", "paper": 3, "paperName": "Paper 3 (Higher)", "date": "2026-05-12" },
  { "board": "OCR", "level": "GCSE", "subject": "Biology A", "tier": "Higher", "paper": 4, "paperName": "Paper 4 (Higher)", "date": "2026-06-08" },
  { "board": "OCR", "level": "GCSE", "subject": "Biology B", "tier": "Foundation", "paper": 1, "paperName": "Breadth in Biology (Foundation)", "date": "2026-05-12" },
  { "board": "OCR", "level": "GCSE", "subject": "Biology B", "tier": "Foundation", "paper": 2, "paperName": "Depth in Biology (Foundation)", "date": "2026-06-08" },
  { "board": "OCR", "level": "GCSE", "subject": "Biology B", "tier": "Higher", "paper": 3, "paperName": "Breadth in Biology (Higher)", "date": "2026-05-12" },
  { "board": "OCR", "level": "GCSE", "subject": "Biology B", "tier": "Higher", "paper": 4, "paperName": "Depth in Biology (Higher)", "date": "2026-06-08" },
  { "board": "OCR", "level": "GCSE", "subject": "Business", "tier": "N/A", "paper": 1, "paperName": "Business 1: Business Activity, Marketing and People", "date": "2026-05-11" },
  { "board": "OCR", "level": "GCSE", "subject": "Business", "tier": "N/A", "paper": 2, "paperName": "Business 2: Operations, Finance and Influences on Business", "date": "2026-05-21" },
  { "board": "OCR", "level": "GCSE", "subject": "Chemistry A", "tier": "Foundation", "paper": 1, "paperName": "Paper 1 (Foundation)", "date": "2026-05-18" },
  { "board": "OCR", "level": "GCSE", "subject": "Chemistry A", "tier": "Foundation", "paper": 2, "paperName": "Paper 2 (Foundation)", "date": "2026-06-12" },
  { "board": "OCR", "level": "GCSE", "subject": "Chemistry A", "tier": "Higher", "paper": 3, "paperName": "Paper 3 (Higher)", "date": "2026-05-18" },
  { "board": "OCR", "level": "GCSE", "subject": "Chemistry A", "tier": "Higher", "paper": 4, "paperName": "Paper 4 (Higher)", "date": "2026-06-12" },
  { "board": "OCR", "level": "GCSE", "subject": "Chemistry B", "tier": "Foundation", "paper": 1, "paperName": "Breadth in Chemistry (Foundation)", "date": "2026-05-18" },
  { "board": "OCR", "level": "GCSE", "subject": "Chemistry B", "tier": "Foundation", "paper": 2, "paperName": "Depth in Chemistry (Foundation)", "date": "2026-06-12" },
  { "board": "OCR", "level": "GCSE", "subject": "Chemistry B", "tier": "Higher", "paper": 3, "paperName": "Breadth in Chemistry (Higher)", "date": "2026-05-18" },
  { "board": "OCR", "level": "GCSE", "subject": "Chemistry B", "tier": "Higher", "paper": 4, "paperName": "Depth in Chemistry (Higher)", "date": "2026-06-12" },
  { "board": "OCR", "level": "GCSE", "subject": "Combined Science A", "tier": "Foundation", "paper": 1, "paperName": "Paper 1 Biology (Foundation)", "date": "2026-05-12" },
  { "board": "OCR", "level": "GCSE", "subject": "Combined Science A", "tier": "Foundation", "paper": 3, "paperName": "Paper 3 Chemistry (Foundation)", "date": "2026-05-18" },
  { "board": "OCR", "level": "GCSE", "subject": "Combined Science A", "tier": "Foundation", "paper": 5, "paperName": "Paper 5 Physics (Foundation)", "date": "2026-06-02" },
  { "board": "OCR", "level": "GCSE", "subject": "Combined Science A", "tier": "Foundation", "paper": 2, "paperName": "Paper 2 Biology (Foundation)", "date": "2026-06-08" },
  { "board": "OCR", "level": "GCSE", "subject": "Combined Science A", "tier": "Foundation", "paper": 4, "paperName": "Paper 4 Chemistry (Foundation)", "date": "2026-06-12" },
  { "board": "OCR", "level": "GCSE", "subject": "Combined Science A", "tier": "Foundation", "paper": 6, "paperName": "Paper 6 Physics (Foundation)", "date": "2026-06-15" },
  { "board": "OCR", "level": "GCSE", "subject": "Combined Science A", "tier": "Higher", "paper": 7, "paperName": "Paper 7 Biology (Higher)", "date": "2026-05-12" },
  { "board": "OCR", "level": "GCSE", "subject": "Combined Science A", "tier": "Higher", "paper": 9, "paperName": "Paper 9 Chemistry (Higher)", "date": "2026-05-18" },
  { "board": "OCR", "level": "GCSE", "subject": "Combined Science A", "tier": "Higher", "paper": 11, "paperName": "Paper 11 Physics (Higher)", "date": "2026-06-02" },
  { "board": "OCR", "level": "GCSE", "subject": "Combined Science A", "tier": "Higher", "paper": 8, "paperName": "Paper 8 Biology (Higher)", "date": "2026-06-08" },
  { "board": "OCR", "level": "GCSE", "subject": "Combined Science A", "tier": "Higher", "paper": 10, "paperName": "Paper 10 Chemistry (Higher)", "date": "2026-06-12" },
  { "board": "OCR", "level": "GCSE", "subject": "Combined Science A", "tier": "Higher", "paper": 12, "paperName": "Paper 12 Physics (Higher)", "date": "2026-06-15" },
  { "board": "OCR", "level": "GCSE", "subject": "Combined Science B", "tier": "Foundation", "paper": 1, "paperName": "Biology (Foundation)", "date": "2026-05-12" },
  { "board": "OCR", "level": "GCSE", "subject": "Combined Science B", "tier": "Foundation", "paper": 2, "paperName": "Chemistry (Foundation)", "date": "2026-05-18" },
  { "board": "OCR", "level": "GCSE", "subject": "Combined Science B", "tier": "Foundation", "paper": 3, "paperName": "Physics (Foundation)", "date": "2026-06-02" },
  { "board": "OCR", "level": "GCSE", "subject": "Combined Science B", "tier": "Foundation", "paper": 4, "paperName": "Combined Science (Foundation)", "date": "2026-06-08" },
  { "board": "OCR", "level": "GCSE", "subject": "Combined Science B", "tier": "Higher", "paper": 5, "paperName": "Biology (Higher)", "date": "2026-05-12" },
  { "board": "OCR", "level": "GCSE", "subject": "Combined Science B", "tier": "Higher", "paper": 6, "paperName": "Chemistry (Higher)", "date": "2026-05-18" },
  { "board": "OCR", "level": "GCSE", "subject": "Combined Science B", "tier": "Higher", "paper": 7, "paperName": "Physics (Higher)", "date": "2026-06-02" },
  { "board": "OCR", "level": "GCSE", "subject": "Combined Science B", "tier": "Higher", "paper": 8, "paperName": "Combined Science (Higher)", "date": "2026-06-08" },
  { "board": "OCR", "level": "GCSE", "subject": "Computer Science", "tier": "N/A", "paper": 1, "paperName": "Computer Systems (J277/01)", "date": "2026-05-13" },
  { "board": "OCR", "level": "GCSE", "subject": "Computer Science", "tier": "N/A", "paper": 2, "paperName": "Computational Thinking, Algorithms and Programming (J277/02)", "date": "2026-05-19" },
  { "board": "OCR", "level": "GCSE", "subject": "Design and Technology", "tier": "N/A", "paper": 1, "paperName": "Principles of Design and Technology", "date": "2026-06-10" },
  { "board": "OCR", "level": "GCSE", "subject": "Drama", "tier": "N/A", "paper": 1, "paperName": "Drama: Performance and Response", "date": "2026-05-08" },
  { "board": "OCR", "level": "GCSE", "subject": "Economics", "tier": "N/A", "paper": 1, "paperName": "Introduction to Economics", "date": "2026-05-08" },
  { "board": "OCR", "level": "GCSE", "subject": "Economics", "tier": "N/A", "paper": 2, "paperName": "National and International Economics", "date": "2026-05-22" },
  { "board": "OCR", "level": "GCSE", "subject": "English Language", "tier": "N/A", "paper": 1, "paperName": "Communicating Information and Ideas (J351/01)", "date": "2026-05-21" },
  { "board": "OCR", "level": "GCSE", "subject": "English Language", "tier": "N/A", "paper": 2, "paperName": "Exploring Effects and Impact (J351/02)", "date": "2026-06-05" },
  { "board": "OCR", "level": "GCSE", "subject": "English Literature", "tier": "N/A", "paper": 1, "paperName": "Exploring Modern and Literary Heritage Texts (J352/01)", "date": "2026-05-11" },
  { "board": "OCR", "level": "GCSE", "subject": "English Literature", "tier": "N/A", "paper": 2, "paperName": "Exploring Poetry and Shakespeare (J352/02)", "date": "2026-05-19" },
  { "board": "OCR", "level": "GCSE", "subject": "Food Preparation and Nutrition", "tier": "N/A", "paper": 1, "paperName": "Food Preparation and Nutrition (J309/01)", "date": "2026-06-11" },
  { "board": "OCR", "level": "GCSE", "subject": "Geography A", "tier": "N/A", "paper": 1, "paperName": "Living in the UK Today (J383/01)", "date": "2026-05-13" },
  { "board": "OCR", "level": "GCSE", "subject": "Geography A", "tier": "N/A", "paper": 2, "paperName": "The World Around Us (J383/02)", "date": "2026-06-03" },
  { "board": "OCR", "level": "GCSE", "subject": "Geography A", "tier": "N/A", "paper": 3, "paperName": "Geographical Skills (J383/03)", "date": "2026-06-11" },
  { "board": "OCR", "level": "GCSE", "subject": "Geography B", "tier": "N/A", "paper": 1, "paperName": "Our Natural World (J384/01)", "date": "2026-05-13" },
  { "board": "OCR", "level": "GCSE", "subject": "Geography B", "tier": "N/A", "paper": 2, "paperName": "People and Society (J384/02)", "date": "2026-06-03" },
  { "board": "OCR", "level": "GCSE", "subject": "Geography B", "tier": "N/A", "paper": 3, "paperName": "Geographical Exploration (J384/03)", "date": "2026-06-11" },
  { "board": "OCR", "level": "GCSE", "subject": "History A", "tier": "N/A", "paper": 1, "paperName": "Period Study with Non-British Depth Study (J410/01-07)", "date": "2026-05-15" },
  { "board": "OCR", "level": "GCSE", "subject": "History A", "tier": "N/A", "paper": 2, "paperName": "Thematic Study (J410/08-10)", "date": "2026-06-04" },
  { "board": "OCR", "level": "GCSE", "subject": "History A", "tier": "N/A", "paper": 3, "paperName": "British Depth Study with Historic Environment (J410/11-13)", "date": "2026-06-09" },
  { "board": "OCR", "level": "GCSE", "subject": "History B (Schools History Project)", "tier": "N/A", "paper": 1, "paperName": "British History — Thematic Study and Depth Study (J411/11-19)", "date": "2026-06-04" },
  { "board": "OCR", "level": "GCSE", "subject": "History B (Schools History Project)", "tier": "N/A", "paper": 2, "paperName": "History Around Us (J411/21)", "date": "2026-05-15" },
  { "board": "OCR", "level": "GCSE", "subject": "History B (Schools History Project)", "tier": "N/A", "paper": 3, "paperName": "World History — Period Study and Depth Study (J411/31-39)", "date": "2026-06-09" },
  { "board": "OCR", "level": "GCSE", "subject": "Mathematics", "tier": "Foundation", "paper": 1, "paperName": "Paper 1 Foundation (Calculator) J560/01", "date": "2026-05-14" },
  { "board": "OCR", "level": "GCSE", "subject": "Mathematics", "tier": "Foundation", "paper": 2, "paperName": "Paper 2 Foundation (Non-Calculator) J560/02", "date": "2026-06-03" },
  { "board": "OCR", "level": "GCSE", "subject": "Mathematics", "tier": "Foundation", "paper": 3, "paperName": "Paper 3 Foundation (Calculator) J560/03", "date": "2026-06-10" },
  { "board": "OCR", "level": "GCSE", "subject": "Mathematics", "tier": "Higher", "paper": 4, "paperName": "Paper 4 Higher (Calculator) J560/04", "date": "2026-05-14" },
  { "board": "OCR", "level": "GCSE", "subject": "Mathematics", "tier": "Higher", "paper": 5, "paperName": "Paper 5 Higher (Non-Calculator) J560/05", "date": "2026-06-03" },
  { "board": "OCR", "level": "GCSE", "subject": "Mathematics", "tier": "Higher", "paper": 6, "paperName": "Paper 6 Higher (Calculator) J560/06", "date": "2026-06-10" },
  { "board": "OCR", "level": "GCSE", "subject": "Media Studies", "tier": "N/A", "paper": 1, "paperName": "Television and Promoting Media (J200/01)", "date": "2026-05-18" },
  { "board": "OCR", "level": "GCSE", "subject": "Media Studies", "tier": "N/A", "paper": 2, "paperName": "Music and News (J200/02)", "date": "2026-06-02" },
  { "board": "OCR", "level": "GCSE", "subject": "Music", "tier": "N/A", "paper": 1, "paperName": "Listening and Appraising (J536/05)", "date": "2026-06-05" },
  { "board": "OCR", "level": "GCSE", "subject": "Physical Education", "tier": "N/A", "paper": 1, "paperName": "Physical Factors Affecting Performance (J587/01)", "date": "2026-05-22" },
  { "board": "OCR", "level": "GCSE", "subject": "Physical Education", "tier": "N/A", "paper": 2, "paperName": "Socio-cultural Issues and Sports Psychology (J587/02)", "date": "2026-06-01" },
  { "board": "OCR", "level": "GCSE", "subject": "Physics A", "tier": "Foundation", "paper": 1, "paperName": "Paper 1 (Foundation) J249/01", "date": "2026-06-02" },
  { "board": "OCR", "level": "GCSE", "subject": "Physics A", "tier": "Foundation", "paper": 2, "paperName": "Paper 2 (Foundation) J249/02", "date": "2026-06-15" },
  { "board": "OCR", "level": "GCSE", "subject": "Physics A", "tier": "Higher", "paper": 3, "paperName": "Paper 3 (Higher) J249/03", "date": "2026-06-02" },
  { "board": "OCR", "level": "GCSE", "subject": "Physics A", "tier": "Higher", "paper": 4, "paperName": "Paper 4 (Higher) J249/04", "date": "2026-06-15" },
  { "board": "OCR", "level": "GCSE", "subject": "Physics B", "tier": "Foundation", "paper": 1, "paperName": "Breadth in Physics (Foundation) J259/01", "date": "2026-06-02" },
  { "board": "OCR", "level": "GCSE", "subject": "Physics B", "tier": "Foundation", "paper": 2, "paperName": "Depth in Physics (Foundation) J259/02", "date": "2026-06-15" },
  { "board": "OCR", "level": "GCSE", "subject": "Physics B", "tier": "Higher", "paper": 3, "paperName": "Breadth in Physics (Higher) J259/03", "date": "2026-06-02" },
  { "board": "OCR", "level": "GCSE", "subject": "Physics B", "tier": "Higher", "paper": 4, "paperName": "Depth in Physics (Higher) J259/04", "date": "2026-06-15" },
  { "board": "OCR", "level": "GCSE", "subject": "Psychology", "tier": "N/A", "paper": 1, "paperName": "Studies and Applications in Psychology 1 (J203/01)", "date": "2026-05-07" },
  { "board": "OCR", "level": "GCSE", "subject": "Psychology", "tier": "N/A", "paper": 2, "paperName": "Studies and Applications in Psychology 2 (J203/02)", "date": "2026-05-14" },
  { "board": "OCR", "level": "GCSE", "subject": "Religious Studies", "tier": "N/A", "paper": 1, "paperName": "Beliefs, Teachings and Practices (J625/01-05)", "date": "2026-05-12" },
  { "board": "OCR", "level": "GCSE", "subject": "Religious Studies", "tier": "N/A", "paper": 2, "paperName": "Religion, Philosophy and Ethics in the Modern World (J625/06-10)", "date": "2026-05-20" },
  { "board": "OCR", "level": "GCSE", "subject": "Sociology", "tier": "N/A", "paper": 1, "paperName": "Sociology Paper 1", "date": "2026-05-08" },
  { "board": "OCR", "level": "GCSE", "subject": "Sociology", "tier": "N/A", "paper": 2, "paperName": "Sociology Paper 2", "date": "2026-05-21" },

  // ── WJEC Eduqas GCSE 2026 — Source: WJEC Final Timetable v4, September 2025 ──
  { "board": "Eduqas", "level": "GCSE", "subject": "Biology", "tier": "N/A", "paper": 1, "paperName": "Component 1", "date": "2026-05-12" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Biology", "tier": "N/A", "paper": 2, "paperName": "Component 2", "date": "2026-06-08" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Business", "tier": "N/A", "paper": 1, "paperName": "Component 1", "date": "2026-05-11" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Business", "tier": "N/A", "paper": 2, "paperName": "Component 2", "date": "2026-05-21" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Chemistry", "tier": "N/A", "paper": 1, "paperName": "Component 1", "date": "2026-05-18" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Chemistry", "tier": "N/A", "paper": 2, "paperName": "Component 2", "date": "2026-06-12" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Computer Science", "tier": "N/A", "paper": 1, "paperName": "Component 1: Written (C500U10-1)", "date": "2026-05-13" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Computer Science", "tier": "N/A", "paper": 2, "paperName": "Component 2: On Screen (C500U20-1)", "date": "2026-05-19" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Design and Technology", "tier": "N/A", "paper": 1, "paperName": "Component 1 (C600U10-1)", "date": "2026-06-10" },
  { "board": "Eduqas", "level": "GCSE", "subject": "English Language", "tier": "N/A", "paper": 1, "paperName": "Component 1: 21st Century Literature Reading and Creative Prose Writing", "date": "2026-05-21" },
  { "board": "Eduqas", "level": "GCSE", "subject": "English Language", "tier": "N/A", "paper": 2, "paperName": "Component 2: 19th and 21st Century Non-Fiction Reading and Transactional Writing", "date": "2026-06-05" },
  { "board": "Eduqas", "level": "GCSE", "subject": "English Literature", "tier": "N/A", "paper": 1, "paperName": "Component 1: Shakespeare and Poetry (C720U10-1)", "date": "2026-05-11" },
  { "board": "Eduqas", "level": "GCSE", "subject": "English Literature", "tier": "N/A", "paper": 2, "paperName": "Component 2: Drama, Prose and Unseen Poetry (C720U20-1)", "date": "2026-05-19" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Film Studies", "tier": "N/A", "paper": 1, "paperName": "Component 1: Varieties of Film and Filmmaking (C670U10-1)", "date": "2026-05-07" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Film Studies", "tier": "N/A", "paper": 2, "paperName": "Component 2: Global Filmmaking Perspectives (C670U20-1)", "date": "2026-05-21" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Food Preparation and Nutrition", "tier": "N/A", "paper": 1, "paperName": "Component 1: Written Examination (C560UA0-1)", "date": "2026-06-11" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Geography A", "tier": "N/A", "paper": 1, "paperName": "Component 1: Changing Places — Changing World (C111U10-1)", "date": "2026-05-12" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Geography A", "tier": "N/A", "paper": 2, "paperName": "Component 2: Sustaining the Planet (C111U20-1)", "date": "2026-06-03" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Geography A", "tier": "N/A", "paper": 3, "paperName": "Component 3: Distinctive Landscapes (C111U30-1)", "date": "2026-06-11" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Geography B", "tier": "N/A", "paper": 1, "paperName": "Component 1: Our Changing World (C112U10-1)", "date": "2026-05-12" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Geography B", "tier": "N/A", "paper": 2, "paperName": "Component 2: Our Dynamic Planet (C112U20-1)", "date": "2026-06-03" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Geography B", "tier": "N/A", "paper": 3, "paperName": "Component 3: Environmental Challenges (C112U30-1)", "date": "2026-06-11" },
  { "board": "Eduqas", "level": "GCSE", "subject": "History", "tier": "N/A", "paper": 1, "paperName": "Component 1: Studies in Depth (C100U10-1)", "date": "2026-05-14" },
  { "board": "Eduqas", "level": "GCSE", "subject": "History", "tier": "N/A", "paper": 2, "paperName": "Component 2: Studies in Breadth (C100U20-1)", "date": "2026-06-03" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Mathematics", "tier": "Foundation", "paper": 1, "paperName": "Component 1 Foundation (C300U10-1)", "date": "2026-05-14" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Mathematics", "tier": "Foundation", "paper": 2, "paperName": "Component 2 Foundation (C300U20-1)", "date": "2026-06-03" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Mathematics", "tier": "Higher", "paper": 1, "paperName": "Component 1 Higher (C300UA0-1)", "date": "2026-05-14" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Mathematics", "tier": "Higher", "paper": 2, "paperName": "Component 2 Higher (C300UB0-1)", "date": "2026-06-03" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Media Studies", "tier": "N/A", "paper": 1, "paperName": "Component 1: Exploring the Media (C680U10-1)", "date": "2026-05-18" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Media Studies", "tier": "N/A", "paper": 2, "paperName": "Component 2: Understanding Media Forms and Products (C680U20-1)", "date": "2026-06-02" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Music", "tier": "N/A", "paper": 1, "paperName": "Component 3: Appraising (C660U30-1)", "date": "2026-06-05" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Physical Education", "tier": "N/A", "paper": 1, "paperName": "Component 1: Physical Factors Affecting Performance (C550U10-1)", "date": "2026-05-22" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Physics", "tier": "N/A", "paper": 1, "paperName": "Component 1", "date": "2026-06-02" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Physics", "tier": "N/A", "paper": 2, "paperName": "Component 2", "date": "2026-06-15" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Religious Studies", "tier": "N/A", "paper": 1, "paperName": "Component 1: Religious, Philosophical and Ethical Studies (C120U10-1)", "date": "2026-05-12" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Religious Studies", "tier": "N/A", "paper": 2, "paperName": "Component 2: Study of Christianity (C120U20-1)", "date": "2026-05-20" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Religious Studies", "tier": "N/A", "paper": 3, "paperName": "Component 3: Study of Second Religion (C120U30-70)", "date": "2026-06-01" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Sociology", "tier": "N/A", "paper": 1, "paperName": "Component 1: Understanding Social Structures (C200U10-1)", "date": "2026-05-08" },
  { "board": "Eduqas", "level": "GCSE", "subject": "Sociology", "tier": "N/A", "paper": 2, "paperName": "Component 2: Understanding Social Processes (C200U20-1)", "date": "2026-05-15" },

  // ── CCEA GCSE 2026 — JCQ aligned dates ──
  { "board": "CCEA", "level": "GCSE", "subject": "Biology", "tier": "N/A", "paper": 1, "paperName": "Unit 1: Cells, Living Processes and Biodiversity", "date": "2026-05-12" },
  { "board": "CCEA", "level": "GCSE", "subject": "Biology", "tier": "N/A", "paper": 2, "paperName": "Unit 2: Body Systems, Ecology and the Environment", "date": "2026-06-05" },
  { "board": "CCEA", "level": "GCSE", "subject": "Chemistry", "tier": "N/A", "paper": 1, "paperName": "Unit 1: Basic Concepts in Chemistry", "date": "2026-05-18" },
  { "board": "CCEA", "level": "GCSE", "subject": "Chemistry", "tier": "N/A", "paper": 2, "paperName": "Unit 2: Further Chemical Reactions, Rates and Equilibrium, Calculations and Organic Chemistry", "date": "2026-06-12" },
  { "board": "CCEA", "level": "GCSE", "subject": "Double Award Science", "tier": "N/A", "paper": 1, "paperName": "Unit 1", "date": "2026-05-12" },
  { "board": "CCEA", "level": "GCSE", "subject": "Double Award Science", "tier": "N/A", "paper": 2, "paperName": "Unit 2", "date": "2026-05-18" },
  { "board": "CCEA", "level": "GCSE", "subject": "Double Award Science", "tier": "N/A", "paper": 3, "paperName": "Unit 3", "date": "2026-06-02" },
  { "board": "CCEA", "level": "GCSE", "subject": "Double Award Science", "tier": "N/A", "paper": 4, "paperName": "Unit 4", "date": "2026-06-12" },
  { "board": "CCEA", "level": "GCSE", "subject": "English Language", "tier": "N/A", "paper": 1, "paperName": "Unit 1: Writing for Purpose and Audience", "date": "2026-05-21" },
  { "board": "CCEA", "level": "GCSE", "subject": "English Literature", "tier": "N/A", "paper": 1, "paperName": "Unit 1: The Study of Prose", "date": "2026-05-11" },
  { "board": "CCEA", "level": "GCSE", "subject": "English Literature", "tier": "N/A", "paper": 2, "paperName": "Unit 2: The Study of Poetry and Drama", "date": "2026-06-05" },
  { "board": "CCEA", "level": "GCSE", "subject": "Geography", "tier": "N/A", "paper": 1, "paperName": "Unit 1: Understanding Our Natural World", "date": "2026-05-13" },
  { "board": "CCEA", "level": "GCSE", "subject": "Geography", "tier": "N/A", "paper": 2, "paperName": "Unit 2: Living in Our World", "date": "2026-06-11" },
  { "board": "CCEA", "level": "GCSE", "subject": "History", "tier": "N/A", "paper": 1, "paperName": "Unit 1: Changes in Germany 1919-45 and The USA 1918-68", "date": "2026-05-15" },
  { "board": "CCEA", "level": "GCSE", "subject": "History", "tier": "N/A", "paper": 2, "paperName": "Unit 2: Northern Ireland and its Neighbours", "date": "2026-06-04" },
  { "board": "CCEA", "level": "GCSE", "subject": "Mathematics", "tier": "Foundation", "paper": 1, "paperName": "Unit T1: Foundation Paper 1 (Non-Calculator)", "date": "2026-05-14" },
  { "board": "CCEA", "level": "GCSE", "subject": "Mathematics", "tier": "Foundation", "paper": 2, "paperName": "Unit T2: Foundation Paper 2 (Calculator)", "date": "2026-06-03" },
  { "board": "CCEA", "level": "GCSE", "subject": "Mathematics", "tier": "Higher", "paper": 3, "paperName": "Unit T3: Higher Paper 1 (Non-Calculator)", "date": "2026-05-14" },
  { "board": "CCEA", "level": "GCSE", "subject": "Mathematics", "tier": "Higher", "paper": 4, "paperName": "Unit T4: Higher Paper 2 (Calculator)", "date": "2026-06-03" },
  { "board": "CCEA", "level": "GCSE", "subject": "Mathematics", "tier": "Higher", "paper": 5, "paperName": "Unit T5: Higher Paper 3 (Calculator)", "date": "2026-06-10" },
  { "board": "CCEA", "level": "GCSE", "subject": "Physics", "tier": "N/A", "paper": 1, "paperName": "Unit 1: Forces, Energy and Electricity", "date": "2026-06-02" },
  { "board": "CCEA", "level": "GCSE", "subject": "Physics", "tier": "N/A", "paper": 2, "paperName": "Unit 2: Waves, Particles and the Universe", "date": "2026-06-15" },
  { "board": "CCEA", "level": "GCSE", "subject": "Religious Studies", "tier": "N/A", "paper": 1, "paperName": "Unit 1: The Christian Church", "date": "2026-05-12" },
  { "board": "CCEA", "level": "GCSE", "subject": "Religious Studies", "tier": "N/A", "paper": 2, "paperName": "Unit 2: Christianity in the Local and Global Community", "date": "2026-05-20" },
  { "board": "CCEA", "level": "GCSE", "subject": "Business Studies", "tier": "N/A", "paper": 1, "paperName": "Unit 1: The Business Environment", "date": "2026-05-11" },
  { "board": "CCEA", "level": "GCSE", "subject": "Business Studies", "tier": "N/A", "paper": 2, "paperName": "Unit 2: Business Growth and Development", "date": "2026-05-21" },
  { "board": "CCEA", "level": "GCSE", "subject": "Computer Science", "tier": "N/A", "paper": 1, "paperName": "Unit 1: Digital Technology", "date": "2026-05-13" },
  { "board": "CCEA", "level": "GCSE", "subject": "Computer Science", "tier": "N/A", "paper": 2, "paperName": "Unit 2: Practical Problem Solving", "date": "2026-05-19" },
  { "board": "CCEA", "level": "GCSE", "subject": "Technology and Design", "tier": "N/A", "paper": 1, "paperName": "Unit 1: Designing and Making", "date": "2026-06-10" },
]

// ──────────────────────────────────────────────────
// Note: A-Level dates estimated from typical May/June timetabling
// Confirmed dates will be published by each board — check their websites
const ALEVEL_2026 = [
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Accounting",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Financial Accounting",
    "date": "2026-05-22"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Accounting",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Accounting for Analysis & Decision",
    "date": "2026-06-01"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Art & Design (Art,Craft & Design)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Externally Set Assignment",
    "date": "Submit by 31 May 2026"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Art & Design (Fine Art)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Externally Set Assignment",
    "date": "Submit by 31 May 2026"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Art & Design (Graphic Communication)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Externally Set Assignment",
    "date": "Submit by 31 May 2026"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Art & Design (Textile Design)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Externally Set Assignment",
    "date": "Submit by 31 May 2026"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Art & Design (3D Design)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Externally Set Assignment",
    "date": "Submit by 31 May 2026"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Art & Design (Photography)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Externally Set Assignment",
    "date": "Submit by 31 May 2026"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Bengali",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Reading and Writing",
    "date": "2026-05-18"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Bengali",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Writing",
    "date": "2026-06-02"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Bengali",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, Reading & Writing",
    "date": "2026-06-08"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Biblical Hebrew",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Translation, Comprehension & Composition",
    "date": "2026-05-18"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Biblical Hebrew",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Prose Literature",
    "date": "2026-06-03"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Biblical Hebrew",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Poetry",
    "date": "2026-06-08"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2026-06-04"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2026-06-12"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3",
    "date": "2026-06-16"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Business 1",
    "date": "2026-05-13"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Business 2",
    "date": "2026-05-19"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Business 3",
    "date": "2026-06-09"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Inorganic & Physical Chemistry",
    "date": "2026-06-02"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Organic & Physical Chemistry",
    "date": "2026-06-09"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3",
    "date": "2026-06-15"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (On-screen, choice of language)",
    "date": "2026-06-10"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2026-06-17"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Dance",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Critical Engagement (Written)",
    "date": "2026-05-19"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Design & Technology: Fashion & Textiles",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2026-05-22"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Design & Technology: Fashion & Textiles",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2026-06-10"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Design & Technology: Product Design",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2026-05-22"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Design & Technology: Product Design",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2026-06-10"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Drama and Theatre",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Written Paper: Drama and Theatre",
    "date": "2026-05-21"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Markets and Market Failure",
    "date": "2026-05-11"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: National and International Economy",
    "date": "2026-05-18"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Economic Principles and Issues",
    "date": "2026-06-04"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Language, the Individual and Society",
    "date": "2026-05-11"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Language Diversity and Change",
    "date": "2026-05-22"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "English Language & Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Telling Stories",
    "date": "2026-05-13"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "English Language & Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Exploring Conflict",
    "date": "2026-06-01"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "English Literature A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Love Through the Ages",
    "date": "2026-05-13"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "English Literature A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Texts in Shared Contexts (option)",
    "date": "2026-06-01"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "English Literature B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Literary Genres (Tragedy/Comedy)",
    "date": "2026-05-13"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "English Literature B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Texts and Genres (option)",
    "date": "2026-06-01"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Environmental Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2026-05-18"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Environmental Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2026-06-05"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening, Reading & Writing",
    "date": "2026-06-08"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Writing",
    "date": "2026-06-17"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Pure Core",
    "date": "2026-05-11"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (optional route)",
    "date": "2026-05-15"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3 (optional route)",
    "date": "2026-05-15"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Physical Geography",
    "date": "2026-05-12"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Human Geography",
    "date": "2026-05-21"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening, Reading & Writing",
    "date": "2026-05-19"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Writing",
    "date": "2026-06-02"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (1A+1B option combination)",
    "date": "2026-05-19"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (2A+2B option combination)",
    "date": "2026-06-02"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2026-05-21"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2026-06-01"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3 (Contract or Human Rights)",
    "date": "2026-06-09"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (Pure)",
    "date": "2026-06-03"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (Pure & Statistics/Mechanics)",
    "date": "2026-06-11"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3 (Pure & Statistics/Mechanics)",
    "date": "2026-06-18"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Modern Hebrew",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Reading & Writing",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Music",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening paper + Composition NEA + Performance NEA",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Panjabi",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Reading & Writing",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Philosophy",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Epistemology & Moral Philosophy",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Philosophy",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Metaphysics & Philosophy of Mind/Religion",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Factors Affecting Participation",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Factors Affecting Optimal Performance",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3 (Practical Skills + Options)",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Polish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Reading & Writing",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: UK Politics & Core Political Ideas",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: UK Government & Political Ideas",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Comparative Politics (option)",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Introductory Topics",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Psychology in Context",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Issues & Options",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Philosophy of Religion",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Religion & Ethics",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Study of Religion/Dialogues (opt)",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Education + Theory & Methods",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Topics in Sociology",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Crime & Deviance + Theory & Methods",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening, Reading & Writing",
    "date": "TBC"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Writing",
    "date": "TBC"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Arabic",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Translation-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Arabic",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Translation-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Arabic",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Listening,-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Core-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Core-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Advanced-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Advanced-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "General-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology A (Salters Nuffield)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Lifestyle,-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology A (Salters Nuffield)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Development,-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology A (Salters Nuffield)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "The-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology A (Salters Nuffield)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Energy,-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology A (Salters Nuffield)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "General-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Marketing-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Managing-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Marketing,-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Business-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Investigating-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Core-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Core-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Advanced-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Advanced-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "General-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Chinese",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Listening,-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Chinese",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Written-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Design & Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Design-00-Component"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Drama & Theatre",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Theatre-00-Component"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Economics A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Markets-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Economics A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "The-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Economics A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Microeconomics-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Economics B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Markets-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Economics B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Competing-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Economics B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "The-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Language:-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Child-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Language-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Child-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Investigating-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Lang & Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Voices-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Lang & Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Varieties-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Lang & Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Voices-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Lang & Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Varieties-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Poetry-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Paper 2: Prose"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Paper 1: Drama"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Paper 2: Prose"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Paper 3: Poetry"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Core-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Core-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Options-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Listening,-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Written-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Physical-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Human-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Physical-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Dynamic-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Dynamic-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Listening,-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Written-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Greek",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Translation-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Greek",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Translation-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Breadth-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Depth-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Themes-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "History of Art",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Visual-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "History of Art",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Paper 2: Periods"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Italian",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Listening,-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Italian",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Written-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Japanese",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Translation-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Japanese",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Translation-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Pure-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Pure-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Statistics-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Pure-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Statistics-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Music",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Component 3: Appraising"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Music Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Listening-00-Component"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Music Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Producing-00-Component"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Scientific-00-Component"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Psychological-00-Component"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Advanced-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Advanced-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "General-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Core-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Core-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "UK-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "UK-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Comparative-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Comparative-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Foundations-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Applications-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Psychological-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Social-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS",
    "date": "Biological-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Philosophy-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Religion-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "New-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Study-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Russian",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Listening,-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Russian",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Written-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Listening,-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Written-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Statistics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Data-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Statistics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Statistical-00-Paper"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Statistics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A-level",
    "date": "Statistics-00-Paper"
  },

  // ── OCR A-Level 2026 — Source: OCR Final Timetable AS/A Level June 2026 (April 2025) ──
  { "board": "OCR", "level": "A-Level", "subject": "Biology A", "tier": "N/A", "paper": 1, "paperName": "Biological Processes (H420/01)", "date": "2026-06-04" },
  { "board": "OCR", "level": "A-Level", "subject": "Biology A", "tier": "N/A", "paper": 2, "paperName": "Biological Diversity (H420/02)", "date": "2026-06-12" },
  { "board": "OCR", "level": "A-Level", "subject": "Biology A", "tier": "N/A", "paper": 3, "paperName": "Unified Biology (H420/03)", "date": "2026-06-16" },
  { "board": "OCR", "level": "A-Level", "subject": "Biology B (Advancing Biology)", "tier": "N/A", "paper": 1, "paperName": "Fundamentals of Biology (H422/01)", "date": "2026-06-04" },
  { "board": "OCR", "level": "A-Level", "subject": "Biology B (Advancing Biology)", "tier": "N/A", "paper": 2, "paperName": "Scientific Literacy in Biology (H422/02)", "date": "2026-06-12" },
  { "board": "OCR", "level": "A-Level", "subject": "Biology B (Advancing Biology)", "tier": "N/A", "paper": 3, "paperName": "Practical Skills in Biology (H422/03)", "date": "2026-06-16" },
  { "board": "OCR", "level": "A-Level", "subject": "Business", "tier": "N/A", "paper": 1, "paperName": "Operating in a Local Business Environment (H431/01)", "date": "2026-05-13" },
  { "board": "OCR", "level": "A-Level", "subject": "Business", "tier": "N/A", "paper": 2, "paperName": "The UK Business Environment (H431/02)", "date": "2026-05-19" },
  { "board": "OCR", "level": "A-Level", "subject": "Business", "tier": "N/A", "paper": 3, "paperName": "The Global Business Environment (H431/03)", "date": "2026-06-09" },
  { "board": "OCR", "level": "A-Level", "subject": "Chemistry A", "tier": "N/A", "paper": 1, "paperName": "Periodic Table, Elements and Physical Chemistry (H432/01)", "date": "2026-06-02" },
  { "board": "OCR", "level": "A-Level", "subject": "Chemistry A", "tier": "N/A", "paper": 2, "paperName": "Synthesis and Analytical Techniques (H432/02)", "date": "2026-06-09" },
  { "board": "OCR", "level": "A-Level", "subject": "Chemistry A", "tier": "N/A", "paper": 3, "paperName": "Unified Chemistry (H432/03)", "date": "2026-06-15" },
  { "board": "OCR", "level": "A-Level", "subject": "Chemistry B (Salters)", "tier": "N/A", "paper": 1, "paperName": "Fundamentals of Chemistry (H433/01)", "date": "2026-06-02" },
  { "board": "OCR", "level": "A-Level", "subject": "Chemistry B (Salters)", "tier": "N/A", "paper": 2, "paperName": "Scientific Literacy in Chemistry (H433/02)", "date": "2026-06-09" },
  { "board": "OCR", "level": "A-Level", "subject": "Chemistry B (Salters)", "tier": "N/A", "paper": 3, "paperName": "Practical Skills in Chemistry (H433/03)", "date": "2026-06-15" },
  { "board": "OCR", "level": "A-Level", "subject": "Computer Science", "tier": "N/A", "paper": 1, "paperName": "Computer Systems (H446/01)", "date": "2026-06-10" },
  { "board": "OCR", "level": "A-Level", "subject": "Computer Science", "tier": "N/A", "paper": 2, "paperName": "Algorithms and Programming (H446/02)", "date": "2026-06-17" },
  { "board": "OCR", "level": "A-Level", "subject": "Economics", "tier": "N/A", "paper": 1, "paperName": "Microeconomics (H460/01)", "date": "2026-05-11" },
  { "board": "OCR", "level": "A-Level", "subject": "Economics", "tier": "N/A", "paper": 2, "paperName": "Macroeconomics (H460/02)", "date": "2026-05-18" },
  { "board": "OCR", "level": "A-Level", "subject": "Economics", "tier": "N/A", "paper": 3, "paperName": "Themes in Economics (H460/03)", "date": "2026-06-04" },
  { "board": "OCR", "level": "A-Level", "subject": "English Language", "tier": "N/A", "paper": 1, "paperName": "Exploring Language (H470/01)", "date": "2026-05-11" },
  { "board": "OCR", "level": "A-Level", "subject": "English Language", "tier": "N/A", "paper": 2, "paperName": "Dimensions of Linguistic Variation (H470/02)", "date": "2026-05-22" },
  { "board": "OCR", "level": "A-Level", "subject": "English Literature", "tier": "N/A", "paper": 1, "paperName": "Drama and Poetry Pre-1900 (H472/01)", "date": "2026-05-13" },
  { "board": "OCR", "level": "A-Level", "subject": "English Literature", "tier": "N/A", "paper": 2, "paperName": "Comparative and Contextual Study (H472/02)", "date": "2026-06-01" },
  { "board": "OCR", "level": "A-Level", "subject": "Film Studies", "tier": "N/A", "paper": 1, "paperName": "Film History (H410/01)", "date": "2026-05-22" },
  { "board": "OCR", "level": "A-Level", "subject": "Film Studies", "tier": "N/A", "paper": 2, "paperName": "Critical Approaches to Film (H410/02)", "date": "2026-06-02" },
  { "board": "OCR", "level": "A-Level", "subject": "Geography", "tier": "N/A", "paper": 1, "paperName": "Physical Systems (H481/01)", "date": "2026-05-12" },
  { "board": "OCR", "level": "A-Level", "subject": "Geography", "tier": "N/A", "paper": 2, "paperName": "Human Interactions (H481/02)", "date": "2026-05-21" },
  { "board": "OCR", "level": "A-Level", "subject": "Geography", "tier": "N/A", "paper": 3, "paperName": "Geographical Debates (H481/03)", "date": "2026-06-08" },
  { "board": "OCR", "level": "A-Level", "subject": "History A", "tier": "N/A", "paper": 1, "paperName": "Thematic Study and Historical Interpretations (H505/Y301)", "date": "2026-05-19" },
  { "board": "OCR", "level": "A-Level", "subject": "History A", "tier": "N/A", "paper": 2, "paperName": "British Period Study and Enquiry (H505/Y101)", "date": "2026-06-02" },
  { "board": "OCR", "level": "A-Level", "subject": "History A", "tier": "N/A", "paper": 3, "paperName": "Non-British Period Study (H505/Y201)", "date": "2026-06-11" },
  { "board": "OCR", "level": "A-Level", "subject": "Law", "tier": "N/A", "paper": 1, "paperName": "The Legal System and Criminal Law (H418/01)", "date": "2026-05-21" },
  { "board": "OCR", "level": "A-Level", "subject": "Law", "tier": "N/A", "paper": 2, "paperName": "Law Making and the Law of Tort (H418/02)", "date": "2026-06-01" },
  { "board": "OCR", "level": "A-Level", "subject": "Law", "tier": "N/A", "paper": 3, "paperName": "The Nature of Law and Human Rights or Contract (H418/03-04)", "date": "2026-06-09" },
  { "board": "OCR", "level": "A-Level", "subject": "Mathematics A", "tier": "N/A", "paper": 1, "paperName": "Pure Mathematics (H240/01)", "date": "2026-06-03" },
  { "board": "OCR", "level": "A-Level", "subject": "Mathematics A", "tier": "N/A", "paper": 2, "paperName": "Pure Mathematics and Statistics (H240/02)", "date": "2026-06-11" },
  { "board": "OCR", "level": "A-Level", "subject": "Mathematics A", "tier": "N/A", "paper": 3, "paperName": "Pure Mathematics and Mechanics (H240/03)", "date": "2026-06-18" },
  { "board": "OCR", "level": "A-Level", "subject": "Mathematics B (MEI)", "tier": "N/A", "paper": 1, "paperName": "Pure Mathematics and Mechanics (H640/01)", "date": "2026-06-03" },
  { "board": "OCR", "level": "A-Level", "subject": "Mathematics B (MEI)", "tier": "N/A", "paper": 2, "paperName": "Pure Mathematics and Statistics (H640/02)", "date": "2026-06-11" },
  { "board": "OCR", "level": "A-Level", "subject": "Mathematics B (MEI)", "tier": "N/A", "paper": 3, "paperName": "Pure Mathematics and Comprehension (H640/03)", "date": "2026-06-18" },
  { "board": "OCR", "level": "A-Level", "subject": "Media Studies", "tier": "N/A", "paper": 1, "paperName": "Media Messages (H409/01)", "date": "2026-05-14" },
  { "board": "OCR", "level": "A-Level", "subject": "Media Studies", "tier": "N/A", "paper": 2, "paperName": "Evolving Media (H409/02)", "date": "2026-06-04" },
  { "board": "OCR", "level": "A-Level", "subject": "Physical Education", "tier": "N/A", "paper": 1, "paperName": "Physiological Factors Affecting Performance (H555/01)", "date": "2026-05-21" },
  { "board": "OCR", "level": "A-Level", "subject": "Physical Education", "tier": "N/A", "paper": 2, "paperName": "Psychological Factors Affecting Performance (H555/02)", "date": "2026-06-01" },
  { "board": "OCR", "level": "A-Level", "subject": "Physical Education", "tier": "N/A", "paper": 3, "paperName": "Socio-cultural Issues in Physical Activity and Sport (H555/03)", "date": "2026-06-16" },
  { "board": "OCR", "level": "A-Level", "subject": "Physics A", "tier": "N/A", "paper": 1, "paperName": "Modelling Physics (H556/01)", "date": "2026-05-20" },
  { "board": "OCR", "level": "A-Level", "subject": "Physics A", "tier": "N/A", "paper": 2, "paperName": "Exploring Physics (H556/02)", "date": "2026-06-01" },
  { "board": "OCR", "level": "A-Level", "subject": "Physics A", "tier": "N/A", "paper": 3, "paperName": "Unified Physics (H556/03)", "date": "2026-06-08" },
  { "board": "OCR", "level": "A-Level", "subject": "Physics B (Advancing Physics)", "tier": "N/A", "paper": 1, "paperName": "Fundamentals of Physics (H557/01)", "date": "2026-05-20" },
  { "board": "OCR", "level": "A-Level", "subject": "Physics B (Advancing Physics)", "tier": "N/A", "paper": 2, "paperName": "Scientific Literacy in Physics (H557/02)", "date": "2026-06-01" },
  { "board": "OCR", "level": "A-Level", "subject": "Physics B (Advancing Physics)", "tier": "N/A", "paper": 3, "paperName": "Practical Skills in Physics (H557/03)", "date": "2026-06-08" },
  { "board": "OCR", "level": "A-Level", "subject": "Psychology", "tier": "N/A", "paper": 1, "paperName": "Research Methods (H567/01)", "date": "2026-05-15" },
  { "board": "OCR", "level": "A-Level", "subject": "Psychology", "tier": "N/A", "paper": 2, "paperName": "Psychological Themes Through Core Studies (H567/02)", "date": "2026-05-20" },
  { "board": "OCR", "level": "A-Level", "subject": "Psychology", "tier": "N/A", "paper": 3, "paperName": "Applied Psychology (H567/03)", "date": "2026-06-05" },
  { "board": "OCR", "level": "A-Level", "subject": "Religious Studies", "tier": "N/A", "paper": 1, "paperName": "Philosophy of Religion (H573/01)", "date": "2026-06-04" },
  { "board": "OCR", "level": "A-Level", "subject": "Religious Studies", "tier": "N/A", "paper": 2, "paperName": "Religion and Ethics (H573/02)", "date": "2026-06-09" },
  { "board": "OCR", "level": "A-Level", "subject": "Religious Studies", "tier": "N/A", "paper": 3, "paperName": "Developments in Christian Thought (H573/03)", "date": "2026-06-15" },
  { "board": "OCR", "level": "A-Level", "subject": "Sociology", "tier": "N/A", "paper": 1, "paperName": "Socialisation, Culture and Identity (H580/01)", "date": "2026-05-18" },
  { "board": "OCR", "level": "A-Level", "subject": "Sociology", "tier": "N/A", "paper": 2, "paperName": "Researching and Understanding Social Inequalities (H580/02)", "date": "2026-06-03" },
  { "board": "OCR", "level": "A-Level", "subject": "Sociology", "tier": "N/A", "paper": 3, "paperName": "Debates in Contemporary Society (H580/03)", "date": "2026-06-12" },

  // ── Eduqas A-Level 2026 — Source: WJEC Final Timetable, April 2025 ──
  { "board": "Eduqas", "level": "A-Level", "subject": "Biology", "tier": "N/A", "paper": 1, "paperName": "Component 1: Energy, Homeostasis and the Environment (A400U10-1)", "date": "2026-06-04" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Biology", "tier": "N/A", "paper": 2, "paperName": "Component 2: Continuity and Change (A400U20-1)", "date": "2026-06-12" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Biology", "tier": "N/A", "paper": 3, "paperName": "Component 3: Organisms and Environments (A400U30-1)", "date": "2026-06-15" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Business", "tier": "N/A", "paper": 1, "paperName": "Component 1: Business Opportunities and Functions (A510U10-1)", "date": "2026-05-13" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Business", "tier": "N/A", "paper": 2, "paperName": "Component 2: Business Analysis and Strategy (A510U20-1)", "date": "2026-05-19" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Business", "tier": "N/A", "paper": 3, "paperName": "Component 3: Business in a Changing World (A510U30-1)", "date": "2026-06-09" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Chemistry", "tier": "N/A", "paper": 1, "paperName": "Component 1: Physical and Inorganic Chemistry (A410U10-1)", "date": "2026-06-02" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Chemistry", "tier": "N/A", "paper": 2, "paperName": "Component 2: Organic Chemistry and Analysis (A410U20-1)", "date": "2026-06-08" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Chemistry", "tier": "N/A", "paper": 3, "paperName": "Component 3: Physical Chemistry and Practical Skills (A410U30-1)", "date": "2026-06-15" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Computer Science", "tier": "N/A", "paper": 1, "paperName": "Component 1: Computer Architecture, Data, Communication and Applications (A500U10-1)", "date": "2026-06-10" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Computer Science", "tier": "N/A", "paper": 2, "paperName": "Component 2: Algorithms and Programming (A500U20-1)", "date": "2026-06-17" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Economics", "tier": "N/A", "paper": 1, "paperName": "Component 1: Microeconomics (A520U10-1)", "date": "2026-05-11" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Economics", "tier": "N/A", "paper": 2, "paperName": "Component 2: Macroeconomics (A520U20-1)", "date": "2026-05-18" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Economics", "tier": "N/A", "paper": 3, "paperName": "Component 3: Microeconomics and Macroeconomics (A520U30-1)", "date": "2026-06-04" },
  { "board": "Eduqas", "level": "A-Level", "subject": "English Language", "tier": "N/A", "paper": 1, "paperName": "Component 1: Language in Context (A700U10-1)", "date": "2026-05-11" },
  { "board": "Eduqas", "level": "A-Level", "subject": "English Language", "tier": "N/A", "paper": 2, "paperName": "Component 2: Language Investigation and Creative Writing (A700U20-1)", "date": "2026-05-22" },
  { "board": "Eduqas", "level": "A-Level", "subject": "English Language", "tier": "N/A", "paper": 3, "paperName": "Component 3: Language, Power and Identity (A700U30-1)", "date": "2026-06-03" },
  { "board": "Eduqas", "level": "A-Level", "subject": "English Literature", "tier": "N/A", "paper": 1, "paperName": "Component 1: Poetry (A720U10-1)", "date": "2026-05-13" },
  { "board": "Eduqas", "level": "A-Level", "subject": "English Literature", "tier": "N/A", "paper": 2, "paperName": "Component 2: Drama (A720U20-1)", "date": "2026-06-01" },
  { "board": "Eduqas", "level": "A-Level", "subject": "English Literature", "tier": "N/A", "paper": 3, "paperName": "Component 3: Prose (A720U30-1)", "date": "2026-06-10" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Geography", "tier": "N/A", "paper": 1, "paperName": "Component 1: Changing Landscapes (A110U10-1)", "date": "2026-05-12" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Geography", "tier": "N/A", "paper": 2, "paperName": "Component 2: Changing Places (A110U20-1)", "date": "2026-05-21" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Geography", "tier": "N/A", "paper": 3, "paperName": "Component 3: Global Systems and Global Governance (A110U30-1)", "date": "2026-06-08" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Law", "tier": "N/A", "paper": 1, "paperName": "Component 1: The Nature of Law and the English Legal System (A150U10-1)", "date": "2026-05-21" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Law", "tier": "N/A", "paper": 2, "paperName": "Component 2: The Law of Obligations (A150U20-1)", "date": "2026-06-01" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Law", "tier": "N/A", "paper": 3, "paperName": "Component 3: Human Rights Law (A150U30-1)", "date": "2026-06-09" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Media Studies", "tier": "N/A", "paper": 1, "paperName": "Component 1: Media Products, Industries and Audiences (A680U10-1)", "date": "2026-05-14" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Media Studies", "tier": "N/A", "paper": 2, "paperName": "Component 2: Media Forms and Products in Depth (A680U20-1)", "date": "2026-06-04" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Physical Education", "tier": "N/A", "paper": 1, "paperName": "Component 1: Anatomy, Physiology, Biomechanics (A550U10-1)", "date": "2026-05-21" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Physical Education", "tier": "N/A", "paper": 2, "paperName": "Component 2: Psychology and Socio-cultural Issues (A550U20-1)", "date": "2026-06-01" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Physics", "tier": "N/A", "paper": 1, "paperName": "Component 1: Newtonian Physics (A420U10-1)", "date": "2026-05-20" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Physics", "tier": "N/A", "paper": 2, "paperName": "Component 2: Electromagnetism and Light (A420U20-1)", "date": "2026-06-01" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Physics", "tier": "N/A", "paper": 3, "paperName": "Component 3: Oscillations and Nuclei (A420U30-1)", "date": "2026-06-08" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Psychology", "tier": "N/A", "paper": 1, "paperName": "Component 1: Memories, Thinking, Social Behaviour and Diversity (A290U10-1)", "date": "2026-05-15" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Psychology", "tier": "N/A", "paper": 2, "paperName": "Component 2: Behaviour, Alternatives, Research (A290U20-1)", "date": "2026-05-20" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Psychology", "tier": "N/A", "paper": 3, "paperName": "Component 3: Applied and Issues (A290U30-1)", "date": "2026-06-05" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Religious Studies", "tier": "N/A", "paper": 1, "paperName": "Component 1: Introduction to the Study of Religion (A120U10-1)", "date": "2026-06-04" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Religious Studies", "tier": "N/A", "paper": 2, "paperName": "Component 2: The Study of Religion (A120U20-1)", "date": "2026-06-09" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Religious Studies", "tier": "N/A", "paper": 3, "paperName": "Component 3: Applied Study of Religion (A120U30-1)", "date": "2026-06-15" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Sociology", "tier": "N/A", "paper": 1, "paperName": "Component 1: Socialisation and Identity (A200U10-1)", "date": "2026-05-18" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Sociology", "tier": "N/A", "paper": 2, "paperName": "Component 2: Understanding Social Processes (A200U20-1)", "date": "2026-06-03" },
  { "board": "Eduqas", "level": "A-Level", "subject": "Sociology", "tier": "N/A", "paper": 3, "paperName": "Component 3: Social Change (A200U30-1)", "date": "2026-06-12" },

  // ── CCEA A-Level 2026 ──
  { "board": "CCEA", "level": "A-Level", "subject": "Biology", "tier": "N/A", "paper": 1, "paperName": "AS Unit 1: Molecules and Cells", "date": "2026-05-12" },
  { "board": "CCEA", "level": "A-Level", "subject": "Biology", "tier": "N/A", "paper": 2, "paperName": "AS Unit 2: Organisms and Biodiversity", "date": "2026-05-21" },
  { "board": "CCEA", "level": "A-Level", "subject": "Biology", "tier": "N/A", "paper": 3, "paperName": "A2 Unit 1: Physiology, Coordination and Control", "date": "2026-06-04" },
  { "board": "CCEA", "level": "A-Level", "subject": "Biology", "tier": "N/A", "paper": 4, "paperName": "A2 Unit 2: Biochemistry, Genetics and Evolutionary Trends", "date": "2026-06-12" },
  { "board": "CCEA", "level": "A-Level", "subject": "Chemistry", "tier": "N/A", "paper": 1, "paperName": "AS Unit 1: Basic Concepts in Physical and Inorganic Chemistry", "date": "2026-05-12" },
  { "board": "CCEA", "level": "A-Level", "subject": "Chemistry", "tier": "N/A", "paper": 2, "paperName": "AS Unit 2: Further Physical and Organic Chemistry", "date": "2026-05-19" },
  { "board": "CCEA", "level": "A-Level", "subject": "Chemistry", "tier": "N/A", "paper": 3, "paperName": "A2 Unit 1: Further Physical and Inorganic Chemistry", "date": "2026-06-02" },
  { "board": "CCEA", "level": "A-Level", "subject": "Chemistry", "tier": "N/A", "paper": 4, "paperName": "A2 Unit 2: Analytical, Transition Metals, Electrochemistry and Organic Nitrogen", "date": "2026-06-09" },
  { "board": "CCEA", "level": "A-Level", "subject": "Mathematics", "tier": "N/A", "paper": 1, "paperName": "AS Unit 1: Pure Mathematics with Mechanics", "date": "2026-05-14" },
  { "board": "CCEA", "level": "A-Level", "subject": "Mathematics", "tier": "N/A", "paper": 2, "paperName": "AS Unit 2: Pure Mathematics with Statistics", "date": "2026-05-22" },
  { "board": "CCEA", "level": "A-Level", "subject": "Mathematics", "tier": "N/A", "paper": 3, "paperName": "A2 Unit 1: Pure Mathematics", "date": "2026-06-03" },
  { "board": "CCEA", "level": "A-Level", "subject": "Mathematics", "tier": "N/A", "paper": 4, "paperName": "A2 Unit 2: Pure Mathematics with Mechanics", "date": "2026-06-11" },
  { "board": "CCEA", "level": "A-Level", "subject": "Mathematics", "tier": "N/A", "paper": 5, "paperName": "A2 Unit 3: Pure Mathematics with Statistics", "date": "2026-06-18" },
  { "board": "CCEA", "level": "A-Level", "subject": "Physics", "tier": "N/A", "paper": 1, "paperName": "AS Unit 1: Forces, Energy and Electricity", "date": "2026-05-20" },
  { "board": "CCEA", "level": "A-Level", "subject": "Physics", "tier": "N/A", "paper": 2, "paperName": "AS Unit 2: Waves, Photons and Medical Physics", "date": "2026-06-01" },
  { "board": "CCEA", "level": "A-Level", "subject": "Physics", "tier": "N/A", "paper": 3, "paperName": "A2 Unit 1: Momentum, Thermal Physics, Circular Motion, Oscillations and Atomic Physics", "date": "2026-06-08" },
  { "board": "CCEA", "level": "A-Level", "subject": "Physics", "tier": "N/A", "paper": 4, "paperName": "A2 Unit 2: Fields, Capacitors and Particle Physics", "date": "2026-06-15" },
]

// ─────────────────────────────────────────────────────────────────────────────
// AS-LEVEL 2026 — added so AS-Level is fully separate from A-Level everywhere.
// AS-Level is a standalone, decoupled qualification for AQA/Edexcel/OCR/Eduqas
// (does not contribute to a later A-Level grade — confirmed against JCQ/Ofqual
// and each board's own "About AS and A levels" pages). WJEC (Wales) and CCEA
// keep AS content embedded inside their A-Level unit structure instead (see the
// existing CCEA A-Level entries above, which already include AS Unit 1/2 papers),
// so no separate WJEC/CCEA AS-Level entries are added here — selecting AS-Level
// for those boards is intentionally left empty rather than guessed.
// All dates below are sourced from each board's own official Summer 2026 exam
// timetable (see per-board source comments). As with the GCSE/A-Level dates above,
// always confirm the final personalised timetable with your school/college.
const ASLEVEL_2026 = [
// ── AQA AS-Level 2026 — Source: AQA official May/June 2026 A-level, AS, Level 3 exam timetable (aqa.org.uk) ──
  { "board": "AQA", "level": "AS-Level", "subject": "Biology", "tier": "N/A", "paper": 1, "paperName": "Paper 1", "date": "2026-05-11" },
  { "board": "AQA", "level": "AS-Level", "subject": "Biology", "tier": "N/A", "paper": 2, "paperName": "Paper 2", "date": "2026-05-21" },
  { "board": "AQA", "level": "AS-Level", "subject": "Business", "tier": "N/A", "paper": 1, "paperName": "Business 1", "date": "2026-05-15" },
  { "board": "AQA", "level": "AS-Level", "subject": "Business", "tier": "N/A", "paper": 2, "paperName": "Business 2", "date": "2026-05-21" },
  { "board": "AQA", "level": "AS-Level", "subject": "Chemistry", "tier": "N/A", "paper": 1, "paperName": "Inorganic and Physical Chemistry", "date": "2026-05-12" },
  { "board": "AQA", "level": "AS-Level", "subject": "Chemistry", "tier": "N/A", "paper": 2, "paperName": "Organic and Physical Chemistry", "date": "2026-05-19" },
  { "board": "AQA", "level": "AS-Level", "subject": "Computer Science", "tier": "N/A", "paper": 1, "paperName": "Paper 1", "date": "2026-05-12" },
  { "board": "AQA", "level": "AS-Level", "subject": "Computer Science", "tier": "N/A", "paper": 2, "paperName": "Paper 2", "date": "2026-05-18" },
  { "board": "AQA", "level": "AS-Level", "subject": "Economics", "tier": "N/A", "paper": 1, "paperName": "The Operation of Markets and Market Failure", "date": "2026-05-12" },
  { "board": "AQA", "level": "AS-Level", "subject": "Economics", "tier": "N/A", "paper": 2, "paperName": "The National Economy in a Global Context", "date": "2026-05-18" },
  { "board": "AQA", "level": "AS-Level", "subject": "English Language", "tier": "N/A", "paper": 1, "paperName": "Language and the Individual", "date": "2026-05-11" },
  { "board": "AQA", "level": "AS-Level", "subject": "English Language", "tier": "N/A", "paper": 2, "paperName": "Language Varieties", "date": "2026-05-18" },
  { "board": "AQA", "level": "AS-Level", "subject": "English Literature A", "tier": "N/A", "paper": 1, "paperName": "Love Through the Ages: Shakespeare and Poetry", "date": "2026-05-14" },
  { "board": "AQA", "level": "AS-Level", "subject": "English Literature A", "tier": "N/A", "paper": 2, "paperName": "Love Through the Ages: Prose", "date": "2026-05-22" },
  { "board": "AQA", "level": "AS-Level", "subject": "English Literature B", "tier": "N/A", "paper": 1, "paperName": "Literary Genres: Drama", "date": "2026-05-14" },
  { "board": "AQA", "level": "AS-Level", "subject": "English Literature B", "tier": "N/A", "paper": 2, "paperName": "Literary Genres: Prose and Poetry", "date": "2026-05-22" },
  { "board": "AQA", "level": "AS-Level", "subject": "Further Mathematics", "tier": "N/A", "paper": 1, "paperName": "Paper 1", "date": "2026-05-11" },
  { "board": "AQA", "level": "AS-Level", "subject": "Further Mathematics", "tier": "N/A", "paper": 2, "paperName": "Paper 2 (any 2 options)", "date": "2026-05-15" },
  { "board": "AQA", "level": "AS-Level", "subject": "Geography", "tier": "N/A", "paper": 1, "paperName": "Physical Geography and People and the Environment", "date": "2026-05-12" },
  { "board": "AQA", "level": "AS-Level", "subject": "Geography", "tier": "N/A", "paper": 2, "paperName": "Human Geography and the Geography Fieldwork Investigation", "date": "2026-05-20" },
  { "board": "AQA", "level": "AS-Level", "subject": "German", "tier": "N/A", "paper": 1, "paperName": "Listening, Reading and Writing", "date": "2026-05-13" },
  { "board": "AQA", "level": "AS-Level", "subject": "German", "tier": "N/A", "paper": 2, "paperName": "Writing", "date": "2026-05-19" },
  { "board": "AQA", "level": "AS-Level", "subject": "History", "tier": "N/A", "paper": 1, "paperName": "Breadth Study with Interpretations (options)", "date": "2026-05-13" },
  { "board": "AQA", "level": "AS-Level", "subject": "History", "tier": "N/A", "paper": 2, "paperName": "Depth Study (options)", "date": "2026-05-18" },
  { "board": "AQA", "level": "AS-Level", "subject": "Mathematics", "tier": "N/A", "paper": 1, "paperName": "Paper 1", "date": "2026-05-14" },
  { "board": "AQA", "level": "AS-Level", "subject": "Mathematics", "tier": "N/A", "paper": 2, "paperName": "Paper 2", "date": "2026-05-22" },
  { "board": "AQA", "level": "AS-Level", "subject": "Physics", "tier": "N/A", "paper": 1, "paperName": "Paper 1", "date": "2026-05-13" },
  { "board": "AQA", "level": "AS-Level", "subject": "Physics", "tier": "N/A", "paper": 2, "paperName": "Paper 2", "date": "2026-05-20" },
  { "board": "AQA", "level": "AS-Level", "subject": "Psychology", "tier": "N/A", "paper": 1, "paperName": "Introductory Topics in Psychology", "date": "2026-05-11" },
  { "board": "AQA", "level": "AS-Level", "subject": "Psychology", "tier": "N/A", "paper": 2, "paperName": "Psychology in Context", "date": "2026-05-19" },
  { "board": "AQA", "level": "AS-Level", "subject": "Religious Studies", "tier": "N/A", "paper": 1, "paperName": "Philosophy of Religion and Ethics", "date": "2026-05-15" },
  { "board": "AQA", "level": "AS-Level", "subject": "Religious Studies", "tier": "N/A", "paper": 2, "paperName": "Study of Religion (options)", "date": "2026-05-21" },
  { "board": "AQA", "level": "AS-Level", "subject": "Sociology", "tier": "N/A", "paper": 1, "paperName": "Education with Methods in Context", "date": "2026-05-12" },
  { "board": "AQA", "level": "AS-Level", "subject": "Sociology", "tier": "N/A", "paper": 2, "paperName": "Research Methods and Topics in Sociology", "date": "2026-05-19" },
  { "board": "AQA", "level": "AS-Level", "subject": "Spanish", "tier": "N/A", "paper": 1, "paperName": "Listening, Reading and Writing", "date": "2026-05-11" },
  { "board": "AQA", "level": "AS-Level", "subject": "Spanish", "tier": "N/A", "paper": 2, "paperName": "Writing", "date": "2026-05-18" },
  { "board": "AQA", "level": "AS-Level", "subject": "French", "tier": "N/A", "paper": 1, "paperName": "Listening, Reading and Writing", "date": "2026-05-15" },
  { "board": "AQA", "level": "AS-Level", "subject": "French", "tier": "N/A", "paper": 2, "paperName": "Writing", "date": "2026-05-21" },
// ── Edexcel AS-Level 2026 — Source: Pearson Edexcel GCE Summer 2026 Examination Timetable FINAL (qualifications.pearson.com). 8-prefix codes = AS, 9-prefix = A-Level. ──
  { "board": "Edexcel", "level": "AS-Level", "subject": "Biology A (Salters Nuffield)", "tier": "N/A", "paper": 1, "paperName": "Paper 1: Lifestyle, Transport, Genes and Health", "date": "2026-05-11" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Biology A (Salters Nuffield)", "tier": "N/A", "paper": 2, "paperName": "Paper 2: Development, Plants and the Environment", "date": "2026-05-21" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Biology B", "tier": "N/A", "paper": 1, "paperName": "Paper 1: Core Cellular Biology and Microbiology", "date": "2026-05-11" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Biology B", "tier": "N/A", "paper": 2, "paperName": "Paper 2: Core Physiology and Ecology", "date": "2026-05-21" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Business", "tier": "N/A", "paper": 1, "paperName": "Paper 1: Marketing and People", "date": "2026-05-15" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Business", "tier": "N/A", "paper": 2, "paperName": "Paper 2: Managing Business Activities", "date": "2026-05-21" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Chemistry", "tier": "N/A", "paper": 1, "paperName": "Paper 1: Core Inorganic and Physical Chemistry", "date": "2026-05-12" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Chemistry", "tier": "N/A", "paper": 2, "paperName": "Paper 2: Core Organic and Physical Chemistry", "date": "2026-05-19" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Economics A", "tier": "N/A", "paper": 1, "paperName": "Paper 1: Introduction to Markets and Market Failure", "date": "2026-05-12" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Economics A", "tier": "N/A", "paper": 2, "paperName": "Paper 2: The UK Economy - Performance and Policies", "date": "2026-05-18" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "English Lang & Literature", "tier": "N/A", "paper": 1, "paperName": "Paper 1: Voices in Speech and Writing", "date": "2026-05-11" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "English Lang & Literature", "tier": "N/A", "paper": 2, "paperName": "Paper 2: Varieties in Language and Literature", "date": "2026-05-18" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "English Language", "tier": "N/A", "paper": 1, "paperName": "Paper 1: Language: Context and Identity", "date": "2026-05-11" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "English Language", "tier": "N/A", "paper": 2, "paperName": "Paper 2: Child Language", "date": "2026-05-18" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "English Literature", "tier": "N/A", "paper": 1, "paperName": "Paper 1: Poetry & Drama", "date": "2026-05-14" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "English Literature", "tier": "N/A", "paper": 2, "paperName": "Paper 2: Prose", "date": "2026-05-22" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Further Mathematics", "tier": "N/A", "paper": 1, "paperName": "Paper 1: Core Pure Mathematics", "date": "2026-05-11" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Further Mathematics", "tier": "N/A", "paper": 2, "paperName": "Paper 2: Further Mathematics Options", "date": "2026-05-15" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Geography", "tier": "N/A", "paper": 1, "paperName": "Paper 1: Dynamic Landscapes", "date": "2026-05-12" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Geography", "tier": "N/A", "paper": 2, "paperName": "Paper 2: Dynamic Places", "date": "2026-05-20" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "History", "tier": "N/A", "paper": 1, "paperName": "Paper 1: Breadth Study with Interpretations", "date": "2026-05-13" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "History", "tier": "N/A", "paper": 2, "paperName": "Paper 2: Depth Study", "date": "2026-05-18" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Mathematics", "tier": "N/A", "paper": 1, "paperName": "Paper 1: Pure Mathematics", "date": "2026-05-14" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Mathematics", "tier": "N/A", "paper": 2, "paperName": "Paper 2: Statistics and Mechanics", "date": "2026-05-22" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Music Technology", "tier": "N/A", "paper": 1, "paperName": "Component 3: Listening and Analysing", "date": "2026-05-13" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Music Technology", "tier": "N/A", "paper": 2, "paperName": "Component 4: Producing and Analysing", "date": "2026-05-22" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Physics", "tier": "N/A", "paper": 1, "paperName": "Paper 1: Core Physics I", "date": "2026-05-13" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Physics", "tier": "N/A", "paper": 2, "paperName": "Paper 2: Core Physics II", "date": "2026-05-20" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Politics", "tier": "N/A", "paper": 1, "paperName": "Paper 1: UK Politics", "date": "2026-05-13" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Politics", "tier": "N/A", "paper": 2, "paperName": "Paper 2: UK Government", "date": "2026-05-21" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Psychology", "tier": "N/A", "paper": 1, "paperName": "Paper 1: Social and Cognitive Psychology", "date": "2026-05-11" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Psychology", "tier": "N/A", "paper": 2, "paperName": "Paper 2: Biological Psychology and Learning Theories", "date": "2026-05-19" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Religious Studies", "tier": "N/A", "paper": 1, "paperName": "Paper 1: Philosophy of Religion", "date": "2026-05-15" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Religious Studies", "tier": "N/A", "paper": 2, "paperName": "Paper 2: Religion and Ethics", "date": "2026-05-21" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Religious Studies", "tier": "N/A", "paper": 3, "paperName": "Paper 3: New Testament Studies", "date": "2026-06-01" },
  { "board": "Edexcel", "level": "AS-Level", "subject": "Religious Studies", "tier": "N/A", "paper": 4, "paperName": "Paper 4: Study of Religion (options)", "date": "2026-06-05" },
// ── OCR AS-Level 2026 — Source: OCR AS and A Level Provisional Examination Timetable, June 2026 (ocr.org.uk) ──
  { "board": "OCR", "level": "AS-Level", "subject": "Biology A", "tier": "N/A", "paper": 1, "paperName": "Breadth in Biology", "date": "2026-05-11" },
  { "board": "OCR", "level": "AS-Level", "subject": "Biology A", "tier": "N/A", "paper": 2, "paperName": "Depth in Biology", "date": "2026-05-21" },
  { "board": "OCR", "level": "AS-Level", "subject": "Biology B (Advancing Biology)", "tier": "N/A", "paper": 1, "paperName": "Foundations of Biology", "date": "2026-05-11" },
  { "board": "OCR", "level": "AS-Level", "subject": "Biology B (Advancing Biology)", "tier": "N/A", "paper": 2, "paperName": "Biology in Depth", "date": "2026-05-21" },
  { "board": "OCR", "level": "AS-Level", "subject": "Business", "tier": "N/A", "paper": 1, "paperName": "The Local Business Environment", "date": "2026-05-15" },
  { "board": "OCR", "level": "AS-Level", "subject": "Business", "tier": "N/A", "paper": 2, "paperName": "The Wider Business Environment", "date": "2026-05-21" },
  { "board": "OCR", "level": "AS-Level", "subject": "Chemistry A", "tier": "N/A", "paper": 1, "paperName": "Breadth in Chemistry", "date": "2026-05-12" },
  { "board": "OCR", "level": "AS-Level", "subject": "Chemistry A", "tier": "N/A", "paper": 2, "paperName": "Depth in Chemistry", "date": "2026-05-19" },
  { "board": "OCR", "level": "AS-Level", "subject": "Chemistry B (Salters)", "tier": "N/A", "paper": 1, "paperName": "Foundations of Chemistry", "date": "2026-05-12" },
  { "board": "OCR", "level": "AS-Level", "subject": "Chemistry B (Salters)", "tier": "N/A", "paper": 2, "paperName": "Chemistry in Depth", "date": "2026-05-19" },
  { "board": "OCR", "level": "AS-Level", "subject": "Computer Science", "tier": "N/A", "paper": 1, "paperName": "Computing Principles", "date": "2026-05-12" },
  { "board": "OCR", "level": "AS-Level", "subject": "Computer Science", "tier": "N/A", "paper": 2, "paperName": "Algorithms and Problem Solving", "date": "2026-05-18" },
  { "board": "OCR", "level": "AS-Level", "subject": "Economics", "tier": "N/A", "paper": 1, "paperName": "Microeconomics", "date": "2026-05-12" },
  { "board": "OCR", "level": "AS-Level", "subject": "Economics", "tier": "N/A", "paper": 2, "paperName": "Macroeconomics", "date": "2026-05-18" },
  { "board": "OCR", "level": "AS-Level", "subject": "English Language", "tier": "N/A", "paper": 1, "paperName": "Exploring Language", "date": "2026-05-11" },
  { "board": "OCR", "level": "AS-Level", "subject": "English Language", "tier": "N/A", "paper": 2, "paperName": "Exploring Contexts", "date": "2026-05-18" },
  { "board": "OCR", "level": "AS-Level", "subject": "English Literature", "tier": "N/A", "paper": 1, "paperName": "Shakespeare and Poetry Pre-1900", "date": "2026-05-14" },
  { "board": "OCR", "level": "AS-Level", "subject": "English Literature", "tier": "N/A", "paper": 2, "paperName": "Drama and Prose Post-1900", "date": "2026-05-22" },
  { "board": "OCR", "level": "AS-Level", "subject": "Film Studies", "tier": "N/A", "paper": 1, "paperName": "Elements of Film", "date": "2026-05-13" },
  { "board": "OCR", "level": "AS-Level", "subject": "Geography", "tier": "N/A", "paper": 1, "paperName": "Landscape and Place", "date": "2026-05-12" },
  { "board": "OCR", "level": "AS-Level", "subject": "Geography", "tier": "N/A", "paper": 2, "paperName": "Geographical Debates", "date": "2026-05-20" },
  { "board": "OCR", "level": "AS-Level", "subject": "History A", "tier": "N/A", "paper": 1, "paperName": "British Period Study and Enquiry (Unit Group 1)", "date": "2026-05-13" },
  { "board": "OCR", "level": "AS-Level", "subject": "History A", "tier": "N/A", "paper": 2, "paperName": "Non-British Period Study (Unit Group 2)", "date": "2026-05-18" },
  { "board": "OCR", "level": "AS-Level", "subject": "Law", "tier": "N/A", "paper": 1, "paperName": "The Legal System and Criminal Law", "date": "2026-05-15" },
  { "board": "OCR", "level": "AS-Level", "subject": "Law", "tier": "N/A", "paper": 2, "paperName": "Law Making and the Law of Tort", "date": "2026-05-22" },
  { "board": "OCR", "level": "AS-Level", "subject": "Mathematics A", "tier": "N/A", "paper": 1, "paperName": "Pure Mathematics and Statistics", "date": "2026-05-14" },
  { "board": "OCR", "level": "AS-Level", "subject": "Mathematics A", "tier": "N/A", "paper": 2, "paperName": "Pure Mathematics and Mechanics", "date": "2026-05-22" },
  { "board": "OCR", "level": "AS-Level", "subject": "Mathematics B (MEI)", "tier": "N/A", "paper": 1, "paperName": "Pure Mathematics and Mechanics", "date": "2026-05-14" },
  { "board": "OCR", "level": "AS-Level", "subject": "Mathematics B (MEI)", "tier": "N/A", "paper": 2, "paperName": "Pure Mathematics and Statistics", "date": "2026-05-22" },
  { "board": "OCR", "level": "AS-Level", "subject": "Media Studies", "tier": "N/A", "paper": 1, "paperName": "Media Today", "date": "2026-05-12" },
  { "board": "OCR", "level": "AS-Level", "subject": "Physical Education", "tier": "N/A", "paper": 1, "paperName": "Physiological Factors Affecting Performance", "date": "2026-05-12" },
  { "board": "OCR", "level": "AS-Level", "subject": "Physical Education", "tier": "N/A", "paper": 2, "paperName": "Psychological and Socio-cultural Themes in PE", "date": "2026-05-19" },
  { "board": "OCR", "level": "AS-Level", "subject": "Physics A", "tier": "N/A", "paper": 1, "paperName": "Breadth in Physics", "date": "2026-05-13" },
  { "board": "OCR", "level": "AS-Level", "subject": "Physics A", "tier": "N/A", "paper": 2, "paperName": "Depth in Physics", "date": "2026-05-20" },
  { "board": "OCR", "level": "AS-Level", "subject": "Physics B (Advancing Physics)", "tier": "N/A", "paper": 1, "paperName": "Foundations of Physics", "date": "2026-05-13" },
  { "board": "OCR", "level": "AS-Level", "subject": "Physics B (Advancing Physics)", "tier": "N/A", "paper": 2, "paperName": "Physics in Depth", "date": "2026-05-20" },
  { "board": "OCR", "level": "AS-Level", "subject": "Psychology", "tier": "N/A", "paper": 1, "paperName": "Research Methods", "date": "2026-05-11" },
  { "board": "OCR", "level": "AS-Level", "subject": "Psychology", "tier": "N/A", "paper": 2, "paperName": "Psychological Themes Through Core Studies", "date": "2026-05-19" },
  { "board": "OCR", "level": "AS-Level", "subject": "Religious Studies", "tier": "N/A", "paper": 1, "paperName": "Philosophy of Religion", "date": "2026-05-15" },
  { "board": "OCR", "level": "AS-Level", "subject": "Religious Studies", "tier": "N/A", "paper": 2, "paperName": "Religion and Ethics", "date": "2026-05-21" },
  { "board": "OCR", "level": "AS-Level", "subject": "Sociology", "tier": "N/A", "paper": 1, "paperName": "Socialisation, Culture and Identity", "date": "2026-05-12" },
  { "board": "OCR", "level": "AS-Level", "subject": "Sociology", "tier": "N/A", "paper": 2, "paperName": "Researching and Understanding Social Inequalities", "date": "2026-05-19" },
// ── Eduqas AS-Level 2026 — Source: WJEC Wales and Eduqas Summer 2026 FINAL Examination Timetable (wjec.co.uk) ──
  { "board": "Eduqas", "level": "AS-Level", "subject": "Biology", "tier": "N/A", "paper": 1, "paperName": "Component 1", "date": "2026-05-11" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Biology", "tier": "N/A", "paper": 2, "paperName": "Component 2", "date": "2026-05-21" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Business", "tier": "N/A", "paper": 1, "paperName": "Component 1", "date": "2026-05-15" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Business", "tier": "N/A", "paper": 2, "paperName": "Component 2", "date": "2026-05-21" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Chemistry", "tier": "N/A", "paper": 1, "paperName": "Component 1", "date": "2026-05-12" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Chemistry", "tier": "N/A", "paper": 2, "paperName": "Component 2", "date": "2026-05-19" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Computer Science", "tier": "N/A", "paper": 1, "paperName": "Component 1", "date": "2026-05-12" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Computer Science", "tier": "N/A", "paper": 2, "paperName": "Component 2 (on-screen)", "date": "2026-05-18" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Economics", "tier": "N/A", "paper": 1, "paperName": "Component 1", "date": "2026-05-12" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Economics", "tier": "N/A", "paper": 2, "paperName": "Component 2", "date": "2026-05-18" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "English Language", "tier": "N/A", "paper": 1, "paperName": "Component 1", "date": "2026-05-11" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "English Language", "tier": "N/A", "paper": 2, "paperName": "Component 2", "date": "2026-05-18" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "English Literature", "tier": "N/A", "paper": 1, "paperName": "Component 1", "date": "2026-05-14" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "English Literature", "tier": "N/A", "paper": 2, "paperName": "Component 2", "date": "2026-05-22" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Geography", "tier": "N/A", "paper": 1, "paperName": "Component 1", "date": "2026-05-12" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Geography", "tier": "N/A", "paper": 2, "paperName": "Component 2", "date": "2026-05-20" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Law", "tier": "N/A", "paper": 1, "paperName": "Component 1", "date": "2026-05-15" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Law", "tier": "N/A", "paper": 2, "paperName": "Component 2", "date": "2026-05-22" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Media Studies", "tier": "N/A", "paper": 1, "paperName": "Component 1", "date": "2026-05-12" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Physical Education", "tier": "N/A", "paper": 1, "paperName": "Component 1", "date": "2026-05-12" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Physics", "tier": "N/A", "paper": 1, "paperName": "Component 1", "date": "2026-05-13" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Physics", "tier": "N/A", "paper": 2, "paperName": "Component 2", "date": "2026-05-20" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Psychology", "tier": "N/A", "paper": 1, "paperName": "Component 1", "date": "2026-05-12" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Psychology", "tier": "N/A", "paper": 2, "paperName": "Component 2", "date": "2026-05-19" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Religious Studies", "tier": "N/A", "paper": 1, "paperName": "Component 1 (options A to F)", "date": "2026-05-15" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Religious Studies", "tier": "N/A", "paper": 2, "paperName": "Component 2", "date": "2026-05-21" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Sociology", "tier": "N/A", "paper": 1, "paperName": "Component 1", "date": "2026-05-12" },
  { "board": "Eduqas", "level": "AS-Level", "subject": "Sociology", "tier": "N/A", "paper": 2, "paperName": "Component 2", "date": "2026-05-19" },
]


// ────────────────────────────────────────────────────────
// Cambridge Nationals and other L2 vocational quals
// These have unit exams rather than traditional papers
const L2_2026 = [
  { board:'OCR', level:'Level 2', subject:'Cambridge National Business', tier:'N/A', paper:1, paperName:'Exam Unit (R069)', date:'2026-05-15' },
  { board:'OCR', level:'Level 2', subject:'Cambridge National IT', tier:'N/A', paper:1, paperName:'Exam Unit (R070)', date:'2026-05-22' },
  { board:'OCR', level:'Level 2', subject:'Cambridge National Sport Science', tier:'N/A', paper:1, paperName:'Exam Unit (R041)', date:'2026-05-19' },
  { board:'OCR', level:'Level 2', subject:'Cambridge National Health & Social Care', tier:'N/A', paper:1, paperName:'Exam Unit (R032)', date:'2026-05-20' },
  { board:'OCR', level:'Level 2', subject:'Cambridge National Creative Media', tier:'N/A', paper:1, paperName:'Exam Unit', date:'2026-06-03' },
]

export const EXAM_DATES_2026 = [...GCSE_2026, ...ASLEVEL_2026, ...ALEVEL_2026, ...L2_2026]

// ── 2027 EXAM DATES ──────────────────────────────────────────────────────────
// Source: AQA's official "Exam timetable May/June 2027 – GCSE, AQA Certificates, ELC and
// Projects" (aqa.org.uk/exams-administration/dates-and-timetables), Version 1.0, checked directly
// — labelled PROVISIONAL by AQA itself (a 6-week consultation ran 2 Feb–20 Mar 2026; AQA states
// finals were due "early May 2026", but this Version 1.0 document was still the live one on
// aqa.org.uk when checked). Treat these as "very likely, not yet contractually final" rather than
// as certain as the 2026 dates elsewhere in this file — spot check against aqa.org.uk before
// printing a calendar or sending reminders close to results-affecting deadlines.
//
// SCOPE: AQA GCSE only. Edexcel GCSE 2027 (Pearson has published a FINAL, not provisional,
// version), Cambridge OCR GCSE 2027 (also FINAL), and WJEC/Eduqas GCSE 2027 (provisional) are
// all confirmed published and real — sources below — but weren't transcribed into this file in
// this pass; treat every board except AQA as a documented gap, not an oversight:
//   - Edexcel GCSE 2027 (FINAL): qualifications.pearson.com/content/dam/pdf/Support/
//     Examination-timetables-for-UK-Edexcel-GCSE/gcse-summer-2027final.pdf
//   - Cambridge OCR GCSE 2027 (FINAL, June 2026 edition): ocr.org.uk (search "June 2027 exam
//     timetable GCSE") — Cambridge OCR is OCR's new name since Sept 2025, same board
//   - WJEC/Eduqas GCSE 2027 (provisional): wjec.co.uk (Summer 2027 Wales & Eduqas provisional
//     timetable)
//   - CCEA GCSE 2027: confirmed final and published at ccea.org.uk (last updated 20/05/2026) —
//     URL not individually re-verified in this pass
// AS-Level and A-Level 2027 for every board (including AQA) are also a documented gap here for
// the same reason — real, sourced, and published (AQA's AS/A-level 2027 provisional timetable was
// checked earlier in this project), just not yet transcribed into this file's schema.
const GCSE_2027 = [
  { board:'AQA', level:'GCSE', subject:'Mathematics', tier:'N/A', paper:1, paperName:'Paper 1: Non-Calculator (F/H)', date:'2027-05-14' },
  { board:'AQA', level:'GCSE', subject:'Mathematics', tier:'N/A', paper:2, paperName:'Paper 2: Calculator (F/H)', date:'2027-05-27' },
  { board:'AQA', level:'GCSE', subject:'Mathematics', tier:'N/A', paper:3, paperName:'Paper 3: Calculator (F/H)', date:'2027-06-14' },
  { board:'AQA', level:'GCSE', subject:'Statistics', tier:'N/A', paper:1, paperName:'Paper 1 (F/H)', date:'2027-06-07' },
  { board:'AQA', level:'GCSE', subject:'Statistics', tier:'N/A', paper:2, paperName:'Paper 2 (F/H)', date:'2027-06-16' },
  { board:'AQA', level:'GCSE', subject:'English Language', tier:'N/A', paper:1, paperName:'Explorations in Creative Reading and Writing', date:'2027-05-24' },
  { board:'AQA', level:'GCSE', subject:'English Language', tier:'N/A', paper:2, paperName:"Writers' Viewpoints and Perspectives", date:'2027-06-08' },
  { board:'AQA', level:'GCSE', subject:'English Literature', tier:'N/A', paper:1, paperName:'Shakespeare and the 19th-Century Novel', date:'2027-05-12' },
  { board:'AQA', level:'GCSE', subject:'English Literature', tier:'N/A', paper:2, paperName:'Modern Texts and Poetry', date:'2027-05-19' },
  { board:'AQA', level:'GCSE', subject:'Biology', tier:'N/A', paper:1, paperName:'Paper 1 (F/H)', date:'2027-05-11' },
  { board:'AQA', level:'GCSE', subject:'Biology', tier:'N/A', paper:2, paperName:'Paper 2 (F/H)', date:'2027-06-10' },
  { board:'AQA', level:'GCSE', subject:'Chemistry', tier:'N/A', paper:1, paperName:'Paper 1 (F/H)', date:'2027-05-17' },
  { board:'AQA', level:'GCSE', subject:'Chemistry', tier:'N/A', paper:2, paperName:'Paper 2 (F/H)', date:'2027-06-15' },
  { board:'AQA', level:'GCSE', subject:'Physics', tier:'N/A', paper:1, paperName:'Paper 1 (F/H)', date:'2027-05-25' },
  { board:'AQA', level:'GCSE', subject:'Physics', tier:'N/A', paper:2, paperName:'Paper 2 (F/H)', date:'2027-06-18' },
  { board:'AQA', level:'GCSE', subject:'Combined Science: Trilogy', tier:'N/A', paper:1, paperName:'Biology Paper 1 (F/H)', date:'2027-05-11' },
  { board:'AQA', level:'GCSE', subject:'Combined Science: Trilogy', tier:'N/A', paper:2, paperName:'Biology Paper 2 (F/H)', date:'2027-06-10' },
  { board:'AQA', level:'GCSE', subject:'Combined Science: Trilogy', tier:'N/A', paper:3, paperName:'Chemistry Paper 1 (F/H)', date:'2027-05-17' },
  { board:'AQA', level:'GCSE', subject:'Combined Science: Trilogy', tier:'N/A', paper:4, paperName:'Chemistry Paper 2 (F/H)', date:'2027-06-15' },
  { board:'AQA', level:'GCSE', subject:'Combined Science: Trilogy', tier:'N/A', paper:5, paperName:'Physics Paper 1 (F/H)', date:'2027-05-25' },
  { board:'AQA', level:'GCSE', subject:'Combined Science: Trilogy', tier:'N/A', paper:6, paperName:'Physics Paper 2 (F/H)', date:'2027-06-18' },
  { board:'AQA', level:'GCSE', subject:'Combined Science: Synergy', tier:'N/A', paper:1, paperName:'Life and Environmental Sciences Paper 1 (F/H)', date:'2027-05-11' },
  { board:'AQA', level:'GCSE', subject:'Combined Science: Synergy', tier:'N/A', paper:2, paperName:'Life and Environmental Sciences Paper 2 (F/H)', date:'2027-05-25' },
  { board:'AQA', level:'GCSE', subject:'Combined Science: Synergy', tier:'N/A', paper:3, paperName:'Physical Sciences Paper 1 (F/H)', date:'2027-06-10' },
  { board:'AQA', level:'GCSE', subject:'Combined Science: Synergy', tier:'N/A', paper:4, paperName:'Physical Sciences Paper 2 (F/H)', date:'2027-06-15' },
  { board:'AQA', level:'GCSE', subject:'Geography', tier:'N/A', paper:1, paperName:'Living With the Physical Environment', date:'2027-05-18' },
  { board:'AQA', level:'GCSE', subject:'Geography', tier:'N/A', paper:2, paperName:'Challenges in the Human Environment', date:'2027-05-26' },
  { board:'AQA', level:'GCSE', subject:'Geography', tier:'N/A', paper:3, paperName:'Geographical Applications', date:'2027-06-10' },
  { board:'AQA', level:'GCSE', subject:'History', tier:'N/A', paper:1, paperName:'Paper 1: Understanding the Modern World (Section A + B choice)', date:'2027-05-20' },
  { board:'AQA', level:'GCSE', subject:'History', tier:'N/A', paper:2, paperName:'Paper 2: Shaping the Nation (Section A + B choice)', date:'2027-05-28' },
  { board:'AQA', level:'GCSE', subject:'Computer Science', tier:'N/A', paper:1, paperName:'Computational Thinking and Programming Skills', date:'2027-05-10' },
  { board:'AQA', level:'GCSE', subject:'Computer Science', tier:'N/A', paper:2, paperName:'Computing Concepts', date:'2027-05-19' },
  { board:'AQA', level:'GCSE', subject:'Business', tier:'N/A', paper:1, paperName:'Influences of Operations and HRM on Business Activity', date:'2027-05-12' },
  { board:'AQA', level:'GCSE', subject:'Business', tier:'N/A', paper:2, paperName:'Influences of Marketing and Finance on Business Activity', date:'2027-05-21' },
  { board:'AQA', level:'GCSE', subject:'Economics', tier:'N/A', paper:1, paperName:'How Markets Work', date:'2027-05-13' },
  { board:'AQA', level:'GCSE', subject:'Economics', tier:'N/A', paper:2, paperName:'How the Economy Works', date:'2027-05-25' },
  { board:'AQA', level:'GCSE', subject:'Psychology', tier:'N/A', paper:1, paperName:'Cognition and Behaviour', date:'2027-05-10' },
  { board:'AQA', level:'GCSE', subject:'Psychology', tier:'N/A', paper:2, paperName:'Social Context and Behaviour', date:'2027-05-17' },
  { board:'AQA', level:'GCSE', subject:'Sociology', tier:'N/A', paper:1, paperName:'The Sociology of Families and Education', date:'2027-05-11' },
  { board:'AQA', level:'GCSE', subject:'Sociology', tier:'N/A', paper:2, paperName:'The Sociology of Crime and Deviance and Social Stratification', date:'2027-05-18' },
  { board:'AQA', level:'GCSE', subject:'Citizenship Studies', tier:'N/A', paper:1, paperName:'Paper 1', date:'2027-05-10' },
  { board:'AQA', level:'GCSE', subject:'Citizenship Studies', tier:'N/A', paper:2, paperName:'Paper 2', date:'2027-05-20' },
  { board:'AQA', level:'GCSE', subject:'Religious Studies A', tier:'N/A', paper:1, paperName:'Paper 1: Beliefs, Teachings and Practices', date:'2027-05-13' },
  { board:'AQA', level:'GCSE', subject:'Religious Studies A', tier:'N/A', paper:2, paperName:'Paper 2: Thematic Studies', date:'2027-05-21' },
  { board:'AQA', level:'GCSE', subject:'Religious Studies B', tier:'N/A', paper:1, paperName:'Paper 1: Catholic Christianity', date:'2027-05-13' },
  { board:'AQA', level:'GCSE', subject:'Religious Studies B', tier:'N/A', paper:2, paperName:'Paper 2: Perspectives on Faith', date:'2027-05-21' },
  { board:'AQA', level:'GCSE', subject:'Media Studies', tier:'N/A', paper:1, paperName:'Paper 1', date:'2027-05-17' },
  { board:'AQA', level:'GCSE', subject:'Media Studies', tier:'N/A', paper:2, paperName:'Paper 2', date:'2027-05-25' },
  { board:'AQA', level:'GCSE', subject:'Physical Education', tier:'N/A', paper:1, paperName:'The Human Body and Movement in Physical Activity and Sport', date:'2027-05-13' },
  { board:'AQA', level:'GCSE', subject:'Physical Education', tier:'N/A', paper:2, paperName:'Socio-Cultural Influences and Well-Being in Physical Activity and Sport', date:'2027-05-20' },
  { board:'AQA', level:'GCSE', subject:'French', tier:'N/A', paper:1, paperName:'Listening', date:'2027-05-26' },
  { board:'AQA', level:'GCSE', subject:'French', tier:'N/A', paper:3, paperName:'Reading', date:'2027-05-26' },
  { board:'AQA', level:'GCSE', subject:'French', tier:'N/A', paper:4, paperName:'Writing', date:'2027-06-08' },
  { board:'AQA', level:'GCSE', subject:'German', tier:'N/A', paper:3, paperName:'Reading', date:'2027-05-10' },
  { board:'AQA', level:'GCSE', subject:'German', tier:'N/A', paper:1, paperName:'Listening', date:'2027-05-10' },
  { board:'AQA', level:'GCSE', subject:'German', tier:'N/A', paper:4, paperName:'Writing', date:'2027-05-18' },
  { board:'AQA', level:'GCSE', subject:'Spanish', tier:'N/A', paper:1, paperName:'Listening', date:'2027-06-09' },
  { board:'AQA', level:'GCSE', subject:'Spanish', tier:'N/A', paper:3, paperName:'Reading', date:'2027-06-09' },
  { board:'AQA', level:'GCSE', subject:'Spanish', tier:'N/A', paper:4, paperName:'Writing', date:'2027-06-16' },
  { board:'AQA', level:'GCSE', subject:'Mandarin Chinese', tier:'N/A', paper:1, paperName:'Listening', date:'2027-05-11' },
  { board:'AQA', level:'GCSE', subject:'Mandarin Chinese', tier:'N/A', paper:3, paperName:'Reading', date:'2027-05-11' },
  { board:'AQA', level:'GCSE', subject:'Mandarin Chinese', tier:'N/A', paper:4, paperName:'Writing', date:'2027-05-20' },
  { board:'AQA', level:'GCSE', subject:'Urdu', tier:'N/A', paper:1, paperName:'Listening', date:'2027-05-11' },
  { board:'AQA', level:'GCSE', subject:'Urdu', tier:'N/A', paper:3, paperName:'Reading', date:'2027-05-11' },
  { board:'AQA', level:'GCSE', subject:'Urdu', tier:'N/A', paper:4, paperName:'Writing', date:'2027-05-25' },
  { board:'AQA', level:'GCSE', subject:'Design and Technology', tier:'N/A', paper:1, paperName:'Written', date:'2027-06-15' },
  { board:'AQA', level:'GCSE', subject:'Food Preparation and Nutrition', tier:'N/A', paper:1, paperName:'Paper 1', date:'2027-05-24' },
  { board:'AQA', level:'GCSE', subject:'Drama', tier:'N/A', paper:1, paperName:'Understanding Drama', date:'2027-05-14' },
  { board:'AQA', level:'GCSE', subject:'Music', tier:'N/A', paper:1, paperName:'Understanding Music', date:'2027-05-27' },
  { board:'AQA', level:'GCSE', subject:'Dance', tier:'N/A', paper:1, paperName:'Dance Appreciation', date:'2027-06-14' },
  { board:'AQA', level:'GCSE', subject:'Art & Design (Fine Art)', tier:'N/A', paper:1, paperName:'Portfolio & Externally Set Assignment', date:'Submit by 31 May 2027' },
  { board:'AQA', level:'GCSE', subject:'Art & Design (Art, Craft & Design)', tier:'N/A', paper:1, paperName:'Portfolio & Externally Set Assignment', date:'Submit by 31 May 2027' },
  { board:'AQA', level:'GCSE', subject:'Art & Design (Graphic Communication)', tier:'N/A', paper:1, paperName:'Portfolio & Externally Set Assignment', date:'Submit by 31 May 2027' },
  { board:'AQA', level:'GCSE', subject:'Art & Design (Textile Design)', tier:'N/A', paper:1, paperName:'Portfolio & Externally Set Assignment', date:'Submit by 31 May 2027' },
  { board:'AQA', level:'GCSE', subject:'Art & Design (Three-dimensional Design)', tier:'N/A', paper:1, paperName:'Portfolio & Externally Set Assignment', date:'Submit by 31 May 2027' },
  { board:'AQA', level:'GCSE', subject:'Art & Design (Photography)', tier:'N/A', paper:1, paperName:'Portfolio & Externally Set Assignment', date:'Submit by 31 May 2027' },
]

export const EXAM_DATES_2027 = [...GCSE_2027]

// subjects.js only offers 'WJEC' as a pickable board (see its audit notes — 'Eduqas' and 'WJEC'
// are meant to resolve to the same data, same as topics.js's BOARD_ALIASES), but every entry in
// this file is stored under 'Eduqas'. Without this alias, a WJEC-board student matched zero exam
// dates for every subject at every level — not a mixing bug, but the opposite failure (silently
// empty), which is just as much a case of the app getting a board wrong.
const EXAM_BOARD_ALIASES = { 'WJEC': 'Eduqas', 'wjec': 'Eduqas', 'eduqas': 'Eduqas' }
function resolveExamBoard(board) {
  return EXAM_BOARD_ALIASES[board] || board
}

// `year` defaults to 2026 so every existing call site (which doesn't pass it) keeps returning
// exactly what it always did — this is additive, not a breaking change to the function signature.
function datasetForYear(year) {
  return year === 2027 ? EXAM_DATES_2027 : EXAM_DATES_2026
}

export function getExamDates(subject, board, tier, level, year = 2026) {
  const boardKey = resolveExamBoard(board)
  return datasetForYear(year).filter(e =>
    e.subject === subject &&
    e.board   === boardKey &&
    (!level || e.level === level) &&
    (tier === 'N/A' || !tier || e.tier === tier || e.tier === 'N/A')
  )
}

export function getExamDate(subject, board, tier, paper, level, year = 2026) {
  const boardKey = resolveExamBoard(board)
  const match = datasetForYear(year).find(e =>
    e.subject === subject &&
    e.board   === boardKey &&
    e.paper   === paper &&
    (!level || e.level === level) &&
    (tier === 'N/A' || !tier || e.tier === tier || e.tier === 'N/A')
  )
  return match?.date || null
}

export function getAllSubjectsForBoard(board, level, year = 2026) {
  const boardKey = resolveExamBoard(board)
  return [...new Set(
    datasetForYear(year)
      .filter(e => e.board === boardKey && (!level || e.level === level))
      .map(e => e.subject)
  )].sort()
}
