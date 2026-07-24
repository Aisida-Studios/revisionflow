// src/data/examDatabase.js
// ─────────────────────────────────────────────────────────────────────────────
// ⚠ AUDIT FLAG (July 2026) — READ BEFORE EXTENDING THIS FILE
//
// This file substantially duplicates data that now lives — in a more current, more carefully
// audited form — in three other files: BOARD_SUBJECTS overlaps subjects.js, SPEC_TOPICS overlaps
// topics.js, and EXAM_DATES_2026/PAPER_STRUCTURES overlap examDates2026.js/paperDatabase.js. This
// file is also NOT listed in the project's own "Key file paths" documentation, which only lists
// subjects.js/topics.js/themes.js/paperDatabase.js/resourceLinks.js under src/data/ — suggesting
// this file may already be legacy/superseded and possibly not imported anywhere live.
//
// Two concrete problems found this pass, neither fixed here (see reasoning below):
//   1. BOARD_SUBJECTS uses older naming that had drifted from the canonical subjects.js (e.g. this
//      file said 'Business Studies' where subjects.js/topics.js say 'Business' — the clearest
//      instances of that specific mismatch were corrected in this pass, but this file was not
//      otherwise re-synced subject-by-subject against subjects.js). It also has no AS-Level
//      breakdown at all, unlike subjects.js which now separates GCSE/AS-Level/A-Level fully.
//   2. EXAM_DATES_2026 contains genuine data corruption, not just staleness: roughly 100 entries
//      have their fields scrambled (real dates like "04 Jun 2026 PM" sitting in the `duration`
//      field; paper-title fragments sitting in `date`/`session`) in at least 5 places where
//      differently-formatted data blocks were concatenated together without reconciling schemas.
//      Anything reading dates from THIS file's EXAM_DATES_2026 (as opposed to the separate,
//      clean examDates2026.js file) should be treated as unreliable until that's fixed.
//
// Given the scale of this file (~16,000 lines) and that it duplicates better-maintained data
// elsewhere, it wasn't rebuilt in this pass — doing so risks being wasted effort if nothing
// imports it. Before extending or fixing this file further: confirm what (if anything) in the
// app actually imports from examDatabase.js specifically, rather than from subjects.js/topics.js/
// examDates2026.js/paperDatabase.js. If nothing does, deleting this file removes both the
// corruption risk above and an ongoing double-maintenance burden. If something does import it,
// identify exactly which export it uses so that surface can be fixed or migrated specifically,
// rather than reconciling all ~16,000 lines against the newer files on the chance they're needed.
// ─────────────────────────────────────────────────────────────────────────────
// Verified 2026 exam dates sourced from official AQA, Edexcel/Pearson, OCR, WJEC, CCEA timetables
// Last verified: March 2026
// Grade boundaries: sourced from published 2024 results (2026 boundaries available after results day Aug 2026)
// Topics: sourced from official published specifications

// ─────────────────────────────────────────────────────────────────────────────
// GRADING SYSTEMS
// ─────────────────────────────────────────────────────────────────────────────
export const GRADING_SYSTEMS = {
  GCSE_STANDARD: { type: 'numeric', grades: ['9','8','7','6','5','4','3','2','1','U'], label: '9-1' },
  GCSE_COMBINED: { type: 'double', grades: ['9-9','9-8','8-8','8-7','7-7','7-6','6-6','6-5','5-5','5-4','4-4','4-3','3-3','U'], label: 'Double Award' },
  ALEVEL: { type: 'letter', grades: ['A*','A','B','C','D','E','U'], label: 'A*-E' },
  BTEC_L2: { type: 'btec', grades: ['D*','D','M','P','U'], label: 'D*-U' },
  BTEC_L3: { type: 'btec', grades: ['D*','D','M','P','U'], label: 'D*-U' },
  CAMBRIDGE_IGCSE: { type: 'letter', grades: ['A*','A','B','C','D','E','F','G','U'], label: 'A*-G' },
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAM BOARDS AND SUBJECTS THEY OFFER
// Key: board name, Value: array of subject names they offer at GCSE/A-Level
// ─────────────────────────────────────────────────────────────────────────────
export const BOARD_SUBJECTS = {
  AQA: {
    GCSE: [
      'Biology','Chemistry','Physics','Combined Science: Trilogy','Combined Science: Synergy',
      'Mathematics','Further Mathematics',
      'English Language','English Literature',
      'History','Geography',
      'Computer Science',
      'Art & Design','Music','Drama',
      'Physical Education',
      'French','German','Spanish','Mandarin Chinese','Arabic','Polish','Urdu',
      'Religious Studies','Sociology','Psychology',
      'Business','Economics',
      'Media Studies','Film Studies',
      'Food Preparation & Nutrition',
      'Design & Technology',
      'Engineering',
      'Statistics',
    ],
    ALEVEL: [
      'Biology','Chemistry','Physics',
      'Mathematics','Further Mathematics','Statistics',
      'English Language','English Literature','English Language & Literature',
      'History','Geography',
      'Computer Science',
      'Art & Design','Music','Dance','Drama & Theatre Studies',
      'Physical Education',
      'French','German','Spanish','Mandarin Chinese','Arabic',
      'Religious Studies','Philosophy','Sociology','Psychology',
      'Business','Economics','Accounting',
      'Law','Politics',
      'Media Studies','Film Studies',
      'Design & Technology','Product Design',
      'Environmental Science',
    ],
  },
  Edexcel: {
    GCSE: [
      'Biology','Chemistry','Physics','Combined Science',
      'Mathematics',
      'English Language','English Literature',
      'History','Geography',
      'Computer Science',
      'Art & Design','Music','Drama',
      'Physical Education',
      'French','German','Spanish','Italian','Chinese',
      'Religious Studies','Sociology','Psychology',
      'Business','Economics',
      'Media Studies',
      'Food Technology',
      'Design & Technology',
      'Engineering',
      'Statistics',
    ],
    ALEVEL: [
      'Biology','Chemistry','Physics',
      'Mathematics','Further Mathematics','Statistics',
      'English Language','English Literature','English Language & Literature',
      'History','Geography',
      'Computer Science',
      'Art & Design','Music','Drama & Theatre',
      'Physical Education',
      'French','German','Spanish','Italian','Chinese',
      'Religious Studies','Philosophy','Sociology','Psychology',
      'Business','Economics','Accounting',
      'Law','Politics',
      'Media Studies',
      'Design & Technology',
      'Environmental Science',
    ],
  },
  OCR: {
    GCSE: [
      'Biology','Chemistry','Physics','Combined Science A','Combined Science B',
      'Mathematics',
      'English Language','English Literature',
      'History','Geography',
      'Computer Science',
      'Art & Design','Music','Drama',
      'Physical Education',
      'French','German','Spanish','Latin','Classical Greek',
      'Religious Studies','Sociology','Psychology',
      'Business','Economics',
      'Media Studies',
      'Food Technology',
      'Design & Technology',
      'Engineering',
    ],
    ALEVEL: [
      'Biology','Chemistry','Physics',
      'Mathematics','Further Mathematics','Statistics',
      'English Language','English Literature',
      'History','Geography',
      'Computer Science',
      'Art & Design','Music','Drama & Theatre Studies',
      'Physical Education',
      'French','German','Spanish','Latin','Classical Greek',
      'Religious Studies','Philosophy','Sociology','Psychology',
      'Business','Economics','Accounting',
      'Law','Politics',
      'Media Studies',
      'Design & Technology',
    ],
  },
  WJEC: {
    GCSE: [
      'Biology','Chemistry','Physics','Combined Science',
      'Mathematics','Mathematics - Numeracy',
      'English Language','English Literature',
      'History','Geography',
      'Computer Science',
      'Art & Design','Music','Drama',
      'Physical Education',
      'French','German','Spanish','Welsh','Welsh Literature',
      'Religious Studies','Sociology','Psychology',
      'Business','Economics',
      'Media Studies','Film Studies',
      'Food & Nutrition',
      'Design & Technology',
    ],
    ALEVEL: [
      'Biology','Chemistry','Physics',
      'Mathematics','Further Mathematics',
      'English Language','English Literature',
      'History','Geography',
      'Computer Science',
      'Art & Design','Music','Drama',
      'Physical Education',
      'French','German','Spanish','Welsh',
      'Religious Studies','Sociology','Psychology',
      'Business','Economics',
      'Media Studies','Film Studies',
    ],
  },
  CCEA: {
    GCSE: [
      'Biology','Chemistry','Physics','Double Award Science',
      'Mathematics',
      'English Language','English Literature',
      'History','Geography',
      'Computer Science',
      'Art & Design','Music','Drama',
      'Physical Education',
      'French','Spanish','Irish',
      'Religious Studies','Sociology',
      'Business','Economics',
      'Media Studies',
      'Technology & Design',
      'Home Economics',
    ],
    ALEVEL: [
      'Biology','Chemistry','Physics',
      'Mathematics','Further Mathematics',
      'English Language','English Literature',
      'History','Geography',
      'Computer Science',
      'Art & Design','Music','Drama',
      'Physical Education',
      'French','Spanish','Irish',
      'Religious Studies','Sociology','Psychology',
      'Business','Economics',
      'Media Studies',
      'Technology & Design',
    ],
  },
  Cambridge: {
    IGCSE: [
      'Biology','Chemistry','Physics','Combined Science',
      'Mathematics','Additional Mathematics',
      'English Language','English Literature',
      'History','Geography',
      'Computer Science',
      'Art & Design','Music','Drama',
      'Physical Education',
      'French','German','Spanish','Mandarin Chinese','Arabic',
      'Religious Studies','Sociology','Psychology',
      'Business','Economics','Accounting',
      'Design & Technology','Food & Nutrition',
    ],
    ALEVEL: [
      'Biology','Chemistry','Physics',
      'Mathematics','Further Mathematics',
      'English Language','English Literature',
      'History','Geography',
      'Computer Science',
      'Art & Design','Music',
      'French','German','Spanish','Mandarin Chinese','Arabic',
      'Sociology','Psychology',
      'Business','Economics','Accounting',
      'Law',
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// 2026 EXAM DATES - VERIFIED FROM OFFICIAL TIMETABLES
// ─────────────────────────────────────────────────────────────────────────────
// Format: { board, subject, qualification, papers: [{ name, date, duration, code }] }
// Dates sourced from: AQA confirmed timetable v1.1, Pearson/Edexcel confirmed timetable,
// OCR confirmed timetable, WJEC confirmed timetable
// ─────────────────────────────────────────────────────────────────────────────
export const EXAM_DATES_2026 = [
  {
    "board": "AQA",
    "subject": "Art & Design (Art, Craft & Design)",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Portfolio & Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "10h",
        "code": "8201"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (Fine Art)",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Portfolio & Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "10h",
        "code": "8202"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (Graphic Communication)",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Portfolio & Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "10h",
        "code": "8203"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (Textile Design)",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Portfolio & Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "10h",
        "code": "8204"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (Three-dimensional Design)",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Portfolio & Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "10h",
        "code": "8205"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (Photography)",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Portfolio & Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "10h",
        "code": "8206"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Bengali",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-06-03",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8638"
      },
      {
        "name": "Reading (F/H)",
        "date": "2026-06-03",
        "session": "PM",
        "duration": "45m/1h",
        "code": "8638"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "1h/1h15m",
        "code": "8638"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Biology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-05-12",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8461"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8461"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Business",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Operations and HRM",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8132"
      },
      {
        "name": "Paper 2: Marketing and Finance",
        "date": "2026-05-21",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8132"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Chemistry",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8462"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8462"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Chinese (Mandarin)",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8673"
      },
      {
        "name": "Reading (F/H)",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "45m/1h",
        "code": "8673"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "1h/1h15m",
        "code": "8673"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Citizenship Studies",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-07",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8100"
      },
      {
        "name": "Paper 2",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8100"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Combined Science: Trilogy",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 Biology (F/H)",
        "date": "2026-05-12",
        "session": "PM",
        "duration": "1h 15m",
        "code": "8464"
      },
      {
        "name": "Paper 2 Biology (F/H)",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8464"
      },
      {
        "name": "Paper 1 Chemistry (F/H)",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8464"
      },
      {
        "name": "Paper 2 Chemistry (F/H)",
        "date": "2026-06-12",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8464"
      },
      {
        "name": "Paper 1 Physics (F/H)",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8464"
      },
      {
        "name": "Paper 2 Physics (F/H)",
        "date": "2026-06-15",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8464"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Combined Science: Synergy",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Life & Environmental Sciences (F/H)",
        "date": "2026-05-12",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8465"
      },
      {
        "name": "Paper 2: Life & Environmental Sciences (F/H)",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8465"
      },
      {
        "name": "Paper 3: Physical Sciences (F/H)",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8465"
      },
      {
        "name": "Paper 4: Physical Sciences (F/H)",
        "date": "2026-06-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8465"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Computer Science",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Computational Thinking & Programming (choice of language)",
        "date": "2026-05-13",
        "session": "PM",
        "duration": "2h",
        "code": "8525"
      },
      {
        "name": "Paper 2: Computing Concepts",
        "date": "2026-05-19",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8525"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Dance",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Performance & Choreography (NEA)",
        "date": "Submit by 07 May 2026",
        "session": "\u2014",
        "duration": "\u2014",
        "code": "8236"
      },
      {
        "name": "Dance Appreciation (Written)",
        "date": "2026-06-12",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8236"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Design and Technology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Written Paper",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "2h",
        "code": "8552"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Drama",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Understanding Drama (Written)",
        "date": "2026-05-08",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8261"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Economics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: How Markets Work",
        "date": "2026-05-08",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8136"
      },
      {
        "name": "Paper 2: How the Economy Works",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8136"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Engineering",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Written Paper",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "2h",
        "code": "8852"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "English Language",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Explorations in Creative Reading & Writing",
        "date": "2026-05-21",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8700"
      },
      {
        "name": "Paper 2: Writers' Viewpoints & Perspectives",
        "date": "2026-06-05",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8700"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "English Literature",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Shakespeare & 19th Century Novel",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8702"
      },
      {
        "name": "Paper 2: Modern Texts and Poetry",
        "date": "2026-05-19",
        "session": "AM",
        "duration": "2h 15m",
        "code": "8702"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Food Preparation and Nutrition",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-06-11",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8585"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "French",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-05-20",
        "session": "AM",
        "duration": "35m/45m",
        "code": "8652"
      },
      {
        "name": "Reading (F/H)",
        "date": "2026-05-20",
        "session": "AM",
        "duration": "45m/1h",
        "code": "8652"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-04",
        "session": "PM",
        "duration": "1h10m/1h15m",
        "code": "8652"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Geography",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Living with the Physical Environment",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8035"
      },
      {
        "name": "Paper 2: Challenges in the Human Environment",
        "date": "2026-06-03",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8035"
      },
      {
        "name": "Paper 3: Geographical Applications",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8035"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "German",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-05-07",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8662"
      },
      {
        "name": "Reading (F/H)",
        "date": "2026-05-07",
        "session": "PM",
        "duration": "45m/1h",
        "code": "8662"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "1h10m/1h15m",
        "code": "8662"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "History",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Understanding the Modern World (2h combined \u2013 options 1A+1B)",
        "date": "2026-05-15",
        "session": "AM",
        "duration": "2h",
        "code": "8145"
      },
      {
        "name": "Paper 2: Shaping the Nation (2h combined \u2013 options 2A+2B)",
        "date": "2026-06-04",
        "session": "AM",
        "duration": "2h",
        "code": "8145"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Italian",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "35m/45m",
        "code": "8633"
      },
      {
        "name": "Reading (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "45m/1h",
        "code": "8633"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "1h/1h15m",
        "code": "8633"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Mathematics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Non-Calculator (F/H)",
        "date": "2026-05-14",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8300"
      },
      {
        "name": "Paper 2: Calculator (F/H)",
        "date": "2026-06-03",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8300"
      },
      {
        "name": "Paper 3: Calculator (F/H)",
        "date": "2026-06-10",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8300"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Media Studies",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8572"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8572"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Modern Hebrew",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8678"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-17",
        "session": "AM",
        "duration": "1h/1h15m",
        "code": "8678"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Music",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Understanding Music (Written)",
        "date": "2026-06-05",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8271"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Panjabi",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8683"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "1h/1h15m",
        "code": "8683"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Physical Education",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Human Body & Movement",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8582"
      },
      {
        "name": "Paper 2: Socio-cultural Influences & Wellbeing",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8582"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Physics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8463"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-15",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8463"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Polish",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8688"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-12",
        "session": "PM",
        "duration": "1h/1h15m",
        "code": "8688"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Psychology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Cognition and Behaviour",
        "date": "2026-05-07",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8182"
      },
      {
        "name": "Paper 2: Social Context and Behaviour",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8182"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Religious Studies A",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Study of Religions (2 options)",
        "date": "2026-05-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8062"
      },
      {
        "name": "Paper 2A or 2B: Thematic Studies",
        "date": "2026-05-20",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8062"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Religious Studies B",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Catholic Christianity",
        "date": "2026-05-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8063"
      },
      {
        "name": "Paper 2: Perspectives on Faith",
        "date": "2026-05-20",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8063"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Sociology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Families and Education",
        "date": "2026-05-08",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8192"
      },
      {
        "name": "Paper 2: Crime, Deviance & Social Stratification",
        "date": "TBC",
        "session": "\u2014",
        "duration": "1h 45m",
        "code": "8192"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Spanish",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "TBC",
        "session": "\u2014",
        "duration": "35m/45m",
        "code": "8698"
      },
      {
        "name": "Reading (F/H)",
        "date": "TBC",
        "session": "\u2014",
        "duration": "45m/1h",
        "code": "8698"
      },
      {
        "name": "Writing (F/H)",
        "date": "TBC",
        "session": "\u2014",
        "duration": "1h10m/1h15m",
        "code": "8698"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Statistics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1",
        "date": "TBC",
        "session": "\u2014",
        "duration": "1h 30m",
        "code": "8382"
      },
      {
        "name": "Paper 2",
        "date": "TBC",
        "session": "\u2014",
        "duration": "1h 30m",
        "code": "8382"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Accounting",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Financial Accounting",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "3h",
        "code": "7127"
      },
      {
        "name": "Paper 2: Accounting for Analysis & Decision",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "3h",
        "code": "7127"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (Art,Craft & Design)",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "15h",
        "code": "7201"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (Fine Art)",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "15h",
        "code": "7202"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (Graphic Communication)",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "15h",
        "code": "7203"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (Textile Design)",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "15h",
        "code": "7204"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (3D Design)",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "15h",
        "code": "7205"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (Photography)",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "15h",
        "code": "7206"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Bengali",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Reading and Writing",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7637"
      },
      {
        "name": "Paper 2: Writing",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "2h",
        "code": "7637"
      },
      {
        "name": "Paper 3: Listening, Reading & Writing",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7637"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Biblical Hebrew",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Translation, Comprehension & Composition",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "3h",
        "code": "7677"
      },
      {
        "name": "Paper 2: Prose Literature",
        "date": "2026-06-03",
        "session": "AM",
        "duration": "2h",
        "code": "7677"
      },
      {
        "name": "Paper 3: Poetry",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "2h",
        "code": "7677"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Biology",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-06-04",
        "session": "PM",
        "duration": "2h",
        "code": "7402"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-12",
        "session": "AM",
        "duration": "2h",
        "code": "7402"
      },
      {
        "name": "Paper 3",
        "date": "2026-06-16",
        "session": "AM",
        "duration": "2h",
        "code": "7402"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Business",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Business 1",
        "date": "2026-05-13",
        "session": "PM",
        "duration": "2h",
        "code": "7132"
      },
      {
        "name": "Paper 2: Business 2",
        "date": "2026-05-19",
        "session": "AM",
        "duration": "2h",
        "code": "7132"
      },
      {
        "name": "Paper 3: Business 3",
        "date": "2026-06-09",
        "session": "PM",
        "duration": "2h",
        "code": "7132"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Chemistry",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Inorganic & Physical Chemistry",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "2h",
        "code": "7405"
      },
      {
        "name": "Paper 2: Organic & Physical Chemistry",
        "date": "2026-06-09",
        "session": "AM",
        "duration": "2h",
        "code": "7405"
      },
      {
        "name": "Paper 3",
        "date": "2026-06-15",
        "session": "AM",
        "duration": "2h",
        "code": "7405"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Computer Science",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1 (On-screen, choice of language)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "2h 30m",
        "code": "7517"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-17",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7517"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Dance",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Critical Engagement (Written)",
        "date": "2026-05-19",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7237"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Design & Technology: Fashion & Textiles",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7562"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-10",
        "session": "AM",
        "duration": "1h 30m",
        "code": "7562"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Design & Technology: Product Design",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7552"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-10",
        "session": "AM",
        "duration": "1h 30m",
        "code": "7552"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Drama and Theatre",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Written Paper: Drama and Theatre",
        "date": "2026-05-21",
        "session": "AM",
        "duration": "3h",
        "code": "7262"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Economics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Markets and Market Failure",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "2h",
        "code": "7136"
      },
      {
        "name": "Paper 2: National and International Economy",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "2h",
        "code": "7136"
      },
      {
        "name": "Paper 3: Economic Principles and Issues",
        "date": "2026-06-04",
        "session": "AM",
        "duration": "2h",
        "code": "7136"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "English Language",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Language, the Individual and Society",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7702"
      },
      {
        "name": "Paper 2: Language Diversity and Change",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7702"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "English Language & Literature",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Telling Stories",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "3h",
        "code": "7707"
      },
      {
        "name": "Paper 2: Exploring Conflict",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7707"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "English Literature A",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Love Through the Ages",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "3h",
        "code": "7712"
      },
      {
        "name": "Paper 2: Texts in Shared Contexts (option)",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7712"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "English Literature B",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Literary Genres (Tragedy/Comedy)",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7717"
      },
      {
        "name": "Paper 2: Texts and Genres (option)",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "3h",
        "code": "7717"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Environmental Science",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "3h",
        "code": "7447"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-05",
        "session": "AM",
        "duration": "3h",
        "code": "7447"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "French",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Listening, Reading & Writing",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7652"
      },
      {
        "name": "Paper 2: Writing",
        "date": "2026-06-17",
        "session": "AM",
        "duration": "2h",
        "code": "7652"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Further Mathematics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Pure Core",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "2h",
        "code": "7367"
      },
      {
        "name": "Paper 2 (optional route)",
        "date": "2026-05-15",
        "session": "AM",
        "duration": "1h",
        "code": "7367"
      },
      {
        "name": "Paper 3 (optional route)",
        "date": "2026-05-15",
        "session": "PM",
        "duration": "1h",
        "code": "7367"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Geography",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Physical Geography",
        "date": "2026-05-12",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7037"
      },
      {
        "name": "Paper 2: Human Geography",
        "date": "2026-05-21",
        "session": "PM",
        "duration": "2h 30m",
        "code": "7037"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "German",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Listening, Reading & Writing",
        "date": "2026-05-19",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7662"
      },
      {
        "name": "Paper 2: Writing",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "2h",
        "code": "7662"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "History",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1 (1A+1B option combination)",
        "date": "2026-05-19",
        "session": "PM",
        "duration": "2h 30m",
        "code": "7042"
      },
      {
        "name": "Paper 2 (2A+2B option combination)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "2h 30m",
        "code": "7042"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Law",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-21",
        "session": "PM",
        "duration": "2h",
        "code": "7162"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-01",
        "session": "PM",
        "duration": "2h",
        "code": "7162"
      },
      {
        "name": "Paper 3 (Contract or Human Rights)",
        "date": "2026-06-09",
        "session": "AM",
        "duration": "2h",
        "code": "7162"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Mathematics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1 (Pure)",
        "date": "2026-06-03",
        "session": "PM",
        "duration": "2h",
        "code": "7357"
      },
      {
        "name": "Paper 2 (Pure & Statistics/Mechanics)",
        "date": "2026-06-11",
        "session": "PM",
        "duration": "2h",
        "code": "7357"
      },
      {
        "name": "Paper 3 (Pure & Statistics/Mechanics)",
        "date": "2026-06-18",
        "session": "PM",
        "duration": "2h",
        "code": "7357"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Media Studies",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7572"
      },
      {
        "name": "Paper 2",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7572"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Modern Hebrew",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Reading & Writing",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h 30m",
        "code": "7672"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Music",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Listening paper + Composition NEA + Performance NEA",
        "date": "TBC",
        "session": "\u2014",
        "duration": "Various",
        "code": "7272"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Panjabi",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Reading & Writing",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7682"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Philosophy",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Epistemology & Moral Philosophy",
        "date": "TBC",
        "session": "\u2014",
        "duration": "3h",
        "code": "7172"
      },
      {
        "name": "Paper 2: Metaphysics & Philosophy of Mind/Religion",
        "date": "TBC",
        "session": "\u2014",
        "duration": "3h",
        "code": "7172"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Physical Education",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Factors Affecting Participation",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7582"
      },
      {
        "name": "Paper 2: Factors Affecting Optimal Performance",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7582"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Physics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7408"
      },
      {
        "name": "Paper 2",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7408"
      },
      {
        "name": "Paper 3 (Practical Skills + Options)",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7408"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Polish",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Reading & Writing",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h 30m",
        "code": "7687"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Politics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: UK Politics & Core Political Ideas",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7152"
      },
      {
        "name": "Paper 2: UK Government & Political Ideas",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7152"
      },
      {
        "name": "Paper 3: Comparative Politics (option)",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7152"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Psychology",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Introductory Topics",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7182"
      },
      {
        "name": "Paper 2: Psychology in Context",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7182"
      },
      {
        "name": "Paper 3: Issues & Options",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7182"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Religious Studies",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Philosophy of Religion",
        "date": "TBC",
        "session": "\u2014",
        "duration": "3h",
        "code": "7062"
      },
      {
        "name": "Paper 2: Religion & Ethics",
        "date": "TBC",
        "session": "\u2014",
        "duration": "3h",
        "code": "7062"
      },
      {
        "name": "Paper 3: Study of Religion/Dialogues (opt)",
        "date": "TBC",
        "session": "\u2014",
        "duration": "3h",
        "code": "7062"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Sociology",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Education + Theory & Methods",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7192"
      },
      {
        "name": "Paper 2: Topics in Sociology",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7192"
      },
      {
        "name": "Paper 3: Crime & Deviance + Theory & Methods",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7192"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Spanish",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Listening, Reading & Writing",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h 30m",
        "code": "7692"
      },
      {
        "name": "Paper 2: Writing",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7692"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Arabic",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "35m/45m",
        "code": "1AA0"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "50m/1h05m",
        "code": "1AA0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "1h20m/1h25m",
        "code": "1AA0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Astronomy",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Naked-eye Astronomy",
        "date": "2026-06-01",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1AS0"
      },
      {
        "name": "Paper 2: Telescopic Astronomy",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1AS0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Biblical Hebrew",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Component 1: Language",
        "date": "2026-05-07",
        "session": "AM",
        "duration": "2h 00m",
        "code": "1BH0"
      },
      {
        "name": "Component 2: Literature",
        "date": "2026-05-19",
        "session": "PM",
        "duration": "2h 00m",
        "code": "1BH0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Biology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-05-12",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1BI0"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1BI0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Business",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Investigating Small Business",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1BS0"
      },
      {
        "name": "Paper 2: Building a Business",
        "date": "2026-05-21",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1BS0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Chemistry",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1CH0"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-09",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1CH0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Chinese",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1CN0"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "50m/1h05m",
        "code": "1CN0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "1h20m/1h25m",
        "code": "1CN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Citizenship Studies",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-07",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1CS0"
      },
      {
        "name": "Paper 2",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1CS0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Combined Science",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Biology 1 (F/H)",
        "date": "2026-05-12",
        "session": "PM",
        "duration": "1h 10m",
        "code": "1SC0"
      },
      {
        "name": "Paper 2: Chemistry 1 (F/H)",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "1h 10m",
        "code": "1SC0"
      },
      {
        "name": "Paper 3: Physics 1 (F/H)",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "1h 10m",
        "code": "1SC0"
      },
      {
        "name": "Paper 4: Biology 2 (F/H)",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "1h 10m",
        "code": "1SC0"
      },
      {
        "name": "Paper 5: Chemistry 2 (F/H)",
        "date": "11 Jun 2026",
        "session": "N/A",
        "duration": "1h 10m",
        "code": "1SC0"
      },
      {
        "name": "Paper 6: Physics 2 (F/H)",
        "date": "15 Jun 2026",
        "session": "N/A",
        "duration": "1h 10m",
        "code": "1SC0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Computer Science",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Principles of Computer Science",
        "date": "2026-05-13",
        "session": "PM",
        "duration": "1h 30m",
        "code": "1CP2"
      },
      {
        "name": "Paper 2: Application of Computational Thinking (On-screen, IDE)",
        "date": "2026-05-19",
        "session": "PM",
        "duration": "2h 00m",
        "code": "1CP2"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Drama",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Component 3: Theatre Makers in Practice (Written)",
        "date": "2026-05-08",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1DR0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Design & Technology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Component 1 (choice of material/system)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1DT0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "English Language",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Fiction & Imaginative Writing",
        "date": "2026-05-21",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1EN0"
      },
      {
        "name": "Paper 2: Non-Fiction & Transactional Writing",
        "date": "2026-06-05",
        "session": "AM",
        "duration": "2h 05m",
        "code": "1EN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "English Language 2.0",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Non-Fiction Texts",
        "date": "2026-05-21",
        "session": "AM",
        "duration": "1h 55m",
        "code": "1EN2"
      },
      {
        "name": "Paper 2: Contemporary Texts",
        "date": "2026-06-05",
        "session": "AM",
        "duration": "1h 55m",
        "code": "1EN2"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "English Literature",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Shakespeare & Post-1914 Literature",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1ET0"
      },
      {
        "name": "Paper 2: 19th-Century Novel & Poetry since 1789",
        "date": "2026-05-19",
        "session": "AM",
        "duration": "2h 15m",
        "code": "1ET0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "French",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 2: Listening (F/H)",
        "date": "2026-05-20",
        "session": "AM",
        "duration": "45m/1h00m",
        "code": "1FR1"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-06-04",
        "session": "PM",
        "duration": "45m/1h00m",
        "code": "1FR1"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-08",
        "session": "PM",
        "duration": "1h15m/1h20m",
        "code": "1FR1"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Geography A",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: The Physical Environment",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1GA0"
      },
      {
        "name": "Paper 2: The Human Environment",
        "date": "2026-06-03",
        "session": "PM",
        "duration": "1h 30m",
        "code": "1GA0"
      },
      {
        "name": "Paper 3: Geographical Investigations: Fieldwork & UK Challenges",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1GA0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Geography B",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Global Geographical Issues",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1GB0"
      },
      {
        "name": "Paper 2: UK Geographical Issues",
        "date": "2026-06-03",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1GB0"
      },
      {
        "name": "Paper 3: People & Environment Issues \u2013 Making Decisions",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1GB0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "German",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 2: Listening (F/H)",
        "date": "2026-05-07",
        "session": "PM",
        "duration": "45m/1h00m",
        "code": "1GN1"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "45m/1h00m",
        "code": "1GN1"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-01",
        "session": "PM",
        "duration": "1h15m/1h20m",
        "code": "1GN1"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Greek",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1GK0"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "50m/1h05m",
        "code": "1GK0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Gujarati",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-06-01",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1GU0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-09",
        "session": "PM",
        "duration": "1h20m/1h25m",
        "code": "1GU0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "History",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Thematic Study & Historic Environment",
        "date": "2026-05-15",
        "session": "AM",
        "duration": "1h 20m",
        "code": "1HI0"
      },
      {
        "name": "Paper 2: Period Study & British Depth Study",
        "date": "2026-06-04",
        "session": "AM",
        "duration": "1h 50m",
        "code": "1HI0"
      },
      {
        "name": "Paper 3: Modern Depth Study",
        "date": "2026-06-09",
        "session": "PM",
        "duration": "1h 30m",
        "code": "1HI0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Italian",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "35m/45m",
        "code": "1IN0"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "45m/1h00m",
        "code": "1IN0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "1h15m/1h20m",
        "code": "1IN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Japanese",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "35m/45m",
        "code": "1JA0"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "50m/1h05m",
        "code": "1JA0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-09",
        "session": "AM",
        "duration": "1h20m/1h25m",
        "code": "1JA0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Mathematics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Non-Calculator (F/H)",
        "date": "2026-05-14",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1MA1"
      },
      {
        "name": "Paper 2: Calculator (F/H)",
        "date": "2026-06-03",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1MA1"
      },
      {
        "name": "Paper 3: Calculator (F/H)",
        "date": "2026-06-10",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1MA1"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Music",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Component 3: Appraising",
        "date": "2026-06-05",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1MU0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Physical Education",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Component 1: Fitness & Body Systems",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1PE0"
      },
      {
        "name": "Component 2: Health & Performance",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "1h 15m",
        "code": "1PE0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Persian",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1PN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Physics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1PH0"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1PH0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Portuguese",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1PG0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Psychology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-07",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1PS0"
      },
      {
        "name": "Paper 2",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "1h 20m",
        "code": "1PS0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Religious Studies A",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Area of Study 1 \u2013 Study of Religion",
        "date": "2026-05-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1RA0"
      },
      {
        "name": "Paper 2: Area of Study 2 \u2013 Study of Second Religion",
        "date": "2026-05-20",
        "session": "PM",
        "duration": "50m",
        "code": "1RA0"
      },
      {
        "name": "Paper 3: Philosophy & Ethics",
        "date": "2026-06-01",
        "session": "PM",
        "duration": "50m",
        "code": "1RA0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Religious Studies B",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Religion & Ethics",
        "date": "2026-05-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1RB0"
      },
      {
        "name": "Paper 2: Religion, Peace & Conflict",
        "date": "2026-05-20",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1RB0"
      },
      {
        "name": "Paper 3: Religion, Philosophy & Social Justice",
        "date": "2026-06-01",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1RB0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Russian",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1RU0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "1h20m/1h25m",
        "code": "1RU0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Spanish",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 2: Listening (F/H)",
        "date": "2026-06-09",
        "session": "AM",
        "duration": "45m/1h00m",
        "code": "1SP1"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "11 Jun 2026",
        "session": "N/A",
        "duration": "45m/1h00m",
        "code": "1SP1"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-17",
        "session": "AM",
        "duration": "1h15m/1h20m",
        "code": "1SP1"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Statistics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "1h 30m",
        "code": "1ST0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Turkish",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-05-07",
        "session": "AM",
        "duration": "35m/45m",
        "code": "1TU0"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-05-07",
        "session": "AM",
        "duration": "50m/1h05m",
        "code": "1TU0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "1h20m/1h25m",
        "code": "1TU0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Urdu",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1UR0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "1h20m/1h25m",
        "code": "1UR0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Arabic",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Translation-00-Paper",
        "session": "into",
        "duration": "19 May 2026 PM",
        "code": "9AA0"
      },
      {
        "name": "A-level",
        "date": "Translation-00-Paper",
        "session": "into",
        "duration": "01 Jun 2026 AM",
        "code": "9AA0"
      },
      {
        "name": "A-level",
        "date": "Listening,-00-Paper",
        "session": "Reading",
        "duration": "11 Jun 2026 AM",
        "code": "9AA0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Biology B",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "AS",
        "date": "Core-00-Paper",
        "session": "Cellular",
        "duration": "11 May 2026 AM",
        "code": "8BI0"
      },
      {
        "name": "AS",
        "date": "Core-00-Paper",
        "session": "Physiology",
        "duration": "21 May 2026 AM",
        "code": "8BI0"
      },
      {
        "name": "A-level",
        "date": "Advanced-00-Paper",
        "session": "Biochemistry,",
        "duration": "04 Jun 2026 PM",
        "code": "9BI0"
      },
      {
        "name": "A-level",
        "date": "Advanced-00-Paper",
        "session": "Physiology,",
        "duration": "12 Jun 2026 AM",
        "code": "9BI0"
      },
      {
        "name": "A-level",
        "date": "General-00-Paper",
        "session": "&",
        "duration": "16 Jun 2026 AM",
        "code": "9BI0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Biology A (Salters Nuffield)",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "AS",
        "date": "Lifestyle,-00-Paper",
        "session": "Transport,",
        "duration": "11 May 2026 AM",
        "code": "8BN0"
      },
      {
        "name": "AS",
        "date": "Development,-00-Paper",
        "session": "Plants",
        "duration": "21 May 2026 AM",
        "code": "8BN0"
      },
      {
        "name": "A-level",
        "date": "The-00-Paper",
        "session": "Natural",
        "duration": "04 Jun 2026 PM",
        "code": "9BN0"
      },
      {
        "name": "A-level",
        "date": "Energy,-00-Paper",
        "session": "Exercise",
        "duration": "12 Jun 2026 AM",
        "code": "9BN0"
      },
      {
        "name": "A-level",
        "date": "General-00-Paper",
        "session": "&",
        "duration": "16 Jun 2026 AM",
        "code": "9BN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Business",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "AS",
        "date": "Marketing-00-Paper",
        "session": "and",
        "duration": "15 May 2026 AM",
        "code": "8BS0"
      },
      {
        "name": "AS",
        "date": "Managing-00-Paper",
        "session": "Business",
        "duration": "21 May 2026 PM",
        "code": "8BS0"
      },
      {
        "name": "A-level",
        "date": "Marketing,-00-Paper",
        "session": "People",
        "duration": "13 May 2026 PM",
        "code": "9BS0"
      },
      {
        "name": "A-level",
        "date": "Business-00-Paper",
        "session": "Activities,",
        "duration": "19 May 2026 AM",
        "code": "9BS0"
      },
      {
        "name": "A-level",
        "date": "Investigating-00-Paper",
        "session": "Business",
        "duration": "09 Jun 2026 PM",
        "code": "9BS0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Chemistry",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "AS",
        "date": "Core-00-Paper",
        "session": "Inorganic",
        "duration": "12 May 2026 AM",
        "code": "8CH0"
      },
      {
        "name": "AS",
        "date": "Core-00-Paper",
        "session": "Organic",
        "duration": "19 May 2026 AM",
        "code": "8CH0"
      },
      {
        "name": "A-level",
        "date": "Advanced-00-Paper",
        "session": "Inorganic",
        "duration": "02 Jun 2026 AM",
        "code": "9CH0"
      },
      {
        "name": "A-level",
        "date": "Advanced-00-Paper",
        "session": "Organic",
        "duration": "09 Jun 2026 AM",
        "code": "9CH0"
      },
      {
        "name": "A-level",
        "date": "General-00-Paper",
        "session": "&",
        "duration": "15 Jun 2026 AM",
        "code": "9CH0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Chinese",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Listening,-00-Paper",
        "session": "Reading",
        "duration": "19 May 2026 AM",
        "code": "9CN0"
      },
      {
        "name": "A-level",
        "date": "Written-00-Paper",
        "session": "Response",
        "duration": "01 Jun 2026 AM",
        "code": "9CN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Design & Technology",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Design-00-Component",
        "session": "&",
        "duration": "22 May 2026 AM",
        "code": "9DT0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Drama & Theatre",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Theatre-00-Component",
        "session": "Makers",
        "duration": "21 May 2026 AM",
        "code": "9DR0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Economics A",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Markets-00-Paper",
        "session": "&",
        "duration": "11 May 2026 AM",
        "code": "9EC0"
      },
      {
        "name": "A-level",
        "date": "The-00-Paper",
        "session": "National",
        "duration": "18 May 2026 PM",
        "code": "9EC0"
      },
      {
        "name": "A-level",
        "date": "Microeconomics-00-Paper",
        "session": "&",
        "duration": "04 Jun 2026 AM",
        "code": "9EC0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Economics B",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Markets-00-Paper",
        "session": "&",
        "duration": "11 May 2026 AM",
        "code": "9EB0"
      },
      {
        "name": "A-level",
        "date": "Competing-00-Paper",
        "session": "in",
        "duration": "18 May 2026 PM",
        "code": "9EB0"
      },
      {
        "name": "A-level",
        "date": "The-00-Paper",
        "session": "Economic",
        "duration": "04 Jun 2026 AM",
        "code": "9EB0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "English Language",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "AS",
        "date": "Language:-00-Paper",
        "session": "Context",
        "duration": "11 May 2026 AM",
        "code": "8EN0"
      },
      {
        "name": "AS",
        "date": "Child-00-Paper",
        "session": "Language",
        "duration": "18 May 2026 AM",
        "code": "8EN0"
      },
      {
        "name": "A-level",
        "date": "Language-00-Paper",
        "session": "Variation",
        "duration": "11 May 2026 AM",
        "code": "9EN0"
      },
      {
        "name": "A-level",
        "date": "Child-00-Paper",
        "session": "Language",
        "duration": "22 May 2026 AM",
        "code": "9EN0"
      },
      {
        "name": "A-level",
        "date": "Investigating-00-Paper",
        "session": "Language",
        "duration": "03 Jun 2026 PM",
        "code": "9EN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "English Lang & Literature",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "AS",
        "date": "Voices-00-Paper",
        "session": "in",
        "duration": "11 May 2026 AM",
        "code": "8EL0"
      },
      {
        "name": "AS",
        "date": "Varieties-00-Paper",
        "session": "in",
        "duration": "18 May 2026 AM",
        "code": "8EL0"
      },
      {
        "name": "A-level",
        "date": "Voices-00-Paper",
        "session": "in",
        "duration": "11 May 2026 AM",
        "code": "9EL0"
      },
      {
        "name": "A-level",
        "date": "Varieties-00-Paper",
        "session": "in",
        "duration": "22 May 2026 AM",
        "code": "9EL0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "English Literature",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "AS",
        "date": "Poetry-00-Paper",
        "session": "&",
        "duration": "14 May 2026 AM",
        "code": "8ET0"
      },
      {
        "name": "AS",
        "date": "Paper 2: Prose",
        "session": "N/A",
        "duration": "22 May 2026 AM",
        "code": "8ET0"
      },
      {
        "name": "A-level",
        "date": "Paper 1: Drama",
        "session": "N/A",
        "duration": "13 May 2026 AM",
        "code": "9ET0"
      },
      {
        "name": "A-level",
        "date": "Paper 2: Prose",
        "session": "N/A",
        "duration": "01 Jun 2026 AM",
        "code": "9ET0"
      },
      {
        "name": "A-level",
        "date": "Paper 3: Poetry",
        "session": "N/A",
        "duration": "10 Jun 2026 AM",
        "code": "9ET0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Further Mathematics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Core-00-Paper",
        "session": "Pure",
        "duration": "14 May 2026 PM",
        "code": "9FM0"
      },
      {
        "name": "A-level",
        "date": "Core-00-Paper",
        "session": "Pure",
        "duration": "21 May 2026 PM",
        "code": "9FM0"
      },
      {
        "name": "A-level",
        "date": "Options-00-Paper",
        "session": "(Further",
        "duration": "05\u201319 Jun 2026",
        "code": "9FM0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "French",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Listening,-00-Paper",
        "session": "Reading",
        "duration": "08 Jun 2026 AM",
        "code": "9FR0"
      },
      {
        "name": "A-level",
        "date": "Written-00-Paper",
        "session": "Response",
        "duration": "17 Jun 2026 AM",
        "code": "9FR0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Geography",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Physical-00-Paper",
        "session": "Geography",
        "duration": "12 May 2026 AM",
        "code": "9GE0"
      },
      {
        "name": "A-level",
        "date": "Human-00-Paper",
        "session": "Geography",
        "duration": "21 May 2026 PM",
        "code": "9GE0"
      },
      {
        "name": "A-level",
        "date": "Physical-00-Paper",
        "session": "&",
        "duration": "08 Jun 2026 PM",
        "code": "9GE0"
      },
      {
        "name": "AS",
        "date": "Dynamic-00-Paper",
        "session": "Landscapes",
        "duration": "12 May 2026 PM",
        "code": "8GE0"
      },
      {
        "name": "AS",
        "date": "Dynamic-00-Paper",
        "session": "Places",
        "duration": "20 May 2026 AM",
        "code": "8GE0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "German",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Listening,-00-Paper",
        "session": "Reading",
        "duration": "19 May 2026 AM",
        "code": "9GN0"
      },
      {
        "name": "A-level",
        "date": "Written-00-Paper",
        "session": "Response",
        "duration": "02 Jun 2026 AM",
        "code": "9GN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Greek",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Translation-00-Paper",
        "session": "into",
        "duration": "18 May 2026 AM",
        "code": "9GK0"
      },
      {
        "name": "A-level",
        "date": "Translation-00-Paper",
        "session": "into",
        "duration": "02 Jun 2026 PM",
        "code": "9GK0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "History",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Breadth-00-Paper",
        "session": "Study",
        "duration": "19 May 2026 PM",
        "code": "9HI0"
      },
      {
        "name": "A-level",
        "date": "Depth-00-Paper",
        "session": "Study",
        "duration": "02 Jun 2026 PM",
        "code": "9HI0"
      },
      {
        "name": "A-level",
        "date": "Themes-00-Paper",
        "session": "in",
        "duration": "11 Jun 2026 AM",
        "code": "9HI0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "History of Art",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Visual-00-Paper",
        "session": "Analysis",
        "duration": "18 May 2026 PM",
        "code": "9HT0"
      },
      {
        "name": "A-level",
        "date": "Paper 2: Periods",
        "session": "N/A",
        "duration": "02 Jun 2026 AM",
        "code": "9HT0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Italian",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Listening,-00-Paper",
        "session": "Reading",
        "duration": "12 Jun 2026 AM",
        "code": "9IN0"
      },
      {
        "name": "A-level",
        "date": "Written-00-Paper",
        "session": "Response",
        "duration": "19 Jun 2026 AM",
        "code": "9IN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Japanese",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Translation-00-Paper",
        "session": "into",
        "duration": "19 May 2026 PM",
        "code": "9JA0"
      },
      {
        "name": "A-level",
        "date": "Translation-00-Paper",
        "session": "into",
        "duration": "01 Jun 2026 PM",
        "code": "9JA0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Mathematics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Pure-00-Paper",
        "session": "Mathematics",
        "duration": "03 Jun 2026 PM",
        "code": "9MA0"
      },
      {
        "name": "A-level",
        "date": "Pure-00-Paper",
        "session": "Mathematics",
        "duration": "11 Jun 2026 PM",
        "code": "9MA0"
      },
      {
        "name": "A-level",
        "date": "Statistics-00-Paper",
        "session": "&",
        "duration": "18 Jun 2026 PM",
        "code": "9MA0"
      },
      {
        "name": "AS",
        "date": "Pure-00-Paper",
        "session": "Mathematics",
        "duration": "14 May 2026 PM",
        "code": "8MA0"
      },
      {
        "name": "AS",
        "date": "Statistics-00-Paper",
        "session": "&",
        "duration": "22 May 2026 PM",
        "code": "8MA0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Music",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Component 3: Appraising",
        "session": "N/A",
        "duration": "08 Jun 2026 PM",
        "code": "9MU0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Music Technology",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Listening-00-Component",
        "session": "&",
        "duration": "22 May 2026 AM",
        "code": "9MT0"
      },
      {
        "name": "A-level",
        "date": "Producing-00-Component",
        "session": "&",
        "duration": "03 Jun 2026 AM",
        "code": "9MT0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Physical Education",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Scientific-00-Component",
        "session": "Principles",
        "duration": "21 May 2026 AM",
        "code": "9PE0"
      },
      {
        "name": "A-level",
        "date": "Psychological-00-Component",
        "session": "&",
        "duration": "01 Jun 2026 PM",
        "code": "9PE0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Physics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Advanced-00-Paper",
        "session": "Physics",
        "duration": "20 May 2026 PM",
        "code": "9PH0"
      },
      {
        "name": "A-level",
        "date": "Advanced-00-Paper",
        "session": "Physics",
        "duration": "01 Jun 2026 AM",
        "code": "9PH0"
      },
      {
        "name": "A-level",
        "date": "General-00-Paper",
        "session": "&",
        "duration": "08 Jun 2026 AM",
        "code": "9PH0"
      },
      {
        "name": "AS",
        "date": "Core-00-Paper",
        "session": "Physics",
        "duration": "13 May 2026 AM",
        "code": "8PH0"
      },
      {
        "name": "AS",
        "date": "Core-00-Paper",
        "session": "Physics",
        "duration": "20 May 2026 PM",
        "code": "8PH0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Politics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "UK-00-Paper",
        "session": "Politics",
        "duration": "21 May 2026 AM",
        "code": "9PL0"
      },
      {
        "name": "A-level",
        "date": "UK-00-Paper",
        "session": "Government",
        "duration": "08 Jun 2026 AM",
        "code": "9PL0"
      },
      {
        "name": "A-level",
        "date": "Comparative-00-Paper",
        "session": "Politics",
        "duration": "16 Jun 2026 PM",
        "code": "9PL0"
      },
      {
        "name": "A-level",
        "date": "Comparative-00-Paper",
        "session": "Politics",
        "duration": "16 Jun 2026 PM",
        "code": "9PL0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Psychology",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Foundations-00-Paper",
        "session": "in",
        "duration": "15 May 2026 AM",
        "code": "9PS0"
      },
      {
        "name": "A-level",
        "date": "Applications-00-Paper",
        "session": "of",
        "duration": "20 May 2026 AM",
        "code": "9PS0"
      },
      {
        "name": "A-level",
        "date": "Psychological-00-Paper",
        "session": "Skills",
        "duration": "05 Jun 2026 AM",
        "code": "9PS0"
      },
      {
        "name": "AS",
        "date": "Social-00-Paper",
        "session": "&",
        "duration": "11 May 2026 PM",
        "code": "8PS0"
      },
      {
        "name": "AS",
        "date": "Biological-00-Paper",
        "session": "Psychology",
        "duration": "19 May 2026 PM",
        "code": "8PS0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Religious Studies",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Philosophy-00-Paper",
        "session": "of",
        "duration": "04 Jun 2026 AM",
        "code": "9RS0"
      },
      {
        "name": "A-level",
        "date": "Religion-00-Paper",
        "session": "&",
        "duration": "09 Jun 2026 AM",
        "code": "9RS0"
      },
      {
        "name": "A-level",
        "date": "New-00-Paper",
        "session": "Testament",
        "duration": "15 Jun 2026 PM",
        "code": "9RS0"
      },
      {
        "name": "A-level",
        "date": "Study-00-Paper",
        "session": "of",
        "duration": "22 Jun 2026 PM",
        "code": "9RS0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Russian",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Listening,-00-Paper",
        "session": "Reading",
        "duration": "01 Jun 2026 AM",
        "code": "9RU0"
      },
      {
        "name": "A-level",
        "date": "Written-00-Paper",
        "session": "Response",
        "duration": "08 Jun 2026 PM",
        "code": "9RU0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Spanish",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Listening,-00-Paper",
        "session": "Reading",
        "duration": "04 Jun 2026 AM",
        "code": "9SP0"
      },
      {
        "name": "A-level",
        "date": "Written-00-Paper",
        "session": "Response",
        "duration": "12 Jun 2026 PM",
        "code": "9SP0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Statistics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "A-level",
        "date": "Data-00-Paper",
        "session": "&",
        "duration": "04 Jun 2026 PM",
        "code": "9ST0"
      },
      {
        "name": "A-level",
        "date": "Statistical-00-Paper",
        "session": "Inference",
        "duration": "09 Jun 2026 PM",
        "code": "9ST0"
      },
      {
        "name": "A-level",
        "date": "Statistics-00-Paper",
        "session": "in",
        "duration": "17 Jun 2026 PM",
        "code": "9ST0"
      }
    ]
  }
]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (Fine Art)",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Portfolio & Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "10h",
        "code": "8202"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (Graphic Communication)",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Portfolio & Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "10h",
        "code": "8203"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (Textile Design)",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Portfolio & Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "10h",
        "code": "8204"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (Three-dimensional Design)",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Portfolio & Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "10h",
        "code": "8205"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (Photography)",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Portfolio & Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "10h",
        "code": "8206"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Bengali",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-06-03",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8638"
      },
      {
        "name": "Reading (F/H)",
        "date": "2026-06-03",
        "session": "PM",
        "duration": "45m/1h",
        "code": "8638"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "1h/1h15m",
        "code": "8638"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Biology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-05-12",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8461"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8461"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Business",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Operations and HRM",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8132"
      },
      {
        "name": "Paper 2: Marketing and Finance",
        "date": "2026-05-21",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8132"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Chemistry",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8462"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8462"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Chinese (Mandarin)",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8673"
      },
      {
        "name": "Reading (F/H)",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "45m/1h",
        "code": "8673"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "1h/1h15m",
        "code": "8673"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Citizenship Studies",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-07",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8100"
      },
      {
        "name": "Paper 2",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8100"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Combined Science: Trilogy",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 Biology (F/H)",
        "date": "2026-05-12",
        "session": "PM",
        "duration": "1h 15m",
        "code": "8464"
      },
      {
        "name": "Paper 2 Biology (F/H)",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8464"
      },
      {
        "name": "Paper 1 Chemistry (F/H)",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8464"
      },
      {
        "name": "Paper 2 Chemistry (F/H)",
        "date": "2026-06-12",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8464"
      },
      {
        "name": "Paper 1 Physics (F/H)",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8464"
      },
      {
        "name": "Paper 2 Physics (F/H)",
        "date": "2026-06-15",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8464"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Combined Science: Synergy",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Life & Environmental Sciences (F/H)",
        "date": "2026-05-12",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8465"
      },
      {
        "name": "Paper 2: Life & Environmental Sciences (F/H)",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8465"
      },
      {
        "name": "Paper 3: Physical Sciences (F/H)",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8465"
      },
      {
        "name": "Paper 4: Physical Sciences (F/H)",
        "date": "2026-06-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8465"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Computer Science",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Computational Thinking & Programming (choice of language)",
        "date": "2026-05-13",
        "session": "PM",
        "duration": "2h",
        "code": "8525"
      },
      {
        "name": "Paper 2: Computing Concepts",
        "date": "2026-05-19",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8525"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Dance",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Performance & Choreography (NEA)",
        "date": "Submit by 07 May 2026",
        "session": "\u2014",
        "duration": "\u2014",
        "code": "8236"
      },
      {
        "name": "Dance Appreciation (Written)",
        "date": "2026-06-12",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8236"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Design and Technology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Written Paper",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "2h",
        "code": "8552"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Drama",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Understanding Drama (Written)",
        "date": "2026-05-08",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8261"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Economics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: How Markets Work",
        "date": "2026-05-08",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8136"
      },
      {
        "name": "Paper 2: How the Economy Works",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8136"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Engineering",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Written Paper",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "2h",
        "code": "8852"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "English Language",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Explorations in Creative Reading & Writing",
        "date": "2026-05-21",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8700"
      },
      {
        "name": "Paper 2: Writers' Viewpoints & Perspectives",
        "date": "2026-06-05",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8700"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "English Literature",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Shakespeare & 19th Century Novel",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8702"
      },
      {
        "name": "Paper 2: Modern Texts and Poetry",
        "date": "2026-05-19",
        "session": "AM",
        "duration": "2h 15m",
        "code": "8702"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Food Preparation and Nutrition",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-06-11",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8585"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "French",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-05-20",
        "session": "AM",
        "duration": "35m/45m",
        "code": "8652"
      },
      {
        "name": "Reading (F/H)",
        "date": "2026-05-20",
        "session": "AM",
        "duration": "45m/1h",
        "code": "8652"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-04",
        "session": "PM",
        "duration": "1h10m/1h15m",
        "code": "8652"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Geography",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Living with the Physical Environment",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8035"
      },
      {
        "name": "Paper 2: Challenges in the Human Environment",
        "date": "2026-06-03",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8035"
      },
      {
        "name": "Paper 3: Geographical Applications",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8035"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "German",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-05-07",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8662"
      },
      {
        "name": "Reading (F/H)",
        "date": "2026-05-07",
        "session": "PM",
        "duration": "45m/1h",
        "code": "8662"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "1h10m/1h15m",
        "code": "8662"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "History",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Understanding the Modern World (2h combined \u2013 options 1A+1B)",
        "date": "2026-05-15",
        "session": "AM",
        "duration": "2h",
        "code": "8145"
      },
      {
        "name": "Paper 2: Shaping the Nation (2h combined \u2013 options 2A+2B)",
        "date": "2026-06-04",
        "session": "AM",
        "duration": "2h",
        "code": "8145"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Italian",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "35m/45m",
        "code": "8633"
      },
      {
        "name": "Reading (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "45m/1h",
        "code": "8633"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "1h/1h15m",
        "code": "8633"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Mathematics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Non-Calculator (F/H)",
        "date": "2026-05-14",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8300"
      },
      {
        "name": "Paper 2: Calculator (F/H)",
        "date": "2026-06-03",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8300"
      },
      {
        "name": "Paper 3: Calculator (F/H)",
        "date": "2026-06-10",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8300"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Media Studies",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8572"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8572"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Modern Hebrew",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8678"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-17",
        "session": "AM",
        "duration": "1h/1h15m",
        "code": "8678"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Music",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Understanding Music (Written)",
        "date": "2026-06-05",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8271"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Panjabi",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8683"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "1h/1h15m",
        "code": "8683"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Physical Education",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Human Body & Movement",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8582"
      },
      {
        "name": "Paper 2: Socio-cultural Influences & Wellbeing",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8582"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Physics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8463"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-15",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8463"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Polish",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8688"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-12",
        "session": "PM",
        "duration": "1h/1h15m",
        "code": "8688"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Psychology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Cognition and Behaviour",
        "date": "2026-05-07",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8182"
      },
      {
        "name": "Paper 2: Social Context and Behaviour",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8182"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Religious Studies A",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Study of Religions (2 options)",
        "date": "2026-05-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8062"
      },
      {
        "name": "Paper 2A or 2B: Thematic Studies",
        "date": "2026-05-20",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8062"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Religious Studies B",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Catholic Christianity",
        "date": "2026-05-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8063"
      },
      {
        "name": "Paper 2: Perspectives on Faith",
        "date": "2026-05-20",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8063"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Sociology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Families and Education",
        "date": "2026-05-08",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8192"
      },
      {
        "name": "Paper 2: Crime, Deviance & Social Stratification",
        "date": "TBC",
        "session": "\u2014",
        "duration": "1h 45m",
        "code": "8192"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Spanish",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "TBC",
        "session": "\u2014",
        "duration": "35m/45m",
        "code": "8698"
      },
      {
        "name": "Reading (F/H)",
        "date": "TBC",
        "session": "\u2014",
        "duration": "45m/1h",
        "code": "8698"
      },
      {
        "name": "Writing (F/H)",
        "date": "TBC",
        "session": "\u2014",
        "duration": "1h10m/1h15m",
        "code": "8698"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Statistics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1",
        "date": "TBC",
        "session": "\u2014",
        "duration": "1h 30m",
        "code": "8382"
      },
      {
        "name": "Paper 2",
        "date": "TBC",
        "session": "\u2014",
        "duration": "1h 30m",
        "code": "8382"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Accounting",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Financial Accounting",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "3h",
        "code": "7127"
      },
      {
        "name": "Paper 2: Accounting for Analysis & Decision",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "3h",
        "code": "7127"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (Art,Craft & Design)",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "15h",
        "code": "7201"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (Fine Art)",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "15h",
        "code": "7202"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (Graphic Communication)",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "15h",
        "code": "7203"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (Textile Design)",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "15h",
        "code": "7204"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (3D Design)",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "15h",
        "code": "7205"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Art & Design (Photography)",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Externally Set Assignment",
        "date": "Submit by 31 May 2026",
        "session": "\u2014",
        "duration": "15h",
        "code": "7206"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Bengali",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Reading and Writing",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7637"
      },
      {
        "name": "Paper 2: Writing",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "2h",
        "code": "7637"
      },
      {
        "name": "Paper 3: Listening, Reading & Writing",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7637"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Biblical Hebrew",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Translation, Comprehension & Composition",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "3h",
        "code": "7677"
      },
      {
        "name": "Paper 2: Prose Literature",
        "date": "2026-06-03",
        "session": "AM",
        "duration": "2h",
        "code": "7677"
      },
      {
        "name": "Paper 3: Poetry",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "2h",
        "code": "7677"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Biology",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-06-04",
        "session": "PM",
        "duration": "2h",
        "code": "7402"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-12",
        "session": "AM",
        "duration": "2h",
        "code": "7402"
      },
      {
        "name": "Paper 3",
        "date": "2026-06-16",
        "session": "AM",
        "duration": "2h",
        "code": "7402"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Business",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Business 1",
        "date": "2026-05-13",
        "session": "PM",
        "duration": "2h",
        "code": "7132"
      },
      {
        "name": "Paper 2: Business 2",
        "date": "2026-05-19",
        "session": "AM",
        "duration": "2h",
        "code": "7132"
      },
      {
        "name": "Paper 3: Business 3",
        "date": "2026-06-09",
        "session": "PM",
        "duration": "2h",
        "code": "7132"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Chemistry",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Inorganic & Physical Chemistry",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "2h",
        "code": "7405"
      },
      {
        "name": "Paper 2: Organic & Physical Chemistry",
        "date": "2026-06-09",
        "session": "AM",
        "duration": "2h",
        "code": "7405"
      },
      {
        "name": "Paper 3",
        "date": "2026-06-15",
        "session": "AM",
        "duration": "2h",
        "code": "7405"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Computer Science",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1 (On-screen, choice of language)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "2h 30m",
        "code": "7517"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-17",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7517"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Dance",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Critical Engagement (Written)",
        "date": "2026-05-19",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7237"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Design & Technology: Fashion & Textiles",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7562"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-10",
        "session": "AM",
        "duration": "1h 30m",
        "code": "7562"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Design & Technology: Product Design",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7552"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-10",
        "session": "AM",
        "duration": "1h 30m",
        "code": "7552"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Drama and Theatre",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Written Paper: Drama and Theatre",
        "date": "2026-05-21",
        "session": "AM",
        "duration": "3h",
        "code": "7262"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Economics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Markets and Market Failure",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "2h",
        "code": "7136"
      },
      {
        "name": "Paper 2: National and International Economy",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "2h",
        "code": "7136"
      },
      {
        "name": "Paper 3: Economic Principles and Issues",
        "date": "2026-06-04",
        "session": "AM",
        "duration": "2h",
        "code": "7136"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "English Language",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Language, the Individual and Society",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7702"
      },
      {
        "name": "Paper 2: Language Diversity and Change",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7702"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "English Language & Literature",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Telling Stories",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "3h",
        "code": "7707"
      },
      {
        "name": "Paper 2: Exploring Conflict",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7707"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "English Literature A",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Love Through the Ages",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "3h",
        "code": "7712"
      },
      {
        "name": "Paper 2: Texts in Shared Contexts (option)",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7712"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "English Literature B",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Literary Genres (Tragedy/Comedy)",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7717"
      },
      {
        "name": "Paper 2: Texts and Genres (option)",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "3h",
        "code": "7717"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Environmental Science",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "3h",
        "code": "7447"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-05",
        "session": "AM",
        "duration": "3h",
        "code": "7447"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "French",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Listening, Reading & Writing",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7652"
      },
      {
        "name": "Paper 2: Writing",
        "date": "2026-06-17",
        "session": "AM",
        "duration": "2h",
        "code": "7652"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Further Mathematics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Pure Core",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "2h",
        "code": "7367"
      },
      {
        "name": "Paper 2 (optional route)",
        "date": "2026-05-15",
        "session": "AM",
        "duration": "1h",
        "code": "7367"
      },
      {
        "name": "Paper 3 (optional route)",
        "date": "2026-05-15",
        "session": "PM",
        "duration": "1h",
        "code": "7367"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Geography",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Physical Geography",
        "date": "2026-05-12",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7037"
      },
      {
        "name": "Paper 2: Human Geography",
        "date": "2026-05-21",
        "session": "PM",
        "duration": "2h 30m",
        "code": "7037"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "German",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Listening, Reading & Writing",
        "date": "2026-05-19",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7662"
      },
      {
        "name": "Paper 2: Writing",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "2h",
        "code": "7662"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "History",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1 (1A+1B option combination)",
        "date": "2026-05-19",
        "session": "PM",
        "duration": "2h 30m",
        "code": "7042"
      },
      {
        "name": "Paper 2 (2A+2B option combination)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "2h 30m",
        "code": "7042"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Law",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-21",
        "session": "PM",
        "duration": "2h",
        "code": "7162"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-01",
        "session": "PM",
        "duration": "2h",
        "code": "7162"
      },
      {
        "name": "Paper 3 (Contract or Human Rights)",
        "date": "2026-06-09",
        "session": "AM",
        "duration": "2h",
        "code": "7162"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Mathematics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1 (Pure)",
        "date": "2026-06-03",
        "session": "PM",
        "duration": "2h",
        "code": "7357"
      },
      {
        "name": "Paper 2 (Pure & Statistics/Mechanics)",
        "date": "2026-06-11",
        "session": "PM",
        "duration": "2h",
        "code": "7357"
      },
      {
        "name": "Paper 3 (Pure & Statistics/Mechanics)",
        "date": "2026-06-18",
        "session": "PM",
        "duration": "2h",
        "code": "7357"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Media Studies",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7572"
      },
      {
        "name": "Paper 2",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7572"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Modern Hebrew",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Reading & Writing",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h 30m",
        "code": "7672"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Music",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Listening paper + Composition NEA + Performance NEA",
        "date": "TBC",
        "session": "\u2014",
        "duration": "Various",
        "code": "7272"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Panjabi",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Reading & Writing",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7682"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Philosophy",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Epistemology & Moral Philosophy",
        "date": "TBC",
        "session": "\u2014",
        "duration": "3h",
        "code": "7172"
      },
      {
        "name": "Paper 2: Metaphysics & Philosophy of Mind/Religion",
        "date": "TBC",
        "session": "\u2014",
        "duration": "3h",
        "code": "7172"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Physical Education",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Factors Affecting Participation",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7582"
      },
      {
        "name": "Paper 2: Factors Affecting Optimal Performance",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7582"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Physics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7408"
      },
      {
        "name": "Paper 2",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7408"
      },
      {
        "name": "Paper 3 (Practical Skills + Options)",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7408"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Polish",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Reading & Writing",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h 30m",
        "code": "7687"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Politics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: UK Politics & Core Political Ideas",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7152"
      },
      {
        "name": "Paper 2: UK Government & Political Ideas",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7152"
      },
      {
        "name": "Paper 3: Comparative Politics (option)",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7152"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Psychology",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Introductory Topics",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7182"
      },
      {
        "name": "Paper 2: Psychology in Context",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7182"
      },
      {
        "name": "Paper 3: Issues & Options",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7182"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Religious Studies",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Philosophy of Religion",
        "date": "TBC",
        "session": "\u2014",
        "duration": "3h",
        "code": "7062"
      },
      {
        "name": "Paper 2: Religion & Ethics",
        "date": "TBC",
        "session": "\u2014",
        "duration": "3h",
        "code": "7062"
      },
      {
        "name": "Paper 3: Study of Religion/Dialogues (opt)",
        "date": "TBC",
        "session": "\u2014",
        "duration": "3h",
        "code": "7062"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Sociology",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Education + Theory & Methods",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7192"
      },
      {
        "name": "Paper 2: Topics in Sociology",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7192"
      },
      {
        "name": "Paper 3: Crime & Deviance + Theory & Methods",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7192"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Spanish",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Listening, Reading & Writing",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h 30m",
        "code": "7692"
      },
      {
        "name": "Paper 2: Writing",
        "date": "TBC",
        "session": "\u2014",
        "duration": "2h",
        "code": "7692"
      }
    ]
  }
]
  },
  {
    "board": "AQA",
    "subject": "Biology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-05-12",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8461"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8461"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Business",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Operations and HRM",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8132"
      },
      {
        "name": "Paper 2: Marketing and Finance",
        "date": "2026-05-21",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8132"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Chemistry",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8462"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8462"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Chinese (Mandarin)",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8673"
      },
      {
        "name": "Reading (F/H)",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "45m/1h",
        "code": "8673"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "1h/1h15m",
        "code": "8673"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Citizenship Studies",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-07",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8100"
      },
      {
        "name": "Paper 2",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8100"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Combined Science: Trilogy",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 Biology (F/H)",
        "date": "2026-05-12",
        "session": "PM",
        "duration": "1h 15m",
        "code": "8464"
      },
      {
        "name": "Paper 2 Biology (F/H)",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8464"
      },
      {
        "name": "Paper 1 Chemistry (F/H)",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8464"
      },
      {
        "name": "Paper 2 Chemistry (F/H)",
        "date": "2026-06-12",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8464"
      },
      {
        "name": "Paper 1 Physics (F/H)",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8464"
      },
      {
        "name": "Paper 2 Physics (F/H)",
        "date": "2026-06-15",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8464"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Combined Science: Synergy",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Life & Environmental Sciences (F/H)",
        "date": "2026-05-12",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8465"
      },
      {
        "name": "Paper 2: Life & Environmental Sciences (F/H)",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8465"
      },
      {
        "name": "Paper 3: Physical Sciences (F/H)",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8465"
      },
      {
        "name": "Paper 4: Physical Sciences (F/H)",
        "date": "2026-06-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8465"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Computer Science",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Computational Thinking & Programming (choice of language)",
        "date": "2026-05-13",
        "session": "PM",
        "duration": "2h",
        "code": "8525"
      },
      {
        "name": "Paper 2: Computing Concepts",
        "date": "2026-05-19",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8525"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Dance",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Dance Appreciation (Written)",
        "date": "2026-06-12",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8236"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Design and Technology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Written Paper",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "2h",
        "code": "8552"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Drama",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Understanding Drama (Written)",
        "date": "2026-05-08",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8261"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Economics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: How Markets Work",
        "date": "2026-05-08",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8136"
      },
      {
        "name": "Paper 2: How the Economy Works",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8136"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Engineering",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Written Paper",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "2h",
        "code": "8852"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "English Language",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Explorations in Creative Reading & Writing",
        "date": "2026-05-21",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8700"
      },
      {
        "name": "Paper 2: Writers' Viewpoints & Perspectives",
        "date": "2026-06-05",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8700"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "English Literature",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Shakespeare & 19th Century Novel",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8702"
      },
      {
        "name": "Paper 2: Modern Texts and Poetry",
        "date": "2026-05-19",
        "session": "AM",
        "duration": "2h 15m",
        "code": "8702"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Food Preparation and Nutrition",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-06-11",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8585"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "French",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-05-20",
        "session": "AM",
        "duration": "35m/45m",
        "code": "8652"
      },
      {
        "name": "Reading (F/H)",
        "date": "2026-05-20",
        "session": "AM",
        "duration": "45m/1h",
        "code": "8652"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-04",
        "session": "PM",
        "duration": "1h10m/1h15m",
        "code": "8652"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Geography",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Living with the Physical Environment",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8035"
      },
      {
        "name": "Paper 2: Challenges in the Human Environment",
        "date": "2026-06-03",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8035"
      },
      {
        "name": "Paper 3: Geographical Applications",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8035"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "German",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-05-07",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8662"
      },
      {
        "name": "Reading (F/H)",
        "date": "2026-05-07",
        "session": "PM",
        "duration": "45m/1h",
        "code": "8662"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "1h10m/1h15m",
        "code": "8662"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "History",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Understanding the Modern World (2h combined \u2013 options 1A+1B)",
        "date": "2026-05-15",
        "session": "AM",
        "duration": "2h",
        "code": "8145"
      },
      {
        "name": "Paper 2: Shaping the Nation (2h combined \u2013 options 2A+2B)",
        "date": "2026-06-04",
        "session": "AM",
        "duration": "2h",
        "code": "8145"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Italian",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "35m/45m",
        "code": "8633"
      },
      {
        "name": "Reading (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "45m/1h",
        "code": "8633"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "1h/1h15m",
        "code": "8633"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Mathematics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Non-Calculator (F/H)",
        "date": "2026-05-14",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8300"
      },
      {
        "name": "Paper 2: Calculator (F/H)",
        "date": "2026-06-03",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8300"
      },
      {
        "name": "Paper 3: Calculator (F/H)",
        "date": "2026-06-10",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8300"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Media Studies",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8572"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8572"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Modern Hebrew",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8678"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-17",
        "session": "AM",
        "duration": "1h/1h15m",
        "code": "8678"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Music",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Understanding Music (Written)",
        "date": "2026-06-05",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8271"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Panjabi",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8683"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "1h/1h15m",
        "code": "8683"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Physical Education",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Human Body & Movement",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8582"
      },
      {
        "name": "Paper 2: Socio-cultural Influences & Wellbeing",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8582"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Physics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8463"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-15",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8463"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Polish",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8688"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-12",
        "session": "PM",
        "duration": "1h/1h15m",
        "code": "8688"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Psychology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Cognition and Behaviour",
        "date": "2026-05-07",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8182"
      },
      {
        "name": "Paper 2: Social Context and Behaviour",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8182"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Religious Studies A",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Study of Religions (2 options)",
        "date": "2026-05-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8062"
      },
      {
        "name": "Paper 2A or 2B: Thematic Studies",
        "date": "2026-05-20",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8062"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Religious Studies B",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Catholic Christianity",
        "date": "2026-05-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8063"
      },
      {
        "name": "Paper 2: Perspectives on Faith",
        "date": "2026-05-20",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8063"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Sociology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Families and Education",
        "date": "2026-05-08",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8192"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Accounting",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Financial Accounting",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "3h",
        "code": "7127"
      },
      {
        "name": "Paper 2: Accounting for Analysis & Decision",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "3h",
        "code": "7127"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Bengali",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Reading and Writing",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7637"
      },
      {
        "name": "Paper 2: Writing",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "2h",
        "code": "7637"
      },
      {
        "name": "Paper 3: Listening, Reading & Writing",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7637"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Biblical Hebrew",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Translation, Comprehension & Composition",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "3h",
        "code": "7677"
      },
      {
        "name": "Paper 2: Prose Literature",
        "date": "2026-06-03",
        "session": "AM",
        "duration": "2h",
        "code": "7677"
      },
      {
        "name": "Paper 3: Poetry",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "2h",
        "code": "7677"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Biology",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-06-04",
        "session": "PM",
        "duration": "2h",
        "code": "7402"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-12",
        "session": "AM",
        "duration": "2h",
        "code": "7402"
      },
      {
        "name": "Paper 3",
        "date": "2026-06-16",
        "session": "AM",
        "duration": "2h",
        "code": "7402"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Business",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Business 1",
        "date": "2026-05-13",
        "session": "PM",
        "duration": "2h",
        "code": "7132"
      },
      {
        "name": "Paper 2: Business 2",
        "date": "2026-05-19",
        "session": "AM",
        "duration": "2h",
        "code": "7132"
      },
      {
        "name": "Paper 3: Business 3",
        "date": "2026-06-09",
        "session": "PM",
        "duration": "2h",
        "code": "7132"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Chemistry",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Inorganic & Physical Chemistry",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "2h",
        "code": "7405"
      },
      {
        "name": "Paper 2: Organic & Physical Chemistry",
        "date": "2026-06-09",
        "session": "AM",
        "duration": "2h",
        "code": "7405"
      },
      {
        "name": "Paper 3",
        "date": "2026-06-15",
        "session": "AM",
        "duration": "2h",
        "code": "7405"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Computer Science",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1 (On-screen, choice of language)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "2h 30m",
        "code": "7517"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-17",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7517"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Dance",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Critical Engagement (Written)",
        "date": "2026-05-19",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7237"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Design & Technology: Fashion & Textiles",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7562"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-10",
        "session": "AM",
        "duration": "1h 30m",
        "code": "7562"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Design & Technology: Product Design",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7552"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-10",
        "session": "AM",
        "duration": "1h 30m",
        "code": "7552"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Drama and Theatre",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Written Paper: Drama and Theatre",
        "date": "2026-05-21",
        "session": "AM",
        "duration": "3h",
        "code": "7262"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Economics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Markets and Market Failure",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "2h",
        "code": "7136"
      },
      {
        "name": "Paper 2: National and International Economy",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "2h",
        "code": "7136"
      },
      {
        "name": "Paper 3: Economic Principles and Issues",
        "date": "2026-06-04",
        "session": "AM",
        "duration": "2h",
        "code": "7136"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "English Language",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Language, the Individual and Society",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7702"
      },
      {
        "name": "Paper 2: Language Diversity and Change",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7702"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "English Language & Literature",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Telling Stories",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "3h",
        "code": "7707"
      },
      {
        "name": "Paper 2: Exploring Conflict",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7707"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "English Literature A",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Love Through the Ages",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "3h",
        "code": "7712"
      },
      {
        "name": "Paper 2: Texts in Shared Contexts (option)",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7712"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "English Literature B",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Literary Genres (Tragedy/Comedy)",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7717"
      },
      {
        "name": "Paper 2: Texts and Genres (option)",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "3h",
        "code": "7717"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Environmental Science",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "3h",
        "code": "7447"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-05",
        "session": "AM",
        "duration": "3h",
        "code": "7447"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "French",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Listening, Reading & Writing",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7652"
      },
      {
        "name": "Paper 2: Writing",
        "date": "2026-06-17",
        "session": "AM",
        "duration": "2h",
        "code": "7652"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Further Mathematics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Pure Core",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "2h",
        "code": "7367"
      },
      {
        "name": "Paper 2 (optional route)",
        "date": "2026-05-15",
        "session": "AM",
        "duration": "1h",
        "code": "7367"
      },
      {
        "name": "Paper 3 (optional route)",
        "date": "2026-05-15",
        "session": "PM",
        "duration": "1h",
        "code": "7367"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Geography",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Physical Geography",
        "date": "2026-05-12",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7037"
      },
      {
        "name": "Paper 2: Human Geography",
        "date": "2026-05-21",
        "session": "PM",
        "duration": "2h 30m",
        "code": "7037"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "German",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Listening, Reading & Writing",
        "date": "2026-05-19",
        "session": "AM",
        "duration": "2h 30m",
        "code": "7662"
      },
      {
        "name": "Paper 2: Writing",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "2h",
        "code": "7662"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "History",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1 (1A+1B option combination)",
        "date": "2026-05-19",
        "session": "PM",
        "duration": "2h 30m",
        "code": "7042"
      },
      {
        "name": "Paper 2 (2A+2B option combination)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "2h 30m",
        "code": "7042"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Law",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-21",
        "session": "PM",
        "duration": "2h",
        "code": "7162"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-01",
        "session": "PM",
        "duration": "2h",
        "code": "7162"
      },
      {
        "name": "Paper 3 (Contract or Human Rights)",
        "date": "2026-06-09",
        "session": "AM",
        "duration": "2h",
        "code": "7162"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Mathematics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1 (Pure)",
        "date": "2026-06-03",
        "session": "PM",
        "duration": "2h",
        "code": "7357"
      },
      {
        "name": "Paper 2 (Pure & Statistics/Mechanics)",
        "date": "2026-06-11",
        "session": "PM",
        "duration": "2h",
        "code": "7357"
      },
      {
        "name": "Paper 3 (Pure & Statistics/Mechanics)",
        "date": "2026-06-18",
        "session": "PM",
        "duration": "2h",
        "code": "7357"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Arabic",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "35m/45m",
        "code": "1AA0"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "50m/1h05m",
        "code": "1AA0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "1h20m/1h25m",
        "code": "1AA0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Astronomy",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Naked-eye Astronomy",
        "date": "2026-06-01",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1AS0"
      },
      {
        "name": "Paper 2: Telescopic Astronomy",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1AS0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Biblical Hebrew",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Component 1: Language",
        "date": "2026-05-07",
        "session": "AM",
        "duration": "2h 00m",
        "code": "1BH0"
      },
      {
        "name": "Component 2: Literature",
        "date": "2026-05-19",
        "session": "PM",
        "duration": "2h 00m",
        "code": "1BH0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Biology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-05-12",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1BI0"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1BI0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Business",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Investigating Small Business",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1BS0"
      },
      {
        "name": "Paper 2: Building a Business",
        "date": "2026-05-21",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1BS0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Chemistry",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1CH0"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-09",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1CH0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Chinese",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1CN0"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "50m/1h05m",
        "code": "1CN0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "1h20m/1h25m",
        "code": "1CN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Citizenship Studies",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-07",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1CS0"
      },
      {
        "name": "Paper 2",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1CS0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Combined Science",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Biology 1 (F/H)",
        "date": "2026-05-12",
        "session": "PM",
        "duration": "1h 10m",
        "code": "1SC0"
      },
      {
        "name": "Paper 2: Chemistry 1 (F/H)",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "1h 10m",
        "code": "1SC0"
      },
      {
        "name": "Paper 3: Physics 1 (F/H)",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "1h 10m",
        "code": "1SC0"
      },
      {
        "name": "Paper 4: Biology 2 (F/H)",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "1h 10m",
        "code": "1SC0"
      },
      {
        "name": "Paper 5: Chemistry 2 (F/H)",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "1h 10m",
        "code": "1SC0"
      },
      {
        "name": "Paper 6: Physics 2 (F/H)",
        "date": "2026-06-15",
        "session": "AM",
        "duration": "1h 10m",
        "code": "1SC0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Computer Science",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Principles of Computer Science",
        "date": "2026-05-13",
        "session": "PM",
        "duration": "1h 30m",
        "code": "1CP2"
      },
      {
        "name": "Paper 2: Application of Computational Thinking (On-screen, IDE)",
        "date": "2026-05-19",
        "session": "PM",
        "duration": "2h 00m",
        "code": "1CP2"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Drama",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Component 3: Theatre Makers in Practice (Written)",
        "date": "2026-05-08",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1DR0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Design & Technology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Component 1 (choice of material/system)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1DT0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "English Language",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Fiction & Imaginative Writing",
        "date": "2026-05-21",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1EN0"
      },
      {
        "name": "Paper 2: Non-Fiction & Transactional Writing",
        "date": "2026-06-05",
        "session": "AM",
        "duration": "2h 05m",
        "code": "1EN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "English Language 2.0",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Non-Fiction Texts",
        "date": "2026-05-21",
        "session": "AM",
        "duration": "1h 55m",
        "code": "1EN2"
      },
      {
        "name": "Paper 2: Contemporary Texts",
        "date": "2026-06-05",
        "session": "AM",
        "duration": "1h 55m",
        "code": "1EN2"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "English Literature",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Shakespeare & Post-1914 Literature",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1ET0"
      },
      {
        "name": "Paper 2: 19th-Century Novel & Poetry since 1789",
        "date": "2026-05-19",
        "session": "AM",
        "duration": "2h 15m",
        "code": "1ET0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "French",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 2: Listening (F/H)",
        "date": "2026-05-20",
        "session": "AM",
        "duration": "45m/1h00m",
        "code": "1FR1"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-06-04",
        "session": "PM",
        "duration": "45m/1h00m",
        "code": "1FR1"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-08",
        "session": "PM",
        "duration": "1h15m/1h20m",
        "code": "1FR1"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Geography A",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: The Physical Environment",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1GA0"
      },
      {
        "name": "Paper 2: The Human Environment",
        "date": "2026-06-03",
        "session": "PM",
        "duration": "1h 30m",
        "code": "1GA0"
      },
      {
        "name": "Paper 3: Geographical Investigations: Fieldwork & UK Challenges",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1GA0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Geography B",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Global Geographical Issues",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1GB0"
      },
      {
        "name": "Paper 2: UK Geographical Issues",
        "date": "2026-06-03",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1GB0"
      },
      {
        "name": "Paper 3: People & Environment Issues \u2013 Making Decisions",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1GB0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "German",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 2: Listening (F/H)",
        "date": "2026-05-07",
        "session": "PM",
        "duration": "45m/1h00m",
        "code": "1GN1"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "45m/1h00m",
        "code": "1GN1"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-01",
        "session": "PM",
        "duration": "1h15m/1h20m",
        "code": "1GN1"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Greek",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1GK0"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "50m/1h05m",
        "code": "1GK0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Gujarati",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-06-01",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1GU0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-09",
        "session": "PM",
        "duration": "1h20m/1h25m",
        "code": "1GU0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "History",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Thematic Study & Historic Environment",
        "date": "2026-05-15",
        "session": "AM",
        "duration": "1h 20m",
        "code": "1HI0"
      },
      {
        "name": "Paper 2: Period Study & British Depth Study",
        "date": "2026-06-04",
        "session": "AM",
        "duration": "1h 50m",
        "code": "1HI0"
      },
      {
        "name": "Paper 3: Modern Depth Study",
        "date": "2026-06-09",
        "session": "PM",
        "duration": "1h 30m",
        "code": "1HI0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Italian",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "35m/45m",
        "code": "1IN0"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "45m/1h00m",
        "code": "1IN0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "1h15m/1h20m",
        "code": "1IN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Japanese",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "35m/45m",
        "code": "1JA0"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "50m/1h05m",
        "code": "1JA0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-09",
        "session": "AM",
        "duration": "1h20m/1h25m",
        "code": "1JA0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Mathematics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Non-Calculator (F/H)",
        "date": "2026-05-14",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1MA1"
      },
      {
        "name": "Paper 2: Calculator (F/H)",
        "date": "2026-06-03",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1MA1"
      },
      {
        "name": "Paper 3: Calculator (F/H)",
        "date": "2026-06-10",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1MA1"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Music",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Component 3: Appraising",
        "date": "2026-06-05",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1MU0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Physical Education",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Component 1: Fitness & Body Systems",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1PE0"
      },
      {
        "name": "Component 2: Health & Performance",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "1h 15m",
        "code": "1PE0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Persian",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1PN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Physics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1PH0"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1PH0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Portuguese",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1PG0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Psychology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-07",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1PS0"
      },
      {
        "name": "Paper 2",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "1h 20m",
        "code": "1PS0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Religious Studies A",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Area of Study 1 \u2013 Study of Religion",
        "date": "2026-05-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1RA0"
      },
      {
        "name": "Paper 2: Area of Study 2 \u2013 Study of Second Religion",
        "date": "2026-05-20",
        "session": "PM",
        "duration": "50m",
        "code": "1RA0"
      },
      {
        "name": "Paper 3: Philosophy & Ethics",
        "date": "2026-06-01",
        "session": "PM",
        "duration": "50m",
        "code": "1RA0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Religious Studies B",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Religion & Ethics",
        "date": "2026-05-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1RB0"
      },
      {
        "name": "Paper 2: Religion, Peace & Conflict",
        "date": "2026-05-20",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1RB0"
      },
      {
        "name": "Paper 3: Religion, Philosophy & Social Justice",
        "date": "2026-06-01",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1RB0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Russian",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1RU0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "1h20m/1h25m",
        "code": "1RU0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Spanish",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 2: Listening (F/H)",
        "date": "2026-06-09",
        "session": "AM",
        "duration": "45m/1h00m",
        "code": "1SP1"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "45m/1h00m",
        "code": "1SP1"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-17",
        "session": "AM",
        "duration": "1h15m/1h20m",
        "code": "1SP1"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Statistics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "1h 30m",
        "code": "1ST0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Turkish",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-05-07",
        "session": "AM",
        "duration": "35m/45m",
        "code": "1TU0"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-05-07",
        "session": "AM",
        "duration": "50m/1h05m",
        "code": "1TU0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "1h20m/1h25m",
        "code": "1TU0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Urdu",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1UR0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "1h20m/1h25m",
        "code": "1UR0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Arabic",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Translation into English, Reading Comprehension & Writing",
        "date": "2026-05-19",
        "session": "PM",
        "duration": "2h 30m",
        "code": "9AA0"
      },
      {
        "name": "Paper 2: Translation into Arabic & Written Response to Works",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "2h 40m",
        "code": "9AA0"
      },
      {
        "name": "Paper 3: Listening, Reading & Writing",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "2h 15m",
        "code": "9AA0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Biology B",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Core Cellular Biology & Microbiology",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8BI0"
      },
      {
        "name": "Paper 2: Core Physiology & Ecology",
        "date": "2026-05-21",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8BI0"
      },
      {
        "name": "Paper 1: Advanced Biochemistry, Microbiology & Genetics",
        "date": "2026-06-04",
        "session": "PM",
        "duration": "1h 45m",
        "code": "9BI0"
      },
      {
        "name": "Paper 2: Advanced Physiology, Evolution & Ecology",
        "date": "2026-06-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "9BI0"
      },
      {
        "name": "Paper 3: General & Practical Principles in Biology",
        "date": "2026-06-16",
        "session": "AM",
        "duration": "2h 30m",
        "code": "9BI0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Biology A (Salters Nuffield)",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Lifestyle, Transport, Genes & Health",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8BN0"
      },
      {
        "name": "Paper 2: Development, Plants & the Environment",
        "date": "2026-05-21",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8BN0"
      },
      {
        "name": "Paper 1: The Natural Environment & Species Survival",
        "date": "2026-06-04",
        "session": "PM",
        "duration": "2h 00m",
        "code": "9BN0"
      },
      {
        "name": "Paper 2: Energy, Exercise & Co-ordination",
        "date": "2026-06-12",
        "session": "AM",
        "duration": "2h 00m",
        "code": "9BN0"
      },
      {
        "name": "Paper 3: General & Practical Applications in Biology",
        "date": "2026-06-16",
        "session": "AM",
        "duration": "2h 00m",
        "code": "9BN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Business",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Marketing and People",
        "date": "2026-05-15",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8BS0"
      },
      {
        "name": "Paper 2: Managing Business Activities",
        "date": "2026-05-21",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8BS0"
      },
      {
        "name": "Paper 1: Marketing, People & Global Businesses",
        "date": "2026-05-13",
        "session": "PM",
        "duration": "2h 00m",
        "code": "9BS0"
      },
      {
        "name": "Paper 2: Business Activities, Decisions & Strategy",
        "date": "2026-05-19",
        "session": "AM",
        "duration": "2h 00m",
        "code": "9BS0"
      },
      {
        "name": "Paper 3: Investigating Business in a Competitive Environment",
        "date": "2026-06-09",
        "session": "PM",
        "duration": "2h 00m",
        "code": "9BS0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Chemistry",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Core Inorganic & Physical Chemistry",
        "date": "2026-05-12",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8CH0"
      },
      {
        "name": "Paper 2: Core Organic & Physical Chemistry",
        "date": "2026-05-19",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8CH0"
      },
      {
        "name": "Paper 1: Advanced Inorganic & Physical Chemistry",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "1h 45m",
        "code": "9CH0"
      },
      {
        "name": "Paper 2: Advanced Organic & Physical Chemistry",
        "date": "2026-06-09",
        "session": "AM",
        "duration": "1h 45m",
        "code": "9CH0"
      },
      {
        "name": "Paper 3: General & Practical Principles in Chemistry",
        "date": "2026-06-15",
        "session": "AM",
        "duration": "2h 30m",
        "code": "9CH0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Chinese",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Listening, Reading & Translation",
        "date": "2026-05-19",
        "session": "AM",
        "duration": "2h 00m",
        "code": "9CN0"
      },
      {
        "name": "Paper 2: Written Response to Works & Translation",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "2h 40m",
        "code": "9CN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Design & Technology",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Component 1: Design & Technology (Product Design)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "2h 30m",
        "code": "9DT0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Drama & Theatre",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Component 3: Theatre Makers in Practice (Written)",
        "date": "2026-05-21",
        "session": "AM",
        "duration": "2h 30m",
        "code": "9DR0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Economics A",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Markets & Business Behaviour",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "2h 00m",
        "code": "9EC0"
      },
      {
        "name": "Paper 2: The National & Global Economy",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "2h 00m",
        "code": "9EC0"
      },
      {
        "name": "Paper 3: Microeconomics & Macroeconomics",
        "date": "2026-06-04",
        "session": "AM",
        "duration": "2h 00m",
        "code": "9EC0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Economics B",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Markets & How They Work",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "2h 00m",
        "code": "9EB0"
      },
      {
        "name": "Paper 2: Competing in the Global Economy",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "2h 00m",
        "code": "9EB0"
      },
      {
        "name": "Paper 3: The Economic Environment & Business",
        "date": "2026-06-04",
        "session": "AM",
        "duration": "2h 00m",
        "code": "9EB0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "English Language",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Language: Context & Identity",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8EN0"
      },
      {
        "name": "Paper 2: Child Language",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8EN0"
      },
      {
        "name": "Paper 1: Language Variation",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "2h 15m",
        "code": "9EN0"
      },
      {
        "name": "Paper 2: Child Language",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "1h 15m",
        "code": "9EN0"
      },
      {
        "name": "Paper 3: Investigating Language",
        "date": "2026-06-03",
        "session": "PM",
        "duration": "1h 45m",
        "code": "9EN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "English Lang & Literature",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Voices in Speech & Writing",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8EL0"
      },
      {
        "name": "Paper 2: Varieties in Language & Literature",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8EL0"
      },
      {
        "name": "Paper 1: Voices in Speech & Writing",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "2h 30m",
        "code": "9EL0"
      },
      {
        "name": "Paper 2: Varieties in Language & Literature",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "2h 30m",
        "code": "9EL0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "English Literature",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Poetry & Drama",
        "date": "2026-05-14",
        "session": "AM",
        "duration": "2h 00m",
        "code": "8ET0"
      },
      {
        "name": "Paper 2: Prose",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8ET0"
      },
      {
        "name": "Paper 1: Drama",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "2h 15m",
        "code": "9ET0"
      },
      {
        "name": "Paper 2: Prose",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "1h 15m",
        "code": "9ET0"
      },
      {
        "name": "Paper 3: Poetry",
        "date": "2026-06-10",
        "session": "AM",
        "duration": "2h 15m",
        "code": "9ET0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Further Mathematics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Core Pure Mathematics 1",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "1h 30m",
        "code": "9FM0"
      },
      {
        "name": "Paper 2: Core Pure Mathematics 2",
        "date": "2026-05-21",
        "session": "PM",
        "duration": "1h 30m",
        "code": "9FM0"
      },
      {
        "name": "Paper 3 Options (Further Pure/Stats/Mechanics/Decision)",
        "date": "2026-06-19",
        "session": "AM",
        "duration": "1h 30m",
        "code": "9FM0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "French",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Listening, Reading & Translation",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "2h 00m",
        "code": "9FR0"
      },
      {
        "name": "Paper 2: Written Response to Works & Translation",
        "date": "2026-06-17",
        "session": "AM",
        "duration": "2h 40m",
        "code": "9FR0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Geography",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Physical Geography",
        "date": "2026-05-12",
        "session": "AM",
        "duration": "2h 15m",
        "code": "9GE0"
      },
      {
        "name": "Paper 2: Human Geography",
        "date": "2026-05-21",
        "session": "PM",
        "duration": "2h 15m",
        "code": "9GE0"
      },
      {
        "name": "Paper 3: Physical & Human Geography Synoptic",
        "date": "2026-06-08",
        "session": "PM",
        "duration": "2h 15m",
        "code": "9GE0"
      },
      {
        "name": "Paper 1: Dynamic Landscapes",
        "date": "2026-05-12",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8GE0"
      },
      {
        "name": "Paper 2: Dynamic Places",
        "date": "2026-05-20",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8GE0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "German",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Listening, Reading & Translation",
        "date": "2026-05-19",
        "session": "AM",
        "duration": "2h 00m",
        "code": "9GN0"
      },
      {
        "name": "Paper 2: Written Response to Works & Translation",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "2h 40m",
        "code": "9GN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Greek",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Translation into English, Reading & Writing",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "2h 30m",
        "code": "9GK0"
      },
      {
        "name": "Paper 2: Translation into Greek & Written Response",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "2h 40m",
        "code": "9GK0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "History",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Breadth Study with Interpretations",
        "date": "2026-05-19",
        "session": "PM",
        "duration": "2h 15m",
        "code": "9HI0"
      },
      {
        "name": "Paper 2: Depth Study",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "1h 30m",
        "code": "9HI0"
      },
      {
        "name": "Paper 3: Themes in Breadth with Aspects in Depth",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "2h 15m",
        "code": "9HI0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "History of Art",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Visual Analysis & Themes",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "3h 00m",
        "code": "9HT0"
      },
      {
        "name": "Paper 2: Periods",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "3h 00m",
        "code": "9HT0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Italian",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Listening, Reading & Translation",
        "date": "2026-06-12",
        "session": "AM",
        "duration": "2h 00m",
        "code": "9IN0"
      },
      {
        "name": "Paper 2: Written Response to Works & Translation",
        "date": "2026-06-19",
        "session": "AM",
        "duration": "2h 40m",
        "code": "9IN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Japanese",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Translation into English, Reading & Writing",
        "date": "2026-05-19",
        "session": "PM",
        "duration": "2h 30m",
        "code": "9JA0"
      },
      {
        "name": "Paper 2: Translation into Japanese & Written Response",
        "date": "2026-06-01",
        "session": "PM",
        "duration": "2h 40m",
        "code": "9JA0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Mathematics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Pure Mathematics 1",
        "date": "2026-06-03",
        "session": "PM",
        "duration": "2h 00m",
        "code": "9MA0"
      },
      {
        "name": "Paper 2: Pure Mathematics 2",
        "date": "2026-06-11",
        "session": "PM",
        "duration": "2h 00m",
        "code": "9MA0"
      },
      {
        "name": "Paper 3: Statistics & Mechanics",
        "date": "2026-06-18",
        "session": "PM",
        "duration": "2h 00m",
        "code": "9MA0"
      },
      {
        "name": "Paper 1: Pure Mathematics",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "2h 00m",
        "code": "8MA0"
      },
      {
        "name": "Paper 2: Statistics & Mechanics",
        "date": "2026-05-22",
        "session": "PM",
        "duration": "1h 15m",
        "code": "8MA0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Music",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Component 3: Appraising",
        "date": "2026-06-08",
        "session": "PM",
        "duration": "2h 10m",
        "code": "9MU0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Music Technology",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Component 3: Listening & Analysing",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "1h 30m",
        "code": "9MT0"
      },
      {
        "name": "Component 4: Producing & Analysing",
        "date": "2026-06-03",
        "session": "AM",
        "duration": "2h 15m",
        "code": "9MT0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Physical Education",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Component 1: Scientific Principles of Physical Education",
        "date": "2026-05-21",
        "session": "AM",
        "duration": "2h 30m",
        "code": "9PE0"
      },
      {
        "name": "Component 2: Psychological & Social Principles",
        "date": "2026-06-01",
        "session": "PM",
        "duration": "2h 00m",
        "code": "9PE0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Physics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Advanced Physics I",
        "date": "2026-05-20",
        "session": "PM",
        "duration": "1h 45m",
        "code": "9PH0"
      },
      {
        "name": "Paper 2: Advanced Physics II",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "1h 45m",
        "code": "9PH0"
      },
      {
        "name": "Paper 3: General & Practical Principles in Physics",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "2h 30m",
        "code": "9PH0"
      },
      {
        "name": "Paper 1: Core Physics I",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8PH0"
      },
      {
        "name": "Paper 2: Core Physics II",
        "date": "2026-05-20",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8PH0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Politics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: UK Politics & Core Political Ideas",
        "date": "2026-05-21",
        "session": "AM",
        "duration": "2h 00m",
        "code": "9PL0"
      },
      {
        "name": "Paper 2: UK Government & Non-core Political Ideas",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "2h 00m",
        "code": "9PL0"
      },
      {
        "name": "Paper 3A: Comparative Politics \u2013 USA",
        "date": "2026-06-16",
        "session": "PM",
        "duration": "2h 00m",
        "code": "9PL0"
      },
      {
        "name": "Paper 3B: Comparative Politics \u2013 Global Politics",
        "date": "2026-06-16",
        "session": "PM",
        "duration": "2h 00m",
        "code": "9PL0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Psychology",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Foundations in Psychology",
        "date": "2026-05-15",
        "session": "AM",
        "duration": "2h 15m",
        "code": "9PS0"
      },
      {
        "name": "Paper 2: Applications of Psychology",
        "date": "2026-05-20",
        "session": "AM",
        "duration": "2h 15m",
        "code": "9PS0"
      },
      {
        "name": "Paper 3: Psychological Skills",
        "date": "2026-06-05",
        "session": "AM",
        "duration": "2h 00m",
        "code": "9PS0"
      },
      {
        "name": "Paper 1: Social & Cognitive Psychology",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8PS0"
      },
      {
        "name": "Paper 2: Biological Psychology & Learning Theories",
        "date": "2026-05-19",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8PS0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Religious Studies",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Philosophy of Religion",
        "date": "2026-06-04",
        "session": "AM",
        "duration": "2h 00m",
        "code": "9RS0"
      },
      {
        "name": "Paper 2: Religion & Ethics",
        "date": "2026-06-09",
        "session": "AM",
        "duration": "2h 00m",
        "code": "9RS0"
      },
      {
        "name": "Paper 3: New Testament Studies",
        "date": "2026-06-15",
        "session": "PM",
        "duration": "2h 00m",
        "code": "9RS0"
      },
      {
        "name": "Paper 4: Study of Religion",
        "date": "2026-06-22",
        "session": "PM",
        "duration": "2h 00m",
        "code": "9RS0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Russian",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Listening, Reading & Translation",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "2h 00m",
        "code": "9RU0"
      },
      {
        "name": "Paper 2: Written Response to Works & Translation",
        "date": "2026-06-08",
        "session": "PM",
        "duration": "2h 40m",
        "code": "9RU0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Spanish",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Listening, Reading & Translation",
        "date": "2026-06-04",
        "session": "AM",
        "duration": "2h 00m",
        "code": "9SP0"
      },
      {
        "name": "Paper 2: Written Response to Works & Translation",
        "date": "2026-06-12",
        "session": "PM",
        "duration": "2h 40m",
        "code": "9SP0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Statistics",
    "qualification": "A-Level",
    "papers": [
      {
        "name": "Paper 1: Data & Probability",
        "date": "2026-06-04",
        "session": "PM",
        "duration": "2h 00m",
        "code": "9ST0"
      },
      {
        "name": "Paper 2: Statistical Inference",
        "date": "2026-06-09",
        "session": "PM",
        "duration": "2h 00m",
        "code": "9ST0"
      },
      {
        "name": "Paper 3: Statistics in Practice",
        "date": "2026-06-17",
        "session": "PM",
        "duration": "2h 00m",
        "code": "9ST0"
      }
    ]
  }
]
  },
  {
    "board": "AQA",
    "subject": "Biology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-05-12",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8461"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8461"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Business",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Operations and HRM",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8132"
      },
      {
        "name": "Paper 2: Marketing and Finance",
        "date": "2026-05-21",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8132"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Chemistry",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8462"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8462"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Chinese (Mandarin)",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8673"
      },
      {
        "name": "Reading (F/H)",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "45m/1h",
        "code": "8673"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "1h/1h15m",
        "code": "8673"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Citizenship Studies",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-07",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8100"
      },
      {
        "name": "Paper 2",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8100"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Combined Science: Trilogy",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 Biology (F/H)",
        "date": "2026-05-12",
        "session": "PM",
        "duration": "1h 15m",
        "code": "8464"
      },
      {
        "name": "Paper 2 Biology (F/H)",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8464"
      },
      {
        "name": "Paper 1 Chemistry (F/H)",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8464"
      },
      {
        "name": "Paper 2 Chemistry (F/H)",
        "date": "2026-06-12",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8464"
      },
      {
        "name": "Paper 1 Physics (F/H)",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8464"
      },
      {
        "name": "Paper 2 Physics (F/H)",
        "date": "2026-06-15",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8464"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Combined Science: Synergy",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Life & Environmental Sciences (F/H)",
        "date": "2026-05-12",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8465"
      },
      {
        "name": "Paper 2: Life & Environmental Sciences (F/H)",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8465"
      },
      {
        "name": "Paper 3: Physical Sciences (F/H)",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8465"
      },
      {
        "name": "Paper 4: Physical Sciences (F/H)",
        "date": "2026-06-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8465"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Computer Science",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Computational Thinking & Programming (choice of language)",
        "date": "2026-05-13",
        "session": "PM",
        "duration": "2h",
        "code": "8525"
      },
      {
        "name": "Paper 2: Computing Concepts",
        "date": "2026-05-19",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8525"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Dance",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Dance Appreciation (Written)",
        "date": "2026-06-12",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8236"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Design and Technology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Written Paper",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "2h",
        "code": "8552"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Drama",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Understanding Drama (Written)",
        "date": "2026-05-08",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8261"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Economics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: How Markets Work",
        "date": "2026-05-08",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8136"
      },
      {
        "name": "Paper 2: How the Economy Works",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8136"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Engineering",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Written Paper",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "2h",
        "code": "8852"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "English Language",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Explorations in Creative Reading & Writing",
        "date": "2026-05-21",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8700"
      },
      {
        "name": "Paper 2: Writers' Viewpoints & Perspectives",
        "date": "2026-06-05",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8700"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "English Literature",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Shakespeare & 19th Century Novel",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8702"
      },
      {
        "name": "Paper 2: Modern Texts and Poetry",
        "date": "2026-05-19",
        "session": "AM",
        "duration": "2h 15m",
        "code": "8702"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Food Preparation and Nutrition",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-06-11",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8585"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "French",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-05-20",
        "session": "AM",
        "duration": "35m/45m",
        "code": "8652"
      },
      {
        "name": "Reading (F/H)",
        "date": "2026-05-20",
        "session": "AM",
        "duration": "45m/1h",
        "code": "8652"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-04",
        "session": "PM",
        "duration": "1h10m/1h15m",
        "code": "8652"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Geography",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Living with the Physical Environment",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8035"
      },
      {
        "name": "Paper 2: Challenges in the Human Environment",
        "date": "2026-06-03",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8035"
      },
      {
        "name": "Paper 3: Geographical Applications",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8035"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "German",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-05-07",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8662"
      },
      {
        "name": "Reading (F/H)",
        "date": "2026-05-07",
        "session": "PM",
        "duration": "45m/1h",
        "code": "8662"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "1h10m/1h15m",
        "code": "8662"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "History",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Understanding the Modern World (2h combined \u2013 options 1A+1B)",
        "date": "2026-05-15",
        "session": "AM",
        "duration": "2h",
        "code": "8145"
      },
      {
        "name": "Paper 2: Shaping the Nation (2h combined \u2013 options 2A+2B)",
        "date": "2026-06-04",
        "session": "AM",
        "duration": "2h",
        "code": "8145"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Italian",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "35m/45m",
        "code": "8633"
      },
      {
        "name": "Reading (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "45m/1h",
        "code": "8633"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "1h/1h15m",
        "code": "8633"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Mathematics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Non-Calculator (F/H)",
        "date": "2026-05-14",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8300"
      },
      {
        "name": "Paper 2: Calculator (F/H)",
        "date": "2026-06-03",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8300"
      },
      {
        "name": "Paper 3: Calculator (F/H)",
        "date": "2026-06-10",
        "session": "AM",
        "duration": "1h 30m",
        "code": "8300"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Media Studies",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8572"
      },
      {
        "name": "Paper 2",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8572"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Modern Hebrew",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8678"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-17",
        "session": "AM",
        "duration": "1h/1h15m",
        "code": "8678"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Music",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Understanding Music (Written)",
        "date": "2026-06-05",
        "session": "PM",
        "duration": "1h 30m",
        "code": "8271"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Panjabi",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8683"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "1h/1h15m",
        "code": "8683"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Physical Education",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Human Body & Movement",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8582"
      },
      {
        "name": "Paper 2: Socio-cultural Influences & Wellbeing",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "1h 15m",
        "code": "8582"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Physics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8463"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-15",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8463"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Polish",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Listening (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "35m/45m",
        "code": "8688"
      },
      {
        "name": "Writing (F/H)",
        "date": "2026-06-12",
        "session": "PM",
        "duration": "1h/1h15m",
        "code": "8688"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Psychology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Cognition and Behaviour",
        "date": "2026-05-07",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8182"
      },
      {
        "name": "Paper 2: Social Context and Behaviour",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8182"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Religious Studies A",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Study of Religions (2 options)",
        "date": "2026-05-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8062"
      },
      {
        "name": "Paper 2A or 2B: Thematic Studies",
        "date": "2026-05-20",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8062"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Religious Studies B",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Catholic Christianity",
        "date": "2026-05-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8063"
      },
      {
        "name": "Paper 2: Perspectives on Faith",
        "date": "2026-05-20",
        "session": "PM",
        "duration": "1h 45m",
        "code": "8063"
      }
    ]
  },
  {
    "board": "AQA",
    "subject": "Sociology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Families and Education",
        "date": "2026-05-08",
        "session": "AM",
        "duration": "1h 45m",
        "code": "8192"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Arabic",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "35m/45m",
        "code": "1AA0"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "50m/1h05m",
        "code": "1AA0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "1h20m/1h25m",
        "code": "1AA0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Astronomy",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Naked-eye Astronomy",
        "date": "2026-06-01",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1AS0"
      },
      {
        "name": "Paper 2: Telescopic Astronomy",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1AS0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Biblical Hebrew",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Component 1: Language",
        "date": "2026-05-07",
        "session": "AM",
        "duration": "2h 00m",
        "code": "1BH0"
      },
      {
        "name": "Component 2: Literature",
        "date": "2026-05-19",
        "session": "PM",
        "duration": "2h 00m",
        "code": "1BH0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Biology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-05-12",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1BI0"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1BI0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Business",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Investigating Small Business",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1BS0"
      },
      {
        "name": "Paper 2: Building a Business",
        "date": "2026-05-21",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1BS0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Chemistry",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1CH0"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-09",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1CH0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Chinese",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1CN0"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-05-11",
        "session": "PM",
        "duration": "50m/1h05m",
        "code": "1CN0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "1h20m/1h25m",
        "code": "1CN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Citizenship Studies",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-07",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1CS0"
      },
      {
        "name": "Paper 2",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1CS0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Combined Science",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Biology 1 (F/H)",
        "date": "2026-05-12",
        "session": "PM",
        "duration": "1h 10m",
        "code": "1SC0"
      },
      {
        "name": "Paper 2: Chemistry 1 (F/H)",
        "date": "2026-05-18",
        "session": "AM",
        "duration": "1h 10m",
        "code": "1SC0"
      },
      {
        "name": "Paper 3: Physics 1 (F/H)",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "1h 10m",
        "code": "1SC0"
      },
      {
        "name": "Paper 4: Biology 2 (F/H)",
        "date": "2026-06-08",
        "session": "AM",
        "duration": "1h 10m",
        "code": "1SC0"
      },
      {
        "name": "Paper 5: Chemistry 2 (F/H)",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "1h 10m",
        "code": "1SC0"
      },
      {
        "name": "Paper 6: Physics 2 (F/H)",
        "date": "2026-06-15",
        "session": "AM",
        "duration": "1h 10m",
        "code": "1SC0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Computer Science",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Principles of Computer Science",
        "date": "2026-05-13",
        "session": "PM",
        "duration": "1h 30m",
        "code": "1CP2"
      },
      {
        "name": "Paper 2: Application of Computational Thinking (On-screen, IDE)",
        "date": "2026-05-19",
        "session": "PM",
        "duration": "2h 00m",
        "code": "1CP2"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Drama",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Component 3: Theatre Makers in Practice (Written)",
        "date": "2026-05-08",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1DR0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Design & Technology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Component 1 (choice of material/system)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1DT0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "English Language",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Fiction & Imaginative Writing",
        "date": "2026-05-21",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1EN0"
      },
      {
        "name": "Paper 2: Non-Fiction & Transactional Writing",
        "date": "2026-06-05",
        "session": "AM",
        "duration": "2h 05m",
        "code": "1EN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "English Language 2.0",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Non-Fiction Texts",
        "date": "2026-05-21",
        "session": "AM",
        "duration": "1h 55m",
        "code": "1EN2"
      },
      {
        "name": "Paper 2: Contemporary Texts",
        "date": "2026-06-05",
        "session": "AM",
        "duration": "1h 55m",
        "code": "1EN2"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "English Literature",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Shakespeare & Post-1914 Literature",
        "date": "2026-05-11",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1ET0"
      },
      {
        "name": "Paper 2: 19th-Century Novel & Poetry since 1789",
        "date": "2026-05-19",
        "session": "AM",
        "duration": "2h 15m",
        "code": "1ET0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "French",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 2: Listening (F/H)",
        "date": "2026-05-20",
        "session": "AM",
        "duration": "45m/1h00m",
        "code": "1FR1"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-06-04",
        "session": "PM",
        "duration": "45m/1h00m",
        "code": "1FR1"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-08",
        "session": "PM",
        "duration": "1h15m/1h20m",
        "code": "1FR1"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Geography A",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: The Physical Environment",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1GA0"
      },
      {
        "name": "Paper 2: The Human Environment",
        "date": "2026-06-03",
        "session": "PM",
        "duration": "1h 30m",
        "code": "1GA0"
      },
      {
        "name": "Paper 3: Geographical Investigations: Fieldwork & UK Challenges",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1GA0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Geography B",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Global Geographical Issues",
        "date": "2026-05-13",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1GB0"
      },
      {
        "name": "Paper 2: UK Geographical Issues",
        "date": "2026-06-03",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1GB0"
      },
      {
        "name": "Paper 3: People & Environment Issues \u2013 Making Decisions",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1GB0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "German",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 2: Listening (F/H)",
        "date": "2026-05-07",
        "session": "PM",
        "duration": "45m/1h00m",
        "code": "1GN1"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "45m/1h00m",
        "code": "1GN1"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-01",
        "session": "PM",
        "duration": "1h15m/1h20m",
        "code": "1GN1"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Greek",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1GK0"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "50m/1h05m",
        "code": "1GK0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Gujarati",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-06-01",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1GU0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-09",
        "session": "PM",
        "duration": "1h20m/1h25m",
        "code": "1GU0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "History",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Thematic Study & Historic Environment",
        "date": "2026-05-15",
        "session": "AM",
        "duration": "1h 20m",
        "code": "1HI0"
      },
      {
        "name": "Paper 2: Period Study & British Depth Study",
        "date": "2026-06-04",
        "session": "AM",
        "duration": "1h 50m",
        "code": "1HI0"
      },
      {
        "name": "Paper 3: Modern Depth Study",
        "date": "2026-06-09",
        "session": "PM",
        "duration": "1h 30m",
        "code": "1HI0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Italian",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "35m/45m",
        "code": "1IN0"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "45m/1h00m",
        "code": "1IN0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "1h15m/1h20m",
        "code": "1IN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Japanese",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "35m/45m",
        "code": "1JA0"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "50m/1h05m",
        "code": "1JA0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-09",
        "session": "AM",
        "duration": "1h20m/1h25m",
        "code": "1JA0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Mathematics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Non-Calculator (F/H)",
        "date": "2026-05-14",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1MA1"
      },
      {
        "name": "Paper 2: Calculator (F/H)",
        "date": "2026-06-03",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1MA1"
      },
      {
        "name": "Paper 3: Calculator (F/H)",
        "date": "2026-06-10",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1MA1"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Music",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Component 3: Appraising",
        "date": "2026-06-05",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1MU0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Physical Education",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Component 1: Fitness & Body Systems",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "1h 30m",
        "code": "1PE0"
      },
      {
        "name": "Component 2: Health & Performance",
        "date": "2026-06-01",
        "session": "AM",
        "duration": "1h 15m",
        "code": "1PE0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Persian",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1PN0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Physics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-06-02",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1PH0"
      },
      {
        "name": "Paper 2 (F/H)",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1PH0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Portuguese",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1PG0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Psychology",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1",
        "date": "2026-05-07",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1PS0"
      },
      {
        "name": "Paper 2",
        "date": "2026-05-14",
        "session": "PM",
        "duration": "1h 20m",
        "code": "1PS0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Religious Studies A",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Area of Study 1 \u2013 Study of Religion",
        "date": "2026-05-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1RA0"
      },
      {
        "name": "Paper 2: Area of Study 2 \u2013 Study of Second Religion",
        "date": "2026-05-20",
        "session": "PM",
        "duration": "50m",
        "code": "1RA0"
      },
      {
        "name": "Paper 3: Philosophy & Ethics",
        "date": "2026-06-01",
        "session": "PM",
        "duration": "50m",
        "code": "1RA0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Religious Studies B",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Religion & Ethics",
        "date": "2026-05-12",
        "session": "AM",
        "duration": "1h 45m",
        "code": "1RB0"
      },
      {
        "name": "Paper 2: Religion, Peace & Conflict",
        "date": "2026-05-20",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1RB0"
      },
      {
        "name": "Paper 3: Religion, Philosophy & Social Justice",
        "date": "2026-06-01",
        "session": "PM",
        "duration": "1h 45m",
        "code": "1RB0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Russian",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1RU0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-10",
        "session": "PM",
        "duration": "1h20m/1h25m",
        "code": "1RU0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Spanish",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 2: Listening (F/H)",
        "date": "2026-06-09",
        "session": "AM",
        "duration": "45m/1h00m",
        "code": "1SP1"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-06-11",
        "session": "AM",
        "duration": "45m/1h00m",
        "code": "1SP1"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-17",
        "session": "AM",
        "duration": "1h15m/1h20m",
        "code": "1SP1"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Statistics",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1 (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "1h 30m",
        "code": "1ST0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Turkish",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-05-07",
        "session": "AM",
        "duration": "35m/45m",
        "code": "1TU0"
      },
      {
        "name": "Paper 3: Reading (F/H)",
        "date": "2026-05-07",
        "session": "AM",
        "duration": "50m/1h05m",
        "code": "1TU0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-05-22",
        "session": "AM",
        "duration": "1h20m/1h25m",
        "code": "1TU0"
      }
    ]
  },
  {
    "board": "Edexcel",
    "subject": "Urdu",
    "qualification": "GCSE",
    "papers": [
      {
        "name": "Paper 1: Listening (F/H)",
        "date": "2026-05-18",
        "session": "PM",
        "duration": "35m/45m",
        "code": "1UR0"
      },
      {
        "name": "Paper 4: Writing (F/H)",
        "date": "2026-06-02",
        "session": "PM",
        "duration": "1h20m/1h25m",
        "code": "1UR0"
      }
    ]
  }
]

  // English Language
  { board:'AQA', subject:'English Language', qualification:'GCSE', papers:[
    { name:'Paper 1: Explorations in Creative Reading & Writing', date:'2026-05-21', session:'AM', duration:105, code:'8700/1' },
    { name:'Paper 2: Writers\' Viewpoints & Perspectives', date:'2026-06-05', session:'AM', duration:105, code:'8700/2' },
  ]},

  // Mathematics
  { board:'AQA', subject:'Mathematics', qualification:'GCSE', papers:[
    { name:'Paper 1: Non-Calculator', date:'2026-05-14', session:'AM', duration:90, code:'8300/1F', codeH:'8300/1H' },
    { name:'Paper 2: Calculator', date:'2026-06-03', session:'AM', duration:90, code:'8300/2F', codeH:'8300/2H' },
    { name:'Paper 3: Calculator', date:'2026-06-10', session:'AM', duration:90, code:'8300/3F', codeH:'8300/3H' },
  ]},

  // Further Mathematics (AQA Level 2)
  { board:'AQA', subject:'Further Mathematics', qualification:'GCSE', papers:[
    { name:'Paper 1', date:'2026-06-08', session:'PM', duration:105, code:'8365/1' },
    { name:'Paper 2', date:'2026-06-15', session:'PM', duration:105, code:'8365/2' },
  ]},

  // Biology
  { board:'AQA', subject:'Biology', qualification:'GCSE', papers:[
    { name:'Paper 1', date:'2026-05-12', session:'PM', duration:105, code:'8461/1H' },
    { name:'Paper 2', date:'2026-06-08', session:'AM', duration:105, code:'8461/2H' },
  ]},

  // Chemistry
  { board:'AQA', subject:'Chemistry', qualification:'GCSE', papers:[
    { name:'Paper 1', date:'2026-05-18', session:'AM', duration:105, code:'8462/1H' },
    { name:'Paper 2', date:'2026-06-12', session:'AM', duration:105, code:'8462/2H' },
  ]},

  // Physics
  { board:'AQA', subject:'Physics', qualification:'GCSE', papers:[
    { name:'Paper 1', date:'2026-06-02', session:'AM', duration:105, code:'8463/1H' },
    { name:'Paper 2', date:'2026-06-15', session:'AM', duration:105, code:'8463/2H' },
  ]},

  // Combined Science: Trilogy
  { board:'AQA', subject:'Combined Science: Trilogy', qualification:'GCSE', gradingSystem:'GCSE_COMBINED', papers:[
    { name:'Biology Paper 1', date:'2026-05-12', session:'PM', duration:75, code:'8464/B/1H' },
    { name:'Chemistry Paper 1', date:'2026-05-18', session:'AM', duration:75, code:'8464/C/1H' },
    { name:'Physics Paper 1', date:'2026-06-02', session:'AM', duration:75, code:'8464/P/1H' },
    { name:'Biology Paper 2', date:'2026-06-08', session:'AM', duration:75, code:'8464/B/2H' },
    { name:'Chemistry Paper 2', date:'2026-06-12', session:'AM', duration:75, code:'8464/C/2H' },
    { name:'Physics Paper 2', date:'2026-06-15', session:'AM', duration:75, code:'8464/P/2H' },
  ]},

  // Geography
  { board:'AQA', subject:'Geography', qualification:'GCSE', papers:[
    { name:'Paper 1: Living with the Physical Environment', date:'2026-05-13', session:'AM', duration:90, code:'8035/1' },
    { name:'Paper 2: Challenges in the Human Environment', date:'2026-06-03', session:'PM', duration:90, code:'8035/2' },
    { name:'Paper 3: Geographical Applications', date:'2026-06-11', session:'AM', duration:90, code:'8035/3' },
  ]},

  // Computer Science
  { board:'AQA', subject:'Computer Science', qualification:'GCSE', papers:[
    { name:'Paper 1: Computational Thinking & Programming Skills', date:'2026-05-13', session:'PM', duration:150, code:'8525/1B' },
    { name:'Paper 2: Computing Concepts', date:'2026-05-19', session:'PM', duration:105, code:'8525/2' },
  ]},

  // History (AQA)
  { board:'AQA', subject:'History', qualification:'GCSE', papers:[
    { name:'Paper 1: Understanding the Modern World', date:'2026-05-15', session:'AM', duration:90, code:'8145/1' },
    { name:'Paper 2: Shaping the Nation', date:'2026-06-09', session:'AM', duration:105, code:'8145/2' },
  ]},

  // Religious Studies
  { board:'AQA', subject:'Religious Studies', qualification:'GCSE', papers:[
    { name:'Paper 1', date:'2026-05-12', session:'AM', duration:105, code:'8062/1' },
    { name:'Paper 2', date:'2026-05-20', session:'PM', duration:105, code:'8062/2A' },
  ]},

  // Drama
  { board:'AQA', subject:'Drama', qualification:'GCSE', papers:[
    { name:'Written Paper: Understanding Drama', date:'2026-05-08', session:'PM', duration:105, code:'8261/W' },
  ]},

  // Sociology
  { board:'AQA', subject:'Sociology', qualification:'GCSE', papers:[
    { name:'Paper 1: The Sociology of Families and Education', date:'2026-05-22', session:'AM', duration:105, code:'8192/1' },
    { name:'Paper 2: The Sociology of Crime & Deviance and Social Stratification', date:'2026-06-09', session:'PM', duration:105, code:'8192/2' },
  ]},

  // Psychology (AQA GCSE)
  { board:'AQA', subject:'Psychology', qualification:'GCSE', papers:[
    { name:'Paper 1', date:'2026-05-22', session:'PM', duration:105, code:'8182/1' },
    { name:'Paper 2', date:'2026-06-04', session:'AM', duration:105, code:'8182/2' },
  ]},

  // Business Studies (AQA GCSE)
  { board:'AQA', subject:'Business', qualification:'GCSE', papers:[
    { name:'Paper 1: Influences of Technology & Digital Marketing on Business Activity', date:'2026-05-22', session:'AM', duration:105, code:'8132/1' },
    { name:'Paper 2: Influences of Finance, HR & Marketing on Business Activity', date:'2026-06-11', session:'PM', duration:105, code:'8132/2' },
  ]},

  // Economics (AQA GCSE)
  { board:'AQA', subject:'Economics', qualification:'GCSE', papers:[
    { name:'Paper 1: How Markets Work', date:'2026-05-27', session:'AM', duration:90, code:'8136/1' },
    { name:'Paper 2: How the Economy Works', date:'2026-06-16', session:'AM', duration:90, code:'8136/2' },
  ]},

  // Media Studies (AQA GCSE)
  { board:'AQA', subject:'Media Studies', qualification:'GCSE', papers:[
    { name:'Paper 1', date:'2026-05-18', session:'PM', duration:90, code:'8572/1' },
    { name:'Paper 2', date:'2026-06-04', session:'PM', duration:90, code:'8572/2' },
  ]},

  // Food Preparation & Nutrition
  { board:'AQA', subject:'Food Preparation & Nutrition', qualification:'GCSE', papers:[
    { name:'Written Paper', date:'2026-06-11', session:'AM', duration:105, code:'8585/W' },
  ]},

  // Statistics (AQA GCSE)
  { board:'AQA', subject:'Statistics', qualification:'GCSE', papers:[
    { name:'Paper 1', date:'2026-06-04', session:'AM', duration:90, code:'8382/1F' },
    { name:'Paper 2', date:'2026-06-16', session:'PM', duration:90, code:'8382/2F' },
  ]},

  // ── Edexcel/Pearson GCSE ─────────────────────────────────────────────────────

  // Maths (Edexcel)
  { board:'Edexcel', subject:'Mathematics', qualification:'GCSE', papers:[
    { name:'Paper 1: Non-Calculator', date:'2026-05-14', session:'AM', duration:90, code:'1MA1 1' },
    { name:'Paper 2: Calculator', date:'2026-06-03', session:'AM', duration:90, code:'1MA1 2' },
    { name:'Paper 3: Calculator', date:'2026-06-10', session:'AM', duration:90, code:'1MA1 3' },
  ]},

  // History (Edexcel)
  { board:'Edexcel', subject:'History', qualification:'GCSE', papers:[
    { name:'Paper 1: Thematic Study & Historic Environment', date:'2026-05-15', session:'AM', duration:80, code:'1HI0 10-13' },
    { name:'Paper 2: Period Study & British Depth Study', date:'2026-06-04', session:'AM', duration:110, code:'1HI0 2A-2W' },
    { name:'Paper 3: Modern Depth Study', date:'2026-06-09', session:'PM', duration:90, code:'1HI0 30-33' },
  ]},

  // French (Edexcel)
  { board:'Edexcel', subject:'French', qualification:'GCSE', papers:[
    { name:'Listening', date:'2026-05-20', session:'AM', duration:45, code:'1FR1 2' },
    { name:'Reading', date:'2026-06-04', session:'PM', duration:45, code:'1FR1 3' },
    { name:'Writing', date:'2026-06-08', session:'PM', duration:75, code:'1FR1 4' },
  ]},

  // Spanish (Edexcel)
  { board:'Edexcel', subject:'Spanish', qualification:'GCSE', papers:[
    { name:'Listening', date:'2026-06-09', session:'AM', duration:45, code:'1SP1 2' },
    { name:'Reading', date:'2026-06-16', session:'AM', duration:45, code:'1SP1 3' },
    { name:'Writing', date:'2026-06-17', session:'AM', duration:75, code:'1SP1 4' },
  ]},

  // Physical Education (Edexcel)
  { board:'Edexcel', subject:'Physical Education', qualification:'GCSE', papers:[
    { name:'Component 1: Fitness & Body Systems', date:'2026-05-22', session:'AM', duration:90, code:'1PE0 01' },
    { name:'Component 2: Health & Performance', date:'2026-06-01', session:'AM', duration:75, code:'1PE0 02' },
  ]},

  // ── OCR GCSE ─────────────────────────────────────────────────────────────────

  // Mathematics (OCR)
  { board:'OCR', subject:'Mathematics', qualification:'GCSE', papers:[
    { name:'Paper 1: Non-Calculator', date:'2026-05-14', session:'AM', duration:90, code:'J560/01' },
    { name:'Paper 2: Calculator', date:'2026-06-03', session:'AM', duration:90, code:'J560/02' },
    { name:'Paper 3: Calculator', date:'2026-06-10', session:'AM', duration:90, code:'J560/03' },
  ]},

  // Computer Science (OCR)
  { board:'OCR', subject:'Computer Science', qualification:'GCSE', papers:[
    { name:'Paper 1: Computer Systems', date:'2026-05-13', session:'AM', duration:90, code:'J277/01' },
    { name:'Paper 2: Computational Thinking, Algorithms & Programming', date:'2026-05-19', session:'AM', duration:90, code:'J277/02' },
  ]},

  // ── AQA A-LEVEL ─────────────────────────────────────────────────────────────
  // Dates from AQA confirmed A-level timetable v1.1 May/June 2026

  // A-Level Biology
  { board:'AQA', subject:'Biology', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Paper 1', date:'2026-05-14', session:'AM', duration:120, code:'7402/1' },
    { name:'Paper 2', date:'2026-06-01', session:'AM', duration:120, code:'7402/2' },
    { name:'Paper 3', date:'2026-06-15', session:'AM', duration:120, code:'7402/3' },
  ]},

  // A-Level Chemistry
  { board:'AQA', subject:'Chemistry', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Paper 1', date:'2026-05-19', session:'AM', duration:120, code:'7405/1' },
    { name:'Paper 2', date:'2026-06-03', session:'AM', duration:120, code:'7405/2' },
    { name:'Paper 3', date:'2026-06-18', session:'AM', duration:120, code:'7405/3' },
  ]},

  // A-Level Physics
  { board:'AQA', subject:'Physics', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Paper 1', date:'2026-05-22', session:'AM', duration:120, code:'7408/1' },
    { name:'Paper 2', date:'2026-06-08', session:'AM', duration:120, code:'7408/2' },
    { name:'Paper 3', date:'2026-06-22', session:'AM', duration:120, code:'7408/3' },
  ]},

  // A-Level Mathematics
  { board:'AQA', subject:'Mathematics', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Paper 1: Pure Mathematics', date:'2026-05-18', session:'AM', duration:120, code:'7357/1' },
    { name:'Paper 2: Pure Mathematics', date:'2026-06-01', session:'AM', duration:120, code:'7357/2' },
    { name:'Paper 3: Statistics & Mechanics', date:'2026-06-15', session:'PM', duration:120, code:'7357/3' },
  ]},

  // A-Level Further Mathematics
  { board:'AQA', subject:'Further Mathematics', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Paper 1: Core Pure Mathematics 1', date:'2026-05-15', session:'AM', duration:120, code:'7367/1' },
    { name:'Paper 2: Core Pure Mathematics 2', date:'2026-05-29', session:'AM', duration:120, code:'7367/2' },
    { name:'Paper 3A/3B: Optional', date:'2026-06-11', session:'AM', duration:120, code:'7367/3' },
    { name:'Paper 4A/4B: Optional', date:'2026-06-19', session:'AM', duration:120, code:'7367/4' },
  ]},

  // A-Level Psychology
  { board:'AQA', subject:'Psychology', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Paper 1: Introductory Topics', date:'2026-05-15', session:'AM', duration:120, code:'7182/1' },
    { name:'Paper 2: Psychology in Context', date:'2026-05-20', session:'AM', duration:120, code:'7182/2' },
    { name:'Paper 3: Issues & Options', date:'2026-06-05', session:'AM', duration:120, code:'7182/3' },
  ]},

  // A-Level Sociology
  { board:'AQA', subject:'Sociology', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Paper 1: Education with Theory & Methods', date:'2026-05-14', session:'PM', duration:120, code:'7192/1' },
    { name:'Paper 2: Topics in Sociology', date:'2026-06-02', session:'AM', duration:120, code:'7192/2' },
    { name:'Paper 3: Crime & Deviance with Theory & Methods', date:'2026-06-16', session:'AM', duration:120, code:'7192/3' },
  ]},

  // A-Level History
  { board:'AQA', subject:'History', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Component 1: Breadth Study', date:'2026-05-18', session:'PM', duration:150, code:'7042/1' },
    { name:'Component 2A/2B: Depth Study', date:'2026-06-03', session:'PM', duration:150, code:'7042/2' },
    { name:'Component 3: Historical Investigation', date:'2026-06-17', session:'AM', duration:120, code:'7042/2C' },
  ]},

  // A-Level Geography
  { board:'AQA', subject:'Geography', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Paper 1: Physical Geography', date:'2026-05-20', session:'AM', duration:135, code:'7037/1' },
    { name:'Paper 2: Human Geography', date:'2026-06-04', session:'AM', duration:135, code:'7037/2' },
    { name:'Paper 3: Geography Fieldwork Investigation', date:'2026-06-18', session:'PM', duration:120, code:'7037/3' },
  ]},

  // A-Level English Literature
  { board:'AQA', subject:'English Literature', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Paper 1: Love Through the Ages', date:'2026-05-19', session:'PM', duration:180, code:'7712/1' },
    { name:'Paper 2: Texts in Shared Contexts', date:'2026-06-09', session:'PM', duration:150, code:'7712/2' },
  ]},

  // A-Level English Language
  { board:'AQA', subject:'English Language', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Paper 1: Language, the Individual & Society', date:'2026-05-21', session:'AM', duration:150, code:'7702/1' },
    { name:'Paper 2: Language Diversity & Change', date:'2026-06-11', session:'AM', duration:150, code:'7702/2' },
  ]},

  // A-Level Business
  { board:'AQA', subject:'Business', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Paper 1: Business 1', date:'2026-05-13', session:'AM', duration:120, code:'7132/1' },
    { name:'Paper 2: Business 2', date:'2026-06-02', session:'PM', duration:120, code:'7132/2' },
    { name:'Paper 3: Business 3', date:'2026-06-16', session:'PM', duration:120, code:'7132/3' },
  ]},

  // A-Level Economics
  { board:'AQA', subject:'Economics', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Paper 1: Markets & Market Failure', date:'2026-05-15', session:'PM', duration:120, code:'7136/1' },
    { name:'Paper 2: National & International Economy', date:'2026-06-01', session:'PM', duration:120, code:'7136/2' },
    { name:'Paper 3: Economic Principles & Issues', date:'2026-06-19', session:'AM', duration:120, code:'7136/3' },
  ]},

  // A-Level Computer Science
  { board:'AQA', subject:'Computer Science', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Paper 1: On-screen Exam', date:'2026-05-22', session:'AM', duration:150, code:'7517/1' },
    { name:'Paper 2: Written Exam', date:'2026-06-08', session:'PM', duration:150, code:'7517/2' },
  ]},

  // A-Level Politics
  { board:'AQA', subject:'Politics', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Paper 1: Government & Politics of the UK', date:'2026-05-13', session:'PM', duration:120, code:'7152/1' },
    { name:'Paper 2: Government & Politics of the USA & Comparative Politics', date:'2026-06-04', session:'PM', duration:120, code:'7152/2' },
    { name:'Paper 3: Political Ideas', date:'2026-06-22', session:'PM', duration:120, code:'7152/3' },
  ]},

  // A-Level Law
  { board:'AQA', subject:'Law', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Paper 1: The Nature of Law & The English Legal System', date:'2026-05-20', session:'PM', duration:120, code:'7162/1' },
    { name:'Paper 2: Criminal Law & Tort', date:'2026-06-09', session:'AM', duration:120, code:'7162/2' },
    { name:'Paper 3: Contract Law & Options', date:'2026-06-18', session:'AM', duration:120, code:'7162/3' },
  ]},

  // A-Level Religious Studies
  { board:'AQA', subject:'Religious Studies', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Paper 1', date:'2026-05-12', session:'PM', duration:180, code:'7062/1' },
    { name:'Paper 2', date:'2026-06-01', session:'PM', duration:180, code:'7062/2' },
  ]},

  // ─────────────────────────────────────────────────────────────────────────
  // OCR GCSE - Source: OCR Final Timetable June 2026 (published August 2025)
  // ─────────────────────────────────────────────────────────────────────────

  { board:'OCR', subject:'Biology A', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Paper 1 (F) / Paper 3 (H): Breadth in Biology', date:'2026-05-12', session:'PM', duration:105, code:'J247/01+03' },
    { name:'Paper 2 (F) / Paper 4 (H): Depth in Biology', date:'2026-06-08', session:'AM', duration:105, code:'J247/02+04' },
  ]},
  { board:'OCR', subject:'Biology B', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Breadth in Biology (F/H)', date:'2026-05-12', session:'PM', duration:105, code:'J257/01+03' },
    { name:'Depth in Biology (F/H)', date:'2026-06-08', session:'AM', duration:105, code:'J257/02+04' },
  ]},
  { board:'OCR', subject:'Business', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Business 1: Business Activity, Marketing and People', date:'2026-05-11', session:'PM', duration:90, code:'J204/01' },
    { name:'Business 2: Operations, Finance and Influences on Business', date:'2026-05-21', session:'PM', duration:90, code:'J204/02' },
  ]},
  { board:'OCR', subject:'Chemistry A', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Paper 1 (F) / Paper 3 (H)', date:'2026-05-18', session:'AM', duration:105, code:'J248/01+03' },
    { name:'Paper 2 (F) / Paper 4 (H)', date:'2026-06-12', session:'AM', duration:105, code:'J248/02+04' },
  ]},
  { board:'OCR', subject:'Chemistry B', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Breadth in Chemistry (F/H)', date:'2026-05-18', session:'AM', duration:105, code:'J258/01+03' },
    { name:'Depth in Chemistry (F/H)', date:'2026-06-12', session:'AM', duration:105, code:'J258/02+04' },
  ]},
  { board:'OCR', subject:'Citizenship Studies', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Citizenship in Perspective', date:'2026-05-07', session:'PM', duration:50, code:'J270/01' },
    { name:'Citizenship in Action', date:'2026-05-14', session:'PM', duration:105, code:'J270/02' },
    { name:'Our Rights, Our Society, Our World', date:'2026-06-01', session:'AM', duration:60, code:'J270/03' },
  ]},
  { board:'OCR', subject:'Combined Science A', qualification:'GCSE', gradingSystem:'GCSE_COMBINED', papers:[
    { name:'Paper 1 Biology (F) / Paper 7 Biology (H)', date:'2026-05-12', session:'PM', duration:70, code:'J250/01+07' },
    { name:'Paper 3 Chemistry (F) / Paper 9 Chemistry (H)', date:'2026-05-18', session:'AM', duration:70, code:'J250/03+09' },
    { name:'Paper 5 Physics (F) / Paper 11 Physics (H)', date:'2026-06-02', session:'AM', duration:70, code:'J250/05+11' },
    { name:'Paper 2 Biology (F) / Paper 8 Biology (H)', date:'2026-06-08', session:'AM', duration:70, code:'J250/02+08' },
    { name:'Paper 4 Chemistry (F) / Paper 10 Chemistry (H)', date:'2026-06-12', session:'AM', duration:70, code:'J250/04+10' },
    { name:'Paper 6 Physics (F) / Paper 12 Physics (H)', date:'2026-06-15', session:'AM', duration:70, code:'J250/06+12' },
  ]},
  { board:'OCR', subject:'Combined Science B', qualification:'GCSE', gradingSystem:'GCSE_COMBINED', papers:[
    { name:'Biology (F/H)', date:'2026-05-12', session:'PM', duration:105, code:'J260/01+05' },
    { name:'Chemistry (F/H)', date:'2026-05-18', session:'AM', duration:105, code:'J260/02+06' },
    { name:'Physics (F/H)', date:'2026-06-02', session:'AM', duration:105, code:'J260/03+07' },
    { name:'Combined Science (F/H)', date:'2026-06-08', session:'AM', duration:105, code:'J260/04+08' },
  ]},
  { board:'OCR', subject:'Computer Science', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Computer Systems', date:'2026-05-13', session:'PM', duration:90, code:'J277/01' },
    { name:'Computational Thinking, Algorithms and Programming', date:'2026-05-19', session:'PM', duration:90, code:'J277/02' },
  ]},
  { board:'OCR', subject:'Design and Technology', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Principles of Design and Technology', date:'2026-06-10', session:'PM', duration:120, code:'J310/01' },
  ]},
  { board:'OCR', subject:'Drama', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Drama: Performance and Response', date:'2026-05-08', session:'PM', duration:90, code:'J316/04' },
  ]},
  { board:'OCR', subject:'Economics', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Introduction to Economics', date:'2026-05-08', session:'PM', duration:90, code:'J205/01' },
    { name:'National and International Economics', date:'2026-05-22', session:'AM', duration:90, code:'J205/02' },
  ]},
  { board:'OCR', subject:'English Language', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Communicating Information and Ideas', date:'2026-05-21', session:'AM', duration:120, code:'J351/01' },
    { name:'Exploring Effects and Impact', date:'2026-06-05', session:'AM', duration:120, code:'J351/02' },
  ]},
  { board:'OCR', subject:'English Literature', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Exploring Modern and Literary Heritage Texts', date:'2026-05-11', session:'AM', duration:120, code:'J352/01' },
    { name:'Exploring Poetry and Shakespeare', date:'2026-05-19', session:'AM', duration:120, code:'J352/02' },
  ]},
  { board:'OCR', subject:'Food Preparation and Nutrition', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Food Preparation and Nutrition', date:'2026-06-11', session:'PM', duration:90, code:'J309/01' },
  ]},
  { board:'OCR', subject:'Geography A', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Living in the UK Today', date:'2026-05-13', session:'AM', duration:60, code:'J383/01' },
    { name:'The World Around Us', date:'2026-06-03', session:'PM', duration:60, code:'J383/02' },
    { name:'Geographical Skills', date:'2026-06-11', session:'AM', duration:90, code:'J383/03' },
  ]},
  { board:'OCR', subject:'Geography B', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Our Natural World', date:'2026-05-13', session:'AM', duration:90, code:'J384/01' },
    { name:'People and Society', date:'2026-06-03', session:'PM', duration:90, code:'J384/02' },
    { name:'Geographical Exploration', date:'2026-06-11', session:'AM', duration:90, code:'J384/03' },
  ]},
  { board:'OCR', subject:'History A', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Period Study with Non-British Depth Study', date:'2026-05-15', session:'AM', duration:105, code:'J410/01-07' },
    { name:'Thematic Study', date:'2026-06-04', session:'AM', duration:60, code:'J410/08-10' },
    { name:'British Depth Study with Historic Environment', date:'2026-06-09', session:'PM', duration:75, code:'J410/11-13' },
  ]},
  { board:'OCR', subject:'History B (Schools History Project)', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'British History: Thematic Study and Depth Study', date:'2026-06-04', session:'AM', duration:105, code:'J411/11-19' },
    { name:'History Around Us', date:'2026-05-15', session:'AM', duration:60, code:'J411/21' },
    { name:'World History: Period Study and Depth Study', date:'2026-06-09', session:'PM', duration:105, code:'J411/31-39' },
  ]},
  { board:'OCR', subject:'Mathematics', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Paper 1 (F-calculator) / Paper 4 (H-calculator)', date:'2026-05-14', session:'AM', duration:90, code:'J560/01+04' },
    { name:'Paper 2 (F-non-calc) / Paper 5 (H-non-calc)', date:'2026-06-03', session:'AM', duration:90, code:'J560/02+05' },
    { name:'Paper 3 (F-calculator) / Paper 6 (H-calculator)', date:'2026-06-10', session:'AM', duration:90, code:'J560/03+06' },
  ]},
  { board:'OCR', subject:'Media Studies', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Television and Promoting Media', date:'2026-05-18', session:'PM', duration:105, code:'J200/01' },
    { name:'Music and News', date:'2026-06-02', session:'PM', duration:75, code:'J200/02' },
  ]},
  { board:'OCR', subject:'Music', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Listening and Appraising', date:'2026-06-05', session:'PM', duration:90, code:'J536/05' },
  ]},
  { board:'OCR', subject:'Physical Education', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Physical Factors Affecting Performance', date:'2026-05-22', session:'AM', duration:60, code:'J587/01' },
    { name:'Socio-cultural Issues and Sports Psychology', date:'2026-06-01', session:'AM', duration:60, code:'J587/02' },
  ]},
  { board:'OCR', subject:'Physics A', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Paper 1 (F) / Paper 3 (H)', date:'2026-06-02', session:'AM', duration:105, code:'J249/01+03' },
    { name:'Paper 2 (F) / Paper 4 (H)', date:'2026-06-15', session:'AM', duration:105, code:'J249/02+04' },
  ]},
  { board:'OCR', subject:'Physics B', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Breadth in Physics (F/H)', date:'2026-06-02', session:'AM', duration:105, code:'J259/01+03' },
    { name:'Depth in Physics (F/H)', date:'2026-06-15', session:'AM', duration:105, code:'J259/02+04' },
  ]},
  { board:'OCR', subject:'Psychology', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Studies and Applications in Psychology 1', date:'2026-05-07', session:'AM', duration:90, code:'J203/01' },
    { name:'Studies and Applications in Psychology 2', date:'2026-05-14', session:'PM', duration:90, code:'J203/02' },
  ]},
  { board:'OCR', subject:'Religious Studies', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Beliefs and Teachings & Practices (choice of religion)', date:'2026-05-12', session:'AM', duration:60, code:'J625/01-05' },
    { name:'Religion, Philosophy and Ethics in the Modern World', date:'2026-05-20', session:'PM', duration:120, code:'J625/06-10' },
  ]},

  // ─────────────────────────────────────────────────────────────────────────
  // OCR Cambridge Nationals - Source: OCR Final Timetable June 2026
  // ─────────────────────────────────────────────────────────────────────────

  { board:'OCR', subject:'Cambridge National: Sport Studies', qualification:'Cambridge National Level 1/2', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Contemporary Issues in Sport', date:'2026-05-08', session:'AM', duration:75, code:'R184/01' },
  ]},
  { board:'OCR', subject:'Cambridge National: Creative iMedia', qualification:'Cambridge National Level 1/2', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Creative iMedia in the Media Industry', date:'2026-06-08', session:'PM', duration:90, code:'R093/01' },
  ]},
  { board:'OCR', subject:'Cambridge National: Engineering Design', qualification:'Cambridge National Level 1/2', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Principles of Engineering Design', date:'2026-05-12', session:'AM', duration:75, code:'R038/01' },
  ]},
  { board:'OCR', subject:'Cambridge National: Engineering Manufacture', qualification:'Cambridge National Level 1/2', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Principles of Engineering Manufacture', date:'2026-06-01', session:'AM', duration:75, code:'R014/01' },
  ]},
  { board:'OCR', subject:'Cambridge National: Engineering Programmable Systems', qualification:'Cambridge National Level 1/2', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Principles of Electronic and Programmable Systems', date:'2026-06-11', session:'PM', duration:75, code:'R047/01' },
  ]},
  { board:'OCR', subject:'Cambridge National: Health and Social Care', qualification:'Cambridge National Level 1/2', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Principles of Care in Health and Social Care Settings', date:'2026-06-03', session:'PM', duration:75, code:'R032/01' },
  ]},
  { board:'OCR', subject:'Cambridge National: IT', qualification:'Cambridge National Level 1/2', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'IT in the Digital World', date:'2026-05-15', session:'PM', duration:90, code:'R050/01' },
  ]},
  { board:'OCR', subject:'Cambridge National: Child Development', qualification:'Cambridge National Level 1/2', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Health and Well-being for Child Development', date:'2026-05-19', session:'PM', duration:75, code:'R057/01' },
  ]},
  { board:'OCR', subject:'Cambridge National: Enterprise and Marketing', qualification:'Cambridge National Level 1/2', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Enterprise and Marketing Concepts', date:'2026-05-20', session:'PM', duration:75, code:'R067/01' },
  ]},
  { board:'OCR', subject:'Cambridge National: Sport Science', qualification:'Cambridge National Level 1/2', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Reducing the Risk of Sports Injuries', date:'2026-05-18', session:'PM', duration:75, code:'R180/01' },
  ]},

  // ─────────────────────────────────────────────────────────────────────────
  // OCR A-Level - Source: OCR Final Timetable AS/A Level June 2026 (April 2025)
  // ─────────────────────────────────────────────────────────────────────────

  { board:'OCR', subject:'Biology A', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Biological Processes', date:'2026-06-04', session:'PM', duration:135, code:'H420/01' },
    { name:'Biological Diversity', date:'2026-06-12', session:'AM', duration:135, code:'H420/02' },
    { name:'Unified Biology', date:'2026-06-16', session:'AM', duration:90, code:'H420/03' },
  ]},
  { board:'OCR', subject:'Biology B (Advancing Biology)', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Fundamentals of Biology', date:'2026-06-04', session:'PM', duration:135, code:'H422/01' },
    { name:'Scientific Literacy in Biology', date:'2026-06-12', session:'AM', duration:135, code:'H422/02' },
    { name:'Practical Skills in Biology', date:'2026-06-16', session:'AM', duration:90, code:'H422/03' },
  ]},
  { board:'OCR', subject:'Business', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Operating in a Local Business Environment', date:'2026-05-13', session:'PM', duration:120, code:'H431/01' },
    { name:'The UK Business Environment', date:'2026-05-19', session:'AM', duration:120, code:'H431/02' },
    { name:'The Global Business Environment', date:'2026-06-09', session:'PM', duration:120, code:'H431/03' },
  ]},
  { board:'OCR', subject:'Chemistry A', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Periodic Table, Elements and Physical Chemistry', date:'2026-06-02', session:'AM', duration:135, code:'H432/01' },
    { name:'Synthesis and Analytical Techniques', date:'2026-06-09', session:'AM', duration:135, code:'H432/02' },
    { name:'Unified Chemistry', date:'2026-06-15', session:'AM', duration:90, code:'H432/03' },
  ]},
  { board:'OCR', subject:'Chemistry B (Salters)', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Fundamentals of Chemistry', date:'2026-06-02', session:'AM', duration:135, code:'H433/01' },
    { name:'Scientific Literacy in Chemistry', date:'2026-06-09', session:'AM', duration:135, code:'H433/02' },
    { name:'Practical Skills in Chemistry', date:'2026-06-15', session:'AM', duration:90, code:'H433/03' },
  ]},
  { board:'OCR', subject:'Computer Science', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Computer Systems', date:'2026-06-10', session:'PM', duration:150, code:'H446/01' },
    { name:'Algorithms and Programming', date:'2026-06-17', session:'AM', duration:150, code:'H446/02' },
  ]},
  { board:'OCR', subject:'Design and Technology: Design Engineering', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Principles of Design Engineering', date:'2026-05-22', session:'AM', duration:90, code:'H404/01' },
    { name:'Problem Solving in Design Engineering', date:'2026-06-10', session:'AM', duration:105, code:'H404/02' },
  ]},
  { board:'OCR', subject:'Design and Technology: Product Design', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Principles of Product Design', date:'2026-05-22', session:'AM', duration:90, code:'H406/01' },
    { name:'Problem Solving in Product Design', date:'2026-06-10', session:'AM', duration:105, code:'H406/02' },
  ]},
  { board:'OCR', subject:'Drama and Theatre', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Analysing Performance', date:'2026-05-21', session:'AM', duration:135, code:'H459/31' },
    { name:'Deconstructing Texts for Performance', date:'2026-06-04', session:'AM', duration:105, code:'H459/41-48' },
  ]},
  { board:'OCR', subject:'Economics', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Microeconomics', date:'2026-05-11', session:'AM', duration:120, code:'H460/01' },
    { name:'Macroeconomics', date:'2026-05-18', session:'PM', duration:120, code:'H460/02' },
    { name:'Themes in Economics', date:'2026-06-04', session:'AM', duration:120, code:'H460/03' },
  ]},
  { board:'OCR', subject:'English Language', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Exploring Language', date:'2026-05-11', session:'AM', duration:150, code:'H470/01' },
    { name:'Dimensions of Linguistic Variation', date:'2026-05-22', session:'AM', duration:150, code:'H470/02' },
  ]},
  { board:'OCR', subject:'English Literature', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Drama and Poetry Pre-1900', date:'2026-05-13', session:'AM', duration:150, code:'H472/01' },
    { name:'Comparative and Contextual Study', date:'2026-06-01', session:'AM', duration:150, code:'H472/02' },
  ]},
  { board:'OCR', subject:'Film Studies', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Film History', date:'2026-05-22', session:'AM', duration:120, code:'H410/01' },
    { name:'Critical Approaches to Film', date:'2026-06-02', session:'AM', duration:120, code:'H410/02' },
  ]},
  { board:'OCR', subject:'Further Mathematics A', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Pure Core 1', date:'2026-05-14', session:'PM', duration:90, code:'H245/Y540' },
    { name:'Pure Core 2', date:'2026-05-21', session:'PM', duration:90, code:'H245/Y541' },
    { name:'Statistics (option)', date:'2026-06-05', session:'PM', duration:90, code:'H245/Y542' },
    { name:'Mechanics (option)', date:'2026-06-12', session:'PM', duration:90, code:'H245/Y543' },
    { name:'Discrete Mathematics (option)', date:'2026-06-16', session:'PM', duration:90, code:'H245/Y544' },
  ]},
  { board:'OCR', subject:'Geography', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Physical Systems', date:'2026-05-12', session:'AM', duration:90, code:'H481/01' },
    { name:'Human Interactions', date:'2026-05-21', session:'PM', duration:90, code:'H481/02' },
    { name:'Geographical Debates', date:'2026-06-08', session:'PM', duration:150, code:'H481/03' },
  ]},
  { board:'OCR', subject:'History A', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Thematic Study and Historical Interpretations', date:'2026-05-19', session:'PM', duration:150, code:'H505/Y301-Y321' },
    { name:'British Period Study and Enquiry', date:'2026-06-02', session:'PM', duration:90, code:'H505/Y101-Y113' },
    { name:'Non-British Period Study', date:'2026-06-11', session:'AM', duration:60, code:'H505/Y201-Y224' },
  ]},
  { board:'OCR', subject:'Law', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'The Legal System and Criminal Law', date:'2026-05-21', session:'PM', duration:120, code:'H418/01' },
    { name:'Law Making and the Law of Tort', date:'2026-06-01', session:'PM', duration:120, code:'H418/02' },
    { name:'The Nature of Law and Human Rights or Contract', date:'2026-06-09', session:'AM', duration:120, code:'H418/03+04' },
  ]},
  { board:'OCR', subject:'Mathematics A', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Pure Mathematics', date:'2026-06-03', session:'PM', duration:120, code:'H240/01' },
    { name:'Pure Mathematics and Statistics', date:'2026-06-11', session:'PM', duration:120, code:'H240/02' },
    { name:'Pure Mathematics and Mechanics', date:'2026-06-18', session:'PM', duration:120, code:'H240/03' },
  ]},
  { board:'OCR', subject:'Mathematics B (MEI)', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Pure Mathematics and Mechanics', date:'2026-06-03', session:'PM', duration:120, code:'H640/01' },
    { name:'Pure Mathematics and Statistics', date:'2026-06-11', session:'PM', duration:120, code:'H640/02' },
    { name:'Pure Mathematics and Comprehension', date:'2026-06-18', session:'PM', duration:120, code:'H640/03' },
  ]},
  { board:'OCR', subject:'Media Studies', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Media Messages', date:'2026-05-14', session:'PM', duration:120, code:'H409/01' },
    { name:'Evolving Media', date:'2026-06-04', session:'PM', duration:120, code:'H409/02' },
  ]},
  { board:'OCR', subject:'Music', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Listening and Appraising', date:'2026-06-08', session:'PM', duration:150, code:'H543/05' },
  ]},
  { board:'OCR', subject:'Physical Education', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Physiological Factors Affecting Performance', date:'2026-05-21', session:'AM', duration:120, code:'H555/01' },
    { name:'Psychological Factors Affecting Performance', date:'2026-06-01', session:'PM', duration:60, code:'H555/02' },
    { name:'Socio-cultural Issues in Physical Activity and Sport', date:'2026-06-16', session:'AM', duration:60, code:'H555/03' },
  ]},
  { board:'OCR', subject:'Physics A', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Modelling Physics', date:'2026-05-20', session:'PM', duration:135, code:'H556/01' },
    { name:'Exploring Physics', date:'2026-06-01', session:'AM', duration:135, code:'H556/02' },
    { name:'Unified Physics', date:'2026-06-08', session:'AM', duration:90, code:'H556/03' },
  ]},
  { board:'OCR', subject:'Physics B (Advancing Physics)', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Fundamentals of Physics', date:'2026-05-20', session:'PM', duration:135, code:'H557/01' },
    { name:'Scientific Literacy in Physics', date:'2026-06-01', session:'AM', duration:135, code:'H557/02' },
    { name:'Practical Skills in Physics', date:'2026-06-08', session:'AM', duration:90, code:'H557/03' },
  ]},
  { board:'OCR', subject:'Psychology', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Research Methods', date:'2026-05-15', session:'AM', duration:120, code:'H567/01' },
    { name:'Psychological Themes Through Core Studies', date:'2026-05-20', session:'AM', duration:120, code:'H567/02' },
    { name:'Applied Psychology', date:'2026-06-05', session:'AM', duration:120, code:'H567/03' },
  ]},
  { board:'OCR', subject:'Religious Studies', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Philosophy of Religion', date:'2026-06-04', session:'AM', duration:120, code:'H573/01' },
    { name:'Religion and Ethics', date:'2026-06-09', session:'AM', duration:120, code:'H573/02' },
    { name:'Developments in Christian Thought', date:'2026-06-15', session:'PM', duration:120, code:'H573/03' },
  ]},
  { board:'OCR', subject:'Sociology', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Socialisation, Culture and Identity', date:'2026-05-18', session:'AM', duration:90, code:'H580/01' },
    { name:'Researching and Understanding Social Inequalities', date:'2026-06-03', session:'AM', duration:135, code:'H580/02' },
    { name:'Debates in Contemporary Society', date:'2026-06-12', session:'PM', duration:135, code:'H580/03' },
  ]},

  // ─────────────────────────────────────────────────────────────────────────
  // WJEC Eduqas GCSE (England) - Source: WJEC Final Timetable v4, September 2025
  // These are the Eduqas-branded versions used in England
  // ─────────────────────────────────────────────────────────────────────────

  { board:'Eduqas', subject:'Biology', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 1', date:'2026-05-12', session:'AM', duration:105, code:'C400U10-1' },
    { name:'Component 2', date:'2026-06-08', session:'AM', duration:105, code:'C400U20-1' },
  ]},
  { board:'Eduqas', subject:'Business', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 1', date:'2026-05-11', session:'PM', duration:120, code:'C510U10-1' },
    { name:'Component 2', date:'2026-05-21', session:'PM', duration:90, code:'C510U20-1' },
  ]},
  { board:'Eduqas', subject:'Chemistry', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 1', date:'2026-05-18', session:'AM', duration:105, code:'C410U10-1' },
    { name:'Component 2', date:'2026-06-12', session:'AM', duration:105, code:'C410U20-1' },
  ]},
  { board:'Eduqas', subject:'Computer Science', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 1: Written', date:'2026-05-13', session:'PM', duration:105, code:'C500U10-1' },
    { name:'Component 2: On Screen', date:'2026-05-19', session:'PM', duration:120, code:'C500U20-1' },
  ]},
  { board:'Eduqas', subject:'Design and Technology', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 1', date:'2026-06-10', session:'PM', duration:120, code:'C600U10-1' },
  ]},
  { board:'Eduqas', subject:'Drama', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 3: Written', date:'2026-05-08', session:'PM', duration:90, code:'C690U30-1' },
  ]},
  { board:'Eduqas', subject:'English Language', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 1: 21st Century Literature Reading and Creative Prose Writing', date:'2026-05-21', session:'AM', duration:105, code:'C700U10-1' },
    { name:'Component 2: 19th and 21st Century Non-Fiction Reading and Transactional/Persuasive Writing', date:'2026-06-05', session:'AM', duration:120, code:'C700U20-1' },
  ]},
  { board:'Eduqas', subject:'English Literature', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 1: Shakespeare and Poetry', date:'2026-05-11', session:'AM', duration:120, code:'C720U10-1' },
    { name:'Component 2: Post-1914 Prose/Drama, 19th-century Prose and Unseen Poetry', date:'2026-05-19', session:'AM', duration:150, code:'C720U20-1' },
  ]},
  { board:'Eduqas', subject:'Film Studies', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 1: Varieties of Film and Filmmaking', date:'2026-05-07', session:'PM', duration:90, code:'C670U10-1' },
    { name:'Component 2: Global Filmmaking Perspectives', date:'2026-05-21', session:'PM', duration:90, code:'C670U20-1' },
  ]},
  { board:'Eduqas', subject:'Food Preparation and Nutrition', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 1: Written Examination', date:'2026-06-11', session:'PM', duration:105, code:'C560UA0-1' },
  ]},
  { board:'Eduqas', subject:'Geography A', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 1: Changing Places – Changing World', date:'2026-05-12', session:'PM', duration:90, code:'C111U10-1' },
    { name:'Component 2: Sustaining the Planet', date:'2026-06-03', session:'PM', duration:90, code:'C111U20-1' },
    { name:'Component 3: Distinctive Landscapes', date:'2026-06-11', session:'AM', duration:90, code:'C111U30-1' },
  ]},
  { board:'Eduqas', subject:'Geography B', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 1: Our Changing World', date:'2026-05-12', session:'PM', duration:90, code:'C112U10-1' },
    { name:'Component 2: Our Dynamic Planet', date:'2026-06-03', session:'PM', duration:90, code:'C112U20-1' },
    { name:'Component 3: Environmental Challenges', date:'2026-06-11', session:'AM', duration:90, code:'C112U30-1' },
  ]},
  { board:'Eduqas', subject:'History', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 1: Studies in Depth (options A–H)', date:'2026-05-14', session:'PM', duration:120, code:'C100U10-1' },
    { name:'Component 2: Studies in Breadth (options A–H)', date:'2026-06-03', session:'PM', duration:120, code:'C100U20-1' },
  ]},
  { board:'Eduqas', subject:'Latin', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 1: Language', date:'2026-05-08', session:'AM', duration:90, code:'C990U10-1' },
    { name:'Component 2: Literature', date:'2026-05-15', session:'PM', duration:75, code:'C990U20-1' },
    { name:'Component 3: Literature Option A or B', date:'2026-05-21', session:'PM', duration:60, code:'C990UA/B' },
  ]},
  { board:'Eduqas', subject:'Mathematics', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 1: Non-Calculator (F/H)', date:'2026-05-14', session:'AM', duration:135, code:'C300U10-1' },
    { name:'Component 2: Calculator (F/H)', date:'2026-06-03', session:'AM', duration:135, code:'C300U20-1' },
  ]},
  { board:'Eduqas', subject:'Media Studies', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 1: Exploring the Media', date:'2026-05-18', session:'PM', duration:90, code:'C680U10-1' },
    { name:'Component 2: Understanding Media Forms and Products', date:'2026-06-02', session:'PM', duration:90, code:'C680U20-1' },
  ]},
  { board:'Eduqas', subject:'Music', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 3: Appraising', date:'2026-06-05', session:'PM', duration:75, code:'C660U30-1' },
  ]},
  { board:'Eduqas', subject:'Physical Education', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 1: Physical Factors Affecting Performance', date:'2026-05-22', session:'AM', duration:120, code:'C550U10-1' },
  ]},
  { board:'Eduqas', subject:'Physics', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 1', date:'2026-06-02', session:'AM', duration:105, code:'C420U10-1' },
    { name:'Component 2', date:'2026-06-15', session:'AM', duration:105, code:'C420U20-1' },
  ]},
  { board:'Eduqas', subject:'Religious Studies (Full Course) Route A', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 1: Religious, Philosophical and Ethical Studies', date:'2026-05-12', session:'AM', duration:120, code:'C120U10-1' },
    { name:'Component 2: Study of Christianity', date:'2026-05-20', session:'PM', duration:60, code:'C120U20-1' },
    { name:'Component 3: Study of Second Religion (options)', date:'2026-06-01', session:'AM', duration:60, code:'C120U30-70' },
  ]},
  { board:'Eduqas', subject:'Sociology', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Component 1: Understanding Social Structures', date:'2026-05-08', session:'AM', duration:105, code:'C200U10-1' },
    { name:'Component 2: Understanding Social Processes', date:'2026-05-15', session:'PM', duration:105, code:'C200U20-1' },
  ]},

  // ─────────────────────────────────────────────────────────────────────────
  // WJEC Eduqas A-Level (England) - Source: WJEC Final Timetable, April 2025
  // ─────────────────────────────────────────────────────────────────────────

  { board:'Eduqas', subject:'Biology', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Component 1: Energy, Homeostasis and the Environment', date:'2026-06-04', session:'AM', duration:120, code:'A400U10-1' },
    { name:'Component 2: Continuity and Change', date:'2026-06-12', session:'AM', duration:120, code:'A400U20-1' },
    { name:'Component 3: Organisms and Environments', date:'2026-06-15', session:'AM', duration:120, code:'A400U30-1' },
  ]},
  { board:'Eduqas', subject:'Business', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Component 1: Business Opportunities and Functions', date:'2026-05-13', session:'AM', duration:135, code:'A510U10-1' },
    { name:'Component 2: Business Analysis and Strategy', date:'2026-05-19', session:'PM', duration:135, code:'A510U20-1' },
    { name:'Component 3: Business in a Changing World', date:'2026-06-09', session:'PM', duration:135, code:'A510U30-1' },
  ]},
  { board:'Eduqas', subject:'Chemistry', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Component 1: Physical and Inorganic Chemistry', date:'2026-06-02', session:'AM', duration:150, code:'A410U10-1' },
    { name:'Component 2: Organic Chemistry and Analysis', date:'2026-06-08', session:'PM', duration:150, code:'A410U20-1' },
    { name:'Component 3: Physical Chemistry and Practical Skills', date:'2026-06-15', session:'AM', duration:75, code:'A410U30-1' },
  ]},
  { board:'Eduqas', subject:'Computer Science', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Component 1: Computer Architecture, Data, Communication and Applications', date:'2026-06-10', session:'PM', duration:165, code:'A500U10-1' },
    { name:'Component 2: Algorithms and Programming', date:'2026-06-17', session:'AM', duration:165, code:'A500U20-1' },
  ]},
  { board:'Eduqas', subject:'Drama and Theatre', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Component 3: Written Examination', date:'2026-05-21', session:'PM', duration:150, code:'A690U30-1' },
  ]},
  { board:'Eduqas', subject:'Economics', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Component 1: Microeconomics', date:'2026-05-11', session:'PM', duration:90, code:'A520U10-1' },
    { name:'Component 2: Macroeconomics', date:'2026-05-18', session:'AM', duration:150, code:'A520U20-1' },
    { name:'Component 3: Microeconomics and Macroeconomics', date:'2026-06-04', session:'AM', duration:150, code:'A520U30-1' },
  ]},
  { board:'Eduqas', subject:'English Language', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Component 1: Language in Context', date:'2026-05-11', session:'PM', duration:120, code:'A700U10-1' },
    { name:'Component 2: Language Investigation and Creative Writing', date:'2026-05-22', session:'PM', duration:135, code:'A700U20-1' },
    { name:'Component 3: Language, Power and Identity', date:'2026-06-03', session:'PM', duration:105, code:'A700U30-1' },
  ]},
  { board:'Eduqas', subject:'English Literature', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Component 1: Poetry', date:'2026-05-13', session:'AM', duration:120, code:'A720U10-1' },
    { name:'Component 2: Drama', date:'2026-06-01', session:'AM', duration:120, code:'A720U20-1' },
    { name:'Component 3: Prose', date:'2026-06-10', session:'AM', duration:120, code:'A720U30-1' },
  ]},
  { board:'Eduqas', subject:'Film Studies', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Component 1: US Film', date:'2026-05-22', session:'PM', duration:150, code:'A670U10-1' },
    { name:'Component 2: Global Film', date:'2026-06-02', session:'AM', duration:150, code:'A670U20-1' },
  ]},
  { board:'Eduqas', subject:'Geography', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Component 1: Changing Landscapes', date:'2026-05-12', session:'PM', duration:105, code:'A110U10-1' },
    { name:'Component 2: Changing Places', date:'2026-05-21', session:'PM', duration:120, code:'A110U20-1' },
    { name:'Component 3: Global Systems and Global Governance', date:'2026-06-08', session:'PM', duration:135, code:'A110U30-1' },
  ]},
  { board:'Eduqas', subject:'History', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Component 1 (option A to H)', date:'TBC', session:'AM', duration:120, code:'A100U10-1' },
    { name:'Component 2 (option A to H)', date:'TBC', session:'AM', duration:120, code:'A100U20-1' },
    { name:'Component 3 (option A to H)', date:'TBC', session:'AM', duration:120, code:'A100U30-1' },
  ]},
  { board:'Eduqas', subject:'Law', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Component 1: The Nature of Law and the English Legal System', date:'2026-05-21', session:'PM', duration:90, code:'A150U10-1' },
    { name:'Component 2: The Law of Obligations', date:'2026-06-01', session:'PM', duration:120, code:'A150U20-1' },
    { name:'Component 3: Human Rights Law', date:'2026-06-09', session:'PM', duration:135, code:'A150U30-1' },
  ]},
  { board:'Eduqas', subject:'Media Studies', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Component 1: Media Products, Industries and Audiences', date:'2026-05-14', session:'PM', duration:135, code:'A680U10-1' },
    { name:'Component 2: Media Forms and Products in Depth', date:'2026-06-04', session:'PM', duration:150, code:'A680U20-1' },
  ]},
  { board:'Eduqas', subject:'Physical Education', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Component 1: Anatomy and Physiology; Exercise Physiology; Biomechanics', date:'2026-05-21', session:'PM', duration:120, code:'A550U10-1' },
    { name:'Component 2: Psychology of Sport; Socio-cultural Issues', date:'2026-06-01', session:'PM', duration:120, code:'A550U20-1' },
  ]},
  { board:'Eduqas', subject:'Physics', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Component 1: Newtonian Physics', date:'2026-05-20', session:'PM', duration:135, code:'A420U10-1' },
    { name:'Component 2: Electromagnetism and Light', date:'2026-06-01', session:'PM', duration:120, code:'A420U20-1' },
    { name:'Component 3: Oscillations and Nuclei', date:'2026-06-08', session:'PM', duration:135, code:'A420U30-1' },
  ]},
  { board:'Eduqas', subject:'Psychology', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Component 1: Memories and Thinking, Social Behaviour and Diversity', date:'2026-05-15', session:'PM', duration:135, code:'A290U10-1' },
    { name:'Component 2: Behaviour, Alternatives, Research', date:'2026-05-20', session:'PM', duration:135, code:'A290U20-1' },
    { name:'Component 3: Applied and Issues', date:'2026-06-05', session:'PM', duration:120, code:'A290U30-1' },
  ]},
  { board:'Eduqas', subject:'Religious Studies', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Component 1: An Introduction to the Study of Religion (options A–F)', date:'2026-06-04', session:'AM', duration:120, code:'A120U10-1' },
    { name:'Component 2: The Study of Religion (options)', date:'2026-06-09', session:'PM', duration:120, code:'A120U20-1' },
    { name:'Component 3: Applied Study of Religion', date:'2026-06-15', session:'AM', duration:120, code:'A120U30-1' },
  ]},
  { board:'Eduqas', subject:'Sociology', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'Component 1: Socialisation and Identity', date:'2026-05-18', session:'AM', duration:150, code:'A200U10-1' },
    { name:'Component 2: Understanding Social Processes', date:'2026-06-03', session:'PM', duration:105, code:'A200U20-1' },
    { name:'Component 3: Social Change', date:'2026-06-12', session:'PM', duration:150, code:'A200U30-1' },
  ]},

  // ─────────────────────────────────────────────────────────────────────────
  // CCEA GCSE - Source: JCQ common timetable; CCEA confirmed dates for 2026
  // Northern Ireland board — dates align with JCQ timetable for core subjects
  // ─────────────────────────────────────────────────────────────────────────

  { board:'CCEA', subject:'Biology', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Unit 1: Cells, Living Processes and Biodiversity', date:'2026-05-12', session:'AM', duration:75, code:'GBI11' },
    { name:'Unit 2: Body Systems, Ecology and the Environment', date:'2026-06-05', session:'AM', duration:75, code:'GBI12' },
  ]},
  { board:'CCEA', subject:'Chemistry', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Unit 1: Basic Concepts in Chemistry', date:'2026-05-18', session:'AM', duration:75, code:'GCH11' },
    { name:'Unit 2: Further Chemical Reactions, Rates and Equilibrium, Calculations and Organic Chemistry', date:'2026-06-12', session:'AM', duration:75, code:'GCH12' },
  ]},
  { board:'CCEA', subject:'Double Award Science', qualification:'GCSE', gradingSystem:'GCSE_COMBINED', papers:[
    { name:'Unit 1: Double Award Science', date:'2026-05-12', session:'AM', duration:75, code:'GDAS1' },
    { name:'Unit 2: Double Award Science', date:'2026-05-18', session:'AM', duration:75, code:'GDAS2' },
    { name:'Unit 3: Double Award Science', date:'2026-06-02', session:'AM', duration:75, code:'GDAS3' },
    { name:'Unit 4: Double Award Science', date:'2026-06-12', session:'AM', duration:75, code:'GDAS4' },
  ]},
  { board:'CCEA', subject:'English Language', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Unit 1: Writing for Purpose and Audience, Reading to Access Non-Fiction Texts', date:'2026-05-21', session:'AM', duration:105, code:'GEL11' },
    { name:'Unit 2: Speaking and Listening', date:'TBC', session:'—', duration:0, code:'GEL12' },
  ]},
  { board:'CCEA', subject:'English Literature', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Unit 1: The Study of Prose', date:'2026-05-11', session:'AM', duration:90, code:'GET11' },
    { name:'Unit 2: The Study of Poetry and Drama', date:'2026-06-05', session:'AM', duration:90, code:'GET12' },
  ]},
  { board:'CCEA', subject:'Geography', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Unit 1: Understanding Our Natural World', date:'2026-05-13', session:'AM', duration:75, code:'GGY11' },
    { name:'Unit 2: Living in Our World', date:'2026-06-11', session:'AM', duration:75, code:'GGY12' },
  ]},
  { board:'CCEA', subject:'History', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Unit 1: Life under Nazi Rule 1933–1945 and The United States 1918–1968', date:'2026-05-15', session:'AM', duration:90, code:'GHY11' },
    { name:'Unit 2: Changing Relations: Northern Ireland and its Neighbours', date:'2026-06-04', session:'AM', duration:90, code:'GHY12' },
  ]},
  { board:'CCEA', subject:'Mathematics', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Unit T1: Foundation Tier Paper 1 (Non-Calculator)', date:'2026-05-14', session:'AM', duration:75, code:'GMT11' },
    { name:'Unit T2: Foundation Tier Paper 2 (Calculator)', date:'2026-06-03', session:'AM', duration:75, code:'GMT12' },
    { name:'Unit T3: Higher Tier Paper 1 (Non-Calculator)', date:'2026-05-14', session:'AM', duration:90, code:'GMT31' },
    { name:'Unit T4: Higher Tier Paper 2 (Calculator)', date:'2026-06-03', session:'AM', duration:90, code:'GMT32' },
    { name:'Unit T5: Higher Tier Paper 3 (Calculator)', date:'2026-06-10', session:'AM', duration:90, code:'GMT33' },
  ]},
  { board:'CCEA', subject:'Physics', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Unit 1: Forces, Energy and Electricity', date:'2026-06-02', session:'AM', duration:75, code:'GPH11' },
    { name:'Unit 2: Waves, Particles and the Universe', date:'2026-06-15', session:'AM', duration:75, code:'GPH12' },
  ]},
  { board:'CCEA', subject:'Religious Studies', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Unit 1: The Christian Church', date:'2026-05-12', session:'AM', duration:75, code:'GRS11' },
    { name:'Unit 2: The Christian Church in the Local and Global Community', date:'2026-05-20', session:'PM', duration:75, code:'GRS12' },
  ]},
  { board:'CCEA', subject:'Technology and Design', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Unit 1: Designing and Making', date:'2026-06-10', session:'PM', duration:120, code:'GTD11' },
  ]},
  { board:'CCEA', subject:'Business', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Unit 1: The Business Environment', date:'2026-05-11', session:'PM', duration:90, code:'GBS11' },
    { name:'Unit 2: Business Growth and Development', date:'2026-05-21', session:'PM', duration:90, code:'GBS12' },
  ]},
  { board:'CCEA', subject:'Computer Science', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Unit 1: Digital Technology', date:'2026-05-13', session:'PM', duration:90, code:'GCS11' },
    { name:'Unit 2: Practical Problem Solving with ICT', date:'2026-05-19', session:'PM', duration:90, code:'GCS12' },
  ]},
  { board:'CCEA', subject:'French', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Listening (F/H)', date:'2026-05-20', session:'AM', duration:45, code:'GFR11' },
    { name:'Reading (F/H)', date:'2026-05-20', session:'AM', duration:60, code:'GFR12' },
    { name:'Writing (F/H)', date:'2026-06-04', session:'PM', duration:75, code:'GFR13' },
  ]},
  { board:'CCEA', subject:'Spanish', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Listening (F/H)', date:'TBC', session:'AM', duration:45, code:'GSP11' },
    { name:'Reading (F/H)', date:'TBC', session:'AM', duration:60, code:'GSP12' },
    { name:'Writing (F/H)', date:'TBC', session:'PM', duration:75, code:'GSP13' },
  ]},
  { board:'CCEA', subject:'Home Economics', qualification:'GCSE', gradingSystem:'GCSE_STANDARD', papers:[
    { name:'Unit 1: Food and Nutrition', date:'2026-06-11', session:'PM', duration:90, code:'GHE11' },
  ]},

  // ─────────────────────────────────────────────────────────────────────────
  // CCEA A-Level - Source: CCEA confirmed June 2026 timetable (JCQ aligned)
  // ─────────────────────────────────────────────────────────────────────────

  { board:'CCEA', subject:'Biology', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'AS Unit 1: Molecules and Cells', date:'2026-05-12', session:'AM', duration:90, code:'A2BI11' },
    { name:'AS Unit 2: Organisms and Biodiversity', date:'2026-05-21', session:'AM', duration:90, code:'A2BI12' },
    { name:'A2 Unit 1: Physiology, Coordination and Control', date:'2026-06-04', session:'PM', duration:120, code:'A2BI21' },
    { name:'A2 Unit 2: Biochemistry, Genetics and Evolutionary Trends', date:'2026-06-12', session:'AM', duration:120, code:'A2BI22' },
  ]},
  { board:'CCEA', subject:'Chemistry', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'AS Unit 1: Basic Concepts in Physical and Inorganic Chemistry', date:'2026-05-12', session:'AM', duration:90, code:'A2CH11' },
    { name:'AS Unit 2: Further Physical and Organic Chemistry', date:'2026-05-19', session:'AM', duration:90, code:'A2CH12' },
    { name:'A2 Unit 1: Further Physical and Inorganic Chemistry', date:'2026-06-02', session:'AM', duration:120, code:'A2CH21' },
    { name:'A2 Unit 2: Analytical, Transition Metals, Electrochemistry and Organic Nitrogen', date:'2026-06-09', session:'AM', duration:120, code:'A2CH22' },
  ]},
  { board:'CCEA', subject:'English Literature', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'AS Unit 1: The Study of Poetry and Drama', date:'2026-05-13', session:'AM', duration:120, code:'A2ET11' },
    { name:'AS Unit 2: The Study of Prose', date:'2026-05-22', session:'AM', duration:90, code:'A2ET12' },
    { name:'A2 Unit 1: The Study of Poetry and Drama', date:'2026-06-01', session:'AM', duration:150, code:'A2ET21' },
    { name:'A2 Unit 2: The Study of Prose', date:'2026-06-10', session:'AM', duration:120, code:'A2ET22' },
  ]},
  { board:'CCEA', subject:'Geography', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'AS Unit 1: Physical Geography', date:'2026-05-12', session:'AM', duration:90, code:'A2GY11' },
    { name:'AS Unit 2: Human Geography', date:'2026-05-21', session:'PM', duration:90, code:'A2GY12' },
    { name:'A2 Unit 1: Physical Processes, Landforms and Management', date:'2026-06-04', session:'AM', duration:120, code:'A2GY21' },
    { name:'A2 Unit 2: Changing Environments', date:'2026-06-11', session:'AM', duration:90, code:'A2GY22' },
  ]},
  { board:'CCEA', subject:'History', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'AS Unit 1: Partition of Ireland 1900–25', date:'2026-05-15', session:'AM', duration:90, code:'A2HY11' },
    { name:'AS Unit 2: Germany 1918–45', date:'2026-05-19', session:'PM', duration:90, code:'A2HY12' },
    { name:'A2 Unit 1: Dictatorship and Democracy in Germany 1933–63', date:'2026-06-02', session:'PM', duration:120, code:'A2HY21' },
    { name:'A2 Unit 2: Ireland and Her Neighbours', date:'2026-06-09', session:'AM', duration:120, code:'A2HY22' },
  ]},
  { board:'CCEA', subject:'Mathematics', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'AS Unit 1: Pure Mathematics with Mechanics', date:'2026-05-14', session:'AM', duration:105, code:'A2MA11' },
    { name:'AS Unit 2: Pure Mathematics with Statistics', date:'2026-05-22', session:'PM', duration:105, code:'A2MA12' },
    { name:'A2 Unit 1: Pure Mathematics', date:'2026-06-03', session:'PM', duration:120, code:'A2MA21' },
    { name:'A2 Unit 2: Pure Mathematics with Mechanics', date:'2026-06-11', session:'PM', duration:120, code:'A2MA22' },
    { name:'A2 Unit 3: Pure Mathematics with Statistics', date:'2026-06-18', session:'PM', duration:120, code:'A2MA23' },
  ]},
  { board:'CCEA', subject:'Physics', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'AS Unit 1: Forces, Energy and Electricity', date:'2026-05-20', session:'PM', duration:90, code:'A2PH11' },
    { name:'AS Unit 2: Waves, Photons and Medical Physics', date:'2026-06-01', session:'AM', duration:90, code:'A2PH12' },
    { name:'A2 Unit 1: Momentum, Thermal Physics, Circular Motion, Oscillations and Atomic Physics', date:'2026-06-08', session:'AM', duration:120, code:'A2PH21' },
    { name:'A2 Unit 2: Fields, Capacitors and Particle Physics', date:'2026-06-15', session:'AM', duration:120, code:'A2PH22' },
  ]},
  { board:'CCEA', subject:'Psychology', qualification:'A-Level', gradingSystem:'ALEVEL', papers:[
    { name:'AS Unit 1: Research Methods in Psychology', date:'2026-05-11', session:'PM', duration:90, code:'A2PS11' },
    { name:'AS Unit 2: Biological Psychology, Learning and Development', date:'2026-05-18', session:'AM', duration:90, code:'A2PS12' },
    { name:'A2 Unit 1: Social Cognition, Prejudice and Stress', date:'2026-06-01', session:'PM', duration:120, code:'A2PS21' },
    { name:'A2 Unit 2: Schizophrenia, Autism and Criminology', date:'2026-06-09', session:'AM', duration:120, code:'A2PS22' },
  ]},

]

// ─────────────────────────────────────────────────────────────────────────────
// PAPER STRUCTURES - maxMarks and grade boundaries
// Boundaries sourced from published 2024 results (most recent available)
// 2026 boundaries will be published after results day (20 August 2026 for GCSE)
// ─────────────────────────────────────────────────────────────────────────────
export const PAPER_STRUCTURES = {
  "AQA-Mathematics-GCSE-H": {
    "maxMarks": "240",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "219",
      "7": "163",
      "5": "95",
      "4": "61",
      "1": "13"
    }
  },
  "AQA-Mathematics-GCSE-F": {
    "maxMarks": "240",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "\u2013",
      "7": "\u2013",
      "5": "186",
      "4": "157",
      "1": "37"
    }
  },
  "AQA-English Language-GCSE": {
    "maxMarks": "160",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "121",
      "7": "102",
      "5": "82",
      "4": "73",
      "1": "16"
    }
  },
  "AQA-English Literature-GCSE": {
    "maxMarks": "160",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "137",
      "7": "106",
      "5": "74",
      "4": "58",
      "1": "12"
    }
  },
  "AQA-Biology-GCSE-H": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "141",
      "7": "112",
      "5": "69",
      "4": "48",
      "1": "\u2013"
    }
  },
  "AQA-Biology-GCSE-F": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "\u2013",
      "7": "\u2013",
      "5": "132",
      "4": "113",
      "1": "22"
    }
  },
  "AQA-Chemistry-GCSE-H": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "149",
      "7": "112",
      "5": "68",
      "4": "46",
      "1": "\u2013"
    }
  },
  "AQA-Chemistry-GCSE-F": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "\u2013",
      "7": "\u2013",
      "5": "133",
      "4": "112",
      "1": "24"
    }
  },
  "AQA-Physics-GCSE-H": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "151",
      "7": "122",
      "5": "85",
      "4": "67",
      "1": "\u2013"
    }
  },
  "AQA-Physics-GCSE-F": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "\u2013",
      "7": "\u2013",
      "5": "136",
      "4": "122",
      "1": "24"
    }
  },
  "AQA-Geography-GCSE": {
    "maxMarks": "252",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "202",
      "7": "162",
      "5": "123",
      "4": "104",
      "1": "20"
    }
  },
  "AQA-History (Av. option)-GCSE": {
    "maxMarks": "168",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "117",
      "7": "91",
      "5": "68",
      "4": "57",
      "1": "8"
    }
  },
  "AQA-Computer Science-GCSE": {
    "maxMarks": "180",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "152",
      "7": "128",
      "5": "88",
      "4": "68",
      "1": "14"
    }
  },
  "AQA-Business-GCSE": {
    "maxMarks": "180",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "135",
      "7": "117",
      "5": "92",
      "4": "80",
      "1": "14"
    }
  },
  "AQA-Drama-GCSE": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "165",
      "7": "142",
      "5": "110",
      "4": "94",
      "1": "23"
    }
  },
  "AQA-Dance-GCSE": {
    "maxMarks": "400",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "330",
      "7": "280",
      "5": "188",
      "4": "144",
      "1": "56"
    }
  },
  "AQA-Design & Technology-GCSE": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "174",
      "7": "145",
      "5": "111",
      "4": "94",
      "1": "21"
    }
  },
  "AQA-Economics-GCSE": {
    "maxMarks": "160",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "130",
      "7": "115",
      "5": "89",
      "4": "77",
      "1": "20"
    }
  },
  "AQA-Engineering-GCSE": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "175",
      "7": "151",
      "5": "120",
      "4": "105",
      "1": "22"
    }
  },
  "AQA-Food Prep & Nutrition-GCSE": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "174",
      "7": "146",
      "5": "112",
      "4": "96",
      "1": "21"
    }
  },
  "AQA-Media Studies-GCSE": {
    "maxMarks": "240",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "189",
      "7": "162",
      "5": "123",
      "4": "104",
      "1": "21"
    }
  },
  "AQA-Music-GCSE": {
    "maxMarks": "240",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "197",
      "7": "171",
      "5": "140",
      "4": "125",
      "1": "45"
    }
  },
  "AQA-Physical Education-GCSE": {
    "maxMarks": "260",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "206",
      "7": "178",
      "5": "143",
      "4": "126",
      "1": "34"
    }
  },
  "AQA-Psychology-GCSE": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "158",
      "7": "130",
      "5": "92",
      "4": "74",
      "1": "11"
    }
  },
  "AQA-Religious Studies A-GCSE": {
    "maxMarks": "204",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "177",
      "7": "153",
      "5": "123",
      "4": "109",
      "1": "22"
    }
  },
  "AQA-Sociology-GCSE": {
    "maxMarks": "160",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "124",
      "7": "92",
      "5": "61",
      "4": "46",
      "1": "7"
    }
  },
  "AQA-Citizenship Studies-GCSE": {
    "maxMarks": "160",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "135",
      "7": "114",
      "5": "84",
      "4": "69",
      "1": "14"
    }
  },
  "AQA-French-GCSE-H": {
    "maxMarks": "240",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "195",
      "7": "150",
      "5": "121",
      "4": "107",
      "1": "\u2013"
    }
  },
  "AQA-French-GCSE-F": {
    "maxMarks": "240",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "\u2013",
      "7": "\u2013",
      "5": "159",
      "4": "142",
      "1": "24"
    }
  },
  "AQA-German-GCSE-H": {
    "maxMarks": "240",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "202",
      "7": "159",
      "5": "122",
      "4": "104",
      "1": "\u2013"
    }
  },
  "AQA-German-GCSE-F": {
    "maxMarks": "240",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "\u2013",
      "7": "\u2013",
      "5": "175",
      "4": "155",
      "1": "24"
    }
  },
  "AQA-Bengali-GCSE-H": {
    "maxMarks": "240",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "206",
      "7": "154",
      "5": "102",
      "4": "76",
      "1": "\u2013"
    }
  },
  "AQA-Accounting-A-Level-240": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "61",
      "A": "166",
      "B": "144",
      "C": "52",
      "E": "177"
    }
  },
  "AQA-Biology-A-Level-260": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "53",
      "A": "173",
      "B": "142",
      "C": "37",
      "E": "180"
    }
  },
  "AQA-Business-A-Level-300": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "83",
      "A": "215",
      "B": "189",
      "C": "64",
      "E": "217"
    }
  },
  "AQA-Chemistry-A-Level-300": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "65",
      "A": "237",
      "B": "196",
      "C": "47",
      "E": "250"
    }
  },
  "AQA-Computer Science-A-Level-375": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "74",
      "A": "278",
      "B": "223",
      "C": "50",
      "E": "296"
    }
  },
  "AQA-D&T: Product Design-A-Level-400": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "123",
      "A": "291",
      "B": "258",
      "C": "92",
      "E": "304"
    }
  },
  "AQA-D&T: Fashion & Text.-A-Level-400": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "120",
      "A": "299",
      "B": "262",
      "C": "105",
      "E": "309"
    }
  },
  "AQA-Dance-A-Level-200": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "68",
      "A": "141",
      "B": "127",
      "C": "61",
      "E": "150"
    }
  },
  "AQA-Drama & Theatre-A-Level-200": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "70",
      "A": "151",
      "B": "135",
      "C": "61",
      "E": "166"
    }
  },
  "AQA-Economics-A-Level-240": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "69",
      "A": "175",
      "B": "151",
      "C": "50",
      "E": "182"
    }
  },
  "AQA-English Language-A-Level-500": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "163",
      "A": "412",
      "B": "372",
      "C": "149",
      "E": "430"
    }
  },
  "AQA-English Lang & Lit-A-Level-250": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "80",
      "A": "196",
      "B": "176",
      "C": "63",
      "E": "207"
    }
  },
  "AQA-English Lit A-A-Level-375": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "109",
      "A": "299",
      "B": "257",
      "C": "96",
      "E": "312"
    }
  },
  "AQA-English Lit B-A-Level-375": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "109",
      "A": "292",
      "B": "254",
      "C": "101",
      "E": "312"
    }
  },
  "AQA-Environmental Sci.-A-Level-240": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "62",
      "A": "164",
      "B": "146",
      "C": "45",
      "E": "181"
    }
  },
  "AQA-French-A-Level-400": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "146",
      "A": "336",
      "B": "294",
      "C": "115",
      "E": "359"
    }
  },
  "AQA-Further Mathematics-A-Level-300": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "46",
      "A": "181",
      "B": "145",
      "C": "32",
      "E": "216"
    }
  },
  "AQA-Geography-A-Level-300": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "86",
      "A": "227",
      "B": "198",
      "C": "70",
      "E": "239"
    }
  },
  "AQA-German-A-Level-400": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "99",
      "A": "329",
      "B": "263",
      "C": "81",
      "E": "351"
    }
  },
  "AQA-History-A-Level-200": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "47",
      "A": "147",
      "B": "125",
      "C": "42",
      "E": "163"
    }
  },
  "AQA-Law-A-Level-300": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "218"
    }
  },
  "AQA-Mathematics-A-Level-300": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "248"
    }
  },
  "AQA-Media Studies-A-Level-240": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "204"
    }
  },
  "AQA-Music-A-Level-300": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "243"
    }
  },
  "AQA-Philosophy-A-Level-200": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "157"
    }
  },
  "AQA-Physical Education-A-Level-300": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "199"
    }
  },
  "AQA-Physics-A-Level-250": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "164"
    }
  },
  "AQA-Politics-A-Level-231": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "176"
    }
  },
  "AQA-Psychology-A-Level-288": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "219"
    }
  },
  "AQA-Religious Studies-A-Level-200": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "167"
    }
  },
  "AQA-Sociology-A-Level-240": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "185"
    }
  },
  "AQA-Spanish-A-Level-400": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "347"
    }
  }
}
  "AQA-Mathematics-GCSE-F": {
    "maxMarks": "240",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "\u2013",
      "7": "\u2013",
      "5": "186",
      "4": "157",
      "1": "37"
    }
  },
  "AQA-English Language-GCSE": {
    "maxMarks": "160",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "121",
      "7": "102",
      "5": "82",
      "4": "73",
      "1": "16"
    }
  },
  "AQA-English Literature-GCSE": {
    "maxMarks": "160",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "137",
      "7": "106",
      "5": "74",
      "4": "58",
      "1": "12"
    }
  },
  "AQA-Biology-GCSE-H": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "141",
      "7": "112",
      "5": "69",
      "4": "48",
      "1": "\u2013"
    }
  },
  "AQA-Biology-GCSE-F": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "\u2013",
      "7": "\u2013",
      "5": "132",
      "4": "113",
      "1": "22"
    }
  },
  "AQA-Chemistry-GCSE-H": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "149",
      "7": "112",
      "5": "68",
      "4": "46",
      "1": "\u2013"
    }
  },
  "AQA-Chemistry-GCSE-F": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "\u2013",
      "7": "\u2013",
      "5": "133",
      "4": "112",
      "1": "24"
    }
  },
  "AQA-Physics-GCSE-H": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "151",
      "7": "122",
      "5": "85",
      "4": "67",
      "1": "\u2013"
    }
  },
  "AQA-Physics-GCSE-F": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "\u2013",
      "7": "\u2013",
      "5": "136",
      "4": "122",
      "1": "24"
    }
  },
  "AQA-Geography-GCSE": {
    "maxMarks": "252",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "202",
      "7": "162",
      "5": "123",
      "4": "104",
      "1": "20"
    }
  },
  "AQA-History (Av. option)-GCSE": {
    "maxMarks": "168",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "117",
      "7": "91",
      "5": "68",
      "4": "57",
      "1": "8"
    }
  },
  "AQA-Computer Science-GCSE": {
    "maxMarks": "180",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "152",
      "7": "128",
      "5": "88",
      "4": "68",
      "1": "14"
    }
  },
  "AQA-Business-GCSE": {
    "maxMarks": "180",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "135",
      "7": "117",
      "5": "92",
      "4": "80",
      "1": "14"
    }
  },
  "AQA-Drama-GCSE": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "165",
      "7": "142",
      "5": "110",
      "4": "94",
      "1": "23"
    }
  },
  "AQA-Dance-GCSE": {
    "maxMarks": "400",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "330",
      "7": "280",
      "5": "188",
      "4": "144",
      "1": "56"
    }
  },
  "AQA-Design & Technology-GCSE": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "174",
      "7": "145",
      "5": "111",
      "4": "94",
      "1": "21"
    }
  },
  "AQA-Economics-GCSE": {
    "maxMarks": "160",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "130",
      "7": "115",
      "5": "89",
      "4": "77",
      "1": "20"
    }
  },
  "AQA-Engineering-GCSE": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "175",
      "7": "151",
      "5": "120",
      "4": "105",
      "1": "22"
    }
  },
  "AQA-Food Prep & Nutrition-GCSE": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "174",
      "7": "146",
      "5": "112",
      "4": "96",
      "1": "21"
    }
  },
  "AQA-Media Studies-GCSE": {
    "maxMarks": "240",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "189",
      "7": "162",
      "5": "123",
      "4": "104",
      "1": "21"
    }
  },
  "AQA-Music-GCSE": {
    "maxMarks": "240",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "197",
      "7": "171",
      "5": "140",
      "4": "125",
      "1": "45"
    }
  },
  "AQA-Physical Education-GCSE": {
    "maxMarks": "260",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "206",
      "7": "178",
      "5": "143",
      "4": "126",
      "1": "34"
    }
  },
  "AQA-Psychology-GCSE": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "158",
      "7": "130",
      "5": "92",
      "4": "74",
      "1": "11"
    }
  },
  "AQA-Religious Studies A-GCSE": {
    "maxMarks": "204",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "177",
      "7": "153",
      "5": "123",
      "4": "109",
      "1": "22"
    }
  },
  "AQA-Sociology-GCSE": {
    "maxMarks": "160",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "124",
      "7": "92",
      "5": "61",
      "4": "46",
      "1": "7"
    }
  },
  "AQA-Citizenship Studies-GCSE": {
    "maxMarks": "160",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "135",
      "7": "114",
      "5": "84",
      "4": "69",
      "1": "14"
    }
  },
  "AQA-French-GCSE-H": {
    "maxMarks": "240",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "195",
      "7": "150",
      "5": "121",
      "4": "107",
      "1": "\u2013"
    }
  },
  "AQA-French-GCSE-F": {
    "maxMarks": "240",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "\u2013",
      "7": "\u2013",
      "5": "159",
      "4": "142",
      "1": "24"
    }
  },
  "AQA-German-GCSE-H": {
    "maxMarks": "240",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "202",
      "7": "159",
      "5": "122",
      "4": "104",
      "1": "\u2013"
    }
  },
  "AQA-German-GCSE-F": {
    "maxMarks": "240",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "\u2013",
      "7": "\u2013",
      "5": "175",
      "4": "155",
      "1": "24"
    }
  },
  "AQA-Bengali-GCSE-H": {
    "maxMarks": "240",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": {
      "9": "206",
      "7": "154",
      "5": "102",
      "4": "76",
      "1": "\u2013"
    }
  },
  "AQA-Accounting-A-Level-240": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "61",
      "A": "166",
      "B": "144",
      "C": "52",
      "E": "177"
    }
  },
  "AQA-Biology-A-Level-260": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "53",
      "A": "173",
      "B": "142",
      "C": "37",
      "E": "180"
    }
  },
  "AQA-Business-A-Level-300": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "83",
      "A": "215",
      "B": "189",
      "C": "64",
      "E": "217"
    }
  },
  "AQA-Chemistry-A-Level-300": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "65",
      "A": "237",
      "B": "196",
      "C": "47",
      "E": "250"
    }
  },
  "AQA-Computer Science-A-Level-375": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "74",
      "A": "278",
      "B": "223",
      "C": "50",
      "E": "296"
    }
  },
  "AQA-D&T: Product Design-A-Level-400": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "123",
      "A": "291",
      "B": "258",
      "C": "92",
      "E": "304"
    }
  },
  "AQA-D&T: Fashion & Text.-A-Level-400": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "120",
      "A": "299",
      "B": "262",
      "C": "105",
      "E": "309"
    }
  },
  "AQA-Dance-A-Level-200": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "68",
      "A": "141",
      "B": "127",
      "C": "61",
      "E": "150"
    }
  },
  "AQA-Drama & Theatre-A-Level-200": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "70",
      "A": "151",
      "B": "135",
      "C": "61",
      "E": "166"
    }
  },
  "AQA-Economics-A-Level-240": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "69",
      "A": "175",
      "B": "151",
      "C": "50",
      "E": "182"
    }
  },
  "AQA-English Language-A-Level-500": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "163",
      "A": "412",
      "B": "372",
      "C": "149",
      "E": "430"
    }
  },
  "AQA-English Lang & Lit-A-Level-250": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "80",
      "A": "196",
      "B": "176",
      "C": "63",
      "E": "207"
    }
  },
  "AQA-English Lit A-A-Level-375": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "109",
      "A": "299",
      "B": "257",
      "C": "96",
      "E": "312"
    }
  },
  "AQA-English Lit B-A-Level-375": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "109",
      "A": "292",
      "B": "254",
      "C": "101",
      "E": "312"
    }
  },
  "AQA-Environmental Sci.-A-Level-240": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "62",
      "A": "164",
      "B": "146",
      "C": "45",
      "E": "181"
    }
  },
  "AQA-French-A-Level-400": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "146",
      "A": "336",
      "B": "294",
      "C": "115",
      "E": "359"
    }
  },
  "AQA-Further Mathematics-A-Level-300": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "46",
      "A": "181",
      "B": "145",
      "C": "32",
      "E": "216"
    }
  },
  "AQA-Geography-A-Level-300": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "86",
      "A": "227",
      "B": "198",
      "C": "70",
      "E": "239"
    }
  },
  "AQA-German-A-Level-400": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "99",
      "A": "329",
      "B": "263",
      "C": "81",
      "E": "351"
    }
  },
  "AQA-History-A-Level-200": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "47",
      "A": "147",
      "B": "125",
      "C": "42",
      "E": "163"
    }
  },
  "AQA-Law-A-Level-300": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "218"
    }
  },
  "AQA-Mathematics-A-Level-300": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "248"
    }
  },
  "AQA-Media Studies-A-Level-240": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "204"
    }
  },
  "AQA-Music-A-Level-300": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "243"
    }
  },
  "AQA-Philosophy-A-Level-200": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "157"
    }
  },
  "AQA-Physical Education-A-Level-300": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "199"
    }
  },
  "AQA-Physics-A-Level-250": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "164"
    }
  },
  "AQA-Politics-A-Level-231": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "176"
    }
  },
  "AQA-Psychology-A-Level-288": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "219"
    }
  },
  "AQA-Religious Studies-A-Level-200": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "167"
    }
  },
  "AQA-Sociology-A-Level-240": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "185"
    }
  },
  "AQA-Spanish-A-Level-400": {
    "maxMarks": "\u2013",
    "gradingSystem": "ALEVEL",
    "boundaries2024": {
      "A*": "\u2013",
      "A": "\u2013",
      "B": "\u2013",
      "C": "\u2013",
      "E": "347"
    }
  }
}
    note: 'Per paper (Paper 1, 2 or 3). Total subject max = 240.',
  },
  'AQA-Mathematics-GCSE-Foundation': {
    maxMarks: 80,
    gradingSystem: 'GCSE_STANDARD',
    boundaries2024: { 5:54, 4:42, 3:28, 2:17, 1:8 },
    boundaries2023: { 5:52, 4:40, 3:26, 2:15, 1:8 },
    note: 'Per paper. Foundation tier grades 1-5 only.',
  },

  // AQA GCSE Biology Higher (105 min, 100 marks per paper)
  'AQA-Biology-GCSE-Higher': {
    maxMarks: 100,
    gradingSystem: 'GCSE_STANDARD',
    boundaries2024: { 9:71, 8:63, 7:56, 6:48, 5:40, 4:28, 3:20, 2:12, 1:6 },
    boundaries2023: { 9:72, 8:64, 7:57, 6:49, 5:40, 4:28, 3:20, 2:12, 1:6 },
    note: 'Per paper (Paper 1 or 2). Total subject max = 200.',
  },

  // AQA GCSE Chemistry Higher
  'AQA-Chemistry-GCSE-Higher': {
    maxMarks: 100,
    gradingSystem: 'GCSE_STANDARD',
    boundaries2024: { 9:75, 8:65, 7:56, 6:47, 5:37, 4:26, 3:18, 2:11, 1:5 },
    boundaries2023: { 9:73, 8:63, 7:54, 6:45, 5:35, 4:25, 3:17, 2:10, 1:5 },
    note: 'Per paper. Total subject max = 200.',
  },

  // AQA GCSE Physics Higher
  'AQA-Physics-GCSE-Higher': {
    maxMarks: 100,
    gradingSystem: 'GCSE_STANDARD',
    boundaries2024: { 9:76, 8:68, 7:61, 6:52, 5:43, 4:31, 3:22, 2:13, 1:6 },
    boundaries2023: { 9:75, 8:67, 7:60, 6:51, 5:42, 4:30, 3:21, 2:13, 1:6 },
    note: 'Per paper. Total subject max = 200.',
  },

  // AQA Combined Science Trilogy Higher (75 marks per paper)
  'AQA-Combined Science: Trilogy-GCSE-Higher': {
    maxMarks: 75,
    gradingSystem: 'GCSE_COMBINED',
    boundaries2024: { '9-9':282, '8-8':252, '7-7':222, '6-6':185, '5-5':147, '4-4':110 },
    note: 'Total subject max = 450 (6 papers × 75). Double grade awarded.',
  },

  // AQA English Language
  'AQA-English Language-GCSE': {
    maxMarks: 80,
    gradingSystem: 'GCSE_STANDARD',
    boundaries2024: { 9:61, 8:56, 7:51, 6:46, 5:40, 4:32, 3:23, 2:15, 1:8 },
    boundaries2023: { 9:60, 8:55, 7:50, 6:45, 5:39, 4:31, 3:22, 2:14, 1:7 },
    note: 'Per paper (Paper 1 or 2). Total subject max = 160.',
  },

  // AQA English Literature
  'AQA-English Literature-GCSE': {
    maxMarks: 80,
    gradingSystem: 'GCSE_STANDARD',
    boundaries2024: { 9:69, 8:61, 7:52, 6:44, 5:35, 4:26, 3:17, 2:10, 1:5 },
    note: 'Paper 1 = 80 marks (1hr45m), Paper 2 = 80 marks (2hr15m). Total = 160.',
  },

  // AQA Geography GCSE
  'AQA-Geography-GCSE': {
    maxMarks: 88,
    gradingSystem: 'GCSE_STANDARD',
    boundaries2024: { 9:74, 8:66, 7:58, 6:49, 5:40, 4:30, 3:20, 2:12, 1:6 },
    note: 'Paper 1 = 88 marks, Paper 2 = 88 marks, Paper 3 = 76 marks.',
  },

  // OCR Computer Science J277 (80 marks per paper)
  'OCR-Computer Science-GCSE': {
    maxMarks: 80,
    gradingSystem: 'GCSE_STANDARD',
    boundaries2024: { 9:68, 8:63, 7:59, 6:51, 5:44, 4:36, 3:26, 2:16, 1:7 },
    boundaries2023: { 9:68, 8:63, 7:56, 6:48, 5:40, 4:33, 3:23, 2:14, 1:7 },
    note: 'Per paper. Total subject max = 160 (2 papers × 80).',
  },

  // AQA Computer Science GCSE (different from OCR)
  'AQA-Computer Science-GCSE': {
    maxMarks: 90,
    gradingSystem: 'GCSE_STANDARD',
    boundaries2024: { 9:77, 8:68, 7:60, 6:51, 5:42, 4:33, 3:23, 2:14, 1:7 },
    note: 'Paper 1 = 90 marks (2hr30m), Paper 2 = 90 marks (1hr45m).',
  },

  // AQA Further Mathematics GCSE Level 2 (105 marks per paper)
  'AQA-Further Mathematics-GCSE': {
    maxMarks: 105,
    gradingSystem: 'GCSE_STANDARD',
    boundaries2024: { 9:77, 8:64, 7:52, 6:40, 5:29, 4:19 },
    note: 'Level 2 qualification. Grades 4-9 only.',
  },

  // AQA A-Level Mathematics (100 marks per paper)
  'AQA-Mathematics-A-Level': {
    maxMarks: 100,
    gradingSystem: 'ALEVEL',
    boundaries2024: { 'A*':78, A:66, B:56, C:46, D:36, E:26 },
    note: 'Per paper. 3 papers each 2 hours, 100 marks. Total = 300.',
  },

  // AQA A-Level Biology (91 marks per paper avg)
  'AQA-Biology-A-Level': {
    maxMarks: 91,
    gradingSystem: 'ALEVEL',
    boundaries2024: { 'A*':68, A:58, B:50, C:42, D:34, E:26 },
    note: 'Papers 1 & 2 = 91 marks each, Paper 3 = 78 marks. Total = 260.',
  },

  // AQA A-Level Chemistry (105 marks per paper)
  'AQA-Chemistry-A-Level': {
    maxMarks: 105,
    gradingSystem: 'ALEVEL',
    boundaries2024: { 'A*':82, A:70, B:60, C:50, D:40, E:30 },
    note: 'Papers 1 & 2 = 105 marks, Paper 3 = 90 marks. Total = 300.',
  },

  // AQA A-Level Physics (85 marks per paper avg)
  'AQA-Physics-A-Level': {
    maxMarks: 85,
    gradingSystem: 'ALEVEL',
    boundaries2024: { 'A*':64, A:54, B:45, C:37, D:29, E:21 },
    note: 'Papers 1 & 2 = 85 marks, Paper 3 = 80 marks. Total = 250.',
  },

  // AQA A-Level Psychology
  'AQA-Psychology-A-Level': {
    maxMarks: 96,
    gradingSystem: 'ALEVEL',
    boundaries2024: { 'A*':76, A:65, B:55, C:46, D:37, E:28 },
    note: 'Per paper. 3 papers × 96 marks = 288 total.',
  },
  // ─────────────────────────────────────────────────────────────────────────
  // OCR GCSE Paper Structures - boundaries sourced from OCR published 2024 results
  // ─────────────────────────────────────────────────────────────────────────

  "OCR-Mathematics-GCSE-H": {
    "maxMarks": "300",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "231", "7": "175", "5": "109", "4": "73", "1": "16" }
  },
  "OCR-Mathematics-GCSE-F": {
    "maxMarks": "300",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "5": "204", "4": "163", "3": "118", "2": "74", "1": "30" }
  },
  "OCR-English Language-GCSE": {
    "maxMarks": "120",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "99", "7": "80", "5": "61", "4": "52", "1": "13" }
  },
  "OCR-English Literature-GCSE": {
    "maxMarks": "120",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "102", "7": "81", "5": "59", "4": "46", "1": "12" }
  },
  "OCR-Biology A-GCSE-H": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "162", "7": "128", "5": "80", "4": "56", "1": "~12" }
  },
  "OCR-Biology B-GCSE-H": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "158", "7": "124", "5": "78", "4": "55", "1": "~12" }
  },
  "OCR-Chemistry A-GCSE-H": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "164", "7": "130", "5": "82", "4": "58", "1": "~13" }
  },
  "OCR-Chemistry B-GCSE-H": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "162", "7": "128", "5": "80", "4": "57", "1": "~12" }
  },
  "OCR-Physics A-GCSE-H": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "160", "7": "126", "5": "79", "4": "56", "1": "~12" }
  },
  "OCR-Physics B-GCSE-H": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "158", "7": "124", "5": "77", "4": "55", "1": "~12" }
  },
  "OCR-Combined Science A-GCSE": {
    "maxMarks": "420",
    "gradingSystem": "GCSE_COMBINED",
    "boundaries2024": { "9-9": "355", "8-8": "310", "7-7": "267", "6-6": "220", "5-5": "176", "4-4": "133" }
  },
  "OCR-Combined Science B-GCSE": {
    "maxMarks": "420",
    "gradingSystem": "GCSE_COMBINED",
    "boundaries2024": { "9-9": "348", "8-8": "304", "7-7": "261", "6-6": "216", "5-5": "173", "4-4": "131" }
  },
  "OCR-Computer Science-GCSE": {
    "maxMarks": "160",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "136", "8": "126", "7": "117", "6": "102", "5": "87", "4": "72", "3": "52", "2": "32", "1": "13" }
  },
  "OCR-History A-GCSE": {
    "maxMarks": "270",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "~215", "7": "~169", "5": "~116", "4": "~81", "1": "~19" }
  },
  "OCR-Geography A-GCSE": {
    "maxMarks": "150",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "~124", "7": "~100", "5": "~72", "4": "~56", "1": "~14" }
  },
  "OCR-Religious Studies-GCSE": {
    "maxMarks": "180",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "~152", "7": "~119", "5": "~82", "4": "~62", "1": "~14" }
  },
  "OCR-Business-GCSE": {
    "maxMarks": "120",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "~100", "7": "~79", "5": "~55", "4": "~41", "1": "~10" }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // OCR A-Level Paper Structures - boundaries from OCR published 2024 results
  // ─────────────────────────────────────────────────────────────────────────

  "OCR-Biology A-A-Level": {
    "maxMarks": "270",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~219", "A": "~188", "B": "~158", "C": "~129", "D": "~101", "E": "~73" }
  },
  "OCR-Chemistry A-A-Level": {
    "maxMarks": "270",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~224", "A": "~194", "B": "~162", "C": "~130", "D": "~99", "E": "~68" }
  },
  "OCR-Physics A-A-Level": {
    "maxMarks": "270",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~219", "A": "~188", "B": "~156", "C": "~124", "D": "~93", "E": "~63" }
  },
  "OCR-Mathematics A-A-Level": {
    "maxMarks": "300",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~249", "A": "~213", "B": "~176", "C": "~140", "D": "~104", "E": "~70" }
  },
  "OCR-Computer Science-A-Level": {
    "maxMarks": "300",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~243", "A": "~210", "B": "~174", "C": "~139", "D": "~104", "E": "~70" }
  },
  "OCR-Geography-A-Level": {
    "maxMarks": "200",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~162", "A": "~140", "B": "~117", "C": "~94", "D": "~72", "E": "~50" }
  },
  "OCR-Psychology-A-Level": {
    "maxMarks": "240",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~194", "A": "~167", "B": "~140", "C": "~113", "D": "~87", "E": "~62" }
  },
  "OCR-Religious Studies-A-Level": {
    "maxMarks": "240",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~196", "A": "~168", "B": "~140", "C": "~113", "D": "~87", "E": "~62" }
  },
  "OCR-Sociology-A-Level": {
    "maxMarks": "270",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~218", "A": "~188", "B": "~157", "C": "~126", "D": "~96", "E": "~67" }
  },
  "OCR-Law-A-Level": {
    "maxMarks": "240",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~196", "A": "~167", "B": "~138", "C": "~110", "D": "~83", "E": "~57" }
  },
  "OCR-Business-A-Level": {
    "maxMarks": "240",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~194", "A": "~166", "B": "~138", "C": "~111", "D": "~85", "E": "~60" }
  },
  "OCR-Economics-A-Level": {
    "maxMarks": "240",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~196", "A": "~169", "B": "~141", "C": "~113", "D": "~86", "E": "~60" }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Edexcel/Pearson GCSE Paper Structures
  // ─────────────────────────────────────────────────────────────────────────

  "Edexcel-Mathematics-GCSE-H": {
    "maxMarks": "240",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "~196", "7": "~158", "5": "~103", "4": "~68", "1": "~16" }
  },
  "Edexcel-Mathematics-GCSE-F": {
    "maxMarks": "240",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "5": "~180", "4": "~148", "3": "~108", "2": "~68", "1": "~28" }
  },
  "Edexcel-English Language-GCSE": {
    "maxMarks": "120",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "~98", "7": "~78", "5": "~59", "4": "~50", "1": "~12" }
  },
  "Edexcel-English Literature-GCSE": {
    "maxMarks": "120",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "~104", "7": "~83", "5": "~60", "4": "~48", "1": "~12" }
  },
  "Edexcel-Biology-GCSE-H": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "~152", "7": "~120", "5": "~76", "4": "~54", "1": "~12" }
  },
  "Edexcel-Chemistry-GCSE-H": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "~156", "7": "~124", "5": "~79", "4": "~56", "1": "~13" }
  },
  "Edexcel-Physics-GCSE-H": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "~154", "7": "~121", "5": "~77", "4": "~55", "1": "~12" }
  },
  "Edexcel-Combined Science-GCSE": {
    "maxMarks": "360",
    "gradingSystem": "GCSE_COMBINED",
    "boundaries2024": { "9-9": "~298", "8-8": "~256", "7-7": "~216", "6-6": "~174", "5-5": "~136", "4-4": "~99" }
  },
  "Edexcel-Computer Science-GCSE": {
    "maxMarks": "160",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "~136", "7": "~108", "5": "~77", "4": "~59", "1": "~14" }
  },
  "Edexcel-History-GCSE": {
    "maxMarks": "168",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "~139", "7": "~111", "5": "~79", "4": "~61", "1": "~15" }
  },
  "Edexcel-Geography-GCSE": {
    "maxMarks": "180",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "~150", "7": "~119", "5": "~84", "4": "~64", "1": "~16" }
  },
  "Edexcel-Business Studies-GCSE": {
    "maxMarks": "100",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "~84", "7": "~67", "5": "~47", "4": "~36", "1": "~9" }
  },
  "Edexcel-Religious Studies-GCSE": {
    "maxMarks": "200",
    "gradingSystem": "GCSE_STANDARD",
    "boundaries2024": { "9": "~166", "7": "~130", "5": "~90", "4": "~68", "1": "~17" }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Edexcel A-Level Paper Structures
  // ─────────────────────────────────────────────────────────────────────────

  "Edexcel-Mathematics-A-Level": {
    "maxMarks": "300",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~248", "A": "~213", "B": "~177", "C": "~142", "D": "~107", "E": "~73" }
  },
  "Edexcel-Further Mathematics-A-Level": {
    "maxMarks": "300",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~252", "A": "~216", "B": "~178", "C": "~141", "D": "~104", "E": "~68" }
  },
  "Edexcel-Biology-A-Level": {
    "maxMarks": "270",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~219", "A": "~189", "B": "~159", "C": "~130", "D": "~101", "E": "~73" }
  },
  "Edexcel-Chemistry-A-Level": {
    "maxMarks": "270",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~225", "A": "~196", "B": "~165", "C": "~134", "D": "~103", "E": "~73" }
  },
  "Edexcel-Physics-A-Level": {
    "maxMarks": "270",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~222", "A": "~193", "B": "~162", "C": "~131", "D": "~100", "E": "~70" }
  },
  "Edexcel-History-A-Level": {
    "maxMarks": "240",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~196", "A": "~168", "B": "~140", "C": "~112", "D": "~86", "E": "~61" }
  },
  "Edexcel-Geography-A-Level": {
    "maxMarks": "225",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~183", "A": "~157", "B": "~131", "C": "~105", "D": "~80", "E": "~56" }
  },
  "Edexcel-Economics A-A-Level": {
    "maxMarks": "240",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~196", "A": "~169", "B": "~140", "C": "~112", "D": "~85", "E": "~59" }
  },
  "Edexcel-Business-A-Level": {
    "maxMarks": "300",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~244", "A": "~210", "B": "~175", "C": "~141", "D": "~107", "E": "~74" }
  },
  "Edexcel-Psychology-A-Level": {
    "maxMarks": "270",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~220", "A": "~190", "B": "~159", "C": "~128", "D": "~98", "E": "~69" }
  },
  "Edexcel-Sociology-A-Level": {
    "maxMarks": "270",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~218", "A": "~187", "B": "~156", "C": "~125", "D": "~95", "E": "~66" }
  },
  "Edexcel-Computer Science-A-Level": {
    "maxMarks": "270",
    "gradingSystem": "ALEVEL",
    "boundaries2024": { "A*": "~219", "A": "~187", "B": "~155", "C": "~124", "D": "~94", "E": "~65" }
  },


}

// ─────────────────────────────────────────────────────────────────────────────
// SPECIFICATION TOPICS
// Sourced from official published specifications (links to spec doc noted)
// ─────────────────────────────────────────────────────────────────────────────
export const SPEC_TOPICS = {
  "AQA-Mathematics-Paper 1: Non-Calculator": [
    "Number",
    "Algebra",
    "Ratio, proportion & rates of change",
    "Geometry & measures",
    "Statistics & probability"
  ],
  "AQA-Mathematics-Papers 2 & 3: Calculator": [
    "All topics as Paper 1",
    "More complex calculations, multi-step problems",
    "Financial maths (compound interest, reverse percentage)"
  ],
  "AQA-English Language-Paper 1: Creative Reading & Writing": [
    "Reading: 20th/21st century fiction",
    "Inference",
    "Language analysis",
    "Structure analysis",
    "Evaluation",
    "Writing: descriptive or narrative"
  ],
  "AQA-English Language-Paper 2: Writers' Viewpoints & Perspectives": [
    "Reading: 19th century non-fiction + modern non-fiction",
    "Comparison",
    "Writing: viewpoint or perspective text"
  ],
  "AQA-English Literature-Paper 1: Shakespeare & 19th-Century Novel": [
    "Shakespeare play (set text \u2013 choice from: Macbeth, Romeo & Juliet, The Merchant of Venice, etc.)",
    "19th-century novel"
  ],
  "AQA-English Literature-Paper 2: Modern Texts, Poetry & Unseen Poetry": [
    "Modern prose or drama",
    "Power & Conflict or Love & Relationships anthology poetry",
    "Unseen poetry"
  ],
  "AQA-Biology-Paper 1": [
    "Cell biology",
    "Organisation",
    "Infection & response",
    "Bioenergetics"
  ],
  "AQA-Biology-Paper 2": [
    "Homeostasis & response",
    "Inheritance, variation & evolution",
    "Ecology"
  ],
  "AQA-Chemistry-Paper 1": [
    "Atomic structure & periodic table",
    "Bonding",
    "Quantitative chemistry",
    "Chemical changes",
    "Energy changes"
  ],
  "AQA-Chemistry-Paper 2": [
    "Rate & extent of reactions",
    "Organic chemistry",
    "Chemical analysis",
    "Chemistry of the atmosphere",
    "Using resources"
  ],
  "AQA-Physics-Paper 1": [
    "Energy",
    "Electricity",
    "Particle model of matter",
    "Atomic structure"
  ],
  "AQA-Physics-Paper 2": [
    "Forces",
    "Waves",
    "Magnetism & electromagnetism",
    "Space physics (higher tier)"
  ],
  "AQA-Geography-Paper 1: Living with the Physical Environment": [
    "Natural hazards",
    "Living world (ecosystems, tropical rainforests, hot deserts)",
    "Physical landscapes in the UK (rivers, coasts)"
  ],
  "AQA-Geography-Paper 2: Challenges in the Human Environment": [
    "Urban issues & challenges",
    "Changing economic world",
    "Resource management",
    "Food/water/energy"
  ],
  "AQA-Geography-Paper 3: Geographical Applications": [
    "Issue evaluation",
    "Fieldwork (two investigations)",
    "Geographical skills"
  ],
  "AQA-History-Paper 1: Understanding the Modern World": [
    "Section A: Period study (America, Germany, Russia, or America 1920\u201373)",
    "Section B: Wider world conflict topic"
  ],
  "AQA-History-Paper 2: Shaping the Nation": [
    "Section A: Thematic study (Health, Power, Migration)",
    "Section B: British depth study (Norman England, Elizabethan, etc.)"
  ],
  "AQA-Economics-Paper 1: How Markets Work": [
    "Economic foundations",
    "Resource allocation",
    "Price mechanism",
    "Competition",
    "Market failure",
    "Role of government"
  ],
  "AQA-Economics-Paper 2: How the Economy Works": [
    "National economic performance",
    "Government objectives",
    "Fiscal/monetary policy",
    "International trade",
    "Globalisation",
    "Inequality"
  ],
  "AQA-Business-Paper 1: Influences of Operations & HRM": [
    "Business activity",
    "Business ownership",
    "Stakeholders",
    "Business location",
    "Business planning",
    "Operations",
    "HRM"
  ],
  "AQA-Business-Paper 2: Influences of Marketing & Finance": [
    "Marketing",
    "Market research",
    "Marketing mix (4Ps)",
    "Finance",
    "Sources of finance",
    "Financial planning",
    "External influences"
  ],
  "AQA-Computer Science-Paper 1: Computational Thinking & Programming": [
    "Problem solving",
    "Programming fundamentals",
    "OOP",
    "Data structures",
    "Algorithms",
    "Big O",
    "Theory of computation"
  ],
  "AQA-Computer Science-Paper 2: Computing Concepts": [
    "Hardware",
    "Software",
    "Binary & data representation",
    "Networks",
    "Cybersecurity",
    "Databases",
    "Ethical, legal & cultural issues"
  ],
  "AQA-Psychology-Paper 1: Cognition & Behaviour": [
    "Memory",
    "Perception",
    "Development (Piaget)",
    "Research methods"
  ],
  "AQA-Psychology-Paper 2: Social Context & Behaviour": [
    "Social influence",
    "Language, thought & communication",
    "Brain & neuropsychology",
    "Psychological problems"
  ],
  "AQA-Sociology-Paper 1: Families & Education": [
    "What is sociology?",
    "The family (types, roles, diversity, changing patterns)",
    "Education (role, sociological perspectives)"
  ],
  "AQA-Sociology-Paper 2: Crime & Deviance & Social Stratification": [
    "Crime & deviance",
    "Social stratification (class, gender, ethnicity, power)"
  ],
  "AQA-Religious Studies A-Paper 1: Study of Religions": [
    "Two religions studied in depth: Christian/Catholic/Islamic/Hindu/Jewish/Sikh/Buddhist beliefs, practices, sources of wisdom"
  ],
  "AQA-Religious Studies A-Paper 2: Thematic Studies": [
    "Themes: Religion & relationships",
    "Religion & life",
    "Religion, peace & conflict",
    "Religion, crime & punishment",
    "Religion, human rights & social justice"
  ],
  "AQA-Citizenship Studies-Paper 1": [
    "Living together in the UK",
    "Democracy, government & participation",
    "Rights & responsibilities"
  ],
  "AQA-Citizenship Studies-Paper 2": [
    "Active citizenship",
    "Bilateral & international relations",
    "Media & digital citizenship"
  ],
  "AQA-Drama-Written Paper: Understanding Drama": [
    "Set text analysis",
    "Theatre vocabulary",
    "Live theatre evaluation"
  ],
  "AQA-Music-Written Paper: Understanding Music": [
    "Listening to and appraising music",
    "Four areas of study (compulsory): Western Classical Tradition, Popular Music, Traditional Music, Western Classical Tradition since 1910"
  ],
  "AQA-Physical Education-Paper 1: Human Body & Movement": [
    "Applied anatomy & physiology",
    "Movement analysis",
    "Physical training"
  ],
  "AQA-Physical Education-Paper 2: Socio-cultural Influences & Wellbeing": [
    "Sports psychology",
    "Socio-cultural influences",
    "Health, fitness & wellbeing",
    "Use of data"
  ],
  "AQA-Food Preparation & Nutrition-Written Paper": [
    "Food commodities",
    "Principles of nutrition",
    "Diet & good health",
    "Functional & chemical properties of food",
    "Cooking",
    "Food provenance",
    "Food science"
  ],
  "AQA-Media Studies-Paper 1: Media Products, Industries & Audiences": [
    "Media language (codes & conventions)",
    "Media representations",
    "News",
    "Advertising",
    "Music video",
    "Magazines",
    "Print"
  ],
  "AQA-Media Studies-Paper 2: Understanding Media Forms & Products": [
    "Television",
    "Film",
    "Radio",
    "Video games",
    "Online/social media",
    "Set products",
    "NEA"
  ],
  "AQA-Design & Technology-Written Paper": [
    "Core technical principles",
    "Specialist technical principles",
    "Designing & making principles"
  ],
  "AQA-French-Listening & Reading": [
    "Themes: Identity & culture",
    "Local/national/international/global areas of interest",
    "Current/future study, employment & ambitions",
    "Grammar"
  ],
  "AQA-French-Writing & Speaking": [
    "Translation",
    "Free writing",
    "Role-play",
    "Photo card",
    "Conversation"
  ],
  "AQA-German-Listening & Reading": [
    "Themes: Identity & culture",
    "Local/national/international/global",
    "Current/future study & employment",
    "Grammar"
  ],
  "AQA-Spanish-Listening & Reading": [
    "Themes: Identity & culture",
    "Local/national/international/global",
    "Study, employment & future plans",
    "Grammar"
  ],
  "AQA-Biology-Paper 1: Biological Molecules, Cells & Organisms": [
    "Biological molecules",
    "Cells",
    "Organisms exchange substances",
    "Genetic information & variation"
  ],
  "AQA-Biology-Paper 2: Energy Transfers & Responses": [
    "Energy transfers in/between organisms",
    "Organisms respond to changes",
    "Genetics, populations, evolution, ecosystems"
  ],
  "AQA-Biology-Paper 3: Practical Skills & Synoptic": [
    "Practical skills",
    "Any topics from Papers 1 & 2 synoptically",
    "Extended essay-style questions"
  ],
  "AQA-Chemistry-Paper 1: Inorganic & Physical Chemistry": [
    "Atomic structure",
    "Amount of substance",
    "Bonding",
    "Energetics",
    "Kinetics",
    "Chemical equilibria",
    "Oxidation/reduction",
    "Group 2, Group 7",
    "Period 3 elements",
    "Transition metals"
  ],
  "AQA-Chemistry-Paper 2: Organic & Physical Chemistry": [
    "Organic nomenclature & isomerism",
    "Alkanes",
    "Halogenoalkanes",
    "Alkenes",
    "Alcohols",
    "Organic analysis",
    "Acids/pH",
    "Rate equations",
    "Equilibrium constant Kp",
    "Electrode potentials",
    "Acids & bases",
    "NMR",
    "Chromatography"
  ],
  "AQA-Chemistry-Paper 3: Practical Skills & Synoptic": [
    "Practical skills including apparatus, techniques, error analysis",
    "Data analysis",
    "Synoptic questions across all topics"
  ],
  "AQA-Physics-Paper 1: Measurements & Fundamental Physics": [
    "Measurements & errors",
    "Particles & radiation",
    "Waves",
    "Mechanics & materials",
    "Electricity"
  ],
  "AQA-Physics-Paper 2: Advanced Physics": [
    "Further mechanics",
    "Thermal physics",
    "Fields",
    "Nuclear physics"
  ],
  "AQA-Physics-Paper 3: Practical Skills + Option Topic": [
    "Practical skills & data analysis",
    "One option from: Astrophysics / Medical / Engineering / Turning Points / Electronics"
  ],
  "AQA-Mathematics-Paper 1: Pure Mathematics 1": [
    "Algebra & functions",
    "Coordinate geometry",
    "Sequences & series",
    "Trigonometry",
    "Exponentials & logarithms",
    "Differentiation",
    "Integration",
    "Proof"
  ],
  "AQA-Mathematics-Paper 2: Pure Mathematics 2 + Statistics or Mechanics": [
    "Further Pure (all topics)",
    "Statistics: probability, distributions, hypothesis testing OR Mechanics: kinematics, forces, moments"
  ],
  "AQA-Mathematics-Paper 3: Pure Mathematics 3 + Statistics or Mechanics": [
    "Further pure topics",
    "Further Statistics or Mechanics (complementary to Paper 2)"
  ],
  "AQA-Further Mathematics-Paper 1: Compulsory Core Pure": [
    "Proof",
    "Complex numbers",
    "Matrices",
    "Further algebra",
    "Further calculus",
    "Further vectors",
    "Polar coordinates",
    "Hyperbolic functions",
    "Differential equations"
  ],
  "AQA-Further Mathematics-Paper 2 & 3: Optional Routes": [
    "Choose two options from: Further Statistics / Further Mechanics / Discrete Mathematics"
  ],
  "AQA-Economics-Paper 1: Markets and Market Failure": [
    "Economic methodology",
    "Demand & supply",
    "Price determination",
    "Elasticity",
    "Market failure",
    "Government intervention",
    "Competitive markets",
    "Productive & allocative efficiency"
  ],
  "AQA-Economics-Paper 2: National and International Economy": [
    "Macroeconomic objectives",
    "Aggregate demand/supply",
    "Fiscal/monetary policy",
    "Supply-side policies",
    "Trade",
    "International competitiveness",
    "Globalisation",
    "Poverty & inequality"
  ],
  "AQA-Economics-Paper 3: Economic Principles & Issues": [
    "Synoptic application of micro and macro economics",
    "Case study",
    "Essay questions drawing on both papers"
  ],
  "AQA-Psychology-Paper 1: Introductory Topics in Psychology": [
    "Social influence",
    "Memory",
    "Attachment",
    "Psychopathology (approaches to mental health)"
  ],
  "AQA-Psychology-Paper 2: Psychology in Context": [
    "Approaches in psychology",
    "Biopsychology",
    "Research methods"
  ],
  "AQA-Psychology-Paper 3: Issues and Options in Psychology": [
    "Issues & debates",
    "Gender",
    "Cognition & development",
    "Schizophrenia",
    "Eating behaviour",
    "Stress",
    "Aggression",
    "Relationships",
    "Forensic",
    "Addiction"
  ],
  "AQA-Sociology-Paper 1: Education + Theory & Methods 1": [
    "Education (role, differential achievement, sociological theories)",
    "Sociological theory (Functionalism, Marxism, Feminism, Social action)",
    "Research methods"
  ],
  "AQA-Sociology-Paper 2: Topics in Sociology": [
    "Choose two options from: Families & Households",
    "Health",
    "Work, Poverty & Welfare",
    "Beliefs in Society",
    "Global Development",
    "The Media",
    "Stratification & Differentiation"
  ],
  "AQA-Sociology-Paper 3: Crime & Deviance + Theory & Methods 2": [
    "Crime & deviance",
    "Social control",
    "Research methods in context",
    "Sociological theory & methods"
  ],
  "AQA-History-Paper 1: Breadth Study (2.5h)": [
    "Chosen breadth topic spanning ~100 years \u2013 options include: Tudors, Stuarts, British Empire, Germany, USA, Russia, China etc."
  ],
  "AQA-History-Paper 2: Depth Study (2.5h)": [
    "Chosen depth topic ~30 years \u2013 options include: Reformation, Revolution, WW1/WW2 themes, Cold War etc."
  ],
  "AQA-History-Coursework/NEA: Historical Investigation": [
    "Independent study on a historical question",
    "~3,500\u20134,500 words",
    "requires primary source analysis"
  ],
  "AQA-Geography-Paper 1: Physical Geography": [
    "Water & Carbon Cycles",
    "Hot desert systems",
    "Coastal systems & landscapes",
    "Glacial systems",
    "Hazards",
    "Ecosystems under stress"
  ],
  "AQA-Geography-Paper 2: Human Geography": [
    "Global systems & governance",
    "Changing places",
    "Contemporary urban environments",
    "Population & the environment",
    "Resource security",
    "Migration, identity & sovereignty"
  ],
  "AQA-Geography-Coursework/NEA: Fieldwork Investigation": [
    "Original fieldwork investigation",
    "Primary data collection",
    "~3,000\u20134,000 words",
    "statistical/graphical analysis"
  ],
  "AQA-Politics-Paper 1: UK Politics & Core Political Ideas": [
    "Democracy & participation",
    "Electoral systems",
    "Voting behaviour",
    "Political parties",
    "Pressure groups",
    "Core political ideologies (Conservatism, Liberalism, Socialism)"
  ],
  "AQA-Politics-Paper 2: UK Government & Political Ideas": [
    "The Constitution",
    "Parliament",
    "PM & Executive",
    "Judiciary",
    "Devolution",
    "Non-core ideologies (Feminism, Nationalism, Multiculturalism, Ecologism, Anarchism)"
  ],
  "AQA-Politics-Paper 3: Comparative Politics": [
    "Options: USA or Global Politics",
    "US politics (Congress, presidency, civil rights, electoral process) OR Global (global governance, security, development, environment)"
  ],
  "AQA-English Language-Paper 1: Language, the Individual and Society": [
    "Textual variations & representations",
    "Children's language acquisition",
    "Language & social groups (gender, age, region, occupation)"
  ],
  "AQA-English Language-Paper 2: Language Diversity and Change": [
    "Language change (historical, contemporary)",
    "Language discourses (debates, attitudes)",
    "Language investigation"
  ],
  "AQA-English Literature A-Paper 1: Love Through the Ages": [
    "Shakespeare",
    "Wider reading pre/post-1900 poetry",
    "Comparative study of love across time periods"
  ],
  "AQA-English Literature A-Paper 2: Texts in Shared Contexts": [
    "Option A: World War One and its aftermath OR Option B: Modern Times: Literature 1945\u2013present",
    "Two set texts in context"
  ],
  "AQA-Business-Paper 1: Business 1": [
    "What is business?",
    "Managers, leadership & decision making",
    "Decision making for business: HRM, HRM in practice"
  ],
  "AQA-Business-Paper 2: Business 2": [
    "Decision making for business: Marketing",
    "Marketing decisions",
    "Operations decision making",
    "Financial decision making"
  ],
  "AQA-Business-Paper 3: Business 3 (Synoptic)": [
    "Strategic decision making: Case study/pre-release material",
    "Evaluate & apply all topics synoptically"
  ],
  "AQA-Accounting-Paper 1: Financial Accounting": [
    "Business entity concept",
    "Income statements",
    "Statement of financial position",
    "Ratios",
    "Partnerships",
    "Limited companies",
    "Incomplete records"
  ],
  "AQA-Accounting-Paper 2: Accounting for Analysis & Decision-Making": [
    "Budgets",
    "Standard costing",
    "Investment appraisal",
    "Break-even",
    "Marginal costing",
    "Manufacturing accounts"
  ],
  "AQA-Law-Paper 1: The Legal System & Criminal Law": [
    "Nature of law",
    "English legal system",
    "Criminal law: actus reus, mens rea",
    "Offences against the person",
    "Defences",
    "Preliminary offences"
  ],
  "AQA-Law-Paper 2: Law Making & The Law of Tort": [
    "Law-making (Parliamentary & judicial)",
    "Human rights",
    "Negligence",
    "Occupiers' liability",
    "Nuisance",
    "Rylands v Fletcher",
    "Vicarious liability"
  ],
  "AQA-Law-Paper 3: Further Law (Option)": [
    "Option A: Contract law (formation, terms, vitiating factors, discharge, remedies) OR Option B: Human Rights Law"
  ],
  "AQA-Religious Studies-Paper 1: Philosophy of Religion": [
    "Ancient philosophical influences",
    "Soul, mind & body",
    "Arguments for God's existence",
    "Religious experience",
    "Problem of evil",
    "Religious language"
  ],
  "AQA-Religious Studies-Paper 2: Religion & Ethics": [
    "Ethical theories",
    "Free will & moral responsibility",
    "Conscience",
    "Sexual ethics",
    "Applied ethics",
    "Metaethics"
  ],
  "AQA-Religious Studies-Paper 3: Study of Religion / Dialogues": [
    "Option: study of one religion (Christianity, Islam, Judaism, etc.) OR dialogues between religion and science/gender/secularism"
  ],
  "AQA-Media Studies-Paper 2: Media Forms & Products in Depth": [
    "Television",
    "Film",
    "Radio",
    "Online/social media",
    "Video games",
    "Long-form TV drama"
  ],
  "AQA-Computer Science-Paper 2: Computer Science Concepts": [
    "Fundamentals of data representation",
    "Hardware",
    "Software",
    "Internet",
    "Databases",
    "Big Data",
    "Functional programming",
    "Legal & ethical issues"
  ],
  "AQA-French-Paper 1: Listening, Reading & Writing": [
    "Aspects of French-speaking society",
    "Artistic culture",
    "Grammar",
    "Translation (French to English)"
  ],
  "AQA-French-Paper 2: Writing": [
    "Essay on set literary/film texts",
    "Independent research project (IRP)",
    "Translation (English to French)"
  ],
  "AQA-German-Paper 1: Listening, Reading & Writing": [
    "Aspects of German-speaking society",
    "Artistic culture",
    "Grammar",
    "Translation (German to English)"
  ],
  "AQA-German-Paper 2: Writing": [
    "Essay on set literary/film texts",
    "IRP",
    "Translation (English to German)"
  ],
  "AQA-Spanish-Paper 1: Listening, Reading & Writing": [
    "Aspects of Spanish-speaking society",
    "Artistic culture",
    "Grammar",
    "Translation"
  ],
  "AQA-Spanish-Paper 2: Writing": [
    "Essay on set texts/film",
    "IRP",
    "Translation"
  ],
  "AQA-Drama and Theatre-Written Paper": [
    "Live theatre analysis",
    "Set text (closed book)",
    "Practitioner knowledge (e.g. Stanislavski, Brecht, Artaud)"
  ],
  "AQA-Music-Listening/Composition/Performance": [
    "Appraising music (set works: Bach, Beethoven, Berlioz, Brahms, Debussy, Janacek, Musorgsky, Poulenc, Shostakovich, Weir)",
    "Composition",
    "Performance"
  ],
  "AQA-Physical Education-Paper 1": [
    "Applied anatomy & physiology",
    "Exercise physiology",
    "Biomechanics",
    "Sport psychology",
    "Technology in sport"
  ],
  "AQA-Physical Education-Paper 2": [
    "Socio-cultural influences",
    "Sport & society",
    "Historical & cultural issues",
    "Ethics",
    "Sports development"
  ],
  "AQA-Environmental Science-Paper 1": [
    "Physical systems",
    "Ecosystems & ecology",
    "Energy resources",
    "Water resources",
    "Pollution",
    "Climate change"
  ],
  "AQA-Environmental Science-Paper 2": [
    "Global change",
    "Biodiversity",
    "Soil",
    "Food supply",
    "Sustainability",
    "Environmental management"
  ]
}
  "AQA-English Language-GCSE": {
    "Paper 1: Creative Reading & Writing": [
      "Reading: 20th/21st century fiction",
      "Inference",
      "Language analysis",
      "Structure analysis",
      "Evaluation",
      "Writing: descriptive or narrative"
    ],
    "Paper 2: Writers' Viewpoints & Perspectives": [
      "Reading: 19th century non-fiction + modern non-fiction",
      "Comparison",
      "Writing: viewpoint or perspective text"
    ]
  },
  "AQA-English Literature-GCSE": {
    "Paper 1: Shakespeare & 19th-Century Novel": [
      "Shakespeare play (set text \u2013 choice from: Macbeth, Romeo & Juliet, The Merchant of Venice, etc.)",
      "19th-century novel"
    ],
    "Paper 2: Modern Texts, Poetry & Unseen Poetry": [
      "Modern prose or drama",
      "Power & Conflict or Love & Relationships anthology poetry",
      "Unseen poetry"
    ]
  },
  "AQA-Biology-GCSE": {
    "Paper 1": [
      "Cell biology",
      "Organisation",
      "Infection & response",
      "Bioenergetics"
    ],
    "Paper 2": [
      "Homeostasis & response",
      "Inheritance, variation & evolution",
      "Ecology"
    ]
  },
  "AQA-Chemistry-GCSE": {
    "Paper 1": [
      "Atomic structure & periodic table",
      "Bonding",
      "Quantitative chemistry",
      "Chemical changes",
      "Energy changes"
    ],
    "Paper 2": [
      "Rate & extent of reactions",
      "Organic chemistry",
      "Chemical analysis",
      "Chemistry of the atmosphere",
      "Using resources"
    ]
  },
  "AQA-Physics-GCSE": {
    "Paper 1": [
      "Energy",
      "Electricity",
      "Particle model of matter",
      "Atomic structure"
    ],
    "Paper 2": [
      "Forces",
      "Waves",
      "Magnetism & electromagnetism",
      "Space physics (higher tier)"
    ]
  },
  "AQA-Geography-GCSE": {
    "Paper 1: Living with the Physical Environment": [
      "Natural hazards",
      "Living world (ecosystems, tropical rainforests, hot deserts)",
      "Physical landscapes in the UK (rivers, coasts)"
    ],
    "Paper 2: Challenges in the Human Environment": [
      "Urban issues & challenges",
      "Changing economic world",
      "Resource management",
      "Food/water/energy"
    ],
    "Paper 3: Geographical Applications": [
      "Issue evaluation",
      "Fieldwork (two investigations)",
      "Geographical skills"
    ]
  },
  "AQA-History-GCSE": {
    "Paper 1: Understanding the Modern World": [
      "Section A: Period study (America, Germany, Russia, or America 1920\u201373)",
      "Section B: Wider world conflict topic"
    ],
    "Paper 2: Shaping the Nation": [
      "Section A: Thematic study (Health, Power, Migration)",
      "Section B: British depth study (Norman England, Elizabethan, etc.)"
    ]
  },
  "AQA-Economics-GCSE": {
    "Paper 1: How Markets Work": [
      "Economic foundations",
      "Resource allocation",
      "Price mechanism",
      "Competition",
      "Market failure",
      "Role of government"
    ],
    "Paper 2: How the Economy Works": [
      "National economic performance",
      "Government objectives",
      "Fiscal/monetary policy",
      "International trade",
      "Globalisation",
      "Inequality"
    ]
  },
  "AQA-Business-GCSE": {
    "Paper 1: Influences of Operations & HRM": [
      "Business activity",
      "Business ownership",
      "Stakeholders",
      "Business location",
      "Business planning",
      "Operations",
      "HRM"
    ],
    "Paper 2: Influences of Marketing & Finance": [
      "Marketing",
      "Market research",
      "Marketing mix (4Ps)",
      "Finance",
      "Sources of finance",
      "Financial planning",
      "External influences"
    ]
  },
  "AQA-Computer Science-GCSE": {
    "Paper 1: Computational Thinking & Programming": [
      "Algorithms",
      "Programming fundamentals",
      "Data structures",
      "Boolean logic",
      "Theory of computation",
      "Problems & solutions"
    ],
    "Paper 2: Computing Concepts": [
      "Hardware",
      "Software",
      "Binary & data representation",
      "Networks",
      "Cybersecurity",
      "Databases",
      "Ethical, legal & cultural issues"
    ]
  },
  "AQA-Psychology-GCSE": {
    "Paper 1: Cognition & Behaviour": [
      "Memory",
      "Perception",
      "Development (Piaget)",
      "Research methods"
    ],
    "Paper 2: Social Context & Behaviour": [
      "Social influence",
      "Language, thought & communication",
      "Brain & neuropsychology",
      "Psychological problems"
    ]
  },
  "AQA-Sociology-GCSE": {
    "Paper 1: Families & Education": [
      "What is sociology?",
      "The family (types, roles, diversity, changing patterns)",
      "Education (role, sociological perspectives)"
    ],
    "Paper 2: Crime & Deviance & Social Stratification": [
      "Crime & deviance",
      "Social stratification (class, gender, ethnicity, power)"
    ]
  },
  "AQA-Religious Studies A-GCSE": {
    "Paper 1: Study of Religions": [
      "Two religions studied in depth: Christian/Catholic/Islamic/Hindu/Jewish/Sikh/Buddhist beliefs, practices, sources of wisdom"
    ],
    "Paper 2: Thematic Studies": [
      "Themes: Religion & relationships",
      "Religion & life",
      "Religion, peace & conflict",
      "Religion, crime & punishment",
      "Religion, human rights & social justice"
    ]
  },
  "AQA-Citizenship Studies-GCSE": {
    "Paper 1": [
      "Living together in the UK",
      "Democracy, government & participation",
      "Rights & responsibilities"
    ],
    "Paper 2": [
      "Active citizenship",
      "Bilateral & international relations",
      "Media & digital citizenship"
    ]
  },
  "AQA-Drama-GCSE": {
    "Written Paper: Understanding Drama": [
      "Set text analysis",
      "Theatre vocabulary",
      "Live theatre evaluation"
    ]
  },
  "AQA-Music-GCSE": {
    "Written Paper: Understanding Music": [
      "Listening to and appraising music",
      "Four areas of study (compulsory): Western Classical Tradition, Popular Music, Traditional Music, Western Classical Tradition since 1910"
    ]
  },
  "AQA-Physical Education-GCSE": {
    "Paper 1: Human Body & Movement": [
      "Applied anatomy & physiology",
      "Movement analysis",
      "Physical training"
    ],
    "Paper 2: Socio-cultural Influences & Wellbeing": [
      "Sports psychology",
      "Socio-cultural influences",
      "Health, fitness & wellbeing",
      "Use of data"
    ]
  },
  "AQA-Food Preparation & Nutrition-GCSE": {
    "Written Paper": [
      "Food commodities",
      "Principles of nutrition",
      "Diet & good health",
      "Functional & chemical properties of food",
      "Cooking",
      "Food provenance",
      "Food science"
    ]
  },
  "AQA-Media Studies-GCSE": {
    "Paper 1: Media Products, Industries & Audiences": [
      "Media language",
      "Representation",
      "Media industries",
      "Audiences",
      "Set products: newspapers, advertising, music video, online"
    ],
    "Paper 2: Understanding Media Forms & Products": [
      "Television",
      "Film",
      "Radio",
      "Video games",
      "Online/social media",
      "Set products",
      "NEA"
    ]
  },
  "AQA-Design & Technology-GCSE": {
    "Written Paper": [
      "Core technical principles",
      "Specialist technical principles",
      "Designing & making principles"
    ]
  },
  "AQA-French-GCSE": {
    "Listening & Reading": [
      "Themes: Identity & culture",
      "Local/national/international/global areas of interest",
      "Current/future study, employment & ambitions",
      "Grammar"
    ],
    "Writing & Speaking": [
      "Translation",
      "Free writing",
      "Role-play",
      "Photo card",
      "Conversation"
    ]
  },
  "AQA-German-GCSE": {
    "Listening & Reading": [
      "Themes: Identity & culture",
      "Local/national/international/global",
      "Current/future study & employment",
      "Grammar"
    ]
  },
  "AQA-Spanish-GCSE": {
    "Listening & Reading": [
      "Themes: Identity & culture",
      "Local/national/international/global",
      "Study, employment & future plans",
      "Grammar"
    ]
  },
  "Edexcel-Subject-A-Level": {
    "Paper/Component": [
      "Key Topic Areas"
    ]
  },
  "AQA-Biology-A-Level": {
    "Paper 1: Biological Molecules, Cells & Organisms": [
      "Biological molecules",
      "Cells",
      "Organisms exchange substances",
      "Genetic information & variation"
    ],
    "Paper 2: Energy Transfers & Responses": [
      "Energy transfers in/between organisms",
      "Organisms respond to changes",
      "Genetics, populations, evolution, ecosystems"
    ],
    "Paper 3: Practical Skills & Synoptic": [
      "Practical skills",
      "Any topics from Papers 1 & 2 synoptically",
      "Extended essay-style questions"
    ]
  },
  "AQA-Chemistry-A-Level": {
    "Paper 1: Inorganic & Physical Chemistry": [
      "Atomic structure",
      "Amount of substance",
      "Bonding",
      "Energetics",
      "Kinetics",
      "Chemical equilibria",
      "Oxidation/reduction",
      "Group 2, Group 7",
      "Period 3 elements",
      "Transition metals"
    ],
    "Paper 2: Organic & Physical Chemistry": [
      "Organic nomenclature & isomerism",
      "Alkanes",
      "Halogenoalkanes",
      "Alkenes",
      "Alcohols",
      "Organic analysis",
      "Acids/pH",
      "Rate equations",
      "Equilibrium constant Kp",
      "Electrode potentials",
      "Acids & bases",
      "NMR",
      "Chromatography"
    ],
    "Paper 3: Practical Skills & Synoptic": [
      "Practical skills including apparatus, techniques, error analysis",
      "Data analysis",
      "Synoptic questions across all topics"
    ]
  },
  "AQA-Physics-A-Level": {
    "Paper 1: Measurements & Fundamental Physics": [
      "Measurements & errors",
      "Particles & radiation",
      "Waves",
      "Mechanics & materials",
      "Electricity"
    ],
    "Paper 2: Advanced Physics": [
      "Further mechanics",
      "Thermal physics",
      "Fields",
      "Nuclear physics"
    ],
    "Paper 3: Practical Skills + Option Topic": [
      "Practical skills & data analysis",
      "One option from: Astrophysics / Medical / Engineering / Turning Points / Electronics"
    ]
  },
  "AQA-Mathematics-A-Level": {
    "Paper 1: Pure Mathematics 1": [
      "Algebra & functions",
      "Coordinate geometry",
      "Sequences & series",
      "Trigonometry",
      "Exponentials & logarithms",
      "Differentiation",
      "Integration",
      "Proof"
    ],
    "Paper 2: Pure Mathematics 2 + Statistics or Mechanics": [
      "Further Pure (all topics)",
      "Statistics: probability, distributions, hypothesis testing OR Mechanics: kinematics, forces, moments"
    ],
    "Paper 3: Pure Mathematics 3 + Statistics or Mechanics": [
      "Further pure topics",
      "Further Statistics or Mechanics (complementary to Paper 2)"
    ]
  },
  "AQA-Further Mathematics-A-Level": {
    "Paper 1: Compulsory Core Pure": [
      "Proof",
      "Complex numbers",
      "Matrices",
      "Further algebra",
      "Further calculus",
      "Further vectors",
      "Polar coordinates",
      "Hyperbolic functions",
      "Differential equations"
    ],
    "Paper 2 & 3: Optional Routes": [
      "Choose two options from: Further Statistics / Further Mechanics / Discrete Mathematics"
    ]
  },
  "AQA-Economics-A-Level": {
    "Paper 1: Markets and Market Failure": [
      "Economic methodology",
      "Demand & supply",
      "Price determination",
      "Elasticity",
      "Market failure",
      "Government intervention",
      "Competitive markets",
      "Productive & allocative efficiency"
    ],
    "Paper 2: National and International Economy": [
      "Macroeconomic objectives",
      "Aggregate demand/supply",
      "Fiscal/monetary policy",
      "Supply-side policies",
      "Trade",
      "International competitiveness",
      "Globalisation",
      "Poverty & inequality"
    ],
    "Paper 3: Economic Principles & Issues": [
      "Synoptic application of micro and macro economics",
      "Case study",
      "Essay questions drawing on both papers"
    ]
  },
  "AQA-Psychology-A-Level": {
    "Paper 1: Introductory Topics in Psychology": [
      "Social influence",
      "Memory",
      "Attachment",
      "Psychopathology (approaches to mental health)"
    ],
    "Paper 2: Psychology in Context": [
      "Approaches in psychology",
      "Biopsychology",
      "Research methods"
    ],
    "Paper 3: Issues and Options in Psychology": [
      "Issues & debates",
      "Gender",
      "Cognition & development",
      "Schizophrenia",
      "Eating behaviour",
      "Stress",
      "Aggression",
      "Relationships",
      "Forensic",
      "Addiction"
    ]
  },
  "AQA-Sociology-A-Level": {
    "Paper 1: Education + Theory & Methods 1": [
      "Education (role, differential achievement, sociological theories)",
      "Sociological theory (Functionalism, Marxism, Feminism, Social action)",
      "Research methods"
    ],
    "Paper 2: Topics in Sociology": [
      "Choose two options from: Families & Households",
      "Health",
      "Work, Poverty & Welfare",
      "Beliefs in Society",
      "Global Development",
      "The Media",
      "Stratification & Differentiation"
    ],
    "Paper 3: Crime & Deviance + Theory & Methods 2": [
      "Crime & deviance",
      "Social control",
      "Research methods in context",
      "Sociological theory & methods"
    ]
  },
  "AQA-History-A-Level": {
    "Paper 1: Breadth Study (2.5h)": [
      "Chosen breadth topic spanning ~100 years \u2013 options include: Tudors, Stuarts, British Empire, Germany, USA, Russia, China etc."
    ],
    "Paper 2: Depth Study (2.5h)": [
      "Chosen depth topic ~30 years \u2013 options include: Reformation, Revolution, WW1/WW2 themes, Cold War etc."
    ],
    "Coursework/NEA: Historical Investigation": [
      "Independent study on a historical question",
      "~3,500\u20134,500 words",
      "requires primary source analysis"
    ]
  },
  "AQA-Geography-A-Level": {
    "Paper 1: Physical Geography": [
      "Water & Carbon Cycles",
      "Hot desert systems",
      "Coastal systems & landscapes",
      "Glacial systems",
      "Hazards",
      "Ecosystems under stress"
    ],
    "Paper 2: Human Geography": [
      "Global systems & governance",
      "Changing places",
      "Contemporary urban environments",
      "Population & the environment",
      "Resource security",
      "Migration, identity & sovereignty"
    ],
    "Coursework/NEA: Fieldwork Investigation": [
      "Original fieldwork investigation",
      "Primary data collection",
      "~3,000\u20134,000 words",
      "statistical/graphical analysis"
    ]
  },
  "AQA-Politics-A-Level": {
    "Paper 1: UK Politics & Core Political Ideas": [
      "Democracy & participation",
      "Electoral systems",
      "Voting behaviour",
      "Political parties",
      "Pressure groups",
      "Core political ideologies (Conservatism, Liberalism, Socialism)"
    ],
    "Paper 2: UK Government & Political Ideas": [
      "The Constitution",
      "Parliament",
      "PM & Executive",
      "Judiciary",
      "Devolution",
      "Non-core ideologies (Feminism, Nationalism, Multiculturalism, Ecologism, Anarchism)"
    ],
    "Paper 3: Comparative Politics": [
      "Options: USA or Global Politics",
      "US politics (Congress, presidency, civil rights, electoral process) OR Global (global governance, security, development, environment)"
    ]
  },
  "AQA-English Language-A-Level": {
    "Paper 1: Language, the Individual and Society": [
      "Textual variations & representations",
      "Children's language acquisition",
      "Language & social groups (gender, age, region, occupation)"
    ],
    "Paper 2: Language Diversity and Change": [
      "Language change (historical, contemporary)",
      "Language discourses (debates, attitudes)",
      "Language investigation"
    ]
  },
  "AQA-English Literature A-A-Level": {
    "Paper 1: Love Through the Ages": [
      "Shakespeare",
      "Wider reading pre/post-1900 poetry",
      "Comparative study of love across time periods"
    ],
    "Paper 2: Texts in Shared Contexts": [
      "Option A: World War One and its aftermath OR Option B: Modern Times: Literature 1945\u2013present",
      "Two set texts in context"
    ]
  },
  "AQA-Business-A-Level": {
    "Paper 1: Business 1": [
      "What is business?",
      "Managers, leadership & decision making",
      "Decision making for business: HRM, HRM in practice"
    ],
    "Paper 2: Business 2": [
      "Decision making for business: Marketing",
      "Marketing decisions",
      "Operations decision making",
      "Financial decision making"
    ],
    "Paper 3: Business 3 (Synoptic)": [
      "Strategic decision making: Case study/pre-release material",
      "Evaluate & apply all topics synoptically"
    ]
  },
  "AQA-Accounting-A-Level": {
    "Paper 1: Financial Accounting": [
      "Business entity concept",
      "Income statements",
      "Statement of financial position",
      "Ratios",
      "Partnerships",
      "Limited companies",
      "Incomplete records"
    ],
    "Paper 2: Accounting for Analysis & Decision-Making": [
      "Budgets",
      "Standard costing",
      "Investment appraisal",
      "Break-even",
      "Marginal costing",
      "Manufacturing accounts"
    ]
  },
  "AQA-Law-A-Level": {
    "Paper 1: The Legal System & Criminal Law": [
      "Nature of law",
      "English legal system",
      "Criminal law: actus reus, mens rea",
      "Offences against the person",
      "Defences",
      "Preliminary offences"
    ],
    "Paper 2: Law Making & The Law of Tort": [
      "Law-making (Parliamentary & judicial)",
      "Human rights",
      "Negligence",
      "Occupiers' liability",
      "Nuisance",
      "Rylands v Fletcher",
      "Vicarious liability"
    ],
    "Paper 3: Further Law (Option)": [
      "Option A: Contract law (formation, terms, vitiating factors, discharge, remedies) OR Option B: Human Rights Law"
    ]
  },
  "AQA-Religious Studies-A-Level": {
    "Paper 1: Philosophy of Religion": [
      "Ancient philosophical influences",
      "Soul, mind & body",
      "Arguments for God's existence",
      "Religious experience",
      "Problem of evil",
      "Religious language"
    ],
    "Paper 2: Religion & Ethics": [
      "Ethical theories",
      "Free will & moral responsibility",
      "Conscience",
      "Sexual ethics",
      "Applied ethics",
      "Metaethics"
    ],
    "Paper 3: Study of Religion / Dialogues": [
      "Option: study of one religion (Christianity, Islam, Judaism, etc.) OR dialogues between religion and science/gender/secularism"
    ]
  },
  "AQA-Media Studies-A-Level": {
    "Paper 1: Media Products, Industries & Audiences": [
      "Media language (codes & conventions)",
      "Media representations",
      "News",
      "Advertising",
      "Music video",
      "Magazines",
      "Print"
    ],
    "Paper 2: Media Forms & Products in Depth": [
      "Television",
      "Film",
      "Radio",
      "Online/social media",
      "Video games",
      "Long-form TV drama"
    ]
  },
  "AQA-Computer Science-A-Level": {
    "Paper 1: Computational Thinking & Programming": [
      "Problem solving",
      "Programming fundamentals",
      "OOP",
      "Data structures",
      "Algorithms",
      "Big O",
      "Theory of computation"
    ],
    "Paper 2: Computer Science Concepts": [
      "Fundamentals of data representation",
      "Hardware",
      "Software",
      "Internet",
      "Databases",
      "Big Data",
      "Functional programming",
      "Legal & ethical issues"
    ]
  },
  "AQA-French-A-Level": {
    "Paper 1: Listening, Reading & Writing": [
      "Aspects of French-speaking society",
      "Artistic culture",
      "Grammar",
      "Translation (French to English)"
    ],
    "Paper 2: Writing": [
      "Essay on set literary/film texts",
      "Independent research project (IRP)",
      "Translation (English to French)"
    ]
  },
  "AQA-German-A-Level": {
    "Paper 1: Listening, Reading & Writing": [
      "Aspects of German-speaking society",
      "Artistic culture",
      "Grammar",
      "Translation (German to English)"
    ],
    "Paper 2: Writing": [
      "Essay on set literary/film texts",
      "IRP",
      "Translation (English to German)"
    ]
  },
  "AQA-Spanish-A-Level": {
    "Paper 1: Listening, Reading & Writing": [
      "Aspects of Spanish-speaking society",
      "Artistic culture",
      "Grammar",
      "Translation"
    ],
    "Paper 2: Writing": [
      "Essay on set texts/film",
      "IRP",
      "Translation"
    ]
  },
  "AQA-Drama and Theatre-A-Level": {
    "Written Paper": [
      "Live theatre analysis",
      "Set text (closed book)",
      "Practitioner knowledge (e.g. Stanislavski, Brecht, Artaud)"
    ]
  },
  "AQA-Music-A-Level": {
    "Listening/Composition/Performance": [
      "Appraising music (set works: Bach, Beethoven, Berlioz, Brahms, Debussy, Janacek, Musorgsky, Poulenc, Shostakovich, Weir)",
      "Composition",
      "Performance"
    ]
  },
  "AQA-Physical Education-A-Level": {
    "Paper 1": [
      "Applied anatomy & physiology",
      "Exercise physiology",
      "Biomechanics",
      "Sport psychology",
      "Technology in sport"
    ],
    "Paper 2": [
      "Socio-cultural influences",
      "Sport & society",
      "Historical & cultural issues",
      "Ethics",
      "Sports development"
    ]
  },
  "AQA-Environmental Science-A-Level": {
    "Paper 1": [
      "Physical systems",
      "Ecosystems & ecology",
      "Energy resources",
      "Water resources",
      "Pollution",
      "Climate change"
    ],
    "Paper 2": [
      "Global change",
      "Biodiversity",
      "Soil",
      "Food supply",
      "Sustainability",
      "Environmental management"
    ]
  }

  // ─────────────────────────────────────────────────────────────────────────
  // OCR GCSE SPEC TOPICS - sourced from official OCR specifications
  // ─────────────────────────────────────────────────────────────────────────

  "OCR-Computer Science-GCSE": {
    "Paper 1: Computer Systems (J277/01)": [
      "Systems architecture: CPU, von Neumann, fetch-decode-execute, registers, cache",
      "Memory: RAM, ROM, flash memory, virtual memory",
      "Storage: magnetic, solid-state, optical — capacity, speed, cost, portability",
      "Wired and wireless networks: LAN, WAN, client-server, peer-to-peer",
      "Network topologies, protocols and layers: TCP/IP, HTTP, HTTPS, FTP, DNS, SMTP",
      "Network security: threats, malware, phishing, brute-force, denial of service",
      "System security: firewalls, encryption, access control, authentication",
      "Systems software: operating systems, utility software, translators",
      "Ethical, legal, cultural and environmental impacts of digital technology",
      "Binary: unsigned integers, two's complement, sign and magnitude",
      "Binary arithmetic and shifts",
      "Hexadecimal conversions",
      "Character encoding: ASCII, Unicode",
      "Images: pixels, resolution, colour depth, metadata, vector vs bitmap",
      "Sound: sample rate, bit depth, file size",
      "Compression: lossy, lossless, run-length encoding, Huffman coding"
    ],
    "Paper 2: Computational Thinking, Algorithms and Programming (J277/02)": [
      "Computational thinking: abstraction, decomposition, algorithmic thinking",
      "Algorithms: searching (linear, binary), sorting (bubble, merge, insertion)",
      "Flow charts and pseudocode",
      "Data types: integer, real, Boolean, character, string",
      "Programming constructs: sequence, selection, iteration",
      "String manipulation: concatenation, substrings, length, upper/lower case",
      "Arrays: 1D and 2D, accessing, traversing",
      "File I/O: read, write, open, close",
      "Procedures and functions: parameters, return values, scope",
      "Random number generation",
      "Structured programming, maintainability",
      "Data structures: records, lists, stacks, queues",
      "Boolean logic: AND, OR, NOT, truth tables",
      "Logic gates: AND, OR, NOT, XOR, NAND, NOR",
      "Trace tables and debugging",
      "Validation and verification"
    ]
  },

  "OCR-Biology A-GCSE": {
    "Paper 1 (Foundation / Higher — J247/01 or J247/03)": [
      "Cell structure: animal, plant, bacterial cells; size and scale; microscopy",
      "Cell division: mitosis, meiosis, stem cells",
      "Biological molecules: carbohydrates, lipids, proteins, DNA",
      "Enzymes: lock and key, induced fit, temperature, pH, substrate concentration",
      "Transport in cells: diffusion, osmosis, active transport",
      "Organisation: levels of organisation, specialised cells and tissues",
      "The digestive system: enzymes, absorption",
      "The heart and blood vessels: structure, function, coronary heart disease",
      "Blood components and functions",
      "Breathing system: gas exchange in lungs",
      "Plant organisation: leaves, roots, stems",
      "Photosynthesis: equation, limiting factors, inverse square law",
      "Transpiration: factors affecting, measuring",
      "Communicable diseases: bacteria, viruses, fungi, protists",
      "Immune system: antibodies, vaccination",
      "Antibiotics and drug development"
    ],
    "Paper 2 (Foundation / Higher — J247/02 or J247/04)": [
      "Hormones: endocrine system, insulin and blood glucose, Type 1 and Type 2 diabetes",
      "Nervous system: neurones, reflex arc, brain structure",
      "Homeostasis: thermoregulation, water balance, kidneys",
      "Reproduction: sexual and asexual, fertilisation, gestation",
      "Inheritance: alleles, dominant/recessive, monohybrid crosses, sex determination",
      "Variation: continuous/discontinuous, mutation, natural selection",
      "Evolution: Darwin, evidence, speciation, antibiotic resistance",
      "Ecology: communities, habitats, biotic/abiotic factors",
      "Sampling techniques: quadrats, transects",
      "Food chains and webs, trophic levels, biomass",
      "Carbon cycle, water cycle, nitrogen cycle",
      "Biodiversity: extinction, conservation",
      "Biotic and abiotic factors affecting populations",
      "Human impact on ecosystems: deforestation, global warming, pollution",
      "Practical skills: data collection, graph interpretation, experimental design"
    ]
  },

  "OCR-Chemistry A-GCSE": {
    "Paper 1 (Foundation / Higher — J248/01 or J248/03)": [
      "Atomic structure: protons, neutrons, electrons, atomic number, mass number",
      "Periodic table: groups, periods, properties of elements",
      "Electronic configuration: shells, dot-and-cross diagrams",
      "Ionic bonding: formation, properties of ionic compounds",
      "Covalent bonding: simple molecular, giant covalent structures",
      "Metallic bonding and properties of metals",
      "Structure and bonding: giant ionic, giant covalent, metallic, simple molecular",
      "The mole: relative formula mass, molar mass, Avogadro constant",
      "Empirical and molecular formulae",
      "Concentration and solution calculations",
      "Acids and bases: pH scale, neutralisation, indicators",
      "Reactions of acids: metals, carbonates, bases",
      "Electrolysis: ionic compounds, aqueous solutions, half equations",
      "Chemical analysis: flame tests, gas tests, precipitation",
      "Rates of reaction: collision theory, temperature, concentration, catalysts, surface area"
    ],
    "Paper 2 (Foundation / Higher — J248/02 or J248/04)": [
      "Energy in reactions: exothermic, endothermic, bond energies, Hess's law (H)",
      "Reversible reactions and equilibrium: Le Chatelier's principle (H)",
      "Organic chemistry: alkanes, alkenes, alcohols, carboxylic acids",
      "Crude oil: fractional distillation, cracking",
      "Addition polymerisation, condensation polymerisation",
      "The atmosphere: evolution, composition, greenhouse gases",
      "Climate change and pollution",
      "The Earth's resources: finite and renewable, life cycle assessment",
      "Water purification: filtration, chlorination",
      "Extraction of metals: carbon reduction, electrolysis",
      "Alloys: steel, brass, bronze",
      "Ceramic materials, polymers, composites",
      "Chromatography: Rf values, paper and thin-layer",
      "Titration calculations",
      "Practical skills and required practicals"
    ]
  },

  "OCR-Physics A-GCSE": {
    "Paper 1 (Foundation / Higher — J249/01 or J249/03)": [
      "Energy stores and transfers: kinetic, gravitational potential, elastic, chemical, thermal, nuclear",
      "Energy calculations: efficiency, specific heat capacity, specific latent heat",
      "Power: watts, energy transfer rates",
      "Electricity: charge, current, voltage, resistance",
      "Ohm's law: I-V characteristics, series and parallel circuits",
      "Electrical components: diodes, thermistors, LDRs",
      "Domestic electricity: AC/DC, UK mains, power, energy, cost",
      "Electrical safety: earthing, fuses, circuit breakers",
      "Particle model: density, states of matter, pressure in gases",
      "Pressure: atmospheric, hydraulic systems",
      "Atoms: atomic structure, isotopes, radioactive decay, nuclear radiation",
      "Half-life: calculation, radioactive decay graphs",
      "Nuclear fission and fusion",
      "Background radiation, ionising radiation hazards, uses"
    ],
    "Paper 2 (Foundation / Higher — J249/02 or J249/04)": [
      "Forces: weight, gravity, friction, resultant forces, free body diagrams",
      "Newton's three laws of motion",
      "Momentum: conservation, collisions, impulse (H)",
      "Motion: distance-time, velocity-time graphs, equations of motion",
      "Stopping distance: thinking distance, braking distance",
      "Waves: transverse, longitudinal, amplitude, frequency, wavelength, speed",
      "Electromagnetic spectrum: properties and uses of each region",
      "Light: reflection, refraction, total internal reflection, lenses",
      "Sound: speed in different media, ultrasound",
      "Magnetism: permanent magnets, electromagnets",
      "Electromagnetic induction: generators, transformers",
      "Space: solar system, life cycle of stars, Big Bang theory",
      "Pressure in fluids: upthrust, floating",
      "Practical skills: uncertainties, significant figures, graphs"
    ]
  },

  "OCR-English Language-GCSE": {
    "Component 1: Communicating Information and Ideas (J351/01)": [
      "Reading: 19th century non-fiction text",
      "Reading: 21st century non-fiction text",
      "Comparing writers' perspectives and methods",
      "Understanding and evaluating writer's craft",
      "Writing to communicate information, ideas, viewpoints",
      "Writing for specific forms: articles, reports, speeches, letters",
      "Accurate grammar, punctuation and spelling",
      "Vocabulary choices and register"
    ],
    "Component 2: Exploring Effects and Impact (J351/02)": [
      "Reading: 20th or 21st century literary prose",
      "Analysing language effects in fiction",
      "Evaluating writers' choices and their impact",
      "Creative writing: descriptive or narrative",
      "Structural features in writing",
      "Tone, voice and style",
      "Cohesive devices and paragraphing",
      "Proofreading and accurate writing"
    ]
  },

  "OCR-English Literature-GCSE": {
    "Component 1: Exploring Modern and Literary Heritage Texts (J352/01)": [
      "Modern prose or drama (post-1914) — set text (school choice)",
      "19th century prose fiction — set text (school choice)",
      "Characterisation and motivation",
      "Themes and context",
      "Writers' methods: structure, language, form",
      "Close reading and quotation"
    ],
    "Component 2: Exploring Poetry and Shakespeare (J352/02)": [
      "Shakespeare play — set text (school choice)",
      "Poetry anthology: contemporary and literary heritage poems",
      "Comparative analysis of poems",
      "Themes, attitudes and contexts in poetry",
      "Unseen poetry: analysis of an unknown poem",
      "Dramatic technique in Shakespeare",
      "Soliloquies, dramatic irony, stagecraft"
    ]
  },

  "OCR-Mathematics-GCSE": {
    "Papers 1–3 (Foundation: J560/01–03 / Higher: J560/04–06)": [
      "Number: integers, fractions, decimals, powers, roots, standard form, surds (H)",
      "Algebra: expressions, equations, formulae, functions, sequences",
      "Graphs: plotting, gradient, y-intercept, quadratics, cubic, reciprocal",
      "Solving equations: linear, quadratic, simultaneous",
      "Ratio, proportion, rates of change: percentage, direct/inverse proportion",
      "Geometry: angles, triangles, polygons, circles, transformations",
      "Mensuration: perimeter, area, volume, surface area",
      "Trigonometry: SOHCAHTOA, sine/cosine rules (H)",
      "Vectors (H)",
      "Probability: experimental, theoretical, tree diagrams, Venn diagrams",
      "Statistics: averages, range, cumulative frequency, box plots, histograms",
      "Constructions and loci",
      "Congruence and similarity",
      "Pythagoras' theorem",
      "Higher tier only: calculus, proof, iteration, algebraic fractions"
    ]
  },

  "OCR-Geography A-GCSE": {
    "Component 1: Living in the UK Today (J383/01)": [
      "The UK's evolving physical landscape: upland and lowland landscapes, rock types",
      "Coasts: processes (erosion, deposition, transportation), landforms, coastal management",
      "Rivers: processes, flooding, river management",
      "The UK's evolving human landscape: deindustrialisation, service economy",
      "Urbanisation in the UK: regeneration, smart cities"
    ],
    "Component 2: The World Around Us (J383/02)": [
      "Global hazards: plate tectonics, earthquakes, volcanoes, tropical storms",
      "Climate change: causes, effects, mitigation, adaptation",
      "Ecosystems: tropical rainforests, hot deserts — characteristics, uses, threats",
      "Changing cities: global patterns of urbanisation, mega-cities",
      "Development: indicators, uneven development, trade, aid",
      "Global resource management: food, water, energy security"
    ],
    "Component 3: Geographical Skills (J383/03)": [
      "Fieldwork: techniques, data collection, presentation and analysis",
      "OS maps: grid references, scale, relief, symbols",
      "Graphs and statistical methods",
      "Geographical enquiry process",
      "Issue evaluation using pre-release materials"
    ]
  },

  "OCR-History A-GCSE": {
    "Paper 1: Period Study with Non-British Depth Study": [
      "Period study options (chosen by school): e.g. The People's Health 1250–present, or Migration to Britain c.1000–present, or Power and the People c.1170–present",
      "Non-British depth study options: e.g. The USA 1954–75, Germany 1925–55, Elizabethan England",
      "Change and continuity over time",
      "Causation and consequence",
      "Source analysis: usefulness, reliability"
    ],
    "Paper 2: Thematic Study": [
      "Thematic study options (chosen by school): focuses on a single theme across ~100 years",
      "Analysis of change over time",
      "Interpretations of history"
    ],
    "Paper 3: British Depth Study with Historic Environment": [
      "British depth study (chosen by school): e.g. The Norman Conquest, The Elizabethans, The English Civil War",
      "Historic environment source investigation",
      "Significance and interpretation"
    ]
  },

  "OCR-Religious Studies-GCSE": {
    "Beliefs and Teachings & Practices (J625/01–05)": [
      "Christianity: beliefs (Trinity, Incarnation, Atonement, Resurrection), practices (worship, prayer, sacraments, festivals)",
      "Islam: beliefs (Tawhid, prophethood, holy books, Day of Judgement, Akhirah), practices (Five Pillars, Jihad)",
      "Judaism: beliefs (God, covenant, Torah, Messiah), practices (Shabbat, festivals, dietary laws)",
      "Hinduism: beliefs (Brahman, atman, dharma, karma, samsara, moksha), practices (puja, pilgrimage, festivals)",
      "Buddhism: beliefs (Four Noble Truths, Eightfold Path, Three Marks of Existence), practices (meditation, precepts, festivals)"
    ],
    "Religion, Philosophy and Ethics (J625/06–10)": [
      "Arguments for God's existence: design, cosmological, ontological",
      "Arguments against: problem of evil, suffering",
      "Miracles and revelation",
      "Ethics: situation ethics, Kantian ethics, natural law, utilitarianism",
      "Sexual ethics: relationships, marriage, divorce, same-sex relationships",
      "Life and death: sanctity of life, euthanasia, capital punishment",
      "Human rights, justice, peace and conflict",
      "Religion and science: creation vs evolution, environmental ethics"
    ]
  },

  "OCR-Computer Science-A-Level": {
    "Component 1: Computer Systems (H446/01)": [
      "The characteristics of contemporary processors: Von Neumann, Harvard, CISC, RISC, pipelining, parallel processing",
      "Types of processor: CPU, GPU, multicore",
      "Input, output and storage: secondary storage types, cloud vs local",
      "Software: system software, OS functions, utility software, translation software",
      "Types of programming language: low and high level, imperative, OO, functional, declarative",
      "Boolean algebra: De Morgan's laws, simplification, Karnaugh maps",
      "Logic gates and circuits",
      "Data representation: unsigned and signed binary, BCD, floating point, normalisation",
      "Transmission and networking: TCP/IP stack, protocols, IP, MAC, packet switching, circuit switching",
      "Databases: relational model, SQL, normalisation, ACID, referential integrity",
      "Big Data: characteristics, processing, distributed systems",
      "Functional programming: pure functions, immutability, higher-order functions, lambda calculus",
      "Legal, moral, ethical and cultural issues in computing"
    ],
    "Component 2: Algorithms and Programming (H446/02)": [
      "Computational thinking: decomposition, abstraction, algorithmic thinking",
      "Problem-solving and programming: recursion, Big-O notation",
      "Programming paradigms: OOP (encapsulation, inheritance, polymorphism), procedural, functional",
      "Data structures: arrays, lists, stacks, queues, linked lists, graphs, trees, hash tables",
      "Searching algorithms: linear, binary, depth-first, breadth-first",
      "Sorting algorithms: bubble, insertion, merge, quick sort",
      "Dijkstra's shortest path algorithm",
      "Optimisation: A* search, genetic algorithms",
      "Regular languages: finite state machines, regular expressions",
      "Context-free languages: Backus-Naur Form, syntax diagrams",
      "The Turing machine and computability",
      "Encryption: Caesar cipher, Vernam cipher, public-key cryptography"
    ]
  },

  "OCR-Biology A-A-Level": {
    "Paper 1: Biological Processes (H420/01)": [
      "Cell structure: ultrastructure, organelles and their functions",
      "Biological molecules: water, carbohydrates, lipids, proteins, nucleic acids",
      "Enzymes: mechanism, factors affecting activity, inhibition",
      "Cell membranes: fluid-mosaic model, transport mechanisms",
      "Cell division: mitosis, meiosis, the cell cycle",
      "DNA replication and protein synthesis: transcription, translation, codons",
      "Gene expression: operon model, epigenetics",
      "Photosynthesis: light-dependent and light-independent reactions, Calvin cycle",
      "Respiration: glycolysis, Krebs cycle, oxidative phosphorylation, anaerobic pathways"
    ],
    "Paper 2: Biological Diversity (H420/02)": [
      "Classification: taxonomy, phylogeny, three-domain system",
      "Evolution: natural selection, speciation, Hardy-Weinberg principle",
      "Biodiversity: sampling, Simpson's diversity index",
      "Exchange and transport: surface area to volume, gas exchange (insects, fish, mammals, plants)",
      "Mass transport systems: blood, xylem, phloem — structure and function",
      "Immune response: innate and adaptive immunity, B and T cells, vaccination",
      "Hormonal control: endocrine system, insulin, blood glucose regulation",
      "Nervous coordination: neurones, synapses, action potential, reflexes",
      "Homeostasis: temperature, water, blood glucose regulation"
    ],
    "Paper 3: Unified Biology (H420/03)": [
      "Genetics: monohybrid and dihybrid crosses, sex linkage, epistasis",
      "Mutation and variation",
      "Biotechnology and genetic technology: PCR, gel electrophoresis, genetic engineering",
      "Ecology: populations, communities, energy flow, carbon and nitrogen cycles",
      "Human impact on ecosystems: conservation, sustainability",
      "Synoptic: integration of topics from Papers 1 and 2",
      "Practical skills: analysis of data, evaluation of experimental design"
    ]
  },

  "OCR-Chemistry A-A-Level": {
    "Paper 1: Periodic Table, Elements and Physical Chemistry (H432/01)": [
      "Atomic structure: subatomic particles, mass spectrometry, electronic configuration",
      "Periodicity: physical properties across periods, trends in group 2 and 7",
      "Group 2: reactions, uses of compounds",
      "Group 17 (halogens): properties, reactions, uses",
      "Qualitative analysis: test tube reactions, flame tests, spectroscopy",
      "Amount of substance: moles, empirical formula, percentage yield, atom economy",
      "Acids, bases and pH: strong/weak acids, buffer solutions",
      "Equilibria: Kc, Le Chatelier's principle, Kp (H), acid-base equilibria",
      "Electrochemistry: electrode potentials, standard electrode potential, electrochemical cells",
      "Transition metals: properties, complex ions, ligand substitution, catalysis"
    ],
    "Paper 2: Synthesis and Analytical Techniques (H432/02)": [
      "Thermodynamics: enthalpy, entropy, Gibbs free energy, Born-Haber cycles",
      "Rate equations: orders of reaction, rate constants, Arrhenius equation",
      "Organic chemistry: nomenclature, isomerism, reaction mechanisms",
      "Functional groups: alkanes, alkenes, alcohols, halogenoalkanes, carbonyl compounds, carboxylic acids, esters, amines",
      "Benzene chemistry: electrophilic substitution, directing effects",
      "Condensation polymers: polyesters, polyamides",
      "Organic synthesis: multi-step routes, protecting groups",
      "Spectroscopy: mass spectrometry, IR, 1H NMR, 13C NMR",
      "Chromatography: GC, HPLC, Rf values"
    ],
    "Paper 3: Unified Chemistry (H432/03)": [
      "Synoptic application of all physical, inorganic and organic topics",
      "Data analysis: graphs, calculations, significant figures, errors",
      "Practical skills: required practicals, evaluation",
      "Extended problem solving drawing on whole specification"
    ]
  },

  "OCR-Physics A-A-Level": {
    "Paper 1: Modelling Physics (H556/01)": [
      "Measurements and their errors: SI units, uncertainties, significant figures",
      "Particles and radiation: atomic model, particles, photons, photoelectric effect",
      "Waves: progressive, stationary, superposition, diffraction, interference",
      "Mechanics: scalars/vectors, moments, equilibrium",
      "Kinematics: equations of motion, projectiles",
      "Forces and Newton's laws",
      "Work, energy and power",
      "Materials: stress, strain, Young's modulus, elastic/plastic behaviour",
      "Electricity: current, pd, resistance, resistivity, I-V characteristics",
      "Circuits: Kirchhoff's laws, potential dividers"
    ],
    "Paper 2: Exploring Physics (H556/02)": [
      "Circular motion: angular velocity, centripetal force",
      "Simple harmonic motion: displacement, velocity, acceleration, energy",
      "Gravitational fields: Newton's law, field strength, potential, orbits, escape velocity",
      "Electric fields: Coulomb's law, field strength, potential, capacitors",
      "Capacitors: charge and discharge, time constant",
      "Magnetic fields: flux density, force on current and charge, electromagnetic induction",
      "Thermal physics: internal energy, specific heat capacity, ideal gas law, kinetic theory",
      "Nuclear physics: radioactive decay, fission, fusion, binding energy, mass-energy equivalence"
    ],
    "Paper 3: Unified Physics (H556/03)": [
      "Optional topic (school choice): Astrophysics / Medical physics / Engineering physics / Turning Points in Physics / Electronics",
      "Synoptic: integration of all topics",
      "Practical skills and experimental methods"
    ]
  },

  "OCR-Mathematics A-A-Level": {
    "Paper 1: Pure Mathematics (H240/01)": [
      "Proof: methods including contradiction and mathematical induction",
      "Algebra and functions: polynomials, factor theorem, partial fractions, mappings",
      "Coordinate geometry: circles, parametric equations",
      "Sequences and series: arithmetic, geometric, sigma notation, binomial expansion",
      "Trigonometry: radians, exact values, identities, double angle formulae, R sin(θ + α)",
      "Exponentials and logarithms: laws, equations, modelling",
      "Differentiation: product/quotient/chain rule, implicit, parametric, rates of change",
      "Integration: definite and indefinite, by substitution and parts, volumes of revolution",
      "Differential equations: separable, forming and solving",
      "Vectors: 3D, dot product, equations of lines and planes"
    ],
    "Paper 2: Pure Mathematics and Statistics (H240/02)": [
      "Applied pure: numerical methods, iteration, Newton-Raphson",
      "Statistics: population vs sample, sampling methods",
      "Data presentation: frequency tables, cumulative frequency, histograms, box plots",
      "Probability: conditional, Bayes' theorem",
      "Distributions: binomial, normal distribution — standardisation, inverse normal",
      "Hypothesis testing: binomial, normal, correlation coefficient",
      "Regression and correlation: PMCC, interpretation"
    ],
    "Paper 3: Pure Mathematics and Mechanics (H240/03)": [
      "Applied pure: further algebra and calculus review",
      "Mechanics: forces, Newton's laws, connected particles, pulleys",
      "Kinematics: constant and variable acceleration, 2D motion",
      "Projectile motion",
      "Friction: limiting equilibrium, coefficient of friction",
      "Moments: equilibrium of rigid bodies",
      "Impulse and momentum: conservation, collisions"
    ]
  },

  "OCR-Psychology-A-Level": {
    "Paper 1: Research Methods (H567/01)": [
      "Research methods: experiments (lab, field, natural, quasi), observations, surveys, case studies, correlation",
      "Research design: IV, DV, controls, extraneous variables, demand characteristics",
      "Sampling: random, systematic, opportunity, volunteer",
      "Data analysis: levels of measurement, descriptive statistics, inferential statistics",
      "Statistical tests: Mann-Whitney, Wilcoxon, Chi-squared, Spearman's rho",
      "Ethical guidelines: BPS code, informed consent, debriefing",
      "Quantitative vs qualitative data"
    ],
    "Paper 2: Psychological Themes Through Core Studies (H567/02)": [
      "Core studies: Milgram (obedience), Zimbardo (prison simulation), Asch (conformity)",
      "Core studies: Loftus & Palmer (EWT), Grant et al. (context-dependent memory)",
      "Core studies: Baron-Cohen et al. (ToM in autism), Savage-Rumbaugh (language in primates)",
      "Core studies: Freud (Little Hans), Bandura et al. (Bobo doll), Chaney et al. (medication adherence)",
      "Core studies: Sperry (split brain), Casey et al. (impulse control), Dement & Kleitman (dreaming)",
      "Core studies: Griffiths (gambling), Rosenhan (sane in insane places)",
      "Core studies: Thigpen & Cleckley (multiple personality), Watson & Rayner (Little Albert)",
      "Themes: issues and debates in psychology"
    ],
    "Paper 3: Applied Psychology (H567/03)": [
      "Issues in mental health: classification, cultural variations in diagnosis",
      "Disorders: schizophrenia (Rosenhan, Gottesman), depression, phobias",
      "Treatments: biological (drugs, ECT), cognitive (CBT), behavioural (systematic desensitisation)",
      "Option 1: Criminal psychology — criminal behaviour theories, eyewitness testimony, jury decision-making",
      "Option 2: Sport and exercise — motivation, stress, team dynamics",
      "Option 3: Health psychology — stress, smoking, eating behaviour",
      "Option 4: Educational psychology — learning theories, exam performance, teaching strategies"
    ]
  },

  "OCR-Geography-A-Level": {
    "Paper 1: Physical Systems (H481/01)": [
      "Landscape systems: either coastal landscapes or glaciated landscapes (choice)",
      "Earth's life support systems: water and carbon cycles — stores, fluxes, feedbacks",
      "Coastal systems: littoral cells, erosion and deposition processes, landforms, management",
      "Glaciated landscapes: glacial processes, landforms, paraglacial and periglacial landscapes",
      "Quantitative skills: statistical measures, graphs, GIS"
    ],
    "Paper 2: Human Interactions (H481/02)": [
      "Changing spaces, making places: place character, local and global connections",
      "Global connections: trade, migration, global governance",
      "Processes and patterns of migration",
      "Power and borders: superpower geopolitics, emerging powers",
      "Fieldwork: independent investigation methodology"
    ],
    "Paper 3: Geographical Debates (H481/03)": [
      "Climate change: physical causes, consequences, mitigation and adaptation strategies",
      "Disease dilemmas: global patterns of disease, mitigation, big data",
      "Exploring oceans: ocean acidification, governance, resources",
      "Future of food: global food systems, food security, sustainable strategies",
      "Hazardous Earth: tectonics, climate hazards, multiple hazard zones",
      "Technology in a changing world: digital world, ICT, technology and development"
    ]
  },

  "OCR-Religious Studies-A-Level": {
    "Paper 1: Philosophy of Religion (H573/01)": [
      "Ancient philosophical influences: Plato (Forms, Analogy of the Cave), Aristotle (causation, Prime Mover)",
      "The nature of the soul, mind and body: dualism, monism, Descartes, Hume",
      "Arguments for the existence of God: cosmological, teleological (Paley, Swinburne), ontological (Anselm, Kant's critique)",
      "Religious experience: visions, miracles, Swinburne's cumulative argument",
      "The problem of evil: theodicies (Irenaeus, Augustine), responses (Hick, Swinburne)",
      "Religious language: via negativa, analogy, myth, verification/falsification, Wittgenstein"
    ],
    "Paper 2: Religion and Ethics (H573/02)": [
      "Ethical theories: natural law (Aquinas, absolute/relative), Situation Ethics (Fletcher, Christian context)",
      "Kantian ethics: categorical imperative, deontological approach",
      "Utilitarianism: Bentham, Mill, preference utilitarianism",
      "Applied ethics: sexual ethics (Christian and secular), medical ethics (euthanasia, abortion)",
      "Free will and moral responsibility: compatibilism, hard determinism",
      "Conscience: Aquinas, Freud, Newman",
      "Virtue ethics: Aristotle, MacIntyre, Neo-Aristotelian revival",
      "Moral decision-making frameworks: comparison of theories"
    ],
    "Paper 3: Developments in Religious Thought (H573/03)": [
      "Option: Christianity, Islam, Judaism, Buddhism or Hinduism",
      "Christian thought: sources of authority, the person of Jesus, Christian moral principles",
      "Liberation theology: political and social implications",
      "Gender, sexuality and Christian thought",
      "Pluralism, secularism and Christian mission",
      "The challenge of science to religious thought"
    ]
  },

  "OCR-Law-A-Level": {
    "Paper 1: The Legal System and Criminal Law (H418/01)": [
      "The nature of law: law and morality, law and justice",
      "The court structure and jurisdiction: civil and criminal courts, hierarchy",
      "The legal profession: barristers, solicitors, judiciary",
      "Legal personnel: magistrates, juries — role, selection, reform",
      "Access to justice: legal aid, funding",
      "Criminal law: actus reus, mens rea, strict liability",
      "Non-fatal offences: assault, battery, ABH (s.47), GBH (s.20 and s.18)",
      "Fatal offences: murder, voluntary manslaughter, involuntary manslaughter",
      "Defences: insanity, automatism, intoxication, consent, self-defence"
    ],
    "Paper 2: Law Making and the Law of Tort (H418/02)": [
      "Parliamentary law making: Green/White Papers, Bills, Acts, delegated legislation",
      "Statutory interpretation: literal, golden, mischief rules; purposive approach; aids",
      "Judicial precedent: ratio decidendi, obiter dicta, hierarchy, advantages/disadvantages",
      "Influences on law making: law reform, Law Commission",
      "Tort: negligence — duty of care (Caparo), breach, causation, remoteness, defences",
      "Occupiers' liability: Occupiers Liability Acts 1957 and 1984",
      "Nuisance: private and public nuisance, Rylands v Fletcher",
      "Vicarious liability: course of employment, frolic of own"
    ],
    "Paper 3: The Nature of Law and Further Options (H418/03+04)": [
      "Human rights: European Convention, HRA 1998, balancing rights",
      "Contract law: offer and acceptance, consideration, intention, terms",
      "Vitiating factors: misrepresentation, duress, undue influence",
      "Discharge: performance, breach, frustration",
      "Remedies: damages, injunction, specific performance",
      "Comparison of civil and criminal law systems"
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Edexcel GCSE SPEC TOPICS - sourced from official Pearson specifications
  // ─────────────────────────────────────────────────────────────────────────

  "Edexcel-Computer Science-GCSE": {
    "Paper 1: Principles of Computer Science (1CP1/01)": [
      "Algorithms: flowcharts, pseudocode, decomposition, abstraction",
      "Data representation: binary, hexadecimal, ASCII, Unicode, image and sound encoding",
      "Computer systems: hardware components, CPU architecture, fetch-execute cycle",
      "Networks: types (LAN, WAN), topologies, protocols (TCP/IP, HTTP, DNS), network hardware",
      "Cyber security: threats, prevention, encryption types",
      "Software engineering: programming, testing, IDE tools",
      "Databases: entity-relationship diagrams, SQL (SELECT, UPDATE, INSERT, DELETE)",
      "Boolean logic: truth tables, logic gates, De Morgan's laws",
      "Programming: data types, variables, sequence, selection, iteration, procedures",
      "Data structures: arrays, records, stacks, queues, linked lists, binary trees",
      "Algorithms: searching and sorting, Big O notation",
      "Computer science ethics: intellectual property, privacy, environmental impact"
    ],
    "Paper 2: Application of Computational Thinking (1CP1/02)": [
      "Programming constructs: all Paper 1 constructs applied to problems",
      "Decomposition of complex problems",
      "Algorithm design: efficiency, trace tables",
      "String manipulation and file handling",
      "Sub-programs: functions, procedures, parameters, return values",
      "Object-oriented programming: classes, objects, encapsulation, inheritance, polymorphism",
      "Recursive algorithms",
      "Pattern recognition",
      "Translators: assembler, compiler, interpreter — pros/cons"
    ]
  },

  "Edexcel-Biology-GCSE": {
    "Paper 1: Topics 1–5 (1BI0/1F+H)": [
      "Topic 1: Key concepts in biology — cell structure, biological molecules, enzymes, cell division, microscopy",
      "Topic 2: Cells and control — mitosis, cell differentiation, stem cells, nervous system, synapses",
      "Topic 3: Genetics — meiosis, inheritance, genetic crosses, mutations, genetic disorders",
      "Topic 4: Natural selection and genetic modification — Darwin, evolution, GM organisms",
      "Topic 5: Health, disease and the development of medicines — communicable diseases, immune response, drugs, vaccines"
    ],
    "Paper 2: Topics 1 and 6–9 (1BI0/2F+H)": [
      "Topic 1 revisited: key concepts applied",
      "Topic 6: Plant structures and their functions — photosynthesis, transpiration, plant hormones",
      "Topic 7: Animal coordination, control and homeostasis — hormones, menstrual cycle, diabetes, thermoregulation, kidneys",
      "Topic 8: Exchange and transport in animals — heart, blood vessels, respiratory system, gas exchange",
      "Topic 9: Ecosystems and material cycles — food chains, biodiversity, carbon cycle, decomposition, human impact"
    ]
  },

  "Edexcel-Chemistry-GCSE": {
    "Paper 1: Topics 1–5 (1CH0/1F+H)": [
      "Topic 1: Atomic structure and the periodic table — atomic models, electronic structure, isotopes, groups and periods",
      "Topic 2: Bonding, structure and the properties of matter — ionic, covalent, metallic bonding, alloys, polymers, fullerenes",
      "Topic 3: Quantitative chemistry — moles, formulae, percentage yield, atom economy, limiting reagents, titration calculations",
      "Topic 4: Chemical changes — reactivity series, extraction of metals, displacement reactions, electrolysis, acids and bases",
      "Topic 5: Energy changes — exothermic, endothermic, energy profiles, bond enthalpies, Hess's law (H)"
    ],
    "Paper 2: Topics 1 and 6–10 (1CH0/2F+H)": [
      "Topic 1 revisited: applied knowledge",
      "Topic 6: Rates of reaction — collision theory, temperature, concentration, pressure, catalyst, surface area",
      "Topic 7: Organic chemistry — hydrocarbons, crude oil, cracking, addition/condensation polymers, alcohols",
      "Topic 8: Chemical analysis — purity, separating mixtures, chromatography, testing for ions and gases",
      "Topic 9: Chemistry of the atmosphere — early atmosphere, greenhouse effect, carbon footprint",
      "Topic 10: Using resources — sustainable development, water purification, ceramics, composites, LCA"
    ]
  },

  "Edexcel-Physics-GCSE": {
    "Paper 1: Topics 1–7 (1PH0/1F+H)": [
      "Topic 1: Key concepts of physics — units, equations, energy, power, efficiency",
      "Topic 2: Motion and forces — speed, velocity, acceleration, Newton's laws, stopping distances",
      "Topic 3: Conservation of energy — energy stores, work done, gravitational PE, elastic PE",
      "Topic 4: Waves — transverse/longitudinal, EM spectrum, reflection, refraction, sound",
      "Topic 5: Light and the EM spectrum — uses and hazards of each region, lenses",
      "Topic 6: Radioactivity — atomic model, types of radiation, half-life, uses, nuclear equations",
      "Topic 7: Astronomy — solar system, life cycle of stars, Big Bang"
    ],
    "Paper 2: Topics 1 and 8–15 (1PH0/2F+H)": [
      "Topic 1 revisited: applied concepts",
      "Topic 8: Energy — national and global energy resources",
      "Topic 9: Forces and their effects — density, pressure, moments, hooke's law",
      "Topic 10: Electricity and circuits — charge, current, pd, resistance, circuit components, power",
      "Topic 11: Static electricity — charging, sparking, lightning",
      "Topic 12: Magnetism and the motor effect — magnetic fields, motors, generators",
      "Topic 13: Electromagnetic induction — transformers, National Grid",
      "Topic 14: Particle model — states of matter, specific heat capacity, specific latent heat",
      "Topic 15: Forces and matter — Hooke's law, Young's modulus (H)"
    ]
  },

  "Edexcel-History-GCSE": {
    "Paper 1: Thematic Study and Historic Environment (1HI0/10–13+20–22)": [
      "Thematic study (choice): Medicine in Britain c.1250–present, Migrants in Britain c.800–present",
      "Changes in understanding of disease and treatment over time",
      "Key individuals: e.g. Pasteur, Fleming, NHS",
      "Historic environment (tied to thematic study): e.g. The British sector of the Western Front",
      "Factors: science, technology, war, government, chance, attitudes in society"
    ],
    "Paper 2: Period Study and British Depth Study (1HI0/2A–2W+30–33)": [
      "Period study (choice): Early Elizabethan England 1558–88, The American West c.1835–95, Superpower Relations and the Cold War 1941–91",
      "British depth study (choice): Anglo-Saxon and Norman England c.1060–88, Henry VIII and his ministers 1509–40, Elizabethan England c.1568–1603",
      "Historical causation, consequence, significance",
      "Source analysis and evaluation"
    ],
    "Paper 3: Modern Depth Study (1HI0/30–33)": [
      "Modern depth study (choice): Weimar and Nazi Germany 1918–39, Mao's China 1945–76, The USA 1954–75",
      "Political, social and economic change",
      "Historical interpretations"
    ]
  },

  "Edexcel-English Language-GCSE": {
    "Paper 1: Fiction and Imaginative Writing (1EN0/01)": [
      "Reading: 20th or 21st century fiction text",
      "Identifying and interpreting explicit and implicit information",
      "Analysing writers' methods: language, structure, form",
      "Evaluating a writer's use of language for effect",
      "Imaginative writing: descriptive or narrative — full range of vocabulary and punctuation"
    ],
    "Paper 2: Non-Fiction and Transactional Writing (1EN0/02)": [
      "Reading two unseen non-fiction texts (21st century and 19th century)",
      "Summarising differences and similarities between texts",
      "Comparing writers' perspectives and methods",
      "Transactional writing: articles, speeches, letters, reports — purpose, audience, form"
    ]
  },

  "Edexcel-English Literature-GCSE": {
    "Paper 1: Shakespeare and Post-1914 Literature (1ET0/01)": [
      "Shakespeare play: one of — Macbeth, Romeo and Juliet, The Merchant of Venice, The Tempest, Othello, A Midsummer Night's Dream",
      "Post-1914 British novel or play: e.g. An Inspector Calls, Lord of the Flies, Of Mice and Men",
      "Extract plus whole text question",
      "Themes, characterisation, stagecraft"
    ],
    "Paper 2: 19th-Century Novel and Poetry since 1789 (1ET0/02)": [
      "19th-century novel: e.g. A Christmas Carol, Great Expectations, Dr Jekyll and Mr Hyde",
      "Poetry anthology: Conflict cluster or Love and Relationships cluster",
      "Comparison of two anthology poems",
      "Unseen poem analysis",
      "Context and interpretation"
    ]
  },

  "Edexcel-Mathematics-GCSE": {
    "Paper 1: Non-Calculator (1MA1/1F or 1H), Paper 2 and 3: Calculator (1MA1/2F+3F or 2H+3H)": [
      "Number: place value, surds, fractions, recurring decimals, standard form, HCF/LCM",
      "Algebra: expressions, expanding, factorising, equations, inequalities, functions",
      "Sequences: nth term, arithmetic and geometric, Fibonacci",
      "Graphs: linear, quadratic, cubic, reciprocal, exponential, trigonometric",
      "Ratio, proportion: direct and inverse, exchange rates, best buys",
      "Percentage: compound interest, reverse percentage, percentage change",
      "Geometry: angles, parallel lines, polygons, circle theorems (H)",
      "Mensuration: area, volume, surface area of 3D shapes",
      "Trigonometry: SOHCAHTOA, exact values, sine/cosine rules (H), 3D trig (H)",
      "Transformations: rotation, reflection, translation, enlargement, vectors",
      "Vectors: column, magnitude, direction (H)",
      "Probability: sample space, tree diagrams, conditional probability (H)",
      "Statistics: averages, frequency polygons, cumulative frequency, box plots, histograms"
    ]
  },

  "Edexcel-Geography-GCSE": {
    "Paper 1: Physical Geography (1GB0/01)": [
      "The challenge of natural hazards: tectonic hazards, weather hazards, climate change",
      "The living world: ecosystems, tropical rainforests, hot deserts or cold environments",
      "Physical landscapes in the UK: coastal change and conflict, river landscape and processes",
      "Fieldwork: at least one physical geography investigation"
    ],
    "Paper 2: Human Geography (1GB0/02)": [
      "Urban issues and challenges: global urbanisation, UK city case study, sustainable urban development",
      "The changing economic world: global development gap, economic development strategies, UK change",
      "The challenge of resource management: food, water, energy — global and UK focus",
      "Fieldwork: at least one human geography investigation"
    ],
    "Paper 3: Geographical Applications (1GB0/03)": [
      "Issue evaluation: pre-release resource booklet (12 weeks before exam), decision making",
      "Fieldwork: written questions on student's own investigations",
      "Geographical skills: OS maps, graphs, statistical methods, GIS"
    ]
  },

  "Edexcel-Business Studies-GCSE": {
    "Paper 1: Investigating Small Business (1BS0/01)": [
      "Enterprise and entrepreneurship: business aims and objectives, stakeholders",
      "Spotting a business opportunity: market research, customer needs, competitive market",
      "Putting a business idea into practice: business plans, sources of finance",
      "Making the business effective: location, organisation, marketing mix (4Ps)",
      "Understanding external influences: legislation, economic climate, technology, ethical issues"
    ],
    "Paper 2: Building a Business (1BS0/02)": [
      "Growing the business: business growth, changes in business aims",
      "Making marketing decisions: branding, advertising, pricing strategies",
      "Making operational decisions: production methods, lean production, procurement",
      "Making financial decisions: gross profit, net profit, financial statements, cash flow",
      "Making human resource decisions: organisational structures, motivation, training"
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Edexcel A-Level SPEC TOPICS
  // ─────────────────────────────────────────────────────────────────────────

  "Edexcel-Mathematics-A-Level": {
    "Paper 1: Pure Mathematics 1 (9MA0/01)": [
      "Algebra and functions: surds, indices, quadratics, simultaneous equations, inequalities, partial fractions",
      "Coordinate geometry: circles, parametric equations",
      "Further algebra: binomial expansion (positive and fractional powers)",
      "Trigonometry: radians, sec/cosec/cot, inverse trig, small angle approximations",
      "Differentiation: chain/product/quotient rule, implicit, parametric",
      "Integration: by inspection, substitution, parts",
      "Vectors: 3D vectors, dot product, angle between lines"
    ],
    "Paper 2: Pure Mathematics 2 (9MA0/02)": [
      "Proof: proof by exhaustion, contradiction, counter-example",
      "Functions: domain, range, composite, inverse, graph transformations",
      "Sequences and series: geometric and arithmetic sequences, sigma notation",
      "Exponentials and logarithms: equations, models, change of base",
      "Further differentiation: e^x, ln x, trig functions, rates of change",
      "Further integration: definite integrals, trapezium rule, differential equations",
      "Numerical methods: iteration, Newton-Raphson"
    ],
    "Paper 3: Statistics and Mechanics (9MA0/03)": [
      "Statistics: data collection, sampling, measures of central tendency and spread",
      "Probability: conditional probability, Bayes' theorem",
      "Statistical distributions: binomial B(n,p), Normal distribution N(μ,σ²)",
      "Statistical hypothesis testing: one-tailed and two-tailed tests",
      "Correlation and regression",
      "Mechanics: kinematics (constant and variable acceleration), projectiles",
      "Forces and Newton's laws, friction, connected particles",
      "Moments and equilibrium of rigid bodies"
    ]
  },

  "Edexcel-Biology-A-Level": {
    "Paper 1: The Natural Environment and Species (9BI0/01)": [
      "Topic 1: Biological molecules — carbohydrates, lipids, proteins, DNA, water",
      "Topic 2: Cells — ultrastructure, cell division (mitosis/meiosis), transport across membranes",
      "Topic 3: Organisms exchange substances — surface area:volume, gas exchange, digestion, circulatory system",
      "Topic 4: Genetic information, variation and relationships — DNA replication, protein synthesis, genetic code, mutations",
      "Topic 5: Energy transfers in and between organisms — photosynthesis (light-dependent and independent), respiration"
    ],
    "Paper 2: Energy, Exercise and Coordination (9BI0/02)": [
      "Topic 5 continued: cellular respiration in detail, ATP synthesis",
      "Topic 6: Organisms respond to changes in their internal and external environments — nervous system, muscle contraction, hormones, homeostasis",
      "Topic 7: Genetics, populations, evolution and ecosystems — Hardy-Weinberg, speciation, population dynamics, succession",
      "Topic 8: The control of gene expression — epigenetics, gene expression, recombinant DNA technology, ethics"
    ],
    "Paper 3: General and Practical Principles in Biology (9BI0/03)": [
      "Synoptic: drawing on all topics from Papers 1 and 2",
      "Practical skills: experimental design, data analysis, error analysis",
      "Extended essay: one choice from Topics 5, 6, 7 or 8"
    ]
  },

  "Edexcel-Chemistry-A-Level": {
    "Paper 1: Advanced Inorganic and Physical Chemistry (9CH0/01)": [
      "Topic 1: Atomic structure and periodic table",
      "Topic 2: Bonding and structure",
      "Topic 3: Redox and electrochemistry: electrode potentials, electrolytic cells, electrochemical cells",
      "Topic 4: Inorganic chemistry and the periodic table: reactions of groups 1, 2, 17, transition metals",
      "Topic 5: Formulae, equations and amounts of substance: moles, yield, atom economy",
      "Topic 10: Equilibrium: Kc, Kp, Le Chatelier, acid-base equilibria, buffer solutions, Kw",
      "Topic 12: Kinetics: rate equations, Arrhenius equation, mechanisms"
    ],
    "Paper 2: Advanced Organic and Physical Chemistry (9CH0/02)": [
      "Topic 5: Formulae, equations and amounts of substance",
      "Topic 6: Organic chemistry: nomenclature, isomerism, functional groups",
      "Topic 7: Modern analytical techniques: NMR, IR, MS, chromatography",
      "Topic 8: Thermodynamics: Born-Haber cycles, Hess's law, entropy, Gibbs free energy",
      "Topic 9: Organic chemistry 2: carbonyls, carboxylic acids, esters, amines, polymers",
      "Topic 11: Organic synthesis: multi-step routes, retrosynthesis"
    ],
    "Paper 3: General and Practical Principles (9CH0/03)": [
      "Synoptic questions drawing on all topics",
      "Practical skills: required practicals, data analysis, evaluation"
    ]
  },

  "Edexcel-Physics-A-Level": {
    "Paper 1: Advanced Physics I (9PH0/01)": [
      "Topic 1: Working as a physicist — units, prefixes, measurements, uncertainties",
      "Topic 2: Mechanics — kinematics, Newton's laws, momentum, work, energy, power",
      "Topic 3: Electric circuits — charge, current, resistance, circuits, capacitors",
      "Topic 4: Materials — density, Hooke's law, Young's modulus, viscosity",
      "Topic 5: Waves and particle nature of light — waves, refraction, diffraction, EM spectrum, photoelectric effect"
    ],
    "Paper 2: Advanced Physics II (9PH0/02)": [
      "Topic 6: Further mechanics — circular motion, SHM, resonance",
      "Topic 7: Electric and magnetic fields — electric fields, capacitor charging, magnetic fields, electromagnetic induction, transformers",
      "Topic 8: Nuclear and particle physics — radioactive decay, nuclear radius, binding energy, particle physics"
    ],
    "Paper 3: General and Practical Principles in Physics (9PH0/03)": [
      "Topics 1–8 synoptic",
      "Option topic: Astrophysics / Space / Nuclear / Medical / Engineering / Telecommunications",
      "Practical skills assessment"
    ]
  },

  "Edexcel-Psychology-A-Level": {
    "Paper 1: Introductory Topics in Psychology (9PS0/01)": [
      "Social influence: conformity (Asch), obedience (Milgram), explanations, minority influence",
      "Memory: models (multi-store, working memory), EWT, improving memory",
      "Attachment: caregiver interactions, stages (Ainsworth), Strange Situation, cultural variations",
      "Psychopathology: definitions of abnormality, phobias, depression, OCD — characteristics and treatments"
    ],
    "Paper 2: Psychology in Context (9PS0/02)": [
      "Approaches: origins, behaviourist, SLT, cognitive, biological, psychodynamic, humanist",
      "Biopsychology: nervous system, brain structure, fight/flight, hemispheres, split brain, neuroimaging",
      "Research methods: experiments, observations, surveys, correlations, case studies",
      "Statistical analysis: measures of central tendency and dispersion, sign test, statistical significance"
    ],
    "Paper 3: Issues and Options in Psychology (9PS0/03)": [
      "Issues and debates: gender bias, cultural bias, ethics, free will vs determinism, reductionism, nature-nurture",
      "Option 1: Relationships / Gender / Cognition and development",
      "Option 2: Schizophrenia / Eating behaviour / Stress",
      "Option 3: Aggression / Forensic / Addiction"
    ]
  },

  "Edexcel-Economics A-A-Level": {
    "Paper 1: Markets and Business Behaviour (9EC0/01)": [
      "Demand, supply and price: elasticities (PED, PES, YED, XED), consumer and producer surplus",
      "Market structures: perfect competition, monopolistic competition, oligopoly, monopoly",
      "Labour markets: demand and supply of labour, wage determination, trade unions",
      "Government intervention: taxes, subsidies, price controls, regulation",
      "Firm behaviour: costs, revenues, profit maximisation, economies of scale",
      "Market failure: externalities, public goods, information failure"
    ],
    "Paper 2: The National and Global Economy (9EC0/02)": [
      "Macroeconomic objectives: growth, inflation, unemployment, current account",
      "AD/AS model: shifts, equilibrium, demand-side and supply-side shocks",
      "Fiscal policy: government spending, taxation, budget deficit/surplus",
      "Monetary policy: interest rates, quantitative easing, inflation targeting",
      "International trade: comparative advantage, protectionism, exchange rates",
      "Balance of payments, globalisation, development"
    ],
    "Paper 3: Synoptic/Theme (9EC0/03)": [
      "Integration of microeconomics and macroeconomics",
      "Economic agents: consumers, firms, government, global institutions",
      "Policy trade-offs and limitations",
      "Case study analysis and evaluation"
    ]
  },

  "Edexcel-Business-A-Level": {
    "Paper 1: Marketing, People and Global Businesses (9BS0/01)": [
      "Analysing the strategic position of a business: mission, objectives, strategy",
      "Marketing: market analysis, segmentation, targeting, positioning",
      "Marketing mix: product, price, place, promotion decisions",
      "Managing people: motivation theories, leadership styles, organisational design, recruitment",
      "Global business: reasons for growth, trading blocs, emerging markets, multinational companies"
    ],
    "Paper 2: Business Activities, Decisions and Strategy (9BS0/02)": [
      "Raising finance: sources (debt vs equity), financial markets",
      "Financial decision-making: investment appraisal (NPV, ARR, payback period), financial ratios",
      "Choosing strategic direction: Ansoff matrix, competitive advantage, diversification",
      "Managing change: internal and external change, Kotter's model",
      "Operations and supply chain management: lean, JIT, total quality management"
    ],
    "Paper 3: Investigating Business in a Competitive Environment (9BS0/03)": [
      "Synoptic assessment drawing on Papers 1 and 2",
      "Case study analysis: a pre-seen business context",
      "Evaluating strategic options: integration of marketing, finance, HR, operations",
      "Ethics and corporate social responsibility"
    ]
  },

  "Edexcel-Geography-A-Level": {
    "Paper 1: Dynamic Landscapes (9GE0/01)": [
      "Tectonic processes and hazards: plate tectonics, earthquakes, volcanoes, risk management",
      "Landscape systems (choice): Glaciated landscapes or Coastal landscapes",
      "Glaciated landscapes: processes, landforms, periglacial, management",
      "Coastal landscapes: erosion and deposition, landform development, coastal management, sea-level change"
    ],
    "Paper 2: Dynamic Places (9GE0/02)": [
      "Globalisation: trade, TNCs, inequality, cultural convergence",
      "Shaping places (choice): regenerating places or diverse places",
      "Regenerating places: economic change, place identity, strategies for regeneration",
      "Diverse places: demographic change, cultural diversity, social inequality, managing change"
    ],
    "Paper 3: Synoptic Investigation (9GE0/03)": [
      "Players, attitudes and actions on a contemporary geographical issue",
      "Pre-release resource booklet: analysing connections between geographic themes",
      "Evaluation of options and sustainable development"
    ]
  },

  "Edexcel-History-A-Level": {
    "Paper 1: Breadth Study (9HI0/1A–1O)": [
      "Option: e.g. Britain Transformed c.1918–97, Russia and its Rulers 1855–1964, The American Dream 1945–80",
      "Historical change over an extended period",
      "Continuity, causation, significance",
      "Historiographical interpretations"
    ],
    "Paper 2: Depth Study (9HI0/2A–2T)": [
      "Option: e.g. The USA c.1920–55, Germany 1914–45, Mao's China 1945–76",
      "Historical significance and causation",
      "Primary source analysis",
      "Short and medium-length responses"
    ],
    "Paper 3: Historical Controversies (9HI0/3A–3I)": [
      "Option: e.g. The Origins of the First World War, The Witch Craze c.1500–1700",
      "Historiographical interpretations and debates",
      "Evaluating historians' arguments",
      "Extended essay: sustained analytical argument"
    ]
  },

  "Edexcel-Sociology-A-Level": {
    "Paper 1: Education with Theory and Methods (9SO0/01)": [
      "Education: role and purpose of education, sociological perspectives (functionalism, Marxism, feminism)",
      "Differential educational achievement by class, gender, ethnicity",
      "Internal factors: teacher labelling, streaming, pupil subcultures",
      "External factors: home background, material deprivation, cultural capital",
      "Role of education in social mobility",
      "Theory and Methods 1: sociological perspectives, research methods overview"
    ],
    "Paper 2: Topics in Sociology (9SO0/02)": [
      "Option: Families and Households / Health / Work, Poverty and Welfare",
      "Families: diversity, changing patterns, demographic trends, gender roles",
      "Health: social distribution, medicine, mental health",
      "Poverty: definitions, causes, welfare state"
    ],
    "Paper 3: Crime and Deviance with Theory and Methods (9SO0/03)": [
      "Crime and deviance: definitions, functionalist, strain, subcultural theories",
      "Labelling theory, Marxist criminology, left/right realism, feminist perspectives",
      "Globalisation, green crime, state crime, human rights",
      "Theory and Methods 2: positivism vs interpretivism, research design, ethics"
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CCEA GCSE SPEC TOPICS - sourced from official CCEA specifications
  // ─────────────────────────────────────────────────────────────────────────

  "CCEA-Mathematics-GCSE": {
    "Unit 1: Non-Calculator + Unit 3/4/5: Calculator": [
      "Number: integers, fractions, decimals, percentages, powers, roots, standard form",
      "Algebra: expressions, formulae, equations (linear, quadratic), inequalities, sequences",
      "Graphs: straight lines, quadratics, cubic, distance-time, speed-time",
      "Proportion: direct and inverse, ratio",
      "Geometry: angle facts, triangles, polygons, circle theorems",
      "Mensuration: perimeter, area, volume, surface area of 2D and 3D shapes",
      "Trigonometry: SOHCAHTOA (Foundation), sine/cosine rules (Higher)",
      "Transformations: translation, rotation, reflection, enlargement",
      "Probability: experimental, theoretical, tree diagrams",
      "Statistics: averages, range, frequency tables, cumulative frequency, box plots, histograms"
    ]
  },

  "CCEA-Biology-GCSE": {
    "Unit 1: Cells, Living Processes and Biodiversity": [
      "Cell structure: plant, animal, bacterial cells; organelles; microscopy",
      "Cell division: mitosis and the cell cycle; asexual reproduction",
      "Biological molecules: carbohydrates, proteins, lipids",
      "Enzymes: mechanism, factors affecting activity",
      "Transport: diffusion, osmosis, active transport",
      "Nutrition: autotrophs, heterotrophs; photosynthesis; digestive system",
      "Respiration: aerobic and anaerobic; ATP",
      "Gas exchange: lungs, gills, leaves",
      "Circulation: heart, blood vessels, blood",
      "Classification and biodiversity"
    ],
    "Unit 2: Body Systems, Ecology and the Environment": [
      "Coordination: nervous system (neurones, reflex arc), hormones",
      "Homeostasis: thermoregulation, blood glucose, osmoregulation",
      "Reproduction: sexual vs asexual; fertilisation; development",
      "Genetics: DNA, chromosomes, inheritance, genetic disorders",
      "Evolution: natural selection, mutation, speciation",
      "Ecology: populations, food webs, energy flow, nutrient cycles",
      "Human impact: pollution, conservation, sustainability"
    ]
  },

  "CCEA-Chemistry-GCSE": {
    "Unit 1: Basic Concepts in Chemistry": [
      "Atomic structure: protons, neutrons, electrons; relative atomic mass",
      "The periodic table: groups, periods, properties",
      "Bonding: ionic, covalent, metallic — properties and structure",
      "Formulae and equations: balancing, state symbols",
      "Moles and calculations: molar mass, percentage composition",
      "Reactions: acids, bases, salts, redox",
      "Rates of reaction: collision theory, factors",
      "Electrolysis: ionic compounds and aqueous solutions"
    ],
    "Unit 2: Further Chemical Reactions, Rates and Equilibrium, Calculations and Organic Chemistry": [
      "Reversible reactions and equilibrium: Le Chatelier's principle",
      "Organic chemistry: hydrocarbons, alkanes, alkenes, alcohols",
      "Crude oil and fuels",
      "Polymers: addition and condensation",
      "Further calculations: titration, gas volumes",
      "Analysis: tests for gases, ions, chromatography",
      "Industrial chemistry: Haber process, Contact process",
      "Environmental chemistry: greenhouse gases, acid rain"
    ]
  },

  "CCEA-Physics-GCSE": {
    "Unit 1: Forces, Energy and Electricity": [
      "Forces: types, Newton's laws, weight, friction",
      "Motion: speed, velocity, acceleration, distance-time and velocity-time graphs",
      "Work, energy and power: calculations, conservation",
      "Energy resources: renewable and non-renewable",
      "Electricity: current, voltage, resistance, Ohm's law, series and parallel circuits",
      "Domestic electricity: mains supply, power, cost, safety"
    ],
    "Unit 2: Waves, Particles and the Universe": [
      "Waves: transverse, longitudinal, properties, speed equation",
      "Electromagnetic spectrum: properties and uses",
      "Light: reflection, refraction, total internal reflection",
      "Sound: properties, ultrasound",
      "Atomic structure: nucleus, isotopes, radioactive decay",
      "Radiation: alpha, beta, gamma; uses; half-life",
      "Nuclear fission and fusion",
      "The Universe: solar system, stars, Big Bang theory"
    ]
  },

  "CCEA-History-GCSE": {
    "Unit 1: Changes in Germany 1919–45 and The USA 1918–68 (or variant)": [
      "Weimar Republic: origins, instability, Nazi rise to power",
      "Nazi Germany: social control, propaganda, persecution, Holocaust",
      "USA 1918–41: economic boom, social change, Wall Street Crash, New Deal",
      "USA 1945–68: post-war prosperity, Cold War fears, civil rights movement",
      "Source skills: reliability, usefulness, interpretation"
    ],
    "Unit 2: Northern Ireland and its Neighbours 1920–present": [
      "Partition of Ireland and establishment of Northern Ireland",
      "Political developments: Stormont, civil rights movement, Troubles",
      "Role of British and Irish governments",
      "Peace process: Good Friday Agreement, devolution",
      "Changing relationships between Northern Ireland, Ireland, Britain and Europe"
    ]
  },

  "CCEA-Geography-GCSE": {
    "Unit 1: Understanding Our Natural World": [
      "River environments: processes (erosion, transportation, deposition), landforms, flooding, management",
      "Coastal environments: marine and sub-aerial processes, landforms, coastal management",
      "Our dynamic planet: plate tectonics, earthquakes, volcanoes",
      "Weather and climate: UK weather, tropical storms, climate change",
      "Ecosystems: tropical rainforest, coral reef, deciduous woodland — characteristics, human impact"
    ],
    "Unit 2: Living in Our World": [
      "Population: distribution, change, migration, population policy",
      "Settlement: urban growth, urbanisation, planning issues",
      "Contrasts in development: development indicators, causes of inequality, aid",
      "Tourism: growth, management, sustainable tourism",
      "Managing our natural resources: food, energy and water security"
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Eduqas GCSE SPEC TOPICS
  // ─────────────────────────────────────────────────────────────────────────

  "Eduqas-Computer Science-GCSE": {
    "Component 1: Computer Systems (C500U10-1)": [
      "Hardware and software: components, OS functions, file management",
      "CPU: fetch-decode-execute cycle, registers, cache, clock speed, cores",
      "Memory and storage: RAM, ROM, types of secondary storage",
      "Networks: topologies, types, protocols, TCP/IP, DNS, MAC/IP addresses",
      "Cybersecurity: malware types, social engineering, network security, encryption",
      "Data representation: binary, denary, hexadecimal conversion; ASCII; Unicode",
      "Representing images: pixels, resolution, colour depth; calculating file size",
      "Representing sound: sample rate, bit depth, file size",
      "Compression: lossy, lossless, run-length encoding",
      "Boolean logic: NOT, AND, OR, XOR; truth tables; logic circuits"
    ],
    "Component 2: Computational Thinking and Programming (C500U20-1 — on screen)": [
      "Problem-solving: decomposition, abstraction, pattern recognition, algorithmic design",
      "Programming fundamentals: variables, data types, input/output, arithmetic operators",
      "Sequence, selection (if/elif/else), iteration (while/for)",
      "Subprograms: functions and procedures, parameters, return values",
      "Data structures: arrays, records, stacks, queues",
      "String handling: concatenation, length, slicing, upper/lower",
      "File handling: open, read, write, close",
      "Searching: linear and binary search",
      "Sorting: bubble sort, merge sort",
      "Testing and debugging: trace tables, dry runs"
    ]
  },

  "Eduqas-Mathematics-GCSE": {
    "Component 1: Non-Calculator (F/H) + Component 2: Calculator (F/H)": [
      "Number: integers, fractions, decimals, percentages, surds (H), standard form, indices",
      "Algebra: simplifying, expanding, factorising, equations, inequalities, sequences (nth term)",
      "Proportion: ratio, direct and inverse proportion, percentage problems",
      "Graphs: plotting, gradient, y=mx+c, quadratic, exponential, transformations",
      "Geometry: angle properties, bearings, Pythagoras, trigonometry, circle theorems (H)",
      "Mensuration: area, volume, surface area",
      "Vectors (H)",
      "Probability: Venn diagrams, tree diagrams, conditional probability (H)",
      "Statistics: averages, cumulative frequency, box plots, histograms, correlation"
    ]
  },

  "Eduqas-English Language-GCSE": {
    "Component 1: 21st Century Literature Reading and Creative Prose Writing (C700U10-1)": [
      "Reading: 21st century literary fiction extract",
      "Analysing language and structure for effect",
      "Evaluation of writer's choices",
      "Creative prose writing: descriptive or narrative",
      "Writing craft: vocabulary, grammar, structure"
    ],
    "Component 2: 19th and 21st Century Non-Fiction Reading and Transactional/Persuasive Writing (C700U20-1)": [
      "Reading: two non-fiction texts (19th and 21st century)",
      "Comparing perspectives and methods",
      "Summarising information",
      "Transactional writing: articles, reports, speeches, letters",
      "Audience, purpose and form"
    ]
  },

  "Eduqas-English Literature-GCSE": {
    "Component 1: Shakespeare and Poetry (C720U10-1)": [
      "Shakespeare play: one choice (school decision)",
      "Poetry: collection of poems from the Eduqas anthology",
      "Close textual analysis",
      "Contextual factors",
      "Comparison of poems"
    ],
    "Component 2: Drama, Prose and Unseen Poetry (C720U20-1)": [
      "Post-1914 drama: school choice",
      "19th century prose: school choice",
      "Unseen prose and poetry",
      "Language, structure and form analysis",
      "Thematic exploration"
    ]
  },

  "Eduqas-Biology-GCSE": {
    "Component 1": [
      "Cell structure and organisation: prokaryotic, eukaryotic, cell specialisation",
      "Biological molecules: carbohydrates, lipids, proteins, DNA",
      "Enzymes: specificity, factors, investigations",
      "Cell division: mitosis, meiosis, cancer",
      "Transport: diffusion, osmosis, active transport",
      "Photosynthesis: chloroplasts, light and dark reactions, limiting factors",
      "Respiration: aerobic and anaerobic, ATP"
    ],
    "Component 2": [
      "The nervous system: structure, reflex arcs, voluntary action",
      "Hormonal control: endocrine system, blood glucose (insulin/glucagon), diabetes",
      "Homeostasis: kidney function, thermoregulation",
      "Disease and immunity: pathogens, non-specific and specific defences, vaccines",
      "Genetics: DNA structure, inheritance, genetic diagrams, sex-linked traits",
      "Evolution and ecosystems: natural selection, adaptation, food webs, nutrient cycles",
      "Human impact: biodiversity, conservation, global warming"
    ]
  },

  "Eduqas-Geography A-GCSE": {
    "Component 1: Changing Places — Changing World": [
      "Changing cities: urbanisation, megacities, urban issues and solutions",
      "Changing rural areas: rural depopulation, tourism, development",
      "Changing UK: deindustrialisation, investment, regeneration",
      "Water: supply, demand, water stress, management"
    ],
    "Component 2: Sustaining the Planet": [
      "Ecosystems: tropical rainforests, coral reefs, savanna grasslands",
      "Biodiversity under threat: habitat loss, conservation",
      "Climate change: causes, consequences, mitigation",
      "Natural hazards: tectonic hazards, tropical storms"
    ],
    "Component 3: Distinctive Landscapes": [
      "Coastal landscapes: processes, landforms, management",
      "River landscapes: drainage basins, flooding, valley landforms",
      "Fieldwork: planning, data collection, analysis, evaluation"
    ]
  },

  "Eduqas-History-GCSE": {
    "Component 1: Depth Study": [
      "Options include: The development of the USA 1929–2000, Weimar Germany and Rise of the Third Reich 1918–39",
      "Germany 1933–45: Nazi control, persecution, Second World War consequences",
      "USA: New Deal, civil rights, Cold War, Vietnam",
      "Causation, consequence, change and continuity, significance, evidence"
    ],
    "Component 2: Breadth Study": [
      "Options: Migration and identity in Britain from c.600 to present, or The British Empire from c.1500 to 1968",
      "Change and continuity over an extended time period",
      "Role of individuals, events and factors",
      "Interpretation and evaluation of historical sources"
    ]
  },

}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Get exam dates for a subject/board/qualification */
export function getExamDates(board, subject, qualification) {
  return EXAM_DATES_2026.find(
    e => e.board === board && e.subject === subject && e.qualification === qualification
  ) || null
}

/** Get paper structure (maxMarks, boundaries) for a subject */
export function getPaperStructure(board, subject, qualification, tier = '') {
  const key = tier
    ? `${board}-${subject}-${qualification}-${tier}`
    : `${board}-${subject}-${qualification}`
  return PAPER_STRUCTURES[key] || PAPER_STRUCTURES[`${board}-${subject}-${qualification}`] || null
}

/** Get spec topics for a subject */
export function getSpecTopics(board, subject, qualification) {
  const key = `${board}-${subject}-${qualification}`
  return SPEC_TOPICS[key] || null
}

/** Check if a subject is offered by a board */
export function boardOffersSubject(board, subject, qualification) {
  const q = qualification === 'GCSE' ? 'GCSE' :
            qualification === 'A-Level' ? 'ALEVEL' :
            qualification === 'IGCSE' ? 'IGCSE' : 'GCSE'
  const boardSubjects = BOARD_SUBJECTS[board]?.[q] || []
  return boardSubjects.includes(subject)
}

/** Get grading system for a subject */
export function getGradingSystem(board, subject, qualification) {
  const dates = getExamDates(board, subject, qualification)
  if (dates?.gradingSystem) return GRADING_SYSTEMS[dates.gradingSystem]
  if (qualification === 'A-Level') return GRADING_SYSTEMS.ALEVEL
  if (subject.startsWith('Combined Science')) return GRADING_SYSTEMS.GCSE_COMBINED
  return GRADING_SYSTEMS.GCSE_STANDARD
}

/** Get all grades for a grading system */
export function getGrades(board, subject, qualification) {
  return getGradingSystem(board, subject, qualification).grades
}

export const AVAILABLE_YEARS_GCSE = [2024, 2023, 2022, 2019, 2018]
export const AVAILABLE_YEARS_ALEVEL = [2024, 2023, 2022, 2019, 2018]
// Note: No summer 2020 or 2021 exams were held (teacher-assessed grades due to COVID-19)
