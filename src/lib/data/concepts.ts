import { mulberry32 } from "@/lib/sim/neural-network";

export interface Concept {
  word: string;
  category: Category;
  /** Display position in 3D space (clustered). */
  p: [number, number, number];
  /** Deterministic 16-d semantic vector used for similarity math. */
  embedding: number[];
  norm: number;
}

export type Category = "Technology" | "Science" | "Mathematics" | "Nature" | "Robotics" | "Artificial Intelligence" | "Programming";

export const CATEGORY_COLORS: Record<Category, string> = {
  Technology: "#00d9ff",
  Science: "#38d996",
  Mathematics: "#a78bfa",
  Nature: "#7ec96f",
  Robotics: "#f2b84b",
  "Artificial Intelligence": "#7667ff",
  Programming: "#ff647c",
};

const CLUSTER_CENTERS: Record<Category, [number, number, number]> = {
  Technology: [5, 2.5, 2],
  Science: [-5, 3, 1.5],
  Mathematics: [1.5, -5, 4],
  Nature: [-3.5, -2, -5],
  Robotics: [4.5, -3, -4],
  "Artificial Intelligence": [0, 5, -2],
  Programming: [-5, -4.5, 3.5],
};

const WORDS: Record<Category, string[]> = {
  Technology: ["Semiconductor", "Fiber Optics", "Microprocessor", "Cloud Computing", "Edge Device", "Quantum Chip", "Sensor Array", "Photonics", "Nanotech", "Circuit Board"],
  Science: ["Photosynthesis", "Genome", "Entropy", "Molecule", "Black Hole", "Neuron Biology", "Enzyme", "Fusion", "Cosmology", "Protein Fold"],
  Mathematics: ["Eigenvalue", "Gradient Descent", "Topology", "Matrix Rank", "Convolution", "Probability", "Manifold", "Integral", "Chaos Theory", "Tensor"],
  Nature: ["Ecosystem", "Migration", "Rainfall", "Coral Reef", "Atmosphere", "Watershed", "Forest Canopy", "Glacier", "Pollination", "Tidal Wave"],
  Robotics: ["Actuator", "Kinematics", "Servo Motor", "Path Planning", "Gripper", "LiDAR", "Odometry", "Manipulator", "SLAM", "End Effector"],
  "Artificial Intelligence": ["Transformer", "Backpropagation", "Attention Head", "Tokenization", "Fine-Tuning", "Inference", "Latent Space", "Embedding", "Multimodal", "Prompt"],
  Programming: ["Recursion", "Compiler", "Async Await", "Type System", "Garbage Collector", "Closure", "API Design", "Refactoring", "Mutex", "Bytecode"],
};

const DIM = 16;
const rand = mulberry32(4242);
const jitter = () => (rand() - 0.5) * 2.4;

export const CONCEPTS: Concept[] = (Object.keys(WORDS) as Category[]).flatMap((category) =>
  WORDS[category].map((word) => {
    const c = CLUSTER_CENTERS[category];
    const p: [number, number, number] = [c[0] + jitter(), c[1] + jitter(), c[2] + jitter()];
    const w = mulberry32([...word].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7));
    const embedding = Array.from({ length: DIM }, () => w() * 2 - 1);
    const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0)) || 1;
    return { word, category, p, embedding, norm };
  })
);
