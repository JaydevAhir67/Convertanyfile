import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { UniversalUploader } from './components/UniversalUploader';
import { GoogleTranslateDocsView } from './components/GoogleTranslateDocsView';
import { ScientificLabView } from './components/ScientificLab/ScientificLabView';
import { DataConverterView } from './components/DataConverterView';
import { MediaConverterView } from './components/MediaConverterView';
import { CodeConverterView } from './components/CodeConverterView';
import { UnitConverterView } from './components/UnitConverterView';
import { VivaPrepView } from './components/VivaPrepView';
import { BatchQueueView } from './components/BatchQueueView';
import { DashboardView } from './components/DashboardView';
import { WebsiteLoadingScreen } from './components/WebsiteLoadingScreen';
import { ConversionJob } from './types';
import { ShieldCheck, Cpu, Flame, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('converter');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [jobs, setJobs] = useState<ConversionJob[]>([]);
  const [showInitialLoader, setShowInitialLoader] = useState<boolean>(true);

  // Website ALWAYS opens in Dark Mode by default
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('caf_theme');
      if (saved === 'light') return false;
      return true; // Always default to dark mode
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('caf_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('caf_theme', 'light');
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleJobCreated = (job: ConversionJob) => {
    setJobs(prev => [job, ...prev]);
  };

  const handleClearJobs = () => {
    setJobs([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-red-600 selection:text-white transition-colors duration-200">
      {/* High-Tech Rocket Boot Loading Animation on Website Opening */}
      {showInitialLoader && (
        <WebsiteLoadingScreen onComplete={() => setShowInitialLoader(false)} />
      )}

      {/* Universal Top Navigation with Red Accents & Dark Mode Toggle */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        jobsCount={jobs.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'converter' && (
          <UniversalUploader
            onJobCreated={handleJobCreated}
            onNavigateToTab={setActiveTab}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'translate' && <GoogleTranslateDocsView />}

        {activeTab === 'scientific' && <ScientificLabView />}

        {activeTab === 'data' && <DataConverterView />}

        {activeTab === 'media' && <MediaConverterView />}

        {activeTab === 'code' && <CodeConverterView />}

        {activeTab === 'units' && <UnitConverterView />}

        {activeTab === 'viva' && <VivaPrepView />}

        {activeTab === 'history' && (
          <BatchQueueView
            jobs={jobs}
            onClearJobs={handleClearJobs}
            onNavigateToConverter={() => setActiveTab('converter')}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView onNavigate={setActiveTab} jobsCount={jobs.length} />
        )}
      </main>

      {/* Clean Modern Engineering Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 py-4 px-4 sm:px-8 mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-medium">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">ConvertAnyFile</span>
            <span>&bull;</span>
            <span className="text-red-600 dark:text-red-400 font-semibold">Universal File Engine</span>
            <span>&bull;</span>
            <span>Zero Server Egress</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400 dark:text-slate-500 text-[11px]">
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">100% Client-Side Privacy</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center space-x-1">
              <Flame className="w-3 h-3 text-red-500" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Red Rocket Speed Pipeline</span>
            </span>
            <span>&bull;</span>
            <span className="text-red-600 dark:text-red-400 font-mono font-bold">READY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
