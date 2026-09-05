import { jsPDF } from 'jspdf';
import {
  DescriptiveStatistics,
  LinearRegressionResult,
  RootFindingResult,
  NumericalIntegrationResult,
  MatrixOperationResult
} from '../types';

export class ReportGenerator {
  // 1. Statistics PDF Report
  public static generateStatisticsReport(stats: DescriptiveStatistics, datasetLabel: string = 'Sample Dataset'): Blob {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Header banner
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, pageWidth, 26, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('ConvertAnyFile — Scientific Calculation Lab', margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text('Descriptive Statistics & Data Dispersion Report', margin, 19);

    // Metadata
    let y = 38;
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(`Dataset: ${datasetLabel}`, margin, y);
    doc.text(`Date of Computation: ${new Date().toLocaleString()}`, margin + 90, y);

    y += 8;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Section 1: Measures of Central Tendency
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Measures of Central Tendency', margin, y);
    y += 7;

    const tableRows = [
      ['Sample Size (N)', `${stats.count}`],
      ['Sum of Observations (∑x)', `${stats.sum}`],
      ['Arithmetic Mean (x̄)', `${stats.mean}`],
      ['Median (50th Percentile)', `${stats.median}`],
      ['Mode', stats.mode.length > 0 ? stats.mode.join(', ') : 'No unique mode']
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    tableRows.forEach(([metric, val]) => {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 4, pageWidth - margin * 2, 7, 'F');
      doc.setTextColor(71, 85, 105);
      doc.text(metric, margin + 4, y);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(val, pageWidth - margin - 40, y);
      doc.setFont('helvetica', 'normal');
      y += 8;
    });

    y += 6;
    // Section 2: Measures of Dispersion & Shape
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('2. Measures of Dispersion & Quartiles', margin, y);
    y += 7;

    const dispersionRows = [
      ['Minimum Value', `${stats.min}`],
      ['Maximum Value', `${stats.max}`],
      ['Range (Max - Min)', `${stats.range}`],
      ['Sample Variance (s²)', `${stats.variance} (Bessel corrected: n-1)`],
      ['Standard Deviation (s)', `${stats.stdDev}`],
      ['First Quartile (Q₁ - 25%)', `${stats.q1}`],
      ['Third Quartile (Q₃ - 75%)', `${stats.q3}`],
      ['Interquartile Range (IQR)', `${stats.iqr}`],
      ['Skewness (Fisher-Pearson)', `${stats.skewness}`],
      ['Kurtosis (Excess)', `${stats.kurtosis}`]
    ];

    dispersionRows.forEach(([metric, val]) => {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 4, pageWidth - margin * 2, 7, 'F');
      doc.setTextColor(71, 85, 105);
      doc.text(metric, margin + 4, y);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(val, pageWidth - margin - 50, y);
      doc.setFont('helvetica', 'normal');
      y += 7.5;
    });

    y += 8;
    // Outliers
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('3. Outlier Analysis (1.5 × IQR Tukey Fence)', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    const outlierTxt = stats.outliers.length > 0
      ? `Detected ${stats.outliers.length} statistical outlier(s): [ ${stats.outliers.join(', ')} ]`
      : 'No outliers detected based on the 1.5 × IQR criterion [Q₁ - 1.5·IQR, Q₃ + 1.5·IQR].';
    doc.text(outlierTxt, margin, y);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('PSC Mini-Project: ConvertAnyFile — Programming for Scientific Calculations', margin, 285);

    return doc.output('blob');
  }

  // 2. Linear Regression PDF Report
  public static generateRegressionReport(reg: LinearRegressionResult): Blob {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 26, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('ConvertAnyFile — Scientific Calculation Lab', margin, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('Ordinary Least Squares (OLS) Linear Regression Report', margin, 19);

    let y = 38;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Regression Equation & Fit Metrics', margin, y);
    y += 8;

    const statsRows = [
      ['Best-Fit Model Equation', reg.formula],
      ['Slope (m)', `${reg.slope}`],
      ['Y-Intercept (b)', `${reg.intercept}`],
      ['Pearson Correlation Coefficient (r)', `${reg.r} (${Math.abs(reg.r) > 0.7 ? 'Strong' : 'Moderate'} correlation)`],
      ['Coefficient of Determination (R²)', `${reg.rSquared} (${(reg.rSquared * 100).toFixed(2)}% variance explained)`],
      ['Sample Observations (n)', `${reg.n}`],
      ['Mean of Independent X', `${reg.xMean}`],
      ['Mean of Dependent Y', `${reg.yMean}`]
    ];

    doc.setFontSize(9.5);
    statsRows.forEach(([label, val]) => {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 4, pageWidth - margin * 2, 7, 'F');
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.text(label, margin + 4, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(val, pageWidth - margin - 60, y);
      y += 8;
    });

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Sample Observations & Residual Analysis', margin, y);
    y += 7;

    // Table Header
    doc.setFillColor(226, 232, 240);
    doc.rect(margin, y - 4, pageWidth - margin * 2, 6, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Obs #', margin + 4, y);
    doc.text('X (Input)', margin + 30, y);
    doc.text('Y (Actual)', margin + 65, y);
    doc.text('Y (Predicted)', margin + 105, y);
    doc.text('Residual (e = Y - Ŷ)', margin + 145, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    reg.points.slice(0, 15).forEach((p, idx) => {
      doc.setTextColor(51, 65, 85);
      doc.text(`${idx + 1}`, margin + 4, y);
      doc.text(`${p.x}`, margin + 30, y);
      doc.text(`${p.y}`, margin + 65, y);
      doc.text(`${p.yPred}`, margin + 105, y);
      doc.text(`${p.residual}`, margin + 145, y);
      y += 5.5;
    });

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('ConvertAnyFile PSC Project — Linear Model Computation', margin, 285);

    return doc.output('blob');
  }

  // 3. Numerical Root Finding Report
  public static generateRootFindingReport(rootRes: RootFindingResult): Blob {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 26, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('ConvertAnyFile — Scientific Calculation Lab', margin, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(`Numerical Root Finding Report (${rootRes.method.toUpperCase()} Method)`, margin, 19);

    let y = 38;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Root Computation Summary', margin, y);
    y += 8;

    const summary = [
      ['Nonlinear Equation f(x) = 0', rootRes.equation],
      ['Numerical Method', rootRes.method.toUpperCase()],
      ['Calculated Root (x*)', `${rootRes.root}`],
      ['Total Iterations Completed', `${rootRes.iterationsCount}`],
      ['Convergence Tolerance (ε)', `${rootRes.tolerance}`],
      ['Convergence Status', rootRes.converged ? 'Converged Successfully' : 'Did Not Converge']
    ];

    doc.setFontSize(9.5);
    summary.forEach(([k, v]) => {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 4, pageWidth - margin * 2, 7, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(k, margin + 4, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(v, pageWidth - margin - 55, y);
      y += 8;
    });

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Step-by-Step Iteration Table', margin, y);
    y += 7;

    // Header row
    doc.setFillColor(226, 232, 240);
    doc.rect(margin, y - 4, pageWidth - margin * 2, 6, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Iter', margin + 4, y);
    doc.text('x_i', margin + 25, y);
    doc.text('f(x_i)', margin + 70, y);
    doc.text('Absolute Error |Δx|', margin + 120, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    rootRes.iterations.forEach(step => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.setTextColor(51, 65, 85);
      doc.text(`${step.iteration}`, margin + 4, y);
      doc.text(`${step.x}`, margin + 25, y);
      doc.text(`${step.fx}`, margin + 70, y);
      doc.text(`${step.error.toExponential(4)}`, margin + 120, y);
      y += 5.5;
    });

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('ConvertAnyFile PSC Project — Root Finding Methods', margin, 285);

    return doc.output('blob');
  }

  // 4. Numerical Integration Report
  public static generateIntegrationReport(integ: NumericalIntegrationResult): Blob {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 26, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('ConvertAnyFile — Scientific Calculation Lab', margin, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('Definite Numerical Integration Report', margin, 19);

    let y = 38;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Integration Parameters & Integral Value', margin, y);
    y += 8;

    const data = [
      ['Integrand Function f(x)', integ.equation],
      ['Integration Method', integ.method === 'trapezoidal' ? 'Trapezoidal Rule' : "Simpson's 1/3 Rule"],
      ['Lower Bound (a)', `${integ.a}`],
      ['Upper Bound (b)', `${integ.b}`],
      ['Number of Subintervals (n)', `${integ.n}`],
      ['Step Size h = (b - a) / n', `${integ.h}`],
      ['Approximate Integral I', `${integ.result}`]
    ];

    doc.setFontSize(9.5);
    data.forEach(([k, v]) => {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 4, pageWidth - margin * 2, 7, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(k, margin + 4, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(v, pageWidth - margin - 50, y);
      y += 8;
    });

    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Partition Step Evaluation', margin, y);
    y += 7;

    doc.setFillColor(226, 232, 240);
    doc.rect(margin, y - 4, pageWidth - margin * 2, 6, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('i', margin + 4, y);
    doc.text('x_i', margin + 25, y);
    doc.text('f(x_i)', margin + 65, y);
    doc.text('Weight w_i', margin + 115, y);
    doc.text('Term w_i × f(x_i)', margin + 145, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    integ.steps.forEach(step => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.setTextColor(51, 65, 85);
      doc.text(`${step.i}`, margin + 4, y);
      doc.text(`${step.x}`, margin + 25, y);
      doc.text(`${step.fx}`, margin + 65, y);
      doc.text(`${step.weight}`, margin + 115, y);
      doc.text(`${step.term}`, margin + 145, y);
      y += 5.5;
    });

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('ConvertAnyFile PSC Project — Numerical Quadrature', margin, 285);

    return doc.output('blob');
  }

  // 5. Matrix Report
  public static generateMatrixReport(mat: MatrixOperationResult): Blob {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 26, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('ConvertAnyFile — Scientific Calculation Lab', margin, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(`Matrix Operation Report: ${mat.operation}`, margin, 19);

    let y = 40;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`Operation: ${mat.operation} (${mat.dimensions})`, margin, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    mat.explanation.forEach(exp => {
      doc.text(`•  ${exp}`, margin, y);
      y += 6;
    });

    y += 8;
    if (mat.resultMatrix) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Resulting Matrix:', margin, y);
      y += 8;

      mat.resultMatrix.forEach(row => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        const rowStr = '[  ' + row.map(v => v.toString().padStart(8, ' ')).join('  ') + '  ]';
        doc.text(rowStr, margin + 8, y);
        y += 7;
      });
    }

    if (mat.scalarResult !== undefined) {
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`Scalar Result: ${mat.scalarResult}`, margin, y);
    }

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('ConvertAnyFile PSC Project — Linear Algebra Engine', margin, 285);

    return doc.output('blob');
  }
}
