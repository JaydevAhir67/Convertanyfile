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
  sha256?: string;
  pageImages?: string[];
  userId?: string;
  expiresAt?: string;
  isEncrypted?: boolean;
  encryptionAlgorithm?: 'AES-256-GCM';
  integrityStatus?: 'VERIFIED' | 'TAMPERED' | 'UNCHECKED';
  securityAudit?: {
    isValid: boolean;
    detectedMime: string;
    detectedExt: string;
    warnings?: string[];
  };
}

export interface FileIntegrityRecord {
  file_id: string;
  user_id: string;
  original_filename: string;
  mime_type: string;
  size: number;
  sha256: string;
  created_at: string;
  expires_at: string;
  storage_key: string;
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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'guest';
  avatarUrl?: string;
  lastLoginAt: string;
  provider?: 'google' | 'email' | 'demo';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
  hasDriveAccess?: boolean;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  iconLink?: string;
}

export interface DriveUploadResult {
  fileId: string;
  fileName: string;
  webViewLink: string;
  size?: string;
}
