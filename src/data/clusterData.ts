export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface HeatmapRow {
  sev: Severity;
  type: string;
}

export const HM_ROWS: HeatmapRow[] = [
  { sev: 'critical', type: 'Rejected indexing' },
  { sev: 'high', type: 'High cluster pending tasks' },
  { sev: 'medium', type: 'Unbalanced shards' },
  { sev: 'high', type: 'Disk watermark low threshold' },
  { sev: 'low', type: 'Template optimization' },
  { sev: 'high', type: 'JVM memory pressure' },
  { sev: 'medium', type: 'Search queue size' },
  { sev: 'low', type: 'Slow search — frozen nodes' },
];

export const DATES_7D = ['Jan 15', 'Jan 16', 'Jan 17', 'Jan 18', 'Jan 19', 'Jan 20', 'Jan 21'];

export const CELLS_7D = [
  [1, 3, 7, 14, 11, 3, 1],
  [3, 6, 5, 12, 7, 3, 1],
  [0, 1, 2, 3, 2, 0, 0],
  [1, 2, 4, 5, 3, 2, 0],
  [2, 1, 2, 1, 2, 1, 1],
  [0, 1, 3, 7, 4, 2, 0],
  [1, 2, 3, 4, 2, 1, 0],
  [0, 1, 0, 1, 1, 0, 0],
];

// Seeded pseudo-random for deterministic data
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateDates(count: number): string[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dates: string[] = [];
  const start = new Date(2025, 0, 21 - count + 1);
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(`${months[d.getMonth()]} ${d.getDate()}`);
  }
  return dates;
}

function generateCells(rows: number, cols: number, seed: number): number[][] {
  const rand = seededRand(seed);
  return Array.from({ length: rows }, (_, ri) =>
    Array.from({ length: cols }, (_, ci) => {
      // Create a wave pattern with some randomness
      const center = Math.floor(cols * 0.6);
      const dist = Math.abs(ci - center) / cols;
      const base = Math.max(0, (1 - dist * 2) * (ri < 3 ? 14 : 7));
      return Math.max(0, Math.round(base * (0.3 + rand() * 0.9)));
    })
  );
}

export const DATES_30D = generateDates(30);
export const CELLS_30D = generateCells(8, 30, 42);
export const DATES_90D = generateDates(90);
export const CELLS_90D = generateCells(8, 90, 99);

export function getFrequencyLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

export interface EventItem {
  severity: Severity;
  title: string;
  mono?: string;
  time: string;
  timestamp: string;
  resolved?: boolean;
}

export const OPEN_EVENTS: EventItem[] = [
  { severity: 'critical', title: 'Node unresponsive — shard allocation halted on', mono: 'cluster-prod-01', time: '2 min', timestamp: 'Jan 19, 06:35' },
  { severity: 'high', title: 'Indexing rejected — write path blocked on', mono: 'instance-969', time: '17 min', timestamp: 'Jan 19, 06:20' },
  { severity: 'high', title: 'Indexing rejected — write path blocked on', mono: 'instance-1024', time: '9 min', timestamp: 'Jan 19, 06:28' },
  { severity: 'high', title: 'Bulk rejection spike — index', mono: 'cluster-2025.01.19-000512', time: '4 min', timestamp: 'Jan 19, 06:33' },
  { severity: 'medium', title: 'Indexing queue backlog —', mono: 'instance-969 & instance-1024', time: '31 min', timestamp: 'Jan 19, 06:06' },
  { severity: 'low', title: 'JVM heap pressure — GC pause above threshold on', mono: 'instance-743', time: '1 hr', timestamp: 'Jan 19, 05:37' },
];

export const RESOLVED_EVENTS: EventItem[] = [
  { severity: 'high', title: 'Disk watermark breach —', mono: 'instance-512', time: '2 hr ago', timestamp: 'Jan 19, 04:31', resolved: true },
  { severity: 'medium', title: 'Unassigned shards — replica allocation failed on', mono: 'cluster-prod-01', time: '3 hr ago', timestamp: 'Jan 19, 03:14', resolved: true },
  { severity: 'high', title: 'Circuit breaker trips — parent breaker exceeded on', mono: 'instance-228', time: '5 hr ago', timestamp: 'Jan 19, 01:02', resolved: true },
];

export interface DrawerEvent {
  severity: Severity;
  title: string;
  elapsed: string;
  notif: string;
  kv: { key: string; val: string; cls: string }[];
  recs: { title: string; desc: string; code?: { lang: string; body: string } }[];
  aside: { notification: string; duration: string; nodes: string[]; index: string; runbook: string };
}

