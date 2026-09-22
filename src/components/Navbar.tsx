import React from 'react';
import {
  FileCode,
  Binary,
  Layers,
  BarChart3,
  Video,
  Scale,
  History,
  GraduationCap,
  Sparkles,
  Search,
  Activity,
  Moon,
  Sun,
  ShieldCheck,
  Languages,
  Lock,
  LogOut,
  User,
  ShieldAlert
} from 'lucide-react';
import { UserProfile } from '../types';

export type NavTab =
  | 'converter'
  | 'translate'
  | 'scientific'
  | 'data'
  | 'code'
  | 'media'
  | 'units'
  | 'history'
  | 'viva'
  | 'dashboard';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  jobsCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isAuthenticated: boolean;
  user: UserProfile | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenSecurityTest: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  jobsCount,
  isDarkMode,
  onToggleDarkMode,
  isAuthenticated,
  user,
  onOpenLogin,
  onLogout,
  onOpenSecurityTest
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string; isProtected?: boolean }[] = [
    { id: 'converter', label: 'Universal Converter', icon: <Layers className="w-4 h-4" /> },
    { id: 'translate', label: 'Google Translate', icon: <Languages className="w-4 h-4" />, badge: 'AI OCR' },
    { id: 'scientific', label: 'Scientific Lab', icon: <Binary className="w-4 h-4" />, badge: 'Pro' },
    { id: 'data', label: 'Data Engine', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'code', label: 'Code Transpiler', icon: <FileCode className="w-4 h-4" /> },
    { id: 'media', label: 'Media Studio', icon: <Video className="w-4 h-4" /> },
    { id: 'units', label: 'Unit Converter', icon: <Scale className="w-4 h-4" /> },
    {
      id: 'history',
      label: 'History',
      icon: <History className="w-4 h-4" />,
      badge: !isAuthenticated ? 'Protected' : jobsCount > 0 ? `${jobsCount}` : undefined,
      isProtected: true
    },
    { id: 'viva', label: 'Knowledge Base', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-xs transition-colors duration-200">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div
            id="brand-logo"
            onClick={() => setActiveTab('converter')}
            className="flex items-center space-x-3 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-red-600/30 border border-red-400/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white font-sans">
                  Convert<span className="text-red-600 dark:text-red-500">AnyFile</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] tracking-wider font-bold rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                  Universal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 hidden sm:block">Fast, Private & In-Browser File Conversion</p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden md:flex items-center relative w-64 lg:w-72">
            <Search className="w-4 h-4 absolute left-3 text-slate-400 dark:text-slate-500" />
            <input
              id="nav-search-input"
              type="text"
              placeholder="Search tools, formats, formulas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Right Controls: Security Test, Auth, Dark Mode Toggle & Privacy Badge */}
          <div className="flex items-center space-x-2">
            {/* Functional Auth Security Test Button */}
            <button
              id="open-security-test-btn"
              type="button"
              onClick={onOpenSecurityTest}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold transition-all shadow-xs"
              title="Run Functional Test of Authentication Security"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Auth Test</span>
            </button>

            {/* Authentication Button / User Profile */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2 pl-1 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden lg:flex flex-col text-right leading-tight">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {user.email}
                  </span>
                </div>
                <button
                  id="user-logout-btn"
                  type="button"
                  onClick={onLogout}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-rose-500/10 hover:text-rose-500 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden sm:inline text-[11px]">Logout</span>
                </button>
              </div>
            ) : (
              <button
                id="open-login-btn"
                type="button"
                onClick={onOpenLogin}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition-all shadow-xs"
              >
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span>Sign In</span>
              </button>
            )}

            {/* Dark Mode / Light Mode Toggle Button */}
            <button
              id="dark-mode-toggle-btn"
              type="button"
              onClick={onToggleDarkMode}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-xs"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="hidden sm:inline text-[11px]">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-red-600" />
                  <span className="hidden sm:inline text-[11px]">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1.5 overflow-x-auto no-scrollbar py-2 border-t border-slate-100 dark:border-slate-850">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.isProtected && !isAuthenticated && (
                  <Lock className="w-3 h-3 text-amber-400 ml-0.5" />
                )}
                {item.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                      isActive
                        ? 'bg-red-700 text-red-100'
                        : item.badge === 'Protected'
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

