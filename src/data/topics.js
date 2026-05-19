// src/data/topics.js
// ─────────────────────────────────────────────────────────────────────────────
// AUDIT NOTES (v2 — full rewrite)
// Sources:
//   Maths     → Corbettmaths topic list (corbettmaths.com/contents)
//   Sciences  → Cognito topic list (cognitoedu.org)
//   CS        → Official AQA/OCR/Edexcel specifications
//   Others    → Official exam board published specifications (2024–26)
//
// FIXES APPLIED vs v1:
//   - AQA Maths: Replaced vague paper-split with full Corbettmaths topic list
//   - AQA Further Maths: Expanded to match spec (now covers all 6 content areas)
//   - AQA Sciences: Expanded from Cognito; all required practicals named correctly
//   - AQA English Lit: Fixed — An Inspector Calls is Paper 1, poetry is Paper 2 ✓
//   - AQA Sociology: Removed duplicate key 'Sociology (AQA)' at line 1062
//   - OCR/Edexcel Maths: Replaced paper-number descriptions with actual topic lists
//   - WJEC/Eduqas: Merged (they share the same spec, Eduqas = England version of WJEC)
//   - Added: A-Level Latin, Classical Greek, Philosophy, Accounting, Photography
//   - Added: Statistics A-Level (AQA)
//   - Added: A-Level Mandarin, Arabic (AQA)
//   - Fixed: Edexcel GCSE Combined Science papers now labelled correctly (1–6)
//   - Fixed: All keys match GCSE_SUBJECTS / ALEVEL_SUBJECTS from subjects.js
// ─────────────────────────────────────────────────────────────────────────────

