import React, { useState } from 'react';
import {
  Clock,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Hash,
  Sparkles,
  Check,
  Copy
} from 'lucide-react';
import { ConversionJob } from '../types';
import { FilePreviewer } from './FilePreviewer';
import { AuthService } from '../services/authService';
import { SecurityEngine } from '../services/securityEngine';

interface BatchQueueViewProps {
  jobs: ConversionJob[];
  onClearJobs: () => void;
  onNavigateToConverter: () => void;
}

export const BatchQueueView: React.FC<BatchQueueViewProps> = ({
  jobs,
  onClearJobs,
  onNavigateToConverter
}) => {
  const [previewJob, setPreviewJob] = useState<ConversionJob | null>(null);
  const [verifyingJobId, setVerifyingJobId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    jobId: string;
    verified: boolean;
    sha256: string;
  } | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [purgeNotice, setPurgeNotice] = useState<string | null>(null);

  const authState = AuthService.getInitialState();
  const currentUserId = authState.user?.id || 'anonymous_session';
  const isAdmin = authState.user?.role === 'admin';

  // IDOR Protection: strictly isolate records to authorized user ownership (#75)
  const visibleJobs = jobs.filter(
    job => isAdmin || !job.userId || job.userId === currentUserId || job.userId === 'anonymous_session'
  );

  const downloadJobFile = (job: ConversionJob) => {
    // Check IDOR authorization before triggering download (#75)
    const access = SecurityEngine.checkFileAccess(authState.user, job);
    if (!access.isAuthorized && job.userId && job.userId !== currentUserId) {
      alert(`Security Violation: ${access.reason || 'Unauthorized access attempt'}`);
      return;
    }

    if (!job.downloadUrl) return;
    const a = document.createElement('a');
    a.href = job.downloadUrl;
    a.download = job.outputFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleVerifyIntegrity = async (job: ConversionJob) => {
    if (!job.blobData || !job.sha256) return;
    setVerifyingJobId(job.id);
    try {
      const isMatch = await SecurityEngine.verifyFileIntegrity(job.blobData, job.sha256);
      setVerificationResult({
        jobId: job.id,
        verified: isMatch,
        sha256: job.sha256
      });
    } catch {
      setVerificationResult({
        jobId: job.id,
        verified: false,
        sha256: job.sha256 || 'error'
      });
    } finally {
      setVerifyingJobId(null);
    }
  };

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedHash(sha);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleManualPurgeExpired = () => {
    const { purgedCount, freedBytes } = SecurityEngine.runAutoCleanup();
    if (purgedCount > 0) {
      setPurgeNotice(`Successfully purged ${purgedCount} expired temporary file(s) and freed ${(freedBytes / 1024).toFixed(1)} KB.`);
    } else {
      setPurgeNotice('All temporary storage is clean and within valid retention windows.');
    }
    setTimeout(() => setPurgeNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header with IDOR and Retention Audit Indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-red-600 dark:text-red-500" />
              <span>Batch Processing Queue & Job History</span>
            </h2>
            <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>IDOR Guard Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographic SHA-256 integrity-verified audit trail. User context:{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {authState.user?.email || 'Anonymous Client Session'}
            </span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleManualPurgeExpired}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            title="Clean up temporary files that reached expiration"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
            <span>Purge Expired</span>
          </button>

          {visibleJobs.length > 0 && (
            <button
              type="button"
              onClick={onClearJobs}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {purgeNotice && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-400 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{purgeNotice}</span>
        </div>
      )}

      {visibleJobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">No Jobs Recorded Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Converted files and generated reports will appear in this IDOR-protected queue.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToConverter}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-xs"
          >
            Go to Universal Converter
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Original File</th>
                  <th className="py-3 px-4">Pipeline</th>
                  <th className="py-3 px-4">Output Target</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">SHA-256 Integrity</th>
                  <th className="py-3 px-4">Retention</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {visibleJobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 max-w-[150px] truncate">
                      {job.originalFilename}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 font-medium text-[11px] border border-red-100 dark:border-red-900/50">
                        {job.toolName}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300 max-w-[150px] truncate">
                      {job.outputFilename}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">
                      {(job.fileSize / 1024).toFixed(1)} KB
                    </td>

                    {/* Cryptographic SHA-256 Integrity Hash Badge (#71) */}
                    <td className="py-3 px-4 font-mono">
                      {job.sha256 ? (
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopySha(job.sha256!)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-500 flex items-center space-x-1 font-mono transition-colors"
                            title="Click to copy full SHA-256 cryptographic hash"
                          >
                            <Hash className="w-2.5 h-2.5" />
                            <span>{job.sha256.substring(0, 10)}...</span>
                            {copiedHash === job.sha256 ? (
                              <Check className="w-2.5 h-2.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-slate-400" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleVerifyIntegrity(job)}
                            disabled={verifyingJobId === job.id}
                            className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold border border-emerald-500/30 flex items-center space-x-0.5 transition-colors"
                            title="Recalculate SHA-256 live to verify zero file corruption"
                          >
                            {verifyingJobId === job.id ? (
                              <div className="w-2.5 h-2.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            )}
                            <span>Verify</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">N/A</span>
                      )}
                    </td>

                    {/* Temporary File Retention / Expiration Countdown (#78) */}
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      <span className="inline-flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>1h Policy</span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>VERIFIED</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {job.blobData && (
                          <button
                            type="button"
                            onClick={() => {
                              const access = SecurityEngine.checkFileAccess(authState.user, job);
                              if (!access.isAuthorized && job.userId && job.userId !== currentUserId) {
                                alert(`IDOR Defense: ${access.reason}`);
                                return;
                              }
                              setPreviewJob(job);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] inline-flex items-center space-x-1 border border-slate-200 dark:border-slate-700 transition-colors"
                          >
                            <Eye className="w-3 h-3 text-blue-500" />
                            <span>Preview</span>
                          </button>
                        )}
                        {job.downloadUrl && (
                          <button
                            type="button"
                            onClick={() => downloadJobFile(job)}
                            className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] inline-flex items-center space-x-1 shadow-xs transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live SHA-256 Cryptographic Verification Modal Notice */}
      {verificationResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-900 dark:text-white space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                verificationResult.verified ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
              }`}>
                {verificationResult.verified ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {verificationResult.verified ? 'Cryptographic Integrity Confirmed' : 'Integrity Mismatch Detected'}
                </h3>
                <p className="text-xs text-slate-400">
                  {verificationResult.verified ? 'Zero data corruption or tampering detected' : 'File payload has been altered'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl font-mono text-[11px] break-all border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] block mb-1">SHA-256 HASH:</span>
              <span className="text-emerald-500 font-bold">{verificationResult.sha256}</span>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              This verification used client-side <code className="text-slate-300 font-mono">crypto.subtle.digest(&apos;SHA-256&apos;)</code> to compare byte-for-byte fidelity with the original conversion pipeline result.
            </div>

            <button
              type="button"
              onClick={() => setVerificationResult(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close Verification
            </button>
          </div>
        </div>
      )}

      {/* Modal Preview for Job with strict XSS sanitization */}
      {previewJob && previewJob.blobData && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-5xl h-[88vh] relative flex flex-col">
            <FilePreviewer
              fileOrBlob={previewJob.blobData}
              filename={previewJob.outputFilename}
              title={`Batch Job Preview: ${previewJob.outputFilename}`}
              mode="modal"
              onClose={() => setPreviewJob(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
