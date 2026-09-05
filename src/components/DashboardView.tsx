import React from 'react';
import {
  Activity,
  Layers,
  Binary,
  BarChart3,
  Cpu,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { NavTab } from './Navbar';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  jobsCount: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, jobsCount }) => {
  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold mb-3">
            <Award className="w-3.5 h-3.5 text-blue-400" />
            <span>B.Tech Computer Science Engineering • PSC Mini-Project</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            ConvertAnyFile Architecture & Performance Dashboard
          </h1>
          <p className="mt-2.5 text-slate-300 text-xs sm:text-sm leading-relaxed">
            A modular scientific computing & universal transformation suite. Decoupled micro-engines execute mathematical algorithms and file conversions entirely client-side with zero data egress.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('converter')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <span>Launch Universal Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('scientific')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 font-bold text-xs transition-colors"
            >
              Open Scientific Lab
            </button>
            <button
              type="button"
              onClick={() => onNavigate('viva')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
            >
              Viva-Voce Questions
            </button>
          </div>
        </div>
      </div>

      {/* Metric Counters (Bento Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2.5 text-blue-600 mb-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Engines</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">7 Active</div>
          <p className="text-[11px] text-slate-500 mt-1">Decoupled via ToolRegistry</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2.5 text-emerald-600 mb-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Supported Formats</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">24+ Types</div>
          <p className="text-[11px] text-slate-500 mt-1">PDF, DOCX, XLSX, MP4, WAV...</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2.5 text-indigo-600 mb-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Binary className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Numerical Solvers</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">6 Methods</div>
          <p className="text-[11px] text-slate-500 mt-1">Roots, Quadrature, Matrices</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2.5 text-amber-600 mb-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security & Privacy</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">100% Client</div>
          <p className="text-[11px] text-slate-500 mt-1">Zero server data transmission</p>
        </div>
      </div>

      {/* System Architecture Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>Universal Pipeline Architecture Flow</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            How incoming user streams are intercepted, typed, validated, and processed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs mx-auto flex items-center justify-center mb-2">
              1
            </div>
            <h3 className="font-bold text-xs text-slate-800">File Ingestion & Typing</h3>
            <p className="text-[11px] text-slate-500 mt-1">
              MIME sniffing & extension validation via client FileReader API
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs mx-auto flex items-center justify-center mb-2">
              2
            </div>
            <h3 className="font-bold text-xs text-slate-800">Registry Routing</h3>
            <p className="text-[11px] text-slate-500 mt-1">
              `ToolRegistry` resolves matching handler for input/output tuple
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs mx-auto flex items-center justify-center mb-2">
              3
            </div>
            <h3 className="font-bold text-xs text-slate-800">Mathematical / Media Core</h3>
            <p className="text-[11px] text-slate-500 mt-1">
              ScientificEngine / Canvas / Web Audio transforms raw buffers
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mx-auto flex items-center justify-center mb-2">
              4
            </div>
            <h3 className="font-bold text-xs text-slate-800">Blob Packaging & Report</h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Final Blob URL generated + jsPDF evidence generated for audit
            </p>
          </div>
        </div>
      </div>

      {/* Syllabus Matrix & Complexity Reference Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 bg-slate-50 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-800">
            Implemented PSC Numerical Algorithms & Algorithmic Time Complexity
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Algorithm / Module</th>
                <th className="py-2.5 px-4 font-semibold">PSC Category</th>
                <th className="py-2.5 px-4 font-semibold">Order of Convergence / Complexity</th>
                <th className="py-2.5 px-4 font-semibold">Guaranteed Conditions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr>
                <td className="py-2.5 px-4 font-sans font-bold text-slate-800">Bisection Method</td>
                <td className="py-2.5 px-4 font-sans text-blue-600 font-semibold">Root Finding</td>
                <td className="py-2.5 px-4">Linear (p = 1), Error halved each step</td>
                <td className="py-2.5 px-4 font-sans text-slate-500">f(a)·f(b) &lt; 0 (Continuous)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-sans font-bold text-slate-800">Newton-Raphson</td>
                <td className="py-2.5 px-4 font-sans text-blue-600 font-semibold">Root Finding</td>
                <td className="py-2.5 px-4">Quadratic (p = 2) near root</td>
                <td className="py-2.5 px-4 font-sans text-slate-500">f'(x) ≠ 0, good initial guess</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-sans font-bold text-slate-800">Secant Method</td>
                <td className="py-2.5 px-4 font-sans text-blue-600 font-semibold">Root Finding</td>
                <td className="py-2.5 px-4">Superlinear (p ≈ 1.618 Golden Ratio)</td>
                <td className="py-2.5 px-4 font-sans text-slate-500">No derivative evaluation needed</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-sans font-bold text-slate-800">Simpson's 1/3 Rule</td>
                <td className="py-2.5 px-4 font-sans text-emerald-600 font-semibold">Numerical Quadrature</td>
                <td className="py-2.5 px-4">Global Truncation Error O(h⁴)</td>
                <td className="py-2.5 px-4 font-sans text-slate-500">Even number of subintervals (n)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-sans font-bold text-slate-800">Trapezoidal Rule</td>
                <td className="py-2.5 px-4 font-sans text-emerald-600 font-semibold">Numerical Quadrature</td>
                <td className="py-2.5 px-4">Global Truncation Error O(h²)</td>
                <td className="py-2.5 px-4 font-sans text-slate-500">Any partition n ≥ 1</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-sans font-bold text-slate-800">Gaussian Elimination</td>
                <td className="py-2.5 px-4 font-sans text-indigo-600 font-semibold">Matrix Computing</td>
                <td className="py-2.5 px-4">O(n³/3) FLOPs with back-sub O(n²)</td>
                <td className="py-2.5 px-4 font-sans text-slate-500">Partial pivoting prevents /0</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-sans font-bold text-slate-800">Ordinary Least Squares</td>
                <td className="py-2.5 px-4 font-sans text-purple-600 font-semibold">Statistical Analysis</td>
                <td className="py-2.5 px-4">O(N) single-pass accumulation</td>
                <td className="py-2.5 px-4 font-sans text-slate-500">Variance of X &gt; 0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
