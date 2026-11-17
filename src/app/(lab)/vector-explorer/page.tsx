"use client";

import { useMemo, useState } from "react";
import { PageHeader, Panel, PanelHeader, SimulatedBanner, Stat } from "@/components/ui";
import dynamic from "next/dynamic";
import { CATEGORY_COLORS, CONCEPTS, type Category, type Concept } from "@/lib/data/concepts";

const VectorCloud = dynamic(() => import("@/components/lab/vector-cloud"), { ssr: false });

const ALL_CATEGORIES = Object.keys(CATEGORY_COLORS) as Category[];

export default function VectorExplorerPage() {
  const [query, setQuery] = useState("");
  const [hidden, setHidden] = useState<Set<Category>>(new Set());
  const [selected, setSelected] = useState<Concept | null>(null);

  const visible = useMemo(() => new Set(ALL_CATEGORIES.filter((c) => !hidden.has(c))), [hidden]);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return CONCEPTS.filter((c) => c.word.toLowerCase().includes(q) && visible.has(c.category)).slice(0, 8);
  }, [query, visible]);

  const toggleCategory = (c: Category) => {
    setHidden((h) => {
      const next = new Set(h);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Vector Explorer"
        description="A 3D semantic embedding space with clustered concepts. Explore how language becomes geometry."
      />
      <SimulatedBanner>
        Positions and embeddings are procedurally generated for visualization. Similarity math is real, computed locally.
      </SimulatedBanner>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Concepts" value={CONCEPTS.length} hint="procedurally placed" />
            <Stat label="Clusters" value={ALL_CATEGORIES.length} hint="semantic groups" />
            <Stat label="Dimensions" value={16} hint="per embedding" />
            <Stat label="Visible" value={CONCEPTS.filter((c) => visible.has(c.category)).length} hint="points in view" />
          </div>

          <VectorCloud visible={visible} selected={selected} onSelect={setSelected} />
        </div>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Search Concepts" sub="Find a sample concept" />
            <div className="p-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. attention, gradient, reef…"
                className="focus-ring h-9 w-full rounded-lg border border-line bg-bg-2 px-3 text-sm text-ink placeholder:text-mute/50"
              />
              {results.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {results.map((c) => (
                    <li key={c.word}>
                      <button
                        onClick={() => { setSelected(c); setQuery(""); }}
                        className="focus-ring flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-mute hover:bg-white/[0.04] hover:text-ink"
                      >
                        <i className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: CATEGORY_COLORS[c.category] }} />
                        <span className="flex-1 truncate">{c.word}</span>
                        <span className="font-mono text-[10px] opacity-70">{c.category}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Cluster Filters" sub="Show or hide semantic groups" />
            <div className="space-y-2 p-4">
              {ALL_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCategory(c)}
                  className="focus-ring flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-mute hover:bg-white/[0.04]"
                >
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${hidden.has(c) ? "border-line" : "border-transparent"}`}
                    style={hidden.has(c) ? undefined : { background: CATEGORY_COLORS[c] }}
                  >
                    {!hidden.has(c) && <span className="text-[8px] text-[#04121a]">✓</span>}
                  </span>
                  <span className={hidden.has(c) ? "opacity-50" : "text-ink"}>{c}</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Selected Concept" sub={selected ? selected.word : "Click a point in the cloud"} />
            {selected ? (
              <div className="space-y-2.5 p-4 text-xs">
                <div className="flex items-center gap-2">
                  <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: CATEGORY_COLORS[selected.category] }} />
                  <span className="text-sm text-ink">{selected.word}</span>
                </div>
                {[
                  ["Category", selected.category],
                  ["Embedding dimension", "16"],
                  ["Vector norm (L2)", selected.norm.toFixed(4)],
                  ["First 4 components", `[${selected.embedding.slice(0, 4).map((v) => v.toFixed(2)).join(", ")} …]`],
                  ["Cluster position", `[${selected.p.map((v) => v.toFixed(1)).join(", ")}]`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between border-b border-line/60 pb-1.5">
                    <span className="text-mute">{k}</span>
                    <span className="font-mono text-ink">{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-xs text-mute">
                Select a point to inspect its embedding. Hovering shows the concept name in the 3D view.
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
