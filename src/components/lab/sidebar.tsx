"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronsLeft, Hexagon, X } from "lucide-react";
import { RESEARCH_MODULES, type ResearchModule } from "@/lib/modules";
import { cn } from "@/lib/utils";

const GROUP_LABELS: Record<ResearchModule["group"], string> = {
  core: "Workspace",
  research: "Research Modules",
  analysis: "Analysis",
  system: "System",
};

export function Sidebar({ open, collapsed, onToggleCollapse, onClose }: {
  open: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const groups = (["core", "research", "analysis", "system"] as const).map((g) => ({
    key: g,
    label: GROUP_LABELS[g],
    items: RESEARCH_MODULES.filter((m) => m.group === g),
  }));

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden" onClick={onClose} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-line bg-bg-2 transition-transform duration-200 md:sticky md:top-0 md:h-dvh md:translate-x-0",
          collapsed ? "md:w-16" : "md:w-60",
          open ? "w-64 translate-x-0" : "-translate-x-full w-64"
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-line px-3">
          <Hexagon className="h-5 w-5 shrink-0 text-accent" strokeWidth={2.2} />
          {!collapsed && (
            <Link href="/" className="min-w-0 flex-1">
              <span className="block text-sm font-semibold tracking-[0.18em] text-ink">NEURAXIS</span>
              <span className="block text-[10px] text-mute">Research Environment</span>
            </Link>
          )}
          <button onClick={onClose} className="focus-ring rounded-md p-1 text-mute hover:text-ink md:hidden" aria-label="Close navigation">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {groups.map((g) => (
            <div key={g.key} className="mb-3">
              {!collapsed && <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-mute/70">{g.label}</div>}
              <ul className="space-y-0.5">
                {g.items.map((m) => {
                  const active = pathname.startsWith(m.path);
                  const Icon = m.icon;
                  return (
                    <li key={m.id}>
                      <Link
                        href={m.path}
                        onClick={onClose}
                        title={collapsed ? m.name : undefined}
                        className={cn(
                          "focus-ring group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
                          active ? "text-ink" : "text-mute hover:bg-white/[0.04] hover:text-ink"
                        )}
                      >
                        {active && (
                          <motion.span layoutId="nav-active" className="absolute inset-0 rounded-lg border border-accent/25 bg-accent/[0.08]" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                        )}
                        <Icon className={cn("relative h-4 w-4 shrink-0", active ? "text-accent" : "text-mute group-hover:text-ink")} />
                        {!collapsed && <span className="relative truncate">{m.name}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-2">
          <button onClick={onToggleCollapse} className="focus-ring hidden w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-mute hover:bg-white/[0.04] hover:text-ink md:flex">
            <ChevronsLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && <span>Collapse</span>}
          </button>
          {!collapsed && (
            <div className="px-2.5 pb-1 pt-1 text-[10px] text-mute/60">Local workspace · no auth required</div>
          )}
        </div>
      </aside>
    </>
  );
}
