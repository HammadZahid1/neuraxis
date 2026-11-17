# NEURAXIS — Architecture

## System Overview

NEURAXIS is a single-page-application-style Next.js App Router project with two experience zones:

```
Landing (public) ──► Research Environment (route group "(lab)")
                         ├── 10 module routes
                         ├── shared shell (sidebar / topbar / palette / toasts)
                         └── shared UI primitives
```

## Key Layers

### 1. Route group `(lab)/`
The parentheses keep URLs flat (`/neural-studio`) while sharing one layout that mounts the sidebar, top bar, command palette, and toast provider. The module registry in `src/lib/modules.ts` is the single source of truth for navigation, the command palette, breadcrumbs, and the overview grid — adding a module means adding one registry entry + one route.

### 2. Simulation engines (`src/lib/sim/`)
Pure, framework-free TypeScript. Each engine is deterministic (seeded `mulberry32` PRNG) and owns no React state:

| Engine | Responsibility | Real math? |
| --- | --- | --- |
| `neural-network.ts` | Layer construction, seeded weights, forward pass, wave progress | Forward pass + sigmoid are real; weights are fixed seeds |
| `transformer.ts` | Tokenizer, sinusoidal positional encoding, attention matrices | Positional math real; attention is illustrative projection |
| `embeddings.ts` | Cosine similarity, Euclidean distance, dot product | Fully real |
| `agents.ts` | Scenario scripts, tick-based state machine, event log | Deterministic simulation |
| `rag.ts` | Vocabulary/IDF building, TF-IDF vectors, ranking | Fully real local retrieval math |
| `evaluation.ts` | Metrics from confusion matrices | Fully real |
| `training.ts` | Curve synthesis from hyperparameters | Deterministic formulas, not real training |
| `metrics.ts` | Smooth telemetry random walks | Deterministic simulation |

### 3. Sample data (`src/lib/data/`)
Concepts, documents, model profiles, and the knowledge graph are static, versioned-in-git data. Concept embeddings and graph geometry are generated once at module load with fixed seeds, so every user sees the same environment.

### 4. Visualization components (`src/components/lab/`, `landing/`)
3D views (`neural-hero`, `vector-cloud`) are loaded with `next/dynamic({ ssr: false })` to keep WebGL out of the server bundle and avoid hydration issues. Charts use Recharts with the dark theme palette. Neural Studio and the Intelligence Graph use hand-rolled SVG canvases with zoom/pan transforms.

## State Management
- Module-local React state only — no global store needed.
- Harmless UI preferences (sidebar collapse, matrix precision, motion flag, uptime marker) persist via a `useLocalStorage` hook with try/catch guards.
- All sim state derives from `(config, tick)` so pause/step/reset are pure re-derivations.

## Honesty Boundaries
Every module renders a `SimulatedBanner` that names exactly what is simulated and what is real. The RAG pipeline and Transformer Lab stop before the "generation" stage by design — no inference service is contacted anywhere in the codebase.

## Performance Notes
- `dpr` clamps and `powerPreference: "low-power"` on all canvases.
- Points/lines use `BufferGeometry` built once via `useMemo`.
- SVG graph canvases memoize layout maps; connection counts stay in the hundreds.
- Charts disable entry animation for live-updating series.
- `prefers-reduced-motion` disables the hero rotation and CSS animations globally.
