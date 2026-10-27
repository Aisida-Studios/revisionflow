// src/data/examDates2026.js
// 2026 GCSE, AS-Level and A-Level exam dates — all major UK boards
// Sources: AQA, Edexcel, OCR, WJEC/Eduqas, CCEA published timetables
// Note: Some dates are confirmed, others estimated from typical timetabling patterns

// TIERED_SUBJECTS/isTiered now live in subjects.js — this used to be its own, separately
// maintained list here (and a third one in paperDatabase.js) which had drifted out of sync with
// each other. Re-exported here so existing imports of `isTiered` from this file keep working.
export { TIERED_SUBJECTS, isTiered } from './subjects'
import { canonicalBoard } from './boards'

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
    "paper": 3,
    "paperName": "Reading (F/H)",
    "date": "2026-06-03"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Bengali",
    "tier": "N/A",
    "paper": 4,
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
    "subject": "Mandarin Chinese",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening (F/H)",
    "date": "2026-05-11"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Mandarin Chinese",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Reading (F/H)",
    "date": "2026-05-11"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Mandarin Chinese",
    "tier": "N/A",
    "paper": 4,
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
    "subject": "Design & Technology",
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
    "subject": "Food Preparation & Nutrition",
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
    "paper": 3,
    "paperName": "Reading (F/H)",
    "date": "2026-05-20"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "French",
    "tier": "N/A",
    "paper": 4,
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
    "paper": 3,
    "paperName": "Reading (F/H)",
    "date": "2026-05-07"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "German",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Writing (F/H)",
    "date": "2026-05-14"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Understanding the Modern World (2h combined – options 1A+1B)",
    "date": "2026-05-15"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Shaping the Nation (2h combined – options 2A+2B)",
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
    "paper": 3,
    "paperName": "Reading (F/H)",
    "date": "2026-05-22"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Italian",
    "tier": "N/A",
    "paper": 4,
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
    "paper": 4,
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
    "paper": 4,
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
    "paper": 4,
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
    "date": "2026-05-18"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening (F/H)",
    "date": "2026-06-09"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Reading (F/H)",
    "date": "2026-06-09"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Writing (F/H)",
    "date": "2026-06-16"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Statistics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2026-06-02"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Statistics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2026-06-12"
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
    "paper": 2,
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
    "date": "2026-06-12"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Mandarin Chinese",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening (F/H)",
    "date": "2026-05-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Mandarin Chinese",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading (F/H)",
    "date": "2026-05-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Mandarin Chinese",
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
    "date": "2026-06-12"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Combined Science",
    "tier": "N/A",
    "paper": 6,
    "paperName": "Paper 6: Physics 2 (F/H)",
    "date": "2026-06-15"
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
    "paperName": "Paper 3: People & Environment Issues – Making Decisions",
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
    "paper": 2,
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
    "date": "2026-06-15"
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
    "paperName": "Paper 1: Area of Study 1 – Study of Religion",
    "date": "2026-05-12"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Religious Studies A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Area of Study 2 – Study of Second Religion",
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
    "date": "2026-06-16"
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
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Biology A",
    "tier": "Foundation",
    "paper": 1,
    "paperName": "Paper 1 (Foundation)",
    "date": "2026-05-12"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Biology A",
    "tier": "Foundation",
    "paper": 2,
    "paperName": "Paper 2 (Foundation)",
    "date": "2026-06-08"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Biology A",
    "tier": "Higher",
    "paper": 3,
    "paperName": "Paper 3 (Higher)",
    "date": "2026-05-12"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Biology A",
    "tier": "Higher",
    "paper": 4,
    "paperName": "Paper 4 (Higher)",
    "date": "2026-06-08"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Biology B",
    "tier": "Foundation",
    "paper": 1,
    "paperName": "Breadth in Biology (Foundation)",
    "date": "2026-05-12"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Biology B",
    "tier": "Foundation",
    "paper": 2,
    "paperName": "Depth in Biology (Foundation)",
    "date": "2026-06-08"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Biology B",
    "tier": "Higher",
    "paper": 3,
    "paperName": "Breadth in Biology (Higher)",
    "date": "2026-05-12"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Biology B",
    "tier": "Higher",
    "paper": 4,
    "paperName": "Depth in Biology (Higher)",
    "date": "2026-06-08"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Business 1: Business Activity, Marketing and People",
    "date": "2026-05-11"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Business",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Business 2: Operations, Finance and Influences on Business",
    "date": "2026-05-21"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Chemistry A",
    "tier": "Foundation",
    "paper": 1,
    "paperName": "Paper 1 (Foundation)",
    "date": "2026-05-18"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Chemistry A",
    "tier": "Foundation",
    "paper": 2,
    "paperName": "Paper 2 (Foundation)",
    "date": "2026-06-12"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Chemistry A",
    "tier": "Higher",
    "paper": 3,
    "paperName": "Paper 3 (Higher)",
    "date": "2026-05-18"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Chemistry A",
    "tier": "Higher",
    "paper": 4,
    "paperName": "Paper 4 (Higher)",
    "date": "2026-06-12"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Chemistry B",
    "tier": "Foundation",
    "paper": 1,
    "paperName": "Breadth in Chemistry (Foundation)",
    "date": "2026-05-18"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Chemistry B",
    "tier": "Foundation",
    "paper": 2,
    "paperName": "Depth in Chemistry (Foundation)",
    "date": "2026-06-12"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Chemistry B",
    "tier": "Higher",
    "paper": 3,
    "paperName": "Breadth in Chemistry (Higher)",
    "date": "2026-05-18"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Chemistry B",
    "tier": "Higher",
    "paper": 4,
    "paperName": "Depth in Chemistry (Higher)",
    "date": "2026-06-12"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "Foundation",
    "paper": 1,
    "paperName": "Paper 1 Biology (Foundation)",
    "date": "2026-05-12"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "Foundation",
    "paper": 3,
    "paperName": "Paper 3 Chemistry (Foundation)",
    "date": "2026-05-18"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "Foundation",
    "paper": 5,
    "paperName": "Paper 5 Physics (Foundation)",
    "date": "2026-06-02"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "Foundation",
    "paper": 2,
    "paperName": "Paper 2 Biology (Foundation)",
    "date": "2026-06-08"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "Foundation",
    "paper": 4,
    "paperName": "Paper 4 Chemistry (Foundation)",
    "date": "2026-06-12"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "Foundation",
    "paper": 6,
    "paperName": "Paper 6 Physics (Foundation)",
    "date": "2026-06-15"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "Higher",
    "paper": 7,
    "paperName": "Paper 7 Biology (Higher)",
    "date": "2026-05-12"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "Higher",
    "paper": 9,
    "paperName": "Paper 9 Chemistry (Higher)",
    "date": "2026-05-18"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "Higher",
    "paper": 11,
    "paperName": "Paper 11 Physics (Higher)",
    "date": "2026-06-02"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "Higher",
    "paper": 8,
    "paperName": "Paper 8 Biology (Higher)",
    "date": "2026-06-08"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "Higher",
    "paper": 10,
    "paperName": "Paper 10 Chemistry (Higher)",
    "date": "2026-06-12"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "Higher",
    "paper": 12,
    "paperName": "Paper 12 Physics (Higher)",
    "date": "2026-06-15"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science B",
    "tier": "Foundation",
    "paper": 1,
    "paperName": "Biology (Foundation)",
    "date": "2026-05-12"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science B",
    "tier": "Foundation",
    "paper": 2,
    "paperName": "Chemistry (Foundation)",
    "date": "2026-05-18"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science B",
    "tier": "Foundation",
    "paper": 3,
    "paperName": "Physics (Foundation)",
    "date": "2026-06-02"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science B",
    "tier": "Foundation",
    "paper": 4,
    "paperName": "Combined Science (Foundation)",
    "date": "2026-06-08"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science B",
    "tier": "Higher",
    "paper": 5,
    "paperName": "Biology (Higher)",
    "date": "2026-05-12"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science B",
    "tier": "Higher",
    "paper": 6,
    "paperName": "Chemistry (Higher)",
    "date": "2026-05-18"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science B",
    "tier": "Higher",
    "paper": 7,
    "paperName": "Physics (Higher)",
    "date": "2026-06-02"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science B",
    "tier": "Higher",
    "paper": 8,
    "paperName": "Combined Science (Higher)",
    "date": "2026-06-08"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Computer Systems (J277/01)",
    "date": "2026-05-13"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Computational Thinking, Algorithms and Programming (J277/02)",
    "date": "2026-05-19"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Design & Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Principles of Design and Technology",
    "date": "2026-06-10"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Drama",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Drama: Performance and Response",
    "date": "2026-05-08"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Introduction to Economics",
    "date": "2026-05-08"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "National and International Economics",
    "date": "2026-05-22"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Communicating Information and Ideas (J351/01)",
    "date": "2026-05-21"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Exploring Effects and Impact (J351/02)",
    "date": "2026-06-05"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Exploring Modern and Literary Heritage Texts (J352/01)",
    "date": "2026-05-11"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Exploring Poetry and Shakespeare (J352/02)",
    "date": "2026-05-19"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Food Preparation & Nutrition",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Food Preparation & Nutrition (J309/01)",
    "date": "2026-06-11"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Geography A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Living in the UK Today (J383/01)",
    "date": "2026-05-13"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Geography A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "The World Around Us (J383/02)",
    "date": "2026-06-03"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Geography A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Geographical Skills (J383/03)",
    "date": "2026-06-11"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Geography B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Our Natural World (J384/01)",
    "date": "2026-05-13"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Geography B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "People and Society (J384/02)",
    "date": "2026-06-03"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Geography B",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Geographical Exploration (J384/03)",
    "date": "2026-06-11"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "History A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Period Study with Non-British Depth Study (J410/01-07)",
    "date": "2026-05-15"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "History A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Thematic Study (J410/08-10)",
    "date": "2026-06-04"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "History A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "British Depth Study with Historic Environment (J410/11-13)",
    "date": "2026-06-09"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "History B (Schools History Project)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "British History — Thematic Study and Depth Study (J411/11-19)",
    "date": "2026-06-04"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "History B (Schools History Project)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "History Around Us (J411/21)",
    "date": "2026-05-15"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "History B (Schools History Project)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "World History — Period Study and Depth Study (J411/31-39)",
    "date": "2026-06-09"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "Foundation",
    "paper": 1,
    "paperName": "Paper 1 Foundation (Calculator) J560/01",
    "date": "2026-05-14"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "Foundation",
    "paper": 2,
    "paperName": "Paper 2 Foundation (Non-Calculator) J560/02",
    "date": "2026-06-03"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "Foundation",
    "paper": 3,
    "paperName": "Paper 3 Foundation (Calculator) J560/03",
    "date": "2026-06-10"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "Higher",
    "paper": 4,
    "paperName": "Paper 4 Higher (Calculator) J560/04",
    "date": "2026-05-14"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "Higher",
    "paper": 5,
    "paperName": "Paper 5 Higher (Non-Calculator) J560/05",
    "date": "2026-06-03"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "Higher",
    "paper": 6,
    "paperName": "Paper 6 Higher (Calculator) J560/06",
    "date": "2026-06-10"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Television and Promoting Media (J200/01)",
    "date": "2026-05-18"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Music and News (J200/02)",
    "date": "2026-06-02"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Music",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening and Appraising (J536/05)",
    "date": "2026-06-05"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Physical Factors Affecting Performance (J587/01)",
    "date": "2026-05-22"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Socio-cultural Issues and Sports Psychology (J587/02)",
    "date": "2026-06-01"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physics A",
    "tier": "Foundation",
    "paper": 1,
    "paperName": "Paper 1 (Foundation) J249/01",
    "date": "2026-06-02"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physics A",
    "tier": "Foundation",
    "paper": 2,
    "paperName": "Paper 2 (Foundation) J249/02",
    "date": "2026-06-15"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physics A",
    "tier": "Higher",
    "paper": 3,
    "paperName": "Paper 3 (Higher) J249/03",
    "date": "2026-06-02"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physics A",
    "tier": "Higher",
    "paper": 4,
    "paperName": "Paper 4 (Higher) J249/04",
    "date": "2026-06-15"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physics B",
    "tier": "Foundation",
    "paper": 1,
    "paperName": "Breadth in Physics (Foundation) J259/01",
    "date": "2026-06-02"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physics B",
    "tier": "Foundation",
    "paper": 2,
    "paperName": "Depth in Physics (Foundation) J259/02",
    "date": "2026-06-15"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physics B",
    "tier": "Higher",
    "paper": 3,
    "paperName": "Breadth in Physics (Higher) J259/03",
    "date": "2026-06-02"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physics B",
    "tier": "Higher",
    "paper": 4,
    "paperName": "Depth in Physics (Higher) J259/04",
    "date": "2026-06-15"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Studies and Applications in Psychology 1 (J203/01)",
    "date": "2026-05-07"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Studies and Applications in Psychology 2 (J203/02)",
    "date": "2026-05-14"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Beliefs, Teachings and Practices (J625/01-05)",
    "date": "2026-05-12"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Religion, Philosophy and Ethics in the Modern World (J625/06-10)",
    "date": "2026-05-20"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2026-05-12"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2026-06-08"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2026-05-11"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Business",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2026-05-21"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2026-05-18"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2026-06-12"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Written (C500U10-1)",
    "date": "2026-05-13"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: On Screen (C500U20-1)",
    "date": "2026-05-19"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Design & Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1 (C600U10-1)",
    "date": "2026-06-10"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: 21st Century Literature Reading and Creative Prose Writing",
    "date": "2026-05-21"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: 19th and 21st Century Non-Fiction Reading and Transactional Writing",
    "date": "2026-06-05"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Shakespeare and Poetry (C720U10-1)",
    "date": "2026-05-11"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Drama, Prose and Unseen Poetry (C720U20-1)",
    "date": "2026-05-19"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Film Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Varieties of Film and Filmmaking (C670U10-1)",
    "date": "2026-05-07"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Film Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Global Filmmaking Perspectives (C670U20-1)",
    "date": "2026-05-21"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Food Preparation & Nutrition",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Written Examination (C560UA0-1)",
    "date": "2026-06-11"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Geography A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Changing Places — Changing World (C111U10-1)",
    "date": "2026-05-12"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Geography A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Sustaining the Planet (C111U20-1)",
    "date": "2026-06-03"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Geography A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3: Distinctive Landscapes (C111U30-1)",
    "date": "2026-06-11"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Geography B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Our Changing World (C112U10-1)",
    "date": "2026-05-12"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Geography B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Our Dynamic Planet (C112U20-1)",
    "date": "2026-06-03"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Geography B",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3: Environmental Challenges (C112U30-1)",
    "date": "2026-06-11"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Studies in Depth (C100U10-1)",
    "date": "2026-05-14"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Studies in Breadth (C100U20-1)",
    "date": "2026-06-03"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "Foundation",
    "paper": 1,
    "paperName": "Component 1 Foundation (C300U10-1)",
    "date": "2026-05-14"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "Foundation",
    "paper": 2,
    "paperName": "Component 2 Foundation (C300U20-1)",
    "date": "2026-06-03"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "Higher",
    "paper": 1,
    "paperName": "Component 1 Higher (C300UA0-1)",
    "date": "2026-05-14"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "Higher",
    "paper": 2,
    "paperName": "Component 2 Higher (C300UB0-1)",
    "date": "2026-06-03"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Exploring the Media (C680U10-1)",
    "date": "2026-05-18"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Understanding Media Forms and Products (C680U20-1)",
    "date": "2026-06-02"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Music",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 3: Appraising (C660U30-1)",
    "date": "2026-06-05"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Physical Factors Affecting Performance (C550U10-1)",
    "date": "2026-05-22"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2026-06-02"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2026-06-15"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Religious, Philosophical and Ethical Studies (C120U10-1)",
    "date": "2026-05-12"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Study of Christianity (C120U20-1)",
    "date": "2026-05-20"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3: Study of Second Religion (C120U30-70)",
    "date": "2026-06-01"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Understanding Social Structures (C200U10-1)",
    "date": "2026-05-08"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Understanding Social Processes (C200U20-1)",
    "date": "2026-05-15"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1: Cells, Living Processes and Biodiversity",
    "date": "2026-05-12"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2: Body Systems, Ecology and the Environment",
    "date": "2026-06-08"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1: Basic Concepts in Chemistry",
    "date": "2026-05-18"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2: Further Chemical Reactions, Rates and Equilibrium, Calculations and Organic Chemistry",
    "date": "2026-06-11"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Double Award Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2026-05-12"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Double Award Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2026-05-18"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Double Award Science",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unit 3",
    "date": "2026-06-02"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Double Award Science",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Unit 4",
    "date": "2026-06-12"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1: Talking and Listening (Speaking and Listening moderated separately)",
    "date": "2026-05-07"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Unit 4: Writing for Purpose and Audience",
    "date": "2026-05-21"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1: The Study of Prose",
    "date": "2026-05-11"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2: The Study of Poetry and Drama",
    "date": "2026-05-28"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1: Understanding Our Natural World",
    "date": "2026-05-13"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2: Living in Our World",
    "date": "2026-05-25"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unit 3: Fieldwork",
    "date": "2026-06-05"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1: Changes in Germany 1919-45 and The USA 1918-68",
    "date": "2026-05-15"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2: Northern Ireland and its Neighbours",
    "date": "2026-06-04"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "Foundation",
    "paper": 1,
    "paperName": "Unit T1: Foundation Paper 1 (Non-Calculator)",
    "date": "2026-05-14"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "Foundation",
    "paper": 2,
    "paperName": "Unit T2: Foundation Paper 2 (Calculator)",
    "date": "2026-06-03"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "Higher",
    "paper": 3,
    "paperName": "Unit T3: Higher Paper 1 (Non-Calculator)",
    "date": "2026-05-14"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "Higher",
    "paper": 4,
    "paperName": "Unit T4: Higher Paper 2 (Calculator)",
    "date": "2026-06-03"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "Higher",
    "paper": 5,
    "paperName": "Unit T5: Higher Paper 3 (Calculator)",
    "date": "2026-06-10"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1: Forces, Energy and Electricity",
    "date": "2026-05-22"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2: Waves, Particles and the Universe",
    "date": "2026-06-15"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1: The Christian Church",
    "date": "2026-05-12"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2: Christianity in the Local and Global Community",
    "date": "2026-05-20"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Business Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1: The Business Environment",
    "date": "2026-05-11"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Business Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2: Business Growth and Development",
    "date": "2026-05-21"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Digital Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1: Digital Technology Core",
    "date": "2026-06-01"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Digital Technology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2: Multimedia or Programming (route-dependent)",
    "date": "2026-06-01"
  },
  
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Technology and Design",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1: Technology and Design Core",
    "date": "2026-05-28"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Technology and Design",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2: Designing and Making (option A/B/C)",
    "date": "2026-06-10"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Modern Hebrew",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Reading (F/H)",
    "date": "2026-06-10"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Panjabi",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Reading (F/H)",
    "date": "2026-06-02"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Polish",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Reading (F/H)",
    "date": "2026-06-02"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Urdu",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening (F/H)",
    "date": "2026-05-18"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Urdu",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Reading (F/H)",
    "date": "2026-05-18"
  },
  {
    "board": "AQA",
    "level": "GCSE",
    "subject": "Urdu",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Writing (F/H)",
    "date": "2026-06-02"
  }
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
    "subject": "Art & Design (Art, Craft & Design)",
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
    "subject": "Design and Technology: Product Design",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2026-05-22"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Design and Technology: Product Design",
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
    "date": "2026-05-21"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (optional route)",
    "date": "2026-06-05"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3 (optional route)",
    "date": "2026-06-12"
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
    "date": "2026-05-14"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2026-06-04"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Modern Hebrew",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Reading & Writing",
    "date": "2026-05-20"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Modern Hebrew",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Writing",
    "date": "2026-06-04"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Modern Hebrew",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, Reading and Writing",
    "date": "2026-06-15"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Music",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening paper + Composition NEA + Performance NEA",
    "date": "2026-06-08"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Panjabi",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Reading & Writing",
    "date": "2026-05-20"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Panjabi",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Writing",
    "date": "2026-06-01"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Panjabi",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, Reading and Writing",
    "date": "2026-06-12"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Philosophy",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Epistemology & Moral Philosophy",
    "date": "2026-05-12"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Philosophy",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Metaphysics & Philosophy of Mind/Religion",
    "date": "2026-05-19"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Factors Affecting Participation",
    "date": "2026-05-21"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Factors Affecting Optimal Performance",
    "date": "2026-06-01"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2026-05-20"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2026-06-01"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3 (Practical Skills + Options)",
    "date": "2026-06-08"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Polish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Reading & Writing",
    "date": "2026-05-21"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Polish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Writing",
    "date": "2026-06-01"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Polish",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, Reading and Writing",
    "date": "2026-06-09"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: UK Politics & Core Political Ideas",
    "date": "2026-05-21"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Comparative Politics — Government and Politics of the USA",
    "date": "2026-06-08"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Political Ideas",
    "date": "2026-06-16"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Introductory Topics",
    "date": "2026-05-15"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Psychology in Context",
    "date": "2026-05-20"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Issues & Options",
    "date": "2026-06-05"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Philosophy of Religion and Ethics (7062/1 — single combined component; see note below)",
    "date": "2026-06-04"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Philosophy of Religion and Ethics (7062/1 — same real exam date/paper as Paper 1 above; AQA's actual spec has ONE combined philosophy+ethics component, not two — kept as separate app-internal slots for now, both correctly dated)",
    "date": "2026-06-04"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Study of Religion and Dialogues — choice of Buddhism/Christianity/Hinduism/Islam/Judaism (7062/2)",
    "date": "2026-06-09"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Education + Theory & Methods",
    "date": "2026-05-18"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Topics in Sociology",
    "date": "2026-06-03"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Crime & Deviance + Theory & Methods",
    "date": "2026-06-12"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening, Reading & Writing",
    "date": "2026-06-04"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Writing",
    "date": "2026-06-12"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Biology A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Biological Processes (H420/01)",
    "date": "2026-06-04"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Biology A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Biological Diversity (H420/02)",
    "date": "2026-06-12"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Biology A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unified Biology (H420/03)",
    "date": "2026-06-16"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Biology B (Advancing Biology)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Fundamentals of Biology (H422/01)",
    "date": "2026-06-04"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Biology B (Advancing Biology)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Scientific Literacy in Biology (H422/02)",
    "date": "2026-06-12"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Biology B (Advancing Biology)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Practical Skills in Biology (H422/03)",
    "date": "2026-06-16"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Operating in a Local Business Environment (H431/01)",
    "date": "2026-05-13"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 2,
    "paperName": "The UK Business Environment (H431/02)",
    "date": "2026-05-19"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 3,
    "paperName": "The Global Business Environment (H431/03)",
    "date": "2026-06-09"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Chemistry A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Periodic Table, Elements and Physical Chemistry (H432/01)",
    "date": "2026-06-02"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Chemistry A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Synthesis and Analytical Techniques (H432/02)",
    "date": "2026-06-09"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Chemistry A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unified Chemistry (H432/03)",
    "date": "2026-06-15"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Chemistry B (Salters)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Fundamentals of Chemistry (H433/01)",
    "date": "2026-06-02"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Chemistry B (Salters)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Scientific Literacy in Chemistry (H433/02)",
    "date": "2026-06-09"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Chemistry B (Salters)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Practical Skills in Chemistry (H433/03)",
    "date": "2026-06-15"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Computer Systems (H446/01)",
    "date": "2026-06-10"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Algorithms and Programming (H446/02)",
    "date": "2026-06-17"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Microeconomics (H460/01)",
    "date": "2026-05-11"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Macroeconomics (H460/02)",
    "date": "2026-05-18"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Themes in Economics (H460/03)",
    "date": "2026-06-04"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Exploring Language (H470/01)",
    "date": "2026-05-11"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Dimensions of Linguistic Variation (H470/02)",
    "date": "2026-05-22"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Drama and Poetry Pre-1900 (H472/01)",
    "date": "2026-05-13"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Comparative and Contextual Study (H472/02)",
    "date": "2026-06-01"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Film Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Film History (H410/01)",
    "date": "2026-05-22"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Film Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Critical Approaches to Film (H410/02)",
    "date": "2026-06-02"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Physical Systems (H481/01)",
    "date": "2026-05-12"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Human Interactions (H481/02)",
    "date": "2026-05-21"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Geographical Debates (H481/03)",
    "date": "2026-06-08"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "History A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Thematic Study and Historical Interpretations (H505/Y301)",
    "date": "2026-05-19"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "History A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "British Period Study and Enquiry (H505/Y101)",
    "date": "2026-06-02"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "History A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Non-British Period Study (H505/Y201)",
    "date": "2026-06-11"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 1,
    "paperName": "The Legal System and Criminal Law (H418/01)",
    "date": "2026-05-21"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Law Making and the Law of Tort (H418/02)",
    "date": "2026-06-01"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 3,
    "paperName": "The Nature of Law and Human Rights or Contract (H418/03-04)",
    "date": "2026-06-09"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Mathematics A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Pure Mathematics (H240/01)",
    "date": "2026-06-03"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Mathematics A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Pure Mathematics and Statistics (H240/02)",
    "date": "2026-06-11"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Mathematics A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Pure Mathematics and Mechanics (H240/03)",
    "date": "2026-06-18"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Pure Mathematics and Mechanics (H640/01)",
    "date": "2026-06-03"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Pure Mathematics and Statistics (H640/02)",
    "date": "2026-06-11"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Pure Mathematics and Comprehension (H640/03)",
    "date": "2026-06-18"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Media Messages (H409/01)",
    "date": "2026-05-14"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Evolving Media (H409/02)",
    "date": "2026-06-04"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Physiological Factors Affecting Performance (H555/01)",
    "date": "2026-05-21"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Psychological Factors Affecting Performance (H555/02)",
    "date": "2026-06-01"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Socio-cultural Issues in Physical Activity and Sport (H555/03)",
    "date": "2026-06-16"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physics A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Modelling Physics (H556/01)",
    "date": "2026-05-20"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physics A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Exploring Physics (H556/02)",
    "date": "2026-06-01"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physics A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unified Physics (H556/03)",
    "date": "2026-06-08"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physics B (Advancing Physics)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Fundamentals of Physics (H557/01)",
    "date": "2026-05-20"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physics B (Advancing Physics)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Scientific Literacy in Physics (H557/02)",
    "date": "2026-06-01"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physics B (Advancing Physics)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Practical Skills in Physics (H557/03)",
    "date": "2026-06-08"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Research Methods (H567/01)",
    "date": "2026-05-15"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Psychological Themes Through Core Studies (H567/02)",
    "date": "2026-05-20"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Applied Psychology (H567/03)",
    "date": "2026-06-05"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Philosophy of Religion (H573/01)",
    "date": "2026-06-04"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Religion and Ethics (H573/02)",
    "date": "2026-06-09"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Developments in Christian Thought (H573/03)",
    "date": "2026-06-15"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Socialisation, Culture and Identity (H580/01)",
    "date": "2026-05-18"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Researching and Understanding Social Inequalities (H580/02)",
    "date": "2026-06-03"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Debates in Contemporary Society (H580/03)",
    "date": "2026-06-12"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Energy, Homeostasis and the Environment (A400U10-1)",
    "date": "2026-06-04"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Continuity and Change (A400U20-1)",
    "date": "2026-06-12"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3: Organisms and Environments (A400U30-1)",
    "date": "2026-06-15"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Business Opportunities and Functions (A510U10-1)",
    "date": "2026-05-13"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Business Analysis and Strategy (A510U20-1)",
    "date": "2026-05-19"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3: Business in a Changing World (A510U30-1)",
    "date": "2026-06-09"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Physical and Inorganic Chemistry (A410U10-1)",
    "date": "2026-06-02"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Organic Chemistry and Analysis (A410U20-1)",
    "date": "2026-06-08"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3: Physical Chemistry and Practical Skills (A410U30-1)",
    "date": "2026-06-15"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Computer Architecture, Data, Communication and Applications (A500U10-1)",
    "date": "2026-06-10"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Algorithms and Programming (A500U20-1)",
    "date": "2026-06-17"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Microeconomics (A520U10-1)",
    "date": "2026-05-11"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Macroeconomics (A520U20-1)",
    "date": "2026-05-18"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3: Microeconomics and Macroeconomics (A520U30-1)",
    "date": "2026-06-04"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Language in Context (A700U10-1)",
    "date": "2026-05-11"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Language Investigation and Creative Writing (A700U20-1)",
    "date": "2026-05-22"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3: Language, Power and Identity (A700U30-1)",
    "date": "2026-06-03"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Poetry (A720U10-1)",
    "date": "2026-05-13"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Drama (A720U20-1)",
    "date": "2026-06-01"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3: Prose (A720U30-1)",
    "date": "2026-06-10"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Changing Landscapes (A110U10-1)",
    "date": "2026-05-12"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Changing Places (A110U20-1)",
    "date": "2026-05-21"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3: Global Systems and Global Governance (A110U30-1)",
    "date": "2026-06-08"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: The Nature of Law and the English Legal System (A150U10-1)",
    "date": "2026-05-21"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: The Law of Obligations (A150U20-1)",
    "date": "2026-06-01"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3: Human Rights Law (A150U30-1)",
    "date": "2026-06-09"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Media Products, Industries and Audiences (A680U10-1)",
    "date": "2026-05-14"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Media Forms and Products in Depth (A680U20-1)",
    "date": "2026-06-04"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Anatomy, Physiology, Biomechanics (A550U10-1)",
    "date": "2026-05-21"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Psychology and Socio-cultural Issues (A550U20-1)",
    "date": "2026-06-01"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Newtonian Physics (A420U10-1)",
    "date": "2026-05-20"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Electromagnetism and Light (A420U20-1)",
    "date": "2026-06-01"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3: Oscillations and Nuclei (A420U30-1)",
    "date": "2026-06-08"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Memories, Thinking, Social Behaviour and Diversity (A290U10-1)",
    "date": "2026-05-15"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Behaviour, Alternatives, Research (A290U20-1)",
    "date": "2026-05-20"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3: Applied and Issues (A290U30-1)",
    "date": "2026-06-05"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Introduction to the Study of Religion (A120U10-1)",
    "date": "2026-06-04"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: The Study of Religion (A120U20-1)",
    "date": "2026-06-09"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3: Applied Study of Religion (A120U30-1)",
    "date": "2026-06-15"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Socialisation and Identity (A200U10-1)",
    "date": "2026-05-18"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Understanding Social Processes (A200U20-1)",
    "date": "2026-06-03"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3: Social Change (A200U30-1)",
    "date": "2026-06-12"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1: Molecules and Cells",
    "date": "2026-05-08"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2: Organisms and Biodiversity",
    "date": "2026-05-21"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "A2 Unit 1: Physiology, Coordination and Control",
    "date": "2026-06-01"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 4,
    "paperName": "A2 Unit 2: Biochemistry, Genetics and Evolutionary Trends",
    "date": "2026-06-12"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1: Basic Concepts in Physical and Inorganic Chemistry",
    "date": "2026-05-12"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2: Further Physical and Organic Chemistry",
    "date": "2026-05-19"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 3,
    "paperName": "A2 Unit 1: Further Physical and Inorganic Chemistry",
    "date": "2026-05-25"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 4,
    "paperName": "A2 Unit 2: Analytical, Transition Metals, Electrochemistry and Organic Nitrogen",
    "date": "2026-06-10"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1: Pure Mathematics with Mechanics",
    "date": "2026-05-14"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2: Pure Mathematics with Statistics",
    "date": "2026-05-22"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "A2 Unit 1: Pure Mathematics",
    "date": "2026-05-28"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 4,
    "paperName": "A2 Unit 2: Pure Mathematics with Mechanics or Statistics",
    "date": "2026-06-03"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1: Forces, Energy and Electricity",
    "date": "2026-05-13"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2: Waves, Photons and Medical Physics",
    "date": "2026-05-20"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "A2 Unit 1: Momentum, Thermal Physics, Circular Motion, Oscillations and Atomic Physics",
    "date": "2026-05-18"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 4,
    "paperName": "A2 Unit 2: Fields, Capacitors and Particle Physics",
    "date": "2026-06-08"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1: Change Over Time",
    "date": "2026-05-13"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2: Dictatorship and Democracy",
    "date": "2026-05-18"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 3,
    "paperName": "A2 Unit 1: Breadth Study",
    "date": "2026-05-19"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 4,
    "paperName": "A2 Unit 2: Historical Investigation",
    "date": "2026-06-02"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1: Physical Geography I",
    "date": "2026-05-12"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2: Human Geography I",
    "date": "2026-05-20"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 3,
    "paperName": "AS Unit 3: Fieldwork Report",
    "date": "2026-05-26"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 4,
    "paperName": "A2 Unit 1: Physical Geography II",
    "date": "2026-05-21"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 5,
    "paperName": "A2 Unit 2: Human Geography II",
    "date": "2026-05-29"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 6,
    "paperName": "A2 Unit 3: Decision-Making Exercise",
    "date": "2026-06-04"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Business Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1",
    "date": "2026-05-15"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Business Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2",
    "date": "2026-05-21"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Business Studies",
    "tier": "N/A",
    "paper": 3,
    "paperName": "A2 Unit 1",
    "date": "2026-05-27"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Business Studies",
    "tier": "N/A",
    "paper": 4,
    "paperName": "A2 Unit 2",
    "date": "2026-06-09"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Technology and Design",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS 1: Systems and Control (Core)",
    "date": "2026-05-11"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Technology and Design",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 1",
    "date": "2026-05-22"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Arabic",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Translation into English, reading comprehension and writing (research question) in Arabic",
    "date": "2026-05-19"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Arabic",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Translation into Arabic and written response to works",
    "date": "2026-06-01"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Arabic",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, reading and writing in Arabic",
    "date": "2026-06-11"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology A (Salters Nuffield)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: The Natural Environment and Species Survival",
    "date": "2026-06-04"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology A (Salters Nuffield)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Energy, Exercise and Co-ordination",
    "date": "2026-06-12"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology A (Salters Nuffield)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: General and Practical Applications in Biology",
    "date": "2026-06-16"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Advanced Biochemistry, Microbiology and Genetics",
    "date": "2026-06-04"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Advanced Physiology, Evolution and Ecology",
    "date": "2026-06-12"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology B",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: General and Practical Principles in Biology",
    "date": "2026-06-16"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Marketing, people and global businesses",
    "date": "2026-05-13"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Business activities, decisions and strategy",
    "date": "2026-05-19"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Investigating business in a competitive environment",
    "date": "2026-06-09"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Advanced Inorganic and Physical Chemistry",
    "date": "2026-06-02"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Advanced Organic and Physical Chemistry",
    "date": "2026-06-09"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: General and Practical Principles in Chemistry",
    "date": "2026-06-15"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Mandarin Chinese",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening, Reading and Translation",
    "date": "2026-05-19"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Mandarin Chinese",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Written response to works and translation",
    "date": "2026-06-01"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Design & Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Design and Technology (Product Design)",
    "date": "2026-05-22"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Drama and Theatre",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 3: Theatre Makers in Practice",
    "date": "2026-05-21"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Economics A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Markets and Business Behaviour",
    "date": "2026-05-11"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Economics A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: The National and Global Economy",
    "date": "2026-05-18"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Economics A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Microeconomics and Macroeconomics",
    "date": "2026-06-04"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Economics B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Markets and how they work",
    "date": "2026-05-11"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Economics B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Competing in the global economy",
    "date": "2026-05-18"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Economics B",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: The economic environment and business",
    "date": "2026-06-04"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Language Variation",
    "date": "2026-05-11"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Child Language",
    "date": "2026-05-22"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Investigating Language",
    "date": "2026-06-03"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Lang & Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Voices in Speech and Writing",
    "date": "2026-05-11"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Lang & Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Varieties in Language and Literature",
    "date": "2026-05-22"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Drama",
    "date": "2026-05-13"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Prose",
    "date": "2026-06-01"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Poetry",
    "date": "2026-06-10"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Core Pure Mathematics 1",
    "date": "2026-05-14"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Core Pure Mathematics 2",
    "date": "2026-05-21"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening, reading and translation",
    "date": "2026-06-08"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Written response to works and translation",
    "date": "2026-06-17"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Physical Geography",
    "date": "2026-05-12"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Human Geography",
    "date": "2026-05-21"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Geographical Investigation",
    "date": "2026-06-08"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening, reading and translation",
    "date": "2026-05-19"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Written response to works and translation",
    "date": "2026-06-02"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Greek",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Translation into English, reading comprehension and writing (research question) in Greek",
    "date": "2026-05-18"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Greek",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Translation into Greek and written response to works",
    "date": "2026-06-02"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Greek",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, reading and writing in Greek",
    "date": "2026-06-12"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Gujarati",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Translation into English, reading comprehension and writing (research question) in Gujarati",
    "date": "2026-05-20"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Gujarati",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Translation into Gujarati and written response to works",
    "date": "2026-06-02"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Gujarati",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, reading and writing in Gujarati",
    "date": "2026-06-11"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Breadth study with interpretations",
    "date": "2026-05-19"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Depth Study",
    "date": "2026-06-02"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Themes in breadth with aspects in depth",
    "date": "2026-06-11"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "History of Art",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Visual analysis and themes",
    "date": "2026-05-18"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "History of Art",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Periods",
    "date": "2026-06-02"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Italian",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening, reading and translation",
    "date": "2026-06-12"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Italian",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Written response to works and translation",
    "date": "2026-06-19"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Japanese",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Translation into English, reading comprehension and writing (research question)",
    "date": "2026-05-19"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Japanese",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Translation into Japanese and written response to works",
    "date": "2026-06-01"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Japanese",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, reading and writing",
    "date": "2026-06-11"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Pure Mathematics 1",
    "date": "2026-06-03"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Pure Mathematics 2",
    "date": "2026-06-11"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Statistics & Mechanics",
    "date": "2026-06-18"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Music",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 3: Appraising",
    "date": "2026-06-08"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Music Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 3: Listening and analysing",
    "date": "2026-05-22"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Music Technology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 4: Producing and analysing",
    "date": "2026-06-03"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Scientific Principles of Physical Education",
    "date": "2026-05-21"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Psychological and Social Principles of Physical Education",
    "date": "2026-06-01"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Advanced Physics I",
    "date": "2026-05-20"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Advanced Physics II",
    "date": "2026-06-01"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: General and Practical Principles in Physics",
    "date": "2026-06-08"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Persian",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Translation into English, reading comprehension and writing (research question) in Persian",
    "date": "2026-05-20"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Persian",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Translation into Persian and written response to works",
    "date": "2026-06-05"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Persian",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, reading and writing in Persian",
    "date": "2026-06-15"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: UK Politics and Core Political Ideas",
    "date": "2026-05-21"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: UK Government and Non-core Political Ideas",
    "date": "2026-06-08"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": "3A",
    "paperName": "Paper 3A: Comparative Politics - USA",
    "date": "2026-06-16"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": "3B",
    "paperName": "Paper 3B: Comparative Politics - Global Politics",
    "date": "2026-06-16"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Portuguese",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Translation into English, reading comprehension and writing (research question) in Portuguese",
    "date": "2026-05-22"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Portuguese",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Translation into Portuguese and written response to works",
    "date": "2026-06-01"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Portuguese",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, reading and writing in Portuguese",
    "date": "2026-06-11"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Foundations in Psychology",
    "date": "2026-05-15"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Applications of Psychology",
    "date": "2026-05-20"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Psychological Skills",
    "date": "2026-06-05"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Philosophy of Religion",
    "date": "2026-06-04"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Religion and Ethics",
    "date": "2026-06-09"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: New Testament Studies",
    "date": "2026-06-15"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Study of Religion",
    "date": "2026-06-22"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Russian",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening, reading and translation",
    "date": "2026-06-01"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Russian",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Written response to works and translation",
    "date": "2026-06-08"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening, reading and translation",
    "date": "2026-06-04"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Written response to works and translation",
    "date": "2026-06-12"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Statistics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Data and Probability",
    "date": "2026-06-04"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Statistics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Statistical Inference",
    "date": "2026-06-09"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Statistics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Statistics in Practice",
    "date": "2026-06-17"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Turkish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Translation into English, reading comprehension and writing (research question) in Turkish",
    "date": "2026-05-20"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Turkish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Translation into Turkish and written response to works",
    "date": "2026-06-02"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Turkish",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, reading and writing in Turkish",
    "date": "2026-06-11"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Urdu",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Translation into English, reading comprehension and writing (research question) in Urdu",
    "date": "2026-05-22"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Urdu",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Translation into Urdu and written response to works",
    "date": "2026-06-05"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Urdu",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, reading and writing in Urdu",
    "date": "2026-06-12"
  }
]

