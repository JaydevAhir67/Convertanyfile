import React from 'react';
import { Check, Zap, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

interface Premium3DComparisonProps {
  onSelectTier?: (tier: string) => void;
}

export const Premium3DComparison: React.FC<Premium3DComparisonProps> = ({ onSelectTier }) => {
  const freeFeatures = [
    'Unlimited Document Conversions (PDF, DOCX, Images)',
    '100% Client-Side Privacy & Zero Egress',
    'High-Resolution PDF to JPG / PNG',
    'Cryptographic SHA-256 File Integrity',
    'Instant File Previews & Downloads',
    'Localhost & XAMPP Standalone Compatibility'
  ];

  const proFeatures = [
    'Everything in Free Edition',
    'Parallel Batch Processing (Up to 100 files simultaneously)',
    'Neural Multilingual Document Translation',
    'Deep OCR & Scanned Table Extraction',
    'Google Drive Automatic Backup Integration',
    'High-DPI Vector Print Optimization (300+ DPI)',
    'Full PHP + MySQL Localhost Database Sync'
  ];

  return (
    <section className="relative w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-cyan-400 bg-cyan-950/30 border border-cyan-800/40 px-3 py-1 rounded-lg">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transparent & Uncompromised</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display text-balance">
          Simple, Transparent <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-rose-400 bg-clip-text text-transparent">Tiers</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal">
          ConvertAnyFile is completely free for standard everyday conversions. Advanced batch pipelines and neural translation are available with zero deceptive subscriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        {/* Tier 1: Free Community Edition */}
        <div className="rounded-3xl glass-surface p-8 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 shadow-lg">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Community</span>
                <h3 className="text-2xl font-extrabold text-white font-display mt-1">Free Tier</h3>
              </div>
              <span className="text-2xl font-black text-white font-mono">$0</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Full access to client-side conversions with complete privacy and zero data collection.
            </p>

            <ul className="space-y-3 pt-2">
              {freeFeatures.map(feat => (
                <li key={feat} className="flex items-start space-x-2.5 text-xs text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-8">
            <button
              onClick={() => onSelectTier?.('free')}
              className="w-full py-3 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            >
              Start Free (No Account Needed)
            </button>
          </div>
        </div>

        {/* Tier 2: Pro & Enterprise (Floating Elevated 3D Card) */}
        <div className="relative rounded-3xl glass-surface-elevated p-8 border-2 border-cyan-400/60 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 flex flex-col justify-between transition-all duration-300 transform md:-translate-y-3 hover:-translate-y-5 shadow-2xl shadow-cyan-500/10 group">
          {/* Top Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-sky-300 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
            Most Popular
          </div>

          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Professional</span>
                <h3 className="text-2xl font-extrabold text-white font-display mt-1">Pro Edition</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-cyan-400 font-mono">$9</span>
                <span className="text-xs text-slate-400 block font-normal">/ lifetime</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              For professionals, academic researchers, and engineers requiring batch throughput and OCR.
            </p>

            <ul className="space-y-3 pt-2">
              {proFeatures.map(feat => (
                <li key={feat} className="flex items-start space-x-2.5 text-xs text-slate-100">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-8">
            <button
              onClick={() => onSelectTier?.('pro')}
              className="w-full py-3 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 rounded-xl transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center space-x-2"
            >
              <span>Unlock Pro Features</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
