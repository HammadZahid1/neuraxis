export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function formatNum(n: number, digits = 1) {
  return n.toLocaleString("en-US", { maximumFractionDigits: digits });
}