// ── CCEA AS-Level 2026 — genuinely separate entries, not merged into the A-Level list above.
// CCEA's AS content is architecturally the first half of its linear 4-unit A-Level (same units,
// same dates as "AS Unit 1/2" above), which is why an earlier version of this file deliberately
// left CCEA out of AS-Level entirely rather than duplicate data. In practice that meant a student
// with "CCEA AS-Level Biology" selected (a fully real, separately-trackable qualification that
// topics.js and subjects.js both already support) got zero results from getExamDates() — the
// dates existed, just tagged level:"A-Level" only. Duplicating the AS-unit dates here under
// level:"AS-Level" fixes that lookup without changing the A-Level entries above. All dates match
// the corresponding "AS Unit" rows above exactly, sourced from the same CCEA document.
const CCEA_ASLEVEL_2026 = [
  { "board": "CCEA", "level": "AS-Level", "subject": "Biology", "tier": "N/A", "paper": 1, "paperName": "AS Unit 1: Molecules and Cells", "date": "2026-05-08" },
  { "board": "CCEA", "level": "AS-Level", "subject": "Biology", "tier": "N/A", "paper": 2, "paperName": "AS Unit 2: Organisms and Biodiversity", "date": "2026-05-21" },
  { "board": "CCEA", "level": "AS-Level", "subject": "Chemistry", "tier": "N/A", "paper": 1, "paperName": "AS Unit 1: Basic Concepts in Physical and Inorganic Chemistry", "date": "2026-05-12" },
  { "board": "CCEA", "level": "AS-Level", "subject": "Chemistry", "tier": "N/A", "paper": 2, "paperName": "AS Unit 2: Further Physical and Organic Chemistry", "date": "2026-05-19" },
  { "board": "CCEA", "level": "AS-Level", "subject": "Mathematics", "tier": "N/A", "paper": 1, "paperName": "AS Unit 1: Pure Mathematics with Mechanics", "date": "2026-05-14" },
  { "board": "CCEA", "level": "AS-Level", "subject": "Mathematics", "tier": "N/A", "paper": 2, "paperName": "AS Unit 2: Pure Mathematics with Statistics", "date": "2026-05-22" },
  { "board": "CCEA", "level": "AS-Level", "subject": "Physics", "tier": "N/A", "paper": 1, "paperName": "AS Unit 1: Forces, Energy and Electricity", "date": "2026-05-13" },
  { "board": "CCEA", "level": "AS-Level", "subject": "Physics", "tier": "N/A", "paper": 2, "paperName": "AS Unit 2: Waves, Photons and Medical Physics", "date": "2026-05-20" },
  { "board": "CCEA", "level": "AS-Level", "subject": "History", "tier": "N/A", "paper": 1, "paperName": "AS Unit 1: Change Over Time", "date": "2026-05-13" },
  { "board": "CCEA", "level": "AS-Level", "subject": "History", "tier": "N/A", "paper": 2, "paperName": "AS Unit 2: Dictatorship and Democracy", "date": "2026-05-18" },
  { "board": "CCEA", "level": "AS-Level", "subject": "Geography", "tier": "N/A", "paper": 1, "paperName": "AS Unit 1: Physical Geography I", "date": "2026-05-12" },
  { "board": "CCEA", "level": "AS-Level", "subject": "Geography", "tier": "N/A", "paper": 2, "paperName": "AS Unit 2: Human Geography I", "date": "2026-05-20" },
  { "board": "CCEA", "level": "AS-Level", "subject": "Geography", "tier": "N/A", "paper": 3, "paperName": "AS Unit 3: Fieldwork Report", "date": "2026-05-26" },
]

