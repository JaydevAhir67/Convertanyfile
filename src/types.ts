export type ToolCategory =
  | 'document'
  | 'image'
  | 'audio'
  | 'video'
  | 'data'
  | 'code'
  | 'scientific'
  | 'units';

export type ToolStatus = 'AVAILABLE' | 'COMING_SOON' | 'SCIENTIFIC';

export interface ToolDefinition {
  id: string;
  name: string;
  category: ToolCategory;
  status: ToolStatus;
  inputExts: string[];
  outputExt: string;
  description: string;
  badge?: string;
}

export type JobStatus = 'PENDING' | 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ConversionJob {
  id: string;
  toolId: string;
  toolName: string;
  category: ToolCategory;
  originalFilename: string;
  storedFilename: string;
  outputFilename: string;
  fileSize: number;
  status: JobStatus;
  progress: number;
  processingTime?: number; // in seconds
  errorMsg?: string;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  blobData?: Blob;
  previewUrl?: string;
}

// Scientific Computing Types
export interface DescriptiveStatistics {
  count: number;
  sum: number;
  mean: number;
  median: number;
  mode: number[];
  min: number;
  max: number;
  range: number;
  variance: number; // Sample variance (ddof=1)
  stdDev: number;   // Sample standard deviation
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  kurtosis: number;
  outliers: number[];
  zScores: { value: number; z: number; isOutlier: boolean }[];
}

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  r: number;        // Pearson correlation
  rSquared: number; // R^2 coefficient of determination
  n: number;
  formula: string;
  xMean: number;
  yMean: number;
  points: { x: number; y: number; yPred: number; residual: number }[];
}

export interface RootFindingIteration {
  iteration: number;
  a?: number;
  b?: number;
  x: number;
  fx: number;
  error: number;
}

export interface RootFindingResult {
  method: 'bisection' | 'newton' | 'secant' | 'regula_falsi';
  equation: string;
  root: number;
  iterationsCount: number;
  tolerance: number;
  iterations: RootFindingIteration[];
  converged: boolean;
  message: string;
}

export interface NumericalIntegrationResult {
  method: 'trapezoidal' | 'simpson_1_3';
  equation: string;
  a: number;
  b: number;
  n: number;
  h: number;
  steps: { i: number; x: number; fx: number; weight: number; term: number }[];
  result: number;
  formulaDescription: string;
}

export interface MatrixOperationResult {
  operation: string;
  matrixA: number[][];
  matrixB?: number[][];
  resultMatrix?: number[][];
  scalarResult?: number;
  explanation: string[];
  dimensions: string;
}

export interface VivaQuestion {
  id: number;
  category: string;
  question: string;
  answer: string;
  vivaTip: string;
  complexity?: string;
  keyPoints?: string[];
}
