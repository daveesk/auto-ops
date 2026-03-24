import { useState, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import HealthBar from '@/components/HealthBar';
import Heatmap from '@/components/Heatmap';
import SeverityFilter from '@/components/SeverityFilter';
import EventList from '@/components/EventList';
import ResourcePanel from '@/components/ResourcePanel';
import EventDrawer from '@/components/EventDrawer';

export default function Index() {
  const [activeSeverity, setActiveSeverity] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerIndex, setDrawerIndex] = useState(0);
  const [heatmapFilter, setHeatmapFilter] = useState<{ type: string; date: string } | null>(null);

  const openDrawer = useCallback((index: number) => {
    setDrawerIndex(index);
    setDrawerOpen(true);
  }, []);

  const handleHeatmapCellClick = useCallback((type: string, date: string) => {
    setHeatmapFilter((prev) =>
      prev?.type === type && prev?.date === date ? null : { type, date }
    );
  }, []);

  const clearHeatmapFilter = useCallback(() => {
    setHeatmapFilter(null);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Breadcrumb */}
        <nav className="h-9 px-6 flex items-center gap-1.5 bg-card border-b border-border text-xs text-muted-foreground flex-shrink-0">
          <a href="#" className="hover:text-foreground hover:underline transition-colors">Cloud</a>
          <span className="text-border">/</span>
          <a href="#" className="hover:text-foreground hover:underline transition-colors">Connected clusters</a>
          <span className="text-border">/</span>
          <a href="#" className="hover:text-foreground hover:underline transition-colors">cluster-prod-01</a>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium">AutoOps</span>
        </nav>

        <div className="flex-1 flex overflow-hidden">
          {/* Center */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <HealthBar />

            <div className="flex-1 overflow-y-auto pb-6">
              {/* Severity filter above heatmap */}
              <div className="px-6 pt-4 flex items-center gap-3">
                <SeverityFilter active={activeSeverity} onChange={setActiveSeverity} />
              </div>

              <Heatmap activeSeverity={activeSeverity} onCellClick={handleHeatmapCellClick} />
              <EventList activeSeverity={activeSeverity} onEventClick={openDrawer} heatmapFilter={heatmapFilter} onClearHeatmapFilter={clearHeatmapFilter} />
            </div>
          </div>

          <ResourcePanel />
        </div>
      </div>

      <EventDrawer
        isOpen={drawerOpen}
        eventIndex={drawerIndex}
        onClose={() => setDrawerOpen(false)}
        onNavigate={(i) => setDrawerIndex(i)}
      />
    </div>
  );
}
