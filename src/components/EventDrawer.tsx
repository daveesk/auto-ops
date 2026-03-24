import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Bell, Clock, Server, FileText, Book, Check, Copy } from 'lucide-react';
import { DRAWER_EVENTS, type Severity } from '@/data/clusterData';

interface EventDrawerProps {
  isOpen: boolean;
  eventIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function SeverityBadge({ severity }: { severity: Severity }) {
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

export default function EventDrawer({ isOpen, eventIndex, onClose, onNavigate }: EventDrawerProps) {
  const [openRecs, setOpenRecs] = useState<Set<number>>(new Set([0]));
  const [doneRecs, setDoneRecs] = useState<Set<number>>(new Set());
  const [copiedCode, setCopiedCode] = useState<number | null>(null);

  const event = DRAWER_EVENTS[eventIndex];
  if (!event) return null;

  const total = DRAWER_EVENTS.length;

  const toggleRec = (i: number) => {
    const next = new Set(openRecs);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setOpenRecs(next);
  };

  const toggleDone = (i: number) => {
    const next = new Set(doneRecs);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setDoneRecs(next);
  };

  const copyCode = (body: string, i: number) => {
    navigator.clipboard.writeText(body).catch(() => {});
    setCopiedCode(i);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sevColor: Record<Severity, string> = {
    critical: '#E74C3C',
    high: '#F5A623',
    medium: '#E6A817',
    low: '#2980B9',
  };

  const col = sevColor[event.severity];

  return (
    <div className={`fixed right-0 top-0 bottom-0 w-[580px] max-w-full z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Panel */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-[580px] max-w-full bg-card shadow-2xl border-l border-border flex flex-col transition-transform duration-240 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >

        {/* Header */}
        <div className="flex-shrink-0 border-b border-border px-4">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-1">
              <button onClick={onClose} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-secondary transition-colors">
                <ChevronLeft className="w-3 h-3" />
                Events
              </button>
              <span className="text-border">·</span>
              <span className="text-[11px] text-muted-foreground">cluster-prod-01</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground tabular-nums">
                <button
                  disabled={eventIndex === 0}
                  onClick={() => onNavigate(eventIndex - 1)}
                  className="w-6 h-6 border border-border rounded flex items-center justify-center hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-2.5 h-2.5" />
                </button>
                <span className="min-w-[28px] text-center">{eventIndex + 1} / {total}</span>
                <button
                  disabled={eventIndex === total - 1}
                  onClick={() => onNavigate(eventIndex + 1)}
                  className="w-6 h-6 border border-border rounded flex items-center justify-center hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-2.5 h-2.5" />
                </button>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="pb-3.5 pt-2">
            <h2 className="text-sm font-semibold text-foreground leading-snug mb-2" dangerouslySetInnerHTML={{ __html: event.title }} />
            <div className="flex items-center gap-1.5 flex-wrap">
              <SeverityBadge severity={event.severity} />
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-severity-low/10 text-low border border-severity-low/20">Open</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                <Bell className="w-2.5 h-2.5" />{event.notif}
              </span>
              <span className="inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                {event.elapsed}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-shrink-0 px-4 py-2 border-b border-border/50 bg-surface-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Event timeline</span>
          </div>
          <div className="h-[68px] relative">
            <svg viewBox="0 0 548 68" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="drwGA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={col} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={col} stopOpacity="0.03" />
                </linearGradient>
              </defs>
              <line x1="0" y1="26" x2="548" y2="26" stroke="hsl(225 12% 16%)" strokeWidth="1" strokeDasharray="4,3" />
              <text x="4" y="23" fontFamily="JetBrains Mono,monospace" fontSize="8" fill="hsl(225 10% 55%)">threshold</text>
              <path d="M0,48 C40,47 80,50 120,48 C160,46 200,47 240,48 C270,47 296,46 316,45" fill="none" stroke="hsl(225 10% 40%)" strokeWidth="1.3" />
              <path d="M316,46 C326,41 337,33 348,22 C357,14 366,8 372,8 C378,8 387,14 397,24 C408,34 420,43 432,47 L432,62 L316,62 Z" fill="url(#drwGA)" />
              <path d="M316,45 C328,39 340,28 352,17 C360,10 368,7 372,8 C376,9 384,15 394,25 C405,35 418,44 432,47" fill="none" stroke={col} strokeWidth="1.6" />
              <path d="M432,47 C458,48 484,47 510,48 C525,48 536,47 548,48" fill="none" stroke="hsl(225 10% 40%)" strokeWidth="1.3" />
              <line x1="316" y1="4" x2="316" y2="62" stroke={col} strokeWidth="0.7" strokeOpacity="0.3" strokeDasharray="3,2" />
              <circle cx="372" cy="8" r="5.5" fill={col} fillOpacity="0.18" />
              <circle cx="372" cy="8" r="2.8" fill={col} />
              <text x="321" y="20" fontFamily="JetBrains Mono,monospace" fontSize="8" fill={col} opacity="0.85">anomaly</text>
            </svg>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Main */}
          <div className="flex-1 overflow-y-auto p-4 border-r border-border/50 space-y-4">
            {/* Detection summary */}
            <div>
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Detection summary</h4>
              <div className="space-y-1">
                {event.kv.map((row, i) => (
                  <div key={i} className="flex items-baseline">
                    <span className="w-[148px] flex-shrink-0 text-[11px] text-muted-foreground">{row.key}</span>
                    <span className={`text-[11px] font-medium font-mono tabular-nums ${row.cls === 'alert' ? 'text-critical' : row.cls === 'warn' ? 'text-high' : 'text-foreground'}`}>
                      {row.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recommendations</h4>
              <div className="space-y-1.5">
                {event.recs.map((rec, i) => {
                  const isOpen = openRecs.has(i);
                  const isDone = doneRecs.has(i);
                  return (
                    <div key={i} className={`border border-border/50 rounded-lg overflow-hidden transition-all`}>
                      <div
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none hover:bg-secondary/50 transition-colors"
                        onClick={() => toggleRec(i)}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleDone(i); }}
                          className={`w-3.5 h-3.5 rounded flex-shrink-0 border flex items-center justify-center transition-colors ${isDone ? 'bg-foreground border-foreground' : 'border-border bg-card'}`}
                        >
                          {isDone && <Check className="w-2 h-2 text-background" />}
                        </button>
                        <span className="w-4 h-4 flex-shrink-0 bg-secondary rounded text-[9px] font-semibold font-mono text-muted-foreground flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className={`flex-1 text-xs font-medium ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {rec.title}
                        </span>
                        <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`} />
                      </div>
                      {isOpen && (
                        <div className="px-3 pb-3 border-t border-border/50 bg-card">
                          <p className="text-[11px] text-muted-foreground leading-relaxed my-2">{rec.desc}</p>
                          {rec.code && (
                            <div className="rounded-md overflow-hidden bg-background border border-border/30">
                              <div className="flex items-center justify-between px-2.5 py-1 border-b border-border/20">
                                <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-wider">{rec.code.lang}</span>
                                <button
                                  onClick={() => copyCode(rec.code!.body, i)}
                                  className={`text-[9px] font-mono flex items-center gap-1 transition-colors ${copiedCode === i ? 'text-healthy' : 'text-muted-foreground/50 hover:text-muted-foreground'}`}
                                >
                                  {copiedCode === i ? <Check className="w-2 h-2" /> : <Copy className="w-2 h-2" />}
                                  {copiedCode === i ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                              <pre className="px-2.5 py-2 text-[11px] leading-relaxed font-mono text-foreground/80 overflow-x-auto whitespace-pre">
                                {rec.code.body}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Aside */}
          <aside className="w-[192px] flex-shrink-0 overflow-y-auto p-3 space-y-3">
            {[
              { icon: Bell, label: 'Notification', sub: 'Policy', value: event.aside.notification },
              { icon: Clock, label: 'Duration', sub: 'Time active', value: event.aside.duration },
            ].map((item, i) => (
              <div key={i}>
                <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{item.label}</h5>
                <div className="flex items-start gap-2 py-0.5">
                  <item.icon className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] text-muted-foreground block">{item.sub}</span>
                    <span className="text-[11px] font-medium font-mono text-foreground">{item.value}</span>
                  </div>
                </div>
                <div className="h-px bg-border/50 mt-2" />
              </div>
            ))}

            <div>
              <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Affected nodes</h5>
              {event.aside.nodes.map((n, i) => (
                <div key={i} className="flex items-center gap-2 py-0.5">
                  <Server className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-[11px] font-medium font-mono text-foreground break-all">{n}</span>
                </div>
              ))}
              <div className="h-px bg-border/50 mt-2" />
            </div>

            <div>
              <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Related index</h5>
              <div className="flex items-center gap-2 py-0.5">
                <FileText className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-[11px] font-medium font-mono text-foreground break-all">{event.aside.index}</span>
              </div>
              <div className="h-px bg-border/50 mt-2" />
            </div>

            <div>
              <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Runbook</h5>
              <div className="flex items-center gap-2 py-0.5">
                <Book className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <a href="#" className="text-[11px] font-medium text-info hover:underline">{event.aside.runbook}</a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
