import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  Copy,
  Check,
  FileText,
  FileCode,
  FileType,
  Layers,
  Database,
} from 'lucide-react';

export default function ExportModal({ isOpen, onClose, result, sql, dialect }) {
  const [copied, setCopied] = useState(false);
  const [activeFormat, setActiveFormat] = useState('doc'); // 'doc' | 'txt' | 'pdf'

  if (!isOpen || !result) return null;

  const { overall_score, grade, summary_text, metrics, category_scores, smells, tables } = result;
  const executionTimestamp = new Date().toLocaleString();

  // 1. Generate Structured Report Content
  const generateCompleteReport = () => {
    return `# DATABASE SCHEMA SMELL AUDIT & EVALUATION REPORT
================================================================================
Generated on : ${executionTimestamp}
SQL Dialect  : ${(dialect || result.dialect).toUpperCase()}
Course       : Database Management Systems (DBMS) Lab Evaluation
Academic Year: 2026–27
School       : School of Computer Science and Engineering
Supervisor   : Dr. Swaminathan A, Assistant Professor
Team Members :
  1. Gouthamkrishna S V (25BCE5410)
  2. Ananya Krishna     (25BCE5333)
  3. Sneha Sahu         (25BCE5319)
================================================================================

--------------------------------------------------------------------------------
1. USER INPUTS
--------------------------------------------------------------------------------
Execution Timestamp : ${executionTimestamp}
Selected Dialect    : ${(dialect || result.dialect).toUpperCase()}
Total Input Length  : ${sql.length} characters (${(sql.match(/\n/g) || []).length + 1} lines)

Raw Input SQL DDL:
--------------------------------------------------------------------------------
${sql.trim()}
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
2. PROCESSING STEPS & EXECUTION TRACE
--------------------------------------------------------------------------------
[Step 1] Lexical Analysis & Abstract Syntax Tree (AST) Generation
         - Parser: sqlglot AST Engine (Dialect: ${dialect || result.dialect})
         - Filtered comments, dialect-specific keywords, and normalized tokens.

[Step 2] Relational Schema Model Extraction (Intermediate State)
         - Successfully identified ${tables.length} table definitions.
         - Extracted ${metrics.total_columns} columns, ${metrics.total_foreign_keys} foreign key constraints, and ${metrics.total_indexes} indexes.
         - Identified ${metrics.tables_without_pk} tables lacking primary keys.

[Step 3] Multi-Dimensional Schema Smell Evaluation
         - Executed 15+ automated detection rules across 4 core DBMS dimensions:
           * Dimension A: Referential & Entity Integrity (Codd's Rule #2, PK/FKs, Cycles)
           * Dimension B: Normalization & Deconstruction (1NF atomicity, 2NF/3NF, EAV, Tribbles)
           * Dimension C: Domain Types & Design Cleanliness (Generic types, Nulls, Booleans)
           * Dimension D: Indexing & Performance (Unindexed FK locks, Duplicate B-Trees)

[Step 4] Health Score & Grade Computation
         - Calculated total penalty points: ${smells.length} smells flagged.
         - Applied logarithmic scale-factor for schema volume (${tables.length} tables).
         - Final Overall Health Score: ${overall_score} / 100 (Grade: ${grade}).

[Step 5] Automated Refactoring & Migration Script Synthesis
         - Generated ${smells.filter((s) => s.suggested_sql).length} atomic ALTER TABLE remediation commands.
         - Synthesized clean, 3NF greenfield DDL schema.

--------------------------------------------------------------------------------
3. INTERMEDIATE RESULTS: EXTRACTED SCHEMA ENTITIES
--------------------------------------------------------------------------------
| Table Name             | Columns | Primary Key | Foreign Keys | Indexes |
|------------------------|---------|-------------|--------------|---------|
${tables
  .map(
    (t) =>
      `| ${t.name.padEnd(22)} | ${String(t.columns.length).padEnd(7)} | ${(t.primary_keys.length > 0 ? t.primary_keys.join(', ') : 'NONE').padEnd(11)} | ${String(t.foreign_keys.length).padEnd(12)} | ${String(t.indexes.length).padEnd(7)} |`
  )
  .join('\n')}

--------------------------------------------------------------------------------
4. FINAL OUTPUT: HEALTH AUDIT & DIMENSION SCORES
--------------------------------------------------------------------------------
Overall Health Score : ${overall_score} / 100
Relational Grade     : Grade ${grade}
Executive Summary    : ${summary_text}

Dimension Quality Breakdown:
--------------------------------------------------------------------------------
${category_scores
  .map(
    (c) =>
      `- ${c.name.padEnd(38)}: ${String(c.score).padStart(3)}% (${c.status}) [Deductions: -${c.deductions} pts | ${c.smell_count} smells]`
  )
  .join('\n')}

Severity Distribution Matrix:
--------------------------------------------------------------------------------
- CRITICAL Severity Violations : ${metrics.smells_by_severity['CRITICAL'] || 0}
- HIGH Severity Violations     : ${metrics.smells_by_severity['HIGH'] || 0}
- MEDIUM Severity Violations   : ${metrics.smells_by_severity['MEDIUM'] || 0}
- LOW Severity / Warnings      : ${metrics.smells_by_severity['LOW'] || 0}

--------------------------------------------------------------------------------
5. DETAILED DISCOVERED SCHEMA SMELLS (${smells.length} TOTAL)
--------------------------------------------------------------------------------
${smells
  .map(
    (s, idx) => `
[Smell #${idx + 1}] [${s.severity}] ${s.title}
--------------------------------------------------------------------------------
- Dimension     : ${s.category}
- Target Table  : ${s.table_name}${s.column_name ? ` (Target Column: ${s.column_name})` : ''}
- Description   : ${s.description}
- DBMS Theory   : ${s.dbms_theory}
- Concurrency   : ${s.impact}
- Remediation   : ${s.remediation}
${s.suggested_sql ? `Suggested SQL Fix:\n${s.suggested_sql}\n` : ''}`
  )
  .join('\n')}

--------------------------------------------------------------------------------
6. AUTOMATED REMEDIATION MIGRATION SCRIPT (SQL)
--------------------------------------------------------------------------------
${result.migration_sql || '-- No migration script needed.'}
================================================================================
END OF AUDIT REPORT
================================================================================
`;
  };

  const reportText = generateCompleteReport();

  // Handlers for downloading in 3 distinct formats
  const handleDownloadDoc = () => {
    // Generates a .doc / .md file compatible with Microsoft Word & Docs
    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DBMS_Schema_Smell_Report_${Date.now()}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTxt = () => {
    // Generates a .txt / .sql log
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DBMS_Audit_Execution_Log_${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm no-print">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
            <Download className="w-5 h-5 text-teal-500" />
            <span>Download Audit Report (Mandatory Section D)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            Select Export Format:
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-sm transition active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handleDownloadDoc}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-sm transition active:scale-95"
            >
              <FileType className="w-3.5 h-3.5" />
              <span>Download Document (.doc)</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition active:scale-95"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Download Text (.txt)</span>
            </button>
          </div>
        </div>

        {/* Report Preview */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-slate-800 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 flex-1">
          <pre className="whitespace-pre-wrap selection:bg-teal-500/40">{reportText}</pre>
        </div>

        {/* Footer info & Copy */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Contains User Inputs, Processing Steps, Intermediate Results & Final Output.
          </span>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal-500" />
                <span className="text-teal-600 dark:text-teal-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Raw Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}