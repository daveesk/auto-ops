import { GAUGES, PERF_TILES, type GaugeData, type PerfTile } from '@/data/clusterData';
import { AlertTriangle } from 'lucide-react';

function Gauge({ gauge }: { gauge: GaugeData }) {
  const fillColor = {
    ok: 'bg-[hsl(145,55%,52%)]',
    warn: 'bg-primary',
    alert: 'bg-severity-critical',
  }[gauge.status];

  const valueColor = {
    ok: 'text-healthy',
    warn: 'text-high',
    alert: 'text-critical',
  }[gauge.status];

  const interpColor = {
    ok: 'text-healthy',
    warn: 'text-high',
    alert: 'text-critical',
  }[gauge.status];

  return (
    <div className="mb-3">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-xs font-medium text-foreground">{gauge.name}</span>
        <span className={`text-[13px] font-semibold font-mono tabular-nums ${valueColor}`}>{gauge.value}%</span>
      </div>
      <div className="h-2 bg-secondary rounded overflow-visible relative mb-1">
        <div className={`h-full rounded ${fillColor} transition-all duration-500`} style={{ width: `${gauge.value}%` }} />
        <div
          className="absolute -top-[3px] w-[1.5px] h-3.5 bg-foreground/30"
          style={{ left: `${gauge.threshold}%` }}
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-muted-foreground font-mono">Threshold: {gauge.threshold}%</span>
        <span className={`text-[10px] flex items-center gap-1 ${interpColor}`}>
          {gauge.status !== 'ok' && <AlertTriangle className="w-2.5 h-2.5" />}
          {gauge.interpretation}
        </span>
      </div>
      {gauge.detail && (
        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{gauge.detail}</div>
      )}
    </div>
  );
}

function PerfTileCard({ tile }: { tile: PerfTile }) {
  const valueColor = {
    ok: 'text-foreground',
    warn: 'text-high',
    alert: 'text-critical',
  }[tile.status];

  const accentBar = {
    ok: 'bg-[hsl(145,55%,52%)]',
    warn: 'bg-primary',
    alert: 'bg-severity-critical',
  }[tile.status];

  const deltaStyle = {
    'up-ok': 'bg-[hsla(145,55%,52%,0.2)] text-healthy',
    'up-warn': 'bg-primary/15 text-high',
    'up-bad': 'bg-severity-critical/15 text-critical',
    'dn-ok': 'bg-[hsla(145,55%,52%,0.2)] text-healthy',
    'neutral': 'bg-secondary text-muted-foreground',
  }[tile.deltaType];

  return (
    <div className="bg-card border border-border/50 rounded-lg p-3 pt-4 relative overflow-hidden cursor-default transition-all duration-150 hover:border-border hover:glow-card group">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] rounded-t-lg ${accentBar}`} />
      <div className={`text-[17px] font-bold font-mono tabular-nums leading-none ${valueColor}`}>
        {tile.value}
      </div>
      <div className="flex items-center justify-between gap-1 mt-1.5">
        <span className="text-[10px] font-medium text-muted-foreground truncate">{tile.name}</span>
        <span className={`text-[10px] font-semibold font-mono whitespace-nowrap px-1 py-0.5 rounded ${deltaStyle}`}>
          {tile.delta}
        </span>
      </div>
    </div>
  );
}

export default function ResourcePanel() {
  return (
    <div className="w-[280px] min-w-[280px] flex-shrink-0 bg-card border-l border-border overflow-y-auto p-4 flex flex-col gap-5">
      {/* Resources */}
      <div>
        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          Resources
        </h4>
        <div className="text-[10px] text-muted-foreground font-mono mb-3">
          v8.19.3 · 75 nodes · 48K shards · Hot + Cold tiers
        </div>
        {GAUGES.map((g, i) => (
          <Gauge key={i} gauge={g} />
        ))}

        {/* Nodes at risk */}
        <div className="mt-2">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Nodes at risk
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center justify-between px-2 py-1.5 rounded border border-severity-critical/30 bg-severity-critical/5 cursor-pointer hover:bg-severity-critical/10 transition-colors">
              <span className="text-[11px] font-medium font-mono text-foreground">node-hot-07</span>
              <span className="text-[11px] font-semibold font-mono tabular-nums text-critical">JVM 84%</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 rounded border border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
              <span className="text-[11px] font-medium font-mono text-foreground">node-hot-12</span>
              <span className="text-[11px] font-semibold font-mono tabular-nums text-high">JVM 79%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance tiles */}
      <div>
        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
          Performance (last 7D)
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          {PERF_TILES.map((tile, i) => (
            <PerfTileCard key={i} tile={tile} />
          ))}
        </div>
      </div>
    </div>
  );
}
