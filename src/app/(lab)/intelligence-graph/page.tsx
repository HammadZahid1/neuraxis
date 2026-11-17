"use client";

import { useMemo, useRef, useState } from "react";
import { PageHeader, Panel, PanelHeader, Badge, EmptyState, Button } from "@/components/ui";
import { GRAPH_EDGES, GRAPH_NODES, neighborsOf, type GraphNode } from "@/lib/data/knowledge-graph";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

const CAT_COLORS = { core: "#00d9ff", method: "#a78bfa", application: "#38d996" } as const;

export default function IntelligenceGraphPage() {
  const toast = useToast();
  const [selected, setSelected] = useState<GraphNode | null>(GRAPH_NODES[0]);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<Set<string>>(new Set());
  const [vp, setVp] = useState({ zoom: 1, x: 0, y: 0 });
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (n: GraphNode) =>
      !catFilter.has(n.category) && (!q || n.label.toLowerCase().includes(q) || n.description.toLowerCase().includes(q));
  }, [query, catFilter]);

  const neighborIds = useMemo(
    () => (selected ? new Set(neighborsOf(selected.id).flatMap((e) => [e.from, e.to])) : null),
    [selected]
  );

  const expand = () => {
    if (!selected) return;
    const connected = neighborsOf(selected.id).map((e) => GRAPH_NODES.find((n) => n.id === (e.from === selected.id ? e.to : e.from))!.label);
    toast(`“${selected.label}” connects to: ${connected.join(", ")}`, "info");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Intelligence Graph"
        description="An interactive knowledge graph of AI concepts. Select nodes to trace relationships across the field."
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <Panel>
          <PanelHeader
            title="Graph Canvas"
            sub="drag to pan · scroll to zoom · click a node"
            right={
              <div className="flex gap-1">
                {(["core", "method", "application"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCatFilter((f) => {
                      const next = new Set(f);
                      if (next.has(c)) next.delete(c);
                      else next.add(c);
                      return next;
                    })}
                    className={cn(
                      "focus-ring rounded-md border px-2 py-1 text-[10px] capitalize transition-colors",
                      catFilter.has(c) ? "border-line text-mute line-through opacity-50" : "border-transparent text-ink"
                    )}
                    style={catFilter.has(c) ? undefined : { color: CAT_COLORS[c] }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            }
          />
          <div
            className="relative h-[500px] touch-none overflow-hidden rounded-xl bg-bg-2"
            onWheel={(e) => {
              e.preventDefault();
              setVp((v) => ({ ...v, zoom: Math.min(2, Math.max(0.5, v.zoom * (e.deltaY < 0 ? 1.1 : 0.9))) }));
            }}
            onPointerDown={(e) => { drag.current = { sx: e.clientX, sy: e.clientY, ox: vp.x, oy: vp.y }; (e.target as Element).setPointerCapture?.(e.pointerId); }}
            onPointerMove={(e) => { if (drag.current) setVp((v) => ({ ...v, x: drag.current!.ox + e.clientX - drag.current!.sx, y: drag.current!.oy + e.clientY - drag.current!.sy })); }}
            onPointerUp={() => { drag.current = null; }}
          >
            <svg viewBox="0 0 620 520" className="h-full w-full select-none" style={{ transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})` }}>
              {GRAPH_EDGES.map((e, i) => {
                const a = GRAPH_NODES.find((n) => n.id === e.from)!, b = GRAPH_NODES.find((n) => n.id === e.to)!;
                const highlight = neighborIds && (e.from === selected?.id || e.to === selected?.id);
                const dimmed = !(matches(a) && matches(b));
                return (
                  <g key={i} opacity={dimmed ? 0.12 : highlight ? 1 : 0.45}>
                    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={highlight ? "#00d9ff" : "#1b2633"} strokeWidth={highlight ? 2 : 1.2} />
                    {highlight && (
                      <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 5} textAnchor="middle" fontSize={9} fill="#8793a5">
                        {e.label}
                      </text>
                    )}
                  </g>
                );
              })}
              {GRAPH_NODES.map((n) => {
                const dim = !matches(n);
                const isSel = selected?.id === n.id;
                const isNeighbor = neighborIds?.has(n.id) ?? false;
                return (
                  <g key={n.id} opacity={dim ? 0.12 : 1} onClick={() => setSelected(n)} className="cursor-pointer">
                    {(isSel || isNeighbor) && <circle cx={n.x} cy={n.y} r={isSel ? 26 : 22} fill={CAT_COLORS[n.category]} opacity={isSel ? 0.18 : 0.08} />}
                    <circle
                      cx={n.x} cy={n.y} r={n.category === "core" ? 15 : 11}
                      fill="#121823"
                      stroke={isSel ? "#f3f6fc" : CAT_COLORS[n.category]}
                      strokeWidth={isSel ? 2.4 : isNeighbor ? 1.8 : 1.2}
                    />
                    <text x={n.x} y={n.y + 3.5} textAnchor="middle" fontSize={9} fill={CAT_COLORS[n.category]} fontFamily="monospace">
                      {n.label.slice(0, 2).toUpperCase()}
                    </text>
                    <text x={n.x} y={n.y + (n.category === "core" ? 28 : 24)} textAnchor="middle" fontSize={10.5} fill={isSel ? "#f3f6fc" : "#8793a5"}>
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="absolute bottom-3 right-3 flex flex-col gap-1">
              <button onClick={() => setVp((v) => ({ ...v, zoom: Math.min(2, v.zoom * 1.15) }))} className="focus-ring h-7 w-7 rounded-md border border-line bg-panel font-mono text-xs text-mute hover:text-ink">+</button>
              <button onClick={() => setVp((v) => ({ ...v, zoom: Math.max(0.5, v.zoom * 0.87) }))} className="focus-ring h-7 w-7 rounded-md border border-line bg-panel font-mono text-xs text-mute hover:text-ink">−</button>
              <button onClick={() => setVp({ zoom: 1, x: 0, y: 0 })} className="focus-ring h-7 w-7 rounded-md border border-line bg-panel text-[10px] text-mute hover:text-ink" title="Reset view">⌂</button>
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Search" sub="Filter nodes by name or description" />
            <div className="p-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. attention, vision…"
                className="focus-ring h-9 w-full rounded-lg border border-line bg-bg-2 px-3 text-sm text-ink placeholder:text-mute/50"
              />
              <p className="mt-2 text-[11px] text-mute">{GRAPH_NODES.filter(matches).length} of {GRAPH_NODES.length} nodes visible</p>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Node Inspector" sub={selected ? selected.label : "Click a node"} right={selected ? <Button size="sm" variant="ghost" onClick={expand}>Trace</Button> : undefined} />
            {selected ? (
              <div className="space-y-3 p-4 text-xs">
                <Badge tone={selected.category === "core" ? "accent" : selected.category === "method" ? "violet" : "good"}>{selected.category}</Badge>
                <p className="leading-relaxed text-mute">{selected.description}</p>
                <div>
                  <div className="mb-1.5 font-medium text-ink">Relationships ({neighborsOf(selected.id).length})</div>
                  <ul className="space-y-1.5">
                    {neighborsOf(selected.id).map((e, i) => {
                      const other = e.from === selected.id ? e.to : e.from;
                      const node = GRAPH_NODES.find((n) => n.id === other)!;
                      return (
                        <li key={i}>
                          <button
                            onClick={() => setSelected(node)}
                            className="focus-ring flex w-full items-center gap-2 rounded-md border border-line bg-elevated/50 px-2.5 py-1.5 text-left hover:border-[#2c3e54]"
                          >
                            <span className="text-[10px] text-mute">{e.from === selected.id ? "→" : "←"}</span>
                            <span className="flex-1 text-ink">{node.label}</span>
                            <span className="text-[10px] text-mute">{e.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-4"><EmptyState title="No node selected" hint="Click any node in the graph." /></div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
