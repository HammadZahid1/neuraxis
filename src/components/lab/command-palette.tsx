"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { RESEARCH_MODULES } from "@/lib/modules";
import { cn } from "@/lib/utils";

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return RESEARCH_MODULES;
    return RESEARCH_MODULES.filter(
      (m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.id.includes(q)
    );
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
    }
  }, [open]);

  const go = (path: string) => {
    onClose();
    router.push(path);
  };

  useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && results[index]) go(results[index].path);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-lg overflow-hidden rounded-xl border border-line bg-panel shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 border-b border-line px-4">
              <Search className="h-4 w-4 text-mute" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIndex(0);
                }}
                placeholder="Jump to a research module…"
                className="h-12 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-mute/60"
              />
              <kbd className="rounded border border-line bg-panel px-1.5 font-mono text-[10px] text-mute">ESC</kbd>
            </div>
            <ul className="max-h-80 overflow-y-auto p-1.5">
              {results.length === 0 && <li className="px-3 py-6 text-center text-xs text-mute">No modules match “{query}”.</li>}
              {results.map((m, i) => {
                const Icon = m.icon;
                return (
                  <li key={m.id}>
                    <button
                      onMouseEnter={() => setIndex(i)}
                      onClick={() => go(m.path)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                        i === index ? "bg-accent/10 text-ink" : "text-mute hover:bg-white/[0.04]"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", i === index ? "text-accent" : "text-mute")} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{m.name}</span>
                        <span className="block truncate text-[11px] text-mute/80">{m.description}</span>
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