export const DRAWER_EVENTS: DrawerEvent[] = [
  {
    severity: 'critical',
    title: 'Node unresponsive — shard allocation halted on <span class="font-mono text-sm">cluster-prod-01</span>',
    elapsed: '2 min', notif: 'PagerDuty · P1',
    kv: [
      { key: 'Detected at', val: 'Jan 19, 06:35:04', cls: '' },
      { key: 'Affected node', val: 'cluster-prod-01', cls: '' },
      { key: 'Unallocated shards', val: '48', cls: 'alert' },
      { key: 'JVM heap usage', val: '97.3%', cls: 'alert' },
      { key: 'GC pauses (5 min)', val: '23 pauses', cls: 'alert' },
      { key: 'Cluster status', val: 'RED', cls: 'alert' },
    ],
    recs: [
      { title: 'Force-allocate unassigned shards', desc: 'Manually reroute unassigned primary shards to available data nodes to restore cluster status.', code: { lang: 'json', body: 'POST _cluster/reroute\n{\n  "commands": [{\n    "allocate_empty_primary": {\n      "index": "logs-2025.01.19",\n      "shard": 0,\n      "node": "cluster-prod-02",\n      "accept_data_loss": false\n    }\n  }]\n}' } },
      { title: 'Reduce JVM heap fragmentation', desc: 'Enable G1GC and set InitiatingHeapOccupancyPercent to trigger GC earlier.', code: { lang: 'config', body: '# config/jvm.options\n-XX:+UseG1GC\n-XX:G1HeapRegionSize=32m\n-XX:InitiatingHeapOccupancyPercent=30' } },
      { title: 'Enable shard allocation awareness', desc: 'Configure zone awareness so primaries and replicas never share a host.' },
    ],
    aside: { notification: 'PagerDuty — P1', duration: '2 min (ongoing)', nodes: ['cluster-prod-01'], index: 'logs-2025.01.19', runbook: 'ES-RB-001' },
  },
  {
    severity: 'high',
    title: 'Indexing rejected — write path blocked on <span class="font-mono text-sm">instance-969</span>',
    elapsed: '17 min', notif: 'Slack · #es-alerts',
    kv: [
      { key: 'Detected at', val: 'Jan 19, 06:20:11', cls: '' },
      { key: 'Affected node', val: 'instance-969', cls: '' },
      { key: 'Write rejections', val: '1,847', cls: 'alert' },
      { key: 'Thread pool depth', val: '200 / 200', cls: 'alert' },
      { key: 'Throughput drop', val: '↓ 84%', cls: 'warn' },
      { key: 'Bulk queue util.', val: '100%', cls: 'alert' },
    ],
    recs: [
      { title: 'Increase write thread pool queue capacity', desc: 'Raise the write queue depth on the affected node.', code: { lang: 'json', body: 'PUT _cluster/settings\n{\n  "persistent": {\n    "thread_pool.write.queue_size": 500\n  }\n}' } },
      { title: 'Throttle bulk ingestion at the client', desc: 'Implement exponential back-off in your indexing clients.' },
      { title: 'Review indexing pressure across all nodes', desc: 'Check whether rejections are isolated or spreading.', code: { lang: 'bash', body: 'GET _nodes/instance-969/stats/thread_pool' } },
    ],
    aside: { notification: 'Slack · #es-alerts', duration: '17 min (ongoing)', nodes: ['instance-969'], index: 'cluster-2025.01.19-000512', runbook: 'ES-RB-004' },
  },
  {
    severity: 'high',
    title: 'Indexing rejected — write path blocked on <span class="font-mono text-sm">instance-1024</span>',
    elapsed: '9 min', notif: 'Slack · #es-alerts',
    kv: [
      { key: 'Detected at', val: 'Jan 19, 06:28:47', cls: '' },
      { key: 'Affected node', val: 'instance-1024', cls: '' },
      { key: 'Write rejections', val: '932', cls: 'alert' },
      { key: 'Thread pool depth', val: '200 / 200', cls: 'alert' },
    ],
    recs: [
      { title: 'Increase write thread pool queue capacity', desc: 'Raise the write queue depth on instance-1024.', code: { lang: 'json', body: 'PUT _cluster/settings\n{\n  "persistent": {\n    "thread_pool.write.queue_size": 500\n  }\n}' } },
      { title: 'Redistribute primary shards', desc: 'Manually rebalance primaries away from this node.' },
    ],
    aside: { notification: 'Slack · #es-alerts', duration: '9 min (ongoing)', nodes: ['instance-1024'], index: 'cluster-2025.01.19-000512', runbook: 'ES-RB-004' },
  },
  {
    severity: 'high',
    title: 'Bulk rejection spike — index <span class="font-mono text-sm">cluster-2025.01.19-000512</span> at capacity',
    elapsed: '4 min', notif: 'Slack · #es-alerts',
    kv: [
      { key: 'Detected at', val: 'Jan 19, 06:33:22', cls: '' },
      { key: 'Bulk rejections', val: '4,201', cls: 'alert' },
      { key: 'Ingest rate', val: '0 docs/s', cls: 'alert' },
      { key: 'Doc count', val: '49.8M / 50M', cls: 'warn' },
    ],
    recs: [
      { title: 'Rollover the index immediately', desc: 'Trigger a manual rollover to create a fresh write target.', code: { lang: 'json', body: 'POST cluster-2025.01.19-000512/_rollover\n{\n  "conditions": { "max_docs": 50000000 }\n}' } },
      { title: 'Update ILM rollover trigger', desc: 'Set rollover at 45M docs to prevent future ingest blackouts.' },
    ],
    aside: { notification: 'Slack · #es-alerts', duration: '4 min (ongoing)', nodes: ['instance-969', 'instance-1024'], index: 'cluster-2025.01.19-000512', runbook: 'ES-RB-007' },
  },
  {
    severity: 'medium',
    title: 'Indexing queue backlog — <span class="font-mono text-sm">instance-969</span> &amp; <span class="font-mono text-sm">instance-1024</span>',
    elapsed: '31 min', notif: 'Slack · #es-warn',
    kv: [
      { key: 'Detected at', val: 'Jan 19, 06:06:03', cls: '' },
      { key: 'Queue utilization', val: '94% (188/200)', cls: 'warn' },
      { key: 'Est. overflow', val: '~ 6 min', cls: 'warn' },
    ],
    recs: [
      { title: 'Pre-emptively increase queue depth', desc: 'Queue utilization is at 94% and rising.', code: { lang: 'json', body: 'PUT _cluster/settings\n{\n  "persistent": {\n    "thread_pool.write.queue_size": 400\n  }\n}' } },
      { title: 'Reduce bulk request size', desc: 'Large bulk requests hold queue slots longer.' },
    ],
    aside: { notification: 'Slack · #es-warn', duration: '31 min (ongoing)', nodes: ['instance-969', 'instance-1024'], index: 'cluster-2025.01.19-000512', runbook: 'ES-RB-004' },
  },
  {
    severity: 'low',
    title: 'JVM heap pressure — GC pause above threshold on <span class="font-mono text-sm">instance-743</span>',
    elapsed: '1 hr', notif: 'Email · ops-team',
    kv: [
      { key: 'Detected at', val: 'Jan 19, 05:37:19', cls: '' },
      { key: 'JVM heap usage', val: '88.4%', cls: 'warn' },
      { key: 'GC overhead', val: '12.3%', cls: 'warn' },
      { key: 'Max pause (5m)', val: '680 ms', cls: 'warn' },
    ],
    recs: [
      { title: 'Adjust JVM heap allocation', desc: 'If the node has more available RAM, increase the heap.', code: { lang: 'config', body: '# config/jvm.options\n-Xms24g\n-Xmx24g' } },
      { title: 'Enable fielddata circuit breaker', desc: 'Prevent runaway fielddata from consuming heap.' },
    ],
    aside: { notification: 'Email · ops-team', duration: '1 hr 2 min', nodes: ['instance-743'], index: 'logs-2025.01.19', runbook: 'ES-RB-009' },
  },
];

