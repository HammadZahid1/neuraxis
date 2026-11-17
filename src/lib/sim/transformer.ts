/**
 * Local educational transformer simulation engine.
 * Deterministic tokenizer, positional encodings, and illustrative attention maps.
 * Not a production transformer model.
 */

export interface Token {
  text: string;
  id: number;
  pos: number;
  embedding: number[];
}

const D_MODEL = 16;

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function tokenize(text: string): Token[] {
  const raw = text.toLowerCase().match(/[a-z0-9]+(?:'[a-z]+)?|[^\sa-z0-9]/g) ?? [];
  return raw.slice(0, 24).map((text, pos) => {
    const h = hashString(text);
    const rand = mulberry32(h);
    return {
      text,
      id: h % 50257,
      pos,
      embedding: Array.from({ length: D_MODEL }, () => rand() * 2 - 1),
    };
  });
}

/** True sinusoidal positional encoding (real math). */
export function positionalEncoding(pos: number, i: number) {
  const k = Math.floor(i / 2);
  return i % 2 === 0 ? Math.sin(pos / 10000 ** ((2 * k) / D_MODEL)) : Math.cos(pos / 10000 ** ((2 * k) / D_MODEL));
}

const softmax = (xs: number[]) => {
  const m = Math.max(...xs, 0);
  const ex = xs.map((x) => Math.exp(x - m));
  const s = ex.reduce((a, b) => a + b, 0) || 1;
  return ex.map((x) => x / s);
};

export const HEAD_NAMES = ["Head 1 · syntax-like", "Head 2 · local context", "Head 3 · semantic", "Head 4 · positional"];

/** Deterministic illustrative attention matrix for a head. Rows = query token, cols = key token. */
export function attentionMatrix(tokens: Token[], head: number, causal = true): number[][] {
  const n = tokens.length;
  const scores: number[][] = [];
  for (let qi = 0; qi < n; qi++) {
    const row: number[] = [];
    for (let ki = 0; ki < n; ki++) {
      if (causal && ki > qi) {
        row.push(-Infinity);
        continue;
      }
      // per-head projection of embeddings via alternating dims (deterministic)
      let dot = 0;
      const shift = (head * 3) % D_MODEL;
      for (let d = 0; d < D_MODEL; d++) {
        const qd = tokens[qi].embedding[(d + shift) % D_MODEL];
        const kd = tokens[ki].embedding[(d + shift * 2) % D_MODEL];
        dot += qd * kd;
      }
      // local-context bias: nearby tokens attend more (mimics real head behaviour variety)
      const distance = Math.abs(qi - ki);
      const bias = head === 1 ? -0.55 * distance : head === 3 ? -0.12 * distance : head === 0 ? 0.4 * (tokens[qi].text[0] === tokens[ki].text[0] ? 1 : 0) : 0;
      row.push(dot / Math.sqrt(D_MODEL) + bias);
    }
    scores.push(row);
  }
  return scores.map((row) => {
    const finite = row.map((x) => (x === -Infinity ? -1e9 : x));
    const probs = softmax(finite);
    return probs.map((p, ki) => (causal && ki > scores.indexOf(row) ? 0 : p));
  });
}
