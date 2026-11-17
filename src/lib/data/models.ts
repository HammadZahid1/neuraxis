export interface ModelProfile {
  id: string;
  name: string;
  category: string;
  params: string;
  contextWindow: string;
  latencyMs: number;
  throughput: number;
  evalScore: number;
  memoryGB: number;
  /** Illustrative capability axes, 0–100. */
  capabilities: { axis: string; value: number }[];
}

export const MODELS: ModelProfile[] = [
  {
    id: "neural-core-x",
    name: "Neural Core X",
    category: "General Frontier",
    params: "175B",
    contextWindow: "128K tokens",
    latencyMs: 320,
    throughput: 48,
    evalScore: 92.4,
    memoryGB: 350,
    capabilities: [
      { axis: "Reasoning", value: 94 },
      { axis: "Coding", value: 88 },
      { axis: "Math", value: 90 },
      { axis: "Speed", value: 62 },
      { axis: "Efficiency", value: 55 },
      { axis: "Knowledge", value: 95 },
    ],
  },
  {
    id: "vectormind-7b",
    name: "VectorMind 7B",
    category: "Efficient Small",
    params: "7B",
    contextWindow: "32K tokens",
    latencyMs: 45,
    throughput: 210,
    evalScore: 74.8,
    memoryGB: 14,
    capabilities: [
      { axis: "Reasoning", value: 68 },
      { axis: "Coding", value: 66 },
      { axis: "Math", value: 61 },
      { axis: "Speed", value: 96 },
      { axis: "Efficiency", value: 95 },
      { axis: "Knowledge", value: 63 },
    ],
  },
  {
    id: "cortex-transformer",
    name: "Cortex Transformer",
    category: "Long-Context",
    params: "34B",
    contextWindow: "1M tokens",
    latencyMs: 180,
    throughput: 92,
    evalScore: 84.1,
    memoryGB: 68,
    capabilities: [
      { axis: "Reasoning", value: 82 },
      { axis: "Coding", value: 78 },
      { axis: "Math", value: 75 },
      { axis: "Speed", value: 78 },
      { axis: "Efficiency", value: 71 },
      { axis: "Knowledge", value: 88 },
    ],
  },
  {
    id: "atlas-reasoner",
    name: "Atlas Reasoner",
    category: "Reasoning Specialist",
    params: "70B",
    contextWindow: "64K tokens",
    latencyMs: 410,
    throughput: 31,
    evalScore: 89.7,
    memoryGB: 140,
    capabilities: [
      { axis: "Reasoning", value: 97 },
      { axis: "Coding", value: 84 },
      { axis: "Math", value: 96 },
      { axis: "Speed", value: 48 },
      { axis: "Efficiency", value: 52 },
      { axis: "Knowledge", value: 86 },
    ],
  },
  {
    id: "nova-lm",
    name: "Nova Language Model",
    category: "Balanced Mid-Size",
    params: "13B",
    contextWindow: "64K tokens",
    latencyMs: 85,
    throughput: 140,
    evalScore: 79.3,
    memoryGB: 26,
    capabilities: [
      { axis: "Reasoning", value: 76 },
      { axis: "Coding", value: 79 },
      { axis: "Math", value: 70 },
      { axis: "Speed", value: 88 },
      { axis: "Efficiency", value: 84 },
      { axis: "Knowledge", value: 74 },
    ],
  },
];
