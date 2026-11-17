/** Real vector mathematics on local embeddings. */

export function cosineSimilarity(a: number[], b: number[], normA?: number, normB?: number) {
  const na = normA ?? Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const nb = normB ?? Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  let dot = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) dot += a[i] * b[i];
  return dot / (na * nb || 1);
}

export function euclideanDistance(a: number[], b: number[]) {
  let sum = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

export function dotProduct(a: number[], b: number[]) {
  let dot = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) dot += a[i] * b[i];
  return dot;
}

export function vectorNorm(a: number[]) {
  return Math.sqrt(a.reduce((s, v) => s + v * v, 0));
}
