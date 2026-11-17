"use client";

import { useMemo, useState } from "react";
import { PageHeader, Panel, PanelHeader, Button, Select, SimulatedBanner, Slider, Stat } from "@/components/ui";
import { NeuralCanvas } from "@/components/lab/neural-canvas";
import { useInterval } from "@/hooks";
import { useToast } from "@/components/toast";
import {
  ARCHITECTURE_PRESETS, architectureType, connectionCount,
  createNetwork, forwardPass, parameterCount, type NNNode,
} from "@/lib/sim/neural-network";

export default function NeuralStudioPage() {
  const toast = useToast();
  const [preset, setPreset] = useState("basic");
  const [customMode, setCustomMode] = useState(false);
  const [layerCount, setLayerCount] = useState(4);
  const [neuronsPerLayer, setNeuronsPerLayer] = useState(6);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<NNNode | null>(null);
  const [netKey, setNetKey] = useState(0);

  const config = useMemo(() => {
    if (!customMode) return ARCHITECTURE_PRESETS[preset]?.layers ?? [3, 4, 2];
    return Array.from({ length: layerCount }, (_, i) =>
      i === 0 ? Math.max(2, neuronsPerLayer - 1) : i === layerCount - 1 ? 2 : neuronsPerLayer
    );
  }, [preset, customMode, layerCount, neuronsPerLayer]);

  const baseNet = useMemo(() => createNetwork(config, 7), [config, netKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const net = useMemo(() => forwardPass(baseNet, tick), [baseNet, tick]);

  useInterval(() => setTick((t) => t + 1), running ? 650 : null);

  const changePreset = (id: string) => {
    setPreset(id);
    setCustomMode(false);
    setRunning(false);
    setTick(0);
    setSelected(null);
    setNetKey((k) => k + 1);
    toast(`Architecture set to “${ARCHITECTURE_PRESETS[id]?.label}”`, "info");
  };

  const applyCustom = () => {
    setCustomMode(true);
    setRunning(false);
    setTick(0);
    setSelected(null);
    setNetKey((k) => k + 1);
    toast(`Custom architecture applied — ${config.length} layers, ${config.reduce((a, b) => a + b, 0)} neurons`, "good");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Neural Studio"
        description="Interactive feedforward network laboratory. Configure an architecture, propagate signals, and inspect individual neurons."
        actions={
          <>
            <Button variant={running ? "outline" : "primary"} onClick={() => setRunning((r) => !r)}>
              {running ? "Pause" : "Start Animation"}
            </Button>
            <Button onClick={() => setTick((t) => t + 1)}>Step</Button>
            <Button variant="ghost" onClick={() => { setRunning(false); setTick(0); setSelected(null); toast("Network reset", "info"); }}>
              Reset
            </Button>
          </>
        }
      />
      <SimulatedBanner>Deterministic forward passes on fixed weights — an architecture visualization, not a trained model.</SimulatedBanner>

      <div className="grid gap-4 xl:grid-cols-[1fr_290px]">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Total Layers" value={config.length} />
            <Stat label="Total Neurons" value={config.reduce((a, b) => a + b, 0)} />
            <Stat label="Connections" value={connectionCount(config).toLocaleString()} />
            <Stat label="Parameters" value={parameterCount(config).toLocaleString()} hint={architectureType(config)} />
          </div>

          <NeuralCanvas net={net} running={running} selected={selected} onSelect={setSelected} />
        </div>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Architecture" sub="Select a preset or build custom" />
            <div className="space-y-4 p-4">
              <Select
                label="Architecture preset"
                value={customMode ? "custom" : preset}
                options={[
                  ...Object.entries(ARCHITECTURE_PRESETS).map(([id, p]) => ({ value: id, label: p.label })),
                  { value: "custom", label: "Custom Architecture" },
                ]}
                onChange={(v) => (v === "custom" ? setCustomMode(true) : changePreset(v))}
              />
              <div className={customMode ? "space-y-4" : "space-y-4 opacity-40 pointer-events-none select-none"}>
                <Slider label="Layer count (incl. in/out)" value={layerCount} min={2} max={9} onChange={(v) => setLayerCount(v)} />
                <Slider label="Neurons per hidden layer" value={neuronsPerLayer} min={2} max={18} onChange={(v) => setNeuronsPerLayer(v)} />
                <Button variant="primary" size="sm" className="w-full" onClick={applyCustom}>Apply Custom Architecture</Button>
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Neuron Inspector" sub={selected ? "Selected node" : "Click a node on the canvas"} />
            {selected ? (
              <div className="space-y-2.5 p-4 text-xs">
                {(() => {
                  const inConn = net.connections.filter((c) => c.to === selected.id);
                  const outConn = net.connections.filter((c) => c.from === selected.id);
                  const live = net.nodes.find((n) => n.id === selected.id)!;
                  const rows: Array<[string, string]> = [
                    ["Node ID", selected.id],
                    ["Layer", selected.layer === 0 ? "Input layer" : selected.layer === net.config.length - 1 ? "Output layer" : `Hidden layer ${selected.layer}`],
                    ["Position in layer", `#${selected.index + 1}`],
                    ["Activation", live.activation.toFixed(4)],
                    ["Bias", selected.bias.toFixed(4)],
                    ["Incoming connections", String(inConn.length)],
                    ["Outgoing connections", String(outConn.length)],
                    ["Avg |weight|", inConn.length ? (inConn.reduce((s, c) => s + Math.abs(c.weight), 0) / inConn.length).toFixed(3) : "—"],
                  ];
                  return rows.map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between border-b border-line/60 pb-1.5 last:border-0">
                      <span className="text-mute">{k}</span>
                      <span className="font-mono text-ink">{v}</span>
                    </div>
                  ));
                })()}
                <p className="pt-1 leading-relaxed text-mute">
                  Activations are sigmoid units computed deterministically from fixed seeded weights. Brightness encodes activation strength.
                </p>
              </div>
            ) : (
              <div className="p-4 text-xs text-mute">
                Select any neuron to inspect its layer, activation, bias, and connection weights.
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
