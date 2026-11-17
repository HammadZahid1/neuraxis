/** Simulated infrastructure telemetry. Deterministic smooth noise — not real hardware monitoring. */

export interface MetricSample { t: number; v: number }

/** Smooth pseudo-random walk seeded per metric. */
function noise(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x9e3779b9) | 0;
    let t = Math.imul(a ^ (a >>> 16), 0x21f0aaad);
    t = Math.imul(t ^ (t >>> 15), 0x735a2d97);
    return (((t ^ (t >>> 15)) >>> 0) / 4294967296) * 2 - 1;
  };
}

export interface MetricDef {
  id: string;
  label: string;
  unit: string;
  base: number;
  amp: number;
  min?: number;
  max?: number;
  decimals: number;
}

export const METRICS: MetricDef[] = [
  { id: "cpu", label: "CPU Usage", unit: "%", base: 42, amp: 18, min: 2, max: 98, decimals: 0 },
  { id: "mem", label: "Memory Usage", unit: "%", base: 63, amp: 9, min: 20, max: 95, decimals: 0 },
  { id: "gpu", label: "GPU Utilization", unit: "%", base: 78, amp: 20, min: 5, max: 99, decimals: 0 },
  { id: "latency", label: "Inference Latency", unit: "ms", base: 124, amp: 38, min: 40, max: 400, decimals: 0 },
  { id: "throughput", label: "Request Throughput", unit: "req/s", base: 340, amp: 90, min: 40, max: 900, decimals: 0 },
  { id: "queue", label: "Processing Queue", unit: "tasks", base: 12, amp: 8, min: 0, max: 60, decimals: 0 },
];

export function tickMetrics(prev: Record<string, MetricSample[]>, t: number, maxLen = 40): Record<string, MetricSample[]> {
  const next: Record<string, MetricSample[]> = {};
  for (const m of METRICS) {
    const history = prev[m.id] ?? [];
    const last = history[history.length - 1]?.v ?? m.base;
    const drift = noise(m.id.length * 777 + t * 13)();
    let v = last + (m.base - last) * 0.08 + drift * m.amp * 0.22;
    v = Math.min(m.max ?? Infinity, Math.max(m.min ?? -Infinity, v));
    next[m.id] = [...history.slice(-maxLen + 1), { t, v }];
  }
  return next;
}

export type Sev = "info" | "warn" | "good" | "bad";

const EVENTS: Array<{ sev: Sev; msg: string }> = [
  { sev: "info", msg: "Autoscaler adjusted replica count" },
  { sev: "info", msg: "Checkpoint uploaded to model registry" },
  { sev: "warn", msg: "Queue depth above soft threshold" },
  { sev: "info", msg: "Rolling deploy of inference runtime finished" },
  { sev: "info", msg: "Cache warm-up completed for embedding index" },
  { sev: "warn", msg: "Latency p99 exceeded 200 ms briefly" },
  { sev: "good", msg: "Batch job finished — accuracy target met" },
  { sev: "info", msg: "Spot instance rotated into serving pool" },
  { sev: "bad", msg: "Health probe failed once — retried successfully" },
  { sev: "good", msg: "GPU memory defragmentation complete" },
];

export function eventFor(tick: number): { sev: Sev; msg: string } | null {
  const n = noise(tick * 101 + 5)();
  if (n < -0.55) return EVENTS[Math.abs(Math.round(n * 100)) % EVENTS.length];
  return null;
}
