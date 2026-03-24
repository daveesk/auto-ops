import { OPEN_EVENTS, type Severity } from '@/data/clusterData';

interface SeverityFilterProps {
  active: string;
  onChange: (sev: string) => void;
}

const SEVERITIES: { key: string; label: string; dotColor: string; counterColor?: string }[] = [
  { key: 'all', label: 'All', dotColor: 'bg-muted-foreground/30' },
  { key: 'critical', label: 'Critical', dotColor: 'bg-severity-critical', counterColor: 'text-[hsl(4,70%,70%)]' },
  { key: 'high', label: 'High', dotColor: 'bg-[hsla(15,75%,50%,0.2)]', counterColor: 'text-[hsl(15,70%,70%)]' },
  { key: 'medium', label: 'Medium', dotColor: 'bg-severity-medium', counterColor: 'text-[hsl(47,80%,70%)]' },
  { key: 'low', label: 'Low', dotColor: 'bg-severity-low', counterColor: 'text-[hsl(215,65%,70%)]' },
];

const activeStyles: Record<string, string> = {
  all: 'bg-foreground text-background border-foreground [&_.filter-dot]:bg-background [&_.filter-dot]:text-foreground',
  critical: 'bg-severity-critical/15 text-critical border-severity-critical/40',
  high: 'bg-[hsla(15,75%,50%,0.15)] text-[hsl(15,70%,60%)] border-[hsla(15,75%,50%,0.4)]',
  medium: 'bg-severity-medium/15 text-medium border-severity-medium/40',
  low: 'bg-severity-low/15 text-low border-severity-low/40',
};

function getCount(key: string): number {
  if (key === 'all') return OPEN_EVENTS.length;
  return OPEN_EVENTS.filter((e) => e.severity === key).length;
}

export default function SeverityFilter({ active, onChange }: SeverityFilterProps) {
  return (
    <div className="flex items-center gap-0.5">
      {SEVERITIES.map((s) => {
        const count = getCount(s.key);
        const isActive = active === s.key;
        const isAll = s.key === 'all';
        return (
          <button
            key={s.key}
            onClick={() => onChange(s.key)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium border transition-all duration-150 leading-none cursor-pointer
              ${isActive
                ? activeStyles[s.key]
                : 'bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground hover:border-muted-foreground'
              }`}
          >
            <span className={`inline-flex items-center justify-center w-[14px] h-[14px] rounded-full text-[8px] font-bold font-mono leading-none
              ${isAll && isActive ? 'bg-background text-foreground' : ''}
              ${isAll && !isActive ? 'bg-muted-foreground/30 text-foreground' : ''}
              ${!isAll ? s.dotColor : ''}
              ${!isAll ? (s.counterColor || 'text-white') : ''}
            `}>
              {count}
            </span>
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
