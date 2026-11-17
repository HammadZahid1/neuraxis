/** Deterministic simulated training curves. Educational visualization only. */

export interface TrainConfig {
  lr: number;
  epochs: number;
  batchSize: number;
  optimizer: "Adam" | "SGD" | "AdamW";
}

export interface EpochPoint {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  trainAcc: number;
  valAcc: number;
  lr: number;
}

export const LR_PRESETS = [
  { value: "0.0001", label: "1e-4 · conservative" },
  { value: "0.0005", label: "5e-4 · standard" },
  { value: "0.001", label: "1e-3 · default" },
  { value: "0.005", label: "5e-3 · aggressive" },
];

export function simulateTraining(cfg: TrainConfig, seedOffset = 0): EpochPoint[] {
  let seed = Math.round(cfg.lr * 1e6) * 31 + cfg.epochs * 7 + cfg.batchSize * 3 + cfg.optimizer.length + seedOffset;
  const rand = mulberry(seed);
  const points: EpochPoint[] = [];

  const lrFactor = Math.log10(cfg.lr * 10000) + 4; // 0 at 1e-4 → 1 at 1e-3
  const tooHot = cfg.lr >= 0.005;
  const batchNoise = 1 / Math.sqrt(cfg.batchSize);
  const overfitStart = Math.round(cfg.epochs * (0.55 + rand() * 0.25));

  for (let e = 1; e <= cfg.epochs; e++) {
    const decay = Math.exp(-e / Math.max(3, cfg.epochs * 0.35));
    const noise = () => (rand() - 0.5) * batchNoise;

    let trainLoss = 0.05 + 1.45 * decay + noise() * 0.05 * (1 + lrFactor);
    if (tooHot) trainLoss += 0.35 * Math.max(0, 1 - e / (cfg.epochs * 0.5)); // divergence bump

    const overfit = e > overfitStart ? (e - overfitStart) * (0.012 + rand() * 0.006) * (tooHot ? 2 : 1) : 0;
    const valLoss = trainLoss + 0.06 + overfit + noise() * 0.03;

    const accCap = tooHot ? 0.82 : 0.94 + lrFactor * 0.02;
    const trainAcc = Math.min(accCap, accCap * (1 - 0.85 * decay) + noise() * 0.02);
    const valAcc = Math.min(trainAcc - 0.01, trainAcc - 0.02 - overfit * 1.6 + noise() * 0.015);

    const lrSchedule = cfg.lr * (cfg.optimizer === "SGD" ? 1 : Math.max(0.1, Math.exp(-e / (cfg.epochs * 0.6))));

    points.push({
      epoch: e,
      trainLoss: Math.max(0.02, trainLoss),
      valLoss: Math.max(0.03, valLoss),
      trainAcc: clamp01(trainAcc),
      valAcc: clamp01(valAcc),
      lr: lrSchedule,
    });
  }
  return points;
}

const clamp01 = (v: number) => Math.min(0.9999, Math.max(0, v));

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function summarize(points: EpochPoint[], upTo: number) {
  const visible = points.slice(0, Math.max(1, upTo));
  const last = visible[visible.length - 1];
  const best = visible.reduce((b, p) => (p.valLoss < b.valLoss ? p : b), visible[0]);
  const overfitting = last.valLoss > best.valLoss * 1.08;
  return { last, best, overfitting, epochsDone: visible.length };
}
