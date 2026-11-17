export interface Doc { id: string; title: string; text: string }

export const DOCUMENTS: Doc[] = [
  { id: "d1", title: "Neural Network Fundamentals", text: "A neural network is composed of layers of interconnected neurons. Each connection carries a weight that is adjusted during training. Activation functions introduce nonlinearity, enabling networks to approximate complex functions. Deep networks stack many hidden layers to build hierarchical representations." },
  { id: "d2", title: "Transformer Architecture", text: "The transformer replaced recurrence with self-attention. Multi-head attention lets every token attend to all others in parallel. Positional encodings restore order information. Stacked blocks of attention and feed-forward layers produce contextual token representations used for language modeling." },
  { id: "d3", title: "Vector Embeddings and Retrieval", text: "Embeddings map text into high-dimensional vectors where semantic similarity corresponds to geometric proximity. Retrieval systems index documents as vectors and search them by cosine similarity. Approximate nearest neighbor methods trade accuracy for speed at scale." },
  { id: "d4", title: "Retrieval-Augmented Generation", text: "Retrieval-augmented generation grounds a language model in external knowledge. A query is embedded, similar chunks are retrieved from a vector store, and the context is assembled into the prompt. This reduces hallucination and lets the model cite sources it actually used." },
  { id: "d5", title: "Model Evaluation Metrics", text: "Classification quality is measured with accuracy, precision, recall, and F1 score. Precision counts how many predicted positives were correct. Recall counts how many true positives were found. The confusion matrix summarizes all four outcomes of binary classification." },
  { id: "d6", title: "Training Dynamics", text: "Training minimizes a loss function with gradient descent. The learning rate controls step size and stability. Validation loss tracks generalization while training loss tracks fit. Early stopping halts training when validation loss stops improving to prevent overfitting." },
  { id: "d7", title: "Multi-Agent Systems", text: "Multi-agent systems coordinate specialized roles such as research, planning, and verification. A shared message bus or memory lets agents exchange intermediate results. Task graphs describe dependencies between subtasks executed by different agents." },
  { id: "d8", title: "Knowledge Graphs", text: "A knowledge graph stores entities as nodes and relationships as edges. Graph traversal answers multi-hop questions that flat retrieval struggles with. Combining graph structure with embeddings supports hybrid semantic and structural search." },
];

export interface Chunk { id: string; docId: string; docTitle: string; index: number; text: string }

export function chunkDocuments(sentencesPerChunk = 2): Chunk[] {
  const chunks: Chunk[] = [];
  for (const doc of DOCUMENTS) {
    const sentences = doc.text.match(/[^.!?]+[.!?]/g) ?? [doc.text];
    for (let i = 0; i < sentences.length; i += sentencesPerChunk) {
      chunks.push({
        id: `${doc.id}-c${i / sentencesPerChunk}`,
        docId: doc.id,
        docTitle: doc.title,
        index: i / sentencesPerChunk,
        text: sentences.slice(i, i + sentencesPerChunk).join(" ").trim(),
      });
    }
  }
  return chunks;
}
