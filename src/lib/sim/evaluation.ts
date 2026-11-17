/** Real metric computation from confusion matrices. */

export interface EvalDataset {
  id: string;
  label: string;
  task: string;
  classes: string[];
  /** rows = true class, cols = predicted class */
  matrix: number[][];
  samples: number;
}

export const EVAL_DATASETS: EvalDataset[] = [
  {
    id: "doc-topics",
    label: "Document Topic Classifier",
    task: "4-class topic classification",
    classes: ["Technology", "Science", "Business", "Health"],
    matrix: [
      [118, 7, 4, 1],
      [5, 126, 2, 3],
      [6, 3, 104, 5],
      [2, 4, 6, 121],
    ],
    samples: 417,
  },
  {
    id: "spam-filter",
    label: "Spam Detection Filter",
    task: "Binary spam classification",
    classes: ["Not Spam", "Spam"],
    matrix: [
      [412, 18],
      [31, 89],
    ],
    samples: 550,
  },
  {
    id: "intent-router",
    label: "Support Intent Router",
    task: "3-class intent classification",
    classes: ["Billing", "Technical", "Account"],
    matrix: [
      [87, 12, 6],
      [9, 143, 11],
      [7, 14, 92],
    ],
    samples: 381,
  },
];

export interface ClassMetrics { class: string; precision: number; recall: number; f1: number; support: number }

export interface MetricsResult {
  accuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  weightedF1: number;
  perClass: ClassMetrics[];
  totalSamples: number;
  correct: number;
}

export function computeMetrics(ds: EvalDataset): MetricsResult {
  const n = ds.classes.length;
  const perClass: ClassMetrics[] = ds.classes.map((cls, i) => {
    const tp = ds.matrix[i][i];
    const predicted = ds.matrix.reduce((s, row) => s + row[i], 0);
    const actual = ds.matrix[i].reduce((s, v) => s + v, 0);
    const precision = predicted ? tp / predicted : 0;
    const recall = actual ? tp / actual : 0;
    const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
    return { class: cls, precision, recall, f1, support: actual };
  });

  const total = ds.matrix.reduce((s, row) => s + row.reduce((a, b) => a + b, 0), 0);
  const correct = ds.matrix.reduce((s, row, i) => s + row[i], 0);
  const supportSum = perClass.reduce((s, c) => s + c.support, 0) || 1;

  return {
    accuracy: total ? correct / total : 0,
    macroPrecision: perClass.reduce((s, c) => s + c.precision, 0) / n,
    macroRecall: perClass.reduce((s, c) => s + c.recall, 0) / n,
    macroF1: perClass.reduce((s, c) => s + c.f1, 0) / n,
    weightedF1: perClass.reduce((s, c) => s + c.f1 * c.support, 0) / supportSum,
    perClass,
    totalSamples: total,
    correct,
  };
}
