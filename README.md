# NEURAXIS

> **Explore the Architecture of Intelligence.**

NEURAXIS is an interactive AI research and intelligence visualization environment made for engineers, researchers, and anyone who is curious about how modern AI actually works under the hood. You can explore neural architectures, transformer attention, semantic embeddings, agent orchestration, RAG pipelines, model comparisons, ML evaluation, training dynamics, knowledge graphs, and infrastructure telemetry. Everything runs right in your browser with no external services at all.

![NEURAXIS](docs/screenshot-placeholder.png)

## Why I Built This

Most of us experience modern AI as a black box. NEURAXIS opens it up. Instead of reading about attention, you can look at it. Instead of imagining how a network propagates signals, you can watch it happen and click on individual neurons. Instead of trusting that RAG "just works," you can walk the retrieval pipeline stage by stage and see exactly why each chunk got picked.

The goal was to build something that looks and feels like the internal research platform of a serious AI lab, while staying completely self-contained. There is no backend, no API keys, and nothing to sign up for. Clone it, run it, and it just works.

## Screenshots

| Module | Placeholder |
| --- | --- |
| Landing page with procedural 3D neural hero | `docs/screenshots/landing.png` *(add later)* |
| Neural Studio canvas | `docs/screenshots/neural-studio.png` *(add later)* |
| Transformer Lab attention heatmap | `docs/screenshots/transformer-lab.png` *(add later)* |
| Vector Explorer 3D space | `docs/screenshots/vector-explorer.png` *(add later)* |

## What's Inside

### Research modules (10)

1. **Neural Studio.** Configure layer counts and neuron densities, pick from presets or build your own, then watch signals move through the network. You can pause, step, reset, zoom, pan, and click any neuron to inspect its activation, bias, and connections.
2. **Transformer Lab.** A clickable architecture diagram with plain-language explanations for every stage. Type your own text and the local tokenizer splits it into tokens with deterministic IDs. Real sinusoidal positional encodings and illustrative multi-head attention heatmaps you can hover over cell by cell.
3. **Vector Explorer.** A 3D embedding cloud with 7 semantic clusters. Search for concepts, filter clusters, and compare any two vectors. The cosine similarity, Euclidean distance, dot product, and angle are genuinely computed, not faked.
4. **Agent Simulator.** Six simulated agents with their own specialties cooperate across four scenarios. You get a live orchestration canvas, an activity timeline, a task queue, and a full execution trace.
5. **RAG Observatory.** A real local TF-IDF index over 8 sample documents. Tune top-K, the similarity threshold, chunk size, and the retrieval mode, then watch the pipeline run. Every retrieved chunk comes with an explanation of why it ranked. The generation step is intentionally left out.
6. **Model Arena.** Five fictional model profiles side by side. Spec table, capability radar, latency and throughput charts, and a detail panel for up to three models at once.
7. **Evaluation Lab.** Three sample confusion matrices. Accuracy, precision, recall, and F1 are actually calculated from the matrices in your browser, with a per-class report, an interactive matrix, and a guide that explains what each number means.
8. **Training Observatory.** Watch loss and accuracy curves evolve as you tweak the learning rate, batch size, optimizer, and epoch count. It even flags overfitting when validation loss starts drifting away from its best point.
9. **Intelligence Graph.** An interactive knowledge graph of AI concepts. Pan, zoom, search, filter by category, and trace relationships from node to node.
10. **System Monitor.** Simulated CPU, memory, GPU, latency, throughput, and queue metrics with live sparklines, historical charts, and an event log. Clearly labeled as simulated.

### Everyday interactions

- A command palette (`Ctrl+K` or `⌘K`) with arrow-key navigation and fuzzy module search
- A collapsible sidebar that remembers your preference
- Toasts, tooltips, tabs, empty states, and working reset controls everywhere
- Reduced-motion support and keyboard-accessible controls throughout

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

## How the Simulations Work

The simulation logic lives in `src/lib/sim/` as plain TypeScript with no React attached. Every engine is deterministic, seeded with `mulberry32`, so two people opening the same page see the exact same thing. Two rules shaped how all of this was built:

1. **Be honest about what is simulated.** Every module shows a "simulated" banner that says exactly which parts are synthetic and why. Nothing pretends to be real inference.
2. **Use real math wherever it counts.** Cosine similarity, Euclidean distance, TF-IDF retrieval scoring, softmax normalization, positional encodings, and every classification metric are computed for real, locally, from the data in the repo. Everything else, like the network weights, agent behavior, training curves, and telemetry, is deterministic procedural generation. It is reproducible and clearly not presented as the real thing.

No API keys, no databases, no backend, and no third-party inference services are used anywhere in the codebase.

## Technical Limitations

- There are no real models here and nothing performs real neural inference. That is the whole point, but worth saying plainly.
- The tokenizer is a simple educational one. It splits on words and punctuation rather than using subword BPE like production models do.
- The 3D scenes need a browser with WebGL. The hero and Vector Explorer have no fallback view yet.
- Preferences live in `localStorage`, so clearing your browser's site data resets them.

## Roadmap

- [ ] Export a module snapshot as a shareable PNG
- [ ] Backpropagation visualization in Neural Studio
- [ ] More attention-head patterns and a BPE-style tokenizer demo
- [ ] Graph editor for adding and removing nodes and edges
- [ ] Dark/light theme toggle

## Contributing

Issues and pull requests are welcome. Keep new simulation logic in `src/lib/sim/` and sample data in `src/lib/data/`, and please keep every simulated surface honestly labeled. Run `npm run typecheck` and `npm run build` before submitting so CI stays green.

## License

MIT. See [LICENSE](LICENSE) for the full text.
