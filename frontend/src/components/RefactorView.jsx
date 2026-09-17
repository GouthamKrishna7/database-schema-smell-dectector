import React, { useState } from 'react';
import { Copy, Check, Download, Wand2, ShieldCheck } from 'lucide-react';

export default function RefactorView({ migrationSql, refactoredSql, dialect }) {
  const [activeTab, setActiveTab] = useState('migration'); // 'migration' | 'clean_schema'
  const [copied, setCopied] = useState(false);

  const currentSql = activeTab === 'migration' ? migrationSql : refactoredSql;

  const handleCopy = () => {
    if (!currentSql) return;
    navigator.clipboard.writeText(currentSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentSql) return;
    const blob = new Blob([currentSql], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      activeTab === 'migration' ? 'remediation_migration.sql' : 'normalized_schema_3nf.sql'
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col transition-colors">
      {/* Header with Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-200 dark:bg-slate-950 p-1 border border-slate-300 dark:border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('migration')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                activeTab === 'migration'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Migration Script (ALTER TABLE)</span>
            </button>
            <button
              onClick={() => setActiveTab('clean_schema')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                activeTab === 'clean_schema'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Clean 3NF DDL Schema</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span className="text-teal-600 dark:text-teal-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy SQL</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition active:scale-95 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .sql</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80 text-xs flex items-center gap-2">
        <span className="text-teal-600 dark:text-teal-400 font-bold uppercase text-[11px]">
          {activeTab === 'migration' ? 'In-Place Migration' : 'Clean Greenfield DDL'}:
        </span>
        <span className="text-slate-600 dark:text-slate-400">
          {activeTab === 'migration'
            ? 'Contains atomic DDL ALTER statements to patch primary keys, missing foreign keys, and indexes on your existing database.'
            : 'A clean relational schema re-architected to 3NF standards, decomposing multivalued attributes and enforcing constraints.'}
        </span>
      </div>

      {/* SQL Output Box */}
      <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto min-h-[420px] max-h-[580px] leading-relaxed text-slate-200 selection:bg-teal-500/40">
        <pre>{currentSql || '-- No refactoring script generated yet.'}</pre>
      </div>
    </div>
  );
}