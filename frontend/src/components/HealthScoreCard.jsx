import React from 'react';
import { ShieldCheck, AlertOctagon, AlertTriangle, Info, Layers, Key, Link2, Hash } from 'lucide-react';

export default function HealthScoreCard({ result }) {
  if (!result) return null;

  const { overall_score, grade, summary_text, metrics, category_scores } = result;

  // Grade badge styling
  const gradeStyles = {
    'A+': 'from-emerald-500 to-teal-500 text-slate-950 ring-emerald-400/50',
    'A': 'from-teal-500 to-cyan-500 text-slate-950 ring-teal-400/50',
    'B': 'from-blue-500 to-indigo-500 text-white ring-blue-400/50',
    'C': 'from-amber-500 to-yellow-500 text-slate-950 ring-amber-400/50',
    'D': 'from-orange-500 to-amber-600 text-white ring-orange-400/50',
    'F': 'from-rose-600 to-red-600 text-white ring-rose-400/50',
  };

  const ringColor = overall_score >= 85 ? '#10b981' : overall_score >= 70 ? '#3b82f6' : overall_score >= 50 ? '#f59e0b' : '#ef4444';
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall_score / 100) * circumference;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. Overall Score & Grade Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Schema Health Score</span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
            {metrics.total_tables} Tables Evaluated
          </span>
        </div>

        <div className="flex items-center gap-6 my-4">
          {/* Radial progress ring */}
          <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-slate-800"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={ringColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black tracking-tight text-white">{overall_score}</span>
              <span className="text-[10px] text-slate-400 font-medium">/ 100</span>
            </div>
          </div>

          {/* Letter Grade */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center font-black text-xl shadow-lg ring-2 ${
                  gradeStyles[grade] || gradeStyles['F']
                }`}
              >
                {grade}
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Relational Grade</span>
                <span className="text-[11px] text-slate-400">
                  {overall_score >= 85 ? 'Well Normalized' : overall_score >= 60 ? 'Moderate Smells' : 'Severe Deficiencies'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary banner */}
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          {summary_text}
        </p>
      </div>

      {/* 2. Category Quality Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">DBMS Dimension Scores</span>
          <span className="text-[11px] text-slate-500">Target: 100%</span>
        </div>

        <div className="space-y-3">
          {category_scores.map((cat) => {
            const barColor = cat.score >= 85 ? 'bg-teal-500' : cat.score >= 70 ? 'bg-blue-500' : cat.score >= 50 ? 'bg-amber-500' : 'bg-rose-500';
            return (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    {cat.name}
                    {cat.smell_count > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
                        {cat.smell_count} {cat.smell_count === 1 ? 'smell' : 'smells'}
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-slate-200 font-semibold">{cat.score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Severity & Structural Metrics */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
            Smell Counts & Architecture
          </span>

          {/* Severity Badges Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center justify-between p-2 rounded-lg bg-rose-950/30 border border-rose-900/40">
              <span className="flex items-center gap-1.5 text-xs text-rose-300 font-medium">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                Critical
              </span>
              <span className="font-mono text-sm font-bold text-rose-200">
                {metrics.smells_by_severity['CRITICAL'] || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-orange-950/30 border border-orange-900/40">
              <span className="flex items-center gap-1.5 text-xs text-orange-300 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                High
              </span>
              <span className="font-mono text-sm font-bold text-orange-200">
                {metrics.smells_by_severity['HIGH'] || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/30 border border-amber-900/40">
              <span className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Medium
              </span>
              <span className="font-mono text-sm font-bold text-amber-200">
                {metrics.smells_by_severity['MEDIUM'] || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-950/30 border border-blue-900/40">
              <span className="flex items-center gap-1.5 text-xs text-blue-300 font-medium">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                Low / Info
              </span>
              <span className="font-mono text-sm font-bold text-blue-200">
                {metrics.smells_by_severity['LOW'] || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Structural Metrics Chips */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-center">
          <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Tables</span>
            <span className="text-xs font-bold text-slate-200 font-mono">{metrics.total_tables}</span>
          </div>
          <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Columns</span>
            <span className="text-xs font-bold text-slate-200 font-mono">{metrics.total_columns}</span>
          </div>
          <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Foreign Keys</span>
            <span className="text-xs font-bold text-slate-200 font-mono">{metrics.total_foreign_keys}</span>
          </div>
          <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">No PK</span>
            <span className={`text-xs font-bold font-mono ${metrics.tables_without_pk > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
              {metrics.tables_without_pk}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}