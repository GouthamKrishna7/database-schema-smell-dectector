import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SchemaEditor from './components/SchemaEditor';
import HealthScoreCard from './components/HealthScoreCard';
import ERDiagram from './components/ERDiagram';
import SmellList from './components/SmellList';
import RefactorView from './components/RefactorView';
import ExportModal from './components/ExportModal';
import { fetchSamples, analyzeSchema } from './services/api';
import {
  LayoutDashboard,
  Network,
  AlertTriangle,
  Wand2,
  Code2,
  AlertCircle,
  CheckCircle2,
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
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'diagram' | 'smells' | 'refactor' | 'editor'
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Load samples on initial mount
  useEffect(() => {
    async function init() {
      try {
        const loadedSamples = await fetchSamples();
        setSamples(loadedSamples);

        // Preload ecommerce_smelly as default
        const defaultSample = loadedSamples.find((s) => s.id === 'ecommerce_smelly') || loadedSamples[0];
        if (defaultSample) {
          setSelectedSampleId(defaultSample.id);
          setDialect(defaultSample.dialect || 'postgres');
          setSql(defaultSample.sql);

          // Run initial analysis
          runAnalysis(defaultSample.sql, defaultSample.dialect || 'postgres');
        }
      } catch (err) {
        console.warn('Backend not responding yet, using default offline sample:', err);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
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
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 flex-1 flex flex-col gap-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/50 border border-rose-800 text-rose-200 p-4 rounded-xl text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-slate-400 hover:text-white text-xs underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview & Health</span>
            </button>

            <button
              onClick={() => setActiveTab('diagram')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'diagram'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>ER Diagram</span>
            </button>

            <button
              onClick={() => setActiveTab('smells')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'smells'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
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
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {result.smells.length}
                  </span>
                )}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('refactor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'refactor'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              <span>Refactor & Fixes</span>
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'editor'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>SQL Editor</span>
            </button>
          </div>

          {/* Quick Academic Info Tag */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
            <GraduationCap className="w-4 h-4 text-teal-400" />
            <span>DBMS Academic Evaluation Model (1NF/2NF/3NF & Codd's Rules)</span>
          </div>
        </div>

        {/* Tab Content Panes */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {result && <HealthScoreCard result={result} />}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-slate-200 tracking-tight flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-teal-400" /> Current Schema DDL
                  </h2>
                  <button
                    onClick={() => setActiveTab('editor')}
                    className="text-xs text-teal-400 hover:underline"
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
                  <h2 className="text-sm font-bold text-slate-200 tracking-tight flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> Detected Smells
                  </h2>
                  <button
                    onClick={() => setActiveTab('smells')}
                    className="text-xs text-teal-400 hover:underline"
                  >
                    View All Details →
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
                className="px-6 py-2.5 rounded-xl font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-lg shadow-teal-500/25 active:scale-95"
              >
                {isAnalyzing ? 'Auditing Schema...' : 'Run Analysis Now'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Export Report Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        result={result}
        sql={sql}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 lg:px-8 py-4 text-center text-xs text-slate-400">
        <p>
          DBMS Course Project: <strong className="text-slate-300">Database Schema Smell Detector</strong> • Evaluates Relational Integrity, Normalization (1NF/2NF/3NF), and Indexing Quality
        </p>
      </footer>
    </div>
  );
}