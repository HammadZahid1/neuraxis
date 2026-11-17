"use client";

import { useMemo, useState } from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { PageHeader, Panel, PanelHeader, SimulatedBanner, Button, Badge } from "@/components/ui";
import { MODELS } from "@/lib/data/models";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

const COLORS = ["#00d9ff", "#7667ff", "#38d996", "#f2b84b", "#ff647c"];

export default function ModelArenaPage() {
  const toast = useToast();
  const [selected, setSelected] = useState<string[]>(["neural-core-x", "vectormind-7b"]);
  const [detail, setDetail] = useState<string | null>("neural-core-x");

  const picked = useMemo(() => MODELS.filter((m) => selected.includes(m.id)), [selected]);
  const detailModel = MODELS.find((m) => m.id === detail) ?? null;

  const toggle = (id: string) => {
    setSelected((s) => {
      if (s.includes(id)) {
        if (s.length === 1) {
          toast("At least one model must stay selected", "warn");
          return s;
        }
        return s.filter((x) => x !== id);
      }
      if (s.length >= 3) {
        toast("Compare up to 3 models at once", "warn");
        return s;
      }
      return [...s, id];
    });
  };

  const latencyData = picked.map((m) => ({ name: m.name, latency: m.latencyMs, throughput: m.throughput }));
  const radarSeries = picked.map((m, i) => {
    const row: Record<string, string | number> = { name: m.name };
    m.capabilities.forEach((c) => (row[c.axis] = c.value));
    void i;
    return row;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Model Arena"
        description="Side-by-side comparison of illustrative model profiles. All figures are fictional demonstration data — no claims about real models."
      />
      <SimulatedBanner>Every specification, score, and capability value below is illustrative sample data for demonstration purposes.</SimulatedBanner>

      {/* Model selector */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {MODELS.map((m, i) => {
          const active = selected.includes(m.id);
          return (
            <div key={m.id} className={cn("rounded-xl border p-3 transition-colors", active ? "border-accent/50 bg-accent/[0.06]" : "border-line bg-panel hover:border-[#2c3e54]")}>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />
                <button onClick={() => setDetail(m.id)} className="flex-1 truncate text-left text-sm font-medium text-ink hover:text-accent">{m.name}</button>
              </div>
              <div className="mt-1 text-[11px] text-mute">{m.category} · {m.params}</div>
              <Button size="sm" variant={active ? "outline" : "primary"} className="mt-2 w-full" onClick={() => toggle(m.id)}>
                {active ? "Remove" : "Compare"}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Spec table */}
      <Panel>
        <PanelHeader title="Specification Comparison" sub={`${picked.length} models selected (max 3)`} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-xs">
            <thead>
              <tr className="border-b border-line text-left text-[10px] uppercase tracking-wide text-mute">
                <th className="p-3">Model</th>
                <th className="p-3">Parameters</th>
                <th className="p-3">Context</th>
                <th className="p-3">Latency</th>
                <th className="p-3">Throughput</th>
                <th className="p-3">Eval Score</th>
                <th className="p-3">Memory</th>
              </tr>
            </thead>
            <tbody>
              {picked.map((m) => (
                <tr key={m.id} className="border-b border-line/50 last:border-0">
                  <td className="p-3 font-medium text-ink">{m.name}</td>
                  <td className="p-3 font-mono text-mute">{m.params}</td>
                  <td className="p-3 font-mono text-mute">{m.contextWindow}</td>
                  <td className="p-3 font-mono text-mute">{m.latencyMs} ms</td>
                  <td className="p-3 font-mono text-mute">{m.throughput} tok/s</td>
                  <td className="p-3"><Badge tone="accent">{m.evalScore}</Badge></td>
                  <td className="p-3 font-mono text-mute">{m.memoryGB} GB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Charts */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="Capability Radar" sub="Illustrative 0–100 scores across axes" />
          <div className="h-80 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarSeries} outerRadius="72%">
                <PolarGrid stroke="#1b2633" />
                <PolarAngleAxis dataKey="name" tick={{ fill: "#8793a5", fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#51607a", fontSize: 9 }} axisLine={false} />
                {picked.map((m, i) => (
                  <Radar key={m.id} name={m.name} dataKey={m.name} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
                ))}
                <Legend wrapperStyle={{ fontSize: 11, color: "#8793a5" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Latency & Throughput" sub="Illustrative serving characteristics" />
          <div className="h-80 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyData}>
                <CartesianGrid stroke="#1b2633" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#8793a5", fontSize: 10 }} />
                <YAxis tick={{ fill: "#8793a5", fontSize: 10 }} />
                <RTooltip contentStyle={{ background: "#121823", border: "1px solid #1b2633", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#8793a5" }} />
                <Bar name="Latency (ms)" dataKey="latency" fill="#00d9ff" radius={[4, 4, 0, 0]} />
                <Bar name="Throughput (tok/s)" dataKey="throughput" fill="#7667ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Detail */}
      <Panel>
        <PanelHeader title={detailModel ? `Model Detail — ${detailModel.name}` : "Model Detail"} sub={detailModel ? "Fictional demonstration profile" : "Select a model above"} />
        {detailModel && (
          <div className="grid gap-4 p-4 md:grid-cols-2">
            <div className="space-y-2 text-xs">
              {[
                ["Category", detailModel.category],
                ["Parameter count (est.)", detailModel.params],
                ["Context window (ex.)", detailModel.contextWindow],
                ["Illustrative latency", `${detailModel.latencyMs} ms / request`],
                ["Illustrative throughput", `${detailModel.throughput} tokens/s`],
                ["Evaluation score (ex.)", String(detailModel.evalScore)],
                ["Memory requirement (est.)", `${detailModel.memoryGB} GB`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b border-line/60 pb-1.5">
                  <span className="text-mute">{k}</span>
                  <span className="font-mono text-ink">{v}</span>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-line bg-bg-2 p-3 text-xs leading-relaxed text-mute">
              <p className="mb-2 text-ink">Profile notes</p>
              <p>
                {detailModel.name} is presented as a fictional {detailModel.category.toLowerCase()} model. Its radar profile emphasizes{" "}
                {[...detailModel.capabilities].sort((a, b) => b.value - a.value).slice(0, 2).map((c) => c.axis).join(" and ")} while trading off{" "}
                {[...detailModel.capabilities].sort((a, b) => a.value - b.value).slice(0, 1).map((c) => c.axis)}.
              </p>
              <p className="mt-2 text-[11px] text-[#d9b06a]">This panel demonstrates how model comparison dashboards are structured. It does not describe any real product.</p>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
