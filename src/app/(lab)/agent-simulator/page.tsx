"use client";

import { useMemo, useState } from "react";
import { AGENTS, agentById, SCENARIOS, simulate, type SimEvent } from "@/lib/sim/agents";
import { PageHeader, Panel, PanelHeader, Select, Button, SimulatedBanner, Tabs, EmptyState } from "@/components/ui";
import { useInterval } from "@/hooks";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

const POSITIONS: Record<string, { x: number; y: number }> = {
  planning: { x: 90, y: 40 },
  research: { x: 300, y: 20 },
  memory: { x: 300, y: 130 },
  reasoning: { x: 90, y: 135 },
  execution: { x: 300, y: 250 },
  verification: { x: 90, y: 250 },
};

const W = 440, H = 320;

export default function AgentSimulatorPage() {
  const toast = useToast();
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [tick, setTick] = useState(0);
  const [running, setRunning] = useState(false);
  const [view, setView] = useState("timeline");

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const state = useMemo(() => simulate(scenario, tick), [scenario, tick]);
  useInterval(() => setTick((t) => Math.min(t + 1, state.totalTicks)), running ? 800 : null);

  const activeEdges = useMemo(() => {
    const edges = new Set<string>();
    state.events.slice(-2).forEach((e) => {
      if (e.kind === "message" && e.to) edges.add(`${e.from}->${e.to}`);
    });
    return edges;
  }, [state]);

  const run = () => {
    if (state.finished) {
      setTick(0);
      toast("Scenario reset — running again", "info");
    }
    setRunning(true);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Agent Simulator"
        description="Simulated multi-agent orchestration. Watch a deterministic pipeline of specialized agents coordinate on a scenario."
        actions={
          <>
            <Select value={scenarioId} options={SCENARIOS.map((s) => ({ value: s.id, label: s.label }))} onChange={(v) => { setScenarioId(v); setTick(0); setRunning(false); }} />
            <Button variant={running ? "outline" : "primary"} onClick={run}>{state.finished ? "Restart" : running ? "Pause" : "Start"}</Button>
            <Button onClick={() => setTick((t) => Math.min(t + 1, state.totalTicks))}>Step</Button>
            <Button variant="ghost" onClick={() => { setRunning(false); setTick(0); toast("Simulation reset", "info"); }}>Reset</Button>
          </>
        }
      />
      <SimulatedBanner>
        Agents, messages, and progress are fully simulated with deterministic state transitions — no external LLMs are involved.
      </SimulatedBanner>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel>
          <PanelHeader title="Orchestration Canvas" sub={`${scenario.description} · tick ${tick}/${state.totalTicks}`} />
          <div className="p-4">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg border border-line bg-bg-2">
              {/* edges */}
              {(["planning", "research", "reasoning", "execution", "verification"] as const).flatMap((a) =>
                (["memory", "verification", "reasoning", "planning"] as const).map((b) => {
                  if (a === b) return null;
                  const key = `${a}->${b}`;
                  const pa = POSITIONS[a], pb = POSITIONS[b];
                  const active = activeEdges.has(key);
                  return (
                    <line
                      key={key}
                      x1={pa.x + 34} y1={pa.y + 15} x2={pb.x + 34} y2={pb.y + 15}
                      stroke={active ? "#00d9ff" : "#1b2633"}
                      strokeWidth={active ? 2 : 1}
                      strokeDasharray={active ? "5 4" : undefined}
                      opacity={active ? 1 : 0.6}
                      className={active ? "animate-signal" : undefined}
                    />
                  );
                })
              )}
              {/* nodes */}
              {AGENTS.map((a) => {
                const st = state.agents[a.id];
                const p = POSITIONS[a.id];
                const busy = st.status === "working" || st.status === "messaging";
                return (
                  <g key={a.id}>
                    {busy && <circle cx={p.x + 34} cy={p.y + 15} r={26} fill={a.color} opacity={0.12} />}
                    <rect x={p.x} y={p.y} width={68} height={30} rx={7} fill="#121823" stroke={busy ? a.color : "#1b2633"} strokeWidth={busy ? 1.6 : 1} />
                    <circle cx={p.x + 10} cy={p.y + 15} r={3.5} fill={busy ? a.color : "#31435a"} />
                    <text x={p.x + 19} y={p.y + 12.5} fontSize={7.5} fill="#f3f6fc">{a.name.replace(" Agent", "")}</text>
                    <text x={p.x + 19} y={p.y + 22.5} fontSize={6} fill="#8793a5">{st.status}</text>
                    {st.progress > 0 && st.progress < 100 && (
                      <rect x={p.x} y={p.y + 30} width={(68 * st.progress) / 100} height={2.5} rx={1} fill={a.color} />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Agent States" sub="Live status from the simulation engine" />
            <div className="grid gap-2 p-4 sm:grid-cols-2">
              {AGENTS.map((a) => {
                const st = state.agents[a.id];
                return (
                  <div key={a.id} className="rounded-lg border border-line bg-elevated/60 p-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: st.status === "idle" ? "#31435a" : a.color }} />
                      <span className="text-xs font-medium text-ink">{a.name}</span>
                      <span className={cn("ml-auto text-[10px]", st.status === "done" ? "text-good" : "text-mute")}>{st.status}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-mute">{st.current ?? a.description}</p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${st.progress}%`, background: a.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>

      <Panel>
        <PanelHeader
          title="Execution Timeline"
          sub={`Scenario: ${scenario.label} · ${state.finished ? "complete" : `tick ${tick} of ${state.totalTicks}`}`}
          right={
            <Tabs
              tabs={[
                { id: "timeline", label: "Timeline" },
                { id: "queue", label: "Task Queue" },
                { id: "trace", label: "Trace" },
              ]}
              active={view}
              onChange={setView}
            />
          }
        />
        <div className="max-h-80 overflow-y-auto p-4">
          {view === "timeline" && (
            state.events.length === 0 ? (
              <EmptyState title="No events yet" hint="Start or step the simulation to generate agent activity." />
            ) : (
              <ol className="relative space-y-3 border-l border-line pl-4">
                {state.events.map((e, i) => (
                  <li key={i} className="relative">
                    <span
                      className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-bg"
                      style={{ background: agentById(e.from).color }}
                    />
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono text-[10px] text-mute">t{String(e.tick).padStart(2, "0")}</span>
                      <span className="font-medium text-ink">{agentById(e.from).name}</span>
                      {e.kind === "message" && e.to && (
                        <>
                          <span className="text-mute">→</span>
                          <span className="text-accent">{agentById(e.to).name}</span>
                          <span className="rounded border border-accent/30 bg-accent/10 px-1.5 text-[10px] text-accent">message</span>
                        </>
                      )}
                      <span className="text-mute">· {e.action}</span>
                    </div>
                  </li>
                ))}
              </ol>
            )
          )}
          {view === "queue" && (
            (() => {
              let t = 0;
              const upcoming = scenario.steps.filter(() => true);
              const past: number[] = [];
              upcoming.forEach((s) => { past.push(t); t += s.ticks; });
              const pending = upcoming.filter((_, i) => past[i] >= tick);
              return pending.length === 0 ? (
                <EmptyState title="Task queue empty" hint="All scenario tasks have been dispatched." />
              ) : (
                <ul className="space-y-2">
                  {pending.map((s, i) => (
                    <li key={i} className="flex items-center gap-3 rounded-lg border border-line bg-elevated/50 px-3 py-2 text-xs">
                      <span className="rounded border border-line bg-bg-2 px-1.5 py-0.5 font-mono text-[10px] text-mute">{agentById(s.from).name}</span>
                      <span className="flex-1 text-ink">{s.action}</span>
                      {s.kind === "message" && s.to && <span className="text-[10px] text-accent">→ {agentById(s.to).name}</span>}
                      <span className="font-mono text-[10px] text-mute">{s.ticks} ticks</span>
                    </li>
                  ))}
                </ul>
              );
            })()
          )}
          {view === "trace" && (
            state.events.length === 0 ? (
              <EmptyState title="Trace is empty" hint="Run the scenario to record an execution trace." />
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-line text-left text-[10px] uppercase tracking-wide text-mute">
                    <th className="pb-2">Tick</th><th className="pb-2">Agent</th><th className="pb-2">Type</th><th className="pb-2">Action</th><th className="pb-2">Target</th>
                  </tr>
                </thead>
                <tbody>
                  {state.events.map((e: SimEvent, i) => (
                    <tr key={i} className="border-b border-line/50 last:border-0">
                      <td className="py-1.5 font-mono text-mute">{e.tick}</td>
                      <td className="py-1.5" style={{ color: agentById(e.from).color }}>{agentById(e.from).name}</td>
                      <td className="py-1.5 text-mute">{e.kind}</td>
                      <td className="py-1.5 text-ink">{e.action}</td>
                      <td className="py-1.5 text-mute">{e.to ? agentById(e.to).name : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </Panel>
    </div>
  );
}
