import React from 'react';
import {
  Database,
  ShieldAlert,
  Sparkles,
  FileText,
  Play,
  RefreshCw,
  Sun,
  Moon,
  BookOpen,
  HelpCircle,
  Users,
  Download,
} from 'lucide-react';

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
  theme,
  onToggleTheme,
  activeTab,
  onSelectTab,
}) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-2.5 transition-colors duration-200 no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition">
              <Database className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 text-[9px] font-bold text-white">
                !
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                  SchemaSmell <span className="text-teal-600 dark:text-teal-400 font-semibold">Detector</span>
                </h1>
                <span className="bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                  DBMS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5">
                Relational Quality & Normalization Auditor
              </p>
            </div>
          </div>

          {/* Mobile Theme Toggle */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              title="Toggle Day/Night Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Top-Right Mandatory Navigation & Controls */}
        <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto">
          {/* Section A: Learn Tab (Prominent Top-Right) */}
          <button
            onClick={() => onSelectTab('learn')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeTab === 'learn'
                ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Learn</span>
          </button>

          {/* Section C: Help Tab (User Manual) */}
          <button
            onClick={() => onSelectTab('help')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeTab === 'help'
                ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
            <span>Help</span>
          </button>

          {/* Section B: Developed By Tab */}
          <button
            onClick={() => onSelectTab('developed_by')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeTab === 'developed_by'
                ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-purple-500" />
            <span>Developed By</span>
          </button>

          <span className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:inline" />

          {/* Sample Loader */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300">
            <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            <select
              value={selectedSampleId}
              onChange={(e) => onSelectSample(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="" disabled className="dark:bg-slate-900">Sample Schemas...</option>
              {samples.map((s) => (
                <option key={s.id} value={s.id} className="dark:bg-slate-900">
                  {s.title} ({s.badge})
                </option>
              ))}
            </select>
          </div>

          {/* Dialect */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300">
            <select
              value={dialect}
              onChange={(e) => onSelectDialect(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer uppercase text-xs"
            >
              <option value="postgres" className="dark:bg-slate-900">PostgreSQL</option>
              <option value="mysql" className="dark:bg-slate-900">MySQL</option>
              <option value="sqlite" className="dark:bg-slate-900">SQLite</option>
            </select>
          </div>

          {/* Section D: Download Button */}
          {hasResults && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
              title="Download Complete Audit Report"
            >
              <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="hidden sm:inline">Download</span>
            </button>
          )}

          {/* Section E: Day / Night Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
            title={`Switch to ${theme === 'dark' ? 'Day (Light)' : 'Night (Dark)'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {/* Audit CTA */}
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20 transition active:scale-95 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Audit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}