export interface GaugeData {
  name: string;
  value: number;
  threshold: number;
  status: 'ok' | 'warn' | 'alert';
  interpretation: string;
  detail?: string;
}

export const GAUGES: GaugeData[] = [
  { name: 'JVM memory (hot)', value: 84, threshold: 80, status: 'alert', interpretation: 'Above — GC pressure likely' },
  { name: 'CPU usage (hot)', value: 41, threshold: 80, status: 'ok', interpretation: 'Within normal range' },
  { name: 'Storage used', value: 67, threshold: 85, status: 'warn', interpretation: 'Plan expansion', detail: '127.6 TB / 338.4 TB used' },
];

export interface PerfTile {
  name: string;
  value: string;
  delta: string;
  deltaType: 'up-ok' | 'up-warn' | 'up-bad' | 'dn-ok' | 'neutral';
  status: 'ok' | 'warn' | 'alert';
}

export const PERF_TILES: PerfTile[] = [
  { name: 'Search rate', value: '1.6M/s', delta: '↑ 8%', deltaType: 'up-ok', status: 'ok' },
  { name: 'Search p99', value: '4.8 ms', delta: '↑ 18%', deltaType: 'up-warn', status: 'warn' },
  { name: 'Indexing rate', value: '100M/s', delta: '↑ 41%', deltaType: 'up-bad', status: 'alert' },
  { name: 'Index p99', value: '0.48 ms', delta: '— 0%', deltaType: 'neutral', status: 'ok' },
  { name: 'Thread queue', value: '847', delta: '↑ 94%', deltaType: 'up-bad', status: 'alert' },
  { name: 'GC time', value: '280 ms', delta: '↑ 12%', deltaType: 'up-warn', status: 'warn' },
  { name: 'Rejected ops', value: '1.2k', delta: '↑ new', deltaType: 'up-bad', status: 'alert' },
  { name: 'Pending tasks', value: '3', delta: '↓ 63%', deltaType: 'dn-ok', status: 'ok' },
];
