"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/lab/sidebar";
import { TopBar } from "@/components/lab/topbar";
import { CommandPalette } from "@/components/lab/command-palette";
import { ToastProvider } from "@/components/toast";
import { useKeyboardShortcut, useLocalStorage } from "@/hooks";

export default function LabLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useLocalStorage("nx-sidebar-collapsed", false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const togglePalette = useCallback(() => setPaletteOpen((o) => !o), []);
  useKeyboardShortcut("k", togglePalette);

  return (
    <ToastProvider>
      <div className="flex min-h-dvh">
        <Sidebar
          open={sidebarOpen}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onOpenSidebar={() => setSidebarOpen(true)} onOpenPalette={togglePalette} />
          <main key={pathname} className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </ToastProvider>
  );
}
