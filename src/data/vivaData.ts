import { VivaQuestion } from '../types';

export const VIVA_QUESTIONS: VivaQuestion[] = [
  // PSC & Python / Architecture
  {
    id: 1,
    category: 'PSC & Python',
    question: 'Why is this project titled "ConvertAnyFile" classified as a PSC (Programming for Scientific Calculations) mini-project?',
    answer: 'While commercial converters only convert file formats, ConvertAnyFile unites digital file processing with core scientific calculation engines: descriptive statistical analysis (variance with Bessel’s correction, IQR, z-scores), ordinary least-squares regression, numerical root-finding algorithms (Bisection, Newton-Raphson, Secant, Regula Falsi), numerical quadrature integration (Trapezoidal and Simpson’s 1/3 rules), matrix linear algebra solvers (Gauss-Jordan, LU factorization), and algorithmic code translation.',
    vivaTip: 'Emphasize that the project is not just a consumer utility; it demonstrates mathematical modeling, error convergence, and floating-point stability.',
    complexity: 'O(1) architectural dispatch'
  },
  {
    id: 2,
    category: 'PSC & Python',
    question: 'What is the ToolRegistry pattern and why was it chosen over giant if-else or switch statements?',
    answer: 'The ToolRegistry pattern acts as an inversion-of-control registry where each converter or scientific calculation tool self-registers with its metadata (input formats, output formats, status, execution handler). It adheres strictly to the Open/Closed Principle (SOLID): new file formats or numerical methods can be introduced without modifying existing controller routing or pipeline code.',
    vivaTip: 'Explain how decoupling the API controller from concrete conversion tools makes the system extensible and testable.',
    complexity: 'O(1) registry lookup by MIME/extension'
  },
  {
    id: 3,
    category: 'PSC & Python',
    question: 'Why is storage kept private rather than publicly accessible in static directories?',
    answer: 'Directly serving uploaded files from public static directories creates severe security vulnerabilities: path traversal, arbitrary script execution, and unauthenticated document access. ConvertAnyFile isolates files in controlled private storage, references jobs via non-guessable cryptographically secure UUIDs, and mediates downloads through secure streaming endpoints with strict MIME type headers.',
    vivaTip: 'Mention OWASP security guidelines regarding Unrestricted File Upload and Insecure Direct Object References (IDOR).',
    complexity: 'Security architecture'
  },

  // File Processing
  {
    id: 4,
    category: 'File Processing',
    question: 'What is the difference between Document Reconstruction (PDF to Word) and Document Rendering (Word to PDF)?',
    answer: 'Rendering (Word to PDF) is a deterministic, top-down process: document content models (paragraphs, font metrics, margins) are laid out and drawn to a fixed coordinate canvas. Reconstruction (PDF to Word) is an inverse, non-deterministic problem: raw vector coordinates, loose character glyphs, and raster images must be reverse-engineered into conceptual paragraphs, tables, reading orders, and styles.',
    vivaTip: 'Use the phrase "Inverse problem in computer vision/layout analysis" to impress examiners.',
    complexity: 'Reconstruction is NP-hard heuristic layout analysis'
  },
  {
    id: 5,
    category: 'File Processing',
    question: 'Why is UTF-8 with BOM (Byte Order Mark) used when exporting CSV files for spreadsheet applications?',
    answer: 'Microsoft Excel on Windows historically defaults to local ANSI/Windows-1252 character encoding when opening .csv files without a BOM. Prepending the 3-byte UTF-8 BOM (`0xEF, 0xBB, 0xBF`) explicitly signals to Excel that the file contains UTF-8 text, preventing mojibake (garbled characters) for mathematical symbols (∑, ±, ², π) and international characters.',
    vivaTip: 'Explain that standard UTF-8 does not require a BOM, but Excel specifically requires it for automatic UTF-8 detection.',
    complexity: 'O(1) header prefixing'
  },
  {
    id: 6,
    category: 'File Processing',
    question: 'How does the MP3 + Image to MP4 Video Generator work technically?',
    answer: 'It combines the Web Audio API and HTML5 Canvas with the MediaStream and MediaRecorder APIs. The audio is decoded into PCM AudioBuffers and fed to an AnalyserNode for fast Fourier transform (FFT) frequency analysis. On each animation frame, the background image, spectrum bars, track typography, and playback timers are painted to the Canvas. A canvas stream and audio stream are merged and encoded into an MP4/WebM video container.',
    vivaTip: 'Highlight that this replaces the need for server-side FFmpeg rendering by leveraging client-side hardware-accelerated MediaRecorder.',
    complexity: 'Real-time 30 FPS canvas rendering pipeline'
  },

  // Numerical Methods
  {
    id: 7,
    category: 'Numerical Methods',
    question: 'What is the theoretical basis of the Bisection Method and what is its rate of convergence?',
    answer: 'The Bisection Method is founded on the Intermediate Value Theorem: if f(x) is continuous on [a, b] and f(a)·f(b) < 0, at least one root exists in (a, b). The interval is repeatedly bisected: c = (a+b)/2. It exhibits linear convergence with an asymptotic error constant of 0.5. To achieve tolerance ε, the required iterations are exactly n = ⌈log₂((b - a) / ε)⌉.',
    vivaTip: 'State the exact iteration formula: n = ceil(log2((b-a)/tol)). Examiners love this exact formula!',
    complexity: 'Linear convergence: e_{k+1} = 0.5 * e_k'
  },
  {
    id: 8,
    category: 'Numerical Methods',
    question: 'Why does the Newton-Raphson method achieve quadratic convergence, and when does it fail?',
    answer: 'Newton-Raphson uses Taylor series expansion truncated to the linear term: f(x) ≈ f(x₀) + f\'(x₀)(x - x₀) = 0, giving x₁ = x₀ - f(x₀)/f\'(x₀). It converges quadratically: e_{k+1} ≈ M·(e_k)², meaning the number of correct decimal places doubles every iteration. It fails when: 1) f\'(x_n) ≈ 0 (horizontal tangent/division by zero), 2) the initial guess x₀ is too far from the root, or 3) inflection points cause infinite oscillation.',
    vivaTip: 'Mention the condition: |f(x)·f\'\'(x)| < [f\'(x)]² for guaranteed local convergence.',
    complexity: 'Quadratic convergence: order p = 2'
  },
  {
    id: 9,
    category: 'Numerical Methods',
    question: 'How does the Secant Method differ from the Regula Falsi (False Position) Method?',
    answer: 'Both methods avoid computing the analytical derivative f\'(x) by using the secant slope (f(b) - f(a))/(b - a). However, Regula Falsi is a bracketing method: it enforces f(a)·f(b) < 0 at every step, guaranteeing convergence like bisection. The Secant Method is an open method: it always uses the two most recent iterates x_k and x_{k-1}, achieving a higher order of convergence (the Golden Ratio φ ≈ 1.618) but without guaranteed convergence.',
    vivaTip: 'Highlight: Regula Falsi guarantees convergence; Secant converges faster (order 1.618) but can diverge if f(x_n) ≈ f(x_{n-1}).',
    complexity: 'Secant: p ≈ 1.618 (Superlinear); Regula Falsi: p = 1 (Linear)'
  },
  {
    id: 10,
    category: 'Numerical Methods',
    question: 'Why is Simpson’s 1/3 Rule more accurate than the Trapezoidal Rule for numerical integration?',
    answer: 'The Trapezoidal rule approximates f(x) with linear line segments across each subinterval, resulting in a local truncation error of O(h³) and global error of O(h²). Simpson’s 1/3 rule fits a 2nd-degree parabola across pairs of intervals (requiring an even number n of intervals). Due to symmetry, the cubic term cancels out in Taylor expansion, yielding a local truncation error of O(h⁵) and global error of O(h⁴).',
    vivaTip: 'Emphasize that Simpson’s rule integrates polynomials up to degree 3 exactly, even though it is derived from 2nd-degree parabolas!',
    complexity: 'Trapezoidal: Global Error O(h²); Simpson’s 1/3: Global Error O(h⁴)'
  },

  // Statistics
  {
    id: 11,
    category: 'Statistics',
    question: 'Why do we divide by (n - 1) instead of n when computing sample variance (Bessel’s Correction)?',
    answer: 'Using the sample mean x̄ instead of the unknown true population mean μ introduces a downward bias because sample observations are on average closer to x̄ than to μ. The expectation E[∑(x_i - x̄)²] = (n - 1)σ². Dividing by (n - 1) creates an unbiased estimator s² such that E[s²] = σ².',
    vivaTip: 'State: "Bessel’s correction compensates for the loss of one degree of freedom used to calculate the sample mean."',
    complexity: 'O(n) two-pass or Welford’s one-pass algorithm'
  },
  {
    id: 12,
    category: 'Statistics',
    question: 'What is the Interquartile Range (IQR) and how is Tukey’s 1.5 × IQR fence used for outlier detection?',
    answer: 'IQR = Q₃ - Q₁, representing the statistical spread of the central 50% of the dataset. Unlike the standard deviation, the IQR is a robust measure of dispersion resistant to extreme values. Tukey’s rule defines outliers as any data points falling outside the interval [Q₁ - 1.5·IQR, Q₃ + 1.5·IQR]. Values beyond 3.0·IQR are classified as extreme outliers.',
    vivaTip: 'Contrast parametric methods (Z-score assumes normal Gaussian distribution) with non-parametric methods (IQR fence works for skewed data).',
    complexity: 'O(n log n) due to sorting for quartile determination'
  },
  {
    id: 13,
    category: 'Statistics',
    question: 'What is Pearson’s Correlation Coefficient (r) and how does it relate to the Coefficient of Determination (R²)?',
    answer: 'Pearson’s r measures the strength and direction of a linear relationship between two variables, bounded in [-1, +1]. In simple bivariate linear regression, the coefficient of determination is literally R² = r². R² represents the proportion of total variance in the dependent variable Y that is explained by the independent variable X via the fitted line: R² = 1 - (SS_res / SS_tot).',
    vivaTip: 'Remind examiners: "Correlation does not imply causation; r only detects linear relationships."',
    complexity: 'O(n) single pass over coordinate pairs'
  },

  // Linear Algebra & Matrix Operations
  {
    id: 14,
    category: 'Statistics',
    question: 'How does Gaussian Elimination with Partial Pivoting prevent catastrophic numerical cancellation in matrix solving?',
    answer: 'Naive Gaussian elimination divides by the diagonal pivot element a_{ii}. If a_{ii} is very small or zero, floating-point division produces overflow or severe rounding errors that propagate through back-substitution. Partial pivoting searches column i for the maximum absolute element |a_{ki}| (where k ≥ i) and swaps row i with row k before elimination, ensuring the pivot multiplier |m_{ki}| ≤ 1.',
    vivaTip: 'Always mention "Partial Pivoting limits multiplier magnitude to <= 1 to avoid error amplification."',
    complexity: 'Time complexity: O(n³) for elimination, O(n²) for back-substitution'
  },

  // System & Security
  {
    id: 15,
    category: 'System & Security',
    question: 'Why is client-side code translation restricted to static syntactic mapping rather than executing user code in a live runtime?',
    answer: 'Executing untrusted, uploaded source code (especially C, C++, Python, or Shell scripts) creates Remote Code Execution (RCE) attack vectors where malicious payloads could compromise the host server, read environment variables, or launch denial-of-service loops. ConvertAnyFile employs a lexical token-based transpilation engine that inspects and transforms code as pure text without executing it.',
    vivaTip: 'Reiterate: "Never execute arbitrary user-submitted code in an unisolated environment."',
    complexity: 'O(N) token stream parsing'
  }
];

