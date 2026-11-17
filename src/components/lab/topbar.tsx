"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Command, Menu, Search, Hexagon } from "lucide-react";
import { MODULE_ICON_FALLBACK, moduleForPath } from "@/lib/modules";
import { Badge } from "@/components/ui";
import { NotificationsMenu } from "@/components/lab/notifications";

export function TopBar({ onOpenSidebar, onOpenPalette }: { onOpenSidebar: () => void; onOpenPalette: () => void }) {
  const pathname = usePathname();
  const mod = moduleForPath(pathname);
  const Icon = mod?.icon ?? MODULE_ICON_FALLBACK;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur-md">
      <button onClick={onOpenSidebar} className="focus-ring rounded-md p-1.5 text-mute hover:text-ink md:hidden" aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-accent" />
        <span className="truncate text-sm font-medium text-ink">{mod?.name ?? "Research Environment"}</span>
        <ChevronRight className="hidden h-3.5 w-3.5 text-mute/50 sm:block" />
        <span className="hidden truncate text-xs text-mute sm:block">{mod?.description ?? "Local research workspace"}</span>
      </div>

      <div className="flex-1" />

      <button
        onClick={onOpenPalette}
        className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-elevated text-mute transition-colors hover:border-[#2c3e54] hover:text-ink sm:w-64 sm:justify-start sm:gap-2 sm:px-3"
        aria-label="Open command palette"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden text-xs text-mute sm:block">Search modules…</span>
        <kbd className="ml-auto hidden items-center gap-0.5 rounded border border-line bg-panel px-1.5 font-mono text-[10px] text-mute sm:flex">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      <NotificationsMenu />

      <Badge tone="violet" className="hidden lg:inline-flex">
        <Hexagon className="h-3 w-3" /> Local Workspace
      </Badge>
    </header>
  );
}
