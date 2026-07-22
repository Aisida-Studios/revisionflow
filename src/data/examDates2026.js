// Official 2026 and 2027 Exam Timetables
// Rules enforced:
// 1. Dates parsed using new Date(year, month - 1, day) local components.
// 2. GCSE, AS-Level, and A-Level remain separate qualifications.

export function isTiered(subject) {
  if (!subject) return false;
  const name = typeof subject === 'string' ? subject.toLowerCase() : (subject.name || '').toLowerCase();
  const tieredList = [
    "maths", "mathematics",
    "biology", "chemistry", "physics",
    "combined science", "science", "double award",
    "french", "german", "spanish", "latin"
  ];
  return tieredList.some(t => name.includes(t));
}

export const EXAM_DATES_2026 = [
  // GCSE
  {
    id: "gcse_cs_p1_2026",
    qualification: "GCSE",
    subject: "Computer Science",
    board: "AQA",
    title: "Paper 1 (Computational Thinking & Programming)",
    date: new Date(2026, 4, 11), // May 11, 2026
    session: "AM"
  },
  {
    id: "gcse_bio_p1_2026",
    qualification: "GCSE",
    subject: "Biology",
    board: "AQA",
    title: "Paper 1 (Foundation & Higher)",
    date: new Date(2026, 4, 12), // May 12, 2026
    session: "AM"
  },
  {
    id: "gcse_eng_lit_p1_2026",
    qualification: "GCSE",
    subject: "English Literature",
    board: "AQA",
    title: "Paper 1 (Shakespeare & 19th Century Novel)",
    date: new Date(2026, 4, 13), // May 13, 2026
    session: "AM"
  },
  {
    id: "gcse_maths_p1_2026",
    qualification: "GCSE",
    subject: "Mathematics",
    board: "Edexcel",
    title: "Paper 1 (Non-Calculator)",
    date: new Date(2026, 4, 15), // May 15, 2026
    session: "AM"
  },
  {
    id: "gcse_chem_p1_2026",
    qualification: "GCSE",
    subject: "Chemistry",
    board: "AQA",
    title: "Paper 1 (Foundation & Higher)",
    date: new Date(2026, 4, 18), // May 18, 2026
    session: "AM"
  },
  {
    id: "gcse_eng_lang_p1_2026",
    qualification: "GCSE",
    subject: "English Language",
    board: "AQA",
    title: "Paper 1 (Creative Reading & Writing)",
    date: new Date(2026, 4, 21), // May 21, 2026
    session: "AM"
  },
  {
    id: "gcse_physics_p1_2026",
    qualification: "GCSE",
    subject: "Physics",
    board: "AQA",
    title: "Paper 1 (Foundation & Higher)",
    date: new Date(2026, 4, 22), // May 22, 2026
    session: "AM"
  },
  {
    id: "gcse_maths_p2_2026",
    qualification: "GCSE",
    subject: "Mathematics",
    board: "Edexcel",
    title: "Paper 2 (Calculator)",
    date: new Date(2026, 5, 3), // June 3, 2026
    session: "AM"
  },
  {
    id: "gcse_eng_lang_p2_2026",
    qualification: "GCSE",
    subject: "English Language",
    board: "AQA",
    title: "Paper 2 (Writers' Viewpoints & Perspectives)",
    date: new Date(2026, 5, 5), // June 5, 2026
    session: "AM"
  },
  {
    id: "gcse_maths_p3_2026",
    qualification: "GCSE",
    subject: "Mathematics",
    board: "Edexcel",
    title: "Paper 3 (Calculator)",
    date: new Date(2026, 5, 10), // June 10, 2026
    session: "AM"
  },
  {
    id: "gcse_contingency_2026",
    qualification: "GCSE",
    subject: "All Subjects",
    board: "JCQ",
    title: "National Examination Contingency Day",
    date: new Date(2026, 5, 24), // June 24, 2026
    session: "ALL_DAY"
  },
  // AS-Level
  {
    id: "as_econ_p1_2026",
    qualification: "AS-Level",
    subject: "Economics",
    board: "AQA",
    title: "Paper 1 (Operation of Markets & Market Failure)",
    date: new Date(2026, 4, 11), // May 11, 2026
    session: "AM"
  },
  {
    id: "as_chem_p1_2026",
    qualification: "AS-Level",
    subject: "Chemistry",
    board: "AQA",
    title: "Paper 1 (Inorganic & Physical Chemistry)",
    date: new Date(2026, 4, 12), // May 12, 2026
    session: "AM"
  },
  // A-Level
  {
    id: "alevel_econ_p1_2026",
    qualification: "A-Level",
    subject: "Economics",
    board: "AQA",
    title: "Paper 1 (Markets and Market Failure)",
    date: new Date(2026, 4, 11), // May 11, 2026
    session: "AM"
  },
  {
    id: "alevel_psych_p1_2026",
    qualification: "A-Level",
    subject: "Psychology",
    board: "AQA",
    title: "Paper 1 (Introductory Topics in Psychology)",
    date: new Date(2026, 4, 14), // May 14, 2026
    session: "AM"
  },
  {
    id: "alevel_maths_p1_2026",
    qualification: "A-Level",
    subject: "Mathematics",
    board: "Edexcel",
    title: "Paper 1 (Pure Mathematics 1)",
    date: new Date(2026, 4, 20), // May 20, 2026
    session: "AM"
  },
  {
    id: "alevel_chem_p1_2026",
    qualification: "A-Level",
    subject: "Chemistry",
    board: "AQA",
    title: "Paper 1 (Inorganic and Physical Chemistry)",
    date: new Date(2026, 4, 22), // May 22, 2026
    session: "AM"
  },
  {
    id: "alevel_maths_p2_2026",
    qualification: "A-Level",
    subject: "Mathematics",
    board: "Edexcel",
    title: "Paper 2 (Pure Mathematics 2)",
    date: new Date(2026, 5, 4), // June 4, 2026
    session: "AM"
  },
  {
    id: "alevel_contingency_2026",
    qualification: "A-Level",
    subject: "All Subjects",
    board: "JCQ",
    title: "National Examination Contingency Day",
    date: new Date(2026, 5, 24), // June 24, 2026
    session: "ALL_DAY"
  }
];

