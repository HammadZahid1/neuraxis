"use client";

import { useState } from "react";
import type { Token } from "@/lib/sim/transformer";

export function AttentionHeatmap({ tokens, matrix, precision }: { tokens: Token[]; matrix: number[][]; precision: number }) {
  const [qSel, setQSel] = useState<number | null>(null);
  const [kSel, setKSel] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-[10px] text-mute">
        <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-3 rounded-sm bg-[#0a2430]" /> low</span>
        <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-[#0a2430] via-[#0e6a8a] to-accent" />
        <span className="flex items-center gap-1.5">high <i className="inline-block h-3 w-3 rounded-sm bg-accent" /></span>
      </div>
      <div className="overflow-x-auto">
        <div className="inline-grid gap-px" style={{ gridTemplateColumns: `64px repeat(${tokens.length}, 22px)` }}>
          {/* header row */}
          <div />
          {tokens.map((t, i) => (
            <button
              key={`h-${i}`}
              onMouseEnter={() => setKSel(i)}
              onMouseLeave={() => setKSel(null)}
              title={`key: ${t.text}`}
              className={`h-16 w-[22px] rounded-t-sm pb-1 font-mono text-[9px] ${kSel === i ? "text-ink" : "text-mute"}`}
              style={{ writingMode: "vertical-rl" }}
            >
              {t.text.slice(0, 8)}
            </button>
          ))}
          {/* rows */}
          {tokens.map((t, qi) => (
            <div key={`r-${qi}`} className="contents">
              <button
                onMouseEnter={() => setQSel(qi)}
                onMouseLeave={() => setQSel(null)}
                title={`query: ${t.text}`}
                className={`h-[22px] truncate pr-1.5 text-right font-mono text-[9px] ${qSel === qi ? "text-ink" : "text-mute"}`}
              >
                {t.text.slice(0, 9)}
              </button>
              {matrix[qi].map((w, ki) => {
                const dim = qSel !== null && qSel !== qi, kdim = kSel !== null && kSel !== ki;
                const alpha = Math.min(1, w * 2.4);
                return (
                  <div
                    key={`c-${qi}-${ki}`}
                    onMouseEnter={() => { setQSel(qi); setKSel(ki); }}
                    onMouseLeave={() => { setQSel(null); setKSel(null); }}
                    className="flex h-[22px] w-[22px] items-center justify-center rounded-[3px] font-mono text-[7px]"
                    style={{
                      background: `rgba(0, 217, 255, ${alpha * (dim || kdim ? 0.25 : 1)})`,
                      color: alpha > 0.45 ? "#04121a" : "#8793a5",
                      opacity: dim || kdim ? 0.45 : 1,
                    }}
                    title={`q:${t.text} → k:${tokens[ki].text} = ${(w * 100).toFixed(1)}%`}
                  >
                    {w >= 0.005 ? (w * 100).toFixed(precision) : ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {qSel !== null && kSel !== null && (
        <p className="text-xs text-mute">
          <span className="text-ink">“{tokens[qSel].text}”</span> attends to <span className="text-ink">“{tokens[kSel].text}”</span> with weight{" "}
          <span className="font-mono text-accent">{(matrix[qSel][kSel] * 100).toFixed(1)}%</span>. Rows are softmax-normalized queries; upper triangle is masked (causal).
        </p>
      )}
    </div>
  );
}
