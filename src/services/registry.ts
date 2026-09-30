import { ToolDefinition, ToolCategory, ToolStatus } from '../types';

export interface ToolDirectoryItem extends ToolDefinition {
  subCategory?: 'organize' | 'optimize' | 'convert' | 'edit' | 'security' | 'intelligence';
  iconName?: string;
  popular?: boolean;
}

class ToolRegistry {
  private tools: Map<string, ToolDirectoryItem> = new Map();

  constructor() {
    this.initDefaultTools();
  }

  public register(tool: ToolDirectoryItem): void {
    this.tools.set(tool.id, tool);
  }

  public getTool(id: string): ToolDirectoryItem | undefined {
    return this.tools.get(id);
  }

  public getAll(): ToolDirectoryItem[] {
    return Array.from(this.tools.values());
  }

  public getByCategory(category: ToolCategory): ToolDirectoryItem[] {
    return this.getAll().filter(t => t.category === category);
  }

  public getBySubCategory(subCategory: ToolDirectoryItem['subCategory']): ToolDirectoryItem[] {
    return this.getAll().filter(t => t.subCategory === subCategory);
  }

  public getByStatus(status: ToolStatus): ToolDirectoryItem[] {
    return this.getAll().filter(t => t.status === status);
  }

  public findToolForConversion(inputExt: string, outputExt: string): ToolDirectoryItem | undefined {
    const inExt = inputExt.toLowerCase().replace('.', '');
    const outExt = outputExt.toLowerCase().replace('.', '');
    return this.getAll().find(
      t => t.inputExts.map(e => e.toLowerCase()).includes(inExt) && t.outputExt.toLowerCase() === outExt
    );
  }

  private initDefaultTools(): void {
    // ----------------------------------------------------
    // CONVERT TO PDF & FROM PDF (#4, #5, #13)
    // ----------------------------------------------------
    this.register({
      id: 'pdf-to-word',
      name: 'PDF to Word (DOCX)',
      category: 'document',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['pdf'],
      outputExt: 'docx',
      description: 'Extracts and reconstructs text, headings, tables, and typography into editable Microsoft Word (.docx).',
      badge: 'Popular',
      popular: true
    });

    this.register({
      id: 'word-to-pdf',
      name: 'Word (DOCX) to PDF',
      category: 'document',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['docx', 'doc'],
      outputExt: 'pdf',
      description: 'Preserves margins, fonts, tables, lists, and images to generate publication-grade PDF documents.',
      badge: 'Popular',
      popular: true
    });

    this.register({
      id: 'pdf-to-jpg',
      name: 'PDF to JPG',
      category: 'document',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['pdf'],
      outputExt: 'jpg',
      description: 'Rasterizes PDF pages into crisp high-resolution JPEG images (175+ DPI) with gallery preview and ZIP download.',
      badge: 'High DPI',
      popular: true
    });

    this.register({
      id: 'pdf-to-png',
      name: 'PDF to PNG',
      category: 'document',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['pdf'],
      outputExt: 'png',
      description: 'Renders PDF pages into lossless PNG graphics with full alpha transparency support.'
    });

    this.register({
      id: 'pdf-to-webp',
      name: 'PDF to WEBP',
      category: 'document',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['pdf'],
      outputExt: 'webp',
      description: 'Converts PDF pages into modern WebP format with small footprint and high visual fidelity.'
    });

    this.register({
      id: 'jpg-to-pdf',
      name: 'JPG to PDF',
      category: 'document',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['jpg', 'jpeg'],
      outputExt: 'pdf',
      description: 'Embeds single or multiple JPEG images into a clean fixed-layout A4/Letter PDF with auto-orientation.',
      badge: 'Popular',
      popular: true
    });

    this.register({
      id: 'png-to-pdf',
      name: 'PNG to PDF',
      category: 'document',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['png'],
      outputExt: 'pdf',
      description: 'Converts lossless PNG images into PDF with crisp borders and configurable margins.'
    });

    this.register({
      id: 'image-to-pdf',
      name: 'Image to PDF (Batch)',
      category: 'document',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'svg'],
      outputExt: 'pdf',
      description: 'Combines multiple images into a multi-page PDF with custom margins and page layout.',
      badge: 'Batch'
    });

