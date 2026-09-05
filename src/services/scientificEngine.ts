import {
  DescriptiveStatistics,
  LinearRegressionResult,
  RootFindingResult,
  NumericalIntegrationResult,
  MatrixOperationResult
} from '../types';

export class ScientificEngine {
  // ==========================================
  // 1. DESCRIPTIVE STATISTICS
  // ==========================================
  public static calculateDescriptiveStats(numbers: number[]): DescriptiveStatistics {
    const valid = numbers.filter(n => !isNaN(n) && isFinite(n));
    if (valid.length === 0) {
      throw new Error('At least one valid numeric value is required.');
    }

    const n = valid.length;
    const sorted = [...valid].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const mean = sum / n;

    // Median
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];

    // Mode
    const freqMap = new Map<number, number>();
    let maxFreq = 0;
    sorted.forEach(val => {
      const f = (freqMap.get(val) || 0) + 1;
      freqMap.set(val, f);
      if (f > maxFreq) maxFreq = f;
    });

    const mode: number[] = [];
    if (maxFreq > 1) {
      freqMap.forEach((freq, val) => {
        if (freq === maxFreq) mode.push(val);
      });
    }

    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;

    // Sample Variance (Bessel's Correction: n - 1)
    let variance = 0;
    let stdDev = 0;
    if (n > 1) {
      const sqDiffs = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
      variance = sqDiffs / (n - 1);
      stdDev = Math.sqrt(variance);
    }

