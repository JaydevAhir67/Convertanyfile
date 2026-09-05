import React, { useState } from 'react';
import {
  Binary,
  Download,
  AlertCircle,
  Play,
  CheckCircle2,
  HelpCircle,
  Activity
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ScientificEngine } from '../../services/scientificEngine';
import { ReportGenerator } from '../../services/reportGenerator';
import { RootFindingResult } from '../../types';

export const NumericalMethodsTool: React.FC = () => {
  const [method, setMethod] = useState<'bisection' | 'newton' | 'secant' | 'regula_falsi'>('bisection');
  const [equation, setEquation] = useState<string>('x^3 - x - 2');
  const [paramA, setParamA] = useState<string>('1');
  const [paramB, setParamB] = useState<string>('2');
  const [x0, setX0] = useState<string>('1.5');
  const [x1, setX1] = useState<string>('2.0');
  const [tolerance, setTolerance] = useState<string>('0.0001');
  const [maxIterations, setMaxIterations] = useState<string>('25');

  const [result, setResult] = useState<RootFindingResult | null>(() => {
    try {
      return ScientificEngine.bisectionMethod('x^3 - x - 2', 1, 2, 0.0001, 25);
    } catch {
      return null;
    }
  });
  const [error, setError] = useState<string | null>(null);

  const handleCompute = () => {
    setError(null);
    try {
      const tol = Number(tolerance) || 1e-4;
      const maxIter = Number(maxIterations) || 30;

      let res: RootFindingResult;
      if (method === 'bisection') {
        const a = Number(paramA);
        const b = Number(paramB);
        if (isNaN(a) || isNaN(b)) throw new Error('Interval endpoints [a, b] must be valid numbers.');
        res = ScientificEngine.bisectionMethod(equation, a, b, tol, maxIter);
      } else if (method === 'newton') {
        const guess = Number(x0);
        if (isNaN(guess)) throw new Error('Initial guess x₀ must be a valid number.');
        res = ScientificEngine.newtonRaphsonMethod(equation, guess, tol, maxIter);
      } else if (method === 'secant') {
        const xA = Number(x0);
        const xB = Number(x1);
        if (isNaN(xA) || isNaN(xB)) throw new Error('Both initial points x₀ and x₁ must be numbers.');
        res = ScientificEngine.secantMethod(equation, xA, xB, tol, maxIter);
      } else {
        const a = Number(paramA);
        const b = Number(paramB);
        if (isNaN(a) || isNaN(b)) throw new Error('Interval endpoints [a, b] must be numbers.');
        res = ScientificEngine.regulaFalsiMethod(equation, a, b, tol, maxIter);
      }

      setResult(res);
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    }
  };

  const loadPresetEquation = (presetEq: string, a: string, b: string, guess: string) => {
    setEquation(presetEq);
    setParamA(a);
    setParamB(b);
    setX0(guess);
    setX1(b);
  };

  const handleDownloadPdf = () => {
    if (!result) return;
    const blob = ReportGenerator.generateRootFindingReport(result);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ConvertAnyFile_Root_Finding_${result.method}_${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Binary className="w-5 h-5 text-sky-600" />
            <span>Numerical Root Finding Lab</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Iterative methods: Bisection, Newton-Raphson, Secant, and Regula Falsi with complete convergence tracing.
          </p>
        </div>

        {result && (
          <button
            id="roots-export-pdf-btn"
            type="button"
            onClick={handleDownloadPdf}
            className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Iteration Report PDF</span>
          </button>
        )}
      </div>

      {/* Method Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'bisection', label: 'Bisection Method', badge: 'Linear O(h)' },
          { id: 'newton', label: 'Newton-Raphson', badge: 'Quadratic O(h²)' },
          { id: 'secant', label: 'Secant Method', badge: 'Superlinear p≈1.618' },
          { id: 'regula_falsi', label: 'Regula Falsi', badge: 'False Position' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setMethod(tab.id as any);
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
              method === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                method === tab.id ? 'bg-sky-500/30 text-sky-200' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Configuration Panel */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
        {/* Presets */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700">Equation f(x) = 0</label>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <span>Presets:</span>
            <button
              type="button"
              onClick={() => loadPresetEquation('x^3 - x - 2', '1', '2', '1.5')}
              className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px]"
            >
              x³ - x - 2
            </button>
            <button
              type="button"
              onClick={() => loadPresetEquation('x^3 - 4*x - 9', '2', '3', '2.5')}
              className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px]"
            >
              x³ - 4x - 9
            </button>
            <button
              type="button"
              onClick={() => loadPresetEquation('cos(x) - x', '0', '1', '0.5')}
              className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px]"
            >
              cos(x) - x
            </button>
          </div>
        </div>

        {/* Equation Input */}
        <div className="relative">
          <input
            id="equation-input"
            type="text"
            value={equation}
            onChange={e => setEquation(e.target.value)}
            placeholder="e.g. x^3 - x - 2"
            className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm font-mono font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {/* Method-specific Parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {method === 'bisection' || method === 'regula_falsi' ? (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Lower Bound (a)</label>
                <input
                  type="number"
                  step="any"
                  value={paramA}
                  onChange={e => setParamA(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Upper Bound (b)</label>
                <input
                  type="number"
                  step="any"
                  value={paramB}
                  onChange={e => setParamB(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                />
              </div>
            </>
          ) : method === 'newton' ? (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Initial Guess (x₀)</label>
              <input
                type="number"
                step="any"
                value={x0}
                onChange={e => setX0(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Point x₀</label>
                <input
                  type="number"
                  step="any"
                  value={x0}
                  onChange={e => setX0(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Point x₁</label>
                <input
                  type="number"
                  step="any"
                  value={x1}
                  onChange={e => setX1(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tolerance (ε)</label>
            <input
              type="text"
              value={tolerance}
              onChange={e => setTolerance(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Max Iterations</label>
            <input
              type="number"
              value={maxIterations}
              onChange={e => setMaxIterations(e.target.value)}
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
          id="solve-root-btn"
          type="button"
          onClick={handleCompute}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Execute {method.toUpperCase()} Solver</span>
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900">
                  Approximate Root x* = <span className="font-mono">{result.root}</span>
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">{result.message}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-800 bg-emerald-100/70 px-3 py-1.5 rounded-lg">
              <span>Iterations: {result.iterationsCount}</span>
              <span>•</span>
              <span>f(x*) = {ScientificEngine.evaluateMath(result.equation, result.root).toExponential(3)}</span>
            </div>
          </div>

          {/* Convergence Error Plot */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-sky-600" />
              <span>Convergence Error Trajectory (|x_k - x_{'{k-1}'}|)</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">Tracking asymptotic error reduction per iteration</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.iterations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="iteration" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: 8, border: 'none', color: '#FFF', fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="error" stroke="#0284C7" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Complete Iteration Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Full Step-by-Step Iteration Table
              </h3>
              <span className="text-[11px] text-slate-500">
                Formula tolerance ε = {result.tolerance}
              </span>
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 text-slate-600 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Iter (k)</th>
                    {result.iterations[0]?.a !== undefined && <th className="py-2.5 px-3">a_k</th>}
                    {result.iterations[0]?.b !== undefined && <th className="py-2.5 px-3">b_k</th>}
                    <th className="py-2.5 px-3">x_k (Estimate)</th>
                    <th className="py-2.5 px-3">f(x_k)</th>
                    <th className="py-2.5 px-3">Absolute Error |Δx|</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.iterations.map(row => (
                    <tr key={row.iteration} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-800">{row.iteration}</td>
                      {row.a !== undefined && <td className="py-2 px-3 text-slate-600">{row.a}</td>}
                      {row.b !== undefined && <td className="py-2 px-3 text-slate-600">{row.b}</td>}
                      <td className="py-2 px-3 font-bold text-sky-700">{row.x}</td>
                      <td className="py-2 px-3 text-slate-700">{row.fx}</td>
                      <td className="py-2 px-3 text-emerald-700 font-semibold">{row.error.toExponential(4)}</td>
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