    this.register({
      id: 'pdf-to-markdown',
      name: 'PDF to Markdown',
      category: 'document',
      subCategory: 'intelligence',
      status: 'AVAILABLE',
      inputExts: ['pdf'],
      outputExt: 'md',
      description: 'Extracts headings, paragraphs, and lists into structured Markdown format.'
    });

    this.register({
      id: 'pdf-to-txt',
      name: 'PDF to Text',
      category: 'document',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['pdf'],
      outputExt: 'txt',
      description: 'Extracts clean textual streams from PDF documents without formatting noise.'
    });

    this.register({
      id: 'txt-to-pdf',
      name: 'Text (TXT) to PDF',
      category: 'document',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['txt'],
      outputExt: 'pdf',
      description: 'Formats plain text files with clean margins and typography into standard PDF.'
    });

    this.register({
      id: 'markdown-to-pdf',
      name: 'Markdown to PDF',
      category: 'document',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['md', 'markdown'],
      outputExt: 'pdf',
      description: 'Parses headings, lists, tables, and code blocks in Markdown and renders styled PDF.'
    });

    this.register({
      id: 'html-to-pdf',
      name: 'HTML to PDF',
      category: 'document',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['html', 'htm'],
      outputExt: 'pdf',
      description: 'Renders raw HTML documents into printable PDF sheets with styled margins.'
    });

    // ----------------------------------------------------
    // ORGANIZE PDF (#13, #22, #23)
    // ----------------------------------------------------
    this.register({
      id: 'merge-pdf',
      name: 'Merge PDF',
      category: 'document',
      subCategory: 'organize',
      status: 'AVAILABLE',
      inputExts: ['pdf'],
      outputExt: 'pdf',
      description: 'Combine multiple PDF files into a single consolidated document in your desired order.',
      badge: 'Essential',
      popular: true
    });

    this.register({
      id: 'split-pdf',
      name: 'Split PDF',
      category: 'document',
      subCategory: 'organize',
      status: 'AVAILABLE',
      inputExts: ['pdf'],
      outputExt: 'zip',
      description: 'Extract individual pages or custom page ranges into separate PDFs or a single ZIP archive.',
      badge: 'Essential',
      popular: true
    });

    this.register({
      id: 'rotate-pdf',
      name: 'Rotate PDF',
      category: 'document',
      subCategory: 'organize',
      status: 'AVAILABLE',
      inputExts: ['pdf'],
      outputExt: 'pdf',
      description: 'Rotate PDF pages 90°, 180°, or 270° clockwise to fix inverted or sideways scans.'
    });

    // ----------------------------------------------------
    // OPTIMIZE PDF (#13, #24, #25)
    // ----------------------------------------------------
    this.register({
      id: 'compress-pdf',
      name: 'Compress PDF',
      category: 'document',
      subCategory: 'optimize',
      status: 'AVAILABLE',
      inputExts: ['pdf'],
      outputExt: 'pdf',
      description: 'Reduces PDF file size by 30% - 70% while maintaining crisp vector typography and readability.',
      badge: 'Popular',
      popular: true
    });

    this.register({
      id: 'ocr-pdf',
      name: 'OCR PDF / Scanned Docs',
      category: 'document',
      subCategory: 'intelligence',
      status: 'AVAILABLE',
      inputExts: ['pdf', 'png', 'jpg'],
      outputExt: 'docx',
      description: 'Optical Character Recognition: extracts editable text from scanned documents and images.',
      badge: 'AI Engine',
      popular: true
    });

    // ----------------------------------------------------
    // EDIT & SECURITY (#13, #26, #27, #28)
    // ----------------------------------------------------
    this.register({
      id: 'watermark-pdf',
      name: 'Watermark PDF',
      category: 'document',
      subCategory: 'edit',
      status: 'AVAILABLE',
      inputExts: ['pdf'],
      outputExt: 'pdf',
      description: 'Stamp custom diagonal text watermarks (e.g. CONFIDENTIAL, DRAFT) across all pages.'
    });

    this.register({
      id: 'page-numbers-pdf',
      name: 'Add Page Numbers',
      category: 'document',
      subCategory: 'edit',
      status: 'AVAILABLE',
      inputExts: ['pdf'],
      outputExt: 'pdf',
      description: 'Insert dynamic page numbering (e.g. "Page X of Y") in your preferred corner or center.'
    });

