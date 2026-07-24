// src/data/topics.js
// ─────────────────────────────────────────────────────────────────────────────
// AUDIT NOTES (v3 — full audit, depth pass, AS-Level tier added)
// Sources:
//   Maths      → Corbettmaths topic list (corbettmaths.com/contents); official spec content lists
//   Sciences   → Cognito topic list (cognitoedu.org); official spec content lists; required practicals lists
//   CS         → Official AQA/OCR/Edexcel/Eduqas specifications; CSNewbs / 101Computing subtopic naming
//   English    → Official spec anthology/set-text lists; CGP guides for AO-mapped subtopic naming
//   Humanities/Social Sciences → Official specs; Seneca/Tutor2u/PMT subtopic naming for options
//   Languages  → Official theme/sub-theme lists (all reformed GCSE/A-level MFL specs share a common
//                DfE-prescribed theme structure); Seneca for grammar subtopic naming
//   Others     → Official exam board published specifications (2025–27 teaching cycles)
//
// FIXES APPLIED vs v2:
//   - OCR A-Level "Biology A (Salters-Nuffield)" was WRONG — Salters-Nuffield is an Edexcel brand
//     (9BN0). OCR's context-led equivalent is Biology B (Advancing Biology, H422). The topic content
//     already present matched standard OCR Biology A (H420). Key renamed to plain 'Biology' (and
//     OCR Chemistry A / Physics A likewise to 'Chemistry' / 'Physics') to match subjects.js's
//     board-agnostic naming — see v4 notes below for why. Consider adding 'Biology B (Advancing
//     Biology)' as a separate subject later if the app ever needs to distinguish OCR's two Biology routes.
//   - AQA GCSE/A-Level: every subject audited against the live spec content list and expanded with
//     additional granular subtopics (aiming for Corbettmaths/Cognito-level atomicity) without removing
//     or renaming any existing, correct entries.
//   - Edexcel/OCR/Eduqas-WJEC/CCEA GCSE: expanded from paper-level summaries to full subtopic lists.
//   - Edexcel/OCR/Eduqas-WJEC/CCEA A-Level: these were mostly 1-line-per-paper placeholders — rebuilt
//     as full subtopic lists matching the depth of the AQA A-Level entries.
//   - Exam board specification codes were verified directly via web search where flagged as uncertain
//     (confirming, e.g., AQA's AS/A-level code pairing pattern) and applied consistently elsewhere;
//     treat codes in comments as a strong guide rather than a guarantee — cross-check against the
//     live specification before relying on a code for entries/timetabling.
//
// NEW IN v3:
//   - Added `ASLEVEL` as a fully independent top-level object (same shape as GCSE / ALEVEL), sitting
//     between them. AS-Level is NOT a copy of Year 1 of the A-Level: for AQA/Edexcel/OCR/Eduqas, AS is
//     a decoupled, standalone qualification with its own spec code and a genuinely narrower content
//     list (official specs mark content "A-level only" — that content is excluded here). For CCEA,
//     AS was never decoupled — AS there = Units 1 & 2 of the linear 4-unit A-level, so the ASLEVEL
//     CCEA entries below are the first-half units, independently written out (not a reference/pointer
//     into ALEVEL.CCEA).
//   - GCSE and A-Level entries for the same subject remain (and always were) fully separate objects —
//     GCSE.AQA.Mathematics and ALEVEL.AQA.Mathematics share no data or references. ASLEVEL.AQA.Mathematics
//     is likewise its own independent object. This separation is structural (three separate top-level
//     consts), not just a naming convention, so the three can never be mixed up programmatically.
//   - Helper functions updated to resolve 'AS-Level' / 'ASLEVEL' / 'AS_LEVEL' to the new ASLEVEL object,
//     alongside the existing GCSE / A-Level resolution, with the same alias fallback behaviour.
//
// NEW IN v4 (reconciliation against companion subjects.js):
//   - Systematically diffed every subject key here against GCSE_SUBJECTS / ALEVEL_SUBJECTS in
//     subjects.js. Renamed OCR's 'Biology A' / 'Chemistry A' / 'Physics A' to plain 'Biology' /
//     'Chemistry' / 'Physics' (subjects.js — and real 2026 exam timetables in common usage — use
//     the board-agnostic name; the OCR-specific "A" survives only in the code comment now).
//   - Added five previously-missing A-Level subjects that ALEVEL_SUBJECTS already listed but no
//     board had any content for (confirmed live via 2026 spec/timetable checks, not assumed):
//     AQA Environmental Science (7447 — "currently our fastest-growing science qualification" per
//     AQA, not a legacy/discontinued subject as might be assumed), AQA English Language & Literature
//     (7707), AQA Design and Technology: Product Design (7552 — this is ONE subject with a compound
//     title, not two; see subjects.js note), Edexcel Arabic (9AA0) and Chinese (9CN0), and Eduqas
//     Film Studies. Matching AS-Level entries added where the board offers a standalone AS.
//   - Did NOT add an A-Level 'Engineering' entry: no evidence of a current standalone A-Level
//     Engineering qualification from AQA/Edexcel/OCR/Eduqas/CCEA turned up in live 2026 specs or
//     exam timetables. Flagged in subjects.js rather than silently added here.
//
// A NOTE ON SOURCING SUBTOPIC NAMES:
//   Where an official specification lists content only as dense prose (common in AQA/Edexcel GCSE
//   Humanities and Eduqas/CCEA specs generally), subtopic names below are adapted from how CGP,
//   Cognito, Seneca, Corbettmaths, Tutor2u and Save My Exams break the same prose into revision-list
//   form — reworded where needed to stay inside the exact terminology of the specification.
// ─────────────────────────────────────────────────────────────────────────────

const GCSE = {

  // ── AQA ────────────────────────────────────────────────────────────────────
  AQA: {

    // ── Mathematics (AQA 8300 — Corbettmaths topic list, cross-checked vs spec) ─
    'Mathematics': { papers: {
      1: [ // Non-calculator — largely Number and Algebra heavy
        // NUMBER
        'Number – Integers: Order of Operations (BIDMAS)',
        'Number – Integers: Negative Numbers, Directed Number Arithmetic',
        'Number – Integers: Types of Number (Factors, Multiples, Primes, Square, Cube, Triangular)',
        'Number – Integers: Prime Factors, HCF and LCM (including Venn Diagram Method)',
        'Number – Integers: Powers and Roots',
        'Number – Integers: Standard Form (Converting To and From, Ordering)',
        'Number – Integers: Standard Form Calculations (Multiplying and Dividing)',
        'Number – Fractions: Operations with Fractions (+ − × ÷, Mixed Numbers)',
        'Number – Fractions: Fraction of an Amount',
        'Number – Fractions: Converting Recurring Decimals to Fractions (Higher)',
        'Number – Decimals: Rounding and Significant Figures',
        'Number – Decimals: Estimation and Approximation',
        'Number – Decimals: Upper and Lower Bounds (Higher)',
        'Number – Percentages: Percentage of an Amount (Calculator and Non-Calculator Methods)',
        'Number – Percentages: Percentage Change and Reverse Percentages',
        'Number – Percentages: Simple and Compound Interest',
        'Number – Percentages: Growth and Decay (Compound Growth/Decay Formula, Higher)',
        'Number – Ratio: Simplifying, Dividing in a Ratio, 1:n Form',
        'Number – Ratio: Combining Ratios, Ratio Problems Involving Algebra (Higher)',
        'Number – Proportion: Direct and Inverse Proportion (including Graphically)',
        'Number – Proportion: Proportion Formulae (y = kx, y = k/x², Higher)',
        'Number – Proportion: Best Buy, Exchange Rates and Unit Pricing',
        'Number – Surds: Simplifying, Rationalising the Denominator (Higher)',
        'Number – Bounds: Error Intervals and Bounds Calculations (Higher)',
        'Number – Listing Strategies: Systematic Listing, Product Rule for Counting',
        // ALGEBRA
        'Algebra – Expressions: Simplifying, Collecting Like Terms, Index Laws',
        'Algebra – Expressions: Expanding Single and Double Brackets, Factorising',
        'Algebra – Expressions: Expanding Three Brackets (Higher)',
        'Algebra – Expressions: Difference of Two Squares, Completing the Square (Higher)',
        'Algebra – Expressions: Simplifying Algebraic Fractions (Higher)',
        'Algebra – Formulae: Substituting into Formulae, Changing the Subject',
        'Algebra – Formulae: Changing the Subject Where the Subject Appears Twice (Higher)',
        'Algebra – Sequences: nth Term of Linear Sequences',
        'Algebra – Sequences: nth Term of Quadratic Sequences (Higher)',
        'Algebra – Sequences: Geometric Sequences and Special Sequences (Fibonacci, Triangular)',
        'Algebra – Linear Equations: Solving One and Two-Step Equations',
        'Algebra – Linear Equations: Equations with Brackets and Unknowns on Both Sides',
        'Algebra – Linear Equations: Forming and Solving Equations from Context',
        'Algebra – Quadratics: Factorising x² + bx + c',
        'Algebra – Quadratics: Factorising ax² + bx + c (Higher)',
        'Algebra – Quadratics: Quadratic Formula and Completing the Square (Higher)',
        'Algebra – Quadratics: Solving by Factorising, Formula and Graphically',
        'Algebra – Inequalities: Solving Linear Inequalities, Number Lines',
        'Algebra – Inequalities: Solving Quadratic Inequalities (Higher)',
        'Algebra – Simultaneous Equations: Substitution and Elimination (Linear)',
        'Algebra – Simultaneous Equations: One Linear, One Quadratic (Higher)',
        'Algebra – Functions: Function Notation, Composite and Inverse Functions (Higher)',
        'Algebra – Algebraic Proof (Higher)',
        'Algebra – Iteration: Iterative Methods to Solve Equations (Higher)',
        // RATIO AND PROPORTION
        'Ratio and Proportion – Speed, Distance, Time',
        'Ratio and Proportion – Density, Mass, Volume',
        'Ratio and Proportion – Pressure, Force, Area',
        'Ratio and Proportion – Converting Compound Units',
      ],
      2: [ // Calculator — Geometry, Graphs and Statistics
        // GRAPHS
        'Graphs – Coordinates and Midpoints',
        'Graphs – Straight Line Graphs: y = mx + c, Gradient and Intercept',
        'Graphs – Straight Line Graphs: Equation of a Line from a Point and Gradient',
        'Graphs – Straight Line Graphs: Parallel and Perpendicular Lines (Higher)',
        'Graphs – Quadratic Graphs: Plotting and Interpreting, Turning Points',
        'Graphs – Cubic, Reciprocal and Exponential Graphs',
        'Graphs – Circle Graphs: x² + y² = r² and Tangents (Higher)',
        'Graphs – Transformation of Graphs: f(x) + a, f(x + a), af(x), f(ax) (Higher)',
        'Graphs – Real-Life Graphs: Distance-Time, Velocity-Time',
        'Graphs – Area Under a Curve and Gradient at a Point (Higher)',
        'Graphs – Solving Simultaneous Equations Graphically',
        'Graphs – Inequalities on Graphs: Shading Regions (Higher)',
        'Graphs – Trigonometric Graphs: sin, cos and tan for Any Angle (Higher)',
        // GEOMETRY
        'Geometry – Angles: Angles in Triangles, Quadrilaterals and Polygons',
        'Geometry – Angles: Parallel Lines (Alternate, Corresponding, Co-interior)',
        'Geometry – Angles: Interior and Exterior Angles of Polygons',
        'Geometry – Angles: Bearings',
        'Geometry – Properties of 2D Shapes: Triangles and Quadrilaterals',
        'Geometry – Properties of 3D Shapes: Prisms, Pyramids, Cylinders, Cones, Spheres',
        'Geometry – Plans and Elevations',
        'Geometry – Perimeter and Area: Rectangles, Triangles, Parallelograms, Trapeziums',
        'Geometry – Perimeter and Area: Circles (Circumference and Area)',
        'Geometry – Perimeter and Area: Sectors and Arc Lengths',
        'Geometry – Perimeter and Area: Compound Shapes',
        'Geometry – Volume and Surface Area: Cuboids, Prisms, Cylinders',
        'Geometry – Volume and Surface Area: Pyramids, Cones and Spheres (Higher)',
        'Geometry – Similar Shapes: Area and Volume Scale Factors (Higher)',
        'Geometry – Pythagoras\' Theorem (2D)',
        'Geometry – Pythagoras\' Theorem and Trigonometry in 3D (Higher)',
        'Geometry – Trigonometry: SOH CAH TOA',
        'Geometry – Trigonometry: Exact Values (30°, 45°, 60°)',
        'Geometry – Trigonometry: Sine Rule and Cosine Rule (Higher)',
        'Geometry – Trigonometry: Area of Triangle using ½ab sinC (Higher)',
        'Geometry – Transformations: Reflection, Rotation, Translation, Enlargement (incl. Negative SF, Higher)',
        'Geometry – Transformations: Describing Transformations, Combinations of Transformations',
        'Geometry – Congruence: SSS, SAS, ASA, RHS and Congruence Proofs (Higher)',
        'Geometry – Similarity: Similar Triangles and Similarity Proofs',
        'Geometry – Constructions: Perpendicular/Angle Bisectors, Loci',
        'Geometry – Vectors: Vector Notation, Addition and Scalar Multiples (Higher)',
        'Geometry – Vectors: Vector Geometry Proofs (Higher)',
        'Geometry – Circle Theorems (Higher)',
        // STATISTICS AND PROBABILITY
        'Statistics – Data: Sampling Methods, Populations and Samples',
        'Statistics – Data: Averages (Mean, Median, Mode) and Range from a List',
        'Statistics – Data: Averages from Frequency Tables and Grouped Frequency Tables',
        'Statistics – Data: Comparing Data Sets Using Averages and Range',
        'Statistics – Data: Two-Way Tables',
        'Statistics – Data: Bar Charts, Pie Charts, Frequency Polygons',
        'Statistics – Data: Scatter Graphs and Correlation, Line of Best Fit',
        'Statistics – Data: Time Series and Moving Averages',
        'Statistics – Data: Cumulative Frequency Diagrams and Box Plots',
        'Statistics – Data: Histograms with Unequal Class Widths (Frequency Density, Higher)',
        'Probability – Basic: Probability Scale, Listing Outcomes, Sample Space Diagrams',
        'Probability – Relative Frequency and Experimental Probability',
        'Probability – Combined Events: AND/OR Rules, Tree Diagrams (Independent and Dependent)',
        'Probability – Venn Diagrams and Set Notation',
        'Probability – Conditional Probability (Higher)',
      ],
    }},

    // ── Further Mathematics (AQA Level 2 Certificate 8365) ──────────────────
    // Both papers assess ANY part of the spec — topics below reflect the full
    // spec grouped by the 6 official content areas, not by paper.
    // Paper 1: non-calculator | Paper 2: calculator (each 1h45m, 80 marks)
    'Further Mathematics': { papers: {
      1: [
        // 1. Number
        'Number – Product Rule for Counting',
        'Number – Surds: Simplification, Rationalising the Denominator, Exact Calculations',
        'Number – Surds: Expanding Brackets Involving Surds',
        // 2. Algebra
        'Algebra – Basic Algebraic Processes: Associative, Commutative and Distributive Laws',
        'Algebra – Functions: Definition, Domain and Range',
        'Algebra – Composite and Inverse Functions',
        'Algebra – Expanding Brackets and Collecting Like Terms (including Cubics)',
        'Algebra – Binomial Expansion: (a + b)ⁿ for Positive Integer n, Pascal\'s Triangle',
        'Algebra – Factorising: Quadratics, Cubics, Difference of Two Squares',
        'Algebra – Algebraic Fractions: Simplification, Addition, Subtraction, Multiplication, Division',
        'Algebra – Rearranging Formulae (including Subject Appearing Twice)',
        'Algebra – Factor Theorem for Polynomials',
        'Algebra – Completing the Square',
        'Algebra – Graphs: Linear, Quadratic, Exponential (y = abˣ), Piecewise Functions',
        'Algebra – Graphs: Cubic and Reciprocal Graphs, Points of Intersection',
        'Algebra – Solving Linear and Quadratic Equations',
        'Algebra – Simultaneous Equations: Two Linear, or One Linear and One Quadratic',
        'Algebra – Linear Equations in Three Unknowns',
        'Algebra – Linear and Quadratic Inequalities',
        'Algebra – Index Laws: Fractional and Negative Indices',
        'Algebra – Algebraic Proof',
        'Algebra – Sequences: nth Term of Linear and Quadratic Sequences',
        'Algebra – Sequences: Limiting Value as n → ∞',
        // 3. Coordinate Geometry
        'Coordinate Geometry – Straight Lines: Gradient, Parallel and Perpendicular Lines',
        'Coordinate Geometry – Straight Lines: Distance Between Two Points (Pythagoras)',
        'Coordinate Geometry – Straight Lines: Dividing a Line in a Given Ratio, Midpoint',
        'Coordinate Geometry – Straight Lines: Equation of a Line (y = mx + c and y − y₁ = m(x − x₁))',
        'Coordinate Geometry – Circles: x² + y² = r² and (x − a)² + (y − b)² = r²',
        'Coordinate Geometry – Circles: Tangent at a Point, Circle Geometry Theorems',
      ],
      2: [
        // 4. Calculus (Differentiation only — no integration in this spec)
        'Calculus – Differentiation: Gradient Function dy/dx, Rate of Change',
        'Calculus – Differentiation: Differentiating kxⁿ (n an integer) and Sums of Such Terms',
        'Calculus – Differentiation: Equation of Tangent and Normal at a Point on a Curve',
        'Calculus – Differentiation: Increasing and Decreasing Functions',
        'Calculus – Differentiation: Second Derivative d²y/dx², Maxima and Minima',
        'Calculus – Differentiation: Applied Optimisation Problems',
        'Calculus – Differentiation: Sketching Curves with Known Turning Points',
        // 5. Matrix Transformations (2×2 and 2×1 only)
        'Matrices – Multiplication of 2×2 and 2×1 Matrices; Scalar Multiplication',
        'Matrices – The Identity Matrix I (2×2)',
        'Matrices – Transformations of the Unit Square: Rotations (90°, 180°, 270°), Reflections (x=0, y=0, y=x, y=−x), Enlargements',
        'Matrices – Combinations of Transformations Using Matrix Multiplication',
        // 6. Geometry
        'Geometry – Perimeter, Area (rectangles, circles, triangles, parallelograms, trapezia)',
        'Geometry – Surface Area and Volume (prisms, cylinders, spheres, cones, pyramids)',
        'Geometry – Angle Properties: Parallel Lines, Triangles, Quadrilaterals, Polygons',
        'Geometry – Circle Theorems: Angle at Centre, Same Segment, Cyclic Quadrilateral, Alternate Segment',
        'Geometry – Geometric Proof Using Formal Arguments',
        'Geometry – Sine Rule, Cosine Rule, Area = ½ab sinC',
        'Geometry – Pythagoras\' Theorem in 2D and 3D; Pythagorean Triples',
        'Geometry – Trigonometry in 2D and 3D Problems (including angle between line and plane)',
        'Geometry – Graphs of y = sin x, y = cos x, y = tan x for Any Angle',
        'Geometry – sin θ, cos θ, tan θ for Angles 0°–360°; Exact Values for 30°, 45°, 60°',
        'Geometry – Trigonometric Identities: tan θ = sin θ / cos θ and sin²θ + cos²θ = 1',
        'Geometry – Solving Simple Trigonometric Equations in a Given Interval',
      ],
    }},

    // ── Statistics ────────────────────────────────────────────────────────────
    // AQA GCSE Statistics 8382 — both papers assess ALL content (tiered Foundation/Higher)
    // Paper 1 and Paper 2 are identical in structure; topics below cover the full spec
    'Statistics': { papers: {
      1: [
        // Section A – Planning
        'Planning – Hypothesis Testing: Defining a Question or Hypothesis',
        'Planning – Constraints: Time, Cost, Ethics, Confidentiality, Non-Response',
        'Planning – Statistical Enquiry Cycle (SEC): Planning, Collection, Processing, Interpretation, Evaluation',
        'Planning – Types of Study: Census vs Sample, Pilot Studies',
        // Section B – Data Collection
        'Data Collection – Types of Data: Qualitative, Quantitative, Discrete, Continuous, Categorical, Ordinal, Bivariate',
        'Data Collection – Primary vs Secondary Data; Reliability and Validity',
        'Data Collection – Sampling Methods: Random, Systematic, Stratified, Quota, Opportunity/Convenience',
        'Data Collection – Questionnaire Design: Leading Questions, Open/Closed, Bias, Response Issues',
        'Data Collection – Identifying and Controlling Extraneous Variables; Control Groups',
        'Data Collection – Data Cleaning: Missing Data, Incorrect Formats, Non-Responses',
        'Data Collection – Experimental Design: Matched Pairs, Independent Groups',
        // Section C – Data Presentation
        'Data Presentation – Tabulation, Tally, Pictogram, Pie Chart, Stem-and-Leaf (including Back-to-Back)',
        'Data Presentation – Bar Charts (Dual, Composite, Percentage); Frequency Polygons',
        'Data Presentation – Cumulative Frequency Graphs; Box Plots and Outliers',
        'Data Presentation – Choropleth Maps and Population Pyramids',
      ],
      2: [
        // Section D – Data Processing/Measures
        'Data Processing – Averages: Mean, Median, Mode from Raw, Tabulated and Grouped Data',
        'Data Processing – Measures of Spread: Range, Interquartile Range, Interpercentile Range',
        'Data Processing – Standard Deviation: Calculating From a List and From a Frequency Table',
        'Data Processing – Index Numbers and Weighted Index Numbers',
        'Data Processing – Time Series: Moving Averages, Trend Lines, Seasonal Variation',
        'Data Processing – Quality Assurance and Quality Control; Control Charts',
        // Section E – Data Interpretation
        'Data Interpretation – Correlation: Scatter Diagrams, Line of Best Fit, Types of Correlation',
        'Data Interpretation – Correlation vs Causation; Interpolation and Extrapolation',
        'Data Interpretation – Comparing Distributions Using Averages, Spread and Skew',
        'Data Interpretation – The Normal Distribution: Shape and Estimating Proportions (Higher)',
        'Data Interpretation – Standardised Scores (z-Scores, Higher)',
        // Section F – Probability
        'Probability – Basic Probability, Sample Space Diagrams, Relative Frequency',
        'Probability – Venn Diagrams, Two-Way Tables and Set Notation',
        'Probability – Tree Diagrams: Independent and Dependent (Conditional) Events (Higher)',
      ],
    }},

    // ── English Language (AQA 8700) ───────────────────────────────────────────
    'English Language': { papers: {
      1: [ // Explorations in Creative Reading and Writing
        'Reading – Q1: List / Identify Explicit and Implicit Information (AO1)',
        'Reading – Q2: Language Analysis — Writer\'s Methods and Effects on Reader (AO2)',
        'Reading – Q3: Structural Analysis — Structural Features and Effects (AO2)',
        'Reading – Q4: Critical Evaluation of a Fiction Text — "To what extent..." (AO4)',
        'Writing – Q5: Descriptive Writing (AO5/AO6)',
        'Writing – Q5: Narrative Writing (AO5/AO6)',
        'Writing Skills – Descriptive Techniques: Sensory Detail, Atmosphere, Pathetic Fallacy',
        'Writing Skills – Narrative Techniques: Structure, Perspective, Tension',
        'Writing Skills – Technical Accuracy: Punctuation, Spelling, Sentence Variety (AO6)',
        'Reading Skills – Identifying and Naming Language Devices (Metaphor, Simile, Personification, Imagery)',
        'Reading Skills – Analysing Word Classes and Their Effect (Verbs, Adjectives, Adverbs)',
      ],
      2: [ // Writers' Viewpoints and Perspectives
        'Reading – Q1: Identify True Statements from Non-Fiction Source (AO1)',
        'Reading – Q2: Summary — Differences Between Two Non-Fiction Sources (AO1)',
        'Reading – Q3: Language Analysis — Writer\'s Methods in Non-Fiction Text (AO2)',
        'Reading – Q4: Compare Writers\' Viewpoints and Perspectives (AO3)',
        'Writing – Q5: Viewpoint and Argument Writing — Letter, Article, Speech, Essay (AO5/AO6)',
        'Writing Skills – Persuasive Techniques: DAFOREST, Rhetorical Devices',
        'Writing Skills – Register, Tone and Purpose (Formal and Informal)',
        'Writing Skills – Technical Accuracy: Grammar, Cohesion, Discourse Markers (AO6)',
        'Reading Skills – Comparing Attitudes, Tone and Perspective Across 19th- and 21st-Century Texts',
      ],
      3: [ // Spoken Language Endorsement — separately reported, non-exam
        'Spoken Language Endorsement (NEA) – Presenting: Individual Presentation on a Chosen Topic',
        'Spoken Language Endorsement (NEA) – Responding to Questions and Feedback',
        'Spoken Language Endorsement (NEA) – Use of Standard English; Assessed Separately, Not Counted in Final Grade',
      ],
    }},

    // ── English Literature (AQA 8702) ─────────────────────────────────────────
    'English Literature': { papers: {
      1: [ // Shakespeare and the 19th-Century Novel / Modern Drama
        // Shakespeare
        'Macbeth – Themes: Ambition and Power',
        'Macbeth – Themes: Fate and the Supernatural',
        'Macbeth – Themes: Guilt and Conscience',
        'Macbeth – Themes: Gender and Masculinity',
        'Macbeth – Character: Macbeth — Tragic Hero',
        'Macbeth – Character: Lady Macbeth — Ambition and Guilt',
        'Macbeth – Character: The Witches and the Supernatural',
        'Macbeth – Context: Jacobean Society, Divine Right of Kings, Gunpowder Plot',
        'Macbeth – Language and Structure: Key Quotation Analysis',
        'Macbeth – Form: Tragedy Conventions, Blank Verse and Prose',
        // 19th Century Novel (most common: A Christmas Carol)
        'A Christmas Carol – Themes: Social Responsibility and Poverty',
        'A Christmas Carol – Themes: Redemption and Transformation',
        'A Christmas Carol – Themes: Memory and the Past',
        'A Christmas Carol – Character: Ebenezer Scrooge (Before and After)',
        'A Christmas Carol – Character: The Three Spirits',
        'A Christmas Carol – Character: Bob Cratchit and Tiny Tim',
        'A Christmas Carol – Context: Victorian England, the Poor Laws, Malthus',
        'A Christmas Carol – Language: Dickens\' Use of Gothic and Festive Imagery',
        'A Christmas Carol – Structure: Novella Form, Stave Structure',
        // Modern Prose/Drama (most common: An Inspector Calls)
        'An Inspector Calls – Themes: Social Class and Responsibility',
        'An Inspector Calls – Themes: Gender, Age and Generational Conflict',
        'An Inspector Calls – Themes: Guilt and Blame',
        'An Inspector Calls – Character: Inspector Goole — Function and Symbolism',
        'An Inspector Calls – Character: Arthur and Sybil Birling (Older Generation)',
        'An Inspector Calls – Character: Sheila and Eric Birling (Younger Generation)',
        'An Inspector Calls – Character: Eva Smith — Voice of the Oppressed',
        'An Inspector Calls – Context: 1912 Setting vs 1945 Audience — Dramatic Irony',
        'An Inspector Calls – Context: Priestley\'s Socialism, Capitalism vs Collective Responsibility',
        'An Inspector Calls – Structure: Cliff-hangers, Time Frame, Three Unities',
        // Essay Technique
        'Essay Technique: Embedding Quotations and Zooming In on Language',
        'Essay Technique: Exploring Multiple Interpretations (AO3)',
        'Essay Technique: Linking Context to Meaning (AO3)',
        'Essay Technique: Planning a Whole-Text Response Under Timed Conditions',
      ],
      2: [ // Poetry — Power and Conflict
        'Power and Conflict – Ozymandias (Shelley): Power, Hubris, Transience',
        'Power and Conflict – London (Blake): Industrial Oppression, Social Criticism',
        'Power and Conflict – The Prelude: Stealing the Boat (Wordsworth): Nature, Power, Guilt',
        'Power and Conflict – My Last Duchess (Browning): Control, Patriarchy, Dramatic Monologue',
        'Power and Conflict – The Charge of the Light Brigade (Tennyson): Conflict, Heroism',
        'Power and Conflict – Exposure (Owen): Futility of War, Nature as Enemy',
        'Power and Conflict – Storm on the Island (Heaney): Nature\'s Power, Fear',
        'Power and Conflict – Bayonet Charge (Hughes): Chaos of War, Dehumanisation',
        'Power and Conflict – Remains (Armitage): PTSD, Guilt, Memory',
        'Power and Conflict – Poppies (Weir): Grief, Loss, Mother\'s Perspective',
        'Power and Conflict – War Photographer (Duffy): Conflict, Responsibility, Media',
        'Power and Conflict – Tissue (Dharker): Power of Paper, Fragility of Structures',
        'Power and Conflict – The Emigrée (Rumens): Identity, Displacement, Memory',
        'Power and Conflict – Kamikaze (Garland): Conflict, Honour, Sacrifice, Family Rejection',
        'Power and Conflict – Checking Out Me History (Agard): Identity, Colonial Power',
        'Poetry Skills – Comparing Two Poems: Theme, Method, Effect',
        'Poetry Skills – Comparing Form and Structure Across the Anthology',
        'Unseen Poetry – Analysing an Unfamiliar Poem (Structure, Language, Tone)',
        'Unseen Poetry – Comparing Two Unseen Poems',
      ],
    }},

    // ── Biology (AQA 8461 — Cognito topic list) ───────────────────────────────
    'Biology': { papers: {
      1: [
        // B1 Cell Biology
        'B1 – Cell Structure: Eukaryotic and Prokaryotic Cells',
        'B1 – Cell Structure: Differences Between Animal, Plant and Bacterial Cells',
        'B1 – Cell Structure: Specialised Cells (Sperm, Egg, Red Blood, Nerve)',
        'B1 – Cell Structure: Cell Differentiation in Animals and Plants',
        'B1 – Microscopy: Light and Electron Microscopes, Magnification Calculations',
        'B1 – Cell Division: Mitosis and the Cell Cycle',
        'B1 – Cell Division: Stem Cells (Embryonic, Adult, Therapeutic Cloning)',
        'B1 – Transport in Cells: Diffusion',
        'B1 – Transport in Cells: Osmosis (including calculations)',
        'B1 – Transport in Cells: Active Transport',
        'B1 – Culturing Microorganisms: Aseptic Technique and Agar Plates (Higher)',
        // B2 Organisation
        'B2 – Organisation: Levels of Organisation (Cell → Organ System)',
        'B2 – Enzymes: Lock and Key Theory, Activation Energy',
        'B2 – Enzymes: Effect of Temperature and pH on Enzyme Activity',
        'B2 – Digestion: The Human Digestive System and Digestive Enzymes',
        'B2 – Digestion: Food Tests (Benedict\'s, Biuret, Iodine, Ethanol Emulsion)',
        'B2 – Heart: Structure of the Heart, Coronary Arteries',
        'B2 – Heart: The Cardiac Cycle, Heart Rate',
        'B2 – Blood: Blood Vessels (Arteries, Veins, Capillaries)',
        'B2 – Blood: Components of Blood and Their Functions',
        'B2 – Health and Disease: Communicable and Non-Communicable Disease',
        'B2 – Health and Disease: Risk Factors for Cancer and Cardiovascular Disease',
        'B2 – Health and Disease: Treating Cardiovascular Disease (Stents, Statins, Transplants)',
        'B2 – Plants: Leaf Structure and Adaptations',
        'B2 – Plants: Transpiration and Translocation',
        // B3 Infection and Response
        'B3 – Infection: Bacteria, Viruses, Fungi and Protists as Pathogens',
        'B3 – Infection: Viral Diseases (Measles, HIV, Tobacco Mosaic Virus)',
        'B3 – Infection: Bacterial Diseases (Salmonella, Gonorrhoea)',
        'B3 – Infection: Fungal Diseases (Rose Black Spot)',
        'B3 – Infection: Protist Diseases (Malaria)',
        'B3 – Defence: Physical Barriers, Immune Response, Memory Cells',
        'B3 – Defence: Vaccination and Herd Immunity',
        'B3 – Medicines: Antibiotics, Painkillers, Drug Development and Trials',
        'B3 – Medicines: Monoclonal Antibodies and Their Uses',
        'B3 – Medicines: Plant Defences and Plant Disease Detection (Higher)',
        // B4 Bioenergetics
        'B4 – Photosynthesis: The Equation and Rate-Limiting Factors',
        'B4 – Photosynthesis: Light Intensity, CO₂ Concentration, Temperature',
        'B4 – Photosynthesis: Inverse Square Law and Graphs (Higher)',
        'B4 – Photosynthesis: Uses of Glucose in Plants',
        'B4 – Respiration: Aerobic Respiration Equation',
        'B4 – Respiration: Anaerobic Respiration (Lactic Acid and Ethanol)',
        'B4 – Respiration: Metabolism and the Effects of Exercise',
        // Required Practicals
        'Required Practical 1 – Microscopy: Preparing and Observing Cells',
        'Required Practical 2 – Osmosis in Plant Tissue (Potato Chips)',
        'Required Practical 3 – Food Tests (Benedict\'s, Biuret, Iodine)',
        'Required Practical 4 – Effect of pH on Enzyme Activity',
        'Required Practical 5 – Photosynthesis: Effect of Light Intensity',
        'Required Practical 6 – Respiration Rate in Yeast',
      ],
      2: [
        // B5 Homeostasis and Response
        'B5 – Homeostasis: Definition and Principles of Control Systems',
        'B5 – Nervous System: The CNS, Neurons, Reflex Arc',
        'B5 – Nervous System: The Brain and Brain Scanning Techniques',
        'B5 – The Eye: Structure, Accommodation, Defects and Correction',
        'B5 – Hormonal Coordination: The Endocrine System and Key Glands',
        'B5 – Hormonal Coordination: Blood Glucose Regulation (Insulin and Glucagon)',
        'B5 – Hormonal Coordination: Diabetes (Type 1 and Type 2)',
        'B5 – Hormonal Coordination: Menstrual Cycle (FSH, LH, Oestrogen, Progesterone)',
        'B5 – Hormonal Coordination: Contraception Methods (Hormonal and Non-Hormonal)',
        'B5 – Hormonal Coordination: Fertility Treatments (IVF)',
        'B5 – Kidneys: Structure and Ultrafiltration',
        'B5 – Kidneys: Selective Reabsorption, ADH and Osmoregulation',
        'B5 – Kidneys: Dialysis and Kidney Transplants (Higher)',
        'B5 – Temperature Regulation: Sweating, Vasodilation/Vasoconstriction',
        'B5 – Plant Hormones: Auxin and Phototropism, Gibberellins, Ethene',
        // B6 Inheritance, Variation and Evolution
        'B6 – Reproduction: Sexual and Asexual Reproduction',
        'B6 – Reproduction: Meiosis (Higher)',
        'B6 – DNA: Structure of DNA, Genes and Chromosomes',
        'B6 – DNA: The Genome and Genome Sequencing (Higher)',
        'B6 – DNA: Protein Synthesis (Transcription and Translation — Higher)',
        'B6 – Inheritance: Monohybrid Crosses, Punnett Squares',
        'B6 – Inheritance: Dominant and Recessive Alleles, Genotype and Phenotype',
        'B6 – Inheritance: Sex Determination and Sex-Linked Traits (Higher)',
        'B6 – Inheritance: Inherited Disorders (Cystic Fibrosis, Polydactyly)',
        'B6 – Variation: Genetic and Environmental Variation, Mutations',
        'B6 – Evolution: Natural Selection and Darwin\'s Theory',
        'B6 – Evolution: Speciation (Higher)',
        'B6 – Evolution: Selective Breeding and Genetic Engineering',
        'B6 – Evolution: Genetic Engineering Techniques and GM Crops (Higher)',
        'B6 – Evolution: Evidence for Evolution (Fossil Record, Antibiotic Resistance)',
        'B6 – Classification: Binomial Nomenclature, Kingdoms and the 3-Domain System',
        // B7 Ecology
        'B7 – Ecosystems: Abiotic and Biotic Factors',
        'B7 – Ecosystems: Feeding Relationships, Food Chains and Webs',
        'B7 – Ecosystems: Levels of Organisation (Individual → Ecosystem)',
        'B7 – Material Cycles: Carbon Cycle',
        'B7 – Material Cycles: Water Cycle',
        'B7 – Material Cycles: Nitrogen Cycle (Decomposition, Higher)',
        'B7 – Population Dynamics: Predator-Prey Relationships',
        'B7 – Biodiversity: Threats and Conservation Methods',
        'B7 – Biodiversity: Global Warming and Maintaining Ecosystems (Higher)',
        'B7 – Food Production: Intensive Farming vs Organic Methods',
        'B7 – Food Production: Biological Control and Fungal Protein (Mycoprotein)',
        'B7 – Food Production: Sustainable Fisheries and Farming (Higher)',
        // Required Practicals
        'Required Practical 7 – Reaction Time: Effect of a Factor on Reaction Time',
        'Required Practical 8 – Plant Tropisms: Effect of Light/Gravity on Plant Growth',
        'Required Practical 9 – Quadrats and Transects: Estimating Population Size',
      ],
    }},

    // ── Chemistry (AQA 8462 — Cognito topic list) ─────────────────────────────
    'Chemistry': { papers: {
      1: [
        // C1 Atomic Structure
        'C1 – Atomic Structure: History of the Atom (Dalton to Bohr)',
        'C1 – Atomic Structure: Sub-atomic Particles (Protons, Neutrons, Electrons)',
        'C1 – Atomic Structure: Atomic Number, Mass Number and Isotopes',
        'C1 – Atomic Structure: Electronic Structure (Shells and Sub-shells — Higher)',
        'C1 – Atomic Structure: Relative Atomic Mass from Isotopic Abundance (Higher)',
        // C1 Periodic Table
        'C1 – The Periodic Table: Development (Newlands, Mendeleev)',
        'C1 – The Periodic Table: Trends in Properties Across Periods and Groups',
        'C1 – The Periodic Table: Group 1 — Alkali Metals (Reactivity Trend, Reactions)',
        'C1 – The Periodic Table: Group 7 — Halogens (Reactivity, Displacement Reactions)',
        'C1 – The Periodic Table: Group 0 — Noble Gases (Properties and Uses)',
        'C1 – The Periodic Table: Transition Metals (Properties, Complex Ions)',
        // C2 Bonding
        'C2 – Bonding: Ionic Bonding (Dot-and-Cross Diagrams)',
        'C2 – Bonding: Giant Ionic Structures (Properties)',
        'C2 – Bonding: Covalent Bonding (Dot-and-Cross Diagrams)',
        'C2 – Bonding: Simple Molecular Covalent Structures (Low Melting Point)',
        'C2 – Bonding: Giant Covalent Structures (Diamond, Graphite, Graphene, Silicon Dioxide)',
        'C2 – Bonding: Metallic Bonding and Properties of Metals',
        'C2 – Structure: Nanoparticles and Fullerenes',
        'C2 – Structure: Polymers (Properties and Disposal)',
        'C2 – Structure: Alloys',
        'C2 – Structure: The Three States of Matter and Limitations of the Simple Particle Model (Higher)',
        // C3 Quantitative Chemistry
        'C3 – Quantitative Chemistry: Conservation of Mass and Balancing Equations',
        'C3 – Quantitative Chemistry: Relative Atomic Mass (Ar) and Relative Formula Mass (Mr)',
        'C3 – Quantitative Chemistry: Moles and the Avogadro Constant',
        'C3 – Quantitative Chemistry: Empirical and Molecular Formulae',
        'C3 – Quantitative Chemistry: Mole Calculations from Equations',
        'C3 – Quantitative Chemistry: Limiting Reagents and Excess',
        'C3 – Quantitative Chemistry: Percentage Yield and Atom Economy',
        'C3 – Quantitative Chemistry: Concentration of Solutions (mol/dm³ and g/dm³)',
        'C3 – Quantitative Chemistry: Titration Calculations (Higher)',
        'C3 – Quantitative Chemistry: Ideal Gas Volume Calculations (Higher)',
        // C4 Chemical Changes
        'C4 – Chemical Changes: Metal Reactivity Series',
        'C4 – Chemical Changes: Extraction of Metals (Reduction, Electrolysis)',
        'C4 – Chemical Changes: Oxidation and Reduction (Redox, Higher — Electron Transfer)',
        'C4 – Chemical Changes: Reactions of Acids with Metals, Bases and Carbonates',
        'C4 – Chemical Changes: Neutralisation and Salt Preparation',
        'C4 – Chemical Changes: pH Scale, Strong and Weak Acids (Higher)',
        'C4 – Chemical Changes: Electrolysis — Molten Ionic Compounds',
        'C4 – Chemical Changes: Electrolysis — Aqueous Solutions (including brine)',
        'C4 – Chemical Changes: Half Equations at Electrodes (Higher)',
        // C5 Energy Changes
        'C5 – Energy Changes: Exothermic and Endothermic Reactions',
        'C5 – Energy Changes: Reaction Profiles and Activation Energy',
        'C5 – Energy Changes: Bond Energies — Calculating Energy Change (Higher)',
        'C5 – Energy Changes: Cells and Batteries (Higher)',
        'C5 – Energy Changes: Hydrogen Fuel Cells vs Rechargeable Batteries',
        // Required Practicals
        'Required Practical 1 – Making a Salt by Titration',
        'Required Practical 2 – Preparation of a Pure Dry Salt (Neutralisation)',
        'Required Practical 3 – Electrolysis of Aqueous Solutions',
        'Required Practical 4 – Temperature Change in Reactions (Exo/Endothermic)',
      ],
      2: [
        // C6 Rate of Reaction
        'C6 – Rate of Reaction: Factors Affecting Rate (Temperature, Concentration, Surface Area, Catalysts)',
        'C6 – Rate of Reaction: Collision Theory and Activation Energy',
        'C6 – Rate of Reaction: Measuring Rate (Gas Volume, Mass Change, Colour Change)',
        'C6 – Rate of Reaction: Rate Calculations from Graphs (Tangents, Higher)',
        'C6 – Rate of Reaction: Catalysts and Energy Profiles',
        // C6 Equilibrium
        'C6 – Equilibrium: Reversible Reactions',
        'C6 – Equilibrium: Dynamic Equilibrium and Le Chatelier\'s Principle (Higher)',
        'C6 – Equilibrium: Effect of Concentration, Temperature and Pressure on Equilibrium (Higher)',
        'C6 – Equilibrium: The Haber Process (Conditions and Compromise)',
        'C6 – Equilibrium: The Contact Process (Higher)',
        // C7 Organic Chemistry
        'C7 – Organic Chemistry: Crude Oil as a Mixture of Hydrocarbons',
        'C7 – Organic Chemistry: Hydrocarbons — Alkanes (Structure, Properties, Homologous Series)',
        'C7 – Organic Chemistry: Fractional Distillation of Crude Oil',
        'C7 – Organic Chemistry: Properties of Hydrocarbons (Boiling Point, Viscosity, Flammability)',
        'C7 – Organic Chemistry: Cracking (Thermal and Catalytic) and Uses of Products',
        'C7 – Organic Chemistry: Alkenes (Unsaturation Test, Addition Reactions)',
        'C7 – Organic Chemistry: Alcohols (Uses, Combustion, Oxidation to Carboxylic Acids)',
        'C7 – Organic Chemistry: Carboxylic Acids (Reactions with Carbonates, Weak Acid Properties)',
        'C7 – Organic Chemistry: Esters (Formation and Uses, Higher)',
        'C7 – Organic Chemistry: Addition Polymers (from Alkenes)',
        'C7 – Organic Chemistry: Condensation Polymers (Nylon, Polyesters) — Higher',
        'C7 – Organic Chemistry: Naturally Occurring Polymers — DNA, Proteins, Starch (Higher)',
        // C8 Chemical Analysis
        'C8 – Chemical Analysis: Purity, Formulations and Chromatography Theory',
        'C8 – Chemical Analysis: Paper and Thin-Layer Chromatography (Rf Values)',
        'C8 – Chemical Analysis: Identification of Gases (H₂, O₂, CO₂, Cl₂, NH₃)',
        'C8 – Chemical Analysis: Flame Tests (Li, Na, K, Ca, Cu)',
        'C8 – Chemical Analysis: Ion Tests (Precipitation of Metal Ions, Halide Ions, Sulfate Ions)',
        'C8 – Chemical Analysis: Flame Emission Spectroscopy (Higher)',
        'C8 – Chemical Analysis: Gas Chromatography (Higher)',
        // C9 Atmosphere
        'C9 – Atmosphere: Evolution of the Earth\'s Atmosphere',
        'C9 – Atmosphere: Composition of Today\'s Atmosphere',
        'C9 – Atmosphere: The Greenhouse Effect and Enhanced Greenhouse Effect',
        'C9 – Atmosphere: Climate Change — Evidence and Impacts',
        'C9 – Atmosphere: Atmospheric Pollutants (CO, NOₓ, SO₂, Particulates)',
        'C9 – Atmosphere: Carbon Footprints and Reducing Emissions',
        // C10 Using Resources
        'C10 – Using Resources: Finite and Renewable Resources, Sustainable Development',
        'C10 – Using Resources: Water Treatment and Purification',
        'C10 – Using Resources: Desalination (Higher)',
        'C10 – Using Resources: Corrosion of Iron (Rusting) and Prevention',
        'C10 – Using Resources: Alloys and Their Properties',
        'C10 – Using Resources: Life Cycle Assessment (LCA)',
        'C10 – Using Resources: Reduce, Reuse, Recycle',
        'C10 – Using Resources: The Haber Process and Fertilisers (NPK)',
        'C10 – Using Resources: Extraction of Metals from Ores Using Carbon (Higher)',
        'C10 – Using Resources: Potable Water vs Waste Water Treatment (Higher)',
        // Required Practicals
        'Required Practical 5 – Rate of Reaction: Disappearing Cross (Thiosulfate + HCl)',
        'Required Practical 6 – Rate of Reaction: Gas Volume (Marble Chips + HCl)',
        'Required Practical 7 – Chromatography',
        'Required Practical 8 – Identifying Ions (Flame Tests and Precipitates)',
      ],
    }},

    // ── Physics (AQA 8463 — Cognito topic list) ───────────────────────────────
    'Physics': { papers: {
      1: [
        // P1 Energy
        'P1 – Energy: Energy Stores and Energy Transfers',
        'P1 – Energy: Conservation of Energy and Dissipation',
        'P1 – Energy: Kinetic Energy (KE = ½mv²)',
        'P1 – Energy: Gravitational Potential Energy (GPE = mgh)',
        'P1 – Energy: Elastic Potential Energy (EPE = ½ke²)',
        'P1 – Energy: Specific Heat Capacity',
        'P1 – Energy: Power and Efficiency',
        'P1 – Energy: Reducing Energy Transfers (Insulation, U-values — Higher)',
        'P1 – Energy: Renewable and Non-Renewable Energy Resources',
        'P1 – Energy: Trends in Energy Use (Higher)',
        // P2 Electricity
        'P2 – Electricity: Circuit Symbols and Basic Components',
        'P2 – Electricity: Charge, Current and Potential Difference',
        'P2 – Electricity: Resistance and Ohm\'s Law (I-V Graphs)',
        'P2 – Electricity: Series and Parallel Circuits',
        'P2 – Electricity: I-V Characteristics (Resistor, Filament Lamp, Diode)',
        'P2 – Electricity: Resistance — Fixed, Variable, LDR, Thermistor',
        'P2 – Electricity: Power, Energy and the Cost of Electricity',
        'P2 – Electricity: Mains Electricity — AC, Frequency and Voltage',
        'P2 – Electricity: Plugs, Fuses and Earthing (Safety)',
        'P2 – Electricity: The National Grid and Transformers',
        'P2 – Electricity: Static Electricity and Electric Fields (Higher)',
        // P3 Particle Model of Matter
        'P3 – Particle Model: States of Matter and Density',
        'P3 – Particle Model: Density Calculations and Required Practical Methods',
        'P3 – Particle Model: Changes of State and Specific Latent Heat',
        'P3 – Particle Model: Internal Energy',
        'P3 – Particle Model: Gas Pressure and Temperature',
        'P3 – Particle Model: Pressure-Volume Relationship (Boyle\'s Law — Higher)',
        'P3 – Particle Model: Work Done on a Gas and Temperature (Higher)',
        // P4 Atomic Structure
        'P4 – Atomic Structure: The History of the Atom (Plum Pudding to Nuclear)',
        'P4 – Atomic Structure: Atomic and Mass Number, Isotopes',
        'P4 – Atomic Structure: Types of Radioactive Decay (α, β, γ)',
        'P4 – Atomic Structure: Properties of Alpha, Beta and Gamma Radiation',
        'P4 – Atomic Structure: Nuclear Equations',
        'P4 – Atomic Structure: Half-Life Calculations',
        'P4 – Atomic Structure: Hazards and Uses of Radiation',
        'P4 – Atomic Structure: Contamination vs Irradiation (Higher)',
        'P4 – Atomic Structure: Nuclear Fission and Chain Reactions',
        'P4 – Atomic Structure: Nuclear Fusion and Stars',
        'P4 – Atomic Structure: Background Radiation Sources',
        // Required Practicals
        'Required Practical 1 – Specific Heat Capacity',
        'Required Practical 2 – Resistance of a Wire',
        'Required Practical 3 – I-V Characteristics',
        'Required Practical 4 – Density of Irregular and Regular Objects',
      ],
      2: [
        // P5 Forces
        'P5 – Forces: Scalar and Vector Quantities',
        'P5 – Forces: Contact and Non-Contact Forces',
        'P5 – Forces: Gravity and Weight (W = mg)',
        'P5 – Forces: Resultant Forces and Free Body Diagrams',
        'P5 – Forces: Work Done (W = Fd)',
        'P5 – Forces: Forces and Elasticity (Hooke\'s Law)',
        'P5 – Forces: Distance-Time Graphs (Speed and Gradient)',
        'P5 – Forces: Velocity-Time Graphs (Acceleration and Area)',
        'P5 – Forces: Acceleration (a = Δv/t and F = ma)',
        'P5 – Forces: Newton\'s Three Laws of Motion',
        'P5 – Forces: Stopping Distance (Thinking + Braking Distance)',
        'P5 – Forces: Factors Affecting Braking Distance (Higher)',
        'P5 – Forces: Momentum and Conservation of Momentum (Higher)',
        'P5 – Forces: Impact Forces, Safety Features and Change in Momentum (Higher)',
        // P6 Waves
        'P6 – Waves: Properties of Waves (Speed, Frequency, Wavelength, Amplitude)',
        'P6 – Waves: Transverse and Longitudinal Waves',
        'P6 – Waves: Wave Speed Equation (v = fλ)',
        'P6 – Waves: Required Practical — Measuring Wave Speed (Water Ripple Tank / Cord)',
        'P6 – Waves: Reflection, Refraction (Snell\'s Law — Higher)',
        'P6 – Waves: Total Internal Reflection (Higher)',
        'P6 – Waves: Sound Waves, Ultrasound and Infrasound',
        'P6 – Waves: Seismic Waves — P and S Waves, Earth\'s Structure (Higher)',
        'P6 – Waves: Electromagnetic Spectrum — Properties and Uses',
        'P6 – Waves: Hazards of EM Radiation',
        'P6 – Waves: Lenses and Ray Diagrams (Higher)',
        'P6 – Waves: Black Body Radiation and Perfect Reflectors/Absorbers (Higher)',
        // P7 Magnetism
        'P7 – Magnetism: Permanent and Induced Magnets, Magnetic Fields',
        'P7 – Magnetism: Compasses and the Earth\'s Magnetic Field',
        'P7 – Magnetism: Electromagnetism — Solenoids and Field Patterns',
        'P7 – Magnetism: The Motor Effect (F = BIL)',
        'P7 – Magnetism: Fleming\'s Left-Hand Rule',
        'P7 – Magnetism: Electric Motors',
        'P7 – Magnetism: Loudspeakers (application of the motor effect, Higher)',
        'P7 – Magnetism: Electromagnetic Induction (Faraday\'s Law, Higher)',
        'P7 – Magnetism: Generators (AC and DC, Higher)',
        'P7 – Magnetism: Microphones (Higher)',
        'P7 – Magnetism: Transformers (Turns Ratio, Efficiency, Higher)',
        // P8 Space
        'P8 – Space Physics: The Solar System (Planets, Moons, Comets)',
        'P8 – Space Physics: Life Cycle of a Star',
        'P8 – Space Physics: Orbital Motion (Gravity and Speed, Higher)',
        'P8 – Space Physics: The Universe — Red-Shift and the Big Bang (Higher)',
        // Required Practicals
        'Required Practical 5 – Investigating Waves (Ripple Tank or Slinky)',
        'Required Practical 6 – Investigating Infrared Radiation (Leslie Cube)',
      ],
    }},

    // ── Combined Science: Trilogy (AQA 8464) ──────────────────────────────────
    'Combined Science: Trilogy': { papers: {
      1: [ // Biology Paper 1
        'B1 – Cell Structure: Animal, Plant and Bacterial Cells; Specialised Cells',
        'B1 – Microscopy: Magnification Calculations',
        'B1 – Cell Division: Mitosis and the Cell Cycle',
        'B1 – Stem Cells: Embryonic and Adult, Therapeutic Cloning',
        'B1 – Transport: Diffusion, Osmosis, Active Transport',
        'B2 – Organisation: Digestive System, Enzymes and Food Tests',
        'B2 – Heart and Blood Vessels; Components of Blood',
        'B2 – Non-Communicable Disease: Cancer and Cardiovascular Disease',
        'B3 – Infection: Bacteria, Viruses, Protists, Fungi as Pathogens',
        'B3 – Preventing and Treating Disease: Vaccines, Antibiotics, Monoclonal Antibodies',
        'B4 – Photosynthesis: Rate and Limiting Factors',
        'B4 – Respiration: Aerobic and Anaerobic; Metabolism',
        'Required Practicals: Microscopy, Osmosis, Food Tests, Enzyme pH, Photosynthesis',
      ],
      2: [ // Biology Paper 2
        'B5 – Nervous System: CNS, Reflex Arc, the Eye',
        'B5 – Hormones: Endocrine System, Blood Glucose, Diabetes',
        'B5 – Reproductive Hormones, Menstrual Cycle and Contraception',
        'B5 – Kidneys: Filtration, Selective Reabsorption and Osmoregulation',
        'B6 – DNA Structure, Inheritance, Punnett Squares, Inherited Disorders',
        'B6 – Variation and Evolution; Evidence for Evolution',
        'B6 – Selective Breeding and Genetic Engineering',
        'B6 – Classification and the Binomial System',
        'B7 – Ecosystems: Abiotic and Biotic Factors, Food Chains and Webs',
        'B7 – Material Cycles: Carbon and Water Cycle (Higher: Nitrogen Cycle)',
        'B7 – Biodiversity and Conservation; Food Production',
        'Required Practicals: Quadrats and Transects, Reaction Time, Plant Tropisms',
      ],
      3: [ // Chemistry Paper 1
        'C1 – Atomic Structure and Isotopes; Electronic Structure',
        'C1 – Periodic Table: Development, Group 1, Group 7, Transition Metals',
        'C2 – Ionic, Covalent and Metallic Bonding; Structures and Properties',
        'C2 – Giant Covalent Structures (Diamond, Graphite, Silicon Dioxide)',
        'C2 – Polymers, Nanoparticles and Uses of Nanomaterials',
        'C3 – Conservation of Mass, Moles, Formulae, Yield and Atom Economy',
        'C3 – Concentration of Solutions (Higher)',
        'C4 – Reactivity Series and Extraction of Metals',
        'C4 – Reactions of Acids: Metals, Bases, Carbonates; Neutralisation and Salts',
        'C4 – Electrolysis: Molten and Aqueous Solutions',
        'C5 – Exothermic and Endothermic Reactions, Reaction Profiles',
        'C5 – Bond Energy Calculations (Higher); Cells and Batteries',
        'Required Practicals: Titration, Electrolysis, Temperature Change',
      ],
      4: [ // Chemistry Paper 2
        'C6 – Rate of Reaction: Factors and Collision Theory',
        'C6 – Equilibrium and Le Chatelier\'s Principle, the Haber Process',
        'C7 – Crude Oil, Fractional Distillation, Cracking',
        'C7 – Alkanes, Alkenes, Alcohols and Carboxylic Acids; Addition Polymers',
        'C8 – Chromatography, Flame Tests, Ion Tests, Identifying Gases',
        'C9 – Earth\'s Atmosphere, the Greenhouse Effect, Climate Change, Pollution',
        'C10 – Water Treatment, Corrosion and Its Prevention, Life Cycle Assessment',
        'Required Practicals: Rate of Reaction (Disappearing Cross, Gas Volume), Chromatography',
      ],
      5: [ // Physics Paper 1
        'P1 – Energy: Stores, Transfers, KE, GPE, EPE, Specific Heat Capacity',
        'P1 – Energy: Power, Efficiency and Reducing Unwanted Energy Transfers',
        'P1 – Energy Resources: Renewable vs Non-Renewable, Trends in Use',
        'P2 – Electricity: Circuits, Ohm\'s Law, Series and Parallel, I-V Graphs',
        'P2 – Electricity: Power, Energy Costs, National Grid, Transformers',
        'P3 – Particle Model: Density, Changes of State, Specific Latent Heat, Gas Pressure',
        'P4 – Atomic Structure: Radioactive Decay, Half-Life, Fission and Fusion',
        'Required Practicals: Specific Heat Capacity, Resistance, I-V Characteristics, Density',
      ],
      6: [ // Physics Paper 2
        'P5 – Forces: Newton\'s Laws, Resultant Forces, Work Done, Elasticity',
        'P5 – Forces: Distance-Time and Velocity-Time Graphs, Stopping Distance, Momentum (Higher)',
        'P6 – Waves: Properties, Transverse/Longitudinal, Wave Speed Equation, EM Spectrum',
        'P6 – Waves: Reflection, Refraction and Uses/Hazards of EM Radiation',
        'P7 – Magnetism: Magnetic Fields, the Motor Effect, Electromagnetic Induction, Transformers',
        'Required Practicals: Investigating Waves, Investigating Infrared Radiation',
      ],
    }},

    // ── Combined Science: Synergy (AQA 8465) ──────────────────────────────────
    'Combined Science: Synergy': { papers: {
      1: [ // Chemistry and Physics Paper 1 — "The Physical World"
        'Atomic Structure, Bonding and the Periodic Table',
        'Quantitative Chemistry: Moles, Yield, Concentration',
        'Energy Changes in Chemistry: Exothermic, Endothermic, Bond Energies',
        'Rate of Reaction: Factors, Collision Theory, Equilibrium',
        'Motion, Forces and Conservation of Energy',
        'Waves: Properties, Wave Equation and the EM Spectrum',
        'Magnetism and Electromagnetism',
        'Radioactivity: Nuclear Decay and Half-Life',
      ],
      2: [ // Biology and Chemistry Paper 2 — "Life Processes"
        'Cell Biology: Structure, Microscopy, Mitosis, Transport (Diffusion, Osmosis, Active Transport)',
        'Infection and Response: Pathogens, Immunity, Vaccines, Antibiotics',
        'Bioenergetics: Photosynthesis and Respiration (Aerobic and Anaerobic)',
        'Organic Chemistry: Hydrocarbons, Polymers, Alcohols, Carboxylic Acids',
        'Chemical Analysis: Chromatography, Flame Tests, Ion Tests',
        'Earth\'s Atmosphere: Evolution, Greenhouse Effect, Pollutants',
        'Using Resources: Water Treatment, Life Cycle Assessment',
      ],
      3: [ // Physics and Chemistry Paper 3 — "The Physical Systems"
        'Particle Model of Matter and Atomic Structure',
        'Radioactivity: Types, Uses, Hazards, Fission and Fusion',
        'Energy Resources, Electricity Generation and the National Grid',
        'Further Rate of Reaction and Equilibrium (Haber Process)',
        'Forces: Newton\'s Laws, Stopping Distance, Momentum, Work Done',
      ],
      4: [ // Biology Paper 3 — "Ecological Systems and Genetics"
        'Ecosystems: Abiotic and Biotic Factors, Food Chains, Biodiversity',
        'Material Cycles: Carbon, Water, Nitrogen',
        'Homeostasis: Nervous System, Hormones, Blood Glucose, Kidneys',
        'Inheritance, Variation and Evolution; Genetic Engineering',
        'Ecology and Food Production: Farming, Biotechnology, Fungal Protein',
      ],
    }},

    // ── Computer Science (AQA 8525) ───────────────────────────────────────────
    'Computer Science': { papers: {
      1: [
        '1.1 – Systems Architecture: Von Neumann Architecture (CPU, Memory, I/O)',
        '1.1 – Systems Architecture: Components of the CPU (ALU, CU, Registers, Cache)',
        '1.1 – Systems Architecture: The Fetch-Decode-Execute Cycle',
        '1.1 – Systems Architecture: Performance Factors (Clock Speed, Cache, Cores)',
        '1.1 – Systems Architecture: Embedded Systems',
        '1.2 – Memory and Storage: Primary vs Secondary Storage; RAM vs ROM',
        '1.2 – Memory and Storage: Virtual Memory',
        '1.2 – Memory and Storage: Secondary Storage Types (HDD, SSD, Optical) and Suitability',
        '1.2 – Memory and Storage: Units of Data (Bits, Bytes, KB, MB, GB, TB, PB) and Calculations',
        '1.2 – Memory and Storage: Binary, Denary and Hexadecimal Conversion',
        '1.2 – Memory and Storage: Binary Addition and Overflow',
        '1.2 – Memory and Storage: Binary Shifts (Multiplying/Dividing by Powers of 2)',
        '1.2 – Memory and Storage: Character Encoding (ASCII and Unicode)',
        '1.2 – Memory and Storage: Representing Images (Pixels, Resolution, Colour Depth, Metadata)',
        '1.2 – Memory and Storage: Representing Sound (Sample Rate, Bit Depth, Duration)',
        '1.2 – Memory and Storage: Data Compression (Lossy vs Lossless, Run Length Encoding)',
        '1.3 – Networks: Types of Network (LAN, WAN) and Factors Affecting Performance',
        '1.3 – Networks: Network Topologies (Star, Mesh, Bus)',
        '1.3 – Networks: Wired vs Wireless Media (Ethernet, Wi-Fi, Bluetooth)',
        '1.3 – Networks: Network Hardware (Router, Switch, NIC, WAP, Hub)',
        '1.3 – Networks: Protocols and Layers (TCP/IP Stack, HTTP/HTTPS, FTP, SMTP/IMAP/POP)',
        '1.3 – Networks: The Internet, DNS and Web Hosting',
        '1.4 – Network Security: Forms of Attack (Malware, Phishing, Brute Force, DoS/DDoS, SQL Injection, Social Engineering)',
        '1.4 – Network Security: Identifying and Preventing Vulnerabilities (Penetration Testing, Firewalls, Anti-Malware)',
        '1.4 – Network Security: Encryption and User Access Levels',
        '1.5 – Systems Software: Operating System Functions (Memory Management, Peripheral Management, User Interface)',
        '1.5 – Systems Software: Utility Software (Encryption, Defragmentation, Backup, Compression)',
        '1.6 – Ethical, Legal, Cultural and Environmental Impacts of Digital Technology',
        '1.6 – Legislation: The Computer Misuse Act 1990',
        '1.6 – Legislation: The Data Protection Act 2018 / UK GDPR',
        '1.6 – Legislation: The Copyright, Designs and Patents Act 1988',
        '1.6 – Open Source vs Proprietary Software; Free Software Licensing',
      ],
      2: [
        '2.1 – Algorithms: Computational Thinking (Decomposition, Abstraction, Algorithmic Thinking)',
        '2.1 – Algorithms: Representing Algorithms (Pseudocode, Flowcharts, Reference Language)',
        '2.1 – Algorithms: Searching — Linear Search',
        '2.1 – Algorithms: Searching — Binary Search',
        '2.1 – Algorithms: Sorting — Bubble Sort',
        '2.1 – Algorithms: Sorting — Merge Sort',
        '2.1 – Algorithms: Sorting — Insertion Sort',
        '2.1 – Algorithms: Comparing Algorithm Efficiency (Time Complexity, Big O — Introductory)',
        '2.2 – Programming Fundamentals: Variables, Constants, Data Types and Casting',
        '2.2 – Programming Fundamentals: Input, Output and Basic String Manipulation',
        '2.2 – Programming Fundamentals: Sequence, Selection (if, elif, else)',
        '2.2 – Programming Fundamentals: Iteration (Count-Controlled and Condition-Controlled Loops)',
        '2.2 – Programming Fundamentals: String Manipulation (Concatenation, Slicing, Length, Case)',
        '2.2 – Programming Fundamentals: Arrays / Lists — 1D and 2D',
        '2.2 – Programming Fundamentals: File Handling (Read, Write, Open, Close)',
        '2.2 – Programming Fundamentals: SQL — Basic SELECT, INSERT, UPDATE, DELETE Statements',
        '2.2 – Programming Fundamentals: Subroutines (Procedures and Functions, Parameters, Return Values)',
        '2.2 – Programming Fundamentals: Local vs Global Variables',
        '2.3 – Producing Robust Programs: Defensive Design (Input Validation, Authentication, Maintainability)',
        '2.3 – Producing Robust Programs: Input Sanitisation',
        '2.3 – Producing Robust Programs: Testing (Normal, Boundary, Erroneous/Invalid Data)',
        '2.3 – Producing Robust Programs: Identifying and Correcting Syntax and Logic Errors',
        '2.4 – Boolean Logic: AND, OR, NOT Gates',
        '2.4 – Boolean Logic: Truth Tables (up to 3 Inputs)',
        '2.4 – Boolean Logic: Logic Circuit Diagrams',
        '2.4 – Boolean Logic: Applying Boolean Operators to Combine Comparison Operators in Code',
        '2.5 – Programming Languages: High-Level vs Low-Level Languages, Assembly',
        '2.5 – Programming Languages: Translators — Compiler vs Interpreter (Advantages/Disadvantages)',
        '2.5 – IDEs: Common Facilities (Editor, Debugger, Error Diagnostics, Run-Time Environment)',
      ],
    }},

    // ── Geography (AQA 8035) ──────────────────────────────────────────────────
    'Geography': { papers: {
      1: [
        '1A – Tectonic Hazards: Structure of the Earth, Plate Boundaries (Destructive, Constructive, Conservative)',
        '1A – Tectonic Hazards: Earthquakes — Causes, Effects and Responses',
        '1A – Tectonic Hazards: Volcanoes — Causes, Effects and Responses',
        '1A – Tectonic Hazards: Living with Tectonic Hazards; Case Study (e.g. L\'Aquila / Chile)',
        '1A – Atmospheric Hazards: Global Atmospheric Circulation Model',
        '1A – Atmospheric Hazards: Tropical Storms — Formation, Structure, Effects',
        '1A – Atmospheric Hazards: Reducing the Risk of Tropical Storms; UK Extreme Weather Case Study',
        '1A – Climate Change: Evidence of Climate Change (Ice Cores, Tree Rings)',
        '1A – Climate Change: Causes (Natural — Orbital, Solar, Volcanic; Human — Greenhouse Gases)',
        '1A – Climate Change: Effects and Managing Climate Change (Mitigation and Adaptation)',
        '1B – The Living World: Small-Scale Ecosystems (British Woodlands) — Nutrient Cycle, Food Web',
        '1B – The Living World: Large-Scale Ecosystems (Global Biome Distribution)',
        '1B – Tropical Rainforests: Characteristics, Interdependence, Causes of Deforestation',
        '1B – Tropical Rainforests: Impacts of Deforestation; Management and Sustainability',
        '1B – Hot Deserts (or Cold Environments, depending on option): Characteristics, Adaptations',
        '1B – Hot Deserts: Development Opportunities and Challenges (Desertification)',
        '1B – Cold Environments: Characteristics, Opportunities, Challenges, Sustainable Management',
        '1C – Coastal Landscapes in the UK: Weathering and Mass Movement',
        '1C – Coastal Landscapes: Erosional Processes and Landforms (Headlands, Bays, Caves, Arches, Stacks)',
        '1C – Coastal Landscapes: Depositional Processes and Landforms (Beaches, Spits, Bars)',
        '1C – Coastal Landscapes: Coastal Management (Hard and Soft Engineering, Managed Retreat)',
        '1C – River Landscapes in the UK: The Long Profile and the Drainage Basin',
        '1C – River Landscapes: Erosional and Depositional Processes and Landforms (Waterfalls, Meanders, Floodplains)',
        '1C – River Landscapes: Flood Management Strategies (Hard and Soft Engineering)',
        '1C – Glacial Landscapes in the UK: Glacial Processes and Landforms (Corries, Arêtes, Pyramidal Peaks)',
        '1C – Glacial Landscapes: Economic Uses (Tourism, Farming, Forestry) and Land Use Conflicts',
      ],
      2: [
        '2A – Urban Issues and Challenges: Global Urbanisation Trends and Megacities',
        '2A – Urban Issues: UK City Case Study — Growth, Inequality, Regeneration (e.g. Bristol)',
        '2A – Urban Issues: Developing/Emerging World City Case Study — Growth, Challenges (e.g. Lagos or Rio)',
        '2A – Urban Issues: Urban Planning and Sustainable Urban Living',
        '2B – The Changing Economic World: Measuring Development (GNI, HDI, Birth/Death Rate)',
        '2B – The Changing Economic World: The Demographic Transition Model',
        '2B – The Changing Economic World: Uneven Development — Causes and Consequences',
        '2B – The Changing Economic World: Strategies to Reduce the Development Gap (Aid, Trade, Debt Relief)',
        '2B – The Changing Economic World: LIC/NEE Case Study (Nigeria) — Industrial Development, TNCs',
        '2B – The Changing Economic World: UK\'s Changing Economy — Post-Industrial, Science Parks',
        '2B – The Changing Economic World: UK\'s Changing Economy — North-South Divide, Rural Change',
        '2C – Resource Management Overview: UK Food, Water and Energy Supply',
        '2C – Food Resources: Demand, Supply, Food Insecurity, Strategies to Increase Supply',
        '2C – Water Resources: Demand, Supply, Water Insecurity, Strategies to Increase Supply',
        '2C – Energy Resources: Production, Demand, Energy Insecurity, Strategies to Increase Supply',
      ],
      3: [
        '3A – Issue Evaluation: Pre-Release Booklet Analysis and Fieldwork Context',
        '3A – Issue Evaluation: Decision-Making Exercise — Justifying a Course of Action',
        '3B – Fieldwork: Enquiry Process (Question, Data Collection, Presentation, Analysis, Conclusion, Evaluation)',
        '3B – Fieldwork: Physical Environment Investigation (e.g. River or Coastal Study)',
        '3B – Fieldwork: Human Environment Investigation (e.g. Urban or CBD Study)',
        '3C – Geographical Skills: Atlas and Map Skills',
        '3C – Geographical Skills: Graphical Skills (Choropleth, Isoline, Proportional Symbol)',
        '3C – Geographical Skills: Statistical Skills (Mean, Median, Mode, Interquartile Range)',
        '3C – Geographical Skills: Ordnance Survey Map Reading (Grid References, Scale, Contours)',
      ],
    }},

    // ── History (AQA 8145) ────────────────────────────────────────────────────
    'History': { papers: {
      1: [
        // Period Study (most common: Medicine in Britain)
        'Period Study – Medicine in Britain c.1250: Medieval Beliefs (Four Humours, Church, Islamic Medicine)',
        'Period Study – Medicine c.1250–1500: Surgery, Public Health and the Black Death',
        'Period Study – Medicine 1500–1700: Renaissance, Vesalius\' Anatomy, Harvey\'s Circulation of Blood',
        'Period Study – Medicine 1700–1900: Germ Theory (Pasteur and Koch)',
        'Period Study – Medicine 1800–1900: Vaccination (Jenner), Anaesthetics, Antiseptic Surgery (Lister)',
        'Period Study – Medicine c.1900–Present: NHS, Penicillin (Fleming), DNA, Modern Treatments',
        'Period Study – Medicine: Key Individuals (Hippocrates, Galen, Vesalius, Harvey, Jenner, Pasteur, Koch, Lister, Fleming)',
        'Period Study – Medicine: Case Study — Public Health (Cholera, John Snow, the Great Stink, Sanitation Acts)',
        // Historic Environment
        'Historic Environment – The British Sector of the Western Front 1914–18: Trenches, Weapons, Medical Response',
        'Historic Environment – Western Front: Evacuation of the Wounded, Facial Reconstruction, Blood Transfusion',
      ],
      2: [
        // Wider World Depth Study (most common: Germany 1890–1945)
        'Germany 1890–1918: Kaiser Wilhelm II, the Second Reich, Social Problems',
        'Germany 1918–1929: The Weimar Republic — Constitution, Early Challenges (Spartacists, Kapp Putsch)',
        'Germany 1918–1929: Hyperinflation 1923 and the Stresemann Years — Recovery',
        'Germany 1929–1933: The Rise of the Nazi Party, Impact of the Great Depression',
        'Germany 1933–1934: Nazi Consolidation of Power (Reichstag Fire, Enabling Act, Night of Long Knives)',
        'Germany 1933–1939: Life in Nazi Germany (Propaganda, Youth, Women, Employment)',
        'Germany 1933–1939: Nazi Persecution — Jews, Minorities and Opposition',
        'Germany 1939–1945: The Holocaust, Total War and Defeat',
        // British Depth Study (most common: Elizabethan England)
        'Elizabethan England 1558–1603: Elizabeth I and Her Government; the Virgin Queen',
        'Elizabethan England: The Religious Settlement (1559) and Its Challenges',
        'Elizabethan England: Mary Queen of Scots and Catholic Plots (Ridolfi, Babington)',
        'Elizabethan England: Exploration, Drake and the Spanish Armada (1588)',
        'Elizabethan England: Poverty, the Poor Laws, Education and Popular Culture',
        'Elizabethan England: Historic Environment Site Study (e.g. Elizabethan Theatres)',
        // Conflict and Tension
        'Conflict and Tension 1894–1918: Alliance Systems, Militarism, Imperialism, Nationalism',
        'Conflict and Tension 1894–1918: The Assassination of Franz Ferdinand and the July Crisis',
        'Conflict and Tension 1894–1918: The Schlieffen Plan and the Stalemate on the Western Front',
        'Conflict and Tension 1918–1939: The Paris Peace Conference and Treaty of Versailles',
        'Conflict and Tension 1918–1939: The League of Nations — Aims, Structure, Successes and Failures',
        'Conflict and Tension 1918–1939: The Road to War — Hitler\'s Foreign Policy, Rhineland, Anschluss, Sudetenland',
      ],
    }},

    // ── Religious Studies (AQA 8062 — Spec A) ─────────────────────────────────
    'Religious Studies': { papers: {
      1: [
        // Christianity Beliefs
        'Christianity – Beliefs: The Nature of God (Omnipotent, Omniscient, Omnipresent, Benevolent)',
        'Christianity – Beliefs: The Trinity (Father, Son, Holy Spirit)',
        'Christianity – Beliefs: Creation (Genesis Account)',
        'Christianity – Beliefs: The Fall and Original Sin',
        'Christianity – Beliefs: Incarnation — Jesus as Both Human and Divine',
        'Christianity – Beliefs: Crucifixion, Resurrection and Ascension',
        'Christianity – Beliefs: Salvation, Atonement and Redemption',
        'Christianity – Beliefs: Life After Death (Heaven, Hell, Purgatory)',
        // Christianity Practices
        'Christianity – Practices: Worship (Liturgical, Non-Liturgical, Informal, Private)',
        'Christianity – Practices: Prayer and The Lord\'s Prayer',
        'Christianity – Practices: Baptism (Infant and Believer\'s Baptism)',
        'Christianity – Practices: Eucharist / Holy Communion',
        'Christianity – Practices: Pilgrimage (Lourdes, Jerusalem)',
        'Christianity – Practices: Christmas and Easter Celebrations',
        'Christianity – Practices: The Role of the Church in the Local and Wider Community',
        'Christianity – Practices: The Church in the World (Reconciliation, Oscar Romero, Persecuted Church)',
        // Islam Beliefs
        'Islam – Beliefs: The Six Articles of Faith (Sunni) / Five Roots of Usul ad-Din (Shi\'a)',
        'Islam – Beliefs: The Nature of Allah (Tawhid — Oneness of God, 99 Names)',
        'Islam – Beliefs: Angels (Jibril, Mika\'il)',
        'Islam – Beliefs: Prophethood — Muhammad (pbuh), Adam, Ibrahim',
        'Islam – Beliefs: Holy Books (Qur\'an, Injil, Tawrat)',
        'Islam – Beliefs: Life After Death (Akhirah — Judgement, Heaven, Hell)',
        'Islam – Beliefs: Al-Qadr — Predestination',
        'Islam – Beliefs: Sunni and Shi\'a Differences and Their Origins',
        // Islam Practices
        'Islam – Practices: The Five Pillars (Shahadah, Salah, Sawm, Zakah, Hajj)',
        'Islam – Practices: The Mosque — Features and Importance; Sunni and Shi\'a Mosques',
        'Islam – Practices: Jihad (Greater and Lesser)',
        'Islam – Practices: Festivals (Id-ul-Fitr and Id-ul-Adha)',
        'Islam – Practices: Shi\'a Practices (Ashura, Khums)',
      ],
      2: [
        'Theme A – Relationships and Families: Sex, Marriage and Cohabitation',
        'Theme A – Relationships and Families: Contraception and Family Planning',
        'Theme A – Relationships and Families: Divorce and Remarriage',
        'Theme A – Relationships and Families: Roles of Men and Women; Gender Equality',
        'Theme A – Relationships and Families: Homosexuality and Religious Attitudes to Sexuality',
        'Theme A – Relationships and Families: Families and the Purpose of Family; Family Planning',
        'Theme B – Religion and Life: The Origin and Value of the Universe (Creation vs Big Bang)',
        'Theme B – Religion and Life: The Origin and Value of Human Life (Evolution, Sanctity of Life)',
        'Theme B – Religion and Life: Abortion — Religious and Ethical Arguments',
        'Theme B – Religion and Life: Euthanasia — Religious and Ethical Arguments',
        'Theme B – Religion and Life: Animal Rights, Stewardship and the Environment',
        'Theme D – Religion, Peace and Conflict: Violence, Terrorism and Religion as a Cause of Conflict',
        'Theme D – Religion, Peace and Conflict: Just War Theory and Its Criteria',
        'Theme D – Religion, Peace and Conflict: Holy War, Pacifism and Weapons of Mass Destruction',
        'Theme D – Religion, Peace and Conflict: The Work of Religious Organisations for Peace',
        'Theme E – Religion, Crime and Punishment: Crime, Good and Evil Intentions and Actions',
        'Theme E – Religion, Crime and Punishment: Types and Aims of Punishment (Retribution, Deterrence, Reform)',
        'Theme E – Religion, Crime and Punishment: Forgiveness and the Death Penalty Debate',
        'Theme F – Religion, Human Rights and Social Justice: Prejudice and Discrimination',
        'Theme F – Religion, Human Rights and Social Justice: Wealth, Poverty and Charity (Trussell Trust, CAFOD)',
        'Theme F – Religion, Human Rights and Social Justice: Human Rights and Social Justice',
      ],
    }},

    // ── Psychology (AQA 8182) ─────────────────────────────────────────────────
    'Psychology': { papers: {
      1: [
        'Memory – The Multi-Store Model: Sensory Register, STM, LTM',
        'Memory – Types of Long-Term Memory: Episodic, Semantic, Procedural',
        'Memory – Factors Affecting Accuracy of Memory: Interference and Context',
        'Cognition and Development – Piaget\'s Theory: Four Stages of Cognitive Development',
        'Cognition and Development – Piaget: Schemas, Assimilation, Accommodation',
        'Cognition and Development – Willingham\'s Learning Theory: Learning as Memorised Practice',
        'Cognition and Development – Baron-Cohen et al. (1997): \'Eyes Test\' and Autism Spectrum',
        'Social Context and Behaviour – Milgram (1963): Obedience Study — Method, Findings, Evaluation',
        'Social Context and Behaviour – Haney, Banks and Zimbardo (1973): Stanford Prison Study',
        'Social Context and Behaviour – Piliavin et al. (1969): Bystander Behaviour on the Subway',
        'Social Context and Behaviour – Social Learning Theory (Bandura): Observation and Imitation',
        'Social Context and Behaviour – Situational and Dispositional Explanations of Behaviour',
      ],
      2: [
        'Brain and Neuropsychology – The Nervous System: CNS and PNS',
        'Brain and Neuropsychology – Brain Structure: Lobes and Their Functions',
        'Brain and Neuropsychology – Neuron Structure and Synaptic Transmission',
        'Brain and Neuropsychology – Brain Scanning: fMRI and EEG',
        'Brain and Neuropsychology – Neurological Damage: Case Studies (Phineas Gage)',
        'Brain and Neuropsychology – Tulving\'s Long-Term Memory: Episodic, Semantic, Procedural',
        'Psychological Problems – Characteristics of Mental Health, Depression and Addiction',
        'Psychological Problems – Depression: Characteristics, Explanations, Treatments',
        'Psychological Problems – Addiction: Risk Factors, Biological and Behavioural Explanations',
        'Psychological Problems – Addiction: Reducing Addiction, NHS Treatment Aims',
        'Social Influence – Types of Conformity and Explanations for Conformity',
        'Research Methods – Types of Research: Experiment, Observation, Questionnaire, Case Study, Correlation',
        'Research Methods – Research Design: Hypothesis, IV, DV, Sampling Methods',
        'Research Methods – Data Analysis: Quantitative vs Qualitative, Mean, Median, Mode, Range',
        'Research Methods – Data Analysis: Presentation of Data (Tables, Graphs, Charts)',
        'Research Methods – Ethical Considerations: Consent, Deception, Debriefing, Confidentiality',
      ],
    }},

    // ── Sociology (AQA 8192) ──────────────────────────────────────────────────
    'Sociology': { papers: {
      1: [
        'The Sociology of Families: Defining Family, Family Diversity',
        'The Sociology of Families: Changing Family Structures (Nuclear, Extended, Single-Parent, Reconstituted)',
        'The Sociology of Families: Changing Patterns of Marriage, Divorce and Cohabitation',
        'The Sociology of Families: Changing Gender Roles and the Symmetrical Family',
        'The Sociology of Families: Demographic Changes (Birth Rate, Death Rate, Ageing Population, Migration)',
        'The Sociology of Families: Sociological Perspectives on the Family (Functionalism, Marxism, Feminism, New Right)',
        'The Sociology of Families: Childhood as a Social Construct',
        'The Sociology of Education: Role and Purpose of Education (Functionalist, Marxist Views)',
        'The Sociology of Education: The Hidden Curriculum',
        'The Sociology of Education: Differential Achievement by Social Class',
        'The Sociology of Education: Differential Achievement by Gender',
        'The Sociology of Education: Differential Achievement by Ethnicity',
        'The Sociology of Education: In-School Factors (Labelling, Streaming, Setting, Pupil Subcultures)',
        'The Sociology of Education: Education Policies (Marketisation, Academies, Free Schools)',
        'Research Methods: Types of Data (Quantitative and Qualitative); Validity and Reliability',
        'Research Methods: Primary Methods (Surveys, Interviews, Observation, Experiments)',
        'Research Methods: Secondary Methods (Documents, Official Statistics)',
        'Research Methods: Sampling Techniques (Random, Stratified, Snowball)',
        'Research Methods: Ethical Considerations',
      ],
      2: [
        'The Sociology of Crime and Deviance: Defining and Measuring Crime and Deviance',
        'The Sociology of Crime and Deviance: Official and Alternative Crime Statistics (Victim Surveys, Self-Report)',
        'The Sociology of Crime and Deviance: Sociological Explanations (Functionalist, Strain, Interactionist, Marxist)',
        'The Sociology of Crime and Deviance: Gender and Crime',
        'The Sociology of Crime and Deviance: Ethnicity and Crime',
        'The Sociology of Crime and Deviance: Age and Crime',
        'The Sociology of Crime and Deviance: Social Control — Formal (Police, Courts) and Informal (Family, Peers)',
        'The Sociology of Crime and Deviance: The Role of the Media in Crime and Deviance',
        'Social Stratification: Defining Social Class and Life Chances',
        'Social Stratification: Gender and Inequality (Pay Gap, Glass Ceiling)',
        'Social Stratification: Ethnicity and Inequality',
        'Social Stratification: Poverty (Absolute and Relative) and Social Exclusion',
        'Social Stratification: Explanations of Social Inequality (Functionalist, Marxist, Feminist, Weberian)',
        'Research Methods in Context: Applying Methods to the Study of Crime and Stratification',
      ],
    }},

    // ── Business (AQA 8132) ─────────────────────────────────────────────────────
    // FIX: official 2017-reformed title dropped "Studies" — it's "GCSE Business", not
    // "GCSE Business Studies" (the old colloquial name persists informally, even in AQA's
    // own subject-team email address, but the certificate itself says "Business").
    'Business': { papers: {
      1: [
        '1.1 – Enterprise and Entrepreneurship: Role of Entrepreneurs, Business Aims and Objectives',
        '1.1 – Enterprise and Entrepreneurship: Business Ideas, Risk and Reward',
        '1.1 – Enterprise and Entrepreneurship: The Dynamic Nature of Business (Competition, Technology)',
        '1.2 – Spotting a Business Opportunity: Identifying and Understanding Customer Needs',
        '1.2 – Spotting a Business Opportunity: Market Research (Primary and Secondary; Qualitative/Quantitative)',
        '1.2 – Spotting a Business Opportunity: Market Segmentation',
        '1.2 – Spotting a Business Opportunity: Interpreting Market Data',
        '1.3 – Putting a Business Idea into Practice: Revenue, Costs and Profit Calculations',
        '1.3 – Putting a Business Idea into Practice: Cash Flow Forecasting',
        '1.3 – Putting a Business Idea into Practice: Sources of Finance (Internal and External)',
        '1.3 – Putting a Business Idea into Practice: Business Plans',
        '1.4 – Making the Business Effective: Business Location Factors',
        '1.4 – Making the Business Effective: Business Legal Structure (Sole Trader, Partnership, Ltd)',
        '1.4 – Making the Business Effective: The Marketing Mix (4Ps: Product, Price, Place, Promotion)',
        '1.4 – Making the Business Effective: Business Ownership — Franchising',
        '1.5 – Understanding External Influences on Business: Stakeholders and Their Objectives',
        '1.5 – Understanding External Influences: Technology and Its Impact on Business',
        '1.5 – Understanding External Influences: Legislation (Consumer and Employment Law)',
        '1.5 – Understanding External Influences: The Economy and Business (Business Cycle, Interest Rates)',
        '1.5 – Understanding External Influences: Ethics, the Environment and Business',
      ],
      2: [
        '2.1 – Growing the Business: Methods of Growth — Organic Growth vs Integration (Horizontal/Vertical)',
        '2.1 – Growing the Business: Reasons for Business Failure',
        '2.1 – Growing the Business: Public Limited Companies (PLCs)',
        '2.1 – Growing the Business: Globalisation, Multinationals and E-Commerce',
        '2.1 – Growing the Business: Ethical and Environmental Considerations of Growth',
        '2.2 – Making Marketing Decisions: Product Life Cycle and Extension Strategies',
        '2.2 – Making Marketing Decisions: Branding and Promotion (Above/Below the Line)',
        '2.2 – Making Marketing Decisions: Pricing Strategies (Cost-Plus, Competitive, Price Skimming, Penetration)',
        '2.2 – Making Marketing Decisions: Distribution Channels',
        '2.2 – Making Marketing Decisions: The Use of Technology in Marketing',
        '2.3 – Making Operational Decisions: Business Operations, Production Methods and Efficiency',
        '2.3 – Making Operational Decisions: Managing Stock and Procurement',
        '2.3 – Making Operational Decisions: Quality Management (Quality Control vs Quality Assurance)',
        '2.3 – Making Operational Decisions: The Sales Process and Customer Service',
        '2.4 – Making Financial Decisions: Analysing Revenue, Costs, Profit and Return on Investment',
        '2.4 – Making Financial Decisions: Interpreting Financial Statements (Income Statement, Balance Sheet)',
        '2.4 – Making Financial Decisions: Break-Even Analysis (Calculation and Charts)',
        '2.5 – Making Human Resource Decisions: Organisational Structures (Hierarchical vs Flat, Span of Control)',
        '2.5 – Making Human Resource Decisions: Recruitment, Selection and Training (On/Off the Job)',
        '2.5 – Making Human Resource Decisions: Motivation Theories (Taylor, Maslow, Herzberg)',
        '2.5 – Making Human Resource Decisions: Employee Retention, Pay and Trade Unions',
      ],
    }},

    // ── Economics (AQA 8136) ──────────────────────────────────────────────────
    'Economics': { papers: {
      1: [
        'Theme 1 – The Economic Problem: Scarcity, Choice and Opportunity Cost',
        'Theme 1 – The Economic Problem: Factors of Production, the Production Possibility Frontier',
        'Theme 1 – The Economic Problem: Free Goods vs Economic Goods, Specialisation and Division of Labour',
        'Theme 1 – Demand: The Law of Demand, Demand Curves',
        'Theme 1 – Demand: Factors Shifting Demand (Income, Tastes, Price of Substitutes/Complements)',
        'Theme 1 – Supply: The Law of Supply, Supply Curves',
        'Theme 1 – Supply: Factors Shifting Supply (Costs, Technology, Government Policy)',
        'Theme 1 – Price Determination: Market Equilibrium and Disequilibrium',
        'Theme 1 – Elasticity: Price Elasticity of Demand (PED) — Calculation and Significance',
        'Theme 1 – Elasticity: Price Elasticity of Supply (PES)',
        'Theme 1 – Elasticity: Income Elasticity of Demand (YED)',
        'Theme 1 – Market Failure: Externalities (Positive and Negative)',
        'Theme 1 – Market Failure: Public Goods, Merit Goods and Demerit Goods',
        'Theme 1 – Government Intervention: Taxes, Subsidies, Price Controls, Regulations',
        'Theme 1 – Business Economics: Types of Business Organisation and Objectives',
        'Theme 1 – Business Economics: Competition and Market Structures',
      ],
      2: [
        'Theme 2 – The Economy: Measuring GDP and Living Standards',
        'Theme 2 – The Economy: Unemployment — Types, Causes and Effects',
        'Theme 2 – The Economy: Inflation — CPI, RPI, Demand-Pull, Cost-Push Causes',
        'Theme 2 – The Economy: Economic Growth and the Business Cycle',
        'Theme 2 – Government Policy: Fiscal Policy (Government Spending and Taxation)',
        'Theme 2 – Government Policy: Monetary Policy (Interest Rates and the Bank of England)',
        'Theme 2 – Government Policy: Conflicts Between Economic Objectives',
        'Theme 2 – International Trade: Globalisation, Comparative Advantage, Imports and Exports',
        'Theme 2 – International Trade: Exchange Rates — Determination and Impact',
        'Theme 2 – International Trade: Trade Blocs, Tariffs and Trade Barriers',
        'Theme 2 – Government Economic Objectives: Balancing Growth, Inflation, Employment and Trade',
        'Application of Economic Data: Interpreting and Evaluating Economic Stimulus Material',
      ],
    }},

    // ── French (AQA 8658) ──────────────────────────────────────────────────────
    'French': { papers: {
      1: [
        'Listening – Theme 1: Identity and Culture (Family, Friendships, Social Media, Free Time)',
        'Listening – Theme 2: Local, National, International and Global Areas of Interest (Town, Travel, Environment)',
        'Listening – Theme 3: Current and Future Study and Employment (School Life, Jobs, Future Plans)',
        'Listening – Phonics: Recognition of Nasal Sounds, Liaison, Silent Letters',
        'Listening – Question Types: Multiple Choice, Non-Verbal, Gap-Fill, Translation',
      ],
      2: [
        'Speaking – Role Play (Formal and Informal Contexts)',
        'Speaking – Photo Card: Description, Follow-Up Questions',
        'Speaking – General Conversation: Theme 1 (Identity and Culture)',
        'Speaking – General Conversation: Theme 2 (Local Area and Global Issues)',
        'Speaking – General Conversation: Theme 3 (School and Future Plans)',
        'Speaking – Pronunciation and Spontaneity',
        'Speaking – Using Opinions and Justifications (à mon avis, je pense que)',
      ],
      3: [
        'Reading – Theme 1: Identity and Culture',
        'Reading – Theme 2: Local, National and Global Issues',
        'Reading – Theme 3: Study and Employment',
        'Reading – Translation into English (Higher)',
        'Grammar – Present Tense: Regular (-er, -ir, -re) and Irregular Verbs',
        'Grammar – Perfect Tense: avoir and être Auxiliaries, Past Participle Agreement',
        'Grammar – Imperfect Tense',
        'Grammar – Future Tense (Simple Future and Immediate Future — aller + Infinitive)',
        'Grammar – Conditional Tense',
        'Grammar – Pluperfect Tense (Higher)',
        'Grammar – Reflexive Verbs',
        'Grammar – Negative Structures (ne...pas, ne...jamais, ne...rien, ne...plus)',
        'Grammar – Modal Verbs (pouvoir, vouloir, devoir, falloir)',
        'Grammar – Pronouns (Subject, Object, Relative, Reflexive, y and en)',
        'Grammar – Adjective Agreement and Position',
        'Grammar – Comparatives and Superlatives',
        'Grammar – Conjunctions and Complex Sentences',
        'Grammar – Question Formation (Inversion, Est-ce que, Intonation)',
        'Vocabulary – All AQA Theme Vocabulary Lists',
      ],
      4: [
        'Writing – Translation from English into French',
        'Writing – Structured Questions (Short and Extended Response)',
        'Writing – Open-Ended Writing Task (Higher: ~150 words, Foundation: ~90 words)',
        'Writing – Accuracy: Tense Range, Agreement, Spelling',
        'Writing – Complexity: Range of Structures and Vocabulary, Opinions and Justifications',
      ],
    }},

    // ── German (AQA 8668) ──────────────────────────────────────────────────────
    'German': { papers: {
      1: [
        'Listening – Theme 1: Identity and Culture (Family, Technology, Hobbies)',
        'Listening – Theme 2: Local, National, International and Global Issues',
        'Listening – Theme 3: Current and Future Study and Employment',
        'Listening – Phonics: Umlauts (ä, ö, ü), ß, ch, sch, ei vs ie',
        'Listening – Question Types: Multiple Choice, Non-Verbal, Gap-Fill, Translation',
      ],
      2: [
        'Speaking – Role Play (Formal and Informal)',
        'Speaking – Photo Card: Description, Discussion',
        'Speaking – General Conversation: Theme 1',
        'Speaking – General Conversation: Theme 2',
        'Speaking – General Conversation: Theme 3',
        'Speaking – Pronunciation and Spontaneity',
      ],
      3: [
        'Reading – Theme 1: Identity and Culture',
        'Reading – Theme 2: Local, National and Global Issues',
        'Reading – Theme 3: Study and Employment',
        'Reading – Translation into English (Higher)',
        'Grammar – Present Tense: Regular and Irregular Verbs',
        'Grammar – Perfect Tense: haben and sein Auxiliaries',
        'Grammar – Imperfect Tense (Imperfekt)',
        'Grammar – Future Tense (Futur I) and Conditional (Konjunktiv II)',
        'Grammar – Cases: Nominative, Accusative, Dative, Genitive',
        'Grammar – Articles: Definite, Indefinite and Negative (ein, kein)',
        'Grammar – Adjective Endings (Weak, Mixed and Strong Declension)',
        'Grammar – Modal Verbs (können, müssen, wollen, dürfen, sollen, mögen)',
        'Grammar – Separable and Inseparable Verbs',
        'Grammar – Reflexive Verbs',
        'Grammar – Word Order: SVOMPT, Inversion, Subordinate Clauses (weil, obwohl, dass)',
        'Grammar – Relative Clauses',
        'Grammar – Prepositions (Accusative, Dative, Two-Way)',
        'Grammar – Passive Voice (Higher)',
        'Vocabulary – All AQA Theme Vocabulary Lists',
      ],
      4: [
        'Writing – Translation from English into German',
        'Writing – Structured Questions (Short and Extended Response)',
        'Writing – Open-Ended Writing Task',
        'Writing – Accuracy: Cases, Tenses, Agreement',
        'Writing – Complexity: Subordinate Clauses, Modal Verbs, Range of Tenses',
      ],
    }},

    // ── Spanish (AQA 8698) ─────────────────────────────────────────────────────
    'Spanish': { papers: {
      1: [
        'Listening – Theme 1: Identity and Culture (Family, Relationships, Technology, Free Time)',
        'Listening – Theme 2: Local, National, International and Global Issues',
        'Listening – Theme 3: Current and Future Study and Employment',
        'Listening – Phonics: Vowel Sounds, ll, ñ, rr, j, v',
        'Listening – Question Types: Multiple Choice, Non-Verbal, Gap-Fill, Translation',
      ],
      2: [
        'Speaking – Role Play',
        'Speaking – Photo Card: Description and Discussion',
        'Speaking – General Conversation: All Three Themes',
        'Speaking – Pronunciation and Spontaneity',
      ],
      3: [
        'Reading – Theme 1: Identity and Culture',
        'Reading – Theme 2: Local, National and Global Issues',
        'Reading – Theme 3: Study and Employment',
        'Reading – Translation into English (Higher)',
        'Grammar – Present Tense: Regular, Irregular and Stem-Changing Verbs',
        'Grammar – Preterite Tense (Regular and Irregular)',
        'Grammar – Imperfect Tense',
        'Grammar – Future Tense and Conditional',
        'Grammar – Perfect Tense (Higher)',
        'Grammar – Subjunctive Mood (Higher)',
        'Grammar – Reflexive Verbs',
        'Grammar – Ser vs Estar',
        'Grammar – Gustar-Type Verbs (encantar, interesar, doler)',
        'Grammar – Modal Verbs (poder, querer, deber, tener que)',
        'Grammar – Negatives, Pronouns and Adjective Agreement',
        'Grammar – Por vs Para',
        'Vocabulary – All AQA Theme Vocabulary Lists',
      ],
      4: [
        'Writing – Translation from English into Spanish',
        'Writing – Structured Questions (Short and Extended Response)',
        'Writing – Open-Ended Writing Task',
        'Writing – Accuracy: Tenses, Agreement, Spelling',
        'Writing – Complexity: Range of Structures and Vocabulary',
      ],
    }},

    // ── Mandarin Chinese (AQA 8673) ────────────────────────────────────────────
    'Mandarin Chinese': { papers: {
      1: [
        'Listening – Theme 1: Identity and Culture (Family, Lifestyle, Social Media)',
        'Listening – Theme 2: Local, National, International and Global Issues',
        'Listening – Theme 3: Current and Future Study and Employment',
        'Listening – Tone Recognition (Four Tones and Neutral Tone) and Pinyin',
      ],
      2: [
        'Speaking – Role Play',
        'Speaking – Photo Card: Description and Discussion',
        'Speaking – General Conversation: All Three Themes',
        'Speaking – Tone Accuracy and Pronunciation',
      ],
      3: [
        'Reading – Theme 1: Identity and Culture',
        'Reading – Theme 2: Local, National and Global Issues',
        'Reading – Theme 3: Study and Employment',
        'Grammar – Sentence Structure: Subject-Verb-Object',
        'Grammar – Measure Words (量词)',
        'Grammar – Tense Indicators (了, 过, 在, 会, 要, 想)',
        'Grammar – Complements of Degree (得)',
        'Grammar – Comparison Structures (比, 没有)',
        'Grammar – ba-Construction (把) and bei-Construction (被)',
        'Grammar – Question Formation (吗, 呢, Question Words)',
        'Character Recognition: AQA Required Vocabulary',
        'Character Recognition: Radicals and Stroke Order',
      ],
      4: [
        'Writing – Characters: Accuracy of High-Frequency Characters',
        'Writing – Structured Writing Task',
        'Writing – Open-Ended Writing Task (Higher)',
        'Writing – Translation from English into Mandarin (Higher)',
      ],
    }},

    // ── Arabic (AQA 8658-equivalent series) ────────────────────────────────────
    'Arabic': { papers: {
      1: [
        'Listening – Theme 1: Identity and Culture',
        'Listening – Theme 2: Local, National, International and Global Issues',
        'Listening – Theme 3: Current and Future Study and Employment',
        'Listening – Recognising Sun and Moon Letters in Spoken Arabic',
      ],
      2: [
        'Speaking – Role Play',
        'Speaking – Photo Card: Description and Discussion',
        'Speaking – General Conversation: All Three Themes',
      ],
      3: [
        'Reading – Theme 1: Identity and Culture',
        'Reading – Theme 2: Local, National and Global Issues',
        'Reading – Theme 3: Study and Employment',
        'Grammar – Present Tense: Regular Verb Conjugation',
        'Grammar – Past Tense: Trilateral Root System',
        'Grammar – Dual and Plural Forms (Sound and Broken Plurals)',
        'Grammar – Definite Article (ال) and Sun/Moon Letter Assimilation',
        'Grammar – Idafa (Possessive Construction)',
        'Grammar – Root System: Identifying Roots and Patterns (Wazn)',
        'Script: Reading and Writing Arabic Script — Letter Forms (Initial, Medial, Final, Isolated)',
        'Script: Diacritics (Tashkeel) and Their Role in Pronunciation',
      ],
      4: [
        'Writing – Translation from English into Arabic',
        'Writing – Structured Writing Task',
        'Writing – Open-Ended Writing Task (Higher)',
      ],
    }},

    // ── Polish (AQA 8685) ──────────────────────────────────────────────────────
    'Polish': { papers: {
      1: [
        'Listening – Theme 1: Identity and Culture',
        'Listening – Theme 2: Local Area, Holiday, Global and Environmental Issues',
        'Listening – Theme 3: School, Future Plans and Employment',
      ],
      2: [
        'Speaking – Role Play',
        'Speaking – Photo Card: Description and Discussion',
        'Speaking – General Conversation (All Themes)',
      ],
      3: [
        'Reading – Theme 1: Identity and Culture',
        'Reading – Theme 2: Local Area, Holiday, Global and Environmental Issues',
        'Reading – Theme 3: School, Future Plans and Employment',
        'Grammar – Cases (Nominative, Accusative, Genitive, Dative, Instrumental, Locative)',
        'Grammar – Verb Aspects (Perfective and Imperfective)',
        'Grammar – Declension of Nouns and Adjectives by Gender and Case',
        'Grammar – Verb Conjugation: Present, Past and Future Tense',
        'Grammar – Numbers and Their Effect on Noun Case',
        'Vocabulary – AQA Theme Vocabulary List',
      ],
      4: [
        'Writing – Translation from English into Polish',
        'Writing – Structured and Open-Ended Tasks',
        'Writing – Accuracy of Cases and Verb Forms',
      ],
    }},

    // ── Urdu (AQA 8648) ────────────────────────────────────────────────────────
    'Urdu': { papers: {
      1: [
        'Listening – Theme 1: Identity and Culture',
        'Listening – Theme 2: Local Area, Holiday and Global Issues',
        'Listening – Theme 3: School and Future Plans',
      ],
      2: [
        'Speaking – Role Play',
        'Speaking – Photo Card',
        'Speaking – General Conversation (All Themes)',
      ],
      3: [
        'Reading – All Themes: Identity, Local/Global Issues, School and Future Plans',
        'Reading – Nastaliq Script Recognition',
        'Grammar – Verb Tenses (Present, Past, Future)',
        'Grammar – Gender and Number Agreement of Nouns and Adjectives',
        'Grammar – Postpositions and Case Marking (ne, ko, se, mein, par)',
        'Grammar – Izafat Construction',
        'Vocabulary – AQA Theme Vocabulary List',
      ],
      4: [
        'Writing – Translation from English into Urdu',
        'Writing – Structured and Open-Ended Tasks',
        'Writing – Accuracy of Script and Grammar',
      ],
    }},

    // ── Art & Design (AQA 8201/8202/8203/8204/8206) ───────────────────────────
    'Art & Design': { papers: {
      1: [
        'AO1 – Develop: Research, Analysis of Artists, Craftspeople and Designers',
        'AO1 – Develop: Contextual Sources (Art Movements, Historical and Contemporary)',
        'AO1 – Develop: Mind-Mapping and Initial Idea Generation',
        'AO2 – Explore: Experimentation with Materials, Techniques and Processes',
        'AO2 – Explore: Reviewing, Modifying and Refining Ideas',
        'AO2 – Explore: Health and Safety in Using Media and Materials',
        'AO3 – Record: Observational Drawing and Recording',
        'AO3 – Record: Annotation and Critical Analysis of Own Work',
        'AO3 – Record: Photography and Digital Recording of Ideas',
        'AO4 – Present: Personal Response and Final Outcome',
        'AO4 – Present: Realising Intentions Clearly and Meaningfully',
        'Portfolio (Component 1): Sustained Project Over the Course',
      ],
      2: [
        'Component 2 – Externally Set Assignment: Responding to the Set Theme/Starting Point',
        'Component 2 – Preparatory Period: Research, Planning and Development',
        'Component 2 – 10-Hour Supervised Time: Final Piece',
        'Component 2 – AO1–AO4 Applied to Set Brief',
      ],
    }},

    // ── Drama (AQA 8261) ───────────────────────────────────────────────────────
    'Drama': { papers: {
      1: [
        'Component 1 – Understanding Drama (Written Exam)',
        'Section A – Set Play Study: Plot, Character, Themes and Context',
        'Section A – Set Play: Analysing Stage Directions and Performance Space',
        'Section A – Set Play: Performance and Design Choices (Lighting, Sound, Costume, Set)',
        'Section B – Live Theatre Evaluation: Analysing a Professional Production',
        'Section B – Theatrical Language: Describing and Evaluating Performance Techniques',
        'Staging Types: Proscenium, Thrust, In-the-Round, Promenade, Traverse',
        'Theatrical Roles: Director, Performer, Set Designer, Lighting Designer, Sound Designer',
        'Design Skills: Set, Costume, Lighting, Sound and Puppet Design Terminology',
      ],
      2: [
        'Component 2 – Devising Drama (Non-Exam Assessment)',
        'Devising Process: Research, Exploration, Development and Refinement',
        'Devising: Performance Skills — Voice (Tone, Pace, Pitch, Pause, Projection)',
        'Devising: Performance Skills — Physical (Gesture, Posture, Movement, Facial Expression)',
        'Devising: Use of a Stimulus (Text, Image, Theme, Object)',
        'Portfolio: Documenting the Devising Process (Aims, Development, Evaluation)',
      ],
      3: [
        'Component 3 – Texts in Practice (Non-Exam Assessment)',
        'Scripted Performance: Two Contrasting Extracts from Different Plays',
        'Interpreting Text: Realising Dramatic Intentions',
        'Use of Performance Space, Staging and Design',
        'Ensemble and Collaborative Work',
      ],
    }},

    // ── Music (AQA 8271) ───────────────────────────────────────────────────────
    'Music': { papers: {
      1: [
        'Listening – Area of Study 1: Western Classical Tradition 1650–1910 (Baroque, Classical, Romantic)',
        'Listening – Area of Study 2: Popular Music (Rock, Pop, Blues, Jazz, Musical Theatre)',
        'Listening – Area of Study 3: Traditional Music (British and World Folk, Set Works)',
        'Listening – Area of Study 4: Western Classical Tradition Since 1910 OR Film Music OR Jazz',
        'Listening Skills – Musical Elements: Rhythm and Metre',
        'Listening Skills – Musical Elements: Melody and Pitch',
        'Listening Skills – Musical Elements: Harmony and Tonality',
        'Listening Skills – Musical Elements: Texture and Structure',
        'Listening Skills – Musical Elements: Timbre and Dynamics',
        'Listening Skills – Identifying Instruments and Vocal Types',
        'Listening Skills – Musical Notation: Treble and Bass Clef, Rhythmic Notation',
        'Listening Skills – Set Work Analysis: Score-Reading and Dictation Questions',
        'Performance (NEA): Solo and/or Ensemble Performance',
        'Composition (NEA): Composition to a Brief and Free Composition',
      ],
    }},

    // ── Physical Education (AQA 8582) ─────────────────────────────────────────
    'Physical Education': { papers: {
      1: [
        '3.1 – Applied Anatomy and Physiology: The Skeletal System (Functions, Joints, Types of Movement)',
        '3.1 – Applied Anatomy and Physiology: The Muscular System (Major Muscles, Antagonistic Pairs)',
        '3.1 – Applied Anatomy and Physiology: The Cardiovascular System (Heart Structure, Blood Vessels)',
        '3.1 – Applied Anatomy and Physiology: The Respiratory System (Breathing Mechanics, Gas Exchange)',
        '3.1 – Applied Anatomy and Physiology: Energy Systems (ATP-PC, Lactic Acid, Aerobic)',
        '3.1 – Applied Anatomy and Physiology: Short and Long-Term Effects of Exercise',
        '3.2 – Movement Analysis: Lever Systems (1st, 2nd, 3rd Class)',
        '3.2 – Movement Analysis: Planes and Axes of Movement',
        '3.3 – Physical Training: Components of Fitness (Health-Related and Skill-Related)',
        '3.3 – Physical Training: Principles of Training (FITT, Overload, Specificity, Reversibility)',
        '3.3 – Physical Training: Methods of Training (Interval, Circuit, Continuous, Weight, Plyometric, Flexibility)',
        '3.3 – Physical Training: Fitness Testing and Evaluation',
        '3.3 – Physical Training: Warm-Up and Cool-Down',
      ],
      2: [
        '3.4 – Sports Psychology: Skill Classification (Open/Closed, Gross/Fine, Discrete/Continuous)',
        '3.4 – Sports Psychology: Goal Setting (SMART Goals)',
        '3.4 – Sports Psychology: Mental Preparation: Arousal, Anxiety and the Inverted-U Theory',
        '3.4 – Sports Psychology: Guidance and Feedback Types',
        '3.5 – Socio-Cultural Influences: Engagement Patterns in Physical Activity (Age, Gender, Ethnicity)',
        '3.5 – Socio-Cultural Influences: Commercialisation and Sponsorship; the Media',
        '3.5 – Socio-Cultural Influences: Ethics in Sport (PEDs, Violence, Gamesmanship, Sportsmanship)',
        '3.6 – Health, Fitness and Wellbeing: Components of a Healthy Lifestyle',
        '3.6 – Health, Fitness and Wellbeing: Diet and Nutrition for Sport',
        '3.6 – Health, Fitness and Wellbeing: Physical, Emotional and Social Health Benefits',
        'Practical Performance (NEA): Two Practical Activities',
        'Analysis and Evaluation of Performance (NEA): Written Analysis',
      ],
    }},

    // ── Food Preparation & Nutrition (AQA 8585) ───────────────────────────────
    'Food Preparation & Nutrition': { papers: {
      1: [
        'Food Commodities: Cereals and Cereal Products',
        'Food Commodities: Fruit and Vegetables',
        'Food Commodities: Milk, Cheese and Eggs',
        'Food Commodities: Meat, Fish and Seafood',
        'Food Commodities: Vegetable Proteins (Tofu, Quorn, Soya, Beans, Pulses)',
        'Food Commodities: Fats, Oils and Sugars',
        'Principles of Nutrition: Macronutrients (Proteins, Carbohydrates, Fats)',
        'Principles of Nutrition: Micronutrients (Vitamins A, B, C, D; Iron, Calcium)',
        'Principles of Nutrition: Dietary Fibre and Water',
        'Diet and Good Health: Reference Nutrient Intakes (RNI) and EAR',
        'Diet and Good Health: Nutritional Needs Across Life Stages',
        'Diet and Good Health: Diet-Related Conditions (Obesity, Diabetes, Anaemia, Osteoporosis)',
        'Diet and Good Health: Energy Balance and Calculating Energy Needs',
        'The Science of Food: Enzymic Browning, Denaturation, Coagulation',
        'The Science of Food: Gelatinisation, Caramelisation, Maillard Reaction',
        'The Science of Food: Emulsification, Aeration, Gluten Development, Raising Agents',
        'The Science of Food: Food Spoilage — Bacteria, Moulds, Yeast',
        'The Science of Food: Preservation Methods and Food Safety (Temperature Danger Zone)',
        'Where Food Comes From: Food Provenance and Traceability',
        'Where Food Comes From: Sustainability, Food Miles and Seasonality',
        'Where Food Comes From: Farming Methods (Intensive, Organic) and Food Processing',
        'Cooking and Food Preparation: Cooking Methods (Boiling, Frying, Baking, Steaming, Grilling)',
        'Cooking and Food Preparation: Knife Skills and Equipment',
        'Cooking and Food Preparation: Sensory Analysis and Testing',
        'NEA 1 – Food Investigation Task (Written Report)',
        'NEA 2 – Food Preparation Assessment (Practical: Three-Hour Practical Exam)',
      ],
    }},

    // ── Design & Technology (AQA 8552) ────────────────────────────────────────
    'Design & Technology': { papers: {
      1: [
        'Core Technical Principles: New and Emerging Technologies (Industry 4.0, IoT)',
        'Core Technical Principles: Energy Generation and Storage',
        'Core Technical Principles: Development in New Materials (Smart Materials, Composites, Technical Textiles)',
        'Core Technical Principles: Mechanical Devices (Cams, Gears, Linkages, Pulleys)',
        'Core Technical Principles: Materials — Papers and Boards (Properties, Working Characteristics)',
        'Core Technical Principles: Materials — Natural and Manufactured Timbers',
        'Core Technical Principles: Materials — Ferrous and Non-Ferrous Metals, Alloys',
        'Core Technical Principles: Materials — Thermoplastics and Thermosetting Polymers',
        'Core Technical Principles: Materials — Woven, Non-Woven and Knitted Textiles',
        'Core Technical Principles: Ecological and Social Footprint (LCA, Sustainability, the 6 Rs)',
        'Specialist Technical Principles: Selection of Materials/Components Based on Properties',
        'Specialist Technical Principles: Scales of Production (One-Off, Batch, Mass, Continuous)',
        'Specialist Technical Principles: Specialist Processes and Techniques (Focus Area)',
        'Designing and Making Principles: Design Strategies (User-Centred, Iterative, Systems Thinking)',
        'Designing and Making Principles: Communication of Design Ideas (Sketching, CAD, Orthographic)',
        'Designing and Making Principles: Prototyping, Testing and Evaluation Against a Specification',
        'Designing and Making Principles: Health, Safety and Risk Assessment in the Workshop',
        'Non-Exam Assessment (NEA): Design and Make Task',
      ],
    }},

    // ── Media Studies (AQA 8572) ───────────────────────────────────────────────
    'Media Studies': { papers: {
      1: [
        'Section A – Media Language: Semiotics (Barthes — Denotation/Connotation, Myth)',
        'Section A – Media Language: Narrative Theory (Propp, Todorov, Lévi-Strauss)',
        'Section A – Media Language: Genre Theory (Neale, Altman)',
        'Section A – Representation: Selection and Construction of Reality',
        'Section A – Representation: Stereotyping and Counter-Typing',
        'Section A – Representation: Gender, Ethnicity, Age and Class in the Media',
        'Section A – Media Industries: Ownership and Control (Horizontal/Vertical Integration)',
        'Section A – Media Industries: Regulation (Ofcom, BBFC, IPSO)',
        'Section A – Media Industries: Funding Models (Subscription, Advertising, Public Service)',
        'Section A – Audiences: Passive and Active Audience Theories',
        'Section A – Audiences: Uses and Gratifications Theory (Blumler and Katz)',
        'Section A – Audiences: Reception Theory (Stuart Hall — Preferred, Negotiated, Oppositional)',
        'Section A – Set Products: Newspapers (Front Pages, Layout, Language)',
        'Section A – Set Products: Advertising and Marketing (Print and Online)',
        'Section A – Set Products: Music Video',
        'Section A – Set Products: Online and Social Media',
      ],
      2: [
        'Section B – Television: Long-Form TV Drama — Genre, Narrative, Representation',
        'Section B – Television: Comparative UK and US TV Drama Set Products',
        'Section B – Film Marketing: Film Posters, Trailers and Distribution',
        'Section B – Radio: BBC Radio vs Commercial Radio — Regulation and Audience',
        'Section B – Video Games: Industry Context, Representation in Games',
        'Component 2 – Creating Media Products (Non-Exam Assessment): Statement of Intent',
        'Component 2 – Creating Media Products (Non-Exam Assessment): Application of Theoretical Framework',
      ],
    }},

    // ── Film Studies (AQA 8351) ────────────────────────────────────────────────
    'Film Studies': { papers: {
      1: [
        'Film Language: Mise-en-scène (Setting, Costume, Lighting, Performance)',
        'Film Language: Cinematography (Camera Angles, Shot Types, Movement)',
        'Film Language: Editing (Continuity Editing, Montage, Pace)',
        'Film Language: Sound (Diegetic, Non-Diegetic, Score, Silence)',
        'Film Concepts: Narrative Structure (Three-Act, Non-Linear, Equilibrium)',
        'Film Concepts: Genre (Conventions, Hybridity, Subgenre)',
        'Film Concepts: Representation (Gender, Ethnicity, Class)',
        'Film Concepts: Auteur Theory and Directorial Style',
        'Set Film 1: American Film (Mainstream Hollywood)',
        'Set Film 2: British Film (Context, Genre, Industry)',
        'Set Film 3: Global Cinema (European or Wider World Film)',
        'Set Film 4: Documentary Film or Silent Film',
      ],
      2: [
        'Film Industries: Hollywood Studio System and Contemporary Hollywood',
        'Film Industries: British Film Industry (Funding, BFI, UK Tax Relief)',
        'Film Industries: Specialised Film — Distribution and Marketing',
        'Film Audiences: Mainstream and Niche Audiences, Fandom, Targeting',
        'Auteur/Critical Study: Comparative Analysis of an Auteur\'s Work',
        'Short Film Studies (Non-Exam Assessment): Screenplay or Short Film Production',
      ],
    }},

    // ── Engineering (AQA 8852) ─────────────────────────────────────────────────
    'Engineering': { papers: {
      1: [
        'Engineering Principles: Forces and Structural Analysis (Tension, Compression, Shear, Torsion)',
        'Engineering Principles: Simple Machines (Levers, Pulleys, Gears, Cams)',
        'Engineering Principles: Electrical Circuits (Series, Parallel, Ohm\'s Law)',
        'Engineering Principles: Electronics (Sensors, Transistors, Microcontrollers, Logic Gates)',
        'Engineering Principles: Materials and Their Properties (Metals, Polymers, Composites, Smart Materials)',
        'Engineering Principles: Manufacturing Processes (Casting, Forming, Machining, Joining)',
        'Engineering Principles: Engineering Drawing and CAD/CAM',
        'Engineering in Context: New and Emerging Technologies (Automation, Robotics, AI)',
        'Engineering in Context: Sustainability and Environmental Impact',
        'Engineering in Context: Health and Safety in Engineering Workplaces',
        'NEA: Engineering Design and Make Task — Client Brief and Specification',
        'NEA: Engineering Design and Make Task — Prototyping and Testing',
      ],
    }},

  }, // end AQA GCSE

  // ── EDEXCEL GCSE ────────────────────────────────────────────────────────────
  Edexcel: {

    // ── Mathematics (Edexcel 1MA1 — Corbettmaths topic list) ─────────────────
    'Mathematics': { papers: {
      1: [ // Non-calculator
        'Number – Integers, Decimals and Rounding (Significant Figures, Estimation)',
        'Number – Fractions, Decimals and Percentages: Conversions and Operations',
        'Number – Percentages: Percentage Change, Reverse Percentages, Compound Interest',
        'Number – Powers, Roots and Surds (Higher)',
        'Number – Standard Form: Converting and Calculating',
        'Number – Error Intervals and Bounds (Higher)',
        'Number – Listing Strategies and the Product Rule for Counting (Higher)',
        'Ratio and Proportion – Ratio: Simplifying and Sharing in a Given Ratio',
        'Ratio and Proportion – Direct and Inverse Proportion (including Graphically, Higher)',
        'Algebra – Simplifying Expressions, Expanding and Factorising',
        'Algebra – Solving Linear Equations and Inequalities',
        'Algebra – Changing the Subject of a Formula (including Subject Twice, Higher)',
        'Algebra – Quadratic Equations: Factorising, Formula, Completing the Square (Higher)',
        'Algebra – Algebraic Fractions (Higher)',
        'Algebra – Sequences: nth Term Linear and Quadratic (Higher)',
        'Algebra – Simultaneous Equations: Linear and Linear/Quadratic (Higher)',
        'Algebra – Proof (Higher)',
        'Algebra – Functions: Composite and Inverse (Higher)',
        'Algebra – Iteration (Higher)',
        'Statistics – Averages and Range (Mean, Median, Mode) from Lists and Tables',
        'Statistics – Frequency Tables and Grouped Data',
        'Statistics – Pictograms, Bar Charts, Pie Charts',
        'Statistics – Scatter Graphs, Correlation and Lines of Best Fit',
        'Probability – Basic Probability, Sample Space Diagrams',
        'Probability – Tree Diagrams, Conditional Probability (Higher)',
        'Probability – Venn Diagrams and Set Notation',
      ],
      2: [ // Calculator
        'Geometry – Angles: Parallel Lines, Polygons, Interior and Exterior Angles',
        'Geometry – Bearings and Scale Diagrams',
        'Geometry – Pythagoras\' Theorem (2D and 3D, Higher)',
        'Geometry – Trigonometry: SOH CAH TOA, Sine and Cosine Rule (Higher)',
        'Geometry – Area and Perimeter: 2D Shapes, Circles, Sectors',
        'Geometry – Volume and Surface Area: Prisms, Cylinders, Pyramids, Cones, Spheres (Higher)',
        'Geometry – Transformations: Reflection, Rotation, Translation, Enlargement',
        'Geometry – Congruence and Similarity (including Area/Volume Scale Factors, Higher)',
        'Geometry – Vectors (Higher)',
        'Geometry – Circle Theorems (Higher)',
        'Geometry – Constructions and Loci',
        'Graphs – Straight-Line Graphs: Gradient, Intercept, y = mx + c',
        'Graphs – Parallel and Perpendicular Lines (Higher)',
        'Graphs – Quadratic, Cubic and Reciprocal Graphs',
        'Graphs – Exponential and Trigonometric Graphs (Higher)',
        'Graphs – Transformations of Graphs (Higher)',
        'Graphs – Distance-Time and Velocity-Time Graphs',
        'Graphs – Area Under a Curve (Higher)',
        'Statistics – Cumulative Frequency, Box Plots, Histograms (Higher)',
        'Statistics – Comparing Distributions Using Averages and Spread',
        'Statistics – Sampling Methods',
      ],
      3: [ // Calculator
        'Mixed Topics: Problem Solving with Number, Algebra, and Geometry',
        'Applied Mathematics: Speed, Distance, Time; Density; Pressure',
        'Financial Mathematics: Interest, Tax, Wages, Best Buys',
        'Ratio and Scale: Maps, Scale Diagrams, Currency Conversion',
        'Algebraic Reasoning: Proof, Inequalities, Equation Solving',
        'Geometric Reasoning: Circle Theorems, Pythagoras, Trigonometry (Higher)',
        'Statistical Reasoning: Interpreting and Critiquing Data Representations',
      ],
    }},

    // ── Combined Science (Edexcel 1SC0) ───────────────────────────────────────
    'Combined Science': { papers: {
      1: [ // Biology 1
        'CB1 – Key Concepts in Biology: Cell Structure, Microscopy, Enzymes, Movement of Substances',
        'CB2 – Cells and Control: Mitosis, the Cell Cycle, the Nervous System, Reflexes',
        'CB3 – Genetics: DNA Structure, Protein Synthesis, Inheritance, Punnett Squares',
        'CB4 – Natural Selection and Genetic Modification: Evolution, Selective Breeding, GM',
        'CB5 – Health, Disease and the Development of Medicines: Pathogens, Immunity, Drug Trials',
        'Required Practicals: Microscopy, Osmosis, Effect of Antibiotics on Bacterial Growth',
      ],
      2: [ // Biology 2
        'CB6 – Plant Structures and Their Functions: Photosynthesis, Transpiration, Leaf Adaptations',
        'CB7 – Animal Coordination, Control and Homeostasis: Hormones, Nervous System, Menstrual Cycle',
        'CB8 – Exchange and Transport in Animals: Circulatory System, Heart, Blood Vessels',
        'CB9 – Ecosystems and Material Cycles: Carbon and Water Cycle, Biodiversity',
        'Required Practicals: Photosynthesis (Light Intensity), Reaction Time, Fieldwork Sampling (Quadrats)',
      ],
      3: [ // Chemistry 1
        'CC1 – States of Matter and Mixtures: Particle Model, Separation Techniques',
        'CC2 – Atomic Structure: History of the Atom, Sub-atomic Particles, Isotopes',
        'CC3 – The Periodic Table: Groups 1, 7, 0 and Transition Metals',
        'CC4 – Ionic, Covalent and Metallic Bonding; Structures and Properties',
        'CC5 – Formulae, Equations and Amounts of Substance: Moles, Conservation of Mass',
        'CC6 – Electrolytic Processes: Molten and Aqueous Electrolysis',
        'CC7 – Obtaining and Using Metals: Reactivity Series, Extraction, Recycling',
        'CC8 – Acids, Bases and Salts: Neutralisation, Salt Preparation, pH Scale',
        'Required Practicals: Chromatography, Titration, Preparation of a Pure Dry Salt',
      ],
      4: [ // Chemistry 2
        'CC9 – Reversible Reactions and Equilibria: Le Chatelier\'s Principle',
        'CC10 – Groups in the Periodic Table (Further Detail): Halogens, Alkali Metals',
        'CC11 – Rate of Reaction: Collision Theory, Factors Affecting Rate, Catalysts',
        'CC12 – Energy Changes in Reactions: Exothermic, Endothermic, Bond Energy Calculations',
        'CC13 – Fuels and Earth Science: Hydrocarbons, Crude Oil, Cracking, Atmosphere',
        'CC14 – Chemical Analysis: Flame Tests, Ion Tests, Chromatography, Gas Tests',
        'Required Practicals: Rate of Reaction (Disappearing Cross / Gas Volume), Temperature Change',
      ],
      5: [ // Physics 1
        'CP1 – Motion: Distance-Time, Velocity-Time, Acceleration, Newton\'s Laws',
        'CP2 – Forces and Motion: Weight, Friction, Stopping Distance, Momentum (Higher)',
        'CP3 – Conservation of Energy: Energy Stores and Transfers, Efficiency, Specific Heat Capacity',
        'CP4 – Waves: Properties, Sound Waves, the Wave Equation',
        'CP5 – Light and the Electromagnetic Spectrum: Reflection, Refraction, Uses and Hazards',
        'CP6 – Radioactivity: Types of Decay, Half-Life, Uses and Hazards',
        'Required Practicals: Investigating Acceleration, Investigating Waves, Resistance of a Wire',
      ],
      6: [ // Physics 2
        'CP7 – Astronomy: The Solar System, Life Cycle of Stars, Orbital Motion, the Universe',
        'CP8 – Energy — Forces Doing Work: Specific Heat Capacity, Power, National Grid, Transformers',
        'CP9 – Forces and Their Effects: Elasticity, Moments, Pressure in Fluids',
        'CP10 – Electricity and Circuits: Ohm\'s Law, Series/Parallel Circuits, I-V Graphs',
        'CP11 – Static Electricity and Magnetism: Electric Fields, Magnetic Fields',
        'CP12 – Electromagnetic Induction and Generators; the Motor Effect',
        'Required Practicals: Specific Heat Capacity, I-V Characteristics, Density',
      ],
    }},

    // ── Biology (Edexcel 1BI0) ─────────────────────────────────────────────────
    'Biology': { papers: {
      1: [
        'SB1 – Key Concepts in Biology: Cells (Structure, Microscopy, Enzymes, DNA, Movement of Substances)',
        'SB2 – Cells and Control: Mitosis, the Cell Cycle, Stem Cells, the Nervous System',
        'SB3 – Genetics: Meiosis, DNA Structure, Protein Synthesis, Inheritance (Monohybrid Crosses)',
        'SB4 – Natural Selection and Genetic Modification: Evolution, Speciation, GM Techniques',
        'SB5 – Health, Disease and the Development of Medicines: Pathogens, Immunity, Vaccines, Drug Trials',
        'SB6 – Plant Structures and Their Functions: Photosynthesis, Transpiration, Translocation',
        'Required Practicals: Microscopy, Osmosis, Photosynthesis (Light Intensity), Antibiotics',
      ],
      2: [
        'SB7 – Animal Coordination, Control and Homeostasis: Hormones, Blood Glucose, Kidneys',
        'SB8 – Exchange and Transport in Animals: Circulatory, Respiratory and Digestive Systems',
        'SB9 – Ecosystems and Material Cycles: Carbon, Water and Nitrogen Cycle',
        'SB10 – Organisms and Their Environment: Abiotic/Biotic Factors, Population Sampling',
        'SB11 – Genes, Inheritance and Selection: Genotype/Phenotype, Selective Breeding',
        'SB12 – Variation and Evolution: Evidence for Evolution, Classification',
        'Required Practicals: Reaction Time, Fieldwork Sampling (Quadrats and Transects)',
      ],
    }},

    // ── Chemistry (Edexcel 1CH0) ───────────────────────────────────────────────
    'Chemistry': { papers: {
      1: [
        'SC1 – States of Matter and Mixtures: Particle Model, Separation Techniques',
        'SC2 – Atomic Structure: Sub-Atomic Particles, Isotopes, Electronic Configuration',
        'SC3 – The Periodic Table: Development, Groups and Periods, Trends',
        'SC4 – Ionic, Covalent and Metallic Bonding: Structures and Properties',
        'SC5 – Formulae, Equations and Amounts of Substance: Moles, Empirical Formulae, Yield',
        'SC6 – Electrolytic Processes: Extraction of Aluminium, Electrolysis of Brine',
        'SC7 – Obtaining and Using Metals: Reactivity Series, Life Cycle Assessment, Recycling',
        'SC8 – Acids, Bases and Salts: Strong/Weak Acids, Neutralisation, Salt Preparation',
        'SC9 – Reversible Reactions and Equilibria: Le Chatelier\'s Principle, the Haber Process',
        'Required Practicals: Titration, Preparation of a Pure Dry Salt, Electrolysis',
      ],
      2: [
        'SC10 – Groups in the Periodic Table: Alkali Metals, Halogens, Noble Gases',
        'SC11 – Rate of Reaction: Collision Theory, Catalysts, Measuring Rate',
        'SC12 – Heat Energy Changes in Chemical Reactions: Exothermic, Endothermic, Bond Energies',
        'SC13 – Fuels and Earth Science: Crude Oil, Cracking, the Atmosphere, Climate Change',
        'SC14 – Chemical Analysis: Chromatography, Flame Tests, Tests for Ions and Gases',
        'SC15 – The Earth\'s Atmosphere and Resources: Potable Water, Life Cycle Assessment',
        'Required Practicals: Rate of Reaction, Chromatography, Identifying Ions',
      ],
    }},

    // ── Physics (Edexcel 1PH0) ─────────────────────────────────────────────────
    'Physics': { papers: {
      1: [
        'SP1 – Motion: Speed, Velocity, Acceleration, Distance-Time and Velocity-Time Graphs',
        'SP2 – Forces and Motion: Newton\'s Laws, Weight, Terminal Velocity, Momentum (Higher)',
        'SP3 – Conservation of Energy: Energy Stores, Transfers, Efficiency, Specific Heat Capacity',
        'SP4 – Waves: Properties, Sound, Ultrasound, the Wave Equation',
        'SP5 – Light and the Electromagnetic Spectrum: Reflection, Refraction, Lenses',
        'SP6 – Radioactivity: Types of Decay, Half-Life, Nuclear Equations, Uses and Hazards',
        'SP7 – Astronomy: The Solar System, Orbital Motion, Life Cycle of Stars, Red-Shift',
        'Required Practicals: Investigating Acceleration, Investigating Waves, Resistance of a Wire, Density',
      ],
      2: [
        'SP8 – Energy — Forces Doing Work: Specific Heat Capacity, Power, Efficiency',
        'SP9 – Forces and Their Effects: Elasticity (Hooke\'s Law), Moments, Pressure, Hydraulics',
        'SP10 – Electricity and Circuits: Charge, Current, Potential Difference, Resistance, I-V Graphs',
        'SP11 – Static Electricity: Electric Fields, Charging by Friction',
        'SP12 – Magnetism and the Motor Effect: Magnetic Fields, Fleming\'s Left-Hand Rule',
        'SP13 – Electromagnetic Induction: Generators, Transformers, the National Grid',
        'SP14 – Particle Model: Density, Changes of State, Specific Latent Heat, Gas Pressure',
        'SP15 – Forces and Matter: Elastic and Inelastic Deformation, Springs',
        'Required Practicals: Specific Heat Capacity, I-V Characteristics, Extension of Springs',
      ],
    }},

    // ── English Language (Edexcel 1EN0) ───────────────────────────────────────
    'English Language': { papers: {
      1: [
        'Reading – Q1: Explicit Information — Listing and Identifying (AO1)',
        'Reading – Q2: Implicit Meaning — Inference and Interpretation (AO1)',
        'Reading – Q3: Structural Analysis — How Text is Structured (AO2)',
        'Reading – Q4: Language Analysis — Writer\'s Methods and Effects (AO2)',
        'Reading – Q5: Evaluation of a Writer\'s Perspective (AO4)',
        'Writing – Q6: Descriptive or Narrative Writing Task (AO5/AO6)',
        'Writing Skills: Descriptive Techniques, Narrative Structure, Characterisation',
        'Writing Skills: Technical Accuracy (Punctuation, Syntax, Vocabulary)',
      ],
      2: [
        'Reading – Q1–Q4: Non-Fiction and Literary Non-Fiction (19th Century + Contemporary)',
        'Reading – Comparing Writers\' Methods, Viewpoints and Perspectives (AO3)',
        'Writing – Q5: Transactional Writing — Letter, Article, Speech, Essay, Report (AO5/AO6)',
        'Writing Skills: Rhetorical Devices, Register, Audience Awareness',
        'Writing Skills: Technical Accuracy',
      ],
      3: [
        'Spoken Language Endorsement (NEA) – Presenting on a Chosen Topic',
        'Spoken Language Endorsement (NEA) – Responding to Questions; Use of Standard English',
      ],
    }},

    // ── English Literature (Edexcel 1ET0) ──────────────────────────────────────
    'English Literature': { papers: {
      1: [
        // Shakespeare
        'Shakespeare – Macbeth or Romeo and Juliet or The Merchant of Venice or Much Ado About Nothing',
        'Shakespeare: Character Analysis and Key Quotations',
        'Shakespeare: Themes and Dramatic Techniques',
        'Shakespeare: Social and Historical Context',
        // 19th-Century Novel
        '19th-Century Novel – Great Expectations / Dr Jekyll and Mr Hyde / Jane Eyre / A Christmas Carol',
        '19th-Century Novel: Character, Theme, Language Analysis',
        '19th-Century Novel: Victorian Context and Social Commentary',
      ],
      2: [
        // Modern Prose and Drama
        'Modern Text: Lord of the Flies / Animal Farm / Blood Brothers / An Inspector Calls',
        'Modern Text: Character, Theme and Context',
        'Modern Text: Dramatic or Narrative Structure',
        // Poetry
        'Poetry Anthology – Relationships: Comparing Two Poems on Relationships',
        'Poetry Anthology – Conflict: Comparing Two Poems on Conflict',
        'Unseen Poetry: Analysing an Unseen Poem and Comparing Two Unseen Poems',
      ],
    }},

    // ── Business (Edexcel 1BS0) ────────────────────────────────────────────────
    'Business': { papers: {
      1: [
        'Theme 1.1 – Enterprise and Entrepreneurship: Purpose and Role of Business, Risk and Reward',
        'Theme 1.2 – Spotting a Business Opportunity: Market Research, Market Segmentation',
        'Theme 1.3 – Putting a Business Idea into Practice: Revenue, Costs, Profit, Cash Flow',
        'Theme 1.4 – Making the Business Effective: Location, Legal Structure, the Marketing Mix',
        'Theme 1.5 – Understanding External Influences: Stakeholders, Legislation, Technology, Ethics',
      ],
      2: [
        'Theme 2.1 – Growing the Business: Growth Strategies, PLCs, Globalisation, Ethics of Growth',
        'Theme 2.2 – Making Marketing Decisions: Product Life Cycle, Pricing Strategies, Promotion',
        'Theme 2.3 – Making Operational Decisions: Efficiency, Procurement, Quality Management',
        'Theme 2.4 – Making Financial Decisions: Financial Statements, Ratio Analysis, Break-Even',
        'Theme 2.5 – Making Human Resource Decisions: Organisational Structure, Motivation, Training',
      ],
    }},

    // ── History (Edexcel 1HI0) ─────────────────────────────────────────────────
    'History': { papers: {
      1: [
        'Thematic Study (choice of one): Medicine in Britain c.1250–Present',
        'Thematic Study (choice of one): Crime and Punishment in Britain c.1000–Present',
        'Thematic Study (choice of one): Warfare and British Society c.1250–Present',
        'Thematic Study (choice of one): Migrants in Britain c.1000–Present',
        'Historic Environment: Site Study Linked to the Chosen Thematic Study',
      ],
      2: [
        'Period Study (choice of one): The Reigns of King Richard I and King John 1189–1216',
        'Period Study (choice of one): Spain and the "New World" c.1490–1555',
        'Period Study (choice of one): Henry VIII and His Ministers 1509–40',
        'Period Study (choice of one): The American West c.1835–c.1895',
        'Period Study (choice of one): Superpower Relations and the Cold War 1941–91',
        'British Depth Study (choice of one): Early Elizabethan England 1558–88',
        'British Depth Study (choice of one): Restoration England 1660–85',
        'Modern Depth Study (choice of one): Weimar and Nazi Germany 1918–39',
        'Modern Depth Study (choice of one): Mao\'s China 1945–76',
        'Modern Depth Study (choice of one): The USA 1954–75: Conflict at Home and Abroad',
      ],
    }},

    // ── Geography (Edexcel B — 1GB0) ──────────────────────────────────────────
    'Geography': { papers: {
      1: [
        '1.1 – The Changing Landscapes of the UK: Physical Processes and Land Use',
        '1.2 – Coastal Change and Conflict: Erosion, Deposition, Management (Case Study: Holderness)',
        '1.3 – River Processes and Pressures: Drainage Basins, Flooding, Management',
        '1.4 – Glaciated Upland Landscapes: Processes and Land Use',
        'Topic 2 – The Living World: Ecosystems, Tropical Rainforests, Cold Environments',
        'Topic 3 – Tectonic Risks: Earthquakes and Volcanoes (Causes, Effects, Responses)',
      ],
      2: [
        'Topic 4 – The Changing Economy of the UK: De-Industrialisation, Regeneration, North-South Divide',
        'Topic 5 – Urban Futures: Urbanisation, UK City Case Study, Global City Case Study',
        'Topic 6 – The Development Gap: Measuring Development, Uneven Development, Strategies',
        'Topic 7 – Resource Reliance: Food, Water, Energy Resources and Management',
      ],
      3: [
        'Component 3 – People and Environment Issues: Integrated Geographical Investigation (Pre-Release)',
        'Fieldwork: Physical Geography Fieldwork Investigation',
        'Fieldwork: Human Geography Fieldwork Investigation',
        'Geographical Skills: Statistical, Graphical and Cartographic Skills',
      ],
    }},

    // ── Religious Studies (Edexcel Spec A — 1RA0) ─────────────────────────────
    'Religious Studies': { papers: {
      1: [
        'Catholic Christianity – Beliefs: The Nature of God, the Trinity, Creation, Incarnation',
        'Catholic Christianity – Beliefs: Salvation, Eschatology and Life After Death',
        'Catholic Christianity – Practices: The Sacramental Life, Liturgy, the Mass',
        'Catholic Christianity – Practices: Prayer, Pilgrimage, Popular Piety and Catholic Social Teaching',
        'Islam – Beliefs: Tawhid, the Six Articles of Faith, Prophethood, Holy Books',
        'Islam – Beliefs: Predestination and Life After Death (Akhirah)',
        'Islam – Practices: The Five Pillars, the Ten Obligatory Acts (Shi\'a)',
        'Islam – Practices: The Mosque, Festivals and Commemorations, Jihad',
      ],
      2: [
        'Theme A – Relationships and Families: Human Sexuality, Marriage, Divorce, Contraception',
        'Theme B – Religion and Life: Origins and Value of the Universe, Abortion, Euthanasia',
        'Theme C – The Existence of God and Revelation: Religious and Non-Religious Arguments',
        'Theme D – Religion, Peace and Conflict: Violence, Terrorism, Just War Theory, WMDs',
        'Theme E – Religion, Crime and Punishment: Causes of Crime, Aims and Types of Punishment',
        'Theme F – Religion, Human Rights and Social Justice: Prejudice, Discrimination, Wealth and Poverty',
        '(Students study Two Religions from Section 1 and Four Themes from Section 2)',
      ],
    }},

  }, // end Edexcel GCSE

  // ── OCR GCSE ────────────────────────────────────────────────────────────────
  OCR: {

    // ── Mathematics (OCR J560) ────────────────────────────────────────────────
    'Mathematics': { papers: {
      1: [ // Non-calculator
        'Number – Place Value, Ordering, Rounding, Significant Figures',
        'Number – Fractions, Decimals, Percentages and Conversions',
        'Number – Powers, Roots and Indices (including Negative and Fractional — Higher)',
        'Number – Standard Form',
        'Number – Surds and Exact Values (Higher)',
        'Number – Bounds and Error Intervals (Higher)',
        'Number – Percentage Change, Compound Interest and Growth/Decay',
        'Algebra – Algebraic Manipulation: Simplifying, Expanding, Factorising',
        'Algebra – Solving Equations (Linear and Quadratic)',
        'Algebra – Changing the Subject (including Subject Appearing Twice, Higher)',
        'Algebra – Sequences: nth Term (Linear and Quadratic — Higher)',
        'Algebra – Simultaneous Equations (Linear and Linear/Quadratic, Higher)',
        'Algebra – Inequalities: Linear and Quadratic (Higher)',
        'Algebra – Algebraic Proof (Higher)',
        'Algebra – Functions: Composite and Inverse (Higher)',
        'Algebra – Iterative Methods (Higher)',
      ],
      2: [ // Calculator (shorter)
        'Ratio and Proportion – Ratio, Direct and Inverse Proportion, Best Buy',
        'Ratio and Proportion – Compound Measures: Speed, Density, Pressure',
        'Graphs – Straight Lines, Quadratics, Cubics, Reciprocals',
        'Graphs – Parallel and Perpendicular Lines (Higher)',
        'Graphs – Transformation of Graphs (Higher)',
        'Graphs – Real-Life Graphs: Distance-Time, Velocity-Time',
        'Geometry – Angles in Polygons, Parallel Lines',
        'Geometry – Pythagoras and Trigonometry (SOH CAH TOA)',
        'Geometry – Sine and Cosine Rule, Area of Triangle (Higher)',
        'Geometry – Circle Theorems (Higher)',
        'Geometry – Area, Perimeter, Volume, Surface Area',
        'Geometry – Transformations, Congruence, Similarity',
        'Geometry – Vectors (Higher)',
      ],
      3: [ // Calculator (longer)
        'Statistics – Charts, Averages, Cumulative Frequency, Box Plots',
        'Statistics – Histograms with Unequal Class Widths (Higher)',
        'Statistics – Scatter Diagrams and Correlation',
        'Statistics – Sampling Methods',
        'Probability – Single and Combined Events, Tree Diagrams, Conditional (Higher)',
        'Probability – Venn Diagrams and Set Notation',
        'Geometry – Constructions, Loci, Bearings',
        'Applied Problems: Speed, Density, Pressure, Financial Maths',
        'Mixed Problem Solving and Multi-Step Reasoning',
      ],
    }},

    // ── Computer Science (OCR J277) ───────────────────────────────────────────
    'Computer Science': { papers: {
      1: [
        '1.1 – Systems Architecture: CPU Structure (ALU, CU, Registers, Cache)',
        '1.1 – Systems Architecture: Fetch-Decode-Execute Cycle',
        '1.1 – Systems Architecture: Performance Factors (Clock Speed, Cores, Cache Size)',
        '1.1 – Systems Architecture: Embedded Systems',
        '1.2 – Memory and Storage: Primary, Secondary and Off-Line Storage; RAM, ROM',
        '1.2 – Memory and Storage: Virtual Memory',
        '1.2 – Memory and Storage: Storage Devices (Optical, Magnetic, Solid-State) and Suitability',
        '1.2 – Memory and Storage: Data Units (Bits, Bytes, Kilobytes, Megabytes, Gigabytes)',
        '1.2 – Memory and Storage: Binary, Denary and Hexadecimal Conversion',
        '1.2 – Memory and Storage: Binary Addition, Overflow',
        '1.2 – Memory and Storage: Binary Shifts',
        '1.2 – Memory and Storage: ASCII and Unicode Character Sets',
        '1.2 – Memory and Storage: Image Representation (Pixels, Resolution, Colour Depth)',
        '1.2 – Memory and Storage: Sound Representation (Sample Rate, Bit Depth, Duration)',
        '1.2 – Memory and Storage: Compression (Lossy, Lossless, RLE)',
        '1.3 – Computer Networks: Network Types (LAN, WAN), Factors Affecting Performance',
        '1.3 – Computer Networks: Network Topologies (Star, Mesh)',
        '1.3 – Computer Networks: Wired and Wireless Networks, Network Hardware',
        '1.3 – Computer Networks: Protocols and Layers (TCP/IP Model, HTTP/HTTPS, FTP, SMTP)',
        '1.3 – Computer Networks: The Internet (DNS, IP Addresses, Packet Switching)',
        '1.4 – Network Security: Types of Threat (Malware, Phishing, Social Engineering, Brute Force, DoS)',
        '1.4 – Network Security: Prevention Methods (Firewalls, Encryption, Authentication, Pen Testing)',
        '1.5 – Systems Software: OS Functions (Memory, Peripheral, User Management)',
        '1.5 – Systems Software: Utility Software (Encryption, Compression, Defragmentation)',
        '1.6 – Ethical, Legal, Cultural and Environmental Issues: GDPR, Computer Misuse Act, Copyright Act',
        '1.6 – Ethical Issues: AI, Autonomous Vehicles, Privacy and Surveillance',
      ],
      2: [
        '2.1 – Algorithms: Decomposition, Abstraction, Algorithmic Design',
        '2.1 – Algorithms: Representing Algorithms (Pseudocode and Flowcharts)',
        '2.1 – Algorithms: Searching (Linear and Binary Search)',
        '2.1 – Algorithms: Sorting (Bubble Sort, Merge Sort, Insertion Sort)',
        '2.1 – Algorithms: Tracing Algorithms and Identifying Purpose/Errors',
        '2.2 – Programming Fundamentals: Variables, Constants, Data Types and Casting',
        '2.2 – Programming Fundamentals: Sequence, Selection (if/elif/else)',
        '2.2 – Programming Fundamentals: Iteration (Count- and Condition-Controlled Loops)',
        '2.2 – Programming Fundamentals: Arrays, Lists and 2D Arrays',
        '2.2 – Programming Fundamentals: String Manipulation',
        '2.2 – Programming Fundamentals: File Handling (Read, Write)',
        '2.2 – Programming Fundamentals: SQL — Basic Database Queries',
        '2.2 – Programming Fundamentals: Subroutines, Parameters, Return Values',
        '2.3 – Producing Robust Programs: Defensive Design, Input Validation, Testing Strategies',
        '2.3 – Producing Robust Programs: Types of Error (Syntax, Logic, Runtime)',
        '2.4 – Boolean Logic: AND, OR, NOT, Truth Tables, Logic Diagrams',
        '2.5 – Programming Languages and IDEs: High vs Low Level, Translators, IDE Features',
      ],
    }},

    // ── Biology (OCR Gateway Science A — J247) ────────────────────────────────
    'Biology': { papers: {
      1: [
        'B1 – Cell Level Systems: Cell Structure, Microscopy, Cell Division, DNA and the Genome',
        'B2 – Scaling Up: Transport in Plants and Animals, Digestion, Diffusion and Osmosis',
        'B3 – Organism Level Systems: Nervous System, Hormones, Homeostasis, the Eye',
        'B4 – Community Level Systems: Ecosystems, Food Webs, Material Cycles (Carbon, Water)',
        'B5 – Genes, Inheritance and Selection: DNA, Monohybrid Crosses, Variation',
        'Required Practicals: Microscopy, Osmosis, Food Tests, Photosynthesis Rate',
      ],
      2: [
        'B6 – Global Challenges: Biodiversity, Infectious Disease, Vaccination, Food Security',
        'B7 – Practical Skills: Required Practicals and Scientific Methods',
        'B8 – Evolution: Natural Selection, Speciation, Classification, Extinction',
        'B9 – Genetics and Genetic Engineering: Genetic Modification, Selective Breeding',
        'B10 – The Nervous System and the Brain: Reflexes, Neurons, Synapses',
        'Required Practicals: Sampling (Quadrats/Transects), Reaction Time, Enzyme Experiments',
      ],
    }},

    // ── Chemistry (OCR Gateway Science A — J248) ──────────────────────────────
    'Chemistry': { papers: {
      1: [
        'C1 – The Particulate Nature of Matter: States of Matter, Atomic Structure, Bonding',
        'C2 – Elements, Compounds and Mixtures: The Periodic Table, Properties, Separation',
        'C3 – Chemical Reactions: Balanced Equations, Types of Reaction, Energy Changes',
        'C4 – Predicting and Identifying Reactions and Products: Reactivity Series, Electrolysis',
        'C5 – Monitoring and Controlling Chemical Reactions: Rate of Reaction, Equilibrium',
        'Required Practicals: Titration, Electrolysis, Rate of Reaction',
      ],
      2: [
        'C6 – Global Challenges: Extracting Metals, Recycling, Corrosion, Life Cycle Assessment',
        'C7 – Organic Chemistry: Hydrocarbons, Crude Oil, Polymers, Alcohols',
        'C8 – Chemical Analysis: Chromatography, Flame Tests, Identifying Ions and Gases',
        'C9 – Earth\'s Atmosphere and Climate Change: Greenhouse Gases, Pollutants',
        'C10 – Using Resources Sustainably: Potable Water, the Haber Process',
        'Required Practicals: Chromatography, Ion Tests, Rate of Reaction',
      ],
    }},

    // ── Physics (OCR Gateway Science A — J249) ────────────────────────────────
    'Physics': { papers: {
      1: [
        'P1 – Matter: Density, Changes of State, Specific Heat Capacity, Gas Laws',
        'P2 – Forces: Newton\'s Laws, Motion Graphs, Stopping Distance, Momentum',
        'P3 – Electricity: Circuits, Ohm\'s Law, Series and Parallel, Power',
        'P4 – Magnetism and Magnetic Fields: Electromagnets, the Motor Effect',
        'P5 – Waves: Properties, Sound, Light, the Electromagnetic Spectrum',
        'Required Practicals: Specific Heat Capacity, Resistance, I-V Characteristics',
      ],
      2: [
        'P6 – Radioactivity: Types of Decay, Half-Life, Fission and Fusion',
        'P7 – Energy: Transfers, Efficiency, Renewable and Non-Renewable Resources',
        'P8 – Global Challenges: Space Physics, Climate Change, Sustainability',
        'P9 – Forces and Motion: Momentum, Work Done, Power (Higher)',
        'P10 – Electromagnetism: Electromagnetic Induction, Transformers, Generators',
        'Required Practicals: Investigating Waves, Density, Acceleration',
      ],
    }},

    // ── History (OCR B — Schools History Project — J411) ──────────────────────
    'History': { papers: {
      1: [
        'Thematic Study (choice of one): The People\'s Health c.1250–Present',
        'Thematic Study (choice of one): Migrants to Britain c.1250–Present',
        'Thematic Study (choice of one): Crime and Punishment in Britain c.1250–Present',
        'British Depth Study (choice of one): The Norman Conquest 1065–1087',
        'British Depth Study (choice of one): The Reign of Edward I 1272–1307',
        'British Depth Study (choice of one): The Elizabethan Age 1547–1603',
        'British Depth Study (choice of one): The English Reformation 1520–c.1550',
        'British Depth Study (choice of one): The First World War and British Society 1914–18',
        'British Depth Study (choice of one): Britain in the Second World War 1939–45',
      ],
      2: [
        'Period Study (choice of one): The Making of America 1789–1900',
        'Period Study (choice of one): The Cold War in Europe 1941–91',
        'Period Study (choice of one): The USA 1945–74',
        'World Depth Study (choice of one): The Origins and Outbreak of the First World War 1905–14',
        'World Depth Study (choice of one): Germany 1925–55',
        'World Depth Study (choice of one): South Africa 1940–94',
        'World Depth Study (choice of one): Vietnam 1954–75',
      ],
    }},

    // ── Geography (OCR B — Geography for Enquiring Minds — J384) ──────────────
    'Geography': { papers: {
      1: [
        'Topic 1 – Our Natural World: Global Ecosystems, Tropical Rainforests, Cold Environments',
        'Topic 1 – Our Natural World: Coastal Landscapes and Their Management',
        'Topic 2 – Our Changing World: Climate Change Evidence, Causes, Effects and Responses',
        'Topic 3 – Physical Processes: River Landscapes and Their Management',
        'Topic 3 – Physical Processes: Tectonic Landscapes and Hazards',
        'UK Natural Hazards: Weather Hazards and Extreme Weather in the UK',
      ],
      2: [
        'Topic 4 – Changing Cities: UK City Case Study, Global Urbanisation and Megacities',
        'Topic 5 – Global Development: Measuring Development, Newly Emerging Economy (NEE) Case Study',
        'Topic 6 – Resource Management: Food, Water, Energy Security',
        'Topic 7 – Trade and Aid: Globalisation, Trade Patterns, Types of Aid',
      ],
      3: [
        'Geographical Investigation: NEA — Fieldwork-Based Enquiry (Two Contrasting Environments)',
        'Decision-Making Exercise: Evaluating Evidence for a Planning Decision (Resource Booklet)',
        'Geographical Skills: Cartographic, Statistical and Graphical Skills',
      ],
    }},

    // ── Religious Studies (OCR — J625) ────────────────────────────────────────
    'Religious Studies': { papers: {
      1: [
        'Christianity: Beliefs — The Nature of God, the Trinity, Jesus, Afterlife',
        'Christianity: Beliefs — Creation, Sin, Salvation',
        'Christianity: Practices — Worship, Sacraments, Prayer, Pilgrimage',
        'Christianity: Practices — The Role of the Church in Britain and the Worldwide Church',
        'Islam: Beliefs — Tawhid, Prophethood, Holy Books, Afterlife, Predestination',
        'Islam: Beliefs — Sunni and Shi\'a Islam',
        'Islam: Practices — The Five Pillars, Jihad, Festivals, The Mosque',
        'Buddhism / Judaism / Hinduism / Sikhism (Alternative Options, choice of one)',
      ],
      2: [
        'Theme 1: Relationships and Families',
        'Theme 2: The Existence of God and Revelation',
        'Theme 3: Religion, Peace and Justice',
        'Theme 4: Religion and Equality',
        'Theme 5: Religion, Crime and Punishment',
        'Theme 6: Religion, Environmental and Medical Issues',
        '(Students study Two Religions and Four Themes)',
      ],
    }},

    // ── Latin (OCR — J282) ────────────────────────────────────────────────────
    'Latin': { papers: {
      1: [
        'Language – Nouns: 1st, 2nd, 3rd, 4th and 5th Declension in all Cases (Nom, Voc, Acc, Gen, Dat, Abl)',
        'Language – Adjectives: 1st/2nd and 3rd Declension Agreement; Comparison of Adjectives',
        'Language – Pronouns: Personal, Reflexive, Relative, Demonstrative',
        'Language – Verbs: Present, Imperfect, Perfect, Pluperfect Active (all 4 Conjugations)',
        'Language – Verbs: Future and Future Perfect Active',
        'Language – Verbs: Passive Voice (all Tenses)',
        'Language – Verbs: Deponent Verbs, Irregular Verbs (sum, possum, eo, volo, fero)',
        'Language – Syntax: Indirect Statement (accusative + infinitive)',
        'Language – Syntax: Indirect Command, Indirect Question',
        'Language – Syntax: Purpose Clauses, Result Clauses, cum Clauses',
        'Language – Syntax: Ablative Absolute',
        'Language – Syntax: Gerundive of Obligation (Higher)',
        'Language – Vocabulary: OCR Defined Vocabulary List',
        'Prose Translation: Unprepared Latin Unseen Passages',
      ],
      2: [
        'Literature – Prescribed Literature: Verse and Prose Set Texts (changes annually)',
        'Literature – Roman History and Context (relevant to set texts)',
        'Literature – Analysis of Language, Style and Metre (Dactylic Hexameter)',
        'Literature – Comprehension Questions on Prescribed Text Extracts',
        'Derivatives: Latin Roots in English',
      ],
    }},

  }, // end OCR GCSE

  // ── WJEC / EDUQAS GCSE ──────────────────────────────────────────────────────
  // (Eduqas = England-regulated version of WJEC; specifications are closely aligned
  // but not always identical in code/option structure — noted per subject below)
  'Eduqas/WJEC': {

    // ── Mathematics (WJEC / Eduqas) ───────────────────────────────────────────
    'Mathematics': { papers: {
      1: [ // Non-calculator
        'Number – Integers: BIDMAS, Place Value, Rounding, Significant Figures',
        'Number – Standard Form: Converting and Calculating',
        'Number – Surds: Simplifying and Rationalising the Denominator (Higher)',
        'Number – Fractions, Decimals and Percentages: Conversions and Operations',
        'Number – Percentages: Percentage Change, Compound Interest, Reverse Percentages',
        'Algebra – Expressions: Simplifying, Expanding, Factorising',
        'Algebra – Equations: Solving Linear Equations, Forming Equations',
        'Algebra – Inequalities: Solving and Representing on a Number Line',
        'Algebra – Sequences: nth Term of Linear and Quadratic Sequences (Higher)',
        'Algebra – Quadratics: Factorising and the Quadratic Formula (Higher)',
        'Algebra – Simultaneous Equations: Linear and Linear/Quadratic (Higher)',
        'Algebra – Proof (Higher)',
        'Statistics – Averages: Mean, Median, Mode and Range',
        'Statistics – Charts: Bar Charts, Pie Charts, Frequency Diagrams',
        'Statistics – Scatter Graphs and Correlation',
        'Probability – Single and Combined Events, Sample Space Diagrams',
        'Probability – Tree Diagrams and Venn Diagrams',
      ],
      2: [ // Calculator
        'Geometry – Angles: Polygons, Parallel Lines, Bearings',
        'Geometry – Pythagoras\' Theorem and Trigonometry (SOH CAH TOA)',
        'Geometry – Area and Perimeter: 2D Shapes, Circles, Sectors',
        'Geometry – Volume and Surface Area: Prisms, Cylinders, Spheres, Cones (Higher)',
        'Geometry – Transformations: Reflection, Rotation, Translation, Enlargement',
        'Geometry – Similarity and Congruence',
        'Geometry – Circle Theorems (Higher)',
        'Geometry – Vectors (Higher)',
        'Graphs – Straight Lines: y = mx + c, Gradient and Intercept',
        'Graphs – Quadratic, Cubic and Reciprocal Graphs',
        'Graphs – Real-Life Graphs: Distance-Time, Velocity-Time',
        'Ratio and Proportion – Ratio, Direct and Inverse Proportion',
        'Ratio and Proportion – Financial Mathematics: Best Buys, Currency Conversion',
      ],
      3: [ // Calculator (Higher only extension paper)
        'Problem Solving – Multi-Step Reasoning Across All Topic Areas',
        'Further Algebra – Functions, Algebraic Proof, Iterative Methods',
        'Further Geometry – Sine Rule, Cosine Rule, Trigonometric Graphs',
        'Further Statistics – Histograms with Unequal Class Widths, Cumulative Frequency',
        'Further Number – Bounds and Error Intervals',
      ],
    }},

    // ── English Language (Eduqas) ─────────────────────────────────────────────
    'English Language': { papers: {
      1: [
        'Reading – 20th/21st-Century Literary Prose Extract: Comprehension and Language Analysis',
        'Reading – Summary and Synthesis Question',
        'Reading – Language and Structure Analysis (AO2)',
        'Writing – Narrative or Descriptive Writing (Response to a Prompt or Image)',
        'Writing Skills: Technical Accuracy, Sentence Variety, Tone and Register',
      ],
      2: [
        'Reading – Non-Fiction: 21st-Century Source — Viewpoints and Perspectives',
        'Reading – Comparing a 21st-Century Non-Fiction Text and a 19th-Century Non-Fiction Text',
        'Writing – Persuasive or Informative Writing (Article, Letter, Speech, Review)',
        'Writing Skills: Rhetorical Devices, Register and Audience Awareness',
        'Spoken Language – Non-Exam Assessment: Individual Oral Presentation',
      ],
    }},

    // ── English Literature (Eduqas) ───────────────────────────────────────────
    'English Literature': { papers: {
      1: [
        'Section A – Shakespeare: Extract-Based Question Plus Whole-Text Essay',
        'Section A – Shakespeare: Character, Theme and Language Analysis',
        'Section B – Poetry Anthology: Comparing Two Poems on a Chosen Theme',
        'Section B – Poetry Anthology: Poetic Techniques, Form and Structure',
      ],
      2: [
        'Section A – Post-1914 Prose or Drama: Character, Theme and Context',
        'Section B – 19th-Century Prose: Character, Theme, Context and Language',
        'Section C – Unseen Poetry: Analysis of an Unseen Poem',
        'Section C – Unseen Poetry: Comparison of Two Unseen Poems',
      ],
    }},

    // ── Biology (Eduqas) ───────────────────────────────────────────────────────
    'Biology': { papers: {
      1: [
        'Unit 1 – Cells and Genetics: Cell Structure, Cell Division, DNA, Inheritance',
        'Unit 1 – Cells and Genetics: Transport (Diffusion, Osmosis, Active Transport)',
        'Unit 2 – Homeostasis and the Nervous System: Nervous Coordination, Hormones',
        'Unit 2 – Homeostasis: Blood Glucose Regulation, the Kidney',
        'Unit 3 – Micro-organisms and Disease: Pathogens, Immunity, Vaccination, Drug Development',
        'Unit 4 – Plant Biology: Photosynthesis, Transpiration, Plant Adaptations',
        'Required Practicals: Osmosis, Microscopy, Photosynthesis Rate',
      ],
      2: [
        'Unit 5 – Genetics and Evolution: DNA Structure, Genetic Disorders, Genetic Engineering',
        'Unit 6 – Variation, Evolution and Classification: Natural Selection, Speciation',
        'Unit 7 – Ecosystems and Ecology: Material Cycles, Biodiversity, Human Impact',
        'Unit 8 – Further Homeostasis: Nervous System, Hormones, Kidneys, Thermoregulation',
        'Optional Unit (choice of one): Immunology and Disease / Human Musculoskeletal Anatomy / Neurobiology and Behaviour',
        'Required Practicals: Sampling (Quadrats), Reaction Time',
      ],
    }},

    // ── Chemistry (Eduqas) ─────────────────────────────────────────────────────
    'Chemistry': { papers: {
      1: [
        'Unit 1 – Atoms, Elements and Compounds: Atomic Structure, Periodic Table, Bonding',
        'Unit 1 – Atoms, Elements and Compounds: Ionic, Covalent and Metallic Structures',
        'Unit 2 – Chemical Reactions: Types of Reaction, Balanced Equations, Energy Changes',
        'Unit 3 – Quantitative Chemistry: Moles, Percentage Yield, Concentration',
        'Unit 4 – Electrolysis and Extraction of Metals: Reactivity Series, Electrolysis',
        'Required Practicals: Titration, Preparation of a Salt',
      ],
      2: [
        'Unit 5 – Organic Chemistry: Hydrocarbons, Alkenes, Alcohols, Polymers',
        'Unit 6 – Rate of Reaction and Equilibrium: Collision Theory, Le Chatelier\'s Principle',
        'Unit 7 – Chemical Analysis: Chromatography, Flame Tests, Ion Tests',
        'Unit 8 – Earth\'s Atmosphere and Using Resources: Climate Change, Life Cycle Assessment',
        'Required Practicals: Rate of Reaction, Chromatography',
      ],
    }},

    // ── Physics (Eduqas) ───────────────────────────────────────────────────────
    'Physics': { papers: {
      1: [
        'Unit 1 – Energy: Stores, Transfers, Power, Efficiency, Specific Heat Capacity',
        'Unit 2 – Electricity: Circuits, Ohm\'s Law, Series and Parallel, Mains Electricity',
        'Unit 3 – Waves: Properties, Sound, Light, the Electromagnetic Spectrum',
        'Unit 4 – Matter: Density, States of Matter, Particle Model, Gas Laws',
        'Required Practicals: Specific Heat Capacity, Resistance, I-V Characteristics',
      ],
      2: [
        'Unit 5 – Forces: Newton\'s Laws, Work Done, Momentum, Stopping Distance',
        'Unit 6 – Atomic Structure and Radioactivity: Types of Decay, Half-Life, Fission, Fusion',
        'Unit 7 – Magnetism: the Motor Effect, Electromagnetic Induction, Transformers',
        'Unit 8 – Space: the Solar System, Life Cycle of Stars, the Universe',
        'Required Practicals: Investigating Waves, Acceleration, Density',
      ],
    }},

    // ── Computer Science (Eduqas — C100QS) ────────────────────────────────────
    'Computer Science': { papers: {
      1: [
        'Component 1 – Computer Systems: CPU Architecture and Performance',
        'Component 1 – Computer Systems: Memory, Storage and Data Representation (Binary, Hex, ASCII)',
        'Component 1 – Computer Systems: Representing Images, Sound and Compression',
        'Component 1 – Computer Networks: Types, Topologies, Protocols and Security',
        'Component 1 – Systems Software: OS Functions, Utility Programs, Translators',
        'Component 1 – Principles of Programming: Variables, Sequence, Selection, Iteration',
        'Component 1 – Programming Languages: High vs Low Level, Translators (Compiler/Interpreter)',
        'Component 1 – Ethical, Legal and Environmental Issues: Legislation, Privacy, Sustainability',
      ],
      2: [
        'Component 2 – Algorithms and Programming: Decomposition, Abstraction',
        'Component 2 – Searching and Sorting Algorithms (Linear, Binary, Bubble, Merge)',
        'Component 2 – Programming Constructs: Arrays, Subroutines, File Handling',
        'Component 2 – Boolean Logic and Logic Gates',
        'Component 2 – Non-Exam Assessment: Practical Programming Task',
      ],
    }},

    // ── Geography (Eduqas B) ──────────────────────────────────────────────────
    'Geography': { papers: {
      1: [
        'Theme 1 – Changing Places, Changing Economies: UK Urban Change and Regeneration',
        'Theme 1 – Changing Places: Economic Change and the UK\'s Post-Industrial Economy',
        'Theme 2 – Changing Environments: Coastal Landscapes and Management',
        'Theme 2 – Changing Environments: River Landscapes and Flood Management',
        'Theme 2 – Changing Environments: Glaciated Landscapes',
        'Theme 3 – Environmental Challenges: Weather Hazards and Climate Change',
        'Theme 3 – Environmental Challenges: Ecosystems and Their Management',
      ],
      2: [
        'Theme 4 – Unequal Development Around the World: Measuring and Explaining Development',
        'Theme 4 – Unequal Development: Strategies to Reduce the Development Gap',
        'Theme 5 – Development and Resource Issues in Wales/UK: Food, Water, Energy',
        'Theme 6 – Wales and the Wider World: Welsh Context, Migration, Tourism',
      ],
      3: [
        'Component 3 – Applied and Issues-Based Geography: Pre-Release Resource Analysis',
        'Fieldwork: Physical Geography Investigation',
        'Fieldwork: Human Geography Investigation',
        'Geographical Skills: Maps (including OS Maps), Statistics, Graphical Techniques',
      ],
    }},

    // ── History (Eduqas / WJEC) ────────────────────────────────────────────────
    'History': { papers: {
      1: [
        'Changes in Health and Medicine c.1345–Present (Wales and Britain)',
        'Changes in Health and Medicine: Public Health Case Studies (Cardiff/Wales)',
        'Changes in Crime and Punishment c.1500–Present (Wales and Britain)',
        'A Study of the Historic Environment: Site Study Linked to the Period',
      ],
      2: [
        'Depth Study (choice of one): Germany 1919–45',
        'Depth Study (choice of one): The USA 1929–2000',
        'Depth Study (choice of one): Conflict in the Middle East',
        'Breadth Study: The Development of the USA 1929–2000',
        'Welsh History Study: Wales and the Political and Social History of the 20th Century',
      ],
    }},

  }, // end Eduqas/WJEC GCSE

  // ── CCEA GCSE (Northern Ireland) ────────────────────────────────────────────
  CCEA: {

    // CCEA GCSE Mathematics (2210) — Modular structure unique to Northern Ireland
    // Foundation: Unit M1 + M2 (with calculator) then M5 or M6 completion test (P1 non-calc, P2 calculator)
    // Higher: Unit M3 + M4 (with calculator) then M7 or M8 completion test (P1 non-calc, P2 calculator)
    'Mathematics': { papers: {
      1: [ // Foundation content (Units M1, M2, M5/M6)
        // Number
        'Number – Integers: BIDMAS, Prime Factors, HCF, LCM',
        'Number – Fractions, Decimals and Percentages: Conversions, Operations',
        'Number – Percentages: Percentage Change, Reverse Percentages, Simple and Compound Interest',
        'Number – Ratio and Proportion: Simplifying, Dividing in a Ratio, Direct and Inverse Proportion',
        'Number – Powers, Roots and Standard Form',
        'Number – Estimation and Approximation',
        // Algebra
        'Algebra – Expressions: Simplifying, Expanding Brackets, Factorising',
        'Algebra – Formulae: Substitution, Changing the Subject',
        'Algebra – Solving Linear Equations and Inequalities',
        'Algebra – Simultaneous Equations (Linear)',
        'Algebra – Sequences: nth Term of Linear Sequences',
        'Algebra – Graphs: Straight-Line Graphs, y = mx + c, Gradient and Intercept',
        // Geometry
        'Geometry – Angles: Properties of Triangles, Quadrilaterals, Polygons, Parallel Lines',
        'Geometry – Pythagoras\' Theorem',
        'Geometry – Trigonometry: SOH CAH TOA in Right-Angled Triangles',
        'Geometry – Perimeter, Area: Rectangles, Triangles, Circles, Composite Shapes',
        'Geometry – Volume and Surface Area: Cuboids, Prisms, Cylinders',
        'Geometry – Transformations: Reflection, Rotation, Translation, Enlargement',
        'Geometry – Constructions and Loci',
        // Statistics and Probability
        'Statistics – Averages and Range: Mean, Median, Mode from Lists and Tables',
        'Statistics – Graphs: Bar Charts, Pie Charts, Frequency Polygons, Scatter Diagrams',
        'Statistics – Cumulative Frequency, Box Plots',
        'Statistics – Sampling and Data Collection',
        'Probability – Basic Probability, Sample Spaces, Combined Events, Tree Diagrams',
      ],
      2: [ // Higher content (Units M3, M4, M7/M8) — builds on Foundation
        // Number (Higher)
        'Number – Surds: Simplifying and Rationalising the Denominator',
        'Number – Bounds and Error Intervals',
        // Algebra (Higher)
        'Algebra – Quadratics: Factorising, Completing the Square, Quadratic Formula',
        'Algebra – Quadratic Inequalities',
        'Algebra – Simultaneous Equations: One Linear, One Quadratic',
        'Algebra – Functions: Function Notation, Composite and Inverse Functions',
        'Algebra – Sequences: nth Term of Quadratic Sequences; Geometric Sequences',
        'Algebra – Algebraic Proof',
        'Algebra – Graphs: Quadratic, Cubic, Reciprocal, Exponential; Transformations of Graphs',
        'Algebra – Gradient and Area Under a Curve (Kinematics context)',
        // Geometry (Higher)
        'Geometry – Trigonometry: Sine Rule, Cosine Rule, Area = ½ab sinC',
        'Geometry – Circle Theorems',
        'Geometry – Vectors',
        'Geometry – Similarity and Congruence Proofs',
        'Geometry – Volume and Surface Area: Pyramids, Cones, Spheres',
        // Statistics (Higher)
        'Statistics – Histograms with Frequency Density',
        'Statistics – Conditional Probability; Venn Diagrams',
      ],
    }},

    // ── English Language (CCEA) ───────────────────────────────────────────────
    'English Language': { papers: {
      1: [
        'Reading – Unit 1: Personal Response to Fiction and Literary Non-Fiction',
        'Reading – Analysing Language and Structure in Literary Texts',
        'Writing – Personal and Imaginative Writing (Narrative, Descriptive)',
        'Writing – Transactional Writing: Letters, Articles, Speeches (Formal and Informal)',
      ],
      2: [
        'Reading – Unit 2: Response to Non-Fiction and Media Texts',
        'Reading – Comparing Non-Fiction Texts: Viewpoint, Purpose, Audience',
        'Writing – Functional Writing: Reports, Reviews, Information Texts',
        'Writing – Discursive Writing: Argument and Persuasion',
        'Speaking and Listening – Controlled Assessment (Internally Assessed)',
      ],
    }},

    // ── English Literature (CCEA) ─────────────────────────────────────────────
    'English Literature': { papers: {
      1: [
        'Poetry – Unit 1: Prescribed Poems — Close Analysis and Comparison',
        'Poetry – Unseen Poetry: Response to an Unfamiliar Poem',
        'Poetry – Themes, Language, Form and Structure',
      ],
      2: [
        'Prose – Unit 2: Novel Study — Character, Theme, Narrative Voice',
        'Drama – Unit 2: Play Study — Character, Theme, Language, Stage Directions',
        'Prose and Drama – Contextual Understanding and Critical Response',
      ],
    }},

    // ── Biology (CCEA) ─────────────────────────────────────────────────────────
    'Biology': { papers: {
      1: [
        'Unit 1 – Cells: Cell Structure, Microscopy, Diffusion, Osmosis, Active Transport',
        'Unit 1 – Genetics: DNA, Protein Synthesis, Mitosis, Meiosis, Inheritance, Mutations',
        'Unit 1 – Biodiversity: Classification, Natural Selection, Evolution, Ecosystems',
      ],
      2: [
        'Unit 2 – Physiology: Digestive System, Circulatory System, Respiratory System, Excretion',
        'Unit 2 – Homeostasis: Blood Glucose, Temperature Regulation, Kidney Function',
        'Unit 2 – Coordination: Nervous System, Hormones, Reflex Arcs',
        'Unit 2 – Ecosystems: Food Chains, Energy Transfer, Nutrient Cycles, Human Impact',
      ],
    }},

    // ── Chemistry (CCEA) ───────────────────────────────────────────────────────
    'Chemistry': { papers: {
      1: [
        'Unit 1 – Atomic Structure: Protons, Neutrons, Electrons, Isotopes, Electronic Configuration',
        'Unit 1 – Bonding: Ionic, Covalent, Metallic; Properties of Materials',
        'Unit 1 – Quantitative Chemistry: Moles, Formulae, Equations, Calculations',
        'Unit 1 – The Periodic Table: Groups 1, 7, 0; Transition Metals; Trends',
      ],
      2: [
        'Unit 2 – Rates of Reaction: Factors, Collision Theory, Catalysts',
        'Unit 2 – Equilibrium: Reversible Reactions, Le Chatelier\'s Principle',
        'Unit 2 – Organic Chemistry: Alkanes, Alkenes, Alcohols, Carboxylic Acids, Addition Polymers',
        'Unit 2 – Analysis: Flame Tests, Chemical Tests for Ions and Gases, Chromatography',
        'Unit 2 – Electrochemistry: Electrolysis, Extraction of Metals',
      ],
    }},

    // ── Physics (CCEA) ─────────────────────────────────────────────────────────
    'Physics': { papers: {
      1: [
        'Unit 1 – Motion: Speed, Velocity, Acceleration, Distance-Time and Velocity-Time Graphs, SUVAT',
        'Unit 1 – Forces: Newton\'s Laws, Weight, Friction, Moments, Pressure',
        'Unit 1 – Electricity: Current, Voltage, Resistance, Series and Parallel Circuits, Power',
        'Unit 1 – Waves: Wave Properties, Reflection, Refraction, Diffraction, Sound, Light',
      ],
      2: [
        'Unit 2 – Energy: Work Done, Energy Transfers, Efficiency, Power, Specific Heat Capacity',
        'Unit 2 – Thermal Physics: Conduction, Convection, Radiation, Infrared',
        'Unit 2 – Atomic Structure: Radioactivity, Half-Life, Nuclear Fission and Fusion',
        'Unit 2 – Electromagnetism: Magnets, Electromagnets, Motor Effect, Generators, Transformers',
        'Unit 2 – Space: Solar System, Stars, Universe, Red-Shift, Big Bang',
      ],
    }},

    // ── Geography (CCEA) ───────────────────────────────────────────────────────
    'Geography': { papers: {
      1: [
        'Unit 1 – Physical Environments: River Processes and Landforms (Erosion, Transportation, Deposition)',
        'Unit 1 – Physical Environments: Coastal Processes and Landforms',
        'Unit 1 – Physical Environments: Tectonic Hazards (Earthquakes and Volcanoes)',
        'Unit 1 – Weather and Climate: UK Weather, Global Climate Zones',
      ],
      2: [
        'Unit 2 – Human Environments: Population (Growth, Migration, Ageing)',
        'Unit 2 – Human Environments: Settlement (Urbanisation, Land Use, Regeneration)',
        'Unit 2 – Human Environments: Development (Indicators, Trade, Aid, Tourism)',
        'Unit 2 – Managing the Environment: Sustainability, Resource Management',
      ],
      3: [
        'Unit 3 – Fieldwork: Planning, Data Collection and Presentation',
        'Unit 3 – Decision-Making Exercise (DME): Applying Geographical Skills to an Unfamiliar Context',
      ],
    }},

    // ── History (CCEA) ─────────────────────────────────────────────────────────
    'History': { papers: {
      1: [
        'Unit 1 – Life Under Nazi Rule 1933–45: Rise of Hitler, Propaganda, Racial Policies, Opposition',
        'Unit 1 – Source Analysis: Reliability, Utility, Cross-Referencing',
      ],
      2: [
        'Unit 2 – A Divided Union? Northern Ireland 1921–72: Partition, Stormont, Civil Rights Movement, Outbreak of Troubles',
        'Unit 2 – Source and Interpretation Skills in the Context of Irish History',
      ],
      3: [
        'Unit 3 – Thematic Study (chosen option): e.g. Changing Nature of Warfare 1845–1991, or Cold War 1945–91',
        'Unit 3 – Extended Writing: Essay and Source Questions',
      ],
    }},

    // ── Religious Studies (CCEA) ──────────────────────────────────────────────
    'Religious Studies': { papers: {
      1: [
        'Christianity – Core Beliefs: The Trinity, Incarnation, Salvation, Afterlife',
        'Christianity – Practices: Prayer, Worship, Sacraments, Pilgrimage',
        'Christianity – Northern Irish Church Life: Role of Churches in Society',
      ],
      2: [
        'Applied Ethics – Justice: Crime, Punishment, Forgiveness, Reconciliation',
        'Applied Ethics – Relationships: Marriage, Family, Gender, Sexuality',
        'Applied Ethics – Environment: Stewardship, Conservation, Climate Change',
        'Applied Ethics – The Sanctity of Life: Abortion, Euthanasia, War and Peace',
      ],
    }},

  }, // end CCEA GCSE

} // end GCSE

// ─────────────────────────────────────────────────────────────────────────────
// AS-LEVEL
// A fully independent tier — NOT a copy of Year 1 of the A-Level. For AQA / Edexcel /
// OCR / Eduqas, AS-Level is a decoupled, standalone qualification with its own spec
// code and content list; the content below reflects what each board's AS spec
// actually contains (narrower than, not identical to, the matching A-Level entry).
// For CCEA, AS was never decoupled — it remains Units 1 & 2 of the linear 4-unit
// A-Level, so CCEA's ASLEVEL entries below are those first-half units, written out
// independently (no reference into ALEVEL.CCEA).
// ─────────────────────────────────────────────────────────────────────────────

const ASLEVEL = {

  // ── AQA AS-LEVEL ────────────────────────────────────────────────────────────
  AQA: {

    // ── Mathematics (AQA AS 7356 — subset of A-level 7357) ────────────────────
    // 2 papers instead of 3; narrower Pure content, single combined Applied paper
    'Mathematics': { papers: {
      1: [ // Paper 1 — Pure Mathematics
        'Pure – Proof: Proof by Deduction, Proof by Exhaustion, Disproof by Counter-Example',
        'Pure – Algebra: Laws of Indices, Surds, Quadratics (Factorising, Formula, Completing the Square)',
        'Pure – Algebra: Simultaneous Equations, Inequalities (Linear and Quadratic)',
        'Pure – Algebra: Polynomials — Expanding Brackets, Algebraic Division',
        'Pure – Algebra: The Factor Theorem',
        'Pure – Graphs: Curve Sketching (Cubics, Quartics, Reciprocal Graphs)',
        'Pure – Graphs: Transformations of Graphs (Translation, Stretch, Reflection)',
        'Pure – Coordinate Geometry: Straight Lines — Gradient, Equation, Parallel/Perpendicular',
        'Pure – Coordinate Geometry: Circles — Equation, Properties, Tangent and Chord Problems',
        'Pure – Sequences and Series: Binomial Expansion (Positive Integer Powers)',
        'Pure – Sequences and Series: Arithmetic and Geometric Sequences (AS-Level Subset)',
        'Pure – Trigonometry: Sine and Cosine Rules, Area of a Triangle',
        'Pure – Trigonometry: Graphs of sin, cos, tan; Trigonometric Identities (sin²+cos²=1)',
        'Pure – Trigonometry: Solving Trigonometric Equations in a Given Interval',
        'Pure – Exponentials and Logarithms: Laws of Logarithms, Solving Equations',
        'Pure – Exponentials and Logarithms: Exponential Growth and Decay Models',
        'Pure – Differentiation: First Principles, Differentiating Polynomials',
        'Pure – Differentiation: Gradients, Tangents, Normals, Stationary Points',
        'Pure – Integration: Indefinite Integration of Polynomials (Reverse of Differentiation)',
        'Pure – Integration: Finding the Area Under a Curve (Definite Integrals)',
        'Pure – Vectors: 2D Vectors, Magnitude, Position Vectors (AS-Level Subset)',
      ],
      2: [ // Paper 2 — Statistics and Mechanics
        'Statistics – Statistical Sampling: Populations, Sampling Techniques',
        'Statistics – Data Presentation and Interpretation: Central Tendency and Spread',
        'Statistics – Data Presentation: Box Plots, Histograms, Scatter Diagrams',
        'Statistics – Probability: Venn Diagrams, Mutually Exclusive and Independent Events',
        'Statistics – Statistical Distributions: The Binomial Distribution',
        'Statistics – Statistical Hypothesis Testing: Binomial Hypothesis Tests',
        'Mechanics – Quantities and Units in Mechanics; Modelling Assumptions',
        'Mechanics – Kinematics: Displacement, Velocity, Acceleration (Constant Acceleration Formulae)',
        'Mechanics – Kinematics: Motion Graphs (Displacement-Time, Velocity-Time)',
        'Mechanics – Forces and Newton\'s Laws: Force Diagrams, F = ma',
        'Mechanics – Forces: Connected Particles, Pulleys, Motion on an Inclined Plane (AS-Level Subset)',
      ],
    }},

    // ── Further Mathematics (AQA AS 7366 — subset of A-level 7367) ────────────
    'Further Mathematics': { papers: {
      1: [ // Paper 1 — Core Pure
        'Core Pure – Complex Numbers: i, Argand Diagrams, Modulus-Argument Form (AS Subset)',
        'Core Pure – Complex Numbers: Solving Quadratic and Cubic Equations with Complex Roots',
        'Core Pure – Matrices: 2×2 Matrices, Determinants, Inverses',
        'Core Pure – Matrices: Transformations Represented by Matrices',
        'Core Pure – Algebra: Roots of Polynomials, Sums and Products of Roots',
        'Core Pure – Series: Sums of Natural Numbers, Squares and Cubes',
        'Core Pure – Calculus: Further Methods of Differentiation and Integration (AS Subset)',
        'Core Pure – Vectors: The Vector and Cartesian Equation of a Line',
        'Core Pure – Proof by Induction (Introductory)',
      ],
      2: [ // Paper 2 — Two Applied Options (subset of Mechanics/Statistics/Discrete)
        'Mechanics Option – Momentum and Impulse',
        'Mechanics Option – Work, Energy and Power',
        'Mechanics Option – Projectiles',
        'Statistics Option – Discrete Random Variables and Expectation',
        'Statistics Option – The Poisson Distribution',
        'Statistics Option – Hypothesis Testing for the Mean of a Poisson Distribution',
        'Discrete Option – Graphs, Networks and Algorithms (Kruskal, Prim)',
        'Discrete Option – Route Inspection and the Travelling Salesperson Problem (AS Subset)',
      ],
    }},

    // ── Biology (AQA AS 7401 — subset of A-level 7402) ────────────────────────
    'Biology': { papers: {
      1: [
        '3.1 – Biological Molecules: Monomers and Polymers, Carbohydrates, Lipids',
        '3.1 – Biological Molecules: Proteins and Enzymes (including Enzyme Inhibition)',
        '3.1 – Biological Molecules: Nucleic Acids (DNA and RNA Structure), ATP',
        '3.1 – Biological Molecules: Water and Inorganic Ions',
        '3.2 – Cells: Cell Structure (Eukaryotic and Prokaryotic), Microscopy',
        '3.2 – Cells: The Cell Cycle and Mitosis',
        '3.2 – Cells: Transport Across Cell Membranes (Diffusion, Osmosis, Active Transport)',
        '3.2 – Cells: Cell Recognition and the Immune System',
        '3.3 – Organisms Exchange Substances with Their Environment: Surface Area to Volume Ratio',
        '3.3 – Exchange: Gas Exchange in Humans, Insects and Plants',
        '3.3 – Exchange: Digestion and Absorption',
        '3.3 – Exchange: Mass Transport — the Circulatory System, Haemoglobin',
        'Required Practicals: Osmosis, Enzyme Rate of Reaction, Dissection of Gas Exchange System',
      ],
      2: [
        '3.4 – Genetic Information, Variation and Relationships Between Organisms: DNA, RNA, Protein Synthesis',
        '3.4 – Genetic Diversity: Meiosis and Genetic Variation',
        '3.4 – Biodiversity and Classification (AS-Level Subset)',
        '3.4 – Species and Taxonomy',
        'Practical Skills: Sampling Techniques and Biodiversity Indices',
        'Required Practicals: Microscopy of Mitosis, Dissection, Biodiversity Sampling',
      ],
    }},

    // ── Chemistry (AQA AS 7404 — subset of A-level 7405) ──────────────────────
    'Chemistry': { papers: {
      1: [ // Physical and Inorganic (AS subset)
        '3.1 – Atomic Structure: Sub-atomic Particles, Electron Configuration, Ionisation Energy',
        '3.1 – Amount of Substance: The Mole, Empirical Formulae, Molar Volume, Concentration',
        '3.1 – Amount of Substance: Atom Economy and Percentage Yield',
        '3.1 – Bonding: Ionic, Covalent, Metallic Bonding; Shapes of Molecules (VSEPR)',
        '3.1 – Bonding: Intermolecular Forces, Electronegativity, Polarity',
        '3.1 – Energetics: Enthalpy Change, Hess\'s Law, Bond Enthalpies',
        '3.1 – Kinetics: Collision Theory, Maxwell-Boltzmann Distribution, Catalysts',
        '3.1 – Chemical Equilibria: Le Chatelier\'s Principle, Kc (AS-Level Subset)',
        '3.1 – Oxidation, Reduction and Redox Equations',
        '3.2 – Periodicity: Trends Across Period 3',
        '3.2 – Group 2: The Alkaline Earth Metals',
        '3.2 – Group 7(17): The Halogens — Reactions and Trends',
      ],
      2: [ // Organic (AS subset)
        '3.3 – Introduction to Organic Chemistry: Nomenclature, Isomerism',
        '3.3 – Alkanes: Structure, Combustion, Free-Radical Substitution',
        '3.3 – Halogenoalkanes: Nucleophilic Substitution, Elimination',
        '3.3 – Alkenes: Structure, E/Z Isomerism, Addition Reactions',
        '3.3 – Alcohols: Oxidation, Elimination, Esterification',
        '3.3 – Organic Analysis: Test-Tube Reactions and Mass Spectrometry (AS-Level Subset)',
        'Required Practicals: Preparation of a Halogenoalkane, Enthalpy Change, Rate of Reaction',
      ],
    }},

    // ── Physics (AQA AS 7407 — subset of A-level 7408) ────────────────────────
    'Physics': { papers: {
      1: [
        '3.1 – Measurements and Their Errors: SI Units, Uncertainty, Estimation',
        '3.2 – Particles and Radiation: Constituents of the Atom, Stable/Unstable Nuclei',
        '3.2 – Particles and Radiation: Particles, Antiparticles and Photons',
        '3.2 – Particles and Radiation: Quarks and Leptons, Classification of Particles',
        '3.2 – Particles and Radiation: Quark Confinement and Beta Decay',
        '3.3 – Waves: Progressive and Stationary Waves, Superposition',
        '3.3 – Waves: Refraction, Diffraction, Two-Source Interference, Young\'s Double Slit',
        '3.3 – Waves: Diffraction Grating',
        '3.4 – Mechanics: Scalars and Vectors, Moments',
        '3.4 – Mechanics: Motion (SUVAT Equations, Projectile Motion)',
        '3.4 – Mechanics: Newton\'s Laws of Motion, Momentum, Conservation of Momentum',
        '3.4 – Mechanics: Work, Energy and Power',
        'Required Practicals: Determination of g, Young\'s Modulus, Resistivity',
      ],
      2: [
        '3.5 – Electricity: Charge and Current, Potential Difference and Resistance',
        '3.5 – Electricity: I-V Characteristics, Resistivity',
        '3.5 – Electricity: Circuits — EMF, Internal Resistance, Series/Parallel',
        '3.5 – Electricity: Potential Dividers',
        'Practical Skills: Use of Apparatus, Analysis of Uncertainty in Experiments',
        'Required Practicals: I-V Characteristics, EMF and Internal Resistance, Investigating Circuits',
      ],
    }},

    // ── Computer Science (AQA AS 7516 — subset of A-level 7517) ───────────────
    'Computer Science': { papers: {
      1: [
        '3.1 – Fundamentals of Programming: Programming Paradigms (Procedural, OOP Basics)',
        '3.1 – Fundamentals of Programming: Data Types, Data Structures (Arrays, Records)',
        '3.1 – Fundamentals of Programming: File Handling, Exception Handling (AS-Level Subset)',
        '3.2 – Fundamentals of Data Structures: Stacks, Queues, Linked Lists (AS-Level Subset)',
        '3.3 – Fundamentals of Algorithms: Searching (Linear, Binary) and Sorting (Bubble, Merge, Insertion)',
        '3.3 – Fundamentals of Algorithms: Algorithm Efficiency and Big O Notation (Introductory)',
        '3.4 – Theory of Computation: Finite State Machines (AS-Level Subset)',
      ],
      2: [
        '3.5 – Fundamentals of Data Representation: Number Systems, Binary Arithmetic',
        '3.5 – Fundamentals of Data Representation: Floating Point, Text/Image/Sound Representation',
        '3.6 – Computer Systems: Hardware and Software, Classification of Software',
        '3.6 – Computer Systems: The CPU (Von Neumann Architecture, FDE Cycle, Pipelining)',
        '3.7 – Fundamentals of Computer Networks: Network Types, Topologies, Client-Server vs P2P',
        '3.8 – Fundamentals of Cyber Security: Threats and Prevention Methods (AS-Level Subset)',
        '3.10 – Fundamentals of Databases: Relational Databases, Normalisation (AS-Level Subset)',
        '3.12 – Fundamentals of Communication and Networking Basics',
        'Non-Exam Component: Not Assessed at AS-Level (A-Level Only)',
      ],
    }},

    // ── English Language (AQA AS 7701 — subset of A-level 7702) ───────────────
    'English Language': { papers: {
      1: [ // Language and the Individual
        'Section A – Textual Variations and Representations: Comparing Two Unseen Texts',
        'Section A: Analysing Audience, Purpose, Genre and Mode',
        'Section B – Children\'s Language Development: Spoken Language Development 0–5 Years',
        'Section B: Theories of Language Acquisition (Chomsky, Skinner, Bruner — AS-Level Subset)',
        'Language Levels: Phonetics and Phonology, Lexis and Semantics',
        'Language Levels: Grammar (Word Class, Sentence Structure), Pragmatics and Discourse',
        'Applying Language Frameworks to Unseen Texts',
      ],
      2: [ // Language Varieties
        'Language Diversity: Regional Variation — Dialect and Accent',
        'Language Diversity: Social Variation — Class, Occupation, Age',
        'Language Diversity: Ethnic Variation and Multicultural London English (AS-Level Subset)',
        'Attitudes to Language: Received Pronunciation, Language Prejudice, Prescriptivism',
        'Language Discourses: Studying How Language Diversity is Discussed and Debated',
        'Investigating Language Change: Introductory Coverage (Full Depth is A-Level Only)',
      ],
    }},

    // ── English Literature (AQA AS Literature A — 7711) ────────────────────────
    'English Literature': { papers: {
      1: [ // Love Through the Ages: Shakespeare and Poetry
        'Set Shakespeare Play: Detailed Study of Language, Form and Structure',
        'Set Shakespeare Play: the Presentation of Love and Relationships',
        'Set Poetry: Pre-1900 Poetry Anthology — Studying the Love Through the Ages Theme',
        'Poetic Form, Structure and Language: Close Analysis of Set Poems',
        'Unseen Poetry: Comparing an Unseen Poem with a Studied Poem',
        'Literary Terminology and Close Textual Analysis (AO2)',
      ],
      2: [ // Love Through the Ages: Prose
        'Set Prose Text: Detailed Study of One Novel Exploring Love Through the Ages',
        'Comparative Essay: Comparing the Set Prose Text with the Set Shakespeare Play',
        'Contextual Factors: Social, Historical and Literary Context of the Set Texts (AO3)',
        'Critical Interpretations: Different Readings of the Set Texts (AO5, AS-Level Subset)',
      ],
    }},

    // ── History (AQA AS 7041 — subset of A-level 7042) ────────────────────────
    'History': { papers: {
      1: [ // Breadth Study (AS covers a shorter date range than the equivalent A-level Paper 1)
        'Breadth Study (choice of one): The Age of the Crusades c.1071–1149 (AS-Level Date Range)',
        'Breadth Study (choice of one): The Tudors — England 1485–1547 (AS-Level Date Range)',
        'Breadth Study (choice of one): Stuart Britain and the Crisis of Monarchy 1603–1649',
        'Breadth Study (choice of one): Industrialisation and the People — Britain c1783–1832',
        'Breadth Study (choice of one): Tsarist and Communist Russia 1855–1917 (AS-Level Date Range)',
        'Breadth Study (choice of one): The British Empire c1857–1914 (AS-Level Date Range)',
        'Breadth Study (choice of one): The Making of a Superpower — USA 1865–1920',
        'Breadth Study (choice of one): The Quest for Political Stability — Germany 1871–1929',
        'Historical Interpretations: Analysing and Evaluating Historians\' Views (AS-Level Extract Questions)',
        'Key Themes: Change, Continuity, Cause and Consequence Across the Breadth Period',
      ],
      2: [ // Depth Study (AS covers a shorter date range than the equivalent A-level Paper 2)
        'Depth Study (choice of one): Royal Authority and the Angevin Kings 1154–1189',
        'Depth Study (choice of one): The Wars of the Roses 1450–1471',
        'Depth Study (choice of one): Religious Conflict and the Church in England c1529–1547',
        'Depth Study (choice of one): The English Revolution 1625–1642',
        'Depth Study (choice of one): The Birth of the USA 1760–1776',
        'Depth Study (choice of one): Revolution and Dictatorship — Russia 1917–1929',
        'Depth Study (choice of one): Democracy and Nazism — Germany 1918–1933',
        'Depth Study (choice of one): The Cold War c1945–1963 (AS-Level Date Range)',
        'Source Analysis: Evaluating Primary Source Evidence in Its Historical Context',
        'Historical Concepts: Similarity, Difference and Significance Within the Depth Period',
      ],
    }},

    // ── Geography (AQA AS 7036 — subset of A-level 7037) ──────────────────────
    'Geography': { papers: {
      1: [ // Physical Geography and People and the Environment
        'Water and Carbon Cycles: Systems, Stores and Transfers (AS-Level Subset)',
        'Water and Carbon Cycles: Human Impact on the Water and Carbon Cycles',
        'Coastal Systems and Landscapes (choice of option): Processes and Landforms',
        'Coastal Systems and Landscapes: Coastal Management Strategies (AS-Level Subset)',
        'Hazards (choice of option): Plate Tectonics Theory, Volcanic and Seismic Hazards',
        'Hazards: Hazard Management Frameworks and Case Studies (AS-Level Subset)',
        'Fieldwork Skills: Data Collection Techniques and Methodology (Introductory)',
        'Fieldwork Skills: Presentation and Analysis of Fieldwork Data',
      ],
      2: [ // Human Geography and the Geography Fieldwork Investigation
        'Global Systems and Global Governance: Globalisation — Causes and Consequences (AS-Level Subset)',
        'Global Systems and Global Governance: Global Governance of the Earth\'s Oceans (AS-Level Subset)',
        'Changing Places: Understanding Places — Characteristics, Meaning and Representation',
        'Changing Places: Endogenous and Exogenous Factors in Place-Making',
        'Geographical Skills: Cartographic Techniques — OS Maps, Choropleth and Isoline Maps',
        'Geographical Skills: Graphical and Statistical Techniques — Mean, Median, Standard Deviation',
        'Geography Fieldwork Investigation: Planning and Independent Data Collection (AS-Level, Written Up)',
      ],
    }},

    // ── Business (AQA AS 7137 — subset of A-level 7138) ───────────────────────
    'Business': { papers: {
      1: [ // Business 1 (new AS spec)
        '1 – What is Business? Dynamic Nature of Business, Objectives and Stakeholders',
        '1 – Business Structures: Sole Traders, Partnerships, Private and Public Limited Companies',
        '2 – Managers, Leadership and Decision-Making: Management Styles (AS-Level Subset)',
        '2 – Decision-Making: Scientific Decision-Making, Influences on Decisions',
        '3 – Decision-Making to Improve Marketing Performance: Market Research, the Marketing Mix',
        '3 – Marketing: Segmentation, Targeting and Positioning (AS-Level Subset)',
        '4 – Decision-Making to Improve Operational Performance: Production Methods, Quality',
        '4 – Operations: Managing Stock, Suppliers and Procurement (AS-Level Subset)',
      ],
      2: [ // Business 2 (new AS spec)
        '5 – Decision-Making to Improve Financial Performance: Costs, Revenue and Profit',
        '5 – Finance: Sources of Finance, Cash Flow Forecasting (AS-Level Subset)',
        '5 – Finance: Break-Even Analysis and Interpreting Financial Statements',
        '6 – Decision-Making to Improve Human Resource Performance: Organisational Design',
        '6 – Human Resources: Recruitment, Selection and Motivation Theory (AS-Level Subset)',
        'Analysing and Evaluating Business Data: Case Study and Data-Response Skills',
      ],
    }},

    // ── Economics (AQA AS 7135 — subset of A-level 7136) ──────────────────────
    'Economics': { papers: {
      1: [ // The Operation of Markets and Market Failure
        'Economic Methodology and the Economic Problem: Positive and Normative Statements',
        'Price Determination: Demand and Supply Curves, Equilibrium, Elasticity',
        'Production, Costs and Revenue: Short-Run and Long-Run Costs (AS-Level Subset)',
        'Perfect Competition and Monopoly: Market Structures (AS-Level Subset)',
        'The Labour Market: Demand and Supply of Labour, Wage Determination (AS-Level Subset)',
        'Market Failure: Externalities, Public Goods, Information Gaps',
        'Government Intervention: Taxes, Subsidies, Price Controls, Regulation (AS-Level Subset)',
      ],
      2: [ // The National Economy in a Global Context
        'Measures of Economic Performance: Inflation, Employment, Growth, Balance of Payments',
        'Aggregate Demand: Consumption, Investment, Government Spending, Net Trade',
        'Aggregate Supply: Short-Run and Long-Run Aggregate Supply (AS-Level Subset)',
        'National Income: The Circular Flow of Income, Determination of Equilibrium National Income',
        'Economic Growth: Causes and Consequences of Growth (AS-Level Subset)',
        'Fiscal Policy: Government Spending, Taxation and the Budget (AS-Level Subset)',
        'Monetary Policy: Interest Rates, the Role of the Bank of England (AS-Level Subset)',
      ],
    }},

    // ── Sociology (AQA AS 7191 — subset of A-level 7192) ──────────────────────
    'Sociology': { papers: {
      1: [ // Education with Methods in Context
        'Education: Functionalist, Marxist and Feminist Perspectives on the Role of Education',
        'Education: Class Differences in Achievement — Internal and External Factors',
        'Education: Gender Differences in Achievement and Subject Choice',
        'Education: Ethnic Differences in Achievement (AS-Level Subset)',
        'Education Policy: Selection, Marketisation and the Role of the State (AS-Level Subset)',
        'Research Methods: Quantitative and Qualitative Methods, Sampling',
        'Methods in Context: Applying Research Methods to the Study of Education',
      ],
      2: [ // Research Methods and Topics in Sociology
        'Families and Households: Functionalist, Marxist and Feminist Perspectives on the Family',
        'Families and Households: Family Diversity — Changing Patterns of Family Life',
        'Families and Households: Demographic Trends — Birth Rate, Death Rate, Ageing Population',
        'Families and Households: Childhood as a Social Construction (AS-Level Subset)',
        'Sociological Theory: Consensus, Conflict, Social Action and Postmodern Approaches (Introductory)',
        'Research Methods: Theoretical, Practical and Ethical Considerations in Research Design',
      ],
    }},

    // ── Psychology (AQA AS 7181 — subset of A-level 7182) ─────────────────────
    'Psychology': { papers: {
      1: [ // Introductory Topics in Psychology
        'Social Influence: Types of Conformity and Explanations (Asch, Conformity to Social Roles — Zimbardo)',
        'Social Influence: Obedience — Milgram\'s Research and Explanations for Obedience',
        'Social Influence: Resistance to Social Influence, Minority Influence, Social Change',
        'Memory: The Multi-Store Model — Sensory Register, Short-Term and Long-Term Memory',
        'Memory: Types of Long-Term Memory, the Working Memory Model',
        'Memory: Explanations for Forgetting — Interference and Retrieval Failure',
        'Memory: Eyewitness Testimony — Misleading Information and Anxiety',
        'Attachment: Caregiver-Infant Interactions, Schaffer\'s Stages of Attachment',
        'Attachment: Animal Studies of Attachment (Lorenz, Harlow), Explanations (Learning Theory, Bowlby)',
        'Attachment: Ainsworth\'s Strange Situation, Cultural Variations, Bowlby\'s Theory of Maternal Deprivation',
      ],
      2: [ // Psychology in Context
        'Approaches in Psychology: Origins of Psychology — Wundt and Introspection',
        'Approaches: The Learning Approaches — Behaviourism and Social Learning Theory',
        'Approaches: The Cognitive Approach — Schema, the Emergence of Cognitive Neuroscience',
        'Approaches: The Biological Approach — Genes, Neurochemistry, the Nervous System',
        'Approaches: The Psychodynamic Approach — the Role of the Unconscious, Defence Mechanisms',
        'Biopsychology: The Nervous System and Endocrine System (AS-Level Subset)',
        'Psychopathology: Definitions of Abnormality (Deviation from Social Norms, Failure to Function)',
        'Psychopathology: Phobias, Depression and OCD — Behavioural, Cognitive and Biological Explanations',
        'Research Methods: Experimental Method, Aims, Hypotheses, Sampling Techniques',
        'Research Methods: Scientific Processes, Data Analysis and Presentation (AS-Level Subset)',
      ],
    }},



    // ── French (AQA AS 7651 — subset of A-level 7652) ─────────────────────────
    // Note: AS French/German/Spanish (2 papers: Listening/Reading/Writing + Writing) have no
    // separately-timetabled speaking test at AS — speaking is assessed as part of teaching, not
    // certificated the way A-level's Paper 3 speaking exam is. Listed here for teaching reference.
    'French': { papers: {
      1: [ // Listening, Reading and Writing
        'Theme 1 – Aspects of French-Speaking Society: Family Structures, Cyber-Society, Volunteering',
        'Theme 2 – Artistic Culture in the French-Speaking World: Music, Media, Festivals',
        'Listening: Identifying Detail, Opinion and Gist in Authentic Recordings',
        'Reading: Authentic Texts — Articles, Literary Extracts, Adverts',
        'Grammar – Tenses: Present, Perfect, Imperfect, Future, Conditional',
        'Grammar – the Subjunctive Mood (Introductory), Object Pronouns, Comparative/Superlative',
        'Translation – Into English and Into French (Shorter Passages than A-Level)',
      ],
      2: [ // Writing
        'Writing: Structured Written Response to a Question on Theme 1 or 2',
        'Writing: Grammatical Accuracy and Range of Structures at AS-Level',
        'Set Text or Film Study: One Studied Work (AS-Level — Fewer Requirements than A-Level)',
        'General Conversation Skills: Discussion of Sub-Themes Studied (Teaching Preparation for Speaking)',
      ],
    }},

    // ── German (AQA AS 7661 — subset of A-level 7662) ─────────────────────────
    'German': { papers: {
      1: [ // Listening, Reading and Writing
        'Theme 1 – Aspects of German-Speaking Society: Family Structures, Digital Life, Volunteering',
        'Theme 2 – Artistic Culture in the German-Speaking World: Music, Media, Festivals',
        'Listening: Identifying Detail, Opinion and Gist in Authentic Recordings',
        'Reading: Authentic Texts — Articles, Literary Extracts, Adverts',
        'Grammar – Cases (Nominative, Accusative, Dative, Genitive), Word Order',
        'Grammar – Tenses: Present, Perfect, Imperfect, Future',
        'Grammar – Subordinate Clauses, Modal Verbs, the Passive Voice (Introductory)',
        'Translation – Into English and Into German (Shorter Passages than A-Level)',
      ],
      2: [ // Writing
        'Writing: Structured Written Response to a Question on Theme 1 or 2',
        'Writing: Grammatical Accuracy and Range of Structures at AS-Level',
        'Set Text or Film Study: One Studied Work (AS-Level — Fewer Requirements than A-Level)',
        'General Conversation Skills: Discussion of Sub-Themes Studied (Teaching Preparation for Speaking)',
      ],
    }},

    // ── Spanish (AQA AS 7691 — subset of A-level 7692) ────────────────────────
    'Spanish': { papers: {
      1: [ // Listening, Reading and Writing
        'Theme 1 – Aspects of Hispanic Society: Family Structures, Digital Life, Volunteering',
        'Theme 2 – Artistic Culture in the Hispanic World: Music, Media, Festivals',
        'Listening: Identifying Detail, Opinion and Gist in Authentic Recordings',
        'Reading: Authentic Texts — Articles, Literary Extracts, Adverts',
        'Grammar – Ser/Estar, Tenses (Present, Preterite, Imperfect, Future)',
        'Grammar – the Subjunctive Mood (Introductory), Pronouns, Comparatives, Por/Para',
        'Translation – Into English and Into Spanish (Shorter Passages than A-Level)',
      ],
      2: [ // Writing
        'Writing: Structured Written Response to a Question on Theme 1 or 2',
        'Writing: Grammatical Accuracy and Range of Structures at AS-Level',
        'Set Text or Film Study: One Studied Work (AS-Level — Fewer Requirements than A-Level)',
        'General Conversation Skills: Discussion of Sub-Themes Studied (Teaching Preparation for Speaking)',
      ],
    }},

    // ── Art & Design (AQA AS 7201) ─────────────────────────────────────────────
    'Art & Design': { papers: {
      1: [ // Component 1 — Personal Investigation (Coursework Portfolio)
        'Personal Investigation: Developing a Theme (AS-Level — Smaller Scale than A-Level)',
        'AO1 – Develop: Research and Contextual Sources, Recording Initial Ideas',
        'AO2 – Explore: Experimentation with Media, Materials and Techniques',
        'AO3 – Record: Observational Studies, Annotation and Visual Recording',
        'AO4 – Present: Personal, Meaningful Response and Realisation of Intentions',
        'Contextual Sources: Analysing the Work of Other Artists and Movements',
      ],
      2: [ // Component 2 — Externally Set Assignment
        'Externally Set Assignment: Responding to an Exam Board Starting Point (AS — Shorter Prep than A-Level)',
        'Preparatory Studies: Developing Ideas from the Starting Point',
        'Supervised Time: Realising a Final Piece Under Timed Conditions (AS-Level — Shorter than A-Level)',
      ],
    }},

    // ── Photography (AQA AS 7201 — one of AQA's Art & Design title options) ────
    // AQA's Art and Design suite is a family of separate titles sharing one spec code (7201-6):
    // Art Craft and Design, Fine Art, Graphic Communication, Photography, Textile Design,
    // Three-Dimensional Design. Built out separately here since it's commonly chosen on its own.
    'Photography': { papers: {
      1: [ // Component 1 — Personal Investigation
        'Personal Investigation: Developing a Theme (AS-Level — Smaller Scale than A-Level)',
        'AO1 – Develop: Research Into Photographers and Photographic Movements',
        'AO2 – Explore: Experimentation with Camera Techniques, Lighting, Composition',
        'AO3 – Record: Photo Shoots, Contact Sheets, Annotation',
        'AO4 – Present: Personal Response and Final Photographic Outcome',
        'Digital Editing and Manipulation Techniques (Introductory)',
      ],
      2: [ // Component 2 — Externally Set Assignment
        'Externally Set Assignment: Responding to an Exam Board Starting Point (AS — Shorter Prep than A-Level)',
        'Preparatory Studies: Test Shoots and Development of Ideas from the Starting Point',
        'Supervised Time: Final Photographic Outcome Under Timed Conditions (AS-Level — Shorter than A-Level)',
      ],
    }},

    // ── Law (AQA AS 7161 — subset of A-level 7162) ─────────────────────────────
    'Law': { papers: {
      1: [ // The Legal System and Criminal Law
        'The Nature of Law and the English Legal System: Civil and Criminal Courts',
        'The Nature of Law: Sources of Law — Legislation, Delegated Legislation, Judicial Precedent',
        'The Nature of Law: Statutory Interpretation — Rules and Aids',
        'The Legal Profession: Barristers, Solicitors, and Access to Justice (AS-Level Subset)',
        'Criminal Law: General Principles — Actus Reus and Mens Rea',
        'Criminal Law: Non-Fatal Offences Against the Person (AS-Level Subset — Fewer than A-Level)',
        'Criminal Law: General Defences — Introductory Coverage of Self-Defence and Consent',
      ],
      2: [ // Criminal Law Continued / Introduction to Tort
        'Criminal Law: Property Offences — Theft and Basic Robbery (AS-Level Subset)',
        'Criminal Law: Preliminary Offences — Attempts (Introductory)',
        'The Law of Tort: Negligence — Duty of Care, Breach and Causation (AS-Level Subset)',
        'The Law of Tort: Occupiers\' Liability (Introductory)',
        'Law-Making: Parliamentary Law-Making Process and Influences on It',
      ],
    }},

    // ── Philosophy (AQA AS 7171 — subset of A-level 7172) ─────────────────────
    'Philosophy': { papers: {
      1: [ // Epistemology and Moral Philosophy
        'Epistemology: The Definition of Knowledge — Tripartite View and Gettier Problem',
        'Epistemology: Perception as a Source of Knowledge — Direct and Indirect Realism',
        'Epistemology: Reason as a Source of Knowledge — Innatism (AS-Level Subset)',
        'Moral Philosophy: Normative Ethical Theories — Utilitarianism (Act and Rule)',
        'Moral Philosophy: Normative Ethical Theories — Kantian Deontological Ethics',
        'Moral Philosophy: Applied Ethics — Stealing and Simulated Killing (AS-Level Subset)',
        'Moral Philosophy: Metaethics — Moral Realism vs Anti-Realism (Introductory)',
      ],
      2: [ // The Metaphysics of God and of Mind
        'Metaphysics of God: The Concept and Nature of God (Omniscience, Omnipotence, Eternity)',
        'Metaphysics of God: The Design Argument (Paley, Hume\'s Criticisms)',
        'Metaphysics of God: The Cosmological Argument (Aquinas\' Three Ways)',
        'Metaphysics of God: The Ontological Argument (Anselm, Descartes, Gaunilo\'s Objection)',
        'Metaphysics of God: The Problem of Evil — Logical and Evidential Forms (AS-Level Subset)',
        'Metaphysics of Mind: Substance Dualism (Descartes)',
        'Metaphysics of Mind: Philosophical Behaviourism and Mind-Brain Type Identity Theory (AS-Level Subset)',
      ],
    }},

    // ── Accounting (AQA AS 7126 — subset of A-level 7127) ─────────────────────
    'Accounting': { papers: {
      1: [ // Introduction to Accounting and Double-Entry
        'The Purpose of Accounting; Types of Business Organisation (Sole Trader, Partnership, Limited Company)',
        'Recording Financial Transactions: Source Documents, Books of Prime Entry',
        'Recording Financial Transactions: Double-Entry Bookkeeping — Ledger Accounts',
        'Verification of Accounting Records: the Trial Balance',
        'Verification of Accounting Records: Correction of Errors and Suspense Accounts',
        'Preparation of Financial Statements: Sole Traders — Income Statement and Statement of Financial Position',
        'Accounting Concepts and Adjustments: Accruals, Prepayments, Depreciation, Irrecoverable Debts',
      ],
      2: [ // Further Financial Accounting and Analysis (AS Subset)
        'Partnership Accounts: Appropriation Accounts, Partners\' Current and Capital Accounts (AS-Level Subset)',
        'Limited Company Accounts: Introductory Coverage of Share Capital and Reserves (AS-Level Subset)',
        'Not-for-Profit Organisations: Receipts and Payments, Income and Expenditure Accounts (AS-Level Subset)',
        'Analysis and Evaluation of Financial Information: Profitability and Liquidity Ratios',
        'Analysis and Evaluation: Limitations of Ratio Analysis and Accounting Information',
      ],
    }},

    // ── Politics (AQA AS 7151 — subset of A-level 7152) ───────────────────────
    'Politics': { papers: {
      1: [ // Paper 1 — Government and Politics of the UK
        'Democracy and Participation: Direct and Representative Democracy, the Franchise',
        'Democracy and Participation: Pressure Groups and Other Influences (AS-Level Subset)',
        'Political Parties: Established Parties, Emerging and Minor Parties, Funding',
        'Electoral Systems: First Past the Post and Alternative Systems Used in the UK',
        'Voting Behaviour and the Media: Factors Affecting Voting, Opinion Polls (AS-Level Subset)',
        'Core Political Ideas: Conservatism — Core Ideas and Principles (AS-Level Subset)',
      ],
      2: [ // Paper 2 — Government and Politics of the UK (continued)
        'The Constitution: Sources, Nature and Debates on Codification',
        'Parliament: Structure and Role of the Commons and Lords, the Legislative Process',
        'The Prime Minister and Executive: Powers, Cabinet Government, Accountability',
        'Relationships Between the Branches: Parliament, Executive and Judiciary (AS-Level Subset)',
        'Core Political Ideas: Liberalism — Core Ideas and Principles (AS-Level Subset)',
      ],
    }},

    // ── Religious Studies (AQA AS 7061 — subset of A-level 7062) ──────────────
    'Religious Studies': { papers: {
      1: [ // Philosophy of Religion and Ethics
        'Philosophy of Religion: Ancient Philosophical Influences — Plato\'s and Aristotle\'s Views (AS-Level Subset)',
        'Philosophy of Religion: The Nature of the Soul, Mind and Body — Dualism and Materialism',
        'Philosophy of Religion: The Design Argument (Paley, Hume\'s Criticisms — AS-Level Subset)',
        'Philosophy of Religion: The Cosmological Argument (Aquinas, Copleston — AS-Level Subset)',
        'Philosophy of Religion: Religious Experience — Types and Challenges',
        'Philosophy of Religion: The Problem of Evil — Logical and Evidential Forms',
        'Religion and Ethics: Natural Law (Aquinas)',
        'Religion and Ethics: Situation Ethics (Fletcher)',
        'Religion and Ethics: Kantian Deontological Ethics (AS-Level Subset)',
        'Religion and Ethics: Utilitarianism — Act and Rule (AS-Level Subset)',
      ],
      2: [ // Study of Religion (choice of Buddhism/Christianity/Hinduism/Islam/Judaism)
        'Religious Beliefs, Values and Teachings: Sources of Wisdom and Authority (AS-Level Subset)',
        'Religious Beliefs, Values and Teachings: Core Beliefs of the Chosen Religion',
        'Religious Practices: Worship, Festivals and Ways of Life (AS-Level Subset)',
        'Religious Identity: How Religious Identity Varies Within the Chosen Tradition',
        'Sources of Wisdom and Authority: Interpretation of Scripture or Sacred Text',
      ],
    }},

    // ── Physical Education (AQA AS 7581 — subset of A-level 7582) ─────────────
    'Physical Education': { papers: {
      1: [ // Factors Affecting Participation in Physical Activity and Sport
        'Applied Anatomy and Physiology: The Cardiovascular System — Structure and Function',
        'Applied Anatomy and Physiology: The Respiratory System — Mechanics of Breathing, Gas Exchange',
        'Applied Anatomy and Physiology: The Neuromuscular System — Muscle Fibre Types (AS-Level Subset)',
        'Applied Anatomy and Physiology: Energy Systems — ATP-PC, Glycolytic, Aerobic (AS-Level Subset)',
        'Skill Acquisition: Characteristics and Classification of Skill (Simple/Complex, Open/Closed)',
        'Skill Acquisition: Methods of Practice — Whole, Part and Progressive Part',
        'Skill Acquisition: Transfer of Learning, Guidance and Feedback (AS-Level Subset)',
        'Sport and Society: Pre-Industrial and Industrial Sport in Britain',
      ],
      2: [ // Factors Affecting Optimal Performance
        'Sport and Society: Emergence and Evolution of Modern Sport (AS-Level Subset)',
        'Sport Psychology: Aspects of Personality and Attitudes to Sport (AS-Level Subset)',
        'Sport Psychology: Arousal, Anxiety and Aggression in Sport',
        'Sport and Society: Ethics and Deviance in Sport (Introductory)',
        'Practical Performance (NEA): One Practical Activity as Player, Performer or Coach (AS — Fewer than A-Level)',
        'Practical Performance (NEA): Written/Verbal Analysis of Performance',
      ],
    }},

    // ── Media Studies (AQA AS 7571 — subset of A-level 7572) ──────────────────
    'Media Studies': { papers: {
      1: [ // Paper 1 — Media Language and Representation (AS Set Products: fewer than A-level)
        'Media Language: Camera, Editing, Mise-en-Scène, Sound (AS Set Products)',
        'Media Language: Media Forms and Conventions of Genre',
        'Media Representation: Stereotypes, Perspectives, Media Values and Ideology',
        'Set Product – Advertising and Marketing: Print and Online Campaign',
        'Set Product – Music Video: One Studied Video Analysed for Language and Representation',
        'Set Product – Newspapers: Analysing Front Pages (AS-Level Subset)',
        'Theoretical Framework: Applying Barthes, Lévi-Strauss and Todorov (Introductory)',
      ],
      2: [ // Paper 2 — Media Industries and Audiences
        'Media Industries: Ownership, Ownership Patterns, Conglomeration (AS-Level Subset)',
        'Media Industries: Regulation — Statutory and Self-Regulation, Ofcom, IPSO, BBFC',
        'Media Industries: Funding Models — Public Funding, Advertising, Subscription',
        'Media Audiences: Targeting, Categorising and Reaching Audiences',
        'Media Audiences: Effects Theories, Uses and Gratifications (AS-Level Subset)',
        'Set Product – Radio: One Studied Extract Analysed for Industry and Audience',
        'Non-Exam Assessment: Creating a Media Product to a Brief (AS-Level — Shorter Brief than A-Level)',
      ],
    }},

    // ── Drama and Theatre (AQA AS 7261 — subset of A-level 7262) ──────────────
    'Drama and Theatre': { papers: {
      1: [ // Component 1 — Drama and Theatre (written exam)
        'Set Play Study: Structure, Character and Language of the Set Text',
        'Set Play: Social, Historical and Cultural Context of Writing and Original Staging',
        'Set Play: Practical Interpretation — Directorial, Design and Performance Choices',
        'Live Theatre Evaluation: Analysing a Professional Production Seen Live',
        'Live Theatre Evaluation: Use of Performance and Design Elements in Review',
        'Theatrical Practitioners: Introductory Study of One Influential Practitioner',
      ],
      2: [ // Component 2 — Creating Original Drama (NEA, practical)
        'Devised Piece: Stimulus Response and Development of Original Material',
        'Devised Piece: Process Portfolio Documenting Rehearsal and Development (AS — Shorter than A-Level)',
        'Devised Piece: Performance to an Audience',
        'Group Work Skills: Collaboration, Role and Responsibility Within an Ensemble',
        'Reflection: Evaluating Own Contribution to the Devising Process',
      ],
    }},

    // ── Latin (AQA AS 7681 — subset of A-level 7682) ──────────────────────────
    'Latin': { papers: {
      1: [ // Language
        'Language – Grammar: Noun Declensions (1st–5th), Adjective Agreement, Pronouns',
        'Language – Grammar: Verb Tenses (Present, Imperfect, Future, Perfect, Pluperfect) — Active Voice',
        'Language – Grammar: Introduction to the Passive Voice (AS-Level Subset)',
        'Language – Syntax: Purpose Clauses, Indirect Statement (AS-Level Subset)',
        'Language – Syntax: Ablative Absolute, Participles (Introductory)',
        'Unseen Translation: Latin Prose (Shorter, More Accessible Passages than A-Level)',
        'Comprehension: Short Unseen Passage with Questions in English',
      ],
      2: [ // Literature
        'Prescribed Verse Literature: One Set Text Extract (AS-Level — Fewer Lines than A-Level)',
        'Prescribed Prose Literature: One Set Text Extract (AS-Level — Fewer Lines than A-Level)',
        'Literary Appreciation: Style, Content and Structure of Set Texts',
        'Roman Contexts: Historical and Cultural Background to the Set Texts',
      ],
    }},

    // ── Classical Greek (AQA AS 7881 — subset of A-level 7882) ────────────────
    'Classical Greek': { papers: {
      1: [ // Language
        'Language – Grammar: Noun Declensions (1st, 2nd, 3rd), Adjective Agreement, Pronouns',
        'Language – Grammar: Verb Tenses (Present, Imperfect, Future, Aorist) — Active and Middle Voice',
        'Language – Grammar: Introduction to the Passive Voice (AS-Level Subset)',
        'Language – Syntax: Simple and Compound Sentences, Participles (Introductory)',
        'Unseen Translation: Greek Prose (Shorter, More Accessible Passages than A-Level)',
        'Comprehension: Short Unseen Passage with Questions in English',
      ],
      2: [ // Literature
        'Prescribed Verse Literature: One Set Text Extract (AS-Level — Fewer Lines than A-Level)',
        'Prescribed Prose Literature: One Set Text Extract (AS-Level — Fewer Lines than A-Level)',
        'Literary Appreciation: Style, Content and Structure of Set Texts',
        'Historical and Cultural Context of the Set Texts (Introductory)',
      ],
    }},

    // ── Music (AQA AS 7271 — subset of A-level 7272) ──────────────────────────
    'Music': { papers: {
      1: [ // Appraising Music
        'Areas of Study – Western Classical Tradition: Set Works (AS-Level — Fewer Works than A-Level)',
        'Areas of Study – Pop Music: Set Works and Wider Listening',
        'Areas of Study – Rock and Jazz OR Musical Theatre OR Music for Media (Choice of One, AS Subset)',
        'Dictation and Score-Reading: Melodic and Rhythmic Dictation',
        'Aural Perception: Identifying Chords, Cadences and Intervals by Ear',
        'Analysis: Harmony, Structure, Texture and Instrumentation of Set Works',
      ],
      2: [ // Performing and Composing (NEA)
        'Performance (NEA): Solo and/or Ensemble Performance (AS — Shorter Minimum Time than A-Level)',
        'Performance (NEA): Choice of Repertoire and Technical Demand',
        'Composition (NEA): One Composition to a Brief (AS — Fewer Compositions than A-Level)',
        'Composition (NEA): Using Musical Elements — Melody, Harmony, Structure, Texture',
      ],
    }},

    // ── English Language and Literature (AQA AS 7706 — subset of A-level 7707) ─
    'English Language & Literature': { papers: {
      1: [ // Paper 1 — Telling Stories
        'Telling Stories: Studying a Prose Fiction Text Through Language and Literature Lenses',
        'Telling Stories: Narrative Theory — Narrative Voice, Point of View, Focalisation',
        'Telling Stories: Combining Linguistic Methods (Lexis, Grammar) with Literary Analysis',
        'Telling Stories: Studying a Poetry Anthology Alongside the Prose Text (AS-Level Subset)',
        'Applying Frameworks: Genre, Register and Style Across Texts',
      ],
      2: [ // Paper 2 — Varieties in Language and Literature (AS Subset)
        'Varieties in Language and Literature: Studying a Second Prose or Drama Text (AS-Level Subset)',
        'Varieties in Language and Literature: Comparing Texts Across Genre and Mode',
        'Language Methods: Phonological, Lexical, Grammatical and Discourse Analysis Applied to Literary Texts',
        'Contextual Factors: Social, Historical and Cultural Influence on Meaning (AS-Level Subset)',
      ],
    }},

    // ── Design and Technology: Product Design (AQA AS 7551 — subset of A-level 7552) ─
    'Design and Technology: Product Design': { papers: {
      1: [ // Technical Principles
        'Technical Principles: New and Emerging Technologies (AS-Level Subset)',
        'Technical Principles: Energy Generation and Storage (Introductory)',
        'Technical Principles: Materials — Papers/Boards, Timbers, Metals, Polymers, Textiles',
        'Technical Principles: Performance Characteristics of Materials (AS-Level Subset)',
        'Technical Principles: Systems Approach to Designing, Mechanical Devices',
        'Technical Principles: Selection of Materials and Components',
      ],
      2: [ // Designing and Making Principles
        'Designing and Making Principles: Investigation — Primary and Secondary Data (AS-Level Subset)',
        'Designing and Making Principles: the Work of Past and Present Designers',
        'Designing and Making Principles: Design Communication, Sketching and Annotation',
        'Designing and Making Principles: Prototyping and 3D Modelling (Introductory)',
        'NEA – Design and Make Task: Portfolio and Prototype (AS-Level — Smaller-Scale Than A-Level)',
      ],
    }},

    // ── Environmental Science (AQA AS 7446 — subset of A-level 7447) ───────────
    'Environmental Science': { papers: {
      1: [
        'The Living Environment: Biogeochemical Cycles (Carbon and Nitrogen — AS-Level Subset)',
        'The Living Environment: Ecosystems — Structure, Energy Flow, Trophic Levels',
        'The Living Environment: Biodiversity — Measuring and Valuing Biodiversity',
        'The Physical Environment: the Lithosphere — Structure and Plate Tectonics (AS-Level Subset)',
        'The Physical Environment: the Atmosphere — Structure and Circulation (AS-Level Subset)',
        'The Physical Environment: the Hydrosphere — the Water Cycle',
      ],
      2: [
        'Energy Resources: Fossil Fuels and Renewable Energy Technologies (AS-Level Subset)',
        'Pollution: Types, Sources and Effects of Air and Water Pollution (AS-Level Subset)',
        'Biological Resources: Agriculture and Food Production (AS-Level Subset)',
        'Sustainability: Principles of Sustainable Development (Introductory)',
        'Practical and Fieldwork Skills: Data Collection and Analysis Techniques',
      ],
    }},

  }, // end AQA AS-Level

  // ── EDEXCEL AS-LEVEL ────────────────────────────────────────────────────────
  Edexcel: {

    // ── Mathematics (Edexcel AS 8MA0 — subset of A-level 9MA0) ────────────────
    'Mathematics': { papers: {
      1: [ // Paper 1 — Pure Mathematics
        'Pure – Algebraic Expressions: Indices, Surds, Quadratics, Simultaneous Equations',
        'Pure – Algebraic Expressions: Inequalities, Polynomials, Algebraic Fractions',
        'Pure – Graphs and Transformations: Cubic, Quartic and Reciprocal Graphs',
        'Pure – Straight Line Graphs: Equations, Gradients, Parallel/Perpendicular',
        'Pure – Circles: Equation of a Circle, Tangents and Chords',
        'Pure – Binomial Expansion (Positive Integer Powers)',
        'Pure – Trigonometric Ratios: Sine/Cosine Rule, Radians (AS-Level Subset)',
        'Pure – Trigonometric Identities and Equations (AS-Level Subset)',
        'Pure – Vectors (2D, AS-Level Subset)',
        'Pure – Differentiation: First Principles, Rules, Tangents and Normals',
        'Pure – Integration: Indefinite Integrals, Area Under a Curve',
        'Pure – Exponentials and Logarithms',
      ],
      2: [ // Paper 2 — Statistics and Mechanics
        'Statistics – Data Collection, Sampling',
        'Statistics – Data Presentation and Interpretation (AS-Level Subset)',
        'Statistics – Probability, the Binomial Distribution',
        'Statistics – Statistical Hypothesis Testing (AS-Level Subset)',
        'Mechanics – Kinematics (Constant Acceleration)',
        'Mechanics – Forces and Newton\'s Laws (AS-Level Subset)',
      ],
    }},

    // ── Further Mathematics (Edexcel AS 8FM0 — subset of A-level 9FM0) ────────
    'Further Mathematics': { papers: {
      1: [
        'Core Pure – Complex Numbers (AS-Level Subset)',
        'Core Pure – Matrices: 2×2, Transformations',
        'Core Pure – Algebra and Series: Roots of Polynomials, Method of Differences',
        'Core Pure – Vectors: Vector and Cartesian Forms of a Line',
      ],
      2: [
        'Further Mechanics Option (AS-Level Subset): Momentum, Work and Energy',
        'Further Statistics Option (AS-Level Subset): Discrete Random Variables',
        'Decision Mathematics Option (AS-Level Subset): Algorithms, Graphs and Networks',
      ],
    }},

    // ── Statistics (Edexcel AS 8ST0 — subset of A-level 9ST0) ──────────────────
    'Statistics': { papers: {
      1: [
        'The Statistical Enquiry Cycle: Planning, Collecting, Processing, Interpreting Data',
        'Sampling: Techniques, Bias, Populations and Samples',
        'Data Presentation and Interpretation: Location, Spread, Outliers',
        'Correlation and Regression (AS-Level Subset)',
      ],
      2: [
        'Probability: Basic Rules, Venn Diagrams, Tree Diagrams',
        'Statistical Distributions: The Binomial Distribution (AS-Level Subset)',
        'Statistical Hypothesis Testing (AS-Level Subset)',
      ],
    }},

    // ── Biology A (Edexcel AS 8BI0 — subset of A-level 9BI0, Salters-Nuffield) ─
    'Biology': { papers: {
      1: [
        'Topic 1 – Lifestyle, Health and Risk: Cardiovascular Disease, Risk Factors',
        'Topic 2 – Genes and Health: Cystic Fibrosis, Protein Structure, Enzymes',
        'Topic 3 – Voice of the Genome: DNA, Gene Expression, Cell Specialisation',
        'Topic 4 – Biodiversity and Natural Resources (AS-Level Subset)',
        'Required Practicals: Enzyme Investigation, Microscopy, Biodiversity Sampling',
      ],
      2: [
        'Topic 5 – On the Wild Side: Ecosystems and Adaptation (AS-Level Subset)',
        'Practical Skills: Data Analysis and Evaluation of Practical Work',
      ],
    }},

    // ── Chemistry (Edexcel AS 8CH0 — subset of A-level 9CH0) ───────────────────
    'Chemistry': { papers: {
      1: [
        'Topic 1 – Atomic Structure and the Periodic Table',
        'Topic 2 – Bonding and Structure',
        'Topic 3 – Redox I; Inorganic Chemistry and the Periodic Table (AS-Level Subset)',
        'Topic 4 – Introductory Organic Chemistry',
        'Required Practicals: Preparation of a Standard Solution, Distillation, Recrystallisation',
      ],
      2: [
        'Topic 5 – Formulae, Equations and Amounts of Substance',
        'Topic 6 – Energetics (AS-Level Subset)',
        'Topic 7 – Kinetics I; Equilibrium I (AS-Level Subset)',
        'Topic 8 – Organic Chemistry I: Alkanes, Halogenoalkanes, Alkenes',
      ],
    }},

    // ── Physics (Edexcel AS 8PH0 — subset of A-level 9PH0) ─────────────────────
    'Physics': { papers: {
      1: [
        'Topic 1 – Mechanics: Motion, SUVAT, Projectiles',
        'Topic 2 – Materials: Density, Young Modulus, Stress-Strain',
        'Topic 3 – Waves and the Particle Nature of Light (AS-Level Subset)',
        'Required Practicals: Determination of g, Resistivity, Young Modulus',
      ],
      2: [
        'Topic 4 – Electric Circuits: Current, PD, Resistance, EMF',
        'Topic 5 – Further Mechanics; Topic 6 – Further Electricity (AS-Level Subset)',
        'Topic 7 – Nuclear and Particle Physics (AS-Level Subset)',
      ],
    }},

    // ── History (Edexcel AS 8HI0 — subset of A-level 9HI0) ─────────────────────
    'History': { papers: {
      1: [ // Breadth Study with Interpretations (AS-Level Route)
        'Breadth Study with Interpretations (choice of one): Russia 1917–91 — Communism to Collapse (AS Range)',
        'Breadth Study with Interpretations (choice of one): Germany 1918–45: Democracy to Dictatorship (AS Range)',
        'Breadth Study with Interpretations (choice of one): England 1509–1558: Henrician and Edwardian Reformations',
        'Historical Interpretations: Evaluating Historians\' Extracts and Views',
        'Key Themes: Change, Continuity, Cause and Consequence Across the Period',
      ],
      2: [ // Depth Study
        'Depth Study (choice of one): The USA, 1954–75 — Conflict at Home and Abroad (AS-Level Depth)',
        'Depth Study (choice of one): Anglo-Saxon England and the Norman Conquest 1053–66',
        'Depth Study (choice of one): The Reformation in Europe 1500–1531 (AS-Level Depth)',
        'Source Analysis: Evaluating Primary Source Evidence in Historical Context',
        'Coursework/Non-Exam Assessment: Not Required at AS-Level (A-Level Only)',
      ],
    }},

    // ── Economics A (Edexcel AS 8EC0 — subset of A-level 9EC0) ─────────────────
    'Economics': { papers: {
      1: [ // Theme 1 — Introduction to Markets and Market Failure
        'Nature of Economics: Positive and Normative Statements, Ceteris Paribus',
        'How Markets Work: Rational Decision-Making, Demand and Supply Curves',
        'How Markets Work: Price Determination, Price Mechanism, Elasticities of Demand and Supply',
        'Market Failure: Externalities, Public Goods, Information Gaps',
        'Government Intervention: Indirect Taxes, Subsidies, Price Controls, Regulation (AS-Level Subset)',
      ],
      2: [ // Theme 2 — The UK Economy: Performance and Policies
        'Measures of Economic Performance: Economic Growth, Inflation, Employment, Balance of Payments',
        'Aggregate Demand: Components — Consumption, Investment, Government Spending, Net Trade',
        'Aggregate Supply: Short-Run and Long-Run Aggregate Supply (AS-Level Subset)',
        'National Income: Equilibrium Levels of Real National Output, the Multiplier (AS-Level Subset)',
        'Economic Policy: Fiscal Policy, Monetary Policy, Supply-Side Policy (AS-Level Subset)',
      ],
    }},

    // ── Geography (Edexcel AS 8GE0 — subset of A-level 9GE0) ───────────────────
    'Geography': { papers: {
      1: [ // Dynamic Landscapes and Dynamic Places
        'Topic 1 – Tectonic Processes and Hazards: Plate Tectonics, Volcanic and Seismic Hazards',
        'Topic 1 – Hazard Management and Case Studies (AS-Level Subset)',
        'Topic 2 – Landscape Systems, Processes and Change (choice: Coastal or Glaciated Landscapes)',
        'Topic 2 – Landscape Management Strategies (AS-Level Subset)',
        'Topic 3 – Globalisation: Causes, Flows and Impacts of Globalisation',
      ],
      2: [ // People and Environment
        'Topic 4 – Shaping Places (choice: Regenerating Places or Diverse Places)',
        'Topic 4 – Factors Influencing Change in Places (AS-Level Subset)',
        'Topic 5 – Health, Human Rights and Intervention OR Migration, Identity and Sovereignty (AS-Level Option)',
        'Fieldwork Skills: Introductory Data Collection Techniques (AS-Level — No Independent Investigation)',
        'Geographical Skills: Graphical, Cartographic and Statistical Techniques (AS-Level Subset)',
      ],
    }},

    // ── Computer Science (Edexcel AS 8CP0 — subset of A-level 9CP0) ────────────
    'Computer Science': { papers: {
      1: [ // Component 1 — Principles of Computer Science
        'Data Representation: Number Systems, Binary Arithmetic, Text and Image Representation',
        'Computer Systems: Hardware, the CPU, the Fetch-Decode-Execute Cycle (AS-Level Subset)',
        'Software: Systems Software and Application Software (AS-Level Subset)',
        'Exchanging Data: Networks, Protocols and Layers (AS-Level Subset)',
        'Data Types, Structures and Algorithms: Arrays, Records, Searching and Sorting',
        'Legal, Moral and Ethical Issues in Computing (Introductory)',
      ],
      2: [ // Component 2 — Application of Computational Thinking
        'Elements of Computational Thinking: Abstraction, Decomposition, Algorithmic Thinking',
        'Problem Solving with Programming: Programming Techniques (AS-Level Subset)',
        'Computational Methods: Following and Writing Algorithms, Pseudocode and Flowcharts',
        'Non-Exam Task: On-Screen Programming Test (AS-Level — Shorter Than A-Level NEA)',
      ],
    }},

    // ── Business (Edexcel AS 8BS0 — subset of A-level 9BS0) ────────────────────
    'Business': { papers: {
      1: [ // Theme 1 — Marketing and People
        'Meeting Customer Needs: Market Research, Market Positioning, Market Segmentation',
        'The Market: Demand, Supply, Competition and Market Size (AS-Level Subset)',
        'Marketing Mix and Strategy: Product, Price, Promotion, Place (AS-Level Subset)',
        'Managing People: Organisational Design, Recruitment and Selection',
        'Entrepreneurs and Leaders: Motivation Theory, Leadership Styles (AS-Level Subset)',
      ],
      2: [ // Theme 2 — Managing Business Activities
        'Raising Finance: Sources of Finance, Cash Flow Forecasting',
        'Financial Planning: Break-Even Analysis, Budgeting (AS-Level Subset)',
        'Managing Finance: Analysing Profitability and Liquidity Ratios (AS-Level Subset)',
        'Resource Management: Production, Efficiency and Quality',
        'External Influences: Stakeholders and the Economic, Legal and Ethical Environment (AS-Level Subset)',
      ],
    }},

    // ── Psychology (Edexcel AS 8PS0 — subset of A-level 9PS0) ──────────────────
    'Psychology': { papers: {
      1: [ // Social and Cognitive Psychology
        'Social Psychology: Social Influence — Conformity (Asch) and Obedience (Milgram)',
        'Social Psychology: Explanations of Obedience and Independent Behaviour (AS-Level Subset)',
        'Cognitive Psychology: Memory — the Multi-Store Model',
        'Cognitive Psychology: Eyewitness Testimony and Factors Affecting Accuracy (AS-Level Subset)',
        'Research Methods: Experimental Design Applied to Social and Cognitive Studies',
      ],
      2: [ // Biological and Learning Psychology
        'Biological Psychology: One Approach to Explaining Behaviour — Genes and Behaviour (AS-Level Subset)',
        'Biological Psychology: The Nervous System and Neurotransmission (AS-Level Subset)',
        'Learning Theories: Classical and Operant Conditioning (Behaviourism)',
        'Learning Theories: Social Learning Theory — Bandura\'s Bobo Doll Studies',
        'Research Methods: Data Analysis and Presentation Applied Across AS-Level Content',
      ],
    }},

    // ── Arabic (Edexcel AS 8AA0 — subset of A-level 9AA0) ──────────────────────
    'Arabic': { papers: {
      1: [ // Listening, Reading and Translation
        'Aspects of Arabic-Speaking Society: Family, Youth Culture and Social Issues (AS-Level Subset)',
        'Arabic-Speaking Culture: Festivals, Traditions and the Arts (AS-Level Subset)',
        'Listening: Identifying Detail, Opinion and Gist in Authentic Recordings',
        'Reading: Authentic Arabic Texts — Articles and Literary Extracts',
        'Grammar: Verb Forms, Root and Pattern System, Sentence Structure (AS-Level Subset)',
        'Translation: Arabic Into English (Shorter Passages than A-Level)',
      ],
      2: [ // Writing and Speaking
        'Writing: Structured Response in Arabic on a Studied Theme',
        'Translation: English Into Arabic (Shorter Passages than A-Level)',
        'Speaking: General Conversation on Studied Themes (Teaching Preparation)',
      ],
    }},

    // ── Mandarin Chinese (Edexcel AS 8CN0 — subset of A-level 9CN0) ────────────
    'Mandarin Chinese': { papers: {
      1: [ // Listening, Reading and Translation
        'Aspects of Chinese-Speaking Society: Family, Youth Culture and Social Issues (AS-Level Subset)',
        'Chinese Culture: Festivals, Traditions and the Arts (AS-Level Subset)',
        'Listening: Identifying Detail, Opinion and Gist in Authentic Recordings',
        'Reading: Authentic Chinese Texts, Including Simplified Characters',
        'Grammar and Characters: Sentence Structure, Measure Words, Character Recognition (AS-Level Subset)',
        'Translation: Chinese Into English (Shorter Passages than A-Level)',
      ],
      2: [ // Writing and Speaking
        'Writing: Structured Response in Chinese on a Studied Theme',
        'Translation: English Into Chinese (Shorter Passages than A-Level)',
        'Speaking: General Conversation on Studied Themes (Teaching Preparation)',
      ],
    }},

  }, // end Edexcel AS-Level

  // ── OCR AS-LEVEL ────────────────────────────────────────────────────────────
  OCR: {

    // ── Mathematics (OCR AS H230 — subset of A-level H240) ────────────────────
    'Mathematics': { papers: {
      1: [ // Pure Mathematics
        'Pure – Algebra: Indices, Surds, Quadratics, Simultaneous Equations, Inequalities',
        'Pure – Polynomials and the Factor Theorem',
        'Pure – Coordinate Geometry: Lines and Circles',
        'Pure – Graphs: Curve Sketching, Transformations (AS-Level Subset)',
        'Pure – Trigonometry: Sine/Cosine Rules, Identities, Equations (AS-Level Subset)',
        'Pure – Exponentials and Logarithms',
        'Pure – Differentiation and Integration (AS-Level Subset)',
        'Pure – Binomial Expansion, Sequences and Series (AS-Level Subset)',
        'Pure – Vectors (AS-Level Subset)',
      ],
      2: [ // Statistics and Mechanics
        'Statistics – Data Collection and Presentation',
        'Statistics – Probability and the Binomial Distribution',
        'Statistics – Hypothesis Testing (AS-Level Subset)',
        'Mechanics – Kinematics and Newton\'s Laws (AS-Level Subset)',
      ],
    }},

    // ── Further Mathematics (OCR AS H235 — subset of A-level H245) ────────────
    'Further Mathematics': { papers: {
      1: [
        'Pure Core – Complex Numbers: Argand Diagrams, Modulus-Argument Form (AS-Level Subset)',
        'Pure Core – Matrices: 2×2 and 3×3, Determinants, Transformations',
        'Pure Core – Series: Sums of Natural Numbers, Squares and Cubes (AS-Level Subset)',
        'Pure Core – Vectors and Further Algebra: Roots of Polynomials, the Vector Product',
      ],
      2: [
        'Minor Option A (choice, AS-Level Subset): Mechanics — Momentum, Impulse, Work and Energy',
        'Minor Option B (choice, AS-Level Subset): Statistics — Discrete Probability Distributions',
        'Minor Option C (choice, AS-Level Subset): Discrete Mathematics — Graphs, Algorithms, Networks',
      ],
    }},

    // ── Biology (OCR AS H020 — subset of A-level H420, this is the "Biology A" spec) ─
    // FIX: not "Salters-Nuffield" — that is Edexcel's brand. Key kept as plain 'Biology'
    // (matching subjects.js and common usage) even though OCR's formal title is "Biology A".
    'Biology': { papers: {
      1: [
        'Module 1 – Development of Practical Skills in Biology',
        'Module 2 – Foundations in Biology: Cell Structure, Biological Molecules, Enzymes',
        'Module 2 – Foundations in Biology: Cell Division, Cellular Transport, the Immune System',
        'Module 3 – Exchange and Transport: Gas Exchange Surfaces (AS-Level Subset)',
        'Module 3 – Exchange and Transport: Transport in Animals — the Heart, Blood Vessels',
        'Module 3 – Exchange and Transport: Transport in Plants — Xylem and Phloem',
      ],
      2: [
        'Module 4 – Biodiversity, Evolution and Disease: Communicable Diseases and the Immune System',
        'Module 4 – Biodiversity: Classification and Biodiversity, Natural Selection and Evolution (AS Subset)',
        'Required Practicals: Microscopy, Enzyme Investigation, Dissection (AS-Level Subset of Full List)',
        'Practical Skills: Data Recording, Presentation and Statistical Analysis (AS-Level Subset)',
      ],
    }},

    // ── Chemistry (OCR AS H032 — subset of A-level H432, the "Chemistry A" spec) ──
    'Chemistry': { papers: {
      1: [
        'Module 1 – Development of Practical Skills in Chemistry',
        'Module 2 – Foundations in Chemistry: Atoms, Compounds and Moles',
        'Module 2 – Foundations in Chemistry: Acid-Base and Redox Reactions, Electrons',
        'Module 3 – Periodic Table and Energy: Periodicity, Group 2, Group 7 (AS-Level Subset)',
        'Module 3 – Periodic Table and Energy: Enthalpy Changes, Reaction Rates (AS-Level Subset)',
      ],
      2: [
        'Module 4 – Core Organic Chemistry: Basic Concepts, Alkanes, Alkenes',
        'Module 4 – Core Organic Chemistry: Halogenoalkanes, Alcohols, Organic Synthesis (AS Subset)',
        'Module 4 – Analytical Techniques: Mass Spectrometry, Infrared Spectroscopy (AS-Level Subset)',
        'Required Practicals: Titration, Preparation of a Standard Solution (AS-Level Subset)',
      ],
    }},

    // ── Physics (OCR AS H156 — subset of A-level H556, the "Physics A" spec) ──────
    'Physics': { papers: {
      1: [
        'Module 1 – Development of Practical Skills in Physics',
        'Module 2 – Foundations of Physics: Physical Quantities, Units, Scalars and Vectors',
        'Module 2 – Foundations of Physics: Estimation, Error Analysis and Uncertainty (AS-Level Subset)',
        'Module 3 – Forces and Motion: Motion, SUVAT Equations, Projectiles',
        'Module 3 – Forces and Motion: Newton\'s Laws, Momentum, Work, Energy and Power (AS-Level Subset)',
      ],
      2: [
        'Module 4 – Electrons, Waves and Photons: Charge, Current, Resistance, Circuits',
        'Module 4 – Waves: Wave Properties, Superposition and Interference (AS-Level Subset)',
        'Module 4 – Quantum Physics: Photon Model, the Photoelectric Effect (AS-Level Subset)',
        'Required Practicals: Determination of g, Resistivity, Investigating Waves (AS-Level Subset)',
      ],
    }},

    // ── Computer Science (OCR AS H046 — subset of A-level H446) ────────────────
    'Computer Science': { papers: {
      1: [
        'Component 1 – Computing Principles: The CPU, Memory, Storage (AS-Level Subset)',
        'Component 1 – Computing Principles: Operating Systems and Software Classification',
        'Component 1 – Data Representation: Binary, Number Bases, Text and Image Representation',
        'Component 1 – Communication and Networking: Networks, Topologies, Protocols (AS-Level Subset)',
      ],
      2: [
        'Component 2 – Algorithms and Problem Solving: Computational Thinking, Decomposition',
        'Component 2 – Algorithms: Searching and Sorting Algorithms, Pseudocode',
        'Component 2 – Programming: Programming Techniques and Data Structures (AS-Level Subset — No Full NEA)',
        'Component 2 – Legal, Moral and Ethical Issues in Computing (Introductory)',
      ],
    }},

    // ── History (OCR AS H105 — subset of A-level H505) ─────────────────────────
    'History': { papers: {
      1: [ // British Period Study and Enquiry
        'British Period Study (choice of one, AS-Level): The Making of Modern Britain 1951–2007',
        'British Period Study (choice of one, AS-Level): The Making of Georgian Britain 1714–1760',
        'British Period Study: Analysing Change, Continuity, Cause and Consequence',
        'Historical Enquiry: Evaluating Primary Source Evidence Within the Period Study',
      ],
      2: [ // Non-British Period Study
        'Non-British Period Study (choice of one, AS-Level): The Cold War in Europe 1941–95',
        'Non-British Period Study (choice of one, AS-Level): Civil Rights in the USA 1865–1992',
        'Non-British Period Study: Analysing Change, Continuity, Cause and Consequence',
        'Historical Interpretations: Evaluating Historians\' Views on the Non-British Period',
      ],
    }},

    // ── Geography (OCR AS H081 — subset of A-level H481) ───────────────────────
    'Geography': { papers: {
      1: [ // Physical Systems
        'Landscape Systems: Coastal Landscapes — Processes, Landforms and Management (AS-Level Option)',
        'Landscape Systems: Glaciated Landscapes — Processes, Landforms and Management (AS-Level Option)',
        'Earth\'s Life Support Systems: the Water Cycle and Carbon Cycle (AS-Level Subset)',
        'Earth\'s Life Support Systems: Human Impact on the Water and Carbon Cycles',
      ],
      2: [ // Human Interactions
        'Changing Spaces, Making Places: Understanding Place, Meaning and Representation (AS-Level Subset)',
        'Changing Spaces, Making Places: Categorising, Bidding for and Engaging with Places',
        'Global Connections: Trade in the Contemporary World OR Human Rights (AS-Level Option)',
        'Geographical Skills: Fieldwork and Data Presentation Techniques (AS-Level Subset)',
      ],
    }},

    // ── Latin (OCR AS H043 — subset of A-level H443) ───────────────────────────
    'Latin': { papers: {
      1: [
        'Language – Grammar: Noun Declensions, Adjective Agreement, Pronouns (AS-Level Subset)',
        'Language – Grammar: Verb Tenses — Active Voice (Present, Imperfect, Future, Perfect)',
        'Language – Syntax: Simple Subordinate Clauses (AS-Level Subset — Narrower than A-Level)',
        'Unseen Translation: Latin Prose (Shorter Passages than A-Level)',
      ],
      2: [
        'Prescribed Verse Literature: One Set Text Extract (AS-Level)',
        'Prescribed Prose Literature: One Set Text Extract (AS-Level)',
        'Literary Appreciation and Contextual Background of Set Texts',
      ],
    }},

    // ── Classical Greek (OCR AS H044 — subset of A-level H444) ─────────────────
    'Classical Greek': { papers: {
      1: [
        'Language – Grammar: Noun Declensions, Adjective Agreement, Pronouns (AS-Level Subset)',
        'Language – Grammar: Verb Tenses — Active Voice (Present, Imperfect, Future, Aorist)',
        'Language – Syntax: Simple Subordinate Clauses (AS-Level Subset — Narrower than A-Level)',
        'Unseen Translation: Greek Prose (Shorter Passages than A-Level)',
      ],
      2: [
        'Prescribed Verse Literature: One Set Text Extract (AS-Level)',
        'Prescribed Prose Literature: One Set Text Extract (AS-Level)',
        'Literary Appreciation and Contextual Background of Set Texts',
      ],
    }},

  }, // end OCR AS-Level

  // ── EDUQAS/WJEC AS-LEVEL ────────────────────────────────────────────────────
  'Eduqas/WJEC': {

    // ── Mathematics (Eduqas AS B300 — subset of A-level A420) ──────────────────
    'Mathematics': { papers: {
      1: [
        'Pure Mathematics A: Algebraic Expressions, Quadratics, Simultaneous Equations',
        'Pure Mathematics A: Coordinate Geometry — Straight Lines and Circles (AS-Level Subset)',
        'Pure Mathematics A: Trigonometry — Sine and Cosine Rules, Identities (AS-Level Subset)',
        'Pure Mathematics A: Differentiation, Integration, Exponentials and Logarithms',
      ],
      2: [
        'Applied Mathematics A – Statistics: Data Presentation, Probability, Binomial Distribution',
        'Applied Mathematics A – Statistics: Statistical Hypothesis Testing (AS-Level Subset)',
        'Applied Mathematics A – Mechanics: Kinematics (Constant Acceleration)',
        'Applied Mathematics A – Mechanics: Forces and Newton\'s Laws (AS-Level Subset)',
      ],
    }},

    // ── Biology (Eduqas AS B100 — subset of A-level A420-series) ───────────────
    'Biology': { papers: {
      1: [ // Component 1 — Basic Biochemistry and Cell Organisation
        'Biological Molecules: Carbohydrates, Lipids, Proteins and Nucleic Acids',
        'Cell Structure and Organisation: Eukaryotic and Prokaryotic Cell Structure',
        'Enzymes: Mechanism of Enzyme Action, Factors Affecting Enzyme Activity',
        'Cell Membranes: Structure and Transport Across Membranes (AS-Level Subset)',
        'Nucleic Acids: DNA Structure and Replication (AS-Level Subset)',
      ],
      2: [ // Component 2 — Biodiversity and Physiology of Body Systems
        'Classification and Biodiversity: Principles of Classification, Measuring Biodiversity',
        'Adaptations for Gas Exchange: Gas Exchange Surfaces in Different Organisms',
        'Physiology of Body Systems: the Circulatory System, the Heart and Blood Vessels (AS-Level Subset)',
        'Physiology of Body Systems: the Digestive System (AS-Level Subset)',
        'Practical Biology and Data Analysis: Required Practicals and Statistical Skills (AS-Level Subset)',
      ],
    }},

    // ── Chemistry (Eduqas AS) ───────────────────────────────────────────────────
    'Chemistry': { papers: {
      1: [ // Component 1 — The Language of Chemistry, Structure of Matter and Simple Reactions
        'The Language of Chemistry: Formulae, Equations, the Mole and Chemical Calculations',
        'The Language of Chemistry: Amount of Substance, Concentration',
        'Structure of Matter: Atomic Structure, Electron Configuration, the Periodic Table',
        'Structure of Matter: Bonding — Ionic, Covalent and Metallic (AS-Level Subset)',
        'Simple Equilibria and Acid-Base Reactions (AS-Level Subset)',
      ],
      2: [ // Component 2 — Energy, Rate and Chemistry of Carbon Compounds
        'Energy: Enthalpy Changes, Hess\'s Law, Calorimetry (AS-Level Subset)',
        'Rate of Reaction: Factors Affecting Rate, Collision Theory (AS-Level Subset)',
        'Chemistry of Carbon Compounds: Alkanes and Alkenes — Nomenclature and Reactions',
        'Chemistry of Carbon Compounds: Halogenoalkanes and Alcohols (AS-Level Subset)',
        'Practical Chemistry: Required Practicals — Titration, Preparing a Standard Solution',
      ],
    }},

    // ── Physics (Eduqas AS) ─────────────────────────────────────────────────────
    'Physics': { papers: {
      1: [ // Component 1 — Motion, Energy and Matter
        'Basic Physics: Units, Scalars and Vectors, Estimation (AS-Level Subset)',
        'Kinematics: Motion Graphs, the SUVAT Equations, Projectile Motion',
        'Dynamics: Newton\'s Laws of Motion, Momentum (AS-Level Subset)',
        'Energy Concepts: Work, Energy and Power, Conservation of Energy',
        'Properties of Matter: Density, the Behaviour of Springs, the Young Modulus (AS-Level Subset)',
      ],
      2: [ // Component 2 — Electricity and Light
        'Electric Current: Charge, Current, Potential Difference, Resistance and Resistivity',
        'Circuits: Series and Parallel Circuits, EMF and Internal Resistance (AS-Level Subset)',
        'Waves: Wave Properties, the Electromagnetic Spectrum, Superposition',
        'Light: Refraction, Total Internal Reflection, Diffraction (AS-Level Subset)',
        'Practical Physics: Required Practicals — Determination of g, Resistivity',
      ],
    }},

    // ── Geography (Eduqas AS) ───────────────────────────────────────────────────
    'Geography': { papers: {
      1: [ // Component 1 — Changing Physical and Human Landscapes
        'Changing Landscapes: Coastal Landscapes — Processes, Landforms and Management (AS-Level Option)',
        'Changing Landscapes: River Landscapes — Processes, Landforms and Management (AS-Level Option)',
        'Changing Places: Urban Landscapes — Characteristics and Change in Places',
        'Weather and Climate: UK Weather Systems and Extreme Weather (AS-Level Subset)',
      ],
      2: [ // Component 2 — Global Systems and Global Governance
        'Global Systems: Globalisation — Economic, Social and Cultural Change',
        'Global Governance: Managing Environmental and Development Issues at a Global Scale',
        'Development and Resource Issues: Development Measures and Disparities (AS-Level Subset)',
        'Geographical Skills: Fieldwork Techniques and Data Presentation (AS-Level Subset)',
      ],
    }},

    // ── English Literature (Eduqas AS) ──────────────────────────────────────────
    'English Literature': { papers: {
      1: [ // Component 1 — Poetry and Prose
        'Unseen Poetry: Analysis of an Unseen Poem (AS-Level Subset)',
        'Poetry: Study of a Poetry Anthology or Poetry Collection (AS-Level — Fewer Poems than A-Level)',
        'Prose: Study of One Prose Set Text — Themes, Character and Narrative Technique',
        'Contextual Factors: Social, Historical and Literary Context of Set Texts (AS-Level Subset)',
      ],
      2: [ // Component 2 — Drama
        'Shakespeare: Study of One Set Play — Language, Character and Dramatic Method',
        'Post-1900 Drama: Study of One Additional Set Play (AS-Level Subset)',
        'Critical Approaches: Applying Different Interpretations to Set Drama Texts (AS-Level Subset)',
      ],
    }},

    // ── History (Eduqas AS) ──────────────────────────────────────────────────────
    'History': { papers: {
      1: [ // Unit 1 — Depth Study
        'Unit 1 – Depth Study (choice of one, AS-Level): Wales and the Third Reform Act 1868–86',
        'Unit 1 – Depth Study (choice of one, AS-Level): The Age of the Crusades 1071–1204',
        'Unit 1 – Source Analysis: Evaluating Primary Evidence Within the Depth Period',
      ],
      2: [ // Unit 2 — Breadth Study
        'Unit 2 – Breadth Study (choice of one, AS-Level): The Cold War in Europe 1945–91',
        'Unit 2 – Breadth Study (choice of one, AS-Level): Germany — Change and Continuity 1919–91',
        'Unit 2 – Historical Interpretations: Evaluating Historians\' Views Across the Breadth Period',
      ],
    }},

  }, // end Eduqas/WJEC AS-Level

  // ── CCEA AS-LEVEL (Northern Ireland) ────────────────────────────────────────
  // AS was never decoupled in NI — this IS Units 1 & 2 of the linear 4-unit A-level
  CCEA: {

    // ── Mathematics (CCEA AS — Units AS1 and AS2) ───────────────────────────────
    'Mathematics': { papers: {
      1: [
        'AS1 – Pure Mathematics: Algebra, Functions, Coordinate Geometry (Straight Lines and Circles)',
        'AS1 – Pure Mathematics: Trigonometry, Sequences and Series (AS-Level Subset)',
        'AS1 – Pure Mathematics: Differentiation and Integration (AS-Level Subset)',
      ],
      2: [
        'AS2 – Applied Mathematics: Mechanics — Kinematics, Forces, Newton\'s Laws',
        'AS2 – Applied Mathematics: Statistics — Data Representation, Probability, the Binomial Distribution',
      ],
    }},

    // ── Biology (CCEA AS — Units AS1, AS2, AS3 Practical) ───────────────────────
    'Biology': { papers: {
      1: [
        'AS1 – Molecules and Cells: Biological Molecules — Carbohydrates, Lipids, Proteins',
        'AS1 – Molecules and Cells: Enzymes, Cell Structure and Cell Division (AS-Level Subset)',
      ],
      2: [
        'AS2 – Organisms and Biodiversity: Enzymes and Homeostasis (AS-Level Subset)',
        'AS2 – Organisms and Biodiversity: Ecology, Biodiversity and Classification',
        'AS3 – Practical Skills: Assessment of Practical Techniques (Internally/Externally Assessed)',
      ],
    }},

    // ── Chemistry (CCEA AS — Units AS1, AS2, AS3 Practical) ─────────────────────
    'Chemistry': { papers: {
      1: [
        'AS1 – Basic Concepts: Atomic Structure, Formulae and Equations, the Mole',
        'AS1 – Physical and Inorganic Chemistry: Bonding, Periodicity, the Periodic Table',
      ],
      2: [
        'AS2 – Further Physical and Inorganic Chemistry: Rates, Equilibrium, Energetics (AS-Level Subset)',
        'AS2 – Introductory Organic Chemistry: Alkanes, Alkenes and Halogenoalkanes',
        'AS3 – Practical Skills: Assessment of Practical Techniques',
      ],
    }},

    // ── Physics (CCEA AS — Units AS1, AS2, AS3 Practical) ───────────────────────
    'Physics': { papers: {
      1: [
        'AS1 – Forces, Energy and Electricity: Kinematics, Forces and Newton\'s Laws',
        'AS1 – Forces, Energy and Electricity: Work, Energy, Power and Electric Circuits',
      ],
      2: [
        'AS2 – Waves, Photons and Medical Physics: Wave Properties and Superposition',
        'AS2 – Waves, Photons and Medical Physics: Quantum Physics and Medical Imaging (AS-Level Subset)',
        'AS3 – Practical Skills: Assessment of Practical Techniques',
      ],
    }},

    // ── History (CCEA AS — Units AS1, AS2) ──────────────────────────────────────
    'History': { papers: {
      1: [
        'AS1 – Change Over Time (choice of one option): International Relations 1945–2003',
        'AS1 – Change Over Time (choice of one option): Society, Change and Continuity in NI 1965–98',
      ],
      2: [
        'AS2 – Depth Study (choice of one option): The Reign of Charles I 1625–49',
        'AS2 – Depth Study (choice of one option): Partition of Ireland 1900–25',
      ],
    }},

    // ── Geography (CCEA AS — Units AS1, AS2) ────────────────────────────────────
    'Geography': { papers: {
      1: [
        'AS1 – Physical Geography: River Environments and Fluvial Processes',
        'AS1 – Physical Geography: Atmospheric Processes and Weather Systems',
        'AS1 – Physical Geography: Ecosystems and Sustainability',
      ],
      2: [
        'AS2 – Human Geography: Population Change and Migration',
        'AS2 – Human Geography: Settlement and Urbanisation',
        'AS2 – Human Geography: Development Issues and Global Inequality',
      ],
    }},

  }, // end CCEA AS-Level

} // end ASLEVEL

// ─────────────────────────────────────────────────────────────────────────────
// A-LEVEL
// GCSE.<board>.<subject> and ALEVEL.<board>.<subject> are, and always were, fully
// separate objects — no shared keys or references between the two levels.
// ─────────────────────────────────────────────────────────────────────────────

const ALEVEL = {

  // ── AQA A-LEVEL ─────────────────────────────────────────────────────────────
  AQA: {

    // ── Mathematics (AQA A-level 7357 — Corbettmaths topic list) ──────────────
    'Mathematics': { papers: {
      1: [ // Pure Mathematics 1
        'Proof: Proof by Deduction, Proof by Exhaustion, Disproof by Counter-Example',
        'Proof: Proof by Contradiction (including Irrationality of √2, Infinitude of Primes)',
        'Algebra – Indices and Surds: Laws of Indices, Simplifying and Rationalising Surds',
        'Algebra – Quadratics: Factorising, Completing the Square, the Discriminant',
        'Algebra – Simultaneous Equations and Inequalities (Linear and Quadratic)',
        'Algebra – Polynomials: Expanding, Algebraic Division, the Factor Theorem',
        'Algebra – Partial Fractions (including Repeated and Improper Cases)',
        'Algebra – Functions: Domain, Range, Composite and Inverse Functions',
        'Algebra – Functions: The Modulus Function, |f(x)|',
        'Graphs: Curve Sketching (Cubics, Quartics, Reciprocal Graphs)',
        'Graphs: Transformations (Translation, Stretch, Reflection, Combinations)',
        'Coordinate Geometry: Straight Lines — Gradient, Equation, Parallel/Perpendicular',
        'Coordinate Geometry: Circles — Equation, Tangent, Chord, Angle in Semicircle',
        'Sequences and Series: Binomial Expansion (Positive Integer and General Powers)',
        'Sequences and Series: Arithmetic and Geometric Series, Sigma Notation',
        'Sequences and Series: Recurrence Relations',
        'Trigonometry: Sine and Cosine Rules, Radians, Arc Length and Sector Area',
        'Trigonometry: Small Angle Approximations',
        'Trigonometry: Graphs and Trigonometric Identities (sin²+cos²=1, Double Angle Formulae)',
        'Trigonometry: Addition Formulae, R sin(θ ± α) Form',
        'Trigonometry: Solving Trigonometric Equations',
        'Exponentials and Logarithms: Laws of Logs, Solving Equations, Natural Log',
        'Exponentials and Logarithms: Exponential Growth and Decay, the Constant e',
        'Differentiation: First Principles, Chain Rule, Product Rule, Quotient Rule',
        'Differentiation: Trigonometric, Exponential and Logarithmic Functions',
        'Differentiation: Parametric and Implicit Differentiation',
        'Differentiation: Rates of Change, Connected Rates of Change',
        'Integration: Standard Integrals, Integration by Substitution',
        'Integration: Integration by Parts, Integration Using Partial Fractions',
        'Integration: Area Under a Curve, Trapezium Rule',
        'Integration: Differential Equations — Formation and Solution by Separation of Variables',
        'Numerical Methods: Locating Roots, Iteration (Newton-Raphson, Fixed-Point)',
        'Vectors: 3D Vectors, Magnitude, Position Vectors, Vector Geometry',
      ],
      2: [ // Pure Mathematics 2 (same content pool as Paper 1, reinforced)
        'Further Trigonometry: sec, cosec, cot; Inverse Trigonometric Functions',
        'Further Trigonometry: Proving Identities, Compound Angle Applications',
        'Further Algebra: Modelling with Functions',
        'Further Calculus: Connected Rates of Change in Context',
        'Further Calculus: Volumes of Revolution (Higher-Level Extension)',
        'Problem Solving: Modelling Real-World Contexts with Pure Mathematics',
        'Proof Applied Across All Pure Topics (Synoptic)',
      ],
      3: [ // Statistics and Mechanics
        'Statistics – Statistical Sampling: Populations, Sampling Techniques',
        'Statistics – Data Presentation and Interpretation: Measures of Location and Spread',
        'Statistics – Data Presentation: Outliers, Box Plots, Histograms, Cumulative Frequency',
        'Statistics – Correlation and Regression: PMCC, Regression Lines',
        'Statistics – Probability: Venn Diagrams, Tree Diagrams, Mutually Exclusive/Independent Events',
        'Statistics – Statistical Distributions: The Binomial Distribution',
        'Statistics – Statistical Distributions: The Normal Distribution and Standardising',
        'Statistics – Statistical Hypothesis Testing: Binomial and Normal Context',
        'Statistics – Statistical Hypothesis Testing: Correlation Coefficient Testing',
        'Mechanics – Quantities and Units; Modelling Assumptions',
        'Mechanics – Kinematics: SUVAT, Motion Graphs, Variable Acceleration (Calculus Methods)',
        'Mechanics – Forces and Newton\'s Laws: F = ma, Connected Particles, Pulleys',
        'Mechanics – Forces: Friction, Motion on an Inclined Plane',
        'Mechanics – Moments: Rigid Bodies in Equilibrium',
        'Mechanics – Projectiles: Horizontal and Vertical Motion Combined',
      ],
    }},

    // ── Further Mathematics (AQA A-level 7367 — Corbettmaths topic list) ──────
    'Further Mathematics': { papers: {
      1: [ // Core Pure 1
        'Complex Numbers: i, Argand Diagrams, Modulus-Argument Form',
        'Complex Numbers: De Moivre\'s Theorem, nth Roots of a Complex Number',
        'Complex Numbers: Loci in the Argand Diagram',
        'Matrices: 2×2 and 3×3 Matrices, Determinants, Inverses',
        'Matrices: Transformations Represented by Matrices (Rotation, Reflection, Enlargement)',
        'Matrices: Solving Systems of Linear Equations',
        'Algebra: Roots of Polynomials (Sum and Product of Roots, Transformations of Roots)',
        'Series: Sums of Natural Numbers, Squares and Cubes (Σr, Σr², Σr³)',
        'Proof by Induction: Series, Divisibility, Matrix Powers',
        'Vectors: Vector and Cartesian Equation of a Line and Plane',
      ],
      2: [ // Core Pure 2
        'Further Vectors: Intersection of Lines/Planes, Distance Between Lines',
        'Further Vectors: Scalar Triple Product',
        'Further Algebra and Functions: Rational Functions, Inequalities',
        'Further Calculus: Improper Integrals, Mean Value of a Function, Arc Length',
        'Further Calculus: Maclaurin Series',
        'Polar Coordinates: Plotting, Area Enclosed by a Polar Curve',
        'Hyperbolic Functions: sinh, cosh, tanh and Their Inverses',
        'Differential Equations: First-Order and Second-Order ODEs',
        'Further Number Theory: Modular Arithmetic, Fermat\'s Little Theorem',
        'Further Coordinate Systems: Parabola, Ellipse, Hyperbola (Cartesian and Parametric)',
        'Groups: Definition, Cayley Tables, Cyclic Groups, Isomorphisms',
        'Further Complex Numbers: nth Roots, Geometric Interpretation',
      ],
      3: [ // Optional (most common combination: Mechanics + Statistics)
        'Further Statistics – Discrete Distributions: Discrete Uniform, Geometric, Negative Binomial',
        'Further Statistics – Continuous Distributions: Uniform, Exponential, Normal Recap',
        'Further Statistics – Hypothesis Testing: Chi-Squared Test for Contingency Tables',
        'Further Statistics – Poisson Distribution: Properties, Approximation to Binomial',
        'Further Statistics – Correlation and the PMCC (Extended)',
        'Further Mechanics – Momentum and Impulse: Coefficient of Restitution, Collisions',
        'Further Mechanics – Work, Energy, Power: Elastic Potential Energy, Hooke\'s Law',
        'Further Mechanics – Circular Motion: Angular Velocity, Centripetal Force/Acceleration',
        'Further Mechanics – Simple Harmonic Motion: SHM Equations, Springs, Pendulums',
        'Decision – Algorithms: Bubble Sort, Quick Sort, Bin Packing, Binary Search',
        'Decision – Graph Theory: Spanning Trees (Kruskal\'s, Prim\'s), Route Inspection',
        'Decision – Shortest Path: Dijkstra\'s Algorithm, Floyd\'s Algorithm',
        'Decision – Flows in Networks: Maximum Flow, Minimum Cut',
        'Decision – Linear Programming: Graphical Method and the Simplex Algorithm',
        'Decision – Critical Path Analysis and Game Theory: Pay-Off Matrices',
      ],
    }},

    // ── Biology (AQA A-level 7402 — Cognito topic list) ───────────────────────
    'Biology': { papers: {
      1: [
        '1.1 – Biological Molecules: Monomers and Polymers',
        '1.1 – Biological Molecules: Carbohydrates (Monosaccharides, Disaccharides, Polysaccharides)',
        '1.1 – Biological Molecules: Lipids (Triglycerides, Phospholipids)',
        '1.1 – Biological Molecules: Proteins (Amino Acids, Peptide Bonds, Primary–Quaternary Structure)',
        '1.1 – Biological Molecules: Enzymes (Mechanism, Factors, Inhibition)',
        '1.1 – Biological Molecules: Nucleic Acids (DNA, RNA, ATP)',
        '1.1 – Biological Molecules: Water and Inorganic Ions',
        '2.1 – Cell Structure: Prokaryotic and Eukaryotic Cells (Ultrastructure)',
        '2.1 – Cell Structure: Cell Fractionation and Ultracentrifugation',
        '2.2 – Cell Division: Mitosis, Meiosis and the Cell Cycle',
        '2.3 – Cell Transport: Fluid Mosaic Model, Diffusion, Osmosis, Active Transport',
        '2.4 – Cell Recognition: Immune Response, Antigens, Antibodies, Vaccinations',
        '2.4 – Cell Recognition: HIV and Antiviral Drugs',
        '3.1 – Exchange Surfaces: Fick\'s Law, SA:V Ratio, Adaptations',
        '3.2 – Gas Exchange: Lungs, Fish Gills, Leaves (Stomata)',
        '3.2 – Gas Exchange: Spirometer Investigations, Lung Disease',
        '3.3 – Digestion: Alimentary Canal, Enzymes, Absorption',
        '3.4 – Mass Transport: Haemoglobin and Oxygen Dissociation Curves (Bohr Effect)',
        '3.4 – Mass Transport: Blood, Tissue Fluid, Lymph',
        '3.4 – Mass Transport: Heart Structure, Cardiac Cycle, Pressure Changes, ECG',
        '3.4 – Mass Transport: Xylem and Phloem, Transpiration and Translocation',
        'Required Practicals 1–4: Microscopy, Dissection, Osmosis, Enzyme Rate of Reaction',
      ],
      2: [
        '4.1 – DNA and Protein Synthesis: Transcription, Translation, Genetic Code',
        '4.2 – Genetic Diversity: Mutations, Meiosis and Genetic Variation',
        '4.2 – Genetic Diversity: Species and Taxonomy, the Five/Three Kingdom System',
        '4.3 – Genetic Information and Variation: Monohybrid and Dihybrid Crosses',
        '4.3 – Genetic Information and Variation: Epistasis, Linkage, Chi-Squared Test',
        '4.3 – Adaptation, Speciation, Selection: Natural and Artificial Selection',
        '4.3 – Biodiversity: Species Richness, Simpson\'s Index, Conservation Strategies',
        '5.1 – Photosynthesis: Light-Dependent Reactions (Photophosphorylation)',
        '5.1 – Photosynthesis: Light-Independent Reactions (Calvin Cycle), Limiting Factors',
        '5.2 – Respiration: Glycolysis, Link Reaction, Krebs Cycle, Oxidative Phosphorylation',
        '5.2 – Respiration: Anaerobic Respiration, Respiratory Quotient',
        '6.1 – Stimuli and Responses: Taxes and Kineses, Peripheral and Central Nervous Systems',
        '6.2 – Nervous Coordination: Nerve Impulse (Resting and Action Potential)',
        '6.2 – Nervous Coordination: Synapses and Neurotransmitters, Summation',
        '6.3 – Skeletal Muscles: Sliding Filament Model, Slow and Fast Twitch Fibres',
        '6.4 – Homeostasis: Negative Feedback, Temperature Regulation',
        '6.5 – The Kidneys: Ultrafiltration, Selective Reabsorption, ADH and Osmoregulation',
        '6.6 – Hormonal Regulation: Endocrine Glands, Adrenaline, Insulin and Glucagon',
        '6.6 – Hormonal Regulation: Control of Blood Glucose, Diabetes Types 1 and 2',
        '6.7 – Plant Responses: Auxin, Gibberellins, Abscisic Acid, Photoperiodism',
        'Required Practicals 5–8: Chromatography, Respiration Rate, Core Temperature, Plant Responses',
      ],
      3: [ // Paper 3 — any topic + practical skills + essay
        '7.1 – Inheritance: Autosomal and Sex-Linked Inheritance, Epistasis',
        '7.2 – Populations and Evolution: Hardy-Weinberg Principle',
        '7.3 – Populations in Ecosystems: Succession, Sampling, Interaction Between Species',
        '8.1 – Gene Expression: Totipotency, Stem Cells, Epigenetics',
        '8.2 – Regulation of Gene Expression: Lac Operon, siRNA, Cancer as a Failure of Regulation',
        '8.3 – Using Genome Projects: Genetic Fingerprinting, Sequencing (Sanger, NGS)',
        '8.4 – Gene Technologies: Recombinant DNA, PCR, Gel Electrophoresis, GM Organisms',
        '8.4 – Gene Technologies: Gene Therapy, CRISPR-Cas9 (Extension)',
        'Required Practicals 9–12: Microscopy of Mitosis, Dissection, Colorimetry, Genetic Cross Simulation',
        'Essay: One Continuous Extended Writing Essay (25 marks)',
      ],
    }},

    // ── Chemistry (AQA A-level 7405 — Cognito topic list) ──────────────────────
    'Chemistry': { papers: {
      1: [
        '1.1 – Atomic Structure: Sub-atomic Particles, Mass Spectrometry, Electron Configuration',
        '1.2 – Amount of Substance: Moles, Empirical/Molecular Formula, Gas Volumes, Titration Calcs',
        '1.3 – Bonding: Ionic, Covalent, Metallic, Shapes of Molecules, Intermolecular Forces',
        '1.4 – Energetics: Enthalpy Changes, Hess\'s Law, Born-Haber Cycles, Calorimetry',
        '1.5 – Kinetics: Rate of Reaction, Maxwell-Boltzmann Distribution, Arrhenius Equation',
        '1.6 – Equilibria: Le Chatelier\'s Principle, Kc and Kp',
        '1.7 – Oxidation, Reduction and Redox Equations, Oxidation States',
        '3.1 – Further Thermodynamics: Lattice Enthalpy, Entropy, Gibbs Free Energy',
        '3.2 – Further Kinetics: Rate Equations, Orders of Reaction, Rate-Determining Step',
        '3.3 – Further Equilibria: Kw, pH, Buffer Solutions, Titration Curves',
        '3.4 – Electrode Potentials and Cells: EMF, Standard Electrode Potential, Fuel Cells',
        '2.1 – Periodicity: Trends Across Period 3 (Oxides, Chlorides)',
        '2.2 – Group 2: Alkaline Earth Metals (Reactions, Solubility Trends, Uses)',
        '2.3 – Group 7 (17): Halogens (Reactivity, Disproportionation, Testing for Halide Ions)',
        '3.2 – Period 3 Chemistry: Na, Mg, Al and Their Compounds',
        '3.3 – Transition Metals: Electron Configuration, Complex Ions, Colour, Catalysis',
        '3.3 – Transition Metals: Ligand Substitution, Stability Constants, Redox Reactions',
        '2.4 – Nomenclature: IUPAC Naming, Structural and Stereoisomerism',
        '2.5 – Alkanes: Free Radical Substitution, Combustion, Fractional Distillation',
        '2.6 – Halogenoalkanes: Nucleophilic Substitution (SN1 and SN2), Hydrolysis',
        '2.7 – Alkenes: Electrophilic Addition, Addition Polymerisation',
        '2.8 – Alcohols: Oxidation, Esterification, Dehydration',
        '2.9 – Organic Analysis: Mass Spectrometry, IR Spectroscopy',
        'Required Practicals 1–4: Standard Solution, Enthalpy, Rate of Reaction, Redox Titration',
      ],
      2: [
        '3.5 – Optical Isomerism (Extension of 2.4)',
        '3.5 – Aldehydes and Ketones: Nucleophilic Addition, Tollens\'/Fehling\'s Test',
        '3.6 – Carboxylic Acids and Derivatives: Esters, Acyl Chlorides, Acid Anhydrides',
        '3.7 – Aromatic Chemistry: Benzene Structure, Electrophilic Substitution',
        '3.8 – Amines: Basicity, Nucleophilic Substitution, Diazonium Salts, Azo Dyes',
        '3.9 – Polymers: Condensation Polymers, Biodegradability, Polymer Degradation',
        '3.10 – Amino Acids, Proteins and DNA: Structure and Reactions',
        '3.11 – Organic Synthesis: Multi-Step Pathways, Practical Techniques',
        '3.12 – NMR Spectroscopy: ¹H and ¹³C NMR, Chemical Shift, Integration, Splitting Patterns',
        '3.12 – Chromatography: TLC, Gas Chromatography, HPLC',
        'Practical Skills: All 12 AQA Required Practicals — Techniques and Data Analysis',
      ],
      3: [ // Paper 3 — mixed
        'Physical Chemistry: Synoptic Questions Drawing on Papers 1 and 2',
        'Inorganic Chemistry: Synoptic Questions Drawing on Papers 1 and 2',
        'Organic Chemistry: Synoptic Questions Drawing on Papers 1 and 2',
        'Required Practical Questions: Evaluating Experimental Methods and Errors',
        'Data Analysis: Interpreting Graphs, Spectra (IR, NMR, Mass Spec) and Experimental Results',
        'Multiple Choice Section: Testing Breadth of Specification',
      ],
    }},

    // ── Physics (AQA A-level 7408 — Cognito topic list) ────────────────────────
    'Physics': { papers: {
      1: [
        '1 – Measurements: SI Units, Prefixes, Significant Figures, Estimation',
        '1 – Measurements: Uncertainty (Absolute, Percentage, Combining Uncertainties)',
        '2 – Particles: Atomic Structure, Stable and Unstable Nuclei, Nuclear Radius',
        '2 – Particles: Fundamental Particles (Hadrons, Leptons, Quarks)',
        '2 – Particles: Particle Interactions (the Four Fundamental Forces, Exchange Particles)',
        '2 – Particles: Conservation Laws (Charge, Baryon Number, Lepton Number, Strangeness)',
        '2 – Electromagnetic Radiation: Wave-Particle Duality, the Photoelectric Effect',
        '2 – Electromagnetic Radiation: Electron Energy Levels, Line Spectra, Excitation',
        '3 – Waves: Progressive Waves (Transverse and Longitudinal), Phase Difference',
        '3 – Waves: Superposition, Interference, Standing Waves, Diffraction',
        '3 – Waves: Refraction, Snell\'s Law, Total Internal Reflection, Optical Fibres',
        '3 – Waves: Diffraction Grating, Young\'s Double-Slit Experiment',
        '4 – Mechanics: Moments, Stability, Vectors and Scalars, Resolving Forces',
        '4 – Mechanics: Work, Energy and Power, Conservation of Energy',
        '5 – Newton\'s Laws: F = ma, Impulse and Momentum, Conservation of Momentum',
        '5 – Newton\'s Laws: Projectile Motion, Terminal Velocity',
        '6 – Materials: Density, Hooke\'s Law, Stress, Strain, the Young Modulus',
        '6 – Materials: Elastic Strain Energy, Stress-Strain Graphs',
        '7 – Electricity: Charge, Current, Potential Difference and Resistance',
        '7 – Electricity: Ohm\'s Law, I-V Characteristics, Resistivity',
        '7 – Electricity: Series and Parallel Circuits, EMF and Internal Resistance',
        '7 – Electricity: The Potential Divider',
        'Required Practicals 1–5: Determination of g, Resistivity, EMF/Internal Resistance, Density, Springs',
      ],
      2: [
        '8 – Further Mechanics: Circular Motion (Angular Velocity, Centripetal Force)',
        '8 – Further Mechanics: Simple Harmonic Motion (SHM Equations, Graphs)',
        '8 – Further Mechanics: SHM — Energy and Damping, Resonance',
        '8 – Thermal Physics: Internal Energy, Temperature Scales (Absolute Zero)',
        '8 – Thermal Physics: Specific Heat Capacity and Specific Latent Heat',
        '8 – Thermal Physics: Ideal Gas Laws, the Boltzmann Constant, Kinetic Theory',
        '9 – Gravitational Fields: Newton\'s Law, g, Gravitational Potential, Satellite Orbits',
        '9 – Electric Fields: Coulomb\'s Law, Field Strength, Electric Potential',
        '9 – Capacitance: Charge, Energy Storage, Charging and Discharging (Exponential Decay)',
        '10 – Magnetic Fields: Flux Density, Force on a Conductor (F = BIl)',
        '10 – Magnetic Fields: Force on a Moving Charge (F = BQv), Circular Motion in a Field',
        '10 – Electromagnetic Induction: Faraday\'s and Lenz\'s Law, Flux Linkage',
        '10 – Electromagnetic Induction: Transformers, AC Generators, Rectification',
        '11 – Nuclear Physics: Radioactive Decay, Half-Life, Activity, Decay Constant',
        '11 – Nuclear Physics: Nuclear Radius (Closest Approach, Electron Diffraction)',
        '11 – Nuclear Physics: Binding Energy, Mass Defect, Fission and Fusion',
        'Required Practicals 6–8: Investigating SHM, Investigating Capacitor Discharge, Investigating EM Induction',
      ],
      3: [ // Paper 3 — Section A: Practical + Section B: Optional Topic
        'Section A – Practical Skills: Analysing and Evaluating Experiments (All 12 Required Practicals)',
        'Section A – Practical Skills: Graphs, Uncertainties, Error Analysis, Significant Figures',
        'Option A – Astrophysics: Telescopes (Refracting, Reflecting), Resolving Power',
        'Option A – Astrophysics: Stars — Classification, Hertzsprung-Russell Diagram, Stellar Evolution',
        'Option A – Astrophysics: Cosmology — Doppler Shift, Hubble\'s Law, Dark Matter, the Big Bang',
        'Option B – Medical Physics: X-Rays, Ultrasound, MRI, Nuclear Medicine (PET Scanning)',
        'Option C – Engineering Physics: Rotational Dynamics, Thermodynamics, Angular Momentum',
        'Option D – Turning Points in Physics: Discovery of the Electron, Special Relativity',
        'Option D – Turning Points in Physics: Wave-Particle Duality, the Photoelectric Effect (Extension)',
        'Option E – Electronics: Operational Amplifiers, Sensors, Analogue-to-Digital Conversion',
      ],
    }},

    // ── Computer Science (AQA A-level 7517) ────────────────────────────────────
    'Computer Science': { papers: {
      1: [
        '1.1 – The Characteristics of Contemporary Processors: CPU Components, FDE Cycle',
        '1.1 – Processor Types: RISC vs CISC, Multi-Core, GPUs, Co-Processors',
        '1.1 – Structure of the Internet: IP Addressing, Routing, Protocols (TCP/IP Stack)',
        '1.1 – Internet Security: Firewalls, Encryption, TLS/SSL, Public/Private Key, Digital Signatures',
        '1.2 – Software and Software Development: System Software, OS Functions',
        '1.2 – Software: Programming Paradigms (Procedural, OOP, Functional, Declarative, Assembly)',
        '1.3 – Exchanging Data: Databases (Relational Model, SQL, Normalisation to 3NF)',
        '1.3 – Exchanging Data: Networks, Web Technologies (HTML/CSS/JS, HTTP), JSON, XML',
        '1.4 – Data Types and Structures: Primitive Data Types, Floating-Point Representation',
        '1.4 – Data Structures: Arrays, Stacks, Queues, Linked Lists, Trees, Graphs, Hash Tables',
        '1.4 – Boolean Algebra: De Morgan\'s Laws, Karnaugh Maps, Logic Gates, Simplification',
        '1.5 – Legal, Moral, Cultural and Ethical Issues: Legislation, AI Ethics, Digital Divide',
      ],
      2: [
        '2.1 – Elements of Computational Thinking: Abstraction, Decomposition, Thinking Ahead',
        '2.1 – Problem Solving: Backtracking, Divide and Conquer, Dynamic Programming, Memoisation',
        '2.2 – Problem Solving and Programming: OOP in Depth (Inheritance, Polymorphism, Encapsulation)',
        '2.2 – Programming: Recursion, Higher-Order Functions, Exception Handling',
        '2.3 – Algorithms: Sorting (Bubble, Insertion, Merge, Quick, Heap)',
        '2.3 – Algorithms: Searching (Linear, Binary Search, Hashing)',
        '2.3 – Algorithms: Graph Algorithms (BFS, DFS, Dijkstra\'s, A*, Floyd-Warshall)',
        '2.3 – Algorithms: Complexity (Big O Notation: O(1), O(log n), O(n), O(n log n), O(n²))',
        '2.3 – Computability: Turing Machines, the Halting Problem, Limits of Computation',
        '2.3 – Regular Languages: Finite State Machines, Regular Expressions, Context-Free Grammars, BNF',
        'NEA – Programming Project: Analysis, Design, Development, Testing, Evaluation (20% of A-Level)',
      ],
    }},

    // ── English Language (AQA A-level 7702) ────────────────────────────────────
    'English Language': { papers: {
      1: [
        'Language and the Individual: Language Acquisition (Children 0–5 years)',
        'Language Acquisition: Stages (Cooing, Babbling, One-Word, Two-Word, Telegraphic)',
        'Language Acquisition: Theories (Chomsky\'s LAD, Skinner\'s Behaviourism, Bruner\'s LASS)',
        'Language Acquisition: Reading and Writing Development in Children',
        'Language Variation: Dialects, Idiolects and Sociolects',
        'Language Variation: Gender (Lakoff, Tannen, Coates, Cameron)',
        'Language Variation: Social Class and Register',
        'Language Change: Historical Change (Old to Modern English)',
        'Language Change: Mechanisms (Broadening, Narrowing, Pejoration, Amelioration)',
        'Language Change: Technology and 21st-Century Language (Text Speak, Social Media)',
        'Language Change: Attitudes to Language Change (Prescriptivism vs Descriptivism)',
      ],
      2: [
        'Language and Power: Institutional Discourse (Courtrooms, Classrooms, Interviews)',
        'Language and Power: Influential Language (Advertising, Political Speeches)',
        'Language and Gender: Further Analysis of Real Texts',
        'Language Methods: Phonological, Lexical, Grammatical, Discourse Analysis',
        'Language Methods: Pragmatics (Grice\'s Maxims, Politeness Theory)',
        'Non-Exam Assessment: Language Investigation (Independent Research)',
        'Non-Exam Assessment: Original Writing with Commentary',
        'Investigating Language: Methodology, Data Collection and Analysis',
      ],
    }},

    // ── English Literature A (AQA A-level 7712) ─────────────────────────────────
    'English Literature': { papers: {
      1: [
        'Love Through the Ages — Poetry Pre-1900: Set Texts from the Anthology',
        'Love Through the Ages — Poetry Post-1900: Set Texts from the Anthology',
        'Love Through the Ages — Prose Set Text (e.g. Wuthering Heights, The Great Gatsby)',
        'Love Through the Ages — Drama Set Text (e.g. The Taming of the Shrew)',
        'Analytical Essay Writing: Argument, Evidence, Contextualisation',
        'Comparative Analysis: Comparing Two Texts from Different Genres or Periods',
        'Unseen Poetry: Analysis of Poetry Linked to the Love Theme',
      ],
      2: [
        'Texts in Shared Contexts — Coursework (NEA): Comparative Essay',
        'Set Texts from Chosen Context (e.g. Political and Social Protest, WW1 Literature)',
        'AO5 – Informed Personal Response: Independent Critical Reading',
        'AO3 – Connections Across Literary Texts',
        'AO4 – Contexts: Social, Historical, Cultural, Literary Contexts',
        'Unseen Prose and Poetry Analysis',
      ],
    }},

    // ── History (AQA A-level 7042) ──────────────────────────────────────────────
    'History': { papers: {
      1: [
        'Breadth Study: Europe and the World (chosen from list of periods)',
        'Period Study: Stuart Britain and the Crisis of Monarchy 1603–1702',
        'Period Study: Industrialisation and the People: Britain c.1783–1885',
        'Period Study: The Making of Modern Britain 1951–2007',
        'Period Study: The American Dream — Reality and Illusion 1945–1980',
        'Period Study: The Witch Craze in Britain, Europe and America c.1580–c.1750',
        'Essay Skills: Planning, Structuring and Evaluating Historical Arguments',
        'Extract Question: Evaluating Historical Interpretations (Breadth Study)',
      ],
      2: [
        'Depth Study: The Tudors: England 1485–1603',
        'Depth Study: Tsarist and Communist Russia 1855–1964',
        'Depth Study: The French Revolution and the Rule of Napoleon 1774–1815',
        'Depth Study: Germany 1919–1945',
        'Depth Study: China and Its Rulers 1912–76',
        'Depth Study: The Cold War 1945–1991',
        'Source Analysis: Evaluating Provenance, Reliability and Utility',
      ],
      3: [
        'Historical Investigation (NEA): Independent Research on a Chosen Topic (3,500–4,500 Words)',
        'Historiography: Evaluating Historians\' Interpretations and Debates',
        'Essay and Source Evaluation Techniques; Bibliography and Referencing',
      ],
    }},

    // ── Geography (AQA A-level 7037) ────────────────────────────────────────────
    'Geography': { papers: {
      1: [
        '1.1 – Water and Carbon Cycles: The Water Cycle (Drainage Basins, Stores, Flows)',
        '1.1 – Water and Carbon Cycles: The Carbon Cycle (Stores, Flows, Human Impact)',
        '1.1 – Water and Carbon Cycles: Water and Carbon Relationship and Climate Change',
        '1.2 – Coastal Systems and Landscapes: Systems Approach, Coastal Processes',
        '1.2 – Coastal Landscapes: Erosional and Depositional Landforms',
        '1.2 – Coastal Landscapes: Management — Hard and Soft Engineering, ICZM',
        '1.3 – Glacial Systems and Landscapes: Glacial Budget, Processes (Optional)',
        '1.3 – Glacial Landscapes: Erosional and Depositional Landforms',
        '1.3 – Glacial Landscapes: Human Activity in Glacial Landscapes',
        '1.4 – Hazards: Nature and Forms of Natural Hazard, the Hazard Risk Equation',
        '1.4 – Tectonic Hazards: Processes, Distribution, Impacts, Management',
        '1.4 – Atmospheric Hazards: Tropical Cyclones, Drought',
        '1.4 – Ecosystem Hazards: Wildfires, Mass Movement',
      ],
      2: [
        '2.1 – Global Systems and Governance: Globalisation — Flows of Capital, Labour, Products',
        '2.1 – Global Systems: Global Governance — IGOs, Trade Blocs, TNCs',
        '2.1 – Global Systems: The Global Commons (Antarctica, Deep Oceans, Atmosphere)',
        '2.2 – Changing Places: Sense of Place, Perception and Place Identity',
        '2.2 – Changing Places: Economic, Social and Demographic Change in Places',
        '2.2 – Changing Places: UK and a Contrasting Place (Rest of World)',
        '2.3 – Contemporary Urban Environments: Urbanisation and Urban Form',
        '2.3 – Urban Environments: Urban Social and Economic Issues',
        '2.3 – Urban Environments: Urban Regeneration and Planning',
        '2.3 – Urban Environments: Smart Cities and Sustainable Urban Development',
        '2.4 – Population and the Environment: Population-Resource Relationships (Optional)',
        '2.4 – Population: Theories (Malthus, Boserup), Migration',
      ],
      3: [
        '3.1 – Geography Fieldwork Investigation (NEA): Independent Investigation (3,000–4,000 Words)',
        '3.2 – Synoptic Investigation: Applying Geographical Knowledge to a Pre-Release Resource Booklet',
        'Geographical Skills: Statistical (Spearman\'s, Nearest Neighbour, Chi-Squared)',
        'Geographical Skills: Cartographic and Graphical Skills (Choropleth, Isoline, Flow-Line)',
        'Geographical Skills: Qualitative Methods (Interviews, Questionnaires, Field Sketches)',
      ],
    }},

    // ── Business (AQA A-level 7132) ─────────────────────────────────────────────
    'Business': { papers: {
      1: [
        'Theme 1 – What is Business?: Enterprise, Entrepreneurs, Business Objectives',
        'Theme 1 – The Market: Demand, Supply, Price Elasticity, Income Elasticity',
        'Theme 1 – Marketing: Market Research, Segmentation, Niche and Mass Markets',
        'Theme 1 – Financial Planning: Cash Flow, Profit, Break-Even Analysis',
        'Theme 2 – Business as a Dynamic Entity: Growth Strategies, Economies of Scale',
        'Theme 2 – Financial Planning at A-Level: Investment Appraisal (NPV, ARR, Payback)',
        'Theme 2 – Managing People: Motivation Theory (Taylor, Maslow, Herzberg, Mayo)',
        'Theme 2 – Operations Management: Lean Production, JIT, Quality Management',
      ],
      2: [
        'Theme 3 – Business Objectives and Strategy: Mission, Vision, Corporate Strategy',
        'Theme 3 – Business Growth: Organic and Inorganic Growth, Mergers, Takeovers',
        'Theme 3 – Internationalisation: Global Markets, Multinationals, Trade Barriers',
        'Theme 3 – External Influences: PESTLE Analysis, Business Cycle, Ethics',
        'Theme 4 – Global Business Environment: Political, Ethical, Environmental Contexts',
        'Theme 4 – Business Decision-Making: Quantitative Methods (Decision Trees, Critical Path Analysis)',
        'Theme 4 – Evaluating Strategic Performance: KPIs, Financial and Non-Financial Measures',
        'Case Study Analysis: Applying Business Theory to Complex Business Scenarios',
      ],
      3: [
        'Synoptic Case Study: Integrated Application of Themes 1–4',
        'Data Response: Analysing and Evaluating Business Data and Financial Statements',
      ],
    }},

    // ── Economics (AQA A-level 7136) ────────────────────────────────────────────
    'Economics': { papers: {
      1: [
        'The Economic Problem and Resource Allocation',
        'Demand and Supply Analysis: Shifts, Equilibrium, Price Mechanism',
        'Elasticity: PED, PES, YED, XED',
        'Production and Costs: Short Run and Long Run, Economies and Diseconomies of Scale',
        'Revenue and Profit: TR, AR, MR; Profit Maximisation',
        'Market Structures: Perfect Competition, Monopoly, Oligopoly, Monopolistic Competition',
        'Market Failure: Externalities, Public Goods, Information Asymmetry',
        'Government Intervention: Taxes, Subsidies, Regulations, Price Controls',
        'Labour Markets: Demand for and Supply of Labour, Wage Determination, Discrimination',
        'Income and Wealth Distribution: Lorenz Curve, Gini Coefficient',
      ],
      2: [
        'The Circular Flow of Income: Withdrawals and Injections',
        'National Income: GDP, GNP, Measuring Economic Growth',
        'The Business Cycle: Boom, Recession, Recovery',
        'Aggregate Demand: Components (C + I + G + X − M)',
        'Aggregate Supply: SRAS and LRAS',
        'Macroeconomic Policy Objectives: Growth, Unemployment, Inflation, Balance of Payments',
        'Fiscal Policy: Government Spending, Taxation, Budget Deficits',
        'Monetary Policy: Interest Rates, Money Supply, Quantitative Easing',
        'Supply-Side Policies: Education, Training, Deregulation, Privatisation',
        'International Trade: Comparative Advantage, Terms of Trade, Protectionism',
        'Balance of Payments: Current Account, Capital Account',
        'Exchange Rates: Floating, Fixed, Managed',
        'Development Economics: Measures of Development, Poverty Traps, Aid vs Trade',
      ],
      3: [
        'Economic Data Analysis: Interpreting and Evaluating Economic Data',
        'Essay Writing: Economic Argument, Evidence and Evaluation (Discuss, Evaluate)',
        'Application: Applying Micro and Macro Theory to Real-World Economic Issues',
      ],
    }},

    // ── Sociology (AQA A-level 7192) ────────────────────────────────────────────
    'Sociology': { papers: {
      1: [
        'Education: The Role and Purpose of Education (Functionalist, Marxist, Feminist)',
        'Education: Differential Achievement by Social Class, Gender and Ethnicity',
        'Education: In-School Factors (Labelling, Setting, Hidden Curriculum, Marketisation)',
        'Education: Policies and the New Right Perspective',
        'Theory and Methods: Sociological Perspectives (Functionalism, Marxism, Feminism, Interactionism, Postmodernism)',
        'Theory and Methods: Types of Research — Quantitative and Qualitative',
        'Theory and Methods: Primary Methods (Questionnaires, Interviews, Observation)',
        'Theory and Methods: Secondary Methods and Interpreting Data',
        'Theory and Methods: Positivism and Interpretivism',
        'Theory and Methods: Ethical Issues in Sociological Research',
      ],
      2: [
        'Families and Households: Changing Family Structures and Functions',
        'Families and Households: Demographic Trends (Birth Rate, Death Rate, Migration)',
        'Families and Households: Gender Roles and Domestic Labour',
        'Families and Households: Sociological Perspectives (Functionalist, Marxist, Feminist, New Right)',
        'Health: Defining Health and Illness, Social Construction of Health',
        'Health: Social Inequalities in Health (Class, Gender, Ethnicity)',
        'Health: The Role of Medicine and the Sick Role (Parsons)',
        'Crime and Deviance: Theories of Crime (Functionalist, Marxist, Feminist, Interactionist)',
        'Crime and Deviance: Official Statistics and Problems of Measurement',
        'Crime and Deviance: Patterns of Crime by Class, Gender and Ethnicity',
        'Crime and Deviance: Social Control, Punishment and Surveillance',
      ],
      3: [
        'Theory and Methods (A-Level): Macro vs Micro Theories, Structure and Agency',
        'Theory and Methods: Debates on Value Freedom, Objectivity, Ideology',
        'Beliefs in Society: Religion — Definitions, Functions (Durkheim, Marx, Weber)',
        'Beliefs in Society: Religious Organisations (Churches, Sects, Cults, Denominations)',
        'Beliefs in Society: Secularisation Debate',
        'Beliefs in Society: Religion and Social Change (Weber\'s Protestant Ethic)',
        'Beliefs in Society: Fundamentalism and Religion in the Global Context',
        'Global Development: Theories of Development (Modernisation, Dependency, World Systems)',
        'Global Development: Aid, Trade, Debt and Transnational Corporations',
        'Global Development: Education, Health and Development',
      ],
    }},

    // ── Psychology (AQA A-level 7182) ───────────────────────────────────────────
    'Psychology': { papers: {
      1: [
        'Social Influence: Conformity (Asch, Zimbardo), Types and Explanations',
        'Social Influence: Obedience (Milgram), Situational and Dispositional Factors',
        'Social Influence: Resistance to Social Influence, Minority Influence',
        'Social Influence: Social Change',
        'Memory: The Multi-Store Model (Atkinson and Shiffrin)',
        'Memory: The Working Memory Model (Baddeley and Hitch)',
        'Memory: Types of Long-Term Memory, Explanations for Forgetting',
        'Memory: Factors Affecting Eyewitness Testimony (Loftus, Misleading Information)',
        'Memory: The Cognitive Interview',
        'Attachment: Types of Attachment (Secure, Insecure-Avoidant, Insecure-Resistant)',
        'Attachment: Caregiver-Infant Interactions',
        'Attachment: Bowlby\'s Theory (Monotropy, Internal Working Model)',
        'Attachment: Ainsworth\'s Strange Situation and Cultural Variations',
        'Attachment: The Effects of Separation and Deprivation, Romanian Orphan Studies',
        'Psychopathology: Definitions of Abnormality',
        'Psychopathology: Mental Disorders (Phobias, OCD, Depression)',
        'Psychopathology: Treatments (CBT, Drug Therapy, Flooding, Systematic Desensitisation)',
      ],
      2: [
        'Approaches: Origins of Psychology, Introspection (Wundt)',
        'Approaches: Behaviourist Approach (Classical and Operant Conditioning)',
        'Approaches: Social Learning Theory (Bandura)',
        'Approaches: Cognitive Approach (Schema, Internal Mental Processes)',
        'Approaches: Biological Approach (Genes, Neurochemistry, Brain Structure)',
        'Approaches: Psychodynamic Approach (Freud — Id, Ego, Superego)',
        'Approaches: Humanistic Psychology (Maslow, Rogers)',
        'Biopsychology: The Nervous System and Endocrine System',
        'Biopsychology: Neurons and Synaptic Transmission',
        'Biopsychology: Localisation of Brain Function, Plasticity, Functional Recovery',
        'Biopsychology: Hemispheric Lateralisation (Split-Brain Research)',
        'Biopsychology: Sleep and Circadian Rhythms',
        'Research Methods: Experimental Designs, Sampling, Data Analysis',
        'Research Methods: Correlations, Observations, Case Studies, Interviews',
        'Research Methods: Statistical Tests (Chi-Squared, Mann-Whitney, Wilcoxon, Spearman\'s)',
        'Research Methods: BPS Ethical Guidelines, Peer Review',
      ],
      3: [
        'Issues and Debates: Gender Bias, Cultural Bias, Ethnocentrism',
        'Issues and Debates: Free Will vs Determinism, Reductionism vs Holism',
        'Issues and Debates: Nature vs Nurture, Idiographic vs Nomothetic',
        'Relationships: Formation, Maintenance, Dissolution of Romantic Relationships',
        'Gender: Sex and Gender, Biological and Psychodynamic Explanations',
        'Cognition and Development: Piaget, Vygotsky, Theory of Mind',
        'Schizophrenia: Classification, Biological and Psychological Explanations',
        'Eating Behaviour: Explanations of Eating Behaviour, Anorexia Nervosa',
        'Stress: Physiology of Stress, Sources, Individual Differences, Coping',
        'Aggression: Social Psychological and Biological Explanations',
        'Forensic Psychology: Theories of Offending, Custodial Sentencing',
        'Addiction: Risk Factors, Reducing Addiction',
      ],
    }},

    // ── French (AQA A-level 7652) ────────────────────────────────────────────────
    'French': { papers: {
      1: [
        'Listening, Reading and Writing (in French): Social Issues (Les Aspects de la société française actuelle)',
        'Theme 1 – Les Aspects de la société française actuelle: La Famille (Changing Family Structures)',
        'Theme 1 – La Société Connectée: Social Media, Technology and Privacy',
        'Theme 1 – La Santé et le Sport: Lifestyle, Drugs, Mental Health',
        'Theme 2 – Les Aspects de la société: L\'Environnement — Climate Change, Protests',
        'Theme 2 – La Politique et la société civile: Voting, Demonstrations',
        'Set Texts: French Literature (Novel — Kiffe Kiffe Demain or similar)',
        'Set Texts: French Film (Au Revoir Les Enfants or similar)',
        'Grammar: All A-Level Grammar (Subjunctive, Conditional Perfect, Passive, Infinitive Constructions)',
      ],
      2: [
        'Independent Research Project (IRP): French-Speaking Topic (History, Arts, Society)',
        'Oral Examination: Discussion of Set Texts and IRP',
        'Translation: Into English from French, Into French from English',
        'Writing: Essay in French on Literary and Cultural Topics',
      ],
    }},

    // ── German (AQA A-level 7662) ────────────────────────────────────────────────
    'German': { papers: {
      1: [
        'Theme 1 – Aspects of German-Speaking Society: Familie im Wandel',
        'Theme 1 – Digitale Welt: Social Media, Technology Dependency',
        'Theme 1 – Gesundheit und Sport: Lifestyle, Fitness, Drug Use',
        'Theme 2 – Aspects of German-Speaking Society: Kunstwelt und Kulturwelt',
        'Theme 2 – Die Umwelt: Climate, Renewable Energy, Sustainability',
        'Theme 2 – Die Politische Welt: German Political Parties, Elections',
        'Set Texts: German Literature (Der Vorleser or similar)',
        'Set Texts: German Film (Das Leben der Anderen or Good Bye, Lenin!)',
        'Grammar: Full A-Level German Grammar (Konjunktiv II, Passive, Complex Word Order)',
      ],
      2: [
        'Independent Research Project (IRP): German-Speaking World Topic',
        'Oral Examination: Discussion of Set Texts and IRP',
        'Translation: Into English from German, Into German from English',
        'Writing: Essay in German on Literary and Cultural Topics',
      ],
    }},

    // ── Spanish (AQA A-level 7692) ───────────────────────────────────────────────
    'Spanish': { papers: {
      1: [
        'Theme 1 – Aspects of Hispanic Society: La Familia — Changing Family Structures',
        'Theme 1 – El Mundo Digital: Social Media, Internet Use and Privacy',
        'Theme 1 – La Salud y el Deporte: Healthy Living, Drug Use, Mental Health',
        'Theme 2 – Aspects of Hispanic Society: El Medioambiente — Climate Change, Sustainability',
        'Theme 2 – La Política y la Sociedad: Government, Human Rights, Latin America',
        'Theme 2 – La Cultura Popular: Art, Film, Music in Hispanic World',
        'Set Texts: Spanish Literature (Novel — La Casa de Bernarda Alba or similar)',
        'Set Texts: Spanish Film (Volver or Pan\'s Labyrinth or similar)',
        'Grammar: Full A-Level Spanish Grammar (Subjunctive, Passive, Conditional Perfect)',
      ],
      2: [
        'Independent Research Project (IRP): Hispanic World Topic',
        'Oral Examination: Discussion of Set Texts and IRP',
        'Translation: Into English from Spanish, Into Spanish from English',
        'Writing: Essay in Spanish on Literary and Cultural Topics',
      ],
    }},

    // ── Music (AQA A-level 7272) ─────────────────────────────────────────────────
    'Music': { papers: {
      1: [
        'Area of Study 1: Western Classical Music 1650–1910',
        'Area of Study 2: Popular Music and Jazz',
        'Area of Study 3: Music for Media',
        'Area of Study 4: Music of the 20th Century',
        'Area of Study 5: Rock and Pop, Since 1960',
        'Area of Study 6: Music for Small Ensembles',
        'Area of Study 7: Innovations in Music',
        'Harmony and Counterpoint: Stylistic Exercises, Figured Bass',
        'Music Analysis: Harmony, Tonality, Structure, Texture, Instrumentation',
        'Listening: Identifying Features of Unfamiliar Extracts, Dictation',
        'Set Works: Specific Pieces from Each Area of Study',
      ],
      2: [
        'Performance (NEA): Solo and/or Ensemble, Minimum 10 Minutes',
        'Composition (NEA): Two Compositions (One to a Brief, One Free)',
        'Composition Skills: Melody Writing, Harmonisation, Orchestration',
      ],
    }},

    // ── Art & Design (AQA A-level 7201–7206 series) ──────────────────────────────
    'Art & Design': { papers: {
      1: [
        'Component 1 – Personal Investigation: Sustained Creative Exploration',
        'AO1 – Develop: Critical and Contextual Research (Artists, Movements)',
        'AO2 – Explore: Experimentation with Media, Materials, Techniques and Processes',
        'AO3 – Record: Observational Drawing, Photo Journals, Process Documentation',
        'AO4 – Present: Personal Response (Major Project Outcome)',
        'Written Element: 1,000-Word Critical and Contextual Essay',
        'Historical Movements: Impressionism, Expressionism, Cubism, Surrealism, Pop Art, Conceptual Art',
      ],
      2: [
        'Component 2 – Externally Set Assignment: 15-Hour Supervised Time',
        'Preparation Period: Research and Development Work',
        'Final Piece: Realising Creative Intentions Under Exam Conditions',
      ],
    }},

    // ── Photography (AQA A-level 7206 — one of AQA's Art & Design title options) ─
    // AQA's Art and Design suite is a family of separate titles sharing the same specification
    // structure: Art Craft and Design, Fine Art, Graphic Communication, Photography, Textile
    // Design, Three-Dimensional Design. Built out separately here since it's commonly chosen alone.
    'Photography': { papers: {
      1: [
        'Component 1 – Personal Investigation: Sustained Photographic Project',
        'AO1 – Develop: Critical and Contextual Research (Photographers, Movements, Genres)',
        'AO2 – Explore: Experimentation with Camera Techniques, Lighting, Darkroom/Digital Processes',
        'AO3 – Record: Photo Shoots, Contact Sheets, Annotation of Developing Ideas',
        'AO4 – Present: Personal Response — Final Photographic Outcome(s)',
        'Written Element: 1,000-Word Critical and Contextual Essay',
        'Photographic Genres: Portraiture, Landscape, Documentary, Studio, Experimental',
      ],
      2: [
        'Component 2 – Externally Set Assignment: 15-Hour Supervised Time',
        'Preparation Period: Research and Development Work',
        'Final Piece: Realising Creative Intentions Under Exam Conditions',
      ],
    }},

    // ── Law (AQA A-level 7162) ───────────────────────────────────────────────────
    'Law': { papers: {
      1: [
        'The English Legal System: Sources of Law (Legislation, Case Law, Delegated Legislation)',
        'The English Legal System: Statutory Interpretation (Literal, Golden, Mischief, Purposive Rules)',
        'The English Legal System: Judicial Precedent (Stare Decisis, Ratio, Obiter)',
        'The English Legal System: Court Structure and Hierarchy, Appeals',
        'The English Legal System: The Legal Profession (Solicitors, Barristers, Judges)',
        'The English Legal System: Access to Justice (Legal Aid, Funding, Alternative Dispute Resolution)',
        'The English Legal System: Jury System (Selection, Role, Advantages and Disadvantages)',
        'Criminal Law: Actus Reus and Mens Rea',
        'Criminal Law: Non-Fatal Offences Against the Person (Assault, Battery, ABH, GBH)',
        'Criminal Law: Fatal Offences (Murder, Manslaughter — Voluntary and Involuntary)',
        'Criminal Law: Defences (Insanity, Automatism, Intoxication, Self-Defence, Duress)',
        'Criminal Law: Property Offences (Theft, Robbery, Burglary, Fraud)',
      ],
      2: [
        'Tort Law: Negligence (Duty of Care — Caparo Test, Breach, Causation, Damage)',
        'Tort Law: Occupiers\' Liability (1957 and 1984 Acts)',
        'Tort Law: Nuisance (Private and Public), Vicarious Liability',
        'Tort Law: Defences (Consent, Contributory Negligence, Exclusion Clauses)',
        'Tort Law: Remedies (Damages — Special and General, Injunctions)',
        'Contract Law: Formation (Offer, Acceptance, Consideration, Intention)',
        'Contract Law: Terms (Express, Implied, Conditions, Warranties)',
        'Contract Law: Vitiating Factors (Misrepresentation, Duress, Undue Influence)',
        'Contract Law: Breach and Remedies (Damages, Specific Performance)',
      ],
      3: [
        'Human Rights Law: The Human Rights Act 1998, ECHR Articles',
        'Law of Equity and Trusts: Principles of Equity, Equitable Remedies (Specific Performance)',
        'Criminal Law and Tort in Context: Application to Complex Scenarios',
        'Perspectives on Law: Justice, Morality, Policy, Law and Society',
        'Nature of Law Option: Law-Making, Judicial Reasoning, Law and Morality',
      ],
    }},

    // ── Philosophy (AQA A-level 7172) ────────────────────────────────────────────
    'Philosophy': { papers: {
      1: [
        'Epistemology: Perception — Direct and Indirect Realism, Idealism',
        'Epistemology: The Concept of Knowledge — Justified True Belief, Gettier Problems',
        'Epistemology: Rationalism vs Empiricism (Descartes, Hume, Kant)',
        'Epistemology: The Relationship Between Reason and Experience, Innatism',
        'Ethics: Normative Ethical Theories — Utilitarianism (Bentham, Mill, Act vs Rule)',
        'Ethics: Kantian Deontological Ethics (Categorical Imperative, Duty)',
        'Ethics: Aristotelian Virtue Ethics (Eudaimonia, Character, the Golden Mean)',
        'Applied Ethics: Stealing, Simulated Killing, Eating Animals, Telling Lies',
        'Meta-Ethics: Moral Realism vs Anti-Realism, Cognitivism vs Non-Cognitivism',
      ],
      2: [
        'Metaphysics of Mind: Substance Dualism (Descartes)',
        'Metaphysics of Mind: Physicalism (Type Identity, Token Identity, Eliminativism)',
        'Metaphysics of Mind: Functionalism and the Multiple Realisation Argument',
        'Metaphysics of Mind: Philosophical Behaviourism (Logical and Analytical)',
        'Metaphysics of God: Arguments for God\'s Existence (Ontological, Cosmological, Teleological)',
        'Metaphysics of God: Arguments Against God\'s Existence (Problem of Evil, Incoherence)',
        'Metaphysics of God: Religious Language (Verification, Falsification, Via Negativa, Analogy)',
      ],
    }},

    // ── Accounting (AQA A-level 7127) ────────────────────────────────────────────
    'Accounting': { papers: {
      1: [
        'The Purpose of Accounting and Qualitative Characteristics of Financial Information',
        'Double-Entry Bookkeeping: The Accounting Equation',
        'Recording Business Transactions: Day Books, Ledgers, Trial Balance',
        'Financial Statements: Income Statement, Statement of Financial Position',
        'Sole Trader Accounts: Adjustments (Accruals, Prepayments, Depreciation, Bad and Doubtful Debts)',
        'Partnership Accounts: Appropriation Account, Current Accounts, Goodwill, Changes in Partnership',
        'Manufacturing Accounts: Prime Cost, Factory Cost, Cost of Production',
        'Costing: Marginal vs Absorption Costing, Break-Even Analysis',
        'Inventory Valuation: FIFO, LIFO, AVCO',
        'Incomplete Records: Reconstructing Accounts from Limited Information',
      ],
      2: [
        'Limited Company Accounts: Share Capital, Dividends, Reserves, Debentures',
        'Cash Flow Statements: Direct and Indirect Method',
        'Interpretation of Financial Statements: Ratio Analysis (Profitability, Liquidity, Efficiency, Gearing)',
        'Budgeting: Preparation and Variance Analysis',
        'Standard Costing: Variance Analysis (Material, Labour, Overhead)',
        'Capital Investment Appraisal: Payback, ARR, Net Present Value (NPV)',
        'Ethics in Accounting: Professional Conduct, Duties, Governance',
        'Not-for-Profit Organisations: Receipts and Payments, Income and Expenditure Accounts',
      ],
    }},

    // ── Politics (AQA A-level 7152) ──────────────────────────────────────────────
    'Politics': { papers: {
      1: [
        'UK Government: Parliament (House of Commons and House of Lords)',
        'UK Government: The Prime Minister and Cabinet (Core Executive)',
        'UK Government: The Electoral System (FPTP, Proportional Systems)',
        'UK Government: Political Parties (Conservatives, Labour, Liberal Democrats, Minor Parties)',
        'UK Government: Pressure Groups and Their Influence',
        'UK Government: The Constitution (Nature, Key Principles, Debates on Reform)',
        'UK Government: The Judiciary (Supreme Court, Judicial Review, Independence)',
        'UK Government: Devolution (Scotland, Wales, Northern Ireland)',
        'UK Government: The Media and Democracy',
      ],
      2: [
        'US Government: The US Constitution (Amendments, Federalism)',
        'US Government: Congress (Structure, Powers, Role)',
        'US Government: The Presidency (Powers, Limitations, Comparisons to UK PM)',
        'US Government: The Supreme Court (Judicial Review, Landmark Cases)',
        'US Government: US Elections and Political Parties',
        'US Government: Civil Rights (History and Contemporary Issues)',
        'Comparative Politics: Comparing UK and US Democracies',
      ],
      3: [
        'Political Ideas: Liberalism (Classical and Modern)',
        'Political Ideas: Conservatism (Traditional, One Nation and New Right)',
        'Political Ideas: Socialism (Marxism, Social Democracy, Third Way)',
        'Political Ideas: Nationalism, Feminism, Multiculturalism, Anarchism (Optional Ideologies)',
        'Political Ideas: Applying Ideologies to Contemporary Political Issues',
      ],
    }},

    // ── Religious Studies (AQA A-level 7062) ─────────────────────────────────────
    'Religious Studies': { papers: {
      1: [
        'Philosophy of Religion: Arguments for the Existence of God (Ontological, Cosmological, Teleological)',
        'Philosophy of Religion: The Problem of Evil and Theodicies (Augustine, Irenaeus)',
        'Philosophy of Religion: Religious Experience (James, Swinburne)',
        'Philosophy of Religion: Religious Language (Verification, Falsification, Symbols, Analogy)',
        'Philosophy of Religion: The Nature of God (Omnipotence, Eternity, Omniscience)',
        'Ethics: Natural Moral Law (Aquinas)',
        'Ethics: Situation Ethics (Fletcher)',
        'Ethics: Kantian Ethics',
        'Ethics: Utilitarianism (Bentham and Mill)',
        'Ethics: Virtue Ethics (Aristotle and MacIntyre)',
        'Ethics: Divine Command Theory',
        'Applied Ethics: Sexual Ethics, Environmental Ethics, War and Peace',
      ],
      2: [
        'Christianity: Development of Christian Thought (Augustine — Human Nature, Grace)',
        'Christianity: Death and the Afterlife',
        'Christianity: Knowledge of God (Natural Theology vs Revealed Theology)',
        'Christianity: The Person of Jesus Christ (Historical and Theological)',
        'Christianity: Christian Moral Principles',
        'Christianity: Christian Moral Action (Bonhoeffer)',
        'Dialogue: The Relationship Between Religion and Science',
        'Dialogue: The Relationship Between Religion and Secularism',
        'Dialogue: Gender and Theology (Feminist Theology)',
      ],
    }},

    // ── Physical Education (AQA A-level 7582) ────────────────────────────────────
    'Physical Education': { papers: {
      1: [
        'Applied Anatomy and Physiology: Skeletal, Muscular and Cardiovascular Systems',
        'Applied Anatomy and Physiology: Respiratory System and Gas Exchange',
        'Applied Anatomy and Physiology: Energy Systems (ATP-PC, Lactic Acid, Aerobic)',
        'Applied Anatomy and Physiology: Neuromuscular System',
        'Applied Anatomy and Physiology: Environmental Effects on Performance (Altitude, Heat)',
        'Exercise Physiology: Diet and Nutrition, Ergogenic Aids',
        'Exercise Physiology: Fitness Testing, Training Methods and Periodisation',
        'Biomechanics: Newton\'s Laws Applied to Sport',
        'Biomechanics: Levers, Projectiles, Centre of Mass',
        'Biomechanics: Angular Motion (Moment of Inertia, Angular Velocity)',
        'Biomechanics: Fluid Mechanics (Drag, Lift, Bernoulli Principle)',
      ],
      2: [
        'Skill Acquisition: Information Processing (Whiting\'s Model)',
        'Skill Acquisition: Memory Models, Reaction Time, Anticipation',
        'Skill Acquisition: Learning Theories (Operant Conditioning, Observational Learning)',
        'Skill Acquisition: Stages of Learning and Practice Methods',
        'Sports Psychology: Motivation, Arousal, Anxiety (Catastrophe Theory)',
        'Sports Psychology: Aggression — Theories and Channelling',
        'Sports Psychology: Group Dynamics, Cohesion, Leadership',
        'Sports Psychology: Confidence and Attribution Theory',
        'Sport and Society: Historical Development of Sport',
        'Sport and Society: Class, Gender, Ethnicity and Disability in Sport',
        'Sport and Society: Commercialisation, Media and Sponsorship',
        'Sport and Society: Sport and Deviance (PEDs, Hooliganism)',
        'Sport and Society: Global Sporting Events (Olympics, Paralympics)',
        'Exercise Psychology: Mental Health Benefits, Adherence to Exercise',
      ],
      3: [
        'NEA – Performance: Practical Activity (Individual, Team, or Outdoor and Adventurous)',
        'NEA – Analytical Investigation: Written Analysis of a Weakness in Performance',
      ],
    }},

    // ── Media Studies (AQA A-level 7572) ─────────────────────────────────────────
    'Media Studies': { papers: {
      1: [
        'Component 1: Investigating the Media',
        'Media Language: Theoretical Framework (Semiotics, Narrative, Genre)',
        'Representation: Gender, Ethnicity, Sexuality, Class, Age, Disability',
        'Media Industries: Ownership, Regulation, Funding Models',
        'Audiences: Mass Audience vs Niche, Digital Audiences, Fandom',
        'Set Products: Newspapers, Advertising, Music Video, Online Media',
        'Key Theorists: Barthes, Lévi-Strauss, Neale, Hall, Gauntlett, Curran, Jenkins',
      ],
      2: [
        'Component 2: Investigating Media Industries and Audiences',
        'Television: Long-Form Drama, Industry Context, Representation',
        'Radio: BBC Radio Licensing, Regulation, Formats',
        'Film: Hollywood vs Global/Independent Cinema',
        'Video Games: Industry, Representation, Audiences',
        'Set Products: Comparative Analysis of UK and International Media',
      ],
      3: [
        'Component 3: Cross-Media Production (NEA)',
        'Cross-Media Project: Research, Planning, Production, Evaluation',
        'Media Language Applied to Production Choices',
      ],
    }},

    // ── Drama and Theatre (AQA A-level 7262) ─────────────────────────────────────
    'Drama and Theatre': { papers: {
      1: [
        'Component 1: Drama and Theatre — Set Play Study',
        'Set Play: Analysing an Extract for Staging, Design and Performance',
        'Theatrical Practitioners: Stanislavski, Brecht, Artaud',
        'Theatre History: Greek Theatre, Medieval, Renaissance, 19th Century',
        'Live Theatre: Evaluating a Professional Production',
      ],
      2: [
        'Component 2: Creating Original Drama (NEA)',
        'Devised Piece: Process Portfolio + Performance',
      ],
      3: [
        'Component 3: Making Theatre (NEA)',
        'Scripted Performance: Two Contrasting Scenes',
        'Design Realisation (if applicable): Set, Costume, Lighting, Sound',
      ],
    }},

    // ── Latin (AQA A-level 7682) ──────────────────────────────────────────────────
    'Latin': { papers: {
      1: [
        'Verse Literature: Set Texts (Virgil\'s Aeneid, Ovid\'s Metamorphoses or similar)',
        'Prose Literature: Set Texts (Cicero, Livy or similar)',
        'Unseen Translation: Prose',
        'Unseen Translation: Verse',
        'Language: Full Latin Grammar (all Noun Declensions, Verb Conjugations, Participles)',
        'Language: Indirect Speech (Accusative + Infinitive, Subjunctive)',
        'Language: Gerunds, Gerundives, Supine',
        'Language: Complex Conditional Sentences',
        'Roman Contexts: History, Culture and Society Related to Set Texts',
      ],
    }},

    // ── Classical Greek (AQA A-level 7882) ───────────────────────────────────────
    'Classical Greek': { papers: {
      1: [
        'Verse Literature: Homer\'s Iliad or Odyssey (Set Passages)',
        'Prose Literature: Plato, Herodotus or Thucydides (Set Passages)',
        'Unseen Translation: Prose and Verse',
        'Language: Full Greek Grammar (all Noun Declensions, Verb Conjugations, Participles)',
        'Language: Indirect Speech, Optative Mood, Participle Constructions',
        'Greek Contexts: History, Myth and Society Related to Set Texts',
      ],
    }},

    // ── English Language and Literature (AQA A-level 7707) ─────────────────────
    // Was listed in subjects.js's ALEVEL_SUBJECTS but had no topics.js entry under any board.
    'English Language & Literature': { papers: {
      1: [
        'Telling Stories: Studying a Novel and a Poetry Text Through Language and Literature Lenses',
        'Telling Stories: Narrative Theory, Point of View, Voice',
        'Telling Stories: Combining Linguistic and Literary Methods of Analysis',
        'Exploring Conflict: Studying a Second Novel and Related Non-Fiction/Other Material',
        'Exploring Conflict: Applying Language Frameworks (Lexis, Grammar, Discourse) to Literary Texts',
      ],
      2: [
        'Remediating Texts: Adaptation Across Different Forms and Modes',
        'Remediating Texts: Comparing An Original Text and Its Adaptation',
        'Making Connections — Non-Exam Assessment: Independent Critical and Creative Study',
        'Making Connections — NEA: Original Writing Piece Plus Commentary Linking Language and Literature',
      ],
    }},

    // ── Design and Technology: Product Design (AQA A-level 7552) ───────────────
    // One subject, compound title — was listed in subjects.js as two separate entries
    // ('Design & Technology' and 'Product Design'); see the note in subjects.js.
    'Design and Technology: Product Design': { papers: {
      1: [ // Paper 1 — Technical Principles
        'Technical Principles: New and Emerging Technologies, Industry 4.0',
        'Technical Principles: Energy Storage and Generation',
        'Technical Principles: Developments in New Materials (Smart Materials, Composites, Technical Textiles)',
        'Technical Principles: Systems Approach to Designing, Mechanical Devices',
        'Technical Principles: Materials: Papers/Boards, Timbers, Metals, Polymers, Textiles, Electronic/Smart Materials',
        'Technical Principles: Performance Characteristics of Materials',
        'Technical Principles: Selection of Materials/Components, Forces and Stresses on Materials',
        'Technical Principles: Ecological, Social and Ethical Footprint of Design and Manufacture',
        'Technical Principles: Enterprise and Marketplace: Design Strategies, Intellectual Property',
      ],
      2: [ // Paper 2 — Designing and Making Principles
        'Designing and Making Principles: Investigation, Primary and Secondary Data',
        'Designing and Making Principles: Environmental, Social and Economic Challenge',
        'Designing and Making Principles: The Work of Others (Past and Present Designers)',
        'Designing and Making Principles: Design Communication, Prototyping, 3D Modelling and CAD/CAM',
        'Designing and Making Principles: Materials Management, Specialist Tools/Techniques/Processes',
        'Designing and Making Principles: Manufacturing: Scales of Production, Surface Treatments and Finishes',
        'NEA – Substantial Design and Make Project: Portfolio and Manufactured Prototype',
      ],
    }},

    // ── Environmental Science (AQA A-level 7447 — AQA-only qualification) ──────
    // Confirmed live and current (2026 exam series) — was listed in subjects.js's ALEVEL_SUBJECTS
    // but had zero topics.js content; not the legacy/discontinued subject it might be assumed to be.
    'Environmental Science': { papers: {
      1: [
        'The Living Environment: Biogeochemical Cycles (Carbon, Nitrogen, Phosphorus)',
        'The Living Environment: Ecosystems, Biomes and Succession',
        'The Living Environment: Biodiversity and Conservation of Species and Habitats',
        'The Physical Environment: The Lithosphere — Structure, Plate Tectonics, Resource Exploitation',
        'The Physical Environment: The Atmosphere — Structure, Circulation, Climate Change, El Niño/La Niña',
        'The Physical Environment: The Hydrosphere — Water Cycle, Water Treatment, Aquifers',
        'The Physical Environment: Soil Systems — Soil Formation, Soil Triangles, Erosion and Conservation',
      ],
      2: [
        'Energy Resources: Fossil Fuels, Nuclear Power, Renewable Energy Technologies',
        'Energy Resources: Energy Conservation and Storage Systems',
        'Pollution: Types, Sources and Effects of Air, Water and Land Pollution',
        'Pollution: Control Technologies (Combustion Technology, Acid Rain Control)',
        'Biological Resources: Agriculture, Fisheries, Forestry — Sustainable Management',
        'Sustainability: Environmental Impact Assessment, Sustainable Development Principles',
        'Synoptic Essay: 25-Mark Extended Response Drawing on Content from Both Papers',
      ],
    }},

  }, // end AQA A-Level

  // ── EDEXCEL A-LEVEL ──────────────────────────────────────────────────────────
  Edexcel: {

    // ── Mathematics (Edexcel A-level 9MA0) ──────────────────────────────────────
    'Mathematics': { papers: {
      1: [ // Pure Mathematics 1
        'Pure 1 – Algebraic Expressions: Indices, Surds, Simultaneous Equations',
        'Pure 1 – Quadratics: Factorising, Formula, Completing the Square, the Discriminant',
        'Pure 1 – Equations and Inequalities: Solving, Regions, Simultaneous',
        'Pure 1 – Graphs and Transformations: Cubic, Quartic, Reciprocal Graphs',
        'Pure 1 – Straight Line Graphs: Gradient, Equation, Parallel and Perpendicular',
        'Pure 1 – Circles: Equation, Tangents, Chords, Circle Geometry Problems',
        'Pure 1 – Algebraic Methods: Proof, Algebraic Fractions, the Factor Theorem',
        'Pure 1 – The Binomial Expansion: Pascal\'s Triangle, General Term',
        'Pure 1 – Trigonometric Ratios: Sine and Cosine Rule, Radians, Small Angle Approximations',
        'Pure 1 – Trigonometric Identities and Equations',
        'Pure 1 – Vectors: 2D Vectors, Magnitude and Direction, Position Vectors',
        'Pure 1 – Differentiation: First Principles, Rules, Tangents, Normals, Stationary Points',
        'Pure 1 – Integration: Indefinite Integrals, Area Under a Curve',
        'Pure 1 – Exponentials and Logarithms: Laws of Logs, Graphs, Equations',
      ],
      2: [ // Pure Mathematics 2
        'Pure 2 – Algebraic Methods: Partial Fractions',
        'Pure 2 – Functions and Graphs: Modulus Function, Composite and Inverse Functions',
        'Pure 2 – Sequences and Series: Arithmetic, Geometric, Sigma Notation, Recurrence',
        'Pure 2 – Binomial Expansion: Extension to Negative and Fractional Powers',
        'Pure 2 – Radians: Arc Length, Sector Area, Small-Angle Approximations (Extended)',
        'Pure 2 – Trigonometric Functions: sec, cosec, cot; Inverse Functions',
        'Pure 2 – Trigonometric and Modelling: Addition Formulae, Double Angle, R sin(θ±α)',
        'Pure 2 – Parametric Equations: Converting, Curve Sketching, Differentiation',
        'Pure 2 – Differentiation: Chain, Product, Quotient Rule; Trig, Exp, Log Functions',
        'Pure 2 – Numerical Methods: Iteration, Newton-Raphson',
        'Pure 2 – Integration: By Substitution, By Parts, Using Partial Fractions',
        'Pure 2 – Integration: Differential Equations, Area Between Curves',
        'Pure 2 – Vectors: 3D Vectors, Vector Geometry',
      ],
      3: [ // Statistics and Mechanics
        'Statistics – Statistical Sampling: Techniques and Terminology',
        'Statistics – Data Presentation and Interpretation: Measures of Location and Spread',
        'Statistics – Probability: Set Notation, Venn Diagrams, Tree Diagrams',
        'Statistics – Statistical Distributions: The Binomial and Normal Distribution',
        'Statistics – Statistical Hypothesis Testing: Binomial and Correlation Context',
        'Mechanics – Kinematics: Constant and Variable Acceleration (SUVAT and Calculus)',
        'Mechanics – Forces and Newton\'s Laws: F = ma, Connected Particles, Friction',
        'Mechanics – Moments: Rigid Bodies in Equilibrium',
        'Mechanics – Projectiles: Horizontal and Vertical Motion Combined',
      ],
    }},

    // ── Further Mathematics (Edexcel A-level 9FM0) ─────────────────────────────
    'Further Mathematics': { papers: {
      1: [ // Core Pure 1
        'Core Pure 1 – Complex Numbers: i, Argand Diagrams, Modulus-Argument Form',
        'Core Pure 1 – Complex Numbers: Solving Cubic and Quartic Equations',
        'Core Pure 1 – Matrices: 2×2 and 3×3, Determinants, Inverses, Transformations',
        'Core Pure 1 – Further Algebra and Functions: Roots of Polynomials',
        'Core Pure 1 – Further Calculus: Volumes of Revolution',
        'Core Pure 1 – Further Vectors: Vector and Cartesian Equation of a Line',
        'Core Pure 1 – Proof by Induction: Series, Divisibility, Matrix Powers',
        'Core Pure 1 – Series: Sums of Natural Numbers, Squares, Cubes',
      ],
      2: [ // Core Pure 2
        'Core Pure 2 – Complex Numbers: De Moivre\'s Theorem, nth Roots',
        'Core Pure 2 – Further Algebra: Series Expansions, Method of Differences',
        'Core Pure 2 – Further Calculus: Maclaurin Series, Improper Integrals',
        'Core Pure 2 – Polar Coordinates: Curves, Area Enclosed',
        'Core Pure 2 – Hyperbolic Functions: sinh, cosh, tanh, Inverse Hyperbolics',
        'Core Pure 2 – Differential Equations: First- and Second-Order',
        'Further Pure 1 – Vectors: Planes, Intersections, Distances',
      ],
      3: [ // Two Applied Options
        'Further Statistics 1 – Discrete and Continuous Distributions',
        'Further Statistics 1 – Chi-Squared Tests, the Poisson Distribution',
        'Further Statistics 1 – Central Limit Theorem, Correlation',
        'Further Mechanics 1 – Momentum and Impulse, Collisions, Elastic Strings and Springs',
        'Further Mechanics 1 – Circular Motion, Centres of Mass',
        'Decision Mathematics 1 – Algorithms, Graph Theory, Kruskal\'s and Prim\'s',
        'Decision Mathematics 1 – Linear Programming, Critical Path Analysis',
      ],
    }},

    // ── Statistics (Edexcel A-level 9ST0) ───────────────────────────────────────
    // MOVED from AQA — AQA does not currently offer a standalone A-level Statistics
    // (their 2013 5381/6380 spec was legacy and withdrawn); Pearson Edexcel does.
    'Statistics': { papers: {
      1: [
        'The Statistical Enquiry Cycle: Planning, Collecting, Processing, Interpreting Data',
        'Sampling: Random, Stratified, Systematic, Cluster and Quota Sampling',
        'Sampling: Bias, Sampling Frames, Populations',
        'Data Presentation and Interpretation: Central Tendency and Measures of Spread',
        'Data Presentation: Outliers, Box Plots, Skewness',
        'Correlation and Regression: Product Moment Correlation Coefficient, Regression Lines',
        'Correlation and Regression: Spearman\'s Rank Correlation Coefficient',
        'Index Numbers: Simple and Weighted Index Numbers, Chain-Base Method',
        'Probability: Basic Rules, Venn Diagrams, Tree Diagrams, Conditional Probability',
      ],
      2: [
        'Statistical Distributions: The Binomial and Poisson Distributions',
        'Statistical Distributions: The Normal Distribution and Standardisation',
        'Statistical Distributions: The Geometric Distribution',
        'Statistical Hypothesis Testing: Binomial, Poisson and Normal Context',
        'Statistical Hypothesis Testing: Tests for Correlation and Regression',
        'Estimation, Confidence Intervals and the Central Limit Theorem',
        'Contingency Tables and the Chi-Squared Test',
        'Non-Parametric Tests: Sign Test, Wilcoxon Signed-Rank Test',
        'Quality Assurance: Control Charts and Statistical Process Control',
      ],
    }},

    // ── Biology A (Edexcel A-level 9BI0, Salters-Nuffield) ──────────────────────
    'Biology': { papers: {
      1: [
        'Topic 1 – Biological Molecules: Carbohydrates, Lipids, Proteins, Water',
        'Topic 1 – Biological Molecules: Enzymes and Their Action',
        'Topic 2 – Cells, Viruses and Reproduction: Cell Structure and Ultrastructure',
        'Topic 2 – Cells: Mitosis, Meiosis, the Cell Cycle',
        'Topic 2 – Viruses: Structure, Replication, HIV',
        'Topic 3 – Classification and Biodiversity: Taxonomy, Phylogeny, Species Diversity',
        'Topic 3 – Adaptation and Natural Selection',
        'Topic 4 – Exchange and Transport: Gas Exchange Surfaces, the Mammalian Circulatory System',
        'Topic 4 – Transport: Haemoglobin, the Heart, Xylem and Phloem',
        'Topic 5 – Energy for Biological Processes: Photosynthesis (Light and Dark Reactions)',
        'Topic 5 – Respiration: Glycolysis, Krebs Cycle, Oxidative Phosphorylation',
        'Required Practicals: Microscopy, Enzyme Investigation, Chromatography, Dissection',
      ],
      2: [
        'Topic 6 – Microbiology and Pathogens: Bacteria, Fungi, Immune Response',
        'Topic 6 – Antibiotics and Antibiotic Resistance',
        'Topic 7 – Modern Genetics: DNA Structure, Protein Synthesis, Gene Technology',
        'Topic 7 – Genetic Engineering: PCR, Gel Electrophoresis, Genetic Fingerprinting',
        'Topic 8 – Origins of Genetic Variation: Meiosis, Mutation, Genetic Diversity',
        'Topic 8 – Inheritance: Monohybrid and Dihybrid Crosses, Chi-Squared Test',
        'Topic 9 – Control Systems: Nervous and Hormonal Coordination, Homeostasis',
        'Topic 9 – The Kidney, Blood Glucose Regulation',
        'Topic 10 – Ecosystems: Energy Flow, Nutrient Cycles, Succession',
        'Topic 10 – Population Size and Conservation',
        'Required Practicals: Population Sampling, Respirometer, Enzyme Kinetics',
      ],
      3: [
        'All Topics: Synoptic Paper Drawing on Topics 1–10',
        'Practical Skills: All Edexcel Required Practicals — Analysis and Evaluation',
        'Extended Open-Response Questions: Synthesis Across Multiple Topics',
      ],
    }},

    // ── Chemistry (Edexcel A-level 9CH0) ────────────────────────────────────────
    'Chemistry': { papers: {
      1: [
        'Topic 1 – Atomic Structure and the Periodic Table: Atomic Structure, Electron Configuration',
        'Topic 1 – Ionisation Energies, Periodicity',
        'Topic 2 – Bonding and Structure: Ionic, Covalent, Metallic, Shapes of Molecules',
        'Topic 2 – Intermolecular Forces, Bonding and Physical Properties',
        'Topic 3 – Redox I: Oxidation States, Redox Reactions, Group 1/2 Reactions',
        'Topic 4 – Inorganic Chemistry and the Periodic Table: Group 7, Qualitative Analysis',
        'Topic 5 – Formulae, Equations and Amounts of Substance: Moles, Empirical Formulae',
        'Topic 5 – Titrations, Atom Economy, Percentage Yield',
        'Topic 6 – Organic Chemistry I: Nomenclature, Alkanes, Halogenoalkanes, Alkenes',
        'Topic 6 – Organic Chemistry I: Alcohols, Mechanisms',
      ],
      2: [
        'Topic 7 – Modern Analytical Techniques I: Mass Spectrometry, Infrared Spectroscopy',
        'Topic 8 – Energetics I: Enthalpy Changes, Hess\'s Law, Bond Enthalpies',
        'Topic 9 – Kinetics I: Rate of Reaction, Collision Theory, Catalysts',
        'Topic 10 – Equilibrium I: Le Chatelier\'s Principle, Kc',
        'Topic 11 – Equilibrium II: Acids and Bases, pH, Buffers, Titration Curves',
        'Topic 12 – Further Organic Chemistry: Carbonyls, Carboxylic Acids and Derivatives',
        'Topic 12 – Aromatic Chemistry, Amines, Polymers, Amino Acids',
        'Topic 13 – Modern Analytical Techniques II: NMR Spectroscopy, Chromatography',
        'Topic 14 – Energetics II: Born-Haber Cycles, Entropy, Gibbs Free Energy',
        'Topic 15 – Kinetics II: Rate Equations, Orders of Reaction',
        'Topic 16 – Equilibrium III: Electrode Potentials, Cells',
        'Topic 17 – Transition Metals: Complex Ions, Colour, Catalysis',
        'Topic 18 – Further Organic Chemistry II: Synthesis Routes, Chirality',
      ],
      3: [
        'All Topics: General and Practical Principles in Chemistry — Synoptic',
        'Practical Skills: All Edexcel Required Practicals — Analysis, Evaluation, Errors',
        'Data Analysis: Interpreting Spectra and Experimental Results',
      ],
    }},

    // ── Physics (Edexcel A-level 9PH0) ──────────────────────────────────────────
    'Physics': { papers: {
      1: [
        'Topic 1 – Working as a Physicist: Practical Skills, SI Units, Uncertainty',
        'Topic 2 – Mechanics: Motion, SUVAT, Projectiles',
        'Topic 2 – Forces and Newton\'s Laws: Momentum, Impulse, Conservation of Momentum',
        'Topic 3 – Electric Circuits: Current, PD, Resistance, EMF, Internal Resistance',
        'Topic 4 – Materials: Density, Hooke\'s Law, the Young Modulus, Stress-Strain Graphs',
        'Topic 5 – Waves and the Particle Nature of Light: Wave Properties, Superposition',
        'Topic 5 – Refraction, Diffraction, Photoelectric Effect, Wave-Particle Duality',
        'Topic 6 – Further Mechanics: Projectiles, Momentum and Impulse (Extended)',
        'Topic 6 – Circular Motion, Simple Harmonic Motion',
      ],
      2: [
        'Topic 7 – Electric and Magnetic Fields: Coulomb\'s Law, Field Strength, Capacitance',
        'Topic 7 – Magnetic Flux Density, the Motor Effect, Electromagnetic Induction',
        'Topic 8 – Nuclear and Particle Physics: Atomic Structure, Radioactive Decay',
        'Topic 8 – Particle Physics: Standard Model, Hadrons, Leptons, Quarks',
        'Topic 9 – Thermodynamics: Specific Heat Capacity, Ideal Gas Laws, Kinetic Theory',
        'Topic 10 – Space: Gravitational Fields, Orbits, Astrophysics, the Big Bang',
        'Topic 12 – Nuclear Radiation: Half-Life, Nuclear Fission and Fusion',
        'Topic 13 – Gravitational Fields: Newton\'s Law, Gravitational Potential',
        'Topic 14 – Oscillations: SHM, Damping, Resonance',
      ],
      3: [
        'General and Practical Principles: Synoptic Questions on All Topics',
        'Practical Skills: All Edexcel Required Practicals — Analysis and Evaluation',
        'Section B: Extended Writing and Data Analysis on Any Topic',
      ],
    }},

    // ── History (Edexcel A-level 9HI0) ──────────────────────────────────────────
    'History': { papers: {
      1: [
        'Paper 1 – Breadth Study with Interpretations: Britain 1625–1701: Conflict, Revolution and Settlement',
        'Paper 1 – Breadth Study: Russia and Its Rulers 1855–1964',
        'Paper 1 – Breadth Study: India 1845–1947: The Case for Independence',
        'Paper 1 – Analysing and Evaluating Historical Interpretations',
      ],
      2: [
        'Paper 2 – Depth Study: Germany 1918–45',
        'Paper 2 – Depth Study: Mao\'s China 1949–76',
        'Paper 2 – Depth Study: South Africa 1948–94',
        'Paper 2 – Depth Study: The USA and Vietnam 1954–75',
      ],
      3: [
        'Paper 3 – Themes in Breadth with Aspects in Depth: Thematic Essay Question',
        'Paper 3 – Document Study: Analysing Primary Source Extracts',
        'Historical Investigation (NEA): Independent Research (3,000–4,000 Words)',
      ],
    }},

    // ── Economics A (Edexcel A-level 9EC0) ──────────────────────────────────────
    'Economics': { papers: {
      1: [
        'Theme 1 – Introduction to Markets and Market Failure: Nature of Economics',
        'Theme 1 – Demand and Supply, Price Elasticity, Market Failure and Externalities',
        'Theme 3 – Business Behaviour and the Labour Market: Business Growth, Objectives',
        'Theme 3 – Market Structures, Labour Market, Government Intervention',
      ],
      2: [
        'Theme 2 – The UK Economy: Performance and Policies: Measures of Economic Performance',
        'Theme 2 – Aggregate Demand, Aggregate Supply, Fiscal and Monetary Policy',
        'Theme 4 – A Global Perspective: International Economics, Trade, Development',
        'Theme 4 – Emerging and Developing Economies, Exchange Rates',
      ],
      3: [
        'Paper 3 – Microeconomics and Macroeconomics: Synoptic Assessment',
        'Data Response and Extended Essay Questions Across Themes 1–4',
      ],
    }},

    // ── Geography (Edexcel A-level 9GE0) ────────────────────────────────────────
    'Geography': { papers: {
      1: [
        'Paper 1 – Dynamic Landscapes: Tectonic Processes and Hazards',
        'Paper 1 – Coastal Landscapes and Change',
        'Paper 1 – The Water Cycle and Water Insecurity',
        'Paper 1 – The Carbon Cycle and Energy Security',
      ],
      2: [
        'Paper 2 – Dynamic Places: Regenerating Places',
        'Paper 2 – Diverse Places',
        'Paper 2 – The Superpowers',
        'Paper 2 – Global Development and Connections; Migration, Identity and Sovereignty',
      ],
      3: [
        'Paper 3 – Synoptic Investigation: Decision-Making Exercise (DME) Based on Resource Booklet',
        'NEA – Independent Investigation: Fieldwork-Based Research (3,000–4,000 Words)',
        'Geographical Skills: Statistical, Cartographic, Fieldwork Techniques',
      ],
    }},

    // ── Computer Science (Edexcel A-level 9CP0) ─────────────────────────────────
    'Computer Science': { papers: {
      1: [
        'Paper 1 – Computational Thinking and Problem Solving',
        'Algorithms: Design, Analysis, Big O Notation',
        'Data Structures: Arrays, Stacks, Queues, Trees, Graphs, Hash Tables',
        'Programming Paradigms: OOP, Functional, Logic',
        'Theory of Computation: Finite State Machines, Regular Languages, Turing Machines',
        'Recursion, Searching and Sorting Algorithms',
      ],
      2: [
        'Paper 2 – Computer Organisation and Architecture',
        'CPU, the Fetch-Decode-Execute Cycle, Processor Types',
        'Networks, the Internet, World Wide Web, Security, Encryption',
        'Systems Software: OS, Translators, Virtual Machines',
        'Data Representation and Compression',
        'Databases: SQL, Normalisation, the Relational Model',
        'Big Data, Ethical and Legal Issues, Environmental Impact of Computing',
      ],
      3: [
        'NEA – Programming Project (20% of A-Level): Analysis, Design, Implementation, Testing, Evaluation',
      ],
    }},

    // ── Business (Edexcel A-level 9BS0) ─────────────────────────────────────────
    'Business': { papers: {
      1: [
        'Paper 1 – Marketing and People',
        'Theme 1 – Meeting Customer Needs: Market Research, Segmentation, Marketing Mix',
        'Theme 1 – The Market: Demand, Competition, Digital Technology',
        'Theme 3 – Managing People: HR Management, Motivation, Leadership',
        'Theme 3 – Operations: Location, Technology, Lean Production',
      ],
      2: [
        'Paper 2 – Business Activities, Decisions and Strategy',
        'Theme 2 – Managing Business Activities: Financial Planning, Cash Flow',
        'Theme 4 – Financial Planning: Budgets, Financial Statements, Investment Appraisal',
        'Theme 4 – Influences on Business Decisions: Ethics, Law, External Environment',
        'Theme 4 – Business Strategy: Ansoff Matrix, Porter\'s Generic Strategies',
      ],
      3: [
        'Paper 3 – Investigating Business in a Competitive Environment',
        'Case Study: Applying Business Concepts to a Pre-Released Case',
        'Quantitative and Qualitative Analysis of Business Data',
      ],
    }},

    // ── Psychology (Edexcel A-level 9PS0) ───────────────────────────────────────
    'Psychology': { papers: {
      1: [
        'Paper 1 – Foundations in Psychology',
        'Social Influence: Obedience (Milgram), Conformity (Asch), Agency Theory',
        'Cognitive Psychology: Memory Models, Eyewitness Testimony, the Cognitive Interview',
        'Biological Psychology: Brain Structure, Neurochemistry, Genes and Behaviour',
        'Learning Theories: Classical and Operant Conditioning, Social Learning Theory',
      ],
      2: [
        'Paper 2 – Applications of Psychology',
        'Clinical Psychology: Defining and Diagnosing Abnormality, Treatments',
        'Criminological Psychology or Child Psychology or Health Psychology (Chosen Option)',
        'Issues and Debates: Science, Ethics, Culture, Nature/Nurture (Introductory)',
      ],
      3: [
        'Paper 3 – Psychological Skills',
        'Issues and Debates: Free Will/Determinism, Reductionism/Holism, Nature/Nurture (Full)',
        'Research Methods: Experimental Design, Data Analysis, Statistical Tests',
        'Applied Psychology: Synoptic Application Across the Course',
      ],
    }},

    // ── Arabic (Edexcel A-level 9AA0) ───────────────────────────────────────────
    // Confirmed live for the 2026 series — was listed in subjects.js's ALEVEL_SUBJECTS but had
    // zero topics.js content under any board. Edexcel is the mainstream board offering this.
    'Arabic': { papers: {
      1: [
        'Paper 1 – Translation into English, Reading Comprehension and Research-Based Writing',
        'Reading: Comprehension of Arabic Texts Across Set Themes',
        'Translation: Arabic to English',
      ],
      2: [
        'Paper 2 – Written Response to Works (Literary Text and/or Film) and Translation into Arabic',
        'Translation: English to Arabic',
        'Critical and Analytical Response to a Studied Literary Text or Film',
      ],
      3: [
        'Paper 3 – Listening, Reading and Writing in Arabic',
        'Listening Comprehension Across Set Themes',
        'Extended Writing in Arabic',
      ],
    }},

    // ── Mandarin Chinese (Edexcel A-level 9CN0) ─────────────────────────────────
    'Mandarin Chinese': { papers: {
      1: [
        'Paper 1 – Listening, Reading and Translation into English',
        'Reading and Listening Comprehension Across Set Themes',
        'Translation: Chinese to English',
      ],
      2: [
        'Paper 2 – Written Response to Works and Translation into Chinese',
        'Translation: English to Chinese',
        'Critical and Analytical Response to a Studied Literary Text or Film',
      ],
      3: [
        'Paper 3 – Speaking: Discussion of a Research Topic and General Conversation',
        'Speaking Assessment: Individual Research Project Presentation',
      ],
    }},

  }, // end Edexcel A-Level

  // ── OCR A-LEVEL ──────────────────────────────────────────────────────────────
  OCR: {

    // ── Mathematics A (OCR A-level H240) ────────────────────────────────────────
    'Mathematics': { papers: {
      1: [ // Pure Mathematics
        'Pure – Proof: Proof by Deduction, Contradiction, Exhaustion, Counter-Example',
        'Pure – Algebra: Indices, Surds, Quadratics, Simultaneous Equations, Inequalities',
        'Pure – Algebra: Polynomials, the Factor Theorem, Algebraic Division',
        'Pure – Coordinate Geometry: Lines, Circles, Tangents and Chords',
        'Pure – Functions and Graphs: Domain, Range, Composite and Inverse Functions',
        'Pure – Functions and Graphs: Transformations, Curve Sketching',
        'Pure – Sequences and Series: Binomial Expansion, Arithmetic and Geometric Series',
        'Pure – Trigonometry: Sine/Cosine Rule, Radians, Identities, Equations',
        'Pure – Exponentials and Logarithms: Laws, Graphs, Modelling',
        'Pure – Differentiation: Rules, Tangents, Normals, Stationary Points, Optimisation',
        'Pure – Integration: Standard Integrals, Area Under a Curve, Definite Integrals',
        'Pure – Numerical Methods: Iteration, Newton-Raphson',
        'Pure – Vectors: 2D and 3D Vectors, Vector Geometry',
        'Pure – Parametric Equations and Differentiation (Extension)',
      ],
      2: [ // Statistics
        'Statistics – Data Presentation and Interpretation: Location, Spread, the Large Data Set',
        'Statistics – Probability: Venn Diagrams, Tree Diagrams, Conditional Probability',
        'Statistics – Statistical Distributions: Binomial and Normal Distribution',
        'Statistics – Statistical Hypothesis Testing: Binomial and Correlation Context',
        'Statistics – Correlation and Regression: PMCC, Regression Lines',
      ],
      3: [ // Mechanics
        'Mechanics – Kinematics: SUVAT, Motion Graphs, Variable Acceleration',
        'Mechanics – Forces and Newton\'s Laws: F = ma, Connected Particles, Friction',
        'Mechanics – Moments: Rigid Bodies in Equilibrium',
        'Mechanics – Projectiles: Horizontal and Vertical Motion Combined',
      ],
    }},

    // ── Further Mathematics A (OCR A-level H245) ────────────────────────────────
    'Further Mathematics': { papers: {
      1: [
        'Pure Core – Complex Numbers: Argand Diagrams, Modulus-Argument Form, De Moivre\'s Theorem',
        'Pure Core – Matrices: Determinants, Inverses, Transformations, Systems of Equations',
        'Pure Core – Proof by Induction: Series, Divisibility, Matrices',
        'Pure Core – Series: Method of Differences, Maclaurin Series',
        'Pure Core – Hyperbolic Functions and Differential Equations',
        'Pure Core – Further Vectors: Lines and Planes',
      ],
      2: [
        'Pure Core Continued – Polar Coordinates, Further Calculus, Roots of Polynomials',
      ],
      3: [ // Optional
        'Minor Option A (choice): Further Statistics — Chi-Squared, Poisson Distribution',
        'Minor Option B (choice): Further Mechanics — Momentum, Circular Motion, SHM',
        'Minor Option C (choice): Discrete Mathematics — Algorithms, Graph Theory, Networks',
      ],
    }},

    // ── Biology A (OCR A-level H420) ────────────────────────────────────────────
    // FIX: originally mislabelled 'Biology A (Salters-Nuffield)' — Salters-Nuffield is an
    // Edexcel brand name (9BN0), not OCR's. This is the standard OCR Biology A spec (H420).
    // The context-led OCR equivalent is Biology B (Advancing Biology, H422), not this one.
    // Key kept as plain 'Biology' (matching subjects.js and common usage) even though OCR's
    // formal title is "Biology A".
    'Biology': { papers: {
      1: [
        'Module 1 – Development of Practical Skills in Biology',
        'Module 2 – Foundations in Biology: Cell Structure, Biological Molecules',
        'Module 2 – Foundations in Biology: Biological Membranes, Cell Division, Cellular Genetics',
        'Module 3 – Exchange and Transport: Gas Exchange, Transport in Animals and Plants',
        'Module 4 – Biodiversity, Evolution and Disease: Communicable Diseases, Immunity',
        'Module 4 – Biodiversity: Classification, Evolution, Biodiversity Indices',
        'Required Practicals: Microscopy, Osmosis, Dissection, Colorimetry',
      ],
      2: [
        'Module 5 – Communication, Homeostasis and Energy: Nervous System, Hormones',
        'Module 5 – Homeostasis: the Kidney, Blood Glucose Regulation',
        'Module 5 – Photosynthesis and Respiration',
        'Module 6 – Genetics, Evolution and Ecosystems: Inheritance, Populations',
        'Module 6 – Gene Technology: Recombinant DNA, PCR, Genetic Screening',
        'Module 6 – Ecosystems: Nutrient Cycles, Succession, Conservation',
        'Required Practicals: Enzyme Rate of Reaction, Population Sampling, Genetic Crosses',
      ],
      3: [
        'Paper 3 – Unified Biology: Synoptic Questions Across All Modules',
        'Practical Skills: All OCR Required Practicals — Analysis and Evaluation',
        'Extended Response: Scientific Communication and Data Interpretation',
      ],
    }},

    // ── Chemistry (OCR A-level H432, the "Chemistry A" spec) ──────────────────────
    'Chemistry': { papers: {
      1: [
        'Module 1 – Development of Practical Skills in Chemistry',
        'Module 2 – Foundations in Chemistry: Atoms, Compounds, Bonding, Quantitative Chemistry',
        'Module 3 – Periodic Table and Energy: Periodicity, Group Chemistry, Energetics, Kinetics, Equilibria',
        'Module 4 – Core Organic Chemistry: Nomenclature, Alkanes, Alkenes, Halogenoalkanes, Alcohols',
        'Required Practicals: Titration, Recrystallisation, Reflux, Distillation',
      ],
      2: [
        'Module 5 – Physical Chemistry and Transition Elements: Rate Equations, Equilibrium Constants',
        'Module 5 – Acids, Bases, pH, Buffers; Enthalpy and Entropy',
        'Module 5 – Redox and Electrode Potentials; Transition Metal Chemistry',
        'Module 6 – Organic Chemistry and Analysis: Aromatic Compounds, Carbonyls, Carboxylic Acids',
        'Module 6 – Nitrogen Compounds, Polymers, Organic Synthesis',
        'Module 6 – Chromatography, NMR and IR Spectroscopy',
        'Required Practicals: Rate of Reaction, Enthalpy, Redox Titration, Organic Preparation',
      ],
      3: [
        'Paper 3 – Unified Chemistry: Synoptic Questions',
        'Practical Skills: All OCR Required Practicals — Analysis, Evaluation, Error Discussion',
      ],
    }},

    // ── Physics (OCR A-level H556, the "Physics A" spec) ──────────────────────────
    'Physics': { papers: {
      1: [
        'Module 1 – Development of Practical Skills in Physics',
        'Module 2 – Foundations of Physics: Units, Scalars and Vectors, Estimation',
        'Module 3 – Forces and Motion: Kinematics, Newton\'s Laws, Momentum, Materials',
        'Module 3 – Work, Energy and Power; Density; Hooke\'s Law and the Young Modulus',
        'Module 4 – Electrons, Waves and Photons: Charge and Current, Circuits',
        'Module 4 – Waves: Superposition, Interference, Diffraction, Refraction',
        'Module 4 – The Photoelectric Effect, Wave-Particle Duality, Energy Levels',
        'Required Practicals: Determination of g, Resistivity, Investigating Waves',
      ],
      2: [
        'Module 5 – Newtonian World and Astrophysics: Circular Motion, SHM, Thermal Physics',
        'Module 5 – Gas Laws, Astrophysics — Telescopes, Stars, Cosmology',
        'Module 6 – Particles and Medical Physics: Capacitors, Electric and Magnetic Fields',
        'Module 6 – Electromagnetic Induction, Nuclear Physics, Medical Imaging',
        'Required Practicals: SHM, Capacitor Discharge, EM Induction, Radioactivity',
      ],
      3: [
        'Paper 3 – Unified Physics: Synoptic Questions Across All Modules',
        'Practical Skills: All OCR Required Practicals — Analysis and Evaluation',
      ],
    }},

    // ── Computer Science (OCR A-level H446) ─────────────────────────────────────
    'Computer Science': { papers: {
      1: [
        'Component 1 – Computer Systems: CPU Architecture, FDE Cycle, Processor Performance',
        'Component 1 – Memory, Storage, and Secondary Storage Technologies',
        'Component 1 – Networks: Topologies, Protocols, Layers, Network Security',
        'Component 1 – Systems Software: OS Functions, Translators, Utility Software',
        'Component 1 – Data Representation: Binary, Hex, Floating Point, Text, Image, Sound Encoding',
        'Component 1 – Data Structures: Stacks, Queues, Linked Lists, Trees, Hash Tables',
        'Component 1 – Boolean Algebra and Logic Circuits: De Morgan\'s Laws, Karnaugh Maps',
        'Component 1 – Databases: SQL, Normalisation, the Relational Model',
        'Component 1 – Big Data, AI and Ethical, Legal, Cultural Issues',
        'Component 1 – Theory of Computation: Turing Machines, FSMs, Regular Languages',
      ],
      2: [
        'Component 2 – Algorithms: Sorting (Bubble, Merge, Insertion, Quick), Searching (Linear, Binary)',
        'Component 2 – Algorithm Complexity and Big O Notation',
        'Component 2 – Programming Concepts: OOP, Procedural, Functional, Event-Driven Paradigms',
        'Component 2 – Programming Techniques: Recursion, Exception Handling, File Handling',
        'Component 2 – Computational Methods: Abstraction, Decomposition, Backtracking',
        'NEA – Programming Project (20% of A-Level): Analysis, Design, Development, Testing, Evaluation',
      ],
    }},

    // ── History A (OCR A-level H505) ────────────────────────────────────────────
    'History': { papers: {
      1: [
        'Unit Y — British Period Study (choice of one): England 1485–1558',
        'Unit Y — British Period Study (choice of one): England 1547–1660',
        'Unit Y — Non-British Period Study (choice of one): France 1814–70',
        'Unit Y — Non-British Period Study (choice of one): Russia 1894–1941',
      ],
      2: [
        'Unit X — Thematic Study and Historical Interpretations (choice of one): English Political Culture',
        'Unit X — Thematic Study (choice of one): War and British Society',
        'Unit X — Thematic Study (choice of one): Civil Rights in the USA',
        'Evaluating Historical Interpretations: Extract-Based Questions',
      ],
      3: [
        'Historical Investigation (NEA): Independent Personal Study (Approx. 4,000 Words)',
        'Choice of Enquiry Topic Not Otherwise Covered in Taught Units',
      ],
    }},

    // ── Geography (OCR A-level H481) ────────────────────────────────────────────
    'Geography': { papers: {
      1: [
        'Physical Systems: Landscape Systems — Coastal or Glaciated Landscapes',
        'Physical Systems: Earth\'s Life Support Systems — Water and Carbon Cycles',
        'Physical Systems Optional: Hot Desert Systems and Landscapes',
        'Physical Systems Optional: Coastal Systems and Landscapes',
      ],
      2: [
        'Human Interactions: Changing Spaces, Making Places',
        'Human Interactions: Global Connections — Trade, Migration, Human Rights',
        'Human Interactions: Global Connections — Power and Borders',
        'Human Interactions Optional: Regional and Global Resource Management',
      ],
      3: [
        'Geographical Debates (choice of two): Climate Change',
        'Geographical Debates (choice of two): Disease Dilemmas',
        'Geographical Debates (choice of two): Exploring Oceans',
        'Geographical Debates (choice of two): Future of Food',
        'NEA – Independent Investigation: Fieldwork-Based Geographical Enquiry',
      ],
    }},

    // ── Latin (OCR A-level H443) ────────────────────────────────────────────────
    'Latin': { papers: {
      1: [
        'Unseen Translation: Prose',
        'Unseen Translation: Verse',
        'Language: Full OCR A-Level Latin Grammar — All Declensions and Conjugations',
        'Language: Indirect Statement, Purpose and Result Clauses, Gerund/Gerundive',
      ],
      2: [
        'Prose Literature: Set Texts — Translation and Comprehension',
        'Verse Literature: Set Texts — Translation and Comprehension',
        'Literature: Critical and Contextual Analysis of Set Texts',
        'Literature: Roman History and Culture Related to Set Texts',
      ],
    }},

    // ── Classical Greek (OCR A-level H444) ──────────────────────────────────────
    'Classical Greek': { papers: {
      1: [
        'Unseen Translation: Prose',
        'Unseen Translation: Verse',
        'Language: Full OCR A-Level Greek Grammar — All Declensions and Conjugations',
        'Language: Indirect Statement, Participle Constructions, Optative Mood',
      ],
      2: [
        'Prose Literature: Set Texts — Translation and Comprehension',
        'Verse Literature: Set Texts — Translation and Comprehension',
        'Literature: Critical and Contextual Analysis of Set Texts',
        'Literature: Greek History and Culture Related to Set Texts',
      ],
    }},

  }, // end OCR A-Level

  // ── EDUQAS / WJEC A-LEVEL ────────────────────────────────────────────────────
  'Eduqas/WJEC': {

    // ── Mathematics (Eduqas A-level A420) ───────────────────────────────────────
    'Mathematics': { papers: {
      1: [ // Pure Mathematics A
        'Pure – Proof: Deduction, Contradiction, Exhaustion, Counter-Example',
        'Pure – Algebra and Functions: Indices, Surds, Quadratics, Simultaneous Equations',
        'Pure – Algebra: Polynomials, the Factor Theorem, Algebraic Fractions',
        'Pure – Coordinate Geometry: Straight Lines, Circles',
        'Pure – Sequences and Series: Binomial Expansion, Arithmetic and Geometric Series',
        'Pure – Trigonometry: Sine/Cosine Rule, Radians, Identities, Equations, Addition Formulae',
        'Pure – Exponentials and Logarithms',
        'Pure – Differentiation: Rules, Tangents, Normals, Stationary Points',
        'Pure – Differentiation: Parametric, Implicit, Connected Rates of Change',
        'Pure – Integration: Standard Integrals, by Substitution, by Parts',
        'Pure – Integration: Area Under a Curve, Differential Equations',
        'Pure – Numerical Methods: Iteration, Newton-Raphson',
        'Pure – Vectors: 2D and 3D, Vector Geometry',
        'Pure – Functions and Graphs: Transformations, Modulus Function, Composite/Inverse Functions',
      ],
      2: [ // Applied Mathematics A — Statistics
        'Statistics – Data Collection and Sampling Techniques',
        'Statistics – Data Presentation and Interpretation: Location, Spread, Outliers',
        'Statistics – Probability: Venn Diagrams, Tree Diagrams',
        'Statistics – Statistical Distributions: Binomial and Normal Distribution',
        'Statistics – Correlation and Regression: PMCC, Regression Lines',
        'Statistics – Statistical Hypothesis Testing',
      ],
      3: [ // Applied Mathematics A — Mechanics
        'Mechanics – Kinematics: SUVAT, Motion Graphs, Variable Acceleration',
        'Mechanics – Forces and Newton\'s Laws: F = ma, Connected Particles, Friction',
        'Mechanics – Moments: Rigid Bodies in Equilibrium',
        'Mechanics – Projectiles: Horizontal and Vertical Motion Combined',
      ],
    }},

    // ── Biology (Eduqas A-level) ────────────────────────────────────────────────
    'Biology': { papers: {
      1: [
        'Component 1 – Basic Biochemistry and Cell Organisation: Biological Molecules',
        'Component 1 – Cell Structure and Ultrastructure, Cell Division (Mitosis)',
        'Component 1 – Organisms Exchange Substances with Their Environment: Gas Exchange, Digestion',
        'Required Practicals: Microscopy, Biological Molecule Tests, Osmosis',
      ],
      2: [
        'Component 2 – Biodiversity and Physiology of Body Systems: Adaptation, Classification',
        'Component 2 – Homeostasis: Nervous and Hormonal Coordination',
        'Component 2 – Microbiology: Culturing Microorganisms, Pathogens and Disease',
        'Required Practicals: Enzyme Investigation, Microbial Culturing, Dissection',
      ],
      3: [
        'Component 3 – Environment and Genetics: Reproduction (Meiosis, Gametogenesis)',
        'Component 3 – Genetics: DNA, Protein Synthesis, Inheritance, Genetic Engineering',
        'Component 3 – Variation and Evolution: Natural Selection, Speciation, Hardy-Weinberg',
        'Component 3 – Ecology: Ecosystems, Energy Flow, Nutrient Cycles, Conservation',
      ],
      4: [
        'Practical Assessment: Internal Assessment of Practical Skills',
        'Practical Skills: Planning, Implementing, Analysing, Evaluating Investigations',
      ],
    }},

    // ── Chemistry (Eduqas A-level) ──────────────────────────────────────────────
    'Chemistry': { papers: {
      1: [
        'Component 1 – Formulae, Equations and Amounts of Substance: Moles, Titrations',
        'Component 1 – Atomic Structure and the Periodic Table: Electron Configuration, Periodicity',
        'Component 1 – Bonding and Structure: Ionic, Covalent, Metallic',
        'Component 1 – Energetics: Enthalpy Changes, Hess\'s Law, Calorimetry',
        'Component 1 – Introductory Organic Chemistry: Alkanes, Halogenoalkanes, Alkenes',
      ],
      2: [
        'Component 2 – Rates, Equilibrium and pH: Collision Theory, Rate Equations',
        'Component 2 – Equilibria: Le Chatelier\'s Principle, Kc, Kp',
        'Component 2 – Acids, Bases and Buffers: pH Calculations, Titration Curves',
        'Component 2 – Electrochemistry: Redox, Standard Electrode Potentials, Cells',
        'Component 2 – Further Organic Chemistry: Alcohols, Carboxylic Acids, Esters',
      ],
      3: [
        'Component 3 – Further Thermodynamics: Born-Haber Cycles, Entropy, Gibbs Free Energy',
        'Component 3 – Kinetics: Rate Equations, Orders of Reaction, the Rate-Determining Step',
        'Component 3 – Organic Synthesis: Multi-Step Pathways, Carbonyl Compounds, Aromatic Chemistry',
        'Component 3 – Spectroscopy: Mass Spectrometry, IR, NMR',
        'Component 3 – Transition Metal Chemistry: Complex Ions, Colour, Catalysis',
      ],
    }},

    // ── Physics (Eduqas A-level) ────────────────────────────────────────────────
    'Physics': { papers: {
      1: [
        'Component 1 – Motion, Energy and Matter: Kinematics, Dynamics, Energy',
        'Component 1 – Materials: Density, Hooke\'s Law, the Young Modulus',
        'Component 1 – Waves and Particle Nature of Light: Superposition, Photoelectric Effect',
        'Component 1 – Electricity: Circuits, Ohm\'s Law, EMF and Internal Resistance',
      ],
      2: [
        'Component 2 – Oscillations and the Gravitational Field: SHM, Damping, Resonance',
        'Component 2 – Gravitational Fields: Newton\'s Law, Orbits, Gravitational Potential',
        'Component 2 – Electromagnetism: Magnetic Fields, the Motor Effect, Electromagnetic Induction',
        'Component 2 – Nuclear and Particle Physics: Radioactive Decay, Half-Life, Particle Classification',
      ],
      3: [
        'Component 3 – Further Fields: Electric Fields, Capacitors, Charging and Discharging',
        'Component 3 – Radioactivity: Nuclear Fission and Fusion, Binding Energy',
        'Component 3 – Medical Physics: X-Rays, Ultrasound, Nuclear Medicine (Options)',
        'Component 3 – Practical Physics: Analysis of Experimental Data',
      ],
    }},

    // ── Geography (Eduqas A-level) ──────────────────────────────────────────────
    'Geography': { papers: {
      1: [
        'Component 1 – Changing Landscapes: Coastal Landscapes — Processes and Management',
        'Component 1 – Changing Landscapes: River Landscapes — Processes and Management',
        'Component 1 – Tectonic Landscapes and Hazards',
      ],
      2: [
        'Component 2 – Changing Places: Urbanisation and Urban Change',
        'Component 2 – Changing Places: Development and Globalisation',
        'Component 2 – Changing Places: Resource Management (Food, Water, Energy)',
      ],
      3: [
        'Component 3 – Global Systems: Globalisation, Global Governance, the Global Commons',
        'Component 3 – Global Governance: Human Rights, Migration, Environmental Governance',
      ],
      4: [
        'NEA – Independent Investigation: Fieldwork-Based Research and Written Report',
        'Fieldwork Skills: Data Collection, Presentation, Statistical Analysis',
      ],
    }},

    // ── English Literature (Eduqas A-level) ─────────────────────────────────────
    'English Literature': { papers: {
      1: [
        'Poetry: Comparative Analysis of Poetry Anthology (Pre-1900 and Post-1900)',
        'Poetry: Unseen Poetry Analysis',
      ],
      2: [
        'Drama: Pre-1900 Drama Set Text — Character, Theme, Context',
        'Drama: Post-1900 Drama Set Text — Character, Theme, Context',
      ],
      3: [
        'Prose: Comparative Study of Two Prose Texts from Different Periods',
        'Prose: Contextual Linking (AO3) and Critical Interpretation (AO5)',
      ],
      4: [
        'NEA – Independent Critical Study: Comparative Essay on Two Texts',
        'NEA: Personal Response and Independent Reading',
      ],
    }},

    // ── History (Eduqas A-level) ────────────────────────────────────────────────
    'History': { papers: {
      1: [
        'Unit 1 – Breadth Study (choice of one): e.g. Wales and England: Society and Economy c.1536–1900',
        'Unit 1 – Breadth Study (choice of one): e.g. Russia — Autocracy, Reform and Revolution 1855–1924',
      ],
      2: [
        'Unit 2 – Depth Study (choice of one): e.g. Germany: Democracy and Dictatorship 1918–45',
        'Unit 2 – Depth Study (choice of one): e.g. The USA 1929–2000',
      ],
      3: [
        'NEA – Historical Investigation: Independent Research and Extended Essay',
        'Historiography: Evaluating Different Historical Interpretations',
      ],
    }},

    // ── Film Studies (Eduqas A-level) ───────────────────────────────────────────
    // Confirmed live via the 2026 exam timetable — was listed in subjects.js's ALEVEL_SUBJECTS
    // but had zero topics.js content under any board. Eduqas/WJEC is a mainstream provider of this.
    'Film Studies': { papers: {
      1: [
        'Component 1 – Varieties of Film and Filmmaking: Hollywood Comparative Study (Different Time Periods)',
        'Component 1 – British Film Since 1995',
        'Component 1 – Global Film: European or Wider World Film',
      ],
      2: [
        'Component 2 – Global Filmmaking Perspectives: Documentary Film',
        'Component 2 – Silent Film — Some Documentary Considerations',
        'Component 2 – Experimental Film',
        'Component 2 – Film Movements: Auteur or Critical Study',
      ],
      3: [
        'Component 3 – Production: Non-Exam Assessment — Film or Screenplay',
        'Production: Evaluative Analysis of Own Practical Work',
      ],
    }},

  }, // end Eduqas/WJEC A-Level

  // ── CCEA A-LEVEL (Northern Ireland — linear, 4 units: AS1, AS2, A2 1, A2 2) ──
  CCEA: {

    // ── Mathematics (CCEA A-level) ──────────────────────────────────────────────
    'Mathematics': { papers: {
      1: [ // AS1 — Pure Mathematics
        'AS1 – Algebra: Indices, Surds, Quadratics, Simultaneous Equations',
        'AS1 – Coordinate Geometry: Straight Lines, Circles',
        'AS1 – Sequences and Series, the Binomial Expansion',
        'AS1 – Trigonometry: Sine/Cosine Rule, Identities, Equations',
        'AS1 – Differentiation and Integration (Core Techniques)',
      ],
      2: [ // AS2 — Applied Mathematics
        'AS2 – Statistics: Data Presentation, Probability, the Binomial Distribution',
        'AS2 – Statistics: Hypothesis Testing (Introductory)',
        'AS2 – Mechanics: Kinematics (SUVAT), Newton\'s Laws, Forces',
      ],
      3: [ // A2 1 — Further Pure Mathematics
        'A2 1 – Algebra: Partial Fractions, Further Binomial Expansion',
        'A2 1 – Trigonometry: Further Identities, Compound and Double Angle Formulae',
        'A2 1 – Differentiation: Chain, Product, Quotient Rule; Parametric and Implicit',
        'A2 1 – Integration: By Substitution, By Parts, Differential Equations',
        'A2 1 – Numerical Methods and Further Sequences',
      ],
      4: [ // A2 2 — Further Applied Mathematics
        'A2 2 – Statistics: Normal Distribution, Further Hypothesis Testing, Correlation',
        'A2 2 – Mechanics: Moments, Projectiles, Further Forces (Friction, Connected Particles)',
        'A2 2 – Mechanics: Work, Energy and Power',
      ],
    }},

    // ── Biology (CCEA A-level) ──────────────────────────────────────────────────
    'Biology': { papers: {
      1: [
        'AS1 – Molecules and Cells: Biological Molecules (Carbohydrates, Lipids, Proteins)',
        'AS1 – Cells: Cell Structure, Cell Membrane, Cell Division (Mitosis)',
        'AS1 – Enzymes: Structure, Mechanism, Factors Affecting Activity',
      ],
      2: [
        'AS2 – Organisms and Biodiversity: Exchange Surfaces, Transport in Animals and Plants',
        'AS2 – Biodiversity: Classification, Adaptation, Sampling Techniques',
        'AS2 – Practical Biology and Research Skills',
      ],
      3: [
        'A2 1 – Physiology, Coordination and Control: Homeostasis, Nervous System',
        'A2 1 – Hormonal Communication: Endocrine System, Blood Glucose Regulation',
        'A2 1 – Excretion, the Kidney and Osmoregulation',
      ],
      4: [
        'A2 2 – Biodiversity, Genetics and Ecosystems: DNA, Protein Synthesis, Inheritance',
        'A2 2 – Evolution: Natural Selection, Speciation, Genetic Variation',
        'A2 2 – Ecosystems: Energy Flow, Nutrient Cycles, Human Impact on Biodiversity',
      ],
    }},

    // ── Chemistry (CCEA A-level) ────────────────────────────────────────────────
    'Chemistry': { papers: {
      1: [
        'AS1 – Basic Concepts: Atomic Structure, Formulae and Equations, the Mole',
        'AS1 – Bonding: Ionic, Covalent, Metallic; Shapes of Molecules',
        'AS1 – Energetics: Enthalpy Changes, Hess\'s Law',
        'AS1 – Kinetics: Rate of Reaction, Collision Theory',
      ],
      2: [
        'AS2 – Further Physical and Inorganic Chemistry: Periodicity, Group Chemistry',
        'AS2 – Equilibrium: Le Chatelier\'s Principle, Kc',
        'AS2 – Introductory Organic Chemistry: Alkanes, Alkenes, Halogenoalkanes, Alcohols',
      ],
      3: [
        'A2 1 – Further Physical Chemistry: Rate Equations, Equilibrium Constants (Kp)',
        'A2 1 – Acids and Bases: pH, Buffers, Titration Curves',
        'A2 1 – Further Inorganic Chemistry: Transition Metals, Redox, Electrode Potentials',
      ],
      4: [
        'A2 2 – Further Organic Chemistry: Carbonyls, Carboxylic Acids, Aromatic Chemistry',
        'A2 2 – Organic Synthesis and Analysis: Multi-Step Synthesis, NMR, Chromatography',
        'A2 2 – Polymers and Nitrogen Compounds',
      ],
    }},

    // ── Physics (CCEA A-level) ──────────────────────────────────────────────────
    'Physics': { papers: {
      1: [
        'AS1 – Forces, Energy and Motion: Kinematics, Newton\'s Laws, Momentum',
        'AS1 – Materials: Density, Hooke\'s Law, the Young Modulus',
        'AS1 – Energy: Work, Power, Efficiency',
      ],
      2: [
        'AS2 – Electricity: Circuits, Ohm\'s Law, EMF, Internal Resistance',
        'AS2 – Waves: Properties, Superposition, Standing Waves, Refraction',
        'AS2 – The Photoelectric Effect and Wave-Particle Duality',
      ],
      3: [
        'A2 1 – Momentum and Energy; Thermal Physics: Ideal Gas Laws, Specific Heat Capacity',
        'A2 1 – Circular Motion and Simple Harmonic Motion',
        'A2 1 – Nuclear and Particle Physics: Radioactive Decay, Half-Life',
      ],
      4: [
        'A2 2 – Fields: Gravitational, Electric and Magnetic Fields',
        'A2 2 – Capacitors: Charging, Discharging, Energy Storage',
        'A2 2 – Particle Physics: the Standard Model, Medical Physics Applications',
      ],
    }},

    // ── History (CCEA A-level) ──────────────────────────────────────────────────
    'History': { papers: {
      1: [ // AS 1 — Change and Continuity
        'AS 1 – Change and Continuity (choice of one): Ireland Under the Union 1801–70',
        'AS 1 – Change and Continuity (choice of one): The Councils, Provinces and Kings of Britain 1350–1500',
        'AS 1 – Key Concepts: Political, Social and Economic Change Across the Period',
      ],
      2: [ // AS 2 — Dictatorship and Democracy
        'AS 2 – Dictatorship and Democracy (choice of one): Germany 1918–39 — the Rise of Nazism',
        'AS 2 – Dictatorship and Democracy (choice of one): Russia 1917–41 — Bolshevik Rule to Stalinism',
        'AS 2 – Dictatorship and Democracy (choice of one): The USA 1918–41 — Boom, Bust and the New Deal',
      ],
      3: [ // A2 1 — Breadth Study
        'A2 1 – Breadth Study (choice of one Modern Topic): International Relations 1945–2003',
        'A2 1 – Breadth Study (choice of one Modern Topic): Ireland and Britain 1900–25',
        'A2 1 – Historical Interpretations: Evaluating Historians\' Views Across the Breadth Period',
      ],
      4: [ // A2 2 — Historical Investigation
        'A2 2 – Historical Investigation (NEA): Independent Research and Extended Essay',
        'A2 2 – Historical Investigation: Selecting and Evaluating a Range of Primary and Secondary Sources',
        'A2 2 – Historical Investigation: Constructing a Structured Historical Argument',
      ],
    }},

    // ── Geography (CCEA A-level) ────────────────────────────────────────────────
    'Geography': { papers: {
      1: [
        'AS 1 – Physical Processes: River Environments and Fluvial Landforms',
        'AS 1 – Physical Processes: Coastal Environments and Landforms',
        'AS 1 – Physical Processes: Tectonic Processes and Hazards',
      ],
      2: [
        'AS 2 – Human Processes: Population Change and Migration',
        'AS 2 – Human Processes: Settlement Dynamics and Urban Change',
        'AS 2 – Human Processes: Development and Globalisation',
      ],
      3: [
        'A2 1 – Ecosystems and Sustainability: Ecosystem Processes, Human Impact',
        'A2 1 – Weather and Climate: Atmospheric Processes, Climate Change',
        'A2 1 – Planning Issues: Land Use Conflict, Sustainable Development',
      ],
      4: [
        'A2 2 – Fieldwork Investigation: Independent Research and Data Analysis',
        'A2 2 – Geographical Skills: Statistical, Cartographic and ICT Techniques',
      ],
    }},

  }, // end CCEA A-Level

} // end ALEVEL


// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// These match the function signatures expected throughout the app.
// Updated to resolve three levels: GCSE, AS-Level (new) and A-Level — each backed
// by its own fully independent top-level object, so a lookup for one level can
// never silently return data belonging to another.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolves a level string to its backing data object.
 * Recognised aliases:
 *   GCSE      -> 'GCSE' (default/fallback for anything unrecognised)
 *   AS-Level  -> 'AS-Level', 'ASLEVEL', 'AS_LEVEL', 'AS'
 *   A-Level   -> 'A-Level', 'ALEVEL', 'A_LEVEL'
 */
function resolveLevel(level) {
  if (level === 'AS-Level' || level === 'ASLEVEL' || level === 'AS_LEVEL' || level === 'AS') {
    return ASLEVEL
  }
  if (level === 'A-Level' || level === 'ALEVEL' || level === 'A_LEVEL') {
    return ALEVEL
  }
  return GCSE
}

const BOARD_ALIASES = {
  'Eduqas': 'Eduqas/WJEC',
  'WJEC':   'Eduqas/WJEC',
  'eduqas': 'Eduqas/WJEC',
  'wjec':   'Eduqas/WJEC',
}

/**
 * Returns a flat array of { name, paper, subjectId } for use in topic seeding,
 * confidence tracking, and the AI context builder.
 *
 * @param {string} board   - e.g. 'AQA', 'Edexcel', 'OCR', 'Eduqas/WJEC', 'CCEA'
 * @param {string} subject - e.g. 'Biology', 'Mathematics'
 * @param {string} level   - 'GCSE', 'AS-Level' (or 'ASLEVEL'), or 'A-Level' (or 'ALEVEL')
 */
export function getAllTopicsFlat(board, subject, level) {
  const levelData = resolveLevel(level)
  const boardKey = BOARD_ALIASES[board] || board

  const boardData = levelData[boardKey] || levelData['AQA'] || {}
  const subjectData = boardData[subject]

  if (!subjectData?.papers) return []

  const result = []
  for (const [paper, topics] of Object.entries(subjectData.papers)) {
    for (const name of topics) {
      result.push({ name, paper: Number(paper), subjectId: subject })
    }
  }
  return result
}

/**
 * Returns the raw papers object for a subject.
 * { 1: ['topic1', ...], 2: [...] }
 */
export function getTopicsForSubject(board, subject, level) {
  const levelData = resolveLevel(level)
  const boardKey = BOARD_ALIASES[board] || board

  const boardData = levelData[boardKey] || levelData['AQA'] || {}
  return boardData[subject]?.papers || {}
}

/**
 * Returns all subject names available for a given board and level.
 */
export function getSubjectsForBoard(board, level) {
  const levelData = resolveLevel(level)
  const boardKey = BOARD_ALIASES[board] || board
  return Object.keys(levelData[boardKey] || {})
}

/**
 * Returns all exam boards available for a given level (useful for populating
 * board-selection UI once AS-Level exists alongside GCSE and A-Level).
 */
export function getBoardsForLevel(level) {
  const levelData = resolveLevel(level)
  return Object.keys(levelData)
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────
export { GCSE, ASLEVEL, ALEVEL }
export default { GCSE, ASLEVEL, ALEVEL }
