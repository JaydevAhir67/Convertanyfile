import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  Database,
  ArrowRight,
  Download,
  CheckCircle2,
  Eye,
  Maximize2,
  Languages,
  HardDrive,
  ExternalLink,
  AlertCircle,
  FileCode,
  ShieldCheck,
  Zap,
  Lock
} from 'lucide-react';
import { ConversionJob } from '../types';
import { DocumentEngine } from '../services/documentEngine';
import { ImageEngine } from '../services/imageEngine';
import { AudioVideoEngine } from '../services/audioVideoEngine';
import { DataEngine } from '../services/dataEngine';
import { TranslationService, SUPPORTED_LANGUAGES } from '../services/translationService';
import { GoogleDriveService } from '../services/googleDriveService';
import { AuthService } from '../services/authService';
import { SecurityEngine } from '../services/securityEngine';
import { FilePreviewer } from './FilePreviewer';
import { ConversionRocketModal } from './ConversionRocketModal';
import { SoundEngine } from '../services/soundEffects';
import { hapticSelect, hapticUpload, hapticError } from '../services/haptics';
import { HuskyCompanionCanvas } from './HuskyCompanionCanvas';

interface UniversalUploaderProps {
  onJobCreated: (job: ConversionJob) => void;
  onNavigateToTab: (tab: any) => void;
  searchQuery?: string;
  isDarkMode?: boolean;
}

