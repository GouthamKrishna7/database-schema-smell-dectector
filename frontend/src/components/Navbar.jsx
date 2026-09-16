import React from 'react';
import { Database, ShieldAlert, Sparkles, FileText, Play, RefreshCw } from 'lucide-react';

export default function Navbar({
  samples,
  selectedSampleId,
  onSelectSample,
  dialect,
  onSelectDialect,
  onAnalyze,
  isAnalyzing,
  onOpenExport,
  hasResults,
}) {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white shadow-lg shadow-teal-500/20">
            <Database className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 ring-2 ring-slate-900 text-[9px] font-bold">
              !
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                SchemaSmell <span className="text-teal-400 font-semibold">Detector</span>
              </h1>
              <span className="bg-teal-500/10 text-teal-300 border border-teal-500/30 text-[10px] font-medium px-2 py-0.5 rounded-full">
                DBMS Project
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Relational Antipattern, Normalization & Integrity Audit Engine
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sample Loader */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-slate-400 hidden sm:inline">Sample:</span>
            <select
              value={selectedSampleId}
              onChange={(e) => onSelectSample(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="" disabled className="bg-slate-900 text-slate-400">Select Academic Sample...</option>
              {samples.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                  {s.title} ({s.badge})
                </option>
              ))}
            </select>
          </div>

          {/* Dialect */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <span className="text-slate-400 hidden sm:inline">Dialect:</span>
            <select
              value={dialect}
              onChange={(e) => onSelectDialect(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer uppercase"
            >
              <option value="postgres" className="bg-slate-900">PostgreSQL</option>
              <option value="mysql" className="bg-slate-900">MySQL</option>
              <option value="sqlite" className="bg-slate-900">SQLite</option>
            </select>
          </div>

          {/* Export Report */}
          {hasResults && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Export Full Audit Report"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          )}

          {/* Run Analysis Button */}
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 shadow-md shadow-teal-500/25 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Audit Schema</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}