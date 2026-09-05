import React, { useState } from 'react';
import {
  TrendingUp,
  Download,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { ScientificEngine } from '../../services/scientificEngine';
import { ReportGenerator } from '../../services/reportGenerator';
import { LinearRegressionResult } from '../../types';

export const RegressionTool: React.FC = () => {
  const [dataText, setDataText] = useState<string>(
    '1, 2.1\n2, 3.8\n3, 5.2\n4, 6.9\n5, 8.1\n6, 9.7\n7, 11.2\n8, 12.8\n9, 14.5\n10, 16.1'
  );
  const [predictX, setPredictX] = useState<string>('12');
  const [predictedY, setPredictedY] = useState<number | null>(null);

  const [regression, setRegression] = useState<LinearRegressionResult | null>(() => {
    try {
      const pairs = [
        [1, 2.1], [2, 3.8], [3, 5.2], [4, 6.9], [5, 8.1],
        [6, 9.7], [7, 11.2], [8, 12.8], [9, 14.5], [10, 16.1]
      ];
      return ScientificEngine.calculateLinearRegression(
        pairs.map(p => p[0]),
        pairs.map(p => p[1])
      );
    } catch {
      return null;
    }
  });
  const [error, setError] = useState<string | null>(null);

  const calculateRegression = (text: string) => {
    setError(null);
    try {
      const lines = text.trim().split('\n').filter(Boolean);
      const xVals: number[] = [];
      const yVals: number[] = [];

      lines.forEach((line, idx) => {
        const parts = line.split(/[\s,;\t]+/).filter(Boolean);
        if (parts.length < 2) {
          throw new Error(`Row ${idx + 1} does not have both X and Y coordinates: "${line}"`);
        }
        const x = Number(parts[0]);
        const y = Number(parts[1]);
        if (isNaN(x) || isNaN(y)) {
          throw new Error(`Invalid number on row ${idx + 1}: [${parts[0]}, ${parts[1]}]`);
        }
        xVals.push(x);
        yVals.push(y);
      });

      const res = ScientificEngine.calculateLinearRegression(xVals, yVals);
      setRegression(res);

      if (predictX) {
        const pVal = Number(predictX);
        if (!isNaN(pVal)) {
          setPredictedY(parseFloat((res.slope * pVal + res.intercept).toFixed(4)));
        }
      }
    } catch (err: any) {
      setError(err.message);
      setRegression(null);
    }
  };

  const handlePredict = () => {
    if (!regression) return;
    const x = Number(predictX);
    if (isNaN(x)) return;
    const yHat = regression.slope * x + regression.intercept;
    setPredictedY(parseFloat(yHat.toFixed(4)));
  };

  const loadPreset = (type: 'study' | 'speed') => {
    let preset = '';
    if (type === 'study') {
      // Study Hours vs Test Score
      preset = '2, 58\n3, 64\n4, 68\n5, 74\n6, 79\n7, 83\n8, 88\n9, 93\n10, 97';
    } else {
      // Speed vs Braking Distance
      preset = '20, 20\n30, 45\n40, 80\n50, 125\n60, 180\n70, 245';
    }
    setDataText(preset);
    calculateRegression(preset);
  };

  const handleDownloadPdf = () => {
    if (!regression) return;
    const blob = ReportGenerator.generateRegressionReport(regression);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ConvertAnyFile_Linear_Regression_Report_${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-sky-600" />
            <span>Correlation & Linear Regression Lab</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ordinary Least Squares (OLS), Pearson's r, R² determination, predictions, and scatter fitting.
          </p>
        </div>

        {regression && (
          <button
            id="regression-export-pdf-btn"
            type="button"
            onClick={handleDownloadPdf}
            className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Regression PDF</span>
          </button>
        )}
      </div>

      {/* Input Form */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700">
            Coordinate Pairs (X, Y) — One pair per line
          </label>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Load Preset:</span>
            <button
              type="button"
              onClick={() => loadPreset('study')}
              className="px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px]"
            >
              Study vs Score
            </button>
            <button
              type="button"
              onClick={() => loadPreset('speed')}
              className="px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px]"
            >
              Speed vs Distance
            </button>
          </div>
        </div>

        <textarea
          id="regression-input-textarea"
          rows={4}
          value={dataText}
          onChange={e => {
            setDataText(e.target.value);
            calculateRegression(e.target.value);
          }}
          className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
          placeholder="e.g.&#10;1, 2.5&#10;2, 4.8&#10;3, 7.1"
        />

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Regression Results */}
      {regression && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Model Equation</span>
              <div className="text-base font-bold font-mono text-sky-600 mt-1">{regression.formula}</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Pearson Correlation (r)</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{regression.r}</div>
              <span className="text-[10px] text-slate-500">
                {Math.abs(regression.r) > 0.8 ? 'Strong linear correlation' : 'Moderate correlation'}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">R² Determination</span>
              <div className="text-xl font-bold text-indigo-600 mt-1">{regression.rSquared}</div>
              <span className="text-[10px] text-slate-500">
                {(regression.rSquared * 100).toFixed(1)}% variance explained
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Slope (m) & Intercept (b)</span>
              <div className="text-xs font-mono text-slate-800 mt-1">
                <div>m = {regression.slope}</div>
                <div>b = {regression.intercept}</div>
              </div>
            </div>
          </div>

          {/* Interactive Prediction Calculator */}
          <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-sky-600" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Model Prediction Engine</h4>
                <p className="text-[11px] text-slate-500">Calculate Ŷ for any prospective input X</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="flex items-center space-x-1">
                <span className="text-xs font-mono font-bold text-slate-700">X =</span>
                <input
                  type="number"
                  value={predictX}
                  onChange={e => {
                    setPredictX(e.target.value);
                    const v = Number(e.target.value);
                    if (!isNaN(v) && regression) {
                      setPredictedY(parseFloat((regression.slope * v + regression.intercept).toFixed(4)));
                    }
                  }}
                  className="w-24 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900"
                />
              </div>
              <ArrowRight className="w-4 h-4 text-sky-600" />
              <div className="px-3 py-1.5 rounded-lg bg-white border border-sky-300 text-xs font-mono font-bold text-sky-700">
                Ŷ = {predictedY !== null ? predictedY : '—'}
              </div>
            </div>
          </div>

          {/* Scatter Plot & Fitted Line Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Scatter Plot & Fitted OLS Regression Line</h3>
            <p className="text-xs text-slate-500 mb-4">Empirical data points vs theoretical regression trajectory</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={regression.points}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="x" type="number" domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: 8, border: 'none', color: '#FFF', fontSize: 12 }}
                  />
                  <Scatter name="Actual Observations (Y)" dataKey="y" fill="#0284C7" />
                  <Line type="monotone" dataKey="yPred" name="Fitted Line (Ŷ)" stroke="#6366F1" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