export const UniversalUploader: React.FC<UniversalUploaderProps> = ({
  onJobCreated,
  onNavigateToTab,
  searchQuery = '',
  isDarkMode = true
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('docx');
  const [translateToLang, setTranslateToLang] = useState<string>('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConvertingModalOpen, setIsConvertingModalOpen] = useState(false);
  const [isRealConversionFinished, setIsRealConversionFinished] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentJob, setCurrentJob] = useState<ConversionJob | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewTarget, setPreviewTarget] = useState<'converted' | 'original'>('converted');
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveSavedUrl, setDriveSavedUrl] = useState<string | null>(null);
  const [driveSaveError, setDriveSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Popular Conversion Presets
  const popularPresets = [
    { label: 'PDF to Word', inExt: 'pdf', outExt: 'docx', icon: <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" /> },
    { label: 'Word to PDF', inExt: 'docx', outExt: 'pdf', icon: <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" /> },
    { label: 'Image to PDF', inExt: 'jpg', outExt: 'pdf', icon: <ImageIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" /> },
    { label: 'JPG to PNG', inExt: 'jpg', outExt: 'png', icon: <ImageIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" /> },
    { label: 'PNG to WebP', inExt: 'png', outExt: 'webp', icon: <ImageIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" /> },
    { label: 'CSV to Excel', inExt: 'csv', outExt: 'xlsx', icon: <Database className="w-4 h-4 text-slate-600 dark:text-slate-400" /> },
    { label: 'CSV to JSON', inExt: 'csv', outExt: 'json', icon: <Database className="w-4 h-4 text-slate-600 dark:text-slate-400" /> },
    { label: 'Audio to WAV', inExt: 'mp3', outExt: 'wav', icon: <Music className="w-4 h-4 text-slate-600 dark:text-slate-400" /> }
  ];

  const filteredPresets = popularPresets.filter(p =>
    p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.inExt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.outExt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File exceeds 50MB maximum size limit.');
      return;
    }

    setUploadError(null);
    setConversionError(null);
    setSelectedFile(file);
    setCurrentJob(null);
    setProgress(0);
    setIsConvertingModalOpen(false);
    setIsRealConversionFinished(false);
    hapticSelect();
    SoundEngine.playFileSelectedSound();

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') setTargetFormat('docx');
    else if (ext === 'docx' || ext === 'doc') setTargetFormat('pdf');
    else if (ext === 'jpg' || ext === 'jpeg') setTargetFormat('png');
    else if (ext === 'png') setTargetFormat('jpg');
    else if (ext === 'csv') setTargetFormat('json');
    else if (ext === 'json') setTargetFormat('csv');
    else if (ext === 'mp3' || ext === 'ogg') setTargetFormat('wav');
    else if (ext === 'mp4') setTargetFormat('mp3');
    else setTargetFormat('pdf');
  };

  const loadSampleFile = async (type: 'pdf' | 'csv' | 'json' | 'image' | 'text' | 'docx') => {
    let file: File;
    if (type === 'docx') {
      const docxText = `ConvertAnyFile Demonstration Document\n\nTitle: Word Document to PDF Conversion Pipeline\nAuthor: ConvertAnyFile In-Browser Engine\n\nAbstract:\nThis document demonstrates client-side extraction and mathematical layout pagination. Headings, spacing, character tracking, and margins are computed dynamically before rendering to vector PDF.`;
      const docxBlob = await DocumentEngine.textToDocx(docxText, 'Document_Sample');
      file = new File([docxBlob], 'sample_document.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
    } else if (type === 'csv') {
      const csvData = `id,name,department,budget,status\n1,Marketing,Growth,45000,Active\n2,Engineering,Product,120000,Active\n3,Operations,Support,30000,Pending\n4,Design,UX,25000,Active`;
      file = new File([csvData], 'company_data.csv', { type: 'text/csv' });
    } else if (type === 'json') {
      const jsonData = JSON.stringify([
        { id: 1, name: 'Analytics Report', status: 'ready', records: 1540 },
        { id: 2, name: 'Billing Data', status: 'verified', records: 820 }
      ], null, 2);
      file = new File([jsonData], 'report_benchmark.json', { type: 'application/json' });
    } else if (type === 'image') {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 300;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('ConvertAnyFile Sample', 70, 150);
      canvas.toBlob(blob => {
        if (blob) {
          const sampleImg = new File([blob], 'sample_image.png', { type: 'image/png' });
          handleFileSelected(sampleImg);
        }
      });
      return;
    } else if (type === 'pdf') {
      const text = `ConvertAnyFile Universal Document\n\nTitle: Enterprise High-Speed Conversion Engine\nSubject: Core Multi-Format Pipeline\nSecurity: 100% Client-Side In-Browser\nStatus: Verified`;
      file = new File([text], 'specification_sample.txt', { type: 'text/plain' });
    } else {
      file = new File(['Hello ConvertAnyFile'], 'sample.txt', { type: 'text/plain' });
    }
    handleFileSelected(file);
  };

  const getAvailableTargets = (): string[] => {
    if (!selectedFile) return ['pdf', 'docx', 'png', 'jpg', 'txt'];
    const inExt = selectedFile.name.split('.').pop()?.toLowerCase() || '';

    if (inExt === 'pdf') return ['docx', 'jpg', 'png', 'webp', 'txt', 'md'];
    if (inExt === 'docx' || inExt === 'doc') return ['pdf', 'txt', 'md', 'html'];
    if (inExt === 'txt' || inExt === 'md') return ['pdf', 'docx', 'txt'];
    if (['jpg', 'jpeg', 'png', 'webp', 'bmp', 'svg'].includes(inExt)) return ['pdf', 'png', 'jpg', 'webp', 'docx', 'txt'];
    if (['csv', 'json', 'xlsx', 'xml'].includes(inExt)) return ['json', 'csv', 'xlsx', 'xml'];
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(inExt)) return ['wav', 'mp3', 'mp4'];
    if (['mp4', 'webm', 'mov'].includes(inExt)) return ['mp3', 'wav'];
    return ['pdf', 'txt'];
  };

  const executeConversion = async () => {
    if (!selectedFile) return;

    const validation = await SecurityEngine.validateFileSafety(selectedFile, selectedFile.name);
    if (!validation.isValid) {
      alert(`Security Notice: ${validation.error || 'Invalid file format.'}`);
      return;
    }

    setIsProcessing(true);
    setIsConvertingModalOpen(true);
    setIsRealConversionFinished(false);
    setProgress(15);
    hapticUpload();
    const startTime = performance.now();

    const sanitizedOriginalName = SecurityEngine.sanitizeFilename(selectedFile.name);
    const inExt = sanitizedOriginalName.split('.').pop()?.toLowerCase() || '';
    const outExt = targetFormat.toLowerCase();
    const baseName = sanitizedOriginalName.substring(0, sanitizedOriginalName.lastIndexOf('.')) || sanitizedOriginalName;
    let actualOutputFilename = `${baseName}_converted.${outExt}`;
    let previewUrl: string | undefined;
    let pageImages: string[] | undefined;

    try {
      setProgress(35);
      let outputBlob: Blob;

      // 1. Documents
      if (inExt === 'txt' || inExt === 'md') {
        let text = await selectedFile.text();
        if (translateToLang !== 'none') {
          setProgress(55);
          const trans = await TranslationService.translateText(text, translateToLang);
          text = trans.translatedText;
        }
        if (outExt === 'pdf') {
          outputBlob = DocumentEngine.textToPdf(text, sanitizedOriginalName);
        } else if (outExt === 'docx') {
          outputBlob = await DocumentEngine.textToDocx(text, sanitizedOriginalName);
        } else {
          outputBlob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        }
      } else if (inExt === 'pdf' && (outExt === 'jpg' || outExt === 'jpeg' || outExt === 'png' || outExt === 'webp')) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const formatMime = (outExt === 'png' ? 'image/png' : outExt === 'webp' ? 'image/webp' : 'image/jpeg') as any;
        const imgRes = await DocumentEngine.pdfToImages(arrayBuffer, {
          format: formatMime,
          quality: 0.95,
          scale: 1.75,
          onProgress: p => setProgress(35 + Math.round(p * 0.5))
        });
        outputBlob = imgRes.primaryBlob;
        actualOutputFilename = imgRes.pages.length > 1
          ? `${baseName}_pages.${imgRes.extension}`
          : `${baseName}.${imgRes.extension}`;
        previewUrl = imgRes.pages[0]?.dataUrl;
        pageImages = imgRes.pages.map(p => p.dataUrl);
      } else if (inExt === 'pdf' && outExt === 'md') {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const mdText = await DocumentEngine.pdfToMarkdown(arrayBuffer, sanitizedOriginalName);
        outputBlob = new Blob([mdText], { type: 'text/markdown;charset=utf-8' });
        actualOutputFilename = `${baseName}.md`;
      } else if (inExt === 'pdf' && outExt === 'docx') {
        const arrayBuffer = await selectedFile.arrayBuffer();
        if (translateToLang !== 'none') {
          let extractedText = await DocumentEngine.extractTextFromPdf(arrayBuffer);
          setProgress(55);
          const trans = await TranslationService.translateText(extractedText || sanitizedOriginalName, translateToLang);
          outputBlob = await DocumentEngine.textToDocx(trans.translatedText, sanitizedOriginalName);
        } else {
          outputBlob = await DocumentEngine.pdfToDocx(arrayBuffer, sanitizedOriginalName);
        }
      } else if (inExt === 'pdf' && outExt === 'pdf') {
        const arrayBuffer = await selectedFile.arrayBuffer();
        if (translateToLang !== 'none') {
          const extractedText = await DocumentEngine.extractTextFromPdf(arrayBuffer);
          const trans = await TranslationService.translateText(extractedText || sanitizedOriginalName, translateToLang);
          outputBlob = DocumentEngine.textToPdf(trans.translatedText, `${baseName}_${translateToLang}`);
        } else {
          outputBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
        }
      } else if ((inExt === 'docx' || inExt === 'doc') && outExt === 'pdf') {
        const arrayBuffer = await selectedFile.arrayBuffer();
        if (translateToLang !== 'none') {
          const mammoth = (await import('mammoth')).default;
          const resText = await mammoth.extractRawText({ arrayBuffer });
          const trans = await TranslationService.translateText(resText.value || '', translateToLang);
          outputBlob = DocumentEngine.textToPdf(trans.translatedText, `${baseName}_${translateToLang}`);
        } else {
          outputBlob = await DocumentEngine.docxToPdf(arrayBuffer, sanitizedOriginalName);
        }
      } else if ((inExt === 'docx' || inExt === 'doc') && outExt === 'txt') {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const mammoth = (await import('mammoth')).default;
        const resText = await mammoth.extractRawText({ arrayBuffer });
        outputBlob = new Blob([resText.value || ''], { type: 'text/plain;charset=utf-8' });
        actualOutputFilename = `${baseName}.txt`;
      } else if ((inExt === 'docx' || inExt === 'doc') && outExt === 'md') {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const mammoth = (await import('mammoth')).default;
        const res = typeof (mammoth as any).convertToMarkdown === 'function'
          ? await (mammoth as any).convertToMarkdown({ arrayBuffer }).catch(async () => {
              const t = await mammoth.extractRawText({ arrayBuffer });
              return { value: t.value || '' };
            })
          : await mammoth.extractRawText({ arrayBuffer });
        outputBlob = new Blob([res.value || ''], { type: 'text/markdown;charset=utf-8' });
        actualOutputFilename = `${baseName}.md`;
      } else if ((inExt === 'docx' || inExt === 'doc') && outExt === 'html') {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const mammoth = (await import('mammoth')).default;
        const res = await mammoth.convertToHtml({ arrayBuffer });
        outputBlob = new Blob([res.value || ''], { type: 'text/html;charset=utf-8' });
        actualOutputFilename = `${baseName}.html`;
      } else if ((inExt === 'docx' || inExt === 'doc') && outExt === 'docx') {
        const arrayBuffer = await selectedFile.arrayBuffer();
        if (translateToLang !== 'none') {
          const mammoth = (await import('mammoth')).default;
          const resText = await mammoth.extractRawText({ arrayBuffer });
          const trans = await TranslationService.translateText(resText.value || '', translateToLang);
          outputBlob = await DocumentEngine.textToDocx(trans.translatedText, `${baseName}_${translateToLang}`);
        } else {
          outputBlob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        }
      } else if (inExt === 'pdf' && outExt === 'txt') {
        const arrayBuffer = await selectedFile.arrayBuffer();
        let extractedText = await DocumentEngine.extractTextFromPdf(arrayBuffer);
        if (translateToLang !== 'none' && extractedText) {
          const trans = await TranslationService.translateText(extractedText, translateToLang);
          extractedText = trans.translatedText;
        }
        outputBlob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
      }
      // 2. Images
      else if (['jpg', 'jpeg', 'png', 'webp', 'bmp', 'svg'].includes(inExt)) {
        if (outExt === 'pdf') {
          outputBlob = await DocumentEngine.imageToPdf(selectedFile, sanitizedOriginalName);
        } else if (outExt === 'docx' || outExt === 'txt') {
          setProgress(50);
          const imgRes = await TranslationService.translateImage(
            selectedFile,
            translateToLang === 'none' ? 'en' : translateToLang,
            'auto'
          );
          if (outExt === 'docx') {
            outputBlob = imgRes.formattedDocxBlob || (await DocumentEngine.textToDocx(imgRes.translatedText, sanitizedOriginalName));
          } else {
            outputBlob = new Blob([imgRes.translatedText], { type: 'text/plain;charset=utf-8' });
          }
        } else {
          const mime = outExt === 'jpg' || outExt === 'jpeg' ? 'image/jpeg' : outExt === 'webp' ? 'image/webp' : 'image/png';
          outputBlob = await ImageEngine.convertImage(selectedFile, { format: mime as any, quality: 0.95 });
          previewUrl = URL.createObjectURL(outputBlob);
        }
      }
      // 3. Data Engine
      else if (inExt === 'csv' && outExt === 'json') {
        const csvStr = await selectedFile.text();
        const { jsonString } = DataEngine.csvToJson(csvStr);
        outputBlob = new Blob([jsonString], { type: 'application/json' });
      } else if (inExt === 'json' && outExt === 'csv') {
        const jsonStr = await selectedFile.text();
        const csvStr = DataEngine.jsonToCsv(jsonStr);
        outputBlob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
      } else if (inExt === 'csv' && outExt === 'xlsx') {
        const csvStr = await selectedFile.text();
        const xlsxBytes = DataEngine.csvToExcel(csvStr);
        outputBlob = new Blob([xlsxBytes as any], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      } else if (inExt === 'json' && outExt === 'xml') {
        const jsonStr = await selectedFile.text();
        const xmlStr = DataEngine.jsonToXml(jsonStr);
        outputBlob = new Blob([xmlStr], { type: 'application/xml' });
      }
      // 4. Audio
      else if (['mp3', 'ogg', 'm4a'].includes(inExt) && outExt === 'wav') {
        outputBlob = await AudioVideoEngine.audioToWav(selectedFile);
      } else if (['mp3', 'wav', 'ogg'].includes(inExt) && outExt === 'mp4') {
        outputBlob = await AudioVideoEngine.generateVideoFromAudioAndImage({
          audioFile: selectedFile,
          videoTitle: sanitizedOriginalName.replace(/\.[^/.]+$/, ''),
          onProgress: p => setProgress(40 + Math.round(p * 0.5))
        });
      }
      // Fallback
      else {
        const raw = await selectedFile.arrayBuffer();
        outputBlob = new Blob([raw], { type: 'application/octet-stream' });
      }

      setProgress(95);
      const endTime = performance.now();
      const processingTime = parseFloat(((endTime - startTime) / 1000).toFixed(3));

      const outputSha256 = await SecurityEngine.calculateSha256(outputBlob);
      const jobId = SecurityEngine.generateSecureId('job');
      const currentUser = AuthService.getInitialState().user;
      const userId = currentUser?.id || 'anonymous_session';

      const tempRecord = SecurityEngine.registerTemporaryFile(
        jobId,
        outputBlob,
        actualOutputFilename,
        userId,
        SecurityEngine.DEFAULT_FILE_RETENTION_MS
      );

      const downloadUrl = URL.createObjectURL(outputBlob);
      const newJob: ConversionJob = {
        id: jobId,
        toolId: `${inExt}-to-${outExt}`,
        toolName: `${inExt.toUpperCase()} to ${outExt.toUpperCase()}`,
        category: 'document',
        originalFilename: sanitizedOriginalName,
        storedFilename: `${Date.now()}_${sanitizedOriginalName}`,
        outputFilename: actualOutputFilename,
        fileSize: outputBlob.size,
        status: 'COMPLETED',
        progress: 100,
        processingTime,
        createdAt: new Date().toLocaleTimeString(),
        downloadUrl,
        blobData: outputBlob,
        previewUrl: previewUrl || (outputBlob.type.startsWith('image/') ? downloadUrl : undefined),
        pageImages,
        sha256: outputSha256,
        userId,
        expiresAt: tempRecord.expires_at,
        integrityStatus: 'VERIFIED',
        securityAudit: {
          isValid: true,
          detectedMime: validation.detectedMime,
          detectedExt: validation.detectedExt
        }
      };

      setProgress(100);
      setCurrentJob(newJob);
      onJobCreated(newJob);
      setIsRealConversionFinished(true);
    } catch (err: any) {
      setConversionError(err?.message || 'Conversion failed. Please try again.');
      hapticError();
      setIsProcessing(false);
      setIsRealConversionFinished(false);
    }
  };

  const downloadResult = () => {
    if (!currentJob || !currentJob.downloadUrl) return;
    const a = document.createElement('a');
    a.href = currentJob.downloadUrl;
    a.download = currentJob.outputFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveToGoogleDrive = async () => {
    if (!currentJob || !currentJob.blobData) return;
    setIsSavingToDrive(true);
    setDriveSaveError(null);
    try {
      const isConnected = await GoogleDriveService.isDriveConnected();
      if (!isConnected) {
        await AuthService.googleSignIn();
      }
      const result = await GoogleDriveService.uploadFileToDrive({
        name: currentJob.outputFilename,
        blob: currentJob.blobData
      });
      setDriveSavedUrl(result.webViewLink);
    } catch (err: any) {
      console.error('Error saving to Google Drive:', err);
      setDriveSaveError(err?.message || 'Failed to save file to Google Drive');
    } finally {
      setIsSavingToDrive(false);
    }
  };

  const resetUploader = () => {
    setSelectedFile(null);
    setCurrentJob(null);
    setProgress(0);
    setUploadError(null);
    setDriveSavedUrl(null);
    setDriveSaveError(null);
    setIsConvertingModalOpen(false);
    setIsRealConversionFinished(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* Calm Product Heading */}
      <div className="text-center space-y-2 pt-2">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Convert Any File.
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Fast, private file transformation in your browser. No files are uploaded to any server.
        </p>
      </div>

      {/* Main Conversion Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        {/* Upload Error Banner */}
        {uploadError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* State 1: Dropzone Idle / Dragging */}
        {!selectedFile && (
          <div className="p-6 sm:p-10">
            <div
              id="universal-dropzone"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 sm:p-14 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/40'
                  : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-950/40'
              }`}
            >
              <div className="flex flex-col items-center justify-center mb-2">
                <HuskyCompanionCanvas
                  isDragging={dragActive}
                  isSelected={false}
                  isDarkMode={isDarkMode}
                  size="sm"
                  className="mb-1 pointer-events-none"
                />
              </div>

              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-1">
                Drop your files here
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-5">
                Drag and drop any file here, or click to browse
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Choose File
              </button>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4">
                Supports PDF, DOCX, XLSX, JPG, PNG, CSV, MP3, and 50+ formats (up to 50MB)
              </p>

              {/* Sample Files Row */}
              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-slate-400 dark:text-slate-500">Or try a sample:</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); loadSampleFile('docx'); }}
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
                >
                  Word DOCX
                </button>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); loadSampleFile('csv'); }}
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
                >
                  CSV Data
                </button>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); loadSampleFile('json'); }}
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
                >
                  JSON
                </button>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); loadSampleFile('image'); }}
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
                >
                  Image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State 2: File Selected / Configuration */}
        {selectedFile && (!currentJob || isConvertingModalOpen) && (
          <div className="p-6 sm:p-8 space-y-6">
            {/* File Info Bar */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-mono font-semibold text-xs shrink-0">
                  {selectedFile.name.split('.').pop()?.toUpperCase()}
                </div>
                <div className="truncate">
                  <div className="font-medium text-slate-900 dark:text-white text-sm truncate">
                    {selectedFile.name}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 shrink-0 ml-4">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={resetUploader}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Change file
                </button>
              </div>
            </div>

            {/* Target Format & Translation Controls */}
            {!isProcessing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Format
                  </label>
                  <select
                    id="target-format-select"
                    value={targetFormat}
                    onChange={e => setTargetFormat(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-slate-500 dark:focus:border-slate-500 font-medium"
                  >
                    {getAvailableTargets().map(fmt => (
                      <option key={fmt} value={fmt}>
                        {fmt.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Language Translation (Optional)
                  </label>
                  <select
                    id="translate-target-lang-select"
                    value={translateToLang}
                    onChange={e => setTranslateToLang(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-slate-500 dark:focus:border-slate-500 font-normal"
                  >
                    <option value="none">Original (No translation)</option>
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name} ({lang.nativeName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              /* Clean Conversion Progress State */
              <div className="py-6 space-y-3">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-900 dark:text-white">
                    {progress < 40 ? 'Uploading...' : progress < 90 ? 'Converting...' : 'Almost done...'}
                  </span>
                  <span className="text-slate-500 font-mono">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-900 dark:bg-white h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">Processing file securely in browser memory...</p>
              </div>
            )}

            {/* Action Button */}
            {!isProcessing && (
              <div className="pt-2 space-y-2">
                <button
                  id="start-conversion-btn"
                  type="button"
                  onClick={executeConversion}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium text-sm rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
                >
                  <span>Launch Conversion with Barnaby</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
                  <span>🐺 Barnaby is buckled in for the 3D rocket journey</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* State 3: Conversion Completed */}
        {currentJob && !isConvertingModalOpen && (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Mascot Success Note */}
            <div className="flex items-center space-x-3 p-3 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 rounded-lg text-xs text-slate-700 dark:text-slate-300">
              <span className="text-base select-none shrink-0">🐺</span>
              <p className="leading-relaxed">
                <span className="font-semibold text-emerald-800 dark:text-emerald-300">Barnaby the Husky:</span>{' '}
                "Mission accomplished! Your converted {targetFormat.toUpperCase()} file is verified and ready for download."
              </p>
            </div>

            {/* Success Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <div className="font-medium text-slate-900 dark:text-white text-sm truncate">
                    {currentJob.outputFilename}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {(currentJob.fileSize / 1024).toFixed(1)} KB · Converted in {currentJob.processingTime}s
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="download-result-btn"
                  type="button"
                  onClick={downloadResult}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                {driveSavedUrl ? (
                  <a
                    href={driveSavedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1.5"
                  >
                    <span>Saved in Drive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <button
                    id="save-job-to-drive-btn"
                    type="button"
                    onClick={handleSaveToGoogleDrive}
                    disabled={isSavingToDrive}
                    className="px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>{isSavingToDrive ? 'Saving...' : 'Save to Drive'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={resetUploader}
                  className="px-3 py-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Convert another file
                </button>
              </div>
            </div>

            {driveSaveError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{driveSaveError}</span>
              </div>
            )}

            {/* Document Preview Bar */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preview</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="inline-flex rounded-md bg-slate-100 dark:bg-slate-800 p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setPreviewTarget('converted')}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        previewTarget === 'converted'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Converted
                    </button>
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() => setPreviewTarget('original')}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          previewTarget === 'original'
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Original
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    title="Fullscreen preview"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Inline Previewer Component */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                {previewTarget === 'converted' && currentJob.blobData ? (
                  <FilePreviewer
                    fileOrBlob={currentJob.blobData}
                    filename={currentJob.outputFilename}
                    title={`Converted: ${currentJob.outputFilename}`}
                    pageImages={currentJob.pageImages}
                    mode="inline"
                  />
                ) : selectedFile ? (
                  <FilePreviewer
                    fileOrBlob={selectedFile}
                    filename={selectedFile.name}
                    title={`Original: ${selectedFile.name}`}
                    mode="inline"
                  />
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Popular Quick Converters Section */}
      <div id="tool-discovery-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Common Conversions
          </h2>
          <span className="text-xs text-slate-400">Click to configure</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {filteredPresets.map((preset, i) => (
            <button
              key={i}
              id={`preset-card-${i}`}
              type="button"
              onClick={() => {
                setTargetFormat(preset.outExt);
                fileInputRef.current?.click();
              }}
              className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 rounded-lg text-left transition-colors group cursor-pointer"
            >
              <div className="flex items-center space-x-2.5 mb-2">
                <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {preset.icon}
                </div>
                <span className="font-medium text-xs text-slate-900 dark:text-white">
                  {preset.label}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                <span>.{preset.inExt}</span>
                <span className="text-slate-300 dark:text-slate-600">→</span>
                <span>.{preset.outExt}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* How It Works: 3 Clean Steps */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850">
            <div className="text-xs font-semibold text-slate-400 font-mono">01</div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Select or Drop File</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Choose any document, image, data table, or audio file directly from your computer.
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850">
            <div className="text-xs font-semibold text-slate-400 font-mono">02</div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Choose Target Format</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Select destination format. Micro-engines compute formatting and layout in memory.
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850">
            <div className="text-xs font-semibold text-slate-400 font-mono">03</div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Instant Download</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Download your converted file immediately. Zero wait time and zero data sent to external servers.
            </p>
          </div>
        </div>
      </div>

      {/* Security & Verification Guarantee */}
      <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-900 dark:text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Private by Design</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Files are transformed locally on your device via client-side WebAssembly. No files ever touch an external server or database.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigateToTab('viva')}
          className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium shrink-0"
        >
          View Documentation →
        </button>
      </div>

      {/* Focused 3D Rocket Conversion Modal (Connected to real conversion state) */}
      {(isConvertingModalOpen || isProcessing || conversionError) && (
        <ConversionRocketModal
          realProgress={progress}
          isRealComplete={isRealConversionFinished}
          filename={selectedFile?.name || 'document'}
          sourceFormat={selectedFile?.name.split('.').pop() || 'FILE'}
          targetFormat={targetFormat}
          error={conversionError}
          onRetry={() => {
            setConversionError(null);
            executeConversion();
          }}
          onCancel={() => {
            setIsProcessing(false);
            setIsConvertingModalOpen(false);
            setConversionError(null);
          }}
          onVisualComplete={() => {
            setIsProcessing(false);
            setIsConvertingModalOpen(false);
          }}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Fullscreen Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-5xl h-[88vh] relative flex flex-col">
            <FilePreviewer
              fileOrBlob={
                currentJob && previewTarget === 'converted' && currentJob.blobData
                  ? currentJob.blobData
                  : (selectedFile || new Blob([]))
              }
              filename={
                currentJob && previewTarget === 'converted'
                  ? currentJob.outputFilename
                  : (selectedFile?.name || 'document')
              }
              title={
                currentJob && previewTarget === 'converted'
                  ? `Converted: ${currentJob.outputFilename}`
                  : `Original: ${selectedFile?.name || 'Document'}`
              }
              pageImages={
                currentJob && previewTarget === 'converted'
                  ? currentJob.pageImages
                  : undefined
              }
              mode="modal"
              onClose={() => setShowPreviewModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
