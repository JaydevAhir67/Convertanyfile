import React, { useState, useEffect, useCallback } from 'react';
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
import { LoginModal } from './components/LoginModal';
import { AuthSecurityTestModal } from './components/AuthSecurityTestModal';
import { SoundFxModal } from './components/SoundFxModal';
import { ConversionJob, AuthState } from './types';
import { AuthService } from './services/authService';
import { ShieldCheck, Cpu, Flame, Zap, Volume2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('converter');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [jobs, setJobs] = useState<ConversionJob[]>([]);
  const [showInitialLoader, setShowInitialLoader] = useState<boolean>(true);

  // Authentication State
  const [authState, setAuthState] = useState<AuthState>(() => AuthService.getInitialState());
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginRedirectReason, setLoginRedirectReason] = useState<string | null>(null);
  const [loginTargetRoute, setLoginTargetRoute] = useState<string | null>('history');
  const [showSecurityTestModal, setShowSecurityTestModal] = useState<boolean>(false);
  const [showSoundFxModal, setShowSoundFxModal] = useState<boolean>(false);

  // Subscribe to AuthService changes
  useEffect(() => {
    const unsubscribe = AuthService.subscribe(state => {
      setAuthState(state);
    });
    return () => unsubscribe();
  }, []);

  // Protected Route Navigation Guard
  const navigateToTab = useCallback((tab: NavTab) => {
    // Check if route is protected and user is not authenticated
    if (AuthService.isRouteProtected(tab) && !AuthService.getInitialState().isAuthenticated) {
      setLoginTargetRoute(tab);
      setLoginRedirectReason('unauthorized_redirect');
      setShowLoginModal(true);
      try {
        window.history.pushState(null, '', `/login?redirect=/${tab}`);
      } catch {}
      return;
    }

    setActiveTab(tab);
    try {
      const urlPath = tab === 'converter' ? '/' : `/${tab}`;
      window.history.pushState(null, '', urlPath);
    } catch {}
  }, []);

  // Synchronize browser URL paths (e.g. manual entry of /history or hash #/history)
  useEffect(() => {
    try {
      const path =
        window.location.pathname.replace(/^\/+/, '') ||
        window.location.hash.replace(/^#\/?/, '');

      if (path === 'history') {
        if (!AuthService.getInitialState().isAuthenticated) {
          setLoginTargetRoute('history');
          setLoginRedirectReason('unauthorized_redirect');
          setShowLoginModal(true);
          setActiveTab('converter');
        } else {
          setActiveTab('history');
        }
      } else if (path === 'login') {
        setShowLoginModal(true);
      }
    } catch {}

    const handlePopState = () => {
      try {
        const p = window.location.pathname.replace(/^\/+/, '');
        if (p === 'history') {
          if (!AuthService.getInitialState().isAuthenticated) {
            setLoginTargetRoute('history');
            setLoginRedirectReason('unauthorized_redirect');
            setShowLoginModal(true);
          } else {
            setActiveTab('history');
          }
        }
      } catch {}
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  const handleLoginSuccess = (targetRoute?: string) => {
    setShowLoginModal(false);
    setLoginRedirectReason(null);
    if (targetRoute === 'history') {
      setActiveTab('history');
      try {
        window.history.pushState(null, '', '/history');
      } catch {}
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    if (activeTab === 'history') {
      setActiveTab('converter');
      setLoginTargetRoute('history');
      setLoginRedirectReason('Session terminated. Sign in to access conversion history.');
      setShowLoginModal(true);
      try {
        window.history.pushState(null, '', '/login?redirect=/history');
      } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-red-600 selection:text-white transition-colors duration-200">
      {/* High-Tech Rocket Boot Loading Animation on Website Opening */}
      {showInitialLoader && (
        <WebsiteLoadingScreen onComplete={() => setShowInitialLoader(false)} />
      )}

      {/* Universal Top Navigation with Red Accents, Auth State & Dark Mode Toggle */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={navigateToTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        jobsCount={jobs.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        isAuthenticated={authState.isAuthenticated}
        user={authState.user}
        onOpenLogin={() => {
          setLoginRedirectReason(null);
          setLoginTargetRoute(activeTab === 'history' ? 'history' : null);
          setShowLoginModal(true);
        }}
        onLogout={handleLogout}
        onOpenSecurityTest={() => setShowSecurityTestModal(true)}
        onOpenSoundFx={() => setShowSoundFxModal(true)}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'converter' && (
          <UniversalUploader
            onJobCreated={handleJobCreated}
            onNavigateToTab={navigateToTab}
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
            onNavigateToConverter={() => navigateToTab('converter')}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView onNavigate={navigateToTab} jobsCount={jobs.length} />
        )}
      </main>

      {/* Authentication Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setLoginRedirectReason(null);
        }}
        onLoginSuccess={handleLoginSuccess}
        redirectReason={loginRedirectReason}
        targetRoute={loginTargetRoute}
      />

      {/* Functional Authentication Security Test Suite Runner */}
      <AuthSecurityTestModal
        isOpen={showSecurityTestModal}
        onClose={() => setShowSecurityTestModal(false)}
        currentTab={activeTab}
        onNavigate={navigateToTab}
        onTriggerUnauthorizedHistoryAttempt={() => {
          // Explicitly simulate unauthenticated access attempt to /history
          navigateToTab('history');
        }}
        isAuthenticated={authState.isAuthenticated}
      />

      {/* Interactive Rocket Sound Effects Station Modal */}
      <SoundFxModal
        isOpen={showSoundFxModal}
        onClose={() => setShowSoundFxModal(false)}
      />

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
            <button
              onClick={() => setShowSecurityTestModal(true)}
              className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Auth Security Guard Active</span>
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setShowSoundFxModal(true)}
              className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span>Sound FX Station</span>
            </button>
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
