"use client";

import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, Cell,
} from "recharts";
import { PageHeader, Panel, PanelHeader, Select, SimulatedBanner, Stat, Badge, EmptyState } from "@/components/ui";
import { EVAL_DATASETS, computeMetrics } from "@/lib/sim/evaluation";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

const METRIC_DOCS: Record<string, string> = {
  Accuracy: "Share of all predictions that were correct: (TP+TN)/total. Intuitive but misleading under class imbalance.",
  Precision: "Of the items predicted as a class, how many truly were: TP/(TP+FP). High precision means few false alarms.",
  Recall: "Of the items that truly belong to a class, how many were found: TP/(TP+FN). High recall means few misses.",
  "F1 Score": "Harmonic mean of precision and recall — balances the two; punishing when either is low.",
};

export default function EvaluationLabPage() {
  const toast = useToast();
  const [dsId, setDsId] = useState(EVAL_DATASETS[0].id);
  const [selClass, setSelClass] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const ds = EVAL_DATASETS.find((d) => d.id === dsId)!;
  const metrics = useMemo(() => computeMetrics(ds), [ds]);

  const switchDataset = (id: string) => {
    setDsId(id);
    setSelClass(null);
    const d = EVAL_DATASETS.find((x) => x.id === id)!;
    const m = computeMetrics(d);
    const entry = `${d.label}: acc ${(m.accuracy * 100).toFixed(1)}% · macro-F1 ${m.macroF1.toFixed(3)}`;
    setHistory((h) => [entry, ...h].slice(0, 5));
    toast(`Switched dataset — metrics recomputed locally`, "info");
  };

  const maxCell = Math.max(...ds.matrix.flat());

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Evaluation Lab"
        description="Compute accuracy, precision, recall, and F1 — genuinely calculated from sample confusion matrices in your browser."
        actions={
          <Select
            label=""
            value={dsId}
            options={EVAL_DATASETS.map((d) => ({ value: d.id, label: d.label }))}
            onChange={switchDataset}
          />
        }
      />
      <SimulatedBanner>Sample confusion matrices are predefined; all derived metrics are computed locally from the matrix — the math is real.</SimulatedBanner>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Accuracy" value={`${(metrics.accuracy * 100).toFixed(2)}%`} hint={`${metrics.correct}/${metrics.totalSamples} correct`} />
        <Stat label="Precision (macro)" value={metrics.macroPrecision.toFixed(4)} hint="TP/(TP+FP) averaged" />
        <Stat label="Recall (macro)" value={metrics.macroRecall.toFixed(4)} hint="TP/(TP+FN) averaged" />
        <Stat label="F1 Score" value={`${metrics.macroF1.toFixed(4)}`} hint={`weighted: ${metrics.weightedF1.toFixed(3)}`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="Confusion Matrix" sub={`${ds.task} · rows = true, cols = predicted · click a class to filter`} />
          <div className="overflow-x-auto p-4">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="p-2 text-left text-[10px] font-normal text-mute">true ↓ / pred →</th>
                  {ds.classes.map((c) => <th key={c} className="p-2 text-[11px] font-medium text-mute">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {ds.matrix.map((row, i) => (
                  <tr key={i}>
                    <td className="p-2 text-[11px] font-medium text-ink">{ds.classes[i]}</td>
                    {row.map((v, j) => {
                      const intensity = v / maxCell;
                      const isDiag = i === j;
                      const dim = selClass !== null && i !== selClass && j !== selClass;
                      return (
                        <td key={j} className="p-1">
                          <div
                            onClick={() => setSelClass(selClass === i ? null : i)}
                            className={cn(
                              "cursor-pointer rounded-md py-2.5 text-center font-mono text-[11px] transition-all hover:ring-1 hover:ring-accent/50",
                              dim && "opacity-25"
                            )}
                            style={{
                              background: isDiag ? `rgba(56, 217, 150, ${0.12 + intensity * 0.5})` : `rgba(255, 100, 124, ${0.08 + intensity * 0.45})`,
                              color: intensity > 0.55 ? "#f3f6fc" : "#8793a5",
                            }}
                            title={`${trueLabel(ds.classes[i])} → predicted ${ds.classes[j]}: ${v}`}
                          >
                            {v}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {selClass !== null && (
              <p className="mt-3 text-xs text-mute">
                Focused on <span className="text-ink">“{ds.classes[selClass]}”</span> — green diagonal cells are correct predictions,
                red off-diagonal cells are errors leaking to other classes.{" "}
                <button onClick={() => setSelClass(null)} className="text-accent hover:underline">Clear focus</button>
              </p>
            )}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Classification Report" sub="Per-class metrics computed from the matrix" />
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-line text-left text-[10px] uppercase tracking-wide text-mute">
                  <th className="p-3">Class</th><th className="p-3">Precision</th><th className="p-3">Recall</th><th className="p-3">F1</th><th className="p-3">Support</th>
                </tr>
              </thead>
              <tbody>
                {metrics.perClass.map((c) => (
                  <tr key={c.class} className="border-b border-line/50 last:border-0">
                    <td className="p-3 text-ink">{c.class}</td>
                    <td className="p-3 font-mono text-mute">{c.precision.toFixed(3)}</td>
                    <td className="p-3 font-mono text-mute">{c.recall.toFixed(3)}</td>
                    <td className="p-3"><Badge tone={c.f1 > 0.85 ? "good" : c.f1 > 0.7 ? "warn" : "bad"}>{c.f1.toFixed(3)}</Badge></td>
                    <td className="p-3 font-mono text-mute">{c.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel>
            <PanelHeader title="Per-Class F1" sub="Harmonic mean of precision & recall" />
            <div className="h-56 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.perClass.map((c) => ({ name: c.class, f1: c.f1 }))}>
                  <CartesianGrid stroke="#1b2633" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#8793a5", fontSize: 10 }} />
                  <YAxis domain={[0, 1]} tick={{ fill: "#8793a5", fontSize: 10 }} />
                  <RTooltip contentStyle={{ background: "#121823", border: "1px solid #1b2633", fontSize: 12 }} />
                  <Bar dataKey="f1" radius={[4, 4, 0, 0]}>
                    {metrics.perClass.map((c, i) => (
                      <Cell key={i} fill={c.f1 > 0.85 ? "#38d996" : c.f1 > 0.7 ? "#f2b84b" : "#ff647c"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="Metric Guide" sub="What each number means" />
          <div className="space-y-3 p-4">
            {Object.entries(METRIC_DOCS).map(([k, v]) => (
              <div key={k} className="rounded-lg border border-line bg-elevated/50 p-3">
                <div className="text-xs font-medium text-accent">{k}</div>
                <p className="mt-1 text-xs leading-relaxed text-mute">{v}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Evaluation History" sub="Local record of dataset switches this session" right={history.length > 0 ? <button onClick={() => setHistory([])} className="text-[11px] text-mute hover:text-ink">Clear</button> : undefined} />
          <div className="p-4">
            {history.length === 0 ? (
              <EmptyState title="No evaluations recorded yet" hint="Switch the dataset above to build a comparison history." />
            ) : (
              <ul className="space-y-2">
                {history.map((h, i) => (
                  <li key={i} className="rounded-lg border border-line bg-elevated/50 px-3 py-2 font-mono text-[11px] text-mute">{h}</li>
                ))}
              </ul>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function trueLabel(cls: string) {
  return cls;
}
