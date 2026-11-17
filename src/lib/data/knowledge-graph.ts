export interface GraphNode { id: string; label: string; category: "core" | "method" | "application"; x: number; y: number; description: string }
export interface GraphEdge { from: string; to: string; label: string }

export const GRAPH_NODES: GraphNode[] = [
  { id: "ai", label: "Artificial Intelligence", category: "core", x: 400, y: 250, description: "The broad field of building systems that perform tasks requiring intelligence." },
  { id: "ml", label: "Machine Learning", category: "core", x: 260, y: 160, description: "Learning patterns from data instead of explicit programming." },
  { id: "dl", label: "Deep Learning", category: "core", x: 250, y: 330, description: "Multi-layer neural networks that learn hierarchical representations." },
  { id: "nn", label: "Neural Networks", category: "method", x: 380, y: 390, description: "Layers of weighted connections with nonlinear activations." },
  { id: "transformer", label: "Transformers", category: "method", x: 130, y: 250, description: "Attention-based architecture powering modern language models." },
  { id: "nlp", label: "NLP", category: "application", x: 60, y: 150, description: "Understanding and generating human language." },
  { id: "cv", label: "Computer Vision", category: "application", x: 130, y: 430, description: "Interpreting images and video with learned models." },
  { id: "robotics", label: "Robotics", category: "application", x: 480, y: 460, description: "Perception and control for embodied agents." },
  { id: "rl", label: "Reinforcement Learning", category: "method", x: 540, y: 340, description: "Learning policies from reward signals through interaction." },
  { id: "embeddings", label: "Vector Embeddings", category: "method", x: 300, y: 80, description: "Dense vectors encoding semantic meaning." },
  { id: "rag", label: "RAG", category: "application", x: 150, y: 60, description: "Grounding generation with retrieved context." },
  { id: "attention", label: "Attention", category: "method", x: 200, y: 200, description: "Dynamic weighting of information across a sequence." },
];

export const GRAPH_EDGES: GraphEdge[] = [
  { from: "ai", to: "ml", label: "subsumes" },
  { from: "ml", to: "dl", label: "subsumes" },
  { from: "dl", to: "nn", label: "built on" },
  { from: "dl", to: "transformer", label: "key architecture" },
  { from: "transformer", to: "attention", label: "core mechanism" },
  { from: "ml", to: "rl", label: "learning paradigm" },
  { from: "nn", to: "embeddings", label: "produces" },
  { from: "transformer", to: "nlp", label: "enables" },
  { from: "nn", to: "cv", label: "applied in" },
  { from: "embeddings", to: "rag", label: "powers retrieval" },
  { from: "rag", to: "nlp", label: "augments" },
  { from: "rl", to: "robotics", label: "drives control" },
  { from: "nn", to: "robotics", label: "perception stack" },
  { from: "attention", to: "embeddings", label: "contextualizes" },
];

export function neighborsOf(id: string) {
  return GRAPH_EDGES.filter((e) => e.from === id || e.to === id);
}
