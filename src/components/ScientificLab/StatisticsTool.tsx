import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Download,
  Upload,
  AlertCircle,
  TrendingUp,
  BarChart2,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ScientificEngine } from '../../services/scientificEngine';
import { ReportGenerator } from '../../services/reportGenerator';
import { DescriptiveStatistics } from '../../types';
import Papa from 'papaparse';

export const StatisticsTool: React.FC = () => {
  const [inputMode, setInputMode] = useState<'manual' | 'csv'>('manual');
  const [manualInput, setManualInput] = useState<string>('24, 28, 31, 35, 36, 38, 42, 45, 49, 52, 58, 62, 75, 98');
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [csvData, setCsvData] = useState<Record<string, any>[]>([]);
  const [stats, setStats] = useState<DescriptiveStatistics | null>(() => {
    try {
      const nums = [24, 28, 31, 35, 36, 38, 42, 45, 49, 52, 58, 62, 75, 98];
      return ScientificEngine.calculateDescriptiveStats(nums);
    } catch {
      return null;
    }
  });
  const [error, setError] = useState<string | null>(null);

  // Pre-load preset datasets
  const loadPreset = (preset: 'marks' | 'temperatures' | 'outliers') => {
    setInputMode('manual');
    let dataStr = '';
    if (preset === 'marks') {
      dataStr = '55, 62, 68, 70, 72, 75, 76, 78, 81, 84, 88, 92, 95';
    } else if (preset === 'temperatures') {
      dataStr = '22.4, 23.1, 22.8, 24.5, 25.0, 24.8, 23.9, 24.2, 25.5, 26.1, 23.7';
    } else {
      // Dataset with obvious outlier
      dataStr = '12, 14, 15, 15, 16, 17, 18, 18, 19, 20, 21, 65, 82';
    }
    setManualInput(dataStr);
    calculateFromManual(dataStr);
  };

  const calculateFromManual = (text: string) => {
    setError(null);
    try {
      const parts = text.split(/[\s,;\t\n]+/).filter(Boolean);
      const nums = parts.map(p => {
        const n = Number(p);
        if (isNaN(n)) throw new Error(`Invalid numeric entry: "${p}"`);
        return n;
      });

      if (nums.length === 0) {
        throw new Error('Please enter at least one numeric value.');
      }

      const res = ScientificEngine.calculateDescriptiveStats(nums);
      setStats(res);
    } catch (err: any) {
      setError(err.message);
      setStats(null);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          setError('Uploaded CSV contains no rows.');
          return;
        }
        const data = results.data as Record<string, any>[];
        const cols = Object.keys(data[0] || {});
        setCsvColumns(cols);
        setCsvData(data);

        // Auto-select first numeric column
        const firstNumCol = cols.find(col => {
          const sample = data.slice(0, 5).map(r => r[col]);
          return sample.some(v => typeof v === 'number' && !isNaN(v));
        }) || cols[0];

        setSelectedColumn(firstNumCol);
        calculateFromCsvColumn(data, firstNumCol);
      },
      error: (err) => {
        setError(`CSV parse error: ${err.message}`);
      }
    });
  };

  const calculateFromCsvColumn = (data: Record<string, any>[], col: string) => {
    setError(null);
    try {
      const nums = data
        .map(r => Number(r[col]))
        .filter(v => !isNaN(v) && isFinite(v));

      if (nums.length === 0) {
        throw new Error(`Column "${col}" contains no valid numeric values.`);
      }

      const res = ScientificEngine.calculateDescriptiveStats(nums);
      setStats(res);
    } catch (err: any) {
      setError(err.message);
      setStats(null);
    }
  };

  // Prepare Histogram Bin Data for Recharts
  const histogramData = useMemo(() => {
    if (!stats || stats.count < 3) return [];
    const min = stats.min;
    const max = stats.max;
    const binCount = Math.min(8, Math.max(4, Math.round(Math.sqrt(stats.count))));
    const binSize = (max - min) / binCount || 1;

    const bins = Array.from({ length: binCount }, (_, i) => ({
      range: `${(min + i * binSize).toFixed(1)}-${(min + (i + 1) * binSize).toFixed(1)}`,
      count: 0
    }));

    stats.zScores.forEach(({ value }) => {
      let idx = Math.floor((value - min) / binSize);
      if (idx >= binCount) idx = binCount - 1;
      if (idx < 0) idx = 0;
      bins[idx].count++;
    });

    return bins;
  }, [stats]);

  const handleDownloadPdf = () => {
    if (!stats) return;
    const blob = ReportGenerator.generateStatisticsReport(stats, inputMode === 'csv' ? `CSV [${selectedColumn}]` : 'Manual Observations');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ConvertAnyFile_Descriptive_Statistics_Report_${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-sky-600" />
            <span>Descriptive Statistics Lab</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sample variance (n-1 Bessel's correction), quartiles, IQR, Tukey fence outlier detection, and PDF reporting.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {stats && (
            <button
              id="stats-export-pdf-btn"
              type="button"
              onClick={handleDownloadPdf}
              className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Input Mode Selector */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setInputMode('manual')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                inputMode === 'manual' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Manual Numbers
            </button>
            <button
              type="button"
              onClick={() => setInputMode('csv')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                inputMode === 'csv' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Upload CSV Dataset
            </button>
          </div>

          {inputMode === 'manual' && (
            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
              <span className="hidden sm:inline">Quick Presets:</span>
              <button
                type="button"
                onClick={() => loadPreset('marks')}
                className="px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px]"
              >
                Exam Marks
              </button>
              <button
                type="button"
                onClick={() => loadPreset('temperatures')}
                className="px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px]"
              >
                Sensors
              </button>
              <button
                type="button"
                onClick={() => loadPreset('outliers')}
                className="px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-rose-700 text-[11px]"
              >
                Outlier Test
              </button>
            </div>
          )}
        </div>

        {inputMode === 'manual' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Enter Numeric Observations (comma, space, or newline separated)
            </label>
            <textarea
              id="stats-manual-input"
              rows={3}
              value={manualInput}
              onChange={e => {
                setManualInput(e.target.value);
                calculateFromManual(e.target.value);
              }}
              placeholder="e.g. 12, 15, 18.5, 22, 25.4, 30"
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="cursor-pointer px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2 shadow-xs">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Select CSV File</span>
                <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
              </label>

              {csvColumns.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-600 font-medium">Select Numerical Column:</span>
                  <select
                    value={selectedColumn}
                    onChange={e => {
                      setSelectedColumn(e.target.value);
                      calculateFromCsvColumn(csvData, e.target.value);
                    }}
                    className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
                  >
                    {csvColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Section */}
      {stats && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Count (N)</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{stats.count}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Mean (x̄)</span>
              <div className="text-xl font-bold text-sky-600 mt-1">{stats.mean}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Median (Q₂)</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{stats.median}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Std Deviation (s)</span>
              <div className="text-xl font-bold text-indigo-600 mt-1">{stats.stdDev}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Variance (s²)</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{stats.variance}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">IQR (Q₃ - Q₁)</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">{stats.iqr}</div>
            </div>
          </div>

          {/* Detailed Statistics Table & Frequency Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Table */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                <span>Statistical Parameter Analysis</span>
              </h3>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Sum of Observations (∑x)</span>
                  <span className="font-mono font-semibold text-slate-800">{stats.sum}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Mode</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {stats.mode.length > 0 ? stats.mode.join(', ') : 'None'}
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Minimum Value</span>
                  <span className="font-mono font-semibold text-slate-800">{stats.min}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Maximum Value</span>
                  <span className="font-mono font-semibold text-slate-800">{stats.max}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Range (Max - Min)</span>
                  <span className="font-mono font-semibold text-slate-800">{stats.range}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">First Quartile (Q₁ - 25th)</span>
                  <span className="font-mono font-semibold text-slate-800">{stats.q1}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Third Quartile (Q₃ - 75th)</span>
                  <span className="font-mono font-semibold text-slate-800">{stats.q3}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Sample Skewness</span>
                  <span className="font-mono font-semibold text-slate-800">{stats.skewness}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Excess Kurtosis</span>
                  <span className="font-mono font-semibold text-slate-800">{stats.kurtosis}</span>
                </div>
              </div>

              {/* Outliers Box */}
              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Tukey 1.5×IQR Outlier Detection</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    [{stats.q1 - 1.5 * stats.iqr} to {stats.q3 + 1.5 * stats.iqr}]
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {stats.outliers.length > 0 ? (
                    stats.outliers.map((o, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-mono font-bold text-xs border border-rose-200"
                      >
                        {o} (Outlier)
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-700 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>No outliers detected outside Tukey bounds.</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Frequency Histogram Chart */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center space-x-2">
                  <BarChart2 className="w-4 h-4 text-indigo-600" />
                  <span>Sample Frequency Distribution</span>
                </h3>
                <p className="text-xs text-slate-500 mb-4">Partitioned into discrete value ranges</p>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={histogramData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: 8, border: 'none', color: '#FFF', fontSize: 12 }}
                      itemStyle={{ color: '#38BDF8' }}
                    />
                    <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-slate-400 mt-3 text-center">
                Visualizing distribution symmetry and cluster density
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
