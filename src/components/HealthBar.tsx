import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';

const REFRESH_OPTIONS = [
  { label: '10 sec', value: '10' },
  { label: '30 sec', value: '30' },
  { label: '1 min', value: '60' },
] as const;

export default function HealthBar() {
  const [lastChecked, setLastChecked] = useState(0);
  const [refreshInterval, setRefreshInterval] = useState('10');
  const [spinning, setSpinning] = useState(false);

  const doRefresh = useCallback(() => {
    setSpinning(true);
    setLastChecked(0);
    setTimeout(() => setSpinning(false), 600);
  }, []);

  // Auto-refresh timer
  useEffect(() => {
    const interval = setInterval(() => {
      setLastChecked((prev) => {
        const next = prev + 1;
        if (next >= Number(refreshInterval)) {
          doRefresh();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [refreshInterval, doRefresh]);

  const formatChecked = (seconds: number) => {
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)} min ago`;
  };

  const activeLabel = REFRESH_OPTIONS.find((o) => o.value === refreshInterval)?.label ?? '10 sec';

  const kpis = [
    { label: 'Open events', value: '4', warn: true },
    { label: 'Nodes at risk', value: '2', warn: true },
    { label: 'Nodes', value: '75 (incl. 3 master)', warn: false },
    { label: 'Shards', value: '48,231', warn: false },
    { label: 'Storage', value: '127.6 TB / 338.4 TB', warn: false },
  ];

  return (
    <div className="h-12 bg-card border-b border-border px-6 flex items-center flex-shrink-0 gap-0">
      {/* Status */}
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-[hsl(145,55%,55%)] glow-healthy" />
        <span className="text-[13px] font-semibold text-foreground">Green</span>
      </div>

      {kpis.map((kpi, i) => (
        <div key={i} className="flex items-center">
          <div className="w-px h-5 bg-border mx-3 flex-shrink-0" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">{kpi.label}</span>
            <span className={`text-xs font-semibold font-mono tabular-nums whitespace-nowrap ${kpi.warn ? 'text-high' : 'text-foreground'}`}>
              {kpi.value}
            </span>
          </div>
        </div>
      ))}

      {/* Right side: checked time + refresh + dropdown */}
      <div className="ml-auto flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
          Checked {formatChecked(lastChecked)}
        </span>

        <button
          onClick={doRefresh}
          className="p-1 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          title="Refresh now"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${spinning ? 'animate-spin' : ''}`} />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 px-2 py-0.5 rounded border border-border bg-card text-[10px] font-mono text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              {activeLabel}
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[100px]">
            <DropdownMenuRadioGroup value={refreshInterval} onValueChange={setRefreshInterval}>
              {REFRESH_OPTIONS.map((opt) => (
                <DropdownMenuRadioItem key={opt.value} value={opt.value} className="text-xs font-mono cursor-pointer">
                  {opt.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
