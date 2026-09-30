import React, { useState } from 'react';
import { ArrowRight, RefreshCw, FileText, Image as ImageIcon, Database, Layers, Check } from 'lucide-react';

interface FormatNode {
  id: string;
  name: string;
  category: 'document' | 'image' | 'data' | 'presentation';
  color: string;
  glowColor: string;
  x: number; // percentage in universe canvas
  y: number;
  connections: string[];
  description: string;
}

const FORMAT_NODES: FormatNode[] = [
  {
    id: 'pdf',
    name: 'PDF',
    category: 'document',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    x: 50,
    y: 22,
    connections: ['docx', 'jpg', 'png', 'xlsx', 'pptx', 'txt', 'html'],
    description: 'Adobe Portable Document with vector clarity & executive typography.'
  },
  {
    id: 'docx',
    name: 'DOCX',
    category: 'document',
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    x: 25,
    y: 42,
    connections: ['pdf', 'txt', 'html'],
    description: 'Microsoft Word OpenXML with preserved headings, styles, and tables.'
  },
  {
    id: 'jpg',
    name: 'JPG',
    category: 'image',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    x: 75,
    y: 42,
    connections: ['pdf', 'png', 'webp'],
    description: 'High-efficiency photography compression with adjustable quality.'
  },
  {
    id: 'png',
    name: 'PNG',
    category: 'image',
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    x: 82,
    y: 72,
    connections: ['pdf', 'jpg', 'webp'],
    description: 'Lossless raster graphic supporting true alpha transparency.'
  },
  {
    id: 'webp',
    name: 'WEBP',
    category: 'image',
    color: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    x: 65,
    y: 86,
    connections: ['jpg', 'png'],
    description: 'Next-gen web media format delivering 30%+ smaller file sizes.'
  },
  {
    id: 'xlsx',
    name: 'XLSX',
    category: 'data',
    color: '#059669',
    glowColor: 'rgba(5, 150, 105, 0.4)',
    x: 35,
    y: 86,
    connections: ['csv', 'json', 'pdf'],
    description: 'Structured spreadsheet workbooks with multiple worksheets.'
  },
  {
    id: 'csv',
    name: 'CSV',
    category: 'data',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    x: 18,
    y: 72,
    connections: ['xlsx', 'json'],
    description: 'Universal comma-delimited tabular data exchange format.'
  }
];

interface InteractiveFormatUniverseProps {
  onSelectPair?: (from: string, to: string) => void;
  onFilterTools?: (format: string) => void;
}

export const InteractiveFormatUniverse: React.FC<InteractiveFormatUniverseProps> = ({
  onSelectPair,
  onFilterTools
}) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [hoveredFormat, setHoveredFormat] = useState<string | null>(null);

  const activeNode = FORMAT_NODES.find(n => n.id === selectedFormat) || FORMAT_NODES[0];

  const handleNodeClick = (nodeId: string) => {
    setSelectedFormat(nodeId);
    onFilterTools?.(nodeId);
  };

  return (
    <section className="relative w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-cyan-500 dark:text-cyan-400 bg-cyan-950/20 border border-cyan-800/30 px-3 py-1 rounded-lg">
          <Layers className="w-3.5 h-3.5" />
          <span>Interactive Format Constellation</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display text-balance">
          The ConvertAnyFile <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">Universe</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal">
          Click any format orb to illuminate all verified bidirectional transformation pipelines. Every route executes privately in-browser.
        </p>
      </div>

      {/* 3D Spatial Constellation Canvas */}
      <div className="relative w-full h-[480px] sm:h-[540px] rounded-3xl glass-surface-elevated overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-slate-950/80 via-slate-900/90 to-slate-950 p-6">
        {/* Background Grid & Space Ambient */}
        <div className="absolute inset-0 bg-perspective-grid opacity-20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Vector SVG Laser Lines Connecting Nodes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="activeBeam" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {FORMAT_NODES.map(node =>
            node.connections.map(targetId => {
              const targetNode = FORMAT_NODES.find(t => t.id === targetId);
              if (!targetNode) return null;

              const isDirectlyConnected =
                node.id === selectedFormat || targetNode.id === selectedFormat;
              const isHovered =
                node.id === hoveredFormat || targetNode.id === hoveredFormat;

              return (
                <line
                  key={`${node.id}-${targetId}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${targetNode.x}%`}
                  y2={`${targetNode.y}%`}
                  stroke={
                    isDirectlyConnected || isHovered
                      ? 'url(#activeBeam)'
                      : 'rgba(148, 163, 184, 0.15)'
                  }
                  strokeWidth={isDirectlyConnected ? 2.5 : 1}
                  strokeDasharray={isDirectlyConnected ? 'none' : '4 4'}
                  filter={isDirectlyConnected ? 'url(#glow)' : undefined}
                  className="transition-all duration-300"
                />
              );
            })
          )}
        </svg>

        {/* Interactive Floating Format Orbs */}
        {FORMAT_NODES.map(node => {
          const isSelected = selectedFormat === node.id;
          const isTarget = activeNode.connections.includes(node.id);

          return (
            <div
              key={node.id}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
              onMouseEnter={() => setHoveredFormat(node.id)}
              onMouseLeave={() => setHoveredFormat(null)}
            >
              <button
                onClick={() => handleNodeClick(node.id)}
                style={{
                  boxShadow: isSelected
                    ? `0 0 25px ${node.glowColor}`
                    : isTarget
                    ? `0 0 15px rgba(6, 182, 212, 0.25)`
                    : 'none'
                }}
                className={`relative group flex flex-col items-center justify-center rounded-2xl p-3 sm:p-4 transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                  isSelected
                    ? 'bg-slate-900 border-2 border-white scale-110'
                    : isTarget
                    ? 'bg-slate-900/90 border border-cyan-400/60'
                    : 'bg-slate-950/80 border border-slate-700/60 hover:border-slate-400'
                }`}
              >
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-sm sm:text-base text-white transition-transform group-hover:rotate-6"
                  style={{ backgroundColor: node.color }}
                >
                  {node.name}
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-300 mt-1.5 uppercase tracking-wider">
                  {node.category}
                </span>

                {isTarget && !isSelected && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                )}
              </button>
            </div>
          );
        })}

        {/* Floating Active Format Inspection HUD */}
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md glass-surface p-4 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-xl z-20 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activeNode.color }}
              />
              <span className="font-bold text-white text-base font-display">
                {activeNode.name} Ecosystem
              </span>
            </div>
            <span className="text-xs text-cyan-400 font-mono">
              {activeNode.connections.length} Direct Targets
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {activeNode.description}
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Available:</span>
            {activeNode.connections.map(target => (
              <button
                key={target}
                onClick={() => onSelectPair?.(activeNode.id, target)}
                className="px-2 py-0.5 text-[11px] font-semibold text-slate-200 bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 rounded border border-slate-700 transition-colors"
              >
                → {target.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
