# NEURAXIS

> **Explore the Architecture of Intelligence.**

NEURAXIS is an interactive AI research & intelligence visualization environment built for engineers, researchers, and curious minds. It lets you explore neural architectures, transformer attention, semantic embeddings, autonomous agent orchestration, RAG pipelines, model comparison, ML evaluation, training dynamics, knowledge graphs, and infrastructure telemetry — **entirely in the browser, with zero external services**.

![NEURAXIS](docs/screenshot-placeholder.png)

## Product Vision

Modern AI is often experienced as an opaque black box. NEURAXIS makes the *machinery* of AI tangible: watch signals propagate through a network, inspect attention patterns token by token, walk a retrieval pipeline stage by stage, and see how hyperparameters shape training curves. It is designed to look and feel like the internal research platform of a world-class AI lab — while remaining a fully self-contained frontend.

## Screenshots

| Module | Placeholder |
| --- | --- |
| Landing page with procedural 3D neural hero | `docs/screenshots/landing.png` *(add later)* |
| Neural Studio canvas | `docs/screenshots/neural-studio.png` *(add later)* |
| Transformer Lab attention heatmap | `docs/screenshots/transformer-lab.png` *(add later)* |
| Vector Explorer 3D space | `docs/screenshots/vector-explorer.png` *(add later)* |

## Features

### Research modules (10)

1. **Neural Studio** — configure layer counts/neuron densities (presets + custom), animate signal propagation with a layer-wave indicator, step/pause/reset, zoom & pan, per-neuron inspector (activation, bias, connections).
2. **Transformer Lab** — clickable architecture diagram with per-stage explanations; a local educational tokenizer with deterministic token IDs; real sinusoidal positional encodings; illustrative multi-head attention heatmaps (4 heads, causal mask, hover inspection).
3. **Vector Explorer** — 3D embedding cloud (Three.js/R3F) with 7 semantic clusters, search, cluster filters, hover/select; **real** cosine similarity, Euclidean distance, dot product, and vector angle between any two concepts.
4. **Agent Simulator** — six simulated specialized agents, four scenarios, deterministic tick-based progression, orchestration canvas with live message edges, agent status cards, plus a timeline / task-queue / execution-trace view.
5. **RAG Observatory** — a genuine local TF-IDF index over 8 sample documents; configurable top-K, similarity threshold, chunk size, and retrieval mode (semantic / keyword / hybrid); ranked retrieval with per-chunk explanations, context assembly preview, and a pipeline event timeline. Generation is intentionally not performed.
6. **Model Arena** — five fictional model profiles with a spec table, capability radar chart, latency/throughput bars, and detail panel (up to 3 models side by side).
7. **Evaluation Lab** — three sample confusion matrices; accuracy, precision, recall, and F1 **actually computed** from the matrices, per-class report, interactive matrix with class focus, per-class F1 chart, metric guide, and session evaluation history.
8. **Training Observatory** — deterministic simulated loss/accuracy curves responding to learning rate, epochs, batch size, and optimizer; live epoch-by-epoch playback, overfitting detection signal, LR schedule, and batch statistics.
9. **Intelligence Graph** — interactive AI knowledge graph (13 nodes, 14 labeled edges) with pan/zoom, category filters, search, node inspector, relationship tracing, and neighbor highlighting.
10. **System Monitor** — simulated CPU/memory/GPU/latency/throughput/queue metrics with live sparklines, historical area chart, and a severity-tagged event log. Clearly labeled as simulated.

### Global interaction

- **Command palette** — `Ctrl+K` / `⌘K`, arrow-key navigation, fuzzy module search.
- Collapsible sidebar (preference persisted to `localStorage`), responsive mobile drawer.
- Notifications menu, toasts, tooltips, tabs, dialogs, empty states, and reset controls everywhere.
- Reduced-motion support, keyboard-accessible controls, lazy-loaded 3D views.

## Technology Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first theme tokens) |
| Animation | Framer Motion |
| 3D | Three.js, React Three Fiber, Drei |
| Charts | Recharts |
| Icons | Lucide React |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page (hero + module showcase)
│   ├── layout.tsx, globals.css   # Root layout + design system
│   └── (lab)/                    # Research environment route group
│       ├── layout.tsx            # Shell: sidebar + top bar + palette + toasts
│       └── <module>/page.tsx     # One route per research module
├── components/
│   ├── ui.tsx                    # Reusable primitives (Button, Panel, Slider…)
│   ├── toast.tsx                 # Toast provider
│   ├── lab/                      # Sidebar, top bar, palette, canvases, heatmap…
│   └── landing/                  # Procedural 3D hero
├── lib/
│   ├── sim/                      # Simulation engines (pure TS, no React)
│   ├── data/                     # Sample datasets (concepts, docs, models…)
│   ├── modules.ts                # Module registry (single source of nav truth)
│   └── utils.ts
└── hooks/                        # useLocalStorage, useInterval, shortcuts…
```

## Installation

```bash
git clone https://github.com/HammadZahid1/neuraxis.git
cd neuraxis
npm install
```

## Development

```bash
npm run dev        # http://localhost:3000
npm run typecheck  # strict TypeScript check
npm run lint
```

## Production Build

```bash
npm run build
npm start
```

## Simulation Methodology

NEURAXIS separates **simulation logic** (`src/lib/sim/*`, pure deterministic TypeScript) from **presentation** (React components). Two honesty rules govern every module:

1. **Clearly labeled** — every simulated surface carries a "simulated" banner stating what is synthetic and why.
2. **Real math where it matters** — cosine similarity, Euclidean distance, TF-IDF retrieval scoring, softmax attention normalization, positional encodings, and all classification metrics are genuinely computed in the browser from local data. Everything else (weights, agent behavior, training curves, telemetry) is deterministic procedural generation — reproducible, seeded, and never presented as real inference or real monitoring.

No API keys, databases, backends, or third-party inference services are used anywhere.

## Technical Limitations

- All "models" are fictional illustrations; nothing performs real neural inference.
- The tokenizer is educational (whitespace/punctuation), not subword BPE.
- 3D scenes target mid-range hardware; a WebGL-capable browser is required for the hero and Vector Explorer.
- Preferences live in `localStorage`; clearing site data resets them.

## Roadmap

- [ ] Export/share a module snapshot as PNG
- [ ] Backpropagation visualization in Neural Studio
- [ ] Additional attention-head patterns and BPE-style tokenizer demo
- [ ] Graph editor (add/remove nodes and edges)
- [ ] Dark/light theme toggle

## Contribution Guidelines

Issues and PRs are welcome. Keep changes consistent with the existing structure: simulation logic goes in `src/lib/sim/`, sample data in `src/lib/data/`, and keep every simulated surface honestly labeled. Run `npm run typecheck` and `npm run build` before submitting.

## License

MIT — see [LICENSE](LICENSE).
