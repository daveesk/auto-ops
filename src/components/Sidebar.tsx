import { useState } from 'react';
import { Activity, Server, Database, Box, Wrench, Bell, Settings, Calendar, XCircle, Pin } from 'lucide-react';
import opsterLogo from '@/assets/opster-logo.svg';

const NAV_GROUPS = [
  {
    label: 'Monitoring',
    items: [
      { icon: Activity, label: 'Cluster', active: true },
      { icon: Server, label: 'Nodes' },
      { icon: Database, label: 'Indices' },
      { icon: Box, label: 'Shards' },
      { icon: Wrench, label: 'Template Optimizer' },
    ],
  },
  {
    label: 'Reports',
    items: [{ icon: Bell, label: 'Notifications' }],
  },
  {
    label: 'Settings',
    items: [
      { icon: Settings, label: 'Notification settings' },
      { icon: Calendar, label: 'Events settings' },
      { icon: XCircle, label: 'Dismiss events' },
    ],
  },
  {
    label: 'Pinned',
    items: [{ icon: Pin, label: 'Starter board' }],
  },
];

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('Cluster');

  return (
    <nav className="w-[220px] min-w-[220px] bg-card border-r border-border flex flex-col overflow-y-auto flex-shrink-0">
      {/* Logo */}
      <div className="px-4 py-3.5 border-b border-border flex items-start gap-2">
        <div className="w-7 h-7 flex-shrink-0 mt-0.5 rounded bg-secondary border border-border flex items-center justify-center">
          <img src={opsterLogo} alt="AutoOps" width={16} height={16} />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-foreground">AutoOps</div>
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">cluster-prod-01 · ID 2847</div>
        </div>
      </div>

      {/* Nav groups */}
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="py-2.5 border-b border-border/50">
          <div className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase px-4 pb-1.5">
            {group.label}
          </div>
          {group.items.map((item) => {
            const isActive = activeItem === item.label;
            return (
              <button
                key={item.label}
                onClick={() => setActiveItem(item.label)}
                className={`w-full flex items-center gap-2 px-4 py-[7px] text-[13px] border-l-2 transition-all duration-150
                  ${isActive
                    ? 'border-l-primary text-foreground font-medium bg-primary/10'
                    : 'border-l-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
              >
                <item.icon className={`w-[13px] h-[13px] flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      ))}

      {/* Upgrade button */}
      <div className="mt-auto p-4 border-t border-border">
        <button className="w-full py-2 px-3 bg-primary text-primary-foreground rounded-md text-xs font-semibold hover:opacity-90 transition-opacity">
          Upgrade plan
        </button>
      </div>
    </nav>
  );
}
