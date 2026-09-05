import React, { useState } from 'react';
import {
  Sigma,
  Download,
  AlertCircle,
  Play,
  CheckCircle2,
  Info
} from 'lucide-react';
import { ScientificEngine } from '../../services/scientificEngine';
import { ReportGenerator } from '../../services/reportGenerator';
import { NumericalIntegrationResult } from '../../types';

export const NumericalIntegrationTool: React.FC = () => {
  const [method, setMethod] = useState<'trapezoidal' | 'simpson_1_3'>('simpson_1_3');
  const [equation, setEquation] = useState<string>('1 / (1 + x^2)');
  const [paramA, setParamA] = useState<string>('0');
  const [paramB, setParamB] = useState<string>('1');
  const [intervals, setIntervals] = useState<string>('6');

  const [result, setResult] = useState<NumericalIntegrationResult | null>(() => {
    try {
      return ScientificEngine.simpsonsOneThirdRule('1 / (1 + x^2)', 0, 1, 6);
    } catch {
      return null;
    }
  });
  const [error, setError] = useState<string | null>(null);

  const handleCompute = () => {
    setError(null);
    try {
      const a = Number(paramA);
      const b = Number(paramB);
      const n = Number(intervals);

      if (isNaN(a) || isNaN(b) || isNaN(n)) {
        throw new Error('All limits and interval counts must be valid numbers.');
      }
      if (a >= b) {
        throw new Error('Lower limit (a) must be strictly less than upper limit (b).');
      }
      if (n < 2) {
        throw new Error('Number of intervals (n) must be at least 2.');
      }

      let res: NumericalIntegrationResult;
      if (method === 'trapezoidal') {
        res = ScientificEngine.trapezoidalRule(equation, a, b, n);
      } else {
        res = ScientificEngine.simpsonsOneThirdRule(equation, a, b, n);
      }
      setResult(res);
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    }
  };

  const loadPreset = (eq: string, a: string, b: string, n: string) => {
    setEquation(eq);
    setParamA(a);
    setParamB(b);
    setIntervals(n);
  };

  const handleDownloadPdf = () => {
    if (!result) return;
    const blob = ReportGenerator.generateIntegrationReport(result);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ConvertAnyFile_Integration_${result.method}_${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Sigma className="w-5 h-5 text-sky-600" />
            <span>Numerical Quadrature & Integration Lab</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Definite integral evaluation using Trapezoidal Rule and Simpson's 1/3 Rule with composite weights.
          </p>
        </div>

        {result && (
          <button
            id="integration-export-pdf-btn"
            type="button"
            onClick={handleDownloadPdf}
            className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF Quadrature Report</span>
          </button>
        )}
      </div>

      {/* Method Selection Tabs */}
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setMethod('simpson_1_3')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
            method === 'simpson_1_3' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <span>Simpson's 1/3 Rule</span>
          <span className="px-1.5 py-0.2 rounded bg-sky-500/30 text-sky-200 text-[10px] font-mono">
            Error O(h⁴)
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMethod('trapezoidal')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
            method === 'trapezoidal' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <span>Trapezoidal Rule</span>
          <span className="px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 text-[10px] font-mono">
            Error O(h²)
          </span>
        </button>
      </div>

      {/* Input Form */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700">Integrand Function f(x)</label>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <span>Standard PSC Presets:</span>
            <button
              type="button"
              onClick={() => loadPreset('1 / (1 + x^2)', '0', '1', '6')}
              className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px]"
            >
              1 / (1 + x²) [π/4]
            </button>
            <button
              type="button"
              onClick={() => loadPreset('sin(x)', '0', '3.14159', '6')}
              className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px]"
            >
              sin(x) [0 to π]
            </button>
            <button
              type="button"
              onClick={() => loadPreset('exp(x)', '0', '2', '4')}
              className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px]"
            >
              e^x [0 to 2]
            </button>
          </div>
        </div>

        <input
          type="text"
          value={equation}
          onChange={e => setEquation(e.target.value)}
          placeholder="e.g. 1 / (1 + x^2)"
          className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm font-mono font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Lower Limit (a)</label>
            <input
              type="number"
              step="any"
              value={paramA}
              onChange={e => setParamA(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Upper Limit (b)</label>
            <input
              type="number"
              step="any"
              value={paramB}
              onChange={e => setParamB(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Number of Intervals (n) {method === 'simpson_1_3' && '(Even required)'}
            </label>
            <input
              type="number"
              step="2"
              value={intervals}
              onChange={e => setIntervals(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleCompute}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Compute Definite Integral</span>
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Main Integral Card */}
          <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                Definite Integral Result
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-950 mt-0.5">
                I ≈ {result.result}
              </div>
              <p className="text-xs text-emerald-800 mt-1 font-mono">
                {result.formulaDescription}
              </p>
            </div>
            <div className="bg-emerald-100/80 px-3.5 py-2 rounded-lg text-xs font-mono text-emerald-900">
              <div>Intervals n = {result.n}</div>
              <div>Step Size h = {result.h}</div>
            </div>
          </div>

          {/* Steps Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Partition Grid Node Evaluation Table
              </h3>
              <span className="text-[11px] text-slate-500">
                Sum of terms = {(result.steps.reduce((a, b) => a + b.term, 0)).toFixed(6)}
              </span>
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 text-slate-600 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Node (i)</th>
                    <th className="py-2.5 px-3">x_i (Coordinate)</th>
                    <th className="py-2.5 px-3">f(x_i) (Ordinate)</th>
                    <th className="py-2.5 px-3">Weight (w_i)</th>
                    <th className="py-2.5 px-3">Weighted Term (w_i × f(x_i))</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.steps.map(step => (
                    <tr key={step.i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-800">{step.i}</td>
                      <td className="py-2 px-3 text-slate-600">{step.x}</td>
                      <td className="py-2 px-3 text-slate-700">{step.fx}</td>
                      <td className="py-2 px-3 font-bold text-indigo-600">{step.weight}</td>
                      <td className="py-2 px-3 font-mono font-semibold text-emerald-700">{step.term}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
