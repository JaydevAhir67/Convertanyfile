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
  Lock
} from 'lucide-react';
import { ConversionJob } from '../types';
import { FilePreviewer } from './FilePreviewer';
import { AuthService } from '../services/authService';

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
  const authState = AuthService.getInitialState();

  const downloadJobFile = (job: ConversionJob) => {
    if (!job.downloadUrl) return;
    const a = document.createElement('a');
    a.href = job.downloadUrl;
    a.download = job.outputFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-red-600 dark:text-red-500" />
              <span>Batch Processing Queue & Job History</span>
            </h2>
            <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Protected Route /history</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Encrypted audit trail of client-side file transformations. Authenticated as{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {authState.user?.email || 'Authenticated User'}
            </span>
          </p>
        </div>

        {jobs.length > 0 && (
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

      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">No Jobs Recorded Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Converted files and generated reports will appear in this persistent queue.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToConverter}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs"
          >
            Go to Universal Converter
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Original File</th>
                  <th className="py-3 px-4">Tool Pipeline</th>
                  <th className="py-3 px-4">Output Target</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Processing Time</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800 max-w-[160px] truncate">
                      {job.originalFilename}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-medium text-[11px] border border-sky-100">
                        {job.toolName}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 max-w-[160px] truncate">
                      {job.outputFilename}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {(job.fileSize / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {job.processingTime}s
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {job.createdAt}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>DONE</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {job.blobData && (
                          <button
                            type="button"
                            onClick={() => setPreviewJob(job)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] inline-flex items-center space-x-1 border border-slate-200 transition-colors"
                          >
                            <Eye className="w-3 h-3 text-blue-600" />
                            <span>Preview</span>
                          </button>
                        )}
                        {job.downloadUrl && (
                          <button
                            type="button"
                            onClick={() => downloadJobFile(job)}
                            className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] inline-flex items-center space-x-1 shadow-xs transition-colors"
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

      {/* Modal Preview for Job */}
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
