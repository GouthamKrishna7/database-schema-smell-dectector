import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SchemaEditor from './components/SchemaEditor';
import HealthScoreCard from './components/HealthScoreCard';
import ERDiagram from './components/ERDiagram';
import SmellList from './components/SmellList';
import RefactorView from './components/RefactorView';
import ExportModal from './components/ExportModal';
import LearnSection from './components/LearnSection';
import HelpSection from './components/HelpSection';
import DevelopedBy from './components/DevelopedBy';
import { fetchSamples, analyzeSchema } from './services/api';
import {
  LayoutDashboard,
  Network,
  AlertTriangle,
  Wand2,
  Code2,
  AlertCircle,
  BookOpen,
  HelpCircle,
  Users,
  GraduationCap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [samples, setSamples] = useState([]);
  const [selectedSampleId, setSelectedSampleId] = useState('');
  const [dialect, setDialect] = useState('postgres');
  const [sql, setSql] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'diagram' | 'smells' | 'refactor' | 'editor' | 'learn' | 'help' | 'developed_by'
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Day/Night Theme state (Default: dark, persisted in localStorage)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Load samples on initial mount
  useEffect(() => {
    async function init() {
      try {
        const loadedSamples = await fetchSamples();
        setSamples(loadedSamples);

        const defaultSample = loadedSamples.find((s) => s.id === 'ecommerce_smelly') || loadedSamples[0];
        if (defaultSample) {
          setSelectedSampleId(defaultSample.id);
          setDialect(defaultSample.dialect || 'postgres');
          setSql(defaultSample.sql);
          runAnalysis(defaultSample.sql, defaultSample.dialect || 'postgres');
        }
      } catch (err) {
        console.warn('Backend connection warning:', err);
      }
    }
    init();
  }, []);

  const handleSelectSample = (sampleId) => {
    const sample = samples.find((s) => s.id === sampleId);
    if (!sample) return;

    setSelectedSampleId(sampleId);
    setDialect(sample.dialect || 'postgres');
    setSql(sample.sql);
    setError(null);
    if (['learn', 'help', 'developed_by'].includes(activeTab)) {
      setActiveTab('dashboard');
    }
    runAnalysis(sample.sql, sample.dialect || 'postgres');
  };

  const runAnalysis = async (sqlToAnalyze = sql, dialectToUse = dialect) => {
    if (!sqlToAnalyze || !sqlToAnalyze.trim()) {
      setError('Please provide SQL DDL schema code to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await analyzeSchema(sqlToAnalyze, dialectToUse);
      setResult(data);

      if (data.overall_score >= 95) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze schema.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        samples={samples}
        selectedSampleId={selectedSampleId}
        onSelectSample={handleSelectSample}
        dialect={dialect}
        onSelectDialect={(d) => setDialect(d)}
        onAnalyze={() => runAnalysis()}
        isAnalyzing={isAnalyzing}
        onOpenExport={() => setIsExportOpen(true)}
        hasResults={Boolean(result)}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 flex-1 flex flex-col gap-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 p-4 rounded-xl text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-slate-500 dark:text-slate-400 hover:underline text-xs ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3 no-print">
          <div className="flex flex-wrap items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview & Health</span>
            </button>

            <button
              onClick={() => setActiveTab('diagram')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'diagram'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>ER Diagram</span>
            </button>

            <button
              onClick={() => setActiveTab('smells')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'smells'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>
                Detected Smells{' '}
                {result?.smells && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      activeTab === 'smells'
                        ? 'bg-slate-950 text-teal-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {result.smells.length}
                  </span>
                )}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('refactor')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'refactor'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              <span>Refactor & Fixes</span>
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'editor'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>SQL Editor</span>
            </button>
          </div>

          {/* Academic Info Tag */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <GraduationCap className="w-4 h-4 text-teal-500" />
            <span>Guided By Dr. Swaminathan A • DBMS Lab Evaluation</span>
          </div>
        </div>

        {/* Tab Content Panes */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {result && <HealthScoreCard result={result} />}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-teal-500" /> Current Schema DDL
                  </h2>
                  <button
                    onClick={() => setActiveTab('editor')}
                    className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Expand Editor →
                  </button>
                </div>
                <SchemaEditor
                  sql={sql}
                  onChangeSql={setSql}
                  dialect={dialect}
                  onClear={() => setSql('')}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Detected Smells
                  </h2>
                  <button
                    onClick={() => setActiveTab('smells')}
                    className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    View All ({result?.smells?.length || 0}) →
                  </button>
                </div>
                <SmellList smells={result?.smells?.slice(0, 5)} tables={result?.tables} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diagram' && (
          <div className="space-y-4">
            <ERDiagram
              tables={result?.tables || []}
              smells={result?.smells || []}
              onSelectTableSmells={() => setActiveTab('smells')}
            />
          </div>
        )}

        {activeTab === 'smells' && (
          <div className="space-y-4">
            <SmellList smells={result?.smells} tables={result?.tables} />
          </div>
        )}

        {activeTab === 'refactor' && (
          <div className="space-y-4">
            <RefactorView
              migrationSql={result?.migration_sql}
              refactoredSql={result?.refactored_sql}
              dialect={dialect}
            />
          </div>
        )}

        {activeTab === 'editor' && (
          <div className="space-y-4">
            <SchemaEditor
              sql={sql}
              onChangeSql={setSql}
              dialect={dialect}
              onClear={() => setSql('')}
            />
            <div className="flex justify-end">
              <button
                onClick={() => runAnalysis()}
                disabled={isAnalyzing}
                className="px-6 py-2.5 rounded-xl font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-md shadow-teal-500/25 active:scale-95"
              >
                {isAnalyzing ? 'Auditing Schema...' : 'Run Analysis Now'}
              </button>
            </div>
          </div>
        )}

        {/* Mandatory Section A: Learn */}
        {activeTab === 'learn' && <LearnSection />}

        {/* Mandatory Section C: Help (User Manual) */}
        {activeTab === 'help' && <HelpSection />}

        {/* Mandatory Section B: Developed By */}
        {activeTab === 'developed_by' && <DevelopedBy />}
      </main>

      {/* Mandatory Section D: Export / Download Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        result={result}
        sql={sql}
        dialect={dialect}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 px-4 lg:px-8 py-4 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors no-print">
        <p>
          DBMS Laboratory Project: <strong className="text-slate-700 dark:text-slate-300">Database Schema Smell Detector</strong> • Guided by Dr. Swaminathan A, Assistant Professor
        </p>
      </footer>
    </div>
  );
}