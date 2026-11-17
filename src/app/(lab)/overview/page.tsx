"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader, Panel, PanelHeader, Stat } from "@/components/ui";
import { RESEARCH_MODULES } from "@/lib/modules";

const STATS = [
  { label: "Research Modules", value: 10, hint: "Fully interactive environments" },
  { label: "Simulation Engines", value: 9, hint: "Deterministic, browser-side" },
  { label: "Local Computations", value: "40+", hint: "Real math, zero APIs" },
  { label: "External Services", value: 0, hint: "No keys, no backend" },
];

export default function OverviewPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Research Workspace"
        description="Your local NEURAXIS environment. Every module runs deterministic simulations and real local mathematics in the browser — no backend, no API keys, no inference services."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>

      <Panel>
        <PanelHeader title="Research Modules" sub="Select an environment to begin" />
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {RESEARCH_MODULES.filter((m) => m.id !== "overview" && m.id !== "settings").map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.id}
                href={m.path}
                className="group focus-ring flex items-start gap-3 rounded-xl border border-line bg-elevated/50 p-4 transition-colors hover:border-[#2c3e54] hover:bg-elevated"
              >
                <span className="rounded-lg border border-line bg-panel p-2 text-accent">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">{m.name}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-mute">{m.description}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-mute transition-colors group-hover:text-accent" />
              </Link>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
