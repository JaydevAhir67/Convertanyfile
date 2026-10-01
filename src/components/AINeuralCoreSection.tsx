import React from 'react';
import { Cpu, Sparkles, Languages, FileSearch, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import aiNeuralImg from '../assets/images/ai_neural_document_core_1790800910004.jpg';

interface AINeuralCoreSectionProps {
  onOpenTranslate: () => void;
  onOpenOcr: () => void;
}

export const AINeuralCoreSection: React.FC<AINeuralCoreSectionProps> = ({
  onOpenTranslate,
  onOpenOcr
}) => {
  const aiCapabilities = [
    {
      title: 'Neural Multilingual Translation',
      desc: 'Preserves executive document layout, bullet lists, and tables while translating between 100+ global languages.',
      icon: <Languages className="w-5 h-5 text-cyan-400" />
    },
    {
      title: 'High-Precision Client OCR',
      desc: 'Extracts editable text and tabular data from scanned receipts, invoices, and low-contrast photography using Tesseract.js.',
      icon: <FileSearch className="w-5 h-5 text-violet-400" />
    },
    {
      title: 'Spatial Structure Reconstruction',
      desc: 'Identifies heading hierarchies, margins, font styles, and paragraph groupings with mathematical precision.',
      icon: <FileText className="w-5 h-5 text-amber-400" />
    },
    {
      title: 'Zero Cloud LLM Training',
      desc: 'All optical recognition and document parsing runs in local browser memory. Your documents never train public AI models.',
      icon: <Cpu className="w-5 h-5 text-emerald-400" />
    }
  ];

  return (
    <section className="relative w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="rounded-3xl glass-surface-elevated border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 sm:p-12 overflow-hidden relative">
        {/* Ambient Radial Gradient Background */}
        <div className="absolute top-1/2 left-0 w-[28rem] h-[28rem] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: AI Narrative & Features */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-violet-400 bg-violet-950/40 border border-violet-800/40 px-3 py-1.5 rounded-lg">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Document Intelligence & Neural Core</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display text-balance">
              Your Documents, <span className="bg-gradient-to-r from-violet-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent">Now Intelligent.</span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Transform static PDFs and raw image scans into structured, searchable, and localized documents. Extract key fields, translate languages, and recover typography automatically.
            </p>

            {/* 4 Capabilities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {aiCapabilities.map(cap => (
                <div
                  key={cap.title}
                  className="p-4 rounded-xl glass-surface border border-slate-700/60 space-y-1.5"
                >
                  <div className="flex items-center space-x-2 text-white font-semibold text-sm">
                    {cap.icon}
                    <span>{cap.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenTranslate}
                className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 rounded-xl transition-colors flex items-center space-x-2 shadow-sm"
              >
                <span>Launch Document Translator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onOpenOcr}
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl transition-colors flex items-center space-x-2"
              >
                <span>Extract OCR Text</span>
              </button>
            </div>
          </div>

          {/* Right Column: 3D Visual Asset Container */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl group w-full max-w-md aspect-[4/3]">
              <img
                src={aiNeuralImg}
                alt="3D Neural Document Processing Core"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                  <span>Neural Pipeline Ready</span>
                </span>
                <span className="font-mono text-cyan-400 text-[11px]">100% PRIVATE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
