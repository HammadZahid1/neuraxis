"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/* ---------- Button ---------- */
type ButtonVariant = "primary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md";

export function Button({
  variant = "outline",
  size = "md",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  const base =
    "focus-ring inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap";
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-9 px-4 text-sm" } as const;
  const variants = {
    primary: "bg-accent text-[#04121a] hover:bg-[#33e2ff]",
    ghost: "text-mute hover:text-ink hover:bg-white/5",
    outline: "border border-line bg-elevated/60 text-ink hover:border-[#2c3e54] hover:bg-elevated",
    danger: "border border-bad/40 bg-bad/10 text-bad hover:bg-bad/20",
  } as const;
  return (
    <button className={cn(base, sizes[size], variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}

/* ---------- Panel ---------- */
export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-xl border border-line bg-panel", className)}>{children}</section>;
}

export function PanelHeader({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
      <div className="min-w-0">
        <h2 className="truncate text-sm font-medium text-ink">{title}</h2>
        {sub && <p className="truncate text-xs text-mute">{sub}</p>}
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </header>
  );
}

/* ---------- Badge ---------- */
type BadgeTone = "accent" | "violet" | "good" | "warn" | "bad" | "neutral";

export function Badge({ tone = "neutral", children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  const tones = {
    accent: "border-accent/30 bg-accent/10 text-accent",
    violet: "border-violet/30 bg-violet/10 text-lavender",
    good: "border-good/30 bg-good/10 text-good",
    warn: "border-warn/30 bg-warn/10 text-warn",
    bad: "border-bad/30 bg-bad/10 text-bad",
    neutral: "border-line bg-elevated text-mute",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium leading-4", tones[tone], className)}>
      {children}
    </span>
  );
}

/* ---------- Stat ---------- */
export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel px-4 py-3">
      <div className="text-[11px] font-medium uppercase tracking-wider text-mute">{label}</div>
      <div className="mt-1 font-mono text-xl text-ink">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-mute">{hint}</div>}
    </div>
  );
}

/* ---------- Slider ---------- */
export function Slider({
  label, value, min, max, step = 1, onChange, disabled,
}: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between text-xs">
        <span className="text-mute">{label}</span>
        <span className="font-mono text-ink">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 h-1 w-full cursor-pointer appearance-none rounded-full bg-line accent-accent disabled:opacity-40 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
      />
    </label>
  );
}

/* ---------- Select ---------- */
export function Select({
  label, value, options, onChange, className,
}: { label?: string; value: string; options: Array<{ value: string; label: string }>; onChange: (v: string) => void; className?: string }) {
  return (
    <label className={cn("block", className)}>
      {label && <span className="mb-1.5 block text-xs text-mute">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring h-9 w-full rounded-lg border border-line bg-elevated px-2.5 text-sm text-ink"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ---------- Toggle ---------- */
export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="focus-ring flex w-full items-center justify-between rounded-lg text-xs text-mute hover:text-ink">
      <span>{label}</span>
      <span className={cn("relative h-4.5 w-8 rounded-full border transition-colors", checked ? "border-accent/50 bg-accent/25" : "border-line bg-elevated")}>
        <span className={cn("absolute top-0.5 h-3 w-3 rounded-full transition-all", checked ? "left-4 bg-accent" : "left-0.5 bg-mute")} />
      </span>
    </button>
  );
}

/* ---------- Tabs ---------- */
export function Tabs({ tabs, active, onChange }: { tabs: Array<{ id: string; label: string }>; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 rounded-lg border border-line bg-bg-2 p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "focus-ring rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            active === t.id ? "bg-elevated text-ink" : "text-mute hover:text-ink"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Tooltip ---------- */
export function Tooltip({ children, tip }: { children: ReactNode; tip: string }) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span className="pointer-events-none absolute -top-1 left-1/2 z-50 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-line bg-elevated px-2 py-1 text-[11px] text-ink opacity-0 shadow-lg transition-opacity group-hover/tip:opacity-100">
        {tip}
      </span>
    </span>
  );
}

/* ---------- PageHeader ---------- */
export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-mute">{description}</p>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------- SimulatedBanner ---------- */
export function SimulatedBanner({ children }: { children?: ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-warn/25 bg-warn/5 px-3 py-2 text-xs text-warn">
      <span className="rounded border border-warn/40 px-1.5 py-px font-mono text-[10px] uppercase">simulated</span>
      <span className="text-[#d9b06a]">{children ?? "Educational simulation — deterministic local computation, no real model inference."}</span>
    </div>
  );
}

/* ---------- EmptyState ---------- */
export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line py-10 text-center">
      <span className="text-sm text-ink">{title}</span>
      {hint && <span className="text-xs text-mute">{hint}</span>}
    </div>
  );
}
