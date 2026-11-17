"use client";

import { useMemo, useState } from "react";
import { PageHeader, Panel, PanelHeader, Select, Tabs, Tooltip } from "@/components/ui";
import { TransformerDiagram, TRANSFORMER_STAGES } from "@/components/lab/transformer-diagram";
import { AttentionHeatmap } from "@/components/lab/attention-heatmap";
import { attentionMatrix, HEAD_NAMES, positionalEncoding, tokenize } from "@/lib/sim/transformer";
import { useLocalStorage } from "@/hooks";

const SAMPLE = "The transformer architecture revolutionized modern machine learning.";

export default function TransformerLabPage() {
  const [tab, setTab] = useState("architecture");
  const [text, setText] = useState(SAMPLE);
  const [head, setHead] = useState("0");
  const [matrixPrecision] = useLocalStorage("nx-matrix-precision", 2);
  const [stage, setStage] = useState<string | null>("attention");
  const info = TRANSFORMER_STAGES.find((s) => s.id === stage);

  const tokens = useMemo(() => tokenize(text), [text]);
  const matrix = useMemo(() => attentionMatrix(tokens, Number(head), true), [tokens, head]);
  const headIdx = Number(head);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="space-y-5">
        <PageHeader
          title="Transformer Lab"
          description="Explore the architecture behind modern language models — embeddings, positional encoding, multi-head attention, and residual blocks."
        />
        <Tabs
          tabs={[
            { id: "architecture", label: "Architecture Explorer" },
            { id: "attention", label: "Attention Inspector" },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === "architecture" ? (
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel>
          <PanelHeader title="Transformer Block" sub="Click any stage to inspect it" />
          <div className="p-5">
            <TransformerDiagram active={stage} onSelect={setStage} />
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Stage Explanation" sub={info ? info.name : "Select a stage"} />
            {info ? (
              <div className="space-y-3 p-5 text-sm">
                {info.formula && (
                  <div className="rounded-lg border border-line bg-bg-2 px-3 py-2 font-mono text-xs text-accent">{info.formula}</div>
                )}
                <p className="text-ink">{info.summary}</p>
                <p className="text-xs leading-relaxed text-mute">{info.detail}</p>
              </div>
            ) : (
              <div className="p-5 text-xs text-mute">Choose a stage in the diagram to read its explanation.</div>
            )}
          </Panel>

          <Panel>
            <PanelHeader title="How Attention Works" sub="The core mechanism" />
            <div className="space-y-3 p-5 text-xs leading-relaxed text-mute">
              <p>
                Attention lets each token gather information from every other token. A <span className="text-ink">query</span> vector is compared
                against every <span className="text-ink">key</span>; the similarities are scaled, normalized by softmax into weights, then used to
                blend <span className="text-ink">value</span> vectors.
              </p>
              <div className="rounded-lg border border-line bg-bg-2 p-3 font-mono text-[11px] text-accent">
                Attention(Q, K, V) = softmax(QKᵀ / √d_k) · V
              </div>
              <p>
                Splitting this across multiple heads lets the model track different relationships simultaneously — one head may follow syntax,
                another coreference, another positional patterns. The next tab visualizes exactly this, head by head.
              </p>
              <p className="rounded-lg border border-warn/25 bg-warn/5 p-2.5 text-[11px] text-[#d9b06a]">
                Educational note: this environment demonstrates architecture and attention patterns deterministically. It does not implement a
                production transformer model.
              </p>
            </div>
          </Panel>
        </div>
      </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Panel>
              <PanelHeader
                title="Tokenization"
                sub="Local educational tokenizer — whitespace/punctuation splits with deterministic IDs"
                right={<span className="font-mono text-[10px] text-mute">{tokens.length} tokens</span>}
              />
              <div className="space-y-3 p-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={2}
                  maxLength={200}
                  className="focus-ring w-full resize-none rounded-lg border border-line bg-bg-2 px-3 py-2.5 text-sm text-ink placeholder:text-mute/50"
                  placeholder="Enter sample text to tokenize…"
                />
                <div className="flex flex-wrap gap-1.5">
                  {tokens.map((t) => (
                    <Tooltip key={t.pos} tip={`ID ${t.id}`}>
                      <span className="cursor-default rounded-md border border-line bg-elevated px-2 py-1 text-xs text-ink">
                        {t.text}
                      </span>
                    </Tooltip>
                  ))}
                  {tokens.length === 0 && <span className="text-xs text-mute">Type above to tokenize.</span>}
                </div>
              </div>
            </Panel>

            <Panel>
              <PanelHeader
                title={`Attention Matrix — ${HEAD_NAMES[headIdx]}`}
                sub="Illustrative multi-head pattern · softmax rows · causal mask"
                right={
                  <Select
                    value={head}
                    options={HEAD_NAMES.map((h, i) => ({ value: String(i), label: h }))}
                    onChange={setHead}
                  />
                }
              />
              <div className="p-4">
                {tokens.length > 0 ? (
                  <AttentionHeatmap tokens={tokens} matrix={matrix} precision={Number(matrixPrecision)} />
                ) : (
                  <p className="py-8 text-center text-xs text-mute">Tokenize text above to generate the attention map.</p>
                )}
              </div>
            </Panel>
          </div>

          <div className="space-y-4">
            <Panel>
              <PanelHeader title="Positional Encoding" sub="Real sinusoidal values: PE(pos, i)" />
              <div className="overflow-x-auto p-4">
                <table className="w-full font-mono text-[10px]">
                  <thead>
                    <tr className="text-mute">
                      <th className="pb-2 text-left">pos</th>
                      {[0, 1, 2, 3, 4].map((i) => <th key={i} className="pb-2 text-right">d{i}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.slice(0, 10).map((t) => (
                      <tr key={t.pos} className="border-t border-line/60">
                        <td className="py-1.5 text-mute">{t.pos}</td>
                        {[0, 1, 2, 3, 4].map((i) => (
                          <td key={i} className="py-1.5 text-right text-accent/90">{positionalEncoding(t.pos, i).toFixed(2)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Reading the Map" sub="Educational guidance" />
              <div className="space-y-2.5 p-4 text-xs leading-relaxed text-mute">
                <p>Each cell shows how strongly a <span className="text-ink">query token</span> (row) pulls information from a <span className="text-ink">key token</span> (column).</p>
                <p>Switch heads to see different relationship patterns — the local-context head concentrates near the diagonal, while the semantic head spreads further.</p>
                <p>Hover a cell to inspect a single query–key pair. Click the <span className="text-ink">Attention Inspector</span> pattern against real model behaviour learned during pretraining.</p>
                <p className="rounded-lg border border-warn/25 bg-warn/5 p-2.5 text-[11px] text-[#d9b06a]">
                  Simulated: weights are derived deterministically from local token vectors — not from a trained model.
                </p>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
