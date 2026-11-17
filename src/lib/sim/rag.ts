/**
 * Educational RAG retrieval simulation.
 * Embeddings are real bag-of-words vectors over a local vocabulary;
 * cosine similarity and keyword scoring are genuine local math. No external APIs.
 */

import { chunkDocuments, type Chunk } from "@/lib/data/documents";
import { cosineSimilarity } from "@/lib/sim/embeddings";

const STOP = new Set(["the", "a", "an", "is", "are", "and", "of", "to", "in", "that", "it", "with", "for", "as", "on", "this", "be", "by", "or"]);

export function tokenizeText(s: string) {
  return (s.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((w) => !STOP.has(w));
}

function vectorize(text: string, vocab: Map<string, number>, idf: Map<string, number>) {
  const vec = new Array<number>(vocab.size).fill(0);
  const words = tokenizeText(text);
  for (const w of words) {
    const i = vocab.get(w);
    if (i !== undefined) vec[i] += idf.get(w) ?? 1;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return { vec, norm };
}

export interface RetrievalResult {
  chunk: Chunk;
  score: number;
  matchedTerms: string[];
}

export interface RagOutput {
  results: RetrievalResult[];
  context: string;
  vocabularySize: number;
  queryTerms: string[];
}

export function buildIndex(chunks: Chunk[]) {
  const df = new Map<string, number>();
  for (const c of chunks) {
    const seen = new Set(tokenizeText(c.text));
    seen.forEach((w) => df.set(w, (df.get(w) ?? 0) + 1));
  }
  const vocab = new Map<string, number>();
  const idf = new Map<string, number>();
  let i = 0;
  df.forEach((count, w) => {
    vocab.set(w, i++);
    idf.set(w, Math.log((chunks.length + 1) / (count + 1)) + 1);
  });
  const vectors = chunks.map((c) => {
    const { vec, norm } = vectorize(c.text, vocab, idf);
    return { chunk: c, vec, norm };
  });
  return { vocab, idf, vectors, size: i };
}

export type RetrievalMode = "semantic" | "keyword" | "hybrid";

export function retrieve(query: string, index: ReturnType<typeof buildIndex>, opts: { topK: number; threshold: number; mode: RetrievalMode }): RagOutput {
  const { vec, norm } = vectorize(query, index.vocab, index.idf);
  const qTerms = new Set(tokenizeText(query));

  const scored = index.vectors.map(({ chunk, vec: dv, norm: dn }) => {
    const cos = cosineSimilarity(vec, dv, norm, dn);
    const matchedTerms = tokenizeText(chunk.text).filter((w) => qTerms.has(w));
    const overlap = qTerms.size ? matchedTerms.length / qTerms.size : 0;
    const score = opts.mode === "semantic" ? cos : opts.mode === "keyword" ? overlap : 0.6 * cos + 0.4 * overlap;
    return { chunk, score, matchedTerms: [...new Set(matchedTerms)] };
  });

  const results = scored
    .filter((r) => r.score >= opts.threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.topK);

  const context = results.map((r) => `[${r.chunk.docTitle}] ${r.chunk.text}`).join("\n\n");
  return { results, context, vocabularySize: index.size, queryTerms: [...qTerms] };
}