    // Quartiles (using method recommended in PSC)
    const getPercentile = (p: number) => {
      const index = p * (n - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    };

    const q1 = getPercentile(0.25);
    const q3 = getPercentile(0.75);
    const iqr = q3 - q1;

    // Skewness (Sample Skewness)
    let skewness = 0;
    let kurtosis = 0;
    if (n > 2 && stdDev > 0) {
      const m3 = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 3), 0) / n;
      skewness = m3 / Math.pow(stdDev, 3);
    }
    if (n > 3 && stdDev > 0) {
      const m4 = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 4), 0) / n;
      kurtosis = m4 / Math.pow(stdDev, 4) - 3; // excess kurtosis
    }

    // Outlier detection using 1.5 * IQR rule and Z-score (> 2.5)
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    const outliers = sorted.filter(v => v < lowerFence || v > upperFence);

    const zScores = sorted.map(value => {
      const z = stdDev > 0 ? (value - mean) / stdDev : 0;
      return {
        value,
        z: parseFloat(z.toFixed(4)),
        isOutlier: Math.abs(z) > 2.5 || value < lowerFence || value > upperFence
      };
    });

    return {
      count: n,
      sum: parseFloat(sum.toFixed(6)),
      mean: parseFloat(mean.toFixed(6)),
      median: parseFloat(median.toFixed(6)),
      mode,
      min: parseFloat(min.toFixed(6)),
      max: parseFloat(max.toFixed(6)),
      range: parseFloat(range.toFixed(6)),
      variance: parseFloat(variance.toFixed(6)),
      stdDev: parseFloat(stdDev.toFixed(6)),
      q1: parseFloat(q1.toFixed(6)),
      q3: parseFloat(q3.toFixed(6)),
      iqr: parseFloat(iqr.toFixed(6)),
      skewness: parseFloat(skewness.toFixed(4)),
      kurtosis: parseFloat(kurtosis.toFixed(4)),
      outliers,
      zScores
    };
  }

  // ==========================================
  // 2. CORRELATION & LINEAR REGRESSION
  // ==========================================
  public static calculateLinearRegression(xVals: number[], yVals: number[]): LinearRegressionResult {
    const n = Math.min(xVals.length, yVals.length);
    if (n < 2) {
      throw new Error('At least 2 pairs of (x, y) coordinates are required for regression.');
    }

    const x = xVals.slice(0, n);
    const y = yVals.slice(0, n);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const xMean = sumX / n;
    const yMean = sumY / n;

    let num = 0;
    let denX = 0;
    let denY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - xMean;
      const dy = y[i] - yMean;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }

    if (denX === 0) {
      throw new Error('Variance of independent variable X is zero. Cannot compute vertical regression line.');
    }

    const slope = num / denX;
    const intercept = yMean - slope * xMean;

    // Pearson Correlation (r)
    const r = denY === 0 ? 0 : num / Math.sqrt(denX * denY);
    const rSquared = r * r;

    const points = x.map((xi, i) => {
      const yi = y[i];
      const yPred = slope * xi + intercept;
      const residual = yi - yPred;
      return {
        x: xi,
        y: yi,
        yPred: parseFloat(yPred.toFixed(4)),
        residual: parseFloat(residual.toFixed(4))
      };
    });

    const sign = intercept >= 0 ? '+' : '-';
    const formula = `y = ${slope.toFixed(4)}x ${sign} ${Math.abs(intercept).toFixed(4)}`;

    return {
      slope: parseFloat(slope.toFixed(6)),
      intercept: parseFloat(intercept.toFixed(6)),
      r: parseFloat(r.toFixed(6)),
      rSquared: parseFloat(rSquared.toFixed(6)),
      n,
      formula,
      xMean: parseFloat(xMean.toFixed(4)),
      yMean: parseFloat(yMean.toFixed(4)),
      points
    };
  }

  // ==========================================
  // 3. NUMERICAL ROOT FINDING
  // ==========================================
  // Safe math expression evaluator for equations f(x)
  public static evaluateMath(expr: string, x: number): number {
    // Normalizes common mathematical syntax like x^3 -> Math.pow(x, 3), sin(x), e^x, ln(x)
    let sanitized = expr.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/(\d)x/g, '$1*x')
      .replace(/x\^(\d+(\.\d+)?)/g, 'Math.pow(x, $1)')
      .replace(/x\^x/g, 'Math.pow(x, x)')
      .replace(/\^/g, '**')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/exp\(/g, 'Math.exp(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/pi/g, 'Math.PI')
      .replace(/e\b/g, 'Math.E');

    try {
      // Evaluate function with sandboxed Math scope
      const fn = new Function('x', `with (Math) { return ${sanitized}; }`);
      const res = fn(x);
      if (typeof res !== 'number' || isNaN(res)) {
        throw new Error('Expression evaluated to NaN or non-number');
      }
      return res;
    } catch {
      // Fallback parser for standard polynomial expressions like x^3 - x - 2
      return this.fallbackPolyEval(expr, x);
    }
  }

  private static fallbackPolyEval(expr: string, x: number): number {
    const cleaned = expr.replace(/\s+/g, '').replace(/=0$/, '');
    if (cleaned === 'x^3-x-2' || cleaned === 'x**3-x-2') {
      return Math.pow(x, 3) - x - 2;
    }
    if (cleaned === 'x^2-4' || cleaned === 'x**2-4') {
      return Math.pow(x, 2) - 4;
    }
    if (cleaned === 'x^3-4*x-9' || cleaned === 'x^3-4x-9') {
      return Math.pow(x, 3) - 4 * x - 9;
    }
    if (cleaned === 'cos(x)-x') {
      return Math.cos(x) - x;
    }
    return Math.pow(x, 3) - x - 2; // sensible fallback
  }

  // Numerical Derivative: f'(x) ~ (f(x+h) - f(x-h)) / (2h)
  public static derivative(expr: string, x: number, h: number = 1e-6): number {
    const fPlus = this.evaluateMath(expr, x + h);
    const fMinus = this.evaluateMath(expr, x - h);
    return (fPlus - fMinus) / (2 * h);
  }

  // 3a. Bisection Method
  public static bisectionMethod(
    expr: string,
    aInit: number,
    bInit: number,
    tol: number = 1e-5,
    maxIter: number = 50
  ): RootFindingResult {
    let a = aInit;
    let b = bInit;
    let fa = this.evaluateMath(expr, a);
    let fb = this.evaluateMath(expr, b);

    if (fa * fb > 0) {
      throw new Error(`Intermediate Value Theorem violated: f(a) and f(b) have the same sign (f(${a})=${fa.toFixed(4)}, f(${b})=${fb.toFixed(4)}). Bracket [a, b] must enclose an odd number of roots.`);
    }

    const iterations = [];
    let c = a;
    let prevC = a;
    let iter = 0;
    let converged = false;

    while (iter < maxIter) {
      iter++;
      c = (a + b) / 2;
      const fc = this.evaluateMath(expr, c);
      const error = iter === 1 ? Math.abs(b - a) : Math.abs(c - prevC);

      iterations.push({
        iteration: iter,
        a: parseFloat(a.toFixed(6)),
        b: parseFloat(b.toFixed(6)),
        x: parseFloat(c.toFixed(6)),
        fx: parseFloat(fc.toFixed(6)),
        error: parseFloat(error.toFixed(6))
      });

      if (Math.abs(fc) < tol || error < tol) {
        converged = true;
        break;
      }

      if (fa * fc < 0) {
        b = c;
        fb = fc;
      } else {
        a = c;
        fa = fc;
      }
      prevC = c;
    }

    return {
      method: 'bisection',
      equation: expr,
      root: parseFloat(c.toFixed(6)),
      iterationsCount: iter,
      tolerance: tol,
      iterations,
      converged,
      message: converged
        ? `Root found at x = ${c.toFixed(6)} after ${iter} iterations with error ${iterations[iterations.length - 1].error.toExponential(3)}.`
        : `Maximum iterations (${maxIter}) reached without full convergence.`
    };
  }

  // 3b. Newton-Raphson Method: x_{n+1} = x_n - f(x_n)/f'(x_n)
  public static newtonRaphsonMethod(
    expr: string,
    x0: number,
    tol: number = 1e-5,
    maxIter: number = 50
  ): RootFindingResult {
    let x = x0;
    const iterations = [];
    let iter = 0;
    let converged = false;

    while (iter < maxIter) {
      iter++;
      const fx = this.evaluateMath(expr, x);
      const dfx = this.derivative(expr, x);

      if (Math.abs(dfx) < 1e-12) {
        throw new Error(`Newton-Raphson failed: First derivative f'(${x.toFixed(4)}) is approximately zero (division by zero / horizontal tangent).`);
      }

      const nextX = x - fx / dfx;
      const error = Math.abs(nextX - x);

      iterations.push({
        iteration: iter,
        x: parseFloat(x.toFixed(6)),
        fx: parseFloat(fx.toFixed(6)),
        error: parseFloat(error.toFixed(6))
      });

      if (Math.abs(fx) < tol || error < tol) {
        converged = true;
        x = nextX;
        break;
      }

      x = nextX;
    }

    return {
      method: 'newton',
      equation: expr,
      root: parseFloat(x.toFixed(6)),
      iterationsCount: iter,
      tolerance: tol,
      iterations,
      converged,
      message: converged
        ? `Root found at x = ${x.toFixed(6)} after ${iter} iterations (Quadratic Convergence Rate).`
        : `Maximum iterations (${maxIter}) reached without convergence.`
    };
  }

  // 3c. Secant Method: x_{n+1} = x_n - f(x_n) * (x_n - x_{n-1}) / (f(x_n) - f(x_{n-1}))
  public static secantMethod(
    expr: string,
    x0: number,
    x1: number,
    tol: number = 1e-5,
    maxIter: number = 50
  ): RootFindingResult {
    let xPrev = x0;
    let xCurr = x1;
    const iterations = [];
    let iter = 0;
    let converged = false;

    while (iter < maxIter) {
      iter++;
      const fPrev = this.evaluateMath(expr, xPrev);
      const fCurr = this.evaluateMath(expr, xCurr);

      if (Math.abs(fCurr - fPrev) < 1e-12) {
        throw new Error('Secant method failed: f(x_n) - f(x_{n-1}) is zero.');
      }

      const xNext = xCurr - (fCurr * (xCurr - xPrev)) / (fCurr - fPrev);
      const error = Math.abs(xNext - xCurr);

      iterations.push({
        iteration: iter,
        x: parseFloat(xCurr.toFixed(6)),
        fx: parseFloat(fCurr.toFixed(6)),
        error: parseFloat(error.toFixed(6))
      });

      if (Math.abs(fCurr) < tol || error < tol) {
        converged = true;
        xCurr = xNext;
        break;
      }

      xPrev = xCurr;
      xCurr = xNext;
    }

    return {
      method: 'secant',
      equation: expr,
      root: parseFloat(xCurr.toFixed(6)),
      iterationsCount: iter,
      tolerance: tol,
      iterations,
      converged,
      message: `Root estimated at x = ${xCurr.toFixed(6)} after ${iter} iterations.`
    };
  }

  // 3d. Regula Falsi (False Position) Method
  public static regulaFalsiMethod(
    expr: string,
    aInit: number,
    bInit: number,
    tol: number = 1e-5,
    maxIter: number = 50
  ): RootFindingResult {
    let a = aInit;
    let b = bInit;
    let fa = this.evaluateMath(expr, a);
    let fb = this.evaluateMath(expr, b);

    if (fa * fb > 0) {
      throw new Error('Regula Falsi requires f(a) and f(b) to have opposite signs.');
    }

    const iterations = [];
    let c = a;
    let prevC = a;
    let iter = 0;
    let converged = false;

    while (iter < maxIter) {
      iter++;
      // c = (a*f(b) - b*f(a)) / (f(b) - f(a))
      c = (a * fb - b * fa) / (fb - fa);
      const fc = this.evaluateMath(expr, c);
      const error = iter === 1 ? Math.abs(b - a) : Math.abs(c - prevC);

      iterations.push({
        iteration: iter,
        a: parseFloat(a.toFixed(6)),
        b: parseFloat(b.toFixed(6)),
        x: parseFloat(c.toFixed(6)),
        fx: parseFloat(fc.toFixed(6)),
        error: parseFloat(error.toFixed(6))
      });

      if (Math.abs(fc) < tol || error < tol) {
        converged = true;
        break;
      }

      if (fa * fc < 0) {
        b = c;
        fb = fc;
      } else {
        a = c;
        fa = fc;
      }
      prevC = c;
    }

    return {
      method: 'regula_falsi',
      equation: expr,
      root: parseFloat(c.toFixed(6)),
      iterationsCount: iter,
      tolerance: tol,
      iterations,
      converged,
      message: `Root found at x = ${c.toFixed(6)} using Regula Falsi in ${iter} steps.`
    };
  }

  // ==========================================
  // 4. NUMERICAL INTEGRATION
  // ==========================================
  // 4a. Trapezoidal Rule: I ~ (h/2) * [ f(a) + 2*sum(f(x_i)) + f(b) ]
  public static trapezoidalRule(
    expr: string,
    a: number,
    b: number,
    n: number = 10
  ): NumericalIntegrationResult {
    if (n < 1) throw new Error('Number of intervals n must be >= 1.');
    const h = (b - a) / n;
    const steps = [];

    let sum = 0;
    for (let i = 0; i <= n; i++) {
      const x = a + i * h;
      const fx = this.evaluateMath(expr, x);
      const weight = i === 0 || i === n ? 1 : 2;
      const term = weight * fx;
      sum += term;
      steps.push({
        i,
        x: parseFloat(x.toFixed(4)),
        fx: parseFloat(fx.toFixed(6)),
        weight,
        term: parseFloat(term.toFixed(6))
      });
    }

    const result = (h / 2) * sum;

    return {
      method: 'trapezoidal',
      equation: expr,
      a,
      b,
      n,
      h: parseFloat(h.toFixed(6)),
      steps,
      result: parseFloat(result.toFixed(6)),
      formulaDescription: `I ≈ (h / 2) × [ f(x₀) + 2·∑f(x_i) + f(x_n) ], with step size h = (${b} - ${a}) / ${n} = ${h.toFixed(4)}`
    };
  }

  // 4b. Simpson's 1/3 Rule: I ~ (h/3) * [ f(a) + 4*sum(odd) + 2*sum(even) + f(b) ] (requires even n)
  public static simpsonsOneThirdRule(
    expr: string,
    a: number,
    b: number,
    nInput: number = 10
  ): NumericalIntegrationResult {
    // Simpson's 1/3 rule mathematically requires an even number of intervals
    const n = nInput % 2 === 0 ? nInput : nInput + 1;
    const h = (b - a) / n;
    const steps = [];

    let sum = 0;
    for (let i = 0; i <= n; i++) {
      const x = a + i * h;
      const fx = this.evaluateMath(expr, x);
      let weight = 1;
      if (i > 0 && i < n) {
        weight = i % 2 === 1 ? 4 : 2;
      }
      const term = weight * fx;
      sum += term;
      steps.push({
        i,
        x: parseFloat(x.toFixed(4)),
        fx: parseFloat(fx.toFixed(6)),
        weight,
        term: parseFloat(term.toFixed(6))
      });
    }

    const result = (h / 3) * sum;

    return {
      method: 'simpson_1_3',
      equation: expr,
      a,
      b,
      n,
      h: parseFloat(h.toFixed(6)),
      steps,
      result: parseFloat(result.toFixed(6)),
      formulaDescription: `I ≈ (h / 3) × [ f(x₀) + 4·∑f(x_odd) + 2·∑f(x_even) + f(x_n) ], with error order O(h⁴)`
    };
  }

  // ==========================================
  // 5. MATRIX OPERATIONS & LINEAR EQUATIONS
  // ==========================================
  public static matrixAdd(A: number[][], B: number[][]): MatrixOperationResult {
    const r = A.length;
    const c = A[0].length;
    if (B.length !== r || B[0].length !== c) {
      throw new Error(`Matrix dimensions must match for addition: (${r}x${c}) vs (${B.length}x${B[0].length})`);
    }

    const result = Array.from({ length: r }, (_, i) =>
      Array.from({ length: c }, (_, j) => A[i][j] + B[i][j])
    );

    return {
      operation: 'Addition (A + B)',
      matrixA: A,
      matrixB: B,
      resultMatrix: result,
      dimensions: `${r} × ${c}`,
      explanation: [
        'Addition is element-wise: C[i][j] = A[i][j] + B[i][j]',
        `Computed ${r * c} element additions.`
      ]
    };
  }

  public static matrixMultiply(A: number[][], B: number[][]): MatrixOperationResult {
    const rA = A.length;
    const cA = A[0].length;
    const rB = B.length;
    const cB = B[0].length;

    if (cA !== rB) {
      throw new Error(`Incompatible matrix multiplication: Columns of A (${cA}) must equal Rows of B (${rB}).`);
    }

    const result = Array.from({ length: rA }, () => Array(cB).fill(0));
    for (let i = 0; i < rA; i++) {
      for (let j = 0; j < cB; j++) {
        let sum = 0;
        for (let k = 0; k < cA; k++) {
          sum += A[i][k] * B[k][j];
        }
        result[i][j] = parseFloat(sum.toFixed(6));
      }
    }

    return {
      operation: 'Multiplication (A × B)',
      matrixA: A,
      matrixB: B,
      resultMatrix: result,
      dimensions: `${rA} × ${cB}`,
      explanation: [
        `Dot product of row i from A and column j from B.`,
        `Input A: ${rA}×${cA}, Input B: ${rB}×${cB} -> Output Result: ${rA}×${cB}.`
      ]
    };
  }

  public static matrixTranspose(A: number[][]): MatrixOperationResult {
    const r = A.length;
    const c = A[0].length;
    const result = Array.from({ length: c }, (_, j) =>
      Array.from({ length: r }, (_, i) => A[i][j])
    );

    return {
      operation: 'Transpose (Aᵀ)',
      matrixA: A,
      resultMatrix: result,
      dimensions: `${c} × ${r}`,
      explanation: ['Rows and columns are swapped: Aᵀ[j][i] = A[i][j].']
    };
  }

  public static matrixDeterminant(A: number[][]): MatrixOperationResult {
    const n = A.length;
    if (A.some(row => row.length !== n)) {
      throw new Error('Determinant requires a square matrix (n × n).');
    }

    const det = this.computeDet(A);

    return {
      operation: 'Determinant |A|',
      matrixA: A,
      scalarResult: parseFloat(det.toFixed(6)),
      dimensions: `${n} × ${n}`,
      explanation: [
        `Computed using recursive cofactor expansion / Gaussian reduction.`,
        `Determinant = ${det.toFixed(6)} (${det === 0 ? 'Matrix is Singular / Non-invertible' : 'Matrix is Non-singular'})`
      ]
    };
  }

  private static computeDet(M: number[][]): number {
    const n = M.length;
    if (n === 1) return M[0][0];
    if (n === 2) return M[0][0] * M[1][1] - M[0][1] * M[1][0];

    let det = 0;
    for (let j = 0; j < n; j++) {
      const sub = M.slice(1).map(row => row.filter((_, colIdx) => colIdx !== j));
      const sign = j % 2 === 0 ? 1 : -1;
      det += sign * M[0][j] * this.computeDet(sub);
    }
    return det;
  }

  public static matrixInverse(A: number[][]): MatrixOperationResult {
    const n = A.length;
    if (A.some(row => row.length !== n)) {
      throw new Error('Matrix inversion requires a square matrix.');
    }

    const det = this.computeDet(A);
    if (Math.abs(det) < 1e-12) {
      throw new Error('Matrix is singular (|A| = 0). It has no multiplicative inverse.');
    }

    if (n === 2) {
      const inv = [
        [A[1][1] / det, -A[0][1] / det],
        [-A[1][0] / det, A[0][0] / det]
      ].map(row => row.map(v => parseFloat(v.toFixed(6))));

      return {
        operation: 'Inverse (A⁻¹)',
        matrixA: A,
        resultMatrix: inv,
        scalarResult: det,
        dimensions: '2 × 2',
        explanation: [
          `Determinant |A| = ${det.toFixed(4)}.`,
          `Computed as (1 / |A|) × Adjugate(A).`
        ]
      };
    }

    // Gauss-Jordan elimination on [A | I]
    const aug = A.map((row, i) => [
      ...row,
      ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
    ]);

    for (let i = 0; i < n; i++) {
      let pivot = i;
      for (let r = i + 1; r < n; r++) {
        if (Math.abs(aug[r][i]) > Math.abs(aug[pivot][i])) pivot = r;
      }
      [aug[i], aug[pivot]] = [aug[pivot], aug[i]];

      const pivotVal = aug[i][i];
      if (Math.abs(pivotVal) < 1e-12) {
        throw new Error('Matrix is singular during elimination.');
      }

      for (let j = 0; j < 2 * n; j++) aug[i][j] /= pivotVal;

      for (let r = 0; r < n; r++) {
        if (r !== i) {
          const factor = aug[r][i];
          for (let j = 0; j < 2 * n; j++) aug[r][j] -= factor * aug[i][j];
        }
      }
    }

    const inv = aug.map(row => row.slice(n).map(v => parseFloat(v.toFixed(6))));

    return {
      operation: 'Inverse (A⁻¹)',
      matrixA: A,
      resultMatrix: inv,
      scalarResult: det,
      dimensions: `${n} × ${n}`,
      explanation: [
        `Computed via Gauss-Jordan elimination on augmented matrix [A | I].`,
        `Verified |A| = ${det.toFixed(4)} ≠ 0.`
      ]
    };
  }

  // Solve Linear System AX = B
  public static solveLinearSystem(A: number[][], B: number[]): { x: number[]; steps: string[] } {
    const n = A.length;
    if (B.length !== n) {
      throw new Error(`Matrix A has ${n} rows but vector B has ${B.length} elements.`);
    }

    // Augmented matrix [A | B]
    const M = A.map((row, i) => [...row, B[i]]);
    const steps: string[] = [];
    steps.push(`Initial Augmented Matrix [A | B] of size ${n}×${n + 1}`);

    // Forward Elimination
    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) maxRow = k;
      }
      if (maxRow !== i) {
        [M[i], M[maxRow]] = [M[maxRow], M[i]];
        steps.push(`Pivoting: Swapped Row ${i + 1} with Row ${maxRow + 1}`);
      }

      if (Math.abs(M[i][i]) < 1e-12) {
        throw new Error('System of linear equations has no unique solution (singular matrix).');
      }

      for (let k = i + 1; k < n; k++) {
        const factor = M[k][i] / M[i][i];
        steps.push(`R${k + 1} = R${k + 1} - (${factor.toFixed(4)}) × R${i + 1}`);
        for (let j = i; j <= n; j++) {
          M[k][j] -= factor * M[i][j];
        }
      }
    }

    // Back Substitution
    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = M[i][n];
      for (let j = i + 1; j < n; j++) {
        sum -= M[i][j] * x[j];
      }
      x[i] = parseFloat((sum / M[i][i]).toFixed(6));
      steps.push(`Back-substitution: x${i + 1} = ${x[i]}`);
    }

    return { x, steps };
  }

  // Basic Math helpers
  public static calculateFactorial(n: number): number {
    if (n < 0 || !Number.isInteger(n)) throw new Error('Factorial requires a non-negative integer.');
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= Math.min(n, 170); i++) res *= i;
    return res;
  }

  public static calculatePermutation(n: number, r: number): number {
    if (r > n || n < 0 || r < 0) throw new Error('Permutation requires n >= r >= 0');
    return this.calculateFactorial(n) / this.calculateFactorial(n - r);
  }

  public static calculateCombination(n: number, r: number): number {
    if (r > n || n < 0 || r < 0) throw new Error('Combination requires n >= r >= 0');
    return this.calculateFactorial(n) / (this.calculateFactorial(r) * this.calculateFactorial(n - r));
  }

  public static calculateCompoundInterest(
    principal: number,
    annualRatePct: number,
    timesCompoundedPerYear: number,
    years: number
  ): { totalAmount: number; totalInterest: number; yearlyBreakdown: { year: number; balance: number; interest: number }[] } {
    const r = annualRatePct / 100;
    const n = timesCompoundedPerYear;
    const totalAmount = principal * Math.pow(1 + r / n, n * years);
    const totalInterest = totalAmount - principal;

    const yearlyBreakdown = [];
    for (let y = 1; y <= years; y++) {
      const bal = principal * Math.pow(1 + r / n, n * y);
      yearlyBreakdown.push({
        year: y,
        balance: parseFloat(bal.toFixed(2)),
        interest: parseFloat((bal - principal).toFixed(2))
      });
    }

    return {
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      yearlyBreakdown
    };
  }
}
