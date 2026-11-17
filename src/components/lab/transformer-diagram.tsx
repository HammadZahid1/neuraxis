import { cn } from "@/lib/utils";

export interface StageInfo {
  id: string;
  name: string;
  formula?: string;
  summary: string;
  detail: string;
}

export const TRANSFORMER_STAGES: StageInfo[] = [
  {
    id: "input",
    name: "Input Embedding",
    formula: "x ∈ ℝ^(n × d_model)",
    summary: "Tokens are mapped to dense vectors of fixed dimension d_model.",
    detail:
      "Each token ID selects a learned row in an embedding matrix E ∈ ℝ^(V × d_model). The result is a sequence of n vectors, one per token. Embeddings place semantically similar tokens near each other in the vector space.",
  },
  {
    id: "positional",
    name: "Positional Encoding",
    formula: "PE(pos, 2i) = sin(pos/10000^(2i/d)), PE(pos, 2i+1) = cos(...)",
    summary: "Injects token order information, since attention is permutation-invariant.",
    detail:
      "Fixed sinusoidal encodings are added element-wise to the embeddings. Each dimension corresponds to a different wavelength, letting the model distinguish positions and generalize to longer sequences than seen during training.",
  },
  {
    id: "attention",
    name: "Multi-Head Attention",
    formula: "Attention(Q,K,V) = softmax(QKᵀ/√d_k) V",
    summary: "Every token attends to every other token across multiple representation subspaces.",
    detail:
      "Queries, keys, and values are linear projections of the input. Scaled dot-product attention scores each query against every key, producing a weighted mix of values. Multiple heads attend in parallel subspaces, capturing different relationship types (syntax, coreference, position).",
  },
  {
    id: "residual1",
    name: "Residual Connection + LayerNorm",
    formula: "x = LayerNorm(x + Sublayer(x))",
    summary: "Identity shortcuts stabilize gradients and enable very deep stacks.",
    detail:
      "The sublayer output is added back to its input before normalization. This preserves the original signal, mitigating vanishing gradients, while LayerNorm keeps activations well-scaled across depth.",
  },
  {
    id: "ffn",
    name: "Feed-Forward Network",
    formula: "FFN(x) = GELU(xW₁ + b₁)W₂ + b₂",
    summary: "A position-wise two-layer MLP that expands then contracts the representation.",
    detail:
      "Applied identically to each position: the hidden dimension (typically 4× d_model) expands, a nonlinearity is applied, then the projection returns to d_model. This is where much of the model's per-token transformation capacity lives.",
  },
  {
    id: "residual2",
    name: "Second Residual + LayerNorm",
    formula: "x = LayerNorm(x + FFN(x))",
    summary: "Same residual pattern wraps the feed-forward block.",
    detail:
      "One full transformer block therefore contains two residual paths: one around attention, one around the FFN. Stacking N blocks composes increasingly abstract representations.",
  },
  {
    id: "output",
    name: "Output Representation",
    formula: "h ∈ ℝ^(n × d_model)",
    summary: "The contextualized vector for each token, ready for task heads.",
    detail:
      "After the final block, each token's representation contains information aggregated from the entire context. Language-model heads project this to vocabulary logits; other heads adapt it for classification, retrieval, or embedding tasks.",
  },
];

export function TransformerDiagram({ active, onSelect }: { active: string | null; onSelect: (id: string) => void }) {
  const block = (id: string, label: string, sub: string, className?: string) => {
    const isActive = active === id;
    return (
      <button
        key={id}
        onClick={() => onSelect(id)}
        className={cn(
          "w-full rounded-lg border px-3 py-2.5 text-left transition-all",
          isActive ? "border-accent/60 bg-accent/[0.09] shadow-[0_0_18px_rgba(0,217,255,0.12)]" : "border-line bg-elevated hover:border-[#2c3e54]"
        )}
      >
        <div className={cn("text-xs font-medium", isActive ? "text-accent" : "text-ink")}>{label}</div>
        <div className="text-[10px] text-mute">{sub}</div>
      </button>
    );
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-1.5">
      {block("input", "Input Embedding", "token IDs → dense vectors")}
      <Arrow />
      {block("positional", "Positional Encoding", "sinusoidal position signal")}
      <Arrow />
      <div className="rounded-xl border border-violet/30 bg-violet/[0.05] p-2">
        <div className="mb-1.5 text-center font-mono text-[10px] text-lavender">× N blocks</div>
        <div className="space-y-1.5">
          {block("attention", "Multi-Head Attention", "Q · K · V · softmax")}
          <Arrow />
          {block("residual1", "Add & LayerNorm", "residual path")}
          <Arrow />
          {block("ffn", "Feed-Forward Network", "position-wise MLP")}
          <Arrow />
          {block("residual2", "Add & LayerNorm", "residual path")}
        </div>
      </div>
      <Arrow />
      {block("output", "Output Representation", "contextualized embeddings")}
    </div>
  );
}

function Arrow() {
  return <div className="flex justify-center text-mute/50">↓</div>;
}