export const VIVA_CHEAT_SHEET = {
  formulas: [
    { name: "Sample Mean", formula: "x̄ = (∑ x_i) / n" },
    { name: "Sample Variance (Bessel's)", formula: "s² = [ ∑(x_i - x̄)² ] / (n - 1)" },
    { name: "Sample Standard Deviation", formula: "s = √[ s² ]" },
    { name: "Interquartile Range", formula: "IQR = Q₃ - Q₁" },
    { name: "Tukey Outlier Bounds", formula: "Lower = Q₁ - 1.5·IQR, Upper = Q₃ + 1.5·IQR" },
    { name: "Pearson Correlation r", formula: "r = [ ∑(x - x̄)(y - ȳ) ] / √[ ∑(x - x̄)² · ∑(y - ȳ)² ]" },
    { name: "OLS Regression Slope", formula: "m = [ n∑xy - (∑x)(∑y) ] / [ n∑x² - (∑x)² ]" },
    { name: "Bisection Iterations Needed", formula: "n ≥ ⌈ log₂((b - a) / ε) ⌉" },
    { name: "Newton-Raphson Formula", formula: "x_{n+1} = x_n - [ f(x_n) / f'(x_n) ]" },
    { name: "Secant Method Formula", formula: "x_{n+1} = x_n - f(x_n)·(x_n - x_{n-1}) / [ f(x_n) - f(x_{n-1}) ]" },
    { name: "Trapezoidal Rule", formula: "I ≈ (h / 2) · [ f(x₀) + 2·∑f(x_i) + f(x_n) ]" },
    { name: "Simpson's 1/3 Rule", formula: "I ≈ (h / 3) · [ f(x₀) + 4·∑f(x_odd) + 2·∑f(x_even) + f(x_n) ]" }
  ],
  complexities: [
    { algorithm: "Bisection Method", order: "Linear (p = 1)", error: "e_{k+1} = 0.5 · e_k" },
    { algorithm: "Newton-Raphson", order: "Quadratic (p = 2)", error: "e_{k+1} ≈ M · (e_k)²" },
    { algorithm: "Secant Method", order: "Superlinear (p ≈ 1.618)", error: "Golden ratio order" },
    { algorithm: "Trapezoidal Rule", order: "O(h²)", error: "-(b-a)·h²·f''(ξ) / 12" },
    { algorithm: "Simpson's 1/3 Rule", order: "O(h⁴)", error: "-(b-a)·h⁴·f^{(4)}(ξ) / 180" },
    { algorithm: "Gaussian Elimination", order: "O(n³)", error: "Controlled via partial pivoting" }
  ]
};

