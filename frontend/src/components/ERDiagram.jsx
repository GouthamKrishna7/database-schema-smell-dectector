import React, { useState, useRef, useEffect } from 'react';
import { Key, Link2, AlertCircle, ZoomIn, ZoomOut, RotateCcw, Move, Database } from 'lucide-react';

export default function ERDiagram({ tables, smells, onSelectTableSmells }) {
  const [positions, setPositions] = useState({});
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 20, y: 20 });
  const [draggingTable, setDraggingTable] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedTable, setSelectedTable] = useState(null);

  const containerRef = useRef(null);

  // Group smells by table
  const smellsByTable = {};
  (smells || []).forEach((s) => {
    const tname = s.table_name.toLowerCase();
    if (!smellsByTable[tname]) smellsByTable[tname] = [];
    smellsByTable[tname].push(s);
  });

  // Calculate automatic initial grid layout for tables
  useEffect(() => {
    if (!tables || tables.length === 0) return;

    const newPositions = {};
    const cols = Math.min(3, Math.ceil(Math.sqrt(tables.length)));
    const colWidth = 320;
    const rowHeight = 360;

    tables.forEach((table, idx) => {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      newPositions[table.name.toLowerCase()] = {
        x: 40 + c * colWidth,
        y: 40 + r * rowHeight,
      };
    });

    setPositions(newPositions);
  }, [tables]);

  // Dragging table handling
  const handleTableMouseDown = (e, tableName) => {
    e.stopPropagation();
    const pos = positions[tableName.toLowerCase()] || { x: 0, y: 0 };
    setDraggingTable(tableName.toLowerCase());
    setDragOffset({
      x: e.clientX / zoom - pos.x,
      y: e.clientY / zoom - pos.y,
    });
    setSelectedTable(tableName);
  };

  const handleContainerMouseDown = (e) => {
    if (e.target === containerRef.current || e.target.tagName === 'svg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (draggingTable) {
      setPositions((prev) => ({
        ...prev,
        [draggingTable]: {
          x: e.clientX / zoom - dragOffset.x,
          y: e.clientY / zoom - dragOffset.y,
        },
      }));
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingTable(null);
    setIsPanning(false);
  };

  // Build relationship edges (Foreign Keys)
  const edges = [];
  (tables || []).forEach((table) => {
    const sourceName = table.name.toLowerCase();
    (table.foreign_keys || []).forEach((fk, fkIdx) => {
      const targetName = fk.foreign_table.toLowerCase();
      edges.push({
        id: `${sourceName}_${targetName}_${fkIdx}`,
        source: sourceName,
        target: targetName,
        sourceCol: fk.column_names.join(', '),
        targetCol: fk.foreign_columns.join(', ') || 'PK',
      });
    });
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Header with tools */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/60 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <Database className="w-4 h-4 text-teal-400" />
          <span>Interactive Relational ER Diagram</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            Drag tables to rearrange • Click to inspect smells
          </span>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
            className="p-1.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
            className="p-1.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 20, y: 20 });
            }}
            className="p-1.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition"
            title="Reset Pan & Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleContainerMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative w-full h-[620px] bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{
          backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          {/* SVG Connector Lines */}
          <svg className="absolute top-0 left-0 w-[4000px] h-[4000px] pointer-events-none z-0">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#0d9488" />
              </marker>
            </defs>

            {edges.map((edge) => {
              const srcPos = positions[edge.source];
              const tgtPos = positions[edge.target];
              if (!srcPos || !tgtPos) return null;

              // Card dimensions estimate
              const cardW = 240;
              const cardH = 180;

              const x1 = srcPos.x + cardW / 2;
              const y1 = srcPos.y + cardH / 2;
              const x2 = tgtPos.x + cardW / 2;
              const y2 = tgtPos.y + cardH / 2;

              const dx = x2 - x1;
              const dy = y2 - y1;
              const cx1 = x1 + dx * 0.5;
              const cy1 = y1;
              const cx2 = x1 + dx * 0.5;
              const cy2 = y2;

              return (
                <g key={edge.id}>
                  <path
                    d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                    stroke="#0d9488"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    fill="transparent"
                    markerEnd="url(#arrowhead)"
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 6}
                    fill="#5eead4"
                    fontSize="10"
                    textAnchor="middle"
                    className="font-mono bg-slate-900 px-1"
                  >
                    {edge.sourceCol} → {edge.targetCol}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Table Cards */}
          {(tables || []).map((table) => {
            const tKey = table.name.toLowerCase();
            const pos = positions[tKey] || { x: 40, y: 40 };
            const tableSmells = smellsByTable[tKey] || [];
            const hasSmells = tableSmells.length > 0;
            const hasCritical = tableSmells.some((s) => s.severity === 'CRITICAL');
            const isSelected = selectedTable === table.name;

            return (
              <div
                key={table.name}
                onMouseDown={(e) => handleTableMouseDown(e, table.name)}
                onClick={() => {
                  setSelectedTable(table.name);
                  if (onSelectTableSmells) onSelectTableSmells(table.name);
                }}
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                  width: '240px',
                }}
                className={`absolute rounded-xl bg-slate-900 border text-xs shadow-2xl transition-shadow cursor-move z-10 ${
                  isSelected
                    ? 'border-teal-400 ring-2 ring-teal-400/40'
                    : hasCritical
                    ? 'border-rose-500/70'
                    : hasSmells
                    ? 'border-amber-500/70'
                    : 'border-slate-800'
                }`}
              >
                {/* Table Header */}
                <div
                  className={`flex items-center justify-between px-3 py-2 rounded-t-xl font-semibold border-b ${
                    hasCritical
                      ? 'bg-rose-950/50 border-rose-900/60 text-rose-200'
                      : hasSmells
                      ? 'bg-amber-950/40 border-amber-900/60 text-amber-200'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Database className="w-3.5 h-3.5 shrink-0 text-teal-400" />
                    <span className="truncate">{table.name}</span>
                  </div>

                  {hasSmells && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0 ${
                        hasCritical
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                      title={`${tableSmells.length} smells detected on this table`}
                    >
                      <AlertCircle className="w-2.5 h-2.5" />
                      {tableSmells.length}
                    </span>
                  )}
                </div>

                {/* Column List */}
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/60 font-mono text-[11px]">
                  {table.columns.map((col) => {
                    const isPK = col.is_primary_key || (table.primary_keys || []).includes(col.name);
                    const isFK = (table.foreign_keys || []).some((fk) =>
                      fk.column_names.includes(col.name)
                    );
                    const isSmellyCol = tableSmells.some((s) => s.column_name === col.name);

                    return (
                      <div
                        key={col.name}
                        className={`flex items-center justify-between px-2.5 py-1.5 hover:bg-slate-800/50 transition ${
                          isSmellyCol ? 'bg-rose-950/20 text-rose-200' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {isPK && (
                            <Key
                              className="w-3 h-3 text-amber-400 shrink-0"
                              title="Primary Key"
                            />
                          )}
                          {isFK && (
                            <Link2
                              className="w-3 h-3 text-cyan-400 shrink-0"
                              title="Foreign Key"
                            />
                          )}
                          {!isPK && !isFK && (
                            <span className="w-3 h-3 inline-block shrink-0 text-slate-600 text-center text-[10px]">
                              •
                            </span>
                          )}
                          <span
                            className={`truncate ${
                              isPK ? 'font-bold text-amber-300' : isFK ? 'text-cyan-300' : ''
                            }`}
                          >
                            {col.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0 pl-1">
                          {col.data_type}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Table Footer Stats */}
                <div className="px-2.5 py-1.5 bg-slate-950/80 rounded-b-xl border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                  <span>{table.columns.length} columns</span>
                  <span>
                    {table.primary_keys.length > 0 ? (
                      <span className="text-amber-400/90 font-medium">PK ✓</span>
                    ) : (
                      <span className="text-rose-400 font-bold">No PK ✗</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Key className="w-3 h-3 text-amber-400" /> Primary Key (PK)
          </span>
          <span className="flex items-center gap-1">
            <Link2 className="w-3 h-3 text-cyan-400" /> Foreign Key (FK)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse" /> Critical Smell
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Warning Smell
          </span>
        </div>
        <span className="text-slate-500 text-[11px]">Hold & drag background to pan canvas</span>
      </div>
    </div>
  );
}