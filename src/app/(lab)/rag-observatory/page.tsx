"use client";

import { useMemo, useState } from "react";
import { PageHeader, Panel, PanelHeader, Button, Select, Slider, SimulatedBanner, Badge, EmptyState } from "@/components/ui";
import { chunkDocuments } from "@/lib/data/documents";
import { buildIndex, retrieve, type RetrievalMode } from "@/lib/sim/rag";
import { useToast } from "@/components/toast";
import { motion } from "framer-motion";

const STAGES = ["Query Processing", "Embedding", "Vector Retrieval", "Similarity Ranking", "Context Assembly", "Generation"];

const DEFAULT_QUERY = "How does retrieval-augmented generation reduce hallucination?";

export default function RagObservatoryPage() {
  const toast = useToast();
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [topK, setTopK] = useState(3);
  const [threshold, setThreshold] = useState(0.05);
  const [chunkSize, setChunkSize] = useState("2");
  const [mode, setMode] = useState<RetrievalMode>("hybrid");
  const [stage, setStage] = useState(-1); // -1 idle, 0..5 running stages, 6 done
  const [showChunk, setShowChunk] = useState<string | null>(null);
  const [events, setEvents] = useState<Array<{ t: string; stage: string; msg: string }>>([]);

  const chunks = useMemo(() => chunkDocuments(Number(chunkSize)), [chunkSize]);
  const index = useMemo(() => buildIndex(chunks), [chunks]);
  const output = useMemo(
    () => retrieve(query, index, { topK, threshold, mode }),
    [query, index, topK, threshold, mode]
  );

  const run = () => {
    if (stage >= 0 && stage < 6) return;
    setEvents([]);
    setStage(0);
    const start = Date.now();
    const msgs = [
      `Tokenized query → ${output.queryTerms.length} terms`,
      `Embedded query over ${output.vocabularySize}-term vocabulary`,
      `Scanning ${chunks.length} chunks (${mode} mode)`,
      `Ranked candidates, ${output.results.length} above ${(threshold * 100).toFixed(0)}% threshold`,
      `Assembled context from ${output.results.length} chunks (${output.context.length} chars)`,
      `Pipeline complete — generation stage is intentionally omitted (no external LLM)`,
    ];
    let s = 0;
    const iv = window.setInterval(() => {
      const now = ((Date.now() - start) / 1000).toFixed(2);
      setEvents((e) => [...e, { t: `+${now}s`, stage: STAGES[Math.min(s, 5)], msg: msgs[s] }]);
      s += 1;
      setStage(s);
      if (s >= 6) {
        window.clearInterval(iv);
        toast(`Retrieved ${output.results.length} chunks (top ${topK}, threshold ${threshold})`, "good");
      }
    }, 450);
  };

  const running = stage >= 0 && stage < 6;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="RAG Observatory"
        description="Step through a retrieval-augmented generation pipeline with a real local index over the sample document collection."
        actions={<Button variant="primary" onClick={run} disabled={running}>{running ? "Running…" : "Run Pipeline"}</Button>}
      />
      <SimulatedBanner>
        Educational RAG pipeline. Retrieval scoring uses genuine local TF-IDF cosine similarity and keyword overlap — response generation is not performed by any model.
      </SimulatedBanner>

      {/* Pipeline */}
      <Panel className="overflow-x-auto">
        <div className="flex min-w-max items-center gap-1 p-4">
          {STAGES.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div
                className={`rounded-lg border px-3 py-2 text-xs transition-all ${
                  stage > i || stage === 6
                    ? "border-good/40 bg-good/[0.07] text-good"
                    : stage === i
                      ? "border-accent/50 bg-accent/10 text-accent"
                      : "border-line bg-bg-2 text-mute"
                }`}
              >
                <span className="mr-1.5 font-mono text-[10px] opacity-70">{String(i + 1).padStart(2, "0")}</span>
                {s}
              </div>
              {i < STAGES.length - 1 && <span className="text-mute/40">→</span>}
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        {/* Config */}
        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Query" sub="Editable sample query" />
            <div className="p-4">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
                className="focus-ring w-full resize-none rounded-lg border border-line bg-bg-2 px-3 py-2.5 text-sm text-ink placeholder:text-mute/50"
              />
              <p className="mt-2 text-[11px] text-mute">Query terms: {output.queryTerms.map((t) => `“${t}”`).join(" · ") || "none"}</p>
            </div>
          </Panel>
          <Panel>
            <PanelHeader title="Retrieval Configuration" sub={`Index: ${chunks.length} chunks · vocab ${output.vocabularySize}`} />
            <div className="space-y-4 p-4">
              <Slider label="Top K" value={topK} min={1} max={8} onChange={setTopK} />
              <Slider label="Similarity threshold" value={threshold} min={0} max={0.6} step={0.01} onChange={setThreshold} />
              <Select label="Chunk size (sentences per chunk)" value={chunkSize} options={[{ value: "1", label: "1 sentence" }, { value: "2", label: "2 sentences" }, { value: "3", label: "3 sentences" }]} onChange={(v) => { setChunkSize(v); setShowChunk(null); }} />
              <Select
                label="Retrieval mode"
                value={mode}
                options={[
                  { value: "hybrid", label: "Hybrid (60% semantic / 40% keyword)" },
                  { value: "semantic", label: "Semantic (TF-IDF cosine)" },
                  { value: "keyword", label: "Keyword (term overlap)" },
                ]}
                onChange={(v) => setMode(v as RetrievalMode)}
              />
            </div>
          </Panel>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Retrieved Chunks" sub={stage >= 3 || stage === -1 ? "Ranked by retrieval score" : "Retrieving…"} />
            {output.results.length === 0 ? (
              <div className="p-4">
                <EmptyState title="No chunks pass the threshold" hint="Lower the similarity threshold or rephrase the query." />
              </div>
            ) : (
              <ul className="divide-y divide-line/60">
                {output.results.map((r, i) => (
                  <li key={r.chunk.id} className="p-4">
                    <button className="w-full text-left" onClick={() => setShowChunk(showChunk === r.chunk.id ? null : r.chunk.id)}>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={i === 0 ? "accent" : "neutral"}>#{i + 1}</Badge>
                        <span className="text-sm text-ink">{r.chunk.docTitle}</span>
                        <span className="font-mono text-[11px] text-mute">chunk {r.chunk.index}</span>
                        <span className="ml-auto font-mono text-sm text-accent">{(r.score * 100).toFixed(1)}%</span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-mute">{r.chunk.text}</p>
                      {r.matchedTerms.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {r.matchedTerms.slice(0, 6).map((t) => <Badge key={t} tone="violet">{t}</Badge>)}
                        </div>
                      )}
                    </button>
                    {showChunk === r.chunk.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 rounded-lg border border-line bg-bg-2 p-3">
                        <p className="text-xs leading-relaxed text-mute">
                          <span className="text-ink">Why selected:</span> this chunk shares {r.matchedTerms.length} index terms with the query
                          {mode !== "keyword" ? " and its TF-IDF vector direction aligns with the query embedding" : ""}. Score {mode === "semantic" ? "= cosine" : mode === "keyword" ? "= query-term overlap" : "= 0.6·cosine + 0.4·overlap"} → {(r.score * 100).toFixed(1)}%, above the {(threshold * 100).toFixed(0)}% threshold.
                        </p>
                      </motion.div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Context Assembly Preview" sub="What would be placed into the model prompt" />
            <div className="p-4">
              {output.context ? (
                <pre className="max-h-44 overflow-y-auto whitespace-pre-wrap rounded-lg border border-line bg-bg-2 p-3 font-mono text-[11px] leading-relaxed text-mute">{output.context}</pre>
              ) : (
                <EmptyState title="No context assembled" hint="Run the pipeline with a lower threshold." />
              )}
              <p className="mt-2 text-[11px] text-mute">
                In a real RAG system, this context plus the query would be sent to a language model. NEURAXIS stops here by design — no inference service is called.
              </p>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Retrieval Event Timeline" sub="Pipeline execution log" right={events.length > 0 ? <Button size="sm" variant="ghost" onClick={() => setEvents([])}>Clear</Button> : undefined} />
            <div className="max-h-56 overflow-y-auto p-4">
              {events.length === 0 ? (
                <EmptyState title="No retrieval events" hint="Press “Run Pipeline” to execute the simulated flow." />
              ) : (
                <ol className="relative space-y-2.5 border-l border-line pl-4">
                  {events.map((e, i) => (
                    <li key={i} className="relative text-xs">
                      <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-accent" />
                      <span className="mr-2 font-mono text-[10px] text-mute">{e.t}</span>
                      <span className="mr-2 rounded border border-line bg-bg-2 px-1.5 py-px text-[10px] text-mute">{e.stage}</span>
                      <span className="text-mute">{e.msg}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
