import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderUp,
  HardDrive,
  ExternalLink,
  Trash2,
  Download,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Lock,
  Sparkles,
  Cloud
} from 'lucide-react';
import { GoogleDriveService } from '../services/googleDriveService';
import { AuthService } from '../services/authService';
import { GoogleSignInButton } from './GoogleSignInButton';
import { GoogleDriveFile, UserProfile } from '../types';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLoginSuccess?: () => void;
  currentJobs?: any[];
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  user,
  onLoginSuccess,
  currentJobs = []
}) => {
  const [hasDriveToken, setHasDriveToken] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Destructive operation confirmation state (Mandatory per Skill)
  const [fileToDelete, setFileToDelete] = useState<GoogleDriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Syncing user data
  const [isSyncingData, setIsSyncingData] = useState<boolean>(false);

  const checkConnection = useCallback(async () => {
    const connected = await GoogleDriveService.isDriveConnected();
    setHasDriveToken(connected);
    if (connected) {
      loadFiles();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      checkConnection();
    }
  }, [isOpen, checkConnection]);

  const loadFiles = async () => {
    setIsLoadingFiles(true);
    setStatusMessage(null);
    try {
      const driveFiles = await GoogleDriveService.listAppDriveFiles();
      setFiles(driveFiles);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to load Google Drive files' });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleGoogleConnect = async () => {
    setIsConnecting(true);
    setStatusMessage(null);
    try {
      await AuthService.googleSignIn();
      setHasDriveToken(true);
      setStatusMessage({ type: 'success', text: 'Connected to Google Drive successfully!' });
      if (onLoginSuccess) onLoginSuccess();
      await loadFiles();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to connect with Google' });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncUserData = async () => {
    setIsSyncingData(true);
    setStatusMessage(null);
    try {
      const payload = {
        userProfile: user,
        jobsHistory: currentJobs,
        syncedAt: new Date().toISOString()
      };
      const res = await GoogleDriveService.saveUserDataToDrive(payload);
      setStatusMessage({
        type: 'success',
        text: `User data & history stored successfully in Google Drive as "${res.fileName}"!`
      });
      loadFiles();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to store user data in Drive' });
    } finally {
      setIsSyncingData(false);
    }
  };

  // Explicit confirmation required for destructive file deletion
  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await GoogleDriveService.deleteFileFromDrive(fileToDelete.id);
      setFiles(prev => prev.filter(f => f.id !== fileToDelete.id));
      setStatusMessage({
        type: 'success',
        text: `"${fileToDelete.name}" was deleted from Google Drive.`
      });
      setFileToDelete(null);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to delete file from Google Drive' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          id="google-drive-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Subtle Ambient Drive Glow */}
          <div className="absolute top-0 right-0 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            id="close-drive-modal-btn"
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center space-x-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-amber-500 to-emerald-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Google Drive Storage
                </h3>
                {hasDriveToken && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Store, synchronize, and organize converted documents directly in Google Drive
              </p>
            </div>
          </div>

          {/* Status Alert Banner */}
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-3 rounded-2xl text-xs flex items-center justify-between ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-xs opacity-60 hover:opacity-100 ml-2"
              >
                &times;
              </button>
            </motion.div>
          )}

          {/* Body Content */}
          {!hasDriveToken ? (
            /* Unconnected State: Continue with Google */
            <div className="my-auto py-8 text-center flex flex-col items-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                <Cloud className="w-8 h-8 text-blue-500" />
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Save & Backup Files to Google Drive
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Connect your Google account to automatically store your converted files, translated documents, and app data in a dedicated folder in your Google Drive.
              </p>

              <div className="w-full max-w-xs">
                <GoogleSignInButton
                  text="Continue with Google"
                  onClick={handleGoogleConnect}
                  isLoading={isConnecting}
                />
              </div>

              <div className="mt-6 flex items-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Dedicated Folder
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Private to You
                </span>
              </div>
            </div>
          ) : (
            /* Connected State: Files List & Action Bar */
            <div className="flex-1 flex flex-col min-h-0">
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 mb-4">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Target Folder:
                  </span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                    Google Drive / ConvertAnyFile Documents
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleSyncUserData}
                    disabled={isSyncingData}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                    title="Store your conversion history, preferences, and session data to Google Drive"
                  >
                    <FolderUp className="w-3.5 h-3.5" />
                    <span>{isSyncingData ? 'Storing...' : 'Backup App Data to Drive'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={loadFiles}
                    disabled={isLoadingFiles}
                    className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Refresh Files"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Files Table / Cards */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[360px] no-scrollbar">
                {isLoadingFiles ? (
                  <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mb-2" />
                    <span>Fetching files from Google Drive...</span>
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      No files stored in Google Drive yet
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Convert any document or click "Backup App Data to Drive" to store your first file!
                    </p>
                  </div>
                ) : (
                  files.map(file => (
                    <div
                      key={file.id}
                      className="group flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 hover:border-blue-500/40 transition-all"
                    >
                      <div className="flex items-center space-x-3 min-w-0 pr-2">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          {renderFileIcon(file.name, file.mimeType)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                            {file.size && (
                              <span>{formatFileSize(parseInt(file.size, 10))}</span>
                            )}
                            {file.createdTime && (
                              <>
                                <span>&bull;</span>
                                <span>{new Date(file.createdTime).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 hover:bg-blue-500/10 text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors"
                            title="Open in Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setFileToDelete(file)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-red-500/40 hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete from Google Drive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Explicit User Confirmation Dialog for Destructive Operations (Mandatory per Skill) */}
          {fileToDelete && (
            <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto mb-3">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Delete from Google Drive?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
                  Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-slate-200">"{fileToDelete.name}"</span>? This will permanently remove the file from your Google Drive.
                </p>

                <div className="flex items-center space-x-2 justify-center">
                  <button
                    type="button"
                    onClick={() => setFileToDelete(null)}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteFile}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

function renderFileIcon(name: string, mime: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return <FileText className="w-4 h-4 text-red-500" />;
  if (ext === 'docx' || ext === 'doc') return <FileText className="w-4 h-4 text-blue-500" />;
  if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
  if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext || '')) return <FileImage className="w-4 h-4 text-amber-500" />;
  return <File className="w-4 h-4 text-slate-400" />;
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
