import React, { useRef } from 'react';
import { Upload, Trash2, Code, FileCode, CheckCircle2 } from 'lucide-react';

export default function SchemaEditor({
  sql,
  onChangeSql,
  dialect,
  onClear,
}) {
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        onChangeSql(text);
      }
    };
    reader.readAsText(file);
  };

  // Estimate line count
  const linesCount = (sql.match(/\n/g) || []).length + 1;
  const tableCount = (sql.match(/CREATE\s+TABLE/gi) || []).length;

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/60 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <FileCode className="w-4 h-4 text-teal-400" />
          <span>SQL DDL Schema Editor</span>
          <span className="bg-slate-700/60 text-slate-400 px-2 py-0.5 rounded text-[11px]">
            {tableCount} {tableCount === 1 ? 'Table' : 'Tables'} detected
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 text-[11px]">{linesCount} lines</span>
        </div>

        <div className="flex items-center gap-2">
          {/* File Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".sql,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-700/70 hover:bg-slate-700 text-slate-300 text-xs transition"
            title="Upload .sql file"
          >
            <Upload className="w-3 h-3 text-slate-400" />
            <span>Upload .sql</span>
          </button>

          {/* Clear */}
          <button
            onClick={onClear}
            disabled={!sql.trim()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-950/40 hover:text-rose-300 text-slate-400 text-xs transition disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
            title="Clear Editor"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Editor Textarea */}
      <div className="relative flex min-h-[360px] max-h-[520px] font-mono text-xs bg-slate-950">
        <textarea
          value={sql}
          onChange={(e) => onChangeSql(e.target.value)}
          placeholder={`-- Paste your SQL DDL schema here (CREATE TABLE, ALTER TABLE, etc.)\n-- Or select a pre-loaded sample above to begin analyzing schema smells!\n\nCREATE TABLE users (\n    id INT PRIMARY KEY,\n    username VARCHAR(100) NOT NULL,\n    email VARCHAR(100) UNIQUE\n);\n`}
          spellCheck={false}
          className="w-full h-full p-4 bg-transparent text-slate-200 resize-y focus:outline-none leading-relaxed font-mono selection:bg-teal-500/30 min-h-[360px]"
        />
      </div>

      {/* Footer Instructions */}
      <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span>Supports PostgreSQL, MySQL, SQLite DDL syntax</span>
        <span className="text-slate-400 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-teal-400 inline" /> Ready for AST & Smell Analysis
        </span>
      </div>
    </div>
  );
}