    // ----------------------------------------------------
    // IMAGE CONVERTERS (#12)
    // ----------------------------------------------------
    this.register({
      id: 'jpg-to-png',
      name: 'JPG to PNG',
      category: 'image',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['jpg', 'jpeg'],
      outputExt: 'png',
      description: 'Lossless conversion from JPEG to PNG with color fidelity preservation.',
      badge: 'Core',
      popular: true
    });

    this.register({
      id: 'png-to-jpg',
      name: 'PNG to JPG',
      category: 'image',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['png'],
      outputExt: 'jpg',
      description: 'Optimized JPEG conversion with pure-white background blending for transparency.',
      badge: 'Core',
      popular: true
    });

    this.register({
      id: 'image-to-webp',
      name: 'JPG/PNG to WEBP',
      category: 'image',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['jpg', 'jpeg', 'png', 'bmp'],
      outputExt: 'webp',
      description: 'Next-gen web format producing up to 30% smaller files with zero visible loss.',
      popular: true
    });

    this.register({
      id: 'webp-to-png',
      name: 'WEBP to PNG',
      category: 'image',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['webp'],
      outputExt: 'png',
      description: 'Decompresses WebP graphics into universal standard PNG.'
    });

    this.register({
      id: 'bmp-to-png',
      name: 'BMP to PNG/JPG',
      category: 'image',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['bmp'],
      outputExt: 'png',
      description: 'Transforms legacy Windows Bitmap files into compressed web-ready images.'
    });

    // ----------------------------------------------------
    // DATA & OFFICE SPREADSHEETS (#14)
    // ----------------------------------------------------
    this.register({
      id: 'csv-to-json',
      name: 'CSV to JSON',
      category: 'data',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['csv'],
      outputExt: 'json',
      description: 'Parses tabular CSV rows into structured JSON records with automatic type inference.'
    });

    this.register({
      id: 'json-to-csv',
      name: 'JSON to CSV',
      category: 'data',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['json'],
      outputExt: 'csv',
      description: 'Flattens JSON record arrays into clean tabular CSV with UTF-8 encoding.'
    });

    this.register({
      id: 'csv-to-excel',
      name: 'CSV to Excel (XLSX)',
      category: 'data',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['csv'],
      outputExt: 'xlsx',
      description: 'Generates genuine Microsoft Excel (.xlsx) workbooks with auto-fitted columns.'
    });

    this.register({
      id: 'excel-to-csv',
      name: 'Excel (XLSX) to CSV',
      category: 'data',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['xlsx', 'xls'],
      outputExt: 'csv',
      description: 'Extracts sheet rows from Excel workbooks into universal comma-delimited text.'
    });

    this.register({
      id: 'json-to-xml',
      name: 'JSON to XML',
      category: 'data',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['json'],
      outputExt: 'xml',
      description: 'Converts hierarchical JSON trees into structured XML documents.'
    });

    // ----------------------------------------------------
    // AUDIO & VIDEO
    // ----------------------------------------------------
    this.register({
      id: 'wav-to-mp3',
      name: 'WAV to MP3',
      category: 'audio',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['wav'],
      outputExt: 'mp3',
      description: 'Compresses uncompressed PCM WAV waveforms into universally compatible MP3.'
    });

    this.register({
      id: 'audio-to-wav',
      name: 'Audio to WAV',
      category: 'audio',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['mp3', 'ogg', 'm4a', 'aac', 'flac'],
      outputExt: 'wav',
      description: 'Decodes compressed audio streams into pristine linear PCM WAV.'
    });

    this.register({
      id: 'mp3-to-mp4',
      name: 'MP3 + Image to MP4 Video',
      category: 'video',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['mp3', 'wav', 'ogg'],
      outputExt: 'mp4',
      description: 'Merges an audio track with a visual backdrop and waveforms into playable video.'
    });

    // ----------------------------------------------------
    // SCIENTIFIC & UNITS
    // ----------------------------------------------------
    this.register({
      id: 'unit-converter',
      name: 'Universal Unit Converter',
      category: 'units',
      subCategory: 'convert',
      status: 'AVAILABLE',
      inputExts: ['unit'],
      outputExt: 'unit',
      description: 'Instant multi-category conversions: Length, Weight, Temperature, Speed, Storage.'
    });
  }
}

export const registry = new ToolRegistry();