export const vivaQuestions: VivaQuestion[] = VIVA_QUESTIONS.map(q => ({
  ...q,
  keyPoints: [q.vivaTip, q.complexity || 'Standard PSC formulation']
}));

export const formulaCheatSheet = VIVA_CHEAT_SHEET.formulas.map(f => ({
  title: f.name,
  formula: f.formula,
  notes: 'PSC Core Reference'
}));

export const vivaTips = [
  {
    title: '1. Lead with the Architectural Separation of Concerns',
    desc: 'When asked how the application works, mention the ToolRegistry pattern: converters and numerical solvers are decoupled into stateless micro-engines, making the system modular and testable without modifying routing.'
  },
  {
    title: '2. Emphasize Convergence and Order of Error',
    desc: 'For root finding, explicitly state that Bisection has linear convergence O(h), Newton-Raphson has quadratic convergence O(h²) near the root, and Simpson’s 1/3 rule has global truncation error O(h⁴) compared to Trapezoidal O(h²).'
  },
  {
    title: '3. Highlight In-Browser Security & Zero Data Leakage',
    desc: 'Remind the examiner that ConvertAnyFile runs 100% on the client machine using Web APIs (FileReader, AudioContext, Canvas, jsPDF), preventing server RCE vulnerabilities and protecting confidential documents.'
  },
  {
    title: '4. Justify Partial Pivoting in Matrix Solving',
    desc: 'When discussing Gaussian elimination, explain that partial pivoting prevents catastrophic division by zero or near-zero numbers, suppressing floating-point error propagation.'
  },
  {
    title: '5. Clarify Bessel’s Correction for Sample Variance',
    desc: 'Point out why the denominator is n-1 rather than n: sample variance using the sample mean underestimates population variance by a factor of (n-1)/n, and dividing by n-1 yields an unbiased estimator.'
  }
];
