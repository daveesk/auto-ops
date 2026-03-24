import React, { useState, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { HM_ROWS, DATES_7D, CELLS_7D, DATES_30D, CELLS_30D, DATES_90D, CELLS_90D, getFrequencyLevel, type Severity } from '@/data/clusterData';

interface HeatmapProps {
  activeSeverity: string;
  onCellClick?: (type: string, date: string) => void;
}

const TIME_RANGES = ['7D', '30D', '90D'] as const;

const rangeData: Record<string, { dates: string[]; cells: number[][] }> = {
  '7D': { dates: DATES_7D, cells: CELLS_7D },
  '30D': { dates: DATES_30D, cells: CELLS_30D },
  '90D': { dates: DATES_90D, cells: CELLS_90D },
};

function parseDateStr(d: string): Date {
  const [mon, day] = d.split(' ');
  const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const m = months[mon] ?? 0;
  // Handle cross-year: months >= Oct are in 2024, others in 2025
  const year = m >= 10 ? 2024 : 2025;
  return new Date(year, m, parseInt(day));
}

/** Get indices where a dashed divider should appear */
function getDividerIndices(dates: string[], range: string): number[] {
  if (range === '7D') return [];
  const parsed = dates.map(parseDateStr);
  const indices: number[] = [];
  for (let i = 1; i < parsed.length; i++) {
    if (range === '30D' && parsed[i].getDay() === 1) indices.push(i);
    if (range === '90D' && parsed[i].getMonth() !== parsed[i - 1].getMonth()) indices.push(i);
  }
  return indices;
}

export default function Heatmap({ activeSeverity, onCellClick }: HeatmapProps) {
  const [activeRange, setActiveRange] = useState<string>('7D');
  const [activeRow, setActiveRow] = useState<number>(0);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>({ row: 0, col: 4 });
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const cellsContainerRef = useRef<HTMLDivElement>(null);

  const { dates, cells } = rangeData[activeRange];
  const dividerIndices = useMemo(() => getDividerIndices(dates, activeRange), [dates, activeRange]);

  const freqColors = [
    'bg-heatmap-f0', 'bg-heatmap-f1', 'bg-heatmap-f2', 'bg-heatmap-f3', 'bg-heatmap-f4',
  ];

  const isSevVisible = (sev: Severity) => activeSeverity === 'all' || activeSeverity === sev;

  const handleCellClick = (row: number, col: number) => {
    if (activeCell?.row === row && activeCell?.col === col) {
      setActiveCell(null);
      setActiveRow(-1);
      return;
    }
    setActiveCell({ row, col });
    setActiveRow(row);
    onCellClick?.(HM_ROWS[row].type, dates[col]);
  };

  const handleRowClick = (row: number) => {
    if (activeRow === row) {
      setActiveRow(-1);
      setActiveCell(null);
      return;
    }
    setActiveRow(row);
    setActiveCell(null);
  };

  const handleRangeChange = (range: string) => {
    setActiveRange(range);
    setActiveCell(null);
    setActiveRow(-1);
  };

  const handleMouseMove = useCallback((ri: number, ci: number, e: React.MouseEvent) => {
    setHoveredCell({ row: ri, col: ci });
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
    setTooltipPos(null);
  }, []);

  const tooltipContent = useMemo(() => {
    if (!hoveredCell) return null;
    const { row, col } = hoveredCell;
    const count = cells[row]?.[col] ?? 0;
    
    // Generate 1-4 random severity types for tooltip, weighted by event count
    const allSeverities: Severity[] = ['critical', 'high', 'medium', 'low'];
    const seed = (row * 100 + col * 7 + count * 13) % 97;
    const maxTypes = Math.min(4, Math.max(1, count <= 2 ? 1 : count <= 5 ? (seed % 2) + 1 : count <= 10 ? (seed % 3) + 1 : (seed % 4) + 1));
    // Shuffle severities deterministically
    const shuffled = [...allSeverities];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = ((seed * (i + 1) * 31) % (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selectedSeverities = shuffled.slice(0, maxTypes);
    // Distribute count among selected severities
    const sevCounts: { sev: Severity; count: number }[] = [];
    let remaining = count;
    for (let i = 0; i < selectedSeverities.length; i++) {
      if (i === selectedSeverities.length - 1) {
        sevCounts.push({ sev: selectedSeverities[i], count: remaining });
      } else {
        const portion = Math.max(1, Math.floor(remaining / (selectedSeverities.length - i) + ((seed * (i + 3)) % 3 - 1)));
        const clamped = Math.min(remaining - (selectedSeverities.length - i - 1), Math.max(1, portion));
        sevCounts.push({ sev: selectedSeverities[i], count: clamped });
        remaining -= clamped;
      }
    }
    
    return {
      type: HM_ROWS[row].type,
      date: dates[col],
      count,
      severities: sevCounts,
    };
  }, [hoveredCell, cells, dates]);

  const dividerSet = useMemo(() => new Set(dividerIndices), [dividerIndices]);

  /** Render cell margin + optional inline divider indicator */
  const getCellMargin = (ci: number): React.CSSProperties => {
    if (activeRange === '7D') return {};
    const styles: React.CSSProperties = {};
    if (dividerSet.has(ci)) styles.marginLeft = 5;
    if (dividerSet.has(ci + 1)) styles.marginRight = 5;
    return styles;
  };

  /** Render an inline divider element within a flex row */
  const renderInlineDivider = (ci: number, height: string = '100%') => {
    if (!dividerSet.has(ci)) return null;
    return (
      <div
        key={`divider-${ci}`}
        className="flex-shrink-0 pointer-events-none"
        style={{
          width: 0,
          height,
          borderLeft: '1px dashed hsla(225, 10%, 50%, 0.5)',
        }}
      />
    );
  };

  const renderDateHeaders = () => {
    if (activeRange === '7D') {
      return (
        <div className="flex gap-0.5 mb-0.5">
          {dates.map((d, i) => (
            <div key={i} className="flex-1 text-[9px] text-muted-foreground font-mono text-center truncate">{d}</div>
          ))}
        </div>
      );
    }

    if (activeRange === '30D') {
      const parsed = dates.map(parseDateStr);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return (
        <div className="mb-0.5">
          {/* Month labels row */}
          <div className="flex gap-0.5">
            {dates.map((_d, i) => {
              const dt = parsed[i];
              const dayNum = dt.getDate();
              return (
                <React.Fragment key={i}>
                  {renderInlineDivider(i, '14px')}
                  <div className="flex-1 text-[8px] font-mono text-center truncate text-foreground/70 font-semibold" style={getCellMargin(i)}>
                    {dayNum === 1 ? monthNames[dt.getMonth()] : ''}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          {/* Day numbers row */}
          <div className="flex gap-0.5">
            {dates.map((_d, i) => {
              const dt = parsed[i];
              const dayNum = dt.getDate();
              return (
                <React.Fragment key={i}>
                  {renderInlineDivider(i, '14px')}
                  <div className="flex-1 text-[8px] font-mono text-center truncate text-muted-foreground/60" style={getCellMargin(i)}>
                    {dayNum}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      );
    }

    // 90D
    const parsed = dates.map(parseDateStr);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return (
      <div className="flex gap-0.5 mb-0.5">
        {dates.map((_d, i) => {
          const dt = parsed[i];
          const isNewMonth = dividerSet.has(i) || i === 0;
          return (
            <React.Fragment key={i}>
              {renderInlineDivider(i, '14px')}
              <div className={`flex-1 text-[7px] font-mono text-center overflow-visible whitespace-nowrap ${isNewMonth ? 'text-foreground/70 font-semibold' : 'text-transparent'}`} style={getCellMargin(i)}>
                {isNewMonth ? monthNames[dt.getMonth()] : '\u00A0'}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // Compute visible row count for divider height
  const visibleRowCount = HM_ROWS.filter((r) => isSevVisible(r.sev)).length;

  return (
    <div className="px-6 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold text-foreground">Events over time</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span>Fewer</span>
            <div className="flex gap-0.5">
              {freqColors.map((c, i) => (
                <div key={i} className={`w-3 h-2.5 rounded-[1px] ${c}`} />
              ))}
            </div>
            <span>More events</span>
          </div>
          <div className="w-px h-3.5 bg-border" />
          <div className="flex gap-0.5">
            {TIME_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => handleRangeChange(range)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium border transition-all duration-150
                  ${activeRange === range
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
                  }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="flex">
        {/* Row labels */}
        <div className={`w-[180px] flex-shrink-0 ${activeRange === '30D' ? 'pt-[32px]' : 'pt-[18px]'}`}>
          {HM_ROWS.map((row, i) => {
            if (!isSevVisible(row.sev)) return null;
            const isActive = activeRow === i;
            return (
              <div
                key={i}
                onClick={() => handleRowClick(i)}
                className={`h-[22px] flex items-center text-[11px] px-2 rounded-sm cursor-pointer transition-all duration-150 truncate
                  ${isActive ? 'text-primary font-medium' : 'text-secondary-foreground hover:bg-secondary hover:text-foreground'}`}
              >
                {row.type}
              </div>
            );
          })}
        </div>

        {/* Cells */}
        <div className="flex-1 min-w-0 relative" ref={cellsContainerRef}>
          {renderDateHeaders()}

          {/* Cell rows */}
          {HM_ROWS.map((row, ri) => {
            if (!isSevVisible(row.sev)) return null;
            const isDimmed = activeRow >= 0 && activeRow !== ri;
            return (
              <div key={ri} className={`flex gap-0.5 mb-0.5 h-[22px] items-center transition-opacity duration-200 ${isDimmed ? 'opacity-20' : ''}`}>
                {cells[ri].map((count, ci) => {
                  const freq = getFrequencyLevel(count);
                  const isActive = activeCell?.row === ri && activeCell?.col === ci;
                  const isHovered = hoveredCell?.row === ri && hoveredCell?.col === ci;
                  return (
                    <React.Fragment key={ci}>
                      {renderInlineDivider(ci, '22px')}
                      <div
                        onClick={() => !isDimmed && handleCellClick(ri, ci)}
                        onMouseMove={(e) => handleMouseMove(ri, ci, e)}
                        onMouseLeave={handleMouseLeave}
                        style={getCellMargin(ci)}
                        className={`flex-1 h-4 rounded-[2px] cursor-pointer transition-all duration-100
                          ${freqColors[freq]}
                          ${isActive ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
                          ${isHovered && !isActive ? 'ring-1 ring-foreground/40 ring-offset-1 ring-offset-background' : ''}
                        `}
                      />
                    </React.Fragment>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip via portal — fixed position, never clipped */}
      {hoveredCell && tooltipContent && tooltipPos && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 14,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-popover border border-border rounded-md shadow-lg px-2.5 py-1.5 whitespace-nowrap">
            <div className="text-[11px] font-medium text-foreground">{tooltipContent.type}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-muted-foreground font-mono">{tooltipContent.date}</span>
              <span className="text-[10px] font-semibold font-mono text-primary tabular-nums">{tooltipContent.count} events</span>
            </div>
            {tooltipContent.severities.map((s, idx) => {
              const dotColors: Record<string, string> = {
                critical: 'bg-[hsl(0,85%,45%)]',
                high: 'bg-[hsl(15,80%,50%)]',
                medium: 'bg-[hsl(47,90%,55%)]',
                low: 'bg-[hsl(215,75%,50%)]',
              };
              return (
                <div key={idx} className="flex items-center gap-1 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColors[s.sev] || ''}`} />
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wide">{s.sev}</span>
                  <span className="text-[9px] text-muted-foreground font-mono">× {s.count}</span>
                </div>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
