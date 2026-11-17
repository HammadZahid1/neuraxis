"use client";

import { useState } from "react";
import { PageHeader, Panel, PanelHeader } from "@/components/ui";
import { TransformerDiagram, TRANSFORMER_STAGES } from "@/components/lab/transformer-diagram";

export default function TransformerLabPage() {
  const [stage, setStage] = useState<string | null>("attention");
  const info = TRANSFORMER_STAGES.find((s) => s.id === stage);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="space-y-5">
        <PageHeader
          title="Transformer Lab"
          description="Explore the architecture behind modern language models — embeddings, positional encoding, multi-head attention, and residual blocks."
        />
      </div>

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
    </div>
  );
}
