import React, { useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  Binary,
  Sigma,
  Grid,
  Calculator,
  FileSpreadsheet
} from 'lucide-react';
import { StatisticsTool } from './StatisticsTool';
import { RegressionTool } from './RegressionTool';
import { NumericalMethodsTool } from './NumericalMethodsTool';
import { NumericalIntegrationTool } from './NumericalIntegrationTool';
import { MatrixCalculator } from './MatrixCalculator';
import { BasicMathTool } from './BasicMathTool';

export type LabSubTab =
  | 'statistics'
  | 'regression'
  | 'roots'
  | 'integration'
  | 'matrix'
  | 'basic_math';

export const ScientificLabView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<LabSubTab>('statistics');

  const tools = [
    {
      id: 'statistics' as LabSubTab,
      label: 'Descriptive Statistics',
      icon: <BarChart2 className="w-4 h-4" />,
      desc: 'Mean, Median, Mode, Variance (s²), Std Dev, Quartiles, IQR, Outliers'
    },
    {
      id: 'regression' as LabSubTab,
      label: 'Linear Regression',
      icon: <TrendingUp className="w-4 h-4" />,
      desc: 'OLS best-fit, Pearson r, R² determination, scatter plot & predictions'
    },
    {
      id: 'roots' as LabSubTab,
      label: 'Numerical Root Finding',
      icon: <Binary className="w-4 h-4" />,
      desc: 'Bisection, Newton-Raphson, Secant, Regula Falsi iteration tables'
    },
    {
      id: 'integration' as LabSubTab,
      label: 'Numerical Integration',
      icon: <Sigma className="w-4 h-4" />,
      desc: "Trapezoidal & Simpson's 1/3 rules, partition weights, integral calculation"
    },
    {
      id: 'matrix' as LabSubTab,
      label: 'Matrix & Linear Systems',
      icon: <Grid className="w-4 h-4" />,
      desc: 'Matrix arithmetic, determinant, inverse, Gauss-Jordan solver AX=B'
    },
    {
      id: 'basic_math' as LabSubTab,
      label: 'Basic Scientific Math',
      icon: <Calculator className="w-4 h-4" />,
      desc: 'Compound interest, permutations (nPr), combinations (nCr)'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-1">
        <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          Scientific Calculators
        </div>
        {tools.map(tool => {
          const isActive = activeSubTab === tool.id;
          return (
            <button
              key={tool.id}
              id={`lab-subtab-${tool.id}`}
              onClick={() => setActiveSubTab(tool.id)}
              className={`w-full text-left p-3 rounded-xl flex items-start space-x-3 transition-all ${
                isActive
                  ? 'bg-sky-50 border border-sky-200 text-sky-950 shadow-xs'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div
                className={`p-2 rounded-lg mt-0.5 ${
                  isActive ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tool.icon}
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-xs leading-tight">{tool.label}</div>
                <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{tool.desc}</div>
              </div>
            </button>
          );
        })}

        {/* Academic Note */}
        <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
          <span className="font-bold text-slate-700 block mb-0.5">PSC Syllabus Alignment:</span>
          Fully conforms to standard university curriculum for Numerical Methods, Statistics, and Matrix Computing with downloadable PDF evidence.
        </div>
      </div>

      {/* Main Lab Content Area */}
      <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs min-h-[600px]">
        {activeSubTab === 'statistics' && <StatisticsTool />}
        {activeSubTab === 'regression' && <RegressionTool />}
        {activeSubTab === 'roots' && <NumericalMethodsTool />}
        {activeSubTab === 'integration' && <NumericalIntegrationTool />}
        {activeSubTab === 'matrix' && <MatrixCalculator />}
        {activeSubTab === 'basic_math' && <BasicMathTool />}
      </div>
    </div>
  );
};
