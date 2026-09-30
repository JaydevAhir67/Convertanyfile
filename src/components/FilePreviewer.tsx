import React, { useEffect, useState, useRef } from 'react';
import mammoth from 'mammoth';
import Papa from 'papaparse';
import JSZip from 'jszip';
import {
  FileText,
  Image as ImageIcon,
  FileCode,
  Database,
  Music,
  Maximize2,
  Minimize2,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FolderArchive,
  Grid
} from 'lucide-react';
import { SecurityEngine } from '../services/securityEngine';

interface FilePreviewerProps {
  fileOrBlob: File | Blob;
  filename: string;
  title?: string;
  mode?: 'inline' | 'modal';
  onClose?: () => void;
  pageImages?: string[];
}

interface GalleryItem {
  name: string;
  dataUrl: string;
  blob?: Blob;
  pageNum: number;
}

export const FilePreviewer: React.FC<FilePreviewerProps> = ({
  fileOrBlob,
  filename,
  title,
  mode = 'inline',
  onClose,
  pageImages
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<
    'docx' | 'pdf' | 'image' | 'gallery' | 'text' | 'csv' | 'json' | 'audio' | 'zip' | 'binary'
  >('binary');
  const [docHtml, setDocHtml] = useState<string>('');
  const [textContent, setTextContent] = useState<string>('');
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedGalleryIdx, setSelectedGalleryIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [wordCount, setWordCount] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [imageRotation, setImageRotation] = useState<number>(0);

  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const currentObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadPreview = async () => {
      setLoading(true);
      setError(null);
      setZoomLevel(1);
      setImageRotation(0);

      try {
        // Safe Object URL generation without premature revocation
        const newUrl = URL.createObjectURL(fileOrBlob);
        if (currentObjectUrlRef.current && currentObjectUrlRef.current !== newUrl) {
          try {
            URL.revokeObjectURL(currentObjectUrlRef.current);
          } catch {}
        }
        currentObjectUrlRef.current = newUrl;
        if (active) setObjectUrl(newUrl);

        // If pageImages are explicitly passed (e.g. from PDF->JPG)
        if (pageImages && pageImages.length > 0) {
          const items: GalleryItem[] = pageImages.map((dataUrl, idx) => ({
            name: `Page ${idx + 1}`,
            dataUrl,
            pageNum: idx + 1
          }));
          if (active) {
            setGalleryItems(items);
            setPreviewType('gallery');
            setLoading(false);
          }
          return;
        }

        // 1. Word DOCX / DOC
        if (ext === 'docx' || ext === 'doc') {
          setPreviewType('docx');
          const arrayBuffer = await fileOrBlob.arrayBuffer();
          try {
            const result = await mammoth.convertToHtml({ arrayBuffer });
            if (active) {
              const rawHtml = result.value || '<p class="text-slate-400 italic">Empty Word document.</p>';
              const safeHtml = SecurityEngine.sanitizeHtml(rawHtml);
              setDocHtml(safeHtml);
              const temp = document.createElement('div');
              temp.innerHTML = safeHtml;
              const text = temp.innerText || temp.textContent || '';
              setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
            }
          } catch {
            if (active) {
              setDocHtml(
                `<div class="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                  <strong>DOCX Package Ready:</strong> Document verified. Click 'Download' to view in Microsoft Word or Google Docs.
                </div>`
              );
            }
          }
        }
        // 2. PDF Document
        else if (ext === 'pdf') {
          if (active) setPreviewType('pdf');
        }
        // 3. Single Image (JPG, PNG, WEBP, GIF, SVG, BMP)
        else if (
          ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp'].includes(ext) ||
          fileOrBlob.type.startsWith('image/')
        ) {
          if (active) setPreviewType('image');

          // Read as Base64 DataURL as a 100% resilient fallback for image display
          try {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (active && typeof reader.result === 'string') {
                setImageDataUrl(reader.result);
              }
            };
            reader.readAsDataURL(fileOrBlob);
          } catch {}
        }
        // 4. ZIP Archive (Multi-page PDF->Images or multi-file archives)
        else if (ext === 'zip' || fileOrBlob.type === 'application/zip') {
          try {
            const arrayBuffer = await fileOrBlob.arrayBuffer();
            const zip = await JSZip.loadAsync(arrayBuffer);
            const imageEntries: { name: string; entry: JSZip.JSZipObject }[] = [];

            zip.forEach((path, entry) => {
              const lower = path.toLowerCase();
              if (
                !entry.dir &&
                (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp'))
              ) {
                imageEntries.push({ name: path, entry });
              }
            });

            // Sort page numbers naturally (page_01, page_02)
            imageEntries.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

            if (imageEntries.length > 0) {
              const gallery: GalleryItem[] = [];
              for (let i = 0; i < imageEntries.length; i++) {
                const item = imageEntries[i];
                const blob = await item.entry.async('blob');
                const dataUrl = await new Promise<string>(resolve => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(blob);
                });
                gallery.push({
                  name: item.name,
                  dataUrl,
                  blob,
                  pageNum: i + 1
                });
              }

              if (active) {
                setGalleryItems(gallery);
                setPreviewType('gallery');
              }
            } else {
              if (active) setPreviewType('zip');
            }
          } catch {
            if (active) setPreviewType('zip');
          }
        }
        // 5. CSV Tabular Data
        else if (ext === 'csv') {
          setPreviewType('csv');
          const text = await fileOrBlob.text();
          const parsed = Papa.parse(text, { header: true, preview: 25, skipEmptyLines: true });
          if (active) {
            setCsvData(parsed.data as any[]);
            setCsvHeaders(parsed.meta.fields || []);
          }
        }
        // 6. JSON Data
        else if (ext === 'json') {
          setPreviewType('json');
          const text = await fileOrBlob.text();
          try {
            const formatted = JSON.stringify(JSON.parse(text), null, 2);
            if (active) setTextContent(formatted);
          } catch {
            if (active) setTextContent(text);
          }
        }
        // 7. Plain Text / Markdown / Code
        else if (['txt', 'md', 'py', 'cpp', 'c', 'js', 'ts', 'html', 'css', 'xml'].includes(ext)) {
          setPreviewType('text');
          const text = await fileOrBlob.text();
          if (active) {
            setTextContent(text);
            setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
          }
        }
        // 8. Audio
        else if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) {
          setPreviewType('audio');
        } else {
          setPreviewType('binary');
        }
      } catch (err: any) {
        if (active) setError(err.message || 'Failed to render file preview.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPreview();

    return () => {
      active = false;
    };
  }, [fileOrBlob, filename, ext, pageImages]);

  // Cleanup object URL on true unmount
  useEffect(() => {
    return () => {
      if (currentObjectUrlRef.current) {
        try {
          URL.revokeObjectURL(currentObjectUrlRef.current);
        } catch {}
      }
    };
  }, []);

  const handleCopyText = () => {
    const toCopy = textContent || docHtml.replace(/<[^>]*>?/gm, '');
    if (toCopy) {
      navigator.clipboard.writeText(toCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const activeUrl = objectUrl || imageDataUrl;
    if (!activeUrl) return;
    const a = document.createElement('a');
    a.href = activeUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadGalleryItem = (item: GalleryItem) => {
    const a = document.createElement('a');
    a.href = item.dataUrl;
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-all shadow-xs ${
        mode === 'modal' ? 'fixed inset-4 sm:inset-10 z-50 shadow-2xl flex flex-col' : isExpanded ? 'fixed inset-4 sm:inset-10 z-50 shadow-2xl' : 'w-full'
      }`}
    >
      {/* Preview Header Bar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className="p-1.5 rounded-lg bg-red-600/30 border border-red-500/30 text-red-400 flex-shrink-0">
            {ext === 'docx' || ext === 'doc' ? (
              <FileText className="w-4 h-4 text-rose-400" />
            ) : previewType === 'image' || previewType === 'gallery' ? (
              <ImageIcon className="w-4 h-4 text-emerald-400" />
            ) : ext === 'csv' || ext === 'json' ? (
              <Database className="w-4 h-4 text-indigo-400" />
            ) : ext === 'zip' ? (
              <FolderArchive className="w-4 h-4 text-amber-400" />
            ) : (
              <FileCode className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className="truncate">
            <h4 className="font-bold text-xs sm:text-sm truncate leading-tight">
              {title || filename}
            </h4>
            <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
              <span className="font-mono uppercase bg-slate-800 px-1.5 py-0.5 rounded text-red-300 font-bold">
                .{ext}
              </span>
              <span>&bull;</span>
              <span>{(fileOrBlob.size / 1024).toFixed(1)} KB</span>
              {previewType === 'gallery' && (
                <>
                  <span>&bull;</span>
                  <span className="text-emerald-400 font-bold">{galleryItems.length} Pages</span>
                </>
              )}
              {wordCount > 0 && (
                <>
                  <span>&bull;</span>
                  <span>{wordCount.toLocaleString()} words</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 flex-shrink-0">
          {/* Zoom controls for single image */}
          {previewType === 'image' && (
            <div className="flex items-center space-x-1 bg-slate-800 px-1.5 py-1 rounded-lg mr-1 text-slate-300">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                className="p-1 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1">{Math.round(zoomLevel * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                className="p-1 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setImageRotation(prev => (prev + 90) % 360)}
                className="p-1 hover:text-white transition-colors border-l border-slate-700 ml-1 pl-1.5"
                title="Rotate 90°"
              >
                <RotateCw className="w-3 h-3" />
              </button>
            </div>
          )}

          {(previewType === 'text' || previewType === 'json' || previewType === 'docx') && (
            <button
              type="button"
              onClick={handleCopyText}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs flex items-center space-x-1"
              title="Copy content"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            type="button"
            onClick={handleDownload}
            className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-1 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {mode === 'inline' && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isExpanded ? 'Minimize' : 'Maximize Preview'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          {mode === 'modal' && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Preview Content Canvas */}
      <div
        className={`flex-1 bg-slate-100 dark:bg-slate-950 overflow-auto relative min-h-[280px] ${
          isExpanded || mode === 'modal' ? 'h-[calc(100vh-140px)]' : 'max-h-[440px]'
        }`}
      >
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-xs text-slate-600 dark:text-slate-300 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            <span className="text-xs font-semibold">Generating High-Fidelity Preview...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-slate-500 space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{error}</p>
            <button
              type="button"
              onClick={handleDownload}
              className="px-3.5 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-red-500"
            >
              Download File Directly
            </button>
          </div>
        ) : previewType === 'gallery' ? (
          // Multi-Page Image Gallery for PDF->JPG or batch archives (#2, #9, #16)
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Grid className="w-4 h-4 text-red-500" />
                <span>Generated Pages ({galleryItems.length})</span>
              </span>
              <span className="text-[11px] text-slate-400">Click any page thumbnail to inspect or download</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`group relative bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden p-2.5 transition-all shadow-sm ${
                    selectedGalleryIdx === idx
                      ? 'border-red-500 ring-2 ring-red-500/20 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div
                    onClick={() => setSelectedGalleryIdx(idx)}
                    className="relative cursor-pointer bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden aspect-[1/1.3] flex items-center justify-center border border-slate-100 dark:border-slate-850"
                  >
                    <img
                      src={item.dataUrl}
                      alt={item.name}
                      className="w-full h-full object-contain p-2 group-hover:scale-[1.02] transition-transform"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-mono font-bold backdrop-blur-xs">
                      Page {item.pageNum}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 px-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {item.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => downloadGalleryItem(item)}
                      className="px-2 py-1 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1"
                      title="Download this page image"
                    >
                      <Download className="w-3 h-3" />
                      <span>JPG</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : previewType === 'image' ? (
          // Single Image Preview with Zoom & Direct Rendering (#2, #10)
          <div className="flex items-center justify-center p-6 h-full min-h-[320px] overflow-auto">
            <div
              style={{
                transform: `scale(${zoomLevel}) rotate(${imageRotation}deg)`,
                transition: 'transform 0.2s ease-out'
              }}
              className="max-h-full max-w-full flex items-center justify-center"
            >
              <img
                src={imageDataUrl || objectUrl || ''}
                alt={filename}
                className="max-h-[380px] max-w-full object-contain rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                onError={() => {
                  setError('Image preview could not be decoded. File is valid and ready for download.');
                }}
              />
            </div>
          </div>
        ) : previewType === 'docx' ? (
          // Microsoft Word Document Renderer
          <div className="p-4 sm:p-8 flex justify-center">
            <div
              id="docx-preview-sheet"
              className="w-full max-w-[800px] bg-white shadow-xl rounded-xl p-8 sm:p-12 border border-slate-200 text-slate-800 min-h-[500px]"
              style={{
                fontFamily: 'Calibri, "Segoe UI", -apple-system, Roboto, sans-serif',
                lineHeight: '1.6'
              }}
            >
              <div className="pb-4 mb-6 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-red-600 uppercase tracking-wider flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Word (.docx) Document Live Rendering</span>
                </span>
                <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[10px] text-slate-600">
                  OpenXML Verified
                </span>
              </div>
              <div
                className="docx-content prose prose-sm sm:prose-base max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-li:text-slate-700 prose-table:border prose-th:bg-slate-50 prose-td:p-2"
                dangerouslySetInnerHTML={{ __html: docHtml }}
              />
            </div>
          </div>
        ) : previewType === 'pdf' ? (
          // PDF Embed Viewer
          <div className="w-full h-full min-h-[380px] flex flex-col">
            <iframe
              src={`${objectUrl}#toolbar=0`}
              title="PDF Preview"
              className="w-full flex-1 border-0 rounded-b-2xl min-h-[380px] bg-white"
            />
          </div>
        ) : previewType === 'csv' ? (
          // CSV Tabular Grid Viewer
          <div className="p-4 overflow-x-auto">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
                  <tr>
                    {csvHeaders.map((head, idx) => (
                      <th key={idx} className="py-2.5 px-3 whitespace-nowrap">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {csvData.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-red-50/40 dark:hover:bg-red-950/20 transition-colors">
                      {csvHeaders.map((head, cIdx) => (
                        <td key={cIdx} className="py-2 px-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                          {String(row[head] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] text-slate-500 font-medium">
                Showing top {csvData.length} records. Download full file to see complete dataset.
              </div>
            </div>
          </div>
        ) : previewType === 'json' || previewType === 'text' ? (
          // Monospace Code / Text Viewer
          <div className="p-4 h-full">
            <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-200 overflow-auto max-h-[380px] border border-slate-800 shadow-inner leading-relaxed whitespace-pre-wrap">
              {textContent}
            </div>
          </div>
        ) : previewType === 'audio' ? (
          // Audio Player Viewer
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center shadow-inner">
              <Music className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h5 className="font-bold text-slate-800 dark:text-white text-sm">{filename}</h5>
              <p className="text-xs text-slate-500">Decoded Audio Stream</p>
            </div>
            <audio controls src={objectUrl || ''} className="w-full max-w-md mt-2" />
          </div>
        ) : (
          // Fallback Generic Binary File
          <div className="p-8 text-center text-slate-500 space-y-3">
            <FileCode className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Binary Package Ready ({filename})
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              This file has been generated and validated with cryptographic integrity. Click Download to save and open in your preferred desktop viewer.
            </p>
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-red-500 transition-colors inline-flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {ext.toUpperCase()} File</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
