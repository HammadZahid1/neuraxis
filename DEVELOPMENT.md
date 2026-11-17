# NEURAXIS — Development Guide

## Prerequisites
- Node.js 18.18+ (tested on Node 24)
- npm 10+

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start dev server at `http://localhost:3000` |
| `npm run typecheck` | Strict TypeScript check (`tsc --noEmit`) |
| `npm run lint` | ESLint via Next.js |
| `npm run build` | Production build |
| `npm start` | Serve the production build |

## Workflow Conventions

### Adding a research module
1. Register it in `src/lib/modules.ts` (icon, path, description, group).
2. Create `src/app/(lab)/<id>/page.tsx`.
3. Put pure computation in `src/lib/sim/<topic>.ts` — never inside components.
4. Put static sample data in `src/lib/data/`.
5. If the module is simulated, add `<SimulatedBanner />` under the page header and word it precisely (what is simulated vs. real).

### Styling
- Tailwind v4 theme tokens live in `src/app/globals.css` under `@theme` (colors: `bg`, `panel`, `accent`, `violet`, `line`, …). Use them (`bg-panel`, `text-mute`) instead of raw hex in JSX.
- Reusable primitives (`Button`, `Panel`, `Stat`, `Slider`, `Tabs`, `Badge`, `EmptyState`, …) come from `src/components/ui.tsx`. Prefer composing them over writing bespoke markup.

### Determinism
Any generated data must come from a seeded PRNG (`mulberry32`). Never use `Math.random()` in engines — reproducibility is a core product promise.

### Git
- Milestone commits with conventional prefixes (`feat:`, `fix:`, `docs:`, `perf:`, `chore:`), pushed individually.
- Never commit build artifacts (`.next/`, `node_modules/` are ignored).

## Verification Checklist (run before merging)
1. `npm run typecheck` — zero errors.
2. `npm run build` — succeeds.
3. Visit every module route; exercise start/pause/step/reset and config controls.
4. Check browser console for errors/warnings on each route.
5. Spot-check responsive layout at 1280px, 768px, and 390px widths.

## Known Sharp Edges
- Dynamic imports with `ssr: false` are required for all Canvas components; importing them directly will break SSR.
- The landing hero and Vector Explorer need WebGL; there is no CSS fallback yet (see README roadmap).
- `useInterval` fires callbacks via refs — callbacks captured inside it always see fresh state.
