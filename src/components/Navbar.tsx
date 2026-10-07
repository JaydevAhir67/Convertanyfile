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
  ShieldAlert,
  Volume2,
  VolumeX,
  HardDrive,
  Server
} from 'lucide-react';
import { UserProfile } from '../types';
import { SoundEngine } from '../services/soundEffects';

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
  onOpenSoundFx?: () => void;
  onOpenDrive?: () => void;
  hasDriveAccess?: boolean;
  onOpenXampp?: () => void;
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
  onOpenSecurityTest,
  onOpenSoundFx,
  onOpenDrive,
  hasDriveAccess = false,
  onOpenXampp
}) => {
  const [isMuted, setIsMuted] = React.useState(() => SoundEngine.getMuted());

  const handleToggleSound = async () => {
    await SoundEngine.unlockAudioContext();
    const nextState = !isMuted;
    setIsMuted(nextState);
    SoundEngine.setMuted(nextState);
    if (!nextState) {
      // Play instant preview of supersonic speed sound
      SoundEngine.playRocketAppearanceSound();
    }
  };
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; isProtected?: boolean }[] = [
    { id: 'converter', label: 'Converter', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'translate', label: 'Translate', icon: <Languages className="w-3.5 h-3.5" /> },
    { id: 'scientific', label: 'Scientific Lab', icon: <Binary className="w-3.5 h-3.5" /> },
    { id: 'data', label: 'Data', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'code', label: 'Code', icon: <FileCode className="w-3.5 h-3.5" /> },
    { id: 'media', label: 'Media', icon: <Video className="w-3.5 h-3.5" /> },
    { id: 'units', label: 'Units', icon: <Scale className="w-3.5 h-3.5" /> },
    {
      id: 'history',
      label: 'History',
      icon: <History className="w-3.5 h-3.5" />,
      isProtected: true
    },
    { id: 'viva', label: 'Docs & Guide', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-3.5 h-3.5" /> }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md transition-colors duration-200">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Product Name - Premium 3D Treatment */}
          <div
            id="brand-logo"
            onClick={() => setActiveTab('converter')}
            className="flex items-center space-x-2.5 cursor-pointer select-none group"
            style={{ perspective: '800px' }}
          >
            <div
              className="relative w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-transform duration-500 group-hover:rotate-y-12 group-hover:rotate-x-6 group-hover:scale-105"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 rounded-lg bg-slate-900 dark:bg-white shadow-[0_4px_12px_rgba(0,0,0,0.2)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.5),0_0_15px_rgba(255,255,255,0.1)] border border-slate-700/50 dark:border-slate-200/50" style={{ transform: 'translateZ(0px)' }} />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-100 dark:to-slate-300 opacity-90" style={{ transform: 'translateZ(2px)' }} />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/20 to-transparent dark:from-white/60 dark:to-transparent border border-white/10 dark:border-white/40" style={{ transform: 'translateZ(4px)' }} />
              <Layers className="relative w-4 h-4 text-white dark:text-slate-900 drop-shadow-md transition-transform duration-500 group-hover:translate-z-8" style={{ transform: 'translateZ(6px)' }} />
            </div>
            <div className="flex items-center space-x-2 transition-transform duration-500 group-hover:translate-x-1">
              <span className="font-extrabold text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-slate-800 to-slate-950 dark:from-white dark:to-slate-300 drop-shadow-sm filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                ConvertAnyFile
              </span>
              <span
                className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 select-none cursor-pointer hover:bg-amber-500/20 transition-colors shadow-sm"
                title="Barnaby the Brown Siberian Husky · ConvertAnyFile Mascot"
              >
                <span>🐺</span>
                <span className="hidden sm:inline">Barnaby</span>
              </span>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden md:flex items-center relative w-64 lg:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 dark:text-slate-500" />
            <input
              id="nav-search-input"
              type="text"
              placeholder="Search tools or formats..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            {/* Google Drive Storage Button */}
            {onOpenDrive && (
              <button
                id="open-google-drive-btn"
                type="button"
                onClick={onOpenDrive}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                title="Google Drive Storage"
              >
                <HardDrive className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="hidden sm:inline">Drive</span>
                {hasDriveAccess && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            )}

            {/* Security Audit Center Button */}
            <button
              id="open-security-test-btn"
              type="button"
              onClick={onOpenSecurityTest}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
              title="Security & Verification Center"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">Security</span>
            </button>

            {/* Authentication Button / User Profile */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2 pl-1 border-l border-slate-200 dark:border-slate-800">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700 object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[100px] hidden lg:inline">
                  {user.name}
                </span>
                <button
                  id="user-logout-btn"
                  type="button"
                  onClick={onLogout}
                  className="px-2 py-1 rounded-md text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="open-login-btn"
                type="button"
                onClick={onOpenLogin}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                <Lock className="w-3 h-3" />
                <span>Sign in</span>
              </button>
            )}

            {/* Minimal Sound FX Toggle Button */}
            <button
              id="sound-fx-quick-mute-btn"
              type="button"
              onClick={handleToggleSound}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
              title={isMuted ? 'Sound FX Off (Click to enable)' : 'Sound FX On (Click to mute)'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden md:inline text-[11px] text-slate-400">Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" />
                  <span className="hidden md:inline text-[11px]">Sound</span>
                </>
              )}
            </button>

            {/* Dark Mode / Light Mode Toggle Button */}
            <button
              id="dark-mode-toggle-btn"
              type="button"
              onClick={onToggleDarkMode}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-3.5 h-3.5" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Clean, no pill badges, calm underline styling */}
        <nav
          className="flex space-x-1 overflow-x-auto no-scrollbar py-1 border-t border-slate-100 dark:border-slate-900"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.id === 'history' && jobsCount > 0 && (
                  <span className="ml-1 text-[10px] text-slate-500 font-mono">
                    ({jobsCount})
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

