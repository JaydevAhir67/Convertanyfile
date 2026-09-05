import React, { useState, useRef } from 'react';
import {
  Languages,
  Upload,
  ArrowRight,
  ArrowLeftRight,
  FileText,
  Image as ImageIcon,
  Download,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  FileCheck,
  Eye,
  Search,
  Maximize2
} from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  TranslationService,
  TranslationResult
} from '../services/translationService';
import { ConversionRocketModal } from './ConversionRocketModal';

export const GoogleTranslateDocsView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceLang, setSourceLang] = useState<string>('auto');
  const [targetLang, setTargetLang] = useState<string>('es'); // Default Spanish
  const [searchTargetLang, setSearchTargetLang] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationProgress, setTranslationProgress] = useState<number>(0);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [previewTab, setPreviewTab] = useState<'translated' | 'original'>('translated');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    l =>
      l.name.toLowerCase().includes(searchTargetLang.toLowerCase()) ||
      l.code.toLowerCase().includes(searchTargetLang.toLowerCase()) ||
      (l.nativeName && l.nativeName.toLowerCase().includes(searchTargetLang.toLowerCase()))
  );

  const handleFile = (file: File) => {
    setSelectedFile(file);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleTranslate = async () => {
    if (!selectedFile) return;

    setIsTranslating(true);
    setTranslationProgress(10);
    setCurrentStage('Initializing Google Translate Engine...');

    try {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
      let translationRes: TranslationResult;

      // 1. Image OCR & Translation
      if (['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'].includes(ext)) {
        translationRes = await TranslationService.translateImage(
          selectedFile,
          targetLang,
          sourceLang,
          (p, s) => {
            setTranslationProgress(p);
            setCurrentStage(s);
          }
        );
      }
      // 2. PDF Translation
      else if (ext === 'pdf') {
        const buffer = await selectedFile.arrayBuffer();
        translationRes = await TranslationService.translatePdf(
          buffer,
          targetLang,
          sourceLang,
          selectedFile.name,
          (p, s) => {
            setTranslationProgress(p);
            setCurrentStage(s);
          }
        );
      }
      // 3. Word DOCX Translation
      else if (ext === 'docx' || ext === 'doc') {
        const buffer = await selectedFile.arrayBuffer();
        translationRes = await TranslationService.translateDocx(
          buffer,
          targetLang,
          sourceLang,
          selectedFile.name,
          (p, s) => {
            setTranslationProgress(p);
            setCurrentStage(s);
          }
        );
      }
      // 4. Text / Markdown Translation
      else {
        setCurrentStage('Reading and chunking document text...');
        const text = await selectedFile.text();
        setTranslationProgress(50);
        setCurrentStage(`Translating text to ${targetLang.toUpperCase()}...`);
        const { translatedText, detectedLanguage } = await TranslationService.translateText(
          text,
          targetLang,
          sourceLang
        );

        setTranslationProgress(85);
        setCurrentStage('Formatting executive document output...');
        const docTitle = selectedFile.name.replace(/\.[^/.]+$/, '');
        const formattedPdfBlob = (await import('../services/documentEngine')).DocumentEngine.textToPdf(
          translatedText,
          `${docTitle} (${targetLang.toUpperCase()})`
        );
        const formattedDocxBlob = await (await import('../services/documentEngine')).DocumentEngine.textToDocx(
          translatedText,
          `${docTitle} (${targetLang.toUpperCase()})`
        );

        translationRes = {
          sourceText: text,
          translatedText,
          sourceLanguage: detectedLanguage || sourceLang,
          targetLanguage: targetLang,
          detectedSourceLanguage: detectedLanguage,
          formattedPdfBlob,
          formattedDocxBlob,
          wordCount: translatedText.trim().split(/\s+/).length
        };
      }

      setTranslationProgress(100);
      setCurrentStage('Launch complete! Assembling translated document...');
      // Allow rocket blast-off launch sequence to complete
      await new Promise(resolve => setTimeout(resolve, 600));
      setResult(translationRes);
    } catch (err: any) {
      alert(`Translation error: ${err.message}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!result?.formattedPdfBlob || !selectedFile) return;
    const url = URL.createObjectURL(result.formattedPdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFile.name.replace(/\.[^/.]+$/, '')}_translated_${targetLang}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDocx = () => {
    if (!result?.formattedDocxBlob || !selectedFile) return;
    const url = URL.createObjectURL(result.formattedDocxBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFile.name.replace(/\.[^/.]+$/, '')}_translated_${targetLang}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = () => {
    if (!result?.translatedText) return;
    navigator.clipboard.writeText(result.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = (type: 'image' | 'pdf' | 'report') => {
    if (type === 'image') {
      // Create canvas image with text
      const canvas = document.createElement('canvas');
      canvas.width = 700;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 700, 400);
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('OFFICIAL INVOICE & RECEIPT', 40, 60);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#334155';
        ctx.fillText('Customer: Global Enterprise Corp', 40, 110);
        ctx.fillText('Invoice Number: INV-2026-8941', 40, 140);
        ctx.fillText('Project: Universal File & Document Conversion Pipeline', 40, 170);
        ctx.fillText('Status: Payment Completed & Verified', 40, 200);
        ctx.fillText('Amount Due: $0.00 USD (Fully Paid)', 40, 230);
        ctx.fillText('Thank you for choosing high-speed automated document solutions.', 40, 280);
      }
      canvas.toBlob(blob => {
        if (blob) {
          const file = new File([blob], 'invoice_receipt_sample.png', { type: 'image/png' });
          handleFile(file);
        }
      });
    } else if (type === 'pdf') {
      const text = `Global Business Agreement\n\nExecutive Summary:\nThis agreement defines the operational parameters of the Universal In-Browser Document Engine.\n\nKey Provisions:\n• Complete data confidentiality with zero server storage\n• Support for real-time document and image translation across 100+ languages\n• Publication-grade formatting in PDF and Microsoft Word DOCX outputs\n\nAuthorization:\nStatus: Legally Verified\nEffective Date: September 2026`;
      const file = new File([text], 'corporate_agreement_spec.txt', { type: 'text/plain' });
      handleFile(file);
    } else {
      const text = `Technical Overview & System Architecture\n\nIntroduction:\nConvertAnyFile offers high-fidelity multi-format transcoding including raster images, vector documents, structured tabular datasets, and mathematical computation pipelines.\n\nSecurity Architecture:\n1. 100% Client-Side In-Browser Execution\n2. Real-Time Optical Character Recognition\n3. Instant Google Translate Integration\n4. Zero Latency Stream Buffering`;
      const file = new File([text], 'system_spec_document.txt', { type: 'text/plain' });
      handleFile(file);
    }
  };

  const currentTargetLangObj = SUPPORTED_LANGUAGES.find(l => l.code === targetLang);

  return (
    <div className="space-y-6 relative">
      {/* Rocket Loading Modal During Document Translation */}
      {isTranslating && (
        <ConversionRocketModal
          progress={translationProgress}
          filename={selectedFile?.name || 'Document'}
          targetFormat={`Translate (${targetLang.toUpperCase()})`}
          stageText={currentStage}
        />
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[11px] font-bold mb-2">
            <Languages className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>Google Translate Suite • 100+ Languages</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Google Translate <span className="text-red-600 dark:text-red-500">Documents & Images</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Translate PDFs, scanned receipts, photos, and Word files into any language with executive formatting preservation.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-semibold mr-1">Sample Docs:</span>
          <button
            type="button"
            onClick={() => loadSample('image')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center space-x-1"
          >
            <ImageIcon className="w-3.5 h-3.5 text-red-500" />
            <span>Invoice Image</span>
          </button>
          <button
            type="button"
            onClick={() => loadSample('pdf')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center space-x-1"
          >
            <FileText className="w-3.5 h-3.5 text-rose-500" />
            <span>Agreement Spec</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Upload & Controls + Live Translation Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dropzone & Language Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Uploader Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-rose-500 to-orange-500"></div>

            {/* In-Flight Rocket Modal while translating */}
            {isTranslating && (
              <ConversionRocketModal
                progress={translationProgress}
                filename={selectedFile?.name || 'Document'}
                targetFormat={`Translate to ${targetLang.toUpperCase()}`}
              />
            )}

            {!selectedFile ? (
              <div
                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-200 rounded-2xl border-2 border-dashed ${
                  dragActive
                    ? 'bg-red-500/10 border-red-500 scale-[1.01]'
                    : 'border-slate-200 dark:border-slate-750 hover:bg-slate-50/70 dark:hover:bg-slate-850/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,.txt,.md,.csv,.json"
                  onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                  className="hidden"
                />
                <div className="w-16 h-16 bg-red-500/10 dark:bg-red-950/50 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 mb-3 border border-red-500/20">
                  <Languages className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Upload Any Document or Image
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs">
                  Drop PDF, JPG, PNG, WEBP, Word DOCX, or text files for instant Google Translate processing
                </p>
                <button
                  type="button"
                  className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-colors text-xs shadow-md shadow-red-600/25 active:scale-95"
                >
                  Choose File
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Selected Badge */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-750">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                      {selectedFile.name.split('.').pop()}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {selectedFile.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Ready to Translate
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); setResult(null); }}
                    className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    Change
                  </button>
                </div>

                {/* Language Pair Selectors */}
                <div className="p-4 rounded-2xl bg-red-500/5 dark:bg-red-950/20 border border-red-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Language Configuration
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      Google Translate Engine Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {/* Source Language */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Source Language:
                      </label>
                      <select
                        value={sourceLang}
                        onChange={e => setSourceLang(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                      >
                        <option value="auto">🌐 Detect Language Automatically</option>
                        {SUPPORTED_LANGUAGES.map(l => (
                          <option key={l.code} value={l.code}>
                            {l.flag} {l.name} {l.nativeName ? `(${l.nativeName})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Target Language */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          Translate To (Target Language):
                        </label>
                        <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">
                          {currentTargetLangObj?.flag} {currentTargetLangObj?.name}
                        </span>
                      </div>

                      {/* Language Search filter input */}
                      <div className="relative mb-1.5">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={searchTargetLang}
                          onChange={e => setSearchTargetLang(e.target.value)}
                          placeholder="Search 100+ languages (e.g. Spanish, Hindi, French)..."
                          className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-red-500"
                        />
                      </div>

                      <select
                        value={targetLang}
                        onChange={e => setTargetLang(e.target.value)}
                        size={4}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-750 rounded-xl p-1 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-red-500 cursor-pointer max-h-32"
                      >
                        {filteredLanguages.map(l => (
                          <option key={l.code} value={l.code} className="p-1.5 hover:bg-red-500/10 rounded">
                            {l.flag} {l.name} {l.nativeName ? `— ${l.nativeName}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Translate Execution Button */}
                <button
                  type="button"
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-white text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg transition-all ${
                    isTranslating
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 active:scale-[0.99] shadow-red-600/30'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Translate to {currentTargetLangObj?.name || targetLang.toUpperCase()}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Features List */}
          <div className="bg-slate-100 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              <span>Formatting Quality Guarantee</span>
            </h4>
            <ul className="text-slate-500 dark:text-slate-400 text-[11px] space-y-1">
              <li>&bull; <strong className="text-slate-700 dark:text-slate-300">No Post-Edits Needed:</strong> Automatically preserves headings, bullet lists, bold field markers, and tables.</li>
              <li>&bull; <strong className="text-slate-700 dark:text-slate-300">Optical Character Recognition:</strong> Reads text directly from photos, screenshots, and scanned PDFs.</li>
              <li>&bull; <strong className="text-slate-700 dark:text-slate-300">Executive Export:</strong> Instant one-click download as a styled PDF or authentic Word (.docx).</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Live Translation Result & Executive Document Preview (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs h-full flex flex-col justify-between">
            {/* Header / Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Document Content & Preview
                </span>
                {result && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    TRANSLATED ({result.wordCount} words)
                  </span>
                )}
              </div>

              {result && (
                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('translated')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      previewTab === 'translated'
                        ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Translated ({currentTargetLangObj?.name || targetLang.toUpperCase()})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('original')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      previewTab === 'original'
                        ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Original Source
                  </button>
                </div>
              )}
            </div>

            {/* Preview Body */}
            <div className="flex-1 min-h-[360px] max-h-[500px] overflow-y-auto rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed select-text">
              {result ? (
                previewTab === 'translated' ? (
                  result.translatedText || 'No translated content.'
                ) : (
                  result.sourceText || 'No source content.'
                )
              ) : selectedFile ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2 py-12">
                  <Languages className="w-10 h-10 text-red-500/40" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    File &ldquo;{selectedFile.name}&rdquo; loaded.
                  </p>
                  <p className="text-xs text-slate-500">
                    Click &ldquo;Translate to {currentTargetLangObj?.name || targetLang.toUpperCase()}&rdquo; to begin.
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2 py-12">
                  <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                  <p className="font-semibold text-slate-600 dark:text-slate-400">No Document Selected</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Upload an image, PDF, or Word file on the left, or pick a sample template above to view live translation.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons / Download */}
            {result && (
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
                </button>

                <div className="flex items-center space-x-2">
                  {result.formattedDocxBlob && (
                    <button
                      type="button"
                      onClick={handleDownloadDocx}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Word (.docx)</span>
                    </button>
                  )}

                  {result.formattedPdfBlob && (
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-red-600/30 transition-all active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Formatted PDF</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
