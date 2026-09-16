import React, { useState } from 'react';
import { X, Download, Printer, Copy, Check, FileText } from 'lucide-react';

export default function ExportModal({ isOpen, onClose, result, sql }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !result) return null;

  const { overall_score, grade, summary_text, metrics, category_scores, smells } = result;

  // Generate Markdown report string
  const mdReport = `# Database Schema Smell Audit Report
**Generated on**: ${new Date().toLocaleString()}
**Dialect**: ${result.dialect.toUpperCase()}
**Overall Health Score**: ${overall_score} / 100 (Grade ${grade})

---

## 1. Executive Summary
${summary_text}

### Key Metrics:
- **Total Tables**: ${metrics.total_tables}
- **Total Columns**: ${metrics.total_columns}
- **Total Foreign Keys**: ${metrics.total_foreign_keys}
- **Tables Missing Primary Key**: ${metrics.tables_without_pk}
- **Critical Smells**: ${metrics.smells_by_severity['CRITICAL'] || 0}
- **High Severity Smells**: ${metrics.smells_by_severity['HIGH'] || 0}
- **Medium Severity Smells**: ${metrics.smells_by_severity['MEDIUM'] || 0}
- **Low Severity Smells**: ${metrics.smells_by_severity['LOW'] || 0}

---

## 2. Dimension Quality Breakdown
${category_scores
  .map(
    (c) =>
      `- **${c.name}**: ${c.score}% (${c.status}) — Deductions: -${c.deductions} pts (${c.smell_count} smells)`
  )
  .join('\n')}

---

## 3. Detected Schema Smells (${smells.length} Total)

${smells
  .map(
    (s, idx) => `### ${idx + 1}. [${s.severity}] ${s.title}
- **Category**: ${s.category}
- **Table**: \`${s.table_name}\`${s.column_name ? ` (Column: \`${s.column_name}\`)` : ''}
- **Description**: ${s.description}
- **DBMS Theory**: ${s.dbms_theory}
- **Impact**: ${s.impact}
- **Remediation**: ${s.remediation}
${s.suggested_sql ? `\`\`\`sql\n${s.suggested_sql}\n\`\`\`` : ''}
`
  )
  .join('\n\n')}

---

## 4. Remediation Migration Script
\`\`\`sql
${result.migration_sql || '-- No migration needed.'}
\`\`\`
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mdReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([mdReport], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `schema_smell_report_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold">
            <FileText className="w-5 h-5 text-teal-400" />
            <span>Export Schema Audit Report</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed bg-slate-950/50">
          <pre className="whitespace-pre-wrap">{mdReport}</pre>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-900">
          <span className="text-xs text-slate-400">
            Export format: GitHub-flavored Markdown
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-teal-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadMd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition shadow-md shadow-teal-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}