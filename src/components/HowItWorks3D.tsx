import React from 'react';
import { UploadCloud, Cpu, Download, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const HowItWorks3D: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Drop into Universe',
      subtitle: 'Spatial Ingestion',
      description: 'Drag and drop your PDF, image, document, audio or tabular data into the spatial drop zone. Zero server upload required.',
      icon: <UploadCloud className="w-6 h-6 text-cyan-400" />,
      accentColor: 'from-cyan-500/20 to-sky-500/5',
      borderColor: 'border-cyan-500/30',
      badgeColor: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40'
    },
    {
      number: '02',
      title: 'Client-Side Morphing',
      subtitle: 'Neural & Vector Execution',
      description: 'Our WebAssembly compilation engine reconstructs document paragraphs, headings, color spaces, and fonts in local memory.',
      icon: <Cpu className="w-6 h-6 text-violet-400" />,
      accentColor: 'from-violet-500/20 to-purple-500/5',
      borderColor: 'border-violet-500/30',
      badgeColor: 'text-violet-400 bg-violet-950/40 border-violet-800/40'
    },
    {
      number: '03',
      title: 'Cryptographic Release',
      subtitle: 'Instant Preview & Download',
      description: 'Verify your computed SHA-256 integrity hash, inspect high-fidelity page previews, and download your publication-ready file.',
      icon: <Download className="w-6 h-6 text-emerald-400" />,
      accentColor: 'from-emerald-500/20 to-teal-500/5',
      borderColor: 'border-emerald-500/30',
      badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
    }
  ];

  return (
    <section className="relative w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-violet-400 bg-violet-950/30 border border-violet-800/40 px-3 py-1 rounded-lg">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The 3-Step Transformation Pipeline</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display text-balance">
          How Files Enter and <span className="bg-gradient-to-r from-violet-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent">Transform</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal">
          Engineered for instant execution. Zero waiting in remote queues. Zero server data egress.
        </p>
      </div>

      {/* 3-Step Horizontal Bento / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
        {steps.map((step, idx) => (
          <div
            key={step.number}
            className={`relative rounded-3xl p-6 sm:p-8 glass-surface-elevated border ${step.borderColor} transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl overflow-hidden group`}
          >
            {/* Ambient Background Gradient Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${step.accentColor} opacity-50 pointer-events-none`} />

            {/* Step Number Watermark / Minimal Indicator */}
            <div className="flex items-center justify-between mb-6">
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${step.badgeColor}`}>
                STEP {step.number}
              </span>
              <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                {step.icon}
              </div>
            </div>

            <div className="relative z-10 space-y-2.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {step.subtitle}
              </span>
              <h3 className="text-xl font-bold text-white font-display">
                {step.title}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Connecting Step Arrow Indicator */}
            {idx < 2 && (
              <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 items-center justify-center text-slate-400 z-20 shadow-md">
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
