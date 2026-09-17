import React from 'react';
import {
  HelpCircle,
  Play,
  Upload,
  Sparkles,
  Sun,
  Moon,
  Download,
  FileCode,
  Network,
  AlertTriangle,
  Wand2,
  CheckCircle2,
  ArrowRight,
  Database,
  Cpu,
} from 'lucide-react';

export default function HelpSection() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 border border-teal-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-2">
          <HelpCircle className="w-4 h-4" />
          <span>Section C • Application User Manual</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          System Operation & User Manual
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          A step-by-step interactive operational guide detailing inputs, control buttons, the internal processing pipeline, and output interpretation.
        </p>
      </div>

      {/* 1. What the Application Does */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-teal-500" />
          1. What Does This Application Do?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          The <strong>Database Schema Smell Detector (DSSD)</strong> is an automated relational database auditor. It accepts SQL DDL code (data definitions with <code className="text-teal-600 dark:text-teal-400 font-mono">CREATE TABLE</code>, <code className="text-teal-600 dark:text-teal-400 font-mono">ALTER TABLE</code>, and indexes), translates it into an Abstract Syntax Tree (AST), and performs static structural analysis to identify <strong>15+ database design anti-patterns</strong> (smells) that break Normal Forms (1NF, 2NF, 3NF), degrade query latency, cause table locks, or risk orphaned data.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          It generates a visual <strong>Interactive ER Diagram</strong>, computes a calibrated <strong>0–100 Schema Health Score</strong> (Grade A+ to F), and writes ready-to-run <strong>SQL Migration scripts</strong> to repair all discovered issues.
        </p>
      </section>

      {/* 2. Available Inputs & How to Provide Them */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileCode className="w-5 h-5 text-teal-500" />
          2. Available Inputs & How to Provide Them
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
              Method A: Direct Paste
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Click on the <strong>SQL DDL Schema Editor</strong> and paste your raw SQL statements. The editor supports syntax formatting, automatic line numbers, and indentation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
              Method B: File Upload
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Click the <strong className="inline-flex items-center gap-1 text-slate-800 dark:text-slate-200"><Upload className="w-3 h-3" /> Upload .sql</strong> button in the editor toolbar to load any <code className="font-mono">.sql</code> or <code className="font-mono">.txt</code> schema file directly from your machine.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
              Method C: Academic Samples
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Use the top-bar <strong>Sample</strong> dropdown to load pre-configured schemas: E-Commerce (severe smells), Hospital (tribbles), SaaS (circular FKs), or Clean Benchmark (3NF).
            </p>
          </div>
        </div>
      </section>

      {/* 3. Button and Control Guides */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-teal-500" />
          3. Button & Control Reference
        </h2>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-teal-500 text-slate-950 font-bold flex items-center gap-1">
                <Play className="w-3 h-3 fill-current" /> Audit Schema
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">Main Audit Action</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 sm:max-w-md">
              Initiates the AST parser, checks for all 15+ smell rules, calculates scores, and regenerates diagrams.
            </p>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                Dialect Selector (Postgres / MySQL / SQLite)
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 sm:max-w-md">
              Adjusts dialect-specific parsing grammars (e.g. autoincrement keywords, syntax differences, identifier quotes).
            </p>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" /> / <Moon className="w-3.5 h-3.5 text-blue-400" /> Day/Night Toggle
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 sm:max-w-md">
              Switches seamlessly between light (Day ☀️) and dark (Night 🌙) visual themes across all modules and diagrams.
            </p>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                <Download className="w-3.5 h-3.5 text-teal-500" /> Download Report
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 sm:max-w-md">
              Generates a full academic audit report with inputs, processing steps, intermediate results, and output in PDF, Doc, or Text format.
            </p>
          </div>
        </div>
      </section>

      {/* 4. How the Processing Takes Place */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ArrowRight className="w-5 h-5 text-teal-500" />
          4. How Processing Takes Place (Execution Pipeline)
        </h2>

        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </span>
            <div>
              <strong className="text-slate-900 dark:text-white block mb-0.5">Lexical Analysis & AST Tokenization</strong>
              The raw SQL DDL script is stripped of comments and parsed into an Abstract Syntax Tree (AST) using <code className="text-teal-600 dark:text-teal-400">sqlglot</code>, separating statements into Create, Alter, and Index nodes.
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </span>
            <div>
              <strong className="text-slate-900 dark:text-white block mb-0.5">Relational Model Extraction</strong>
              Tables, columns, data types, nullability, unique flags, single/composite Primary Keys, Foreign Keys, and B-Tree indexes are normalized into a unified Pydantic relational model.
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </span>
            <div>
              <strong className="text-slate-900 dark:text-white block mb-0.5">Smell Engine Evaluation (15+ Rules)</strong>
              All 15+ detector classes inspect the schema model across Integrity, Normalization (1NF/2NF/3NF), Types, and Performance.
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
              4
            </span>
            <div>
              <strong className="text-slate-900 dark:text-white block mb-0.5">Health Scoring & Grade Assignment</strong>
              Deductions are weighted by severity (Critical: -12, High: -7, Med: -4, Low: -2) and scaled by table volume to compute the 0–100 score and A+ to F grade.
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
              5
            </span>
            <div>
              <strong className="text-slate-900 dark:text-white block mb-0.5">Automated DDL Remediation Synthesis</strong>
              Generates an atomic transaction migration script (`ALTER TABLE`) and a clean 3NF greenfield DDL schema.
            </div>
          </div>
        </div>
      </section>

      {/* 5. How to Interpret the Output */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-teal-500" />
          5. How to Interpret the Output
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white">Health Score & Letter Grade</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              - <strong>95–100 (A+)</strong>: Textbook pristine 3NF schema.<br />
              - <strong>85–94 (A)</strong>: Solid architecture with minor typing smells.<br />
              - <strong>75–84 (B)</strong>: Moderate smells (unindexed FKs, nulls).<br />
              - <strong>60–74 (C)</strong>: Substantial antipatterns.<br />
              - <strong>&lt; 60 (D / F)</strong>: Critical 1NF, EAV, or Missing PK violations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white">ER Diagram Visual Cues</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              - <strong>Gold Key</strong>: Table Primary Key.<br />
              - <strong>Cyan Link</strong>: Foreign Key reference.<br />
              - <strong>Red Pulsing Badge</strong>: Table has Critical smells.<br />
              - <strong>Amber Badge</strong>: Table has Warning smells.<br />
              - <strong>Teal Lines</strong>: Foreign Key relationship paths.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}