// ─────────────────────────────────────────────────────────────────────────────
// AS-LEVEL 2026 — added so AS-Level is fully separate from A-Level everywhere.
// AS-Level is a standalone, decoupled qualification for AQA/Edexcel/OCR/Eduqas
// (does not contribute to a later A-Level grade — confirmed against JCQ/Ofqual
// and each board's own "About AS and A levels" pages). WJEC (Wales) keeps AS
// content embedded inside its A-Level unit structure, so no separate WJEC
// AS-Level entries are added here — selecting AS-Level for WJEC is intentionally
// left empty rather than guessed. CCEA ALSO keeps AS content embedded inside its
// A-Level unit structure (its AS units are the first half of a linear 4-unit
// A-Level) — but unlike WJEC, CCEA's AS is a real, separately-certificated,
// separately-selectable qualification in this app (see subjects.js/topics.js),
// so its AS Unit 1/2 dates are duplicated below under level:"AS-Level" (see
// CCEA_ASLEVEL_2026, sourced from the same CCEA document as the A-Level entries
// above) rather than left empty — leaving them empty would mean CCEA AS-Level
// students get zero exam dates even though the underlying dates are known.
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
  { "board": "Eduqas", "level": "AS-Level", "subject": "Psychology", "tier": "N/A", "paper": 1, "paperName": "Component 1", "date": "2026-05-11" },
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
  { board:'OCR', level:'Level 2', subject:'Cambridge National: Business', tier:'N/A', paper:1, paperName:'Exam Unit (R069)', date:'2026-05-15' },
  { board:'OCR', level:'Level 2', subject:'Cambridge National: IT', tier:'N/A', paper:1, paperName:'Exam Unit (R070)', date:'2026-05-22' },
  { board:'OCR', level:'Level 2', subject:'Cambridge National: Sport Science', tier:'N/A', paper:1, paperName:'Exam Unit (R041)', date:'2026-05-19' },
  { board:'OCR', level:'Level 2', subject:'Cambridge National: Health and Social Care', tier:'N/A', paper:1, paperName:'Exam Unit (R032)', date:'2026-05-20' },
  { board:'OCR', level:'Level 2', subject:'Cambridge National Creative Media', tier:'N/A', paper:1, paperName:'Exam Unit', date:'2026-06-03' },
]

export const EXAM_DATES_2026 = [...GCSE_2026, ...ASLEVEL_2026, ...CCEA_ASLEVEL_2026, ...ALEVEL_2026, ...L2_2026]

