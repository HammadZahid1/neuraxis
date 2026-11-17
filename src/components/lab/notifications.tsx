"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck, Info } from "lucide-react";
import { useLocalStorage } from "@/hooks";
import { cn } from "@/lib/utils";

interface Notification { id: number; title: string; body: string; time: string; read: boolean }

const SEED_NOTIFICATIONS: Notification[] = [
  { id: 1, title: "Workspace initialized", body: "Local research workspace is ready. All modules available.", time: "now", read: false },
  { id: 2, title: "Simulation engines online", body: "9 deterministic engines loaded — no external services required.", time: "now", read: false },
  { id: 3, title: "Tip: Command palette", body: "Press Ctrl+K (or ⌘K) to jump between research modules.", time: "tip", read: false },
];

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useLocalStorage<Notification[]>("nx-notifications", SEED_NOTIFICATIONS);

  const unread = items.filter((n) => !n.read).length;

  const markAll = () => setItems(items.map((n) => ({ ...n, read: true })));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="focus-ring relative flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-elevated text-mute hover:text-ink"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent" />}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-line bg-panel shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5">
                <span className="text-xs font-medium text-ink">Notifications</span>
                <button onClick={markAll} className="focus-ring inline-flex items-center gap-1 text-[11px] text-mute hover:text-ink">
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {items.map((n) => (
                  <li key={n.id} className={cn("border-b border-line/60 px-3.5 py-2.5 last:border-0", !n.read && "bg-accent/[0.04]")}>
                    <div className="flex items-center gap-2">
                      <Info className={cn("h-3.5 w-3.5 shrink-0", n.read ? "text-mute/50" : "text-accent")} />
                      <span className="text-xs font-medium text-ink">{n.title}</span>
                      <span className="ml-auto font-mono text-[10px] text-mute/60">{n.time}</span>
                    </div>
                    <p className="mt-1 pl-5.5 text-[11px] leading-relaxed text-mute">{n.body}</p>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
