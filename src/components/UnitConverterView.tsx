import React, { useState } from 'react';
import {
  Scale,
  ArrowRightLeft,
  Info,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { UnitEngine } from '../services/unitEngine';

export const UnitConverterView: React.FC = () => {
  const categories = UnitEngine.getCategories();
  const [activeCategory, setActiveCategory] = useState<string>('length');

  const availableUnits = UnitEngine.getUnitsForCategory(activeCategory);
  const [fromUnit, setFromUnit] = useState<string>(availableUnits[0] || 'meter');
  const [toUnit, setToUnit] = useState<string>(availableUnits[1] || 'kilometer');
  const [inputValue, setInputValue] = useState<string>('100');

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    const units = UnitEngine.getUnitsForCategory(cat);
    setFromUnit(units[0] || '');
    setToUnit(units[1] || units[0] || '');
  };

  const numVal = Number(inputValue) || 0;
  const converted = UnitEngine.convert(numVal, fromUnit, toUnit);
  const formulaExplanation = UnitEngine.explainFormula(fromUnit, toUnit);

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Scale className="w-5 h-5 text-sky-600" />
            <span>Scientific Unit Conversion Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            High-precision dimensional conversion across 7 physical and computational metric scales.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              activeCategory === cat
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Converter Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
          {/* From */}
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-slate-600">From</label>
            <input
              type="number"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-900 text-lg focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <select
              value={fromUnit}
              onChange={e => setFromUnit(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 capitalize"
            >
              {availableUnits.map(u => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="sm:col-span-1 flex justify-center">
            <button
              type="button"
              onClick={swapUnits}
              className="p-3 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-600 transition-colors shadow-xs"
              title="Swap units"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* To */}
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-slate-600">To</label>
            <div className="w-full bg-sky-50 border border-sky-200 rounded-xl p-3 font-mono font-bold text-sky-950 text-lg overflow-x-auto">
              {converted.result}
            </div>
            <select
              value={toUnit}
              onChange={e => setToUnit(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 capitalize"
            >
              {availableUnits.map(u => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Formula Badge */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2 text-xs text-slate-600">
          <Info className="w-4 h-4 text-sky-600 flex-shrink-0" />
          <span>
            Conversion Logic: <strong className="text-slate-800">{formulaExplanation}</strong>
          </span>
        </div>
      </div>

      {/* Comparative Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs max-w-2xl mx-auto">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Quick Unit Reference Benchmarks ({numVal} {fromUnit})
        </h3>
        <div className="divide-y divide-slate-100 text-xs">
          {availableUnits.map(target => (
            <div key={target} className="py-2 flex justify-between items-center">
              <span className="capitalize text-slate-600">{target}</span>
              <span className="font-mono font-bold text-slate-900">
                {UnitEngine.convert(numVal, fromUnit, target).result}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
