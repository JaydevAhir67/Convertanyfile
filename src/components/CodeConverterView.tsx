import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Play,
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { CodeEngine } from '../services/codeEngine';
import { ConversionRocketModal } from './ConversionRocketModal';

export const CodeConverterView: React.FC = () => {
  const [conversionType, setConversionType] = useState<
    'python_to_js' | 'json_to_ts' | 'md_to_html' | 'sql_to_json' | 'css_to_tailwind'
  >('python_to_js');

  const defaultSnippets: Record<string, string> = {
    python_to_js: `# Scientific calculation script in Python
import math

def calculate_energy(mass, velocity):
    kinetic = 0.5 * mass * (velocity ** 2)
    print(f"Kinetic energy: {kinetic}")
    return kinetic

def find_roots(a, b, c):
    disc = (b ** 2) - (4 * a * c)
    if disc >= 0:
        root1 = (-b + math.sqrt(disc)) / (2 * a)
        root2 = (-b - math.sqrt(disc)) / (2 * a)
        return [root1, root2]
    else:
        print("Complex roots encountered")
        return []`,
    json_to_ts: `{
  "id": "SYS-2026-819",
  "name": "Global Dataset Spec",
  "isProduction": true,
  "metrics": {
    "throughput": 4820,
    "latencyMs": 1.2
  },
  "tags": ["cloud", "wasm", "conversion"]
}`,
    md_to_html: `# ConvertAnyFile Technical Overview

## Executive Summary
ConvertAnyFile is an all-in-one universal file, media, document, and data conversion platform.

### Capabilities
* **Universal Document & Media Pipeline**
* **Instant Google Translate Suite**
* **High-Performance WebAssembly & Workers**

Execute clean, lossless conversions directly in your browser.`,
    sql_to_json: `CREATE TABLE scientific_experiments (
  id INT PRIMARY KEY,
  experiment_name VARCHAR(255) NOT NULL,
  temperature FLOAT,
  pressure DECIMAL(10, 2),
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP
);`,
    css_to_tailwind: `display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
padding: 24px;
margin: 16px;
background-color: #ffffff;
border-radius: 12px;
font-weight: 700;
text-align: center;`
  };

  const [inputCode, setInputCode] = useState<string>(defaultSnippets.python_to_js);
  const [outputCode, setOutputCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const handleConvert = async () => {
    setIsProcessing(true);
    setProgress(25);
    try {
      await new Promise(r => setTimeout(r, 180));
      setProgress(65);
      let out = '';
      if (conversionType === 'python_to_js') {
        out = CodeEngine.pythonToJavaScript(inputCode);
      } else if (conversionType === 'json_to_ts') {
        out = CodeEngine.jsonToTypeScript(inputCode, 'ScientificRecord');
      } else if (conversionType === 'md_to_html') {
        out = CodeEngine.markdownToHtml(inputCode);
      } else if (conversionType === 'sql_to_json') {
        out = CodeEngine.sqlToJsonSchema(inputCode);
      } else {
        out = CodeEngine.cssToTailwind(inputCode);
      }
      setOutputCode(out);
      setProgress(100);
      // Rocket blast-off sequence
      await new Promise(r => setTimeout(r, 550));
    } finally {
      setIsProcessing(false);
    }
  };

  const switchType = (type: any) => {
    setConversionType(type);
    setInputCode(defaultSnippets[type] || '');
    setOutputCode('');
  };

  const copyToClipboard = () => {
    if (!outputCode) return;
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 relative">
      {isProcessing && (
        <ConversionRocketModal
          progress={progress}
          filename={`${conversionType.split('_to_')[0]}_script`}
          targetFormat={conversionType.split('_to_')[1]?.toUpperCase() || 'CODE'}
          stageText="Parsing syntax tokens & transforming language AST..."
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-sky-600" />
            <span>Code Transpiler & Schema Generator</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            AST-style transformations between Python, TypeScript, JSON schemas, SQL DDL, Markdown, and Tailwind CSS.
          </p>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'python_to_js', label: 'Python → JavaScript' },
          { id: 'json_to_ts', label: 'JSON → TypeScript' },
          { id: 'md_to_html', label: 'Markdown → HTML' },
          { id: 'sql_to_json', label: 'SQL DDL → JSON Schema' },
          { id: 'css_to_tailwind', label: 'CSS → Tailwind Classes' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => switchType(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              conversionType === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Code */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                Input Source
              </span>
              <button
                type="button"
                onClick={handleConvert}
                className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Transpile</span>
              </button>
            </div>
            <textarea
              rows={16}
              value={inputCode}
              onChange={e => setInputCode(e.target.value)}
              className="w-full bg-transparent font-mono text-xs text-sky-200 leading-relaxed resize-none focus:outline-none"
            />
          </div>
        </div>

        {/* Output Code */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                Transpiled Target
              </span>
              {outputCode && (
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center space-x-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>
            <textarea
              rows={16}
              readOnly
              value={outputCode || '// Click "Transpile" to compile code...'}
              className="w-full bg-transparent font-mono text-xs text-emerald-300 leading-relaxed resize-none focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
