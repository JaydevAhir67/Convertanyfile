import { ToolDefinition, ToolCategory, ToolStatus } from '../types';

class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  constructor() {
    this.initDefaultTools();
  }

  public register(tool: ToolDefinition): void {
    this.tools.set(tool.id, tool);
  }

  public getTool(id: string): ToolDefinition | undefined {
    return this.tools.get(id);
  }

  public getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  public getByCategory(category: ToolCategory): ToolDefinition[] {
    return this.getAll().filter(t => t.category === category);
  }

  public getByStatus(status: ToolStatus): ToolDefinition[] {
    return this.getAll().filter(t => t.status === status);
  }

  public findToolForConversion(inputExt: string, outputExt: string): ToolDefinition | undefined {
    const inExt = inputExt.toLowerCase().replace('.', '');
    const outExt = outputExt.toLowerCase().replace('.', '');
    return this.getAll().find(
      t => t.inputExts.map(e => e.toLowerCase()).includes(inExt) && t.outputExt.toLowerCase() === outExt
    );
  }

  private initDefaultTools(): void {
    // Document Converters
    this.register({
      id: 'pdf-to-word',
      name: 'PDF to Word (DOCX)',
      category: 'document',
      status: 'AVAILABLE',
      inputExts: ['pdf'],
      outputExt: 'docx',
      description: 'Extracts and reconstructs text, paragraphs, and structure from PDF into editable Microsoft Word (.docx).',
      badge: 'Popular'
    });

    this.register({
      id: 'word-to-pdf',
      name: 'Word (DOCX) to PDF',
      category: 'document',
      status: 'AVAILABLE',
      inputExts: ['docx', 'doc'],
      outputExt: 'pdf',
      description: 'Calculates typography, pagination, and layout to render high-fidelity fixed-layout PDF.',
      badge: 'Popular'
    });

    this.register({
      id: 'pdf-to-jpg',
      name: 'PDF to JPG',
      category: 'document',
      status: 'AVAILABLE',
      inputExts: ['pdf'],
      outputExt: 'jpg',
      description: 'Rasterizes PDF pages into crisp high-resolution JPEG images at 150+ DPI.',
      badge: 'Fast'
    });

    this.register({
      id: 'pdf-to-png',
      name: 'PDF to PNG',
      category: 'document',
      status: 'AVAILABLE',
      inputExts: ['pdf'],
      outputExt: 'png',
      description: 'Renders PDF pages into lossless PNG graphics with full alpha transparency support.'
    });

    this.register({
      id: 'txt-to-pdf',
      name: 'Text (TXT) to PDF',
      category: 'document',
      status: 'AVAILABLE',
      inputExts: ['txt'],
      outputExt: 'pdf',
      description: 'Formats plain text files with clean margins and typography into standard PDF.'
    });

    this.register({
      id: 'markdown-to-pdf',
      name: 'Markdown (MD) to PDF',
      category: 'document',
      status: 'AVAILABLE',
      inputExts: ['md', 'markdown'],
      outputExt: 'pdf',
      description: 'Parses headings, lists, tables, and code snippets in Markdown and converts to styled PDF.'
    });

    this.register({
      id: 'html-to-pdf',
      name: 'HTML to PDF',
      category: 'document',
      status: 'AVAILABLE',
      inputExts: ['html', 'htm'],
      outputExt: 'pdf',
      description: 'Renders raw HTML documents into printable PDF sheets with styled margins.'
    });

    // Image Converters
    this.register({
      id: 'jpg-to-png',
      name: 'JPG to PNG',
      category: 'image',
      status: 'AVAILABLE',
      inputExts: ['jpg', 'jpeg'],
      outputExt: 'png',
      description: 'Lossless pixel conversion from JPEG to PNG with color profile preservation.',
      badge: 'Core'
    });

    this.register({
      id: 'png-to-jpg',
      name: 'PNG to JPG',
      category: 'image',
      status: 'AVAILABLE',
      inputExts: ['png'],
      outputExt: 'jpg',
      description: 'Optimized JPEG conversion with adjustable quality factor and RGB background blending.'
    });

    this.register({
      id: 'image-to-webp',
      name: 'JPG/PNG to WEBP',
      category: 'image',
      status: 'AVAILABLE',
      inputExts: ['jpg', 'jpeg', 'png', 'bmp'],
      outputExt: 'webp',
      description: 'Modern next-gen image format yielding up to 30% smaller file size with high fidelity.'
    });

    this.register({
      id: 'webp-to-png',
      name: 'WEBP to PNG',
      category: 'image',
      status: 'AVAILABLE',
      inputExts: ['webp'],
      outputExt: 'png',
      description: 'Decompresses Google WebP format into universal uncompressed PNG.'
    });

    this.register({
      id: 'bmp-to-png',
      name: 'BMP to PNG/JPG',
      category: 'image',
      status: 'AVAILABLE',
      inputExts: ['bmp'],
      outputExt: 'png',
      description: 'Transforms legacy Windows Bitmap files into compressed web-ready images.'
    });

    // Audio & Video Converters
    this.register({
      id: 'wav-to-mp3',
      name: 'WAV to MP3',
      category: 'audio',
      status: 'AVAILABLE',
      inputExts: ['wav'],
      outputExt: 'mp3',
      description: 'Compresses uncompressed PCM WAV waveforms into universally compatible MP3.'
    });

    this.register({
      id: 'audio-to-wav',
      name: 'Audio to WAV',
      category: 'audio',
      status: 'AVAILABLE',
      inputExts: ['mp3', 'ogg', 'm4a', 'aac', 'flac'],
      outputExt: 'wav',
      description: 'Decodes compressed audio streams into pristine 16-bit 44.1kHz linear PCM WAV.'
    });

    this.register({
      id: 'mp3-to-mp4',
      name: 'MP3 + Image to MP4 Video',
      category: 'video',
      status: 'AVAILABLE',
      inputExts: ['mp3', 'wav', 'ogg'],
      outputExt: 'mp4',
      description: 'Merges an audio track with a custom visual background, title, and visualizer into a playable MP4 video.',
      badge: 'Unique PSC Feature'
    });

    this.register({
      id: 'video-to-audio',
      name: 'Video (MP4) to Audio (MP3/WAV)',
      category: 'video',
      status: 'AVAILABLE',
      inputExts: ['mp4', 'webm', 'mov', 'mkv'],
      outputExt: 'mp3',
      description: 'Strips video streams and extracts high-quality audio tracks directly.'
    });

    // Data Converters
    this.register({
      id: 'csv-to-json',
      name: 'CSV to JSON',
      category: 'data',
      status: 'AVAILABLE',
      inputExts: ['csv'],
      outputExt: 'json',
      description: 'Parses tabular CSV rows into structured JSON records with type inference.',
      badge: 'Data Engine'
    });

    this.register({
      id: 'json-to-csv',
      name: 'JSON to CSV',
      category: 'data',
      status: 'AVAILABLE',
      inputExts: ['json'],
      outputExt: 'csv',
      description: 'Flattens JSON record arrays into clean tabular CSV with UTF-8 BOM encoding.'
    });

    this.register({
      id: 'csv-to-excel',
      name: 'CSV to Excel (XLSX)',
      category: 'data',
      status: 'AVAILABLE',
      inputExts: ['csv'],
      outputExt: 'xlsx',
      description: 'Generates real Microsoft Excel spreadsheet workbooks with formatted columns and headers.'
    });

    this.register({
      id: 'excel-to-csv',
      name: 'Excel (XLSX) to CSV',
      category: 'data',
      status: 'AVAILABLE',
      inputExts: ['xlsx', 'xls'],
      outputExt: 'csv',
      description: 'Extracts sheet rows from Excel workbooks into universal comma-delimited text.'
    });

    this.register({
      id: 'json-to-xml',
      name: 'JSON to XML',
      category: 'data',
      status: 'AVAILABLE',
      inputExts: ['json'],
      outputExt: 'xml',
      description: 'Converts hierarchical JSON trees into structured XML documents with tags and attributes.'
    });

    // Code Transpiler
    this.register({
      id: 'code-transpiler',
      name: 'Source Code Transpiler & Translator',
      category: 'code',
      status: 'AVAILABLE',
      inputExts: ['c', 'cpp', 'java', 'py', 'js', 'ts'],
      outputExt: 'txt',
      description: 'Cross-language rule-based source code translator with token analysis, AST mapping, and compatibility warnings.',
      badge: 'Experimental'
    });

    // Scientific Computing Tools
    this.register({
      id: 'stats-lab',
      name: 'Statistical Analysis Lab',
      category: 'scientific',
      status: 'SCIENTIFIC',
      inputExts: ['csv', 'json', 'txt'],
      outputExt: 'pdf',
      description: 'Mean, Median, Mode, Variance, Std Dev, Quartiles, IQR, Z-scores, Outlier detection & PDF report generation.',
      badge: 'PSC Core'
    });

    this.register({
      id: 'regression-lab',
      name: 'Correlation & Linear Regression',
      category: 'scientific',
      status: 'SCIENTIFIC',
      inputExts: ['csv', 'json', 'txt'],
      outputExt: 'pdf',
      description: 'Pearson correlation r, ordinary least squares regression (y = mx + b), R² determination, and scatter plot graph.',
      badge: 'PSC Core'
    });

    this.register({
      id: 'numerical-roots',
      name: 'Numerical Root Finding',
      category: 'scientific',
      status: 'SCIENTIFIC',
      inputExts: ['math'],
      outputExt: 'pdf',
      description: 'Solves f(x) = 0 via Bisection, Newton-Raphson, Secant, and Regula Falsi with complete iteration tables and error checks.',
      badge: 'PSC Core'
    });

    this.register({
      id: 'numerical-integration',
      name: 'Numerical Integration',
      category: 'scientific',
      status: 'SCIENTIFIC',
      inputExts: ['math'],
      outputExt: 'pdf',
      description: "Evaluates definite integrals using Trapezoidal Rule and Simpson's 1/3 Rule with step size h and partition steps.",
      badge: 'PSC Core'
    });

    this.register({
      id: 'matrix-calculator',
      name: 'Matrix Operations & Linear Solver',
      category: 'scientific',
      status: 'SCIENTIFIC',
      inputExts: ['matrix'],
      outputExt: 'pdf',
      description: 'Matrix addition, multiplication, transpose, determinant, inverse, rank, and solving AX = B via Gaussian elimination.',
      badge: 'PSC Core'
    });

    this.register({
      id: 'unit-converter',
      name: 'Scientific & Universal Unit Converter',
      category: 'units',
      status: 'AVAILABLE',
      inputExts: ['unit'],
      outputExt: 'unit',
      description: 'Instant multi-category conversions: Length, Weight, Temp, Area, Volume, Time, Speed, Digital Storage, Energy.'
    });
  }
}

export const registry = new ToolRegistry();
