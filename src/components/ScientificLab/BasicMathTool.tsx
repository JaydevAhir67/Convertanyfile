import React, { useState } from 'react';
import { Calculator, Percent, Sparkles, CheckCircle2 } from 'lucide-react';
import { ScientificEngine } from '../../services/scientificEngine';

export const BasicMathTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'interest' | 'combinatorics' | 'percentage'>('interest');

  // Compound Interest State
  const [principal, setPrincipal] = useState<string>('10000');
  const [rate, setRate] = useState<string>('7.5');
  const [compoundFreq, setCompoundFreq] = useState<string>('12'); // monthly
  const [years, setYears] = useState<string>('5');
  const [interestResult, setInterestResult] = useState(() =>
    ScientificEngine.calculateCompoundInterest(10000, 7.5, 12, 5)
  );

  // Combinatorics State
  const [nVal, setNVal] = useState<string>('8');
  const [rVal, setRVal] = useState<string>('3');

  // Percentage State
  const [percentVal, setPercentVal] = useState<string>('15');
  const [totalVal, setTotalVal] = useState<string>('240');

  const handleCalculateInterest = () => {
    const p = Number(principal) || 0;
    const r = Number(rate) || 0;
    const n = Number(compoundFreq) || 1;
    const t = Number(years) || 1;
    setInterestResult(ScientificEngine.calculateCompoundInterest(p, r, n, t));
  };

  const n = Number(nVal) || 0;
  const r = Number(rVal) || 0;
  let perm = 0;
  let comb = 0;
  let combError: string | null = null;
  try {
    perm = ScientificEngine.calculatePermutation(n, r);
    comb = ScientificEngine.calculateCombination(n, r);
  } catch (err: any) {
    combError = err.message;
  }

  const pNum = Number(percentVal) || 0;
  const tNum = Number(totalVal) || 0;
  const calculatedPercent = (pNum / 100) * tNum;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-sky-600" />
            <span>Basic Scientific Math Suite</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compound interest, permutations (nPr), combinations (nCr), ratios, and financial mathematics.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('interest')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'interest' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Compound Interest (A = P(1 + r/n)ⁿᵗ)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('combinatorics')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'combinatorics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Combinatorics (nPr & nCr)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('percentage')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'percentage' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Percentage & Proportions
        </button>
      </div>

      {/* Interest Tab */}
      {activeTab === 'interest' && (
        <div className="space-y-6">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Principal ($)</label>
              <input
                type="number"
                value={principal}
                onChange={e => setPrincipal(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={rate}
                onChange={e => setRate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Compounding Frequency</label>
              <select
                value={compoundFreq}
                onChange={e => setCompoundFreq(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold"
              >
                <option value="1">Annually (1/yr)</option>
                <option value="2">Semi-Annually (2/yr)</option>
                <option value="4">Quarterly (4/yr)</option>
                <option value="12">Monthly (12/yr)</option>
                <option value="365">Daily (365/yr)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time Horizon (Years)</label>
              <input
                type="number"
                value={years}
                onChange={e => setYears(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCalculateInterest}
            className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Compute Compound Interest
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-xs font-semibold text-emerald-800">Total Accrued Amount (A)</span>
              <div className="text-2xl font-extrabold font-mono text-emerald-950 mt-1">
                ${interestResult.totalAmount.toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl">
              <span className="text-xs font-semibold text-sky-800">Total Interest Earned (I)</span>
              <div className="text-2xl font-extrabold font-mono text-sky-950 mt-1">
                ${interestResult.totalInterest.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Combinatorics Tab */}
      {activeTab === 'combinatorics' && (
        <div className="space-y-6">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex items-center space-x-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Items (n)</label>
              <input
                type="number"
                value={nVal}
                onChange={e => setNVal(e.target.value)}
                className="w-32 bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Selected Items (r)</label>
              <input
                type="number"
                value={rVal}
                onChange={e => setRVal(e.target.value)}
                className="w-32 bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono"
              />
            </div>
          </div>

          {combError ? (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg">{combError}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
                <span className="text-xs font-bold text-slate-500 uppercase">Permutations (nPr = n! / (n-r)!)</span>
                <div className="text-3xl font-extrabold font-mono text-sky-600 mt-2">
                  P({n}, {r}) = {perm.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Order matters (arrangements, sequences)</p>
              </div>
              <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
                <span className="text-xs font-bold text-slate-500 uppercase">Combinations (nCr = n! / (r!(n-r)!))</span>
                <div className="text-3xl font-extrabold font-mono text-indigo-600 mt-2">
                  C({n}, {r}) = {comb.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Order does not matter (subsets, committees)</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Percentage Tab */}
      {activeTab === 'percentage' && (
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-700">What is</span>
            <input
              type="number"
              value={percentVal}
              onChange={e => setPercentVal(e.target.value)}
              className="w-20 bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono text-center"
            />
            <span className="text-xs font-bold text-slate-700">% of</span>
            <input
              type="number"
              value={totalVal}
              onChange={e => setTotalVal(e.target.value)}
              className="w-28 bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono text-center"
            />
            <span className="text-xs font-bold text-slate-700">?</span>
          </div>

          <div className="p-4 bg-white rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500">Calculated Value:</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {calculatedPercent.toFixed(4)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