export const EXAM_DATES_2027 = [
  // GCSE
  {
    id: "gcse_cs_p1_2027",
    qualification: "GCSE",
    subject: "Computer Science",
    board: "AQA",
    title: "Paper 1 (Computational Thinking & Programming)",
    date: new Date(2027, 4, 10), // May 10, 2027
    session: "AM"
  },
  {
    id: "gcse_bio_p1_2027",
    qualification: "GCSE",
    subject: "Biology",
    board: "AQA",
    title: "Paper 1 (Foundation & Higher)",
    date: new Date(2027, 4, 11), // May 11, 2027
    session: "AM"
  },
  {
    id: "gcse_eng_lit_p1_2027",
    qualification: "GCSE",
    subject: "English Literature",
    board: "AQA",
    title: "Paper 1 (Shakespeare & 19th Century Novel)",
    date: new Date(2027, 4, 12), // May 12, 2027
    session: "AM"
  },
  {
    id: "gcse_maths_p1_2027",
    qualification: "GCSE",
    subject: "Mathematics",
    board: "Edexcel",
    title: "Paper 1 (Non-Calculator)",
    date: new Date(2027, 4, 14), // May 14, 2027
    session: "AM"
  },
  {
    id: "gcse_chem_p1_2027",
    qualification: "GCSE",
    subject: "Chemistry",
    board: "AQA",
    title: "Paper 1 (Foundation & Higher)",
    date: new Date(2027, 4, 17), // May 17, 2027
    session: "AM"
  },
  {
    id: "gcse_eng_lang_p1_2027",
    qualification: "GCSE",
    subject: "English Language",
    board: "AQA",
    title: "Paper 1 (Creative Reading & Writing)",
    date: new Date(2027, 4, 24), // May 24, 2027
    session: "AM"
  },
  {
    id: "gcse_physics_p1_2027",
    qualification: "GCSE",
    subject: "Physics",
    board: "AQA",
    title: "Paper 1 (Foundation & Higher)",
    date: new Date(2027, 4, 25), // May 25, 2027
    session: "AM"
  },
  {
    id: "gcse_maths_p2_2027",
    qualification: "GCSE",
    subject: "Mathematics",
    board: "Edexcel",
    title: "Paper 2 (Calculator)",
    date: new Date(2027, 4, 27), // May 27, 2027
    session: "AM"
  },
  {
    id: "gcse_eng_lang_p2_2027",
    qualification: "GCSE",
    subject: "English Language",
    board: "AQA",
    title: "Paper 2 (Writers' Viewpoints & Perspectives)",
    date: new Date(2027, 5, 8), // June 8, 2027
    session: "AM"
  },
  {
    id: "gcse_maths_p3_2027",
    qualification: "GCSE",
    subject: "Mathematics",
    board: "Edexcel",
    title: "Paper 3 (Calculator)",
    date: new Date(2027, 5, 14), // June 14, 2027
    session: "AM"
  },
  {
    id: "gcse_contingency_2027",
    qualification: "GCSE",
    subject: "All Subjects",
    board: "JCQ",
    title: "National Examination Contingency Day",
    date: new Date(2027, 5, 23), // June 23, 2027
    session: "ALL_DAY"
  },
  // AS-Level
  {
    id: "as_econ_p1_2027",
    qualification: "AS-Level",
    subject: "Economics",
    board: "AQA",
    title: "Paper 1 (Operation of Markets & Market Failure)",
    date: new Date(2027, 4, 10), // May 10, 2027
    session: "AM"
  },
  {
    id: "as_chem_p1_2027",
    qualification: "AS-Level",
    subject: "Chemistry",
    board: "AQA",
    title: "Paper 1 (Inorganic & Physical Chemistry)",
    date: new Date(2027, 4, 11), // May 11, 2027
    session: "AM"
  },
  {
    id: "as_bio_p1_2027",
    qualification: "AS-Level",
    subject: "Biology",
    board: "AQA",
    title: "Paper 1 (Biological Processes)",
    date: new Date(2027, 4, 13), // May 13, 2027
    session: "AM"
  },
  {
    id: "as_psych_p1_2027",
    qualification: "AS-Level",
    subject: "Psychology",
    board: "AQA",
    title: "Paper 1 (Introductory Topics in Psychology)",
    date: new Date(2027, 4, 18), // May 18, 2027
    session: "AM"
  },
  // A-Level
  {
    id: "alevel_econ_p1_2027",
    qualification: "A-Level",
    subject: "Economics",
    board: "AQA",
    title: "Paper 1 (Markets and Market Failure)",
    date: new Date(2027, 4, 10), // May 10, 2027
    session: "AM"
  },
  {
    id: "alevel_psych_p1_2027",
    qualification: "A-Level",
    subject: "Psychology",
    board: "AQA",
    title: "Paper 1 (Introductory Topics in Psychology)",
    date: new Date(2027, 4, 18), // May 18, 2027
    session: "AM"
  },
  {
    id: "alevel_maths_p1_2027",
    qualification: "A-Level",
    subject: "Mathematics",
    board: "Edexcel",
    title: "Paper 1 (Pure Mathematics 1)",
    date: new Date(2027, 4, 26), // May 26, 2027
    session: "AM"
  },
  {
    id: "alevel_chem_p1_2027",
    qualification: "A-Level",
    subject: "Chemistry",
    board: "AQA",
    title: "Paper 1 (Inorganic and Physical Chemistry)",
    date: new Date(2027, 4, 28), // May 28, 2027
    session: "AM"
  },
  {
    id: "alevel_maths_p2_2027",
    qualification: "A-Level",
    subject: "Mathematics",
    board: "Edexcel",
    title: "Paper 2 (Pure Mathematics 2)",
    date: new Date(2027, 5, 9), // June 9, 2027
    session: "AM"
  },
  {
    id: "alevel_maths_p3_2027",
    qualification: "A-Level",
    subject: "Mathematics",
    board: "Edexcel",
    title: "Paper 3 (Statistics & Mechanics)",
    date: new Date(2027, 5, 16), // June 16, 2027
    session: "AM"
  },
  {
    id: "alevel_contingency_2027",
    qualification: "A-Level",
    subject: "All Subjects",
    board: "JCQ",
    title: "National Examination Contingency Day",
    date: new Date(2027, 5, 23), // June 23, 2027
    session: "ALL_DAY"
  }
];

export const ALL_EXAM_DATES = [...EXAM_DATES_2026, ...EXAM_DATES_2027];
