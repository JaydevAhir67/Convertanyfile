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
  Languages
} from 'lucide-react';

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
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  jobsCount,
  isDarkMode,
  onToggleDarkMode
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'converter', label: 'Universal Converter', icon: <Layers className="w-4 h-4" /> },
    { id: 'translate', label: 'Google Translate', icon: <Languages className="w-4 h-4" />, badge: 'AI OCR' },
    { id: 'scientific', label: 'Scientific Lab', icon: <Binary className="w-4 h-4" />, badge: 'Pro' },
    { id: 'data', label: 'Data Engine', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'code', label: 'Code Transpiler', icon: <FileCode className="w-4 h-4" /> },
    { id: 'media', label: 'Media Studio', icon: <Video className="w-4 h-4" /> },
    { id: 'units', label: 'Unit Converter', icon: <Scale className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" />, badge: jobsCount > 0 ? `${jobsCount}` : undefined },
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
          <div className="hidden md:flex items-center relative w-72">
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

          {/* Right Controls: Dark Mode Toggle & Privacy Badge */}
          <div className="flex items-center space-x-2.5">
            {/* 100% Client-Side Private Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span>100% Private</span>
            </div>

            {/* Dark Mode / Light Mode Toggle Button */}
            <button
              id="dark-mode-toggle-btn"
              type="button"
              onClick={onToggleDarkMode}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-xs"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="hidden sm:inline text-[11px]">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-red-600" />
                  <span className="hidden sm:inline text-[11px]">Dark Mode</span>
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
                {item.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                      isActive
                        ? 'bg-red-700 text-red-100'
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

