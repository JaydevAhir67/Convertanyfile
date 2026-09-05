import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lightbulb,
  BookOpen,
  Shuffle,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { vivaQuestions, formulaCheatSheet, vivaTips } from '../data/vivaData';
import { VivaQuestion } from '../types';

export const VivaPrepView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'qa' | 'simulator' | 'formulas' | 'tips'>('qa');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(vivaQuestions[0]?.id || null);

  // Simulator State
  const [currentSimQuestion, setCurrentSimQuestion] = useState<VivaQuestion>(() => {
    return vivaQuestions[Math.floor(Math.random() * vivaQuestions.length)];
  });
  const [simAnswerRevealed, setSimAnswerRevealed] = useState<boolean>(false);

  const categories = ['All', 'Numerical Methods', 'Statistics & Math', 'Architecture & System Design', 'Data & Media Processing'];

  const filteredQuestions = vivaQuestions.filter(q => {
    const matchesCat = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.keyPoints.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const rollNewSimulatorQuestion = () => {
    setSimAnswerRevealed(false);
    const randomIdx = Math.floor(Math.random() * vivaQuestions.length);
    setCurrentSimQuestion(vivaQuestions[randomIdx]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-sky-600" />
            <span>B.Tech PSC Viva-Voce Master Prep</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Curated questions, mathematical proofs, examiner simulation, and formula cheat sheets tailored for PSC project defense.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('qa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'qa' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            All Questions ({vivaQuestions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 ${
              activeTab === 'simulator' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Shuffle className="w-3 h-3 text-sky-600" />
            <span>Examiner Simulator</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('formulas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'formulas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Formula Sheet
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tips')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'tips' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Viva Tips
          </button>
        </div>
      </div>

      {/* Main Q&A Tab */}
      {activeTab === 'qa' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search questions or keywords..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    selectedCategory === cat
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-3">
            {filteredQuestions.map(q => {
              const isOpen = expandedId === q.id;
              return (
                <div
                  key={q.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : q.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-bold border border-sky-100 uppercase">
                          {q.category}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Q-{q.id}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{q.question}</h3>
                    </div>
                    <div className="p-1 rounded bg-slate-100 text-slate-500">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-3">
                      <div className="text-xs text-slate-700 leading-relaxed font-sans">{q.answer}</div>

                      {q.keyPoints.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/60">
                          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                            Key Speaking Points to Impress the Examiner:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {q.keyPoints.map((point, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[11px] font-medium"
                              >
                                ✓ {point}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Simulator Tab */}
      {activeTab === 'simulator' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase">
              Examiner Viva Simulation Mode
            </span>
            <button
              type="button"
              onClick={rollNewSimulatorQuestion}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Next Random Question</span>
            </button>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {currentSimQuestion.category}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              "{currentSimQuestion.question}"
            </h3>
          </div>

          {!simAnswerRevealed ? (
            <div className="text-center py-6">
              <p className="text-xs text-slate-500 mb-4">
                Formulate your answer aloud as if speaking to the professor, then reveal the model response.
              </p>
              <button
                type="button"
                onClick={() => setSimAnswerRevealed(true)}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all"
              >
                Reveal Model Answer & Speaking Points
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-2 border-t border-slate-200 animate-fadeIn">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
                <span className="font-bold block mb-1">Model Response:</span>
                {currentSimQuestion.answer}
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Essential Keywords:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentSimQuestion.keyPoints.map((kp, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold"
                    >
                      ★ {kp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Formula Sheet Tab */}
      {activeTab === 'formulas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formulaCheatSheet.map((f, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm">{f.title}</h4>
                <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-bold border border-sky-200">
                  {f.notes}
                </span>
              </div>
              <div className="p-3 bg-slate-900 text-sky-300 font-mono text-xs rounded-lg overflow-x-auto">
                {f.formula}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips Tab */}
      {activeTab === 'tips' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs max-w-3xl mx-auto space-y-6">
          <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <span>High-Scoring Viva Strategies for PSC Defense</span>
          </h3>

          <div className="space-y-3">
            {vivaTips.map((tip, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{tip.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
