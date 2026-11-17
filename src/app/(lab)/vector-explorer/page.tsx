"use client";

import { useMemo, useState } from "react";
import { PageHeader, Panel, PanelHeader, SimulatedBanner, Stat, Button } from "@/components/ui";
import dynamic from "next/dynamic";
import { CATEGORY_COLORS, CONCEPTS, type Category, type Concept } from "@/lib/data/concepts";
import { cosineSimilarity, dotProduct, euclideanDistance } from "@/lib/sim/embeddings";
import { useToast } from "@/components/toast";

const VectorCloud = dynamic(() => import("@/components/lab/vector-cloud"), { ssr: false });

const ALL_CATEGORIES = Object.keys(CATEGORY_COLORS) as Category[];

export default function VectorExplorerPage() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [hidden, setHidden] = useState<Set<Category>>(new Set());
  const [selected, setSelected] = useState<Concept | null>(null);
  const [compare, setCompare] = useState<Concept | null>(null);

  const handleSelect = (c: Concept) => {
    if (!selected || (selected && compare)) {
      setSelected(c);
      setCompare(null);
    } else if (selected && c.word !== selected.word) {
      setCompare(c);
      toast(`Comparing “${selected.word}” vs “${c.word}”`, "info");
    }
  };

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

          <VectorCloud visible={visible} selected={selected} onSelect={handleSelect} />
        </div>

        <div className="space-y-4">
          {selected && compare && (() => {
            const cos = cosineSimilarity(selected.embedding, compare.embedding, selected.norm, compare.norm);
            const euc = euclideanDistance(selected.embedding, compare.embedding);
            const dot = dotProduct(selected.embedding, compare.embedding);
            const angle = (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
            const verdict = cos > 0.5 ? "Strongly aligned" : cos > 0.1 ? "Weakly related" : cos < -0.3 ? "Opposing directions" : "Near-orthogonal";
            return (
              <Panel>
                <PanelHeader
                  title="Similarity Comparison"
                  sub="Real math on local 16-d vectors"
                  right={<Button size="sm" variant="ghost" onClick={() => { setCompare(null); toast("Comparison cleared", "info"); }}>Clear</Button>}
                />
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-ink">
                      <i className="h-2 w-2 rounded-full" style={{ background: CATEGORY_COLORS[selected.category] }} /> A: {selected.word}
                    </span>
                    <span className="flex items-center gap-1.5 text-ink">
                      B: {compare.word} <i className="h-2 w-2 rounded-full" style={{ background: CATEGORY_COLORS[compare.category] }} />
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-accent/25 bg-accent/[0.06] p-2.5">
                      <div className="text-[10px] uppercase tracking-wide text-mute">Cosine similarity</div>
                      <div className="font-mono text-lg text-accent">{cos.toFixed(4)}</div>
                    </div>
                    <div className="rounded-lg border border-line bg-bg-2 p-2.5">
                      <div className="text-[10px] uppercase tracking-wide text-mute">Euclidean distance</div>
                      <div className="font-mono text-lg text-ink">{euc.toFixed(4)}</div>
                    </div>
                    <div className="rounded-lg border border-line bg-bg-2 p-2.5">
                      <div className="text-[10px] uppercase tracking-wide text-mute">Dot product</div>
                      <div className="font-mono text-sm text-ink">{dot.toFixed(4)}</div>
                    </div>
                    <div className="rounded-lg border border-line bg-bg-2 p-2.5">
                      <div className="text-[10px] uppercase tracking-wide text-mute">Vector angle</div>
                      <div className="font-mono text-sm text-ink">{angle.toFixed(1)}°</div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-line bg-bg-2 p-2.5 font-mono text-[10px] leading-relaxed text-mute">
                    cos(θ) = (A · B) / (‖A‖‖B‖) = {dot.toFixed(3)} / ({selected.norm.toFixed(3)} × {compare.norm.toFixed(3)}) = {cos.toFixed(4)}
                  </div>
                  <p className="text-xs text-mute">
                    Interpretation: <span className="text-ink">{verdict}</span>. Cosine measures direction; Euclidean measures position.
                    +1 = identical direction, 0 = unrelated, −1 = opposite.
                  </p>
                </div>
              </Panel>
            );
          })()}
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
                        onClick={() => { handleSelect(c); setQuery(""); }}
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
            <PanelHeader title={compare ? "Vector A" : "Selected Concept"} sub={selected ? (compare ? `${selected.word} — pick another to re-compare` : "Click a second point to compare") : "Click a point in the cloud"} />
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
                <p className="text-xs leading-relaxed text-mute">
                  Embeddings map discrete symbols into continuous vector spaces where geometric relationships encode meaning.
                  Similar concepts end up near each other; directions can encode relationships. Real retrieval systems search
                  these spaces by cosine similarity — exactly the math shown in the comparison panel above.
                </p>
              </div>
            ) : (
              <div className="p-4 text-xs text-mute">
                Select a point to inspect its embedding. Hovering shows the concept name in the 3D view. Click a second
                point to run a full similarity comparison with real math.
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