const GCSE = {

  // ── AQA ────────────────────────────────────────────────────────────────────
  AQA: {

    // ── Mathematics (Corbettmaths topic list) ─────────────────────────────────
    'Mathematics': { papers: {
      1: [ // Non-calculator — largely Number and Algebra heavy
        // NUMBER
        'Number – Integers: Order of Operations (BIDMAS)',
        'Number – Integers: Prime Factors, HCF and LCM',
        'Number – Integers: Powers and Roots',
        'Number – Integers: Standard Form',
        'Number – Fractions: Operations with Fractions',
        'Number – Fractions: Fraction of an Amount',
        'Number – Decimals: Rounding and Significant Figures',
        'Number – Percentages: Percentage of an Amount',
        'Number – Percentages: Percentage Change and Reverse Percentages',
        'Number – Percentages: Simple and Compound Interest',
        'Number – Ratio: Simplifying, Dividing in a Ratio, 1:n Form',
        'Number – Proportion: Direct and Inverse Proportion',
        'Number – Proportion: Best Buy and Exchange Rates',
        'Number – Surds: Simplifying, Rationalising the Denominator (Higher)',
        'Number – Bounds: Error Intervals and Bounds Calculations (Higher)',
        // ALGEBRA
        'Algebra – Expressions: Simplifying, Expanding Brackets, Factorising',
        'Algebra – Expressions: Difference of Two Squares, Completing the Square (Higher)',
        'Algebra – Formulae: Substituting into Formulae, Changing the Subject',
        'Algebra – Sequences: nth Term of Linear Sequences',
        'Algebra – Sequences: nth Term of Quadratic Sequences (Higher)',
        'Algebra – Sequences: Geometric Sequences and Special Sequences',
        'Algebra – Linear Equations: Solving One and Two-Step Equations',
        'Algebra – Quadratics: Factorising x² + bx + c',
        'Algebra – Quadratics: Quadratic Formula and Completing the Square (Higher)',
        'Algebra – Inequalities: Solving Linear Inequalities, Number Lines',
        'Algebra – Simultaneous Equations: Substitution and Elimination',
        'Algebra – Functions: Function Notation, Composite and Inverse Functions (Higher)',
        // RATIO AND PROPORTION
        'Ratio and Proportion – Speed, Distance, Time',
        'Ratio and Proportion – Density, Mass, Volume',
        'Ratio and Proportion – Pressure, Force, Area',
      ],
      2: [ // Calculator — Geometry, Graphs and Statistics
        // GRAPHS
        'Graphs – Coordinates and Midpoints',
        'Graphs – Straight Line Graphs: y = mx + c, Gradient and Intercept',
        'Graphs – Straight Line Graphs: Parallel and Perpendicular Lines (Higher)',
        'Graphs – Quadratic Graphs: Plotting and Interpreting',
        'Graphs – Cubic, Reciprocal and Exponential Graphs',
        'Graphs – Transformation of Graphs (Higher)',
        'Graphs – Real-Life Graphs: Distance-Time, Velocity-Time',
        'Graphs – Area Under a Curve and Gradient (Higher)',
        // GEOMETRY
        'Geometry – Angles: Angles in Triangles, Quadrilaterals and Polygons',
        'Geometry – Angles: Parallel Lines (Alternate, Corresponding, Co-interior)',
        'Geometry – Angles: Interior and Exterior Angles of Polygons',
        'Geometry – Properties of 2D Shapes: Triangles and Quadrilaterals',
        'Geometry – Properties of 3D Shapes: Prisms, Pyramids, Cylinders, Cones, Spheres',
        'Geometry – Perimeter and Area: Rectangles, Triangles, Parallelograms, Trapeziums',
        'Geometry – Perimeter and Area: Circles (Circumference and Area)',
        'Geometry – Perimeter and Area: Sectors and Arc Lengths',
        'Geometry – Volume and Surface Area: Cuboids, Prisms, Cylinders',
        'Geometry – Volume and Surface Area: Pyramids, Cones and Spheres (Higher)',
        'Geometry – Pythagoras Theorem',
        'Geometry – Trigonometry: SOH CAH TOA',
        'Geometry – Trigonometry: Exact Values (30°, 45°, 60°)',
        'Geometry – Trigonometry: Sine Rule and Cosine Rule (Higher)',
        'Geometry – Trigonometry: Area of Triangle using ½absinC (Higher)',
        'Geometry – Transformations: Reflection, Rotation, Translation, Enlargement',
        'Geometry – Transformations: Describing Transformations',
        'Geometry – Congruence and Similarity',
        'Geometry – Constructions: Bisectors, Loci',
        'Geometry – Vectors (Higher)',
        'Geometry – Circle Theorems (Higher)',
        // STATISTICS AND PROBABILITY
        'Statistics – Data: Averages (Mean, Median, Mode) and Range',
        'Statistics – Data: Frequency Tables and Grouped Frequency',
        'Statistics – Data: Bar Charts, Pie Charts, Frequency Polygons',
        'Statistics – Data: Scatter Graphs and Correlation',
        'Statistics – Data: Time Series and Moving Averages',
        'Statistics – Data: Cumulative Frequency and Box Plots',
        'Statistics – Data: Histograms (Frequency Density)',
        'Probability – Basic: Listing Outcomes, Sample Space Diagrams',
        'Probability – Combined Events: AND/OR Rules, Tree Diagrams',
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
        // 2. Algebra
        'Algebra – Basic Algebraic Processes: Associative, Commutative and Distributive Laws',
        'Algebra – Functions: Definition, Domain and Range',
        'Algebra – Composite and Inverse Functions',
        'Algebra – Expanding Brackets and Collecting Like Terms (including cubics)',
        'Algebra – Binomial Expansion: (a + b)ⁿ for Positive Integer n, Pascal\'s Triangle',
        'Algebra – Factorising: Quadratics, Cubics, Difference of Two Squares',
        'Algebra – Algebraic Fractions: Simplification, Addition, Subtraction, Multiplication, Division',
        'Algebra – Rearranging Formulae',
        'Algebra – Factor Theorem for Polynomials',
        'Algebra – Completing the Square',
        'Algebra – Graphs: Linear, Quadratic, Exponential (y = abˣ), Piecewise Functions',
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
        // Section B – Data Collection
        'Data Collection – Types of Data: Qualitative, Quantitative, Discrete, Continuous, Categorical, Ordinal, Bivariate',
        'Data Collection – Primary vs Secondary Data; Reliability and Validity',
        'Data Collection – Sampling Methods: Random, Systematic, Stratified, Quota, Opportunity/Convenience',
        'Data Collection – Questionnaire Design: Leading Questions, Open/Closed, Bias, Response Issues',
        'Data Collection – Identifying and Controlling Extraneous Variables; Control Groups',
        'Data Collection – Data Cleaning: Missing Data, Incorrect Formats, Non-Responses',
        // Section C – Data Presentation
        'Data Presentation – Tabulation, Tally, Pictogram, Pie Chart, Stem-and-Leaf (including Back-to-Back)',
        'Data Presentation – Bar Charts (Dual, Composite, Percentage); Frequency Polygons',
        'Data Presentation – Cumulative Frequency Graphs; Box Plots and Outliers',
        'Data Presentation – Histograms: Equal Width (Foundation) and Unequal Width with Frequency Density (Higher)',
        'Data Presentation – Population Pyramids, Choropleth Maps, Time Series Graphs',
        'Data Presentation – Comparative and Proportional Representations',
        'Data Presentation – Identifying Graphical Misrepresentation (Truncated Axes, Distorted Scales)',
        // Section D – Statistical Measures
        'Statistical Measures – Averages: Mode, Median, Arithmetic Mean (Ungrouped and Grouped)',
        'Statistical Measures – Averages (Higher): Weighted Mean, Geometric Mean, Mean Seasonal Variation',
        'Statistical Measures – Spread: Range, Quartiles, Interquartile Range, Percentiles',
        'Statistical Measures – Spread (Higher): Interpercentile Range, Interdecile Range, Standard Deviation',
        'Statistical Measures – Outliers: Identification by Inspection or Calculation (1.5×IQR / 3σ rule)',
        'Statistical Measures – Skewness: Identifying by Inspection (Foundation) and Calculation (Higher)',
        'Statistical Measures – Moving Averages (4-point); Seasonal Variation and Trend Lines',
        'Statistical Measures – Line of Best Fit: By Eye; Through Double Mean Point (x̄, ȳ); Regression Line (Higher)',
        'Statistical Measures – Index Numbers: Simple and Weighted; RPI, CPI, GDP',
        'Statistical Measures – Rates of Change: Birth Rate, Death Rate (formulae given)',
        'Statistical Measures – Spearman\'s Rank Correlation Coefficient: Calculation and Interpretation',
        'Statistical Measures – Pearson\'s PMCC: Interpretation (Higher)',
      ],
      2: [
        // Section E – Interpreting and Probability
        'Probability – Scale 0–1; Expected Frequency; Relative Risk and Absolute Risk',
        'Probability – Listing Outcomes: Two-Way Tables, Sample Space Diagrams, Tree Diagrams, Venn Diagrams',
        'Probability – Independent Events: P(A and B) = P(A) × P(B)',
        'Probability – Conditional Probability (Higher): P(B|A) = P(A and B) / P(A)',
        'Probability – Experimental vs Theoretical Probability; Relative Frequency',
        'Probability – Comparing Experimental Data with Theoretical Predictions',
        'Distributions – Binomial Distribution: Characteristics, Fixed Trials, Constant Probability (n ≤ 5)',
        'Distributions – Normal Distribution: Bell-Shape, Mean, 68-95-99.7 Rule, Standardising (Higher)',
        'Distributions – Quality Assurance: Action and Warning Lines; Control Charts',
        'Correlation – Positive, Negative, Zero Correlation; Causation vs Association',
        'Correlation – Interpolation and Extrapolation; Strength of Correlation',
        'Interpretation – Comparing Distributions Using Averages and Spread',
        'Interpretation – Seasonal and Cyclic Trends; Making Predictions from Trend Lines',
        'Interpretation – Estimating Population Characteristics from Sample Data',
        'Interpretation – Petersen Capture-Recapture Formula (Higher)',
        'Interpretation – Sample Size and Reliability; Distribution of Sample Means',
      ],
    }},

    // ── English Language ──────────────────────────────────────────────────────
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
      ],
      2: [ // Writers\' Viewpoints and Perspectives
        'Reading – Q1: Identify True Statements from Non-Fiction Source (AO1)',
        'Reading – Q2: Summary — Differences Between Two Non-Fiction Sources (AO1)',
        'Reading – Q3: Language Analysis — Writer\'s Methods in Non-Fiction Text (AO2)',
        'Reading – Q4: Compare Writers\' Viewpoints and Perspectives (AO3)',
        'Writing – Q5: Viewpoint and Argument Writing — Letter, Article, Speech, Essay (AO5/AO6)',
        'Writing Skills – Persuasive Techniques: DAFOREST, Rhetorical Devices',
        'Writing Skills – Register, Tone and Purpose (Formal and Informal)',
        'Writing Skills – Technical Accuracy: Grammar, Cohesion, Discourse Markers (AO6)',
      ],
    }},

    // ── English Literature ────────────────────────────────────────────────────
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
        // 19th Century Novel (most common: A Christmas Carol)
        'A Christmas Carol – Themes: Social Responsibility and Poverty',
        'A Christmas Carol – Themes: Redemption and Transformation',
        'A Christmas Carol – Themes: Memory and the Past',
        'A Christmas Carol – Character: Ebenezer Scrooge (Before and After)',
        'A Christmas Carol – Character: The Three Spirits',
        'A Christmas Carol – Context: Victorian England, the Poor Laws, Malthus',
        'A Christmas Carol – Language: Dickens\' Use of Gothic and Festive Imagery',
        // Modern Prose/Drama (most common: An Inspector Calls)
        'An Inspector Calls – Themes: Social Class and Responsibility',
        'An Inspector Calls – Themes: Gender, Age and Generational Conflict',
        'An Inspector Calls – Themes: Guilt and Blame',
        'An Inspector Calls – Character: Inspector Goole — Function and Symbolism',
        'An Inspector Calls – Character: Arthur and Sybil Birling (Older Generation)',
        'An Inspector Calls – Character: Sheila and Eric Birling (Younger Generation)',
        'An Inspector Calls – Character: Eva Smith — Voice of the Oppressed',
        'An Inspector Calls – Context: 1912 Setting vs 1945 Audience — Dramatic Irony',
        'An Inspector Calls – Structure: Cliff-hangers, Time Frame, Three Unities',
        // Essay Technique
        'Essay Technique: Embedding Quotations and Zooming In on Language',
        'Essay Technique: Exploring Multiple Interpretations (AO3)',
        'Essay Technique: Linking Context to Meaning (AO3)',
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
        'Power and Conflict – Kamikaze (Hichiro/Garland): Conflict, Honour, Sacrifice',
        'Power and Conflict – Checking Out Me History (Agard): Identity, Colonial Power',
        'Poetry Skills – Comparing Two Poems: Theme, Method, Effect',
        'Unseen Poetry – Analysing an Unfamiliar Poem (Structure, Language, Tone)',
        'Unseen Poetry – Comparing Two Unseen Poems',
      ],
    }},

    // ── Biology (Cognito topic list) ──────────────────────────────────────────
    'Biology': { papers: {
      1: [
        // B1 Cell Biology
        'B1 – Cell Structure: Eukaryotic and Prokaryotic Cells',
        'B1 – Cell Structure: Differences Between Animal, Plant and Bacterial Cells',
        'B1 – Cell Structure: Specialised Cells (Sperm, Egg, Red Blood, Nerve)',
        'B1 – Microscopy: Light and Electron Microscopes, Magnification Calculations',
        'B1 – Cell Division: Mitosis and the Cell Cycle',
        'B1 – Cell Division: Stem Cells (Embryonic, Adult, Therapeutic Cloning)',
        'B1 – Transport in Cells: Diffusion',
        'B1 – Transport in Cells: Osmosis (including calculations)',
        'B1 – Transport in Cells: Active Transport',
        // B2 Organisation
        'B2 – Organisation: Levels of Organisation (Cell → Organ System)',
        'B2 – Digestion: The Human Digestive System and Digestive Enzymes',
        'B2 – Digestion: Food Tests (Benedict\'s, Biuret, Iodine, Ethanol Emulsion)',
        'B2 – Heart: Structure of the Heart, Coronary Arteries',
        'B2 – Heart: The Cardiac Cycle, Heart Rate',
        'B2 – Blood: Blood Vessels (Arteries, Veins, Capillaries)',
        'B2 – Blood: Components of Blood and Their Functions',
        'B2 – Health and Disease: Communicable and Non-Communicable Disease',
        'B2 – Health and Disease: Risk Factors for Cancer and Cardiovascular Disease',
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
        // B4 Bioenergetics
        'B4 – Photosynthesis: The Equation and Rate-Limiting Factors',
        'B4 – Photosynthesis: Light Intensity, CO₂ Concentration, Temperature',
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
        'B5 – Temperature Regulation: Sweating, Vasodilation/Vasoconstriction',
        'B5 – Plant Hormones: Auxin and Phototropism, Gibberellins, Ethene',
        // B6 Inheritance, Variation and Evolution
        'B6 – Reproduction: Sexual and Asexual Reproduction',
        'B6 – DNA: Structure of DNA, Genes and Chromosomes',
        'B6 – DNA: Protein Synthesis (Transcription and Translation — Higher)',
        'B6 – Inheritance: Monohybrid Crosses, Punnett Squares',
        'B6 – Inheritance: Dominant and Recessive Alleles, Genotype and Phenotype',
        'B6 – Inheritance: Sex Determination and Sex-Linked Traits (Higher)',
        'B6 – Inheritance: Inherited Disorders (Cystic Fibrosis, Polydactyly)',
        'B6 – Variation: Genetic and Environmental Variation, Mutations',
        'B6 – Evolution: Natural Selection and Darwin\'s Theory',
        'B6 – Evolution: Selective Breeding and Genetic Engineering',
        'B6 – Evolution: Evidence for Evolution (Fossil Record, Antibiotic Resistance)',
        'B6 – Classification: Binomial Nomenclature, Kingdoms and the 3-Domain System',
        // B7 Ecology
        'B7 – Ecosystems: Abiotic and Biotic Factors',
        'B7 – Ecosystems: Feeding Relationships, Food Chains and Webs',
        'B7 – Ecosystems: Levels of Organisation (Individual → Ecosystem)',
        'B7 – Material Cycles: Carbon Cycle',
        'B7 – Material Cycles: Water Cycle',
        'B7 – Material Cycles: Nitrogen Cycle',
        'B7 – Population Dynamics: Predator-Prey Relationships',
        'B7 – Biodiversity: Threats and Conservation Methods',
        'B7 – Food Production: Intensive Farming vs Organic Methods',
        'B7 – Food Production: Biological Control and Fungal Protein (Mycoprotein)',
        // Required Practicals
        'Required Practical 7 – Reaction Time: Effect of a Factor on Reaction Time',
        'Required Practical 8 – Plant Tropisms: Effect of Light/Gravity on Plant Growth',
        'Required Practical 9 – Quadrats and Transects: Estimating Population Size',
      ],
    }},

    // ── Chemistry (Cognito topic list) ───────────────────────────────────────
    'Chemistry': { papers: {
      1: [
        // C1 Atomic Structure
        'C1 – Atomic Structure: History of the Atom (Dalton to Bohr)',
        'C1 – Atomic Structure: Sub-atomic Particles (Protons, Neutrons, Electrons)',
        'C1 – Atomic Structure: Atomic Number, Mass Number and Isotopes',
        'C1 – Atomic Structure: Electronic Structure (Shells and Sub-shells — Higher)',
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
        // C3 Quantitative Chemistry
        'C3 – Quantitative Chemistry: Relative Atomic Mass (Ar) and Relative Formula Mass (Mr)',
        'C3 – Quantitative Chemistry: Moles and the Avogadro Constant',
        'C3 – Quantitative Chemistry: Empirical and Molecular Formulae',
        'C3 – Quantitative Chemistry: Mole Calculations from Equations',
        'C3 – Quantitative Chemistry: Limiting Reagents and Excess',
        'C3 – Quantitative Chemistry: Percentage Yield and Atom Economy',
        'C3 – Quantitative Chemistry: Concentration of Solutions (mol/dm³)',
        'C3 – Quantitative Chemistry: Ideal Gas Volume Calculations (Higher)',
        // C4 Chemical Changes
        'C4 – Chemical Changes: Metal Reactivity Series',
        'C4 – Chemical Changes: Extraction of Metals (Reduction, Electrolysis)',
        'C4 – Chemical Changes: Oxidation and Reduction (Redox)',
        'C4 – Chemical Changes: Reactions of Acids with Metals, Bases and Carbonates',
        'C4 – Chemical Changes: Neutralisation and Salt Preparation',
        'C4 – Chemical Changes: pH Scale, Strong and Weak Acids',
        'C4 – Chemical Changes: Electrolysis — Molten Ionic Compounds',
        'C4 – Chemical Changes: Electrolysis — Aqueous Solutions (including brine)',
        // C5 Energy Changes
        'C5 – Energy Changes: Exothermic and Endothermic Reactions',
        'C5 – Energy Changes: Reaction Profiles and Activation Energy',
        'C5 – Energy Changes: Bond Energies — Calculating Energy Change',
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
        'C6 – Rate of Reaction: Rate Calculations from Graphs',
        'C6 – Rate of Reaction: Catalysts and Energy Profiles',
        // C6 Equilibrium
        'C6 – Equilibrium: Reversible Reactions',
        'C6 – Equilibrium: Dynamic Equilibrium and Le Chatelier\'s Principle',
        'C6 – Equilibrium: The Haber Process (Conditions and Compromise)',
        'C6 – Equilibrium: The Contact Process (Higher)',
        // C7 Organic Chemistry
        'C7 – Organic Chemistry: Hydrocarbons — Alkanes (Structure, Properties)',
        'C7 – Organic Chemistry: Fractional Distillation of Crude Oil',
        'C7 – Organic Chemistry: Cracking (Thermal and Catalytic)',
        'C7 – Organic Chemistry: Alkenes (Unsaturation Test, Addition Reactions)',
        'C7 – Organic Chemistry: Alcohols (Uses, Oxidation to Carboxylic Acids)',
        'C7 – Organic Chemistry: Carboxylic Acids (Reactions with Carbonates)',
        'C7 – Organic Chemistry: Esters (Formation and Uses)',
        'C7 – Organic Chemistry: Addition Polymers (from Alkenes)',
        'C7 – Organic Chemistry: Condensation Polymers (Nylon, Polyesters) — Higher',
        // C8 Chemical Analysis
        'C8 – Chemical Analysis: Purity and Formulations',
        'C8 – Chemical Analysis: Paper and Thin-Layer Chromatography (Rf Values)',
        'C8 – Chemical Analysis: Identification of Gases (H₂, O₂, CO₂, Cl₂, NH₃)',
        'C8 – Chemical Analysis: Flame Tests (Li, Na, K, Ca, Cu)',
        'C8 – Chemical Analysis: Ion Tests (Precipitation of Metal Ions, Halide Ions)',
        'C8 – Chemical Analysis: Gas Chromatography (Higher)',
        // C9 Atmosphere
        'C9 – Atmosphere: Evolution of the Earth\'s Atmosphere',
        'C9 – Atmosphere: The Greenhouse Effect and Enhanced Greenhouse Effect',
        'C9 – Atmosphere: Climate Change — Evidence and Impacts',
        'C9 – Atmosphere: Atmospheric Pollutants (CO, NOₓ, SO₂, Particulates)',
        'C9 – Atmosphere: Carbon Footprints and Reducing Emissions',
        // C10 Using Resources
        'C10 – Using Resources: Finite and Renewable Resources',
        'C10 – Using Resources: Water Treatment and Purification',
        'C10 – Using Resources: Corrosion of Iron (Rusting) and Prevention',
        'C10 – Using Resources: Alloys and Their Properties',
        'C10 – Using Resources: Life Cycle Assessment (LCA)',
        'C10 – Using Resources: The Haber Process and Fertilisers',
        'C10 – Using Resources: Potable Water vs Waste Water Treatment (Higher)',
        // Required Practicals
        'Required Practical 5 – Rate of Reaction: Disappearing Cross (Thiosulfate + HCl)',
        'Required Practical 6 – Rate of Reaction: Gas Volume (Marble Chips + HCl)',
        'Required Practical 7 – Chromatography',
        'Required Practical 8 – Identifying Ions (Flame Tests and Precipitates)',
      ],
    }},

    // ── Physics (Cognito topic list) ──────────────────────────────────────────
    'Physics': { papers: {
      1: [
        // P1 Energy
        'P1 – Energy: Energy Stores and Energy Transfers',
        'P1 – Energy: Kinetic Energy (KE = ½mv²)',
        'P1 – Energy: Gravitational Potential Energy (GPE = mgh)',
        'P1 – Energy: Elastic Potential Energy (EPE = ½ke²)',
        'P1 – Energy: Specific Heat Capacity',
        'P1 – Energy: Power and Efficiency',
        'P1 – Energy: Reducing Energy Transfers (Insulation)',
        'P1 – Energy: Renewable and Non-Renewable Energy Resources',
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
        // P3 Particle Model of Matter
        'P3 – Particle Model: States of Matter and Density',
        'P3 – Particle Model: Changes of State and Specific Latent Heat',
        'P3 – Particle Model: Internal Energy',
        'P3 – Particle Model: Gas Pressure and Temperature',
        'P3 – Particle Model: Pressure-Volume Relationship (Boyle\'s Law — Higher)',
        // P4 Atomic Structure
        'P4 – Atomic Structure: The History of the Atom (Plum Pudding to Nuclear)',
        'P4 – Atomic Structure: Atomic and Mass Number, Isotopes',
        'P4 – Atomic Structure: Types of Radioactive Decay (α, β, γ)',
        'P4 – Atomic Structure: Properties of Alpha, Beta and Gamma Radiation',
        'P4 – Atomic Structure: Nuclear Equations',
        'P4 – Atomic Structure: Half-Life Calculations',
        'P4 – Atomic Structure: Hazards and Uses of Radiation',
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
        'P5 – Forces: Momentum and Conservation of Momentum (Higher)',
        'P5 – Forces: Impact Forces and Safety (Higher)',
        // P6 Waves
        'P6 – Waves: Properties of Waves (Speed, Frequency, Wavelength, Amplitude)',
        'P6 – Waves: Transverse and Longitudinal Waves',
        'P6 – Waves: Wave Speed Equation (v = fλ)',
        'P6 – Waves: Reflection, Refraction (Snell\'s Law — Higher)',
        'P6 – Waves: Total Internal Reflection (Higher)',
        'P6 – Waves: Sound Waves, Ultrasound and Infrasound',
        'P6 – Waves: Electromagnetic Spectrum — Properties and Uses',
        'P6 – Waves: Hazards of EM Radiation',
        'P6 – Waves: Lenses and Ray Diagrams (Higher)',
        // P7 Magnetism
        'P7 – Magnetism: Permanent and Induced Magnets, Magnetic Fields',
        'P7 – Magnetism: The Motor Effect (F = BIL)',
        'P7 – Magnetism: Fleming\'s Left-Hand Rule',
        'P7 – Magnetism: Electric Motors',
        'P7 – Magnetism: Loudspeakers (application of the motor effect)',
        'P7 – Magnetism: Electromagnetic Induction (Faraday\'s Law)',
        'P7 – Magnetism: Generators (AC and DC)',
        'P7 – Magnetism: Transformers (Turns Ratio, Efficiency)',
        // P8 Space
        'P8 – Space Physics: The Solar System (Planets, Moons, Comets)',
        'P8 – Space Physics: Life Cycle of a Star',
        'P8 – Space Physics: Orbital Motion (Gravity and Speed)',
        'P8 – Space Physics: The Universe — Red-Shift and the Big Bang (Higher)',
        // Required Practicals
        'Required Practical 5 – Investigating Waves (Ripple Tank or Slinky)',
        'Required Practical 6 – Investigating Infrared Radiation (Leslie Cube)',
      ],
    }},

    // ── Combined Science: Trilogy ─────────────────────────────────────────────
    'Combined Science: Trilogy': { papers: {
      1: [ // Biology Paper 1
        'B1 – Cell Structure: Animal, Plant and Bacterial Cells',
        'B1 – Microscopy: Magnification Calculations',
        'B1 – Cell Division: Mitosis',
        'B1 – Stem Cells',
        'B1 – Transport: Diffusion, Osmosis, Active Transport',
        'B2 – Organisation: Digestive System and Enzymes',
        'B2 – Heart and Blood Vessels',
        'B2 – Non-Communicable Disease: Cancer and Cardiovascular',
        'B3 – Infection: Bacteria, Viruses, Protists, Fungi as Pathogens',
        'B3 – Preventing and Treating Disease: Vaccines, Antibiotics',
        'B4 – Photosynthesis: Rate and Limiting Factors',
        'B4 – Respiration: Aerobic and Anaerobic',
        'Required Practicals: Osmosis, Food Tests, Photosynthesis',
      ],
      2: [ // Biology Paper 2
        'B5 – Nervous System: CNS, Reflex Arc',
        'B5 – Hormones: Endocrine System, Blood Glucose, Diabetes',
        'B5 – Reproductive Hormones and Contraception',
        'B5 – Kidneys: Filtration and Osmoregulation',
        'B6 – DNA Structure, Inheritance, Punnett Squares',
        'B6 – Variation and Evolution',
        'B6 – Genetic Engineering',
        'B7 – Ecosystems: Abiotic and Biotic Factors',
        'B7 – Material Cycles: Carbon and Nitrogen Cycle',
        'B7 – Biodiversity and Conservation',
        'Required Practicals: Quadrats, Reaction Time',
      ],
      3: [ // Chemistry Paper 1
        'C1 – Atomic Structure and Isotopes',
        'C1 – Electronic Structure',
        'C1 – Periodic Table: Group 1, Group 7, Transition Metals',
        'C2 – Ionic, Covalent and Metallic Bonding',
        'C2 – Giant Covalent Structures (Diamond, Graphite)',
        'C2 – Polymers and Nanoparticles',
        'C3 – Moles, Formulae, Yield and Atom Economy',
        'C4 – Reactivity Series, Acid Reactions, Electrolysis',
        'C5 – Exothermic and Endothermic Reactions, Bond Energies',
        'Required Practicals: Titration, Electrolysis, Temperature Change',
      ],
      4: [ // Chemistry Paper 2
        'C6 – Rate of Reaction: Factors and Collision Theory',
        'C6 – Equilibrium and Le Chatelier\'s Principle, Haber Process',
        'C7 – Crude Oil, Alkanes, Alkenes, Alcohols',
        'C8 – Chromatography, Flame Tests, Ion Tests',
        'C9 – Earth\'s Atmosphere, Greenhouse Effect, Pollution',
        'C10 – Water Treatment, Corrosion, LCA',
        'Required Practicals: Rate of Reaction, Chromatography',
      ],
      5: [ // Physics Paper 1
        'P1 – Energy: Stores, Transfers, KE, GPE, SHC, Power, Efficiency',
        'P1 – Energy Resources: Renewable vs Non-Renewable',
        'P2 – Electricity: Circuits, Ohm\'s Law, Series and Parallel, I-V Graphs',
        'P2 – Electricity: Power, National Grid, Transformers',
        'P3 – Particle Model: Density, Changes of State, Latent Heat, Gas Pressure',
        'P4 – Atomic Structure: Radioactivity, Half-Life, Fission and Fusion',
        'Required Practicals: SHC, Resistance, I-V Characteristics, Density',
      ],
      6: [ // Physics Paper 2
        'P5 – Forces: Newton\'s Laws, Stopping Distance, Work Done, Elasticity',
        'P5 – Forces: Distance-Time Graphs, Velocity-Time Graphs, Momentum',
        'P6 – Waves: Properties, Transverse/Longitudinal, EM Spectrum, Reflection',
        'P7 – Magnetism: Motor Effect, Electromagnetic Induction, Transformers',
        'Required Practicals: Waves, Infrared Radiation',
      ],
    }},

    // ── Combined Science: Synergy ─────────────────────────────────────────────
    'Combined Science: Synergy': { papers: {
      1: [ // Chemistry and Physics Paper 1
        'Atomic Structure, Bonding and the Periodic Table',
        'Quantitative Chemistry: Moles, Yield, Concentration',
        'Energy Changes in Chemistry: Exothermic, Endothermic, Bond Energies',
        'Rate of Reaction: Factors, Collision Theory, Equilibrium',
        'Motion, Forces and Conservation of Energy',
        'Waves: Properties and the EM Spectrum',
        'Magnetism and Electromagnetism',
      ],
      2: [ // Biology and Chemistry Paper 2
        'Cell Biology: Structure, Microscopy, Mitosis, Transport',
        'Infection and Response: Pathogens, Immunity, Vaccines',
        'Bioenergetics: Photosynthesis and Respiration',
        'Organic Chemistry: Hydrocarbons, Polymers, Alcohols',
        'Chemical Analysis: Chromatography, Flame Tests',
        'Earth\'s Atmosphere and Resources',
      ],
      3: [ // Physics and Chemistry Paper 3
        'Particle Model and Atomic Structure',
        'Radioactivity: Types, Half-Life, Fission and Fusion',
        'Energy Resources and Electricity',
        'Further Rate of Reaction and Equilibrium',
        'Forces: Newton\'s Laws, Stopping Distance, Momentum',
      ],
      4: [ // Biology Paper 3
        'Ecosystems: Abiotic and Biotic Factors, Food Chains, Biodiversity',
        'Material Cycles: Carbon, Water, Nitrogen',
        'Homeostasis: Nervous System, Hormones, Kidneys',
        'Inheritance, Variation and Evolution',
        'Ecology and Food Production',
      ],
    }},

    // ── Computer Science (AQA J276) ───────────────────────────────────────────
    'Computer Science': { papers: {
      1: [
        '1.1 – Systems Architecture: Von Neumann Architecture (CPU, Memory, I/O)',
        '1.1 – Systems Architecture: Components of the CPU (ALU, CU, Registers, Cache)',
        '1.1 – Systems Architecture: The Fetch-Decode-Execute Cycle',
        '1.1 – Systems Architecture: Performance Factors (Clock Speed, Cache, Cores)',
        '1.1 – Systems Architecture: Embedded Systems',
        '1.2 – Memory and Storage: RAM vs ROM',
        '1.2 – Memory and Storage: Virtual Memory',
        '1.2 – Memory and Storage: Secondary Storage Types (HDD, SSD, Optical)',
        '1.2 – Memory and Storage: Data Units (Bits, Bytes, KB, MB, GB, TB, PB)',
        '1.2 – Memory and Storage: Binary, Denary and Hexadecimal Conversion',
        '1.2 – Memory and Storage: Binary Addition and Overflow',
        '1.2 – Memory and Storage: Two\'s Complement (Higher)',
        '1.2 – Memory and Storage: Character Encoding (ASCII and Unicode)',
        '1.2 – Memory and Storage: Representing Images (Resolution, Colour Depth)',
        '1.2 – Memory and Storage: Representing Sound (Sample Rate, Bit Depth)',
        '1.2 – Memory and Storage: Data Compression (Lossy vs Lossless, RLE)',
        '1.3 – Networks: Types of Network (LAN, WAN)',
        '1.3 – Networks: Network Topologies (Star, Mesh, Bus)',
        '1.3 – Networks: Wired vs Wireless (Ethernet, Wi-Fi, Bluetooth)',
        '1.3 – Networks: Protocols and the TCP/IP Stack (HTTP, HTTPS, FTP, SMTP, IMAP)',
        '1.3 – Networks: Network Hardware (Router, Switch, NIC, WAP)',
        '1.3 – Networks: The Internet and the World Wide Web (DNS, Hosting)',
        '1.4 – Network Security: Forms of Attack (Phishing, Malware, Brute Force, SQL Injection, DDoS)',
        '1.4 – Network Security: Preventing Attacks (Firewalls, Encryption, Two-Factor Auth)',
        '1.5 – Systems Software: Operating System Functions',
        '1.5 – Systems Software: Utility Software (Encryption, Defragmentation, Backup)',
        '1.6 – Ethical and Legal Issues: The Computer Misuse Act 1990',
        '1.6 – Ethical and Legal Issues: The Data Protection Act 2018 / GDPR',
        '1.6 – Ethical and Legal Issues: Environmental Impact of Technology',
        '1.6 – Ethical and Legal Issues: Privacy and Surveillance Issues',
      ],
      2: [
        '2.1 – Algorithms: Computational Thinking (Decomposition, Abstraction, Algorithmic Thinking)',
        '2.1 – Algorithms: Representing Algorithms (Pseudocode, Flowcharts)',
        '2.1 – Algorithms: Searching — Linear Search',
        '2.1 – Algorithms: Searching — Binary Search',
        '2.1 – Algorithms: Sorting — Bubble Sort',
        '2.1 – Algorithms: Sorting — Merge Sort',
        '2.1 – Algorithms: Sorting — Insertion Sort',
        '2.2 – Programming Fundamentals: Variables, Constants, Data Types',
        '2.2 – Programming Fundamentals: Input, Output and Casting',
        '2.2 – Programming Fundamentals: Sequence, Selection (if, elif, else)',
        '2.2 – Programming Fundamentals: Iteration (for loops, while loops)',
        '2.2 – Programming Fundamentals: String Manipulation (slicing, methods)',
        '2.2 – Programming Fundamentals: Arrays and Lists',
        '2.2 – Programming Fundamentals: 2D Arrays',
        '2.2 – Programming Fundamentals: File Handling (read, write, open, close)',
        '2.2 – Programming Fundamentals: Subroutines (Procedures and Functions)',
        '2.2 – Programming Fundamentals: Local vs Global Variables',
        '2.3 – Producing Robust Programs: Defensive Design (Input Validation, Sanitisation)',
        '2.3 – Producing Robust Programs: Testing (Normal, Boundary, Erroneous Data)',
        '2.3 – Producing Robust Programs: Syntax Errors vs Logic Errors vs Runtime Errors',
        '2.4 – Boolean Logic: AND, OR, NOT Gates',
        '2.4 – Boolean Logic: Truth Tables',
        '2.4 – Boolean Logic: Logic Circuit Diagrams',
        '2.4 – Boolean Logic: Boolean Expressions',
        '2.5 – Programming Languages: High-Level vs Low-Level Languages',
        '2.5 – Programming Languages: Translators (Compiler, Interpreter, Assembler)',
        '2.5 – IDEs: Features (Editor, Debugger, Syntax Highlighting, Auto-Complete)',
      ],
    }},

    // ── Geography ────────────────────────────────────────────────────────────
    'Geography': { papers: {
      1: [
        '1A – Tectonic Hazards: Structure of the Earth, Plate Boundaries',
        '1A – Tectonic Hazards: Earthquakes — Causes, Effects and Responses',
        '1A – Tectonic Hazards: Volcanoes — Causes, Effects and Responses',
        '1A – Tectonic Hazards: Living with Tectonic Hazards',
        '1A – Atmospheric Hazards: Global Atmospheric Circulation',
        '1A – Atmospheric Hazards: Tropical Storms — Formation, Structure, Effects',
        '1A – Atmospheric Hazards: Reducing the Risk of Tropical Storms',
        '1A – Climate Change: Evidence of Climate Change',
        '1A – Climate Change: Causes (Natural and Human)',
        '1A – Climate Change: Effects and Managing Climate Change',
        '1B – The Living World: Small-Scale Ecosystems (British Woodlands)',
        '1B – The Living World: Large-Scale Ecosystems (Biomes)',
        '1B – Tropical Rainforests: Characteristics, Interdependence, Deforestation',
        '1B – Tropical Rainforests: Management and Sustainability',
        '1B – Hot Deserts: Characteristics, Opportunities, Challenges',
        '1B – Cold Environments: Characteristics, Opportunities, Challenges',
        '1C – Coastal Landscapes: Weathering and Mass Movement',
        '1C – Coastal Landscapes: Erosional Processes and Landforms',
        '1C – Coastal Landscapes: Depositional Processes and Landforms',
        '1C – Coastal Landscapes: Coastal Management (Hard and Soft Engineering)',
        '1C – River Landscapes: Erosional Processes and Landforms',
        '1C – River Landscapes: Depositional Processes and Landforms',
        '1C – River Landscapes: Flood Management Strategies',
        '1C – Glacial Landscapes: Glacial Processes and Landforms',
        '1C – Glacial Landscapes: Economic Uses and Challenges',
      ],
      2: [
        '2A – Urban Issues: Global Urbanisation Trends',
        '2A – Urban Issues: UK City — Growth, Inequality, Regeneration',
        '2A – Urban Issues: Developing World City — Growth, Challenges, Management',
        '2A – Urban Issues: Sustainable Urban Living',
        '2B – Changing Economic World: Ways of Measuring Development (GNI, HDI, Birth/Death Rate)',
        '2B – Changing Economic World: Uneven Development — Causes and Consequences',
        '2B – Changing Economic World: Strategies to Reduce the Development Gap',
        '2B – Changing Economic World: LIC/NEE Case Study (Nigeria)',
        '2B – Changing Economic World: UK\'s Changing Economy (Post-Industrial)',
        '2C – Resource Management Overview: Food, Water and Energy',
        '2C – Food Resources: Demand, Supply, Food Insecurity, Strategies',
        '2C – Water Resources: Demand, Supply, Water Insecurity, Strategies',
        '2C – Energy Resources: Production, Demand, Energy Insecurity, Strategies',
      ],
      3: [
        '3A – Issue Evaluation: Pre-Release Booklet Analysis and Fieldwork Context',
        '3B – Fieldwork: Physical Environment Investigation',
        '3B – Fieldwork: Human Environment Investigation',
        '3C – Geographical Skills: Atlas and Map Skills',
        '3C – Geographical Skills: Graphical Skills',
        '3C – Geographical Skills: Statistical Skills',
        '3C – Geographical Skills: Ordnance Survey Map Reading',
      ],
    }},

    // ── History ───────────────────────────────────────────────────────────────
    'History': { papers: {
      1: [
        // Period Study (most common: Medicine in Britain)
        'Period Study – Medicine in Britain c.1250: Medieval Beliefs (Four Humours, Church, Islamic Medicine)',
        'Period Study – Medicine c.1250–1500: Surgery, Public Health and the Black Death',
        'Period Study – Medicine 1500–1700: Renaissance, Harvey\'s Circulation of Blood',
        'Period Study – Medicine 1700–1900: Germ Theory (Pasteur and Koch)',
        'Period Study – Medicine 1800–1900: Vaccination (Jenner), Anaesthetics, Antiseptic Surgery (Lister)',
        'Period Study – Medicine c.1900–Present: NHS, Penicillin (Fleming), DNA, Modern Treatments',
        'Period Study – Medicine: Key Individuals (Hippocrates, Galen, Vesalius, Harvey, Jenner, Pasteur, Koch, Lister, Fleming)',
        // Historic Environment
        'Historic Environment – The British Sector of the Western Front 1914–18: Trenches, Medical Response',
      ],
      2: [
        // Wider World Depth Study (most common: Germany 1890–1945)
        'Germany 1890–1918: Kaiser Wilhelm II, the Second Reich, Social Problems',
        'Germany 1918–1929: The Weimar Republic, Stab-in-the-Back Myth, Economic Crises',
        'Germany 1929–1933: The Rise of the Nazi Party, Impact of the Great Depression',
        'Germany 1933–1934: Nazi Consolidation of Power (Enabling Act, Night of Long Knives)',
        'Germany 1933–1939: Life in Nazi Germany (Propaganda, Youth, Women, Jews)',
        'Germany 1939–1945: The Holocaust, Total War and Defeat',
        // British Depth Study (most common: Elizabethan England)
        'Elizabethan England 1558–1603: Elizabeth I and Her Government',
        'Elizabethan England: The Religious Settlement',
        'Elizabethan England: Mary Queen of Scots and Catholic Plots',
        'Elizabethan England: Exploration, Drake and the Spanish Armada (1588)',
        'Elizabethan England: Poverty, Education and Popular Culture',
        // Conflict and Tension
        'Conflict and Tension 1894–1918: Alliance Systems, Militarism, Imperialism',
        'Conflict and Tension 1894–1918: The Assassination of Franz Ferdinand and July Crisis',
        'Conflict and Tension 1918–1939: Treaty of Versailles and Its Impact',
        'Conflict and Tension 1918–1939: The League of Nations — Successes and Failures',
        'Conflict and Tension 1918–1939: The Road to War — Appeasement, Rhineland, Anschluss',
      ],
    }},

    // ── Religious Studies ─────────────────────────────────────────────────────
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
        'Christianity – Practices: Worship (Liturgical, Non-Liturgical, Informal)',
        'Christianity – Practices: Prayer and The Lord\'s Prayer',
        'Christianity – Practices: Baptism (Infant and Believer\'s Baptism)',
        'Christianity – Practices: Eucharist / Holy Communion',
        'Christianity – Practices: Pilgrimage (Lourdes, Jerusalem)',
        'Christianity – Practices: Christmas and Easter Celebrations',
        'Christianity – Practices: The Role of the Church in the Local and Wider Community',
        'Christianity – Practices: The Church in the World (Reconciliation, Oscar Romero)',
        // Islam Beliefs
        'Islam – Beliefs: The Six Articles of Faith (Sunni) / Five Roots (Shi\'a)',
        'Islam – Beliefs: The Nature of Allah (Tawhid — Oneness of God)',
        'Islam – Beliefs: Angels (Jibril, Mika\'il)',
        'Islam – Beliefs: Prophethood and the Importance of Muhammad (pbuh)',
        'Islam – Beliefs: Holy Books (Qur\'an, Injil, Tawrat)',
        'Islam – Beliefs: Life After Death (Akhirah — Judgement, Heaven, Hell)',
        'Islam – Beliefs: Al-Qadr — Predestination',
        'Islam – Beliefs: Sunni and Shi\'a Differences',
        // Islam Practices
        'Islam – Practices: The Five Pillars (Shahadah, Salah, Sawm, Zakah, Hajj)',
        'Islam – Practices: The Mosque — Features and Importance',
        'Islam – Practices: Jihad (Greater and Lesser)',
        'Islam – Practices: Festivals (Id-ul-Fitr and Id-ul-Adha)',
        'Islam – Practices: Shi\'a Practices (Ashura, Khums)',
      ],
      2: [
        'Theme A – Relationships and Families: Sex, Marriage and Cohabitation',
        'Theme A – Relationships and Families: Contraception',
        'Theme A – Relationships and Families: Divorce and Remarriage',
        'Theme A – Relationships and Families: Roles of Men and Women',
        'Theme A – Relationships and Families: Homosexuality',
        'Theme A – Relationships and Families: Families and the Purpose of Family',
        'Theme B – Religion and Life: The Origin and Value of the Universe',
        'Theme B – Religion and Life: The Origin and Value of Human Life',
        'Theme B – Religion and Life: Abortion and Sanctity of Life',
        'Theme B – Religion and Life: Euthanasia',
        'Theme B – Religion and Life: Animal Rights and the Environment',
        'Theme D – Religion, Peace and Conflict: Violence, Terrorism and War',
        'Theme D – Religion, Peace and Conflict: Just War Theory',
        'Theme D – Religion, Peace and Conflict: Holy War, Pacifism and Weapons of Mass Destruction',
        'Theme E – Religion, Crime and Punishment: Crime and its Causes',
        'Theme E – Religion, Crime and Punishment: Types and Aims of Punishment',
        'Theme E – Religion, Crime and Punishment: Forgiveness and Capital Punishment',
        'Theme F – Religion, Human Rights and Social Justice: Prejudice and Discrimination',
        'Theme F – Religion, Human Rights and Social Justice: Wealth, Poverty and Charity',
        'Theme F – Religion, Human Rights and Social Justice: Human Rights',
      ],
    }},

    // ── Psychology ───────────────────────────────────────────────────────────
    'Psychology': { papers: {
      1: [
        'Cognition and Development – Piaget\'s Theory: Four Stages of Cognitive Development',
        'Cognition and Development – Piaget: Schemas, Assimilation, Accommodation',
        'Cognition and Development – Willingham\'s Learning Theory: Learning as Memorised Practice',
        'Cognition and Development – Baron-Cohen et al. (1997): \'Eyes Test\' and Autism Spectrum',
        'Social Context and Behaviour – Milgram (1963): Obedience Study — Method, Findings',
        'Social Context and Behaviour – Haney, Banks and Zimbardo (1973): Stanford Prison Study',
        'Social Context and Behaviour – Piliavin et al. (1969): Bystander Behaviour on the Subway',
        'Social Context and Behaviour – Social Learning Theory (Bandura): Observation and Imitation',
      ],
      2: [
        'Brain and Neuropsychology – The Nervous System: CNS and PNS',
        'Brain and Neuropsychology – Brain Structure: Lobes and Their Functions',
        'Brain and Neuropsychology – Brain Scanning: fMRI and EEG',
        'Brain and Neuropsychology – Neurological Damage: Case Studies (Phineas Gage)',
        'Brain and Neuropsychology – Tulving\'s Long-Term Memory: Episodic, Semantic, Procedural',
        'Psychological Problems – Depression: Characteristics, Explanations, Treatments',
        'Psychological Problems – Addiction: Risk Factors, Biological and Behavioural Explanations',
        'Research Methods – Types of Research: Experiment, Observation, Questionnaire, Case Study',
        'Research Methods – Research Design: Hypothesis, IV, DV, Sampling',
        'Research Methods – Data Analysis: Quantitative vs Qualitative, Mean, Median, Mode',
        'Research Methods – Ethical Considerations: Consent, Deception, Debriefing, Confidentiality',
      ],
    }},

    // ── Sociology ────────────────────────────────────────────────────────────
    'Sociology': { papers: {
      1: [
        'The Sociology of Families: Changing Family Structures (Nuclear, Extended, Single-Parent, Reconstituted)',
        'The Sociology of Families: Changing Gender Roles and the Symmetrical Family',
        'The Sociology of Families: Demographic Changes (Birth Rate, Death Rate, Ageing Population)',
        'The Sociology of Families: Sociological Perspectives on the Family (Functionalism, Marxism, Feminism)',
        'The Sociology of Education: Role and Purpose of Education (Functionalist, Marxist Views)',
        'The Sociology of Education: Differential Achievement by Social Class',
        'The Sociology of Education: Differential Achievement by Gender',
        'The Sociology of Education: Differential Achievement by Ethnicity',
        'The Sociology of Education: In-School Factors (Labelling, Streaming, Hidden Curriculum)',
        'Research Methods: Types of Data (Quantitative and Qualitative)',
        'Research Methods: Primary Methods (Surveys, Interviews, Observation)',
        'Research Methods: Secondary Methods (Documents, Statistics)',
        'Research Methods: Ethical Considerations',
      ],
      2: [
        'The Sociology of Crime and Deviance: Defining and Measuring Crime',
        'The Sociology of Crime and Deviance: Official and Alternative Crime Statistics',
        'The Sociology of Crime and Deviance: Sociological Explanations (Functionalist, Strain, Interactionist, Marxist)',
        'The Sociology of Crime and Deviance: Gender and Crime',
        'The Sociology of Crime and Deviance: Ethnicity and Crime',
        'The Sociology of Crime and Deviance: Social Control (Formal and Informal)',
        'Social Stratification: Social Class and Life Chances',
        'Social Stratification: Gender and Inequality',
        'Social Stratification: Ethnicity and Inequality',
        'Social Stratification: Poverty (Absolute and Relative) and Social Exclusion',
        'Research Methods in Context: Applying Methods to Crime and Stratification',
      ],
    }},

    // ── Business Studies ──────────────────────────────────────────────────────
    'Business Studies': { papers: {
      1: [
        '1.1 – Enterprise and Entrepreneurship: Role of Entrepreneurs, Business Aims',
        '1.1 – Enterprise and Entrepreneurship: Business Ideas, Risk and Reward',
        '1.2 – Spotting a Business Opportunity: Identifying Customer Needs',
        '1.2 – Spotting a Business Opportunity: Market Research (Primary and Secondary)',
        '1.2 – Spotting a Business Opportunity: Market Segmentation',
        '1.3 – Business Objectives: Revenue, Costs and Profit Calculations',
        '1.3 – Business Objectives: Cash Flow Forecasting',
        '1.3 – Business Objectives: Sources of Finance (Internal and External)',
        '1.4 – Making the Business Effective: Location Factors',
        '1.4 – Making the Business Effective: Legal Structure (Sole Trader, Partnership, Ltd)',
        '1.4 – Making the Business Effective: The Marketing Mix (4Ps)',
        '1.5 – External Influences: Stakeholders and Their Objectives',
        '1.5 – External Influences: Technology and Its Impact on Business',
        '1.5 – External Influences: Consumer and Employment Legislation',
        '1.5 – External Influences: The Business Cycle and Economic Factors',
        '1.5 – External Influences: Ethics and Environmental Responsibility',
      ],
      2: [
        '2.1 – Growing the Business: Organic Growth vs Integration',
        '2.1 – Growing the Business: Public Limited Companies (PLCs)',
        '2.1 – Growing the Business: Globalisation, Multinationals and E-Commerce',
        '2.2 – Making Marketing Decisions: Product Life Cycle and Extension Strategies',
        '2.2 – Making Marketing Decisions: Branding and Promotion',
        '2.2 – Making Marketing Decisions: Pricing Strategies (Cost-Plus, Competitive, Price Skimming)',
        '2.2 – Making Marketing Decisions: Distribution Channels',
        '2.3 – Making Operational Decisions: Business Operations and Efficiency',
        '2.3 – Making Operational Decisions: Quality Management (TQM, ISO)',
        '2.4 – Making Financial Decisions: Revenue, Profit and Return on Investment',
        '2.4 – Making Financial Decisions: Financial Statements (Income Statement, Balance Sheet)',
        '2.4 – Making Financial Decisions: Break-Even Analysis',
        '2.5 – Making HR Decisions: Organisational Structures (Hierarchical vs Flat)',
        '2.5 – Making HR Decisions: Recruitment, Selection and Training',
        '2.5 – Making HR Decisions: Motivation Theories (Taylor, Maslow, Herzberg)',
        '2.5 – Making HR Decisions: Employee Retention and Trade Unions',
      ],
    }},

    // ── Economics ────────────────────────────────────────────────────────────
    'Economics': { papers: {
      1: [
        'Theme 1 – The Economic Problem: Scarcity, Choice and Opportunity Cost',
        'Theme 1 – The Economic Problem: Factors of Production, the PPF',
        'Theme 1 – Demand: The Law of Demand, Demand Curves',
        'Theme 1 – Demand: Factors Shifting Demand',
        'Theme 1 – Supply: The Law of Supply, Supply Curves',
        'Theme 1 – Supply: Factors Shifting Supply',
        'Theme 1 – Price Determination: Market Equilibrium and Disequilibrium',
        'Theme 1 – Elasticity: Price Elasticity of Demand (PED) — Calculation and Significance',
        'Theme 1 – Elasticity: Price Elasticity of Supply (PES)',
        'Theme 1 – Elasticity: Income Elasticity of Demand (YED)',
        'Theme 1 – Market Failure: Externalities (Positive and Negative)',
        'Theme 1 – Market Failure: Public Goods, Merit Goods and Demerit Goods',
        'Theme 1 – Government Intervention: Taxes, Subsidies, Price Controls, Regulations',
      ],
      2: [
        'Theme 2 – The Economy: Measuring GDP and Living Standards',
        'Theme 2 – The Economy: Unemployment — Types, Causes and Effects',
        'Theme 2 – The Economy: Inflation — CPI, RPI, Demand-Pull, Cost-Push',
        'Theme 2 – The Economy: Economic Growth and the Business Cycle',
        'Theme 2 – Government Policy: Fiscal Policy (Government Spending and Taxation)',
        'Theme 2 – Government Policy: Monetary Policy (Interest Rates and the Bank of England)',
        'Theme 2 – International Trade: Comparative Advantage, Imports and Exports',
        'Theme 2 – International Trade: Exchange Rates — Determination and Impact',
        'Application of Economic Data: Interpreting and Evaluating Economic Stimulus Material',
      ],
    }},

    // ── French ────────────────────────────────────────────────────────────────
    'French': { papers: {
      1: [
        'Listening – Theme 1: Identity and Culture (Family, Friendships, Social Media, Free Time)',
        'Listening – Theme 2: Local, National, International and Global Areas of Interest (Town, Travel, Environment)',
        'Listening – Theme 3: Current and Future Study and Employment (School Life, Jobs, Future Plans)',
        'Listening – Phonics: Recognition of Nasal Sounds, Liaison, Silent Letters',
      ],
      2: [
        'Speaking – Role Play (Formal and Informal Contexts)',
        'Speaking – Photo Card: Description, Follow-Up Questions',
        'Speaking – General Conversation: Theme 1 (Identity and Culture)',
        'Speaking – General Conversation: Theme 2 (Local Area and Global Issues)',
        'Speaking – General Conversation: Theme 3 (School and Future Plans)',
        'Speaking – Pronunciation and Spontaneity',
      ],
      3: [
        'Reading – Theme 1: Identity and Culture',
        'Reading – Theme 2: Local, National and Global Issues',
        'Reading – Theme 3: Study and Employment',
        'Grammar – Present Tense: Regular (-er, -ir, -re) and Irregular Verbs',
        'Grammar – Perfect Tense: avoir and être Auxiliaries',
        'Grammar – Imperfect Tense',
        'Grammar – Future Tense (Simple Future and Immediate Future)',
        'Grammar – Conditional Tense',
        'Grammar – Pluperfect Tense (Higher)',
        'Grammar – Reflexive Verbs',
        'Grammar – Negative Structures (ne...pas, ne...jamais, ne...rien)',
        'Grammar – Modal Verbs (pouvoir, vouloir, devoir, falloir)',
        'Grammar – Pronouns (Subject, Object, Relative, Reflexive)',
        'Grammar – Adjective Agreement and Position',
        'Grammar – Conjunctions and Complex Sentences',
        'Vocabulary – All AQA Theme Vocabulary Lists',
      ],
      4: [
        'Writing – Translation from English into French',
        'Writing – Structured Questions (Short and Extended Response)',
        'Writing – Open-Ended Writing Task (Higher: ~150 words, Foundation: ~90 words)',
        'Writing – Accuracy: Tense Range, Agreement, Spelling',
        'Writing – Complexity: Range of Structures and Vocabulary',
      ],
    }},

    // ── German ────────────────────────────────────────────────────────────────
    'German': { papers: {
      1: [
        'Listening – Theme 1: Identity and Culture (Family, Technology, Hobbies)',
        'Listening – Theme 2: Local, National, International and Global Issues',
        'Listening – Theme 3: Current and Future Study and Employment',
        'Listening – Phonics: Umlauts (ä, ö, ü), ß, ch, sch, ei vs ie',
      ],
      2: [
        'Speaking – Role Play (Formal and Informal)',
        'Speaking – Photo Card: Description, Discussion',
        'Speaking – General Conversation: Theme 1',
        'Speaking – General Conversation: Theme 2',
        'Speaking – General Conversation: Theme 3',
      ],
      3: [
        'Reading – Theme 1: Identity and Culture',
        'Reading – Theme 2: Local, National and Global Issues',
        'Reading – Theme 3: Study and Employment',
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

    // ── Spanish ───────────────────────────────────────────────────────────────
    'Spanish': { papers: {
      1: [
        'Listening – Theme 1: Identity and Culture (Family, Relationships, Technology, Free Time)',
        'Listening – Theme 2: Local, National, International and Global Issues',
        'Listening – Theme 3: Current and Future Study and Employment',
        'Listening – Phonics: Vowel Sounds, ll, ñ, rr, j, v',
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
        'Grammar – Present Tense: Regular, Irregular and Stem-Changing Verbs',
        'Grammar – Preterite Tense (Regular and Irregular)',
        'Grammar – Imperfect Tense',
        'Grammar – Future Tense and Conditional',
        'Grammar – Perfect Tense (Higher)',
        'Grammar – Subjunctive Mood (Higher)',
        'Grammar – Reflexive Verbs',
        'Grammar – Ser vs Estar',
        'Grammar – Gustar-Type Verbs',
        'Grammar – Modal Verbs (poder, querer, deber, tener que)',
        'Grammar – Negatives, Pronouns and Adjective Agreement',
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

    // ── Mandarin Chinese ──────────────────────────────────────────────────────
    'Mandarin Chinese': { papers: {
      1: [
        'Listening – Theme 1: Identity and Culture (Family, Lifestyle, Social Media)',
        'Listening – Theme 2: Local, National, International and Global Issues',
        'Listening – Theme 3: Current and Future Study and Employment',
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
        'Grammar – Sentence Structure: Subject-Verb-Object',
        'Grammar – Measure Words (量词)',
        'Grammar – Tense Indicators (了, 过, 在, 会, 要, 想)',
        'Grammar – Complements of Degree (得)',
        'Grammar – Comparison Structures (比, 没有)',
        'Grammar – ba-Construction (把) and bei-Construction (被)',
        'Character Recognition: AQA Required Vocabulary',
      ],
      4: [
        'Writing – Characters: Accuracy of High-Frequency Characters',
        'Writing – Structured Writing Task',
        'Writing – Open-Ended Writing Task (Higher)',
      ],
    }},

    // ── Arabic ───────────────────────────────────────────────────────────────
    'Arabic': { papers: {
      1: [
        'Listening – Theme 1: Identity and Culture',
        'Listening – Theme 2: Local, National, International and Global Issues',
        'Listening – Theme 3: Current and Future Study and Employment',
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
        'Grammar – Dual and Plural Forms',
        'Grammar – Definite Article (ال) and Agreement',
        'Grammar – Root System: Identifying Roots and Patterns',
        'Script: Reading and Writing Arabic Script (AQA Vocabulary)',
      ],
      4: [
        'Writing – Translation from English into Arabic',
        'Writing – Structured Writing Task',
        'Writing – Open-Ended Writing Task (Higher)',
      ],
    }},

    // ── Polish ────────────────────────────────────────────────────────────────
    'Polish': { papers: {
      1: ['Listening – Theme 1: Identity and Culture', 'Listening – Theme 2: Local Area and Global Issues', 'Listening – Theme 3: School and Future Plans'],
      2: ['Speaking – Role Play', 'Speaking – Photo Card', 'Speaking – General Conversation (All Themes)'],
      3: ['Reading – All Themes', 'Grammar – Cases (Nominative, Accusative, Dative, Genitive)', 'Grammar – Verb Aspects (Perfective and Imperfective)', 'Grammar – Declension of Nouns and Adjectives', 'Vocabulary – AQA Theme Vocabulary List'],
      4: ['Writing – Translation from English into Polish', 'Writing – Structured and Open-Ended Tasks', 'Writing – Accuracy of Cases and Verb Forms'],
    }},

    // ── Urdu ──────────────────────────────────────────────────────────────────
    'Urdu': { papers: {
      1: ['Listening – Theme 1: Identity and Culture', 'Listening – Theme 2: Local Area and Global Issues', 'Listening – Theme 3: School and Future Plans'],
      2: ['Speaking – Role Play', 'Speaking – Photo Card', 'Speaking – General Conversation (All Themes)'],
      3: ['Reading – All Themes', 'Reading – Nastaliq Script Recognition', 'Grammar – Verb Tenses (Present, Past, Future)', 'Grammar – Postpositions and Agreement', 'Vocabulary – AQA Theme Vocabulary List'],
      4: ['Writing – Translation from English into Urdu', 'Writing – Structured and Open-Ended Tasks', 'Writing – Accuracy of Script and Grammar'],
    }},

    // ── Art & Design ──────────────────────────────────────────────────────────
    'Art & Design': { papers: {
      1: [
        'AO1 – Develop: Research, Analysis of Artists, Craftspeople and Designers',
        'AO1 – Develop: Contextual Sources (Art Movements, Historical and Contemporary)',
        'AO2 – Explore: Experimentation with Materials, Techniques and Processes',
        'AO2 – Explore: Reviewing, Modifying and Refining Ideas',
        'AO3 – Record: Observational Drawing and Recording',
        'AO3 – Record: Annotation and Critical Analysis of Own Work',
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

    // ── Drama ─────────────────────────────────────────────────────────────────
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
      ],
      2: [
        'Component 2 – Devising Drama (Non-Exam Assessment)',
        'Devising Process: Research, Exploration, Development and Refinement',
        'Devising: Performance Skills — Voice (Tone, Pace, Pitch, Pause, Projection)',
        'Devising: Performance Skills — Physical (Gesture, Posture, Movement, Facial Expression)',
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

    // ── Music ─────────────────────────────────────────────────────────────────
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
        'Performance (NEA): Solo and/or Ensemble Performance',
        'Composition (NEA): Composition to a Brief and Free Composition',
      ],
    }},

    // ── Physical Education ────────────────────────────────────────────────────
    'Physical Education': { papers: {
      1: [
        '3.1 – Applied Anatomy and Physiology: The Skeletal System (Functions, Joints, Types of Movement)',
        '3.1 – Applied Anatomy and Physiology: The Muscular System (Major Muscles, Antagonistic Pairs)',
        '3.1 – Applied Anatomy and Physiology: The Cardiovascular System (Heart Structure, Blood Vessels)',
        '3.1 – Applied Anatomy and Physiology: The Respiratory System (Breathing Mechanics, Gas Exchange)',
        '3.1 – Applied Anatomy and Physiology: Energy Systems (ATP-PC, Lactic Acid, Aerobic)',
        '3.2 – Movement Analysis: Lever Systems (1st, 2nd, 3rd Class)',
        '3.2 – Movement Analysis: Planes and Axes of Movement',
        '3.3 – Physical Training: Components of Fitness (Health-Related and Skill-Related)',
        '3.3 – Physical Training: Principles of Training (FITT, Overload, Specificity, Reversibility)',
        '3.3 – Physical Training: Methods of Training (Interval, Circuit, Continuous, Weight, Plyometric, Flexibility)',
        '3.3 – Physical Training: Fitness Testing and Evaluation',
      ],
      2: [
        '3.4 – Sports Psychology: Skill Classification (Open/Closed, Gross/Fine, Discrete/Continuous)',
        '3.4 – Sports Psychology: Goal Setting (SMART Goals)',
        '3.4 – Sports Psychology: Mental Preparation: Arousal, Anxiety and the Inverted-U Theory',
        '3.5 – Socio-Cultural Influences: Engagement Patterns in Physical Activity (Age, Gender, Ethnicity)',
        '3.5 – Socio-Cultural Influences: Commercialisation and Sponsorship',
        '3.5 – Socio-Cultural Influences: Ethics in Sport (PEDs, Violence, Gamesmanship)',
        '3.6 – Health, Fitness and Wellbeing: Components of a Healthy Lifestyle',
        '3.6 – Health, Fitness and Wellbeing: Diet and Nutrition for Sport',
        '3.6 – Health, Fitness and Wellbeing: Physical and Mental Health Benefits',
        'Practical Performance (NEA): Two Practical Activities',
        'Analysis and Evaluation of Performance (NEA): Written Analysis',
      ],
    }},

    // ── Food Preparation & Nutrition ──────────────────────────────────────────
    'Food Preparation & Nutrition': { papers: {
      1: [
        'Food Commodities: Cereals and Cereal Products',
        'Food Commodities: Fruit and Vegetables',
        'Food Commodities: Milk, Cheese and Eggs',
        'Food Commodities: Meat, Fish and Seafood',
        'Food Commodities: Vegetable Proteins (Tofu, Quorn, Soya)',
        'Food Commodities: Fats, Oils and Sugars',
        'Principles of Nutrition: Macronutrients (Proteins, Carbohydrates, Fats)',
        'Principles of Nutrition: Micronutrients (Vitamins A, B, C, D; Iron, Calcium)',
        'Principles of Nutrition: Dietary Fibre and Water',
        'Diet and Good Health: Reference Nutrient Intakes (RNI) and EAR',
        'Diet and Good Health: Nutritional Needs Across Life Stages',
        'Diet and Good Health: Diet-Related Conditions (Obesity, Diabetes, Anaemia, Osteoporosis)',
        'The Science of Food: Enzymic Browning, Denaturation, Coagulation',
        'The Science of Food: Gelatinisation, Caramelisation, Maillard Reaction',
        'The Science of Food: Emulsification, Aeration, Gluten Development',
        'The Science of Food: Food Spoilage — Bacteria, Moulds, Yeast',
        'The Science of Food: Preservation Methods and Food Safety',
        'Where Food Comes From: Food Provenance and Traceability',
        'Where Food Comes From: Sustainability and Food Miles',
        'Where Food Comes From: Farming Methods (Intensive, Organic)',
        'Cooking and Food Preparation: Cooking Methods (Boiling, Frying, Baking, Steaming)',
        'Cooking and Food Preparation: Knife Skills and Equipment',
        'NEA 1 – Food Investigation Task (Written Report)',
        'NEA 2 – Food Preparation Assessment (Practical)',
      ],
    }},

    // ── Design & Technology ───────────────────────────────────────────────────
    'Design & Technology': { papers: {
      1: [
        'Core Technical Principles: New and Emerging Technologies (Industry 4.0, IoT)',
        'Core Technical Principles: Energy Generation and Storage',
        'Core Technical Principles: Mechanical Devices (Cams, Gears, Linkages)',
        'Core Technical Principles: Materials — Papers and Boards (Properties, Working Characteristics)',
        'Core Technical Principles: Materials — Natural and Manufactured Timbers',
        'Core Technical Principles: Materials — Ferrous and Non-Ferrous Metals, Alloys',
        'Core Technical Principles: Materials — Thermoplastics and Thermosetting Polymers',
        'Core Technical Principles: Materials — Woven, Non-Woven and Knitted Textiles',
        'Core Technical Principles: Ecological and Social Footprint (LCA, Sustainability)',
        'Specialist Technical Principles: Scales of Production (One-Off, Batch, Mass, Continuous)',
        'Specialist Technical Principles: Specialist Processes and Materials (Focus Area)',
        'Designing and Making Principles: Design Strategies (User-Centred, Iterative)',
        'Designing and Making Principles: Communication of Design Ideas (Sketching, CAD)',
        'Designing and Making Principles: Prototyping, Testing and Evaluation',
        'Designing and Making Principles: Health, Safety and Risk Assessment',
        'Non-Exam Assessment (NEA): Design and Make Task',
      ],
    }},

    // ── Media Studies ─────────────────────────────────────────────────────────
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
        'Section A – Audiences: Reception Theory (Stuart Hall)',
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
        'Component 2 – Creating Media Products (Non-Exam Assessment)',
      ],
    }},

    // ── Film Studies ──────────────────────────────────────────────────────────
    'Film Studies': { papers: {
      1: [
        'Film Language: Mise-en-scène (Setting, Costume, Lighting, Performance)',
        'Film Language: Cinematography (Camera Angles, Shot Types, Movement)',
        'Film Language: Editing (Continuity Editing, Montage, Pace)',
        'Film Language: Sound (Diegetic, Non-Diegetic, Score, Silence)',
        'Film Concepts: Narrative Structure (Three-Act, Non-Linear)',
        'Film Concepts: Genre (Conventions, Hybridity, Subgenre)',
        'Film Concepts: Representation (Gender, Ethnicity, Class)',
        'Set Film 1: British Cinema (Context, Genre, Auteur)',
        'Set Film 2: Hollywood Cinema (Production Context, Industry)',
        'Set Film 3: Global Cinema or Documentary',
      ],
      2: [
        'Film Industries: Hollywood Studio System and Contemporary Hollywood',
        'Film Industries: British Film Industry (Funding, BFI)',
        'Film Audiences: Mainstream and Niche Audiences, Fandom',
        'Short Film Studies (NEA)',
      ],
    }},

    // ── Engineering ───────────────────────────────────────────────────────────
    'Engineering': { papers: {
      1: [
        'Engineering Principles: Forces and Structural Analysis (Tension, Compression, Shear)',
        'Engineering Principles: Simple Machines (Levers, Pulleys, Gears)',
        'Engineering Principles: Electrical Circuits (Series, Parallel, Ohm\'s Law)',
        'Engineering Principles: Electronics (Sensors, Transistors, Microcontrollers)',
        'Engineering Principles: Materials and Their Properties (Metals, Polymers, Composites)',
        'Engineering Principles: Manufacturing Processes (Casting, Forming, Machining, Joining)',
        'Engineering in Context: New and Emerging Technologies (Automation, Robotics, AI)',
        'Engineering in Context: Sustainability and Environmental Impact',
        'Engineering in Context: Health and Safety in Engineering Workplaces',
        'NEA: Engineering Design and Make Task',
      ],
    }},

  }, // end AQA GCSE

  // ── EDEXCEL GCSE ────────────────────────────────────────────────────────────
  Edexcel: {

    // ── Mathematics (Corbettmaths topic list) ─────────────────────────────────
    'Mathematics': { papers: {
      1: [ // Non-calculator
        'Number – Integers, Decimals and Rounding',
        'Number – Fractions, Decimals and Percentages',
        'Number – Powers, Roots and Surds (Higher)',
        'Number – Standard Form',
        'Number – Error Intervals and Bounds (Higher)',
        'Ratio and Proportion – Ratio, Direct and Inverse Proportion',
        'Algebra – Simplifying Expressions, Expanding and Factorising',
        'Algebra – Solving Linear Equations and Inequalities',
        'Algebra – Changing the Subject of a Formula',
        'Algebra – Quadratic Equations: Factorising, Formula, Completing the Square (Higher)',
        'Algebra – Sequences: nth Term Linear and Quadratic (Higher)',
        'Algebra – Simultaneous Equations',
        'Algebra – Proof (Higher)',
        'Algebra – Functions: Composite and Inverse (Higher)',
        'Statistics – Averages and Range (Mean, Median, Mode)',
        'Statistics – Frequency Tables and Grouped Data',
        'Statistics – Pictograms, Bar Charts, Pie Charts',
        'Statistics – Scatter Graphs, Correlation and Lines of Best Fit',
        'Probability – Basic Probability, Sample Space Diagrams',
        'Probability – Tree Diagrams, Conditional Probability (Higher)',
        'Probability – Venn Diagrams',
      ],
      2: [ // Calculator
        'Geometry – Angles: Parallel Lines, Polygons, Interior and Exterior Angles',
        'Geometry – Pythagoras\' Theorem',
        'Geometry – Trigonometry: SOH CAH TOA, Sine and Cosine Rule (Higher)',
        'Geometry – Area and Perimeter: 2D Shapes, Circles, Sectors',
        'Geometry – Volume and Surface Area: Prisms, Cylinders, Pyramids, Cones, Spheres (Higher)',
        'Geometry – Transformations: Reflection, Rotation, Translation, Enlargement',
        'Geometry – Congruence and Similarity',
        'Geometry – Vectors (Higher)',
        'Geometry – Circle Theorems (Higher)',
        'Geometry – Constructions and Loci',
        'Graphs – Straight-Line Graphs: Gradient, Intercept, y = mx + c',
        'Graphs – Quadratic, Cubic and Reciprocal Graphs',
        'Graphs – Exponential and Trigonometric Graphs (Higher)',
        'Graphs – Transformations of Graphs (Higher)',
        'Graphs – Distance-Time and Velocity-Time Graphs',
        'Statistics – Cumulative Frequency, Box Plots, Histograms',
        'Statistics – Comparing Distributions',
      ],
      3: [ // Calculator
        'Mixed Topics: Problem Solving with Number, Algebra, and Geometry',
        'Applied Mathematics: Speed, Distance, Time; Density; Pressure',
        'Financial Mathematics: Interest, Tax, Wages',
        'Ratio and Scale: Maps, Scale Diagrams, Currency Conversion',
        'Algebraic Reasoning: Proof, Inequalities, Equation Solving',
        'Geometric Reasoning: Circle Theorems, Pythagoras, Trigonometry (Higher)',
      ],
    }},

    // ── Combined Science (Edexcel) ────────────────────────────────────────────
    'Combined Science': { papers: {
      1: [ // Biology 1
        'CB1 – Key Concepts in Biology: Cells, Microscopy, Enzymes',
        'CB2 – Cells and Control: Mitosis, the Cell Cycle, the Nervous System',
        'CB3 – Genetics: DNA, Protein Synthesis, Inheritance',
        'CB4 – Natural Selection and Genetic Modification',
        'CB5 – Health, Disease and the Development of Medicines',
        'Required Practicals: Microscopy, Osmosis, Effect of Antibiotics',
      ],
      2: [ // Biology 2
        'CB6 – Plant Structures and Their Functions: Photosynthesis, Transpiration',
        'CB7 – Animal Coordination, Control and Homeostasis: Hormones, Nervous System',
        'CB8 – Exchange and Transport in Animals: Circulatory System',
        'CB9 – Ecosystems and Material Cycles',
        'Required Practicals: Photosynthesis, Reaction Time, Fieldwork Sampling',
      ],
      3: [ // Chemistry 1
        'CC1 – States of Matter and Mixtures',
        'CC2 – Atomic Structure: History, Sub-atomic Particles, Isotopes',
        'CC3 – Periodic Table: Groups 1, 7, 0 and Transition Metals',
        'CC4 – Ionic, Covalent and Metallic Bonding',
        'CC5 – Formulae, Equations and Amounts of Substance',
        'CC6 – Electrolytic Processes',
        'CC7 – Obtaining and Using Metals',
        'CC8 – Acids, Bases and Salts',
        'Required Practicals: Chromatography, Titration, Preparation of a Salt',
      ],
      4: [ // Chemistry 2
        'CC9 – Reversible Reactions and Equilibria',
        'CC10 – Groups in the Periodic Table (further detail)',
        'CC11 – Rate of Reaction',
        'CC12 – Energy Changes in Reactions',
        'CC13 – Fuels and Earth Science: Hydrocarbons, Crude Oil, Atmosphere',
        'CC14 – Chemical Analysis: Flame Tests, Ion Tests, Chromatography',
        'Required Practicals: Rate of Reaction, Temperature Change',
      ],
      5: [ // Physics 1
        'CP1 – Motion: Distance-Time, Velocity-Time, Acceleration, Newton\'s Laws',
        'CP2 – Forces and Motion: Weight, Friction, Stopping Distance',
        'CP3 – Conservation of Energy: Energy Stores and Transfers',
        'CP4 – Waves: Properties, Sound, EM Spectrum',
        'CP5 – Light and the EM Spectrum',
        'CP6 – Radioactivity: Types, Half-Life, Uses and Hazards',
        'Required Practicals: Acceleration, Waves, Resistance',
      ],
      6: [ // Physics 2
        'CP7 – Astronomy: Solar System, Life Cycle of Stars, the Universe',
        'CP8 – Energy: SHC, Efficiency, Power, National Grid, Transformers',
        'CP9 – Forces and their Effects: Elasticity, Moments, Pressure',
        'CP10 – Electricity and Circuits: Ohm\'s Law, Series/Parallel, I-V Graphs',
        'CP11 – Static Electricity and Magnetism',
        'CP12 – Electromagnetic Induction and Generators',
        'Required Practicals: SHC, I-V Characteristics, Density',
      ],
    }},

    // ── Biology (Separate, Edexcel) ───────────────────────────────────────────
    'Biology': { papers: {
      1: [
        'SB1 – Key Concepts in Biology: Cells (Structure, Microscopy, Enzymes, DNA)',
        'SB2 – Cells and Control: Mitosis, the Cell Cycle, Nervous System',
        'SB3 – Genetics: Meiosis, DNA, Protein Synthesis, Inheritance',
        'SB4 – Natural Selection and Genetic Modification',
        'SB5 – Health, Disease and the Development of Medicines',
        'SB6 – Plant Structures and Their Functions',
        'Required Practicals: Microscopy, Osmosis, Photosynthesis, Antibiotics',
      ],
      2: [
        'SB7 – Animal Coordination, Control and Homeostasis',
        'SB8 – Exchange and Transport in Animals',
        'SB9 – Ecosystems and Material Cycles',
        'SB10 – Organisms and Their Environment: Abiotic/Biotic Factors',
        'SB11 – Genes, Inheritance and Selection',
        'SB12 – Variation and Evolution',
        'Required Practicals: Reaction Time, Fieldwork Sampling',
      ],
    }},

    // ── Chemistry (Separate, Edexcel) ─────────────────────────────────────────
    'Chemistry': { papers: {
      1: [
        'SC1 – States of Matter and Mixtures',
        'SC2 – Atomic Structure',
        'SC3 – The Periodic Table',
        'SC4 – Ionic, Covalent and Metallic Bonding',
        'SC5 – Formulae, Equations and Amounts of Substance',
        'SC6 – Electrolytic Processes',
        'SC7 – Obtaining and Using Metals',
        'SC8 – Acids, Bases and Salts',
        'SC9 – Reversible Reactions and Equilibria',
        'Required Practicals: Titration, Salt Preparation, Electrolysis',
      ],
      2: [
        'SC10 – Groups in the Periodic Table',
        'SC11 – Rate of Reaction',
        'SC12 – Heat Energy Changes in Chemical Reactions',
        'SC13 – Fuels and Earth Science',
        'SC14 – Chemical Analysis',
        'SC15 – The Earth\'s Atmosphere and Resources',
        'Required Practicals: Rate of Reaction, Chromatography, Ion Tests',
      ],
    }},

    // ── Physics (Separate, Edexcel) ───────────────────────────────────────────
    'Physics': { papers: {
      1: [
        'SP1 – Motion: Speed, Velocity, Acceleration, Distance-Time Graphs',
        'SP2 – Forces and Motion: Newton\'s Laws, Weight, Momentum (Higher)',
        'SP3 – Conservation of Energy',
        'SP4 – Waves',
        'SP5 – Light and the EM Spectrum',
        'SP6 – Radioactivity',
        'SP7 – Astronomy',
        'Required Practicals: Acceleration, Waves, Resistance, Density',
      ],
      2: [
        'SP8 – Energy: SHC, Power, Efficiency',
        'SP9 – Forces and their Effects: Elasticity, Moments, Pressure, Hydraulics',
        'SP10 – Electricity and Circuits',
        'SP11 – Static Electricity',
        'SP12 – Magnetism and the Motor Effect',
        'SP13 – Electromagnetic Induction',
        'SP14 – Particle Model',
        'SP15 – Forces and Matter',
        'Required Practicals: SHC, I-V Characteristics, Springs',
      ],
    }},

    // ── English Language (Edexcel) ────────────────────────────────────────────
    'English Language': { papers: {
      1: [
        'Reading – Q1: Explicit Information — Listing and Identifying',
        'Reading – Q2: Implicit Meaning — Inference and Interpretation',
        'Reading – Q3: Structural Analysis — How Text is Structured',
        'Reading – Q4: Language Analysis — Methods and Effects',
        'Reading – Q5: Evaluation of a Writer\'s Perspective',
        'Writing – Q6: Descriptive or Narrative Writing Task',
        'Writing Skills: Descriptive Techniques, Narrative Structure, Characterisation',
        'Writing Skills: Technical Accuracy (Punctuation, Syntax, Vocabulary)',
      ],
      2: [
        'Reading – Q1–Q4: Non-Fiction and Literary Non-Fiction (19th Century + Contemporary)',
        'Reading: Comparing Writers\' Methods, Viewpoints and Perspectives',
        'Writing – Q5: Transactional Writing — Letter, Article, Speech, Essay, Report',
        'Writing Skills: Rhetorical Devices, Register, Audience Awareness',
        'Writing Skills: Technical Accuracy',
      ],
    }},

    // ── English Literature (Edexcel) ──────────────────────────────────────────
    'English Literature': { papers: {
      1: [
        // Shakespeare
        'Shakespeare – Macbeth or Romeo and Juliet or The Merchant of Venice or Othello',
        'Shakespeare: Character Analysis and Key Quotations',
        'Shakespeare: Themes and Dramatic Techniques',
        'Shakespeare: Social and Historical Context',
        // 19th-Century Novel
        '19th-Century Novel – Great Expectations / Dr Jekyll and Mr Hyde / Jane Eyre',
        '19th-Century Novel: Character, Theme, Language Analysis',
        '19th-Century Novel: Victorian Context and Social Commentary',
      ],
      2: [
        // Modern Prose and Drama
        'Modern Text: Lord of the Flies / Animal Farm / Blood Brothers / A Taste of Honey',
        'Modern Text: Character, Theme and Context',
        // Poetry
        'Poetry Anthology – Conflict: Comparing Two Poems on War and Conflict',
        'Poetry Anthology – Time and Place: Comparing Two Poems',
        'Unseen Poetry: Analysing an Unseen Poem and Comparing Two Unseen Poems',
      ],
    }},

    // ── Business (Edexcel GCSE) ───────────────────────────────────────────────
    'Business': { papers: {
      1: [
        'Theme 1.1 – Enterprise and Entrepreneurship: Business Aims and Objectives',
        'Theme 1.2 – Spotting a Business Opportunity: Market Research and Segmentation',
        'Theme 1.3 – Business Objectives: Revenue, Costs, Profit, Cash Flow',
        'Theme 1.4 – Making the Business Effective: Location, Structure, Marketing Mix',
        'Theme 1.5 – External Influences: Stakeholders, Legislation, Technology, Ethics',
      ],
      2: [
        'Theme 2.1 – Growing the Business: Growth Strategies, PLCs, Globalisation',
        'Theme 2.2 – Making Marketing Decisions: Product Life Cycle, Pricing, Promotion',
        'Theme 2.3 – Making Operational Decisions: Efficiency, Quality Management',
        'Theme 2.4 – Making Financial Decisions: Financial Statements, Break-Even',
        'Theme 2.5 – Making HR Decisions: Organisational Structure, Motivation, Training',
      ],
    }},

    // ── History (Edexcel) ─────────────────────────────────────────────────────
    'History': { papers: {
      1: [
        'Thematic Study: Medicine in Britain c.1250–Present',
        'Thematic Study: Crime and Punishment in Britain c.1000–Present',
        'Thematic Study: Warfare and British Society c.1250–Present',
        'Thematic Study: Migrants in Britain c.1000–Present',
        'Historic Environment: Site Study Linked to the Thematic Study',
      ],
      2: [
        'Period Study: The Reigns of King Richard I and King John 1189–1216',
        'Period Study: Spain and the "New World" c.1490–1555',
        'Period Study: Henry VIII and His Ministers 1509–40',
        'Period Study: The American West c.1835–c.1895',
        'Period Study: Superpower Relations and the Cold War 1941–91',
        'Depth Study: Early Elizabethan England 1558–88',
        'Depth Study: The American West c.1835–c.1895 (depth)',
        'Depth Study: Weimar and Nazi Germany 1918–39',
        'Depth Study: Mao\'s China 1945–76',
        'Depth Study: The Cold War 1958–91',
      ],
    }},

    // ── Geography (Edexcel B) ─────────────────────────────────────────────────
    'Geography': { papers: {
      1: [
        '1.1 – The Changing Landscapes of the UK: Physical Processes and Land Use',
        '1.2 – Coastal Change and Conflict: Erosion, Deposition, Management',
        '1.3 – River Processes and Pressures: Drainage Basins, Flooding, Management',
        '1.4 – Glaciated Upland Landscapes: Processes and Land Use',
        'Topic 2 – The Living World: Ecosystems, Tropical Rainforests, Cold Environments',
        'Topic 3 – Tectonic Risks: Earthquakes and Volcanoes (Causes, Effects, Responses)',
      ],
      2: [
        'Topic 4 – The Changing Economy of the UK: De-Industrialisation, Regeneration',
        'Topic 5 – Urban Futures: Urbanisation, UK City Case Study, Global City Case Study',
        'Topic 6 – The Development Gap: Measuring Development, Strategies',
        'Topic 7 – Resource Reliance: Food, Water, Energy Resources and Management',
      ],
      3: [
        'Component 3 – People and Environment Issues: Integrated Geographical Investigation',
        'Fieldwork: Physical and Human Geography Fieldwork Investigations',
        'Geographical Skills: Statistical, Graphical and Cartographic Skills',
      ],
    }},

    // ── Religious Studies (Edexcel) ───────────────────────────────────────────
    'Religious Studies': { papers: {
      1: [
        'Catholic Christianity – Beliefs: The Nature of God, Trinity, Creation, Incarnation',
        'Catholic Christianity – Beliefs: Salvation, Afterlife',
        'Catholic Christianity – Practices: Liturgy, Sacraments, Pilgrimage, Prayer',
        'Islam – Beliefs: Tawhid, The Six Articles, The Prophets, Afterlife',
        'Islam – Practices: The Five Pillars, The Mosque, Festivals',
      ],
      2: [
        'Theme A: Issues of Relationships (Sex, Marriage, Divorce, Contraception)',
        'Theme B: Issues of Life and Death (Abortion, Euthanasia, Environment)',
        'Theme C: Issues of Good and Evil (Crime, Punishment, Forgiveness)',
        'Theme D: Issues of Human Rights (Prejudice, Poverty, War and Peace)',
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
        'Algebra – Algebraic Manipulation: Simplifying, Expanding, Factorising',
        'Algebra – Solving Equations (Linear and Quadratic)',
        'Algebra – Changing the Subject',
        'Algebra – Sequences: nth Term (Linear and Quadratic — Higher)',
        'Algebra – Simultaneous Equations',
        'Algebra – Inequalities',
        'Algebra – Algebraic Proof (Higher)',
        'Algebra – Functions (Higher)',
      ],
      2: [ // Calculator (shorter)
        'Ratio and Proportion – Ratio, Direct and Inverse Proportion, Best Buy',
        'Graphs – Straight Lines, Quadratics, Cubics, Reciprocals',
        'Graphs – Transformation of Graphs (Higher)',
        'Graphs – Real-Life Graphs',
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
        'Statistics – Histograms (Higher)',
        'Statistics – Scatter Diagrams and Correlation',
        'Probability – Single and Combined Events, Tree Diagrams, Conditional (Higher)',
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
        '1.2 – Memory and Storage: RAM, ROM, Virtual Memory',
        '1.2 – Memory and Storage: Primary and Secondary Storage Types',
        '1.2 – Memory and Storage: Data Units, Binary, Denary, Hexadecimal',
        '1.2 – Memory and Storage: Binary Addition, Overflow, Two\'s Complement (Higher)',
        '1.2 – Memory and Storage: ASCII and Unicode, Image and Sound Representation',
        '1.2 – Memory and Storage: Compression (Lossy, Lossless, RLE)',
        '1.3 – Computer Networks: Network Types (LAN, WAN), Topologies',
        '1.3 – Computer Networks: Protocols and Layers (TCP/IP Model)',
        '1.3 – Computer Networks: The Internet (DNS, IP Addresses, HTTP, HTTPS)',
        '1.4 – Network Security: Types of Threat (Malware, Phishing, Social Engineering)',
        '1.4 – Network Security: Prevention Methods (Firewalls, Encryption, Authentication)',
        '1.5 – Systems Software: OS Functions, Utility Software, Translators',
        '1.6 – Ethical, Legal and Environmental Issues: GDPR, Computer Misuse Act',
        '1.6 – Ethical Issues: AI, Autonomous Vehicles, Privacy and Surveillance',
      ],
      2: [
        '2.1 – Algorithms: Decomposition, Abstraction, Algorithmic Design',
        '2.1 – Algorithms: Representing Algorithms (Pseudocode and Flowcharts)',
        '2.1 – Algorithms: Searching (Linear and Binary Search)',
        '2.1 – Algorithms: Sorting (Bubble Sort, Merge Sort, Insertion Sort)',
        '2.2 – Programming Fundamentals: Variables, Constants, Data Types',
        '2.2 – Programming Fundamentals: Selection (if/elif/else, switch)',
        '2.2 – Programming Fundamentals: Iteration (for, while, do-while)',
        '2.2 – Programming Fundamentals: Arrays, Lists and 2D Arrays',
        '2.2 – Programming Fundamentals: String Manipulation',
        '2.2 – Programming Fundamentals: File Handling',
        '2.2 – Programming Fundamentals: Subroutines, Parameters, Return Values',
        '2.3 – Producing Robust Programs: Validation, Testing Strategies',
        '2.3 – Producing Robust Programs: Types of Error (Syntax, Logic, Runtime)',
        '2.4 – Boolean Logic: AND, OR, NOT, Truth Tables, Logic Diagrams',
        '2.5 – Programming Languages and IDEs: High vs Low Level, Translators, IDE Features',
      ],
    }},

    // ── GCSE Sciences (Gateway and 21st Century) ──────────────────────────────
    'Biology': { papers: {
      1: [
        'B1 – Cell Level Systems: Cell Structure, Microscopy, Cell Division, DNA',
        'B2 – Scaling Up: Transport in Plants and Animals, Digestion',
        'B3 – Organism Level Systems: Nervous System, Hormones, Homeostasis',
        'B4 – Community Level Systems: Ecosystems, Food Webs, Material Cycles',
        'B5 – Genes, Inheritance and Selection',
        'Required Practicals: Microscopy, Osmosis, Food Tests, Photosynthesis Rate',
      ],
      2: [
        'B6 – Global Challenges: Biodiversity, Infectious Disease, Vaccination',
        'B7 – Practical Skills: Required Practicals and Scientific Methods',
        'B8 – Evolution: Natural Selection, Speciation, Classification',
        'B9 – Genetics and Genetic Engineering',
        'B10 – The Nervous System and Brain',
        'Required Practicals: Sampling, Reaction Time, Enzyme Experiments',
      ],
    }},

    'Chemistry': { papers: {
      1: [
        'C1 – The Particulate Nature of Matter: States, Atomic Structure, Bonding',
        'C2 – Elements, Compounds and Mixtures: The Periodic Table, Properties',
        'C3 – Chemical Reactions: Equations, Types of Reaction, Energy Changes',
        'C4 – Predicting and Identifying Reactions and Products',
        'C5 – Monitoring and Controlling Chemical Reactions: Rate, Equilibrium',
        'Required Practicals: Titration, Electrolysis, Rate of Reaction',
      ],
      2: [
        'C6 – Global Challenges: Extracting Metals, Recycling, Corrosion',
        'C7 – Organic Chemistry: Hydrocarbons, Polymers, Alcohols',
        'C8 – Chemical Analysis: Chromatography, Flame Tests, Identifying Ions',
        'C9 – Earth\'s Atmosphere and Climate Change',
        'C10 – Using Resources Sustainably',
        'Required Practicals: Chromatography, Ion Tests, Rate of Reaction',
      ],
    }},

    'Physics': { papers: {
      1: [
        'P1 – Matter: Density, Changes of State, Specific Heat Capacity, Gas Laws',
        'P2 – Forces: Newton\'s Laws, Motion Graphs, Stopping Distance',
        'P3 – Electricity: Circuits, Ohm\'s Law, Series and Parallel, Power',
        'P4 – Magnetism and Magnetic Fields',
        'P5 – Waves: Properties, Sound, Light, EM Spectrum',
        'Required Practicals: SHC, Resistance, I-V Characteristics',
      ],
      2: [
        'P6 – Radioactivity: Types, Half-Life, Fission and Fusion',
        'P7 – Energy: Transfers, Efficiency, Renewable Resources',
        'P8 – Global Challenges: Space, Climate Change, Sustainability',
        'P9 – Forces and Motion: Momentum, Work, Power (Higher)',
        'P10 – Electromagnetism: Induction, Transformers, Generators',
        'Required Practicals: Waves, Density, Acceleration',
      ],
    }},

    // ── History (OCR) ─────────────────────────────────────────────────────────
    'History': { papers: {
      1: [
        'Thematic Study: The People\'s Health c.1250–Present',
        'Thematic Study: Crime and Punishment in Britain c.1250–Present',
        'British Depth Study: The Norman Conquest 1065–1087',
        'British Depth Study: The Reign of Edward I 1272–1307',
        'British Depth Study: The Elizabethan Age 1547–1603',
        'British Depth Study: The English Reformation 1520–c.1550',
        'British Depth Study: The First World War and British Society 1914–18',
        'British Depth Study: Britain in the Second World War 1939–45',
      ],
      2: [
        'Period Study: The Viking Age c.790–c.1050',
        'Period Study: The Crusades and the Crusader States 1095–1192',
        'Period Study: The Renaissance, c.1400–c.1600',
        'Period Study: The Cold War in Europe 1941–91',
        'Period Study: The USA 1945–74',
        'World Depth Study: The Origins and Outbreak of the First World War 1905–14',
        'World Depth Study: Germany 1925–55',
        'World Depth Study: South Africa 1940–94',
        'World Depth Study: Vietnam 1954–75',
      ],
    }},

    // ── Geography (OCR B) ─────────────────────────────────────────────────────
    'Geography': { papers: {
      1: [
        'Topic 1 – Our Natural World: Global Ecosystems, Tropical Rainforests, Cold Environments',
        'Topic 2 – Our Changing World: Climate Change Evidence, Causes, Effects',
        'Topic 3 – Physical Processes: Coastal, River and Tectonic Landscapes',
        'UK Natural Hazards',
      ],
      2: [
        'Topic 4 – Changing Cities: UK Cities, Global Urbanisation',
        'Topic 5 – Global Development: Measuring Development, NEE Case Study',
        'Topic 6 – Resource Management: Food, Water, Energy Security',
        'Topic 7 – Trade and Aid',
      ],
      3: [
        'Geographical Investigation: NEA — Fieldwork-Based Enquiry',
        'Decision-Making Exercise: Evaluating Evidence for a Planning Decision',
        'Geographical Skills: Cartographic, Statistical and Graphical',
      ],
    }},

    // ── Religious Studies (OCR) ────────────────────────────────────────────────
    'Religious Studies': { papers: {
      1: [
        'Christianity: Beliefs — The Nature of God, Trinity, Jesus, Afterlife',
        'Christianity: Practices — Worship, Sacraments, Prayer, Pilgrimage',
        'Buddhism: Beliefs — The Three Marks of Existence, Four Noble Truths, Eightfold Path',
        'Buddhism: Practices — Meditation, Worship, Festivals, Places of Worship',
        'Islam: Beliefs — Tawhid, Prophethood, Holy Books, Afterlife, Predestination',
        'Islam: Practices — The Five Pillars, Jihad, Festivals, The Mosque',
        'Judaism: Beliefs — The Nature of God, Covenant, Messiah, Afterlife',
        'Judaism: Practices — Shabbat, Food Laws, Festivals, Bar/Bat Mitzvah',
      ],
      2: [
        'Theme 1: Relationships and Families',
        'Theme 2: The Existence of God and Revelation',
        'Theme 3: Religion, Peace and Justice',
        'Theme 4: Religion and Equality',
        'Theme 5: Religion, Crime and Punishment',
        'Theme 6: Religion and Life',
      ],
    }},

    // ── GCSE Latin (OCR) ─────────────────────────────────────────────────────
    'Latin': { papers: {
      1: [
        'Language – Nouns: 1st, 2nd, 3rd Declension in all cases (Nom, Voc, Acc, Gen, Dat, Abl)',
        'Language – Adjectives: 1st/2nd and 3rd Declension Agreement',
        'Language – Pronouns: Personal, Reflexive, Relative, Demonstrative',
        'Language – Verbs: Present, Imperfect, Perfect, Pluperfect Active (all 4 conjugations)',
        'Language – Verbs: Future and Future Perfect Active',
        'Language – Verbs: Passive Voice (all tenses)',
        'Language – Verbs: Deponent Verbs, Irregular Verbs (sum, possum, eo, volo, fero)',
        'Language – Syntax: Indirect Statement (accusative + infinitive)',
        'Language – Syntax: Indirect Command, Indirect Question',
        'Language – Syntax: Purpose Clauses, Result Clauses, cum Clauses',
        'Language – Syntax: Ablative Absolute',
        'Language – Syntax: Gerundive of Obligation (Higher)',
        'Language – Vocabulary: OCR Core and Additional Vocabulary Lists',
        'Prose Translation: Prescribed and Unprescribed Latin Unseen Passages',
      ],
      2: [
        'Literature – Verse and Prose Set Texts (changes annually)',
        'Literature – Roman History and Context (relevant to set texts)',
        'Literature – Analysis of Language, Style and Metre (Hexameter)',
        'Derivatives: Latin Roots in English',
      ],
    }},

  }, // end OCR GCSE

  // ── WJEC / EDUQAS GCSE ──────────────────────────────────────────────────────
  // (Eduqas = England version of WJEC; specifications are effectively identical)
  'Eduqas/WJEC': {

    'Mathematics': { papers: {
      1: [ // Non-calculator
        'Number – Integers, Rounding, Standard Form, Surds (Higher)',
        'Algebra – Expressions, Equations, Inequalities, Sequences',
        'Algebra – Quadratics: Factorising and Formula (Higher)',
        'Algebra – Simultaneous Equations, Proof (Higher)',
        'Statistics – Averages, Charts, Scatter Graphs',
        'Probability – Events, Tree Diagrams, Venn Diagrams',
      ],
      2: [ // Calculator
        'Geometry – Angles, Polygons, Pythagoras, Trigonometry',
        'Geometry – Area, Volume, Surface Area',
        'Geometry – Transformations, Similarity, Congruence',
        'Geometry – Circle Theorems, Vectors (Higher)',
        'Graphs – Straight Lines, Quadratics, Real-Life Graphs',
        'Ratio and Proportion – Direct and Inverse Proportion, Financial Maths',
      ],
      3: [ // Calculator (Higher only)
        'Problem Solving – Multi-Step Reasoning Across All Topic Areas',
        'Further Algebra – Functions, Algebraic Proof, Iteration',
        'Further Geometry – Sine/Cosine Rule, Trigonometric Graphs',
        'Further Statistics – Histograms, Cumulative Frequency',
      ],
    }},

    'English Language': { papers: {
      1: [
        'Reading – Literary Prose Extract: Comprehension and Language Analysis',
        'Reading – Comparing Two Texts',
        'Writing – Narrative or Descriptive Writing',
        'Writing Skills: Technical Accuracy, Sentence Variety, Tone',
      ],
      2: [
        'Reading – Non-Fiction: Viewpoints and Perspectives',
        'Reading – Comparing a Non-Fiction and a 19th-Century Text',
        'Writing – Persuasive or Informative Writing (Article, Letter, Speech)',
        'Writing Skills: Rhetorical Devices, Register and Audience',
      ],
    }},

    'English Literature': { papers: {
      1: [
        'Section A – Shakespeare: Extract Question + Essay',
        'Section B – Poetry: Comparing Two Poems from the Anthology',
      ],
      2: [
        'Section A – Prose and Drama: Pre-20th Century and 20th/21st Century',
        'Section B – Unseen Poetry: Analysis and Comparison',
      ],
    }},

    'Biology': { papers: {
      1: [
        'Unit 1 – Cells: Cell Structure, Cell Division, Transport (Diffusion, Osmosis, Active Transport)',
        'Unit 2 – Biological Systems: Digestion, Breathing, Heart and Blood',
        'Unit 3 – Micro-organisms and Disease: Pathogens, Immunity, Vaccination',
        'Unit 4 – Plant Biology: Photosynthesis, Transpiration',
        'Required Practicals: Osmosis, Microscopy, Photosynthesis Rate',
      ],
      2: [
        'Unit 5 – Genetics: DNA, Inheritance, Genetic Disorders',
        'Unit 6 – Variation and Evolution: Natural Selection, Classification',
        'Unit 7 – Ecology: Ecosystems, Material Cycles, Biodiversity',
        'Unit 8 – Homeostasis: Nervous System, Hormones, Kidneys',
        'Required Practicals: Sampling, Reaction Time',
      ],
    }},

    'Chemistry': { papers: {
      1: [
        'Unit 1 – Atoms, Elements and Compounds: Atomic Structure, Periodic Table, Bonding',
        'Unit 2 – Reactions: Types of Reaction, Energy Changes',
        'Unit 3 – Quantitative Chemistry: Moles, Yield, Concentration',
        'Unit 4 – Electrolysis and Extraction of Metals',
        'Required Practicals: Titration, Preparation of a Salt',
      ],
      2: [
        'Unit 5 – Organic Chemistry: Hydrocarbons, Alkenes, Polymers',
        'Unit 6 – Rate of Reaction and Equilibrium',
        'Unit 7 – Chemical Analysis: Chromatography, Flame Tests, Ion Tests',
        'Unit 8 – Earth\'s Atmosphere and Using Resources',
        'Required Practicals: Rate of Reaction, Chromatography',
      ],
    }},

    'Physics': { papers: {
      1: [
        'Unit 1 – Energy: Stores, Transfers, Power, Efficiency',
        'Unit 2 – Electricity: Circuits, Ohm\'s Law, Mains Electricity',
        'Unit 3 – Waves: Properties, Sound, Light, EM Spectrum',
        'Unit 4 – Matter: Density, States of Matter, Gas Laws',
        'Required Practicals: SHC, Resistance, I-V Characteristics',
      ],
      2: [
        'Unit 5 – Forces: Newton\'s Laws, Work, Momentum',
        'Unit 6 – Atomic Structure and Radioactivity: Types, Half-Life, Fission, Fusion',
        'Unit 7 – Magnetism: Motor Effect, Induction, Transformers',
        'Unit 8 – Space: Solar System, Life Cycle of Stars, the Universe',
        'Required Practicals: Waves, Acceleration, Density',
      ],
    }},

    'Computer Science': { papers: {
      1: [
        'Component 1 – Computer Systems: CPU, Memory, Storage, Networks, Security',
        'Component 1 – Systems Software: OS, Utility Programs, Translators',
        'Component 1 – Representation of Data: Binary, Hex, ASCII, Images, Sound, Compression',
        'Component 1 – Principles of Programming: Variables, Sequence, Selection, Iteration',
        'Component 1 – Programming Languages: High vs Low Level, Translators',
        'Component 1 – Ethical and Legal Issues: Legislation, Privacy, Sustainability',
      ],
      2: [
        'Component 2 – Algorithms and Programming: Decomposition, Abstraction',
        'Component 2 – Searching and Sorting Algorithms',
        'Component 2 – Programming Constructs: Arrays, Subroutines, File Handling',
        'Component 2 – Logic Gates and Boolean Algebra',
        'Component 2 – Practical Programming: Python/Other Language (NEA)',
      ],
    }},

    'Geography': { papers: {
      1: [
        'Theme 1 – Changing Places: Cities (UK Urban Change)',
        'Theme 2 – Changing Environments: Coasts, Rivers, Glaciers',
        'Theme 3 – Environmental Challenges: Climate Change, Natural Hazards',
      ],
      2: [
        'Theme 4 – Unequal Development: Development Gap, Strategies',
        'Theme 5 – Development and Resource Issues: Food, Water, Energy',
        'Theme 6 – Wales and the Wider World: Welsh Context',
      ],
      3: [
        'Component 3 – Applied and Issues-Based Geography',
        'Fieldwork: Two Investigations (Physical and Human)',
        'Geographical Skills: Maps, Statistics, Graphs',
      ],
    }},

    'History': { papers: {
      1: [
        'Changes in Health and Medicine c.1345–Present (Wales and Britain)',
        'Changes in Crime and Punishment c.1500–Present (Wales and Britain)',
        'A Study of the Historic Environment',
      ],
      2: [
        'Depth Study Options: Germany 1919–45 / The USA 1929–2000 / Conflict in the Middle East',
        'Breadth Study: The Development of the USA 1929–2000',
        'Welsh History Study',
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

    'English Language': { papers: {
      1: [
        'Reading – Unit 1: Personal Response to Fiction and Literary Non-Fiction',
        'Reading – Analysing Language and Structure in Literary Texts',
        'Writing – Personal and Imaginative Writing (narrative, descriptive)',
        'Writing – Transactional Writing: Letters, Articles, Speeches (formal and informal)',
      ],
      2: [
        'Reading – Unit 2: Response to Non-Fiction and Media Texts',
        'Reading – Comparing Non-Fiction Texts: Viewpoint, Purpose, Audience',
        'Writing – Functional Writing: Reports, Reviews, Information Texts',
        'Writing – Discursive Writing: Argument and Persuasion',
        'Speaking and Listening – Controlled Assessment (internally assessed)',
      ],
    }},

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
// A-LEVEL
// ─────────────────────────────────────────────────────────────────────────────

const ALEVEL = {

  AQA: {

    // ── A-Level Mathematics ────────────────────────────────────────────────────
    'Mathematics': { papers: {
      1: [ // Pure 1
        'Algebra and Functions: Laws of Indices, Surds, Algebraic Fractions',
        'Algebra and Functions: Partial Fractions',
        'Algebra and Functions: Modulus Function, Composite and Inverse Functions',
        'Quadratics: Discriminant, Completing the Square, Hidden Quadratics',
        'Equations and Inequalities: Linear and Quadratic Inequalities, Set Notation',
        'Coordinate Geometry: Straight Lines, Circles',
        'Sequences and Series: Arithmetic and Geometric Series, Sigma Notation',
        'Binomial Expansion: (1+x)^n for any n (Maclaurin — not on spec), (a+bx)^n',
        'Trigonometry: Radians, Arc Length, Sector Area',
        'Trigonometry: Identities (sin²+cos²=1, tanθ=sinθ/cosθ)',
        'Trigonometry: Solving Trig Equations in Given Intervals',
        'Exponentials and Logarithms: e^x, ln x, Laws of Logarithms',
        'Differentiation: Polynomials, Chain Rule, Product Rule, Quotient Rule',
        'Differentiation: Trigonometric, Exponential and Logarithmic Functions',
        'Differentiation: Implicit Differentiation, Parametric Differentiation',
        'Integration: Polynomials, Reverse Chain Rule',
        'Integration: Substitution, Integration by Parts',
        'Integration: Partial Fractions, Definite Integrals, Area Under and Between Curves',
        'Numerical Methods: Iteration, Newton-Raphson, Trapezium Rule',
        'Proof: Proof by Contradiction, Proof by Counter-Example',
        'Vectors: 2D and 3D, Dot Product, Angle Between Vectors',
      ],
      2: [ // Pure 2 (same content pool, different selection)
        'Further Algebra: Proof by Induction (Further topic sometimes included)',
        'Further Trigonometry: Addition Formulae, Double Angle, R sin(x ± α)',
        'Further Calculus: Differential Equations (Separating Variables)',
        'Further Calculus: Volumes of Revolution (sometimes set here)',
        'Further Sequences: Recurrence Relations',
        'Parametric Equations: Sketching, Differentiating, Integrating',
        'Coordinate Geometry in 2D and 3D',
      ],
      3: [ // Statistics and Mechanics
        // Statistics
        'Statistics – Data Representation: Histograms, Box Plots, Cumulative Frequency',
        'Statistics – Summary Measures: Mean, Variance, Standard Deviation (by formula and calculator)',
        'Statistics – Probability: Conditional Probability, Bayes\' Theorem',
        'Statistics – Discrete Distributions: Binomial Distribution, Expected Value',
        'Statistics – Continuous Distributions: Normal Distribution, Standardising',
        'Statistics – Hypothesis Testing: One and Two-Tailed Tests, Significance Levels',
        'Statistics – Correlation: Product Moment Correlation Coefficient, Hypothesis Test for r',
        'Statistics – The Large Data Set (AQA): Interpreting and Applying Weather Data',
        // Mechanics
        'Mechanics – Kinematics: SUVAT Equations, Velocity-Time Graphs',
        'Mechanics – Forces: Newton\'s Three Laws, Resolving Forces',
        'Mechanics – Forces: Friction, Normal Reaction, Inclined Planes',
        'Mechanics – Forces: Connected Particles, Strings, Pulleys',
        'Mechanics – Moments: Moments About a Point, Equilibrium of a Rigid Body',
        'Mechanics – Projectiles: Horizontal and Angled Projection',
        'Mechanics – Variable Acceleration: Using Calculus (Differentiation and Integration)',
      ],
    }},

    // ── A-Level Further Mathematics ────────────────────────────────────────────
    'Further Mathematics': { papers: {
      1: [ // Mandatory Core Pure 1
        'Complex Numbers: Cartesian Form, Modulus-Argument Form',
        'Complex Numbers: de Moivre\'s Theorem, Roots of Unity',
        'Complex Numbers: Loci in the Argand Diagram',
        'Matrices: Multiplication, Determinant, Inverse (2×2 and 3×3)',
        'Matrices: Eigenvalues and Eigenvectors',
        'Matrices: Linear Transformations in 2D and 3D',
        'Further Algebra: Roots of Polynomials (Vieta\'s Formulae)',
        'Further Algebra: Method of Differences, Series Summation (Σr, Σr², Σr³)',
        'Proof by Induction: Series, Divisibility, Matrix Powers',
        'Further Calculus: Improper Integrals, Mean Value, Arc Length',
        'Further Calculus: Maclaurin Series',
        'Polar Coordinates: Plotting, Area Enclosed by a Curve',
        'Hyperbolic Functions: sinh, cosh, tanh, Inverse Hyperbolics',
        'Differential Equations: Second-Order ODEs (Complementary Function + Particular Integral)',
      ],
      2: [ // Mandatory Core Pure 2
        'Further Vectors: Vector Equation of Line and Plane',
        'Further Vectors: Intersection, Distance Between Lines',
        'Further Vectors: Scalar Triple Product',
        'Further Number Theory: Modular Arithmetic, Fermat\'s Little Theorem',
        'Further Coordinate Systems: Parabola, Ellipse, Hyperbola (Cartesian and Parametric)',
        'Inequalities: Algebraic, Graphical Methods',
        'Groups: Definition, Cayley Tables, Cyclic Groups, Isomorphisms',
        'Further Complex Numbers: nth Roots, Geometric Interpretation',
      ],
      3: [ // Optional (most common: Stats/Mechanics/Discrete)
        // Further Statistics
        'Further Statistics – Continuous Distributions: Uniform, Exponential',
        'Further Statistics – Hypothesis Testing: Chi-Squared Test for Contingency Tables',
        'Further Statistics – Poisson Distribution: Properties, Approximation to Binomial',
        // Further Mechanics
        'Further Mechanics – Impulse and Momentum: Coefficient of Restitution, Collisions',
        'Further Mechanics – Work, Energy, Power: Elastic Potential Energy',
        'Further Mechanics – Circular Motion: Angular Velocity, Centripetal Force',
        'Further Mechanics – Simple Harmonic Motion: SHM Equations, Pendulum',
        // Discrete / Decision
        'Decision – Algorithms: Sorting, Bin Packing, Floyd\'s, Dijkstra\'s',
        'Decision – Graph Theory: Spanning Trees (Kruskal\'s, Prim\'s)',
        'Decision – Flows in Networks: Maximum Flow, Min-Cut',
        'Decision – Linear Programming: Graphical and Simplex Method',
        'Decision – Game Theory: Pay-Off Matrices, Stable Solutions',
      ],
    }},

    // ── A-Level Statistics ─────────────────────────────────────────────────────
    'Statistics': { papers: {
      1: [
        'Data Collection: Sampling Methods and Their Limitations',
        'Data Presentation: Stem-and-Leaf, Box Plots, Histograms',
        'Summary Measures: Mean, Variance, Standard Deviation, Coding',
        'Probability: Basic Rules, Conditional, Bayes\' Theorem',
        'Discrete Distributions: Binomial, Poisson',
        'Continuous Distributions: Normal Distribution and Standardising',
        'Regression: Least Squares Regression Line, PMCC',
        'Hypothesis Testing: Binomial and Normal Context',
      ],
      2: [
        'Estimation: Sampling Distributions, Confidence Intervals',
        'Further Hypothesis Testing: t-test, χ²-test',
        'Non-Parametric Tests: Sign Test, Wilcoxon Signed-Rank, Spearman\'s Rank',
        'Time Series and Index Numbers',
        'Quality Control: Control Charts, CUSUM',
      ],
    }},

    // ── A-Level Biology ────────────────────────────────────────────────────────
    'Biology': { papers: {
      1: [
        // 1 – Biological Molecules
        '1.1 – Biological Molecules: Monomers and Polymers',
        '1.1 – Biological Molecules: Carbohydrates (Monosaccharides, Disaccharides, Polysaccharides)',
        '1.1 – Biological Molecules: Lipids (Triglycerides, Phospholipids)',
        '1.1 – Biological Molecules: Proteins (Amino Acids, Peptide Bonds, Primary–Quaternary Structure)',
        '1.1 – Biological Molecules: Enzymes (Mechanism, Factors, Inhibition)',
        '1.1 – Biological Molecules: Nucleic Acids (DNA, RNA, ATP)',
        '1.1 – Biological Molecules: Water and Inorganic Ions',
        // 2 – Cells
        '2.1 – Cell Structure: Prokaryotic and Eukaryotic Cells (Ultrastructure)',
        '2.1 – Cell Structure: Cell Fractionation and Ultracentrifugation',
        '2.2 – Cell Division: Mitosis, Meiosis and the Cell Cycle',
        '2.3 – Cell Transport: Fluid Mosaic Model, Diffusion, Osmosis, Active Transport',
        '2.4 – Cell Recognition: Immune Response, Antigens, Antibodies, Vaccinations',
        // 3 – Organisms Exchange Substances
        '3.1 – Exchange Surfaces: Fick\'s Law, SA:V Ratio, Adaptations',
        '3.2 – Gas Exchange: Lungs, Fish Gills, Leaves (Stomata)',
        '3.2 – Gas Exchange: Spirometer Investigations',
        '3.3 – Digestion: Alimentary Canal, Enzymes, Absorption',
        '3.4 – Mass Transport: Haemoglobin and Oxygen Dissociation Curves',
        '3.4 – Mass Transport: Blood, Tissue Fluid, Lymph',
        '3.4 – Mass Transport: Heart Structure, Cardiac Cycle, Pressure Changes',
        '3.4 – Mass Transport: Xylem and Phloem, Transpiration and Translocation',
      ],
      2: [
        // 4 – Genetics, Variation and Relationships
        '4.1 – DNA and Protein Synthesis: Transcription, Translation, Genetic Code',
        '4.2 – Genetic Diversity: Mutations, Meiosis and Genetic Variation',
        '4.2 – Genetic Diversity: Species and Taxonomy',
        '4.3 – Genetic Information and Variation: Monohybrid and Dihybrid Crosses',
        '4.3 – Genetic Information and Variation: Epistasis, Linkage, Chi-Squared',
        '4.3 – Adaptation, Speciation, Selection: Natural and Artificial Selection',
        '4.3 – Biodiversity: Species Richness, Simpson\'s Index, Conservation',
        // 5 – Energy Transfers
        '5.1 – Photosynthesis: Light-Dependent Reactions (Photophosphorylation)',
        '5.1 – Photosynthesis: Light-Independent Reactions (Calvin Cycle)',
        '5.2 – Respiration: Glycolysis, Link Reaction, Krebs Cycle, Oxidative Phosphorylation',
        '5.2 – Respiration: Anaerobic Respiration',
        // 6 – Organisms Respond to Their Environments
        '6.1 – Stimuli and Responses: Taxes and Kineses, Peripheral and Central Nervous Systems',
        '6.2 – Nervous Coordination: Nerve Impulse (Resting and Action Potential)',
        '6.2 – Nervous Coordination: Synapses and Neurotransmitters',
        '6.3 – Skeletal Muscles: Sliding Filament Model, Slow and Fast Twitch',
        '6.4 – Homeostasis: Negative Feedback, Temperature Regulation',
        '6.5 – The Kidneys: Ultrafiltration, Selective Reabsorption, ADH and Osmoregulation',
        '6.6 – Hormonal Regulation: Endocrine Glands, Adrenaline, Insulin and Glucagon',
        '6.6 – Hormonal Regulation: Control of Blood Glucose, Diabetes',
        '6.7 – Plant Responses: Auxin, Gibberellins, Abscisic Acid, Photoperiodism',
      ],
      3: [ // Paper 3 — any topic + practical skills + essay
        '7.1 – Inheritance: Autosomal and Sex-Linked Inheritance, Epistasis',
        '7.2 – Populations and Evolution: Hardy-Weinberg Principle',
        '7.3 – Populations in Ecosystems: Succession, Sampling, Interaction',
        '8.1 – Gene Expression: Totipotency, Stem Cells, Epigenetics',
        '8.2 – Regulation of Gene Expression: Lac Operon, siRNA',
        '8.3 – Using Genome Projects: Genetic Fingerprinting, Sequencing',
        '8.4 – Gene Technologies: Recombinant DNA, PCR, Electrophoresis, GM Organisms',
        'Required Practical Skills: Microscopy, Chromatography, Dissection, Respirometer',
        'Essay: One Continuous Extended Writing Essay (25 marks)',
      ],
    }},

    // ── A-Level Chemistry ──────────────────────────────────────────────────────
    'Chemistry': { papers: {
      1: [
        // Physical
        '1.1 – Atomic Structure: Sub-atomic Particles, Mass Spec, Electron Config',
        '1.2 – Amount of Substance: Moles, Empirical/Molecular Formula, Gas Volumes',
        '1.3 – Bonding: Ionic, Covalent, Metallic, Intermolecular Forces',
        '1.4 – Energetics: Enthalpy Changes, Hess\'s Law, Born-Haber Cycles',
        '1.5 – Kinetics: Rate of Reaction, Arrhenius Equation',
        '1.6 – Equilibria: Le Chatelier\'s Principle, Kc and Kp',
        '1.7 – Oxidation, Reduction and Redox Equations',
        '3.1 – Further Thermodynamics: Lattice Enthalpy, Entropy, Gibbs Free Energy',
        '3.2 – Further Kinetics: Rate Equations, Orders, Mechanisms',
        '3.3 – Further Equilibria: Kw, pH, Buffer Solutions',
        '3.4 – Electrode Potentials and Cells',
        // Inorganic
        '2.1 – Periodicity: Trends Across Period 3 (Oxides, Chlorides)',
        '2.2 – Group 2: Alkaline Earth Metals (Reactions and Uses)',
        '2.3 – Group 7: Halogens (Reactivity, Disproportionation)',
        '3.2 – Period 3 Chemistry: Na, Mg, Al and Their Compounds',
        '3.3 – Transition Metals: Electronic Config, Complex Ions, Colour, Catalysis',
        '3.3 – Transition Metals: Ligand Substitution, Stability Constants',
        // Organic
        '2.4 – Nomenclature: IUPAC Naming, Structural Isomerism',
        '2.5 – Alkanes: Free Radical Substitution, Combustion',
        '2.6 – Halogenoalkanes: Nucleophilic Substitution (SN1 and SN2)',
        '2.7 – Alkenes: Electrophilic Addition, Polymerisation',
        '2.8 – Alcohols: Oxidation, Esterification, Dehydration',
        '2.9 – Analytical Techniques: Mass Spec, IR Spectroscopy',
      ],
      2: [
        // Further Organic
        '3.5 – Benzene: Structure, Electrophilic Substitution',
        '3.6 – Carbonyl Compounds: Aldehydes and Ketones (Nucleophilic Addition)',
        '3.7 – Carboxylic Acids and Esters',
        '3.8 – Amines: Basicity, Nucleophilic Substitution, Diazonium Salts',
        '3.9 – Amino Acids, Proteins and DNA',
        '3.10 – Polymerisation: Addition and Condensation Polymers',
        '3.11 – Organic Synthesis: Multi-Step Pathways',
        '3.12 – NMR Spectroscopy: ¹H NMR, Chemical Shift, Integration, Splitting',
        '3.12 – Chromatography: TLC, GC, HPLC',
        'Practical Skills: Required Practicals (all 12 AQA Required Practicals)',
      ],
      3: [ // Paper 3 — mixed
        'Physical Chemistry: Any from Papers 1 and 2',
        'Inorganic Chemistry: Any from Papers 1 and 2',
        'Organic Chemistry: Any from Papers 1 and 2',
        'Required Practical Questions: Evaluating Experimental Methods',
        'Data Analysis: Interpreting Graphs, Spectra and Experimental Results',
      ],
    }},

    // ── A-Level Physics ────────────────────────────────────────────────────────
    'Physics': { papers: {
      1: [
        // Measurements and Their Errors
        '1 – Measurements: SI Units, Prefixes, Significant Figures',
        '1 – Measurements: Uncertainty (Absolute, Percentage, Combining Uncertainties)',
        // Particles and Radiation
        '2 – Particles: Atomic Structure, Stable and Unstable Nuclei',
        '2 – Particles: Fundamental Particles (Hadrons, Leptons, Quarks)',
        '2 – Particles: Particle Interactions (The Four Fundamental Forces)',
        '2 – Particles: Conservation Laws',
        '2 – Electromagnetic Radiation: Wave-Particle Duality, Photoelectric Effect',
        '2 – Electromagnetic Radiation: Electron Energy Levels, Line Spectra',
        // Waves
        '3 – Waves: Progressive Waves (Transverse and Longitudinal)',
        '3 – Waves: Superposition, Interference, Standing Waves, Diffraction',
        '3 – Waves: Refraction, Snell\'s Law, Total Internal Reflection',
        '3 – Waves: Diffraction Grating',
        // Mechanics and Materials
        '4 – Mechanics: Moments, Stability, Vectors and Scalars',
        '4 – Mechanics: Work, Energy and Power',
        '4 – Mechanics: Conservation of Energy and Efficiency',
        '5 – Newton\'s Laws: F = ma, Impulse and Momentum',
        '5 – Newton\'s Laws: Projectile Motion',
        '6 – Materials: Density, Hooke\'s Law, Stress and Strain',
        '6 – Materials: Young\'s Modulus and Elastic Strain Energy',
        // Electricity
        '7 – Electricity: Charge, Current, Potential Difference and Resistance',
        '7 – Electricity: Ohm\'s Law, I-V Characteristics',
        '7 – Electricity: Resistivity',
        '7 – Electricity: Series and Parallel Circuits, EMF and Internal Resistance',
        '7 – Electricity: The Potential Divider',
      ],
      2: [
        // Further Mechanics and Thermal
        '8 – Further Mechanics: Circular Motion (Angular Velocity, Centripetal Force)',
        '8 – Further Mechanics: Simple Harmonic Motion (SHM Equations)',
        '8 – Further Mechanics: SHM — Energy and Damping',
        '8 – Thermal Physics: Internal Energy, Temperature Scales',
        '8 – Thermal Physics: Specific Heat Capacity and Latent Heat',
        '8 – Thermal Physics: Ideal Gas Laws and the Boltzmann Constant',
        // Fields and Nuclear Physics
        '9 – Gravitational Fields: Newton\'s Law, g, Potential, Satellite Orbits',
        '9 – Electric Fields: Coulomb\'s Law, Field Strength, Potential',
        '9 – Capacitance: Charge, Energy Storage, Charging and Discharging',
        '10 – Magnetic Fields: Flux Density, Force on a Conductor (F = BIl)',
        '10 – Magnetic Fields: Force on a Moving Charge (F = BQv)',
        '10 – Electromagnetic Induction: Faraday\'s and Lenz\'s Law',
        '10 – Electromagnetic Induction: Transformers, AC Generators',
        '11 – Nuclear Physics: Radioactive Decay, Half-Life, Activity',
        '11 – Nuclear Physics: Nuclear Radius, Binding Energy, Fission and Fusion',
      ],
      3: [ // Paper 3 — Section A: Practical + Section B: Optional Topic
        'Section A – Practical Skills: Analysing and Evaluating Experiments',
        'Section A – Practical Skills: Graphs, Uncertainties, Error Analysis',
        // Optional Topics (choose one)
        'Option A – Astrophysics: Telescopes, Stars, Cosmology, Dark Matter',
        'Option B – Medical Physics: X-Rays, Ultrasound, MRI, Nuclear Medicine',
        'Option C – Engineering Physics: Rotational Dynamics, Thermodynamics',
        'Option D – Turning Points in Physics: Electron, Relativity, Wave-Particle Duality',
        'Option E – Electronics: Op-Amps, Sensors, Data Communication',
      ],
    }},

    // ── A-Level Computer Science ───────────────────────────────────────────────
    'Computer Science': { papers: {
      1: [
        '1.1 – The Characteristics of Contemporary Processors: CPU Components, FDE Cycle',
        '1.1 – Processor Types: RISC vs CISC, Multi-Core, GPUs, Co-Processors',
        '1.1 – Structure of the Internet: IP Addressing, Routing, Protocols',
        '1.1 – Internet Security: Firewalls, Encryption, TLS/SSL, Public/Private Key',
        '1.2 – Software and Software Development: System Software, OS Functions',
        '1.2 – Software: Programming Paradigms (Procedural, OOP, Functional, Declarative)',
        '1.3 – Exchanging Data: Databases (Relational Model, SQL, Normal Forms)',
        '1.3 – Exchanging Data: Networks, Web Technologies, JSON, XML',
        '1.4 – Data Types and Structures: Primitive Data Types',
        '1.4 – Data Structures: Arrays, Stacks, Queues, Linked Lists, Trees, Graphs, Hash Tables',
        '1.4 – Boolean Algebra: De Morgan\'s Laws, Karnaugh Maps, Logic Gates',
        '1.5 – Legal, Moral, Cultural and Ethical Issues: Legislation, AI Ethics, Digital Divide',
      ],
      2: [
        '2.1 – Elements of Computational Thinking: Abstraction, Decomposition',
        '2.1 – Problem Solving: Backtracking, Divide and Conquer, Dynamic Programming',
        '2.2 – Problem Solving and Programming: OOP in Depth (Inheritance, Polymorphism)',
        '2.2 – Programming: Recursion, Higher-Order Functions',
        '2.3 – Algorithms: Sorting (Quicksort, Mergesort, Heapsort)',
        '2.3 – Algorithms: Searching (Binary Search, Hashing)',
        '2.3 – Algorithms: Graph Algorithms (BFS, DFS, Dijkstra\'s, Floyd\'s)',
        '2.3 – Algorithms: Complexity (Big O Notation: O(1), O(n), O(n²), O(log n))',
        '2.3 – Computability: Turing Machines, Halting Problem, Limits of Computation',
        '2.3 – Regular Languages: FSMs, Regular Expressions, Context-Free Grammars',
        'NEA – Programming Project (worth 20% of A-Level)',
      ],
    }},

    // ── A-Level English Language ───────────────────────────────────────────────
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
      ],
      2: [
        'Language and Power: Institutional Discourse (Courtrooms, Classrooms, Interviews)',
        'Language and Power: Influential Language (Advertising, Political Speeches)',
        'Language and Gender: Further Analysis of Real Texts',
        'Language Methods: Phonological, Lexical, Grammatical, Discourse Analysis',
        'Non-Exam Assessment: Language Investigation (Independent Research)',
        'Non-Exam Assessment: Original Writing with Commentary',
        'Investigating Language: Methodology, Data Collection and Analysis',
      ],
    }},

    // ── A-Level English Literature ─────────────────────────────────────────────
    'English Literature': { papers: {
      1: [
        'Love Through the Ages — Poetry Pre-1900: Set Texts from the Anthology',
        'Love Through the Ages — Poetry Post-1900: Set Texts from the Anthology',
        'Love Through the Ages — Prose Set Text (e.g. Wuthering Heights, The Great Gatsby)',
        'Love Through the Ages — Drama Set Text (e.g. The Taming of the Shrew)',
        'Analytical Essay Writing: Argument, Evidence, Contextualisation',
        'Comparative Analysis: Comparing Two Texts from Different Genres or Periods',
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

    // ── A-Level History ────────────────────────────────────────────────────────
    'History': { papers: {
      1: [
        'Breadth Study: Europe and the World (chosen from list of periods)',
        'Period Study: Stuart Britain and the Crisis of Monarchy 1603–1702',
        'Period Study: Industrialisation and the People: Britain c.1783–1885',
        'Period Study: The Making of Modern Britain 1951–2007',
        'Period Study: The American Dream — Reality and Illusion 1945–1980',
        'Period Study: The Witch Craze in Britain, Europe and America c.1580–c.1750',
        'Essay Skills: Planning, Structuring and Evaluating Historical Arguments',
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
        'Historical Investigation (NEA): Independent Research on a Chosen Topic',
        'Historiography: Evaluating Historians\' Interpretations and Debates',
        'Essay and Source Evaluation Techniques',
      ],
    }},

    // ── A-Level Geography ──────────────────────────────────────────────────────
    'Geography': { papers: {
      1: [
        '1.1 – Water and Carbon Cycles: The Water Cycle (Drainage Basins, Stores, Flows)',
        '1.1 – Water and Carbon Cycles: The Carbon Cycle (Stores, Flows, Human Impact)',
        '1.1 – Water and Carbon Cycles: Water and Carbon Relationship and Climate',
        '1.2 – Coastal Systems and Landscapes: Systems Approach, Coastal Processes',
        '1.2 – Coastal Landscapes: Erosional and Depositional Landforms',
        '1.2 – Coastal Landscapes: Management — Hard and Soft Engineering, ICZM',
        '1.3 – Glacial Systems and Landscapes: Glacial Budget, Processes',
        '1.3 – Glacial Landscapes: Erosional and Depositional Landforms',
        '1.3 – Glacial Landscapes: Human Activity in Glacial Landscapes',
        '1.4 – Hazards: Nature and Forms of Natural Hazard',
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
        '2.4 – Population and the Environment: Population-Resource Relationships',
        '2.4 – Population: Theories (Malthus, Boserup), Migration',
      ],
      3: [
        '3.1 – Geography Fieldwork Investigation (NEA)',
        '3.2 – Synoptic Investigation: Applying Geographical Knowledge to a Pre-Release',
        'Geographical Skills: Statistical (Spearman\'s, Nearest Neighbour, Chi-Squared)',
        'Geographical Skills: Cartographic and Graphical Skills',
        'Geographical Skills: Qualitative Methods (Interviews, Questionnaires, Field Sketches)',
      ],
    }},

    // ── A-Level Business ───────────────────────────────────────────────────────
    'Business': { papers: {
      1: [
        'Theme 1 – What is Business?: Enterprise, Entrepreneurs, Business Objectives',
        'Theme 1 – The Market: Demand, Supply, Price Elasticity, Income Elasticity',
        'Theme 1 – Marketing: Market Research, Segmentation, Niche and Mass Markets',
        'Theme 1 – Financial Planning: Cash Flow, Profit, Break-Even',
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
        'Theme 4 – Business Decision-Making: Quantitative Methods (Decision Trees, Critical Path)',
        'Theme 4 – Evaluating Strategic Performance: KPIs, Financial and Non-Financial Measures',
        'Case Study Analysis: Applying Business Theory to Complex Business Scenarios',
      ],
    }},

    // ── A-Level Economics ──────────────────────────────────────────────────────
    'Economics': { papers: {
      1: [
        // Microeconomics
        'The Economic Problem and Resource Allocation',
        'Demand and Supply Analysis: Shifts, Equilibrium, Price Mechanism',
        'Elasticity: PED, PES, YED, XED',
        'Production and Costs: Short Run and Long Run, Economies of Scale',
        'Revenue and Profit: TR, AR, MR; Profit Maximisation',
        'Market Structures: Perfect Competition, Monopoly, Oligopoly, Monopolistic Competition',
        'Market Failure: Externalities, Public Goods, Information Asymmetry',
        'Government Intervention: Taxes, Subsidies, Regulations, Price Controls',
        'Labour Markets: Demand for and Supply of Labour, Wage Determination, Discrimination',
        'Income and Wealth Distribution: Lorenz Curve, Gini Coefficient',
      ],
      2: [
        // Macroeconomics
        'The Circular Flow of Income: Withdrawals and Injections',
        'National Income: GDP, GNP, Measuring Economic Growth',
        'The Business Cycle: Boom, Recession, Recovery',
        'Aggregate Demand: Components (C + I + G + X - M)',
        'Aggregate Supply: SRAS and LRAS',
        'Macroeconomic Policy Objectives: Growth, Unemployment, Inflation, BOP',
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
        'Application: Applying Theory to Real-World Economic Issues',
      ],
    }},

    // ── A-Level Sociology ──────────────────────────────────────────────────────
    'Sociology': { papers: {
      1: [
        'Education: The Role and Purpose of Education (Functionalist, Marxist, Feminist)',
        'Education: Differential Achievement by Social Class, Gender and Ethnicity',
        'Education: In-School Factors (Labelling, Setting, Hidden Curriculum, Marketisation)',
        'Education: Policies and New Right Perspective',
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
        'Theory and Methods (A-Level): Macro vs Micro Theories',
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

    // ── A-Level Psychology ─────────────────────────────────────────────────────
    'Psychology': { papers: {
      1: [
        'Social Influence: Conformity (Asch, Zimbardo), Types and Explanations',
        'Social Influence: Obedience (Milgram), Situational Factors',
        'Social Influence: Resistance to Social Influence, Minority Influence',
        'Social Influence: Social Change',
        'Memory: The Multi-Store Model (Atkinson and Shiffrin)',
        'Memory: The Working Memory Model (Baddeley and Hitch)',
        'Memory: Types of Long-Term Memory',
        'Memory: Factors Affecting Eyewitness Testimony (Loftus, Misleading Information)',
        'Memory: Cognitive Interview',
        'Attachment: Types of Attachment (Secure, Insecure-Avoidant, Insecure-Resistant)',
        'Attachment: Caregiver-Infant Interactions',
        'Attachment: Bowlby\'s Theory (Monotropy, Internal Working Model)',
        'Attachment: Ainsworth\'s Strange Situation and Cultural Variations',
        'Attachment: The Effects of Separation and Deprivation',
        'Psychopathology: Definitions of Abnormality',
        'Psychopathology: Mental Disorders (Phobias, OCD, Depression)',
        'Psychopathology: Treatments (CBT, Drug Therapy, Flooding, Systematic Desensitisation)',
      ],
      2: [
        'Approaches: Origins of Psychology, Introspection',
        'Approaches: Behaviourist Approach (Classical and Operant Conditioning)',
        'Approaches: Social Learning Theory (Bandura)',
        'Approaches: Cognitive Approach',
        'Approaches: Biological Approach (Genes, Neurochemistry, Brain Structure)',
        'Approaches: Psychodynamic Approach (Freud)',
        'Approaches: Humanistic Psychology (Maslow, Rogers)',
        'Biopsychology: The Nervous System and Endocrine System',
        'Biopsychology: Neurons and Synaptic Transmission',
        'Biopsychology: Localisation of Brain Function',
        'Biopsychology: Hemispheric Lateralisation (Split-Brain Research)',
        'Biopsychology: Sleep and Circadian Rhythms',
        'Research Methods: Experimental Designs, Sampling, Data Analysis',
        'Research Methods: Correlations, Observations, Case Studies, Interviews',
        'Research Methods: Statistical Tests (Chi-Squared, Mann-Whitney, Wilcoxon, Spearman\'s)',
        'Research Methods: BPS Ethical Guidelines',
      ],
      3: [
        'Issues and Debates: Gender Bias, Cultural Bias, Ethnocentrism',
        'Issues and Debates: Free Will vs Determinism, Reductionism vs Holism',
        'Issues and Debates: Nature vs Nurture, Idiographic vs Nomothetic',
        // Optional Topics (one chosen)
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

    // ── A-Level French ─────────────────────────────────────────────────────────
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

    // ── A-Level German ─────────────────────────────────────────────────────────
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

    // ── A-Level Spanish ────────────────────────────────────────────────────────
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

    // ── A-Level Music ──────────────────────────────────────────────────────────
    'Music': { papers: {
      1: [
        'Area of Study 1: Western Classical Music 1600–1900',
        'Area of Study 2: Popular Music and Jazz',
        'Area of Study 3: Music for Media',
        'Area of Study 4: Music of the 20th Century',
        'Harmony and Counterpoint: Stylistic Exercises, Figured Bass',
        'Music Analysis: Harmony, Tonality, Structure, Texture, Instrumentation',
        'Listening: Identifying Features of Unfamiliar Extracts',
        'Set Works: Specific Pieces from Each Area of Study',
      ],
      2: [
        'Performance (NEA): Solo and/or Ensemble, minimum 8 minutes',
        'Composition (NEA): Two Compositions (one to a brief, one free)',
        'Composition Skills: Melody Writing, Harmonisation, Orchestration',
      ],
    }},

    // ── A-Level Art & Design ───────────────────────────────────────────────────
    'Art & Design': { papers: {
      1: [
        'Component 1 – Personal Investigation: Sustained Creative Exploration',
        'AO1 – Develop: Critical and Contextual Research (Artists, Movements)',
        'AO2 – Explore: Experimentation with Media, Materials, Techniques and Processes',
        'AO3 – Record: Observational Drawing, Photo Journals, Process Documentation',
        'AO4 – Present: Personal Response (Major Project Outcome)',
        'Written Element: 1,000-word Critical and Contextual Essay',
        'Historical Movements: Impressionism, Expressionism, Cubism, Surrealism, Pop Art, Conceptual Art',
      ],
      2: [
        'Component 2 – Externally Set Assignment: 15-Hour Supervised Time',
        'Preparation Period: Research and Development Work',
        'Final Piece: Realising Creative Intentions Under Exam Conditions',
      ],
    }},

    // ── A-Level Law ────────────────────────────────────────────────────────────
    'Law': { papers: {
      1: [
        'The English Legal System: Sources of Law (Legislation, Case Law, Delegated Legislation)',
        'The English Legal System: Statutory Interpretation (Literal, Golden, Mischief, Purposive Rules)',
        'The English Legal System: Judicial Precedent (Stare Decisis, Ratio, Obiter)',
        'The English Legal System: Court Structure and Hierarchy',
        'The English Legal System: The Legal Profession (Solicitors, Barristers, Judges)',
        'The English Legal System: Access to Justice (Legal Aid, Funding)',
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
        'Tort Law: Nuisance (Private and Public)',
        'Tort Law: Defences (Consent, Contributory Negligence, Exclusion Clauses)',
        'Tort Law: Remedies (Damages — Special and General, Injunctions)',
        'Contract Law: Formation (Offer, Acceptance, Consideration, Intention)',
        'Contract Law: Terms (Express, Implied, Conditions, Warranties)',
        'Contract Law: Vitiating Factors (Misrepresentation, Duress, Undue Influence)',
        'Contract Law: Breach and Remedies',
      ],
      3: [
        'Human Rights Law: The Human Rights Act 1998, ECHR Articles',
        'Law of Equity: Principles of Equity, Equitable Remedies (Specific Performance)',
        'Criminal Law and Tort in Context: Application to Scenarios',
        'Perspectives on Law: Justice, Morality, Policy',
        'NEA Option: Evaluating the Law in Context',
      ],
    }},

    // ── A-Level Philosophy ─────────────────────────────────────────────────────
    'Philosophy': { papers: {
      1: [
        'Epistemology: Perception — Direct and Indirect Realism, Idealism',
        'Epistemology: The Concept of Knowledge — JTB, Gettier Problems',
        'Epistemology: Rationalism vs Empiricism (Descartes, Hume, Kant)',
        'Epistemology: The Relationship Between Reason and Experience',
        'Ethics: Normative Ethical Theories — Utilitarianism (Bentham, Mill, Act vs Rule)',
        'Ethics: Kantian Deontological Ethics (Categorical Imperative)',
        'Ethics: Aristotelian Virtue Ethics (Eudaimonia, Character)',
        'Applied Ethics: Stealing, Lying, Euthanasia, Sex Outside Marriage',
      ],
      2: [
        'Metaphysics of Mind: Substance Dualism (Descartes)',
        'Metaphysics of Mind: Physicalism (Type Identity, Token Identity)',
        'Metaphysics of Mind: Functionalism and the Multiple Realisation Argument',
        'Metaphysics of Mind: Behaviourism (Logical and Philosophical)',
        'Metaphysics of God: Arguments for God\'s Existence (Ontological, Cosmological, Teleological)',
        'Metaphysics of God: Arguments Against God\'s Existence (Problem of Evil, Incoherence)',
        'Metaphysics of God: Religious Language (Verification, Falsification, Via Negativa)',
      ],
    }},

    // ── A-Level Accounting ─────────────────────────────────────────────────────
    'Accounting': { papers: {
      1: [
        'The Purpose of Accounting and Qualitative Characteristics',
        'Double-Entry Bookkeeping: The Accounting Equation',
        'Recording Business Transactions: Day Books, Ledgers, Trial Balance',
        'Financial Statements: Income Statement, Statement of Financial Position',
        'Sole Trader Accounts: Adjustments (Accruals, Prepayments, Depreciation, Bad Debts)',
        'Partnership Accounts: Appropriation Account, Current Accounts, Goodwill',
        'Manufacturing Accounts: Prime Cost, Factory Cost, Cost of Production',
        'Costing: Marginal vs Absorption Costing, Break-Even Analysis',
        'Inventory Valuation: FIFO, LIFO, AVCO',
      ],
      2: [
        'Limited Company Accounts: Share Capital, Dividends, Reserves',
        'Cash Flow Statements: Direct and Indirect Method',
        'Interpretation of Financial Statements: Ratios (Profitability, Liquidity, Efficiency)',
        'Budgeting: Preparation and Variance Analysis',
        'Standard Costing: Variance Analysis (Material, Labour, Overhead)',
        'Capital Investment Appraisal: Payback, ARR, NPV',
        'Ethics in Accounting: Professional Conduct and Duties',
      ],
    }},

    // ── A-Level Politics ───────────────────────────────────────────────────────
    'Politics': { papers: {
      1: [
        'UK Government: Parliament (House of Commons and House of Lords)',
        'UK Government: The Prime Minister and Cabinet (Core Executive)',
        'UK Government: The Electoral System (FPTP, Proportional Systems)',
        'UK Government: Political Parties (Conservatives, Labour, Lib Dems)',
        'UK Government: Pressure Groups and Their Influence',
        'UK Government: The Constitution (Nature, Key Principles, Debates on Reform)',
        'UK Government: The Judiciary (Supreme Court, Judicial Review, Independence)',
        'UK Government: Devolution (Scotland, Wales, Northern Ireland)',
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
        'Political Ideas: Conservatism (Traditional and New Right)',
        'Political Ideas: Socialism (Marxism, Social Democracy, Third Way)',
        'Political Ideas: Nationalism, Feminism, Multiculturalism, Anarchism',
        'Political Ideas: Applying Ideologies to Contemporary Political Issues',
      ],
    }},

    // ── A-Level Religious Studies ──────────────────────────────────────────────
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

    // ── A-Level Physical Education ─────────────────────────────────────────────
    'Physical Education': { papers: {
      1: [
        'Applied Anatomy and Physiology: Skeletal, Muscular and Cardiovascular Systems',
        'Applied Anatomy and Physiology: Respiratory System and Gas Exchange',
        'Applied Anatomy and Physiology: Energy Systems (ATP-PC, Lactic Acid, Aerobic)',
        'Applied Anatomy and Physiology: Neuromuscular System',
        'Applied Anatomy and Physiology: Environmental Effects on Performance',
        'Exercise Physiology: Diet and Nutrition, Ergogenic Aids',
        'Exercise Physiology: Fitness Testing, Training Methods and Periodisation',
        'Biomechanics: Newton\'s Laws Applied to Sport',
        'Biomechanics: Levers, Projectiles, Centre of Mass',
        'Biomechanics: Angular Motion (Moment of Inertia, Angular Velocity)',
        'Biomechanics: Fluid Mechanics (Drag, Lift, Bernoulli)',
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
        'NEA – Performance: Practical Activity (Individual, Team, OAA)',
        'NEA – Analytical Investigation: Written Analysis of Performance',
      ],
    }},

    // ── A-Level Media Studies ──────────────────────────────────────────────────
    'Media Studies': { papers: {
      1: [
        'Component 1: Investigating the Media',
        'Media Language: Theoretical Framework (Semiotics, Narrative, Genre)',
        'Representation: Gender, Ethnicity, Sexuality, Class, Age, Disability',
        'Media Industries: Ownership, Regulation, Funding Models',
        'Audiences: Mass Audience vs Niche, Digital Audiences',
        'Set Products: Newspapers, Advertising, Music Video, Online Media',
        'Key Theorists: Barthes, Levi-Strauss, Neale, Hall, Gauntlett, Curran, Jenkins',
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

    // ── A-Level Drama and Theatre ──────────────────────────────────────────────
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

    // ── A-Level Latin ──────────────────────────────────────────────────────────
    'Latin': { papers: {
      1: [
        'Verse Literature: Set Texts (Virgil\'s Aeneid, Ovid\'s Metamorphoses or similar)',
        'Prose Literature: Set Texts (Cicero, Livy or similar)',
        'Unseen Translation: Prose',
        'Unseen Translation: Verse',
        'Language: Full Latin Grammar (all noun declensions, verb conjugations, participles)',
        'Language: Indirect Speech (Accusative + Infinitive, Subjunctive)',
        'Language: Gerunds, Gerundives, Supine',
        'Language: Complex Conditional Sentences',
        'Roman Contexts: History, Culture and Society Related to Set Texts',
      ],
    }},

    // ── A-Level Classical Greek ────────────────────────────────────────────────
    'Classical Greek': { papers: {
      1: [
        'Verse Literature: Homer\'s Iliad or Odyssey (Set Passages)',
        'Prose Literature: Plato, Herodotus or Thucydides (Set Passages)',
        'Unseen Translation: Prose and Verse',
        'Language: Full Greek Grammar (all noun declensions, verb conjugations, participles)',
        'Language: Indirect Speech, Optative Mood, Participle Constructions',
        'Greek Contexts: History, Myth and Society Related to Set Texts',
      ],
    }},

  }, // end AQA A-Level

  // ── EDEXCEL A-LEVEL ──────────────────────────────────────────────────────────
  Edexcel: {

    'Mathematics': { papers: {
      1: [
        'Pure 1 – Algebra and Functions, Coordinate Geometry, Sequences, Binomial',
        'Pure 1 – Trigonometry, Exponentials and Logarithms',
        'Pure 1 – Differentiation (Chain, Product, Quotient Rule)',
        'Pure 1 – Integration (Substitution, by Parts, Definite Integrals)',
        'Pure 1 – Vectors, Proof',
      ],
      2: [
        'Pure 2 – Functions, Partial Fractions, Further Trig Identities',
        'Pure 2 – Parametric Equations, Further Differentiation',
        'Pure 2 – Further Integration, Differential Equations',
        'Pure 2 – Numerical Methods',
      ],
      3: [
        'Statistics 1: Data, Distributions (Binomial, Normal), Hypothesis Testing',
        'Mechanics 1: Kinematics, SUVAT, Newton\'s Laws, Projectiles, Moments',
      ],
    }},

    'Further Mathematics': { papers: {
      1: [
        'Core Pure 1: Complex Numbers, Matrices, Series, Proof by Induction',
        'Core Pure 1: Roots of Polynomials, Volumes of Revolution',
      ],
      2: [
        'Core Pure 2: Differential Equations, Maclaurin, Polar Coordinates, Hyperbolic Functions',
        'Further Pure 1: Further Calculus, Further Differential Equations',
      ],
      3: [
        'Further Statistics 1: Poisson, Chi-Squared, PMCC',
        'Further Mechanics 1: Elastic Strings, Circular Motion, SHM',
        'Decision Maths 1: Algorithms, Graphs, Linear Programming',
      ],
    }},

    'Biology': { papers: {
      1: [
        'Topic 1 – Biological Molecules',
        'Topic 2 – Cells, Viruses and Reproduction',
        'Topic 3 – Classification and Biodiversity',
        'Topic 4 – Exchange and Transport',
        'Topic 5 – Energy for Biological Processes (Photosynthesis and Respiration)',
      ],
      2: [
        'Topic 6 – Microbiology and Pathogens',
        'Topic 7 – Modern Genetics',
        'Topic 8 – Origins of Genetic Variation',
        'Topic 9 – Control Systems',
        'Topic 10 – Ecosystems',
      ],
      3: [
        'All Topics: Synoptic Paper + Practical Skills Questions',
        'Practical Skills: All Edexcel Required Practicals',
      ],
    }},

    'Chemistry': { papers: {
      1: [
        'Topic 1 – Atomic Structure and the Periodic Table',
        'Topic 2 – Bonding and Structure',
        'Topic 3 – Redox I',
        'Topic 4 – Inorganic Chemistry and the Periodic Table',
        'Topic 5 – Formulae, Equations and Amounts of Substance',
        'Topic 6 – Organic Chemistry I',
      ],
      2: [
        'Topic 7 – Modern Analytical Techniques I (MS, IR, NMR)',
        'Topic 8 – Energetics I',
        'Topic 9 – Kinetics I',
        'Topic 10 – Equilibrium I',
        'Topic 11 – Acids and Bases',
        'Topic 12 – Further Organic Chemistry',
      ],
      3: [
        'All Topics: Synoptic Paper',
        'Practical Skills: All Edexcel Required Practicals',
      ],
    }},

    'Physics': { papers: {
      1: [
        'Topic 1 – Motion',
        'Topic 2 – Forces and Newton\'s Laws',
        'Topic 3 – Work, Energy and Power',
        'Topic 4 – Materials',
        'Topic 5 – Waves and the Particle Nature of Light',
        'Topic 6 – Electricity',
        'Topic 7 – Further Mechanics',
      ],
      2: [
        'Topic 8 – Electric and Magnetic Fields',
        'Topic 9 – Nuclear and Particle Physics',
        'Topic 10 – Thermodynamics',
        'Topic 11 – Space',
        'Topic 12 – Nuclear Radiation',
        'Topic 13 – Gravitational Fields',
        'Topic 14 – Oscillations',
      ],
      3: [
        'Practical Skills Paper: Analysing Experiments',
        'Section B: General and Practical Questions on Any Topic',
      ],
    }},

    'History': { papers: {
      1: [
        'Paper 1 – Breadth Study: Britain 1625–1701: Conflict, Revolution and Settlement',
        'Paper 1 – Breadth Study: Russia and Its Rulers 1855–1964',
        'Paper 1 – Breadth Study: India 1845–1947',
      ],
      2: [
        'Paper 2 – Depth Study: Germany 1918–45',
        'Paper 2 – Depth Study: Mao\'s China 1949–76',
        'Paper 2 – Depth Study: South Africa 1948–94',
        'Paper 2 – Depth Study: USA and Vietnam 1954–75',
      ],
      3: [
        'Paper 3 – Synoptic Thematic Study + Document Questions',
        'Historical Investigation (NEA)',
      ],
    }},

    'Economics': { papers: {
      1: [
        'Theme 1 – Introduction to Markets and Market Failure',
        'Theme 3 – Business Behaviour and the Labour Market',
      ],
      2: [
        'Theme 2 – The UK Economy: Performance and Policies',
        'Theme 4 – A Global Perspective',
      ],
      3: [
        'Paper 3 – Microeconomics and Macroeconomics Synoptic Assessment',
      ],
    }},

    'Geography': { papers: {
      1: [
        'Paper 1 – Dynamic Landscapes: Tectonic Hazards, Coastal Landscapes, Rivers',
      ],
      2: [
        'Paper 2 – Dynamic Places: Regenerating Places, Diverse Places, Superpowers, Migration',
      ],
      3: [
        'Paper 3 – Synoptic Paper: Decision-Making Exercise (DME)',
        'NEA – Independent Investigation',
      ],
    }},

    'Computer Science': { papers: {
      1: [
        'Paper 1 – Computational Thinking and Problem Solving',
        'Algorithms: Design, Analysis, Big O Notation',
        'Data Structures: Arrays, Stacks, Queues, Trees, Graphs, Hash Tables',
        'Programming Paradigms: OOP, Functional, Logic',
        'Theory of Computation: Finite State Machines, Regular Languages, Turing Machines',
      ],
      2: [
        'Paper 2 – Computer Organisation and Architecture',
        'CPU, FDE Cycle, Processor Types',
        'Networks, Internet, World Wide Web, Security, Encryption',
        'Systems Software: OS, Translators, Virtual Machines',
        'Data Representation and Compression',
        'Databases: SQL, Normalisation, Relational Model',
        'Big Data, Ethical and Legal Issues',
      ],
      3: [
        'NEA – Programming Project (20%): Design, Implementation, Testing',
      ],
    }},

    'Business': { papers: {
      1: [
        'Paper 1 – Marketing and People',
        'Theme 1 – Meeting Customer Needs: Market Research, Segmentation, Marketing Mix',
        'Theme 2 – The Market: Demand, Competition, Digital Technology',
        'Theme 3 – Managing People: HR Management, Motivation, Leadership',
        'Theme 4 – Operations: Location, Technology, Lean Production',
      ],
      2: [
        'Paper 2 – Business Activities, Decisions and Strategy',
        'Theme 5 – Financial Planning: Budgets, Financial Statements, Investment Appraisal',
        'Theme 6 – Influences on Business Decisions: Ethics, Law, External Environment',
        'Theme 7 – Business Strategy: Ansoff Matrix, Porter\'s Generic Strategies',
      ],
      3: [
        'Paper 3 – Investigating Business in a Competitive Environment',
        'Case Study: Applying Business Concepts to a Pre-Released Case',
      ],
    }},

    'Psychology': { papers: {
      1: [
        'Paper 1 – Social and Cognitive Psychology',
        'Social Influence: Obedience (Milgram), Conformity (Asch), Agency Theory',
        'Cognitive Psychology: Memory Models, EWT, Cognitive Interview',
      ],
      2: [
        'Paper 2 – Biological Psychology and Learning Theories',
        'Biological Psychology: Brain Structure, Neurochemistry, Genes',
        'Learning Theories: Classical and Operant Conditioning, SLT',
        'Clinical Psychology: Defining Abnormality, Diagnosis, Treatments',
      ],
      3: [
        'Paper 3 – Applied Psychology',
        'Issues and Debates: Science, Ethics, Culture, Nature/Nurture',
        'Applied Psychology: Criminal, Sport or Health Psychology (chosen topic)',
      ],
    }},

  }, // end Edexcel A-Level

  // ── OCR A-LEVEL ──────────────────────────────────────────────────────────────
  OCR: {

    'Mathematics': { papers: {
      1: [
        'Pure Core 1: Algebra, Functions, Coordinate Geometry, Sequences, Binomial',
        'Pure Core 1: Trigonometry, Exponentials and Logarithms',
        'Pure Core 1: Differentiation and Integration (Core)',
      ],
      2: [
        'Pure Core 2: Further Calculus (Integration by Parts, Partial Fractions, Differential Equations)',
        'Pure Core 2: Further Trig, Parametric Equations, Numerical Methods, Vectors, Proof',
      ],
      3: [
        'Statistics: Data, Probability, Binomial, Normal, Hypothesis Testing, Large Data Set',
        'Mechanics: Kinematics, Newton\'s Laws, Projectiles, Moments, Friction',
      ],
    }},

    'Further Mathematics': { papers: {
      1: [
        'Core Pure: Complex Numbers, Matrices, Proof, Series, Hyperbolics, Differential Equations',
      ],
      2: [
        'Core Pure Cont.: Further Vectors, Further Calculus, Polar Coordinates',
        'Optional: Further Statistics, Mechanics or Discrete Maths',
      ],
    }},

    'Biology A (Salters-Nuffield)': { papers: {
      1: [
        'Module 1 – Development of Practical Skills',
        'Module 2 – Foundations in Biology: Cell Structure, Biological Molecules, Genetics',
        'Module 3 – Exchange and Transport: Gas Exchange, Transport in Plants and Animals',
        'Module 4 – Biodiversity, Evolution and Disease',
      ],
      2: [
        'Module 5 – Communication, Homeostasis and Energy: Nervous System, Hormones, Photosynthesis, Respiration',
        'Module 6 – Genetics, Evolution and Ecosystems: Inheritance, Populations, Ecosystems',
      ],
      3: [
        'Paper 3 – Unified Biology: Synoptic Questions Across All Modules',
        'Practical Skills: All OCR Required Practicals',
      ],
    }},

    'Chemistry A': { papers: {
      1: [
        'Module 1 – Development of Practical Skills',
        'Module 2 – Foundations in Chemistry: Atoms, Bonding, Equations, Quantitative Chemistry',
        'Module 3 – The Periodic Table and Energy: Groups, Periodicity, Energetics, Kinetics',
        'Module 4 – Core Organic Chemistry: Organic Nomenclature, Alkanes, Alkenes, Halogenoalkanes, Alcohols',
      ],
      2: [
        'Module 5 – Physical Chemistry and Transition Elements: Equilibria, Redox, Transition Metals',
        'Module 6 – Organic Chemistry and Analysis: Carbonyl, Carboxylic Acids, Aromatics, NMR, Chromatography',
      ],
      3: [
        'Paper 3 – Unified Chemistry: Synoptic Questions',
        'Practical Skills: All OCR Required Practicals',
      ],
    }},

    'Physics A': { papers: {
      1: [
        'Module 1 – Development of Practical Skills',
        'Module 2 – Foundations of Physics: Units, Vectors, Scalars',
        'Module 3 – Forces and Motion: Kinematics, Newton\'s Laws, Materials',
        'Module 4 – Electrons, Waves and Photons: Electricity, Waves, Quantum Physics',
      ],
      2: [
        'Module 5 – Newtonian World and Astrophysics: Circular Motion, SHM, Thermal Physics, Cosmology',
        'Module 6 – Particles and Medical Physics: Capacitors, Magnetic Fields, Nuclear Physics',
      ],
      3: [
        'Paper 3 – Unified Physics: Synoptic Questions',
        'Practical Skills: All OCR Required Practicals',
      ],
    }},

    'Computer Science': { papers: {
      1: [
        'Computer Systems: CPU Architecture, Memory, Storage, Networks, Security',
        'Software and Programming: OS, High vs Low Level Languages, Translators',
        'Data Representation: Binary, Hex, Encoding, Images, Sound, Compression',
        'Data Structures: Stacks, Queues, Linked Lists, Trees, Hash Tables',
        'Boolean Algebra and Logic Circuits',
        'Databases: SQL, Normalisation, Relational Model',
        'Big Data, AI and Ethical Issues',
        'Theory of Computation: Turing Machines, FSMs, Regular Languages',
      ],
      2: [
        'Algorithms: Sorting, Searching, Complexity Analysis, Recursion',
        'Programming Concepts: OOP, Functional, Event-Driven',
        'NEA – Programming Project (20%)',
      ],
    }},

    'History': { papers: {
      1: [
        'Unit Y: British Period Study (options include England 1485–1558, 1547–1660)',
        'Unit Y: Non-British Period Study (options include France 1814–1870, Russia 1894–1941)',
      ],
      2: [
        'Unit X: Themes in History (options include English Political Culture, War and Expansion)',
      ],
      3: [
        'Historical Investigation (NEA): Personal Study',
      ],
    }},

    'Geography': { papers: {
      1: [
        'Physical Systems: Coastal Landscapes, Glaciated Landscapes',
        'Physical Landscapes: Hot Desert Environments',
        'Earth\'s Life Support Systems: Carbon and Water Cycles',
      ],
      2: [
        'Human Interactions: Changing Spaces, Managing Resources',
        'Global Connections: Trade, Migration, Human Rights, Power and Borders',
      ],
      3: [
        'Geographical Debates: Climate Change, Disease Dilemmas, Exploring Oceans',
        'NEA: Geographical Investigation',
      ],
    }},

    'Latin': { papers: {
      1: [
        'Unseen Translation: Prose and Verse',
        'Language: Full OCR A-Level Latin Grammar',
        'Set Text Translation and Comprehension',
        'Literature: Critical Analysis of Set Texts',
      ],
    }},

    'Classical Greek': { papers: {
      1: [
        'Unseen Translation: Prose and Verse',
        'Language: Full OCR A-Level Greek Grammar',
        'Set Text Translation and Comprehension',
        'Literature: Critical Analysis of Set Texts',
      ],
    }},

  }, // end OCR A-Level

  // ── EDUQAS / WJEC A-LEVEL ────────────────────────────────────────────────────
  'Eduqas/WJEC': {

    'Mathematics': { papers: {
      1: ['Pure 1: Algebra, Trigonometry, Calculus, Vectors, Proof'],
      2: ['Pure 2: Further Calculus, Differential Equations, Complex Numbers (Further)', 'Statistics: Data, Distributions, Hypothesis Testing'],
      3: ['Mechanics: Kinematics, Newton\'s Laws, Moments'],
    }},

    'Biology': { papers: {
      1: ['Component 1: Basic Biochemistry, Cell Structure, Cell Division, Organisms Exchange Substances'],
      2: ['Component 2: Energy, Homeostasis, Microbiology'],
      3: ['Component 3 (A2): Reproduction, Genetics, Variation, Evolution, Ecology'],
      4: ['Practical Assessment: Required Practicals'],
    }},

    'Chemistry': { papers: {
      1: ['Component 1: Formulae and Equations, Atomic Structure, Bonding, Energetics'],
      2: ['Component 2: Rates, Equilibria, Electrochemistry, Organic Chemistry'],
      3: ['Component 3 (A2): Further Thermodynamics, Organic Synthesis, Spectroscopy'],
    }},

    'Physics': { papers: {
      1: ['Component 1: Motion, Energy, Matter, Waves, Electricity'],
      2: ['Component 2: Oscillations, Gravitational Fields, Electromagnetism, Nuclear'],
      3: ['Component 3 (A2): Further Fields, Capacitors, Radioactivity, Medical Physics'],
    }},

    'Geography': { papers: {
      1: ['Component 1: Changing Landscapes (Coasts and Rivers)'],
      2: ['Component 2: Changing Places — Urbanisation, Development, Resource Management'],
      3: ['Component 3: Global Systems and Global Governance'],
      4: ['NEA: Fieldwork Investigation and Independent Research'],
    }},

    'English Literature': { papers: {
      1: ['Poetry: Comparative Analysis of Poetry Anthology'],
      2: ['Drama: Pre-1900 and Post-1900 Drama Set Texts'],
      3: ['Prose: Comparative Study of Prose Texts (Different Periods)'],
      4: ['NEA: Independent Critical Study (Two Texts)'],
    }},

    'History': { papers: {
      1: ['AS Breadth Unit: Chosen Period Study'],
      2: ['A2 Depth Unit: Chosen Era Study'],
      3: ['NEA: Historical Investigation'],
    }},

  }, // end Eduqas/WJEC A-Level

  // ── CCEA A-LEVEL ─────────────────────────────────────────────────────────────
  CCEA: {

    'Mathematics': { papers: {
      1: ['Pure Mathematics: Algebra, Calculus, Trigonometry, Series'],
      2: ['Applied Mathematics: Statistics (Probability, Distributions) + Mechanics'],
    }},

    'Biology': { papers: {
      1: ['AS1: Cells, Exchange, Transport, Biodiversity'],
      2: ['AS2: Biochemistry, Genetics, Reproduction'],
      3: ['A2 1: Physiology, Homeostasis, Co-ordination'],
      4: ['A2 2: Genetics, Evolution, Ecosystems'],
    }},

    'Chemistry': { papers: {
      1: ['AS1: Atomic Structure, Bonding, Energetics, Kinetics'],
      2: ['AS2: Organic Chemistry, Analytical Techniques'],
      3: ['A2 1: Further Physical and Inorganic Chemistry'],
      4: ['A2 2: Further Organic Chemistry and Analysis'],
    }},

    'Physics': { papers: {
      1: ['AS1: Forces, Motion, Materials, Waves, Optics'],
      2: ['AS2: Electricity, Magnetism, Quantum Physics'],
      3: ['A2 1: Thermal Physics, Circular Motion, Nuclear'],
      4: ['A2 2: Fields, Capacitors, Particle Physics'],
    }},

    'History': { papers: {
      1: ['AS 1: Change and Continuity (chosen period)'],
      2: ['AS 2: Dictatorship and Democracy (Germany/USSR/USA)'],
      3: ['A2 1: Breadth Study (Chosen Modern Topic)'],
      4: ['A2 2: Historical Investigation (NEA)'],
    }},

    'Geography': { papers: {
      1: ['AS 1: Physical Processes (Rivers, Coasts, Tectonic)'],
      2: ['AS 2: Human Processes (Population, Settlement, Development)'],
      3: ['A2 1: Physical and Human Geographical Issues'],
      4: ['A2 2: Fieldwork Investigation'],
    }},

  }, // end CCEA A-Level

} // end ALEVEL


// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// These match the function signatures expected throughout the app.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a flat array of { name, paper, subjectId } for use in topic seeding,
 * confidence tracking, and the AI context builder.
 *
 * @param {string} board   - e.g. 'AQA', 'Edexcel', 'OCR', 'Eduqas/WJEC', 'CCEA'
 * @param {string} subject - e.g. 'Biology', 'Mathematics'
 * @param {string} level   - 'GCSE' or 'A-Level' (or 'ALEVEL')
 */
export function getAllTopicsFlat(board, subject, level) {
  const levelKey = (level === 'A-Level' || level === 'ALEVEL' || level === 'A_LEVEL')
    ? ALEVEL
    : GCSE

  // Try exact board name first, then common aliases
  const boardAliases = {
    'Eduqas': 'Eduqas/WJEC',
    'WJEC':   'Eduqas/WJEC',
    'eduqas': 'Eduqas/WJEC',
  }
  const boardKey = boardAliases[board] || board

  const boardData = levelKey[boardKey] || levelKey['AQA'] || {}
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
  const levelKey = (level === 'A-Level' || level === 'ALEVEL' || level === 'A_LEVEL')
    ? ALEVEL
    : GCSE

  const boardAliases = { 'Eduqas': 'Eduqas/WJEC', 'WJEC': 'Eduqas/WJEC' }
  const boardKey = boardAliases[board] || board

  const boardData = levelKey[boardKey] || levelKey['AQA'] || {}
  return boardData[subject]?.papers || {}
}

/**
 * Returns all subject names available for a given board and level.
 */
export function getSubjectsForBoard(board, level) {
  const levelKey = (level === 'A-Level' || level === 'ALEVEL') ? ALEVEL : GCSE
  const boardAliases = { 'Eduqas': 'Eduqas/WJEC', 'WJEC': 'Eduqas/WJEC' }
  const boardKey = boardAliases[board] || board
  return Object.keys(levelKey[boardKey] || {})
}
// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────
export { GCSE, ALEVEL }
export default { GCSE, ALEVEL }