// ── 2027 EXAM DATES ──────────────────────────────────────────────────────────
// Source (AQA GCSE rows): AQA's official "Exam timetable May/June 2027 – GCSE, AQA Certificates, ELC and
// Projects", Version 1.2 (aqa.org.uk) — read in full and compared row by row on 2026-10-10. The document's
// own version control says it builds on the CONFIRMED timetable published in May 2026; v1.1 only moved a
// Physical Education submission date and v1.2 only moved the Level 2 Certificate in Further Mathematics
// Paper 1 to 09 June (PM). Every AQA GCSE row below matches it. The comparison is automated: see
// scripts/curriculum/inputs/official-timetables-2027.json and `npm run curriculum:validate`.
// Not included: NEA submission deadlines (except Art and Design), modern-foreign-language speaking-test
// windows, and AQA qualifications RevisionFlow has no dataset for (Bengali, Italian, Modern Hebrew, Panjabi).
//
// AQA AS-Level and A-Level rows (further down) were verified the same way against AQA's "Exam timetable
// May/June 2027 – AS, A-level, Applied General, Level 3 Certificates and Level 3 Extended Project", Version 1.2
// (scripts/curriculum/inputs/official-timetables-2027.json): all 38 AS rows and
// all 93 A-level rows match.
//
// Edexcel GCSE, AS-Level and A-Level rows were verified against Pearson's FINAL 2027 timetables
// (scripts/curriculum/inputs/official-timetables-2027.json): five wrong GCSE dates were corrected (Chinese and Urdu
// Listening/Reading, German Writing) and missing rows were added (GCSE French; AS Biology and Economics;
// A-level Further Mathematics Papers 3 and 4).
//
// OCR, EDUQAS/WJEC AND CCEA (GCSE, AS and A-level) rows were transcribed from each board's FINAL summer 2027
// timetable and compared paper by paper; every written paper in those documents has a row below.
//   - OCR: "June 2027 final exam timetable - GCSE and Cambridge Nationals" (OCR document 758618, edition June 2026) and
//     "June 2027 final exam timetable - AS and A Level, Core Maths and FSMQ" (document 758622, edition June 2026).
//     OCR marks some papers * = final assessment opportunity. Contingency day Wed 23 June 2027; 31 May - 4 June (the
//     Spring bank holiday week) has no OCR exams. Cambridge Nationals and the FSMQ are stored as 'Level 2', Core Maths as
//     'Level 3'. Where a subject has A/B variants with identical dates (OCR Biology A and B, Eduqas Geography A and B), an
//     extra plain-name row (e.g. 'Biology', 'Geography') repeats those dates for students who chose the subject without the
//     A/B suffix.
//   - WJEC/Eduqas: "Summer 2027 Wales and Eduqas GCSE" final version (wjec.co.uk) and the Wales and Eduqas AS and A level
//     final version (eduqas.co.uk). Contingency day Wed 23 June 2027. WJEC (Wales) papers are stored under 'Eduqas' like
//     every other WJEC/Eduqas entry (see EXAM_DATA_BOARD_KEYS below), under the plain subject name; where a Wales subject
//     shares its name with an Eduqas (England) subject it carries "(WJEC Wales)". Subjects the document marks "resit only"
//     say so in their name.
//   - CCEA: "GCSE Summer 2027" Version 2 (ccea.org.uk, updated 01/09/2026) and "GCE Summer 2027" (updated 20/05/2026);
//     summer series only (CCEA's March and November series are not included). Contingency day Wed 23 June 2027.
// The WJEC and CCEA documents are Morning | Date | Afternoon tables, so every paper's date was taken from that layout and
// cross-checked: tiers/options of one paper share a date, parallel Wales and Eduqas papers line up, the bank holidays
// (Mon 3 and Mon 31 May) are empty, and no CCEA GCSE day has more than one morning or one afternoon session.
// Not included: non-examined assessment deadlines (except the existing Art and Design "Submit by" rows), speaking tests,
// and anything a board has not published.
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
  { board:'AQA', level:'GCSE', subject:'Food Preparation & Nutrition', tier:'N/A', paper:1, paperName:'Paper 1', date:'2027-05-24' },
  { board:'AQA', level:'GCSE', subject:'Drama', tier:'N/A', paper:1, paperName:'Understanding Drama', date:'2027-05-14' },
  { board:'AQA', level:'GCSE', subject:'Music', tier:'N/A', paper:1, paperName:'Understanding Music', date:'2027-05-27' },
  { board:'AQA', level:'GCSE', subject:'Dance', tier:'N/A', paper:1, paperName:'Dance Appreciation', date:'2027-06-14' },
  { board:'AQA', level:'GCSE', subject:'Polish', tier:'N/A', paper:1, paperName:'Listening', date:'2027-05-20' },
  { board:'AQA', level:'GCSE', subject:'Polish', tier:'N/A', paper:3, paperName:'Reading', date:'2027-05-20' },
  { board:'AQA', level:'GCSE', subject:'Polish', tier:'N/A', paper:4, paperName:'Writing', date:'2027-06-11' },
  { board:'AQA', level:'GCSE', subject:'Engineering', tier:'N/A', paper:1, paperName:'Written', date:'2027-06-11' },
  { board:'AQA', level:'GCSE', subject:'Further Mathematics', tier:'N/A', paper:1, paperName:'Paper 1 (Level 2 Certificate)', date:'2027-06-09' },
  { board:'AQA', level:'GCSE', subject:'Further Mathematics', tier:'N/A', paper:2, paperName:'Paper 2 (Level 2 Certificate)', date:'2027-06-17' },
  { board:'AQA', level:'GCSE', subject:'Art & Design (Fine Art)', tier:'N/A', paper:1, paperName:'Portfolio & Externally Set Assignment', date:'Submit by 31 May 2027' },
  { board:'AQA', level:'GCSE', subject:'Art & Design (Art, Craft & Design)', tier:'N/A', paper:1, paperName:'Portfolio & Externally Set Assignment', date:'Submit by 31 May 2027' },
  { board:'AQA', level:'GCSE', subject:'Art & Design (Graphic Communication)', tier:'N/A', paper:1, paperName:'Portfolio & Externally Set Assignment', date:'Submit by 31 May 2027' },
  { board:'AQA', level:'GCSE', subject:'Art & Design (Textile Design)', tier:'N/A', paper:1, paperName:'Portfolio & Externally Set Assignment', date:'Submit by 31 May 2027' },
  { board:'AQA', level:'GCSE', subject:'Art & Design (Three-dimensional Design)', tier:'N/A', paper:1, paperName:'Portfolio & Externally Set Assignment', date:'Submit by 31 May 2027' },
  { board:'AQA', level:'GCSE', subject:'Art & Design (Photography)', tier:'N/A', paper:1, paperName:'Portfolio & Externally Set Assignment', date:'Submit by 31 May 2027' },

  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Arabic",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening and understanding in Arabic (F/H)",
    "date": "2027-05-24"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Arabic",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading and understanding in Arabic (F/H)",
    "date": "2027-05-24"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Arabic",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing in Arabic (F/H)",
    "date": "2027-06-07"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Astronomy",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Naked-eye Astronomy",
    "date": "2027-05-27"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Astronomy",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Telescopic Astronomy",
    "date": "2027-06-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Biblical Hebrew",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Language",
    "date": "2027-05-10"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Biblical Hebrew",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Literature",
    "date": "2027-05-19"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (F/H)",
    "date": "2027-05-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (F/H)",
    "date": "2027-06-10"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Investigating Small Business",
    "date": "2027-05-12"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Business",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Building a Business",
    "date": "2027-05-21"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (F/H)",
    "date": "2027-05-17"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (F/H)",
    "date": "2027-06-15"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Mandarin Chinese",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening and understanding in Chinese (F/H)",
    "date": "2027-05-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Mandarin Chinese",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading and understanding in Chinese (F/H)",
    "date": "2027-05-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Mandarin Chinese",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing in Chinese (F/H)",
    "date": "2027-05-20"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Citizenship Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2027-05-10"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Citizenship Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2027-05-20"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Combined Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Biology 1 (F/H)",
    "date": "2027-05-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Combined Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Chemistry 1 (F/H)",
    "date": "2027-05-17"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Combined Science",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Physics 1 (F/H)",
    "date": "2027-05-25"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Combined Science",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Biology 2 (F/H)",
    "date": "2027-06-10"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Combined Science",
    "tier": "N/A",
    "paper": 5,
    "paperName": "Paper 5: Chemistry 2 (F/H)",
    "date": "2027-06-15"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Combined Science",
    "tier": "N/A",
    "paper": 6,
    "paperName": "Paper 6: Physics 2 (F/H)",
    "date": "2027-06-18"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Principles of Computer Science",
    "date": "2027-05-10"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Application of Computational Thinking",
    "date": "2027-05-19"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Design and Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1 (choice of material/system)",
    "date": "2027-06-15"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Drama",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 3: Theatre Makers in Practice",
    "date": "2027-05-14"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Fiction and Imaginative Writing",
    "date": "2027-05-24"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Non-Fiction and Transactional Writing",
    "date": "2027-06-08"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "English Language 2.0",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Non-Fiction Texts",
    "date": "2027-05-24"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "English Language 2.0",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Contemporary Texts",
    "date": "2027-06-08"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Shakespeare and Post-1914 Literature",
    "date": "2027-05-12"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: 19th Century Novel & Poetry since 1789",
    "date": "2027-05-19"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Geography A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: The Physical Environment",
    "date": "2027-05-18"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Geography A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: The Human Environment",
    "date": "2027-05-26"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Geography A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Geographical Investigations",
    "date": "2027-06-10"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Geography B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Global Geographical Issues",
    "date": "2027-05-18"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Geography B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: UK Geographical Issues",
    "date": "2027-05-26"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Geography B",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: People and Environment Issues",
    "date": "2027-06-10"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "German",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Listening and understanding in German (F/H)",
    "date": "2027-05-10"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "German",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading and understanding in German (F/H)",
    "date": "2027-05-18"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "German",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing in German (F/H)",
    "date": "2027-05-20"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "French",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Listening and understanding in French (F/H)",
    "date": "2027-05-26"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "French",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading and understanding in French (F/H)",
    "date": "2027-06-08"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "French",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing in French (F/H)",
    "date": "2027-06-14"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Greek",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening and understanding in Greek (F/H)",
    "date": "2027-06-09"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Greek",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading and understanding in Greek (F/H)",
    "date": "2027-06-09"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Greek",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing in Greek (F/H)",
    "date": "2027-06-16"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Gujarati",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening and understanding in Gujarati (F/H)",
    "date": "2027-05-25"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Gujarati",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading and understanding in Gujarati (F/H)",
    "date": "2027-05-25"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Gujarati",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing in Gujarati (F/H)",
    "date": "2027-06-08"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Thematic study and historic environment",
    "date": "2027-05-20"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Period study & British depth study",
    "date": "2027-05-28"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Modern depth study",
    "date": "2027-06-09"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Italian",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening and understanding in Italian (F/H)",
    "date": "2027-05-24"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Italian",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading and understanding in Italian (F/H)",
    "date": "2027-05-24"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Italian",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing in Italian (F/H)",
    "date": "2027-06-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Japanese",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening and understanding in Japanese (F/H)",
    "date": "2027-05-27"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Japanese",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading and understanding in Japanese (F/H)",
    "date": "2027-05-27"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Japanese",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing in Japanese (F/H)",
    "date": "2027-06-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (Non-Calculator) (F/H)",
    "date": "2027-05-14"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (Calculator) (F/H)",
    "date": "2027-05-27"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3 (Calculator) (F/H)",
    "date": "2027-06-14"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Music",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 3: Appraising",
    "date": "2027-05-27"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Persian",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening and understanding in Persian (F/H)",
    "date": "2027-05-20"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Persian",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading and understanding in Persian (F/H)",
    "date": "2027-05-20"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Persian",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing in Persian (F/H)",
    "date": "2027-06-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Fitness and Body Systems",
    "date": "2027-05-13"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Health and Performance",
    "date": "2027-05-20"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (F/H)",
    "date": "2027-05-25"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (F/H)",
    "date": "2027-06-18"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Portuguese",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening and understanding in Portuguese (F/H)",
    "date": "2027-05-20"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Portuguese",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading and understanding in Portuguese (F/H)",
    "date": "2027-05-20"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Portuguese",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing in Portuguese (F/H)",
    "date": "2027-06-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2027-05-10"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2027-05-17"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Religious Studies A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Area of Study 1 – Study of Religion",
    "date": "2027-05-13"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Religious Studies A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Area of Study 2 – Study of Second Religion",
    "date": "2027-05-21"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Religious Studies A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Area of Study 3 – Philosophy and Ethics",
    "date": "2027-06-07"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Religious Studies A",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Area of Study 4 – Textual Studies",
    "date": "2027-06-07"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Religious Studies B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Area of Study 1 – Religion and Ethics",
    "date": "2027-05-13"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Religious Studies B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Area of Study 2 – Religion, Peace and Conflict",
    "date": "2027-05-21"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Religious Studies B",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Area of Study 3 – Religion, Philosophy and Social Justice",
    "date": "2027-06-07"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Russian",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening and understanding in Russian (F/H)",
    "date": "2027-05-27"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Russian",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading and understanding in Russian (F/H)",
    "date": "2027-05-27"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Russian",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing in Russian (F/H)",
    "date": "2027-06-07"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Listening and understanding in Spanish (F/H)",
    "date": "2027-06-09"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading and understanding in Spanish (F/H)",
    "date": "2027-06-16"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing in Spanish (F/H)",
    "date": "2027-06-17"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Statistics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (F/H)",
    "date": "2027-06-07"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Statistics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (F/H)",
    "date": "2027-06-16"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Turkish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening and understanding in Turkish (F/H)",
    "date": "2027-05-10"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Turkish",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading and understanding in Turkish (F/H)",
    "date": "2027-05-10"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Turkish",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing in Turkish (F/H)",
    "date": "2027-05-27"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Urdu",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening and understanding in Urdu (F/H)",
    "date": "2027-05-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Urdu",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Reading and understanding in Urdu (F/H)",
    "date": "2027-05-11"
  },
  {
    "board": "Edexcel",
    "level": "GCSE",
    "subject": "Urdu",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Writing in Urdu (F/H)",
    "date": "2027-05-25"
  },

  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Biology A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (F)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Biology A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (F)",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Biology A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3 (H)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Biology A",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4 (H)",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Biology B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Breadth in biology (F)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Biology B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Depth in biology (F)",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Biology B",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Breadth in biology (H)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Biology B",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Depth in biology (H)",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Business 1: business activity, marketing and people",
    "date": "2027-05-12"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Business",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Business 2: operations, finance and influences on business",
    "date": "2027-05-21"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Chemistry A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (F)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Chemistry A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (F)",
    "date": "2027-06-15"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Chemistry A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3 (H)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Chemistry A",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4 (H)",
    "date": "2027-06-15"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Chemistry B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Breadth in chemistry (F)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Chemistry B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Depth in chemistry (F)",
    "date": "2027-06-15"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Chemistry B",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Breadth in chemistry (H)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Chemistry B",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Depth in chemistry (H)",
    "date": "2027-06-15"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Citizenship Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Citizenship in perspective",
    "date": "2027-05-10"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Citizenship Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Citizenship in action",
    "date": "2027-05-20"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Citizenship Studies",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Our rights, our society, our world",
    "date": "2027-05-27"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (Biology) (F)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (Biology) (F)",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3 (Chemistry) (F)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4 (Chemistry) (F)",
    "date": "2027-06-15"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "N/A",
    "paper": 5,
    "paperName": "Paper 5 (Physics) (F)",
    "date": "2027-05-25"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "N/A",
    "paper": 6,
    "paperName": "Paper 6 (Physics) (F)",
    "date": "2027-06-18"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "N/A",
    "paper": 7,
    "paperName": "Paper 7 (Biology) (H)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "N/A",
    "paper": 8,
    "paperName": "Paper 8 (Biology) (H)",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "N/A",
    "paper": 9,
    "paperName": "Paper 9 (Chemistry) (H)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "N/A",
    "paper": 10,
    "paperName": "Paper 10 (Chemistry) (H)",
    "date": "2027-06-15"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "N/A",
    "paper": 11,
    "paperName": "Paper 11 (Physics) (H)",
    "date": "2027-05-25"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science A",
    "tier": "N/A",
    "paper": 12,
    "paperName": "Paper 12 (Physics) (H)",
    "date": "2027-06-18"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Biology (F)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Chemistry (F)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science B",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Physics (F)",
    "date": "2027-05-25"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science B",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Combined science (F)",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science B",
    "tier": "N/A",
    "paper": 5,
    "paperName": "Biology (H)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science B",
    "tier": "N/A",
    "paper": 6,
    "paperName": "Chemistry (H)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science B",
    "tier": "N/A",
    "paper": 7,
    "paperName": "Physics (H)",
    "date": "2027-05-25"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Combined Science B",
    "tier": "N/A",
    "paper": 8,
    "paperName": "Combined science (H)",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Computer systems",
    "date": "2027-05-10"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Computational thinking, algorithms and programming",
    "date": "2027-05-19"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Design and Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Principles of design and technology",
    "date": "2027-06-15"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Drama",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Drama: Performance and response",
    "date": "2027-05-14"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Introduction to economics",
    "date": "2027-05-13"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "National and international economics",
    "date": "2027-05-25"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Communicating information and ideas",
    "date": "2027-05-24"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Exploring effects and impact",
    "date": "2027-06-08"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Exploring modern and literary heritage texts",
    "date": "2027-05-12"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Exploring poetry and Shakespeare",
    "date": "2027-05-19"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Food Preparation and Nutrition",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Food preparation and nutrition",
    "date": "2027-05-24"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Geography A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Living in the UK today",
    "date": "2027-05-18"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Geography A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "The world around us",
    "date": "2027-05-26"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Geography A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Geographical skills",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Geography B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Our natural world",
    "date": "2027-05-18"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Geography B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "People and society",
    "date": "2027-05-26"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Geography B",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Geographical exploration",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "History A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Period study with non-British depth study",
    "date": "2027-05-20"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "History A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Thematic study",
    "date": "2027-05-28"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "History A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "British depth study with a study of the historic environment",
    "date": "2027-06-09"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "History B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "History around us",
    "date": "2027-05-20"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "History B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "British history – thematic study and depth study",
    "date": "2027-05-28"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "History B",
    "tier": "N/A",
    "paper": 3,
    "paperName": "World history - period study and depth study",
    "date": "2027-06-09"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (F, calculator)",
    "date": "2027-05-14"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (F, non-calculator)",
    "date": "2027-05-27"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3 (F, calculator)",
    "date": "2027-06-14"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4 (H, calculator)",
    "date": "2027-05-14"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 5,
    "paperName": "Paper 5 (H, non-calculator)",
    "date": "2027-05-27"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 6,
    "paperName": "Paper 6 (H, calculator)",
    "date": "2027-06-14"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Television and promoting media",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Music and news",
    "date": "2027-05-25"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Music",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening and appraising",
    "date": "2027-05-27"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Physical factors affecting performance",
    "date": "2027-05-13"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Socio-cultural issues and sports psychology",
    "date": "2027-05-20"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physics A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (F)",
    "date": "2027-05-25"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physics A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (F)",
    "date": "2027-06-18"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physics A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3 (H)",
    "date": "2027-05-25"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physics A",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4 (H)",
    "date": "2027-06-18"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physics B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Breadth in physics (F)",
    "date": "2027-05-25"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physics B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Depth in physics (F)",
    "date": "2027-06-18"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physics B",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Breadth in physics (H)",
    "date": "2027-05-25"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physics B",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Depth in physics (H)",
    "date": "2027-06-18"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Studies and applications in psychology 1",
    "date": "2027-05-10"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Studies and applications in psychology 2",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Beliefs, Teachings and Practices (Options 1-5)",
    "date": "2027-05-13"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Religion, Philosophy and Ethics in the Modern World (Options 1-5)",
    "date": "2027-05-21"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Ancient History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Greece and Persia",
    "date": "2027-05-14"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Ancient History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Rome and its neighbours",
    "date": "2027-05-24"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Classical Civilisation",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Myth and religion or Women in the ancient world (options)",
    "date": "2027-05-19"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Classical Civilisation",
    "tier": "N/A",
    "paper": 2,
    "paperName": "The Homeric world, Roman city life or War and warfare (options)",
    "date": "2027-06-09"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Classical Greek",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Language",
    "date": "2027-05-12"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Classical Greek",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Prose literature (A or B)",
    "date": "2027-05-24"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Classical Greek",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Verse literature (A or B)",
    "date": "2027-06-08"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Classical Greek",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Literature and culture",
    "date": "2027-06-14"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Latin",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Language",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Latin",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Prose literature (A or B)",
    "date": "2027-05-18"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Latin",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Verse literature (A or B)",
    "date": "2027-06-07"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Latin",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Literature and culture",
    "date": "2027-06-11"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Religious Studies (Short Course)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Religion, philosophy and ethics in the modern world",
    "date": "2027-05-13"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (F/H)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (F/H)",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (F/H)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (F/H)",
    "date": "2027-06-15"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (F/H)",
    "date": "2027-05-25"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (F/H)",
    "date": "2027-06-18"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (A: Living in the UK today; B: Our natural world)",
    "date": "2027-05-18"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (A: The world around us; B: People and society)",
    "date": "2027-05-26"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3 (A: Geographical skills; B: Geographical exploration)",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (A: Period study with non-British depth study; B: History around us)",
    "date": "2027-05-20"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (A: Thematic study; B: British thematic study and depth study)",
    "date": "2027-05-28"
  },
  {
    "board": "OCR",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3 (A: British depth study; B: World period study and depth study)",
    "date": "2027-06-09"
  },

  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-12"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Business",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-21"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2 (On screen)",
    "date": "2027-05-19"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Design & Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-06-15"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Drama",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 3",
    "date": "2027-05-14"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-24"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-06-08"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-12"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-19"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Film Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Film Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-21"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Food Preparation & Nutrition",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1 (Written or on screen)",
    "date": "2027-05-24"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Geography A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Geography A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-26"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Geography A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3",
    "date": "2027-06-10"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Geography B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Geography B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-26"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Geography B",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3",
    "date": "2027-06-10"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-26"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3",
    "date": "2027-06-10"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1 (Studies A to H)",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2 (Studies A to H)",
    "date": "2027-05-28"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1 Foundation Tier",
    "date": "2027-05-14"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 1 Higher Tier",
    "date": "2027-05-14"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 2 Foundation Tier",
    "date": "2027-05-27"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Component 2 Higher Tier",
    "date": "2027-05-27"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-17"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-25"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Music",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 3",
    "date": "2027-05-27"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1 (Full Course)",
    "date": "2027-05-13"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1 (Route A and Route B)",
    "date": "2027-05-13"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2 (Route A and Route B)",
    "date": "2027-05-21"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3 (Route A Options 1-5; Route B Option 4)",
    "date": "2027-06-07"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Electronics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Electronics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Geology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1 (On screen)",
    "date": "2027-05-13"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Geology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Latin",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Latin",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Latin",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3 - Option A/Option B",
    "date": "2027-06-07"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Physical Education (Short Course)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-13"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Religious Studies (Short Course)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-13"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Religious Studies (Short Course)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-21"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Religious Studies (Short Course)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3 (Options 1 to 5)",
    "date": "2027-06-07"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Applied Science (Double Award)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (F/H)",
    "date": "2027-06-15"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Applied Science (Double Award)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (F/H)",
    "date": "2027-06-10"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Applied Science (Double Award)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unit 3 (F/H)",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Applied Science (Single Award)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (F/H)",
    "date": "2027-06-10"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Applied Science (Single Award)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (F/H)",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (F/H)",
    "date": "2027-06-09"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (F/H)",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Built Environment",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (On screen)",
    "date": "2027-06-17"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Business (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-12"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Business (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 3",
    "date": "2027-05-21"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (F/H)",
    "date": "2027-06-11"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (F/H)",
    "date": "2027-05-17"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Computer Science (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (On screen)",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Computer Science (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-05-19"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Core Cymraeg",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-13"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Core Cymraeg",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4",
    "date": "2027-05-24"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Cymraeg Language and Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-13"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Cymraeg Language and Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4 (4a/4b)",
    "date": "2027-05-24"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Cymraeg Language and Literature",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unit 6",
    "date": "2027-06-09"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Design and Technology (Engineering Design)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-06-15"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Design and Technology (Fashion and Textiles)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-06-15"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Design and Technology (Product Design)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-06-15"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Digital Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (On screen)",
    "date": "2027-06-07"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Drama (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3 (On screen)",
    "date": "2027-05-14"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "English Language (WJEC Wales, resit only)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 2",
    "date": "2027-05-26"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "English Language (WJEC Wales, resit only)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 3",
    "date": "2027-06-11"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "English Language and Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-12"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "English Language and Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4 (4a/4b)",
    "date": "2027-05-19"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "English Language and Literature",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unit 6",
    "date": "2027-06-08"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Food and Nutrition",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (On screen)",
    "date": "2027-05-24"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "French",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-26"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "French",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4",
    "date": "2027-06-08"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Geography (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Geography (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 3",
    "date": "2027-05-26"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "German",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "German",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Health and Social Care, and Child Care",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (on screen or written)",
    "date": "2027-05-28"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Health and Social Care, and Child Care",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 3 (on screen or written)",
    "date": "2027-06-07"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Health and Social Care, and Childcare (new specification)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "History (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (Studies A to D)",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "History (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (Studies A to D)",
    "date": "2027-05-28"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "History (WJEC Wales)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unit 3 (Studies A to D)",
    "date": "2027-06-11"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "History (WJEC Wales, new specification)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-13"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "History (WJEC Wales, new specification)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 3",
    "date": "2027-06-16"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Integrated Science (Single Award)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (F/H)",
    "date": "2027-06-09"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Mathematics (WJEC Wales, resit only)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (F/I/H)",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Mathematics (WJEC Wales, resit only)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (F/I/H)",
    "date": "2027-06-08"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Mathematics - Numeracy (WJEC Wales, resit only)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (F/I/H)",
    "date": "2027-05-21"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Mathematics - Numeracy (WJEC Wales, resit only)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (F/I/H)",
    "date": "2027-06-10"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Mathematics and Numeracy (Double Award)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (F/H)",
    "date": "2027-05-14"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Mathematics and Numeracy (Double Award)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (F/H)",
    "date": "2027-05-27"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Mathematics and Numeracy (Double Award)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unit 3 (F/H)",
    "date": "2027-06-14"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Media Studies (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-17"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Media Studies (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-05-25"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Music (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3 (On screen)",
    "date": "2027-05-27"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Physical Education (Short Course) (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Physical Education (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (F/H)",
    "date": "2027-06-16"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (F/H)",
    "date": "2027-05-25"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Religious Studies (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-21"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Religious Studies (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 3",
    "date": "2027-06-07"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Science (Double Award)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (F/H)",
    "date": "2027-06-10"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Science (Double Award)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (F/H)",
    "date": "2027-06-15"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Science (Double Award)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unit 3 (F/H)",
    "date": "2027-06-18"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Science (Double Award)",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Unit 4 (F/H)",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Science (Double Award)",
    "tier": "N/A",
    "paper": 5,
    "paperName": "Unit 5 (F/H)",
    "date": "2027-05-17"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Science (Double Award)",
    "tier": "N/A",
    "paper": 6,
    "paperName": "Unit 6 (F/H)",
    "date": "2027-05-25"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Social Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Social Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 3",
    "date": "2027-06-14"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-06-10"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4",
    "date": "2027-06-17"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "The Sciences (Double Award)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (F/H)",
    "date": "2027-06-09"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "The Sciences (Double Award)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (F/H)",
    "date": "2027-06-11"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "The Sciences (Double Award)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unit 3 (F/H)",
    "date": "2027-06-16"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Welsh Language (WJEC Wales, resit only)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 2",
    "date": "2027-05-14"
  },
  {
    "board": "Eduqas",
    "level": "GCSE",
    "subject": "Welsh Language (WJEC Wales, resit only)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 3",
    "date": "2027-06-14"
  },

  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (F/H)",
    "date": "2027-05-11"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (F/H)",
    "date": "2027-06-02"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unit 3 Practical Theory (F/H)",
    "date": "2027-06-16"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Business Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-12"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Business Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-05-21"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (F/H)",
    "date": "2027-05-17"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (F/H)",
    "date": "2027-06-10"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unit 3 Practical Theory (F/H)",
    "date": "2027-06-18"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Digital Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-17"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Digital Technology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 & Unit 4",
    "date": "2027-06-01"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-06"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Unit 4",
    "date": "2027-05-19"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 5,
    "paperName": "Unit 1 (Interim Spec)",
    "date": "2027-05-06"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 6,
    "paperName": "Unit 3 (Interim Spec)",
    "date": "2027-05-19"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-12"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (Drama/Poetry)",
    "date": "2027-05-24"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-10"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-05-26"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unit 3",
    "date": "2027-06-08"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-20"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-06-09"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (F)",
    "date": "2027-05-14"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (F)",
    "date": "2027-05-14"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unit 3 (H)",
    "date": "2027-05-14"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Unit 4 (H)",
    "date": "2027-05-14"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 5,
    "paperName": "Unit 5/6 (F, Non-Calc/Calc)",
    "date": "2027-05-27"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 6,
    "paperName": "Unit 7/8 (H, Non-Calc/Calc)",
    "date": "2027-05-27"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (F/H)",
    "date": "2027-05-25"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (F/H)",
    "date": "2027-06-14"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unit 3 Practical Theory (F/H)",
    "date": "2027-06-21"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Technology and Design",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-25"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Technology and Design",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (option A/B/C)",
    "date": "2027-06-04"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Agriculture and Land Use",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-28"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Agriculture and Land Use",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-06-16"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Business and Communication Systems",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 2",
    "date": "2027-06-11"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Child Development",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-20"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Child Development",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-06-03"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Construction and the Built Environment",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-06-02"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Construction and the Built Environment",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-06-09"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Drama",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 3",
    "date": "2027-05-05"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2027-05-07"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2027-05-26"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Engineering and Manufacturing",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 2",
    "date": "2027-05-04"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Engineering and Manufacturing",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 3",
    "date": "2027-06-03"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Food and Nutrition",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2027-05-10"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "French",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening Unit 1 (F/H)",
    "date": "2027-05-24"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "French",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Reading Unit 3 (F/H)",
    "date": "2027-06-10"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "French",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Writing Unit 4 (F/H)",
    "date": "2027-06-03"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-18"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-06-04"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unit 3",
    "date": "2027-06-15"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Unit 4",
    "date": "2027-06-18"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Gaeilge",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Reading",
    "date": "2027-06-09"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Gaeilge",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Writing",
    "date": "2027-06-16"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "German",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening Unit 1 (F/H)",
    "date": "2027-05-05"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "German",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Reading Unit 3 (F/H)",
    "date": "2027-06-01"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "German",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Writing Unit 4 (F/H)",
    "date": "2027-05-14"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Government and Politics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-06-04"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Government and Politics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-06-11"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Health and Social Care",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-14"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Hospitality",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-10"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Hospitality",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-06-07"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Irish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening Unit 1 (F/H)",
    "date": "2027-05-11"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Irish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Reading Unit 3 (F/H)",
    "date": "2027-06-17"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Irish",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Writing Unit 4 (F/H)",
    "date": "2027-05-28"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Learning for Life and Work",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (Local and Global Citizenship)",
    "date": "2027-05-04"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Learning for Life and Work",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (Personal Development)",
    "date": "2027-05-07"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Learning for Life and Work",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unit 3 (Employability)",
    "date": "2027-05-18"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Leisure, Travel and Tourism",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-13"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Leisure, Travel and Tourism",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-06-08"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Motor Vehicle and Road User Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-04"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Moving Image Arts",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-26"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Music",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 3",
    "date": "2027-06-08"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (Health & Performance)",
    "date": "2027-05-13"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (Performance)",
    "date": "2027-05-20"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-28"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (Option A/B)",
    "date": "2027-05-28"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unit 3",
    "date": "2027-05-21"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Unit 4",
    "date": "2027-05-21"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 5,
    "paperName": "Unit 5",
    "date": "2027-05-21"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 6,
    "paperName": "Unit 6",
    "date": "2027-05-13"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 7,
    "paperName": "Unit 7",
    "date": "2027-06-02"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 8,
    "paperName": "Unit 8",
    "date": "2027-06-07"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 9,
    "paperName": "Unit 9",
    "date": "2027-06-15"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Science (Double Award)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Biology Unit 1 (F/H)",
    "date": "2027-05-11"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Science (Double Award)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Chemistry Unit 1 (F/H)",
    "date": "2027-05-17"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Science (Double Award)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Physics Unit 1 (F/H)",
    "date": "2027-05-25"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Science (Double Award)",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Biology Unit 2 (F/H)",
    "date": "2027-06-02"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Science (Double Award)",
    "tier": "N/A",
    "paper": 5,
    "paperName": "Chemistry Unit 2 (F/H)",
    "date": "2027-06-10"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Science (Double Award)",
    "tier": "N/A",
    "paper": 6,
    "paperName": "Physics Unit 2 (F/H)",
    "date": "2027-06-14"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Science (Double Award)",
    "tier": "N/A",
    "paper": 7,
    "paperName": "Biology Practical Theory (F/H)",
    "date": "2027-06-02"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Science (Double Award)",
    "tier": "N/A",
    "paper": 8,
    "paperName": "Chemistry Practical Theory (F/H)",
    "date": "2027-06-10"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Science (Double Award)",
    "tier": "N/A",
    "paper": 9,
    "paperName": "Physics Practical Theory (F/H)",
    "date": "2027-06-14"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Science (Single Award)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Biology Unit 1 (F/H)",
    "date": "2027-05-11"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Science (Single Award)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Chemistry Unit 2 (F/H)",
    "date": "2027-05-17"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Science (Single Award)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Physics Unit 3 (F/H)",
    "date": "2027-05-25"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Science (Single Award)",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Unit 4 Practical Theory (F/H)",
    "date": "2027-06-02"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening Unit 1 (F/H)",
    "date": "2027-05-19"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Reading Unit 3 (F/H)",
    "date": "2027-06-07"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Writing Unit 4 (F/H)",
    "date": "2027-05-27"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Statistics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (F/H)",
    "date": "2027-06-07"
  },
  {
    "board": "CCEA",
    "level": "GCSE",
    "subject": "Statistics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (F/H)",
    "date": "2027-06-17"
  },
]

const CCEA_ASLEVEL_2027 = [
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1",
    "date": "2027-05-07"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2",
    "date": "2027-05-20"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "AS Unit 3 Theory",
    "date": "2027-05-26"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Business Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1",
    "date": "2027-05-14"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Business Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2",
    "date": "2027-05-20"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1",
    "date": "2027-05-11"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2",
    "date": "2027-05-18"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 3,
    "paperName": "AS Unit 3 Practical",
    "date": "2027-04-30"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 4,
    "paperName": "AS Unit 3 Theory",
    "date": "2027-05-27"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1",
    "date": "2027-05-11"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2",
    "date": "2027-05-19"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 3,
    "paperName": "AS Unit 3",
    "date": "2027-05-25"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1",
    "date": "2027-05-12"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2",
    "date": "2027-05-17"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1",
    "date": "2027-05-13"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2",
    "date": "2027-05-21"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1",
    "date": "2027-05-12"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2",
    "date": "2027-05-19"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "AS Unit 3 Practical",
    "date": "2027-05-05"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 4,
    "paperName": "AS Unit 3 Theory",
    "date": "2027-05-28"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Technology and Design",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Systems and Control AS 1 Core",
    "date": "2027-05-10"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Technology and Design",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Systems and Control AS 1 Options",
    "date": "2027-05-10"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Digital Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1",
    "date": "2027-05-14"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Digital Technology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2",
    "date": "2027-05-24"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1",
    "date": "2027-05-10"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2",
    "date": "2027-05-17"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1",
    "date": "2027-05-13"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2",
    "date": "2027-05-21"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Environmental Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1",
    "date": "2027-05-21"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 2 Section A",
    "date": "2027-05-14"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2 Sections B & C",
    "date": "2027-05-14"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 3,
    "paperName": "AS Unit 3",
    "date": "2027-05-24"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1",
    "date": "2027-05-10"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2",
    "date": "2027-05-14"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 2 Section A",
    "date": "2027-05-11"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2 Sections B & C",
    "date": "2027-05-11"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 3,
    "paperName": "AS Unit 3",
    "date": "2027-05-18"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Government and Politics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1",
    "date": "2027-05-28"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Government and Politics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2",
    "date": "2027-06-02"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Health and Social Care",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 3",
    "date": "2027-05-19"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Health and Social Care",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 5",
    "date": "2027-06-01"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Health and Social Care",
    "tier": "N/A",
    "paper": 3,
    "paperName": "AS Unit 7",
    "date": "2027-06-01"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Irish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 2 Section A",
    "date": "2027-05-24"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Irish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2 Sections B & C",
    "date": "2027-05-24"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Irish",
    "tier": "N/A",
    "paper": 3,
    "paperName": "AS Unit 3",
    "date": "2027-06-03"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Life and Health Sciences",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 2",
    "date": "2027-05-28"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Life and Health Sciences",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 3",
    "date": "2027-06-01"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Life and Health Sciences",
    "tier": "N/A",
    "paper": 3,
    "paperName": "AS Unit 5",
    "date": "2027-06-03"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Moving Image Arts",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 2",
    "date": "2027-05-11"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Music",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 3 Paper 1",
    "date": "2027-05-26"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Music",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 3 Paper 2",
    "date": "2027-06-03"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Nutrition and Food Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1",
    "date": "2027-05-12"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Nutrition and Food Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2",
    "date": "2027-05-28"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Professional Business Services",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1",
    "date": "2027-05-20"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Professional Business Services",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 3",
    "date": "2027-06-02"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1",
    "date": "2027-05-25"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2",
    "date": "2027-05-25"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 3,
    "paperName": "AS Unit 3",
    "date": "2027-05-25"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 4,
    "paperName": "AS Unit 4",
    "date": "2027-06-01"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 5,
    "paperName": "AS Unit 5",
    "date": "2027-06-01"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 6,
    "paperName": "AS Unit 6",
    "date": "2027-06-01"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 7,
    "paperName": "AS Unit 7",
    "date": "2027-05-18"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 8,
    "paperName": "AS Unit 8",
    "date": "2027-06-04"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Software Systems Development",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 1",
    "date": "2027-05-27"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 2 Section A",
    "date": "2027-05-10"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "AS Unit 2 Sections B & C",
    "date": "2027-05-10"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 3,
    "paperName": "AS Unit 3",
    "date": "2027-05-17"
  },
  {
    "board": "CCEA",
    "level": "AS-Level",
    "subject": "Sports Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "AS Unit 2",
    "date": "2027-05-18"
  },
]

const ASLEVEL_2027 = [
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2027-05-13"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2027-05-20"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Business 1",
    "date": "2027-05-14"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Business 2",
    "date": "2027-05-20"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Inorganic and Physical Chemistry",
    "date": "2027-05-11"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Organic and Physical Chemistry",
    "date": "2027-05-18"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (options A-E)",
    "date": "2027-05-11"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2027-05-17"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "The operation of markets and market failure",
    "date": "2027-05-11"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "The national economy in a global context",
    "date": "2027-05-17"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Language and the individual",
    "date": "2027-05-10"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Language varieties",
    "date": "2027-05-17"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "English Literature A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Love through the ages: Shakespeare and poetry",
    "date": "2027-05-13"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "English Literature A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Love through the ages: prose",
    "date": "2027-05-21"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "English Literature B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Literary genres: Drama (options A and B)",
    "date": "2027-05-13"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "English Literature B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Literary genres: Prose and poetry (options A and B)",
    "date": "2027-05-21"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening, reading and writing",
    "date": "2027-05-14"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Writing",
    "date": "2027-05-20"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2027-05-10"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (options D, M and S)",
    "date": "2027-05-14"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Physical geography and people and the environment",
    "date": "2027-05-11"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Human geography and fieldwork investigation",
    "date": "2027-05-19"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening, reading and writing",
    "date": "2027-05-12"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Writing",
    "date": "2027-05-18"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (options A-L)",
    "date": "2027-05-12"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (options A-S)",
    "date": "2027-05-17"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2027-05-13"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2027-05-21"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2027-05-12"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2027-05-18"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Introductory topics in Psychology",
    "date": "2027-05-10"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Psychology in context",
    "date": "2027-05-19"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Philosophy of religion and ethics",
    "date": "2027-05-14"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Study of religion (options A-E)",
    "date": "2027-05-20"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Education with methods in context",
    "date": "2027-05-11"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Research methods and topics in Sociology",
    "date": "2027-05-18"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening, reading and writing",
    "date": "2027-05-10"
  },
  {
    "board": "AQA",
    "level": "AS-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Writing",
    "date": "2027-05-17"
  },

  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Marketing and People",
    "date": "2027-05-14"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Managing Business Activities",
    "date": "2027-05-20"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Core Inorganic and Physical Chemistry",
    "date": "2027-05-11"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Core Organic and Physical Chemistry",
    "date": "2027-05-18"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Language: Context and Identity",
    "date": "2027-05-10"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Child Language",
    "date": "2027-05-17"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "English Lang & Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Voices in Speech and Writing",
    "date": "2027-05-10"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "English Lang & Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Varieties in Language and Literature",
    "date": "2027-05-17"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Poetry & Drama",
    "date": "2027-05-13"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Prose",
    "date": "2027-05-21"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Core Pure Mathematics",
    "date": "2027-05-10"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Further Mathematics Options",
    "date": "2027-05-14"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Biology A (Salters Nuffield)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Lifestyle, Transport, Genes and Health",
    "date": "2027-05-13"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Biology A (Salters Nuffield)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Development, Plants and the Environment",
    "date": "2027-05-20"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Biology B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Core Cellular Biology and Microbiology",
    "date": "2027-05-13"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Biology B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Core Physiology and Ecology",
    "date": "2027-05-20"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Economics A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Introduction to Markets and Market Failure",
    "date": "2027-05-11"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Economics A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: The UK Economy - Performance and Policies",
    "date": "2027-05-17"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Dynamic Landscapes",
    "date": "2027-05-11"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Dynamic Places",
    "date": "2027-05-19"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Breadth study with interpretations",
    "date": "2027-05-12"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Depth Study",
    "date": "2027-05-17"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Pure Mathematics",
    "date": "2027-05-13"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Statistics and Mechanics",
    "date": "2027-05-21"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Music Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 3: Listening and analysing",
    "date": "2027-05-12"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Music Technology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 4: Producing and analysing",
    "date": "2027-05-21"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Core Physics I",
    "date": "2027-05-12"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Core Physics II",
    "date": "2027-05-18"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: UK Politics",
    "date": "2027-05-12"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: UK Government",
    "date": "2027-05-20"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Social and Cognitive Psychology",
    "date": "2027-05-10"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Biological Psychology and Learning Theories",
    "date": "2027-05-19"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Philosophy of Religion",
    "date": "2027-05-14"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Religion and Ethics",
    "date": "2027-05-20"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: New Testament Studies",
    "date": "2027-05-25"
  },
  {
    "board": "Edexcel",
    "level": "AS-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Study of Religion",
    "date": "2027-05-28"
  },

  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Ancient History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Relations between Greek states and between Greek and non-Greek states 492-404 BC (H007/01)",
    "date": "2027-05-14"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Ancient History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "The Julio-Claudian emperors, 31 BC - AD 68 (H007/02)",
    "date": "2027-05-20"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Biology A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Breadth in biology (H020/01)",
    "date": "2027-05-13"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Biology A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Depth in biology (H020/02)",
    "date": "2027-05-20"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Biology B (Advancing Biology)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Foundations of biology (H022/01)",
    "date": "2027-05-13"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Biology B (Advancing Biology)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Biology in depth (H022/02)",
    "date": "2027-05-20"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "The local business environment (H031/01)",
    "date": "2027-05-14"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 2,
    "paperName": "The wider business environment (H031/02)",
    "date": "2027-05-20"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Chemistry A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Breadth in chemistry (H032/01)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Chemistry A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Depth in chemistry (H032/02)",
    "date": "2027-05-18"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Chemistry B (Salters)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Foundations of chemistry (H033/01)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Chemistry B (Salters)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Chemistry in depth (H033/02)",
    "date": "2027-05-18"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Classical Civilisation",
    "tier": "N/A",
    "paper": 1,
    "paperName": "The world of the hero (H008/11)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Classical Civilisation",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Greek theatre or Imperial image (options) (H008/21-22)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Classical Greek",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Language (H044/01)",
    "date": "2027-05-13"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Classical Greek",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Literature (H044/02)",
    "date": "2027-05-18"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Computing principles (H046/01)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Algorithms and problem solving (H046/02)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Design and Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Principles of design engineering, fashion and textiles or product design (H004/01, H005/01, H006/01)",
    "date": "2027-05-10"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Drama and Theatre",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Exploring performance (H059/05)",
    "date": "2027-05-10"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Microeconomics (H060/01)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Macroeconomics (H060/02)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Exploring language (H070/01)",
    "date": "2027-05-10"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Exploring contexts (H070/02)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "English Language and Literature (EMC)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Non-fiction written and spoken texts (H074/01)",
    "date": "2027-05-10"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "English Language and Literature (EMC)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "The language of literary texts (H074/02)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Shakespeare and poetry pre-1900 (H072/01)",
    "date": "2027-05-13"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Drama and prose post-1900 (H072/02)",
    "date": "2027-05-21"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Film Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Elements of film (H010/01)",
    "date": "2027-05-12"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Further Mathematics A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Pure core (Y531)",
    "date": "2027-05-10"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Further Mathematics A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Statistics (Y532)",
    "date": "2027-05-14"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Further Mathematics A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Mechanics (Y533)",
    "date": "2027-05-19"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Further Mathematics A",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Discrete mathematics (Y534)",
    "date": "2027-05-20"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Further Mathematics A",
    "tier": "N/A",
    "paper": 5,
    "paperName": "Additional pure mathematics (Y535)",
    "date": "2027-05-25"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Further Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Core pure (Y410)",
    "date": "2027-05-10"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Further Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Mechanics A (Y411)",
    "date": "2027-05-14"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Further Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Statistics A (Y412)",
    "date": "2027-05-19"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Further Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Modelling with algorithms (Y413)",
    "date": "2027-05-20"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Further Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 5,
    "paperName": "Numerical methods (Y414)",
    "date": "2027-05-25"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Landscape and place (H081/01)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Geographical debates (H081/02)",
    "date": "2027-05-19"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Geology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Geology (H014/01)",
    "date": "2027-05-10"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "History A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "British period study and enquiry - unit group 1 (Y136-Y138, Y143)",
    "date": "2027-05-12"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "History A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Non-British period study - unit group 2 (Y243, Y249, Y251-Y253)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 1,
    "paperName": "The legal system and criminal law (H018/01)",
    "date": "2027-05-14"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Law making and the law of tort (H018/02)",
    "date": "2027-05-21"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Latin",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Language (H043/01)",
    "date": "2027-05-10"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Latin",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Literature (H043/02)",
    "date": "2027-05-19"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Mathematics A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Pure mathematics and statistics (H230/01)",
    "date": "2027-05-13"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Mathematics A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Pure mathematics and mechanics (H230/02)",
    "date": "2027-05-21"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Pure mathematics and mechanics (H630/01)",
    "date": "2027-05-13"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Pure mathematics and statistics (H630/02)",
    "date": "2027-05-21"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Media today (H009/01)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Music",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening and appraising (H143/03)",
    "date": "2027-05-12"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Physiological factors affecting performance (H155/01)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Psychological and socio-cultural themes in physical education (H155/02)",
    "date": "2027-05-18"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Physics A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Breadth in physics (H156/01)",
    "date": "2027-05-12"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Physics A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Depth in physics (H156/02)",
    "date": "2027-05-18"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Physics B (Advancing Physics)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Foundations of physics (H157/01)",
    "date": "2027-05-12"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Physics B (Advancing Physics)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Physics in depth (H157/02)",
    "date": "2027-05-18"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Research methods (H167/01)",
    "date": "2027-05-10"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Psychological themes through core studies (H167/02)",
    "date": "2027-05-19"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Philosophy of religion (H173/01)",
    "date": "2027-05-14"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Religion and ethics (H173/02)",
    "date": "2027-05-20"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Developments in religious thought (options: Christian, Islamic, Jewish, Buddhist, Hindu) (H173/03-07)",
    "date": "2027-05-25"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Socialisation, culture and identity (H180/01)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Researching and understanding social inequalities (H180/02)",
    "date": "2027-05-18"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Breadth in biology (H020/01) / Foundations of biology (H022/01)",
    "date": "2027-05-13"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Depth in biology (H020/02) / Biology in depth (H022/02)",
    "date": "2027-05-20"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Breadth in chemistry (H032/01) / Foundations of chemistry (H033/01)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Depth in chemistry (H032/02) / Chemistry in depth (H033/02)",
    "date": "2027-05-18"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Breadth in physics (H156/01) / Foundations of physics (H157/01)",
    "date": "2027-05-12"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Depth in physics (H156/02) / Physics in depth (H157/02)",
    "date": "2027-05-18"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Pure mathematics and statistics (H230/01) / Pure mathematics and mechanics (H630/01)",
    "date": "2027-05-13"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Pure mathematics and mechanics (H230/02) / Pure mathematics and statistics (H630/02)",
    "date": "2027-05-21"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "British period study and enquiry - unit group 1 (Y136-Y138, Y143)",
    "date": "2027-05-12"
  },
  {
    "board": "OCR",
    "level": "AS-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Non-British period study - unit group 2 (Y243, Y249, Y251-Y253)",
    "date": "2027-05-17"
  },

  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Drama and Theatre",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 2",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-17"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-19"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2 (on-screen)",
    "date": "2027-05-17"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-17"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-19"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-12"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-13"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "English Lang & Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-13"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "English Lang & Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-21"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-13"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-21"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-14"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-14"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-21"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1 (Options A-F)",
    "date": "2027-05-14"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3",
    "date": "2027-05-25"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-19"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Design & Technology (Fashion and Textiles)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Design & Technology (Product Design)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Electronics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-17"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Film Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-12"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Film Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-17"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 2",
    "date": "2027-05-14"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 3",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Geology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Geology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-17"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 2",
    "date": "2027-05-12"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 3",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Music",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 3",
    "date": "2027-05-12"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 2",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 3",
    "date": "2027-05-17"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Biology (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-13"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Biology (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Built Environment",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-24"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Business (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-14"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Business (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Chemistry (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Chemistry (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Computer Science (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Computer Science (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (on-screen)",
    "date": "2027-05-17"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Design and Technology (Engineering Design)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Design and Technology (Fashion and Textiles) (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Design and Technology (Product Design) (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Digital Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-24"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Drama and Theatre (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 2",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Economics (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Economics (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-05-17"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "English Language (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "English Language (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-05-17"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "English Language and Literature (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-13"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "English Language and Literature (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "English Literature (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-13"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "English Literature (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "French (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 2",
    "date": "2027-05-14"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-05-14"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unit 3",
    "date": "2027-05-19"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Geography (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Geography (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-05-19"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "German (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 2",
    "date": "2027-05-12"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Government and Politics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-13"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Government and Politics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Health and Social Care, and Child Care",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-13"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (options 1 to 8)",
    "date": "2027-05-12"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2 (options 1 to 8)",
    "date": "2027-05-17"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Law (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-14"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Law (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-05-21"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-12"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-05-21"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Media Studies (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Music (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-12"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Physical Education (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Physics (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-13"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Physics (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Psychology (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Psychology (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-05-19"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Religious Studies (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1 (options A to F)",
    "date": "2027-05-14"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Religious Studies (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Sociology (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 1",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Sociology (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 2",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Spanish (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 2",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Welsh First Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-19"
  },
  {
    "board": "Eduqas",
    "level": "AS-Level",
    "subject": "Welsh Second Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-19"
  },
]

const ALEVEL_2027 = [
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Accounting",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Financial Accounting",
    "date": "2027-05-17"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Accounting",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Accounting for analysis and decision-making",
    "date": "2027-05-24"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Art & Design (Art, craft and design)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Portfolio & Externally Set Assignment",
    "date": "Submit by 31 May 2027"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Art & Design (Fine art)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Portfolio & Externally Set Assignment",
    "date": "Submit by 31 May 2027"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Art & Design (Graphic communication)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Portfolio & Externally Set Assignment",
    "date": "Submit by 31 May 2027"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Art & Design (Textile design)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Portfolio & Externally Set Assignment",
    "date": "Submit by 31 May 2027"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Art & Design (Three-dimensional design)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Portfolio & Externally Set Assignment",
    "date": "Submit by 31 May 2027"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Art & Design (Photography)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Portfolio & Externally Set Assignment",
    "date": "Submit by 31 May 2027"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Bengali",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Reading and writing",
    "date": "2027-05-14"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Bengali",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Writing",
    "date": "2027-05-21"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Bengali",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, reading and writing",
    "date": "2027-06-11"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Biblical Hebrew",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Translation, comprehension and composition",
    "date": "2027-05-17"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Biblical Hebrew",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Prose literature",
    "date": "2027-05-25"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Biblical Hebrew",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Poetry",
    "date": "2027-06-09"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2027-06-07"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2027-06-14"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3",
    "date": "2027-06-18"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Business 1",
    "date": "2027-05-13"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Business 2",
    "date": "2027-05-19"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Business 3",
    "date": "2027-06-08"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Inorganic and Physical Chemistry",
    "date": "2027-05-28"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Organic and Physical Chemistry",
    "date": "2027-06-10"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3",
    "date": "2027-06-17"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (options A-E)",
    "date": "2027-06-07"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2027-06-15"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Dance",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Critical engagement",
    "date": "2027-05-19"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Design & Technology: Fashion and Textiles",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2027-05-24"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Design & Technology: Fashion and Textiles",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2027-06-11"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Design & Technology: Product Design",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2027-05-24"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Design & Technology: Product Design",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2027-06-11"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Drama and Theatre",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Drama and Theatre",
    "date": "2027-05-17"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Markets and market failure",
    "date": "2027-05-10"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "National and international economy",
    "date": "2027-05-17"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Economic principles and issues",
    "date": "2027-06-07"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "English Lang & Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Telling Stories",
    "date": "2027-05-13"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "English Lang & Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Exploring conflict",
    "date": "2027-05-20"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Language, the individual and society",
    "date": "2027-05-10"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Language diversity and change",
    "date": "2027-05-17"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "English Literature A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Love through the ages",
    "date": "2027-05-13"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "English Literature A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Texts in shared contexts (options A and B)",
    "date": "2027-05-20"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "English Literature B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Literary genres (options A and B)",
    "date": "2027-05-13"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "English Literature B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Texts and genres (options A and B)",
    "date": "2027-05-20"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Environmental Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2027-05-14"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Environmental Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2027-05-21"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening, reading and writing",
    "date": "2027-06-07"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Writing",
    "date": "2027-06-15"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2027-05-20"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2027-05-25"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3 (options D, M and S)",
    "date": "2027-06-10"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Physical geography",
    "date": "2027-05-11"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Human geography",
    "date": "2027-05-20"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening, reading and writing",
    "date": "2027-05-19"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Writing",
    "date": "2027-05-26"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1 (options A-L)",
    "date": "2027-05-19"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2 (options A-T)",
    "date": "2027-05-26"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2027-05-20"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2027-05-27"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3 (options A and B)",
    "date": "2027-06-10"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2027-05-26"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2027-06-09"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3",
    "date": "2027-06-16"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2027-05-12"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2027-05-21"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Modern Hebrew",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Reading and writing",
    "date": "2027-05-24"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Modern Hebrew",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Writing",
    "date": "2027-06-07"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Modern Hebrew",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, reading and writing",
    "date": "2027-06-15"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Music",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Appraising music",
    "date": "2027-06-09"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Panjabi",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Reading and writing",
    "date": "2027-05-21"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Panjabi",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Writing",
    "date": "2027-05-28"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Panjabi",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, reading and writing",
    "date": "2027-06-09"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Philosophy",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Epistemology and moral philosophy",
    "date": "2027-05-12"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Philosophy",
    "tier": "N/A",
    "paper": 2,
    "paperName": "The metaphysics of God and mind",
    "date": "2027-05-19"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Factors affecting participation",
    "date": "2027-05-20"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Factors affecting optimal performance",
    "date": "2027-05-27"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2027-05-21"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2027-05-27"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3",
    "date": "2027-06-08"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Polish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Reading and writing",
    "date": "2027-05-17"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Polish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Writing",
    "date": "2027-05-28"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Polish",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, reading and writing",
    "date": "2027-06-09"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "The Government and Politics of the UK",
    "date": "2027-05-12"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Comparative Politics: USA",
    "date": "2027-05-24"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Political Ideas",
    "date": "2027-06-15"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Introductory topics in Psychology",
    "date": "2027-05-18"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Psychology in context",
    "date": "2027-05-25"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Issues and options in Psychology",
    "date": "2027-06-09"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Philosophy of religion and ethics",
    "date": "2027-05-27"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Study of religion and dialogues (options A-E)",
    "date": "2027-06-08"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Education with theory and methods",
    "date": "2027-05-14"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Topics in Sociology",
    "date": "2027-05-21"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Crime and deviance with theory and methods",
    "date": "2027-06-10"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening, reading and writing",
    "date": "2027-05-27"
  },
  {
    "board": "AQA",
    "level": "A-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Writing",
    "date": "2027-06-08"
  },

  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Arabic",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Translation into English, reading comprehension and writing",
    "date": "2027-05-18"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Arabic",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Translation into Arabic and written response to works",
    "date": "2027-05-25"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Arabic",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, reading and writing in Arabic",
    "date": "2027-06-11"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology A (Salters Nuffield)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: The Natural Environment and Species Survival",
    "date": "2027-06-07"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology A (Salters Nuffield)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Energy, Exercise and Co-ordination",
    "date": "2027-06-14"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology A (Salters Nuffield)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: General and Practical Applications in Biology",
    "date": "2027-06-18"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Advanced Biochemistry, Microbiology and Genetics",
    "date": "2027-06-07"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Advanced Physiology, Evolution and Ecology",
    "date": "2027-06-14"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Biology B",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: General and Practical Principles in Biology",
    "date": "2027-06-18"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Marketing, people and global businesses",
    "date": "2027-05-13"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Business activities, decisions and strategy",
    "date": "2027-05-19"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Investigating business in a competitive environment",
    "date": "2027-06-08"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Advanced Inorganic and Physical Chemistry",
    "date": "2027-05-28"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Advanced Organic and Physical Chemistry",
    "date": "2027-06-10"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: General and Practical Principles in Chemistry",
    "date": "2027-06-17"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Mandarin Chinese",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening, Reading and Translation",
    "date": "2027-05-19"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Mandarin Chinese",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Written response to works and translation",
    "date": "2027-05-27"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Design & Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Design and Technology (Product Design)",
    "date": "2027-05-24"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Drama and Theatre",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 3: Theatre Makers in Practice",
    "date": "2027-05-17"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Economics A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Markets and Business Behaviour",
    "date": "2027-05-10"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Economics A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: The National and Global Economy",
    "date": "2027-05-17"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Economics A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Microeconomics and Macroeconomics",
    "date": "2027-06-07"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Economics B",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Markets and how they work",
    "date": "2027-05-10"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Economics B",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Competing in the global economy",
    "date": "2027-05-17"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Economics B",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: The economic environment and business",
    "date": "2027-06-07"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Lang & Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Voices in Speech and Writing",
    "date": "2027-05-10"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Lang & Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Varieties in Language and Literature",
    "date": "2027-05-17"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Language Variation",
    "date": "2027-05-10"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Child Language",
    "date": "2027-05-17"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Investigating Language",
    "date": "2027-05-26"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Drama",
    "date": "2027-05-13"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Prose",
    "date": "2027-05-20"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Poetry",
    "date": "2027-05-28"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening, reading and translation",
    "date": "2027-06-07"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Written response to works and translation",
    "date": "2027-06-15"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Core Pure Mathematics 1",
    "date": "2027-05-12"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Core Pure Mathematics 2",
    "date": "2027-05-20"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": "3A",
    "paperName": "Paper 3A: Further Pure Mathematics 1",
    "date": "2027-06-18"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": "3B",
    "paperName": "Paper 3B: Further Statistics 1",
    "date": "2027-06-10"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": "3C",
    "paperName": "Paper 3C: Further Mechanics 1",
    "date": "2027-05-25"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": "3D",
    "paperName": "Paper 3D: Decision Mathematics 1",
    "date": "2027-06-15"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": "4A",
    "paperName": "Paper 4A: Further Pure Mathematics 2",
    "date": "2027-06-21"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": "4B",
    "paperName": "Paper 4B: Further Statistics 2",
    "date": "2027-06-21"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": "4C",
    "paperName": "Paper 4C: Further Mechanics 2",
    "date": "2027-06-21"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": "4D",
    "paperName": "Paper 4D: Decision Mathematics 2",
    "date": "2027-06-21"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1",
    "date": "2027-05-11"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2",
    "date": "2027-05-20"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3",
    "date": "2027-06-10"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening, reading and translation",
    "date": "2027-05-19"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Written response to works and translation",
    "date": "2027-05-26"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Greek",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Translation into English, reading comprehension and writing",
    "date": "2027-05-14"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Greek",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Translation into Greek and written response to works",
    "date": "2027-05-27"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Greek",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, reading and writing in Greek",
    "date": "2027-06-07"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Gujarati",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Translation into English, reading comprehension and writing",
    "date": "2027-05-21"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Gujarati",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Translation into Gujarati and written response to works",
    "date": "2027-05-27"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Gujarati",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, reading and writing in Gujarati",
    "date": "2027-06-11"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Breadth study with interpretations",
    "date": "2027-05-19"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Depth Study",
    "date": "2027-05-26"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Themes in breadth with aspects in depth",
    "date": "2027-06-14"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "History of Art",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Visual analysis and themes",
    "date": "2027-05-17"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "History of Art",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Periods",
    "date": "2027-05-25"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Italian",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening, reading and translation",
    "date": "2027-06-10"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Italian",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Written response to works and translation",
    "date": "2027-06-17"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Japanese",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Translation into English, reading comprehension and writing",
    "date": "2027-05-18"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Japanese",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Translation into Japanese and written response to works",
    "date": "2027-05-25"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Japanese",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, reading and writing",
    "date": "2027-06-11"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Pure Mathematics 1",
    "date": "2027-05-26"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Pure Mathematics 2",
    "date": "2027-06-09"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Statistics & Mechanics",
    "date": "2027-06-16"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Music",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 3: Appraising",
    "date": "2027-06-09"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Music Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 3: Listening and analysing",
    "date": "2027-05-26"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Music Technology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 4: Producing and analysing",
    "date": "2027-06-07"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Persian",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Translation into English, reading comprehension and writing",
    "date": "2027-05-21"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Persian",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Translation into Persian and written response to works",
    "date": "2027-05-28"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Persian",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, reading and writing in Persian",
    "date": "2027-06-16"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1: Scientific Principles of Physical Education",
    "date": "2027-05-20"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2: Psychological and Social Principles of Physical Education",
    "date": "2027-05-27"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Advanced Physics I",
    "date": "2027-05-21"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Advanced Physics II",
    "date": "2027-05-27"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: General and Practical Principles in Physics",
    "date": "2027-06-08"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: UK Politics and Core Political Ideas",
    "date": "2027-05-12"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: UK Government and Non-core Political Ideas",
    "date": "2027-05-24"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": "3A",
    "paperName": "Paper 3A: Comparative Politics - USA",
    "date": "2027-06-15"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Politics",
    "tier": "N/A",
    "paper": "3B",
    "paperName": "Paper 3B: Comparative Politics - Global Politics",
    "date": "2027-06-15"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Portuguese",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Translation into English, reading comprehension and writing",
    "date": "2027-05-20"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Portuguese",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Translation into Portuguese and written response to works",
    "date": "2027-05-28"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Portuguese",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, reading and writing in Portuguese",
    "date": "2027-06-09"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Foundations in Psychology",
    "date": "2027-05-18"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Applications of Psychology",
    "date": "2027-05-25"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Psychological Skills",
    "date": "2027-06-09"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Philosophy of Religion",
    "date": "2027-05-27"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Religion and Ethics",
    "date": "2027-06-08"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: New Testament Studies",
    "date": "2027-06-16"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Paper 4: Study of Religion",
    "date": "2027-06-21"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Russian",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening, reading and translation",
    "date": "2027-05-18"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Russian",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Written response to works and translation",
    "date": "2027-05-25"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Listening, reading and translation",
    "date": "2027-05-27"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Written response to works and translation",
    "date": "2027-06-08"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Statistics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Data and Probability",
    "date": "2027-05-24"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Statistics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Statistical Inference",
    "date": "2027-06-08"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Statistics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Statistics in Practice",
    "date": "2027-06-17"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Turkish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Translation into English, reading comprehension and writing",
    "date": "2027-05-17"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Turkish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Translation into Turkish and written response to works",
    "date": "2027-05-27"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Turkish",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, reading and writing in Turkish",
    "date": "2027-06-08"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Urdu",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Paper 1: Translation into English, reading comprehension and writing",
    "date": "2027-05-18"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Urdu",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Paper 2: Translation into Urdu and written response to works",
    "date": "2027-05-26"
  },
  {
    "board": "Edexcel",
    "level": "A-Level",
    "subject": "Urdu",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Paper 3: Listening, reading and writing in Urdu",
    "date": "2027-06-08"
  },

  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Ancient History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Greek period study (options: Sparta, Athens or Macedon) (H407/11-13)",
    "date": "2027-05-19"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Ancient History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Roman period study (options: Republic and empire, The eleven Caesars or Emperors and empire) (H407/21-23)",
    "date": "2027-05-27"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Biology A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Biological processes (H420/01)",
    "date": "2027-06-07"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Biology A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Biological diversity (H420/02)",
    "date": "2027-06-14"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Biology A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unified biology (H420/03)",
    "date": "2027-06-18"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Biology B (Advancing Biology)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Fundamentals of biology (H422/01)",
    "date": "2027-06-07"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Biology B (Advancing Biology)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Scientific literacy in biology (H422/02)",
    "date": "2027-06-14"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Biology B (Advancing Biology)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Practical skills in biology (H422/03)",
    "date": "2027-06-18"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Operating in a local business environment (H431/01)",
    "date": "2027-05-13"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 2,
    "paperName": "The UK business environment (H431/02)",
    "date": "2027-05-19"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 3,
    "paperName": "The global business environment (H431/03)",
    "date": "2027-06-08"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Chemistry A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Periodic table, elements and physical chemistry (H432/01)",
    "date": "2027-05-28"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Chemistry A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Synthesis and analytical techniques (H432/02)",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Chemistry A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unified chemistry (H432/03)",
    "date": "2027-06-17"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Chemistry B (Salters)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Fundamentals of chemistry (H433/01)",
    "date": "2027-05-28"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Chemistry B (Salters)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Scientific literacy in chemistry (H433/02)",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Chemistry B (Salters)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Practical skills in chemistry (H433/03)",
    "date": "2027-06-17"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Classical Civilisation",
    "tier": "N/A",
    "paper": 1,
    "paperName": "The world of the hero (H408/11)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Classical Civilisation",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2 options: Greek theatre, Imperial image, Invention of the barbarian or Greek art (H408/21-24)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Classical Civilisation",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3 options: Greek religion, Love and relationships, Politics of the late republic or Democracy and the Athenians (H408/31-34)",
    "date": "2027-05-24"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Classical Greek",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unseen translation (H444/01)",
    "date": "2027-05-21"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Classical Greek",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Prose composition or comprehension (H444/02)",
    "date": "2027-05-27"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Classical Greek",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Prose literature (H444/03)",
    "date": "2027-06-09"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Classical Greek",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Verse literature (H444/04)",
    "date": "2027-06-17"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Computer systems (H446/01)",
    "date": "2027-06-07"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Algorithms and programming (H446/02)",
    "date": "2027-06-15"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Design and Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Principles of design engineering, fashion and textiles or product design (H404/01, H405/01, H406/01)",
    "date": "2027-05-24"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Design and Technology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Problem solving in design engineering, fashion and textiles or product design (H404/02, H405/02, H406/02)",
    "date": "2027-06-11"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Drama and Theatre",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Analysing performance (H459/31)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Drama and Theatre",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Deconstructing texts for performance (H459/41-51)",
    "date": "2027-05-25"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Microeconomics (H460/01)",
    "date": "2027-05-10"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Macroeconomics (H460/02)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Themes in economics (H460/03)",
    "date": "2027-06-07"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Exploring language (H470/01)",
    "date": "2027-05-10"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Dimensions of linguistic variation (H470/02)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "English Language and Literature (EMC)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Exploring non-fiction and spoken texts (H474/01)",
    "date": "2027-05-10"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "English Language and Literature (EMC)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "The language of poetry and plays (H474/02)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "English Language and Literature (EMC)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Reading as a writer, writing as a reader (H474/03)",
    "date": "2027-05-26"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Drama and poetry pre-1900 (H472/01)",
    "date": "2027-05-13"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Comparative and contextual study (H472/02)",
    "date": "2027-05-20"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Film Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Film history (H410/01)",
    "date": "2027-05-24"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Film Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Critical approaches to film (H410/02)",
    "date": "2027-06-07"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Further Mathematics A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Pure core 1 (Y540)",
    "date": "2027-05-18"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Further Mathematics A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Pure core 2 (Y541)",
    "date": "2027-05-20"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Further Mathematics A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Statistics (Y542)",
    "date": "2027-05-25"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Further Mathematics A",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Mechanics (Y543)",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Further Mathematics A",
    "tier": "N/A",
    "paper": 5,
    "paperName": "Discrete mathematics (Y544)",
    "date": "2027-06-15"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Further Mathematics A",
    "tier": "N/A",
    "paper": 6,
    "paperName": "Additional pure mathematics (Y545)",
    "date": "2027-06-18"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Further Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Core pure (Y420)",
    "date": "2027-05-18"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Further Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Mechanics major (Y421)",
    "date": "2027-05-25"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Further Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Statistics major (Y422)",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Further Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Mechanics minor (Y431)",
    "date": "2027-05-25"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Further Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 5,
    "paperName": "Statistics minor (Y432)",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Further Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 6,
    "paperName": "Modelling with algorithms (Y433)",
    "date": "2027-05-20"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Further Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 7,
    "paperName": "Numerical methods (Y434)",
    "date": "2027-06-18"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Further Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 8,
    "paperName": "Extra pure (Y435)",
    "date": "2027-06-15"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Further Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 9,
    "paperName": "Further pure with technology (Y436)",
    "date": "2027-05-19"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Physical systems (H481/01)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Human interactions (H481/02)",
    "date": "2027-05-20"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Geographical debates (H481/03)",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Geology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Fundamentals of geology (H414/01)",
    "date": "2027-05-24"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Geology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Scientific literacy in geology (H414/02)",
    "date": "2027-06-11"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Geology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Practical skills in geology (H414/03)",
    "date": "2027-06-17"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "History A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Thematic study and historical interpretations - unit group 3 (Y301-Y321)",
    "date": "2027-05-19"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "History A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "British period study and enquiry - unit group 1 (Y101-Y113)",
    "date": "2027-05-26"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "History A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Non-British period study - unit group 2 (Y201-Y224)",
    "date": "2027-06-14"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 1,
    "paperName": "The legal system and criminal law (H418/01)",
    "date": "2027-05-20"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Law making and the law of tort (H418/02)",
    "date": "2027-05-27"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 3,
    "paperName": "The nature of law and human rights or the law of contract (options) (H418/03-04)",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Latin",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unseen translation (H443/01)",
    "date": "2027-05-18"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Latin",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Prose composition or comprehension (H443/02)",
    "date": "2027-05-25"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Latin",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Prose literature (H443/03)",
    "date": "2027-06-11"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Latin",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Verse literature (H443/04)",
    "date": "2027-06-16"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Mathematics A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Pure mathematics (H240/01)",
    "date": "2027-05-26"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Mathematics A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Pure mathematics and statistics (H240/02)",
    "date": "2027-06-09"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Mathematics A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Pure mathematics and mechanics (H240/03)",
    "date": "2027-06-16"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Pure mathematics and mechanics (H640/01)",
    "date": "2027-05-26"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Pure mathematics and statistics (H640/02)",
    "date": "2027-06-09"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Mathematics B (MEI)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Pure mathematics and comprehension (H640/03)",
    "date": "2027-06-16"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Media messages (H409/01)",
    "date": "2027-05-12"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Evolving media (H409/02)",
    "date": "2027-05-21"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Music",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Listening and appraising (H543/05)",
    "date": "2027-06-09"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Physiological factors affecting performance (H555/01)",
    "date": "2027-05-20"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Psychological factors affecting performance (H555/02)",
    "date": "2027-05-27"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Socio-cultural issues in physical activity and sport (H555/03)",
    "date": "2027-06-11"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physics A",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Modelling physics (H556/01)",
    "date": "2027-05-21"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physics A",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Exploring physics (H556/02)",
    "date": "2027-05-27"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physics A",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unified physics (H556/03)",
    "date": "2027-06-08"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physics B (Advancing Physics)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Fundamentals of physics (H557/01)",
    "date": "2027-05-21"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physics B (Advancing Physics)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Scientific literacy in physics (H557/02)",
    "date": "2027-05-27"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physics B (Advancing Physics)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Practical skills in physics (H557/03)",
    "date": "2027-06-08"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Research methods (H567/01)",
    "date": "2027-05-18"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Psychological themes through core studies (H567/02)",
    "date": "2027-05-25"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Applied psychology (H567/03)",
    "date": "2027-06-09"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Philosophy of religion (H573/01)",
    "date": "2027-05-27"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Religion and ethics (H573/02)",
    "date": "2027-06-08"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Developments in religious thought (options: Christian, Islamic, Jewish, Buddhist, Hindu) (H573/03-07)",
    "date": "2027-06-16"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Socialisation, culture and identity (H580/01)",
    "date": "2027-05-14"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Researching and understanding social inequalities (H580/02)",
    "date": "2027-05-21"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Debates in contemporary society (H580/03)",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Biological processes (H420/01) / Fundamentals of biology (H422/01)",
    "date": "2027-06-07"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Biological diversity (H420/02) / Scientific literacy in biology (H422/02)",
    "date": "2027-06-14"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unified biology (H420/03) / Practical skills in biology (H422/03)",
    "date": "2027-06-18"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Periodic table, elements and physical chemistry (H432/01) / Fundamentals of chemistry (H433/01)",
    "date": "2027-05-28"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Synthesis and analytical techniques (H432/02) / Scientific literacy in chemistry (H433/02)",
    "date": "2027-06-10"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unified chemistry (H432/03) / Practical skills in chemistry (H433/03)",
    "date": "2027-06-17"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Modelling physics (H556/01) / Fundamentals of physics (H557/01)",
    "date": "2027-05-21"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Exploring physics (H556/02) / Scientific literacy in physics (H557/02)",
    "date": "2027-05-27"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unified physics (H556/03) / Practical skills in physics (H557/03)",
    "date": "2027-06-08"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Pure mathematics (H240/01) / Pure mathematics and mechanics (H640/01)",
    "date": "2027-05-26"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Pure mathematics and statistics (H240/02) / Pure mathematics and statistics (H640/02)",
    "date": "2027-06-09"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Pure mathematics and mechanics (H240/03) / Pure mathematics and comprehension (H640/03)",
    "date": "2027-06-16"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Thematic study and historical interpretations - unit group 3 (Y301-Y321)",
    "date": "2027-05-19"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "British period study and enquiry - unit group 1 (Y101-Y113)",
    "date": "2027-05-26"
  },
  {
    "board": "OCR",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Non-British period study - unit group 2 (Y201-Y224)",
    "date": "2027-06-14"
  },

  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-17"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3",
    "date": "2027-06-07"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-10"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-17"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Language",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3",
    "date": "2027-05-26"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-11"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3",
    "date": "2027-06-10"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-12"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Media Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-21"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-13"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-19"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Business",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3",
    "date": "2027-06-08"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Lang & Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-13"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Lang & Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Lang & Literature",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3",
    "date": "2027-05-28"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-13"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3",
    "date": "2027-05-28"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Drama and Theatre",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 3",
    "date": "2027-05-17"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-25"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Psychology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3",
    "date": "2027-06-09"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 2",
    "date": "2027-05-19"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 3",
    "date": "2027-05-26"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-14"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-21"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Sociology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3",
    "date": "2027-06-10"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Design & Technology (Fashion and Textiles)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-24"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Design & Technology (Product Design)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-24"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Physical Education",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-27"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-21"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-27"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3",
    "date": "2027-06-08"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-27"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Law",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3",
    "date": "2027-06-10"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1 (Options A-F)",
    "date": "2027-05-27"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-06-08"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3",
    "date": "2027-06-16"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 2",
    "date": "2027-05-27"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 3",
    "date": "2027-06-08"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-28"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-06-10"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3",
    "date": "2027-06-17"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-06-07"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-06-14"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3",
    "date": "2027-06-18"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-06-07"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Computer Science",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-06-15"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 2",
    "date": "2027-06-07"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 3",
    "date": "2027-06-15"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Electronics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-12"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Electronics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-05-19"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Film Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-24"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Film Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-06-07"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Geology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 1",
    "date": "2027-05-24"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Geology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Component 2",
    "date": "2027-06-11"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Geology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Component 3",
    "date": "2027-06-17"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Music",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Component 3",
    "date": "2027-06-09"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Biology (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-06-07"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Biology (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4",
    "date": "2027-06-14"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Built Environment",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-06-11"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Business (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-19"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Business (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4",
    "date": "2027-06-08"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Chemistry (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-28"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Chemistry (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4",
    "date": "2027-06-10"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Computer Science (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-06-07"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Computer Science (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4",
    "date": "2027-06-15"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Design and Technology (Engineering Design)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-24"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Design and Technology (Fashion and Textiles) (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-24"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Design and Technology (Product Design) (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-24"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Digital Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-06-14"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Drama and Theatre (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 4",
    "date": "2027-05-17"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Economics (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-21"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Economics (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4",
    "date": "2027-06-07"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Language (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-14"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Language (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4",
    "date": "2027-05-26"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Language and Literature (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Language and Literature (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4",
    "date": "2027-05-28"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Literature (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "English Literature (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4",
    "date": "2027-05-28"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "French (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 4",
    "date": "2027-06-07"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "French (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 5",
    "date": "2027-06-15"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 4",
    "date": "2027-05-26"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 5",
    "date": "2027-06-10"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unit 6",
    "date": "2027-06-10"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Geography (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Geography (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4",
    "date": "2027-06-10"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "German (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 4",
    "date": "2027-05-19"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "German (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 5",
    "date": "2027-05-26"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Government and Politics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-18"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Government and Politics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4",
    "date": "2027-05-24"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Health and Social Care, and Child Care",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-19"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Health and Social Care, and Child Care",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 5",
    "date": "2027-05-19"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3 (options 1 to 10)",
    "date": "2027-05-19"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4 (options 1 to 8)",
    "date": "2027-05-26"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Law (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-27"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Law (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4",
    "date": "2027-06-10"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-25"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4",
    "date": "2027-06-09"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Media Studies (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-12"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Music (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 6",
    "date": "2027-06-09"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Physical Education (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-20"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Physics (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-27"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Physics (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4",
    "date": "2027-06-08"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Psychology (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-25"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Psychology (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4",
    "date": "2027-06-09"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Religious Studies (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3 (Options A to F)",
    "date": "2027-05-27"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Religious Studies (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4",
    "date": "2027-06-08"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Religious Studies (WJEC Wales)",
    "tier": "N/A",
    "paper": 3,
    "paperName": "Unit 5",
    "date": "2027-06-16"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Religious Studies (WJEC Wales)",
    "tier": "N/A",
    "paper": 4,
    "paperName": "Unit 6",
    "date": "2027-05-27"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Sociology (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 3",
    "date": "2027-05-14"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Sociology (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 4",
    "date": "2027-06-10"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Spanish (WJEC Wales)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 4",
    "date": "2027-05-27"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Spanish (WJEC Wales)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 5",
    "date": "2027-06-08"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Welsh First Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 5",
    "date": "2027-05-24"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Welsh First Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 6",
    "date": "2027-06-08"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Welsh Second Language",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Unit 5",
    "date": "2027-05-24"
  },
  {
    "board": "Eduqas",
    "level": "A-Level",
    "subject": "Welsh Second Language",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Unit 6",
    "date": "2027-06-08"
  },

  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 1",
    "date": "2027-05-24"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 2",
    "date": "2027-06-11"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Biology",
    "tier": "N/A",
    "paper": 3,
    "paperName": "A2 Unit 3 Theory",
    "date": "2027-06-18"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Business Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 1",
    "date": "2027-05-25"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Business Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 2",
    "date": "2027-06-08"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 1",
    "date": "2027-05-28"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 2",
    "date": "2027-06-09"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 3,
    "paperName": "A2 Unit 3 Practical",
    "date": "2027-05-06"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Chemistry",
    "tier": "N/A",
    "paper": 4,
    "paperName": "A2 Unit 3 Theory",
    "date": "2027-06-16"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 1",
    "date": "2027-05-20"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 2",
    "date": "2027-05-27"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Geography",
    "tier": "N/A",
    "paper": 3,
    "paperName": "A2 Unit 3",
    "date": "2027-06-03"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 1",
    "date": "2027-05-19"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "History",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 2",
    "date": "2027-06-01"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 1",
    "date": "2027-05-26"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 2",
    "date": "2027-06-02"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 1",
    "date": "2027-05-17"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 2",
    "date": "2027-06-07"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 3,
    "paperName": "A2 Unit 3 Practical",
    "date": "2027-05-07"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Physics",
    "tier": "N/A",
    "paper": 4,
    "paperName": "A2 Unit 3 Theory",
    "date": "2027-06-14"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Technology and Design",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 1",
    "date": "2027-05-24"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Digital Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 1",
    "date": "2027-06-04"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 1",
    "date": "2027-05-21"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Economics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 2",
    "date": "2027-05-28"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 1",
    "date": "2027-05-20"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "English Literature",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 2",
    "date": "2027-05-26"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Environmental Technology",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 1",
    "date": "2027-06-03"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 2 Section A",
    "date": "2027-05-25"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 2 Section B",
    "date": "2027-05-25"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "French",
    "tier": "N/A",
    "paper": 3,
    "paperName": "A2 Unit 3",
    "date": "2027-06-15"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 1",
    "date": "2027-05-21"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Further Mathematics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 2",
    "date": "2027-06-04"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 2 Section A",
    "date": "2027-05-19"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 2 Section B",
    "date": "2027-05-19"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "German",
    "tier": "N/A",
    "paper": 3,
    "paperName": "A2 Unit 3",
    "date": "2027-06-01"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Government and Politics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 1",
    "date": "2027-05-18"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Government and Politics",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 2",
    "date": "2027-06-07"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Health and Social Care",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 3",
    "date": "2027-05-17"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Health and Social Care",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 6",
    "date": "2027-06-10"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Health and Social Care",
    "tier": "N/A",
    "paper": 3,
    "paperName": "A2 Unit 7",
    "date": "2027-06-10"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Irish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 2 Section A",
    "date": "2027-06-02"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Irish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 2 Section B",
    "date": "2027-06-02"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Irish",
    "tier": "N/A",
    "paper": 3,
    "paperName": "A2 Unit 3",
    "date": "2027-06-16"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Life and Health Sciences",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 2",
    "date": "2027-06-04"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Life and Health Sciences",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 3",
    "date": "2027-06-07"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Life and Health Sciences",
    "tier": "N/A",
    "paper": 3,
    "paperName": "A2 Unit 4",
    "date": "2027-06-14"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Life and Health Sciences",
    "tier": "N/A",
    "paper": 4,
    "paperName": "A2 Unit 5",
    "date": "2027-06-10"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Moving Image Arts",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 2",
    "date": "2027-06-08"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Music",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 3 Paper 1",
    "date": "2027-06-07"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Music",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 3 Paper 2",
    "date": "2027-06-15"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Nutrition and Food Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 1",
    "date": "2027-06-01"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Professional Business Services",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 1",
    "date": "2027-06-10"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Professional Business Services",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 2",
    "date": "2027-06-17"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 1",
    "date": "2027-06-09"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 2",
    "date": "2027-06-09"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 3,
    "paperName": "A2 Unit 3",
    "date": "2027-06-09"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 4,
    "paperName": "A2 Unit 4",
    "date": "2027-06-14"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 5,
    "paperName": "A2 Unit 5",
    "date": "2027-06-14"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 6,
    "paperName": "A2 Unit 6",
    "date": "2027-06-14"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 7,
    "paperName": "A2 Unit 7",
    "date": "2027-05-27"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Religious Studies",
    "tier": "N/A",
    "paper": 8,
    "paperName": "A2 Unit 8",
    "date": "2027-06-17"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Software Systems Development",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 1",
    "date": "2027-05-18"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 2 Section A",
    "date": "2027-06-03"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 2,
    "paperName": "A2 Unit 2 Section B",
    "date": "2027-06-03"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Spanish",
    "tier": "N/A",
    "paper": 3,
    "paperName": "A2 Unit 3",
    "date": "2027-06-11"
  },
  {
    "board": "CCEA",
    "level": "A-Level",
    "subject": "Sports Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "A2 Unit 2",
    "date": "2027-05-20"
  },
]

// ── OCR Level 2 / Level 3 2027 — Cambridge Nationals, FSMQ and Core Maths (same OCR timetables as above) ──
const L2_2027 = [
  {
    "board": "OCR",
    "level": "Level 2",
    "subject": "Cambridge National: Engineering Manufacture",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Principles of engineering manufacture (R014)",
    "date": "2027-05-26"
  },
  {
    "board": "OCR",
    "level": "Level 2",
    "subject": "Cambridge National: Health and Social Care",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Principles of care in health and social care settings (R032)",
    "date": "2027-06-07"
  },
  {
    "board": "OCR",
    "level": "Level 2",
    "subject": "Cambridge National: Engineering Design",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Principles of engineering design (R038)",
    "date": "2027-05-13"
  },
  {
    "board": "OCR",
    "level": "Level 2",
    "subject": "Cambridge National: Engineering Programmable Systems",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Principles of electronic and programmable systems (R047)",
    "date": "2027-06-17"
  },
  {
    "board": "OCR",
    "level": "Level 2",
    "subject": "Cambridge National: IT",
    "tier": "N/A",
    "paper": 1,
    "paperName": "IT in the digital world (R050)",
    "date": "2027-05-18"
  },
  {
    "board": "OCR",
    "level": "Level 2",
    "subject": "Cambridge National: Child Development",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Health and well-being for child development (R057)",
    "date": "2027-05-19"
  },
  {
    "board": "OCR",
    "level": "Level 2",
    "subject": "Cambridge National: Enterprise and Marketing",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Enterprise and marketing concepts (R067)",
    "date": "2027-05-21"
  },
  {
    "board": "OCR",
    "level": "Level 2",
    "subject": "Cambridge National: Creative iMedia",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Creative iMedia in the media industry (R093)",
    "date": "2027-06-14"
  },
  {
    "board": "OCR",
    "level": "Level 2",
    "subject": "Cambridge National: Sport Science",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Reducing the risk of sports injuries and dealing with common medical conditions (R180)",
    "date": "2027-05-17"
  },
  {
    "board": "OCR",
    "level": "Level 2",
    "subject": "Cambridge National: Sport Studies",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Contemporary issues in sport (R184)",
    "date": "2027-05-11"
  },
  {
    "board": "OCR",
    "level": "Level 2",
    "subject": "FSMQ Additional Mathematics",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Additional Mathematics (6993)",
    "date": "2027-06-18"
  },
  {
    "board": "OCR",
    "level": "Level 3",
    "subject": "Core Maths A (MEI)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Introduction to quantitative reasoning (H868/01)",
    "date": "2027-05-13"
  },
  {
    "board": "OCR",
    "level": "Level 3",
    "subject": "Core Maths A (MEI)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Critical maths (H868/02)",
    "date": "2027-05-21"
  },
  {
    "board": "OCR",
    "level": "Level 3",
    "subject": "Core Maths B (MEI)",
    "tier": "N/A",
    "paper": 1,
    "paperName": "Introduction to quantitative reasoning (H869/01)",
    "date": "2027-05-13"
  },
  {
    "board": "OCR",
    "level": "Level 3",
    "subject": "Core Maths B (MEI)",
    "tier": "N/A",
    "paper": 2,
    "paperName": "Statistical problem solving (H869/02)",
    "date": "2027-05-21"
  },
]

export const EXAM_DATES_2027 = [...GCSE_2027, ...ASLEVEL_2027, ...CCEA_ASLEVEL_2027, ...ALEVEL_2027, ...L2_2027]

// Board naming (every Eduqas/WJEC spelling) is resolved once in ./boards. This file only owns how ITS
// data is keyed: every Eduqas/WJEC entry here is stored under 'Eduqas', all other boards under
// their own name. Without that mapping a WJEC-board student matched zero exam dates for every
// subject at every level — the opposite failure to board-mixing (silently empty), but just as much
// a case of the app getting a board wrong. An unsupported board (e.g. legacy 'Cambridge') matches
// nothing here, as it should.
const EXAM_DATA_BOARD_KEYS = { WJEC: 'Eduqas' }
function resolveExamBoard(board) {
  const canon = canonicalBoard(board)
  return EXAM_DATA_BOARD_KEYS[canon] || canon
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
