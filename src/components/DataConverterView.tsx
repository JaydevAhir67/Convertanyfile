import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertCircle,
  Table as TableIcon
} from 'lucide-react';
import { DataEngine, DataProfilingResult } from '../services/dataEngine';
import Papa from 'papaparse';
import { ConversionRocketModal } from './ConversionRocketModal';

export const DataConverterView: React.FC = () => {
  const [sourceFormat, setSourceFormat] = useState<'csv' | 'json' | 'xml'>('csv');
  const [targetFormat, setTargetFormat] = useState<'json' | 'csv' | 'xlsx' | 'xml'>('json');
  const [inputText, setInputText] = useState<string>(
    `id,name,department,gpa,credits_completed\n1,Ananya Sharma,Computer Science,3.88,86\n2,Rahul Verma,Electronics,3.42,78\n3,Pooja Patel,Mechanical,3.75,82\n4,Vikram Rao,Computer Science,3.92,90\n5,Neha Gupta,Civil,3.61,74`
  );
  const [convertedText, setConvertedText] = useState<string>('');
  const [profiling, setProfiling] = useState<DataProfilingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const handleConvert = async () => {
    setError(null);
    setIsProcessing(true);
    setProgress(20);

    try {
      await new Promise(r => setTimeout(r, 180));
      setProgress(55);

      if (sourceFormat === 'csv' && targetFormat === 'json') {
        const { jsonString, profiling: prof } = DataEngine.csvToJson(inputText);
        setConvertedText(jsonString);
        setProfiling(prof);
      } else if (sourceFormat === 'json' && targetFormat === 'csv') {
        const csvStr = DataEngine.jsonToCsv(inputText);
        setConvertedText(csvStr);
        const parsed = Papa.parse(csvStr, { header: true, dynamicTyping: true });
        setProfiling(DataEngine.profileDataset(parsed.data as any));
      } else if (sourceFormat === 'json' && targetFormat === 'xml') {
        const xml = DataEngine.jsonToXml(inputText);
        setConvertedText(xml);
      } else if (sourceFormat === 'csv' && targetFormat === 'xml') {
        const { jsonString } = DataEngine.csvToJson(inputText);
        const xml = DataEngine.jsonToXml(jsonString);
        setConvertedText(xml);
      } else if (targetFormat === 'xlsx') {
        // XLSX generation
        const xlsxBytes = DataEngine.csvToExcel(inputText);
        const blob = new Blob([xlsxBytes as any], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ConvertAnyFile_Export_${Date.now()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setConvertedText('// Excel workbook downloaded directly as binary .xlsx');
      } else {
        setConvertedText(inputText);
      }

      setProgress(100);
      // Rocket blast-off sequence
      await new Promise(r => setTimeout(r, 550));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!convertedText) return;
    const mime = targetFormat === 'json'
      ? 'application/json'
      : targetFormat === 'xml'
      ? 'application/xml'
      : 'text/csv;charset=utf-8;';
    const blob = new Blob([convertedText], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ConvertAnyFile_Export.${targetFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      setInputText(content);
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'json') {
        setSourceFormat('json');
        setTargetFormat('csv');
      } else if (ext === 'xml') {
        setSourceFormat('xml');
        setTargetFormat('json');
      } else {
        setSourceFormat('csv');
        setTargetFormat('json');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 relative">
      {isProcessing && (
        <ConversionRocketModal
          progress={progress}
          filename={`dataset.${sourceFormat}`}
          targetFormat={targetFormat.toUpperCase()}
          stageText="Transcoding tabular byte stream & serializing schema..."
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Database className="w-5 h-5 text-sky-600" />
            <span>Structured Data Engine & Profiler</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bidirectional serialization between CSV, JSON, Excel (XLSX), and XML with schema validation and missing value profiling.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 cursor-pointer shadow-xs">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Load Data File</span>
            <input type="file" accept=".csv,.json,.xml" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Conversion Bar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-slate-600">From:</span>
            <select
              value={sourceFormat}
              onChange={e => setSourceFormat(e.target.value as any)}
              className="bg-white border border-slate-300 font-bold text-slate-800 text-xs rounded-lg px-3 py-1.5 uppercase"
            >
              <option value="csv">CSV (Tabular)</option>
              <option value="json">JSON (Objects)</option>
              <option value="xml">XML (Hierarchical)</option>
            </select>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400" />

          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-slate-600">To:</span>
            <select
              value={targetFormat}
              onChange={e => setTargetFormat(e.target.value as any)}
              className="bg-white border border-slate-300 font-bold text-sky-700 text-xs rounded-lg px-3 py-1.5 uppercase"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="xlsx">Excel (XLSX)</option>
              <option value="xml">XML</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleConvert}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
        >
          Execute Data Transform
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Textarea */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Source Data ({sourceFormat.toUpperCase()})
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {inputText.length} characters
            </span>
          </div>
          <textarea
            rows={12}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {/* Output Textarea */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Converted Output ({targetFormat.toUpperCase()})
            </span>
            {convertedText && (
              <button
                type="button"
                onClick={handleDownload}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            )}
          </div>
          <textarea
            rows={12}
            readOnly
            value={convertedText || '// Click "Execute Data Transform" above to generate output...'}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs font-mono text-sky-300 focus:outline-none"
          />
        </div>
      </div>

      {/* Data Profiling Section */}
      {profiling && profiling.rowCount > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <TableIcon className="w-4 h-4 text-emerald-600" />
            <span>Automated Dataset Profiling Insights</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Rows</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">{profiling.rowCount}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Columns</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">{profiling.colCount}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Duplicate Rows</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">{profiling.duplicateRows}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Missing Cells</span>
              <div className="text-xl font-bold font-mono text-rose-600 mt-1">
                {profiling.missingValues.reduce((a, b) => a + b.count, 0)}
              </div>
            </div>
          </div>

          {/* Inferred Column Types */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Column Name</th>
                  <th className="py-2 px-3">Inferred Data Type</th>
                  <th className="py-2 px-3">Unique Values</th>
                  <th className="py-2 px-3">Null / Blank Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profiling.columnStats.map((col, i) => (
                  <tr key={i}>
                    <td className="py-2 px-3 font-semibold text-slate-800">{col.column}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                        {col.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600">{col.uniqueCount}</td>
                    <td className="py-2 px-3 text-slate-600">{col.nullCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
