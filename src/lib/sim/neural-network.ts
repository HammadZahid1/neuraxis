/**
 * Deterministic feedforward neural-network simulation engine.
 * Educational demonstration only — not a trained model.
 */

export interface NNNode {
  id: string;
  layer: number;
  index: number;
  activation: number;
  bias: number;
}

export interface NNConnection {
  from: string;
  to: string;
  weight: number;
}

export interface NeuralNetwork {
  config: number[];
  nodes: NNNode[];
  connections: NNConnection[];
}

export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

export function createNetwork(layerSizes: number[], seed = 7): NeuralNetwork {
  const rand = mulberry32(seed);
  const nodes: NNNode[] = [];
  const connections: NNConnection[] = [];

  layerSizes.forEach((size, layer) => {
    for (let i = 0; i < size; i++) {
      nodes.push({ id: `n-${layer}-${i}`, layer, index: i, activation: 0, bias: (rand() - 0.5) * 0.8 });
    }
  });

  for (let layer = 0; layer < layerSizes.length - 1; layer++) {
    const from = nodes.filter((n) => n.layer === layer);
    const to = nodes.filter((n) => n.layer === layer + 1);
    for (const a of from) for (const b of to) {
      connections.push({ from: a.id, to: b.id, weight: (rand() - 0.5) * 2 });
    }
  }
  return { config: layerSizes, nodes, connections };
}

/** One deterministic forward pass. `inputSeed` varies the input pattern over time. */
export function forwardPass(net: NeuralNetwork, inputSeed: number): NeuralNetwork {
  const rand = mulberry32(inputSeed);
  const nodes = net.nodes.map((n) => ({ ...n }));
  const byLayer = new Map<number, NNNode[]>();
  nodes.forEach((n) => {
    const arr = byLayer.get(n.layer) ?? [];
    arr.push(n);
    byLayer.set(n.layer, arr);
  });

  for (const n of byLayer.get(0) ?? []) n.activation = rand();

  for (let layer = 1; layer < net.config.length; layer++) {
    for (const node of byLayer.get(layer) ?? []) {
      let sum = node.bias;
      for (const c of net.connections) {
        if (c.to === node.id) {
          const src = nodes.find((n) => n.id === c.from);
          if (src) sum += src.activation * c.weight;
        }
      }
      node.activation = sigmoid(sum);
    }
  }
  return { ...net, nodes };
}

export function waveProgress(net: NeuralNetwork, tick: number): number {
  // Signal sweeps input -> output and restarts. Returns active layer index or -1 during "refractory".
  const cycle = net.config.length + 1;
  const t = tick % cycle;
  return t < net.config.length ? t : -1;
}

export function connectionCount(config: number[]) {
  let total = 0;
  for (let i = 0; i < config.length - 1; i++) total += config[i] * config[i + 1];
  return total;
}

export function parameterCount(config: number[]) {
  let total = 0;
  for (let i = 0; i < config.length - 1; i++) total += config[i] * config[i + 1] + config[i + 1];
  return total;
}

export function architectureType(config: number[]) {
  if (config.length <= 2) return "Perceptron";
  if (config.length === 3) return "Shallow Feedforward";
  if (config.length >= 7) return "Very Deep Feedforward";
  if (Math.max(...config.slice(1, -1)) >= 16) return "Wide Feedforward";
  return "Deep Feedforward";
}

export const ARCHITECTURE_PRESETS: Record<string, { label: string; layers: number[] }> = {
  basic: { label: "Basic Feedforward Network", layers: [3, 4, 2] },
  deep: { label: "Deep Neural Network", layers: [4, 6, 6, 5, 4, 3, 2] },
  wide: { label: "Wide Neural Network", layers: [6, 16, 16, 3] },
};
