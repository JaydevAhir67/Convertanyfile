import React, { useState } from 'react';
import {
  Grid,
  Download,
  AlertCircle,
  Play,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { ScientificEngine } from '../../services/scientificEngine';
import { ReportGenerator } from '../../services/reportGenerator';
import { MatrixOperationResult } from '../../types';

export const MatrixCalculator: React.FC = () => {
  const [size, setSize] = useState<number>(3);
  const [matrixA, setMatrixA] = useState<number[][]>([
    [2, 1, -1],
    [-3, -1, 2],
    [-2, 1, 2]
  ]);
  const [matrixB, setMatrixB] = useState<number[][]>([
    [1, 0, 2],
    [2, -1, 1],
    [0, 1, 3]
  ]);
  const [vectorB, setVectorB] = useState<number[]>([8, -11, -3]);
  const [activeTab, setActiveTab] = useState<'ops' | 'system'>('ops');
  const [result, setResult] = useState<MatrixOperationResult | null>(null);
  const [systemSolution, setSystemSolution] = useState<{ x: number[]; steps: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Resize matrices
  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setMatrixA(Array.from({ length: newSize }, (_, i) =>
      Array.from({ length: newSize }, (_, j) => (i === j ? 1 : 0))
    ));
    setMatrixB(Array.from({ length: newSize }, (_, i) =>
      Array.from({ length: newSize }, (_, j) => (i === j ? 2 : 1))
    ));
    setVectorB(Array(newSize).fill(1));
    setResult(null);
    setSystemSolution(null);
  };

  const handleCellChange = (mat: 'A' | 'B', r: number, c: number, val: string) => {
    const num = Number(val) || 0;
    if (mat === 'A') {
      const copy = matrixA.map(row => [...row]);
      copy[r][c] = num;
      setMatrixA(copy);
    } else {
      const copy = matrixB.map(row => [...row]);
      copy[r][c] = num;
      setMatrixB(copy);
    }
  };

  const executeOperation = (op: 'add' | 'multiply' | 'transpose' | 'det' | 'inverse') => {
    setError(null);
    try {
      let res: MatrixOperationResult;
      if (op === 'add') {
        res = ScientificEngine.matrixAdd(matrixA, matrixB);
      } else if (op === 'multiply') {
        res = ScientificEngine.matrixMultiply(matrixA, matrixB);
      } else if (op === 'transpose') {
        res = ScientificEngine.matrixTranspose(matrixA);
      } else if (op === 'det') {
        res = ScientificEngine.matrixDeterminant(matrixA);
      } else {
        res = ScientificEngine.matrixInverse(matrixA);
      }
      setResult(res);
      setSystemSolution(null);
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    }
  };

  const solveSystem = () => {
    setError(null);
    try {
      const sol = ScientificEngine.solveLinearSystem(matrixA, vectorB);
      setSystemSolution(sol);
      setResult(null);
    } catch (err: any) {
      setError(err.message);
      setSystemSolution(null);
    }
  };

  const handleDownloadPdf = () => {
    if (!result) return;
    const blob = ReportGenerator.generateMatrixReport(result);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ConvertAnyFile_Matrix_${Date.now()}.pdf`;
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
            <Grid className="w-5 h-5 text-sky-600" />
            <span>Matrix Algebra & Linear Systems Lab</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Determinants, inverses, matrix arithmetic, and Gaussian elimination solver with partial pivoting.
          </p>
        </div>

        {result && (
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Matrix PDF</span>
          </button>
        )}
      </div>

      {/* Mode & Dimension Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-700">Mode:</span>
          <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('ops')}
              className={`px-3 py-1.5 rounded-md ${activeTab === 'ops' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Matrix Arithmetic (A & B)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('system')}
              className={`px-3 py-1.5 rounded-md ${activeTab === 'system' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Solve Linear System (AX = B)
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-700">Dimension (n × n):</span>
          {[2, 3, 4].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => handleSizeChange(n)}
              className={`px-2.5 py-1 rounded text-xs font-bold font-mono transition-colors ${
                size === n ? 'bg-sky-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {n} × {n}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matrix A */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Matrix A ({size} × {size})
            </h3>
            <span className="text-[11px] text-slate-400">Primary matrix</span>
          </div>

          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
          >
            {matrixA.map((row, r) =>
              row.map((val, c) => (
                <input
                  key={`${r}-${c}`}
                  type="number"
                  step="any"
                  value={val}
                  onChange={e => handleCellChange('A', r, c, e.target.value)}
                  className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              ))
            )}
          </div>
        </div>

        {/* Matrix B or Vector B */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          {activeTab === 'ops' ? (
            <>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Matrix B ({size} × {size})
                </h3>
                <span className="text-[11px] text-slate-400">Operand for A + B, A × B</span>
              </div>
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
              >
                {matrixB.map((row, r) =>
                  row.map((val, c) => (
                    <input
                      key={`${r}-${c}`}
                      type="number"
                      step="any"
                      value={val}
                      onChange={e => handleCellChange('B', r, c, e.target.value)}
                      className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Constant Vector B ({size} × 1)
                </h3>
                <span className="text-[11px] text-slate-400">Right-hand side coefficients</span>
              </div>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                {vectorB.map((val, i) => (
                  <div key={i} className="text-center">
                    <span className="text-[10px] text-slate-500 font-mono block mb-1">b_{i + 1}</span>
                    <input
                      type="number"
                      step="any"
                      value={val}
                      onChange={e => {
                        const copy = [...vectorB];
                        copy[i] = Number(e.target.value) || 0;
                        setVectorB(copy);
                      }}
                      className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        {activeTab === 'ops' ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => executeOperation('add')}
              className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-800"
            >
              A + B (Addition)
            </button>
            <button
              type="button"
              onClick={() => executeOperation('multiply')}
              className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-800"
            >
              A × B (Multiplication)
            </button>
            <button
              type="button"
              onClick={() => executeOperation('det')}
              className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-800"
            >
              |A| (Determinant)
            </button>
            <button
              type="button"
              onClick={() => executeOperation('inverse')}
              className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-800"
            >
              A⁻¹ (Matrix Inverse)
            </button>
            <button
              type="button"
              onClick={() => executeOperation('transpose')}
              className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-800"
            >
              Aᵀ (Transpose)
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={solveSystem}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Solve Linear System AX = B (Gaussian Elimination)</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Operation Results */}
      {result && (
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-800">
              Result: {result.operation} ({result.dimensions})
            </h4>
          </div>

          {result.resultMatrix && (
            <div className="inline-block bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${result.resultMatrix[0].length}, minmax(0, 1fr))` }}
              >
                {result.resultMatrix.map((row, r) =>
                  row.map((v, c) => (
                    <div
                      key={`${r}-${c}`}
                      className="px-3 py-2 bg-white rounded border border-slate-200 text-center font-mono font-bold text-sm text-sky-700"
                    >
                      {v}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {result.scalarResult !== undefined && (
            <div className="text-2xl font-extrabold font-mono text-slate-900">
              Scalar Value = <span className="text-sky-600">{result.scalarResult}</span>
            </div>
          )}

          <div className="text-xs text-slate-500 space-y-1 pt-2">
            {result.explanation.map((exp, i) => (
              <div key={i}>• {exp}</div>
            ))}
          </div>
        </div>
      )}

      {/* Linear System Solution Results */}
      {systemSolution && (
        <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h4 className="text-sm font-bold text-emerald-950">
              Unique Solution Found (Gaussian Elimination with Partial Pivoting)
            </h4>
          </div>

          {/* Variables Output */}
          <div className="flex flex-wrap gap-3">
            {systemSolution.x.map((val, idx) => (
              <div
                key={idx}
                className="px-4 py-2 bg-white rounded-lg border border-emerald-300 font-mono text-sm font-bold text-emerald-900"
              >
                x_{idx + 1} = {val}
              </div>
            ))}
          </div>

          {/* Step log */}
          <div className="mt-3 p-3 bg-white rounded-lg border border-emerald-200 max-h-48 overflow-y-auto font-mono text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 mb-1">Algorithmic Step Execution Log:</div>
            {systemSolution.steps.map((st, i) => (
              <div key={i}>{st}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
