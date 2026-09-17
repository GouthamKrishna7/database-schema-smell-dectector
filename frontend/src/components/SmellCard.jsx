import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  BookOpen,
  Zap,
  Wrench,
  Table,
} from 'lucide-react';

export default function SmellCard({ smell }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const severityConfig = {
    CRITICAL: {
      bg: 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 hover:border-rose-400 dark:hover:border-rose-700/60',
      badge: 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/30',
      icon: <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />,
      dot: 'bg-rose-500',
    },
    HIGH: {
      bg: 'bg-orange-50/80 dark:bg-orange-950/25 border-orange-200 dark:border-orange-900/50 hover:border-orange-400 dark:hover:border-orange-700/60',
      badge: 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-500/30',
      icon: <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />,
      dot: 'bg-orange-500',
    },
    MEDIUM: {
      bg: 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 hover:border-amber-400 dark:hover:border-amber-700/60',
      badge: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
      dot: 'bg-amber-500',
    },
    LOW: {
      bg: 'bg-blue-50/80 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 hover:border-blue-400 dark:hover:border-blue-700/60',
      badge: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30',
      icon: <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />,
      dot: 'bg-blue-400',
    },
  };

  const currentConfig = severityConfig[smell.severity] || severityConfig.LOW;

  const handleCopySQL = (e) => {
    e.stopPropagation();
    if (!smell.suggested_sql) return;
    navigator.clipboard.writeText(smell.suggested_sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={`rounded-2xl border transition-all duration-200 cursor-pointer p-4 shadow-sm ${currentConfig.bg}`}
    >
      {/* Summary Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{currentConfig.icon}</div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${currentConfig.badge}`}
              >
                {smell.severity}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                {smell.category.replace(/_/g, ' ')}
              </span>
              <span className="text-xs font-mono font-medium text-teal-700 dark:text-teal-300 flex items-center gap-1 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-900/50">
                <Table className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                {smell.table_name}
                {smell.column_name && (
                  <span className="text-slate-500 dark:text-slate-400">({smell.column_name})</span>
                )}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              {smell.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {smell.description}
            </p>
          </div>
        </div>

        {/* Expand / Collapse icon */}
        <div className="text-slate-400 dark:text-slate-500 mt-1 shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </div>

      {/* Expanded Educational Drawer */}
      {isExpanded && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3 cursor-default"
        >
          {/* DBMS Theory */}
          <div className="bg-white dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5 mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              DBMS Theory & Academic Foundation
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {smell.dbms_theory}
            </p>
          </div>

          {/* Impact */}
          <div className="bg-white dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5" />
              System & Concurrency Impact
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {smell.impact}
            </p>
          </div>

          {/* Remediation */}
          <div className="bg-white dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-1">
              <Wrench className="w-3.5 h-3.5" />
              Remediation Action Plan
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {smell.remediation}
            </p>
          </div>

          {/* Suggested SQL Fix */}
          {smell.suggested_sql && (
            <div className="bg-slate-900 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono text-slate-300 dark:text-slate-400">
                  Recommended SQL Fix:
                </span>
                <button
                  onClick={handleCopySQL}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-teal-400" />
                      <span className="text-teal-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Copy Fix</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="font-mono text-xs text-teal-300 p-2 rounded bg-slate-950/90 border border-slate-800 overflow-x-auto selection:bg-teal-500/40">
                {smell.suggested_sql}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}