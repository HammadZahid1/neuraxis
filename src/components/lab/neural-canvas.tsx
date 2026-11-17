"use client";

import { useMemo, useRef, useState } from "react";
import type { NeuralNetwork, NNNode } from "@/lib/sim/neural-network";

const W = 760, H = 420;
const PAD_X = 70, PAD_Y = 46;

export interface Viewport { zoom: number; panX: number; panY: number }

export function NeuralCanvas({ net, running, onSelect, selected, activeLayer }: {
  net: NeuralNetwork;
  running: boolean;
  selected: NNNode | null;
  activeLayer: number;
  onSelect: (n: NNNode) => void;
}) {
  const [vp, setVp] = useState<Viewport>({ zoom: 1, panX: 0, panY: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);

  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    const layers = net.config.length;
    net.nodes.forEach((n) => {
      const xs = PAD_X + (n.layer / (layers - 1)) * (W - 2 * PAD_X);
      const ys = H / 2 + (n.index - (net.config[n.layer] - 1) / 2) * ((H - 2 * PAD_Y) / Math.max(net.config[n.layer], 1));
      map.set(n.id, { x: xs, y: ys });
    });
    return map;
  }, [net]);

  const posOf = (id: string) => positions.get(id) ?? { x: 0, y: 0 };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setVp((v) => ({ ...v, zoom: Math.min(2.2, Math.max(0.55, v.zoom * (e.deltaY < 0 ? 1.08 : 0.925))) }));
  };

  return (
    <div
      className="relative h-[420px] cursor-grab touch-none overflow-hidden rounded-xl border border-line bg-bg-2 active:cursor-grabbing"
      onWheel={onWheel}
      onPointerDown={(e) => { drag.current = { x: e.clientX - vp.panX, y: e.clientY - vp.panY }; (e.target as Element).setPointerCapture?.(e.pointerId); }}
      onPointerMove={(e) => { if (drag.current) setVp((v) => ({ ...v, panX: e.clientX - drag.current!.x, panY: e.clientY - drag.current!.y })); }}
      onPointerUp={() => { drag.current = null; }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full select-none" style={{ transform: `translate(${vp.panX}px, ${vp.panY}px) scale(${vp.zoom})` }}>
        {/* connections */}
        <g>
          {net.connections.map((c, i) => {
            const a = posOf(c.from), b = posOf(c.to);
            const w = Math.min(Math.abs(c.weight), 2);
            const positive = c.weight >= 0;
            return (
              <line
                key={i}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={positive ? "#0e5f79" : "#4a3d8f"}
                strokeWidth={0.3 + w * 0.45}
                className={running ? "animate-signal" : undefined}
                strokeDasharray={running ? "4 20" : undefined}
                opacity={running ? 0.95 : 0.5}
              />
            );
          })}
        </g>
        {/* nodes */}
        <g>
          {net.nodes.map((n) => {
            const p = posOf(n.id);
            const act = n.activation;
            const r = 9 + act * 4;
            const isSel = selected?.id === n.id;
            return (
              <g key={n.id} onClick={() => onSelect(n)} className="cursor-pointer">
                {act > 0.02 && (
                  <circle cx={p.x} cy={p.y} r={r + 7} fill="#00d9ff" opacity={act * 0.16} />
                )}
                {activeLayer === n.layer && running && (
                  <circle cx={p.x} cy={p.y} r={r + 4} fill="none" stroke="#a78bfa" strokeWidth={1.6} opacity={0.85} />
                )}
                <circle
                  cx={p.x} cy={p.y} r={r}
                  fill={n.layer === 0 ? "#0d2733" : n.layer === net.config.length - 1 ? "#1b1b3d" : "#121823"}
                  stroke={isSel ? "#f3f6fc" : act > 0.66 ? "#00d9ff" : act > 0.33 ? "#7667ff" : "#31435a"}
                  strokeWidth={isSel ? 2.2 : 1.4}
                />
                <circle cx={p.x} cy={p.y} r={Math.max(1.5, r - 5.5)} fill="#00d9ff" opacity={0.25 + act * 0.75} />
              </g>
            );
          })}
        </g>
        {/* layer labels */}
        <g>
          {net.config.map((size, li) => {
            const x = PAD_X + (li / (net.config.length - 1)) * (W - 2 * PAD_X);
            return (
              <text key={li} x={x} y={H - 10} textAnchor="middle" fontSize={11} fill="#8793a5" fontFamily="monospace">
                {li === 0 ? `Input · ${size}` : li === net.config.length - 1 ? `Output · ${size}` : `Hidden ${li} · ${size}`}
              </text>
            );
          })}
        </g>
      </svg>

      {/* zoom controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        {[["+", 1.15], ["−", 0.87]].map(([label, factor]) => (
          <button
            key={label as string}
            onClick={() => setVp((v) => ({ ...v, zoom: Math.min(2.2, Math.max(0.55, v.zoom * (factor as number))) }))}
            className="focus-ring h-7 w-7 rounded-md border border-line bg-panel font-mono text-xs text-mute hover:text-ink"
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setVp({ zoom: 1, panX: 0, panY: 0 })}
          className="focus-ring h-7 w-7 rounded-md border border-line bg-panel font-mono text-[10px] text-mute hover:text-ink"
          title="Reset view"
        >
          ⌂
        </button>
      </div>
      <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-line bg-panel/90 px-2 py-1 font-mono text-[10px] text-mute">
        zoom {Math.round(vp.zoom * 100)}% · drag to pan
      </div>
    </div>
  );
}
