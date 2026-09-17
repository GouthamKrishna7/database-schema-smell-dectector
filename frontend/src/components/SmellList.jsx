import React, { useState } from 'react';
import SmellCard from './SmellCard';
import { Search, ShieldCheck } from 'lucide-react';

export default function SmellList({ smells, tables }) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [tableFilter, setTableFilter] = useState('ALL');

  if (!smells || smells.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Pristine Relational Schema!
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          No architectural, normalization, or integrity schema smells detected. The schema adheres to 3NF standards and relational best practices.
        </p>
      </div>
    );
  }

  const filteredSmells = smells.filter((s) => {
    if (severityFilter !== 'ALL' && s.severity !== severityFilter) return false;
    if (categoryFilter !== 'ALL' && s.category !== categoryFilter) return false;
    if (tableFilter !== 'ALL' && s.table_name.toLowerCase() !== tableFilter.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchTable = s.table_name.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q);
      if (!matchTitle && !matchTable && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search smells by table or name..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Severity Tabs */}
        <div className="flex flex-wrap items-center gap-1 w-full md:w-auto">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                severityFilter === sev
                  ? 'bg-teal-500 text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Category & Table Selectors */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none text-xs"
          >
            <option value="ALL">All Categories</option>
            <option value="INTEGRITY">Integrity</option>
            <option value="NORMALIZATION">Normalization</option>
            <option value="TYPES_AND_NAMING">Types & Naming</option>
            <option value="PERFORMANCE">Performance</option>
          </select>

          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none font-mono text-xs"
          >
            <option value="ALL">All Tables</option>
            {(tables || []).map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          Showing <strong className="text-slate-800 dark:text-slate-200">{filteredSmells.length}</strong> of{' '}
          <strong className="text-slate-800 dark:text-slate-200">{smells.length}</strong> detected smells
        </span>
        {filteredSmells.length !== smells.length && (
          <button
            onClick={() => {
              setSearch('');
              setSeverityFilter('ALL');
              setCategoryFilter('ALL');
              setTableFilter('ALL');
            }}
            className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* List of Smell Cards */}
      <div className="space-y-3">
        {filteredSmells.length > 0 ? (
          filteredSmells.map((smell) => <SmellCard key={smell.id} smell={smell} />)
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500 dark:text-slate-400 shadow-sm">
            No smells match the selected filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}