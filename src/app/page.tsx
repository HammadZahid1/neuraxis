"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, ChevronRight, Hexagon, Github,
} from "lucide-react";
import { RESEARCH_MODULES } from "@/lib/modules";
import dynamic from "next/dynamic";

const NeuralHero = dynamic(() => import("@/components/landing/neural-hero"), { ssr: false });

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

const CAPABILITIES = [
  { title: "Architecture Intelligence", body: "Configure layer counts, neuron densities, and connectivity — then watch signals propagate through a live feedforward network." },
  { title: "Attention Transparency", body: "Tokenize text locally and inspect multi-head attention patterns on an interactive heatmap with per-token relationships." },
  { title: "Semantic Geometry", body: "Explore a 3D embedding space with real cosine similarity and Euclidean distance computed on local vectors." },
  { title: "Autonomous Orchestration", body: "Simulate a multi-agent pipeline with task queues, dependency graphs, and a full execution trace." },
];

const PIPELINE = [
  "Query Processing", "Embedding", "Vector Retrieval", "Similarity Ranking", "Context Assembly", "Response Generation",
];

const TECH_STACK = [
  "Next.js", "React 19", "TypeScript", "Tailwind CSS 4", "Framer Motion", "Three.js", "React Three Fiber", "Drei", "Recharts", "Lucide Icons",
];

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-x-clip">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-60" aria-hidden />
      <div className="pointer-events-none fixed left-1/2 top-[-20%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-[120px]" aria-hidden />
      <div className="pointer-events-none fixed bottom-[-10%] right-[-10%] h-[420px] w-[520px] rounded-full bg-violet/[0.06] blur-[120px]" aria-hidden />

      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-line/60 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 md:px-6">
          <Hexagon className="h-5 w-5 text-accent" strokeWidth={2.2} />
          <span className="text-sm font-semibold tracking-[0.2em]">NEURAXIS</span>
          <div className="flex-1" />
          <Link href="/overview" className="hidden rounded-lg px-3 py-2 text-xs text-mute hover:text-ink sm:block">Overview</Link>
          <Link href="/neural-studio" className="hidden rounded-lg px-3 py-2 text-xs text-mute hover:text-ink sm:block">Modules</Link>
          <Link href="/overview" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3.5 text-xs font-medium text-accent hover:bg-accent/20">
            Enter Research Environment <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 md:px-6 md:pt-28">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-panel/70 px-3 py-1 text-[11px] text-mute">
              <span className="h-1.5 w-1.5 animate-pulse-slow rounded-full bg-accent" />
              AI Research &amp; Intelligence Visualization Environment
            </div>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
              Intelligence, <span className="text-gradient">Visualized.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-mute md:text-lg">
              Explore the systems behind modern artificial intelligence through an interactive research environment
              built for engineers, researchers, and curious minds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/overview" className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-[#04121a] transition-colors hover:bg-[#33e2ff]">
                Enter Research Environment <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#architecture" className="inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-elevated/70 px-5 text-sm text-ink transition-colors hover:border-[#2c3e54]">
                Explore Architecture <ChevronRight className="h-4 w-4 text-mute" />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs text-mute">
              <span><b className="font-mono text-sm text-ink">10</b> research modules</span>
              <span><b className="font-mono text-sm text-ink">100%</b> client-side computation</span>
              <span><b className="font-mono text-sm text-ink">0</b> API keys required</span>
            </div>
          </motion.div>

          {/* Hero visual — procedural 3D neural structure */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
            className="relative h-[340px] overflow-hidden rounded-2xl border border-line bg-panel/60 md:h-[460px]"
          >
            <div className="absolute inset-0 grid-bg opacity-40" aria-hidden />
            <NeuralHero />
            <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] text-mute/70">
              procedural feedforward structure · 27 nodes · client-rendered
            </div>
          </motion.div>
        </div>
      </section>

      {/* Module showcase */}
      <section className="relative mx-auto max-w-6xl px-4 py-16 md:px-6">
        <motion.div {...fadeUp}>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Research Modules</h2>
          <p className="mt-2 max-w-2xl text-sm text-mute">
            Ten purpose-built environments. Every simulation is deterministic, every calculation runs locally.
          </p>
        </motion.div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RESEARCH_MODULES.filter((m) => m.id !== "overview" && m.id !== "settings").map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div key={m.id} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.04 }}>
                <Link href={m.path} className="group block h-full rounded-xl border border-line bg-panel/80 p-5 transition-colors hover:border-[#2c3e54] hover:bg-elevated">
                  <span className="inline-flex rounded-lg border border-line bg-bg-2 p-2 text-accent"><Icon className="h-4 w-4" /></span>
                  <h3 className="mt-3 text-sm font-medium text-ink">{m.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-mute">{m.description}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Capabilities */}
      <section className="relative border-y border-line/60 bg-bg-2/50 py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <motion.div {...fadeUp}>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">AI Engineering Capabilities</h2>
          </motion.div>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {CAPABILITIES.map((c, i) => (
              <motion.div key={c.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }} className="rounded-xl border border-line bg-panel/80 p-5">
                <h3 className="text-sm font-medium text-accent">{c.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mute">{c.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive demo preview — RAG pipeline */}
      <section className="relative mx-auto max-w-6xl px-4 py-16 md:px-6">
        <motion.div {...fadeUp}>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Interactive Demonstration</h2>
          <p className="mt-2 max-w-2xl text-sm text-mute">
            A glimpse of the RAG Observatory pipeline — one of ten fully interactive environments inside.
          </p>
        </motion.div>
        <motion.div {...fadeUp} className="mt-8 overflow-x-auto rounded-xl border border-line bg-panel/80 p-6">
          <div className="flex min-w-max items-center gap-2">
            {PIPELINE.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="rounded-lg border border-accent/25 bg-accent/[0.06] px-3.5 py-2 text-xs text-ink">
                  <span className="mr-1.5 font-mono text-[10px] text-accent">{String(i + 1).padStart(2, "0")}</span>
                  {s}
                </div>
                {i < PIPELINE.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-mute/50" />}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-mute">
            Inside the full module: editable queries, a local document collection, real chunk similarity scoring, and ranked retrieval — all simulated in-browser.
          </p>
        </motion.div>
      </section>

      {/* Technical architecture */}
      <section id="architecture" className="relative border-t border-line/60 bg-bg-2/50 py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <motion.div {...fadeUp}>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Technical Architecture</h2>
            <p className="mt-2 max-w-2xl text-sm text-mute">
              A fully self-contained frontend. Simulation logic is separated from UI, with deterministic engines powering every visualization.
            </p>
          </motion.div>
          <div className="mt-8 grid gap-3 md:grid-cols-5">
            {[
              { t: "Presentation", d: "Next.js App Router · React 19 · Tailwind 4 · Framer Motion" },
              { t: "Visualization", d: "Three.js · React Three Fiber · Drei · Recharts · SVG canvases" },
              { t: "Simulation Engines", d: "Deterministic TS modules — NN math, tokenizer, similarity, metrics" },
              { t: "Sample Data", d: "Local datasets: documents, model profiles, embeddings, graphs" },
              { t: "State & Storage", d: "React state · localStorage for harmless UI preferences" },
            ].map((s, i) => (
              <motion.div key={s.t} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }} className="rounded-xl border border-line bg-panel/80 p-4">
                <div className="font-mono text-[10px] text-accent">L{i + 1}</div>
                <h3 className="mt-1 text-sm font-medium text-ink">{s.t}</h3>
                <p className="mt-1 text-xs leading-relaxed text-mute">{s.d}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {TECH_STACK.map((t) => (
              <span key={t} className="rounded-md border border-line bg-panel px-2.5 py-1 font-mono text-[11px] text-mute">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-line py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center md:flex-row md:justify-between md:text-left md:px-6">
          <div className="flex items-center gap-2">
            <Hexagon className="h-4 w-4 text-accent" />
            <span className="text-xs font-semibold tracking-[0.2em]">NEURAXIS</span>
            <span className="text-xs text-mute">· Explore the Architecture of Intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-mute">
            <span>Educational simulations only — no real model inference.</span>
            <a href="https://github.com/HammadZahid1/neuraxis" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-ink">
              <Github className="h-3.5 w-3.5" /> Source
            </a>
            <span className="font-mono">MIT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
