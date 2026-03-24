import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { OPEN_EVENTS, RESOLVED_EVENTS, type Severity } from '@/data/clusterData';

interface EventListProps {
  activeSeverity: string;
  onEventClick: (index: number) => void;
  heatmapFilter?: { type: string; date: string } | null;
  onClearHeatmapFilter?: () => void;
}

function SeverityBadge({ severity, resolved }: { severity: Severity; resolved?: boolean }) {
  if (resolved) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide bg-secondary text-muted-foreground">
        Resolved
      </span>
    );
  }
  const styles: Record<Severity, string> = {
    critical: 'bg-severity-critical text-destructive-foreground',
    high: 'bg-severity-high',
    medium: 'bg-severity-medium',
    low: 'bg-severity-low',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide ${styles[severity]}`}>
      {severity}
    </span>
  );
}

export default function EventList({ activeSeverity, onEventClick, heatmapFilter, onClearHeatmapFilter }: EventListProps) {
  const [showResolved, setShowResolved] = useState(false);
  const [sortBy, setSortBy] = useState<'severity' | 'time'>('severity');

  const filteredOpen = OPEN_EVENTS.filter((e) => activeSeverity === 'all' || activeSeverity === e.severity);
  const filteredResolved = RESOLVED_EVENTS.filter((e) => activeSeverity === 'all' || activeSeverity === e.severity);

  const totalCount = showResolved ? filteredOpen.length + filteredResolved.length : filteredOpen.length;

  return (
    <div className="px-6 pt-3">
      {/* Heatmap filter banner */}
      {heatmapFilter && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 text-xs">
          <span className="text-primary font-medium">Filtered:</span>
          <span className="text-foreground font-mono">{heatmapFilter.type}</span>
          <span className="text-muted-foreground">on</span>
          <span className="text-foreground font-mono">{heatmapFilter.date}</span>
          <button onClick={onClearHeatmapFilter} className="ml-auto text-muted-foreground hover:text-foreground text-[11px] font-medium px-1.5 py-0.5 rounded hover:bg-secondary transition-colors">
            Clear filter
          </button>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-semibold text-foreground">
            {showResolved ? 'All events' : 'Open events'}
          </h3>
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 bg-secondary rounded-full text-[10px] font-semibold font-mono tabular-nums text-foreground">
            {totalCount}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort controls */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-muted-foreground mr-0.5">Sort</span>
            <div className="flex gap-0.5">
              {(['severity', 'time'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-medium border transition-all duration-150
                    ${sortBy === s
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
                    }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Resolved toggle */}
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none"
          >
            <span className={`transition-colors ${showResolved ? 'text-foreground' : ''}`}>Show resolved</span>
            <div className={`w-7 h-4 rounded-full relative transition-colors duration-150 ${showResolved ? 'bg-foreground' : 'bg-border'}`}>
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full shadow transition-transform duration-150 ${showResolved ? 'translate-x-3 bg-background' : 'bg-muted-foreground'}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Open events */}
      {showResolved && filteredOpen.length > 0 && (
        <div className="flex items-center gap-2 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50 mb-1">
          <span>Open</span>
          <span className="font-mono tabular-nums opacity-70">{filteredOpen.length}</span>
        </div>
      )}

      <div className="space-y-1">
        {filteredOpen.map((event, i) => (
          <button
            key={i}
            onClick={() => onEventClick(i)}
            className="w-full flex items-center bg-card border border-border rounded-lg overflow-hidden cursor-pointer transition-all duration-150 hover:border-muted-foreground hover:bg-secondary group animate-fade-in-up"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex-1 px-3 py-2.5 flex items-center gap-2.5">
              <SeverityBadge severity={event.severity} />
              <span className="text-[13px] font-medium text-foreground flex-1 text-left">
                {event.title} {event.mono && <span className="font-mono text-xs text-muted-foreground">{event.mono}</span>}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono whitespace-nowrap tabular-nums">
                {event.time} · {event.timestamp}
              </span>
            </div>
            <div className="pr-3 text-border group-hover:text-muted-foreground transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>
        ))}
      </div>

      {/* Resolved events */}
      {showResolved && (
        <>
          <div className="flex items-center gap-2 py-2 mt-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50 mb-1">
            <span>Resolved</span>
            <span className="font-mono tabular-nums opacity-70">{filteredResolved.length}</span>
          </div>
          <div className="space-y-1">
            {filteredResolved.map((event, i) => (
              <button
                key={i}
                className="w-full flex items-center bg-card border border-border rounded-lg overflow-hidden cursor-pointer transition-all duration-150 hover:border-muted-foreground opacity-60 group"
              >
                <div className="flex-1 px-3 py-2.5 flex items-center gap-2.5">
                  <SeverityBadge severity={event.severity} resolved />
                  <span className="text-[13px] font-medium text-muted-foreground flex-1 text-left line-through">
                    {event.title} {event.mono && <span className="font-mono text-xs">{event.mono}</span>}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono whitespace-nowrap tabular-nums">
                    {event.time} · {event.timestamp}
                  </span>
                </div>
                <div className="pr-3 text-border">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
